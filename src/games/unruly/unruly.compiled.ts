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
export const tiers: readonly string[] = ["Trivial","Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, variations: readonly string[]): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q188 = true;
  Q189: {
    const _a190 = sp.lines;
    for (let _i191 = 0; _i191 < _a190.length; _i191++) {
      const v_L = _a190[_i191];
      const _t192 = (sp.lineCells[v_L].length - 3);
      for (let v_i = 0; v_i <= _t192; v_i++) {
        const _t193 = (v_i + 1);
        let _c196: boolean = ((g[(sp.lineCells[v_L][v_i] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t193] ?? -1)] || -1));
        if (_c196) {
          const _t194 = (v_i + 1);
          const _t195 = (v_i + 2);
          _c196 = ((g[(sp.lineCells[v_L][_t194] ?? -1)] || -1) === (g[(sp.lineCells[v_L][_t195] ?? -1)] || -1));
        }
        if (!(!(_c196))) {
          _q188 = false;
          break Q189;
        }
      }
    }
  }
  if (!(_q188)) return false;
  let _q197 = true;
  Q198: {
    const _a199 = sp.lines;
    for (let _i200 = 0; _i200 < _a199.length; _i200++) {
      const v_L = _a199[_i200];
      for (let _m201 = _domain; _m201 !== 0; _m201 &= _m201 - 1) {
        const v_d = 31 - Math.clz32(_m201 & -_m201);
        let _g202 = 0;
        G203: {
          const _a204 = sp.lineCells[v_L];
          for (let _i205 = 0; _i205 < _a204.length; _i205++) {
            const v_c = _a204[_i205];
            if (!(((g[v_c] || -1) === v_d))) continue;
            _g202++;
          }
        }
        if (!(((2 * _g202) === sp.lineCells[v_L].length))) {
          _q197 = false;
          break Q198;
        }
      }
    }
  }
  if (!(_q197)) return false;
  if (variations.includes("unique")) {
    let _q206 = true;
    Q207: {
      const _a208 = sp.lines;
      for (let _i209 = 0; _i209 < _a208.length; _i209++) {
        const v_A = _a208[_i209];
        const _a210 = sp.lines;
        for (let _i211 = 0; _i211 < _a210.length; _i211++) {
          const v_B = _a210[_i211];
          if (!(((v_B !== v_A) && ((sp.rows.includes(v_A)) === (sp.rows.includes(v_B)))))) continue;
          let _q212 = false;
          Q213: {
            const _t214 = (sp.lineCells[v_A].length - 1);
            for (let v_i = 0; v_i <= _t214; v_i++) {
              if (((g[(sp.lineCells[v_A][v_i] ?? -1)] || -1) !== (g[(sp.lineCells[v_B][v_i] ?? -1)] || -1))) {
                _q212 = true;
                break Q213;
              }
            }
          }
          if (!(_q212)) {
            _q206 = false;
            break Q207;
          }
        }
      }
    }
    if (!(_q206)) return false;
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
      for (let _i19 = 0; _i19 < _a18.length; _i19++) {
        const v_x = _a18[_i19];
        if (!(!(b.known(v_x)))) continue;
        for (let _m20 = b.domain; _m20 !== 0; _m20 &= _m20 - 1) {
          const v_d = 31 - Math.clz32(_m20 & -_m20);
          let _q21 = true;
          Q22: {
            const _a23 = v_W;
            for (let _i24 = 0; _i24 < _a23.length; _i24++) {
              const v_c = _a23[_i24];
              if (!((v_c !== v_x))) continue;
              if (!((b.value(v_c) === v_d))) {
                _q21 = false;
                break Q22;
              }
            }
          }
          if (!(_q21)) continue;
          facts.length = 0;
          changed = false;
          const _t25 = (3 - v_d);
          if (!b.known(v_x)) { if (fire === null) { b.placeAt(v_x, _t25); changed = true; } else facts.push(PLACE, v_x, _t25); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, i: v_i, W: v_W, x: v_x, d: v_d }, facts)) return 1;
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
          if (!((b.value(v_c) === v_d))) continue;
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
            if (!((b.value(v_c) === _h50))) continue;
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
          if (!(!(b.known(v_c)))) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _h50); changed = true; } else facts.push(PLACE, v_c, _h50); }
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
          if (!((b.value(v_c) === v_d))) continue;
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
            if (!((b.value(v_c) === _h81))) continue;
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
          if (!(!(b.known(v_c)))) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _h81); changed = true; } else facts.push(PLACE, v_c, _h81); }
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
    for (let _m114 = b.domain; _m114 !== 0; _m114 &= _m114 - 1) {
      const v_d = 31 - Math.clz32(_m114 & -_m114);
      const _h124 = (3 - v_d);
      const _h125 = _h124;
      let _g115 = 0;
      G116: {
        const _a117 = sp.lineCells[v_L];
        for (let _i118 = 0; _i118 < _a117.length; _i118++) {
          const v_c = _a117[_i118];
          if (!((b.value(v_c) === v_d))) continue;
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
            if (!((b.value(v_c) === _h125))) continue;
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
              if (!((b.value(v_c) !== v_d))) {
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
                if (!(!(b.known(v_c)))) continue;
                _g136++;
              }
            }
            _c140 = (_g136 >= 2);
          }
          if (!(_c140)) break L131;
          facts.length = 0;
          changed = false;
          let _q141 = true;
          Q142: {
            const _a143 = sp.lineCells[v_L];
            for (let _i144 = 0; _i144 < _a143.length; _i144++) {
              const v_c = _a143[_i144];
              if (!((!(b.known(v_c)) && !(v_W.includes(v_c))))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _h125); changed = true; } else facts.push(PLACE, v_c, _h125); }
              if (!(true)) {
                _q141 = false;
                break Q142;
              }
            }
          }
          if (!(_q141)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, n: v_n, d: v_d, i: v_i, W: v_W }, facts)) return 1;
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

