// Compiled by `npm run describe` from src/games/rect/rect.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, rangeMask, rectCells, rectHeight, rectHolds, rectInner, rectMeets, rectRim, rectWidth, rectsOf, sameSet, staleChecking, stamps, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g710: number[] = [];
  const _g731: number[] = [];
  const _g751: number[] = [];
  const _g765: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q708 = true;
  Q709: {
    _g710.length = 0;
    G711: {
      const _a714 = sp.edges;
      for (let _i715 = 0; _i715 < _a714.length; _i715++) {
        const v_e = _a714[_i715];
        const _h716 = (g[v_e] || -1);
        if (!((_h716 === 2))) continue;
        _g710.push(v_e);
      }
    }
    const v_O = _g710;
    const _eg720 = edgeGroups(sp, v_O);
    const _a717 = sp.edges;
    for (let _i718 = 0; _i718 < _a717.length; _i718++) {
      const v_e = _a717[_i718];
      const _h719 = (g[v_e] || -1);
      if (!(((_h719 === 1) === !(_eg720.of(sp.edgeEnds[2 * v_e + 1]) === _eg720.of(sp.edgeEnds[2 * v_e]))))) {
        _q708 = false;
        break Q709;
      }
    }
  }
  if (!(_q708)) return false;
  let _q721 = true;
  Q722: {
    const _a723 = sp.corners;
    for (let _i724 = 0; _i724 < _a723.length; _i724++) {
      const v_p = _a723[_i724];
      const v_C = sp.cornerCells[v_p];
      const v_a = (v_C[0] ?? -1);
      const v_b = (v_C[1] ?? -1);
      const _h725 = (g[sp.edgeOf(v_a, v_b)] || -1);
      const v_c = (v_C[2] ?? -1);
      const _h727 = (g[sp.edgeOf(v_a, v_c)] || -1);
      const v_d = (v_C[3] ?? -1);
      const _h726 = (g[sp.edgeOf(v_c, v_d)] || -1);
      const _h728 = (g[sp.edgeOf(v_b, v_d)] || -1);
      if (!((((_h725 === 1) === (_h726 === 1)) || ((_h727 === 1) === (_h728 === 1))))) {
        _q721 = false;
        break Q722;
      }
    }
  }
  if (!(_q721)) return false;
  let _q729 = true;
  Q730: {
    _g731.length = 0;
    G732: {
      const _a735 = sp.edges;
      for (let _i736 = 0; _i736 < _a735.length; _i736++) {
        const v_e = _a735[_i736];
        const _h737 = (g[v_e] || -1);
        if (!((_h737 === 2))) continue;
        _g731.push(v_e);
      }
    }
    const v_O = _g731;
    const _eg742 = edgeGroups(sp, v_O);
    const _a738 = sp.cells;
    for (let _i739 = 0; _i739 < _a738.length; _i739++) {
      const v_c = _a738[_i739];
      let _g740 = 0;
      G741: {
        const _a743 = _eg742.of(v_c);
        for (let _i744 = 0; _i744 < _a743.length; _i744++) {
          const v_x = _a743[_i744];
          const _h745 = clueAt(cl.number, v_x);
          if (!((_h745 !== -1))) continue;
          _g740++;
        }
      }
      if (!((_g740 === 1))) {
        _q729 = false;
        break Q730;
      }
    }
  }
  if (!(_q729)) return false;
  for (let _k746 = 0; _k746 < cl.number.at.length; _k746++) {
    const _at747 = cl.number.at[_k746];
    const _v748 = cl.number.v[_k746];
    let _c759: boolean = (_v748 === 0);
    if (!_c759) {
      let _q749 = true;
      Q750: {
        _g751.length = 0;
        G752: {
          const _a755 = sp.edges;
          for (let _i756 = 0; _i756 < _a755.length; _i756++) {
            const v_e = _a755[_i756];
            const _h757 = (g[v_e] || -1);
            if (!((_h757 === 2))) continue;
            _g751.push(v_e);
          }
        }
        const v_O = _g751;
        const _eg758 = edgeGroups(sp, v_O);
        if (!((_eg758.of(_at747).length === _v748))) {
          _q749 = false;
          break Q750;
        }
      }
      _c759 = _q749;
    }
    if (!(_c759)) return false;
  }
  for (let _k760 = 0; _k760 < cl.shape.at.length; _k760++) {
    const _at761 = cl.shape.at[_k760];
    const _v762 = cl.shape.v[_k760];
    let _q763 = true;
    Q764: {
      _g765.length = 0;
      G766: {
        const _a769 = sp.edges;
        for (let _i770 = 0; _i770 < _a769.length; _i770++) {
          const v_e = _a769[_i770];
          const _h771 = (g[v_e] || -1);
          if (!((_h771 === 2))) continue;
          _g765.push(v_e);
        }
      }
      const v_O = _g765;
      const _eg772 = edgeGroups(sp, v_O);
      const v_R = _eg772.of(_at761);
      let _g773 = 0;
      G774: {
        const _a775 = v_R;
        for (let _i776 = 0; _i776 < _a775.length; _i776++) {
          const v_s = _a775[_i776];
          if (!((((v_s / sp.w) | 0) === ((_at761 / sp.w) | 0)))) continue;
          _g773++;
        }
      }
      const v_n = _g773;
      let _g777 = 0;
      G778: {
        const _a779 = v_R;
        for (let _i780 = 0; _i780 < _a779.length; _i780++) {
          const v_s = _a779[_i780];
          if (!(((v_s % sp.w) === (_at761 % sp.w)))) continue;
          _g777++;
        }
      }
      const v_m = _g777;
      if (!((((!((_v762 === 1)) || (v_n === v_m)) && (!((_v762 === 2)) || (v_m > v_n))) && (!((_v762 === 3)) || (v_n > v_m))))) {
        _q763 = false;
        break Q764;
      }
    }
    if (!(_q763)) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("fit", [sameSet(v_F, fits(b, sp, cl, v_q))], ["F ="]);
    }
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("uncovered", [(sp.cells.includes(v_c))], ["c in"]);
    }
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
        if (import.meta.env.DEV && staleChecking) {
          let _q104 = true;
          Q105: {
            const _a106 = rectRim(sp, v_r);
            for (let _i107 = 0; _i107 < _a106.length; _i107++) {
              const v_e = _a106[_i107];
              if (!(((b.grid[v_e] || -1) === 1))) {
                _q104 = false;
                break Q105;
              }
            }
          }
          freshBinding("boxed", [sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), (v_F.includes(v_r)), _q104], ["F =", "where of F", "r in", "where of r"]);
        }
        facts.length = 0;
        changed = false;
        let _q108 = true;
        Q109: {
          const _a110 = rectInner(sp, v_r);
          for (let _i111 = 0; _i111 < _a110.length; _i111++) {
            const v_e = _a110[_i111];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q108 = false;
              break Q109;
            }
          }
        }
        let _c116: boolean = _q108;
        if (_c116) {
          let _q112 = true;
          Q113: {
            const _a114 = rectRim(sp, v_r);
            for (let _i115 = 0; _i115 < _a114.length; _i115++) {
              const v_e = _a114[_i115];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q112 = false;
                break Q113;
              }
            }
          }
          _c116 = _q112;
        }
        if (!(_c116)) return -1;
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
  const _g131: number[] = [];
  const facts = reachFacts;
  let fired = 0;
  let changed = false;
  const _a127 = sp.cells;
  for (let _i128 = 0; _i128 < _a127.length; _i128++) {
    const v_c = _a127[_i128];
    L129: {
      const v_Q = reachers(b, sp, cl, v_c);
      const _h130 = v_Q.length;
      if (!((_h130 === 1))) break L129;
      const v_q = (v_Q[0] ?? -1);
      _g131.length = 0;
      G132: {
        const _a135 = fits(b, sp, cl, v_q);
        for (let _i136 = 0; _i136 < _a135.length; _i136++) {
          const v_r = _a135[_i136];
          if (!(rectHolds(sp, v_r, v_c))) continue;
          _g131.push(v_r);
        }
      }
      L137: {
        const v_F = _g131;
        const _h138 = v_F.length;
        if (!((_h138 === 1))) break L137;
        const v_r = (v_F[0] ?? -1);
        if (import.meta.env.DEV && staleChecking) {
          const _g139: number[] = [];
          G140: {
            const _a143 = fits(b, sp, cl, v_q);
            for (let _i144 = 0; _i144 < _a143.length; _i144++) {
              const v_r = _a143[_i144];
              if (!(rectHolds(sp, v_r, v_c))) continue;
              _g139.push(v_r);
            }
          }
          freshBinding("reach", [(sp.cells.includes(v_c)), sameSet(v_Q, reachers(b, sp, cl, v_c)), (v_Q.length === 1), (v_q === (v_Q[0] ?? -1)), sameSet(v_F, _g139), (v_F.length === 1), (v_r === (v_F[0] ?? -1))], ["c in", "Q =", "where of Q", "q =", "F =", "where of F", "r ="]);
        }
        facts.length = 0;
        changed = false;
        let _q145 = true;
        Q146: {
          const _a147 = rectInner(sp, v_r);
          for (let _i148 = 0; _i148 < _a147.length; _i148++) {
            const v_e = _a147[_i148];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q145 = false;
              break Q146;
            }
          }
        }
        let _c153: boolean = _q145;
        if (_c153) {
          let _q149 = true;
          Q150: {
            const _a151 = rectRim(sp, v_r);
            for (let _i152 = 0; _i152 < _a151.length; _i152++) {
              const v_e = _a151[_i152];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q149 = false;
                break Q150;
              }
            }
          }
          _c153 = _q149;
        }
        if (!(_c153)) return -1;
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
  const _g193: number[] = [];
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
    const _m78_0 = b.made[0];
    const _m78_1 = b.made[1];
    let _q187 = false;
    Q188: {
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        if (true) {
          _q187 = true;
          break Q188;
        }
      }
    }
    if (!(_q187)) continue;
    L189: {
      const v_K = core(b, sp, cl, v_p);
      const _h190 = v_K.length;
      if (!((_h190 > 1))) break L189;
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        L191: {
          const v_F = fits(b, sp, cl, v_q);
          const _h192 = v_F.length;
          if (!((_h192 > 1))) break L191;
          _g193.length = 0;
          G194: {
            const _a201 = v_F;
            for (let _i202 = 0; _i202 < _a201.length; _i202++) {
              const v_r = _a201[_i202];
              let _q203 = false;
              Q204: {
                const _a205 = v_K;
                for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                  const v_x = _a205[_i206];
                  if (rectHolds(sp, v_r, v_x)) {
                    _q203 = true;
                    break Q204;
                  }
                }
              }
              if (!(!(_q203))) continue;
              _g193.push(v_r);
            }
          }
          L207: {
            const v_G = _g193;
            const _h208 = v_G.length;
            if (!(((_h208 === 1) && (_h208 < _h192)))) break L207;
            const v_r = (v_G[0] ?? -1);
            if (b.made[0] !== _m78_0 || b.made[1] !== _m78_1) {
              if (!(sameSet(v_K, core(b, sp, cl, v_p)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              const _g209: number[] = [];
              G210: {
                const _a217 = v_F;
                for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                  const v_r = _a217[_i218];
                  let _q219 = false;
                  Q220: {
                    const _a221 = v_K;
                    for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                      const v_x = _a221[_i222];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q219 = true;
                        break Q220;
                      }
                    }
                  }
                  if (!(!(_q219))) continue;
                  _g209.push(v_r);
                }
              }
              freshBinding("overlap", [sameSet(v_K, core(b, sp, cl, v_p)), (v_K.length > 1), (v_q !== v_p), sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), sameSet(v_G, _g209), ((v_G.length === 1) && (v_G.length < v_F.length)), (v_r === (v_G[0] ?? -1))], ["K =", "where of K", "where of q", "F =", "where of F", "G =", "where of G", "r ="]);
            }
            facts.length = 0;
            changed = false;
            let _q223 = true;
            Q224: {
              const _a225 = rectInner(sp, v_r);
              for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                const v_e = _a225[_i226];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q223 = false;
                  break Q224;
                }
              }
            }
            let _c231: boolean = _q223;
            if (_c231) {
              let _q227 = true;
              Q228: {
                const _a229 = rectRim(sp, v_r);
                for (let _i230 = 0; _i230 < _a229.length; _i230++) {
                  const v_e = _a229[_i230];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q227 = false;
                    break Q228;
                  }
                }
              }
              _c231 = _q227;
            }
            if (!(_c231)) return -1;
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
  const _g305: number[] = [];
  const _g313: number[] = [];
  const _g333: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  if (starveCands.length < sp.edges.length) starveCands = new Int32Array(sp.edges.length);
  const cands = starveCands;
  cands.fill(-1);
  starvesMarkedKept.clear();
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    L303: {
      const v_F = fits(b, sp, cl, v_q);
      const _h304 = v_F.length;
      if (!((_h304 > 1))) break L303;
      _g305.length = 0;
      G306: {
        const _a309 = v_F;
        for (let _i310 = 0; _i310 < _a309.length; _i310++) {
          const v_r = _a309[_i310];
          if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
          _g305.push(v_r);
        }
      }
      L311: {
        const v_G = _g305;
        const _h312 = v_G.length;
        if (!((_h312 === 1))) break L311;
        const v_r = (v_G[0] ?? -1);
        _g313.length = 0;
        G314: {
          for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
            let _c332: boolean = (v_j !== v_q);
            if (_c332) {
              let _q324 = false;
              Q325: {
                const _a326 = v_F;
                for (let _i327 = 0; _i327 < _a326.length; _i327++) {
                  const v_s = _a326[_i327];
                  if (!((v_s !== v_r))) continue;
                  let _q328 = true;
                  Q329: {
                    const _a330 = fits(b, sp, cl, v_j);
                    for (let _i331 = 0; _i331 < _a330.length; _i331++) {
                      const v_t = _a330[_i331];
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q328 = false;
                        break Q329;
                      }
                    }
                  }
                  if (_q328) {
                    _q324 = true;
                    break Q325;
                  }
                }
              }
              _c332 = _q324;
            }
            if (!(_c332)) continue;
            _g313.push(v_j);
          }
        }
        const v_Z = _g313;
        _g333.length = 0;
        G334: {
          const _a347 = sp.cells;
          for (let _i348 = 0; _i348 < _a347.length; _i348++) {
            const v_x = _a347[_i348];
            let _q349 = false;
            Q350: {
              const _a351 = v_F;
              for (let _i352 = 0; _i352 < _a351.length; _i352++) {
                const v_s = _a351[_i352];
                if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                let _q353 = false;
                Q354: {
                  const _a355 = reachers(b, sp, cl, v_x);
                  for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                    const v_j = _a355[_i356];
                    if (!((v_j !== v_q))) continue;
                    const _a357 = fits(b, sp, cl, v_j);
                    for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                      const v_t = _a357[_i358];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q353 = true;
                        break Q354;
                      }
                    }
                  }
                }
                if (!(_q353)) {
                  _q349 = true;
                  break Q350;
                }
              }
            }
            if (!(_q349)) continue;
            _g333.push(v_x);
          }
        }
        const v_U = _g333;
        if (import.meta.env.DEV && staleChecking) {
          const _g359: number[] = [];
          G360: {
            const _a363 = v_F;
            for (let _i364 = 0; _i364 < _a363.length; _i364++) {
              const v_r = _a363[_i364];
              if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
              _g359.push(v_r);
            }
          }
          const _g365: number[] = [];
          G366: {
            for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
              let _c384: boolean = (v_j !== v_q);
              if (_c384) {
                let _q376 = false;
                Q377: {
                  const _a378 = v_F;
                  for (let _i379 = 0; _i379 < _a378.length; _i379++) {
                    const v_s = _a378[_i379];
                    if (!((v_s !== v_r))) continue;
                    let _q380 = true;
                    Q381: {
                      const _a382 = fits(b, sp, cl, v_j);
                      for (let _i383 = 0; _i383 < _a382.length; _i383++) {
                        const v_t = _a382[_i383];
                        if (!(rectMeets(sp, v_t, v_s))) {
                          _q380 = false;
                          break Q381;
                        }
                      }
                    }
                    if (_q380) {
                      _q376 = true;
                      break Q377;
                    }
                  }
                }
                _c384 = _q376;
              }
              if (!(_c384)) continue;
              _g365.push(v_j);
            }
          }
          const _g385: number[] = [];
          G386: {
            const _a399 = sp.cells;
            for (let _i400 = 0; _i400 < _a399.length; _i400++) {
              const v_x = _a399[_i400];
              let _q401 = false;
              Q402: {
                const _a403 = v_F;
                for (let _i404 = 0; _i404 < _a403.length; _i404++) {
                  const v_s = _a403[_i404];
                  if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                  let _q405 = false;
                  Q406: {
                    const _a407 = reachers(b, sp, cl, v_x);
                    for (let _i408 = 0; _i408 < _a407.length; _i408++) {
                      const v_j = _a407[_i408];
                      if (!((v_j !== v_q))) continue;
                      const _a409 = fits(b, sp, cl, v_j);
                      for (let _i410 = 0; _i410 < _a409.length; _i410++) {
                        const v_t = _a409[_i410];
                        if (!(rectHolds(sp, v_t, v_x))) continue;
                        if (!(rectMeets(sp, v_t, v_s))) {
                          _q405 = true;
                          break Q406;
                        }
                      }
                    }
                  }
                  if (!(_q405)) {
                    _q401 = true;
                    break Q402;
                  }
                }
              }
              if (!(_q401)) continue;
              _g385.push(v_x);
            }
          }
          freshBinding("starve", [sameSet(v_F, fits(b, sp, cl, v_q)), (v_F.length > 1), sameSet(v_G, _g359), (v_G.length === 1), (v_r === (v_G[0] ?? -1)), sameSet(v_Z, _g365), sameSet(v_U, _g385)], ["F =", "where of F", "G =", "where of G", "r =", "Z =", "U ="]);
        }
        facts.length = 0;
        changed = false;
        let _q411 = true;
        Q412: {
          const _a413 = rectInner(sp, v_r);
          for (let _i414 = 0; _i414 < _a413.length; _i414++) {
            const v_e = _a413[_i414];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q411 = false;
              break Q412;
            }
          }
        }
        let _c419: boolean = _q411;
        if (_c419) {
          let _q415 = true;
          Q416: {
            const _a417 = rectRim(sp, v_r);
            for (let _i418 = 0; _i418 < _a417.length; _i418++) {
              const v_e = _a417[_i418];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q415 = false;
                break Q416;
              }
            }
          }
          _c419 = _q415;
        }
        if (!(_c419)) return -1;
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
const _st586 = stamps();
const _st608 = stamps();

