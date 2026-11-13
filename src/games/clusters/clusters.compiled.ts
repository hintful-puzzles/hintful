// Compiled by `npm run describe` from src/games/clusters/clusters.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, freshBinding, keptStore, rangeMask, sameSet, setOf, staleChecking, stamps, type Kept, union, within } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  dot: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "broken" | "refute" | "countFull" | "countShort";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  refute: RefuteSays;
  countFull: CountFullSays;
  countShort: CountShortSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["refute.selfSurrounded","refute.selfReach","refute.nearSurrounded","refute.nearReach","refute.dotOvercount","countFull","countShort"] as const;

/** The techniques whose step is made for each square the firing decides. */
export const SAYS_EACH: readonly (keyof SaysById)[] = ["countFull","countShort"];

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
  { id: "broken", tier: 0 },
  { id: "refute", tier: 0 },
  { id: "countFull", tier: 1 },
  { id: "countShort", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = cluesValued(cl.dot, -1);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = clueAt(cl.dot, v_c);
      if (!((_h5 === -1))) continue;
      const _h11 = (g[v_c] || -1);
      let _g6 = 0;
      G7: {
        const _a8 = sp.adj4[v_c];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_m = _a8[_i9];
          const _h10 = (g[v_m] || -1);
          if (!((_h10 === _h11))) continue;
          _g6++;
        }
      }
      if (!((_g6 >= 2))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k12 = 0; _k12 < cl.dot.at.length; _k12++) {
    const _at13 = cl.dot.at[_k12];
    const _v14 = cl.dot.v[_k12];
    let _c20: boolean = ((g[_at13] || -1) === _v14);
    if (_c20) {
      let _g15 = 0;
      G16: {
        const _a17 = sp.adj4[_at13];
        for (let _i18 = 0; _i18 < _a17.length; _i18++) {
          const v_m = _a17[_i18];
          const _h19 = (g[v_m] || -1);
          if (!((_h19 === _v14))) continue;
          _g15++;
        }
      }
      _c20 = (_g15 === 1);
    }
    if (!(_c20)) return false;
  }
  return true;
}

export interface BrokenBinding {
  c: number;
  r: number;
}

const brokenFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function broken(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BrokenBinding> | null): number {
  const facts = brokenFacts;
  let fired = 0;
  let changed = false;
  const _k23 = dotKept.board(cl);
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h10 = (b.grid[v_c] !== 0);
    if (!(_h10)) continue;
    const _h11 = (b.grid[v_c] || -1);
    let _g12 = 0;
    G13: {
      const _a14 = sp.adj4[v_c];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_m = _a14[_i15];
        const _h16 = (b.grid[v_m] !== 0);
        const _h17 = (b.grid[v_m] || -1);
        if (!(((v_m !== v_c) && (!(_h16) || (_h17 === _h11))))) continue;
        _g12++;
      }
    }
    const v_r = _g12;
    if (DEV && staleChecking) {
      const _t18 = (b.grid[v_c] || -1);
      let _g19 = 0;
      G20: {
        const _a21 = sp.adj4[v_c];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_m = _a21[_i22];
          if (!(((v_m !== v_c) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === _t18))))) continue;
          _g19++;
        }
      }
      freshBinding("broken", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (v_r === _g19)], ["c in", "where of c", "r ="]);
    }
    facts.length = 0;
    changed = false;
    let _c30: boolean = ((v_r >= 1) && (((_k23[v_c] ?? dot(sp, cl, v_c)) === 1) || (v_r >= 2)));
    if (_c30) {
      let _c29: boolean = ((_k23[v_c] ?? dot(sp, cl, v_c)) === 0);
      if (!_c29) {
        let _g24 = 0;
        G25: {
          const _a26 = sp.adj4[v_c];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_m = _a26[_i27];
            const _h28 = (b.grid[v_m] || -1);
            if (!((_h28 === _h11))) continue;
            _g24++;
          }
        }
        _c29 = (_g24 <= 1);
      }
      _c30 = _c29;
    }
    if (!(_c30)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, r: v_r }, facts)) return 1;
    }
  }
  return fired;
}

