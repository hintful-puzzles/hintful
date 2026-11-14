// Compiled by `npm run describe` from src/games/seismic/seismic.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, freshBinding, least, popcount, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  area: Partition;
  mode: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "lone" | "areaSingle" | "starve";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  starve: StarveSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["starve"] as const;

/** Every technique run as each value is placed, by id. */
export type PlacingId = "cull";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "cull" },
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
  { id: "lone", tier: 0 },
  { id: "areaSingle", tier: 0 },
  { id: "starve", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  return rangeMask(1, cl.area.cells[cl.area.of[v_c]].length);
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _h18 = (cl.mode === 0);
  const _h21 = (cl.mode === 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = cl.area.parts;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_r = _a3[_i4];
      let _g5 = true;
      const _s7: number[] = [];
      G6: {
        const _a8 = cl.area.cells[v_r];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_c = _a8[_i9];
          const _h10 = (g[v_c] || -1);
          if (_s7.includes(_h10)) {
            _g5 = false;
            break G6;
          }
          _s7.push(_h10);
        }
      }
      if (!(_g5)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q11 = true;
  Q12: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_a = _a13[_i14];
      const _h17 = (g[v_a] || -1);
      const _h19 = ((v_a / sp.w) | 0);
      const _h20 = (v_a % sp.w);
      const _a15 = sp.cells;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_b = _a15[_i16];
        if (!(((v_a !== v_b) && ((_h18 && (((_h19 === ((v_b / sp.w) | 0)) && (Math.abs((_h20 - (v_b % sp.w))) <= _h17)) || ((_h20 === (v_b % sp.w)) && (Math.abs((_h19 - ((v_b / sp.w) | 0))) <= _h17)))) || ((_h21 && (Math.abs((_h20 - (v_b % sp.w))) <= 1)) && (Math.abs((_h19 - ((v_b / sp.w) | 0))) <= 1)))))) continue;
        const _h22 = (g[v_b] || -1);
        if (!((_h22 !== _h17))) {
          _q11 = false;
          break Q12;
        }
      }
    }
  }
  if (!(_q11)) return false;
  return true;
}

export interface CullBinding {
  c: number;
  n: number;
  p: number;
}

const cullFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function cull(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<CullBinding> | null): number {
  const facts = cullFacts;
  let fired = 0;
  let changed = false;
  const _m14_0 = b.made[0];
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = (b.grid[v_c] || -1);
  const _h9 = cl.area.of[v_c];
  const _h10 = (cl.mode === 0);
  const _h11 = ((v_c / sp.w) | 0);
  const _h12 = (v_c % sp.w);
  const _h13 = (cl.mode === 1);
  if (!(_h5)) return 0;
  const v_n = _h6;
  const _a7 = sp.cells;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_p = _a7[_i8];
    if (!(((v_p !== v_c) && ((cl.area.of[v_p] === _h9) || ((v_c !== v_p) && ((_h10 && (((_h11 === ((v_p / sp.w) | 0)) && (Math.abs((_h12 - (v_p % sp.w))) <= v_n)) || ((_h12 === (v_p % sp.w)) && (Math.abs((_h11 - ((v_p / sp.w) | 0))) <= v_n)))) || ((_h13 && (Math.abs((_h12 - (v_p % sp.w))) <= 1)) && (Math.abs((_h11 - ((v_p / sp.w) | 0))) <= 1)))))))) continue;
    if (b.made[0] !== _m14_0) {
      if (!((v_n === (b.grid[v_c] || -1)))) { return cull(b, sp, cl, v_c, fire) | fired; }
    }
    if (DEV && staleChecking) {
      freshBinding("cull", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (v_n === (b.grid[v_c] || -1)), (sp.cells.includes(v_p)), ((v_p !== v_c) && ((cl.area.of[v_p] === cl.area.of[v_c]) || ((v_c !== v_p) && (((cl.mode === 0) && (((((v_c / sp.w) | 0) === ((v_p / sp.w) | 0)) && (Math.abs(((v_c % sp.w) - (v_p % sp.w))) <= v_n)) || (((v_c % sp.w) === (v_p % sp.w)) && (Math.abs((((v_c / sp.w) | 0) - ((v_p / sp.w) | 0))) <= v_n)))) || (((cl.mode === 1) && (Math.abs(((v_c % sp.w) - (v_p % sp.w))) <= 1)) && (Math.abs((((v_c / sp.w) | 0) - ((v_p / sp.w) | 0))) <= 1))))))], ["c in", "where of c", "n =", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> v_n) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_n); changed = true; } else facts.push(STRIKE, v_p, v_n); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, n: v_n, p: v_p }, facts);
    }
  }
  return fired;
}