export function unique(b: Marks, sp: GridSpace, fire: Fire<UniqueBinding> | null): number {
  const facts = uniqueFacts;
  let fired = 0;
  let changed = false;
  const _a164 = sp.lines;
  for (let _i165 = 0; _i165 < _a164.length; _i165++) {
    const v_A = _a164[_i165];
    const _h173 = (sp.rows.includes(v_A));
    const v_n = Math.trunc(sp.lineCells[v_A].length / 2);
    const _h178 = (v_n - 1);
    for (let _m166 = b.domain; _m166 !== 0; _m166 &= _m166 - 1) {
      const v_d = 31 - Math.clz32(_m166 & -_m166);
      let _g167 = 0;
      G168: {
        const _a169 = sp.lineCells[v_A];
        for (let _i170 = 0; _i170 < _a169.length; _i170++) {
          const v_c = _a169[_i170];
          if (!((b.value(v_c) === v_d))) continue;
          _g167++;
        }
      }
      if (!((_g167 === v_n))) continue;
      const _h185 = (3 - v_d);
      const _h186 = _h185;
      const _a171 = sp.lines;
      for (let _i172 = 0; _i172 < _a171.length; _i172++) {
        const v_B = _a171[_i172];
        let _c179: boolean = ((v_B !== v_A) && (_h173 === (sp.rows.includes(v_B))));
        if (_c179) {
          let _g174 = 0;
          G175: {
            const _a176 = sp.lineCells[v_B];
            for (let _i177 = 0; _i177 < _a176.length; _i177++) {
              const v_c = _a176[_i177];
              if (!((b.value(v_c) === v_d))) continue;
              _g174++;
            }
          }
          _c179 = (_g174 === _h178);
        }
        let _c183: boolean = _c179;
        if (_c183) {
          let _q180 = true;
          Q181: {
            const _t182 = (sp.lineCells[v_A].length - 1);
            for (let v_j = 0; v_j <= _t182; v_j++) {
              if (!((b.value((sp.lineCells[v_B][v_j] ?? -1)) === v_d))) continue;
              if (!((b.value((sp.lineCells[v_A][v_j] ?? -1)) === v_d))) {
                _q180 = false;
                break Q181;
              }
            }
          }
          _c183 = _q180;
        }
        if (!(_c183)) continue;
        const _t184 = (sp.lineCells[v_A].length - 1);
        for (let v_j = 0; v_j <= _t184; v_j++) {
          if (!(((b.value((sp.lineCells[v_A][v_j] ?? -1)) === v_d) && !(b.known((sp.lineCells[v_B][v_j] ?? -1)))))) continue;
          facts.length = 0;
          changed = false;
          const _t187 = (sp.lineCells[v_B][v_j] ?? -1);
          if (!b.known(_t187)) { if (fire === null) { b.placeAt(_t187, _h186); changed = true; } else facts.push(PLACE, _t187, _h186); }
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
