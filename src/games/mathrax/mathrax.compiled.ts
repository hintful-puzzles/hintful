// Compiled by `npm run describe` from src/games/mathrax/mathrax.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt, popcount, rangeMask } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  sum: ClueList;
  difference: ClueList;
  product: ClueList;
  quotient: ClueList;
  parity: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "clueEasy" | "latin.hiddenSingle" | "latin.single" | "clue" | "latin.set" | "clueTricky" | "latin.fish" | "latin.wing";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
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
  { id: "clueEasy", tier: 0 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "clue", tier: 1 },
  { id: "latin.set", tier: 1 },
  { id: "clueTricky", tier: 2 },
  { id: "latin.fish", tier: 2 },
  { id: "latin.wing", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q393 = true;
  const _n397 = new Int32Array(32);
  Q394: for (const _u395 of sp.lines) {
    _n397.fill(0);
    for (const _c396 of sp.lineCells[_u395]) {
      const _t398 = (g[_c396] || -1);
      if (++_n397[_t398] > 1) {
        _q393 = false;
        break Q394;
      }
    }
  }
  if (!(_q393)) return false;
  for (let _k399 = 0; _k399 < cl.sum.at.length; _k399++) {
    const _at400 = cl.sum.at[_k399];
    const _v401 = cl.sum.v[_k399];
    let _q402 = true;
    Q403: {
      const _a404 = sp.cornerCells[_at400];
      for (let _i405 = 0; _i405 < _a404.length; _i405++) {
        const v_c = _a404[_i405];
        const _h406 = (g[v_c] || -1);
        if (!(((_h406 + (g[(sp.cornerCells[_at400][0] + sp.cornerCells[_at400][3] - v_c)] || -1)) === _v401))) {
          _q402 = false;
          break Q403;
        }
      }
    }
    if (!(_q402)) return false;
  }
  for (let _k407 = 0; _k407 < cl.difference.at.length; _k407++) {
    const _at408 = cl.difference.at[_k407];
    const _v409 = cl.difference.v[_k407];
    let _q410 = true;
    Q411: {
      const _a412 = sp.cornerCells[_at408];
      for (let _i413 = 0; _i413 < _a412.length; _i413++) {
        const v_c = _a412[_i413];
        const _h414 = (g[v_c] || -1);
        if (!((Math.abs((_h414 - (g[(sp.cornerCells[_at408][0] + sp.cornerCells[_at408][3] - v_c)] || -1))) === _v409))) {
          _q410 = false;
          break Q411;
        }
      }
    }
    if (!(_q410)) return false;
  }
  for (let _k415 = 0; _k415 < cl.product.at.length; _k415++) {
    const _at416 = cl.product.at[_k415];
    const _v417 = cl.product.v[_k415];
    let _q418 = true;
    Q419: {
      const _a420 = sp.cornerCells[_at416];
      for (let _i421 = 0; _i421 < _a420.length; _i421++) {
        const v_c = _a420[_i421];
        const _h422 = (g[v_c] || -1);
        if (!(((_h422 * (g[(sp.cornerCells[_at416][0] + sp.cornerCells[_at416][3] - v_c)] || -1)) === _v417))) {
          _q418 = false;
          break Q419;
        }
      }
    }
    if (!(_q418)) return false;
  }
  for (let _k423 = 0; _k423 < cl.quotient.at.length; _k423++) {
    const _at424 = cl.quotient.at[_k423];
    const _v425 = cl.quotient.v[_k423];
    let _q426 = true;
    Q427: {
      const _a428 = sp.cornerCells[_at424];
      for (let _i429 = 0; _i429 < _a428.length; _i429++) {
        const v_c = _a428[_i429];
        const _h430 = (g[v_c] || -1);
        if (!(((_h430 === (_v425 * (g[(sp.cornerCells[_at424][0] + sp.cornerCells[_at424][3] - v_c)] || -1))) || ((g[(sp.cornerCells[_at424][0] + sp.cornerCells[_at424][3] - v_c)] || -1) === (_v425 * _h430))))) {
          _q426 = false;
          break Q427;
        }
      }
    }
    if (!(_q426)) return false;
  }
  for (let _k431 = 0; _k431 < cl.parity.at.length; _k431++) {
    const _at432 = cl.parity.at[_k431];
    const _v433 = cl.parity.v[_k431];
    let _q434 = true;
    Q435: {
      const _a436 = sp.cornerCells[_at432];
      for (let _i437 = 0; _i437 < _a436.length; _i437++) {
        const v_c = _a436[_i437];
        const _h438 = (g[v_c] || -1);
        if (!(((_h438 % 2) === _v433))) {
          _q434 = false;
          break Q435;
        }
      }
    }
    if (!(_q434)) return false;
  }
  return true;
}

