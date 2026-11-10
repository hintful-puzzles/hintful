// Compiled by `npm run describe` from src/games/twiddle/twiddle.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["value","turn"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly value: Int32Array;
  readonly turn: Int32Array;
};

/** What the rules read that the grid does not give: sizes,
 * relations, a set of cells for each cell, and tables, an element
 * (`-1` for none) for each of their arguments, outermost first. */
export interface Dealt {
  readonly n: number;
}

export interface AnticlockwiseMove {
  readonly move: "anticlockwise";
  readonly b: number;
}

export interface ClockwiseMove {
  readonly move: "clockwise";
  readonly b: number;
}

/** A move: its name and its binding. */
export type Move = AnticlockwiseMove | ClockwiseMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "colorOdd" | "parity" | "colorTurned" | "turnSum";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["colorOdd", "parity", "colorTurned", "turnSum"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, cl: Dealt, variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    colorOdd: (p) => {
      let _c22: boolean = ((cl.n % 2) === 1);
      if (_c22) {
        let _q1 = false;
        Q2: {
          const _a3 = sp.cells;
          for (let _i4 = 0; _i4 < _a3.length; _i4++) {
            const v_c = _a3[_i4];
            const v_v = p.value[v_c];
            let _g5 = 0;
            G6: {
              const _a7 = sp.cells;
              for (let _i8 = 0; _i8 < _a7.length; _i8++) {
                const v_d = _a7[_i8];
                if (!((p.value[v_d] < v_v))) continue;
                _g5++;
              }
            }
            const v_lo = _g5;
            let _g9 = 0;
            G10: {
              const _a11 = sp.cells;
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_d = _a11[_i12];
                if (!((p.value[v_d] <= v_v))) continue;
                _g9++;
              }
            }
            const v_hi = _g9;
            for (let _m13 = ((1 << 0) | (1 << 1)); _m13 !== 0; _m13 &= _m13 - 1) {
              const v_k = 31 - Math.clz32(_m13 & -_m13);
              let _g14 = 0;
              G15: {
                const _a16 = sp.cells;
                for (let _i17 = 0; _i17 < _a16.length; _i17++) {
                  const v_d = _a16[_i17];
                  if (!(((p.value[v_d] === v_v) && ((((v_d % sp.w) + ((v_d / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g14++;
                }
              }
              let _g18 = 0;
              G19: {
                const _a20 = sp.cells;
                for (let _i21 = 0; _i21 < _a20.length; _i21++) {
                  const v_i = _a20[_i21];
                  if (!((((_i21 >= v_lo) && (_i21 < v_hi)) && ((((v_i % sp.w) + ((v_i / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g18++;
                }
              }
              if ((_g14 !== _g18)) {
                _q1 = true;
                break Q2;
              }
            }
          }
        }
        _c22 = _q1;
      }
      return _c22;
    },
    parity: (p) => {
      let _c7: boolean = ((cl.n % 4) !== 2);
      if (_c7) {
        let _g1 = true;
        const _s3: number[] = [];
        G2: {
          const _a4 = sp.cells;
          for (let _i5 = 0; _i5 < _a4.length; _i5++) {
            const v_c = _a4[_i5];
            const _t6 = p.value[v_c];
            if (_s3.includes(_t6)) {
              _g1 = false;
              break G2;
            }
            _s3.push(_t6);
          }
        }
        _c7 = _g1;
      }
      let _c14: boolean = _c7;
      if (_c14) {
        let _g8 = 0;
        G9: {
          const _a10 = sp.cells;
          for (let _i11 = 0; _i11 < _a10.length; _i11++) {
            const v_a = _a10[_i11];
            const _a12 = sp.cells;
            for (let _i13 = 0; _i13 < _a12.length; _i13++) {
              const v_b = _a12[_i13];
              if (!(((_i11 < _i13) && (p.value[v_a] > p.value[v_b])))) continue;
              _g8++;
            }
          }
        }
        _c14 = ((_g8 % 2) === 1);
      }
      return _c14;
    },
    colorTurned: (p) => {
      if (!variations.includes("orientable")) return false;
      let _c22: boolean = ((cl.n % 2) === 0);
      if (_c22) {
        let _q1 = false;
        Q2: {
          const _a3 = sp.cells;
          for (let _i4 = 0; _i4 < _a3.length; _i4++) {
            const v_c = _a3[_i4];
            const v_v = p.value[v_c];
            let _g5 = 0;
            G6: {
              const _a7 = sp.cells;
              for (let _i8 = 0; _i8 < _a7.length; _i8++) {
                const v_d = _a7[_i8];
                if (!((p.value[v_d] < v_v))) continue;
                _g5++;
              }
            }
            const v_lo = _g5;
            let _g9 = 0;
            G10: {
              const _a11 = sp.cells;
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_d = _a11[_i12];
                if (!((p.value[v_d] <= v_v))) continue;
                _g9++;
              }
            }
            const v_hi = _g9;
            for (let _m13 = ((1 << 0) | (1 << 1)); _m13 !== 0; _m13 &= _m13 - 1) {
              const v_k = 31 - Math.clz32(_m13 & -_m13);
              let _g14 = 0;
              G15: {
                const _a16 = sp.cells;
                for (let _i17 = 0; _i17 < _a16.length; _i17++) {
                  const v_d = _a16[_i17];
                  if (!(((p.value[v_d] === v_v) && ((((((v_d % sp.w) + ((v_d / sp.w) | 0)) % 2) + p.turn[v_d]) % 2) === v_k)))) continue;
                  _g14++;
                }
              }
              let _g18 = 0;
              G19: {
                const _a20 = sp.cells;
                for (let _i21 = 0; _i21 < _a20.length; _i21++) {
                  const v_i = _a20[_i21];
                  if (!((((_i21 >= v_lo) && (_i21 < v_hi)) && ((((v_i % sp.w) + ((v_i / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g18++;
                }
              }
              if ((_g14 !== _g18)) {
                _q1 = true;
                break Q2;
              }
            }
          }
        }
        _c22 = _q1;
      }
      return _c22;
    },
    turnSum: (p) => {
      if (!variations.includes("orientable")) return false;
      let _c5: boolean = ((cl.n % 2) === 0);
      if (_c5) {
        let _g1 = 0;
        G2: {
          const _a3 = sp.cells;
          for (let _i4 = 0; _i4 < _a3.length; _i4++) {
            const v_c = _a3[_i4];
            _g1 += p.turn[v_c];
          }
        }
        _c5 = ((_g1 % 4) !== 0);
      }
      return _c5;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(_sp: GridSpace, _cl: Dealt, variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    colorOdd: (_p) => {
      const at: number[] = [];
      return at;
    },
    parity: (_p) => {
      const at: number[] = [];
      return at;
    },
    colorTurned: (_p) => {
      const at: number[] = [];
      if (!variations.includes("orientable")) return at;
      return at;
    },
    turnSum: (_p) => {
      const at: number[] = [];
      if (!variations.includes("orientable")) return at;
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function anticlockwiseMoves(_p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_b = _a1[_i2];
      if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) continue;
      into.push({ move: "anticlockwise", b: v_b });
    }
  }

  function anticlockwiseLegal(_p: Position, m: AnticlockwiseMove): boolean {
    const v_b = m.b;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) return false;
    return true;
  }

  function anticlockwisePlay(p: Position, m: AnticlockwiseMove): Position {
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice(), turn: p.turn.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.value[v_c] = p.value[(((((v_b / sp.w) | 0) + (v_c % sp.w)) - (v_b % sp.w)) * sp.w + ((((v_b % sp.w) + cl.n) - 1) - (((v_c / sp.w) | 0) - ((v_b / sp.w) | 0))))];
      }
    }
    if (variations.includes("orientable")) {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_c = _a3[_i4];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.turn[v_c] = ((p.turn[(((((v_b / sp.w) | 0) + (v_c % sp.w)) - (v_b % sp.w)) * sp.w + ((((v_b % sp.w) + cl.n) - 1) - (((v_c / sp.w) | 0) - ((v_b / sp.w) | 0))))] + 1) % 4);
      }
    }
    return q;
  }

  function clockwiseMoves(_p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_b = _a1[_i2];
      if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) continue;
      into.push({ move: "clockwise", b: v_b });
    }
  }

  function clockwiseLegal(_p: Position, m: ClockwiseMove): boolean {
    const v_b = m.b;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) return false;
    return true;
  }

  function clockwisePlay(p: Position, m: ClockwiseMove): Position {
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice(), turn: p.turn.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.value[v_c] = p.value[((((((v_b / sp.w) | 0) + cl.n) - 1) - ((v_c % sp.w) - (v_b % sp.w))) * sp.w + (((v_b % sp.w) + ((v_c / sp.w) | 0)) - ((v_b / sp.w) | 0)))];
      }
    }
    if (variations.includes("orientable")) {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_c = _a3[_i4];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.turn[v_c] = ((p.turn[((((((v_b / sp.w) | 0) + cl.n) - 1) - ((v_c % sp.w) - (v_b % sp.w))) * sp.w + (((v_b % sp.w) + ((v_c / sp.w) | 0)) - ((v_b / sp.w) | 0)))] + 3) % 4);
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
          if (!((_i4 > 0))) continue;
          if (!((p.value[(sp.cells[(_i4 - 1)] ?? -1)] <= p.value[v_c]))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      if (!(_q1)) return false;
    }
    if (variations.includes("orientable")) {
      let _q5 = true;
      Q6: {
        const _a7 = sp.cells;
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const v_c = _a7[_i8];
          if (!((p.turn[v_c] === 0))) {
            _q5 = false;
            break Q6;
          }
        }
      }
      if (!(_q5)) return false;
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
      anticlockwiseMoves(p, into);
      clockwiseMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "anticlockwise": return anticlockwiseLegal(p, m);
        case "clockwise": return clockwiseLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "anticlockwise": return anticlockwisePlay(p, m);
        case "clockwise": return clockwisePlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
