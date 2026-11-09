// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, keptStore, minus, nextOfSize, rangeMask, stamps, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  mines: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "alone" | "pair" | "region" | "regions" | "count";

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
  { id: "alone", tier: 0 },
  { id: "pair", tier: 0 },
  { id: "region", tier: 0 },
  { id: "regions", tier: 0 },
  { id: "count", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _g718 = 0;
  G719: {
    const _a720 = sp.cells;
    for (let _i721 = 0; _i721 < _a720.length; _i721++) {
      const v_c = _a720[_i721];
      const _h722 = (g[v_c] || -1);
      if (!((_h722 === 1))) continue;
      _g718++;
    }
  }
  if (!((_g718 === cl.mines))) return false;
  for (let _k723 = 0; _k723 < cl.count.at.length; _k723++) {
    const _at724 = cl.count.at[_k723];
    const _v725 = cl.count.v[_k723];
    let _c731: boolean = ((g[_at724] || -1) === 2);
    if (_c731) {
      let _g726 = 0;
      G727: {
        const _a728 = sp.adj8[_at724];
        for (let _i729 = 0; _i729 < _a728.length; _i729++) {
          const v_d = _a728[_i729];
          const _h730 = (g[v_d] || -1);
          if (!((_h730 === 1))) continue;
          _g726++;
        }
      }
      _c731 = (_g726 === _v725);
    }
    if (!(_c731)) return false;
  }
  return true;
}

export interface AloneBinding {
  k: number;
  c: number;
  U: readonly number[];
  n: number;
}

const aloneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function alone(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<AloneBinding> | null): number {
  const _g12: number[] = [];
  const facts = aloneFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    const v_c = cl.count.at[v_k];
    const _h18 = clueAt(cl.count, v_c);
    _g12.length = 0;
    G13: {
      const _a16 = sp.adj8[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_d = _a16[_i17];
        if (!(!((b.grid[v_d] !== 0)))) continue;
        _g12.push(v_d);
      }
    }
    const v_U = _g12;
    const _h24 = v_U.length;
    let _g19 = 0;
    G20: {
      const _a21 = sp.adj8[v_c];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_d = _a21[_i22];
        if (!(((b.grid[v_d] || -1) === 1))) continue;
        _g19++;
      }
    }
    L23: {
      const v_n = (_h18 - _g19);
      if (!(((_h24 > 0) && ((v_n <= 0) || (v_n >= _h24))))) break L23;
      facts.length = 0;
      changed = false;
      let _c30: boolean = ((v_n >= 0) && (v_n <= _h24));
      if (_c30) {
        let _c29: boolean = !((v_n === 0));
        if (!_c29) {
          let _q25 = true;
          Q26: {
            const _a27 = v_U;
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_d = _a27[_i28];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q25 = false;
                break Q26;
              }
            }
          }
          _c29 = _q25;
        }
        _c30 = _c29;
      }
      let _c36: boolean = _c30;
      if (_c36) {
        let _c35: boolean = (v_n === 0);
        if (!_c35) {
          let _q31 = true;
          Q32: {
            const _a33 = v_U;
            for (let _i34 = 0; _i34 < _a33.length; _i34++) {
              const v_d = _a33[_i34];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q31 = false;
                break Q32;
              }
            }
          }
          _c35 = _q31;
        }
        _c36 = _c35;
      }
      if (!(_c36)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, c: v_c, U: v_U.slice(), n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBinding {
  k: number;
  a: number;
  b: number;
  by: number;
  O: readonly number[];
  S: readonly number[];
}

const pairFacts: number[] = [];
let pairCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g103: number[] = [];
  const _g126: number[] = [];
  const _g132: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L102: {
      const v_a = cl.count.at[v_k];
      _g103.length = 0;
      G104: {
        const _a107 = sp.adj8[v_a];
        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
          const v_d = _a107[_i108];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g103.push(v_d);
        }
      }
      if (!((_g103.length > 0))) break L102;
      const _a109 = within(sp, v_a, 2);
      for (let _i110 = 0; _i110 < _a109.length; _i110++) {
        const v_b = _a109[_i110];
        const _h111 = clueAt(cl.count, v_b);
        if (!((((v_b !== v_a) && (_h111 !== -1)) && meetMarked(b, sp, cands, v_a, v_b)))) continue;
        let _g116 = 0;
        G117: {
          const _a118 = sp.adj8[v_b];
          for (let _i119 = 0; _i119 < _a118.length; _i119++) {
            const v_d = _a118[_i119];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g116++;
          }
        }
        const v_by = (need(b, sp, cl, v_a) - (_h111 - _g116));
        _g126.length = 0;
        G127: {
          const _a130 = sp.adj8[v_b];
          for (let _i131 = 0; _i131 < _a130.length; _i131++) {
            const v_d = _a130[_i131];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g126.push(v_d);
          }
        }
        const v_O = minus(open(b, sp, v_a), _g126);
        const _h139 = v_O.length;
        _g132.length = 0;
        G133: {
          const _a136 = sp.adj8[v_b];
          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
            const v_d = _a136[_i137];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g132.push(v_d);
          }
        }
        L138: {
          const v_S = minus(_g132, open(b, sp, v_a));
          const _h140 = v_S.length;
          if (!(((v_by >= _h139) && ((_h139 + _h140) > 0)))) break L138;
          facts.length = 0;
          changed = false;
          let _c145: boolean = (v_by === _h139);
          if (_c145) {
            let _q141 = true;
            Q142: {
              const _a143 = v_O;
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_d = _a143[_i144];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q141 = false;
                  break Q142;
                }
              }
            }
            _c145 = _q141;
          }
          let _c150: boolean = _c145;
          if (_c150) {
            let _q146 = true;
            Q147: {
              const _a148 = v_S;
              for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                const v_d = _a148[_i149];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q146 = false;
                  break Q147;
                }
              }
            }
            _c150 = _q146;
          }
          if (!(_c150)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, by: v_by, O: v_O.slice(), S: v_S.slice() }, facts)) return 1;
            cands.fill(-1);
            meetMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface RegionBinding {
  k: number;
  o: number;
  i: number;
  b: number;
  R: readonly number[];
  B: readonly number[];
  r: number;
  nb: number;
  heavy: boolean;
}

const regionFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function region(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionBinding> | null): number {
  const _g232: number[] = [];
  const _g241: number[] = [];
  const _g248: number[] = [];
  const _g255: number[] = [];
  const _g265: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L231: {
      const v_o = cl.count.at[v_k];
      _g232.length = 0;
      G233: {
        const _a236 = sp.adj8[v_o];
        for (let _i237 = 0; _i237 < _a236.length; _i237++) {
          const v_d = _a236[_i237];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g232.push(v_d);
        }
      }
      if (!((_g232.length > 0))) break L231;
      const _a238 = within(sp, v_o, 2);
      for (let _i239 = 0; _i239 < _a238.length; _i239++) {
        const v_i = _a238[_i239];
        const _h240 = clueAt(cl.count, v_i);
        let _c247: boolean = ((v_i !== v_o) && (_h240 !== -1));
        if (_c247) {
          _g241.length = 0;
          G242: {
            const _a245 = sp.adj8[v_i];
            for (let _i246 = 0; _i246 < _a245.length; _i246++) {
              const v_d = _a245[_i246];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g241.push(v_d);
            }
          }
          _c247 = (_g241.length > 0);
        }
        let _c254: boolean = _c247;
        if (_c254) {
          _g248.length = 0;
          G249: {
            const _a252 = sp.adj8[v_i];
            for (let _i253 = 0; _i253 < _a252.length; _i253++) {
              const v_d = _a252[_i253];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g248.push(v_d);
            }
          }
          _c254 = subsetOf(_g248, open(b, sp, v_o));
        }
        let _c261: boolean = _c254;
        if (_c261) {
          _g255.length = 0;
          G256: {
            const _a259 = sp.adj8[v_i];
            for (let _i260 = 0; _i260 < _a259.length; _i260++) {
              const v_d = _a259[_i260];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g255.push(v_d);
            }
          }
          _c261 = (_g255.length < open(b, sp, v_o).length);
        }
        if (!(_c261)) continue;
        const _a262 = within(sp, v_o, 3);
        for (let _i263 = 0; _i263 < _a262.length; _i263++) {
          const v_b = _a262[_i263];
          const _h264 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h264 !== -1)))) continue;
          const v_R = minus(open(b, sp, v_o), open(b, sp, v_i));
          _g265.length = 0;
          G266: {
            const _a269 = sp.adj8[v_b];
            for (let _i270 = 0; _i270 < _a269.length; _i270++) {
              const v_d = _a269[_i270];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g265.push(v_d);
            }
          }
          L271: {
            const v_B = _g265;
            let _q272 = false;
            Q273: {
              const _a274 = v_R;
              for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                const v_d = _a274[_i275];
                if ((v_B.includes(v_d))) {
                  _q272 = true;
                  break Q273;
                }
              }
            }
            if (!(_q272)) break L271;
            const _h280 = minus(v_R, v_B).length;
            const _h282 = minus(v_B, v_R).length;
            const v_r = (need(b, sp, cl, v_o) - need(b, sp, cl, v_i));
            let _g276 = 0;
            G277: {
              const _a278 = sp.adj8[v_b];
              for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                const v_d = _a278[_i279];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g276++;
              }
            }
            const v_nb = (_h264 - _g276);
            L281: {
              const v_heavy = ((v_r - v_nb) >= _h280);
              if (!(((v_heavy || ((v_nb - v_r) >= _h282)) && ((_h280 + _h282) > 0)))) break L281;
              facts.length = 0;
              changed = false;
              let _c293: boolean = !(v_heavy);
              if (!_c293) {
                let _c287: boolean = ((v_r - v_nb) === _h280);
                if (_c287) {
                  let _q283 = true;
                  Q284: {
                    const _a285 = minus(v_R, v_B);
                    for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                      const v_d = _a285[_i286];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q283 = false;
                        break Q284;
                      }
                    }
                  }
                  _c287 = _q283;
                }
                let _c292: boolean = _c287;
                if (_c292) {
                  let _q288 = true;
                  Q289: {
                    const _a290 = minus(v_B, v_R);
                    for (let _i291 = 0; _i291 < _a290.length; _i291++) {
                      const v_d = _a290[_i291];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q288 = false;
                        break Q289;
                      }
                    }
                  }
                  _c292 = _q288;
                }
                _c293 = _c292;
              }
              let _c305: boolean = _c293;
              if (_c305) {
                let _c304: boolean = v_heavy;
                if (!_c304) {
                  let _c298: boolean = ((v_nb - v_r) === _h282);
                  if (_c298) {
                    let _q294 = true;
                    Q295: {
                      const _a296 = minus(v_B, v_R);
                      for (let _i297 = 0; _i297 < _a296.length; _i297++) {
                        const v_d = _a296[_i297];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q294 = false;
                          break Q295;
                        }
                      }
                    }
                    _c298 = _q294;
                  }
                  let _c303: boolean = _c298;
                  if (_c303) {
                    let _q299 = true;
                    Q300: {
                      const _a301 = minus(v_R, v_B);
                      for (let _i302 = 0; _i302 < _a301.length; _i302++) {
                        const v_d = _a301[_i302];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q299 = false;
                          break Q300;
                        }
                      }
                    }
                    _c303 = _q299;
                  }
                  _c304 = _c303;
                }
                _c305 = _c304;
              }
              if (!(_c305)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, b: v_b, R: v_R.slice(), B: v_B.slice(), r: v_r, nb: v_nb, heavy: v_heavy }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface RegionsBinding {
  k: number;
  o: number;
  i: number;
  R: readonly number[];
  r: number;
  p: number;
  q: number;
  S: readonly number[];
  by: number;
}

const regionsFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function regions(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RegionsBinding> | null): number {
  const _g439: number[] = [];
  const _g448: number[] = [];
  const _g455: number[] = [];
  const _g462: number[] = [];
  const _g469: number[] = [];
  const _g482: number[] = [];
  const _g492: number[] = [];
  const _g499: number[] = [];
  const _g506: number[] = [];
  const _g513: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L438: {
      const v_o = cl.count.at[v_k];
      _g439.length = 0;
      G440: {
        const _a443 = sp.adj8[v_o];
        for (let _i444 = 0; _i444 < _a443.length; _i444++) {
          const v_d = _a443[_i444];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g439.push(v_d);
        }
      }
      if (!((_g439.length > 0))) break L438;
      const _a445 = within(sp, v_o, 2);
      for (let _i446 = 0; _i446 < _a445.length; _i446++) {
        const v_i = _a445[_i446];
        const _h447 = clueAt(cl.count, v_i);
        let _c454: boolean = ((v_i !== v_o) && (_h447 !== -1));
        if (_c454) {
          _g448.length = 0;
          G449: {
            const _a452 = sp.adj8[v_i];
            for (let _i453 = 0; _i453 < _a452.length; _i453++) {
              const v_d = _a452[_i453];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g448.push(v_d);
            }
          }
          _c454 = (_g448.length > 0);
        }
        let _c461: boolean = _c454;
        if (_c461) {
          _g455.length = 0;
          G456: {
            const _a459 = sp.adj8[v_i];
            for (let _i460 = 0; _i460 < _a459.length; _i460++) {
              const v_d = _a459[_i460];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g455.push(v_d);
            }
          }
          _c461 = subsetOf(_g455, open(b, sp, v_o));
        }
        let _c468: boolean = _c461;
        if (_c468) {
          _g462.length = 0;
          G463: {
            const _a466 = sp.adj8[v_i];
            for (let _i467 = 0; _i467 < _a466.length; _i467++) {
              const v_d = _a466[_i467];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g462.push(v_d);
            }
          }
          _c468 = (_g462.length < open(b, sp, v_o).length);
        }
        if (!(_c468)) continue;
        _g469.length = 0;
        G470: {
          const _a473 = sp.adj8[v_i];
          for (let _i474 = 0; _i474 < _a473.length; _i474++) {
            const v_d = _a473[_i474];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g469.push(v_d);
          }
        }
        const v_R = minus(open(b, sp, v_o), _g469);
        let _g475 = 0;
        G476: {
          const _a477 = sp.adj8[v_i];
          for (let _i478 = 0; _i478 < _a477.length; _i478++) {
            const v_d = _a477[_i478];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g475++;
          }
        }
        const v_r = (need(b, sp, cl, v_o) - (_h447 - _g475));
        const _a479 = within(sp, v_o, 2);
        for (let _i480 = 0; _i480 < _a479.length; _i480++) {
          const v_p = _a479[_i480];
          const _h481 = clueAt(cl.count, v_p);
          let _c488: boolean = ((v_p !== v_o) && (_h481 !== -1));
          if (_c488) {
            _g482.length = 0;
            G483: {
              const _a486 = sp.adj8[v_p];
              for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                const v_d = _a486[_i487];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g482.push(v_d);
              }
            }
            _c488 = (_g482.length > 0);
          }
          if (!(_c488)) continue;
          const _a489 = within(sp, v_p, 2);
          for (let _i490 = 0; _i490 < _a489.length; _i490++) {
            const v_q = _a489[_i490];
            const _h491 = clueAt(cl.count, v_q);
            let _c498: boolean = ((v_q !== v_p) && (_h491 !== -1));
            if (_c498) {
              _g492.length = 0;
              G493: {
                const _a496 = sp.adj8[v_q];
                for (let _i497 = 0; _i497 < _a496.length; _i497++) {
                  const v_d = _a496[_i497];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g492.push(v_d);
                }
              }
              _c498 = (_g492.length > 0);
            }
            let _c505: boolean = _c498;
            if (_c505) {
              _g499.length = 0;
              G500: {
                const _a503 = sp.adj8[v_q];
                for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                  const v_d = _a503[_i504];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g499.push(v_d);
                }
              }
              _c505 = subsetOf(_g499, open(b, sp, v_p));
            }
            let _c512: boolean = _c505;
            if (_c512) {
              _g506.length = 0;
              G507: {
                const _a510 = sp.adj8[v_q];
                for (let _i511 = 0; _i511 < _a510.length; _i511++) {
                  const v_d = _a510[_i511];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g506.push(v_d);
                }
              }
              _c512 = (_g506.length < open(b, sp, v_p).length);
            }
            if (!(_c512)) continue;
            _g513.length = 0;
            G514: {
              const _a517 = sp.adj8[v_q];
              for (let _i518 = 0; _i518 < _a517.length; _i518++) {
                const v_d = _a517[_i518];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g513.push(v_d);
              }
            }
            L519: {
              const v_S = minus(open(b, sp, v_p), _g513);
              let _q520 = false;
              Q521: {
                const _a522 = v_R;
                for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                  const v_d = _a522[_i523];
                  if ((v_S.includes(v_d))) {
                    _q520 = true;
                    break Q521;
                  }
                }
              }
              if (!(_q520)) break L519;
              const _h529 = minus(v_R, v_S).length;
              const _h530 = minus(v_S, v_R).length;
              let _g524 = 0;
              G525: {
                const _a526 = sp.adj8[v_q];
                for (let _i527 = 0; _i527 < _a526.length; _i527++) {
                  const v_d = _a526[_i527];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g524++;
                }
              }
              L528: {
                const v_by = (v_r - (need(b, sp, cl, v_p) - (_h491 - _g524)));
                if (!(((v_by >= _h529) && ((_h529 + _h530) > 0)))) break L528;
                facts.length = 0;
                changed = false;
                let _c535: boolean = (v_by === _h529);
                if (_c535) {
                  let _q531 = true;
                  Q532: {
                    const _a533 = minus(v_R, v_S);
                    for (let _i534 = 0; _i534 < _a533.length; _i534++) {
                      const v_d = _a533[_i534];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q531 = false;
                        break Q532;
                      }
                    }
                  }
                  _c535 = _q531;
                }
                let _c540: boolean = _c535;
                if (_c540) {
                  let _q536 = true;
                  Q537: {
                    const _a538 = minus(v_S, v_R);
                    for (let _i539 = 0; _i539 < _a538.length; _i539++) {
                      const v_d = _a538[_i539];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q536 = false;
                        break Q537;
                      }
                    }
                  }
                  _c540 = _q536;
                }
                if (!(_c540)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, o: v_o, i: v_i, R: v_R.slice(), r: v_r, p: v_p, q: v_q, S: v_S.slice(), by: v_by }, facts)) return 1;
                }
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CountBinding {
  C: readonly number[];
  L: number;
  u: number;
  size: number;
  T: readonly number[];
  n: number;
  X: readonly number[];
}

