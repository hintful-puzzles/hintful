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

/** What the rules read that the grid does not give: sizes, and
 * relations, a set of cells for each cell. */
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
      let _c46 = ((cl.n % 2) === 1);
      if (_c46) {
        let _q25 = false;
        Q26: {
          const _a27 = sp.cells;
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_c = _a27[_i28];
            const v_v = p.value[v_c];
            let _g29 = 0;
            G30: {
              const _a31 = sp.cells;
              for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                const v_d = _a31[_i32];
                if (!((p.value[v_d] < v_v))) continue;
                _g29++;
              }
            }
            const v_lo = _g29;
            let _g33 = 0;
            G34: {
              const _a35 = sp.cells;
              for (let _i36 = 0; _i36 < _a35.length; _i36++) {
                const v_d = _a35[_i36];
                if (!((p.value[v_d] <= v_v))) continue;
                _g33++;
              }
            }
            const v_hi = _g33;
            for (let _m37 = ((1 << 0) | (1 << 1)); _m37 !== 0; _m37 &= _m37 - 1) {
              const v_k = 31 - Math.clz32(_m37 & -_m37);
              let _g38 = 0;
              G39: {
                const _a40 = sp.cells;
                for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                  const v_d = _a40[_i41];
                  if (!(((p.value[v_d] === v_v) && ((((v_d % sp.w) + ((v_d / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g38++;
                }
              }
              let _g42 = 0;
              G43: {
                const _a44 = sp.cells;
                for (let _i45 = 0; _i45 < _a44.length; _i45++) {
                  const v_i = _a44[_i45];
                  if (!((((_i45 >= v_lo) && (_i45 < v_hi)) && ((((v_i % sp.w) + ((v_i / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g42++;
                }
              }
              if ((_g38 !== _g42)) {
                _q25 = true;
                break Q26;
              }
            }
          }
        }
        _c46 = _q25;
      }
      return _c46;
    },
    parity: (p) => {
      let _c53 = ((cl.n % 4) !== 2);
      if (_c53) {
        let _g47 = true;
        const _s49: number[] = [];
        G48: {
          const _a50 = sp.cells;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_c = _a50[_i51];
            const _t52 = p.value[v_c];
            if (_s49.includes(_t52)) {
              _g47 = false;
              break G48;
            }
            _s49.push(_t52);
          }
        }
        _c53 = _g47;
      }
      let _c60 = _c53;
      if (_c60) {
        let _g54 = 0;
        G55: {
          const _a56 = sp.cells;
          for (let _i57 = 0; _i57 < _a56.length; _i57++) {
            const v_a = _a56[_i57];
            const _a58 = sp.cells;
            for (let _i59 = 0; _i59 < _a58.length; _i59++) {
              const v_b = _a58[_i59];
              if (!(((_i57 < _i59) && (p.value[v_a] > p.value[v_b])))) continue;
              _g54++;
            }
          }
        }
        _c60 = ((_g54 % 2) === 1);
      }
      return _c60;
    },
    colorTurned: (p) => {
      if (!variations.includes("orientable")) return false;
      let _c82 = ((cl.n % 2) === 0);
      if (_c82) {
        let _q61 = false;
        Q62: {
          const _a63 = sp.cells;
          for (let _i64 = 0; _i64 < _a63.length; _i64++) {
            const v_c = _a63[_i64];
            const v_v = p.value[v_c];
            let _g65 = 0;
            G66: {
              const _a67 = sp.cells;
              for (let _i68 = 0; _i68 < _a67.length; _i68++) {
                const v_d = _a67[_i68];
                if (!((p.value[v_d] < v_v))) continue;
                _g65++;
              }
            }
            const v_lo = _g65;
            let _g69 = 0;
            G70: {
              const _a71 = sp.cells;
              for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                const v_d = _a71[_i72];
                if (!((p.value[v_d] <= v_v))) continue;
                _g69++;
              }
            }
            const v_hi = _g69;
            for (let _m73 = ((1 << 0) | (1 << 1)); _m73 !== 0; _m73 &= _m73 - 1) {
              const v_k = 31 - Math.clz32(_m73 & -_m73);
              let _g74 = 0;
              G75: {
                const _a76 = sp.cells;
                for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                  const v_d = _a76[_i77];
                  if (!(((p.value[v_d] === v_v) && ((((((v_d % sp.w) + ((v_d / sp.w) | 0)) % 2) + p.turn[v_d]) % 2) === v_k)))) continue;
                  _g74++;
                }
              }
              let _g78 = 0;
              G79: {
                const _a80 = sp.cells;
                for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                  const v_i = _a80[_i81];
                  if (!((((_i81 >= v_lo) && (_i81 < v_hi)) && ((((v_i % sp.w) + ((v_i / sp.w) | 0)) % 2) === v_k)))) continue;
                  _g78++;
                }
              }
              if ((_g74 !== _g78)) {
                _q61 = true;
                break Q62;
              }
            }
          }
        }
        _c82 = _q61;
      }
      return _c82;
    },
    turnSum: (p) => {
      if (!variations.includes("orientable")) return false;
      let _c87 = ((cl.n % 2) === 0);
      if (_c87) {
        let _g83 = 0;
        G84: {
          const _a85 = sp.cells;
          for (let _i86 = 0; _i86 < _a85.length; _i86++) {
            const v_c = _a85[_i86];
            _g83 += p.turn[v_c];
          }
        }
        _c87 = ((_g83 % 4) !== 0);
      }
      return _c87;
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
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_b = _a3[_i4];
      if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) continue;
      into.push({ move: "anticlockwise", b: v_b });
    }
  }

  function anticlockwiseLegal(_p: Position, m: AnticlockwiseMove): boolean {
    const v_b = m.b;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) return false;
    return true;
  }

  function anticlockwisePlay(p: Position, m: AnticlockwiseMove): Position {
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice(), turn: p.turn.slice() };
    {
      const _a5 = sp.cells;
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_c = _a5[_i6];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.value[v_c] = p.value[(((((v_b / sp.w) | 0) + (v_c % sp.w)) - (v_b % sp.w)) * sp.w + ((((v_b % sp.w) + cl.n) - 1) - (((v_c / sp.w) | 0) - ((v_b / sp.w) | 0))))];
      }
    }
    if (variations.includes("orientable")) {
      const _a7 = sp.cells;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_c = _a7[_i8];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.turn[v_c] = ((p.turn[(((((v_b / sp.w) | 0) + (v_c % sp.w)) - (v_b % sp.w)) * sp.w + ((((v_b % sp.w) + cl.n) - 1) - (((v_c / sp.w) | 0) - ((v_b / sp.w) | 0))))] + 1) % 4);
      }
    }
    return q;
  }

  function clockwiseMoves(_p: Position, into: Move[]): void {
    const _a11 = sp.cells;
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_b = _a11[_i12];
      if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) continue;
      into.push({ move: "clockwise", b: v_b });
    }
  }

  function clockwiseLegal(_p: Position, m: ClockwiseMove): boolean {
    const v_b = m.b;
    if (!(v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((((v_b % sp.w) <= (sp.w - cl.n)) && (((v_b / sp.w) | 0) <= (sp.h - cl.n))))) return false;
    return true;
  }

  function clockwisePlay(p: Position, m: ClockwiseMove): Position {
    const v_b = m.b;
    const q: Position = { ...p, value: p.value.slice(), turn: p.turn.slice() };
    {
      const _a13 = sp.cells;
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_c = _a13[_i14];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.value[v_c] = p.value[((((((v_b / sp.w) | 0) + cl.n) - 1) - ((v_c % sp.w) - (v_b % sp.w))) * sp.w + (((v_b % sp.w) + ((v_c / sp.w) | 0)) - ((v_b / sp.w) | 0)))];
      }
    }
    if (variations.includes("orientable")) {
      const _a15 = sp.cells;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_c = _a15[_i16];
        if (!((((((v_c % sp.w) >= (v_b % sp.w)) && ((v_c % sp.w) < ((v_b % sp.w) + cl.n))) && (((v_c / sp.w) | 0) >= ((v_b / sp.w) | 0))) && (((v_c / sp.w) | 0) < (((v_b / sp.w) | 0) + cl.n))))) continue;
        q.turn[v_c] = ((p.turn[((((((v_b / sp.w) | 0) + cl.n) - 1) - ((v_c % sp.w) - (v_b % sp.w))) * sp.w + (((v_b % sp.w) + ((v_c / sp.w) | 0)) - ((v_b / sp.w) | 0)))] + 3) % 4);
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q17 = true;
      Q18: {
        const _a19 = sp.cells;
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_c = _a19[_i20];
          if (!((_i20 > 0))) continue;
          if (!((p.value[(sp.cells[(_i20 - 1)] ?? -1)] <= p.value[v_c]))) {
            _q17 = false;
            break Q18;
          }
        }
      }
      if (!(_q17)) return false;
    }
    if (variations.includes("orientable")) {
      let _q21 = true;
      Q22: {
        const _a23 = sp.cells;
        for (let _i24 = 0; _i24 < _a23.length; _i24++) {
          const v_c = _a23[_i24];
          if (!((p.turn[v_c] === 0))) {
            _q21 = false;
            break Q22;
          }
        }
      }
      if (!(_q21)) return false;
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
