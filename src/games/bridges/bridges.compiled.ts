// Compiled by `npm run describe` from src/games/bridges/bridges.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, least, minus, rangeMask, ray, sameSet, setOf, staleChecking, stamps, through, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g762: number[] = [];
  const _g778: number[] = [];
  const _domain = rangeMask(1, (cl.maxb + 1));
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q711 = true;
  Q712: {
    const _a713 = sp.edges;
    for (let _i714 = 0; _i714 < _a713.length; _i714++) {
      const v_e = _a713[_i714];
      const _t715 = sp.edgeEnds[2 * v_e];
      const _h716 = clueAt(cl.number, _t715);
      let _c719: boolean = (_h716 !== -1);
      if (_c719) {
        const _t717 = sp.edgeEnds[2 * v_e + 1];
        const _h718 = clueAt(cl.number, _t717);
        _c719 = (_h718 !== -1);
      }
      if (!(_c719)) continue;
      const _h720 = (g[v_e] || -1);
      if (!((_h720 === 1))) {
        _q711 = false;
        break Q712;
      }
    }
  }
  if (!(_q711)) return false;
  let _q721 = true;
  Q722: {
    const _a723 = sp.cells;
    for (let _i724 = 0; _i724 < _a723.length; _i724++) {
      const v_c = _a723[_i724];
      const _h725 = clueAt(cl.number, v_c);
      if (!(!((_h725 !== -1)))) continue;
      const _h734 = (v_c % sp.w);
      const _h735 = (2 * _h734);
      const _h737 = ((v_c / sp.w) | 0);
      const _h738 = (2 * _h737);
      const _a726 = sp.adj4[v_c];
      for (let _i727 = 0; _i727 < _a726.length; _i727++) {
        const v_a = _a726[_i727];
        const _h728 = (g[sp.adj4Edges[v_c][_i727]] || -1);
        const _h733 = (v_a % sp.w);
        const _h736 = ((v_a / sp.w) | 0);
        const _h740 = sp.adj4Edges[v_c][_i727];
        const _h741 = (g[_h740] || -1);
        let _c742: boolean = (_h728 === 1);
        if (!_c742) {
          let _q729 = false;
          Q730: {
            const _a731 = sp.adj4[v_c];
            for (let _i732 = 0; _i732 < _a731.length; _i732++) {
              const v_b = _a731[_i732];
              if (!((((_h733 + (v_b % sp.w)) === _h735) && ((_h736 + ((v_b / sp.w) | 0)) === _h738)))) continue;
              const _h739 = (g[sp.adj4Edges[v_c][_i732]] || -1);
              if ((_h739 === _h741)) {
                _q729 = true;
                break Q730;
              }
            }
          }
          _c742 = _q729;
        }
        if (!(_c742)) {
          _q721 = false;
          break Q722;
        }
      }
    }
  }
  if (!(_q721)) return false;
  let _q743 = true;
  Q744: {
    const _a745 = sp.cells;
    for (let _i746 = 0; _i746 < _a745.length; _i746++) {
      const v_c = _a745[_i746];
      const _h747 = clueAt(cl.number, v_c);
      if (!(!((_h747 !== -1)))) continue;
      const _h753 = (v_c % sp.w);
      const _h755 = ((v_c / sp.w) | 0);
      const _a748 = sp.adj4[v_c];
      for (let _i749 = 0; _i749 < _a748.length; _i749++) {
        const v_a = _a748[_i749];
        const _h752 = (v_a % sp.w);
        const _h754 = (_h752 === _h753);
        const _h756 = sp.adj4Edges[v_c][_i749];
        const _h757 = (g[_h756] || -1);
        const _h758 = (_h757 === 1);
        const _a750 = sp.adj4[v_c];
        for (let _i751 = 0; _i751 < _a750.length; _i751++) {
          const v_b = _a750[_i751];
          if (!((_h754 && (((v_b / sp.w) | 0) === _h755)))) continue;
          const _h759 = (g[sp.adj4Edges[v_c][_i751]] || -1);
          if (!((_h758 || (_h759 === 1)))) {
            _q743 = false;
            break Q744;
          }
        }
      }
    }
  }
  if (!(_q743)) return false;
  let _q760 = true;
  Q761: {
    _g762.length = 0;
    G763: {
      const _a766 = sp.edges;
      for (let _i767 = 0; _i767 < _a766.length; _i767++) {
        const v_e = _a766[_i767];
        const _h768 = (g[v_e] || -1);
        if (!((_h768 > 1))) continue;
        _g762.push(v_e);
      }
    }
    const v_L = _g762;
    const _eg775 = edgeGroups(sp, v_L);
    const _a769 = sp.cells;
    for (let _i770 = 0; _i770 < _a769.length; _i770++) {
      const v_a = _a769[_i770];
      const _h771 = clueAt(cl.number, v_a);
      if (!((_h771 !== -1))) continue;
      const _a772 = sp.cells;
      for (let _i773 = 0; _i773 < _a772.length; _i773++) {
        const v_b = _a772[_i773];
        const _h774 = clueAt(cl.number, v_b);
        if (!((_h774 !== -1))) continue;
        if (!((_eg775.of(v_b) === _eg775.of(v_a)))) {
          _q760 = false;
          break Q761;
        }
      }
    }
  }
  if (!(_q760)) return false;
  if (variations.includes("no loops")) {
    let _q776 = true;
    Q777: {
      _g778.length = 0;
      G779: {
        const _a782 = sp.edges;
        for (let _i783 = 0; _i783 < _a782.length; _i783++) {
          const v_e = _a782[_i783];
          const _h784 = (g[v_e] || -1);
          if (!((_h784 > 1))) continue;
          _g778.push(v_e);
        }
      }
      const v_L = _g778;
      const _a785 = v_L;
      for (let _i786 = 0; _i786 < _a785.length; _i786++) {
        const v_e = _a785[_i786];
        if (!(!(through(sp, sp.edgeEnds[2 * v_e], minus(v_L, setOf(v_e))).includes(sp.edgeEnds[2 * v_e + 1])))) {
          _q776 = false;
          break Q777;
        }
      }
    }
    if (!(_q776)) return false;
  }
  for (let _k787 = 0; _k787 < cl.number.at.length; _k787++) {
    const _at788 = cl.number.at[_k787];
    let _g790 = 0;
    G791: {
      const _a792 = sp.adj4[_at788];
      for (let _i793 = 0; _i793 < _a792.length; _i793++) {
        _g790 += ((g[sp.adj4Edges[_at788][_i793]] || -1) - 1);
      }
    }
    if (!((_g790 === clueAt(cl.number, _at788)))) return false;
  }
  return true;
}

export interface ExactSpaceBinding {
  c: number;
  n: number;
  R: number;
}

