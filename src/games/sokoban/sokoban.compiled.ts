// Compiled by `npm run describe` from src/games/sokoban/sokoban.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["ground","target","barrel","label","man"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly ground: Int32Array;
  readonly target: Int32Array;
  readonly barrel: Int32Array;
  readonly label: Int32Array;
  readonly man: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface StepMove {
  readonly move: "step";
  readonly b: number;
  readonly t: number;
}

export interface WalkMove {
  readonly move: "walk";
  readonly t: number;
}

export interface PushMove {
  readonly move: "push";
  readonly s: number;
  readonly o: number;
  readonly t: number;
}

/** A move: its name and its binding. */
export type Move = StepMove | WalkMove | PushMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "dead" | "jammed";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["dead", "jammed"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    dead: (p) => {
      const _fix18 = new Uint8Array(sp.cells.length);
      for (let _grew20 = true; _grew20; ) {
        _grew20 = false;
        for (let _c19 = 0; _c19 < sp.cells.length; _c19++) {
          if (_fix18[_c19] === 1) continue;
          let _c29: boolean = (p.ground[_c19] !== 1);
          if (_c29) {
            let _c28: boolean = (p.target[_c19] === 1);
            if (!_c28) {
              let _q21 = false;
              Q22: {
                const _a23 = sp.adj4[_c19];
                for (let _i24 = 0; _i24 < _a23.length; _i24++) {
                  const v_n = _a23[_i24];
                  let _c27: boolean = (p.ground[v_n] !== 1);
                  if (_c27) {
                    const _t25 = ((2 * (_c19 % sp.w)) - (v_n % sp.w));
                    const _t26 = ((2 * ((_c19 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c27 = ((_t25 >= 0 && _t25 < sp.w && _t26 >= 0 && _t26 < sp.h) && (p.ground[(_t26 * sp.w + _t25)] !== 1));
                  }
                  if (!(_c27)) continue;
                  if ((_fix18[v_n] === 1)) {
                    _q21 = true;
                    break Q22;
                  }
                }
              }
              _c28 = _q21;
            }
            _c29 = _c28;
          }
          if (_c29) {
            _fix18[_c19] = 1;
            _grew20 = true;
          }
        }
      }
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.ground[v_c] < 2))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      let _c13: boolean = _q1;
      if (_c13) {
        let _g5 = 0;
        G6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.barrel[v_c] === 1))) continue;
            _g5++;
          }
        }
        let _g9 = 0;
        G10: {
          const _a11 = sp.cells;
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_c = _a11[_i12];
            if (!((p.target[v_c] === 1))) continue;
            _g9++;
          }
        }
        _c13 = (_g5 <= _g9);
      }
      let _c30: boolean = _c13;
      if (_c30) {
        let _q14 = false;
        Q15: {
          const _a16 = sp.cells;
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_c = _a16[_i17];
            if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
            if (!((_fix18[v_c] === 1))) {
              _q14 = true;
              break Q15;
            }
          }
        }
        _c30 = _q14;
      }
      return _c30;
    },
    jammed: (p) => {
      const _fix28 = new Uint8Array(sp.cells.length);
      for (let _grew30 = true; _grew30; ) {
        _grew30 = false;
        for (let _c29 = 0; _c29 < sp.cells.length; _c29++) {
          if (_fix28[_c29] === 1) continue;
          let _c39: boolean = (p.ground[_c29] !== 1);
          if (_c39) {
            let _c38: boolean = (p.target[_c29] === 1);
            if (!_c38) {
              let _q31 = false;
              Q32: {
                const _a33 = sp.adj4[_c29];
                for (let _i34 = 0; _i34 < _a33.length; _i34++) {
                  const v_n = _a33[_i34];
                  let _c37: boolean = (p.ground[v_n] !== 1);
                  if (_c37) {
                    const _t35 = ((2 * (_c29 % sp.w)) - (v_n % sp.w));
                    const _t36 = ((2 * ((_c29 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c37 = ((_t35 >= 0 && _t35 < sp.w && _t36 >= 0 && _t36 < sp.h) && (p.ground[(_t36 * sp.w + _t35)] !== 1));
                  }
                  if (!(_c37)) continue;
                  if ((_fix28[v_n] === 1)) {
                    _q31 = true;
                    break Q32;
                  }
                }
              }
              _c38 = _q31;
            }
            _c39 = _c38;
          }
          if (_c39) {
            _fix28[_c29] = 1;
            _grew30 = true;
          }
        }
      }
      const _fix18 = new Uint8Array(sp.cells.length);
      for (let _grew20 = true; _grew20; ) {
        _grew20 = false;
        for (let _c19 = 0; _c19 < sp.cells.length; _c19++) {
          if (_fix18[_c19] === 1) continue;
          let _q21 = false;
          Q22: {
            const _a23 = sp.adj4[_c19];
            for (let _i24 = 0; _i24 < _a23.length; _i24++) {
              const v_n = _a23[_i24];
              let _c27: boolean = (p.ground[v_n] !== 1);
              if (_c27) {
                const _t25 = ((2 * (_c19 % sp.w)) - (v_n % sp.w));
                const _t26 = ((2 * ((_c19 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                _c27 = ((_t25 >= 0 && _t25 < sp.w && _t26 >= 0 && _t26 < sp.h) && (p.ground[(_t26 * sp.w + _t25)] !== 1));
              }
              if (!(_c27)) continue;
              const v_a = (((2 * ((_c19 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + ((2 * (_c19 % sp.w)) - (v_n % sp.w)));
              if (((((_fix28[v_n] === 1) || (_fix28[v_a] === 1)) && ((p.barrel[v_n] === 0) || (_fix18[v_n] === 1))) && ((p.barrel[v_a] === 0) || (_fix18[v_a] === 1)))) {
                _q21 = true;
                break Q22;
              }
            }
          }
          if (_q21) {
            _fix18[_c19] = 1;
            _grew20 = true;
          }
        }
      }
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.ground[v_c] < 2))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      let _c13: boolean = _q1;
      if (_c13) {
        let _g5 = 0;
        G6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.barrel[v_c] === 1))) continue;
            _g5++;
          }
        }
        let _g9 = 0;
        G10: {
          const _a11 = sp.cells;
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_c = _a11[_i12];
            if (!((p.target[v_c] === 1))) continue;
            _g9++;
          }
        }
        _c13 = (_g5 <= _g9);
      }
      let _c40: boolean = _c13;
      if (_c40) {
        let _q14 = false;
        Q15: {
          const _a16 = sp.cells;
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_c = _a16[_i17];
            if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
            if (!((_fix18[v_c] === 1))) {
              _q14 = true;
              break Q15;
            }
          }
        }
        _c40 = _q14;
      }
      return _c40;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    dead: (p) => {
      const _fix16 = new Uint8Array(sp.cells.length);
      for (let _grew18 = true; _grew18; ) {
        _grew18 = false;
        for (let _c17 = 0; _c17 < sp.cells.length; _c17++) {
          if (_fix16[_c17] === 1) continue;
          let _c27: boolean = (p.ground[_c17] !== 1);
          if (_c27) {
            let _c26: boolean = (p.target[_c17] === 1);
            if (!_c26) {
              let _q19 = false;
              Q20: {
                const _a21 = sp.adj4[_c17];
                for (let _i22 = 0; _i22 < _a21.length; _i22++) {
                  const v_n = _a21[_i22];
                  let _c25: boolean = (p.ground[v_n] !== 1);
                  if (_c25) {
                    const _t23 = ((2 * (_c17 % sp.w)) - (v_n % sp.w));
                    const _t24 = ((2 * ((_c17 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c25 = ((_t23 >= 0 && _t23 < sp.w && _t24 >= 0 && _t24 < sp.h) && (p.ground[(_t24 * sp.w + _t23)] !== 1));
                  }
                  if (!(_c25)) continue;
                  if ((_fix16[v_n] === 1)) {
                    _q19 = true;
                    break Q20;
                  }
                }
              }
              _c26 = _q19;
            }
            _c27 = _c26;
          }
          if (_c27) {
            _fix16[_c17] = 1;
            _grew18 = true;
          }
        }
      }
      const at: number[] = [];
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.ground[v_c] < 2))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      let _c13: boolean = _q1;
      if (_c13) {
        let _g5 = 0;
        G6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.barrel[v_c] === 1))) continue;
            _g5++;
          }
        }
        let _g9 = 0;
        G10: {
          const _a11 = sp.cells;
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_c = _a11[_i12];
            if (!((p.target[v_c] === 1))) continue;
            _g9++;
          }
        }
        _c13 = (_g5 <= _g9);
      }
      if (!(_c13)) return at;
      const _a14 = sp.cells;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_c = _a14[_i15];
        if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
        if (!((_fix16[v_c] === 1))) at.push(v_c);
      }
      return at;
    },
    jammed: (p) => {
      const _fix26 = new Uint8Array(sp.cells.length);
      for (let _grew28 = true; _grew28; ) {
        _grew28 = false;
        for (let _c27 = 0; _c27 < sp.cells.length; _c27++) {
          if (_fix26[_c27] === 1) continue;
          let _c37: boolean = (p.ground[_c27] !== 1);
          if (_c37) {
            let _c36: boolean = (p.target[_c27] === 1);
            if (!_c36) {
              let _q29 = false;
              Q30: {
                const _a31 = sp.adj4[_c27];
                for (let _i32 = 0; _i32 < _a31.length; _i32++) {
                  const v_n = _a31[_i32];
                  let _c35: boolean = (p.ground[v_n] !== 1);
                  if (_c35) {
                    const _t33 = ((2 * (_c27 % sp.w)) - (v_n % sp.w));
                    const _t34 = ((2 * ((_c27 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c35 = ((_t33 >= 0 && _t33 < sp.w && _t34 >= 0 && _t34 < sp.h) && (p.ground[(_t34 * sp.w + _t33)] !== 1));
                  }
                  if (!(_c35)) continue;
                  if ((_fix26[v_n] === 1)) {
                    _q29 = true;
                    break Q30;
                  }
                }
              }
              _c36 = _q29;
            }
            _c37 = _c36;
          }
          if (_c37) {
            _fix26[_c27] = 1;
            _grew28 = true;
          }
        }
      }
      const _fix16 = new Uint8Array(sp.cells.length);
      for (let _grew18 = true; _grew18; ) {
        _grew18 = false;
        for (let _c17 = 0; _c17 < sp.cells.length; _c17++) {
          if (_fix16[_c17] === 1) continue;
          let _q19 = false;
          Q20: {
            const _a21 = sp.adj4[_c17];
            for (let _i22 = 0; _i22 < _a21.length; _i22++) {
              const v_n = _a21[_i22];
              let _c25: boolean = (p.ground[v_n] !== 1);
              if (_c25) {
                const _t23 = ((2 * (_c17 % sp.w)) - (v_n % sp.w));
                const _t24 = ((2 * ((_c17 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                _c25 = ((_t23 >= 0 && _t23 < sp.w && _t24 >= 0 && _t24 < sp.h) && (p.ground[(_t24 * sp.w + _t23)] !== 1));
              }
              if (!(_c25)) continue;
              const v_a = (((2 * ((_c17 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + ((2 * (_c17 % sp.w)) - (v_n % sp.w)));
              if (((((_fix26[v_n] === 1) || (_fix26[v_a] === 1)) && ((p.barrel[v_n] === 0) || (_fix16[v_n] === 1))) && ((p.barrel[v_a] === 0) || (_fix16[v_a] === 1)))) {
                _q19 = true;
                break Q20;
              }
            }
          }
          if (_q19) {
            _fix16[_c17] = 1;
            _grew18 = true;
          }
        }
      }
      const at: number[] = [];
      let _q1 = true;
      Q2: {
        const _a3 = sp.cells;
        for (let _i4 = 0; _i4 < _a3.length; _i4++) {
          const v_c = _a3[_i4];
          if (!((p.ground[v_c] < 2))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      let _c13: boolean = _q1;
      if (_c13) {
        let _g5 = 0;
        G6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!((p.barrel[v_c] === 1))) continue;
            _g5++;
          }
        }
        let _g9 = 0;
        G10: {
          const _a11 = sp.cells;
          for (let _i12 = 0; _i12 < _a11.length; _i12++) {
            const v_c = _a11[_i12];
            if (!((p.target[v_c] === 1))) continue;
            _g9++;
          }
        }
        _c13 = (_g5 <= _g9);
      }
      if (!(_c13)) return at;
      const _a14 = sp.cells;
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_c = _a14[_i15];
        if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
        if (!((_fix16[v_c] === 1))) at.push(v_c);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function stepMoves(p: Position, into: Move[]): void {
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_b = _a1[_i2];
      if (!((p.man[v_b] === 1))) continue;
      const _a3 = sp.adj8[v_b];
      for (let _i4 = 0; _i4 < _a3.length; _i4++) {
        const v_t = _a3[_i4];
        let _c9: boolean = ((p.ground[v_t] === 0) && (p.barrel[v_t] === 0));
        if (_c9) {
          let _c6: boolean = (((v_t % sp.w) === (v_b % sp.w)) || (((v_t / sp.w) | 0) === ((v_b / sp.w) | 0)));
          if (!_c6) {
            const _t5 = (((v_b / sp.w) | 0) * sp.w + (v_t % sp.w));
            _c6 = ((p.ground[_t5] === 0) && (p.barrel[_t5] === 0));
          }
          let _c8: boolean = _c6;
          if (!_c8) {
            const _t7 = (((v_t / sp.w) | 0) * sp.w + (v_b % sp.w));
            _c8 = ((p.ground[_t7] === 0) && (p.barrel[_t7] === 0));
          }
          _c9 = _c8;
        }
        if (!(_c9)) continue;
        into.push({ move: "step", b: v_b, t: v_t });
      }
    }
  }

  function stepLegal(p: Position, m: StepMove): boolean {
    const v_b = m.b;
    const v_t = m.t;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((p.man[v_b] === 1))) return false;
    if (!sp.adj8[v_b].includes(v_t)) return false;
    let _c5: boolean = ((p.ground[v_t] === 0) && (p.barrel[v_t] === 0));
    if (_c5) {
      let _c2: boolean = (((v_t % sp.w) === (v_b % sp.w)) || (((v_t / sp.w) | 0) === ((v_b / sp.w) | 0)));
      if (!_c2) {
        const _t1 = (((v_b / sp.w) | 0) * sp.w + (v_t % sp.w));
        _c2 = ((p.ground[_t1] === 0) && (p.barrel[_t1] === 0));
      }
      let _c4: boolean = _c2;
      if (!_c4) {
        const _t3 = (((v_t / sp.w) | 0) * sp.w + (v_b % sp.w));
        _c4 = ((p.ground[_t3] === 0) && (p.barrel[_t3] === 0));
      }
      _c5 = _c4;
    }
    if (!(_c5)) return false;
    return true;
  }

  function stepPlay(p: Position, m: StepMove): Position {
    const v_b = m.b;
    const v_t = m.t;
    const q: Position = { ...p, man: p.man.slice() };
    {
      const v_c = v_b;
      q.man[v_c] = 0;
    }
    {
      const v_c = v_t;
      q.man[v_c] = 1;
    }
    return q;
  }

  function walkMoves(p: Position, into: Move[]): void {
    const _fix3 = new Uint8Array(sp.cells.length);
    for (let _grew5 = true; _grew5; ) {
      _grew5 = false;
      for (let _c4 = 0; _c4 < sp.cells.length; _c4++) {
        if (_fix3[_c4] === 1) continue;
        let _c11: boolean = (p.man[_c4] === 1);
        if (!_c11) {
          let _c10: boolean = ((p.ground[_c4] === 0) && (p.barrel[_c4] === 0));
          if (_c10) {
            let _q6 = false;
            Q7: {
              const _a8 = sp.adj4[_c4];
              for (let _i9 = 0; _i9 < _a8.length; _i9++) {
                const v_n = _a8[_i9];
                if ((_fix3[v_n] === 1)) {
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
          _fix3[_c4] = 1;
          _grew5 = true;
        }
      }
    }
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_t = _a1[_i2];
      if (!(((p.man[v_t] === 0) && (_fix3[v_t] === 1)))) continue;
      into.push({ move: "walk", t: v_t });
    }
  }

  function walkLegal(p: Position, m: WalkMove): boolean {
    const v_t = m.t;
    const _fix1 = new Uint8Array(sp.cells.length);
    for (let _grew3 = true; _grew3; ) {
      _grew3 = false;
      for (let _c2 = 0; _c2 < sp.cells.length; _c2++) {
        if (_fix1[_c2] === 1) continue;
        let _c9: boolean = (p.man[_c2] === 1);
        if (!_c9) {
          let _c8: boolean = ((p.ground[_c2] === 0) && (p.barrel[_c2] === 0));
          if (_c8) {
            let _q4 = false;
            Q5: {
              const _a6 = sp.adj4[_c2];
              for (let _i7 = 0; _i7 < _a6.length; _i7++) {
                const v_n = _a6[_i7];
                if ((_fix1[v_n] === 1)) {
                  _q4 = true;
                  break Q5;
                }
              }
            }
            _c8 = _q4;
          }
          _c9 = _c8;
        }
        if (_c9) {
          _fix1[_c2] = 1;
          _grew3 = true;
        }
      }
    }
    if (!(Number.isInteger(v_t) && v_t >= 0 && v_t < sp.cells.length)) return false;
    if (!(((p.man[v_t] === 0) && (_fix1[v_t] === 1)))) return false;
    return true;
  }

  function walkPlay(p: Position, m: WalkMove): Position {
    const v_t = m.t;
    const q: Position = { ...p, man: p.man.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((p.man[v_c] === 1))) continue;
        q.man[v_c] = 0;
      }
    }
    {
      const v_c = v_t;
      q.man[v_c] = 1;
    }
    return q;
  }

  function pushMoves(p: Position, into: Move[]): void {
    const _fix3 = new Uint8Array(sp.cells.length);
    for (let _grew5 = true; _grew5; ) {
      _grew5 = false;
      for (let _c4 = 0; _c4 < sp.cells.length; _c4++) {
        if (_fix3[_c4] === 1) continue;
        let _c11: boolean = (p.man[_c4] === 1);
        if (!_c11) {
          let _c10: boolean = ((p.ground[_c4] === 0) && (p.barrel[_c4] === 0));
          if (_c10) {
            let _q6 = false;
            Q7: {
              const _a8 = sp.adj4[_c4];
              for (let _i9 = 0; _i9 < _a8.length; _i9++) {
                const v_n = _a8[_i9];
                if ((_fix3[v_n] === 1)) {
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
          _fix3[_c4] = 1;
          _grew5 = true;
        }
      }
    }
    const _a1 = sp.cells;
    for (let _i2 = 0; _i2 < _a1.length; _i2++) {
      const v_s = _a1[_i2];
      if (!((_fix3[v_s] === 1))) continue;
      const _a12 = sp.adj4[v_s];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_o = _a12[_i13];
        let _c16: boolean = (p.barrel[v_o] === 1);
        if (_c16) {
          const _t14 = ((2 * (v_o % sp.w)) - (v_s % sp.w));
          const _t15 = ((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0));
          _c16 = (_t14 >= 0 && _t14 < sp.w && _t15 >= 0 && _t15 < sp.h);
        }
        if (!(_c16)) continue;
        L17: {
          const v_t = (((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_s % sp.w)));
          if (!(((p.barrel[v_t] === 0) && (p.ground[v_t] !== 1)))) break L17;
          into.push({ move: "push", s: v_s, o: v_o, t: v_t });
        }
      }
    }
  }

  function pushLegal(p: Position, m: PushMove): boolean {
    const v_s = m.s;
    const v_o = m.o;
    const v_t = m.t;
    const _fix1 = new Uint8Array(sp.cells.length);
    for (let _grew3 = true; _grew3; ) {
      _grew3 = false;
      for (let _c2 = 0; _c2 < sp.cells.length; _c2++) {
        if (_fix1[_c2] === 1) continue;
        let _c9: boolean = (p.man[_c2] === 1);
        if (!_c9) {
          let _c8: boolean = ((p.ground[_c2] === 0) && (p.barrel[_c2] === 0));
          if (_c8) {
            let _q4 = false;
            Q5: {
              const _a6 = sp.adj4[_c2];
              for (let _i7 = 0; _i7 < _a6.length; _i7++) {
                const v_n = _a6[_i7];
                if ((_fix1[v_n] === 1)) {
                  _q4 = true;
                  break Q5;
                }
              }
            }
            _c8 = _q4;
          }
          _c9 = _c8;
        }
        if (_c9) {
          _fix1[_c2] = 1;
          _grew3 = true;
        }
      }
    }
    if (!(Number.isInteger(v_s) && v_s >= 0 && v_s < sp.cells.length)) return false;
    if (!((_fix1[v_s] === 1))) return false;
    if (!sp.adj4[v_s].includes(v_o)) return false;
    let _c12: boolean = (p.barrel[v_o] === 1);
    if (_c12) {
      const _t10 = ((2 * (v_o % sp.w)) - (v_s % sp.w));
      const _t11 = ((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0));
      _c12 = (_t10 >= 0 && _t10 < sp.w && _t11 >= 0 && _t11 < sp.h);
    }
    if (!(_c12)) return false;
    if (v_t !== (((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_s % sp.w)))) return false;
    if (!(((p.barrel[v_t] === 0) && (p.ground[v_t] !== 1)))) return false;
    return true;
  }

  function pushPlay(p: Position, m: PushMove): Position {
    const v_o = m.o;
    const v_t = m.t;
    const q: Position = { ...p, ground: p.ground.slice(), barrel: p.barrel.slice(), label: p.label.slice(), man: p.man.slice() };
    {
      const _a1 = sp.cells;
      for (let _i2 = 0; _i2 < _a1.length; _i2++) {
        const v_c = _a1[_i2];
        if (!((p.man[v_c] === 1))) continue;
        q.man[v_c] = 0;
      }
    }
    {
      const v_c = v_o;
      q.man[v_c] = 1;
      q.barrel[v_c] = 0;
      q.label[v_c] = 0;
    }
    {
      L3: {
        const v_c = v_t;
        if (!((p.ground[v_t] === 0))) break L3;
        q.barrel[v_c] = 1;
        q.label[v_c] = p.label[v_o];
      }
    }
    {
      L4: {
        const v_c = v_t;
        if (!((p.ground[v_t] === 2))) break L4;
        q.ground[v_c] = 0;
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
          if (!(((p.barrel[v_c] === 0) || (p.target[v_c] === 1)))) {
            _q1 = false;
            break Q2;
          }
        }
      }
      let _c9: boolean = _q1;
      if (!_c9) {
        let _q5 = true;
        Q6: {
          const _a7 = sp.cells;
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            const v_c = _a7[_i8];
            if (!(((p.ground[v_c] < 2) && ((p.target[v_c] === 0) || (p.barrel[v_c] === 1))))) {
              _q5 = false;
              break Q6;
            }
          }
        }
        _c9 = _q5;
      }
      if (!(_c9)) return false;
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
      stepMoves(p, into);
      walkMoves(p, into);
      pushMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "step": return stepLegal(p, m);
        case "walk": return walkLegal(p, m);
        case "push": return pushLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "step": return stepPlay(p, m);
        case "walk": return walkPlay(p, m);
        case "push": return pushPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
