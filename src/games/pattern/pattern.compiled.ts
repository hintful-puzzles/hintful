// Compiled by `npm run describe` from src/games/pattern/pattern.description.yaml: edit that, not this.

import { type ListClues, type Fire, type GridSpace, type Marks, PLACE, listAt, rangeMask, runFits, runsOf, sameList, stretch } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  runs: ListClues;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "line";

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
  { id: "line", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g84: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  for (let _k81 = 0; _k81 < cl.runs.at.length; _k81++) {
    const _at82 = cl.runs.at[_k81];
    const _v83 = cl.runs.lists[_k81];
    _g84.length = 0;
    G85: {
      const _a88 = sp.lineCells[_at82];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_c = _a88[_i89];
        const _h90 = (g[v_c] || -1);
        if (!((_h90 === 1))) continue;
        _g84.push(v_c);
      }
    }
    if (!(sameList(runsOf(sp.lineCells[_at82], _g84), _v83))) return false;
  }
  return true;
}

export interface LineBinding {
  L: number;
  R: Int32Array | null;
  d: number;
  O: readonly number[];
  c: number;
}

const lineFacts: number[] = [];
let lineCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g34: number[] = [];
  const _p49 = new Int32Array(sp.cells.length);
  let _l50: readonly number[] = [];
  let _y51 = false;
  const _m56 = new Int32Array(sp.cells.length);
  const _o55 = new Int32Array(sp.cells.length);
  const _p65 = new Int32Array(sp.cells.length);
  let _l66: readonly number[] = [];
  let _y67 = false;
  const _m72 = new Int32Array(sp.cells.length);
  const _o71 = new Int32Array(sp.cells.length);
  const facts = lineFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (lineCands.length < sp.cells.length) lineCands = new Int32Array(sp.cells.length);
  const cands = lineCands;
  cands.fill(-1);
  const _a30 = sp.lines;
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_L = _a30[_i31];
    const _h32 = listAt(cl.runs, v_L);
    const v_R = _h32;
    let _g52 = -1;
    let _g68 = -1;
    for (let _m33 = b.domain; _m33 !== 0; _m33 &= _m33 - 1) {
      const v_d = 31 - Math.clz32(_m33 & -_m33);
      const _h60 = (3 - v_d);
      const _h61 = _h60;
      _g34.length = 0;
      G35: {
        const _a47 = sp.lineCells[v_L];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_x = _a47[_i48];
          let _c62: boolean = !((b.grid[v_x] !== 0));
          if (_c62) {
            if (_g52 !== _epoch) {
              _g52 = _epoch;
              for (const _e53 of _l50) _p49[_e53] = 0;
              _y51 = false;
              const _t54 = sp.lineCells[v_L];
              for (let _i57 = 0; _i57 < _t54.length; _i57++) {
                const _e58 = _t54[_i57];
                _m56[_i57] = (cands[_e58] >= 0 ? cands[_e58] : (cands[_e58] = b.cands[_e58]));
              }
              const _y59 = runFits(_m56, _t54.length, 1, v_R, _o55);
              if (_y59) {
                _l50 = _t54;
                _y51 = true;
                for (let _e53 = 0; _e53 < _t54.length; _e53++) _p49[_t54[_e53]] = _o55[_e53];
              }
            }
            _c62 = !(((((_p49[v_x] >> _h61) & 1) !== 0) || ((_h61 as number) === -1 && _y51 && !sp.lineCells[v_L].includes(v_x))));
          }
          if (!(_c62)) continue;
          _g34.push(v_x);
        }
      }
      const v_O = _g34;
      const _a63 = v_O;
      for (let _i64 = 0; _i64 < _a63.length; _i64++) {
        const v_c = _a63[_i64];
        if (!((stretch(sp.lineCells[v_L], v_c, v_O).indexOf(v_c) === 0))) continue;
        facts.length = 0;
        changed = false;
        if (_g68 !== _epoch) {
          _g68 = _epoch;
          for (const _e69 of _l66) _p65[_e69] = 0;
          _y67 = false;
          const _t70 = sp.lineCells[v_L];
          for (let _i73 = 0; _i73 < _t70.length; _i73++) {
            const _e74 = _t70[_i73];
            _m72[_i73] = (cands[_e74] >= 0 ? cands[_e74] : (cands[_e74] = b.cands[_e74]));
          }
          const _y75 = runFits(_m72, _t70.length, 1, v_R, _o71);
          if (_y75) {
            _l66 = _t70;
            _y67 = true;
            for (let _e69 = 0; _e69 < _t70.length; _e69++) _p65[_t70[_e69]] = _o71[_e69];
          }
        }
        let _c80: boolean = ((((_p65[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y67 && !sp.lineCells[v_L].includes(v_c)));
        if (_c80) {
          let _q76 = true;
          Q77: {
            const _a78 = stretch(sp.lineCells[v_L], v_c, v_O);
            for (let _i79 = 0; _i79 < _a78.length; _i79++) {
              const v_x = _a78[_i79];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, v_d); changed = true; } else facts.push(PLACE, v_x, v_d); }
              if (!(true)) {
                _q76 = false;
                break Q77;
              }
            }
          }
          _c80 = _q76;
        }
        if (!(_c80)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, R: v_R, d: v_d, O: v_O.slice(), c: v_c }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}
