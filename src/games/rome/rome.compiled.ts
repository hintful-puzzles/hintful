// Compiled by `npm run describe` from src/games/rome/rome.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, chain, clueAt, least, popcount, step } from "../../engine/describe-runtime.ts";

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
  let _q150 = true;
  Q151: {
    const _a152 = cl.area.parts;
    for (let _i153 = 0; _i153 < _a152.length; _i153++) {
      const v_r = _a152[_i153];
      let _g154 = true;
      const _s156: number[] = [];
      G155: {
        const _a157 = cl.area.cells[v_r];
        for (let _i158 = 0; _i158 < _a157.length; _i158++) {
          const v_c = _a157[_i158];
          const _h159 = (g[v_c] || -1);
          if (_s156.includes(_h159)) {
            _g154 = false;
            break G155;
          }
          _s156.push(_h159);
        }
      }
      if (!(_g154)) {
        _q150 = false;
        break Q151;
      }
    }
  }
  if (!(_q150)) return false;
  let _q160 = true;
  Q161: {
    const _a162 = sp.cells;
    for (let _i163 = 0; _i163 < _a162.length; _i163++) {
      const v_c = _a162[_i163];
      let _q164 = false;
      Q165: {
        const _a167 = chain(sp, (_x166: number) => (g[_x166] || -1), v_c);
        for (let _i168 = 0; _i168 < _a167.length; _i168++) {
          const v_g = _a167[_i168];
          const _h169 = (g[v_g] || -1);
          if ((_h169 === 5)) {
            _q164 = true;
            break Q165;
          }
        }
      }
      if (!(_q164)) {
        _q160 = false;
        break Q161;
      }
    }
  }
  if (!(_q160)) return false;
  for (let _k170 = 0; _k170 < cl.goal.at.length; _k170++) {
    const _at171 = cl.goal.at[_k170];
    if (!((((g[_at171] || -1) === 5) && (cl.area.cells[cl.area.of[_at171]].length === 1)))) return false;
  }
  return true;
}

export interface CullBinding {
  c: number;
  d: number;
  p: number;
}

const cullFacts: number[] = [];

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

