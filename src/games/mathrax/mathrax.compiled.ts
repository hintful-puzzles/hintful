// Compiled by `npm run describe` from src/games/mathrax/mathrax.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt, freshBinding, popcount, rangeMask, staleChecking } from "../../engine/describe-runtime.ts";

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
  let _q463 = true;
  const _n467 = new Int32Array(32);
  Q464: for (const _u465 of sp.lines) {
    _n467.fill(0);
    for (const _c466 of sp.lineCells[_u465]) {
      const _t468 = (g[_c466] || -1);
      if (++_n467[_t468] > 1) {
        _q463 = false;
        break Q464;
      }
    }
  }
  if (!(_q463)) return false;
  for (let _k469 = 0; _k469 < cl.sum.at.length; _k469++) {
    const _at470 = cl.sum.at[_k469];
    const _v471 = cl.sum.v[_k469];
    let _q472 = true;
    Q473: {
      const _a474 = sp.cornerCells[_at470];
      for (let _i475 = 0; _i475 < _a474.length; _i475++) {
        const v_c = _a474[_i475];
        const _h476 = (g[v_c] || -1);
        if (!(((_h476 + (g[(sp.cornerCells[_at470][0] + sp.cornerCells[_at470][3] - v_c)] || -1)) === _v471))) {
          _q472 = false;
          break Q473;
        }
      }
    }
    if (!(_q472)) return false;
  }
  for (let _k477 = 0; _k477 < cl.difference.at.length; _k477++) {
    const _at478 = cl.difference.at[_k477];
    const _v479 = cl.difference.v[_k477];
    let _q480 = true;
    Q481: {
      const _a482 = sp.cornerCells[_at478];
      for (let _i483 = 0; _i483 < _a482.length; _i483++) {
        const v_c = _a482[_i483];
        const _h484 = (g[v_c] || -1);
        if (!((Math.abs((_h484 - (g[(sp.cornerCells[_at478][0] + sp.cornerCells[_at478][3] - v_c)] || -1))) === _v479))) {
          _q480 = false;
          break Q481;
        }
      }
    }
    if (!(_q480)) return false;
  }
  for (let _k485 = 0; _k485 < cl.product.at.length; _k485++) {
    const _at486 = cl.product.at[_k485];
    const _v487 = cl.product.v[_k485];
    let _q488 = true;
    Q489: {
      const _a490 = sp.cornerCells[_at486];
      for (let _i491 = 0; _i491 < _a490.length; _i491++) {
        const v_c = _a490[_i491];
        const _h492 = (g[v_c] || -1);
        if (!(((_h492 * (g[(sp.cornerCells[_at486][0] + sp.cornerCells[_at486][3] - v_c)] || -1)) === _v487))) {
          _q488 = false;
          break Q489;
        }
      }
    }
    if (!(_q488)) return false;
  }
  for (let _k493 = 0; _k493 < cl.quotient.at.length; _k493++) {
    const _at494 = cl.quotient.at[_k493];
    const _v495 = cl.quotient.v[_k493];
    let _q496 = true;
    Q497: {
      const _a498 = sp.cornerCells[_at494];
      for (let _i499 = 0; _i499 < _a498.length; _i499++) {
        const v_c = _a498[_i499];
        const _h500 = (g[v_c] || -1);
        if (!(((_h500 === (_v495 * (g[(sp.cornerCells[_at494][0] + sp.cornerCells[_at494][3] - v_c)] || -1))) || ((g[(sp.cornerCells[_at494][0] + sp.cornerCells[_at494][3] - v_c)] || -1) === (_v495 * _h500))))) {
          _q496 = false;
          break Q497;
        }
      }
    }
    if (!(_q496)) return false;
  }
  for (let _k501 = 0; _k501 < cl.parity.at.length; _k501++) {
    const _at502 = cl.parity.at[_k501];
    const _v503 = cl.parity.v[_k501];
    let _q504 = true;
    Q505: {
      const _a506 = sp.cornerCells[_at502];
      for (let _i507 = 0; _i507 < _a506.length; _i507++) {
        const v_c = _a506[_i507];
        const _h508 = (g[v_c] || -1);
        if (!(((_h508 % 2) === _v503))) {
          _q504 = false;
          break Q505;
        }
      }
    }
    if (!(_q504)) return false;
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
      const _h150 = (_h87 > 0);
      const _a88 = sp.cellCorners[v_c];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_k = _a88[_i89];
        const _h154 = clueAt(cl.parity, v_k);
        const _h155 = (_h154 === -1);
        const _h156 = clueAt(cl.sum, v_k);
        const _h157 = (_h156 !== -1);
        const _h158 = clueAt(cl.difference, v_k);
        const _h159 = (_h158 !== -1);
        const _h160 = (_h157 || _h159);
        const _h161 = clueAt(cl.product, v_k);
        const _h162 = (_h161 !== -1);
        const _h163 = (_h160 || _h162);
        const _h164 = clueAt(cl.quotient, v_k);
        const _h165 = (_h164 !== -1);
        const _h166 = (_h163 || _h165);
        const _h167 = _h166;
        const _h168 = !(_h167);
        const _h169 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h173 = (_h156 === -1);
        const _h174 = (_h158 === -1);
        const _h175 = (_h161 === -1);
        const _h176 = (_h164 === -1);
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
        if (import.meta.env.DEV && staleChecking) {
          let _g120 = 0;
          G121: {
            const _a136 = sp.cellCorners[v_c];
            for (let _i137 = 0; _i137 < _a136.length; _i137++) {
              const v_j = _a136[_i137];
              let _c140: boolean = (clueAt(cl.parity, v_j) !== -1);
              if (!_c140) {
                let _c139: boolean = ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1));
                if (_c139) {
                  const _t138 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                  _c139 = (popcount((cands[_t138] >= 0 ? cands[_t138] : (cands[_t138] = b.cands[_t138]))) < 2);
                }
                _c140 = _c139;
              }
              if (!(_c140)) continue;
              for (let _m141 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m141 !== 0; _m141 &= _m141 - 1) {
                const v_d = 31 - Math.clz32(_m141 & -_m141);
                let _c149: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c149) {
                  let _c143: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c143) {
                    const _t142 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    _c143 = (popcount((cands[_t142] >= 0 ? cands[_t142] : (cands[_t142] = b.cands[_t142]))) > 1);
                  }
                  let _c148: boolean = _c143;
                  if (!_c148) {
                    let _q144 = false;
                    Q145: {
                      const _t146 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m147 = (cands[_t146] >= 0 ? cands[_t146] : (cands[_t146] = b.cands[_t146])); _m147 !== 0; _m147 &= _m147 - 1) {
                        const v_e = 31 - Math.clz32(_m147 & -_m147);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q144 = true;
                          break Q145;
                        }
                      }
                    }
                    _c148 = _q144;
                  }
                  _c149 = _c148;
                }
                if (!(!(_c149))) continue;
                _g120 |= 1 << v_d;
              }
            }
          }
          freshBinding("clueEasy", [(sp.cells.includes(v_c)), (v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g120)), (popcount(v_M) < 2), (sp.cellCorners[v_c].includes(v_k))], ["c in", "M =", "where of M", "k in"]);
        }
        facts.length = 0;
        changed = false;
        let _c180: boolean = _h150;
        if (_c180) {
          let _q151 = true;
          Q152: {
            for (let _m153 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m153 !== 0; _m153 &= _m153 - 1) {
              const v_d = 31 - Math.clz32(_m153 & -_m153);
              const _h177 = (_h164 * v_d);
              let _c179: boolean = (_h155 || ((v_d % 2) === _h154));
              if (_c179) {
                let _c178: boolean = (_h168 || (popcount((cands[_h169] >= 0 ? cands[_h169] : (cands[_h169] = b.cands[_h169]))) > 1));
                if (!_c178) {
                  let _q170 = false;
                  Q171: {
                    for (let _m172 = (cands[_h169] >= 0 ? cands[_h169] : (cands[_h169] = b.cands[_h169])); _m172 !== 0; _m172 &= _m172 - 1) {
                      const v_e = 31 - Math.clz32(_m172 & -_m172);
                      if (((((_h173 || ((v_d + v_e) === _h156)) && (_h174 || (Math.abs((v_d - v_e)) === _h158))) && (_h175 || ((v_d * v_e) === _h161))) && ((_h176 || (v_d === (_h164 * v_e))) || (v_e === _h177)))) {
                        _q170 = true;
                        break Q171;
                      }
                    }
                  }
                  _c178 = _q170;
                }
                _c179 = _c178;
              }
              if (!(!(_c179))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q151 = false;
                break Q152;
              }
            }
          }
          _c180 = _q151;
        }
        if (!(_c180)) return -1;
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
  const _a206 = sp.cells;
  R1:
  for (let _i207 = 0; _i207 < _a206.length; _i207++) {
    const v_c = _a206[_i207];
    const _m31_1 = b.made[1];
    let _g208 = 0;
    G209: {
      const _a219 = sp.cellCorners[v_c];
      for (let _i220 = 0; _i220 < _a219.length; _i220++) {
        const v_j = _a219[_i220];
        const _h221 = clueAt(cl.parity, v_j);
        const _h222 = clueAt(cl.sum, v_j);
        const _h223 = clueAt(cl.difference, v_j);
        const _h224 = clueAt(cl.product, v_j);
        const _h225 = clueAt(cl.quotient, v_j);
        if (!(((_h221 !== -1) || ((((_h222 !== -1) || (_h223 !== -1)) || (_h224 !== -1)) || (_h225 !== -1))))) continue;
        const _h227 = (_h221 === -1);
        const _h228 = (_h222 !== -1);
        const _h229 = (_h223 !== -1);
        const _h230 = (_h228 || _h229);
        const _h231 = (_h224 !== -1);
        const _h232 = (_h230 || _h231);
        const _h233 = (_h225 !== -1);
        const _h234 = (_h232 || _h233);
        const _h235 = _h234;
        const _h236 = !(_h235);
        const _h239 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h241 = (_h222 === -1);
        const _h242 = (_h223 === -1);
        const _h243 = (_h224 === -1);
        const _h244 = (_h225 === -1);
        for (let _m226 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m226 !== 0; _m226 &= _m226 - 1) {
          const v_d = 31 - Math.clz32(_m226 & -_m226);
          const _h245 = (_h225 * v_d);
          let _c247: boolean = (_h227 || ((v_d % 2) === _h221));
          if (_c247) {
            let _c246: boolean = _h236;
            if (!_c246) {
              let _q237 = false;
              Q238: {
                for (let _m240 = (cands[_h239] >= 0 ? cands[_h239] : (cands[_h239] = b.cands[_h239])); _m240 !== 0; _m240 &= _m240 - 1) {
                  const v_e = 31 - Math.clz32(_m240 & -_m240);
                  if (((((_h241 || ((v_d + v_e) === _h222)) && (_h242 || (Math.abs((v_d - v_e)) === _h223))) && (_h243 || ((v_d * v_e) === _h224))) && ((_h244 || (v_d === (_h225 * v_e))) || (v_e === _h245)))) {
                    _q237 = true;
                    break Q238;
                  }
                }
              }
              _c246 = _q237;
            }
            _c247 = _c246;
          }
          if (!(!(_c247))) continue;
          _g208 |= 1 << v_d;
        }
      }
    }
    L248: {
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g208);
      const _h249 = popcount(v_M);
      if (!((_h249 < 2))) break L248;
      const _h292 = (_h249 > 0);
      const _a250 = sp.cellCorners[v_c];
      for (let _i251 = 0; _i251 < _a250.length; _i251++) {
        const v_k = _a250[_i251];
        const _h296 = clueAt(cl.parity, v_k);
        const _h297 = (_h296 === -1);
        const _h298 = clueAt(cl.sum, v_k);
        const _h299 = (_h298 !== -1);
        const _h300 = clueAt(cl.difference, v_k);
        const _h301 = (_h300 !== -1);
        const _h302 = (_h299 || _h301);
        const _h303 = clueAt(cl.product, v_k);
        const _h304 = (_h303 !== -1);
        const _h305 = (_h302 || _h304);
        const _h306 = clueAt(cl.quotient, v_k);
        const _h307 = (_h306 !== -1);
        const _h308 = (_h305 || _h307);
        const _h309 = _h308;
        const _h310 = !(_h309);
        const _h313 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h315 = (_h298 === -1);
        const _h316 = (_h300 === -1);
        const _h317 = (_h303 === -1);
        const _h318 = (_h306 === -1);
        if (b.made[1] !== _m31_1) {
          let _g252 = 0;
          G253: {
            const _a263 = sp.cellCorners[v_c];
            for (let _i264 = 0; _i264 < _a263.length; _i264++) {
              const v_j = _a263[_i264];
              if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
              for (let _m265 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m265 !== 0; _m265 &= _m265 - 1) {
                const v_d = 31 - Math.clz32(_m265 & -_m265);
                let _c271: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c271) {
                  let _c270: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c270) {
                    let _q266 = false;
                    Q267: {
                      const _t268 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m269 = (cands[_t268] >= 0 ? cands[_t268] : (cands[_t268] = b.cands[_t268])); _m269 !== 0; _m269 &= _m269 - 1) {
                        const v_e = 31 - Math.clz32(_m269 & -_m269);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q266 = true;
                          break Q267;
                        }
                      }
                    }
                    _c270 = _q266;
                  }
                  _c271 = _c270;
                }
                if (!(!(_c271))) continue;
                _g252 |= 1 << v_d;
              }
            }
          }
          if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g252)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g272 = 0;
          G273: {
            const _a283 = sp.cellCorners[v_c];
            for (let _i284 = 0; _i284 < _a283.length; _i284++) {
              const v_j = _a283[_i284];
              if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
              for (let _m285 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m285 !== 0; _m285 &= _m285 - 1) {
                const v_d = 31 - Math.clz32(_m285 & -_m285);
                let _c291: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c291) {
                  let _c290: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c290) {
                    let _q286 = false;
                    Q287: {
                      const _t288 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m289 = (cands[_t288] >= 0 ? cands[_t288] : (cands[_t288] = b.cands[_t288])); _m289 !== 0; _m289 &= _m289 - 1) {
                        const v_e = 31 - Math.clz32(_m289 & -_m289);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q286 = true;
                          break Q287;
                        }
                      }
                    }
                    _c290 = _q286;
                  }
                  _c291 = _c290;
                }
                if (!(!(_c291))) continue;
                _g272 |= 1 << v_d;
              }
            }
          }
          freshBinding("clue", [(sp.cells.includes(v_c)), (v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g272)), (popcount(v_M) < 2), (sp.cellCorners[v_c].includes(v_k))], ["c in", "M =", "where of M", "k in"]);
        }
        facts.length = 0;
        changed = false;
        let _c322: boolean = _h292;
        if (_c322) {
          let _q293 = true;
          Q294: {
            for (let _m295 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m295 !== 0; _m295 &= _m295 - 1) {
              const v_d = 31 - Math.clz32(_m295 & -_m295);
              const _h319 = (_h306 * v_d);
              let _c321: boolean = (_h297 || ((v_d % 2) === _h296));
              if (_c321) {
                let _c320: boolean = _h310;
                if (!_c320) {
                  let _q311 = false;
                  Q312: {
                    for (let _m314 = (cands[_h313] >= 0 ? cands[_h313] : (cands[_h313] = b.cands[_h313])); _m314 !== 0; _m314 &= _m314 - 1) {
                      const v_e = 31 - Math.clz32(_m314 & -_m314);
                      if (((((_h315 || ((v_d + v_e) === _h298)) && (_h316 || (Math.abs((v_d - v_e)) === _h300))) && (_h317 || ((v_d * v_e) === _h303))) && ((_h318 || (v_d === (_h306 * v_e))) || (v_e === _h319)))) {
                        _q311 = true;
                        break Q312;
                      }
                    }
                  }
                  _c320 = _q311;
                }
                _c321 = _c320;
              }
              if (!(!(_c321))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q293 = false;
                break Q294;
              }
            }
          }
          _c322 = _q293;
        }
        if (!(_c322)) return -1;
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
  const _a347 = sp.cells;
  R1:
  for (let _i348 = 0; _i348 < _a347.length; _i348++) {
    const v_c = _a347[_i348];
    const _m55_1 = b.made[1];
    let _g349 = 0;
    G350: {
      const _a360 = sp.cellCorners[v_c];
      for (let _i361 = 0; _i361 < _a360.length; _i361++) {
        const v_j = _a360[_i361];
        const _h362 = clueAt(cl.parity, v_j);
        const _h363 = clueAt(cl.sum, v_j);
        const _h364 = clueAt(cl.difference, v_j);
        const _h365 = clueAt(cl.product, v_j);
        const _h366 = clueAt(cl.quotient, v_j);
        if (!(((_h362 !== -1) || ((((_h363 !== -1) || (_h364 !== -1)) || (_h365 !== -1)) || (_h366 !== -1))))) continue;
        const _h368 = (_h362 === -1);
        const _h369 = (_h363 !== -1);
        const _h370 = (_h364 !== -1);
        const _h371 = (_h369 || _h370);
        const _h372 = (_h365 !== -1);
        const _h373 = (_h371 || _h372);
        const _h374 = (_h366 !== -1);
        const _h375 = (_h373 || _h374);
        const _h376 = _h375;
        const _h377 = !(_h376);
        const _h380 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h382 = (_h363 === -1);
        const _h383 = (_h364 === -1);
        const _h384 = (_h365 === -1);
        const _h385 = (_h366 === -1);
        for (let _m367 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m367 !== 0; _m367 &= _m367 - 1) {
          const v_d = 31 - Math.clz32(_m367 & -_m367);
          const _h386 = (_h366 * v_d);
          let _c388: boolean = (_h368 || ((v_d % 2) === _h362));
          if (_c388) {
            let _c387: boolean = _h377;
            if (!_c387) {
              let _q378 = false;
              Q379: {
                for (let _m381 = (cands[_h380] >= 0 ? cands[_h380] : (cands[_h380] = b.cands[_h380])); _m381 !== 0; _m381 &= _m381 - 1) {
                  const v_e = 31 - Math.clz32(_m381 & -_m381);
                  if (((((_h382 || ((v_d + v_e) === _h363)) && (_h383 || (Math.abs((v_d - v_e)) === _h364))) && (_h384 || ((v_d * v_e) === _h365))) && ((_h385 || (v_d === (_h366 * v_e))) || (v_e === _h386)))) {
                    _q378 = true;
                    break Q379;
                  }
                }
              }
              _c387 = _q378;
            }
            _c388 = _c387;
          }
          if (!(!(_c388))) continue;
          _g349 |= 1 << v_d;
        }
      }
    }
    const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g349);
    const _h431 = popcount(v_M);
    const _h432 = (_h431 > 0);
    const _a389 = sp.cellCorners[v_c];
    for (let _i390 = 0; _i390 < _a389.length; _i390++) {
      const v_k = _a389[_i390];
      const _h436 = clueAt(cl.parity, v_k);
      const _h437 = (_h436 === -1);
      const _h438 = clueAt(cl.sum, v_k);
      const _h439 = (_h438 !== -1);
      const _h440 = clueAt(cl.difference, v_k);
      const _h441 = (_h440 !== -1);
      const _h442 = (_h439 || _h441);
      const _h443 = clueAt(cl.product, v_k);
      const _h444 = (_h443 !== -1);
      const _h445 = (_h442 || _h444);
      const _h446 = clueAt(cl.quotient, v_k);
      const _h447 = (_h446 !== -1);
      const _h448 = (_h445 || _h447);
      const _h449 = _h448;
      const _h450 = !(_h449);
      const _h453 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
      const _h455 = (_h438 === -1);
      const _h456 = (_h440 === -1);
      const _h457 = (_h443 === -1);
      const _h458 = (_h446 === -1);
      if (b.made[1] !== _m55_1) {
        let _g391 = 0;
        G392: {
          const _a402 = sp.cellCorners[v_c];
          for (let _i403 = 0; _i403 < _a402.length; _i403++) {
            const v_j = _a402[_i403];
            if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
            for (let _m404 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m404 !== 0; _m404 &= _m404 - 1) {
              const v_d = 31 - Math.clz32(_m404 & -_m404);
              let _c410: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
              if (_c410) {
                let _c409: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                if (!_c409) {
                  let _q405 = false;
                  Q406: {
                    const _t407 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    for (let _m408 = (cands[_t407] >= 0 ? cands[_t407] : (cands[_t407] = b.cands[_t407])); _m408 !== 0; _m408 &= _m408 - 1) {
                      const v_e = 31 - Math.clz32(_m408 & -_m408);
                      if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                        _q405 = true;
                        break Q406;
                      }
                    }
                  }
                  _c409 = _q405;
                }
                _c410 = _c409;
              }
              if (!(!(_c410))) continue;
              _g391 |= 1 << v_d;
            }
          }
        }
        if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g391)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _g411 = 0;
        G412: {
          const _a422 = sp.cellCorners[v_c];
          for (let _i423 = 0; _i423 < _a422.length; _i423++) {
            const v_j = _a422[_i423];
            if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
            for (let _m424 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m424 !== 0; _m424 &= _m424 - 1) {
              const v_d = 31 - Math.clz32(_m424 & -_m424);
              let _c430: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
              if (_c430) {
                let _c429: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                if (!_c429) {
                  let _q425 = false;
                  Q426: {
                    const _t427 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    for (let _m428 = (cands[_t427] >= 0 ? cands[_t427] : (cands[_t427] = b.cands[_t427])); _m428 !== 0; _m428 &= _m428 - 1) {
                      const v_e = 31 - Math.clz32(_m428 & -_m428);
                      if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                        _q425 = true;
                        break Q426;
                      }
                    }
                  }
                  _c429 = _q425;
                }
                _c430 = _c429;
              }
              if (!(!(_c430))) continue;
              _g411 |= 1 << v_d;
            }
          }
        }
        freshBinding("clueTricky", [(sp.cells.includes(v_c)), (v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g411)), (sp.cellCorners[v_c].includes(v_k))], ["c in", "M =", "k in"]);
      }
      facts.length = 0;
      changed = false;
      let _c462: boolean = _h432;
      if (_c462) {
        let _q433 = true;
        Q434: {
          for (let _m435 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m435 !== 0; _m435 &= _m435 - 1) {
            const v_d = 31 - Math.clz32(_m435 & -_m435);
            const _h459 = (_h446 * v_d);
            let _c461: boolean = (_h437 || ((v_d % 2) === _h436));
            if (_c461) {
              let _c460: boolean = _h450;
              if (!_c460) {
                let _q451 = false;
                Q452: {
                  for (let _m454 = (cands[_h453] >= 0 ? cands[_h453] : (cands[_h453] = b.cands[_h453])); _m454 !== 0; _m454 &= _m454 - 1) {
                    const v_e = 31 - Math.clz32(_m454 & -_m454);
                    if (((((_h455 || ((v_d + v_e) === _h438)) && (_h456 || (Math.abs((v_d - v_e)) === _h440))) && (_h457 || ((v_d * v_e) === _h443))) && ((_h458 || (v_d === (_h446 * v_e))) || (v_e === _h459)))) {
                      _q451 = true;
                      break Q452;
                    }
                  }
                }
                _c460 = _q451;
              }
              _c461 = _c460;
            }
            if (!(!(_c461))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q433 = false;
              break Q434;
            }
          }
        }
        _c462 = _q433;
      }
      if (!(_c462)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, M: v_M, k: v_k }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
