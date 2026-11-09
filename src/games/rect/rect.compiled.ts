// Compiled by `npm run describe` from src/games/rect/rect.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, keptStore, rangeMask, rectCells, rectHeight, rectHolds, rectInner, rectMeets, rectRim, rectWidth, rectsOf, sameSet, stamps, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  shape: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "fit" | "uncovered" | "boxed" | "reach" | "overlap" | "starve" | "line";

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
  { id: "fit", tier: 0 },
  { id: "uncovered", tier: 0 },
  { id: "boxed", tier: 0 },
  { id: "reach", tier: 0 },
  { id: "overlap", tier: 0 },
  { id: "starve", tier: 1 },
  { id: "line", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g546: number[] = [];
  const _g567: number[] = [];
  const _g587: number[] = [];
  const _g601: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q544 = true;
  Q545: {
    _g546.length = 0;
    G547: {
      const _a550 = sp.edges;
      for (let _i551 = 0; _i551 < _a550.length; _i551++) {
        const v_e = _a550[_i551];
        const _h552 = (g[v_e] || -1);
        if (!((_h552 === 2))) continue;
        _g546.push(v_e);
      }
    }
    const v_O = _g546;
    const _eg556 = edgeGroups(sp, v_O);
    const _a553 = sp.edges;
    for (let _i554 = 0; _i554 < _a553.length; _i554++) {
      const v_e = _a553[_i554];
      const _h555 = (g[v_e] || -1);
      if (!(((_h555 === 1) === !(_eg556.of(sp.edgeEnds[2 * v_e + 1]) === _eg556.of(sp.edgeEnds[2 * v_e]))))) {
        _q544 = false;
        break Q545;
      }
    }
  }
  if (!(_q544)) return false;
  let _q557 = true;
  Q558: {
    const _a559 = sp.corners;
    for (let _i560 = 0; _i560 < _a559.length; _i560++) {
      const v_p = _a559[_i560];
      const v_C = sp.cornerCells[v_p];
      const v_a = (v_C[0] ?? -1);
      const v_b = (v_C[1] ?? -1);
      const _h561 = (g[sp.edgeOf(v_a, v_b)] || -1);
      const v_c = (v_C[2] ?? -1);
      const _h563 = (g[sp.edgeOf(v_a, v_c)] || -1);
      const v_d = (v_C[3] ?? -1);
      const _h562 = (g[sp.edgeOf(v_c, v_d)] || -1);
      const _h564 = (g[sp.edgeOf(v_b, v_d)] || -1);
      if (!((((_h561 === 1) === (_h562 === 1)) || ((_h563 === 1) === (_h564 === 1))))) {
        _q557 = false;
        break Q558;
      }
    }
  }
  if (!(_q557)) return false;
  let _q565 = true;
  Q566: {
    _g567.length = 0;
    G568: {
      const _a571 = sp.edges;
      for (let _i572 = 0; _i572 < _a571.length; _i572++) {
        const v_e = _a571[_i572];
        const _h573 = (g[v_e] || -1);
        if (!((_h573 === 2))) continue;
        _g567.push(v_e);
      }
    }
    const v_O = _g567;
    const _eg578 = edgeGroups(sp, v_O);
    const _a574 = sp.cells;
    for (let _i575 = 0; _i575 < _a574.length; _i575++) {
      const v_c = _a574[_i575];
      let _g576 = 0;
      G577: {
        const _a579 = _eg578.of(v_c);
        for (let _i580 = 0; _i580 < _a579.length; _i580++) {
          const v_x = _a579[_i580];
          const _h581 = clueAt(cl.number, v_x);
          if (!((_h581 !== -1))) continue;
          _g576++;
        }
      }
      if (!((_g576 === 1))) {
        _q565 = false;
        break Q566;
      }
    }
  }
  if (!(_q565)) return false;
  for (let _k582 = 0; _k582 < cl.number.at.length; _k582++) {
    const _at583 = cl.number.at[_k582];
    const _v584 = cl.number.v[_k582];
    let _c595: boolean = (_v584 === 0);
    if (!_c595) {
      let _q585 = true;
      Q586: {
        _g587.length = 0;
        G588: {
          const _a591 = sp.edges;
          for (let _i592 = 0; _i592 < _a591.length; _i592++) {
            const v_e = _a591[_i592];
            const _h593 = (g[v_e] || -1);
            if (!((_h593 === 2))) continue;
            _g587.push(v_e);
          }
        }
        const v_O = _g587;
        const _eg594 = edgeGroups(sp, v_O);
        if (!((_eg594.of(_at583).length === _v584))) {
          _q585 = false;
          break Q586;
        }
      }
      _c595 = _q585;
    }
    if (!(_c595)) return false;
  }
  for (let _k596 = 0; _k596 < cl.shape.at.length; _k596++) {
    const _at597 = cl.shape.at[_k596];
    const _v598 = cl.shape.v[_k596];
    let _q599 = true;
    Q600: {
      _g601.length = 0;
      G602: {
        const _a605 = sp.edges;
        for (let _i606 = 0; _i606 < _a605.length; _i606++) {
          const v_e = _a605[_i606];
          const _h607 = (g[v_e] || -1);
          if (!((_h607 === 2))) continue;
          _g601.push(v_e);
        }
      }
      const v_O = _g601;
      const _eg608 = edgeGroups(sp, v_O);
      const v_R = _eg608.of(_at597);
      let _g609 = 0;
      G610: {
        const _a611 = v_R;
        for (let _i612 = 0; _i612 < _a611.length; _i612++) {
          const v_s = _a611[_i612];
          if (!((((v_s / sp.w) | 0) === ((_at597 / sp.w) | 0)))) continue;
          _g609++;
        }
      }
      const v_n = _g609;
      let _g613 = 0;
      G614: {
        const _a615 = v_R;
        for (let _i616 = 0; _i616 < _a615.length; _i616++) {
          const v_s = _a615[_i616];
          if (!(((v_s % sp.w) === (_at597 % sp.w)))) continue;
          _g613++;
        }
      }
      const v_m = _g613;
      if (!((((!((_v598 === 1)) || (v_n === v_m)) && (!((_v598 === 2)) || (v_m > v_n))) && (!((_v598 === 3)) || (v_n > v_m))))) {
        _q599 = false;
        break Q600;
      }
    }
    if (!(_q599)) return false;
  }
  return true;
}

