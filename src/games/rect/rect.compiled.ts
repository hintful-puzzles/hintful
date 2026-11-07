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
  const _g623: number[] = [];
  const _g644: number[] = [];
  const _g664: number[] = [];
  const _g678: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q621 = true;
  Q622: {
    _g623.length = 0;
    G624: {
      const _a627 = sp.edges;
      for (let _i628 = 0; _i628 < _a627.length; _i628++) {
        const v_e = _a627[_i628];
        const _h629 = (g[v_e] || -1);
        if (!((_h629 === 2))) continue;
        _g623.push(v_e);
      }
    }
    const v_O = _g623;
    const _eg633 = edgeGroups(sp, v_O);
    const _a630 = sp.edges;
    for (let _i631 = 0; _i631 < _a630.length; _i631++) {
      const v_e = _a630[_i631];
      const _h632 = (g[v_e] || -1);
      if (!(((_h632 === 1) === !(_eg633.of(sp.edgeEnds[2 * v_e + 1]) === _eg633.of(sp.edgeEnds[2 * v_e]))))) {
        _q621 = false;
        break Q622;
      }
    }
  }
  if (!(_q621)) return false;
  let _q634 = true;
  Q635: {
    const _a636 = sp.corners;
    for (let _i637 = 0; _i637 < _a636.length; _i637++) {
      const v_p = _a636[_i637];
      const v_C = sp.cornerCells[v_p];
      const v_a = (v_C[0] ?? -1);
      const v_b = (v_C[1] ?? -1);
      const _h638 = (g[sp.edgeOf(v_a, v_b)] || -1);
      const v_c = (v_C[2] ?? -1);
      const _h640 = (g[sp.edgeOf(v_a, v_c)] || -1);
      const v_d = (v_C[3] ?? -1);
      const _h639 = (g[sp.edgeOf(v_c, v_d)] || -1);
      const _h641 = (g[sp.edgeOf(v_b, v_d)] || -1);
      if (!((((_h638 === 1) === (_h639 === 1)) || ((_h640 === 1) === (_h641 === 1))))) {
        _q634 = false;
        break Q635;
      }
    }
  }
  if (!(_q634)) return false;
  let _q642 = true;
  Q643: {
    _g644.length = 0;
    G645: {
      const _a648 = sp.edges;
      for (let _i649 = 0; _i649 < _a648.length; _i649++) {
        const v_e = _a648[_i649];
        const _h650 = (g[v_e] || -1);
        if (!((_h650 === 2))) continue;
        _g644.push(v_e);
      }
    }
    const v_O = _g644;
    const _eg655 = edgeGroups(sp, v_O);
    const _a651 = sp.cells;
    for (let _i652 = 0; _i652 < _a651.length; _i652++) {
      const v_c = _a651[_i652];
      let _g653 = 0;
      G654: {
        const _a656 = _eg655.of(v_c);
        for (let _i657 = 0; _i657 < _a656.length; _i657++) {
          const v_x = _a656[_i657];
          const _h658 = clueAt(cl.number, v_x);
          if (!((_h658 !== -1))) continue;
          _g653++;
        }
      }
      if (!((_g653 === 1))) {
        _q642 = false;
        break Q643;
      }
    }
  }
  if (!(_q642)) return false;
  for (let _k659 = 0; _k659 < cl.number.at.length; _k659++) {
    const _at660 = cl.number.at[_k659];
    const _v661 = cl.number.v[_k659];
    let _c672: boolean = (_v661 === 0);
    if (!_c672) {
      let _q662 = true;
      Q663: {
        _g664.length = 0;
        G665: {
          const _a668 = sp.edges;
          for (let _i669 = 0; _i669 < _a668.length; _i669++) {
            const v_e = _a668[_i669];
            const _h670 = (g[v_e] || -1);
            if (!((_h670 === 2))) continue;
            _g664.push(v_e);
          }
        }
        const v_O = _g664;
        const _eg671 = edgeGroups(sp, v_O);
        if (!((_eg671.of(_at660).length === _v661))) {
          _q662 = false;
          break Q663;
        }
      }
      _c672 = _q662;
    }
    if (!(_c672)) return false;
  }
  for (let _k673 = 0; _k673 < cl.shape.at.length; _k673++) {
    const _at674 = cl.shape.at[_k673];
    const _v675 = cl.shape.v[_k673];
    let _q676 = true;
    Q677: {
      _g678.length = 0;
      G679: {
        const _a682 = sp.edges;
        for (let _i683 = 0; _i683 < _a682.length; _i683++) {
          const v_e = _a682[_i683];
          const _h684 = (g[v_e] || -1);
          if (!((_h684 === 2))) continue;
          _g678.push(v_e);
        }
      }
      const v_O = _g678;
      const _eg685 = edgeGroups(sp, v_O);
      const v_R = _eg685.of(_at674);
      let _g686 = 0;
      G687: {
        const _a688 = v_R;
        for (let _i689 = 0; _i689 < _a688.length; _i689++) {
          const v_s = _a688[_i689];
          if (!((((v_s / sp.w) | 0) === ((_at674 / sp.w) | 0)))) continue;
          _g686++;
        }
      }
      const v_n = _g686;
      let _g690 = 0;
      G691: {
        const _a692 = v_R;
        for (let _i693 = 0; _i693 < _a692.length; _i693++) {
          const v_s = _a692[_i693];
          if (!(((v_s % sp.w) === (_at674 % sp.w)))) continue;
          _g690++;
        }
      }
      const v_m = _g690;
      if (!((((!((_v675 === 1)) || (v_n === v_m)) && (!((_v675 === 2)) || (v_m > v_n))) && (!((_v675 === 3)) || (v_n > v_m))))) {
        _q676 = false;
        break Q677;
      }
    }
    if (!(_q676)) return false;
  }
  return true;
}

