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
      let _q20 = false;
      Q21: {
        const _a22 = sp.cells;
        for (let _i23 = 0; _i23 < _a22.length; _i23++) {
          const v_g = _a22[_i23];
          if (!((p.value[v_g] === 0))) continue;
          let _g24 = 0;
          G25: {
            const _a26 = sp.cells;
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_a = _a26[_i27];
              const _a28 = sp.cells;
              for (let _i29 = 0; _i29 < _a28.length; _i29++) {
                const v_b = _a28[_i29];
                if (!(((_i27 < _i29) && (p.value[v_a] > p.value[v_b])))) continue;
                _g24++;
              }
            }
          }
          if (((((_g24 + ((sp.w - 1) - (v_g % sp.w))) + ((sp.h - 1) - ((v_g / sp.w) | 0))) % 2) !== ((sp.cells.length - 1) % 2))) {
            _q20 = true;
            break Q21;
          }
        }
      }
      return _q20;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    parity: (p) => {
      const at: number[] = [];
      const _a30 = sp.cells;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_g = _a30[_i31];
        if (!((p.value[v_g] === 0))) continue;
        let _g32 = 0;
        G33: {
          const _a34 = sp.cells;
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_a = _a34[_i35];
            const _a36 = sp.cells;
            for (let _i37 = 0; _i37 < _a36.length; _i37++) {
              const v_b = _a36[_i37];
              if (!(((_i35 < _i37) && (p.value[v_a] > p.value[v_b])))) continue;
              _g32++;
            }
          }
        }
        if (((((_g32 + ((sp.w - 1) - (v_g % sp.w))) + ((sp.h - 1) - ((v_g / sp.w) | 0))) % 2) !== ((sp.cells.length - 1) % 2))) at.push(v_g);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function slideMoves(p: Position, into: Move[]): void {
    const _a5 = sp.cells;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_g = _a5[_i6];
      if (!((p.value[v_g] === 0))) continue;
      const _a7 = sp.cells;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_t = _a7[_i8];
        if (!(((v_t !== v_g) && (((v_t % sp.w) === (v_g % sp.w)) || (((v_t / sp.w) | 0) === ((v_g / sp.w) | 0)))))) continue;
        into.push({ move: "slide", g: v_g, t: v_t });
      }
    }
  }

  function slideLegal(p: Position, m: SlideMove): boolean {
    const v_g = m.g;
    const v_t = m.t;
    if (!(v_g >= 0 && v_g < sp.cells.length)) return false;
    if (!((p.value[v_g] === 0))) return false;
    if (!(v_t >= 0 && v_t < sp.cells.length)) return false;
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
      const _a9 = sp.cells;
      for (let _i10 = 0; _i10 < _a9.length; _i10++) {
        const v_c = _a9[_i10];
        if (!(((v_c !== v_t) && (((Math.abs(((v_g % sp.w) - (v_c % sp.w))) + Math.abs((((v_g / sp.w) | 0) - ((v_c / sp.w) | 0)))) + (Math.abs(((v_c % sp.w) - (v_t % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((v_t / sp.w) | 0))))) === (Math.abs(((v_g % sp.w) - (v_t % sp.w))) + Math.abs((((v_g / sp.w) | 0) - ((v_t / sp.w) | 0)))))))) continue;
        let _g11 = -1;
        let _n13 = 0;
        G12: {
          const _a14 = sp.adj4[v_c];
          for (let _i15 = 0; _i15 < _a14.length; _i15++) {
            const v_d = _a14[_i15];
            if (!(((Math.abs(((v_d % sp.w) - (v_t % sp.w))) + Math.abs((((v_d / sp.w) | 0) - ((v_t / sp.w) | 0)))) < (Math.abs(((v_c % sp.w) - (v_t % sp.w))) + Math.abs((((v_c / sp.w) | 0) - ((v_t / sp.w) | 0))))))) continue;
            if (++_n13 === 2) {
              _g11 = -1;
              break G12;
            }
            _g11 = v_d;
          }
        }
        q.value[v_c] = p.value[_g11];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q16 = true;
      Q17: {
        const _a18 = sp.cells;
        for (let _i19 = 0; _i19 < _a18.length; _i19++) {
          const v_c = _a18[_i19];
          if (!((p.value[v_c] === ((_i19 + 1) % sp.cells.length)))) {
            _q16 = false;
            break Q17;
          }
        }
      }
      if (!(_q16)) return false;
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
