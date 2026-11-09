// Compiled by `npm run describe` from src/games/bridges/bridges.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, addOnce, clueAt, edgeGroups, keptStore, least, minus, rangeMask, ray, sameSet, setOf, stamps, through, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g603: number[] = [];
  const _g619: number[] = [];
  const _domain = rangeMask(1, (cl.maxb + 1));
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q552 = true;
  Q553: {
    const _a554 = sp.edges;
    for (let _i555 = 0; _i555 < _a554.length; _i555++) {
      const v_e = _a554[_i555];
      const _t556 = sp.edgeEnds[2 * v_e];
      const _h557 = clueAt(cl.number, _t556);
      let _c560: boolean = (_h557 !== -1);
      if (_c560) {
        const _t558 = sp.edgeEnds[2 * v_e + 1];
        const _h559 = clueAt(cl.number, _t558);
        _c560 = (_h559 !== -1);
      }
      if (!(_c560)) continue;
      const _h561 = (g[v_e] || -1);
      if (!((_h561 === 1))) {
        _q552 = false;
        break Q553;
      }
    }
  }
  if (!(_q552)) return false;
  let _q562 = true;
  Q563: {
    const _a564 = sp.cells;
    for (let _i565 = 0; _i565 < _a564.length; _i565++) {
      const v_c = _a564[_i565];
      const _h566 = clueAt(cl.number, v_c);
      if (!(!((_h566 !== -1)))) continue;
      const _h575 = (v_c % sp.w);
      const _h576 = (2 * _h575);
      const _h578 = ((v_c / sp.w) | 0);
      const _h579 = (2 * _h578);
      const _a567 = sp.adj4[v_c];
      for (let _i568 = 0; _i568 < _a567.length; _i568++) {
        const v_a = _a567[_i568];
        const _h569 = (g[sp.adj4Edges[v_c][_i568]] || -1);
        const _h574 = (v_a % sp.w);
        const _h577 = ((v_a / sp.w) | 0);
        const _h581 = sp.adj4Edges[v_c][_i568];
        const _h582 = (g[_h581] || -1);
        let _c583: boolean = (_h569 === 1);
        if (!_c583) {
          let _q570 = false;
          Q571: {
            const _a572 = sp.adj4[v_c];
            for (let _i573 = 0; _i573 < _a572.length; _i573++) {
              const v_b = _a572[_i573];
              if (!((((_h574 + (v_b % sp.w)) === _h576) && ((_h577 + ((v_b / sp.w) | 0)) === _h579)))) continue;
              const _h580 = (g[sp.adj4Edges[v_c][_i573]] || -1);
              if ((_h580 === _h582)) {
                _q570 = true;
                break Q571;
              }
            }
          }
          _c583 = _q570;
        }
        if (!(_c583)) {
          _q562 = false;
          break Q563;
        }
      }
    }
  }
  if (!(_q562)) return false;
  let _q584 = true;
  Q585: {
    const _a586 = sp.cells;
    for (let _i587 = 0; _i587 < _a586.length; _i587++) {
      const v_c = _a586[_i587];
      const _h588 = clueAt(cl.number, v_c);
      if (!(!((_h588 !== -1)))) continue;
      const _h594 = (v_c % sp.w);
      const _h596 = ((v_c / sp.w) | 0);
      const _a589 = sp.adj4[v_c];
      for (let _i590 = 0; _i590 < _a589.length; _i590++) {
        const v_a = _a589[_i590];
        const _h593 = (v_a % sp.w);
        const _h595 = (_h593 === _h594);
        const _h597 = sp.adj4Edges[v_c][_i590];
        const _h598 = (g[_h597] || -1);
        const _h599 = (_h598 === 1);
        const _a591 = sp.adj4[v_c];
        for (let _i592 = 0; _i592 < _a591.length; _i592++) {
          const v_b = _a591[_i592];
          if (!((_h595 && (((v_b / sp.w) | 0) === _h596)))) continue;
          const _h600 = (g[sp.adj4Edges[v_c][_i592]] || -1);
          if (!((_h599 || (_h600 === 1)))) {
            _q584 = false;
            break Q585;
          }
        }
      }
    }
  }
  if (!(_q584)) return false;
  let _q601 = true;
  Q602: {
    _g603.length = 0;
    G604: {
      const _a607 = sp.edges;
      for (let _i608 = 0; _i608 < _a607.length; _i608++) {
        const v_e = _a607[_i608];
        const _h609 = (g[v_e] || -1);
        if (!((_h609 > 1))) continue;
        _g603.push(v_e);
      }
    }
    const v_L = _g603;
    const _eg616 = edgeGroups(sp, v_L);
    const _a610 = sp.cells;
    for (let _i611 = 0; _i611 < _a610.length; _i611++) {
      const v_a = _a610[_i611];
      const _h612 = clueAt(cl.number, v_a);
      if (!((_h612 !== -1))) continue;
      const _a613 = sp.cells;
      for (let _i614 = 0; _i614 < _a613.length; _i614++) {
        const v_b = _a613[_i614];
        const _h615 = clueAt(cl.number, v_b);
        if (!((_h615 !== -1))) continue;
        if (!((_eg616.of(v_b) === _eg616.of(v_a)))) {
          _q601 = false;
          break Q602;
        }
      }
    }
  }
  if (!(_q601)) return false;
  if (variations.includes("no loops")) {
    let _q617 = true;
    Q618: {
      _g619.length = 0;
      G620: {
        const _a623 = sp.edges;
        for (let _i624 = 0; _i624 < _a623.length; _i624++) {
          const v_e = _a623[_i624];
          const _h625 = (g[v_e] || -1);
          if (!((_h625 > 1))) continue;
          _g619.push(v_e);
        }
      }
      const v_L = _g619;
      const _a626 = v_L;
      for (let _i627 = 0; _i627 < _a626.length; _i627++) {
        const v_e = _a626[_i627];
        if (!(!(through(sp, sp.edgeEnds[2 * v_e], minus(v_L, setOf(v_e))).includes(sp.edgeEnds[2 * v_e + 1])))) {
          _q617 = false;
          break Q618;
        }
      }
    }
    if (!(_q617)) return false;
  }
  for (let _k628 = 0; _k628 < cl.number.at.length; _k628++) {
    const _at629 = cl.number.at[_k628];
    let _g631 = 0;
    G632: {
      const _a633 = sp.adj4[_at629];
      for (let _i634 = 0; _i634 < _a633.length; _i634++) {
        _g631 += ((g[sp.adj4Edges[_at629][_i634]] || -1) - 1);
      }
    }
    if (!((_g631 === clueAt(cl.number, _at629)))) return false;
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
        facts.length = 0;
        changed = false;
        let _c86: boolean = ((v_n >= 0) && (v_R === v_n));
        if (_c86) {
          let _q72 = true;
          Q73: {
            const _a74 = sp.adj4[v_c];
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_y = _a74[_i75];
              if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
              const v_t = (hasMarked(b, sp, cl, cands, v_c, v_y) + roomMarked(b, sp, cl, cands, v_c, v_y));
              const _a83 = run(sp, cl, v_c, v_y);
              for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                const v_e = _a83[_i84];
                for (let _m85 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m85 !== 0; _m85 &= _m85 - 1) {
                  const v_d = 31 - Math.clz32(_m85 & -_m85);
                  if (!((v_d <= v_t))) continue;
                  if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                  if (!(true)) {
                    _q72 = false;
                    break Q73;
                  }
                }
              }
            }
          }
          _c86 = _q72;
        }
        if (!(_c86)) return -1;
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
  const _g99: number[] = [];
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
  const _a96 = sp.cells;
  for (let _i97 = 0; _i97 < _a96.length; _i97++) {
    const v_c = _a96[_i97];
    const _h98 = clueAt(cl.number, v_c);
    if (!(((_h98 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    _g99.length = 0;
    G100: {
      const _a103 = sp.adj4[v_c];
      for (let _i104 = 0; _i104 < _a103.length; _i104++) {
        const v_y = _a103[_i104];
        if (!(((far(sp, cl, v_c, v_y) !== -1) && (mostMarked(b, sp, cl, cands, v_c, v_y) > 0)))) continue;
        _g99.push(v_y);
      }
    }
    L105: {
      const v_A = _g99;
      const _h106 = v_A.length;
      if (!((_h98 > ((_h106 - 1) * cl.maxb)))) break L105;
      facts.length = 0;
      changed = false;
      let _q107 = true;
      Q108: {
        const _a109 = v_A;
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_y = _a109[_i110];
          if (!((hasMarked(b, sp, cl, cands, v_c, v_y) === 0))) continue;
          const _a111 = run(sp, cl, v_c, v_y);
          for (let _i112 = 0; _i112 < _a111.length; _i112++) {
            const v_e = _a111[_i112];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q107 = false;
              break Q108;
            }
          }
        }
      }
      if (!(_q107)) return -1;
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
  const _a121 = sp.cells;
  R1:
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_c = _a121[_i122];
    const _m50_0 = b.made[0];
    const _m50_1 = b.made[1];
    const _h123 = clueAt(cl.number, v_c);
    if (!(((_h123 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    let _g124 = 0;
    G125: {
      const _a126 = sp.adj4[v_c];
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_y = _a126[_i127];
        if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
        _g124 += mostMarked(b, sp, cl, cands, v_c, v_y);
      }
    }
    const v_V = _g124;
    const _a128 = sp.adj4[v_c];
    for (let _i129 = 0; _i129 < _a128.length; _i129++) {
      const v_y = _a128[_i129];
      if (!(((((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && ((v_V - moreMarked(b, sp, cl, cands, v_c, v_y)) < _h123)))) continue;
      if (b.made[0] !== _m50_0 || b.made[1] !== _m50_1) {
        if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        let _g130 = 0;
        G131: {
          const _a132 = sp.adj4[v_c];
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_y = _a132[_i133];
            if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
            _g130 += mostMarked(b, sp, cl, cands, v_c, v_y);
          }
        }
        if (!((v_V === _g130))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      let _q134 = true;
      Q135: {
        const _a136 = run(sp, cl, v_c, v_y);
        for (let _i137 = 0; _i137 < _a136.length; _i137++) {
          const v_e = _a136[_i137];
          if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
          if (!(true)) {
            _q134 = false;
            break Q135;
          }
        }
      }
      if (!(_q134)) return -1;
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
  let _g166 = 0;
  G167: {
    const _a168 = sp.cells;
    for (let _i169 = 0; _i169 < _a168.length; _i169++) {
      const v_x = _a168[_i169];
      const _h170 = clueAt(cl.number, v_x);
      if (!((_h170 !== -1))) continue;
      _g166++;
    }
  }
  const v_N = _g166;
  const _a171 = sp.cells;
  R1:
  for (let _i172 = 0; _i172 < _a171.length; _i172++) {
    const v_c = _a171[_i172];
    const _m76_0 = b.made[0];
    const _m76_1 = b.made[1];
    const _h173 = clueAt(cl.number, v_c);
    if (!(((_h173 !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) continue;
    const _a174 = sp.adj4[v_c];
    for (let _i175 = 0; _i175 < _a174.length; _i175++) {
      const v_y = _a174[_i175];
      L176: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)))) break L176;
        const _t177 = run(sp, cl, v_c, v_y);
        L179: {
          const v_G = throughWhere(sp, v_c, (_te178: number): boolean => {  return (((least((cands[_te178] >= 0 ? cands[_te178] : (cands[_te178] = b.cands[_te178]))) - 1) > 0) || (_t177.includes(_te178))); });
          let _q180 = true;
          Q181: {
            const _a182 = v_G;
            for (let _i183 = 0; _i183 < _a182.length; _i183++) {
              const v_x = _a182[_i183];
              const _h184 = clueAt(cl.number, v_x);
              if (!((_h184 !== -1))) continue;
              const _a185 = sp.adj4[v_x];
              for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                const v_z = _a185[_i186];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q180 = false;
                  break Q181;
                }
              }
            }
          }
          let _c192: boolean = _q180;
          if (_c192) {
            let _q187 = true;
            Q188: {
              const _a189 = v_G;
              for (let _i190 = 0; _i190 < _a189.length; _i190++) {
                const v_x = _a189[_i190];
                const _h191 = clueAt(cl.number, v_x);
                if (!((((_h191 !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                  _q187 = false;
                  break Q188;
                }
              }
            }
            _c192 = _q187;
          }
          let _c198: boolean = _c192;
          if (_c198) {
            let _g193 = 0;
            G194: {
              const _a195 = v_G;
              for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                const v_x = _a195[_i196];
                const _h197 = clueAt(cl.number, v_x);
                if (!((_h197 !== -1))) continue;
                _g193++;
              }
            }
            _c198 = (_g193 < v_N);
          }
          if (!(_c198)) break L179;
          if (b.made[0] !== _m76_0 || b.made[1] !== _m76_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q199 = true;
          Q200: {
            const _a201 = run(sp, cl, v_c, v_y);
            for (let _i202 = 0; _i202 < _a201.length; _i202++) {
              const v_e = _a201[_i202];
              for (let _m203 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m203 !== 0; _m203 &= _m203 - 1) {
                const v_d = 31 - Math.clz32(_m203 & -_m203);
                if (!((v_d > 1))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q199 = false;
                  break Q200;
                }
              }
            }
          }
          if (!(_q199)) return -1;
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
  let _g317 = 0;
  G318: {
    const _a319 = sp.cells;
    for (let _i320 = 0; _i320 < _a319.length; _i320++) {
      const v_x = _a319[_i320];
      const _h321 = clueAt(cl.number, v_x);
      if (!((_h321 !== -1))) continue;
      _g317++;
    }
  }
  const v_N = _g317;
  const _a322 = sp.cells;
  R1:
  for (let _i323 = 0; _i323 < _a322.length; _i323++) {
    const v_c = _a322[_i323];
    const _m114_0 = b.made[0];
    const _m114_1 = b.made[1];
    const _h324 = clueAt(cl.number, v_c);
    if (!(((_h324 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a325 = sp.adj4[v_c];
    for (let _i326 = 0; _i326 < _a325.length; _i326++) {
      const v_y = _a325[_i326];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      L327: {
        const v_r = roomMarked(b, sp, cl, cands, v_c, v_y);
        if (!((v_r > 0))) break L327;
        const v_H = run(sp, cl, v_c, v_y);
        const v_G = throughWhere(sp, v_c, (_te328: number): boolean => {  return (((least((cands[_te328] >= 0 ? cands[_te328] : (cands[_te328] = b.cands[_te328]))) - 1) > 0) || (v_H.includes(_te328))); });
        const v_t = hasMarked(b, sp, cl, cands, v_c, v_y);
        let _g329 = -1;
        G330: {
          const _t331 = (v_t + 1);
          const _t332 = (v_t + v_r);
          for (let v_j = _t331; v_j <= _t332; v_j++) {
            let _q333 = false;
            Q334: {
              const _a335 = near(sp, cl, v_c, v_y);
              for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                const v_x = _a335[_i336];
                const _h337 = clueAt(cl.number, v_x);
                const _h361 = (v_x % sp.w);
                let _g338 = 0;
                G339: {
                  const _a340 = sp.adj4[v_x];
                  for (let _i341 = 0; _i341 < _a340.length; _i341++) {
                    const v_y = _a340[_i341];
                    if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                    let _g342 = 0;
                    G343: {
                      const _t344 = sp.adj4Edges[v_x][_i341];
                      for (let _i345 = 0; _i345 < 1; _i345++) {
                        const v_z = _t344;
                        if (!((v_H.includes(v_z)))) continue;
                        _g342 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                      }
                    }
                    _g338 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g342);
                  }
                }
                let _c381: boolean = ((_h337 - _g338) < 0);
                if (!_c381) {
                  let _g346 = 0;
                  G347: {
                    const _a348 = sp.adj4[v_x];
                    for (let _i349 = 0; _i349 < _a348.length; _i349++) {
                      const v_y = _a348[_i349];
                      if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                      const _h360 = (v_y % sp.w);
                      const _h362 = (_h360 === _h361);
                      const _h377 = sp.adj4Edges[v_x][_i349];
                      let _g350 = -1;
                      G351: {
                        const _t352 = cl.maxb;
                        for (let v_k = _t352; v_k >= 0; v_k--) {
                          let _c380: boolean = (v_k === 0);
                          if (!_c380) {
                            let _q353 = false;
                            Q354: {
                              const _a355 = mid(sp, cl, v_x, v_y);
                              for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                                const v_m = _a355[_i356];
                                const _h359 = (v_m % sp.w);
                                const _a357 = sp.adj4[v_m];
                                for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                                  const v_p = _a357[_i358];
                                  if (!((((v_p % sp.w) === _h359) !== _h362))) continue;
                                  const _t363 = sp.adj4Edges[v_m][_i358];
                                  if ((((least((cands[_t363] >= 0 ? cands[_t363] : (cands[_t363] = b.cands[_t363]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i358])))) {
                                    _q353 = true;
                                    break Q354;
                                  }
                                }
                              }
                            }
                            let _c374: boolean = !(_q353);
                            if (_c374) {
                              const _t364 = far(sp, cl, v_x, v_y);
                              const _h365 = clueAt(cl.number, _t364);
                              let _g366 = 0;
                              G367: {
                                const _a368 = sp.adj4[_t364];
                                for (let _i369 = 0; _i369 < _a368.length; _i369++) {
                                  const v_y = _a368[_i369];
                                  if (!((far(sp, cl, _t364, v_y) !== -1))) continue;
                                  let _g370 = 0;
                                  G371: {
                                    const _t372 = sp.adj4Edges[_t364][_i369];
                                    for (let _i373 = 0; _i373 < 1; _i373++) {
                                      const v_z = _t372;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g370 += (v_j - hasMarked(b, sp, cl, cands, _t364, v_y));
                                    }
                                  }
                                  _g366 += (hasMarked(b, sp, cl, cands, _t364, v_y) + _g370);
                                }
                              }
                              _c374 = (v_k <= (_h365 - _g366));
                            }
                            let _c379: boolean = _c374;
                            if (_c379) {
                              let _g375 = 0;
                              G376: {
                                for (let _i378 = 0; _i378 < 1; _i378++) {
                                  const v_z = _h377;
                                  if (!((v_H.includes(v_z)))) continue;
                                  _g375 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                }
                              }
                              _c379 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g375) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                            }
                            _c380 = _c379;
                          }
                          if (!(_c380)) continue;
                          _g350 = v_k;
                          break G351;
                        }
                      }
                      _g346 += _g350;
                    }
                  }
                  _c381 = (_g346 < (_h337 - _g338));
                }
                if (_c381) {
                  _q333 = true;
                  break Q334;
                }
              }
            }
            let _c409: boolean = _q333;
            if (!_c409) {
              let _q382 = true;
              Q383: {
                const _a384 = v_G;
                for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                  const v_x = _a384[_i385];
                  const _h386 = clueAt(cl.number, v_x);
                  if (!((_h386 !== -1))) continue;
                  const _a387 = sp.adj4[v_x];
                  for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                    const v_z = _a387[_i388];
                    if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                    if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                      _q382 = false;
                      break Q383;
                    }
                  }
                }
              }
              let _c402: boolean = _q382;
              if (_c402) {
                let _q389 = true;
                Q390: {
                  const _a391 = v_G;
                  for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                    const v_x = _a391[_i392];
                    const _h393 = clueAt(cl.number, v_x);
                    if (!((_h393 !== -1))) continue;
                    let _g394 = 0;
                    G395: {
                      const _a396 = sp.adj4[v_x];
                      for (let _i397 = 0; _i397 < _a396.length; _i397++) {
                        const v_y = _a396[_i397];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g398 = 0;
                        G399: {
                          const _t400 = sp.adj4Edges[v_x][_i397];
                          for (let _i401 = 0; _i401 < 1; _i401++) {
                            const v_z = _t400;
                            if (!((v_H.includes(v_z)))) continue;
                            _g398 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g394 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g398);
                      }
                    }
                    if (!(((_h393 - _g394) === 0))) {
                      _q389 = false;
                      break Q390;
                    }
                  }
                }
                _c402 = _q389;
              }
              let _c408: boolean = _c402;
              if (_c408) {
                let _g403 = 0;
                G404: {
                  const _a405 = v_G;
                  for (let _i406 = 0; _i406 < _a405.length; _i406++) {
                    const v_x = _a405[_i406];
                    const _h407 = clueAt(cl.number, v_x);
                    if (!((_h407 !== -1))) continue;
                    _g403++;
                  }
                }
                _c408 = (_g403 < v_N);
              }
              _c409 = _c408;
            }
            if (!(_c409)) continue;
            _g329 = v_j;
            break G330;
          }
        }
        L410: {
          const v_k = _g329;
          if (!((v_k > 0))) break L410;
          if (b.made[0] !== _m114_0 || b.made[1] !== _m114_1) {
            if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q411 = true;
          Q412: {
            const _a413 = v_H;
            for (let _i414 = 0; _i414 < _a413.length; _i414++) {
              const v_e = _a413[_i414];
              for (let _m415 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m415 !== 0; _m415 &= _m415 - 1) {
                const v_d = 31 - Math.clz32(_m415 & -_m415);
                if (!((v_d > v_k))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q411 = false;
                  break Q412;
                }
              }
            }
          }
          if (!(_q411)) return -1;
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
const _st482 = stamps();

/** Its dearest read grows with the board as n^2. */
export function mustReachOut(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustReachOutBinding> | null): number {
  const _g476: number[] = [];
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
  let _g461 = 0;
  G462: {
    const _a463 = sp.cells;
    for (let _i464 = 0; _i464 < _a463.length; _i464++) {
      const v_x = _a463[_i464];
      const _h465 = clueAt(cl.number, v_x);
      if (!((_h465 !== -1))) continue;
      _g461++;
    }
  }
  const v_N = _g461;
  const _a466 = sp.cells;
  R1:
  for (let _i467 = 0; _i467 < _a466.length; _i467++) {
    const v_c = _a466[_i467];
    const _m187_0 = b.made[0];
    const _m187_1 = b.made[1];
    const _h468 = clueAt(cl.number, v_c);
    if (!(((_h468 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a469 = sp.adj4[v_c];
    for (let _i470 = 0; _i470 < _a469.length; _i470++) {
      const v_y = _a469[_i470];
      let _c475: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
      if (_c475) {
        let _g471 = 0;
        G472: {
          const _a473 = sp.adj4[v_c];
          for (let _i474 = 0; _i474 < _a473.length; _i474++) {
            const v_z = _a473[_i474];
            if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
            _g471 += roomMarked(b, sp, cl, cands, v_c, v_z);
          }
        }
        _c475 = (_g471 === needMarked(b, sp, cl, cands, v_c));
      }
      if (!(_c475)) continue;
      _g476.length = 0;
      _st482.pass++;
      G477: {
        const _a483 = sp.adj4[v_c];
        for (let _i484 = 0; _i484 < _a483.length; _i484++) {
          const v_z = _a483[_i484];
          if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
          const _a485 = run(sp, cl, v_c, v_z);
          for (let _i486 = 0; _i486 < _a485.length; _i486++) {
            const v_e = _a485[_i486];
            const _t487 = v_e;
            if (_g476.length < 16) { if (!_g476.includes(_t487)) _g476.push(_t487); } else addOnce(_g476, _st482, _t487);
          }
        }
      }
      const v_F = _g476;
      L489: {
        const v_G = throughWhere(sp, v_c, (_te488: number): boolean => {  return (((least((cands[_te488] >= 0 ? cands[_te488] : (cands[_te488] = b.cands[_te488]))) - 1) > 0) || (v_F.includes(_te488))); });
        let _q490 = true;
        Q491: {
          const _a492 = v_G;
          for (let _i493 = 0; _i493 < _a492.length; _i493++) {
            const v_x = _a492[_i493];
            const _h494 = clueAt(cl.number, v_x);
            if (!((_h494 !== -1))) continue;
            const _a495 = sp.adj4[v_x];
            for (let _i496 = 0; _i496 < _a495.length; _i496++) {
              const v_z = _a495[_i496];
              if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
              if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                _q490 = false;
                break Q491;
              }
            }
          }
        }
        let _c506: boolean = _q490;
        if (_c506) {
          let _q497 = true;
          Q498: {
            const _a499 = v_G;
            for (let _i500 = 0; _i500 < _a499.length; _i500++) {
              const v_x = _a499[_i500];
              const _h501 = clueAt(cl.number, v_x);
              if (!(((_h501 !== -1) && (v_x !== v_c)))) continue;
              let _g502 = 0;
              G503: {
                const _a504 = sp.adj4[v_c];
                for (let _i505 = 0; _i505 < _a504.length; _i505++) {
                  const v_z = _a504[_i505];
                  if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                  _g502 += roomMarked(b, sp, cl, cands, v_c, v_z);
                }
              }
              if (!((needMarked(b, sp, cl, cands, v_x) === _g502))) {
                _q497 = false;
                break Q498;
              }
            }
          }
          _c506 = _q497;
        }
        let _c512: boolean = _c506;
        if (_c512) {
          let _g507 = 0;
          G508: {
            const _a509 = v_G;
            for (let _i510 = 0; _i510 < _a509.length; _i510++) {
              const v_x = _a509[_i510];
              const _h511 = clueAt(cl.number, v_x);
              if (!((_h511 !== -1))) continue;
              _g507++;
            }
          }
          _c512 = (_g507 < v_N);
        }
        if (!(_c512)) break L489;
        if (b.made[0] !== _m187_0 || b.made[1] !== _m187_1) {
          if (!(((clueAt(cl.number, v_c) !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _q513 = true;
        Q514: {
          const _a515 = run(sp, cl, v_c, v_y);
          for (let _i516 = 0; _i516 < _a515.length; _i516++) {
            const v_e = _a515[_i516];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q513 = false;
              break Q514;
            }
          }
        }
        if (!(_q513)) return -1;
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
  const _g528: number[] = [];
  const _g541: number[] = [];
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
  _g528.length = 0;
  G529: {
    const _a532 = sp.edges;
    for (let _i533 = 0; _i533 < _a532.length; _i533++) {
      const v_e = _a532[_i533];
      if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
      _g528.push(v_e);
    }
  }
  const v_L = _g528;
  const _eg540 = edgeGroups(sp, v_L);
  const _a534 = sp.cells;
  for (let _i535 = 0; _i535 < _a534.length; _i535++) {
    const v_c = _a534[_i535];
    const _h536 = clueAt(cl.number, v_c);
    if (!((_h536 !== -1))) continue;
    const _a537 = sp.adj4[v_c];
    for (let _i538 = 0; _i538 < _a537.length; _i538++) {
      const v_y = _a537[_i538];
      L539: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (_eg540.of(v_f) === _eg540.of(v_c))))) break L539;
        if (b.made[1] !== _m223_1) {
          _g541.length = 0;
          G542: {
            const _a545 = sp.edges;
            for (let _i546 = 0; _i546 < _a545.length; _i546++) {
              const v_e = _a545[_i546];
              if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
              _g541.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g541))) { return fired; }
        }
        facts.length = 0;
        changed = false;
        let _q547 = true;
        Q548: {
          const _a549 = run(sp, cl, v_c, v_y);
          for (let _i550 = 0; _i550 < _a549.length; _i550++) {
            const v_e = _a549[_i550];
            for (let _m551 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m551 !== 0; _m551 &= _m551 - 1) {
              const v_d = 31 - Math.clz32(_m551 & -_m551);
              if (!((v_d > 1))) continue;
              if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
              if (!(true)) {
                _q547 = false;
                break Q548;
              }
            }
          }
        }
        if (!(_q547)) return -1;
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
  const _g76: number[] = [];
  G77: {
    const _a80 = mid(sp, cl, v_c, v_y);
    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
      const v_m = _a80[_i81];
      const _t82 = sp.edgeOf(v_m, (ray(sp, v_c, v_y)[(ray(sp, v_c, v_y).indexOf(v_m) + 1)] ?? -1));
      if (!_g76.includes(_t82)) _g76.push(_t82);
    }
  }
  const _made = union(setOf(sp.edgeOf(v_c, v_y)), _g76);
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
  const _g220: number[] = [];
  G221: {
    const _t226 = far(sp, cl, v_c, v_y);
    for (let _i227 = 0; _i227 < 2; _i227++) {
      const v_x = _i227 === 0 ? v_c : _t226;
      if (_i227 === 1 && (v_x === v_c)) continue;
      const _a228 = sp.adj4[v_x];
      for (let _i229 = 0; _i229 < _a228.length; _i229++) {
        const v_z = _a228[_i229];
        if (!((far(sp, cl, v_x, v_z) !== -1))) continue;
        const _t230 = far(sp, cl, v_x, v_z);
        if (!_g220.includes(_t230)) _g220.push(_t230);
      }
    }
  }
  const _g231: number[] = [];
  G232: {
    const _a237 = mid(sp, cl, v_c, v_y);
    for (let _i238 = 0; _i238 < _a237.length; _i238++) {
      const v_m = _a237[_i238];
      const _a239 = sp.adj4[v_m];
      for (let _i240 = 0; _i240 < _a239.length; _i240++) {
        const v_p = _a239[_i240];
        if (!(((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))) && (far(sp, cl, v_m, v_p) !== -1)))) continue;
        const _t241 = far(sp, cl, v_m, v_p);
        if (!_g231.includes(_t241)) _g231.push(_t241);
      }
    }
  }
  const _made = union(union(setOf(v_c), _g220), _g231);
  _kept1[v_y] = _made;
  return _made;
}
