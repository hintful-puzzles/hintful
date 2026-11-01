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
      let _q100 = false;
      Q101: {
        const _a102 = sp.cells;
        for (let _i103 = 0; _i103 < _a102.length; _i103++) {
          const v_c = _a102[_i103];
          if ((p.tile[v_c] !== 0)) {
            _q100 = true;
            break Q101;
          }
        }
      }
      let _c112 = _q100;
      if (_c112) {
        let _q104 = true;
        Q105: {
          const _a106 = sp.cells;
          for (let _i107 = 0; _i107 < _a106.length; _i107++) {
            const v_c = _a106[_i107];
            if (!((p.tile[v_c] !== 0))) continue;
            let _q108 = true;
            Q109: {
              const _a110 = sp.adj4[v_c];
              for (let _i111 = 0; _i111 < _a110.length; _i111++) {
                const v_n = _a110[_i111];
                if (!((p.tile[v_n] !== p.tile[v_c]))) {
                  _q108 = false;
                  break Q109;
                }
              }
            }
            if (!(_q108)) {
              _q104 = false;
              break Q105;
            }
          }
        }
        _c112 = _q104;
      }
      return _c112;
    },
    last: (p) => {
      let _q113 = false;
      Q114: {
        const _a115 = sp.cells;
        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
          const v_c = _a115[_i116];
          if (!((p.tile[v_c] !== 0))) continue;
          let _q117 = true;
          Q118: {
            const _a119 = sp.cells;
            for (let _i120 = 0; _i120 < _a119.length; _i120++) {
              const v_d = _a119[_i120];
              if (!((v_d !== v_c))) continue;
              if (!((p.tile[v_d] !== p.tile[v_c]))) {
                _q117 = false;
                break Q118;
              }
            }
          }
          if (_q117) {
            _q113 = true;
            break Q114;
          }
        }
      }
      return _q113;
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
      const _a121 = sp.cells;
      for (let _i122 = 0; _i122 < _a121.length; _i122++) {
        const v_c = _a121[_i122];
        if (!((p.tile[v_c] !== 0))) continue;
        let _q123 = true;
        Q124: {
          const _a125 = sp.cells;
          for (let _i126 = 0; _i126 < _a125.length; _i126++) {
            const v_d = _a125[_i126];
            if (!((v_d !== v_c))) continue;
            if (!((p.tile[v_d] !== p.tile[v_c]))) {
              _q123 = false;
              break Q124;
            }
          }
        }
        if (_q123) at.push(v_c);
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
      const _sets138 = new Map<number, Uint8Array>();
      const _fix128Of = (_a131: number): Uint8Array => {
        const kept = _sets138.get(_a131);
        if (kept !== undefined) return kept;
        const _fix128 = new Uint8Array(sp.cells.length);
        for (let _grew130 = true; _grew130; ) {
          _grew130 = false;
          for (let _c129 = 0; _c129 < sp.cells.length; _c129++) {
            if (_fix128[_c129] === 1) continue;
            let _c137 = (_c129 === _a131);
            if (!_c137) {
              let _c136 = (p.tile[_c129] === p.tile[_a131]);
              if (_c136) {
                let _q132 = false;
                Q133: {
                  const _a134 = sp.adj4[_c129];
                  for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                    const v_n = _a134[_i135];
                    if ((_fix128[v_n] === 1)) {
                      _q132 = true;
                      break Q133;
                    }
                  }
                }
                _c136 = _q132;
              }
              _c137 = _c136;
            }
            if (_c137) {
              _fix128[_c129] = 1;
              _grew130 = true;
            }
          }
        }
        _sets138.set(_a131, _fix128);
        return _fix128;
      };
      const at: number[] = [];
      for (let _c127 = 0; _c127 < sp.cells.length; _c127++) {
        if ((_fix128Of(a0)[_c127] === 1)) at.push(_c127);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function removeMoves(p: Position, into: Move[]): void {
    const _sets45 = new Map<number, Uint8Array>();
    const _fix35Of = (_a38: number): Uint8Array => {
      const kept = _sets45.get(_a38);
      if (kept !== undefined) return kept;
      const _fix35 = new Uint8Array(sp.cells.length);
      for (let _grew37 = true; _grew37; ) {
        _grew37 = false;
        for (let _c36 = 0; _c36 < sp.cells.length; _c36++) {
          if (_fix35[_c36] === 1) continue;
          let _c44 = (_c36 === _a38);
          if (!_c44) {
            let _c43 = (p.tile[_c36] === p.tile[_a38]);
            if (_c43) {
              let _q39 = false;
              Q40: {
                const _a41 = sp.adj4[_c36];
                for (let _i42 = 0; _i42 < _a41.length; _i42++) {
                  const v_n = _a41[_i42];
                  if ((_fix35[v_n] === 1)) {
                    _q39 = true;
                    break Q40;
                  }
                }
              }
              _c43 = _q39;
            }
            _c44 = _c43;
          }
          if (_c44) {
            _fix35[_c36] = 1;
            _grew37 = true;
          }
        }
      }
      _sets45.set(_a38, _fix35);
      return _fix35;
    };
    const _a24 = sp.cells;
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      const v_s = _a24[_i25];
      let _c30 = (p.tile[v_s] !== 0);
      if (_c30) {
        let _q26 = false;
        Q27: {
          const _a28 = sp.adj4[v_s];
          for (let _i29 = 0; _i29 < _a28.length; _i29++) {
            const v_n = _a28[_i29];
            if ((p.tile[v_n] === p.tile[v_s])) {
              _q26 = true;
              break Q27;
            }
          }
        }
        _c30 = _q26;
      }
      let _c46 = _c30;
      if (_c46) {
        let _q31 = true;
        Q32: {
          const _a33 = sp.cells;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!((_fix35Of(v_s)[v_c] === 1))) continue;
            if (!((_i34 >= _i25))) {
              _q31 = false;
              break Q32;
            }
          }
        }
        _c46 = _q31;
      }
      if (!(_c46)) continue;
      into.push({ move: "remove", s: v_s });
    }
  }

  function removeLegal(p: Position, m: RemoveMove): boolean {
    const v_s = m.s;
    const _sets66 = new Map<number, Uint8Array>();
    const _fix56Of = (_a59: number): Uint8Array => {
      const kept = _sets66.get(_a59);
      if (kept !== undefined) return kept;
      const _fix56 = new Uint8Array(sp.cells.length);
      for (let _grew58 = true; _grew58; ) {
        _grew58 = false;
        for (let _c57 = 0; _c57 < sp.cells.length; _c57++) {
          if (_fix56[_c57] === 1) continue;
          let _c65 = (_c57 === _a59);
          if (!_c65) {
            let _c64 = (p.tile[_c57] === p.tile[_a59]);
            if (_c64) {
              let _q60 = false;
              Q61: {
                const _a62 = sp.adj4[_c57];
                for (let _i63 = 0; _i63 < _a62.length; _i63++) {
                  const v_n = _a62[_i63];
                  if ((_fix56[v_n] === 1)) {
                    _q60 = true;
                    break Q61;
                  }
                }
              }
              _c64 = _q60;
            }
            _c65 = _c64;
          }
          if (_c65) {
            _fix56[_c57] = 1;
            _grew58 = true;
          }
        }
      }
      _sets66.set(_a59, _fix56);
      return _fix56;
    };
    if (!(Number.isInteger(v_s) && v_s >= 0 && v_s < sp.cells.length)) return false;
    let _c51 = (p.tile[v_s] !== 0);
    if (_c51) {
      let _q47 = false;
      Q48: {
        const _a49 = sp.adj4[v_s];
        for (let _i50 = 0; _i50 < _a49.length; _i50++) {
          const v_n = _a49[_i50];
          if ((p.tile[v_n] === p.tile[v_s])) {
            _q47 = true;
            break Q48;
          }
        }
      }
      _c51 = _q47;
    }
    let _c67 = _c51;
    if (_c67) {
      let _q52 = true;
      Q53: {
        const _a54 = sp.cells;
        for (let _i55 = 0; _i55 < _a54.length; _i55++) {
          const v_c = _a54[_i55];
          if (!((_fix56Of(v_s)[v_c] === 1))) continue;
          if (!((_i55 >= v_s))) {
            _q52 = false;
            break Q53;
          }
        }
      }
      _c67 = _q52;
    }
    if (!(_c67)) return false;
    return true;
  }

  function removePlay(p: Position, m: RemoveMove): Position {
    const v_s = m.s;
    const _sets82 = new Map<number, Uint8Array>();
    const _fix72Of = (_a75: number): Uint8Array => {
      const kept = _sets82.get(_a75);
      if (kept !== undefined) return kept;
      const _fix72 = new Uint8Array(sp.cells.length);
      for (let _grew74 = true; _grew74; ) {
        _grew74 = false;
        for (let _c73 = 0; _c73 < sp.cells.length; _c73++) {
          if (_fix72[_c73] === 1) continue;
          let _c81 = (_c73 === _a75);
          if (!_c81) {
            let _c80 = (p.tile[_c73] === p.tile[_a75]);
            if (_c80) {
              let _q76 = false;
              Q77: {
                const _a78 = sp.adj4[_c73];
                for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                  const v_n = _a78[_i79];
                  if ((_fix72[v_n] === 1)) {
                    _q76 = true;
                    break Q77;
                  }
                }
              }
              _c80 = _q76;
            }
            _c81 = _c80;
          }
          if (_c81) {
            _fix72[_c73] = 1;
            _grew74 = true;
          }
        }
      }
      _sets82.set(_a75, _fix72);
      return _fix72;
    };
    const q: Position = { ...p, tile: p.tile.slice() };
    {
      const _a68 = sp.cells;
      for (let _i69 = 0; _i69 < _a68.length; _i69++) {
        const v_c = _a68[_i69];
        q.tile[v_c] = 0;
      }
    }
    {
      const _a70 = sp.cells;
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_c = _a70[_i71];
        if (!(((p.tile[v_c] !== 0) && !((_fix72Of(v_s)[v_c] === 1))))) continue;
        let _g83 = 0;
        G84: {
          const _a85 = sp.cols;
          const _n86 = _a85.indexOf(sp.colOf[v_c]);
          for (let _i87 = 0; _i87 < _n86; _i87++) {
            const v_L = _a85[_i87];
            let _q88 = false;
            Q89: {
              const _a90 = sp.lineCells[v_L];
              for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                const v_d = _a90[_i91];
                if (((p.tile[v_d] !== 0) && !((_fix72Of(v_s)[v_d] === 1)))) {
                  _q88 = true;
                  break Q89;
                }
              }
            }
            if (!(_q88)) continue;
            _g83++;
          }
        }
        let _g92 = 0;
        G93: {
          const _a94 = sp.lineCells[sp.colOf[v_c]];
          for (let _i95 = 0; _i95 < _a94.length; _i95++) {
            const v_d = _a94[_i95];
            if (!(((((v_d / sp.w) | 0) > ((v_c / sp.w) | 0)) && ((p.tile[v_d] !== 0) && !((_fix72Of(v_s)[v_d] === 1)))))) continue;
            _g92++;
          }
        }
        const v_t = (((sp.h - 1) - _g92) * sp.w + _g83);
        q.tile[v_t] = p.tile[v_c];
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q96 = true;
      Q97: {
        const _a98 = sp.cells;
        for (let _i99 = 0; _i99 < _a98.length; _i99++) {
          const v_c = _a98[_i99];
          if (!((p.tile[v_c] === 0))) {
            _q96 = false;
            break Q97;
          }
        }
      }
      if (!(_q96)) return false;
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
