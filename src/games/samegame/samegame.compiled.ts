// Compiled by `npm run describe` from src/games/samegame/samegame.description.yaml: edit that, not this.

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

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface RemoveMove {
  readonly move: "remove";
  readonly s: number;
}

/** A move: its name and its binding. */
export type Move = RemoveMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "stuck" | "last";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["stuck", "last"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    stuck: (p) => {
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if ((p.tile[v_c] !== 0)) {
            _q1 = true;
            break Q2;
          }
        }
      }
      let _c13: boolean = _q1;
      if (_c13) {
        let _q5 = true;
        Q6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.tile[v_c] !== 0))) continue;
            let _q9 = true;
            Q10: {
              const _a11 = sp.adj4[v_c];
              for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                const v_n = _a11[_i12];
                if (!((p.tile[v_n] !== p.tile[v_c]))) {
                  _q9 = false;
                  break Q10;
                }
              }
            }
            if (!(_q9)) {
              _q5 = false;
              break Q6;
            }
          }
        }
        _c13 = _q5;
      }
      return _c13;
    },
    last: (p) => {
      let _q1 = false;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.tile[v_c] !== 0))) continue;
          let _q5 = true;
          Q6: {
            const _a7 = sp.cells;
            for (let _i8 = 0; _i8 < _a7.length; _i8++) {
              const v_d = _a7[_i8];
              if (!((v_d !== v_c))) continue;
              if (!((p.tile[v_d] !== p.tile[v_c]))) {
                _q5 = false;
                break Q6;
              }
            }
          }
          if (_q5) {
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
    stuck: (_p) => {
      const at: number[] = [];
      return at;
    },
    last: (p) => {
      const at: number[] = [];
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((p.tile[v_c] !== 0))) continue;
        let _q3 = true;
        Q4: {
          const _a5 = sp.cells;
          for (let _i6 = 0; _i6 < _a5.length; _i6++) {
            const v_d = _a5[_i6];
            if (!((v_d !== v_c))) continue;
            if (!((p.tile[v_d] !== p.tile[v_c]))) {
              _q3 = false;
              break Q4;
            }
          }
        }
        if (_q3) at.push(v_c);
      }
      return at;
    },
  };
}

/** The definitions the game reads beside the rules, each giving the
 * cells it holds of for values of its other parameters. */
