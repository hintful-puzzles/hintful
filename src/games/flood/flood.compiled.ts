// Compiled by `npm run describe` from src/games/flood/flood.description.yaml: edit that, not this.

import { type GridSpace, held, iadd, rangeMask } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["color","moves"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly color: Int32Array;
  readonly moves: Float64Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly colors: number;
  readonly limit: number;
}

export interface FillMove {
  readonly move: "fill";
  readonly k: number;
}

/** A move: its name and its binding. */
export type Move = FillMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "short";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["short"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    short: (p) => {
      const _fix8 = new Uint8Array(sp.cells.length);
      for (let _grew10 = true; _grew10; ) {
        _grew10 = false;
        for (let _c9 = 0; _c9 < sp.cells.length; _c9++) {
          if (_fix8[_c9] === 1) continue;
          let _c16: boolean = (_c9 === (0 * sp.w + 0));
          if (!_c16) {
            let _c15: boolean = (p.color[_c9] === p.color[(0 * sp.w + 0)]);
            if (_c15) {
              let _q11 = false;
              Q12: {
                const _a13 = sp.adj4[_c9];
                for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                  const v_n = _a13[_i14];
                  if ((_fix8[v_n] === 1)) {
                    _q11 = true;
                    break Q12;
                  }
                }
              }
              _c15 = _q11;
            }
            _c16 = _c15;
          }
          if (_c16) {
            _fix8[_c9] = 1;
            _grew10 = true;
          }
        }
      }
      let _g1 = 0;
      G2: {
        const _t3 = (cl.colors - 1);
        for (let v_k = 0; v_k <= _t3; v_k++) {
          let _q4 = false;
          Q5: {
            const _a6 = sp.cells;
            for (let _i7 = 0; _i7 < _a6.length; _i7++) {
              const v_c = _a6[_i7];
              if (!(!((_fix8[v_c] === 1)))) continue;
              if ((p.color[v_c] === v_k)) {
                _q4 = true;
                break Q5;
              }
            }
          }
          if (!(_q4)) continue;
          _g1++;
        }
      }
      return (iadd(p.moves[0], _g1) > cl.limit);
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    short: (_p) => {
      const at: number[] = [];
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function fillMoves(p: Position, into: Move[]): void {
    const _t1 = (cl.colors - 1);
    for (let v_k = 0; v_k <= _t1; v_k++) {
      if (!((v_k !== p.color[(0 * sp.w + 0)]))) continue;
      let _q2 = true;
      Q3: {
        const _a4 = sp.cells;
        for (let _i5 = 0; _i5 < _a4.length; _i5++) {
          const v_c = _a4[_i5];
          if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
            _q2 = false;
            break Q3;
          }
        }
      }
      if (!(_q2)) into.push({ move: "fill", k: v_k });
    }
  }

  function fillLegal(p: Position, m: FillMove): boolean {
    const v_k = m.k;
    if (!(Number.isInteger(v_k) && v_k >= 0 && v_k < 31 && ((rangeMask(0, (cl.colors - 1)) >> v_k) & 1) !== 0)) return false;
    if (!((v_k !== p.color[(0 * sp.w + 0)]))) return false;
    let _q1 = true;
    Q2: {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_c = _a3[_i4];
        if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
          _q1 = false;
          break Q2;
        }
      }
    }
    return !(_q1);
  }

  function fillPlay(p: Position, m: FillMove): Position {
    const v_k = m.k;
    const _fix3 = new Uint8Array(sp.cells.length);
    for (let _grew5 = true; _grew5; ) {
      _grew5 = false;
      for (let _c4 = 0; _c4 < sp.cells.length; _c4++) {
        if (_fix3[_c4] === 1) continue;
        let _c11: boolean = (_c4 === (0 * sp.w + 0));
        if (!_c11) {
          let _c10: boolean = (p.color[_c4] === p.color[(0 * sp.w + 0)]);
          if (_c10) {
            let _q6 = false;
            Q7: {
              const _a8 = sp.adj4[_c4];
              for (let _i9 = 0; _i9 < _a8.length; _i9++) {
                const v_n = _a8[_i9];
                if ((_fix3[v_n] === 1)) {
                  _q6 = true;
                  break Q7;
                }
              }
            }
            _c10 = _q6;
          }
          _c11 = _c10;
        }
        if (_c11) {
          _fix3[_c4] = 1;
          _grew5 = true;
        }
      }
    }
    const q: Position = { ...p, color: p.color.slice(), moves: p.moves.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((_fix3[v_c] === 1))) continue;
        q.color[v_c] = v_k;
      }
    }
    {
      q.moves[0] = held(iadd(p.moves[0], 1));
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      if (!(_q1)) return false;
    }
    {
      if (!((p.moves[0] <= cl.limit))) return false;
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
      fillMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "fill": return fillLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "fill": return fillPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