const countFacts: number[] = [];
let countCands = new Int32Array(0);
const _st665 = stamps();

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g607: number[] = [];
  const _g631: number[] = [];
  const _g652: number[] = [];
  const _g669: number[] = [];
  const _g686: number[] = [];
  const _g699: number[] = [];
  const _g708: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  if (countCands.length < sp.cells.length) countCands = new Int32Array(sp.cells.length);
  const cands = countCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  _g607.length = 0;
  G608: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q613 = false;
      Q614: {
        const _a615 = sp.adj8[cl.count.at[v_k]];
        for (let _i616 = 0; _i616 < _a615.length; _i616++) {
          const v_d = _a615[_i616];
          if (!((b.grid[v_d] !== 0))) {
            _q613 = true;
            break Q614;
          }
        }
      }
      if (!(_q613)) continue;
      _g607.push(v_k);
    }
  }
  L617: {
    const v_C = _g607;
    const _h618 = v_C.length;
    if (!((_h618 <= 10))) break L617;
    let _g619 = 0;
    G620: {
      const _a621 = cellsValued(b, sp.cells, 1);
      for (let _i622 = 0; _i622 < _a621.length; _i622++) {
        const v_c = _a621[_i622];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g619++;
      }
    }
    const v_L = (cl.mines - _g619);
    let _g623 = 0;
    G624: {
      const _a625 = sp.cells;
      for (let _i626 = 0; _i626 < _a625.length; _i626++) {
        const v_c = _a625[_i626];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g623++;
      }
    }
    const v_u = _g623;
    for (let v_size = 0; v_size <= 5; v_size++) {
      const _e627 = v_C;
      const _n630 = 1 << _e627.length;
      for (let _k628 = v_size > _e627.length ? _n630 : (1 << v_size) - 1; _k628 < _n630; _k628 = v_size === 0 ? _n630 : nextOfSize(_k628)) {
        const v_T = _g631;
        v_T.length = 0;
        for (let _j629 = 0; _j629 < _e627.length; _j629++) if ((_k628 >> (_e627.length - 1 - _j629)) & 1) v_T.push(_e627[_j629]);
        const _h632 = v_T.length;
        let _c641: boolean = (_h632 === v_size);
        if (_c641) {
          let _q633 = true;
          Q634: {
            const _a635 = v_T;
            for (let _i636 = 0; _i636 < _a635.length; _i636++) {
              const v_x = _a635[_i636];
              const _h639 = cl.count.at[v_x];
              const _a637 = v_T;
              for (let _i638 = 0; _i638 < _a637.length; _i638++) {
                const v_y = _a637[_i638];
                if (!((v_x !== v_y))) continue;
                const _t640 = cl.count.at[v_y];
                if (!(!(meetMarked(b, sp, cands, _h639, _t640)))) {
                  _q633 = false;
                  break Q634;
                }
              }
            }
          }
          _c641 = _q633;
        }
        if (!(_c641)) continue;
        let _g642 = 0;
        G643: {
          const _a644 = v_T;
          for (let _i645 = 0; _i645 < _a644.length; _i645++) {
            const v_x = _a644[_i645];
            const _t646 = cl.count.at[v_x];
            const _h647 = clueAt(cl.count, _t646);
            let _g648 = 0;
            G649: {
              const _a650 = sp.adj8[_t646];
              for (let _i651 = 0; _i651 < _a650.length; _i651++) {
                const v_d = _a650[_i651];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g648++;
              }
            }
            _g642 += (_h647 - _g648);
          }
        }
        const v_n = _g642;
        _g652.length = 0;
        _st665.pass++;
        G653: {
          const _a666 = v_T;
          for (let _i667 = 0; _i667 < _a666.length; _i667++) {
            const v_x = _a666[_i667];
            const _t668 = cl.count.at[v_x];
            _g669.length = 0;
            G670: {
              const _a673 = sp.adj8[_t668];
              for (let _i674 = 0; _i674 < _a673.length; _i674++) {
                const v_d = _a673[_i674];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g669.push(v_d);
              }
            }
            const _a675 = _g669;
            for (let _i676 = 0; _i676 < _a675.length; _i676++) {
              const v_d = _a675[_i676];
              const _t677 = v_d;
              if (_g652.length < 16) { if (!_g652.includes(_t677)) _g652.push(_t677); } else addOnce(_g652, _st665, _t677);
            }
          }
        }
        L678: {
          const v_X = _g652;
          const _h679 = v_X.length;
          if (!(((v_u > _h679) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h679)))))) break L678;
          facts.length = 0;
          changed = false;
          let _g680 = 0;
          G681: {
            const _a682 = cellsValued(b, sp.cells, 1);
            for (let _i683 = 0; _i683 < _a682.length; _i683++) {
              const v_c = _a682[_i683];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g680++;
            }
          }
          let _c694: boolean = !((v_n === (cl.mines - _g680)));
          if (!_c694) {
            let _q684 = true;
            Q685: {
              _g686.length = 0;
              G687: {
                const _a690 = sp.cells;
                for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                  const v_c = _a690[_i691];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g686.push(v_c);
                }
              }
              const _a692 = _g686;
              for (let _i693 = 0; _i693 < _a692.length; _i693++) {
                const v_d = _a692[_i693];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q684 = false;
                  break Q685;
                }
              }
            }
            _c694 = _q684;
          }
          let _c717: boolean = _c694;
          if (_c717) {
            let _g695 = 0;
            G696: {
              const _a697 = cellsValued(b, sp.cells, 1);
              for (let _i698 = 0; _i698 < _a697.length; _i698++) {
                const v_c = _a697[_i698];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g695++;
              }
            }
            let _c705: boolean = (v_n !== (cl.mines - _g695));
            if (_c705) {
              _g699.length = 0;
              G700: {
                const _a703 = sp.cells;
                for (let _i704 = 0; _i704 < _a703.length; _i704++) {
                  const v_c = _a703[_i704];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g699.push(v_c);
                }
              }
              _c705 = (((cl.mines - _g695) - v_n) === _g699.length);
            }
            let _c716: boolean = !(_c705);
            if (!_c716) {
              let _q706 = true;
              Q707: {
                _g708.length = 0;
                G709: {
                  const _a712 = sp.cells;
                  for (let _i713 = 0; _i713 < _a712.length; _i713++) {
                    const v_c = _a712[_i713];
                    if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                    _g708.push(v_c);
                  }
                }
                const _a714 = _g708;
                for (let _i715 = 0; _i715 < _a714.length; _i715++) {
                  const v_d = _a714[_i715];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q706 = false;
                    break Q707;
                  }
                }
              }
              _c716 = _q706;
            }
            _c717 = _c716;
          }
          if (!(_c717)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ C: v_C.slice(), L: v_L, u: v_u, size: v_size, T: v_T.slice(), n: v_n, X: v_X.slice() }, facts)) return 1;
            cands.fill(-1);
            meetMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

