// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, nextOfSize, sameSet, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  wall: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "darkSet" | "clueSet";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "shine";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "shine" },
];

/** Every technique run as a value is struck from a cell, by id. */
export type StrikingId = never;

/** The techniques run as a value is struck from a cell, in the
 * description's order, each with the variation that adds it where one
 * does. */
export const striking: readonly { id: StrikingId; variation?: string }[] = [
];

/** The ladder: each technique's tier, on its scale where that is not the
 * description's tiers, the least cap it runs at where that is above its
 * tier, the cap from which it no longer runs where it has one, and the
 * variation that adds it where one does, in the order the description
 * lists them, a variation's before the first of a higher tier. */
export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [
  { id: "square", tier: 0 },
  { id: "darkSet", tier: 1 },
  { id: "clueSet", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 2; v_d++) {
      if (!(((v_d === 2) || ((clueAt(cl.wall, v_c) < 0) && (clueAt(cl.number, v_c) < 0))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _k242 = lightsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q234 = true;
  Q235: {
    const _a236 = sp.cells;
    for (let _i237 = 0; _i237 < _a236.length; _i237++) {
      const v_c = _a236[_i237];
      const _h238 = clueAt(cl.wall, v_c);
      const _h239 = clueAt(cl.number, v_c);
      if (!(((_h238 < 0) && (_h239 < 0)))) continue;
      let _q240 = false;
      Q241: {
        const _a243 = (_k242[v_c] ?? lights(sp, cl, v_c));
        for (let _i244 = 0; _i244 < _a243.length; _i244++) {
          const v_p = _a243[_i244];
          const _h245 = (g[v_p] || -1);
          if ((_h245 === 1)) {
            _q240 = true;
            break Q241;
          }
        }
      }
      if (!(_q240)) {
        _q234 = false;
        break Q235;
      }
    }
  }
  if (!(_q234)) return false;
  let _q246 = true;
  Q247: {
    const _a248 = sp.cells;
    for (let _i249 = 0; _i249 < _a248.length; _i249++) {
      const v_c = _a248[_i249];
      const _h250 = (g[v_c] || -1);
      if (!((_h250 === 1))) continue;
      let _q251 = true;
      Q252: {
        const _a253 = (_k242[v_c] ?? lights(sp, cl, v_c));
        for (let _i254 = 0; _i254 < _a253.length; _i254++) {
          const v_p = _a253[_i254];
          if (!((v_p !== v_c))) continue;
          const _h255 = (g[v_p] || -1);
          if (!((_h255 === 2))) {
            _q251 = false;
            break Q252;
          }
        }
      }
      if (!(_q251)) {
        _q246 = false;
        break Q247;
      }
    }
  }
  if (!(_q246)) return false;
  for (let _k256 = 0; _k256 < cl.wall.at.length; _k256++) {
    const _at257 = cl.wall.at[_k256];
    if (!(((g[_at257] || -1) === 2))) return false;
  }
  for (let _k259 = 0; _k259 < cl.number.at.length; _k259++) {
    const _at260 = cl.number.at[_k259];
    const _v261 = cl.number.v[_k259];
    let _c267: boolean = ((g[_at260] || -1) === 2);
    if (_c267) {
      let _g262 = 0;
      G263: {
        const _a264 = sp.adj4[_at260];
        for (let _i265 = 0; _i265 < _a264.length; _i265++) {
          const v_p = _a264[_i265];
          const _h266 = (g[v_p] || -1);
          if (!((_h266 === 1))) continue;
          _g262++;
        }
      }
      _c267 = (_g262 === _v261);
    }
    if (!(_c267)) return false;
  }
  return true;
}

export interface ShineBinding {
  c: number;
  p: number;
}

const shineFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function shine(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<ShineBinding> | null): number {
  const facts = shineFacts;
  let fired = 0;
  let changed = false;
  const _k13 = lightsKept.board(cl);
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a14 = (_k13[v_c] ?? lights(sp, cl, v_c));
  for (let _i15 = 0; _i15 < _a14.length; _i15++) {
    const v_p = _a14[_i15];
    if (!(((v_p !== v_c) && !((b.grid[v_p] !== 0))))) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SquareBinding {
  X: number;
  c: number;
  n: number;
  L: readonly number[];
}

const squareFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  const _k25 = lightsKept.board(cl);
  const _a20 = sp.cols;
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_X = _a20[_i21];
    const _a22 = sp.lineCells[v_X];
    for (let _i23 = 0; _i23 < _a22.length; _i23++) {
      const v_c = _a22[_i23];
      const _h24 = clueAt(cl.number, v_c);
      const _h26 = clueAt(cl.wall, v_c);
      const v_n = _h24;
      const v_L = (_k25[v_c] ?? lights(sp, cl, v_c));
      facts.length = 0;
      changed = false;
      let _c48: boolean = !(((_h26 < 0) && (_h24 < 0)));
      if (!_c48) {
        let _c31: boolean = ((b.grid[v_c] || -1) !== 1);
        if (!_c31) {
          let _q27 = true;
          Q28: {
            const _a29 = v_L;
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_p = _a29[_i30];
              if (!((v_p !== v_c))) continue;
              if (!(((b.grid[v_p] || -1) !== 1))) {
                _q27 = false;
                break Q28;
              }
            }
          }
          _c31 = _q27;
        }
        let _c47: boolean = _c31;
        if (_c47) {
          let _q32 = false;
          Q33: {
            const _a34 = v_L;
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_p = _a34[_i35];
              if (((b.grid[v_p] || -1) === 1)) {
                _q32 = true;
                break Q33;
              }
            }
          }
          let _c46: boolean = _q32;
          if (!_c46) {
            let _g36 = 0;
            G37: {
              const _a38 = v_L;
              for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                const v_p = _a38[_i39];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g36++;
              }
            }
            let _c45: boolean = (_g36 >= 1);
            if (_c45) {
              let _c44: boolean = (_g36 > 1);
              if (!_c44) {
                let _q40 = true;
                Q41: {
                  const _a42 = v_L;
                  for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                    const v_p = _a42[_i43];
                    if (!(!((b.grid[v_p] !== 0)))) continue;
                    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                    if (!(true)) {
                      _q40 = false;
                      break Q41;
                    }
                  }
                }
                _c44 = _q40;
              }
              _c45 = _c44;
            }
            _c46 = _c45;
          }
          _c47 = _c46;
        }
        _c48 = _c47;
      }
      let _c79: boolean = _c48;
      if (_c79) {
        let _c78: boolean = (v_n < 0);
        if (!_c78) {
          let _g49 = 0;
          G50: {
            const _a51 = sp.adj4[v_c];
            for (let _i52 = 0; _i52 < _a51.length; _i52++) {
              const v_p = _a51[_i52];
              if (!(((b.grid[v_p] || -1) === 1))) continue;
              _g49++;
            }
          }
          let _c57: boolean = (_g49 <= v_n);
          if (_c57) {
            let _g53 = 0;
            G54: {
              const _a55 = sp.adj4[v_c];
              for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                const v_p = _a55[_i56];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g53++;
              }
            }
            _c57 = ((_g49 + _g53) >= v_n);
          }
          let _c63: boolean = _c57;
          if (_c63) {
            let _c62: boolean = (_g49 < v_n);
            if (!_c62) {
              let _q58 = true;
              Q59: {
                const _a60 = sp.adj4[v_c];
                for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                  const v_p = _a60[_i61];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                  if (!(true)) {
                    _q58 = false;
                    break Q59;
                  }
                }
              }
              _c62 = _q58;
            }
            _c63 = _c62;
          }
          let _c77: boolean = _c63;
          if (_c77) {
            let _g64 = 0;
            G65: {
              const _a66 = sp.adj4[v_c];
              for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                const v_p = _a66[_i67];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g64++;
              }
            }
            let _g68 = 0;
            G69: {
              const _a70 = sp.adj4[v_c];
              for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                const v_p = _a70[_i71];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g68++;
              }
            }
            let _c76: boolean = ((_g64 + _g68) > v_n);
            if (!_c76) {
              let _q72 = true;
              Q73: {
                const _a74 = sp.adj4[v_c];
                for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                  const v_p = _a74[_i75];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                  if (!(true)) {
                    _q72 = false;
                    break Q73;
                  }
                }
              }
              _c76 = _q72;
            }
            _c77 = _c76;
          }
          _c78 = _c77;
        }
        _c79 = _c78;
      }
      if (!(_c79)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ X: v_X, c: v_c, n: v_n, L: v_L.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DarkSetBinding {
  X: number;
  u: number;
  L: readonly number[];
  S: readonly number[];
}

const darkSetFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function darkSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DarkSetBinding> | null): number {
  const _g107: number[] = [];
  const facts = darkSetFacts;
  let fired = 0;
  let changed = false;
  const _k101 = lightsKept.board(cl);
  const _k126 = rivalsKept.board(cl);
  const _a95 = sp.cols;
  for (let _i96 = 0; _i96 < _a95.length; _i96++) {
    const v_X = _a95[_i96];
    const _a97 = sp.lineCells[v_X];
    for (let _i98 = 0; _i98 < _a97.length; _i98++) {
      const v_u = _a97[_i98];
      const _h99 = clueAt(cl.wall, v_u);
      const _h100 = clueAt(cl.number, v_u);
      if (!(((_h99 < 0) && (_h100 < 0)))) continue;
      L102: {
        const v_L = (_k101[v_u] ?? lights(sp, cl, v_u));
        let _q103 = false;
        Q104: {
          const _a105 = v_L;
          for (let _i106 = 0; _i106 < _a105.length; _i106++) {
            const v_p = _a105[_i106];
            if (((b.grid[v_p] || -1) === 1)) {
              _q103 = true;
              break Q104;
            }
          }
        }
        if (!(!(_q103))) break L102;
        _g107.length = 0;
        G108: {
          const _a111 = v_L;
          for (let _i112 = 0; _i112 < _a111.length; _i112++) {
            const v_s = _a111[_i112];
            if (!(!((b.grid[v_s] !== 0)))) continue;
            _g107.push(v_s);
          }
        }
        const v_S = _g107;
        const _h113 = v_S.length;
        facts.length = 0;
        changed = false;
        let _c145: boolean = (_h113 > 0);
        if (_c145) {
          let _q114 = true;
          Q115: {
            const _a127 = (_k126[(v_S.length > 0 ? v_S[0] : -1)] ?? rivals(sp, cl, (v_S.length > 0 ? v_S[0] : -1)));
            for (let _i128 = 0; _i128 < _a127.length; _i128++) {
              const v_d = _a127[_i128];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              L129: {
                const v_D = (_k101[v_d] ?? lights(sp, cl, v_d));
                let _q130 = true;
                Q131: {
                  const _a132 = v_S;
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_s = _a132[_i133];
                    let _c144: boolean = (v_s !== v_d);
                    if (_c144) {
                      let _c143: boolean = (v_D.includes(v_s));
                      if (!_c143) {
                        let _q134 = false;
                        Q135: {
                          const _a136 = sp.adj4[v_d];
                          for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                            const v_k = _a136[_i137];
                            const _h138 = clueAt(cl.number, v_k);
                            if (!(((_h138 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g139 = 0;
                            G140: {
                              const _a141 = sp.adj4[v_k];
                              for (let _i142 = 0; _i142 < _a141.length; _i142++) {
                                const v_p = _a141[_i142];
                                if (!(((b.grid[v_p] || -1) === 1))) continue;
                                _g139++;
                              }
                            }
                            if (((_g139 + 1) === _h138)) {
                              _q134 = true;
                              break Q135;
                            }
                          }
                        }
                        _c143 = _q134;
                      }
                      _c144 = _c143;
                    }
                    if (!(_c144)) {
                      _q130 = false;
                      break Q131;
                    }
                  }
                }
                if (!(_q130)) break L129;
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q114 = false;
                  break Q115;
                }
              }
            }
          }
          _c145 = _q114;
        }
        if (!(_c145)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ X: v_X, u: v_u, L: v_L.slice(), S: v_S.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ClueSetBinding {
  X: number;
  k: number;
  n: number;
  F: readonly number[];
  m: number;
  T: readonly number[];
}

const clueSetFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clueSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueSetBinding> | null): number {
  const _g181: number[] = [];
  const _g194: number[] = [];
  const _g202: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _k214 = rivalsKept.board(cl);
  const _k217 = lightsKept.board(cl);
  const _a171 = sp.cols;
  for (let _i172 = 0; _i172 < _a171.length; _i172++) {
    const v_X = _a171[_i172];
    const _a173 = sp.lineCells[v_X];
    R2:
    for (let _i174 = 0; _i174 < _a173.length; _i174++) {
      const v_k = _a173[_i174];
      const _h175 = clueAt(cl.number, v_k);
      L176: {
        const v_n = _h175;
        const _m89_0 = b.made[0];
        let _g177 = 0;
        G178: {
          const _a179 = sp.adj4[v_k];
          for (let _i180 = 0; _i180 < _a179.length; _i180++) {
            const v_p = _a179[_i180];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g177++;
          }
        }
        if (!((v_n > _g177))) break L176;
        _g181.length = 0;
        G182: {
          const _a185 = sp.adj4[v_k];
          for (let _i186 = 0; _i186 < _a185.length; _i186++) {
            const v_p = _a185[_i186];
            if (!(!((b.grid[v_p] !== 0)))) continue;
            _g181.push(v_p);
          }
        }
        const v_F = _g181;
        const _h188 = v_F.length;
        L187: {
          const v_m = (v_n - _g177);
          if (!((v_m <= _h188))) break L187;
          const _h196 = (_h188 - v_m);
          const _h197 = (_h196 + 1);
          const _e189 = v_F;
          const _t192 = ((_h188 - v_m) + 1);
          const _n193 = 1 << _e189.length;
          for (let _k190 = _t192 > _e189.length ? _n193 : (1 << _t192) - 1; _k190 < _n193; _k190 = _t192 === 0 ? _n193 : nextOfSize(_k190)) {
            const v_T = _g194;
            v_T.length = 0;
            for (let _j191 = 0; _j191 < _e189.length; _j191++) if ((_k190 >> (_e189.length - 1 - _j191)) & 1) v_T.push(_e189[_j191]);
            const _h195 = v_T.length;
            if (!((_h195 === _h197))) continue;
            if (b.made[0] !== _m89_0) {
              let _g198 = 0;
              G199: {
                const _a200 = sp.adj4[v_k];
                for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                  const v_p = _a200[_i201];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g198++;
                }
              }
              if (!((v_n > _g198))) { continue R2; }
              _g202.length = 0;
              G203: {
                const _a206 = sp.adj4[v_k];
                for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                  const v_p = _a206[_i207];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g202.push(v_p);
                }
              }
              if (!(sameSet(v_F, _g202))) { continue R2; }
              let _g208 = 0;
              G209: {
                const _a210 = sp.adj4[v_k];
                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                  const v_p = _a210[_i211];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g208++;
                }
              }
              if (!((v_m === (v_n - _g208)))) { continue R2; }
            }
            facts.length = 0;
            changed = false;
            let _q212 = true;
            Q213: {
              const _a215 = (_k214[(v_T.length > 0 ? v_T[0] : -1)] ?? rivals(sp, cl, (v_T.length > 0 ? v_T[0] : -1)));
              for (let _i216 = 0; _i216 < _a215.length; _i216++) {
                const v_d = _a215[_i216];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                L218: {
                  const v_D = (_k217[v_d] ?? lights(sp, cl, v_d));
                  let _q219 = true;
                  Q220: {
                    const _a221 = v_T;
                    for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                      const v_s = _a221[_i222];
                      let _c233: boolean = (v_s !== v_d);
                      if (_c233) {
                        let _c232: boolean = (v_D.includes(v_s));
                        if (!_c232) {
                          let _q223 = false;
                          Q224: {
                            const _a225 = sp.adj4[v_d];
                            for (let _i226 = 0; _i226 < _a225.length; _i226++) {
                              const v_k = _a225[_i226];
                              const _h227 = clueAt(cl.number, v_k);
                              if (!(((_h227 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g228 = 0;
                              G229: {
                                const _a230 = sp.adj4[v_k];
                                for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                                  const v_p = _a230[_i231];
                                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                                  _g228++;
                                }
                              }
                              if (((_g228 + 1) === _h227)) {
                                _q223 = true;
                                break Q224;
                              }
                            }
                          }
                          _c232 = _q223;
                        }
                        _c233 = _c232;
                      }
                      if (!(_c233)) {
                        _q219 = false;
                        break Q220;
                      }
                    }
                  }
                  if (!(_q219)) break L218;
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q212 = false;
                    break Q213;
                  }
                }
              }
            }
            if (!(_q212)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ X: v_X, k: v_k, n: v_n, F: v_F.slice(), m: v_m, T: v_T.slice() }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

const floorsKept = keptStore<readonly number[]>();
let floorsOn: object | null = null;
let floorsAt: Kept<readonly number[]> = [];

/** `floors(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function floors(sp: GridSpace, cl: Dealt, v_L: number): readonly number[] {
  if (cl !== floorsOn) {
    floorsAt = floorsKept.board(cl);
    floorsOn = cl;
  }
  const _kept: Kept<readonly number[]> = floorsAt;
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _g5: number[] = [];
  G6: {
    const _a9 = sp.lineCells[v_L];
    for (let _i10 = 0; _i10 < _a9.length; _i10++) {
      const v_x = _a9[_i10];
      if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
      _g5.push(v_x);
    }
  }
  const _made = _g5;
  _kept[v_L] = _made;
  return _made;
}

const lightsKept = keptStore<readonly number[]>();
let lightsOn: object | null = null;
let lightsAt: Kept<readonly number[]> = [];

/** `lights(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function lights(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  if (cl !== lightsOn) {
    lightsAt = lightsKept.board(cl);
    lightsOn = cl;
  }
  const _kept: Kept<readonly number[]> = lightsAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, floors(sp, cl, sp.rowOf[v_c])), stretch(sp.lineCells[sp.colOf[v_c]], v_c, floors(sp, cl, sp.colOf[v_c])));
  _kept[v_c] = _made;
  return _made;
}

const rivalsKept = keptStore<readonly number[]>();
let rivalsOn: object | null = null;
let rivalsAt: Kept<readonly number[]> = [];

/** `rivals(s)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function rivals(sp: GridSpace, cl: Dealt, v_s: number): readonly number[] {
  if (cl !== rivalsOn) {
    rivalsAt = rivalsKept.board(cl);
    rivalsOn = cl;
  }
  const _kept: Kept<readonly number[]> = rivalsAt;
  if (_kept[v_s] !== undefined) return _kept[v_s];
  const _g116: number[] = [];
  G117: {
    const _a122 = sp.adj4[v_s];
    for (let _i123 = 0; _i123 < _a122.length; _i123++) {
      const v_k = _a122[_i123];
      const _a124 = sp.adj4[v_k];
      for (let _i125 = 0; _i125 < _a124.length; _i125++) {
        const v_p = _a124[_i125];
        if (!_g116.includes(v_p)) _g116.push(v_p);
      }
    }
  }
  const _made = union(lights(sp, cl, v_s), _g116);
  _kept[v_s] = _made;
  return _made;
}
