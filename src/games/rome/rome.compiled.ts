// Compiled by `npm run describe` from src/games/rome/rome.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, before, chain, chainHas, clueAt, freshBinding, least, memberMarks, popcount, sameSet, staleChecking, step } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  area: Partition;
  goal: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "lone" | "loop" | "onlyHome" | "pair" | "reach" | "opposite";

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
  { id: "loop", tier: 0 },
  { id: "onlyHome", tier: 1 },
  { id: "pair", tier: 1 },
  { id: "reach", tier: 1 },
  { id: "opposite", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 5; v_d++) {
      if (!((((v_d === 5) === (clueAt(cl.goal, v_c) >= 0)) && ((v_d === 5) || (step(sp, v_c, v_d) !== -1))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
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
      const v_c = _a13[_i14];
      let _q15 = false;
      Q16: {
        const _a19 = chain(sp, (_x17: number): number => { if (_x17 < 0) return -1; const _d18 = (g[_x17] || -1); if (_d18 < 0) return -1; return step(sp, _x17, _d18); }, v_c);
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_g = _a19[_i20];
          const _h21 = (g[v_g] || -1);
          if ((_h21 === 5)) {
            _q15 = true;
            break Q16;
          }
        }
      }
      if (!(_q15)) {
        _q11 = false;
        break Q12;
      }
    }
  }
  if (!(_q11)) return false;
  for (let _k22 = 0; _k22 < cl.goal.at.length; _k22++) {
    const _at23 = cl.goal.at[_k22];
    if (!((((g[_at23] || -1) === 5) && (cl.area.cells[cl.area.of[_at23]].length === 1)))) return false;
  }
  return true;
}

export interface CullBinding {
  c: number;
  d: number;
  p: number;
}

const cullFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function cull(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<CullBinding> | null): number {
  const facts = cullFacts;
  let fired = 0;
  let changed = false;
  const _m9_0 = b.made[0];
  const _h5 = (b.grid[v_c] !== 0);
  const _h6 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const v_d = _h6;
  const _a7 = cl.area.cells[cl.area.of[v_c]];
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_p = _a7[_i8];
    if (!((v_p !== v_c))) continue;
    if (b.made[0] !== _m9_0) {
      if (!((v_d === (b.grid[v_c] || -1)))) { return cull(b, sp, cl, v_c, fire) | fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("cull", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (v_d === (b.grid[v_c] || -1)), (cl.area.cells[cl.area.of[v_c]].includes(v_p)), (v_p !== v_c)], ["c in", "where of c", "d =", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, d: v_d, p: v_p }, facts);
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
    if (import.meta.env.DEV && staleChecking) {
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

export interface LoopBinding {
  c: number;
  d: number;
  q: number;
}

const loopFacts: number[] = [];
let loopCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function loop(b: Marks, sp: GridSpace, fire: Fire<LoopBinding> | null): number {
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  if (loopCands.length < sp.cells.length) loopCands = new Int32Array(sp.cells.length);
  const cands = loopCands;
  cands.fill(-1);
  const _a7 = sp.cells;
  R1:
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_c = _a7[_i8];
    const _m16_0 = b.made[0];
    const _h9 = (b.grid[v_c] !== 0);
    if (!(!(_h9))) continue;
    const _m17_1 = b.made[1];
    R2:
    for (let _m10 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m10 !== 0; _m10 &= _m10 - 1) {
      const v_d = 31 - Math.clz32(_m10 & -_m10);
      L11: {
        const v_q = step(sp, v_c, v_d);
        if (!(((v_q !== -1) && chainHas(sp, b, (_x12: number): number => { if (_x12 < 0) return -1; const _d13 = (b.grid[_x12] || -1); if (_d13 < 0) return -1; return step(sp, _x12, _d13); }, v_c, v_q)))) break L11;
        if (b.made[0] !== _m16_0 || b.made[1] !== _m17_1) {
          if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("loop", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (((b.cands[v_c] >> v_d) & 1) !== 0), (v_q === step(sp, v_c, v_d)), ((v_q !== -1) && chainHas(sp, b, (_x14: number): number => { if (_x14 < 0) return -1; const _d15 = (b.grid[_x14] || -1); if (_d15 < 0) return -1; return step(sp, _x14, _d15); }, v_c, v_q))], ["c in", "where of c", "d in", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, d: v_d, q: v_q }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface OnlyHomeBinding {
  r: number;
  d: number;
  k: number;
}

const onlyHomeFacts: number[] = [];
let onlyHomeCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function onlyHome(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyHomeBinding> | null): number {
  const facts = onlyHomeFacts;
  let fired = 0;
  let changed = false;
  if (onlyHomeCands.length < sp.cells.length) onlyHomeCands = new Int32Array(sp.cells.length);
  const cands = onlyHomeCands;
  cands.fill(-1);
  const _a12 = cl.area.parts;
  for (let _i13 = 0; _i13 < _a12.length; _i13++) {
    const v_r = _a12[_i13];
    if (!((cl.area.cells[v_r].length === 4))) continue;
    for (let v_d = 1; v_d <= 4; v_d++) {
      let _q14 = false;
      Q15: {
        const _a16 = cl.area.cells[v_r];
        for (let _i17 = 0; _i17 < _a16.length; _i17++) {
          const v_c = _a16[_i17];
          const _h18 = (b.grid[v_c] || -1);
          if ((_h18 === v_d)) {
            _q14 = true;
            break Q15;
          }
        }
      }
      if (!(!(_q14))) continue;
      let _g19 = 0;
      G20: {
        const _a21 = cl.area.cells[v_r];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_c = _a21[_i22];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g19++;
        }
      }
      L23: {
        const v_k = _g19;
        if (!((v_k < 2))) break L23;
        if (import.meta.env.DEV && staleChecking) {
          let _q24 = false;
          Q25: {
            const _a26 = cl.area.cells[v_r];
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_c = _a26[_i27];
              if (((b.grid[v_c] || -1) === v_d)) {
                _q24 = true;
                break Q25;
              }
            }
          }
          let _g28 = 0;
          G29: {
            const _a30 = cl.area.cells[v_r];
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_c = _a30[_i31];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              _g28++;
            }
          }
          freshBinding("onlyHome", [(cl.area.parts.includes(v_r)), (cl.area.cells[v_r].length === 4), ((1 <= v_d) && (v_d <= 4)), !(_q24), (v_k === _g28), (v_k < 2)], ["r in", "where of r", "d in", "where of d", "k =", "where of k"]);
        }
        facts.length = 0;
        changed = false;
        let _c37: boolean = (v_k === 1);
        if (_c37) {
          let _q32 = true;
          Q33: {
            const _a34 = cl.area.cells[v_r];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_c = _a34[_i35];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              for (let _m36 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m36 !== 0; _m36 &= _m36 - 1) {
                const v_e = 31 - Math.clz32(_m36 & -_m36);
                if (!((v_e !== v_d))) continue;
                if ((((b.cands[v_c] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
                if (!(true)) {
                  _q32 = false;
                  break Q33;
                }
              }
            }
          }
          _c37 = _q32;
        }
        if (!(_c37)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ r: v_r, d: v_d, k: v_k }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface PairBinding {
  r: number;
  a: number;
  b: number;
}

const pairFacts: number[] = [];
let pairCands = new Int32Array(0);

/** Its dearest read grows with the board as 1. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  const _a8 = cl.area.parts;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_r = _a8[_i9];
    const _a10 = cl.area.cells[v_r];
    R2:
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_a = _a10[_i11];
      const _m22_0 = b.made[0];
      const _m23_1 = b.made[1];
      const _h12 = (b.grid[v_a] !== 0);
      if (!((!(_h12) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
      const _a13 = cl.area.cells[v_r];
      const _n14 = _i11;
      for (let _i15 = 0; _i15 < _n14; _i15++) {
        const v_b = _a13[_i15];
        const _h16 = (b.grid[v_b] !== 0);
        if (!((!(_h16) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
        if (b.made[0] !== _m22_0 || b.made[1] !== _m23_1) {
          if (!((!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("pair", [(cl.area.parts.includes(v_r)), (cl.area.cells[v_r].includes(v_a)), (!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)), (before(v_a, cl.area.cells[v_r]).includes(v_b)), (!((b.grid[v_b] !== 0)) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))))], ["r in", "a in", "where of a", "b in", "where of b"]);
        }
        facts.length = 0;
        changed = false;
        let _q17 = true;
        Q18: {
          const _a19 = cl.area.cells[v_r];
          for (let _i20 = 0; _i20 < _a19.length; _i20++) {
            const v_p = _a19[_i20];
            if (!(((v_p !== v_a) && (v_p !== v_b)))) continue;
            for (let _m21 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m21 !== 0; _m21 &= _m21 - 1) {
              const v_d = 31 - Math.clz32(_m21 & -_m21);
              if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
              if (!(true)) {
                _q17 = false;
                break Q18;
              }
            }
          }
        }
        if (!(_q17)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ r: v_r, a: v_a, b: v_b }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface ReachBinding {
  H: readonly number[];
  p: number;
  d: number;
}

const reachFacts: number[] = [];
let reachCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const _g28: number[] = [];
  const _g60: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  if (reachCands.length < sp.cells.length) reachCands = new Int32Array(sp.cells.length);
  const cands = reachCands;
  cands.fill(-1);
  const _m105_0 = b.made[0];
  _g28.length = 0;
  G29: {
    const _a38 = sp.cells;
    for (let _i39 = 0; _i39 < _a38.length; _i39++) {
      const v_p = _a38[_i39];
      let _q40 = false;
      Q41: {
        const _a44 = chain(sp, (_x42: number): number => { if (_x42 < 0) return -1; const _d43 = (b.grid[_x42] || -1); if (_d43 < 0) return -1; return step(sp, _x42, _d43); }, v_p);
        for (let _i45 = 0; _i45 < _a44.length; _i45++) {
          const v_g = _a44[_i45];
          const _h46 = clueAt(cl.goal, v_g);
          if ((_h46 >= 0)) {
            _q40 = true;
            break Q41;
          }
        }
      }
      if (!(_q40)) continue;
      _g28.push(v_p);
    }
  }
  const v_H = _g28;
  const _mm51 = memberMarks(v_H);
  const _a47 = sp.cells;
  R1:
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_p = _a47[_i48];
    const _h49 = (b.grid[v_p] !== 0);
    if (!(!(_h49))) continue;
    const _m106_1 = b.made[1];
    R2:
    for (let _m50 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m50 !== 0; _m50 &= _m50 - 1) {
      const v_d = 31 - Math.clz32(_m50 & -_m50);
      let _c59: boolean = (_mm51[step(sp, v_p, v_d) + 1] === 1);
      if (_c59) {
        let _q52 = false;
        Q53: {
          const _a54 = sp.cells;
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_q = _a54[_i55];
            const _h56 = (b.grid[v_q] !== 0);
            if (!(!(_h56))) continue;
            const _h58 = (v_q !== v_p);
            for (let _m57 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m57 !== 0; _m57 &= _m57 - 1) {
              const v_e = 31 - Math.clz32(_m57 & -_m57);
              if (!((_h58 || (v_e !== v_d)))) continue;
              if ((_mm51[step(sp, v_q, v_e) + 1] === 1)) {
                _q52 = true;
                break Q53;
              }
            }
          }
        }
        _c59 = !(_q52);
      }
      if (!(_c59)) continue;
      if (b.made[0] !== _m105_0 || b.made[1] !== _m106_1) {
        _g60.length = 0;
        G61: {
          const _a70 = sp.cells;
          for (let _i71 = 0; _i71 < _a70.length; _i71++) {
            const v_p = _a70[_i71];
            let _q72 = false;
            Q73: {
              const _a76 = chain(sp, (_x74: number): number => { if (_x74 < 0) return -1; const _d75 = (b.grid[_x74] || -1); if (_d75 < 0) return -1; return step(sp, _x74, _d75); }, v_p);
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_g = _a76[_i77];
                if ((clueAt(cl.goal, v_g) >= 0)) {
                  _q72 = true;
                  break Q73;
                }
              }
            }
            if (!(_q72)) continue;
            _g60.push(v_p);
          }
        }
        if (!(sameSet(v_H, _g60))) { return fired; }
        if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
        if (!((((b.cands[v_p] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g78: number[] = [];
        G79: {
          const _a88 = sp.cells;
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_p = _a88[_i89];
            let _q90 = false;
            Q91: {
              const _a94 = chain(sp, (_x92: number): number => { if (_x92 < 0) return -1; const _d93 = (b.grid[_x92] || -1); if (_d93 < 0) return -1; return step(sp, _x92, _d93); }, v_p);
              for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                const v_g = _a94[_i95];
                if ((clueAt(cl.goal, v_g) >= 0)) {
                  _q90 = true;
                  break Q91;
                }
              }
            }
            if (!(_q90)) continue;
            _g78.push(v_p);
          }
        }
        let _c101: boolean = (v_H.includes(step(sp, v_p, v_d)));
        if (_c101) {
          let _q96 = false;
          Q97: {
            const _a98 = sp.cells;
            for (let _i99 = 0; _i99 < _a98.length; _i99++) {
              const v_q = _a98[_i99];
              if (!(!((b.grid[v_q] !== 0)))) continue;
              for (let _m100 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m100 !== 0; _m100 &= _m100 - 1) {
                const v_e = 31 - Math.clz32(_m100 & -_m100);
                if (!(((v_q !== v_p) || (v_e !== v_d)))) continue;
                if ((v_H.includes(step(sp, v_q, v_e)))) {
                  _q96 = true;
                  break Q97;
                }
              }
            }
          }
          _c101 = !(_q96);
        }
        freshBinding("reach", [sameSet(v_H, _g78), (sp.cells.includes(v_p)), !((b.grid[v_p] !== 0)), (((b.cands[v_p] >> v_d) & 1) !== 0), _c101], ["H =", "p in", "where of p", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q102 = true;
      Q103: {
        for (let _m104 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m104 !== 0; _m104 &= _m104 - 1) {
          const v_e = 31 - Math.clz32(_m104 & -_m104);
          if (!((v_e !== v_d))) continue;
          if ((((b.cands[v_p] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_e); changed = true; } else facts.push(STRIKE, v_p, v_e); }
          if (!(true)) {
            _q102 = false;
            break Q103;
          }
        }
      }
      if (!(_q102)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ H: v_H.slice(), p: v_p, d: v_d }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface OppositeBinding {
  c: number;
}

const oppositeFacts: number[] = [];
let oppositeCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function opposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OppositeBinding> | null): number {
  const facts = oppositeFacts;
  let fired = 0;
  let changed = false;
  if (oppositeCands.length < sp.cells.length) oppositeCands = new Int32Array(sp.cells.length);
  const cands = oppositeCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_c = _a3[_i4];
    const _h5 = (b.grid[v_c] !== 0);
    if (!((!(_h5) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2)))) continue;
    const _h10 = cl.area.of[v_c];
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("opposite", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q6 = true;
    Q7: {
      const _a8 = sp.adj4[v_c];
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        const v_a = _a8[_i9];
        if (!((cl.area.of[v_a] === _h10))) continue;
        for (let _m11 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m11 !== 0; _m11 &= _m11 - 1) {
          const v_d = 31 - Math.clz32(_m11 & -_m11);
          let _c15: boolean = ((step(sp, v_a, v_d) === v_c) && (((b.cands[v_c] >> v_d) & 1) !== 0));
          if (_c15) {
            let _q12 = false;
            Q13: {
              for (let _m14 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m14 !== 0; _m14 &= _m14 - 1) {
                const v_e = 31 - Math.clz32(_m14 & -_m14);
                if (((v_e !== v_d) && (step(sp, v_c, v_e) === v_a))) {
                  _q12 = true;
                  break Q13;
                }
              }
            }
            _c15 = _q12;
          }
          if (!(_c15)) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q6 = false;
            break Q7;
          }
        }
      }
    }
    if (!(_q6)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