export interface FitBinding {
  q: number;
  F: readonly number[];
}

const fitFacts: number[] = [];

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
                if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
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
                  if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
      if (fire !== null && !fire({ q: v_q, F: v_F }, facts)) return 1;
    }
  }
  return fired;
}

export interface UncoveredBinding {
  c: number;
}

const uncoveredFacts: number[] = [];

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
            if (!((b.value(v_e) === 1))) {
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
            if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
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
              if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
          if (fire !== null && !fire({ q: v_q, F: v_F, r: v_r }, facts)) return 1;
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
            if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
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
              if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
          if (fire !== null && !fire({ c: v_c, Q: v_Q, q: v_q, F: v_F, r: v_r }, facts)) return 1;
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
                if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
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
                  if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
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
              if (fire !== null && !fire({ p: v_p, K: v_K, q: v_q, F: v_F, G: v_G, r: v_r }, facts)) return 1;
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

export function starve(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarveBinding> | null): number {
  const _g294: number[] = [];
  const _g336: number[] = [];
  const _g356: number[] = [];
  const facts = starveFacts;
  let fired = 0;
  let changed = false;
  for (let v_q = 0; v_q < cl.number.at.length; v_q++) {
    L292: {
      const v_F = fits(b, sp, cl, v_q);
      const _h293 = v_F.length;
      if (!((_h293 > 1))) break L292;
      _g294.length = 0;
      G295: {
        const _a315 = v_F;
        for (let _i316 = 0; _i316 < _a315.length; _i316++) {
          const v_r = _a315[_i316];
          let _q317 = false;
          Q318: {
            for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
              if (!((v_j !== v_q))) continue;
              let _q319 = true;
              Q320: {
                const _a321 = fits(b, sp, cl, v_j);
                for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                  const v_t = _a321[_i322];
                  if (!(rectMeets(sp, v_t, v_r))) {
                    _q319 = false;
                    break Q320;
                  }
                }
              }
              if (_q319) {
                _q317 = true;
                break Q318;
              }
            }
          }
          let _c333: boolean = _q317;
          if (!_c333) {
            let _q323 = false;
            Q324: {
              const _a325 = sp.cells;
              for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                const v_x = _a325[_i326];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                let _q327 = false;
                Q328: {
                  const _a329 = reachers(b, sp, cl, v_x);
                  for (let _i330 = 0; _i330 < _a329.length; _i330++) {
                    const v_j = _a329[_i330];
                    if (!((v_j !== v_q))) continue;
                    const _a331 = fits(b, sp, cl, v_j);
                    for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                      const v_t = _a331[_i332];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_r))) {
                        _q327 = true;
                        break Q328;
                      }
                    }
                  }
                }
                if (!(_q327)) {
                  _q323 = true;
                  break Q324;
                }
              }
            }
            _c333 = _q323;
          }
          if (!(!(_c333))) continue;
          _g294.push(v_r);
        }
      }
      L334: {
        const v_G = _g294;
        const _h335 = v_G.length;
        if (!((_h335 === 1))) break L334;
        const v_r = (v_G[0] ?? -1);
        _g336.length = 0;
        G337: {
          for (let v_j = 0; v_j < cl.number.at.length; v_j++) {
            let _c355: boolean = (v_j !== v_q);
            if (_c355) {
              let _q347 = false;
              Q348: {
                const _a349 = v_F;
                for (let _i350 = 0; _i350 < _a349.length; _i350++) {
                  const v_s = _a349[_i350];
                  if (!((v_s !== v_r))) continue;
                  let _q351 = true;
                  Q352: {
                    const _a353 = fits(b, sp, cl, v_j);
                    for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                      const v_t = _a353[_i354];
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q351 = false;
                        break Q352;
                      }
                    }
                  }
                  if (_q351) {
                    _q347 = true;
                    break Q348;
                  }
                }
              }
              _c355 = _q347;
            }
            if (!(_c355)) continue;
            _g336.push(v_j);
          }
        }
        const v_Z = _g336;
        _g356.length = 0;
        G357: {
          const _a370 = sp.cells;
          for (let _i371 = 0; _i371 < _a370.length; _i371++) {
            const v_x = _a370[_i371];
            let _q372 = false;
            Q373: {
              const _a374 = v_F;
              for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                const v_s = _a374[_i375];
                if (!(((v_s !== v_r) && !rectHolds(sp, v_s, v_x)))) continue;
                let _q376 = false;
                Q377: {
                  const _a378 = reachers(b, sp, cl, v_x);
                  for (let _i379 = 0; _i379 < _a378.length; _i379++) {
                    const v_j = _a378[_i379];
                    if (!((v_j !== v_q))) continue;
                    const _a380 = fits(b, sp, cl, v_j);
                    for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                      const v_t = _a380[_i381];
                      if (!(rectHolds(sp, v_t, v_x))) continue;
                      if (!(rectMeets(sp, v_t, v_s))) {
                        _q376 = true;
                        break Q377;
                      }
                    }
                  }
                }
                if (!(_q376)) {
                  _q372 = true;
                  break Q373;
                }
              }
            }
            if (!(_q372)) continue;
            _g356.push(v_x);
          }
        }
        const v_U = _g356;
        facts.length = 0;
        changed = false;
        let _q382 = true;
        Q383: {
          const _a384 = rectInner(sp, v_r);
          for (let _i385 = 0; _i385 < _a384.length; _i385++) {
            const v_e = _a384[_i385];
            if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            if (!(true)) {
              _q382 = false;
              break Q383;
            }
          }
        }
        let _c390: boolean = _q382;
        if (_c390) {
          let _q386 = true;
          Q387: {
            const _a388 = rectRim(sp, v_r);
            for (let _i389 = 0; _i389 < _a388.length; _i389++) {
              const v_e = _a388[_i389];
              if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
              if (!(true)) {
                _q386 = false;
                break Q387;
              }
            }
          }
          _c390 = _q386;
        }
        if (!(_c390)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ q: v_q, F: v_F, G: v_G, r: v_r, Z: v_Z, U: v_U }, facts)) return 1;
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

