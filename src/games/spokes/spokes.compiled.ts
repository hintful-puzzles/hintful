// Compiled by `npm run describe` from src/games/spokes/spokes.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, edgeGroups, freshBinding, keptStore, rangeMask, sameSet, setOf, staleChecking, stamps, throughWhere, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  block: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** A diagonal neighbor is across an edge too: the engine builds the
 * space's edges by it. */
export const edgeGeometry = "king";

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "saturation" | "twoOnes" | "exhaustion" | "lineBreaks" | "spareBreaks";

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
  { id: "saturation", tier: 0 },
  { id: "twoOnes", tier: 0 },
  { id: "exhaustion", tier: 0 },
  { id: "lineBreaks", tier: 1 },
  { id: "spareBreaks", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g18: number[] = [];
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
      const _h5 = clueAt(cl.number, v_c);
      if (!(!((_h5 !== -1)))) continue;
      let _g6 = 0;
      G7: {
        const _a8 = sp.adj8[v_c];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const _h10 = (g[sp.adj8Edges[v_c][_i9]] || -1);
          if (!((_h10 === 1))) continue;
          _g6++;
        }
      }
      if (!((_g6 === 0))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q11 = true;
  Q12: {
    const _a13 = sp.edges;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_e = _a13[_i14];
      if (!((sp.crossing[v_e] !== -1))) continue;
      const _h15 = (g[v_e] || -1);
      if (!(((_h15 === 2) || ((g[sp.crossing[v_e]] || -1) === 2)))) {
        _q11 = false;
        break Q12;
      }
    }
  }
  if (!(_q11)) return false;
  let _q16 = true;
  Q17: {
    _g18.length = 0;
    G19: {
      const _a22 = sp.edges;
      for (let _i23 = 0; _i23 < _a22.length; _i23++) {
        const v_e = _a22[_i23];
        const _h24 = (g[v_e] || -1);
        if (!((_h24 === 1))) continue;
        _g18.push(v_e);
      }
    }
    const v_L = _g18;
    const _eg31 = edgeGroups(sp, v_L);
    const _a25 = sp.cells;
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_a = _a25[_i26];
      const _h27 = clueAt(cl.number, v_a);
      if (!((_h27 !== -1))) continue;
      const _a28 = sp.cells;
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_b = _a28[_i29];
        const _h30 = clueAt(cl.number, v_b);
        if (!((_h30 !== -1))) continue;
        if (!((_eg31.of(v_b) === _eg31.of(v_a)))) {
          _q16 = false;
          break Q17;
        }
      }
    }
  }
  if (!(_q16)) return false;
  for (let _k32 = 0; _k32 < cl.number.at.length; _k32++) {
    const _at33 = cl.number.at[_k32];
    let _g35 = 0;
    G36: {
      const _a37 = sp.adj8[_at33];
      for (let _i38 = 0; _i38 < _a37.length; _i38++) {
        const _h39 = (g[sp.adj8Edges[_at33][_i38]] || -1);
        if (!((_h39 === 1))) continue;
        _g35++;
      }
    }
    if (!((_g35 === clueAt(cl.number, _at33)))) return false;
  }
  for (let _k40 = 0; _k40 < cl.block.at.length; _k40++) {
    const _at41 = cl.block.at[_k40];
    let _q43 = true;
    Q44: {
      const _a45 = sp.adj4[_at41];
      for (let _i46 = 0; _i46 < _a45.length; _i46++) {
        const v_a = _a45[_i46];
        const _a47 = sp.adj4[_at41];
        for (let _i48 = 0; _i48 < _a47.length; _i48++) {
          const v_b = _a47[_i48];
          if (!((sp.edgeOf(v_a, v_b) !== -1))) continue;
          const _h49 = (g[sp.edgeOf(v_a, v_b)] || -1);
          if (!((_h49 === 2))) {
            _q43 = false;
            break Q44;
          }
        }
      }
    }
    if (!(_q43)) return false;
  }
  return true;
}

