// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, edgeGroups, freshBinding, keptStore, minus, popcount, rangeMask, sameSet, setOf, staleChecking, stamps, through, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  n: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlySpot" | "squareOnly" | "squareSingleDomino" | "mustOverlap" | "localDuplicate" | "localDuplicate2" | "parity" | "set" | "setDoubles";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  onlySpot: OnlySpotSays;
  squareOnly: SquareOnlySays;
  squareSingleDomino: SquareSingleDominoSays;
  mustOverlap: MustOverlapSays;
  localDuplicate: LocalDuplicateSays;
  localDuplicate2: LocalDuplicate2Says;
  parity: ParitySays;
  set: SetSays;
  setDoubles: SetDoublesSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["onlySpot","squareOnly","squareSingleDomino","mustOverlap","localDuplicate","localDuplicate2","parity","set","setDoubles"] as const;

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
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
  { id: "onlySpot", tier: 0 },
  { id: "squareOnly", tier: 0 },
  { id: "squareSingleDomino", tier: 1 },
  { id: "mustOverlap", tier: 1 },
  { id: "localDuplicate", tier: 1 },
  { id: "localDuplicate2", tier: 1 },
  { id: "parity", tier: 1 },
  { id: "set", tier: 2 },
  { id: "setDoubles", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        const _a7 = sp.adj4[v_c];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const _h9 = (g[sp.adj4Edges[v_c][_i8]] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      if (!((_g5 === 1))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q10 = true;
  Q11: {
    const _a12 = sp.edges;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_e = _a12[_i13];
      const _h16 = (g[v_e] || -1);
      const _h17 = (_h16 === 1);
      const _h19 = sp.edgeEnds[2 * v_e];
      const _h20 = clueAt(cl.number, _h19);
      const _h21 = _h20;
      const _h24 = sp.edgeEnds[2 * v_e + 1];
      const _h25 = clueAt(cl.number, _h24);
      const _h26 = _h25;
      const _a14 = sp.edges;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_f = _a14[_i15];
        const _h18 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h17) && (_h18 === 1)))) continue;
        const _t22 = sp.edgeEnds[2 * v_f];
        const _h23 = clueAt(cl.number, _t22);
        let _c29: boolean = (_h21 === _h23);
        if (_c29) {
          const _t27 = sp.edgeEnds[2 * v_f + 1];
          const _h28 = clueAt(cl.number, _t27);
          _c29 = (_h26 === _h28);
        }
        let _c35: boolean = _c29;
        if (!_c35) {
          const _t30 = sp.edgeEnds[2 * v_f + 1];
          const _h31 = clueAt(cl.number, _t30);
          let _c34: boolean = (_h21 === _h31);
          if (_c34) {
            const _t32 = sp.edgeEnds[2 * v_f];
            const _h33 = clueAt(cl.number, _t32);
            _c34 = (_h26 === _h33);
          }
          _c35 = _c34;
        }
        if (!(!(_c35))) {
          _q10 = false;
          break Q11;
        }
      }
    }
  }
  if (!(_q10)) return false;
  for (let _k36 = 0; _k36 < cl.number.at.length; _k36++) {
    const _at37 = cl.number.at[_k36];
    let _q39 = true;
    Q40: {
      const _a41 = sp.adj4[_at37];
      for (let _i42 = 0; _i42 < _a41.length; _i42++) {
        let _q43 = false;
        Q44: {
          const _a45 = sp.edges;
          for (let _i46 = 0; _i46 < _a45.length; _i46++) {
            const v_f = _a45[_i46];
            const _h47 = (g[v_f] || -1);
            if (!((_h47 === 1))) continue;
            const _t48 = sp.adj4Edges[_at37][_i42];
            const _t49 = sp.edgeEnds[2 * _t48];
            const _h50 = clueAt(cl.number, _t49);
            const _t51 = sp.edgeEnds[2 * v_f];
            const _h52 = clueAt(cl.number, _t51);
            let _c57: boolean = (_h50 === _h52);
            if (_c57) {
              const _t53 = sp.edgeEnds[2 * _t48 + 1];
              const _h54 = clueAt(cl.number, _t53);
              const _t55 = sp.edgeEnds[2 * v_f + 1];
              const _h56 = clueAt(cl.number, _t55);
              _c57 = (_h54 === _h56);
            }
            let _c67: boolean = _c57;
            if (!_c67) {
              const _t58 = sp.edgeEnds[2 * _t48];
              const _h59 = clueAt(cl.number, _t58);
              const _t60 = sp.edgeEnds[2 * v_f + 1];
              const _h61 = clueAt(cl.number, _t60);
              let _c66: boolean = (_h59 === _h61);
              if (_c66) {
                const _t62 = sp.edgeEnds[2 * _t48 + 1];
                const _h63 = clueAt(cl.number, _t62);
                const _t64 = sp.edgeEnds[2 * v_f];
                const _h65 = clueAt(cl.number, _t64);
                _c66 = (_h63 === _h65);
              }
              _c67 = _c66;
            }
            if (_c67) {
              _q43 = true;
              break Q44;
            }
          }
        }
        if (!(_q43)) {
          _q39 = false;
          break Q40;
        }
      }
    }
    if (!(_q39)) return false;
  }
  return true;
}

