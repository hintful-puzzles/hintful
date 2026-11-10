// Compiled by `npm run describe` from src/games/mines/mines.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, freshBinding, keptStore, minus, nextOfSize, rangeMask, sameSet, staleChecking, stamps, subsetOf, type Kept, within } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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
  let _g1 = 0;
  G2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      const _h5 = (g[v_c] || -1);
      if (!((_h5 === 1))) continue;
      _g1++;
    }
  }
  if (!((_g1 === cl.mines))) return false;
  for (let _k6 = 0; _k6 < cl.count.at.length; _k6++) {
    const _at7 = cl.count.at[_k6];
    const _v8 = cl.count.v[_k6];
    let _c14: boolean = ((g[_at7] || -1) === 2);
    if (_c14) {
      let _g9 = 0;
      G10: {
        const _a11 = sp.adj8[_at7];
        for (let _i12 = 0; _i12 < _a11.length; _i12++) {
          const v_d = _a11[_i12];
          const _h13 = (g[v_d] || -1);
          if (!((_h13 === 1))) continue;
          _g9++;
        }
      }
      _c14 = (_g9 === _v8);
    }
    if (!(_c14)) return false;
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
      if (DEV && staleChecking) {
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
  const _g44: number[] = [];
  const _g57: number[] = [];
  const _g63: number[] = [];
  const _g72: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  if (pairCands.length < sp.cells.length) pairCands = new Int32Array(sp.cells.length);
  const cands = pairCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L43: {
      const v_a = cl.count.at[v_k];
      const _m126_0 = b.made[0];
      _g44.length = 0;
      G45: {
        const _a48 = sp.adj8[v_a];
        for (let _i49 = 0; _i49 < _a48.length; _i49++) {
          const v_d = _a48[_i49];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g44.push(v_d);
        }
      }
      if (!((_g44.length > 0))) break L43;
      const _a50 = within(sp, v_a, 2);
      for (let _i51 = 0; _i51 < _a50.length; _i51++) {
        const v_b = _a50[_i51];
        const _h52 = clueAt(cl.count, v_b);
        if (!((((v_b !== v_a) && (_h52 !== -1)) && meetMarked(b, sp, cands, v_a, v_b)))) continue;
        let _g53 = 0;
        G54: {
          const _a55 = sp.adj8[v_b];
          for (let _i56 = 0; _i56 < _a55.length; _i56++) {
            const v_d = _a55[_i56];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g53++;
          }
        }
        const v_by = (need(b, sp, cl, v_a) - (_h52 - _g53));
        _g57.length = 0;
        G58: {
          const _a61 = sp.adj8[v_b];
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_d = _a61[_i62];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g57.push(v_d);
          }
        }
        const v_O = minus(open(b, sp, v_a), _g57);
        const _h70 = v_O.length;
        _g63.length = 0;
        G64: {
          const _a67 = sp.adj8[v_b];
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_d = _a67[_i68];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g63.push(v_d);
          }
        }
        L69: {
          const v_S = minus(_g63, open(b, sp, v_a));
          const _h71 = v_S.length;
          if (!(((v_by >= _h70) && ((_h70 + _h71) > 0)))) break L69;
          if (b.made[0] !== _m126_0) {
            _g72.length = 0;
            G73: {
              const _a76 = sp.adj8[v_a];
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_d = _a76[_i77];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g72.push(v_d);
              }
            }
            if (!((_g72.length > 0))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _g78: number[] = [];
            G79: {
              const _a82 = sp.adj8[v_a];
              for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                const v_d = _a82[_i83];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g78.push(v_d);
              }
            }
            let _g84 = 0;
            G85: {
              const _a86 = sp.adj8[v_a];
              for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                const v_d = _a86[_i87];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g84++;
              }
            }
            let _g88 = 0;
            G89: {
              const _a90 = sp.adj8[v_b];
              for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                const v_d = _a90[_i91];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g88++;
              }
            }
            const _g92: number[] = [];
            G93: {
              const _a96 = sp.adj8[v_a];
              for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                const v_d = _a96[_i97];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g92.push(v_d);
              }
            }
            const _g98: number[] = [];
            G99: {
              const _a102 = sp.adj8[v_b];
              for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                const v_d = _a102[_i103];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g98.push(v_d);
              }
            }
            const _g104: number[] = [];
            G105: {
              const _a108 = sp.adj8[v_b];
              for (let _i109 = 0; _i109 < _a108.length; _i109++) {
                const v_d = _a108[_i109];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g104.push(v_d);
              }
            }
            const _g110: number[] = [];
            G111: {
              const _a114 = sp.adj8[v_a];
              for (let _i115 = 0; _i115 < _a114.length; _i115++) {
                const v_d = _a114[_i115];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g110.push(v_d);
              }
            }
            freshBinding("pair", [(v_a === cl.count.at[v_k]), (_g78.length > 0), (within(sp, v_a, 2).includes(v_b)), (((v_b !== v_a) && (clueAt(cl.count, v_b) !== -1)) && meetMarked(b, sp, cands, v_a, v_b)), (v_by === ((clueAt(cl.count, v_a) - _g84) - (clueAt(cl.count, v_b) - _g88))), sameSet(v_O, minus(_g92, _g98)), sameSet(v_S, minus(_g104, _g110)), ((v_by >= v_O.length) && ((v_O.length + v_S.length) > 0))], ["a =", "where of a", "b in", "where of b", "by =", "O =", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          let _c120: boolean = (v_by === _h70);
          if (_c120) {
            let _q116 = true;
            Q117: {
              const _a118 = v_O;
              for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                const v_d = _a118[_i119];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                if (!(true)) {
                  _q116 = false;
                  break Q117;
                }
              }
            }
            _c120 = _q116;
          }
          let _c125: boolean = _c120;
          if (_c125) {
            let _q121 = true;
            Q122: {
              const _a123 = v_S;
              for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                const v_d = _a123[_i124];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q121 = false;
                  break Q122;
                }
              }
            }
            _c125 = _q121;
          }
          if (!(_c125)) return -1;
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
  const _g82: number[] = [];
  const _g91: number[] = [];
  const _g98: number[] = [];
  const _g105: number[] = [];
  const _g115: number[] = [];
  const _g133: number[] = [];
  const _g139: number[] = [];
  const _g146: number[] = [];
  const _g152: number[] = [];
  const _g159: number[] = [];
  const _g165: number[] = [];
  const facts = regionFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L81: {
      const v_o = cl.count.at[v_k];
      const _m268_0 = b.made[0];
      _g82.length = 0;
      G83: {
        const _a86 = sp.adj8[v_o];
        for (let _i87 = 0; _i87 < _a86.length; _i87++) {
          const v_d = _a86[_i87];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g82.push(v_d);
        }
      }
      if (!((_g82.length > 0))) break L81;
      const _a88 = within(sp, v_o, 2);
      R2:
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_i = _a88[_i89];
        const _m269_1 = b.made[1];
        const _h90 = clueAt(cl.count, v_i);
        let _c97: boolean = ((v_i !== v_o) && (_h90 !== -1));
        if (_c97) {
          _g91.length = 0;
          G92: {
            const _a95 = sp.adj8[v_i];
            for (let _i96 = 0; _i96 < _a95.length; _i96++) {
              const v_d = _a95[_i96];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g91.push(v_d);
            }
          }
          _c97 = (_g91.length > 0);
        }
        let _c104: boolean = _c97;
        if (_c104) {
          _g98.length = 0;
          G99: {
            const _a102 = sp.adj8[v_i];
            for (let _i103 = 0; _i103 < _a102.length; _i103++) {
              const v_d = _a102[_i103];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g98.push(v_d);
            }
          }
          _c104 = subsetOf(_g98, open(b, sp, v_o));
        }
        let _c111: boolean = _c104;
        if (_c111) {
          _g105.length = 0;
          G106: {
            const _a109 = sp.adj8[v_i];
            for (let _i110 = 0; _i110 < _a109.length; _i110++) {
              const v_d = _a109[_i110];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g105.push(v_d);
            }
          }
          _c111 = (_g105.length < open(b, sp, v_o).length);
        }
        if (!(_c111)) continue;
        const _a112 = within(sp, v_o, 3);
        for (let _i113 = 0; _i113 < _a112.length; _i113++) {
          const v_b = _a112[_i113];
          const _h114 = clueAt(cl.count, v_b);
          if (!((((v_b !== v_o) && (v_b !== v_i)) && (_h114 !== -1)))) continue;
          const v_R = minus(open(b, sp, v_o), open(b, sp, v_i));
          _g115.length = 0;
          G116: {
            const _a119 = sp.adj8[v_b];
            for (let _i120 = 0; _i120 < _a119.length; _i120++) {
              const v_d = _a119[_i120];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g115.push(v_d);
            }
          }
          L121: {
            const v_B = _g115;
            let _q122 = false;
            Q123: {
              const _a124 = v_R;
              for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                const v_d = _a124[_i125];
                if ((v_B.includes(v_d))) {
                  _q122 = true;
                  break Q123;
                }
              }
            }
            if (!(_q122)) break L121;
            const _h130 = minus(v_R, v_B).length;
            const _h132 = minus(v_B, v_R).length;
            const v_r = (need(b, sp, cl, v_o) - need(b, sp, cl, v_i));
            let _g126 = 0;
            G127: {
              const _a128 = sp.adj8[v_b];
              for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                const v_d = _a128[_i129];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g126++;
              }
            }
            const v_nb = (_h114 - _g126);
            L131: {
              const v_heavy = ((v_r - v_nb) >= _h130);
              if (!(((v_heavy || ((v_nb - v_r) >= _h132)) && ((_h130 + _h132) > 0)))) break L131;
              if (b.made[0] !== _m268_0 || b.made[1] !== _m269_1) {
                _g133.length = 0;
                G134: {
                  const _a137 = sp.adj8[v_o];
                  for (let _i138 = 0; _i138 < _a137.length; _i138++) {
                    const v_d = _a137[_i138];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g133.push(v_d);
                  }
                }
                if (!((_g133.length > 0))) { continue R1; }
                let _c145: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                if (_c145) {
                  _g139.length = 0;
                  G140: {
                    const _a143 = sp.adj8[v_i];
                    for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                      const v_d = _a143[_i144];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g139.push(v_d);
                    }
                  }
                  _c145 = (_g139.length > 0);
                }
                let _c158: boolean = _c145;
                if (_c158) {
                  _g146.length = 0;
                  G147: {
                    const _a150 = sp.adj8[v_i];
                    for (let _i151 = 0; _i151 < _a150.length; _i151++) {
                      const v_d = _a150[_i151];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g146.push(v_d);
                    }
                  }
                  _g152.length = 0;
                  G153: {
                    const _a156 = sp.adj8[v_o];
                    for (let _i157 = 0; _i157 < _a156.length; _i157++) {
                      const v_d = _a156[_i157];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g152.push(v_d);
                    }
                  }
                  _c158 = subsetOf(_g146, _g152);
                }
                let _c171: boolean = _c158;
                if (_c171) {
                  _g159.length = 0;
                  G160: {
                    const _a163 = sp.adj8[v_i];
                    for (let _i164 = 0; _i164 < _a163.length; _i164++) {
                      const v_d = _a163[_i164];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g159.push(v_d);
                    }
                  }
                  _g165.length = 0;
                  G166: {
                    const _a169 = sp.adj8[v_o];
                    for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                      const v_d = _a169[_i170];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g165.push(v_d);
                    }
                  }
                  _c171 = (_g159.length < _g165.length);
                }
                if (!(_c171)) { continue R2; }
              }
              if (DEV && staleChecking) {
                const _g172: number[] = [];
                G173: {
                  const _a176 = sp.adj8[v_o];
                  for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                    const v_d = _a176[_i177];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g172.push(v_d);
                  }
                }
                let _c184: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                if (_c184) {
                  const _g178: number[] = [];
                  G179: {
                    const _a182 = sp.adj8[v_i];
                    for (let _i183 = 0; _i183 < _a182.length; _i183++) {
                      const v_d = _a182[_i183];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g178.push(v_d);
                    }
                  }
                  _c184 = (_g178.length > 0);
                }
                let _c197: boolean = _c184;
                if (_c197) {
                  const _g185: number[] = [];
                  G186: {
                    const _a189 = sp.adj8[v_i];
                    for (let _i190 = 0; _i190 < _a189.length; _i190++) {
                      const v_d = _a189[_i190];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g185.push(v_d);
                    }
                  }
                  const _g191: number[] = [];
                  G192: {
                    const _a195 = sp.adj8[v_o];
                    for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                      const v_d = _a195[_i196];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g191.push(v_d);
                    }
                  }
                  _c197 = subsetOf(_g185, _g191);
                }
                let _c210: boolean = _c197;
                if (_c210) {
                  const _g198: number[] = [];
                  G199: {
                    const _a202 = sp.adj8[v_i];
                    for (let _i203 = 0; _i203 < _a202.length; _i203++) {
                      const v_d = _a202[_i203];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g198.push(v_d);
                    }
                  }
                  const _g204: number[] = [];
                  G205: {
                    const _a208 = sp.adj8[v_o];
                    for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                      const v_d = _a208[_i209];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g204.push(v_d);
                    }
                  }
                  _c210 = (_g198.length < _g204.length);
                }
                const _g211: number[] = [];
                G212: {
                  const _a215 = sp.adj8[v_o];
                  for (let _i216 = 0; _i216 < _a215.length; _i216++) {
                    const v_d = _a215[_i216];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g211.push(v_d);
                  }
                }
                const _g217: number[] = [];
                G218: {
                  const _a221 = sp.adj8[v_i];
                  for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                    const v_d = _a221[_i222];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g217.push(v_d);
                  }
                }
                const _g223: number[] = [];
                G224: {
                  const _a227 = sp.adj8[v_b];
                  for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                    const v_d = _a227[_i228];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g223.push(v_d);
                  }
                }
                let _q229 = false;
                Q230: {
                  const _a231 = v_R;
                  for (let _i232 = 0; _i232 < _a231.length; _i232++) {
                    const v_d = _a231[_i232];
                    if ((v_B.includes(v_d))) {
                      _q229 = true;
                      break Q230;
                    }
                  }
                }
                let _g233 = 0;
                G234: {
                  const _a235 = sp.adj8[v_o];
                  for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                    const v_d = _a235[_i236];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g233++;
                  }
                }
                let _g237 = 0;
                G238: {
                  const _a239 = sp.adj8[v_i];
                  for (let _i240 = 0; _i240 < _a239.length; _i240++) {
                    const v_d = _a239[_i240];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g237++;
                  }
                }
                let _g241 = 0;
                G242: {
                  const _a243 = sp.adj8[v_b];
                  for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                    const v_d = _a243[_i244];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g241++;
                  }
                }
                freshBinding("region", [(v_o === cl.count.at[v_k]), (_g172.length > 0), (within(sp, v_o, 2).includes(v_i)), _c210, (within(sp, v_o, 3).includes(v_b)), (((v_b !== v_o) && (v_b !== v_i)) && (clueAt(cl.count, v_b) !== -1)), sameSet(v_R, minus(_g211, _g217)), sameSet(v_B, _g223), _q229, (v_r === ((clueAt(cl.count, v_o) - _g233) - (clueAt(cl.count, v_i) - _g237))), (v_nb === (clueAt(cl.count, v_b) - _g241)), (v_heavy === ((v_r - v_nb) >= minus(v_R, v_B).length)), ((v_heavy || ((v_nb - v_r) >= minus(v_B, v_R).length)) && ((minus(v_R, v_B).length + minus(v_B, v_R).length) > 0))], ["o =", "where of o", "i in", "where of i", "b in", "where of b", "R =", "B =", "where of B", "r =", "nb =", "heavy =", "where of heavy"]);
              }
              facts.length = 0;
              changed = false;
              let _c255: boolean = !(v_heavy);
              if (!_c255) {
                let _c249: boolean = ((v_r - v_nb) === _h130);
                if (_c249) {
                  let _q245 = true;
                  Q246: {
                    const _a247 = minus(v_R, v_B);
                    for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                      const v_d = _a247[_i248];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q245 = false;
                        break Q246;
                      }
                    }
                  }
                  _c249 = _q245;
                }
                let _c254: boolean = _c249;
                if (_c254) {
                  let _q250 = true;
                  Q251: {
                    const _a252 = minus(v_B, v_R);
                    for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                      const v_d = _a252[_i253];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q250 = false;
                        break Q251;
                      }
                    }
                  }
                  _c254 = _q250;
                }
                _c255 = _c254;
              }
              let _c267: boolean = _c255;
              if (_c267) {
                let _c266: boolean = v_heavy;
                if (!_c266) {
                  let _c260: boolean = ((v_nb - v_r) === _h132);
                  if (_c260) {
                    let _q256 = true;
                    Q257: {
                      const _a258 = minus(v_B, v_R);
                      for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                        const v_d = _a258[_i259];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                        if (!(true)) {
                          _q256 = false;
                          break Q257;
                        }
                      }
                    }
                    _c260 = _q256;
                  }
                  let _c265: boolean = _c260;
                  if (_c265) {
                    let _q261 = true;
                    Q262: {
                      const _a263 = minus(v_R, v_B);
                      for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                        const v_d = _a263[_i264];
                        if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                        if (!(true)) {
                          _q261 = false;
                          break Q262;
                        }
                      }
                    }
                    _c265 = _q261;
                  }
                  _c266 = _c265;
                }
                _c267 = _c266;
              }
              if (!(_c267)) return -1;
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
  const _g134: number[] = [];
  const _g143: number[] = [];
  const _g150: number[] = [];
  const _g157: number[] = [];
  const _g164: number[] = [];
  const _g177: number[] = [];
  const _g187: number[] = [];
  const _g194: number[] = [];
  const _g201: number[] = [];
  const _g208: number[] = [];
  const _g226: number[] = [];
  const _g232: number[] = [];
  const _g239: number[] = [];
  const _g245: number[] = [];
  const _g252: number[] = [];
  const _g258: number[] = [];
  const _g265: number[] = [];
  const _g271: number[] = [];
  const _g285: number[] = [];
  const facts = regionsFacts;
  let fired = 0;
  let changed = false;
  R1:
  for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
    L133: {
      const v_o = cl.count.at[v_k];
      const _m425_0 = b.made[0];
      _g134.length = 0;
      G135: {
        const _a138 = sp.adj8[v_o];
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_d = _a138[_i139];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g134.push(v_d);
        }
      }
      if (!((_g134.length > 0))) break L133;
      const _a140 = within(sp, v_o, 2);
      R2:
      for (let _i141 = 0; _i141 < _a140.length; _i141++) {
        const v_i = _a140[_i141];
        const _m426_1 = b.made[1];
        const _h142 = clueAt(cl.count, v_i);
        let _c149: boolean = ((v_i !== v_o) && (_h142 !== -1));
        if (_c149) {
          _g143.length = 0;
          G144: {
            const _a147 = sp.adj8[v_i];
            for (let _i148 = 0; _i148 < _a147.length; _i148++) {
              const v_d = _a147[_i148];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g143.push(v_d);
            }
          }
          _c149 = (_g143.length > 0);
        }
        let _c156: boolean = _c149;
        if (_c156) {
          _g150.length = 0;
          G151: {
            const _a154 = sp.adj8[v_i];
            for (let _i155 = 0; _i155 < _a154.length; _i155++) {
              const v_d = _a154[_i155];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g150.push(v_d);
            }
          }
          _c156 = subsetOf(_g150, open(b, sp, v_o));
        }
        let _c163: boolean = _c156;
        if (_c163) {
          _g157.length = 0;
          G158: {
            const _a161 = sp.adj8[v_i];
            for (let _i162 = 0; _i162 < _a161.length; _i162++) {
              const v_d = _a161[_i162];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              _g157.push(v_d);
            }
          }
          _c163 = (_g157.length < open(b, sp, v_o).length);
        }
        if (!(_c163)) continue;
        _g164.length = 0;
        G165: {
          const _a168 = sp.adj8[v_i];
          for (let _i169 = 0; _i169 < _a168.length; _i169++) {
            const v_d = _a168[_i169];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g164.push(v_d);
          }
        }
        const v_R = minus(open(b, sp, v_o), _g164);
        let _g170 = 0;
        G171: {
          const _a172 = sp.adj8[v_i];
          for (let _i173 = 0; _i173 < _a172.length; _i173++) {
            const v_d = _a172[_i173];
            if (!(((b.grid[v_d] || -1) === 1))) continue;
            _g170++;
          }
        }
        const v_r = (need(b, sp, cl, v_o) - (_h142 - _g170));
        const _a174 = within(sp, v_o, 2);
        R3:
        for (let _i175 = 0; _i175 < _a174.length; _i175++) {
          const v_p = _a174[_i175];
          const _h176 = clueAt(cl.count, v_p);
          let _c183: boolean = ((v_p !== v_o) && (_h176 !== -1));
          if (_c183) {
            _g177.length = 0;
            G178: {
              const _a181 = sp.adj8[v_p];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_d = _a181[_i182];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g177.push(v_d);
              }
            }
            _c183 = (_g177.length > 0);
          }
          if (!(_c183)) continue;
          const _a184 = within(sp, v_p, 2);
          for (let _i185 = 0; _i185 < _a184.length; _i185++) {
            const v_q = _a184[_i185];
            const _h186 = clueAt(cl.count, v_q);
            let _c193: boolean = ((v_q !== v_p) && (_h186 !== -1));
            if (_c193) {
              _g187.length = 0;
              G188: {
                const _a191 = sp.adj8[v_q];
                for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                  const v_d = _a191[_i192];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g187.push(v_d);
                }
              }
              _c193 = (_g187.length > 0);
            }
            let _c200: boolean = _c193;
            if (_c200) {
              _g194.length = 0;
              G195: {
                const _a198 = sp.adj8[v_q];
                for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                  const v_d = _a198[_i199];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g194.push(v_d);
                }
              }
              _c200 = subsetOf(_g194, open(b, sp, v_p));
            }
            let _c207: boolean = _c200;
            if (_c207) {
              _g201.length = 0;
              G202: {
                const _a205 = sp.adj8[v_q];
                for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                  const v_d = _a205[_i206];
                  if (!(!((b.grid[v_d] !== 0)))) continue;
                  _g201.push(v_d);
                }
              }
              _c207 = (_g201.length < open(b, sp, v_p).length);
            }
            if (!(_c207)) continue;
            _g208.length = 0;
            G209: {
              const _a212 = sp.adj8[v_q];
              for (let _i213 = 0; _i213 < _a212.length; _i213++) {
                const v_d = _a212[_i213];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g208.push(v_d);
              }
            }
            L214: {
              const v_S = minus(open(b, sp, v_p), _g208);
              let _q215 = false;
              Q216: {
                const _a217 = v_R;
                for (let _i218 = 0; _i218 < _a217.length; _i218++) {
                  const v_d = _a217[_i218];
                  if ((v_S.includes(v_d))) {
                    _q215 = true;
                    break Q216;
                  }
                }
              }
              if (!(_q215)) break L214;
              const _h224 = minus(v_R, v_S).length;
              const _h225 = minus(v_S, v_R).length;
              let _g219 = 0;
              G220: {
                const _a221 = sp.adj8[v_q];
                for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                  const v_d = _a221[_i222];
                  if (!(((b.grid[v_d] || -1) === 1))) continue;
                  _g219++;
                }
              }
              L223: {
                const v_by = (v_r - (need(b, sp, cl, v_p) - (_h186 - _g219)));
                if (!(((v_by >= _h224) && ((_h224 + _h225) > 0)))) break L223;
                if (b.made[0] !== _m425_0 || b.made[1] !== _m426_1) {
                  _g226.length = 0;
                  G227: {
                    const _a230 = sp.adj8[v_o];
                    for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                      const v_d = _a230[_i231];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g226.push(v_d);
                    }
                  }
                  if (!((_g226.length > 0))) { continue R1; }
                  let _c238: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                  if (_c238) {
                    _g232.length = 0;
                    G233: {
                      const _a236 = sp.adj8[v_i];
                      for (let _i237 = 0; _i237 < _a236.length; _i237++) {
                        const v_d = _a236[_i237];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g232.push(v_d);
                      }
                    }
                    _c238 = (_g232.length > 0);
                  }
                  let _c251: boolean = _c238;
                  if (_c251) {
                    _g239.length = 0;
                    G240: {
                      const _a243 = sp.adj8[v_i];
                      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                        const v_d = _a243[_i244];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g239.push(v_d);
                      }
                    }
                    _g245.length = 0;
                    G246: {
                      const _a249 = sp.adj8[v_o];
                      for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                        const v_d = _a249[_i250];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g245.push(v_d);
                      }
                    }
                    _c251 = subsetOf(_g239, _g245);
                  }
                  let _c264: boolean = _c251;
                  if (_c264) {
                    _g252.length = 0;
                    G253: {
                      const _a256 = sp.adj8[v_i];
                      for (let _i257 = 0; _i257 < _a256.length; _i257++) {
                        const v_d = _a256[_i257];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g252.push(v_d);
                      }
                    }
                    _g258.length = 0;
                    G259: {
                      const _a262 = sp.adj8[v_o];
                      for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                        const v_d = _a262[_i263];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g258.push(v_d);
                      }
                    }
                    _c264 = (_g252.length < _g258.length);
                  }
                  if (!(_c264)) { continue R2; }
                  _g265.length = 0;
                  G266: {
                    const _a269 = sp.adj8[v_o];
                    for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                      const v_d = _a269[_i270];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g265.push(v_d);
                    }
                  }
                  _g271.length = 0;
                  G272: {
                    const _a275 = sp.adj8[v_i];
                    for (let _i276 = 0; _i276 < _a275.length; _i276++) {
                      const v_d = _a275[_i276];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g271.push(v_d);
                    }
                  }
                  if (!(sameSet(v_R, minus(_g265, _g271)))) { continue R2; }
                  let _g277 = 0;
                  G278: {
                    const _a279 = sp.adj8[v_o];
                    for (let _i280 = 0; _i280 < _a279.length; _i280++) {
                      const v_d = _a279[_i280];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g277++;
                    }
                  }
                  let _g281 = 0;
                  G282: {
                    const _a283 = sp.adj8[v_i];
                    for (let _i284 = 0; _i284 < _a283.length; _i284++) {
                      const v_d = _a283[_i284];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g281++;
                    }
                  }
                  if (!((v_r === ((clueAt(cl.count, v_o) - _g277) - (clueAt(cl.count, v_i) - _g281))))) { continue R2; }
                  let _c291: boolean = ((v_p !== v_o) && (clueAt(cl.count, v_p) !== -1));
                  if (_c291) {
                    _g285.length = 0;
                    G286: {
                      const _a289 = sp.adj8[v_p];
                      for (let _i290 = 0; _i290 < _a289.length; _i290++) {
                        const v_d = _a289[_i290];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g285.push(v_d);
                      }
                    }
                    _c291 = (_g285.length > 0);
                  }
                  if (!(_c291)) { continue R3; }
                }
                if (DEV && staleChecking) {
                  const _g292: number[] = [];
                  G293: {
                    const _a296 = sp.adj8[v_o];
                    for (let _i297 = 0; _i297 < _a296.length; _i297++) {
                      const v_d = _a296[_i297];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g292.push(v_d);
                    }
                  }
                  let _c304: boolean = ((v_i !== v_o) && (clueAt(cl.count, v_i) !== -1));
                  if (_c304) {
                    const _g298: number[] = [];
                    G299: {
                      const _a302 = sp.adj8[v_i];
                      for (let _i303 = 0; _i303 < _a302.length; _i303++) {
                        const v_d = _a302[_i303];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g298.push(v_d);
                      }
                    }
                    _c304 = (_g298.length > 0);
                  }
                  let _c317: boolean = _c304;
                  if (_c317) {
                    const _g305: number[] = [];
                    G306: {
                      const _a309 = sp.adj8[v_i];
                      for (let _i310 = 0; _i310 < _a309.length; _i310++) {
                        const v_d = _a309[_i310];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g305.push(v_d);
                      }
                    }
                    const _g311: number[] = [];
                    G312: {
                      const _a315 = sp.adj8[v_o];
                      for (let _i316 = 0; _i316 < _a315.length; _i316++) {
                        const v_d = _a315[_i316];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g311.push(v_d);
                      }
                    }
                    _c317 = subsetOf(_g305, _g311);
                  }
                  let _c330: boolean = _c317;
                  if (_c330) {
                    const _g318: number[] = [];
                    G319: {
                      const _a322 = sp.adj8[v_i];
                      for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                        const v_d = _a322[_i323];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g318.push(v_d);
                      }
                    }
                    const _g324: number[] = [];
                    G325: {
                      const _a328 = sp.adj8[v_o];
                      for (let _i329 = 0; _i329 < _a328.length; _i329++) {
                        const v_d = _a328[_i329];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g324.push(v_d);
                      }
                    }
                    _c330 = (_g318.length < _g324.length);
                  }
                  const _g331: number[] = [];
                  G332: {
                    const _a335 = sp.adj8[v_o];
                    for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                      const v_d = _a335[_i336];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g331.push(v_d);
                    }
                  }
                  const _g337: number[] = [];
                  G338: {
                    const _a341 = sp.adj8[v_i];
                    for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                      const v_d = _a341[_i342];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g337.push(v_d);
                    }
                  }
                  let _g343 = 0;
                  G344: {
                    const _a345 = sp.adj8[v_o];
                    for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                      const v_d = _a345[_i346];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g343++;
                    }
                  }
                  let _g347 = 0;
                  G348: {
                    const _a349 = sp.adj8[v_i];
                    for (let _i350 = 0; _i350 < _a349.length; _i350++) {
                      const v_d = _a349[_i350];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g347++;
                    }
                  }
                  let _c357: boolean = ((v_p !== v_o) && (clueAt(cl.count, v_p) !== -1));
                  if (_c357) {
                    const _g351: number[] = [];
                    G352: {
                      const _a355 = sp.adj8[v_p];
                      for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                        const v_d = _a355[_i356];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g351.push(v_d);
                      }
                    }
                    _c357 = (_g351.length > 0);
                  }
                  let _c364: boolean = ((v_q !== v_p) && (clueAt(cl.count, v_q) !== -1));
                  if (_c364) {
                    const _g358: number[] = [];
                    G359: {
                      const _a362 = sp.adj8[v_q];
                      for (let _i363 = 0; _i363 < _a362.length; _i363++) {
                        const v_d = _a362[_i363];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g358.push(v_d);
                      }
                    }
                    _c364 = (_g358.length > 0);
                  }
                  let _c377: boolean = _c364;
                  if (_c377) {
                    const _g365: number[] = [];
                    G366: {
                      const _a369 = sp.adj8[v_q];
                      for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                        const v_d = _a369[_i370];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g365.push(v_d);
                      }
                    }
                    const _g371: number[] = [];
                    G372: {
                      const _a375 = sp.adj8[v_p];
                      for (let _i376 = 0; _i376 < _a375.length; _i376++) {
                        const v_d = _a375[_i376];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g371.push(v_d);
                      }
                    }
                    _c377 = subsetOf(_g365, _g371);
                  }
                  let _c390: boolean = _c377;
                  if (_c390) {
                    const _g378: number[] = [];
                    G379: {
                      const _a382 = sp.adj8[v_q];
                      for (let _i383 = 0; _i383 < _a382.length; _i383++) {
                        const v_d = _a382[_i383];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g378.push(v_d);
                      }
                    }
                    const _g384: number[] = [];
                    G385: {
                      const _a388 = sp.adj8[v_p];
                      for (let _i389 = 0; _i389 < _a388.length; _i389++) {
                        const v_d = _a388[_i389];
                        if (!(!((b.grid[v_d] !== 0)))) continue;
                        _g384.push(v_d);
                      }
                    }
                    _c390 = (_g378.length < _g384.length);
                  }
                  const _g391: number[] = [];
                  G392: {
                    const _a395 = sp.adj8[v_p];
                    for (let _i396 = 0; _i396 < _a395.length; _i396++) {
                      const v_d = _a395[_i396];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g391.push(v_d);
                    }
                  }
                  const _g397: number[] = [];
                  G398: {
                    const _a401 = sp.adj8[v_q];
                    for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                      const v_d = _a401[_i402];
                      if (!(!((b.grid[v_d] !== 0)))) continue;
                      _g397.push(v_d);
                    }
                  }
                  let _q403 = false;
                  Q404: {
                    const _a405 = v_R;
                    for (let _i406 = 0; _i406 < _a405.length; _i406++) {
                      const v_d = _a405[_i406];
                      if ((v_S.includes(v_d))) {
                        _q403 = true;
                        break Q404;
                      }
                    }
                  }
                  let _g407 = 0;
                  G408: {
                    const _a409 = sp.adj8[v_p];
                    for (let _i410 = 0; _i410 < _a409.length; _i410++) {
                      const v_d = _a409[_i410];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g407++;
                    }
                  }
                  let _g411 = 0;
                  G412: {
                    const _a413 = sp.adj8[v_q];
                    for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                      const v_d = _a413[_i414];
                      if (!(((b.grid[v_d] || -1) === 1))) continue;
                      _g411++;
                    }
                  }
                  freshBinding("regions", [(v_o === cl.count.at[v_k]), (_g292.length > 0), (within(sp, v_o, 2).includes(v_i)), _c330, sameSet(v_R, minus(_g331, _g337)), (v_r === ((clueAt(cl.count, v_o) - _g343) - (clueAt(cl.count, v_i) - _g347))), (within(sp, v_o, 2).includes(v_p)), _c357, (within(sp, v_p, 2).includes(v_q)), _c390, sameSet(v_S, minus(_g391, _g397)), _q403, (v_by === (v_r - ((clueAt(cl.count, v_p) - _g407) - (clueAt(cl.count, v_q) - _g411)))), ((v_by >= minus(v_R, v_S).length) && ((minus(v_R, v_S).length + minus(v_S, v_R).length) > 0))], ["o =", "where of o", "i in", "where of i", "R =", "r =", "p in", "where of p", "q in", "where of q", "S =", "where of S", "by =", "where of by"]);
                }
                facts.length = 0;
                changed = false;
                let _c419: boolean = (v_by === _h224);
                if (_c419) {
                  let _q415 = true;
                  Q416: {
                    const _a417 = minus(v_R, v_S);
                    for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                      const v_d = _a417[_i418];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                      if (!(true)) {
                        _q415 = false;
                        break Q416;
                      }
                    }
                  }
                  _c419 = _q415;
                }
                let _c424: boolean = _c419;
                if (_c424) {
                  let _q420 = true;
                  Q421: {
                    const _a422 = minus(v_S, v_R);
                    for (let _i423 = 0; _i423 < _a422.length; _i423++) {
                      const v_d = _a422[_i423];
                      if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                      if (!(true)) {
                        _q420 = false;
                        break Q421;
                      }
                    }
                  }
                  _c424 = _q420;
                }
                if (!(_c424)) return -1;
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
const count_st125 = stamps();

