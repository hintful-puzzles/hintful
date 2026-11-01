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
      const _fix45 = new Uint8Array(sp.cells.length);
      for (let _grew47 = true; _grew47; ) {
        _grew47 = false;
        for (let _c46 = 0; _c46 < sp.cells.length; _c46++) {
          if (_fix45[_c46] === 1) continue;
          let _c62 = (p.ball[_c46] === 1);
          if (!_c62) {
            let _c61 = (p.kind[_c46] !== 2);
            if (_c61) {
              let _q48 = false;
              Q49: {
                const _a50 = sp.adj8[_c46];
                for (let _i51 = 0; _i51 < _a50.length; _i51++) {
                  const v_n = _a50[_i51];
                  const _a52 = ray(sp, _c46, v_n);
                  for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                    const v_b = _a52[_i53];
                    if (!(((_fix45[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((_c46 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c46 % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                    const _t54 = (((((v_b / sp.w) | 0) + ((_c46 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c46 % sp.w)) - (v_n % sp.w)));
                    const _g55: number[] = [];
                    G56: {
                      const v_R = ray(sp, v_b, _t54);
                      const _a59 = v_R;
                      for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                        const v_c = _a59[_i60];
                        if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i60 + 1) === v_R.length)) || (p.kind[(v_R[(_i60 + 1)] ?? -1)] === 4)))) continue;
                        if (!_g55.includes(v_c)) _g55.push(v_c);
                      }
                    }
                    if (((_g55.length > 0 ? _g55[0] : -1) === _c46)) {
                      _q48 = true;
                      break Q49;
                    }
                  }
                }
              }
              _c61 = _q48;
            }
            _c62 = _c61;
          }
          if (_c62) {
            _fix45[_c46] = 1;
            _grew47 = true;
          }
        }
      }
      let _q31 = false;
      Q32: {
        const _a33 = sp.cells;
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_c = _a33[_i34];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q31 = true;
            break Q32;
          }
        }
      }
      let _c69 = !(_q31);
      if (_c69) {
        let _q35 = false;
        Q36: {
          const _a37 = sp.cells;
          for (let _i38 = 0; _i38 < _a37.length; _i38++) {
            const v_g = _a37[_i38];
            if (!((p.kind[v_g] === 1))) continue;
            let _q39 = false;
            Q40: {
              const _a41 = sp.adj8[v_g];
              for (let _i42 = 0; _i42 < _a41.length; _i42++) {
                const v_n = _a41[_i42];
                const _a43 = ray(sp, v_g, v_n);
                for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                  const v_b = _a43[_i44];
                  if (!(((_fix45[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                  const v_s = (((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)));
                  const v_R = ray(sp, v_b, v_s);
                  const _g63: number[] = [];
                  G64: {
                    const v_R = ray(sp, v_b, v_s);
                    const _a67 = v_R;
                    for (let _i68 = 0; _i68 < _a67.length; _i68++) {
                      const v_c = _a67[_i68];
                      if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i68 + 1) === v_R.length)) || (p.kind[(v_R[(_i68 + 1)] ?? -1)] === 4)))) continue;
                      if (!_g63.includes(v_c)) _g63.push(v_c);
                    }
                  }
                  if ((v_R.indexOf(v_g) <= v_R.indexOf((_g63.length > 0 ? _g63[0] : -1)))) {
                    _q39 = true;
                    break Q40;
                  }
                }
              }
            }
            if (!(_q39)) {
              _q35 = true;
              break Q36;
            }
          }
        }
        _c69 = _q35;
      }
      return _c69;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    stranded: (p) => {
      const _fix82 = new Uint8Array(sp.cells.length);
      for (let _grew84 = true; _grew84; ) {
        _grew84 = false;
        for (let _c83 = 0; _c83 < sp.cells.length; _c83++) {
          if (_fix82[_c83] === 1) continue;
          let _c99 = (p.ball[_c83] === 1);
          if (!_c99) {
            let _c98 = (p.kind[_c83] !== 2);
            if (_c98) {
              let _q85 = false;
              Q86: {
                const _a87 = sp.adj8[_c83];
                for (let _i88 = 0; _i88 < _a87.length; _i88++) {
                  const v_n = _a87[_i88];
                  const _a89 = ray(sp, _c83, v_n);
                  for (let _i90 = 0; _i90 < _a89.length; _i90++) {
                    const v_b = _a89[_i90];
                    if (!(((_fix82[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((_c83 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c83 % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
                    const _t91 = (((((v_b / sp.w) | 0) + ((_c83 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (_c83 % sp.w)) - (v_n % sp.w)));
                    const _g92: number[] = [];
                    G93: {
                      const v_R = ray(sp, v_b, _t91);
                      const _a96 = v_R;
                      for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                        const v_c = _a96[_i97];
                        if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i97 + 1) === v_R.length)) || (p.kind[(v_R[(_i97 + 1)] ?? -1)] === 4)))) continue;
                        if (!_g92.includes(v_c)) _g92.push(v_c);
                      }
                    }
                    if (((_g92.length > 0 ? _g92[0] : -1) === _c83)) {
                      _q85 = true;
                      break Q86;
                    }
                  }
                }
              }
              _c98 = _q85;
            }
            _c99 = _c98;
          }
          if (_c99) {
            _fix82[_c83] = 1;
            _grew84 = true;
          }
        }
      }
      const at: number[] = [];
      let _q70 = false;
      Q71: {
        const _a72 = sp.cells;
        for (let _i73 = 0; _i73 < _a72.length; _i73++) {
          const v_c = _a72[_i73];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q70 = true;
            break Q71;
          }
        }
      }
      if (!(!(_q70))) return at;
      const _a74 = sp.cells;
      for (let _i75 = 0; _i75 < _a74.length; _i75++) {
        const v_g = _a74[_i75];
        if (!((p.kind[v_g] === 1))) continue;
        let _q76 = false;
        Q77: {
          const _a78 = sp.adj8[v_g];
          for (let _i79 = 0; _i79 < _a78.length; _i79++) {
            const v_n = _a78[_i79];
            const _a80 = ray(sp, v_g, v_n);
            for (let _i81 = 0; _i81 < _a80.length; _i81++) {
              const v_b = _a80[_i81];
              if (!(((_fix82[v_b] === 1) && (p.kind[(((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)))] !== 4)))) continue;
              const v_s = (((((v_b / sp.w) | 0) + ((v_g / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + (((v_b % sp.w) + (v_g % sp.w)) - (v_n % sp.w)));
              const v_R = ray(sp, v_b, v_s);
              const _g100: number[] = [];
              G101: {
                const v_R = ray(sp, v_b, v_s);
                const _a104 = v_R;
                for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                  const v_c = _a104[_i105];
                  if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i105 + 1) === v_R.length)) || (p.kind[(v_R[(_i105 + 1)] ?? -1)] === 4)))) continue;
                  if (!_g100.includes(v_c)) _g100.push(v_c);
                }
              }
              if ((v_R.indexOf(v_g) <= v_R.indexOf((_g100.length > 0 ? _g100[0] : -1)))) {
                _q76 = true;
                break Q77;
              }
            }
          }
        }
        if (!(_q76)) at.push(v_g);
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
      const v_b = _a5[_i6];
      if (!((p.ball[v_b] === 1))) continue;
      const _a7 = sp.adj8[v_b];
      for (let _i8 = 0; _i8 < _a7.length; _i8++) {
        const v_n = _a7[_i8];
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
      const v_t = (_g9.length > 0 ? _g9[0] : -1);
      const v_R = ray(sp, v_b, v_n);
      const _a15 = v_R;
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_c = _a15[_i16];
        if (!(((_i16 <= v_R.indexOf(v_t)) && (p.kind[v_c] === 1)))) continue;
        q.kind[v_c] = 0;
      }
    }
    {
      const v_c = v_b;
      q.ball[v_c] = 0;
    }
    {
      const _g17: number[] = [];
      G18: {
        const v_R = ray(sp, v_b, v_n);
        const _a21 = v_R;
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_c = _a21[_i22];
          if (!(((((p.kind[v_c] === 2) || (p.kind[v_c] === 3)) || ((_i22 + 1) === v_R.length)) || (p.kind[(v_R[(_i22 + 1)] ?? -1)] === 4)))) continue;
          if (!_g17.includes(v_c)) _g17.push(v_c);
        }
      }
      const v_c = (_g17.length > 0 ? _g17[0] : -1);
      q.ball[v_c] = 1;
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q23 = true;
      Q24: {
        const _a25 = sp.cells;
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_c = _a25[_i26];
          if (!((p.kind[v_c] !== 1))) {
            _q23 = false;
            break Q24;
          }
        }
      }
      if (!(_q23)) return false;
    }
    return true;
  }

  function lost(p: Position): boolean {
    {
      let _q27 = false;
      Q28: {
        const _a29 = sp.cells;
        for (let _i30 = 0; _i30 < _a29.length; _i30++) {
          const v_c = _a29[_i30];
          if (((p.ball[v_c] === 1) && (p.kind[v_c] === 2))) {
            _q27 = true;
            break Q28;
          }
        }
      }
      if (_q27) return true;
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
