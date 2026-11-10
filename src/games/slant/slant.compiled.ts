// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, before, clueAt, edgeGroups, freshBinding, keptStore, linkedSum, linkedWith, pointGroups, rangeMask, sameSet, slash, staleChecking, through, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  n: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "clue" | "loop" | "pair" | "share" | "deadEnd" | "same" | "one" | "three" | "two";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "drawn";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "drawn" },
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
  { id: "clue", tier: 0 },
  { id: "loop", tier: 0 },
  { id: "pair", tier: 1 },
  { id: "share", tier: 1 },
  { id: "deadEnd", tier: 1 },
  { id: "same", tier: 1 },
  { id: "one", tier: 1 },
  { id: "three", tier: 1 },
  { id: "two", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _links = pointGroups(sp, (_x7: number) => (g[_x7] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.points;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_k = _a3[_i4];
      let _q5 = false;
      Q6: {
        const _a8 = _links.of(v_k);
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_q = _a8[_i9];
          if ((sp.pointCells[v_q].length < 4)) {
            _q5 = true;
            break Q6;
          }
        }
      }
      if (!(_q5)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k10 = 0; _k10 < cl.n.at.length; _k10++) {
    const _at11 = cl.n.at[_k10];
    const _v12 = cl.n.v[_k10];
    let _g13 = 0;
    G14: {
      const _a15 = sp.pointCells[_at11];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_c = _a15[_i16];
        const _h17 = (g[v_c] || -1);
        if (!((_h17 === slash(sp, v_c, _at11)))) continue;
        _g13++;
      }
    }
    if (!((_g13 === _v12))) return false;
  }
  return true;
}

export interface ClueBinding {
  k: number;
  O: readonly number[];
  left: number;
}

const clueFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBinding> | null): number {
  const _g16: number[] = [];
  const facts = clueFacts;
  let fired = 0;
  let changed = false;
  const _a13 = sp.points;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_k = _a13[_i14];
    const _h15 = clueAt(cl.n, v_k);
    if (!((_h15 >= 0))) continue;
    _g16.length = 0;
    G17: {
      const _a20 = sp.pointCells[v_k];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g16.push(v_c);
      }
    }
    const v_O = _g16;
    const _h36 = v_O.length;
    let _g22 = 0;
    G23: {
      const _a24 = sp.pointCells[v_k];
      for (let _i25 = 0; _i25 < _a24.length; _i25++) {
        const v_c = _a24[_i25];
        if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
        _g22++;
      }
    }
    const v_left = (_h15 - _g22);
    if (import.meta.env.DEV && staleChecking) {
      const _g26: number[] = [];
      G27: {
        const _a30 = sp.pointCells[v_k];
        for (let _i31 = 0; _i31 < _a30.length; _i31++) {
          const v_c = _a30[_i31];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g26.push(v_c);
        }
      }
      let _g32 = 0;
      G33: {
        const _a34 = sp.pointCells[v_k];
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_c = _a34[_i35];
          if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
          _g32++;
        }
      }
      freshBinding("clue", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_O, _g26), (v_left === (clueAt(cl.n, v_k) - _g32))], ["k in", "where of k", "O =", "left ="]);
    }
    facts.length = 0;
    changed = false;
    let _c43: boolean = ((v_left >= 0) && (v_left <= _h36));
    if (_c43) {
      let _c42: boolean = !((v_left === 0));
      if (!_c42) {
        let _q37 = true;
        Q38: {
          const _a39 = v_O;
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            const _t41 = (3 - slash(sp, v_c, v_k));
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t41); changed = true; } else facts.push(PLACE, v_c, _t41); }
            if (!(true)) {
              _q37 = false;
              break Q38;
            }
          }
        }
        _c42 = _q37;
      }
      _c43 = _c42;
    }
    let _c50: boolean = _c43;
    if (_c50) {
      let _c49: boolean = !((v_left === _h36));
      if (!_c49) {
        let _q44 = true;
        Q45: {
          const _a46 = v_O;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_c = _a46[_i47];
            const _t48 = slash(sp, v_c, v_k);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t48); changed = true; } else facts.push(PLACE, v_c, _t48); }
            if (!(true)) {
              _q44 = false;
              break Q45;
            }
          }
        }
        _c49 = _q44;
      }
      _c50 = _c49;
    }
    if (!(_c50)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, O: v_O.slice(), left: v_left }, facts)) return 1;
    }
  }
  return fired;
}