export interface SaturationBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const saturationFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function saturation(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SaturationBinding> | null): number {
  const facts = saturationFacts;
  let fired = 0;
  let changed = false;
  const _k10 = takesKept.board(cl);
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    let _g11 = 0;
    G12: {
      const _a13 = sp.adj8[v_c];
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        if (!(((b.grid[sp.adj8Edges[v_c][_i14]] || -1) === 1))) continue;
        _g11++;
      }
    }
    const v_n = ((_k10[v_c] ?? takes(sp, cl, v_c)) - _g11);
    L15: {
      const v_U = ways(b, sp, cl, v_c);
      const _h16 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h16 <= v_n))))) break L15;
      if (DEV && staleChecking) {
        let _g17 = 0;
        G18: {
          const _a19 = sp.adj8[v_c];
          for (let _i20 = 0; _i20 < _a19.length; _i20++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i20]] || -1) === 1))) continue;
            _g17++;
          }
        }
        freshBinding("saturation", [(sp.cells.includes(v_c)), (v_n === (takes(sp, cl, v_c) - _g17)), sameSet(v_U, ways(b, sp, cl, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c26: boolean = ((v_n >= 0) && (_h16 === v_n));
      if (_c26) {
        let _q21 = true;
        Q22: {
          const _a23 = v_U;
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_y = _a23[_i24];
            const _t25 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t25] !== 0)) { if (fire === null) { b.placeAt(_t25, 1); changed = true; } else facts.push(PLACE, _t25, 1); }
            if (!(true)) {
              _q21 = false;
              break Q22;
            }
          }
        }
        _c26 = _q21;
      }
      if (!(_c26)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TwoOnesBinding {
  N: number;
  e: number;
  a: number;
  b: number;
}

const twoOnesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function twoOnes(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoOnesBinding> | null): number {
  const facts = twoOnesFacts;
  let fired = 0;
  let changed = false;
  const _k31 = takesKept.board(cl);
  let _g22 = 0;
  G23: {
    const _a24 = sp.cells;
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_y = _a24[_i25];
      const _h26 = clueAt(cl.number, v_y);
      if (!((_h26 !== -1))) continue;
      _g22++;
    }
  }
  L27: {
    const v_N = _g22;
    if (!((v_N > 2))) break L27;
    const _a28 = sp.edges;
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_e = _a28[_i29];
      const v_a = sp.edgeEnds[2 * v_e];
      L30: {
        const v_b = sp.edgeEnds[2 * v_e + 1];
        let _c44: boolean = (((_k31[v_a] ?? takes(sp, cl, v_a)) === 1) && ((_k31[v_b] ?? takes(sp, cl, v_b)) === 1));
        if (_c44) {
          let _c36: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
          if (_c36) {
            let _g32 = 0;
            G33: {
              const _a34 = sp.adj8[v_a];
              for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                if (!(((b.grid[sp.adj8Edges[v_a][_i35]] || -1) === 1))) continue;
                _g32++;
              }
            }
            _c36 = (_g32 < (_k31[v_a] ?? takes(sp, cl, v_a)));
          }
          let _c41: boolean = _c36;
          if (_c41) {
            let _g37 = 0;
            G38: {
              const _a39 = sp.adj8[v_b];
              for (let _i40 = 0; _i40 < _a39.length; _i40++) {
                if (!(((b.grid[sp.adj8Edges[v_b][_i40]] || -1) === 1))) continue;
                _g37++;
              }
            }
            _c41 = (_g37 < (_k31[v_b] ?? takes(sp, cl, v_b)));
          }
          let _c43: boolean = _c41;
          if (_c43) {
            const _t42 = sp.edgeOf(v_a, v_b);
            _c43 = !(((sp.crossing[_t42] !== -1) && ((b.grid[sp.crossing[_t42]] || -1) === 1)));
          }
          _c44 = _c43;
        }
        if (!(_c44)) break L30;
        if (DEV && staleChecking) {
          let _g45 = 0;
          G46: {
            const _a47 = sp.cells;
            for (let _i48 = 0; _i48 < _a47.length; _i48++) {
              const v_y = _a47[_i48];
              if (!((clueAt(cl.number, v_y) !== -1))) continue;
              _g45++;
            }
          }
          let _c61: boolean = ((takes(sp, cl, v_a) === 1) && (takes(sp, cl, v_b) === 1));
          if (_c61) {
            let _c53: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
            if (_c53) {
              let _g49 = 0;
              G50: {
                const _a51 = sp.adj8[v_a];
                for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                  if (!(((b.grid[sp.adj8Edges[v_a][_i52]] || -1) === 1))) continue;
                  _g49++;
                }
              }
              _c53 = (_g49 < takes(sp, cl, v_a));
            }
            let _c58: boolean = _c53;
            if (_c58) {
              let _g54 = 0;
              G55: {
                const _a56 = sp.adj8[v_b];
                for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                  if (!(((b.grid[sp.adj8Edges[v_b][_i57]] || -1) === 1))) continue;
                  _g54++;
                }
              }
              _c58 = (_g54 < takes(sp, cl, v_b));
            }
            let _c60: boolean = _c58;
            if (_c60) {
              const _t59 = sp.edgeOf(v_a, v_b);
              _c60 = !(((sp.crossing[_t59] !== -1) && ((b.grid[sp.crossing[_t59]] || -1) === 1)));
            }
            _c61 = _c60;
          }
          freshBinding("twoOnes", [(v_N === _g45), (v_N > 2), (sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), _c61], ["N =", "where of N", "e in", "a =", "b =", "where of b"]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ N: v_N, e: v_e, a: v_a, b: v_b }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ExhaustionBinding {
  c: number;
  U: readonly number[];
}

const exhaustionFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function exhaustion(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExhaustionBinding> | null): number {
  const _g40: number[] = [];
  const facts = exhaustionFacts;
  let fired = 0;
  let changed = false;
  const _k38 = takesKept.board(cl);
  const _a31 = sp.cells;
  for (let _i32 = 0; _i32 < _a31.length; _i32++) {
    const v_c = _a31[_i32];
    const _h33 = clueAt(cl.number, v_c);
    let _c39: boolean = (_h33 !== -1);
    if (_c39) {
      let _g34 = 0;
      G35: {
        const _a36 = sp.adj8[v_c];
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i37]] || -1) === 1))) continue;
          _g34++;
        }
      }
      _c39 = (_g34 === (_k38[v_c] ?? takes(sp, cl, v_c)));
    }
    if (!(_c39)) continue;
    _g40.length = 0;
    G41: {
      const _a52 = sp.adj8[v_c];
      for (let _i53 = 0; _i53 < _a52.length; _i53++) {
        const v_y = _a52[_i53];
        let _c59: boolean = !((b.grid[sp.adj8Edges[v_c][_i53]] !== 0));
        if (_c59) {
          let _g54 = 0;
          G55: {
            const _a57 = sp.adj8[v_y];
            for (let _i58 = 0; _i58 < _a57.length; _i58++) {
              if (!(((b.grid[sp.adj8Edges[v_y][_i58]] || -1) === 1))) continue;
              _g54++;
            }
          }
          _c59 = (_g54 < (_k38[v_y] ?? takes(sp, cl, v_y)));
        }
        let _c61: boolean = _c59;
        if (_c61) {
          const _t60 = sp.adj8Edges[v_c][_i53];
          _c61 = !(((sp.crossing[_t60] !== -1) && ((b.grid[sp.crossing[_t60]] || -1) === 1)));
        }
        if (!(_c61)) continue;
        _g40.push(v_y);
      }
    }
    L62: {
      const v_U = _g40;
      const _h63 = v_U.length;
      if (!((_h63 > 0))) break L62;
      if (DEV && staleChecking) {
        let _c68: boolean = (clueAt(cl.number, v_c) !== -1);
        if (_c68) {
          let _g64 = 0;
          G65: {
            const _a66 = sp.adj8[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              if (!(((b.grid[sp.adj8Edges[v_c][_i67]] || -1) === 1))) continue;
              _g64++;
            }
          }
          _c68 = (_g64 === takes(sp, cl, v_c));
        }
        const _g69: number[] = [];
        G70: {
          const _a81 = sp.adj8[v_c];
          for (let _i82 = 0; _i82 < _a81.length; _i82++) {
            const v_y = _a81[_i82];
            let _c88: boolean = !((b.grid[sp.adj8Edges[v_c][_i82]] !== 0));
            if (_c88) {
              let _g83 = 0;
              G84: {
                const _a86 = sp.adj8[v_y];
                for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                  if (!(((b.grid[sp.adj8Edges[v_y][_i87]] || -1) === 1))) continue;
                  _g83++;
                }
              }
              _c88 = (_g83 < takes(sp, cl, v_y));
            }
            let _c90: boolean = _c88;
            if (_c90) {
              const _t89 = sp.adj8Edges[v_c][_i82];
              _c90 = !(((sp.crossing[_t89] !== -1) && ((b.grid[sp.crossing[_t89]] || -1) === 1)));
            }
            if (!(_c90)) continue;
            _g69.push(v_y);
          }
        }
        freshBinding("exhaustion", [(sp.cells.includes(v_c)), _c68, sameSet(v_U, _g69), (v_U.length > 0)], ["c in", "where of c", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _q91 = true;
      Q92: {
        const _a93 = v_U;
        for (let _i94 = 0; _i94 < _a93.length; _i94++) {
          const v_y = _a93[_i94];
          const _t95 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t95] !== 0)) { if (fire === null) { b.placeAt(_t95, 2); changed = true; } else facts.push(PLACE, _t95, 2); }
          if (!(true)) {
            _q91 = false;
            break Q92;
          }
        }
      }
      if (!(_q91)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, U: v_U.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LineBreaksBinding {
  e: number;
  a: number;
  b: number;
  H: readonly number[];
}

const lineBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k177 = takesKept.board(cl);
  const _a170 = sp.edges;
  for (let _i171 = 0; _i171 < _a170.length; _i171++) {
    const v_e = _a170[_i171];
    const v_a = sp.edgeEnds[2 * v_e];
    const v_b = sp.edgeEnds[2 * v_e + 1];
    L172: {
      const v_H = setOf(v_e);
      let _c178: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c178) {
        let _g173 = 0;
        G174: {
          const _a175 = sp.adj8[v_a];
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            if (!(((b.grid[sp.adj8Edges[v_a][_i176]] || -1) === 1))) continue;
            _g173++;
          }
        }
        _c178 = (_g173 < (_k177[v_a] ?? takes(sp, cl, v_a)));
      }
      let _c183: boolean = _c178;
      if (_c183) {
        let _g179 = 0;
        G180: {
          const _a181 = sp.adj8[v_b];
          for (let _i182 = 0; _i182 < _a181.length; _i182++) {
            if (!(((b.grid[sp.adj8Edges[v_b][_i182]] || -1) === 1))) continue;
            _g179++;
          }
        }
        _c183 = (_g179 < (_k177[v_b] ?? takes(sp, cl, v_b)));
      }
      let _c185: boolean = _c183;
      if (_c185) {
        const _t184 = sp.edgeOf(v_a, v_b);
        _c185 = !(((sp.crossing[_t184] !== -1) && ((b.grid[sp.crossing[_t184]] || -1) === 1)));
      }
      let _c343: boolean = _c185;
      if (_c343) {
        let _q186 = false;
        Q187: {
          let _g188 = 0;
          G189: {
            const _a190 = sp.adj8[v_a];
            for (let _i191 = 0; _i191 < _a190.length; _i191++) {
              const _t192 = sp.adj8Edges[v_a][_i191];
              if (!((((b.grid[_t192] || -1) === 1) || (v_H.includes(_t192))))) continue;
              _g188++;
            }
          }
          L193: {
            const v_n = ((_k177[v_a] ?? takes(sp, cl, v_a)) - _g188);
            if (!((v_n > 0))) break L193;
            let _g194 = 0;
            G195: {
              const _a196 = sp.adj8[v_a];
              for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                const v_y = _a196[_i197];
                let _c204: boolean = (!((b.grid[sp.adj8Edges[v_a][_i197]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i197])));
                if (_c204) {
                  let _g198 = 0;
                  G199: {
                    const _a201 = sp.adj8[v_y];
                    for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                      const _t203 = sp.adj8Edges[v_y][_i202];
                      if (!((((b.grid[_t203] || -1) === 1) || (v_H.includes(_t203))))) continue;
                      _g198++;
                    }
                  }
                  _c204 = (_g198 < (_k177[v_y] ?? takes(sp, cl, v_y)));
                }
                let _c207: boolean = _c204;
                if (_c207) {
                  let _c206: boolean = (sp.crossing[sp.adj8Edges[v_a][_i197]] !== -1);
                  if (_c206) {
                    const _t205 = sp.crossing[sp.adj8Edges[v_a][_i197]];
                    _c206 = (((b.grid[_t205] || -1) === 1) || (v_H.includes(_t205)));
                  }
                  _c207 = !(_c206);
                }
                if (!(_c207)) continue;
                _g194++;
              }
            }
            if ((_g194 < v_n)) {
              _q186 = true;
              break Q187;
            }
          }
        }
        let _c234: boolean = _q186;
        if (!_c234) {
          let _q208 = false;
          Q209: {
            const _a210 = sp.adj8[v_a];
            for (let _i211 = 0; _i211 < _a210.length; _i211++) {
              const v_s = _a210[_i211];
              let _q212 = false;
              Q213: {
                let _g214 = 0;
                G215: {
                  const _a216 = sp.adj8[v_s];
                  for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                    const _t218 = sp.adj8Edges[v_s][_i217];
                    if (!((((b.grid[_t218] || -1) === 1) || (v_H.includes(_t218))))) continue;
                    _g214++;
                  }
                }
                L219: {
                  const v_n = ((_k177[v_s] ?? takes(sp, cl, v_s)) - _g214);
                  if (!((v_n > 0))) break L219;
                  let _g220 = 0;
                  G221: {
                    const _a222 = sp.adj8[v_s];
                    for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                      const v_y = _a222[_i223];
                      let _c230: boolean = (!((b.grid[sp.adj8Edges[v_s][_i223]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i223])));
                      if (_c230) {
                        let _g224 = 0;
                        G225: {
                          const _a227 = sp.adj8[v_y];
                          for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                            const _t229 = sp.adj8Edges[v_y][_i228];
                            if (!((((b.grid[_t229] || -1) === 1) || (v_H.includes(_t229))))) continue;
                            _g224++;
                          }
                        }
                        _c230 = (_g224 < (_k177[v_y] ?? takes(sp, cl, v_y)));
                      }
                      let _c233: boolean = _c230;
                      if (_c233) {
                        let _c232: boolean = (sp.crossing[sp.adj8Edges[v_s][_i223]] !== -1);
                        if (_c232) {
                          const _t231 = sp.crossing[sp.adj8Edges[v_s][_i223]];
                          _c232 = (((b.grid[_t231] || -1) === 1) || (v_H.includes(_t231)));
                        }
                        _c233 = !(_c232);
                      }
                      if (!(_c233)) continue;
                      _g220++;
                    }
                  }
                  if ((_g220 < v_n)) {
                    _q212 = true;
                    break Q213;
                  }
                }
              }
              if (_q212) {
                _q208 = true;
                break Q209;
              }
            }
          }
          _c234 = _q208;
        }
        let _c263: boolean = _c234;
        if (!_c263) {
          let _g235 = 0;
          G236: {
            const _a237 = sp.adj8[v_a];
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const _t239 = sp.adj8Edges[v_a][_i238];
              if (!((((b.grid[_t239] || -1) === 1) || (v_H.includes(_t239))))) continue;
              _g235++;
            }
          }
          let _c250: boolean = !((_g235 < (_k177[v_a] ?? takes(sp, cl, v_a))));
          if (_c250) {
            let _q240 = true;
            Q241: {
              const _a243 = throughWhere(sp, v_a, (_te242: number): boolean => {  return (((b.grid[_te242] || -1) === 1) || (v_H.includes(_te242))); });
              for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                const v_x = _a243[_i244];
                let _g245 = 0;
                G246: {
                  const _a247 = sp.adj8[v_x];
                  for (let _i248 = 0; _i248 < _a247.length; _i248++) {
                    const _t249 = sp.adj8Edges[v_x][_i248];
                    if (!((((b.grid[_t249] || -1) === 1) || (v_H.includes(_t249))))) continue;
                    _g245++;
                  }
                }
                if (!(!((_g245 < (_k177[v_x] ?? takes(sp, cl, v_x)))))) {
                  _q240 = false;
                  break Q241;
                }
              }
            }
            _c250 = _q240;
          }
          let _c262: boolean = _c250;
          if (_c262) {
            let _g251 = 0;
            G252: {
              const _a254 = throughWhere(sp, v_a, (_te253: number): boolean => {  return (((b.grid[_te253] || -1) === 1) || (v_H.includes(_te253))); });
              for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                const v_x = _a254[_i255];
                const _h256 = clueAt(cl.number, v_x);
                if (!((_h256 !== -1))) continue;
                _g251++;
              }
            }
            let _g257 = 0;
            G258: {
              const _a259 = sp.cells;
              for (let _i260 = 0; _i260 < _a259.length; _i260++) {
                const v_y = _a259[_i260];
                const _h261 = clueAt(cl.number, v_y);
                if (!((_h261 !== -1))) continue;
                _g257++;
              }
            }
            _c262 = (_g251 < _g257);
          }
          _c263 = _c262;
        }
        let _c342: boolean = _c263;
        if (!_c342) {
          let _q264 = false;
          Q265: {
            let _g266 = 0;
            G267: {
              const _a268 = sp.adj8[v_b];
              for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                const _t270 = sp.adj8Edges[v_b][_i269];
                if (!((((b.grid[_t270] || -1) === 1) || (v_H.includes(_t270))))) continue;
                _g266++;
              }
            }
            L271: {
              const v_n = ((_k177[v_b] ?? takes(sp, cl, v_b)) - _g266);
              if (!((v_n > 0))) break L271;
              let _g272 = 0;
              G273: {
                const _a274 = sp.adj8[v_b];
                for (let _i275 = 0; _i275 < _a274.length; _i275++) {
                  const v_y = _a274[_i275];
                  let _c282: boolean = (!((b.grid[sp.adj8Edges[v_b][_i275]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i275])));
                  if (_c282) {
                    let _g276 = 0;
                    G277: {
                      const _a279 = sp.adj8[v_y];
                      for (let _i280 = 0; _i280 < _a279.length; _i280++) {
                        const _t281 = sp.adj8Edges[v_y][_i280];
                        if (!((((b.grid[_t281] || -1) === 1) || (v_H.includes(_t281))))) continue;
                        _g276++;
                      }
                    }
                    _c282 = (_g276 < (_k177[v_y] ?? takes(sp, cl, v_y)));
                  }
                  let _c285: boolean = _c282;
                  if (_c285) {
                    let _c284: boolean = (sp.crossing[sp.adj8Edges[v_b][_i275]] !== -1);
                    if (_c284) {
                      const _t283 = sp.crossing[sp.adj8Edges[v_b][_i275]];
                      _c284 = (((b.grid[_t283] || -1) === 1) || (v_H.includes(_t283)));
                    }
                    _c285 = !(_c284);
                  }
                  if (!(_c285)) continue;
                  _g272++;
                }
              }
              if ((_g272 < v_n)) {
                _q264 = true;
                break Q265;
              }
            }
          }
          let _c312: boolean = _q264;
          if (!_c312) {
            let _q286 = false;
            Q287: {
              const _a288 = sp.adj8[v_b];
              for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                const v_s = _a288[_i289];
                let _q290 = false;
                Q291: {
                  let _g292 = 0;
                  G293: {
                    const _a294 = sp.adj8[v_s];
                    for (let _i295 = 0; _i295 < _a294.length; _i295++) {
                      const _t296 = sp.adj8Edges[v_s][_i295];
                      if (!((((b.grid[_t296] || -1) === 1) || (v_H.includes(_t296))))) continue;
                      _g292++;
                    }
                  }
                  L297: {
                    const v_n = ((_k177[v_s] ?? takes(sp, cl, v_s)) - _g292);
                    if (!((v_n > 0))) break L297;
                    let _g298 = 0;
                    G299: {
                      const _a300 = sp.adj8[v_s];
                      for (let _i301 = 0; _i301 < _a300.length; _i301++) {
                        const v_y = _a300[_i301];
                        let _c308: boolean = (!((b.grid[sp.adj8Edges[v_s][_i301]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i301])));
                        if (_c308) {
                          let _g302 = 0;
                          G303: {
                            const _a305 = sp.adj8[v_y];
                            for (let _i306 = 0; _i306 < _a305.length; _i306++) {
                              const _t307 = sp.adj8Edges[v_y][_i306];
                              if (!((((b.grid[_t307] || -1) === 1) || (v_H.includes(_t307))))) continue;
                              _g302++;
                            }
                          }
                          _c308 = (_g302 < (_k177[v_y] ?? takes(sp, cl, v_y)));
                        }
                        let _c311: boolean = _c308;
                        if (_c311) {
                          let _c310: boolean = (sp.crossing[sp.adj8Edges[v_s][_i301]] !== -1);
                          if (_c310) {
                            const _t309 = sp.crossing[sp.adj8Edges[v_s][_i301]];
                            _c310 = (((b.grid[_t309] || -1) === 1) || (v_H.includes(_t309)));
                          }
                          _c311 = !(_c310);
                        }
                        if (!(_c311)) continue;
                        _g298++;
                      }
                    }
                    if ((_g298 < v_n)) {
                      _q290 = true;
                      break Q291;
                    }
                  }
                }
                if (_q290) {
                  _q286 = true;
                  break Q287;
                }
              }
            }
            _c312 = _q286;
          }
          let _c341: boolean = _c312;
          if (!_c341) {
            let _g313 = 0;
            G314: {
              const _a315 = sp.adj8[v_b];
              for (let _i316 = 0; _i316 < _a315.length; _i316++) {
                const _t317 = sp.adj8Edges[v_b][_i316];
                if (!((((b.grid[_t317] || -1) === 1) || (v_H.includes(_t317))))) continue;
                _g313++;
              }
            }
            let _c328: boolean = !((_g313 < (_k177[v_b] ?? takes(sp, cl, v_b))));
            if (_c328) {
              let _q318 = true;
              Q319: {
                const _a321 = throughWhere(sp, v_b, (_te320: number): boolean => {  return (((b.grid[_te320] || -1) === 1) || (v_H.includes(_te320))); });
                for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                  const v_x = _a321[_i322];
                  let _g323 = 0;
                  G324: {
                    const _a325 = sp.adj8[v_x];
                    for (let _i326 = 0; _i326 < _a325.length; _i326++) {
                      const _t327 = sp.adj8Edges[v_x][_i326];
                      if (!((((b.grid[_t327] || -1) === 1) || (v_H.includes(_t327))))) continue;
                      _g323++;
                    }
                  }
                  if (!(!((_g323 < (_k177[v_x] ?? takes(sp, cl, v_x)))))) {
                    _q318 = false;
                    break Q319;
                  }
                }
              }
              _c328 = _q318;
            }
            let _c340: boolean = _c328;
            if (_c340) {
              let _g329 = 0;
              G330: {
                const _a332 = throughWhere(sp, v_b, (_te331: number): boolean => {  return (((b.grid[_te331] || -1) === 1) || (v_H.includes(_te331))); });
                for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                  const v_x = _a332[_i333];
                  const _h334 = clueAt(cl.number, v_x);
                  if (!((_h334 !== -1))) continue;
                  _g329++;
                }
              }
              let _g335 = 0;
              G336: {
                const _a337 = sp.cells;
                for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                  const v_y = _a337[_i338];
                  const _h339 = clueAt(cl.number, v_y);
                  if (!((_h339 !== -1))) continue;
                  _g335++;
                }
              }
              _c340 = (_g329 < _g335);
            }
            _c341 = _c340;
          }
          _c342 = _c341;
        }
        _c343 = _c342;
      }
      if (!(_c343)) break L172;
      if (DEV && staleChecking) {
        let _c348: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
        if (_c348) {
          let _g344 = 0;
          G345: {
            const _a346 = sp.adj8[v_a];
            for (let _i347 = 0; _i347 < _a346.length; _i347++) {
              if (!(((b.grid[sp.adj8Edges[v_a][_i347]] || -1) === 1))) continue;
              _g344++;
            }
          }
          _c348 = (_g344 < takes(sp, cl, v_a));
        }
        let _c353: boolean = _c348;
        if (_c353) {
          let _g349 = 0;
          G350: {
            const _a351 = sp.adj8[v_b];
            for (let _i352 = 0; _i352 < _a351.length; _i352++) {
              if (!(((b.grid[sp.adj8Edges[v_b][_i352]] || -1) === 1))) continue;
              _g349++;
            }
          }
          _c353 = (_g349 < takes(sp, cl, v_b));
        }
        let _c355: boolean = _c353;
        if (_c355) {
          const _t354 = sp.edgeOf(v_a, v_b);
          _c355 = !(((sp.crossing[_t354] !== -1) && ((b.grid[sp.crossing[_t354]] || -1) === 1)));
        }
        let _c509: boolean = _c355;
        if (_c509) {
          let _q356 = false;
          Q357: {
            let _g358 = 0;
            G359: {
              const _a360 = sp.adj8[v_a];
              for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                const _t362 = sp.adj8Edges[v_a][_i361];
                if (!((((b.grid[_t362] || -1) === 1) || (v_H.includes(_t362))))) continue;
                _g358++;
              }
            }
            L363: {
              const v_n = (takes(sp, cl, v_a) - _g358);
              if (!((v_n > 0))) break L363;
              let _g364 = 0;
              G365: {
                const _a366 = sp.adj8[v_a];
                for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                  const v_y = _a366[_i367];
                  let _c374: boolean = (!((b.grid[sp.adj8Edges[v_a][_i367]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_a][_i367])));
                  if (_c374) {
                    let _g368 = 0;
                    G369: {
                      const _a371 = sp.adj8[v_y];
                      for (let _i372 = 0; _i372 < _a371.length; _i372++) {
                        const _t373 = sp.adj8Edges[v_y][_i372];
                        if (!((((b.grid[_t373] || -1) === 1) || (v_H.includes(_t373))))) continue;
                        _g368++;
                      }
                    }
                    _c374 = (_g368 < takes(sp, cl, v_y));
                  }
                  let _c377: boolean = _c374;
                  if (_c377) {
                    let _c376: boolean = (sp.crossing[sp.adj8Edges[v_a][_i367]] !== -1);
                    if (_c376) {
                      const _t375 = sp.crossing[sp.adj8Edges[v_a][_i367]];
                      _c376 = (((b.grid[_t375] || -1) === 1) || (v_H.includes(_t375)));
                    }
                    _c377 = !(_c376);
                  }
                  if (!(_c377)) continue;
                  _g364++;
                }
              }
              if ((_g364 < v_n)) {
                _q356 = true;
                break Q357;
              }
            }
          }
          let _c404: boolean = _q356;
          if (!_c404) {
            let _q378 = false;
            Q379: {
              const _a380 = sp.adj8[v_a];
              for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                const v_s = _a380[_i381];
                let _q382 = false;
                Q383: {
                  let _g384 = 0;
                  G385: {
                    const _a386 = sp.adj8[v_s];
                    for (let _i387 = 0; _i387 < _a386.length; _i387++) {
                      const _t388 = sp.adj8Edges[v_s][_i387];
                      if (!((((b.grid[_t388] || -1) === 1) || (v_H.includes(_t388))))) continue;
                      _g384++;
                    }
                  }
                  L389: {
                    const v_n = (takes(sp, cl, v_s) - _g384);
                    if (!((v_n > 0))) break L389;
                    let _g390 = 0;
                    G391: {
                      const _a392 = sp.adj8[v_s];
                      for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                        const v_y = _a392[_i393];
                        let _c400: boolean = (!((b.grid[sp.adj8Edges[v_s][_i393]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i393])));
                        if (_c400) {
                          let _g394 = 0;
                          G395: {
                            const _a397 = sp.adj8[v_y];
                            for (let _i398 = 0; _i398 < _a397.length; _i398++) {
                              const _t399 = sp.adj8Edges[v_y][_i398];
                              if (!((((b.grid[_t399] || -1) === 1) || (v_H.includes(_t399))))) continue;
                              _g394++;
                            }
                          }
                          _c400 = (_g394 < takes(sp, cl, v_y));
                        }
                        let _c403: boolean = _c400;
                        if (_c403) {
                          let _c402: boolean = (sp.crossing[sp.adj8Edges[v_s][_i393]] !== -1);
                          if (_c402) {
                            const _t401 = sp.crossing[sp.adj8Edges[v_s][_i393]];
                            _c402 = (((b.grid[_t401] || -1) === 1) || (v_H.includes(_t401)));
                          }
                          _c403 = !(_c402);
                        }
                        if (!(_c403)) continue;
                        _g390++;
                      }
                    }
                    if ((_g390 < v_n)) {
                      _q382 = true;
                      break Q383;
                    }
                  }
                }
                if (_q382) {
                  _q378 = true;
                  break Q379;
                }
              }
            }
            _c404 = _q378;
          }
          let _c431: boolean = _c404;
          if (!_c431) {
            let _g405 = 0;
            G406: {
              const _a407 = sp.adj8[v_a];
              for (let _i408 = 0; _i408 < _a407.length; _i408++) {
                const _t409 = sp.adj8Edges[v_a][_i408];
                if (!((((b.grid[_t409] || -1) === 1) || (v_H.includes(_t409))))) continue;
                _g405++;
              }
            }
            let _c420: boolean = !((_g405 < takes(sp, cl, v_a)));
            if (_c420) {
              let _q410 = true;
              Q411: {
                const _a413 = throughWhere(sp, v_a, (_te412: number): boolean => {  return (((b.grid[_te412] || -1) === 1) || (v_H.includes(_te412))); });
                for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                  const v_x = _a413[_i414];
                  let _g415 = 0;
                  G416: {
                    const _a417 = sp.adj8[v_x];
                    for (let _i418 = 0; _i418 < _a417.length; _i418++) {
                      const _t419 = sp.adj8Edges[v_x][_i418];
                      if (!((((b.grid[_t419] || -1) === 1) || (v_H.includes(_t419))))) continue;
                      _g415++;
                    }
                  }
                  if (!(!((_g415 < takes(sp, cl, v_x))))) {
                    _q410 = false;
                    break Q411;
                  }
                }
              }
              _c420 = _q410;
            }
            let _c430: boolean = _c420;
            if (_c430) {
              let _g421 = 0;
              G422: {
                const _a424 = throughWhere(sp, v_a, (_te423: number): boolean => {  return (((b.grid[_te423] || -1) === 1) || (v_H.includes(_te423))); });
                for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                  const v_x = _a424[_i425];
                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                  _g421++;
                }
              }
              let _g426 = 0;
              G427: {
                const _a428 = sp.cells;
                for (let _i429 = 0; _i429 < _a428.length; _i429++) {
                  const v_y = _a428[_i429];
                  if (!((clueAt(cl.number, v_y) !== -1))) continue;
                  _g426++;
                }
              }
              _c430 = (_g421 < _g426);
            }
            _c431 = _c430;
          }
          let _c508: boolean = _c431;
          if (!_c508) {
            let _q432 = false;
            Q433: {
              let _g434 = 0;
              G435: {
                const _a436 = sp.adj8[v_b];
                for (let _i437 = 0; _i437 < _a436.length; _i437++) {
                  const _t438 = sp.adj8Edges[v_b][_i437];
                  if (!((((b.grid[_t438] || -1) === 1) || (v_H.includes(_t438))))) continue;
                  _g434++;
                }
              }
              L439: {
                const v_n = (takes(sp, cl, v_b) - _g434);
                if (!((v_n > 0))) break L439;
                let _g440 = 0;
                G441: {
                  const _a442 = sp.adj8[v_b];
                  for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                    const v_y = _a442[_i443];
                    let _c450: boolean = (!((b.grid[sp.adj8Edges[v_b][_i443]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_b][_i443])));
                    if (_c450) {
                      let _g444 = 0;
                      G445: {
                        const _a447 = sp.adj8[v_y];
                        for (let _i448 = 0; _i448 < _a447.length; _i448++) {
                          const _t449 = sp.adj8Edges[v_y][_i448];
                          if (!((((b.grid[_t449] || -1) === 1) || (v_H.includes(_t449))))) continue;
                          _g444++;
                        }
                      }
                      _c450 = (_g444 < takes(sp, cl, v_y));
                    }
                    let _c453: boolean = _c450;
                    if (_c453) {
                      let _c452: boolean = (sp.crossing[sp.adj8Edges[v_b][_i443]] !== -1);
                      if (_c452) {
                        const _t451 = sp.crossing[sp.adj8Edges[v_b][_i443]];
                        _c452 = (((b.grid[_t451] || -1) === 1) || (v_H.includes(_t451)));
                      }
                      _c453 = !(_c452);
                    }
                    if (!(_c453)) continue;
                    _g440++;
                  }
                }
                if ((_g440 < v_n)) {
                  _q432 = true;
                  break Q433;
                }
              }
            }
            let _c480: boolean = _q432;
            if (!_c480) {
              let _q454 = false;
              Q455: {
                const _a456 = sp.adj8[v_b];
                for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                  const v_s = _a456[_i457];
                  let _q458 = false;
                  Q459: {
                    let _g460 = 0;
                    G461: {
                      const _a462 = sp.adj8[v_s];
                      for (let _i463 = 0; _i463 < _a462.length; _i463++) {
                        const _t464 = sp.adj8Edges[v_s][_i463];
                        if (!((((b.grid[_t464] || -1) === 1) || (v_H.includes(_t464))))) continue;
                        _g460++;
                      }
                    }
                    L465: {
                      const v_n = (takes(sp, cl, v_s) - _g460);
                      if (!((v_n > 0))) break L465;
                      let _g466 = 0;
                      G467: {
                        const _a468 = sp.adj8[v_s];
                        for (let _i469 = 0; _i469 < _a468.length; _i469++) {
                          const v_y = _a468[_i469];
                          let _c476: boolean = (!((b.grid[sp.adj8Edges[v_s][_i469]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i469])));
                          if (_c476) {
                            let _g470 = 0;
                            G471: {
                              const _a473 = sp.adj8[v_y];
                              for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                                const _t475 = sp.adj8Edges[v_y][_i474];
                                if (!((((b.grid[_t475] || -1) === 1) || (v_H.includes(_t475))))) continue;
                                _g470++;
                              }
                            }
                            _c476 = (_g470 < takes(sp, cl, v_y));
                          }
                          let _c479: boolean = _c476;
                          if (_c479) {
                            let _c478: boolean = (sp.crossing[sp.adj8Edges[v_s][_i469]] !== -1);
                            if (_c478) {
                              const _t477 = sp.crossing[sp.adj8Edges[v_s][_i469]];
                              _c478 = (((b.grid[_t477] || -1) === 1) || (v_H.includes(_t477)));
                            }
                            _c479 = !(_c478);
                          }
                          if (!(_c479)) continue;
                          _g466++;
                        }
                      }
                      if ((_g466 < v_n)) {
                        _q458 = true;
                        break Q459;
                      }
                    }
                  }
                  if (_q458) {
                    _q454 = true;
                    break Q455;
                  }
                }
              }
              _c480 = _q454;
            }
            let _c507: boolean = _c480;
            if (!_c507) {
              let _g481 = 0;
              G482: {
                const _a483 = sp.adj8[v_b];
                for (let _i484 = 0; _i484 < _a483.length; _i484++) {
                  const _t485 = sp.adj8Edges[v_b][_i484];
                  if (!((((b.grid[_t485] || -1) === 1) || (v_H.includes(_t485))))) continue;
                  _g481++;
                }
              }
              let _c496: boolean = !((_g481 < takes(sp, cl, v_b)));
              if (_c496) {
                let _q486 = true;
                Q487: {
                  const _a489 = throughWhere(sp, v_b, (_te488: number): boolean => {  return (((b.grid[_te488] || -1) === 1) || (v_H.includes(_te488))); });
                  for (let _i490 = 0; _i490 < _a489.length; _i490++) {
                    const v_x = _a489[_i490];
                    let _g491 = 0;
                    G492: {
                      const _a493 = sp.adj8[v_x];
                      for (let _i494 = 0; _i494 < _a493.length; _i494++) {
                        const _t495 = sp.adj8Edges[v_x][_i494];
                        if (!((((b.grid[_t495] || -1) === 1) || (v_H.includes(_t495))))) continue;
                        _g491++;
                      }
                    }
                    if (!(!((_g491 < takes(sp, cl, v_x))))) {
                      _q486 = false;
                      break Q487;
                    }
                  }
                }
                _c496 = _q486;
              }
              let _c506: boolean = _c496;
              if (_c506) {
                let _g497 = 0;
                G498: {
                  const _a500 = throughWhere(sp, v_b, (_te499: number): boolean => {  return (((b.grid[_te499] || -1) === 1) || (v_H.includes(_te499))); });
                  for (let _i501 = 0; _i501 < _a500.length; _i501++) {
                    const v_x = _a500[_i501];
                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                    _g497++;
                  }
                }
                let _g502 = 0;
                G503: {
                  const _a504 = sp.cells;
                  for (let _i505 = 0; _i505 < _a504.length; _i505++) {
                    const v_y = _a504[_i505];
                    if (!((clueAt(cl.number, v_y) !== -1))) continue;
                    _g502++;
                  }
                }
                _c506 = (_g497 < _g502);
              }
              _c507 = _c506;
            }
            _c508 = _c507;
          }
          _c509 = _c508;
        }
        freshBinding("lineBreaks", [(sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), sameSet(v_H, setOf(v_e)), _c509], ["e in", "a =", "b =", "H =", "where of H"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b, H: v_H.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SpareBreaksBinding {
  c: number;
  U: readonly number[];
  y: number;
  H: readonly number[];
}

const spareBreaksFacts: number[] = [];
const spareBreaks_st198 = stamps();

/** Its dearest read grows with the board as n^2. */
export function spareBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SpareBreaksBinding> | null): number {
  const _g194: number[] = [];
  const facts = spareBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k190 = takesKept.board(cl);
  const _a183 = sp.cells;
  R1:
  for (let _i184 = 0; _i184 < _a183.length; _i184++) {
    const v_c = _a183[_i184];
    const _m544_0 = b.made[0];
    const _m545_1 = b.made[1];
    L185: {
      const v_U = ways(b, sp, cl, v_c);
      const _h191 = v_U.length;
      let _g186 = 0;
      G187: {
        const _a188 = sp.adj8[v_c];
        for (let _i189 = 0; _i189 < _a188.length; _i189++) {
          if (!(((b.grid[sp.adj8Edges[v_c][_i189]] || -1) === 1))) continue;
          _g186++;
        }
      }
      if (!(((_g186 < (_k190[v_c] ?? takes(sp, cl, v_c))) && (_h191 === (((_k190[v_c] ?? takes(sp, cl, v_c)) - _g186) + 1))))) break L185;
      const _a192 = v_U;
      for (let _i193 = 0; _i193 < _a192.length; _i193++) {
        const v_y = _a192[_i193];
        _g194.length = 0;
        spareBreaks_st198.pass++;
        G195: {
          const _a199 = v_U;
          for (let _i200 = 0; _i200 < _a199.length; _i200++) {
            const v_x = _a199[_i200];
            if (!((v_x !== v_y))) continue;
            const _t201 = sp.edgeOf(v_c, v_x);
            const _t202 = _t201;
            if (_g194.length < 16) { if (!_g194.includes(_t202)) _g194.push(_t202); } else addOnce(_g194, spareBreaks_st198, _t202);
          }
        }
        L203: {
          const v_H = _g194;
          let _c367: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
          if (_c367) {
            let _q204 = false;
            Q205: {
              let _g206 = 0;
              G207: {
                const _a208 = sp.adj8[v_c];
                for (let _i209 = 0; _i209 < _a208.length; _i209++) {
                  const _t210 = sp.adj8Edges[v_c][_i209];
                  if (!((((b.grid[_t210] || -1) === 1) || (v_H.includes(_t210))))) continue;
                  _g206++;
                }
              }
              L211: {
                const v_n = ((_k190[v_c] ?? takes(sp, cl, v_c)) - _g206);
                if (!((v_n > 0))) break L211;
                let _g212 = 0;
                G213: {
                  const _a214 = sp.adj8[v_c];
                  for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                    const v_y = _a214[_i215];
                    let _c222: boolean = (!((b.grid[sp.adj8Edges[v_c][_i215]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i215])));
                    if (_c222) {
                      let _g216 = 0;
                      G217: {
                        const _a219 = sp.adj8[v_y];
                        for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                          const _t221 = sp.adj8Edges[v_y][_i220];
                          if (!((((b.grid[_t221] || -1) === 1) || (v_H.includes(_t221))))) continue;
                          _g216++;
                        }
                      }
                      _c222 = (_g216 < (_k190[v_y] ?? takes(sp, cl, v_y)));
                    }
                    let _c225: boolean = _c222;
                    if (_c225) {
                      let _c224: boolean = (sp.crossing[sp.adj8Edges[v_c][_i215]] !== -1);
                      if (_c224) {
                        const _t223 = sp.crossing[sp.adj8Edges[v_c][_i215]];
                        _c224 = (((b.grid[_t223] || -1) === 1) || (v_H.includes(_t223)));
                      }
                      _c225 = !(_c224);
                    }
                    if (!(_c225)) continue;
                    _g212++;
                  }
                }
                if ((_g212 < v_n)) {
                  _q204 = true;
                  break Q205;
                }
              }
            }
            let _c252: boolean = _q204;
            if (!_c252) {
              let _q226 = false;
              Q227: {
                const _a228 = sp.adj8[v_c];
                for (let _i229 = 0; _i229 < _a228.length; _i229++) {
                  const v_s = _a228[_i229];
                  let _q230 = false;
                  Q231: {
                    let _g232 = 0;
                    G233: {
                      const _a234 = sp.adj8[v_s];
                      for (let _i235 = 0; _i235 < _a234.length; _i235++) {
                        const _t236 = sp.adj8Edges[v_s][_i235];
                        if (!((((b.grid[_t236] || -1) === 1) || (v_H.includes(_t236))))) continue;
                        _g232++;
                      }
                    }
                    L237: {
                      const v_n = ((_k190[v_s] ?? takes(sp, cl, v_s)) - _g232);
                      if (!((v_n > 0))) break L237;
                      let _g238 = 0;
                      G239: {
                        const _a240 = sp.adj8[v_s];
                        for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                          const v_y = _a240[_i241];
                          let _c248: boolean = (!((b.grid[sp.adj8Edges[v_s][_i241]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i241])));
                          if (_c248) {
                            let _g242 = 0;
                            G243: {
                              const _a245 = sp.adj8[v_y];
                              for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                                const _t247 = sp.adj8Edges[v_y][_i246];
                                if (!((((b.grid[_t247] || -1) === 1) || (v_H.includes(_t247))))) continue;
                                _g242++;
                              }
                            }
                            _c248 = (_g242 < (_k190[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c251: boolean = _c248;
                          if (_c251) {
                            let _c250: boolean = (sp.crossing[sp.adj8Edges[v_s][_i241]] !== -1);
                            if (_c250) {
                              const _t249 = sp.crossing[sp.adj8Edges[v_s][_i241]];
                              _c250 = (((b.grid[_t249] || -1) === 1) || (v_H.includes(_t249)));
                            }
                            _c251 = !(_c250);
                          }
                          if (!(_c251)) continue;
                          _g238++;
                        }
                      }
                      if ((_g238 < v_n)) {
                        _q230 = true;
                        break Q231;
                      }
                    }
                  }
                  if (_q230) {
                    _q226 = true;
                    break Q227;
                  }
                }
              }
              _c252 = _q226;
            }
            let _c281: boolean = _c252;
            if (!_c281) {
              let _g253 = 0;
              G254: {
                const _a255 = sp.adj8[v_c];
                for (let _i256 = 0; _i256 < _a255.length; _i256++) {
                  const _t257 = sp.adj8Edges[v_c][_i256];
                  if (!((((b.grid[_t257] || -1) === 1) || (v_H.includes(_t257))))) continue;
                  _g253++;
                }
              }
              let _c268: boolean = !((_g253 < (_k190[v_c] ?? takes(sp, cl, v_c))));
              if (_c268) {
                let _q258 = true;
                Q259: {
                  const _a261 = throughWhere(sp, v_c, (_te260: number): boolean => {  return (((b.grid[_te260] || -1) === 1) || (v_H.includes(_te260))); });
                  for (let _i262 = 0; _i262 < _a261.length; _i262++) {
                    const v_x = _a261[_i262];
                    let _g263 = 0;
                    G264: {
                      const _a265 = sp.adj8[v_x];
                      for (let _i266 = 0; _i266 < _a265.length; _i266++) {
                        const _t267 = sp.adj8Edges[v_x][_i266];
                        if (!((((b.grid[_t267] || -1) === 1) || (v_H.includes(_t267))))) continue;
                        _g263++;
                      }
                    }
                    if (!(!((_g263 < (_k190[v_x] ?? takes(sp, cl, v_x)))))) {
                      _q258 = false;
                      break Q259;
                    }
                  }
                }
                _c268 = _q258;
              }
              let _c280: boolean = _c268;
              if (_c280) {
                let _g269 = 0;
                G270: {
                  const _a272 = throughWhere(sp, v_c, (_te271: number): boolean => {  return (((b.grid[_te271] || -1) === 1) || (v_H.includes(_te271))); });
                  for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                    const v_x = _a272[_i273];
                    const _h274 = clueAt(cl.number, v_x);
                    if (!((_h274 !== -1))) continue;
                    _g269++;
                  }
                }
                let _g275 = 0;
                G276: {
                  const _a277 = sp.cells;
                  for (let _i278 = 0; _i278 < _a277.length; _i278++) {
                    const v_y = _a277[_i278];
                    const _h279 = clueAt(cl.number, v_y);
                    if (!((_h279 !== -1))) continue;
                    _g275++;
                  }
                }
                _c280 = (_g269 < _g275);
              }
              _c281 = _c280;
            }
            let _c366: boolean = _c281;
            if (!_c366) {
              let _q282 = false;
              Q283: {
                const _a284 = v_U;
                for (let _i285 = 0; _i285 < _a284.length; _i285++) {
                  const v_x = _a284[_i285];
                  if (!((v_x !== v_y))) continue;
                  let _q286 = false;
                  Q287: {
                    let _g288 = 0;
                    G289: {
                      const _a290 = sp.adj8[v_x];
                      for (let _i291 = 0; _i291 < _a290.length; _i291++) {
                        const _t292 = sp.adj8Edges[v_x][_i291];
                        if (!((((b.grid[_t292] || -1) === 1) || (v_H.includes(_t292))))) continue;
                        _g288++;
                      }
                    }
                    L293: {
                      const v_n = ((_k190[v_x] ?? takes(sp, cl, v_x)) - _g288);
                      if (!((v_n > 0))) break L293;
                      let _g294 = 0;
                      G295: {
                        const _a296 = sp.adj8[v_x];
                        for (let _i297 = 0; _i297 < _a296.length; _i297++) {
                          const v_y = _a296[_i297];
                          let _c304: boolean = (!((b.grid[sp.adj8Edges[v_x][_i297]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i297])));
                          if (_c304) {
                            let _g298 = 0;
                            G299: {
                              const _a301 = sp.adj8[v_y];
                              for (let _i302 = 0; _i302 < _a301.length; _i302++) {
                                const _t303 = sp.adj8Edges[v_y][_i302];
                                if (!((((b.grid[_t303] || -1) === 1) || (v_H.includes(_t303))))) continue;
                                _g298++;
                              }
                            }
                            _c304 = (_g298 < (_k190[v_y] ?? takes(sp, cl, v_y)));
                          }
                          let _c307: boolean = _c304;
                          if (_c307) {
                            let _c306: boolean = (sp.crossing[sp.adj8Edges[v_x][_i297]] !== -1);
                            if (_c306) {
                              const _t305 = sp.crossing[sp.adj8Edges[v_x][_i297]];
                              _c306 = (((b.grid[_t305] || -1) === 1) || (v_H.includes(_t305)));
                            }
                            _c307 = !(_c306);
                          }
                          if (!(_c307)) continue;
                          _g294++;
                        }
                      }
                      if ((_g294 < v_n)) {
                        _q286 = true;
                        break Q287;
                      }
                    }
                  }
                  let _c334: boolean = _q286;
                  if (!_c334) {
                    let _q308 = false;
                    Q309: {
                      const _a310 = sp.adj8[v_x];
                      for (let _i311 = 0; _i311 < _a310.length; _i311++) {
                        const v_s = _a310[_i311];
                        let _q312 = false;
                        Q313: {
                          let _g314 = 0;
                          G315: {
                            const _a316 = sp.adj8[v_s];
                            for (let _i317 = 0; _i317 < _a316.length; _i317++) {
                              const _t318 = sp.adj8Edges[v_s][_i317];
                              if (!((((b.grid[_t318] || -1) === 1) || (v_H.includes(_t318))))) continue;
                              _g314++;
                            }
                          }
                          L319: {
                            const v_n = ((_k190[v_s] ?? takes(sp, cl, v_s)) - _g314);
                            if (!((v_n > 0))) break L319;
                            let _g320 = 0;
                            G321: {
                              const _a322 = sp.adj8[v_s];
                              for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                                const v_y = _a322[_i323];
                                let _c330: boolean = (!((b.grid[sp.adj8Edges[v_s][_i323]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i323])));
                                if (_c330) {
                                  let _g324 = 0;
                                  G325: {
                                    const _a327 = sp.adj8[v_y];
                                    for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                                      const _t329 = sp.adj8Edges[v_y][_i328];
                                      if (!((((b.grid[_t329] || -1) === 1) || (v_H.includes(_t329))))) continue;
                                      _g324++;
                                    }
                                  }
                                  _c330 = (_g324 < (_k190[v_y] ?? takes(sp, cl, v_y)));
                                }
                                let _c333: boolean = _c330;
                                if (_c333) {
                                  let _c332: boolean = (sp.crossing[sp.adj8Edges[v_s][_i323]] !== -1);
                                  if (_c332) {
                                    const _t331 = sp.crossing[sp.adj8Edges[v_s][_i323]];
                                    _c332 = (((b.grid[_t331] || -1) === 1) || (v_H.includes(_t331)));
                                  }
                                  _c333 = !(_c332);
                                }
                                if (!(_c333)) continue;
                                _g320++;
                              }
                            }
                            if ((_g320 < v_n)) {
                              _q312 = true;
                              break Q313;
                            }
                          }
                        }
                        if (_q312) {
                          _q308 = true;
                          break Q309;
                        }
                      }
                    }
                    _c334 = _q308;
                  }
                  let _c365: boolean = _c334;
                  if (!_c365) {
                    let _g335 = 0;
                    G336: {
                      const _a337 = sp.adj8[v_x];
                      for (let _i338 = 0; _i338 < _a337.length; _i338++) {
                        const _t339 = sp.adj8Edges[v_x][_i338];
                        if (!((((b.grid[_t339] || -1) === 1) || (v_H.includes(_t339))))) continue;
                        _g335++;
                      }
                    }
                    let _c351: boolean = !((_g335 < (_k190[v_x] ?? takes(sp, cl, v_x))));
                    if (_c351) {
                      let _q340 = true;
                      Q341: {
                        const _a344 = throughWhere(sp, v_x, (_te343: number): boolean => {  return (((b.grid[_te343] || -1) === 1) || (v_H.includes(_te343))); });
                        for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                          const v_x_342 = _a344[_i345];
                          let _g346 = 0;
                          G347: {
                            const _a348 = sp.adj8[v_x_342];
                            for (let _i349 = 0; _i349 < _a348.length; _i349++) {
                              const _t350 = sp.adj8Edges[v_x_342][_i349];
                              if (!((((b.grid[_t350] || -1) === 1) || (v_H.includes(_t350))))) continue;
                              _g346++;
                            }
                          }
                          if (!(!((_g346 < (_k190[v_x_342] ?? takes(sp, cl, v_x_342)))))) {
                            _q340 = false;
                            break Q341;
                          }
                        }
                      }
                      _c351 = _q340;
                    }
                    let _c364: boolean = _c351;
                    if (_c364) {
                      let _g352 = 0;
                      G353: {
                        const _a356 = throughWhere(sp, v_x, (_te355: number): boolean => {  return (((b.grid[_te355] || -1) === 1) || (v_H.includes(_te355))); });
                        for (let _i357 = 0; _i357 < _a356.length; _i357++) {
                          const v_x_354 = _a356[_i357];
                          const _h358 = clueAt(cl.number, v_x_354);
                          if (!((_h358 !== -1))) continue;
                          _g352++;
                        }
                      }
                      let _g359 = 0;
                      G360: {
                        const _a361 = sp.cells;
                        for (let _i362 = 0; _i362 < _a361.length; _i362++) {
                          const v_y = _a361[_i362];
                          const _h363 = clueAt(cl.number, v_y);
                          if (!((_h363 !== -1))) continue;
                          _g359++;
                        }
                      }
                      _c364 = (_g352 < _g359);
                    }
                    _c365 = _c364;
                  }
                  if (_c365) {
                    _q282 = true;
                    break Q283;
                  }
                }
              }
              _c366 = _q282;
            }
            _c367 = _c366;
          }
          if (!(_c367)) break L203;
          if (b.made[0] !== _m544_0 || b.made[1] !== _m545_1) {
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
            let _g368 = 0;
            G369: {
              const _a370 = sp.adj8[v_c];
              for (let _i371 = 0; _i371 < _a370.length; _i371++) {
                if (!(((b.grid[sp.adj8Edges[v_c][_i371]] || -1) === 1))) continue;
                _g368++;
              }
            }
            if (!(((_g368 < takes(sp, cl, v_c)) && (v_U.length === ((takes(sp, cl, v_c) - _g368) + 1))))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g372 = 0;
            G373: {
              const _a374 = sp.adj8[v_c];
              for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                if (!(((b.grid[sp.adj8Edges[v_c][_i375]] || -1) === 1))) continue;
                _g372++;
              }
            }
            const _g376: number[] = [];
            G377: {
              const _a380 = v_U;
              for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                const v_x = _a380[_i381];
                if (!((v_x !== v_y))) continue;
                const _t382 = sp.edgeOf(v_c, v_x);
                if (!_g376.includes(_t382)) _g376.push(_t382);
              }
            }
            let _c542: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
            if (_c542) {
              let _q383 = false;
              Q384: {
                let _g385 = 0;
                G386: {
                  const _a387 = sp.adj8[v_c];
                  for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                    const _t389 = sp.adj8Edges[v_c][_i388];
                    if (!((((b.grid[_t389] || -1) === 1) || (v_H.includes(_t389))))) continue;
                    _g385++;
                  }
                }
                L390: {
                  const v_n = (takes(sp, cl, v_c) - _g385);
                  if (!((v_n > 0))) break L390;
                  let _g391 = 0;
                  G392: {
                    const _a393 = sp.adj8[v_c];
                    for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                      const v_y = _a393[_i394];
                      let _c401: boolean = (!((b.grid[sp.adj8Edges[v_c][_i394]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_c][_i394])));
                      if (_c401) {
                        let _g395 = 0;
                        G396: {
                          const _a398 = sp.adj8[v_y];
                          for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                            const _t400 = sp.adj8Edges[v_y][_i399];
                            if (!((((b.grid[_t400] || -1) === 1) || (v_H.includes(_t400))))) continue;
                            _g395++;
                          }
                        }
                        _c401 = (_g395 < takes(sp, cl, v_y));
                      }
                      let _c404: boolean = _c401;
                      if (_c404) {
                        let _c403: boolean = (sp.crossing[sp.adj8Edges[v_c][_i394]] !== -1);
                        if (_c403) {
                          const _t402 = sp.crossing[sp.adj8Edges[v_c][_i394]];
                          _c403 = (((b.grid[_t402] || -1) === 1) || (v_H.includes(_t402)));
                        }
                        _c404 = !(_c403);
                      }
                      if (!(_c404)) continue;
                      _g391++;
                    }
                  }
                  if ((_g391 < v_n)) {
                    _q383 = true;
                    break Q384;
                  }
                }
              }
              let _c431: boolean = _q383;
              if (!_c431) {
                let _q405 = false;
                Q406: {
                  const _a407 = sp.adj8[v_c];
                  for (let _i408 = 0; _i408 < _a407.length; _i408++) {
                    const v_s = _a407[_i408];
                    let _q409 = false;
                    Q410: {
                      let _g411 = 0;
                      G412: {
                        const _a413 = sp.adj8[v_s];
                        for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                          const _t415 = sp.adj8Edges[v_s][_i414];
                          if (!((((b.grid[_t415] || -1) === 1) || (v_H.includes(_t415))))) continue;
                          _g411++;
                        }
                      }
                      L416: {
                        const v_n = (takes(sp, cl, v_s) - _g411);
                        if (!((v_n > 0))) break L416;
                        let _g417 = 0;
                        G418: {
                          const _a419 = sp.adj8[v_s];
                          for (let _i420 = 0; _i420 < _a419.length; _i420++) {
                            const v_y = _a419[_i420];
                            let _c427: boolean = (!((b.grid[sp.adj8Edges[v_s][_i420]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i420])));
                            if (_c427) {
                              let _g421 = 0;
                              G422: {
                                const _a424 = sp.adj8[v_y];
                                for (let _i425 = 0; _i425 < _a424.length; _i425++) {
                                  const _t426 = sp.adj8Edges[v_y][_i425];
                                  if (!((((b.grid[_t426] || -1) === 1) || (v_H.includes(_t426))))) continue;
                                  _g421++;
                                }
                              }
                              _c427 = (_g421 < takes(sp, cl, v_y));
                            }
                            let _c430: boolean = _c427;
                            if (_c430) {
                              let _c429: boolean = (sp.crossing[sp.adj8Edges[v_s][_i420]] !== -1);
                              if (_c429) {
                                const _t428 = sp.crossing[sp.adj8Edges[v_s][_i420]];
                                _c429 = (((b.grid[_t428] || -1) === 1) || (v_H.includes(_t428)));
                              }
                              _c430 = !(_c429);
                            }
                            if (!(_c430)) continue;
                            _g417++;
                          }
                        }
                        if ((_g417 < v_n)) {
                          _q409 = true;
                          break Q410;
                        }
                      }
                    }
                    if (_q409) {
                      _q405 = true;
                      break Q406;
                    }
                  }
                }
                _c431 = _q405;
              }
              let _c458: boolean = _c431;
              if (!_c458) {
                let _g432 = 0;
                G433: {
                  const _a434 = sp.adj8[v_c];
                  for (let _i435 = 0; _i435 < _a434.length; _i435++) {
                    const _t436 = sp.adj8Edges[v_c][_i435];
                    if (!((((b.grid[_t436] || -1) === 1) || (v_H.includes(_t436))))) continue;
                    _g432++;
                  }
                }
                let _c447: boolean = !((_g432 < takes(sp, cl, v_c)));
                if (_c447) {
                  let _q437 = true;
                  Q438: {
                    const _a440 = throughWhere(sp, v_c, (_te439: number): boolean => {  return (((b.grid[_te439] || -1) === 1) || (v_H.includes(_te439))); });
                    for (let _i441 = 0; _i441 < _a440.length; _i441++) {
                      const v_x = _a440[_i441];
                      let _g442 = 0;
                      G443: {
                        const _a444 = sp.adj8[v_x];
                        for (let _i445 = 0; _i445 < _a444.length; _i445++) {
                          const _t446 = sp.adj8Edges[v_x][_i445];
                          if (!((((b.grid[_t446] || -1) === 1) || (v_H.includes(_t446))))) continue;
                          _g442++;
                        }
                      }
                      if (!(!((_g442 < takes(sp, cl, v_x))))) {
                        _q437 = false;
                        break Q438;
                      }
                    }
                  }
                  _c447 = _q437;
                }
                let _c457: boolean = _c447;
                if (_c457) {
                  let _g448 = 0;
                  G449: {
                    const _a451 = throughWhere(sp, v_c, (_te450: number): boolean => {  return (((b.grid[_te450] || -1) === 1) || (v_H.includes(_te450))); });
                    for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                      const v_x = _a451[_i452];
                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                      _g448++;
                    }
                  }
                  let _g453 = 0;
                  G454: {
                    const _a455 = sp.cells;
                    for (let _i456 = 0; _i456 < _a455.length; _i456++) {
                      const v_y = _a455[_i456];
                      if (!((clueAt(cl.number, v_y) !== -1))) continue;
                      _g453++;
                    }
                  }
                  _c457 = (_g448 < _g453);
                }
                _c458 = _c457;
              }
              let _c541: boolean = _c458;
              if (!_c541) {
                let _q459 = false;
                Q460: {
                  const _a461 = v_U;
                  for (let _i462 = 0; _i462 < _a461.length; _i462++) {
                    const v_x = _a461[_i462];
                    if (!((v_x !== v_y))) continue;
                    let _q463 = false;
                    Q464: {
                      let _g465 = 0;
                      G466: {
                        const _a467 = sp.adj8[v_x];
                        for (let _i468 = 0; _i468 < _a467.length; _i468++) {
                          const _t469 = sp.adj8Edges[v_x][_i468];
                          if (!((((b.grid[_t469] || -1) === 1) || (v_H.includes(_t469))))) continue;
                          _g465++;
                        }
                      }
                      L470: {
                        const v_n = (takes(sp, cl, v_x) - _g465);
                        if (!((v_n > 0))) break L470;
                        let _g471 = 0;
                        G472: {
                          const _a473 = sp.adj8[v_x];
                          for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                            const v_y = _a473[_i474];
                            let _c481: boolean = (!((b.grid[sp.adj8Edges[v_x][_i474]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_x][_i474])));
                            if (_c481) {
                              let _g475 = 0;
                              G476: {
                                const _a478 = sp.adj8[v_y];
                                for (let _i479 = 0; _i479 < _a478.length; _i479++) {
                                  const _t480 = sp.adj8Edges[v_y][_i479];
                                  if (!((((b.grid[_t480] || -1) === 1) || (v_H.includes(_t480))))) continue;
                                  _g475++;
                                }
                              }
                              _c481 = (_g475 < takes(sp, cl, v_y));
                            }
                            let _c484: boolean = _c481;
                            if (_c484) {
                              let _c483: boolean = (sp.crossing[sp.adj8Edges[v_x][_i474]] !== -1);
                              if (_c483) {
                                const _t482 = sp.crossing[sp.adj8Edges[v_x][_i474]];
                                _c483 = (((b.grid[_t482] || -1) === 1) || (v_H.includes(_t482)));
                              }
                              _c484 = !(_c483);
                            }
                            if (!(_c484)) continue;
                            _g471++;
                          }
                        }
                        if ((_g471 < v_n)) {
                          _q463 = true;
                          break Q464;
                        }
                      }
                    }
                    let _c511: boolean = _q463;
                    if (!_c511) {
                      let _q485 = false;
                      Q486: {
                        const _a487 = sp.adj8[v_x];
                        for (let _i488 = 0; _i488 < _a487.length; _i488++) {
                          const v_s = _a487[_i488];
                          let _q489 = false;
                          Q490: {
                            let _g491 = 0;
                            G492: {
                              const _a493 = sp.adj8[v_s];
                              for (let _i494 = 0; _i494 < _a493.length; _i494++) {
                                const _t495 = sp.adj8Edges[v_s][_i494];
                                if (!((((b.grid[_t495] || -1) === 1) || (v_H.includes(_t495))))) continue;
                                _g491++;
                              }
                            }
                            L496: {
                              const v_n = (takes(sp, cl, v_s) - _g491);
                              if (!((v_n > 0))) break L496;
                              let _g497 = 0;
                              G498: {
                                const _a499 = sp.adj8[v_s];
                                for (let _i500 = 0; _i500 < _a499.length; _i500++) {
                                  const v_y = _a499[_i500];
                                  let _c507: boolean = (!((b.grid[sp.adj8Edges[v_s][_i500]] !== 0)) && !(v_H.includes(sp.adj8Edges[v_s][_i500])));
                                  if (_c507) {
                                    let _g501 = 0;
                                    G502: {
                                      const _a504 = sp.adj8[v_y];
                                      for (let _i505 = 0; _i505 < _a504.length; _i505++) {
                                        const _t506 = sp.adj8Edges[v_y][_i505];
                                        if (!((((b.grid[_t506] || -1) === 1) || (v_H.includes(_t506))))) continue;
                                        _g501++;
                                      }
                                    }
                                    _c507 = (_g501 < takes(sp, cl, v_y));
                                  }
                                  let _c510: boolean = _c507;
                                  if (_c510) {
                                    let _c509: boolean = (sp.crossing[sp.adj8Edges[v_s][_i500]] !== -1);
                                    if (_c509) {
                                      const _t508 = sp.crossing[sp.adj8Edges[v_s][_i500]];
                                      _c509 = (((b.grid[_t508] || -1) === 1) || (v_H.includes(_t508)));
                                    }
                                    _c510 = !(_c509);
                                  }
                                  if (!(_c510)) continue;
                                  _g497++;
                                }
                              }
                              if ((_g497 < v_n)) {
                                _q489 = true;
                                break Q490;
                              }
                            }
                          }
                          if (_q489) {
                            _q485 = true;
                            break Q486;
                          }
                        }
                      }
                      _c511 = _q485;
                    }
                    let _c540: boolean = _c511;
                    if (!_c540) {
                      let _g512 = 0;
                      G513: {
                        const _a514 = sp.adj8[v_x];
                        for (let _i515 = 0; _i515 < _a514.length; _i515++) {
                          const _t516 = sp.adj8Edges[v_x][_i515];
                          if (!((((b.grid[_t516] || -1) === 1) || (v_H.includes(_t516))))) continue;
                          _g512++;
                        }
                      }
                      let _c528: boolean = !((_g512 < takes(sp, cl, v_x)));
                      if (_c528) {
                        let _q517 = true;
                        Q518: {
                          const _a521 = throughWhere(sp, v_x, (_te520: number): boolean => {  return (((b.grid[_te520] || -1) === 1) || (v_H.includes(_te520))); });
                          for (let _i522 = 0; _i522 < _a521.length; _i522++) {
                            const v_x_519 = _a521[_i522];
                            let _g523 = 0;
                            G524: {
                              const _a525 = sp.adj8[v_x_519];
                              for (let _i526 = 0; _i526 < _a525.length; _i526++) {
                                const _t527 = sp.adj8Edges[v_x_519][_i526];
                                if (!((((b.grid[_t527] || -1) === 1) || (v_H.includes(_t527))))) continue;
                                _g523++;
                              }
                            }
                            if (!(!((_g523 < takes(sp, cl, v_x_519))))) {
                              _q517 = false;
                              break Q518;
                            }
                          }
                        }
                        _c528 = _q517;
                      }
                      let _c539: boolean = _c528;
                      if (_c539) {
                        let _g529 = 0;
                        G530: {
                          const _a533 = throughWhere(sp, v_x, (_te532: number): boolean => {  return (((b.grid[_te532] || -1) === 1) || (v_H.includes(_te532))); });
                          for (let _i534 = 0; _i534 < _a533.length; _i534++) {
                            const v_x_531 = _a533[_i534];
                            if (!((clueAt(cl.number, v_x_531) !== -1))) continue;
                            _g529++;
                          }
                        }
                        let _g535 = 0;
                        G536: {
                          const _a537 = sp.cells;
                          for (let _i538 = 0; _i538 < _a537.length; _i538++) {
                            const v_y = _a537[_i538];
                            if (!((clueAt(cl.number, v_y) !== -1))) continue;
                            _g535++;
                          }
                        }
                        _c539 = (_g529 < _g535);
                      }
                      _c540 = _c539;
                    }
                    if (_c540) {
                      _q459 = true;
                      break Q460;
                    }
                  }
                }
                _c541 = _q459;
              }
              _c542 = _c541;
            }
            freshBinding("spareBreaks", [(sp.cells.includes(v_c)), sameSet(v_U, ways(b, sp, cl, v_c)), ((_g372 < takes(sp, cl, v_c)) && (v_U.length === ((takes(sp, cl, v_c) - _g372) + 1))), (v_U.includes(v_y)), sameSet(v_H, _g376), _c542], ["c in", "U =", "where of U", "y in", "H =", "where of H"]);
          }
          facts.length = 0;
          changed = false;
          const _t543 = sp.edgeOf(v_c, v_y);
          if (!(b.grid[_t543] !== 0)) { if (fire === null) { b.placeAt(_t543, 1); changed = true; } else facts.push(PLACE, _t543, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U.slice(), y: v_y, H: v_H.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const takesKept = keptStore<number>();
let takesOn: object | null = null;
let takesAt: Kept<number> = [];

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== takesOn) {
    takesAt = takesKept.board(cl);
    takesOn = cl;
  }
  const _kept: Kept<number> = takesAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      const v_k = v_c;
      if (!((clueAt(cl.number, v_k) !== -1))) continue;
      _g1 += clueAt(cl.number, v_k);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a18 = sp.adj8[v_c];
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_y = _a18[_i19];
      let _c24: boolean = !((b.grid[sp.adj8Edges[v_c][_i19]] !== 0));
      if (_c24) {
        let _g20 = 0;
        G21: {
          const _a22 = sp.adj8[v_c];
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            if (!(((b.grid[sp.adj8Edges[v_c][_i23]] || -1) === 1))) continue;
            _g20++;
          }
        }
        _c24 = (_g20 < takes(sp, cl, v_c));
      }
      let _c30: boolean = _c24;
      if (_c30) {
        let _g25 = 0;
        G26: {
          const _a28 = sp.adj8[v_y];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            if (!(((b.grid[sp.adj8Edges[v_y][_i29]] || -1) === 1))) continue;
            _g25++;
          }
        }
        _c30 = (_g25 < takes(sp, cl, v_y));
      }
      let _c32: boolean = _c30;
      if (_c32) {
        const _t31 = sp.adj8Edges[v_c][_i19];
        _c32 = !(((sp.crossing[_t31] !== -1) && ((b.grid[sp.crossing[_t31]] || -1) === 1)));
      }
      if (!(_c32)) continue;
      _g1.push(v_y);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}
