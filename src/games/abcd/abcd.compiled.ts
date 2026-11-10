// Compiled by `npm run describe` from src/games/abcd/abcd.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, clueAt, freshBinding, least, perElement, perPlace, perValue, popcount, rangeMask, sameSet, staleChecking, stretch } from "../../engine/describe-runtime.ts";

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
  let _q127 = true;
  Q128: {
    const _a129 = sp.cells;
    for (let _i130 = 0; _i130 < _a129.length; _i130++) {
      const v_c = _a129[_i130];
      const _h134 = (g[v_c] || -1);
      const _a131 = sp.adj4[v_c];
      for (let _i132 = 0; _i132 < _a131.length; _i132++) {
        const v_p = _a131[_i132];
        const _h133 = (g[v_p] || -1);
        if (!((_h133 !== _h134))) {
          _q127 = false;
          break Q128;
        }
      }
    }
  }
  if (!(_q127)) return false;
  if (variations.includes("no diagonal")) {
    let _q135 = true;
    Q136: {
      const _a137 = sp.cells;
      for (let _i138 = 0; _i138 < _a137.length; _i138++) {
        const v_c = _a137[_i138];
        const _h142 = (g[v_c] || -1);
        const _a139 = sp.adj8[v_c];
        for (let _i140 = 0; _i140 < _a139.length; _i140++) {
          const v_p = _a139[_i140];
          const _h141 = (g[v_p] || -1);
          if (!((_h141 !== _h142))) {
            _q135 = false;
            break Q136;
          }
        }
      }
    }
    if (!(_q135)) return false;
  }
  for (let _k143 = 0; _k143 < cl.count.at.length; _k143++) {
    const _at144 = perElement(cl.count.at[_k143]);
    const _per146 = perValue(cl.count.at[_k143]);
    const _v145 = cl.count.v[_k143];
    let _g147 = 0;
    G148: {
      const _a149 = sp.lineCells[_at144];
      for (let _i150 = 0; _i150 < _a149.length; _i150++) {
        const v_c = _a149[_i150];
        const _h151 = (g[v_c] || -1);
        if (!((_h151 === _per146))) continue;
        _g147++;
      }
    }
    if (!((_g147 === _v145))) return false;
  }
  return true;
}

export interface PlacedBinding {
  c: number;
  p: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function placed(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h5 = (b.grid[v_c] !== 0);
  const _h9 = (b.grid[v_c] || -1);
  if (!(_h5)) return 0;
  const _a6 = sp.adj4[v_c];
  for (let _i7 = 0; _i7 < _a6.length; _i7++) {
    const v_p = _a6[_i7];
    const _h8 = (b.grid[v_p] !== 0);
    if (!(!(_h8))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placed", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj4[v_c].includes(v_p)), !((b.grid[v_p] !== 0))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h9) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h9); changed = true; } else facts.push(STRIKE, v_p, _h9); }
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

/** Its dearest read grows with the board as n. */
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
              const _h28 = (b.grid[v_c] || -1);
              if (!((_h28 === v_d))) continue;
              _g24++;
            }
          }
          _c29 = (_g24 >= v_v);
        }
        if (!(_c29)) break L23;
        if (import.meta.env.DEV && staleChecking) {
          let _c34: boolean = (v_v >= 0);
          if (_c34) {
            let _g30 = 0;
            G31: {
              const _a32 = sp.lineCells[v_L];
              for (let _i33 = 0; _i33 < _a32.length; _i33++) {
                const v_c = _a32[_i33];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g30++;
              }
            }
            _c34 = (_g30 >= v_v);
          }
          freshBinding("satisfied", [(sp.lines.includes(v_L)), (((b.domain >> v_d) & 1) !== 0), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), _c34], ["L in", "d in", "v =", "where of v"]);
        }
        facts.length = 0;
        changed = false;
        let _g35 = 0;
        G36: {
          const _a37 = sp.lineCells[v_L];
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            const v_c = _a37[_i38];
            const _h39 = (b.grid[v_c] || -1);
            if (!((_h39 === v_d))) continue;
            _g35++;
          }
        }
        let _c45: boolean = (_g35 === v_v);
        if (_c45) {
          let _q40 = true;
          Q41: {
            const _a42 = sp.lineCells[v_L];
            for (let _i43 = 0; _i43 < _a42.length; _i43++) {
              const v_c = _a42[_i43];
              const _h44 = (b.grid[v_c] !== 0);
              if (!(!(_h44))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q40 = false;
                break Q41;
              }
            }
          }
          _c45 = _q40;
        }
        if (!(_c45)) return -1;
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