export interface LoopBinding {
  c: number;
  d: number;
}

const loopFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function loop(b: Marks, sp: GridSpace, fire: Fire<LoopBinding> | null): number {
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  const _a10 = sp.cells;
  R1:
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    const _m36_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _q12 = false;
      Q13: {
        const _a14 = sp.cellPoints[v_c];
        for (let _i15 = 0; _i15 < _a14.length; _i15++) {
          const v_k = _a14[_i15];
          if (!((slash(sp, v_c, v_k) === v_d))) continue;
          const _a16 = sp.cellPoints[v_c];
          const _n17 = _i15;
          for (let _i18 = 0; _i18 < _n17; _i18++) {
            const v_q = _a16[_i18];
            if (!((slash(sp, v_c, v_q) === v_d))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q12 = true;
              break Q13;
            }
          }
        }
      }
      if (!(_q12)) continue;
      if (b.made[0] !== _m36_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _q19 = false;
        Q20: {
          const _a21 = sp.cellPoints[v_c];
          for (let _i22 = 0; _i22 < _a21.length; _i22++) {
            const v_k = _a21[_i22];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a23 = sp.cellPoints[v_c];
            const _n24 = _i22;
            for (let _i25 = 0; _i25 < _n24; _i25++) {
              const v_q = _a23[_i25];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              if (linkedWith(sp, b, v_q, v_k)) {
                _q19 = true;
                break Q20;
              }
            }
          }
        }
        freshBinding("loop", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), ((1 <= v_d) && (v_d <= 2)), _q19], ["c in", "where of c", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      const _t26 = (3 - v_d);
      let _q27 = false;
      Q28: {
        const _a29 = sp.cellPoints[v_c];
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_k = _a29[_i30];
          if (!((slash(sp, v_c, v_k) === _t26))) continue;
          const _a31 = sp.cellPoints[v_c];
          const _n32 = _i30;
          for (let _i33 = 0; _i33 < _n32; _i33++) {
            const v_q = _a31[_i33];
            if (!((slash(sp, v_c, v_q) === _t26))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q27 = true;
              break Q28;
            }
          }
        }
      }
      let _c35: boolean = !(_q27);
      if (_c35) {
        const _t34 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t34); changed = true; } else facts.push(PLACE, v_c, _t34); }
        _c35 = true;
      }
      if (!(_c35)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBinding {
  A: readonly number[];
  k: number;
  P: readonly number[];
  a: number;
  b: number;
  O: readonly number[];
  left: number;
}

const pairFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g43: number[] = [];
  const _g53: number[] = [];
  const _g67: number[] = [];
  const _g79: number[] = [];
  const _g85: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _h49 = ((1 << 3));
  const _m141_2 = b.made[2];
  _g43.length = 0;
  G44: {
    const _a47 = sp.edges;
    for (let _i48 = 0; _i48 < _a47.length; _i48++) {
      const v_e = _a47[_i48];
      if (!((b.edgeCand(v_e) === _h49))) continue;
      _g43.push(v_e);
    }
  }
  const v_A = _g43;
  const _eg66 = edgeGroups(sp, v_A);
  const _a50 = sp.points;
  R1:
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_k = _a50[_i51];
    const _h52 = clueAt(cl.n, v_k);
    if (!((_h52 >= 0))) continue;
    const _m140_0 = b.made[0];
    _g53.length = 0;
    G54: {
      const _a57 = sp.pointCells[v_k];
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_c = _a57[_i58];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g53.push(v_c);
      }
    }
    L59: {
      const v_P = _g53;
      const _h60 = v_P.length;
      if (!((_h60 > 2))) break L59;
      const _a61 = v_P;
      for (let _i62 = 0; _i62 < _a61.length; _i62++) {
        const v_a = _a61[_i62];
        const _a63 = v_P;
        const _n64 = _i62;
        for (let _i65 = 0; _i65 < _n64; _i65++) {
          const v_b = _a63[_i65];
          if (!(((sp.adj4[v_a].includes(v_b)) && (_eg66.of(v_b) === _eg66.of(v_a))))) continue;
          _g67.length = 0;
          G68: {
            const _a77 = open(b, sp, v_k);
            for (let _i78 = 0; _i78 < _a77.length; _i78++) {
              const v_c = _a77[_i78];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g67.push(v_c);
            }
          }
          const v_O = _g67;
          const _h125 = v_O.length;
          const v_left = ((_h52 - lines(b, sp, v_k)) - 1);
          if (b.made[0] !== _m140_0 || b.made[2] !== _m141_2) {
            _g79.length = 0;
            G80: {
              const _a83 = sp.edges;
              for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                const v_e = _a83[_i84];
                if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                _g79.push(v_e);
              }
            }
            if (!(sameSet(v_A, _g79))) { return fired; }
            _g85.length = 0;
            G86: {
              const _a89 = sp.pointCells[v_k];
              for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                const v_c = _a89[_i90];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g85.push(v_c);
              }
            }
            if (!(sameSet(v_P, _g85))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g91: number[] = [];
            G92: {
              const _a95 = sp.edges;
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                const v_e = _a95[_i96];
                if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                _g91.push(v_e);
              }
            }
            const _g97: number[] = [];
            G98: {
              const _a101 = sp.pointCells[v_k];
              for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                const v_c = _a101[_i102];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g97.push(v_c);
              }
            }
            const _g103: number[] = [];
            G104: {
              const _g113: number[] = [];
              G114: {
                const _a117 = sp.pointCells[v_k];
                for (let _i118 = 0; _i118 < _a117.length; _i118++) {
                  const v_c = _a117[_i118];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g113.push(v_c);
                }
              }
              const _a119 = _g113;
              for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                const v_c = _a119[_i120];
                if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                _g103.push(v_c);
              }
            }
            let _g121 = 0;
            G122: {
              const _a123 = sp.pointCells[v_k];
              for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                const v_c = _a123[_i124];
                if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
                _g121++;
              }
            }
            freshBinding("pair", [sameSet(v_A, _g91), (sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_P, _g97), (v_P.length > 2), (v_P.includes(v_a)), (before(v_a, v_P).includes(v_b)), ((sp.adj4[v_a].includes(v_b)) && (through(sp, v_a, v_A).includes(v_b))), sameSet(v_O, _g103), (v_left === ((clueAt(cl.n, v_k) - _g121) - 1))], ["A =", "k in", "where of k", "P =", "where of P", "a in", "b in", "where of b", "O =", "left ="]);
          }
          facts.length = 0;
          changed = false;
          let _c132: boolean = ((v_left >= 0) && (v_left <= _h125));
          if (_c132) {
            let _c131: boolean = !((v_left === 0));
            if (!_c131) {
              let _q126 = true;
              Q127: {
                const _a128 = v_O;
                for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                  const v_c = _a128[_i129];
                  const _t130 = (3 - slash(sp, v_c, v_k));
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t130); changed = true; } else facts.push(PLACE, v_c, _t130); }
                  if (!(true)) {
                    _q126 = false;
                    break Q127;
                  }
                }
              }
              _c131 = _q126;
            }
            _c132 = _c131;
          }
          let _c139: boolean = _c132;
          if (_c139) {
            let _c138: boolean = !((v_left === _h125));
            if (!_c138) {
              let _q133 = true;
              Q134: {
                const _a135 = v_O;
                for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                  const v_c = _a135[_i136];
                  const _t137 = slash(sp, v_c, v_k);
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t137); changed = true; } else facts.push(PLACE, v_c, _t137); }
                  if (!(true)) {
                    _q133 = false;
                    break Q134;
                  }
                }
              }
              _c138 = _q133;
            }
            _c139 = _c138;
          }
          if (!(_c139)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ A: v_A.slice(), k: v_k, P: v_P.slice(), a: v_a, b: v_b, O: v_O.slice(), left: v_left }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ShareBinding {
  A: readonly number[];
  k: number;
  P: readonly number[];
  a: number;
  b: number;
  R: readonly number[];
  left: number;
}

const shareFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function share(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShareBinding> | null): number {
  const _g45: number[] = [];
  const _g55: number[] = [];
  const _g69: number[] = [];
  const _g85: number[] = [];
  const _g91: number[] = [];
  const facts = shareFacts;
  let fired = 0;
  let changed = false;
  const _h51 = ((1 << 3));
  const _m135_2 = b.made[2];
  _g45.length = 0;
  G46: {
    const _a49 = sp.edges;
    for (let _i50 = 0; _i50 < _a49.length; _i50++) {
      const v_e = _a49[_i50];
      if (!((b.edgeCand(v_e) === _h51))) continue;
      _g45.push(v_e);
    }
  }
  const v_A = _g45;
  const _eg83 = edgeGroups(sp, v_A);
  const _a52 = sp.points;
  R1:
  for (let _i53 = 0; _i53 < _a52.length; _i53++) {
    const v_k = _a52[_i53];
    const _h54 = clueAt(cl.n, v_k);
    if (!((_h54 >= 0))) continue;
    const _m134_0 = b.made[0];
    _g55.length = 0;
    G56: {
      const _a59 = sp.pointCells[v_k];
      for (let _i60 = 0; _i60 < _a59.length; _i60++) {
        const v_c = _a59[_i60];
        const _h61 = (b.grid[v_c] !== 0);
        if (!(!(_h61))) continue;
        _g55.push(v_c);
      }
    }
    L62: {
      const v_P = _g55;
      const _h63 = v_P.length;
      if (!(((_h63 === 2) || (_h63 === 4)))) break L62;
      const _a64 = v_P;
      for (let _i65 = 0; _i65 < _a64.length; _i65++) {
        const v_a = _a64[_i65];
        const _a66 = v_P;
        const _n67 = _i65;
        for (let _i68 = 0; _i68 < _n67; _i68++) {
          const v_b = _a66[_i68];
          if (!((sp.adj4[v_a].includes(v_b)))) continue;
          _g69.length = 0;
          G70: {
            const _a79 = open(b, sp, v_k);
            for (let _i80 = 0; _i80 < _a79.length; _i80++) {
              const v_c = _a79[_i80];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g69.push(v_c);
            }
          }
          L81: {
            const v_R = _g69;
            const _h82 = v_R.length;
            if (!(((_h82 === 0) || (((_h82 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg83.of((v_R[1] ?? -1)) === _eg83.of((v_R[0] ?? -1))))))) break L81;
            L84: {
              const v_left = (_h54 - lines(b, sp, v_k));
              if (!(((2 * v_left) === (2 + _h82)))) break L84;
              if (b.made[0] !== _m134_0 || b.made[2] !== _m135_2) {
                _g85.length = 0;
                G86: {
                  const _a89 = sp.edges;
                  for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                    const v_e = _a89[_i90];
                    if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                    _g85.push(v_e);
                  }
                }
                if (!(sameSet(v_A, _g85))) { return fired; }
                _g91.length = 0;
                G92: {
                  const _a95 = sp.pointCells[v_k];
                  for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                    const v_c = _a95[_i96];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g91.push(v_c);
                  }
                }
                if (!(sameSet(v_P, _g91))) { continue R1; }
              }
              if (import.meta.env.DEV && staleChecking) {
                const _g97: number[] = [];
                G98: {
                  const _a101 = sp.edges;
                  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                    const v_e = _a101[_i102];
                    if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                    _g97.push(v_e);
                  }
                }
                const _g103: number[] = [];
                G104: {
                  const _a107 = sp.pointCells[v_k];
                  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                    const v_c = _a107[_i108];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g103.push(v_c);
                  }
                }
                const _g109: number[] = [];
                G110: {
                  const _g119: number[] = [];
                  G120: {
                    const _a123 = sp.pointCells[v_k];
                    for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                      const v_c = _a123[_i124];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g119.push(v_c);
                    }
                  }
                  const _a125 = _g119;
                  for (let _i126 = 0; _i126 < _a125.length; _i126++) {
                    const v_c = _a125[_i126];
                    if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                    _g109.push(v_c);
                  }
                }
                let _g127 = 0;
                G128: {
                  const _a129 = sp.pointCells[v_k];
                  for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                    const v_c = _a129[_i130];
                    if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
                    _g127++;
                  }
                }
                freshBinding("share", [sameSet(v_A, _g97), (sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_P, _g103), ((v_P.length === 2) || (v_P.length === 4)), (v_P.includes(v_a)), (before(v_a, v_P).includes(v_b)), (sp.adj4[v_a].includes(v_b)), sameSet(v_R, _g109), ((v_R.length === 0) || (((v_R.length === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (through(sp, (v_R[0] ?? -1), v_A).includes((v_R[1] ?? -1))))), (v_left === (clueAt(cl.n, v_k) - _g127)), ((2 * v_left) === (2 + v_R.length))], ["A =", "k in", "where of k", "P =", "where of P", "a in", "b in", "where of b", "R =", "where of R", "left =", "where of left"]);
              }
              facts.length = 0;
              changed = false;
              const _t131 = sp.edgeOf(v_b, v_a);
              if ((b.edgeCand(_t131) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(_t131, 1); changed = true; } else facts.push(STRIKE_EDGE, _t131, 1); }
              let _c133: boolean = true;
              if (_c133) {
                const _t132 = sp.edgeOf(v_b, v_a);
                if ((b.edgeCand(_t132) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(_t132, 2); changed = true; } else facts.push(STRIKE_EDGE, _t132, 2); }
                _c133 = true;
              }
              if (!(_c133)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ A: v_A.slice(), k: v_k, P: v_P.slice(), a: v_a, b: v_b, R: v_R.slice(), left: v_left }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface DeadEndBinding {
  c: number;
  d: number;
}

const deadEndFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function deadEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DeadEndBinding> | null): number {
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _a11 = sp.cells;
  R1:
  for (let _i12 = 0; _i12 < _a11.length; _i12++) {
    const v_c = _a11[_i12];
    const _m50_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c21: boolean = !((b.grid[v_c] !== 0));
      if (_c21) {
        let _q13 = false;
        Q14: {
          const _a15 = sp.cellPoints[v_c];
          for (let _i16 = 0; _i16 < _a15.length; _i16++) {
            const v_k = _a15[_i16];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a17 = sp.cellPoints[v_c];
            const _n18 = _i16;
            for (let _i19 = 0; _i19 < _n18; _i19++) {
              const v_q = _a17[_i19];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              let _c20: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c20) {
                _c20 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c20) {
                _q13 = true;
                break Q14;
              }
            }
          }
        }
        _c21 = _q13;
      }
      if (!(_c21)) continue;
      if (b.made[0] !== _m50_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c29: boolean = !((b.grid[v_c] !== 0));
        if (_c29) {
          let _q22 = false;
          Q23: {
            const _a24 = sp.cellPoints[v_c];
            for (let _i25 = 0; _i25 < _a24.length; _i25++) {
              const v_k = _a24[_i25];
              if (!((slash(sp, v_c, v_k) === v_d))) continue;
              const _a26 = sp.cellPoints[v_c];
              const _n27 = _i25;
              for (let _i28 = 0; _i28 < _n27; _i28++) {
                const v_q = _a26[_i28];
                if (!((slash(sp, v_c, v_q) === v_d))) continue;
                if ((((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1)) && ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1)))) {
                  _q22 = true;
                  break Q23;
                }
              }
            }
          }
          _c29 = _q22;
        }
        freshBinding("deadEnd", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), ((1 <= v_d) && (v_d <= 2)), _c29], ["c in", "where of c", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      const _t30 = (3 - v_d);
      let _q31 = false;
      Q32: {
        const _a33 = sp.cellPoints[v_c];
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_k = _a33[_i34];
          if (!((slash(sp, v_c, v_k) === _t30))) continue;
          const _a35 = sp.cellPoints[v_c];
          const _n36 = _i34;
          for (let _i37 = 0; _i37 < _n36; _i37++) {
            const v_q = _a35[_i37];
            if (!((slash(sp, v_c, v_q) === _t30))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q31 = true;
              break Q32;
            }
          }
        }
      }
      let _c47: boolean = !(_q31);
      if (_c47) {
        const _t38 = (3 - v_d);
        let _q39 = false;
        Q40: {
          const _a41 = sp.cellPoints[v_c];
          for (let _i42 = 0; _i42 < _a41.length; _i42++) {
            const v_k = _a41[_i42];
            if (!((slash(sp, v_c, v_k) === _t38))) continue;
            const _a43 = sp.cellPoints[v_c];
            const _n44 = _i42;
            for (let _i45 = 0; _i45 < _n44; _i45++) {
              const v_q = _a43[_i45];
              if (!((slash(sp, v_c, v_q) === _t38))) continue;
              let _c46: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c46) {
                _c46 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c46) {
                _q39 = true;
                break Q40;
              }
            }
          }
        }
        _c47 = !(_q39);
      }
      let _c49: boolean = _c47;
      if (_c49) {
        const _t48 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t48); changed = true; } else facts.push(PLACE, v_c, _t48); }
        _c49 = true;
      }
      if (!(_c49)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SameBinding {
  A: readonly number[];
  c: number;
  q: number;
}

const sameFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function same(b: Marks, sp: GridSpace, fire: Fire<SameBinding> | null): number {
  const _g11: number[] = [];
  const _g23: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h17 = ((1 << 3));
  const _m37_2 = b.made[2];
  _g11.length = 0;
  G12: {
    const _a15 = sp.edges;
    for (let _i16 = 0; _i16 < _a15.length; _i16++) {
      const v_e = _a15[_i16];
      if (!((b.edgeCand(v_e) === _h17))) continue;
      _g11.push(v_e);
    }
  }
  const v_A = _g11;
  const _eg20 = edgeGroups(sp, v_A);
  const _a18 = sp.cells;
  R1:
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_c = _a18[_i19];
    const _m36_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    const _a21 = _eg20.of(v_c);
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_q = _a21[_i22];
      if (!((b.grid[v_q] !== 0))) continue;
      if (b.made[0] !== _m36_0 || b.made[2] !== _m37_2) {
        _g23.length = 0;
        G24: {
          const _a27 = sp.edges;
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_e = _a27[_i28];
            if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
            _g23.push(v_e);
          }
        }
        if (!(sameSet(v_A, _g23))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g29: number[] = [];
        G30: {
          const _a33 = sp.edges;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_e = _a33[_i34];
            if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
            _g29.push(v_e);
          }
        }
        freshBinding("same", [sameSet(v_A, _g29), (sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (through(sp, v_c, v_A).includes(v_q)), (b.grid[v_q] !== 0)], ["A =", "c in", "where of c", "q in", "where of q"]);
      }
      facts.length = 0;
      changed = false;
      const _t35 = (b.grid[v_q] || -1);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t35); changed = true; } else facts.push(PLACE, v_c, _t35); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ A: v_A.slice(), c: v_c, q: v_q }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DrawnBinding {
  c: number;
  a: number;
  e: number;
  S: readonly number[];
  i: number;
}

const drawnFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function drawn(b: Marks, sp: GridSpace, v_c: number, fire: Fire<DrawnBinding> | null): number {
  const facts = drawnFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _k8 = sideKept.board(sp);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = sp.adj4[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_a = _a6[_i7];
    const v_e = sp.adj4Edges[v_c][_i7];
    const v_S = (_k8[v_e] ?? side(sp, v_e));
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h9 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("drawn", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj4[v_c].includes(v_a)), (v_e === sp.adj4Edges[v_c][_i7]), sameSet(v_S, side(sp, v_e)), ((1 <= v_i) && (v_i <= 2)), ((b.grid[v_c] || -1) !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1)))], ["c in", "where of c", "a in", "e =", "S =", "i in", "where of i"]);
      }
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) fire({ c: v_c, a: v_a, e: v_e, S: v_S.slice(), i: v_i }, facts);
      }
    }
  }
  return fired;
}

export interface OneBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  i: number;
}

const oneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function one(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneBinding> | null): number {
  const facts = oneFacts;
  let fired = 0;
  let changed = false;
  const _k16 = sideKept.board(sp);
  const _a8 = sp.points;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_k = _a8[_i9];
    const _h10 = clueAt(cl.n, v_k);
    if (!((_h10 === 1))) continue;
    const _a11 = sp.pointCells[v_k];
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_a = _a11[_i12];
      const _a13 = sp.pointCells[v_k];
      const _n14 = _i12;
      for (let _i15 = 0; _i15 < _n14; _i15++) {
        const v_b = _a13[_i15];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k16[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
          if (import.meta.env.DEV && staleChecking) {
            freshBinding("one", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) === 1), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "i in", "where of i"]);
          }
          facts.length = 0;
          changed = false;
          if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, i: v_i }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ThreeBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  i: number;
}

const threeFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function three(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ThreeBinding> | null): number {
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _k16 = sideKept.board(sp);
  const _a8 = sp.points;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_k = _a8[_i9];
    const _h10 = clueAt(cl.n, v_k);
    if (!((_h10 === 3))) continue;
    const _a11 = sp.pointCells[v_k];
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_a = _a11[_i12];
      const _a13 = sp.pointCells[v_k];
      const _n14 = _i12;
      for (let _i15 = 0; _i15 < _n14; _i15++) {
        const v_b = _a13[_i15];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k16[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) !== v_k))) continue;
          if (import.meta.env.DEV && staleChecking) {
            freshBinding("three", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) === 3), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) !== v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "i in", "where of i"]);
          }
          facts.length = 0;
          changed = false;
          if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, i: v_i }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface TwoBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  R: readonly number[];
  f: number;
  i: number;
  j: number;
}

const twoFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function two(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoBinding> | null): number {
  const _g26: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h25 = ((1 << 3));
  const _h33 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _k34 = sideKept.board(sp);
  const _a16 = sp.points;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_k = _a16[_i17];
    const _h18 = clueAt(cl.n, v_k);
    if (!(((_h18 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a19 = sp.pointCells[v_k];
    for (let _i20 = 0; _i20 < _a19.length; _i20++) {
      const v_a = _a19[_i20];
      const _a21 = sp.pointCells[v_k];
      const _n22 = _i20;
      R3:
      for (let _i23 = 0; _i23 < _n22; _i23++) {
        const v_b = _a21[_i23];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L24: {
          const v_e = sp.edgeOf(v_b, v_a);
          const _m45_2 = b.made[2];
          if (!((b.edgeCand(v_e) !== _h25))) break L24;
          _g26.length = 0;
          G27: {
            const _a30 = sp.pointCells[v_k];
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_c = _a30[_i31];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g26.push(v_c);
            }
          }
          const v_R = _g26;
          L32: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h33))) break L32;
            for (let v_i = 1; v_i <= 2; v_i++) {
              if (!((((_k34[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h42 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                if (!((((_k34[v_f] ?? side(sp, v_f))[(v_j - 1)] ?? -1) === v_k))) continue;
                if (b.made[2] !== _m45_2) {
                  if (!((b.edgeCand(v_e) !== ((1 << 3))))) { continue R3; }
                  if (!((b.edgeCand(v_f) !== ((1 << 1) | (1 << 2) | (1 << 3))))) { continue R3; }
                }
                if (import.meta.env.DEV && staleChecking) {
                  const _g35: number[] = [];
                  G36: {
                    const _a39 = sp.pointCells[v_k];
                    for (let _i40 = 0; _i40 < _a39.length; _i40++) {
                      const v_c = _a39[_i40];
                      if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                      _g35.push(v_c);
                    }
                  }
                  freshBinding("two", [(sp.points.includes(v_k)), ((clueAt(cl.n, v_k) === 2) && (sp.pointCells[v_k].length === 4)), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), (b.edgeCand(v_e) !== ((1 << 3))), sameSet(v_R, _g35), (v_f === sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1))), (b.edgeCand(v_f) !== ((1 << 1) | (1 << 2) | (1 << 3))), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k), ((1 <= v_j) && (v_j <= 2)), ((side(sp, v_f)[(v_j - 1)] ?? -1) === v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "where of e", "R =", "f =", "where of f", "i in", "where of i", "j in", "where of j"]);
                }
                facts.length = 0;
                changed = false;
                let _c41: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c41) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c41 = true;
                }
                let _c44: boolean = _c41;
                if (_c44) {
                  let _c43: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c43) {
                    if ((b.edgeCand(v_e) >> _h42) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h42); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h42); }
                    _c43 = true;
                  }
                  _c44 = _c43;
                }
                if (!(_c44)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, R: v_R.slice(), f: v_f, i: v_i, j: v_j }, facts)) return 1;
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

const openKept = keptStore<readonly number[]>();

/** `open(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_k: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.pointCells[v_k];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_c = _a5[_i6];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g1.push(v_c);
    }
  }
  const _made = _g1;
  _kept[v_k] = _made;
  return _made;
}

const linesKept = keptStore<number>();

/** `lines(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lines(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = linesKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g1 = 0;
  G2: {
    const _a3 = sp.pointCells[v_k];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_k] = _made;
  return _made;
}

/** What each point of a group adds to a forall kept over the group. */
function linkTerm0(_b: Marks, sp: GridSpace, _cl: null, v_q: number): number {
  return ((sp.pointCells[v_q].length === 4)) ? 0 : 1;
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm1(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) >= 0))) return 0;
  let _g1 = 0;
  G2: {
    const _a3 = sp.pointCells[v_q];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_q)))) continue;
      _g1++;
    }
  }
  return (clueAt(cl.n, v_q) - _g1);
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm2(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) < 0))) return 0;
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.pointCells[v_q];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_c = _a5[_i6];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g1.push(v_c);
    }
  }
  return _g1.length;
}

const sideKept = keptStore<readonly number[]>();
let sideOn: object | null = null;
let sideAt: Kept<readonly number[]> = [];

/** `side(e)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function side(sp: GridSpace, v_e: number): readonly number[] {
  if (sp !== sideOn) {
    sideAt = sideKept.board(sp);
    sideOn = sp;
  }
  const _kept: Kept<readonly number[]> = sideAt;
  if (_kept[v_e] !== undefined) return _kept[v_e];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_k = _a5[_i6];
      if (!((sp.cellPoints[sp.edgeEnds[2 * v_e + 1]].includes(v_k)))) continue;
      _g1.push(v_k);
    }
  }
  const _made = _g1;
  _kept[v_e] = _made;
  return _made;
}
