// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, freshBinding, keptStore, minus, nextOfSize, rangeMask, sameSet, staleChecking, stamps, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

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
  let _g1151 = 0;
  G1152: {
    const _a1153 = sp.cells;
    for (let _i1154 = 0; _i1154 < _a1153.length; _i1154++) {
      const v_c = _a1153[_i1154];
      const _h1155 = (g[v_c] || -1);
      if (!((_h1155 === 1))) continue;
      _g1151++;
    }
  }
  if (!((_g1151 === cl.mines))) return false;
  for (let _k1156 = 0; _k1156 < cl.count.at.length; _k1156++) {
    const _at1157 = cl.count.at[_k1156];
    const _v1158 = cl.count.v[_k1156];
    let _c1164: boolean = ((g[_at1157] || -1) === 2);
    if (_c1164) {
      let _g1159 = 0;
      G1160: {
        const _a1161 = sp.adj8[_at1157];
        for (let _i1162 = 0; _i1162 < _a1161.length; _i1162++) {
          const v_d = _a1161[_i1162];
          const _h1163 = (g[v_d] || -1);
          if (!((_h1163 === 1))) continue;
          _g1159++;
        }
      }
      _c1164 = (_g1159 === _v1158);
    }
    if (!(_c1164)) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        const _g25: number[] = [];
        G26: {
          const _a29 = sp.adj8[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_d = _a29[_i30];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g25.push(v_d);
          }
        }
        let _g31 = 0;
        G32: {
          const _a33 = sp.adj8[v_c];
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_d = _a33[_i34];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g31++;
          }
        }
        freshBinding("alone", [(v_c === cl.count.at[v_k]), sameSet(v_U, _g25), (v_n === (clueAt(cl.count, v_c) - _g31)), ((v_U.length > 0) && ((v_n <= 0) || (v_n >= v_U.length)))], ["c =", "U =", "n =", "where of n"]);
      }
      facts.length = 0;
      changed = false;
      let _c40: boolean = ((v_n >= 0) && (v_n <= _h24));
      if (_c40) {
        let _c39: boolean = !((v_n === 0));
        if (!_c39) {
          let _q35 = true;
          Q36: {
            const _a37 = v_U;
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_d = _a37[_i38];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
              if (!(true)) {
                _q35 = false;
                break Q36;
              }
            }
          }
          _c39 = _q35;
        }
        _c40 = _c39;
      }
      let _c46: boolean = _c40;
      if (_c46) {
        let _c45: boolean = (v_n === 0);
        if (!_c45) {
          let _q41 = true;
          Q42: {
            const _a43 = v_U;
            for (let _i44 = 0; _i44 < _a43.length; _i44++) {
              const v_d = _a43[_i44];
              if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
              if (!(true)) {
                _q41 = false;
                break Q42;
              }
            }
          }
          _c45 = _q41;
        }
        _c46 = _c45;
      }
      if (!(_c46)) return -1;
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
  const _g113: number[] = [];
  const _g136: number[] = [];
  const _g142: number[] = [];
  const _g151: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L112: {
      const v_a = cl.count.at[v_k];
      const _m33_0 = b.made[0];
      _g113.length = 0;
      G114: {
        const _a117 = sp.adj8[v_a];
        for (let _i118 = 0; _i118 < _a117.length; _i118++) {
          const v_d = _a117[_i118];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g113.push(v_d);
        }
      }
      if (!((_g113.length > 0))) break L112;
      const _a119 = within(sp, v_a, 2);
      for (let _i120 = 0; _i120 < _a119.length; _i120++) {
        const v_b = _a119[_i120];
        const _h121 = clueAt(cl.count, v_b);
        if (!((((v_b !== v_a) && (_h121 !== -1)) && meetMarked(b, sp, cands, v_a, v_b)))) continue;
        let _g126 = 0;
        G127: {
          const _a128 = sp.adj8[v_b];
          for (let _i129 = 0; _i129 < _a128.length; _i129++) {
            const v_d = _a128[_i129];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g126++;
          }
        }
        const v_by = (need(b, sp, cl, v_a) - (_h121 - _g126));
        _g136.length = 0;
        G137: {
          const _a140 = sp.adj8[v_b];
          for (let _i141 = 0; _i141 < _a140.length; _i141++) {
            const v_d = _a140[_i141];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g136.push(v_d);
          }
        }
        const v_O = minus(open(b, sp, v_a), _g136);
        const _h149 = v_O.length;
        _g142.length = 0;
        G143: {
          const _a146 = sp.adj8[v_b];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_d = _a146[_i147];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g142.push(v_d);
          }
        }
        L148: {
          const v_S = minus(_g142, open(b, sp, v_a));
          const _h150 = v_S.length;
          if (!(((v_by >= _h149) && ((_h149 + _h150) > 0)))) break L148;
          if (b.made[0] !== _m33_0) {
            _g151.length = 0;
            G152: {
              const _a155 = sp.adj8[v_a];
              for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                const v_d = _a155[_i156];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g151.push(v_d);
              }
            }
            if (!((_g151.length > 0))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g157: number[] = [];
            G158: {
              const _a161 = sp.adj8[v_a];
              for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                const v_d = _a161[_i162];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g157.push(v_d);
              }
            }
            let _g163 = 0;
            G164: {
              const _a165 = sp.adj8[v_a];
              for (let _i166 = 0; _i166 < _a165.length; _i166++) {
                const v_d = _a165[_i166];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g163++;
              }
            }
            let _g167 = 0;
            G168: {
              const _a169 = sp.adj8[v_b];
              for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                const v_d = _a169[_i170];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g167++;
              }
            }
            const _g171: number[] = [];
            G172: {
              const _a175 = sp.adj8[v_a];
              for (let _i176 = 0; _i176 < _a175.length; _i176++) {
                const v_d = _a175[_i176];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g171.push(v_d);
              }
            }
            const _g177: number[] = [];
            G178: {
              const _a181 = sp.adj8[v_b];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_d = _a181[_i182];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g177.push(v_d);
              }
            }
            const _g183: number[] = [];
            G184: {
              const _a187 = sp.adj8[v_b];
              for (let _i188 = 0; _i188 < _a187.length; _i188++) {
                const v_d = _a187[_i188];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g183.push(v_d);
              }
            }
            const _g189: number[] = [];
            G190: {
              const _a193 = sp.adj8[v_a];
              for (let _i194 = 0; _i194 < _a193.length; _i194++) {
                const v_d = _a193[_i194];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g189.push(v_d);
              }
            }
            freshBinding("pair", [(v_a === cl.count.at[v_k]), (_g157.length > 0), (within(sp, v_a, 2).includes(v_b)), (((v_b !== v_a) && (clueAt(cl.count, v_b) !== -1)) && meetMarked(b, sp, cands, v_a, v_b)), (v_by === ((clueAt(cl.count, v_a) - _g163) - (clueAt(cl.count, v_b) - _g167))), sameSet(v_O, minus(_g171, _g177)), sameSet(v_S, minus(_g183, _g189)), ((v_by >= v_O.length) && ((v_O.length + v_S.length) > 0))], ["a =", "where of a", "b in", "where of b", "by =", "O =", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          let _c199: boolean = (v_by === _h149);
          if (_c199) {
            let _q195 = true;
            Q196: {
              const _a197 = v_O;
              for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                const v_d = _a197[_i198];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q195 = false;
                  break Q196;
                }
              }
            }
            _c199 = _q195;
          }
          let _c204: boolean = _c199;
          if (_c204) {
            let _q200 = true;
            Q201: {
              const _a202 = v_S;
              for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                const v_d = _a202[_i203];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q200 = false;
                  break Q201;
                }
              }
            }
            _c204 = _q200;
          }
          if (!(_c204)) return -1;
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
  const _g286: number[] = [];
  const _g295: number[] = [];
  const _g302: number[] = [];
  const _g309: number[] = [];
  const _g319: number[] = [];
  const _g337: number[] = [];
  const _g343: number[] = [];
  const _g350: number[] = [];
  const _g356: number[] = [];
  const _g363: number[] = [];
  const _g369: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L285: {
      const v_o = cl.count.at[v_k];
      const _m70_0 = b.made[0];
      _g286.length = 0;
      G287: {
        const _a290 = sp.adj8[v_o];
        for (let _i291 = 0; _i291 < _a290.length; _i291++) {
          const v_d = _a290[_i291];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g286.push(v_d);
        }
      }
      if (!((_g286.length > 0))) break L285;
      const _a292 = within(sp, v_o, 2);
      R2:
      for (let _i293 = 0; _i293 < _a292.length; _i293++) {
        const v_i = _a292[_i293];
        const _m76_1 = b.made[1];
        const _h294 = clueAt(cl.count, v_i);
        let _c301: boolean = ((v_i !== v_o) && (_h294 !== -1));
        if (_c301) {
          _g295.length = 0;
          G296: {
            const _a299 = sp.adj8[v_i];
            for (let _i300 = 0; _i300 < _a299.length; _i300++) {
              const v_d = _a299[_i300];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g295.push(v_d);
            }
          }
          _c301 = (_g295.length > 0);
        }
        let _c308: boolean = _c301;
        if (_c308) {
          _g302.length = 0;
          G303: {
            const _a306 = sp.adj8[v_i];
            for (let _i307 = 0; _i307 < _a306.length; _i307++) {
              const v_d = _a306[_i307];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g302.push(v_d);
            }
          }
          _c308 = subsetOf(_g302, open(b, sp, v_o));
        }
        let _c315: boolean = _c308;
        if (_c315) {
          _g309.length = 0;
          G310: {
            const _a313 = sp.adj8[v_i];
            for (let _i314 = 0; _i314 < _a313.length; _i314++) {
              const v_d = _a313[_i314];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g309.push(v_d);
            }
          }
          _c315 = (_g309.length < open(b, sp, v_o).length);
        }
        if (!(_c315)) continue;
        const _a316 = within(sp, v_o, 3);
        for (let _i317 = 0; _i317 < _a316.length; _i317++) {
          const v_b = _a316[_i317];
          const _h318 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h318 !== -1)))) continue;
          const v_R = minus(open(b, sp, v_o), open(b, sp, v_i));
          _g319.length = 0;
          G320: {
            const _a323 = sp.adj8[v_b];
            for (let _i324 = 0; _i324 < _a323.length; _i324++) {
              const v_d = _a323[_i324];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g319.push(v_d);
            }
          }
          L325: {
            const v_B = _g319;
            let _q326 = false;
            Q327: {
              const _a328 = v_R;
              for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                const v_d = _a328[_i329];
                if ((v_B.includes(v_d))) {
                  _q326 = true;
                  break Q327;
                }
              }
            }
            if (!(_q326)) break L325;
            const _h334 = minus(v_R, v_B).length;
            const _h336 = minus(v_B, v_R).length;
            const v_r = (need(b, sp, cl, v_o) - need(b, sp, cl, v_i));
            let _g330 = 0;
            G331: {
              const _a332 = sp.adj8[v_b];
              for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                const v_d = _a332[_i333];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g330++;
              }
            }
            const v_nb = (_h318 - _g330);
            L335: {
              const v_heavy = ((v_r - v_nb) >= _h334);
              if (!(((v_heavy || ((v_nb - v_r) >= _h336)) && ((_h334 + _h336) > 0)))) break L335;
              if (b.made[0] !== _m70_0 || b.made[1] !== _m76_1) {
                _g337.length = 0;
                G338: {
                  const _a341 = sp.adj8[v_o];
                  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                    const v_d = _a341[_i342];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g337.push(v_d);
                  }
                }
                if (!((_g337.length > 0))) { continue R1; }
                let _c349: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                if (_c349) {
                  _g343.length = 0;
                  G344: {
                    const _a347 = sp.adj8[v_i];
                    for (let _i348 = 0; _i348 < _a347.length; _i348++) {
                      const v_d = _a347[_i348];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g343.push(v_d);
                    }
                  }
                  _c349 = (_g343.length > 0);
                }
                let _c362: boolean = _c349;
                if (_c362) {
                  _g350.length = 0;
                  G351: {
                    const _a354 = sp.adj8[v_i];
                    for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                      const v_d = _a354[_i355];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g350.push(v_d);
                    }
                  }
                  _g356.length = 0;
                  G357: {
                    const _a360 = sp.adj8[v_o];
                    for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                      const v_d = _a360[_i361];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g356.push(v_d);
                    }
                  }
                  _c362 = subsetOf(_g350, _g356);
                }
                let _c375: boolean = _c362;
                if (_c375) {
                  _g363.length = 0;
                  G364: {
                    const _a367 = sp.adj8[v_i];
                    for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                      const v_d = _a367[_i368];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g363.push(v_d);
                    }
                  }
                  _g369.length = 0;
                  G370: {
                    const _a373 = sp.adj8[v_o];
                    for (let _i374 = 0; _i374 < _a373.length; _i374++) {
                      const v_d = _a373[_i374];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g369.push(v_d);
                    }
                  }
                  _c375 = (_g363.length < _g369.length);
                }
                if (!(_c375)) { continue R2; }
              }
              if (import.meta.env.DEV && staleChecking) {
                const _g376: number[] = [];
                G377: {
                  const _a380 = sp.adj8[v_o];
                  for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                    const v_d = _a380[_i381];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g376.push(v_d);
                  }
                }
                let _c388: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                if (_c388) {
                  const _g382: number[] = [];
                  G383: {
                    const _a386 = sp.adj8[v_i];
                    for (let _i387 = 0; _i387 < _a386.length; _i387++) {
                      const v_d = _a386[_i387];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g382.push(v_d);
                    }
                  }
                  _c388 = (_g382.length > 0);
                }
                let _c401: boolean = _c388;
                if (_c401) {
                  const _g389: number[] = [];
                  G390: {
                    const _a393 = sp.adj8[v_i];
                    for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                      const v_d = _a393[_i394];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g389.push(v_d);
                    }
                  }
                  const _g395: number[] = [];
                  G396: {
                    const _a399 = sp.adj8[v_o];
                    for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                      const v_d = _a399[_i400];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g395.push(v_d);
                    }
                  }
                  _c401 = subsetOf(_g389, _g395);
                }
                let _c414: boolean = _c401;
                if (_c414) {
                  const _g402: number[] = [];
                  G403: {
                    const _a406 = sp.adj8[v_i];
                    for (let _i407 = 0; _i407 < _a406.length; _i407++) {
                      const v_d = _a406[_i407];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g402.push(v_d);
                    }
                  }
                  const _g408: number[] = [];
                  G409: {
                    const _a412 = sp.adj8[v_o];
                    for (let _i413 = 0; _i413 < _a412.length; _i413++) {
                      const v_d = _a412[_i413];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g408.push(v_d);
                    }
                  }
                  _c414 = (_g402.length < _g408.length);
                }
                const _g415: number[] = [];
                G416: {
                  const _a419 = sp.adj8[v_o];
                  for (let _i420 = 0; _i420 < _a419.length; _i420++) {
                    const v_d = _a419[_i420];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g415.push(v_d);
                  }
                }
                const _g421: number[] = [];
                G422: {
                  const _a425 = sp.adj8[v_i];
                  for (let _i426 = 0; _i426 < _a425.length; _i426++) {
                    const v_d = _a425[_i426];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g421.push(v_d);
                  }
                }
                const _g427: number[] = [];
                G428: {
                  const _a431 = sp.adj8[v_b];
                  for (let _i432 = 0; _i432 < _a431.length; _i432++) {
                    const v_d = _a431[_i432];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g427.push(v_d);
                  }
                }
                let _q433 = false;
                Q434: {
                  const _a435 = v_R;
                  for (let _i436 = 0; _i436 < _a435.length; _i436++) {
                    const v_d = _a435[_i436];
                    if ((v_B.includes(v_d))) {
                      _q433 = true;
                      break Q434;
                    }
                  }
                }
                let _g437 = 0;
                G438: {
                  const _a439 = sp.adj8[v_o];
                  for (let _i440 = 0; _i440 < _a439.length; _i440++) {
                    const v_d = _a439[_i440];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g437++;
                  }
                }
                let _g441 = 0;
                G442: {
                  const _a443 = sp.adj8[v_i];
                  for (let _i444 = 0; _i444 < _a443.length; _i444++) {
                    const v_d = _a443[_i444];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g441++;
                  }
                }
                let _g445 = 0;
                G446: {
                  const _a447 = sp.adj8[v_b];
                  for (let _i448 = 0; _i448 < _a447.length; _i448++) {
                    const v_d = _a447[_i448];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g445++;
                  }
                }
                freshBinding("region", [(v_o === cl.count.at[v_k]), (_g376.length > 0), (within(sp, v_o, 2).includes(v_i)), _c414, (within(sp, v_o, 3).includes(v_b)), (((v_b !== v_o) && (v_b !== v_i)) && (clueAt(cl.count, v_b) !== -1)), sameSet(v_R, minus(_g415, _g421)), sameSet(v_B, _g427), _q433, (v_r === ((clueAt(cl.count, v_o) - _g437) - (clueAt(cl.count, v_i) - _g441))), (v_nb === (clueAt(cl.count, v_b) - _g445)), (v_heavy === ((v_r - v_nb) >= minus(v_R, v_B).length)), ((v_heavy || ((v_nb - v_r) >= minus(v_B, v_R).length)) && ((minus(v_R, v_B).length + minus(v_B, v_R).length) > 0))], ["o =", "where of o", "i in", "where of i", "b in", "where of b", "R =", "B =", "where of B", "r =", "nb =", "heavy =", "where of heavy"]);
              }
              facts.length = 0;
              changed = false;
              let _c459: boolean = !(v_heavy);
              if (!_c459) {
                let _c453: boolean = ((v_r - v_nb) === _h334);
                if (_c453) {
                  let _q449 = true;
                  Q450: {
                    const _a451 = minus(v_R, v_B);
                    for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                      const v_d = _a451[_i452];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q449 = false;
                        break Q450;
                      }
                    }
                  }
                  _c453 = _q449;
                }
                let _c458: boolean = _c453;
                if (_c458) {
                  let _q454 = true;
                  Q455: {
                    const _a456 = minus(v_B, v_R);
                    for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                      const v_d = _a456[_i457];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q454 = false;
                        break Q455;
                      }
                    }
                  }
                  _c458 = _q454;
                }
                _c459 = _c458;
              }
              let _c471: boolean = _c459;
              if (_c471) {
                let _c470: boolean = v_heavy;
                if (!_c470) {
                  let _c464: boolean = ((v_nb - v_r) === _h336);
                  if (_c464) {
                    let _q460 = true;
                    Q461: {
                      const _a462 = minus(v_B, v_R);
                      for (let _i463 = 0; _i463 < _a462.length; _i463++) {
                        const v_d = _a462[_i463];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q460 = false;
                          break Q461;
                        }
                      }
                    }
                    _c464 = _q460;
                  }
                  let _c469: boolean = _c464;
                  if (_c469) {
                    let _q465 = true;
                    Q466: {
                      const _a467 = minus(v_R, v_B);
                      for (let _i468 = 0; _i468 < _a467.length; _i468++) {
                        const v_d = _a467[_i468];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q465 = false;
                          break Q466;
                        }
                      }
                    }
                    _c469 = _q465;
                  }
                  _c470 = _c469;
                }
                _c471 = _c470;
              }
              if (!(_c471)) return -1;
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
  const _g605: number[] = [];
  const _g614: number[] = [];
  const _g621: number[] = [];
  const _g628: number[] = [];
  const _g635: number[] = [];
  const _g648: number[] = [];
  const _g658: number[] = [];
  const _g665: number[] = [];
  const _g672: number[] = [];
  const _g679: number[] = [];
  const _g697: number[] = [];
  const _g703: number[] = [];
  const _g710: number[] = [];
  const _g716: number[] = [];
  const _g723: number[] = [];
  const _g729: number[] = [];
  const _g736: number[] = [];
  const _g742: number[] = [];
  const _g756: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L604: {
      const v_o = cl.count.at[v_k];
      const _m125_0 = b.made[0];
      _g605.length = 0;
      G606: {
        const _a609 = sp.adj8[v_o];
        for (let _i610 = 0; _i610 < _a609.length; _i610++) {
          const v_d = _a609[_i610];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g605.push(v_d);
        }
      }
      if (!((_g605.length > 0))) break L604;
      const _a611 = within(sp, v_o, 2);
      R2:
      for (let _i612 = 0; _i612 < _a611.length; _i612++) {
        const v_i = _a611[_i612];
        const _m131_1 = b.made[1];
        const _h613 = clueAt(cl.count, v_i);
        let _c620: boolean = ((v_i !== v_o) && (_h613 !== -1));
        if (_c620) {
          _g614.length = 0;
          G615: {
            const _a618 = sp.adj8[v_i];
            for (let _i619 = 0; _i619 < _a618.length; _i619++) {
              const v_d = _a618[_i619];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g614.push(v_d);
            }
          }
          _c620 = (_g614.length > 0);
        }
        let _c627: boolean = _c620;
        if (_c627) {
          _g621.length = 0;
          G622: {
            const _a625 = sp.adj8[v_i];
            for (let _i626 = 0; _i626 < _a625.length; _i626++) {
              const v_d = _a625[_i626];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g621.push(v_d);
            }
          }
          _c627 = subsetOf(_g621, open(b, sp, v_o));
        }
        let _c634: boolean = _c627;
        if (_c634) {
          _g628.length = 0;
          G629: {
            const _a632 = sp.adj8[v_i];
            for (let _i633 = 0; _i633 < _a632.length; _i633++) {
              const v_d = _a632[_i633];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g628.push(v_d);
            }
          }
          _c634 = (_g628.length < open(b, sp, v_o).length);
        }
        if (!(_c634)) continue;
        _g635.length = 0;
        G636: {
          const _a639 = sp.adj8[v_i];
          for (let _i640 = 0; _i640 < _a639.length; _i640++) {
            const v_d = _a639[_i640];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g635.push(v_d);
          }
        }
        const v_R = minus(open(b, sp, v_o), _g635);
        let _g641 = 0;
        G642: {
          const _a643 = sp.adj8[v_i];
          for (let _i644 = 0; _i644 < _a643.length; _i644++) {
            const v_d = _a643[_i644];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g641++;
          }
        }
        const v_r = (need(b, sp, cl, v_o) - (_h613 - _g641));
        const _a645 = within(sp, v_o, 2);
        R3:
        for (let _i646 = 0; _i646 < _a645.length; _i646++) {
          const v_p = _a645[_i646];
          const _h647 = clueAt(cl.count, v_p);
          let _c654: boolean = ((v_p !== v_o) && (_h647 !== -1));
          if (_c654) {
            _g648.length = 0;
            G649: {
              const _a652 = sp.adj8[v_p];
              for (let _i653 = 0; _i653 < _a652.length; _i653++) {
                const v_d = _a652[_i653];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g648.push(v_d);
              }
            }
            _c654 = (_g648.length > 0);
          }
          if (!(_c654)) continue;
          const _a655 = within(sp, v_p, 2);
          for (let _i656 = 0; _i656 < _a655.length; _i656++) {
            const v_q = _a655[_i656];
            const _h657 = clueAt(cl.count, v_q);
            let _c664: boolean = ((v_q !== v_p) && (_h657 !== -1));
            if (_c664) {
              _g658.length = 0;
              G659: {
                const _a662 = sp.adj8[v_q];
                for (let _i663 = 0; _i663 < _a662.length; _i663++) {
                  const v_d = _a662[_i663];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g658.push(v_d);
                }
              }
              _c664 = (_g658.length > 0);
            }
            let _c671: boolean = _c664;
            if (_c671) {
              _g665.length = 0;
              G666: {
                const _a669 = sp.adj8[v_q];
                for (let _i670 = 0; _i670 < _a669.length; _i670++) {
                  const v_d = _a669[_i670];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g665.push(v_d);
                }
              }
              _c671 = subsetOf(_g665, open(b, sp, v_p));
            }
            let _c678: boolean = _c671;
            if (_c678) {
              _g672.length = 0;
              G673: {
                const _a676 = sp.adj8[v_q];
                for (let _i677 = 0; _i677 < _a676.length; _i677++) {
                  const v_d = _a676[_i677];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g672.push(v_d);
                }
              }
              _c678 = (_g672.length < open(b, sp, v_p).length);
            }
            if (!(_c678)) continue;
            _g679.length = 0;
            G680: {
              const _a683 = sp.adj8[v_q];
              for (let _i684 = 0; _i684 < _a683.length; _i684++) {
                const v_d = _a683[_i684];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g679.push(v_d);
              }
            }
            L685: {
              const v_S = minus(open(b, sp, v_p), _g679);
              let _q686 = false;
              Q687: {
                const _a688 = v_R;
                for (let _i689 = 0; _i689 < _a688.length; _i689++) {
                  const v_d = _a688[_i689];
                  if ((v_S.includes(v_d))) {
                    _q686 = true;
                    break Q687;
                  }
                }
              }
              if (!(_q686)) break L685;
              const _h695 = minus(v_R, v_S).length;
              const _h696 = minus(v_S, v_R).length;
              let _g690 = 0;
              G691: {
                const _a692 = sp.adj8[v_q];
                for (let _i693 = 0; _i693 < _a692.length; _i693++) {
                  const v_d = _a692[_i693];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g690++;
                }
              }
              L694: {
                const v_by = (v_r - (need(b, sp, cl, v_p) - (_h657 - _g690)));
                if (!(((v_by >= _h695) && ((_h695 + _h696) > 0)))) break L694;
                if (b.made[0] !== _m125_0 || b.made[1] !== _m131_1) {
                  _g697.length = 0;
                  G698: {
                    const _a701 = sp.adj8[v_o];
                    for (let _i702 = 0; _i702 < _a701.length; _i702++) {
                      const v_d = _a701[_i702];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g697.push(v_d);
                    }
                  }
                  if (!((_g697.length > 0))) { continue R1; }
                  let _c709: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                  if (_c709) {
                    _g703.length = 0;
                    G704: {
                      const _a707 = sp.adj8[v_i];
                      for (let _i708 = 0; _i708 < _a707.length; _i708++) {
                        const v_d = _a707[_i708];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g703.push(v_d);
                      }
                    }
                    _c709 = (_g703.length > 0);
                  }
                  let _c722: boolean = _c709;
                  if (_c722) {
                    _g710.length = 0;
                    G711: {
                      const _a714 = sp.adj8[v_i];
                      for (let _i715 = 0; _i715 < _a714.length; _i715++) {
                        const v_d = _a714[_i715];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g710.push(v_d);
                      }
                    }
                    _g716.length = 0;
                    G717: {
                      const _a720 = sp.adj8[v_o];
                      for (let _i721 = 0; _i721 < _a720.length; _i721++) {
                        const v_d = _a720[_i721];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g716.push(v_d);
                      }
                    }
                    _c722 = subsetOf(_g710, _g716);
                  }
                  let _c735: boolean = _c722;
                  if (_c735) {
                    _g723.length = 0;
                    G724: {
                      const _a727 = sp.adj8[v_i];
                      for (let _i728 = 0; _i728 < _a727.length; _i728++) {
                        const v_d = _a727[_i728];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g723.push(v_d);
                      }
                    }
                    _g729.length = 0;
                    G730: {
                      const _a733 = sp.adj8[v_o];
                      for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                        const v_d = _a733[_i734];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g729.push(v_d);
                      }
                    }
                    _c735 = (_g723.length < _g729.length);
                  }
                  if (!(_c735)) { continue R2; }
                  _g736.length = 0;
                  G737: {
                    const _a740 = sp.adj8[v_o];
                    for (let _i741 = 0; _i741 < _a740.length; _i741++) {
                      const v_d = _a740[_i741];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g736.push(v_d);
                    }
                  }
                  _g742.length = 0;
                  G743: {
                    const _a746 = sp.adj8[v_i];
                    for (let _i747 = 0; _i747 < _a746.length; _i747++) {
                      const v_d = _a746[_i747];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g742.push(v_d);
                    }
                  }
                  if (!(sameSet(v_R, minus(_g736, _g742)))) { continue R2; }
                  let _g748 = 0;
                  G749: {
                    const _a750 = sp.adj8[v_o];
                    for (let _i751 = 0; _i751 < _a750.length; _i751++) {
                      const v_d = _a750[_i751];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g748++;
                    }
                  }
                  let _g752 = 0;
                  G753: {
                    const _a754 = sp.adj8[v_i];
                    for (let _i755 = 0; _i755 < _a754.length; _i755++) {
                      const v_d = _a754[_i755];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g752++;
                    }
                  }
                  if (!((v_r === ((clueAt(cl.count, v_o) - _g748) - (clueAt(cl.count, v_i) - _g752))))) { continue R2; }
                  let _c762: boolean = ((v_p !== v_o) && (clueAt(cl.count, v_p) !== -1));
                  if (_c762) {
                    _g756.length = 0;
                    G757: {
                      const _a760 = sp.adj8[v_p];
                      for (let _i761 = 0; _i761 < _a760.length; _i761++) {
                        const v_d = _a760[_i761];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g756.push(v_d);
                      }
                    }
                    _c762 = (_g756.length > 0);
                  }
                  if (!(_c762)) { continue R3; }
                }
                if (import.meta.env.DEV && staleChecking) {
                  const _g763: number[] = [];
                  G764: {
                    const _a767 = sp.adj8[v_o];
                    for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                      const v_d = _a767[_i768];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g763.push(v_d);
                    }
                  }
                  let _c775: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                  if (_c775) {
                    const _g769: number[] = [];
                    G770: {
                      const _a773 = sp.adj8[v_i];
                      for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                        const v_d = _a773[_i774];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g769.push(v_d);
                      }
                    }
                    _c775 = (_g769.length > 0);
                  }
                  let _c788: boolean = _c775;
                  if (_c788) {
                    const _g776: number[] = [];
                    G777: {
                      const _a780 = sp.adj8[v_i];
                      for (let _i781 = 0; _i781 < _a780.length; _i781++) {
                        const v_d = _a780[_i781];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g776.push(v_d);
                      }
                    }
                    const _g782: number[] = [];
                    G783: {
                      const _a786 = sp.adj8[v_o];
                      for (let _i787 = 0; _i787 < _a786.length; _i787++) {
                        const v_d = _a786[_i787];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g782.push(v_d);
                      }
                    }
                    _c788 = subsetOf(_g776, _g782);
                  }
                  let _c801: boolean = _c788;
                  if (_c801) {
                    const _g789: number[] = [];
                    G790: {
                      const _a793 = sp.adj8[v_i];
                      for (let _i794 = 0; _i794 < _a793.length; _i794++) {
                        const v_d = _a793[_i794];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g789.push(v_d);
                      }
                    }
                    const _g795: number[] = [];
                    G796: {
                      const _a799 = sp.adj8[v_o];
                      for (let _i800 = 0; _i800 < _a799.length; _i800++) {
                        const v_d = _a799[_i800];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g795.push(v_d);
                      }
                    }
                    _c801 = (_g789.length < _g795.length);
                  }
                  const _g802: number[] = [];
                  G803: {
                    const _a806 = sp.adj8[v_o];
                    for (let _i807 = 0; _i807 < _a806.length; _i807++) {
                      const v_d = _a806[_i807];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g802.push(v_d);
                    }
                  }
                  const _g808: number[] = [];
                  G809: {
                    const _a812 = sp.adj8[v_i];
                    for (let _i813 = 0; _i813 < _a812.length; _i813++) {
                      const v_d = _a812[_i813];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g808.push(v_d);
                    }
                  }
                  let _g814 = 0;
                  G815: {
                    const _a816 = sp.adj8[v_o];
                    for (let _i817 = 0; _i817 < _a816.length; _i817++) {
                      const v_d = _a816[_i817];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g814++;
                    }
                  }
                  let _g818 = 0;
                  G819: {
                    const _a820 = sp.adj8[v_i];
                    for (let _i821 = 0; _i821 < _a820.length; _i821++) {
                      const v_d = _a820[_i821];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g818++;
                    }
                  }
                  let _c828: boolean = ((v_p !== v_o) && (clueAt(cl.count, v_p) !== -1));
                  if (_c828) {
                    const _g822: number[] = [];
                    G823: {
                      const _a826 = sp.adj8[v_p];
                      for (let _i827 = 0; _i827 < _a826.length; _i827++) {
                        const v_d = _a826[_i827];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g822.push(v_d);
                      }
                    }
                    _c828 = (_g822.length > 0);
                  }
                  let _c835: boolean = ((v_q !== v_p) && (clueAt(cl.count, v_q) !== -1));
                  if (_c835) {
                    const _g829: number[] = [];
                    G830: {
                      const _a833 = sp.adj8[v_q];
                      for (let _i834 = 0; _i834 < _a833.length; _i834++) {
                        const v_d = _a833[_i834];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g829.push(v_d);
                      }
                    }
                    _c835 = (_g829.length > 0);
                  }
                  let _c848: boolean = _c835;
                  if (_c848) {
                    const _g836: number[] = [];
                    G837: {
                      const _a840 = sp.adj8[v_q];
                      for (let _i841 = 0; _i841 < _a840.length; _i841++) {
                        const v_d = _a840[_i841];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g836.push(v_d);
                      }
                    }
                    const _g842: number[] = [];
                    G843: {
                      const _a846 = sp.adj8[v_p];
                      for (let _i847 = 0; _i847 < _a846.length; _i847++) {
                        const v_d = _a846[_i847];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g842.push(v_d);
                      }
                    }
                    _c848 = subsetOf(_g836, _g842);
                  }
                  let _c861: boolean = _c848;
                  if (_c861) {
                    const _g849: number[] = [];
                    G850: {
                      const _a853 = sp.adj8[v_q];
                      for (let _i854 = 0; _i854 < _a853.length; _i854++) {
                        const v_d = _a853[_i854];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g849.push(v_d);
                      }
                    }
                    const _g855: number[] = [];
                    G856: {
                      const _a859 = sp.adj8[v_p];
                      for (let _i860 = 0; _i860 < _a859.length; _i860++) {
                        const v_d = _a859[_i860];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g855.push(v_d);
                      }
                    }
                    _c861 = (_g849.length < _g855.length);
                  }
                  const _g862: number[] = [];
                  G863: {
                    const _a866 = sp.adj8[v_p];
                    for (let _i867 = 0; _i867 < _a866.length; _i867++) {
                      const v_d = _a866[_i867];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g862.push(v_d);
                    }
                  }
                  const _g868: number[] = [];
                  G869: {
                    const _a872 = sp.adj8[v_q];
                    for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                      const v_d = _a872[_i873];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g868.push(v_d);
                    }
                  }
                  let _q874 = false;
                  Q875: {
                    const _a876 = v_R;
                    for (let _i877 = 0; _i877 < _a876.length; _i877++) {
                      const v_d = _a876[_i877];
                      if ((v_S.includes(v_d))) {
                        _q874 = true;
                        break Q875;
                      }
                    }
                  }
                  let _g878 = 0;
                  G879: {
                    const _a880 = sp.adj8[v_p];
                    for (let _i881 = 0; _i881 < _a880.length; _i881++) {
                      const v_d = _a880[_i881];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g878++;
                    }
                  }
                  let _g882 = 0;
                  G883: {
                    const _a884 = sp.adj8[v_q];
                    for (let _i885 = 0; _i885 < _a884.length; _i885++) {
                      const v_d = _a884[_i885];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g882++;
                    }
                  }
                  freshBinding("regions", [(v_o === cl.count.at[v_k]), (_g763.length > 0), (within(sp, v_o, 2).includes(v_i)), _c801, sameSet(v_R, minus(_g802, _g808)), (v_r === ((clueAt(cl.count, v_o) - _g814) - (clueAt(cl.count, v_i) - _g818))), (within(sp, v_o, 2).includes(v_p)), _c828, (within(sp, v_p, 2).includes(v_q)), _c861, sameSet(v_S, minus(_g862, _g868)), _q874, (v_by === (v_r - ((clueAt(cl.count, v_p) - _g878) - (clueAt(cl.count, v_q) - _g882)))), ((v_by >= minus(v_R, v_S).length) && ((minus(v_R, v_S).length + minus(v_S, v_R).length) > 0))], ["o =", "where of o", "i in", "where of i", "R =", "r =", "p in", "where of p", "q in", "where of q", "S =", "where of S", "by =", "where of by"]);
                }
                facts.length = 0;
                changed = false;
                let _c890: boolean = (v_by === _h695);
                if (_c890) {
                  let _q886 = true;
                  Q887: {
                    const _a888 = minus(v_R, v_S);
                    for (let _i889 = 0; _i889 < _a888.length; _i889++) {
                      const v_d = _a888[_i889];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q886 = false;
                        break Q887;
                      }
                    }
                  }
                  _c890 = _q886;
                }
                let _c895: boolean = _c890;
                if (_c895) {
                  let _q891 = true;
                  Q892: {
                    const _a893 = minus(v_S, v_R);
                    for (let _i894 = 0; _i894 < _a893.length; _i894++) {
                      const v_d = _a893[_i894];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q891 = false;
                        break Q892;
                      }
                    }
                  }
                  _c895 = _q891;
                }
                if (!(_c895)) return -1;
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
const _st1020 = stamps();

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g962: number[] = [];
  const _g986: number[] = [];
  const _g1007: number[] = [];
  const _g1024: number[] = [];
  const _g1035: number[] = [];
  const _g1119: number[] = [];
  const _g1132: number[] = [];
  const _g1141: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  if (countCands.length < sp.cells.length) countCands = new Int32Array(sp.cells.length);
  const cands = countCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  const _m187_0 = b.made[0];
  _g962.length = 0;
  G963: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q968 = false;
      Q969: {
        const _a970 = sp.adj8[cl.count.at[v_k]];
        for (let _i971 = 0; _i971 < _a970.length; _i971++) {
          const v_d = _a970[_i971];
          if (!((b.grid[v_d] !== 0))) {
            _q968 = true;
            break Q969;
          }
        }
      }
      if (!(_q968)) continue;
      _g962.push(v_k);
    }
  }
  L972: {
    const v_C = _g962;
    const _h973 = v_C.length;
    if (!((_h973 <= 10))) break L972;
    const _m194_1 = b.made[1];
    let _g974 = 0;
    G975: {
      const _a976 = cellsValued(b, sp.cells, 1);
      for (let _i977 = 0; _i977 < _a976.length; _i977++) {
        const v_c = _a976[_i977];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g974++;
      }
    }
    const v_L = (cl.mines - _g974);
    let _g978 = 0;
    G979: {
      const _a980 = sp.cells;
      for (let _i981 = 0; _i981 < _a980.length; _i981++) {
        const v_c = _a980[_i981];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g978++;
      }
    }
    const v_u = _g978;
    for (let v_size = 0; v_size <= 5; v_size++) {
      const _e982 = v_C;
      const _n985 = 1 << _e982.length;
      for (let _k983 = v_size > _e982.length ? _n985 : (1 << v_size) - 1; _k983 < _n985; _k983 = v_size === 0 ? _n985 : nextOfSize(_k983)) {
        const v_T = _g986;
        v_T.length = 0;
        for (let _j984 = 0; _j984 < _e982.length; _j984++) if ((_k983 >> (_e982.length - 1 - _j984)) & 1) v_T.push(_e982[_j984]);
        const _h987 = v_T.length;
        let _c996: boolean = (_h987 === v_size);
        if (_c996) {
          let _q988 = true;
          Q989: {
            const _a990 = v_T;
            for (let _i991 = 0; _i991 < _a990.length; _i991++) {
              const v_x = _a990[_i991];
              const _h994 = cl.count.at[v_x];
              const _a992 = v_T;
              for (let _i993 = 0; _i993 < _a992.length; _i993++) {
                const v_y = _a992[_i993];
                if (!((v_x !== v_y))) continue;
                const _t995 = cl.count.at[v_y];
                if (!(!(meetMarked(b, sp, cands, _h994, _t995)))) {
                  _q988 = false;
                  break Q989;
                }
              }
            }
          }
          _c996 = _q988;
        }
        if (!(_c996)) continue;
        let _g997 = 0;
        G998: {
          const _a999 = v_T;
          for (let _i1000 = 0; _i1000 < _a999.length; _i1000++) {
            const v_x = _a999[_i1000];
            const _t1001 = cl.count.at[v_x];
            const _h1002 = clueAt(cl.count, _t1001);
            let _g1003 = 0;
            G1004: {
              const _a1005 = sp.adj8[_t1001];
              for (let _i1006 = 0; _i1006 < _a1005.length; _i1006++) {
                const v_d = _a1005[_i1006];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g1003++;
              }
            }
            _g997 += (_h1002 - _g1003);
          }
        }
        const v_n = _g997;
        _g1007.length = 0;
        _st1020.pass++;
        G1008: {
          const _a1021 = v_T;
          for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
            const v_x = _a1021[_i1022];
            const _t1023 = cl.count.at[v_x];
            _g1024.length = 0;
            G1025: {
              const _a1028 = sp.adj8[_t1023];
              for (let _i1029 = 0; _i1029 < _a1028.length; _i1029++) {
                const v_d = _a1028[_i1029];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g1024.push(v_d);
              }
            }
            const _a1030 = _g1024;
            for (let _i1031 = 0; _i1031 < _a1030.length; _i1031++) {
              const v_d = _a1030[_i1031];
              const _t1032 = v_d;
              if (_g1007.length < 16) { if (!_g1007.includes(_t1032)) _g1007.push(_t1032); } else addOnce(_g1007, _st1020, _t1032);
            }
          }
        }
        L1033: {
          const v_X = _g1007;
          const _h1034 = v_X.length;
          if (!(((v_u > _h1034) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h1034)))))) break L1033;
          if (b.made[0] !== _m187_0 || b.made[1] !== _m194_1) {
            _g1035.length = 0;
            G1036: {
              for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
                let _q1041 = false;
                Q1042: {
                  const _a1043 = sp.adj8[cl.count.at[v_k]];
                  for (let _i1044 = 0; _i1044 < _a1043.length; _i1044++) {
                    const v_d = _a1043[_i1044];
                    if (!((b.grid[v_d] !== 0))) {
                      _q1041 = true;
                      break Q1042;
                    }
                  }
                }
                if (!(_q1041)) continue;
                _g1035.push(v_k);
              }
            }
            if (!(sameSet(v_C, _g1035))) { return fired; }
            let _g1045 = 0;
            G1046: {
              const _a1047 = cellsValued(b, sp.cells, 1);
              for (let _i1048 = 0; _i1048 < _a1047.length; _i1048++) {
                const v_c = _a1047[_i1048];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1045++;
              }
            }
            if (!((v_L === (cl.mines - _g1045)))) { return fired; }
            let _g1049 = 0;
            G1050: {
              const _a1051 = sp.cells;
              for (let _i1052 = 0; _i1052 < _a1051.length; _i1052++) {
                const v_c = _a1051[_i1052];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1049++;
              }
            }
            if (!((v_u === _g1049))) { return fired; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g1053: number[] = [];
            G1054: {
              for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
                let _q1059 = false;
                Q1060: {
                  const _a1061 = sp.adj8[cl.count.at[v_k]];
                  for (let _i1062 = 0; _i1062 < _a1061.length; _i1062++) {
                    const v_d = _a1061[_i1062];
                    if (!((b.grid[v_d] !== 0))) {
                      _q1059 = true;
                      break Q1060;
                    }
                  }
                }
                if (!(_q1059)) continue;
                _g1053.push(v_k);
              }
            }
            let _g1063 = 0;
            G1064: {
              const _a1065 = cellsValued(b, sp.cells, 1);
              for (let _i1066 = 0; _i1066 < _a1065.length; _i1066++) {
                const v_c = _a1065[_i1066];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1063++;
              }
            }
            let _g1067 = 0;
            G1068: {
              const _a1069 = sp.cells;
              for (let _i1070 = 0; _i1070 < _a1069.length; _i1070++) {
                const v_c = _a1069[_i1070];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g1067++;
              }
            }
            let _c1079: boolean = (v_T.length === v_size);
            if (_c1079) {
              let _q1071 = true;
              Q1072: {
                const _a1073 = v_T;
                for (let _i1074 = 0; _i1074 < _a1073.length; _i1074++) {
                  const v_x = _a1073[_i1074];
                  const _a1075 = v_T;
                  for (let _i1076 = 0; _i1076 < _a1075.length; _i1076++) {
                    const v_y = _a1075[_i1076];
                    if (!((v_x !== v_y))) continue;
                    const _t1077 = cl.count.at[v_x];
                    const _t1078 = cl.count.at[v_y];
                    if (!(!(meetMarked(b, sp, cands, _t1077, _t1078)))) {
                      _q1071 = false;
                      break Q1072;
                    }
                  }
                }
              }
              _c1079 = _q1071;
            }
            let _g1080 = 0;
            G1081: {
              const _a1082 = v_T;
              for (let _i1083 = 0; _i1083 < _a1082.length; _i1083++) {
                const v_x = _a1082[_i1083];
                const _t1084 = cl.count.at[v_x];
                let _g1085 = 0;
                G1086: {
                  const _a1087 = sp.adj8[_t1084];
                  for (let _i1088 = 0; _i1088 < _a1087.length; _i1088++) {
                    const v_d = _a1087[_i1088];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g1085++;
                  }
                }
                _g1080 += (clueAt(cl.count, _t1084) - _g1085);
              }
            }
            const _g1089: number[] = [];
            G1090: {
              const _a1102 = v_T;
              for (let _i1103 = 0; _i1103 < _a1102.length; _i1103++) {
                const v_x = _a1102[_i1103];
                const _t1104 = cl.count.at[v_x];
                const _g1105: number[] = [];
                G1106: {
                  const _a1109 = sp.adj8[_t1104];
                  for (let _i1110 = 0; _i1110 < _a1109.length; _i1110++) {
                    const v_d = _a1109[_i1110];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g1105.push(v_d);
                  }
                }
                const _a1111 = _g1105;
                for (let _i1112 = 0; _i1112 < _a1111.length; _i1112++) {
                  const v_d = _a1111[_i1112];
                  if (!_g1089.includes(v_d)) _g1089.push(v_d);
                }
              }
            }
            freshBinding("count", [sameSet(v_C, _g1053), (v_C.length <= 10), (v_L === (cl.mines - _g1063)), (v_u === _g1067), ((0 <= v_size) && (v_size <= 5)), _c1079, (v_n === _g1080), sameSet(v_X, _g1089), ((v_u > v_X.length) && ((v_n === v_L) || ((v_L - v_n) === (v_u - v_X.length))))], ["C =", "where of C", "L =", "u =", "size in", "where of T", "n =", "X =", "where of X"]);
          }
          facts.length = 0;
          changed = false;
          let _g1113 = 0;
          G1114: {
            const _a1115 = cellsValued(b, sp.cells, 1);
            for (let _i1116 = 0; _i1116 < _a1115.length; _i1116++) {
              const v_c = _a1115[_i1116];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1113++;
            }
          }
          let _c1127: boolean = !((v_n === (cl.mines - _g1113)));
          if (!_c1127) {
            let _q1117 = true;
            Q1118: {
              _g1119.length = 0;
              G1120: {
                const _a1123 = sp.cells;
                for (let _i1124 = 0; _i1124 < _a1123.length; _i1124++) {
                  const v_c = _a1123[_i1124];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g1119.push(v_c);
                }
              }
              const _a1125 = _g1119;
              for (let _i1126 = 0; _i1126 < _a1125.length; _i1126++) {
                const v_d = _a1125[_i1126];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q1117 = false;
                  break Q1118;
                }
              }
            }
            _c1127 = _q1117;
          }
          let _c1150: boolean = _c1127;
          if (_c1150) {
            let _g1128 = 0;
            G1129: {
              const _a1130 = cellsValued(b, sp.cells, 1);
              for (let _i1131 = 0; _i1131 < _a1130.length; _i1131++) {
                const v_c = _a1130[_i1131];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1128++;
              }
            }
            let _c1138: boolean = (v_n !== (cl.mines - _g1128));
            if (_c1138) {
              _g1132.length = 0;
              G1133: {
                const _a1136 = sp.cells;
                for (let _i1137 = 0; _i1137 < _a1136.length; _i1137++) {
                  const v_c = _a1136[_i1137];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g1132.push(v_c);
                }
              }
              _c1138 = (((cl.mines - _g1128) - v_n) === _g1132.length);
            }
            let _c1149: boolean = !(_c1138);
            if (!_c1149) {
              let _q1139 = true;
              Q1140: {
                _g1141.length = 0;
                G1142: {
                  const _a1145 = sp.cells;
                  for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
                    const v_c = _a1145[_i1146];
                    if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                    _g1141.push(v_c);
                  }
                }
                const _a1147 = _g1141;
                for (let _i1148 = 0; _i1148 < _a1147.length; _i1148++) {
                  const v_d = _a1147[_i1148];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q1139 = false;
                    break Q1140;
                  }
                }
              }
              _c1149 = _q1139;
            }
            _c1150 = _c1149;
          }
          if (!(_c1150)) return -1;
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
  let _c78: boolean = ((Math.abs(((v_a % sp.w) - (v_b % sp.w))) <= 2) && (Math.abs((((v_a / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 2));
  if (_c78) {
    let _q62 = false;
    Q63: {
      const _g64: number[] = [];
      G65: {
        const _a68 = sp.adj8[v_a];
        for (let _i69 = 0; _i69 < _a68.length; _i69++) {
          const v_d = _a68[_i69];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g64.push(v_d);
        }
      }
      const _a70 = _g64;
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_d = _a70[_i71];
        const _g72: number[] = [];
        G73: {
          const _a76 = sp.adj8[v_b];
          for (let _i77 = 0; _i77 < _a76.length; _i77++) {
            const v_d = _a76[_i77];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g72.push(v_d);
          }
        }
        if ((_g72.includes(v_d))) {
          _q62 = true;
          break Q63;
        }
      }
    }
    _c78 = _q62;
  }
  const _made = _c78;
  meetMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g122 = 0;
  G123: {
    const _a124 = sp.adj8[v_c];
    for (let _i125 = 0; _i125 < _a124.length; _i125++) {
      const v_d = _a124[_i125];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g122++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g122);
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g130: number[] = [];
  G131: {
    const _a134 = sp.adj8[v_c];
    for (let _i135 = 0; _i135 < _a134.length; _i135++) {
      const v_d = _a134[_i135];
      if (!(!((b.grid[v_d] !== 0)))) continue;
      _g130.push(v_d);
    }
  }
  const _made = _g130;
  _kept[v_c] = _made;
  return _made;
}