/** Its dearest read grows with the board as n. */
export function single(b: Marks, sp: GridSpace, fire: Fire<SingleBinding> | null): number {
  const facts = singleFacts;
  let fired = 0;
  let changed = false;
  if (singleCands.length < sp.cells.length) singleCands = new Int32Array(sp.cells.length);
  const cands = singleCands;
  cands.fill(-1);
  const _a48 = sp.cells;
  for (let _i49 = 0; _i49 < _a48.length; _i49++) {
    const v_c = _a48[_i49];
    if (!((!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("single", [(sp.cells.includes(v_c)), (!((b.grid[v_c] !== 0)) && (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) < 2))], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c51: boolean = (popcount((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c]))) === 1);
    if (_c51) {
      const _t50 = least((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])));
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t50); changed = true; } else facts.push(PLACE, v_c, _t50); }
      _c51 = true;
    }
    if (!(_c51)) return -1;
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

/** Its dearest read grows with the board as n. */
export function runs(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RunsBinding> | null): number {
  const _g84: number[] = [];
  const facts = runsFacts;
  let fired = 0;
  let changed = false;
  const _a75 = sp.lines;
  for (let _i76 = 0; _i76 < _a75.length; _i76++) {
    const v_L = _a75[_i76];
    for (let _m77 = b.domain; _m77 !== 0; _m77 &= _m77 - 1) {
      const v_d = 31 - Math.clz32(_m77 & -_m77);
      const _h78 = clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)));
      L79: {
        const v_v = _h78;
        let _g80 = 0;
        G81: {
          const _a82 = sp.lineCells[v_L];
          for (let _i83 = 0; _i83 < _a82.length; _i83++) {
            const v_c = _a82[_i83];
            if (!(((b.grid[v_c] || -1) === v_d))) continue;
            _g80++;
          }
        }
        if (!((v_v > _g80))) break L79;
        _g84.length = 0;
        G85: {
          const _a88 = sp.lineCells[v_L];
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_c = _a88[_i89];
            if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
            _g84.push(v_c);
          }
        }
        L90: {
          const v_O = _g84;
          let _g91 = 0;
          G92: {
            const _a93 = v_O;
            for (let _i94 = 0; _i94 < _a93.length; _i94++) {
              const v_c = _a93[_i94];
              if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0))) continue;
              _g91++;
            }
          }
          if (!((_g91 === (v_v - _g80)))) break L90;
          if (import.meta.env.DEV && staleChecking) {
            let _g95 = 0;
            G96: {
              const _a97 = sp.lineCells[v_L];
              for (let _i98 = 0; _i98 < _a97.length; _i98++) {
                const v_c = _a97[_i98];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g95++;
              }
            }
            const _g99: number[] = [];
            G100: {
              const _a103 = sp.lineCells[v_L];
              for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                const v_c = _a103[_i104];
                if (!((!((b.grid[v_c] !== 0)) && (((b.cands[v_c] >> v_d) & 1) !== 0)))) continue;
                _g99.push(v_c);
              }
            }
            let _g105 = 0;
            G106: {
              const _a107 = v_O;
              for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                const v_c = _a107[_i108];
                if (!(((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0))) continue;
                _g105++;
              }
            }
            let _g109 = 0;
            G110: {
              const _a111 = sp.lineCells[v_L];
              for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                const v_c = _a111[_i112];
                if (!(((b.grid[v_c] || -1) === v_d))) continue;
                _g109++;
              }
            }
            freshBinding("runs", [(sp.lines.includes(v_L)), (((b.domain >> v_d) & 1) !== 0), (v_v === clueAt(cl.count, (v_L < 0 ? -1 : perPlace(v_L, v_d)))), (v_v > _g95), sameSet(v_O, _g99), (_g105 === (v_v - _g109))], ["L in", "d in", "v =", "where of v", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q113 = true;
          Q114: {
            const _a115 = v_O;
            for (let _i116 = 0; _i116 < _a115.length; _i116++) {
              const v_c = _a115[_i116];
              const _h117 = stretch(sp.lineCells[v_L], v_c, v_O).length;
              if (!((((_h117 % 2) === 1) && ((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) % 2) === 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, v_d); changed = true; } else facts.push(PLACE, v_c, v_d); }
              if (!(true)) {
                _q113 = false;
                break Q114;
              }
            }
          }
          if (!(_q113)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, d: v_d, v: v_v, O: v_O.slice() }, facts)) return 1;
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

/** Its dearest read grows with the board as 1. */
export function placedDiagonal(b: Marks, sp: GridSpace, v_c: number, fire: Fire<PlacedDiagonalBinding> | null): number {
  const facts = placedDiagonalFacts;
  let fired = 0;
  let changed = false;
  const _h122 = (b.grid[v_c] !== 0);
  const _h126 = (b.grid[v_c] || -1);
  if (!(_h122)) return 0;
  const _a123 = sp.adj8[v_c];
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_p = _a123[_i124];
    const _h125 = (b.grid[v_p] !== 0);
    if (!((!(sp.adj4[v_c].includes(v_p)) && !(_h125)))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("placedDiagonal", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj8[v_c].includes(v_p)), (!(sp.adj4[v_c].includes(v_p)) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
    facts.length = 0;
    changed = false;
    if ((((b.cands[v_p] >> _h126) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_p, _h126); changed = true; } else facts.push(STRIKE, v_p, _h126); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}