export interface ClueEasyBinding {
  c: number;
  M: number;
  k: number;
}

const clueEasyFacts: number[] = [];
let clueEasyCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function clueEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueEasyBinding> | null): number {
  const facts = clueEasyFacts;
  let fired = 0;
  let changed = false;
  if (clueEasyCands.length < sp.cells.length) clueEasyCands = new Int32Array(sp.cells.length);
  const cands = clueEasyCands;
  cands.fill(-1);
  const _a36 = sp.cells;
  R1:
  for (let _i37 = 0; _i37 < _a36.length; _i37++) {
    const v_c = _a36[_i37];
    const _m7_1 = b.made[1];
    let _g38 = 0;
    G39: {
      const _a54 = sp.cellCorners[v_c];
      for (let _i55 = 0; _i55 < _a54.length; _i55++) {
        const v_j = _a54[_i55];
        const _h56 = clueAt(cl.parity, v_j);
        const _h57 = clueAt(cl.sum, v_j);
        const _h58 = clueAt(cl.difference, v_j);
        const _h59 = clueAt(cl.product, v_j);
        const _h60 = clueAt(cl.quotient, v_j);
        let _c63: boolean = (_h56 !== -1);
        if (!_c63) {
          let _c62: boolean = ((((_h57 !== -1) || (_h58 !== -1)) || (_h59 !== -1)) || (_h60 !== -1));
          if (_c62) {
            const _t61 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
            _c62 = (popcount((cands[_t61] >= 0 ? cands[_t61] : (cands[_t61] = b.cands[_t61]))) < 2);
          }
          _c63 = _c62;
        }
        if (!(_c63)) continue;
        const _h65 = (_h56 === -1);
        const _h66 = (_h57 !== -1);
        const _h67 = (_h58 !== -1);
        const _h68 = (_h66 || _h67);
        const _h69 = (_h59 !== -1);
        const _h70 = (_h68 || _h69);
        const _h71 = (_h60 !== -1);
        const _h72 = (_h70 || _h71);
        const _h73 = _h72;
        const _h74 = !(_h73);
        const _h75 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h79 = (_h57 === -1);
        const _h80 = (_h58 === -1);
        const _h81 = (_h59 === -1);
        const _h82 = (_h60 === -1);
        for (let _m64 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m64 !== 0; _m64 &= _m64 - 1) {
          const v_d = 31 - Math.clz32(_m64 & -_m64);
          const _h83 = (_h60 * v_d);
          let _c85: boolean = (_h65 || ((v_d % 2) === _h56));
          if (_c85) {
            let _c84: boolean = (_h74 || (popcount((cands[_h75] >= 0 ? cands[_h75] : (cands[_h75] = b.cands[_h75]))) > 1));
            if (!_c84) {
              let _q76 = false;
              Q77: {
                for (let _m78 = (cands[_h75] >= 0 ? cands[_h75] : (cands[_h75] = b.cands[_h75])); _m78 !== 0; _m78 &= _m78 - 1) {
                  const v_e = 31 - Math.clz32(_m78 & -_m78);
                  if (((((_h79 || ((v_d + v_e) === _h57)) && (_h80 || (Math.abs((v_d - v_e)) === _h58))) && (_h81 || ((v_d * v_e) === _h59))) && ((_h82 || (v_d === (_h60 * v_e))) || (v_e === _h83)))) {
                    _q76 = true;
                    break Q77;
                  }
                }
              }
              _c84 = _q76;
            }
            _c85 = _c84;
          }
          if (!(!(_c85))) continue;
          _g38 |= 1 << v_d;
        }
      }
    }
    L86: {
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g38);
      const _h87 = popcount(v_M);
      if (!((_h87 < 2))) break L86;
      const _h120 = (_h87 > 0);
      const _a88 = sp.cellCorners[v_c];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_k = _a88[_i89];
        const _h124 = clueAt(cl.parity, v_k);
        const _h125 = (_h124 === -1);
        const _h126 = clueAt(cl.sum, v_k);
        const _h127 = (_h126 !== -1);
        const _h128 = clueAt(cl.difference, v_k);
        const _h129 = (_h128 !== -1);
        const _h130 = (_h127 || _h129);
        const _h131 = clueAt(cl.product, v_k);
        const _h132 = (_h131 !== -1);
        const _h133 = (_h130 || _h132);
        const _h134 = clueAt(cl.quotient, v_k);
        const _h135 = (_h134 !== -1);
        const _h136 = (_h133 || _h135);
        const _h137 = _h136;
        const _h138 = !(_h137);
        const _h139 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h143 = (_h126 === -1);
        const _h144 = (_h128 === -1);
        const _h145 = (_h131 === -1);
        const _h146 = (_h134 === -1);
        if (b.made[1] !== _m7_1) {
          let _g90 = 0;
          G91: {
            const _a106 = sp.cellCorners[v_c];
            for (let _i107 = 0; _i107 < _a106.length; _i107++) {
              const v_j = _a106[_i107];
              let _c110: boolean = (clueAt(cl.parity, v_j) !== -1);
              if (!_c110) {
                let _c109: boolean = ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1));
                if (_c109) {
                  const _t108 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                  _c109 = (popcount((cands[_t108] >= 0 ? cands[_t108] : (cands[_t108] = b.cands[_t108]))) < 2);
                }
                _c110 = _c109;
              }
              if (!(_c110)) continue;
              for (let _m111 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m111 !== 0; _m111 &= _m111 - 1) {
                const v_d = 31 - Math.clz32(_m111 & -_m111);
                let _c119: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c119) {
                  let _c113: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c113) {
                    const _t112 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    _c113 = (popcount((cands[_t112] >= 0 ? cands[_t112] : (cands[_t112] = b.cands[_t112]))) > 1);
                  }
                  let _c118: boolean = _c113;
                  if (!_c118) {
                    let _q114 = false;
                    Q115: {
                      const _t116 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m117 = (cands[_t116] >= 0 ? cands[_t116] : (cands[_t116] = b.cands[_t116])); _m117 !== 0; _m117 &= _m117 - 1) {
                        const v_e = 31 - Math.clz32(_m117 & -_m117);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q114 = true;
                          break Q115;
                        }
                      }
                    }
                    _c118 = _q114;
                  }
                  _c119 = _c118;
                }
                if (!(!(_c119))) continue;
                _g90 |= 1 << v_d;
              }
            }
          }
          if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g90)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c150: boolean = _h120;
        if (_c150) {
          let _q121 = true;
          Q122: {
            for (let _m123 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m123 !== 0; _m123 &= _m123 - 1) {
              const v_d = 31 - Math.clz32(_m123 & -_m123);
              const _h147 = (_h134 * v_d);
              let _c149: boolean = (_h125 || ((v_d % 2) === _h124));
              if (_c149) {
                let _c148: boolean = (_h138 || (popcount((cands[_h139] >= 0 ? cands[_h139] : (cands[_h139] = b.cands[_h139]))) > 1));
                if (!_c148) {
                  let _q140 = false;
                  Q141: {
                    for (let _m142 = (cands[_h139] >= 0 ? cands[_h139] : (cands[_h139] = b.cands[_h139])); _m142 !== 0; _m142 &= _m142 - 1) {
                      const v_e = 31 - Math.clz32(_m142 & -_m142);
                      if (((((_h143 || ((v_d + v_e) === _h126)) && (_h144 || (Math.abs((v_d - v_e)) === _h128))) && (_h145 || ((v_d * v_e) === _h131))) && ((_h146 || (v_d === (_h134 * v_e))) || (v_e === _h147)))) {
                        _q140 = true;
                        break Q141;
                      }
                    }
                  }
                  _c148 = _q140;
                }
                _c149 = _c148;
              }
              if (!(!(_c149))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q121 = false;
                break Q122;
              }
            }
          }
          _c150 = _q121;
        }
        if (!(_c150)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, M: v_M, k: v_k }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface ClueBinding {
  c: number;
  M: number;
  k: number;
}

