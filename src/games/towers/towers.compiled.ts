// Compiled by `npm run describe` from src/games/towers/towers.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, popcount, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  sees: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "facing" | "bounds" | "latin.hiddenSingle" | "latin.single" | "arrangement" | "latin.set" | "latin.fish" | "latin.wing";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  facing: FacingSays;
  bounds: BoundsSays;
  arrangement: ArrangementSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["facing","bounds","arrangement"] as const;

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
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
  { id: "facing", tier: 0 },
  { id: "bounds", tier: 0 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "arrangement", tier: 1 },
  { id: "latin.set", tier: 1 },
  { id: "latin.fish", tier: 2 },
  { id: "latin.wing", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.lines) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > 1) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k7 = 0; _k7 < cl.sees.at.length; _k7++) {
    const _at8 = cl.sees.at[_k7];
    const _v9 = cl.sees.v[_k7];
    let _g10 = 0;
    G11: {
      const _a12 = sp.sight[_at8];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_c = _a12[_i13];
        const _h20 = (g[v_c] || -1);
        let _q14 = true;
        Q15: {
          const _a16 = sp.sight[_at8];
          const _n17 = _i13;
          for (let _i18 = 0; _i18 < _n17; _i18++) {
            const v_c2 = _a16[_i18];
            const _h19 = (g[v_c2] || -1);
            if (!((_h19 < _h20))) {
              _q14 = false;
              break Q15;
            }
          }
        }
        if (!(_q14)) continue;
        _g10++;
      }
    }
    if (!((_g10 === _v9))) return false;
  }
  return true;
}

