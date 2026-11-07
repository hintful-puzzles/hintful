// Compiled by `npm run describe` from src/games/seismic/seismic.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, least, popcount, rangeMask } from "../../engine/describe-runtime.ts";

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
  const _h112 = (cl.mode === 0);
  const _h115 = (cl.mode === 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q95 = true;
  Q96: {
    const _a97 = cl.area.parts;
    for (let _i98 = 0; _i98 < _a97.length; _i98++) {
      const v_r = _a97[_i98];
      let _g99 = true;
      const _s101: number[] = [];
      G100: {
        const _a102 = cl.area.cells[v_r];
        for (let _i103 = 0; _i103 < _a102.length; _i103++) {
          const v_c = _a102[_i103];
          const _h104 = (g[v_c] || -1);
          if (_s101.includes(_h104)) {
            _g99 = false;
            break G100;
          }
          _s101.push(_h104);
        }
      }
      if (!(_g99)) {
        _q95 = false;
        break Q96;
      }
    }
  }
  if (!(_q95)) return false;
  let _q105 = true;
  Q106: {
    const _a107 = sp.cells;
    for (let _i108 = 0; _i108 < _a107.length; _i108++) {
      const v_a = _a107[_i108];
      const _h111 = (g[v_a] || -1);
      const _h113 = ((v_a / sp.w) | 0);
      const _h114 = (v_a % sp.w);
      const _a109 = sp.cells;
      for (let _i110 = 0; _i110 < _a109.length; _i110++) {
        const v_b = _a109[_i110];
        if (!(((v_a !== v_b) && ((_h112 && (((_h113 === ((v_b / sp.w) | 0)) && (Math.abs((_h114 - (v_b % sp.w))) <= _h111)) || ((_h114 === (v_b % sp.w)) && (Math.abs((_h113 - ((v_b / sp.w) | 0))) <= _h111)))) || ((_h115 && (Math.abs((_h114 - (v_b % sp.w))) <= 1)) && (Math.abs((_h113 - ((v_b / sp.w) | 0))) <= 1)))))) continue;
        const _h116 = (g[v_b] || -1);
        if (!((_h116 !== _h111))) {
          _q105 = false;
          break Q106;
        }
      }
    }
  }
  if (!(_q105)) return false;
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
  const _a16 = sp.cells;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_c = _a16[_i17];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c19: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c19) {
      const _t18 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t18); changed = true; } else facts.push(PLACE, v_c, _t18); }
      _c19 = true;
    }
    if (!(_c19)) return -1;
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
  const _a32 = cl.area.parts;
  for (let _i33 = 0; _i33 < _a32.length; _i33++) {
    const v_r = _a32[_i33];
    const _t34 = cl.area.cells[v_r].length;
    for (let v_n = 1; v_n <= _t34; v_n++) {
      let _q35 = false;
      Q36: {
        const _a37 = cl.area.cells[v_r];
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_c = _a37[_i38];
          if (((b.grid[v_c] || -1) === v_n)) {
            _q35 = true;
            break Q36;
          }
        }
      }
      if (!(!(_q35))) continue;
      let _g39 = 0;
      G40: {
        const _a41 = cl.area.cells[v_r];
        for (let _i42 = 0; _i42 < _a41.length; _i42++) {
          const v_c = _a41[_i42];
          if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
          _g39++;
        }
      }
      L43: {
        const v_k = _g39;
        if (!((v_k < 2))) break L43;
        facts.length = 0;
        changed = false;
        let _c49: boolean = (v_k === 1);
        if (_c49) {
          let _g44 = -1;
          let _n46 = 0;
          G45: {
            const _a47 = cl.area.cells[v_r];
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_c = _a47[_i48];
              if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
              if (++_n46 === 2) {
                _g44 = -1;
                break G45;
              }
              _g44 = v_c;
            }
          }
          if (!(b.grid[_g44] !== 0)) { if (fire === null) { b.placeAt(_g44, v_n); changed = true; } else facts.push(PLACE, _g44, v_n); }
          _c49 = true;
        }
        if (!(_c49)) return -1;
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

const starveFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function starve(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarveBinding> | null): number {
  const _g72: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  const _h90 = (cl.mode === 0);
  const _h93 = (cl.mode === 1);
  const _a64 = cl.area.parts;
  for (let _i65 = 0; _i65 < _a64.length; _i65++) {
    const v_r = _a64[_i65];
    const _t66 = cl.area.cells[v_r].length;
    for (let v_n = 1; v_n <= _t66; v_n++) {
      let _q67 = false;
      Q68: {
        const _a69 = cl.area.cells[v_r];
        for (let _i70 = 0; _i70 < _a69.length; _i70++) {
          const v_c = _a69[_i70];
          const _h71 = (b.grid[v_c] || -1);
          if ((_h71 === v_n)) {
            _q67 = true;
            break Q68;
          }
        }
      }
      if (!(!(_q67))) continue;
      _g72.length = 0;
      G73: {
        const _a76 = cl.area.cells[v_r];
        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
          const v_h = _a76[_i77];
          const _h78 = (b.grid[v_h] !== 0);
          if (!((!(_h78) && (((b.cands[v_h] >> v_n) & 1) !== 0)))) continue;
          _g72.push(v_h);
        }
      }
      L79: {
        const v_H = _g72;
        const _h80 = v_H.length;
        if (!((_h80 > 0))) break L79;
        facts.length = 0;
        changed = false;
        let _q81 = true;
        Q82: {
          const _a83 = sp.cells;
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_c = _a83[_i84];
            const _h85 = (b.grid[v_c] !== 0);
            const _h91 = ((v_c / sp.w) | 0);
            const _h92 = (v_c % sp.w);
            let _c94: boolean = (((cl.area.of[v_c] !== v_r) && !(_h85)) && (((b.cands[v_c] >> v_n) & 1) !== 0));
            if (_c94) {
              let _q86 = true;
              Q87: {
                const _a88 = v_H;
                for (let _i89 = 0; _i89 < _a88.length; _i89++) {
                  const v_h = _a88[_i89];
                  if (!(((v_c !== v_h) && ((_h90 && (((_h91 === ((v_h / sp.w) | 0)) && (Math.abs((_h92 - (v_h % sp.w))) <= v_n)) || ((_h92 === (v_h % sp.w)) && (Math.abs((_h91 - ((v_h / sp.w) | 0))) <= v_n)))) || ((_h93 && (Math.abs((_h92 - (v_h % sp.w))) <= 1)) && (Math.abs((_h91 - ((v_h / sp.w) | 0))) <= 1)))))) {
                    _q86 = false;
                    break Q87;
                  }
                }
              }
              _c94 = _q86;
            }
            if (!(_c94)) continue;
            if ((((b.cands[v_c] >> v_n) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
            if (!(true)) {
              _q81 = false;
              break Q82;
            }
          }
        }
        if (!(_q81)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ r: v_r, n: v_n, H: v_H }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
