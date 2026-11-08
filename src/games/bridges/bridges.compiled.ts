// Compiled by `npm run describe` from src/games/bridges/bridges.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt, edgeGroups, keptStore, least, minus, rangeMask, ray, setOf, through, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g591: number[] = [];
  const _g607: number[] = [];
  const _domain = rangeMask(1, (cl.maxb + 1));
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q540 = true;
  Q541: {
    const _a542 = sp.edges;
    for (let _i543 = 0; _i543 < _a542.length; _i543++) {
      const v_e = _a542[_i543];
      const _t544 = sp.edgeEnds[2 * v_e];
      const _h545 = clueAt(cl.number, _t544);
      let _c548: boolean = (_h545 !== -1);
      if (_c548) {
        const _t546 = sp.edgeEnds[2 * v_e + 1];
        const _h547 = clueAt(cl.number, _t546);
        _c548 = (_h547 !== -1);
      }
      if (!(_c548)) continue;
      const _h549 = (g[v_e] || -1);
      if (!((_h549 === 1))) {
        _q540 = false;
        break Q541;
      }
    }
  }
  if (!(_q540)) return false;
  let _q550 = true;
  Q551: {
    const _a552 = sp.cells;
    for (let _i553 = 0; _i553 < _a552.length; _i553++) {
      const v_c = _a552[_i553];
      const _h554 = clueAt(cl.number, v_c);
      if (!(!((_h554 !== -1)))) continue;
      const _h563 = (v_c % sp.w);
      const _h564 = (2 * _h563);
      const _h566 = ((v_c / sp.w) | 0);
      const _h567 = (2 * _h566);
      const _a555 = sp.adj4[v_c];
      for (let _i556 = 0; _i556 < _a555.length; _i556++) {
        const v_a = _a555[_i556];
        const _h557 = (g[sp.adj4Edges[v_c][_i556]] || -1);
        const _h562 = (v_a % sp.w);
        const _h565 = ((v_a / sp.w) | 0);
        const _h569 = sp.adj4Edges[v_c][_i556];
        const _h570 = (g[_h569] || -1);
        let _c571: boolean = (_h557 === 1);
        if (!_c571) {
          let _q558 = false;
          Q559: {
            const _a560 = sp.adj4[v_c];
            for (let _i561 = 0; _i561 < _a560.length; _i561++) {
              const v_b = _a560[_i561];
              if (!((((_h562 + (v_b % sp.w)) === _h564) && ((_h565 + ((v_b / sp.w) | 0)) === _h567)))) continue;
              const _h568 = (g[sp.adj4Edges[v_c][_i561]] || -1);
              if ((_h568 === _h570)) {
                _q558 = true;
                break Q559;
              }
            }
          }
          _c571 = _q558;
        }
        if (!(_c571)) {
          _q550 = false;
          break Q551;
        }
      }
    }
  }
  if (!(_q550)) return false;
  let _q572 = true;
  Q573: {
    const _a574 = sp.cells;
    for (let _i575 = 0; _i575 < _a574.length; _i575++) {
      const v_c = _a574[_i575];
      const _h576 = clueAt(cl.number, v_c);
      if (!(!((_h576 !== -1)))) continue;
      const _h582 = (v_c % sp.w);
      const _h584 = ((v_c / sp.w) | 0);
      const _a577 = sp.adj4[v_c];
      for (let _i578 = 0; _i578 < _a577.length; _i578++) {
        const v_a = _a577[_i578];
        const _h581 = (v_a % sp.w);
        const _h583 = (_h581 === _h582);
        const _h585 = sp.adj4Edges[v_c][_i578];
        const _h586 = (g[_h585] || -1);
        const _h587 = (_h586 === 1);
        const _a579 = sp.adj4[v_c];
        for (let _i580 = 0; _i580 < _a579.length; _i580++) {
          const v_b = _a579[_i580];
          if (!((_h583 && (((v_b / sp.w) | 0) === _h584)))) continue;
          const _h588 = (g[sp.adj4Edges[v_c][_i580]] || -1);
          if (!((_h587 || (_h588 === 1)))) {
            _q572 = false;
            break Q573;
          }
        }
      }
    }
  }
  if (!(_q572)) return false;
  let _q589 = true;
  Q590: {
    _g591.length = 0;
    G592: {
      const _a595 = sp.edges;
      for (let _i596 = 0; _i596 < _a595.length; _i596++) {
        const v_e = _a595[_i596];
        const _h597 = (g[v_e] || -1);
        if (!((_h597 > 1))) continue;
        _g591.push(v_e);
      }
    }
    const v_L = _g591;
    const _eg604 = edgeGroups(sp, v_L);
    const _a598 = sp.cells;
    for (let _i599 = 0; _i599 < _a598.length; _i599++) {
      const v_a = _a598[_i599];
      const _h600 = clueAt(cl.number, v_a);
      if (!((_h600 !== -1))) continue;
      const _a601 = sp.cells;
      for (let _i602 = 0; _i602 < _a601.length; _i602++) {
        const v_b = _a601[_i602];
        const _h603 = clueAt(cl.number, v_b);
        if (!((_h603 !== -1))) continue;
        if (!((_eg604.of(v_b) === _eg604.of(v_a)))) {
          _q589 = false;
          break Q590;
        }
      }
    }
  }
  if (!(_q589)) return false;
  if (variations.includes("no loops")) {
    let _q605 = true;
    Q606: {
      _g607.length = 0;
      G608: {
        const _a611 = sp.edges;
        for (let _i612 = 0; _i612 < _a611.length; _i612++) {
          const v_e = _a611[_i612];
          const _h613 = (g[v_e] || -1);
          if (!((_h613 > 1))) continue;
          _g607.push(v_e);
        }
      }
      const v_L = _g607;
      const _a614 = v_L;
      for (let _i615 = 0; _i615 < _a614.length; _i615++) {
        const v_e = _a614[_i615];
        if (!(!(through(sp, sp.edgeEnds[2 * v_e], minus(v_L, setOf(v_e))).includes(sp.edgeEnds[2 * v_e + 1])))) {
          _q605 = false;
          break Q606;
        }
      }
    }
    if (!(_q605)) return false;
  }
  for (let _k616 = 0; _k616 < cl.number.at.length; _k616++) {
    const _at617 = cl.number.at[_k616];
    let _g619 = 0;
    G620: {
      const _a621 = sp.adj4[_at617];
      for (let _i622 = 0; _i622 < _a621.length; _i622++) {
        _g619 += ((g[sp.adj4Edges[_at617][_i622]] || -1) - 1);
      }
    }
    if (!((_g619 === clueAt(cl.number, _at617)))) return false;
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
        if (fire !== null && !fire({ c: v_c, A: v_A }, facts)) return 1;
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
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_c = _a121[_i122];
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
      facts.length = 0;
      changed = false;
      let _q130 = true;
      Q131: {
        const _a132 = run(sp, cl, v_c, v_y);
        for (let _i133 = 0; _i133 < _a132.length; _i133++) {
          const v_e = _a132[_i133];
          if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
          if (!(true)) {
            _q130 = false;
            break Q131;
          }
        }
      }
      if (!(_q130)) return -1;
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
  let _g162 = 0;
  G163: {
    const _a164 = sp.cells;
    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
      const v_x = _a164[_i165];
      const _h166 = clueAt(cl.number, v_x);
      if (!((_h166 !== -1))) continue;
      _g162++;
    }
  }
  const v_N = _g162;
  const _a167 = sp.cells;
  for (let _i168 = 0; _i168 < _a167.length; _i168++) {
    const v_c = _a167[_i168];
    const _h169 = clueAt(cl.number, v_c);
    if (!(((_h169 !== -1) && (needMarked(b, sp, cl, cands, v_c) === 1)))) continue;
    const _a170 = sp.adj4[v_c];
    for (let _i171 = 0; _i171 < _a170.length; _i171++) {
      const v_y = _a170[_i171];
      L172: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (needMarked(b, sp, cl, cands, v_f) === 1)) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)))) break L172;
        const _t173 = run(sp, cl, v_c, v_y);
        L175: {
          const v_G = throughWhere(sp, v_c, (_te174: number): boolean => {  return (((least((cands[_te174] >= 0 ? cands[_te174] : (cands[_te174] = b.cands[_te174]))) - 1) > 0) || (_t173.includes(_te174))); });
          let _q176 = true;
          Q177: {
            const _a178 = v_G;
            for (let _i179 = 0; _i179 < _a178.length; _i179++) {
              const v_x = _a178[_i179];
              const _h180 = clueAt(cl.number, v_x);
              if (!((_h180 !== -1))) continue;
              const _a181 = sp.adj4[v_x];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_z = _a181[_i182];
                if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                  _q176 = false;
                  break Q177;
                }
              }
            }
          }
          let _c188: boolean = _q176;
          if (_c188) {
            let _q183 = true;
            Q184: {
              const _a185 = v_G;
              for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                const v_x = _a185[_i186];
                const _h187 = clueAt(cl.number, v_x);
                if (!((((_h187 !== -1) && (v_x !== v_c)) && (v_x !== v_f)))) continue;
                if (!((needMarked(b, sp, cl, cands, v_x) === 0))) {
                  _q183 = false;
                  break Q184;
                }
              }
            }
            _c188 = _q183;
          }
          let _c194: boolean = _c188;
          if (_c194) {
            let _g189 = 0;
            G190: {
              const _a191 = v_G;
              for (let _i192 = 0; _i192 < _a191.length; _i192++) {
                const v_x = _a191[_i192];
                const _h193 = clueAt(cl.number, v_x);
                if (!((_h193 !== -1))) continue;
                _g189++;
              }
            }
            _c194 = (_g189 < v_N);
          }
          if (!(_c194)) break L175;
          facts.length = 0;
          changed = false;
          let _q195 = true;
          Q196: {
            const _a197 = run(sp, cl, v_c, v_y);
            for (let _i198 = 0; _i198 < _a197.length; _i198++) {
              const v_e = _a197[_i198];
              for (let _m199 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m199 !== 0; _m199 &= _m199 - 1) {
                const v_d = 31 - Math.clz32(_m199 & -_m199);
                if (!((v_d > 1))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q195 = false;
                  break Q196;
                }
              }
            }
          }
          if (!(_q195)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, f: v_f, G: v_G }, facts)) return 1;
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
  let _g313 = 0;
  G314: {
    const _a315 = sp.cells;
    for (let _i316 = 0; _i316 < _a315.length; _i316++) {
      const v_x = _a315[_i316];
      const _h317 = clueAt(cl.number, v_x);
      if (!((_h317 !== -1))) continue;
      _g313++;
    }
  }
  const v_N = _g313;
  const _a318 = sp.cells;
  for (let _i319 = 0; _i319 < _a318.length; _i319++) {
    const v_c = _a318[_i319];
    const _h320 = clueAt(cl.number, v_c);
    if (!(((_h320 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a321 = sp.adj4[v_c];
    for (let _i322 = 0; _i322 < _a321.length; _i322++) {
      const v_y = _a321[_i322];
      if (!((far(sp, cl, v_c, v_y) !== -1))) continue;
      L323: {
        const v_r = roomMarked(b, sp, cl, cands, v_c, v_y);
        if (!((v_r > 0))) break L323;
        const v_H = run(sp, cl, v_c, v_y);
        const v_G = throughWhere(sp, v_c, (_te324: number): boolean => {  return (((least((cands[_te324] >= 0 ? cands[_te324] : (cands[_te324] = b.cands[_te324]))) - 1) > 0) || (v_H.includes(_te324))); });
        const v_t = hasMarked(b, sp, cl, cands, v_c, v_y);
        let _g325 = -1;
        G326: {
          const _t327 = (v_t + 1);
          const _t328 = (v_t + v_r);
          for (let v_j = _t327; v_j <= _t328; v_j++) {
            let _q329 = false;
            Q330: {
              const _a331 = near(sp, cl, v_c, v_y);
              for (let _i332 = 0; _i332 < _a331.length; _i332++) {
                const v_x = _a331[_i332];
                const _h333 = clueAt(cl.number, v_x);
                const _h357 = (v_x % sp.w);
                let _g334 = 0;
                G335: {
                  const _a336 = sp.adj4[v_x];
                  for (let _i337 = 0; _i337 < _a336.length; _i337++) {
                    const v_y = _a336[_i337];
                    if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                    let _g338 = 0;
                    G339: {
                      const _t340 = sp.adj4Edges[v_x][_i337];
                      for (let _i341 = 0; _i341 < 1; _i341++) {
                        const v_z = _t340;
                        if (!((v_H.includes(v_z)))) continue;
                        _g338 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                      }
                    }
                    _g334 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g338);
                  }
                }
                let _c377: boolean = ((_h333 - _g334) < 0);
                if (!_c377) {
                  let _g342 = 0;
                  G343: {
                    const _a344 = sp.adj4[v_x];
                    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                      const v_y = _a344[_i345];
                      if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                      const _h356 = (v_y % sp.w);
                      const _h358 = (_h356 === _h357);
                      const _h373 = sp.adj4Edges[v_x][_i345];
                      let _g346 = -1;
                      G347: {
                        const _t348 = cl.maxb;
                        for (let v_k = _t348; v_k >= 0; v_k--) {
                          let _c376: boolean = (v_k === 0);
                          if (!_c376) {
                            let _q349 = false;
                            Q350: {
                              const _a351 = mid(sp, cl, v_x, v_y);
                              for (let _i352 = 0; _i352 < _a351.length; _i352++) {
                                const v_m = _a351[_i352];
                                const _h355 = (v_m % sp.w);
                                const _a353 = sp.adj4[v_m];
                                for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                                  const v_p = _a353[_i354];
                                  if (!((((v_p % sp.w) === _h355) !== _h358))) continue;
                                  const _t359 = sp.adj4Edges[v_m][_i354];
                                  if ((((least((cands[_t359] >= 0 ? cands[_t359] : (cands[_t359] = b.cands[_t359]))) - 1) > 0) || (v_H.includes(sp.adj4Edges[v_m][_i354])))) {
                                    _q349 = true;
                                    break Q350;
                                  }
                                }
                              }
                            }
                            let _c370: boolean = !(_q349);
                            if (_c370) {
                              const _t360 = far(sp, cl, v_x, v_y);
                              const _h361 = clueAt(cl.number, _t360);
                              let _g362 = 0;
                              G363: {
                                const _a364 = sp.adj4[_t360];
                                for (let _i365 = 0; _i365 < _a364.length; _i365++) {
                                  const v_y = _a364[_i365];
                                  if (!((far(sp, cl, _t360, v_y) !== -1))) continue;
                                  let _g366 = 0;
                                  G367: {
                                    const _t368 = sp.adj4Edges[_t360][_i365];
                                    for (let _i369 = 0; _i369 < 1; _i369++) {
                                      const v_z = _t368;
                                      if (!((v_H.includes(v_z)))) continue;
                                      _g366 += (v_j - hasMarked(b, sp, cl, cands, _t360, v_y));
                                    }
                                  }
                                  _g362 += (hasMarked(b, sp, cl, cands, _t360, v_y) + _g366);
                                }
                              }
                              _c370 = (v_k <= (_h361 - _g362));
                            }
                            let _c375: boolean = _c370;
                            if (_c375) {
                              let _g371 = 0;
                              G372: {
                                for (let _i374 = 0; _i374 < 1; _i374++) {
                                  const v_z = _h373;
                                  if (!((v_H.includes(v_z)))) continue;
                                  _g371 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                                }
                              }
                              _c375 = (((hasMarked(b, sp, cl, cands, v_x, v_y) + _g371) + v_k) <= allowsMarked(b, sp, cl, cands, v_x, v_y));
                            }
                            _c376 = _c375;
                          }
                          if (!(_c376)) continue;
                          _g346 = v_k;
                          break G347;
                        }
                      }
                      _g342 += _g346;
                    }
                  }
                  _c377 = (_g342 < (_h333 - _g334));
                }
                if (_c377) {
                  _q329 = true;
                  break Q330;
                }
              }
            }
            let _c405: boolean = _q329;
            if (!_c405) {
              let _q378 = true;
              Q379: {
                const _a380 = v_G;
                for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                  const v_x = _a380[_i381];
                  const _h382 = clueAt(cl.number, v_x);
                  if (!((_h382 !== -1))) continue;
                  const _a383 = sp.adj4[v_x];
                  for (let _i384 = 0; _i384 < _a383.length; _i384++) {
                    const v_z = _a383[_i384];
                    if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
                    if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                      _q378 = false;
                      break Q379;
                    }
                  }
                }
              }
              let _c398: boolean = _q378;
              if (_c398) {
                let _q385 = true;
                Q386: {
                  const _a387 = v_G;
                  for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                    const v_x = _a387[_i388];
                    const _h389 = clueAt(cl.number, v_x);
                    if (!((_h389 !== -1))) continue;
                    let _g390 = 0;
                    G391: {
                      const _a392 = sp.adj4[v_x];
                      for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                        const v_y = _a392[_i393];
                        if (!((far(sp, cl, v_x, v_y) !== -1))) continue;
                        let _g394 = 0;
                        G395: {
                          const _t396 = sp.adj4Edges[v_x][_i393];
                          for (let _i397 = 0; _i397 < 1; _i397++) {
                            const v_z = _t396;
                            if (!((v_H.includes(v_z)))) continue;
                            _g394 += (v_j - hasMarked(b, sp, cl, cands, v_x, v_y));
                          }
                        }
                        _g390 += (hasMarked(b, sp, cl, cands, v_x, v_y) + _g394);
                      }
                    }
                    if (!(((_h389 - _g390) === 0))) {
                      _q385 = false;
                      break Q386;
                    }
                  }
                }
                _c398 = _q385;
              }
              let _c404: boolean = _c398;
              if (_c404) {
                let _g399 = 0;
                G400: {
                  const _a401 = v_G;
                  for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                    const v_x = _a401[_i402];
                    const _h403 = clueAt(cl.number, v_x);
                    if (!((_h403 !== -1))) continue;
                    _g399++;
                  }
                }
                _c404 = (_g399 < v_N);
              }
              _c405 = _c404;
            }
            if (!(_c405)) continue;
            _g325 = v_j;
            break G326;
          }
        }
        L406: {
          const v_k = _g325;
          if (!((v_k > 0))) break L406;
          facts.length = 0;
          changed = false;
          let _q407 = true;
          Q408: {
            const _a409 = v_H;
            for (let _i410 = 0; _i410 < _a409.length; _i410++) {
              const v_e = _a409[_i410];
              for (let _m411 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m411 !== 0; _m411 &= _m411 - 1) {
                const v_d = 31 - Math.clz32(_m411 & -_m411);
                if (!((v_d > v_k))) continue;
                if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
                if (!(true)) {
                  _q407 = false;
                  break Q408;
                }
              }
            }
          }
          if (!(_q407)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, r: v_r, H: v_H, G: v_G, t: v_t, k: v_k }, facts)) return 1;
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