export interface FitBinding {
  q: number;
  F: readonly number[];
}

const fitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function fit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitBinding> | null): number {
  const facts = fitFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const v_F = fits(b, sp, cl, v_q);
    const _h43 = v_F.length;
    facts.length = 0;
    changed = false;
    let _c58: boolean = (_h43 > 0);
    if (_c58) {
      let _c57: boolean = !((_h43 === 1));
      if (!_c57) {
        let _q44 = true;
        Q45: {
          const _a46 = v_F;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_r = _a46[_i47];
            let _q48 = true;
            Q49: {
              const _a50 = rectInner(sp, v_r);
              for (let _i51 = 0; _i51 < _a50.length; _i51++) {
                const v_e = _a50[_i51];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q48 = false;
                  break Q49;
                }
              }
            }
            let _c56: boolean = _q48;
            if (_c56) {
              let _q52 = true;
              Q53: {
                const _a54 = rectRim(sp, v_r);
                for (let _i55 = 0; _i55 < _a54.length; _i55++) {
                  const v_e = _a54[_i55];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q52 = false;
                    break Q53;
                  }
                }
              }
              _c56 = _q52;
            }
            if (!(_c56)) {
              _q44 = false;
              break Q45;
            }
          }
        }
        _c57 = _q44;
      }
      _c58 = _c57;
    }
    if (!(_c58)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ q: v_q, F: v_F.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface UncoveredBinding {
  c: number;
}

const uncoveredFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function uncovered(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UncoveredBinding> | null): number {
  const facts = uncoveredFacts;
  let fired = 0;
  let changed = false;
  const _a61 = sp.cells;
  for (let _i62 = 0; _i62 < _a61.length; _i62++) {
    const v_c = _a61[_i62];
    facts.length = 0;
    changed = false;
    if (!((reachers(b, sp, cl, v_c).length > 0))) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface BoxedBinding {
  q: number;
  F: readonly number[];
  r: number;
}

const boxedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function boxed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BoxedBinding> | null): number {
  const facts = boxedFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    const _m31_0 = b.made[0];
    const _m31_1 = b.made[1];
    L96: {
      const v_F = fits(b, sp, cl, v_q);
      const _h97 = v_F.length;
      if (!((_h97 > 1))) break L96;
      const _a98 = v_F;
      for (let _i99 = 0; _i99 < _a98.length; _i99++) {
        const v_r = _a98[_i99];
        let _q100 = true;
        Q101: {
          const _a102 = rectRim(sp, v_r);
          for (let _i103 = 0; _i103 < _a102.length; _i103++) {
            const v_e = _a102[_i103];
            if (!(((b.grid[v_e] || -1) === 1))) {
              _q100 = false;
              break Q101;
            }
          }
        }
        if (!(_q100)) continue;
        if (b.made[0] !== _m31_0 || b.made[1] !== _m31_1) {
          if (!(sameSet(v_F, fits(b, sp, cl, v_q)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q104 = true;
        Q105: {
          const _a106 = rectInner(sp, v_r);
          for (let _i107 = 0; _i107 < _a106.length; _i107++) {
            const v_e = _a106[_i107];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q104 = false;
              break Q105;
            }
          }
        }
        let _c112: boolean = _q104;
        if (_c112) {
          let _q108 = true;
          Q109: {
            const _a110 = rectRim(sp, v_r);
            for (let _i111 = 0; _i111 < _a110.length; _i111++) {
              const v_e = _a110[_i111];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q108 = false;
                break Q109;
              }
            }
          }
          _c112 = _q108;
        }
        if (!(_c112)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, F: v_F.slice(), r: v_r }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ReachBinding {
  c: number;
  Q: readonly number[];
  q: number;
  F: readonly number[];
  r: number;
}

const reachFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ReachBinding> | null): number {
  const _g127: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a123 = sp.cells;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_c = _a123[_i124];
    L125: {
      const v_Q = reachers(b, sp, cl, v_c);
      const _h126 = v_Q.length;
      if (!((_h126 === 1))) break L125;
      const v_q = (v_Q[0] ?? -1);
      _g127.length = 0;
      G128: {
        const _a131 = fits(b, sp, cl, v_q);
        for (let _i132 = 0; _i132 < _a131.length; _i132++) {
          const v_r = _a131[_i132];
          if (!(rectHolds(sp, v_r, v_c))) continue;
          _g127.push(v_r);
        }
      }
      L133: {
        const v_F = _g127;
        const _h134 = v_F.length;
        if (!((_h134 === 1))) break L133;
        const v_r = (v_F[0] ?? -1);
        facts.length = 0;
        changed = false;
        let _q135 = true;
        Q136: {
          const _a137 = rectInner(sp, v_r);
          for (let _i138 = 0; _i138 < _a137.length; _i138++) {
            const v_e = _a137[_i138];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q135 = false;
              break Q136;
            }
          }
        }
        let _c143: boolean = _q135;
        if (_c143) {
          let _q139 = true;
          Q140: {
            const _a141 = rectRim(sp, v_r);
            for (let _i142 = 0; _i142 < _a141.length; _i142++) {
              const v_e = _a141[_i142];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q139 = false;
                break Q140;
              }
            }
          }
          _c143 = _q139;
        }
        if (!(_c143)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, Q: v_Q.slice(), q: v_q, F: v_F.slice(), r: v_r }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OverlapBinding {
  p: number;
  K: readonly number[];
  q: number;
  F: readonly number[];
  G: readonly number[];
  r: number;
}

const overlapFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function overlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverlapBinding> | null): number {
  const _g183: number[] = [];
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
    const _m78_0 = b.made[0];
    const _m78_1 = b.made[1];
    let _q177 = false;
    Q178: {
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        if (true) {
          _q177 = true;
          break Q178;
        }
      }
    }
    if (!(_q177)) continue;
    L179: {
      const v_K = core(b, sp, cl, v_p);
      const _h180 = v_K.length;
      if (!((_h180 > 1))) break L179;
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        L181: {
          const v_F = fits(b, sp, cl, v_q);
          const _h182 = v_F.length;
          if (!((_h182 > 1))) break L181;
          _g183.length = 0;
          G184: {
            const _a191 = v_F;
            for (let _i192 = 0; _i192 < _a191.length; _i192++) {
              const v_r = _a191[_i192];
              let _q193 = false;
              Q194: {
                const _a195 = v_K;
                for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                  const v_x = _a195[_i196];
                  if (rectHolds(sp, v_r, v_x)) {
                    _q193 = true;
                    break Q194;
                  }
                }
              }
              if (!(!(_q193))) continue;
              _g183.push(v_r);
            }
          }
          L197: {
            const v_G = _g183;
            const _h198 = v_G.length;
            if (!(((_h198 === 1) && (_h198 < _h182)))) break L197;
            const v_r = (v_G[0] ?? -1);
            if (b.made[0] !== _m78_0 || b.made[1] !== _m78_1) {
              if (!(sameSet(v_K, core(b, sp, cl, v_p)))) { continue R1; }
            }
            facts.length = 0;
            changed = false;
            let _q199 = true;
            Q200: {
              const _a201 = rectInner(sp, v_r);
              for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                const v_e = _a201[_i202];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q199 = false;
                  break Q200;
                }
              }
            }
            let _c207: boolean = _q199;
            if (_c207) {
              let _q203 = true;
              Q204: {
                const _a205 = rectRim(sp, v_r);
                for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                  const v_e = _a205[_i206];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q203 = false;
                    break Q204;
                  }
                }
              }
              _c207 = _q203;
            }
            if (!(_c207)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ p: v_p, K: v_K.slice(), q: v_q, F: v_F.slice(), G: v_G.slice(), r: v_r }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface StarveBinding {
  q: number;
  F: readonly number[];
  G: readonly number[];
  r: number;
  Z: readonly number[];
  U: readonly number[];
}

const starveFacts: number[] = [];
let starveCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function starve(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarveBinding> | null): number {
  const _g281: number[] = [];
  const _g289: number[] = [];
  const _g309: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  if (starveCands.length < sp.edges.length) starveCands = new Int32Array(sp.edges.length);
  const cands = starveCands;
  cands.fill(-1);
  starvesMarkedKept.clear();
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    L279: {
      const v_F = fits(b, sp, cl, v_q);
      const _h280 = v_F.length;
      if (!((_h280 > 1))) break L279;
      _g281.length = 0;
      G282: {
        const _a285 = v_F;
        for (let _i286 = 0; _i286 < _a285.length; _i286++) {
          const v_r = _a285[_i286];
          if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
          _g281.push(v_r);
        }
      }
      L287: {
        const v_G = _g281;
        const _h288 = v_G.length;
        if (!((_h288 === 1))) break L287;
        const v_r = (v_G[0] ?? -1);
        _g289.length = 0;
        G290: {
          for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
            let _c308: boolean = (v_j !== v_q);
            if (_c308) {
              let _q300 = false;
              Q301: {
                const _a302 = v_F;
                for (let _i303 = 0; _i303 < _a302.length; _i303++) {
                  const v_s = _a302[_i303];
                  if (!((v_s !== v_r))) continue;
                  let _q304 = true;
                  Q305: {
                    const _a306 = fits(b, sp, cl, v_j);
                    for (let _i307 = 0; _i307 < _a306.length; _i307++) {
                      const v_t = _a306[_i307];
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q304 = false;
                        break Q305;
                      }
                    }
                  }
                  if (_q304) {
                    _q300 = true;
                    break Q301;
                  }
                }
              }
              _c308 = _q300;
            }
            if (!(_c308)) continue;
            _g289.push(v_j);
          }
        }
        const v_Z = _g289;
        _g309.length = 0;
        G310: {
          const _a323 = sp.cells;
          for (let _i324 = 0; _i324 < _a323.length; _i324++) {
            const v_x = _a323[_i324];
            let _q325 = false;
            Q326: {
              const _a327 = v_F;
              for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                const v_s = _a327[_i328];
                if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                let _q329 = false;
                Q330: {
                  const _a331 = reachers(b, sp, cl, v_x);
                  for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                    const v_j = _a331[_i332];
                    if (!((v_j !== v_q))) continue;
                    const _a333 = fits(b, sp, cl, v_j);
                    for (let _i334 = 0; _i334 < _a333.length; _i334++) {
                      const v_t = _a333[_i334];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q329 = true;
                        break Q330;
                      }
                    }
                  }
                }
                if (!(_q329)) {
                  _q325 = true;
                  break Q326;
                }
              }
            }
            if (!(_q325)) continue;
            _g309.push(v_x);
          }
        }
        const v_U = _g309;
        facts.length = 0;
        changed = false;
        let _q335 = true;
        Q336: {
          const _a337 = rectInner(sp, v_r);
          for (let _i338 = 0; _i338 < _a337.length; _i338++) {
            const v_e = _a337[_i338];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q335 = false;
              break Q336;
            }
          }
        }
        let _c343: boolean = _q335;
        if (_c343) {
          let _q339 = true;
          Q340: {
            const _a341 = rectRim(sp, v_r);
            for (let _i342 = 0; _i342 < _a341.length; _i342++) {
              const v_e = _a341[_i342];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q339 = false;
                break Q340;
              }
            }
          }
          _c343 = _q339;
        }
        if (!(_c343)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, F: v_F.slice(), G: v_G.slice(), r: v_r, Z: v_Z.slice(), U: v_U.slice() }, facts)) return 1;
          cands.fill(-1);
          starvesMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface LineBinding {
  e: number;
  a: number;
  b: number;
  C: readonly number[];
  O: readonly number[];
  T: readonly number[];
  M: readonly number[];
}

