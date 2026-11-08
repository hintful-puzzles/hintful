// Compiled by `npm run describe` from src/games/rect/rect.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, edgeGroups, keptStore, rangeMask, rectCells, rectHeight, rectHolds, rectInner, rectMeets, rectRim, rectWidth, rectsOf, type Kept } from "../../engine/describe-runtime.ts";

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
  const _g538: number[] = [];
  const _g559: number[] = [];
  const _g579: number[] = [];
  const _g593: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q536 = true;
  Q537: {
    _g538.length = 0;
    G539: {
      const _a542 = sp.edges;
      for (let _i543 = 0; _i543 < _a542.length; _i543++) {
        const v_e = _a542[_i543];
        const _h544 = (g[v_e] || -1);
        if (!((_h544 === 2))) continue;
        _g538.push(v_e);
      }
    }
    const v_O = _g538;
    const _eg548 = edgeGroups(sp, v_O);
    const _a545 = sp.edges;
    for (let _i546 = 0; _i546 < _a545.length; _i546++) {
      const v_e = _a545[_i546];
      const _h547 = (g[v_e] || -1);
      if (!(((_h547 === 1) === !(_eg548.of(sp.edgeEnds[2 * v_e + 1]) === _eg548.of(sp.edgeEnds[2 * v_e]))))) {
        _q536 = false;
        break Q537;
      }
    }
  }
  if (!(_q536)) return false;
  let _q549 = true;
  Q550: {
    const _a551 = sp.corners;
    for (let _i552 = 0; _i552 < _a551.length; _i552++) {
      const v_p = _a551[_i552];
      const v_C = sp.cornerCells[v_p];
      const v_a = (v_C[0] ?? -1);
      const v_b = (v_C[1] ?? -1);
      const _h553 = (g[sp.edgeOf(v_a, v_b)] || -1);
      const v_c = (v_C[2] ?? -1);
      const _h555 = (g[sp.edgeOf(v_a, v_c)] || -1);
      const v_d = (v_C[3] ?? -1);
      const _h554 = (g[sp.edgeOf(v_c, v_d)] || -1);
      const _h556 = (g[sp.edgeOf(v_b, v_d)] || -1);
      if (!((((_h553 === 1) === (_h554 === 1)) || ((_h555 === 1) === (_h556 === 1))))) {
        _q549 = false;
        break Q550;
      }
    }
  }
  if (!(_q549)) return false;
  let _q557 = true;
  Q558: {
    _g559.length = 0;
    G560: {
      const _a563 = sp.edges;
      for (let _i564 = 0; _i564 < _a563.length; _i564++) {
        const v_e = _a563[_i564];
        const _h565 = (g[v_e] || -1);
        if (!((_h565 === 2))) continue;
        _g559.push(v_e);
      }
    }
    const v_O = _g559;
    const _eg570 = edgeGroups(sp, v_O);
    const _a566 = sp.cells;
    for (let _i567 = 0; _i567 < _a566.length; _i567++) {
      const v_c = _a566[_i567];
      let _g568 = 0;
      G569: {
        const _a571 = _eg570.of(v_c);
        for (let _i572 = 0; _i572 < _a571.length; _i572++) {
          const v_x = _a571[_i572];
          const _h573 = clueAt(cl.number, v_x);
          if (!((_h573 !== -1))) continue;
          _g568++;
        }
      }
      if (!((_g568 === 1))) {
        _q557 = false;
        break Q558;
      }
    }
  }
  if (!(_q557)) return false;
  for (let _k574 = 0; _k574 < cl.number.at.length; _k574++) {
    const _at575 = cl.number.at[_k574];
    const _v576 = cl.number.v[_k574];
    let _c587: boolean = (_v576 === 0);
    if (!_c587) {
      let _q577 = true;
      Q578: {
        _g579.length = 0;
        G580: {
          const _a583 = sp.edges;
          for (let _i584 = 0; _i584 < _a583.length; _i584++) {
            const v_e = _a583[_i584];
            const _h585 = (g[v_e] || -1);
            if (!((_h585 === 2))) continue;
            _g579.push(v_e);
          }
        }
        const v_O = _g579;
        const _eg586 = edgeGroups(sp, v_O);
        if (!((_eg586.of(_at575).length === _v576))) {
          _q577 = false;
          break Q578;
        }
      }
      _c587 = _q577;
    }
    if (!(_c587)) return false;
  }
  for (let _k588 = 0; _k588 < cl.shape.at.length; _k588++) {
    const _at589 = cl.shape.at[_k588];
    const _v590 = cl.shape.v[_k588];
    let _q591 = true;
    Q592: {
      _g593.length = 0;
      G594: {
        const _a597 = sp.edges;
        for (let _i598 = 0; _i598 < _a597.length; _i598++) {
          const v_e = _a597[_i598];
          const _h599 = (g[v_e] || -1);
          if (!((_h599 === 2))) continue;
          _g593.push(v_e);
        }
      }
      const v_O = _g593;
      const _eg600 = edgeGroups(sp, v_O);
      const v_R = _eg600.of(_at589);
      let _g601 = 0;
      G602: {
        const _a603 = v_R;
        for (let _i604 = 0; _i604 < _a603.length; _i604++) {
          const v_s = _a603[_i604];
          if (!((((v_s / sp.w) | 0) === ((_at589 / sp.w) | 0)))) continue;
          _g601++;
        }
      }
      const v_n = _g601;
      let _g605 = 0;
      G606: {
        const _a607 = v_R;
        for (let _i608 = 0; _i608 < _a607.length; _i608++) {
          const v_s = _a607[_i608];
          if (!(((v_s % sp.w) === (_at589 % sp.w)))) continue;
          _g605++;
        }
      }
      const v_m = _g605;
      if (!((((!((_v590 === 1)) || (v_n === v_m)) && (!((_v590 === 2)) || (v_m > v_n))) && (!((_v590 === 3)) || (v_n > v_m))))) {
        _q591 = false;
        break Q592;
      }
    }
    if (!(_q591)) return false;
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
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
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
  const _g179: number[] = [];
  const facts = overlapFacts;
  let fired = 0;
  let changed = false;
  for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
    L175: {
      const v_K = core(b, sp, cl, v_p);
      const _h176 = v_K.length;
      if (!((_h176 > 1))) break L175;
      for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
        if (!((v_q !== v_p))) continue;
        L177: {
          const v_F = fits(b, sp, cl, v_q);
          const _h178 = v_F.length;
          if (!((_h178 > 1))) break L177;
          _g179.length = 0;
          G180: {
            const _a187 = v_F;
            for (let _i188 = 0; _i188 < _a187.length; _i188++) {
              const v_r = _a187[_i188];
              let _q189 = false;
              Q190: {
                const _a191 = v_K;
                for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                  const v_x = _a191[_i192];
                  if (rectHolds(sp, v_r, v_x)) {
                    _q189 = true;
                    break Q190;
                  }
                }
              }
              if (!(!(_q189))) continue;
              _g179.push(v_r);
            }
          }
          L193: {
            const v_G = _g179;
            const _h194 = v_G.length;
            if (!(((_h194 === 1) && (_h194 < _h178)))) break L193;
            const v_r = (v_G[0] ?? -1);
            facts.length = 0;
            changed = false;
            let _q195 = true;
            Q196: {
              const _a197 = rectInner(sp, v_r);
              for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                const v_e = _a197[_i198];
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                if (!(true)) {
                  _q195 = false;
                  break Q196;
                }
              }
            }
            let _c203: boolean = _q195;
            if (_c203) {
              let _q199 = true;
              Q200: {
                const _a201 = rectRim(sp, v_r);
                for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                  const v_e = _a201[_i202];
                  if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                  if (!(true)) {
                    _q199 = false;
                    break Q200;
                  }
                }
              }
              _c203 = _q199;
            }
            if (!(_c203)) return -1;
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
  const _g277: number[] = [];
  const _g285: number[] = [];
  const _g305: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  if (starveCands.length < sp.edges.length) starveCands = new Int32Array(sp.edges.length);
  const cands = starveCands;
  cands.fill(-1);
  starvesMarkedKept.clear();
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    L275: {
      const v_F = fits(b, sp, cl, v_q);
      const _h276 = v_F.length;
      if (!((_h276 > 1))) break L275;
      _g277.length = 0;
      G278: {
        const _a281 = v_F;
        for (let _i282 = 0; _i282 < _a281.length; _i282++) {
          const v_r = _a281[_i282];
          if (!(!(starvesMarked(b, sp, cl, cands, v_q, v_r)))) continue;
          _g277.push(v_r);
        }
      }
      L283: {
        const v_G = _g277;
        const _h284 = v_G.length;
        if (!((_h284 === 1))) break L283;
        const v_r = (v_G[0] ?? -1);
        _g285.length = 0;
        G286: {
          for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
            let _c304: boolean = (v_j !== v_q);
            if (_c304) {
              let _q296 = false;
              Q297: {
                const _a298 = v_F;
                for (let _i299 = 0; _i299 < _a298.length; _i299++) {
                  const v_s = _a298[_i299];
                  if (!((v_s !== v_r))) continue;
                  let _q300 = true;
                  Q301: {
                    const _a302 = fits(b, sp, cl, v_j);
                    for (let _i303 = 0; _i303 < _a302.length; _i303++) {
                      const v_t = _a302[_i303];
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q300 = false;
                        break Q301;
                      }
                    }
                  }
                  if (_q300) {
                    _q296 = true;
                    break Q297;
                  }
                }
              }
              _c304 = _q296;
            }
            if (!(_c304)) continue;
            _g285.push(v_j);
          }
        }
        const v_Z = _g285;
        _g305.length = 0;
        G306: {
          const _a319 = sp.cells;
          for (let _i320 = 0; _i320 < _a319.length; _i320++) {
            const v_x = _a319[_i320];
            let _q321 = false;
            Q322: {
              const _a323 = v_F;
              for (let _i324 = 0; _i324 < _a323.length; _i324++) {
                const v_s = _a323[_i324];
                if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                let _q325 = false;
                Q326: {
                  const _a327 = reachers(b, sp, cl, v_x);
                  for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                    const v_j = _a327[_i328];
                    if (!((v_j !== v_q))) continue;
                    const _a329 = fits(b, sp, cl, v_j);
                    for (let _i330 = 0; _i330 < _a329.length; _i330++) {
                      const v_t = _a329[_i330];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q325 = true;
                        break Q326;
                      }
                    }
                  }
                }
                if (!(_q325)) {
                  _q321 = true;
                  break Q322;
                }
              }
            }
            if (!(_q321)) continue;
            _g305.push(v_x);
          }
        }
        const v_U = _g305;
        facts.length = 0;
        changed = false;
        let _q331 = true;
        Q332: {
          const _a333 = rectInner(sp, v_r);
          for (let _i334 = 0; _i334 < _a333.length; _i334++) {
            const v_e = _a333[_i334];
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q331 = false;
              break Q332;
            }
          }
        }
        let _c339: boolean = _q331;
        if (_c339) {
          let _q335 = true;
          Q336: {
            const _a337 = rectRim(sp, v_r);
            for (let _i338 = 0; _i338 < _a337.length; _i338++) {
              const v_e = _a337[_i338];
              if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q335 = false;
                break Q336;
              }
            }
          }
          _c339 = _q335;
        }
        if (!(_c339)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g445: number[] = [];
  const _g473: number[] = [];
  const _g496: number[] = [];
  const _g514: number[] = [];
  const _g530: number[] = [];
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  if (lineCands.length < sp.edges.length) lineCands = new Int32Array(sp.edges.length);
  const cands = lineCands;
  cands.fill(-1);
  ownedMarkedKept.clear();
  const _a443 = sp.edges;
  for (let _i444 = 0; _i444 < _a443.length; _i444++) {
    const v_e = _a443[_i444];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    _g445.length = 0;
    G446: {
      const _a453 = reachers(b, sp, cl, v_a);
      for (let _i454 = 0; _i454 < _a453.length; _i454++) {
        const v_q = _a453[_i454];
        let _q455 = false;
        Q456: {
          const _a457 = fits(b, sp, cl, v_q);
          for (let _i458 = 0; _i458 < _a457.length; _i458++) {
            const v_r = _a457[_i458];
            if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
              _q455 = true;
              break Q456;
            }
          }
        }
        if (!(_q455)) continue;
        _g445.push(v_q);
      }
    }
    L459: {
      const v_C = _g445;
      const _h460 = v_C.length;
      let _c472: boolean = (_h460 > 0);
      if (_c472) {
        let _q461 = true;
        Q462: {
          const _a463 = v_C;
          for (let _i464 = 0; _i464 < _a463.length; _i464++) {
            const v_q = _a463[_i464];
            const _a465 = fits(b, sp, cl, v_q);
            for (let _i466 = 0; _i466 < _a465.length; _i466++) {
              const v_r = _a465[_i466];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              let _c471: boolean = ownedMarked(b, sp, cl, cands, v_q, v_r);
              if (!_c471) {
                let _q467 = false;
                Q468: {
                  const _a469 = sole(b, sp, cl, v_q);
                  for (let _i470 = 0; _i470 < _a469.length; _i470++) {
                    const v_x = _a469[_i470];
                    if (!rectHolds(sp, v_r, v_x)) {
                      _q467 = true;
                      break Q468;
                    }
                  }
                }
                _c471 = _q467;
              }
              if (!(_c471)) {
                _q461 = false;
                break Q462;
              }
            }
          }
        }
        _c472 = _q461;
      }
      if (!(_c472)) break L459;
      _g473.length = 0;
      G474: {
        for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
          let _q485 = false;
          Q486: {
            const _a487 = v_C;
            for (let _i488 = 0; _i488 < _a487.length; _i488++) {
              const v_q = _a487[_i488];
              const _h491 = (v_p !== v_q);
              const _a489 = fits(b, sp, cl, v_q);
              for (let _i490 = 0; _i490 < _a489.length; _i490++) {
                const v_r = _a489[_i490];
                if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && _h491))) continue;
                let _q492 = false;
                Q493: {
                  const _a494 = core(b, sp, cl, v_p);
                  for (let _i495 = 0; _i495 < _a494.length; _i495++) {
                    const v_x = _a494[_i495];
                    if (rectHolds(sp, v_r, v_x)) {
                      _q492 = true;
                      break Q493;
                    }
                  }
                }
                if (_q492) {
                  _q485 = true;
                  break Q486;
                }
              }
            }
          }
          if (!(_q485)) continue;
          _g473.push(v_p);
        }
      }
      const v_O = _g473;
      _g496.length = 0;
      G497: {
        const _a506 = v_C;
        for (let _i507 = 0; _i507 < _a506.length; _i507++) {
          const v_q = _a506[_i507];
          const _a508 = fits(b, sp, cl, v_q);
          for (let _i509 = 0; _i509 < _a508.length; _i509++) {
            const v_r = _a508[_i509];
            if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
            const _a510 = v_O;
            for (let _i511 = 0; _i511 < _a510.length; _i511++) {
              const v_p = _a510[_i511];
              if (!((v_p !== v_q))) continue;
              const _a512 = core(b, sp, cl, v_p);
              for (let _i513 = 0; _i513 < _a512.length; _i513++) {
                const v_x = _a512[_i513];
                if (!(rectHolds(sp, v_r, v_x))) continue;
                if (!_g496.includes(v_x)) _g496.push(v_x);
              }
            }
          }
        }
      }
      const v_T = _g496;
      _g514.length = 0;
      G515: {
        const _a526 = v_C;
        for (let _i527 = 0; _i527 < _a526.length; _i527++) {
          const v_q = _a526[_i527];
          const _a528 = fits(b, sp, cl, v_q);
          for (let _i529 = 0; _i529 < _a528.length; _i529++) {
            const v_r = _a528[_i529];
            if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && !(ownedMarked(b, sp, cl, cands, v_q, v_r))))) continue;
            _g530.length = 0;
            G531: {
              const _a534 = sole(b, sp, cl, v_q);
              for (let _i535 = 0; _i535 < _a534.length; _i535++) {
                const v_x = _a534[_i535];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                _g530.push(v_x);
              }
            }
            const v_m = (_g530[0] ?? -1);
            if (!_g514.includes(v_m)) _g514.push(v_m);
          }
        }
      }
      const v_M = _g514;
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