const exactSpaceFacts: number[] = [];
let exactSpaceCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function exactSpace(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExactSpaceBinding> | null): number {
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
  const _a63 = sp.cells;
  for (let _i64 = 0; _i64 < _a63.length; _i64++) {
    const v_c = _a63[_i64];
    const _h65 = clueAt(cl.number, v_c);
    if (!((_h65 !== -1))) continue;
    L66: {
      const v_n = needMarked(b, sp, cl, cands, v_c);
      if (!((v_n !== 0))) break L66;
      let _g67 = 0;
      G68: {
        const _a69 = sp.adj4[v_c];
        for (let _i70 = 0; _i70 < _a69.length; _i70++) {
          const v_y = _a69[_i70];
          if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
          _g67 += roomMarked(b, sp, cl, cands, v_c, v_y);
        }
      }
      L71: {
        const v_R = _g67;
        if (!(((v_n < 0) || (v_R <= v_n)))) break L71;
        if (import.meta.env.DEV && staleChecking) {
          let _g72 = 0;
          G73: {
            const _a74 = sp.adj4[v_c];
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_y = _a74[_i75];
              if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
              _g72 += roomMarked(b, sp, cl, cands, v_c, v_y);
            }
          }
          freshBinding("exactSpace", [(sp.cells.includes(v_c)), (clueAt(cl.number, v_c) !== -1), (v_n === needMarked(b, sp, cl, cands, v_c)), (v_n !== 0), (v_R === _g72), ((v_n < 0) || (v_R <= v_n))], ["c in", "where of c", "n =", "where of n", "R =", "where of R"]);
        }
        facts.length = 0;
        changed = false;
        let _c90: boolean = ((v_n >= 0) && (v_R === v_n));
        if (_c90) {
          let _q76 = true;
          Q77: {
            const _a78 = sp.adj4[v_c];
            for (let _i79 = 0; _i79 < _a78.length; _i79++) {
              const v_y = _a78[_i79];
              if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
              const v_t = (hasMarked(b, sp, cl, cands, v_c, v_y) + roomMarked(b, sp, cl, cands, v_c, v_y));
              const _a87 = run(sp, cl, v_c, v_y);
              for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                const v_e = _a87[_i88];
                for (let _m89 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m89 !== 0; _m89 &= _m89 - 1) {
                  const v_d = 31 - Math.clz32(_m89 & -_m89);
                  if (!((v_d <= v_t))) continue;
                  if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                  if (!(true)) {
                    _q76 = false;
                    break Q77;
                  }
                }
              }
            }
          }
          _c90 = _q76;
        }
        if (!(_c90)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, n: v_n, R: v_R }, facts)) return 1;
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