export interface PlacedBinding {
  e: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function placed(b: Marks, sp: GridSpace, cl: Dealt, v_e: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h15 = sp.edgeEnds[2 * v_e];
  const _h16 = clueAt(cl.number, _h15);
  const _h17 = _h16;
  const _h20 = sp.edgeEnds[2 * v_e + 1];
  const _h21 = clueAt(cl.number, _h20);
  const _h22 = _h21;
  if (!(((b.grid[v_e] || -1) === 1))) return 0;
  if (DEV && staleChecking) {
    freshBinding("placed", [(sp.edges.includes(v_e)), ((b.grid[v_e] || -1) === 1)], ["e in", "where of e"]);
  }
  facts.length = 0;
  changed = false;
  let _q3 = true;
  Q4: {
    const _t5 = sp.edgeEnds[2 * v_e];
    const _t6 = sp.edgeEnds[2 * v_e + 1];
    for (let _i7 = 0; _i7 < 2; _i7++) {
      const v_x = _i7 === 0 ? _t5 : _t6;
      if (_i7 === 1 && (v_x === _t5)) continue;
      const _a8 = sp.adj4[v_x];
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        if (!((sp.adj4Edges[v_x][_i9] !== v_e))) continue;
        const _t10 = sp.adj4Edges[v_x][_i9];
        if (!(b.grid[_t10] !== 0)) { if (fire === null) { b.placeAt(_t10, 2); changed = true; } else facts.push(PLACE, _t10, 2); }
        if (!(true)) {
          _q3 = false;
          break Q4;
        }
      }
    }
  }
  let _c33: boolean = _q3;
  if (_c33) {
    let _q11 = true;
    Q12: {
      const _a13 = sp.edges;
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_f = _a13[_i14];
        let _c32: boolean = (v_f !== v_e);
        if (_c32) {
          const _t18 = sp.edgeEnds[2 * v_f];
          const _h19 = clueAt(cl.number, _t18);
          let _c25: boolean = (_h17 === _h19);
          if (_c25) {
            const _t23 = sp.edgeEnds[2 * v_f + 1];
            const _h24 = clueAt(cl.number, _t23);
            _c25 = (_h22 === _h24);
          }
          let _c31: boolean = _c25;
          if (!_c31) {
            const _t26 = sp.edgeEnds[2 * v_f + 1];
            const _h27 = clueAt(cl.number, _t26);
            let _c30: boolean = (_h17 === _h27);
            if (_c30) {
              const _t28 = sp.edgeEnds[2 * v_f];
              const _h29 = clueAt(cl.number, _t28);
              _c30 = (_h22 === _h29);
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        if (!(_c32)) continue;
        if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
        if (!(true)) {
          _q11 = false;
          break Q12;
        }
      }
    }
    _c33 = _q11;
  }
  if (!(_c33)) return -1;
  if (changed || facts.length > 0) {
    fired = 1;
    if (fire !== null) fire({ e: v_e }, facts);
  }
  return fired;
}

export interface OnlySpotBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OnlySpotSays {
  terms: {  };
  marks: {  };
}

const onlySpotFacts: number[] = [];
const onlySpot_st24 = stamps();

/** Its dearest read grows with the board as 1. */
export function onlySpot(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySpotBinding, OnlySpotSays> | null): number {
  const _g18: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _k25 = showingKept.board(cl);
  const _t16 = cl.n;
  for (let v_a = 0; v_a <= _t16; v_a++) {
    const _t17 = cl.n;
    for (let v_b = v_a; v_b <= _t17; v_b++) {
      _g18.length = 0;
      onlySpot_st24.pass++;
      G19: {
        const _a26 = (_k25[v_a] ?? showing(sp, cl, v_a));
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_x = _a26[_i27];
          const _a28 = sp.adj4[v_x];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_y = _a28[_i29];
            const _h30 = clueAt(cl.number, v_y);
            if (!(((_h30 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i29]] || -1) !== 2)))) continue;
            const _t31 = sp.adj4Edges[v_x][_i29];
            const _t32 = _t31;
            if (_g18.length < 16) { if (!_g18.includes(_t32)) _g18.push(_t32); } else addOnce(_g18, onlySpot_st24, _t32);
          }
        }
      }
      L33: {
        const v_P = _g18;
        const _h34 = v_P.length;
        if (!((_h34 === 1))) break L33;
        L35: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L35;
          if (DEV && staleChecking) {
            const _g36: number[] = [];
            G37: {
              const _a42 = showing(sp, cl, v_a);
              for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                const v_x = _a42[_i43];
                const _a44 = sp.adj4[v_x];
                for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                  const v_y = _a44[_i45];
                  if (!(((clueAt(cl.number, v_y) === v_b) && ((b.grid[sp.adj4Edges[v_x][_i45]] || -1) !== 2)))) continue;
                  const _t46 = sp.adj4Edges[v_x][_i45];
                  if (!_g36.includes(_t46)) _g36.push(_t46);
                }
              }
            }
            freshBinding("onlySpot", [((0 <= v_a) && (v_a <= cl.n)), ((v_a <= v_b) && (v_b <= cl.n)), sameSet(v_P, _g36), (v_P.length === 1), (v_e === (v_P[0] ?? -1)), !((b.grid[v_e] !== 0))], ["a in", "b in", "P =", "where of P", "e =", "where of e"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: {  }, marks: {  } };
              if (!fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface SquareOnlyBinding {
  c: number;
  S: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SquareOnlySays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const squareOnlyFacts: number[] = [];
const squareOnly_st22 = stamps();

/** Its dearest read grows with the board as n. */
export function squareOnly(b: Marks, sp: GridSpace, fire: Fire<SquareOnlyBinding, SquareOnlySays> | null): number {
  const _g18: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a16 = sp.cells;
  for (let _i17 = 0; _i17 < _a16.length; _i17++) {
    const v_c = _a16[_i17];
    _g18.length = 0;
    squareOnly_st22.pass++;
    G19: {
      const _a23 = sp.adj4[v_c];
      for (let _i24 = 0; _i24 < _a23.length; _i24++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i24]] || -1) !== 2))) continue;
        const _t25 = sp.adj4Edges[v_c][_i24];
        const _t26 = _t25;
        if (_g18.length < 16) { if (!_g18.includes(_t26)) _g18.push(_t26); } else addOnce(_g18, squareOnly_st22, _t26);
      }
    }
    L27: {
      const v_S = _g18;
      const _h28 = v_S.length;
      let _c33: boolean = (_h28 <= 1);
      if (_c33) {
        let _q29 = false;
        Q30: {
          const _a31 = v_S;
          for (let _i32 = 0; _i32 < _a31.length; _i32++) {
            const v_f = _a31[_i32];
            if ((b.grid[v_f] !== 0)) {
              _q29 = true;
              break Q30;
            }
          }
        }
        _c33 = !(_q29);
      }
      if (!(_c33)) break L27;
      if (DEV && staleChecking) {
        const _g34: number[] = [];
        G35: {
          const _a38 = sp.adj4[v_c];
          for (let _i39 = 0; _i39 < _a38.length; _i39++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i39]] || -1) !== 2))) continue;
            const _t40 = sp.adj4Edges[v_c][_i39];
            if (!_g34.includes(_t40)) _g34.push(_t40);
          }
        }
        let _c45: boolean = (v_S.length <= 1);
        if (_c45) {
          let _q41 = false;
          Q42: {
            const _a43 = v_S;
            for (let _i44 = 0; _i44 < _a43.length; _i44++) {
              const v_f = _a43[_i44];
              if ((b.grid[v_f] !== 0)) {
                _q41 = true;
                break Q42;
              }
            }
          }
          _c45 = !(_q41);
        }
        freshBinding("squareOnly", [(sp.cells.includes(v_c)), sameSet(v_S, _g34), _c45], ["c in", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _c47: boolean = (_h28 === 1);
      if (_c47) {
        const _t46 = (v_S[0] ?? -1);
        if (!(b.grid[_t46] !== 0)) { if (fire === null) { b.placeAt(_t46, 1); changed = true; } else facts.push(PLACE, _t46, 1); }
        _c47 = true;
      }
      if (!(_c47)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: {  }, marks: { outline: setOf(v_c).slice() } };
          if (!fire({ c: v_c, S: v_S.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SquareSingleDominoBinding {
  c: number;
  S: readonly number[];
  s: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SquareSingleDominoSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const squareSingleDominoFacts: number[] = [];
const squareSingleDomino_st33 = stamps();

/** Its dearest read grows with the board as n^2. */
export function squareSingleDomino(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareSingleDominoBinding, SquareSingleDominoSays> | null): number {
  const _g29: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a27 = sp.cells;
  for (let _i28 = 0; _i28 < _a27.length; _i28++) {
    const v_c = _a27[_i28];
    _g29.length = 0;
    squareSingleDomino_st33.pass++;
    G30: {
      const _a34 = sp.adj4[v_c];
      for (let _i35 = 0; _i35 < _a34.length; _i35++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i35]] || -1) !== 2))) continue;
        const _t36 = sp.adj4Edges[v_c][_i35];
        const _t37 = _t36;
        if (_g29.length < 16) { if (!_g29.includes(_t37)) _g29.push(_t37); } else addOnce(_g29, squareSingleDomino_st33, _t37);
      }
    }
    L38: {
      const v_S = _g29;
      const _h39 = v_S.length;
      if (!((_h39 >= 2))) break L38;
      L40: {
        const v_s = (v_S[0] ?? -1);
        const _h47 = sp.edgeEnds[2 * v_s];
        const _h48 = clueAt(cl.number, _h47);
        const _h49 = _h48;
        const _h52 = sp.edgeEnds[2 * v_s + 1];
        const _h53 = clueAt(cl.number, _h52);
        const _h54 = _h53;
        let _q41 = true;
        Q42: {
          const _a43 = v_S;
          for (let _i44 = 0; _i44 < _a43.length; _i44++) {
            const v_f = _a43[_i44];
            const _t45 = sp.edgeEnds[2 * v_f];
            const _h46 = clueAt(cl.number, _t45);
            let _c55: boolean = (_h46 === _h49);
            if (_c55) {
              const _t50 = sp.edgeEnds[2 * v_f + 1];
              const _h51 = clueAt(cl.number, _t50);
              _c55 = (_h51 === _h54);
            }
            let _c61: boolean = _c55;
            if (!_c61) {
              const _t56 = sp.edgeEnds[2 * v_f];
              const _h57 = clueAt(cl.number, _t56);
              let _c60: boolean = (_h57 === _h54);
              if (_c60) {
                const _t58 = sp.edgeEnds[2 * v_f + 1];
                const _h59 = clueAt(cl.number, _t58);
                _c60 = (_h59 === _h49);
              }
              _c61 = _c60;
            }
            if (!(_c61)) {
              _q41 = false;
              break Q42;
            }
          }
        }
        if (!(_q41)) break L40;
        if (DEV && staleChecking) {
          const _g62: number[] = [];
          G63: {
            const _a66 = sp.adj4[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i67]] || -1) !== 2))) continue;
              const _t68 = sp.adj4Edges[v_c][_i67];
              if (!_g62.includes(_t68)) _g62.push(_t68);
            }
          }
          let _q69 = true;
          Q70: {
            const _a71 = v_S;
            for (let _i72 = 0; _i72 < _a71.length; _i72++) {
              const v_f = _a71[_i72];
              const _t73 = sp.edgeEnds[2 * v_f];
              const _t74 = sp.edgeEnds[2 * v_s];
              let _c77: boolean = (clueAt(cl.number, _t73) === clueAt(cl.number, _t74));
              if (_c77) {
                const _t75 = sp.edgeEnds[2 * v_f + 1];
                const _t76 = sp.edgeEnds[2 * v_s + 1];
                _c77 = (clueAt(cl.number, _t75) === clueAt(cl.number, _t76));
              }
              let _c83: boolean = _c77;
              if (!_c83) {
                const _t78 = sp.edgeEnds[2 * v_f];
                const _t79 = sp.edgeEnds[2 * v_s + 1];
                let _c82: boolean = (clueAt(cl.number, _t78) === clueAt(cl.number, _t79));
                if (_c82) {
                  const _t80 = sp.edgeEnds[2 * v_f + 1];
                  const _t81 = sp.edgeEnds[2 * v_s];
                  _c82 = (clueAt(cl.number, _t80) === clueAt(cl.number, _t81));
                }
                _c83 = _c82;
              }
              if (!(_c83)) {
                _q69 = false;
                break Q70;
              }
            }
          }
          freshBinding("squareSingleDomino", [(sp.cells.includes(v_c)), sameSet(v_S, _g62), (v_S.length >= 2), (v_s === (v_S[0] ?? -1)), _q69], ["c in", "S =", "where of S", "s =", "where of s"]);
        }
        facts.length = 0;
        changed = false;
        let _q84 = true;
        Q85: {
          const _a86 = sp.edges;
          for (let _i87 = 0; _i87 < _a86.length; _i87++) {
            const v_f = _a86[_i87];
            let _c99: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c99) {
              const _t88 = sp.edgeEnds[2 * v_f];
              const _h89 = clueAt(cl.number, _t88);
              let _c92: boolean = (_h89 === _h49);
              if (_c92) {
                const _t90 = sp.edgeEnds[2 * v_f + 1];
                const _h91 = clueAt(cl.number, _t90);
                _c92 = (_h91 === _h54);
              }
              let _c98: boolean = _c92;
              if (!_c98) {
                const _t93 = sp.edgeEnds[2 * v_f];
                const _h94 = clueAt(cl.number, _t93);
                let _c97: boolean = (_h94 === _h54);
                if (_c97) {
                  const _t95 = sp.edgeEnds[2 * v_f + 1];
                  const _h96 = clueAt(cl.number, _t95);
                  _c97 = (_h96 === _h49);
                }
                _c98 = _c97;
              }
              _c99 = _c98;
            }
            if (!(_c99)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q84 = false;
              break Q85;
            }
          }
        }
        if (!(_q84)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: {  }, marks: { outline: setOf(v_c).slice() } };
            if (!fire({ c: v_c, S: v_S.slice(), s: v_s }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface MustOverlapBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface MustOverlapSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const mustOverlapFacts: number[] = [];
const mustOverlap_st23 = stamps();
const mustOverlap_st68 = stamps();

/** Its dearest read grows with the board as 1. */
export function mustOverlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustOverlapBinding, MustOverlapSays> | null): number {
  const _g17: number[] = [];
  const _g61: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _k24 = showingKept.board(cl);
  const _t15 = cl.n;
  for (let v_a = 0; v_a <= _t15; v_a++) {
    const _t16 = cl.n;
    for (let v_b = v_a; v_b <= _t16; v_b++) {
      _g17.length = 0;
      mustOverlap_st23.pass++;
      G18: {
        const _a25 = (_k24[v_a] ?? showing(sp, cl, v_a));
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_x = _a25[_i26];
          const _a27 = sp.adj4[v_x];
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_y = _a27[_i28];
            const _h29 = clueAt(cl.number, v_y);
            if (!(((_h29 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i28]] || -1) !== 2)))) continue;
            const _t30 = sp.adj4Edges[v_x][_i28];
            const _t31 = _t30;
            if (_g17.length < 16) { if (!_g17.includes(_t31)) _g17.push(_t31); } else addOnce(_g17, mustOverlap_st23, _t31);
          }
        }
      }
      L32: {
        const v_P = _g17;
        const _h33 = v_P.length;
        if (!((_h33 >= 2))) break L32;
        const v_e = (v_P[0] ?? -1);
        if (DEV && staleChecking) {
          const _g34: number[] = [];
          G35: {
            const _a40 = showing(sp, cl, v_a);
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_x = _a40[_i41];
              const _a42 = sp.adj4[v_x];
              for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                const v_y = _a42[_i43];
                if (!(((clueAt(cl.number, v_y) === v_b) && ((b.grid[sp.adj4Edges[v_x][_i43]] || -1) !== 2)))) continue;
                const _t44 = sp.adj4Edges[v_x][_i43];
                if (!_g34.includes(_t44)) _g34.push(_t44);
              }
            }
          }
          freshBinding("mustOverlap", [((0 <= v_a) && (v_a <= cl.n)), ((v_a <= v_b) && (v_b <= cl.n)), sameSet(v_P, _g34), (v_P.length >= 2), (v_e === (v_P[0] ?? -1))], ["a in", "b in", "P =", "where of P", "e ="]);
        }
        facts.length = 0;
        changed = false;
        let _q45 = true;
        Q46: {
          const _t47 = sp.edgeEnds[2 * v_e];
          const _t48 = sp.edgeEnds[2 * v_e + 1];
          for (let _i49 = 0; _i49 < 2; _i49++) {
            const v_x = _i49 === 0 ? _t47 : _t48;
            if (_i49 === 1 && (v_x === _t47)) continue;
            const _a50 = sp.adj4[v_x];
            for (let _i51 = 0; _i51 < _a50.length; _i51++) {
              const _h56 = sp.adj4Edges[v_x][_i51];
              const _h57 = sp.edgeEnds[2 * _h56];
              const _h58 = sp.edgeEnds[2 * _h56 + 1];
              let _c59: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i51])) && ((b.grid[sp.adj4Edges[v_x][_i51]] || -1) !== 2));
              if (_c59) {
                let _q52 = true;
                Q53: {
                  const _a54 = v_P;
                  for (let _i55 = 0; _i55 < _a54.length; _i55++) {
                    const v_f = _a54[_i55];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h57) || (sp.edgeEnds[2 * v_f] === _h58)) || (sp.edgeEnds[2 * v_f + 1] === _h57)) || (sp.edgeEnds[2 * v_f + 1] === _h58)))) {
                      _q52 = false;
                      break Q53;
                    }
                  }
                }
                _c59 = _q52;
              }
              if (!(_c59)) continue;
              const _t60 = sp.adj4Edges[v_x][_i51];
              if (!(b.grid[_t60] !== 0)) { if (fire === null) { b.placeAt(_t60, 2); changed = true; } else facts.push(PLACE, _t60, 2); }
              if (!(true)) {
                _q45 = false;
                break Q46;
              }
            }
          }
        }
        if (!(_q45)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            _g61.length = 0;
            mustOverlap_st68.pass++;
            G62: {
              const _a69 = v_P;
              for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                const v_f = _a69[_i70];
                const _t71 = sp.edgeEnds[2 * v_f];
                const _t72 = sp.edgeEnds[2 * v_f + 1];
                for (let _i73 = 0; _i73 < 2; _i73++) {
                  const v_z = _i73 === 0 ? _t71 : _t72;
                  if (_i73 === 1 && (v_z === _t71)) continue;
                  const _t74 = v_z;
                  if (_g61.length < 16) { if (!_g61.includes(_t74)) _g61.push(_t74); } else addOnce(_g61, mustOverlap_st68, _t74);
                }
              }
            }
            const _says = { terms: {  }, marks: { outline: _g61.slice() } };
            if (!fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicateBinding {
  p: number;
  x: number;
  y: number;
  q: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LocalDuplicateSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const localDuplicateFacts: number[] = [];
const localDuplicate_st49 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicateBinding, LocalDuplicateSays> | null): number {
  const _g44: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a34 = sp.edges;
  R1:
  for (let _i35 = 0; _i35 < _a34.length; _i35++) {
    const v_p = _a34[_i35];
    const _m100_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h59 = sp.edgeEnds[2 * v_p];
    const _h60 = clueAt(cl.number, _h59);
    const _h61 = _h60;
    const _h64 = sp.edgeEnds[2 * v_p + 1];
    const _h65 = clueAt(cl.number, _h64);
    const _h66 = _h65;
    const _t36 = sp.edgeEnds[2 * v_p];
    const _t37 = sp.edgeEnds[2 * v_p + 1];
    for (let _i38 = 0; _i38 < 2; _i38++) {
      const v_x = _i38 === 0 ? _t36 : _t37;
      if (_i38 === 1 && (v_x === _t36)) continue;
      const _a39 = sp.adj4[v_x];
      for (let _i40 = 0; _i40 < _a39.length; _i40++) {
        const v_y = _a39[_i40];
        L41: {
          const v_q = sp.adj4Edges[v_x][_i40];
          let _c74: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c74) {
            let _q42 = true;
            Q43: {
              _g44.length = 0;
              localDuplicate_st49.pass++;
              G45: {
                const _a51 = sp.adj4[v_y];
                for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i52]] || -1) !== 2))) continue;
                  const _t53 = sp.adj4Edges[v_y][_i52];
                  const _t54 = _t53;
                  if (_g44.length < 16) { if (!_g44.includes(_t54)) _g44.push(_t54); } else addOnce(_g44, localDuplicate_st49, _t54);
                }
              }
              const _a55 = _g44;
              for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                const v_r = _a55[_i56];
                if (!((v_r !== v_q))) continue;
                const _t57 = sp.edgeEnds[2 * v_r];
                const _h58 = clueAt(cl.number, _t57);
                let _c67: boolean = (_h58 === _h61);
                if (_c67) {
                  const _t62 = sp.edgeEnds[2 * v_r + 1];
                  const _h63 = clueAt(cl.number, _t62);
                  _c67 = (_h63 === _h66);
                }
                let _c73: boolean = _c67;
                if (!_c73) {
                  const _t68 = sp.edgeEnds[2 * v_r];
                  const _h69 = clueAt(cl.number, _t68);
                  let _c72: boolean = (_h69 === _h66);
                  if (_c72) {
                    const _t70 = sp.edgeEnds[2 * v_r + 1];
                    const _h71 = clueAt(cl.number, _t70);
                    _c72 = (_h71 === _h61);
                  }
                  _c73 = _c72;
                }
                if (!(_c73)) {
                  _q42 = false;
                  break Q43;
                }
              }
            }
            _c74 = _q42;
          }
          if (!(_c74)) break L41;
          if (b.made[0] !== _m100_0) {
            if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _c99: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
            if (_c99) {
              let _q75 = true;
              Q76: {
                const _g77: number[] = [];
                G78: {
                  const _a83 = sp.adj4[v_y];
                  for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i84]] || -1) !== 2))) continue;
                    const _t85 = sp.adj4Edges[v_y][_i84];
                    if (!_g77.includes(_t85)) _g77.push(_t85);
                  }
                }
                const _a86 = _g77;
                for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                  const v_r = _a86[_i87];
                  if (!((v_r !== v_q))) continue;
                  const _t88 = sp.edgeEnds[2 * v_r];
                  const _t89 = sp.edgeEnds[2 * v_p];
                  let _c92: boolean = (clueAt(cl.number, _t88) === clueAt(cl.number, _t89));
                  if (_c92) {
                    const _t90 = sp.edgeEnds[2 * v_r + 1];
                    const _t91 = sp.edgeEnds[2 * v_p + 1];
                    _c92 = (clueAt(cl.number, _t90) === clueAt(cl.number, _t91));
                  }
                  let _c98: boolean = _c92;
                  if (!_c98) {
                    const _t93 = sp.edgeEnds[2 * v_r];
                    const _t94 = sp.edgeEnds[2 * v_p + 1];
                    let _c97: boolean = (clueAt(cl.number, _t93) === clueAt(cl.number, _t94));
                    if (_c97) {
                      const _t95 = sp.edgeEnds[2 * v_r + 1];
                      const _t96 = sp.edgeEnds[2 * v_p];
                      _c97 = (clueAt(cl.number, _t95) === clueAt(cl.number, _t96));
                    }
                    _c98 = _c97;
                  }
                  if (!(_c98)) {
                    _q75 = false;
                    break Q76;
                  }
                }
              }
              _c99 = _q75;
            }
            freshBinding("localDuplicate", [(sp.edges.includes(v_p)), !((b.grid[v_p] !== 0)), ((v_x === sp.edgeEnds[2 * v_p]) || (v_x === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x].includes(v_y)), (v_q === sp.adj4Edges[v_x][_i40]), _c99], ["p in", "where of p", "x in", "y in", "q =", "where of q"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: {  }, marks: { outline: setOf(v_y).slice() } };
              if (!fire({ p: v_p, x: v_x, y: v_y, q: v_q }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicate2Binding {
  p: number;
  x: number;
  y: number;
  q: number;
  R: readonly number[];
  d: number;
  x2: number;
  z: number;
  q2: number;
  S: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LocalDuplicate2Says {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const localDuplicate2Facts: number[] = [];
const localDuplicate2_st119 = stamps();
const localDuplicate2_st172 = stamps();
const localDuplicate2_st217 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate2(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicate2Binding, LocalDuplicate2Says> | null): number {
  const _g101: number[] = [];
  const _g114: number[] = [];
  const _g157: number[] = [];
  const _g168: number[] = [];
  const _g199: number[] = [];
  const _g212: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a93 = sp.edges;
  R1:
  for (let _i94 = 0; _i94 < _a93.length; _i94++) {
    const v_p = _a93[_i94];
    const _m300_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h151 = sp.edgeEnds[2 * v_p];
    const _h152 = sp.edgeEnds[2 * v_p + 1];
    const _t95 = sp.edgeEnds[2 * v_p];
    const _t96 = sp.edgeEnds[2 * v_p + 1];
    for (let _i97 = 0; _i97 < 2; _i97++) {
      const v_x = _i97 === 0 ? _t95 : _t96;
      if (_i97 === 1 && (v_x === _t95)) continue;
      const _a98 = sp.adj4[v_x];
      R3:
      for (let _i99 = 0; _i99 < _a98.length; _i99++) {
        const v_y = _a98[_i99];
        L100: {
          const v_q = sp.adj4Edges[v_x][_i99];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L100;
          const _h196 = sp.edgeEnds[2 * v_q];
          const _h197 = sp.edgeEnds[2 * v_q + 1];
          _g101.length = 0;
          G102: {
            _g114.length = 0;
            localDuplicate2_st119.pass++;
            G115: {
              const _a121 = sp.adj4[v_y];
              for (let _i122 = 0; _i122 < _a121.length; _i122++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i122]] || -1) !== 2))) continue;
                const _t123 = sp.adj4Edges[v_y][_i122];
                const _t124 = _t123;
                if (_g114.length < 16) { if (!_g114.includes(_t124)) _g114.push(_t124); } else addOnce(_g114, localDuplicate2_st119, _t124);
              }
            }
            const _a125 = _g114;
            for (let _i126 = 0; _i126 < _a125.length; _i126++) {
              const v_r = _a125[_i126];
              if (!((v_r !== v_q))) continue;
              _g101.push(v_r);
            }
          }
          L127: {
            const v_R = _g101;
            const _h128 = v_R.length;
            if (!((_h128 >= 1))) break L127;
            L129: {
              const v_d = (v_R[0] ?? -1);
              const _h136 = sp.edgeEnds[2 * v_d];
              const _h137 = clueAt(cl.number, _h136);
              const _h138 = _h137;
              const _h141 = sp.edgeEnds[2 * v_d + 1];
              const _h142 = clueAt(cl.number, _h141);
              const _h143 = _h142;
              let _q130 = true;
              Q131: {
                const _a132 = v_R;
                for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                  const v_r = _a132[_i133];
                  const _t134 = sp.edgeEnds[2 * v_r];
                  const _h135 = clueAt(cl.number, _t134);
                  let _c144: boolean = (_h135 === _h138);
                  if (_c144) {
                    const _t139 = sp.edgeEnds[2 * v_r + 1];
                    const _h140 = clueAt(cl.number, _t139);
                    _c144 = (_h140 === _h143);
                  }
                  let _c150: boolean = _c144;
                  if (!_c150) {
                    const _t145 = sp.edgeEnds[2 * v_r];
                    const _h146 = clueAt(cl.number, _t145);
                    let _c149: boolean = (_h146 === _h143);
                    if (_c149) {
                      const _t147 = sp.edgeEnds[2 * v_r + 1];
                      const _h148 = clueAt(cl.number, _t147);
                      _c149 = (_h148 === _h138);
                    }
                    _c150 = _c149;
                  }
                  if (!(_c150)) {
                    _q130 = false;
                    break Q131;
                  }
                }
              }
              if (!(_q130)) break L129;
              for (let _i153 = 0; _i153 < 2; _i153++) {
                const v_x2 = _i153 === 0 ? _h151 : _h152;
                if (_i153 === 1 && (v_x2 === _h151)) continue;
                const _a154 = sp.adj4[v_x2];
                for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                  const v_z = _a154[_i155];
                  L156: {
                    const v_q2 = sp.adj4Edges[v_x2][_i155];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L156;
                    _g157.length = 0;
                    G158: {
                      _g168.length = 0;
                      localDuplicate2_st172.pass++;
                      G169: {
                        const _a173 = sp.adj4[v_z];
                        for (let _i174 = 0; _i174 < _a173.length; _i174++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i174]] || -1) !== 2))) continue;
                          const _t175 = sp.adj4Edges[v_z][_i174];
                          const _t176 = _t175;
                          if (_g168.length < 16) { if (!_g168.includes(_t176)) _g168.push(_t176); } else addOnce(_g168, localDuplicate2_st172, _t176);
                        }
                      }
                      const _a177 = _g168;
                      for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                        const v_r = _a177[_i178];
                        if (!((v_r !== v_q2))) continue;
                        _g157.push(v_r);
                      }
                    }
                    L179: {
                      const v_S = _g157;
                      const _h180 = v_S.length;
                      let _c198: boolean = (_h180 >= 1);
                      if (_c198) {
                        let _q181 = true;
                        Q182: {
                          const _a183 = v_S;
                          for (let _i184 = 0; _i184 < _a183.length; _i184++) {
                            const v_r = _a183[_i184];
                            const _t185 = sp.edgeEnds[2 * v_r];
                            const _h186 = clueAt(cl.number, _t185);
                            let _c189: boolean = (_h186 === _h138);
                            if (_c189) {
                              const _t187 = sp.edgeEnds[2 * v_r + 1];
                              const _h188 = clueAt(cl.number, _t187);
                              _c189 = (_h188 === _h143);
                            }
                            let _c195: boolean = _c189;
                            if (!_c195) {
                              const _t190 = sp.edgeEnds[2 * v_r];
                              const _h191 = clueAt(cl.number, _t190);
                              let _c194: boolean = (_h191 === _h143);
                              if (_c194) {
                                const _t192 = sp.edgeEnds[2 * v_r + 1];
                                const _h193 = clueAt(cl.number, _t192);
                                _c194 = (_h193 === _h138);
                              }
                              _c195 = _c194;
                            }
                            if (!((_c195 && !(((((sp.edgeEnds[2 * v_r] === _h196) || (sp.edgeEnds[2 * v_r] === _h197)) || (sp.edgeEnds[2 * v_r + 1] === _h196)) || (sp.edgeEnds[2 * v_r + 1] === _h197)))))) {
                              _q181 = false;
                              break Q182;
                            }
                          }
                        }
                        _c198 = _q181;
                      }
                      if (!(_c198)) break L179;
                      if (b.made[0] !== _m300_0) {
                        if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
                        if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) { continue R3; }
                        _g199.length = 0;
                        G200: {
                          _g212.length = 0;
                          localDuplicate2_st217.pass++;
                          G213: {
                            const _a219 = sp.adj4[v_y];
                            for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                              if (!(((b.grid[sp.adj4Edges[v_y][_i220]] || -1) !== 2))) continue;
                              const _t221 = sp.adj4Edges[v_y][_i220];
                              const _t222 = _t221;
                              if (_g212.length < 16) { if (!_g212.includes(_t222)) _g212.push(_t222); } else addOnce(_g212, localDuplicate2_st217, _t222);
                            }
                          }
                          const _a223 = _g212;
                          for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                            const v_r = _a223[_i224];
                            if (!((v_r !== v_q))) continue;
                            _g199.push(v_r);
                          }
                        }
                        if (!(sameSet(v_R, _g199))) { continue R3; }
                      }
                      if (DEV && staleChecking) {
                        const _g225: number[] = [];
                        G226: {
                          const _g238: number[] = [];
                          G239: {
                            const _a244 = sp.adj4[v_y];
                            for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                              if (!(((b.grid[sp.adj4Edges[v_y][_i245]] || -1) !== 2))) continue;
                              const _t246 = sp.adj4Edges[v_y][_i245];
                              if (!_g238.includes(_t246)) _g238.push(_t246);
                            }
                          }
                          const _a247 = _g238;
                          for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                            const v_r = _a247[_i248];
                            if (!((v_r !== v_q))) continue;
                            _g225.push(v_r);
                          }
                        }
                        let _q249 = true;
                        Q250: {
                          const _a251 = v_R;
                          for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                            const v_r = _a251[_i252];
                            const _t253 = sp.edgeEnds[2 * v_r];
                            const _t254 = sp.edgeEnds[2 * v_d];
                            let _c257: boolean = (clueAt(cl.number, _t253) === clueAt(cl.number, _t254));
                            if (_c257) {
                              const _t255 = sp.edgeEnds[2 * v_r + 1];
                              const _t256 = sp.edgeEnds[2 * v_d + 1];
                              _c257 = (clueAt(cl.number, _t255) === clueAt(cl.number, _t256));
                            }
                            let _c263: boolean = _c257;
                            if (!_c263) {
                              const _t258 = sp.edgeEnds[2 * v_r];
                              const _t259 = sp.edgeEnds[2 * v_d + 1];
                              let _c262: boolean = (clueAt(cl.number, _t258) === clueAt(cl.number, _t259));
                              if (_c262) {
                                const _t260 = sp.edgeEnds[2 * v_r + 1];
                                const _t261 = sp.edgeEnds[2 * v_d];
                                _c262 = (clueAt(cl.number, _t260) === clueAt(cl.number, _t261));
                              }
                              _c263 = _c262;
                            }
                            if (!(_c263)) {
                              _q249 = false;
                              break Q250;
                            }
                          }
                        }
                        const _g264: number[] = [];
                        G265: {
                          const _g275: number[] = [];
                          G276: {
                            const _a279 = sp.adj4[v_z];
                            for (let _i280 = 0; _i280 < _a279.length; _i280++) {
                              if (!(((b.grid[sp.adj4Edges[v_z][_i280]] || -1) !== 2))) continue;
                              const _t281 = sp.adj4Edges[v_z][_i280];
                              if (!_g275.includes(_t281)) _g275.push(_t281);
                            }
                          }
                          const _a282 = _g275;
                          for (let _i283 = 0; _i283 < _a282.length; _i283++) {
                            const v_r = _a282[_i283];
                            if (!((v_r !== v_q2))) continue;
                            _g264.push(v_r);
                          }
                        }
                        let _c299: boolean = (v_S.length >= 1);
                        if (_c299) {
                          let _q284 = true;
                          Q285: {
                            const _a286 = v_S;
                            for (let _i287 = 0; _i287 < _a286.length; _i287++) {
                              const v_r = _a286[_i287];
                              const _t288 = sp.edgeEnds[2 * v_r];
                              const _t289 = sp.edgeEnds[2 * v_d];
                              let _c292: boolean = (clueAt(cl.number, _t288) === clueAt(cl.number, _t289));
                              if (_c292) {
                                const _t290 = sp.edgeEnds[2 * v_r + 1];
                                const _t291 = sp.edgeEnds[2 * v_d + 1];
                                _c292 = (clueAt(cl.number, _t290) === clueAt(cl.number, _t291));
                              }
                              let _c298: boolean = _c292;
                              if (!_c298) {
                                const _t293 = sp.edgeEnds[2 * v_r];
                                const _t294 = sp.edgeEnds[2 * v_d + 1];
                                let _c297: boolean = (clueAt(cl.number, _t293) === clueAt(cl.number, _t294));
                                if (_c297) {
                                  const _t295 = sp.edgeEnds[2 * v_r + 1];
                                  const _t296 = sp.edgeEnds[2 * v_d];
                                  _c297 = (clueAt(cl.number, _t295) === clueAt(cl.number, _t296));
                                }
                                _c298 = _c297;
                              }
                              if (!((_c298 && !(((((sp.edgeEnds[2 * v_r] === sp.edgeEnds[2 * v_q]) || (sp.edgeEnds[2 * v_r] === sp.edgeEnds[2 * v_q + 1])) || (sp.edgeEnds[2 * v_r + 1] === sp.edgeEnds[2 * v_q])) || (sp.edgeEnds[2 * v_r + 1] === sp.edgeEnds[2 * v_q + 1])))))) {
                                _q284 = false;
                                break Q285;
                              }
                            }
                          }
                          _c299 = _q284;
                        }
                        freshBinding("localDuplicate2", [(sp.edges.includes(v_p)), !((b.grid[v_p] !== 0)), ((v_x === sp.edgeEnds[2 * v_p]) || (v_x === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x].includes(v_y)), (v_q === sp.adj4Edges[v_x][_i99]), ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)), sameSet(v_R, _g225), (v_R.length >= 1), (v_d === (v_R[0] ?? -1)), _q249, ((v_x2 === sp.edgeEnds[2 * v_p]) || (v_x2 === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x2].includes(v_z)), (v_q2 === sp.adj4Edges[v_x2][_i155]), (((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)), sameSet(v_S, _g264), _c299], ["p in", "where of p", "x in", "y in", "q =", "where of q", "R =", "where of R", "d =", "where of d", "x2 in", "z in", "q2 =", "where of q2", "S =", "where of S"]);
                      }
                      facts.length = 0;
                      changed = false;
                      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                      if (!(true)) return -1;
                      if (changed || facts.length > 0) {
                        fired = 1;
                        if (fire !== null) {
                          const _says = { terms: {  }, marks: { outline: setOf(v_y, v_z).slice() } };
                          if (!fire({ p: v_p, x: v_x, y: v_y, q: v_q, R: v_R.slice(), d: v_d, x2: v_x2, z: v_z, q2: v_q2, S: v_S.slice() }, facts, _says)) return 1;
                        }
                      }
                    }
                  }
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