export interface FacingBinding {
  P: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface FacingSays {
  terms: { P: readonly number[]; };
  marks: {  };
}

const facingFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function facing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FacingBinding, FacingSays> | null): number {
  const _g8: number[] = [];
  const facts = facingFacts;
  let fired = 0;
  let changed = false;
  const _h16 = (sp.w + 1);
  _g8.length = 0;
  G9: {
    const _a12 = sp.slots;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_s = _a12[_i13];
      const _h14 = clueAt(cl.sees, v_s);
      const _h15 = clueAt(cl.sees, sp.opposite[v_s]);
      if (!(((_i13 < sp.opposite[v_s]) && ((_h14 + _h15) === _h16)))) continue;
      _g8.push(v_s);
    }
  }
  L17: {
    const v_P = _g8;
    const _h18 = v_P.length;
    if (!((_h18 > 0))) break L17;
    if (DEV && staleChecking) {
      const _g19: number[] = [];
      G20: {
        const _a23 = sp.slots;
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_s = _a23[_i24];
          if (!(((_i24 < sp.opposite[v_s]) && ((clueAt(cl.sees, v_s) + clueAt(cl.sees, sp.opposite[v_s])) === (sp.w + 1))))) continue;
          _g19.push(v_s);
        }
      }
      freshBinding("facing", [sameSet(v_P, _g19), (v_P.length > 0)], ["P =", "where of P"]);
    }
    facts.length = 0;
    changed = false;
    let _q25 = true;
    Q26: {
      const _a27 = v_P;
      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
        const v_s = _a27[_i28];
        const _h29 = clueAt(cl.sees, v_s);
        const v_c = (sp.sight[v_s][(_h29 - 1)] ?? -1);
        let _c31: boolean = (((b.cands[v_c] >> sp.w) & 1) !== 0);
        if (_c31) {
          const _t30 = sp.w;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t30); changed = true; } else facts.push(PLACE, v_c, _t30); }
          _c31 = true;
        }
        if (!(_c31)) {
          _q25 = false;
          break Q26;
        }
      }
    }
    if (!(_q25)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { P: v_P.slice() }, marks: {  } };
        if (!fire({ P: v_P.slice() }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface BoundsBinding {
  k: number;
  s: number;
  v: number;
  L: readonly number[];
  c0: number;
  P: number;
  R: number;
  near: boolean;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BoundsSays {
  terms: { s: number; v: number; near: boolean; };
  marks: {  };
}

const boundsFacts: number[] = [];
let boundsCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function bounds(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BoundsBinding, BoundsSays> | null): number {
  const facts = boundsFacts;
  let fired = 0;
  let changed = false;
  const _h230 = (sp.w + 1);
  if (boundsCands.length < sp.cells.length) boundsCands = new Int32Array(sp.cells.length);
  const cands = boundsCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.sees.at.length; v_k++) {
    const v_s = cl.sees.at[v_k];
    const v_v = cl.sees.v[v_k];
    const v_L = sp.sight[v_s];
    const v_c0 = (v_L.length > 0 ? v_L[0] : -1);
    let _g59 = 0;
    G60: {
      const _a63 = v_L;
      for (let _i64 = 0; _i64 < _a63.length; _i64++) {
        const v_c = _a63[_i64];
        const _h65 = (b.grid[v_c] !== 0);
        if (!(_h65)) continue;
        const _h66 = (b.grid[v_c] || -1);
        _g59 |= 1 << _h66;
      }
    }
    const v_P = _g59;
    let _g67 = 0;
    G68: {
      for (let _m70 = b.domain; _m70 !== 0; _m70 &= _m70 - 1) {
        const v_h = 31 - Math.clz32(_m70 & -_m70);
        if (!(((rangeMask(v_h, sp.w) & ~v_P) === 0))) continue;
        _g67 |= 1 << v_h;
      }
    }
    const v_R = _g67;
    let _g71 = 0;
    G72: {
      const _a73 = v_L;
      for (let _i74 = 0; _i74 < _a73.length; _i74++) {
        const v_c = _a73[_i74];
        const _h75 = (b.grid[v_c] || -1);
        let _c82: boolean = (((v_R >> _h75) & 1) !== 0);
        if (_c82) {
          let _q76 = true;
          Q77: {
            const _a78 = v_L;
            const _n79 = _i74;
            for (let _i80 = 0; _i80 < _n79; _i80++) {
              const v_c2 = _a78[_i80];
              const _h81 = (b.grid[v_c2] || -1);
              if (!((_h81 < _h75))) {
                _q76 = false;
                break Q77;
              }
            }
          }
          _c82 = _q76;
        }
        if (!(_c82)) continue;
        _g71++;
      }
    }
    let _c87: boolean = (v_v === (_g71 + 1));
    if (_c87) {
      let _g83 = -1;
      G84: {
        const _t85 = sp.w;
        for (let v_i = 0; v_i <= _t85; v_i++) {
          const _h86 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h86) & 1) !== 0)))) continue;
          _g83 = v_i;
          break G84;
        }
      }
      _c87 = (_g83 > 1);
    }
    let _c123: boolean = _c87;
    if (_c123) {
      let _g104 = -1;
      G105: {
        const _t106 = sp.w;
        for (let v_i = 0; v_i <= _t106; v_i++) {
          const _h107 = (b.grid[(v_L[v_i] ?? -1)] || -1);
          if (!(((v_i === sp.w) || (((v_R >> _h107) & 1) !== 0)))) continue;
          _g104 = v_i;
          break G105;
        }
      }
      let _g108 = 0;
      G109: {
        const _a112 = v_L;
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_c = _a112[_i113];
          const _h114 = (b.grid[v_c] !== 0);
          if (!((_h114 && (_i113 >= _g104)))) continue;
          const _h115 = (b.grid[v_c] || -1);
          _g108 |= 1 << _h115;
        }
      }
      const _t116 = (b.domain & ~_g108);
      const _t117 = (_g104 - 1);
      let _g118 = 0;
      G119: {
        for (let _m121 = _t116; _m121 !== 0; _m121 &= _m121 - 1) {
          const v_h = 31 - Math.clz32(_m121 & -_m121);
          const _h122 = popcount((_t116 & ~rangeMask(v_h, sp.w)));
          if (!((_h122 < _t117))) continue;
          _g118 |= 1 << v_h;
        }
      }
      _c123 = ((_g118 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cands[v_c0]))) !== 0);
    }
    const v_near = _c123;
    if (DEV && staleChecking) {
      let _g124 = 0;
      G125: {
        const _a128 = v_L;
        for (let _i129 = 0; _i129 < _a128.length; _i129++) {
          const v_c = _a128[_i129];
          if (!((b.grid[v_c] !== 0))) continue;
          const _t130 = (b.grid[v_c] || -1);
          _g124 |= 1 << _t130;
        }
      }
      let _g131 = 0;
      G132: {
        for (let _m134 = b.domain; _m134 !== 0; _m134 &= _m134 - 1) {
          const v_h = 31 - Math.clz32(_m134 & -_m134);
          if (!(((rangeMask(v_h, sp.w) & ~v_P) === 0))) continue;
          _g131 |= 1 << v_h;
        }
      }
      let _g135 = 0;
      G136: {
        const _a137 = v_L;
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          const v_c = _a137[_i138];
          let _c144: boolean = (((v_R >> (b.grid[v_c] || -1)) & 1) !== 0);
          if (_c144) {
            let _q139 = true;
            Q140: {
              const _a141 = v_L;
              const _n142 = _i138;
              for (let _i143 = 0; _i143 < _n142; _i143++) {
                const v_c2 = _a141[_i143];
                if (!(((b.grid[v_c2] || -1) < (b.grid[v_c] || -1)))) {
                  _q139 = false;
                  break Q140;
                }
              }
            }
            _c144 = _q139;
          }
          if (!(_c144)) continue;
          _g135++;
        }
      }
      let _c148: boolean = (v_v === (_g135 + 1));
      if (_c148) {
        let _g145 = -1;
        G146: {
          const _t147 = sp.w;
          for (let v_i = 0; v_i <= _t147; v_i++) {
            if (!(((v_i === sp.w) || (((v_R >> (b.grid[(v_L[v_i] ?? -1)] || -1)) & 1) !== 0)))) continue;
            _g145 = v_i;
            break G146;
          }
        }
        _c148 = (_g145 > 1);
      }
      let _c181: boolean = _c148;
      if (_c181) {
        let _g165 = -1;
        G166: {
          const _t167 = sp.w;
          for (let v_i = 0; v_i <= _t167; v_i++) {
            if (!(((v_i === sp.w) || (((v_R >> (b.grid[(v_L[v_i] ?? -1)] || -1)) & 1) !== 0)))) continue;
            _g165 = v_i;
            break G166;
          }
        }
        let _g168 = 0;
        G169: {
          const _a172 = v_L;
          for (let _i173 = 0; _i173 < _a172.length; _i173++) {
            const v_c = _a172[_i173];
            if (!(((b.grid[v_c] !== 0) && (_i173 >= _g165)))) continue;
            const _t174 = (b.grid[v_c] || -1);
            _g168 |= 1 << _t174;
          }
        }
        const _t175 = (b.domain & ~_g168);
        const _t176 = (_g165 - 1);
        let _g177 = 0;
        G178: {
          for (let _m180 = _t175; _m180 !== 0; _m180 &= _m180 - 1) {
            const v_h = 31 - Math.clz32(_m180 & -_m180);
            if (!((popcount((_t175 & ~rangeMask(v_h, sp.w))) < _t176))) continue;
            _g177 |= 1 << v_h;
          }
        }
        _c181 = ((_g177 & (cands[v_c0] >= 0 ? cands[v_c0] : (cands[v_c0] = b.cands[v_c0]))) !== 0);
      }
      freshBinding("bounds", [(v_s === cl.sees.at[v_k]), (v_v === cl.sees.v[v_k]), sameSet(v_L, sp.sight[v_s]), (v_c0 === (v_L.length > 0 ? v_L[0] : -1)), (v_P === _g124), (v_R === _g131), (v_near === _c181)], ["s =", "v =", "L =", "c0 =", "P =", "R =", "near ="]);
    }
    facts.length = 0;
    changed = false;
    let _c204: boolean = !(v_near);
    if (!_c204) {
      let _q182 = true;
      Q183: {
        let _g184 = -1;
        G185: {
          const _t186 = sp.w;
          for (let v_i = 0; v_i <= _t186; v_i++) {
            const _h187 = (b.grid[(v_L[v_i] ?? -1)] || -1);
            if (!(((v_i === sp.w) || (((v_R >> _h187) & 1) !== 0)))) continue;
            _g184 = v_i;
            break G185;
          }
        }
        let _g188 = 0;
        G189: {
          const _a192 = v_L;
          for (let _i193 = 0; _i193 < _a192.length; _i193++) {
            const v_c = _a192[_i193];
            const _h194 = (b.grid[v_c] !== 0);
            if (!((_h194 && (_i193 >= _g184)))) continue;
            const _h195 = (b.grid[v_c] || -1);
            _g188 |= 1 << _h195;
          }
        }
        const _t196 = (b.domain & ~_g188);
        const _t197 = (_g184 - 1);
        let _g198 = 0;
        G199: {
          for (let _m201 = _t196; _m201 !== 0; _m201 &= _m201 - 1) {
            const v_h = 31 - Math.clz32(_m201 & -_m201);
            const _h202 = popcount((_t196 & ~rangeMask(v_h, sp.w)));
            if (!((_h202 < _t197))) continue;
            _g198 |= 1 << v_h;
          }
        }
        for (let _m203 = _g198; _m203 !== 0; _m203 &= _m203 - 1) {
          const v_h = 31 - Math.clz32(_m203 & -_m203);
          if ((((b.cands[v_c0] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c0, v_h); changed = true; } else facts.push(STRIKE, v_c0, v_h); }
          if (!(true)) {
            _q182 = false;
            break Q183;
          }
        }
      }
      _c204 = _q182;
    }
    let _c236: boolean = _c204;
    if (_c236) {
      let _c235: boolean = v_near;
      if (!_c235) {
        let _q205 = true;
        Q206: {
          let _g207 = 0;
          G208: {
            const _a217 = v_L;
            for (let _i218 = 0; _i218 < _a217.length; _i218++) {
              const v_c = _a217[_i218];
              const _h219 = (b.grid[v_c] !== 0);
              const _h226 = (b.grid[v_c] || -1);
              const _h227 = (_h226 + 1);
              let _c228: boolean = _h219;
              if (_c228) {
                let _q220 = false;
                Q221: {
                  const _a222 = v_L;
                  const _n223 = _i218;
                  for (let _i224 = 0; _i224 < _n223; _i224++) {
                    const v_c2 = _a222[_i224];
                    const _h225 = (b.grid[v_c2] || -1);
                    if ((_h225 > _h227)) {
                      _q220 = true;
                      break Q221;
                    }
                  }
                }
                _c228 = !(_q220);
              }
              if (!(_c228)) continue;
              _g207 |= 1 << _h226;
            }
          }
          const v_K = ((b.domain & ~v_P) | _g207);
          for (let _m229 = b.domain; _m229 !== 0; _m229 &= _m229 - 1) {
            const v_i = 31 - Math.clz32(_m229 & -_m229);
            L231: {
              const v_h = (_h230 - v_i);
              if (!((((v_K >> v_h) & 1) !== 0))) break L231;
              const _h232 = popcount((v_K & ~rangeMask(1, v_h)));
              const _t233 = ((v_v - _h232) - 2);
              for (let v_j = 0; v_j <= _t233; v_j++) {
                const _t234 = (v_L[v_j] ?? -1);
                if ((((b.cands[_t234] >> v_h) & 1) !== 0)) { if (fire === null) { b.strikeAt(_t234, v_h); changed = true; } else facts.push(STRIKE, _t234, v_h); }
                if (!(true)) {
                  _q205 = false;
                  break Q206;
                }
              }
            }
          }
        }
        _c235 = _q205;
      }
      _c236 = _c235;
    }
    if (!(_c236)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { s: v_s, v: v_v, near: v_near }, marks: {  } };
        if (!fire({ k: v_k, s: v_s, v: v_v, L: v_L.slice(), c0: v_c0, P: v_P, R: v_R, near: v_near }, facts, _says)) return 1;
      }
      cands.fill(-1);
    }
  }
  return fired;
}

