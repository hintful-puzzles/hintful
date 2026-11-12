// Compiled by `npm run describe` from src/games/bridges/bridges.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, least, minus, rangeMask, ray, sameSet, setOf, staleChecking, stamps, through, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  maxb: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "exactSpace" | "everyNeighbor" | "needsThisWay" | "sealing" | "tooMany" | "mustReachOut" | "loop";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  exactSpace: ExactSpaceSays;
  everyNeighbor: EveryNeighborSays;
  needsThisWay: NeedsThisWaySays;
  sealing: SealingSays;
  tooMany: TooManySays;
  mustReachOut: MustReachOutSays;
  loop: LoopSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["exactSpace","everyNeighbor","needsThisWay","sealing","tooMany.sealed","tooMany.starved","mustReachOut","loop"] as const;

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
  { id: "exactSpace", tier: 0 },
  { id: "everyNeighbor", tier: 0 },
  { id: "needsThisWay", tier: 1 },
  { id: "sealing", tier: 1 },
  { id: "loop", tier: 1, variation: "no loops" },
  { id: "tooMany", tier: 2 },
  { id: "mustReachOut", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt, variations: readonly string[]): boolean {
  const _g52: number[] = [];
  const _g68: number[] = [];
  const _domain = rangeMask(1, (cl.maxb + 1));
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.edges;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_e = _a3[_i4];
      const _t5 = sp.edgeEnds[2 * v_e];
      const _h6 = clueAt(cl.number, _t5);
      let _c9: boolean = (_h6 !== -1);
      if (_c9) {
        const _t7 = sp.edgeEnds[2 * v_e + 1];
        const _h8 = clueAt(cl.number, _t7);
        _c9 = (_h8 !== -1);
      }
      if (!(_c9)) continue;
      const _h10 = (g[v_e] || -1);
      if (!((_h10 === 1))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q11 = true;
  Q12: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_c = _a13[_i14];
      const _h15 = clueAt(cl.number, v_c);
      if (!(!((_h15 !== -1)))) continue;
      const _h24 = (v_c % sp.w);
      const _h25 = (2 * _h24);
      const _h27 = ((v_c / sp.w) | 0);
      const _h28 = (2 * _h27);
      const _a16 = sp.adj4[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_a = _a16[_i17];
        const _h18 = (g[sp.adj4Edges[v_c][_i17]] || -1);
        const _h23 = (v_a % sp.w);
        const _h26 = ((v_a / sp.w) | 0);
        const _h30 = sp.adj4Edges[v_c][_i17];
        const _h31 = (g[_h30] || -1);
        let _c32: boolean = (_h18 === 1);
        if (!_c32) {
          let _q19 = false;
          Q20: {
            const _a21 = sp.adj4[v_c];
            for (let _i22 = 0; _i22 < _a21.length; _i22++) {
              const v_b = _a21[_i22];
              if (!((((_h23 + (v_b % sp.w)) === _h25) && ((_h26 + ((v_b / sp.w) | 0)) === _h28)))) continue;
              const _h29 = (g[sp.adj4Edges[v_c][_i22]] || -1);
              if ((_h29 === _h31)) {
                _q19 = true;
                break Q20;
              }
            }
          }
          _c32 = _q19;
        }
        if (!(_c32)) {
          _q11 = false;
          break Q12;
        }
      }
    }
  }
  if (!(_q11)) return false;
  let _q33 = true;
  Q34: {
    const _a35 = sp.cells;
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_c = _a35[_i36];
      const _h37 = clueAt(cl.number, v_c);
      if (!(!((_h37 !== -1)))) continue;
      const _h43 = (v_c % sp.w);
      const _h45 = ((v_c / sp.w) | 0);
      const _a38 = sp.adj4[v_c];
      for (let _i39 = 0; _i39 < _a38.length; _i39++) {
        const v_a = _a38[_i39];
        const _h42 = (v_a % sp.w);
        const _h44 = (_h42 === _h43);
        const _h46 = sp.adj4Edges[v_c][_i39];
        const _h47 = (g[_h46] || -1);
        const _h48 = (_h47 === 1);
        const _a40 = sp.adj4[v_c];
        for (let _i41 = 0; _i41 < _a40.length; _i41++) {
          const v_b = _a40[_i41];
          if (!((_h44 && (((v_b / sp.w) | 0) === _h45)))) continue;
          const _h49 = (g[sp.adj4Edges[v_c][_i41]] || -1);
          if (!((_h48 || (_h49 === 1)))) {
            _q33 = false;
            break Q34;
          }
        }
      }
    }
  }
  if (!(_q33)) return false;
  let _q50 = true;
  Q51: {
    _g52.length = 0;
    G53: {
      const _a56 = sp.edges;
      for (let _i57 = 0; _i57 < _a56.length; _i57++) {
        const v_e = _a56[_i57];
        const _h58 = (g[v_e] || -1);
        if (!((_h58 > 1))) continue;
        _g52.push(v_e);
      }
    }
    const v_L = _g52;
    const _eg65 = edgeGroups(sp, v_L);
    const _a59 = sp.cells;
    for (let _i60 = 0; _i60 < _a59.length; _i60++) {
      const v_a = _a59[_i60];
      const _h61 = clueAt(cl.number, v_a);
      if (!((_h61 !== -1))) continue;
      const _a62 = sp.cells;
      for (let _i63 = 0; _i63 < _a62.length; _i63++) {
        const v_b = _a62[_i63];
        const _h64 = clueAt(cl.number, v_b);
        if (!((_h64 !== -1))) continue;
        if (!((_eg65.of(v_b) === _eg65.of(v_a)))) {
          _q50 = false;
          break Q51;
        }
      }
    }
  }
  if (!(_q50)) return false;
  if (variations.includes("no loops")) {
    let _q66 = true;
    Q67: {
      _g68.length = 0;
      G69: {
        const _a72 = sp.edges;
        for (let _i73 = 0; _i73 < _a72.length; _i73++) {
          const v_e = _a72[_i73];
          const _h74 = (g[v_e] || -1);
          if (!((_h74 > 1))) continue;
          _g68.push(v_e);
        }
      }
      const v_L = _g68;
      const _a75 = v_L;
      for (let _i76 = 0; _i76 < _a75.length; _i76++) {
        const v_e = _a75[_i76];
        if (!(!(through(sp, sp.edgeEnds[2 * v_e], minus(v_L, setOf(v_e))).includes(sp.edgeEnds[2 * v_e + 1])))) {
          _q66 = false;
          break Q67;
        }
      }
    }
    if (!(_q66)) return false;
  }
  for (let _k77 = 0; _k77 < cl.number.at.length; _k77++) {
    const _at78 = cl.number.at[_k77];
    let _g80 = 0;
    G81: {
      const _a82 = sp.adj4[_at78];
      for (let _i83 = 0; _i83 < _a82.length; _i83++) {
        _g80 += ((g[sp.adj4Edges[_at78][_i83]] || -1) - 1);
      }
    }
    if (!((_g80 === clueAt(cl.number, _at78)))) return false;
  }
  return true;
}

