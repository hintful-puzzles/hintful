// Compiled by `npm run describe` from src/games/flood/flood.description.yaml: edit that, not this.

import { type GridSpace, held, rangeMask } from "../../engine/describe-runtime.ts";
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
      const _fix33 = new Uint8Array(sp.cells.length);
      for (let _grew35 = true; _grew35; ) {
        _grew35 = false;
        for (let _c34 = 0; _c34 < sp.cells.length; _c34++) {
          if (_fix33[_c34] === 1) continue;
          let _c41 = (_c34 === (0 * sp.w + 0));
          if (!_c41) {
            let _c40 = (p.color[_c34] === p.color[(0 * sp.w + 0)]);
            if (_c40) {
              let _q36 = false;
              Q37: {
                const _a38 = sp.adj4[_c34];
                for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                  const v_n = _a38[_i39];
                  if ((_fix33[v_n] === 1)) {
                    _q36 = true;
                    break Q37;
                  }
                }
              }
              _c40 = _q36;
            }
            _c41 = _c40;
          }
          if (_c41) {
            _fix33[_c34] = 1;
            _grew35 = true;
          }
        }
      }
      let _g26 = 0;
      G27: {
        for (let _m28 = rangeMask(0, (cl.colors - 1)); _m28 !== 0; _m28 &= _m28 - 1) {
          const v_k = 31 - Math.clz32(_m28 & -_m28);
          let _q29 = false;
          Q30: {
            const _a31 = sp.cells;
            for (let _i32 = 0; _i32 < _a31.length; _i32++) {
              const v_c = _a31[_i32];
              if (!(!((_fix33[v_c] === 1)))) continue;
              if ((p.color[v_c] === v_k)) {
                _q29 = true;
                break Q30;
              }
            }
          }
          if (!(_q29)) continue;
          _g26++;
        }
      }
      return ((BigInt(p.moves[0]) + BigInt(_g26)) > BigInt(cl.limit));
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
    for (let _m2 = rangeMask(0, (cl.colors - 1)); _m2 !== 0; _m2 &= _m2 - 1) {
      const v_k = 31 - Math.clz32(_m2 & -_m2);
      if (!((v_k !== p.color[(0 * sp.w + 0)]))) continue;
      let _q3 = true;
      Q4: {
        const _a5 = sp.cells;
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_c = _a5[_i6];
          if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
            _q3 = false;
            break Q4;
          }
        }
      }
      if (!(_q3)) into.push({ move: "fill", k: v_k });
    }
  }

  function fillLegal(p: Position, m: FillMove): boolean {
    const v_k = m.k;
    if (!(v_k >= 0 && v_k < 31 && ((rangeMask(0, (cl.colors - 1)) >> v_k) & 1) !== 0)) return false;
    if (!((v_k !== p.color[(0 * sp.w + 0)]))) return false;
    let _q7 = true;
    Q8: {
      const _a9 = sp.cells;
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_c = _a9[_i10];
        if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
          _q7 = false;
          break Q8;
        }
      }
    }
    return !(_q7);
  }

  function fillPlay(p: Position, m: FillMove): Position {
    const v_k = m.k;
    const _fix13 = new Uint8Array(sp.cells.length);
    for (let _grew15 = true; _grew15; ) {
      _grew15 = false;
      for (let _c14 = 0; _c14 < sp.cells.length; _c14++) {
        if (_fix13[_c14] === 1) continue;
        let _c21 = (_c14 === (0 * sp.w + 0));
        if (!_c21) {
          let _c20 = (p.color[_c14] === p.color[(0 * sp.w + 0)]);
          if (_c20) {
            let _q16 = false;
            Q17: {
              const _a18 = sp.adj4[_c14];
              for (let _i19 = 0; _i19 < _a18.length; _i19++) {
                const v_n = _a18[_i19];
                if ((_fix13[v_n] === 1)) {
                  _q16 = true;
                  break Q17;
                }
              }
            }
            _c20 = _q16;
          }
          _c21 = _c20;
        }
        if (_c21) {
          _fix13[_c14] = 1;
          _grew15 = true;
        }
      }
    }
    const q: Position = { ...p, color: p.color.slice(), moves: p.moves.slice() };
    {
      const _a11 = sp.cells;
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_c = _a11[_i12];
        if (!((_fix13[v_c] === 1))) continue;
        q.color[v_c] = v_k;
      }
    }
    {
      q.moves[0] = held((BigInt(p.moves[0]) + 1n));
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q22 = true;
      Q23: {
        const _a24 = sp.cells;
        for (let _i25 = 0; _i25 < _a24.length; _i25++) {
          const v_c = _a24[_i25];
          if (!((p.color[v_c] === p.color[(0 * sp.w + 0)]))) {
            _q22 = false;
            break Q23;
          }
        }
      }
      if (!(_q22)) return false;
    }
    {
      if (!((BigInt(p.moves[0]) <= BigInt(cl.limit)))) return false;
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
