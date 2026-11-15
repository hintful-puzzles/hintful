// Compiled by `npm run describe` from src/games/sticks/sticks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, setOf, staleChecking, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  block: ClueList;
  length: ClueList;
  joins: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "overConnected" | "twoClues" | "tooLong" | "starved" | "unreachable";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  overConnected: OverConnectedSays;
  twoClues: TwoCluesSays;
  tooLong: TooLongSays;
  starved: StarvedSays;
  unreachable: UnreachableSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["overConnected","twoClues","tooLong","starved","unreachable"] as const;

/** Each kind of step's words as the description states them, and each
 * fact's, by wording (`engine/stated.ts`). */
export const STATED = {
  "overConnected": {"fact":[{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","look":"{outline clue: the {value} block} takes no lines, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would run into it","again":"a {if hor: vertical | horizontal} line would run into {outline clue: the {value} block}"},{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","look":"{outline clue: the {value} block} has {outline: its {value: 1 line | {value} lines}}, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would add another","again":"{outline clue: the {value} block} already has {outline: its {value: 1 line | {value} lines}}, and a {if hor: vertical | horizontal} line would add another"}]},
  "twoClues": {"fact":[{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would join {outline clues: the same numbers} into one line, {outline run}","look":"a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would put {outline clues: {n} numbers} on one line, {outline run}"},{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would join {outline clues: the same numbers} into one line, {outline run}","look":"a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would join {outline clues: two {first}s} along {outline run}"},{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would join {outline clues: the same numbers} into one line, {outline run}","look":"a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would join {outline clues: the {first} and the {second}} along {outline run}"}]},
  "tooLong": {"fact":[{"look":"a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would run {outline clue: the {value}}'s line to {outline run: {size} squares}, too long for it","move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would run {outline clue: the {value}}'s line to {outline run: {size} squares}"}]},
  "starved": {"fact":[{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would close a side {outline clue: the {value} block} needs, like {outline: the outlined one | the outlined ones}","look":"{outline clue: the {value} block} has one open side, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would close it"},{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would close a side {outline clue: the {value} block} needs, like {outline: the outlined one | the outlined ones}","look":"{outline clue: the {value} block} needs {outline: both outlined sides}, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} shuts one"},{"move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would close a side {outline clue: the {value} block} needs, like {outline: the outlined one | the outlined ones}","look":"{outline clue: the {value} block} needs {outline: {value} outlined sides}, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} shuts one"}]},
  "unreachable": {"fact":[{"look":"{outline clue: the {value}} needs more room, and a {if hor: vertical | horizontal} line on {ring: {if own: this {each} | this square}} would leave it {outline: {max: 1 square | {max} squares}}","move":"{ring: {if own: this {each} | this square}} must be {if hor: horizontal | vertical}","again":"a {if hor: vertical | horizontal} line would leave {outline clue: the {value}} only {outline: {max: 1 square | {max} squares}}"}]},
} as const;

/** The techniques whose step is made for each square the firing decides. */
export const SAYS_EACH: readonly (keyof SaysById)[] = ["overConnected","twoClues","tooLong","starved","unreachable"];

/** The techniques whose later squares' steps continue the first (a subset of
 * `SAYS_EACH`). */
export const SAYS_LEGS: readonly (keyof SaysById)[] = ["overConnected","twoClues","tooLong","starved","unreachable"];

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
  { id: "overConnected", tier: 0 },
  { id: "twoClues", tier: 0 },
  { id: "tooLong", tier: 0 },
  { id: "starved", tier: 0 },
  { id: "unreachable", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 3; v_d++) {
      if (!(((v_d === 3) === (clueAt(cl.block, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g7: number[] = [];
  const _g14: number[] = [];
  const _g30: number[] = [];
  const _g37: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        _g7.length = 0;
        G8: {
          const _a11 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_x = _a11[_i12];
            const _h13 = (g[v_x] || -1);
            if (!((_h13 === 1))) continue;
            _g7.push(v_x);
          }
        }
        _g14.length = 0;
        G15: {
          const _a18 = sp.lineCells[sp.colOf[v_c]];
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_x = _a18[_i19];
            const _h20 = (g[v_x] || -1);
            if (!((_h20 === 2))) continue;
            _g14.push(v_x);
          }
        }
        const _a21 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g7), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g14));
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_k = _a21[_i22];
          const _h23 = clueAt(cl.length, v_k);
          if (!((_h23 >= 0))) continue;
          _g5++;
        }
      }
      if (!((_g5 <= 1))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k24 = 0; _k24 < cl.block.at.length; _k24++) {
    const _at25 = cl.block.at[_k24];
    if (!(((g[_at25] || -1) === 3))) return false;
  }
  for (let _k27 = 0; _k27 < cl.length.at.length; _k27++) {
    const _at28 = cl.length.at[_k27];
    const _v29 = cl.length.v[_k27];
    _g30.length = 0;
    G31: {
      const _a34 = sp.lineCells[sp.rowOf[_at28]];
      for (let _i35 = 0; _i35 < _a34.length; _i35++) {
        const v_x = _a34[_i35];
        const _h36 = (g[v_x] || -1);
        if (!((_h36 === 1))) continue;
        _g30.push(v_x);
      }
    }
    _g37.length = 0;
    G38: {
      const _a41 = sp.lineCells[sp.colOf[_at28]];
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        const v_x = _a41[_i42];
        const _h43 = (g[v_x] || -1);
        if (!((_h43 === 2))) continue;
        _g37.push(v_x);
      }
    }
    if (!((union(stretch(sp.lineCells[sp.rowOf[_at28]], _at28, _g30), stretch(sp.lineCells[sp.colOf[_at28]], _at28, _g37)).length === _v29))) return false;
  }
  for (let _k44 = 0; _k44 < cl.joins.at.length; _k44++) {
    const _at45 = cl.joins.at[_k44];
    const _v46 = cl.joins.v[_k44];
    let _g47 = 0;
    G48: {
      const _a49 = sp.adj4[_at45];
      for (let _i50 = 0; _i50 < _a49.length; _i50++) {
        const v_p = _a49[_i50];
        const _h51 = (g[v_p] || -1);
        if (!((((_h51 === 1) && (((v_p / sp.w) | 0) === ((_at45 / sp.w) | 0))) || ((_h51 === 2) && ((v_p % sp.w) === (_at45 % sp.w)))))) continue;
        _g47++;
      }
    }
    if (!((_g47 === _v46))) return false;
  }
  return true;
}