export function views(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): {
  readonly joined: (p: Position, a0: number) => number[];
} {
  return {
    joined: (p, a0) => {
      const _sets12 = new Map<number, Uint8Array>();
      const _fix2Of = (_a5: number): Uint8Array => {
        const kept = _sets12.get(_a5);
        if (kept !== undefined) return kept;
        const _fix2 = new Uint8Array(sp.cells.length);
        for (let _grew4 = true; _grew4; ) {
          _grew4 = false;
          for (let _c3 = 0; _c3 < sp.cells.length; _c3++) {
            if (_fix2[_c3] === 1) continue;
            let _c11: boolean = (_c3 === _a5);
            if (!_c11) {
              let _c10: boolean = (p.tile[_c3] === p.tile[_a5]);
              if (_c10) {
                let _q6 = false;
                Q7: {
                  const _a8 = sp.adj4[_c3];
                  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
                    const v_n = _a8[_i9];
                    if ((_fix2[v_n] === 1)) {
                      _q6 = true;
                      break Q7;
                    }
                  }
                }
                _c10 = _q6;
              }
              _c11 = _c10;
            }
            if (_c11) {
              _fix2[_c3] = 1;
              _grew4 = true;
            }
          }
        }
        _sets12.set(_a5, _fix2);
        return _fix2;
      };
      const at: number[] = [];
      for (let _c1 = 0; _c1 < sp.cells.length; _c1++) {
        if ((_fix2Of(a0)[_c1] === 1)) at.push(_c1);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function removeMoves(p: Position, into: Move[]): void {
    const _sets22 = new Map<number, Uint8Array>();
    const _fix12Of = (_a15: number): Uint8Array => {
      const kept = _sets22.get(_a15);
      if (kept !== undefined) return kept;
      const _fix12 = new Uint8Array(sp.cells.length);
      for (let _grew14 = true; _grew14; ) {
        _grew14 = false;
        for (let _c13 = 0; _c13 < sp.cells.length; _c13++) {
          if (_fix12[_c13] === 1) continue;
          let _c21: boolean = (_c13 === _a15);
          if (!_c21) {
            let _c20: boolean = (p.tile[_c13] === p.tile[_a15]);
            if (_c20) {
              let _q16 = false;
              Q17: {
                const _a18 = sp.adj4[_c13];
                for (let _i19 = 0; _i19 < _a18.length; _i19++) {
                  const v_n = _a18[_i19];
                  if ((_fix12[v_n] === 1)) {
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
            _fix12[_c13] = 1;
            _grew14 = true;
          }
        }
      }
      _sets22.set(_a15, _fix12);
      return _fix12;
    };
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_s = _a1[_i2];
      let _c7: boolean = (p.tile[v_s] !== 0);
      if (_c7) {
        let _q3 = false;
        Q4: {
          const _a5 = sp.adj4[v_s];
          for (let _i6 = 0; _i6 < _a5.length; _i6++) {
            const v_n = _a5[_i6];
            if ((p.tile[v_n] === p.tile[v_s])) {
              _q3 = true;
              break Q4;
            }
          }
        }
        _c7 = _q3;
      }
      let _c23: boolean = _c7;
      if (_c23) {
        let _q8 = true;
        Q9: {
          const _a10 = sp.cells;
          for (let _i11 = 0; _i11 < _a10.length; _i11++) {
            const v_c = _a10[_i11];
            if (!((_fix12Of(v_s)[v_c] === 1))) continue;
            if (!((_i11 >= _i2))) {
              _q8 = false;
              break Q9;
            }
          }
        }
        _c23 = _q8;
      }
      if (!(_c23)) continue;
      into.push({ move: "remove", s: v_s });
    }
  }

  function removeLegal(p: Position, m: RemoveMove): boolean {
    const v_s = m.s;
    const _sets20 = new Map<number, Uint8Array>();
    const _fix10Of = (_a13: number): Uint8Array => {
      const kept = _sets20.get(_a13);
      if (kept !== undefined) return kept;
      const _fix10 = new Uint8Array(sp.cells.length);
      for (let _grew12 = true; _grew12; ) {
        _grew12 = false;
        for (let _c11 = 0; _c11 < sp.cells.length; _c11++) {
          if (_fix10[_c11] === 1) continue;
          let _c19: boolean = (_c11 === _a13);
          if (!_c19) {
            let _c18: boolean = (p.tile[_c11] === p.tile[_a13]);
            if (_c18) {
              let _q14 = false;
              Q15: {
                const _a16 = sp.adj4[_c11];
                for (let _i17 = 0; _i17 < _a16.length; _i17++) {
                  const v_n = _a16[_i17];
                  if ((_fix10[v_n] === 1)) {
                    _q14 = true;
                    break Q15;
                  }
                }
              }
              _c18 = _q14;
            }
            _c19 = _c18;
          }
          if (_c19) {
            _fix10[_c11] = 1;
            _grew12 = true;
          }
        }
      }
      _sets20.set(_a13, _fix10);
      return _fix10;
    };
    if (!(Number.isInteger(v_s) && v_s >= 0 && v_s < sp.cells.length)) return false;
    let _c5: boolean = (p.tile[v_s] !== 0);
    if (_c5) {
      let _q1 = false;
      Q2: {
        const _a3 = sp.adj4[v_s];
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_n = _a3[_i4];
          if ((p.tile[v_n] === p.tile[v_s])) {
            _q1 = true;
            break Q2;
          }
        }
      }
      _c5 = _q1;
    }
    let _c21: boolean = _c5;
    if (_c21) {
      let _q6 = true;
      Q7: {
        const _a8 = sp.cells;
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_c = _a8[_i9];
          if (!((_fix10Of(v_s)[v_c] === 1))) continue;
          if (!((_i9 >= v_s))) {
            _q6 = false;
            break Q7;
          }
        }
      }
      _c21 = _q6;
    }
    if (!(_c21)) return false;
    return true;
  }

  function removePlay(p: Position, m: RemoveMove): Position {
    const v_s = m.s;
    const _sets15 = new Map<number, Uint8Array>();
    const _fix5Of = (_a8: number): Uint8Array => {
      const kept = _sets15.get(_a8);
      if (kept !== undefined) return kept;
      const _fix5 = new Uint8Array(sp.cells.length);
      for (let _grew7 = true; _grew7; ) {
        _grew7 = false;
        for (let _c6 = 0; _c6 < sp.cells.length; _c6++) {
          if (_fix5[_c6] === 1) continue;
          let _c14: boolean = (_c6 === _a8);
          if (!_c14) {
            let _c13: boolean = (p.tile[_c6] === p.tile[_a8]);
            if (_c13) {
              let _q9 = false;
              Q10: {
                const _a11 = sp.adj4[_c6];
                for (let _i12 = 0; _i12 < _a11.length; _i12++) {
                  const v_n = _a11[_i12];
                  if ((_fix5[v_n] === 1)) {
                    _q9 = true;
                    break Q10;
                  }
                }
              }
              _c13 = _q9;
            }
            _c14 = _c13;
          }
          if (_c14) {
            _fix5[_c6] = 1;
            _grew7 = true;
          }
        }
      }
      _sets15.set(_a8, _fix5);
      return _fix5;
    };
    const q: Position = { ...p, tile: p.tile.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        q.tile[v_c] = 0;
      }
    }
    {
      const _a3 = sp.cells;
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_c = _a3[_i4];
        if (!(((p.tile[v_c] !== 0) && !((_fix5Of(v_s)[v_c] === 1))))) continue;
        let _g16 = 0;
        G17: {
          const _a18 = sp.cols;
          const _n19 = _a18.indexOf(sp.colOf[v_c]);
          for (let _i20 = 0; _i20 < _n19; _i20++) {
            const v_L = _a18[_i20];
            let _q21 = false;
            Q22: {
              const _a23 = sp.lineCells[v_L];
              for (let _i24 = 0; _i24 < _a23.length; _i24++) {
                const v_d = _a23[_i24];
                if (((p.tile[v_d] !== 0) && !((_fix5Of(v_s)[v_d] === 1)))) {
                  _q21 = true;
                  break Q22;
                }
              }
            }
            if (!(_q21)) continue;
            _g16++;
          }
        }
        let _g25 = 0;
        G26: {
          const _a27 = sp.lineCells[sp.colOf[v_c]];
          for (let _i28 = 0; _i28 < _a27.length; _i28++) {
            const v_d = _a27[_i28];
            if (!(((((v_d / sp.w) | 0) > ((v_c / sp.w) | 0)) && ((p.tile[v_d] !== 0) && !((_fix5Of(v_s)[v_d] === 1)))))) continue;
            _g25++;
          }
        }
        const v_t = (((sp.h - 1) - _g25) * sp.w + _g16);
        q.tile[v_t] = p.tile[v_c];
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
          if (!((p.tile[v_c] === 0))) {
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
      removeMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "remove": return removeLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "remove": return removePlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
