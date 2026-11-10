// Compiled by `npm run describe` from src/games/inertia/inertia.description.yaml: edit that, not this.

import { type GridSpace, ray } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["kind","ball"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly kind: Int32Array;
  readonly ball: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface SlideMove {
  readonly move: "slide";
  readonly b: number;
  readonly n: number;
}

/** A move: its name and its binding. */
export type Move = SlideMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "stranded";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["stranded"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    stranded: (p) => {
      const _fix15 = new Uint8Array(sp.cells.length);
      for (let _grew17 = true; _grew17; ) {
        _grew17 = false;
        for (let _c16 = 0; _c16 < sp.cells.length; _c16++) {
          if (_fix15[_c16] === 1) continue;
          let _c32: boolean = (p.ball[_c16] === 1);
          if (!_c32) {
            let _c31: boolean = (p.kind[_c16] !== 2);
            if (_c31) {
              let _q18 = false;
              Q19: {
                const _a20 = sp.adj8[_c16];
                for (let _i21 = 0; _i21 < _a20.length; _i21++) {
                  const v_n = _a20[_i21];
                  const _a22 = ray(sp, _c16, v_n);
                  for (let _i23 = 0; _i23 < _a22.length; _i23++) {
                    const v_b = _a22[_i23];
                    if (!(((_fix15[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((_c16 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c16 % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                    const _t24 = (((((v_b / sp.w) | 0) + ((_c16 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c16 % sp.w)) - (v_n % sp.w)));
                    const _g25: number[] = [];
                    G26: {
                      const v_R = ray(sp, v_b, _t24);
                      const _a29 = v_R;
                      for (let _i30 = 0; _i30 < _a29.length; _i30++) {
                        const v_c = _a29[_i30];
                        if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i30 + 1) === v_R.length)) || (p.kind[(v_R[(_i30 + 1)] ?? -1)] === 4)))) continue;
                        if (!_g25.includes(v_c)) _g25.push(v_c);
                      }
                    }
                    if (((_g25.length > 0 ? _g25[0] : -1) === _c16)) {
                      _q18 = true;
                      break Q19;
                    }
                  }
                }
              }
              _c31 = _q18;
            }
            _c32 = _c31;
          }
          if (_c32) {
            _fix15[_c16] = 1;
            _grew17 = true;
          }
        }
      }
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q1 = true;
            break Q2;
          }
        }
      }
      let _c39: boolean = !(_q1);
      if (_c39) {
        let _q5 = false;
        Q6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_g = _a7[_i8];
            if (!((p.kind[v_g] === 1))) continue;
            let _q9 = false;
            Q10: {
              const _a11 = sp.adj8[v_g];
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_n = _a11[_i12];
                const _a13 = ray(sp, v_g, v_n);
                for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                  const v_b = _a13[_i14];
                  if (!(((_fix15[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                  const v_s = (((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)));
                  const v_R = ray(sp, v_b, v_s);
                  const _g33: number[] = [];
                  G34: {
                    const v_R = ray(sp, v_b, v_s);
                    const _a37 = v_R;
                    for (let _i38 = 0; _i38 < _a37.length; _i38++) {
                      const v_c = _a37[_i38];
                      if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i38 + 1) === v_R.length)) || (p.kind[(v_R[(_i38 + 1)] ?? -1)] === 4)))) continue;
                      if (!_g33.includes(v_c)) _g33.push(v_c);
                    }
                  }
                  if ((v_R.indexOf(v_g) <= v_R.indexOf((_g33.length > 0 ? _g33[0] : -1)))) {
                    _q9 = true;
                    break Q10;
                  }
                }
              }
            }
            if (!(_q9)) {
              _q5 = true;
              break Q6;
            }
          }
        }
        _c39 = _q5;
      }
      return _c39;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    stranded: (p) => {
      const _fix13 = new Uint8Array(sp.cells.length);
      for (let _grew15 = true; _grew15; ) {
        _grew15 = false;
        for (let _c14 = 0; _c14 < sp.cells.length; _c14++) {
          if (_fix13[_c14] === 1) continue;
          let _c30: boolean = (p.ball[_c14] === 1);
          if (!_c30) {
            let _c29: boolean = (p.kind[_c14] !== 2);
            if (_c29) {
              let _q16 = false;
              Q17: {
                const _a18 = sp.adj8[_c14];
                for (let _i19 = 0; _i19 < _a18.length; _i19++) {
                  const v_n = _a18[_i19];
                  const _a20 = ray(sp, _c14, v_n);
                  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
                    const v_b = _a20[_i21];
                    if (!(((_fix13[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((_c14 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c14 % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                    const _t22 = (((((v_b / sp.w) | 0) + ((_c14 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c14 % sp.w)) - (v_n % sp.w)));
                    const _g23: number[] = [];
                    G24: {
                      const v_R = ray(sp, v_b, _t22);
                      const _a27 = v_R;
                      for (let _i28 = 0; _i28 < _a27.length; _i28++) {
                        const v_c = _a27[_i28];
                        if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i28 + 1) === v_R.length)) || (p.kind[(v_R[(_i28 + 1)] ?? -1)] === 4)))) continue;
                        if (!_g23.includes(v_c)) _g23.push(v_c);
                      }
                    }
                    if (((_g23.length > 0 ? _g23[0] : -1) === _c14)) {
                      _q16 = true;
                      break Q17;
                    }
                  }
                }
              }
              _c29 = _q16;
            }
            _c30 = _c29;
          }
          if (_c30) {
            _fix13[_c14] = 1;
            _grew15 = true;
          }
        }
      }
      const at: number[] = [];
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q1 = true;
            break Q2;
          }
        }
      }
      if (!(!(_q1))) return at;
      const _a5 = sp.cells;
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_g = _a5[_i6];
        if (!((p.kind[v_g] === 1))) continue;
        let _q7 = false;
        Q8: {
          const _a9 = sp.adj8[v_g];
          for (let _i10 = 0; _i10 < _a9.length; _i10++) {
            const v_n = _a9[_i10];
            const _a11 = ray(sp, v_g, v_n);
            for (let _i12 = 0; _i12 < _a11.length; _i12++) {
              const v_b = _a11[_i12];
              if (!(((_fix13[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
              const v_s = (((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)));
              const v_R = ray(sp, v_b, v_s);
              const _g31: number[] = [];
              G32: {
                const v_R = ray(sp, v_b, v_s);
                const _a35 = v_R;
                for (let _i36 = 0; _i36 < _a35.length; _i36++) {
                  const v_c = _a35[_i36];
                  if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i36 + 1) === v_R.length)) || (p.kind[(v_R[(_i36 + 1)] ?? -1)] === 4)))) continue;
                  if (!_g31.includes(v_c)) _g31.push(v_c);
                }
              }
              if ((v_R.indexOf(v_g) <= v_R.indexOf((_g31.length > 0 ? _g31[0] : -1)))) {
                _q7 = true;
                break Q8;
              }
            }
          }
        }
        if (!(_q7)) at.push(v_g);
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
      const v_b = _a1[_i2];
      if (!((p.ball[v_b] === 1))) continue;
      const _a3 = sp.adj8[v_b];
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_n = _a3[_i4];
        if (!((p.kind[v_n] !== 4))) continue;
        into.push({ move: "slide", b: v_b, n: v_n });
      }
    }
  }

  function slideLegal(p: Position, m: SlideMove): boolean {
    const v_b = m.b;
    const v_n = m.n;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((p.ball[v_b] === 1))) return false;
    if (!sp.adj8[v_b].includes(v_n)) return false;
    if (!((p.kind[v_n] !== 4))) return false;
    return true;
  }

  function slidePlay(p: Position, m: SlideMove): Position {
    const v_b = m.b;
    const v_n = m.n;
    const q: Position = { ...p, kind: p.kind.slice(), ball: p.ball.slice() };
    {
      const _g1: number[] = [];
      G2: {
        const v_R = ray(sp, v_b, v_n);
        const _a5 = v_R;
        for (let _i6 = 0; _i6 < _a5.length; _i6++) {
          const v_c = _a5[_i6];
          if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i6 + 1) === v_R.length)) || (p.kind[(v_R[(_i6 + 1)] ?? -1)] === 4)))) continue;
          if (!_g1.includes(v_c)) _g1.push(v_c);
        }
      }
      const v_t = (_g1.length > 0 ? _g1[0] : -1);
      const v_R = ray(sp, v_b, v_n);
      const _a7 = v_R;
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_c = _a7[_i8];
        if (!(((_i8 <= v_R.indexOf(v_t)) && (p.kind[v_c] === 1)))) continue;
        q.kind[v_c] = 0;
      }
    }
    {
      const v_c = v_b;
      q.ball[v_c] = 0;
    }
    {
      const _g9: number[] = [];
      G10: {
        const v_R = ray(sp, v_b, v_n);
        const _a13 = v_R;
        for (let _i14 = 0; _i14 < _a13.length; _i14++) {
          const v_c = _a13[_i14];
          if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i14 + 1) === v_R.length)) || (p.kind[(v_R[(_i14 + 1)] ?? -1)] === 4)))) continue;
          if (!_g9.includes(v_c)) _g9.push(v_c);
        }
      }
      const v_c = (_g9.length > 0 ? _g9[0] : -1);
      q.ball[v_c] = 1;
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
          if (!((p.kind[v_c] !== 1))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      if (!(_q1)) return false;
    }
    return true;
  }

  function lost(p: Position): boolean {
    {
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q1 = true;
            break Q2;
          }
        }
      }
      if (_q1) return true;
    }
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
      if (lost(p)) return into;
      slideMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      if (lost(p)) return false;
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