/** `allowed(q)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function allowed(sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = allowedKept.board(cl);
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

/** `near(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearKept.board(cl);
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
  const _g144: number[] = [];
  G145: {
    const _a152 = rectCells(sp, (fits(b, sp, cl, v_q)[0] ?? -1));
    for (let _i153 = 0; _i153 < _a152.length; _i153++) {
      const v_x = _a152[_i153];
      let _q154 = true;
      Q155: {
        const _a156 = fits(b, sp, cl, v_q);
        for (let _i157 = 0; _i157 < _a156.length; _i157++) {
          const v_r = _a156[_i157];
          if (!(rectHolds(sp, v_r, v_x))) {
            _q154 = false;
            break Q155;
          }
        }
      }
      if (!(_q154)) continue;
      _g144.push(v_x);
    }
  }
  const _made = _g144;
  _kept[v_q] = _made;
  return _made;
}

const starvesMarkedKept = new Map<number, boolean>();

/** `starves(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function starvesMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = starvesMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q209 = false;
  Q210: {
    for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
      if (!((v_j !== v_q))) continue;
      let _q211 = true;
      Q212: {
        const _a213 = fits(b, sp, cl, v_j);
        for (let _i214 = 0; _i214 < _a213.length; _i214++) {
          const v_t = _a213[_i214];
          if (!(rectMeets(sp, v_t, v_r))) {
            _q211 = false;
            break Q212;
          }
        }
      }
      if (_q211) {
        _q209 = true;
        break Q210;
      }
    }
  }
  let _c225: boolean = _q209;
  if (!_c225) {
    let _q215 = false;
    Q216: {
      const _a217 = sp.cells;
      for (let _i218 = 0; _i218 < _a217.length; _i218++) {
        const v_x = _a217[_i218];
        if (!(!rectHolds(sp, v_r, v_x))) continue;
        let _q219 = false;
        Q220: {
          const _a221 = reachers(b, sp, cl, v_x);
          for (let _i222 = 0; _i222 < _a221.length; _i222++) {
            const v_j = _a221[_i222];
            if (!((v_j !== v_q))) continue;
            const _a223 = fits(b, sp, cl, v_j);
            for (let _i224 = 0; _i224 < _a223.length; _i224++) {
              const v_t = _a223[_i224];
              if (!(rectHolds(sp, v_t, v_x))) continue;
              if (!(rectMeets(sp, v_t, v_r))) {
                _q219 = true;
                break Q220;
              }
            }
          }
        }
        if (!(_q219)) {
          _q215 = true;
          break Q216;
        }
      }
    }
    _c225 = _q215;
  }
  const _made = _c225;
  starvesMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const ownedMarkedKept = new Map<number, boolean>();

/** `owned(q, r)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function ownedMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_q: number, v_r: number): boolean {
  const _was = ownedMarkedKept.get((v_q + 1) * 1048577 + (v_r + 1));
  if (_was !== undefined) return _was;
  let _q363 = false;
  Q364: {
    for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
      if (!((v_p !== v_q))) continue;
      let _q365 = false;
      Q366: {
        const _a367 = core(b, sp, cl, v_p);
        for (let _i368 = 0; _i368 < _a367.length; _i368++) {
          const v_x = _a367[_i368];
          if (rectHolds(sp, v_r, v_x)) {
            _q365 = true;
            break Q366;
          }
        }
      }
      if (_q365) {
        _q363 = true;
        break Q364;
      }
    }
  }
  const _made = _q363;
  ownedMarkedKept.set((v_q + 1) * 1048577 + (v_r + 1), _made);
  return _made;
}

const soleKept = keptStore<readonly number[]>();

/** `sole(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sole(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = soleKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g369: number[] = [];
  G370: {
    const _a373 = sp.cells;
    for (let _i374 = 0; _i374 < _a373.length; _i374++) {
      const v_x = _a373[_i374];
      if (!(((reachers(b, sp, cl, v_x).length === 1) && (reachers(b, sp, cl, v_x).includes(v_q))))) continue;
      _g369.push(v_x);
    }
  }
  const _made = _g369;
  _kept[v_q] = _made;
  return _made;
}
