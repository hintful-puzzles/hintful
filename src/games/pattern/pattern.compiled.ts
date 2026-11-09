// Compiled by `npm run describe` from src/games/pattern/pattern.description.yaml: edit that, not this.

import { type ListClues, type Fire, type GridSpace, type Marks, PLACE, listAt, rangeMask, runFits, runsOf, sameList, sameSet, stretch } from "../../engine/describe-runtime.ts";

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
  const _g108: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  for (let _k105 = 0; _k105 < cl.runs.at.length; _k105++) {
    const _at106 = cl.runs.at[_k105];
    const _v107 = cl.runs.lists[_k105];
    _g108.length = 0;
    G109: {
      const _a112 = sp.lineCells[_at106];
      for (let _i113 = 0; _i113 < _a112.length; _i113++) {
        const v_c = _a112[_i113];
        const _h114 = (g[v_c] || -1);
        if (!((_h114 === 1))) continue;
        _g108.push(v_c);
      }
    }
    if (!(sameList(runsOf(sp.lineCells[_at106], _g108), _v107))) return false;
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
let _p49 = new Int32Array(0);
let _l50: readonly number[] = [];
let _p89 = new Int32Array(0);
let _l90: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function line(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBinding> | null): number {
  const _g34: number[] = [];
  if (_p49.length < sp.cells.length) _p49 = new Int32Array(sp.cells.length);
  else _p49.fill(0);
  _l50 = [];
  let _y51 = false;
  const _m56 = new Int32Array(sp.cells.length);
  const _o55 = new Int32Array(sp.cells.length);
  const _g65: number[] = [];
  const _m82 = new Int32Array(sp.cells.length);
  const _o81 = new Int32Array(sp.cells.length);
  if (_p89.length < sp.cells.length) _p89 = new Int32Array(sp.cells.length);
  else _p89.fill(0);
  _l90 = [];
  let _y91 = false;
  const _m96 = new Int32Array(sp.cells.length);
  const _o95 = new Int32Array(sp.cells.length);
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
    let _g92 = -1;
    R2:
    for (let _m33 = b.domain; _m33 !== 0; _m33 &= _m33 - 1) {
      const v_d = 31 - Math.clz32(_m33 & -_m33);
      const _h60 = (3 - v_d);
      const _h61 = _h60;
      const _m13_0 = b.made[0];
      const _m13_1 = b.made[1];
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
        if (b.made[0] !== _m13_0 || b.made[1] !== _m13_1) {
          _g65.length = 0;
          G66: {
            const _a78 = sp.lineCells[v_L];
            for (let _i79 = 0; _i79 < _a78.length; _i79++) {
              const v_x = _a78[_i79];
              let _c88: boolean = !((b.grid[v_x] !== 0));
              if (_c88) {
                const _t80 = sp.lineCells[v_L];
                for (let _i83 = 0; _i83 < _t80.length; _i83++) {
                  const _e84 = _t80[_i83];
                  _m82[_i83] = (cands[_e84] >= 0 ? cands[_e84] : (cands[_e84] = b.cands[_e84]));
                }
                const _y85 = runFits(_m82, _t80.length, 1, v_R, _o81);
                const _t86 = (3 - v_d);
                const _p87 = _t80.indexOf(v_x);
                _c88 = !((_y85 && (_p87 < 0 ? (_t86 as number) === -1 : ((_o81[_p87] >> _t86) & 1) !== 0)));
              }
              if (!(_c88)) continue;
              _g65.push(v_x);
            }
          }
          if (!(sameSet(v_O, _g65))) { continue R2; }
        }
        facts.length = 0;
        changed = false;
        if (_g92 !== _epoch) {
          _g92 = _epoch;
          for (const _e93 of _l90) _p89[_e93] = 0;
          _y91 = false;
          const _t94 = sp.lineCells[v_L];
          for (let _i97 = 0; _i97 < _t94.length; _i97++) {
            const _e98 = _t94[_i97];
            _m96[_i97] = (cands[_e98] >= 0 ? cands[_e98] : (cands[_e98] = b.cands[_e98]));
          }
          const _y99 = runFits(_m96, _t94.length, 1, v_R, _o95);
          if (_y99) {
            _l90 = _t94;
            _y91 = true;
            for (let _e93 = 0; _e93 < _t94.length; _e93++) _p89[_t94[_e93]] = _o95[_e93];
          }
        }
        let _c104: boolean = ((((_p89[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y91 && !sp.lineCells[v_L].includes(v_c)));
        if (_c104) {
          let _q100 = true;
          Q101: {
            const _a102 = stretch(sp.lineCells[v_L], v_c, v_O);
            for (let _i103 = 0; _i103 < _a102.length; _i103++) {
              const v_x = _a102[_i103];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, v_d); changed = true; } else facts.push(PLACE, v_x, v_d); }
              if (!(true)) {
                _q100 = false;
                break Q101;
              }
            }
          }
          _c104 = _q100;
        }
        if (!(_c104)) return -1;
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