const clueFacts: number[] = [];
let clueCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function clue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBinding> | null): number {
  const facts = clueFacts;
  let fired = 0;
  let changed = false;
  if (clueCands.length < sp.cells.length) clueCands = new Int32Array(sp.cells.length);
  const cands = clueCands;
  cands.fill(-1);
  const _a176 = sp.cells;
  R1:
  for (let _i177 = 0; _i177 < _a176.length; _i177++) {
    const v_c = _a176[_i177];
    const _m31_1 = b.made[1];
    let _g178 = 0;
    G179: {
      const _a189 = sp.cellCorners[v_c];
      for (let _i190 = 0; _i190 < _a189.length; _i190++) {
        const v_j = _a189[_i190];
        const _h191 = clueAt(cl.parity, v_j);
        const _h192 = clueAt(cl.sum, v_j);
        const _h193 = clueAt(cl.difference, v_j);
        const _h194 = clueAt(cl.product, v_j);
        const _h195 = clueAt(cl.quotient, v_j);
        if (!(((_h191 !== -1) || ((((_h192 !== -1) || (_h193 !== -1)) || (_h194 !== -1)) || (_h195 !== -1))))) continue;
        const _h197 = (_h191 === -1);
        const _h198 = (_h192 !== -1);
        const _h199 = (_h193 !== -1);
        const _h200 = (_h198 || _h199);
        const _h201 = (_h194 !== -1);
        const _h202 = (_h200 || _h201);
        const _h203 = (_h195 !== -1);
        const _h204 = (_h202 || _h203);
        const _h205 = _h204;
        const _h206 = !(_h205);
        const _h209 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h211 = (_h192 === -1);
        const _h212 = (_h193 === -1);
        const _h213 = (_h194 === -1);
        const _h214 = (_h195 === -1);
        for (let _m196 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m196 !== 0; _m196 &= _m196 - 1) {
          const v_d = 31 - Math.clz32(_m196 & -_m196);
          const _h215 = (_h195 * v_d);
          let _c217: boolean = (_h197 || ((v_d % 2) === _h191));
          if (_c217) {
            let _c216: boolean = _h206;
            if (!_c216) {
              let _q207 = false;
              Q208: {
                for (let _m210 = (cands[_h209] >= 0 ? cands[_h209] : (cands[_h209] = b.cands[_h209])); _m210 !== 0; _m210 &= _m210 - 1) {
                  const v_e = 31 - Math.clz32(_m210 & -_m210);
                  if (((((_h211 || ((v_d + v_e) === _h192)) && (_h212 || (Math.abs((v_d - v_e)) === _h193))) && (_h213 || ((v_d * v_e) === _h194))) && ((_h214 || (v_d === (_h195 * v_e))) || (v_e === _h215)))) {
                    _q207 = true;
                    break Q208;
                  }
                }
              }
              _c216 = _q207;
            }
            _c217 = _c216;
          }
          if (!(!(_c217))) continue;
          _g178 |= 1 << v_d;
        }
      }
    }
    L218: {
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g178);
      const _h219 = popcount(v_M);
      if (!((_h219 < 2))) break L218;
      const _h242 = (_h219 > 0);
      const _a220 = sp.cellCorners[v_c];
      for (let _i221 = 0; _i221 < _a220.length; _i221++) {
        const v_k = _a220[_i221];
        const _h246 = clueAt(cl.parity, v_k);
        const _h247 = (_h246 === -1);
        const _h248 = clueAt(cl.sum, v_k);
        const _h249 = (_h248 !== -1);
        const _h250 = clueAt(cl.difference, v_k);
        const _h251 = (_h250 !== -1);
        const _h252 = (_h249 || _h251);
        const _h253 = clueAt(cl.product, v_k);
        const _h254 = (_h253 !== -1);
        const _h255 = (_h252 || _h254);
        const _h256 = clueAt(cl.quotient, v_k);
        const _h257 = (_h256 !== -1);
        const _h258 = (_h255 || _h257);
        const _h259 = _h258;
        const _h260 = !(_h259);
        const _h263 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h265 = (_h248 === -1);
        const _h266 = (_h250 === -1);
        const _h267 = (_h253 === -1);
        const _h268 = (_h256 === -1);
        if (b.made[1] !== _m31_1) {
          let _g222 = 0;
          G223: {
            const _a233 = sp.cellCorners[v_c];
            for (let _i234 = 0; _i234 < _a233.length; _i234++) {
              const v_j = _a233[_i234];
              if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
              for (let _m235 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m235 !== 0; _m235 &= _m235 - 1) {
                const v_d = 31 - Math.clz32(_m235 & -_m235);
                let _c241: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c241) {
                  let _c240: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c240) {
                    let _q236 = false;
                    Q237: {
                      const _t238 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m239 = (cands[_t238] >= 0 ? cands[_t238] : (cands[_t238] = b.cands[_t238])); _m239 !== 0; _m239 &= _m239 - 1) {
                        const v_e = 31 - Math.clz32(_m239 & -_m239);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q236 = true;
                          break Q237;
                        }
                      }
                    }
                    _c240 = _q236;
                  }
                  _c241 = _c240;
                }
                if (!(!(_c241))) continue;
                _g222 |= 1 << v_d;
              }
            }
          }
          if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g222)))) { continue R1; }
        }
        facts.length = 0;
        changed = false;
        let _c272: boolean = _h242;
        if (_c272) {
          let _q243 = true;
          Q244: {
            for (let _m245 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m245 !== 0; _m245 &= _m245 - 1) {
              const v_d = 31 - Math.clz32(_m245 & -_m245);
              const _h269 = (_h256 * v_d);
              let _c271: boolean = (_h247 || ((v_d % 2) === _h246));
              if (_c271) {
                let _c270: boolean = _h260;
                if (!_c270) {
                  let _q261 = false;
                  Q262: {
                    for (let _m264 = (cands[_h263] >= 0 ? cands[_h263] : (cands[_h263] = b.cands[_h263])); _m264 !== 0; _m264 &= _m264 - 1) {
                      const v_e = 31 - Math.clz32(_m264 & -_m264);
                      if (((((_h265 || ((v_d + v_e) === _h248)) && (_h266 || (Math.abs((v_d - v_e)) === _h250))) && (_h267 || ((v_d * v_e) === _h253))) && ((_h268 || (v_d === (_h256 * v_e))) || (v_e === _h269)))) {
                        _q261 = true;
                        break Q262;
                      }
                    }
                  }
                  _c270 = _q261;
                }
                _c271 = _c270;
              }
              if (!(!(_c271))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q243 = false;
                break Q244;
              }
            }
          }
          _c272 = _q243;
        }
        if (!(_c272)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, M: v_M, k: v_k }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface ClueTrickyBinding {
  c: number;
  M: number;
  k: number;
}

