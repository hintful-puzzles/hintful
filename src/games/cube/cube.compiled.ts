// Compiled by `npm run describe` from src/games/cube/cube.description.yaml: edit that, not this.

import { type GridSpace, facesOf } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["blue","at","paint"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly blue: Int32Array;
  readonly at: Int32Array;
  readonly paint: Int32Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly nfaces: number;
  readonly dest: readonly (readonly number[])[];
  readonly source: readonly (readonly (readonly number[])[])[];
  readonly down: number;
}

export interface RollMove {
  readonly move: "roll";
  readonly s: number;
  readonly r: number;
}

/** A move: its name and its binding. */
export type Move = RollMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "short";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["short"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    short: (p) => {
      let _g28 = 0;
      G29: {
        const _a30 = sp.cells;
        for (let _i31 = 0; _i31 < _a30.length; _i31++) {
          const v_c = _a30[_i31];
          if (!((p.blue[v_c] === 1))) continue;
          _g28++;
        }
      }
      let _g32 = 0;
      G33: {
        const _a34 = facesOf(cl.nfaces);
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_f = _a34[_i35];
          if (!((p.paint[v_f] === 1))) continue;
          _g32++;
        }
      }
      return ((_g28 + _g32) < facesOf(cl.nfaces).length);
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
  function rollMoves(p: Position, into: Move[]): void {
    const _a4 = sp.cells;
    for (let _i5 = 0; _i5 < _a4.length; _i5++) {
      const v_s = _a4[_i5];
      if (!((p.at[v_s] === 1))) continue;
      for (let _m6 = ((1 << 0) | (1 << 1) | (1 << 2) | (1 << 3)); _m6 !== 0; _m6 &= _m6 - 1) {
        const v_r = 31 - Math.clz32(_m6 & -_m6);
        if (!((cl.dest[v_s][v_r] !== -1))) continue;
        into.push({ move: "roll", s: v_s, r: v_r });
      }
    }
  }

  function rollLegal(p: Position, m: RollMove): boolean {
    const v_s = m.s;
    const v_r = m.r;
    if (!(Number.isInteger(v_s) && v_s >= 0 && v_s < sp.cells.length)) return false;
    if (!((p.at[v_s] === 1))) return false;
    if (!(Number.isInteger(v_r) && v_r >= 0 && v_r < 31 && ((((1 << 0) | (1 << 1) | (1 << 2) | (1 << 3)) >> v_r) & 1) !== 0)) return false;
    if (!((cl.dest[v_s][v_r] !== -1))) return false;
    return true;
  }

  function rollPlay(p: Position, m: RollMove): Position {
    const v_s = m.s;
    const v_r = m.r;
    const q: Position = { ...p, blue: p.blue.slice(), at: p.at.slice(), paint: p.paint.slice() };
    {
      const v_c = v_s;
      q.at[v_c] = 0;
    }
    {
      const v_c = cl.dest[v_s][v_r];
      q.at[v_c] = 1;
    }
    {
      const _a7 = facesOf(cl.nfaces);
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_f = _a7[_i8];
        let _c13 = (v_f !== cl.down);
        if (!_c13) {
          let _q9 = true;
          Q10: {
            const _a11 = facesOf(cl.nfaces);
            for (let _i12 = 0; _i12 < _a11.length; _i12++) {
              const v_f = _a11[_i12];
              if (!((p.paint[v_f] === 1))) {
                _q9 = false;
                break Q10;
              }
            }
          }
          _c13 = _q9;
        }
        if (!(_c13)) continue;
        q.paint[v_f] = p.paint[cl.source[v_s][v_r][v_f]];
      }
    }
    {
      L14: {
        const v_f = cl.down;
        let _q15 = true;
        Q16: {
          const _a17 = facesOf(cl.nfaces);
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_f = _a17[_i18];
            if (!((p.paint[v_f] === 1))) {
              _q15 = false;
              break Q16;
            }
          }
        }
        if (!(!(_q15))) break L14;
        q.paint[v_f] = p.blue[cl.dest[v_s][v_r]];
      }
    }
    {
      L19: {
        const v_c = cl.dest[v_s][v_r];
        let _q20 = true;
        Q21: {
          const _a22 = facesOf(cl.nfaces);
          for (let _i23 = 0; _i23 < _a22.length; _i23++) {
            const v_f = _a22[_i23];
            if (!((p.paint[v_f] === 1))) {
              _q20 = false;
              break Q21;
            }
          }
        }
        if (!(!(_q20))) break L19;
        q.blue[v_c] = p.paint[cl.source[v_s][v_r][cl.down]];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q24 = true;
      Q25: {
        const _a26 = facesOf(cl.nfaces);
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_f = _a26[_i27];
          if (!((p.paint[v_f] === 1))) {
            _q24 = false;
            break Q25;
          }
        }
      }
      if (!(_q24)) return false;
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
      rollMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "roll": return rollLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "roll": return rollPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
