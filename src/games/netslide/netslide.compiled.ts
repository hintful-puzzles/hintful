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
      let _c29 = (sp.cells.length > 1);
      if (_c29) {
        let _q25 = false;
        Q26: {
          const _a27 = sp.cells;
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_c = _a27[_i28];
            if ((p.tile[v_c] === 0)) {
              _q25 = true;
              break Q26;
            }
          }
        }
        _c29 = _q25;
      }
      return _c29;
    },
    short: (p) => {
      let _g30 = 0;
      G31: {
        const _a32 = sp.cells;
        for (let _i33 = 0; _i33 < _a32.length; _i33++) {
          const v_c = _a32[_i33];
          let _g34 = 0;
          G35: {
            for (let _m36 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m36 !== 0; _m36 &= _m36 - 1) {
              const v_k = 31 - Math.clz32(_m36 & -_m36);
              if (!(((Math.trunc(p.tile[v_c] / v_k) % 2) === 1))) continue;
              _g34++;
            }
          }
          _g30 += _g34;
        }
      }
      return (_g30 < (2 * (sp.cells.length - 1)));
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
      const _a37 = sp.cells;
      for (let _i38 = 0; _i38 < _a37.length; _i38++) {
        const v_c = _a37[_i38];
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
      const _fix40 = new Uint8Array(sp.cells.length);
      for (let _grew42 = true; _grew42; ) {
        _grew42 = false;
        for (let _c41 = 0; _c41 < sp.cells.length; _c41++) {
          if (_fix40[_c41] === 1) continue;
          let _c49 = (_c41 === (Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)));
          if (!_c49) {
            let _q43 = false;
            Q44: {
              for (let _m45 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m45 !== 0; _m45 &= _m45 - 1) {
                const v_k = 31 - Math.clz32(_m45 & -_m45);
                L46: {
                  const v_n = cl.beyond[_c41][v_k];
                  let _c48 = ((v_n !== -1) && ((Math.trunc(p.tile[_c41] / v_k) % 2) === 1));
                  if (_c48) {
                    const _t47 = ((4 * v_k) % 15);
                    _c48 = ((Math.trunc(p.tile[v_n] / _t47) % 2) === 1);
                  }
                  if (!(_c48)) break L46;
                  if ((_fix40[v_n] === 1)) {
                    _q43 = true;
                    break Q44;
                  }
                }
              }
            }
            _c49 = _q43;
          }
          if (_c49) {
            _fix40[_c41] = 1;
            _grew42 = true;
          }
        }
      }
      const at: number[] = [];
      for (let _c39 = 0; _c39 < sp.cells.length; _c39++) {
        if ((_fix40[_c39] === 1)) at.push(_c39);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function slideMoves(_p: Position, into: Move[]): void {
    const _a5 = sp.lines;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_L = _a5[_i6];
      if (!(!(sp.lineCells[v_L].includes((Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)))))) continue;
      const _a7 = sp.lineCells[v_L];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_t = _a7[_i8];
        if (!(((_i8 === 1) || (_i8 === (sp.lineCells[v_L].length - 1))))) continue;
        const v_k = _i8;
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
      const _a9 = sp.lineCells[v_L];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_c = _a9[_i10];
        q.tile[v_c] = p.tile[(sp.lineCells[v_L][(((_i10 - v_k) + sp.lineCells[v_L].length) % sp.lineCells[v_L].length)] ?? -1)];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    const _fix15 = new Uint8Array(sp.cells.length);
    for (let _grew17 = true; _grew17; ) {
      _grew17 = false;
      for (let _c16 = 0; _c16 < sp.cells.length; _c16++) {
        if (_fix15[_c16] === 1) continue;
        let _c24 = (_c16 === (Math.trunc(sp.h / 2) * sp.w + Math.trunc(sp.w / 2)));
        if (!_c24) {
          let _q18 = false;
          Q19: {
            for (let _m20 = ((1 << 1) | (1 << 2) | (1 << 4) | (1 << 8)); _m20 !== 0; _m20 &= _m20 - 1) {
              const v_k = 31 - Math.clz32(_m20 & -_m20);
              L21: {
                const v_n = cl.beyond[_c16][v_k];
                let _c23 = ((v_n !== -1) && ((Math.trunc(p.tile[_c16] / v_k) % 2) === 1));
                if (_c23) {
                  const _t22 = ((4 * v_k) % 15);
                  _c23 = ((Math.trunc(p.tile[v_n] / _t22) % 2) === 1);
                }
                if (!(_c23)) break L21;
                if ((_fix15[v_n] === 1)) {
                  _q18 = true;
                  break Q19;
                }
              }
            }
          }
          _c24 = _q18;
        }
        if (_c24) {
          _fix15[_c16] = 1;
          _grew17 = true;
        }
      }
    }
    {
      let _q11 = true;
      Q12: {
        const _a13 = sp.cells;
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_c = _a13[_i14];
          if (!((_fix15[v_c] === 1))) {
            _q11 = false;
            break Q12;
          }
        }
      }
      if (!(_q11)) return false;
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