const everyNeighborFacts: number[] = [];
let everyNeighborCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function everyNeighbor(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EveryNeighborBinding> | null): number {
  const _g103: number[] = [];
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
  const _a100 = sp.cells;
  for (let _i101 = 0; _i101 < _a100.length; _i101++) {
    const v_c = _a100[_i101];
    const _h102 = clueAt(cl.number, v_c);
    if (!(((_h102 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    _g103.length = 0;
    G104: {
      const _a107 = sp.adj4[v_c];
      for (let _i108 = 0; _i108 < _a107.length; _i108++) {
        const v_y = _a107[_i108];
        if (!(((far(sp, cl, v_c, v_y) !== -1) && (mostMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
        _g103.push(v_y);
      }
    }
    L109: {
      const v_A = _g103;
      const _h110 = v_A.length;
      if (!((_h102 > ((_h110 - 1) * cl.maxb)))) break L109;
      if (import.meta.env.DEV && staleChecking) {
        const _g111: number[] = [];
        G112: {
          const _a115 = sp.adj4[v_c];
          for (let _i116 = 0; _i116 < _a115.length; _i116++) {
            const v_y = _a115[_i116];
            if (!(((far(sp, cl, v_c, v_y) !== -1) && (mostMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
            _g111.push(v_y);
          }
        }
        freshBinding("everyNeighbor", [(sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), sameSet(v_A, _g111), (clueAt(cl.number, v_c) > ((v_A.length - 1) * cl.maxb))], ["c in", "where of c", "A =", "where of A"]);
      }
      facts.length = 0;
      changed = false;
      let _q117 = true;
      Q118: {
        const _a119 = v_A;
        for (let _i120 = 0; _i120 < _a119.length; _i120++) {
          const v_y = _a119[_i120];
          if (!((hasMarked(b, sp, cl, cands, v_c, v_y) === 0))) continue;
          const _a121 = run(sp, cl, v_c, v_y);
          for (let _i122 = 0; _i122 < _a121.length; _i122++) {
            const v_e = _a121[_i122];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q117 = false;
              break Q118;
            }
          }
        }
      }
      if (!(_q117)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, A: v_A.slice() }, facts)) return 1;
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

const needsThisWayFacts: number[] = [];
let needsThisWayCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function needsThisWay(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NeedsThisWayBinding> | null): number {
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
  const _a131 = sp.cells;
  R1:
  for (let _i132 = 0; _i132 < _a131.length; _i132++) {
    const v_c = _a131[_i132];
    const _m50_0 = b.made[0];
    const _m50_1 = b.made[1];
    const _h133 = clueAt(cl.number, v_c);
    if (!(((_h133 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    let _g134 = 0;
    G135: {
      const _a136 = sp.adj4[v_c];
      for (let _i137 = 0; _i137 < _a136.length; _i137++) {
        const v_y = _a136[_i137];
        if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
        _g134 += mostMarked(b, sp, cl, cands, v_c, v_y);
      }
    }
    const v_V = _g134;
    const _a138 = sp.adj4[v_c];
    for (let _i139 = 0; _i139 < _a138.length; _i139++) {
      const v_y = _a138[_i139];
      if (!(((((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && ((v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) < _h133)))) continue;
      if (b.made[0] !== _m50_0 || b.made[1] !== _m50_1) {
        if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        let _g140 = 0;
        G141: {
          const _a142 = sp.adj4[v_c];
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_y = _a142[_i143];
            if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
            _g140 += mostMarked(b, sp, cl, cands, v_c, v_y);
          }
        }
        if (!((v_V === _g140))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _g144 = 0;
        G145: {
          const _a146 = sp.adj4[v_c];
          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
            const v_y = _a146[_i147];
            if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
            _g144 += mostMarked(b, sp, cl, cands, v_c, v_y);
          }
        }
        freshBinding("needsThisWay", [(sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (v_V === _g144), (sp.adj4[v_c].includes(v_y)), ((((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && ((v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) < clueAt(cl.number, v_c)))], ["c in", "where of c", "V =", "y in", "where of y"]);
      }
      facts.length = 0;
      changed = false;
      let _q148 = true;
      Q149: {
        const _a150 = run(sp, cl, v_c, v_y);
        for (let _i151 = 0; _i151 < _a150.length; _i151++) {
          const v_e = _a150[_i151];
          if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
          if (!(true)) {
            _q148 = false;
            break Q149;
          }
        }
      }
      if (!(_q148)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, V: v_V, y: v_y }, facts)) return 1;
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

const sealingFacts: number[] = [];
let sealingCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function sealing(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealingBinding> | null): number {
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
  let _g180 = 0;
  G181: {
    const _a182 = sp.cells;
    for (let _i183 = 0; _i183 < _a182.length; _i183++) {
      const v_x = _a182[_i183];
      const _h184 = clueAt(cl.number, v_x);
      if (!((_h184 !== -1))) continue;
      _g180++;
    }
  }
  const v_N = _g180;
  const _a185 = sp.cells;
  R1:
  for (let _i186 = 0; _i186 < _a185.length; _i186++) {
    const v_c = _a185[_i186];
    const _m76_0 = b.made[0];
    const _m76_1 = b.made[1];
    const _h187 = clueAt(cl.number, v_c);
    if (!(((_h187 !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) continue;
    const _a188 = sp.adj4[v_c];
    for (let _i189 = 0; _i189 < _a188.length; _i189++) {
      const v_y = _a188[_i189];
      L190: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)))) break L190;
        const _t191 = run(sp, cl, v_c, v_y);
        L193: {
          const v_G = throughWhere(sp, v_c, (_te192: number): boolean => {  return (((least((cands[_te192] >= 0 ? cands[_te192] : (cands[_te192] = b.cands[_te192]))) - 1) > 0) || (_t191.includes(_te192))); });
          let _q194 = true;
          Q195: {
            const _a196 = v_G;
            for (let _i197 = 0; _i197 < _a196.length; _i197++) {
              const v_x = _a196[_i197];
              const _h198 = clueAt(cl.number, v_x);
              if (!((_h198 !== -1))) continue;
              const _a199 = sp.adj4[v_x];
              for (let _i200 = 0; _i200 < _a199.length; _i200++) {
                const v_z = _a199[_i200];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q194 = false;
                  break Q195;
                }
              }
            }
          }
          let _c206: boolean = _q194;
          if (_c206) {
            let _q201 = true;
            Q202: {
              const _a203 = v_G;
              for (let _i204 = 0; _i204 < _a203.length; _i204++) {
                const v_x = _a203[_i204];
                const _h205 = clueAt(cl.number, v_x);
                if (!((((_h205 !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                  _q201 = false;
                  break Q202;
                }
              }
            }
            _c206 = _q201;
          }
          let _c212: boolean = _c206;
          if (_c212) {
            let _g207 = 0;
            G208: {
              const _a209 = v_G;
              for (let _i210 = 0; _i210 < _a209.length; _i210++) {
                const v_x = _a209[_i210];
                const _h211 = clueAt(cl.number, v_x);
                if (!((_h211 !== -1))) continue;
                _g207++;
              }
            }
            _c212 = (_g207 < v_N);
          }
          if (!(_c212)) break L193;
          if (b.made[0] !== _m76_0 || b.made[1] !== _m76_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g213 = 0;
            G214: {
              const _a215 = sp.cells;
              for (let _i216 = 0; _i216 < _a215.length; _i216++) {
                const v_x = _a215[_i216];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g213++;
              }
            }
            const _t217 = run(sp, cl, v_c, v_y);
            let _q219 = true;
            Q220: {
              const _a221 = v_G;
              for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                const v_x = _a221[_i222];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                const _a223 = sp.adj4[v_x];
                for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                  const v_z = _a223[_i224];
                  if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                  if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                    _q219 = false;
                    break Q220;
                  }
                }
              }
            }
            let _c229: boolean = _q219;
            if (_c229) {
              let _q225 = true;
              Q226: {
                const _a227 = v_G;
                for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                  const v_x = _a227[_i228];
                  if (!((((clueAt(cl.number, v_x) !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                  if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                    _q225 = false;
                    break Q226;
                  }
                }
              }
              _c229 = _q225;
            }
            let _c234: boolean = _c229;
            if (_c234) {
              let _g230 = 0;
              G231: {
                const _a232 = v_G;
                for (let _i233 = 0; _i233 < _a232.length; _i233++) {
                  const v_x = _a232[_i233];
                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                  _g230++;
                }
              }
              _c234 = (_g230 < v_N);
            }
            freshBinding("sealing", [(v_N === _g213), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)), (sp.adj4[v_c].includes(v_y)), (v_f === far(sp, cl, v_c, v_y)), ((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)), sameSet(v_G, throughWhere(sp, v_c, (_te218: number): boolean => {  return (((least((cands[_te218] >= 0 ? cands[_te218] : (cands[_te218] = b.cands[_te218]))) - 1) > 0) || (_t217.includes(_te218))); })), _c234], ["N =", "c in", "where of c", "y in", "f =", "where of f", "G =", "where of G"]);
          }
          facts.length = 0;
          changed = false;
          let _q235 = true;
          Q236: {
            const _a237 = run(sp, cl, v_c, v_y);
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const v_e = _a237[_i238];
              for (let _m239 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m239 !== 0; _m239 &= _m239 - 1) {
                const v_d = 31 - Math.clz32(_m239 & -_m239);
                if (!((v_d > 1))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q235 = false;
                  break Q236;
                }
              }
            }
          }
          if (!(_q235)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, f: v_f, G: v_G.slice() }, facts)) return 1;
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

const tooManyFacts: number[] = [];
let tooManyCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function tooMany(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooManyBinding> | null): number {
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
  let _g353 = 0;
  G354: {
    const _a355 = sp.cells;
    for (let _i356 = 0; _i356 < _a355.length; _i356++) {
      const v_x = _a355[_i356];
      const _h357 = clueAt(cl.number, v_x);
      if (!((_h357 !== -1))) continue;
      _g353++;
    }
  }
  const v_N = _g353;
  const _a358 = sp.cells;
  R1:
  for (let _i359 = 0; _i359 < _a358.length; _i359++) {
    const v_c = _a358[_i359];
    const _m114_0 = b.made[0];
    const _m114_1 = b.made[1];
    const _h360 = clueAt(cl.number, v_c);
    if (!(((_h360 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a361 = sp.adj4[v_c];
    for (let _i362 = 0; _i362 < _a361.length; _i362++) {
      const v_y = _a361[_i362];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      L363: {
        const v_r = roomMarked(b, sp, cl, cands, v_c, v_y);
        if (!((v_r > 0))) break L363;
        const v_H = run(sp, cl, v_c, v_y);
        const v_G = throughWhere(sp, v_c, (_te364: number): boolean => {  return (((least((cands[_te364] >= 0 ? cands[_te364] : (cands[_te364] = b.cands[_te364]))) - 1) > 0) || (v_H.includes(_te364))); });
        const v_t = hasMarked(b, sp, cl, cands, v_c, v_y);
        let _g365 = -1;
        G366: {
          const _t367 = (v_t + 1);
          const _t368 = (v_t + v_r);
          for (let v_j = _t367; v_j <= _t368; v_j++) {
            let _q369 = false;
            Q370: {
              const _a371 = near(sp, cl, v_c, v_y);
              for (let _i372 = 0; _i372 < _a371.length; _i372++) {
                const v_x = _a371[_i372];
                const _h373 = clueAt(cl.number, v_x);
                const _h397 = (v_x % sp.w);
                let _g374 = 0;
                G375: {
                  const _a376 = sp.adj4[v_x];
                  for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                    const v_y = _a376[_i377];
                    if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                    let _g378 = 0;
                    G379: {
                      const _t380 = sp.adj4Edges[v_x][_i377];
                      for (let _i381 = 0; _i381 < 1; _i381++) {
                        const v_z = _t380;
                        if (!((v_H.includes(v_z)))) continue;
                        _g378 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                      }
                    }
                    _g374 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g378);
                  }
                }
                let _c417: boolean = ((_h373 - _g374) < 0);
                if (!_c417) {
                  let _g382 = 0;
                  G383: {
                    const _a384 = sp.adj4[v_x];
                    for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                      const v_y = _a384[_i385];
                      if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                      const _h396 = (v_y % sp.w);
                      const _h398 = (_h396 === _h397);
                      const _h413 = sp.adj4Edges[v_x][_i385];
                      let _g386 = -1;
                      G387: {
                        const _t388 = cl.maxb;
                        for (let v_k = _t388; v_k >= 0; v_k--) {
                          let _c416: boolean = (v_k === 0);
                          if (!_c416) {
                            let _q389 = false;
                            Q390: {
                              const _a391 = mid(sp, cl, v_x, v_y);
                              for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                                const v_m = _a391[_i392];
                                const _h395 = (v_m % sp.w);
                                const _a393 = sp.adj4[v_m];
                                for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                                  const v_p = _a393[_i394];
                                  if (!((((v_p % sp.w) === _h395) !== _h398))) continue;
                                  const _t399 = sp.adj4Edges[v_m][_i394];
                                  if ((((least((cands[_t399] >= 0 ? cands[_t399] : (cands[_t399] = b.cands[_t399]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i394])))) {
                                    _q389 = true;
                                    break Q390;
                                  }
                                }
                              }
                            }
                            let _c410: boolean = !(_q389);
                            if (_c410) {
                              const _t400 = far(sp, cl, v_x, v_y);
                              const _h401 = clueAt(cl.number, _t400);
                              let _g402 = 0;
                              G403: {
                                const _a404 = sp.adj4[_t400];
                                for (let _i405 = 0; _i405 < _a404.length; _i405++) {
                                  const v_y = _a404[_i405];
                                  if (!((far(sp, cl, _t400, v_y) !== -1))) continue;
                                  let _g406 = 0;
                                  G407: {
                                    const _t408 = sp.adj4Edges[_t400][_i405];
                                    for (let _i409 = 0; _i409 < 1; _i409++) {
                                      const v_z = _t408;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g406 += (v_j - hasMarked(b, sp, cl, cands, _t400, v_y));
                                    }
                                  }
                                  _g402 += (hasMarked(b, sp, cl, cands, _t400, v_y) + _g406);
                                }
                              }
                              _c410 = (v_k <= (_h401 - _g402));
                            }
                            let _c415: boolean = _c410;
                            if (_c415) {
                              let _g411 = 0;
                              G412: {
                                for (let _i414 = 0; _i414 < 1; _i414++) {
                                  const v_z = _h413;
                                  if (!((v_H.includes(v_z)))) continue;
                                  _g411 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                }
                              }
                              _c415 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g411) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                            }
                            _c416 = _c415;
                          }
                          if (!(_c416)) continue;
                          _g386 = v_k;
                          break G387;
                        }
                      }
                      _g382 += _g386;
                    }
                  }
                  _c417 = (_g382 < (_h373 - _g374));
                }
                if (_c417) {
                  _q369 = true;
                  break Q370;
                }
              }
            }
            let _c445: boolean = _q369;
            if (!_c445) {
              let _q418 = true;
              Q419: {
                const _a420 = v_G;
                for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                  const v_x = _a420[_i421];
                  const _h422 = clueAt(cl.number, v_x);
                  if (!((_h422 !== -1))) continue;
                  const _a423 = sp.adj4[v_x];
                  for (let _i424 = 0; _i424 < _a423.length; _i424++) {
                    const v_z = _a423[_i424];
                    if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                    if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                      _q418 = false;
                      break Q419;
                    }
                  }
                }
              }
              let _c438: boolean = _q418;
              if (_c438) {
                let _q425 = true;
                Q426: {
                  const _a427 = v_G;
                  for (let _i428 = 0; _i428 < _a427.length; _i428++) {
                    const v_x = _a427[_i428];
                    const _h429 = clueAt(cl.number, v_x);
                    if (!((_h429 !== -1))) continue;
                    let _g430 = 0;
                    G431: {
                      const _a432 = sp.adj4[v_x];
                      for (let _i433 = 0; _i433 < _a432.length; _i433++) {
                        const v_y = _a432[_i433];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g434 = 0;
                        G435: {
                          const _t436 = sp.adj4Edges[v_x][_i433];
                          for (let _i437 = 0; _i437 < 1; _i437++) {
                            const v_z = _t436;
                            if (!((v_H.includes(v_z)))) continue;
                            _g434 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g430 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g434);
                      }
                    }
                    if (!(((_h429 - _g430) === 0))) {
                      _q425 = false;
                      break Q426;
                    }
                  }
                }
                _c438 = _q425;
              }
              let _c444: boolean = _c438;
              if (_c444) {
                let _g439 = 0;
                G440: {
                  const _a441 = v_G;
                  for (let _i442 = 0; _i442 < _a441.length; _i442++) {
                    const v_x = _a441[_i442];
                    const _h443 = clueAt(cl.number, v_x);
                    if (!((_h443 !== -1))) continue;
                    _g439++;
                  }
                }
                _c444 = (_g439 < v_N);
              }
              _c445 = _c444;
            }
            if (!(_c445)) continue;
            _g365 = v_j;
            break G366;
          }
        }
        L446: {
          const v_k = _g365;
          if (!((v_k > 0))) break L446;
          if (b.made[0] !== _m114_0 || b.made[1] !== _m114_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g447 = 0;
            G448: {
              const _a449 = sp.cells;
              for (let _i450 = 0; _i450 < _a449.length; _i450++) {
                const v_x = _a449[_i450];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g447++;
              }
            }
            let _g452 = -1;
            G453: {
              const _t454 = (v_t + 1);
              const _t455 = (v_t + v_r);
              for (let v_j = _t454; v_j <= _t455; v_j++) {
                let _q456 = false;
                Q457: {
                  const _a458 = near(sp, cl, v_c, v_y);
                  for (let _i459 = 0; _i459 < _a458.length; _i459++) {
                    const v_x = _a458[_i459];
                    let _g460 = 0;
                    G461: {
                      const _a462 = sp.adj4[v_x];
                      for (let _i463 = 0; _i463 < _a462.length; _i463++) {
                        const v_y = _a462[_i463];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g464 = 0;
                        G465: {
                          const _t466 = sp.adj4Edges[v_x][_i463];
                          for (let _i467 = 0; _i467 < 1; _i467++) {
                            const v_z = _t466;
                            if (!((v_H.includes(v_z)))) continue;
                            _g464 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g460 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g464);
                      }
                    }
                    let _c498: boolean = ((clueAt(cl.number, v_x) - _g460) < 0);
                    if (!_c498) {
                      let _g468 = 0;
                      G469: {
                        const _a470 = sp.adj4[v_x];
                        for (let _i471 = 0; _i471 < _a470.length; _i471++) {
                          const v_y = _a470[_i471];
                          if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                          let _g472 = -1;
                          G473: {
                            const _t474 = cl.maxb;
                            for (let v_k = _t474; v_k >= 0; v_k--) {
                              let _c497: boolean = (v_k === 0);
                              if (!_c497) {
                                let _q475 = false;
                                Q476: {
                                  const _a477 = mid(sp, cl, v_x, v_y);
                                  for (let _i478 = 0; _i478 < _a477.length; _i478++) {
                                    const v_m = _a477[_i478];
                                    const _a479 = sp.adj4[v_m];
                                    for (let _i480 = 0; _i480 < _a479.length; _i480++) {
                                      const v_p = _a479[_i480];
                                      if (!((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_x % sp.w))))) continue;
                                      const _t481 = sp.adj4Edges[v_m][_i480];
                                      if ((((least((cands[_t481] >= 0 ? cands[_t481] : (cands[_t481] = b.cands[_t481]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i480])))) {
                                        _q475 = true;
                                        break Q476;
                                      }
                                    }
                                  }
                                }
                                let _c491: boolean = !(_q475);
                                if (_c491) {
                                  const _t482 = far(sp, cl, v_x, v_y);
                                  let _g483 = 0;
                                  G484: {
                                    const _a485 = sp.adj4[_t482];
                                    for (let _i486 = 0; _i486 < _a485.length; _i486++) {
                                      const v_y = _a485[_i486];
                                      if (!((far(sp, cl, _t482, v_y) !== -1))) continue;
                                      let _g487 = 0;
                                      G488: {
                                        const _t489 = sp.adj4Edges[_t482][_i486];
                                        for (let _i490 = 0; _i490 < 1; _i490++) {
                                          const v_z = _t489;
                                          if (!((v_H.includes(v_z)))) continue;
                                          _g487 += (v_j - hasMarked(b, sp, cl, cands, _t482, v_y));
                                        }
                                      }
                                      _g483 += (hasMarked(b, sp, cl, cands, _t482, v_y) + _g487);
                                    }
                                  }
                                  _c491 = (v_k <= (clueAt(cl.number, _t482) - _g483));
                                }
                                let _c496: boolean = _c491;
                                if (_c496) {
                                  let _g492 = 0;
                                  G493: {
                                    const _t494 = sp.adj4Edges[v_x][_i471];
                                    for (let _i495 = 0; _i495 < 1; _i495++) {
                                      const v_z = _t494;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g492 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                    }
                                  }
                                  _c496 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g492) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                                }
                                _c497 = _c496;
                              }
                              if (!(_c497)) continue;
                              _g472 = v_k;
                              break G473;
                            }
                          }
                          _g468 += _g472;
                        }
                      }
                      _c498 = (_g468 < (clueAt(cl.number, v_x) - _g460));
                    }
                    if (_c498) {
                      _q456 = true;
                      break Q457;
                    }
                  }
                }
                let _c523: boolean = _q456;
                if (!_c523) {
                  let _q499 = true;
                  Q500: {
                    const _a501 = v_G;
                    for (let _i502 = 0; _i502 < _a501.length; _i502++) {
                      const v_x = _a501[_i502];
                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                      const _a503 = sp.adj4[v_x];
                      for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                        const v_z = _a503[_i504];
                        if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                        if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                          _q499 = false;
                          break Q500;
                        }
                      }
                    }
                  }
                  let _c517: boolean = _q499;
                  if (_c517) {
                    let _q505 = true;
                    Q506: {
                      const _a507 = v_G;
                      for (let _i508 = 0; _i508 < _a507.length; _i508++) {
                        const v_x = _a507[_i508];
                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                        let _g509 = 0;
                        G510: {
                          const _a511 = sp.adj4[v_x];
                          for (let _i512 = 0; _i512 < _a511.length; _i512++) {
                            const v_y = _a511[_i512];
                            if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                            let _g513 = 0;
                            G514: {
                              const _t515 = sp.adj4Edges[v_x][_i512];
                              for (let _i516 = 0; _i516 < 1; _i516++) {
                                const v_z = _t515;
                                if (!((v_H.includes(v_z)))) continue;
                                _g513 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                              }
                            }
                            _g509 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g513);
                          }
                        }
                        if (!(((clueAt(cl.number, v_x) - _g509) === 0))) {
                          _q505 = false;
                          break Q506;
                        }
                      }
                    }
                    _c517 = _q505;
                  }
                  let _c522: boolean = _c517;
                  if (_c522) {
                    let _g518 = 0;
                    G519: {
                      const _a520 = v_G;
                      for (let _i521 = 0; _i521 < _a520.length; _i521++) {
                        const v_x = _a520[_i521];
                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                        _g518++;
                      }
                    }
                    _c522 = (_g518 < v_N);
                  }
                  _c523 = _c522;
                }
                if (!(_c523)) continue;
                _g452 = v_j;
                break G453;
              }
            }
            freshBinding("tooMany", [(v_N === _g447), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (sp.adj4[v_c].includes(v_y)), (far(sp, cl, v_c, v_y) !== -1), (v_r === roomMarked(b, sp, cl, cands, v_c, v_y)), (v_r > 0), sameSet(v_H, run(sp, cl, v_c, v_y)), sameSet(v_G, throughWhere(sp, v_c, (_te451: number): boolean => {  return (((least((cands[_te451] >= 0 ? cands[_te451] : (cands[_te451] = b.cands[_te451]))) - 1) > 0) || (v_H.includes(_te451))); })), (v_t === hasMarked(b, sp, cl, cands, v_c, v_y)), (v_k === _g452), (v_k > 0)], ["N =", "c in", "where of c", "y in", "where of y", "r =", "where of r", "H =", "G =", "t =", "k =", "where of k"]);
          }
          facts.length = 0;
          changed = false;
          let _q524 = true;
          Q525: {
            const _a526 = v_H;
            for (let _i527 = 0; _i527 < _a526.length; _i527++) {
              const v_e = _a526[_i527];
              for (let _m528 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m528 !== 0; _m528 &= _m528 - 1) {
                const v_d = 31 - Math.clz32(_m528 & -_m528);
                if (!((v_d > v_k))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q524 = false;
                  break Q525;
                }
              }
            }
          }
          if (!(_q524)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, r: v_r, H: v_H.slice(), G: v_G.slice(), t: v_t, k: v_k }, facts)) return 1;
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

const mustReachOutFacts: number[] = [];
let mustReachOutCands = new Int32Array(0);
const _st595 = stamps();

/** Its dearest read grows with the board as n^2. */
export function mustReachOut(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustReachOutBinding> | null): number {
  const _g589: number[] = [];
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
  let _g574 = 0;
  G575: {
    const _a576 = sp.cells;
    for (let _i577 = 0; _i577 < _a576.length; _i577++) {
      const v_x = _a576[_i577];
      const _h578 = clueAt(cl.number, v_x);
      if (!((_h578 !== -1))) continue;
      _g574++;
    }
  }
  const v_N = _g574;
  const _a579 = sp.cells;
  R1:
  for (let _i580 = 0; _i580 < _a579.length; _i580++) {
    const v_c = _a579[_i580];
    const _m187_0 = b.made[0];
    const _m187_1 = b.made[1];
    const _h581 = clueAt(cl.number, v_c);
    if (!(((_h581 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a582 = sp.adj4[v_c];
    for (let _i583 = 0; _i583 < _a582.length; _i583++) {
      const v_y = _a582[_i583];
      let _c588: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
      if (_c588) {
        let _g584 = 0;
        G585: {
          const _a586 = sp.adj4[v_c];
          for (let _i587 = 0; _i587 < _a586.length; _i587++) {
            const v_z = _a586[_i587];
            if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
            _g584 += roomMarked(b, sp, cl, cands, v_c, v_z);
          }
        }
        _c588 = (_g584 === needMarked(b, sp, cl, cands, v_c));
      }
      if (!(_c588)) continue;
      _g589.length = 0;
      _st595.pass++;
      G590: {
        const _a596 = sp.adj4[v_c];
        for (let _i597 = 0; _i597 < _a596.length; _i597++) {
          const v_z = _a596[_i597];
          if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
          const _a598 = run(sp, cl, v_c, v_z);
          for (let _i599 = 0; _i599 < _a598.length; _i599++) {
            const v_e = _a598[_i599];
            const _t600 = v_e;
            if (_g589.length < 16) { if (!_g589.includes(_t600)) _g589.push(_t600); } else addOnce(_g589, _st595, _t600);
          }
        }
      }
      const v_F = _g589;
      L602: {
        const v_G = throughWhere(sp, v_c, (_te601: number): boolean => {  return (((least((cands[_te601] >= 0 ? cands[_te601] : (cands[_te601] = b.cands[_te601]))) - 1) > 0) || (v_F.includes(_te601))); });
        let _q603 = true;
        Q604: {
          const _a605 = v_G;
          for (let _i606 = 0; _i606 < _a605.length; _i606++) {
            const v_x = _a605[_i606];
            const _h607 = clueAt(cl.number, v_x);
            if (!((_h607 !== -1))) continue;
            const _a608 = sp.adj4[v_x];
            for (let _i609 = 0; _i609 < _a608.length; _i609++) {
              const v_z = _a608[_i609];
              if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
              if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                _q603 = false;
                break Q604;
              }
            }
          }
        }
        let _c619: boolean = _q603;
        if (_c619) {
          let _q610 = true;
          Q611: {
            const _a612 = v_G;
            for (let _i613 = 0; _i613 < _a612.length; _i613++) {
              const v_x = _a612[_i613];
              const _h614 = clueAt(cl.number, v_x);
              if (!(((_h614 !== -1) && (v_x !== v_c)))) continue;
              let _g615 = 0;
              G616: {
                const _a617 = sp.adj4[v_c];
                for (let _i618 = 0; _i618 < _a617.length; _i618++) {
                  const v_z = _a617[_i618];
                  if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                  _g615 += roomMarked(b, sp, cl, cands, v_c, v_z);
                }
              }
              if (!((needMarked(b, sp, cl, cands, v_x) === _g615))) {
                _q610 = false;
                break Q611;
              }
            }
          }
          _c619 = _q610;
        }
        let _c625: boolean = _c619;
        if (_c625) {
          let _g620 = 0;
          G621: {
            const _a622 = v_G;
            for (let _i623 = 0; _i623 < _a622.length; _i623++) {
              const v_x = _a622[_i623];
              const _h624 = clueAt(cl.number, v_x);
              if (!((_h624 !== -1))) continue;
              _g620++;
            }
          }
          _c625 = (_g620 < v_N);
        }
        if (!(_c625)) break L602;
        if (b.made[0] !== _m187_0 || b.made[1] !== _m187_1) {
          if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g626 = 0;
          G627: {
            const _a628 = sp.cells;
            for (let _i629 = 0; _i629 < _a628.length; _i629++) {
              const v_x = _a628[_i629];
              if (!((clueAt(cl.number, v_x) !== -1))) continue;
              _g626++;
            }
          }
          let _c634: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
          if (_c634) {
            let _g630 = 0;
            G631: {
              const _a632 = sp.adj4[v_c];
              for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                const v_z = _a632[_i633];
                if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
                _g630 += roomMarked(b, sp, cl, cands, v_c, v_z);
              }
            }
            _c634 = (_g630 === needMarked(b, sp, cl, cands, v_c));
          }
          const _g635: number[] = [];
          G636: {
            const _a641 = sp.adj4[v_c];
            for (let _i642 = 0; _i642 < _a641.length; _i642++) {
              const v_z = _a641[_i642];
              if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
              const _a643 = run(sp, cl, v_c, v_z);
              for (let _i644 = 0; _i644 < _a643.length; _i644++) {
                const v_e = _a643[_i644];
                if (!_g635.includes(v_e)) _g635.push(v_e);
              }
            }
          }
          let _q646 = true;
          Q647: {
            const _a648 = v_G;
            for (let _i649 = 0; _i649 < _a648.length; _i649++) {
              const v_x = _a648[_i649];
              if (!((clueAt(cl.number, v_x) !== -1))) continue;
              const _a650 = sp.adj4[v_x];
              for (let _i651 = 0; _i651 < _a650.length; _i651++) {
                const v_z = _a650[_i651];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q646 = false;
                  break Q647;
                }
              }
            }
          }
          let _c660: boolean = _q646;
          if (_c660) {
            let _q652 = true;
            Q653: {
              const _a654 = v_G;
              for (let _i655 = 0; _i655 < _a654.length; _i655++) {
                const v_x = _a654[_i655];
                if (!(((clueAt(cl.number, v_x) !== -1) && (v_x !== v_c)))) continue;
                let _g656 = 0;
                G657: {
                  const _a658 = sp.adj4[v_c];
                  for (let _i659 = 0; _i659 < _a658.length; _i659++) {
                    const v_z = _a658[_i659];
                    if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                    _g656 += roomMarked(b, sp, cl, cands, v_c, v_z);
                  }
                }
                if (!((needMarked(b, sp, cl, cands, v_x) === _g656))) {
                  _q652 = false;
                  break Q653;
                }
              }
            }
            _c660 = _q652;
          }
          let _c665: boolean = _c660;
          if (_c665) {
            let _g661 = 0;
            G662: {
              const _a663 = v_G;
              for (let _i664 = 0; _i664 < _a663.length; _i664++) {
                const v_x = _a663[_i664];
                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                _g661++;
              }
            }
            _c665 = (_g661 < v_N);
          }
          freshBinding("mustReachOut", [(v_N === _g626), (sp.cells.includes(v_c)), ((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)), (sp.adj4[v_c].includes(v_y)), _c634, sameSet(v_F, _g635), sameSet(v_G, throughWhere(sp, v_c, (_te645: number): boolean => {  return (((least((cands[_te645] >= 0 ? cands[_te645] : (cands[_te645] = b.cands[_te645]))) - 1) > 0) || (v_F.includes(_te645))); })), _c665], ["N =", "c in", "where of c", "y in", "where of y", "F =", "G =", "where of G"]);
        }
        facts.length = 0;
        changed = false;
        let _q666 = true;
        Q667: {
          const _a668 = run(sp, cl, v_c, v_y);
          for (let _i669 = 0; _i669 < _a668.length; _i669++) {
            const v_e = _a668[_i669];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q666 = false;
              break Q667;
            }
          }
        }
        if (!(_q666)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, F: v_F.slice(), G: v_G.slice() }, facts)) return 1;
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

const loopFacts: number[] = [];
let loopCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function loop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopBinding> | null): number {
  const _g681: number[] = [];
  const _g694: number[] = [];
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
  const _m223_1 = b.made[1];
  _g681.length = 0;
  G682: {
    const _a685 = sp.edges;
    for (let _i686 = 0; _i686 < _a685.length; _i686++) {
      const v_e = _a685[_i686];
      if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
      _g681.push(v_e);
    }
  }
  const v_L = _g681;
  const _eg693 = edgeGroups(sp, v_L);
  const _a687 = sp.cells;
  for (let _i688 = 0; _i688 < _a687.length; _i688++) {
    const v_c = _a687[_i688];
    const _h689 = clueAt(cl.number, v_c);
    if (!((_h689 !== -1))) continue;
    const _a690 = sp.adj4[v_c];
    for (let _i691 = 0; _i691 < _a690.length; _i691++) {
      const v_y = _a690[_i691];
      L692: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (_eg693.of(v_f) === _eg693.of(v_c))))) break L692;
        if (b.made[1] !== _m223_1) {
          _g694.length = 0;
          G695: {
            const _a698 = sp.edges;
            for (let _i699 = 0; _i699 < _a698.length; _i699++) {
              const v_e = _a698[_i699];
              if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
              _g694.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g694))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g700: number[] = [];
          G701: {
            const _a704 = sp.edges;
            for (let _i705 = 0; _i705 < _a704.length; _i705++) {
              const v_e = _a704[_i705];
              if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
              _g700.push(v_e);
            }
          }
          freshBinding("loop", [sameSet(v_L, _g700), (sp.cells.includes(v_c)), (clueAt(cl.number, v_c) !== -1), (sp.adj4[v_c].includes(v_y)), (v_f === far(sp, cl, v_c, v_y)), ((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (through(sp, v_c, v_L).includes(v_f)))], ["L =", "c in", "where of c", "y in", "f =", "where of f"]);
        }
        facts.length = 0;
        changed = false;
        let _q706 = true;
        Q707: {
          const _a708 = run(sp, cl, v_c, v_y);
          for (let _i709 = 0; _i709 < _a708.length; _i709++) {
            const v_e = _a708[_i709];
            for (let _m710 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m710 !== 0; _m710 &= _m710 - 1) {
              const v_d = 31 - Math.clz32(_m710 & -_m710);
              if (!((v_d > 1))) continue;
              if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
              if (!(true)) {
                _q706 = false;
                break Q707;
              }
            }
          }
        }
        if (!(_q706)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), c: v_c, y: v_y, f: v_f }, facts)) return 1;
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
  const _g7: number[] = [];
  G8: {
    const _a11 = ray(sp, v_c, v_y);
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_x = _a11[_i12];
      if (!(((clueAt(cl.number, v_x) !== -1) && !((clueAt(cl.number, v_y) !== -1))))) continue;
      _g7.push(v_x);
    }
  }
  const _made = (_g7.length > 0 ? _g7[0] : -1);
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
  const _g20: number[] = [];
  G21: {
    const _a24 = ray(sp, v_c, v_y);
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_x = _a24[_i25];
      if (!((_i25 < ray(sp, v_c, v_y).indexOf(far(sp, cl, v_c, v_y))))) continue;
      _g20.push(v_x);
    }
  }
  const _made = _g20;
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
  let _g15 = -1;
  let _n17 = 0;
  G16: {
    const _a18 = sp.adj4[far(sp, cl, v_c, v_y)];
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_x = _a18[_i19];
      if (!(((v_x === v_c) || (mid(sp, cl, v_c, v_y).includes(v_x))))) continue;
      if (++_n17 === 2) {
        _g15 = -1;
        break G16;
      }
      _g15 = v_x;
    }
  }
  const _made = sp.edgeOf(far(sp, cl, v_c, v_y), _g15);
  _kept1[v_y] = _made;
  return _made;
}

const hasMarkedKept = new Map<number, number>();

/** `has(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function hasMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = hasMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g13 = -1;
  G14: {
    const _t26 = sp.edgeOf(v_c, v_y);
    const _t27 = end(sp, cl, v_c, v_y);
    for (let _i28 = 0; _i28 < 2; _i28++) {
      const v_e = _i28 === 0 ? _t26 : _t27;
      if (_i28 === 1 && (v_e === _t26)) continue;
      const _t29 = (least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1);
      if (_g13 === -1 || _t29 > _g13) _g13 = _t29;
    }
  }
  const _made = _g13;
  hasMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const bridgesMarkedKept = new Map<number, number>();

/** `bridges(c)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function bridgesMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number): number {
  const _was = bridgesMarkedKept.get(v_c);
  if (_was !== undefined) return _was;
  let _g3 = 0;
  G4: {
    const _a5 = sp.adj4[v_c];
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_y = _a5[_i6];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      _g3 += hasMarked(b, sp, cl, cands, v_c, v_y);
    }
  }
  const _made = _g3;
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
  let _q42 = false;
  Q43: {
    const _a44 = mid(sp, cl, v_c, v_y);
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_m = _a44[_i45];
      const _a46 = sp.adj4[v_m];
      for (let _i47 = 0; _i47 < _a46.length; _i47++) {
        const v_p = _a46[_i47];
        if (!((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))))) continue;
        const _t48 = sp.adj4Edges[v_m][_i47];
        if (((least((cands[_t48] >= 0 ? cands[_t48] : (cands[_t48] = b.cands[_t48]))) - 1) > 0)) {
          _q42 = true;
          break Q43;
        }
      }
    }
  }
  const _made = _q42;
  crossedMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const openMarkedKept = new Map<number, boolean>();

/** `open(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function openMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): boolean {
  const _was = openMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _c41: boolean = (needMarked(b, sp, cl, cands, v_c) > 0);
  if (_c41) {
    const _t40 = far(sp, cl, v_c, v_y);
    _c41 = (needMarked(b, sp, cl, cands, _t40) > 0);
  }
  const _made = (_c41 && !(crossedMarked(b, sp, cl, cands, v_c, v_y)));
  openMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const allowsMarkedKept = new Map<number, number>();

/** `allows(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function allowsMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = allowsMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g52 = -1;
  G53: {
    const _t54 = sp.edgeOf(v_c, v_y);
    const _t55 = end(sp, cl, v_c, v_y);
    for (let _i56 = 0; _i56 < 2; _i56++) {
      const v_e = _i56 === 0 ? _t54 : _t55;
      if (_i56 === 1 && (v_e === _t54)) continue;
      let _g57 = -1;
      G58: {
        for (let _m59 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m59 !== 0; _m59 &= _m59 - 1) {
          const v_d = 31 - Math.clz32(_m59 & -_m59);
          if (_g57 === -1 || v_d > _g57) _g57 = v_d;
        }
      }
      const _t60 = (_g57 - 1);
      if (_g52 === -1 || _t60 < _g52) _g52 = _t60;
    }
  }
  const _made = _g52;
  allowsMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const capMarkedKept = new Map<number, number>();

/** `cap(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function capMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = capMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g49 = -1;
  G50: {
    const _t51 = cl.maxb;
    for (let v_k = _t51; v_k >= 0; v_k--) {
      if (!(((v_k === 0) || ((((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= allowsMarked(b, sp, cl, cands, v_c, v_y)) && ((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= clueAt(cl.number, v_c))) && ((hasMarked(b, sp, cl, cands, v_c, v_y) + v_k) <= clueAt(cl.number, far(sp, cl, v_c, v_y))))))) continue;
      _g49 = v_k;
      break G50;
    }
  }
  const _made = _g49;
  capMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const moreMarkedKept = new Map<number, number>();

/** `more(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function moreMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = moreMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g37 = 0;
  G38: {
    for (let _i39 = 0; _i39 < 1; _i39++) {
      if (!(openMarked(b, sp, cl, cands, v_c, v_y))) continue;
      _g37 += capMarked(b, sp, cl, cands, v_c, v_y);
    }
  }
  const _made = _g37;
  moreMarkedKept.set((v_c + 1) * 1048577 + (v_y + 1), _made);
  return _made;
}

const roomMarkedKept = new Map<number, number>();

/** `room(c, y)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function roomMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_c: number, v_y: number): number {
  const _was = roomMarkedKept.get((v_c + 1) * 1048577 + (v_y + 1));
  if (_was !== undefined) return _was;
  let _g35 = -1;
  G36: {
    const _t61 = moreMarked(b, sp, cl, cands, v_c, v_y);
    for (let v_k = _t61; v_k >= 0; v_k--) {
      if (!((v_k <= needMarked(b, sp, cl, cands, v_c)))) continue;
      _g35 = v_k;
      break G36;
    }
  }
  const _made = _g35;
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
  const _g80: number[] = [];
  G81: {
    const _a84 = mid(sp, cl, v_c, v_y);
    for (let _i85 = 0; _i85 < _a84.length; _i85++) {
      const v_m = _a84[_i85];
      const _t86 = sp.edgeOf(v_m, (ray(sp, v_c, v_y)[(ray(sp, v_c, v_y).indexOf(v_m) + 1)] ?? -1));
      if (!_g80.includes(_t86)) _g80.push(_t86);
    }
  }
  const _made = union(setOf(sp.edgeOf(v_c, v_y)), _g80);
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
  const _g256: number[] = [];
  G257: {
    const _t262 = far(sp, cl, v_c, v_y);
    for (let _i263 = 0; _i263 < 2; _i263++) {
      const v_x = _i263 === 0 ? v_c : _t262;
      if (_i263 === 1 && (v_x === v_c)) continue;
      const _a264 = sp.adj4[v_x];
      for (let _i265 = 0; _i265 < _a264.length; _i265++) {
        const v_z = _a264[_i265];
        if (!((far(sp, cl, v_x, v_z) !== -1))) continue;
        const _t266 = far(sp, cl, v_x, v_z);
        if (!_g256.includes(_t266)) _g256.push(_t266);
      }
    }
  }
  const _g267: number[] = [];
  G268: {
    const _a273 = mid(sp, cl, v_c, v_y);
    for (let _i274 = 0; _i274 < _a273.length; _i274++) {
      const v_m = _a273[_i274];
      const _a275 = sp.adj4[v_m];
      for (let _i276 = 0; _i276 < _a275.length; _i276++) {
        const v_p = _a275[_i276];
        if (!(((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))) && (far(sp, cl, v_m, v_p) !== -1)))) continue;
        const _t277 = far(sp, cl, v_m, v_p);
        if (!_g267.includes(_t277)) _g267.push(_t277);
      }
    }
  }
  const _made = union(union(setOf(v_c), _g256), _g267);
  _kept1[v_y] = _made;
  return _made;
}