export interface ExactSpaceBinding {
  c: number;
  n: number;
  R: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ExactSpaceSays {
  terms: { at: number; clue: number; missing: number; };
  marks: { reads: readonly number[]; };
}

const exactSpaceFacts: number[] = [];
let exactSpaceCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function exactSpace(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExactSpaceBinding, ExactSpaceSays> | null): number {
  const facts = exactSpaceFacts;
  let fired = 0;
  let changed = false;
  if (exactSpaceCands.length < sp.edges.length) exactSpaceCands = new Int32Array(sp.edges.length);
  const cands = exactSpaceCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  roomMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    const _h11 = clueAt(cl.number, v_c);
    if (!((_h11 !== -1))) continue;
    L12: {
      const v_n = needMarked(b, sp, cl, cands, v_c);
      if (!((v_n !== 0))) break L12;
      let _g13 = 0;
      G14: {
        const _a15 = sp.adj4[v_c];
        for (let _i16 = 0; _i16 < _a15.length; _i16++) {
          const v_y = _a15[_i16];
          if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
          _g13 += roomMarked(b, sp, cl, cands, v_c, v_y);
        }
      }
      L17: {
        const v_R = _g13;
        if (!(((v_n < 0) || (v_R <= v_n)))) break L17;
        if (DEV && staleChecking) {
          let _g18 = 0;
          G19: {
            const _a20 = sp.adj4[v_c];
            for (let _i21 = 0; _i21 < _a20.length; _i21++) {
              const v_y = _a20[_i21];
              if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
              _g18 += roomMarked(b, sp, cl, cands, v_c, v_y);
            }
          }
          freshBinding("exactSpace", [(sp.cells.includes(v_c)), (clueAt(cl.number, v_c) !== -1), (v_n === needMarked(b, sp, cl, cands, v_c)), (v_n !== 0), (v_R === _g18), ((v_n < 0) || (v_R <= v_n))], ["c in", "where of c", "n =", "where of n", "R =", "where of R"]);
        }
        facts.length = 0;
        changed = false;
        let _c29: boolean = ((v_n >= 0) && (v_R === v_n));
        if (_c29) {
          let _q22 = true;
          Q23: {
            const _a24 = sp.adj4[v_c];
            for (let _i25 = 0; _i25 < _a24.length; _i25++) {
              const v_y = _a24[_i25];
              if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
              const v_t = (hasMarked(b, sp, cl, cands, v_c, v_y) + roomMarked(b, sp, cl, cands, v_c, v_y));
              const _a26 = run(sp, cl, v_c, v_y);
              for (let _i27 = 0; _i27 < _a26.length; _i27++) {
                const v_e = _a26[_i27];
                for (let _m28 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m28 !== 0; _m28 &= _m28 - 1) {
                  const v_d = 31 - Math.clz32(_m28 & -_m28);
                  if (!((v_d <= v_t))) continue;
                  if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                  if (!(true)) {
                    _q22 = false;
                    break Q23;
                  }
                }
              }
            }
          }
          _c29 = _q22;
        }
        if (!(_c29)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { at: v_c, clue: _h11, missing: v_n }, marks: { reads: setOf(v_c).slice() } };
            if (!fire({ c: v_c, n: v_n, R: v_R }, facts, _says)) return 1;
          }
          cands.fill(-1);
          needMarkedKept.clear();
          bridgesMarkedKept.clear();
          hasMarkedKept.clear();
          roomMarkedKept.clear();
          moreMarkedKept.clear();
          openMarkedKept.clear();
          crossedMarkedKept.clear();
          capMarkedKept.clear();
          allowsMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface EveryNeighborBinding {
  c: number;
  A: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface EveryNeighborSays {
  terms: { at: number; clue: number; neighbors: number; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
}

const everyNeighborFacts: number[] = [];
let everyNeighborCands = new Int32Array(0);
const everyNeighbor_st37 = stamps();

/** Its dearest read grows with the board as n. */
export function everyNeighbor(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryNeighborBinding, EveryNeighborSays> | null): number {
  const _g13: number[] = [];
  const _g33: number[] = [];
  const facts = everyNeighborFacts;
  let fired = 0;
  let changed = false;
  if (everyNeighborCands.length < sp.edges.length) everyNeighborCands = new Int32Array(sp.edges.length);
  const cands = everyNeighborCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  mostMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  const _a10 = sp.cells;
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    const _h12 = clueAt(cl.number, v_c);
    if (!(((_h12 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    _g13.length = 0;
    G14: {
      const _a17 = sp.adj4[v_c];
      for (let _i18 = 0; _i18 < _a17.length; _i18++) {
        const v_y = _a17[_i18];
        if (!(((far(sp, cl, v_c, v_y) !== -1) && (mostMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
        _g13.push(v_y);
      }
    }
    L19: {
      const v_A = _g13;
      const _h20 = v_A.length;
      if (!((_h12 > ((_h20 - 1) * cl.maxb)))) break L19;
      if (DEV && staleChecking) {
        const _g21: number[] = [];
        G22: {
          const _a25 = sp.adj4[v_c];
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_y = _a25[_i26];
            if (!(((far(sp, cl, v_c, v_y) !== -1) && (mostMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
            _g21.push(v_y);
          }
        }
        freshBinding("everyNeighbor", [(sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), sameSet(v_A, _g21), (clueAt(cl.number, v_c) > ((v_A.length - 1) * cl.maxb))], ["c in", "where of c", "A =", "where of A"]);
      }
      facts.length = 0;
      changed = false;
      let _q27 = true;
      Q28: {
        const _a29 = v_A;
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_y = _a29[_i30];
          if (!((hasMarked(b, sp, cl, cands, v_c, v_y) === 0))) continue;
          const _a31 = run(sp, cl, v_c, v_y);
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_e = _a31[_i32];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q27 = false;
              break Q28;
            }
          }
        }
      }
      if (!(_q27)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          _g33.length = 0;
          everyNeighbor_st37.pass++;
          G34: {
            const _a38 = v_A;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_y = _a38[_i39];
              const _t40 = far(sp, cl, v_c, v_y);
              const _t41 = _t40;
              if (_g33.length < 16) { if (!_g33.includes(_t41)) _g33.push(_t41); } else addOnce(_g33, everyNeighbor_st37, _t41);
            }
          }
          const _says = { terms: { at: v_c, clue: _h12, neighbors: _h20 }, marks: { reads: setOf(v_c).slice(), outline: _g33.slice() } };
          if (!fire({ c: v_c, A: v_A.slice() }, facts, _says)) return 1;
        }
        cands.fill(-1);
        needMarkedKept.clear();
        bridgesMarkedKept.clear();
        hasMarkedKept.clear();
        mostMarkedKept.clear();
        moreMarkedKept.clear();
        openMarkedKept.clear();
        crossedMarkedKept.clear();
        capMarkedKept.clear();
        allowsMarkedKept.clear();
      }
    }
  }
  return fired;
}

export interface NeedsThisWayBinding {
  c: number;
  V: number;
  y: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NeedsThisWaySays {
  terms: { at: number; clue: number; elsewhere: number; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
}

const needsThisWayFacts: number[] = [];
let needsThisWayCands = new Int32Array(0);
const needsThisWay_st34 = stamps();

/** Its dearest read grows with the board as n. */
export function needsThisWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeedsThisWayBinding, NeedsThisWaySays> | null): number {
  const _g30: number[] = [];
  const facts = needsThisWayFacts;
  let fired = 0;
  let changed = false;
  if (needsThisWayCands.length < sp.edges.length) needsThisWayCands = new Int32Array(sp.edges.length);
  const cands = needsThisWayCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  mostMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  const _a9 = sp.cells;
  R1:
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    const _m39_0 = b.made[0];
    const _m40_1 = b.made[1];
    const _h11 = clueAt(cl.number, v_c);
    if (!(((_h11 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    let _g12 = 0;
    G13: {
      const _a14 = sp.adj4[v_c];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_y = _a14[_i15];
        if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
        _g12 += mostMarked(b, sp, cl, cands, v_c, v_y);
      }
    }
    const v_V = _g12;
    const _a16 = sp.adj4[v_c];
    for (let _i17 = 0; _i17 < _a16.length; _i17++) {
      const v_y = _a16[_i17];
      if (!(((((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && ((v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) < _h11)))) continue;
      if (b.made[0] !== _m39_0 || b.made[1] !== _m40_1) {
        if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        let _g18 = 0;
        G19: {
          const _a20 = sp.adj4[v_c];
          for (let _i21 = 0; _i21 < _a20.length; _i21++) {
            const v_y = _a20[_i21];
            if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
            _g18 += mostMarked(b, sp, cl, cands, v_c, v_y);
          }
        }
        if (!((v_V === _g18))) { continue R1; }
      }
      if (DEV && staleChecking) {
        let _g22 = 0;
        G23: {
          const _a24 = sp.adj4[v_c];
          for (let _i25 = 0; _i25 < _a24.length; _i25++) {
            const v_y = _a24[_i25];
            if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
            _g22 += mostMarked(b, sp, cl, cands, v_c, v_y);
          }
        }
        freshBinding("needsThisWay", [(sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (v_V === _g22), (sp.adj4[v_c].includes(v_y)), ((((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && ((v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) < clueAt(cl.number, v_c)))], ["c in", "where of c", "V =", "y in", "where of y"]);
      }
      facts.length = 0;
      changed = false;
      let _q26 = true;
      Q27: {
        const _a28 = run(sp, cl, v_c, v_y);
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_e = _a28[_i29];
          if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
          if (!(true)) {
            _q26 = false;
            break Q27;
          }
        }
      }
      if (!(_q26)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          _g30.length = 0;
          needsThisWay_st34.pass++;
          G31: {
            const _a35 = sp.adj4[v_c];
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const v_z = _a35[_i36];
              if (!((((far(sp, cl, v_c, v_z) !== -1) && (v_z !== v_y)) && (mostMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
              const _t37 = far(sp, cl, v_c, v_z);
              const _t38 = _t37;
              if (_g30.length < 16) { if (!_g30.includes(_t38)) _g30.push(_t38); } else addOnce(_g30, needsThisWay_st34, _t38);
            }
          }
          const _says = { terms: { at: v_c, clue: _h11, elsewhere: (v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) }, marks: { reads: setOf(v_c).slice(), outline: _g30.slice() } };
          if (!fire({ c: v_c, V: v_V, y: v_y }, facts, _says)) return 1;
        }
        cands.fill(-1);
        needMarkedKept.clear();
        bridgesMarkedKept.clear();
        hasMarkedKept.clear();
        mostMarkedKept.clear();
        moreMarkedKept.clear();
        openMarkedKept.clear();
        crossedMarkedKept.clear();
        capMarkedKept.clear();
        allowsMarkedKept.clear();
      }
    }
  }
  return fired;
}

export interface SealingBinding {
  N: number;
  c: number;
  y: number;
  f: number;
  G: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SealingSays {
  terms: { at: number; links: readonly number[]; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
}

const sealingFacts: number[] = [];
let sealingCands = new Int32Array(0);
const sealing_st95 = stamps();

/** Its dearest read grows with the board as n^2. */
export function sealing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealingBinding, SealingSays> | null): number {
  const _g89: number[] = [];
  const _g103: number[] = [];
  const facts = sealingFacts;
  let fired = 0;
  let changed = false;
  if (sealingCands.length < sp.edges.length) sealingCands = new Int32Array(sp.edges.length);
  const cands = sealingCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  let _g29 = 0;
  G30: {
    const _a31 = sp.cells;
    for (let _i32 = 0; _i32 < _a31.length; _i32++) {
      const v_x = _a31[_i32];
      const _h33 = clueAt(cl.number, v_x);
      if (!((_h33 !== -1))) continue;
      _g29++;
    }
  }
  const v_N = _g29;
  const _a34 = sp.cells;
  R1:
  for (let _i35 = 0; _i35 < _a34.length; _i35++) {
    const v_c = _a34[_i35];
    const _m110_0 = b.made[0];
    const _m111_1 = b.made[1];
    const _h36 = clueAt(cl.number, v_c);
    if (!(((_h36 !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) continue;
    const _a37 = sp.adj4[v_c];
    for (let _i38 = 0; _i38 < _a37.length; _i38++) {
      const v_y = _a37[_i38];
      L39: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)))) break L39;
        const _t40 = run(sp, cl, v_c, v_y);
        L42: {
          const v_G = throughWhere(sp, v_c, (_te41: number): boolean => {  return (((least((cands[_te41] >= 0 ? cands[_te41] : (cands[_te41] = b.cands[_te41]))) - 1) > 0) || (_t40.includes(_te41))); });
          let _q43 = true;
          Q44: {
            const _a45 = v_G;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_x = _a45[_i46];
              const _h47 = clueAt(cl.number, v_x);
              if (!((_h47 !== -1))) continue;
              const _a48 = sp.adj4[v_x];
              for (let _i49 = 0; _i49 < _a48.length; _i49++) {
                const v_z = _a48[_i49];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q43 = false;
                  break Q44;
                }
              }
            }
          }
          let _c55: boolean = _q43;
          if (_c55) {
            let _q50 = true;
            Q51: {
              const _a52 = v_G;
              for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                const v_x = _a52[_i53];
                const _h54 = clueAt(cl.number, v_x);
                if (!((((_h54 !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                  _q50 = false;
                  break Q51;
                }
              }
            }
            _c55 = _q50;
          }
          let _c61: boolean = _c55;
          if (_c61) {
            let _g56 = 0;
            G57: {
              const _a58 = v_G;
              for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                const v_x = _a58[_i59];
                const _h60 = clueAt(cl.number, v_x);
                if (!((_h60 !== -1))) continue;
                _g56++;
              }
            }
            _c61 = (_g56 < v_N);
          }
          if (!(_c61)) break L42;
          if (b.made[0] !== _m110_0 || b.made[1] !== _m111_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g62 = 0;
            G63: {
              const _a64 = sp.cells;
              for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                const v_x = _a64[_i65];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g62++;
              }
            }
            const _t66 = run(sp, cl, v_c, v_y);
            let _q68 = true;
            Q69: {
              const _a70 = v_G;
              for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                const v_x = _a70[_i71];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                const _a72 = sp.adj4[v_x];
                for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                  const v_z = _a72[_i73];
                  if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                  if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                    _q68 = false;
                    break Q69;
                  }
                }
              }
            }
            let _c78: boolean = _q68;
            if (_c78) {
              let _q74 = true;
              Q75: {
                const _a76 = v_G;
                for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                  const v_x = _a76[_i77];
                  if (!((((clueAt(cl.number, v_x) !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                  if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                    _q74 = false;
                    break Q75;
                  }
                }
              }
              _c78 = _q74;
            }
            let _c83: boolean = _c78;
            if (_c83) {
              let _g79 = 0;
              G80: {
                const _a81 = v_G;
                for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                  const v_x = _a81[_i82];
                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                  _g79++;
                }
              }
              _c83 = (_g79 < v_N);
            }
            freshBinding("sealing", [(v_N === _g62), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)), (sp.adj4[v_c].includes(v_y)), (v_f === far(sp, cl, v_c, v_y)), ((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)), sameSet(v_G, throughWhere(sp, v_c, (_te67: number): boolean => {  return (((least((cands[_te67] >= 0 ? cands[_te67] : (cands[_te67] = b.cands[_te67]))) - 1) > 0) || (_t66.includes(_te67))); })), _c83], ["N =", "c in", "where of c", "y in", "f =", "where of f", "G =", "where of G"]);
          }
          facts.length = 0;
          changed = false;
          let _q84 = true;
          Q85: {
            const _a86 = run(sp, cl, v_c, v_y);
            for (let _i87 = 0; _i87 < _a86.length; _i87++) {
              const v_e = _a86[_i87];
              for (let _m88 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m88 !== 0; _m88 &= _m88 - 1) {
                const v_d = 31 - Math.clz32(_m88 & -_m88);
                if (!((v_d > 1))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q84 = false;
                  break Q85;
                }
              }
            }
          }
          if (!(_q84)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              _g89.length = 0;
              sealing_st95.pass++;
              G90: {
                const _a96 = v_G;
                for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                  const v_c = _a96[_i97];
                  const _h98 = clueAt(cl.number, v_c);
                  if (!((_h98 !== -1))) continue;
                  const _a99 = sp.adj4[v_c];
                  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                    const v_y = _a99[_i100];
                    if (!((((far(sp, cl, v_c, v_y) !== -1) && (v_G.includes(far(sp, cl, v_c, v_y)))) && (hasMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
                    const _t101 = sp.adj4Edges[v_c][_i100];
                    const _t102 = _t101;
                    if (_g89.length < 16) { if (!_g89.includes(_t102)) _g89.push(_t102); } else addOnce(_g89, sealing_st95, _t102);
                  }
                }
              }
              _g103.length = 0;
              G104: {
                const _a107 = v_G;
                for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                  const v_x = _a107[_i108];
                  const _h109 = clueAt(cl.number, v_x);
                  if (!((_h109 !== -1))) continue;
                  _g103.push(v_x);
                }
              }
              const _says = { terms: { at: v_c, links: _g89.slice() }, marks: { reads: setOf(v_c).slice(), outline: _g103.slice() } };
              if (!fire({ N: v_N, c: v_c, y: v_y, f: v_f, G: v_G.slice() }, facts, _says)) return 1;
            }
            cands.fill(-1);
            needMarkedKept.clear();
            bridgesMarkedKept.clear();
            hasMarkedKept.clear();
            moreMarkedKept.clear();
            openMarkedKept.clear();
            crossedMarkedKept.clear();
            capMarkedKept.clear();
            allowsMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface TooManyBinding {
  N: number;
  c: number;
  y: number;
  r: number;
  H: readonly number[];
  G: readonly number[];
  t: number;
  k: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; the arm that holds says which way it reads. */
export type TooManySays =
  | { arm: "sealed"; terms: { at: number; clue: number; limit: number; links: readonly number[]; }; marks: { reads: readonly number[]; outline: readonly number[]; } }
  | { arm: "starved"; terms: { at: number; clue: number; limit: number; starved: number; }; marks: { reads: readonly number[]; outline: readonly number[]; } }
;

const tooManyFacts: number[] = [];
let tooManyCands = new Int32Array(0);
const tooMany_st301 = stamps();

/** Its dearest read grows with the board as n^2. */
export function tooMany(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooManyBinding, TooManySays> | null): number {
  const _g295: number[] = [];
  const _g309: number[] = [];
  const _g316: number[] = [];
  const _g408: number[] = [];
  const facts = tooManyFacts;
  let fired = 0;
  let changed = false;
  if (tooManyCands.length < sp.edges.length) tooManyCands = new Int32Array(sp.edges.length);
  const cands = tooManyCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  roomMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  let _g92 = 0;
  G93: {
    const _a94 = sp.cells;
    for (let _i95 = 0; _i95 < _a94.length; _i95++) {
      const v_x = _a94[_i95];
      const _h96 = clueAt(cl.number, v_x);
      if (!((_h96 !== -1))) continue;
      _g92++;
    }
  }
  const v_N = _g92;
  const _a97 = sp.cells;
  R1:
  for (let _i98 = 0; _i98 < _a97.length; _i98++) {
    const v_c = _a97[_i98];
    const _m500_0 = b.made[0];
    const _m501_1 = b.made[1];
    const _h99 = clueAt(cl.number, v_c);
    if (!(((_h99 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a100 = sp.adj4[v_c];
    for (let _i101 = 0; _i101 < _a100.length; _i101++) {
      const v_y = _a100[_i101];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      L102: {
        const v_r = roomMarked(b, sp, cl, cands, v_c, v_y);
        if (!((v_r > 0))) break L102;
        const v_H = run(sp, cl, v_c, v_y);
        const v_G = throughWhere(sp, v_c, (_te103: number): boolean => {  return (((least((cands[_te103] >= 0 ? cands[_te103] : (cands[_te103] = b.cands[_te103]))) - 1) > 0) || (v_H.includes(_te103))); });
        const v_t = hasMarked(b, sp, cl, cands, v_c, v_y);
        let _g104 = -1;
        G105: {
          const _t106 = (v_t + 1);
          const _t107 = (v_t + v_r);
          for (let v_j = _t106; v_j <= _t107; v_j++) {
            let _q108 = false;
            Q109: {
              const _a110 = near(sp, cl, v_c, v_y);
              for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                const v_x = _a110[_i111];
                const _h112 = clueAt(cl.number, v_x);
                const _h136 = (v_x % sp.w);
                let _g113 = 0;
                G114: {
                  const _a115 = sp.adj4[v_x];
                  for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                    const v_y = _a115[_i116];
                    if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                    let _g117 = 0;
                    G118: {
                      const _t119 = sp.adj4Edges[v_x][_i116];
                      for (let _i120 = 0; _i120 < 1; _i120++) {
                        const v_z = _t119;
                        if (!((v_H.includes(v_z)))) continue;
                        _g117 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                      }
                    }
                    _g113 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g117);
                  }
                }
                let _c156: boolean = ((_h112 - _g113) < 0);
                if (!_c156) {
                  let _g121 = 0;
                  G122: {
                    const _a123 = sp.adj4[v_x];
                    for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                      const v_y = _a123[_i124];
                      if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                      const _h135 = (v_y % sp.w);
                      const _h137 = (_h135 === _h136);
                      const _h152 = sp.adj4Edges[v_x][_i124];
                      let _g125 = -1;
                      G126: {
                        const _t127 = cl.maxb;
                        for (let v_k = _t127; v_k >= 0; v_k--) {
                          let _c155: boolean = (v_k === 0);
                          if (!_c155) {
                            let _q128 = false;
                            Q129: {
                              const _a130 = mid(sp, cl, v_x, v_y);
                              for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                                const v_m = _a130[_i131];
                                const _h134 = (v_m % sp.w);
                                const _a132 = sp.adj4[v_m];
                                for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                                  const v_p = _a132[_i133];
                                  if (!((((v_p % sp.w) === _h134) !== _h137))) continue;
                                  const _t138 = sp.adj4Edges[v_m][_i133];
                                  if ((((least((cands[_t138] >= 0 ? cands[_t138] : (cands[_t138] = b.cands[_t138]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i133])))) {
                                    _q128 = true;
                                    break Q129;
                                  }
                                }
                              }
                            }
                            let _c149: boolean = !(_q128);
                            if (_c149) {
                              const _t139 = far(sp, cl, v_x, v_y);
                              const _h140 = clueAt(cl.number, _t139);
                              let _g141 = 0;
                              G142: {
                                const _a143 = sp.adj4[_t139];
                                for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                                  const v_y = _a143[_i144];
                                  if (!((far(sp, cl, _t139, v_y) !== -1))) continue;
                                  let _g145 = 0;
                                  G146: {
                                    const _t147 = sp.adj4Edges[_t139][_i144];
                                    for (let _i148 = 0; _i148 < 1; _i148++) {
                                      const v_z = _t147;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g145 += (v_j - hasMarked(b, sp, cl, cands, _t139, v_y));
                                    }
                                  }
                                  _g141 += (hasMarked(b, sp, cl, cands, _t139, v_y) + _g145);
                                }
                              }
                              _c149 = (v_k <= (_h140 - _g141));
                            }
                            let _c154: boolean = _c149;
                            if (_c154) {
                              let _g150 = 0;
                              G151: {
                                for (let _i153 = 0; _i153 < 1; _i153++) {
                                  const v_z = _h152;
                                  if (!((v_H.includes(v_z)))) continue;
                                  _g150 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                }
                              }
                              _c154 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g150) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                            }
                            _c155 = _c154;
                          }
                          if (!(_c155)) continue;
                          _g125 = v_k;
                          break G126;
                        }
                      }
                      _g121 += _g125;
                    }
                  }
                  _c156 = (_g121 < (_h112 - _g113));
                }
                if (_c156) {
                  _q108 = true;
                  break Q109;
                }
              }
            }
            let _c184: boolean = _q108;
            if (!_c184) {
              let _q157 = true;
              Q158: {
                const _a159 = v_G;
                for (let _i160 = 0; _i160 < _a159.length; _i160++) {
                  const v_x = _a159[_i160];
                  const _h161 = clueAt(cl.number, v_x);
                  if (!((_h161 !== -1))) continue;
                  const _a162 = sp.adj4[v_x];
                  for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                    const v_z = _a162[_i163];
                    if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                    if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                      _q157 = false;
                      break Q158;
                    }
                  }
                }
              }
              let _c177: boolean = _q157;
              if (_c177) {
                let _q164 = true;
                Q165: {
                  const _a166 = v_G;
                  for (let _i167 = 0; _i167 < _a166.length; _i167++) {
                    const v_x = _a166[_i167];
                    const _h168 = clueAt(cl.number, v_x);
                    if (!((_h168 !== -1))) continue;
                    let _g169 = 0;
                    G170: {
                      const _a171 = sp.adj4[v_x];
                      for (let _i172 = 0; _i172 < _a171.length; _i172++) {
                        const v_y = _a171[_i172];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g173 = 0;
                        G174: {
                          const _t175 = sp.adj4Edges[v_x][_i172];
                          for (let _i176 = 0; _i176 < 1; _i176++) {
                            const v_z = _t175;
                            if (!((v_H.includes(v_z)))) continue;
                            _g173 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g169 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g173);
                      }
                    }
                    if (!(((_h168 - _g169) === 0))) {
                      _q164 = false;
                      break Q165;
                    }
                  }
                }
                _c177 = _q164;
              }
              let _c183: boolean = _c177;
              if (_c183) {
                let _g178 = 0;
                G179: {
                  const _a180 = v_G;
                  for (let _i181 = 0; _i181 < _a180.length; _i181++) {
                    const v_x = _a180[_i181];
                    const _h182 = clueAt(cl.number, v_x);
                    if (!((_h182 !== -1))) continue;
                    _g178++;
                  }
                }
                _c183 = (_g178 < v_N);
              }
              _c184 = _c183;
            }
            if (!(_c184)) continue;
            _g104 = v_j;
            break G105;
          }
        }
        L185: {
          const v_k = _g104;
          if (!((v_k > 0))) break L185;
          if (b.made[0] !== _m500_0 || b.made[1] !== _m501_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g186 = 0;
            G187: {
              const _a188 = sp.cells;
              for (let _i189 = 0; _i189 < _a188.length; _i189++) {
                const v_x = _a188[_i189];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g186++;
              }
            }
            let _g191 = -1;
            G192: {
              const _t193 = (v_t + 1);
              const _t194 = (v_t + v_r);
              for (let v_j = _t193; v_j <= _t194; v_j++) {
                let _q195 = false;
                Q196: {
                  const _a197 = near(sp, cl, v_c, v_y);
                  for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                    const v_x = _a197[_i198];
                    let _g199 = 0;
                    G200: {
                      const _a201 = sp.adj4[v_x];
                      for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                        const v_y = _a201[_i202];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g203 = 0;
                        G204: {
                          const _t205 = sp.adj4Edges[v_x][_i202];
                          for (let _i206 = 0; _i206 < 1; _i206++) {
                            const v_z = _t205;
                            if (!((v_H.includes(v_z)))) continue;
                            _g203 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g199 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g203);
                      }
                    }
                    let _c237: boolean = ((clueAt(cl.number, v_x) - _g199) < 0);
                    if (!_c237) {
                      let _g207 = 0;
                      G208: {
                        const _a209 = sp.adj4[v_x];
                        for (let _i210 = 0; _i210 < _a209.length; _i210++) {
                          const v_y = _a209[_i210];
                          if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                          let _g211 = -1;
                          G212: {
                            const _t213 = cl.maxb;
                            for (let v_k = _t213; v_k >= 0; v_k--) {
                              let _c236: boolean = (v_k === 0);
                              if (!_c236) {
                                let _q214 = false;
                                Q215: {
                                  const _a216 = mid(sp, cl, v_x, v_y);
                                  for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                                    const v_m = _a216[_i217];
                                    const _a218 = sp.adj4[v_m];
                                    for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                                      const v_p = _a218[_i219];
                                      if (!((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_x % sp.w))))) continue;
                                      const _t220 = sp.adj4Edges[v_m][_i219];
                                      if ((((least((cands[_t220] >= 0 ? cands[_t220] : (cands[_t220] = b.cands[_t220]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i219])))) {
                                        _q214 = true;
                                        break Q215;
                                      }
                                    }
                                  }
                                }
                                let _c230: boolean = !(_q214);
                                if (_c230) {
                                  const _t221 = far(sp, cl, v_x, v_y);
                                  let _g222 = 0;
                                  G223: {
                                    const _a224 = sp.adj4[_t221];
                                    for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                                      const v_y = _a224[_i225];
                                      if (!((far(sp, cl, _t221, v_y) !== -1))) continue;
                                      let _g226 = 0;
                                      G227: {
                                        const _t228 = sp.adj4Edges[_t221][_i225];
                                        for (let _i229 = 0; _i229 < 1; _i229++) {
                                          const v_z = _t228;
                                          if (!((v_H.includes(v_z)))) continue;
                                          _g226 += (v_j - hasMarked(b, sp, cl, cands, _t221, v_y));
                                        }
                                      }
                                      _g222 += (hasMarked(b, sp, cl, cands, _t221, v_y) + _g226);
                                    }
                                  }
                                  _c230 = (v_k <= (clueAt(cl.number, _t221) - _g222));
                                }
                                let _c235: boolean = _c230;
                                if (_c235) {
                                  let _g231 = 0;
                                  G232: {
                                    const _t233 = sp.adj4Edges[v_x][_i210];
                                    for (let _i234 = 0; _i234 < 1; _i234++) {
                                      const v_z = _t233;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g231 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                    }
                                  }
                                  _c235 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g231) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                                }
                                _c236 = _c235;
                              }
                              if (!(_c236)) continue;
                              _g211 = v_k;
                              break G212;
                            }
                          }
                          _g207 += _g211;
                        }
                      }
                      _c237 = (_g207 < (clueAt(cl.number, v_x) - _g199));
                    }
                    if (_c237) {
                      _q195 = true;
                      break Q196;
                    }
                  }
                }
                let _c262: boolean = _q195;
                if (!_c262) {
                  let _q238 = true;
                  Q239: {
                    const _a240 = v_G;
                    for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                      const v_x = _a240[_i241];
                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                      const _a242 = sp.adj4[v_x];
                      for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                        const v_z = _a242[_i243];
                        if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                        if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                          _q238 = false;
                          break Q239;
                        }
                      }
                    }
                  }
                  let _c256: boolean = _q238;
                  if (_c256) {
                    let _q244 = true;
                    Q245: {
                      const _a246 = v_G;
                      for (let _i247 = 0; _i247 < _a246.length; _i247++) {
                        const v_x = _a246[_i247];
                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                        let _g248 = 0;
                        G249: {
                          const _a250 = sp.adj4[v_x];
                          for (let _i251 = 0; _i251 < _a250.length; _i251++) {
                            const v_y = _a250[_i251];
                            if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                            let _g252 = 0;
                            G253: {
                              const _t254 = sp.adj4Edges[v_x][_i251];
                              for (let _i255 = 0; _i255 < 1; _i255++) {
                                const v_z = _t254;
                                if (!((v_H.includes(v_z)))) continue;
                                _g252 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                              }
                            }
                            _g248 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g252);
                          }
                        }
                        if (!(((clueAt(cl.number, v_x) - _g248) === 0))) {
                          _q244 = false;
                          break Q245;
                        }
                      }
                    }
                    _c256 = _q244;
                  }
                  let _c261: boolean = _c256;
                  if (_c261) {
                    let _g257 = 0;
                    G258: {
                      const _a259 = v_G;
                      for (let _i260 = 0; _i260 < _a259.length; _i260++) {
                        const v_x = _a259[_i260];
                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                        _g257++;
                      }
                    }
                    _c261 = (_g257 < v_N);
                  }
                  _c262 = _c261;
                }
                if (!(_c262)) continue;
                _g191 = v_j;
                break G192;
              }
            }
            freshBinding("tooMany", [(v_N === _g186), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (sp.adj4[v_c].includes(v_y)), (far(sp, cl, v_c, v_y) !== -1), (v_r === roomMarked(b, sp, cl, cands, v_c, v_y)), (v_r > 0), sameSet(v_H, run(sp, cl, v_c, v_y)), sameSet(v_G, throughWhere(sp, v_c, (_te190: number): boolean => {  return (((least((cands[_te190] >= 0 ? cands[_te190] : (cands[_te190] = b.cands[_te190]))) - 1) > 0) || (v_H.includes(_te190))); })), (v_t === hasMarked(b, sp, cl, cands, v_c, v_y)), (v_k === _g191), (v_k > 0)], ["N =", "c in", "where of c", "y in", "where of y", "r =", "where of r", "H =", "G =", "t =", "k =", "where of k"]);
          }
          facts.length = 0;
          changed = false;
          let _q263 = true;
          Q264: {
            const _a265 = v_H;
            for (let _i266 = 0; _i266 < _a265.length; _i266++) {
              const v_e = _a265[_i266];
              for (let _m267 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m267 !== 0; _m267 &= _m267 - 1) {
                const v_d = 31 - Math.clz32(_m267 & -_m267);
                if (!((v_d > v_k))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q263 = false;
                  break Q264;
                }
              }
            }
          }
          if (!(_q263)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              let _q268 = true;
              Q269: {
                const _a270 = v_G;
                for (let _i271 = 0; _i271 < _a270.length; _i271++) {
                  const v_x = _a270[_i271];
                  const _h272 = clueAt(cl.number, v_x);
                  if (!((_h272 !== -1))) continue;
                  const _a273 = sp.adj4[v_x];
                  for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                    const v_z = _a273[_i274];
                    if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                    if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                      _q268 = false;
                      break Q269;
                    }
                  }
                }
              }
              let _c288: boolean = _q268;
              if (_c288) {
                let _q275 = true;
                Q276: {
                  const _a277 = v_G;
                  for (let _i278 = 0; _i278 < _a277.length; _i278++) {
                    const v_x = _a277[_i278];
                    const _h279 = clueAt(cl.number, v_x);
                    if (!((_h279 !== -1))) continue;
                    let _g280 = 0;
                    G281: {
                      const _a282 = sp.adj4[v_x];
                      for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                        const v_y = _a282[_i283];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g284 = 0;
                        G285: {
                          const _t286 = sp.adj4Edges[v_x][_i283];
                          for (let _i287 = 0; _i287 < 1; _i287++) {
                            const v_z = _t286;
                            if (!((v_H.includes(v_z)))) continue;
                            _g284 += (v_k - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g280 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g284);
                      }
                    }
                    if (!(((_h279 - _g280) === 0))) {
                      _q275 = false;
                      break Q276;
                    }
                  }
                }
                _c288 = _q275;
              }
              let _c294: boolean = _c288;
              if (_c294) {
                let _g289 = 0;
                G290: {
                  const _a291 = v_G;
                  for (let _i292 = 0; _i292 < _a291.length; _i292++) {
                    const v_x = _a291[_i292];
                    const _h293 = clueAt(cl.number, v_x);
                    if (!((_h293 !== -1))) continue;
                    _g289++;
                  }
                }
                _c294 = (_g289 < v_N);
              }
              let _arm = -1;
              if (_c294) _arm = 0; else if (true) _arm = 1;
              let _says: TooManySays | null = null;
              if (_arm === 0) {
                _g295.length = 0;
                tooMany_st301.pass++;
                G296: {
                  const _a302 = v_G;
                  for (let _i303 = 0; _i303 < _a302.length; _i303++) {
                    const v_c = _a302[_i303];
                    const _h304 = clueAt(cl.number, v_c);
                    if (!((_h304 !== -1))) continue;
                    const _a305 = sp.adj4[v_c];
                    for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                      const v_y = _a305[_i306];
                      if (!((((far(sp, cl, v_c, v_y) !== -1) && (v_G.includes(far(sp, cl, v_c, v_y)))) && (hasMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
                      const _t307 = sp.adj4Edges[v_c][_i306];
                      const _t308 = _t307;
                      if (_g295.length < 16) { if (!_g295.includes(_t308)) _g295.push(_t308); } else addOnce(_g295, tooMany_st301, _t308);
                    }
                  }
                }
                _g309.length = 0;
                G310: {
                  const _a313 = v_G;
                  for (let _i314 = 0; _i314 < _a313.length; _i314++) {
                    const v_x = _a313[_i314];
                    const _h315 = clueAt(cl.number, v_x);
                    if (!((_h315 !== -1))) continue;
                    _g309.push(v_x);
                  }
                }
                _says = { arm: "sealed", terms: { at: v_c, clue: _h99, limit: (v_k - 1), links: _g295.slice() }, marks: { reads: setOf(v_c).slice(), outline: _g309.slice() } };
              }
              if (_arm === 1) {
                _g316.length = 0;
                G317: {
                  const _a360 = near(sp, cl, v_c, v_y);
                  for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                    const v_x = _a360[_i361];
                    const _h362 = clueAt(cl.number, v_x);
                    const _h387 = (v_x % sp.w);
                    let _g363 = 0;
                    G364: {
                      const _a365 = sp.adj4[v_x];
                      for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                        const v_y = _a365[_i366];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g367 = 0;
                        G368: {
                          const _t369 = sp.adj4Edges[v_x][_i366];
                          for (let _i370 = 0; _i370 < 1; _i370++) {
                            const v_z = _t369;
                            if (!((v_H.includes(v_z)))) continue;
                            _g367 += (v_k - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g363 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g367);
                      }
                    }
                    let _c407: boolean = ((_h362 - _g363) < 0);
                    if (!_c407) {
                      let _g371 = 0;
                      G372: {
                        const _a373 = sp.adj4[v_x];
                        for (let _i374 = 0; _i374 < _a373.length; _i374++) {
                          const v_y = _a373[_i374];
                          if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                          const _h386 = (v_y % sp.w);
                          const _h388 = (_h386 === _h387);
                          const _h403 = sp.adj4Edges[v_x][_i374];
                          let _g375 = -1;
                          G376: {
                            const _t378 = cl.maxb;
                            for (let v_k_377 = _t378; v_k_377 >= 0; v_k_377--) {
                              let _c406: boolean = (v_k_377 === 0);
                              if (!_c406) {
                                let _q379 = false;
                                Q380: {
                                  const _a381 = mid(sp, cl, v_x, v_y);
                                  for (let _i382 = 0; _i382 < _a381.length; _i382++) {
                                    const v_m = _a381[_i382];
                                    const _h385 = (v_m % sp.w);
                                    const _a383 = sp.adj4[v_m];
                                    for (let _i384 = 0; _i384 < _a383.length; _i384++) {
                                      const v_p = _a383[_i384];
                                      if (!((((v_p % sp.w) === _h385) !== _h388))) continue;
                                      const _t389 = sp.adj4Edges[v_m][_i384];
                                      if ((((least((cands[_t389] >= 0 ? cands[_t389] : (cands[_t389] = b.cands[_t389]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i384])))) {
                                        _q379 = true;
                                        break Q380;
                                      }
                                    }
                                  }
                                }
                                let _c400: boolean = !(_q379);
                                if (_c400) {
                                  const _t390 = far(sp, cl, v_x, v_y);
                                  const _h391 = clueAt(cl.number, _t390);
                                  let _g392 = 0;
                                  G393: {
                                    const _a394 = sp.adj4[_t390];
                                    for (let _i395 = 0; _i395 < _a394.length; _i395++) {
                                      const v_y = _a394[_i395];
                                      if (!((far(sp, cl, _t390, v_y) !== -1))) continue;
                                      let _g396 = 0;
                                      G397: {
                                        const _t398 = sp.adj4Edges[_t390][_i395];
                                        for (let _i399 = 0; _i399 < 1; _i399++) {
                                          const v_z = _t398;
                                          if (!((v_H.includes(v_z)))) continue;
                                          _g396 += (v_k - hasMarked(b, sp, cl, cands, _t390, v_y));
                                        }
                                      }
                                      _g392 += (hasMarked(b, sp, cl, cands, _t390, v_y) + _g396);
                                    }
                                  }
                                  _c400 = (v_k_377 <= (_h391 - _g392));
                                }
                                let _c405: boolean = _c400;
                                if (_c405) {
                                  let _g401 = 0;
                                  G402: {
                                    for (let _i404 = 0; _i404 < 1; _i404++) {
                                      const v_z = _h403;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g401 += (v_k - hasMarked(b, sp, cl, cands, v_x, v_y));
                                    }
                                  }
                                  _c405 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g401) + v_k_377) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                                }
                                _c406 = _c405;
                              }
                              if (!(_c406)) continue;
                              _g375 = v_k_377;
                              break G376;
                            }
                          }
                          _g371 += _g375;
                        }
                      }
                      _c407 = (_g371 < (_h362 - _g363));
                    }
                    if (!(_c407)) continue;
                    _g316.push(v_x);
                  }
                }
                _g408.length = 0;
                G409: {
                  const _a452 = near(sp, cl, v_c, v_y);
                  for (let _i453 = 0; _i453 < _a452.length; _i453++) {
                    const v_x = _a452[_i453];
                    const _h454 = clueAt(cl.number, v_x);
                    const _h479 = (v_x % sp.w);
                    let _g455 = 0;
                    G456: {
                      const _a457 = sp.adj4[v_x];
                      for (let _i458 = 0; _i458 < _a457.length; _i458++) {
                        const v_y = _a457[_i458];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g459 = 0;
                        G460: {
                          const _t461 = sp.adj4Edges[v_x][_i458];
                          for (let _i462 = 0; _i462 < 1; _i462++) {
                            const v_z = _t461;
                            if (!((v_H.includes(v_z)))) continue;
                            _g459 += (v_k - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g455 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g459);
                      }
                    }
                    let _c499: boolean = ((_h454 - _g455) < 0);
                    if (!_c499) {
                      let _g463 = 0;
                      G464: {
                        const _a465 = sp.adj4[v_x];
                        for (let _i466 = 0; _i466 < _a465.length; _i466++) {
                          const v_y = _a465[_i466];
                          if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                          const _h478 = (v_y % sp.w);
                          const _h480 = (_h478 === _h479);
                          const _h495 = sp.adj4Edges[v_x][_i466];
                          let _g467 = -1;
                          G468: {
                            const _t470 = cl.maxb;
                            for (let v_k_469 = _t470; v_k_469 >= 0; v_k_469--) {
                              let _c498: boolean = (v_k_469 === 0);
                              if (!_c498) {
                                let _q471 = false;
                                Q472: {
                                  const _a473 = mid(sp, cl, v_x, v_y);
                                  for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                                    const v_m = _a473[_i474];
                                    const _h477 = (v_m % sp.w);
                                    const _a475 = sp.adj4[v_m];
                                    for (let _i476 = 0; _i476 < _a475.length; _i476++) {
                                      const v_p = _a475[_i476];
                                      if (!((((v_p % sp.w) === _h477) !== _h480))) continue;
                                      const _t481 = sp.adj4Edges[v_m][_i476];
                                      if ((((least((cands[_t481] >= 0 ? cands[_t481] : (cands[_t481] = b.cands[_t481]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i476])))) {
                                        _q471 = true;
                                        break Q472;
                                      }
                                    }
                                  }
                                }
                                let _c492: boolean = !(_q471);
                                if (_c492) {
                                  const _t482 = far(sp, cl, v_x, v_y);
                                  const _h483 = clueAt(cl.number, _t482);
                                  let _g484 = 0;
                                  G485: {
                                    const _a486 = sp.adj4[_t482];
                                    for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                                      const v_y = _a486[_i487];
                                      if (!((far(sp, cl, _t482, v_y) !== -1))) continue;
                                      let _g488 = 0;
                                      G489: {
                                        const _t490 = sp.adj4Edges[_t482][_i487];
                                        for (let _i491 = 0; _i491 < 1; _i491++) {
                                          const v_z = _t490;
                                          if (!((v_H.includes(v_z)))) continue;
                                          _g488 += (v_k - hasMarked(b, sp, cl, cands, _t482, v_y));
                                        }
                                      }
                                      _g484 += (hasMarked(b, sp, cl, cands, _t482, v_y) + _g488);
                                    }
                                  }
                                  _c492 = (v_k_469 <= (_h483 - _g484));
                                }
                                let _c497: boolean = _c492;
                                if (_c497) {
                                  let _g493 = 0;
                                  G494: {
                                    for (let _i496 = 0; _i496 < 1; _i496++) {
                                      const v_z = _h495;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g493 += (v_k - hasMarked(b, sp, cl, cands, v_x, v_y));
                                    }
                                  }
                                  _c497 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g493) + v_k_469) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                                }
                                _c498 = _c497;
                              }
                              if (!(_c498)) continue;
                              _g467 = v_k_469;
                              break G468;
                            }
                          }
                          _g463 += _g467;
                        }
                      }
                      _c499 = (_g463 < (_h454 - _g455));
                    }
                    if (!(_c499)) continue;
                    _g408.push(v_x);
                  }
                }
                _says = { arm: "starved", terms: { at: v_c, clue: _h99, limit: (v_k - 1), starved: (_g316.length > 0 ? _g316[0] : -1) }, marks: { reads: setOf(v_c).slice(), outline: setOf((_g408.length > 0 ? _g408[0] : -1)).slice() } };
              }
              if (_says === null) throw new Error("tooMany: no arm of says holds");
              if (!fire({ N: v_N, c: v_c, y: v_y, r: v_r, H: v_H.slice(), G: v_G.slice(), t: v_t, k: v_k }, facts, _says)) return 1;
            }
            cands.fill(-1);
            needMarkedKept.clear();
            bridgesMarkedKept.clear();
            hasMarkedKept.clear();
            roomMarkedKept.clear();
            moreMarkedKept.clear();
            openMarkedKept.clear();
            crossedMarkedKept.clear();
            capMarkedKept.clear();
            allowsMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface MustReachOutBinding {
  N: number;
  c: number;
  y: number;
  F: readonly number[];
  G: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface MustReachOutSays {
  terms: { at: number; clue: number; links: readonly number[]; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
}

const mustReachOutFacts: number[] = [];
let mustReachOutCands = new Int32Array(0);
const mustReachOut_st67 = stamps();
const mustReachOut_st148 = stamps();

/** Its dearest read grows with the board as n^2. */
export function mustReachOut(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustReachOutBinding, MustReachOutSays> | null): number {
  const _g61: number[] = [];
  const _g142: number[] = [];
  const _g156: number[] = [];
  const facts = mustReachOutFacts;
  let fired = 0;
  let changed = false;
  if (mustReachOutCands.length < sp.edges.length) mustReachOutCands = new Int32Array(sp.edges.length);
  const cands = mustReachOutCands;
  cands.fill(-1);
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  hasMarkedKept.clear();
  roomMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  let _g46 = 0;
  G47: {
    const _a48 = sp.cells;
    for (let _i49 = 0; _i49 < _a48.length; _i49++) {
      const v_x = _a48[_i49];
      const _h50 = clueAt(cl.number, v_x);
      if (!((_h50 !== -1))) continue;
      _g46++;
    }
  }
  const v_N = _g46;
  const _a51 = sp.cells;
  R1:
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_c = _a51[_i52];
    const _m163_0 = b.made[0];
    const _m164_1 = b.made[1];
    const _h53 = clueAt(cl.number, v_c);
    if (!(((_h53 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a54 = sp.adj4[v_c];
    for (let _i55 = 0; _i55 < _a54.length; _i55++) {
      const v_y = _a54[_i55];
      let _c60: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
      if (_c60) {
        let _g56 = 0;
        G57: {
          const _a58 = sp.adj4[v_c];
          for (let _i59 = 0; _i59 < _a58.length; _i59++) {
            const v_z = _a58[_i59];
            if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
            _g56 += roomMarked(b, sp, cl, cands, v_c, v_z);
          }
        }
        _c60 = (_g56 === needMarked(b, sp, cl, cands, v_c));
      }
      if (!(_c60)) continue;
      _g61.length = 0;
      mustReachOut_st67.pass++;
      G62: {
        const _a68 = sp.adj4[v_c];
        for (let _i69 = 0; _i69 < _a68.length; _i69++) {
          const v_z = _a68[_i69];
          if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
          const _a70 = run(sp, cl, v_c, v_z);
          for (let _i71 = 0; _i71 < _a70.length; _i71++) {
            const v_e = _a70[_i71];
            const _t72 = v_e;
            if (_g61.length < 16) { if (!_g61.includes(_t72)) _g61.push(_t72); } else addOnce(_g61, mustReachOut_st67, _t72);
          }
        }
      }
      const v_F = _g61;
      L74: {
        const v_G = throughWhere(sp, v_c, (_te73: number): boolean => {  return (((least((cands[_te73] >= 0 ? cands[_te73] : (cands[_te73] = b.cands[_te73]))) - 1) > 0) || (v_F.includes(_te73))); });
        let _q75 = true;
        Q76: {
          const _a77 = v_G;
          for (let _i78 = 0; _i78 < _a77.length; _i78++) {
            const v_x = _a77[_i78];
            const _h79 = clueAt(cl.number, v_x);
            if (!((_h79 !== -1))) continue;
            const _a80 = sp.adj4[v_x];
            for (let _i81 = 0; _i81 < _a80.length; _i81++) {
              const v_z = _a80[_i81];
              if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
              if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                _q75 = false;
                break Q76;
              }
            }
          }
        }
        let _c91: boolean = _q75;
        if (_c91) {
          let _q82 = true;
          Q83: {
            const _a84 = v_G;
            for (let _i85 = 0; _i85 < _a84.length; _i85++) {
              const v_x = _a84[_i85];
              const _h86 = clueAt(cl.number, v_x);
              if (!(((_h86 !== -1) && (v_x !== v_c)))) continue;
              let _g87 = 0;
              G88: {
                const _a89 = sp.adj4[v_c];
                for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                  const v_z = _a89[_i90];
                  if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                  _g87 += roomMarked(b, sp, cl, cands, v_c, v_z);
                }
              }
              if (!((needMarked(b, sp, cl, cands, v_x) === _g87))) {
                _q82 = false;
                break Q83;
              }
            }
          }
          _c91 = _q82;
        }
        let _c97: boolean = _c91;
        if (_c97) {
          let _g92 = 0;
          G93: {
            const _a94 = v_G;
            for (let _i95 = 0; _i95 < _a94.length; _i95++) {
              const v_x = _a94[_i95];
              const _h96 = clueAt(cl.number, v_x);
              if (!((_h96 !== -1))) continue;
              _g92++;
            }
          }
          _c97 = (_g92 < v_N);
        }
        if (!(_c97)) break L74;
        if (b.made[0] !== _m163_0 || b.made[1] !== _m164_1) {
          if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        }
        if (DEV && staleChecking) {
          let _g98 = 0;
          G99: {
            const _a100 = sp.cells;
            for (let _i101 = 0; _i101 < _a100.length; _i101++) {
              const v_x = _a100[_i101];
              if (!((clueAt(cl.number, v_x) !== -1))) continue;
              _g98++;
            }
          }
          let _c106: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
          if (_c106) {
            let _g102 = 0;
            G103: {
              const _a104 = sp.adj4[v_c];
              for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                const v_z = _a104[_i105];
                if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
                _g102 += roomMarked(b, sp, cl, cands, v_c, v_z);
              }
            }
            _c106 = (_g102 === needMarked(b, sp, cl, cands, v_c));
          }
          const _g107: number[] = [];
          G108: {
            const _a113 = sp.adj4[v_c];
            for (let _i114 = 0; _i114 < _a113.length; _i114++) {
              const v_z = _a113[_i114];
              if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
              const _a115 = run(sp, cl, v_c, v_z);
              for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                const v_e = _a115[_i116];
                if (!_g107.includes(v_e)) _g107.push(v_e);
              }
            }
          }
          let _q118 = true;
          Q119: {
            const _a120 = v_G;
            for (let _i121 = 0; _i121 < _a120.length; _i121++) {
              const v_x = _a120[_i121];
              if (!((clueAt(cl.number, v_x) !== -1))) continue;
              const _a122 = sp.adj4[v_x];
              for (let _i123 = 0; _i123 < _a122.length; _i123++) {
                const v_z = _a122[_i123];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q118 = false;
                  break Q119;
                }
              }
            }
          }
          let _c132: boolean = _q118;
          if (_c132) {
            let _q124 = true;
            Q125: {
              const _a126 = v_G;
              for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                const v_x = _a126[_i127];
                if (!(((clueAt(cl.number, v_x) !== -1) && (v_x !== v_c)))) continue;
                let _g128 = 0;
                G129: {
                  const _a130 = sp.adj4[v_c];
                  for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                    const v_z = _a130[_i131];
                    if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                    _g128 += roomMarked(b, sp, cl, cands, v_c, v_z);
                  }
                }
                if (!((needMarked(b, sp, cl, cands, v_x) === _g128))) {
                  _q124 = false;
                  break Q125;
                }
              }
            }
            _c132 = _q124;
          }
          let _c137: boolean = _c132;
          if (_c137) {
            let _g133 = 0;
            G134: {
              const _a135 = v_G;
              for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                const v_x = _a135[_i136];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g133++;
              }
            }
            _c137 = (_g133 < v_N);
          }
          freshBinding("mustReachOut", [(v_N === _g98), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (sp.adj4[v_c].includes(v_y)), _c106, sameSet(v_F, _g107), sameSet(v_G, throughWhere(sp, v_c, (_te117: number): boolean => {  return (((least((cands[_te117] >= 0 ? cands[_te117] : (cands[_te117] = b.cands[_te117]))) - 1) > 0) || (v_F.includes(_te117))); })), _c137], ["N =", "c in", "where of c", "y in", "where of y", "F =", "G =", "where of G"]);
        }
        facts.length = 0;
        changed = false;
        let _q138 = true;
        Q139: {
          const _a140 = run(sp, cl, v_c, v_y);
          for (let _i141 = 0; _i141 < _a140.length; _i141++) {
            const v_e = _a140[_i141];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q138 = false;
              break Q139;
            }
          }
        }
        if (!(_q138)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            _g142.length = 0;
            mustReachOut_st148.pass++;
            G143: {
              const _a149 = v_G;
              for (let _i150 = 0; _i150 < _a149.length; _i150++) {
                const v_c = _a149[_i150];
                const _h151 = clueAt(cl.number, v_c);
                if (!((_h151 !== -1))) continue;
                const _a152 = sp.adj4[v_c];
                for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                  const v_y = _a152[_i153];
                  if (!((((far(sp, cl, v_c, v_y) !== -1) && (v_G.includes(far(sp, cl, v_c, v_y)))) && (hasMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
                  const _t154 = sp.adj4Edges[v_c][_i153];
                  const _t155 = _t154;
                  if (_g142.length < 16) { if (!_g142.includes(_t155)) _g142.push(_t155); } else addOnce(_g142, mustReachOut_st148, _t155);
                }
              }
            }
            _g156.length = 0;
            G157: {
              const _a160 = v_G;
              for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                const v_x = _a160[_i161];
                const _h162 = clueAt(cl.number, v_x);
                if (!((_h162 !== -1))) continue;
                _g156.push(v_x);
              }
            }
            const _says = { terms: { at: v_c, clue: _h53, links: _g142.slice() }, marks: { reads: setOf(v_c).slice(), outline: _g156.slice() } };
            if (!fire({ N: v_N, c: v_c, y: v_y, F: v_F.slice(), G: v_G.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          needMarkedKept.clear();
          bridgesMarkedKept.clear();
          hasMarkedKept.clear();
          roomMarkedKept.clear();
          moreMarkedKept.clear();
          openMarkedKept.clear();
          crossedMarkedKept.clear();
          capMarkedKept.clear();
          allowsMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface LoopBinding {
  L: readonly number[];
  c: number;
  y: number;
  f: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LoopSays {
  terms: { at: number; links: readonly number[]; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
}

const loopFacts: number[] = [];
let loopCands = new Int32Array(0);
const loop_st49 = stamps();

/** Its dearest read grows with the board as n. */
export function loop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopBinding, LoopSays> | null): number {
  const _g12: number[] = [];
  const _g25: number[] = [];
  const _g43: number[] = [];
  const _g58: number[] = [];
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  if (loopCands.length < sp.edges.length) loopCands = new Int32Array(sp.edges.length);
  const cands = loopCands;
  cands.fill(-1);
  hasMarkedKept.clear();
  moreMarkedKept.clear();
  openMarkedKept.clear();
  needMarkedKept.clear();
  bridgesMarkedKept.clear();
  crossedMarkedKept.clear();
  capMarkedKept.clear();
  allowsMarkedKept.clear();
  const _m65_1 = b.made[1];
  _g12.length = 0;
  G13: {
    const _a16 = sp.edges;
    for (let _i17 = 0; _i17 < _a16.length; _i17++) {
      const v_e = _a16[_i17];
      if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
      _g12.push(v_e);
    }
  }
  const v_L = _g12;
  const _eg24 = edgeGroups(sp, v_L);
  const _a18 = sp.cells;
  for (let _i19 = 0; _i19 < _a18.length; _i19++) {
    const v_c = _a18[_i19];
    const _h20 = clueAt(cl.number, v_c);
    if (!((_h20 !== -1))) continue;
    const _a21 = sp.adj4[v_c];
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_y = _a21[_i22];
      L23: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (_eg24.of(v_f) === _eg24.of(v_c))))) break L23;
        if (b.made[1] !== _m65_1) {
          _g25.length = 0;
          G26: {
            const _a29 = sp.edges;
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_e = _a29[_i30];
              if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
              _g25.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g25))) { return fired; }
        }
        if (DEV && staleChecking) {
          const _g31: number[] = [];
          G32: {
            const _a35 = sp.edges;
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const v_e = _a35[_i36];
              if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
              _g31.push(v_e);
            }
          }
          freshBinding("loop", [sameSet(v_L, _g31), (sp.cells.includes(v_c)), (clueAt(cl.number, v_c) !== -1), (sp.adj4[v_c].includes(v_y)), (v_f === far(sp, cl, v_c, v_y)), ((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (through(sp, v_c, v_L).includes(v_f)))], ["L =", "c in", "where of c", "y in", "f =", "where of f"]);
        }
        facts.length = 0;
        changed = false;
        let _q37 = true;
        Q38: {
          const _a39 = run(sp, cl, v_c, v_y);
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_e = _a39[_i40];
            for (let _m41 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m41 !== 0; _m41 &= _m41 - 1) {
              const v_d = 31 - Math.clz32(_m41 & -_m41);
              if (!((v_d > 1))) continue;
              if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
              if (!(true)) {
                _q37 = false;
                break Q38;
              }
            }
          }
        }
        if (!(_q37)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _t42 = _eg24.of(v_c);
            _g43.length = 0;
            loop_st49.pass++;
            G44: {
              const _a50 = _t42;
              for (let _i51 = 0; _i51 < _a50.length; _i51++) {
                const v_c = _a50[_i51];
                const _h52 = clueAt(cl.number, v_c);
                if (!((_h52 !== -1))) continue;
                const _a53 = sp.adj4[v_c];
                for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                  const v_y = _a53[_i54];
                  if (!((((far(sp, cl, v_c, v_y) !== -1) && (_t42.includes(far(sp, cl, v_c, v_y)))) && (hasMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
                  const _t55 = sp.adj4Edges[v_c][_i54];
                  const _t56 = _t55;
                  if (_g43.length < 16) { if (!_g43.includes(_t56)) _g43.push(_t56); } else addOnce(_g43, loop_st49, _t56);
                }
              }
            }
            const _t57 = _eg24.of(v_c);
            _g58.length = 0;
            G59: {
              const _a62 = _t57;
              for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                const v_x = _a62[_i63];
                const _h64 = clueAt(cl.number, v_x);
                if (!((_h64 !== -1))) continue;
                _g58.push(v_x);
              }
            }
            const _says = { terms: { at: v_c, links: _g43.slice() }, marks: { reads: setOf(v_c).slice(), outline: _g58.slice() } };
            if (!fire({ L: v_L.slice(), c: v_c, y: v_y, f: v_f }, facts, _says)) return 1;
          }
          cands.fill(-1);
          hasMarkedKept.clear();
          moreMarkedKept.clear();
          openMarkedKept.clear();
          needMarkedKept.clear();
          bridgesMarkedKept.clear();
          crossedMarkedKept.clear();
          capMarkedKept.clear();
          allowsMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

const farKept = keptStore<Kept<number>>();
let farOn: object | null = null;
let farAt: Kept<Kept<number>> = [];

/** `far(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function far(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): number {
  if (cl !== farOn) {
    farAt = farKept.board(cl);
    farOn = cl;
  }
  const _kept: Kept<Kept<number>> = farAt;
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  const _g1: number[] = [];
  G2: {
    const _a5 = ray(sp, v_c, v_y);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      if (!(((clueAt(cl.number, v_x) !== -1) && !((clueAt(cl.number, v_y) !== -1))))) continue;
      _g1.push(v_x);
    }
  }
  const _made = (_g1.length > 0 ? _g1[0] : -1);
  _kept1[v_y] = _made;
  return _made;
}

const midKept = keptStore<Kept<readonly number[]>>();
let midOn: object | null = null;
let midAt: Kept<Kept<readonly number[]>> = [];

/** `mid(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function mid(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  if (cl !== midOn) {
    midAt = midKept.board(cl);
    midOn = cl;
  }
  const _kept: Kept<Kept<readonly number[]>> = midAt;
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  const _g1: number[] = [];
  G2: {
    const _a5 = ray(sp, v_c, v_y);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_x = _a5[_i6];
      if (!((_i6 < ray(sp, v_c, v_y).indexOf(far(sp, cl, v_c, v_y))))) continue;
      _g1.push(v_x);
    }
  }
  const _made = _g1;
  _kept1[v_y] = _made;
  return _made;
}

const endKept = keptStore<Kept<number>>();
let endOn: object | null = null;
let endAt: Kept<Kept<number>> = [];

/** `end(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function end(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): number {
  if (cl !== endOn) {
    endAt = endKept.board(cl);
    endOn = cl;
  }
  const _kept: Kept<Kept<number>> = endAt;
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  let _g1 = -1;
  let _n3 = 0;
  G2: {
    const _a4 = sp.adj4[far(sp, cl, v_c, v_y)];
    for (let _i5 = 0; _i5 < _a4.length; _i5++) {
      const v_x = _a4[_i5];
      if (!(((v_x === v_c) || (mid(sp, cl, v_c, v_y).includes(v_x))))) continue;
      if (++_n3 === 2) {
        _g1 = -1;
        break G2;
      }
      _g1 = v_x;
    }
  }
  const _made = sp.edgeOf(far(sp, cl, v_c, v_y), _g1);
  _kept1[v_y] = _made;
  return _made;
}

const hasMarkedKept = new Map<number, number>();

/** `has(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function hasMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = hasMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g1 = -1;
  G2: {
    const _t3 = sp.edgeOf(v_c, v_y);
    const _t4 = end(sp, cl, v_c, v_y);
    for (let _i5 = 0; _i5 < 2; _i5++) {
      const v_e = _i5 === 0 ? _t3 : _t4;
      if (_i5 === 1 && (v_e === _t3)) continue;
      const _t6 = (least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1);
      if (_g1 === -1 || _t6 > _g1) _g1 = _t6;
    }
  }
  const _made = _g1;
  hasMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const bridgesMarkedKept = new Map<number, number>();

/** `bridges(c)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function bridgesMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number): number {
  const _was = bridgesMarkedKept.get(v_c);
  if (_was !== undefined) return _was;
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_y = _a3[_i4];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      _g1 += hasMarked(b, sp, cl, cands, v_c, v_y);
    }
  }
  const _made = _g1;
  bridgesMarkedKept.set(v_c, _made);
  return _made;
}

const needMarkedKept = new Map<number, number>();

/** `need(c)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function needMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number): number {
  const _was = needMarkedKept.get(v_c);
  if (_was !== undefined) return _was;
  const _made = (clueAt(cl.number, v_c) - bridgesMarked(b, sp, cl, cands, v_c));
  needMarkedKept.set(v_c, _made);
  return _made;
}

const crossedMarkedKept = new Map<number, boolean>();

/** `crossed(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function crossedMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): boolean {
  const _was = crossedMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _q1 = false;
  Q2: {
    const _a3 = mid(sp, cl, v_c, v_y);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_m = _a3[_i4];
      const _a5 = sp.adj4[v_m];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_p = _a5[_i6];
        if (!((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))))) continue;
        const _t7 = sp.adj4Edges[v_m][_i6];
        if (((least((cands[_t7] >= 0 ? cands[_t7] : (cands[_t7] = b.cands[_t7]))) - 1) > 0)) {
          _q1 = true;
          break Q2;
        }
      }
    }
  }
  const _made = _q1;
  crossedMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const openMarkedKept = new Map<number, boolean>();

/** `open(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function openMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): boolean {
  const _was = openMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _c2: boolean = (needMarked(b, sp, cl, cands, v_c) > 0);
  if (_c2) {
    const _t1 = far(sp, cl, v_c, v_y);
    _c2 = (needMarked(b, sp, cl, cands, _t1) > 0);
  }
  const _made = (_c2 && !(crossedMarked(b, sp, cl, cands, v_c, v_y)));
  openMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const allowsMarkedKept = new Map<number, number>();

/** `allows(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function allowsMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = allowsMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g1 = -1;
  G2: {
    const _t3 = sp.edgeOf(v_c, v_y);
    const _t4 = end(sp, cl, v_c, v_y);
    for (let _i5 = 0; _i5 < 2; _i5++) {
      const v_e = _i5 === 0 ? _t3 : _t4;
      if (_i5 === 1 && (v_e === _t3)) continue;
      let _g6 = -1;
      G7: {
        for (let _m8 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m8 !== 0; _m8 &= _m8 - 1) {
          const v_d = 31 - Math.clz32(_m8 & -_m8);
          if (_g6 === -1 || v_d > _g6) _g6 = v_d;
        }
      }
      const _t9 = (_g6 - 1);
      if (_g1 === -1 || _t9 < _g1) _g1 = _t9;
    }
  }
  const _made = _g1;
  allowsMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const capMarkedKept = new Map<number, number>();

/** `cap(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function capMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = capMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g1 = -1;
  G2: {
    const _t3 = cl.maxb;
    for (let v_k = _t3; v_k >= 0; v_k--) {
      if (!(((v_k === 0) || ((((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= allowsMarked(b, sp, cl, cands, v_c, v_y)) && ((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= clueAt(cl.number, v_c))) && ((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= clueAt(cl.number, far(sp, cl, v_c, v_y))))))) continue;
      _g1 = v_k;
      break G2;
    }
  }
  const _made = _g1;
  capMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const moreMarkedKept = new Map<number, number>();

/** `more(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function moreMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = moreMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g1 = 0;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      if (!(openMarked(b, sp, cl, cands, v_c, v_y))) continue;
      _g1 += capMarked(b, sp, cl, cands, v_c, v_y);
    }
  }
  const _made = _g1;
  moreMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const roomMarkedKept = new Map<number, number>();

/** `room(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function roomMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = roomMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g1 = -1;
  G2: {
    const _t3 = moreMarked(b, sp, cl, cands, v_c, v_y);
    for (let v_k = _t3; v_k >= 0; v_k--) {
      if (!((v_k <= needMarked(b, sp, cl, cands, v_c)))) continue;
      _g1 = v_k;
      break G2;
    }
  }
  const _made = _g1;
  roomMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const runKept = keptStore<Kept<readonly number[]>>();
let runOn: object | null = null;
let runAt: Kept<Kept<readonly number[]>> = [];

/** `run(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function run(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  if (cl !== runOn) {
    runAt = runKept.board(cl);
    runOn = cl;
  }
  const _kept: Kept<Kept<readonly number[]>> = runAt;
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  const _g1: number[] = [];
  G2: {
    const _a5 = mid(sp, cl, v_c, v_y);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_m = _a5[_i6];
      const _t7 = sp.edgeOf(v_m, (ray(sp, v_c, v_y)[(ray(sp, v_c, v_y).indexOf(v_m) + 1)] ?? -1));
      if (!_g1.includes(_t7)) _g1.push(_t7);
    }
  }
  const _made = union(setOf(sp.edgeOf(v_c, v_y)), _g1);
  _kept1[v_y] = _made;
  return _made;
}

const mostMarkedKept = new Map<number, number>();

/** `most(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function mostMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = mostMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  const _made = (hasMarked(b, sp, cl, cands, v_c, v_y) + moreMarked(b, sp, cl, cands, v_c, v_y));
  mostMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const nearKept = keptStore<Kept<readonly number[]>>();
let nearOn: object | null = null;
let nearAt: Kept<Kept<readonly number[]>> = [];

/** `near(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  if (cl !== nearOn) {
    nearAt = nearKept.board(cl);
    nearOn = cl;
  }
  const _kept: Kept<Kept<readonly number[]>> = nearAt;
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  const _g1: number[] = [];
  G2: {
    const _t7 = far(sp, cl, v_c, v_y);
    for (let _i8 = 0; _i8 < 2; _i8++) {
      const v_x = _i8 === 0 ? v_c : _t7;
      if (_i8 === 1 && (v_x === v_c)) continue;
      const _a9 = sp.adj4[v_x];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_z = _a9[_i10];
        if (!((far(sp, cl, v_x, v_z) !== -1))) continue;
        const _t11 = far(sp, cl, v_x, v_z);
        if (!_g1.includes(_t11)) _g1.push(_t11);
      }
    }
  }
  const _g12: number[] = [];
  G13: {
    const _a18 = mid(sp, cl, v_c, v_y);
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_m = _a18[_i19];
      const _a20 = sp.adj4[v_m];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_p = _a20[_i21];
        if (!(((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))) && (far(sp, cl, v_m, v_p) !== -1)))) continue;
        const _t22 = far(sp, cl, v_m, v_p);
        if (!_g12.includes(_t22)) _g12.push(_t22);
      }
    }
  }
  const _made = union(union(setOf(v_c), _g1), _g12);
  _kept1[v_y] = _made;
  return _made;
}
