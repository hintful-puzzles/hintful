// Compiled by `npm run describe` from src/games/mathrax/mathrax.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, STRIKE, clueAt, popcount } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, and its clues by kind. */
export interface Dealt {
  sum: ClueList;
  difference: ClueList;
  product: ClueList;
  quotient: ClueList;
  parity: ClueList;
}

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "clueEasy" | "latin.hiddenSingle" | "latin.single" | "clue" | "latin.set" | "clueTricky" | "latin.fish" | "latin.wing";

/** The ladder: each technique's tier, and the cap from which it no longer
 * runs where it has one, in the order the description lists them. */
export const ladder: readonly { id: LadderId; tier: number; until?: number }[] = [
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

export interface ClueEasyBinding {
  c: number;
  M: number;
  k: number;
}

const clueEasyFacts: number[] = [];
let clueEasyCands = new Int32Array(0);

export function clueEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueEasyBinding> | null): number {
  const facts = clueEasyFacts;
  let fired = 0;
  let changed = false;
  if (clueEasyCands.length < sp.cells.length) clueEasyCands = new Int32Array(sp.cells.length);
  const cands = clueEasyCands;
  cands.fill(-1);
  const _a36 = sp.cells;
  for (let _i37 = 0; _i37 < _a36.length; _i37++) {
    const v_c = _a36[_i37];
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
        let _c63 = (_h56 !== -1);
        if (!_c63) {
          let _c62 = ((((_h57 !== -1) || (_h58 !== -1)) || (_h59 !== -1)) || (_h60 !== -1));
          if (_c62) {
            const _t61 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
            _c62 = (popcount((cands[_t61] >= 0 ? cands[_t61] : (cands[_t61] = b.cand(_t61)))) < 2);
          }
          _c63 = _c62;
        }
        if (!(_c63)) continue;
        for (let _m64 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m64 !== 0; _m64 &= _m64 - 1) {
          const v_d = 31 - Math.clz32(_m64 & -_m64);
          const _h83 = (_h60 * v_d);
          let _c85 = (_h65 || ((v_d % 2) === _h56));
          if (_c85) {
            let _c84 = (_h74 || (popcount((cands[_h75] >= 0 ? cands[_h75] : (cands[_h75] = b.cand(_h75)))) > 1));
            if (!_c84) {
              let _q76 = false;
              Q77: {
                for (let _m78 = (cands[_h75] >= 0 ? cands[_h75] : (cands[_h75] = b.cand(_h75))); _m78 !== 0; _m78 &= _m78 - 1) {
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
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))) & ~_g38);
      const _h87 = popcount(v_M);
      const _h90 = (_h87 > 0);
      if (!((_h87 < 2))) break L86;
      const _a88 = sp.cellCorners[v_c];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_k = _a88[_i89];
        const _h94 = clueAt(cl.parity, v_k);
        const _h95 = (_h94 === -1);
        const _h96 = clueAt(cl.sum, v_k);
        const _h97 = (_h96 !== -1);
        const _h98 = clueAt(cl.difference, v_k);
        const _h99 = (_h98 !== -1);
        const _h100 = (_h97 || _h99);
        const _h101 = clueAt(cl.product, v_k);
        const _h102 = (_h101 !== -1);
        const _h103 = (_h100 || _h102);
        const _h104 = clueAt(cl.quotient, v_k);
        const _h105 = (_h104 !== -1);
        const _h106 = (_h103 || _h105);
        const _h107 = _h106;
        const _h108 = !(_h107);
        const _h109 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h113 = (_h96 === -1);
        const _h114 = (_h98 === -1);
        const _h115 = (_h101 === -1);
        const _h116 = (_h104 === -1);
        facts.length = 0;
        changed = false;
        let _c120 = _h90;
        if (_c120) {
          let _q91 = true;
          Q92: {
            for (let _m93 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m93 !== 0; _m93 &= _m93 - 1) {
              const v_d = 31 - Math.clz32(_m93 & -_m93);
              const _h117 = (_h104 * v_d);
              let _c119 = (_h95 || ((v_d % 2) === _h94));
              if (_c119) {
                let _c118 = (_h108 || (popcount((cands[_h109] >= 0 ? cands[_h109] : (cands[_h109] = b.cand(_h109)))) > 1));
                if (!_c118) {
                  let _q110 = false;
                  Q111: {
                    for (let _m112 = (cands[_h109] >= 0 ? cands[_h109] : (cands[_h109] = b.cand(_h109))); _m112 !== 0; _m112 &= _m112 - 1) {
                      const v_e = 31 - Math.clz32(_m112 & -_m112);
                      if (((((_h113 || ((v_d + v_e) === _h96)) && (_h114 || (Math.abs((v_d - v_e)) === _h98))) && (_h115 || ((v_d * v_e) === _h101))) && ((_h116 || (v_d === (_h104 * v_e))) || (v_e === _h117)))) {
                        _q110 = true;
                        break Q111;
                      }
                    }
                  }
                  _c118 = _q110;
                }
                _c119 = _c118;
              }
              if (!(!(_c119))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q91 = false;
                break Q92;
              }
            }
          }
          _c120 = _q91;
        }
        if (!(_c120)) return -1;
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

export function clue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBinding> | null): number {
  const facts = clueFacts;
  let fired = 0;
  let changed = false;
  if (clueCands.length < sp.cells.length) clueCands = new Int32Array(sp.cells.length);
  const cands = clueCands;
  cands.fill(-1);
  const _a146 = sp.cells;
  for (let _i147 = 0; _i147 < _a146.length; _i147++) {
    const v_c = _a146[_i147];
    let _g148 = 0;
    G149: {
      const _a159 = sp.cellCorners[v_c];
      for (let _i160 = 0; _i160 < _a159.length; _i160++) {
        const v_j = _a159[_i160];
        const _h161 = clueAt(cl.parity, v_j);
        const _h162 = clueAt(cl.sum, v_j);
        const _h163 = clueAt(cl.difference, v_j);
        const _h164 = clueAt(cl.product, v_j);
        const _h165 = clueAt(cl.quotient, v_j);
        const _h167 = (_h161 === -1);
        const _h168 = (_h162 !== -1);
        const _h169 = (_h163 !== -1);
        const _h170 = (_h168 || _h169);
        const _h171 = (_h164 !== -1);
        const _h172 = (_h170 || _h171);
        const _h173 = (_h165 !== -1);
        const _h174 = (_h172 || _h173);
        const _h175 = _h174;
        const _h176 = !(_h175);
        const _h179 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h181 = (_h162 === -1);
        const _h182 = (_h163 === -1);
        const _h183 = (_h164 === -1);
        const _h184 = (_h165 === -1);
        if (!(((_h161 !== -1) || ((((_h162 !== -1) || (_h163 !== -1)) || (_h164 !== -1)) || (_h165 !== -1))))) continue;
        for (let _m166 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m166 !== 0; _m166 &= _m166 - 1) {
          const v_d = 31 - Math.clz32(_m166 & -_m166);
          const _h185 = (_h165 * v_d);
          let _c187 = (_h167 || ((v_d % 2) === _h161));
          if (_c187) {
            let _c186 = _h176;
            if (!_c186) {
              let _q177 = false;
              Q178: {
                for (let _m180 = (cands[_h179] >= 0 ? cands[_h179] : (cands[_h179] = b.cand(_h179))); _m180 !== 0; _m180 &= _m180 - 1) {
                  const v_e = 31 - Math.clz32(_m180 & -_m180);
                  if (((((_h181 || ((v_d + v_e) === _h162)) && (_h182 || (Math.abs((v_d - v_e)) === _h163))) && (_h183 || ((v_d * v_e) === _h164))) && ((_h184 || (v_d === (_h165 * v_e))) || (v_e === _h185)))) {
                    _q177 = true;
                    break Q178;
                  }
                }
              }
              _c186 = _q177;
            }
            _c187 = _c186;
          }
          if (!(!(_c187))) continue;
          _g148 |= 1 << v_d;
        }
      }
    }
    L188: {
      const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))) & ~_g148);
      const _h189 = popcount(v_M);
      const _h192 = (_h189 > 0);
      if (!((_h189 < 2))) break L188;
      const _a190 = sp.cellCorners[v_c];
      for (let _i191 = 0; _i191 < _a190.length; _i191++) {
        const v_k = _a190[_i191];
        const _h196 = clueAt(cl.parity, v_k);
        const _h197 = (_h196 === -1);
        const _h198 = clueAt(cl.sum, v_k);
        const _h199 = (_h198 !== -1);
        const _h200 = clueAt(cl.difference, v_k);
        const _h201 = (_h200 !== -1);
        const _h202 = (_h199 || _h201);
        const _h203 = clueAt(cl.product, v_k);
        const _h204 = (_h203 !== -1);
        const _h205 = (_h202 || _h204);
        const _h206 = clueAt(cl.quotient, v_k);
        const _h207 = (_h206 !== -1);
        const _h208 = (_h205 || _h207);
        const _h209 = _h208;
        const _h210 = !(_h209);
        const _h213 = (sp.cornerCells[v_k][0] + sp.cornerCells[v_k][3] - v_c);
        const _h215 = (_h198 === -1);
        const _h216 = (_h200 === -1);
        const _h217 = (_h203 === -1);
        const _h218 = (_h206 === -1);
        facts.length = 0;
        changed = false;
        let _c222 = _h192;
        if (_c222) {
          let _q193 = true;
          Q194: {
            for (let _m195 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m195 !== 0; _m195 &= _m195 - 1) {
              const v_d = 31 - Math.clz32(_m195 & -_m195);
              const _h219 = (_h206 * v_d);
              let _c221 = (_h197 || ((v_d % 2) === _h196));
              if (_c221) {
                let _c220 = _h210;
                if (!_c220) {
                  let _q211 = false;
                  Q212: {
                    for (let _m214 = (cands[_h213] >= 0 ? cands[_h213] : (cands[_h213] = b.cand(_h213))); _m214 !== 0; _m214 &= _m214 - 1) {
                      const v_e = 31 - Math.clz32(_m214 & -_m214);
                      if (((((_h215 || ((v_d + v_e) === _h198)) && (_h216 || (Math.abs((v_d - v_e)) === _h200))) && (_h217 || ((v_d * v_e) === _h203))) && ((_h218 || (v_d === (_h206 * v_e))) || (v_e === _h219)))) {
                        _q211 = true;
                        break Q212;
                      }
                    }
                  }
                  _c220 = _q211;
                }
                _c221 = _c220;
              }
              if (!(!(_c221))) continue;
              if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
              if (!(true)) {
                _q193 = false;
                break Q194;
              }
            }
          }
          _c222 = _q193;
        }
        if (!(_c222)) return -1;
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

export function clueTricky(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueTrickyBinding> | null): number {
  const facts = clueTrickyFacts;
  let fired = 0;
  let changed = false;
  if (clueTrickyCands.length < sp.cells.length) clueTrickyCands = new Int32Array(sp.cells.length);
  const cands = clueTrickyCands;
  cands.fill(-1);
  const _a247 = sp.cells;
  for (let _i248 = 0; _i248 < _a247.length; _i248++) {
    const v_c = _a247[_i248];
    let _g249 = 0;
    G250: {
      const _a260 = sp.cellCorners[v_c];
      for (let _i261 = 0; _i261 < _a260.length; _i261++) {
        const v_j = _a260[_i261];
        const _h262 = clueAt(cl.parity, v_j);
        const _h263 = clueAt(cl.sum, v_j);
        const _h264 = clueAt(cl.difference, v_j);
        const _h265 = clueAt(cl.product, v_j);
        const _h266 = clueAt(cl.quotient, v_j);
        const _h268 = (_h262 === -1);
        const _h269 = (_h263 !== -1);
        const _h270 = (_h264 !== -1);
        const _h271 = (_h269 || _h270);
        const _h272 = (_h265 !== -1);
        const _h273 = (_h271 || _h272);
        const _h274 = (_h266 !== -1);
        const _h275 = (_h273 || _h274);
        const _h276 = _h275;
        const _h277 = !(_h276);
        const _h280 = (sp.cornerCells[v_j][0] + sp.cornerCells[v_j][3] - v_c);
        const _h282 = (_h263 === -1);
        const _h283 = (_h264 === -1);
        const _h284 = (_h265 === -1);
        const _h285 = (_h266 === -1);
        if (!(((_h262 !== -1) || ((((_h263 !== -1) || (_h264 !== -1)) || (_h265 !== -1)) || (_h266 !== -1))))) continue;
        for (let _m267 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m267 !== 0; _m267 &= _m267 - 1) {
          const v_d = 31 - Math.clz32(_m267 & -_m267);
          const _h286 = (_h266 * v_d);
          let _c288 = (_h268 || ((v_d % 2) === _h262));
          if (_c288) {
            let _c287 = _h277;
            if (!_c287) {
              let _q278 = false;
              Q279: {
                for (let _m281 = (cands[_h280] >= 0 ? cands[_h280] : (cands[_h280] = b.cand(_h280))); _m281 !== 0; _m281 &= _m281 - 1) {
                  const v_e = 31 - Math.clz32(_m281 & -_m281);
                  if (((((_h282 || ((v_d + v_e) === _h263)) && (_h283 || (Math.abs((v_d - v_e)) === _h264))) && (_h284 || ((v_d * v_e) === _h265))) && ((_h285 || (v_d === (_h266 * v_e))) || (v_e === _h286)))) {
                    _q278 = true;
                    break Q279;
                  }
                }
              }
              _c287 = _q278;
            }
            _c288 = _c287;
          }
          if (!(!(_c288))) continue;
          _g249 |= 1 << v_d;
        }
      }
    }
    const v_M = ((cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))) & ~_g249);
    const _h291 = popcount(v_M);
    const _h292 = (_h291 > 0);
    const _a289 = sp.cellCorners[v_c];
    for (let _i290 = 0; _i290 < _a289.length; _i290++) {
      const v_k = _a289[_i290];
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
      facts.length = 0;
      changed = false;
      let _c322 = _h292;
      if (_c322) {
        let _q293 = true;
        Q294: {
          for (let _m295 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cand(v_c))); _m295 !== 0; _m295 &= _m295 - 1) {
            const v_d = 31 - Math.clz32(_m295 & -_m295);
            const _h319 = (_h306 * v_d);
            let _c321 = (_h297 || ((v_d % 2) === _h296));
            if (_c321) {
              let _c320 = _h310;
              if (!_c320) {
                let _q311 = false;
                Q312: {
                  for (let _m314 = (cands[_h313] >= 0 ? cands[_h313] : (cands[_h313] = b.cand(_h313))); _m314 !== 0; _m314 &= _m314 - 1) {
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
            if (b.has(v_c, v_d)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
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
  return fired;
}
