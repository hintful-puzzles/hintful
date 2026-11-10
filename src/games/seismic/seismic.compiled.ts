// Compiled by `npm run describe` from src/games/seismic/seismic.description.yaml: edit that, not this.

import { type Fire, type GridSpace, type Marks, type Partition, PLACE, STRIKE, freshBinding, least, popcount, rangeMask, sameSet, staleChecking } from "../../engine/describe-runtime.ts";

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
  const _h130 = (cl.mode === 0);
  const _h133 = (cl.mode === 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q113 = true;
  Q114: {
    const _a115 = cl.area.parts;
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_r = _a115[_i116];
      let _g117 = true;
      const _s119: number[] = [];
      G118: {
        const _a120 = cl.area.cells[v_r];
        for (let _i121 = 0; _i121 < _a120.length; _i121++) {
          const v_c = _a120[_i121];
          const _h122 = (g[v_c] || -1);
          if (_s119.includes(_h122)) {
            _g117 = false;
            break G118;
          }
          _s119.push(_h122);
        }
      }
      if (!(_g117)) {
        _q113 = false;
        break Q114;
      }
    }
  }
  if (!(_q113)) return false;
  let _q123 = true;
  Q124: {
    const _a125 = sp.cells;
    for (let _i126 = 0; _i126 < _a125.length; _i126++) {
      const v_a = _a125[_i126];
      const _h129 = (g[v_a] || -1);
      const _h131 = ((v_a / sp.w) | 0);
      const _h132 = (v_a % sp.w);
      const _a127 = sp.cells;
      for (let _i128 = 0; _i128 < _a127.length; _i128++) {
        const v_b = _a127[_i128];
        if (!(((v_a !== v_b) && ((_h130 && (((_h131 === ((v_b / sp.w) | 0)) && (Math.abs((_h132 - (v_b % sp.w))) <= _h129)) || ((_h132 === (v_b % sp.w)) && (Math.abs((_h131 - ((v_b / sp.w) | 0))) <= _h129)))) || ((_h133 && (Math.abs((_h132 - (v_b % sp.w))) <= 1)) && (Math.abs((_h131 - ((v_b / sp.w) | 0))) <= 1)))))) continue;
        const _h134 = (g[v_b] || -1);
        if (!((_h134 !== _h129))) {
          _q123 = false;
          break Q124;
        }
      }
    }
  }
  if (!(_q123)) return false;
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
  const _m1_0 = b.made[0];
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
    if (b.made[0] !== _m1_0) {
      if (!((v_n === (b.grid[v_c] || -1)))) { return cull(b, sp, cl, v_c, fire) | fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
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
  const _a16 = sp.cells;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_c = _a16[_i17];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("lone", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
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
        if (import.meta.env.DEV && staleChecking) {
          let _q44 = false;
          Q45: {
            const _a46 = cl.area.cells[v_r];
            for (let _i47 = 0; _i47 < _a46.length; _i47++) {
              const v_c = _a46[_i47];
              if (((b.grid[v_c] || -1) === v_n)) {
                _q44 = true;
                break Q45;
              }
            }
          }
          let _g48 = 0;
          G49: {
            const _a50 = cl.area.cells[v_r];
            for (let _i51 = 0; _i51 < _a50.length; _i51++) {
              const v_c = _a50[_i51];
              if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
              _g48++;
            }
          }
          freshBinding("areaSingle", [(cl.area.parts.includes(v_r)), ((1 <= v_n) && (v_n <= cl.area.cells[v_r].length)), !(_q44), (v_k === _g48), (v_k < 2)], ["r in", "n in", "where of n", "k =", "where of k"]);
        }
        facts.length = 0;
        changed = false;
        let _c57: boolean = (v_k === 1);
        if (_c57) {
          let _g52 = -1;
          let _n54 = 0;
          G53: {
            const _a55 = cl.area.cells[v_r];
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              const v_c = _a55[_i56];
              if (!((((b.cands[v_c] >> v_n) & 1) !== 0))) continue;
              if (++_n54 === 2) {
                _g52 = -1;
                break G53;
              }
              _g52 = v_c;
            }
          }
          if (!(b.grid[_g52] !== 0)) { if (fire === null) { b.placeAt(_g52, v_n); changed = true; } else facts.push(PLACE, _g52, v_n); }
          _c57 = true;
        }
        if (!(_c57)) return -1;
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
  const _g80: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  const _h108 = (cl.mode === 0);
  const _h111 = (cl.mode === 1);
  const _a72 = cl.area.parts;
  for (let _i73 = 0; _i73 < _a72.length; _i73++) {
    const v_r = _a72[_i73];
    const _t74 = cl.area.cells[v_r].length;
    for (let v_n = 1; v_n <= _t74; v_n++) {
      let _q75 = false;
      Q76: {
        const _a77 = cl.area.cells[v_r];
        for (let _i78 = 0; _i78 < _a77.length; _i78++) {
          const v_c = _a77[_i78];
          const _h79 = (b.grid[v_c] || -1);
          if ((_h79 === v_n)) {
            _q75 = true;
            break Q76;
          }
        }
      }
      if (!(!(_q75))) continue;
      _g80.length = 0;
      G81: {
        const _a84 = cl.area.cells[v_r];
        for (let _i85 = 0; _i85 < _a84.length; _i85++) {
          const v_h = _a84[_i85];
          const _h86 = (b.grid[v_h] !== 0);
          if (!((!(_h86) && (((b.cands[v_h] >> v_n) & 1) !== 0)))) continue;
          _g80.push(v_h);
        }
      }
      L87: {
        const v_H = _g80;
        const _h88 = v_H.length;
        if (!((_h88 > 0))) break L87;
        if (import.meta.env.DEV && staleChecking) {
          let _q89 = false;
          Q90: {
            const _a91 = cl.area.cells[v_r];
            for (let _i92 = 0; _i92 < _a91.length; _i92++) {
              const v_c = _a91[_i92];
              if (((b.grid[v_c] || -1) === v_n)) {
                _q89 = true;
                break Q90;
              }
            }
          }
          const _g93: number[] = [];
          G94: {
            const _a97 = cl.area.cells[v_r];
            for (let _i98 = 0; _i98 < _a97.length; _i98++) {
              const v_h = _a97[_i98];
              if (!((!((b.grid[v_h] !== 0)) && (((b.cands[v_h] >> v_n) & 1) !== 0)))) continue;
              _g93.push(v_h);
            }
          }
          freshBinding("starve", [(cl.area.parts.includes(v_r)), ((1 <= v_n) && (v_n <= cl.area.cells[v_r].length)), !(_q89), sameSet(v_H, _g93), (v_H.length > 0)], ["r in", "n in", "where of n", "H =", "where of H"]);
        }
        facts.length = 0;
        changed = false;
        let _q99 = true;
        Q100: {
          const _a101 = sp.cells;
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_c = _a101[_i102];
            const _h103 = (b.grid[v_c] !== 0);
            const _h109 = ((v_c / sp.w) | 0);
            const _h110 = (v_c % sp.w);
            let _c112: boolean = (((cl.area.of[v_c] !== v_r) && !(_h103)) && (((b.cands[v_c] >> v_n) & 1) !== 0));
            if (_c112) {
              let _q104 = true;
              Q105: {
                const _a106 = v_H;
                for (let _i107 = 0; _i107 < _a106.length; _i107++) {
                  const v_h = _a106[_i107];
                  if (!(((v_c !== v_h) && ((_h108 && (((_h109 === ((v_h / sp.w) | 0)) && (Math.abs((_h110 - (v_h % sp.w))) <= v_n)) || ((_h110 === (v_h % sp.w)) && (Math.abs((_h109 - ((v_h / sp.w) | 0))) <= v_n)))) || ((_h111 && (Math.abs((_h110 - (v_h % sp.w))) <= 1)) && (Math.abs((_h109 - ((v_h / sp.w) | 0))) <= 1)))))) {
                    _q104 = false;
                    break Q105;
                  }
                }
              }
              _c112 = _q104;
            }
            if (!(_c112)) continue;
            if ((((b.cands[v_c] >> v_n) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_n); changed = true; } else facts.push(STRIKE, v_c, v_n); }
            if (!(true)) {
              _q99 = false;
              break Q100;
            }
          }
        }
        if (!(_q99)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ r: v_r, n: v_n, H: v_H.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
