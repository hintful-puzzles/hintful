// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, nextOfSize, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q214 = true;
  Q215: {
    const _a216 = sp.cells;
    for (let _i217 = 0; _i217 < _a216.length; _i217++) {
      const v_c = _a216[_i217];
      const _h218 = clueAt(cl.wall, v_c);
      const _h219 = clueAt(cl.number, v_c);
      if (!(((_h218 < 0) && (_h219 < 0)))) continue;
      let _q220 = false;
      Q221: {
        const _a222 = lights(sp, cl, v_c);
        for (let _i223 = 0; _i223 < _a222.length; _i223++) {
          const v_p = _a222[_i223];
          const _h224 = (g[v_p] || -1);
          if ((_h224 === 1)) {
            _q220 = true;
            break Q221;
          }
        }
      }
      if (!(_q220)) {
        _q214 = false;
        break Q215;
      }
    }
  }
  if (!(_q214)) return false;
  let _q225 = true;
  Q226: {
    const _a227 = sp.cells;
    for (let _i228 = 0; _i228 < _a227.length; _i228++) {
      const v_c = _a227[_i228];
      const _h229 = (g[v_c] || -1);
      if (!((_h229 === 1))) continue;
      let _q230 = true;
      Q231: {
        const _a232 = lights(sp, cl, v_c);
        for (let _i233 = 0; _i233 < _a232.length; _i233++) {
          const v_p = _a232[_i233];
          if (!((v_p !== v_c))) continue;
          const _h234 = (g[v_p] || -1);
          if (!((_h234 === 2))) {
            _q230 = false;
            break Q231;
          }
        }
      }
      if (!(_q230)) {
        _q225 = false;
        break Q226;
      }
    }
  }
  if (!(_q225)) return false;
  for (let _k235 = 0; _k235 < cl.wall.at.length; _k235++) {
    const _at236 = cl.wall.at[_k235];
    if (!(((g[_at236] || -1) === 2))) return false;
  }
  for (let _k238 = 0; _k238 < cl.number.at.length; _k238++) {
    const _at239 = cl.number.at[_k238];
    const _v240 = cl.number.v[_k238];
    let _c246: boolean = ((g[_at239] || -1) === 2);
    if (_c246) {
      let _g241 = 0;
      G242: {
        const _a243 = sp.adj4[_at239];
        for (let _i244 = 0; _i244 < _a243.length; _i244++) {
          const v_p = _a243[_i244];
          const _h245 = (g[v_p] || -1);
          if (!((_h245 === 1))) continue;
          _g241++;
        }
      }
      _c246 = (_g241 === _v240);
    }
    if (!(_c246)) return false;
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
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a13 = lights(sp, cl, v_c);
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_p = _a13[_i14];
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
  const _a19 = sp.cols;
  for (let _i20 = 0; _i20 < _a19.length; _i20++) {
    const v_X = _a19[_i20];
    const _a21 = sp.lineCells[v_X];
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_c = _a21[_i22];
      const _h23 = clueAt(cl.number, v_c);
      const _h24 = clueAt(cl.wall, v_c);
      const v_n = _h23;
      const v_L = lights(sp, cl, v_c);
      facts.length = 0;
      changed = false;
      let _c46: boolean = !(((_h24 < 0) && (_h23 < 0)));
      if (!_c46) {
        let _c29: boolean = ((b.grid[v_c] || -1) !== 1);
        if (!_c29) {
          let _q25 = true;
          Q26: {
            const _a27 = v_L;
            for (let _i28 = 0; _i28 < _a27.length; _i28++) {
              const v_p = _a27[_i28];
              if (!((v_p !== v_c))) continue;
              if (!(((b.grid[v_p] || -1) !== 1))) {
                _q25 = false;
                break Q26;
              }
            }
          }
          _c29 = _q25;
        }
        let _c45: boolean = _c29;
        if (_c45) {
          let _q30 = false;
          Q31: {
            const _a32 = v_L;
            for (let _i33 = 0; _i33 < _a32.length; _i33++) {
              const v_p = _a32[_i33];
              if (((b.grid[v_p] || -1) === 1)) {
                _q30 = true;
                break Q31;
              }
            }
          }
          let _c44: boolean = _q30;
          if (!_c44) {
            let _g34 = 0;
            G35: {
              const _a36 = v_L;
              for (let _i37 = 0; _i37 < _a36.length; _i37++) {
                const v_p = _a36[_i37];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g34++;
              }
            }
            let _c43: boolean = (_g34 >= 1);
            if (_c43) {
              let _c42: boolean = (_g34 > 1);
              if (!_c42) {
                let _q38 = true;
                Q39: {
                  const _a40 = v_L;
                  for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                    const v_p = _a40[_i41];
                    if (!(!((b.grid[v_p] !== 0)))) continue;
                    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                    if (!(true)) {
                      _q38 = false;
                      break Q39;
                    }
                  }
                }
                _c42 = _q38;
              }
              _c43 = _c42;
            }
            _c44 = _c43;
          }
          _c45 = _c44;
        }
        _c46 = _c45;
      }
      let _c77: boolean = _c46;
      if (_c77) {
        let _c76: boolean = (v_n < 0);
        if (!_c76) {
          let _g47 = 0;
          G48: {
            const _a49 = sp.adj4[v_c];
            for (let _i50 = 0; _i50 < _a49.length; _i50++) {
              const v_p = _a49[_i50];
              if (!(((b.grid[v_p] || -1) === 1))) continue;
              _g47++;
            }
          }
          let _c55: boolean = (_g47 <= v_n);
          if (_c55) {
            let _g51 = 0;
            G52: {
              const _a53 = sp.adj4[v_c];
              for (let _i54 = 0; _i54 < _a53.length; _i54++) {
                const v_p = _a53[_i54];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g51++;
              }
            }
            _c55 = ((_g47 + _g51) >= v_n);
          }
          let _c61: boolean = _c55;
          if (_c61) {
            let _c60: boolean = (_g47 < v_n);
            if (!_c60) {
              let _q56 = true;
              Q57: {
                const _a58 = sp.adj4[v_c];
                for (let _i59 = 0; _i59 < _a58.length; _i59++) {
                  const v_p = _a58[_i59];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                  if (!(true)) {
                    _q56 = false;
                    break Q57;
                  }
                }
              }
              _c60 = _q56;
            }
            _c61 = _c60;
          }
          let _c75: boolean = _c61;
          if (_c75) {
            let _g62 = 0;
            G63: {
              const _a64 = sp.adj4[v_c];
              for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                const v_p = _a64[_i65];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g62++;
              }
            }
            let _g66 = 0;
            G67: {
              const _a68 = sp.adj4[v_c];
              for (let _i69 = 0; _i69 < _a68.length; _i69++) {
                const v_p = _a68[_i69];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g66++;
              }
            }
            let _c74: boolean = ((_g62 + _g66) > v_n);
            if (!_c74) {
              let _q70 = true;
              Q71: {
                const _a72 = sp.adj4[v_c];
                for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                  const v_p = _a72[_i73];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                  if (!(true)) {
                    _q70 = false;
                    break Q71;
                  }
                }
              }
              _c74 = _q70;
            }
            _c75 = _c74;
          }
          _c76 = _c75;
        }
        _c77 = _c76;
      }
      if (!(_c77)) return -1;
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
  const _g104: number[] = [];
  const facts = darkSetFacts;
  let fired = 0;
  let changed = false;
  const _a93 = sp.cols;
  for (let _i94 = 0; _i94 < _a93.length; _i94++) {
    const v_X = _a93[_i94];
    const _a95 = sp.lineCells[v_X];
    for (let _i96 = 0; _i96 < _a95.length; _i96++) {
      const v_u = _a95[_i96];
      const _h97 = clueAt(cl.wall, v_u);
      const _h98 = clueAt(cl.number, v_u);
      if (!(((_h97 < 0) && (_h98 < 0)))) continue;
      L99: {
        const v_L = lights(sp, cl, v_u);
        let _q100 = false;
        Q101: {
          const _a102 = v_L;
          for (let _i103 = 0; _i103 < _a102.length; _i103++) {
            const v_p = _a102[_i103];
            if (((b.grid[v_p] || -1) === 1)) {
              _q100 = true;
              break Q101;
            }
          }
        }
        if (!(!(_q100))) break L99;
        _g104.length = 0;
        G105: {
          const _a108 = v_L;
          for (let _i109 = 0; _i109 < _a108.length; _i109++) {
            const v_s = _a108[_i109];
            if (!(!((b.grid[v_s] !== 0)))) continue;
            _g104.push(v_s);
          }
        }
        const v_S = _g104;
        const _h110 = v_S.length;
        facts.length = 0;
        changed = false;
        let _c141: boolean = (_h110 > 0);
        if (_c141) {
          let _q111 = true;
          Q112: {
            const _a123 = rivals(sp, cl, (v_S.length > 0 ? v_S[0] : -1));
            for (let _i124 = 0; _i124 < _a123.length; _i124++) {
              const v_d = _a123[_i124];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              L125: {
                const v_D = lights(sp, cl, v_d);
                let _q126 = true;
                Q127: {
                  const _a128 = v_S;
                  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                    const v_s = _a128[_i129];
                    let _c140: boolean = (v_s !== v_d);
                    if (_c140) {
                      let _c139: boolean = (v_D.includes(v_s));
                      if (!_c139) {
                        let _q130 = false;
                        Q131: {
                          const _a132 = sp.adj4[v_d];
                          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                            const v_k = _a132[_i133];
                            const _h134 = clueAt(cl.number, v_k);
                            if (!(((_h134 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g135 = 0;
                            G136: {
                              const _a137 = sp.adj4[v_k];
                              for (let _i138 = 0; _i138 < _a137.length; _i138++) {
                                const v_p = _a137[_i138];
                                if (!(((b.grid[v_p] || -1) === 1))) continue;
                                _g135++;
                              }
                            }
                            if (((_g135 + 1) === _h134)) {
                              _q130 = true;
                              break Q131;
                            }
                          }
                        }
                        _c139 = _q130;
                      }
                      _c140 = _c139;
                    }
                    if (!(_c140)) {
                      _q126 = false;
                      break Q127;
                    }
                  }
                }
                if (!(_q126)) break L125;
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q111 = false;
                  break Q112;
                }
              }
            }
          }
          _c141 = _q111;
        }
        if (!(_c141)) return -1;
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
  const _g177: number[] = [];
  const _g190: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _a167 = sp.cols;
  for (let _i168 = 0; _i168 < _a167.length; _i168++) {
    const v_X = _a167[_i168];
    const _a169 = sp.lineCells[v_X];
    for (let _i170 = 0; _i170 < _a169.length; _i170++) {
      const v_k = _a169[_i170];
      const _h171 = clueAt(cl.number, v_k);
      L172: {
        const v_n = _h171;
        let _g173 = 0;
        G174: {
          const _a175 = sp.adj4[v_k];
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            const v_p = _a175[_i176];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g173++;
          }
        }
        if (!((v_n > _g173))) break L172;
        _g177.length = 0;
        G178: {
          const _a181 = sp.adj4[v_k];
          for (let _i182 = 0; _i182 < _a181.length; _i182++) {
            const v_p = _a181[_i182];
            if (!(!((b.grid[v_p] !== 0)))) continue;
            _g177.push(v_p);
          }
        }
        const v_F = _g177;
        const _h184 = v_F.length;
        L183: {
          const v_m = (v_n - _g173);
          if (!((v_m <= _h184))) break L183;
          const _h192 = (_h184 - v_m);
          const _h193 = (_h192 + 1);
          const _e185 = v_F;
          const _t188 = ((_h184 - v_m) + 1);
          const _n189 = 1 << _e185.length;
          for (let _k186 = _t188 > _e185.length ? _n189 : (1 << _t188) - 1; _k186 < _n189; _k186 = _t188 === 0 ? _n189 : nextOfSize(_k186)) {
            const v_T = _g190;
            v_T.length = 0;
            for (let _j187 = 0; _j187 < _e185.length; _j187++) if ((_k186 >> (_e185.length - 1 - _j187)) & 1) v_T.push(_e185[_j187]);
            const _h191 = v_T.length;
            if (!((_h191 === _h193))) continue;
            facts.length = 0;
            changed = false;
            let _q194 = true;
            Q195: {
              const _a196 = rivals(sp, cl, (v_T.length > 0 ? v_T[0] : -1));
              for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                const v_d = _a196[_i197];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                L198: {
                  const v_D = lights(sp, cl, v_d);
                  let _q199 = true;
                  Q200: {
                    const _a201 = v_T;
                    for (let _i202 = 0; _i202 < _a201.length; _i202++) {
                      const v_s = _a201[_i202];
                      let _c213: boolean = (v_s !== v_d);
                      if (_c213) {
                        let _c212: boolean = (v_D.includes(v_s));
                        if (!_c212) {
                          let _q203 = false;
                          Q204: {
                            const _a205 = sp.adj4[v_d];
                            for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                              const v_k = _a205[_i206];
                              const _h207 = clueAt(cl.number, v_k);
                              if (!(((_h207 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g208 = 0;
                              G209: {
                                const _a210 = sp.adj4[v_k];
                                for (let _i211 = 0; _i211 < _a210.length; _i211++) {
                                  const v_p = _a210[_i211];
                                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                                  _g208++;
                                }
                              }
                              if (((_g208 + 1) === _h207)) {
                                _q203 = true;
                                break Q204;
                              }
                            }
                          }
                          _c212 = _q203;
                        }
                        _c213 = _c212;
                      }
                      if (!(_c213)) {
                        _q199 = false;
                        break Q200;
                      }
                    }
                  }
                  if (!(_q199)) break L198;
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q194 = false;
                    break Q195;
                  }
                }
              }
            }
            if (!(_q194)) return -1;
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

/** `floors(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function floors(sp: GridSpace, cl: Dealt, v_L: number): readonly number[] {
  const _kept: Kept<readonly number[]> = floorsKept.board(cl);
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

/** `lights(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function lights(sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = lightsKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, floors(sp, cl, sp.rowOf[v_c])), stretch(sp.lineCells[sp.colOf[v_c]], v_c, floors(sp, cl, sp.colOf[v_c])));
  _kept[v_c] = _made;
  return _made;
}

const rivalsKept = keptStore<readonly number[]>();

/** `rivals(s)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function rivals(sp: GridSpace, cl: Dealt, v_s: number): readonly number[] {
  const _kept: Kept<readonly number[]> = rivalsKept.board(cl);
  if (_kept[v_s] !== undefined) return _kept[v_s];
  const _g113: number[] = [];
  G114: {
    const _a119 = sp.adj4[v_s];
    for (let _i120 = 0; _i120 < _a119.length; _i120++) {
      const v_k = _a119[_i120];
      const _a121 = sp.adj4[v_k];
      for (let _i122 = 0; _i122 < _a121.length; _i122++) {
        const v_p = _a121[_i122];
        if (!_g113.includes(v_p)) _g113.push(v_p);
      }
    }
  }
  const _made = union(lights(sp, cl, v_s), _g113);
  _kept[v_s] = _made;
  return _made;
}