export function loop(b: Marks, sp: GridSpace, fire: Fire<LoopBinding> | null): number {
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  if (loopCands.length < sp.cells.length) loopCands = new Int32Array(sp.cells.length);
  const cands = loopCands;
  cands.fill(-1);
  const _a22 = sp.cells;
  for (let _i23 = 0; _i23 < _a22.length; _i23++) {
    const v_c = _a22[_i23];
    const _h24 = (b.grid[v_c] !== 0);
    if (!(!(_h24))) continue;
    for (let _m25 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m25 !== 0; _m25 &= _m25 - 1) {
      const v_d = 31 - Math.clz32(_m25 & -_m25);
      L26: {
        const v_q = step(sp, v_c, v_d);
        if (!(((v_q !== -1) && (chain(sp, (_x27: number) => (b.grid[_x27] || -1), v_q).includes(v_c))))) break L26;
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

export function onlyHome(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyHomeBinding> | null): number {
  const facts = onlyHomeFacts;
  let fired = 0;
  let changed = false;
  if (onlyHomeCands.length < sp.cells.length) onlyHomeCands = new Int32Array(sp.cells.length);
  const cands = onlyHomeCands;
  cands.fill(-1);
  const _a39 = cl.area.parts;
  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
    const v_r = _a39[_i40];
    if (!((cl.area.cells[v_r].length === 4))) continue;
    for (let v_d = 1; v_d <= 4; v_d++) {
      let _q41 = false;
      Q42: {
        const _a43 = cl.area.cells[v_r];
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_c = _a43[_i44];
          const _h45 = (b.grid[v_c] || -1);
          if ((_h45 === v_d)) {
            _q41 = true;
            break Q42;
          }
        }
      }
      if (!(!(_q41))) continue;
      let _g46 = 0;
      G47: {
        const _a48 = cl.area.cells[v_r];
        for (let _i49 = 0; _i49 < _a48.length; _i49++) {
          const v_c = _a48[_i49];
          if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
          _g46++;
        }
      }
      L50: {
        const v_k = _g46;
        if (!((v_k < 2))) break L50;
        facts.length = 0;
        changed = false;
        let _c56: boolean = (v_k === 1);
        if (_c56) {
          let _q51 = true;
          Q52: {
            const _a53 = cl.area.cells[v_r];
            for (let _i54 = 0; _i54 < _a53.length; _i54++) {
              const v_c = _a53[_i54];
              if (!((((b.cands[v_c] >> v_d) & 1) !== 0))) continue;
              for (let _m55 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m55 !== 0; _m55 &= _m55 - 1) {
                const v_e = 31 - Math.clz32(_m55 & -_m55);
                if (!((v_e !== v_d))) continue;
                if ((((b.cands[v_c] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_e); changed = true; } else facts.push(STRIKE, v_c, v_e); }
                if (!(true)) {
                  _q51 = false;
                  break Q52;
                }
              }
            }
          }
          _c56 = _q51;
        }
        if (!(_c56)) return -1;
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

export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  const _a64 = cl.area.parts;
  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
    const v_r = _a64[_i65];
    const _a66 = cl.area.cells[v_r];
    for (let _i67 = 0; _i67 < _a66.length; _i67++) {
      const v_a = _a66[_i67];
      const _h68 = (b.grid[v_a] !== 0);
      if (!((!(_h68) && (popcount((cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a]))) === 2)))) continue;
      const _a69 = cl.area.cells[v_r];
      const _n70 = _i67;
      for (let _i71 = 0; _i71 < _n70; _i71++) {
        const v_b = _a69[_i71];
        const _h72 = (b.grid[v_b] !== 0);
        if (!((!(_h72) && ((cands[v_b] >= 0 ? cands[v_b] : (cands[v_b] = b.cands[v_b])) === (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])))))) continue;
        facts.length = 0;
        changed = false;
        let _q73 = true;
        Q74: {
          const _a75 = cl.area.cells[v_r];
          for (let _i76 = 0; _i76 < _a75.length; _i76++) {
            const v_p = _a75[_i76];
            if (!(((v_p !== v_a) && (v_p !== v_b)))) continue;
            for (let _m77 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m77 !== 0; _m77 &= _m77 - 1) {
              const v_d = 31 - Math.clz32(_m77 & -_m77);
              if ((((b.cands[v_p] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_d); changed = true; } else facts.push(STRIKE, v_p, v_d); }
              if (!(true)) {
                _q73 = false;
                break Q74;
              }
            }
          }
        }
        if (!(_q73)) return -1;
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

export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const _g103: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  if (reachCands.length < sp.cells.length) reachCands = new Int32Array(sp.cells.length);
  const cands = reachCands;
  cands.fill(-1);
  _g103.length = 0;
  G104: {
    const _a112 = sp.cells;
    for (let _i113 = 0; _i113 < _a112.length; _i113++) {
      const v_p = _a112[_i113];
      let _q114 = false;
      Q115: {
        const _a117 = chain(sp, (_x116: number) => (b.grid[_x116] || -1), v_p);
        for (let _i118 = 0; _i118 < _a117.length; _i118++) {
          const v_g = _a117[_i118];
          const _h119 = clueAt(cl.goal, v_g);
          if ((_h119 >= 0)) {
            _q114 = true;
            break Q115;
          }
        }
      }
      if (!(_q114)) continue;
      _g103.push(v_p);
    }
  }
  const v_H = _g103;
  const _a120 = sp.cells;
  for (let _i121 = 0; _i121 < _a120.length; _i121++) {
    const v_p = _a120[_i121];
    const _h122 = (b.grid[v_p] !== 0);
    if (!(!(_h122))) continue;
    for (let _m123 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m123 !== 0; _m123 &= _m123 - 1) {
      const v_d = 31 - Math.clz32(_m123 & -_m123);
      let _c131: boolean = (v_H.includes(step(sp, v_p, v_d)));
      if (_c131) {
        let _q124 = false;
        Q125: {
          const _a126 = sp.cells;
          for (let _i127 = 0; _i127 < _a126.length; _i127++) {
            const v_q = _a126[_i127];
            const _h128 = (b.grid[v_q] !== 0);
            if (!(!(_h128))) continue;
            const _h130 = (v_q !== v_p);
            for (let _m129 = (cands[v_q] >= 0 ? cands[v_q] : (cands[v_q] = b.cands[v_q])); _m129 !== 0; _m129 &= _m129 - 1) {
              const v_e = 31 - Math.clz32(_m129 & -_m129);
              if (!((_h130 || (v_e !== v_d)))) continue;
              if ((v_H.includes(step(sp, v_q, v_e)))) {
                _q124 = true;
                break Q125;
              }
            }
          }
        }
        _c131 = !(_q124);
      }
      if (!(_c131)) continue;
      facts.length = 0;
      changed = false;
      let _q132 = true;
      Q133: {
        for (let _m134 = (cands[v_p] >= 0 ? cands[v_p] : (cands[v_p] = b.cands[v_p])); _m134 !== 0; _m134 &= _m134 - 1) {
          const v_e = 31 - Math.clz32(_m134 & -_m134);
          if (!((v_e !== v_d))) continue;
          if ((((b.cands[v_p] >> v_e) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, v_e); changed = true; } else facts.push(STRIKE, v_p, v_e); }
          if (!(true)) {
            _q132 = false;
            break Q133;
          }
        }
      }
      if (!(_q132)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ H: v_H, p: v_p, d: v_d }, facts)) return 1;
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

export function opposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OppositeBinding> | null): number {
  const facts = oppositeFacts;
  let fired = 0;
  let changed = false;
  if (oppositeCands.length < sp.cells.length) oppositeCands = new Int32Array(sp.cells.length);
  const cands = oppositeCands;
  cands.fill(-1);
  const _a137 = sp.cells;
  for (let _i138 = 0; _i138 < _a137.length; _i138++) {
    const v_c = _a137[_i138];
    const _h139 = (b.grid[v_c] !== 0);
    if (!((!(_h139) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 2)))) continue;
    const _h144 = cl.area.of[v_c];
    facts.length = 0;
    changed = false;
    let _q140 = true;
    Q141: {
      const _a142 = sp.adj4[v_c];
      for (let _i143 = 0; _i143 < _a142.length; _i143++) {
        const v_a = _a142[_i143];
        if (!((cl.area.of[v_a] === _h144))) continue;
        for (let _m145 = (cands[v_a] >= 0 ? cands[v_a] : (cands[v_a] = b.cands[v_a])); _m145 !== 0; _m145 &= _m145 - 1) {
          const v_d = 31 - Math.clz32(_m145 & -_m145);
          let _c149: boolean = ((step(sp, v_a, v_d) === v_c) && (((b.cands[v_c] >> v_d) & 1) !== 0));
          if (_c149) {
            let _q146 = false;
            Q147: {
              for (let _m148 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m148 !== 0; _m148 &= _m148 - 1) {
                const v_e = 31 - Math.clz32(_m148 & -_m148);
                if (((v_e !== v_d) && (step(sp, v_c, v_e) === v_a))) {
                  _q146 = true;
                  break Q147;
                }
              }
            }
            _c149 = _q146;
          }
          if (!(_c149)) continue;
          if ((((b.cands[v_a] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_a, v_d); changed = true; } else facts.push(STRIKE, v_a, v_d); }
          if (!(true)) {
            _q140 = false;
            break Q141;
          }
        }
      }
    }
    if (!(_q140)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}
