// Compiled by `npm run describe` from src/games/abcd/abcd.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, least, perElement, perPlace, perValue, popcount, rangeMask, stretch } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  n: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "satisfied" | "single" | "runs";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed" | "placedDiagonal";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
  { id: "placedDiagonal", variation: "no diagonal" },
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
  { id: "satisfied", tier: 0 },
  { id: "single", tier: 0 },
  { id: "runs", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt, variations: readonly string[]): boolean {
  const _domain = rangeMask(1, cl.n);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q108 = true;
  Q109: {
    const _a110 = sp.cells;
    for (let _i111 = 0; _i111 < _a110.length; _i111++) {
      const v_c = _a110[_i111];
      const _a112 = sp.adj4[v_c];
      for (let _i113 = 0; _i113 < _a112.length; _i113++) {
        const v_p = _a112[_i113];
        if (!(((g[v_p] || -1) !== (g[v_c] || -1)))) {
          _q108 = false;
          break Q109;
        }
      }
    }
  }
  if (!(_q108)) return false;
  if (variations.includes("no diagonal")) {
    let _q114 = true;
    Q115: {
      const _a116 = sp.cells;
      for (let _i117 = 0; _i117 < _a116.length; _i117++) {
        const v_c = _a116[_i117];
        const _a118 = sp.adj8[v_c];
        for (let _i119 = 0; _i119 < _a118.length; _i119++) {
          const v_p = _a118[_i119];
          if (!(((g[v_p] || -1) !== (g[v_c] || -1)))) {
            _q114 = false;
            break Q115;
          }
        }
      }
    }
    if (!(_q114)) return false;
  }
  for (let _k120 = 0; _k120 < cl.count.at.length; _k120++) {
    const _at121 = perElement(cl.count.at[_k120]);
    const _per123 = perValue(cl.count.at[_k120]);
    const _v122 = cl.count.v[_k120];
    let _g124 = 0;
    G125: {
      const _a126 = sp.lineCells[_at121];
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_c = _a126[_i127];
        if (!(((g[v_c] || -1) === _per123))) continue;
        _g124++;
      }
    }
    if (!((_g124 === _v122))) return false;
  }
  return true;
}

export interface PlacedBinding {
  c: number;
  p: number;
}

const placedFacts: number[] = [];