export interface RefuteBinding {
  x: number;
  d: number;
  n: number;
  e: number;
  r: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; the arm that holds says which way it reads. */
export type RefuteSays =
  | { arm: "selfSurrounded"; terms: { fill: number; refuted: number; }; marks: { outline: readonly number[]; reads: readonly number[]; } }
  | { arm: "selfReach"; terms: { fill: number; refuted: number; }; marks: { outline: readonly number[]; reads: readonly number[]; } }
  | { arm: "nearSurrounded"; terms: { fill: number; refuted: number; }; marks: { outline: readonly number[]; reads: readonly number[]; } }
  | { arm: "nearReach"; terms: { fill: number; refuted: number; }; marks: { outline: readonly number[]; reads: readonly number[]; } }
  | { arm: "dotOvercount"; terms: { fill: number; refuted: number; }; marks: { outline: readonly number[]; reads: readonly number[]; } }
;

const refuteFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function refute(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RefuteBinding, RefuteSays> | null): number {
  const facts = refuteFacts;
  let fired = 0;
  let changed = false;
  const _k31 = dotKept.board(cl);
  const _a18 = sp.cells;
  R1:
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_x = _a18[_i19];
    const _m44_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m20 = b.domain; _m20 !== 0; _m20 &= _m20 - 1) {
      const v_d = 31 - Math.clz32(_m20 & -_m20);
      const _h42 = (3 - v_d);
      const _h43 = _h42;
      const _a21 = union(setOf(v_x), sp.adj4[v_x]);
      R3:
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_n = _a21[_i22];
        if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) continue;
        const _h24 = (v_n === v_x);
        const _h25 = (v_n !== v_x);
        for (let _m23 = b.domain; _m23 !== 0; _m23 &= _m23 - 1) {
          const v_e = 31 - Math.clz32(_m23 & -_m23);
          if (!(((_h24 && (v_e === v_d)) || (_h25 && (v_e === (b.grid[v_n] || -1)))))) continue;
          let _g26 = 0;
          G27: {
            const _a28 = sp.adj4[v_n];
            for (let _i29 = 0; _i29 < _a28.length; _i29++) {
              const v_m = _a28[_i29];
              if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
              _g26++;
            }
          }
          L30: {
            const v_r = _g26;
            if (!((((_h24 || (v_e !== v_d)) && ((v_r < 1) || (((_k31[v_n] ?? dot(sp, cl, v_n)) === 0) && (v_r < 2)))) || (((_h25 && (v_e === v_d)) && ((_k31[v_n] ?? dot(sp, cl, v_n)) === 1)) && (same(b, sp, v_n) >= 1))))) break L30;
            if (b.made[0] !== _m44_0) {
              if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
              if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) { continue R3; }
            }
            if (DEV && staleChecking) {
              let _g32 = 0;
              G33: {
                const _a34 = sp.adj4[v_n];
                for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                  const v_m = _a34[_i35];
                  if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
                  _g32++;
                }
              }
              let _c41: boolean = (((v_n === v_x) || (v_e !== v_d)) && ((v_r < 1) || ((dot(sp, cl, v_n) === 0) && (v_r < 2))));
              if (!_c41) {
                let _c40: boolean = (((v_n !== v_x) && (v_e === v_d)) && (dot(sp, cl, v_n) === 1));
                if (_c40) {
                  let _g36 = 0;
                  G37: {
                    const _a38 = sp.adj4[v_n];
                    for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                      const v_m = _a38[_i39];
                      if (!(((b.grid[v_m] || -1) === (b.grid[v_n] || -1)))) continue;
                      _g36++;
                    }
                  }
                  _c40 = (_g36 >= 1);
                }
                _c41 = _c40;
              }
              freshBinding("refute", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), (((b.domain >> v_d) & 1) !== 0), (union(setOf(v_x), sp.adj4[v_x]).includes(v_n)), ((v_n === v_x) || (b.grid[v_n] !== 0)), (((b.domain >> v_e) & 1) !== 0), (((v_n === v_x) && (v_e === v_d)) || ((v_n !== v_x) && (v_e === (b.grid[v_n] || -1)))), (v_r === _g32), _c41], ["x in", "where of x", "d in", "n in", "where of n", "e in", "where of e", "r =", "where of r"]);
            }
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h43); changed = true; } else facts.push(PLACE, v_x, _h43); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null) {
                let _arm = -1;
                if ((_h24 && (v_r < 1))) _arm = 0; else if (_h24) _arm = 1; else if (((v_e !== v_d) && (v_r < 1))) _arm = 2; else if ((v_e !== v_d)) _arm = 3; else if (true) _arm = 4;
                let _says: RefuteSays | null = null;
                if (_arm === 0) {
                  _says = { arm: "selfSurrounded", terms: { fill: _h43, refuted: v_d }, marks: { outline: setOf(v_n).slice(), reads: union(union(union(setOf(v_x), sp.adj4[v_x]), setOf(v_n)), sp.adj4[v_n]).slice() } };
                }
                if (_arm === 1) {
                  _says = { arm: "selfReach", terms: { fill: _h43, refuted: v_d }, marks: { outline: setOf(v_n).slice(), reads: union(union(union(setOf(v_x), sp.adj4[v_x]), setOf(v_n)), sp.adj4[v_n]).slice() } };
                }
                if (_arm === 2) {
                  _says = { arm: "nearSurrounded", terms: { fill: _h43, refuted: v_d }, marks: { outline: setOf(v_n).slice(), reads: union(union(union(setOf(v_x), sp.adj4[v_x]), setOf(v_n)), sp.adj4[v_n]).slice() } };
                }
                if (_arm === 3) {
                  _says = { arm: "nearReach", terms: { fill: _h43, refuted: v_d }, marks: { outline: setOf(v_n).slice(), reads: union(union(union(setOf(v_x), sp.adj4[v_x]), setOf(v_n)), sp.adj4[v_n]).slice() } };
                }
                if (_arm === 4) {
                  _says = { arm: "dotOvercount", terms: { fill: _h43, refuted: v_d }, marks: { outline: setOf(v_n).slice(), reads: union(union(union(setOf(v_x), sp.adj4[v_x]), setOf(v_n)), sp.adj4[v_n]).slice() } };
                }
                if (_says === null) throw new Error("refute: no arm of says holds");
                if (!fire({ x: v_x, d: v_d, n: v_n, e: v_e, r: v_r }, facts, _says)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CountFullBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CountFullSays {
  terms: { fill: number; a: number; aValue: number; aDot: number; b: number; bValue: number; bDot: number; };
  marks: { outline: readonly number[]; reads: readonly number[]; };
}

const countFullFacts: number[] = [];
const countFull_st291 = stamps();

/** Its dearest read grows with the board as n. */
export function countFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountFullBinding, CountFullSays> | null): number {
  const _g108: number[] = [];
  const _g117: number[] = [];
  const _g129: number[] = [];
  const _g143: number[] = [];
  const _g163: number[] = [];
  const _g176: number[] = [];
  const _g285: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _k103 = dotKept.board(cl);
  const _a101 = sp.cells;
  R1:
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_a = _a101[_i102];
    const _m297_0 = b.made[0];
    let _c114: boolean = (b.grid[v_a] !== 0);
    if (_c114) {
      let _g104 = 0;
      G105: {
        const _a106 = sp.adj4[v_a];
        for (let _i107 = 0; _i107 < _a106.length; _i107++) {
          const v_m = _a106[_i107];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g104++;
        }
      }
      _g108.length = 0;
      G109: {
        const _a112 = sp.adj4[v_a];
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_m = _a112[_i113];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g108.push(v_m);
        }
      }
      _c114 = ((((_k103[v_a] ?? dot(sp, cl, v_a)) * ((2 - (_k103[v_a] ?? dot(sp, cl, v_a))) - _g104)) + ((1 - (_k103[v_a] ?? dot(sp, cl, v_a))) * _g108.length)) > 0);
    }
    if (!(_c114)) continue;
    const _a115 = within(sp, v_a, 2);
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_b = _a115[_i116];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g117.length = 0;
      G118: {
        const _a127 = open(b, sp, v_a);
        for (let _i128 = 0; _i128 < _a127.length; _i128++) {
          const v_u = _a127[_i128];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g117.push(v_u);
        }
      }
      const v_S = _g117;
      const _h152 = v_S.length;
      _g129.length = 0;
      G130: {
        const _a139 = open(b, sp, v_a);
        for (let _i140 = 0; _i140 < _a139.length; _i140++) {
          const v_u = _a139[_i140];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g129.push(v_u);
        }
      }
      const v_R = _g129;
      const _h153 = v_R.length;
      let _g141 = 0;
      G142: {
        _g143.length = 0;
        G144: {
          const _a147 = sp.adj4[v_b];
          for (let _i148 = 0; _i148 < _a147.length; _i148++) {
            const v_m = _a147[_i148];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g143.push(v_m);
          }
        }
        const _a149 = _g143;
        for (let _i150 = 0; _i150 < _a149.length; _i150++) {
          const v_u = _a149[_i150];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g141++;
        }
      }
      L151: {
        const v_bo = _g141;
        let _c171: boolean = ((_h152 > 0) && (_h153 > 0));
        if (_c171) {
          let _c158: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c158) {
            let _g154 = 0;
            G155: {
              const _a156 = sp.adj4[v_b];
              for (let _i157 = 0; _i157 < _a156.length; _i157++) {
                const v_m = _a156[_i157];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g154++;
              }
            }
            _c158 = ((((2 - (_k103[v_b] ?? dot(sp, cl, v_b))) - _g154) - v_bo) >= hi(b, sp, cl, v_a));
          }
          let _c170: boolean = _c158;
          if (!_c170) {
            let _c169: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c169) {
              let _g159 = 0;
              G160: {
                const _a161 = sp.adj4[v_b];
                for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                  const v_m = _a161[_i162];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g159++;
                }
              }
              _g163.length = 0;
              G164: {
                const _a167 = sp.adj4[v_b];
                for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                  const v_m = _a167[_i168];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g163.push(v_m);
                }
              }
              _c169 = ((_h152 - (((_k103[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k103[v_b] ?? dot(sp, cl, v_b))) - _g159)) + ((1 - (_k103[v_b] ?? dot(sp, cl, v_b))) * _g163.length))) >= hi(b, sp, cl, v_a));
            }
            _c170 = _c169;
          }
          _c171 = _c170;
        }
        if (!(_c171)) break L151;
        if (b.made[0] !== _m297_0) {
          let _c182: boolean = (b.grid[v_a] !== 0);
          if (_c182) {
            let _g172 = 0;
            G173: {
              const _a174 = sp.adj4[v_a];
              for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                const v_m = _a174[_i175];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g172++;
              }
            }
            _g176.length = 0;
            G177: {
              const _a180 = sp.adj4[v_a];
              for (let _i181 = 0; _i181 < _a180.length; _i181++) {
                const v_m = _a180[_i181];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g176.push(v_m);
              }
            }
            _c182 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g172)) + ((1 - dot(sp, cl, v_a)) * _g176.length)) > 0);
          }
          if (!(_c182)) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _c193: boolean = (b.grid[v_a] !== 0);
          if (_c193) {
            let _g183 = 0;
            G184: {
              const _a185 = sp.adj4[v_a];
              for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                const v_m = _a185[_i186];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g183++;
              }
            }
            const _g187: number[] = [];
            G188: {
              const _a191 = sp.adj4[v_a];
              for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                const v_m = _a191[_i192];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g187.push(v_m);
              }
            }
            _c193 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g183)) + ((1 - dot(sp, cl, v_a)) * _g187.length)) > 0);
          }
          const _g194: number[] = [];
          G195: {
            const _g204: number[] = [];
            G205: {
              const _a208 = sp.adj4[v_a];
              for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                const v_m = _a208[_i209];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g204.push(v_m);
              }
            }
            const _a210 = _g204;
            for (let _i211 = 0; _i211 < _a210.length; _i211++) {
              const v_u = _a210[_i211];
              if (!((sp.adj4[v_b].includes(v_u)))) continue;
              _g194.push(v_u);
            }
          }
          const _g212: number[] = [];
          G213: {
            const _g222: number[] = [];
            G223: {
              const _a226 = sp.adj4[v_a];
              for (let _i227 = 0; _i227 < _a226.length; _i227++) {
                const v_m = _a226[_i227];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g222.push(v_m);
              }
            }
            const _a228 = _g222;
            for (let _i229 = 0; _i229 < _a228.length; _i229++) {
              const v_u = _a228[_i229];
              if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
              _g212.push(v_u);
            }
          }
          let _g230 = 0;
          G231: {
            const _g232: number[] = [];
            G233: {
              const _a236 = sp.adj4[v_b];
              for (let _i237 = 0; _i237 < _a236.length; _i237++) {
                const v_m = _a236[_i237];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g232.push(v_m);
              }
            }
            const _a238 = _g232;
            for (let _i239 = 0; _i239 < _a238.length; _i239++) {
              const v_u = _a238[_i239];
              if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
              _g230++;
            }
          }
          let _c277: boolean = ((v_S.length > 0) && (v_R.length > 0));
          if (_c277) {
            let _c254: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
            if (_c254) {
              let _g240 = 0;
              G241: {
                const _a242 = sp.adj4[v_b];
                for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                  const v_m = _a242[_i243];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g240++;
                }
              }
              let _g244 = 0;
              G245: {
                const _a246 = sp.adj4[v_a];
                for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                  const v_m = _a246[_i247];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                  _g244++;
                }
              }
              const _g248: number[] = [];
              G249: {
                const _a252 = sp.adj4[v_a];
                for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                  const v_m = _a252[_i253];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g248.push(v_m);
                }
              }
              _c254 = ((((2 - dot(sp, cl, v_b)) - _g240) - v_bo) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g244)) + ((1 - dot(sp, cl, v_a)) * _g248.length)));
            }
            let _c276: boolean = _c254;
            if (!_c276) {
              let _c275: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
              if (_c275) {
                let _g255 = 0;
                G256: {
                  const _a257 = sp.adj4[v_b];
                  for (let _i258 = 0; _i258 < _a257.length; _i258++) {
                    const v_m = _a257[_i258];
                    if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                    _g255++;
                  }
                }
                const _g259: number[] = [];
                G260: {
                  const _a263 = sp.adj4[v_b];
                  for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                    const v_m = _a263[_i264];
                    if (!(!((b.grid[v_m] !== 0)))) continue;
                    _g259.push(v_m);
                  }
                }
                let _g265 = 0;
                G266: {
                  const _a267 = sp.adj4[v_a];
                  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                    const v_m = _a267[_i268];
                    if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                    _g265++;
                  }
                }
                const _g269: number[] = [];
                G270: {
                  const _a273 = sp.adj4[v_a];
                  for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                    const v_m = _a273[_i274];
                    if (!(!((b.grid[v_m] !== 0)))) continue;
                    _g269.push(v_m);
                  }
                }
                _c275 = ((v_S.length - ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g255)) + ((1 - dot(sp, cl, v_b)) * _g259.length))) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g265)) + ((1 - dot(sp, cl, v_a)) * _g269.length)));
              }
              _c276 = _c275;
            }
            _c277 = _c276;
          }
          freshBinding("countFull", [(sp.cells.includes(v_a)), _c193, (within(sp, v_a, 2).includes(v_b)), ((v_b !== v_a) && (b.grid[v_b] !== 0)), sameSet(v_S, _g194), sameSet(v_R, _g212), (v_bo === _g230), _c277], ["a in", "where of a", "b in", "where of b", "S =", "R =", "bo =", "where of bo"]);
        }
        facts.length = 0;
        changed = false;
        let _q278 = true;
        Q279: {
          const _a280 = v_R;
          for (let _i281 = 0; _i281 < _a280.length; _i281++) {
            const v_u = _a280[_i281];
            const _t282 = (b.grid[v_a] || -1);
            const _t283 = (3 - _t282);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t283); changed = true; } else facts.push(PLACE, v_u, _t283); }
            if (!(true)) {
              _q278 = false;
              break Q279;
            }
          }
        }
        if (!(_q278)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _t284 = (b.grid[v_a] || -1);
            _g285.length = 0;
            countFull_st291.pass++;
            G286: {
              const _a292 = v_R;
              for (let _i293 = 0; _i293 < _a292.length; _i293++) {
                const v_u = _a292[_i293];
                const _a294 = union(setOf(v_u), sp.adj4[v_u]);
                for (let _i295 = 0; _i295 < _a294.length; _i295++) {
                  const v_m = _a294[_i295];
                  const _t296 = v_m;
                  if (_g285.length < 16) { if (!_g285.includes(_t296)) _g285.push(_t296); } else addOnce(_g285, countFull_st291, _t296);
                }
              }
            }
            const _says = { terms: { fill: (3 - _t284), a: v_a, aValue: (b.grid[v_a] || -1), aDot: (_k103[v_a] ?? dot(sp, cl, v_a)), b: v_b, bValue: (b.grid[v_b] || -1), bDot: (_k103[v_b] ?? dot(sp, cl, v_b)) }, marks: { outline: union(setOf(v_a), setOf(v_b)).slice(), reads: union(union(union(union(setOf(v_a), sp.adj4[v_a]), setOf(v_b)), sp.adj4[v_b]), _g285).slice() } };
            if (!fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface CountShortBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
  alike: number;
  most: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CountShortSays {
  terms: { fill: number; a: number; aValue: number; aDot: number; b: number; bValue: number; bDot: number; most: number; };
  marks: { outline: readonly number[]; reads: readonly number[]; };
}

const countShortFacts: number[] = [];
const countShort_st224 = stamps();

/** Its dearest read grows with the board as n. */
export function countShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountShortBinding, CountShortSays> | null): number {
  const _g89: number[] = [];
  const _g101: number[] = [];
  const _g115: number[] = [];
  const _g130: number[] = [];
  const _g218: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _k81 = dotKept.board(cl);
  const _a79 = sp.cells;
  R1:
  for (let _i80 = 0; _i80 < _a79.length; _i80++) {
    const v_a = _a79[_i80];
    const _m230_0 = b.made[0];
    let _c86: boolean = (b.grid[v_a] !== 0);
    if (_c86) {
      let _g82 = 0;
      G83: {
        const _a84 = sp.adj4[v_a];
        for (let _i85 = 0; _i85 < _a84.length; _i85++) {
          const v_m = _a84[_i85];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g82++;
        }
      }
      _c86 = (((2 - (_k81[v_a] ?? dot(sp, cl, v_a))) - _g82) > 0);
    }
    if (!(_c86)) continue;
    const _a87 = within(sp, v_a, 2);
    for (let _i88 = 0; _i88 < _a87.length; _i88++) {
      const v_b = _a87[_i88];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g89.length = 0;
      G90: {
        const _a99 = open(b, sp, v_a);
        for (let _i100 = 0; _i100 < _a99.length; _i100++) {
          const v_u = _a99[_i100];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g89.push(v_u);
        }
      }
      const v_S = _g89;
      const _h136 = v_S.length;
      _g101.length = 0;
      G102: {
        const _a111 = open(b, sp, v_a);
        for (let _i112 = 0; _i112 < _a111.length; _i112++) {
          const v_u = _a111[_i112];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g101.push(v_u);
        }
      }
      const v_R = _g101;
      const _h138 = v_R.length;
      let _g113 = 0;
      G114: {
        _g115.length = 0;
        G116: {
          const _a119 = sp.adj4[v_b];
          for (let _i120 = 0; _i120 < _a119.length; _i120++) {
            const v_m = _a119[_i120];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g115.push(v_m);
          }
        }
        const _a121 = _g115;
        for (let _i122 = 0; _i122 < _a121.length; _i122++) {
          const v_u = _a121[_i122];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g113++;
        }
      }
      const v_bo = _g113;
      let _g123 = 0;
      G124: {
        for (let _i125 = 0; _i125 < 1; _i125++) {
          const v_k = v_b;
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g123++;
        }
      }
      const v_alike = _g123;
      let _g126 = 0;
      G127: {
        const _a128 = sp.adj4[v_b];
        for (let _i129 = 0; _i129 < _a128.length; _i129++) {
          const v_m = _a128[_i129];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g126++;
        }
      }
      _g130.length = 0;
      G131: {
        const _a134 = sp.adj4[v_b];
        for (let _i135 = 0; _i135 < _a134.length; _i135++) {
          const v_m = _a134[_i135];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g130.push(v_m);
        }
      }
      L137: {
        const v_most = ((v_alike * (((_k81[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k81[v_b] ?? dot(sp, cl, v_b))) - _g126)) + ((1 - (_k81[v_b] ?? dot(sp, cl, v_b))) * _g130.length))) + ((1 - v_alike) * ((_h136 - ((2 - (_k81[v_b] ?? dot(sp, cl, v_b))) - _g126)) + v_bo)));
        if (!(((((_h136 > 0) && (_h138 > 0)) && (v_most < _h136)) && ((lo(b, sp, cl, v_a) - v_most) >= _h138)))) break L137;
        if (b.made[0] !== _m230_0) {
          let _c143: boolean = (b.grid[v_a] !== 0);
          if (_c143) {
            let _g139 = 0;
            G140: {
              const _a141 = sp.adj4[v_a];
              for (let _i142 = 0; _i142 < _a141.length; _i142++) {
                const v_m = _a141[_i142];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g139++;
              }
            }
            _c143 = (((2 - dot(sp, cl, v_a)) - _g139) > 0);
          }
          if (!(_c143)) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _c148: boolean = (b.grid[v_a] !== 0);
          if (_c148) {
            let _g144 = 0;
            G145: {
              const _a146 = sp.adj4[v_a];
              for (let _i147 = 0; _i147 < _a146.length; _i147++) {
                const v_m = _a146[_i147];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g144++;
              }
            }
            _c148 = (((2 - dot(sp, cl, v_a)) - _g144) > 0);
          }
          const _g149: number[] = [];
          G150: {
            const _g159: number[] = [];
            G160: {
              const _a163 = sp.adj4[v_a];
              for (let _i164 = 0; _i164 < _a163.length; _i164++) {
                const v_m = _a163[_i164];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g159.push(v_m);
              }
            }
            const _a165 = _g159;
            for (let _i166 = 0; _i166 < _a165.length; _i166++) {
              const v_u = _a165[_i166];
              if (!((sp.adj4[v_b].includes(v_u)))) continue;
              _g149.push(v_u);
            }
          }
          const _g167: number[] = [];
          G168: {
            const _g177: number[] = [];
            G178: {
              const _a181 = sp.adj4[v_a];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_m = _a181[_i182];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g177.push(v_m);
              }
            }
            const _a183 = _g177;
            for (let _i184 = 0; _i184 < _a183.length; _i184++) {
              const v_u = _a183[_i184];
              if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
              _g167.push(v_u);
            }
          }
          let _g185 = 0;
          G186: {
            const _g187: number[] = [];
            G188: {
              const _a191 = sp.adj4[v_b];
              for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                const v_m = _a191[_i192];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g187.push(v_m);
              }
            }
            const _a193 = _g187;
            for (let _i194 = 0; _i194 < _a193.length; _i194++) {
              const v_u = _a193[_i194];
              if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
              _g185++;
            }
          }
          let _g195 = 0;
          G196: {
            for (let _i197 = 0; _i197 < 1; _i197++) {
              const v_k = v_b;
              if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
              _g195++;
            }
          }
          let _g198 = 0;
          G199: {
            const _a200 = sp.adj4[v_b];
            for (let _i201 = 0; _i201 < _a200.length; _i201++) {
              const v_m = _a200[_i201];
              if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
              _g198++;
            }
          }
          const _g202: number[] = [];
          G203: {
            const _a206 = sp.adj4[v_b];
            for (let _i207 = 0; _i207 < _a206.length; _i207++) {
              const v_m = _a206[_i207];
              if (!(!((b.grid[v_m] !== 0)))) continue;
              _g202.push(v_m);
            }
          }
          let _c212: boolean = (((v_S.length > 0) && (v_R.length > 0)) && (v_most < v_S.length));
          if (_c212) {
            let _g208 = 0;
            G209: {
              const _a210 = sp.adj4[v_a];
              for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                const v_m = _a210[_i211];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g208++;
              }
            }
            _c212 = ((((2 - dot(sp, cl, v_a)) - _g208) - v_most) >= v_R.length);
          }
          freshBinding("countShort", [(sp.cells.includes(v_a)), _c148, (within(sp, v_a, 2).includes(v_b)), ((v_b !== v_a) && (b.grid[v_b] !== 0)), sameSet(v_S, _g149), sameSet(v_R, _g167), (v_bo === _g185), (v_alike === _g195), (v_most === ((v_alike * ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g198)) + ((1 - dot(sp, cl, v_b)) * _g202.length))) + ((1 - v_alike) * ((v_S.length - ((2 - dot(sp, cl, v_b)) - _g198)) + v_bo)))), _c212], ["a in", "where of a", "b in", "where of b", "S =", "R =", "bo =", "alike =", "most =", "where of most"]);
        }
        facts.length = 0;
        changed = false;
        let _q213 = true;
        Q214: {
          const _a215 = v_R;
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            const v_u = _a215[_i216];
            const _t217 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t217); changed = true; } else facts.push(PLACE, v_u, _t217); }
            if (!(true)) {
              _q213 = false;
              break Q214;
            }
          }
        }
        if (!(_q213)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            _g218.length = 0;
            countShort_st224.pass++;
            G219: {
              const _a225 = v_R;
              for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                const v_u = _a225[_i226];
                const _a227 = union(setOf(v_u), sp.adj4[v_u]);
                for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                  const v_m = _a227[_i228];
                  const _t229 = v_m;
                  if (_g218.length < 16) { if (!_g218.includes(_t229)) _g218.push(_t229); } else addOnce(_g218, countShort_st224, _t229);
                }
              }
            }
            const _says = { terms: { fill: (b.grid[v_a] || -1), a: v_a, aValue: (b.grid[v_a] || -1), aDot: (_k81[v_a] ?? dot(sp, cl, v_a)), b: v_b, bValue: (b.grid[v_b] || -1), bDot: (_k81[v_b] ?? dot(sp, cl, v_b)), most: v_most }, marks: { outline: union(setOf(v_a), setOf(v_b)).slice(), reads: union(union(union(union(setOf(v_a), sp.adj4[v_a]), setOf(v_b)), sp.adj4[v_b]), _g218).slice() } };
            if (!fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo, alike: v_alike, most: v_most }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const dotKept = keptStore<number>();
let dotOn: object | null = null;
let dotAt: Kept<number> = [];

/** `dot(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function dot(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== dotOn) {
    dotAt = dotKept.board(cl);
    dotOn = cl;
  }
  const _kept: Kept<number> = dotAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      const v_k = v_c;
      if (!((clueAt(cl.dot, v_k) !== -1))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const sameKept = keptStore<number>();

/** `same(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function same(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = sameKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_m = _a3[_i4];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.adj4[v_c];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_m = _a5[_i6];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g1.push(v_m);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const hiKept = keptStore<number>();

/** `hi(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function hi(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = hiKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_m = _a3[_i4];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g1++;
    }
  }
  const _g5: number[] = [];
  G6: {
    const _a9 = sp.adj4[v_c];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_m = _a9[_i10];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g5.push(v_m);
    }
  }
  const _made = ((dot(sp, cl, v_c) * ((2 - dot(sp, cl, v_c)) - _g1)) + ((1 - dot(sp, cl, v_c)) * _g5.length));
  _kept[v_c] = _made;
  return _made;
}

const loKept = keptStore<number>();

/** `lo(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lo(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = loKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_m = _a3[_i4];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g1++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g1);
  _kept[v_c] = _made;
  return _made;
}