const lineFacts: number[] = [];
let lineCands = new Int32Array(0);
const _st510 = stamps();
const _st532 = stamps();

/** Its dearest read grows with the board as n^2. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g449: number[] = [];
  const _g477: number[] = [];
  const _g500: number[] = [];
  const _g520: number[] = [];
  const _g537: number[] = [];
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  if (lineCands.length < sp.edges.length) lineCands = new Int32Array(sp.edges.length);
  const cands = lineCands;
  cands.fill(-1);
  ownedMarkedKept.clear();
  const _a447 = sp.edges;
  for (let _i448 = 0; _i448 < _a447.length; _i448++) {
    const v_e = _a447[_i448];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    _g449.length = 0;
    G450: {
      const _a457 = reachers(b, sp, cl, v_a);
      for (let _i458 = 0; _i458 < _a457.length; _i458++) {
        const v_q = _a457[_i458];
        let _q459 = false;
        Q460: {
          const _a461 = fits(b, sp, cl, v_q);
          for (let _i462 = 0; _i462 < _a461.length; _i462++) {
            const v_r = _a461[_i462];
            if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
              _q459 = true;
              break Q460;
            }
          }
        }
        if (!(_q459)) continue;
        _g449.push(v_q);
      }
    }
    L463: {
      const v_C = _g449;
      const _h464 = v_C.length;
      let _c476: boolean = (_h464 > 0);
      if (_c476) {
        let _q465 = true;
        Q466: {
          const _a467 = v_C;
          for (let _i468 = 0; _i468 < _a467.length; _i468++) {
            const v_q = _a467[_i468];
            const _a469 = fits(b, sp, cl, v_q);
            for (let _i470 = 0; _i470 < _a469.length; _i470++) {
              const v_r = _a469[_i470];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              let _c475: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
              if (!_c475) {
                let _q471 = false;
                Q472: {
                  const _a473 = sole(b, sp, cl, v_q);
                  for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                    const v_x = _a473[_i474];
                    if (!rectHolds(sp, v_r, v_x)) {
                      _q471 = true;
                      break Q472;
                    }
                  }
                }
                _c475 = _q471;
              }
              if (!(_c475)) {
                _q465 = false;
                break Q466;
              }
            }
          }
        }
        _c476 = _q465;
      }
      if (!(_c476)) break L463;
      _g477.length = 0;
      G478: {
        for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
          let _q489 = false;
          Q490: {
            const _a491 = v_C;
            for (let _i492 = 0; _i492 < _a491.length; _i492++) {
              const v_q = _a491[_i492];
              const _h495 = (v_p !== v_q);
              const _a493 = fits(b, sp, cl, v_q);
              for (let _i494 = 0; _i494 < _a493.length; _i494++) {
                const v_r = _a493[_i494];
                if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && _h495))) continue;
                let _q496 = false;
                Q497: {
                  const _a498 = core(b, sp, cl, v_p);
                  for (let _i499 = 0; _i499 < _a498.length; _i499++) {
                    const v_x = _a498[_i499];
                    if (rectHolds(sp, v_r, v_x)) {
                      _q496 = true;
                      break Q497;
                    }
                  }
                }
                if (_q496) {
                  _q489 = true;
                  break Q490;
                }
              }
            }
          }
          if (!(_q489)) continue;
          _g477.push(v_p);
        }
      }
      const v_O = _g477;
      _g500.length = 0;
      _st510.pass++;
      G501: {
        const _a511 = v_C;
        for (let _i512 = 0; _i512 < _a511.length; _i512++) {
          const v_q = _a511[_i512];
          const _a513 = fits(b, sp, cl, v_q);
          for (let _i514 = 0; _i514 < _a513.length; _i514++) {
            const v_r = _a513[_i514];
            if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
            const _a515 = v_O;
            for (let _i516 = 0; _i516 < _a515.length; _i516++) {
              const v_p = _a515[_i516];
              if (!((v_p !== v_q))) continue;
              const _a517 = core(b, sp, cl, v_p);
              for (let _i518 = 0; _i518 < _a517.length; _i518++) {
                const v_x = _a517[_i518];
                if (!(rectHolds(sp, v_r, v_x))) continue;
                const _t519 = v_x;
                if (_g500.length < 16) { if (!_g500.includes(_t519)) _g500.push(_t519); } else addOnce(_g500, _st510, _t519);
              }
            }
          }
        }
      }
      const v_T = _g500;
      _g520.length = 0;
      _st532.pass++;
      G521: {
        const _a533 = v_C;
        for (let _i534 = 0; _i534 < _a533.length; _i534++) {
          const v_q = _a533[_i534];
          const _a535 = fits(b, sp, cl, v_q);
          for (let _i536 = 0; _i536 < _a535.length; _i536++) {
            const v_r = _a535[_i536];
            if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
            _g537.length = 0;
            G538: {
              const _a541 = sole(b, sp, cl, v_q);
              for (let _i542 = 0; _i542 < _a541.length; _i542++) {
                const v_x = _a541[_i542];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                _g537.push(v_x);
              }
            }
            const v_m = (_g537[0] ?? -1);
            const _t543 = v_m;
            if (_g520.length < 16) { if (!_g520.includes(_t543)) _g520.push(_t543); } else addOnce(_g520, _st532, _t543);
          }
        }
      }
      const v_M = _g520;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, C: v_C.slice(), O: v_O.slice(), T: v_T.slice(), M: v_M.slice() }, facts)) return 1;
        cands.fill(-1);
        ownedMarkedKept.clear();
      }
    }
  }
  return fired;
}

const allowedKept = keptStore<readonly number[]>();
let allowedOn: object | null = null;
let allowedAt: Kept<readonly number[]> = [];

/** `allowed(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function allowed(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  if (cl !== allowedOn) {
    allowedAt = allowedKept.board(cl);
    allowedOn = cl;
  }
  const _kept: Kept<readonly number[]> = allowedAt;
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g3: number[] = [];
  G4: {
    const _a13 = rectsOf(sp, cl.number.at[v_q], cl.number.v[v_q]);
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_r = _a13[_i14];
      const _t15 = cl.number.at[v_q];
      let _c20: boolean = ((((clueAt(cl.shape, _t15) === -1) || ((clueAt(cl.shape, _t15) === 1) && (rectWidth(sp, v_r) === rectHeight(sp, v_r)))) || ((clueAt(cl.shape, _t15) === 2) && (rectHeight(sp, v_r) > rectWidth(sp, v_r)))) || ((clueAt(cl.shape, _t15) === 3) && (rectWidth(sp, v_r) > rectHeight(sp, v_r))));
      if (_c20) {
        let _g16 = 0;
        G17: {
          const _a18 = rectCells(sp, v_r);
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_x = _a18[_i19];
            if (!((clueAt(cl.number, v_x) !== -1))) continue;
            _g16++;
          }
        }
        _c20 = (_g16 === 1);
      }
      if (!(_c20)) continue;
      _g3.push(v_r);
    }
  }
  const _made = _g3;
  _kept[v_q] = _made;
  return _made;
}

const fitsKept = keptStore<readonly number[]>();

/** `fits(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function fits(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = fitsKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g1: number[] = [];
  G2: {
    const _a32 = allowed(sp, cl, v_q);
    for (let _i33 = 0; _i33 < _a32.length; _i33++) {
      const v_r = _a32[_i33];
      let _q34 = false;
      Q35: {
        const _a36 = rectInner(sp, v_r);
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_e = _a36[_i37];
          if (((b.grid[v_e] || -1) === 1)) {
            _q34 = true;
            break Q35;
          }
        }
      }
      let _c42: boolean = !(_q34);
      if (_c42) {
        let _q38 = false;
        Q39: {
          const _a40 = rectRim(sp, v_r);
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_e = _a40[_i41];
            if (((b.grid[v_e] || -1) === 2)) {
              _q38 = true;
              break Q39;
            }
          }
        }
        _c42 = !(_q38);
      }
      if (!(_c42)) continue;
      _g1.push(v_r);
    }
  }
  const _made = _g1;
  _kept[v_q] = _made;
  return _made;
}

const nearKept = keptStore<readonly number[]>();
let nearOn: object | null = null;
let nearAt: Kept<readonly number[]> = [];

/** `near(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== nearOn) {
    nearAt = nearKept.board(cl);
    nearOn = cl;
  }
  const _kept: Kept<readonly number[]> = nearAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g65: number[] = [];
  G66: {
    for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
      let _c76: boolean = ((cl.number.v[v_q] === 0) || ((Math.abs(((v_c % sp.w) - (cl.number.at[v_q] % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((cl.number.at[v_q] / sp.w) | 0)))) < cl.number.v[v_q]));
      if (_c76) {
        let _q72 = false;
        Q73: {
          const _a74 = allowed(sp, cl, v_q);
          for (let _i75 = 0; _i75 < _a74.length; _i75++) {
            const v_r = _a74[_i75];
            if (rectHolds(sp, v_r, v_c)) {
              _q72 = true;
              break Q73;
            }
          }
        }
        _c76 = _q72;
      }
      if (!(_c76)) continue;
      _g65.push(v_q);
    }
  }
  const _made = _g65;
  _kept[v_c] = _made;
  return _made;
}

const reachersKept = keptStore<readonly number[]>();

/** `reachers(x)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reachers(b: Marks, sp: GridSpace, cl: Dealt, v_x: number): readonly number[] {
  const _kept: Kept<readonly number[]> = reachersKept.marks(b);
  if (_kept[v_x] !== undefined) return _kept[v_x];
  const _g63: number[] = [];
  G64: {
    const _a83 = near(sp, cl, v_x);
    for (let _i84 = 0; _i84 < _a83.length; _i84++) {
      const v_q = _a83[_i84];
      let _q85 = false;
      Q86: {
        const _a87 = fits(b, sp, cl, v_q);
        for (let _i88 = 0; _i88 < _a87.length; _i88++) {
          const v_r = _a87[_i88];
          if (rectHolds(sp, v_r, v_x)) {
            _q85 = true;
            break Q86;
          }
        }
      }
      if (!(_q85)) continue;
      _g63.push(v_q);
    }
  }
  const _made = _g63;
  _kept[v_x] = _made;
  return _made;
}

const coreKept = keptStore<readonly number[]>();

/** `core(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function core(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = coreKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g146: number[] = [];
  G147: {
    const _a154 = rectCells(sp, (fits(b, sp, cl, v_q)[0] ?? -1));
    for (let _i155 = 0; _i155 < _a154.length; _i155++) {
      const v_x = _a154[_i155];
      let _q156 = true;
      Q157: {
        const _a158 = fits(b, sp, cl, v_q);
        for (let _i159 = 0; _i159 < _a158.length; _i159++) {
          const v_r = _a158[_i159];
          if (!(rectHolds(sp, v_r, v_x))) {
            _q156 = false;
            break Q157;
          }
        }
      }
      if (!(_q156)) continue;
      _g146.push(v_x);
    }
  }
  const _made = _g146;
  _kept[v_q] = _made;
  return _made;
}

const starvesMarkedKept = new Map<number, boolean>();

/** `starves(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function starvesMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = starvesMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q213 = false;
  Q214: {
    for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
      if (!((v_j !== v_q))) continue;
      let _q215 = true;
      Q216: {
        const _a217 = fits(b, sp, cl, v_j);
        for (let _i218 = 0; _i218 < _a217.length; _i218++) {
          const v_t = _a217[_i218];
          if (!(rectMeets(sp, v_t, v_r))) {
            _q215 = false;
            break Q216;
          }
        }
      }
      if (_q215) {
        _q213 = true;
        break Q214;
      }
    }
  }
  let _c229: boolean = _q213;
  if (!_c229) {
    let _q219 = false;
    Q220: {
      const _a221 = sp.cells;
      for (let _i222 = 0; _i222 < _a221.length; _i222++) {
        const v_x = _a221[_i222];
        if (!(!rectHolds(sp, v_r, v_x))) continue;
        let _q223 = false;
        Q224: {
          const _a225 = reachers(b, sp, cl, v_x);
          for (let _i226 = 0; _i226 < _a225.length; _i226++) {
            const v_j = _a225[_i226];
            if (!((v_j !== v_q))) continue;
            const _a227 = fits(b, sp, cl, v_j);
            for (let _i228 = 0; _i228 < _a227.length; _i228++) {
              const v_t = _a227[_i228];
              if (!(rectHolds(sp, v_t, v_x))) continue;
              if (!(rectMeets(sp, v_t, v_r))) {
                _q223 = true;
                break Q224;
              }
            }
          }
        }
        if (!(_q223)) {
          _q219 = true;
          break Q220;
        }
      }
    }
    _c229 = _q219;
  }
  const _made = _c229;
  starvesMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const ownedMarkedKept = new Map<number, boolean>();

/** `owned(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function ownedMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = ownedMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q367 = false;
  Q368: {
    for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
      if (!((v_p !== v_q))) continue;
      let _q369 = false;
      Q370: {
        const _a371 = core(b, sp, cl, v_p);
        for (let _i372 = 0; _i372 < _a371.length; _i372++) {
          const v_x = _a371[_i372];
          if (rectHolds(sp, v_r, v_x)) {
            _q369 = true;
            break Q370;
          }
        }
      }
      if (_q369) {
        _q367 = true;
        break Q368;
      }
    }
  }
  const _made = _q367;
  ownedMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const soleKept = keptStore<readonly number[]>();

/** `sole(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sole(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = soleKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g373: number[] = [];
  G374: {
    const _a377 = sp.cells;
    for (let _i378 = 0; _i378 < _a377.length; _i378++) {
      const v_x = _a377[_i378];
      if (!(((reachers(b, sp, cl, v_x).length === 1) && (reachers(b, sp, cl, v_x).includes(v_q))))) continue;
      _g373.push(v_x);
    }
  }
  const _made = _g373;
  _kept[v_q] = _made;
  return _made;
}