/** Its dearest read grows with the board as n^2. */
export function mustReachOut(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustReachOutBinding> | null): number {
  const _g472: number[] = [];
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
  let _g457 = 0;
  G458: {
    const _a459 = sp.cells;
    for (let _i460 = 0; _i460 < _a459.length; _i460++) {
      const v_x = _a459[_i460];
      const _h461 = clueAt(cl.number, v_x);
      if (!((_h461 !== -1))) continue;
      _g457++;
    }
  }
  const v_N = _g457;
  const _a462 = sp.cells;
  for (let _i463 = 0; _i463 < _a462.length; _i463++) {
    const v_c = _a462[_i463];
    const _h464 = clueAt(cl.number, v_c);
    if (!(((_h464 !== -1) && (needMarked(b, sp, cl, cands, v_c) > 0)))) continue;
    const _a465 = sp.adj4[v_c];
    for (let _i466 = 0; _i466 < _a465.length; _i466++) {
      const v_y = _a465[_i466];
      let _c471: boolean = (((far(sp, cl, v_c, v_y) !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (roomMarked(b, sp, cl, cands, v_c, v_y) > 0));
      if (_c471) {
        let _g467 = 0;
        G468: {
          const _a469 = sp.adj4[v_c];
          for (let _i470 = 0; _i470 < _a469.length; _i470++) {
            const v_z = _a469[_i470];
            if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)))) continue;
            _g467 += roomMarked(b, sp, cl, cands, v_c, v_z);
          }
        }
        _c471 = (_g467 === needMarked(b, sp, cl, cands, v_c));
      }
      if (!(_c471)) continue;
      _g472.length = 0;
      G473: {
        const _a478 = sp.adj4[v_c];
        for (let _i479 = 0; _i479 < _a478.length; _i479++) {
          const v_z = _a478[_i479];
          if (!((((v_z !== v_y) && (far(sp, cl, v_c, v_z) !== -1)) && (roomMarked(b, sp, cl, cands, v_c, v_z) > 0)))) continue;
          const _a480 = run(sp, cl, v_c, v_z);
          for (let _i481 = 0; _i481 < _a480.length; _i481++) {
            const v_e = _a480[_i481];
            if (!_g472.includes(v_e)) _g472.push(v_e);
          }
        }
      }
      const v_F = _g472;
      L483: {
        const v_G = throughWhere(sp, v_c, (_te482: number): boolean => {  return (((least((cands[_te482] >= 0 ? cands[_te482] : (cands[_te482] = b.cands[_te482]))) - 1) > 0) || (v_F.includes(_te482))); });
        let _q484 = true;
        Q485: {
          const _a486 = v_G;
          for (let _i487 = 0; _i487 < _a486.length; _i487++) {
            const v_x = _a486[_i487];
            const _h488 = clueAt(cl.number, v_x);
            if (!((_h488 !== -1))) continue;
            const _a489 = sp.adj4[v_x];
            for (let _i490 = 0; _i490 < _a489.length; _i490++) {
              const v_z = _a489[_i490];
              if (!(((far(sp, cl, v_x, v_z) !== -1) && (hasMarked(b, sp, cl, cands, v_x, v_z) > 0)))) continue;
              if (!((v_G.includes(far(sp, cl, v_x, v_z))))) {
                _q484 = false;
                break Q485;
              }
            }
          }
        }
        let _c500: boolean = _q484;
        if (_c500) {
          let _q491 = true;
          Q492: {
            const _a493 = v_G;
            for (let _i494 = 0; _i494 < _a493.length; _i494++) {
              const v_x = _a493[_i494];
              const _h495 = clueAt(cl.number, v_x);
              if (!(((_h495 !== -1) && (v_x !== v_c)))) continue;
              let _g496 = 0;
              G497: {
                const _a498 = sp.adj4[v_c];
                for (let _i499 = 0; _i499 < _a498.length; _i499++) {
                  const v_z = _a498[_i499];
                  if (!(((v_z !== v_y) && (far(sp, cl, v_c, v_z) === v_x)))) continue;
                  _g496 += roomMarked(b, sp, cl, cands, v_c, v_z);
                }
              }
              if (!((needMarked(b, sp, cl, cands, v_x) === _g496))) {
                _q491 = false;
                break Q492;
              }
            }
          }
          _c500 = _q491;
        }
        let _c506: boolean = _c500;
        if (_c506) {
          let _g501 = 0;
          G502: {
            const _a503 = v_G;
            for (let _i504 = 0; _i504 < _a503.length; _i504++) {
              const v_x = _a503[_i504];
              const _h505 = clueAt(cl.number, v_x);
              if (!((_h505 !== -1))) continue;
              _g501++;
            }
          }
          _c506 = (_g501 < v_N);
        }
        if (!(_c506)) break L483;
        facts.length = 0;
        changed = false;
        let _q507 = true;
        Q508: {
          const _a509 = run(sp, cl, v_c, v_y);
          for (let _i510 = 0; _i510 < _a509.length; _i510++) {
            const v_e = _a509[_i510];
            if ((((b.cands[v_e] >> 1) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, 1); changed = true; } else facts.push(STRIKE, v_e, 1); }
            if (!(true)) {
              _q507 = false;
              break Q508;
            }
          }
        }
        if (!(_q507)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ N: v_N, c: v_c, y: v_y, F: v_F, G: v_G }, facts)) return 1;
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
  const _g522: number[] = [];
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
  _g522.length = 0;
  G523: {
    const _a526 = sp.edges;
    for (let _i527 = 0; _i527 < _a526.length; _i527++) {
      const v_e = _a526[_i527];
      if (!(((least((cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e]))) - 1) > 0))) continue;
      _g522.push(v_e);
    }
  }
  const v_L = _g522;
  const _eg534 = edgeGroups(sp, v_L);
  const _a528 = sp.cells;
  for (let _i529 = 0; _i529 < _a528.length; _i529++) {
    const v_c = _a528[_i529];
    const _h530 = clueAt(cl.number, v_c);
    if (!((_h530 !== -1))) continue;
    const _a531 = sp.adj4[v_c];
    for (let _i532 = 0; _i532 < _a531.length; _i532++) {
      const v_y = _a531[_i532];
      L533: {
        const v_f = far(sp, cl, v_c, v_y);
        if (!(((((v_f !== -1) && (hasMarked(b, sp, cl, cands, v_c, v_y) === 0)) && (moreMarked(b, sp, cl, cands, v_c, v_y) > 0)) && (_eg534.of(v_f) === _eg534.of(v_c))))) break L533;
        facts.length = 0;
        changed = false;
        let _q535 = true;
        Q536: {
          const _a537 = run(sp, cl, v_c, v_y);
          for (let _i538 = 0; _i538 < _a537.length; _i538++) {
            const v_e = _a537[_i538];
            for (let _m539 = (cands[v_e] >= 0 ? cands[v_e] : (cands[v_e] = b.cands[v_e])); _m539 !== 0; _m539 &= _m539 - 1) {
              const v_d = 31 - Math.clz32(_m539 & -_m539);
              if (!((v_d > 1))) continue;
              if ((((b.cands[v_e] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_e, v_d); changed = true; } else facts.push(STRIKE, v_e, v_d); }
              if (!(true)) {
                _q535 = false;
                break Q536;
              }
            }
          }
        }
        if (!(_q535)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, c: v_c, y: v_y, f: v_f }, facts)) return 1;
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

/** `far(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function far(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): number {
  const _kept: Kept<Kept<number>> = farKept.board(cl);
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

/** `mid(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function mid(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  const _kept: Kept<Kept<readonly number[]>> = midKept.board(cl);
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

/** `end(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function end(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): number {
  const _kept: Kept<Kept<number>> = endKept.board(cl);
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

/** `run(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function run(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  const _kept: Kept<Kept<readonly number[]>> = runKept.board(cl);
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

/** `near(c, y)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function near(sp: GridSpace, cl: Dealt, v_c: number, v_y: number): readonly number[] {
  const _kept: Kept<Kept<readonly number[]>> = nearKept.board(cl);
  const _kept1 = (_kept[v_c] ??= []);
  if (_kept1[v_y] !== undefined) return _kept1[v_y];
  const _g216: number[] = [];
  G217: {
    const _t222 = far(sp, cl, v_c, v_y);
    for (let _i223 = 0; _i223 < 2; _i223++) {
      const v_x = _i223 === 0 ? v_c : _t222;
      if (_i223 === 1 && (v_x === v_c)) continue;
      const _a224 = sp.adj4[v_x];
      for (let _i225 = 0; _i225 < _a224.length; _i225++) {
        const v_z = _a224[_i225];
        if (!((far(sp, cl, v_x, v_z) !== -1))) continue;
        const _t226 = far(sp, cl, v_x, v_z);
        if (!_g216.includes(_t226)) _g216.push(_t226);
      }
    }
  }
  const _g227: number[] = [];
  G228: {
    const _a233 = mid(sp, cl, v_c, v_y);
    for (let _i234 = 0; _i234 < _a233.length; _i234++) {
      const v_m = _a233[_i234];
      const _a235 = sp.adj4[v_m];
      for (let _i236 = 0; _i236 < _a235.length; _i236++) {
        const v_p = _a235[_i236];
        if (!(((((v_p % sp.w) === (v_m % sp.w)) !== ((v_y % sp.w) === (v_c % sp.w))) && (far(sp, cl, v_m, v_p) !== -1)))) continue;
        const _t237 = far(sp, cl, v_m, v_p);
        if (!_g227.includes(_t237)) _g227.push(_t237);
      }
    }
  }
  const _made = union(union(setOf(v_c), _g216), _g227);
  _kept1[v_y] = _made;
  return _made;
}
