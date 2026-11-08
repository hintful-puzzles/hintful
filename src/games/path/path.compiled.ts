// Compiled by `npm run describe` from src/games/path/path.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, keptStore, minus, rangeMask, setOf, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  wall: ClueList;
  step: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "forced" | "lineBreaks" | "pairBreaks" | "weighed";

/** Every technique run as each value is placed, by id. */
export type PlacingId = never;

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
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
  { id: "forced", tier: 0 },
  { id: "lineBreaks", tier: 1 },
  { id: "pairBreaks", tier: 1 },
  { id: "weighed", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g7275: number[] = [];
  const _g7282: number[] = [];
  const _g7341: number[] = [];
  const _g7348: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h7260 = (cl.step === 0);
  const _h7324 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q7246 = true;
  Q7247: {
    const _a7248 = sp.cells;
    for (let _i7249 = 0; _i7249 < _a7248.length; _i7249++) {
      const v_c = _a7248[_i7249];
      let _g7250 = 0;
      G7251: {
        const _a7252 = sp.adj4[v_c];
        for (let _i7253 = 0; _i7253 < _a7252.length; _i7253++) {
          const _h7254 = (g[sp.adj4Edges[v_c][_i7253]] || -1);
          if (!((_h7254 === 1))) continue;
          _g7250++;
        }
      }
      let _g7255 = 0;
      G7256: {
        const _a7257 = setOf(v_c);
        for (let _i7258 = 0; _i7258 < _a7257.length; _i7258++) {
          const v_k = _a7257[_i7258];
          const _h7259 = clueAt(cl.number, v_k);
          const _h7267 = (_h7259 + 1);
          let _c7269: boolean = (_h7259 !== -1);
          if (_c7269) {
            let _c7268: boolean = (_h7260 || (_h7259 === 1));
            if (!_c7268) {
              let _g7261 = 0;
              G7262: {
                const _t7263 = (_h7259 + 1);
                const _a7264 = cluesValued(cl.number, _t7263);
                for (let _i7265 = 0; _i7265 < _a7264.length; _i7265++) {
                  const v_x = _a7264[_i7265];
                  const _h7266 = clueAt(cl.number, v_x);
                  if (!((_h7266 === _h7267))) continue;
                  _g7261++;
                }
              }
              _c7268 = (_g7261 === 0);
            }
            _c7269 = _c7268;
          }
          if (!(_c7269)) continue;
          _g7255++;
        }
      }
      if (!((_g7250 === (2 - _g7255)))) {
        _q7246 = false;
        break Q7247;
      }
    }
  }
  if (!(_q7246)) return false;
  let _q7270 = true;
  Q7271: {
    const _a7272 = sp.cells;
    for (let _i7273 = 0; _i7273 < _a7272.length; _i7273++) {
      const v_c = _a7272[_i7273];
      const _h7274 = clueAt(cl.number, v_c);
      if (!(!((_h7274 !== -1)))) continue;
      _g7275.length = 0;
      G7276: {
        const _a7279 = setOf(v_c);
        for (let _i7280 = 0; _i7280 < _a7279.length; _i7280++) {
          const v_x = _a7279[_i7280];
          const _h7281 = clueAt(cl.number, v_x);
          if (!((_h7281 !== -1))) continue;
          _g7275.push(v_x);
        }
      }
      _g7282.length = 0;
      G7283: {
        const _a7298 = throughWhere(sp, v_c, (_te7293: number): boolean => { let _c7295: boolean = ((g[_te7293] || -1) === 1); if (_c7295) {   const _t7294 = sp.edgeEnds[2 * _te7293];   _c7295 = !((clueAt(cl.number, _t7294) !== -1)); } let _c7297: boolean = _c7295; if (_c7297) {   const _t7296 = sp.edgeEnds[2 * _te7293 + 1];   _c7297 = !((clueAt(cl.number, _t7296) !== -1)); } return _c7297; });
        for (let _i7299 = 0; _i7299 < _a7298.length; _i7299++) {
          const v_t = _a7298[_i7299];
          const _h7302 = clueAt(cl.number, v_t);
          const _h7303 = (_h7302 !== -1);
          const _h7304 = _h7303;
          const _h7305 = !(_h7304);
          const _a7300 = sp.adj4[v_t];
          for (let _i7301 = 0; _i7301 < _a7300.length; _i7301++) {
            const v_x = _a7300[_i7301];
            const _h7306 = clueAt(cl.number, v_x);
            const _h7307 = (g[sp.adj4Edges[v_t][_i7301]] || -1);
            if (!(((_h7305 && (_h7306 !== -1)) && (_h7307 === 1)))) continue;
            if (!_g7282.includes(v_x)) _g7282.push(v_x);
          }
        }
      }
      if (!((union(_g7275, _g7282).length === 2))) {
        _q7270 = false;
        break Q7271;
      }
    }
  }
  if (!(_q7270)) return false;
  let _c7313: boolean = (cl.step === 0);
  if (!_c7313) {
    let _q7308 = false;
    Q7309: {
      const _a7310 = sp.cells;
      for (let _i7311 = 0; _i7311 < _a7310.length; _i7311++) {
        const v_x = _a7310[_i7311];
        const _h7312 = clueAt(cl.number, v_x);
        if ((_h7312 === 2)) {
          _q7308 = true;
          break Q7309;
        }
      }
    }
    _c7313 = _q7308;
  }
  let _c7333: boolean = _c7313;
  if (_c7333) {
    let _q7314 = true;
    Q7315: {
      const _a7316 = sp.cells;
      for (let _i7317 = 0; _i7317 < _a7316.length; _i7317++) {
        const v_x = _a7316[_i7317];
        const _h7318 = clueAt(cl.number, v_x);
        if (!((_h7318 !== -1))) continue;
        const _h7330 = (_h7318 - 1);
        let _g7319 = 0;
        G7320: {
          const _a7321 = cluesValued(cl.number, _h7318);
          for (let _i7322 = 0; _i7322 < _a7321.length; _i7322++) {
            const v_y = _a7321[_i7322];
            const _h7323 = clueAt(cl.number, v_y);
            if (!((_h7323 === _h7318))) continue;
            _g7319++;
          }
        }
        let _c7332: boolean = (_g7319 === _h7324);
        if (_c7332) {
          let _c7331: boolean = (_h7318 === 1);
          if (!_c7331) {
            let _q7325 = false;
            Q7326: {
              const _a7327 = sp.cells;
              for (let _i7328 = 0; _i7328 < _a7327.length; _i7328++) {
                const v_y = _a7327[_i7328];
                const _h7329 = clueAt(cl.number, v_y);
                if ((_h7329 === _h7330)) {
                  _q7325 = true;
                  break Q7326;
                }
              }
            }
            _c7331 = _q7325;
          }
          _c7332 = _c7331;
        }
        if (!(_c7332)) {
          _q7314 = false;
          break Q7315;
        }
      }
    }
    _c7333 = _q7314;
  }
  if (!(_c7333)) return false;
  for (let _k7334 = 0; _k7334 < cl.number.at.length; _k7334++) {
    const _at7335 = cl.number.at[_k7334];
    let _q7337 = true;
    Q7338: {
      const _a7339 = sp.adj4[_at7335];
      for (let _i7340 = 0; _i7340 < _a7339.length; _i7340++) {
        const v_y = _a7339[_i7340];
        if (!(((g[sp.adj4Edges[_at7335][_i7340]] || -1) === 1))) continue;
        _g7341.length = 0;
        G7342: {
          const _a7345 = setOf(v_y);
          for (let _i7346 = 0; _i7346 < _a7345.length; _i7346++) {
            const v_x = _a7345[_i7346];
            const _h7347 = clueAt(cl.number, v_x);
            if (!((_h7347 !== -1))) continue;
            _g7341.push(v_x);
          }
        }
        _g7348.length = 0;
        G7349: {
          const _a7364 = throughWhere(sp, v_y, (_te7359: number): boolean => { let _c7361: boolean = ((g[_te7359] || -1) === 1); if (_c7361) {   const _t7360 = sp.edgeEnds[2 * _te7359];   _c7361 = !((clueAt(cl.number, _t7360) !== -1)); } let _c7363: boolean = _c7361; if (_c7363) {   const _t7362 = sp.edgeEnds[2 * _te7359 + 1];   _c7363 = !((clueAt(cl.number, _t7362) !== -1)); } return _c7363; });
          for (let _i7365 = 0; _i7365 < _a7364.length; _i7365++) {
            const v_t = _a7364[_i7365];
            const _h7368 = clueAt(cl.number, v_t);
            const _h7369 = (_h7368 !== -1);
            const _h7370 = _h7369;
            const _h7371 = !(_h7370);
            const _a7366 = sp.adj4[v_t];
            for (let _i7367 = 0; _i7367 < _a7366.length; _i7367++) {
              const v_x = _a7366[_i7367];
              const _h7372 = clueAt(cl.number, v_x);
              const _h7373 = (g[sp.adj4Edges[v_t][_i7367]] || -1);
              if (!(((_h7371 && (_h7372 !== -1)) && (_h7373 === 1)))) continue;
              if (!_g7348.includes(v_x)) _g7348.push(v_x);
            }
          }
        }
        const _a7374 = union(_g7341, _g7348);
        for (let _i7375 = 0; _i7375 < _a7374.length; _i7375++) {
          const v_q = _a7374[_i7375];
          if (!((v_q !== _at7335))) continue;
          const _h7377 = clueAt(cl.number, v_q);
          const _h7376 = clueAt(cl.number, _at7335);
          if (!((Math.abs((_h7376 - _h7377)) === cl.step))) {
            _q7337 = false;
            break Q7338;
          }
        }
      }
    }
    if (!(_q7337)) return false;
  }
  for (let _k7378 = 0; _k7378 < cl.wall.at.length; _k7378++) {
    const _at7379 = cl.wall.at[_k7378];
    if (!(((g[_at7379] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const forcedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function forced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ForcedBinding> | null): number {
  const facts = forcedFacts;
  let fired = 0;
  let changed = false;
  const _a71 = sp.cells;
  for (let _i72 = 0; _i72 < _a71.length; _i72++) {
    const v_c = _a71[_i72];
    const _h87 = clueAt(cl.number, v_c);
    const _h88 = (_h87 !== -1);
    const _h89 = _h88;
    let _g73 = 0;
    G74: {
      const _a75 = sp.adj4[v_c];
      for (let _i76 = 0; _i76 < _a75.length; _i76++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i76]] || -1) === 1))) continue;
        _g73++;
      }
    }
    const v_n = (takes(sp, cl, v_c) - _g73);
    L77: {
      const v_U = ways(b, sp, cl, v_c);
      const _h78 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h78 <= v_n))))) break L77;
      facts.length = 0;
      changed = false;
      let _c100: boolean = ((v_n >= 0) && (_h78 === v_n));
      if (_c100) {
        let _q79 = true;
        Q80: {
          const _a81 = v_U;
          for (let _i82 = 0; _i82 < _a81.length; _i82++) {
            const v_i = _a81[_i82];
            const _a83 = v_U;
            const _n84 = _i82;
            for (let _i85 = 0; _i85 < _n84; _i85++) {
              const v_j = _a83[_i85];
              let _c99: boolean = !(piece(b, sp, v_i).includes(v_j));
              if (_c99) {
                let _c98: boolean = _h89;
                if (!_c98) {
                  let _q90 = true;
                  Q91: {
                    const _a92 = nearest(b, sp, cl, v_i);
                    for (let _i93 = 0; _i93 < _a92.length; _i93++) {
                      const v_p = _a92[_i93];
                      const _h96 = clueAt(cl.number, v_p);
                      const _a94 = nearest(b, sp, cl, v_j);
                      for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                        const v_q = _a94[_i95];
                        const _h97 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h96 - _h97)) === cl.step))) {
                          _q90 = false;
                          break Q91;
                        }
                      }
                    }
                  }
                  _c98 = _q90;
                }
                _c99 = _c98;
              }
              if (!(_c99)) {
                _q79 = false;
                break Q80;
              }
            }
          }
        }
        _c100 = _q79;
      }
      let _c106: boolean = _c100;
      if (_c106) {
        let _q101 = true;
        Q102: {
          const _a103 = v_U;
          for (let _i104 = 0; _i104 < _a103.length; _i104++) {
            const v_y = _a103[_i104];
            const _t105 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t105] !== 0)) { if (fire === null) { b.placeAt(_t105, 1); changed = true; } else facts.push(PLACE, _t105, 1); }
            if (!(true)) {
              _q101 = false;
              break Q102;
            }
          }
        }
        _c106 = _q101;
      }
      if (!(_c106)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LineBreaksBinding {
  e: number;
  a: number;
  b: number;
}

const lineBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const _g763: number[] = [];
  const _g770: number[] = [];
  const _g803: number[] = [];
  const _g810: number[] = [];
  const _g912: number[] = [];
  const _g919: number[] = [];
  const _g952: number[] = [];
  const _g959: number[] = [];
  const _g1067: number[] = [];
  const _g1074: number[] = [];
  const _g1105: number[] = [];
  const _g1112: number[] = [];
  const _g1214: number[] = [];
  const _g1221: number[] = [];
  const _g1252: number[] = [];
  const _g1259: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h666 = (cl.step === 0);
  const _a654 = sp.edges;
  for (let _i655 = 0; _i655 < _a654.length; _i655++) {
    const v_e = _a654[_i655];
    const v_a = sp.edgeEnds[2 * v_e];
    L656: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c665: boolean = ((!((b.grid[sp.edgeOf(v_a, v_b)] !== 0)) && spare(b, sp, cl, v_a)) && spare(b, sp, cl, v_b));
      if (_c665) {
        let _q657 = true;
        Q658: {
          const _a659 = nearest(b, sp, cl, v_a);
          for (let _i660 = 0; _i660 < _a659.length; _i660++) {
            const v_p = _a659[_i660];
            const _h663 = clueAt(cl.number, v_p);
            const _a661 = nearest(b, sp, cl, v_b);
            for (let _i662 = 0; _i662 < _a661.length; _i662++) {
              const v_q = _a661[_i662];
              const _h664 = clueAt(cl.number, v_q);
              if (!((Math.abs((_h663 - _h664)) === cl.step))) {
                _q657 = false;
                break Q658;
              }
            }
          }
        }
        _c665 = _q657;
      }
      let _c1298: boolean = (_c665 && (_h666 || !(throughWhere(sp, v_a, (_te667: number): boolean => {  return ((b.grid[_te667] || -1) === 1); }).includes(v_b))));
      if (_c1298) {
        let _c1297: boolean = (throughWhere(sp, v_a, (_te668: number): boolean => {  return ((b.grid[_te668] || -1) === 1); }).includes(v_b));
        if (!_c1297) {
          const _wc669 = v_e;
          const _wd670 = 1;
          let _q671 = false;
          Q672: {
            const _a674 = throughWhere(sp, v_a, (_te673: number): boolean => {  return ((_te673 === _wc669 ? _wd670 : (b.grid[_te673] || -1)) === 1); });
            for (let _i675 = 0; _i675 < _a674.length; _i675++) {
              const v_t = _a674[_i675];
              let _c695: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c695) {
                let _g676 = 0;
                G677: {
                  const _a678 = sp.adj4[v_t];
                  for (let _i679 = 0; _i679 < _a678.length; _i679++) {
                    const _t680 = sp.adj4Edges[v_t][_i679];
                    if (!(((_t680 === _wc669 ? _wd670 : (b.grid[_t680] || -1)) === 1))) continue;
                    _g676++;
                  }
                }
                let _g681 = 0;
                G682: {
                  const _a683 = setOf(v_t);
                  for (let _i684 = 0; _i684 < _a683.length; _i684++) {
                    const v_k = _a683[_i684];
                    const _h685 = clueAt(cl.number, v_k);
                    const _h692 = (_h685 + 1);
                    let _c694: boolean = (_h685 !== -1);
                    if (_c694) {
                      let _c693: boolean = (_h666 || (_h685 === 1));
                      if (!_c693) {
                        let _g686 = 0;
                        G687: {
                          const _t688 = (_h685 + 1);
                          const _a689 = cluesValued(cl.number, _t688);
                          for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                            const v_x = _a689[_i690];
                            const _h691 = clueAt(cl.number, v_x);
                            if (!((_h691 === _h692))) continue;
                            _g686++;
                          }
                        }
                        _c693 = (_g686 === 0);
                      }
                      _c694 = _c693;
                    }
                    if (!(_c694)) continue;
                    _g681++;
                  }
                }
                _c695 = (_g676 < (2 - _g681));
              }
              if (!(_c695)) continue;
              let _g696 = 0;
              G697: {
                const _a698 = sp.adj4[v_t];
                for (let _i699 = 0; _i699 < _a698.length; _i699++) {
                  const _t700 = sp.adj4Edges[v_t][_i699];
                  if (!(((_t700 === _wc669 ? _wd670 : (b.grid[_t700] || -1)) === 1))) continue;
                  _g696++;
                }
              }
              let _g701 = 0;
              G702: {
                const _a703 = setOf(v_t);
                for (let _i704 = 0; _i704 < _a703.length; _i704++) {
                  const v_k = _a703[_i704];
                  const _h705 = clueAt(cl.number, v_k);
                  const _h712 = (_h705 + 1);
                  let _c714: boolean = (_h705 !== -1);
                  if (_c714) {
                    let _c713: boolean = (_h666 || (_h705 === 1));
                    if (!_c713) {
                      let _g706 = 0;
                      G707: {
                        const _t708 = (_h705 + 1);
                        const _a709 = cluesValued(cl.number, _t708);
                        for (let _i710 = 0; _i710 < _a709.length; _i710++) {
                          const v_x = _a709[_i710];
                          const _h711 = clueAt(cl.number, v_x);
                          if (!((_h711 === _h712))) continue;
                          _g706++;
                        }
                      }
                      _c713 = (_g706 === 0);
                    }
                    _c714 = _c713;
                  }
                  if (!(_c714)) continue;
                  _g701++;
                }
              }
              let _c995: boolean = (_g696 < (2 - _g701));
              if (_c995) {
                let _q715 = false;
                Q716: {
                  const _a717 = sp.adj4[v_t];
                  for (let _i718 = 0; _i718 < _a717.length; _i718++) {
                    const v_y = _a717[_i718];
                    const _t719 = sp.adj4Edges[v_t][_i718];
                    let _c739: boolean = !((_t719 === _wc669 ? true : (b.grid[_t719] !== 0)));
                    if (_c739) {
                      let _g720 = 0;
                      G721: {
                        const _a722 = sp.adj4[v_t];
                        for (let _i723 = 0; _i723 < _a722.length; _i723++) {
                          const _t724 = sp.adj4Edges[v_t][_i723];
                          if (!(((_t724 === _wc669 ? _wd670 : (b.grid[_t724] || -1)) === 1))) continue;
                          _g720++;
                        }
                      }
                      let _g725 = 0;
                      G726: {
                        const _a727 = setOf(v_t);
                        for (let _i728 = 0; _i728 < _a727.length; _i728++) {
                          const v_k = _a727[_i728];
                          const _h729 = clueAt(cl.number, v_k);
                          const _h736 = (_h729 + 1);
                          let _c738: boolean = (_h729 !== -1);
                          if (_c738) {
                            let _c737: boolean = (_h666 || (_h729 === 1));
                            if (!_c737) {
                              let _g730 = 0;
                              G731: {
                                const _t732 = (_h729 + 1);
                                const _a733 = cluesValued(cl.number, _t732);
                                for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                                  const v_x = _a733[_i734];
                                  const _h735 = clueAt(cl.number, v_x);
                                  if (!((_h735 === _h736))) continue;
                                  _g730++;
                                }
                              }
                              _c737 = (_g730 === 0);
                            }
                            _c738 = _c737;
                          }
                          if (!(_c738)) continue;
                          _g725++;
                        }
                      }
                      _c739 = (_g720 < (2 - _g725));
                    }
                    let _c760: boolean = _c739;
                    if (_c760) {
                      let _g740 = 0;
                      G741: {
                        const _a743 = sp.adj4[v_y];
                        for (let _i744 = 0; _i744 < _a743.length; _i744++) {
                          const _t745 = sp.adj4Edges[v_y][_i744];
                          if (!(((_t745 === _wc669 ? _wd670 : (b.grid[_t745] || -1)) === 1))) continue;
                          _g740++;
                        }
                      }
                      let _g746 = 0;
                      G747: {
                        const _a748 = setOf(v_y);
                        for (let _i749 = 0; _i749 < _a748.length; _i749++) {
                          const v_k = _a748[_i749];
                          const _h750 = clueAt(cl.number, v_k);
                          const _h757 = (_h750 + 1);
                          let _c759: boolean = (_h750 !== -1);
                          if (_c759) {
                            let _c758: boolean = (_h666 || (_h750 === 1));
                            if (!_c758) {
                              let _g751 = 0;
                              G752: {
                                const _t753 = (_h750 + 1);
                                const _a754 = cluesValued(cl.number, _t753);
                                for (let _i755 = 0; _i755 < _a754.length; _i755++) {
                                  const v_x = _a754[_i755];
                                  const _h756 = clueAt(cl.number, v_x);
                                  if (!((_h756 === _h757))) continue;
                                  _g751++;
                                }
                              }
                              _c758 = (_g751 === 0);
                            }
                            _c759 = _c758;
                          }
                          if (!(_c759)) continue;
                          _g746++;
                        }
                      }
                      _c760 = (_g740 < (2 - _g746));
                    }
                    let _c843: boolean = _c760;
                    if (_c843) {
                      let _q761 = true;
                      Q762: {
                        _g763.length = 0;
                        G764: {
                          const _a767 = setOf(v_t);
                          for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                            const v_x = _a767[_i768];
                            const _h769 = clueAt(cl.number, v_x);
                            if (!((_h769 !== -1))) continue;
                            _g763.push(v_x);
                          }
                        }
                        _g770.length = 0;
                        G771: {
                          const _a790 = throughWhere(sp, v_t, (_te785: number): boolean => { let _c787: boolean = ((_te785 === _wc669 ? _wd670 : (b.grid[_te785] || -1)) === 1); if (_c787) {   const _t786 = sp.edgeEnds[2 * _te785];   _c787 = !((clueAt(cl.number, _t786) !== -1)); } let _c789: boolean = _c787; if (_c789) {   const _t788 = sp.edgeEnds[2 * _te785 + 1];   _c789 = !((clueAt(cl.number, _t788) !== -1)); } return _c789; });
                          for (let _i791 = 0; _i791 < _a790.length; _i791++) {
                            const v_t_784 = _a790[_i791];
                            const _h794 = clueAt(cl.number, v_t_784);
                            const _h795 = (_h794 !== -1);
                            const _h796 = _h795;
                            const _h797 = !(_h796);
                            const _a792 = sp.adj4[v_t_784];
                            for (let _i793 = 0; _i793 < _a792.length; _i793++) {
                              const v_x = _a792[_i793];
                              const _h798 = clueAt(cl.number, v_x);
                              let _c800: boolean = (_h797 && (_h798 !== -1));
                              if (_c800) {
                                const _t799 = sp.adj4Edges[v_t_784][_i793];
                                _c800 = ((_t799 === _wc669 ? _wd670 : (b.grid[_t799] || -1)) === 1);
                              }
                              if (!(_c800)) continue;
                              if (!_g770.includes(v_x)) _g770.push(v_x);
                            }
                          }
                        }
                        const _a801 = union(_g763, _g770);
                        for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                          const v_p = _a801[_i802];
                          const _h841 = clueAt(cl.number, v_p);
                          _g803.length = 0;
                          G804: {
                            const _a807 = setOf(v_y);
                            for (let _i808 = 0; _i808 < _a807.length; _i808++) {
                              const v_x = _a807[_i808];
                              const _h809 = clueAt(cl.number, v_x);
                              if (!((_h809 !== -1))) continue;
                              _g803.push(v_x);
                            }
                          }
                          _g810.length = 0;
                          G811: {
                            const _a828 = throughWhere(sp, v_y, (_te823: number): boolean => { let _c825: boolean = ((_te823 === _wc669 ? _wd670 : (b.grid[_te823] || -1)) === 1); if (_c825) {   const _t824 = sp.edgeEnds[2 * _te823];   _c825 = !((clueAt(cl.number, _t824) !== -1)); } let _c827: boolean = _c825; if (_c827) {   const _t826 = sp.edgeEnds[2 * _te823 + 1];   _c827 = !((clueAt(cl.number, _t826) !== -1)); } return _c827; });
                            for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                              const v_t = _a828[_i829];
                              const _h832 = clueAt(cl.number, v_t);
                              const _h833 = (_h832 !== -1);
                              const _h834 = _h833;
                              const _h835 = !(_h834);
                              const _a830 = sp.adj4[v_t];
                              for (let _i831 = 0; _i831 < _a830.length; _i831++) {
                                const v_x = _a830[_i831];
                                const _h836 = clueAt(cl.number, v_x);
                                let _c838: boolean = (_h835 && (_h836 !== -1));
                                if (_c838) {
                                  const _t837 = sp.adj4Edges[v_t][_i831];
                                  _c838 = ((_t837 === _wc669 ? _wd670 : (b.grid[_t837] || -1)) === 1);
                                }
                                if (!(_c838)) continue;
                                if (!_g810.includes(v_x)) _g810.push(v_x);
                              }
                            }
                          }
                          const _a839 = union(_g803, _g810);
                          for (let _i840 = 0; _i840 < _a839.length; _i840++) {
                            const v_q = _a839[_i840];
                            const _h842 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h841 - _h842)) === cl.step))) {
                              _q761 = false;
                              break Q762;
                            }
                          }
                        }
                      }
                      _c843 = _q761;
                    }
                    if (!((_c843 && (_h666 || !(throughWhere(sp, v_t, (_te844: number): boolean => {  return ((_te844 === _wc669 ? _wd670 : (b.grid[_te844] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g845 = 0;
                    G846: {
                      const _a847 = sp.adj4[v_t];
                      for (let _i848 = 0; _i848 < _a847.length; _i848++) {
                        const _t849 = sp.adj4Edges[v_t][_i848];
                        if (!(((_t849 === _wc669 ? _wd670 : (b.grid[_t849] || -1)) === 1))) continue;
                        _g845++;
                      }
                    }
                    let _g850 = 0;
                    G851: {
                      const _a852 = setOf(v_t);
                      for (let _i853 = 0; _i853 < _a852.length; _i853++) {
                        const v_k = _a852[_i853];
                        const _h854 = clueAt(cl.number, v_k);
                        const _h861 = (_h854 + 1);
                        let _c863: boolean = (_h854 !== -1);
                        if (_c863) {
                          let _c862: boolean = (_h666 || (_h854 === 1));
                          if (!_c862) {
                            let _g855 = 0;
                            G856: {
                              const _t857 = (_h854 + 1);
                              const _a858 = cluesValued(cl.number, _t857);
                              for (let _i859 = 0; _i859 < _a858.length; _i859++) {
                                const v_x = _a858[_i859];
                                const _h860 = clueAt(cl.number, v_x);
                                if (!((_h860 === _h861))) continue;
                                _g855++;
                              }
                            }
                            _c862 = (_g855 === 0);
                          }
                          _c863 = _c862;
                        }
                        if (!(_c863)) continue;
                        _g850++;
                      }
                    }
                    let _c994: boolean = ((_g845 + 1) === (2 - _g850));
                    if (!_c994) {
                      let _q864 = false;
                      Q865: {
                        const _a866 = sp.adj4[v_t];
                        const _n867 = _i718;
                        for (let _i868 = 0; _i868 < _n867; _i868++) {
                          const v_z = _a866[_i868];
                          const _t869 = sp.adj4Edges[v_t][_i868];
                          let _c889: boolean = !((_t869 === _wc669 ? true : (b.grid[_t869] !== 0)));
                          if (_c889) {
                            let _g870 = 0;
                            G871: {
                              const _a872 = sp.adj4[v_t];
                              for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                                const _t874 = sp.adj4Edges[v_t][_i873];
                                if (!(((_t874 === _wc669 ? _wd670 : (b.grid[_t874] || -1)) === 1))) continue;
                                _g870++;
                              }
                            }
                            let _g875 = 0;
                            G876: {
                              const _a877 = setOf(v_t);
                              for (let _i878 = 0; _i878 < _a877.length; _i878++) {
                                const v_k = _a877[_i878];
                                const _h879 = clueAt(cl.number, v_k);
                                const _h886 = (_h879 + 1);
                                let _c888: boolean = (_h879 !== -1);
                                if (_c888) {
                                  let _c887: boolean = (_h666 || (_h879 === 1));
                                  if (!_c887) {
                                    let _g880 = 0;
                                    G881: {
                                      const _t882 = (_h879 + 1);
                                      const _a883 = cluesValued(cl.number, _t882);
                                      for (let _i884 = 0; _i884 < _a883.length; _i884++) {
                                        const v_x = _a883[_i884];
                                        const _h885 = clueAt(cl.number, v_x);
                                        if (!((_h885 === _h886))) continue;
                                        _g880++;
                                      }
                                    }
                                    _c887 = (_g880 === 0);
                                  }
                                  _c888 = _c887;
                                }
                                if (!(_c888)) continue;
                                _g875++;
                              }
                            }
                            _c889 = (_g870 < (2 - _g875));
                          }
                          let _c909: boolean = _c889;
                          if (_c909) {
                            let _g890 = 0;
                            G891: {
                              const _a892 = sp.adj4[v_z];
                              for (let _i893 = 0; _i893 < _a892.length; _i893++) {
                                const _t894 = sp.adj4Edges[v_z][_i893];
                                if (!(((_t894 === _wc669 ? _wd670 : (b.grid[_t894] || -1)) === 1))) continue;
                                _g890++;
                              }
                            }
                            let _g895 = 0;
                            G896: {
                              const _a897 = setOf(v_z);
                              for (let _i898 = 0; _i898 < _a897.length; _i898++) {
                                const v_k = _a897[_i898];
                                const _h899 = clueAt(cl.number, v_k);
                                const _h906 = (_h899 + 1);
                                let _c908: boolean = (_h899 !== -1);
                                if (_c908) {
                                  let _c907: boolean = (_h666 || (_h899 === 1));
                                  if (!_c907) {
                                    let _g900 = 0;
                                    G901: {
                                      const _t902 = (_h899 + 1);
                                      const _a903 = cluesValued(cl.number, _t902);
                                      for (let _i904 = 0; _i904 < _a903.length; _i904++) {
                                        const v_x = _a903[_i904];
                                        const _h905 = clueAt(cl.number, v_x);
                                        if (!((_h905 === _h906))) continue;
                                        _g900++;
                                      }
                                    }
                                    _c907 = (_g900 === 0);
                                  }
                                  _c908 = _c907;
                                }
                                if (!(_c908)) continue;
                                _g895++;
                              }
                            }
                            _c909 = (_g890 < (2 - _g895));
                          }
                          let _c992: boolean = _c909;
                          if (_c992) {
                            let _q910 = true;
                            Q911: {
                              _g912.length = 0;
                              G913: {
                                const _a916 = setOf(v_t);
                                for (let _i917 = 0; _i917 < _a916.length; _i917++) {
                                  const v_x = _a916[_i917];
                                  const _h918 = clueAt(cl.number, v_x);
                                  if (!((_h918 !== -1))) continue;
                                  _g912.push(v_x);
                                }
                              }
                              _g919.length = 0;
                              G920: {
                                const _a939 = throughWhere(sp, v_t, (_te934: number): boolean => { let _c936: boolean = ((_te934 === _wc669 ? _wd670 : (b.grid[_te934] || -1)) === 1); if (_c936) {   const _t935 = sp.edgeEnds[2 * _te934];   _c936 = !((clueAt(cl.number, _t935) !== -1)); } let _c938: boolean = _c936; if (_c938) {   const _t937 = sp.edgeEnds[2 * _te934 + 1];   _c938 = !((clueAt(cl.number, _t937) !== -1)); } return _c938; });
                                for (let _i940 = 0; _i940 < _a939.length; _i940++) {
                                  const v_t_933 = _a939[_i940];
                                  const _h943 = clueAt(cl.number, v_t_933);
                                  const _h944 = (_h943 !== -1);
                                  const _h945 = _h944;
                                  const _h946 = !(_h945);
                                  const _a941 = sp.adj4[v_t_933];
                                  for (let _i942 = 0; _i942 < _a941.length; _i942++) {
                                    const v_x = _a941[_i942];
                                    const _h947 = clueAt(cl.number, v_x);
                                    let _c949: boolean = (_h946 && (_h947 !== -1));
                                    if (_c949) {
                                      const _t948 = sp.adj4Edges[v_t_933][_i942];
                                      _c949 = ((_t948 === _wc669 ? _wd670 : (b.grid[_t948] || -1)) === 1);
                                    }
                                    if (!(_c949)) continue;
                                    if (!_g919.includes(v_x)) _g919.push(v_x);
                                  }
                                }
                              }
                              const _a950 = union(_g912, _g919);
                              for (let _i951 = 0; _i951 < _a950.length; _i951++) {
                                const v_p = _a950[_i951];
                                const _h990 = clueAt(cl.number, v_p);
                                _g952.length = 0;
                                G953: {
                                  const _a956 = setOf(v_z);
                                  for (let _i957 = 0; _i957 < _a956.length; _i957++) {
                                    const v_x = _a956[_i957];
                                    const _h958 = clueAt(cl.number, v_x);
                                    if (!((_h958 !== -1))) continue;
                                    _g952.push(v_x);
                                  }
                                }
                                _g959.length = 0;
                                G960: {
                                  const _a977 = throughWhere(sp, v_z, (_te972: number): boolean => { let _c974: boolean = ((_te972 === _wc669 ? _wd670 : (b.grid[_te972] || -1)) === 1); if (_c974) {   const _t973 = sp.edgeEnds[2 * _te972];   _c974 = !((clueAt(cl.number, _t973) !== -1)); } let _c976: boolean = _c974; if (_c976) {   const _t975 = sp.edgeEnds[2 * _te972 + 1];   _c976 = !((clueAt(cl.number, _t975) !== -1)); } return _c976; });
                                  for (let _i978 = 0; _i978 < _a977.length; _i978++) {
                                    const v_t = _a977[_i978];
                                    const _h981 = clueAt(cl.number, v_t);
                                    const _h982 = (_h981 !== -1);
                                    const _h983 = _h982;
                                    const _h984 = !(_h983);
                                    const _a979 = sp.adj4[v_t];
                                    for (let _i980 = 0; _i980 < _a979.length; _i980++) {
                                      const v_x = _a979[_i980];
                                      const _h985 = clueAt(cl.number, v_x);
                                      let _c987: boolean = (_h984 && (_h985 !== -1));
                                      if (_c987) {
                                        const _t986 = sp.adj4Edges[v_t][_i980];
                                        _c987 = ((_t986 === _wc669 ? _wd670 : (b.grid[_t986] || -1)) === 1);
                                      }
                                      if (!(_c987)) continue;
                                      if (!_g959.includes(v_x)) _g959.push(v_x);
                                    }
                                  }
                                }
                                const _a988 = union(_g952, _g959);
                                for (let _i989 = 0; _i989 < _a988.length; _i989++) {
                                  const v_q = _a988[_i989];
                                  const _h991 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h990 - _h991)) === cl.step))) {
                                    _q910 = false;
                                    break Q911;
                                  }
                                }
                              }
                            }
                            _c992 = _q910;
                          }
                          if ((_c992 && (_h666 || !(throughWhere(sp, v_t, (_te993: number): boolean => {  return ((_te993 === _wc669 ? _wd670 : (b.grid[_te993] || -1)) === 1); }).includes(v_z))))) {
                            _q864 = true;
                            break Q865;
                          }
                        }
                      }
                      _c994 = _q864;
                    }
                    if (_c994) {
                      _q715 = true;
                      break Q716;
                    }
                  }
                }
                _c995 = !(_q715);
              }
              let _c1296: boolean = _c995;
              if (!_c1296) {
                let _q996 = false;
                Q997: {
                  const _a998 = sp.adj4[v_t];
                  for (let _i999 = 0; _i999 < _a998.length; _i999++) {
                    const v_s = _a998[_i999];
                    let _g1000 = 0;
                    G1001: {
                      const _a1002 = sp.adj4[v_s];
                      for (let _i1003 = 0; _i1003 < _a1002.length; _i1003++) {
                        const _t1004 = sp.adj4Edges[v_s][_i1003];
                        if (!(((_t1004 === _wc669 ? _wd670 : (b.grid[_t1004] || -1)) === 1))) continue;
                        _g1000++;
                      }
                    }
                    let _g1005 = 0;
                    G1006: {
                      const _a1007 = setOf(v_s);
                      for (let _i1008 = 0; _i1008 < _a1007.length; _i1008++) {
                        const v_k = _a1007[_i1008];
                        const _h1009 = clueAt(cl.number, v_k);
                        const _h1016 = (_h1009 + 1);
                        let _c1018: boolean = (_h1009 !== -1);
                        if (_c1018) {
                          let _c1017: boolean = (_h666 || (_h1009 === 1));
                          if (!_c1017) {
                            let _g1010 = 0;
                            G1011: {
                              const _t1012 = (_h1009 + 1);
                              const _a1013 = cluesValued(cl.number, _t1012);
                              for (let _i1014 = 0; _i1014 < _a1013.length; _i1014++) {
                                const v_x = _a1013[_i1014];
                                const _h1015 = clueAt(cl.number, v_x);
                                if (!((_h1015 === _h1016))) continue;
                                _g1010++;
                              }
                            }
                            _c1017 = (_g1010 === 0);
                          }
                          _c1018 = _c1017;
                        }
                        if (!(_c1018)) continue;
                        _g1005++;
                      }
                    }
                    let _c1295: boolean = (_g1000 < (2 - _g1005));
                    if (_c1295) {
                      let _q1019 = false;
                      Q1020: {
                        const _a1021 = sp.adj4[v_s];
                        for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
                          const v_y = _a1021[_i1022];
                          const _t1023 = sp.adj4Edges[v_s][_i1022];
                          let _c1043: boolean = !((_t1023 === _wc669 ? true : (b.grid[_t1023] !== 0)));
                          if (_c1043) {
                            let _g1024 = 0;
                            G1025: {
                              const _a1026 = sp.adj4[v_s];
                              for (let _i1027 = 0; _i1027 < _a1026.length; _i1027++) {
                                const _t1028 = sp.adj4Edges[v_s][_i1027];
                                if (!(((_t1028 === _wc669 ? _wd670 : (b.grid[_t1028] || -1)) === 1))) continue;
                                _g1024++;
                              }
                            }
                            let _g1029 = 0;
                            G1030: {
                              const _a1031 = setOf(v_s);
                              for (let _i1032 = 0; _i1032 < _a1031.length; _i1032++) {
                                const v_k = _a1031[_i1032];
                                const _h1033 = clueAt(cl.number, v_k);
                                const _h1040 = (_h1033 + 1);
                                let _c1042: boolean = (_h1033 !== -1);
                                if (_c1042) {
                                  let _c1041: boolean = (_h666 || (_h1033 === 1));
                                  if (!_c1041) {
                                    let _g1034 = 0;
                                    G1035: {
                                      const _t1036 = (_h1033 + 1);
                                      const _a1037 = cluesValued(cl.number, _t1036);
                                      for (let _i1038 = 0; _i1038 < _a1037.length; _i1038++) {
                                        const v_x = _a1037[_i1038];
                                        const _h1039 = clueAt(cl.number, v_x);
                                        if (!((_h1039 === _h1040))) continue;
                                        _g1034++;
                                      }
                                    }
                                    _c1041 = (_g1034 === 0);
                                  }
                                  _c1042 = _c1041;
                                }
                                if (!(_c1042)) continue;
                                _g1029++;
                              }
                            }
                            _c1043 = (_g1024 < (2 - _g1029));
                          }
                          let _c1064: boolean = _c1043;
                          if (_c1064) {
                            let _g1044 = 0;
                            G1045: {
                              const _a1047 = sp.adj4[v_y];
                              for (let _i1048 = 0; _i1048 < _a1047.length; _i1048++) {
                                const _t1049 = sp.adj4Edges[v_y][_i1048];
                                if (!(((_t1049 === _wc669 ? _wd670 : (b.grid[_t1049] || -1)) === 1))) continue;
                                _g1044++;
                              }
                            }
                            let _g1050 = 0;
                            G1051: {
                              const _a1052 = setOf(v_y);
                              for (let _i1053 = 0; _i1053 < _a1052.length; _i1053++) {
                                const v_k = _a1052[_i1053];
                                const _h1054 = clueAt(cl.number, v_k);
                                const _h1061 = (_h1054 + 1);
                                let _c1063: boolean = (_h1054 !== -1);
                                if (_c1063) {
                                  let _c1062: boolean = (_h666 || (_h1054 === 1));
                                  if (!_c1062) {
                                    let _g1055 = 0;
                                    G1056: {
                                      const _t1057 = (_h1054 + 1);
                                      const _a1058 = cluesValued(cl.number, _t1057);
                                      for (let _i1059 = 0; _i1059 < _a1058.length; _i1059++) {
                                        const v_x = _a1058[_i1059];
                                        const _h1060 = clueAt(cl.number, v_x);
                                        if (!((_h1060 === _h1061))) continue;
                                        _g1055++;
                                      }
                                    }
                                    _c1062 = (_g1055 === 0);
                                  }
                                  _c1063 = _c1062;
                                }
                                if (!(_c1063)) continue;
                                _g1050++;
                              }
                            }
                            _c1064 = (_g1044 < (2 - _g1050));
                          }
                          let _c1145: boolean = _c1064;
                          if (_c1145) {
                            let _q1065 = true;
                            Q1066: {
                              _g1067.length = 0;
                              G1068: {
                                const _a1071 = setOf(v_s);
                                for (let _i1072 = 0; _i1072 < _a1071.length; _i1072++) {
                                  const v_x = _a1071[_i1072];
                                  const _h1073 = clueAt(cl.number, v_x);
                                  if (!((_h1073 !== -1))) continue;
                                  _g1067.push(v_x);
                                }
                              }
                              _g1074.length = 0;
                              G1075: {
                                const _a1092 = throughWhere(sp, v_s, (_te1087: number): boolean => { let _c1089: boolean = ((_te1087 === _wc669 ? _wd670 : (b.grid[_te1087] || -1)) === 1); if (_c1089) {   const _t1088 = sp.edgeEnds[2 * _te1087];   _c1089 = !((clueAt(cl.number, _t1088) !== -1)); } let _c1091: boolean = _c1089; if (_c1091) {   const _t1090 = sp.edgeEnds[2 * _te1087 + 1];   _c1091 = !((clueAt(cl.number, _t1090) !== -1)); } return _c1091; });
                                for (let _i1093 = 0; _i1093 < _a1092.length; _i1093++) {
                                  const v_t = _a1092[_i1093];
                                  const _h1096 = clueAt(cl.number, v_t);
                                  const _h1097 = (_h1096 !== -1);
                                  const _h1098 = _h1097;
                                  const _h1099 = !(_h1098);
                                  const _a1094 = sp.adj4[v_t];
                                  for (let _i1095 = 0; _i1095 < _a1094.length; _i1095++) {
                                    const v_x = _a1094[_i1095];
                                    const _h1100 = clueAt(cl.number, v_x);
                                    let _c1102: boolean = (_h1099 && (_h1100 !== -1));
                                    if (_c1102) {
                                      const _t1101 = sp.adj4Edges[v_t][_i1095];
                                      _c1102 = ((_t1101 === _wc669 ? _wd670 : (b.grid[_t1101] || -1)) === 1);
                                    }
                                    if (!(_c1102)) continue;
                                    if (!_g1074.includes(v_x)) _g1074.push(v_x);
                                  }
                                }
                              }
                              const _a1103 = union(_g1067, _g1074);
                              for (let _i1104 = 0; _i1104 < _a1103.length; _i1104++) {
                                const v_p = _a1103[_i1104];
                                const _h1143 = clueAt(cl.number, v_p);
                                _g1105.length = 0;
                                G1106: {
                                  const _a1109 = setOf(v_y);
                                  for (let _i1110 = 0; _i1110 < _a1109.length; _i1110++) {
                                    const v_x = _a1109[_i1110];
                                    const _h1111 = clueAt(cl.number, v_x);
                                    if (!((_h1111 !== -1))) continue;
                                    _g1105.push(v_x);
                                  }
                                }
                                _g1112.length = 0;
                                G1113: {
                                  const _a1130 = throughWhere(sp, v_y, (_te1125: number): boolean => { let _c1127: boolean = ((_te1125 === _wc669 ? _wd670 : (b.grid[_te1125] || -1)) === 1); if (_c1127) {   const _t1126 = sp.edgeEnds[2 * _te1125];   _c1127 = !((clueAt(cl.number, _t1126) !== -1)); } let _c1129: boolean = _c1127; if (_c1129) {   const _t1128 = sp.edgeEnds[2 * _te1125 + 1];   _c1129 = !((clueAt(cl.number, _t1128) !== -1)); } return _c1129; });
                                  for (let _i1131 = 0; _i1131 < _a1130.length; _i1131++) {
                                    const v_t = _a1130[_i1131];
                                    const _h1134 = clueAt(cl.number, v_t);
                                    const _h1135 = (_h1134 !== -1);
                                    const _h1136 = _h1135;
                                    const _h1137 = !(_h1136);
                                    const _a1132 = sp.adj4[v_t];
                                    for (let _i1133 = 0; _i1133 < _a1132.length; _i1133++) {
                                      const v_x = _a1132[_i1133];
                                      const _h1138 = clueAt(cl.number, v_x);
                                      let _c1140: boolean = (_h1137 && (_h1138 !== -1));
                                      if (_c1140) {
                                        const _t1139 = sp.adj4Edges[v_t][_i1133];
                                        _c1140 = ((_t1139 === _wc669 ? _wd670 : (b.grid[_t1139] || -1)) === 1);
                                      }
                                      if (!(_c1140)) continue;
                                      if (!_g1112.includes(v_x)) _g1112.push(v_x);
                                    }
                                  }
                                }
                                const _a1141 = union(_g1105, _g1112);
                                for (let _i1142 = 0; _i1142 < _a1141.length; _i1142++) {
                                  const v_q = _a1141[_i1142];
                                  const _h1144 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1143 - _h1144)) === cl.step))) {
                                    _q1065 = false;
                                    break Q1066;
                                  }
                                }
                              }
                            }
                            _c1145 = _q1065;
                          }
                          if (!((_c1145 && (_h666 || !(throughWhere(sp, v_s, (_te1146: number): boolean => {  return ((_te1146 === _wc669 ? _wd670 : (b.grid[_te1146] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g1147 = 0;
                          G1148: {
                            const _a1149 = sp.adj4[v_s];
                            for (let _i1150 = 0; _i1150 < _a1149.length; _i1150++) {
                              const _t1151 = sp.adj4Edges[v_s][_i1150];
                              if (!(((_t1151 === _wc669 ? _wd670 : (b.grid[_t1151] || -1)) === 1))) continue;
                              _g1147++;
                            }
                          }
                          let _g1152 = 0;
                          G1153: {
                            const _a1154 = setOf(v_s);
                            for (let _i1155 = 0; _i1155 < _a1154.length; _i1155++) {
                              const v_k = _a1154[_i1155];
                              const _h1156 = clueAt(cl.number, v_k);
                              const _h1163 = (_h1156 + 1);
                              let _c1165: boolean = (_h1156 !== -1);
                              if (_c1165) {
                                let _c1164: boolean = (_h666 || (_h1156 === 1));
                                if (!_c1164) {
                                  let _g1157 = 0;
                                  G1158: {
                                    const _t1159 = (_h1156 + 1);
                                    const _a1160 = cluesValued(cl.number, _t1159);
                                    for (let _i1161 = 0; _i1161 < _a1160.length; _i1161++) {
                                      const v_x = _a1160[_i1161];
                                      const _h1162 = clueAt(cl.number, v_x);
                                      if (!((_h1162 === _h1163))) continue;
                                      _g1157++;
                                    }
                                  }
                                  _c1164 = (_g1157 === 0);
                                }
                                _c1165 = _c1164;
                              }
                              if (!(_c1165)) continue;
                              _g1152++;
                            }
                          }
                          let _c1294: boolean = ((_g1147 + 1) === (2 - _g1152));
                          if (!_c1294) {
                            let _q1166 = false;
                            Q1167: {
                              const _a1168 = sp.adj4[v_s];
                              const _n1169 = _i1022;
                              for (let _i1170 = 0; _i1170 < _n1169; _i1170++) {
                                const v_z = _a1168[_i1170];
                                const _t1171 = sp.adj4Edges[v_s][_i1170];
                                let _c1191: boolean = !((_t1171 === _wc669 ? true : (b.grid[_t1171] !== 0)));
                                if (_c1191) {
                                  let _g1172 = 0;
                                  G1173: {
                                    const _a1174 = sp.adj4[v_s];
                                    for (let _i1175 = 0; _i1175 < _a1174.length; _i1175++) {
                                      const _t1176 = sp.adj4Edges[v_s][_i1175];
                                      if (!(((_t1176 === _wc669 ? _wd670 : (b.grid[_t1176] || -1)) === 1))) continue;
                                      _g1172++;
                                    }
                                  }
                                  let _g1177 = 0;
                                  G1178: {
                                    const _a1179 = setOf(v_s);
                                    for (let _i1180 = 0; _i1180 < _a1179.length; _i1180++) {
                                      const v_k = _a1179[_i1180];
                                      const _h1181 = clueAt(cl.number, v_k);
                                      const _h1188 = (_h1181 + 1);
                                      let _c1190: boolean = (_h1181 !== -1);
                                      if (_c1190) {
                                        let _c1189: boolean = (_h666 || (_h1181 === 1));
                                        if (!_c1189) {
                                          let _g1182 = 0;
                                          G1183: {
                                            const _t1184 = (_h1181 + 1);
                                            const _a1185 = cluesValued(cl.number, _t1184);
                                            for (let _i1186 = 0; _i1186 < _a1185.length; _i1186++) {
                                              const v_x = _a1185[_i1186];
                                              const _h1187 = clueAt(cl.number, v_x);
                                              if (!((_h1187 === _h1188))) continue;
                                              _g1182++;
                                            }
                                          }
                                          _c1189 = (_g1182 === 0);
                                        }
                                        _c1190 = _c1189;
                                      }
                                      if (!(_c1190)) continue;
                                      _g1177++;
                                    }
                                  }
                                  _c1191 = (_g1172 < (2 - _g1177));
                                }
                                let _c1211: boolean = _c1191;
                                if (_c1211) {
                                  let _g1192 = 0;
                                  G1193: {
                                    const _a1194 = sp.adj4[v_z];
                                    for (let _i1195 = 0; _i1195 < _a1194.length; _i1195++) {
                                      const _t1196 = sp.adj4Edges[v_z][_i1195];
                                      if (!(((_t1196 === _wc669 ? _wd670 : (b.grid[_t1196] || -1)) === 1))) continue;
                                      _g1192++;
                                    }
                                  }
                                  let _g1197 = 0;
                                  G1198: {
                                    const _a1199 = setOf(v_z);
                                    for (let _i1200 = 0; _i1200 < _a1199.length; _i1200++) {
                                      const v_k = _a1199[_i1200];
                                      const _h1201 = clueAt(cl.number, v_k);
                                      const _h1208 = (_h1201 + 1);
                                      let _c1210: boolean = (_h1201 !== -1);
                                      if (_c1210) {
                                        let _c1209: boolean = (_h666 || (_h1201 === 1));
                                        if (!_c1209) {
                                          let _g1202 = 0;
                                          G1203: {
                                            const _t1204 = (_h1201 + 1);
                                            const _a1205 = cluesValued(cl.number, _t1204);
                                            for (let _i1206 = 0; _i1206 < _a1205.length; _i1206++) {
                                              const v_x = _a1205[_i1206];
                                              const _h1207 = clueAt(cl.number, v_x);
                                              if (!((_h1207 === _h1208))) continue;
                                              _g1202++;
                                            }
                                          }
                                          _c1209 = (_g1202 === 0);
                                        }
                                        _c1210 = _c1209;
                                      }
                                      if (!(_c1210)) continue;
                                      _g1197++;
                                    }
                                  }
                                  _c1211 = (_g1192 < (2 - _g1197));
                                }
                                let _c1292: boolean = _c1211;
                                if (_c1292) {
                                  let _q1212 = true;
                                  Q1213: {
                                    _g1214.length = 0;
                                    G1215: {
                                      const _a1218 = setOf(v_s);
                                      for (let _i1219 = 0; _i1219 < _a1218.length; _i1219++) {
                                        const v_x = _a1218[_i1219];
                                        const _h1220 = clueAt(cl.number, v_x);
                                        if (!((_h1220 !== -1))) continue;
                                        _g1214.push(v_x);
                                      }
                                    }
                                    _g1221.length = 0;
                                    G1222: {
                                      const _a1239 = throughWhere(sp, v_s, (_te1234: number): boolean => { let _c1236: boolean = ((_te1234 === _wc669 ? _wd670 : (b.grid[_te1234] || -1)) === 1); if (_c1236) {   const _t1235 = sp.edgeEnds[2 * _te1234];   _c1236 = !((clueAt(cl.number, _t1235) !== -1)); } let _c1238: boolean = _c1236; if (_c1238) {   const _t1237 = sp.edgeEnds[2 * _te1234 + 1];   _c1238 = !((clueAt(cl.number, _t1237) !== -1)); } return _c1238; });
                                      for (let _i1240 = 0; _i1240 < _a1239.length; _i1240++) {
                                        const v_t = _a1239[_i1240];
                                        const _h1243 = clueAt(cl.number, v_t);
                                        const _h1244 = (_h1243 !== -1);
                                        const _h1245 = _h1244;
                                        const _h1246 = !(_h1245);
                                        const _a1241 = sp.adj4[v_t];
                                        for (let _i1242 = 0; _i1242 < _a1241.length; _i1242++) {
                                          const v_x = _a1241[_i1242];
                                          const _h1247 = clueAt(cl.number, v_x);
                                          let _c1249: boolean = (_h1246 && (_h1247 !== -1));
                                          if (_c1249) {
                                            const _t1248 = sp.adj4Edges[v_t][_i1242];
                                            _c1249 = ((_t1248 === _wc669 ? _wd670 : (b.grid[_t1248] || -1)) === 1);
                                          }
                                          if (!(_c1249)) continue;
                                          if (!_g1221.includes(v_x)) _g1221.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1250 = union(_g1214, _g1221);
                                    for (let _i1251 = 0; _i1251 < _a1250.length; _i1251++) {
                                      const v_p = _a1250[_i1251];
                                      const _h1290 = clueAt(cl.number, v_p);
                                      _g1252.length = 0;
                                      G1253: {
                                        const _a1256 = setOf(v_z);
                                        for (let _i1257 = 0; _i1257 < _a1256.length; _i1257++) {
                                          const v_x = _a1256[_i1257];
                                          const _h1258 = clueAt(cl.number, v_x);
                                          if (!((_h1258 !== -1))) continue;
                                          _g1252.push(v_x);
                                        }
                                      }
                                      _g1259.length = 0;
                                      G1260: {
                                        const _a1277 = throughWhere(sp, v_z, (_te1272: number): boolean => { let _c1274: boolean = ((_te1272 === _wc669 ? _wd670 : (b.grid[_te1272] || -1)) === 1); if (_c1274) {   const _t1273 = sp.edgeEnds[2 * _te1272];   _c1274 = !((clueAt(cl.number, _t1273) !== -1)); } let _c1276: boolean = _c1274; if (_c1276) {   const _t1275 = sp.edgeEnds[2 * _te1272 + 1];   _c1276 = !((clueAt(cl.number, _t1275) !== -1)); } return _c1276; });
                                        for (let _i1278 = 0; _i1278 < _a1277.length; _i1278++) {
                                          const v_t = _a1277[_i1278];
                                          const _h1281 = clueAt(cl.number, v_t);
                                          const _h1282 = (_h1281 !== -1);
                                          const _h1283 = _h1282;
                                          const _h1284 = !(_h1283);
                                          const _a1279 = sp.adj4[v_t];
                                          for (let _i1280 = 0; _i1280 < _a1279.length; _i1280++) {
                                            const v_x = _a1279[_i1280];
                                            const _h1285 = clueAt(cl.number, v_x);
                                            let _c1287: boolean = (_h1284 && (_h1285 !== -1));
                                            if (_c1287) {
                                              const _t1286 = sp.adj4Edges[v_t][_i1280];
                                              _c1287 = ((_t1286 === _wc669 ? _wd670 : (b.grid[_t1286] || -1)) === 1);
                                            }
                                            if (!(_c1287)) continue;
                                            if (!_g1259.includes(v_x)) _g1259.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1288 = union(_g1252, _g1259);
                                      for (let _i1289 = 0; _i1289 < _a1288.length; _i1289++) {
                                        const v_q = _a1288[_i1289];
                                        const _h1291 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1290 - _h1291)) === cl.step))) {
                                          _q1212 = false;
                                          break Q1213;
                                        }
                                      }
                                    }
                                  }
                                  _c1292 = _q1212;
                                }
                                if ((_c1292 && (_h666 || !(throughWhere(sp, v_s, (_te1293: number): boolean => {  return ((_te1293 === _wc669 ? _wd670 : (b.grid[_te1293] || -1)) === 1); }).includes(v_z))))) {
                                  _q1166 = true;
                                  break Q1167;
                                }
                              }
                            }
                            _c1294 = _q1166;
                          }
                          if (_c1294) {
                            _q1019 = true;
                            break Q1020;
                          }
                        }
                      }
                      _c1295 = !(_q1019);
                    }
                    if (_c1295) {
                      _q996 = true;
                      break Q997;
                    }
                  }
                }
                _c1296 = _q996;
              }
              if (_c1296) {
                _q671 = true;
                break Q672;
              }
            }
          }
          _c1297 = _q671;
        }
        _c1298 = _c1297;
      }
      if (!(_c1298)) break L656;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBreaksBinding {
  c: number;
  U: readonly number[];
  k: number;
  I: readonly number[];
  i: number;
  j: number;
}

const pairBreaksFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g1978: number[] = [];
  const _g1985: number[] = [];
  const _g2018: number[] = [];
  const _g2025: number[] = [];
  const _g2127: number[] = [];
  const _g2134: number[] = [];
  const _g2167: number[] = [];
  const _g2174: number[] = [];
  const _g2282: number[] = [];
  const _g2289: number[] = [];
  const _g2320: number[] = [];
  const _g2327: number[] = [];
  const _g2429: number[] = [];
  const _g2436: number[] = [];
  const _g2467: number[] = [];
  const _g2474: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h1900 = (cl.step === 0);
  const _a1855 = sp.cells;
  for (let _i1856 = 0; _i1856 < _a1855.length; _i1856++) {
    const v_c = _a1855[_i1856];
    let _g1857 = 0;
    G1858: {
      const _a1859 = sp.adj4[v_c];
      for (let _i1860 = 0; _i1860 < _a1859.length; _i1860++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i1860]] || -1) === 1))) continue;
        _g1857++;
      }
    }
    if (!(((takes(sp, cl, v_c) - _g1857) === 2))) continue;
    const _h1867 = clueAt(cl.number, v_c);
    const _h1868 = (_h1867 !== -1);
    const _h1869 = _h1868;
    const _h1870 = !(_h1869);
    L1861: {
      const v_U = ways(b, sp, cl, v_c);
      const _h1862 = v_U.length;
      if (!((_h1862 === 3))) break L1861;
      const _a1863 = v_U;
      for (let _i1864 = 0; _i1864 < _a1863.length; _i1864++) {
        const v_k = _a1863[_i1864];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L1865: {
          const v_j = (v_I[1] ?? -1);
          let _c2513: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c2513) {
            let _c1880: boolean = (throughWhere(sp, v_i, (_te1866: number): boolean => {  return ((b.grid[_te1866] || -1) === 1); }).includes(v_j));
            if (!_c1880) {
              let _c1879: boolean = _h1870;
              if (_c1879) {
                let _q1871 = true;
                Q1872: {
                  const _a1873 = nearest(b, sp, cl, v_i);
                  for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
                    const v_p = _a1873[_i1874];
                    const _h1877 = clueAt(cl.number, v_p);
                    const _a1875 = nearest(b, sp, cl, v_j);
                    for (let _i1876 = 0; _i1876 < _a1875.length; _i1876++) {
                      const v_q = _a1875[_i1876];
                      const _h1878 = clueAt(cl.number, v_q);
                      if (!((Math.abs((_h1877 - _h1878)) === cl.step))) {
                        _q1871 = false;
                        break Q1872;
                      }
                    }
                  }
                }
                _c1879 = !(_q1871);
              }
              _c1880 = _c1879;
            }
            let _c2512: boolean = _c1880;
            if (!_c2512) {
              const _wc1881 = sp.edgeOf(v_c, v_i);
              const _wd1882 = 1;
              const _wc1883 = sp.edgeOf(v_c, v_j);
              const _wd1884 = 1;
              let _q1885 = false;
              Q1886: {
                const _a1888 = throughWhere(sp, v_c, (_te1887: number): boolean => {  return ((_te1887 === _wc1883 ? _wd1884 : (_te1887 === _wc1881 ? _wd1882 : (b.grid[_te1887] || -1))) === 1); });
                for (let _i1889 = 0; _i1889 < _a1888.length; _i1889++) {
                  const v_t = _a1888[_i1889];
                  let _c1910: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c1910) {
                    let _g1890 = 0;
                    G1891: {
                      const _a1892 = sp.adj4[v_t];
                      for (let _i1893 = 0; _i1893 < _a1892.length; _i1893++) {
                        const _t1894 = sp.adj4Edges[v_t][_i1893];
                        if (!(((_t1894 === _wc1883 ? _wd1884 : (_t1894 === _wc1881 ? _wd1882 : (b.grid[_t1894] || -1))) === 1))) continue;
                        _g1890++;
                      }
                    }
                    let _g1895 = 0;
                    G1896: {
                      const _a1897 = setOf(v_t);
                      for (let _i1898 = 0; _i1898 < _a1897.length; _i1898++) {
                        const v_k = _a1897[_i1898];
                        const _h1899 = clueAt(cl.number, v_k);
                        const _h1907 = (_h1899 + 1);
                        let _c1909: boolean = (_h1899 !== -1);
                        if (_c1909) {
                          let _c1908: boolean = (_h1900 || (_h1899 === 1));
                          if (!_c1908) {
                            let _g1901 = 0;
                            G1902: {
                              const _t1903 = (_h1899 + 1);
                              const _a1904 = cluesValued(cl.number, _t1903);
                              for (let _i1905 = 0; _i1905 < _a1904.length; _i1905++) {
                                const v_x = _a1904[_i1905];
                                const _h1906 = clueAt(cl.number, v_x);
                                if (!((_h1906 === _h1907))) continue;
                                _g1901++;
                              }
                            }
                            _c1908 = (_g1901 === 0);
                          }
                          _c1909 = _c1908;
                        }
                        if (!(_c1909)) continue;
                        _g1895++;
                      }
                    }
                    _c1910 = (_g1890 < (2 - _g1895));
                  }
                  if (!(_c1910)) continue;
                  let _g1911 = 0;
                  G1912: {
                    const _a1913 = sp.adj4[v_t];
                    for (let _i1914 = 0; _i1914 < _a1913.length; _i1914++) {
                      const _t1915 = sp.adj4Edges[v_t][_i1914];
                      if (!(((_t1915 === _wc1883 ? _wd1884 : (_t1915 === _wc1881 ? _wd1882 : (b.grid[_t1915] || -1))) === 1))) continue;
                      _g1911++;
                    }
                  }
                  let _g1916 = 0;
                  G1917: {
                    const _a1918 = setOf(v_t);
                    for (let _i1919 = 0; _i1919 < _a1918.length; _i1919++) {
                      const v_k = _a1918[_i1919];
                      const _h1920 = clueAt(cl.number, v_k);
                      const _h1927 = (_h1920 + 1);
                      let _c1929: boolean = (_h1920 !== -1);
                      if (_c1929) {
                        let _c1928: boolean = (_h1900 || (_h1920 === 1));
                        if (!_c1928) {
                          let _g1921 = 0;
                          G1922: {
                            const _t1923 = (_h1920 + 1);
                            const _a1924 = cluesValued(cl.number, _t1923);
                            for (let _i1925 = 0; _i1925 < _a1924.length; _i1925++) {
                              const v_x = _a1924[_i1925];
                              const _h1926 = clueAt(cl.number, v_x);
                              if (!((_h1926 === _h1927))) continue;
                              _g1921++;
                            }
                          }
                          _c1928 = (_g1921 === 0);
                        }
                        _c1929 = _c1928;
                      }
                      if (!(_c1929)) continue;
                      _g1916++;
                    }
                  }
                  let _c2210: boolean = (_g1911 < (2 - _g1916));
                  if (_c2210) {
                    let _q1930 = false;
                    Q1931: {
                      const _a1932 = sp.adj4[v_t];
                      for (let _i1933 = 0; _i1933 < _a1932.length; _i1933++) {
                        const v_y = _a1932[_i1933];
                        const _t1934 = sp.adj4Edges[v_t][_i1933];
                        let _c1954: boolean = !((_t1934 === _wc1883 ? true : (_t1934 === _wc1881 ? true : (b.grid[_t1934] !== 0))));
                        if (_c1954) {
                          let _g1935 = 0;
                          G1936: {
                            const _a1937 = sp.adj4[v_t];
                            for (let _i1938 = 0; _i1938 < _a1937.length; _i1938++) {
                              const _t1939 = sp.adj4Edges[v_t][_i1938];
                              if (!(((_t1939 === _wc1883 ? _wd1884 : (_t1939 === _wc1881 ? _wd1882 : (b.grid[_t1939] || -1))) === 1))) continue;
                              _g1935++;
                            }
                          }
                          let _g1940 = 0;
                          G1941: {
                            const _a1942 = setOf(v_t);
                            for (let _i1943 = 0; _i1943 < _a1942.length; _i1943++) {
                              const v_k = _a1942[_i1943];
                              const _h1944 = clueAt(cl.number, v_k);
                              const _h1951 = (_h1944 + 1);
                              let _c1953: boolean = (_h1944 !== -1);
                              if (_c1953) {
                                let _c1952: boolean = (_h1900 || (_h1944 === 1));
                                if (!_c1952) {
                                  let _g1945 = 0;
                                  G1946: {
                                    const _t1947 = (_h1944 + 1);
                                    const _a1948 = cluesValued(cl.number, _t1947);
                                    for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
                                      const v_x = _a1948[_i1949];
                                      const _h1950 = clueAt(cl.number, v_x);
                                      if (!((_h1950 === _h1951))) continue;
                                      _g1945++;
                                    }
                                  }
                                  _c1952 = (_g1945 === 0);
                                }
                                _c1953 = _c1952;
                              }
                              if (!(_c1953)) continue;
                              _g1940++;
                            }
                          }
                          _c1954 = (_g1935 < (2 - _g1940));
                        }
                        let _c1975: boolean = _c1954;
                        if (_c1975) {
                          let _g1955 = 0;
                          G1956: {
                            const _a1958 = sp.adj4[v_y];
                            for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                              const _t1960 = sp.adj4Edges[v_y][_i1959];
                              if (!(((_t1960 === _wc1883 ? _wd1884 : (_t1960 === _wc1881 ? _wd1882 : (b.grid[_t1960] || -1))) === 1))) continue;
                              _g1955++;
                            }
                          }
                          let _g1961 = 0;
                          G1962: {
                            const _a1963 = setOf(v_y);
                            for (let _i1964 = 0; _i1964 < _a1963.length; _i1964++) {
                              const v_k = _a1963[_i1964];
                              const _h1965 = clueAt(cl.number, v_k);
                              const _h1972 = (_h1965 + 1);
                              let _c1974: boolean = (_h1965 !== -1);
                              if (_c1974) {
                                let _c1973: boolean = (_h1900 || (_h1965 === 1));
                                if (!_c1973) {
                                  let _g1966 = 0;
                                  G1967: {
                                    const _t1968 = (_h1965 + 1);
                                    const _a1969 = cluesValued(cl.number, _t1968);
                                    for (let _i1970 = 0; _i1970 < _a1969.length; _i1970++) {
                                      const v_x = _a1969[_i1970];
                                      const _h1971 = clueAt(cl.number, v_x);
                                      if (!((_h1971 === _h1972))) continue;
                                      _g1966++;
                                    }
                                  }
                                  _c1973 = (_g1966 === 0);
                                }
                                _c1974 = _c1973;
                              }
                              if (!(_c1974)) continue;
                              _g1961++;
                            }
                          }
                          _c1975 = (_g1955 < (2 - _g1961));
                        }
                        let _c2058: boolean = _c1975;
                        if (_c2058) {
                          let _q1976 = true;
                          Q1977: {
                            _g1978.length = 0;
                            G1979: {
                              const _a1982 = setOf(v_t);
                              for (let _i1983 = 0; _i1983 < _a1982.length; _i1983++) {
                                const v_x = _a1982[_i1983];
                                const _h1984 = clueAt(cl.number, v_x);
                                if (!((_h1984 !== -1))) continue;
                                _g1978.push(v_x);
                              }
                            }
                            _g1985.length = 0;
                            G1986: {
                              const _a2005 = throughWhere(sp, v_t, (_te2000: number): boolean => { let _c2002: boolean = ((_te2000 === _wc1883 ? _wd1884 : (_te2000 === _wc1881 ? _wd1882 : (b.grid[_te2000] || -1))) === 1); if (_c2002) {   const _t2001 = sp.edgeEnds[2 * _te2000];   _c2002 = !((clueAt(cl.number, _t2001) !== -1)); } let _c2004: boolean = _c2002; if (_c2004) {   const _t2003 = sp.edgeEnds[2 * _te2000 + 1];   _c2004 = !((clueAt(cl.number, _t2003) !== -1)); } return _c2004; });
                              for (let _i2006 = 0; _i2006 < _a2005.length; _i2006++) {
                                const v_t_1999 = _a2005[_i2006];
                                const _h2009 = clueAt(cl.number, v_t_1999);
                                const _h2010 = (_h2009 !== -1);
                                const _h2011 = _h2010;
                                const _h2012 = !(_h2011);
                                const _a2007 = sp.adj4[v_t_1999];
                                for (let _i2008 = 0; _i2008 < _a2007.length; _i2008++) {
                                  const v_x = _a2007[_i2008];
                                  const _h2013 = clueAt(cl.number, v_x);
                                  let _c2015: boolean = (_h2012 && (_h2013 !== -1));
                                  if (_c2015) {
                                    const _t2014 = sp.adj4Edges[v_t_1999][_i2008];
                                    _c2015 = ((_t2014 === _wc1883 ? _wd1884 : (_t2014 === _wc1881 ? _wd1882 : (b.grid[_t2014] || -1))) === 1);
                                  }
                                  if (!(_c2015)) continue;
                                  if (!_g1985.includes(v_x)) _g1985.push(v_x);
                                }
                              }
                            }
                            const _a2016 = union(_g1978, _g1985);
                            for (let _i2017 = 0; _i2017 < _a2016.length; _i2017++) {
                              const v_p = _a2016[_i2017];
                              const _h2056 = clueAt(cl.number, v_p);
                              _g2018.length = 0;
                              G2019: {
                                const _a2022 = setOf(v_y);
                                for (let _i2023 = 0; _i2023 < _a2022.length; _i2023++) {
                                  const v_x = _a2022[_i2023];
                                  const _h2024 = clueAt(cl.number, v_x);
                                  if (!((_h2024 !== -1))) continue;
                                  _g2018.push(v_x);
                                }
                              }
                              _g2025.length = 0;
                              G2026: {
                                const _a2043 = throughWhere(sp, v_y, (_te2038: number): boolean => { let _c2040: boolean = ((_te2038 === _wc1883 ? _wd1884 : (_te2038 === _wc1881 ? _wd1882 : (b.grid[_te2038] || -1))) === 1); if (_c2040) {   const _t2039 = sp.edgeEnds[2 * _te2038];   _c2040 = !((clueAt(cl.number, _t2039) !== -1)); } let _c2042: boolean = _c2040; if (_c2042) {   const _t2041 = sp.edgeEnds[2 * _te2038 + 1];   _c2042 = !((clueAt(cl.number, _t2041) !== -1)); } return _c2042; });
                                for (let _i2044 = 0; _i2044 < _a2043.length; _i2044++) {
                                  const v_t = _a2043[_i2044];
                                  const _h2047 = clueAt(cl.number, v_t);
                                  const _h2048 = (_h2047 !== -1);
                                  const _h2049 = _h2048;
                                  const _h2050 = !(_h2049);
                                  const _a2045 = sp.adj4[v_t];
                                  for (let _i2046 = 0; _i2046 < _a2045.length; _i2046++) {
                                    const v_x = _a2045[_i2046];
                                    const _h2051 = clueAt(cl.number, v_x);
                                    let _c2053: boolean = (_h2050 && (_h2051 !== -1));
                                    if (_c2053) {
                                      const _t2052 = sp.adj4Edges[v_t][_i2046];
                                      _c2053 = ((_t2052 === _wc1883 ? _wd1884 : (_t2052 === _wc1881 ? _wd1882 : (b.grid[_t2052] || -1))) === 1);
                                    }
                                    if (!(_c2053)) continue;
                                    if (!_g2025.includes(v_x)) _g2025.push(v_x);
                                  }
                                }
                              }
                              const _a2054 = union(_g2018, _g2025);
                              for (let _i2055 = 0; _i2055 < _a2054.length; _i2055++) {
                                const v_q = _a2054[_i2055];
                                const _h2057 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h2056 - _h2057)) === cl.step))) {
                                  _q1976 = false;
                                  break Q1977;
                                }
                              }
                            }
                          }
                          _c2058 = _q1976;
                        }
                        if (!((_c2058 && (_h1900 || !(throughWhere(sp, v_t, (_te2059: number): boolean => {  return ((_te2059 === _wc1883 ? _wd1884 : (_te2059 === _wc1881 ? _wd1882 : (b.grid[_te2059] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g2060 = 0;
                        G2061: {
                          const _a2062 = sp.adj4[v_t];
                          for (let _i2063 = 0; _i2063 < _a2062.length; _i2063++) {
                            const _t2064 = sp.adj4Edges[v_t][_i2063];
                            if (!(((_t2064 === _wc1883 ? _wd1884 : (_t2064 === _wc1881 ? _wd1882 : (b.grid[_t2064] || -1))) === 1))) continue;
                            _g2060++;
                          }
                        }
                        let _g2065 = 0;
                        G2066: {
                          const _a2067 = setOf(v_t);
                          for (let _i2068 = 0; _i2068 < _a2067.length; _i2068++) {
                            const v_k = _a2067[_i2068];
                            const _h2069 = clueAt(cl.number, v_k);
                            const _h2076 = (_h2069 + 1);
                            let _c2078: boolean = (_h2069 !== -1);
                            if (_c2078) {
                              let _c2077: boolean = (_h1900 || (_h2069 === 1));
                              if (!_c2077) {
                                let _g2070 = 0;
                                G2071: {
                                  const _t2072 = (_h2069 + 1);
                                  const _a2073 = cluesValued(cl.number, _t2072);
                                  for (let _i2074 = 0; _i2074 < _a2073.length; _i2074++) {
                                    const v_x = _a2073[_i2074];
                                    const _h2075 = clueAt(cl.number, v_x);
                                    if (!((_h2075 === _h2076))) continue;
                                    _g2070++;
                                  }
                                }
                                _c2077 = (_g2070 === 0);
                              }
                              _c2078 = _c2077;
                            }
                            if (!(_c2078)) continue;
                            _g2065++;
                          }
                        }
                        let _c2209: boolean = ((_g2060 + 1) === (2 - _g2065));
                        if (!_c2209) {
                          let _q2079 = false;
                          Q2080: {
                            const _a2081 = sp.adj4[v_t];
                            const _n2082 = _i1933;
                            for (let _i2083 = 0; _i2083 < _n2082; _i2083++) {
                              const v_z = _a2081[_i2083];
                              const _t2084 = sp.adj4Edges[v_t][_i2083];
                              let _c2104: boolean = !((_t2084 === _wc1883 ? true : (_t2084 === _wc1881 ? true : (b.grid[_t2084] !== 0))));
                              if (_c2104) {
                                let _g2085 = 0;
                                G2086: {
                                  const _a2087 = sp.adj4[v_t];
                                  for (let _i2088 = 0; _i2088 < _a2087.length; _i2088++) {
                                    const _t2089 = sp.adj4Edges[v_t][_i2088];
                                    if (!(((_t2089 === _wc1883 ? _wd1884 : (_t2089 === _wc1881 ? _wd1882 : (b.grid[_t2089] || -1))) === 1))) continue;
                                    _g2085++;
                                  }
                                }
                                let _g2090 = 0;
                                G2091: {
                                  const _a2092 = setOf(v_t);
                                  for (let _i2093 = 0; _i2093 < _a2092.length; _i2093++) {
                                    const v_k = _a2092[_i2093];
                                    const _h2094 = clueAt(cl.number, v_k);
                                    const _h2101 = (_h2094 + 1);
                                    let _c2103: boolean = (_h2094 !== -1);
                                    if (_c2103) {
                                      let _c2102: boolean = (_h1900 || (_h2094 === 1));
                                      if (!_c2102) {
                                        let _g2095 = 0;
                                        G2096: {
                                          const _t2097 = (_h2094 + 1);
                                          const _a2098 = cluesValued(cl.number, _t2097);
                                          for (let _i2099 = 0; _i2099 < _a2098.length; _i2099++) {
                                            const v_x = _a2098[_i2099];
                                            const _h2100 = clueAt(cl.number, v_x);
                                            if (!((_h2100 === _h2101))) continue;
                                            _g2095++;
                                          }
                                        }
                                        _c2102 = (_g2095 === 0);
                                      }
                                      _c2103 = _c2102;
                                    }
                                    if (!(_c2103)) continue;
                                    _g2090++;
                                  }
                                }
                                _c2104 = (_g2085 < (2 - _g2090));
                              }
                              let _c2124: boolean = _c2104;
                              if (_c2124) {
                                let _g2105 = 0;
                                G2106: {
                                  const _a2107 = sp.adj4[v_z];
                                  for (let _i2108 = 0; _i2108 < _a2107.length; _i2108++) {
                                    const _t2109 = sp.adj4Edges[v_z][_i2108];
                                    if (!(((_t2109 === _wc1883 ? _wd1884 : (_t2109 === _wc1881 ? _wd1882 : (b.grid[_t2109] || -1))) === 1))) continue;
                                    _g2105++;
                                  }
                                }
                                let _g2110 = 0;
                                G2111: {
                                  const _a2112 = setOf(v_z);
                                  for (let _i2113 = 0; _i2113 < _a2112.length; _i2113++) {
                                    const v_k = _a2112[_i2113];
                                    const _h2114 = clueAt(cl.number, v_k);
                                    const _h2121 = (_h2114 + 1);
                                    let _c2123: boolean = (_h2114 !== -1);
                                    if (_c2123) {
                                      let _c2122: boolean = (_h1900 || (_h2114 === 1));
                                      if (!_c2122) {
                                        let _g2115 = 0;
                                        G2116: {
                                          const _t2117 = (_h2114 + 1);
                                          const _a2118 = cluesValued(cl.number, _t2117);
                                          for (let _i2119 = 0; _i2119 < _a2118.length; _i2119++) {
                                            const v_x = _a2118[_i2119];
                                            const _h2120 = clueAt(cl.number, v_x);
                                            if (!((_h2120 === _h2121))) continue;
                                            _g2115++;
                                          }
                                        }
                                        _c2122 = (_g2115 === 0);
                                      }
                                      _c2123 = _c2122;
                                    }
                                    if (!(_c2123)) continue;
                                    _g2110++;
                                  }
                                }
                                _c2124 = (_g2105 < (2 - _g2110));
                              }
                              let _c2207: boolean = _c2124;
                              if (_c2207) {
                                let _q2125 = true;
                                Q2126: {
                                  _g2127.length = 0;
                                  G2128: {
                                    const _a2131 = setOf(v_t);
                                    for (let _i2132 = 0; _i2132 < _a2131.length; _i2132++) {
                                      const v_x = _a2131[_i2132];
                                      const _h2133 = clueAt(cl.number, v_x);
                                      if (!((_h2133 !== -1))) continue;
                                      _g2127.push(v_x);
                                    }
                                  }
                                  _g2134.length = 0;
                                  G2135: {
                                    const _a2154 = throughWhere(sp, v_t, (_te2149: number): boolean => { let _c2151: boolean = ((_te2149 === _wc1883 ? _wd1884 : (_te2149 === _wc1881 ? _wd1882 : (b.grid[_te2149] || -1))) === 1); if (_c2151) {   const _t2150 = sp.edgeEnds[2 * _te2149];   _c2151 = !((clueAt(cl.number, _t2150) !== -1)); } let _c2153: boolean = _c2151; if (_c2153) {   const _t2152 = sp.edgeEnds[2 * _te2149 + 1];   _c2153 = !((clueAt(cl.number, _t2152) !== -1)); } return _c2153; });
                                    for (let _i2155 = 0; _i2155 < _a2154.length; _i2155++) {
                                      const v_t_2148 = _a2154[_i2155];
                                      const _h2158 = clueAt(cl.number, v_t_2148);
                                      const _h2159 = (_h2158 !== -1);
                                      const _h2160 = _h2159;
                                      const _h2161 = !(_h2160);
                                      const _a2156 = sp.adj4[v_t_2148];
                                      for (let _i2157 = 0; _i2157 < _a2156.length; _i2157++) {
                                        const v_x = _a2156[_i2157];
                                        const _h2162 = clueAt(cl.number, v_x);
                                        let _c2164: boolean = (_h2161 && (_h2162 !== -1));
                                        if (_c2164) {
                                          const _t2163 = sp.adj4Edges[v_t_2148][_i2157];
                                          _c2164 = ((_t2163 === _wc1883 ? _wd1884 : (_t2163 === _wc1881 ? _wd1882 : (b.grid[_t2163] || -1))) === 1);
                                        }
                                        if (!(_c2164)) continue;
                                        if (!_g2134.includes(v_x)) _g2134.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2165 = union(_g2127, _g2134);
                                  for (let _i2166 = 0; _i2166 < _a2165.length; _i2166++) {
                                    const v_p = _a2165[_i2166];
                                    const _h2205 = clueAt(cl.number, v_p);
                                    _g2167.length = 0;
                                    G2168: {
                                      const _a2171 = setOf(v_z);
                                      for (let _i2172 = 0; _i2172 < _a2171.length; _i2172++) {
                                        const v_x = _a2171[_i2172];
                                        const _h2173 = clueAt(cl.number, v_x);
                                        if (!((_h2173 !== -1))) continue;
                                        _g2167.push(v_x);
                                      }
                                    }
                                    _g2174.length = 0;
                                    G2175: {
                                      const _a2192 = throughWhere(sp, v_z, (_te2187: number): boolean => { let _c2189: boolean = ((_te2187 === _wc1883 ? _wd1884 : (_te2187 === _wc1881 ? _wd1882 : (b.grid[_te2187] || -1))) === 1); if (_c2189) {   const _t2188 = sp.edgeEnds[2 * _te2187];   _c2189 = !((clueAt(cl.number, _t2188) !== -1)); } let _c2191: boolean = _c2189; if (_c2191) {   const _t2190 = sp.edgeEnds[2 * _te2187 + 1];   _c2191 = !((clueAt(cl.number, _t2190) !== -1)); } return _c2191; });
                                      for (let _i2193 = 0; _i2193 < _a2192.length; _i2193++) {
                                        const v_t = _a2192[_i2193];
                                        const _h2196 = clueAt(cl.number, v_t);
                                        const _h2197 = (_h2196 !== -1);
                                        const _h2198 = _h2197;
                                        const _h2199 = !(_h2198);
                                        const _a2194 = sp.adj4[v_t];
                                        for (let _i2195 = 0; _i2195 < _a2194.length; _i2195++) {
                                          const v_x = _a2194[_i2195];
                                          const _h2200 = clueAt(cl.number, v_x);
                                          let _c2202: boolean = (_h2199 && (_h2200 !== -1));
                                          if (_c2202) {
                                            const _t2201 = sp.adj4Edges[v_t][_i2195];
                                            _c2202 = ((_t2201 === _wc1883 ? _wd1884 : (_t2201 === _wc1881 ? _wd1882 : (b.grid[_t2201] || -1))) === 1);
                                          }
                                          if (!(_c2202)) continue;
                                          if (!_g2174.includes(v_x)) _g2174.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2203 = union(_g2167, _g2174);
                                    for (let _i2204 = 0; _i2204 < _a2203.length; _i2204++) {
                                      const v_q = _a2203[_i2204];
                                      const _h2206 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2205 - _h2206)) === cl.step))) {
                                        _q2125 = false;
                                        break Q2126;
                                      }
                                    }
                                  }
                                }
                                _c2207 = _q2125;
                              }
                              if ((_c2207 && (_h1900 || !(throughWhere(sp, v_t, (_te2208: number): boolean => {  return ((_te2208 === _wc1883 ? _wd1884 : (_te2208 === _wc1881 ? _wd1882 : (b.grid[_te2208] || -1))) === 1); }).includes(v_z))))) {
                                _q2079 = true;
                                break Q2080;
                              }
                            }
                          }
                          _c2209 = _q2079;
                        }
                        if (_c2209) {
                          _q1930 = true;
                          break Q1931;
                        }
                      }
                    }
                    _c2210 = !(_q1930);
                  }
                  let _c2511: boolean = _c2210;
                  if (!_c2511) {
                    let _q2211 = false;
                    Q2212: {
                      const _a2213 = sp.adj4[v_t];
                      for (let _i2214 = 0; _i2214 < _a2213.length; _i2214++) {
                        const v_s = _a2213[_i2214];
                        let _g2215 = 0;
                        G2216: {
                          const _a2217 = sp.adj4[v_s];
                          for (let _i2218 = 0; _i2218 < _a2217.length; _i2218++) {
                            const _t2219 = sp.adj4Edges[v_s][_i2218];
                            if (!(((_t2219 === _wc1883 ? _wd1884 : (_t2219 === _wc1881 ? _wd1882 : (b.grid[_t2219] || -1))) === 1))) continue;
                            _g2215++;
                          }
                        }
                        let _g2220 = 0;
                        G2221: {
                          const _a2222 = setOf(v_s);
                          for (let _i2223 = 0; _i2223 < _a2222.length; _i2223++) {
                            const v_k = _a2222[_i2223];
                            const _h2224 = clueAt(cl.number, v_k);
                            const _h2231 = (_h2224 + 1);
                            let _c2233: boolean = (_h2224 !== -1);
                            if (_c2233) {
                              let _c2232: boolean = (_h1900 || (_h2224 === 1));
                              if (!_c2232) {
                                let _g2225 = 0;
                                G2226: {
                                  const _t2227 = (_h2224 + 1);
                                  const _a2228 = cluesValued(cl.number, _t2227);
                                  for (let _i2229 = 0; _i2229 < _a2228.length; _i2229++) {
                                    const v_x = _a2228[_i2229];
                                    const _h2230 = clueAt(cl.number, v_x);
                                    if (!((_h2230 === _h2231))) continue;
                                    _g2225++;
                                  }
                                }
                                _c2232 = (_g2225 === 0);
                              }
                              _c2233 = _c2232;
                            }
                            if (!(_c2233)) continue;
                            _g2220++;
                          }
                        }
                        let _c2510: boolean = (_g2215 < (2 - _g2220));
                        if (_c2510) {
                          let _q2234 = false;
                          Q2235: {
                            const _a2236 = sp.adj4[v_s];
                            for (let _i2237 = 0; _i2237 < _a2236.length; _i2237++) {
                              const v_y = _a2236[_i2237];
                              const _t2238 = sp.adj4Edges[v_s][_i2237];
                              let _c2258: boolean = !((_t2238 === _wc1883 ? true : (_t2238 === _wc1881 ? true : (b.grid[_t2238] !== 0))));
                              if (_c2258) {
                                let _g2239 = 0;
                                G2240: {
                                  const _a2241 = sp.adj4[v_s];
                                  for (let _i2242 = 0; _i2242 < _a2241.length; _i2242++) {
                                    const _t2243 = sp.adj4Edges[v_s][_i2242];
                                    if (!(((_t2243 === _wc1883 ? _wd1884 : (_t2243 === _wc1881 ? _wd1882 : (b.grid[_t2243] || -1))) === 1))) continue;
                                    _g2239++;
                                  }
                                }
                                let _g2244 = 0;
                                G2245: {
                                  const _a2246 = setOf(v_s);
                                  for (let _i2247 = 0; _i2247 < _a2246.length; _i2247++) {
                                    const v_k = _a2246[_i2247];
                                    const _h2248 = clueAt(cl.number, v_k);
                                    const _h2255 = (_h2248 + 1);
                                    let _c2257: boolean = (_h2248 !== -1);
                                    if (_c2257) {
                                      let _c2256: boolean = (_h1900 || (_h2248 === 1));
                                      if (!_c2256) {
                                        let _g2249 = 0;
                                        G2250: {
                                          const _t2251 = (_h2248 + 1);
                                          const _a2252 = cluesValued(cl.number, _t2251);
                                          for (let _i2253 = 0; _i2253 < _a2252.length; _i2253++) {
                                            const v_x = _a2252[_i2253];
                                            const _h2254 = clueAt(cl.number, v_x);
                                            if (!((_h2254 === _h2255))) continue;
                                            _g2249++;
                                          }
                                        }
                                        _c2256 = (_g2249 === 0);
                                      }
                                      _c2257 = _c2256;
                                    }
                                    if (!(_c2257)) continue;
                                    _g2244++;
                                  }
                                }
                                _c2258 = (_g2239 < (2 - _g2244));
                              }
                              let _c2279: boolean = _c2258;
                              if (_c2279) {
                                let _g2259 = 0;
                                G2260: {
                                  const _a2262 = sp.adj4[v_y];
                                  for (let _i2263 = 0; _i2263 < _a2262.length; _i2263++) {
                                    const _t2264 = sp.adj4Edges[v_y][_i2263];
                                    if (!(((_t2264 === _wc1883 ? _wd1884 : (_t2264 === _wc1881 ? _wd1882 : (b.grid[_t2264] || -1))) === 1))) continue;
                                    _g2259++;
                                  }
                                }
                                let _g2265 = 0;
                                G2266: {
                                  const _a2267 = setOf(v_y);
                                  for (let _i2268 = 0; _i2268 < _a2267.length; _i2268++) {
                                    const v_k = _a2267[_i2268];
                                    const _h2269 = clueAt(cl.number, v_k);
                                    const _h2276 = (_h2269 + 1);
                                    let _c2278: boolean = (_h2269 !== -1);
                                    if (_c2278) {
                                      let _c2277: boolean = (_h1900 || (_h2269 === 1));
                                      if (!_c2277) {
                                        let _g2270 = 0;
                                        G2271: {
                                          const _t2272 = (_h2269 + 1);
                                          const _a2273 = cluesValued(cl.number, _t2272);
                                          for (let _i2274 = 0; _i2274 < _a2273.length; _i2274++) {
                                            const v_x = _a2273[_i2274];
                                            const _h2275 = clueAt(cl.number, v_x);
                                            if (!((_h2275 === _h2276))) continue;
                                            _g2270++;
                                          }
                                        }
                                        _c2277 = (_g2270 === 0);
                                      }
                                      _c2278 = _c2277;
                                    }
                                    if (!(_c2278)) continue;
                                    _g2265++;
                                  }
                                }
                                _c2279 = (_g2259 < (2 - _g2265));
                              }
                              let _c2360: boolean = _c2279;
                              if (_c2360) {
                                let _q2280 = true;
                                Q2281: {
                                  _g2282.length = 0;
                                  G2283: {
                                    const _a2286 = setOf(v_s);
                                    for (let _i2287 = 0; _i2287 < _a2286.length; _i2287++) {
                                      const v_x = _a2286[_i2287];
                                      const _h2288 = clueAt(cl.number, v_x);
                                      if (!((_h2288 !== -1))) continue;
                                      _g2282.push(v_x);
                                    }
                                  }
                                  _g2289.length = 0;
                                  G2290: {
                                    const _a2307 = throughWhere(sp, v_s, (_te2302: number): boolean => { let _c2304: boolean = ((_te2302 === _wc1883 ? _wd1884 : (_te2302 === _wc1881 ? _wd1882 : (b.grid[_te2302] || -1))) === 1); if (_c2304) {   const _t2303 = sp.edgeEnds[2 * _te2302];   _c2304 = !((clueAt(cl.number, _t2303) !== -1)); } let _c2306: boolean = _c2304; if (_c2306) {   const _t2305 = sp.edgeEnds[2 * _te2302 + 1];   _c2306 = !((clueAt(cl.number, _t2305) !== -1)); } return _c2306; });
                                    for (let _i2308 = 0; _i2308 < _a2307.length; _i2308++) {
                                      const v_t = _a2307[_i2308];
                                      const _h2311 = clueAt(cl.number, v_t);
                                      const _h2312 = (_h2311 !== -1);
                                      const _h2313 = _h2312;
                                      const _h2314 = !(_h2313);
                                      const _a2309 = sp.adj4[v_t];
                                      for (let _i2310 = 0; _i2310 < _a2309.length; _i2310++) {
                                        const v_x = _a2309[_i2310];
                                        const _h2315 = clueAt(cl.number, v_x);
                                        let _c2317: boolean = (_h2314 && (_h2315 !== -1));
                                        if (_c2317) {
                                          const _t2316 = sp.adj4Edges[v_t][_i2310];
                                          _c2317 = ((_t2316 === _wc1883 ? _wd1884 : (_t2316 === _wc1881 ? _wd1882 : (b.grid[_t2316] || -1))) === 1);
                                        }
                                        if (!(_c2317)) continue;
                                        if (!_g2289.includes(v_x)) _g2289.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2318 = union(_g2282, _g2289);
                                  for (let _i2319 = 0; _i2319 < _a2318.length; _i2319++) {
                                    const v_p = _a2318[_i2319];
                                    const _h2358 = clueAt(cl.number, v_p);
                                    _g2320.length = 0;
                                    G2321: {
                                      const _a2324 = setOf(v_y);
                                      for (let _i2325 = 0; _i2325 < _a2324.length; _i2325++) {
                                        const v_x = _a2324[_i2325];
                                        const _h2326 = clueAt(cl.number, v_x);
                                        if (!((_h2326 !== -1))) continue;
                                        _g2320.push(v_x);
                                      }
                                    }
                                    _g2327.length = 0;
                                    G2328: {
                                      const _a2345 = throughWhere(sp, v_y, (_te2340: number): boolean => { let _c2342: boolean = ((_te2340 === _wc1883 ? _wd1884 : (_te2340 === _wc1881 ? _wd1882 : (b.grid[_te2340] || -1))) === 1); if (_c2342) {   const _t2341 = sp.edgeEnds[2 * _te2340];   _c2342 = !((clueAt(cl.number, _t2341) !== -1)); } let _c2344: boolean = _c2342; if (_c2344) {   const _t2343 = sp.edgeEnds[2 * _te2340 + 1];   _c2344 = !((clueAt(cl.number, _t2343) !== -1)); } return _c2344; });
                                      for (let _i2346 = 0; _i2346 < _a2345.length; _i2346++) {
                                        const v_t = _a2345[_i2346];
                                        const _h2349 = clueAt(cl.number, v_t);
                                        const _h2350 = (_h2349 !== -1);
                                        const _h2351 = _h2350;
                                        const _h2352 = !(_h2351);
                                        const _a2347 = sp.adj4[v_t];
                                        for (let _i2348 = 0; _i2348 < _a2347.length; _i2348++) {
                                          const v_x = _a2347[_i2348];
                                          const _h2353 = clueAt(cl.number, v_x);
                                          let _c2355: boolean = (_h2352 && (_h2353 !== -1));
                                          if (_c2355) {
                                            const _t2354 = sp.adj4Edges[v_t][_i2348];
                                            _c2355 = ((_t2354 === _wc1883 ? _wd1884 : (_t2354 === _wc1881 ? _wd1882 : (b.grid[_t2354] || -1))) === 1);
                                          }
                                          if (!(_c2355)) continue;
                                          if (!_g2327.includes(v_x)) _g2327.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2356 = union(_g2320, _g2327);
                                    for (let _i2357 = 0; _i2357 < _a2356.length; _i2357++) {
                                      const v_q = _a2356[_i2357];
                                      const _h2359 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2358 - _h2359)) === cl.step))) {
                                        _q2280 = false;
                                        break Q2281;
                                      }
                                    }
                                  }
                                }
                                _c2360 = _q2280;
                              }
                              if (!((_c2360 && (_h1900 || !(throughWhere(sp, v_s, (_te2361: number): boolean => {  return ((_te2361 === _wc1883 ? _wd1884 : (_te2361 === _wc1881 ? _wd1882 : (b.grid[_te2361] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g2362 = 0;
                              G2363: {
                                const _a2364 = sp.adj4[v_s];
                                for (let _i2365 = 0; _i2365 < _a2364.length; _i2365++) {
                                  const _t2366 = sp.adj4Edges[v_s][_i2365];
                                  if (!(((_t2366 === _wc1883 ? _wd1884 : (_t2366 === _wc1881 ? _wd1882 : (b.grid[_t2366] || -1))) === 1))) continue;
                                  _g2362++;
                                }
                              }
                              let _g2367 = 0;
                              G2368: {
                                const _a2369 = setOf(v_s);
                                for (let _i2370 = 0; _i2370 < _a2369.length; _i2370++) {
                                  const v_k = _a2369[_i2370];
                                  const _h2371 = clueAt(cl.number, v_k);
                                  const _h2378 = (_h2371 + 1);
                                  let _c2380: boolean = (_h2371 !== -1);
                                  if (_c2380) {
                                    let _c2379: boolean = (_h1900 || (_h2371 === 1));
                                    if (!_c2379) {
                                      let _g2372 = 0;
                                      G2373: {
                                        const _t2374 = (_h2371 + 1);
                                        const _a2375 = cluesValued(cl.number, _t2374);
                                        for (let _i2376 = 0; _i2376 < _a2375.length; _i2376++) {
                                          const v_x = _a2375[_i2376];
                                          const _h2377 = clueAt(cl.number, v_x);
                                          if (!((_h2377 === _h2378))) continue;
                                          _g2372++;
                                        }
                                      }
                                      _c2379 = (_g2372 === 0);
                                    }
                                    _c2380 = _c2379;
                                  }
                                  if (!(_c2380)) continue;
                                  _g2367++;
                                }
                              }
                              let _c2509: boolean = ((_g2362 + 1) === (2 - _g2367));
                              if (!_c2509) {
                                let _q2381 = false;
                                Q2382: {
                                  const _a2383 = sp.adj4[v_s];
                                  const _n2384 = _i2237;
                                  for (let _i2385 = 0; _i2385 < _n2384; _i2385++) {
                                    const v_z = _a2383[_i2385];
                                    const _t2386 = sp.adj4Edges[v_s][_i2385];
                                    let _c2406: boolean = !((_t2386 === _wc1883 ? true : (_t2386 === _wc1881 ? true : (b.grid[_t2386] !== 0))));
                                    if (_c2406) {
                                      let _g2387 = 0;
                                      G2388: {
                                        const _a2389 = sp.adj4[v_s];
                                        for (let _i2390 = 0; _i2390 < _a2389.length; _i2390++) {
                                          const _t2391 = sp.adj4Edges[v_s][_i2390];
                                          if (!(((_t2391 === _wc1883 ? _wd1884 : (_t2391 === _wc1881 ? _wd1882 : (b.grid[_t2391] || -1))) === 1))) continue;
                                          _g2387++;
                                        }
                                      }
                                      let _g2392 = 0;
                                      G2393: {
                                        const _a2394 = setOf(v_s);
                                        for (let _i2395 = 0; _i2395 < _a2394.length; _i2395++) {
                                          const v_k = _a2394[_i2395];
                                          const _h2396 = clueAt(cl.number, v_k);
                                          const _h2403 = (_h2396 + 1);
                                          let _c2405: boolean = (_h2396 !== -1);
                                          if (_c2405) {
                                            let _c2404: boolean = (_h1900 || (_h2396 === 1));
                                            if (!_c2404) {
                                              let _g2397 = 0;
                                              G2398: {
                                                const _t2399 = (_h2396 + 1);
                                                const _a2400 = cluesValued(cl.number, _t2399);
                                                for (let _i2401 = 0; _i2401 < _a2400.length; _i2401++) {
                                                  const v_x = _a2400[_i2401];
                                                  const _h2402 = clueAt(cl.number, v_x);
                                                  if (!((_h2402 === _h2403))) continue;
                                                  _g2397++;
                                                }
                                              }
                                              _c2404 = (_g2397 === 0);
                                            }
                                            _c2405 = _c2404;
                                          }
                                          if (!(_c2405)) continue;
                                          _g2392++;
                                        }
                                      }
                                      _c2406 = (_g2387 < (2 - _g2392));
                                    }
                                    let _c2426: boolean = _c2406;
                                    if (_c2426) {
                                      let _g2407 = 0;
                                      G2408: {
                                        const _a2409 = sp.adj4[v_z];
                                        for (let _i2410 = 0; _i2410 < _a2409.length; _i2410++) {
                                          const _t2411 = sp.adj4Edges[v_z][_i2410];
                                          if (!(((_t2411 === _wc1883 ? _wd1884 : (_t2411 === _wc1881 ? _wd1882 : (b.grid[_t2411] || -1))) === 1))) continue;
                                          _g2407++;
                                        }
                                      }
                                      let _g2412 = 0;
                                      G2413: {
                                        const _a2414 = setOf(v_z);
                                        for (let _i2415 = 0; _i2415 < _a2414.length; _i2415++) {
                                          const v_k = _a2414[_i2415];
                                          const _h2416 = clueAt(cl.number, v_k);
                                          const _h2423 = (_h2416 + 1);
                                          let _c2425: boolean = (_h2416 !== -1);
                                          if (_c2425) {
                                            let _c2424: boolean = (_h1900 || (_h2416 === 1));
                                            if (!_c2424) {
                                              let _g2417 = 0;
                                              G2418: {
                                                const _t2419 = (_h2416 + 1);
                                                const _a2420 = cluesValued(cl.number, _t2419);
                                                for (let _i2421 = 0; _i2421 < _a2420.length; _i2421++) {
                                                  const v_x = _a2420[_i2421];
                                                  const _h2422 = clueAt(cl.number, v_x);
                                                  if (!((_h2422 === _h2423))) continue;
                                                  _g2417++;
                                                }
                                              }
                                              _c2424 = (_g2417 === 0);
                                            }
                                            _c2425 = _c2424;
                                          }
                                          if (!(_c2425)) continue;
                                          _g2412++;
                                        }
                                      }
                                      _c2426 = (_g2407 < (2 - _g2412));
                                    }
                                    let _c2507: boolean = _c2426;
                                    if (_c2507) {
                                      let _q2427 = true;
                                      Q2428: {
                                        _g2429.length = 0;
                                        G2430: {
                                          const _a2433 = setOf(v_s);
                                          for (let _i2434 = 0; _i2434 < _a2433.length; _i2434++) {
                                            const v_x = _a2433[_i2434];
                                            const _h2435 = clueAt(cl.number, v_x);
                                            if (!((_h2435 !== -1))) continue;
                                            _g2429.push(v_x);
                                          }
                                        }
                                        _g2436.length = 0;
                                        G2437: {
                                          const _a2454 = throughWhere(sp, v_s, (_te2449: number): boolean => { let _c2451: boolean = ((_te2449 === _wc1883 ? _wd1884 : (_te2449 === _wc1881 ? _wd1882 : (b.grid[_te2449] || -1))) === 1); if (_c2451) {   const _t2450 = sp.edgeEnds[2 * _te2449];   _c2451 = !((clueAt(cl.number, _t2450) !== -1)); } let _c2453: boolean = _c2451; if (_c2453) {   const _t2452 = sp.edgeEnds[2 * _te2449 + 1];   _c2453 = !((clueAt(cl.number, _t2452) !== -1)); } return _c2453; });
                                          for (let _i2455 = 0; _i2455 < _a2454.length; _i2455++) {
                                            const v_t = _a2454[_i2455];
                                            const _h2458 = clueAt(cl.number, v_t);
                                            const _h2459 = (_h2458 !== -1);
                                            const _h2460 = _h2459;
                                            const _h2461 = !(_h2460);
                                            const _a2456 = sp.adj4[v_t];
                                            for (let _i2457 = 0; _i2457 < _a2456.length; _i2457++) {
                                              const v_x = _a2456[_i2457];
                                              const _h2462 = clueAt(cl.number, v_x);
                                              let _c2464: boolean = (_h2461 && (_h2462 !== -1));
                                              if (_c2464) {
                                                const _t2463 = sp.adj4Edges[v_t][_i2457];
                                                _c2464 = ((_t2463 === _wc1883 ? _wd1884 : (_t2463 === _wc1881 ? _wd1882 : (b.grid[_t2463] || -1))) === 1);
                                              }
                                              if (!(_c2464)) continue;
                                              if (!_g2436.includes(v_x)) _g2436.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2465 = union(_g2429, _g2436);
                                        for (let _i2466 = 0; _i2466 < _a2465.length; _i2466++) {
                                          const v_p = _a2465[_i2466];
                                          const _h2505 = clueAt(cl.number, v_p);
                                          _g2467.length = 0;
                                          G2468: {
                                            const _a2471 = setOf(v_z);
                                            for (let _i2472 = 0; _i2472 < _a2471.length; _i2472++) {
                                              const v_x = _a2471[_i2472];
                                              const _h2473 = clueAt(cl.number, v_x);
                                              if (!((_h2473 !== -1))) continue;
                                              _g2467.push(v_x);
                                            }
                                          }
                                          _g2474.length = 0;
                                          G2475: {
                                            const _a2492 = throughWhere(sp, v_z, (_te2487: number): boolean => { let _c2489: boolean = ((_te2487 === _wc1883 ? _wd1884 : (_te2487 === _wc1881 ? _wd1882 : (b.grid[_te2487] || -1))) === 1); if (_c2489) {   const _t2488 = sp.edgeEnds[2 * _te2487];   _c2489 = !((clueAt(cl.number, _t2488) !== -1)); } let _c2491: boolean = _c2489; if (_c2491) {   const _t2490 = sp.edgeEnds[2 * _te2487 + 1];   _c2491 = !((clueAt(cl.number, _t2490) !== -1)); } return _c2491; });
                                            for (let _i2493 = 0; _i2493 < _a2492.length; _i2493++) {
                                              const v_t = _a2492[_i2493];
                                              const _h2496 = clueAt(cl.number, v_t);
                                              const _h2497 = (_h2496 !== -1);
                                              const _h2498 = _h2497;
                                              const _h2499 = !(_h2498);
                                              const _a2494 = sp.adj4[v_t];
                                              for (let _i2495 = 0; _i2495 < _a2494.length; _i2495++) {
                                                const v_x = _a2494[_i2495];
                                                const _h2500 = clueAt(cl.number, v_x);
                                                let _c2502: boolean = (_h2499 && (_h2500 !== -1));
                                                if (_c2502) {
                                                  const _t2501 = sp.adj4Edges[v_t][_i2495];
                                                  _c2502 = ((_t2501 === _wc1883 ? _wd1884 : (_t2501 === _wc1881 ? _wd1882 : (b.grid[_t2501] || -1))) === 1);
                                                }
                                                if (!(_c2502)) continue;
                                                if (!_g2474.includes(v_x)) _g2474.push(v_x);
                                              }
                                            }
                                          }
                                          const _a2503 = union(_g2467, _g2474);
                                          for (let _i2504 = 0; _i2504 < _a2503.length; _i2504++) {
                                            const v_q = _a2503[_i2504];
                                            const _h2506 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h2505 - _h2506)) === cl.step))) {
                                              _q2427 = false;
                                              break Q2428;
                                            }
                                          }
                                        }
                                      }
                                      _c2507 = _q2427;
                                    }
                                    if ((_c2507 && (_h1900 || !(throughWhere(sp, v_s, (_te2508: number): boolean => {  return ((_te2508 === _wc1883 ? _wd1884 : (_te2508 === _wc1881 ? _wd1882 : (b.grid[_te2508] || -1))) === 1); }).includes(v_z))))) {
                                      _q2381 = true;
                                      break Q2382;
                                    }
                                  }
                                }
                                _c2509 = _q2381;
                              }
                              if (_c2509) {
                                _q2234 = true;
                                break Q2235;
                              }
                            }
                          }
                          _c2510 = !(_q2234);
                        }
                        if (_c2510) {
                          _q2211 = true;
                          break Q2212;
                        }
                      }
                    }
                    _c2511 = _q2211;
                  }
                  if (_c2511) {
                    _q1885 = true;
                    break Q1886;
                  }
                }
              }
              _c2512 = _q1885;
            }
            _c2513 = _c2512;
          }
          if (!(_c2513)) break L1865;
          facts.length = 0;
          changed = false;
          const _t2514 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t2514] !== 0)) { if (fire === null) { b.placeAt(_t2514, 1); changed = true; } else facts.push(PLACE, _t2514, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U, k: v_k, I: v_I, i: v_i, j: v_j }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface WeighedBinding {
  c: number;
  U: readonly number[];
  A: readonly number[];
  B: readonly number[];
  N: readonly number[];
  P: readonly number[];
  X: readonly number[];
}

const weighedFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g4776: number[] = [];
  const _g5446: number[] = [];
  const _g5453: number[] = [];
  const _g5486: number[] = [];
  const _g5493: number[] = [];
  const _g5595: number[] = [];
  const _g5602: number[] = [];
  const _g5635: number[] = [];
  const _g5642: number[] = [];
  const _g5750: number[] = [];
  const _g5757: number[] = [];
  const _g5788: number[] = [];
  const _g5795: number[] = [];
  const _g5897: number[] = [];
  const _g5904: number[] = [];
  const _g5935: number[] = [];
  const _g5942: number[] = [];
  const _g5982: number[] = [];
  const _g6648: number[] = [];
  const _g6655: number[] = [];
  const _g6688: number[] = [];
  const _g6695: number[] = [];
  const _g6797: number[] = [];
  const _g6804: number[] = [];
  const _g6837: number[] = [];
  const _g6844: number[] = [];
  const _g6952: number[] = [];
  const _g6959: number[] = [];
  const _g6990: number[] = [];
  const _g6997: number[] = [];
  const _g7099: number[] = [];
  const _g7106: number[] = [];
  const _g7137: number[] = [];
  const _g7144: number[] = [];
  const _g7187: number[] = [];
  const _g7209: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _h5368 = (cl.step === 0);
  const _a4768 = sp.cells;
  for (let _i4769 = 0; _i4769 < _a4768.length; _i4769++) {
    const v_c = _a4768[_i4769];
    let _g4770 = 0;
    G4771: {
      const _a4772 = sp.adj4[v_c];
      for (let _i4773 = 0; _i4773 < _a4772.length; _i4773++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i4773]] || -1) === 1))) continue;
        _g4770++;
      }
    }
    if (!(((takes(sp, cl, v_c) - _g4770) === 2))) continue;
    const _h5334 = clueAt(cl.number, v_c);
    const _h5335 = (_h5334 !== -1);
    const _h5336 = _h5335;
    const _h5337 = !(_h5336);
    L4774: {
      const v_U = ways(b, sp, cl, v_c);
      const _h4775 = v_U.length;
      if (!((_h4775 === 4))) break L4774;
      const _h7184 = (v_U[0] ?? -1);
      _g4776.length = 0;
      G4777: {
        const _a5328 = v_U;
        for (let _i5329 = 0; _i5329 < _a5328.length; _i5329++) {
          const v_i = _a5328[_i5329];
          const _h5332 = _i5329;
          const _h5333 = (_h5332 === 0);
          const _h5348 = sp.edgeOf(v_c, v_i);
          const _a5330 = v_U;
          for (let _i5331 = 0; _i5331 < _a5330.length; _i5331++) {
            const v_j = _a5330[_i5331];
            let _c5981: boolean = (_h5333 && (_i5331 > 0));
            if (_c5981) {
              let _c5347: boolean = (piece(b, sp, v_i).includes(v_j));
              if (!_c5347) {
                let _c5346: boolean = _h5337;
                if (_c5346) {
                  let _q5338 = true;
                  Q5339: {
                    const _a5340 = nearest(b, sp, cl, v_i);
                    for (let _i5341 = 0; _i5341 < _a5340.length; _i5341++) {
                      const v_p = _a5340[_i5341];
                      const _h5344 = clueAt(cl.number, v_p);
                      const _a5342 = nearest(b, sp, cl, v_j);
                      for (let _i5343 = 0; _i5343 < _a5342.length; _i5343++) {
                        const v_q = _a5342[_i5343];
                        const _h5345 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h5344 - _h5345)) === cl.step))) {
                          _q5338 = false;
                          break Q5339;
                        }
                      }
                    }
                  }
                  _c5346 = !(_q5338);
                }
                _c5347 = _c5346;
              }
              let _c5980: boolean = _c5347;
              if (!_c5980) {
                const _wc5349 = _h5348;
                const _wd5350 = 1;
                const _wc5351 = sp.edgeOf(v_c, v_j);
                const _wd5352 = 1;
                let _q5353 = false;
                Q5354: {
                  const _a5356 = throughWhere(sp, v_c, (_te5355: number): boolean => {  return ((_te5355 === _wc5351 ? _wd5352 : (_te5355 === _wc5349 ? _wd5350 : (b.grid[_te5355] || -1))) === 1); });
                  for (let _i5357 = 0; _i5357 < _a5356.length; _i5357++) {
                    const v_t = _a5356[_i5357];
                    let _c5378: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5378) {
                      let _g5358 = 0;
                      G5359: {
                        const _a5360 = sp.adj4[v_t];
                        for (let _i5361 = 0; _i5361 < _a5360.length; _i5361++) {
                          const _t5362 = sp.adj4Edges[v_t][_i5361];
                          if (!(((_t5362 === _wc5351 ? _wd5352 : (_t5362 === _wc5349 ? _wd5350 : (b.grid[_t5362] || -1))) === 1))) continue;
                          _g5358++;
                        }
                      }
                      let _g5363 = 0;
                      G5364: {
                        const _a5365 = setOf(v_t);
                        for (let _i5366 = 0; _i5366 < _a5365.length; _i5366++) {
                          const v_k = _a5365[_i5366];
                          const _h5367 = clueAt(cl.number, v_k);
                          const _h5375 = (_h5367 + 1);
                          let _c5377: boolean = (_h5367 !== -1);
                          if (_c5377) {
                            let _c5376: boolean = (_h5368 || (_h5367 === 1));
                            if (!_c5376) {
                              let _g5369 = 0;
                              G5370: {
                                const _t5371 = (_h5367 + 1);
                                const _a5372 = cluesValued(cl.number, _t5371);
                                for (let _i5373 = 0; _i5373 < _a5372.length; _i5373++) {
                                  const v_x = _a5372[_i5373];
                                  const _h5374 = clueAt(cl.number, v_x);
                                  if (!((_h5374 === _h5375))) continue;
                                  _g5369++;
                                }
                              }
                              _c5376 = (_g5369 === 0);
                            }
                            _c5377 = _c5376;
                          }
                          if (!(_c5377)) continue;
                          _g5363++;
                        }
                      }
                      _c5378 = (_g5358 < (2 - _g5363));
                    }
                    if (!(_c5378)) continue;
                    let _g5379 = 0;
                    G5380: {
                      const _a5381 = sp.adj4[v_t];
                      for (let _i5382 = 0; _i5382 < _a5381.length; _i5382++) {
                        const _t5383 = sp.adj4Edges[v_t][_i5382];
                        if (!(((_t5383 === _wc5351 ? _wd5352 : (_t5383 === _wc5349 ? _wd5350 : (b.grid[_t5383] || -1))) === 1))) continue;
                        _g5379++;
                      }
                    }
                    let _g5384 = 0;
                    G5385: {
                      const _a5386 = setOf(v_t);
                      for (let _i5387 = 0; _i5387 < _a5386.length; _i5387++) {
                        const v_k = _a5386[_i5387];
                        const _h5388 = clueAt(cl.number, v_k);
                        const _h5395 = (_h5388 + 1);
                        let _c5397: boolean = (_h5388 !== -1);
                        if (_c5397) {
                          let _c5396: boolean = (_h5368 || (_h5388 === 1));
                          if (!_c5396) {
                            let _g5389 = 0;
                            G5390: {
                              const _t5391 = (_h5388 + 1);
                              const _a5392 = cluesValued(cl.number, _t5391);
                              for (let _i5393 = 0; _i5393 < _a5392.length; _i5393++) {
                                const v_x = _a5392[_i5393];
                                const _h5394 = clueAt(cl.number, v_x);
                                if (!((_h5394 === _h5395))) continue;
                                _g5389++;
                              }
                            }
                            _c5396 = (_g5389 === 0);
                          }
                          _c5397 = _c5396;
                        }
                        if (!(_c5397)) continue;
                        _g5384++;
                      }
                    }
                    let _c5678: boolean = (_g5379 < (2 - _g5384));
                    if (_c5678) {
                      let _q5398 = false;
                      Q5399: {
                        const _a5400 = sp.adj4[v_t];
                        for (let _i5401 = 0; _i5401 < _a5400.length; _i5401++) {
                          const v_y = _a5400[_i5401];
                          const _t5402 = sp.adj4Edges[v_t][_i5401];
                          let _c5422: boolean = !((_t5402 === _wc5351 ? true : (_t5402 === _wc5349 ? true : (b.grid[_t5402] !== 0))));
                          if (_c5422) {
                            let _g5403 = 0;
                            G5404: {
                              const _a5405 = sp.adj4[v_t];
                              for (let _i5406 = 0; _i5406 < _a5405.length; _i5406++) {
                                const _t5407 = sp.adj4Edges[v_t][_i5406];
                                if (!(((_t5407 === _wc5351 ? _wd5352 : (_t5407 === _wc5349 ? _wd5350 : (b.grid[_t5407] || -1))) === 1))) continue;
                                _g5403++;
                              }
                            }
                            let _g5408 = 0;
                            G5409: {
                              const _a5410 = setOf(v_t);
                              for (let _i5411 = 0; _i5411 < _a5410.length; _i5411++) {
                                const v_k = _a5410[_i5411];
                                const _h5412 = clueAt(cl.number, v_k);
                                const _h5419 = (_h5412 + 1);
                                let _c5421: boolean = (_h5412 !== -1);
                                if (_c5421) {
                                  let _c5420: boolean = (_h5368 || (_h5412 === 1));
                                  if (!_c5420) {
                                    let _g5413 = 0;
                                    G5414: {
                                      const _t5415 = (_h5412 + 1);
                                      const _a5416 = cluesValued(cl.number, _t5415);
                                      for (let _i5417 = 0; _i5417 < _a5416.length; _i5417++) {
                                        const v_x = _a5416[_i5417];
                                        const _h5418 = clueAt(cl.number, v_x);
                                        if (!((_h5418 === _h5419))) continue;
                                        _g5413++;
                                      }
                                    }
                                    _c5420 = (_g5413 === 0);
                                  }
                                  _c5421 = _c5420;
                                }
                                if (!(_c5421)) continue;
                                _g5408++;
                              }
                            }
                            _c5422 = (_g5403 < (2 - _g5408));
                          }
                          let _c5443: boolean = _c5422;
                          if (_c5443) {
                            let _g5423 = 0;
                            G5424: {
                              const _a5426 = sp.adj4[v_y];
                              for (let _i5427 = 0; _i5427 < _a5426.length; _i5427++) {
                                const _t5428 = sp.adj4Edges[v_y][_i5427];
                                if (!(((_t5428 === _wc5351 ? _wd5352 : (_t5428 === _wc5349 ? _wd5350 : (b.grid[_t5428] || -1))) === 1))) continue;
                                _g5423++;
                              }
                            }
                            let _g5429 = 0;
                            G5430: {
                              const _a5431 = setOf(v_y);
                              for (let _i5432 = 0; _i5432 < _a5431.length; _i5432++) {
                                const v_k = _a5431[_i5432];
                                const _h5433 = clueAt(cl.number, v_k);
                                const _h5440 = (_h5433 + 1);
                                let _c5442: boolean = (_h5433 !== -1);
                                if (_c5442) {
                                  let _c5441: boolean = (_h5368 || (_h5433 === 1));
                                  if (!_c5441) {
                                    let _g5434 = 0;
                                    G5435: {
                                      const _t5436 = (_h5433 + 1);
                                      const _a5437 = cluesValued(cl.number, _t5436);
                                      for (let _i5438 = 0; _i5438 < _a5437.length; _i5438++) {
                                        const v_x = _a5437[_i5438];
                                        const _h5439 = clueAt(cl.number, v_x);
                                        if (!((_h5439 === _h5440))) continue;
                                        _g5434++;
                                      }
                                    }
                                    _c5441 = (_g5434 === 0);
                                  }
                                  _c5442 = _c5441;
                                }
                                if (!(_c5442)) continue;
                                _g5429++;
                              }
                            }
                            _c5443 = (_g5423 < (2 - _g5429));
                          }
                          let _c5526: boolean = _c5443;
                          if (_c5526) {
                            let _q5444 = true;
                            Q5445: {
                              _g5446.length = 0;
                              G5447: {
                                const _a5450 = setOf(v_t);
                                for (let _i5451 = 0; _i5451 < _a5450.length; _i5451++) {
                                  const v_x = _a5450[_i5451];
                                  const _h5452 = clueAt(cl.number, v_x);
                                  if (!((_h5452 !== -1))) continue;
                                  _g5446.push(v_x);
                                }
                              }
                              _g5453.length = 0;
                              G5454: {
                                const _a5473 = throughWhere(sp, v_t, (_te5468: number): boolean => { let _c5470: boolean = ((_te5468 === _wc5351 ? _wd5352 : (_te5468 === _wc5349 ? _wd5350 : (b.grid[_te5468] || -1))) === 1); if (_c5470) {   const _t5469 = sp.edgeEnds[2 * _te5468];   _c5470 = !((clueAt(cl.number, _t5469) !== -1)); } let _c5472: boolean = _c5470; if (_c5472) {   const _t5471 = sp.edgeEnds[2 * _te5468 + 1];   _c5472 = !((clueAt(cl.number, _t5471) !== -1)); } return _c5472; });
                                for (let _i5474 = 0; _i5474 < _a5473.length; _i5474++) {
                                  const v_t_5467 = _a5473[_i5474];
                                  const _h5477 = clueAt(cl.number, v_t_5467);
                                  const _h5478 = (_h5477 !== -1);
                                  const _h5479 = _h5478;
                                  const _h5480 = !(_h5479);
                                  const _a5475 = sp.adj4[v_t_5467];
                                  for (let _i5476 = 0; _i5476 < _a5475.length; _i5476++) {
                                    const v_x = _a5475[_i5476];
                                    const _h5481 = clueAt(cl.number, v_x);
                                    let _c5483: boolean = (_h5480 && (_h5481 !== -1));
                                    if (_c5483) {
                                      const _t5482 = sp.adj4Edges[v_t_5467][_i5476];
                                      _c5483 = ((_t5482 === _wc5351 ? _wd5352 : (_t5482 === _wc5349 ? _wd5350 : (b.grid[_t5482] || -1))) === 1);
                                    }
                                    if (!(_c5483)) continue;
                                    if (!_g5453.includes(v_x)) _g5453.push(v_x);
                                  }
                                }
                              }
                              const _a5484 = union(_g5446, _g5453);
                              for (let _i5485 = 0; _i5485 < _a5484.length; _i5485++) {
                                const v_p = _a5484[_i5485];
                                const _h5524 = clueAt(cl.number, v_p);
                                _g5486.length = 0;
                                G5487: {
                                  const _a5490 = setOf(v_y);
                                  for (let _i5491 = 0; _i5491 < _a5490.length; _i5491++) {
                                    const v_x = _a5490[_i5491];
                                    const _h5492 = clueAt(cl.number, v_x);
                                    if (!((_h5492 !== -1))) continue;
                                    _g5486.push(v_x);
                                  }
                                }
                                _g5493.length = 0;
                                G5494: {
                                  const _a5511 = throughWhere(sp, v_y, (_te5506: number): boolean => { let _c5508: boolean = ((_te5506 === _wc5351 ? _wd5352 : (_te5506 === _wc5349 ? _wd5350 : (b.grid[_te5506] || -1))) === 1); if (_c5508) {   const _t5507 = sp.edgeEnds[2 * _te5506];   _c5508 = !((clueAt(cl.number, _t5507) !== -1)); } let _c5510: boolean = _c5508; if (_c5510) {   const _t5509 = sp.edgeEnds[2 * _te5506 + 1];   _c5510 = !((clueAt(cl.number, _t5509) !== -1)); } return _c5510; });
                                  for (let _i5512 = 0; _i5512 < _a5511.length; _i5512++) {
                                    const v_t = _a5511[_i5512];
                                    const _h5515 = clueAt(cl.number, v_t);
                                    const _h5516 = (_h5515 !== -1);
                                    const _h5517 = _h5516;
                                    const _h5518 = !(_h5517);
                                    const _a5513 = sp.adj4[v_t];
                                    for (let _i5514 = 0; _i5514 < _a5513.length; _i5514++) {
                                      const v_x = _a5513[_i5514];
                                      const _h5519 = clueAt(cl.number, v_x);
                                      let _c5521: boolean = (_h5518 && (_h5519 !== -1));
                                      if (_c5521) {
                                        const _t5520 = sp.adj4Edges[v_t][_i5514];
                                        _c5521 = ((_t5520 === _wc5351 ? _wd5352 : (_t5520 === _wc5349 ? _wd5350 : (b.grid[_t5520] || -1))) === 1);
                                      }
                                      if (!(_c5521)) continue;
                                      if (!_g5493.includes(v_x)) _g5493.push(v_x);
                                    }
                                  }
                                }
                                const _a5522 = union(_g5486, _g5493);
                                for (let _i5523 = 0; _i5523 < _a5522.length; _i5523++) {
                                  const v_q = _a5522[_i5523];
                                  const _h5525 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h5524 - _h5525)) === cl.step))) {
                                    _q5444 = false;
                                    break Q5445;
                                  }
                                }
                              }
                            }
                            _c5526 = _q5444;
                          }
                          if (!((_c5526 && (_h5368 || !(throughWhere(sp, v_t, (_te5527: number): boolean => {  return ((_te5527 === _wc5351 ? _wd5352 : (_te5527 === _wc5349 ? _wd5350 : (b.grid[_te5527] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g5528 = 0;
                          G5529: {
                            const _a5530 = sp.adj4[v_t];
                            for (let _i5531 = 0; _i5531 < _a5530.length; _i5531++) {
                              const _t5532 = sp.adj4Edges[v_t][_i5531];
                              if (!(((_t5532 === _wc5351 ? _wd5352 : (_t5532 === _wc5349 ? _wd5350 : (b.grid[_t5532] || -1))) === 1))) continue;
                              _g5528++;
                            }
                          }
                          let _g5533 = 0;
                          G5534: {
                            const _a5535 = setOf(v_t);
                            for (let _i5536 = 0; _i5536 < _a5535.length; _i5536++) {
                              const v_k = _a5535[_i5536];
                              const _h5537 = clueAt(cl.number, v_k);
                              const _h5544 = (_h5537 + 1);
                              let _c5546: boolean = (_h5537 !== -1);
                              if (_c5546) {
                                let _c5545: boolean = (_h5368 || (_h5537 === 1));
                                if (!_c5545) {
                                  let _g5538 = 0;
                                  G5539: {
                                    const _t5540 = (_h5537 + 1);
                                    const _a5541 = cluesValued(cl.number, _t5540);
                                    for (let _i5542 = 0; _i5542 < _a5541.length; _i5542++) {
                                      const v_x = _a5541[_i5542];
                                      const _h5543 = clueAt(cl.number, v_x);
                                      if (!((_h5543 === _h5544))) continue;
                                      _g5538++;
                                    }
                                  }
                                  _c5545 = (_g5538 === 0);
                                }
                                _c5546 = _c5545;
                              }
                              if (!(_c5546)) continue;
                              _g5533++;
                            }
                          }
                          let _c5677: boolean = ((_g5528 + 1) === (2 - _g5533));
                          if (!_c5677) {
                            let _q5547 = false;
                            Q5548: {
                              const _a5549 = sp.adj4[v_t];
                              const _n5550 = _i5401;
                              for (let _i5551 = 0; _i5551 < _n5550; _i5551++) {
                                const v_z = _a5549[_i5551];
                                const _t5552 = sp.adj4Edges[v_t][_i5551];
                                let _c5572: boolean = !((_t5552 === _wc5351 ? true : (_t5552 === _wc5349 ? true : (b.grid[_t5552] !== 0))));
                                if (_c5572) {
                                  let _g5553 = 0;
                                  G5554: {
                                    const _a5555 = sp.adj4[v_t];
                                    for (let _i5556 = 0; _i5556 < _a5555.length; _i5556++) {
                                      const _t5557 = sp.adj4Edges[v_t][_i5556];
                                      if (!(((_t5557 === _wc5351 ? _wd5352 : (_t5557 === _wc5349 ? _wd5350 : (b.grid[_t5557] || -1))) === 1))) continue;
                                      _g5553++;
                                    }
                                  }
                                  let _g5558 = 0;
                                  G5559: {
                                    const _a5560 = setOf(v_t);
                                    for (let _i5561 = 0; _i5561 < _a5560.length; _i5561++) {
                                      const v_k = _a5560[_i5561];
                                      const _h5562 = clueAt(cl.number, v_k);
                                      const _h5569 = (_h5562 + 1);
                                      let _c5571: boolean = (_h5562 !== -1);
                                      if (_c5571) {
                                        let _c5570: boolean = (_h5368 || (_h5562 === 1));
                                        if (!_c5570) {
                                          let _g5563 = 0;
                                          G5564: {
                                            const _t5565 = (_h5562 + 1);
                                            const _a5566 = cluesValued(cl.number, _t5565);
                                            for (let _i5567 = 0; _i5567 < _a5566.length; _i5567++) {
                                              const v_x = _a5566[_i5567];
                                              const _h5568 = clueAt(cl.number, v_x);
                                              if (!((_h5568 === _h5569))) continue;
                                              _g5563++;
                                            }
                                          }
                                          _c5570 = (_g5563 === 0);
                                        }
                                        _c5571 = _c5570;
                                      }
                                      if (!(_c5571)) continue;
                                      _g5558++;
                                    }
                                  }
                                  _c5572 = (_g5553 < (2 - _g5558));
                                }
                                let _c5592: boolean = _c5572;
                                if (_c5592) {
                                  let _g5573 = 0;
                                  G5574: {
                                    const _a5575 = sp.adj4[v_z];
                                    for (let _i5576 = 0; _i5576 < _a5575.length; _i5576++) {
                                      const _t5577 = sp.adj4Edges[v_z][_i5576];
                                      if (!(((_t5577 === _wc5351 ? _wd5352 : (_t5577 === _wc5349 ? _wd5350 : (b.grid[_t5577] || -1))) === 1))) continue;
                                      _g5573++;
                                    }
                                  }
                                  let _g5578 = 0;
                                  G5579: {
                                    const _a5580 = setOf(v_z);
                                    for (let _i5581 = 0; _i5581 < _a5580.length; _i5581++) {
                                      const v_k = _a5580[_i5581];
                                      const _h5582 = clueAt(cl.number, v_k);
                                      const _h5589 = (_h5582 + 1);
                                      let _c5591: boolean = (_h5582 !== -1);
                                      if (_c5591) {
                                        let _c5590: boolean = (_h5368 || (_h5582 === 1));
                                        if (!_c5590) {
                                          let _g5583 = 0;
                                          G5584: {
                                            const _t5585 = (_h5582 + 1);
                                            const _a5586 = cluesValued(cl.number, _t5585);
                                            for (let _i5587 = 0; _i5587 < _a5586.length; _i5587++) {
                                              const v_x = _a5586[_i5587];
                                              const _h5588 = clueAt(cl.number, v_x);
                                              if (!((_h5588 === _h5589))) continue;
                                              _g5583++;
                                            }
                                          }
                                          _c5590 = (_g5583 === 0);
                                        }
                                        _c5591 = _c5590;
                                      }
                                      if (!(_c5591)) continue;
                                      _g5578++;
                                    }
                                  }
                                  _c5592 = (_g5573 < (2 - _g5578));
                                }
                                let _c5675: boolean = _c5592;
                                if (_c5675) {
                                  let _q5593 = true;
                                  Q5594: {
                                    _g5595.length = 0;
                                    G5596: {
                                      const _a5599 = setOf(v_t);
                                      for (let _i5600 = 0; _i5600 < _a5599.length; _i5600++) {
                                        const v_x = _a5599[_i5600];
                                        const _h5601 = clueAt(cl.number, v_x);
                                        if (!((_h5601 !== -1))) continue;
                                        _g5595.push(v_x);
                                      }
                                    }
                                    _g5602.length = 0;
                                    G5603: {
                                      const _a5622 = throughWhere(sp, v_t, (_te5617: number): boolean => { let _c5619: boolean = ((_te5617 === _wc5351 ? _wd5352 : (_te5617 === _wc5349 ? _wd5350 : (b.grid[_te5617] || -1))) === 1); if (_c5619) {   const _t5618 = sp.edgeEnds[2 * _te5617];   _c5619 = !((clueAt(cl.number, _t5618) !== -1)); } let _c5621: boolean = _c5619; if (_c5621) {   const _t5620 = sp.edgeEnds[2 * _te5617 + 1];   _c5621 = !((clueAt(cl.number, _t5620) !== -1)); } return _c5621; });
                                      for (let _i5623 = 0; _i5623 < _a5622.length; _i5623++) {
                                        const v_t_5616 = _a5622[_i5623];
                                        const _h5626 = clueAt(cl.number, v_t_5616);
                                        const _h5627 = (_h5626 !== -1);
                                        const _h5628 = _h5627;
                                        const _h5629 = !(_h5628);
                                        const _a5624 = sp.adj4[v_t_5616];
                                        for (let _i5625 = 0; _i5625 < _a5624.length; _i5625++) {
                                          const v_x = _a5624[_i5625];
                                          const _h5630 = clueAt(cl.number, v_x);
                                          let _c5632: boolean = (_h5629 && (_h5630 !== -1));
                                          if (_c5632) {
                                            const _t5631 = sp.adj4Edges[v_t_5616][_i5625];
                                            _c5632 = ((_t5631 === _wc5351 ? _wd5352 : (_t5631 === _wc5349 ? _wd5350 : (b.grid[_t5631] || -1))) === 1);
                                          }
                                          if (!(_c5632)) continue;
                                          if (!_g5602.includes(v_x)) _g5602.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5633 = union(_g5595, _g5602);
                                    for (let _i5634 = 0; _i5634 < _a5633.length; _i5634++) {
                                      const v_p = _a5633[_i5634];
                                      const _h5673 = clueAt(cl.number, v_p);
                                      _g5635.length = 0;
                                      G5636: {
                                        const _a5639 = setOf(v_z);
                                        for (let _i5640 = 0; _i5640 < _a5639.length; _i5640++) {
                                          const v_x = _a5639[_i5640];
                                          const _h5641 = clueAt(cl.number, v_x);
                                          if (!((_h5641 !== -1))) continue;
                                          _g5635.push(v_x);
                                        }
                                      }
                                      _g5642.length = 0;
                                      G5643: {
                                        const _a5660 = throughWhere(sp, v_z, (_te5655: number): boolean => { let _c5657: boolean = ((_te5655 === _wc5351 ? _wd5352 : (_te5655 === _wc5349 ? _wd5350 : (b.grid[_te5655] || -1))) === 1); if (_c5657) {   const _t5656 = sp.edgeEnds[2 * _te5655];   _c5657 = !((clueAt(cl.number, _t5656) !== -1)); } let _c5659: boolean = _c5657; if (_c5659) {   const _t5658 = sp.edgeEnds[2 * _te5655 + 1];   _c5659 = !((clueAt(cl.number, _t5658) !== -1)); } return _c5659; });
                                        for (let _i5661 = 0; _i5661 < _a5660.length; _i5661++) {
                                          const v_t = _a5660[_i5661];
                                          const _h5664 = clueAt(cl.number, v_t);
                                          const _h5665 = (_h5664 !== -1);
                                          const _h5666 = _h5665;
                                          const _h5667 = !(_h5666);
                                          const _a5662 = sp.adj4[v_t];
                                          for (let _i5663 = 0; _i5663 < _a5662.length; _i5663++) {
                                            const v_x = _a5662[_i5663];
                                            const _h5668 = clueAt(cl.number, v_x);
                                            let _c5670: boolean = (_h5667 && (_h5668 !== -1));
                                            if (_c5670) {
                                              const _t5669 = sp.adj4Edges[v_t][_i5663];
                                              _c5670 = ((_t5669 === _wc5351 ? _wd5352 : (_t5669 === _wc5349 ? _wd5350 : (b.grid[_t5669] || -1))) === 1);
                                            }
                                            if (!(_c5670)) continue;
                                            if (!_g5642.includes(v_x)) _g5642.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5671 = union(_g5635, _g5642);
                                      for (let _i5672 = 0; _i5672 < _a5671.length; _i5672++) {
                                        const v_q = _a5671[_i5672];
                                        const _h5674 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5673 - _h5674)) === cl.step))) {
                                          _q5593 = false;
                                          break Q5594;
                                        }
                                      }
                                    }
                                  }
                                  _c5675 = _q5593;
                                }
                                if ((_c5675 && (_h5368 || !(throughWhere(sp, v_t, (_te5676: number): boolean => {  return ((_te5676 === _wc5351 ? _wd5352 : (_te5676 === _wc5349 ? _wd5350 : (b.grid[_te5676] || -1))) === 1); }).includes(v_z))))) {
                                  _q5547 = true;
                                  break Q5548;
                                }
                              }
                            }
                            _c5677 = _q5547;
                          }
                          if (_c5677) {
                            _q5398 = true;
                            break Q5399;
                          }
                        }
                      }
                      _c5678 = !(_q5398);
                    }
                    let _c5979: boolean = _c5678;
                    if (!_c5979) {
                      let _q5679 = false;
                      Q5680: {
                        const _a5681 = sp.adj4[v_t];
                        for (let _i5682 = 0; _i5682 < _a5681.length; _i5682++) {
                          const v_s = _a5681[_i5682];
                          let _g5683 = 0;
                          G5684: {
                            const _a5685 = sp.adj4[v_s];
                            for (let _i5686 = 0; _i5686 < _a5685.length; _i5686++) {
                              const _t5687 = sp.adj4Edges[v_s][_i5686];
                              if (!(((_t5687 === _wc5351 ? _wd5352 : (_t5687 === _wc5349 ? _wd5350 : (b.grid[_t5687] || -1))) === 1))) continue;
                              _g5683++;
                            }
                          }
                          let _g5688 = 0;
                          G5689: {
                            const _a5690 = setOf(v_s);
                            for (let _i5691 = 0; _i5691 < _a5690.length; _i5691++) {
                              const v_k = _a5690[_i5691];
                              const _h5692 = clueAt(cl.number, v_k);
                              const _h5699 = (_h5692 + 1);
                              let _c5701: boolean = (_h5692 !== -1);
                              if (_c5701) {
                                let _c5700: boolean = (_h5368 || (_h5692 === 1));
                                if (!_c5700) {
                                  let _g5693 = 0;
                                  G5694: {
                                    const _t5695 = (_h5692 + 1);
                                    const _a5696 = cluesValued(cl.number, _t5695);
                                    for (let _i5697 = 0; _i5697 < _a5696.length; _i5697++) {
                                      const v_x = _a5696[_i5697];
                                      const _h5698 = clueAt(cl.number, v_x);
                                      if (!((_h5698 === _h5699))) continue;
                                      _g5693++;
                                    }
                                  }
                                  _c5700 = (_g5693 === 0);
                                }
                                _c5701 = _c5700;
                              }
                              if (!(_c5701)) continue;
                              _g5688++;
                            }
                          }
                          let _c5978: boolean = (_g5683 < (2 - _g5688));
                          if (_c5978) {
                            let _q5702 = false;
                            Q5703: {
                              const _a5704 = sp.adj4[v_s];
                              for (let _i5705 = 0; _i5705 < _a5704.length; _i5705++) {
                                const v_y = _a5704[_i5705];
                                const _t5706 = sp.adj4Edges[v_s][_i5705];
                                let _c5726: boolean = !((_t5706 === _wc5351 ? true : (_t5706 === _wc5349 ? true : (b.grid[_t5706] !== 0))));
                                if (_c5726) {
                                  let _g5707 = 0;
                                  G5708: {
                                    const _a5709 = sp.adj4[v_s];
                                    for (let _i5710 = 0; _i5710 < _a5709.length; _i5710++) {
                                      const _t5711 = sp.adj4Edges[v_s][_i5710];
                                      if (!(((_t5711 === _wc5351 ? _wd5352 : (_t5711 === _wc5349 ? _wd5350 : (b.grid[_t5711] || -1))) === 1))) continue;
                                      _g5707++;
                                    }
                                  }
                                  let _g5712 = 0;
                                  G5713: {
                                    const _a5714 = setOf(v_s);
                                    for (let _i5715 = 0; _i5715 < _a5714.length; _i5715++) {
                                      const v_k = _a5714[_i5715];
                                      const _h5716 = clueAt(cl.number, v_k);
                                      const _h5723 = (_h5716 + 1);
                                      let _c5725: boolean = (_h5716 !== -1);
                                      if (_c5725) {
                                        let _c5724: boolean = (_h5368 || (_h5716 === 1));
                                        if (!_c5724) {
                                          let _g5717 = 0;
                                          G5718: {
                                            const _t5719 = (_h5716 + 1);
                                            const _a5720 = cluesValued(cl.number, _t5719);
                                            for (let _i5721 = 0; _i5721 < _a5720.length; _i5721++) {
                                              const v_x = _a5720[_i5721];
                                              const _h5722 = clueAt(cl.number, v_x);
                                              if (!((_h5722 === _h5723))) continue;
                                              _g5717++;
                                            }
                                          }
                                          _c5724 = (_g5717 === 0);
                                        }
                                        _c5725 = _c5724;
                                      }
                                      if (!(_c5725)) continue;
                                      _g5712++;
                                    }
                                  }
                                  _c5726 = (_g5707 < (2 - _g5712));
                                }
                                let _c5747: boolean = _c5726;
                                if (_c5747) {
                                  let _g5727 = 0;
                                  G5728: {
                                    const _a5730 = sp.adj4[v_y];
                                    for (let _i5731 = 0; _i5731 < _a5730.length; _i5731++) {
                                      const _t5732 = sp.adj4Edges[v_y][_i5731];
                                      if (!(((_t5732 === _wc5351 ? _wd5352 : (_t5732 === _wc5349 ? _wd5350 : (b.grid[_t5732] || -1))) === 1))) continue;
                                      _g5727++;
                                    }
                                  }
                                  let _g5733 = 0;
                                  G5734: {
                                    const _a5735 = setOf(v_y);
                                    for (let _i5736 = 0; _i5736 < _a5735.length; _i5736++) {
                                      const v_k = _a5735[_i5736];
                                      const _h5737 = clueAt(cl.number, v_k);
                                      const _h5744 = (_h5737 + 1);
                                      let _c5746: boolean = (_h5737 !== -1);
                                      if (_c5746) {
                                        let _c5745: boolean = (_h5368 || (_h5737 === 1));
                                        if (!_c5745) {
                                          let _g5738 = 0;
                                          G5739: {
                                            const _t5740 = (_h5737 + 1);
                                            const _a5741 = cluesValued(cl.number, _t5740);
                                            for (let _i5742 = 0; _i5742 < _a5741.length; _i5742++) {
                                              const v_x = _a5741[_i5742];
                                              const _h5743 = clueAt(cl.number, v_x);
                                              if (!((_h5743 === _h5744))) continue;
                                              _g5738++;
                                            }
                                          }
                                          _c5745 = (_g5738 === 0);
                                        }
                                        _c5746 = _c5745;
                                      }
                                      if (!(_c5746)) continue;
                                      _g5733++;
                                    }
                                  }
                                  _c5747 = (_g5727 < (2 - _g5733));
                                }
                                let _c5828: boolean = _c5747;
                                if (_c5828) {
                                  let _q5748 = true;
                                  Q5749: {
                                    _g5750.length = 0;
                                    G5751: {
                                      const _a5754 = setOf(v_s);
                                      for (let _i5755 = 0; _i5755 < _a5754.length; _i5755++) {
                                        const v_x = _a5754[_i5755];
                                        const _h5756 = clueAt(cl.number, v_x);
                                        if (!((_h5756 !== -1))) continue;
                                        _g5750.push(v_x);
                                      }
                                    }
                                    _g5757.length = 0;
                                    G5758: {
                                      const _a5775 = throughWhere(sp, v_s, (_te5770: number): boolean => { let _c5772: boolean = ((_te5770 === _wc5351 ? _wd5352 : (_te5770 === _wc5349 ? _wd5350 : (b.grid[_te5770] || -1))) === 1); if (_c5772) {   const _t5771 = sp.edgeEnds[2 * _te5770];   _c5772 = !((clueAt(cl.number, _t5771) !== -1)); } let _c5774: boolean = _c5772; if (_c5774) {   const _t5773 = sp.edgeEnds[2 * _te5770 + 1];   _c5774 = !((clueAt(cl.number, _t5773) !== -1)); } return _c5774; });
                                      for (let _i5776 = 0; _i5776 < _a5775.length; _i5776++) {
                                        const v_t = _a5775[_i5776];
                                        const _h5779 = clueAt(cl.number, v_t);
                                        const _h5780 = (_h5779 !== -1);
                                        const _h5781 = _h5780;
                                        const _h5782 = !(_h5781);
                                        const _a5777 = sp.adj4[v_t];
                                        for (let _i5778 = 0; _i5778 < _a5777.length; _i5778++) {
                                          const v_x = _a5777[_i5778];
                                          const _h5783 = clueAt(cl.number, v_x);
                                          let _c5785: boolean = (_h5782 && (_h5783 !== -1));
                                          if (_c5785) {
                                            const _t5784 = sp.adj4Edges[v_t][_i5778];
                                            _c5785 = ((_t5784 === _wc5351 ? _wd5352 : (_t5784 === _wc5349 ? _wd5350 : (b.grid[_t5784] || -1))) === 1);
                                          }
                                          if (!(_c5785)) continue;
                                          if (!_g5757.includes(v_x)) _g5757.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5786 = union(_g5750, _g5757);
                                    for (let _i5787 = 0; _i5787 < _a5786.length; _i5787++) {
                                      const v_p = _a5786[_i5787];
                                      const _h5826 = clueAt(cl.number, v_p);
                                      _g5788.length = 0;
                                      G5789: {
                                        const _a5792 = setOf(v_y);
                                        for (let _i5793 = 0; _i5793 < _a5792.length; _i5793++) {
                                          const v_x = _a5792[_i5793];
                                          const _h5794 = clueAt(cl.number, v_x);
                                          if (!((_h5794 !== -1))) continue;
                                          _g5788.push(v_x);
                                        }
                                      }
                                      _g5795.length = 0;
                                      G5796: {
                                        const _a5813 = throughWhere(sp, v_y, (_te5808: number): boolean => { let _c5810: boolean = ((_te5808 === _wc5351 ? _wd5352 : (_te5808 === _wc5349 ? _wd5350 : (b.grid[_te5808] || -1))) === 1); if (_c5810) {   const _t5809 = sp.edgeEnds[2 * _te5808];   _c5810 = !((clueAt(cl.number, _t5809) !== -1)); } let _c5812: boolean = _c5810; if (_c5812) {   const _t5811 = sp.edgeEnds[2 * _te5808 + 1];   _c5812 = !((clueAt(cl.number, _t5811) !== -1)); } return _c5812; });
                                        for (let _i5814 = 0; _i5814 < _a5813.length; _i5814++) {
                                          const v_t = _a5813[_i5814];
                                          const _h5817 = clueAt(cl.number, v_t);
                                          const _h5818 = (_h5817 !== -1);
                                          const _h5819 = _h5818;
                                          const _h5820 = !(_h5819);
                                          const _a5815 = sp.adj4[v_t];
                                          for (let _i5816 = 0; _i5816 < _a5815.length; _i5816++) {
                                            const v_x = _a5815[_i5816];
                                            const _h5821 = clueAt(cl.number, v_x);
                                            let _c5823: boolean = (_h5820 && (_h5821 !== -1));
                                            if (_c5823) {
                                              const _t5822 = sp.adj4Edges[v_t][_i5816];
                                              _c5823 = ((_t5822 === _wc5351 ? _wd5352 : (_t5822 === _wc5349 ? _wd5350 : (b.grid[_t5822] || -1))) === 1);
                                            }
                                            if (!(_c5823)) continue;
                                            if (!_g5795.includes(v_x)) _g5795.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5824 = union(_g5788, _g5795);
                                      for (let _i5825 = 0; _i5825 < _a5824.length; _i5825++) {
                                        const v_q = _a5824[_i5825];
                                        const _h5827 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5826 - _h5827)) === cl.step))) {
                                          _q5748 = false;
                                          break Q5749;
                                        }
                                      }
                                    }
                                  }
                                  _c5828 = _q5748;
                                }
                                if (!((_c5828 && (_h5368 || !(throughWhere(sp, v_s, (_te5829: number): boolean => {  return ((_te5829 === _wc5351 ? _wd5352 : (_te5829 === _wc5349 ? _wd5350 : (b.grid[_te5829] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g5830 = 0;
                                G5831: {
                                  const _a5832 = sp.adj4[v_s];
                                  for (let _i5833 = 0; _i5833 < _a5832.length; _i5833++) {
                                    const _t5834 = sp.adj4Edges[v_s][_i5833];
                                    if (!(((_t5834 === _wc5351 ? _wd5352 : (_t5834 === _wc5349 ? _wd5350 : (b.grid[_t5834] || -1))) === 1))) continue;
                                    _g5830++;
                                  }
                                }
                                let _g5835 = 0;
                                G5836: {
                                  const _a5837 = setOf(v_s);
                                  for (let _i5838 = 0; _i5838 < _a5837.length; _i5838++) {
                                    const v_k = _a5837[_i5838];
                                    const _h5839 = clueAt(cl.number, v_k);
                                    const _h5846 = (_h5839 + 1);
                                    let _c5848: boolean = (_h5839 !== -1);
                                    if (_c5848) {
                                      let _c5847: boolean = (_h5368 || (_h5839 === 1));
                                      if (!_c5847) {
                                        let _g5840 = 0;
                                        G5841: {
                                          const _t5842 = (_h5839 + 1);
                                          const _a5843 = cluesValued(cl.number, _t5842);
                                          for (let _i5844 = 0; _i5844 < _a5843.length; _i5844++) {
                                            const v_x = _a5843[_i5844];
                                            const _h5845 = clueAt(cl.number, v_x);
                                            if (!((_h5845 === _h5846))) continue;
                                            _g5840++;
                                          }
                                        }
                                        _c5847 = (_g5840 === 0);
                                      }
                                      _c5848 = _c5847;
                                    }
                                    if (!(_c5848)) continue;
                                    _g5835++;
                                  }
                                }
                                let _c5977: boolean = ((_g5830 + 1) === (2 - _g5835));
                                if (!_c5977) {
                                  let _q5849 = false;
                                  Q5850: {
                                    const _a5851 = sp.adj4[v_s];
                                    const _n5852 = _i5705;
                                    for (let _i5853 = 0; _i5853 < _n5852; _i5853++) {
                                      const v_z = _a5851[_i5853];
                                      const _t5854 = sp.adj4Edges[v_s][_i5853];
                                      let _c5874: boolean = !((_t5854 === _wc5351 ? true : (_t5854 === _wc5349 ? true : (b.grid[_t5854] !== 0))));
                                      if (_c5874) {
                                        let _g5855 = 0;
                                        G5856: {
                                          const _a5857 = sp.adj4[v_s];
                                          for (let _i5858 = 0; _i5858 < _a5857.length; _i5858++) {
                                            const _t5859 = sp.adj4Edges[v_s][_i5858];
                                            if (!(((_t5859 === _wc5351 ? _wd5352 : (_t5859 === _wc5349 ? _wd5350 : (b.grid[_t5859] || -1))) === 1))) continue;
                                            _g5855++;
                                          }
                                        }
                                        let _g5860 = 0;
                                        G5861: {
                                          const _a5862 = setOf(v_s);
                                          for (let _i5863 = 0; _i5863 < _a5862.length; _i5863++) {
                                            const v_k = _a5862[_i5863];
                                            const _h5864 = clueAt(cl.number, v_k);
                                            const _h5871 = (_h5864 + 1);
                                            let _c5873: boolean = (_h5864 !== -1);
                                            if (_c5873) {
                                              let _c5872: boolean = (_h5368 || (_h5864 === 1));
                                              if (!_c5872) {
                                                let _g5865 = 0;
                                                G5866: {
                                                  const _t5867 = (_h5864 + 1);
                                                  const _a5868 = cluesValued(cl.number, _t5867);
                                                  for (let _i5869 = 0; _i5869 < _a5868.length; _i5869++) {
                                                    const v_x = _a5868[_i5869];
                                                    const _h5870 = clueAt(cl.number, v_x);
                                                    if (!((_h5870 === _h5871))) continue;
                                                    _g5865++;
                                                  }
                                                }
                                                _c5872 = (_g5865 === 0);
                                              }
                                              _c5873 = _c5872;
                                            }
                                            if (!(_c5873)) continue;
                                            _g5860++;
                                          }
                                        }
                                        _c5874 = (_g5855 < (2 - _g5860));
                                      }
                                      let _c5894: boolean = _c5874;
                                      if (_c5894) {
                                        let _g5875 = 0;
                                        G5876: {
                                          const _a5877 = sp.adj4[v_z];
                                          for (let _i5878 = 0; _i5878 < _a5877.length; _i5878++) {
                                            const _t5879 = sp.adj4Edges[v_z][_i5878];
                                            if (!(((_t5879 === _wc5351 ? _wd5352 : (_t5879 === _wc5349 ? _wd5350 : (b.grid[_t5879] || -1))) === 1))) continue;
                                            _g5875++;
                                          }
                                        }
                                        let _g5880 = 0;
                                        G5881: {
                                          const _a5882 = setOf(v_z);
                                          for (let _i5883 = 0; _i5883 < _a5882.length; _i5883++) {
                                            const v_k = _a5882[_i5883];
                                            const _h5884 = clueAt(cl.number, v_k);
                                            const _h5891 = (_h5884 + 1);
                                            let _c5893: boolean = (_h5884 !== -1);
                                            if (_c5893) {
                                              let _c5892: boolean = (_h5368 || (_h5884 === 1));
                                              if (!_c5892) {
                                                let _g5885 = 0;
                                                G5886: {
                                                  const _t5887 = (_h5884 + 1);
                                                  const _a5888 = cluesValued(cl.number, _t5887);
                                                  for (let _i5889 = 0; _i5889 < _a5888.length; _i5889++) {
                                                    const v_x = _a5888[_i5889];
                                                    const _h5890 = clueAt(cl.number, v_x);
                                                    if (!((_h5890 === _h5891))) continue;
                                                    _g5885++;
                                                  }
                                                }
                                                _c5892 = (_g5885 === 0);
                                              }
                                              _c5893 = _c5892;
                                            }
                                            if (!(_c5893)) continue;
                                            _g5880++;
                                          }
                                        }
                                        _c5894 = (_g5875 < (2 - _g5880));
                                      }
                                      let _c5975: boolean = _c5894;
                                      if (_c5975) {
                                        let _q5895 = true;
                                        Q5896: {
                                          _g5897.length = 0;
                                          G5898: {
                                            const _a5901 = setOf(v_s);
                                            for (let _i5902 = 0; _i5902 < _a5901.length; _i5902++) {
                                              const v_x = _a5901[_i5902];
                                              const _h5903 = clueAt(cl.number, v_x);
                                              if (!((_h5903 !== -1))) continue;
                                              _g5897.push(v_x);
                                            }
                                          }
                                          _g5904.length = 0;
                                          G5905: {
                                            const _a5922 = throughWhere(sp, v_s, (_te5917: number): boolean => { let _c5919: boolean = ((_te5917 === _wc5351 ? _wd5352 : (_te5917 === _wc5349 ? _wd5350 : (b.grid[_te5917] || -1))) === 1); if (_c5919) {   const _t5918 = sp.edgeEnds[2 * _te5917];   _c5919 = !((clueAt(cl.number, _t5918) !== -1)); } let _c5921: boolean = _c5919; if (_c5921) {   const _t5920 = sp.edgeEnds[2 * _te5917 + 1];   _c5921 = !((clueAt(cl.number, _t5920) !== -1)); } return _c5921; });
                                            for (let _i5923 = 0; _i5923 < _a5922.length; _i5923++) {
                                              const v_t = _a5922[_i5923];
                                              const _h5926 = clueAt(cl.number, v_t);
                                              const _h5927 = (_h5926 !== -1);
                                              const _h5928 = _h5927;
                                              const _h5929 = !(_h5928);
                                              const _a5924 = sp.adj4[v_t];
                                              for (let _i5925 = 0; _i5925 < _a5924.length; _i5925++) {
                                                const v_x = _a5924[_i5925];
                                                const _h5930 = clueAt(cl.number, v_x);
                                                let _c5932: boolean = (_h5929 && (_h5930 !== -1));
                                                if (_c5932) {
                                                  const _t5931 = sp.adj4Edges[v_t][_i5925];
                                                  _c5932 = ((_t5931 === _wc5351 ? _wd5352 : (_t5931 === _wc5349 ? _wd5350 : (b.grid[_t5931] || -1))) === 1);
                                                }
                                                if (!(_c5932)) continue;
                                                if (!_g5904.includes(v_x)) _g5904.push(v_x);
                                              }
                                            }
                                          }
                                          const _a5933 = union(_g5897, _g5904);
                                          for (let _i5934 = 0; _i5934 < _a5933.length; _i5934++) {
                                            const v_p = _a5933[_i5934];
                                            const _h5973 = clueAt(cl.number, v_p);
                                            _g5935.length = 0;
                                            G5936: {
                                              const _a5939 = setOf(v_z);
                                              for (let _i5940 = 0; _i5940 < _a5939.length; _i5940++) {
                                                const v_x = _a5939[_i5940];
                                                const _h5941 = clueAt(cl.number, v_x);
                                                if (!((_h5941 !== -1))) continue;
                                                _g5935.push(v_x);
                                              }
                                            }
                                            _g5942.length = 0;
                                            G5943: {
                                              const _a5960 = throughWhere(sp, v_z, (_te5955: number): boolean => { let _c5957: boolean = ((_te5955 === _wc5351 ? _wd5352 : (_te5955 === _wc5349 ? _wd5350 : (b.grid[_te5955] || -1))) === 1); if (_c5957) {   const _t5956 = sp.edgeEnds[2 * _te5955];   _c5957 = !((clueAt(cl.number, _t5956) !== -1)); } let _c5959: boolean = _c5957; if (_c5959) {   const _t5958 = sp.edgeEnds[2 * _te5955 + 1];   _c5959 = !((clueAt(cl.number, _t5958) !== -1)); } return _c5959; });
                                              for (let _i5961 = 0; _i5961 < _a5960.length; _i5961++) {
                                                const v_t = _a5960[_i5961];
                                                const _h5964 = clueAt(cl.number, v_t);
                                                const _h5965 = (_h5964 !== -1);
                                                const _h5966 = _h5965;
                                                const _h5967 = !(_h5966);
                                                const _a5962 = sp.adj4[v_t];
                                                for (let _i5963 = 0; _i5963 < _a5962.length; _i5963++) {
                                                  const v_x = _a5962[_i5963];
                                                  const _h5968 = clueAt(cl.number, v_x);
                                                  let _c5970: boolean = (_h5967 && (_h5968 !== -1));
                                                  if (_c5970) {
                                                    const _t5969 = sp.adj4Edges[v_t][_i5963];
                                                    _c5970 = ((_t5969 === _wc5351 ? _wd5352 : (_t5969 === _wc5349 ? _wd5350 : (b.grid[_t5969] || -1))) === 1);
                                                  }
                                                  if (!(_c5970)) continue;
                                                  if (!_g5942.includes(v_x)) _g5942.push(v_x);
                                                }
                                              }
                                            }
                                            const _a5971 = union(_g5935, _g5942);
                                            for (let _i5972 = 0; _i5972 < _a5971.length; _i5972++) {
                                              const v_q = _a5971[_i5972];
                                              const _h5974 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h5973 - _h5974)) === cl.step))) {
                                                _q5895 = false;
                                                break Q5896;
                                              }
                                            }
                                          }
                                        }
                                        _c5975 = _q5895;
                                      }
                                      if ((_c5975 && (_h5368 || !(throughWhere(sp, v_s, (_te5976: number): boolean => {  return ((_te5976 === _wc5351 ? _wd5352 : (_te5976 === _wc5349 ? _wd5350 : (b.grid[_te5976] || -1))) === 1); }).includes(v_z))))) {
                                        _q5849 = true;
                                        break Q5850;
                                      }
                                    }
                                  }
                                  _c5977 = _q5849;
                                }
                                if (_c5977) {
                                  _q5702 = true;
                                  break Q5703;
                                }
                              }
                            }
                            _c5978 = !(_q5702);
                          }
                          if (_c5978) {
                            _q5679 = true;
                            break Q5680;
                          }
                        }
                      }
                      _c5979 = _q5679;
                    }
                    if (_c5979) {
                      _q5353 = true;
                      break Q5354;
                    }
                  }
                }
                _c5980 = _q5353;
              }
              _c5981 = _c5980;
            }
            if (!(_c5981)) continue;
            if (!_g4776.includes(v_j)) _g4776.push(v_j);
          }
        }
      }
      const v_A = _g4776;
      const _h7200 = v_A.length;
      const _h7201 = (_h7200 < 3);
      _g5982.length = 0;
      G5983: {
        const _a6535 = v_U;
        for (let _i6536 = 0; _i6536 < _a6535.length; _i6536++) {
          const v_i = _a6535[_i6536];
          const _h6539 = _i6536;
          const _h6540 = (_h6539 > 0);
          const _h6551 = sp.edgeOf(v_c, v_i);
          const _a6537 = v_U;
          for (let _i6538 = 0; _i6538 < _a6537.length; _i6538++) {
            const v_j = _a6537[_i6538];
            let _c7183: boolean = (_h6540 && (_h6539 < _i6538));
            if (_c7183) {
              let _c6550: boolean = (piece(b, sp, v_i).includes(v_j));
              if (!_c6550) {
                let _c6549: boolean = _h5337;
                if (_c6549) {
                  let _q6541 = true;
                  Q6542: {
                    const _a6543 = nearest(b, sp, cl, v_i);
                    for (let _i6544 = 0; _i6544 < _a6543.length; _i6544++) {
                      const v_p = _a6543[_i6544];
                      const _h6547 = clueAt(cl.number, v_p);
                      const _a6545 = nearest(b, sp, cl, v_j);
                      for (let _i6546 = 0; _i6546 < _a6545.length; _i6546++) {
                        const v_q = _a6545[_i6546];
                        const _h6548 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h6547 - _h6548)) === cl.step))) {
                          _q6541 = false;
                          break Q6542;
                        }
                      }
                    }
                  }
                  _c6549 = !(_q6541);
                }
                _c6550 = _c6549;
              }
              let _c7182: boolean = _c6550;
              if (!_c7182) {
                const _wc6552 = _h6551;
                const _wd6553 = 1;
                const _wc6554 = sp.edgeOf(v_c, v_j);
                const _wd6555 = 1;
                let _q6556 = false;
                Q6557: {
                  const _a6559 = throughWhere(sp, v_c, (_te6558: number): boolean => {  return ((_te6558 === _wc6554 ? _wd6555 : (_te6558 === _wc6552 ? _wd6553 : (b.grid[_te6558] || -1))) === 1); });
                  for (let _i6560 = 0; _i6560 < _a6559.length; _i6560++) {
                    const v_t = _a6559[_i6560];
                    let _c6580: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6580) {
                      let _g6561 = 0;
                      G6562: {
                        const _a6563 = sp.adj4[v_t];
                        for (let _i6564 = 0; _i6564 < _a6563.length; _i6564++) {
                          const _t6565 = sp.adj4Edges[v_t][_i6564];
                          if (!(((_t6565 === _wc6554 ? _wd6555 : (_t6565 === _wc6552 ? _wd6553 : (b.grid[_t6565] || -1))) === 1))) continue;
                          _g6561++;
                        }
                      }
                      let _g6566 = 0;
                      G6567: {
                        const _a6568 = setOf(v_t);
                        for (let _i6569 = 0; _i6569 < _a6568.length; _i6569++) {
                          const v_k = _a6568[_i6569];
                          const _h6570 = clueAt(cl.number, v_k);
                          const _h6577 = (_h6570 + 1);
                          let _c6579: boolean = (_h6570 !== -1);
                          if (_c6579) {
                            let _c6578: boolean = (_h5368 || (_h6570 === 1));
                            if (!_c6578) {
                              let _g6571 = 0;
                              G6572: {
                                const _t6573 = (_h6570 + 1);
                                const _a6574 = cluesValued(cl.number, _t6573);
                                for (let _i6575 = 0; _i6575 < _a6574.length; _i6575++) {
                                  const v_x = _a6574[_i6575];
                                  const _h6576 = clueAt(cl.number, v_x);
                                  if (!((_h6576 === _h6577))) continue;
                                  _g6571++;
                                }
                              }
                              _c6578 = (_g6571 === 0);
                            }
                            _c6579 = _c6578;
                          }
                          if (!(_c6579)) continue;
                          _g6566++;
                        }
                      }
                      _c6580 = (_g6561 < (2 - _g6566));
                    }
                    if (!(_c6580)) continue;
                    let _g6581 = 0;
                    G6582: {
                      const _a6583 = sp.adj4[v_t];
                      for (let _i6584 = 0; _i6584 < _a6583.length; _i6584++) {
                        const _t6585 = sp.adj4Edges[v_t][_i6584];
                        if (!(((_t6585 === _wc6554 ? _wd6555 : (_t6585 === _wc6552 ? _wd6553 : (b.grid[_t6585] || -1))) === 1))) continue;
                        _g6581++;
                      }
                    }
                    let _g6586 = 0;
                    G6587: {
                      const _a6588 = setOf(v_t);
                      for (let _i6589 = 0; _i6589 < _a6588.length; _i6589++) {
                        const v_k = _a6588[_i6589];
                        const _h6590 = clueAt(cl.number, v_k);
                        const _h6597 = (_h6590 + 1);
                        let _c6599: boolean = (_h6590 !== -1);
                        if (_c6599) {
                          let _c6598: boolean = (_h5368 || (_h6590 === 1));
                          if (!_c6598) {
                            let _g6591 = 0;
                            G6592: {
                              const _t6593 = (_h6590 + 1);
                              const _a6594 = cluesValued(cl.number, _t6593);
                              for (let _i6595 = 0; _i6595 < _a6594.length; _i6595++) {
                                const v_x = _a6594[_i6595];
                                const _h6596 = clueAt(cl.number, v_x);
                                if (!((_h6596 === _h6597))) continue;
                                _g6591++;
                              }
                            }
                            _c6598 = (_g6591 === 0);
                          }
                          _c6599 = _c6598;
                        }
                        if (!(_c6599)) continue;
                        _g6586++;
                      }
                    }
                    let _c6880: boolean = (_g6581 < (2 - _g6586));
                    if (_c6880) {
                      let _q6600 = false;
                      Q6601: {
                        const _a6602 = sp.adj4[v_t];
                        for (let _i6603 = 0; _i6603 < _a6602.length; _i6603++) {
                          const v_y = _a6602[_i6603];
                          const _t6604 = sp.adj4Edges[v_t][_i6603];
                          let _c6624: boolean = !((_t6604 === _wc6554 ? true : (_t6604 === _wc6552 ? true : (b.grid[_t6604] !== 0))));
                          if (_c6624) {
                            let _g6605 = 0;
                            G6606: {
                              const _a6607 = sp.adj4[v_t];
                              for (let _i6608 = 0; _i6608 < _a6607.length; _i6608++) {
                                const _t6609 = sp.adj4Edges[v_t][_i6608];
                                if (!(((_t6609 === _wc6554 ? _wd6555 : (_t6609 === _wc6552 ? _wd6553 : (b.grid[_t6609] || -1))) === 1))) continue;
                                _g6605++;
                              }
                            }
                            let _g6610 = 0;
                            G6611: {
                              const _a6612 = setOf(v_t);
                              for (let _i6613 = 0; _i6613 < _a6612.length; _i6613++) {
                                const v_k = _a6612[_i6613];
                                const _h6614 = clueAt(cl.number, v_k);
                                const _h6621 = (_h6614 + 1);
                                let _c6623: boolean = (_h6614 !== -1);
                                if (_c6623) {
                                  let _c6622: boolean = (_h5368 || (_h6614 === 1));
                                  if (!_c6622) {
                                    let _g6615 = 0;
                                    G6616: {
                                      const _t6617 = (_h6614 + 1);
                                      const _a6618 = cluesValued(cl.number, _t6617);
                                      for (let _i6619 = 0; _i6619 < _a6618.length; _i6619++) {
                                        const v_x = _a6618[_i6619];
                                        const _h6620 = clueAt(cl.number, v_x);
                                        if (!((_h6620 === _h6621))) continue;
                                        _g6615++;
                                      }
                                    }
                                    _c6622 = (_g6615 === 0);
                                  }
                                  _c6623 = _c6622;
                                }
                                if (!(_c6623)) continue;
                                _g6610++;
                              }
                            }
                            _c6624 = (_g6605 < (2 - _g6610));
                          }
                          let _c6645: boolean = _c6624;
                          if (_c6645) {
                            let _g6625 = 0;
                            G6626: {
                              const _a6628 = sp.adj4[v_y];
                              for (let _i6629 = 0; _i6629 < _a6628.length; _i6629++) {
                                const _t6630 = sp.adj4Edges[v_y][_i6629];
                                if (!(((_t6630 === _wc6554 ? _wd6555 : (_t6630 === _wc6552 ? _wd6553 : (b.grid[_t6630] || -1))) === 1))) continue;
                                _g6625++;
                              }
                            }
                            let _g6631 = 0;
                            G6632: {
                              const _a6633 = setOf(v_y);
                              for (let _i6634 = 0; _i6634 < _a6633.length; _i6634++) {
                                const v_k = _a6633[_i6634];
                                const _h6635 = clueAt(cl.number, v_k);
                                const _h6642 = (_h6635 + 1);
                                let _c6644: boolean = (_h6635 !== -1);
                                if (_c6644) {
                                  let _c6643: boolean = (_h5368 || (_h6635 === 1));
                                  if (!_c6643) {
                                    let _g6636 = 0;
                                    G6637: {
                                      const _t6638 = (_h6635 + 1);
                                      const _a6639 = cluesValued(cl.number, _t6638);
                                      for (let _i6640 = 0; _i6640 < _a6639.length; _i6640++) {
                                        const v_x = _a6639[_i6640];
                                        const _h6641 = clueAt(cl.number, v_x);
                                        if (!((_h6641 === _h6642))) continue;
                                        _g6636++;
                                      }
                                    }
                                    _c6643 = (_g6636 === 0);
                                  }
                                  _c6644 = _c6643;
                                }
                                if (!(_c6644)) continue;
                                _g6631++;
                              }
                            }
                            _c6645 = (_g6625 < (2 - _g6631));
                          }
                          let _c6728: boolean = _c6645;
                          if (_c6728) {
                            let _q6646 = true;
                            Q6647: {
                              _g6648.length = 0;
                              G6649: {
                                const _a6652 = setOf(v_t);
                                for (let _i6653 = 0; _i6653 < _a6652.length; _i6653++) {
                                  const v_x = _a6652[_i6653];
                                  const _h6654 = clueAt(cl.number, v_x);
                                  if (!((_h6654 !== -1))) continue;
                                  _g6648.push(v_x);
                                }
                              }
                              _g6655.length = 0;
                              G6656: {
                                const _a6675 = throughWhere(sp, v_t, (_te6670: number): boolean => { let _c6672: boolean = ((_te6670 === _wc6554 ? _wd6555 : (_te6670 === _wc6552 ? _wd6553 : (b.grid[_te6670] || -1))) === 1); if (_c6672) {   const _t6671 = sp.edgeEnds[2 * _te6670];   _c6672 = !((clueAt(cl.number, _t6671) !== -1)); } let _c6674: boolean = _c6672; if (_c6674) {   const _t6673 = sp.edgeEnds[2 * _te6670 + 1];   _c6674 = !((clueAt(cl.number, _t6673) !== -1)); } return _c6674; });
                                for (let _i6676 = 0; _i6676 < _a6675.length; _i6676++) {
                                  const v_t_6669 = _a6675[_i6676];
                                  const _h6679 = clueAt(cl.number, v_t_6669);
                                  const _h6680 = (_h6679 !== -1);
                                  const _h6681 = _h6680;
                                  const _h6682 = !(_h6681);
                                  const _a6677 = sp.adj4[v_t_6669];
                                  for (let _i6678 = 0; _i6678 < _a6677.length; _i6678++) {
                                    const v_x = _a6677[_i6678];
                                    const _h6683 = clueAt(cl.number, v_x);
                                    let _c6685: boolean = (_h6682 && (_h6683 !== -1));
                                    if (_c6685) {
                                      const _t6684 = sp.adj4Edges[v_t_6669][_i6678];
                                      _c6685 = ((_t6684 === _wc6554 ? _wd6555 : (_t6684 === _wc6552 ? _wd6553 : (b.grid[_t6684] || -1))) === 1);
                                    }
                                    if (!(_c6685)) continue;
                                    if (!_g6655.includes(v_x)) _g6655.push(v_x);
                                  }
                                }
                              }
                              const _a6686 = union(_g6648, _g6655);
                              for (let _i6687 = 0; _i6687 < _a6686.length; _i6687++) {
                                const v_p = _a6686[_i6687];
                                const _h6726 = clueAt(cl.number, v_p);
                                _g6688.length = 0;
                                G6689: {
                                  const _a6692 = setOf(v_y);
                                  for (let _i6693 = 0; _i6693 < _a6692.length; _i6693++) {
                                    const v_x = _a6692[_i6693];
                                    const _h6694 = clueAt(cl.number, v_x);
                                    if (!((_h6694 !== -1))) continue;
                                    _g6688.push(v_x);
                                  }
                                }
                                _g6695.length = 0;
                                G6696: {
                                  const _a6713 = throughWhere(sp, v_y, (_te6708: number): boolean => { let _c6710: boolean = ((_te6708 === _wc6554 ? _wd6555 : (_te6708 === _wc6552 ? _wd6553 : (b.grid[_te6708] || -1))) === 1); if (_c6710) {   const _t6709 = sp.edgeEnds[2 * _te6708];   _c6710 = !((clueAt(cl.number, _t6709) !== -1)); } let _c6712: boolean = _c6710; if (_c6712) {   const _t6711 = sp.edgeEnds[2 * _te6708 + 1];   _c6712 = !((clueAt(cl.number, _t6711) !== -1)); } return _c6712; });
                                  for (let _i6714 = 0; _i6714 < _a6713.length; _i6714++) {
                                    const v_t = _a6713[_i6714];
                                    const _h6717 = clueAt(cl.number, v_t);
                                    const _h6718 = (_h6717 !== -1);
                                    const _h6719 = _h6718;
                                    const _h6720 = !(_h6719);
                                    const _a6715 = sp.adj4[v_t];
                                    for (let _i6716 = 0; _i6716 < _a6715.length; _i6716++) {
                                      const v_x = _a6715[_i6716];
                                      const _h6721 = clueAt(cl.number, v_x);
                                      let _c6723: boolean = (_h6720 && (_h6721 !== -1));
                                      if (_c6723) {
                                        const _t6722 = sp.adj4Edges[v_t][_i6716];
                                        _c6723 = ((_t6722 === _wc6554 ? _wd6555 : (_t6722 === _wc6552 ? _wd6553 : (b.grid[_t6722] || -1))) === 1);
                                      }
                                      if (!(_c6723)) continue;
                                      if (!_g6695.includes(v_x)) _g6695.push(v_x);
                                    }
                                  }
                                }
                                const _a6724 = union(_g6688, _g6695);
                                for (let _i6725 = 0; _i6725 < _a6724.length; _i6725++) {
                                  const v_q = _a6724[_i6725];
                                  const _h6727 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6726 - _h6727)) === cl.step))) {
                                    _q6646 = false;
                                    break Q6647;
                                  }
                                }
                              }
                            }
                            _c6728 = _q6646;
                          }
                          if (!((_c6728 && (_h5368 || !(throughWhere(sp, v_t, (_te6729: number): boolean => {  return ((_te6729 === _wc6554 ? _wd6555 : (_te6729 === _wc6552 ? _wd6553 : (b.grid[_te6729] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6730 = 0;
                          G6731: {
                            const _a6732 = sp.adj4[v_t];
                            for (let _i6733 = 0; _i6733 < _a6732.length; _i6733++) {
                              const _t6734 = sp.adj4Edges[v_t][_i6733];
                              if (!(((_t6734 === _wc6554 ? _wd6555 : (_t6734 === _wc6552 ? _wd6553 : (b.grid[_t6734] || -1))) === 1))) continue;
                              _g6730++;
                            }
                          }
                          let _g6735 = 0;
                          G6736: {
                            const _a6737 = setOf(v_t);
                            for (let _i6738 = 0; _i6738 < _a6737.length; _i6738++) {
                              const v_k = _a6737[_i6738];
                              const _h6739 = clueAt(cl.number, v_k);
                              const _h6746 = (_h6739 + 1);
                              let _c6748: boolean = (_h6739 !== -1);
                              if (_c6748) {
                                let _c6747: boolean = (_h5368 || (_h6739 === 1));
                                if (!_c6747) {
                                  let _g6740 = 0;
                                  G6741: {
                                    const _t6742 = (_h6739 + 1);
                                    const _a6743 = cluesValued(cl.number, _t6742);
                                    for (let _i6744 = 0; _i6744 < _a6743.length; _i6744++) {
                                      const v_x = _a6743[_i6744];
                                      const _h6745 = clueAt(cl.number, v_x);
                                      if (!((_h6745 === _h6746))) continue;
                                      _g6740++;
                                    }
                                  }
                                  _c6747 = (_g6740 === 0);
                                }
                                _c6748 = _c6747;
                              }
                              if (!(_c6748)) continue;
                              _g6735++;
                            }
                          }
                          let _c6879: boolean = ((_g6730 + 1) === (2 - _g6735));
                          if (!_c6879) {
                            let _q6749 = false;
                            Q6750: {
                              const _a6751 = sp.adj4[v_t];
                              const _n6752 = _i6603;
                              for (let _i6753 = 0; _i6753 < _n6752; _i6753++) {
                                const v_z = _a6751[_i6753];
                                const _t6754 = sp.adj4Edges[v_t][_i6753];
                                let _c6774: boolean = !((_t6754 === _wc6554 ? true : (_t6754 === _wc6552 ? true : (b.grid[_t6754] !== 0))));
                                if (_c6774) {
                                  let _g6755 = 0;
                                  G6756: {
                                    const _a6757 = sp.adj4[v_t];
                                    for (let _i6758 = 0; _i6758 < _a6757.length; _i6758++) {
                                      const _t6759 = sp.adj4Edges[v_t][_i6758];
                                      if (!(((_t6759 === _wc6554 ? _wd6555 : (_t6759 === _wc6552 ? _wd6553 : (b.grid[_t6759] || -1))) === 1))) continue;
                                      _g6755++;
                                    }
                                  }
                                  let _g6760 = 0;
                                  G6761: {
                                    const _a6762 = setOf(v_t);
                                    for (let _i6763 = 0; _i6763 < _a6762.length; _i6763++) {
                                      const v_k = _a6762[_i6763];
                                      const _h6764 = clueAt(cl.number, v_k);
                                      const _h6771 = (_h6764 + 1);
                                      let _c6773: boolean = (_h6764 !== -1);
                                      if (_c6773) {
                                        let _c6772: boolean = (_h5368 || (_h6764 === 1));
                                        if (!_c6772) {
                                          let _g6765 = 0;
                                          G6766: {
                                            const _t6767 = (_h6764 + 1);
                                            const _a6768 = cluesValued(cl.number, _t6767);
                                            for (let _i6769 = 0; _i6769 < _a6768.length; _i6769++) {
                                              const v_x = _a6768[_i6769];
                                              const _h6770 = clueAt(cl.number, v_x);
                                              if (!((_h6770 === _h6771))) continue;
                                              _g6765++;
                                            }
                                          }
                                          _c6772 = (_g6765 === 0);
                                        }
                                        _c6773 = _c6772;
                                      }
                                      if (!(_c6773)) continue;
                                      _g6760++;
                                    }
                                  }
                                  _c6774 = (_g6755 < (2 - _g6760));
                                }
                                let _c6794: boolean = _c6774;
                                if (_c6794) {
                                  let _g6775 = 0;
                                  G6776: {
                                    const _a6777 = sp.adj4[v_z];
                                    for (let _i6778 = 0; _i6778 < _a6777.length; _i6778++) {
                                      const _t6779 = sp.adj4Edges[v_z][_i6778];
                                      if (!(((_t6779 === _wc6554 ? _wd6555 : (_t6779 === _wc6552 ? _wd6553 : (b.grid[_t6779] || -1))) === 1))) continue;
                                      _g6775++;
                                    }
                                  }
                                  let _g6780 = 0;
                                  G6781: {
                                    const _a6782 = setOf(v_z);
                                    for (let _i6783 = 0; _i6783 < _a6782.length; _i6783++) {
                                      const v_k = _a6782[_i6783];
                                      const _h6784 = clueAt(cl.number, v_k);
                                      const _h6791 = (_h6784 + 1);
                                      let _c6793: boolean = (_h6784 !== -1);
                                      if (_c6793) {
                                        let _c6792: boolean = (_h5368 || (_h6784 === 1));
                                        if (!_c6792) {
                                          let _g6785 = 0;
                                          G6786: {
                                            const _t6787 = (_h6784 + 1);
                                            const _a6788 = cluesValued(cl.number, _t6787);
                                            for (let _i6789 = 0; _i6789 < _a6788.length; _i6789++) {
                                              const v_x = _a6788[_i6789];
                                              const _h6790 = clueAt(cl.number, v_x);
                                              if (!((_h6790 === _h6791))) continue;
                                              _g6785++;
                                            }
                                          }
                                          _c6792 = (_g6785 === 0);
                                        }
                                        _c6793 = _c6792;
                                      }
                                      if (!(_c6793)) continue;
                                      _g6780++;
                                    }
                                  }
                                  _c6794 = (_g6775 < (2 - _g6780));
                                }
                                let _c6877: boolean = _c6794;
                                if (_c6877) {
                                  let _q6795 = true;
                                  Q6796: {
                                    _g6797.length = 0;
                                    G6798: {
                                      const _a6801 = setOf(v_t);
                                      for (let _i6802 = 0; _i6802 < _a6801.length; _i6802++) {
                                        const v_x = _a6801[_i6802];
                                        const _h6803 = clueAt(cl.number, v_x);
                                        if (!((_h6803 !== -1))) continue;
                                        _g6797.push(v_x);
                                      }
                                    }
                                    _g6804.length = 0;
                                    G6805: {
                                      const _a6824 = throughWhere(sp, v_t, (_te6819: number): boolean => { let _c6821: boolean = ((_te6819 === _wc6554 ? _wd6555 : (_te6819 === _wc6552 ? _wd6553 : (b.grid[_te6819] || -1))) === 1); if (_c6821) {   const _t6820 = sp.edgeEnds[2 * _te6819];   _c6821 = !((clueAt(cl.number, _t6820) !== -1)); } let _c6823: boolean = _c6821; if (_c6823) {   const _t6822 = sp.edgeEnds[2 * _te6819 + 1];   _c6823 = !((clueAt(cl.number, _t6822) !== -1)); } return _c6823; });
                                      for (let _i6825 = 0; _i6825 < _a6824.length; _i6825++) {
                                        const v_t_6818 = _a6824[_i6825];
                                        const _h6828 = clueAt(cl.number, v_t_6818);
                                        const _h6829 = (_h6828 !== -1);
                                        const _h6830 = _h6829;
                                        const _h6831 = !(_h6830);
                                        const _a6826 = sp.adj4[v_t_6818];
                                        for (let _i6827 = 0; _i6827 < _a6826.length; _i6827++) {
                                          const v_x = _a6826[_i6827];
                                          const _h6832 = clueAt(cl.number, v_x);
                                          let _c6834: boolean = (_h6831 && (_h6832 !== -1));
                                          if (_c6834) {
                                            const _t6833 = sp.adj4Edges[v_t_6818][_i6827];
                                            _c6834 = ((_t6833 === _wc6554 ? _wd6555 : (_t6833 === _wc6552 ? _wd6553 : (b.grid[_t6833] || -1))) === 1);
                                          }
                                          if (!(_c6834)) continue;
                                          if (!_g6804.includes(v_x)) _g6804.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6835 = union(_g6797, _g6804);
                                    for (let _i6836 = 0; _i6836 < _a6835.length; _i6836++) {
                                      const v_p = _a6835[_i6836];
                                      const _h6875 = clueAt(cl.number, v_p);
                                      _g6837.length = 0;
                                      G6838: {
                                        const _a6841 = setOf(v_z);
                                        for (let _i6842 = 0; _i6842 < _a6841.length; _i6842++) {
                                          const v_x = _a6841[_i6842];
                                          const _h6843 = clueAt(cl.number, v_x);
                                          if (!((_h6843 !== -1))) continue;
                                          _g6837.push(v_x);
                                        }
                                      }
                                      _g6844.length = 0;
                                      G6845: {
                                        const _a6862 = throughWhere(sp, v_z, (_te6857: number): boolean => { let _c6859: boolean = ((_te6857 === _wc6554 ? _wd6555 : (_te6857 === _wc6552 ? _wd6553 : (b.grid[_te6857] || -1))) === 1); if (_c6859) {   const _t6858 = sp.edgeEnds[2 * _te6857];   _c6859 = !((clueAt(cl.number, _t6858) !== -1)); } let _c6861: boolean = _c6859; if (_c6861) {   const _t6860 = sp.edgeEnds[2 * _te6857 + 1];   _c6861 = !((clueAt(cl.number, _t6860) !== -1)); } return _c6861; });
                                        for (let _i6863 = 0; _i6863 < _a6862.length; _i6863++) {
                                          const v_t = _a6862[_i6863];
                                          const _h6866 = clueAt(cl.number, v_t);
                                          const _h6867 = (_h6866 !== -1);
                                          const _h6868 = _h6867;
                                          const _h6869 = !(_h6868);
                                          const _a6864 = sp.adj4[v_t];
                                          for (let _i6865 = 0; _i6865 < _a6864.length; _i6865++) {
                                            const v_x = _a6864[_i6865];
                                            const _h6870 = clueAt(cl.number, v_x);
                                            let _c6872: boolean = (_h6869 && (_h6870 !== -1));
                                            if (_c6872) {
                                              const _t6871 = sp.adj4Edges[v_t][_i6865];
                                              _c6872 = ((_t6871 === _wc6554 ? _wd6555 : (_t6871 === _wc6552 ? _wd6553 : (b.grid[_t6871] || -1))) === 1);
                                            }
                                            if (!(_c6872)) continue;
                                            if (!_g6844.includes(v_x)) _g6844.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6873 = union(_g6837, _g6844);
                                      for (let _i6874 = 0; _i6874 < _a6873.length; _i6874++) {
                                        const v_q = _a6873[_i6874];
                                        const _h6876 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6875 - _h6876)) === cl.step))) {
                                          _q6795 = false;
                                          break Q6796;
                                        }
                                      }
                                    }
                                  }
                                  _c6877 = _q6795;
                                }
                                if ((_c6877 && (_h5368 || !(throughWhere(sp, v_t, (_te6878: number): boolean => {  return ((_te6878 === _wc6554 ? _wd6555 : (_te6878 === _wc6552 ? _wd6553 : (b.grid[_te6878] || -1))) === 1); }).includes(v_z))))) {
                                  _q6749 = true;
                                  break Q6750;
                                }
                              }
                            }
                            _c6879 = _q6749;
                          }
                          if (_c6879) {
                            _q6600 = true;
                            break Q6601;
                          }
                        }
                      }
                      _c6880 = !(_q6600);
                    }
                    let _c7181: boolean = _c6880;
                    if (!_c7181) {
                      let _q6881 = false;
                      Q6882: {
                        const _a6883 = sp.adj4[v_t];
                        for (let _i6884 = 0; _i6884 < _a6883.length; _i6884++) {
                          const v_s = _a6883[_i6884];
                          let _g6885 = 0;
                          G6886: {
                            const _a6887 = sp.adj4[v_s];
                            for (let _i6888 = 0; _i6888 < _a6887.length; _i6888++) {
                              const _t6889 = sp.adj4Edges[v_s][_i6888];
                              if (!(((_t6889 === _wc6554 ? _wd6555 : (_t6889 === _wc6552 ? _wd6553 : (b.grid[_t6889] || -1))) === 1))) continue;
                              _g6885++;
                            }
                          }
                          let _g6890 = 0;
                          G6891: {
                            const _a6892 = setOf(v_s);
                            for (let _i6893 = 0; _i6893 < _a6892.length; _i6893++) {
                              const v_k = _a6892[_i6893];
                              const _h6894 = clueAt(cl.number, v_k);
                              const _h6901 = (_h6894 + 1);
                              let _c6903: boolean = (_h6894 !== -1);
                              if (_c6903) {
                                let _c6902: boolean = (_h5368 || (_h6894 === 1));
                                if (!_c6902) {
                                  let _g6895 = 0;
                                  G6896: {
                                    const _t6897 = (_h6894 + 1);
                                    const _a6898 = cluesValued(cl.number, _t6897);
                                    for (let _i6899 = 0; _i6899 < _a6898.length; _i6899++) {
                                      const v_x = _a6898[_i6899];
                                      const _h6900 = clueAt(cl.number, v_x);
                                      if (!((_h6900 === _h6901))) continue;
                                      _g6895++;
                                    }
                                  }
                                  _c6902 = (_g6895 === 0);
                                }
                                _c6903 = _c6902;
                              }
                              if (!(_c6903)) continue;
                              _g6890++;
                            }
                          }
                          let _c7180: boolean = (_g6885 < (2 - _g6890));
                          if (_c7180) {
                            let _q6904 = false;
                            Q6905: {
                              const _a6906 = sp.adj4[v_s];
                              for (let _i6907 = 0; _i6907 < _a6906.length; _i6907++) {
                                const v_y = _a6906[_i6907];
                                const _t6908 = sp.adj4Edges[v_s][_i6907];
                                let _c6928: boolean = !((_t6908 === _wc6554 ? true : (_t6908 === _wc6552 ? true : (b.grid[_t6908] !== 0))));
                                if (_c6928) {
                                  let _g6909 = 0;
                                  G6910: {
                                    const _a6911 = sp.adj4[v_s];
                                    for (let _i6912 = 0; _i6912 < _a6911.length; _i6912++) {
                                      const _t6913 = sp.adj4Edges[v_s][_i6912];
                                      if (!(((_t6913 === _wc6554 ? _wd6555 : (_t6913 === _wc6552 ? _wd6553 : (b.grid[_t6913] || -1))) === 1))) continue;
                                      _g6909++;
                                    }
                                  }
                                  let _g6914 = 0;
                                  G6915: {
                                    const _a6916 = setOf(v_s);
                                    for (let _i6917 = 0; _i6917 < _a6916.length; _i6917++) {
                                      const v_k = _a6916[_i6917];
                                      const _h6918 = clueAt(cl.number, v_k);
                                      const _h6925 = (_h6918 + 1);
                                      let _c6927: boolean = (_h6918 !== -1);
                                      if (_c6927) {
                                        let _c6926: boolean = (_h5368 || (_h6918 === 1));
                                        if (!_c6926) {
                                          let _g6919 = 0;
                                          G6920: {
                                            const _t6921 = (_h6918 + 1);
                                            const _a6922 = cluesValued(cl.number, _t6921);
                                            for (let _i6923 = 0; _i6923 < _a6922.length; _i6923++) {
                                              const v_x = _a6922[_i6923];
                                              const _h6924 = clueAt(cl.number, v_x);
                                              if (!((_h6924 === _h6925))) continue;
                                              _g6919++;
                                            }
                                          }
                                          _c6926 = (_g6919 === 0);
                                        }
                                        _c6927 = _c6926;
                                      }
                                      if (!(_c6927)) continue;
                                      _g6914++;
                                    }
                                  }
                                  _c6928 = (_g6909 < (2 - _g6914));
                                }
                                let _c6949: boolean = _c6928;
                                if (_c6949) {
                                  let _g6929 = 0;
                                  G6930: {
                                    const _a6932 = sp.adj4[v_y];
                                    for (let _i6933 = 0; _i6933 < _a6932.length; _i6933++) {
                                      const _t6934 = sp.adj4Edges[v_y][_i6933];
                                      if (!(((_t6934 === _wc6554 ? _wd6555 : (_t6934 === _wc6552 ? _wd6553 : (b.grid[_t6934] || -1))) === 1))) continue;
                                      _g6929++;
                                    }
                                  }
                                  let _g6935 = 0;
                                  G6936: {
                                    const _a6937 = setOf(v_y);
                                    for (let _i6938 = 0; _i6938 < _a6937.length; _i6938++) {
                                      const v_k = _a6937[_i6938];
                                      const _h6939 = clueAt(cl.number, v_k);
                                      const _h6946 = (_h6939 + 1);
                                      let _c6948: boolean = (_h6939 !== -1);
                                      if (_c6948) {
                                        let _c6947: boolean = (_h5368 || (_h6939 === 1));
                                        if (!_c6947) {
                                          let _g6940 = 0;
                                          G6941: {
                                            const _t6942 = (_h6939 + 1);
                                            const _a6943 = cluesValued(cl.number, _t6942);
                                            for (let _i6944 = 0; _i6944 < _a6943.length; _i6944++) {
                                              const v_x = _a6943[_i6944];
                                              const _h6945 = clueAt(cl.number, v_x);
                                              if (!((_h6945 === _h6946))) continue;
                                              _g6940++;
                                            }
                                          }
                                          _c6947 = (_g6940 === 0);
                                        }
                                        _c6948 = _c6947;
                                      }
                                      if (!(_c6948)) continue;
                                      _g6935++;
                                    }
                                  }
                                  _c6949 = (_g6929 < (2 - _g6935));
                                }
                                let _c7030: boolean = _c6949;
                                if (_c7030) {
                                  let _q6950 = true;
                                  Q6951: {
                                    _g6952.length = 0;
                                    G6953: {
                                      const _a6956 = setOf(v_s);
                                      for (let _i6957 = 0; _i6957 < _a6956.length; _i6957++) {
                                        const v_x = _a6956[_i6957];
                                        const _h6958 = clueAt(cl.number, v_x);
                                        if (!((_h6958 !== -1))) continue;
                                        _g6952.push(v_x);
                                      }
                                    }
                                    _g6959.length = 0;
                                    G6960: {
                                      const _a6977 = throughWhere(sp, v_s, (_te6972: number): boolean => { let _c6974: boolean = ((_te6972 === _wc6554 ? _wd6555 : (_te6972 === _wc6552 ? _wd6553 : (b.grid[_te6972] || -1))) === 1); if (_c6974) {   const _t6973 = sp.edgeEnds[2 * _te6972];   _c6974 = !((clueAt(cl.number, _t6973) !== -1)); } let _c6976: boolean = _c6974; if (_c6976) {   const _t6975 = sp.edgeEnds[2 * _te6972 + 1];   _c6976 = !((clueAt(cl.number, _t6975) !== -1)); } return _c6976; });
                                      for (let _i6978 = 0; _i6978 < _a6977.length; _i6978++) {
                                        const v_t = _a6977[_i6978];
                                        const _h6981 = clueAt(cl.number, v_t);
                                        const _h6982 = (_h6981 !== -1);
                                        const _h6983 = _h6982;
                                        const _h6984 = !(_h6983);
                                        const _a6979 = sp.adj4[v_t];
                                        for (let _i6980 = 0; _i6980 < _a6979.length; _i6980++) {
                                          const v_x = _a6979[_i6980];
                                          const _h6985 = clueAt(cl.number, v_x);
                                          let _c6987: boolean = (_h6984 && (_h6985 !== -1));
                                          if (_c6987) {
                                            const _t6986 = sp.adj4Edges[v_t][_i6980];
                                            _c6987 = ((_t6986 === _wc6554 ? _wd6555 : (_t6986 === _wc6552 ? _wd6553 : (b.grid[_t6986] || -1))) === 1);
                                          }
                                          if (!(_c6987)) continue;
                                          if (!_g6959.includes(v_x)) _g6959.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6988 = union(_g6952, _g6959);
                                    for (let _i6989 = 0; _i6989 < _a6988.length; _i6989++) {
                                      const v_p = _a6988[_i6989];
                                      const _h7028 = clueAt(cl.number, v_p);
                                      _g6990.length = 0;
                                      G6991: {
                                        const _a6994 = setOf(v_y);
                                        for (let _i6995 = 0; _i6995 < _a6994.length; _i6995++) {
                                          const v_x = _a6994[_i6995];
                                          const _h6996 = clueAt(cl.number, v_x);
                                          if (!((_h6996 !== -1))) continue;
                                          _g6990.push(v_x);
                                        }
                                      }
                                      _g6997.length = 0;
                                      G6998: {
                                        const _a7015 = throughWhere(sp, v_y, (_te7010: number): boolean => { let _c7012: boolean = ((_te7010 === _wc6554 ? _wd6555 : (_te7010 === _wc6552 ? _wd6553 : (b.grid[_te7010] || -1))) === 1); if (_c7012) {   const _t7011 = sp.edgeEnds[2 * _te7010];   _c7012 = !((clueAt(cl.number, _t7011) !== -1)); } let _c7014: boolean = _c7012; if (_c7014) {   const _t7013 = sp.edgeEnds[2 * _te7010 + 1];   _c7014 = !((clueAt(cl.number, _t7013) !== -1)); } return _c7014; });
                                        for (let _i7016 = 0; _i7016 < _a7015.length; _i7016++) {
                                          const v_t = _a7015[_i7016];
                                          const _h7019 = clueAt(cl.number, v_t);
                                          const _h7020 = (_h7019 !== -1);
                                          const _h7021 = _h7020;
                                          const _h7022 = !(_h7021);
                                          const _a7017 = sp.adj4[v_t];
                                          for (let _i7018 = 0; _i7018 < _a7017.length; _i7018++) {
                                            const v_x = _a7017[_i7018];
                                            const _h7023 = clueAt(cl.number, v_x);
                                            let _c7025: boolean = (_h7022 && (_h7023 !== -1));
                                            if (_c7025) {
                                              const _t7024 = sp.adj4Edges[v_t][_i7018];
                                              _c7025 = ((_t7024 === _wc6554 ? _wd6555 : (_t7024 === _wc6552 ? _wd6553 : (b.grid[_t7024] || -1))) === 1);
                                            }
                                            if (!(_c7025)) continue;
                                            if (!_g6997.includes(v_x)) _g6997.push(v_x);
                                          }
                                        }
                                      }
                                      const _a7026 = union(_g6990, _g6997);
                                      for (let _i7027 = 0; _i7027 < _a7026.length; _i7027++) {
                                        const v_q = _a7026[_i7027];
                                        const _h7029 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7028 - _h7029)) === cl.step))) {
                                          _q6950 = false;
                                          break Q6951;
                                        }
                                      }
                                    }
                                  }
                                  _c7030 = _q6950;
                                }
                                if (!((_c7030 && (_h5368 || !(throughWhere(sp, v_s, (_te7031: number): boolean => {  return ((_te7031 === _wc6554 ? _wd6555 : (_te7031 === _wc6552 ? _wd6553 : (b.grid[_te7031] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g7032 = 0;
                                G7033: {
                                  const _a7034 = sp.adj4[v_s];
                                  for (let _i7035 = 0; _i7035 < _a7034.length; _i7035++) {
                                    const _t7036 = sp.adj4Edges[v_s][_i7035];
                                    if (!(((_t7036 === _wc6554 ? _wd6555 : (_t7036 === _wc6552 ? _wd6553 : (b.grid[_t7036] || -1))) === 1))) continue;
                                    _g7032++;
                                  }
                                }
                                let _g7037 = 0;
                                G7038: {
                                  const _a7039 = setOf(v_s);
                                  for (let _i7040 = 0; _i7040 < _a7039.length; _i7040++) {
                                    const v_k = _a7039[_i7040];
                                    const _h7041 = clueAt(cl.number, v_k);
                                    const _h7048 = (_h7041 + 1);
                                    let _c7050: boolean = (_h7041 !== -1);
                                    if (_c7050) {
                                      let _c7049: boolean = (_h5368 || (_h7041 === 1));
                                      if (!_c7049) {
                                        let _g7042 = 0;
                                        G7043: {
                                          const _t7044 = (_h7041 + 1);
                                          const _a7045 = cluesValued(cl.number, _t7044);
                                          for (let _i7046 = 0; _i7046 < _a7045.length; _i7046++) {
                                            const v_x = _a7045[_i7046];
                                            const _h7047 = clueAt(cl.number, v_x);
                                            if (!((_h7047 === _h7048))) continue;
                                            _g7042++;
                                          }
                                        }
                                        _c7049 = (_g7042 === 0);
                                      }
                                      _c7050 = _c7049;
                                    }
                                    if (!(_c7050)) continue;
                                    _g7037++;
                                  }
                                }
                                let _c7179: boolean = ((_g7032 + 1) === (2 - _g7037));
                                if (!_c7179) {
                                  let _q7051 = false;
                                  Q7052: {
                                    const _a7053 = sp.adj4[v_s];
                                    const _n7054 = _i6907;
                                    for (let _i7055 = 0; _i7055 < _n7054; _i7055++) {
                                      const v_z = _a7053[_i7055];
                                      const _t7056 = sp.adj4Edges[v_s][_i7055];
                                      let _c7076: boolean = !((_t7056 === _wc6554 ? true : (_t7056 === _wc6552 ? true : (b.grid[_t7056] !== 0))));
                                      if (_c7076) {
                                        let _g7057 = 0;
                                        G7058: {
                                          const _a7059 = sp.adj4[v_s];
                                          for (let _i7060 = 0; _i7060 < _a7059.length; _i7060++) {
                                            const _t7061 = sp.adj4Edges[v_s][_i7060];
                                            if (!(((_t7061 === _wc6554 ? _wd6555 : (_t7061 === _wc6552 ? _wd6553 : (b.grid[_t7061] || -1))) === 1))) continue;
                                            _g7057++;
                                          }
                                        }
                                        let _g7062 = 0;
                                        G7063: {
                                          const _a7064 = setOf(v_s);
                                          for (let _i7065 = 0; _i7065 < _a7064.length; _i7065++) {
                                            const v_k = _a7064[_i7065];
                                            const _h7066 = clueAt(cl.number, v_k);
                                            const _h7073 = (_h7066 + 1);
                                            let _c7075: boolean = (_h7066 !== -1);
                                            if (_c7075) {
                                              let _c7074: boolean = (_h5368 || (_h7066 === 1));
                                              if (!_c7074) {
                                                let _g7067 = 0;
                                                G7068: {
                                                  const _t7069 = (_h7066 + 1);
                                                  const _a7070 = cluesValued(cl.number, _t7069);
                                                  for (let _i7071 = 0; _i7071 < _a7070.length; _i7071++) {
                                                    const v_x = _a7070[_i7071];
                                                    const _h7072 = clueAt(cl.number, v_x);
                                                    if (!((_h7072 === _h7073))) continue;
                                                    _g7067++;
                                                  }
                                                }
                                                _c7074 = (_g7067 === 0);
                                              }
                                              _c7075 = _c7074;
                                            }
                                            if (!(_c7075)) continue;
                                            _g7062++;
                                          }
                                        }
                                        _c7076 = (_g7057 < (2 - _g7062));
                                      }
                                      let _c7096: boolean = _c7076;
                                      if (_c7096) {
                                        let _g7077 = 0;
                                        G7078: {
                                          const _a7079 = sp.adj4[v_z];
                                          for (let _i7080 = 0; _i7080 < _a7079.length; _i7080++) {
                                            const _t7081 = sp.adj4Edges[v_z][_i7080];
                                            if (!(((_t7081 === _wc6554 ? _wd6555 : (_t7081 === _wc6552 ? _wd6553 : (b.grid[_t7081] || -1))) === 1))) continue;
                                            _g7077++;
                                          }
                                        }
                                        let _g7082 = 0;
                                        G7083: {
                                          const _a7084 = setOf(v_z);
                                          for (let _i7085 = 0; _i7085 < _a7084.length; _i7085++) {
                                            const v_k = _a7084[_i7085];
                                            const _h7086 = clueAt(cl.number, v_k);
                                            const _h7093 = (_h7086 + 1);
                                            let _c7095: boolean = (_h7086 !== -1);
                                            if (_c7095) {
                                              let _c7094: boolean = (_h5368 || (_h7086 === 1));
                                              if (!_c7094) {
                                                let _g7087 = 0;
                                                G7088: {
                                                  const _t7089 = (_h7086 + 1);
                                                  const _a7090 = cluesValued(cl.number, _t7089);
                                                  for (let _i7091 = 0; _i7091 < _a7090.length; _i7091++) {
                                                    const v_x = _a7090[_i7091];
                                                    const _h7092 = clueAt(cl.number, v_x);
                                                    if (!((_h7092 === _h7093))) continue;
                                                    _g7087++;
                                                  }
                                                }
                                                _c7094 = (_g7087 === 0);
                                              }
                                              _c7095 = _c7094;
                                            }
                                            if (!(_c7095)) continue;
                                            _g7082++;
                                          }
                                        }
                                        _c7096 = (_g7077 < (2 - _g7082));
                                      }
                                      let _c7177: boolean = _c7096;
                                      if (_c7177) {
                                        let _q7097 = true;
                                        Q7098: {
                                          _g7099.length = 0;
                                          G7100: {
                                            const _a7103 = setOf(v_s);
                                            for (let _i7104 = 0; _i7104 < _a7103.length; _i7104++) {
                                              const v_x = _a7103[_i7104];
                                              const _h7105 = clueAt(cl.number, v_x);
                                              if (!((_h7105 !== -1))) continue;
                                              _g7099.push(v_x);
                                            }
                                          }
                                          _g7106.length = 0;
                                          G7107: {
                                            const _a7124 = throughWhere(sp, v_s, (_te7119: number): boolean => { let _c7121: boolean = ((_te7119 === _wc6554 ? _wd6555 : (_te7119 === _wc6552 ? _wd6553 : (b.grid[_te7119] || -1))) === 1); if (_c7121) {   const _t7120 = sp.edgeEnds[2 * _te7119];   _c7121 = !((clueAt(cl.number, _t7120) !== -1)); } let _c7123: boolean = _c7121; if (_c7123) {   const _t7122 = sp.edgeEnds[2 * _te7119 + 1];   _c7123 = !((clueAt(cl.number, _t7122) !== -1)); } return _c7123; });
                                            for (let _i7125 = 0; _i7125 < _a7124.length; _i7125++) {
                                              const v_t = _a7124[_i7125];
                                              const _h7128 = clueAt(cl.number, v_t);
                                              const _h7129 = (_h7128 !== -1);
                                              const _h7130 = _h7129;
                                              const _h7131 = !(_h7130);
                                              const _a7126 = sp.adj4[v_t];
                                              for (let _i7127 = 0; _i7127 < _a7126.length; _i7127++) {
                                                const v_x = _a7126[_i7127];
                                                const _h7132 = clueAt(cl.number, v_x);
                                                let _c7134: boolean = (_h7131 && (_h7132 !== -1));
                                                if (_c7134) {
                                                  const _t7133 = sp.adj4Edges[v_t][_i7127];
                                                  _c7134 = ((_t7133 === _wc6554 ? _wd6555 : (_t7133 === _wc6552 ? _wd6553 : (b.grid[_t7133] || -1))) === 1);
                                                }
                                                if (!(_c7134)) continue;
                                                if (!_g7106.includes(v_x)) _g7106.push(v_x);
                                              }
                                            }
                                          }
                                          const _a7135 = union(_g7099, _g7106);
                                          for (let _i7136 = 0; _i7136 < _a7135.length; _i7136++) {
                                            const v_p = _a7135[_i7136];
                                            const _h7175 = clueAt(cl.number, v_p);
                                            _g7137.length = 0;
                                            G7138: {
                                              const _a7141 = setOf(v_z);
                                              for (let _i7142 = 0; _i7142 < _a7141.length; _i7142++) {
                                                const v_x = _a7141[_i7142];
                                                const _h7143 = clueAt(cl.number, v_x);
                                                if (!((_h7143 !== -1))) continue;
                                                _g7137.push(v_x);
                                              }
                                            }
                                            _g7144.length = 0;
                                            G7145: {
                                              const _a7162 = throughWhere(sp, v_z, (_te7157: number): boolean => { let _c7159: boolean = ((_te7157 === _wc6554 ? _wd6555 : (_te7157 === _wc6552 ? _wd6553 : (b.grid[_te7157] || -1))) === 1); if (_c7159) {   const _t7158 = sp.edgeEnds[2 * _te7157];   _c7159 = !((clueAt(cl.number, _t7158) !== -1)); } let _c7161: boolean = _c7159; if (_c7161) {   const _t7160 = sp.edgeEnds[2 * _te7157 + 1];   _c7161 = !((clueAt(cl.number, _t7160) !== -1)); } return _c7161; });
                                              for (let _i7163 = 0; _i7163 < _a7162.length; _i7163++) {
                                                const v_t = _a7162[_i7163];
                                                const _h7166 = clueAt(cl.number, v_t);
                                                const _h7167 = (_h7166 !== -1);
                                                const _h7168 = _h7167;
                                                const _h7169 = !(_h7168);
                                                const _a7164 = sp.adj4[v_t];
                                                for (let _i7165 = 0; _i7165 < _a7164.length; _i7165++) {
                                                  const v_x = _a7164[_i7165];
                                                  const _h7170 = clueAt(cl.number, v_x);
                                                  let _c7172: boolean = (_h7169 && (_h7170 !== -1));
                                                  if (_c7172) {
                                                    const _t7171 = sp.adj4Edges[v_t][_i7165];
                                                    _c7172 = ((_t7171 === _wc6554 ? _wd6555 : (_t7171 === _wc6552 ? _wd6553 : (b.grid[_t7171] || -1))) === 1);
                                                  }
                                                  if (!(_c7172)) continue;
                                                  if (!_g7144.includes(v_x)) _g7144.push(v_x);
                                                }
                                              }
                                            }
                                            const _a7173 = union(_g7137, _g7144);
                                            for (let _i7174 = 0; _i7174 < _a7173.length; _i7174++) {
                                              const v_q = _a7173[_i7174];
                                              const _h7176 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h7175 - _h7176)) === cl.step))) {
                                                _q7097 = false;
                                                break Q7098;
                                              }
                                            }
                                          }
                                        }
                                        _c7177 = _q7097;
                                      }
                                      if ((_c7177 && (_h5368 || !(throughWhere(sp, v_s, (_te7178: number): boolean => {  return ((_te7178 === _wc6554 ? _wd6555 : (_te7178 === _wc6552 ? _wd6553 : (b.grid[_te7178] || -1))) === 1); }).includes(v_z))))) {
                                        _q7051 = true;
                                        break Q7052;
                                      }
                                    }
                                  }
                                  _c7179 = _q7051;
                                }
                                if (_c7179) {
                                  _q6904 = true;
                                  break Q6905;
                                }
                              }
                            }
                            _c7180 = !(_q6904);
                          }
                          if (_c7180) {
                            _q6881 = true;
                            break Q6882;
                          }
                        }
                      }
                      _c7181 = _q6881;
                    }
                    if (_c7181) {
                      _q6556 = true;
                      break Q6557;
                    }
                  }
                }
                _c7182 = _q6556;
              }
              _c7183 = _c7182;
            }
            if (!(_c7183)) continue;
            const _t7185 = minus(v_U, setOf(_h7184, v_i, v_j));
            const _t7186 = (_t7185.length > 0 ? _t7185[0] : -1);
            if (!_g5982.includes(_t7186)) _g5982.push(_t7186);
          }
        }
      }
      const v_B = _g5982;
      const _h7221 = v_B.length;
      const _h7222 = (_h7221 === 3);
      _g7187.length = 0;
      G7188: {
        const _a7198 = v_U;
        for (let _i7199 = 0; _i7199 < _a7198.length; _i7199++) {
          const v_y = _a7198[_i7199];
          let _c7208: boolean = ((_i7199 === 0) && _h7201);
          if (!_c7208) {
            let _c7207: boolean = (_i7199 > 0);
            if (_c7207) {
              let _c7206: boolean = !(v_A.includes(v_y));
              if (!_c7206) {
                let _q7202 = false;
                Q7203: {
                  const _a7204 = v_U;
                  for (let _i7205 = 0; _i7205 < _a7204.length; _i7205++) {
                    const v_m = _a7204[_i7205];
                    if (!(((_i7205 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q7202 = true;
                      break Q7203;
                    }
                  }
                }
                _c7206 = _q7202;
              }
              _c7207 = _c7206;
            }
            _c7208 = _c7207;
          }
          if (!(_c7208)) continue;
          _g7187.push(v_y);
        }
      }
      const v_N = _g7187;
      const _h7230 = v_N.length;
      _g7209.length = 0;
      G7210: {
        const _a7219 = v_N;
        for (let _i7220 = 0; _i7220 < _a7219.length; _i7220++) {
          const v_y = _a7219[_i7220];
          let _c7228: boolean = ((v_U.indexOf(v_y) === 0) && _h7222);
          if (!_c7228) {
            let _c7227: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c7227) {
              let _q7223 = true;
              Q7224: {
                const _a7225 = v_U;
                for (let _i7226 = 0; _i7226 < _a7225.length; _i7226++) {
                  const v_m = _a7225[_i7226];
                  if (!(((_i7226 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q7223 = false;
                    break Q7224;
                  }
                }
              }
              _c7227 = _q7223;
            }
            _c7228 = _c7227;
          }
          if (!(_c7228)) continue;
          _g7209.push(v_y);
        }
      }
      const v_P = _g7209;
      const _h7231 = v_P.length;
      L7229: {
        const v_X = minus(v_U, v_N);
        const _h7232 = v_X.length;
        if (!((((_h7230 === 0) || (_h7231 > 0)) || (_h7232 > 0)))) break L7229;
        facts.length = 0;
        changed = false;
        let _c7238: boolean = (_h7230 > 0);
        if (_c7238) {
          let _q7233 = true;
          Q7234: {
            const _a7235 = v_P;
            for (let _i7236 = 0; _i7236 < _a7235.length; _i7236++) {
              const v_y = _a7235[_i7236];
              const _t7237 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t7237] !== 0)) { if (fire === null) { b.placeAt(_t7237, 1); changed = true; } else facts.push(PLACE, _t7237, 1); }
              if (!(true)) {
                _q7233 = false;
                break Q7234;
              }
            }
          }
          _c7238 = _q7233;
        }
        let _c7245: boolean = _c7238;
        if (_c7245) {
          let _c7244: boolean = !((_h7231 === 0));
          if (!_c7244) {
            let _q7239 = true;
            Q7240: {
              const _a7241 = v_X;
              for (let _i7242 = 0; _i7242 < _a7241.length; _i7242++) {
                const v_y = _a7241[_i7242];
                const _t7243 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t7243] !== 0)) { if (fire === null) { b.placeAt(_t7243, 2); changed = true; } else facts.push(PLACE, _t7243, 2); }
                if (!(true)) {
                  _q7239 = false;
                  break Q7240;
                }
              }
            }
            _c7244 = _q7239;
          }
          _c7245 = _c7244;
        }
        if (!(_c7245)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, U: v_U, A: v_A, B: v_B, N: v_N, P: v_P, X: v_X }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const takesKept = keptStore<number>();

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = takesKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g3 = 0;
  G4: {
    const _a5 = setOf(v_c);
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_k = _a5[_i6];
      let _c13: boolean = (clueAt(cl.number, v_k) !== -1);
      if (_c13) {
        let _c12: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
        if (!_c12) {
          let _g7 = 0;
          G8: {
            const _t9 = (clueAt(cl.number, v_k) + 1);
            const _a10 = cluesValued(cl.number, _t9);
            for (let _i11 = 0; _i11 < _a10.length; _i11++) {
              const v_x = _a10[_i11];
              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
              _g7++;
            }
          }
          _c12 = (_g7 === 0);
        }
        _c13 = _c12;
      }
      if (!(_c13)) continue;
      _g3++;
    }
  }
  const _made = (2 - _g3);
  _kept[v_c] = _made;
  return _made;
}

const spareKept = keptStore<boolean>();

/** `spare(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function spare(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): boolean {
  const _kept: Kept<boolean> = spareKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g22 = 0;
  G23: {
    const _a24 = sp.adj4[v_c];
    for (let _i25 = 0; _i25 < _a24.length; _i25++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i25]] || -1) === 1))) continue;
      _g22++;
    }
  }
  const _made = (_g22 < takes(sp, cl, v_c));
  _kept[v_c] = _made;
  return _made;
}

const nearestKept = keptStore<readonly number[]>();

/** `nearest(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function nearest(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearestKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g28: number[] = [];
  G29: {
    const _a32 = setOf(v_c);
    for (let _i33 = 0; _i33 < _a32.length; _i33++) {
      const v_x = _a32[_i33];
      if (!((clueAt(cl.number, v_x) !== -1))) continue;
      _g28.push(v_x);
    }
  }
  const _g34: number[] = [];
  G35: {
    const _a50 = throughWhere(sp, v_c, (_te45: number): boolean => { let _c47: boolean = ((b.grid[_te45] || -1) === 1); if (_c47) {   const _t46 = sp.edgeEnds[2 * _te45];   _c47 = !((clueAt(cl.number, _t46) !== -1)); } let _c49: boolean = _c47; if (_c49) {   const _t48 = sp.edgeEnds[2 * _te45 + 1];   _c49 = !((clueAt(cl.number, _t48) !== -1)); } return _c49; });
    for (let _i51 = 0; _i51 < _a50.length; _i51++) {
      const v_t = _a50[_i51];
      const _a52 = sp.adj4[v_t];
      for (let _i53 = 0; _i53 < _a52.length; _i53++) {
        const v_x = _a52[_i53];
        if (!(((!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1)) && ((b.grid[sp.adj4Edges[v_t][_i53]] || -1) === 1)))) continue;
        if (!_g34.includes(v_x)) _g34.push(v_x);
      }
    }
  }
  const _made = union(_g28, _g34);
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g18: number[] = [];
  G19: {
    const _a60 = sp.adj4[v_c];
    for (let _i61 = 0; _i61 < _a60.length; _i61++) {
      const v_y = _a60[_i61];
      let _c68: boolean = ((!((b.grid[sp.adj4Edges[v_c][_i61]] !== 0)) && spare(b, sp, cl, v_c)) && spare(b, sp, cl, v_y));
      if (_c68) {
        let _q62 = true;
        Q63: {
          const _a64 = nearest(b, sp, cl, v_c);
          for (let _i65 = 0; _i65 < _a64.length; _i65++) {
            const v_p = _a64[_i65];
            const _a66 = nearest(b, sp, cl, v_y);
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_q = _a66[_i67];
              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                _q62 = false;
                break Q63;
              }
            }
          }
        }
        _c68 = _q62;
      }
      if (!((_c68 && ((cl.step === 0) || !(throughWhere(sp, v_c, (_te69: number): boolean => {  return ((b.grid[_te69] || -1) === 1); }).includes(v_y)))))) continue;
      _g18.push(v_y);
    }
  }
  const _made = _g18;
  _kept[v_c] = _made;
  return _made;
}

const pieceKept = keptStore<readonly number[]>();

/** `piece(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function piece(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = pieceKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = throughWhere(sp, v_c, (_te86: number): boolean => {  return ((b.grid[_te86] || -1) === 1); });
  _kept[v_c] = _made;
  return _made;
}
