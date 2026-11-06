// Compiled by `npm run describe` from src/games/slide/slide.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["ground","field","goal","block"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly ground: Int32Array;
  readonly field: Int32Array;
  readonly goal: Int32Array;
  readonly block: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface ShiftMove {
  readonly move: "shift";
  readonly a: number;
  readonly n: number;
}

/** A move: its name and its binding. */
export type Move = ShiftMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = never;

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = [];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(_sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function shiftMoves(p: Position, into: Move[]): void {
    const _a12 = sp.cells;
    for (let _i13 = 0; _i13 < _a12.length; _i13++) {
      const v_a = _a12[_i13];
      let _c20: boolean = (p.block[v_a] !== 0);
      if (_c20) {
        const _g14: number[] = [];
        G15: {
          const _a18 = sp.cells;
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_c = _a18[_i19];
            if (!((p.block[v_c] === p.block[v_a]))) continue;
            _g14.push(v_c);
          }
        }
        _c20 = ((_g14.length > 0 ? _g14[0] : -1) === v_a);
      }
      if (!(_c20)) continue;
      const _a21 = sp.adj4[v_a];
      for (let _i22 = 0; _i22 < _a21.length; _i22++) {
        const v_n = _a21[_i22];
        let _q23 = true;
        Q24: {
          const _a25 = sp.cells;
          for (let _i26 = 0; _i26 < _a25.length; _i26++) {
            const v_c = _a25[_i26];
            if (!((p.block[v_c] === p.block[v_a]))) continue;
            const _t27 = p.block[v_a];
            const _t28 = (((v_c % sp.w) + (v_n % sp.w)) - (v_a % sp.w));
            const _t29 = ((((v_c / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0));
            if (!(((((_t28 >= 0 && _t28 < sp.w && _t29 >= 0 && _t29 < sp.h) && (p.ground[(_t29 * sp.w + _t28)] === 0)) && ((p.block[(_t29 * sp.w + _t28)] === 0) || (p.block[(_t29 * sp.w + _t28)] === _t27))) && ((p.field[(_t29 * sp.w + _t28)] === 0) || (_t27 === 1))))) {
              _q23 = false;
              break Q24;
            }
          }
        }
        if (_q23) into.push({ move: "shift", a: v_a, n: v_n });
      }
    }
  }

  function shiftLegal(p: Position, m: ShiftMove): boolean {
    const v_a = m.a;
    const v_n = m.n;
    if (!(Number.isInteger(v_a) && v_a >= 0 && v_a < sp.cells.length)) return false;
    let _c36: boolean = (p.block[v_a] !== 0);
    if (_c36) {
      const _g30: number[] = [];
      G31: {
        const _a34 = sp.cells;
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_c = _a34[_i35];
          if (!((p.block[v_c] === p.block[v_a]))) continue;
          _g30.push(v_c);
        }
      }
      _c36 = ((_g30.length > 0 ? _g30[0] : -1) === v_a);
    }
    if (!(_c36)) return false;
    if (!sp.adj4[v_a].includes(v_n)) return false;
    let _q37 = true;
    Q38: {
      const _a39 = sp.cells;
      for (let _i40 = 0; _i40 < _a39.length; _i40++) {
        const v_c = _a39[_i40];
        if (!((p.block[v_c] === p.block[v_a]))) continue;
        const _t41 = p.block[v_a];
        const _t42 = (((v_c % sp.w) + (v_n % sp.w)) - (v_a % sp.w));
        const _t43 = ((((v_c / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0));
        if (!(((((_t42 >= 0 && _t42 < sp.w && _t43 >= 0 && _t43 < sp.h) && (p.ground[(_t43 * sp.w + _t42)] === 0)) && ((p.block[(_t43 * sp.w + _t42)] === 0) || (p.block[(_t43 * sp.w + _t42)] === _t41))) && ((p.field[(_t43 * sp.w + _t42)] === 0) || (_t41 === 1))))) {
          _q37 = false;
          break Q38;
        }
      }
    }
    return _q37;
  }

  function shiftPlay(p: Position, m: ShiftMove): Position {
    const v_a = m.a;
    const v_n = m.n;
    const q: Position = { ...p, block: p.block.slice() };
    {
      const _a44 = sp.cells;
      for (let _i45 = 0; _i45 < _a44.length; _i45++) {
        const v_c = _a44[_i45];
        if (!((p.block[v_c] === p.block[v_a]))) continue;
        q.block[v_c] = 0;
      }
    }
    {
      const _a46 = sp.cells;
      for (let _i47 = 0; _i47 < _a46.length; _i47++) {
        const v_b = _a46[_i47];
        if (!((p.block[v_b] === p.block[v_a]))) continue;
        const v_c = (((((v_b / sp.w) | 0) + ((v_n / sp.w) | 0)) - ((v_a / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_n % sp.w)) - (v_a % sp.w)));
        q.block[v_c] = p.block[v_a];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q48 = false;
      Q49: {
        const _a50 = sp.cells;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_g = _a50[_i51];
          if (!((p.goal[v_g] === 1))) continue;
          let _c59: boolean = (p.block[v_g] === 1);
          if (_c59) {
            let _c58: boolean = (p.block[v_g] !== 0);
            if (_c58) {
              const _g52: number[] = [];
              G53: {
                const _a56 = sp.cells;
                for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                  const v_c = _a56[_i57];
                  if (!((p.block[v_c] === p.block[v_g]))) continue;
                  _g52.push(v_c);
                }
              }
              _c58 = ((_g52.length > 0 ? _g52[0] : -1) === v_g);
            }
            _c59 = _c58;
          }
          if (_c59) {
            _q48 = true;
            break Q49;
          }
        }
      }
      if (!(_q48)) return false;
    }
    return true;
  }

  function lost(_p: Position): boolean {
    return false;
  }

  // The description states no claim: nothing is a proved dead end.
  const deadEnd = (_p: Position): DeadEndId | null => null;

  return {
    moves: (p) => {
      const into: Move[] = [];
      shiftMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "shift": return shiftLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "shift": return shiftPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: () => [],
  };
}