const clueTrickyFacts: number[] = [];
let clueTrickyCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function clueTricky(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueTrickyBinding> | null): number {
  const facts = clueTrickyFacts;
  let fired = 0;
  let changed = false;
  if (clueTrickyCands.length < sp.cells.length) clueTrickyCands = new Int32Array(sp.cells.length);
  const cands = clueTrickyCands;
  cands.fill(-1);
  const _a297 = sp.cells;
  R1:
  for (let _i298 = 0; _i298 < _a297.length; _i298++) {
    const v_c = _a297[_i298];
    const _m55_1 = b.made[1];
    let _g299 = 0;
    G300: {
      const _a310 = sp.cellCorners[v_c];
      for (let _i311 = 0; _i311 < _a310.length; _i311++) {
        const v_j = _a310[_i311];
        const _h312 = clueAt(cl.parity, v_j);
        const _h313 = clueAt(cl.sum, v_j);
        const _h314 = clueAt(cl.difference, v_j);
        const _h315 = clueAt(cl.product, v_j);
        const _h316 = clueAt(cl.quotient, v_j);
        if (!(((_h312 !== -1) || ((((_h313 !== -1) || (_h314 !== -1)) || (_h315 !== -1)) || (_h316 !== -1))))) continue;
        const _h318 = (_h312 === -1);
        const _h319 = (_h313 !== -1);
        const _h320 = (_h314 !== -1);
        const _h321 = (_h319 || _h320);
        const _h322 = (_h315 !== -1);
        const _h323 = (_h321 || _h322);
        const _h324 = (_h316 !== -1);
        const _h325 = (_h323 || _h324);
        const _h326 = _h325;
        const _h327 = !(_h326);
        const _h330 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h332 = (_h313 === -1);
        const _h333 = (_h314 === -1);
        const _h334 = (_h315 === -1);
        const _h335 = (_h316 === -1);
        for (let _m317 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m317 !== 0; _m317 &= _m317 - 1) {
          const v_d = 31 - Math.clz32(_m317 & -_m317);
          const _h336 = (_h316 * v_d);
          let _c338: boolean = (_h318 || ((v_d % 2) === _h312));
          if (_c338) {
            let _c337: boolean = _h327;
            if (!_c337) {
              let _q328 = false;
              Q329: {
                for (let _m331 = (cands[_h330] >= 0 ? cands[_h330] : (cands[_h330] = b.cands[_h330])); _m331 !== 0; _m331 &= _m331 - 1) {
                  const v_e = 31 - Math.clz32(_m331 & -_m331);
                  if (((((_h332 || ((v_d + v_e) === _h313)) && (_h333 || (Math.abs((v_d - v_e)) === _h314))) && (_h334 || ((v_d * v_e) === _h315))) && ((_h335 || (v_d === (_h316 * v_e))) || (v_e === _h336)))) {
                    _q328 = true;
                    break Q329;
                  }
                }
              }
              _c337 = _q328;
            }
            _c338 = _c337;
          }
          if (!(!(_c338))) continue;
          _g299 |= 1 << v_d;
        }
      }
    }
    const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g299);
    const _h361 = popcount(v_M);
    const _h362 = (_h361 > 0);
    const _a339 = sp.cellCorners[v_c];
    for (let _i340 = 0; _i340 < _a339.length; _i340++) {
      const v_k = _a339[_i340];
      const _h366 = clueAt(cl.parity, v_k);
      const _h367 = (_h366 === -1);
      const _h368 = clueAt(cl.sum, v_k);
      const _h369 = (_h368 !== -1);
      const _h370 = clueAt(cl.difference, v_k);
      const _h371 = (_h370 !== -1);
      const _h372 = (_h369 || _h371);
      const _h373 = clueAt(cl.product, v_k);
      const _h374 = (_h373 !== -1);
      const _h375 = (_h372 || _h374);
      const _h376 = clueAt(cl.quotient, v_k);
      const _h377 = (_h376 !== -1);
      const _h378 = (_h375 || _h377);
      const _h379 = _h378;
      const _h380 = !(_h379);
      const _h383 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
      const _h385 = (_h368 === -1);
      const _h386 = (_h370 === -1);
      const _h387 = (_h373 === -1);
      const _h388 = (_h376 === -1);
      if (b.made[1] !== _m55_1) {
        let _g341 = 0;
        G342: {
          const _a352 = sp.cellCorners[v_c];
          for (let _i353 = 0; _i353 < _a352.length; _i353++) {
            const v_j = _a352[_i353];
            if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
            for (let _m354 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m354 !== 0; _m354 &= _m354 - 1) {
              const v_d = 31 - Math.clz32(_m354 & -_m354);
              let _c360: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
              if (_c360) {
                let _c359: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                if (!_c359) {
                  let _q355 = false;
                  Q356: {
                    const _t357 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    for (let _m358 = (cands[_t357] >= 0 ? cands[_t357] : (cands[_t357] = b.cands[_t357])); _m358 !== 0; _m358 &= _m358 - 1) {
                      const v_e = 31 - Math.clz32(_m358 & -_m358);
                      if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                        _q355 = true;
                        break Q356;
                      }
                    }
                  }
                  _c359 = _q355;
                }
                _c360 = _c359;
              }
              if (!(!(_c360))) continue;
              _g341 |= 1 << v_d;
            }
          }
        }
        if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g341)))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      let _c392: boolean = _h362;
      if (_c392) {
        let _q363 = true;
        Q364: {
          for (let _m365 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m365 !== 0; _m365 &= _m365 - 1) {
            const v_d = 31 - Math.clz32(_m365 & -_m365);
            const _h389 = (_h376 * v_d);
            let _c391: boolean = (_h367 || ((v_d % 2) === _h366));
            if (_c391) {
              let _c390: boolean = _h380;
              if (!_c390) {
                let _q381 = false;
                Q382: {
                  for (let _m384 = (cands[_h383] >= 0 ? cands[_h383] : (cands[_h383] = b.cands[_h383])); _m384 !== 0; _m384 &= _m384 - 1) {
                    const v_e = 31 - Math.clz32(_m384 & -_m384);
                    if (((((_h385 || ((v_d + v_e) === _h368)) && (_h386 || (Math.abs((v_d - v_e)) === _h370))) && (_h387 || ((v_d * v_e) === _h373))) && ((_h388 || (v_d === (_h376 * v_e))) || (v_e === _h389)))) {
                      _q381 = true;
                      break Q382;
                    }
                  }
                }
                _c390 = _q381;
              }
              _c391 = _c390;
            }
            if (!(!(_c391))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q363 = false;
              break Q364;
            }
          }
        }
        _c392 = _q363;
      }
      if (!(_c392)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, M: v_M, k: v_k }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
