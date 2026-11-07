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
  const _g7277: number[] = [];
  const _g7284: number[] = [];
  const _g7343: number[] = [];
  const _g7350: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h7262 = (cl.step === 0);
  const _h7326 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q7248 = true;
  Q7249: {
    const _a7250 = sp.cells;
    for (let _i7251 = 0; _i7251 < _a7250.length; _i7251++) {
      const v_c = _a7250[_i7251];
      let _g7252 = 0;
      G7253: {
        const _a7254 = sp.adj4[v_c];
        for (let _i7255 = 0; _i7255 < _a7254.length; _i7255++) {
          const _h7256 = (g[sp.adj4Edges[v_c][_i7255]] || -1);
          if (!((_h7256 === 1))) continue;
          _g7252++;
        }
      }
      let _g7257 = 0;
      G7258: {
        const _a7259 = setOf(v_c);
        for (let _i7260 = 0; _i7260 < _a7259.length; _i7260++) {
          const v_k = _a7259[_i7260];
          const _h7261 = clueAt(cl.number, v_k);
          const _h7269 = (_h7261 + 1);
          let _c7271: boolean = (_h7261 !== -1);
          if (_c7271) {
            let _c7270: boolean = (_h7262 || (_h7261 === 1));
            if (!_c7270) {
              let _g7263 = 0;
              G7264: {
                const _t7265 = (_h7261 + 1);
                const _a7266 = cluesValued(cl.number, _t7265);
                for (let _i7267 = 0; _i7267 < _a7266.length; _i7267++) {
                  const v_x = _a7266[_i7267];
                  const _h7268 = clueAt(cl.number, v_x);
                  if (!((_h7268 === _h7269))) continue;
                  _g7263++;
                }
              }
              _c7270 = (_g7263 === 0);
            }
            _c7271 = _c7270;
          }
          if (!(_c7271)) continue;
          _g7257++;
        }
      }
      if (!((_g7252 === (2 - _g7257)))) {
        _q7248 = false;
        break Q7249;
      }
    }
  }
  if (!(_q7248)) return false;
  let _q7272 = true;
  Q7273: {
    const _a7274 = sp.cells;
    for (let _i7275 = 0; _i7275 < _a7274.length; _i7275++) {
      const v_c = _a7274[_i7275];
      const _h7276 = clueAt(cl.number, v_c);
      if (!(!((_h7276 !== -1)))) continue;
      _g7277.length = 0;
      G7278: {
        const _a7281 = setOf(v_c);
        for (let _i7282 = 0; _i7282 < _a7281.length; _i7282++) {
          const v_x = _a7281[_i7282];
          const _h7283 = clueAt(cl.number, v_x);
          if (!((_h7283 !== -1))) continue;
          _g7277.push(v_x);
        }
      }
      _g7284.length = 0;
      G7285: {
        const _a7300 = throughWhere(sp, v_c, (_te7295: number): boolean => { let _c7297: boolean = ((g[_te7295] || -1) === 1); if (_c7297) {   const _t7296 = sp.edgeEnds[2 * _te7295];   _c7297 = !((clueAt(cl.number, _t7296) !== -1)); } let _c7299: boolean = _c7297; if (_c7299) {   const _t7298 = sp.edgeEnds[2 * _te7295 + 1];   _c7299 = !((clueAt(cl.number, _t7298) !== -1)); } return _c7299; });
        for (let _i7301 = 0; _i7301 < _a7300.length; _i7301++) {
          const v_t = _a7300[_i7301];
          const _h7304 = clueAt(cl.number, v_t);
          const _h7305 = (_h7304 !== -1);
          const _h7306 = _h7305;
          const _h7307 = !(_h7306);
          const _a7302 = sp.adj4[v_t];
          for (let _i7303 = 0; _i7303 < _a7302.length; _i7303++) {
            const v_x = _a7302[_i7303];
            const _h7308 = clueAt(cl.number, v_x);
            const _h7309 = (g[sp.adj4Edges[v_t][_i7303]] || -1);
            if (!(((_h7307 && (_h7308 !== -1)) && (_h7309 === 1)))) continue;
            if (!_g7284.includes(v_x)) _g7284.push(v_x);
          }
        }
      }
      if (!((union(_g7277, _g7284).length === 2))) {
        _q7272 = false;
        break Q7273;
      }
    }
  }
  if (!(_q7272)) return false;
  let _c7315: boolean = (cl.step === 0);
  if (!_c7315) {
    let _q7310 = false;
    Q7311: {
      const _a7312 = sp.cells;
      for (let _i7313 = 0; _i7313 < _a7312.length; _i7313++) {
        const v_x = _a7312[_i7313];
        const _h7314 = clueAt(cl.number, v_x);
        if ((_h7314 === 2)) {
          _q7310 = true;
          break Q7311;
        }
      }
    }
    _c7315 = _q7310;
  }
  let _c7335: boolean = _c7315;
  if (_c7335) {
    let _q7316 = true;
    Q7317: {
      const _a7318 = sp.cells;
      for (let _i7319 = 0; _i7319 < _a7318.length; _i7319++) {
        const v_x = _a7318[_i7319];
        const _h7320 = clueAt(cl.number, v_x);
        if (!((_h7320 !== -1))) continue;
        const _h7332 = (_h7320 - 1);
        let _g7321 = 0;
        G7322: {
          const _a7323 = cluesValued(cl.number, _h7320);
          for (let _i7324 = 0; _i7324 < _a7323.length; _i7324++) {
            const v_y = _a7323[_i7324];
            const _h7325 = clueAt(cl.number, v_y);
            if (!((_h7325 === _h7320))) continue;
            _g7321++;
          }
        }
        let _c7334: boolean = (_g7321 === _h7326);
        if (_c7334) {
          let _c7333: boolean = (_h7320 === 1);
          if (!_c7333) {
            let _q7327 = false;
            Q7328: {
              const _a7329 = sp.cells;
              for (let _i7330 = 0; _i7330 < _a7329.length; _i7330++) {
                const v_y = _a7329[_i7330];
                const _h7331 = clueAt(cl.number, v_y);
                if ((_h7331 === _h7332)) {
                  _q7327 = true;
                  break Q7328;
                }
              }
            }
            _c7333 = _q7327;
          }
          _c7334 = _c7333;
        }
        if (!(_c7334)) {
          _q7316 = false;
          break Q7317;
        }
      }
    }
    _c7335 = _q7316;
  }
  if (!(_c7335)) return false;
  for (let _k7336 = 0; _k7336 < cl.number.at.length; _k7336++) {
    const _at7337 = cl.number.at[_k7336];
    let _q7339 = true;
    Q7340: {
      const _a7341 = sp.adj4[_at7337];
      for (let _i7342 = 0; _i7342 < _a7341.length; _i7342++) {
        const v_y = _a7341[_i7342];
        if (!(((g[sp.adj4Edges[_at7337][_i7342]] || -1) === 1))) continue;
        _g7343.length = 0;
        G7344: {
          const _a7347 = setOf(v_y);
          for (let _i7348 = 0; _i7348 < _a7347.length; _i7348++) {
            const v_x = _a7347[_i7348];
            const _h7349 = clueAt(cl.number, v_x);
            if (!((_h7349 !== -1))) continue;
            _g7343.push(v_x);
          }
        }
        _g7350.length = 0;
        G7351: {
          const _a7366 = throughWhere(sp, v_y, (_te7361: number): boolean => { let _c7363: boolean = ((g[_te7361] || -1) === 1); if (_c7363) {   const _t7362 = sp.edgeEnds[2 * _te7361];   _c7363 = !((clueAt(cl.number, _t7362) !== -1)); } let _c7365: boolean = _c7363; if (_c7365) {   const _t7364 = sp.edgeEnds[2 * _te7361 + 1];   _c7365 = !((clueAt(cl.number, _t7364) !== -1)); } return _c7365; });
          for (let _i7367 = 0; _i7367 < _a7366.length; _i7367++) {
            const v_t = _a7366[_i7367];
            const _h7370 = clueAt(cl.number, v_t);
            const _h7371 = (_h7370 !== -1);
            const _h7372 = _h7371;
            const _h7373 = !(_h7372);
            const _a7368 = sp.adj4[v_t];
            for (let _i7369 = 0; _i7369 < _a7368.length; _i7369++) {
              const v_x = _a7368[_i7369];
              const _h7374 = clueAt(cl.number, v_x);
              const _h7375 = (g[sp.adj4Edges[v_t][_i7369]] || -1);
              if (!(((_h7373 && (_h7374 !== -1)) && (_h7375 === 1)))) continue;
              if (!_g7350.includes(v_x)) _g7350.push(v_x);
            }
          }
        }
        const _a7376 = union(_g7343, _g7350);
        for (let _i7377 = 0; _i7377 < _a7376.length; _i7377++) {
          const v_q = _a7376[_i7377];
          if (!((v_q !== _at7337))) continue;
          const _h7379 = clueAt(cl.number, v_q);
          const _h7378 = clueAt(cl.number, _at7337);
          if (!((Math.abs((_h7378 - _h7379)) === cl.step))) {
            _q7339 = false;
            break Q7340;
          }
        }
      }
    }
    if (!(_q7339)) return false;
  }
  for (let _k7380 = 0; _k7380 < cl.wall.at.length; _k7380++) {
    const _at7381 = cl.wall.at[_k7380];
    if (!(((g[_at7381] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const forcedFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
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
              let _c99: boolean = !(throughWhere(sp, v_i, (_te86: number): boolean => {  return ((b.grid[_te86] || -1) === 1); }).includes(v_j));
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
  const _g5447: number[] = [];
  const _g5454: number[] = [];
  const _g5487: number[] = [];
  const _g5494: number[] = [];
  const _g5596: number[] = [];
  const _g5603: number[] = [];
  const _g5636: number[] = [];
  const _g5643: number[] = [];
  const _g5751: number[] = [];
  const _g5758: number[] = [];
  const _g5789: number[] = [];
  const _g5796: number[] = [];
  const _g5898: number[] = [];
  const _g5905: number[] = [];
  const _g5936: number[] = [];
  const _g5943: number[] = [];
  const _g5983: number[] = [];
  const _g6650: number[] = [];
  const _g6657: number[] = [];
  const _g6690: number[] = [];
  const _g6697: number[] = [];
  const _g6799: number[] = [];
  const _g6806: number[] = [];
  const _g6839: number[] = [];
  const _g6846: number[] = [];
  const _g6954: number[] = [];
  const _g6961: number[] = [];
  const _g6992: number[] = [];
  const _g6999: number[] = [];
  const _g7101: number[] = [];
  const _g7108: number[] = [];
  const _g7139: number[] = [];
  const _g7146: number[] = [];
  const _g7189: number[] = [];
  const _g7211: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _h5369 = (cl.step === 0);
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
    const _h5335 = clueAt(cl.number, v_c);
    const _h5336 = (_h5335 !== -1);
    const _h5337 = _h5336;
    const _h5338 = !(_h5337);
    L4774: {
      const v_U = ways(b, sp, cl, v_c);
      const _h4775 = v_U.length;
      if (!((_h4775 === 4))) break L4774;
      const _h7186 = (v_U[0] ?? -1);
      _g4776.length = 0;
      G4777: {
        const _a5328 = v_U;
        for (let _i5329 = 0; _i5329 < _a5328.length; _i5329++) {
          const v_i = _a5328[_i5329];
          const _h5332 = _i5329;
          const _h5333 = (_h5332 === 0);
          const _h5349 = sp.edgeOf(v_c, v_i);
          const _a5330 = v_U;
          for (let _i5331 = 0; _i5331 < _a5330.length; _i5331++) {
            const v_j = _a5330[_i5331];
            let _c5982: boolean = (_h5333 && (_i5331 > 0));
            if (_c5982) {
              let _c5348: boolean = (throughWhere(sp, v_i, (_te5334: number): boolean => {  return ((b.grid[_te5334] || -1) === 1); }).includes(v_j));
              if (!_c5348) {
                let _c5347: boolean = _h5338;
                if (_c5347) {
                  let _q5339 = true;
                  Q5340: {
                    const _a5341 = nearest(b, sp, cl, v_i);
                    for (let _i5342 = 0; _i5342 < _a5341.length; _i5342++) {
                      const v_p = _a5341[_i5342];
                      const _h5345 = clueAt(cl.number, v_p);
                      const _a5343 = nearest(b, sp, cl, v_j);
                      for (let _i5344 = 0; _i5344 < _a5343.length; _i5344++) {
                        const v_q = _a5343[_i5344];
                        const _h5346 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h5345 - _h5346)) === cl.step))) {
                          _q5339 = false;
                          break Q5340;
                        }
                      }
                    }
                  }
                  _c5347 = !(_q5339);
                }
                _c5348 = _c5347;
              }
              let _c5981: boolean = _c5348;
              if (!_c5981) {
                const _wc5350 = _h5349;
                const _wd5351 = 1;
                const _wc5352 = sp.edgeOf(v_c, v_j);
                const _wd5353 = 1;
                let _q5354 = false;
                Q5355: {
                  const _a5357 = throughWhere(sp, v_c, (_te5356: number): boolean => {  return ((_te5356 === _wc5352 ? _wd5353 : (_te5356 === _wc5350 ? _wd5351 : (b.grid[_te5356] || -1))) === 1); });
                  for (let _i5358 = 0; _i5358 < _a5357.length; _i5358++) {
                    const v_t = _a5357[_i5358];
                    let _c5379: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5379) {
                      let _g5359 = 0;
                      G5360: {
                        const _a5361 = sp.adj4[v_t];
                        for (let _i5362 = 0; _i5362 < _a5361.length; _i5362++) {
                          const _t5363 = sp.adj4Edges[v_t][_i5362];
                          if (!(((_t5363 === _wc5352 ? _wd5353 : (_t5363 === _wc5350 ? _wd5351 : (b.grid[_t5363] || -1))) === 1))) continue;
                          _g5359++;
                        }
                      }
                      let _g5364 = 0;
                      G5365: {
                        const _a5366 = setOf(v_t);
                        for (let _i5367 = 0; _i5367 < _a5366.length; _i5367++) {
                          const v_k = _a5366[_i5367];
                          const _h5368 = clueAt(cl.number, v_k);
                          const _h5376 = (_h5368 + 1);
                          let _c5378: boolean = (_h5368 !== -1);
                          if (_c5378) {
                            let _c5377: boolean = (_h5369 || (_h5368 === 1));
                            if (!_c5377) {
                              let _g5370 = 0;
                              G5371: {
                                const _t5372 = (_h5368 + 1);
                                const _a5373 = cluesValued(cl.number, _t5372);
                                for (let _i5374 = 0; _i5374 < _a5373.length; _i5374++) {
                                  const v_x = _a5373[_i5374];
                                  const _h5375 = clueAt(cl.number, v_x);
                                  if (!((_h5375 === _h5376))) continue;
                                  _g5370++;
                                }
                              }
                              _c5377 = (_g5370 === 0);
                            }
                            _c5378 = _c5377;
                          }
                          if (!(_c5378)) continue;
                          _g5364++;
                        }
                      }
                      _c5379 = (_g5359 < (2 - _g5364));
                    }
                    if (!(_c5379)) continue;
                    let _g5380 = 0;
                    G5381: {
                      const _a5382 = sp.adj4[v_t];
                      for (let _i5383 = 0; _i5383 < _a5382.length; _i5383++) {
                        const _t5384 = sp.adj4Edges[v_t][_i5383];
                        if (!(((_t5384 === _wc5352 ? _wd5353 : (_t5384 === _wc5350 ? _wd5351 : (b.grid[_t5384] || -1))) === 1))) continue;
                        _g5380++;
                      }
                    }
                    let _g5385 = 0;
                    G5386: {
                      const _a5387 = setOf(v_t);
                      for (let _i5388 = 0; _i5388 < _a5387.length; _i5388++) {
                        const v_k = _a5387[_i5388];
                        const _h5389 = clueAt(cl.number, v_k);
                        const _h5396 = (_h5389 + 1);
                        let _c5398: boolean = (_h5389 !== -1);
                        if (_c5398) {
                          let _c5397: boolean = (_h5369 || (_h5389 === 1));
                          if (!_c5397) {
                            let _g5390 = 0;
                            G5391: {
                              const _t5392 = (_h5389 + 1);
                              const _a5393 = cluesValued(cl.number, _t5392);
                              for (let _i5394 = 0; _i5394 < _a5393.length; _i5394++) {
                                const v_x = _a5393[_i5394];
                                const _h5395 = clueAt(cl.number, v_x);
                                if (!((_h5395 === _h5396))) continue;
                                _g5390++;
                              }
                            }
                            _c5397 = (_g5390 === 0);
                          }
                          _c5398 = _c5397;
                        }
                        if (!(_c5398)) continue;
                        _g5385++;
                      }
                    }
                    let _c5679: boolean = (_g5380 < (2 - _g5385));
                    if (_c5679) {
                      let _q5399 = false;
                      Q5400: {
                        const _a5401 = sp.adj4[v_t];
                        for (let _i5402 = 0; _i5402 < _a5401.length; _i5402++) {
                          const v_y = _a5401[_i5402];
                          const _t5403 = sp.adj4Edges[v_t][_i5402];
                          let _c5423: boolean = !((_t5403 === _wc5352 ? true : (_t5403 === _wc5350 ? true : (b.grid[_t5403] !== 0))));
                          if (_c5423) {
                            let _g5404 = 0;
                            G5405: {
                              const _a5406 = sp.adj4[v_t];
                              for (let _i5407 = 0; _i5407 < _a5406.length; _i5407++) {
                                const _t5408 = sp.adj4Edges[v_t][_i5407];
                                if (!(((_t5408 === _wc5352 ? _wd5353 : (_t5408 === _wc5350 ? _wd5351 : (b.grid[_t5408] || -1))) === 1))) continue;
                                _g5404++;
                              }
                            }
                            let _g5409 = 0;
                            G5410: {
                              const _a5411 = setOf(v_t);
                              for (let _i5412 = 0; _i5412 < _a5411.length; _i5412++) {
                                const v_k = _a5411[_i5412];
                                const _h5413 = clueAt(cl.number, v_k);
                                const _h5420 = (_h5413 + 1);
                                let _c5422: boolean = (_h5413 !== -1);
                                if (_c5422) {
                                  let _c5421: boolean = (_h5369 || (_h5413 === 1));
                                  if (!_c5421) {
                                    let _g5414 = 0;
                                    G5415: {
                                      const _t5416 = (_h5413 + 1);
                                      const _a5417 = cluesValued(cl.number, _t5416);
                                      for (let _i5418 = 0; _i5418 < _a5417.length; _i5418++) {
                                        const v_x = _a5417[_i5418];
                                        const _h5419 = clueAt(cl.number, v_x);
                                        if (!((_h5419 === _h5420))) continue;
                                        _g5414++;
                                      }
                                    }
                                    _c5421 = (_g5414 === 0);
                                  }
                                  _c5422 = _c5421;
                                }
                                if (!(_c5422)) continue;
                                _g5409++;
                              }
                            }
                            _c5423 = (_g5404 < (2 - _g5409));
                          }
                          let _c5444: boolean = _c5423;
                          if (_c5444) {
                            let _g5424 = 0;
                            G5425: {
                              const _a5427 = sp.adj4[v_y];
                              for (let _i5428 = 0; _i5428 < _a5427.length; _i5428++) {
                                const _t5429 = sp.adj4Edges[v_y][_i5428];
                                if (!(((_t5429 === _wc5352 ? _wd5353 : (_t5429 === _wc5350 ? _wd5351 : (b.grid[_t5429] || -1))) === 1))) continue;
                                _g5424++;
                              }
                            }
                            let _g5430 = 0;
                            G5431: {
                              const _a5432 = setOf(v_y);
                              for (let _i5433 = 0; _i5433 < _a5432.length; _i5433++) {
                                const v_k = _a5432[_i5433];
                                const _h5434 = clueAt(cl.number, v_k);
                                const _h5441 = (_h5434 + 1);
                                let _c5443: boolean = (_h5434 !== -1);
                                if (_c5443) {
                                  let _c5442: boolean = (_h5369 || (_h5434 === 1));
                                  if (!_c5442) {
                                    let _g5435 = 0;
                                    G5436: {
                                      const _t5437 = (_h5434 + 1);
                                      const _a5438 = cluesValued(cl.number, _t5437);
                                      for (let _i5439 = 0; _i5439 < _a5438.length; _i5439++) {
                                        const v_x = _a5438[_i5439];
                                        const _h5440 = clueAt(cl.number, v_x);
                                        if (!((_h5440 === _h5441))) continue;
                                        _g5435++;
                                      }
                                    }
                                    _c5442 = (_g5435 === 0);
                                  }
                                  _c5443 = _c5442;
                                }
                                if (!(_c5443)) continue;
                                _g5430++;
                              }
                            }
                            _c5444 = (_g5424 < (2 - _g5430));
                          }
                          let _c5527: boolean = _c5444;
                          if (_c5527) {
                            let _q5445 = true;
                            Q5446: {
                              _g5447.length = 0;
                              G5448: {
                                const _a5451 = setOf(v_t);
                                for (let _i5452 = 0; _i5452 < _a5451.length; _i5452++) {
                                  const v_x = _a5451[_i5452];
                                  const _h5453 = clueAt(cl.number, v_x);
                                  if (!((_h5453 !== -1))) continue;
                                  _g5447.push(v_x);
                                }
                              }
                              _g5454.length = 0;
                              G5455: {
                                const _a5474 = throughWhere(sp, v_t, (_te5469: number): boolean => { let _c5471: boolean = ((_te5469 === _wc5352 ? _wd5353 : (_te5469 === _wc5350 ? _wd5351 : (b.grid[_te5469] || -1))) === 1); if (_c5471) {   const _t5470 = sp.edgeEnds[2 * _te5469];   _c5471 = !((clueAt(cl.number, _t5470) !== -1)); } let _c5473: boolean = _c5471; if (_c5473) {   const _t5472 = sp.edgeEnds[2 * _te5469 + 1];   _c5473 = !((clueAt(cl.number, _t5472) !== -1)); } return _c5473; });
                                for (let _i5475 = 0; _i5475 < _a5474.length; _i5475++) {
                                  const v_t_5468 = _a5474[_i5475];
                                  const _h5478 = clueAt(cl.number, v_t_5468);
                                  const _h5479 = (_h5478 !== -1);
                                  const _h5480 = _h5479;
                                  const _h5481 = !(_h5480);
                                  const _a5476 = sp.adj4[v_t_5468];
                                  for (let _i5477 = 0; _i5477 < _a5476.length; _i5477++) {
                                    const v_x = _a5476[_i5477];
                                    const _h5482 = clueAt(cl.number, v_x);
                                    let _c5484: boolean = (_h5481 && (_h5482 !== -1));
                                    if (_c5484) {
                                      const _t5483 = sp.adj4Edges[v_t_5468][_i5477];
                                      _c5484 = ((_t5483 === _wc5352 ? _wd5353 : (_t5483 === _wc5350 ? _wd5351 : (b.grid[_t5483] || -1))) === 1);
                                    }
                                    if (!(_c5484)) continue;
                                    if (!_g5454.includes(v_x)) _g5454.push(v_x);
                                  }
                                }
                              }
                              const _a5485 = union(_g5447, _g5454);
                              for (let _i5486 = 0; _i5486 < _a5485.length; _i5486++) {
                                const v_p = _a5485[_i5486];
                                const _h5525 = clueAt(cl.number, v_p);
                                _g5487.length = 0;
                                G5488: {
                                  const _a5491 = setOf(v_y);
                                  for (let _i5492 = 0; _i5492 < _a5491.length; _i5492++) {
                                    const v_x = _a5491[_i5492];
                                    const _h5493 = clueAt(cl.number, v_x);
                                    if (!((_h5493 !== -1))) continue;
                                    _g5487.push(v_x);
                                  }
                                }
                                _g5494.length = 0;
                                G5495: {
                                  const _a5512 = throughWhere(sp, v_y, (_te5507: number): boolean => { let _c5509: boolean = ((_te5507 === _wc5352 ? _wd5353 : (_te5507 === _wc5350 ? _wd5351 : (b.grid[_te5507] || -1))) === 1); if (_c5509) {   const _t5508 = sp.edgeEnds[2 * _te5507];   _c5509 = !((clueAt(cl.number, _t5508) !== -1)); } let _c5511: boolean = _c5509; if (_c5511) {   const _t5510 = sp.edgeEnds[2 * _te5507 + 1];   _c5511 = !((clueAt(cl.number, _t5510) !== -1)); } return _c5511; });
                                  for (let _i5513 = 0; _i5513 < _a5512.length; _i5513++) {
                                    const v_t = _a5512[_i5513];
                                    const _h5516 = clueAt(cl.number, v_t);
                                    const _h5517 = (_h5516 !== -1);
                                    const _h5518 = _h5517;
                                    const _h5519 = !(_h5518);
                                    const _a5514 = sp.adj4[v_t];
                                    for (let _i5515 = 0; _i5515 < _a5514.length; _i5515++) {
                                      const v_x = _a5514[_i5515];
                                      const _h5520 = clueAt(cl.number, v_x);
                                      let _c5522: boolean = (_h5519 && (_h5520 !== -1));
                                      if (_c5522) {
                                        const _t5521 = sp.adj4Edges[v_t][_i5515];
                                        _c5522 = ((_t5521 === _wc5352 ? _wd5353 : (_t5521 === _wc5350 ? _wd5351 : (b.grid[_t5521] || -1))) === 1);
                                      }
                                      if (!(_c5522)) continue;
                                      if (!_g5494.includes(v_x)) _g5494.push(v_x);
                                    }
                                  }
                                }
                                const _a5523 = union(_g5487, _g5494);
                                for (let _i5524 = 0; _i5524 < _a5523.length; _i5524++) {
                                  const v_q = _a5523[_i5524];
                                  const _h5526 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h5525 - _h5526)) === cl.step))) {
                                    _q5445 = false;
                                    break Q5446;
                                  }
                                }
                              }
                            }
                            _c5527 = _q5445;
                          }
                          if (!((_c5527 && (_h5369 || !(throughWhere(sp, v_t, (_te5528: number): boolean => {  return ((_te5528 === _wc5352 ? _wd5353 : (_te5528 === _wc5350 ? _wd5351 : (b.grid[_te5528] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g5529 = 0;
                          G5530: {
                            const _a5531 = sp.adj4[v_t];
                            for (let _i5532 = 0; _i5532 < _a5531.length; _i5532++) {
                              const _t5533 = sp.adj4Edges[v_t][_i5532];
                              if (!(((_t5533 === _wc5352 ? _wd5353 : (_t5533 === _wc5350 ? _wd5351 : (b.grid[_t5533] || -1))) === 1))) continue;
                              _g5529++;
                            }
                          }
                          let _g5534 = 0;
                          G5535: {
                            const _a5536 = setOf(v_t);
                            for (let _i5537 = 0; _i5537 < _a5536.length; _i5537++) {
                              const v_k = _a5536[_i5537];
                              const _h5538 = clueAt(cl.number, v_k);
                              const _h5545 = (_h5538 + 1);
                              let _c5547: boolean = (_h5538 !== -1);
                              if (_c5547) {
                                let _c5546: boolean = (_h5369 || (_h5538 === 1));
                                if (!_c5546) {
                                  let _g5539 = 0;
                                  G5540: {
                                    const _t5541 = (_h5538 + 1);
                                    const _a5542 = cluesValued(cl.number, _t5541);
                                    for (let _i5543 = 0; _i5543 < _a5542.length; _i5543++) {
                                      const v_x = _a5542[_i5543];
                                      const _h5544 = clueAt(cl.number, v_x);
                                      if (!((_h5544 === _h5545))) continue;
                                      _g5539++;
                                    }
                                  }
                                  _c5546 = (_g5539 === 0);
                                }
                                _c5547 = _c5546;
                              }
                              if (!(_c5547)) continue;
                              _g5534++;
                            }
                          }
                          let _c5678: boolean = ((_g5529 + 1) === (2 - _g5534));
                          if (!_c5678) {
                            let _q5548 = false;
                            Q5549: {
                              const _a5550 = sp.adj4[v_t];
                              const _n5551 = _i5402;
                              for (let _i5552 = 0; _i5552 < _n5551; _i5552++) {
                                const v_z = _a5550[_i5552];
                                const _t5553 = sp.adj4Edges[v_t][_i5552];
                                let _c5573: boolean = !((_t5553 === _wc5352 ? true : (_t5553 === _wc5350 ? true : (b.grid[_t5553] !== 0))));
                                if (_c5573) {
                                  let _g5554 = 0;
                                  G5555: {
                                    const _a5556 = sp.adj4[v_t];
                                    for (let _i5557 = 0; _i5557 < _a5556.length; _i5557++) {
                                      const _t5558 = sp.adj4Edges[v_t][_i5557];
                                      if (!(((_t5558 === _wc5352 ? _wd5353 : (_t5558 === _wc5350 ? _wd5351 : (b.grid[_t5558] || -1))) === 1))) continue;
                                      _g5554++;
                                    }
                                  }
                                  let _g5559 = 0;
                                  G5560: {
                                    const _a5561 = setOf(v_t);
                                    for (let _i5562 = 0; _i5562 < _a5561.length; _i5562++) {
                                      const v_k = _a5561[_i5562];
                                      const _h5563 = clueAt(cl.number, v_k);
                                      const _h5570 = (_h5563 + 1);
                                      let _c5572: boolean = (_h5563 !== -1);
                                      if (_c5572) {
                                        let _c5571: boolean = (_h5369 || (_h5563 === 1));
                                        if (!_c5571) {
                                          let _g5564 = 0;
                                          G5565: {
                                            const _t5566 = (_h5563 + 1);
                                            const _a5567 = cluesValued(cl.number, _t5566);
                                            for (let _i5568 = 0; _i5568 < _a5567.length; _i5568++) {
                                              const v_x = _a5567[_i5568];
                                              const _h5569 = clueAt(cl.number, v_x);
                                              if (!((_h5569 === _h5570))) continue;
                                              _g5564++;
                                            }
                                          }
                                          _c5571 = (_g5564 === 0);
                                        }
                                        _c5572 = _c5571;
                                      }
                                      if (!(_c5572)) continue;
                                      _g5559++;
                                    }
                                  }
                                  _c5573 = (_g5554 < (2 - _g5559));
                                }
                                let _c5593: boolean = _c5573;
                                if (_c5593) {
                                  let _g5574 = 0;
                                  G5575: {
                                    const _a5576 = sp.adj4[v_z];
                                    for (let _i5577 = 0; _i5577 < _a5576.length; _i5577++) {
                                      const _t5578 = sp.adj4Edges[v_z][_i5577];
                                      if (!(((_t5578 === _wc5352 ? _wd5353 : (_t5578 === _wc5350 ? _wd5351 : (b.grid[_t5578] || -1))) === 1))) continue;
                                      _g5574++;
                                    }
                                  }
                                  let _g5579 = 0;
                                  G5580: {
                                    const _a5581 = setOf(v_z);
                                    for (let _i5582 = 0; _i5582 < _a5581.length; _i5582++) {
                                      const v_k = _a5581[_i5582];
                                      const _h5583 = clueAt(cl.number, v_k);
                                      const _h5590 = (_h5583 + 1);
                                      let _c5592: boolean = (_h5583 !== -1);
                                      if (_c5592) {
                                        let _c5591: boolean = (_h5369 || (_h5583 === 1));
                                        if (!_c5591) {
                                          let _g5584 = 0;
                                          G5585: {
                                            const _t5586 = (_h5583 + 1);
                                            const _a5587 = cluesValued(cl.number, _t5586);
                                            for (let _i5588 = 0; _i5588 < _a5587.length; _i5588++) {
                                              const v_x = _a5587[_i5588];
                                              const _h5589 = clueAt(cl.number, v_x);
                                              if (!((_h5589 === _h5590))) continue;
                                              _g5584++;
                                            }
                                          }
                                          _c5591 = (_g5584 === 0);
                                        }
                                        _c5592 = _c5591;
                                      }
                                      if (!(_c5592)) continue;
                                      _g5579++;
                                    }
                                  }
                                  _c5593 = (_g5574 < (2 - _g5579));
                                }
                                let _c5676: boolean = _c5593;
                                if (_c5676) {
                                  let _q5594 = true;
                                  Q5595: {
                                    _g5596.length = 0;
                                    G5597: {
                                      const _a5600 = setOf(v_t);
                                      for (let _i5601 = 0; _i5601 < _a5600.length; _i5601++) {
                                        const v_x = _a5600[_i5601];
                                        const _h5602 = clueAt(cl.number, v_x);
                                        if (!((_h5602 !== -1))) continue;
                                        _g5596.push(v_x);
                                      }
                                    }
                                    _g5603.length = 0;
                                    G5604: {
                                      const _a5623 = throughWhere(sp, v_t, (_te5618: number): boolean => { let _c5620: boolean = ((_te5618 === _wc5352 ? _wd5353 : (_te5618 === _wc5350 ? _wd5351 : (b.grid[_te5618] || -1))) === 1); if (_c5620) {   const _t5619 = sp.edgeEnds[2 * _te5618];   _c5620 = !((clueAt(cl.number, _t5619) !== -1)); } let _c5622: boolean = _c5620; if (_c5622) {   const _t5621 = sp.edgeEnds[2 * _te5618 + 1];   _c5622 = !((clueAt(cl.number, _t5621) !== -1)); } return _c5622; });
                                      for (let _i5624 = 0; _i5624 < _a5623.length; _i5624++) {
                                        const v_t_5617 = _a5623[_i5624];
                                        const _h5627 = clueAt(cl.number, v_t_5617);
                                        const _h5628 = (_h5627 !== -1);
                                        const _h5629 = _h5628;
                                        const _h5630 = !(_h5629);
                                        const _a5625 = sp.adj4[v_t_5617];
                                        for (let _i5626 = 0; _i5626 < _a5625.length; _i5626++) {
                                          const v_x = _a5625[_i5626];
                                          const _h5631 = clueAt(cl.number, v_x);
                                          let _c5633: boolean = (_h5630 && (_h5631 !== -1));
                                          if (_c5633) {
                                            const _t5632 = sp.adj4Edges[v_t_5617][_i5626];
                                            _c5633 = ((_t5632 === _wc5352 ? _wd5353 : (_t5632 === _wc5350 ? _wd5351 : (b.grid[_t5632] || -1))) === 1);
                                          }
                                          if (!(_c5633)) continue;
                                          if (!_g5603.includes(v_x)) _g5603.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5634 = union(_g5596, _g5603);
                                    for (let _i5635 = 0; _i5635 < _a5634.length; _i5635++) {
                                      const v_p = _a5634[_i5635];
                                      const _h5674 = clueAt(cl.number, v_p);
                                      _g5636.length = 0;
                                      G5637: {
                                        const _a5640 = setOf(v_z);
                                        for (let _i5641 = 0; _i5641 < _a5640.length; _i5641++) {
                                          const v_x = _a5640[_i5641];
                                          const _h5642 = clueAt(cl.number, v_x);
                                          if (!((_h5642 !== -1))) continue;
                                          _g5636.push(v_x);
                                        }
                                      }
                                      _g5643.length = 0;
                                      G5644: {
                                        const _a5661 = throughWhere(sp, v_z, (_te5656: number): boolean => { let _c5658: boolean = ((_te5656 === _wc5352 ? _wd5353 : (_te5656 === _wc5350 ? _wd5351 : (b.grid[_te5656] || -1))) === 1); if (_c5658) {   const _t5657 = sp.edgeEnds[2 * _te5656];   _c5658 = !((clueAt(cl.number, _t5657) !== -1)); } let _c5660: boolean = _c5658; if (_c5660) {   const _t5659 = sp.edgeEnds[2 * _te5656 + 1];   _c5660 = !((clueAt(cl.number, _t5659) !== -1)); } return _c5660; });
                                        for (let _i5662 = 0; _i5662 < _a5661.length; _i5662++) {
                                          const v_t = _a5661[_i5662];
                                          const _h5665 = clueAt(cl.number, v_t);
                                          const _h5666 = (_h5665 !== -1);
                                          const _h5667 = _h5666;
                                          const _h5668 = !(_h5667);
                                          const _a5663 = sp.adj4[v_t];
                                          for (let _i5664 = 0; _i5664 < _a5663.length; _i5664++) {
                                            const v_x = _a5663[_i5664];
                                            const _h5669 = clueAt(cl.number, v_x);
                                            let _c5671: boolean = (_h5668 && (_h5669 !== -1));
                                            if (_c5671) {
                                              const _t5670 = sp.adj4Edges[v_t][_i5664];
                                              _c5671 = ((_t5670 === _wc5352 ? _wd5353 : (_t5670 === _wc5350 ? _wd5351 : (b.grid[_t5670] || -1))) === 1);
                                            }
                                            if (!(_c5671)) continue;
                                            if (!_g5643.includes(v_x)) _g5643.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5672 = union(_g5636, _g5643);
                                      for (let _i5673 = 0; _i5673 < _a5672.length; _i5673++) {
                                        const v_q = _a5672[_i5673];
                                        const _h5675 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5674 - _h5675)) === cl.step))) {
                                          _q5594 = false;
                                          break Q5595;
                                        }
                                      }
                                    }
                                  }
                                  _c5676 = _q5594;
                                }
                                if ((_c5676 && (_h5369 || !(throughWhere(sp, v_t, (_te5677: number): boolean => {  return ((_te5677 === _wc5352 ? _wd5353 : (_te5677 === _wc5350 ? _wd5351 : (b.grid[_te5677] || -1))) === 1); }).includes(v_z))))) {
                                  _q5548 = true;
                                  break Q5549;
                                }
                              }
                            }
                            _c5678 = _q5548;
                          }
                          if (_c5678) {
                            _q5399 = true;
                            break Q5400;
                          }
                        }
                      }
                      _c5679 = !(_q5399);
                    }
                    let _c5980: boolean = _c5679;
                    if (!_c5980) {
                      let _q5680 = false;
                      Q5681: {
                        const _a5682 = sp.adj4[v_t];
                        for (let _i5683 = 0; _i5683 < _a5682.length; _i5683++) {
                          const v_s = _a5682[_i5683];
                          let _g5684 = 0;
                          G5685: {
                            const _a5686 = sp.adj4[v_s];
                            for (let _i5687 = 0; _i5687 < _a5686.length; _i5687++) {
                              const _t5688 = sp.adj4Edges[v_s][_i5687];
                              if (!(((_t5688 === _wc5352 ? _wd5353 : (_t5688 === _wc5350 ? _wd5351 : (b.grid[_t5688] || -1))) === 1))) continue;
                              _g5684++;
                            }
                          }
                          let _g5689 = 0;
                          G5690: {
                            const _a5691 = setOf(v_s);
                            for (let _i5692 = 0; _i5692 < _a5691.length; _i5692++) {
                              const v_k = _a5691[_i5692];
                              const _h5693 = clueAt(cl.number, v_k);
                              const _h5700 = (_h5693 + 1);
                              let _c5702: boolean = (_h5693 !== -1);
                              if (_c5702) {
                                let _c5701: boolean = (_h5369 || (_h5693 === 1));
                                if (!_c5701) {
                                  let _g5694 = 0;
                                  G5695: {
                                    const _t5696 = (_h5693 + 1);
                                    const _a5697 = cluesValued(cl.number, _t5696);
                                    for (let _i5698 = 0; _i5698 < _a5697.length; _i5698++) {
                                      const v_x = _a5697[_i5698];
                                      const _h5699 = clueAt(cl.number, v_x);
                                      if (!((_h5699 === _h5700))) continue;
                                      _g5694++;
                                    }
                                  }
                                  _c5701 = (_g5694 === 0);
                                }
                                _c5702 = _c5701;
                              }
                              if (!(_c5702)) continue;
                              _g5689++;
                            }
                          }
                          let _c5979: boolean = (_g5684 < (2 - _g5689));
                          if (_c5979) {
                            let _q5703 = false;
                            Q5704: {
                              const _a5705 = sp.adj4[v_s];
                              for (let _i5706 = 0; _i5706 < _a5705.length; _i5706++) {
                                const v_y = _a5705[_i5706];
                                const _t5707 = sp.adj4Edges[v_s][_i5706];
                                let _c5727: boolean = !((_t5707 === _wc5352 ? true : (_t5707 === _wc5350 ? true : (b.grid[_t5707] !== 0))));
                                if (_c5727) {
                                  let _g5708 = 0;
                                  G5709: {
                                    const _a5710 = sp.adj4[v_s];
                                    for (let _i5711 = 0; _i5711 < _a5710.length; _i5711++) {
                                      const _t5712 = sp.adj4Edges[v_s][_i5711];
                                      if (!(((_t5712 === _wc5352 ? _wd5353 : (_t5712 === _wc5350 ? _wd5351 : (b.grid[_t5712] || -1))) === 1))) continue;
                                      _g5708++;
                                    }
                                  }
                                  let _g5713 = 0;
                                  G5714: {
                                    const _a5715 = setOf(v_s);
                                    for (let _i5716 = 0; _i5716 < _a5715.length; _i5716++) {
                                      const v_k = _a5715[_i5716];
                                      const _h5717 = clueAt(cl.number, v_k);
                                      const _h5724 = (_h5717 + 1);
                                      let _c5726: boolean = (_h5717 !== -1);
                                      if (_c5726) {
                                        let _c5725: boolean = (_h5369 || (_h5717 === 1));
                                        if (!_c5725) {
                                          let _g5718 = 0;
                                          G5719: {
                                            const _t5720 = (_h5717 + 1);
                                            const _a5721 = cluesValued(cl.number, _t5720);
                                            for (let _i5722 = 0; _i5722 < _a5721.length; _i5722++) {
                                              const v_x = _a5721[_i5722];
                                              const _h5723 = clueAt(cl.number, v_x);
                                              if (!((_h5723 === _h5724))) continue;
                                              _g5718++;
                                            }
                                          }
                                          _c5725 = (_g5718 === 0);
                                        }
                                        _c5726 = _c5725;
                                      }
                                      if (!(_c5726)) continue;
                                      _g5713++;
                                    }
                                  }
                                  _c5727 = (_g5708 < (2 - _g5713));
                                }
                                let _c5748: boolean = _c5727;
                                if (_c5748) {
                                  let _g5728 = 0;
                                  G5729: {
                                    const _a5731 = sp.adj4[v_y];
                                    for (let _i5732 = 0; _i5732 < _a5731.length; _i5732++) {
                                      const _t5733 = sp.adj4Edges[v_y][_i5732];
                                      if (!(((_t5733 === _wc5352 ? _wd5353 : (_t5733 === _wc5350 ? _wd5351 : (b.grid[_t5733] || -1))) === 1))) continue;
                                      _g5728++;
                                    }
                                  }
                                  let _g5734 = 0;
                                  G5735: {
                                    const _a5736 = setOf(v_y);
                                    for (let _i5737 = 0; _i5737 < _a5736.length; _i5737++) {
                                      const v_k = _a5736[_i5737];
                                      const _h5738 = clueAt(cl.number, v_k);
                                      const _h5745 = (_h5738 + 1);
                                      let _c5747: boolean = (_h5738 !== -1);
                                      if (_c5747) {
                                        let _c5746: boolean = (_h5369 || (_h5738 === 1));
                                        if (!_c5746) {
                                          let _g5739 = 0;
                                          G5740: {
                                            const _t5741 = (_h5738 + 1);
                                            const _a5742 = cluesValued(cl.number, _t5741);
                                            for (let _i5743 = 0; _i5743 < _a5742.length; _i5743++) {
                                              const v_x = _a5742[_i5743];
                                              const _h5744 = clueAt(cl.number, v_x);
                                              if (!((_h5744 === _h5745))) continue;
                                              _g5739++;
                                            }
                                          }
                                          _c5746 = (_g5739 === 0);
                                        }
                                        _c5747 = _c5746;
                                      }
                                      if (!(_c5747)) continue;
                                      _g5734++;
                                    }
                                  }
                                  _c5748 = (_g5728 < (2 - _g5734));
                                }
                                let _c5829: boolean = _c5748;
                                if (_c5829) {
                                  let _q5749 = true;
                                  Q5750: {
                                    _g5751.length = 0;
                                    G5752: {
                                      const _a5755 = setOf(v_s);
                                      for (let _i5756 = 0; _i5756 < _a5755.length; _i5756++) {
                                        const v_x = _a5755[_i5756];
                                        const _h5757 = clueAt(cl.number, v_x);
                                        if (!((_h5757 !== -1))) continue;
                                        _g5751.push(v_x);
                                      }
                                    }
                                    _g5758.length = 0;
                                    G5759: {
                                      const _a5776 = throughWhere(sp, v_s, (_te5771: number): boolean => { let _c5773: boolean = ((_te5771 === _wc5352 ? _wd5353 : (_te5771 === _wc5350 ? _wd5351 : (b.grid[_te5771] || -1))) === 1); if (_c5773) {   const _t5772 = sp.edgeEnds[2 * _te5771];   _c5773 = !((clueAt(cl.number, _t5772) !== -1)); } let _c5775: boolean = _c5773; if (_c5775) {   const _t5774 = sp.edgeEnds[2 * _te5771 + 1];   _c5775 = !((clueAt(cl.number, _t5774) !== -1)); } return _c5775; });
                                      for (let _i5777 = 0; _i5777 < _a5776.length; _i5777++) {
                                        const v_t = _a5776[_i5777];
                                        const _h5780 = clueAt(cl.number, v_t);
                                        const _h5781 = (_h5780 !== -1);
                                        const _h5782 = _h5781;
                                        const _h5783 = !(_h5782);
                                        const _a5778 = sp.adj4[v_t];
                                        for (let _i5779 = 0; _i5779 < _a5778.length; _i5779++) {
                                          const v_x = _a5778[_i5779];
                                          const _h5784 = clueAt(cl.number, v_x);
                                          let _c5786: boolean = (_h5783 && (_h5784 !== -1));
                                          if (_c5786) {
                                            const _t5785 = sp.adj4Edges[v_t][_i5779];
                                            _c5786 = ((_t5785 === _wc5352 ? _wd5353 : (_t5785 === _wc5350 ? _wd5351 : (b.grid[_t5785] || -1))) === 1);
                                          }
                                          if (!(_c5786)) continue;
                                          if (!_g5758.includes(v_x)) _g5758.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5787 = union(_g5751, _g5758);
                                    for (let _i5788 = 0; _i5788 < _a5787.length; _i5788++) {
                                      const v_p = _a5787[_i5788];
                                      const _h5827 = clueAt(cl.number, v_p);
                                      _g5789.length = 0;
                                      G5790: {
                                        const _a5793 = setOf(v_y);
                                        for (let _i5794 = 0; _i5794 < _a5793.length; _i5794++) {
                                          const v_x = _a5793[_i5794];
                                          const _h5795 = clueAt(cl.number, v_x);
                                          if (!((_h5795 !== -1))) continue;
                                          _g5789.push(v_x);
                                        }
                                      }
                                      _g5796.length = 0;
                                      G5797: {
                                        const _a5814 = throughWhere(sp, v_y, (_te5809: number): boolean => { let _c5811: boolean = ((_te5809 === _wc5352 ? _wd5353 : (_te5809 === _wc5350 ? _wd5351 : (b.grid[_te5809] || -1))) === 1); if (_c5811) {   const _t5810 = sp.edgeEnds[2 * _te5809];   _c5811 = !((clueAt(cl.number, _t5810) !== -1)); } let _c5813: boolean = _c5811; if (_c5813) {   const _t5812 = sp.edgeEnds[2 * _te5809 + 1];   _c5813 = !((clueAt(cl.number, _t5812) !== -1)); } return _c5813; });
                                        for (let _i5815 = 0; _i5815 < _a5814.length; _i5815++) {
                                          const v_t = _a5814[_i5815];
                                          const _h5818 = clueAt(cl.number, v_t);
                                          const _h5819 = (_h5818 !== -1);
                                          const _h5820 = _h5819;
                                          const _h5821 = !(_h5820);
                                          const _a5816 = sp.adj4[v_t];
                                          for (let _i5817 = 0; _i5817 < _a5816.length; _i5817++) {
                                            const v_x = _a5816[_i5817];
                                            const _h5822 = clueAt(cl.number, v_x);
                                            let _c5824: boolean = (_h5821 && (_h5822 !== -1));
                                            if (_c5824) {
                                              const _t5823 = sp.adj4Edges[v_t][_i5817];
                                              _c5824 = ((_t5823 === _wc5352 ? _wd5353 : (_t5823 === _wc5350 ? _wd5351 : (b.grid[_t5823] || -1))) === 1);
                                            }
                                            if (!(_c5824)) continue;
                                            if (!_g5796.includes(v_x)) _g5796.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5825 = union(_g5789, _g5796);
                                      for (let _i5826 = 0; _i5826 < _a5825.length; _i5826++) {
                                        const v_q = _a5825[_i5826];
                                        const _h5828 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5827 - _h5828)) === cl.step))) {
                                          _q5749 = false;
                                          break Q5750;
                                        }
                                      }
                                    }
                                  }
                                  _c5829 = _q5749;
                                }
                                if (!((_c5829 && (_h5369 || !(throughWhere(sp, v_s, (_te5830: number): boolean => {  return ((_te5830 === _wc5352 ? _wd5353 : (_te5830 === _wc5350 ? _wd5351 : (b.grid[_te5830] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g5831 = 0;
                                G5832: {
                                  const _a5833 = sp.adj4[v_s];
                                  for (let _i5834 = 0; _i5834 < _a5833.length; _i5834++) {
                                    const _t5835 = sp.adj4Edges[v_s][_i5834];
                                    if (!(((_t5835 === _wc5352 ? _wd5353 : (_t5835 === _wc5350 ? _wd5351 : (b.grid[_t5835] || -1))) === 1))) continue;
                                    _g5831++;
                                  }
                                }
                                let _g5836 = 0;
                                G5837: {
                                  const _a5838 = setOf(v_s);
                                  for (let _i5839 = 0; _i5839 < _a5838.length; _i5839++) {
                                    const v_k = _a5838[_i5839];
                                    const _h5840 = clueAt(cl.number, v_k);
                                    const _h5847 = (_h5840 + 1);
                                    let _c5849: boolean = (_h5840 !== -1);
                                    if (_c5849) {
                                      let _c5848: boolean = (_h5369 || (_h5840 === 1));
                                      if (!_c5848) {
                                        let _g5841 = 0;
                                        G5842: {
                                          const _t5843 = (_h5840 + 1);
                                          const _a5844 = cluesValued(cl.number, _t5843);
                                          for (let _i5845 = 0; _i5845 < _a5844.length; _i5845++) {
                                            const v_x = _a5844[_i5845];
                                            const _h5846 = clueAt(cl.number, v_x);
                                            if (!((_h5846 === _h5847))) continue;
                                            _g5841++;
                                          }
                                        }
                                        _c5848 = (_g5841 === 0);
                                      }
                                      _c5849 = _c5848;
                                    }
                                    if (!(_c5849)) continue;
                                    _g5836++;
                                  }
                                }
                                let _c5978: boolean = ((_g5831 + 1) === (2 - _g5836));
                                if (!_c5978) {
                                  let _q5850 = false;
                                  Q5851: {
                                    const _a5852 = sp.adj4[v_s];
                                    const _n5853 = _i5706;
                                    for (let _i5854 = 0; _i5854 < _n5853; _i5854++) {
                                      const v_z = _a5852[_i5854];
                                      const _t5855 = sp.adj4Edges[v_s][_i5854];
                                      let _c5875: boolean = !((_t5855 === _wc5352 ? true : (_t5855 === _wc5350 ? true : (b.grid[_t5855] !== 0))));
                                      if (_c5875) {
                                        let _g5856 = 0;
                                        G5857: {
                                          const _a5858 = sp.adj4[v_s];
                                          for (let _i5859 = 0; _i5859 < _a5858.length; _i5859++) {
                                            const _t5860 = sp.adj4Edges[v_s][_i5859];
                                            if (!(((_t5860 === _wc5352 ? _wd5353 : (_t5860 === _wc5350 ? _wd5351 : (b.grid[_t5860] || -1))) === 1))) continue;
                                            _g5856++;
                                          }
                                        }
                                        let _g5861 = 0;
                                        G5862: {
                                          const _a5863 = setOf(v_s);
                                          for (let _i5864 = 0; _i5864 < _a5863.length; _i5864++) {
                                            const v_k = _a5863[_i5864];
                                            const _h5865 = clueAt(cl.number, v_k);
                                            const _h5872 = (_h5865 + 1);
                                            let _c5874: boolean = (_h5865 !== -1);
                                            if (_c5874) {
                                              let _c5873: boolean = (_h5369 || (_h5865 === 1));
                                              if (!_c5873) {
                                                let _g5866 = 0;
                                                G5867: {
                                                  const _t5868 = (_h5865 + 1);
                                                  const _a5869 = cluesValued(cl.number, _t5868);
                                                  for (let _i5870 = 0; _i5870 < _a5869.length; _i5870++) {
                                                    const v_x = _a5869[_i5870];
                                                    const _h5871 = clueAt(cl.number, v_x);
                                                    if (!((_h5871 === _h5872))) continue;
                                                    _g5866++;
                                                  }
                                                }
                                                _c5873 = (_g5866 === 0);
                                              }
                                              _c5874 = _c5873;
                                            }
                                            if (!(_c5874)) continue;
                                            _g5861++;
                                          }
                                        }
                                        _c5875 = (_g5856 < (2 - _g5861));
                                      }
                                      let _c5895: boolean = _c5875;
                                      if (_c5895) {
                                        let _g5876 = 0;
                                        G5877: {
                                          const _a5878 = sp.adj4[v_z];
                                          for (let _i5879 = 0; _i5879 < _a5878.length; _i5879++) {
                                            const _t5880 = sp.adj4Edges[v_z][_i5879];
                                            if (!(((_t5880 === _wc5352 ? _wd5353 : (_t5880 === _wc5350 ? _wd5351 : (b.grid[_t5880] || -1))) === 1))) continue;
                                            _g5876++;
                                          }
                                        }
                                        let _g5881 = 0;
                                        G5882: {
                                          const _a5883 = setOf(v_z);
                                          for (let _i5884 = 0; _i5884 < _a5883.length; _i5884++) {
                                            const v_k = _a5883[_i5884];
                                            const _h5885 = clueAt(cl.number, v_k);
                                            const _h5892 = (_h5885 + 1);
                                            let _c5894: boolean = (_h5885 !== -1);
                                            if (_c5894) {
                                              let _c5893: boolean = (_h5369 || (_h5885 === 1));
                                              if (!_c5893) {
                                                let _g5886 = 0;
                                                G5887: {
                                                  const _t5888 = (_h5885 + 1);
                                                  const _a5889 = cluesValued(cl.number, _t5888);
                                                  for (let _i5890 = 0; _i5890 < _a5889.length; _i5890++) {
                                                    const v_x = _a5889[_i5890];
                                                    const _h5891 = clueAt(cl.number, v_x);
                                                    if (!((_h5891 === _h5892))) continue;
                                                    _g5886++;
                                                  }
                                                }
                                                _c5893 = (_g5886 === 0);
                                              }
                                              _c5894 = _c5893;
                                            }
                                            if (!(_c5894)) continue;
                                            _g5881++;
                                          }
                                        }
                                        _c5895 = (_g5876 < (2 - _g5881));
                                      }
                                      let _c5976: boolean = _c5895;
                                      if (_c5976) {
                                        let _q5896 = true;
                                        Q5897: {
                                          _g5898.length = 0;
                                          G5899: {
                                            const _a5902 = setOf(v_s);
                                            for (let _i5903 = 0; _i5903 < _a5902.length; _i5903++) {
                                              const v_x = _a5902[_i5903];
                                              const _h5904 = clueAt(cl.number, v_x);
                                              if (!((_h5904 !== -1))) continue;
                                              _g5898.push(v_x);
                                            }
                                          }
                                          _g5905.length = 0;
                                          G5906: {
                                            const _a5923 = throughWhere(sp, v_s, (_te5918: number): boolean => { let _c5920: boolean = ((_te5918 === _wc5352 ? _wd5353 : (_te5918 === _wc5350 ? _wd5351 : (b.grid[_te5918] || -1))) === 1); if (_c5920) {   const _t5919 = sp.edgeEnds[2 * _te5918];   _c5920 = !((clueAt(cl.number, _t5919) !== -1)); } let _c5922: boolean = _c5920; if (_c5922) {   const _t5921 = sp.edgeEnds[2 * _te5918 + 1];   _c5922 = !((clueAt(cl.number, _t5921) !== -1)); } return _c5922; });
                                            for (let _i5924 = 0; _i5924 < _a5923.length; _i5924++) {
                                              const v_t = _a5923[_i5924];
                                              const _h5927 = clueAt(cl.number, v_t);
                                              const _h5928 = (_h5927 !== -1);
                                              const _h5929 = _h5928;
                                              const _h5930 = !(_h5929);
                                              const _a5925 = sp.adj4[v_t];
                                              for (let _i5926 = 0; _i5926 < _a5925.length; _i5926++) {
                                                const v_x = _a5925[_i5926];
                                                const _h5931 = clueAt(cl.number, v_x);
                                                let _c5933: boolean = (_h5930 && (_h5931 !== -1));
                                                if (_c5933) {
                                                  const _t5932 = sp.adj4Edges[v_t][_i5926];
                                                  _c5933 = ((_t5932 === _wc5352 ? _wd5353 : (_t5932 === _wc5350 ? _wd5351 : (b.grid[_t5932] || -1))) === 1);
                                                }
                                                if (!(_c5933)) continue;
                                                if (!_g5905.includes(v_x)) _g5905.push(v_x);
                                              }
                                            }
                                          }
                                          const _a5934 = union(_g5898, _g5905);
                                          for (let _i5935 = 0; _i5935 < _a5934.length; _i5935++) {
                                            const v_p = _a5934[_i5935];
                                            const _h5974 = clueAt(cl.number, v_p);
                                            _g5936.length = 0;
                                            G5937: {
                                              const _a5940 = setOf(v_z);
                                              for (let _i5941 = 0; _i5941 < _a5940.length; _i5941++) {
                                                const v_x = _a5940[_i5941];
                                                const _h5942 = clueAt(cl.number, v_x);
                                                if (!((_h5942 !== -1))) continue;
                                                _g5936.push(v_x);
                                              }
                                            }
                                            _g5943.length = 0;
                                            G5944: {
                                              const _a5961 = throughWhere(sp, v_z, (_te5956: number): boolean => { let _c5958: boolean = ((_te5956 === _wc5352 ? _wd5353 : (_te5956 === _wc5350 ? _wd5351 : (b.grid[_te5956] || -1))) === 1); if (_c5958) {   const _t5957 = sp.edgeEnds[2 * _te5956];   _c5958 = !((clueAt(cl.number, _t5957) !== -1)); } let _c5960: boolean = _c5958; if (_c5960) {   const _t5959 = sp.edgeEnds[2 * _te5956 + 1];   _c5960 = !((clueAt(cl.number, _t5959) !== -1)); } return _c5960; });
                                              for (let _i5962 = 0; _i5962 < _a5961.length; _i5962++) {
                                                const v_t = _a5961[_i5962];
                                                const _h5965 = clueAt(cl.number, v_t);
                                                const _h5966 = (_h5965 !== -1);
                                                const _h5967 = _h5966;
                                                const _h5968 = !(_h5967);
                                                const _a5963 = sp.adj4[v_t];
                                                for (let _i5964 = 0; _i5964 < _a5963.length; _i5964++) {
                                                  const v_x = _a5963[_i5964];
                                                  const _h5969 = clueAt(cl.number, v_x);
                                                  let _c5971: boolean = (_h5968 && (_h5969 !== -1));
                                                  if (_c5971) {
                                                    const _t5970 = sp.adj4Edges[v_t][_i5964];
                                                    _c5971 = ((_t5970 === _wc5352 ? _wd5353 : (_t5970 === _wc5350 ? _wd5351 : (b.grid[_t5970] || -1))) === 1);
                                                  }
                                                  if (!(_c5971)) continue;
                                                  if (!_g5943.includes(v_x)) _g5943.push(v_x);
                                                }
                                              }
                                            }
                                            const _a5972 = union(_g5936, _g5943);
                                            for (let _i5973 = 0; _i5973 < _a5972.length; _i5973++) {
                                              const v_q = _a5972[_i5973];
                                              const _h5975 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h5974 - _h5975)) === cl.step))) {
                                                _q5896 = false;
                                                break Q5897;
                                              }
                                            }
                                          }
                                        }
                                        _c5976 = _q5896;
                                      }
                                      if ((_c5976 && (_h5369 || !(throughWhere(sp, v_s, (_te5977: number): boolean => {  return ((_te5977 === _wc5352 ? _wd5353 : (_te5977 === _wc5350 ? _wd5351 : (b.grid[_te5977] || -1))) === 1); }).includes(v_z))))) {
                                        _q5850 = true;
                                        break Q5851;
                                      }
                                    }
                                  }
                                  _c5978 = _q5850;
                                }
                                if (_c5978) {
                                  _q5703 = true;
                                  break Q5704;
                                }
                              }
                            }
                            _c5979 = !(_q5703);
                          }
                          if (_c5979) {
                            _q5680 = true;
                            break Q5681;
                          }
                        }
                      }
                      _c5980 = _q5680;
                    }
                    if (_c5980) {
                      _q5354 = true;
                      break Q5355;
                    }
                  }
                }
                _c5981 = _q5354;
              }
              _c5982 = _c5981;
            }
            if (!(_c5982)) continue;
            if (!_g4776.includes(v_j)) _g4776.push(v_j);
          }
        }
      }
      const v_A = _g4776;
      const _h7202 = v_A.length;
      const _h7203 = (_h7202 < 3);
      _g5983.length = 0;
      G5984: {
        const _a6536 = v_U;
        for (let _i6537 = 0; _i6537 < _a6536.length; _i6537++) {
          const v_i = _a6536[_i6537];
          const _h6540 = _i6537;
          const _h6541 = (_h6540 > 0);
          const _h6553 = sp.edgeOf(v_c, v_i);
          const _a6538 = v_U;
          for (let _i6539 = 0; _i6539 < _a6538.length; _i6539++) {
            const v_j = _a6538[_i6539];
            let _c7185: boolean = (_h6541 && (_h6540 < _i6539));
            if (_c7185) {
              let _c6552: boolean = (throughWhere(sp, v_i, (_te6542: number): boolean => {  return ((b.grid[_te6542] || -1) === 1); }).includes(v_j));
              if (!_c6552) {
                let _c6551: boolean = _h5338;
                if (_c6551) {
                  let _q6543 = true;
                  Q6544: {
                    const _a6545 = nearest(b, sp, cl, v_i);
                    for (let _i6546 = 0; _i6546 < _a6545.length; _i6546++) {
                      const v_p = _a6545[_i6546];
                      const _h6549 = clueAt(cl.number, v_p);
                      const _a6547 = nearest(b, sp, cl, v_j);
                      for (let _i6548 = 0; _i6548 < _a6547.length; _i6548++) {
                        const v_q = _a6547[_i6548];
                        const _h6550 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h6549 - _h6550)) === cl.step))) {
                          _q6543 = false;
                          break Q6544;
                        }
                      }
                    }
                  }
                  _c6551 = !(_q6543);
                }
                _c6552 = _c6551;
              }
              let _c7184: boolean = _c6552;
              if (!_c7184) {
                const _wc6554 = _h6553;
                const _wd6555 = 1;
                const _wc6556 = sp.edgeOf(v_c, v_j);
                const _wd6557 = 1;
                let _q6558 = false;
                Q6559: {
                  const _a6561 = throughWhere(sp, v_c, (_te6560: number): boolean => {  return ((_te6560 === _wc6556 ? _wd6557 : (_te6560 === _wc6554 ? _wd6555 : (b.grid[_te6560] || -1))) === 1); });
                  for (let _i6562 = 0; _i6562 < _a6561.length; _i6562++) {
                    const v_t = _a6561[_i6562];
                    let _c6582: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6582) {
                      let _g6563 = 0;
                      G6564: {
                        const _a6565 = sp.adj4[v_t];
                        for (let _i6566 = 0; _i6566 < _a6565.length; _i6566++) {
                          const _t6567 = sp.adj4Edges[v_t][_i6566];
                          if (!(((_t6567 === _wc6556 ? _wd6557 : (_t6567 === _wc6554 ? _wd6555 : (b.grid[_t6567] || -1))) === 1))) continue;
                          _g6563++;
                        }
                      }
                      let _g6568 = 0;
                      G6569: {
                        const _a6570 = setOf(v_t);
                        for (let _i6571 = 0; _i6571 < _a6570.length; _i6571++) {
                          const v_k = _a6570[_i6571];
                          const _h6572 = clueAt(cl.number, v_k);
                          const _h6579 = (_h6572 + 1);
                          let _c6581: boolean = (_h6572 !== -1);
                          if (_c6581) {
                            let _c6580: boolean = (_h5369 || (_h6572 === 1));
                            if (!_c6580) {
                              let _g6573 = 0;
                              G6574: {
                                const _t6575 = (_h6572 + 1);
                                const _a6576 = cluesValued(cl.number, _t6575);
                                for (let _i6577 = 0; _i6577 < _a6576.length; _i6577++) {
                                  const v_x = _a6576[_i6577];
                                  const _h6578 = clueAt(cl.number, v_x);
                                  if (!((_h6578 === _h6579))) continue;
                                  _g6573++;
                                }
                              }
                              _c6580 = (_g6573 === 0);
                            }
                            _c6581 = _c6580;
                          }
                          if (!(_c6581)) continue;
                          _g6568++;
                        }
                      }
                      _c6582 = (_g6563 < (2 - _g6568));
                    }
                    if (!(_c6582)) continue;
                    let _g6583 = 0;
                    G6584: {
                      const _a6585 = sp.adj4[v_t];
                      for (let _i6586 = 0; _i6586 < _a6585.length; _i6586++) {
                        const _t6587 = sp.adj4Edges[v_t][_i6586];
                        if (!(((_t6587 === _wc6556 ? _wd6557 : (_t6587 === _wc6554 ? _wd6555 : (b.grid[_t6587] || -1))) === 1))) continue;
                        _g6583++;
                      }
                    }
                    let _g6588 = 0;
                    G6589: {
                      const _a6590 = setOf(v_t);
                      for (let _i6591 = 0; _i6591 < _a6590.length; _i6591++) {
                        const v_k = _a6590[_i6591];
                        const _h6592 = clueAt(cl.number, v_k);
                        const _h6599 = (_h6592 + 1);
                        let _c6601: boolean = (_h6592 !== -1);
                        if (_c6601) {
                          let _c6600: boolean = (_h5369 || (_h6592 === 1));
                          if (!_c6600) {
                            let _g6593 = 0;
                            G6594: {
                              const _t6595 = (_h6592 + 1);
                              const _a6596 = cluesValued(cl.number, _t6595);
                              for (let _i6597 = 0; _i6597 < _a6596.length; _i6597++) {
                                const v_x = _a6596[_i6597];
                                const _h6598 = clueAt(cl.number, v_x);
                                if (!((_h6598 === _h6599))) continue;
                                _g6593++;
                              }
                            }
                            _c6600 = (_g6593 === 0);
                          }
                          _c6601 = _c6600;
                        }
                        if (!(_c6601)) continue;
                        _g6588++;
                      }
                    }
                    let _c6882: boolean = (_g6583 < (2 - _g6588));
                    if (_c6882) {
                      let _q6602 = false;
                      Q6603: {
                        const _a6604 = sp.adj4[v_t];
                        for (let _i6605 = 0; _i6605 < _a6604.length; _i6605++) {
                          const v_y = _a6604[_i6605];
                          const _t6606 = sp.adj4Edges[v_t][_i6605];
                          let _c6626: boolean = !((_t6606 === _wc6556 ? true : (_t6606 === _wc6554 ? true : (b.grid[_t6606] !== 0))));
                          if (_c6626) {
                            let _g6607 = 0;
                            G6608: {
                              const _a6609 = sp.adj4[v_t];
                              for (let _i6610 = 0; _i6610 < _a6609.length; _i6610++) {
                                const _t6611 = sp.adj4Edges[v_t][_i6610];
                                if (!(((_t6611 === _wc6556 ? _wd6557 : (_t6611 === _wc6554 ? _wd6555 : (b.grid[_t6611] || -1))) === 1))) continue;
                                _g6607++;
                              }
                            }
                            let _g6612 = 0;
                            G6613: {
                              const _a6614 = setOf(v_t);
                              for (let _i6615 = 0; _i6615 < _a6614.length; _i6615++) {
                                const v_k = _a6614[_i6615];
                                const _h6616 = clueAt(cl.number, v_k);
                                const _h6623 = (_h6616 + 1);
                                let _c6625: boolean = (_h6616 !== -1);
                                if (_c6625) {
                                  let _c6624: boolean = (_h5369 || (_h6616 === 1));
                                  if (!_c6624) {
                                    let _g6617 = 0;
                                    G6618: {
                                      const _t6619 = (_h6616 + 1);
                                      const _a6620 = cluesValued(cl.number, _t6619);
                                      for (let _i6621 = 0; _i6621 < _a6620.length; _i6621++) {
                                        const v_x = _a6620[_i6621];
                                        const _h6622 = clueAt(cl.number, v_x);
                                        if (!((_h6622 === _h6623))) continue;
                                        _g6617++;
                                      }
                                    }
                                    _c6624 = (_g6617 === 0);
                                  }
                                  _c6625 = _c6624;
                                }
                                if (!(_c6625)) continue;
                                _g6612++;
                              }
                            }
                            _c6626 = (_g6607 < (2 - _g6612));
                          }
                          let _c6647: boolean = _c6626;
                          if (_c6647) {
                            let _g6627 = 0;
                            G6628: {
                              const _a6630 = sp.adj4[v_y];
                              for (let _i6631 = 0; _i6631 < _a6630.length; _i6631++) {
                                const _t6632 = sp.adj4Edges[v_y][_i6631];
                                if (!(((_t6632 === _wc6556 ? _wd6557 : (_t6632 === _wc6554 ? _wd6555 : (b.grid[_t6632] || -1))) === 1))) continue;
                                _g6627++;
                              }
                            }
                            let _g6633 = 0;
                            G6634: {
                              const _a6635 = setOf(v_y);
                              for (let _i6636 = 0; _i6636 < _a6635.length; _i6636++) {
                                const v_k = _a6635[_i6636];
                                const _h6637 = clueAt(cl.number, v_k);
                                const _h6644 = (_h6637 + 1);
                                let _c6646: boolean = (_h6637 !== -1);
                                if (_c6646) {
                                  let _c6645: boolean = (_h5369 || (_h6637 === 1));
                                  if (!_c6645) {
                                    let _g6638 = 0;
                                    G6639: {
                                      const _t6640 = (_h6637 + 1);
                                      const _a6641 = cluesValued(cl.number, _t6640);
                                      for (let _i6642 = 0; _i6642 < _a6641.length; _i6642++) {
                                        const v_x = _a6641[_i6642];
                                        const _h6643 = clueAt(cl.number, v_x);
                                        if (!((_h6643 === _h6644))) continue;
                                        _g6638++;
                                      }
                                    }
                                    _c6645 = (_g6638 === 0);
                                  }
                                  _c6646 = _c6645;
                                }
                                if (!(_c6646)) continue;
                                _g6633++;
                              }
                            }
                            _c6647 = (_g6627 < (2 - _g6633));
                          }
                          let _c6730: boolean = _c6647;
                          if (_c6730) {
                            let _q6648 = true;
                            Q6649: {
                              _g6650.length = 0;
                              G6651: {
                                const _a6654 = setOf(v_t);
                                for (let _i6655 = 0; _i6655 < _a6654.length; _i6655++) {
                                  const v_x = _a6654[_i6655];
                                  const _h6656 = clueAt(cl.number, v_x);
                                  if (!((_h6656 !== -1))) continue;
                                  _g6650.push(v_x);
                                }
                              }
                              _g6657.length = 0;
                              G6658: {
                                const _a6677 = throughWhere(sp, v_t, (_te6672: number): boolean => { let _c6674: boolean = ((_te6672 === _wc6556 ? _wd6557 : (_te6672 === _wc6554 ? _wd6555 : (b.grid[_te6672] || -1))) === 1); if (_c6674) {   const _t6673 = sp.edgeEnds[2 * _te6672];   _c6674 = !((clueAt(cl.number, _t6673) !== -1)); } let _c6676: boolean = _c6674; if (_c6676) {   const _t6675 = sp.edgeEnds[2 * _te6672 + 1];   _c6676 = !((clueAt(cl.number, _t6675) !== -1)); } return _c6676; });
                                for (let _i6678 = 0; _i6678 < _a6677.length; _i6678++) {
                                  const v_t_6671 = _a6677[_i6678];
                                  const _h6681 = clueAt(cl.number, v_t_6671);
                                  const _h6682 = (_h6681 !== -1);
                                  const _h6683 = _h6682;
                                  const _h6684 = !(_h6683);
                                  const _a6679 = sp.adj4[v_t_6671];
                                  for (let _i6680 = 0; _i6680 < _a6679.length; _i6680++) {
                                    const v_x = _a6679[_i6680];
                                    const _h6685 = clueAt(cl.number, v_x);
                                    let _c6687: boolean = (_h6684 && (_h6685 !== -1));
                                    if (_c6687) {
                                      const _t6686 = sp.adj4Edges[v_t_6671][_i6680];
                                      _c6687 = ((_t6686 === _wc6556 ? _wd6557 : (_t6686 === _wc6554 ? _wd6555 : (b.grid[_t6686] || -1))) === 1);
                                    }
                                    if (!(_c6687)) continue;
                                    if (!_g6657.includes(v_x)) _g6657.push(v_x);
                                  }
                                }
                              }
                              const _a6688 = union(_g6650, _g6657);
                              for (let _i6689 = 0; _i6689 < _a6688.length; _i6689++) {
                                const v_p = _a6688[_i6689];
                                const _h6728 = clueAt(cl.number, v_p);
                                _g6690.length = 0;
                                G6691: {
                                  const _a6694 = setOf(v_y);
                                  for (let _i6695 = 0; _i6695 < _a6694.length; _i6695++) {
                                    const v_x = _a6694[_i6695];
                                    const _h6696 = clueAt(cl.number, v_x);
                                    if (!((_h6696 !== -1))) continue;
                                    _g6690.push(v_x);
                                  }
                                }
                                _g6697.length = 0;
                                G6698: {
                                  const _a6715 = throughWhere(sp, v_y, (_te6710: number): boolean => { let _c6712: boolean = ((_te6710 === _wc6556 ? _wd6557 : (_te6710 === _wc6554 ? _wd6555 : (b.grid[_te6710] || -1))) === 1); if (_c6712) {   const _t6711 = sp.edgeEnds[2 * _te6710];   _c6712 = !((clueAt(cl.number, _t6711) !== -1)); } let _c6714: boolean = _c6712; if (_c6714) {   const _t6713 = sp.edgeEnds[2 * _te6710 + 1];   _c6714 = !((clueAt(cl.number, _t6713) !== -1)); } return _c6714; });
                                  for (let _i6716 = 0; _i6716 < _a6715.length; _i6716++) {
                                    const v_t = _a6715[_i6716];
                                    const _h6719 = clueAt(cl.number, v_t);
                                    const _h6720 = (_h6719 !== -1);
                                    const _h6721 = _h6720;
                                    const _h6722 = !(_h6721);
                                    const _a6717 = sp.adj4[v_t];
                                    for (let _i6718 = 0; _i6718 < _a6717.length; _i6718++) {
                                      const v_x = _a6717[_i6718];
                                      const _h6723 = clueAt(cl.number, v_x);
                                      let _c6725: boolean = (_h6722 && (_h6723 !== -1));
                                      if (_c6725) {
                                        const _t6724 = sp.adj4Edges[v_t][_i6718];
                                        _c6725 = ((_t6724 === _wc6556 ? _wd6557 : (_t6724 === _wc6554 ? _wd6555 : (b.grid[_t6724] || -1))) === 1);
                                      }
                                      if (!(_c6725)) continue;
                                      if (!_g6697.includes(v_x)) _g6697.push(v_x);
                                    }
                                  }
                                }
                                const _a6726 = union(_g6690, _g6697);
                                for (let _i6727 = 0; _i6727 < _a6726.length; _i6727++) {
                                  const v_q = _a6726[_i6727];
                                  const _h6729 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6728 - _h6729)) === cl.step))) {
                                    _q6648 = false;
                                    break Q6649;
                                  }
                                }
                              }
                            }
                            _c6730 = _q6648;
                          }
                          if (!((_c6730 && (_h5369 || !(throughWhere(sp, v_t, (_te6731: number): boolean => {  return ((_te6731 === _wc6556 ? _wd6557 : (_te6731 === _wc6554 ? _wd6555 : (b.grid[_te6731] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6732 = 0;
                          G6733: {
                            const _a6734 = sp.adj4[v_t];
                            for (let _i6735 = 0; _i6735 < _a6734.length; _i6735++) {
                              const _t6736 = sp.adj4Edges[v_t][_i6735];
                              if (!(((_t6736 === _wc6556 ? _wd6557 : (_t6736 === _wc6554 ? _wd6555 : (b.grid[_t6736] || -1))) === 1))) continue;
                              _g6732++;
                            }
                          }
                          let _g6737 = 0;
                          G6738: {
                            const _a6739 = setOf(v_t);
                            for (let _i6740 = 0; _i6740 < _a6739.length; _i6740++) {
                              const v_k = _a6739[_i6740];
                              const _h6741 = clueAt(cl.number, v_k);
                              const _h6748 = (_h6741 + 1);
                              let _c6750: boolean = (_h6741 !== -1);
                              if (_c6750) {
                                let _c6749: boolean = (_h5369 || (_h6741 === 1));
                                if (!_c6749) {
                                  let _g6742 = 0;
                                  G6743: {
                                    const _t6744 = (_h6741 + 1);
                                    const _a6745 = cluesValued(cl.number, _t6744);
                                    for (let _i6746 = 0; _i6746 < _a6745.length; _i6746++) {
                                      const v_x = _a6745[_i6746];
                                      const _h6747 = clueAt(cl.number, v_x);
                                      if (!((_h6747 === _h6748))) continue;
                                      _g6742++;
                                    }
                                  }
                                  _c6749 = (_g6742 === 0);
                                }
                                _c6750 = _c6749;
                              }
                              if (!(_c6750)) continue;
                              _g6737++;
                            }
                          }
                          let _c6881: boolean = ((_g6732 + 1) === (2 - _g6737));
                          if (!_c6881) {
                            let _q6751 = false;
                            Q6752: {
                              const _a6753 = sp.adj4[v_t];
                              const _n6754 = _i6605;
                              for (let _i6755 = 0; _i6755 < _n6754; _i6755++) {
                                const v_z = _a6753[_i6755];
                                const _t6756 = sp.adj4Edges[v_t][_i6755];
                                let _c6776: boolean = !((_t6756 === _wc6556 ? true : (_t6756 === _wc6554 ? true : (b.grid[_t6756] !== 0))));
                                if (_c6776) {
                                  let _g6757 = 0;
                                  G6758: {
                                    const _a6759 = sp.adj4[v_t];
                                    for (let _i6760 = 0; _i6760 < _a6759.length; _i6760++) {
                                      const _t6761 = sp.adj4Edges[v_t][_i6760];
                                      if (!(((_t6761 === _wc6556 ? _wd6557 : (_t6761 === _wc6554 ? _wd6555 : (b.grid[_t6761] || -1))) === 1))) continue;
                                      _g6757++;
                                    }
                                  }
                                  let _g6762 = 0;
                                  G6763: {
                                    const _a6764 = setOf(v_t);
                                    for (let _i6765 = 0; _i6765 < _a6764.length; _i6765++) {
                                      const v_k = _a6764[_i6765];
                                      const _h6766 = clueAt(cl.number, v_k);
                                      const _h6773 = (_h6766 + 1);
                                      let _c6775: boolean = (_h6766 !== -1);
                                      if (_c6775) {
                                        let _c6774: boolean = (_h5369 || (_h6766 === 1));
                                        if (!_c6774) {
                                          let _g6767 = 0;
                                          G6768: {
                                            const _t6769 = (_h6766 + 1);
                                            const _a6770 = cluesValued(cl.number, _t6769);
                                            for (let _i6771 = 0; _i6771 < _a6770.length; _i6771++) {
                                              const v_x = _a6770[_i6771];
                                              const _h6772 = clueAt(cl.number, v_x);
                                              if (!((_h6772 === _h6773))) continue;
                                              _g6767++;
                                            }
                                          }
                                          _c6774 = (_g6767 === 0);
                                        }
                                        _c6775 = _c6774;
                                      }
                                      if (!(_c6775)) continue;
                                      _g6762++;
                                    }
                                  }
                                  _c6776 = (_g6757 < (2 - _g6762));
                                }
                                let _c6796: boolean = _c6776;
                                if (_c6796) {
                                  let _g6777 = 0;
                                  G6778: {
                                    const _a6779 = sp.adj4[v_z];
                                    for (let _i6780 = 0; _i6780 < _a6779.length; _i6780++) {
                                      const _t6781 = sp.adj4Edges[v_z][_i6780];
                                      if (!(((_t6781 === _wc6556 ? _wd6557 : (_t6781 === _wc6554 ? _wd6555 : (b.grid[_t6781] || -1))) === 1))) continue;
                                      _g6777++;
                                    }
                                  }
                                  let _g6782 = 0;
                                  G6783: {
                                    const _a6784 = setOf(v_z);
                                    for (let _i6785 = 0; _i6785 < _a6784.length; _i6785++) {
                                      const v_k = _a6784[_i6785];
                                      const _h6786 = clueAt(cl.number, v_k);
                                      const _h6793 = (_h6786 + 1);
                                      let _c6795: boolean = (_h6786 !== -1);
                                      if (_c6795) {
                                        let _c6794: boolean = (_h5369 || (_h6786 === 1));
                                        if (!_c6794) {
                                          let _g6787 = 0;
                                          G6788: {
                                            const _t6789 = (_h6786 + 1);
                                            const _a6790 = cluesValued(cl.number, _t6789);
                                            for (let _i6791 = 0; _i6791 < _a6790.length; _i6791++) {
                                              const v_x = _a6790[_i6791];
                                              const _h6792 = clueAt(cl.number, v_x);
                                              if (!((_h6792 === _h6793))) continue;
                                              _g6787++;
                                            }
                                          }
                                          _c6794 = (_g6787 === 0);
                                        }
                                        _c6795 = _c6794;
                                      }
                                      if (!(_c6795)) continue;
                                      _g6782++;
                                    }
                                  }
                                  _c6796 = (_g6777 < (2 - _g6782));
                                }
                                let _c6879: boolean = _c6796;
                                if (_c6879) {
                                  let _q6797 = true;
                                  Q6798: {
                                    _g6799.length = 0;
                                    G6800: {
                                      const _a6803 = setOf(v_t);
                                      for (let _i6804 = 0; _i6804 < _a6803.length; _i6804++) {
                                        const v_x = _a6803[_i6804];
                                        const _h6805 = clueAt(cl.number, v_x);
                                        if (!((_h6805 !== -1))) continue;
                                        _g6799.push(v_x);
                                      }
                                    }
                                    _g6806.length = 0;
                                    G6807: {
                                      const _a6826 = throughWhere(sp, v_t, (_te6821: number): boolean => { let _c6823: boolean = ((_te6821 === _wc6556 ? _wd6557 : (_te6821 === _wc6554 ? _wd6555 : (b.grid[_te6821] || -1))) === 1); if (_c6823) {   const _t6822 = sp.edgeEnds[2 * _te6821];   _c6823 = !((clueAt(cl.number, _t6822) !== -1)); } let _c6825: boolean = _c6823; if (_c6825) {   const _t6824 = sp.edgeEnds[2 * _te6821 + 1];   _c6825 = !((clueAt(cl.number, _t6824) !== -1)); } return _c6825; });
                                      for (let _i6827 = 0; _i6827 < _a6826.length; _i6827++) {
                                        const v_t_6820 = _a6826[_i6827];
                                        const _h6830 = clueAt(cl.number, v_t_6820);
                                        const _h6831 = (_h6830 !== -1);
                                        const _h6832 = _h6831;
                                        const _h6833 = !(_h6832);
                                        const _a6828 = sp.adj4[v_t_6820];
                                        for (let _i6829 = 0; _i6829 < _a6828.length; _i6829++) {
                                          const v_x = _a6828[_i6829];
                                          const _h6834 = clueAt(cl.number, v_x);
                                          let _c6836: boolean = (_h6833 && (_h6834 !== -1));
                                          if (_c6836) {
                                            const _t6835 = sp.adj4Edges[v_t_6820][_i6829];
                                            _c6836 = ((_t6835 === _wc6556 ? _wd6557 : (_t6835 === _wc6554 ? _wd6555 : (b.grid[_t6835] || -1))) === 1);
                                          }
                                          if (!(_c6836)) continue;
                                          if (!_g6806.includes(v_x)) _g6806.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6837 = union(_g6799, _g6806);
                                    for (let _i6838 = 0; _i6838 < _a6837.length; _i6838++) {
                                      const v_p = _a6837[_i6838];
                                      const _h6877 = clueAt(cl.number, v_p);
                                      _g6839.length = 0;
                                      G6840: {
                                        const _a6843 = setOf(v_z);
                                        for (let _i6844 = 0; _i6844 < _a6843.length; _i6844++) {
                                          const v_x = _a6843[_i6844];
                                          const _h6845 = clueAt(cl.number, v_x);
                                          if (!((_h6845 !== -1))) continue;
                                          _g6839.push(v_x);
                                        }
                                      }
                                      _g6846.length = 0;
                                      G6847: {
                                        const _a6864 = throughWhere(sp, v_z, (_te6859: number): boolean => { let _c6861: boolean = ((_te6859 === _wc6556 ? _wd6557 : (_te6859 === _wc6554 ? _wd6555 : (b.grid[_te6859] || -1))) === 1); if (_c6861) {   const _t6860 = sp.edgeEnds[2 * _te6859];   _c6861 = !((clueAt(cl.number, _t6860) !== -1)); } let _c6863: boolean = _c6861; if (_c6863) {   const _t6862 = sp.edgeEnds[2 * _te6859 + 1];   _c6863 = !((clueAt(cl.number, _t6862) !== -1)); } return _c6863; });
                                        for (let _i6865 = 0; _i6865 < _a6864.length; _i6865++) {
                                          const v_t = _a6864[_i6865];
                                          const _h6868 = clueAt(cl.number, v_t);
                                          const _h6869 = (_h6868 !== -1);
                                          const _h6870 = _h6869;
                                          const _h6871 = !(_h6870);
                                          const _a6866 = sp.adj4[v_t];
                                          for (let _i6867 = 0; _i6867 < _a6866.length; _i6867++) {
                                            const v_x = _a6866[_i6867];
                                            const _h6872 = clueAt(cl.number, v_x);
                                            let _c6874: boolean = (_h6871 && (_h6872 !== -1));
                                            if (_c6874) {
                                              const _t6873 = sp.adj4Edges[v_t][_i6867];
                                              _c6874 = ((_t6873 === _wc6556 ? _wd6557 : (_t6873 === _wc6554 ? _wd6555 : (b.grid[_t6873] || -1))) === 1);
                                            }
                                            if (!(_c6874)) continue;
                                            if (!_g6846.includes(v_x)) _g6846.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6875 = union(_g6839, _g6846);
                                      for (let _i6876 = 0; _i6876 < _a6875.length; _i6876++) {
                                        const v_q = _a6875[_i6876];
                                        const _h6878 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6877 - _h6878)) === cl.step))) {
                                          _q6797 = false;
                                          break Q6798;
                                        }
                                      }
                                    }
                                  }
                                  _c6879 = _q6797;
                                }
                                if ((_c6879 && (_h5369 || !(throughWhere(sp, v_t, (_te6880: number): boolean => {  return ((_te6880 === _wc6556 ? _wd6557 : (_te6880 === _wc6554 ? _wd6555 : (b.grid[_te6880] || -1))) === 1); }).includes(v_z))))) {
                                  _q6751 = true;
                                  break Q6752;
                                }
                              }
                            }
                            _c6881 = _q6751;
                          }
                          if (_c6881) {
                            _q6602 = true;
                            break Q6603;
                          }
                        }
                      }
                      _c6882 = !(_q6602);
                    }
                    let _c7183: boolean = _c6882;
                    if (!_c7183) {
                      let _q6883 = false;
                      Q6884: {
                        const _a6885 = sp.adj4[v_t];
                        for (let _i6886 = 0; _i6886 < _a6885.length; _i6886++) {
                          const v_s = _a6885[_i6886];
                          let _g6887 = 0;
                          G6888: {
                            const _a6889 = sp.adj4[v_s];
                            for (let _i6890 = 0; _i6890 < _a6889.length; _i6890++) {
                              const _t6891 = sp.adj4Edges[v_s][_i6890];
                              if (!(((_t6891 === _wc6556 ? _wd6557 : (_t6891 === _wc6554 ? _wd6555 : (b.grid[_t6891] || -1))) === 1))) continue;
                              _g6887++;
                            }
                          }
                          let _g6892 = 0;
                          G6893: {
                            const _a6894 = setOf(v_s);
                            for (let _i6895 = 0; _i6895 < _a6894.length; _i6895++) {
                              const v_k = _a6894[_i6895];
                              const _h6896 = clueAt(cl.number, v_k);
                              const _h6903 = (_h6896 + 1);
                              let _c6905: boolean = (_h6896 !== -1);
                              if (_c6905) {
                                let _c6904: boolean = (_h5369 || (_h6896 === 1));
                                if (!_c6904) {
                                  let _g6897 = 0;
                                  G6898: {
                                    const _t6899 = (_h6896 + 1);
                                    const _a6900 = cluesValued(cl.number, _t6899);
                                    for (let _i6901 = 0; _i6901 < _a6900.length; _i6901++) {
                                      const v_x = _a6900[_i6901];
                                      const _h6902 = clueAt(cl.number, v_x);
                                      if (!((_h6902 === _h6903))) continue;
                                      _g6897++;
                                    }
                                  }
                                  _c6904 = (_g6897 === 0);
                                }
                                _c6905 = _c6904;
                              }
                              if (!(_c6905)) continue;
                              _g6892++;
                            }
                          }
                          let _c7182: boolean = (_g6887 < (2 - _g6892));
                          if (_c7182) {
                            let _q6906 = false;
                            Q6907: {
                              const _a6908 = sp.adj4[v_s];
                              for (let _i6909 = 0; _i6909 < _a6908.length; _i6909++) {
                                const v_y = _a6908[_i6909];
                                const _t6910 = sp.adj4Edges[v_s][_i6909];
                                let _c6930: boolean = !((_t6910 === _wc6556 ? true : (_t6910 === _wc6554 ? true : (b.grid[_t6910] !== 0))));
                                if (_c6930) {
                                  let _g6911 = 0;
                                  G6912: {
                                    const _a6913 = sp.adj4[v_s];
                                    for (let _i6914 = 0; _i6914 < _a6913.length; _i6914++) {
                                      const _t6915 = sp.adj4Edges[v_s][_i6914];
                                      if (!(((_t6915 === _wc6556 ? _wd6557 : (_t6915 === _wc6554 ? _wd6555 : (b.grid[_t6915] || -1))) === 1))) continue;
                                      _g6911++;
                                    }
                                  }
                                  let _g6916 = 0;
                                  G6917: {
                                    const _a6918 = setOf(v_s);
                                    for (let _i6919 = 0; _i6919 < _a6918.length; _i6919++) {
                                      const v_k = _a6918[_i6919];
                                      const _h6920 = clueAt(cl.number, v_k);
                                      const _h6927 = (_h6920 + 1);
                                      let _c6929: boolean = (_h6920 !== -1);
                                      if (_c6929) {
                                        let _c6928: boolean = (_h5369 || (_h6920 === 1));
                                        if (!_c6928) {
                                          let _g6921 = 0;
                                          G6922: {
                                            const _t6923 = (_h6920 + 1);
                                            const _a6924 = cluesValued(cl.number, _t6923);
                                            for (let _i6925 = 0; _i6925 < _a6924.length; _i6925++) {
                                              const v_x = _a6924[_i6925];
                                              const _h6926 = clueAt(cl.number, v_x);
                                              if (!((_h6926 === _h6927))) continue;
                                              _g6921++;
                                            }
                                          }
                                          _c6928 = (_g6921 === 0);
                                        }
                                        _c6929 = _c6928;
                                      }
                                      if (!(_c6929)) continue;
                                      _g6916++;
                                    }
                                  }
                                  _c6930 = (_g6911 < (2 - _g6916));
                                }
                                let _c6951: boolean = _c6930;
                                if (_c6951) {
                                  let _g6931 = 0;
                                  G6932: {
                                    const _a6934 = sp.adj4[v_y];
                                    for (let _i6935 = 0; _i6935 < _a6934.length; _i6935++) {
                                      const _t6936 = sp.adj4Edges[v_y][_i6935];
                                      if (!(((_t6936 === _wc6556 ? _wd6557 : (_t6936 === _wc6554 ? _wd6555 : (b.grid[_t6936] || -1))) === 1))) continue;
                                      _g6931++;
                                    }
                                  }
                                  let _g6937 = 0;
                                  G6938: {
                                    const _a6939 = setOf(v_y);
                                    for (let _i6940 = 0; _i6940 < _a6939.length; _i6940++) {
                                      const v_k = _a6939[_i6940];
                                      const _h6941 = clueAt(cl.number, v_k);
                                      const _h6948 = (_h6941 + 1);
                                      let _c6950: boolean = (_h6941 !== -1);
                                      if (_c6950) {
                                        let _c6949: boolean = (_h5369 || (_h6941 === 1));
                                        if (!_c6949) {
                                          let _g6942 = 0;
                                          G6943: {
                                            const _t6944 = (_h6941 + 1);
                                            const _a6945 = cluesValued(cl.number, _t6944);
                                            for (let _i6946 = 0; _i6946 < _a6945.length; _i6946++) {
                                              const v_x = _a6945[_i6946];
                                              const _h6947 = clueAt(cl.number, v_x);
                                              if (!((_h6947 === _h6948))) continue;
                                              _g6942++;
                                            }
                                          }
                                          _c6949 = (_g6942 === 0);
                                        }
                                        _c6950 = _c6949;
                                      }
                                      if (!(_c6950)) continue;
                                      _g6937++;
                                    }
                                  }
                                  _c6951 = (_g6931 < (2 - _g6937));
                                }
                                let _c7032: boolean = _c6951;
                                if (_c7032) {
                                  let _q6952 = true;
                                  Q6953: {
                                    _g6954.length = 0;
                                    G6955: {
                                      const _a6958 = setOf(v_s);
                                      for (let _i6959 = 0; _i6959 < _a6958.length; _i6959++) {
                                        const v_x = _a6958[_i6959];
                                        const _h6960 = clueAt(cl.number, v_x);
                                        if (!((_h6960 !== -1))) continue;
                                        _g6954.push(v_x);
                                      }
                                    }
                                    _g6961.length = 0;
                                    G6962: {
                                      const _a6979 = throughWhere(sp, v_s, (_te6974: number): boolean => { let _c6976: boolean = ((_te6974 === _wc6556 ? _wd6557 : (_te6974 === _wc6554 ? _wd6555 : (b.grid[_te6974] || -1))) === 1); if (_c6976) {   const _t6975 = sp.edgeEnds[2 * _te6974];   _c6976 = !((clueAt(cl.number, _t6975) !== -1)); } let _c6978: boolean = _c6976; if (_c6978) {   const _t6977 = sp.edgeEnds[2 * _te6974 + 1];   _c6978 = !((clueAt(cl.number, _t6977) !== -1)); } return _c6978; });
                                      for (let _i6980 = 0; _i6980 < _a6979.length; _i6980++) {
                                        const v_t = _a6979[_i6980];
                                        const _h6983 = clueAt(cl.number, v_t);
                                        const _h6984 = (_h6983 !== -1);
                                        const _h6985 = _h6984;
                                        const _h6986 = !(_h6985);
                                        const _a6981 = sp.adj4[v_t];
                                        for (let _i6982 = 0; _i6982 < _a6981.length; _i6982++) {
                                          const v_x = _a6981[_i6982];
                                          const _h6987 = clueAt(cl.number, v_x);
                                          let _c6989: boolean = (_h6986 && (_h6987 !== -1));
                                          if (_c6989) {
                                            const _t6988 = sp.adj4Edges[v_t][_i6982];
                                            _c6989 = ((_t6988 === _wc6556 ? _wd6557 : (_t6988 === _wc6554 ? _wd6555 : (b.grid[_t6988] || -1))) === 1);
                                          }
                                          if (!(_c6989)) continue;
                                          if (!_g6961.includes(v_x)) _g6961.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6990 = union(_g6954, _g6961);
                                    for (let _i6991 = 0; _i6991 < _a6990.length; _i6991++) {
                                      const v_p = _a6990[_i6991];
                                      const _h7030 = clueAt(cl.number, v_p);
                                      _g6992.length = 0;
                                      G6993: {
                                        const _a6996 = setOf(v_y);
                                        for (let _i6997 = 0; _i6997 < _a6996.length; _i6997++) {
                                          const v_x = _a6996[_i6997];
                                          const _h6998 = clueAt(cl.number, v_x);
                                          if (!((_h6998 !== -1))) continue;
                                          _g6992.push(v_x);
                                        }
                                      }
                                      _g6999.length = 0;
                                      G7000: {
                                        const _a7017 = throughWhere(sp, v_y, (_te7012: number): boolean => { let _c7014: boolean = ((_te7012 === _wc6556 ? _wd6557 : (_te7012 === _wc6554 ? _wd6555 : (b.grid[_te7012] || -1))) === 1); if (_c7014) {   const _t7013 = sp.edgeEnds[2 * _te7012];   _c7014 = !((clueAt(cl.number, _t7013) !== -1)); } let _c7016: boolean = _c7014; if (_c7016) {   const _t7015 = sp.edgeEnds[2 * _te7012 + 1];   _c7016 = !((clueAt(cl.number, _t7015) !== -1)); } return _c7016; });
                                        for (let _i7018 = 0; _i7018 < _a7017.length; _i7018++) {
                                          const v_t = _a7017[_i7018];
                                          const _h7021 = clueAt(cl.number, v_t);
                                          const _h7022 = (_h7021 !== -1);
                                          const _h7023 = _h7022;
                                          const _h7024 = !(_h7023);
                                          const _a7019 = sp.adj4[v_t];
                                          for (let _i7020 = 0; _i7020 < _a7019.length; _i7020++) {
                                            const v_x = _a7019[_i7020];
                                            const _h7025 = clueAt(cl.number, v_x);
                                            let _c7027: boolean = (_h7024 && (_h7025 !== -1));
                                            if (_c7027) {
                                              const _t7026 = sp.adj4Edges[v_t][_i7020];
                                              _c7027 = ((_t7026 === _wc6556 ? _wd6557 : (_t7026 === _wc6554 ? _wd6555 : (b.grid[_t7026] || -1))) === 1);
                                            }
                                            if (!(_c7027)) continue;
                                            if (!_g6999.includes(v_x)) _g6999.push(v_x);
                                          }
                                        }
                                      }
                                      const _a7028 = union(_g6992, _g6999);
                                      for (let _i7029 = 0; _i7029 < _a7028.length; _i7029++) {
                                        const v_q = _a7028[_i7029];
                                        const _h7031 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7030 - _h7031)) === cl.step))) {
                                          _q6952 = false;
                                          break Q6953;
                                        }
                                      }
                                    }
                                  }
                                  _c7032 = _q6952;
                                }
                                if (!((_c7032 && (_h5369 || !(throughWhere(sp, v_s, (_te7033: number): boolean => {  return ((_te7033 === _wc6556 ? _wd6557 : (_te7033 === _wc6554 ? _wd6555 : (b.grid[_te7033] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g7034 = 0;
                                G7035: {
                                  const _a7036 = sp.adj4[v_s];
                                  for (let _i7037 = 0; _i7037 < _a7036.length; _i7037++) {
                                    const _t7038 = sp.adj4Edges[v_s][_i7037];
                                    if (!(((_t7038 === _wc6556 ? _wd6557 : (_t7038 === _wc6554 ? _wd6555 : (b.grid[_t7038] || -1))) === 1))) continue;
                                    _g7034++;
                                  }
                                }
                                let _g7039 = 0;
                                G7040: {
                                  const _a7041 = setOf(v_s);
                                  for (let _i7042 = 0; _i7042 < _a7041.length; _i7042++) {
                                    const v_k = _a7041[_i7042];
                                    const _h7043 = clueAt(cl.number, v_k);
                                    const _h7050 = (_h7043 + 1);
                                    let _c7052: boolean = (_h7043 !== -1);
                                    if (_c7052) {
                                      let _c7051: boolean = (_h5369 || (_h7043 === 1));
                                      if (!_c7051) {
                                        let _g7044 = 0;
                                        G7045: {
                                          const _t7046 = (_h7043 + 1);
                                          const _a7047 = cluesValued(cl.number, _t7046);
                                          for (let _i7048 = 0; _i7048 < _a7047.length; _i7048++) {
                                            const v_x = _a7047[_i7048];
                                            const _h7049 = clueAt(cl.number, v_x);
                                            if (!((_h7049 === _h7050))) continue;
                                            _g7044++;
                                          }
                                        }
                                        _c7051 = (_g7044 === 0);
                                      }
                                      _c7052 = _c7051;
                                    }
                                    if (!(_c7052)) continue;
                                    _g7039++;
                                  }
                                }
                                let _c7181: boolean = ((_g7034 + 1) === (2 - _g7039));
                                if (!_c7181) {
                                  let _q7053 = false;
                                  Q7054: {
                                    const _a7055 = sp.adj4[v_s];
                                    const _n7056 = _i6909;
                                    for (let _i7057 = 0; _i7057 < _n7056; _i7057++) {
                                      const v_z = _a7055[_i7057];
                                      const _t7058 = sp.adj4Edges[v_s][_i7057];
                                      let _c7078: boolean = !((_t7058 === _wc6556 ? true : (_t7058 === _wc6554 ? true : (b.grid[_t7058] !== 0))));
                                      if (_c7078) {
                                        let _g7059 = 0;
                                        G7060: {
                                          const _a7061 = sp.adj4[v_s];
                                          for (let _i7062 = 0; _i7062 < _a7061.length; _i7062++) {
                                            const _t7063 = sp.adj4Edges[v_s][_i7062];
                                            if (!(((_t7063 === _wc6556 ? _wd6557 : (_t7063 === _wc6554 ? _wd6555 : (b.grid[_t7063] || -1))) === 1))) continue;
                                            _g7059++;
                                          }
                                        }
                                        let _g7064 = 0;
                                        G7065: {
                                          const _a7066 = setOf(v_s);
                                          for (let _i7067 = 0; _i7067 < _a7066.length; _i7067++) {
                                            const v_k = _a7066[_i7067];
                                            const _h7068 = clueAt(cl.number, v_k);
                                            const _h7075 = (_h7068 + 1);
                                            let _c7077: boolean = (_h7068 !== -1);
                                            if (_c7077) {
                                              let _c7076: boolean = (_h5369 || (_h7068 === 1));
                                              if (!_c7076) {
                                                let _g7069 = 0;
                                                G7070: {
                                                  const _t7071 = (_h7068 + 1);
                                                  const _a7072 = cluesValued(cl.number, _t7071);
                                                  for (let _i7073 = 0; _i7073 < _a7072.length; _i7073++) {
                                                    const v_x = _a7072[_i7073];
                                                    const _h7074 = clueAt(cl.number, v_x);
                                                    if (!((_h7074 === _h7075))) continue;
                                                    _g7069++;
                                                  }
                                                }
                                                _c7076 = (_g7069 === 0);
                                              }
                                              _c7077 = _c7076;
                                            }
                                            if (!(_c7077)) continue;
                                            _g7064++;
                                          }
                                        }
                                        _c7078 = (_g7059 < (2 - _g7064));
                                      }
                                      let _c7098: boolean = _c7078;
                                      if (_c7098) {
                                        let _g7079 = 0;
                                        G7080: {
                                          const _a7081 = sp.adj4[v_z];
                                          for (let _i7082 = 0; _i7082 < _a7081.length; _i7082++) {
                                            const _t7083 = sp.adj4Edges[v_z][_i7082];
                                            if (!(((_t7083 === _wc6556 ? _wd6557 : (_t7083 === _wc6554 ? _wd6555 : (b.grid[_t7083] || -1))) === 1))) continue;
                                            _g7079++;
                                          }
                                        }
                                        let _g7084 = 0;
                                        G7085: {
                                          const _a7086 = setOf(v_z);
                                          for (let _i7087 = 0; _i7087 < _a7086.length; _i7087++) {
                                            const v_k = _a7086[_i7087];
                                            const _h7088 = clueAt(cl.number, v_k);
                                            const _h7095 = (_h7088 + 1);
                                            let _c7097: boolean = (_h7088 !== -1);
                                            if (_c7097) {
                                              let _c7096: boolean = (_h5369 || (_h7088 === 1));
                                              if (!_c7096) {
                                                let _g7089 = 0;
                                                G7090: {
                                                  const _t7091 = (_h7088 + 1);
                                                  const _a7092 = cluesValued(cl.number, _t7091);
                                                  for (let _i7093 = 0; _i7093 < _a7092.length; _i7093++) {
                                                    const v_x = _a7092[_i7093];
                                                    const _h7094 = clueAt(cl.number, v_x);
                                                    if (!((_h7094 === _h7095))) continue;
                                                    _g7089++;
                                                  }
                                                }
                                                _c7096 = (_g7089 === 0);
                                              }
                                              _c7097 = _c7096;
                                            }
                                            if (!(_c7097)) continue;
                                            _g7084++;
                                          }
                                        }
                                        _c7098 = (_g7079 < (2 - _g7084));
                                      }
                                      let _c7179: boolean = _c7098;
                                      if (_c7179) {
                                        let _q7099 = true;
                                        Q7100: {
                                          _g7101.length = 0;
                                          G7102: {
                                            const _a7105 = setOf(v_s);
                                            for (let _i7106 = 0; _i7106 < _a7105.length; _i7106++) {
                                              const v_x = _a7105[_i7106];
                                              const _h7107 = clueAt(cl.number, v_x);
                                              if (!((_h7107 !== -1))) continue;
                                              _g7101.push(v_x);
                                            }
                                          }
                                          _g7108.length = 0;
                                          G7109: {
                                            const _a7126 = throughWhere(sp, v_s, (_te7121: number): boolean => { let _c7123: boolean = ((_te7121 === _wc6556 ? _wd6557 : (_te7121 === _wc6554 ? _wd6555 : (b.grid[_te7121] || -1))) === 1); if (_c7123) {   const _t7122 = sp.edgeEnds[2 * _te7121];   _c7123 = !((clueAt(cl.number, _t7122) !== -1)); } let _c7125: boolean = _c7123; if (_c7125) {   const _t7124 = sp.edgeEnds[2 * _te7121 + 1];   _c7125 = !((clueAt(cl.number, _t7124) !== -1)); } return _c7125; });
                                            for (let _i7127 = 0; _i7127 < _a7126.length; _i7127++) {
                                              const v_t = _a7126[_i7127];
                                              const _h7130 = clueAt(cl.number, v_t);
                                              const _h7131 = (_h7130 !== -1);
                                              const _h7132 = _h7131;
                                              const _h7133 = !(_h7132);
                                              const _a7128 = sp.adj4[v_t];
                                              for (let _i7129 = 0; _i7129 < _a7128.length; _i7129++) {
                                                const v_x = _a7128[_i7129];
                                                const _h7134 = clueAt(cl.number, v_x);
                                                let _c7136: boolean = (_h7133 && (_h7134 !== -1));
                                                if (_c7136) {
                                                  const _t7135 = sp.adj4Edges[v_t][_i7129];
                                                  _c7136 = ((_t7135 === _wc6556 ? _wd6557 : (_t7135 === _wc6554 ? _wd6555 : (b.grid[_t7135] || -1))) === 1);
                                                }
                                                if (!(_c7136)) continue;
                                                if (!_g7108.includes(v_x)) _g7108.push(v_x);
                                              }
                                            }
                                          }
                                          const _a7137 = union(_g7101, _g7108);
                                          for (let _i7138 = 0; _i7138 < _a7137.length; _i7138++) {
                                            const v_p = _a7137[_i7138];
                                            const _h7177 = clueAt(cl.number, v_p);
                                            _g7139.length = 0;
                                            G7140: {
                                              const _a7143 = setOf(v_z);
                                              for (let _i7144 = 0; _i7144 < _a7143.length; _i7144++) {
                                                const v_x = _a7143[_i7144];
                                                const _h7145 = clueAt(cl.number, v_x);
                                                if (!((_h7145 !== -1))) continue;
                                                _g7139.push(v_x);
                                              }
                                            }
                                            _g7146.length = 0;
                                            G7147: {
                                              const _a7164 = throughWhere(sp, v_z, (_te7159: number): boolean => { let _c7161: boolean = ((_te7159 === _wc6556 ? _wd6557 : (_te7159 === _wc6554 ? _wd6555 : (b.grid[_te7159] || -1))) === 1); if (_c7161) {   const _t7160 = sp.edgeEnds[2 * _te7159];   _c7161 = !((clueAt(cl.number, _t7160) !== -1)); } let _c7163: boolean = _c7161; if (_c7163) {   const _t7162 = sp.edgeEnds[2 * _te7159 + 1];   _c7163 = !((clueAt(cl.number, _t7162) !== -1)); } return _c7163; });
                                              for (let _i7165 = 0; _i7165 < _a7164.length; _i7165++) {
                                                const v_t = _a7164[_i7165];
                                                const _h7168 = clueAt(cl.number, v_t);
                                                const _h7169 = (_h7168 !== -1);
                                                const _h7170 = _h7169;
                                                const _h7171 = !(_h7170);
                                                const _a7166 = sp.adj4[v_t];
                                                for (let _i7167 = 0; _i7167 < _a7166.length; _i7167++) {
                                                  const v_x = _a7166[_i7167];
                                                  const _h7172 = clueAt(cl.number, v_x);
                                                  let _c7174: boolean = (_h7171 && (_h7172 !== -1));
                                                  if (_c7174) {
                                                    const _t7173 = sp.adj4Edges[v_t][_i7167];
                                                    _c7174 = ((_t7173 === _wc6556 ? _wd6557 : (_t7173 === _wc6554 ? _wd6555 : (b.grid[_t7173] || -1))) === 1);
                                                  }
                                                  if (!(_c7174)) continue;
                                                  if (!_g7146.includes(v_x)) _g7146.push(v_x);
                                                }
                                              }
                                            }
                                            const _a7175 = union(_g7139, _g7146);
                                            for (let _i7176 = 0; _i7176 < _a7175.length; _i7176++) {
                                              const v_q = _a7175[_i7176];
                                              const _h7178 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h7177 - _h7178)) === cl.step))) {
                                                _q7099 = false;
                                                break Q7100;
                                              }
                                            }
                                          }
                                        }
                                        _c7179 = _q7099;
                                      }
                                      if ((_c7179 && (_h5369 || !(throughWhere(sp, v_s, (_te7180: number): boolean => {  return ((_te7180 === _wc6556 ? _wd6557 : (_te7180 === _wc6554 ? _wd6555 : (b.grid[_te7180] || -1))) === 1); }).includes(v_z))))) {
                                        _q7053 = true;
                                        break Q7054;
                                      }
                                    }
                                  }
                                  _c7181 = _q7053;
                                }
                                if (_c7181) {
                                  _q6906 = true;
                                  break Q6907;
                                }
                              }
                            }
                            _c7182 = !(_q6906);
                          }
                          if (_c7182) {
                            _q6883 = true;
                            break Q6884;
                          }
                        }
                      }
                      _c7183 = _q6883;
                    }
                    if (_c7183) {
                      _q6558 = true;
                      break Q6559;
                    }
                  }
                }
                _c7184 = _q6558;
              }
              _c7185 = _c7184;
            }
            if (!(_c7185)) continue;
            const _t7187 = minus(v_U, setOf(_h7186, v_i, v_j));
            const _t7188 = (_t7187.length > 0 ? _t7187[0] : -1);
            if (!_g5983.includes(_t7188)) _g5983.push(_t7188);
          }
        }
      }
      const v_B = _g5983;
      const _h7223 = v_B.length;
      const _h7224 = (_h7223 === 3);
      _g7189.length = 0;
      G7190: {
        const _a7200 = v_U;
        for (let _i7201 = 0; _i7201 < _a7200.length; _i7201++) {
          const v_y = _a7200[_i7201];
          let _c7210: boolean = ((_i7201 === 0) && _h7203);
          if (!_c7210) {
            let _c7209: boolean = (_i7201 > 0);
            if (_c7209) {
              let _c7208: boolean = !(v_A.includes(v_y));
              if (!_c7208) {
                let _q7204 = false;
                Q7205: {
                  const _a7206 = v_U;
                  for (let _i7207 = 0; _i7207 < _a7206.length; _i7207++) {
                    const v_m = _a7206[_i7207];
                    if (!(((_i7207 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q7204 = true;
                      break Q7205;
                    }
                  }
                }
                _c7208 = _q7204;
              }
              _c7209 = _c7208;
            }
            _c7210 = _c7209;
          }
          if (!(_c7210)) continue;
          _g7189.push(v_y);
        }
      }
      const v_N = _g7189;
      const _h7232 = v_N.length;
      _g7211.length = 0;
      G7212: {
        const _a7221 = v_N;
        for (let _i7222 = 0; _i7222 < _a7221.length; _i7222++) {
          const v_y = _a7221[_i7222];
          let _c7230: boolean = ((v_U.indexOf(v_y) === 0) && _h7224);
          if (!_c7230) {
            let _c7229: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c7229) {
              let _q7225 = true;
              Q7226: {
                const _a7227 = v_U;
                for (let _i7228 = 0; _i7228 < _a7227.length; _i7228++) {
                  const v_m = _a7227[_i7228];
                  if (!(((_i7228 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q7225 = false;
                    break Q7226;
                  }
                }
              }
              _c7229 = _q7225;
            }
            _c7230 = _c7229;
          }
          if (!(_c7230)) continue;
          _g7211.push(v_y);
        }
      }
      const v_P = _g7211;
      const _h7233 = v_P.length;
      L7231: {
        const v_X = minus(v_U, v_N);
        const _h7234 = v_X.length;
        if (!((((_h7232 === 0) || (_h7233 > 0)) || (_h7234 > 0)))) break L7231;
        facts.length = 0;
        changed = false;
        let _c7240: boolean = (_h7232 > 0);
        if (_c7240) {
          let _q7235 = true;
          Q7236: {
            const _a7237 = v_P;
            for (let _i7238 = 0; _i7238 < _a7237.length; _i7238++) {
              const v_y = _a7237[_i7238];
              const _t7239 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t7239] !== 0)) { if (fire === null) { b.placeAt(_t7239, 1); changed = true; } else facts.push(PLACE, _t7239, 1); }
              if (!(true)) {
                _q7235 = false;
                break Q7236;
              }
            }
          }
          _c7240 = _q7235;
        }
        let _c7247: boolean = _c7240;
        if (_c7247) {
          let _c7246: boolean = !((_h7233 === 0));
          if (!_c7246) {
            let _q7241 = true;
            Q7242: {
              const _a7243 = v_X;
              for (let _i7244 = 0; _i7244 < _a7243.length; _i7244++) {
                const v_y = _a7243[_i7244];
                const _t7245 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t7245] !== 0)) { if (fire === null) { b.placeAt(_t7245, 2); changed = true; } else facts.push(PLACE, _t7245, 2); }
                if (!(true)) {
                  _q7241 = false;
                  break Q7242;
                }
              }
            }
            _c7246 = _q7241;
          }
          _c7247 = _c7246;
        }
        if (!(_c7247)) return -1;
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