export interface ArrangementBinding {
  k: number;
  s: number;
  v: number;
  L: readonly number[];
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ArrangementSays {
  terms: { s: number; v: number; };
  marks: {  };
}

const arrangementFacts: number[] = [];
let arrangementCands = new Int32Array(0);
let arrangement_p8 = new Int32Array(0);
let arrangement_l9: readonly number[] = [];
let arrangement_f14 = new Int32Array(0);
let arrangement_l15: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function arrangement(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ArrangementBinding, ArrangementSays> | null): number {
  if (arrangement_p8.length < sp.cells.length) arrangement_p8 = new Int32Array(sp.cells.length);
  else arrangement_p8.fill(0);
  arrangement_l9 = [];
  let _y10 = false;
  if (arrangement_f14.length < sp.cells.length) arrangement_f14 = new Int32Array(sp.cells.length).fill(-1);
  else arrangement_f14.fill(-1);
  arrangement_l15 = [];
  const _s16: number[] = [];
  const facts = arrangementFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (arrangementCands.length < sp.cells.length) arrangementCands = new Int32Array(sp.cells.length);
  const cands = arrangementCands;
  cands.fill(-1);
  for (let v_k = 0; v_k < cl.sees.at.length; v_k++) {
    const v_s = cl.sees.at[v_k];
    const v_v = cl.sees.v[v_k];
    const v_L = sp.sight[v_s];
    let _g11 = -1;
    const _a3 = v_L;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      if (DEV && staleChecking) {
        freshBinding("arrangement", [(v_s === cl.sees.at[v_k]), (v_v === cl.sees.v[v_k]), sameSet(v_L, sp.sight[v_s]), (v_L.includes(v_c))], ["s =", "v =", "L =", "c in"]);
      }
      facts.length = 0;
      changed = false;
      let _q5 = true;
      Q6: {
        for (let _m7 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m7 !== 0; _m7 &= _m7 - 1) {
          const v_d = 31 - Math.clz32(_m7 & -_m7);
          if (_g11 !== _epoch) {
            _g11 = _epoch;
            for (const _e12 of arrangement_l9) arrangement_p8[_e12] = 0;
            _y10 = false;
            const _a13 = v_L;
            for (const _e17 of arrangement_l15) arrangement_f14[_e17] = -1;
            arrangement_l15 = _a13;
            let _i19 = 0;
            _s16[0] = 0;
            let _o23 = _a13.length === 0;
            for (;;) {
              if (_a13.length === 0) {
                if (!_o23) break;
                _o23 = false;
              }
              while (_a13.length > 0 && _i19 >= 0) {
                const _e17 = _a13[_i19];
                if (_s16[_i19] > 0) arrangement_f14[_e17] = -1;
                let _r22 = (cands[_e17] >= 0 ? cands[_e17] : (cands[_e17] = b.cands[_e17])) & ~((2 << _s16[_i19]) - 1);
                let _d18 = 0;
                for (; _r22 !== 0; _r22 &= _r22 - 1) {
                  _d18 = 31 - Math.clz32(_r22 & -_r22);
                  arrangement_f14[_e17] = _d18;
                  if (true) { let _j20 = 0; while (_j20 < _i19 && !(arrangement_f14[_a13[_j20]] === _d18 && true)) _j20++; if (_j20 < _i19) continue; }
                  break;
                }
                if (_r22 === 0) {
                  _s16[_i19] = 0;
                  _i19--;
                  continue;
                }
                _s16[_i19] = _d18;
                if (_i19 === _a13.length - 1) break;
                _i19++;
                _s16[_i19] = 0;
              }
              if (_i19 < 0) break;
              let _g24 = 0;
              G25: {
                const _a26 = v_L;
                for (let _i27 = 0; _i27 < _a26.length; _i27++) {
                  const v_c = _a26[_i27];
                  let _q28 = true;
                  Q29: {
                    const _a30 = v_L;
                    const _n31 = _i27;
                    for (let _i32 = 0; _i32 < _n31; _i32++) {
                      const v_c2 = _a30[_i32];
                      if (!((arrangement_f14[v_c2] < arrangement_f14[v_c]))) {
                        _q28 = false;
                        break Q29;
                      }
                    }
                  }
                  if (!(_q28)) continue;
                  _g24++;
                }
              }
              if (!((_g24 === v_v))) continue;
              arrangement_l9 = _a13;
              _y10 = true;
              for (const _e12 of _a13) arrangement_p8[_e12] |= 1 << arrangement_f14[_e12];
            }
          }
          if (!(!(((((arrangement_p8[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y10 && !v_L.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q5 = false;
            break Q6;
          }
        }
      }
      if (!(_q5)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { s: v_s, v: v_v }, marks: {  } };
          if (!fire({ k: v_k, s: v_s, v: v_v, L: v_L.slice(), c: v_c }, facts, _says)) return 1;
        }
        cands.fill(-1);
        _epoch++;
      }
    }
  }
  return fired;
}
