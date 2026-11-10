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
  let _q267 = true;
  Q268: {
    const _a269 = sp.lines;
    for (let _i270 = 0; _i270 < _a269.length; _i270++) {
      const v_L = _a269[_i270];
      const _t271 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t271; v_i++) {
        const _t272 = (v_i + 1);
        let _c275: boolean = ((g[(sp.lineCells[v_L][v_i] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t272] ?? -1)] || -1));
        if (_c275) {
          const _t273 = (v_i + 1);
          const _t274 = (v_i + 2);
          _c275 = ((g[(sp.lineCells[v_L][_t273] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t274] ?? -1)] || -1));
        }
        if (!(!(_c275))) {
          _q267 = false;
          break Q268;
        }
      }
    }
  }
  if (!(_q267)) return false;
  let _q276 = true;
  Q277: {
    const _a278 = sp.lines;
    for (let _i279 = 0; _i279 < _a278.length; _i279++) {
      const v_L = _a278[_i279];
      for (let _m280 = _domain; _m280 !== 0; _m280 &= _m280 - 1) {
        const v_d = 31 - Math.clz32(_m280 & -_m280);
        let _g281 = 0;
        G282: {
          const _a283 = sp.lineCells[v_L];
          for (let _i284 = 0; _i284 < _a283.length; _i284++) {
            const v_c = _a283[_i284];
            const _h285 = (g[v_c] || -1);
            if (!((_h285 === v_d))) continue;
            _g281++;
          }
        }
        if (!(((2 * _g281) === sp.lineCells[v_L].length))) {
          _q276 = false;
          break Q277;
        }
      }
    }
  }
  if (!(_q276)) return false;
  if (variations.includes("unique")) {
    let _q286 = true;
    Q287: {
      const _a288 = sp.lines;
      for (let _i289 = 0; _i289 < _a288.length; _i289++) {
        const v_A = _a288[_i289];
        const _h292 = (sp.rows.includes(v_A));
        const _a290 = sp.lines;
        for (let _i291 = 0; _i291 < _a290.length; _i291++) {
          const v_B = _a290[_i291];
          if (!(((v_B !== v_A) && (_h292 === (sp.rows.includes(v_B)))))) continue;
          let _q293 = false;
          Q294: {
            const _t295 = (sp.lineCells[v_A].length - 1);
            for (let v_i = 0; v_i <= _t295; v_i++) {
              if (((g[(sp.lineCells[v_A][v_i] ?? -1)] || -1) !== (g[(sp.lineCells[v_B][v_i] ?? -1)] || -1))) {
                _q293 = true;
                break Q294;
              }
            }
          }
          if (!(_q293)) {
            _q286 = false;
            break Q287;
          }
        }
      }
    }
    if (!(_q286)) return false;
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
  const _a44 = sp.lines;
  for (let _i45 = 0; _i45 < _a44.length; _i45++) {
    const v_L = _a44[_i45];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h57 = (v_n - 1);
    for (let _m46 = b.domain; _m46 !== 0; _m46 &= _m46 - 1) {
      const v_d = 31 - Math.clz32(_m46 & -_m46);
      const _h55 = (3 - v_d);
      const _h56 = _h55;
      let _g47 = 0;
      G48: {
        const _a49 = sp.lineCells[v_L];
        for (let _i50 = 0; _i50 < _a49.length; _i50++) {
          const v_c = _a49[_i50];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g47++;
        }
      }
      let _c58: boolean = (_g47 === v_n);
      if (_c58) {
        let _g51 = 0;
        G52: {
          const _a53 = sp.lineCells[v_L];
          for (let _i54 = 0; _i54 < _a53.length; _i54++) {
            const v_c = _a53[_i54];
            if (!(((b.grid[v_c] || -1) === _h56))) continue;
            _g51++;
          }
        }
        _c58 = (_g51 === _h57);
      }
      if (!(_c58)) continue;
      if (import.meta.env.DEV && staleChecking) {
        let _g59 = 0;
        G60: {
          const _a61 = sp.lineCells[v_L];
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_c = _a61[_i62];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g59++;
          }
        }
        let _c67: boolean = (_g59 === v_n);
        if (_c67) {
          let _g63 = 0;
          G64: {
            const _a65 = sp.lineCells[v_L];
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_c = _a65[_i66];
              if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
              _g63++;
            }
          }
          _c67 = (_g63 === (v_n - 1));
        }
        freshBinding("lastGap", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c67], ["L in", "n =", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q68 = true;
      Q69: {
        const _a70 = sp.lineCells[v_L];
        for (let _i71 = 0; _i71 < _a70.length; _i71++) {
          const v_c = _a70[_i71];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h56); changed = true; } else facts.push(PLACE, v_c, _h56); }
          if (!(true)) {
            _q68 = false;
            break Q69;
          }
        }
      }
      if (!(_q68)) return -1;
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
  const _a84 = sp.lines;
  for (let _i85 = 0; _i85 < _a84.length; _i85++) {
    const v_L = _a84[_i85];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    for (let _m86 = b.domain; _m86 !== 0; _m86 &= _m86 - 1) {
      const v_d = 31 - Math.clz32(_m86 & -_m86);
      const _h95 = (3 - v_d);
      const _h96 = _h95;
      let _g87 = 0;
      G88: {
        const _a89 = sp.lineCells[v_L];
        for (let _i90 = 0; _i90 < _a89.length; _i90++) {
          const v_c = _a89[_i90];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g87++;
        }
      }
      let _c97: boolean = (_g87 === v_n);
      if (_c97) {
        let _g91 = 0;
        G92: {
          const _a93 = sp.lineCells[v_L];
          for (let _i94 = 0; _i94 < _a93.length; _i94++) {
            const v_c = _a93[_i94];
            if (!(((b.grid[v_c] || -1) === _h96))) continue;
            _g91++;
          }
        }
        _c97 = (_g91 < v_n);
      }
      if (!(_c97)) continue;
      if (import.meta.env.DEV && staleChecking) {
        let _g98 = 0;
        G99: {
          const _a100 = sp.lineCells[v_L];
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_c = _a100[_i101];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g98++;
          }
        }
        let _c106: boolean = (_g98 === v_n);
        if (_c106) {
          let _g102 = 0;
          G103: {
            const _a104 = sp.lineCells[v_L];
            for (let _i105 = 0; _i105 < _a104.length; _i105++) {
              const v_c = _a104[_i105];
              if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
              _g102++;
            }
          }
          _c106 = (_g102 < v_n);
        }
        freshBinding("quota", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c106], ["L in", "n =", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q107 = true;
      Q108: {
        const _a109 = sp.lineCells[v_L];
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_c = _a109[_i110];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h96); changed = true; } else facts.push(PLACE, v_c, _h96); }
          if (!(true)) {
            _q107 = false;
            break Q108;
          }
        }
      }
      if (!(_q107)) return -1;
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
  const _a136 = sp.lines;
  for (let _i137 = 0; _i137 < _a136.length; _i137++) {
    const v_L = _a136[_i137];
    const v_n = Math.trunc(sp.lineCells[v_L].length / 2);
    const _h143 = (v_n - 1);
    const _h150 = (v_n - 2);
    R2:
    for (let _m138 = b.domain; _m138 !== 0; _m138 &= _m138 - 1) {
      const v_d = 31 - Math.clz32(_m138 & -_m138);
      const _m82_0 = b.made[0];
      const _h148 = (3 - v_d);
      const _h149 = _h148;
      let _g139 = 0;
      G140: {
        const _a141 = sp.lineCells[v_L];
        for (let _i142 = 0; _i142 < _a141.length; _i142++) {
          const v_c = _a141[_i142];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g139++;
        }
      }
      let _c151: boolean = (_g139 === _h143);
      if (_c151) {
        let _g144 = 0;
        G145: {
          const _a146 = sp.lineCells[v_L];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_c = _a146[_i147];
            if (!(((b.grid[v_c] || -1) === _h149))) continue;
            _g144++;
          }
        }
        _c151 = (_g144 <= _h150);
      }
      if (!(_c151)) continue;
      const _t152 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t152; v_i++) {
        const _t153 = (v_i + 1);
        const _t154 = (v_i + 2);
        L155: {
          const v_W = setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t153] ?? -1), (sp.lineCells[v_L][_t154] ?? -1));
          let _q156 = true;
          Q157: {
            const _a158 = v_W;
            for (let _i159 = 0; _i159 < _a158.length; _i159++) {
              const v_c = _a158[_i159];
              if (!(((b.grid[v_c] || -1) !== v_d))) {
                _q156 = false;
                break Q157;
              }
            }
          }
          let _c164: boolean = _q156;
          if (_c164) {
            let _g160 = 0;
            G161: {
              const _a162 = v_W;
              for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                const v_c = _a162[_i163];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g160++;
              }
            }
            _c164 = (_g160 >= 2);
          }
          if (!(_c164)) break L155;
          if (b.made[0] !== _m82_0) {
            let _g165 = 0;
            G166: {
              const _a167 = sp.lineCells[v_L];
              for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                const v_c = _a167[_i168];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g165++;
              }
            }
            let _c173: boolean = (_g165 === (v_n - 1));
            if (_c173) {
              let _g169 = 0;
              G170: {
                const _a171 = sp.lineCells[v_L];
                for (let _i172 = 0; _i172 < _a171.length; _i172++) {
                  const v_c = _a171[_i172];
                  if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
                  _g169++;
                }
              }
              _c173 = (_g169 <= (v_n - 2));
            }
            if (!(_c173)) { continue R2; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g174 = 0;
            G175: {
              const _a176 = sp.lineCells[v_L];
              for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                const v_c = _a176[_i177];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g174++;
              }
            }
            let _c182: boolean = (_g174 === (v_n - 1));
            if (_c182) {
              let _g178 = 0;
              G179: {
                const _a180 = sp.lineCells[v_L];
                for (let _i181 = 0; _i181 < _a180.length; _i181++) {
                  const v_c = _a180[_i181];
                  if (!(((b.grid[v_c] || -1) === (3 - v_d)))) continue;
                  _g178++;
                }
              }
              _c182 = (_g178 <= (v_n - 2));
            }
            const _t183 = (v_i + 1);
            const _t184 = (v_i + 2);
            let _q185 = true;
            Q186: {
              const _a187 = v_W;
              for (let _i188 = 0; _i188 < _a187.length; _i188++) {
                const v_c = _a187[_i188];
                if (!(((b.grid[v_c] || -1) !== v_d))) {
                  _q185 = false;
                  break Q186;
                }
              }
            }
            let _c193: boolean = _q185;
            if (_c193) {
              let _g189 = 0;
              G190: {
                const _a191 = v_W;
                for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                  const v_c = _a191[_i192];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g189++;
                }
              }
              _c193 = (_g189 >= 2);
            }
            freshBinding("lastOne", [(sp.lines.includes(v_L)), (v_n === Math.trunc(sp.lineCells[v_L].length / 2)), (((b.domain >> v_d) & 1) !== 0), _c182, ((0 <= v_i) && (v_i <= (sp.lineCells[v_L].length - 3))), sameSet(v_W, setOf((sp.lineCells[v_L][v_i] ?? -1), (sp.lineCells[v_L][_t183] ?? -1), (sp.lineCells[v_L][_t184] ?? -1))), _c193], ["L in", "n =", "d in", "where of d", "i in", "W =", "where of W"]);
          }
          facts.length = 0;
          changed = false;
          let _q194 = true;
          Q195: {
            const _a196 = sp.lineCells[v_L];
            for (let _i197 = 0; _i197 < _a196.length; _i197++) {
              const v_c = _a196[_i197];
              if (!((!((b.grid[v_c] !== 0)) && !(v_W.includes(v_c))))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _h149); changed = true; } else facts.push(PLACE, v_c, _h149); }
              if (!(true)) {
                _q194 = false;
                break Q195;
              }
            }
          }
          if (!(_q194)) return -1;
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
  const _a217 = sp.lines;
  for (let _i218 = 0; _i218 < _a217.length; _i218++) {
    const v_A = _a217[_i218];
    const _h226 = (sp.rows.includes(v_A));
    const v_n = Math.trunc(sp.lineCells[v_A].length / 2);
    const _h231 = (v_n - 1);
    R2:
    for (let _m219 = b.domain; _m219 !== 0; _m219 &= _m219 - 1) {
      const v_d = 31 - Math.clz32(_m219 & -_m219);
      const _m116_0 = b.made[0];
      let _g220 = 0;
      G221: {
        const _a222 = sp.lineCells[v_A];
        for (let _i223 = 0; _i223 < _a222.length; _i223++) {
          const v_c = _a222[_i223];
          if (!(((b.grid[v_c] || -1) === v_d))) continue;
          _g220++;
        }
      }
      if (!((_g220 === v_n))) continue;
      const _h264 = (3 - v_d);
      const _h265 = _h264;
      const _a224 = sp.lines;
      R3:
      for (let _i225 = 0; _i225 < _a224.length; _i225++) {
        const v_B = _a224[_i225];
        let _c232: boolean = ((v_B !== v_A) && (_h226 === (sp.rows.includes(v_B))));
        if (_c232) {
          let _g227 = 0;
          G228: {
            const _a229 = sp.lineCells[v_B];
            for (let _i230 = 0; _i230 < _a229.length; _i230++) {
              const v_c = _a229[_i230];
              if (!(((b.grid[v_c] || -1) === v_d))) continue;
              _g227++;
            }
          }
          _c232 = (_g227 === _h231);
        }
        let _c236: boolean = _c232;
        if (_c236) {
          let _q233 = true;
          Q234: {
            const _t235 = (sp.lineCells[v_A].length - 1);
            for (let v_j = 0; v_j <= _t235; v_j++) {
              if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
              if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                _q233 = false;
                break Q234;
              }
            }
          }
          _c236 = _q233;
        }
        if (!(_c236)) continue;
        const _t237 = (sp.lineCells[v_A].length - 1);
        for (let v_j = 0; v_j <= _t237; v_j++) {
          if (!((((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d) && !((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] !== 0))))) continue;
          if (b.made[0] !== _m116_0) {
            let _g238 = 0;
            G239: {
              const _a240 = sp.lineCells[v_A];
              for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                const v_c = _a240[_i241];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g238++;
              }
            }
            if (!((_g238 === v_n))) { continue R2; }
            let _c246: boolean = ((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B))));
            if (_c246) {
              let _g242 = 0;
              G243: {
                const _a244 = sp.lineCells[v_B];
                for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                  const v_c = _a244[_i245];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g242++;
                }
              }
              _c246 = (_g242 === (v_n - 1));
            }
            let _c250: boolean = _c246;
            if (_c250) {
              let _q247 = true;
              Q248: {
                const _t249 = (sp.lineCells[v_A].length - 1);
                for (let v_j = 0; v_j <= _t249; v_j++) {
                  if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
                  if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                    _q247 = false;
                    break Q248;
                  }
                }
              }
              _c250 = _q247;
            }
            if (!(_c250)) { continue R3; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g251 = 0;
            G252: {
              const _a253 = sp.lineCells[v_A];
              for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                const v_c = _a253[_i254];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g251++;
              }
            }
            let _c259: boolean = ((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B))));
            if (_c259) {
              let _g255 = 0;
              G256: {
                const _a257 = sp.lineCells[v_B];
                for (let _i258 = 0; _i258 < _a257.length; _i258++) {
                  const v_c = _a257[_i258];
                  if (!(((b.grid[v_c] || -1) === v_d))) continue;
                  _g255++;
                }
              }
              _c259 = (_g255 === (v_n - 1));
            }
            let _c263: boolean = _c259;
            if (_c263) {
              let _q260 = true;
              Q261: {
                const _t262 = (sp.lineCells[v_A].length - 1);
                for (let v_j = 0; v_j <= _t262; v_j++) {
                  if (!(((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] || -1) === v_d))) continue;
                  if (!(((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d))) {
                    _q260 = false;
                    break Q261;
                  }
                }
              }
              _c263 = _q260;
            }
            freshBinding("unique", [(sp.lines.includes(v_A)), (v_n === Math.trunc(sp.lineCells[v_A].length / 2)), (((b.domain >> v_d) & 1) !== 0), (_g251 === v_n), (sp.lines.includes(v_B)), _c263, ((0 <= v_j) && (v_j <= (sp.lineCells[v_A].length - 1))), (((b.grid[(sp.lineCells[v_A][v_j] ?? -1)] || -1) === v_d) && !((b.grid[(sp.lineCells[v_B][v_j] ?? -1)] !== 0)))], ["A in", "n =", "d in", "where of d", "B in", "where of B", "j in", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t266 = (sp.lineCells[v_B][v_j] ?? -1);
          if (!(b.grid[_t266] !== 0)) { if (fire === null) { b.placeAt(_t266, _h265); changed = true; } else facts.push(PLACE, _t266, _h265); }
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