export interface ParityBinding {
  P: readonly number[];
  p: number;
  Q: readonly number[];
  A: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ParitySays {
  terms: {  };
  marks: {  };
}

const parityFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function parity(b: Marks, sp: GridSpace, fire: Fire<ParityBinding, ParitySays> | null): number {
  const _g17: number[] = [];
  const _g40: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _m59_0 = b.made[0];
  _g17.length = 0;
  G18: {
    const _a21 = sp.edges;
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_e = _a21[_i22];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g17.push(v_e);
    }
  }
  const v_P = _g17;
  const _a23 = sp.edges;
  for (let _i24 = 0; _i24 < _a23.length; _i24++) {
    const v_p = _a23[_i24];
    const _h29 = sp.edgeEnds[2 * v_p + 1];
    const _h33 = sp.edgeEnds[2 * v_p];
    let _c35: boolean = !((b.grid[v_p] !== 0));
    if (_c35) {
      let _q25 = false;
      Q26: {
        const _a27 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_x = _a27[_i28];
          const _h32 = (v_x !== _h29);
          const _h34 = sp.edgeOf(_h33, v_x);
          const _a30 = sp.adj4[_h29];
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_y = _a30[_i31];
            if (!(((_h32 && (v_y !== _h33)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h34] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h29][_i31]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q25 = true;
              break Q26;
            }
          }
        }
      }
      _c35 = !(_q25);
    }
    if (!(_c35)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg36 = edgeGroups(sp, v_Q);
    const _h39 = _eg36.of(sp.edgeEnds[2 * v_p + 1]).length;
    L37: {
      const v_A = _eg36.of(sp.edgeEnds[2 * v_p]);
      const _h38 = v_A.length;
      if (!(((!(_eg36.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h38 % 2) === 0)) && ((_h39 % 2) === 0)))) break L37;
      if (b.made[0] !== _m59_0) {
        _g40.length = 0;
        G41: {
          const _a44 = sp.edges;
          for (let _i45 = 0; _i45 < _a44.length; _i45++) {
            const v_e = _a44[_i45];
            if (!(((b.grid[v_e] || -1) !== 2))) continue;
            _g40.push(v_e);
          }
        }
        if (!(sameSet(v_P, _g40))) { return fired; }
      }
      if (DEV && staleChecking) {
        const _g46: number[] = [];
        G47: {
          const _a50 = sp.edges;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_e = _a50[_i51];
            if (!(((b.grid[v_e] || -1) !== 2))) continue;
            _g46.push(v_e);
          }
        }
        let _c58: boolean = !((b.grid[v_p] !== 0));
        if (_c58) {
          let _q52 = false;
          Q53: {
            const _a54 = sp.adj4[sp.edgeEnds[2 * v_p]];
            for (let _i55 = 0; _i55 < _a54.length; _i55++) {
              const v_x = _a54[_i55];
              const _a56 = sp.adj4[sp.edgeEnds[2 * v_p + 1]];
              for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                const v_y = _a56[_i57];
                if (!((((v_x !== sp.edgeEnds[2 * v_p + 1]) && (v_y !== sp.edgeEnds[2 * v_p])) && (sp.adj4[v_x].includes(v_y))))) continue;
                if (((((b.grid[sp.adj4Edges[sp.edgeEnds[2 * v_p]][_i55]] || -1) !== 2) && ((b.grid[sp.adj4Edges[sp.edgeEnds[2 * v_p + 1]][_i57]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
                  _q52 = true;
                  break Q53;
                }
              }
            }
          }
          _c58 = !(_q52);
        }
        freshBinding("parity", [sameSet(v_P, _g46), (sp.edges.includes(v_p)), _c58, sameSet(v_Q, minus(v_P, setOf(v_p))), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_p], v_Q)), ((!(_eg36.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((v_A.length % 2) === 0)) && ((through(sp, sp.edgeEnds[2 * v_p + 1], v_Q).length % 2) === 0))], ["P =", "p in", "where of p", "Q =", "A =", "where of A"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: {  }, marks: {  } };
          if (!fire({ P: v_P.slice(), p: v_p, Q: v_Q.slice(), A: v_A.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SetBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SetSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const setFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function set(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetBinding, SetSays> | null): number {
  const _g43: number[] = [];
  const _g60: number[] = [];
  const _g89: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _k40 = showingKept.board(cl);
  const _t39 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t39; v_a++) {
    L41: {
      const v_S = (_k40[v_a] ?? showing(sp, cl, v_a));
      const _h42 = v_S.length;
      if (!((_h42 <= 16))) break L41;
      const _h62 = (_h42 - 2);
      const _m143_0 = b.made[0];
      _g43.length = 0;
      G44: {
        const _a51 = v_S;
        for (let _i52 = 0; _i52 < _a51.length; _i52++) {
          const v_c = _a51[_i52];
          let _q53 = false;
          Q54: {
            const _a55 = sp.adj4[v_c];
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              if (((b.grid[sp.adj4Edges[v_c][_i56]] || -1) === 1)) {
                _q53 = true;
                break Q54;
              }
            }
          }
          if (!(!(_q53))) continue;
          _g43.push(v_c);
        }
      }
      const v_U = _g43;
      const _e57 = v_U;
      const _pm69: number[] = [];
      let _pp70 = -1;
      for (let _k58 = 0; _k58 < 1 << _e57.length; _k58++) {
        if (!(popcount(_k58) >= 2)) continue;
        const v_T = _g60;
        v_T.length = 0;
        for (let _j59 = 0; _j59 < _e57.length; _j59++) if ((_k58 >> (_e57.length - 1 - _j59)) & 1) v_T.push(_e57[_j59]);
        const _h61 = v_T.length;
        if (!(((_h61 >= 2) && (_h61 <= _h62)))) continue;
        let _g63 = 0;
        if (_pp70 !== b.placed) {
          _pp70 = b.placed;
          for (let _j71 = 0; _j71 < _e57.length; _j71++) {
            const v_m72 = _e57[_j71];
            let _g73 = 0;
            G74: {
              const _a77 = sp.adj4[v_m72];
              for (let _i78 = 0; _i78 < _a77.length; _i78++) {
                const v_y = _a77[_i78];
                if (!(((b.grid[sp.adj4Edges[v_m72][_i78]] || -1) !== 2))) continue;
                const _t79 = clueAt(cl.number, v_y);
                _g73 |= 1 << _t79;
              }
            }
            _pm69[_j71] = _g73;
          }
        }
        for (let _j71 = 0; _j71 < _e57.length; _j71++) if ((_k58 >> (_e57.length - 1 - _j71)) & 1) _g63 |= _pm69[_j71];
        L80: {
          const v_O = _g63;
          const _h81 = popcount(v_O);
          let _c88: boolean = (_h81 === _h61);
          if (_c88) {
            let _q82 = false;
            Q83: {
              const _a84 = v_T;
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                const v_x = _a84[_i85];
                const _a86 = sp.adj4[v_x];
                for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                  const v_y = _a86[_i87];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i87]] || -1) !== 2)) {
                    _q82 = true;
                    break Q83;
                  }
                }
              }
            }
            _c88 = !(_q82);
          }
          if (!(_c88)) break L80;
          if (b.made[0] !== _m143_0) {
            _g89.length = 0;
            G90: {
              const _a97 = v_S;
              for (let _i98 = 0; _i98 < _a97.length; _i98++) {
                const v_c = _a97[_i98];
                let _q99 = false;
                Q100: {
                  const _a101 = sp.adj4[v_c];
                  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i102]] || -1) === 1)) {
                      _q99 = true;
                      break Q100;
                    }
                  }
                }
                if (!(!(_q99))) continue;
                _g89.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g89))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _g103: number[] = [];
            G104: {
              const _a111 = v_S;
              for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                const v_c = _a111[_i112];
                let _q113 = false;
                Q114: {
                  const _a115 = sp.adj4[v_c];
                  for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i116]] || -1) === 1)) {
                      _q113 = true;
                      break Q114;
                    }
                  }
                }
                if (!(!(_q113))) continue;
                _g103.push(v_c);
              }
            }
            let _g117 = 0;
            G118: {
              const _a123 = v_T;
              for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                const v_x = _a123[_i124];
                const _a125 = sp.adj4[v_x];
                for (let _i126 = 0; _i126 < _a125.length; _i126++) {
                  const v_y = _a125[_i126];
                  if (!(((b.grid[sp.adj4Edges[v_x][_i126]] || -1) !== 2))) continue;
                  const _t127 = clueAt(cl.number, v_y);
                  _g117 |= 1 << _t127;
                }
              }
            }
            let _c134: boolean = (popcount(v_O) === v_T.length);
            if (_c134) {
              let _q128 = false;
              Q129: {
                const _a130 = v_T;
                for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                  const v_x = _a130[_i131];
                  const _a132 = sp.adj4[v_x];
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_y = _a132[_i133];
                    if (!((v_T.includes(v_y)))) continue;
                    if (((b.grid[sp.adj4Edges[v_x][_i133]] || -1) !== 2)) {
                      _q128 = true;
                      break Q129;
                    }
                  }
                }
              }
              _c134 = !(_q128);
            }
            freshBinding("set", [((0 <= v_a) && (v_a <= cl.n)), sameSet(v_S, showing(sp, cl, v_a)), (v_S.length <= 16), sameSet(v_U, _g103), ((v_T.length >= 2) && (v_T.length <= (v_S.length - 2))), (v_O === _g117), _c134], ["a in", "S =", "where of S", "U =", "where of T", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q135 = true;
          Q136: {
            const _a137 = v_S;
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_x = _a137[_i138];
              const _a139 = sp.adj4[v_x];
              for (let _i140 = 0; _i140 < _a139.length; _i140++) {
                const v_y = _a139[_i140];
                const _h142 = clueAt(cl.number, v_y);
                L141: {
                  const v_f = sp.adj4Edges[v_x][_i140];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h142) & 1) !== 0)))) break L141;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q135 = false;
                    break Q136;
                  }
                }
              }
            }
          }
          if (!(_q135)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: {  }, marks: { outline: v_T.slice() } };
              if (!fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface SetDoublesBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SetDoublesSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const setDoublesFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function setDoubles(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetDoublesBinding, SetDoublesSays> | null): number {
  const _g43: number[] = [];
  const _g60: number[] = [];
  const _g89: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _k40 = showingKept.board(cl);
  const _t39 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t39; v_a++) {
    L41: {
      const v_S = (_k40[v_a] ?? showing(sp, cl, v_a));
      const _h42 = v_S.length;
      if (!((_h42 <= 16))) break L41;
      const _h81 = (_h42 - 2);
      const _m157_0 = b.made[0];
      _g43.length = 0;
      G44: {
        const _a51 = v_S;
        for (let _i52 = 0; _i52 < _a51.length; _i52++) {
          const v_c = _a51[_i52];
          let _q53 = false;
          Q54: {
            const _a55 = sp.adj4[v_c];
            for (let _i56 = 0; _i56 < _a55.length; _i56++) {
              if (((b.grid[sp.adj4Edges[v_c][_i56]] || -1) === 1)) {
                _q53 = true;
                break Q54;
              }
            }
          }
          if (!(!(_q53))) continue;
          _g43.push(v_c);
        }
      }
      const v_U = _g43;
      const _e57 = v_U;
      const _pm68: number[] = [];
      let _pp69 = -1;
      for (let _k58 = 0; _k58 < 1 << _e57.length; _k58++) {
        if (!(popcount(_k58) >= 3)) continue;
        const v_T = _g60;
        v_T.length = 0;
        for (let _j59 = 0; _j59 < _e57.length; _j59++) if ((_k58 >> (_e57.length - 1 - _j59)) & 1) v_T.push(_e57[_j59]);
        const _h61 = v_T.length;
        if (!((_h61 >= 3))) continue;
        let _g62 = 0;
        if (_pp69 !== b.placed) {
          _pp69 = b.placed;
          for (let _j70 = 0; _j70 < _e57.length; _j70++) {
            const v_m71 = _e57[_j70];
            let _g72 = 0;
            G73: {
              const _a76 = sp.adj4[v_m71];
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_y = _a76[_i77];
                if (!(((b.grid[sp.adj4Edges[v_m71][_i77]] || -1) !== 2))) continue;
                const _t78 = clueAt(cl.number, v_y);
                _g72 |= 1 << _t78;
              }
            }
            _pm68[_j70] = _g72;
          }
        }
        for (let _j70 = 0; _j70 < _e57.length; _j70++) if ((_k58 >> (_e57.length - 1 - _j70)) & 1) _g62 |= _pm68[_j70];
        L79: {
          const v_O = _g62;
          const _h80 = popcount(v_O);
          let _c88: boolean = (((2 <= _h80) && (_h80 <= _h81)) && ((_h80 === _h61) || (_h80 === (_h61 - 1))));
          if (_c88) {
            let _q82 = false;
            Q83: {
              const _a84 = v_T;
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                const v_x = _a84[_i85];
                const _a86 = sp.adj4[v_x];
                for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                  const v_y = _a86[_i87];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i87]] || -1) !== 2)) {
                    _q82 = true;
                    break Q83;
                  }
                }
              }
            }
            _c88 = _q82;
          }
          if (!(_c88)) break L79;
          const _h143 = (_h80 < _h61);
          if (b.made[0] !== _m157_0) {
            _g89.length = 0;
            G90: {
              const _a97 = v_S;
              for (let _i98 = 0; _i98 < _a97.length; _i98++) {
                const v_c = _a97[_i98];
                let _q99 = false;
                Q100: {
                  const _a101 = sp.adj4[v_c];
                  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i102]] || -1) === 1)) {
                      _q99 = true;
                      break Q100;
                    }
                  }
                }
                if (!(!(_q99))) continue;
                _g89.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g89))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _g103: number[] = [];
            G104: {
              const _a111 = v_S;
              for (let _i112 = 0; _i112 < _a111.length; _i112++) {
                const v_c = _a111[_i112];
                let _q113 = false;
                Q114: {
                  const _a115 = sp.adj4[v_c];
                  for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i116]] || -1) === 1)) {
                      _q113 = true;
                      break Q114;
                    }
                  }
                }
                if (!(!(_q113))) continue;
                _g103.push(v_c);
              }
            }
            let _g117 = 0;
            G118: {
              const _a123 = v_T;
              for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                const v_x = _a123[_i124];
                const _a125 = sp.adj4[v_x];
                for (let _i126 = 0; _i126 < _a125.length; _i126++) {
                  const v_y = _a125[_i126];
                  if (!(((b.grid[sp.adj4Edges[v_x][_i126]] || -1) !== 2))) continue;
                  const _t127 = clueAt(cl.number, v_y);
                  _g117 |= 1 << _t127;
                }
              }
            }
            let _c134: boolean = (((2 <= popcount(v_O)) && (popcount(v_O) <= (v_S.length - 2))) && ((popcount(v_O) === v_T.length) || (popcount(v_O) === (v_T.length - 1))));
            if (_c134) {
              let _q128 = false;
              Q129: {
                const _a130 = v_T;
                for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                  const v_x = _a130[_i131];
                  const _a132 = sp.adj4[v_x];
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_y = _a132[_i133];
                    if (!((v_T.includes(v_y)))) continue;
                    if (((b.grid[sp.adj4Edges[v_x][_i133]] || -1) !== 2)) {
                      _q128 = true;
                      break Q129;
                    }
                  }
                }
              }
              _c134 = _q128;
            }
            freshBinding("setDoubles", [((0 <= v_a) && (v_a <= cl.n)), sameSet(v_S, showing(sp, cl, v_a)), (v_S.length <= 16), sameSet(v_U, _g103), (v_T.length >= 3), (v_O === _g117), _c134], ["a in", "S =", "where of S", "U =", "where of T", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q135 = true;
          Q136: {
            const _a137 = v_S;
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_x = _a137[_i138];
              const _a139 = sp.adj4[v_x];
              for (let _i140 = 0; _i140 < _a139.length; _i140++) {
                const v_y = _a139[_i140];
                const _h142 = clueAt(cl.number, v_y);
                L141: {
                  const v_f = sp.adj4Edges[v_x][_i140];
                  let _c156: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h142) & 1) !== 0));
                  if (_c156) {
                    let _c149: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c149) {
                      let _c148: boolean = _h143;
                      if (!_c148) {
                        const _t144 = sp.edgeEnds[2 * v_f];
                        const _h145 = clueAt(cl.number, _t144);
                        const _t146 = sp.edgeEnds[2 * v_f + 1];
                        const _h147 = clueAt(cl.number, _t146);
                        _c148 = (_h145 === _h147);
                      }
                      _c149 = _c148;
                    }
                    let _c155: boolean = _c149;
                    if (!_c155) {
                      let _c154: boolean = _h143;
                      if (_c154) {
                        const _t150 = sp.edgeEnds[2 * v_f];
                        const _h151 = clueAt(cl.number, _t150);
                        const _t152 = sp.edgeEnds[2 * v_f + 1];
                        const _h153 = clueAt(cl.number, _t152);
                        _c154 = (_h151 === _h153);
                      }
                      _c155 = (_c154 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c156 = _c155;
                  }
                  if (!(_c156)) break L141;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q135 = false;
                    break Q136;
                  }
                }
              }
            }
          }
          if (!(_q135)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: {  }, marks: { outline: v_T.slice() } };
              if (!fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const showingKept = keptStore<readonly number[]>();
let showingOn: object | null = null;
let showingAt: Kept<readonly number[]> = [];

/** `showing(a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function showing(_sp: GridSpace, cl: Dealt, v_a: number): readonly number[] {
  if (cl !== showingOn) {
    showingAt = showingKept.board(cl);
    showingOn = cl;
  }
  const _kept: Kept<readonly number[]> = showingAt;
  if (_kept[v_a] !== undefined) return _kept[v_a];
  const _g1: number[] = [];
  G2: {
    const _a5 = cluesValued(cl.number, v_a);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_c = _a5[_i6];
      if (!((clueAt(cl.number, v_c) === v_a))) continue;
      _g1.push(v_c);
    }
  }
  const _made = _g1;
  _kept[v_a] = _made;
  return _made;
}
