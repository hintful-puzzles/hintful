// Compiled by `npm run describe` from src/games/rome/rome.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, chain, chainHas, clueAt, least, popcount, step } from "../../engine/describe-runtime.ts";

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
  let _q156 = true;
  Q157: {
    const _a158 = cl.area.parts;
    for (let _i159 = 0; _i159 < _a158.length; _i159++) {
      const v_r = _a158[_i159];
      let _g160 = true;
      const _s162: number[] = [];
      G161: {
        const _a163 = cl.area.cells[v_r];
        for (let _i164 = 0; _i164 < _a163.length; _i164++) {
          const v_c = _a163[_i164];
          const _h165 = (g[v_c] || -1);
          if (_s162.includes(_h165)) {
            _g160 = false;
            break G161;
          }
          _s162.push(_h165);
        }
      }
      if (!(_g160)) {
        _q156 = false;
        break Q157;
      }
    }
  }
  if (!(_q156)) return false;
  let _q166 = true;
  Q167: {
    const _a168 = sp.cells;
    for (let _i169 = 0; _i169 < _a168.length; _i169++) {
      const v_c = _a168[_i169];
      let _q170 = false;
      Q171: {
        const _a174 = chain(sp, (_x172: number): number => { if (_x172 < 0) return -1; const _d173 = (g[_x172] || -1); if (_d173 < 0) return -1; return step(sp, _x172, _d173); }, v_c);
        for (let _i175 = 0; _i175 < _a174.length; _i175++) {
          const v_g = _a174[_i175];
          const _h176 = (g[v_g] || -1);
          if ((_h176 === 5)) {
            _q170 = true;
            break Q171;
          }
        }
      }
      if (!(_q170)) {
        _q166 = false;
        break Q167;
      }
    }
  }
  if (!(_q166)) return false;
  for (let _k177 = 0; _k177 < cl.goal.at.length; _k177++) {
    const _at178 = cl.goal.at[_k177];
    if (!((((g[_at178] || -1) === 5) && (cl.area.cells[cl.area.of[_at178]].length === 1)))) return false;
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
export function cull(b: Marks, _sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<CullBinding> | null): number {
  const facts = cullFacts;
  let fired = 0;
  let changed = false;
  const _h7 = (b.grid[v_c] !== 0);
  const _h8 = (b.grid[v_c] || -1);
  if (!(_h7)) return 0;
  const v_d = _h8;
  const _a9 = cl.area.cells[cl.area.of[v_c]];
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_p = _a9[_i10];
    if (!((v_p !== v_c))) continue;
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
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_c = _a23[_i24];
    const _h25 = (b.grid[v_c] !== 0);
    if (!(!(_h25))) continue;
    for (let _m26 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m26 !== 0; _m26 &= _m26 - 1) {
      const v_d = 31 - Math.clz32(_m26 & -_m26);
      L27: {
        const v_q = step(sp, v_c, v_d);
        if (!(((v_q !== -1) && chainHas(sp, b, (_x28: number): number => { if (_x28 < 0) return -1; const _d29 = (b.grid[_x28] || -1); if (_d29 < 0) return -1; return step(sp, _x28, _d29); }, v_c, v_q)))) break L27;
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
  const _a41 = cl.area.parts;
  for (let _i42 = 0; _i42 < _a41.length; _i42++) {
    const v_r = _a41[_i42];
    if (!((cl.area.cells[v_r].length === 4))) continue;
    for (let v_d = 1; v_d <= 4; v_d++) {
      let _q43 = false;
      Q44: {
        const _a45 = cl.area.cells[v_r];
        for (let _i46 = 0; _i46 < _a45.length; _i46++) {
          const v_c = _a45[_i46];
          const _h47 = (b.grid[v_c] || -1);
          if ((_h47 === v_d)) {
            _q43 = true;
            break Q44;
          }
        }
      }
      if (!(!(_q43))) continue;
      let _g48 = 0;
      G49: {
        const _a50 = cl.area.cells[v_r];
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_c = _a50[_i51];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g48++;
        }
      }
      L52: {
        const v_k = _g48;
        if (!((v_k < 2))) break L52;
        facts.length = 0;
        changed = false;
        let _c58: boolean = (v_k === 1);
        if (_c58) {
          let _q53 = true;
          Q54: {
            const _a55 = cl.area.cells[v_r];
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              const v_c = _a55[_i56];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              for (let _m57 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m57 !== 0; _m57 &= _m57 - 1) {
                const v_e = 31 - Math.clz32(_m57 & -_m57);
                if (!((v_e !== v_d))) continue;
                if ((((b.cands[v_c] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
                if (!(true)) {
                  _q53 = false;
                  break Q54;
                }
              }
            }
          }
          _c58 = _q53;
        }
        if (!(_c58)) return -1;
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
  const _a66 = cl.area.parts;
  for (let _i67 = 0; _i67 < _a66.length; _i67++) {
    const v_r = _a66[_i67];
    const _a68 = cl.area.cells[v_r];
    for (let _i69 = 0; _i69 < _a68.length; _i69++) {
      const v_a = _a68[_i69];
      const _h70 = (b.grid[v_a] !== 0);
      if (!((!(_h70) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
      const _a71 = cl.area.cells[v_r];
      const _n72 = _i69;
      for (let _i73 = 0; _i73 < _n72; _i73++) {
        const v_b = _a71[_i73];
        const _h74 = (b.grid[v_b] !== 0);
        if (!((!(_h74) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
        facts.length = 0;
        changed = false;
        let _q75 = true;
        Q76: {
          const _a77 = cl.area.cells[v_r];
          for (let _i78 = 0; _i78 < _a77.length; _i78++) {
            const v_p = _a77[_i78];
            if (!(((v_p !== v_a) && (v_p !== v_b)))) continue;
            for (let _m79 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m79 !== 0; _m79 &= _m79 - 1) {
              const v_d = 31 - Math.clz32(_m79 & -_m79);
              if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
              if (!(true)) {
                _q75 = false;
                break Q76;
              }
            }
          }
        }
        if (!(_q75)) return -1;
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
  const _g107: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  if (reachCands.length < sp.cells.length) reachCands = new Int32Array(sp.cells.length);
  const cands = reachCands;
  cands.fill(-1);
  _g107.length = 0;
  G108: {
    const _a117 = sp.cells;
    for (let _i118 = 0; _i118 < _a117.length; _i118++) {
      const v_p = _a117[_i118];
      let _q119 = false;
      Q120: {
        const _a123 = chain(sp, (_x121: number): number => { if (_x121 < 0) return -1; const _d122 = (b.grid[_x121] || -1); if (_d122 < 0) return -1; return step(sp, _x121, _d122); }, v_p);
        for (let _i124 = 0; _i124 < _a123.length; _i124++) {
          const v_g = _a123[_i124];
          const _h125 = clueAt(cl.goal, v_g);
          if ((_h125 >= 0)) {
            _q119 = true;
            break Q120;
          }
        }
      }
      if (!(_q119)) continue;
      _g107.push(v_p);
    }
  }
  const v_H = _g107;
  const _a126 = sp.cells;
  for (let _i127 = 0; _i127 < _a126.length; _i127++) {
    const v_p = _a126[_i127];
    const _h128 = (b.grid[v_p] !== 0);
    if (!(!(_h128))) continue;
    for (let _m129 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m129 !== 0; _m129 &= _m129 - 1) {
      const v_d = 31 - Math.clz32(_m129 & -_m129);
      let _c137: boolean = (v_H.includes(step(sp, v_p, v_d)));
      if (_c137) {
        let _q130 = false;
        Q131: {
          const _a132 = sp.cells;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_q = _a132[_i133];
            const _h134 = (b.grid[v_q] !== 0);
            if (!(!(_h134))) continue;
            const _h136 = (v_q !== v_p);
            for (let _m135 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m135 !== 0; _m135 &= _m135 - 1) {
              const v_e = 31 - Math.clz32(_m135 & -_m135);
              if (!((_h136 || (v_e !== v_d)))) continue;
              if ((v_H.includes(step(sp, v_q, v_e)))) {
                _q130 = true;
                break Q131;
              }
            }
          }
        }
        _c137 = !(_q130);
      }
      if (!(_c137)) continue;
      facts.length = 0;
      changed = false;
      let _q138 = true;
      Q139: {
        for (let _m140 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m140 !== 0; _m140 &= _m140 - 1) {
          const v_e = 31 - Math.clz32(_m140 & -_m140);
          if (!((v_e !== v_d))) continue;
          if ((((b.cands[v_p] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_e); changed = true; } else facts.push(STRIKE, v_p, v_e); }
          if (!(true)) {
            _q138 = false;
            break Q139;
          }
        }
      }
      if (!(_q138)) return -1;
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
  const _a143 = sp.cells;
  for (let _i144 = 0; _i144 < _a143.length; _i144++) {
    const v_c = _a143[_i144];
    const _h145 = (b.grid[v_c] !== 0);
    if (!((!(_h145) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2)))) continue;
    const _h150 = cl.area.of[v_c];
    facts.length = 0;
    changed = false;
    let _q146 = true;
    Q147: {
      const _a148 = sp.adj4[v_c];
      for (let _i149 = 0; _i149 < _a148.length; _i149++) {
        const v_a = _a148[_i149];
        if (!((cl.area.of[v_a] === _h150))) continue;
        for (let _m151 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m151 !== 0; _m151 &= _m151 - 1) {
          const v_d = 31 - Math.clz32(_m151 & -_m151);
          let _c155: boolean = ((step(sp, v_a, v_d) === v_c) && (((b.cands[v_c] >> v_d) & 1) !== 0));
          if (_c155) {
            let _q152 = false;
            Q153: {
              for (let _m154 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m154 !== 0; _m154 &= _m154 - 1) {
                const v_e = 31 - Math.clz32(_m154 & -_m154);
                if (((v_e !== v_d) && (step(sp, v_c, v_e) === v_a))) {
                  _q152 = true;
                  break Q153;
                }
              }
            }
            _c155 = _q152;
          }
          if (!(_c155)) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q146 = false;
            break Q147;
          }
        }
      }
    }
    if (!(_q146)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
