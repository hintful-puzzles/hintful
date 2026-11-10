// Compiled by `npm run describe` from src/games/pegs/pegs.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["grid"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly grid: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface JumpMove {
  readonly move: "jump";
  readonly f: number;
  readonly o: number;
  readonly t: number;
}

/** A move: its name and its binding. */
export type Move = JumpMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "frozen";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["frozen"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    frozen: (p) => {
      const _fix13 = new Uint8Array(sp.cells.length);
      for (let _grew15 = true; _grew15; ) {
        _grew15 = false;
        for (let _c14 = 0; _c14 < sp.cells.length; _c14++) {
          if (_fix13[_c14] === 1) continue;
          let _c23: boolean = (p.grid[_c14] === 1);
          if (!_c23) {
            let _c22: boolean = (p.grid[_c14] === 0);
            if (_c22) {
              let _q16 = false;
              Q17: {
                const _a18 = sp.adj4[_c14];
                for (let _i19 = 0; _i19 < _a18.length; _i19++) {
                  const v_b = _a18[_i19];
                  const _t20 = ((2 * (v_b % sp.w)) - (_c14 % sp.w));
                  const _t21 = ((2 * ((v_b / sp.w) | 0)) - ((_c14 / sp.w) | 0));
                  if (!((_t20 >= 0 && _t20 < sp.w && _t21 >= 0 && _t21 < sp.h))) continue;
                  const v_a = (((2 * ((v_b / sp.w) | 0)) - ((_c14 / sp.w) | 0)) * sp.w + ((2 * (v_b % sp.w)) - (_c14 % sp.w)));
                  if (((_fix13[v_a] === 1) && (_fix13[v_b] === 1))) {
                    _q16 = true;
                    break Q17;
                  }
                }
              }
              _c22 = _q16;
            }
            _c23 = _c22;
          }
          if (_c23) {
            _fix13[_c14] = 1;
            _grew15 = true;
          }
        }
      }
      let _g1 = 0;
      G2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.grid[v_c] === 1))) continue;
          _g1++;
        }
      }
      let _c24: boolean = (_g1 > 1);
      if (_c24) {
        let _q5 = false;
        Q6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_p = _a7[_i8];
            if (!((p.grid[v_p] === 1))) continue;
            let _q9 = true;
            Q10: {
              const _a11 = sp.adj4[v_p];
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_q = _a11[_i12];
                if (!(!((_fix13[v_q] === 1)))) {
                  _q9 = false;
                  break Q10;
                }
              }
            }
            if (_q9) {
              _q5 = true;
              break Q6;
            }
          }
        }
        _c24 = _q5;
      }
      return _c24;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    frozen: (p) => {
      const _fix11 = new Uint8Array(sp.cells.length);
      for (let _grew13 = true; _grew13; ) {
        _grew13 = false;
        for (let _c12 = 0; _c12 < sp.cells.length; _c12++) {
          if (_fix11[_c12] === 1) continue;
          let _c21: boolean = (p.grid[_c12] === 1);
          if (!_c21) {
            let _c20: boolean = (p.grid[_c12] === 0);
            if (_c20) {
              let _q14 = false;
              Q15: {
                const _a16 = sp.adj4[_c12];
                for (let _i17 = 0; _i17 < _a16.length; _i17++) {
                  const v_b = _a16[_i17];
                  const _t18 = ((2 * (v_b % sp.w)) - (_c12 % sp.w));
                  const _t19 = ((2 * ((v_b / sp.w) | 0)) - ((_c12 / sp.w) | 0));
                  if (!((_t18 >= 0 && _t18 < sp.w && _t19 >= 0 && _t19 < sp.h))) continue;
                  const v_a = (((2 * ((v_b / sp.w) | 0)) - ((_c12 / sp.w) | 0)) * sp.w + ((2 * (v_b % sp.w)) - (_c12 % sp.w)));
                  if (((_fix11[v_a] === 1) && (_fix11[v_b] === 1))) {
                    _q14 = true;
                    break Q15;
                  }
                }
              }
              _c20 = _q14;
            }
            _c21 = _c20;
          }
          if (_c21) {
            _fix11[_c12] = 1;
            _grew13 = true;
          }
        }
      }
      const at: number[] = [];
      let _g1 = 0;
      G2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.grid[v_c] === 1))) continue;
          _g1++;
        }
      }
      if (!((_g1 > 1))) return at;
      const _a5 = sp.cells;
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_p = _a5[_i6];
        if (!((p.grid[v_p] === 1))) continue;
        let _q7 = true;
        Q8: {
          const _a9 = sp.adj4[v_p];
          for (let _i10 = 0; _i10 < _a9.length; _i10++) {
            const v_q = _a9[_i10];
            if (!(!((_fix11[v_q] === 1)))) {
              _q7 = false;
              break Q8;
            }
          }
        }
        if (_q7) at.push(v_p);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function jumpMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_f = _a1[_i2];
      if (!((p.grid[v_f] === 1))) continue;
      const _a3 = sp.adj4[v_f];
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_o = _a3[_i4];
        let _c7: boolean = (p.grid[v_o] === 1);
        if (_c7) {
          const _t5 = ((2 * (v_o % sp.w)) - (v_f % sp.w));
          const _t6 = ((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0));
          _c7 = (_t5 >= 0 && _t5 < sp.w && _t6 >= 0 && _t6 < sp.h);
        }
        if (!(_c7)) continue;
        L8: {
          const v_t = (((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_f % sp.w)));
          if (!((p.grid[v_t] === 0))) break L8;
          into.push({ move: "jump", f: v_f, o: v_o, t: v_t });
        }
      }
    }
  }

  function jumpLegal(p: Position, m: JumpMove): boolean {
    const v_f = m.f;
    const v_o = m.o;
    const v_t = m.t;
    if (!(Number.isInteger(v_f) && v_f >= 0 && v_f < sp.cells.length)) return false;
    if (!((p.grid[v_f] === 1))) return false;
    if (!sp.adj4[v_f].includes(v_o)) return false;
    let _c3: boolean = (p.grid[v_o] === 1);
    if (_c3) {
      const _t1 = ((2 * (v_o % sp.w)) - (v_f % sp.w));
      const _t2 = ((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0));
      _c3 = (_t1 >= 0 && _t1 < sp.w && _t2 >= 0 && _t2 < sp.h);
    }
    if (!(_c3)) return false;
    if (v_t !== (((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_f % sp.w)))) return false;
    if (!((p.grid[v_t] === 0))) return false;
    return true;
  }

  function jumpPlay(p: Position, m: JumpMove): Position {
    const v_f = m.f;
    const v_o = m.o;
    const v_t = m.t;
    const q: Position = { ...p, grid: p.grid.slice() };
    {
      const v_c = v_f;
      q.grid[v_c] = 0;
    }
    {
      const v_c = v_o;
      q.grid[v_c] = 0;
    }
    {
      const v_c = v_t;
      q.grid[v_c] = 1;
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _g1 = 0;
      G2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.grid[v_c] === 1))) continue;
          _g1++;
        }
      }
      if (!((_g1 === 1))) return false;
    }
    return true;
  }

  function lost(_p: Position): boolean {
    return false;
  }

  const holds = claims(sp, cl, variations);
  function deadEnd(p: Position): DeadEndId | null {
    for (const id of deadEnds) if (holds[id](p)) return id;
    return null;
  }
  const at = claimWitnesses(sp, cl, variations);

  return {
    moves: (p) => {
      const into: Move[] = [];
      jumpMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "jump": return jumpLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "jump": return jumpPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