export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = b.known(v_c);
  const _h9 = b.value(v_c);
  if (!(_h5)) return 0;
  const _a6 = sp.adj4[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    const _h8 = b.known(v_p);
    if (!(!(_h8))) continue;
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h9)) { if (fire === null) { b.strikeAt(v_p, _h9); changed = true; } else facts.push(STRIKE, v_p, _h9); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SatisfiedBinding {
  L: number;
  d: number;
  v: number;
}

const satisfiedFacts: number[] = [];

export function satisfied(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SatisfiedBinding> | null): number {
  const facts = satisfiedFacts;
  let fired = 0;
  let changed = false;
  const _a19 = sp.lines;
  for (let _i20 = 0; _i20 < _a19.length; _i20++) {
    const v_L = _a19[_i20];
    for (let _m21 = b.domain; _m21 !== 0; _m21 &= _m21 - 1) {
      const v_d = 31 - Math.clz32(_m21 & -_m21);
      const _h22 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L23: {
        const v_v = _h22;
        let _c29: boolean = (v_v >= 0);
        if (_c29) {
          let _g24 = 0;
          G25: {
            const _a26 = sp.lineCells[v_L];
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_c = _a26[_i27];
              const _h28 = b.value(v_c);
              if (!((_h28 === v_d))) continue;
              _g24++;
            }
          }
          _c29 = (_g24 >= v_v);
        }
        if (!(_c29)) break L23;
        facts.length = 0;
        changed = false;
        let _g30 = 0;
        G31: {
          const _a32 = sp.lineCells[v_L];
          for (let _i33 = 0; _i33 < _a32.length; _i33++) {
            const v_c = _a32[_i33];
            const _h34 = b.value(v_c);
            if (!((_h34 === v_d))) continue;
            _g30++;
          }
        }
        let _c40: boolean = (_g30 === v_v);
        if (_c40) {
          let _q35 = true;
          Q36: {
            const _a37 = sp.lineCells[v_L];
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_c = _a37[_i38];
              const _h39 = b.known(v_c);
              if (!(!(_h39))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q35 = false;
                break Q36;
              }
            }
          }
          _c40 = _q35;
        }
        if (!(_c40)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SingleBinding {
  c: number;
}

const singleFacts: number[] = [];
let singleCands = new Int32Array(0);

export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a43 = sp.cells;
  for (let _i44 = 0; _i44 < _a43.length; _i44++) {
    const v_c = _a43[_i44];
    if (!((!(b.known(v_c)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) < 2)))) continue;
    facts.length = 0;
    changed = false;
    let _c46: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c)))) === 1);
    if (_c46) {
      const _t45 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))));
      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t45); changed = true; } else facts.push(PLACE, v_c, _t45); }
      _c46 = true;
    }
    if (!(_c46)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface RunsBinding {
  L: number;
  d: number;
  v: number;
  O: readonly number[];
}

const runsFacts: number[] = [];

export function runs(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RunsBinding> | null): number {
  const _g79: number[] = [];
  const facts = runsFacts;
  let fired = 0;
  let changed = false;
  const _a70 = sp.lines;
  for (let _i71 = 0; _i71 < _a70.length; _i71++) {
    const v_L = _a70[_i71];
    for (let _m72 = b.domain; _m72 !== 0; _m72 &= _m72 - 1) {
      const v_d = 31 - Math.clz32(_m72 & -_m72);
      const _h73 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L74: {
        const v_v = _h73;
        let _g75 = 0;
        G76: {
          const _a77 = sp.lineCells[v_L];
          for (let _i78 = 0; _i78 < _a77.length; _i78++) {
            const v_c = _a77[_i78];
            if (!((b.value(v_c) === v_d))) continue;
            _g75++;
          }
        }
        if (!((v_v > _g75))) break L74;
        _g79.length = 0;
        G80: {
          const _a83 = sp.lineCells[v_L];
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_c = _a83[_i84];
            if (!((!(b.known(v_c)) && b.has(v_c, v_d)))) continue;
            _g79.push(v_c);
          }
        }
        L85: {
          const v_O = _g79;
          let _g86 = 0;
          G87: {
            const _a88 = v_O;
            for (let _i89 = 0; _i89 < _a88.length; _i89++) {
              const v_c = _a88[_i89];
              if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0))) continue;
              _g86++;
            }
          }
          let _g90 = 0;
          G91: {
            const _a92 = sp.lineCells[v_L];
            for (let _i93 = 0; _i93 < _a92.length; _i93++) {
              const v_c = _a92[_i93];
              if (!((b.value(v_c) === v_d))) continue;
              _g90++;
            }
          }
          if (!((_g86 === (v_v - _g90)))) break L85;
          facts.length = 0;
          changed = false;
          let _q94 = true;
          Q95: {
            const _a96 = v_O;
            for (let _i97 = 0; _i97 < _a96.length; _i97++) {
              const v_c = _a96[_i97];
              const _h98 = stretch(sp.lineCells[v_L], v_c, v_O).length;
              if (!((((_h98 % 2) === 1) && ((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0)))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q94 = false;
                break Q95;
              }
            }
          }
          if (!(_q94)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface PlacedDiagonalBinding {
  c: number;
  p: number;
}

const placedDiagonalFacts: number[] = [];

export function placedDiagonal(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedDiagonalBinding> | null): number {
  const facts = placedDiagonalFacts;
  let fired = 0;
  let changed = false;
  const _h103 = b.known(v_c);
  const _h107 = b.value(v_c);
  if (!(_h103)) return 0;
  const _a104 = sp.adj8[v_c];
  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
    const v_p = _a104[_i105];
    const _h106 = b.known(v_p);
    if (!((!(sp.adj4[v_c].includes(v_p)) && !(_h106)))) continue;
    facts.length = 0;
    changed = false;
    if (b.has(v_p, _h107)) { if (fire === null) { b.strikeAt(v_p, _h107); changed = true; } else facts.push(STRIKE, v_p, _h107); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}