/** Its dearest read grows with the board as n. */
export function count(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountBinding> | null): number {
  const _g67: number[] = [];
  const _g91: number[] = [];
  const _g112: number[] = [];
  const _g129: number[] = [];
  const _g140: number[] = [];
  const _g224: number[] = [];
  const _g237: number[] = [];
  const _g246: number[] = [];
  const facts = countFacts;
  let fired = 0;
  let changed = false;
  if (countCands.length < sp.cells.length) countCands = new Int32Array(sp.cells.length);
  const cands = countCands;
  cands.fill(-1);
  meetMarkedKept.clear();
  const _m256_0 = b.made[0];
  _g67.length = 0;
  G68: {
    for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
      let _q73 = false;
      Q74: {
        const _a75 = sp.adj8[cl.count.at[v_k]];
        for (let _i76 = 0; _i76 < _a75.length; _i76++) {
          const v_d = _a75[_i76];
          if (!((b.grid[v_d] !== 0))) {
            _q73 = true;
            break Q74;
          }
        }
      }
      if (!(_q73)) continue;
      _g67.push(v_k);
    }
  }
  L77: {
    const v_C = _g67;
    const _h78 = v_C.length;
    if (!((_h78 <= 10))) break L77;
    const _m257_1 = b.made[1];
    let _g79 = 0;
    G80: {
      const _a81 = cellsValued(b, sp.cells, 1);
      for (let _i82 = 0; _i82 < _a81.length; _i82++) {
        const v_c = _a81[_i82];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g79++;
      }
    }
    const v_L = (cl.mines - _g79);
    let _g83 = 0;
    G84: {
      const _a85 = sp.cells;
      for (let _i86 = 0; _i86 < _a85.length; _i86++) {
        const v_c = _a85[_i86];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g83++;
      }
    }
    const v_u = _g83;
    for (let v_size = 0; v_size <= 5; v_size++) {
      const _e87 = v_C;
      const _n90 = 1 << _e87.length;
      for (let _k88 = v_size > _e87.length ? _n90 : (1 << v_size) - 1; _k88 < _n90; _k88 = v_size === 0 ? _n90 : nextOfSize(_k88)) {
        const v_T = _g91;
        v_T.length = 0;
        for (let _j89 = 0; _j89 < _e87.length; _j89++) if ((_k88 >> (_e87.length - 1 - _j89)) & 1) v_T.push(_e87[_j89]);
        const _h92 = v_T.length;
        let _c101: boolean = (_h92 === v_size);
        if (_c101) {
          let _q93 = true;
          Q94: {
            const _a95 = v_T;
            for (let _i96 = 0; _i96 < _a95.length; _i96++) {
              const v_x = _a95[_i96];
              const _h99 = cl.count.at[v_x];
              const _a97 = v_T;
              for (let _i98 = 0; _i98 < _a97.length; _i98++) {
                const v_y = _a97[_i98];
                if (!((v_x !== v_y))) continue;
                const _t100 = cl.count.at[v_y];
                if (!(!(meetMarked(b, sp, cands, _h99, _t100)))) {
                  _q93 = false;
                  break Q94;
                }
              }
            }
          }
          _c101 = _q93;
        }
        if (!(_c101)) continue;
        let _g102 = 0;
        G103: {
          const _a104 = v_T;
          for (let _i105 = 0; _i105 < _a104.length; _i105++) {
            const v_x = _a104[_i105];
            const _t106 = cl.count.at[v_x];
            const _h107 = clueAt(cl.count, _t106);
            let _g108 = 0;
            G109: {
              const _a110 = sp.adj8[_t106];
              for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                const v_d = _a110[_i111];
                if (!(((b.grid[v_d] || -1) === 1))) continue;
                _g108++;
              }
            }
            _g102 += (_h107 - _g108);
          }
        }
        const v_n = _g102;
        _g112.length = 0;
        count_st125.pass++;
        G113: {
          const _a126 = v_T;
          for (let _i127 = 0; _i127 < _a126.length; _i127++) {
            const v_x = _a126[_i127];
            const _t128 = cl.count.at[v_x];
            _g129.length = 0;
            G130: {
              const _a133 = sp.adj8[_t128];
              for (let _i134 = 0; _i134 < _a133.length; _i134++) {
                const v_d = _a133[_i134];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                _g129.push(v_d);
              }
            }
            const _a135 = _g129;
            for (let _i136 = 0; _i136 < _a135.length; _i136++) {
              const v_d = _a135[_i136];
              const _t137 = v_d;
              if (_g112.length < 16) { if (!_g112.includes(_t137)) _g112.push(_t137); } else addOnce(_g112, count_st125, _t137);
            }
          }
        }
        L138: {
          const v_X = _g112;
          const _h139 = v_X.length;
          if (!(((v_u > _h139) && ((v_n === v_L) || ((v_L - v_n) === (v_u - _h139)))))) break L138;
          if (b.made[0] !== _m256_0 || b.made[1] !== _m257_1) {
            _g140.length = 0;
            G141: {
              for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
                let _q146 = false;
                Q147: {
                  const _a148 = sp.adj8[cl.count.at[v_k]];
                  for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                    const v_d = _a148[_i149];
                    if (!((b.grid[v_d] !== 0))) {
                      _q146 = true;
                      break Q147;
                    }
                  }
                }
                if (!(_q146)) continue;
                _g140.push(v_k);
              }
            }
            if (!(sameSet(v_C, _g140))) { return fired; }
            let _g150 = 0;
            G151: {
              const _a152 = cellsValued(b, sp.cells, 1);
              for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                const v_c = _a152[_i153];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g150++;
              }
            }
            if (!((v_L === (cl.mines - _g150)))) { return fired; }
            let _g154 = 0;
            G155: {
              const _a156 = sp.cells;
              for (let _i157 = 0; _i157 < _a156.length; _i157++) {
                const v_c = _a156[_i157];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g154++;
              }
            }
            if (!((v_u === _g154))) { return fired; }
          }
          if (DEV && staleChecking) {
            const _g158: number[] = [];
            G159: {
              for (let v_k = 0; v_k < cl.count.at.length; v_k++) {
                let _q164 = false;
                Q165: {
                  const _a166 = sp.adj8[cl.count.at[v_k]];
                  for (let _i167 = 0; _i167 < _a166.length; _i167++) {
                    const v_d = _a166[_i167];
                    if (!((b.grid[v_d] !== 0))) {
                      _q164 = true;
                      break Q165;
                    }
                  }
                }
                if (!(_q164)) continue;
                _g158.push(v_k);
              }
            }
            let _g168 = 0;
            G169: {
              const _a170 = cellsValued(b, sp.cells, 1);
              for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                const v_c = _a170[_i171];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g168++;
              }
            }
            let _g172 = 0;
            G173: {
              const _a174 = sp.cells;
              for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                const v_c = _a174[_i175];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g172++;
              }
            }
            let _c184: boolean = (v_T.length === v_size);
            if (_c184) {
              let _q176 = true;
              Q177: {
                const _a178 = v_T;
                for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                  const v_x = _a178[_i179];
                  const _a180 = v_T;
                  for (let _i181 = 0; _i181 < _a180.length; _i181++) {
                    const v_y = _a180[_i181];
                    if (!((v_x !== v_y))) continue;
                    const _t182 = cl.count.at[v_x];
                    const _t183 = cl.count.at[v_y];
                    if (!(!(meetMarked(b, sp, cands, _t182, _t183)))) {
                      _q176 = false;
                      break Q177;
                    }
                  }
                }
              }
              _c184 = _q176;
            }
            let _g185 = 0;
            G186: {
              const _a187 = v_T;
              for (let _i188 = 0; _i188 < _a187.length; _i188++) {
                const v_x = _a187[_i188];
                const _t189 = cl.count.at[v_x];
                let _g190 = 0;
                G191: {
                  const _a192 = sp.adj8[_t189];
                  for (let _i193 = 0; _i193 < _a192.length; _i193++) {
                    const v_d = _a192[_i193];
                    if (!(((b.grid[v_d] || -1) === 1))) continue;
                    _g190++;
                  }
                }
                _g185 += (clueAt(cl.count, _t189) - _g190);
              }
            }
            const _g194: number[] = [];
            G195: {
              const _a207 = v_T;
              for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                const v_x = _a207[_i208];
                const _t209 = cl.count.at[v_x];
                const _g210: number[] = [];
                G211: {
                  const _a214 = sp.adj8[_t209];
                  for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                    const v_d = _a214[_i215];
                    if (!(!((b.grid[v_d] !== 0)))) continue;
                    _g210.push(v_d);
                  }
                }
                const _a216 = _g210;
                for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                  const v_d = _a216[_i217];
                  if (!_g194.includes(v_d)) _g194.push(v_d);
                }
              }
            }
            freshBinding("count", [sameSet(v_C, _g158), (v_C.length <= 10), (v_L === (cl.mines - _g168)), (v_u === _g172), ((0 <= v_size) && (v_size <= 5)), _c184, (v_n === _g185), sameSet(v_X, _g194), ((v_u > v_X.length) && ((v_n === v_L) || ((v_L - v_n) === (v_u - v_X.length))))], ["C =", "where of C", "L =", "u =", "size in", "where of T", "n =", "X =", "where of X"]);
          }
          facts.length = 0;
          changed = false;
          let _g218 = 0;
          G219: {
            const _a220 = cellsValued(b, sp.cells, 1);
            for (let _i221 = 0; _i221 < _a220.length; _i221++) {
              const v_c = _a220[_i221];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g218++;
            }
          }
          let _c232: boolean = !((v_n === (cl.mines - _g218)));
          if (!_c232) {
            let _q222 = true;
            Q223: {
              _g224.length = 0;
              G225: {
                const _a228 = sp.cells;
                for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                  const v_c = _a228[_i229];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g224.push(v_c);
                }
              }
              const _a230 = _g224;
              for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                const v_d = _a230[_i231];
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q222 = false;
                  break Q223;
                }
              }
            }
            _c232 = _q222;
          }
          let _c255: boolean = _c232;
          if (_c255) {
            let _g233 = 0;
            G234: {
              const _a235 = cellsValued(b, sp.cells, 1);
              for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                const v_c = _a235[_i236];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g233++;
              }
            }
            let _c243: boolean = (v_n !== (cl.mines - _g233));
            if (_c243) {
              _g237.length = 0;
              G238: {
                const _a241 = sp.cells;
                for (let _i242 = 0; _i242 < _a241.length; _i242++) {
                  const v_c = _a241[_i242];
                  if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                  _g237.push(v_c);
                }
              }
              _c243 = (((cl.mines - _g233) - v_n) === _g237.length);
            }
            let _c254: boolean = !(_c243);
            if (!_c254) {
              let _q244 = true;
              Q245: {
                _g246.length = 0;
                G247: {
                  const _a250 = sp.cells;
                  for (let _i251 = 0; _i251 < _a250.length; _i251++) {
                    const v_c = _a250[_i251];
                    if (!((!((b.grid[v_c] !== 0)) && !(v_X.includes(v_c))))) continue;
                    _g246.push(v_c);
                  }
                }
                const _a252 = _g246;
                for (let _i253 = 0; _i253 < _a252.length; _i253++) {
                  const v_d = _a252[_i253];
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 1); changed = true; } else facts.push(PLACE, v_d, 1); }
                  if (!(true)) {
                    _q244 = false;
                    break Q245;
                  }
                }
              }
              _c254 = _q244;
            }
            _c255 = _c254;
          }
          if (!(_c255)) return -1;
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
  let _c23: boolean = ((Math.abs(((v_a % sp.w) - (v_b % sp.w))) <= 2) && (Math.abs((((v_a / sp.w) | 0) - ((v_b / sp.w) | 0))) <= 2));
  if (_c23) {
    let _q7 = false;
    Q8: {
      const _g9: number[] = [];
      G10: {
        const _a13 = sp.adj8[v_a];
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_d = _a13[_i14];
          if (!(!((b.grid[v_d] !== 0)))) continue;
          _g9.push(v_d);
        }
      }
      const _a15 = _g9;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_d = _a15[_i16];
        const _g17: number[] = [];
        G18: {
          const _a21 = sp.adj8[v_b];
          for (let _i22 = 0; _i22 < _a21.length; _i22++) {
            const v_d = _a21[_i22];
            if (!(!((b.grid[v_d] !== 0)))) continue;
            _g17.push(v_d);
          }
        }
        if ((_g17.includes(v_d))) {
          _q7 = true;
          break Q8;
        }
      }
    }
    _c23 = _q7;
  }
  const _made = _c23;
  meetMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const needKept = keptStore<number>();

/** `need(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function need(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = needKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj8[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_d = _a3[_i4];
      if (!(((b.grid[v_d] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = (clueAt(cl.count, v_c) - _g1);
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.adj8[v_c];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_d = _a5[_i6];
      if (!(!((b.grid[v_d] !== 0)))) continue;
      _g1.push(v_d);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
