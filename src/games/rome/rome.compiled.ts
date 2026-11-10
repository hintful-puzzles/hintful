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
  let _q209 = true;
  Q210: {
    const _a211 = cl.area.parts;
    for (let _i212 = 0; _i212 < _a211.length; _i212++) {
      const v_r = _a211[_i212];
      let _g213 = true;
      const _s215: number[] = [];
      G214: {
        const _a216 = cl.area.cells[v_r];
        for (let _i217 = 0; _i217 < _a216.length; _i217++) {
          const v_c = _a216[_i217];
          const _h218 = (g[v_c] || -1);
          if (_s215.includes(_h218)) {
            _g213 = false;
            break G214;
          }
          _s215.push(_h218);
        }
      }
      if (!(_g213)) {
        _q209 = false;
        break Q210;
      }
    }
  }
  if (!(_q209)) return false;
  let _q219 = true;
  Q220: {
    const _a221 = sp.cells;
    for (let _i222 = 0; _i222 < _a221.length; _i222++) {
      const v_c = _a221[_i222];
      let _q223 = false;
      Q224: {
        const _a227 = chain(sp, (_x225: number): number => { if (_x225 < 0) return -1; const _d226 = (g[_x225] || -1); if (_d226 < 0) return -1; return step(sp, _x225, _d226); }, v_c);
        for (let _i228 = 0; _i228 < _a227.length; _i228++) {
          const v_g = _a227[_i228];
          const _h229 = (g[v_g] || -1);
          if ((_h229 === 5)) {
            _q223 = true;
            break Q224;
          }
        }
      }
      if (!(_q223)) {
        _q219 = false;
        break Q220;
      }
    }
  }
  if (!(_q219)) return false;
  for (let _k230 = 0; _k230 < cl.goal.at.length; _k230++) {
    const _at231 = cl.goal.at[_k230];
    if (!((((g[_at231] || -1) === 5) && (cl.area.cells[cl.area.of[_at231]].length === 1)))) return false;
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
  const _m1_0 = b.made[0];
  const _h7 = (b.grid[v_c] !== 0);
  const _h8 = (b.grid[v_c] || -1);
  if (!(_h7)) return 0;
  const v_d = _h8;
  const _a9 = cl.area.cells[cl.area.of[v_c]];
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_p = _a9[_i10];
    if (!((v_p !== v_c))) continue;
    if (b.made[0] !== _m1_0) {
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
  const _a13 = sp.cells;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_c = _a13[_i14];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c16: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c16) {
      const _t15 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t15); changed = true; } else facts.push(PLACE, v_c, _t15); }
      _c16 = true;
    }
    if (!(_c16)) return -1;
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
  const _a23 = sp.cells;
  R1:
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_c = _a23[_i24];
    const _m27_0 = b.made[0];
    const _h25 = (b.grid[v_c] !== 0);
    if (!(!(_h25))) continue;
    const _m30_1 = b.made[1];
    R2:
    for (let _m26 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m26 !== 0; _m26 &= _m26 - 1) {
      const v_d = 31 - Math.clz32(_m26 & -_m26);
      L27: {
        const v_q = step(sp, v_c, v_d);
        if (!(((v_q !== -1) && chainHas(sp, b, (_x28: number): number => { if (_x28 < 0) return -1; const _d29 = (b.grid[_x28] || -1); if (_d29 < 0) return -1; return step(sp, _x28, _d29); }, v_c, v_q)))) break L27;
        if (b.made[0] !== _m27_0 || b.made[1] !== _m30_1) {
          if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("loop", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (((b.cands[v_c] >> v_d) & 1) !== 0), (v_q === step(sp, v_c, v_d)), ((v_q !== -1) && chainHas(sp, b, (_x30: number): number => { if (_x30 < 0) return -1; const _d31 = (b.grid[_x30] || -1); if (_d31 < 0) return -1; return step(sp, _x30, _d31); }, v_c, v_q))], ["c in", "where of c", "d in", "q =", "where of q"]);
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
  const _a43 = cl.area.parts;
  for (let _i44 = 0; _i44 < _a43.length; _i44++) {
    const v_r = _a43[_i44];
    if (!((cl.area.cells[v_r].length === 4))) continue;
    for (let v_d = 1; v_d <= 4; v_d++) {
      let _q45 = false;
      Q46: {
        const _a47 = cl.area.cells[v_r];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_c = _a47[_i48];
          const _h49 = (b.grid[v_c] || -1);
          if ((_h49 === v_d)) {
            _q45 = true;
            break Q46;
          }
        }
      }
      if (!(!(_q45))) continue;
      let _g50 = 0;
      G51: {
        const _a52 = cl.area.cells[v_r];
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_c = _a52[_i53];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g50++;
        }
      }
      L54: {
        const v_k = _g50;
        if (!((v_k < 2))) break L54;
        if (import.meta.env.DEV && staleChecking) {
          let _q55 = false;
          Q56: {
            const _a57 = cl.area.cells[v_r];
            for (let _i58 = 0; _i58 < _a57.length; _i58++) {
              const v_c = _a57[_i58];
              if (((b.grid[v_c] || -1) === v_d)) {
                _q55 = true;
                break Q56;
              }
            }
          }
          let _g59 = 0;
          G60: {
            const _a61 = cl.area.cells[v_r];
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_c = _a61[_i62];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              _g59++;
            }
          }
          freshBinding("onlyHome", [(cl.area.parts.includes(v_r)), (cl.area.cells[v_r].length === 4), ((1 <= v_d) && (v_d <= 4)), !(_q55), (v_k === _g59), (v_k < 2)], ["r in", "where of r", "d in", "where of d", "k =", "where of k"]);
        }
        facts.length = 0;
        changed = false;
        let _c68: boolean = (v_k === 1);
        if (_c68) {
          let _q63 = true;
          Q64: {
            const _a65 = cl.area.cells[v_r];
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              const v_c = _a65[_i66];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              for (let _m67 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m67 !== 0; _m67 &= _m67 - 1) {
                const v_e = 31 - Math.clz32(_m67 & -_m67);
                if (!((v_e !== v_d))) continue;
                if ((((b.cands[v_c] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
                if (!(true)) {
                  _q63 = false;
                  break Q64;
                }
              }
            }
          }
          _c68 = _q63;
        }
        if (!(_c68)) return -1;
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
  const _a76 = cl.area.parts;
  for (let _i77 = 0; _i77 < _a76.length; _i77++) {
    const v_r = _a76[_i77];
    const _a78 = cl.area.cells[v_r];
    R2:
    for (let _i79 = 0; _i79 < _a78.length; _i79++) {
      const v_a = _a78[_i79];
      const _m72_0 = b.made[0];
      const _m72_1 = b.made[1];
      const _h80 = (b.grid[v_a] !== 0);
      if (!((!(_h80) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
      const _a81 = cl.area.cells[v_r];
      const _n82 = _i79;
      for (let _i83 = 0; _i83 < _n82; _i83++) {
        const v_b = _a81[_i83];
        const _h84 = (b.grid[v_b] !== 0);
        if (!((!(_h84) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
        if (b.made[0] !== _m72_0 || b.made[1] !== _m72_1) {
          if (!((!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) { continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          freshBinding("pair", [(cl.area.parts.includes(v_r)), (cl.area.cells[v_r].includes(v_a)), (!((b.grid[v_a] !== 0)) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)), (before(v_a, cl.area.cells[v_r]).includes(v_b)), (!((b.grid[v_b] !== 0)) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))))], ["r in", "a in", "where of a", "b in", "where of b"]);
        }
        facts.length = 0;
        changed = false;
        let _q85 = true;
        Q86: {
          const _a87 = cl.area.cells[v_r];
          for (let _i88 = 0; _i88 < _a87.length; _i88++) {
            const v_p = _a87[_i88];
            if (!(((v_p !== v_a) && (v_p !== v_b)))) continue;
            for (let _m89 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m89 !== 0; _m89 &= _m89 - 1) {
              const v_d = 31 - Math.clz32(_m89 & -_m89);
              if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
              if (!(true)) {
                _q85 = false;
                break Q86;
              }
            }
          }
        }
        if (!(_q85)) return -1;
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
  const _g117: number[] = [];
  const _g149: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  if (reachCands.length < sp.cells.length) reachCands = new Int32Array(sp.cells.length);
  const cands = reachCands;
  cands.fill(-1);
  const _m88_0 = b.made[0];
  _g117.length = 0;
  G118: {
    const _a127 = sp.cells;
    for (let _i128 = 0; _i128 < _a127.length; _i128++) {
      const v_p = _a127[_i128];
      let _q129 = false;
      Q130: {
        const _a133 = chain(sp, (_x131: number): number => { if (_x131 < 0) return -1; const _d132 = (b.grid[_x131] || -1); if (_d132 < 0) return -1; return step(sp, _x131, _d132); }, v_p);
        for (let _i134 = 0; _i134 < _a133.length; _i134++) {
          const v_g = _a133[_i134];
          const _h135 = clueAt(cl.goal, v_g);
          if ((_h135 >= 0)) {
            _q129 = true;
            break Q130;
          }
        }
      }
      if (!(_q129)) continue;
      _g117.push(v_p);
    }
  }
  const v_H = _g117;
  const _mm140 = memberMarks(v_H);
  const _a136 = sp.cells;
  R1:
  for (let _i137 = 0; _i137 < _a136.length; _i137++) {
    const v_p = _a136[_i137];
    const _h138 = (b.grid[v_p] !== 0);
    if (!(!(_h138))) continue;
    const _m98_1 = b.made[1];
    R2:
    for (let _m139 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m139 !== 0; _m139 &= _m139 - 1) {
      const v_d = 31 - Math.clz32(_m139 & -_m139);
      let _c148: boolean = (_mm140[step(sp, v_p, v_d) + 1] === 1);
      if (_c148) {
        let _q141 = false;
        Q142: {
          const _a143 = sp.cells;
          for (let _i144 = 0; _i144 < _a143.length; _i144++) {
            const v_q = _a143[_i144];
            const _h145 = (b.grid[v_q] !== 0);
            if (!(!(_h145))) continue;
            const _h147 = (v_q !== v_p);
            for (let _m146 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m146 !== 0; _m146 &= _m146 - 1) {
              const v_e = 31 - Math.clz32(_m146 & -_m146);
              if (!((_h147 || (v_e !== v_d)))) continue;
              if ((_mm140[step(sp, v_q, v_e) + 1] === 1)) {
                _q141 = true;
                break Q142;
              }
            }
          }
        }
        _c148 = !(_q141);
      }
      if (!(_c148)) continue;
      if (b.made[0] !== _m88_0 || b.made[1] !== _m98_1) {
        _g149.length = 0;
        G150: {
          const _a159 = sp.cells;
          for (let _i160 = 0; _i160 < _a159.length; _i160++) {
            const v_p = _a159[_i160];
            let _q161 = false;
            Q162: {
              const _a165 = chain(sp, (_x163: number): number => { if (_x163 < 0) return -1; const _d164 = (b.grid[_x163] || -1); if (_d164 < 0) return -1; return step(sp, _x163, _d164); }, v_p);
              for (let _i166 = 0; _i166 < _a165.length; _i166++) {
                const v_g = _a165[_i166];
                if ((clueAt(cl.goal, v_g) >= 0)) {
                  _q161 = true;
                  break Q162;
                }
              }
            }
            if (!(_q161)) continue;
            _g149.push(v_p);
          }
        }
        if (!(sameSet(v_H, _g149))) { return fired; }
        if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
        if (!((((b.cands[v_p] >> v_d) & 1) !== 0))) { continue R2; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g167: number[] = [];
        G168: {
          const _a177 = sp.cells;
          for (let _i178 = 0; _i178 < _a177.length; _i178++) {
            const v_p = _a177[_i178];
            let _q179 = false;
            Q180: {
              const _a183 = chain(sp, (_x181: number): number => { if (_x181 < 0) return -1; const _d182 = (b.grid[_x181] || -1); if (_d182 < 0) return -1; return step(sp, _x181, _d182); }, v_p);
              for (let _i184 = 0; _i184 < _a183.length; _i184++) {
                const v_g = _a183[_i184];
                if ((clueAt(cl.goal, v_g) >= 0)) {
                  _q179 = true;
                  break Q180;
                }
              }
            }
            if (!(_q179)) continue;
            _g167.push(v_p);
          }
        }
        let _c190: boolean = (v_H.includes(step(sp, v_p, v_d)));
        if (_c190) {
          let _q185 = false;
          Q186: {
            const _a187 = sp.cells;
            for (let _i188 = 0; _i188 < _a187.length; _i188++) {
              const v_q = _a187[_i188];
              if (!(!((b.grid[v_q] !== 0)))) continue;
              for (let _m189 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m189 !== 0; _m189 &= _m189 - 1) {
                const v_e = 31 - Math.clz32(_m189 & -_m189);
                if (!(((v_q !== v_p) || (v_e !== v_d)))) continue;
                if ((v_H.includes(step(sp, v_q, v_e)))) {
                  _q185 = true;
                  break Q186;
                }
              }
            }
          }
          _c190 = !(_q185);
        }
        freshBinding("reach", [sameSet(v_H, _g167), (sp.cells.includes(v_p)), !((b.grid[v_p] !== 0)), (((b.cands[v_p] >> v_d) & 1) !== 0), _c190], ["H =", "p in", "where of p", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      let _q191 = true;
      Q192: {
        for (let _m193 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m193 !== 0; _m193 &= _m193 - 1) {
          const v_e = 31 - Math.clz32(_m193 & -_m193);
          if (!((v_e !== v_d))) continue;
          if ((((b.cands[v_p] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_e); changed = true; } else facts.push(STRIKE, v_p, v_e); }
          if (!(true)) {
            _q191 = false;
            break Q192;
          }
        }
      }
      if (!(_q191)) return -1;
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
  const _a196 = sp.cells;
  for (let _i197 = 0; _i197 < _a196.length; _i197++) {
    const v_c = _a196[_i197];
    const _h198 = (b.grid[v_c] !== 0);
    if (!((!(_h198) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2)))) continue;
    const _h203 = cl.area.of[v_c];
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("opposite", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _q199 = true;
    Q200: {
      const _a201 = sp.adj4[v_c];
      for (let _i202 = 0; _i202 < _a201.length; _i202++) {
        const v_a = _a201[_i202];
        if (!((cl.area.of[v_a] === _h203))) continue;
        for (let _m204 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m204 !== 0; _m204 &= _m204 - 1) {
          const v_d = 31 - Math.clz32(_m204 & -_m204);
          let _c208: boolean = ((step(sp, v_a, v_d) === v_c) && (((b.cands[v_c] >> v_d) & 1) !== 0));
          if (_c208) {
            let _q205 = false;
            Q206: {
              for (let _m207 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m207 !== 0; _m207 &= _m207 - 1) {
                const v_e = 31 - Math.clz32(_m207 & -_m207);
                if (((v_e !== v_d) && (step(sp, v_c, v_e) === v_a))) {
                  _q205 = true;
                  break Q206;
                }
              }
            }
            _c208 = _q205;
          }
          if (!(_c208)) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q199 = false;
            break Q200;
          }
        }
      }
    }
    if (!(_q199)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
