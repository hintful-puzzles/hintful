// Compiled by `npm run describe` from src/games/fifteen/fifteen.description.yaml: edit that, not this.

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
  readonly g: number;
  readonly t: number;
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
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_g = _a3[_i4];
          if (!((p.value[v_g] === 0))) continue;
          let _g5 = 0;
          G6: {
            const _a7 = sp.cells;
            for (let _i8 = 0; _i8 < _a7.length; _i8++) {
              const v_a = _a7[_i8];
              const _a9 = sp.cells;
              for (let _i10 = 0; _i10 < _a9.length; _i10++) {
                const v_b = _a9[_i10];
                if (!(((_i8 < _i10) && (p.value[v_a] > p.value[v_b])))) continue;
                _g5++;
              }
            }
          }
          if (((((_g5 + ((sp.w - 1) - (v_g % sp.w))) + ((sp.h - 1) - ((v_g / sp.w) | 0))) % 2) !== ((sp.cells.length - 1) % 2))) {
            _q1 = true;
            break Q2;
          }
        }
      }
      return _q1;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    parity: (p) => {
      const at: number[] = [];
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_g = _a1[_i2];
        if (!((p.value[v_g] === 0))) continue;
        let _g3 = 0;
        G4: {
          const _a5 = sp.cells;
          for (let _i6 = 0; _i6 < _a5.length; _i6++) {
            const v_a = _a5[_i6];
            const _a7 = sp.cells;
            for (let _i8 = 0; _i8 < _a7.length; _i8++) {
              const v_b = _a7[_i8];
              if (!(((_i6 < _i8) && (p.value[v_a] > p.value[v_b])))) continue;
              _g3++;
            }
          }
        }
        if (((((_g3 + ((sp.w - 1) - (v_g % sp.w))) + ((sp.h - 1) - ((v_g / sp.w) | 0))) % 2) !== ((sp.cells.length - 1) % 2))) at.push(v_g);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function slideMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_g = _a1[_i2];
      if (!((p.value[v_g] === 0))) continue;
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_t = _a3[_i4];
        if (!(((v_t !== v_g) && (((v_t % sp.w) === (v_g % sp.w)) || (((v_t / sp.w) | 0) === ((v_g / sp.w) | 0)))))) continue;
        into.push({ move: "slide", g: v_g, t: v_t });
      }
    }
  }

  function slideLegal(p: Position, m: SlideMove): boolean {
    const v_g = m.g;
    const v_t = m.t;
    if (!(Number.isInteger(v_g) && v_g >= 0 && v_g < sp.cells.length)) return false;
    if (!((p.value[v_g] === 0))) return false;
    if (!(Number.isInteger(v_t) && v_t >= 0 && v_t < sp.cells.length)) return false;
    if (!(((v_t !== v_g) && (((v_t % sp.w) === (v_g % sp.w)) || (((v_t / sp.w) | 0) === ((v_g / sp.w) | 0)))))) return false;
    return true;
  }

  function slidePlay(p: Position, m: SlideMove): Position {
    const v_g = m.g;
    const v_t = m.t;
    const q: Position = { ...p, value: p.value.slice() };
    {
      const v_c = v_t;
      q.value[v_c] = 0;
    }
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!(((v_c !== v_t) && (((Math.abs(((v_g % sp.w) - (v_c % sp.w))) + Math.abs((((v_g / sp.w) | 0) - ((v_c / sp.w) | 0)))) + (Math.abs(((v_c % sp.w) - (v_t % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((v_t / sp.w) | 0))))) === (Math.abs(((v_g % sp.w) - (v_t % sp.w))) + Math.abs((((v_g / sp.w) | 0) - ((v_t / sp.w) | 0)))))))) continue;
        let _g3 = -1;
        let _n5 = 0;
        G4: {
          const _a6 = sp.adj4[v_c];
          for (let _i7 = 0; _i7 < _a6.length; _i7++) {
            const v_d = _a6[_i7];
            if (!(((Math.abs(((v_d % sp.w) - (v_t % sp.w))) + Math.abs((((v_d / sp.w) | 0) - ((v_t / sp.w) | 0)))) < (Math.abs(((v_c % sp.w) - (v_t % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((v_t / sp.w) | 0))))))) continue;
            if (++_n5 === 2) {
              _g3 = -1;
              break G4;
            }
            _g3 = v_d;
          }
        }
        q.value[v_c] = p.value[_g3];
      }
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
          if (!((p.value[v_c] === ((_i4 + 1) % sp.cells.length)))) {
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
