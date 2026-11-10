// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, freshBinding, keptStore, nextOfSize, sameSet, staleChecking, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _k266 = lightsKept.board(cl);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q258 = true;
  Q259: {
    const _a260 = sp.cells;
    for (let _i261 = 0; _i261 < _a260.length; _i261++) {
      const v_c = _a260[_i261];
      const _h262 = clueAt(cl.wall, v_c);
      const _h263 = clueAt(cl.number, v_c);
      if (!(((_h262 < 0) && (_h263 < 0)))) continue;
      let _q264 = false;
      Q265: {
        const _a267 = (_k266[v_c] ?? lights(sp, cl, v_c));
        for (let _i268 = 0; _i268 < _a267.length; _i268++) {
          const v_p = _a267[_i268];
          const _h269 = (g[v_p] || -1);
          if ((_h269 === 1)) {
            _q264 = true;
            break Q265;
          }
        }
      }
      if (!(_q264)) {
        _q258 = false;
        break Q259;
      }
    }
  }
  if (!(_q258)) return false;
  let _q270 = true;
  Q271: {
    const _a272 = sp.cells;
    for (let _i273 = 0; _i273 < _a272.length; _i273++) {
      const v_c = _a272[_i273];
      const _h274 = (g[v_c] || -1);
      if (!((_h274 === 1))) continue;
      let _q275 = true;
      Q276: {
        const _a277 = (_k266[v_c] ?? lights(sp, cl, v_c));
        for (let _i278 = 0; _i278 < _a277.length; _i278++) {
          const v_p = _a277[_i278];
          if (!((v_p !== v_c))) continue;
          const _h279 = (g[v_p] || -1);
          if (!((_h279 === 2))) {
            _q275 = false;
            break Q276;
          }
        }
      }
      if (!(_q275)) {
        _q270 = false;
        break Q271;
      }
    }
  }
  if (!(_q270)) return false;
  for (let _k280 = 0; _k280 < cl.wall.at.length; _k280++) {
    const _at281 = cl.wall.at[_k280];
    if (!(((g[_at281] || -1) === 2))) return false;
  }
  for (let _k283 = 0; _k283 < cl.number.at.length; _k283++) {
    const _at284 = cl.number.at[_k283];
    const _v285 = cl.number.v[_k283];
    let _c291: boolean = ((g[_at284] || -1) === 2);
    if (_c291) {
      let _g286 = 0;
      G287: {
        const _a288 = sp.adj4[_at284];
        for (let _i289 = 0; _i289 < _a288.length; _i289++) {
          const v_p = _a288[_i289];
          const _h290 = (g[v_p] || -1);
          if (!((_h290 === 1))) continue;
          _g286++;
        }
      }
      _c291 = (_g286 === _v285);
    }
    if (!(_c291)) return false;
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
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("shine", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), (lights(sp, cl, v_c).includes(v_p)), ((v_p !== v_c) && !((b.grid[v_p] !== 0)))], ["c in", "where of c", "p in", "where of p"]);
    }
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
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("square", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_c)), (v_n === clueAt(cl.number, v_c)), sameSet(v_L, lights(sp, cl, v_c))], ["X in", "c in", "n =", "L ="]);
      }
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
  const _k136 = rivalsKept.board(cl);
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
        const _h123 = v_S.length;
        if (import.meta.env.DEV && staleChecking) {
          let _q113 = false;
          Q114: {
            const _a115 = v_L;
            for (let _i116 = 0; _i116 < _a115.length; _i116++) {
              const v_p = _a115[_i116];
              if (((b.grid[v_p] || -1) === 1)) {
                _q113 = true;
                break Q114;
              }
            }
          }
          const _g117: number[] = [];
          G118: {
            const _a121 = v_L;
            for (let _i122 = 0; _i122 < _a121.length; _i122++) {
              const v_s = _a121[_i122];
              if (!(!((b.grid[v_s] !== 0)))) continue;
              _g117.push(v_s);
            }
          }
          freshBinding("darkSet", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_u)), ((clueAt(cl.wall, v_u) < 0) && (clueAt(cl.number, v_u) < 0)), sameSet(v_L, lights(sp, cl, v_u)), !(_q113), sameSet(v_S, _g117)], ["X in", "u in", "where of u", "L =", "where of L", "S ="]);
        }
        facts.length = 0;
        changed = false;
        let _c155: boolean = (_h123 > 0);
        if (_c155) {
          let _q124 = true;
          Q125: {
            const _a137 = (_k136[(v_S.length > 0 ? v_S[0] : -1)] ?? rivals(sp, cl, (v_S.length > 0 ? v_S[0] : -1)));
            for (let _i138 = 0; _i138 < _a137.length; _i138++) {
              const v_d = _a137[_i138];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              L139: {
                const v_D = (_k101[v_d] ?? lights(sp, cl, v_d));
                let _q140 = true;
                Q141: {
                  const _a142 = v_S;
                  for (let _i143 = 0; _i143 < _a142.length; _i143++) {
                    const v_s = _a142[_i143];
                    let _c154: boolean = (v_s !== v_d);
                    if (_c154) {
                      let _c153: boolean = (v_D.includes(v_s));
                      if (!_c153) {
                        let _q144 = false;
                        Q145: {
                          const _a146 = sp.adj4[v_d];
                          for (let _i147 = 0; _i147 < _a146.length; _i147++) {
                            const v_k = _a146[_i147];
                            const _h148 = clueAt(cl.number, v_k);
                            if (!(((_h148 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g149 = 0;
                            G150: {
                              const _a151 = sp.adj4[v_k];
                              for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                                const v_p = _a151[_i152];
                                if (!(((b.grid[v_p] || -1) === 1))) continue;
                                _g149++;
                              }
                            }
                            if (((_g149 + 1) === _h148)) {
                              _q144 = true;
                              break Q145;
                            }
                          }
                        }
                        _c153 = _q144;
                      }
                      _c154 = _c153;
                    }
                    if (!(_c154)) {
                      _q140 = false;
                      break Q141;
                    }
                  }
                }
                if (!(_q140)) break L139;
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q124 = false;
                  break Q125;
                }
              }
            }
          }
          _c155 = _q124;
        }
        if (!(_c155)) return -1;
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
  const _g191: number[] = [];
  const _g204: number[] = [];
  const _g212: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _k238 = rivalsKept.board(cl);
  const _k241 = lightsKept.board(cl);
  const _a181 = sp.cols;
  for (let _i182 = 0; _i182 < _a181.length; _i182++) {
    const v_X = _a181[_i182];
    const _a183 = sp.lineCells[v_X];
    R2:
    for (let _i184 = 0; _i184 < _a183.length; _i184++) {
      const v_k = _a183[_i184];
      const _h185 = clueAt(cl.number, v_k);
      L186: {
        const v_n = _h185;
        const _m89_0 = b.made[0];
        let _g187 = 0;
        G188: {
          const _a189 = sp.adj4[v_k];
          for (let _i190 = 0; _i190 < _a189.length; _i190++) {
            const v_p = _a189[_i190];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g187++;
          }
        }
        if (!((v_n > _g187))) break L186;
        _g191.length = 0;
        G192: {
          const _a195 = sp.adj4[v_k];
          for (let _i196 = 0; _i196 < _a195.length; _i196++) {
            const v_p = _a195[_i196];
            if (!(!((b.grid[v_p] !== 0)))) continue;
            _g191.push(v_p);
          }
        }
        const v_F = _g191;
        const _h198 = v_F.length;
        L197: {
          const v_m = (v_n - _g187);
          if (!((v_m <= _h198))) break L197;
          const _h206 = (_h198 - v_m);
          const _h207 = (_h206 + 1);
          const _e199 = v_F;
          const _t202 = ((_h198 - v_m) + 1);
          const _n203 = 1 << _e199.length;
          for (let _k200 = _t202 > _e199.length ? _n203 : (1 << _t202) - 1; _k200 < _n203; _k200 = _t202 === 0 ? _n203 : nextOfSize(_k200)) {
            const v_T = _g204;
            v_T.length = 0;
            for (let _j201 = 0; _j201 < _e199.length; _j201++) if ((_k200 >> (_e199.length - 1 - _j201)) & 1) v_T.push(_e199[_j201]);
            const _h205 = v_T.length;
            if (!((_h205 === _h207))) continue;
            if (b.made[0] !== _m89_0) {
              let _g208 = 0;
              G209: {
                const _a210 = sp.adj4[v_k];
                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                  const v_p = _a210[_i211];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g208++;
                }
              }
              if (!((v_n > _g208))) { continue R2; }
              _g212.length = 0;
              G213: {
                const _a216 = sp.adj4[v_k];
                for (let _i217 = 0; _i217 < _a216.length; _i217++) {
                  const v_p = _a216[_i217];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g212.push(v_p);
                }
              }
              if (!(sameSet(v_F, _g212))) { continue R2; }
              let _g218 = 0;
              G219: {
                const _a220 = sp.adj4[v_k];
                for (let _i221 = 0; _i221 < _a220.length; _i221++) {
                  const v_p = _a220[_i221];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g218++;
                }
              }
              if (!((v_m === (v_n - _g218)))) { continue R2; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _g222 = 0;
              G223: {
                const _a224 = sp.adj4[v_k];
                for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                  const v_p = _a224[_i225];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g222++;
                }
              }
              const _g226: number[] = [];
              G227: {
                const _a230 = sp.adj4[v_k];
                for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                  const v_p = _a230[_i231];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g226.push(v_p);
                }
              }
              let _g232 = 0;
              G233: {
                const _a234 = sp.adj4[v_k];
                for (let _i235 = 0; _i235 < _a234.length; _i235++) {
                  const v_p = _a234[_i235];
                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                  _g232++;
                }
              }
              freshBinding("clueSet", [(sp.cols.includes(v_X)), (sp.lineCells[v_X].includes(v_k)), (v_n === clueAt(cl.number, v_k)), (v_n > _g222), sameSet(v_F, _g226), (v_m === (v_n - _g232)), (v_m <= v_F.length), (v_T.length === ((v_F.length - v_m) + 1))], ["X in", "k in", "n =", "where of n", "F =", "m =", "where of m", "where of T"]);
            }
            facts.length = 0;
            changed = false;
            let _q236 = true;
            Q237: {
              const _a239 = (_k238[(v_T.length > 0 ? v_T[0] : -1)] ?? rivals(sp, cl, (v_T.length > 0 ? v_T[0] : -1)));
              for (let _i240 = 0; _i240 < _a239.length; _i240++) {
                const v_d = _a239[_i240];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                L242: {
                  const v_D = (_k241[v_d] ?? lights(sp, cl, v_d));
                  let _q243 = true;
                  Q244: {
                    const _a245 = v_T;
                    for (let _i246 = 0; _i246 < _a245.length; _i246++) {
                      const v_s = _a245[_i246];
                      let _c257: boolean = (v_s !== v_d);
                      if (_c257) {
                        let _c256: boolean = (v_D.includes(v_s));
                        if (!_c256) {
                          let _q247 = false;
                          Q248: {
                            const _a249 = sp.adj4[v_d];
                            for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                              const v_k = _a249[_i250];
                              const _h251 = clueAt(cl.number, v_k);
                              if (!(((_h251 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g252 = 0;
                              G253: {
                                const _a254 = sp.adj4[v_k];
                                for (let _i255 = 0; _i255 < _a254.length; _i255++) {
                                  const v_p = _a254[_i255];
                                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                                  _g252++;
                                }
                              }
                              if (((_g252 + 1) === _h251)) {
                                _q247 = true;
                                break Q248;
                              }
                            }
                          }
                          _c256 = _q247;
                        }
                        _c257 = _c256;
                      }
                      if (!(_c257)) {
                        _q243 = false;
                        break Q244;
                      }
                    }
                  }
                  if (!(_q243)) break L242;
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q236 = false;
                    break Q237;
                  }
                }
              }
            }
            if (!(_q236)) return -1;
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
  const _g126: number[] = [];
  G127: {
    const _a132 = sp.adj4[v_s];
    for (let _i133 = 0; _i133 < _a132.length; _i133++) {
      const v_k = _a132[_i133];
      const _a134 = sp.adj4[v_k];
      for (let _i135 = 0; _i135 < _a134.length; _i135++) {
        const v_p = _a134[_i135];
        if (!_g126.includes(v_p)) _g126.push(v_p);
      }
    }
  }
  const _made = union(lights(sp, cl, v_s), _g126);
  _kept[v_s] = _made;
  return _made;
}
