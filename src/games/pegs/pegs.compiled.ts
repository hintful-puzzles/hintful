// Compiled by `npm run describe` from src/games/pegs/pegs.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["grid"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly grid: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface JumpMove {
  readonly move: "jump";
  readonly f: number;
  readonly o: number;
  readonly t: number;
}

/** A move: its name and its binding. */
export type Move = JumpMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "frozen";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["frozen"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    frozen: (p) => {
      const _fix36 = new Uint8Array(sp.cells.length);
      for (let _grew38 = true; _grew38; ) {
        _grew38 = false;
        for (let _c37 = 0; _c37 < sp.cells.length; _c37++) {
          if (_fix36[_c37] === 1) continue;
          let _c46 = (p.grid[_c37] === 1);
          if (!_c46) {
            let _c45 = (p.grid[_c37] === 0);
            if (_c45) {
              let _q39 = false;
              Q40: {
                const _a41 = sp.adj4[_c37];
                for (let _i42 = 0; _i42 < _a41.length; _i42++) {
                  const v_b = _a41[_i42];
                  const _t43 = ((2 * (v_b % sp.w)) - (_c37 % sp.w));
                  const _t44 = ((2 * ((v_b / sp.w) | 0)) - ((_c37 / sp.w) | 0));
                  if (!((_t43 >= 0 && _t43 < sp.w && _t44 >= 0 && _t44 < sp.h))) continue;
                  const v_a = (((2 * ((v_b / sp.w) | 0)) - ((_c37 / sp.w) | 0)) * sp.w + ((2 * (v_b % sp.w)) - (_c37 % sp.w)));
                  if (((_fix36[v_a] === 1) && (_fix36[v_b] === 1))) {
                    _q39 = true;
                    break Q40;
                  }
                }
              }
              _c45 = _q39;
            }
            _c46 = _c45;
          }
          if (_c46) {
            _fix36[_c37] = 1;
            _grew38 = true;
          }
        }
      }
      let _g24 = 0;
      G25: {
        const _a26 = sp.cells;
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_c = _a26[_i27];
          if (!((p.grid[v_c] === 1))) continue;
          _g24++;
        }
      }
      let _c47 = (_g24 > 1);
      if (_c47) {
        let _q28 = false;
        Q29: {
          const _a30 = sp.cells;
          for (let _i31 = 0; _i31 < _a30.length; _i31++) {
            const v_p = _a30[_i31];
            if (!((p.grid[v_p] === 1))) continue;
            let _q32 = true;
            Q33: {
              const _a34 = sp.adj4[v_p];
              for (let _i35 = 0; _i35 < _a34.length; _i35++) {
                const v_q = _a34[_i35];
                if (!(!((_fix36[v_q] === 1)))) {
                  _q32 = false;
                  break Q33;
                }
              }
            }
            if (_q32) {
              _q28 = true;
              break Q29;
            }
          }
        }
        _c47 = _q28;
      }
      return _c47;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    frozen: (p) => {
      const _fix58 = new Uint8Array(sp.cells.length);
      for (let _grew60 = true; _grew60; ) {
        _grew60 = false;
        for (let _c59 = 0; _c59 < sp.cells.length; _c59++) {
          if (_fix58[_c59] === 1) continue;
          let _c68 = (p.grid[_c59] === 1);
          if (!_c68) {
            let _c67 = (p.grid[_c59] === 0);
            if (_c67) {
              let _q61 = false;
              Q62: {
                const _a63 = sp.adj4[_c59];
                for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                  const v_b = _a63[_i64];
                  const _t65 = ((2 * (v_b % sp.w)) - (_c59 % sp.w));
                  const _t66 = ((2 * ((v_b / sp.w) | 0)) - ((_c59 / sp.w) | 0));
                  if (!((_t65 >= 0 && _t65 < sp.w && _t66 >= 0 && _t66 < sp.h))) continue;
                  const v_a = (((2 * ((v_b / sp.w) | 0)) - ((_c59 / sp.w) | 0)) * sp.w + ((2 * (v_b % sp.w)) - (_c59 % sp.w)));
                  if (((_fix58[v_a] === 1) && (_fix58[v_b] === 1))) {
                    _q61 = true;
                    break Q62;
                  }
                }
              }
              _c67 = _q61;
            }
            _c68 = _c67;
          }
          if (_c68) {
            _fix58[_c59] = 1;
            _grew60 = true;
          }
        }
      }
      const at: number[] = [];
      let _g48 = 0;
      G49: {
        const _a50 = sp.cells;
        for (let _i51 = 0; _i51 < _a50.length; _i51++) {
          const v_c = _a50[_i51];
          if (!((p.grid[v_c] === 1))) continue;
          _g48++;
        }
      }
      if (!((_g48 > 1))) return at;
      const _a52 = sp.cells;
      for (let _i53 = 0; _i53 < _a52.length; _i53++) {
        const v_p = _a52[_i53];
        if (!((p.grid[v_p] === 1))) continue;
        let _q54 = true;
        Q55: {
          const _a56 = sp.adj4[v_p];
          for (let _i57 = 0; _i57 < _a56.length; _i57++) {
            const v_q = _a56[_i57];
            if (!(!((_fix58[v_q] === 1)))) {
              _q54 = false;
              break Q55;
            }
          }
        }
        if (_q54) at.push(v_p);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function jumpMoves(p: Position, into: Move[]): void {
    const _a9 = sp.cells;
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_f = _a9[_i10];
      if (!((p.grid[v_f] === 1))) continue;
      const _a11 = sp.adj4[v_f];
      for (let _i12 = 0; _i12 < _a11.length; _i12++) {
        const v_o = _a11[_i12];
        let _c15 = (p.grid[v_o] === 1);
        if (_c15) {
          const _t13 = ((2 * (v_o % sp.w)) - (v_f % sp.w));
          const _t14 = ((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0));
          _c15 = (_t13 >= 0 && _t13 < sp.w && _t14 >= 0 && _t14 < sp.h);
        }
        if (!(_c15)) continue;
        L16: {
          const v_t = (((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_f % sp.w)));
          if (!((p.grid[v_t] === 0))) break L16;
          into.push({ move: "jump", f: v_f, o: v_o, t: v_t });
        }
      }
    }
  }

  function jumpLegal(p: Position, m: JumpMove): boolean {
    const v_f = m.f;
    const v_o = m.o;
    const v_t = m.t;
    if (!(Number.isInteger(v_f) && v_f >= 0 && v_f < sp.cells.length)) return false;
    if (!((p.grid[v_f] === 1))) return false;
    if (!sp.adj4[v_f].includes(v_o)) return false;
    let _c19 = (p.grid[v_o] === 1);
    if (_c19) {
      const _t17 = ((2 * (v_o % sp.w)) - (v_f % sp.w));
      const _t18 = ((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0));
      _c19 = (_t17 >= 0 && _t17 < sp.w && _t18 >= 0 && _t18 < sp.h);
    }
    if (!(_c19)) return false;
    if (v_t !== (((2 * ((v_o / sp.w) | 0)) - ((v_f / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_f % sp.w)))) return false;
    if (!((p.grid[v_t] === 0))) return false;
    return true;
  }

  function jumpPlay(p: Position, m: JumpMove): Position {
    const v_f = m.f;
    const v_o = m.o;
    const v_t = m.t;
    const q: Position = { ...p, grid: p.grid.slice() };
    {
      const v_c = v_f;
      q.grid[v_c] = 0;
    }
    {
      const v_c = v_o;
      q.grid[v_c] = 0;
    }
    {
      const v_c = v_t;
      q.grid[v_c] = 1;
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _g20 = 0;
      G21: {
        const _a22 = sp.cells;
        for (let _i23 = 0; _i23 < _a22.length; _i23++) {
          const v_c = _a22[_i23];
          if (!((p.grid[v_c] === 1))) continue;
          _g20++;
        }
      }
      if (!((_g20 === 1))) return false;
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
      jumpMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "jump": return jumpLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "jump": return jumpPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