const meetMarkedKept = new Map<number, boolean>();

/** `meet(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetMarked(b: Marks, sp: GridSpace, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _c68: boolean = ((Math.abs(((v_a % sp.w) - (v_b % sp.w))) <= 2) && (Math.abs((((v_a / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 2));
  if (_c68) {
    let _q52 = false;
    Q53: {
      const _g54: number[] = [];
      G55: {
        const _a58 = sp.adj8[v_a];
        for (let _i59 = 0; _i59 < _a58.length; _i59++) {
          const v_d = _a58[_i59];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g54.push(v_d);
        }
      }
      const _a60 = _g54;
      for (let _i61 = 0; _i61 < _a60.length; _i61++) {
        const v_d = _a60[_i61];
        const _g62: number[] = [];
        G63: {
          const _a66 = sp.adj8[v_b];
          for (let _i67 = 0; _i67 < _a66.length; _i67++) {
            const v_d = _a66[_i67];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g62.push(v_d);
          }
        }
        if ((_g62.includes(v_d))) {
          _q52 = true;
          break Q53;
        }
      }
    }
    _c68 = _q52;
  }
  const _made = _c68;
  meetMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g112 = 0;
  G113: {
    const _a114 = sp.adj8[v_c];
    for (let _i115 = 0; _i115 < _a114.length; _i115++) {
      const v_d = _a114[_i115];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g112++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g112);
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g120: number[] = [];
  G121: {
    const _a124 = sp.adj8[v_c];
    for (let _i125 = 0; _i125 < _a124.length; _i125++) {
      const v_d = _a124[_i125];
      if (!(!((b.grid[v_d] !== 0)))) continue;
      _g120.push(v_d);
    }
  }
  const _made = _g120;
  _kept[v_c] = _made;
  return _made;
}