export interface LoneBinding {
  c: number;
}

const loneFacts: number[] = [];
let loneCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function lone(b: Marks, sp: GridSpace, fire: Fire<LoneBinding> | null): number {
  const facts = loneFacts;
  let fired = 0;
  let changed = false;
  if (loneCands.length < sp.cells.length) loneCands = new Int32Array(sp.cells.length);
  const cands = loneCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c6: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c6) {
      const _t5 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t5); changed = true; } else facts.push(PLACE, v_c, _t5); }
      _c6 = true;
    }
    if (!(_c6)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface AreaSingleBinding {
  r: number;
  n: number;
  k: number;
}

const areaSingleFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function areaSingle(b: Marks, _sp: GridSpace, cl: Dealt, fire: Fire<AreaSingleBinding> | null): number {
  const facts = areaSingleFacts;
  let fired = 0;
  let changed = false;
  const _a13 = cl.area.parts;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_r = _a13[_i14];
    const _t15 = cl.area.cells[v_r].length;
    for (let v_n = 1; v_n <= _t15; v_n++) {
      let _q16 = false;
      Q17: {
        const _a18 = cl.area.cells[v_r];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_c = _a18[_i19];
          if (((b.grid[v_c] || -1) === v_n)) {
            _q16 = true;
            break Q17;
          }
        }
      }
      if (!(!(_q16))) continue;
      let _g20 = 0;
      G21: {
        const _a22 = cl.area.cells[v_r];
        for (let _i23 = 0; _i23 < _a22.length; _i23++) {
          const v_c = _a22[_i23];
          if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
          _g20++;
        }
      }
      L24: {
        const v_k = _g20;
        if (!((v_k < 2))) break L24;
        if (DEV && staleChecking) {
          let _q25 = false;
          Q26: {
            const _a27 = cl.area.cells[v_r];
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_c = _a27[_i28];
              if (((b.grid[v_c] || -1) === v_n)) {
                _q25 = true;
                break Q26;
              }
            }
          }
          let _g29 = 0;
          G30: {
            const _a31 = cl.area.cells[v_r];
            for (let _i32 = 0; _i32 < _a31.length; _i32++) {
              const v_c = _a31[_i32];
              if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
              _g29++;
            }
          }
          freshBinding("areaSingle", [(cl.area.parts.includes(v_r)), ((1 <= v_n) && (v_n <= cl.area.cells[v_r].length)), !(_q25), (v_k === _g29), (v_k < 2)], ["r in", "n in", "where of n", "k =", "where of k"]);
        }
        facts.length = 0;
        changed = false;
        let _c38: boolean = (v_k === 1);
        if (_c38) {
          let _g33 = -1;
          let _n35 = 0;
          G34: {
            const _a36 = cl.area.cells[v_r];
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_c = _a36[_i37];
              if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
              if (++_n35 === 2) {
                _g33 = -1;
                break G34;
              }
              _g33 = v_c;
            }
          }
          if (!(b.grid[_g33] !== 0)) { if (fire === null) { b.placeAt(_g33, v_n); changed = true; } else facts.push(PLACE, _g33, v_n); }
          _c38 = true;
        }
        if (!(_c38)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ r: v_r, n: v_n, k: v_k }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface StarveBinding {
  r: number;
  n: number;
  H: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface StarveSays {
  terms: { r: number; n: number; };
  marks: {  };
}

const starveFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function starve(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarveBinding, StarveSays> | null): number {
  const _g23: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  const _h51 = (cl.mode === 0);
  const _h54 = (cl.mode === 1);
  const _a15 = cl.area.parts;
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_r = _a15[_i16];
    const _t17 = cl.area.cells[v_r].length;
    for (let v_n = 1; v_n <= _t17; v_n++) {
      let _q18 = false;
      Q19: {
        const _a20 = cl.area.cells[v_r];
        for (let _i21 = 0; _i21 < _a20.length; _i21++) {
          const v_c = _a20[_i21];
          const _h22 = (b.grid[v_c] || -1);
          if ((_h22 === v_n)) {
            _q18 = true;
            break Q19;
          }
        }
      }
      if (!(!(_q18))) continue;
      _g23.length = 0;
      G24: {
        const _a27 = cl.area.cells[v_r];
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_h = _a27[_i28];
          const _h29 = (b.grid[v_h] !== 0);
          if (!((!(_h29) && (((b.cands[v_h] >> v_n) & 1) !== 0)))) continue;
          _g23.push(v_h);
        }
      }
      L30: {
        const v_H = _g23;
        const _h31 = v_H.length;
        if (!((_h31 > 0))) break L30;
        if (DEV && staleChecking) {
          let _q32 = false;
          Q33: {
            const _a34 = cl.area.cells[v_r];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_c = _a34[_i35];
              if (((b.grid[v_c] || -1) === v_n)) {
                _q32 = true;
                break Q33;
              }
            }
          }
          const _g36: number[] = [];
          G37: {
            const _a40 = cl.area.cells[v_r];
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_h = _a40[_i41];
              if (!((!((b.grid[v_h] !== 0)) && (((b.cands[v_h] >> v_n) & 1) !== 0)))) continue;
              _g36.push(v_h);
            }
          }
          freshBinding("starve", [(cl.area.parts.includes(v_r)), ((1 <= v_n) && (v_n <= cl.area.cells[v_r].length)), !(_q32), sameSet(v_H, _g36), (v_H.length > 0)], ["r in", "n in", "where of n", "H =", "where of H"]);
        }
        facts.length = 0;
        changed = false;
        let _q42 = true;
        Q43: {
          const _a44 = sp.cells;
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_c = _a44[_i45];
            const _h46 = (b.grid[v_c] !== 0);
            const _h52 = ((v_c / sp.w) | 0);
            const _h53 = (v_c % sp.w);
            let _c55: boolean = (((cl.area.of[v_c] !== v_r) && !(_h46)) && (((b.cands[v_c] >> v_n) & 1) !== 0));
            if (_c55) {
              let _q47 = true;
              Q48: {
                const _a49 = v_H;
                for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                  const v_h = _a49[_i50];
                  if (!(((v_c !== v_h) && ((_h51 && (((_h52 === ((v_h / sp.w) | 0)) && (Math.abs((_h53 - (v_h % sp.w))) <= v_n)) || ((_h53 === (v_h % sp.w)) && (Math.abs((_h52 - ((v_h / sp.w) | 0))) <= v_n)))) || ((_h54 && (Math.abs((_h53 - (v_h % sp.w))) <= 1)) && (Math.abs((_h52 - ((v_h / sp.w) | 0))) <= 1)))))) {
                    _q47 = false;
                    break Q48;
                  }
                }
              }
              _c55 = _q47;
            }
            if (!(_c55)) continue;
            if ((((b.cands[v_c] >> v_n) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
            if (!(true)) {
              _q42 = false;
              break Q43;
            }
          }
        }
        if (!(_q42)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { r: v_r, n: v_n }, marks: {  } };
            if (!fire({ r: v_r, n: v_n, H: v_H.slice() }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}
