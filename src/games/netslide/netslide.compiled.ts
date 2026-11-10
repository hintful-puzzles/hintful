// Compiled by `npm run describe` from src/games/netslide/netslide.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["tile"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly tile: Int32Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly beyond: readonly (readonly number[])[];
}

export interface SlideMove {
  readonly move: "slide";
  readonly L: number;
  readonly t: number;
  readonly k: number;
}

/** A move: its name and its binding. */
export type Move = SlideMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "bare" | "short";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["bare", "short"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    bare: (p) => {
      let _c5: boolean = (sp.cells.length > 1);
      if (_c5) {
        let _q1 = false;
        Q2: {
          const _a3 = sp.cells;
          for (let _i4 = 0; _i4 < _a3.length; _i4++) {
            const v_c = _a3[_i4];
            if ((p.tile[v_c] === 0)) {
              _q1 = true;
              break Q2;
            }
          }
        }
        _c5 = _q1;
      }
      return _c5;
    },
    short: (p) => {
      let _g1 = 0;
      G2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          let _g5 = 0;
          G6: {
            for (let _m7 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m7 !== 0; _m7 &= _m7 - 1) {
              const v_k = 31 - Math.clz32(_m7 & -_m7);
              if (!(((Math.trunc(p.tile[v_c] / v_k) % 2) === 1))) continue;
              _g5++;
            }
          }
          _g1 += _g5;
        }
      }
      return (_g1 < (2 * (sp.cells.length - 1)));
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    bare: (p) => {
      const at: number[] = [];
      if (!((sp.cells.length > 1))) return at;
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if ((p.tile[v_c] === 0)) at.push(v_c);
      }
      return at;
    },
    short: (_p) => {
      const at: number[] = [];
      return at;
    },
  };
}

/** The definitions the game reads beside the rules, each giving the
 * cells it holds of for values of its other parameters. */
export function views(sp: GridSpace, cl: Dealt, _variations: readonly string[]): {
  readonly powered: (p: Position) => number[];
} {
  return {
    powered: (p) => {
      const _fix2 = new Uint8Array(sp.cells.length);
      for (let _grew4 = true; _grew4; ) {
        _grew4 = false;
        for (let _c3 = 0; _c3 < sp.cells.length; _c3++) {
          if (_fix2[_c3] === 1) continue;
          let _c11: boolean = (_c3 === (Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)));
          if (!_c11) {
            let _q5 = false;
            Q6: {
              for (let _m7 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m7 !== 0; _m7 &= _m7 - 1) {
                const v_k = 31 - Math.clz32(_m7 & -_m7);
                L8: {
                  const v_n = cl.beyond[_c3][v_k];
                  let _c10: boolean = ((v_n !== -1) && ((Math.trunc(p.tile[_c3] / v_k) % 2) === 1));
                  if (_c10) {
                    const _t9 = ((4 * v_k) % 15);
                    _c10 = ((Math.trunc(p.tile[v_n] / _t9) % 2) === 1);
                  }
                  if (!(_c10)) break L8;
                  if ((_fix2[v_n] === 1)) {
                    _q5 = true;
                    break Q6;
                  }
                }
              }
            }
            _c11 = _q5;
          }
          if (_c11) {
            _fix2[_c3] = 1;
            _grew4 = true;
          }
        }
      }
      const at: number[] = [];
      for (let _c1 = 0; _c1 < sp.cells.length; _c1++) {
        if ((_fix2[_c1] === 1)) at.push(_c1);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function slideMoves(_p: Position, into: Move[]): void {
    const _a1 = sp.lines;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_L = _a1[_i2];
      if (!(!(sp.lineCells[v_L].includes((Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)))))) continue;
      const _a3 = sp.lineCells[v_L];
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_t = _a3[_i4];
        if (!(((_i4 === 1) || (_i4 === (sp.lineCells[v_L].length - 1))))) continue;
        const v_k = _i4;
        into.push({ move: "slide", L: v_L, t: v_t, k: v_k });
      }
    }
  }

  function slideLegal(_p: Position, m: SlideMove): boolean {
    const v_L = m.L;
    const v_t = m.t;
    const v_k = m.k;
    if (!(Number.isInteger(v_L) && v_L >= 0 && v_L < sp.lines.length)) return false;
    if (!(!(sp.lineCells[v_L].includes((Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)))))) return false;
    if (!sp.lineCells[v_L].includes(v_t)) return false;
    if (!(((sp.lineCells[v_L].indexOf(v_t) === 1) || (sp.lineCells[v_L].indexOf(v_t) === (sp.lineCells[v_L].length - 1))))) return false;
    if (v_k !== sp.lineCells[v_L].indexOf(v_t)) return false;
    return true;
  }

  function slidePlay(p: Position, m: SlideMove): Position {
    const v_L = m.L;
    const v_k = m.k;
    const q: Position = { ...p, tile: p.tile.slice() };
    {
      const _a1 = sp.lineCells[v_L];
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        q.tile[v_c] = p.tile[(sp.lineCells[v_L][(((_i2 - v_k) + sp.lineCells[v_L].length) % sp.lineCells[v_L].length)] ?? -1)];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    const _fix5 = new Uint8Array(sp.cells.length);
    for (let _grew7 = true; _grew7; ) {
      _grew7 = false;
      for (let _c6 = 0; _c6 < sp.cells.length; _c6++) {
        if (_fix5[_c6] === 1) continue;
        let _c14: boolean = (_c6 === (Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)));
        if (!_c14) {
          let _q8 = false;
          Q9: {
            for (let _m10 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m10 !== 0; _m10 &= _m10 - 1) {
              const v_k = 31 - Math.clz32(_m10 & -_m10);
              L11: {
                const v_n = cl.beyond[_c6][v_k];
                let _c13: boolean = ((v_n !== -1) && ((Math.trunc(p.tile[_c6] / v_k) % 2) === 1));
                if (_c13) {
                  const _t12 = ((4 * v_k) % 15);
                  _c13 = ((Math.trunc(p.tile[v_n] / _t12) % 2) === 1);
                }
                if (!(_c13)) break L11;
                if ((_fix5[v_n] === 1)) {
                  _q8 = true;
                  break Q9;
                }
              }
            }
          }
          _c14 = _q8;
        }
        if (_c14) {
          _fix5[_c6] = 1;
          _grew7 = true;
        }
      }
    }
    {
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((_fix5[v_c] === 1))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      if (!(_q1)) return false;
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
      slideMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "slide": return slideLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "slide": return slidePlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
