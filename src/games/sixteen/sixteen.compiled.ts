// Compiled by `npm run describe` from src/games/sixteen/sixteen.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["value"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly value: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface SlideMove {
  readonly move: "slide";
  readonly L: number;
  readonly t: number;
  readonly k: number;
}

/** A move: its name and its binding. */
export type Move = SlideMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "parity";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["parity"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    parity: (p) => {
      let _c21 = (((sp.w % 2) === 1) && ((sp.h % 2) === 1));
      if (_c21) {
        let _g15 = 0;
        G16: {
          const _a17 = sp.cells;
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_a = _a17[_i18];
            const _a19 = sp.cells;
            for (let _i20 = 0; _i20 < _a19.length; _i20++) {
              const v_b = _a19[_i20];
              if (!(((_i18 < _i20) && (p.value[v_a] > p.value[v_b])))) continue;
              _g15++;
            }
          }
        }
        _c21 = ((_g15 % 2) === 1);
      }
      return _c21;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    parity: (_p) => {
      const at: number[] = [];
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
      const _a7 = sp.lineCells[v_L];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_t = _a7[_i8];
        if (!((_i8 > 0))) continue;
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
    if (!sp.lineCells[v_L].includes(v_t)) return false;
    if (!((sp.lineCells[v_L].indexOf(v_t) > 0))) return false;
    if (v_k !== sp.lineCells[v_L].indexOf(v_t)) return false;
    return true;
  }

  function slidePlay(p: Position, m: SlideMove): Position {
    const v_L = m.L;
    const v_k = m.k;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const _a9 = sp.lineCells[v_L];
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_c = _a9[_i10];
        q.value[v_c] = p.value[(sp.lineCells[v_L][(((_i10 - v_k) + sp.lineCells[v_L].length) % sp.lineCells[v_L].length)] ?? -1)];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q11 = true;
      Q12: {
        const _a13 = sp.cells;
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_c = _a13[_i14];
          if (!((p.value[v_c] === (_i14 + 1)))) {
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