export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g510: number[] = [];
  const _g544: number[] = [];
  const _g567: number[] = [];
  const _g585: number[] = [];
  const _g615: number[] = [];
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  const _a508 = sp.edges;
  for (let _i509 = 0; _i509 < _a508.length; _i509++) {
    const v_e = _a508[_i509];
    if (!(!(b.known(v_e)))) continue;
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    _g510.length = 0;
    G511: {
      const _a518 = reachers(b, sp, cl, v_a);
      for (let _i519 = 0; _i519 < _a518.length; _i519++) {
        const v_q = _a518[_i519];
        let _q520 = false;
        Q521: {
          const _a522 = fits(b, sp, cl, v_q);
          for (let _i523 = 0; _i523 < _a522.length; _i523++) {
            const v_r = _a522[_i523];
            if ((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b))) {
              _q520 = true;
              break Q521;
            }
          }
        }
        if (!(_q520)) continue;
        _g510.push(v_q);
      }
    }
    L524: {
      const v_C = _g510;
      const _h525 = v_C.length;
      let _c543: boolean = (_h525 > 0);
      if (_c543) {
        let _q526 = true;
        Q527: {
          const _a528 = v_C;
          for (let _i529 = 0; _i529 < _a528.length; _i529++) {
            const v_q = _a528[_i529];
            const _a530 = fits(b, sp, cl, v_q);
            for (let _i531 = 0; _i531 < _a530.length; _i531++) {
              const v_r = _a530[_i531];
              if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
              let _q532 = false;
              Q533: {
                for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
                  if (!((v_p !== v_q))) continue;
                  let _q534 = false;
                  Q535: {
                    const _a536 = core(b, sp, cl, v_p);
                    for (let _i537 = 0; _i537 < _a536.length; _i537++) {
                      const v_x = _a536[_i537];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q534 = true;
                        break Q535;
                      }
                    }
                  }
                  if (_q534) {
                    _q532 = true;
                    break Q533;
                  }
                }
              }
              let _c542: boolean = _q532;
              if (!_c542) {
                let _q538 = false;
                Q539: {
                  const _a540 = sole(b, sp, cl, v_q);
                  for (let _i541 = 0; _i541 < _a540.length; _i541++) {
                    const v_x = _a540[_i541];
                    if (!rectHolds(sp, v_r, v_x)) {
                      _q538 = true;
                      break Q539;
                    }
                  }
                }
                _c542 = _q538;
              }
              if (!(_c542)) {
                _q526 = false;
                break Q527;
              }
            }
          }
        }
        _c543 = _q526;
      }
      if (!(_c543)) break L524;
      _g544.length = 0;
      G545: {
        for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
          let _q556 = false;
          Q557: {
            const _a558 = v_C;
            for (let _i559 = 0; _i559 < _a558.length; _i559++) {
              const v_q = _a558[_i559];
              const _h562 = (v_p !== v_q);
              const _a560 = fits(b, sp, cl, v_q);
              for (let _i561 = 0; _i561 < _a560.length; _i561++) {
                const v_r = _a560[_i561];
                if (!(((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)) && _h562))) continue;
                let _q563 = false;
                Q564: {
                  const _a565 = core(b, sp, cl, v_p);
                  for (let _i566 = 0; _i566 < _a565.length; _i566++) {
                    const v_x = _a565[_i566];
                    if (rectHolds(sp, v_r, v_x)) {
                      _q563 = true;
                      break Q564;
                    }
                  }
                }
                if (_q563) {
                  _q556 = true;
                  break Q557;
                }
              }
            }
          }
          if (!(_q556)) continue;
          _g544.push(v_p);
        }
      }
      const v_O = _g544;
      _g567.length = 0;
      G568: {
        const _a577 = v_C;
        for (let _i578 = 0; _i578 < _a577.length; _i578++) {
          const v_q = _a577[_i578];
          const _a579 = fits(b, sp, cl, v_q);
          for (let _i580 = 0; _i580 < _a579.length; _i580++) {
            const v_r = _a579[_i580];
            if (!((rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b)))) continue;
            const _a581 = v_O;
            for (let _i582 = 0; _i582 < _a581.length; _i582++) {
              const v_p = _a581[_i582];
              if (!((v_p !== v_q))) continue;
              const _a583 = core(b, sp, cl, v_p);
              for (let _i584 = 0; _i584 < _a583.length; _i584++) {
                const v_x = _a583[_i584];
                if (!(rectHolds(sp, v_r, v_x))) continue;
                if (!_g567.includes(v_x)) _g567.push(v_x);
              }
            }
          }
        }
      }
      const v_T = _g567;
      _g585.length = 0;
      G586: {
        const _a604 = v_C;
        for (let _i605 = 0; _i605 < _a604.length; _i605++) {
          const v_q = _a604[_i605];
          const _a606 = fits(b, sp, cl, v_q);
          for (let _i607 = 0; _i607 < _a606.length; _i607++) {
            const v_r = _a606[_i607];
            let _c614: boolean = (rectHolds(sp, v_r, v_a) && rectHolds(sp, v_r, v_b));
            if (_c614) {
              let _q608 = false;
              Q609: {
                for (let v_p = 0; v_p < cl.number.at.length; v_p++) {
                  if (!((v_p !== v_q))) continue;
                  let _q610 = false;
                  Q611: {
                    const _a612 = core(b, sp, cl, v_p);
                    for (let _i613 = 0; _i613 < _a612.length; _i613++) {
                      const v_x = _a612[_i613];
                      if (rectHolds(sp, v_r, v_x)) {
                        _q610 = true;
                        break Q611;
                      }
                    }
                  }
                  if (_q610) {
                    _q608 = true;
                    break Q609;
                  }
                }
              }
              _c614 = !(_q608);
            }
            if (!(_c614)) continue;
            _g615.length = 0;
            G616: {
              const _a619 = sole(b, sp, cl, v_q);
              for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                const v_x = _a619[_i620];
                if (!(!rectHolds(sp, v_r, v_x))) continue;
                _g615.push(v_x);
              }
            }
            const v_m = (_g615[0] ?? -1);
            if (!_g585.includes(v_m)) _g585.push(v_m);
          }
        }
      }
      const v_M = _g585;
      facts.length = 0;
      changed = false;
      if (!b.known(v_e)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, C: v_C, O: v_O, T: v_T, M: v_M }, facts)) return 1;
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
          if ((b.value(v_e) === 1)) {
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
            if ((b.value(v_e) === 2)) {
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

const soleKept = keptStore<readonly number[]>();

/** `sole(q)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function sole(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): readonly number[] {
  const _kept: Kept<readonly number[]> = soleKept.marks(b);
  if (_kept[v_q] !== undefined) return _kept[v_q];
  const _g420: number[] = [];
  G421: {
    const _a424 = sp.cells;
    for (let _i425 = 0; _i425 < _a424.length; _i425++) {
      const v_x = _a424[_i425];
      if (!(((reachers(b, sp, cl, v_x).length === 1) && (reachers(b, sp, cl, v_x).includes(v_q))))) continue;
      _g420.push(v_x);
    }
  }
  const _made = _g420;
  _kept[v_q] = _made;
  return _made;
}