export interface OverConnectedBinding {
  b: number;
  n: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface OverConnectedSaysFact {
  /** The index of the wording that held (`STATED`). */
  wording: number;
  terms: { hor: boolean; own: boolean; };
  marks: { outline: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface OverConnectedSays {
  terms: { clue: number; value: number; };
  marks: { reads: readonly number[]; };
  facts: OverConnectedSaysFact[];
}

const overConnectedFacts: number[] = [];
const overConnectedFactSays: OverConnectedSaysFact[] = [];
let overConnectedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function overConnected(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OverConnectedBinding, OverConnectedSays> | null): number {
  const _g32: number[] = [];
  const facts = overConnectedFacts;
  let fired = 0;
  let changed = false;
  if (overConnectedCands.length < sp.cells.length) overConnectedCands = new Int32Array(sp.cells.length);
  const cands = overConnectedCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_b = _a4[_i5];
    const _h6 = clueAt(cl.joins, v_b);
    const _h12 = ((v_b / sp.w) | 0);
    const _h13 = (v_b % sp.w);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      const _h38 = (v_n === 0);
      if (DEV && staleChecking) {
        freshBinding("overConnected", [(sp.cells.includes(v_b)), (v_n === clueAt(cl.joins, v_b)), (v_n >= 0)], ["b in", "n =", "where of n"]);
      }
      facts.length = 0;
      overConnectedFactSays.length = 0;
      changed = false;
      let _g8 = 0;
      G9: {
        const _a10 = sp.adj4[v_b];
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          if (!(((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h12)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h13))))) continue;
          _g8++;
        }
      }
      let _c39: boolean = (_g8 <= v_n);
      if (_c39) {
        let _q14 = true;
        Q15: {
          const _a16 = sp.adj4[v_b];
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_c = _a16[_i17];
            const _h18 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h18 < 0)))) continue;
            const _h27 = clueAt(cl.length, v_c);
            const _h28 = (_h27 >= 0);
            const _h29 = _h28;
            for (let _m19 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m19 !== 0; _m19 &= _m19 - 1) {
              const v_a = 31 - Math.clz32(_m19 & -_m19);
              const _wc20 = v_c;
              const _wd21 = v_a;
              let _g22 = 0;
              G23: {
                const _a24 = sp.adj4[v_b];
                for (let _i25 = 0; _i25 < _a24.length; _i25++) {
                  const v_p = _a24[_i25];
                  if (!(((((v_p === _wc20 ? _wd21 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h12)) || (((v_p === _wc20 ? _wd21 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h13))))) continue;
                  _g22++;
                }
              }
              if (!((_g22 > v_n))) continue;
              const _t26 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) {
                if (fire === null) { b.placeAt(v_c, _t26); changed = true; }
                if (fire !== null) {
                  const _wc30 = v_c;
                  const _wd31 = v_a;
                  _g32.length = 0;
                  G33: {
                    const _a36 = sp.adj4[v_b];
                    for (let _i37 = 0; _i37 < _a36.length; _i37++) {
                      const v_p = _a36[_i37];
                      if (!(((((v_p === _wc30 ? _wd31 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h12)) || (((v_p === _wc30 ? _wd31 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h13))))) continue;
                      _g32.push(v_p);
                    }
                  }
                  facts.push(PLACE, v_c, _t26);
                  overConnectedFactSays.push({ wording: (_h38 ? 0 : 1), terms: { hor: (v_a === 2), own: _h29 }, marks: { outline: _g32.slice() } });
                }
              }
              if (!(true)) {
                _q14 = false;
                break Q15;
              }
            }
          }
        }
        _c39 = _q14;
      }
      if (!(_c39)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          if (overConnectedFactSays.length * 3 !== facts.length) throw new Error("overConnected: a fact of its conclusion is made where says.fact is not read");
          const _says = { terms: { clue: v_b, value: v_n }, marks: { reads: setOf(v_b).slice() }, facts: overConnectedFactSays.slice() };
          if (!fire({ b: v_b, n: v_n }, facts, _says)) return 1;
        }
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface TwoCluesBinding {
  k: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface TwoCluesSaysFact {
  /** The index of the wording that held (`STATED`). */
  wording: number;
  terms: { hor: boolean; own: boolean; clues: readonly number[]; run: readonly number[]; n: number; first: number; second: number; };
  marks: { outline: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface TwoCluesSays {
  terms: { clue: number; };
  marks: { reads: readonly number[]; };
  facts: TwoCluesSaysFact[];
}

const twoCluesFacts: number[] = [];
const twoCluesFactSays: TwoCluesSaysFact[] = [];
let twoCluesCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function twoClues(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoCluesBinding, TwoCluesSays> | null): number {
  const _g8: number[] = [];
  const _g14: number[] = [];
  const _g34: number[] = [];
  const _g41: number[] = [];
  const _g56: number[] = [];
  const _g72: number[] = [];
  const _g78: number[] = [];
  const _g89: number[] = [];
  const _g95: number[] = [];
  const _g103: number[] = [];
  const _g119: number[] = [];
  const _g125: number[] = [];
  const _g136: number[] = [];
  const _g152: number[] = [];
  const _g158: number[] = [];
  const _g169: number[] = [];
  const _g185: number[] = [];
  const _g191: number[] = [];
  const _g202: number[] = [];
  const _g208: number[] = [];
  const _g216: number[] = [];
  const _g232: number[] = [];
  const _g238: number[] = [];
  const _g249: number[] = [];
  const _g265: number[] = [];
  const _g271: number[] = [];
  const _g280: number[] = [];
  const _g296: number[] = [];
  const _g302: number[] = [];
  const facts = twoCluesFacts;
  let fired = 0;
  let changed = false;
  if (twoCluesCands.length < sp.cells.length) twoCluesCands = new Int32Array(sp.cells.length);
  const cands = twoCluesCands;
  cands.fill(-1);
  const _a3 = sp.cells;
  for (let _i4 = 0; _i4 < _a3.length; _i4++) {
    const v_k = _a3[_i4];
    const _h5 = clueAt(cl.length, v_k);
    if (!((_h5 >= 0))) continue;
    const _h33 = sp.rowOf[v_k];
    const _h40 = sp.colOf[v_k];
    if (DEV && staleChecking) {
      freshBinding("twoClues", [(sp.cells.includes(v_k)), (clueAt(cl.length, v_k) >= 0)], ["k in", "where of k"]);
    }
    facts.length = 0;
    twoCluesFactSays.length = 0;
    changed = false;
    let _g6 = 0;
    G7: {
      _g8.length = 0;
      G9: {
        const _a12 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_x = _a12[_i13];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g8.push(v_x);
        }
      }
      _g14.length = 0;
      G15: {
        const _a18 = sp.lineCells[sp.colOf[v_k]];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_x = _a18[_i19];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g14.push(v_x);
        }
      }
      const _a20 = union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g8), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g14));
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_j = _a20[_i21];
        const _h22 = clueAt(cl.length, v_j);
        if (!((_h22 >= 0))) continue;
        _g6++;
      }
    }
    let _c311: boolean = (_g6 <= 1);
    if (_c311) {
      let _q23 = true;
      Q24: {
        const _a25 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_c = _a25[_i26];
          const _h27 = clueAt(cl.block, v_c);
          if (!((!((b.grid[v_c] !== 0)) && (_h27 < 0)))) continue;
          const _h51 = clueAt(cl.length, v_c);
          const _h52 = (_h51 >= 0);
          const _h53 = _h52;
          for (let _m28 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m28 !== 0; _m28 &= _m28 - 1) {
            const v_a = 31 - Math.clz32(_m28 & -_m28);
            const _wc29 = v_c;
            const _wd30 = v_a;
            let _g31 = 0;
            G32: {
              _g34.length = 0;
              G35: {
                const _a38 = sp.lineCells[_h33];
                for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                  const v_x = _a38[_i39];
                  if (!(((v_x === _wc29 ? _wd30 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g34.push(v_x);
                }
              }
              _g41.length = 0;
              G42: {
                const _a45 = sp.lineCells[_h40];
                for (let _i46 = 0; _i46 < _a45.length; _i46++) {
                  const v_x = _a45[_i46];
                  if (!(((v_x === _wc29 ? _wd30 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g41.push(v_x);
                }
              }
              const _a47 = union(stretch(sp.lineCells[_h33], v_k, _g34), stretch(sp.lineCells[_h40], v_k, _g41));
              for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                const v_j = _a47[_i48];
                const _h49 = clueAt(cl.length, v_j);
                if (!((_h49 >= 0))) continue;
                _g31++;
              }
            }
            if (!((_g31 > 1))) continue;
            const _t50 = (3 - v_a);
            if (!(b.grid[v_c] !== 0)) {
              if (fire === null) { b.placeAt(v_c, _t50); changed = true; }
              if (fire !== null) {
                const _wc54 = v_c;
                const _wd55 = v_a;
                _g56.length = 0;
                G57: {
                  _g72.length = 0;
                  G73: {
                    const _a76 = sp.lineCells[_h33];
                    for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                      const v_x = _a76[_i77];
                      if (!(((v_x === _wc54 ? _wd55 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g72.push(v_x);
                    }
                  }
                  _g78.length = 0;
                  G79: {
                    const _a82 = sp.lineCells[_h40];
                    for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                      const v_x = _a82[_i83];
                      if (!(((v_x === _wc54 ? _wd55 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g78.push(v_x);
                    }
                  }
                  const _a84 = union(stretch(sp.lineCells[_h33], v_k, _g72), stretch(sp.lineCells[_h40], v_k, _g78));
                  for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                    const v_j = _a84[_i85];
                    const _h86 = clueAt(cl.length, v_j);
                    if (!((_h86 >= 0))) continue;
                    _g56.push(v_j);
                  }
                }
                const _wc87 = v_c;
                const _wd88 = v_a;
                _g89.length = 0;
                G90: {
                  const _a93 = sp.lineCells[_h33];
                  for (let _i94 = 0; _i94 < _a93.length; _i94++) {
                    const v_x = _a93[_i94];
                    if (!(((v_x === _wc87 ? _wd88 : (b.grid[v_x] || -1)) === 1))) continue;
                    _g89.push(v_x);
                  }
                }
                _g95.length = 0;
                G96: {
                  const _a99 = sp.lineCells[_h40];
                  for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                    const v_x = _a99[_i100];
                    if (!(((v_x === _wc87 ? _wd88 : (b.grid[v_x] || -1)) === 2))) continue;
                    _g95.push(v_x);
                  }
                }
                const _wc101 = v_c;
                const _wd102 = v_a;
                _g103.length = 0;
                G104: {
                  _g119.length = 0;
                  G120: {
                    const _a123 = sp.lineCells[_h33];
                    for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                      const v_x = _a123[_i124];
                      if (!(((v_x === _wc101 ? _wd102 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g119.push(v_x);
                    }
                  }
                  _g125.length = 0;
                  G126: {
                    const _a129 = sp.lineCells[_h40];
                    for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                      const v_x = _a129[_i130];
                      if (!(((v_x === _wc101 ? _wd102 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g125.push(v_x);
                    }
                  }
                  const _a131 = union(stretch(sp.lineCells[_h33], v_k, _g119), stretch(sp.lineCells[_h40], v_k, _g125));
                  for (let _i132 = 0; _i132 < _a131.length; _i132++) {
                    const v_j = _a131[_i132];
                    const _h133 = clueAt(cl.length, v_j);
                    if (!((_h133 >= 0))) continue;
                    _g103.push(v_j);
                  }
                }
                const _wc134 = v_c;
                const _wd135 = v_a;
                _g136.length = 0;
                G137: {
                  _g152.length = 0;
                  G153: {
                    const _a156 = sp.lineCells[_h33];
                    for (let _i157 = 0; _i157 < _a156.length; _i157++) {
                      const v_x = _a156[_i157];
                      if (!(((v_x === _wc134 ? _wd135 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g152.push(v_x);
                    }
                  }
                  _g158.length = 0;
                  G159: {
                    const _a162 = sp.lineCells[_h40];
                    for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                      const v_x = _a162[_i163];
                      if (!(((v_x === _wc134 ? _wd135 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g158.push(v_x);
                    }
                  }
                  const _a164 = union(stretch(sp.lineCells[_h33], v_k, _g152), stretch(sp.lineCells[_h40], v_k, _g158));
                  for (let _i165 = 0; _i165 < _a164.length; _i165++) {
                    const v_j = _a164[_i165];
                    const _h166 = clueAt(cl.length, v_j);
                    if (!((_h166 >= 0))) continue;
                    _g136.push(v_j);
                  }
                }
                const _wc167 = v_c;
                const _wd168 = v_a;
                _g169.length = 0;
                G170: {
                  _g185.length = 0;
                  G186: {
                    const _a189 = sp.lineCells[_h33];
                    for (let _i190 = 0; _i190 < _a189.length; _i190++) {
                      const v_x = _a189[_i190];
                      if (!(((v_x === _wc167 ? _wd168 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g185.push(v_x);
                    }
                  }
                  _g191.length = 0;
                  G192: {
                    const _a195 = sp.lineCells[_h40];
                    for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                      const v_x = _a195[_i196];
                      if (!(((v_x === _wc167 ? _wd168 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g191.push(v_x);
                    }
                  }
                  const _a197 = union(stretch(sp.lineCells[_h33], v_k, _g185), stretch(sp.lineCells[_h40], v_k, _g191));
                  for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                    const v_j = _a197[_i198];
                    const _h199 = clueAt(cl.length, v_j);
                    if (!((_h199 >= 0))) continue;
                    _g169.push(v_j);
                  }
                }
                const _wc200 = v_c;
                const _wd201 = v_a;
                _g202.length = 0;
                G203: {
                  const _a206 = sp.lineCells[_h33];
                  for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                    const v_x = _a206[_i207];
                    if (!(((v_x === _wc200 ? _wd201 : (b.grid[v_x] || -1)) === 1))) continue;
                    _g202.push(v_x);
                  }
                }
                _g208.length = 0;
                G209: {
                  const _a212 = sp.lineCells[_h40];
                  for (let _i213 = 0; _i213 < _a212.length; _i213++) {
                    const v_x = _a212[_i213];
                    if (!(((v_x === _wc200 ? _wd201 : (b.grid[v_x] || -1)) === 2))) continue;
                    _g208.push(v_x);
                  }
                }
                const _wc214 = v_c;
                const _wd215 = v_a;
                _g216.length = 0;
                G217: {
                  _g232.length = 0;
                  G233: {
                    const _a236 = sp.lineCells[_h33];
                    for (let _i237 = 0; _i237 < _a236.length; _i237++) {
                      const v_x = _a236[_i237];
                      if (!(((v_x === _wc214 ? _wd215 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g232.push(v_x);
                    }
                  }
                  _g238.length = 0;
                  G239: {
                    const _a242 = sp.lineCells[_h40];
                    for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                      const v_x = _a242[_i243];
                      if (!(((v_x === _wc214 ? _wd215 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g238.push(v_x);
                    }
                  }
                  const _a244 = union(stretch(sp.lineCells[_h33], v_k, _g232), stretch(sp.lineCells[_h40], v_k, _g238));
                  for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                    const v_j = _a244[_i245];
                    const _h246 = clueAt(cl.length, v_j);
                    if (!((_h246 >= 0))) continue;
                    _g216.push(v_j);
                  }
                }
                const _wc247 = v_c;
                const _wd248 = v_a;
                _g249.length = 0;
                G250: {
                  _g265.length = 0;
                  G266: {
                    const _a269 = sp.lineCells[_h33];
                    for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                      const v_x = _a269[_i270];
                      if (!(((v_x === _wc247 ? _wd248 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g265.push(v_x);
                    }
                  }
                  _g271.length = 0;
                  G272: {
                    const _a275 = sp.lineCells[_h40];
                    for (let _i276 = 0; _i276 < _a275.length; _i276++) {
                      const v_x = _a275[_i276];
                      if (!(((v_x === _wc247 ? _wd248 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g271.push(v_x);
                    }
                  }
                  const _a277 = union(stretch(sp.lineCells[_h33], v_k, _g265), stretch(sp.lineCells[_h40], v_k, _g271));
                  for (let _i278 = 0; _i278 < _a277.length; _i278++) {
                    const v_j = _a277[_i278];
                    const _h279 = clueAt(cl.length, v_j);
                    if (!((_h279 >= 0))) continue;
                    _g249.push(v_j);
                  }
                }
                _g280.length = 0;
                G281: {
                  _g296.length = 0;
                  G297: {
                    const _a300 = sp.lineCells[_h33];
                    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                      const v_x = _a300[_i301];
                      if (!(((v_x === _wc247 ? _wd248 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g296.push(v_x);
                    }
                  }
                  _g302.length = 0;
                  G303: {
                    const _a306 = sp.lineCells[_h40];
                    for (let _i307 = 0; _i307 < _a306.length; _i307++) {
                      const v_x = _a306[_i307];
                      if (!(((v_x === _wc247 ? _wd248 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g302.push(v_x);
                    }
                  }
                  const _a308 = union(stretch(sp.lineCells[_h33], v_k, _g296), stretch(sp.lineCells[_h40], v_k, _g302));
                  for (let _i309 = 0; _i309 < _a308.length; _i309++) {
                    const v_j = _a308[_i309];
                    const _h310 = clueAt(cl.length, v_j);
                    if (!((_h310 >= 0))) continue;
                    _g280.push(v_j);
                  }
                }
                facts.push(PLACE, v_c, _t50);
                twoCluesFactSays.push({ wording: ((_g216.length !== 2) ? 0 : (clueAt(cl.length, (_g249[0] ?? -1)) === clueAt(cl.length, (_g280[1] ?? -1))) ? 1 : 2), terms: { hor: (v_a === 2), own: _h53, clues: _g56.slice(), run: union(stretch(sp.lineCells[_h33], v_k, _g89), stretch(sp.lineCells[_h40], v_k, _g95)).slice(), n: _g103.length, first: clueAt(cl.length, (_g136[0] ?? -1)), second: clueAt(cl.length, (_g169[1] ?? -1)) }, marks: { outline: union(stretch(sp.lineCells[_h33], v_k, _g202), stretch(sp.lineCells[_h40], v_k, _g208)).slice() } });
              }
            }
            if (!(true)) {
              _q23 = false;
              break Q24;
            }
          }
        }
      }
      _c311 = _q23;
    }
    if (!(_c311)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        if (twoCluesFactSays.length * 3 !== facts.length) throw new Error("twoClues: a fact of its conclusion is made where says.fact is not read");
        const _says = { terms: { clue: v_k }, marks: { reads: setOf(v_k).slice() }, facts: twoCluesFactSays.slice() };
        if (!fire({ k: v_k }, facts, _says)) return 1;
      }
      cands.fill(-1);
    }
  }
  return fired;
}

export interface TooLongBinding {
  k: number;
  v: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface TooLongSaysFact {
  terms: { hor: boolean; own: boolean; size: number; run: readonly number[]; };
  marks: { outline: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface TooLongSays {
  terms: { clue: number; value: number; };
  marks: { reads: readonly number[]; };
  facts: TooLongSaysFact[];
}

const tooLongFacts: number[] = [];
const tooLongFactSays: TooLongSaysFact[] = [];
let tooLongCands = new Int32Array(0);

/** Its dearest read grows with the board as n^1.5. */
export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding, TooLongSays> | null): number {
  const _g8: number[] = [];
  const _g14: number[] = [];
  const _g29: number[] = [];
  const _g36: number[] = [];
  const _g48: number[] = [];
  const _g54: number[] = [];
  const _g62: number[] = [];
  const _g68: number[] = [];
  const _g76: number[] = [];
  const _g82: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  if (tooLongCands.length < sp.cells.length) tooLongCands = new Int32Array(sp.cells.length);
  const cands = tooLongCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.length, v_k);
    const _h28 = sp.rowOf[v_k];
    const _h35 = sp.colOf[v_k];
    L7: {
      const v_v = _h6;
      if (!((v_v >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("tooLong", [(sp.cells.includes(v_k)), (v_v === clueAt(cl.length, v_k)), (v_v >= 0)], ["k in", "v =", "where of v"]);
      }
      facts.length = 0;
      tooLongFactSays.length = 0;
      changed = false;
      _g8.length = 0;
      G9: {
        const _a12 = sp.lineCells[sp.rowOf[v_k]];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_x = _a12[_i13];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g8.push(v_x);
        }
      }
      _g14.length = 0;
      G15: {
        const _a18 = sp.lineCells[sp.colOf[v_k]];
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_x = _a18[_i19];
          if (!(((b.grid[v_x] || -1) === 2))) continue;
          _g14.push(v_x);
        }
      }
      let _c88: boolean = (union(stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g8), stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g14)).length <= v_v);
      if (_c88) {
        let _q20 = true;
        Q21: {
          const _a22 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_c = _a22[_i23];
            const _h24 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h24 < 0)))) continue;
            const _h43 = clueAt(cl.length, v_c);
            const _h44 = (_h43 >= 0);
            const _h45 = _h44;
            for (let _m25 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m25 !== 0; _m25 &= _m25 - 1) {
              const v_a = 31 - Math.clz32(_m25 & -_m25);
              const _wc26 = v_c;
              const _wd27 = v_a;
              _g29.length = 0;
              G30: {
                const _a33 = sp.lineCells[_h28];
                for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                  const v_x = _a33[_i34];
                  if (!(((v_x === _wc26 ? _wd27 : (b.grid[v_x] || -1)) === 1))) continue;
                  _g29.push(v_x);
                }
              }
              _g36.length = 0;
              G37: {
                const _a40 = sp.lineCells[_h35];
                for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                  const v_x = _a40[_i41];
                  if (!(((v_x === _wc26 ? _wd27 : (b.grid[v_x] || -1)) === 2))) continue;
                  _g36.push(v_x);
                }
              }
              if (!((union(stretch(sp.lineCells[_h28], v_k, _g29), stretch(sp.lineCells[_h35], v_k, _g36)).length > v_v))) continue;
              const _t42 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) {
                if (fire === null) { b.placeAt(v_c, _t42); changed = true; }
                if (fire !== null) {
                  const _wc46 = v_c;
                  const _wd47 = v_a;
                  _g48.length = 0;
                  G49: {
                    const _a52 = sp.lineCells[_h28];
                    for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                      const v_x = _a52[_i53];
                      if (!(((v_x === _wc46 ? _wd47 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g48.push(v_x);
                    }
                  }
                  _g54.length = 0;
                  G55: {
                    const _a58 = sp.lineCells[_h35];
                    for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                      const v_x = _a58[_i59];
                      if (!(((v_x === _wc46 ? _wd47 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g54.push(v_x);
                    }
                  }
                  const _wc60 = v_c;
                  const _wd61 = v_a;
                  _g62.length = 0;
                  G63: {
                    const _a66 = sp.lineCells[_h28];
                    for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                      const v_x = _a66[_i67];
                      if (!(((v_x === _wc60 ? _wd61 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g62.push(v_x);
                    }
                  }
                  _g68.length = 0;
                  G69: {
                    const _a72 = sp.lineCells[_h35];
                    for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                      const v_x = _a72[_i73];
                      if (!(((v_x === _wc60 ? _wd61 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g68.push(v_x);
                    }
                  }
                  const _wc74 = v_c;
                  const _wd75 = v_a;
                  _g76.length = 0;
                  G77: {
                    const _a80 = sp.lineCells[_h28];
                    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                      const v_x = _a80[_i81];
                      if (!(((v_x === _wc74 ? _wd75 : (b.grid[v_x] || -1)) === 1))) continue;
                      _g76.push(v_x);
                    }
                  }
                  _g82.length = 0;
                  G83: {
                    const _a86 = sp.lineCells[_h35];
                    for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                      const v_x = _a86[_i87];
                      if (!(((v_x === _wc74 ? _wd75 : (b.grid[v_x] || -1)) === 2))) continue;
                      _g82.push(v_x);
                    }
                  }
                  facts.push(PLACE, v_c, _t42);
                  tooLongFactSays.push({ terms: { hor: (v_a === 2), own: _h45, size: union(stretch(sp.lineCells[_h28], v_k, _g48), stretch(sp.lineCells[_h35], v_k, _g54)).length, run: union(stretch(sp.lineCells[_h28], v_k, _g62), stretch(sp.lineCells[_h35], v_k, _g68)).slice() }, marks: { outline: union(stretch(sp.lineCells[_h28], v_k, _g76), stretch(sp.lineCells[_h35], v_k, _g82)).slice() } });
                }
              }
              if (!(true)) {
                _q20 = false;
                break Q21;
              }
            }
          }
        }
        _c88 = _q20;
      }
      if (!(_c88)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          if (tooLongFactSays.length * 3 !== facts.length) throw new Error("tooLong: a fact of its conclusion is made where says.fact is not read");
          const _says = { terms: { clue: v_k, value: v_v }, marks: { reads: setOf(v_k).slice() }, facts: tooLongFactSays.slice() };
          if (!fire({ k: v_k, v: v_v }, facts, _says)) return 1;
        }
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface StarvedBinding {
  b: number;
  n: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface StarvedSaysFact {
  /** The index of the wording that held (`STATED`). */
  wording: number;
  terms: { hor: boolean; own: boolean; };
  marks: {  };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface StarvedSays {
  terms: { clue: number; value: number; };
  marks: { reads: readonly number[]; outline: readonly number[]; };
  facts: StarvedSaysFact[];
}

const starvedFacts: number[] = [];
const starvedFactSays: StarvedSaysFact[] = [];
let starvedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function starved(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StarvedBinding, StarvedSays> | null): number {
  const _g35: number[] = [];
  const facts = starvedFacts;
  let fired = 0;
  let changed = false;
  if (starvedCands.length < sp.cells.length) starvedCands = new Int32Array(sp.cells.length);
  const cands = starvedCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_b = _a4[_i5];
    const _h6 = clueAt(cl.joins, v_b);
    const _h13 = ((v_b / sp.w) | 0);
    const _h14 = (v_b % sp.w);
    L7: {
      const v_n = _h6;
      if (!((v_n >= 0))) break L7;
      const _h32 = (v_n === 1);
      const _h33 = (v_n === 2);
      if (DEV && staleChecking) {
        freshBinding("starved", [(sp.cells.includes(v_b)), (v_n === clueAt(cl.joins, v_b)), (v_n >= 0)], ["b in", "n =", "where of n"]);
      }
      facts.length = 0;
      starvedFactSays.length = 0;
      changed = false;
      let _g8 = 0;
      G9: {
        const _a10 = sp.adj4[v_b];
        for (let _i11 = 0; _i11 < _a10.length; _i11++) {
          const v_p = _a10[_i11];
          const _h12 = clueAt(cl.block, v_p);
          if (!(((_h12 < 0) && (!((b.grid[v_p] !== 0)) || ((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h13)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h14))))))) continue;
          _g8++;
        }
      }
      let _c34: boolean = (_g8 >= v_n);
      if (_c34) {
        let _q15 = true;
        Q16: {
          const _a17 = sp.adj4[v_b];
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_c = _a17[_i18];
            const _h19 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h19 < 0)))) continue;
            const _h29 = clueAt(cl.length, v_c);
            const _h30 = (_h29 >= 0);
            const _h31 = _h30;
            for (let _m20 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m20 !== 0; _m20 &= _m20 - 1) {
              const v_a = 31 - Math.clz32(_m20 & -_m20);
              const _wc21 = v_c;
              const _wd22 = v_a;
              let _g23 = 0;
              G24: {
                const _a25 = sp.adj4[v_b];
                for (let _i26 = 0; _i26 < _a25.length; _i26++) {
                  const v_p = _a25[_i26];
                  const _h27 = clueAt(cl.block, v_p);
                  if (!(((_h27 < 0) && (!((v_p === _wc21 ? true : (b.grid[v_p] !== 0))) || ((((v_p === _wc21 ? _wd22 : (b.grid[v_p] || -1)) === 1) && (((v_p / sp.w) | 0) === _h13)) || (((v_p === _wc21 ? _wd22 : (b.grid[v_p] || -1)) === 2) && ((v_p % sp.w) === _h14))))))) continue;
                  _g23++;
                }
              }
              if (!((_g23 < v_n))) continue;
              const _t28 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) {
                if (fire === null) { b.placeAt(v_c, _t28); changed = true; }
                if (fire !== null) {
                  facts.push(PLACE, v_c, _t28);
                  starvedFactSays.push({ wording: (_h32 ? 0 : _h33 ? 1 : 2), terms: { hor: (v_a === 2), own: _h31 }, marks: {  } });
                }
              }
              if (!(true)) {
                _q15 = false;
                break Q16;
              }
            }
          }
        }
        _c34 = _q15;
      }
      if (!(_c34)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          if (starvedFactSays.length * 3 !== facts.length) throw new Error("starved: a fact of its conclusion is made where says.fact is not read");
          _g35.length = 0;
          G36: {
            const _a39 = sp.adj4[v_b];
            for (let _i40 = 0; _i40 < _a39.length; _i40++) {
              const v_p = _a39[_i40];
              const _h41 = clueAt(cl.block, v_p);
              if (!(((_h41 < 0) && (!((b.grid[v_p] !== 0)) || ((((b.grid[v_p] || -1) === 1) && (((v_p / sp.w) | 0) === _h13)) || (((b.grid[v_p] || -1) === 2) && ((v_p % sp.w) === _h14))))))) continue;
              _g35.push(v_p);
            }
          }
          const _says = { terms: { clue: v_b, value: v_n }, marks: { reads: setOf(v_b).slice(), outline: _g35.slice() }, facts: starvedFactSays.slice() };
          if (!fire({ b: v_b, n: v_n }, facts, _says)) return 1;
        }
        cands.fill(-1);
      }
    }
  }
  return fired;
}

export interface UnreachableBinding {
  k: number;
  v: number;
}

/** What a square the firing decides has of its own, read where it is made. */
export interface UnreachableSaysFact {
  terms: { hor: boolean; own: boolean; max: number; };
  marks: { outline: readonly number[]; };
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; and `facts`, what each of its facts has of its own. */
export interface UnreachableSays {
  terms: { clue: number; value: number; };
  marks: { reads: readonly number[]; };
  facts: UnreachableSaysFact[];
}

const unreachableFacts: number[] = [];
const unreachableFactSays: UnreachableSaysFact[] = [];
let unreachableCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function unreachable(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UnreachableBinding, UnreachableSays> | null): number {
  const _g17: number[] = [];
  const _g38: number[] = [];
  const _g49: number[] = [];
  const _g70: number[] = [];
  const _g87: number[] = [];
  const _g108: number[] = [];
  const _g118: number[] = [];
  const _g139: number[] = [];
  const _g151: number[] = [];
  const _g172: number[] = [];
  const _g182: number[] = [];
  const _g203: number[] = [];
  const facts = unreachableFacts;
  let fired = 0;
  let changed = false;
  if (unreachableCands.length < sp.cells.length) unreachableCands = new Int32Array(sp.cells.length);
  const cands = unreachableCands;
  cands.fill(-1);
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_k = _a4[_i5];
    const _h6 = clueAt(cl.length, v_k);
    const _h16 = sp.rowOf[v_k];
    const _h48 = sp.colOf[v_k];
    L7: {
      const v_v = _h6;
      if (!((v_v >= 0))) break L7;
      if (DEV && staleChecking) {
        freshBinding("unreachable", [(sp.cells.includes(v_k)), (v_v === clueAt(cl.length, v_k)), (v_v >= 0)], ["k in", "v =", "where of v"]);
      }
      facts.length = 0;
      unreachableFactSays.length = 0;
      changed = false;
      let _c213: boolean = (!((b.grid[v_k] !== 0)) || (reach(b, sp, cl, v_k) >= v_v));
      if (_c213) {
        let _q8 = true;
        Q9: {
          const _a10 = union(sp.lineCells[sp.rowOf[v_k]], sp.lineCells[sp.colOf[v_k]]);
          for (let _i11 = 0; _i11 < _a10.length; _i11++) {
            const v_c = _a10[_i11];
            const _h12 = clueAt(cl.block, v_c);
            if (!((!((b.grid[v_c] !== 0)) && (_h12 < 0)))) continue;
            const _h82 = clueAt(cl.length, v_c);
            const _h83 = (_h82 >= 0);
            const _h84 = _h83;
            for (let _m13 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m13 !== 0; _m13 &= _m13 - 1) {
              const v_a = 31 - Math.clz32(_m13 & -_m13);
              const _wc14 = v_c;
              const _wd15 = v_a;
              let _c80: boolean = (v_k === _wc14 ? true : (b.grid[v_k] !== 0));
              if (_c80) {
                _g17.length = 0;
                G18: {
                  const _a33 = sp.lineCells[_h16];
                  for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                    const v_x = _a33[_i34];
                    const _h35 = clueAt(cl.block, v_x);
                    let _c47: boolean = ((_h35 < 0) && (!((v_x === _wc14 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc14 ? _wd15 : (b.grid[v_x] || -1)) === 1)));
                    if (_c47) {
                      let _q36 = true;
                      Q37: {
                        _g38.length = 0;
                        G39: {
                          const _a42 = sp.lineCells[_h16];
                          for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                            const v_z = _a42[_i43];
                            if (!((((v_z === _wc14 ? _wd15 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                            _g38.push(v_z);
                          }
                        }
                        const _a44 = stretch(sp.lineCells[_h16], v_x, _g38);
                        for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                          const v_y = _a44[_i45];
                          const _h46 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h46 >= 0))))) {
                            _q36 = false;
                            break Q37;
                          }
                        }
                      }
                      _c47 = _q36;
                    }
                    if (!(_c47)) continue;
                    _g17.push(v_x);
                  }
                }
                _g49.length = 0;
                G50: {
                  const _a65 = sp.lineCells[_h48];
                  for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                    const v_x = _a65[_i66];
                    const _h67 = clueAt(cl.block, v_x);
                    let _c79: boolean = ((_h67 < 0) && (!((v_x === _wc14 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc14 ? _wd15 : (b.grid[v_x] || -1)) === 2)));
                    if (_c79) {
                      let _q68 = true;
                      Q69: {
                        _g70.length = 0;
                        G71: {
                          const _a74 = sp.lineCells[_h48];
                          for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                            const v_z = _a74[_i75];
                            if (!((((v_z === _wc14 ? _wd15 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                            _g70.push(v_z);
                          }
                        }
                        const _a76 = stretch(sp.lineCells[_h48], v_x, _g70);
                        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                          const v_y = _a76[_i77];
                          const _h78 = clueAt(cl.length, v_y);
                          if (!(((v_y === v_k) || !((_h78 >= 0))))) {
                            _q68 = false;
                            break Q69;
                          }
                        }
                      }
                      _c79 = _q68;
                    }
                    if (!(_c79)) continue;
                    _g49.push(v_x);
                  }
                }
                _c80 = ((stretch(sp.lineCells[_h16], v_k, _g17).length + stretch(sp.lineCells[_h48], v_k, _g49).length) < v_v);
              }
              if (!(_c80)) continue;
              const _t81 = (3 - v_a);
              if (!(b.grid[v_c] !== 0)) {
                if (fire === null) { b.placeAt(v_c, _t81); changed = true; }
                if (fire !== null) {
                  const _wc85 = v_c;
                  const _wd86 = v_a;
                  _g87.length = 0;
                  G88: {
                    const _a103 = sp.lineCells[_h16];
                    for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                      const v_x = _a103[_i104];
                      const _h105 = clueAt(cl.block, v_x);
                      let _c117: boolean = ((_h105 < 0) && (!((v_x === _wc85 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc85 ? _wd86 : (b.grid[v_x] || -1)) === 1)));
                      if (_c117) {
                        let _q106 = true;
                        Q107: {
                          _g108.length = 0;
                          G109: {
                            const _a112 = sp.lineCells[_h16];
                            for (let _i113 = 0; _i113 < _a112.length; _i113++) {
                              const v_z = _a112[_i113];
                              if (!((((v_z === _wc85 ? _wd86 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                              _g108.push(v_z);
                            }
                          }
                          const _a114 = stretch(sp.lineCells[_h16], v_x, _g108);
                          for (let _i115 = 0; _i115 < _a114.length; _i115++) {
                            const v_y = _a114[_i115];
                            const _h116 = clueAt(cl.length, v_y);
                            if (!(((v_y === v_k) || !((_h116 >= 0))))) {
                              _q106 = false;
                              break Q107;
                            }
                          }
                        }
                        _c117 = _q106;
                      }
                      if (!(_c117)) continue;
                      _g87.push(v_x);
                    }
                  }
                  _g118.length = 0;
                  G119: {
                    const _a134 = sp.lineCells[_h48];
                    for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                      const v_x = _a134[_i135];
                      const _h136 = clueAt(cl.block, v_x);
                      let _c148: boolean = ((_h136 < 0) && (!((v_x === _wc85 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc85 ? _wd86 : (b.grid[v_x] || -1)) === 2)));
                      if (_c148) {
                        let _q137 = true;
                        Q138: {
                          _g139.length = 0;
                          G140: {
                            const _a143 = sp.lineCells[_h48];
                            for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                              const v_z = _a143[_i144];
                              if (!((((v_z === _wc85 ? _wd86 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                              _g139.push(v_z);
                            }
                          }
                          const _a145 = stretch(sp.lineCells[_h48], v_x, _g139);
                          for (let _i146 = 0; _i146 < _a145.length; _i146++) {
                            const v_y = _a145[_i146];
                            const _h147 = clueAt(cl.length, v_y);
                            if (!(((v_y === v_k) || !((_h147 >= 0))))) {
                              _q137 = false;
                              break Q138;
                            }
                          }
                        }
                        _c148 = _q137;
                      }
                      if (!(_c148)) continue;
                      _g118.push(v_x);
                    }
                  }
                  const _wc149 = v_c;
                  const _wd150 = v_a;
                  _g151.length = 0;
                  G152: {
                    const _a167 = sp.lineCells[_h16];
                    for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                      const v_x = _a167[_i168];
                      const _h169 = clueAt(cl.block, v_x);
                      let _c181: boolean = ((_h169 < 0) && (!((v_x === _wc149 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc149 ? _wd150 : (b.grid[v_x] || -1)) === 1)));
                      if (_c181) {
                        let _q170 = true;
                        Q171: {
                          _g172.length = 0;
                          G173: {
                            const _a176 = sp.lineCells[_h16];
                            for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                              const v_z = _a176[_i177];
                              if (!((((v_z === _wc149 ? _wd150 : (b.grid[v_z] || -1)) === 1) || (v_z === v_x)))) continue;
                              _g172.push(v_z);
                            }
                          }
                          const _a178 = stretch(sp.lineCells[_h16], v_x, _g172);
                          for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                            const v_y = _a178[_i179];
                            const _h180 = clueAt(cl.length, v_y);
                            if (!(((v_y === v_k) || !((_h180 >= 0))))) {
                              _q170 = false;
                              break Q171;
                            }
                          }
                        }
                        _c181 = _q170;
                      }
                      if (!(_c181)) continue;
                      _g151.push(v_x);
                    }
                  }
                  _g182.length = 0;
                  G183: {
                    const _a198 = sp.lineCells[_h48];
                    for (let _i199 = 0; _i199 < _a198.length; _i199++) {
                      const v_x = _a198[_i199];
                      const _h200 = clueAt(cl.block, v_x);
                      let _c212: boolean = ((_h200 < 0) && (!((v_x === _wc149 ? true : (b.grid[v_x] !== 0))) || ((v_x === _wc149 ? _wd150 : (b.grid[v_x] || -1)) === 2)));
                      if (_c212) {
                        let _q201 = true;
                        Q202: {
                          _g203.length = 0;
                          G204: {
                            const _a207 = sp.lineCells[_h48];
                            for (let _i208 = 0; _i208 < _a207.length; _i208++) {
                              const v_z = _a207[_i208];
                              if (!((((v_z === _wc149 ? _wd150 : (b.grid[v_z] || -1)) === 2) || (v_z === v_x)))) continue;
                              _g203.push(v_z);
                            }
                          }
                          const _a209 = stretch(sp.lineCells[_h48], v_x, _g203);
                          for (let _i210 = 0; _i210 < _a209.length; _i210++) {
                            const v_y = _a209[_i210];
                            const _h211 = clueAt(cl.length, v_y);
                            if (!(((v_y === v_k) || !((_h211 >= 0))))) {
                              _q201 = false;
                              break Q202;
                            }
                          }
                        }
                        _c212 = _q201;
                      }
                      if (!(_c212)) continue;
                      _g182.push(v_x);
                    }
                  }
                  facts.push(PLACE, v_c, _t81);
                  unreachableFactSays.push({ terms: { hor: (v_a === 2), own: _h84, max: (stretch(sp.lineCells[_h16], v_k, _g87).length + stretch(sp.lineCells[_h48], v_k, _g118).length) }, marks: { outline: union(stretch(sp.lineCells[_h16], v_k, _g151), stretch(sp.lineCells[_h48], v_k, _g182)).slice() } });
                }
              }
              if (!(true)) {
                _q8 = false;
                break Q9;
              }
            }
          }
        }
        _c213 = _q8;
      }
      if (!(_c213)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          if (unreachableFactSays.length * 3 !== facts.length) throw new Error("unreachable: a fact of its conclusion is made where says.fact is not read");
          const _says = { terms: { clue: v_k, value: v_v }, marks: { reads: setOf(v_k).slice() }, facts: unreachableFactSays.slice() };
          if (!fire({ k: v_k, v: v_v }, facts, _says)) return 1;
        }
        cands.fill(-1);
      }
    }
  }
  return fired;
}

const reachKept = keptStore<number>();

/** `reach(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function reach(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): number {
  const _kept: Kept<number> = reachKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  const _g1: number[] = [];
  G2: {
    const _a17 = sp.lineCells[sp.rowOf[v_k]];
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_x = _a17[_i18];
      const _t19 = sp.rowOf[v_k];
      let _c30: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 1)));
      if (_c30) {
        let _q20 = true;
        Q21: {
          const _g22: number[] = [];
          G23: {
            const _a26 = sp.lineCells[_t19];
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_z = _a26[_i27];
              if (!((((b.grid[v_z] || -1) === 1) || (v_z === v_x)))) continue;
              _g22.push(v_z);
            }
          }
          const _a28 = stretch(sp.lineCells[_t19], v_x, _g22);
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_y = _a28[_i29];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q20 = false;
              break Q21;
            }
          }
        }
        _c30 = _q20;
      }
      if (!(_c30)) continue;
      _g1.push(v_x);
    }
  }
  const _g31: number[] = [];
  G32: {
    const _a47 = sp.lineCells[sp.colOf[v_k]];
    for (let _i48 = 0; _i48 < _a47.length; _i48++) {
      const v_x = _a47[_i48];
      const _t49 = sp.colOf[v_k];
      let _c60: boolean = ((clueAt(cl.block, v_x) < 0) && (!((b.grid[v_x] !== 0)) || ((b.grid[v_x] || -1) === 2)));
      if (_c60) {
        let _q50 = true;
        Q51: {
          const _g52: number[] = [];
          G53: {
            const _a56 = sp.lineCells[_t49];
            for (let _i57 = 0; _i57 < _a56.length; _i57++) {
              const v_z = _a56[_i57];
              if (!((((b.grid[v_z] || -1) === 2) || (v_z === v_x)))) continue;
              _g52.push(v_z);
            }
          }
          const _a58 = stretch(sp.lineCells[_t49], v_x, _g52);
          for (let _i59 = 0; _i59 < _a58.length; _i59++) {
            const v_y = _a58[_i59];
            if (!(((v_y === v_k) || !((clueAt(cl.length, v_y) >= 0))))) {
              _q50 = false;
              break Q51;
            }
          }
        }
        _c60 = _q50;
      }
      if (!(_c60)) continue;
      _g31.push(v_x);
    }
  }
  const _made = (stretch(sp.lineCells[sp.rowOf[v_k]], v_k, _g1).length + stretch(sp.lineCells[sp.colOf[v_k]], v_k, _g31).length);
  _kept[v_k] = _made;
  return _made;
}
