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
  let _q1 = true;
  const _n5 = new Int32Array(32);
  Q2: for (const _u3 of sp.lines) {
    _n5.fill(0);
    for (const _c4 of sp.lineCells[_u3]) {
      const _t6 = (g[_c4] || -1);
      if (++_n5[_t6] > 1) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  for (let _k7 = 0; _k7 < cl.sum.at.length; _k7++) {
    const _at8 = cl.sum.at[_k7];
    const _v9 = cl.sum.v[_k7];
    let _q10 = true;
    Q11: {
      const _a12 = sp.cornerCells[_at8];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_c = _a12[_i13];
        const _h14 = (g[v_c] || -1);
        if (!(((_h14 + (g[(sp.cornerCells[_at8][0] + sp.cornerCells[_at8][3] - v_c)] || -1)) === _v9))) {
          _q10 = false;
          break Q11;
        }
      }
    }
    if (!(_q10)) return false;
  }
  for (let _k15 = 0; _k15 < cl.difference.at.length; _k15++) {
    const _at16 = cl.difference.at[_k15];
    const _v17 = cl.difference.v[_k15];
    let _q18 = true;
    Q19: {
      const _a20 = sp.cornerCells[_at16];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        const _h22 = (g[v_c] || -1);
        if (!((Math.abs((_h22 - (g[(sp.cornerCells[_at16][0] + sp.cornerCells[_at16][3] - v_c)] || -1))) === _v17))) {
          _q18 = false;
          break Q19;
        }
      }
    }
    if (!(_q18)) return false;
  }
  for (let _k23 = 0; _k23 < cl.product.at.length; _k23++) {
    const _at24 = cl.product.at[_k23];
    const _v25 = cl.product.v[_k23];
    let _q26 = true;
    Q27: {
      const _a28 = sp.cornerCells[_at24];
      for (let _i29 = 0; _i29 < _a28.length; _i29++) {
        const v_c = _a28[_i29];
        const _h30 = (g[v_c] || -1);
        if (!(((_h30 * (g[(sp.cornerCells[_at24][0] + sp.cornerCells[_at24][3] - v_c)] || -1)) === _v25))) {
          _q26 = false;
          break Q27;
        }
      }
    }
    if (!(_q26)) return false;
  }
  for (let _k31 = 0; _k31 < cl.quotient.at.length; _k31++) {
    const _at32 = cl.quotient.at[_k31];
    const _v33 = cl.quotient.v[_k31];
    let _q34 = true;
    Q35: {
      const _a36 = sp.cornerCells[_at32];
      for (let _i37 = 0; _i37 < _a36.length; _i37++) {
        const v_c = _a36[_i37];
        const _h38 = (g[v_c] || -1);
        if (!(((_h38 === (_v33 * (g[(sp.cornerCells[_at32][0] + sp.cornerCells[_at32][3] - v_c)] || -1))) || ((g[(sp.cornerCells[_at32][0] + sp.cornerCells[_at32][3] - v_c)] || -1) === (_v33 * _h38))))) {
          _q34 = false;
          break Q35;
        }
      }
    }
    if (!(_q34)) return false;
  }
  for (let _k39 = 0; _k39 < cl.parity.at.length; _k39++) {
    const _at40 = cl.parity.at[_k39];
    const _v41 = cl.parity.v[_k39];
    let _q42 = true;
    Q43: {
      const _a44 = sp.cornerCells[_at40];
      for (let _i45 = 0; _i45 < _a44.length; _i45++) {
        const v_c = _a44[_i45];
        const _h46 = (g[v_c] || -1);
        if (!(((_h46 % 2) === _v41))) {
          _q42 = false;
          break Q43;
        }
      }
    }
    if (!(_q42)) return false;
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
    const _m181_1 = b.made[1];
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
        if (b.made[1] !== _m181_1) {
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
  const _a26 = sp.cells;
  R1:
  for (let _i27 = 0; _i27 < _a26.length; _i27++) {
    const v_c = _a26[_i27];
    const _m143_1 = b.made[1];
    let _g28 = 0;
    G29: {
      const _a39 = sp.cellCorners[v_c];
      for (let _i40 = 0; _i40 < _a39.length; _i40++) {
        const v_j = _a39[_i40];
        const _h41 = clueAt(cl.parity, v_j);
        const _h42 = clueAt(cl.sum, v_j);
        const _h43 = clueAt(cl.difference, v_j);
        const _h44 = clueAt(cl.product, v_j);
        const _h45 = clueAt(cl.quotient, v_j);
        if (!(((_h41 !== -1) || ((((_h42 !== -1) || (_h43 !== -1)) || (_h44 !== -1)) || (_h45 !== -1))))) continue;
        const _h47 = (_h41 === -1);
        const _h48 = (_h42 !== -1);
        const _h49 = (_h43 !== -1);
        const _h50 = (_h48 || _h49);
        const _h51 = (_h44 !== -1);
        const _h52 = (_h50 || _h51);
        const _h53 = (_h45 !== -1);
        const _h54 = (_h52 || _h53);
        const _h55 = _h54;
        const _h56 = !(_h55);
        const _h59 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h61 = (_h42 === -1);
        const _h62 = (_h43 === -1);
        const _h63 = (_h44 === -1);
        const _h64 = (_h45 === -1);
        for (let _m46 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m46 !== 0; _m46 &= _m46 - 1) {
          const v_d = 31 - Math.clz32(_m46 & -_m46);
          const _h65 = (_h45 * v_d);
          let _c67: boolean = (_h47 || ((v_d % 2) === _h41));
          if (_c67) {
            let _c66: boolean = _h56;
            if (!_c66) {
              let _q57 = false;
              Q58: {
                for (let _m60 = (cands[_h59] >= 0 ? cands[_h59] : (cands[_h59] = b.cands[_h59])); _m60 !== 0; _m60 &= _m60 - 1) {
                  const v_e = 31 - Math.clz32(_m60 & -_m60);
                  if (((((_h61 || ((v_d + v_e) === _h42)) && (_h62 || (Math.abs((v_d - v_e)) === _h43))) && (_h63 || ((v_d * v_e) === _h44))) && ((_h64 || (v_d === (_h45 * v_e))) || (v_e === _h65)))) {
                    _q57 = true;
                    break Q58;
                  }
                }
              }
              _c66 = _q57;
            }
            _c67 = _c66;
          }
          if (!(!(_c67))) continue;
          _g28 |= 1 << v_d;
        }
      }
    }
    L68: {
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g28);
      const _h69 = popcount(v_M);
      if (!((_h69 < 2))) break L68;
      const _h112 = (_h69 > 0);
      const _a70 = sp.cellCorners[v_c];
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_k = _a70[_i71];
        const _h116 = clueAt(cl.parity, v_k);
        const _h117 = (_h116 === -1);
        const _h118 = clueAt(cl.sum, v_k);
        const _h119 = (_h118 !== -1);
        const _h120 = clueAt(cl.difference, v_k);
        const _h121 = (_h120 !== -1);
        const _h122 = (_h119 || _h121);
        const _h123 = clueAt(cl.product, v_k);
        const _h124 = (_h123 !== -1);
        const _h125 = (_h122 || _h124);
        const _h126 = clueAt(cl.quotient, v_k);
        const _h127 = (_h126 !== -1);
        const _h128 = (_h125 || _h127);
        const _h129 = _h128;
        const _h130 = !(_h129);
        const _h133 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h135 = (_h118 === -1);
        const _h136 = (_h120 === -1);
        const _h137 = (_h123 === -1);
        const _h138 = (_h126 === -1);
        if (b.made[1] !== _m143_1) {
          let _g72 = 0;
          G73: {
            const _a83 = sp.cellCorners[v_c];
            for (let _i84 = 0; _i84 < _a83.length; _i84++) {
              const v_j = _a83[_i84];
              if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
              for (let _m85 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m85 !== 0; _m85 &= _m85 - 1) {
                const v_d = 31 - Math.clz32(_m85 & -_m85);
                let _c91: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c91) {
                  let _c90: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c90) {
                    let _q86 = false;
                    Q87: {
                      const _t88 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m89 = (cands[_t88] >= 0 ? cands[_t88] : (cands[_t88] = b.cands[_t88])); _m89 !== 0; _m89 &= _m89 - 1) {
                        const v_e = 31 - Math.clz32(_m89 & -_m89);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q86 = true;
                          break Q87;
                        }
                      }
                    }
                    _c90 = _q86;
                  }
                  _c91 = _c90;
                }
                if (!(!(_c91))) continue;
                _g72 |= 1 << v_d;
              }
            }
          }
          if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g72)))) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _g92 = 0;
          G93: {
            const _a103 = sp.cellCorners[v_c];
            for (let _i104 = 0; _i104 < _a103.length; _i104++) {
              const v_j = _a103[_i104];
              if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
              for (let _m105 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m105 !== 0; _m105 &= _m105 - 1) {
                const v_d = 31 - Math.clz32(_m105 & -_m105);
                let _c111: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
                if (_c111) {
                  let _c110: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                  if (!_c110) {
                    let _q106 = false;
                    Q107: {
                      const _t108 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                      for (let _m109 = (cands[_t108] >= 0 ? cands[_t108] : (cands[_t108] = b.cands[_t108])); _m109 !== 0; _m109 &= _m109 - 1) {
                        const v_e = 31 - Math.clz32(_m109 & -_m109);
                        if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                          _q106 = true;
                          break Q107;
                        }
                      }
                    }
                    _c110 = _q106;
                  }
                  _c111 = _c110;
                }
                if (!(!(_c111))) continue;
                _g92 |= 1 << v_d;
              }
            }
          }
          freshBinding("clue", [(sp.cells.includes(v_c)), (v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g92)), (popcount(v_M) < 2), (sp.cellCorners[v_c].includes(v_k))], ["c in", "M =", "where of M", "k in"]);
        }
        facts.length = 0;
        changed = false;
        let _c142: boolean = _h112;
        if (_c142) {
          let _q113 = true;
          Q114: {
            for (let _m115 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m115 !== 0; _m115 &= _m115 - 1) {
              const v_d = 31 - Math.clz32(_m115 & -_m115);
              const _h139 = (_h126 * v_d);
              let _c141: boolean = (_h117 || ((v_d % 2) === _h116));
              if (_c141) {
                let _c140: boolean = _h130;
                if (!_c140) {
                  let _q131 = false;
                  Q132: {
                    for (let _m134 = (cands[_h133] >= 0 ? cands[_h133] : (cands[_h133] = b.cands[_h133])); _m134 !== 0; _m134 &= _m134 - 1) {
                      const v_e = 31 - Math.clz32(_m134 & -_m134);
                      if (((((_h135 || ((v_d + v_e) === _h118)) && (_h136 || (Math.abs((v_d - v_e)) === _h120))) && (_h137 || ((v_d * v_e) === _h123))) && ((_h138 || (v_d === (_h126 * v_e))) || (v_e === _h139)))) {
                        _q131 = true;
                        break Q132;
                      }
                    }
                  }
                  _c140 = _q131;
                }
                _c141 = _c140;
              }
              if (!(!(_c141))) continue;
              if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q113 = false;
                break Q114;
              }
            }
          }
          _c142 = _q113;
        }
        if (!(_c142)) return -1;
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
  const _a25 = sp.cells;
  R1:
  for (let _i26 = 0; _i26 < _a25.length; _i26++) {
    const v_c = _a25[_i26];
    const _m141_1 = b.made[1];
    let _g27 = 0;
    G28: {
      const _a38 = sp.cellCorners[v_c];
      for (let _i39 = 0; _i39 < _a38.length; _i39++) {
        const v_j = _a38[_i39];
        const _h40 = clueAt(cl.parity, v_j);
        const _h41 = clueAt(cl.sum, v_j);
        const _h42 = clueAt(cl.difference, v_j);
        const _h43 = clueAt(cl.product, v_j);
        const _h44 = clueAt(cl.quotient, v_j);
        if (!(((_h40 !== -1) || ((((_h41 !== -1) || (_h42 !== -1)) || (_h43 !== -1)) || (_h44 !== -1))))) continue;
        const _h46 = (_h40 === -1);
        const _h47 = (_h41 !== -1);
        const _h48 = (_h42 !== -1);
        const _h49 = (_h47 || _h48);
        const _h50 = (_h43 !== -1);
        const _h51 = (_h49 || _h50);
        const _h52 = (_h44 !== -1);
        const _h53 = (_h51 || _h52);
        const _h54 = _h53;
        const _h55 = !(_h54);
        const _h58 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h60 = (_h41 === -1);
        const _h61 = (_h42 === -1);
        const _h62 = (_h43 === -1);
        const _h63 = (_h44 === -1);
        for (let _m45 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m45 !== 0; _m45 &= _m45 - 1) {
          const v_d = 31 - Math.clz32(_m45 & -_m45);
          const _h64 = (_h44 * v_d);
          let _c66: boolean = (_h46 || ((v_d % 2) === _h40));
          if (_c66) {
            let _c65: boolean = _h55;
            if (!_c65) {
              let _q56 = false;
              Q57: {
                for (let _m59 = (cands[_h58] >= 0 ? cands[_h58] : (cands[_h58] = b.cands[_h58])); _m59 !== 0; _m59 &= _m59 - 1) {
                  const v_e = 31 - Math.clz32(_m59 & -_m59);
                  if (((((_h60 || ((v_d + v_e) === _h41)) && (_h61 || (Math.abs((v_d - v_e)) === _h42))) && (_h62 || ((v_d * v_e) === _h43))) && ((_h63 || (v_d === (_h44 * v_e))) || (v_e === _h64)))) {
                    _q56 = true;
                    break Q57;
                  }
                }
              }
              _c65 = _q56;
            }
            _c66 = _c65;
          }
          if (!(!(_c66))) continue;
          _g27 |= 1 << v_d;
        }
      }
    }
    const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g27);
    const _h109 = popcount(v_M);
    const _h110 = (_h109 > 0);
    const _a67 = sp.cellCorners[v_c];
    for (let _i68 = 0; _i68 < _a67.length; _i68++) {
      const v_k = _a67[_i68];
      const _h114 = clueAt(cl.parity, v_k);
      const _h115 = (_h114 === -1);
      const _h116 = clueAt(cl.sum, v_k);
      const _h117 = (_h116 !== -1);
      const _h118 = clueAt(cl.difference, v_k);
      const _h119 = (_h118 !== -1);
      const _h120 = (_h117 || _h119);
      const _h121 = clueAt(cl.product, v_k);
      const _h122 = (_h121 !== -1);
      const _h123 = (_h120 || _h122);
      const _h124 = clueAt(cl.quotient, v_k);
      const _h125 = (_h124 !== -1);
      const _h126 = (_h123 || _h125);
      const _h127 = _h126;
      const _h128 = !(_h127);
      const _h131 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
      const _h133 = (_h116 === -1);
      const _h134 = (_h118 === -1);
      const _h135 = (_h121 === -1);
      const _h136 = (_h124 === -1);
      if (b.made[1] !== _m141_1) {
        let _g69 = 0;
        G70: {
          const _a80 = sp.cellCorners[v_c];
          for (let _i81 = 0; _i81 < _a80.length; _i81++) {
            const v_j = _a80[_i81];
            if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
            for (let _m82 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m82 !== 0; _m82 &= _m82 - 1) {
              const v_d = 31 - Math.clz32(_m82 & -_m82);
              let _c88: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
              if (_c88) {
                let _c87: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                if (!_c87) {
                  let _q83 = false;
                  Q84: {
                    const _t85 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    for (let _m86 = (cands[_t85] >= 0 ? cands[_t85] : (cands[_t85] = b.cands[_t85])); _m86 !== 0; _m86 &= _m86 - 1) {
                      const v_e = 31 - Math.clz32(_m86 & -_m86);
                      if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                        _q83 = true;
                        break Q84;
                      }
                    }
                  }
                  _c87 = _q83;
                }
                _c88 = _c87;
              }
              if (!(!(_c88))) continue;
              _g69 |= 1 << v_d;
            }
          }
        }
        if (!((v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g69)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _g89 = 0;
        G90: {
          const _a100 = sp.cellCorners[v_c];
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_j = _a100[_i101];
            if (!(((clueAt(cl.parity, v_j) !== -1) || ((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1))))) continue;
            for (let _m102 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m102 !== 0; _m102 &= _m102 - 1) {
              const v_d = 31 - Math.clz32(_m102 & -_m102);
              let _c108: boolean = ((clueAt(cl.parity, v_j) === -1) || ((v_d % 2) === clueAt(cl.parity, v_j)));
              if (_c108) {
                let _c107: boolean = !(((((clueAt(cl.sum, v_j) !== -1) || (clueAt(cl.difference, v_j) !== -1)) || (clueAt(cl.product, v_j) !== -1)) || (clueAt(cl.quotient, v_j) !== -1)));
                if (!_c107) {
                  let _q103 = false;
                  Q104: {
                    const _t105 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
                    for (let _m106 = (cands[_t105] >= 0 ? cands[_t105] : (cands[_t105] = b.cands[_t105])); _m106 !== 0; _m106 &= _m106 - 1) {
                      const v_e = 31 - Math.clz32(_m106 & -_m106);
                      if ((((((clueAt(cl.sum, v_j) === -1) || ((v_d + v_e) === clueAt(cl.sum, v_j))) && ((clueAt(cl.difference, v_j) === -1) || (Math.abs((v_d - v_e)) === clueAt(cl.difference, v_j)))) && ((clueAt(cl.product, v_j) === -1) || ((v_d * v_e) === clueAt(cl.product, v_j)))) && (((clueAt(cl.quotient, v_j) === -1) || (v_d === (clueAt(cl.quotient, v_j) * v_e))) || (v_e === (clueAt(cl.quotient, v_j) * v_d))))) {
                        _q103 = true;
                        break Q104;
                      }
                    }
                  }
                  _c107 = _q103;
                }
                _c108 = _c107;
              }
              if (!(!(_c108))) continue;
              _g89 |= 1 << v_d;
            }
          }
        }
        freshBinding("clueTricky", [(sp.cells.includes(v_c)), (v_M === ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])) & ~_g89)), (sp.cellCorners[v_c].includes(v_k))], ["c in", "M =", "k in"]);
      }
      facts.length = 0;
      changed = false;
      let _c140: boolean = _h110;
      if (_c140) {
        let _q111 = true;
        Q112: {
          for (let _m113 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m113 !== 0; _m113 &= _m113 - 1) {
            const v_d = 31 - Math.clz32(_m113 & -_m113);
            const _h137 = (_h124 * v_d);
            let _c139: boolean = (_h115 || ((v_d % 2) === _h114));
            if (_c139) {
              let _c138: boolean = _h128;
              if (!_c138) {
                let _q129 = false;
                Q130: {
                  for (let _m132 = (cands[_h131] >= 0 ? cands[_h131] : (cands[_h131] = b.cands[_h131])); _m132 !== 0; _m132 &= _m132 - 1) {
                    const v_e = 31 - Math.clz32(_m132 & -_m132);
                    if (((((_h133 || ((v_d + v_e) === _h116)) && (_h134 || (Math.abs((v_d - v_e)) === _h118))) && (_h135 || ((v_d * v_e) === _h121))) && ((_h136 || (v_d === (_h124 * v_e))) || (v_e === _h137)))) {
                      _q129 = true;
                      break Q130;
                    }
                  }
                }
                _c138 = _q129;
              }
              _c139 = _c138;
            }
            if (!(!(_c139))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q111 = false;
              break Q112;
            }
          }
        }
        _c140 = _q111;
      }
      if (!(_c140)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, M: v_M, k: v_k }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