/** Its dearest read grows with the board as n^2. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g525: number[] = [];
  const _g553: number[] = [];
  const _g576: number[] = [];
  const _g596: number[] = [];
  const _g613: number[] = [];
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  if (lineCands.length < sp.edges.length) lineCands = new Int32Array(sp.edges.length);
  const cands = lineCands;
  cands.fill(-1);
  ownedMarkedKept.clear();
  const _a523 = sp.edges;
  for (let _i524 = 0; _i524 < _a523.length; _i524++) {
    const v_e = _a523[_i524];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    _g525.length = 0;
    G526: {
      const _a533 = reachers(b, sp, cl, v_a);
      for (let _i534 = 0; _i534 < _a533.length; _i534++) {
        const v_q = _a533[_i534];
        let _q535 = false;
        Q536: {
          const _a537 = fits(b, sp, cl, v_q);
          for (let _i538 = 0; _i538 < _a537.length; _i538++) {
            const v_r = _a537[_i538];
            if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
              _q535 = true;
              break Q536;
            }
          }
        }
        if (!(_q535)) continue;
        _g525.push(v_q);
      }
    }
    L539: {
      const v_C = _g525;
      const _h540 = v_C.length;
      let _c552: boolean = (_h540 > 0);
      if (_c552) {
        let _q541 = true;
        Q542: {
          const _a543 = v_C;
          for (let _i544 = 0; _i544 < _a543.length; _i544++) {
            const v_q = _a543[_i544];
            const _a545 = fits(b, sp, cl, v_q);
            for (let _i546 = 0; _i546 < _a545.length; _i546++) {
              const v_r = _a545[_i546];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              let _c551: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
              if (!_c551) {
                let _q547 = false;
                Q548: {
                  const _a549 = sole(b, sp, cl, v_q);
                  for (let _i550 = 0; _i550 < _a549.length; _i550++) {
                    const v_x = _a549[_i550];
                    if (!rectHolds(sp, v_r, v_x)) {
                      _q547 = true;
                      break Q548;
                    }
                  }
                }
                _c551 = _q547;
              }
              if (!(_c551)) {
                _q541 = false;
                break Q542;
              }
            }
          }
        }
        _c552 = _q541;
      }
      if (!(_c552)) break L539;
      _g553.length = 0;
      G554: {
        for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
          let _q565 = false;
          Q566: {
            const _a567 = v_C;
            for (let _i568 = 0; _i568 < _a567.length; _i568++) {
              const v_q = _a567[_i568];
              const _h571 = (v_p !== v_q);
              const _a569 = fits(b, sp, cl, v_q);
              for (let _i570 = 0; _i570 < _a569.length; _i570++) {
                const v_r = _a569[_i570];
                if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && _h571))) continue;
                let _q572 = false;
                Q573: {
                  const _a574 = core(b, sp, cl, v_p);
                  for (let _i575 = 0; _i575 < _a574.length; _i575++) {
                    const v_x = _a574[_i575];
                    if (rectHolds(sp, v_r, v_x)) {
                      _q572 = true;
                      break Q573;
                    }
                  }
                }
                if (_q572) {
                  _q565 = true;
                  break Q566;
                }
              }
            }
          }
          if (!(_q565)) continue;
          _g553.push(v_p);
        }
      }
      const v_O = _g553;
      _g576.length = 0;
      _st586.pass++;
      G577: {
        const _a587 = v_C;
        for (let _i588 = 0; _i588 < _a587.length; _i588++) {
          const v_q = _a587[_i588];
          const _a589 = fits(b, sp, cl, v_q);
          for (let _i590 = 0; _i590 < _a589.length; _i590++) {
            const v_r = _a589[_i590];
            if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
            const _a591 = v_O;
            for (let _i592 = 0; _i592 < _a591.length; _i592++) {
              const v_p = _a591[_i592];
              if (!((v_p !== v_q))) continue;
              const _a593 = core(b, sp, cl, v_p);
              for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                const v_x = _a593[_i594];
                if (!(rectHolds(sp, v_r, v_x))) continue;
                const _t595 = v_x;
                if (_g576.length < 16) { if (!_g576.includes(_t595)) _g576.push(_t595); } else addOnce(_g576, _st586, _t595);
              }
            }
          }
        }
      }
      const v_T = _g576;
      _g596.length = 0;
      _st608.pass++;
      G597: {
        const _a609 = v_C;
        for (let _i610 = 0; _i610 < _a609.length; _i610++) {
          const v_q = _a609[_i610];
          const _a611 = fits(b, sp, cl, v_q);
          for (let _i612 = 0; _i612 < _a611.length; _i612++) {
            const v_r = _a611[_i612];
            if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
            _g613.length = 0;
            G614: {
              const _a617 = sole(b, sp, cl, v_q);
              for (let _i618 = 0; _i618 < _a617.length; _i618++) {
                const v_x = _a617[_i618];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                _g613.push(v_x);
              }
            }
            const v_m = (_g613[0] ?? -1);
            const _t619 = v_m;
            if (_g596.length < 16) { if (!_g596.includes(_t619)) _g596.push(_t619); } else addOnce(_g596, _st608, _t619);
          }
        }
      }
      const v_M = _g596;
      if (import.meta.env.DEV && staleChecking) {
        const _g620: number[] = [];
        G621: {
          const _a628 = reachers(b, sp, cl, v_a);
          for (let _i629 = 0; _i629 < _a628.length; _i629++) {
            const v_q = _a628[_i629];
            let _q630 = false;
            Q631: {
              const _a632 = fits(b, sp, cl, v_q);
              for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                const v_r = _a632[_i633];
                if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
                  _q630 = true;
                  break Q631;
                }
              }
            }
            if (!(_q630)) continue;
            _g620.push(v_q);
          }
        }
        let _c645: boolean = (v_C.length > 0);
        if (_c645) {
          let _q634 = true;
          Q635: {
            const _a636 = v_C;
            for (let _i637 = 0; _i637 < _a636.length; _i637++) {
              const v_q = _a636[_i637];
              const _a638 = fits(b, sp, cl, v_q);
              for (let _i639 = 0; _i639 < _a638.length; _i639++) {
                const v_r = _a638[_i639];
                if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
                let _c644: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
                if (!_c644) {
                  let _q640 = false;
                  Q641: {
                    const _a642 = sole(b, sp, cl, v_q);
                    for (let _i643 = 0; _i643 < _a642.length; _i643++) {
                      const v_x = _a642[_i643];
                      if (!rectHolds(sp, v_r, v_x)) {
                        _q640 = true;
                        break Q641;
                      }
                    }
                  }
                  _c644 = _q640;
                }
                if (!(_c644)) {
                  _q634 = false;
                  break Q635;
                }
              }
            }
          }
          _c645 = _q634;
        }
        const _g646: number[] = [];
        G647: {
          for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
            let _q658 = false;
            Q659: {
              const _a660 = v_C;
              for (let _i661 = 0; _i661 < _a660.length; _i661++) {
                const v_q = _a660[_i661];
                const _a662 = fits(b, sp, cl, v_q);
                for (let _i663 = 0; _i663 < _a662.length; _i663++) {
                  const v_r = _a662[_i663];
                  if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && (v_p !== v_q)))) continue;
                  let _q664 = false;
                  Q665: {
                    const _a666 = core(b, sp, cl, v_p);
                    for (let _i667 = 0; _i667 < _a666.length; _i667++) {
                      const v_x = _a666[_i667];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q664 = true;
                        break Q665;
                      }
                    }
                  }
                  if (_q664) {
                    _q658 = true;
                    break Q659;
                  }
                }
              }
            }
            if (!(_q658)) continue;
            _g646.push(v_p);
          }
        }
        const _g668: number[] = [];
        G669: {
          const _a678 = v_C;
          for (let _i679 = 0; _i679 < _a678.length; _i679++) {
            const v_q = _a678[_i679];
            const _a680 = fits(b, sp, cl, v_q);
            for (let _i681 = 0; _i681 < _a680.length; _i681++) {
              const v_r = _a680[_i681];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              const _a682 = v_O;
              for (let _i683 = 0; _i683 < _a682.length; _i683++) {
                const v_p = _a682[_i683];
                if (!((v_p !== v_q))) continue;
                const _a684 = core(b, sp, cl, v_p);
                for (let _i685 = 0; _i685 < _a684.length; _i685++) {
                  const v_x = _a684[_i685];
                  if (!(rectHolds(sp, v_r, v_x))) continue;
                  if (!_g668.includes(v_x)) _g668.push(v_x);
                }
              }
            }
          }
        }
        const _g686: number[] = [];
        G687: {
          const _a698 = v_C;
          for (let _i699 = 0; _i699 < _a698.length; _i699++) {
            const v_q = _a698[_i699];
            const _a700 = fits(b, sp, cl, v_q);
            for (let _i701 = 0; _i701 < _a700.length; _i701++) {
              const v_r = _a700[_i701];
              if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
              const _g702: number[] = [];
              G703: {
                const _a706 = sole(b, sp, cl, v_q);
                for (let _i707 = 0; _i707 < _a706.length; _i707++) {
                  const v_x = _a706[_i707];
                  if (!(!rectHolds(sp, v_r, v_x))) continue;
                  _g702.push(v_x);
                }
              }
              const v_m = (_g702[0] ?? -1);
              if (!_g686.includes(v_m)) _g686.push(v_m);
            }
          }
        }
        freshBinding("line", [(sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), sameSet(v_C, _g620), _c645, sameSet(v_O, _g646), sameSet(v_T, _g668), sameSet(v_M, _g686)], ["e in", "where of e", "a =", "b =", "C =", "where of C", "O =", "T =", "M ="]);
      }
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
  const _g156: number[] = [];
  G157: {
    const _a164 = rectCells(sp, (fits(b, sp, cl, v_q)[0] ?? -1));
    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
      const v_x = _a164[_i165];
      let _q166 = true;
      Q167: {
        const _a168 = fits(b, sp, cl, v_q);
        for (let _i169 = 0; _i169 < _a168.length; _i169++) {
          const v_r = _a168[_i169];
          if (!(rectHolds(sp, v_r, v_x))) {
            _q166 = false;
            break Q167;
          }
        }
      }
      if (!(_q166)) continue;
      _g156.push(v_x);
    }
  }
  const _made = _g156;
  _kept[v_q] = _made;
  return _made;
}

const starvesMarkedKept = new Map<number, boolean>();

/** `starves(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function starvesMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = starvesMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q237 = false;
  Q238: {
    for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
      if (!((v_j !== v_q))) continue;
      let _q239 = true;
      Q240: {
        const _a241 = fits(b, sp, cl, v_j);
        for (let _i242 = 0; _i242 < _a241.length; _i242++) {
          const v_t = _a241[_i242];
          if (!(rectMeets(sp, v_t, v_r))) {
            _q239 = false;
            break Q240;
          }
        }
      }
      if (_q239) {
        _q237 = true;
        break Q238;
      }
    }
  }
  let _c253: boolean = _q237;
  if (!_c253) {
    let _q243 = false;
    Q244: {
      const _a245 = sp.cells;
      for (let _i246 = 0; _i246 < _a245.length; _i246++) {
        const v_x = _a245[_i246];
        if (!(!rectHolds(sp, v_r, v_x))) continue;
        let _q247 = false;
        Q248: {
          const _a249 = reachers(b, sp, cl, v_x);
          for (let _i250 = 0; _i250 < _a249.length; _i250++) {
            const v_j = _a249[_i250];
            if (!((v_j !== v_q))) continue;
            const _a251 = fits(b, sp, cl, v_j);
            for (let _i252 = 0; _i252 < _a251.length; _i252++) {
              const v_t = _a251[_i252];
              if (!(rectHolds(sp, v_t, v_x))) continue;
              if (!(rectMeets(sp, v_t, v_r))) {
                _q247 = true;
                break Q248;
              }
            }
          }
        }
        if (!(_q247)) {
          _q243 = true;
          break Q244;
        }
      }
    }
    _c253 = _q243;
  }
  const _made = _c253;
  starvesMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const ownedMarkedKept = new Map<number, boolean>();

/** `owned(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function ownedMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = ownedMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q443 = false;
  Q444: {
    for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
      if (!((v_p !== v_q))) continue;
      let _q445 = false;
      Q446: {
        const _a447 = core(b, sp, cl, v_p);
        for (let _i448 = 0; _i448 < _a447.length; _i448++) {
          const v_x = _a447[_i448];
          if (rectHolds(sp, v_r, v_x)) {
            _q445 = true;
            break Q446;
          }
        }
      }
      if (_q445) {
        _q443 = true;
        break Q444;
      }
    }
  }
  const _made = _q443;
  ownedMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const soleKept = keptStore<readonly number[]>();

/** `sole(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sole(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = soleKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g449: number[] = [];
  G450: {
    const _a453 = sp.cells;
    for (let _i454 = 0; _i454 < _a453.length; _i454++) {
      const v_x = _a453[_i454];
      if (!(((reachers(b, sp, cl, v_x).length === 1) && (reachers(b, sp, cl, v_x).includes(v_q))))) continue;
      _g449.push(v_x);
    }
  }
  const _made = _g449;
  _kept[v_q] = _made;
  return _made;
}
