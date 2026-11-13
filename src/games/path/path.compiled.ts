// Compiled by `npm run describe` from src/games/path/path.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, freshBinding, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, stamps, throughWhere, type Kept, type Reads, type Witness, union, witnessAll } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

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

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  forced: ForcedSays;
  lineBreaks: LineBreaksSays;
  pairBreaks: PairBreaksSays;
  weighed: WeighedSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["forced","lineBreaks","pairBreaks","weighed"] as const;

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
  const _g16: number[] = [];
  const _g21: number[] = [];
  const _st32 = stamps();
  const _g82: number[] = [];
  const _g87: number[] = [];
  const _st98 = stamps();
  const _domain = rangeMask(1, 2);
  const _k10 = takesKept.board(cl);
  const _h65 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _g5 = 0;
      G6: {
        const _a7 = sp.adj4[v_c];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const _h9 = (g[sp.adj4Edges[v_c][_i8]] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      if (!((_g5 === (_k10[v_c] ?? takes(sp, cl, v_c))))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q11 = true;
  Q12: {
    const _a13 = sp.cells;
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_c = _a13[_i14];
      const _h15 = clueAt(cl.number, v_c);
      if (!(!((_h15 !== -1)))) continue;
      _g16.length = 0;
      G17: {
        for (let _i19 = 0; _i19 < 1; _i19++) {
          const v_x = v_c;
          const _h20 = clueAt(cl.number, v_x);
          if (!((_h20 !== -1))) continue;
          _g16.push(v_x);
        }
      }
      _g21.length = 0;
      _st32.pass++;
      G22: {
        const _a38 = throughWhere(sp, v_c, (_te33: number): boolean => { let _c35: boolean = ((g[_te33] || -1) === 1); if (_c35) {   const _t34 = sp.edgeEnds[2 * _te33];   _c35 = !((clueAt(cl.number, _t34) !== -1)); } let _c37: boolean = _c35; if (_c37) {   const _t36 = sp.edgeEnds[2 * _te33 + 1];   _c37 = !((clueAt(cl.number, _t36) !== -1)); } return _c37; });
        for (let _i39 = 0; _i39 < _a38.length; _i39++) {
          const v_t = _a38[_i39];
          const _h42 = clueAt(cl.number, v_t);
          const _h43 = (_h42 !== -1);
          const _h44 = _h43;
          const _h45 = !(_h44);
          const _a40 = sp.adj4[v_t];
          for (let _i41 = 0; _i41 < _a40.length; _i41++) {
            const v_x = _a40[_i41];
            const _h46 = clueAt(cl.number, v_x);
            const _h47 = (g[sp.adj4Edges[v_t][_i41]] || -1);
            if (!(((_h45 && (_h46 !== -1)) && (_h47 === 1)))) continue;
            const _t48 = v_x;
            if (_g21.length < 16) { if (!_g21.includes(_t48)) _g21.push(_t48); } else addOnce(_g21, _st32, _t48);
          }
        }
      }
      if (!((union(_g16, _g21).length === 2))) {
        _q11 = false;
        break Q12;
      }
    }
  }
  if (!(_q11)) return false;
  let _c54: boolean = (cl.step === 0);
  if (!_c54) {
    let _q49 = false;
    Q50: {
      const _a51 = sp.cells;
      for (let _i52 = 0; _i52 < _a51.length; _i52++) {
        const v_x = _a51[_i52];
        const _h53 = clueAt(cl.number, v_x);
        if ((_h53 === 2)) {
          _q49 = true;
          break Q50;
        }
      }
    }
    _c54 = _q49;
  }
  let _c74: boolean = _c54;
  if (_c74) {
    let _q55 = true;
    Q56: {
      const _a57 = sp.cells;
      for (let _i58 = 0; _i58 < _a57.length; _i58++) {
        const v_x = _a57[_i58];
        const _h59 = clueAt(cl.number, v_x);
        if (!((_h59 !== -1))) continue;
        const _h71 = (_h59 - 1);
        let _g60 = 0;
        G61: {
          const _a62 = cluesValued(cl.number, _h59);
          for (let _i63 = 0; _i63 < _a62.length; _i63++) {
            const v_y = _a62[_i63];
            const _h64 = clueAt(cl.number, v_y);
            if (!((_h64 === _h59))) continue;
            _g60++;
          }
        }
        let _c73: boolean = (_g60 === _h65);
        if (_c73) {
          let _c72: boolean = (_h59 === 1);
          if (!_c72) {
            let _q66 = false;
            Q67: {
              const _a68 = sp.cells;
              for (let _i69 = 0; _i69 < _a68.length; _i69++) {
                const v_y = _a68[_i69];
                const _h70 = clueAt(cl.number, v_y);
                if ((_h70 === _h71)) {
                  _q66 = true;
                  break Q67;
                }
              }
            }
            _c72 = _q66;
          }
          _c73 = _c72;
        }
        if (!(_c73)) {
          _q55 = false;
          break Q56;
        }
      }
    }
    _c74 = _q55;
  }
  if (!(_c74)) return false;
  for (let _k75 = 0; _k75 < cl.number.at.length; _k75++) {
    const _at76 = cl.number.at[_k75];
    let _q78 = true;
    Q79: {
      const _a80 = sp.adj4[_at76];
      for (let _i81 = 0; _i81 < _a80.length; _i81++) {
        const v_y = _a80[_i81];
        if (!(((g[sp.adj4Edges[_at76][_i81]] || -1) === 1))) continue;
        _g82.length = 0;
        G83: {
          for (let _i85 = 0; _i85 < 1; _i85++) {
            const v_x = v_y;
            const _h86 = clueAt(cl.number, v_x);
            if (!((_h86 !== -1))) continue;
            _g82.push(v_x);
          }
        }
        _g87.length = 0;
        _st98.pass++;
        G88: {
          const _a104 = throughWhere(sp, v_y, (_te99: number): boolean => { let _c101: boolean = ((g[_te99] || -1) === 1); if (_c101) {   const _t100 = sp.edgeEnds[2 * _te99];   _c101 = !((clueAt(cl.number, _t100) !== -1)); } let _c103: boolean = _c101; if (_c103) {   const _t102 = sp.edgeEnds[2 * _te99 + 1];   _c103 = !((clueAt(cl.number, _t102) !== -1)); } return _c103; });
          for (let _i105 = 0; _i105 < _a104.length; _i105++) {
            const v_t = _a104[_i105];
            const _h108 = clueAt(cl.number, v_t);
            const _h109 = (_h108 !== -1);
            const _h110 = _h109;
            const _h111 = !(_h110);
            const _a106 = sp.adj4[v_t];
            for (let _i107 = 0; _i107 < _a106.length; _i107++) {
              const v_x = _a106[_i107];
              const _h112 = clueAt(cl.number, v_x);
              const _h113 = (g[sp.adj4Edges[v_t][_i107]] || -1);
              if (!(((_h111 && (_h112 !== -1)) && (_h113 === 1)))) continue;
              const _t114 = v_x;
              if (_g87.length < 16) { if (!_g87.includes(_t114)) _g87.push(_t114); } else addOnce(_g87, _st98, _t114);
            }
          }
        }
        const _a115 = union(_g82, _g87);
        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
          const v_q = _a115[_i116];
          if (!((v_q !== _at76))) continue;
          const _h118 = clueAt(cl.number, v_q);
          const _h117 = clueAt(cl.number, _at76);
          if (!((Math.abs((_h117 - _h118)) === cl.step))) {
            _q78 = false;
            break Q79;
          }
        }
      }
    }
    if (!(_q78)) return false;
  }
  for (let _k119 = 0; _k119 < cl.wall.at.length; _k119++) {
    const _at120 = cl.wall.at[_k119];
    if (!(((g[_at120] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ForcedSays {
  terms: { c: number; n: number; };
  marks: {  };
}

const forcedFacts: number[] = [];
let forcedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function forced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ForcedBinding, ForcedSays> | null): number {
  const facts = forcedFacts;
  let fired = 0;
  let changed = false;
  const _k10 = takesKept.board(cl);
  if (forcedCands.length < sp.edges.length) forcedCands = new Int32Array(sp.edges.length);
  const cands = forcedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h28 = clueAt(cl.number, v_c);
    const _h29 = (_h28 !== -1);
    const _h30 = _h29;
    let _g11 = 0;
    G12: {
      const _a13 = sp.adj4[v_c];
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i14]] || -1) === 1))) continue;
        _g11++;
      }
    }
    const v_n = ((_k10[v_c] ?? takes(sp, cl, v_c)) - _g11);
    L15: {
      const v_U = ways(b, sp, cl, v_c);
      const _h16 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h16 <= v_n))))) break L15;
      if (DEV && staleChecking) {
        let _g17 = 0;
        G18: {
          const _a19 = sp.adj4[v_c];
          for (let _i20 = 0; _i20 < _a19.length; _i20++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i20]] || -1) === 1))) continue;
            _g17++;
          }
        }
        freshBinding("forced", [(sp.cells.includes(v_c)), (v_n === (takes(sp, cl, v_c) - _g17)), sameSet(v_U, ways(b, sp, cl, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c31: boolean = ((v_n >= 0) && (_h16 === v_n));
      if (_c31) {
        let _q21 = true;
        Q22: {
          const _a23 = v_U;
          for (let _i24 = 0; _i24 < _a23.length; _i24++) {
            const v_i = _a23[_i24];
            const _a25 = v_U;
            const _n26 = _i24;
            for (let _i27 = 0; _i27 < _n26; _i27++) {
              const v_j = _a25[_i27];
              if (!((!(piece(b, sp, v_i).includes(v_j)) && (_h30 || meetsMarked(b, sp, cl, cands, v_i, v_j))))) {
                _q21 = false;
                break Q22;
              }
            }
          }
        }
        _c31 = _q21;
      }
      let _c37: boolean = _c31;
      if (_c37) {
        let _q32 = true;
        Q33: {
          const _a34 = v_U;
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_y = _a34[_i35];
            const _t36 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t36] !== 0)) { if (fire === null) { b.placeAt(_t36, 1); changed = true; } else facts.push(PLACE, _t36, 1); }
            if (!(true)) {
              _q32 = false;
              break Q33;
            }
          }
        }
        _c37 = _q32;
      }
      if (!(_c37)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { c: v_c, n: v_n }, marks: {  } };
          if (!fire({ c: v_c, n: v_n, U: v_U.slice() }, facts, _says)) return 1;
        }
        cands.fill(-1);
        meetsMarkedKept.clear();
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LineBreaksSays {
  terms: { e: number; };
  marks: {  };
  witness: Witness | null;
  reads: Reads;
}

const lineBreaksFacts: number[] = [];
let lineBreaksCands = new Int32Array(0);
const lineBreaks_st625 = stamps();
const lineBreaks_st664 = stamps();
const lineBreaks_st771 = stamps();
const lineBreaks_st810 = stamps();
const lineBreaks_st922 = stamps();
const lineBreaks_st960 = stamps();
const lineBreaks_st1066 = stamps();
const lineBreaks_st1104 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding, LineBreaksSays> | null): number {
  const _g606: number[] = [];
  const _g611: number[] = [];
  const _g646: number[] = [];
  const _g651: number[] = [];
  const _g752: number[] = [];
  const _g757: number[] = [];
  const _g792: number[] = [];
  const _g797: number[] = [];
  const _g904: number[] = [];
  const _g909: number[] = [];
  const _g942: number[] = [];
  const _g947: number[] = [];
  const _g1048: number[] = [];
  const _g1053: number[] = [];
  const _g1086: number[] = [];
  const _g1091: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h531 = (cl.step === 0);
  if (lineBreaksCands.length < sp.edges.length) lineBreaksCands = new Int32Array(sp.edges.length);
  const cands = lineBreaksCands;
  cands.fill(-1);
  liveMarkedKept.clear();
  meetsMarkedKept.clear();
  const _a511 = sp.edges;
  for (let _i512 = 0; _i512 < _a511.length; _i512++) {
    const v_e = _a511[_i512];
    const v_a = sp.edgeEnds[2 * v_e];
    L513: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c1132: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
      if (_c1132) {
        let _c1131: boolean = (throughWhere(sp, v_a, (_te514: number): boolean => {  return ((b.grid[_te514] || -1) === 1); }).includes(v_b));
        if (!_c1131) {
          const _wc515 = v_e;
          const _wd516 = 1;
          let _q517 = false;
          Q518: {
            const _a520 = throughWhere(sp, v_a, (_te519: number): boolean => {  return ((_te519 === _wc515 ? _wd516 : (b.grid[_te519] || -1)) === 1); });
            for (let _i521 = 0; _i521 < _a520.length; _i521++) {
              const v_t = _a520[_i521];
              let _c541: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c541) {
                let _g522 = 0;
                G523: {
                  const _a524 = sp.adj4[v_t];
                  for (let _i525 = 0; _i525 < _a524.length; _i525++) {
                    const _t526 = sp.adj4Edges[v_t][_i525];
                    if (!(((_t526 === _wc515 ? _wd516 : (b.grid[_t526] || -1)) === 1))) continue;
                    _g522++;
                  }
                }
                let _g527 = 0;
                G528: {
                  for (let _i529 = 0; _i529 < 1; _i529++) {
                    const v_k = v_t;
                    const _h530 = clueAt(cl.number, v_k);
                    const _h538 = (_h530 + 1);
                    let _c540: boolean = (_h530 !== -1);
                    if (_c540) {
                      let _c539: boolean = (_h531 || (_h530 === 1));
                      if (!_c539) {
                        let _g532 = 0;
                        G533: {
                          const _t534 = (_h530 + 1);
                          const _a535 = cluesValued(cl.number, _t534);
                          for (let _i536 = 0; _i536 < _a535.length; _i536++) {
                            const v_x = _a535[_i536];
                            const _h537 = clueAt(cl.number, v_x);
                            if (!((_h537 === _h538))) continue;
                            _g532++;
                          }
                        }
                        _c539 = (_g532 === 0);
                      }
                      _c540 = _c539;
                    }
                    if (!(_c540)) continue;
                    _g527++;
                  }
                }
                _c541 = (_g522 < (2 - _g527));
              }
              if (!(_c541)) continue;
              let _g542 = 0;
              G543: {
                const _a544 = sp.adj4[v_t];
                for (let _i545 = 0; _i545 < _a544.length; _i545++) {
                  const _t546 = sp.adj4Edges[v_t][_i545];
                  if (!(((_t546 === _wc515 ? _wd516 : (b.grid[_t546] || -1)) === 1))) continue;
                  _g542++;
                }
              }
              let _g547 = 0;
              G548: {
                for (let _i549 = 0; _i549 < 1; _i549++) {
                  const v_k = v_t;
                  const _h550 = clueAt(cl.number, v_k);
                  const _h557 = (_h550 + 1);
                  let _c559: boolean = (_h550 !== -1);
                  if (_c559) {
                    let _c558: boolean = (_h531 || (_h550 === 1));
                    if (!_c558) {
                      let _g551 = 0;
                      G552: {
                        const _t553 = (_h550 + 1);
                        const _a554 = cluesValued(cl.number, _t553);
                        for (let _i555 = 0; _i555 < _a554.length; _i555++) {
                          const v_x = _a554[_i555];
                          const _h556 = clueAt(cl.number, v_x);
                          if (!((_h556 === _h557))) continue;
                          _g551++;
                        }
                      }
                      _c558 = (_g551 === 0);
                    }
                    _c559 = _c558;
                  }
                  if (!(_c559)) continue;
                  _g547++;
                }
              }
              let _c835: boolean = (_g542 < (2 - _g547));
              if (_c835) {
                let _q560 = false;
                Q561: {
                  const _a562 = sp.adj4[v_t];
                  for (let _i563 = 0; _i563 < _a562.length; _i563++) {
                    const v_y = _a562[_i563];
                    const _t564 = sp.adj4Edges[v_t][_i563];
                    let _c583: boolean = !((_t564 === _wc515 ? true : (b.grid[_t564] !== 0)));
                    if (_c583) {
                      let _g565 = 0;
                      G566: {
                        const _a567 = sp.adj4[v_t];
                        for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                          const _t569 = sp.adj4Edges[v_t][_i568];
                          if (!(((_t569 === _wc515 ? _wd516 : (b.grid[_t569] || -1)) === 1))) continue;
                          _g565++;
                        }
                      }
                      let _g570 = 0;
                      G571: {
                        for (let _i572 = 0; _i572 < 1; _i572++) {
                          const v_k = v_t;
                          const _h573 = clueAt(cl.number, v_k);
                          const _h580 = (_h573 + 1);
                          let _c582: boolean = (_h573 !== -1);
                          if (_c582) {
                            let _c581: boolean = (_h531 || (_h573 === 1));
                            if (!_c581) {
                              let _g574 = 0;
                              G575: {
                                const _t576 = (_h573 + 1);
                                const _a577 = cluesValued(cl.number, _t576);
                                for (let _i578 = 0; _i578 < _a577.length; _i578++) {
                                  const v_x = _a577[_i578];
                                  const _h579 = clueAt(cl.number, v_x);
                                  if (!((_h579 === _h580))) continue;
                                  _g574++;
                                }
                              }
                              _c581 = (_g574 === 0);
                            }
                            _c582 = _c581;
                          }
                          if (!(_c582)) continue;
                          _g570++;
                        }
                      }
                      _c583 = (_g565 < (2 - _g570));
                    }
                    let _c603: boolean = _c583;
                    if (_c603) {
                      let _g584 = 0;
                      G585: {
                        const _a587 = sp.adj4[v_y];
                        for (let _i588 = 0; _i588 < _a587.length; _i588++) {
                          const _t589 = sp.adj4Edges[v_y][_i588];
                          if (!(((_t589 === _wc515 ? _wd516 : (b.grid[_t589] || -1)) === 1))) continue;
                          _g584++;
                        }
                      }
                      let _g590 = 0;
                      G591: {
                        for (let _i592 = 0; _i592 < 1; _i592++) {
                          const v_k = v_y;
                          const _h593 = clueAt(cl.number, v_k);
                          const _h600 = (_h593 + 1);
                          let _c602: boolean = (_h593 !== -1);
                          if (_c602) {
                            let _c601: boolean = (_h531 || (_h593 === 1));
                            if (!_c601) {
                              let _g594 = 0;
                              G595: {
                                const _t596 = (_h593 + 1);
                                const _a597 = cluesValued(cl.number, _t596);
                                for (let _i598 = 0; _i598 < _a597.length; _i598++) {
                                  const v_x = _a597[_i598];
                                  const _h599 = clueAt(cl.number, v_x);
                                  if (!((_h599 === _h600))) continue;
                                  _g594++;
                                }
                              }
                              _c601 = (_g594 === 0);
                            }
                            _c602 = _c601;
                          }
                          if (!(_c602)) continue;
                          _g590++;
                        }
                      }
                      _c603 = (_g584 < (2 - _g590));
                    }
                    let _c686: boolean = _c603;
                    if (_c686) {
                      let _q604 = true;
                      Q605: {
                        _g606.length = 0;
                        G607: {
                          for (let _i609 = 0; _i609 < 1; _i609++) {
                            const v_x = v_t;
                            const _h610 = clueAt(cl.number, v_x);
                            if (!((_h610 !== -1))) continue;
                            _g606.push(v_x);
                          }
                        }
                        _g611.length = 0;
                        lineBreaks_st625.pass++;
                        G612: {
                          const _a632 = throughWhere(sp, v_t, (_te627: number): boolean => { let _c629: boolean = ((_te627 === _wc515 ? _wd516 : (b.grid[_te627] || -1)) === 1); if (_c629) {   const _t628 = sp.edgeEnds[2 * _te627];   _c629 = !((clueAt(cl.number, _t628) !== -1)); } let _c631: boolean = _c629; if (_c631) {   const _t630 = sp.edgeEnds[2 * _te627 + 1];   _c631 = !((clueAt(cl.number, _t630) !== -1)); } return _c631; });
                          for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                            const v_t_626 = _a632[_i633];
                            const _h636 = clueAt(cl.number, v_t_626);
                            const _h637 = (_h636 !== -1);
                            const _h638 = _h637;
                            const _h639 = !(_h638);
                            const _a634 = sp.adj4[v_t_626];
                            for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                              const v_x = _a634[_i635];
                              const _h640 = clueAt(cl.number, v_x);
                              let _c642: boolean = (_h639 && (_h640 !== -1));
                              if (_c642) {
                                const _t641 = sp.adj4Edges[v_t_626][_i635];
                                _c642 = ((_t641 === _wc515 ? _wd516 : (b.grid[_t641] || -1)) === 1);
                              }
                              if (!(_c642)) continue;
                              const _t643 = v_x;
                              if (_g611.length < 16) { if (!_g611.includes(_t643)) _g611.push(_t643); } else addOnce(_g611, lineBreaks_st625, _t643);
                            }
                          }
                        }
                        const _a644 = union(_g606, _g611);
                        for (let _i645 = 0; _i645 < _a644.length; _i645++) {
                          const v_p = _a644[_i645];
                          const _h684 = clueAt(cl.number, v_p);
                          _g646.length = 0;
                          G647: {
                            for (let _i649 = 0; _i649 < 1; _i649++) {
                              const v_x = v_y;
                              const _h650 = clueAt(cl.number, v_x);
                              if (!((_h650 !== -1))) continue;
                              _g646.push(v_x);
                            }
                          }
                          _g651.length = 0;
                          lineBreaks_st664.pass++;
                          G652: {
                            const _a670 = throughWhere(sp, v_y, (_te665: number): boolean => { let _c667: boolean = ((_te665 === _wc515 ? _wd516 : (b.grid[_te665] || -1)) === 1); if (_c667) {   const _t666 = sp.edgeEnds[2 * _te665];   _c667 = !((clueAt(cl.number, _t666) !== -1)); } let _c669: boolean = _c667; if (_c669) {   const _t668 = sp.edgeEnds[2 * _te665 + 1];   _c669 = !((clueAt(cl.number, _t668) !== -1)); } return _c669; });
                            for (let _i671 = 0; _i671 < _a670.length; _i671++) {
                              const v_t = _a670[_i671];
                              const _h674 = clueAt(cl.number, v_t);
                              const _h675 = (_h674 !== -1);
                              const _h676 = _h675;
                              const _h677 = !(_h676);
                              const _a672 = sp.adj4[v_t];
                              for (let _i673 = 0; _i673 < _a672.length; _i673++) {
                                const v_x = _a672[_i673];
                                const _h678 = clueAt(cl.number, v_x);
                                let _c680: boolean = (_h677 && (_h678 !== -1));
                                if (_c680) {
                                  const _t679 = sp.adj4Edges[v_t][_i673];
                                  _c680 = ((_t679 === _wc515 ? _wd516 : (b.grid[_t679] || -1)) === 1);
                                }
                                if (!(_c680)) continue;
                                const _t681 = v_x;
                                if (_g651.length < 16) { if (!_g651.includes(_t681)) _g651.push(_t681); } else addOnce(_g651, lineBreaks_st664, _t681);
                              }
                            }
                          }
                          const _a682 = union(_g646, _g651);
                          for (let _i683 = 0; _i683 < _a682.length; _i683++) {
                            const v_q = _a682[_i683];
                            const _h685 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h684 - _h685)) === cl.step))) {
                              _q604 = false;
                              break Q605;
                            }
                          }
                        }
                      }
                      _c686 = _q604;
                    }
                    if (!((_c686 && (_h531 || !(throughWhere(sp, v_t, (_te687: number): boolean => {  return ((_te687 === _wc515 ? _wd516 : (b.grid[_te687] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g688 = 0;
                    G689: {
                      const _a690 = sp.adj4[v_t];
                      for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                        const _t692 = sp.adj4Edges[v_t][_i691];
                        if (!(((_t692 === _wc515 ? _wd516 : (b.grid[_t692] || -1)) === 1))) continue;
                        _g688++;
                      }
                    }
                    let _g693 = 0;
                    G694: {
                      for (let _i695 = 0; _i695 < 1; _i695++) {
                        const v_k = v_t;
                        const _h696 = clueAt(cl.number, v_k);
                        const _h703 = (_h696 + 1);
                        let _c705: boolean = (_h696 !== -1);
                        if (_c705) {
                          let _c704: boolean = (_h531 || (_h696 === 1));
                          if (!_c704) {
                            let _g697 = 0;
                            G698: {
                              const _t699 = (_h696 + 1);
                              const _a700 = cluesValued(cl.number, _t699);
                              for (let _i701 = 0; _i701 < _a700.length; _i701++) {
                                const v_x = _a700[_i701];
                                const _h702 = clueAt(cl.number, v_x);
                                if (!((_h702 === _h703))) continue;
                                _g697++;
                              }
                            }
                            _c704 = (_g697 === 0);
                          }
                          _c705 = _c704;
                        }
                        if (!(_c705)) continue;
                        _g693++;
                      }
                    }
                    let _c834: boolean = ((_g688 + 1) === (2 - _g693));
                    if (!_c834) {
                      let _q706 = false;
                      Q707: {
                        const _a708 = sp.adj4[v_t];
                        const _n709 = _i563;
                        for (let _i710 = 0; _i710 < _n709; _i710++) {
                          const v_z = _a708[_i710];
                          const _t711 = sp.adj4Edges[v_t][_i710];
                          let _c730: boolean = !((_t711 === _wc515 ? true : (b.grid[_t711] !== 0)));
                          if (_c730) {
                            let _g712 = 0;
                            G713: {
                              const _a714 = sp.adj4[v_t];
                              for (let _i715 = 0; _i715 < _a714.length; _i715++) {
                                const _t716 = sp.adj4Edges[v_t][_i715];
                                if (!(((_t716 === _wc515 ? _wd516 : (b.grid[_t716] || -1)) === 1))) continue;
                                _g712++;
                              }
                            }
                            let _g717 = 0;
                            G718: {
                              for (let _i719 = 0; _i719 < 1; _i719++) {
                                const v_k = v_t;
                                const _h720 = clueAt(cl.number, v_k);
                                const _h727 = (_h720 + 1);
                                let _c729: boolean = (_h720 !== -1);
                                if (_c729) {
                                  let _c728: boolean = (_h531 || (_h720 === 1));
                                  if (!_c728) {
                                    let _g721 = 0;
                                    G722: {
                                      const _t723 = (_h720 + 1);
                                      const _a724 = cluesValued(cl.number, _t723);
                                      for (let _i725 = 0; _i725 < _a724.length; _i725++) {
                                        const v_x = _a724[_i725];
                                        const _h726 = clueAt(cl.number, v_x);
                                        if (!((_h726 === _h727))) continue;
                                        _g721++;
                                      }
                                    }
                                    _c728 = (_g721 === 0);
                                  }
                                  _c729 = _c728;
                                }
                                if (!(_c729)) continue;
                                _g717++;
                              }
                            }
                            _c730 = (_g712 < (2 - _g717));
                          }
                          let _c749: boolean = _c730;
                          if (_c749) {
                            let _g731 = 0;
                            G732: {
                              const _a733 = sp.adj4[v_z];
                              for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                                const _t735 = sp.adj4Edges[v_z][_i734];
                                if (!(((_t735 === _wc515 ? _wd516 : (b.grid[_t735] || -1)) === 1))) continue;
                                _g731++;
                              }
                            }
                            let _g736 = 0;
                            G737: {
                              for (let _i738 = 0; _i738 < 1; _i738++) {
                                const v_k = v_z;
                                const _h739 = clueAt(cl.number, v_k);
                                const _h746 = (_h739 + 1);
                                let _c748: boolean = (_h739 !== -1);
                                if (_c748) {
                                  let _c747: boolean = (_h531 || (_h739 === 1));
                                  if (!_c747) {
                                    let _g740 = 0;
                                    G741: {
                                      const _t742 = (_h739 + 1);
                                      const _a743 = cluesValued(cl.number, _t742);
                                      for (let _i744 = 0; _i744 < _a743.length; _i744++) {
                                        const v_x = _a743[_i744];
                                        const _h745 = clueAt(cl.number, v_x);
                                        if (!((_h745 === _h746))) continue;
                                        _g740++;
                                      }
                                    }
                                    _c747 = (_g740 === 0);
                                  }
                                  _c748 = _c747;
                                }
                                if (!(_c748)) continue;
                                _g736++;
                              }
                            }
                            _c749 = (_g731 < (2 - _g736));
                          }
                          let _c832: boolean = _c749;
                          if (_c832) {
                            let _q750 = true;
                            Q751: {
                              _g752.length = 0;
                              G753: {
                                for (let _i755 = 0; _i755 < 1; _i755++) {
                                  const v_x = v_t;
                                  const _h756 = clueAt(cl.number, v_x);
                                  if (!((_h756 !== -1))) continue;
                                  _g752.push(v_x);
                                }
                              }
                              _g757.length = 0;
                              lineBreaks_st771.pass++;
                              G758: {
                                const _a778 = throughWhere(sp, v_t, (_te773: number): boolean => { let _c775: boolean = ((_te773 === _wc515 ? _wd516 : (b.grid[_te773] || -1)) === 1); if (_c775) {   const _t774 = sp.edgeEnds[2 * _te773];   _c775 = !((clueAt(cl.number, _t774) !== -1)); } let _c777: boolean = _c775; if (_c777) {   const _t776 = sp.edgeEnds[2 * _te773 + 1];   _c777 = !((clueAt(cl.number, _t776) !== -1)); } return _c777; });
                                for (let _i779 = 0; _i779 < _a778.length; _i779++) {
                                  const v_t_772 = _a778[_i779];
                                  const _h782 = clueAt(cl.number, v_t_772);
                                  const _h783 = (_h782 !== -1);
                                  const _h784 = _h783;
                                  const _h785 = !(_h784);
                                  const _a780 = sp.adj4[v_t_772];
                                  for (let _i781 = 0; _i781 < _a780.length; _i781++) {
                                    const v_x = _a780[_i781];
                                    const _h786 = clueAt(cl.number, v_x);
                                    let _c788: boolean = (_h785 && (_h786 !== -1));
                                    if (_c788) {
                                      const _t787 = sp.adj4Edges[v_t_772][_i781];
                                      _c788 = ((_t787 === _wc515 ? _wd516 : (b.grid[_t787] || -1)) === 1);
                                    }
                                    if (!(_c788)) continue;
                                    const _t789 = v_x;
                                    if (_g757.length < 16) { if (!_g757.includes(_t789)) _g757.push(_t789); } else addOnce(_g757, lineBreaks_st771, _t789);
                                  }
                                }
                              }
                              const _a790 = union(_g752, _g757);
                              for (let _i791 = 0; _i791 < _a790.length; _i791++) {
                                const v_p = _a790[_i791];
                                const _h830 = clueAt(cl.number, v_p);
                                _g792.length = 0;
                                G793: {
                                  for (let _i795 = 0; _i795 < 1; _i795++) {
                                    const v_x = v_z;
                                    const _h796 = clueAt(cl.number, v_x);
                                    if (!((_h796 !== -1))) continue;
                                    _g792.push(v_x);
                                  }
                                }
                                _g797.length = 0;
                                lineBreaks_st810.pass++;
                                G798: {
                                  const _a816 = throughWhere(sp, v_z, (_te811: number): boolean => { let _c813: boolean = ((_te811 === _wc515 ? _wd516 : (b.grid[_te811] || -1)) === 1); if (_c813) {   const _t812 = sp.edgeEnds[2 * _te811];   _c813 = !((clueAt(cl.number, _t812) !== -1)); } let _c815: boolean = _c813; if (_c815) {   const _t814 = sp.edgeEnds[2 * _te811 + 1];   _c815 = !((clueAt(cl.number, _t814) !== -1)); } return _c815; });
                                  for (let _i817 = 0; _i817 < _a816.length; _i817++) {
                                    const v_t = _a816[_i817];
                                    const _h820 = clueAt(cl.number, v_t);
                                    const _h821 = (_h820 !== -1);
                                    const _h822 = _h821;
                                    const _h823 = !(_h822);
                                    const _a818 = sp.adj4[v_t];
                                    for (let _i819 = 0; _i819 < _a818.length; _i819++) {
                                      const v_x = _a818[_i819];
                                      const _h824 = clueAt(cl.number, v_x);
                                      let _c826: boolean = (_h823 && (_h824 !== -1));
                                      if (_c826) {
                                        const _t825 = sp.adj4Edges[v_t][_i819];
                                        _c826 = ((_t825 === _wc515 ? _wd516 : (b.grid[_t825] || -1)) === 1);
                                      }
                                      if (!(_c826)) continue;
                                      const _t827 = v_x;
                                      if (_g797.length < 16) { if (!_g797.includes(_t827)) _g797.push(_t827); } else addOnce(_g797, lineBreaks_st810, _t827);
                                    }
                                  }
                                }
                                const _a828 = union(_g792, _g797);
                                for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                                  const v_q = _a828[_i829];
                                  const _h831 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h830 - _h831)) === cl.step))) {
                                    _q750 = false;
                                    break Q751;
                                  }
                                }
                              }
                            }
                            _c832 = _q750;
                          }
                          if ((_c832 && (_h531 || !(throughWhere(sp, v_t, (_te833: number): boolean => {  return ((_te833 === _wc515 ? _wd516 : (b.grid[_te833] || -1)) === 1); }).includes(v_z))))) {
                            _q706 = true;
                            break Q707;
                          }
                        }
                      }
                      _c834 = _q706;
                    }
                    if (_c834) {
                      _q560 = true;
                      break Q561;
                    }
                  }
                }
                _c835 = !(_q560);
              }
              let _c1130: boolean = _c835;
              if (!_c1130) {
                let _q836 = false;
                Q837: {
                  const _a838 = sp.adj4[v_t];
                  for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                    const v_s = _a838[_i839];
                    let _g840 = 0;
                    G841: {
                      const _a842 = sp.adj4[v_s];
                      for (let _i843 = 0; _i843 < _a842.length; _i843++) {
                        const _t844 = sp.adj4Edges[v_s][_i843];
                        if (!(((_t844 === _wc515 ? _wd516 : (b.grid[_t844] || -1)) === 1))) continue;
                        _g840++;
                      }
                    }
                    let _g845 = 0;
                    G846: {
                      for (let _i847 = 0; _i847 < 1; _i847++) {
                        const v_k = v_s;
                        const _h848 = clueAt(cl.number, v_k);
                        const _h855 = (_h848 + 1);
                        let _c857: boolean = (_h848 !== -1);
                        if (_c857) {
                          let _c856: boolean = (_h531 || (_h848 === 1));
                          if (!_c856) {
                            let _g849 = 0;
                            G850: {
                              const _t851 = (_h848 + 1);
                              const _a852 = cluesValued(cl.number, _t851);
                              for (let _i853 = 0; _i853 < _a852.length; _i853++) {
                                const v_x = _a852[_i853];
                                const _h854 = clueAt(cl.number, v_x);
                                if (!((_h854 === _h855))) continue;
                                _g849++;
                              }
                            }
                            _c856 = (_g849 === 0);
                          }
                          _c857 = _c856;
                        }
                        if (!(_c857)) continue;
                        _g845++;
                      }
                    }
                    let _c1129: boolean = (_g840 < (2 - _g845));
                    if (_c1129) {
                      let _q858 = false;
                      Q859: {
                        const _a860 = sp.adj4[v_s];
                        for (let _i861 = 0; _i861 < _a860.length; _i861++) {
                          const v_y = _a860[_i861];
                          const _t862 = sp.adj4Edges[v_s][_i861];
                          let _c881: boolean = !((_t862 === _wc515 ? true : (b.grid[_t862] !== 0)));
                          if (_c881) {
                            let _g863 = 0;
                            G864: {
                              const _a865 = sp.adj4[v_s];
                              for (let _i866 = 0; _i866 < _a865.length; _i866++) {
                                const _t867 = sp.adj4Edges[v_s][_i866];
                                if (!(((_t867 === _wc515 ? _wd516 : (b.grid[_t867] || -1)) === 1))) continue;
                                _g863++;
                              }
                            }
                            let _g868 = 0;
                            G869: {
                              for (let _i870 = 0; _i870 < 1; _i870++) {
                                const v_k = v_s;
                                const _h871 = clueAt(cl.number, v_k);
                                const _h878 = (_h871 + 1);
                                let _c880: boolean = (_h871 !== -1);
                                if (_c880) {
                                  let _c879: boolean = (_h531 || (_h871 === 1));
                                  if (!_c879) {
                                    let _g872 = 0;
                                    G873: {
                                      const _t874 = (_h871 + 1);
                                      const _a875 = cluesValued(cl.number, _t874);
                                      for (let _i876 = 0; _i876 < _a875.length; _i876++) {
                                        const v_x = _a875[_i876];
                                        const _h877 = clueAt(cl.number, v_x);
                                        if (!((_h877 === _h878))) continue;
                                        _g872++;
                                      }
                                    }
                                    _c879 = (_g872 === 0);
                                  }
                                  _c880 = _c879;
                                }
                                if (!(_c880)) continue;
                                _g868++;
                              }
                            }
                            _c881 = (_g863 < (2 - _g868));
                          }
                          let _c901: boolean = _c881;
                          if (_c901) {
                            let _g882 = 0;
                            G883: {
                              const _a885 = sp.adj4[v_y];
                              for (let _i886 = 0; _i886 < _a885.length; _i886++) {
                                const _t887 = sp.adj4Edges[v_y][_i886];
                                if (!(((_t887 === _wc515 ? _wd516 : (b.grid[_t887] || -1)) === 1))) continue;
                                _g882++;
                              }
                            }
                            let _g888 = 0;
                            G889: {
                              for (let _i890 = 0; _i890 < 1; _i890++) {
                                const v_k = v_y;
                                const _h891 = clueAt(cl.number, v_k);
                                const _h898 = (_h891 + 1);
                                let _c900: boolean = (_h891 !== -1);
                                if (_c900) {
                                  let _c899: boolean = (_h531 || (_h891 === 1));
                                  if (!_c899) {
                                    let _g892 = 0;
                                    G893: {
                                      const _t894 = (_h891 + 1);
                                      const _a895 = cluesValued(cl.number, _t894);
                                      for (let _i896 = 0; _i896 < _a895.length; _i896++) {
                                        const v_x = _a895[_i896];
                                        const _h897 = clueAt(cl.number, v_x);
                                        if (!((_h897 === _h898))) continue;
                                        _g892++;
                                      }
                                    }
                                    _c899 = (_g892 === 0);
                                  }
                                  _c900 = _c899;
                                }
                                if (!(_c900)) continue;
                                _g888++;
                              }
                            }
                            _c901 = (_g882 < (2 - _g888));
                          }
                          let _c982: boolean = _c901;
                          if (_c982) {
                            let _q902 = true;
                            Q903: {
                              _g904.length = 0;
                              G905: {
                                for (let _i907 = 0; _i907 < 1; _i907++) {
                                  const v_x = v_s;
                                  const _h908 = clueAt(cl.number, v_x);
                                  if (!((_h908 !== -1))) continue;
                                  _g904.push(v_x);
                                }
                              }
                              _g909.length = 0;
                              lineBreaks_st922.pass++;
                              G910: {
                                const _a928 = throughWhere(sp, v_s, (_te923: number): boolean => { let _c925: boolean = ((_te923 === _wc515 ? _wd516 : (b.grid[_te923] || -1)) === 1); if (_c925) {   const _t924 = sp.edgeEnds[2 * _te923];   _c925 = !((clueAt(cl.number, _t924) !== -1)); } let _c927: boolean = _c925; if (_c927) {   const _t926 = sp.edgeEnds[2 * _te923 + 1];   _c927 = !((clueAt(cl.number, _t926) !== -1)); } return _c927; });
                                for (let _i929 = 0; _i929 < _a928.length; _i929++) {
                                  const v_t = _a928[_i929];
                                  const _h932 = clueAt(cl.number, v_t);
                                  const _h933 = (_h932 !== -1);
                                  const _h934 = _h933;
                                  const _h935 = !(_h934);
                                  const _a930 = sp.adj4[v_t];
                                  for (let _i931 = 0; _i931 < _a930.length; _i931++) {
                                    const v_x = _a930[_i931];
                                    const _h936 = clueAt(cl.number, v_x);
                                    let _c938: boolean = (_h935 && (_h936 !== -1));
                                    if (_c938) {
                                      const _t937 = sp.adj4Edges[v_t][_i931];
                                      _c938 = ((_t937 === _wc515 ? _wd516 : (b.grid[_t937] || -1)) === 1);
                                    }
                                    if (!(_c938)) continue;
                                    const _t939 = v_x;
                                    if (_g909.length < 16) { if (!_g909.includes(_t939)) _g909.push(_t939); } else addOnce(_g909, lineBreaks_st922, _t939);
                                  }
                                }
                              }
                              const _a940 = union(_g904, _g909);
                              for (let _i941 = 0; _i941 < _a940.length; _i941++) {
                                const v_p = _a940[_i941];
                                const _h980 = clueAt(cl.number, v_p);
                                _g942.length = 0;
                                G943: {
                                  for (let _i945 = 0; _i945 < 1; _i945++) {
                                    const v_x = v_y;
                                    const _h946 = clueAt(cl.number, v_x);
                                    if (!((_h946 !== -1))) continue;
                                    _g942.push(v_x);
                                  }
                                }
                                _g947.length = 0;
                                lineBreaks_st960.pass++;
                                G948: {
                                  const _a966 = throughWhere(sp, v_y, (_te961: number): boolean => { let _c963: boolean = ((_te961 === _wc515 ? _wd516 : (b.grid[_te961] || -1)) === 1); if (_c963) {   const _t962 = sp.edgeEnds[2 * _te961];   _c963 = !((clueAt(cl.number, _t962) !== -1)); } let _c965: boolean = _c963; if (_c965) {   const _t964 = sp.edgeEnds[2 * _te961 + 1];   _c965 = !((clueAt(cl.number, _t964) !== -1)); } return _c965; });
                                  for (let _i967 = 0; _i967 < _a966.length; _i967++) {
                                    const v_t = _a966[_i967];
                                    const _h970 = clueAt(cl.number, v_t);
                                    const _h971 = (_h970 !== -1);
                                    const _h972 = _h971;
                                    const _h973 = !(_h972);
                                    const _a968 = sp.adj4[v_t];
                                    for (let _i969 = 0; _i969 < _a968.length; _i969++) {
                                      const v_x = _a968[_i969];
                                      const _h974 = clueAt(cl.number, v_x);
                                      let _c976: boolean = (_h973 && (_h974 !== -1));
                                      if (_c976) {
                                        const _t975 = sp.adj4Edges[v_t][_i969];
                                        _c976 = ((_t975 === _wc515 ? _wd516 : (b.grid[_t975] || -1)) === 1);
                                      }
                                      if (!(_c976)) continue;
                                      const _t977 = v_x;
                                      if (_g947.length < 16) { if (!_g947.includes(_t977)) _g947.push(_t977); } else addOnce(_g947, lineBreaks_st960, _t977);
                                    }
                                  }
                                }
                                const _a978 = union(_g942, _g947);
                                for (let _i979 = 0; _i979 < _a978.length; _i979++) {
                                  const v_q = _a978[_i979];
                                  const _h981 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h980 - _h981)) === cl.step))) {
                                    _q902 = false;
                                    break Q903;
                                  }
                                }
                              }
                            }
                            _c982 = _q902;
                          }
                          if (!((_c982 && (_h531 || !(throughWhere(sp, v_s, (_te983: number): boolean => {  return ((_te983 === _wc515 ? _wd516 : (b.grid[_te983] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g984 = 0;
                          G985: {
                            const _a986 = sp.adj4[v_s];
                            for (let _i987 = 0; _i987 < _a986.length; _i987++) {
                              const _t988 = sp.adj4Edges[v_s][_i987];
                              if (!(((_t988 === _wc515 ? _wd516 : (b.grid[_t988] || -1)) === 1))) continue;
                              _g984++;
                            }
                          }
                          let _g989 = 0;
                          G990: {
                            for (let _i991 = 0; _i991 < 1; _i991++) {
                              const v_k = v_s;
                              const _h992 = clueAt(cl.number, v_k);
                              const _h999 = (_h992 + 1);
                              let _c1001: boolean = (_h992 !== -1);
                              if (_c1001) {
                                let _c1000: boolean = (_h531 || (_h992 === 1));
                                if (!_c1000) {
                                  let _g993 = 0;
                                  G994: {
                                    const _t995 = (_h992 + 1);
                                    const _a996 = cluesValued(cl.number, _t995);
                                    for (let _i997 = 0; _i997 < _a996.length; _i997++) {
                                      const v_x = _a996[_i997];
                                      const _h998 = clueAt(cl.number, v_x);
                                      if (!((_h998 === _h999))) continue;
                                      _g993++;
                                    }
                                  }
                                  _c1000 = (_g993 === 0);
                                }
                                _c1001 = _c1000;
                              }
                              if (!(_c1001)) continue;
                              _g989++;
                            }
                          }
                          let _c1128: boolean = ((_g984 + 1) === (2 - _g989));
                          if (!_c1128) {
                            let _q1002 = false;
                            Q1003: {
                              const _a1004 = sp.adj4[v_s];
                              const _n1005 = _i861;
                              for (let _i1006 = 0; _i1006 < _n1005; _i1006++) {
                                const v_z = _a1004[_i1006];
                                const _t1007 = sp.adj4Edges[v_s][_i1006];
                                let _c1026: boolean = !((_t1007 === _wc515 ? true : (b.grid[_t1007] !== 0)));
                                if (_c1026) {
                                  let _g1008 = 0;
                                  G1009: {
                                    const _a1010 = sp.adj4[v_s];
                                    for (let _i1011 = 0; _i1011 < _a1010.length; _i1011++) {
                                      const _t1012 = sp.adj4Edges[v_s][_i1011];
                                      if (!(((_t1012 === _wc515 ? _wd516 : (b.grid[_t1012] || -1)) === 1))) continue;
                                      _g1008++;
                                    }
                                  }
                                  let _g1013 = 0;
                                  G1014: {
                                    for (let _i1015 = 0; _i1015 < 1; _i1015++) {
                                      const v_k = v_s;
                                      const _h1016 = clueAt(cl.number, v_k);
                                      const _h1023 = (_h1016 + 1);
                                      let _c1025: boolean = (_h1016 !== -1);
                                      if (_c1025) {
                                        let _c1024: boolean = (_h531 || (_h1016 === 1));
                                        if (!_c1024) {
                                          let _g1017 = 0;
                                          G1018: {
                                            const _t1019 = (_h1016 + 1);
                                            const _a1020 = cluesValued(cl.number, _t1019);
                                            for (let _i1021 = 0; _i1021 < _a1020.length; _i1021++) {
                                              const v_x = _a1020[_i1021];
                                              const _h1022 = clueAt(cl.number, v_x);
                                              if (!((_h1022 === _h1023))) continue;
                                              _g1017++;
                                            }
                                          }
                                          _c1024 = (_g1017 === 0);
                                        }
                                        _c1025 = _c1024;
                                      }
                                      if (!(_c1025)) continue;
                                      _g1013++;
                                    }
                                  }
                                  _c1026 = (_g1008 < (2 - _g1013));
                                }
                                let _c1045: boolean = _c1026;
                                if (_c1045) {
                                  let _g1027 = 0;
                                  G1028: {
                                    const _a1029 = sp.adj4[v_z];
                                    for (let _i1030 = 0; _i1030 < _a1029.length; _i1030++) {
                                      const _t1031 = sp.adj4Edges[v_z][_i1030];
                                      if (!(((_t1031 === _wc515 ? _wd516 : (b.grid[_t1031] || -1)) === 1))) continue;
                                      _g1027++;
                                    }
                                  }
                                  let _g1032 = 0;
                                  G1033: {
                                    for (let _i1034 = 0; _i1034 < 1; _i1034++) {
                                      const v_k = v_z;
                                      const _h1035 = clueAt(cl.number, v_k);
                                      const _h1042 = (_h1035 + 1);
                                      let _c1044: boolean = (_h1035 !== -1);
                                      if (_c1044) {
                                        let _c1043: boolean = (_h531 || (_h1035 === 1));
                                        if (!_c1043) {
                                          let _g1036 = 0;
                                          G1037: {
                                            const _t1038 = (_h1035 + 1);
                                            const _a1039 = cluesValued(cl.number, _t1038);
                                            for (let _i1040 = 0; _i1040 < _a1039.length; _i1040++) {
                                              const v_x = _a1039[_i1040];
                                              const _h1041 = clueAt(cl.number, v_x);
                                              if (!((_h1041 === _h1042))) continue;
                                              _g1036++;
                                            }
                                          }
                                          _c1043 = (_g1036 === 0);
                                        }
                                        _c1044 = _c1043;
                                      }
                                      if (!(_c1044)) continue;
                                      _g1032++;
                                    }
                                  }
                                  _c1045 = (_g1027 < (2 - _g1032));
                                }
                                let _c1126: boolean = _c1045;
                                if (_c1126) {
                                  let _q1046 = true;
                                  Q1047: {
                                    _g1048.length = 0;
                                    G1049: {
                                      for (let _i1051 = 0; _i1051 < 1; _i1051++) {
                                        const v_x = v_s;
                                        const _h1052 = clueAt(cl.number, v_x);
                                        if (!((_h1052 !== -1))) continue;
                                        _g1048.push(v_x);
                                      }
                                    }
                                    _g1053.length = 0;
                                    lineBreaks_st1066.pass++;
                                    G1054: {
                                      const _a1072 = throughWhere(sp, v_s, (_te1067: number): boolean => { let _c1069: boolean = ((_te1067 === _wc515 ? _wd516 : (b.grid[_te1067] || -1)) === 1); if (_c1069) {   const _t1068 = sp.edgeEnds[2 * _te1067];   _c1069 = !((clueAt(cl.number, _t1068) !== -1)); } let _c1071: boolean = _c1069; if (_c1071) {   const _t1070 = sp.edgeEnds[2 * _te1067 + 1];   _c1071 = !((clueAt(cl.number, _t1070) !== -1)); } return _c1071; });
                                      for (let _i1073 = 0; _i1073 < _a1072.length; _i1073++) {
                                        const v_t = _a1072[_i1073];
                                        const _h1076 = clueAt(cl.number, v_t);
                                        const _h1077 = (_h1076 !== -1);
                                        const _h1078 = _h1077;
                                        const _h1079 = !(_h1078);
                                        const _a1074 = sp.adj4[v_t];
                                        for (let _i1075 = 0; _i1075 < _a1074.length; _i1075++) {
                                          const v_x = _a1074[_i1075];
                                          const _h1080 = clueAt(cl.number, v_x);
                                          let _c1082: boolean = (_h1079 && (_h1080 !== -1));
                                          if (_c1082) {
                                            const _t1081 = sp.adj4Edges[v_t][_i1075];
                                            _c1082 = ((_t1081 === _wc515 ? _wd516 : (b.grid[_t1081] || -1)) === 1);
                                          }
                                          if (!(_c1082)) continue;
                                          const _t1083 = v_x;
                                          if (_g1053.length < 16) { if (!_g1053.includes(_t1083)) _g1053.push(_t1083); } else addOnce(_g1053, lineBreaks_st1066, _t1083);
                                        }
                                      }
                                    }
                                    const _a1084 = union(_g1048, _g1053);
                                    for (let _i1085 = 0; _i1085 < _a1084.length; _i1085++) {
                                      const v_p = _a1084[_i1085];
                                      const _h1124 = clueAt(cl.number, v_p);
                                      _g1086.length = 0;
                                      G1087: {
                                        for (let _i1089 = 0; _i1089 < 1; _i1089++) {
                                          const v_x = v_z;
                                          const _h1090 = clueAt(cl.number, v_x);
                                          if (!((_h1090 !== -1))) continue;
                                          _g1086.push(v_x);
                                        }
                                      }
                                      _g1091.length = 0;
                                      lineBreaks_st1104.pass++;
                                      G1092: {
                                        const _a1110 = throughWhere(sp, v_z, (_te1105: number): boolean => { let _c1107: boolean = ((_te1105 === _wc515 ? _wd516 : (b.grid[_te1105] || -1)) === 1); if (_c1107) {   const _t1106 = sp.edgeEnds[2 * _te1105];   _c1107 = !((clueAt(cl.number, _t1106) !== -1)); } let _c1109: boolean = _c1107; if (_c1109) {   const _t1108 = sp.edgeEnds[2 * _te1105 + 1];   _c1109 = !((clueAt(cl.number, _t1108) !== -1)); } return _c1109; });
                                        for (let _i1111 = 0; _i1111 < _a1110.length; _i1111++) {
                                          const v_t = _a1110[_i1111];
                                          const _h1114 = clueAt(cl.number, v_t);
                                          const _h1115 = (_h1114 !== -1);
                                          const _h1116 = _h1115;
                                          const _h1117 = !(_h1116);
                                          const _a1112 = sp.adj4[v_t];
                                          for (let _i1113 = 0; _i1113 < _a1112.length; _i1113++) {
                                            const v_x = _a1112[_i1113];
                                            const _h1118 = clueAt(cl.number, v_x);
                                            let _c1120: boolean = (_h1117 && (_h1118 !== -1));
                                            if (_c1120) {
                                              const _t1119 = sp.adj4Edges[v_t][_i1113];
                                              _c1120 = ((_t1119 === _wc515 ? _wd516 : (b.grid[_t1119] || -1)) === 1);
                                            }
                                            if (!(_c1120)) continue;
                                            const _t1121 = v_x;
                                            if (_g1091.length < 16) { if (!_g1091.includes(_t1121)) _g1091.push(_t1121); } else addOnce(_g1091, lineBreaks_st1104, _t1121);
                                          }
                                        }
                                      }
                                      const _a1122 = union(_g1086, _g1091);
                                      for (let _i1123 = 0; _i1123 < _a1122.length; _i1123++) {
                                        const v_q = _a1122[_i1123];
                                        const _h1125 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1124 - _h1125)) === cl.step))) {
                                          _q1046 = false;
                                          break Q1047;
                                        }
                                      }
                                    }
                                  }
                                  _c1126 = _q1046;
                                }
                                if ((_c1126 && (_h531 || !(throughWhere(sp, v_s, (_te1127: number): boolean => {  return ((_te1127 === _wc515 ? _wd516 : (b.grid[_te1127] || -1)) === 1); }).includes(v_z))))) {
                                  _q1002 = true;
                                  break Q1003;
                                }
                              }
                            }
                            _c1128 = _q1002;
                          }
                          if (_c1128) {
                            _q858 = true;
                            break Q859;
                          }
                        }
                      }
                      _c1129 = !(_q858);
                    }
                    if (_c1129) {
                      _q836 = true;
                      break Q837;
                    }
                  }
                }
                _c1130 = _q836;
              }
              if (_c1130) {
                _q517 = true;
                break Q518;
              }
            }
          }
          _c1131 = _q517;
        }
        _c1132 = _c1131;
      }
      if (!(_c1132)) break L513;
      if (DEV && staleChecking) {
        let _c1639: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
        if (_c1639) {
          let _c1638: boolean = (throughWhere(sp, v_a, (_te1133: number): boolean => {  return ((b.grid[_te1133] || -1) === 1); }).includes(v_b));
          if (!_c1638) {
            const _wc1134 = v_e;
            const _wd1135 = 1;
            let _q1136 = false;
            Q1137: {
              const _a1139 = throughWhere(sp, v_a, (_te1138: number): boolean => {  return ((_te1138 === _wc1134 ? _wd1135 : (b.grid[_te1138] || -1)) === 1); });
              for (let _i1140 = 0; _i1140 < _a1139.length; _i1140++) {
                const v_t = _a1139[_i1140];
                let _c1156: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
                if (!_c1156) {
                  let _g1141 = 0;
                  G1142: {
                    const _a1143 = sp.adj4[v_t];
                    for (let _i1144 = 0; _i1144 < _a1143.length; _i1144++) {
                      const _t1145 = sp.adj4Edges[v_t][_i1144];
                      if (!(((_t1145 === _wc1134 ? _wd1135 : (b.grid[_t1145] || -1)) === 1))) continue;
                      _g1141++;
                    }
                  }
                  let _g1146 = 0;
                  G1147: {
                    for (let _i1148 = 0; _i1148 < 1; _i1148++) {
                      const v_k = v_t;
                      let _c1155: boolean = (clueAt(cl.number, v_k) !== -1);
                      if (_c1155) {
                        let _c1154: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                        if (!_c1154) {
                          let _g1149 = 0;
                          G1150: {
                            const _t1151 = (clueAt(cl.number, v_k) + 1);
                            const _a1152 = cluesValued(cl.number, _t1151);
                            for (let _i1153 = 0; _i1153 < _a1152.length; _i1153++) {
                              const v_x = _a1152[_i1153];
                              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                              _g1149++;
                            }
                          }
                          _c1154 = (_g1149 === 0);
                        }
                        _c1155 = _c1154;
                      }
                      if (!(_c1155)) continue;
                      _g1146++;
                    }
                  }
                  _c1156 = (_g1141 < (2 - _g1146));
                }
                if (!(_c1156)) continue;
                let _g1157 = 0;
                G1158: {
                  const _a1159 = sp.adj4[v_t];
                  for (let _i1160 = 0; _i1160 < _a1159.length; _i1160++) {
                    const _t1161 = sp.adj4Edges[v_t][_i1160];
                    if (!(((_t1161 === _wc1134 ? _wd1135 : (b.grid[_t1161] || -1)) === 1))) continue;
                    _g1157++;
                  }
                }
                let _g1162 = 0;
                G1163: {
                  for (let _i1164 = 0; _i1164 < 1; _i1164++) {
                    const v_k = v_t;
                    let _c1171: boolean = (clueAt(cl.number, v_k) !== -1);
                    if (_c1171) {
                      let _c1170: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                      if (!_c1170) {
                        let _g1165 = 0;
                        G1166: {
                          const _t1167 = (clueAt(cl.number, v_k) + 1);
                          const _a1168 = cluesValued(cl.number, _t1167);
                          for (let _i1169 = 0; _i1169 < _a1168.length; _i1169++) {
                            const v_x = _a1168[_i1169];
                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                            _g1165++;
                          }
                        }
                        _c1170 = (_g1165 === 0);
                      }
                      _c1171 = _c1170;
                    }
                    if (!(_c1171)) continue;
                    _g1162++;
                  }
                }
                let _c1396: boolean = (_g1157 < (2 - _g1162));
                if (_c1396) {
                  let _q1172 = false;
                  Q1173: {
                    const _a1174 = sp.adj4[v_t];
                    for (let _i1175 = 0; _i1175 < _a1174.length; _i1175++) {
                      const v_y = _a1174[_i1175];
                      const _t1176 = sp.adj4Edges[v_t][_i1175];
                      let _c1192: boolean = !((_t1176 === _wc1134 ? true : (b.grid[_t1176] !== 0)));
                      if (_c1192) {
                        let _g1177 = 0;
                        G1178: {
                          const _a1179 = sp.adj4[v_t];
                          for (let _i1180 = 0; _i1180 < _a1179.length; _i1180++) {
                            const _t1181 = sp.adj4Edges[v_t][_i1180];
                            if (!(((_t1181 === _wc1134 ? _wd1135 : (b.grid[_t1181] || -1)) === 1))) continue;
                            _g1177++;
                          }
                        }
                        let _g1182 = 0;
                        G1183: {
                          for (let _i1184 = 0; _i1184 < 1; _i1184++) {
                            const v_k = v_t;
                            let _c1191: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1191) {
                              let _c1190: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1190) {
                                let _g1185 = 0;
                                G1186: {
                                  const _t1187 = (clueAt(cl.number, v_k) + 1);
                                  const _a1188 = cluesValued(cl.number, _t1187);
                                  for (let _i1189 = 0; _i1189 < _a1188.length; _i1189++) {
                                    const v_x = _a1188[_i1189];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1185++;
                                  }
                                }
                                _c1190 = (_g1185 === 0);
                              }
                              _c1191 = _c1190;
                            }
                            if (!(_c1191)) continue;
                            _g1182++;
                          }
                        }
                        _c1192 = (_g1177 < (2 - _g1182));
                      }
                      let _c1209: boolean = _c1192;
                      if (_c1209) {
                        let _g1193 = 0;
                        G1194: {
                          const _a1196 = sp.adj4[v_y];
                          for (let _i1197 = 0; _i1197 < _a1196.length; _i1197++) {
                            const _t1198 = sp.adj4Edges[v_y][_i1197];
                            if (!(((_t1198 === _wc1134 ? _wd1135 : (b.grid[_t1198] || -1)) === 1))) continue;
                            _g1193++;
                          }
                        }
                        let _g1199 = 0;
                        G1200: {
                          for (let _i1201 = 0; _i1201 < 1; _i1201++) {
                            const v_k = v_y;
                            let _c1208: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1208) {
                              let _c1207: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1207) {
                                let _g1202 = 0;
                                G1203: {
                                  const _t1204 = (clueAt(cl.number, v_k) + 1);
                                  const _a1205 = cluesValued(cl.number, _t1204);
                                  for (let _i1206 = 0; _i1206 < _a1205.length; _i1206++) {
                                    const v_x = _a1205[_i1206];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1202++;
                                  }
                                }
                                _c1207 = (_g1202 === 0);
                              }
                              _c1208 = _c1207;
                            }
                            if (!(_c1208)) continue;
                            _g1199++;
                          }
                        }
                        _c1209 = (_g1193 < (2 - _g1199));
                      }
                      let _c1274: boolean = _c1209;
                      if (_c1274) {
                        let _q1210 = true;
                        Q1211: {
                          const _g1212: number[] = [];
                          G1213: {
                            for (let _i1215 = 0; _i1215 < 1; _i1215++) {
                              const v_x = v_t;
                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                              _g1212.push(v_x);
                            }
                          }
                          const _g1216: number[] = [];
                          G1217: {
                            const _a1236 = throughWhere(sp, v_t, (_te1231: number): boolean => { let _c1233: boolean = ((_te1231 === _wc1134 ? _wd1135 : (b.grid[_te1231] || -1)) === 1); if (_c1233) {   const _t1232 = sp.edgeEnds[2 * _te1231];   _c1233 = !((clueAt(cl.number, _t1232) !== -1)); } let _c1235: boolean = _c1233; if (_c1235) {   const _t1234 = sp.edgeEnds[2 * _te1231 + 1];   _c1235 = !((clueAt(cl.number, _t1234) !== -1)); } return _c1235; });
                            for (let _i1237 = 0; _i1237 < _a1236.length; _i1237++) {
                              const v_t_1230 = _a1236[_i1237];
                              const _a1238 = sp.adj4[v_t_1230];
                              for (let _i1239 = 0; _i1239 < _a1238.length; _i1239++) {
                                const v_x = _a1238[_i1239];
                                let _c1241: boolean = (!((clueAt(cl.number, v_t_1230) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                if (_c1241) {
                                  const _t1240 = sp.adj4Edges[v_t_1230][_i1239];
                                  _c1241 = ((_t1240 === _wc1134 ? _wd1135 : (b.grid[_t1240] || -1)) === 1);
                                }
                                if (!(_c1241)) continue;
                                if (!_g1216.includes(v_x)) _g1216.push(v_x);
                              }
                            }
                          }
                          const _a1242 = union(_g1212, _g1216);
                          for (let _i1243 = 0; _i1243 < _a1242.length; _i1243++) {
                            const v_p = _a1242[_i1243];
                            const _g1244: number[] = [];
                            G1245: {
                              for (let _i1247 = 0; _i1247 < 1; _i1247++) {
                                const v_x = v_y;
                                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                _g1244.push(v_x);
                              }
                            }
                            const _g1248: number[] = [];
                            G1249: {
                              const _a1266 = throughWhere(sp, v_y, (_te1261: number): boolean => { let _c1263: boolean = ((_te1261 === _wc1134 ? _wd1135 : (b.grid[_te1261] || -1)) === 1); if (_c1263) {   const _t1262 = sp.edgeEnds[2 * _te1261];   _c1263 = !((clueAt(cl.number, _t1262) !== -1)); } let _c1265: boolean = _c1263; if (_c1265) {   const _t1264 = sp.edgeEnds[2 * _te1261 + 1];   _c1265 = !((clueAt(cl.number, _t1264) !== -1)); } return _c1265; });
                              for (let _i1267 = 0; _i1267 < _a1266.length; _i1267++) {
                                const v_t = _a1266[_i1267];
                                const _a1268 = sp.adj4[v_t];
                                for (let _i1269 = 0; _i1269 < _a1268.length; _i1269++) {
                                  const v_x = _a1268[_i1269];
                                  let _c1271: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                  if (_c1271) {
                                    const _t1270 = sp.adj4Edges[v_t][_i1269];
                                    _c1271 = ((_t1270 === _wc1134 ? _wd1135 : (b.grid[_t1270] || -1)) === 1);
                                  }
                                  if (!(_c1271)) continue;
                                  if (!_g1248.includes(v_x)) _g1248.push(v_x);
                                }
                              }
                            }
                            const _a1272 = union(_g1244, _g1248);
                            for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
                              const v_q = _a1272[_i1273];
                              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                _q1210 = false;
                                break Q1211;
                              }
                            }
                          }
                        }
                        _c1274 = _q1210;
                      }
                      if (!((_c1274 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1275: number): boolean => {  return ((_te1275 === _wc1134 ? _wd1135 : (b.grid[_te1275] || -1)) === 1); }).includes(v_y)))))) continue;
                      let _g1276 = 0;
                      G1277: {
                        const _a1278 = sp.adj4[v_t];
                        for (let _i1279 = 0; _i1279 < _a1278.length; _i1279++) {
                          const _t1280 = sp.adj4Edges[v_t][_i1279];
                          if (!(((_t1280 === _wc1134 ? _wd1135 : (b.grid[_t1280] || -1)) === 1))) continue;
                          _g1276++;
                        }
                      }
                      let _g1281 = 0;
                      G1282: {
                        for (let _i1283 = 0; _i1283 < 1; _i1283++) {
                          const v_k = v_t;
                          let _c1290: boolean = (clueAt(cl.number, v_k) !== -1);
                          if (_c1290) {
                            let _c1289: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                            if (!_c1289) {
                              let _g1284 = 0;
                              G1285: {
                                const _t1286 = (clueAt(cl.number, v_k) + 1);
                                const _a1287 = cluesValued(cl.number, _t1286);
                                for (let _i1288 = 0; _i1288 < _a1287.length; _i1288++) {
                                  const v_x = _a1287[_i1288];
                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                  _g1284++;
                                }
                              }
                              _c1289 = (_g1284 === 0);
                            }
                            _c1290 = _c1289;
                          }
                          if (!(_c1290)) continue;
                          _g1281++;
                        }
                      }
                      let _c1395: boolean = ((_g1276 + 1) === (2 - _g1281));
                      if (!_c1395) {
                        let _q1291 = false;
                        Q1292: {
                          const _a1293 = sp.adj4[v_t];
                          const _n1294 = _i1175;
                          for (let _i1295 = 0; _i1295 < _n1294; _i1295++) {
                            const v_z = _a1293[_i1295];
                            const _t1296 = sp.adj4Edges[v_t][_i1295];
                            let _c1312: boolean = !((_t1296 === _wc1134 ? true : (b.grid[_t1296] !== 0)));
                            if (_c1312) {
                              let _g1297 = 0;
                              G1298: {
                                const _a1299 = sp.adj4[v_t];
                                for (let _i1300 = 0; _i1300 < _a1299.length; _i1300++) {
                                  const _t1301 = sp.adj4Edges[v_t][_i1300];
                                  if (!(((_t1301 === _wc1134 ? _wd1135 : (b.grid[_t1301] || -1)) === 1))) continue;
                                  _g1297++;
                                }
                              }
                              let _g1302 = 0;
                              G1303: {
                                for (let _i1304 = 0; _i1304 < 1; _i1304++) {
                                  const v_k = v_t;
                                  let _c1311: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1311) {
                                    let _c1310: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1310) {
                                      let _g1305 = 0;
                                      G1306: {
                                        const _t1307 = (clueAt(cl.number, v_k) + 1);
                                        const _a1308 = cluesValued(cl.number, _t1307);
                                        for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
                                          const v_x = _a1308[_i1309];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1305++;
                                        }
                                      }
                                      _c1310 = (_g1305 === 0);
                                    }
                                    _c1311 = _c1310;
                                  }
                                  if (!(_c1311)) continue;
                                  _g1302++;
                                }
                              }
                              _c1312 = (_g1297 < (2 - _g1302));
                            }
                            let _c1328: boolean = _c1312;
                            if (_c1328) {
                              let _g1313 = 0;
                              G1314: {
                                const _a1315 = sp.adj4[v_z];
                                for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
                                  const _t1317 = sp.adj4Edges[v_z][_i1316];
                                  if (!(((_t1317 === _wc1134 ? _wd1135 : (b.grid[_t1317] || -1)) === 1))) continue;
                                  _g1313++;
                                }
                              }
                              let _g1318 = 0;
                              G1319: {
                                for (let _i1320 = 0; _i1320 < 1; _i1320++) {
                                  const v_k = v_z;
                                  let _c1327: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1327) {
                                    let _c1326: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1326) {
                                      let _g1321 = 0;
                                      G1322: {
                                        const _t1323 = (clueAt(cl.number, v_k) + 1);
                                        const _a1324 = cluesValued(cl.number, _t1323);
                                        for (let _i1325 = 0; _i1325 < _a1324.length; _i1325++) {
                                          const v_x = _a1324[_i1325];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1321++;
                                        }
                                      }
                                      _c1326 = (_g1321 === 0);
                                    }
                                    _c1327 = _c1326;
                                  }
                                  if (!(_c1327)) continue;
                                  _g1318++;
                                }
                              }
                              _c1328 = (_g1313 < (2 - _g1318));
                            }
                            let _c1393: boolean = _c1328;
                            if (_c1393) {
                              let _q1329 = true;
                              Q1330: {
                                const _g1331: number[] = [];
                                G1332: {
                                  for (let _i1334 = 0; _i1334 < 1; _i1334++) {
                                    const v_x = v_t;
                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                    _g1331.push(v_x);
                                  }
                                }
                                const _g1335: number[] = [];
                                G1336: {
                                  const _a1355 = throughWhere(sp, v_t, (_te1350: number): boolean => { let _c1352: boolean = ((_te1350 === _wc1134 ? _wd1135 : (b.grid[_te1350] || -1)) === 1); if (_c1352) {   const _t1351 = sp.edgeEnds[2 * _te1350];   _c1352 = !((clueAt(cl.number, _t1351) !== -1)); } let _c1354: boolean = _c1352; if (_c1354) {   const _t1353 = sp.edgeEnds[2 * _te1350 + 1];   _c1354 = !((clueAt(cl.number, _t1353) !== -1)); } return _c1354; });
                                  for (let _i1356 = 0; _i1356 < _a1355.length; _i1356++) {
                                    const v_t_1349 = _a1355[_i1356];
                                    const _a1357 = sp.adj4[v_t_1349];
                                    for (let _i1358 = 0; _i1358 < _a1357.length; _i1358++) {
                                      const v_x = _a1357[_i1358];
                                      let _c1360: boolean = (!((clueAt(cl.number, v_t_1349) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                      if (_c1360) {
                                        const _t1359 = sp.adj4Edges[v_t_1349][_i1358];
                                        _c1360 = ((_t1359 === _wc1134 ? _wd1135 : (b.grid[_t1359] || -1)) === 1);
                                      }
                                      if (!(_c1360)) continue;
                                      if (!_g1335.includes(v_x)) _g1335.push(v_x);
                                    }
                                  }
                                }
                                const _a1361 = union(_g1331, _g1335);
                                for (let _i1362 = 0; _i1362 < _a1361.length; _i1362++) {
                                  const v_p = _a1361[_i1362];
                                  const _g1363: number[] = [];
                                  G1364: {
                                    for (let _i1366 = 0; _i1366 < 1; _i1366++) {
                                      const v_x = v_z;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1363.push(v_x);
                                    }
                                  }
                                  const _g1367: number[] = [];
                                  G1368: {
                                    const _a1385 = throughWhere(sp, v_z, (_te1380: number): boolean => { let _c1382: boolean = ((_te1380 === _wc1134 ? _wd1135 : (b.grid[_te1380] || -1)) === 1); if (_c1382) {   const _t1381 = sp.edgeEnds[2 * _te1380];   _c1382 = !((clueAt(cl.number, _t1381) !== -1)); } let _c1384: boolean = _c1382; if (_c1384) {   const _t1383 = sp.edgeEnds[2 * _te1380 + 1];   _c1384 = !((clueAt(cl.number, _t1383) !== -1)); } return _c1384; });
                                    for (let _i1386 = 0; _i1386 < _a1385.length; _i1386++) {
                                      const v_t = _a1385[_i1386];
                                      const _a1387 = sp.adj4[v_t];
                                      for (let _i1388 = 0; _i1388 < _a1387.length; _i1388++) {
                                        const v_x = _a1387[_i1388];
                                        let _c1390: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1390) {
                                          const _t1389 = sp.adj4Edges[v_t][_i1388];
                                          _c1390 = ((_t1389 === _wc1134 ? _wd1135 : (b.grid[_t1389] || -1)) === 1);
                                        }
                                        if (!(_c1390)) continue;
                                        if (!_g1367.includes(v_x)) _g1367.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1391 = union(_g1363, _g1367);
                                  for (let _i1392 = 0; _i1392 < _a1391.length; _i1392++) {
                                    const v_q = _a1391[_i1392];
                                    if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                      _q1329 = false;
                                      break Q1330;
                                    }
                                  }
                                }
                              }
                              _c1393 = _q1329;
                            }
                            if ((_c1393 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1394: number): boolean => {  return ((_te1394 === _wc1134 ? _wd1135 : (b.grid[_te1394] || -1)) === 1); }).includes(v_z))))) {
                              _q1291 = true;
                              break Q1292;
                            }
                          }
                        }
                        _c1395 = _q1291;
                      }
                      if (_c1395) {
                        _q1172 = true;
                        break Q1173;
                      }
                    }
                  }
                  _c1396 = !(_q1172);
                }
                let _c1637: boolean = _c1396;
                if (!_c1637) {
                  let _q1397 = false;
                  Q1398: {
                    const _a1399 = sp.adj4[v_t];
                    for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
                      const v_s = _a1399[_i1400];
                      let _g1401 = 0;
                      G1402: {
                        const _a1403 = sp.adj4[v_s];
                        for (let _i1404 = 0; _i1404 < _a1403.length; _i1404++) {
                          const _t1405 = sp.adj4Edges[v_s][_i1404];
                          if (!(((_t1405 === _wc1134 ? _wd1135 : (b.grid[_t1405] || -1)) === 1))) continue;
                          _g1401++;
                        }
                      }
                      let _g1406 = 0;
                      G1407: {
                        for (let _i1408 = 0; _i1408 < 1; _i1408++) {
                          const v_k = v_s;
                          let _c1415: boolean = (clueAt(cl.number, v_k) !== -1);
                          if (_c1415) {
                            let _c1414: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                            if (!_c1414) {
                              let _g1409 = 0;
                              G1410: {
                                const _t1411 = (clueAt(cl.number, v_k) + 1);
                                const _a1412 = cluesValued(cl.number, _t1411);
                                for (let _i1413 = 0; _i1413 < _a1412.length; _i1413++) {
                                  const v_x = _a1412[_i1413];
                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                  _g1409++;
                                }
                              }
                              _c1414 = (_g1409 === 0);
                            }
                            _c1415 = _c1414;
                          }
                          if (!(_c1415)) continue;
                          _g1406++;
                        }
                      }
                      let _c1636: boolean = (_g1401 < (2 - _g1406));
                      if (_c1636) {
                        let _q1416 = false;
                        Q1417: {
                          const _a1418 = sp.adj4[v_s];
                          for (let _i1419 = 0; _i1419 < _a1418.length; _i1419++) {
                            const v_y = _a1418[_i1419];
                            const _t1420 = sp.adj4Edges[v_s][_i1419];
                            let _c1436: boolean = !((_t1420 === _wc1134 ? true : (b.grid[_t1420] !== 0)));
                            if (_c1436) {
                              let _g1421 = 0;
                              G1422: {
                                const _a1423 = sp.adj4[v_s];
                                for (let _i1424 = 0; _i1424 < _a1423.length; _i1424++) {
                                  const _t1425 = sp.adj4Edges[v_s][_i1424];
                                  if (!(((_t1425 === _wc1134 ? _wd1135 : (b.grid[_t1425] || -1)) === 1))) continue;
                                  _g1421++;
                                }
                              }
                              let _g1426 = 0;
                              G1427: {
                                for (let _i1428 = 0; _i1428 < 1; _i1428++) {
                                  const v_k = v_s;
                                  let _c1435: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1435) {
                                    let _c1434: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1434) {
                                      let _g1429 = 0;
                                      G1430: {
                                        const _t1431 = (clueAt(cl.number, v_k) + 1);
                                        const _a1432 = cluesValued(cl.number, _t1431);
                                        for (let _i1433 = 0; _i1433 < _a1432.length; _i1433++) {
                                          const v_x = _a1432[_i1433];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1429++;
                                        }
                                      }
                                      _c1434 = (_g1429 === 0);
                                    }
                                    _c1435 = _c1434;
                                  }
                                  if (!(_c1435)) continue;
                                  _g1426++;
                                }
                              }
                              _c1436 = (_g1421 < (2 - _g1426));
                            }
                            let _c1453: boolean = _c1436;
                            if (_c1453) {
                              let _g1437 = 0;
                              G1438: {
                                const _a1440 = sp.adj4[v_y];
                                for (let _i1441 = 0; _i1441 < _a1440.length; _i1441++) {
                                  const _t1442 = sp.adj4Edges[v_y][_i1441];
                                  if (!(((_t1442 === _wc1134 ? _wd1135 : (b.grid[_t1442] || -1)) === 1))) continue;
                                  _g1437++;
                                }
                              }
                              let _g1443 = 0;
                              G1444: {
                                for (let _i1445 = 0; _i1445 < 1; _i1445++) {
                                  const v_k = v_y;
                                  let _c1452: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1452) {
                                    let _c1451: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1451) {
                                      let _g1446 = 0;
                                      G1447: {
                                        const _t1448 = (clueAt(cl.number, v_k) + 1);
                                        const _a1449 = cluesValued(cl.number, _t1448);
                                        for (let _i1450 = 0; _i1450 < _a1449.length; _i1450++) {
                                          const v_x = _a1449[_i1450];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1446++;
                                        }
                                      }
                                      _c1451 = (_g1446 === 0);
                                    }
                                    _c1452 = _c1451;
                                  }
                                  if (!(_c1452)) continue;
                                  _g1443++;
                                }
                              }
                              _c1453 = (_g1437 < (2 - _g1443));
                            }
                            let _c1516: boolean = _c1453;
                            if (_c1516) {
                              let _q1454 = true;
                              Q1455: {
                                const _g1456: number[] = [];
                                G1457: {
                                  for (let _i1459 = 0; _i1459 < 1; _i1459++) {
                                    const v_x = v_s;
                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                    _g1456.push(v_x);
                                  }
                                }
                                const _g1460: number[] = [];
                                G1461: {
                                  const _a1478 = throughWhere(sp, v_s, (_te1473: number): boolean => { let _c1475: boolean = ((_te1473 === _wc1134 ? _wd1135 : (b.grid[_te1473] || -1)) === 1); if (_c1475) {   const _t1474 = sp.edgeEnds[2 * _te1473];   _c1475 = !((clueAt(cl.number, _t1474) !== -1)); } let _c1477: boolean = _c1475; if (_c1477) {   const _t1476 = sp.edgeEnds[2 * _te1473 + 1];   _c1477 = !((clueAt(cl.number, _t1476) !== -1)); } return _c1477; });
                                  for (let _i1479 = 0; _i1479 < _a1478.length; _i1479++) {
                                    const v_t = _a1478[_i1479];
                                    const _a1480 = sp.adj4[v_t];
                                    for (let _i1481 = 0; _i1481 < _a1480.length; _i1481++) {
                                      const v_x = _a1480[_i1481];
                                      let _c1483: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                      if (_c1483) {
                                        const _t1482 = sp.adj4Edges[v_t][_i1481];
                                        _c1483 = ((_t1482 === _wc1134 ? _wd1135 : (b.grid[_t1482] || -1)) === 1);
                                      }
                                      if (!(_c1483)) continue;
                                      if (!_g1460.includes(v_x)) _g1460.push(v_x);
                                    }
                                  }
                                }
                                const _a1484 = union(_g1456, _g1460);
                                for (let _i1485 = 0; _i1485 < _a1484.length; _i1485++) {
                                  const v_p = _a1484[_i1485];
                                  const _g1486: number[] = [];
                                  G1487: {
                                    for (let _i1489 = 0; _i1489 < 1; _i1489++) {
                                      const v_x = v_y;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1486.push(v_x);
                                    }
                                  }
                                  const _g1490: number[] = [];
                                  G1491: {
                                    const _a1508 = throughWhere(sp, v_y, (_te1503: number): boolean => { let _c1505: boolean = ((_te1503 === _wc1134 ? _wd1135 : (b.grid[_te1503] || -1)) === 1); if (_c1505) {   const _t1504 = sp.edgeEnds[2 * _te1503];   _c1505 = !((clueAt(cl.number, _t1504) !== -1)); } let _c1507: boolean = _c1505; if (_c1507) {   const _t1506 = sp.edgeEnds[2 * _te1503 + 1];   _c1507 = !((clueAt(cl.number, _t1506) !== -1)); } return _c1507; });
                                    for (let _i1509 = 0; _i1509 < _a1508.length; _i1509++) {
                                      const v_t = _a1508[_i1509];
                                      const _a1510 = sp.adj4[v_t];
                                      for (let _i1511 = 0; _i1511 < _a1510.length; _i1511++) {
                                        const v_x = _a1510[_i1511];
                                        let _c1513: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1513) {
                                          const _t1512 = sp.adj4Edges[v_t][_i1511];
                                          _c1513 = ((_t1512 === _wc1134 ? _wd1135 : (b.grid[_t1512] || -1)) === 1);
                                        }
                                        if (!(_c1513)) continue;
                                        if (!_g1490.includes(v_x)) _g1490.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1514 = union(_g1486, _g1490);
                                  for (let _i1515 = 0; _i1515 < _a1514.length; _i1515++) {
                                    const v_q = _a1514[_i1515];
                                    if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                      _q1454 = false;
                                      break Q1455;
                                    }
                                  }
                                }
                              }
                              _c1516 = _q1454;
                            }
                            if (!((_c1516 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1517: number): boolean => {  return ((_te1517 === _wc1134 ? _wd1135 : (b.grid[_te1517] || -1)) === 1); }).includes(v_y)))))) continue;
                            let _g1518 = 0;
                            G1519: {
                              const _a1520 = sp.adj4[v_s];
                              for (let _i1521 = 0; _i1521 < _a1520.length; _i1521++) {
                                const _t1522 = sp.adj4Edges[v_s][_i1521];
                                if (!(((_t1522 === _wc1134 ? _wd1135 : (b.grid[_t1522] || -1)) === 1))) continue;
                                _g1518++;
                              }
                            }
                            let _g1523 = 0;
                            G1524: {
                              for (let _i1525 = 0; _i1525 < 1; _i1525++) {
                                const v_k = v_s;
                                let _c1532: boolean = (clueAt(cl.number, v_k) !== -1);
                                if (_c1532) {
                                  let _c1531: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                  if (!_c1531) {
                                    let _g1526 = 0;
                                    G1527: {
                                      const _t1528 = (clueAt(cl.number, v_k) + 1);
                                      const _a1529 = cluesValued(cl.number, _t1528);
                                      for (let _i1530 = 0; _i1530 < _a1529.length; _i1530++) {
                                        const v_x = _a1529[_i1530];
                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                        _g1526++;
                                      }
                                    }
                                    _c1531 = (_g1526 === 0);
                                  }
                                  _c1532 = _c1531;
                                }
                                if (!(_c1532)) continue;
                                _g1523++;
                              }
                            }
                            let _c1635: boolean = ((_g1518 + 1) === (2 - _g1523));
                            if (!_c1635) {
                              let _q1533 = false;
                              Q1534: {
                                const _a1535 = sp.adj4[v_s];
                                const _n1536 = _i1419;
                                for (let _i1537 = 0; _i1537 < _n1536; _i1537++) {
                                  const v_z = _a1535[_i1537];
                                  const _t1538 = sp.adj4Edges[v_s][_i1537];
                                  let _c1554: boolean = !((_t1538 === _wc1134 ? true : (b.grid[_t1538] !== 0)));
                                  if (_c1554) {
                                    let _g1539 = 0;
                                    G1540: {
                                      const _a1541 = sp.adj4[v_s];
                                      for (let _i1542 = 0; _i1542 < _a1541.length; _i1542++) {
                                        const _t1543 = sp.adj4Edges[v_s][_i1542];
                                        if (!(((_t1543 === _wc1134 ? _wd1135 : (b.grid[_t1543] || -1)) === 1))) continue;
                                        _g1539++;
                                      }
                                    }
                                    let _g1544 = 0;
                                    G1545: {
                                      for (let _i1546 = 0; _i1546 < 1; _i1546++) {
                                        const v_k = v_s;
                                        let _c1553: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c1553) {
                                          let _c1552: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c1552) {
                                            let _g1547 = 0;
                                            G1548: {
                                              const _t1549 = (clueAt(cl.number, v_k) + 1);
                                              const _a1550 = cluesValued(cl.number, _t1549);
                                              for (let _i1551 = 0; _i1551 < _a1550.length; _i1551++) {
                                                const v_x = _a1550[_i1551];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g1547++;
                                              }
                                            }
                                            _c1552 = (_g1547 === 0);
                                          }
                                          _c1553 = _c1552;
                                        }
                                        if (!(_c1553)) continue;
                                        _g1544++;
                                      }
                                    }
                                    _c1554 = (_g1539 < (2 - _g1544));
                                  }
                                  let _c1570: boolean = _c1554;
                                  if (_c1570) {
                                    let _g1555 = 0;
                                    G1556: {
                                      const _a1557 = sp.adj4[v_z];
                                      for (let _i1558 = 0; _i1558 < _a1557.length; _i1558++) {
                                        const _t1559 = sp.adj4Edges[v_z][_i1558];
                                        if (!(((_t1559 === _wc1134 ? _wd1135 : (b.grid[_t1559] || -1)) === 1))) continue;
                                        _g1555++;
                                      }
                                    }
                                    let _g1560 = 0;
                                    G1561: {
                                      for (let _i1562 = 0; _i1562 < 1; _i1562++) {
                                        const v_k = v_z;
                                        let _c1569: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c1569) {
                                          let _c1568: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c1568) {
                                            let _g1563 = 0;
                                            G1564: {
                                              const _t1565 = (clueAt(cl.number, v_k) + 1);
                                              const _a1566 = cluesValued(cl.number, _t1565);
                                              for (let _i1567 = 0; _i1567 < _a1566.length; _i1567++) {
                                                const v_x = _a1566[_i1567];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g1563++;
                                              }
                                            }
                                            _c1568 = (_g1563 === 0);
                                          }
                                          _c1569 = _c1568;
                                        }
                                        if (!(_c1569)) continue;
                                        _g1560++;
                                      }
                                    }
                                    _c1570 = (_g1555 < (2 - _g1560));
                                  }
                                  let _c1633: boolean = _c1570;
                                  if (_c1633) {
                                    let _q1571 = true;
                                    Q1572: {
                                      const _g1573: number[] = [];
                                      G1574: {
                                        for (let _i1576 = 0; _i1576 < 1; _i1576++) {
                                          const v_x = v_s;
                                          if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                          _g1573.push(v_x);
                                        }
                                      }
                                      const _g1577: number[] = [];
                                      G1578: {
                                        const _a1595 = throughWhere(sp, v_s, (_te1590: number): boolean => { let _c1592: boolean = ((_te1590 === _wc1134 ? _wd1135 : (b.grid[_te1590] || -1)) === 1); if (_c1592) {   const _t1591 = sp.edgeEnds[2 * _te1590];   _c1592 = !((clueAt(cl.number, _t1591) !== -1)); } let _c1594: boolean = _c1592; if (_c1594) {   const _t1593 = sp.edgeEnds[2 * _te1590 + 1];   _c1594 = !((clueAt(cl.number, _t1593) !== -1)); } return _c1594; });
                                        for (let _i1596 = 0; _i1596 < _a1595.length; _i1596++) {
                                          const v_t = _a1595[_i1596];
                                          const _a1597 = sp.adj4[v_t];
                                          for (let _i1598 = 0; _i1598 < _a1597.length; _i1598++) {
                                            const v_x = _a1597[_i1598];
                                            let _c1600: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                            if (_c1600) {
                                              const _t1599 = sp.adj4Edges[v_t][_i1598];
                                              _c1600 = ((_t1599 === _wc1134 ? _wd1135 : (b.grid[_t1599] || -1)) === 1);
                                            }
                                            if (!(_c1600)) continue;
                                            if (!_g1577.includes(v_x)) _g1577.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1601 = union(_g1573, _g1577);
                                      for (let _i1602 = 0; _i1602 < _a1601.length; _i1602++) {
                                        const v_p = _a1601[_i1602];
                                        const _g1603: number[] = [];
                                        G1604: {
                                          for (let _i1606 = 0; _i1606 < 1; _i1606++) {
                                            const v_x = v_z;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g1603.push(v_x);
                                          }
                                        }
                                        const _g1607: number[] = [];
                                        G1608: {
                                          const _a1625 = throughWhere(sp, v_z, (_te1620: number): boolean => { let _c1622: boolean = ((_te1620 === _wc1134 ? _wd1135 : (b.grid[_te1620] || -1)) === 1); if (_c1622) {   const _t1621 = sp.edgeEnds[2 * _te1620];   _c1622 = !((clueAt(cl.number, _t1621) !== -1)); } let _c1624: boolean = _c1622; if (_c1624) {   const _t1623 = sp.edgeEnds[2 * _te1620 + 1];   _c1624 = !((clueAt(cl.number, _t1623) !== -1)); } return _c1624; });
                                          for (let _i1626 = 0; _i1626 < _a1625.length; _i1626++) {
                                            const v_t = _a1625[_i1626];
                                            const _a1627 = sp.adj4[v_t];
                                            for (let _i1628 = 0; _i1628 < _a1627.length; _i1628++) {
                                              const v_x = _a1627[_i1628];
                                              let _c1630: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c1630) {
                                                const _t1629 = sp.adj4Edges[v_t][_i1628];
                                                _c1630 = ((_t1629 === _wc1134 ? _wd1135 : (b.grid[_t1629] || -1)) === 1);
                                              }
                                              if (!(_c1630)) continue;
                                              if (!_g1607.includes(v_x)) _g1607.push(v_x);
                                            }
                                          }
                                        }
                                        const _a1631 = union(_g1603, _g1607);
                                        for (let _i1632 = 0; _i1632 < _a1631.length; _i1632++) {
                                          const v_q = _a1631[_i1632];
                                          if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                            _q1571 = false;
                                            break Q1572;
                                          }
                                        }
                                      }
                                    }
                                    _c1633 = _q1571;
                                  }
                                  if ((_c1633 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1634: number): boolean => {  return ((_te1634 === _wc1134 ? _wd1135 : (b.grid[_te1634] || -1)) === 1); }).includes(v_z))))) {
                                    _q1533 = true;
                                    break Q1534;
                                  }
                                }
                              }
                              _c1635 = _q1533;
                            }
                            if (_c1635) {
                              _q1416 = true;
                              break Q1417;
                            }
                          }
                        }
                        _c1636 = !(_q1416);
                      }
                      if (_c1636) {
                        _q1397 = true;
                        break Q1398;
                      }
                    }
                  }
                  _c1637 = _q1397;
                }
                if (_c1637) {
                  _q1136 = true;
                  break Q1137;
                }
              }
            }
            _c1638 = _q1136;
          }
          _c1639 = _c1638;
        }
        freshBinding("lineBreaks", [(sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), _c1639], ["e in", "a =", "b =", "where of b"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          let _wo1640: Witness | null = null;
          if (_h531) {
            _wo1640 = { held: "arm", arm: 0, of: null };
          }
          if (!_h531) {
            _wo1640 = { held: "arm", arm: 1, of: null };
          }
          let _wo1641: Witness | null = null;
          const _t1643 = (throughWhere(sp, v_a, (_te1642: number): boolean => {  return ((b.grid[_te1642] || -1) === 1); }).includes(v_b));
          if (_t1643) {
            _wo1641 = { held: "arm", arm: 0, of: null };
          }
          if (!_t1643) {
            const _wc1644 = v_e;
            const _wd1645 = 1;
            let _wm1646: Witness | null = null;
            W1647: {
              const _a1649 = throughWhere(sp, v_a, (_te1648: number): boolean => {  return ((_te1648 === _wc1644 ? _wd1645 : (b.grid[_te1648] || -1)) === 1); });
              for (let _i1650 = 0; _i1650 < _a1649.length; _i1650++) {
                const v_t = _a1649[_i1650];
                let _c1669: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
                if (!_c1669) {
                  let _g1651 = 0;
                  G1652: {
                    const _a1653 = sp.adj4[v_t];
                    for (let _i1654 = 0; _i1654 < _a1653.length; _i1654++) {
                      const _t1655 = sp.adj4Edges[v_t][_i1654];
                      if (!(((_t1655 === _wc1644 ? _wd1645 : (b.grid[_t1655] || -1)) === 1))) continue;
                      _g1651++;
                    }
                  }
                  let _g1656 = 0;
                  G1657: {
                    for (let _i1658 = 0; _i1658 < 1; _i1658++) {
                      const v_k = v_t;
                      const _h1659 = clueAt(cl.number, v_k);
                      const _h1666 = (_h1659 + 1);
                      let _c1668: boolean = (_h1659 !== -1);
                      if (_c1668) {
                        let _c1667: boolean = (_h531 || (_h1659 === 1));
                        if (!_c1667) {
                          let _g1660 = 0;
                          G1661: {
                            const _t1662 = (_h1659 + 1);
                            const _a1663 = cluesValued(cl.number, _t1662);
                            for (let _i1664 = 0; _i1664 < _a1663.length; _i1664++) {
                              const v_x = _a1663[_i1664];
                              const _h1665 = clueAt(cl.number, v_x);
                              if (!((_h1665 === _h1666))) continue;
                              _g1660++;
                            }
                          }
                          _c1667 = (_g1660 === 0);
                        }
                        _c1668 = _c1667;
                      }
                      if (!(_c1668)) continue;
                      _g1656++;
                    }
                  }
                  _c1669 = (_g1651 < (2 - _g1656));
                }
                if (!(_c1669)) continue;
                let _g1670 = 0;
                G1671: {
                  const _a1672 = sp.adj4[v_t];
                  for (let _i1673 = 0; _i1673 < _a1672.length; _i1673++) {
                    const _t1674 = sp.adj4Edges[v_t][_i1673];
                    if (!(((_t1674 === _wc1644 ? _wd1645 : (b.grid[_t1674] || -1)) === 1))) continue;
                    _g1670++;
                  }
                }
                let _g1675 = 0;
                G1676: {
                  for (let _i1677 = 0; _i1677 < 1; _i1677++) {
                    const v_k = v_t;
                    const _h1678 = clueAt(cl.number, v_k);
                    const _h1685 = (_h1678 + 1);
                    let _c1687: boolean = (_h1678 !== -1);
                    if (_c1687) {
                      let _c1686: boolean = (_h531 || (_h1678 === 1));
                      if (!_c1686) {
                        let _g1679 = 0;
                        G1680: {
                          const _t1681 = (_h1678 + 1);
                          const _a1682 = cluesValued(cl.number, _t1681);
                          for (let _i1683 = 0; _i1683 < _a1682.length; _i1683++) {
                            const v_x = _a1682[_i1683];
                            const _h1684 = clueAt(cl.number, v_x);
                            if (!((_h1684 === _h1685))) continue;
                            _g1679++;
                          }
                        }
                        _c1686 = (_g1679 === 0);
                      }
                      _c1687 = _c1686;
                    }
                    if (!(_c1687)) continue;
                    _g1675++;
                  }
                }
                let _c1955: boolean = (_g1670 < (2 - _g1675));
                if (_c1955) {
                  let _q1688 = false;
                  Q1689: {
                    const _a1690 = sp.adj4[v_t];
                    for (let _i1691 = 0; _i1691 < _a1690.length; _i1691++) {
                      const v_y = _a1690[_i1691];
                      const _t1692 = sp.adj4Edges[v_t][_i1691];
                      let _c1711: boolean = !((_t1692 === _wc1644 ? true : (b.grid[_t1692] !== 0)));
                      if (_c1711) {
                        let _g1693 = 0;
                        G1694: {
                          const _a1695 = sp.adj4[v_t];
                          for (let _i1696 = 0; _i1696 < _a1695.length; _i1696++) {
                            const _t1697 = sp.adj4Edges[v_t][_i1696];
                            if (!(((_t1697 === _wc1644 ? _wd1645 : (b.grid[_t1697] || -1)) === 1))) continue;
                            _g1693++;
                          }
                        }
                        let _g1698 = 0;
                        G1699: {
                          for (let _i1700 = 0; _i1700 < 1; _i1700++) {
                            const v_k = v_t;
                            const _h1701 = clueAt(cl.number, v_k);
                            const _h1708 = (_h1701 + 1);
                            let _c1710: boolean = (_h1701 !== -1);
                            if (_c1710) {
                              let _c1709: boolean = (_h531 || (_h1701 === 1));
                              if (!_c1709) {
                                let _g1702 = 0;
                                G1703: {
                                  const _t1704 = (_h1701 + 1);
                                  const _a1705 = cluesValued(cl.number, _t1704);
                                  for (let _i1706 = 0; _i1706 < _a1705.length; _i1706++) {
                                    const v_x = _a1705[_i1706];
                                    const _h1707 = clueAt(cl.number, v_x);
                                    if (!((_h1707 === _h1708))) continue;
                                    _g1702++;
                                  }
                                }
                                _c1709 = (_g1702 === 0);
                              }
                              _c1710 = _c1709;
                            }
                            if (!(_c1710)) continue;
                            _g1698++;
                          }
                        }
                        _c1711 = (_g1693 < (2 - _g1698));
                      }
                      let _c1731: boolean = _c1711;
                      if (_c1731) {
                        let _g1712 = 0;
                        G1713: {
                          const _a1715 = sp.adj4[v_y];
                          for (let _i1716 = 0; _i1716 < _a1715.length; _i1716++) {
                            const _t1717 = sp.adj4Edges[v_y][_i1716];
                            if (!(((_t1717 === _wc1644 ? _wd1645 : (b.grid[_t1717] || -1)) === 1))) continue;
                            _g1712++;
                          }
                        }
                        let _g1718 = 0;
                        G1719: {
                          for (let _i1720 = 0; _i1720 < 1; _i1720++) {
                            const v_k = v_y;
                            const _h1721 = clueAt(cl.number, v_k);
                            const _h1728 = (_h1721 + 1);
                            let _c1730: boolean = (_h1721 !== -1);
                            if (_c1730) {
                              let _c1729: boolean = (_h531 || (_h1721 === 1));
                              if (!_c1729) {
                                let _g1722 = 0;
                                G1723: {
                                  const _t1724 = (_h1721 + 1);
                                  const _a1725 = cluesValued(cl.number, _t1724);
                                  for (let _i1726 = 0; _i1726 < _a1725.length; _i1726++) {
                                    const v_x = _a1725[_i1726];
                                    const _h1727 = clueAt(cl.number, v_x);
                                    if (!((_h1727 === _h1728))) continue;
                                    _g1722++;
                                  }
                                }
                                _c1729 = (_g1722 === 0);
                              }
                              _c1730 = _c1729;
                            }
                            if (!(_c1730)) continue;
                            _g1718++;
                          }
                        }
                        _c1731 = (_g1712 < (2 - _g1718));
                      }
                      let _c1810: boolean = _c1731;
                      if (_c1810) {
                        let _q1732 = true;
                        Q1733: {
                          const _g1734: number[] = [];
                          G1735: {
                            for (let _i1737 = 0; _i1737 < 1; _i1737++) {
                              const v_x = v_t;
                              const _h1738 = clueAt(cl.number, v_x);
                              if (!((_h1738 !== -1))) continue;
                              _g1734.push(v_x);
                            }
                          }
                          const _g1739: number[] = [];
                          G1740: {
                            const _a1759 = throughWhere(sp, v_t, (_te1754: number): boolean => { let _c1756: boolean = ((_te1754 === _wc1644 ? _wd1645 : (b.grid[_te1754] || -1)) === 1); if (_c1756) {   const _t1755 = sp.edgeEnds[2 * _te1754];   _c1756 = !((clueAt(cl.number, _t1755) !== -1)); } let _c1758: boolean = _c1756; if (_c1758) {   const _t1757 = sp.edgeEnds[2 * _te1754 + 1];   _c1758 = !((clueAt(cl.number, _t1757) !== -1)); } return _c1758; });
                            for (let _i1760 = 0; _i1760 < _a1759.length; _i1760++) {
                              const v_t_1753 = _a1759[_i1760];
                              const _h1763 = clueAt(cl.number, v_t_1753);
                              const _h1764 = (_h1763 !== -1);
                              const _h1765 = _h1764;
                              const _h1766 = !(_h1765);
                              const _a1761 = sp.adj4[v_t_1753];
                              for (let _i1762 = 0; _i1762 < _a1761.length; _i1762++) {
                                const v_x = _a1761[_i1762];
                                const _h1767 = clueAt(cl.number, v_x);
                                let _c1769: boolean = (_h1766 && (_h1767 !== -1));
                                if (_c1769) {
                                  const _t1768 = sp.adj4Edges[v_t_1753][_i1762];
                                  _c1769 = ((_t1768 === _wc1644 ? _wd1645 : (b.grid[_t1768] || -1)) === 1);
                                }
                                if (!(_c1769)) continue;
                                if (!_g1739.includes(v_x)) _g1739.push(v_x);
                              }
                            }
                          }
                          const _a1770 = union(_g1734, _g1739);
                          for (let _i1771 = 0; _i1771 < _a1770.length; _i1771++) {
                            const v_p = _a1770[_i1771];
                            const _h1808 = clueAt(cl.number, v_p);
                            const _g1772: number[] = [];
                            G1773: {
                              for (let _i1775 = 0; _i1775 < 1; _i1775++) {
                                const v_x = v_y;
                                const _h1776 = clueAt(cl.number, v_x);
                                if (!((_h1776 !== -1))) continue;
                                _g1772.push(v_x);
                              }
                            }
                            const _g1777: number[] = [];
                            G1778: {
                              const _a1795 = throughWhere(sp, v_y, (_te1790: number): boolean => { let _c1792: boolean = ((_te1790 === _wc1644 ? _wd1645 : (b.grid[_te1790] || -1)) === 1); if (_c1792) {   const _t1791 = sp.edgeEnds[2 * _te1790];   _c1792 = !((clueAt(cl.number, _t1791) !== -1)); } let _c1794: boolean = _c1792; if (_c1794) {   const _t1793 = sp.edgeEnds[2 * _te1790 + 1];   _c1794 = !((clueAt(cl.number, _t1793) !== -1)); } return _c1794; });
                              for (let _i1796 = 0; _i1796 < _a1795.length; _i1796++) {
                                const v_t = _a1795[_i1796];
                                const _h1799 = clueAt(cl.number, v_t);
                                const _h1800 = (_h1799 !== -1);
                                const _h1801 = _h1800;
                                const _h1802 = !(_h1801);
                                const _a1797 = sp.adj4[v_t];
                                for (let _i1798 = 0; _i1798 < _a1797.length; _i1798++) {
                                  const v_x = _a1797[_i1798];
                                  const _h1803 = clueAt(cl.number, v_x);
                                  let _c1805: boolean = (_h1802 && (_h1803 !== -1));
                                  if (_c1805) {
                                    const _t1804 = sp.adj4Edges[v_t][_i1798];
                                    _c1805 = ((_t1804 === _wc1644 ? _wd1645 : (b.grid[_t1804] || -1)) === 1);
                                  }
                                  if (!(_c1805)) continue;
                                  if (!_g1777.includes(v_x)) _g1777.push(v_x);
                                }
                              }
                            }
                            const _a1806 = union(_g1772, _g1777);
                            for (let _i1807 = 0; _i1807 < _a1806.length; _i1807++) {
                              const v_q = _a1806[_i1807];
                              const _h1809 = clueAt(cl.number, v_q);
                              if (!((Math.abs((_h1808 - _h1809)) === cl.step))) {
                                _q1732 = false;
                                break Q1733;
                              }
                            }
                          }
                        }
                        _c1810 = _q1732;
                      }
                      if (!((_c1810 && (_h531 || !(throughWhere(sp, v_t, (_te1811: number): boolean => {  return ((_te1811 === _wc1644 ? _wd1645 : (b.grid[_te1811] || -1)) === 1); }).includes(v_y)))))) continue;
                      let _g1812 = 0;
                      G1813: {
                        const _a1814 = sp.adj4[v_t];
                        for (let _i1815 = 0; _i1815 < _a1814.length; _i1815++) {
                          const _t1816 = sp.adj4Edges[v_t][_i1815];
                          if (!(((_t1816 === _wc1644 ? _wd1645 : (b.grid[_t1816] || -1)) === 1))) continue;
                          _g1812++;
                        }
                      }
                      let _g1817 = 0;
                      G1818: {
                        for (let _i1819 = 0; _i1819 < 1; _i1819++) {
                          const v_k = v_t;
                          const _h1820 = clueAt(cl.number, v_k);
                          const _h1827 = (_h1820 + 1);
                          let _c1829: boolean = (_h1820 !== -1);
                          if (_c1829) {
                            let _c1828: boolean = (_h531 || (_h1820 === 1));
                            if (!_c1828) {
                              let _g1821 = 0;
                              G1822: {
                                const _t1823 = (_h1820 + 1);
                                const _a1824 = cluesValued(cl.number, _t1823);
                                for (let _i1825 = 0; _i1825 < _a1824.length; _i1825++) {
                                  const v_x = _a1824[_i1825];
                                  const _h1826 = clueAt(cl.number, v_x);
                                  if (!((_h1826 === _h1827))) continue;
                                  _g1821++;
                                }
                              }
                              _c1828 = (_g1821 === 0);
                            }
                            _c1829 = _c1828;
                          }
                          if (!(_c1829)) continue;
                          _g1817++;
                        }
                      }
                      let _c1954: boolean = ((_g1812 + 1) === (2 - _g1817));
                      if (!_c1954) {
                        let _q1830 = false;
                        Q1831: {
                          const _a1832 = sp.adj4[v_t];
                          const _n1833 = _i1691;
                          for (let _i1834 = 0; _i1834 < _n1833; _i1834++) {
                            const v_z = _a1832[_i1834];
                            const _t1835 = sp.adj4Edges[v_t][_i1834];
                            let _c1854: boolean = !((_t1835 === _wc1644 ? true : (b.grid[_t1835] !== 0)));
                            if (_c1854) {
                              let _g1836 = 0;
                              G1837: {
                                const _a1838 = sp.adj4[v_t];
                                for (let _i1839 = 0; _i1839 < _a1838.length; _i1839++) {
                                  const _t1840 = sp.adj4Edges[v_t][_i1839];
                                  if (!(((_t1840 === _wc1644 ? _wd1645 : (b.grid[_t1840] || -1)) === 1))) continue;
                                  _g1836++;
                                }
                              }
                              let _g1841 = 0;
                              G1842: {
                                for (let _i1843 = 0; _i1843 < 1; _i1843++) {
                                  const v_k = v_t;
                                  const _h1844 = clueAt(cl.number, v_k);
                                  const _h1851 = (_h1844 + 1);
                                  let _c1853: boolean = (_h1844 !== -1);
                                  if (_c1853) {
                                    let _c1852: boolean = (_h531 || (_h1844 === 1));
                                    if (!_c1852) {
                                      let _g1845 = 0;
                                      G1846: {
                                        const _t1847 = (_h1844 + 1);
                                        const _a1848 = cluesValued(cl.number, _t1847);
                                        for (let _i1849 = 0; _i1849 < _a1848.length; _i1849++) {
                                          const v_x = _a1848[_i1849];
                                          const _h1850 = clueAt(cl.number, v_x);
                                          if (!((_h1850 === _h1851))) continue;
                                          _g1845++;
                                        }
                                      }
                                      _c1852 = (_g1845 === 0);
                                    }
                                    _c1853 = _c1852;
                                  }
                                  if (!(_c1853)) continue;
                                  _g1841++;
                                }
                              }
                              _c1854 = (_g1836 < (2 - _g1841));
                            }
                            let _c1873: boolean = _c1854;
                            if (_c1873) {
                              let _g1855 = 0;
                              G1856: {
                                const _a1857 = sp.adj4[v_z];
                                for (let _i1858 = 0; _i1858 < _a1857.length; _i1858++) {
                                  const _t1859 = sp.adj4Edges[v_z][_i1858];
                                  if (!(((_t1859 === _wc1644 ? _wd1645 : (b.grid[_t1859] || -1)) === 1))) continue;
                                  _g1855++;
                                }
                              }
                              let _g1860 = 0;
                              G1861: {
                                for (let _i1862 = 0; _i1862 < 1; _i1862++) {
                                  const v_k = v_z;
                                  const _h1863 = clueAt(cl.number, v_k);
                                  const _h1870 = (_h1863 + 1);
                                  let _c1872: boolean = (_h1863 !== -1);
                                  if (_c1872) {
                                    let _c1871: boolean = (_h531 || (_h1863 === 1));
                                    if (!_c1871) {
                                      let _g1864 = 0;
                                      G1865: {
                                        const _t1866 = (_h1863 + 1);
                                        const _a1867 = cluesValued(cl.number, _t1866);
                                        for (let _i1868 = 0; _i1868 < _a1867.length; _i1868++) {
                                          const v_x = _a1867[_i1868];
                                          const _h1869 = clueAt(cl.number, v_x);
                                          if (!((_h1869 === _h1870))) continue;
                                          _g1864++;
                                        }
                                      }
                                      _c1871 = (_g1864 === 0);
                                    }
                                    _c1872 = _c1871;
                                  }
                                  if (!(_c1872)) continue;
                                  _g1860++;
                                }
                              }
                              _c1873 = (_g1855 < (2 - _g1860));
                            }
                            let _c1952: boolean = _c1873;
                            if (_c1952) {
                              let _q1874 = true;
                              Q1875: {
                                const _g1876: number[] = [];
                                G1877: {
                                  for (let _i1879 = 0; _i1879 < 1; _i1879++) {
                                    const v_x = v_t;
                                    const _h1880 = clueAt(cl.number, v_x);
                                    if (!((_h1880 !== -1))) continue;
                                    _g1876.push(v_x);
                                  }
                                }
                                const _g1881: number[] = [];
                                G1882: {
                                  const _a1901 = throughWhere(sp, v_t, (_te1896: number): boolean => { let _c1898: boolean = ((_te1896 === _wc1644 ? _wd1645 : (b.grid[_te1896] || -1)) === 1); if (_c1898) {   const _t1897 = sp.edgeEnds[2 * _te1896];   _c1898 = !((clueAt(cl.number, _t1897) !== -1)); } let _c1900: boolean = _c1898; if (_c1900) {   const _t1899 = sp.edgeEnds[2 * _te1896 + 1];   _c1900 = !((clueAt(cl.number, _t1899) !== -1)); } return _c1900; });
                                  for (let _i1902 = 0; _i1902 < _a1901.length; _i1902++) {
                                    const v_t_1895 = _a1901[_i1902];
                                    const _h1905 = clueAt(cl.number, v_t_1895);
                                    const _h1906 = (_h1905 !== -1);
                                    const _h1907 = _h1906;
                                    const _h1908 = !(_h1907);
                                    const _a1903 = sp.adj4[v_t_1895];
                                    for (let _i1904 = 0; _i1904 < _a1903.length; _i1904++) {
                                      const v_x = _a1903[_i1904];
                                      const _h1909 = clueAt(cl.number, v_x);
                                      let _c1911: boolean = (_h1908 && (_h1909 !== -1));
                                      if (_c1911) {
                                        const _t1910 = sp.adj4Edges[v_t_1895][_i1904];
                                        _c1911 = ((_t1910 === _wc1644 ? _wd1645 : (b.grid[_t1910] || -1)) === 1);
                                      }
                                      if (!(_c1911)) continue;
                                      if (!_g1881.includes(v_x)) _g1881.push(v_x);
                                    }
                                  }
                                }
                                const _a1912 = union(_g1876, _g1881);
                                for (let _i1913 = 0; _i1913 < _a1912.length; _i1913++) {
                                  const v_p = _a1912[_i1913];
                                  const _h1950 = clueAt(cl.number, v_p);
                                  const _g1914: number[] = [];
                                  G1915: {
                                    for (let _i1917 = 0; _i1917 < 1; _i1917++) {
                                      const v_x = v_z;
                                      const _h1918 = clueAt(cl.number, v_x);
                                      if (!((_h1918 !== -1))) continue;
                                      _g1914.push(v_x);
                                    }
                                  }
                                  const _g1919: number[] = [];
                                  G1920: {
                                    const _a1937 = throughWhere(sp, v_z, (_te1932: number): boolean => { let _c1934: boolean = ((_te1932 === _wc1644 ? _wd1645 : (b.grid[_te1932] || -1)) === 1); if (_c1934) {   const _t1933 = sp.edgeEnds[2 * _te1932];   _c1934 = !((clueAt(cl.number, _t1933) !== -1)); } let _c1936: boolean = _c1934; if (_c1936) {   const _t1935 = sp.edgeEnds[2 * _te1932 + 1];   _c1936 = !((clueAt(cl.number, _t1935) !== -1)); } return _c1936; });
                                    for (let _i1938 = 0; _i1938 < _a1937.length; _i1938++) {
                                      const v_t = _a1937[_i1938];
                                      const _h1941 = clueAt(cl.number, v_t);
                                      const _h1942 = (_h1941 !== -1);
                                      const _h1943 = _h1942;
                                      const _h1944 = !(_h1943);
                                      const _a1939 = sp.adj4[v_t];
                                      for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
                                        const v_x = _a1939[_i1940];
                                        const _h1945 = clueAt(cl.number, v_x);
                                        let _c1947: boolean = (_h1944 && (_h1945 !== -1));
                                        if (_c1947) {
                                          const _t1946 = sp.adj4Edges[v_t][_i1940];
                                          _c1947 = ((_t1946 === _wc1644 ? _wd1645 : (b.grid[_t1946] || -1)) === 1);
                                        }
                                        if (!(_c1947)) continue;
                                        if (!_g1919.includes(v_x)) _g1919.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1948 = union(_g1914, _g1919);
                                  for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
                                    const v_q = _a1948[_i1949];
                                    const _h1951 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h1950 - _h1951)) === cl.step))) {
                                      _q1874 = false;
                                      break Q1875;
                                    }
                                  }
                                }
                              }
                              _c1952 = _q1874;
                            }
                            if ((_c1952 && (_h531 || !(throughWhere(sp, v_t, (_te1953: number): boolean => {  return ((_te1953 === _wc1644 ? _wd1645 : (b.grid[_te1953] || -1)) === 1); }).includes(v_z))))) {
                              _q1830 = true;
                              break Q1831;
                            }
                          }
                        }
                        _c1954 = _q1830;
                      }
                      if (_c1954) {
                        _q1688 = true;
                        break Q1689;
                      }
                    }
                  }
                  _c1955 = !(_q1688);
                }
                let _c2242: boolean = _c1955;
                if (!_c2242) {
                  let _q1956 = false;
                  Q1957: {
                    const _a1958 = sp.adj4[v_t];
                    for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                      const v_s = _a1958[_i1959];
                      let _g1960 = 0;
                      G1961: {
                        const _a1962 = sp.adj4[v_s];
                        for (let _i1963 = 0; _i1963 < _a1962.length; _i1963++) {
                          const _t1964 = sp.adj4Edges[v_s][_i1963];
                          if (!(((_t1964 === _wc1644 ? _wd1645 : (b.grid[_t1964] || -1)) === 1))) continue;
                          _g1960++;
                        }
                      }
                      let _g1965 = 0;
                      G1966: {
                        for (let _i1967 = 0; _i1967 < 1; _i1967++) {
                          const v_k = v_s;
                          const _h1968 = clueAt(cl.number, v_k);
                          const _h1975 = (_h1968 + 1);
                          let _c1977: boolean = (_h1968 !== -1);
                          if (_c1977) {
                            let _c1976: boolean = (_h531 || (_h1968 === 1));
                            if (!_c1976) {
                              let _g1969 = 0;
                              G1970: {
                                const _t1971 = (_h1968 + 1);
                                const _a1972 = cluesValued(cl.number, _t1971);
                                for (let _i1973 = 0; _i1973 < _a1972.length; _i1973++) {
                                  const v_x = _a1972[_i1973];
                                  const _h1974 = clueAt(cl.number, v_x);
                                  if (!((_h1974 === _h1975))) continue;
                                  _g1969++;
                                }
                              }
                              _c1976 = (_g1969 === 0);
                            }
                            _c1977 = _c1976;
                          }
                          if (!(_c1977)) continue;
                          _g1965++;
                        }
                      }
                      let _c2241: boolean = (_g1960 < (2 - _g1965));
                      if (_c2241) {
                        let _q1978 = false;
                        Q1979: {
                          const _a1980 = sp.adj4[v_s];
                          for (let _i1981 = 0; _i1981 < _a1980.length; _i1981++) {
                            const v_y = _a1980[_i1981];
                            const _t1982 = sp.adj4Edges[v_s][_i1981];
                            let _c2001: boolean = !((_t1982 === _wc1644 ? true : (b.grid[_t1982] !== 0)));
                            if (_c2001) {
                              let _g1983 = 0;
                              G1984: {
                                const _a1985 = sp.adj4[v_s];
                                for (let _i1986 = 0; _i1986 < _a1985.length; _i1986++) {
                                  const _t1987 = sp.adj4Edges[v_s][_i1986];
                                  if (!(((_t1987 === _wc1644 ? _wd1645 : (b.grid[_t1987] || -1)) === 1))) continue;
                                  _g1983++;
                                }
                              }
                              let _g1988 = 0;
                              G1989: {
                                for (let _i1990 = 0; _i1990 < 1; _i1990++) {
                                  const v_k = v_s;
                                  const _h1991 = clueAt(cl.number, v_k);
                                  const _h1998 = (_h1991 + 1);
                                  let _c2000: boolean = (_h1991 !== -1);
                                  if (_c2000) {
                                    let _c1999: boolean = (_h531 || (_h1991 === 1));
                                    if (!_c1999) {
                                      let _g1992 = 0;
                                      G1993: {
                                        const _t1994 = (_h1991 + 1);
                                        const _a1995 = cluesValued(cl.number, _t1994);
                                        for (let _i1996 = 0; _i1996 < _a1995.length; _i1996++) {
                                          const v_x = _a1995[_i1996];
                                          const _h1997 = clueAt(cl.number, v_x);
                                          if (!((_h1997 === _h1998))) continue;
                                          _g1992++;
                                        }
                                      }
                                      _c1999 = (_g1992 === 0);
                                    }
                                    _c2000 = _c1999;
                                  }
                                  if (!(_c2000)) continue;
                                  _g1988++;
                                }
                              }
                              _c2001 = (_g1983 < (2 - _g1988));
                            }
                            let _c2021: boolean = _c2001;
                            if (_c2021) {
                              let _g2002 = 0;
                              G2003: {
                                const _a2005 = sp.adj4[v_y];
                                for (let _i2006 = 0; _i2006 < _a2005.length; _i2006++) {
                                  const _t2007 = sp.adj4Edges[v_y][_i2006];
                                  if (!(((_t2007 === _wc1644 ? _wd1645 : (b.grid[_t2007] || -1)) === 1))) continue;
                                  _g2002++;
                                }
                              }
                              let _g2008 = 0;
                              G2009: {
                                for (let _i2010 = 0; _i2010 < 1; _i2010++) {
                                  const v_k = v_y;
                                  const _h2011 = clueAt(cl.number, v_k);
                                  const _h2018 = (_h2011 + 1);
                                  let _c2020: boolean = (_h2011 !== -1);
                                  if (_c2020) {
                                    let _c2019: boolean = (_h531 || (_h2011 === 1));
                                    if (!_c2019) {
                                      let _g2012 = 0;
                                      G2013: {
                                        const _t2014 = (_h2011 + 1);
                                        const _a2015 = cluesValued(cl.number, _t2014);
                                        for (let _i2016 = 0; _i2016 < _a2015.length; _i2016++) {
                                          const v_x = _a2015[_i2016];
                                          const _h2017 = clueAt(cl.number, v_x);
                                          if (!((_h2017 === _h2018))) continue;
                                          _g2012++;
                                        }
                                      }
                                      _c2019 = (_g2012 === 0);
                                    }
                                    _c2020 = _c2019;
                                  }
                                  if (!(_c2020)) continue;
                                  _g2008++;
                                }
                              }
                              _c2021 = (_g2002 < (2 - _g2008));
                            }
                            let _c2098: boolean = _c2021;
                            if (_c2098) {
                              let _q2022 = true;
                              Q2023: {
                                const _g2024: number[] = [];
                                G2025: {
                                  for (let _i2027 = 0; _i2027 < 1; _i2027++) {
                                    const v_x = v_s;
                                    const _h2028 = clueAt(cl.number, v_x);
                                    if (!((_h2028 !== -1))) continue;
                                    _g2024.push(v_x);
                                  }
                                }
                                const _g2029: number[] = [];
                                G2030: {
                                  const _a2047 = throughWhere(sp, v_s, (_te2042: number): boolean => { let _c2044: boolean = ((_te2042 === _wc1644 ? _wd1645 : (b.grid[_te2042] || -1)) === 1); if (_c2044) {   const _t2043 = sp.edgeEnds[2 * _te2042];   _c2044 = !((clueAt(cl.number, _t2043) !== -1)); } let _c2046: boolean = _c2044; if (_c2046) {   const _t2045 = sp.edgeEnds[2 * _te2042 + 1];   _c2046 = !((clueAt(cl.number, _t2045) !== -1)); } return _c2046; });
                                  for (let _i2048 = 0; _i2048 < _a2047.length; _i2048++) {
                                    const v_t = _a2047[_i2048];
                                    const _h2051 = clueAt(cl.number, v_t);
                                    const _h2052 = (_h2051 !== -1);
                                    const _h2053 = _h2052;
                                    const _h2054 = !(_h2053);
                                    const _a2049 = sp.adj4[v_t];
                                    for (let _i2050 = 0; _i2050 < _a2049.length; _i2050++) {
                                      const v_x = _a2049[_i2050];
                                      const _h2055 = clueAt(cl.number, v_x);
                                      let _c2057: boolean = (_h2054 && (_h2055 !== -1));
                                      if (_c2057) {
                                        const _t2056 = sp.adj4Edges[v_t][_i2050];
                                        _c2057 = ((_t2056 === _wc1644 ? _wd1645 : (b.grid[_t2056] || -1)) === 1);
                                      }
                                      if (!(_c2057)) continue;
                                      if (!_g2029.includes(v_x)) _g2029.push(v_x);
                                    }
                                  }
                                }
                                const _a2058 = union(_g2024, _g2029);
                                for (let _i2059 = 0; _i2059 < _a2058.length; _i2059++) {
                                  const v_p = _a2058[_i2059];
                                  const _h2096 = clueAt(cl.number, v_p);
                                  const _g2060: number[] = [];
                                  G2061: {
                                    for (let _i2063 = 0; _i2063 < 1; _i2063++) {
                                      const v_x = v_y;
                                      const _h2064 = clueAt(cl.number, v_x);
                                      if (!((_h2064 !== -1))) continue;
                                      _g2060.push(v_x);
                                    }
                                  }
                                  const _g2065: number[] = [];
                                  G2066: {
                                    const _a2083 = throughWhere(sp, v_y, (_te2078: number): boolean => { let _c2080: boolean = ((_te2078 === _wc1644 ? _wd1645 : (b.grid[_te2078] || -1)) === 1); if (_c2080) {   const _t2079 = sp.edgeEnds[2 * _te2078];   _c2080 = !((clueAt(cl.number, _t2079) !== -1)); } let _c2082: boolean = _c2080; if (_c2082) {   const _t2081 = sp.edgeEnds[2 * _te2078 + 1];   _c2082 = !((clueAt(cl.number, _t2081) !== -1)); } return _c2082; });
                                    for (let _i2084 = 0; _i2084 < _a2083.length; _i2084++) {
                                      const v_t = _a2083[_i2084];
                                      const _h2087 = clueAt(cl.number, v_t);
                                      const _h2088 = (_h2087 !== -1);
                                      const _h2089 = _h2088;
                                      const _h2090 = !(_h2089);
                                      const _a2085 = sp.adj4[v_t];
                                      for (let _i2086 = 0; _i2086 < _a2085.length; _i2086++) {
                                        const v_x = _a2085[_i2086];
                                        const _h2091 = clueAt(cl.number, v_x);
                                        let _c2093: boolean = (_h2090 && (_h2091 !== -1));
                                        if (_c2093) {
                                          const _t2092 = sp.adj4Edges[v_t][_i2086];
                                          _c2093 = ((_t2092 === _wc1644 ? _wd1645 : (b.grid[_t2092] || -1)) === 1);
                                        }
                                        if (!(_c2093)) continue;
                                        if (!_g2065.includes(v_x)) _g2065.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2094 = union(_g2060, _g2065);
                                  for (let _i2095 = 0; _i2095 < _a2094.length; _i2095++) {
                                    const v_q = _a2094[_i2095];
                                    const _h2097 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2096 - _h2097)) === cl.step))) {
                                      _q2022 = false;
                                      break Q2023;
                                    }
                                  }
                                }
                              }
                              _c2098 = _q2022;
                            }
                            if (!((_c2098 && (_h531 || !(throughWhere(sp, v_s, (_te2099: number): boolean => {  return ((_te2099 === _wc1644 ? _wd1645 : (b.grid[_te2099] || -1)) === 1); }).includes(v_y)))))) continue;
                            let _g2100 = 0;
                            G2101: {
                              const _a2102 = sp.adj4[v_s];
                              for (let _i2103 = 0; _i2103 < _a2102.length; _i2103++) {
                                const _t2104 = sp.adj4Edges[v_s][_i2103];
                                if (!(((_t2104 === _wc1644 ? _wd1645 : (b.grid[_t2104] || -1)) === 1))) continue;
                                _g2100++;
                              }
                            }
                            let _g2105 = 0;
                            G2106: {
                              for (let _i2107 = 0; _i2107 < 1; _i2107++) {
                                const v_k = v_s;
                                const _h2108 = clueAt(cl.number, v_k);
                                const _h2115 = (_h2108 + 1);
                                let _c2117: boolean = (_h2108 !== -1);
                                if (_c2117) {
                                  let _c2116: boolean = (_h531 || (_h2108 === 1));
                                  if (!_c2116) {
                                    let _g2109 = 0;
                                    G2110: {
                                      const _t2111 = (_h2108 + 1);
                                      const _a2112 = cluesValued(cl.number, _t2111);
                                      for (let _i2113 = 0; _i2113 < _a2112.length; _i2113++) {
                                        const v_x = _a2112[_i2113];
                                        const _h2114 = clueAt(cl.number, v_x);
                                        if (!((_h2114 === _h2115))) continue;
                                        _g2109++;
                                      }
                                    }
                                    _c2116 = (_g2109 === 0);
                                  }
                                  _c2117 = _c2116;
                                }
                                if (!(_c2117)) continue;
                                _g2105++;
                              }
                            }
                            let _c2240: boolean = ((_g2100 + 1) === (2 - _g2105));
                            if (!_c2240) {
                              let _q2118 = false;
                              Q2119: {
                                const _a2120 = sp.adj4[v_s];
                                const _n2121 = _i1981;
                                for (let _i2122 = 0; _i2122 < _n2121; _i2122++) {
                                  const v_z = _a2120[_i2122];
                                  const _t2123 = sp.adj4Edges[v_s][_i2122];
                                  let _c2142: boolean = !((_t2123 === _wc1644 ? true : (b.grid[_t2123] !== 0)));
                                  if (_c2142) {
                                    let _g2124 = 0;
                                    G2125: {
                                      const _a2126 = sp.adj4[v_s];
                                      for (let _i2127 = 0; _i2127 < _a2126.length; _i2127++) {
                                        const _t2128 = sp.adj4Edges[v_s][_i2127];
                                        if (!(((_t2128 === _wc1644 ? _wd1645 : (b.grid[_t2128] || -1)) === 1))) continue;
                                        _g2124++;
                                      }
                                    }
                                    let _g2129 = 0;
                                    G2130: {
                                      for (let _i2131 = 0; _i2131 < 1; _i2131++) {
                                        const v_k = v_s;
                                        const _h2132 = clueAt(cl.number, v_k);
                                        const _h2139 = (_h2132 + 1);
                                        let _c2141: boolean = (_h2132 !== -1);
                                        if (_c2141) {
                                          let _c2140: boolean = (_h531 || (_h2132 === 1));
                                          if (!_c2140) {
                                            let _g2133 = 0;
                                            G2134: {
                                              const _t2135 = (_h2132 + 1);
                                              const _a2136 = cluesValued(cl.number, _t2135);
                                              for (let _i2137 = 0; _i2137 < _a2136.length; _i2137++) {
                                                const v_x = _a2136[_i2137];
                                                const _h2138 = clueAt(cl.number, v_x);
                                                if (!((_h2138 === _h2139))) continue;
                                                _g2133++;
                                              }
                                            }
                                            _c2140 = (_g2133 === 0);
                                          }
                                          _c2141 = _c2140;
                                        }
                                        if (!(_c2141)) continue;
                                        _g2129++;
                                      }
                                    }
                                    _c2142 = (_g2124 < (2 - _g2129));
                                  }
                                  let _c2161: boolean = _c2142;
                                  if (_c2161) {
                                    let _g2143 = 0;
                                    G2144: {
                                      const _a2145 = sp.adj4[v_z];
                                      for (let _i2146 = 0; _i2146 < _a2145.length; _i2146++) {
                                        const _t2147 = sp.adj4Edges[v_z][_i2146];
                                        if (!(((_t2147 === _wc1644 ? _wd1645 : (b.grid[_t2147] || -1)) === 1))) continue;
                                        _g2143++;
                                      }
                                    }
                                    let _g2148 = 0;
                                    G2149: {
                                      for (let _i2150 = 0; _i2150 < 1; _i2150++) {
                                        const v_k = v_z;
                                        const _h2151 = clueAt(cl.number, v_k);
                                        const _h2158 = (_h2151 + 1);
                                        let _c2160: boolean = (_h2151 !== -1);
                                        if (_c2160) {
                                          let _c2159: boolean = (_h531 || (_h2151 === 1));
                                          if (!_c2159) {
                                            let _g2152 = 0;
                                            G2153: {
                                              const _t2154 = (_h2151 + 1);
                                              const _a2155 = cluesValued(cl.number, _t2154);
                                              for (let _i2156 = 0; _i2156 < _a2155.length; _i2156++) {
                                                const v_x = _a2155[_i2156];
                                                const _h2157 = clueAt(cl.number, v_x);
                                                if (!((_h2157 === _h2158))) continue;
                                                _g2152++;
                                              }
                                            }
                                            _c2159 = (_g2152 === 0);
                                          }
                                          _c2160 = _c2159;
                                        }
                                        if (!(_c2160)) continue;
                                        _g2148++;
                                      }
                                    }
                                    _c2161 = (_g2143 < (2 - _g2148));
                                  }
                                  let _c2238: boolean = _c2161;
                                  if (_c2238) {
                                    let _q2162 = true;
                                    Q2163: {
                                      const _g2164: number[] = [];
                                      G2165: {
                                        for (let _i2167 = 0; _i2167 < 1; _i2167++) {
                                          const v_x = v_s;
                                          const _h2168 = clueAt(cl.number, v_x);
                                          if (!((_h2168 !== -1))) continue;
                                          _g2164.push(v_x);
                                        }
                                      }
                                      const _g2169: number[] = [];
                                      G2170: {
                                        const _a2187 = throughWhere(sp, v_s, (_te2182: number): boolean => { let _c2184: boolean = ((_te2182 === _wc1644 ? _wd1645 : (b.grid[_te2182] || -1)) === 1); if (_c2184) {   const _t2183 = sp.edgeEnds[2 * _te2182];   _c2184 = !((clueAt(cl.number, _t2183) !== -1)); } let _c2186: boolean = _c2184; if (_c2186) {   const _t2185 = sp.edgeEnds[2 * _te2182 + 1];   _c2186 = !((clueAt(cl.number, _t2185) !== -1)); } return _c2186; });
                                        for (let _i2188 = 0; _i2188 < _a2187.length; _i2188++) {
                                          const v_t = _a2187[_i2188];
                                          const _h2191 = clueAt(cl.number, v_t);
                                          const _h2192 = (_h2191 !== -1);
                                          const _h2193 = _h2192;
                                          const _h2194 = !(_h2193);
                                          const _a2189 = sp.adj4[v_t];
                                          for (let _i2190 = 0; _i2190 < _a2189.length; _i2190++) {
                                            const v_x = _a2189[_i2190];
                                            const _h2195 = clueAt(cl.number, v_x);
                                            let _c2197: boolean = (_h2194 && (_h2195 !== -1));
                                            if (_c2197) {
                                              const _t2196 = sp.adj4Edges[v_t][_i2190];
                                              _c2197 = ((_t2196 === _wc1644 ? _wd1645 : (b.grid[_t2196] || -1)) === 1);
                                            }
                                            if (!(_c2197)) continue;
                                            if (!_g2169.includes(v_x)) _g2169.push(v_x);
                                          }
                                        }
                                      }
                                      const _a2198 = union(_g2164, _g2169);
                                      for (let _i2199 = 0; _i2199 < _a2198.length; _i2199++) {
                                        const v_p = _a2198[_i2199];
                                        const _h2236 = clueAt(cl.number, v_p);
                                        const _g2200: number[] = [];
                                        G2201: {
                                          for (let _i2203 = 0; _i2203 < 1; _i2203++) {
                                            const v_x = v_z;
                                            const _h2204 = clueAt(cl.number, v_x);
                                            if (!((_h2204 !== -1))) continue;
                                            _g2200.push(v_x);
                                          }
                                        }
                                        const _g2205: number[] = [];
                                        G2206: {
                                          const _a2223 = throughWhere(sp, v_z, (_te2218: number): boolean => { let _c2220: boolean = ((_te2218 === _wc1644 ? _wd1645 : (b.grid[_te2218] || -1)) === 1); if (_c2220) {   const _t2219 = sp.edgeEnds[2 * _te2218];   _c2220 = !((clueAt(cl.number, _t2219) !== -1)); } let _c2222: boolean = _c2220; if (_c2222) {   const _t2221 = sp.edgeEnds[2 * _te2218 + 1];   _c2222 = !((clueAt(cl.number, _t2221) !== -1)); } return _c2222; });
                                          for (let _i2224 = 0; _i2224 < _a2223.length; _i2224++) {
                                            const v_t = _a2223[_i2224];
                                            const _h2227 = clueAt(cl.number, v_t);
                                            const _h2228 = (_h2227 !== -1);
                                            const _h2229 = _h2228;
                                            const _h2230 = !(_h2229);
                                            const _a2225 = sp.adj4[v_t];
                                            for (let _i2226 = 0; _i2226 < _a2225.length; _i2226++) {
                                              const v_x = _a2225[_i2226];
                                              const _h2231 = clueAt(cl.number, v_x);
                                              let _c2233: boolean = (_h2230 && (_h2231 !== -1));
                                              if (_c2233) {
                                                const _t2232 = sp.adj4Edges[v_t][_i2226];
                                                _c2233 = ((_t2232 === _wc1644 ? _wd1645 : (b.grid[_t2232] || -1)) === 1);
                                              }
                                              if (!(_c2233)) continue;
                                              if (!_g2205.includes(v_x)) _g2205.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2234 = union(_g2200, _g2205);
                                        for (let _i2235 = 0; _i2235 < _a2234.length; _i2235++) {
                                          const v_q = _a2234[_i2235];
                                          const _h2237 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h2236 - _h2237)) === cl.step))) {
                                            _q2162 = false;
                                            break Q2163;
                                          }
                                        }
                                      }
                                    }
                                    _c2238 = _q2162;
                                  }
                                  if ((_c2238 && (_h531 || !(throughWhere(sp, v_s, (_te2239: number): boolean => {  return ((_te2239 === _wc1644 ? _wd1645 : (b.grid[_te2239] || -1)) === 1); }).includes(v_z))))) {
                                    _q2118 = true;
                                    break Q2119;
                                  }
                                }
                              }
                              _c2240 = _q2118;
                            }
                            if (_c2240) {
                              _q1978 = true;
                              break Q1979;
                            }
                          }
                        }
                        _c2241 = !(_q1978);
                      }
                      if (_c2241) {
                        _q1956 = true;
                        break Q1957;
                      }
                    }
                  }
                  _c2242 = _q1956;
                }
                if (_c2242) {
                  let _wo2243: Witness | null = null;
                  let _g2244 = 0;
                  G2245: {
                    const _a2246 = sp.adj4[v_t];
                    for (let _i2247 = 0; _i2247 < _a2246.length; _i2247++) {
                      const _t2248 = sp.adj4Edges[v_t][_i2247];
                      if (!(((_t2248 === _wc1644 ? _wd1645 : (b.grid[_t2248] || -1)) === 1))) continue;
                      _g2244++;
                    }
                  }
                  let _g2249 = 0;
                  G2250: {
                    for (let _i2251 = 0; _i2251 < 1; _i2251++) {
                      const v_k = v_t;
                      const _h2252 = clueAt(cl.number, v_k);
                      const _h2259 = (_h2252 + 1);
                      let _c2261: boolean = (_h2252 !== -1);
                      if (_c2261) {
                        let _c2260: boolean = (_h531 || (_h2252 === 1));
                        if (!_c2260) {
                          let _g2253 = 0;
                          G2254: {
                            const _t2255 = (_h2252 + 1);
                            const _a2256 = cluesValued(cl.number, _t2255);
                            for (let _i2257 = 0; _i2257 < _a2256.length; _i2257++) {
                              const v_x = _a2256[_i2257];
                              const _h2258 = clueAt(cl.number, v_x);
                              if (!((_h2258 === _h2259))) continue;
                              _g2253++;
                            }
                          }
                          _c2260 = (_g2253 === 0);
                        }
                        _c2261 = _c2260;
                      }
                      if (!(_c2261)) continue;
                      _g2249++;
                    }
                  }
                  let _c2529: boolean = (_g2244 < (2 - _g2249));
                  if (_c2529) {
                    let _q2262 = false;
                    Q2263: {
                      const _a2264 = sp.adj4[v_t];
                      for (let _i2265 = 0; _i2265 < _a2264.length; _i2265++) {
                        const v_y = _a2264[_i2265];
                        const _t2266 = sp.adj4Edges[v_t][_i2265];
                        let _c2285: boolean = !((_t2266 === _wc1644 ? true : (b.grid[_t2266] !== 0)));
                        if (_c2285) {
                          let _g2267 = 0;
                          G2268: {
                            const _a2269 = sp.adj4[v_t];
                            for (let _i2270 = 0; _i2270 < _a2269.length; _i2270++) {
                              const _t2271 = sp.adj4Edges[v_t][_i2270];
                              if (!(((_t2271 === _wc1644 ? _wd1645 : (b.grid[_t2271] || -1)) === 1))) continue;
                              _g2267++;
                            }
                          }
                          let _g2272 = 0;
                          G2273: {
                            for (let _i2274 = 0; _i2274 < 1; _i2274++) {
                              const v_k = v_t;
                              const _h2275 = clueAt(cl.number, v_k);
                              const _h2282 = (_h2275 + 1);
                              let _c2284: boolean = (_h2275 !== -1);
                              if (_c2284) {
                                let _c2283: boolean = (_h531 || (_h2275 === 1));
                                if (!_c2283) {
                                  let _g2276 = 0;
                                  G2277: {
                                    const _t2278 = (_h2275 + 1);
                                    const _a2279 = cluesValued(cl.number, _t2278);
                                    for (let _i2280 = 0; _i2280 < _a2279.length; _i2280++) {
                                      const v_x = _a2279[_i2280];
                                      const _h2281 = clueAt(cl.number, v_x);
                                      if (!((_h2281 === _h2282))) continue;
                                      _g2276++;
                                    }
                                  }
                                  _c2283 = (_g2276 === 0);
                                }
                                _c2284 = _c2283;
                              }
                              if (!(_c2284)) continue;
                              _g2272++;
                            }
                          }
                          _c2285 = (_g2267 < (2 - _g2272));
                        }
                        let _c2305: boolean = _c2285;
                        if (_c2305) {
                          let _g2286 = 0;
                          G2287: {
                            const _a2289 = sp.adj4[v_y];
                            for (let _i2290 = 0; _i2290 < _a2289.length; _i2290++) {
                              const _t2291 = sp.adj4Edges[v_y][_i2290];
                              if (!(((_t2291 === _wc1644 ? _wd1645 : (b.grid[_t2291] || -1)) === 1))) continue;
                              _g2286++;
                            }
                          }
                          let _g2292 = 0;
                          G2293: {
                            for (let _i2294 = 0; _i2294 < 1; _i2294++) {
                              const v_k = v_y;
                              const _h2295 = clueAt(cl.number, v_k);
                              const _h2302 = (_h2295 + 1);
                              let _c2304: boolean = (_h2295 !== -1);
                              if (_c2304) {
                                let _c2303: boolean = (_h531 || (_h2295 === 1));
                                if (!_c2303) {
                                  let _g2296 = 0;
                                  G2297: {
                                    const _t2298 = (_h2295 + 1);
                                    const _a2299 = cluesValued(cl.number, _t2298);
                                    for (let _i2300 = 0; _i2300 < _a2299.length; _i2300++) {
                                      const v_x = _a2299[_i2300];
                                      const _h2301 = clueAt(cl.number, v_x);
                                      if (!((_h2301 === _h2302))) continue;
                                      _g2296++;
                                    }
                                  }
                                  _c2303 = (_g2296 === 0);
                                }
                                _c2304 = _c2303;
                              }
                              if (!(_c2304)) continue;
                              _g2292++;
                            }
                          }
                          _c2305 = (_g2286 < (2 - _g2292));
                        }
                        let _c2384: boolean = _c2305;
                        if (_c2384) {
                          let _q2306 = true;
                          Q2307: {
                            const _g2308: number[] = [];
                            G2309: {
                              for (let _i2311 = 0; _i2311 < 1; _i2311++) {
                                const v_x = v_t;
                                const _h2312 = clueAt(cl.number, v_x);
                                if (!((_h2312 !== -1))) continue;
                                _g2308.push(v_x);
                              }
                            }
                            const _g2313: number[] = [];
                            G2314: {
                              const _a2333 = throughWhere(sp, v_t, (_te2328: number): boolean => { let _c2330: boolean = ((_te2328 === _wc1644 ? _wd1645 : (b.grid[_te2328] || -1)) === 1); if (_c2330) {   const _t2329 = sp.edgeEnds[2 * _te2328];   _c2330 = !((clueAt(cl.number, _t2329) !== -1)); } let _c2332: boolean = _c2330; if (_c2332) {   const _t2331 = sp.edgeEnds[2 * _te2328 + 1];   _c2332 = !((clueAt(cl.number, _t2331) !== -1)); } return _c2332; });
                              for (let _i2334 = 0; _i2334 < _a2333.length; _i2334++) {
                                const v_t_2327 = _a2333[_i2334];
                                const _h2337 = clueAt(cl.number, v_t_2327);
                                const _h2338 = (_h2337 !== -1);
                                const _h2339 = _h2338;
                                const _h2340 = !(_h2339);
                                const _a2335 = sp.adj4[v_t_2327];
                                for (let _i2336 = 0; _i2336 < _a2335.length; _i2336++) {
                                  const v_x = _a2335[_i2336];
                                  const _h2341 = clueAt(cl.number, v_x);
                                  let _c2343: boolean = (_h2340 && (_h2341 !== -1));
                                  if (_c2343) {
                                    const _t2342 = sp.adj4Edges[v_t_2327][_i2336];
                                    _c2343 = ((_t2342 === _wc1644 ? _wd1645 : (b.grid[_t2342] || -1)) === 1);
                                  }
                                  if (!(_c2343)) continue;
                                  if (!_g2313.includes(v_x)) _g2313.push(v_x);
                                }
                              }
                            }
                            const _a2344 = union(_g2308, _g2313);
                            for (let _i2345 = 0; _i2345 < _a2344.length; _i2345++) {
                              const v_p = _a2344[_i2345];
                              const _h2382 = clueAt(cl.number, v_p);
                              const _g2346: number[] = [];
                              G2347: {
                                for (let _i2349 = 0; _i2349 < 1; _i2349++) {
                                  const v_x = v_y;
                                  const _h2350 = clueAt(cl.number, v_x);
                                  if (!((_h2350 !== -1))) continue;
                                  _g2346.push(v_x);
                                }
                              }
                              const _g2351: number[] = [];
                              G2352: {
                                const _a2369 = throughWhere(sp, v_y, (_te2364: number): boolean => { let _c2366: boolean = ((_te2364 === _wc1644 ? _wd1645 : (b.grid[_te2364] || -1)) === 1); if (_c2366) {   const _t2365 = sp.edgeEnds[2 * _te2364];   _c2366 = !((clueAt(cl.number, _t2365) !== -1)); } let _c2368: boolean = _c2366; if (_c2368) {   const _t2367 = sp.edgeEnds[2 * _te2364 + 1];   _c2368 = !((clueAt(cl.number, _t2367) !== -1)); } return _c2368; });
                                for (let _i2370 = 0; _i2370 < _a2369.length; _i2370++) {
                                  const v_t = _a2369[_i2370];
                                  const _h2373 = clueAt(cl.number, v_t);
                                  const _h2374 = (_h2373 !== -1);
                                  const _h2375 = _h2374;
                                  const _h2376 = !(_h2375);
                                  const _a2371 = sp.adj4[v_t];
                                  for (let _i2372 = 0; _i2372 < _a2371.length; _i2372++) {
                                    const v_x = _a2371[_i2372];
                                    const _h2377 = clueAt(cl.number, v_x);
                                    let _c2379: boolean = (_h2376 && (_h2377 !== -1));
                                    if (_c2379) {
                                      const _t2378 = sp.adj4Edges[v_t][_i2372];
                                      _c2379 = ((_t2378 === _wc1644 ? _wd1645 : (b.grid[_t2378] || -1)) === 1);
                                    }
                                    if (!(_c2379)) continue;
                                    if (!_g2351.includes(v_x)) _g2351.push(v_x);
                                  }
                                }
                              }
                              const _a2380 = union(_g2346, _g2351);
                              for (let _i2381 = 0; _i2381 < _a2380.length; _i2381++) {
                                const v_q = _a2380[_i2381];
                                const _h2383 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h2382 - _h2383)) === cl.step))) {
                                  _q2306 = false;
                                  break Q2307;
                                }
                              }
                            }
                          }
                          _c2384 = _q2306;
                        }
                        if (!((_c2384 && (_h531 || !(throughWhere(sp, v_t, (_te2385: number): boolean => {  return ((_te2385 === _wc1644 ? _wd1645 : (b.grid[_te2385] || -1)) === 1); }).includes(v_y)))))) continue;
                        let _g2386 = 0;
                        G2387: {
                          const _a2388 = sp.adj4[v_t];
                          for (let _i2389 = 0; _i2389 < _a2388.length; _i2389++) {
                            const _t2390 = sp.adj4Edges[v_t][_i2389];
                            if (!(((_t2390 === _wc1644 ? _wd1645 : (b.grid[_t2390] || -1)) === 1))) continue;
                            _g2386++;
                          }
                        }
                        let _g2391 = 0;
                        G2392: {
                          for (let _i2393 = 0; _i2393 < 1; _i2393++) {
                            const v_k = v_t;
                            const _h2394 = clueAt(cl.number, v_k);
                            const _h2401 = (_h2394 + 1);
                            let _c2403: boolean = (_h2394 !== -1);
                            if (_c2403) {
                              let _c2402: boolean = (_h531 || (_h2394 === 1));
                              if (!_c2402) {
                                let _g2395 = 0;
                                G2396: {
                                  const _t2397 = (_h2394 + 1);
                                  const _a2398 = cluesValued(cl.number, _t2397);
                                  for (let _i2399 = 0; _i2399 < _a2398.length; _i2399++) {
                                    const v_x = _a2398[_i2399];
                                    const _h2400 = clueAt(cl.number, v_x);
                                    if (!((_h2400 === _h2401))) continue;
                                    _g2395++;
                                  }
                                }
                                _c2402 = (_g2395 === 0);
                              }
                              _c2403 = _c2402;
                            }
                            if (!(_c2403)) continue;
                            _g2391++;
                          }
                        }
                        let _c2528: boolean = ((_g2386 + 1) === (2 - _g2391));
                        if (!_c2528) {
                          let _q2404 = false;
                          Q2405: {
                            const _a2406 = sp.adj4[v_t];
                            const _n2407 = _i2265;
                            for (let _i2408 = 0; _i2408 < _n2407; _i2408++) {
                              const v_z = _a2406[_i2408];
                              const _t2409 = sp.adj4Edges[v_t][_i2408];
                              let _c2428: boolean = !((_t2409 === _wc1644 ? true : (b.grid[_t2409] !== 0)));
                              if (_c2428) {
                                let _g2410 = 0;
                                G2411: {
                                  const _a2412 = sp.adj4[v_t];
                                  for (let _i2413 = 0; _i2413 < _a2412.length; _i2413++) {
                                    const _t2414 = sp.adj4Edges[v_t][_i2413];
                                    if (!(((_t2414 === _wc1644 ? _wd1645 : (b.grid[_t2414] || -1)) === 1))) continue;
                                    _g2410++;
                                  }
                                }
                                let _g2415 = 0;
                                G2416: {
                                  for (let _i2417 = 0; _i2417 < 1; _i2417++) {
                                    const v_k = v_t;
                                    const _h2418 = clueAt(cl.number, v_k);
                                    const _h2425 = (_h2418 + 1);
                                    let _c2427: boolean = (_h2418 !== -1);
                                    if (_c2427) {
                                      let _c2426: boolean = (_h531 || (_h2418 === 1));
                                      if (!_c2426) {
                                        let _g2419 = 0;
                                        G2420: {
                                          const _t2421 = (_h2418 + 1);
                                          const _a2422 = cluesValued(cl.number, _t2421);
                                          for (let _i2423 = 0; _i2423 < _a2422.length; _i2423++) {
                                            const v_x = _a2422[_i2423];
                                            const _h2424 = clueAt(cl.number, v_x);
                                            if (!((_h2424 === _h2425))) continue;
                                            _g2419++;
                                          }
                                        }
                                        _c2426 = (_g2419 === 0);
                                      }
                                      _c2427 = _c2426;
                                    }
                                    if (!(_c2427)) continue;
                                    _g2415++;
                                  }
                                }
                                _c2428 = (_g2410 < (2 - _g2415));
                              }
                              let _c2447: boolean = _c2428;
                              if (_c2447) {
                                let _g2429 = 0;
                                G2430: {
                                  const _a2431 = sp.adj4[v_z];
                                  for (let _i2432 = 0; _i2432 < _a2431.length; _i2432++) {
                                    const _t2433 = sp.adj4Edges[v_z][_i2432];
                                    if (!(((_t2433 === _wc1644 ? _wd1645 : (b.grid[_t2433] || -1)) === 1))) continue;
                                    _g2429++;
                                  }
                                }
                                let _g2434 = 0;
                                G2435: {
                                  for (let _i2436 = 0; _i2436 < 1; _i2436++) {
                                    const v_k = v_z;
                                    const _h2437 = clueAt(cl.number, v_k);
                                    const _h2444 = (_h2437 + 1);
                                    let _c2446: boolean = (_h2437 !== -1);
                                    if (_c2446) {
                                      let _c2445: boolean = (_h531 || (_h2437 === 1));
                                      if (!_c2445) {
                                        let _g2438 = 0;
                                        G2439: {
                                          const _t2440 = (_h2437 + 1);
                                          const _a2441 = cluesValued(cl.number, _t2440);
                                          for (let _i2442 = 0; _i2442 < _a2441.length; _i2442++) {
                                            const v_x = _a2441[_i2442];
                                            const _h2443 = clueAt(cl.number, v_x);
                                            if (!((_h2443 === _h2444))) continue;
                                            _g2438++;
                                          }
                                        }
                                        _c2445 = (_g2438 === 0);
                                      }
                                      _c2446 = _c2445;
                                    }
                                    if (!(_c2446)) continue;
                                    _g2434++;
                                  }
                                }
                                _c2447 = (_g2429 < (2 - _g2434));
                              }
                              let _c2526: boolean = _c2447;
                              if (_c2526) {
                                let _q2448 = true;
                                Q2449: {
                                  const _g2450: number[] = [];
                                  G2451: {
                                    for (let _i2453 = 0; _i2453 < 1; _i2453++) {
                                      const v_x = v_t;
                                      const _h2454 = clueAt(cl.number, v_x);
                                      if (!((_h2454 !== -1))) continue;
                                      _g2450.push(v_x);
                                    }
                                  }
                                  const _g2455: number[] = [];
                                  G2456: {
                                    const _a2475 = throughWhere(sp, v_t, (_te2470: number): boolean => { let _c2472: boolean = ((_te2470 === _wc1644 ? _wd1645 : (b.grid[_te2470] || -1)) === 1); if (_c2472) {   const _t2471 = sp.edgeEnds[2 * _te2470];   _c2472 = !((clueAt(cl.number, _t2471) !== -1)); } let _c2474: boolean = _c2472; if (_c2474) {   const _t2473 = sp.edgeEnds[2 * _te2470 + 1];   _c2474 = !((clueAt(cl.number, _t2473) !== -1)); } return _c2474; });
                                    for (let _i2476 = 0; _i2476 < _a2475.length; _i2476++) {
                                      const v_t_2469 = _a2475[_i2476];
                                      const _h2479 = clueAt(cl.number, v_t_2469);
                                      const _h2480 = (_h2479 !== -1);
                                      const _h2481 = _h2480;
                                      const _h2482 = !(_h2481);
                                      const _a2477 = sp.adj4[v_t_2469];
                                      for (let _i2478 = 0; _i2478 < _a2477.length; _i2478++) {
                                        const v_x = _a2477[_i2478];
                                        const _h2483 = clueAt(cl.number, v_x);
                                        let _c2485: boolean = (_h2482 && (_h2483 !== -1));
                                        if (_c2485) {
                                          const _t2484 = sp.adj4Edges[v_t_2469][_i2478];
                                          _c2485 = ((_t2484 === _wc1644 ? _wd1645 : (b.grid[_t2484] || -1)) === 1);
                                        }
                                        if (!(_c2485)) continue;
                                        if (!_g2455.includes(v_x)) _g2455.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2486 = union(_g2450, _g2455);
                                  for (let _i2487 = 0; _i2487 < _a2486.length; _i2487++) {
                                    const v_p = _a2486[_i2487];
                                    const _h2524 = clueAt(cl.number, v_p);
                                    const _g2488: number[] = [];
                                    G2489: {
                                      for (let _i2491 = 0; _i2491 < 1; _i2491++) {
                                        const v_x = v_z;
                                        const _h2492 = clueAt(cl.number, v_x);
                                        if (!((_h2492 !== -1))) continue;
                                        _g2488.push(v_x);
                                      }
                                    }
                                    const _g2493: number[] = [];
                                    G2494: {
                                      const _a2511 = throughWhere(sp, v_z, (_te2506: number): boolean => { let _c2508: boolean = ((_te2506 === _wc1644 ? _wd1645 : (b.grid[_te2506] || -1)) === 1); if (_c2508) {   const _t2507 = sp.edgeEnds[2 * _te2506];   _c2508 = !((clueAt(cl.number, _t2507) !== -1)); } let _c2510: boolean = _c2508; if (_c2510) {   const _t2509 = sp.edgeEnds[2 * _te2506 + 1];   _c2510 = !((clueAt(cl.number, _t2509) !== -1)); } return _c2510; });
                                      for (let _i2512 = 0; _i2512 < _a2511.length; _i2512++) {
                                        const v_t = _a2511[_i2512];
                                        const _h2515 = clueAt(cl.number, v_t);
                                        const _h2516 = (_h2515 !== -1);
                                        const _h2517 = _h2516;
                                        const _h2518 = !(_h2517);
                                        const _a2513 = sp.adj4[v_t];
                                        for (let _i2514 = 0; _i2514 < _a2513.length; _i2514++) {
                                          const v_x = _a2513[_i2514];
                                          const _h2519 = clueAt(cl.number, v_x);
                                          let _c2521: boolean = (_h2518 && (_h2519 !== -1));
                                          if (_c2521) {
                                            const _t2520 = sp.adj4Edges[v_t][_i2514];
                                            _c2521 = ((_t2520 === _wc1644 ? _wd1645 : (b.grid[_t2520] || -1)) === 1);
                                          }
                                          if (!(_c2521)) continue;
                                          if (!_g2493.includes(v_x)) _g2493.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2522 = union(_g2488, _g2493);
                                    for (let _i2523 = 0; _i2523 < _a2522.length; _i2523++) {
                                      const v_q = _a2522[_i2523];
                                      const _h2525 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2524 - _h2525)) === cl.step))) {
                                        _q2448 = false;
                                        break Q2449;
                                      }
                                    }
                                  }
                                }
                                _c2526 = _q2448;
                              }
                              if ((_c2526 && (_h531 || !(throughWhere(sp, v_t, (_te2527: number): boolean => {  return ((_te2527 === _wc1644 ? _wd1645 : (b.grid[_te2527] || -1)) === 1); }).includes(v_z))))) {
                                _q2404 = true;
                                break Q2405;
                              }
                            }
                          }
                          _c2528 = _q2404;
                        }
                        if (_c2528) {
                          _q2262 = true;
                          break Q2263;
                        }
                      }
                    }
                    _c2529 = !(_q2262);
                  }
                  if (_c2529) {
                    _wo2243 = { held: "arm", arm: 0, of: { held: "def", name: "stuck", of: { held: "def", name: "spare", of: null } } };
                  }
                  if (!_c2529) {
                    let _wm2530: Witness | null = null;
                    W2531: {
                      const _a2532 = sp.adj4[v_t];
                      for (let _i2533 = 0; _i2533 < _a2532.length; _i2533++) {
                        const v_s = _a2532[_i2533];
                        let _g2534 = 0;
                        G2535: {
                          const _a2536 = sp.adj4[v_s];
                          for (let _i2537 = 0; _i2537 < _a2536.length; _i2537++) {
                            const _t2538 = sp.adj4Edges[v_s][_i2537];
                            if (!(((_t2538 === _wc1644 ? _wd1645 : (b.grid[_t2538] || -1)) === 1))) continue;
                            _g2534++;
                          }
                        }
                        let _g2539 = 0;
                        G2540: {
                          for (let _i2541 = 0; _i2541 < 1; _i2541++) {
                            const v_k = v_s;
                            const _h2542 = clueAt(cl.number, v_k);
                            const _h2549 = (_h2542 + 1);
                            let _c2551: boolean = (_h2542 !== -1);
                            if (_c2551) {
                              let _c2550: boolean = (_h531 || (_h2542 === 1));
                              if (!_c2550) {
                                let _g2543 = 0;
                                G2544: {
                                  const _t2545 = (_h2542 + 1);
                                  const _a2546 = cluesValued(cl.number, _t2545);
                                  for (let _i2547 = 0; _i2547 < _a2546.length; _i2547++) {
                                    const v_x = _a2546[_i2547];
                                    const _h2548 = clueAt(cl.number, v_x);
                                    if (!((_h2548 === _h2549))) continue;
                                    _g2543++;
                                  }
                                }
                                _c2550 = (_g2543 === 0);
                              }
                              _c2551 = _c2550;
                            }
                            if (!(_c2551)) continue;
                            _g2539++;
                          }
                        }
                        let _c2815: boolean = (_g2534 < (2 - _g2539));
                        if (_c2815) {
                          let _q2552 = false;
                          Q2553: {
                            const _a2554 = sp.adj4[v_s];
                            for (let _i2555 = 0; _i2555 < _a2554.length; _i2555++) {
                              const v_y = _a2554[_i2555];
                              const _t2556 = sp.adj4Edges[v_s][_i2555];
                              let _c2575: boolean = !((_t2556 === _wc1644 ? true : (b.grid[_t2556] !== 0)));
                              if (_c2575) {
                                let _g2557 = 0;
                                G2558: {
                                  const _a2559 = sp.adj4[v_s];
                                  for (let _i2560 = 0; _i2560 < _a2559.length; _i2560++) {
                                    const _t2561 = sp.adj4Edges[v_s][_i2560];
                                    if (!(((_t2561 === _wc1644 ? _wd1645 : (b.grid[_t2561] || -1)) === 1))) continue;
                                    _g2557++;
                                  }
                                }
                                let _g2562 = 0;
                                G2563: {
                                  for (let _i2564 = 0; _i2564 < 1; _i2564++) {
                                    const v_k = v_s;
                                    const _h2565 = clueAt(cl.number, v_k);
                                    const _h2572 = (_h2565 + 1);
                                    let _c2574: boolean = (_h2565 !== -1);
                                    if (_c2574) {
                                      let _c2573: boolean = (_h531 || (_h2565 === 1));
                                      if (!_c2573) {
                                        let _g2566 = 0;
                                        G2567: {
                                          const _t2568 = (_h2565 + 1);
                                          const _a2569 = cluesValued(cl.number, _t2568);
                                          for (let _i2570 = 0; _i2570 < _a2569.length; _i2570++) {
                                            const v_x = _a2569[_i2570];
                                            const _h2571 = clueAt(cl.number, v_x);
                                            if (!((_h2571 === _h2572))) continue;
                                            _g2566++;
                                          }
                                        }
                                        _c2573 = (_g2566 === 0);
                                      }
                                      _c2574 = _c2573;
                                    }
                                    if (!(_c2574)) continue;
                                    _g2562++;
                                  }
                                }
                                _c2575 = (_g2557 < (2 - _g2562));
                              }
                              let _c2595: boolean = _c2575;
                              if (_c2595) {
                                let _g2576 = 0;
                                G2577: {
                                  const _a2579 = sp.adj4[v_y];
                                  for (let _i2580 = 0; _i2580 < _a2579.length; _i2580++) {
                                    const _t2581 = sp.adj4Edges[v_y][_i2580];
                                    if (!(((_t2581 === _wc1644 ? _wd1645 : (b.grid[_t2581] || -1)) === 1))) continue;
                                    _g2576++;
                                  }
                                }
                                let _g2582 = 0;
                                G2583: {
                                  for (let _i2584 = 0; _i2584 < 1; _i2584++) {
                                    const v_k = v_y;
                                    const _h2585 = clueAt(cl.number, v_k);
                                    const _h2592 = (_h2585 + 1);
                                    let _c2594: boolean = (_h2585 !== -1);
                                    if (_c2594) {
                                      let _c2593: boolean = (_h531 || (_h2585 === 1));
                                      if (!_c2593) {
                                        let _g2586 = 0;
                                        G2587: {
                                          const _t2588 = (_h2585 + 1);
                                          const _a2589 = cluesValued(cl.number, _t2588);
                                          for (let _i2590 = 0; _i2590 < _a2589.length; _i2590++) {
                                            const v_x = _a2589[_i2590];
                                            const _h2591 = clueAt(cl.number, v_x);
                                            if (!((_h2591 === _h2592))) continue;
                                            _g2586++;
                                          }
                                        }
                                        _c2593 = (_g2586 === 0);
                                      }
                                      _c2594 = _c2593;
                                    }
                                    if (!(_c2594)) continue;
                                    _g2582++;
                                  }
                                }
                                _c2595 = (_g2576 < (2 - _g2582));
                              }
                              let _c2672: boolean = _c2595;
                              if (_c2672) {
                                let _q2596 = true;
                                Q2597: {
                                  const _g2598: number[] = [];
                                  G2599: {
                                    for (let _i2601 = 0; _i2601 < 1; _i2601++) {
                                      const v_x = v_s;
                                      const _h2602 = clueAt(cl.number, v_x);
                                      if (!((_h2602 !== -1))) continue;
                                      _g2598.push(v_x);
                                    }
                                  }
                                  const _g2603: number[] = [];
                                  G2604: {
                                    const _a2621 = throughWhere(sp, v_s, (_te2616: number): boolean => { let _c2618: boolean = ((_te2616 === _wc1644 ? _wd1645 : (b.grid[_te2616] || -1)) === 1); if (_c2618) {   const _t2617 = sp.edgeEnds[2 * _te2616];   _c2618 = !((clueAt(cl.number, _t2617) !== -1)); } let _c2620: boolean = _c2618; if (_c2620) {   const _t2619 = sp.edgeEnds[2 * _te2616 + 1];   _c2620 = !((clueAt(cl.number, _t2619) !== -1)); } return _c2620; });
                                    for (let _i2622 = 0; _i2622 < _a2621.length; _i2622++) {
                                      const v_t = _a2621[_i2622];
                                      const _h2625 = clueAt(cl.number, v_t);
                                      const _h2626 = (_h2625 !== -1);
                                      const _h2627 = _h2626;
                                      const _h2628 = !(_h2627);
                                      const _a2623 = sp.adj4[v_t];
                                      for (let _i2624 = 0; _i2624 < _a2623.length; _i2624++) {
                                        const v_x = _a2623[_i2624];
                                        const _h2629 = clueAt(cl.number, v_x);
                                        let _c2631: boolean = (_h2628 && (_h2629 !== -1));
                                        if (_c2631) {
                                          const _t2630 = sp.adj4Edges[v_t][_i2624];
                                          _c2631 = ((_t2630 === _wc1644 ? _wd1645 : (b.grid[_t2630] || -1)) === 1);
                                        }
                                        if (!(_c2631)) continue;
                                        if (!_g2603.includes(v_x)) _g2603.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2632 = union(_g2598, _g2603);
                                  for (let _i2633 = 0; _i2633 < _a2632.length; _i2633++) {
                                    const v_p = _a2632[_i2633];
                                    const _h2670 = clueAt(cl.number, v_p);
                                    const _g2634: number[] = [];
                                    G2635: {
                                      for (let _i2637 = 0; _i2637 < 1; _i2637++) {
                                        const v_x = v_y;
                                        const _h2638 = clueAt(cl.number, v_x);
                                        if (!((_h2638 !== -1))) continue;
                                        _g2634.push(v_x);
                                      }
                                    }
                                    const _g2639: number[] = [];
                                    G2640: {
                                      const _a2657 = throughWhere(sp, v_y, (_te2652: number): boolean => { let _c2654: boolean = ((_te2652 === _wc1644 ? _wd1645 : (b.grid[_te2652] || -1)) === 1); if (_c2654) {   const _t2653 = sp.edgeEnds[2 * _te2652];   _c2654 = !((clueAt(cl.number, _t2653) !== -1)); } let _c2656: boolean = _c2654; if (_c2656) {   const _t2655 = sp.edgeEnds[2 * _te2652 + 1];   _c2656 = !((clueAt(cl.number, _t2655) !== -1)); } return _c2656; });
                                      for (let _i2658 = 0; _i2658 < _a2657.length; _i2658++) {
                                        const v_t = _a2657[_i2658];
                                        const _h2661 = clueAt(cl.number, v_t);
                                        const _h2662 = (_h2661 !== -1);
                                        const _h2663 = _h2662;
                                        const _h2664 = !(_h2663);
                                        const _a2659 = sp.adj4[v_t];
                                        for (let _i2660 = 0; _i2660 < _a2659.length; _i2660++) {
                                          const v_x = _a2659[_i2660];
                                          const _h2665 = clueAt(cl.number, v_x);
                                          let _c2667: boolean = (_h2664 && (_h2665 !== -1));
                                          if (_c2667) {
                                            const _t2666 = sp.adj4Edges[v_t][_i2660];
                                            _c2667 = ((_t2666 === _wc1644 ? _wd1645 : (b.grid[_t2666] || -1)) === 1);
                                          }
                                          if (!(_c2667)) continue;
                                          if (!_g2639.includes(v_x)) _g2639.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2668 = union(_g2634, _g2639);
                                    for (let _i2669 = 0; _i2669 < _a2668.length; _i2669++) {
                                      const v_q = _a2668[_i2669];
                                      const _h2671 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2670 - _h2671)) === cl.step))) {
                                        _q2596 = false;
                                        break Q2597;
                                      }
                                    }
                                  }
                                }
                                _c2672 = _q2596;
                              }
                              if (!((_c2672 && (_h531 || !(throughWhere(sp, v_s, (_te2673: number): boolean => {  return ((_te2673 === _wc1644 ? _wd1645 : (b.grid[_te2673] || -1)) === 1); }).includes(v_y)))))) continue;
                              let _g2674 = 0;
                              G2675: {
                                const _a2676 = sp.adj4[v_s];
                                for (let _i2677 = 0; _i2677 < _a2676.length; _i2677++) {
                                  const _t2678 = sp.adj4Edges[v_s][_i2677];
                                  if (!(((_t2678 === _wc1644 ? _wd1645 : (b.grid[_t2678] || -1)) === 1))) continue;
                                  _g2674++;
                                }
                              }
                              let _g2679 = 0;
                              G2680: {
                                for (let _i2681 = 0; _i2681 < 1; _i2681++) {
                                  const v_k = v_s;
                                  const _h2682 = clueAt(cl.number, v_k);
                                  const _h2689 = (_h2682 + 1);
                                  let _c2691: boolean = (_h2682 !== -1);
                                  if (_c2691) {
                                    let _c2690: boolean = (_h531 || (_h2682 === 1));
                                    if (!_c2690) {
                                      let _g2683 = 0;
                                      G2684: {
                                        const _t2685 = (_h2682 + 1);
                                        const _a2686 = cluesValued(cl.number, _t2685);
                                        for (let _i2687 = 0; _i2687 < _a2686.length; _i2687++) {
                                          const v_x = _a2686[_i2687];
                                          const _h2688 = clueAt(cl.number, v_x);
                                          if (!((_h2688 === _h2689))) continue;
                                          _g2683++;
                                        }
                                      }
                                      _c2690 = (_g2683 === 0);
                                    }
                                    _c2691 = _c2690;
                                  }
                                  if (!(_c2691)) continue;
                                  _g2679++;
                                }
                              }
                              let _c2814: boolean = ((_g2674 + 1) === (2 - _g2679));
                              if (!_c2814) {
                                let _q2692 = false;
                                Q2693: {
                                  const _a2694 = sp.adj4[v_s];
                                  const _n2695 = _i2555;
                                  for (let _i2696 = 0; _i2696 < _n2695; _i2696++) {
                                    const v_z = _a2694[_i2696];
                                    const _t2697 = sp.adj4Edges[v_s][_i2696];
                                    let _c2716: boolean = !((_t2697 === _wc1644 ? true : (b.grid[_t2697] !== 0)));
                                    if (_c2716) {
                                      let _g2698 = 0;
                                      G2699: {
                                        const _a2700 = sp.adj4[v_s];
                                        for (let _i2701 = 0; _i2701 < _a2700.length; _i2701++) {
                                          const _t2702 = sp.adj4Edges[v_s][_i2701];
                                          if (!(((_t2702 === _wc1644 ? _wd1645 : (b.grid[_t2702] || -1)) === 1))) continue;
                                          _g2698++;
                                        }
                                      }
                                      let _g2703 = 0;
                                      G2704: {
                                        for (let _i2705 = 0; _i2705 < 1; _i2705++) {
                                          const v_k = v_s;
                                          const _h2706 = clueAt(cl.number, v_k);
                                          const _h2713 = (_h2706 + 1);
                                          let _c2715: boolean = (_h2706 !== -1);
                                          if (_c2715) {
                                            let _c2714: boolean = (_h531 || (_h2706 === 1));
                                            if (!_c2714) {
                                              let _g2707 = 0;
                                              G2708: {
                                                const _t2709 = (_h2706 + 1);
                                                const _a2710 = cluesValued(cl.number, _t2709);
                                                for (let _i2711 = 0; _i2711 < _a2710.length; _i2711++) {
                                                  const v_x = _a2710[_i2711];
                                                  const _h2712 = clueAt(cl.number, v_x);
                                                  if (!((_h2712 === _h2713))) continue;
                                                  _g2707++;
                                                }
                                              }
                                              _c2714 = (_g2707 === 0);
                                            }
                                            _c2715 = _c2714;
                                          }
                                          if (!(_c2715)) continue;
                                          _g2703++;
                                        }
                                      }
                                      _c2716 = (_g2698 < (2 - _g2703));
                                    }
                                    let _c2735: boolean = _c2716;
                                    if (_c2735) {
                                      let _g2717 = 0;
                                      G2718: {
                                        const _a2719 = sp.adj4[v_z];
                                        for (let _i2720 = 0; _i2720 < _a2719.length; _i2720++) {
                                          const _t2721 = sp.adj4Edges[v_z][_i2720];
                                          if (!(((_t2721 === _wc1644 ? _wd1645 : (b.grid[_t2721] || -1)) === 1))) continue;
                                          _g2717++;
                                        }
                                      }
                                      let _g2722 = 0;
                                      G2723: {
                                        for (let _i2724 = 0; _i2724 < 1; _i2724++) {
                                          const v_k = v_z;
                                          const _h2725 = clueAt(cl.number, v_k);
                                          const _h2732 = (_h2725 + 1);
                                          let _c2734: boolean = (_h2725 !== -1);
                                          if (_c2734) {
                                            let _c2733: boolean = (_h531 || (_h2725 === 1));
                                            if (!_c2733) {
                                              let _g2726 = 0;
                                              G2727: {
                                                const _t2728 = (_h2725 + 1);
                                                const _a2729 = cluesValued(cl.number, _t2728);
                                                for (let _i2730 = 0; _i2730 < _a2729.length; _i2730++) {
                                                  const v_x = _a2729[_i2730];
                                                  const _h2731 = clueAt(cl.number, v_x);
                                                  if (!((_h2731 === _h2732))) continue;
                                                  _g2726++;
                                                }
                                              }
                                              _c2733 = (_g2726 === 0);
                                            }
                                            _c2734 = _c2733;
                                          }
                                          if (!(_c2734)) continue;
                                          _g2722++;
                                        }
                                      }
                                      _c2735 = (_g2717 < (2 - _g2722));
                                    }
                                    let _c2812: boolean = _c2735;
                                    if (_c2812) {
                                      let _q2736 = true;
                                      Q2737: {
                                        const _g2738: number[] = [];
                                        G2739: {
                                          for (let _i2741 = 0; _i2741 < 1; _i2741++) {
                                            const v_x = v_s;
                                            const _h2742 = clueAt(cl.number, v_x);
                                            if (!((_h2742 !== -1))) continue;
                                            _g2738.push(v_x);
                                          }
                                        }
                                        const _g2743: number[] = [];
                                        G2744: {
                                          const _a2761 = throughWhere(sp, v_s, (_te2756: number): boolean => { let _c2758: boolean = ((_te2756 === _wc1644 ? _wd1645 : (b.grid[_te2756] || -1)) === 1); if (_c2758) {   const _t2757 = sp.edgeEnds[2 * _te2756];   _c2758 = !((clueAt(cl.number, _t2757) !== -1)); } let _c2760: boolean = _c2758; if (_c2760) {   const _t2759 = sp.edgeEnds[2 * _te2756 + 1];   _c2760 = !((clueAt(cl.number, _t2759) !== -1)); } return _c2760; });
                                          for (let _i2762 = 0; _i2762 < _a2761.length; _i2762++) {
                                            const v_t = _a2761[_i2762];
                                            const _h2765 = clueAt(cl.number, v_t);
                                            const _h2766 = (_h2765 !== -1);
                                            const _h2767 = _h2766;
                                            const _h2768 = !(_h2767);
                                            const _a2763 = sp.adj4[v_t];
                                            for (let _i2764 = 0; _i2764 < _a2763.length; _i2764++) {
                                              const v_x = _a2763[_i2764];
                                              const _h2769 = clueAt(cl.number, v_x);
                                              let _c2771: boolean = (_h2768 && (_h2769 !== -1));
                                              if (_c2771) {
                                                const _t2770 = sp.adj4Edges[v_t][_i2764];
                                                _c2771 = ((_t2770 === _wc1644 ? _wd1645 : (b.grid[_t2770] || -1)) === 1);
                                              }
                                              if (!(_c2771)) continue;
                                              if (!_g2743.includes(v_x)) _g2743.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2772 = union(_g2738, _g2743);
                                        for (let _i2773 = 0; _i2773 < _a2772.length; _i2773++) {
                                          const v_p = _a2772[_i2773];
                                          const _h2810 = clueAt(cl.number, v_p);
                                          const _g2774: number[] = [];
                                          G2775: {
                                            for (let _i2777 = 0; _i2777 < 1; _i2777++) {
                                              const v_x = v_z;
                                              const _h2778 = clueAt(cl.number, v_x);
                                              if (!((_h2778 !== -1))) continue;
                                              _g2774.push(v_x);
                                            }
                                          }
                                          const _g2779: number[] = [];
                                          G2780: {
                                            const _a2797 = throughWhere(sp, v_z, (_te2792: number): boolean => { let _c2794: boolean = ((_te2792 === _wc1644 ? _wd1645 : (b.grid[_te2792] || -1)) === 1); if (_c2794) {   const _t2793 = sp.edgeEnds[2 * _te2792];   _c2794 = !((clueAt(cl.number, _t2793) !== -1)); } let _c2796: boolean = _c2794; if (_c2796) {   const _t2795 = sp.edgeEnds[2 * _te2792 + 1];   _c2796 = !((clueAt(cl.number, _t2795) !== -1)); } return _c2796; });
                                            for (let _i2798 = 0; _i2798 < _a2797.length; _i2798++) {
                                              const v_t = _a2797[_i2798];
                                              const _h2801 = clueAt(cl.number, v_t);
                                              const _h2802 = (_h2801 !== -1);
                                              const _h2803 = _h2802;
                                              const _h2804 = !(_h2803);
                                              const _a2799 = sp.adj4[v_t];
                                              for (let _i2800 = 0; _i2800 < _a2799.length; _i2800++) {
                                                const v_x = _a2799[_i2800];
                                                const _h2805 = clueAt(cl.number, v_x);
                                                let _c2807: boolean = (_h2804 && (_h2805 !== -1));
                                                if (_c2807) {
                                                  const _t2806 = sp.adj4Edges[v_t][_i2800];
                                                  _c2807 = ((_t2806 === _wc1644 ? _wd1645 : (b.grid[_t2806] || -1)) === 1);
                                                }
                                                if (!(_c2807)) continue;
                                                if (!_g2779.includes(v_x)) _g2779.push(v_x);
                                              }
                                            }
                                          }
                                          const _a2808 = union(_g2774, _g2779);
                                          for (let _i2809 = 0; _i2809 < _a2808.length; _i2809++) {
                                            const v_q = _a2808[_i2809];
                                            const _h2811 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h2810 - _h2811)) === cl.step))) {
                                              _q2736 = false;
                                              break Q2737;
                                            }
                                          }
                                        }
                                      }
                                      _c2812 = _q2736;
                                    }
                                    if ((_c2812 && (_h531 || !(throughWhere(sp, v_s, (_te2813: number): boolean => {  return ((_te2813 === _wc1644 ? _wd1645 : (b.grid[_te2813] || -1)) === 1); }).includes(v_z))))) {
                                      _q2692 = true;
                                      break Q2693;
                                    }
                                  }
                                }
                                _c2814 = _q2692;
                              }
                              if (_c2814) {
                                _q2552 = true;
                                break Q2553;
                              }
                            }
                          }
                          _c2815 = !(_q2552);
                        }
                        if (_c2815) {
                          _wm2530 = { held: "member", member: { s: v_s }, of: { held: "def", name: "stuck", of: { held: "def", name: "spare", of: null } } };
                          break W2531;
                        }
                      }
                    }
                    _wo2243 = { held: "arm", arm: 1, of: _wm2530 };
                  }
                  _wm1646 = { held: "member", member: { t: v_t }, of: _wo2243 };
                  break W1647;
                }
              }
            }
            _wo1641 = { held: "arm", arm: 1, of: { held: "supposing", cell: _wc1644, value: _wd1645, of: { held: "def", name: "shortNear", of: _wm1646 } } };
          }
          const _w: Witness | null = witnessAll({ held: "def", name: "live", of: witnessAll(witnessAll(witnessAll({ held: "def", name: "spare", of: null }, { held: "def", name: "spare", of: null }), { held: "def", name: "meets", of: null }), _wo1640) }, _wo1641);
          const _rc: number[] = [];
          const _re: number[] = [];
          let _c3417: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
          if (_c3417) {
            let _c3416: boolean = (throughWhere(sp, v_a, (_te2816: number): boolean => {  return ((_rc.push(_te2816), (b.grid[_te2816] || -1)) === 1); }).includes(v_b));
            if (!_c3416) {
              const _wc2817 = v_e;
              const _wd2818 = 1;
              let _q2819 = false;
              Q2820: {
                const _a2822 = throughWhere(sp, v_a, (_te2821: number): boolean => {  return ((_te2821 === _wc2817 ? _wd2818 : (_rc.push(_te2821), (b.grid[_te2821] || -1))) === 1); });
                for (let _i2823 = 0; _i2823 < _a2822.length; _i2823++) {
                  const v_t = _a2822[_i2823];
                  let _c2842: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
                  if (!_c2842) {
                    let _g2824 = 0;
                    G2825: {
                      const _a2826 = sp.adj4[v_t];
                      for (let _i2827 = 0; _i2827 < _a2826.length; _i2827++) {
                        const _t2828 = sp.adj4Edges[v_t][_i2827];
                        if (!(((_t2828 === _wc2817 ? _wd2818 : (_rc.push(_t2828), (b.grid[_t2828] || -1))) === 1))) continue;
                        _g2824++;
                      }
                    }
                    let _g2829 = 0;
                    G2830: {
                      for (let _i2831 = 0; _i2831 < 1; _i2831++) {
                        const v_k = v_t;
                        const _h2832 = clueAt(cl.number, v_k);
                        const _h2839 = (_h2832 + 1);
                        let _c2841: boolean = (_h2832 !== -1);
                        if (_c2841) {
                          let _c2840: boolean = (_h531 || (_h2832 === 1));
                          if (!_c2840) {
                            let _g2833 = 0;
                            G2834: {
                              const _t2835 = (_h2832 + 1);
                              const _a2836 = cluesValued(cl.number, _t2835);
                              for (let _i2837 = 0; _i2837 < _a2836.length; _i2837++) {
                                const v_x = _a2836[_i2837];
                                const _h2838 = clueAt(cl.number, v_x);
                                if (!((_h2838 === _h2839))) continue;
                                _g2833++;
                              }
                            }
                            _c2840 = (_g2833 === 0);
                          }
                          _c2841 = _c2840;
                        }
                        if (!(_c2841)) continue;
                        _g2829++;
                      }
                    }
                    _c2842 = (_g2824 < (2 - _g2829));
                  }
                  if (!(_c2842)) continue;
                  let _g2843 = 0;
                  G2844: {
                    const _a2845 = sp.adj4[v_t];
                    for (let _i2846 = 0; _i2846 < _a2845.length; _i2846++) {
                      const _t2847 = sp.adj4Edges[v_t][_i2846];
                      if (!(((_t2847 === _wc2817 ? _wd2818 : (_rc.push(_t2847), (b.grid[_t2847] || -1))) === 1))) continue;
                      _g2843++;
                    }
                  }
                  let _g2848 = 0;
                  G2849: {
                    for (let _i2850 = 0; _i2850 < 1; _i2850++) {
                      const v_k = v_t;
                      const _h2851 = clueAt(cl.number, v_k);
                      const _h2858 = (_h2851 + 1);
                      let _c2860: boolean = (_h2851 !== -1);
                      if (_c2860) {
                        let _c2859: boolean = (_h531 || (_h2851 === 1));
                        if (!_c2859) {
                          let _g2852 = 0;
                          G2853: {
                            const _t2854 = (_h2851 + 1);
                            const _a2855 = cluesValued(cl.number, _t2854);
                            for (let _i2856 = 0; _i2856 < _a2855.length; _i2856++) {
                              const v_x = _a2855[_i2856];
                              const _h2857 = clueAt(cl.number, v_x);
                              if (!((_h2857 === _h2858))) continue;
                              _g2852++;
                            }
                          }
                          _c2859 = (_g2852 === 0);
                        }
                        _c2860 = _c2859;
                      }
                      if (!(_c2860)) continue;
                      _g2848++;
                    }
                  }
                  let _c3128: boolean = (_g2843 < (2 - _g2848));
                  if (_c3128) {
                    let _q2861 = false;
                    Q2862: {
                      const _a2863 = sp.adj4[v_t];
                      for (let _i2864 = 0; _i2864 < _a2863.length; _i2864++) {
                        const v_y = _a2863[_i2864];
                        const _t2865 = sp.adj4Edges[v_t][_i2864];
                        let _c2884: boolean = !((_t2865 === _wc2817 ? true : (_rc.push(_t2865), (b.grid[_t2865] !== 0))));
                        if (_c2884) {
                          let _g2866 = 0;
                          G2867: {
                            const _a2868 = sp.adj4[v_t];
                            for (let _i2869 = 0; _i2869 < _a2868.length; _i2869++) {
                              const _t2870 = sp.adj4Edges[v_t][_i2869];
                              if (!(((_t2870 === _wc2817 ? _wd2818 : (_rc.push(_t2870), (b.grid[_t2870] || -1))) === 1))) continue;
                              _g2866++;
                            }
                          }
                          let _g2871 = 0;
                          G2872: {
                            for (let _i2873 = 0; _i2873 < 1; _i2873++) {
                              const v_k = v_t;
                              const _h2874 = clueAt(cl.number, v_k);
                              const _h2881 = (_h2874 + 1);
                              let _c2883: boolean = (_h2874 !== -1);
                              if (_c2883) {
                                let _c2882: boolean = (_h531 || (_h2874 === 1));
                                if (!_c2882) {
                                  let _g2875 = 0;
                                  G2876: {
                                    const _t2877 = (_h2874 + 1);
                                    const _a2878 = cluesValued(cl.number, _t2877);
                                    for (let _i2879 = 0; _i2879 < _a2878.length; _i2879++) {
                                      const v_x = _a2878[_i2879];
                                      const _h2880 = clueAt(cl.number, v_x);
                                      if (!((_h2880 === _h2881))) continue;
                                      _g2875++;
                                    }
                                  }
                                  _c2882 = (_g2875 === 0);
                                }
                                _c2883 = _c2882;
                              }
                              if (!(_c2883)) continue;
                              _g2871++;
                            }
                          }
                          _c2884 = (_g2866 < (2 - _g2871));
                        }
                        let _c2904: boolean = _c2884;
                        if (_c2904) {
                          let _g2885 = 0;
                          G2886: {
                            const _a2888 = sp.adj4[v_y];
                            for (let _i2889 = 0; _i2889 < _a2888.length; _i2889++) {
                              const _t2890 = sp.adj4Edges[v_y][_i2889];
                              if (!(((_t2890 === _wc2817 ? _wd2818 : (_rc.push(_t2890), (b.grid[_t2890] || -1))) === 1))) continue;
                              _g2885++;
                            }
                          }
                          let _g2891 = 0;
                          G2892: {
                            for (let _i2893 = 0; _i2893 < 1; _i2893++) {
                              const v_k = v_y;
                              const _h2894 = clueAt(cl.number, v_k);
                              const _h2901 = (_h2894 + 1);
                              let _c2903: boolean = (_h2894 !== -1);
                              if (_c2903) {
                                let _c2902: boolean = (_h531 || (_h2894 === 1));
                                if (!_c2902) {
                                  let _g2895 = 0;
                                  G2896: {
                                    const _t2897 = (_h2894 + 1);
                                    const _a2898 = cluesValued(cl.number, _t2897);
                                    for (let _i2899 = 0; _i2899 < _a2898.length; _i2899++) {
                                      const v_x = _a2898[_i2899];
                                      const _h2900 = clueAt(cl.number, v_x);
                                      if (!((_h2900 === _h2901))) continue;
                                      _g2895++;
                                    }
                                  }
                                  _c2902 = (_g2895 === 0);
                                }
                                _c2903 = _c2902;
                              }
                              if (!(_c2903)) continue;
                              _g2891++;
                            }
                          }
                          _c2904 = (_g2885 < (2 - _g2891));
                        }
                        let _c2983: boolean = _c2904;
                        if (_c2983) {
                          let _q2905 = true;
                          Q2906: {
                            const _g2907: number[] = [];
                            G2908: {
                              for (let _i2910 = 0; _i2910 < 1; _i2910++) {
                                const v_x = v_t;
                                const _h2911 = clueAt(cl.number, v_x);
                                if (!((_h2911 !== -1))) continue;
                                _g2907.push(v_x);
                              }
                            }
                            const _g2912: number[] = [];
                            G2913: {
                              const _a2932 = throughWhere(sp, v_t, (_te2927: number): boolean => { let _c2929: boolean = ((_te2927 === _wc2817 ? _wd2818 : (_rc.push(_te2927), (b.grid[_te2927] || -1))) === 1); if (_c2929) {   const _t2928 = sp.edgeEnds[2 * _te2927];   _c2929 = !((clueAt(cl.number, _t2928) !== -1)); } let _c2931: boolean = _c2929; if (_c2931) {   const _t2930 = sp.edgeEnds[2 * _te2927 + 1];   _c2931 = !((clueAt(cl.number, _t2930) !== -1)); } return _c2931; });
                              for (let _i2933 = 0; _i2933 < _a2932.length; _i2933++) {
                                const v_t_2926 = _a2932[_i2933];
                                const _h2936 = clueAt(cl.number, v_t_2926);
                                const _h2937 = (_h2936 !== -1);
                                const _h2938 = _h2937;
                                const _h2939 = !(_h2938);
                                const _a2934 = sp.adj4[v_t_2926];
                                for (let _i2935 = 0; _i2935 < _a2934.length; _i2935++) {
                                  const v_x = _a2934[_i2935];
                                  const _h2940 = clueAt(cl.number, v_x);
                                  let _c2942: boolean = (_h2939 && (_h2940 !== -1));
                                  if (_c2942) {
                                    const _t2941 = sp.adj4Edges[v_t_2926][_i2935];
                                    _c2942 = ((_t2941 === _wc2817 ? _wd2818 : (_rc.push(_t2941), (b.grid[_t2941] || -1))) === 1);
                                  }
                                  if (!(_c2942)) continue;
                                  if (!_g2912.includes(v_x)) _g2912.push(v_x);
                                }
                              }
                            }
                            const _a2943 = union(_g2907, _g2912);
                            for (let _i2944 = 0; _i2944 < _a2943.length; _i2944++) {
                              const v_p = _a2943[_i2944];
                              const _h2981 = clueAt(cl.number, v_p);
                              const _g2945: number[] = [];
                              G2946: {
                                for (let _i2948 = 0; _i2948 < 1; _i2948++) {
                                  const v_x = v_y;
                                  const _h2949 = clueAt(cl.number, v_x);
                                  if (!((_h2949 !== -1))) continue;
                                  _g2945.push(v_x);
                                }
                              }
                              const _g2950: number[] = [];
                              G2951: {
                                const _a2968 = throughWhere(sp, v_y, (_te2963: number): boolean => { let _c2965: boolean = ((_te2963 === _wc2817 ? _wd2818 : (_rc.push(_te2963), (b.grid[_te2963] || -1))) === 1); if (_c2965) {   const _t2964 = sp.edgeEnds[2 * _te2963];   _c2965 = !((clueAt(cl.number, _t2964) !== -1)); } let _c2967: boolean = _c2965; if (_c2967) {   const _t2966 = sp.edgeEnds[2 * _te2963 + 1];   _c2967 = !((clueAt(cl.number, _t2966) !== -1)); } return _c2967; });
                                for (let _i2969 = 0; _i2969 < _a2968.length; _i2969++) {
                                  const v_t = _a2968[_i2969];
                                  const _h2972 = clueAt(cl.number, v_t);
                                  const _h2973 = (_h2972 !== -1);
                                  const _h2974 = _h2973;
                                  const _h2975 = !(_h2974);
                                  const _a2970 = sp.adj4[v_t];
                                  for (let _i2971 = 0; _i2971 < _a2970.length; _i2971++) {
                                    const v_x = _a2970[_i2971];
                                    const _h2976 = clueAt(cl.number, v_x);
                                    let _c2978: boolean = (_h2975 && (_h2976 !== -1));
                                    if (_c2978) {
                                      const _t2977 = sp.adj4Edges[v_t][_i2971];
                                      _c2978 = ((_t2977 === _wc2817 ? _wd2818 : (_rc.push(_t2977), (b.grid[_t2977] || -1))) === 1);
                                    }
                                    if (!(_c2978)) continue;
                                    if (!_g2950.includes(v_x)) _g2950.push(v_x);
                                  }
                                }
                              }
                              const _a2979 = union(_g2945, _g2950);
                              for (let _i2980 = 0; _i2980 < _a2979.length; _i2980++) {
                                const v_q = _a2979[_i2980];
                                const _h2982 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h2981 - _h2982)) === cl.step))) {
                                  _q2905 = false;
                                  break Q2906;
                                }
                              }
                            }
                          }
                          _c2983 = _q2905;
                        }
                        if (!((_c2983 && (_h531 || !(throughWhere(sp, v_t, (_te2984: number): boolean => {  return ((_te2984 === _wc2817 ? _wd2818 : (_rc.push(_te2984), (b.grid[_te2984] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g2985 = 0;
                        G2986: {
                          const _a2987 = sp.adj4[v_t];
                          for (let _i2988 = 0; _i2988 < _a2987.length; _i2988++) {
                            const _t2989 = sp.adj4Edges[v_t][_i2988];
                            if (!(((_t2989 === _wc2817 ? _wd2818 : (_rc.push(_t2989), (b.grid[_t2989] || -1))) === 1))) continue;
                            _g2985++;
                          }
                        }
                        let _g2990 = 0;
                        G2991: {
                          for (let _i2992 = 0; _i2992 < 1; _i2992++) {
                            const v_k = v_t;
                            const _h2993 = clueAt(cl.number, v_k);
                            const _h3000 = (_h2993 + 1);
                            let _c3002: boolean = (_h2993 !== -1);
                            if (_c3002) {
                              let _c3001: boolean = (_h531 || (_h2993 === 1));
                              if (!_c3001) {
                                let _g2994 = 0;
                                G2995: {
                                  const _t2996 = (_h2993 + 1);
                                  const _a2997 = cluesValued(cl.number, _t2996);
                                  for (let _i2998 = 0; _i2998 < _a2997.length; _i2998++) {
                                    const v_x = _a2997[_i2998];
                                    const _h2999 = clueAt(cl.number, v_x);
                                    if (!((_h2999 === _h3000))) continue;
                                    _g2994++;
                                  }
                                }
                                _c3001 = (_g2994 === 0);
                              }
                              _c3002 = _c3001;
                            }
                            if (!(_c3002)) continue;
                            _g2990++;
                          }
                        }
                        let _c3127: boolean = ((_g2985 + 1) === (2 - _g2990));
                        if (!_c3127) {
                          let _q3003 = false;
                          Q3004: {
                            const _a3005 = sp.adj4[v_t];
                            const _n3006 = _i2864;
                            for (let _i3007 = 0; _i3007 < _n3006; _i3007++) {
                              const v_z = _a3005[_i3007];
                              const _t3008 = sp.adj4Edges[v_t][_i3007];
                              let _c3027: boolean = !((_t3008 === _wc2817 ? true : (_rc.push(_t3008), (b.grid[_t3008] !== 0))));
                              if (_c3027) {
                                let _g3009 = 0;
                                G3010: {
                                  const _a3011 = sp.adj4[v_t];
                                  for (let _i3012 = 0; _i3012 < _a3011.length; _i3012++) {
                                    const _t3013 = sp.adj4Edges[v_t][_i3012];
                                    if (!(((_t3013 === _wc2817 ? _wd2818 : (_rc.push(_t3013), (b.grid[_t3013] || -1))) === 1))) continue;
                                    _g3009++;
                                  }
                                }
                                let _g3014 = 0;
                                G3015: {
                                  for (let _i3016 = 0; _i3016 < 1; _i3016++) {
                                    const v_k = v_t;
                                    const _h3017 = clueAt(cl.number, v_k);
                                    const _h3024 = (_h3017 + 1);
                                    let _c3026: boolean = (_h3017 !== -1);
                                    if (_c3026) {
                                      let _c3025: boolean = (_h531 || (_h3017 === 1));
                                      if (!_c3025) {
                                        let _g3018 = 0;
                                        G3019: {
                                          const _t3020 = (_h3017 + 1);
                                          const _a3021 = cluesValued(cl.number, _t3020);
                                          for (let _i3022 = 0; _i3022 < _a3021.length; _i3022++) {
                                            const v_x = _a3021[_i3022];
                                            const _h3023 = clueAt(cl.number, v_x);
                                            if (!((_h3023 === _h3024))) continue;
                                            _g3018++;
                                          }
                                        }
                                        _c3025 = (_g3018 === 0);
                                      }
                                      _c3026 = _c3025;
                                    }
                                    if (!(_c3026)) continue;
                                    _g3014++;
                                  }
                                }
                                _c3027 = (_g3009 < (2 - _g3014));
                              }
                              let _c3046: boolean = _c3027;
                              if (_c3046) {
                                let _g3028 = 0;
                                G3029: {
                                  const _a3030 = sp.adj4[v_z];
                                  for (let _i3031 = 0; _i3031 < _a3030.length; _i3031++) {
                                    const _t3032 = sp.adj4Edges[v_z][_i3031];
                                    if (!(((_t3032 === _wc2817 ? _wd2818 : (_rc.push(_t3032), (b.grid[_t3032] || -1))) === 1))) continue;
                                    _g3028++;
                                  }
                                }
                                let _g3033 = 0;
                                G3034: {
                                  for (let _i3035 = 0; _i3035 < 1; _i3035++) {
                                    const v_k = v_z;
                                    const _h3036 = clueAt(cl.number, v_k);
                                    const _h3043 = (_h3036 + 1);
                                    let _c3045: boolean = (_h3036 !== -1);
                                    if (_c3045) {
                                      let _c3044: boolean = (_h531 || (_h3036 === 1));
                                      if (!_c3044) {
                                        let _g3037 = 0;
                                        G3038: {
                                          const _t3039 = (_h3036 + 1);
                                          const _a3040 = cluesValued(cl.number, _t3039);
                                          for (let _i3041 = 0; _i3041 < _a3040.length; _i3041++) {
                                            const v_x = _a3040[_i3041];
                                            const _h3042 = clueAt(cl.number, v_x);
                                            if (!((_h3042 === _h3043))) continue;
                                            _g3037++;
                                          }
                                        }
                                        _c3044 = (_g3037 === 0);
                                      }
                                      _c3045 = _c3044;
                                    }
                                    if (!(_c3045)) continue;
                                    _g3033++;
                                  }
                                }
                                _c3046 = (_g3028 < (2 - _g3033));
                              }
                              let _c3125: boolean = _c3046;
                              if (_c3125) {
                                let _q3047 = true;
                                Q3048: {
                                  const _g3049: number[] = [];
                                  G3050: {
                                    for (let _i3052 = 0; _i3052 < 1; _i3052++) {
                                      const v_x = v_t;
                                      const _h3053 = clueAt(cl.number, v_x);
                                      if (!((_h3053 !== -1))) continue;
                                      _g3049.push(v_x);
                                    }
                                  }
                                  const _g3054: number[] = [];
                                  G3055: {
                                    const _a3074 = throughWhere(sp, v_t, (_te3069: number): boolean => { let _c3071: boolean = ((_te3069 === _wc2817 ? _wd2818 : (_rc.push(_te3069), (b.grid[_te3069] || -1))) === 1); if (_c3071) {   const _t3070 = sp.edgeEnds[2 * _te3069];   _c3071 = !((clueAt(cl.number, _t3070) !== -1)); } let _c3073: boolean = _c3071; if (_c3073) {   const _t3072 = sp.edgeEnds[2 * _te3069 + 1];   _c3073 = !((clueAt(cl.number, _t3072) !== -1)); } return _c3073; });
                                    for (let _i3075 = 0; _i3075 < _a3074.length; _i3075++) {
                                      const v_t_3068 = _a3074[_i3075];
                                      const _h3078 = clueAt(cl.number, v_t_3068);
                                      const _h3079 = (_h3078 !== -1);
                                      const _h3080 = _h3079;
                                      const _h3081 = !(_h3080);
                                      const _a3076 = sp.adj4[v_t_3068];
                                      for (let _i3077 = 0; _i3077 < _a3076.length; _i3077++) {
                                        const v_x = _a3076[_i3077];
                                        const _h3082 = clueAt(cl.number, v_x);
                                        let _c3084: boolean = (_h3081 && (_h3082 !== -1));
                                        if (_c3084) {
                                          const _t3083 = sp.adj4Edges[v_t_3068][_i3077];
                                          _c3084 = ((_t3083 === _wc2817 ? _wd2818 : (_rc.push(_t3083), (b.grid[_t3083] || -1))) === 1);
                                        }
                                        if (!(_c3084)) continue;
                                        if (!_g3054.includes(v_x)) _g3054.push(v_x);
                                      }
                                    }
                                  }
                                  const _a3085 = union(_g3049, _g3054);
                                  for (let _i3086 = 0; _i3086 < _a3085.length; _i3086++) {
                                    const v_p = _a3085[_i3086];
                                    const _h3123 = clueAt(cl.number, v_p);
                                    const _g3087: number[] = [];
                                    G3088: {
                                      for (let _i3090 = 0; _i3090 < 1; _i3090++) {
                                        const v_x = v_z;
                                        const _h3091 = clueAt(cl.number, v_x);
                                        if (!((_h3091 !== -1))) continue;
                                        _g3087.push(v_x);
                                      }
                                    }
                                    const _g3092: number[] = [];
                                    G3093: {
                                      const _a3110 = throughWhere(sp, v_z, (_te3105: number): boolean => { let _c3107: boolean = ((_te3105 === _wc2817 ? _wd2818 : (_rc.push(_te3105), (b.grid[_te3105] || -1))) === 1); if (_c3107) {   const _t3106 = sp.edgeEnds[2 * _te3105];   _c3107 = !((clueAt(cl.number, _t3106) !== -1)); } let _c3109: boolean = _c3107; if (_c3109) {   const _t3108 = sp.edgeEnds[2 * _te3105 + 1];   _c3109 = !((clueAt(cl.number, _t3108) !== -1)); } return _c3109; });
                                      for (let _i3111 = 0; _i3111 < _a3110.length; _i3111++) {
                                        const v_t = _a3110[_i3111];
                                        const _h3114 = clueAt(cl.number, v_t);
                                        const _h3115 = (_h3114 !== -1);
                                        const _h3116 = _h3115;
                                        const _h3117 = !(_h3116);
                                        const _a3112 = sp.adj4[v_t];
                                        for (let _i3113 = 0; _i3113 < _a3112.length; _i3113++) {
                                          const v_x = _a3112[_i3113];
                                          const _h3118 = clueAt(cl.number, v_x);
                                          let _c3120: boolean = (_h3117 && (_h3118 !== -1));
                                          if (_c3120) {
                                            const _t3119 = sp.adj4Edges[v_t][_i3113];
                                            _c3120 = ((_t3119 === _wc2817 ? _wd2818 : (_rc.push(_t3119), (b.grid[_t3119] || -1))) === 1);
                                          }
                                          if (!(_c3120)) continue;
                                          if (!_g3092.includes(v_x)) _g3092.push(v_x);
                                        }
                                      }
                                    }
                                    const _a3121 = union(_g3087, _g3092);
                                    for (let _i3122 = 0; _i3122 < _a3121.length; _i3122++) {
                                      const v_q = _a3121[_i3122];
                                      const _h3124 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h3123 - _h3124)) === cl.step))) {
                                        _q3047 = false;
                                        break Q3048;
                                      }
                                    }
                                  }
                                }
                                _c3125 = _q3047;
                              }
                              if ((_c3125 && (_h531 || !(throughWhere(sp, v_t, (_te3126: number): boolean => {  return ((_te3126 === _wc2817 ? _wd2818 : (_rc.push(_te3126), (b.grid[_te3126] || -1))) === 1); }).includes(v_z))))) {
                                _q3003 = true;
                                break Q3004;
                              }
                            }
                          }
                          _c3127 = _q3003;
                        }
                        if (_c3127) {
                          _q2861 = true;
                          break Q2862;
                        }
                      }
                    }
                    _c3128 = !(_q2861);
                  }
                  let _c3415: boolean = _c3128;
                  if (!_c3415) {
                    let _q3129 = false;
                    Q3130: {
                      const _a3131 = sp.adj4[v_t];
                      for (let _i3132 = 0; _i3132 < _a3131.length; _i3132++) {
                        const v_s = _a3131[_i3132];
                        let _g3133 = 0;
                        G3134: {
                          const _a3135 = sp.adj4[v_s];
                          for (let _i3136 = 0; _i3136 < _a3135.length; _i3136++) {
                            const _t3137 = sp.adj4Edges[v_s][_i3136];
                            if (!(((_t3137 === _wc2817 ? _wd2818 : (_rc.push(_t3137), (b.grid[_t3137] || -1))) === 1))) continue;
                            _g3133++;
                          }
                        }
                        let _g3138 = 0;
                        G3139: {
                          for (let _i3140 = 0; _i3140 < 1; _i3140++) {
                            const v_k = v_s;
                            const _h3141 = clueAt(cl.number, v_k);
                            const _h3148 = (_h3141 + 1);
                            let _c3150: boolean = (_h3141 !== -1);
                            if (_c3150) {
                              let _c3149: boolean = (_h531 || (_h3141 === 1));
                              if (!_c3149) {
                                let _g3142 = 0;
                                G3143: {
                                  const _t3144 = (_h3141 + 1);
                                  const _a3145 = cluesValued(cl.number, _t3144);
                                  for (let _i3146 = 0; _i3146 < _a3145.length; _i3146++) {
                                    const v_x = _a3145[_i3146];
                                    const _h3147 = clueAt(cl.number, v_x);
                                    if (!((_h3147 === _h3148))) continue;
                                    _g3142++;
                                  }
                                }
                                _c3149 = (_g3142 === 0);
                              }
                              _c3150 = _c3149;
                            }
                            if (!(_c3150)) continue;
                            _g3138++;
                          }
                        }
                        let _c3414: boolean = (_g3133 < (2 - _g3138));
                        if (_c3414) {
                          let _q3151 = false;
                          Q3152: {
                            const _a3153 = sp.adj4[v_s];
                            for (let _i3154 = 0; _i3154 < _a3153.length; _i3154++) {
                              const v_y = _a3153[_i3154];
                              const _t3155 = sp.adj4Edges[v_s][_i3154];
                              let _c3174: boolean = !((_t3155 === _wc2817 ? true : (_rc.push(_t3155), (b.grid[_t3155] !== 0))));
                              if (_c3174) {
                                let _g3156 = 0;
                                G3157: {
                                  const _a3158 = sp.adj4[v_s];
                                  for (let _i3159 = 0; _i3159 < _a3158.length; _i3159++) {
                                    const _t3160 = sp.adj4Edges[v_s][_i3159];
                                    if (!(((_t3160 === _wc2817 ? _wd2818 : (_rc.push(_t3160), (b.grid[_t3160] || -1))) === 1))) continue;
                                    _g3156++;
                                  }
                                }
                                let _g3161 = 0;
                                G3162: {
                                  for (let _i3163 = 0; _i3163 < 1; _i3163++) {
                                    const v_k = v_s;
                                    const _h3164 = clueAt(cl.number, v_k);
                                    const _h3171 = (_h3164 + 1);
                                    let _c3173: boolean = (_h3164 !== -1);
                                    if (_c3173) {
                                      let _c3172: boolean = (_h531 || (_h3164 === 1));
                                      if (!_c3172) {
                                        let _g3165 = 0;
                                        G3166: {
                                          const _t3167 = (_h3164 + 1);
                                          const _a3168 = cluesValued(cl.number, _t3167);
                                          for (let _i3169 = 0; _i3169 < _a3168.length; _i3169++) {
                                            const v_x = _a3168[_i3169];
                                            const _h3170 = clueAt(cl.number, v_x);
                                            if (!((_h3170 === _h3171))) continue;
                                            _g3165++;
                                          }
                                        }
                                        _c3172 = (_g3165 === 0);
                                      }
                                      _c3173 = _c3172;
                                    }
                                    if (!(_c3173)) continue;
                                    _g3161++;
                                  }
                                }
                                _c3174 = (_g3156 < (2 - _g3161));
                              }
                              let _c3194: boolean = _c3174;
                              if (_c3194) {
                                let _g3175 = 0;
                                G3176: {
                                  const _a3178 = sp.adj4[v_y];
                                  for (let _i3179 = 0; _i3179 < _a3178.length; _i3179++) {
                                    const _t3180 = sp.adj4Edges[v_y][_i3179];
                                    if (!(((_t3180 === _wc2817 ? _wd2818 : (_rc.push(_t3180), (b.grid[_t3180] || -1))) === 1))) continue;
                                    _g3175++;
                                  }
                                }
                                let _g3181 = 0;
                                G3182: {
                                  for (let _i3183 = 0; _i3183 < 1; _i3183++) {
                                    const v_k = v_y;
                                    const _h3184 = clueAt(cl.number, v_k);
                                    const _h3191 = (_h3184 + 1);
                                    let _c3193: boolean = (_h3184 !== -1);
                                    if (_c3193) {
                                      let _c3192: boolean = (_h531 || (_h3184 === 1));
                                      if (!_c3192) {
                                        let _g3185 = 0;
                                        G3186: {
                                          const _t3187 = (_h3184 + 1);
                                          const _a3188 = cluesValued(cl.number, _t3187);
                                          for (let _i3189 = 0; _i3189 < _a3188.length; _i3189++) {
                                            const v_x = _a3188[_i3189];
                                            const _h3190 = clueAt(cl.number, v_x);
                                            if (!((_h3190 === _h3191))) continue;
                                            _g3185++;
                                          }
                                        }
                                        _c3192 = (_g3185 === 0);
                                      }
                                      _c3193 = _c3192;
                                    }
                                    if (!(_c3193)) continue;
                                    _g3181++;
                                  }
                                }
                                _c3194 = (_g3175 < (2 - _g3181));
                              }
                              let _c3271: boolean = _c3194;
                              if (_c3271) {
                                let _q3195 = true;
                                Q3196: {
                                  const _g3197: number[] = [];
                                  G3198: {
                                    for (let _i3200 = 0; _i3200 < 1; _i3200++) {
                                      const v_x = v_s;
                                      const _h3201 = clueAt(cl.number, v_x);
                                      if (!((_h3201 !== -1))) continue;
                                      _g3197.push(v_x);
                                    }
                                  }
                                  const _g3202: number[] = [];
                                  G3203: {
                                    const _a3220 = throughWhere(sp, v_s, (_te3215: number): boolean => { let _c3217: boolean = ((_te3215 === _wc2817 ? _wd2818 : (_rc.push(_te3215), (b.grid[_te3215] || -1))) === 1); if (_c3217) {   const _t3216 = sp.edgeEnds[2 * _te3215];   _c3217 = !((clueAt(cl.number, _t3216) !== -1)); } let _c3219: boolean = _c3217; if (_c3219) {   const _t3218 = sp.edgeEnds[2 * _te3215 + 1];   _c3219 = !((clueAt(cl.number, _t3218) !== -1)); } return _c3219; });
                                    for (let _i3221 = 0; _i3221 < _a3220.length; _i3221++) {
                                      const v_t = _a3220[_i3221];
                                      const _h3224 = clueAt(cl.number, v_t);
                                      const _h3225 = (_h3224 !== -1);
                                      const _h3226 = _h3225;
                                      const _h3227 = !(_h3226);
                                      const _a3222 = sp.adj4[v_t];
                                      for (let _i3223 = 0; _i3223 < _a3222.length; _i3223++) {
                                        const v_x = _a3222[_i3223];
                                        const _h3228 = clueAt(cl.number, v_x);
                                        let _c3230: boolean = (_h3227 && (_h3228 !== -1));
                                        if (_c3230) {
                                          const _t3229 = sp.adj4Edges[v_t][_i3223];
                                          _c3230 = ((_t3229 === _wc2817 ? _wd2818 : (_rc.push(_t3229), (b.grid[_t3229] || -1))) === 1);
                                        }
                                        if (!(_c3230)) continue;
                                        if (!_g3202.includes(v_x)) _g3202.push(v_x);
                                      }
                                    }
                                  }
                                  const _a3231 = union(_g3197, _g3202);
                                  for (let _i3232 = 0; _i3232 < _a3231.length; _i3232++) {
                                    const v_p = _a3231[_i3232];
                                    const _h3269 = clueAt(cl.number, v_p);
                                    const _g3233: number[] = [];
                                    G3234: {
                                      for (let _i3236 = 0; _i3236 < 1; _i3236++) {
                                        const v_x = v_y;
                                        const _h3237 = clueAt(cl.number, v_x);
                                        if (!((_h3237 !== -1))) continue;
                                        _g3233.push(v_x);
                                      }
                                    }
                                    const _g3238: number[] = [];
                                    G3239: {
                                      const _a3256 = throughWhere(sp, v_y, (_te3251: number): boolean => { let _c3253: boolean = ((_te3251 === _wc2817 ? _wd2818 : (_rc.push(_te3251), (b.grid[_te3251] || -1))) === 1); if (_c3253) {   const _t3252 = sp.edgeEnds[2 * _te3251];   _c3253 = !((clueAt(cl.number, _t3252) !== -1)); } let _c3255: boolean = _c3253; if (_c3255) {   const _t3254 = sp.edgeEnds[2 * _te3251 + 1];   _c3255 = !((clueAt(cl.number, _t3254) !== -1)); } return _c3255; });
                                      for (let _i3257 = 0; _i3257 < _a3256.length; _i3257++) {
                                        const v_t = _a3256[_i3257];
                                        const _h3260 = clueAt(cl.number, v_t);
                                        const _h3261 = (_h3260 !== -1);
                                        const _h3262 = _h3261;
                                        const _h3263 = !(_h3262);
                                        const _a3258 = sp.adj4[v_t];
                                        for (let _i3259 = 0; _i3259 < _a3258.length; _i3259++) {
                                          const v_x = _a3258[_i3259];
                                          const _h3264 = clueAt(cl.number, v_x);
                                          let _c3266: boolean = (_h3263 && (_h3264 !== -1));
                                          if (_c3266) {
                                            const _t3265 = sp.adj4Edges[v_t][_i3259];
                                            _c3266 = ((_t3265 === _wc2817 ? _wd2818 : (_rc.push(_t3265), (b.grid[_t3265] || -1))) === 1);
                                          }
                                          if (!(_c3266)) continue;
                                          if (!_g3238.includes(v_x)) _g3238.push(v_x);
                                        }
                                      }
                                    }
                                    const _a3267 = union(_g3233, _g3238);
                                    for (let _i3268 = 0; _i3268 < _a3267.length; _i3268++) {
                                      const v_q = _a3267[_i3268];
                                      const _h3270 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h3269 - _h3270)) === cl.step))) {
                                        _q3195 = false;
                                        break Q3196;
                                      }
                                    }
                                  }
                                }
                                _c3271 = _q3195;
                              }
                              if (!((_c3271 && (_h531 || !(throughWhere(sp, v_s, (_te3272: number): boolean => {  return ((_te3272 === _wc2817 ? _wd2818 : (_rc.push(_te3272), (b.grid[_te3272] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g3273 = 0;
                              G3274: {
                                const _a3275 = sp.adj4[v_s];
                                for (let _i3276 = 0; _i3276 < _a3275.length; _i3276++) {
                                  const _t3277 = sp.adj4Edges[v_s][_i3276];
                                  if (!(((_t3277 === _wc2817 ? _wd2818 : (_rc.push(_t3277), (b.grid[_t3277] || -1))) === 1))) continue;
                                  _g3273++;
                                }
                              }
                              let _g3278 = 0;
                              G3279: {
                                for (let _i3280 = 0; _i3280 < 1; _i3280++) {
                                  const v_k = v_s;
                                  const _h3281 = clueAt(cl.number, v_k);
                                  const _h3288 = (_h3281 + 1);
                                  let _c3290: boolean = (_h3281 !== -1);
                                  if (_c3290) {
                                    let _c3289: boolean = (_h531 || (_h3281 === 1));
                                    if (!_c3289) {
                                      let _g3282 = 0;
                                      G3283: {
                                        const _t3284 = (_h3281 + 1);
                                        const _a3285 = cluesValued(cl.number, _t3284);
                                        for (let _i3286 = 0; _i3286 < _a3285.length; _i3286++) {
                                          const v_x = _a3285[_i3286];
                                          const _h3287 = clueAt(cl.number, v_x);
                                          if (!((_h3287 === _h3288))) continue;
                                          _g3282++;
                                        }
                                      }
                                      _c3289 = (_g3282 === 0);
                                    }
                                    _c3290 = _c3289;
                                  }
                                  if (!(_c3290)) continue;
                                  _g3278++;
                                }
                              }
                              let _c3413: boolean = ((_g3273 + 1) === (2 - _g3278));
                              if (!_c3413) {
                                let _q3291 = false;
                                Q3292: {
                                  const _a3293 = sp.adj4[v_s];
                                  const _n3294 = _i3154;
                                  for (let _i3295 = 0; _i3295 < _n3294; _i3295++) {
                                    const v_z = _a3293[_i3295];
                                    const _t3296 = sp.adj4Edges[v_s][_i3295];
                                    let _c3315: boolean = !((_t3296 === _wc2817 ? true : (_rc.push(_t3296), (b.grid[_t3296] !== 0))));
                                    if (_c3315) {
                                      let _g3297 = 0;
                                      G3298: {
                                        const _a3299 = sp.adj4[v_s];
                                        for (let _i3300 = 0; _i3300 < _a3299.length; _i3300++) {
                                          const _t3301 = sp.adj4Edges[v_s][_i3300];
                                          if (!(((_t3301 === _wc2817 ? _wd2818 : (_rc.push(_t3301), (b.grid[_t3301] || -1))) === 1))) continue;
                                          _g3297++;
                                        }
                                      }
                                      let _g3302 = 0;
                                      G3303: {
                                        for (let _i3304 = 0; _i3304 < 1; _i3304++) {
                                          const v_k = v_s;
                                          const _h3305 = clueAt(cl.number, v_k);
                                          const _h3312 = (_h3305 + 1);
                                          let _c3314: boolean = (_h3305 !== -1);
                                          if (_c3314) {
                                            let _c3313: boolean = (_h531 || (_h3305 === 1));
                                            if (!_c3313) {
                                              let _g3306 = 0;
                                              G3307: {
                                                const _t3308 = (_h3305 + 1);
                                                const _a3309 = cluesValued(cl.number, _t3308);
                                                for (let _i3310 = 0; _i3310 < _a3309.length; _i3310++) {
                                                  const v_x = _a3309[_i3310];
                                                  const _h3311 = clueAt(cl.number, v_x);
                                                  if (!((_h3311 === _h3312))) continue;
                                                  _g3306++;
                                                }
                                              }
                                              _c3313 = (_g3306 === 0);
                                            }
                                            _c3314 = _c3313;
                                          }
                                          if (!(_c3314)) continue;
                                          _g3302++;
                                        }
                                      }
                                      _c3315 = (_g3297 < (2 - _g3302));
                                    }
                                    let _c3334: boolean = _c3315;
                                    if (_c3334) {
                                      let _g3316 = 0;
                                      G3317: {
                                        const _a3318 = sp.adj4[v_z];
                                        for (let _i3319 = 0; _i3319 < _a3318.length; _i3319++) {
                                          const _t3320 = sp.adj4Edges[v_z][_i3319];
                                          if (!(((_t3320 === _wc2817 ? _wd2818 : (_rc.push(_t3320), (b.grid[_t3320] || -1))) === 1))) continue;
                                          _g3316++;
                                        }
                                      }
                                      let _g3321 = 0;
                                      G3322: {
                                        for (let _i3323 = 0; _i3323 < 1; _i3323++) {
                                          const v_k = v_z;
                                          const _h3324 = clueAt(cl.number, v_k);
                                          const _h3331 = (_h3324 + 1);
                                          let _c3333: boolean = (_h3324 !== -1);
                                          if (_c3333) {
                                            let _c3332: boolean = (_h531 || (_h3324 === 1));
                                            if (!_c3332) {
                                              let _g3325 = 0;
                                              G3326: {
                                                const _t3327 = (_h3324 + 1);
                                                const _a3328 = cluesValued(cl.number, _t3327);
                                                for (let _i3329 = 0; _i3329 < _a3328.length; _i3329++) {
                                                  const v_x = _a3328[_i3329];
                                                  const _h3330 = clueAt(cl.number, v_x);
                                                  if (!((_h3330 === _h3331))) continue;
                                                  _g3325++;
                                                }
                                              }
                                              _c3332 = (_g3325 === 0);
                                            }
                                            _c3333 = _c3332;
                                          }
                                          if (!(_c3333)) continue;
                                          _g3321++;
                                        }
                                      }
                                      _c3334 = (_g3316 < (2 - _g3321));
                                    }
                                    let _c3411: boolean = _c3334;
                                    if (_c3411) {
                                      let _q3335 = true;
                                      Q3336: {
                                        const _g3337: number[] = [];
                                        G3338: {
                                          for (let _i3340 = 0; _i3340 < 1; _i3340++) {
                                            const v_x = v_s;
                                            const _h3341 = clueAt(cl.number, v_x);
                                            if (!((_h3341 !== -1))) continue;
                                            _g3337.push(v_x);
                                          }
                                        }
                                        const _g3342: number[] = [];
                                        G3343: {
                                          const _a3360 = throughWhere(sp, v_s, (_te3355: number): boolean => { let _c3357: boolean = ((_te3355 === _wc2817 ? _wd2818 : (_rc.push(_te3355), (b.grid[_te3355] || -1))) === 1); if (_c3357) {   const _t3356 = sp.edgeEnds[2 * _te3355];   _c3357 = !((clueAt(cl.number, _t3356) !== -1)); } let _c3359: boolean = _c3357; if (_c3359) {   const _t3358 = sp.edgeEnds[2 * _te3355 + 1];   _c3359 = !((clueAt(cl.number, _t3358) !== -1)); } return _c3359; });
                                          for (let _i3361 = 0; _i3361 < _a3360.length; _i3361++) {
                                            const v_t = _a3360[_i3361];
                                            const _h3364 = clueAt(cl.number, v_t);
                                            const _h3365 = (_h3364 !== -1);
                                            const _h3366 = _h3365;
                                            const _h3367 = !(_h3366);
                                            const _a3362 = sp.adj4[v_t];
                                            for (let _i3363 = 0; _i3363 < _a3362.length; _i3363++) {
                                              const v_x = _a3362[_i3363];
                                              const _h3368 = clueAt(cl.number, v_x);
                                              let _c3370: boolean = (_h3367 && (_h3368 !== -1));
                                              if (_c3370) {
                                                const _t3369 = sp.adj4Edges[v_t][_i3363];
                                                _c3370 = ((_t3369 === _wc2817 ? _wd2818 : (_rc.push(_t3369), (b.grid[_t3369] || -1))) === 1);
                                              }
                                              if (!(_c3370)) continue;
                                              if (!_g3342.includes(v_x)) _g3342.push(v_x);
                                            }
                                          }
                                        }
                                        const _a3371 = union(_g3337, _g3342);
                                        for (let _i3372 = 0; _i3372 < _a3371.length; _i3372++) {
                                          const v_p = _a3371[_i3372];
                                          const _h3409 = clueAt(cl.number, v_p);
                                          const _g3373: number[] = [];
                                          G3374: {
                                            for (let _i3376 = 0; _i3376 < 1; _i3376++) {
                                              const v_x = v_z;
                                              const _h3377 = clueAt(cl.number, v_x);
                                              if (!((_h3377 !== -1))) continue;
                                              _g3373.push(v_x);
                                            }
                                          }
                                          const _g3378: number[] = [];
                                          G3379: {
                                            const _a3396 = throughWhere(sp, v_z, (_te3391: number): boolean => { let _c3393: boolean = ((_te3391 === _wc2817 ? _wd2818 : (_rc.push(_te3391), (b.grid[_te3391] || -1))) === 1); if (_c3393) {   const _t3392 = sp.edgeEnds[2 * _te3391];   _c3393 = !((clueAt(cl.number, _t3392) !== -1)); } let _c3395: boolean = _c3393; if (_c3395) {   const _t3394 = sp.edgeEnds[2 * _te3391 + 1];   _c3395 = !((clueAt(cl.number, _t3394) !== -1)); } return _c3395; });
                                            for (let _i3397 = 0; _i3397 < _a3396.length; _i3397++) {
                                              const v_t = _a3396[_i3397];
                                              const _h3400 = clueAt(cl.number, v_t);
                                              const _h3401 = (_h3400 !== -1);
                                              const _h3402 = _h3401;
                                              const _h3403 = !(_h3402);
                                              const _a3398 = sp.adj4[v_t];
                                              for (let _i3399 = 0; _i3399 < _a3398.length; _i3399++) {
                                                const v_x = _a3398[_i3399];
                                                const _h3404 = clueAt(cl.number, v_x);
                                                let _c3406: boolean = (_h3403 && (_h3404 !== -1));
                                                if (_c3406) {
                                                  const _t3405 = sp.adj4Edges[v_t][_i3399];
                                                  _c3406 = ((_t3405 === _wc2817 ? _wd2818 : (_rc.push(_t3405), (b.grid[_t3405] || -1))) === 1);
                                                }
                                                if (!(_c3406)) continue;
                                                if (!_g3378.includes(v_x)) _g3378.push(v_x);
                                              }
                                            }
                                          }
                                          const _a3407 = union(_g3373, _g3378);
                                          for (let _i3408 = 0; _i3408 < _a3407.length; _i3408++) {
                                            const v_q = _a3407[_i3408];
                                            const _h3410 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h3409 - _h3410)) === cl.step))) {
                                              _q3335 = false;
                                              break Q3336;
                                            }
                                          }
                                        }
                                      }
                                      _c3411 = _q3335;
                                    }
                                    if ((_c3411 && (_h531 || !(throughWhere(sp, v_s, (_te3412: number): boolean => {  return ((_te3412 === _wc2817 ? _wd2818 : (_rc.push(_te3412), (b.grid[_te3412] || -1))) === 1); }).includes(v_z))))) {
                                      _q3291 = true;
                                      break Q3292;
                                    }
                                  }
                                }
                                _c3413 = _q3291;
                              }
                              if (_c3413) {
                                _q3151 = true;
                                break Q3152;
                              }
                            }
                          }
                          _c3414 = !(_q3151);
                        }
                        if (_c3414) {
                          _q3129 = true;
                          break Q3130;
                        }
                      }
                    }
                    _c3415 = _q3129;
                  }
                  if (_c3415) {
                    _q2819 = true;
                    break Q2820;
                  }
                }
              }
              _c3416 = _q2819;
            }
            _c3417 = _c3416;
          }
          const _r: Reads = { cells: [...new Set(_rc)], edges: [...new Set(_re)] };
          const _says = { terms: { e: v_e }, marks: {  }, witness: _w, reads: _r };
          if (!fire({ e: v_e, a: v_a, b: v_b }, facts, _says)) return 1;
        }
        cands.fill(-1);
        liveMarkedKept.clear();
        meetsMarkedKept.clear();
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface PairBreaksSays {
  terms: { c: number; i: number; j: number; };
  marks: {  };
  witness: Witness | null;
}

const pairBreaksFacts: number[] = [];
let pairBreaksCands = new Int32Array(0);
const pairBreaks_st648 = stamps();
const pairBreaks_st687 = stamps();
const pairBreaks_st794 = stamps();
const pairBreaks_st833 = stamps();
const pairBreaks_st945 = stamps();
const pairBreaks_st983 = stamps();
const pairBreaks_st1089 = stamps();
const pairBreaks_st1127 = stamps();

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding, PairBreaksSays> | null): number {
  const _g629: number[] = [];
  const _g634: number[] = [];
  const _g669: number[] = [];
  const _g674: number[] = [];
  const _g775: number[] = [];
  const _g780: number[] = [];
  const _g815: number[] = [];
  const _g820: number[] = [];
  const _g927: number[] = [];
  const _g932: number[] = [];
  const _g965: number[] = [];
  const _g970: number[] = [];
  const _g1071: number[] = [];
  const _g1076: number[] = [];
  const _g1109: number[] = [];
  const _g1114: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k521 = takesKept.board(cl);
  const _h554 = (cl.step === 0);
  if (pairBreaksCands.length < sp.edges.length) pairBreaksCands = new Int32Array(sp.edges.length);
  const cands = pairBreaksCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a519 = sp.cells;
  R1:
  for (let _i520 = 0; _i520 < _a519.length; _i520++) {
    const v_c = _a519[_i520];
    const _m2852_0 = b.made[0];
    let _g522 = 0;
    G523: {
      const _a524 = sp.adj4[v_c];
      for (let _i525 = 0; _i525 < _a524.length; _i525++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i525]] || -1) === 1))) continue;
        _g522++;
      }
    }
    if (!((((_k521[v_c] ?? takes(sp, cl, v_c)) - _g522) === 2))) continue;
    const _h532 = clueAt(cl.number, v_c);
    const _h533 = (_h532 !== -1);
    const _h534 = _h533;
    const _h535 = !(_h534);
    const _m2853_1 = b.made[1];
    L526: {
      const v_U = ways(b, sp, cl, v_c);
      const _h527 = v_U.length;
      if (!((_h527 === 3))) break L526;
      const _a528 = v_U;
      for (let _i529 = 0; _i529 < _a528.length; _i529++) {
        const v_k = _a528[_i529];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L530: {
          const v_j = (v_I[1] ?? -1);
          let _c1154: boolean = ((throughWhere(sp, v_i, (_te531: number): boolean => {  return ((b.grid[_te531] || -1) === 1); }).includes(v_j)) || (_h535 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
          if (!_c1154) {
            const _wc536 = sp.edgeOf(v_c, v_i);
            const _wd537 = 1;
            const _wc538 = sp.edgeOf(v_c, v_j);
            const _wd539 = 1;
            let _q540 = false;
            Q541: {
              const _a543 = throughWhere(sp, v_c, (_te542: number): boolean => {  return ((_te542 === _wc538 ? _wd539 : (_te542 === _wc536 ? _wd537 : (b.grid[_te542] || -1))) === 1); });
              for (let _i544 = 0; _i544 < _a543.length; _i544++) {
                const v_t = _a543[_i544];
                let _c564: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                if (!_c564) {
                  let _g545 = 0;
                  G546: {
                    const _a547 = sp.adj4[v_t];
                    for (let _i548 = 0; _i548 < _a547.length; _i548++) {
                      const _t549 = sp.adj4Edges[v_t][_i548];
                      if (!(((_t549 === _wc538 ? _wd539 : (_t549 === _wc536 ? _wd537 : (b.grid[_t549] || -1))) === 1))) continue;
                      _g545++;
                    }
                  }
                  let _g550 = 0;
                  G551: {
                    for (let _i552 = 0; _i552 < 1; _i552++) {
                      const v_k = v_t;
                      const _h553 = clueAt(cl.number, v_k);
                      const _h561 = (_h553 + 1);
                      let _c563: boolean = (_h553 !== -1);
                      if (_c563) {
                        let _c562: boolean = (_h554 || (_h553 === 1));
                        if (!_c562) {
                          let _g555 = 0;
                          G556: {
                            const _t557 = (_h553 + 1);
                            const _a558 = cluesValued(cl.number, _t557);
                            for (let _i559 = 0; _i559 < _a558.length; _i559++) {
                              const v_x = _a558[_i559];
                              const _h560 = clueAt(cl.number, v_x);
                              if (!((_h560 === _h561))) continue;
                              _g555++;
                            }
                          }
                          _c562 = (_g555 === 0);
                        }
                        _c563 = _c562;
                      }
                      if (!(_c563)) continue;
                      _g550++;
                    }
                  }
                  _c564 = (_g545 < (2 - _g550));
                }
                if (!(_c564)) continue;
                let _g565 = 0;
                G566: {
                  const _a567 = sp.adj4[v_t];
                  for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                    const _t569 = sp.adj4Edges[v_t][_i568];
                    if (!(((_t569 === _wc538 ? _wd539 : (_t569 === _wc536 ? _wd537 : (b.grid[_t569] || -1))) === 1))) continue;
                    _g565++;
                  }
                }
                let _g570 = 0;
                G571: {
                  for (let _i572 = 0; _i572 < 1; _i572++) {
                    const v_k = v_t;
                    const _h573 = clueAt(cl.number, v_k);
                    const _h580 = (_h573 + 1);
                    let _c582: boolean = (_h573 !== -1);
                    if (_c582) {
                      let _c581: boolean = (_h554 || (_h573 === 1));
                      if (!_c581) {
                        let _g574 = 0;
                        G575: {
                          const _t576 = (_h573 + 1);
                          const _a577 = cluesValued(cl.number, _t576);
                          for (let _i578 = 0; _i578 < _a577.length; _i578++) {
                            const v_x = _a577[_i578];
                            const _h579 = clueAt(cl.number, v_x);
                            if (!((_h579 === _h580))) continue;
                            _g574++;
                          }
                        }
                        _c581 = (_g574 === 0);
                      }
                      _c582 = _c581;
                    }
                    if (!(_c582)) continue;
                    _g570++;
                  }
                }
                let _c858: boolean = (_g565 < (2 - _g570));
                if (_c858) {
                  let _q583 = false;
                  Q584: {
                    const _a585 = sp.adj4[v_t];
                    for (let _i586 = 0; _i586 < _a585.length; _i586++) {
                      const v_y = _a585[_i586];
                      const _t587 = sp.adj4Edges[v_t][_i586];
                      let _c606: boolean = !((_t587 === _wc538 ? true : (_t587 === _wc536 ? true : (b.grid[_t587] !== 0))));
                      if (_c606) {
                        let _g588 = 0;
                        G589: {
                          const _a590 = sp.adj4[v_t];
                          for (let _i591 = 0; _i591 < _a590.length; _i591++) {
                            const _t592 = sp.adj4Edges[v_t][_i591];
                            if (!(((_t592 === _wc538 ? _wd539 : (_t592 === _wc536 ? _wd537 : (b.grid[_t592] || -1))) === 1))) continue;
                            _g588++;
                          }
                        }
                        let _g593 = 0;
                        G594: {
                          for (let _i595 = 0; _i595 < 1; _i595++) {
                            const v_k = v_t;
                            const _h596 = clueAt(cl.number, v_k);
                            const _h603 = (_h596 + 1);
                            let _c605: boolean = (_h596 !== -1);
                            if (_c605) {
                              let _c604: boolean = (_h554 || (_h596 === 1));
                              if (!_c604) {
                                let _g597 = 0;
                                G598: {
                                  const _t599 = (_h596 + 1);
                                  const _a600 = cluesValued(cl.number, _t599);
                                  for (let _i601 = 0; _i601 < _a600.length; _i601++) {
                                    const v_x = _a600[_i601];
                                    const _h602 = clueAt(cl.number, v_x);
                                    if (!((_h602 === _h603))) continue;
                                    _g597++;
                                  }
                                }
                                _c604 = (_g597 === 0);
                              }
                              _c605 = _c604;
                            }
                            if (!(_c605)) continue;
                            _g593++;
                          }
                        }
                        _c606 = (_g588 < (2 - _g593));
                      }
                      let _c626: boolean = _c606;
                      if (_c626) {
                        let _g607 = 0;
                        G608: {
                          const _a610 = sp.adj4[v_y];
                          for (let _i611 = 0; _i611 < _a610.length; _i611++) {
                            const _t612 = sp.adj4Edges[v_y][_i611];
                            if (!(((_t612 === _wc538 ? _wd539 : (_t612 === _wc536 ? _wd537 : (b.grid[_t612] || -1))) === 1))) continue;
                            _g607++;
                          }
                        }
                        let _g613 = 0;
                        G614: {
                          for (let _i615 = 0; _i615 < 1; _i615++) {
                            const v_k = v_y;
                            const _h616 = clueAt(cl.number, v_k);
                            const _h623 = (_h616 + 1);
                            let _c625: boolean = (_h616 !== -1);
                            if (_c625) {
                              let _c624: boolean = (_h554 || (_h616 === 1));
                              if (!_c624) {
                                let _g617 = 0;
                                G618: {
                                  const _t619 = (_h616 + 1);
                                  const _a620 = cluesValued(cl.number, _t619);
                                  for (let _i621 = 0; _i621 < _a620.length; _i621++) {
                                    const v_x = _a620[_i621];
                                    const _h622 = clueAt(cl.number, v_x);
                                    if (!((_h622 === _h623))) continue;
                                    _g617++;
                                  }
                                }
                                _c624 = (_g617 === 0);
                              }
                              _c625 = _c624;
                            }
                            if (!(_c625)) continue;
                            _g613++;
                          }
                        }
                        _c626 = (_g607 < (2 - _g613));
                      }
                      let _c709: boolean = _c626;
                      if (_c709) {
                        let _q627 = true;
                        Q628: {
                          _g629.length = 0;
                          G630: {
                            for (let _i632 = 0; _i632 < 1; _i632++) {
                              const v_x = v_t;
                              const _h633 = clueAt(cl.number, v_x);
                              if (!((_h633 !== -1))) continue;
                              _g629.push(v_x);
                            }
                          }
                          _g634.length = 0;
                          pairBreaks_st648.pass++;
                          G635: {
                            const _a655 = throughWhere(sp, v_t, (_te650: number): boolean => { let _c652: boolean = ((_te650 === _wc538 ? _wd539 : (_te650 === _wc536 ? _wd537 : (b.grid[_te650] || -1))) === 1); if (_c652) {   const _t651 = sp.edgeEnds[2 * _te650];   _c652 = !((clueAt(cl.number, _t651) !== -1)); } let _c654: boolean = _c652; if (_c654) {   const _t653 = sp.edgeEnds[2 * _te650 + 1];   _c654 = !((clueAt(cl.number, _t653) !== -1)); } return _c654; });
                            for (let _i656 = 0; _i656 < _a655.length; _i656++) {
                              const v_t_649 = _a655[_i656];
                              const _h659 = clueAt(cl.number, v_t_649);
                              const _h660 = (_h659 !== -1);
                              const _h661 = _h660;
                              const _h662 = !(_h661);
                              const _a657 = sp.adj4[v_t_649];
                              for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                                const v_x = _a657[_i658];
                                const _h663 = clueAt(cl.number, v_x);
                                let _c665: boolean = (_h662 && (_h663 !== -1));
                                if (_c665) {
                                  const _t664 = sp.adj4Edges[v_t_649][_i658];
                                  _c665 = ((_t664 === _wc538 ? _wd539 : (_t664 === _wc536 ? _wd537 : (b.grid[_t664] || -1))) === 1);
                                }
                                if (!(_c665)) continue;
                                const _t666 = v_x;
                                if (_g634.length < 16) { if (!_g634.includes(_t666)) _g634.push(_t666); } else addOnce(_g634, pairBreaks_st648, _t666);
                              }
                            }
                          }
                          const _a667 = union(_g629, _g634);
                          for (let _i668 = 0; _i668 < _a667.length; _i668++) {
                            const v_p = _a667[_i668];
                            const _h707 = clueAt(cl.number, v_p);
                            _g669.length = 0;
                            G670: {
                              for (let _i672 = 0; _i672 < 1; _i672++) {
                                const v_x = v_y;
                                const _h673 = clueAt(cl.number, v_x);
                                if (!((_h673 !== -1))) continue;
                                _g669.push(v_x);
                              }
                            }
                            _g674.length = 0;
                            pairBreaks_st687.pass++;
                            G675: {
                              const _a693 = throughWhere(sp, v_y, (_te688: number): boolean => { let _c690: boolean = ((_te688 === _wc538 ? _wd539 : (_te688 === _wc536 ? _wd537 : (b.grid[_te688] || -1))) === 1); if (_c690) {   const _t689 = sp.edgeEnds[2 * _te688];   _c690 = !((clueAt(cl.number, _t689) !== -1)); } let _c692: boolean = _c690; if (_c692) {   const _t691 = sp.edgeEnds[2 * _te688 + 1];   _c692 = !((clueAt(cl.number, _t691) !== -1)); } return _c692; });
                              for (let _i694 = 0; _i694 < _a693.length; _i694++) {
                                const v_t = _a693[_i694];
                                const _h697 = clueAt(cl.number, v_t);
                                const _h698 = (_h697 !== -1);
                                const _h699 = _h698;
                                const _h700 = !(_h699);
                                const _a695 = sp.adj4[v_t];
                                for (let _i696 = 0; _i696 < _a695.length; _i696++) {
                                  const v_x = _a695[_i696];
                                  const _h701 = clueAt(cl.number, v_x);
                                  let _c703: boolean = (_h700 && (_h701 !== -1));
                                  if (_c703) {
                                    const _t702 = sp.adj4Edges[v_t][_i696];
                                    _c703 = ((_t702 === _wc538 ? _wd539 : (_t702 === _wc536 ? _wd537 : (b.grid[_t702] || -1))) === 1);
                                  }
                                  if (!(_c703)) continue;
                                  const _t704 = v_x;
                                  if (_g674.length < 16) { if (!_g674.includes(_t704)) _g674.push(_t704); } else addOnce(_g674, pairBreaks_st687, _t704);
                                }
                              }
                            }
                            const _a705 = union(_g669, _g674);
                            for (let _i706 = 0; _i706 < _a705.length; _i706++) {
                              const v_q = _a705[_i706];
                              const _h708 = clueAt(cl.number, v_q);
                              if (!((Math.abs((_h707 - _h708)) === cl.step))) {
                                _q627 = false;
                                break Q628;
                              }
                            }
                          }
                        }
                        _c709 = _q627;
                      }
                      if (!((_c709 && (_h554 || !(throughWhere(sp, v_t, (_te710: number): boolean => {  return ((_te710 === _wc538 ? _wd539 : (_te710 === _wc536 ? _wd537 : (b.grid[_te710] || -1))) === 1); }).includes(v_y)))))) continue;
                      let _g711 = 0;
                      G712: {
                        const _a713 = sp.adj4[v_t];
                        for (let _i714 = 0; _i714 < _a713.length; _i714++) {
                          const _t715 = sp.adj4Edges[v_t][_i714];
                          if (!(((_t715 === _wc538 ? _wd539 : (_t715 === _wc536 ? _wd537 : (b.grid[_t715] || -1))) === 1))) continue;
                          _g711++;
                        }
                      }
                      let _g716 = 0;
                      G717: {
                        for (let _i718 = 0; _i718 < 1; _i718++) {
                          const v_k = v_t;
                          const _h719 = clueAt(cl.number, v_k);
                          const _h726 = (_h719 + 1);
                          let _c728: boolean = (_h719 !== -1);
                          if (_c728) {
                            let _c727: boolean = (_h554 || (_h719 === 1));
                            if (!_c727) {
                              let _g720 = 0;
                              G721: {
                                const _t722 = (_h719 + 1);
                                const _a723 = cluesValued(cl.number, _t722);
                                for (let _i724 = 0; _i724 < _a723.length; _i724++) {
                                  const v_x = _a723[_i724];
                                  const _h725 = clueAt(cl.number, v_x);
                                  if (!((_h725 === _h726))) continue;
                                  _g720++;
                                }
                              }
                              _c727 = (_g720 === 0);
                            }
                            _c728 = _c727;
                          }
                          if (!(_c728)) continue;
                          _g716++;
                        }
                      }
                      let _c857: boolean = ((_g711 + 1) === (2 - _g716));
                      if (!_c857) {
                        let _q729 = false;
                        Q730: {
                          const _a731 = sp.adj4[v_t];
                          const _n732 = _i586;
                          for (let _i733 = 0; _i733 < _n732; _i733++) {
                            const v_z = _a731[_i733];
                            const _t734 = sp.adj4Edges[v_t][_i733];
                            let _c753: boolean = !((_t734 === _wc538 ? true : (_t734 === _wc536 ? true : (b.grid[_t734] !== 0))));
                            if (_c753) {
                              let _g735 = 0;
                              G736: {
                                const _a737 = sp.adj4[v_t];
                                for (let _i738 = 0; _i738 < _a737.length; _i738++) {
                                  const _t739 = sp.adj4Edges[v_t][_i738];
                                  if (!(((_t739 === _wc538 ? _wd539 : (_t739 === _wc536 ? _wd537 : (b.grid[_t739] || -1))) === 1))) continue;
                                  _g735++;
                                }
                              }
                              let _g740 = 0;
                              G741: {
                                for (let _i742 = 0; _i742 < 1; _i742++) {
                                  const v_k = v_t;
                                  const _h743 = clueAt(cl.number, v_k);
                                  const _h750 = (_h743 + 1);
                                  let _c752: boolean = (_h743 !== -1);
                                  if (_c752) {
                                    let _c751: boolean = (_h554 || (_h743 === 1));
                                    if (!_c751) {
                                      let _g744 = 0;
                                      G745: {
                                        const _t746 = (_h743 + 1);
                                        const _a747 = cluesValued(cl.number, _t746);
                                        for (let _i748 = 0; _i748 < _a747.length; _i748++) {
                                          const v_x = _a747[_i748];
                                          const _h749 = clueAt(cl.number, v_x);
                                          if (!((_h749 === _h750))) continue;
                                          _g744++;
                                        }
                                      }
                                      _c751 = (_g744 === 0);
                                    }
                                    _c752 = _c751;
                                  }
                                  if (!(_c752)) continue;
                                  _g740++;
                                }
                              }
                              _c753 = (_g735 < (2 - _g740));
                            }
                            let _c772: boolean = _c753;
                            if (_c772) {
                              let _g754 = 0;
                              G755: {
                                const _a756 = sp.adj4[v_z];
                                for (let _i757 = 0; _i757 < _a756.length; _i757++) {
                                  const _t758 = sp.adj4Edges[v_z][_i757];
                                  if (!(((_t758 === _wc538 ? _wd539 : (_t758 === _wc536 ? _wd537 : (b.grid[_t758] || -1))) === 1))) continue;
                                  _g754++;
                                }
                              }
                              let _g759 = 0;
                              G760: {
                                for (let _i761 = 0; _i761 < 1; _i761++) {
                                  const v_k = v_z;
                                  const _h762 = clueAt(cl.number, v_k);
                                  const _h769 = (_h762 + 1);
                                  let _c771: boolean = (_h762 !== -1);
                                  if (_c771) {
                                    let _c770: boolean = (_h554 || (_h762 === 1));
                                    if (!_c770) {
                                      let _g763 = 0;
                                      G764: {
                                        const _t765 = (_h762 + 1);
                                        const _a766 = cluesValued(cl.number, _t765);
                                        for (let _i767 = 0; _i767 < _a766.length; _i767++) {
                                          const v_x = _a766[_i767];
                                          const _h768 = clueAt(cl.number, v_x);
                                          if (!((_h768 === _h769))) continue;
                                          _g763++;
                                        }
                                      }
                                      _c770 = (_g763 === 0);
                                    }
                                    _c771 = _c770;
                                  }
                                  if (!(_c771)) continue;
                                  _g759++;
                                }
                              }
                              _c772 = (_g754 < (2 - _g759));
                            }
                            let _c855: boolean = _c772;
                            if (_c855) {
                              let _q773 = true;
                              Q774: {
                                _g775.length = 0;
                                G776: {
                                  for (let _i778 = 0; _i778 < 1; _i778++) {
                                    const v_x = v_t;
                                    const _h779 = clueAt(cl.number, v_x);
                                    if (!((_h779 !== -1))) continue;
                                    _g775.push(v_x);
                                  }
                                }
                                _g780.length = 0;
                                pairBreaks_st794.pass++;
                                G781: {
                                  const _a801 = throughWhere(sp, v_t, (_te796: number): boolean => { let _c798: boolean = ((_te796 === _wc538 ? _wd539 : (_te796 === _wc536 ? _wd537 : (b.grid[_te796] || -1))) === 1); if (_c798) {   const _t797 = sp.edgeEnds[2 * _te796];   _c798 = !((clueAt(cl.number, _t797) !== -1)); } let _c800: boolean = _c798; if (_c800) {   const _t799 = sp.edgeEnds[2 * _te796 + 1];   _c800 = !((clueAt(cl.number, _t799) !== -1)); } return _c800; });
                                  for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                                    const v_t_795 = _a801[_i802];
                                    const _h805 = clueAt(cl.number, v_t_795);
                                    const _h806 = (_h805 !== -1);
                                    const _h807 = _h806;
                                    const _h808 = !(_h807);
                                    const _a803 = sp.adj4[v_t_795];
                                    for (let _i804 = 0; _i804 < _a803.length; _i804++) {
                                      const v_x = _a803[_i804];
                                      const _h809 = clueAt(cl.number, v_x);
                                      let _c811: boolean = (_h808 && (_h809 !== -1));
                                      if (_c811) {
                                        const _t810 = sp.adj4Edges[v_t_795][_i804];
                                        _c811 = ((_t810 === _wc538 ? _wd539 : (_t810 === _wc536 ? _wd537 : (b.grid[_t810] || -1))) === 1);
                                      }
                                      if (!(_c811)) continue;
                                      const _t812 = v_x;
                                      if (_g780.length < 16) { if (!_g780.includes(_t812)) _g780.push(_t812); } else addOnce(_g780, pairBreaks_st794, _t812);
                                    }
                                  }
                                }
                                const _a813 = union(_g775, _g780);
                                for (let _i814 = 0; _i814 < _a813.length; _i814++) {
                                  const v_p = _a813[_i814];
                                  const _h853 = clueAt(cl.number, v_p);
                                  _g815.length = 0;
                                  G816: {
                                    for (let _i818 = 0; _i818 < 1; _i818++) {
                                      const v_x = v_z;
                                      const _h819 = clueAt(cl.number, v_x);
                                      if (!((_h819 !== -1))) continue;
                                      _g815.push(v_x);
                                    }
                                  }
                                  _g820.length = 0;
                                  pairBreaks_st833.pass++;
                                  G821: {
                                    const _a839 = throughWhere(sp, v_z, (_te834: number): boolean => { let _c836: boolean = ((_te834 === _wc538 ? _wd539 : (_te834 === _wc536 ? _wd537 : (b.grid[_te834] || -1))) === 1); if (_c836) {   const _t835 = sp.edgeEnds[2 * _te834];   _c836 = !((clueAt(cl.number, _t835) !== -1)); } let _c838: boolean = _c836; if (_c838) {   const _t837 = sp.edgeEnds[2 * _te834 + 1];   _c838 = !((clueAt(cl.number, _t837) !== -1)); } return _c838; });
                                    for (let _i840 = 0; _i840 < _a839.length; _i840++) {
                                      const v_t = _a839[_i840];
                                      const _h843 = clueAt(cl.number, v_t);
                                      const _h844 = (_h843 !== -1);
                                      const _h845 = _h844;
                                      const _h846 = !(_h845);
                                      const _a841 = sp.adj4[v_t];
                                      for (let _i842 = 0; _i842 < _a841.length; _i842++) {
                                        const v_x = _a841[_i842];
                                        const _h847 = clueAt(cl.number, v_x);
                                        let _c849: boolean = (_h846 && (_h847 !== -1));
                                        if (_c849) {
                                          const _t848 = sp.adj4Edges[v_t][_i842];
                                          _c849 = ((_t848 === _wc538 ? _wd539 : (_t848 === _wc536 ? _wd537 : (b.grid[_t848] || -1))) === 1);
                                        }
                                        if (!(_c849)) continue;
                                        const _t850 = v_x;
                                        if (_g820.length < 16) { if (!_g820.includes(_t850)) _g820.push(_t850); } else addOnce(_g820, pairBreaks_st833, _t850);
                                      }
                                    }
                                  }
                                  const _a851 = union(_g815, _g820);
                                  for (let _i852 = 0; _i852 < _a851.length; _i852++) {
                                    const v_q = _a851[_i852];
                                    const _h854 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h853 - _h854)) === cl.step))) {
                                      _q773 = false;
                                      break Q774;
                                    }
                                  }
                                }
                              }
                              _c855 = _q773;
                            }
                            if ((_c855 && (_h554 || !(throughWhere(sp, v_t, (_te856: number): boolean => {  return ((_te856 === _wc538 ? _wd539 : (_te856 === _wc536 ? _wd537 : (b.grid[_te856] || -1))) === 1); }).includes(v_z))))) {
                              _q729 = true;
                              break Q730;
                            }
                          }
                        }
                        _c857 = _q729;
                      }
                      if (_c857) {
                        _q583 = true;
                        break Q584;
                      }
                    }
                  }
                  _c858 = !(_q583);
                }
                let _c1153: boolean = _c858;
                if (!_c1153) {
                  let _q859 = false;
                  Q860: {
                    const _a861 = sp.adj4[v_t];
                    for (let _i862 = 0; _i862 < _a861.length; _i862++) {
                      const v_s = _a861[_i862];
                      let _g863 = 0;
                      G864: {
                        const _a865 = sp.adj4[v_s];
                        for (let _i866 = 0; _i866 < _a865.length; _i866++) {
                          const _t867 = sp.adj4Edges[v_s][_i866];
                          if (!(((_t867 === _wc538 ? _wd539 : (_t867 === _wc536 ? _wd537 : (b.grid[_t867] || -1))) === 1))) continue;
                          _g863++;
                        }
                      }
                      let _g868 = 0;
                      G869: {
                        for (let _i870 = 0; _i870 < 1; _i870++) {
                          const v_k = v_s;
                          const _h871 = clueAt(cl.number, v_k);
                          const _h878 = (_h871 + 1);
                          let _c880: boolean = (_h871 !== -1);
                          if (_c880) {
                            let _c879: boolean = (_h554 || (_h871 === 1));
                            if (!_c879) {
                              let _g872 = 0;
                              G873: {
                                const _t874 = (_h871 + 1);
                                const _a875 = cluesValued(cl.number, _t874);
                                for (let _i876 = 0; _i876 < _a875.length; _i876++) {
                                  const v_x = _a875[_i876];
                                  const _h877 = clueAt(cl.number, v_x);
                                  if (!((_h877 === _h878))) continue;
                                  _g872++;
                                }
                              }
                              _c879 = (_g872 === 0);
                            }
                            _c880 = _c879;
                          }
                          if (!(_c880)) continue;
                          _g868++;
                        }
                      }
                      let _c1152: boolean = (_g863 < (2 - _g868));
                      if (_c1152) {
                        let _q881 = false;
                        Q882: {
                          const _a883 = sp.adj4[v_s];
                          for (let _i884 = 0; _i884 < _a883.length; _i884++) {
                            const v_y = _a883[_i884];
                            const _t885 = sp.adj4Edges[v_s][_i884];
                            let _c904: boolean = !((_t885 === _wc538 ? true : (_t885 === _wc536 ? true : (b.grid[_t885] !== 0))));
                            if (_c904) {
                              let _g886 = 0;
                              G887: {
                                const _a888 = sp.adj4[v_s];
                                for (let _i889 = 0; _i889 < _a888.length; _i889++) {
                                  const _t890 = sp.adj4Edges[v_s][_i889];
                                  if (!(((_t890 === _wc538 ? _wd539 : (_t890 === _wc536 ? _wd537 : (b.grid[_t890] || -1))) === 1))) continue;
                                  _g886++;
                                }
                              }
                              let _g891 = 0;
                              G892: {
                                for (let _i893 = 0; _i893 < 1; _i893++) {
                                  const v_k = v_s;
                                  const _h894 = clueAt(cl.number, v_k);
                                  const _h901 = (_h894 + 1);
                                  let _c903: boolean = (_h894 !== -1);
                                  if (_c903) {
                                    let _c902: boolean = (_h554 || (_h894 === 1));
                                    if (!_c902) {
                                      let _g895 = 0;
                                      G896: {
                                        const _t897 = (_h894 + 1);
                                        const _a898 = cluesValued(cl.number, _t897);
                                        for (let _i899 = 0; _i899 < _a898.length; _i899++) {
                                          const v_x = _a898[_i899];
                                          const _h900 = clueAt(cl.number, v_x);
                                          if (!((_h900 === _h901))) continue;
                                          _g895++;
                                        }
                                      }
                                      _c902 = (_g895 === 0);
                                    }
                                    _c903 = _c902;
                                  }
                                  if (!(_c903)) continue;
                                  _g891++;
                                }
                              }
                              _c904 = (_g886 < (2 - _g891));
                            }
                            let _c924: boolean = _c904;
                            if (_c924) {
                              let _g905 = 0;
                              G906: {
                                const _a908 = sp.adj4[v_y];
                                for (let _i909 = 0; _i909 < _a908.length; _i909++) {
                                  const _t910 = sp.adj4Edges[v_y][_i909];
                                  if (!(((_t910 === _wc538 ? _wd539 : (_t910 === _wc536 ? _wd537 : (b.grid[_t910] || -1))) === 1))) continue;
                                  _g905++;
                                }
                              }
                              let _g911 = 0;
                              G912: {
                                for (let _i913 = 0; _i913 < 1; _i913++) {
                                  const v_k = v_y;
                                  const _h914 = clueAt(cl.number, v_k);
                                  const _h921 = (_h914 + 1);
                                  let _c923: boolean = (_h914 !== -1);
                                  if (_c923) {
                                    let _c922: boolean = (_h554 || (_h914 === 1));
                                    if (!_c922) {
                                      let _g915 = 0;
                                      G916: {
                                        const _t917 = (_h914 + 1);
                                        const _a918 = cluesValued(cl.number, _t917);
                                        for (let _i919 = 0; _i919 < _a918.length; _i919++) {
                                          const v_x = _a918[_i919];
                                          const _h920 = clueAt(cl.number, v_x);
                                          if (!((_h920 === _h921))) continue;
                                          _g915++;
                                        }
                                      }
                                      _c922 = (_g915 === 0);
                                    }
                                    _c923 = _c922;
                                  }
                                  if (!(_c923)) continue;
                                  _g911++;
                                }
                              }
                              _c924 = (_g905 < (2 - _g911));
                            }
                            let _c1005: boolean = _c924;
                            if (_c1005) {
                              let _q925 = true;
                              Q926: {
                                _g927.length = 0;
                                G928: {
                                  for (let _i930 = 0; _i930 < 1; _i930++) {
                                    const v_x = v_s;
                                    const _h931 = clueAt(cl.number, v_x);
                                    if (!((_h931 !== -1))) continue;
                                    _g927.push(v_x);
                                  }
                                }
                                _g932.length = 0;
                                pairBreaks_st945.pass++;
                                G933: {
                                  const _a951 = throughWhere(sp, v_s, (_te946: number): boolean => { let _c948: boolean = ((_te946 === _wc538 ? _wd539 : (_te946 === _wc536 ? _wd537 : (b.grid[_te946] || -1))) === 1); if (_c948) {   const _t947 = sp.edgeEnds[2 * _te946];   _c948 = !((clueAt(cl.number, _t947) !== -1)); } let _c950: boolean = _c948; if (_c950) {   const _t949 = sp.edgeEnds[2 * _te946 + 1];   _c950 = !((clueAt(cl.number, _t949) !== -1)); } return _c950; });
                                  for (let _i952 = 0; _i952 < _a951.length; _i952++) {
                                    const v_t = _a951[_i952];
                                    const _h955 = clueAt(cl.number, v_t);
                                    const _h956 = (_h955 !== -1);
                                    const _h957 = _h956;
                                    const _h958 = !(_h957);
                                    const _a953 = sp.adj4[v_t];
                                    for (let _i954 = 0; _i954 < _a953.length; _i954++) {
                                      const v_x = _a953[_i954];
                                      const _h959 = clueAt(cl.number, v_x);
                                      let _c961: boolean = (_h958 && (_h959 !== -1));
                                      if (_c961) {
                                        const _t960 = sp.adj4Edges[v_t][_i954];
                                        _c961 = ((_t960 === _wc538 ? _wd539 : (_t960 === _wc536 ? _wd537 : (b.grid[_t960] || -1))) === 1);
                                      }
                                      if (!(_c961)) continue;
                                      const _t962 = v_x;
                                      if (_g932.length < 16) { if (!_g932.includes(_t962)) _g932.push(_t962); } else addOnce(_g932, pairBreaks_st945, _t962);
                                    }
                                  }
                                }
                                const _a963 = union(_g927, _g932);
                                for (let _i964 = 0; _i964 < _a963.length; _i964++) {
                                  const v_p = _a963[_i964];
                                  const _h1003 = clueAt(cl.number, v_p);
                                  _g965.length = 0;
                                  G966: {
                                    for (let _i968 = 0; _i968 < 1; _i968++) {
                                      const v_x = v_y;
                                      const _h969 = clueAt(cl.number, v_x);
                                      if (!((_h969 !== -1))) continue;
                                      _g965.push(v_x);
                                    }
                                  }
                                  _g970.length = 0;
                                  pairBreaks_st983.pass++;
                                  G971: {
                                    const _a989 = throughWhere(sp, v_y, (_te984: number): boolean => { let _c986: boolean = ((_te984 === _wc538 ? _wd539 : (_te984 === _wc536 ? _wd537 : (b.grid[_te984] || -1))) === 1); if (_c986) {   const _t985 = sp.edgeEnds[2 * _te984];   _c986 = !((clueAt(cl.number, _t985) !== -1)); } let _c988: boolean = _c986; if (_c988) {   const _t987 = sp.edgeEnds[2 * _te984 + 1];   _c988 = !((clueAt(cl.number, _t987) !== -1)); } return _c988; });
                                    for (let _i990 = 0; _i990 < _a989.length; _i990++) {
                                      const v_t = _a989[_i990];
                                      const _h993 = clueAt(cl.number, v_t);
                                      const _h994 = (_h993 !== -1);
                                      const _h995 = _h994;
                                      const _h996 = !(_h995);
                                      const _a991 = sp.adj4[v_t];
                                      for (let _i992 = 0; _i992 < _a991.length; _i992++) {
                                        const v_x = _a991[_i992];
                                        const _h997 = clueAt(cl.number, v_x);
                                        let _c999: boolean = (_h996 && (_h997 !== -1));
                                        if (_c999) {
                                          const _t998 = sp.adj4Edges[v_t][_i992];
                                          _c999 = ((_t998 === _wc538 ? _wd539 : (_t998 === _wc536 ? _wd537 : (b.grid[_t998] || -1))) === 1);
                                        }
                                        if (!(_c999)) continue;
                                        const _t1000 = v_x;
                                        if (_g970.length < 16) { if (!_g970.includes(_t1000)) _g970.push(_t1000); } else addOnce(_g970, pairBreaks_st983, _t1000);
                                      }
                                    }
                                  }
                                  const _a1001 = union(_g965, _g970);
                                  for (let _i1002 = 0; _i1002 < _a1001.length; _i1002++) {
                                    const v_q = _a1001[_i1002];
                                    const _h1004 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h1003 - _h1004)) === cl.step))) {
                                      _q925 = false;
                                      break Q926;
                                    }
                                  }
                                }
                              }
                              _c1005 = _q925;
                            }
                            if (!((_c1005 && (_h554 || !(throughWhere(sp, v_s, (_te1006: number): boolean => {  return ((_te1006 === _wc538 ? _wd539 : (_te1006 === _wc536 ? _wd537 : (b.grid[_te1006] || -1))) === 1); }).includes(v_y)))))) continue;
                            let _g1007 = 0;
                            G1008: {
                              const _a1009 = sp.adj4[v_s];
                              for (let _i1010 = 0; _i1010 < _a1009.length; _i1010++) {
                                const _t1011 = sp.adj4Edges[v_s][_i1010];
                                if (!(((_t1011 === _wc538 ? _wd539 : (_t1011 === _wc536 ? _wd537 : (b.grid[_t1011] || -1))) === 1))) continue;
                                _g1007++;
                              }
                            }
                            let _g1012 = 0;
                            G1013: {
                              for (let _i1014 = 0; _i1014 < 1; _i1014++) {
                                const v_k = v_s;
                                const _h1015 = clueAt(cl.number, v_k);
                                const _h1022 = (_h1015 + 1);
                                let _c1024: boolean = (_h1015 !== -1);
                                if (_c1024) {
                                  let _c1023: boolean = (_h554 || (_h1015 === 1));
                                  if (!_c1023) {
                                    let _g1016 = 0;
                                    G1017: {
                                      const _t1018 = (_h1015 + 1);
                                      const _a1019 = cluesValued(cl.number, _t1018);
                                      for (let _i1020 = 0; _i1020 < _a1019.length; _i1020++) {
                                        const v_x = _a1019[_i1020];
                                        const _h1021 = clueAt(cl.number, v_x);
                                        if (!((_h1021 === _h1022))) continue;
                                        _g1016++;
                                      }
                                    }
                                    _c1023 = (_g1016 === 0);
                                  }
                                  _c1024 = _c1023;
                                }
                                if (!(_c1024)) continue;
                                _g1012++;
                              }
                            }
                            let _c1151: boolean = ((_g1007 + 1) === (2 - _g1012));
                            if (!_c1151) {
                              let _q1025 = false;
                              Q1026: {
                                const _a1027 = sp.adj4[v_s];
                                const _n1028 = _i884;
                                for (let _i1029 = 0; _i1029 < _n1028; _i1029++) {
                                  const v_z = _a1027[_i1029];
                                  const _t1030 = sp.adj4Edges[v_s][_i1029];
                                  let _c1049: boolean = !((_t1030 === _wc538 ? true : (_t1030 === _wc536 ? true : (b.grid[_t1030] !== 0))));
                                  if (_c1049) {
                                    let _g1031 = 0;
                                    G1032: {
                                      const _a1033 = sp.adj4[v_s];
                                      for (let _i1034 = 0; _i1034 < _a1033.length; _i1034++) {
                                        const _t1035 = sp.adj4Edges[v_s][_i1034];
                                        if (!(((_t1035 === _wc538 ? _wd539 : (_t1035 === _wc536 ? _wd537 : (b.grid[_t1035] || -1))) === 1))) continue;
                                        _g1031++;
                                      }
                                    }
                                    let _g1036 = 0;
                                    G1037: {
                                      for (let _i1038 = 0; _i1038 < 1; _i1038++) {
                                        const v_k = v_s;
                                        const _h1039 = clueAt(cl.number, v_k);
                                        const _h1046 = (_h1039 + 1);
                                        let _c1048: boolean = (_h1039 !== -1);
                                        if (_c1048) {
                                          let _c1047: boolean = (_h554 || (_h1039 === 1));
                                          if (!_c1047) {
                                            let _g1040 = 0;
                                            G1041: {
                                              const _t1042 = (_h1039 + 1);
                                              const _a1043 = cluesValued(cl.number, _t1042);
                                              for (let _i1044 = 0; _i1044 < _a1043.length; _i1044++) {
                                                const v_x = _a1043[_i1044];
                                                const _h1045 = clueAt(cl.number, v_x);
                                                if (!((_h1045 === _h1046))) continue;
                                                _g1040++;
                                              }
                                            }
                                            _c1047 = (_g1040 === 0);
                                          }
                                          _c1048 = _c1047;
                                        }
                                        if (!(_c1048)) continue;
                                        _g1036++;
                                      }
                                    }
                                    _c1049 = (_g1031 < (2 - _g1036));
                                  }
                                  let _c1068: boolean = _c1049;
                                  if (_c1068) {
                                    let _g1050 = 0;
                                    G1051: {
                                      const _a1052 = sp.adj4[v_z];
                                      for (let _i1053 = 0; _i1053 < _a1052.length; _i1053++) {
                                        const _t1054 = sp.adj4Edges[v_z][_i1053];
                                        if (!(((_t1054 === _wc538 ? _wd539 : (_t1054 === _wc536 ? _wd537 : (b.grid[_t1054] || -1))) === 1))) continue;
                                        _g1050++;
                                      }
                                    }
                                    let _g1055 = 0;
                                    G1056: {
                                      for (let _i1057 = 0; _i1057 < 1; _i1057++) {
                                        const v_k = v_z;
                                        const _h1058 = clueAt(cl.number, v_k);
                                        const _h1065 = (_h1058 + 1);
                                        let _c1067: boolean = (_h1058 !== -1);
                                        if (_c1067) {
                                          let _c1066: boolean = (_h554 || (_h1058 === 1));
                                          if (!_c1066) {
                                            let _g1059 = 0;
                                            G1060: {
                                              const _t1061 = (_h1058 + 1);
                                              const _a1062 = cluesValued(cl.number, _t1061);
                                              for (let _i1063 = 0; _i1063 < _a1062.length; _i1063++) {
                                                const v_x = _a1062[_i1063];
                                                const _h1064 = clueAt(cl.number, v_x);
                                                if (!((_h1064 === _h1065))) continue;
                                                _g1059++;
                                              }
                                            }
                                            _c1066 = (_g1059 === 0);
                                          }
                                          _c1067 = _c1066;
                                        }
                                        if (!(_c1067)) continue;
                                        _g1055++;
                                      }
                                    }
                                    _c1068 = (_g1050 < (2 - _g1055));
                                  }
                                  let _c1149: boolean = _c1068;
                                  if (_c1149) {
                                    let _q1069 = true;
                                    Q1070: {
                                      _g1071.length = 0;
                                      G1072: {
                                        for (let _i1074 = 0; _i1074 < 1; _i1074++) {
                                          const v_x = v_s;
                                          const _h1075 = clueAt(cl.number, v_x);
                                          if (!((_h1075 !== -1))) continue;
                                          _g1071.push(v_x);
                                        }
                                      }
                                      _g1076.length = 0;
                                      pairBreaks_st1089.pass++;
                                      G1077: {
                                        const _a1095 = throughWhere(sp, v_s, (_te1090: number): boolean => { let _c1092: boolean = ((_te1090 === _wc538 ? _wd539 : (_te1090 === _wc536 ? _wd537 : (b.grid[_te1090] || -1))) === 1); if (_c1092) {   const _t1091 = sp.edgeEnds[2 * _te1090];   _c1092 = !((clueAt(cl.number, _t1091) !== -1)); } let _c1094: boolean = _c1092; if (_c1094) {   const _t1093 = sp.edgeEnds[2 * _te1090 + 1];   _c1094 = !((clueAt(cl.number, _t1093) !== -1)); } return _c1094; });
                                        for (let _i1096 = 0; _i1096 < _a1095.length; _i1096++) {
                                          const v_t = _a1095[_i1096];
                                          const _h1099 = clueAt(cl.number, v_t);
                                          const _h1100 = (_h1099 !== -1);
                                          const _h1101 = _h1100;
                                          const _h1102 = !(_h1101);
                                          const _a1097 = sp.adj4[v_t];
                                          for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
                                            const v_x = _a1097[_i1098];
                                            const _h1103 = clueAt(cl.number, v_x);
                                            let _c1105: boolean = (_h1102 && (_h1103 !== -1));
                                            if (_c1105) {
                                              const _t1104 = sp.adj4Edges[v_t][_i1098];
                                              _c1105 = ((_t1104 === _wc538 ? _wd539 : (_t1104 === _wc536 ? _wd537 : (b.grid[_t1104] || -1))) === 1);
                                            }
                                            if (!(_c1105)) continue;
                                            const _t1106 = v_x;
                                            if (_g1076.length < 16) { if (!_g1076.includes(_t1106)) _g1076.push(_t1106); } else addOnce(_g1076, pairBreaks_st1089, _t1106);
                                          }
                                        }
                                      }
                                      const _a1107 = union(_g1071, _g1076);
                                      for (let _i1108 = 0; _i1108 < _a1107.length; _i1108++) {
                                        const v_p = _a1107[_i1108];
                                        const _h1147 = clueAt(cl.number, v_p);
                                        _g1109.length = 0;
                                        G1110: {
                                          for (let _i1112 = 0; _i1112 < 1; _i1112++) {
                                            const v_x = v_z;
                                            const _h1113 = clueAt(cl.number, v_x);
                                            if (!((_h1113 !== -1))) continue;
                                            _g1109.push(v_x);
                                          }
                                        }
                                        _g1114.length = 0;
                                        pairBreaks_st1127.pass++;
                                        G1115: {
                                          const _a1133 = throughWhere(sp, v_z, (_te1128: number): boolean => { let _c1130: boolean = ((_te1128 === _wc538 ? _wd539 : (_te1128 === _wc536 ? _wd537 : (b.grid[_te1128] || -1))) === 1); if (_c1130) {   const _t1129 = sp.edgeEnds[2 * _te1128];   _c1130 = !((clueAt(cl.number, _t1129) !== -1)); } let _c1132: boolean = _c1130; if (_c1132) {   const _t1131 = sp.edgeEnds[2 * _te1128 + 1];   _c1132 = !((clueAt(cl.number, _t1131) !== -1)); } return _c1132; });
                                          for (let _i1134 = 0; _i1134 < _a1133.length; _i1134++) {
                                            const v_t = _a1133[_i1134];
                                            const _h1137 = clueAt(cl.number, v_t);
                                            const _h1138 = (_h1137 !== -1);
                                            const _h1139 = _h1138;
                                            const _h1140 = !(_h1139);
                                            const _a1135 = sp.adj4[v_t];
                                            for (let _i1136 = 0; _i1136 < _a1135.length; _i1136++) {
                                              const v_x = _a1135[_i1136];
                                              const _h1141 = clueAt(cl.number, v_x);
                                              let _c1143: boolean = (_h1140 && (_h1141 !== -1));
                                              if (_c1143) {
                                                const _t1142 = sp.adj4Edges[v_t][_i1136];
                                                _c1143 = ((_t1142 === _wc538 ? _wd539 : (_t1142 === _wc536 ? _wd537 : (b.grid[_t1142] || -1))) === 1);
                                              }
                                              if (!(_c1143)) continue;
                                              const _t1144 = v_x;
                                              if (_g1114.length < 16) { if (!_g1114.includes(_t1144)) _g1114.push(_t1144); } else addOnce(_g1114, pairBreaks_st1127, _t1144);
                                            }
                                          }
                                        }
                                        const _a1145 = union(_g1109, _g1114);
                                        for (let _i1146 = 0; _i1146 < _a1145.length; _i1146++) {
                                          const v_q = _a1145[_i1146];
                                          const _h1148 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h1147 - _h1148)) === cl.step))) {
                                            _q1069 = false;
                                            break Q1070;
                                          }
                                        }
                                      }
                                    }
                                    _c1149 = _q1069;
                                  }
                                  if ((_c1149 && (_h554 || !(throughWhere(sp, v_s, (_te1150: number): boolean => {  return ((_te1150 === _wc538 ? _wd539 : (_te1150 === _wc536 ? _wd537 : (b.grid[_te1150] || -1))) === 1); }).includes(v_z))))) {
                                    _q1025 = true;
                                    break Q1026;
                                  }
                                }
                              }
                              _c1151 = _q1025;
                            }
                            if (_c1151) {
                              _q881 = true;
                              break Q882;
                            }
                          }
                        }
                        _c1152 = !(_q881);
                      }
                      if (_c1152) {
                        _q859 = true;
                        break Q860;
                      }
                    }
                  }
                  _c1153 = _q859;
                }
                if (_c1153) {
                  _q540 = true;
                  break Q541;
                }
              }
            }
            _c1154 = _q540;
          }
          if (!(_c1154)) break L530;
          if (b.made[0] !== _m2852_0 || b.made[1] !== _m2853_1) {
            let _g1155 = 0;
            G1156: {
              const _a1157 = sp.adj4[v_c];
              for (let _i1158 = 0; _i1158 < _a1157.length; _i1158++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i1158]] || -1) === 1))) continue;
                _g1155++;
              }
            }
            if (!(((takes(sp, cl, v_c) - _g1155) === 2))) { continue R1; }
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g1159 = 0;
            G1160: {
              const _a1161 = sp.adj4[v_c];
              for (let _i1162 = 0; _i1162 < _a1161.length; _i1162++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i1162]] || -1) === 1))) continue;
                _g1159++;
              }
            }
            let _c1670: boolean = ((throughWhere(sp, v_i, (_te1163: number): boolean => {  return ((b.grid[_te1163] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
            if (!_c1670) {
              const _wc1164 = sp.edgeOf(v_c, v_i);
              const _wd1165 = 1;
              const _wc1166 = sp.edgeOf(v_c, v_j);
              const _wd1167 = 1;
              let _q1168 = false;
              Q1169: {
                const _a1171 = throughWhere(sp, v_c, (_te1170: number): boolean => {  return ((_te1170 === _wc1166 ? _wd1167 : (_te1170 === _wc1164 ? _wd1165 : (b.grid[_te1170] || -1))) === 1); });
                for (let _i1172 = 0; _i1172 < _a1171.length; _i1172++) {
                  const v_t = _a1171[_i1172];
                  let _c1188: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c1188) {
                    let _g1173 = 0;
                    G1174: {
                      const _a1175 = sp.adj4[v_t];
                      for (let _i1176 = 0; _i1176 < _a1175.length; _i1176++) {
                        const _t1177 = sp.adj4Edges[v_t][_i1176];
                        if (!(((_t1177 === _wc1166 ? _wd1167 : (_t1177 === _wc1164 ? _wd1165 : (b.grid[_t1177] || -1))) === 1))) continue;
                        _g1173++;
                      }
                    }
                    let _g1178 = 0;
                    G1179: {
                      for (let _i1180 = 0; _i1180 < 1; _i1180++) {
                        const v_k = v_t;
                        let _c1187: boolean = (clueAt(cl.number, v_k) !== -1);
                        if (_c1187) {
                          let _c1186: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                          if (!_c1186) {
                            let _g1181 = 0;
                            G1182: {
                              const _t1183 = (clueAt(cl.number, v_k) + 1);
                              const _a1184 = cluesValued(cl.number, _t1183);
                              for (let _i1185 = 0; _i1185 < _a1184.length; _i1185++) {
                                const v_x = _a1184[_i1185];
                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                _g1181++;
                              }
                            }
                            _c1186 = (_g1181 === 0);
                          }
                          _c1187 = _c1186;
                        }
                        if (!(_c1187)) continue;
                        _g1178++;
                      }
                    }
                    _c1188 = (_g1173 < (2 - _g1178));
                  }
                  if (!(_c1188)) continue;
                  let _g1189 = 0;
                  G1190: {
                    const _a1191 = sp.adj4[v_t];
                    for (let _i1192 = 0; _i1192 < _a1191.length; _i1192++) {
                      const _t1193 = sp.adj4Edges[v_t][_i1192];
                      if (!(((_t1193 === _wc1166 ? _wd1167 : (_t1193 === _wc1164 ? _wd1165 : (b.grid[_t1193] || -1))) === 1))) continue;
                      _g1189++;
                    }
                  }
                  let _g1194 = 0;
                  G1195: {
                    for (let _i1196 = 0; _i1196 < 1; _i1196++) {
                      const v_k = v_t;
                      let _c1203: boolean = (clueAt(cl.number, v_k) !== -1);
                      if (_c1203) {
                        let _c1202: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                        if (!_c1202) {
                          let _g1197 = 0;
                          G1198: {
                            const _t1199 = (clueAt(cl.number, v_k) + 1);
                            const _a1200 = cluesValued(cl.number, _t1199);
                            for (let _i1201 = 0; _i1201 < _a1200.length; _i1201++) {
                              const v_x = _a1200[_i1201];
                              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                              _g1197++;
                            }
                          }
                          _c1202 = (_g1197 === 0);
                        }
                        _c1203 = _c1202;
                      }
                      if (!(_c1203)) continue;
                      _g1194++;
                    }
                  }
                  let _c1428: boolean = (_g1189 < (2 - _g1194));
                  if (_c1428) {
                    let _q1204 = false;
                    Q1205: {
                      const _a1206 = sp.adj4[v_t];
                      for (let _i1207 = 0; _i1207 < _a1206.length; _i1207++) {
                        const v_y = _a1206[_i1207];
                        const _t1208 = sp.adj4Edges[v_t][_i1207];
                        let _c1224: boolean = !((_t1208 === _wc1166 ? true : (_t1208 === _wc1164 ? true : (b.grid[_t1208] !== 0))));
                        if (_c1224) {
                          let _g1209 = 0;
                          G1210: {
                            const _a1211 = sp.adj4[v_t];
                            for (let _i1212 = 0; _i1212 < _a1211.length; _i1212++) {
                              const _t1213 = sp.adj4Edges[v_t][_i1212];
                              if (!(((_t1213 === _wc1166 ? _wd1167 : (_t1213 === _wc1164 ? _wd1165 : (b.grid[_t1213] || -1))) === 1))) continue;
                              _g1209++;
                            }
                          }
                          let _g1214 = 0;
                          G1215: {
                            for (let _i1216 = 0; _i1216 < 1; _i1216++) {
                              const v_k = v_t;
                              let _c1223: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c1223) {
                                let _c1222: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c1222) {
                                  let _g1217 = 0;
                                  G1218: {
                                    const _t1219 = (clueAt(cl.number, v_k) + 1);
                                    const _a1220 = cluesValued(cl.number, _t1219);
                                    for (let _i1221 = 0; _i1221 < _a1220.length; _i1221++) {
                                      const v_x = _a1220[_i1221];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g1217++;
                                    }
                                  }
                                  _c1222 = (_g1217 === 0);
                                }
                                _c1223 = _c1222;
                              }
                              if (!(_c1223)) continue;
                              _g1214++;
                            }
                          }
                          _c1224 = (_g1209 < (2 - _g1214));
                        }
                        let _c1241: boolean = _c1224;
                        if (_c1241) {
                          let _g1225 = 0;
                          G1226: {
                            const _a1228 = sp.adj4[v_y];
                            for (let _i1229 = 0; _i1229 < _a1228.length; _i1229++) {
                              const _t1230 = sp.adj4Edges[v_y][_i1229];
                              if (!(((_t1230 === _wc1166 ? _wd1167 : (_t1230 === _wc1164 ? _wd1165 : (b.grid[_t1230] || -1))) === 1))) continue;
                              _g1225++;
                            }
                          }
                          let _g1231 = 0;
                          G1232: {
                            for (let _i1233 = 0; _i1233 < 1; _i1233++) {
                              const v_k = v_y;
                              let _c1240: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c1240) {
                                let _c1239: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c1239) {
                                  let _g1234 = 0;
                                  G1235: {
                                    const _t1236 = (clueAt(cl.number, v_k) + 1);
                                    const _a1237 = cluesValued(cl.number, _t1236);
                                    for (let _i1238 = 0; _i1238 < _a1237.length; _i1238++) {
                                      const v_x = _a1237[_i1238];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g1234++;
                                    }
                                  }
                                  _c1239 = (_g1234 === 0);
                                }
                                _c1240 = _c1239;
                              }
                              if (!(_c1240)) continue;
                              _g1231++;
                            }
                          }
                          _c1241 = (_g1225 < (2 - _g1231));
                        }
                        let _c1306: boolean = _c1241;
                        if (_c1306) {
                          let _q1242 = true;
                          Q1243: {
                            const _g1244: number[] = [];
                            G1245: {
                              for (let _i1247 = 0; _i1247 < 1; _i1247++) {
                                const v_x = v_t;
                                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                _g1244.push(v_x);
                              }
                            }
                            const _g1248: number[] = [];
                            G1249: {
                              const _a1268 = throughWhere(sp, v_t, (_te1263: number): boolean => { let _c1265: boolean = ((_te1263 === _wc1166 ? _wd1167 : (_te1263 === _wc1164 ? _wd1165 : (b.grid[_te1263] || -1))) === 1); if (_c1265) {   const _t1264 = sp.edgeEnds[2 * _te1263];   _c1265 = !((clueAt(cl.number, _t1264) !== -1)); } let _c1267: boolean = _c1265; if (_c1267) {   const _t1266 = sp.edgeEnds[2 * _te1263 + 1];   _c1267 = !((clueAt(cl.number, _t1266) !== -1)); } return _c1267; });
                              for (let _i1269 = 0; _i1269 < _a1268.length; _i1269++) {
                                const v_t_1262 = _a1268[_i1269];
                                const _a1270 = sp.adj4[v_t_1262];
                                for (let _i1271 = 0; _i1271 < _a1270.length; _i1271++) {
                                  const v_x = _a1270[_i1271];
                                  let _c1273: boolean = (!((clueAt(cl.number, v_t_1262) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                  if (_c1273) {
                                    const _t1272 = sp.adj4Edges[v_t_1262][_i1271];
                                    _c1273 = ((_t1272 === _wc1166 ? _wd1167 : (_t1272 === _wc1164 ? _wd1165 : (b.grid[_t1272] || -1))) === 1);
                                  }
                                  if (!(_c1273)) continue;
                                  if (!_g1248.includes(v_x)) _g1248.push(v_x);
                                }
                              }
                            }
                            const _a1274 = union(_g1244, _g1248);
                            for (let _i1275 = 0; _i1275 < _a1274.length; _i1275++) {
                              const v_p = _a1274[_i1275];
                              const _g1276: number[] = [];
                              G1277: {
                                for (let _i1279 = 0; _i1279 < 1; _i1279++) {
                                  const v_x = v_y;
                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                  _g1276.push(v_x);
                                }
                              }
                              const _g1280: number[] = [];
                              G1281: {
                                const _a1298 = throughWhere(sp, v_y, (_te1293: number): boolean => { let _c1295: boolean = ((_te1293 === _wc1166 ? _wd1167 : (_te1293 === _wc1164 ? _wd1165 : (b.grid[_te1293] || -1))) === 1); if (_c1295) {   const _t1294 = sp.edgeEnds[2 * _te1293];   _c1295 = !((clueAt(cl.number, _t1294) !== -1)); } let _c1297: boolean = _c1295; if (_c1297) {   const _t1296 = sp.edgeEnds[2 * _te1293 + 1];   _c1297 = !((clueAt(cl.number, _t1296) !== -1)); } return _c1297; });
                                for (let _i1299 = 0; _i1299 < _a1298.length; _i1299++) {
                                  const v_t = _a1298[_i1299];
                                  const _a1300 = sp.adj4[v_t];
                                  for (let _i1301 = 0; _i1301 < _a1300.length; _i1301++) {
                                    const v_x = _a1300[_i1301];
                                    let _c1303: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                    if (_c1303) {
                                      const _t1302 = sp.adj4Edges[v_t][_i1301];
                                      _c1303 = ((_t1302 === _wc1166 ? _wd1167 : (_t1302 === _wc1164 ? _wd1165 : (b.grid[_t1302] || -1))) === 1);
                                    }
                                    if (!(_c1303)) continue;
                                    if (!_g1280.includes(v_x)) _g1280.push(v_x);
                                  }
                                }
                              }
                              const _a1304 = union(_g1276, _g1280);
                              for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
                                const v_q = _a1304[_i1305];
                                if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                  _q1242 = false;
                                  break Q1243;
                                }
                              }
                            }
                          }
                          _c1306 = _q1242;
                        }
                        if (!((_c1306 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1307: number): boolean => {  return ((_te1307 === _wc1166 ? _wd1167 : (_te1307 === _wc1164 ? _wd1165 : (b.grid[_te1307] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g1308 = 0;
                        G1309: {
                          const _a1310 = sp.adj4[v_t];
                          for (let _i1311 = 0; _i1311 < _a1310.length; _i1311++) {
                            const _t1312 = sp.adj4Edges[v_t][_i1311];
                            if (!(((_t1312 === _wc1166 ? _wd1167 : (_t1312 === _wc1164 ? _wd1165 : (b.grid[_t1312] || -1))) === 1))) continue;
                            _g1308++;
                          }
                        }
                        let _g1313 = 0;
                        G1314: {
                          for (let _i1315 = 0; _i1315 < 1; _i1315++) {
                            const v_k = v_t;
                            let _c1322: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1322) {
                              let _c1321: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1321) {
                                let _g1316 = 0;
                                G1317: {
                                  const _t1318 = (clueAt(cl.number, v_k) + 1);
                                  const _a1319 = cluesValued(cl.number, _t1318);
                                  for (let _i1320 = 0; _i1320 < _a1319.length; _i1320++) {
                                    const v_x = _a1319[_i1320];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1316++;
                                  }
                                }
                                _c1321 = (_g1316 === 0);
                              }
                              _c1322 = _c1321;
                            }
                            if (!(_c1322)) continue;
                            _g1313++;
                          }
                        }
                        let _c1427: boolean = ((_g1308 + 1) === (2 - _g1313));
                        if (!_c1427) {
                          let _q1323 = false;
                          Q1324: {
                            const _a1325 = sp.adj4[v_t];
                            const _n1326 = _i1207;
                            for (let _i1327 = 0; _i1327 < _n1326; _i1327++) {
                              const v_z = _a1325[_i1327];
                              const _t1328 = sp.adj4Edges[v_t][_i1327];
                              let _c1344: boolean = !((_t1328 === _wc1166 ? true : (_t1328 === _wc1164 ? true : (b.grid[_t1328] !== 0))));
                              if (_c1344) {
                                let _g1329 = 0;
                                G1330: {
                                  const _a1331 = sp.adj4[v_t];
                                  for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
                                    const _t1333 = sp.adj4Edges[v_t][_i1332];
                                    if (!(((_t1333 === _wc1166 ? _wd1167 : (_t1333 === _wc1164 ? _wd1165 : (b.grid[_t1333] || -1))) === 1))) continue;
                                    _g1329++;
                                  }
                                }
                                let _g1334 = 0;
                                G1335: {
                                  for (let _i1336 = 0; _i1336 < 1; _i1336++) {
                                    const v_k = v_t;
                                    let _c1343: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c1343) {
                                      let _c1342: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c1342) {
                                        let _g1337 = 0;
                                        G1338: {
                                          const _t1339 = (clueAt(cl.number, v_k) + 1);
                                          const _a1340 = cluesValued(cl.number, _t1339);
                                          for (let _i1341 = 0; _i1341 < _a1340.length; _i1341++) {
                                            const v_x = _a1340[_i1341];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g1337++;
                                          }
                                        }
                                        _c1342 = (_g1337 === 0);
                                      }
                                      _c1343 = _c1342;
                                    }
                                    if (!(_c1343)) continue;
                                    _g1334++;
                                  }
                                }
                                _c1344 = (_g1329 < (2 - _g1334));
                              }
                              let _c1360: boolean = _c1344;
                              if (_c1360) {
                                let _g1345 = 0;
                                G1346: {
                                  const _a1347 = sp.adj4[v_z];
                                  for (let _i1348 = 0; _i1348 < _a1347.length; _i1348++) {
                                    const _t1349 = sp.adj4Edges[v_z][_i1348];
                                    if (!(((_t1349 === _wc1166 ? _wd1167 : (_t1349 === _wc1164 ? _wd1165 : (b.grid[_t1349] || -1))) === 1))) continue;
                                    _g1345++;
                                  }
                                }
                                let _g1350 = 0;
                                G1351: {
                                  for (let _i1352 = 0; _i1352 < 1; _i1352++) {
                                    const v_k = v_z;
                                    let _c1359: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c1359) {
                                      let _c1358: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c1358) {
                                        let _g1353 = 0;
                                        G1354: {
                                          const _t1355 = (clueAt(cl.number, v_k) + 1);
                                          const _a1356 = cluesValued(cl.number, _t1355);
                                          for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
                                            const v_x = _a1356[_i1357];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g1353++;
                                          }
                                        }
                                        _c1358 = (_g1353 === 0);
                                      }
                                      _c1359 = _c1358;
                                    }
                                    if (!(_c1359)) continue;
                                    _g1350++;
                                  }
                                }
                                _c1360 = (_g1345 < (2 - _g1350));
                              }
                              let _c1425: boolean = _c1360;
                              if (_c1425) {
                                let _q1361 = true;
                                Q1362: {
                                  const _g1363: number[] = [];
                                  G1364: {
                                    for (let _i1366 = 0; _i1366 < 1; _i1366++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1363.push(v_x);
                                    }
                                  }
                                  const _g1367: number[] = [];
                                  G1368: {
                                    const _a1387 = throughWhere(sp, v_t, (_te1382: number): boolean => { let _c1384: boolean = ((_te1382 === _wc1166 ? _wd1167 : (_te1382 === _wc1164 ? _wd1165 : (b.grid[_te1382] || -1))) === 1); if (_c1384) {   const _t1383 = sp.edgeEnds[2 * _te1382];   _c1384 = !((clueAt(cl.number, _t1383) !== -1)); } let _c1386: boolean = _c1384; if (_c1386) {   const _t1385 = sp.edgeEnds[2 * _te1382 + 1];   _c1386 = !((clueAt(cl.number, _t1385) !== -1)); } return _c1386; });
                                    for (let _i1388 = 0; _i1388 < _a1387.length; _i1388++) {
                                      const v_t_1381 = _a1387[_i1388];
                                      const _a1389 = sp.adj4[v_t_1381];
                                      for (let _i1390 = 0; _i1390 < _a1389.length; _i1390++) {
                                        const v_x = _a1389[_i1390];
                                        let _c1392: boolean = (!((clueAt(cl.number, v_t_1381) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1392) {
                                          const _t1391 = sp.adj4Edges[v_t_1381][_i1390];
                                          _c1392 = ((_t1391 === _wc1166 ? _wd1167 : (_t1391 === _wc1164 ? _wd1165 : (b.grid[_t1391] || -1))) === 1);
                                        }
                                        if (!(_c1392)) continue;
                                        if (!_g1367.includes(v_x)) _g1367.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1393 = union(_g1363, _g1367);
                                  for (let _i1394 = 0; _i1394 < _a1393.length; _i1394++) {
                                    const v_p = _a1393[_i1394];
                                    const _g1395: number[] = [];
                                    G1396: {
                                      for (let _i1398 = 0; _i1398 < 1; _i1398++) {
                                        const v_x = v_z;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g1395.push(v_x);
                                      }
                                    }
                                    const _g1399: number[] = [];
                                    G1400: {
                                      const _a1417 = throughWhere(sp, v_z, (_te1412: number): boolean => { let _c1414: boolean = ((_te1412 === _wc1166 ? _wd1167 : (_te1412 === _wc1164 ? _wd1165 : (b.grid[_te1412] || -1))) === 1); if (_c1414) {   const _t1413 = sp.edgeEnds[2 * _te1412];   _c1414 = !((clueAt(cl.number, _t1413) !== -1)); } let _c1416: boolean = _c1414; if (_c1416) {   const _t1415 = sp.edgeEnds[2 * _te1412 + 1];   _c1416 = !((clueAt(cl.number, _t1415) !== -1)); } return _c1416; });
                                      for (let _i1418 = 0; _i1418 < _a1417.length; _i1418++) {
                                        const v_t = _a1417[_i1418];
                                        const _a1419 = sp.adj4[v_t];
                                        for (let _i1420 = 0; _i1420 < _a1419.length; _i1420++) {
                                          const v_x = _a1419[_i1420];
                                          let _c1422: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c1422) {
                                            const _t1421 = sp.adj4Edges[v_t][_i1420];
                                            _c1422 = ((_t1421 === _wc1166 ? _wd1167 : (_t1421 === _wc1164 ? _wd1165 : (b.grid[_t1421] || -1))) === 1);
                                          }
                                          if (!(_c1422)) continue;
                                          if (!_g1399.includes(v_x)) _g1399.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1423 = union(_g1395, _g1399);
                                    for (let _i1424 = 0; _i1424 < _a1423.length; _i1424++) {
                                      const v_q = _a1423[_i1424];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q1361 = false;
                                        break Q1362;
                                      }
                                    }
                                  }
                                }
                                _c1425 = _q1361;
                              }
                              if ((_c1425 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1426: number): boolean => {  return ((_te1426 === _wc1166 ? _wd1167 : (_te1426 === _wc1164 ? _wd1165 : (b.grid[_te1426] || -1))) === 1); }).includes(v_z))))) {
                                _q1323 = true;
                                break Q1324;
                              }
                            }
                          }
                          _c1427 = _q1323;
                        }
                        if (_c1427) {
                          _q1204 = true;
                          break Q1205;
                        }
                      }
                    }
                    _c1428 = !(_q1204);
                  }
                  let _c1669: boolean = _c1428;
                  if (!_c1669) {
                    let _q1429 = false;
                    Q1430: {
                      const _a1431 = sp.adj4[v_t];
                      for (let _i1432 = 0; _i1432 < _a1431.length; _i1432++) {
                        const v_s = _a1431[_i1432];
                        let _g1433 = 0;
                        G1434: {
                          const _a1435 = sp.adj4[v_s];
                          for (let _i1436 = 0; _i1436 < _a1435.length; _i1436++) {
                            const _t1437 = sp.adj4Edges[v_s][_i1436];
                            if (!(((_t1437 === _wc1166 ? _wd1167 : (_t1437 === _wc1164 ? _wd1165 : (b.grid[_t1437] || -1))) === 1))) continue;
                            _g1433++;
                          }
                        }
                        let _g1438 = 0;
                        G1439: {
                          for (let _i1440 = 0; _i1440 < 1; _i1440++) {
                            const v_k = v_s;
                            let _c1447: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1447) {
                              let _c1446: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1446) {
                                let _g1441 = 0;
                                G1442: {
                                  const _t1443 = (clueAt(cl.number, v_k) + 1);
                                  const _a1444 = cluesValued(cl.number, _t1443);
                                  for (let _i1445 = 0; _i1445 < _a1444.length; _i1445++) {
                                    const v_x = _a1444[_i1445];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1441++;
                                  }
                                }
                                _c1446 = (_g1441 === 0);
                              }
                              _c1447 = _c1446;
                            }
                            if (!(_c1447)) continue;
                            _g1438++;
                          }
                        }
                        let _c1668: boolean = (_g1433 < (2 - _g1438));
                        if (_c1668) {
                          let _q1448 = false;
                          Q1449: {
                            const _a1450 = sp.adj4[v_s];
                            for (let _i1451 = 0; _i1451 < _a1450.length; _i1451++) {
                              const v_y = _a1450[_i1451];
                              const _t1452 = sp.adj4Edges[v_s][_i1451];
                              let _c1468: boolean = !((_t1452 === _wc1166 ? true : (_t1452 === _wc1164 ? true : (b.grid[_t1452] !== 0))));
                              if (_c1468) {
                                let _g1453 = 0;
                                G1454: {
                                  const _a1455 = sp.adj4[v_s];
                                  for (let _i1456 = 0; _i1456 < _a1455.length; _i1456++) {
                                    const _t1457 = sp.adj4Edges[v_s][_i1456];
                                    if (!(((_t1457 === _wc1166 ? _wd1167 : (_t1457 === _wc1164 ? _wd1165 : (b.grid[_t1457] || -1))) === 1))) continue;
                                    _g1453++;
                                  }
                                }
                                let _g1458 = 0;
                                G1459: {
                                  for (let _i1460 = 0; _i1460 < 1; _i1460++) {
                                    const v_k = v_s;
                                    let _c1467: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c1467) {
                                      let _c1466: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c1466) {
                                        let _g1461 = 0;
                                        G1462: {
                                          const _t1463 = (clueAt(cl.number, v_k) + 1);
                                          const _a1464 = cluesValued(cl.number, _t1463);
                                          for (let _i1465 = 0; _i1465 < _a1464.length; _i1465++) {
                                            const v_x = _a1464[_i1465];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g1461++;
                                          }
                                        }
                                        _c1466 = (_g1461 === 0);
                                      }
                                      _c1467 = _c1466;
                                    }
                                    if (!(_c1467)) continue;
                                    _g1458++;
                                  }
                                }
                                _c1468 = (_g1453 < (2 - _g1458));
                              }
                              let _c1485: boolean = _c1468;
                              if (_c1485) {
                                let _g1469 = 0;
                                G1470: {
                                  const _a1472 = sp.adj4[v_y];
                                  for (let _i1473 = 0; _i1473 < _a1472.length; _i1473++) {
                                    const _t1474 = sp.adj4Edges[v_y][_i1473];
                                    if (!(((_t1474 === _wc1166 ? _wd1167 : (_t1474 === _wc1164 ? _wd1165 : (b.grid[_t1474] || -1))) === 1))) continue;
                                    _g1469++;
                                  }
                                }
                                let _g1475 = 0;
                                G1476: {
                                  for (let _i1477 = 0; _i1477 < 1; _i1477++) {
                                    const v_k = v_y;
                                    let _c1484: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c1484) {
                                      let _c1483: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c1483) {
                                        let _g1478 = 0;
                                        G1479: {
                                          const _t1480 = (clueAt(cl.number, v_k) + 1);
                                          const _a1481 = cluesValued(cl.number, _t1480);
                                          for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
                                            const v_x = _a1481[_i1482];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g1478++;
                                          }
                                        }
                                        _c1483 = (_g1478 === 0);
                                      }
                                      _c1484 = _c1483;
                                    }
                                    if (!(_c1484)) continue;
                                    _g1475++;
                                  }
                                }
                                _c1485 = (_g1469 < (2 - _g1475));
                              }
                              let _c1548: boolean = _c1485;
                              if (_c1548) {
                                let _q1486 = true;
                                Q1487: {
                                  const _g1488: number[] = [];
                                  G1489: {
                                    for (let _i1491 = 0; _i1491 < 1; _i1491++) {
                                      const v_x = v_s;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1488.push(v_x);
                                    }
                                  }
                                  const _g1492: number[] = [];
                                  G1493: {
                                    const _a1510 = throughWhere(sp, v_s, (_te1505: number): boolean => { let _c1507: boolean = ((_te1505 === _wc1166 ? _wd1167 : (_te1505 === _wc1164 ? _wd1165 : (b.grid[_te1505] || -1))) === 1); if (_c1507) {   const _t1506 = sp.edgeEnds[2 * _te1505];   _c1507 = !((clueAt(cl.number, _t1506) !== -1)); } let _c1509: boolean = _c1507; if (_c1509) {   const _t1508 = sp.edgeEnds[2 * _te1505 + 1];   _c1509 = !((clueAt(cl.number, _t1508) !== -1)); } return _c1509; });
                                    for (let _i1511 = 0; _i1511 < _a1510.length; _i1511++) {
                                      const v_t = _a1510[_i1511];
                                      const _a1512 = sp.adj4[v_t];
                                      for (let _i1513 = 0; _i1513 < _a1512.length; _i1513++) {
                                        const v_x = _a1512[_i1513];
                                        let _c1515: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1515) {
                                          const _t1514 = sp.adj4Edges[v_t][_i1513];
                                          _c1515 = ((_t1514 === _wc1166 ? _wd1167 : (_t1514 === _wc1164 ? _wd1165 : (b.grid[_t1514] || -1))) === 1);
                                        }
                                        if (!(_c1515)) continue;
                                        if (!_g1492.includes(v_x)) _g1492.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1516 = union(_g1488, _g1492);
                                  for (let _i1517 = 0; _i1517 < _a1516.length; _i1517++) {
                                    const v_p = _a1516[_i1517];
                                    const _g1518: number[] = [];
                                    G1519: {
                                      for (let _i1521 = 0; _i1521 < 1; _i1521++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g1518.push(v_x);
                                      }
                                    }
                                    const _g1522: number[] = [];
                                    G1523: {
                                      const _a1540 = throughWhere(sp, v_y, (_te1535: number): boolean => { let _c1537: boolean = ((_te1535 === _wc1166 ? _wd1167 : (_te1535 === _wc1164 ? _wd1165 : (b.grid[_te1535] || -1))) === 1); if (_c1537) {   const _t1536 = sp.edgeEnds[2 * _te1535];   _c1537 = !((clueAt(cl.number, _t1536) !== -1)); } let _c1539: boolean = _c1537; if (_c1539) {   const _t1538 = sp.edgeEnds[2 * _te1535 + 1];   _c1539 = !((clueAt(cl.number, _t1538) !== -1)); } return _c1539; });
                                      for (let _i1541 = 0; _i1541 < _a1540.length; _i1541++) {
                                        const v_t = _a1540[_i1541];
                                        const _a1542 = sp.adj4[v_t];
                                        for (let _i1543 = 0; _i1543 < _a1542.length; _i1543++) {
                                          const v_x = _a1542[_i1543];
                                          let _c1545: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c1545) {
                                            const _t1544 = sp.adj4Edges[v_t][_i1543];
                                            _c1545 = ((_t1544 === _wc1166 ? _wd1167 : (_t1544 === _wc1164 ? _wd1165 : (b.grid[_t1544] || -1))) === 1);
                                          }
                                          if (!(_c1545)) continue;
                                          if (!_g1522.includes(v_x)) _g1522.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1546 = union(_g1518, _g1522);
                                    for (let _i1547 = 0; _i1547 < _a1546.length; _i1547++) {
                                      const v_q = _a1546[_i1547];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q1486 = false;
                                        break Q1487;
                                      }
                                    }
                                  }
                                }
                                _c1548 = _q1486;
                              }
                              if (!((_c1548 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1549: number): boolean => {  return ((_te1549 === _wc1166 ? _wd1167 : (_te1549 === _wc1164 ? _wd1165 : (b.grid[_te1549] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g1550 = 0;
                              G1551: {
                                const _a1552 = sp.adj4[v_s];
                                for (let _i1553 = 0; _i1553 < _a1552.length; _i1553++) {
                                  const _t1554 = sp.adj4Edges[v_s][_i1553];
                                  if (!(((_t1554 === _wc1166 ? _wd1167 : (_t1554 === _wc1164 ? _wd1165 : (b.grid[_t1554] || -1))) === 1))) continue;
                                  _g1550++;
                                }
                              }
                              let _g1555 = 0;
                              G1556: {
                                for (let _i1557 = 0; _i1557 < 1; _i1557++) {
                                  const v_k = v_s;
                                  let _c1564: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1564) {
                                    let _c1563: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1563) {
                                      let _g1558 = 0;
                                      G1559: {
                                        const _t1560 = (clueAt(cl.number, v_k) + 1);
                                        const _a1561 = cluesValued(cl.number, _t1560);
                                        for (let _i1562 = 0; _i1562 < _a1561.length; _i1562++) {
                                          const v_x = _a1561[_i1562];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1558++;
                                        }
                                      }
                                      _c1563 = (_g1558 === 0);
                                    }
                                    _c1564 = _c1563;
                                  }
                                  if (!(_c1564)) continue;
                                  _g1555++;
                                }
                              }
                              let _c1667: boolean = ((_g1550 + 1) === (2 - _g1555));
                              if (!_c1667) {
                                let _q1565 = false;
                                Q1566: {
                                  const _a1567 = sp.adj4[v_s];
                                  const _n1568 = _i1451;
                                  for (let _i1569 = 0; _i1569 < _n1568; _i1569++) {
                                    const v_z = _a1567[_i1569];
                                    const _t1570 = sp.adj4Edges[v_s][_i1569];
                                    let _c1586: boolean = !((_t1570 === _wc1166 ? true : (_t1570 === _wc1164 ? true : (b.grid[_t1570] !== 0))));
                                    if (_c1586) {
                                      let _g1571 = 0;
                                      G1572: {
                                        const _a1573 = sp.adj4[v_s];
                                        for (let _i1574 = 0; _i1574 < _a1573.length; _i1574++) {
                                          const _t1575 = sp.adj4Edges[v_s][_i1574];
                                          if (!(((_t1575 === _wc1166 ? _wd1167 : (_t1575 === _wc1164 ? _wd1165 : (b.grid[_t1575] || -1))) === 1))) continue;
                                          _g1571++;
                                        }
                                      }
                                      let _g1576 = 0;
                                      G1577: {
                                        for (let _i1578 = 0; _i1578 < 1; _i1578++) {
                                          const v_k = v_s;
                                          let _c1585: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c1585) {
                                            let _c1584: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c1584) {
                                              let _g1579 = 0;
                                              G1580: {
                                                const _t1581 = (clueAt(cl.number, v_k) + 1);
                                                const _a1582 = cluesValued(cl.number, _t1581);
                                                for (let _i1583 = 0; _i1583 < _a1582.length; _i1583++) {
                                                  const v_x = _a1582[_i1583];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g1579++;
                                                }
                                              }
                                              _c1584 = (_g1579 === 0);
                                            }
                                            _c1585 = _c1584;
                                          }
                                          if (!(_c1585)) continue;
                                          _g1576++;
                                        }
                                      }
                                      _c1586 = (_g1571 < (2 - _g1576));
                                    }
                                    let _c1602: boolean = _c1586;
                                    if (_c1602) {
                                      let _g1587 = 0;
                                      G1588: {
                                        const _a1589 = sp.adj4[v_z];
                                        for (let _i1590 = 0; _i1590 < _a1589.length; _i1590++) {
                                          const _t1591 = sp.adj4Edges[v_z][_i1590];
                                          if (!(((_t1591 === _wc1166 ? _wd1167 : (_t1591 === _wc1164 ? _wd1165 : (b.grid[_t1591] || -1))) === 1))) continue;
                                          _g1587++;
                                        }
                                      }
                                      let _g1592 = 0;
                                      G1593: {
                                        for (let _i1594 = 0; _i1594 < 1; _i1594++) {
                                          const v_k = v_z;
                                          let _c1601: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c1601) {
                                            let _c1600: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c1600) {
                                              let _g1595 = 0;
                                              G1596: {
                                                const _t1597 = (clueAt(cl.number, v_k) + 1);
                                                const _a1598 = cluesValued(cl.number, _t1597);
                                                for (let _i1599 = 0; _i1599 < _a1598.length; _i1599++) {
                                                  const v_x = _a1598[_i1599];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g1595++;
                                                }
                                              }
                                              _c1600 = (_g1595 === 0);
                                            }
                                            _c1601 = _c1600;
                                          }
                                          if (!(_c1601)) continue;
                                          _g1592++;
                                        }
                                      }
                                      _c1602 = (_g1587 < (2 - _g1592));
                                    }
                                    let _c1665: boolean = _c1602;
                                    if (_c1665) {
                                      let _q1603 = true;
                                      Q1604: {
                                        const _g1605: number[] = [];
                                        G1606: {
                                          for (let _i1608 = 0; _i1608 < 1; _i1608++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g1605.push(v_x);
                                          }
                                        }
                                        const _g1609: number[] = [];
                                        G1610: {
                                          const _a1627 = throughWhere(sp, v_s, (_te1622: number): boolean => { let _c1624: boolean = ((_te1622 === _wc1166 ? _wd1167 : (_te1622 === _wc1164 ? _wd1165 : (b.grid[_te1622] || -1))) === 1); if (_c1624) {   const _t1623 = sp.edgeEnds[2 * _te1622];   _c1624 = !((clueAt(cl.number, _t1623) !== -1)); } let _c1626: boolean = _c1624; if (_c1626) {   const _t1625 = sp.edgeEnds[2 * _te1622 + 1];   _c1626 = !((clueAt(cl.number, _t1625) !== -1)); } return _c1626; });
                                          for (let _i1628 = 0; _i1628 < _a1627.length; _i1628++) {
                                            const v_t = _a1627[_i1628];
                                            const _a1629 = sp.adj4[v_t];
                                            for (let _i1630 = 0; _i1630 < _a1629.length; _i1630++) {
                                              const v_x = _a1629[_i1630];
                                              let _c1632: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c1632) {
                                                const _t1631 = sp.adj4Edges[v_t][_i1630];
                                                _c1632 = ((_t1631 === _wc1166 ? _wd1167 : (_t1631 === _wc1164 ? _wd1165 : (b.grid[_t1631] || -1))) === 1);
                                              }
                                              if (!(_c1632)) continue;
                                              if (!_g1609.includes(v_x)) _g1609.push(v_x);
                                            }
                                          }
                                        }
                                        const _a1633 = union(_g1605, _g1609);
                                        for (let _i1634 = 0; _i1634 < _a1633.length; _i1634++) {
                                          const v_p = _a1633[_i1634];
                                          const _g1635: number[] = [];
                                          G1636: {
                                            for (let _i1638 = 0; _i1638 < 1; _i1638++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g1635.push(v_x);
                                            }
                                          }
                                          const _g1639: number[] = [];
                                          G1640: {
                                            const _a1657 = throughWhere(sp, v_z, (_te1652: number): boolean => { let _c1654: boolean = ((_te1652 === _wc1166 ? _wd1167 : (_te1652 === _wc1164 ? _wd1165 : (b.grid[_te1652] || -1))) === 1); if (_c1654) {   const _t1653 = sp.edgeEnds[2 * _te1652];   _c1654 = !((clueAt(cl.number, _t1653) !== -1)); } let _c1656: boolean = _c1654; if (_c1656) {   const _t1655 = sp.edgeEnds[2 * _te1652 + 1];   _c1656 = !((clueAt(cl.number, _t1655) !== -1)); } return _c1656; });
                                            for (let _i1658 = 0; _i1658 < _a1657.length; _i1658++) {
                                              const v_t = _a1657[_i1658];
                                              const _a1659 = sp.adj4[v_t];
                                              for (let _i1660 = 0; _i1660 < _a1659.length; _i1660++) {
                                                const v_x = _a1659[_i1660];
                                                let _c1662: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c1662) {
                                                  const _t1661 = sp.adj4Edges[v_t][_i1660];
                                                  _c1662 = ((_t1661 === _wc1166 ? _wd1167 : (_t1661 === _wc1164 ? _wd1165 : (b.grid[_t1661] || -1))) === 1);
                                                }
                                                if (!(_c1662)) continue;
                                                if (!_g1639.includes(v_x)) _g1639.push(v_x);
                                              }
                                            }
                                          }
                                          const _a1663 = union(_g1635, _g1639);
                                          for (let _i1664 = 0; _i1664 < _a1663.length; _i1664++) {
                                            const v_q = _a1663[_i1664];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q1603 = false;
                                              break Q1604;
                                            }
                                          }
                                        }
                                      }
                                      _c1665 = _q1603;
                                    }
                                    if ((_c1665 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1666: number): boolean => {  return ((_te1666 === _wc1166 ? _wd1167 : (_te1666 === _wc1164 ? _wd1165 : (b.grid[_te1666] || -1))) === 1); }).includes(v_z))))) {
                                      _q1565 = true;
                                      break Q1566;
                                    }
                                  }
                                }
                                _c1667 = _q1565;
                              }
                              if (_c1667) {
                                _q1448 = true;
                                break Q1449;
                              }
                            }
                          }
                          _c1668 = !(_q1448);
                        }
                        if (_c1668) {
                          _q1429 = true;
                          break Q1430;
                        }
                      }
                    }
                    _c1669 = _q1429;
                  }
                  if (_c1669) {
                    _q1168 = true;
                    break Q1169;
                  }
                }
              }
              _c1670 = _q1168;
            }
            freshBinding("pairBreaks", [(sp.cells.includes(v_c)), ((takes(sp, cl, v_c) - _g1159) === 2), sameSet(v_U, ways(b, sp, cl, v_c)), (v_U.length === 3), (v_U.includes(v_k)), sameSet(v_I, minus(v_U, setOf(v_k))), (v_i === (v_I[0] ?? -1)), (v_j === (v_I[1] ?? -1)), _c1670], ["c in", "where of c", "U =", "where of U", "k in", "I =", "i =", "j =", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t1671 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t1671] !== 0)) { if (fire === null) { b.placeAt(_t1671, 1); changed = true; } else facts.push(PLACE, _t1671, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              let _wo1672: Witness | null = null;
              const _t1674 = ((throughWhere(sp, v_i, (_te1673: number): boolean => {  return ((b.grid[_te1673] || -1) === 1); }).includes(v_j)) || (_h535 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (_t1674) {
                let _wo1675: Witness | null = null;
                const _t1677 = (throughWhere(sp, v_i, (_te1676: number): boolean => {  return ((b.grid[_te1676] || -1) === 1); }).includes(v_j));
                if (_t1677) {
                  _wo1675 = { held: "arm", arm: 0, of: null };
                }
                if (!_t1677) {
                  _wo1675 = { held: "arm", arm: 1, of: null };
                }
                _wo1672 = { held: "arm", arm: 0, of: _wo1675 };
              }
              if (!_t1674) {
                const _wc1678 = sp.edgeOf(v_c, v_i);
                const _wd1679 = 1;
                const _wc1680 = sp.edgeOf(v_c, v_j);
                const _wd1681 = 1;
                let _wm1682: Witness | null = null;
                W1683: {
                  const _a1685 = throughWhere(sp, v_c, (_te1684: number): boolean => {  return ((_te1684 === _wc1680 ? _wd1681 : (_te1684 === _wc1678 ? _wd1679 : (b.grid[_te1684] || -1))) === 1); });
                  for (let _i1686 = 0; _i1686 < _a1685.length; _i1686++) {
                    const v_t = _a1685[_i1686];
                    let _c1705: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c1705) {
                      let _g1687 = 0;
                      G1688: {
                        const _a1689 = sp.adj4[v_t];
                        for (let _i1690 = 0; _i1690 < _a1689.length; _i1690++) {
                          const _t1691 = sp.adj4Edges[v_t][_i1690];
                          if (!(((_t1691 === _wc1680 ? _wd1681 : (_t1691 === _wc1678 ? _wd1679 : (b.grid[_t1691] || -1))) === 1))) continue;
                          _g1687++;
                        }
                      }
                      let _g1692 = 0;
                      G1693: {
                        for (let _i1694 = 0; _i1694 < 1; _i1694++) {
                          const v_k = v_t;
                          const _h1695 = clueAt(cl.number, v_k);
                          const _h1702 = (_h1695 + 1);
                          let _c1704: boolean = (_h1695 !== -1);
                          if (_c1704) {
                            let _c1703: boolean = (_h554 || (_h1695 === 1));
                            if (!_c1703) {
                              let _g1696 = 0;
                              G1697: {
                                const _t1698 = (_h1695 + 1);
                                const _a1699 = cluesValued(cl.number, _t1698);
                                for (let _i1700 = 0; _i1700 < _a1699.length; _i1700++) {
                                  const v_x = _a1699[_i1700];
                                  const _h1701 = clueAt(cl.number, v_x);
                                  if (!((_h1701 === _h1702))) continue;
                                  _g1696++;
                                }
                              }
                              _c1703 = (_g1696 === 0);
                            }
                            _c1704 = _c1703;
                          }
                          if (!(_c1704)) continue;
                          _g1692++;
                        }
                      }
                      _c1705 = (_g1687 < (2 - _g1692));
                    }
                    if (!(_c1705)) continue;
                    let _g1706 = 0;
                    G1707: {
                      const _a1708 = sp.adj4[v_t];
                      for (let _i1709 = 0; _i1709 < _a1708.length; _i1709++) {
                        const _t1710 = sp.adj4Edges[v_t][_i1709];
                        if (!(((_t1710 === _wc1680 ? _wd1681 : (_t1710 === _wc1678 ? _wd1679 : (b.grid[_t1710] || -1))) === 1))) continue;
                        _g1706++;
                      }
                    }
                    let _g1711 = 0;
                    G1712: {
                      for (let _i1713 = 0; _i1713 < 1; _i1713++) {
                        const v_k = v_t;
                        const _h1714 = clueAt(cl.number, v_k);
                        const _h1721 = (_h1714 + 1);
                        let _c1723: boolean = (_h1714 !== -1);
                        if (_c1723) {
                          let _c1722: boolean = (_h554 || (_h1714 === 1));
                          if (!_c1722) {
                            let _g1715 = 0;
                            G1716: {
                              const _t1717 = (_h1714 + 1);
                              const _a1718 = cluesValued(cl.number, _t1717);
                              for (let _i1719 = 0; _i1719 < _a1718.length; _i1719++) {
                                const v_x = _a1718[_i1719];
                                const _h1720 = clueAt(cl.number, v_x);
                                if (!((_h1720 === _h1721))) continue;
                                _g1715++;
                              }
                            }
                            _c1722 = (_g1715 === 0);
                          }
                          _c1723 = _c1722;
                        }
                        if (!(_c1723)) continue;
                        _g1711++;
                      }
                    }
                    let _c1991: boolean = (_g1706 < (2 - _g1711));
                    if (_c1991) {
                      let _q1724 = false;
                      Q1725: {
                        const _a1726 = sp.adj4[v_t];
                        for (let _i1727 = 0; _i1727 < _a1726.length; _i1727++) {
                          const v_y = _a1726[_i1727];
                          const _t1728 = sp.adj4Edges[v_t][_i1727];
                          let _c1747: boolean = !((_t1728 === _wc1680 ? true : (_t1728 === _wc1678 ? true : (b.grid[_t1728] !== 0))));
                          if (_c1747) {
                            let _g1729 = 0;
                            G1730: {
                              const _a1731 = sp.adj4[v_t];
                              for (let _i1732 = 0; _i1732 < _a1731.length; _i1732++) {
                                const _t1733 = sp.adj4Edges[v_t][_i1732];
                                if (!(((_t1733 === _wc1680 ? _wd1681 : (_t1733 === _wc1678 ? _wd1679 : (b.grid[_t1733] || -1))) === 1))) continue;
                                _g1729++;
                              }
                            }
                            let _g1734 = 0;
                            G1735: {
                              for (let _i1736 = 0; _i1736 < 1; _i1736++) {
                                const v_k = v_t;
                                const _h1737 = clueAt(cl.number, v_k);
                                const _h1744 = (_h1737 + 1);
                                let _c1746: boolean = (_h1737 !== -1);
                                if (_c1746) {
                                  let _c1745: boolean = (_h554 || (_h1737 === 1));
                                  if (!_c1745) {
                                    let _g1738 = 0;
                                    G1739: {
                                      const _t1740 = (_h1737 + 1);
                                      const _a1741 = cluesValued(cl.number, _t1740);
                                      for (let _i1742 = 0; _i1742 < _a1741.length; _i1742++) {
                                        const v_x = _a1741[_i1742];
                                        const _h1743 = clueAt(cl.number, v_x);
                                        if (!((_h1743 === _h1744))) continue;
                                        _g1738++;
                                      }
                                    }
                                    _c1745 = (_g1738 === 0);
                                  }
                                  _c1746 = _c1745;
                                }
                                if (!(_c1746)) continue;
                                _g1734++;
                              }
                            }
                            _c1747 = (_g1729 < (2 - _g1734));
                          }
                          let _c1767: boolean = _c1747;
                          if (_c1767) {
                            let _g1748 = 0;
                            G1749: {
                              const _a1751 = sp.adj4[v_y];
                              for (let _i1752 = 0; _i1752 < _a1751.length; _i1752++) {
                                const _t1753 = sp.adj4Edges[v_y][_i1752];
                                if (!(((_t1753 === _wc1680 ? _wd1681 : (_t1753 === _wc1678 ? _wd1679 : (b.grid[_t1753] || -1))) === 1))) continue;
                                _g1748++;
                              }
                            }
                            let _g1754 = 0;
                            G1755: {
                              for (let _i1756 = 0; _i1756 < 1; _i1756++) {
                                const v_k = v_y;
                                const _h1757 = clueAt(cl.number, v_k);
                                const _h1764 = (_h1757 + 1);
                                let _c1766: boolean = (_h1757 !== -1);
                                if (_c1766) {
                                  let _c1765: boolean = (_h554 || (_h1757 === 1));
                                  if (!_c1765) {
                                    let _g1758 = 0;
                                    G1759: {
                                      const _t1760 = (_h1757 + 1);
                                      const _a1761 = cluesValued(cl.number, _t1760);
                                      for (let _i1762 = 0; _i1762 < _a1761.length; _i1762++) {
                                        const v_x = _a1761[_i1762];
                                        const _h1763 = clueAt(cl.number, v_x);
                                        if (!((_h1763 === _h1764))) continue;
                                        _g1758++;
                                      }
                                    }
                                    _c1765 = (_g1758 === 0);
                                  }
                                  _c1766 = _c1765;
                                }
                                if (!(_c1766)) continue;
                                _g1754++;
                              }
                            }
                            _c1767 = (_g1748 < (2 - _g1754));
                          }
                          let _c1846: boolean = _c1767;
                          if (_c1846) {
                            let _q1768 = true;
                            Q1769: {
                              const _g1770: number[] = [];
                              G1771: {
                                for (let _i1773 = 0; _i1773 < 1; _i1773++) {
                                  const v_x = v_t;
                                  const _h1774 = clueAt(cl.number, v_x);
                                  if (!((_h1774 !== -1))) continue;
                                  _g1770.push(v_x);
                                }
                              }
                              const _g1775: number[] = [];
                              G1776: {
                                const _a1795 = throughWhere(sp, v_t, (_te1790: number): boolean => { let _c1792: boolean = ((_te1790 === _wc1680 ? _wd1681 : (_te1790 === _wc1678 ? _wd1679 : (b.grid[_te1790] || -1))) === 1); if (_c1792) {   const _t1791 = sp.edgeEnds[2 * _te1790];   _c1792 = !((clueAt(cl.number, _t1791) !== -1)); } let _c1794: boolean = _c1792; if (_c1794) {   const _t1793 = sp.edgeEnds[2 * _te1790 + 1];   _c1794 = !((clueAt(cl.number, _t1793) !== -1)); } return _c1794; });
                                for (let _i1796 = 0; _i1796 < _a1795.length; _i1796++) {
                                  const v_t_1789 = _a1795[_i1796];
                                  const _h1799 = clueAt(cl.number, v_t_1789);
                                  const _h1800 = (_h1799 !== -1);
                                  const _h1801 = _h1800;
                                  const _h1802 = !(_h1801);
                                  const _a1797 = sp.adj4[v_t_1789];
                                  for (let _i1798 = 0; _i1798 < _a1797.length; _i1798++) {
                                    const v_x = _a1797[_i1798];
                                    const _h1803 = clueAt(cl.number, v_x);
                                    let _c1805: boolean = (_h1802 && (_h1803 !== -1));
                                    if (_c1805) {
                                      const _t1804 = sp.adj4Edges[v_t_1789][_i1798];
                                      _c1805 = ((_t1804 === _wc1680 ? _wd1681 : (_t1804 === _wc1678 ? _wd1679 : (b.grid[_t1804] || -1))) === 1);
                                    }
                                    if (!(_c1805)) continue;
                                    if (!_g1775.includes(v_x)) _g1775.push(v_x);
                                  }
                                }
                              }
                              const _a1806 = union(_g1770, _g1775);
                              for (let _i1807 = 0; _i1807 < _a1806.length; _i1807++) {
                                const v_p = _a1806[_i1807];
                                const _h1844 = clueAt(cl.number, v_p);
                                const _g1808: number[] = [];
                                G1809: {
                                  for (let _i1811 = 0; _i1811 < 1; _i1811++) {
                                    const v_x = v_y;
                                    const _h1812 = clueAt(cl.number, v_x);
                                    if (!((_h1812 !== -1))) continue;
                                    _g1808.push(v_x);
                                  }
                                }
                                const _g1813: number[] = [];
                                G1814: {
                                  const _a1831 = throughWhere(sp, v_y, (_te1826: number): boolean => { let _c1828: boolean = ((_te1826 === _wc1680 ? _wd1681 : (_te1826 === _wc1678 ? _wd1679 : (b.grid[_te1826] || -1))) === 1); if (_c1828) {   const _t1827 = sp.edgeEnds[2 * _te1826];   _c1828 = !((clueAt(cl.number, _t1827) !== -1)); } let _c1830: boolean = _c1828; if (_c1830) {   const _t1829 = sp.edgeEnds[2 * _te1826 + 1];   _c1830 = !((clueAt(cl.number, _t1829) !== -1)); } return _c1830; });
                                  for (let _i1832 = 0; _i1832 < _a1831.length; _i1832++) {
                                    const v_t = _a1831[_i1832];
                                    const _h1835 = clueAt(cl.number, v_t);
                                    const _h1836 = (_h1835 !== -1);
                                    const _h1837 = _h1836;
                                    const _h1838 = !(_h1837);
                                    const _a1833 = sp.adj4[v_t];
                                    for (let _i1834 = 0; _i1834 < _a1833.length; _i1834++) {
                                      const v_x = _a1833[_i1834];
                                      const _h1839 = clueAt(cl.number, v_x);
                                      let _c1841: boolean = (_h1838 && (_h1839 !== -1));
                                      if (_c1841) {
                                        const _t1840 = sp.adj4Edges[v_t][_i1834];
                                        _c1841 = ((_t1840 === _wc1680 ? _wd1681 : (_t1840 === _wc1678 ? _wd1679 : (b.grid[_t1840] || -1))) === 1);
                                      }
                                      if (!(_c1841)) continue;
                                      if (!_g1813.includes(v_x)) _g1813.push(v_x);
                                    }
                                  }
                                }
                                const _a1842 = union(_g1808, _g1813);
                                for (let _i1843 = 0; _i1843 < _a1842.length; _i1843++) {
                                  const v_q = _a1842[_i1843];
                                  const _h1845 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1844 - _h1845)) === cl.step))) {
                                    _q1768 = false;
                                    break Q1769;
                                  }
                                }
                              }
                            }
                            _c1846 = _q1768;
                          }
                          if (!((_c1846 && (_h554 || !(throughWhere(sp, v_t, (_te1847: number): boolean => {  return ((_te1847 === _wc1680 ? _wd1681 : (_te1847 === _wc1678 ? _wd1679 : (b.grid[_te1847] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g1848 = 0;
                          G1849: {
                            const _a1850 = sp.adj4[v_t];
                            for (let _i1851 = 0; _i1851 < _a1850.length; _i1851++) {
                              const _t1852 = sp.adj4Edges[v_t][_i1851];
                              if (!(((_t1852 === _wc1680 ? _wd1681 : (_t1852 === _wc1678 ? _wd1679 : (b.grid[_t1852] || -1))) === 1))) continue;
                              _g1848++;
                            }
                          }
                          let _g1853 = 0;
                          G1854: {
                            for (let _i1855 = 0; _i1855 < 1; _i1855++) {
                              const v_k = v_t;
                              const _h1856 = clueAt(cl.number, v_k);
                              const _h1863 = (_h1856 + 1);
                              let _c1865: boolean = (_h1856 !== -1);
                              if (_c1865) {
                                let _c1864: boolean = (_h554 || (_h1856 === 1));
                                if (!_c1864) {
                                  let _g1857 = 0;
                                  G1858: {
                                    const _t1859 = (_h1856 + 1);
                                    const _a1860 = cluesValued(cl.number, _t1859);
                                    for (let _i1861 = 0; _i1861 < _a1860.length; _i1861++) {
                                      const v_x = _a1860[_i1861];
                                      const _h1862 = clueAt(cl.number, v_x);
                                      if (!((_h1862 === _h1863))) continue;
                                      _g1857++;
                                    }
                                  }
                                  _c1864 = (_g1857 === 0);
                                }
                                _c1865 = _c1864;
                              }
                              if (!(_c1865)) continue;
                              _g1853++;
                            }
                          }
                          let _c1990: boolean = ((_g1848 + 1) === (2 - _g1853));
                          if (!_c1990) {
                            let _q1866 = false;
                            Q1867: {
                              const _a1868 = sp.adj4[v_t];
                              const _n1869 = _i1727;
                              for (let _i1870 = 0; _i1870 < _n1869; _i1870++) {
                                const v_z = _a1868[_i1870];
                                const _t1871 = sp.adj4Edges[v_t][_i1870];
                                let _c1890: boolean = !((_t1871 === _wc1680 ? true : (_t1871 === _wc1678 ? true : (b.grid[_t1871] !== 0))));
                                if (_c1890) {
                                  let _g1872 = 0;
                                  G1873: {
                                    const _a1874 = sp.adj4[v_t];
                                    for (let _i1875 = 0; _i1875 < _a1874.length; _i1875++) {
                                      const _t1876 = sp.adj4Edges[v_t][_i1875];
                                      if (!(((_t1876 === _wc1680 ? _wd1681 : (_t1876 === _wc1678 ? _wd1679 : (b.grid[_t1876] || -1))) === 1))) continue;
                                      _g1872++;
                                    }
                                  }
                                  let _g1877 = 0;
                                  G1878: {
                                    for (let _i1879 = 0; _i1879 < 1; _i1879++) {
                                      const v_k = v_t;
                                      const _h1880 = clueAt(cl.number, v_k);
                                      const _h1887 = (_h1880 + 1);
                                      let _c1889: boolean = (_h1880 !== -1);
                                      if (_c1889) {
                                        let _c1888: boolean = (_h554 || (_h1880 === 1));
                                        if (!_c1888) {
                                          let _g1881 = 0;
                                          G1882: {
                                            const _t1883 = (_h1880 + 1);
                                            const _a1884 = cluesValued(cl.number, _t1883);
                                            for (let _i1885 = 0; _i1885 < _a1884.length; _i1885++) {
                                              const v_x = _a1884[_i1885];
                                              const _h1886 = clueAt(cl.number, v_x);
                                              if (!((_h1886 === _h1887))) continue;
                                              _g1881++;
                                            }
                                          }
                                          _c1888 = (_g1881 === 0);
                                        }
                                        _c1889 = _c1888;
                                      }
                                      if (!(_c1889)) continue;
                                      _g1877++;
                                    }
                                  }
                                  _c1890 = (_g1872 < (2 - _g1877));
                                }
                                let _c1909: boolean = _c1890;
                                if (_c1909) {
                                  let _g1891 = 0;
                                  G1892: {
                                    const _a1893 = sp.adj4[v_z];
                                    for (let _i1894 = 0; _i1894 < _a1893.length; _i1894++) {
                                      const _t1895 = sp.adj4Edges[v_z][_i1894];
                                      if (!(((_t1895 === _wc1680 ? _wd1681 : (_t1895 === _wc1678 ? _wd1679 : (b.grid[_t1895] || -1))) === 1))) continue;
                                      _g1891++;
                                    }
                                  }
                                  let _g1896 = 0;
                                  G1897: {
                                    for (let _i1898 = 0; _i1898 < 1; _i1898++) {
                                      const v_k = v_z;
                                      const _h1899 = clueAt(cl.number, v_k);
                                      const _h1906 = (_h1899 + 1);
                                      let _c1908: boolean = (_h1899 !== -1);
                                      if (_c1908) {
                                        let _c1907: boolean = (_h554 || (_h1899 === 1));
                                        if (!_c1907) {
                                          let _g1900 = 0;
                                          G1901: {
                                            const _t1902 = (_h1899 + 1);
                                            const _a1903 = cluesValued(cl.number, _t1902);
                                            for (let _i1904 = 0; _i1904 < _a1903.length; _i1904++) {
                                              const v_x = _a1903[_i1904];
                                              const _h1905 = clueAt(cl.number, v_x);
                                              if (!((_h1905 === _h1906))) continue;
                                              _g1900++;
                                            }
                                          }
                                          _c1907 = (_g1900 === 0);
                                        }
                                        _c1908 = _c1907;
                                      }
                                      if (!(_c1908)) continue;
                                      _g1896++;
                                    }
                                  }
                                  _c1909 = (_g1891 < (2 - _g1896));
                                }
                                let _c1988: boolean = _c1909;
                                if (_c1988) {
                                  let _q1910 = true;
                                  Q1911: {
                                    const _g1912: number[] = [];
                                    G1913: {
                                      for (let _i1915 = 0; _i1915 < 1; _i1915++) {
                                        const v_x = v_t;
                                        const _h1916 = clueAt(cl.number, v_x);
                                        if (!((_h1916 !== -1))) continue;
                                        _g1912.push(v_x);
                                      }
                                    }
                                    const _g1917: number[] = [];
                                    G1918: {
                                      const _a1937 = throughWhere(sp, v_t, (_te1932: number): boolean => { let _c1934: boolean = ((_te1932 === _wc1680 ? _wd1681 : (_te1932 === _wc1678 ? _wd1679 : (b.grid[_te1932] || -1))) === 1); if (_c1934) {   const _t1933 = sp.edgeEnds[2 * _te1932];   _c1934 = !((clueAt(cl.number, _t1933) !== -1)); } let _c1936: boolean = _c1934; if (_c1936) {   const _t1935 = sp.edgeEnds[2 * _te1932 + 1];   _c1936 = !((clueAt(cl.number, _t1935) !== -1)); } return _c1936; });
                                      for (let _i1938 = 0; _i1938 < _a1937.length; _i1938++) {
                                        const v_t_1931 = _a1937[_i1938];
                                        const _h1941 = clueAt(cl.number, v_t_1931);
                                        const _h1942 = (_h1941 !== -1);
                                        const _h1943 = _h1942;
                                        const _h1944 = !(_h1943);
                                        const _a1939 = sp.adj4[v_t_1931];
                                        for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
                                          const v_x = _a1939[_i1940];
                                          const _h1945 = clueAt(cl.number, v_x);
                                          let _c1947: boolean = (_h1944 && (_h1945 !== -1));
                                          if (_c1947) {
                                            const _t1946 = sp.adj4Edges[v_t_1931][_i1940];
                                            _c1947 = ((_t1946 === _wc1680 ? _wd1681 : (_t1946 === _wc1678 ? _wd1679 : (b.grid[_t1946] || -1))) === 1);
                                          }
                                          if (!(_c1947)) continue;
                                          if (!_g1917.includes(v_x)) _g1917.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1948 = union(_g1912, _g1917);
                                    for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
                                      const v_p = _a1948[_i1949];
                                      const _h1986 = clueAt(cl.number, v_p);
                                      const _g1950: number[] = [];
                                      G1951: {
                                        for (let _i1953 = 0; _i1953 < 1; _i1953++) {
                                          const v_x = v_z;
                                          const _h1954 = clueAt(cl.number, v_x);
                                          if (!((_h1954 !== -1))) continue;
                                          _g1950.push(v_x);
                                        }
                                      }
                                      const _g1955: number[] = [];
                                      G1956: {
                                        const _a1973 = throughWhere(sp, v_z, (_te1968: number): boolean => { let _c1970: boolean = ((_te1968 === _wc1680 ? _wd1681 : (_te1968 === _wc1678 ? _wd1679 : (b.grid[_te1968] || -1))) === 1); if (_c1970) {   const _t1969 = sp.edgeEnds[2 * _te1968];   _c1970 = !((clueAt(cl.number, _t1969) !== -1)); } let _c1972: boolean = _c1970; if (_c1972) {   const _t1971 = sp.edgeEnds[2 * _te1968 + 1];   _c1972 = !((clueAt(cl.number, _t1971) !== -1)); } return _c1972; });
                                        for (let _i1974 = 0; _i1974 < _a1973.length; _i1974++) {
                                          const v_t = _a1973[_i1974];
                                          const _h1977 = clueAt(cl.number, v_t);
                                          const _h1978 = (_h1977 !== -1);
                                          const _h1979 = _h1978;
                                          const _h1980 = !(_h1979);
                                          const _a1975 = sp.adj4[v_t];
                                          for (let _i1976 = 0; _i1976 < _a1975.length; _i1976++) {
                                            const v_x = _a1975[_i1976];
                                            const _h1981 = clueAt(cl.number, v_x);
                                            let _c1983: boolean = (_h1980 && (_h1981 !== -1));
                                            if (_c1983) {
                                              const _t1982 = sp.adj4Edges[v_t][_i1976];
                                              _c1983 = ((_t1982 === _wc1680 ? _wd1681 : (_t1982 === _wc1678 ? _wd1679 : (b.grid[_t1982] || -1))) === 1);
                                            }
                                            if (!(_c1983)) continue;
                                            if (!_g1955.includes(v_x)) _g1955.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1984 = union(_g1950, _g1955);
                                      for (let _i1985 = 0; _i1985 < _a1984.length; _i1985++) {
                                        const v_q = _a1984[_i1985];
                                        const _h1987 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1986 - _h1987)) === cl.step))) {
                                          _q1910 = false;
                                          break Q1911;
                                        }
                                      }
                                    }
                                  }
                                  _c1988 = _q1910;
                                }
                                if ((_c1988 && (_h554 || !(throughWhere(sp, v_t, (_te1989: number): boolean => {  return ((_te1989 === _wc1680 ? _wd1681 : (_te1989 === _wc1678 ? _wd1679 : (b.grid[_te1989] || -1))) === 1); }).includes(v_z))))) {
                                  _q1866 = true;
                                  break Q1867;
                                }
                              }
                            }
                            _c1990 = _q1866;
                          }
                          if (_c1990) {
                            _q1724 = true;
                            break Q1725;
                          }
                        }
                      }
                      _c1991 = !(_q1724);
                    }
                    let _c2278: boolean = _c1991;
                    if (!_c2278) {
                      let _q1992 = false;
                      Q1993: {
                        const _a1994 = sp.adj4[v_t];
                        for (let _i1995 = 0; _i1995 < _a1994.length; _i1995++) {
                          const v_s = _a1994[_i1995];
                          let _g1996 = 0;
                          G1997: {
                            const _a1998 = sp.adj4[v_s];
                            for (let _i1999 = 0; _i1999 < _a1998.length; _i1999++) {
                              const _t2000 = sp.adj4Edges[v_s][_i1999];
                              if (!(((_t2000 === _wc1680 ? _wd1681 : (_t2000 === _wc1678 ? _wd1679 : (b.grid[_t2000] || -1))) === 1))) continue;
                              _g1996++;
                            }
                          }
                          let _g2001 = 0;
                          G2002: {
                            for (let _i2003 = 0; _i2003 < 1; _i2003++) {
                              const v_k = v_s;
                              const _h2004 = clueAt(cl.number, v_k);
                              const _h2011 = (_h2004 + 1);
                              let _c2013: boolean = (_h2004 !== -1);
                              if (_c2013) {
                                let _c2012: boolean = (_h554 || (_h2004 === 1));
                                if (!_c2012) {
                                  let _g2005 = 0;
                                  G2006: {
                                    const _t2007 = (_h2004 + 1);
                                    const _a2008 = cluesValued(cl.number, _t2007);
                                    for (let _i2009 = 0; _i2009 < _a2008.length; _i2009++) {
                                      const v_x = _a2008[_i2009];
                                      const _h2010 = clueAt(cl.number, v_x);
                                      if (!((_h2010 === _h2011))) continue;
                                      _g2005++;
                                    }
                                  }
                                  _c2012 = (_g2005 === 0);
                                }
                                _c2013 = _c2012;
                              }
                              if (!(_c2013)) continue;
                              _g2001++;
                            }
                          }
                          let _c2277: boolean = (_g1996 < (2 - _g2001));
                          if (_c2277) {
                            let _q2014 = false;
                            Q2015: {
                              const _a2016 = sp.adj4[v_s];
                              for (let _i2017 = 0; _i2017 < _a2016.length; _i2017++) {
                                const v_y = _a2016[_i2017];
                                const _t2018 = sp.adj4Edges[v_s][_i2017];
                                let _c2037: boolean = !((_t2018 === _wc1680 ? true : (_t2018 === _wc1678 ? true : (b.grid[_t2018] !== 0))));
                                if (_c2037) {
                                  let _g2019 = 0;
                                  G2020: {
                                    const _a2021 = sp.adj4[v_s];
                                    for (let _i2022 = 0; _i2022 < _a2021.length; _i2022++) {
                                      const _t2023 = sp.adj4Edges[v_s][_i2022];
                                      if (!(((_t2023 === _wc1680 ? _wd1681 : (_t2023 === _wc1678 ? _wd1679 : (b.grid[_t2023] || -1))) === 1))) continue;
                                      _g2019++;
                                    }
                                  }
                                  let _g2024 = 0;
                                  G2025: {
                                    for (let _i2026 = 0; _i2026 < 1; _i2026++) {
                                      const v_k = v_s;
                                      const _h2027 = clueAt(cl.number, v_k);
                                      const _h2034 = (_h2027 + 1);
                                      let _c2036: boolean = (_h2027 !== -1);
                                      if (_c2036) {
                                        let _c2035: boolean = (_h554 || (_h2027 === 1));
                                        if (!_c2035) {
                                          let _g2028 = 0;
                                          G2029: {
                                            const _t2030 = (_h2027 + 1);
                                            const _a2031 = cluesValued(cl.number, _t2030);
                                            for (let _i2032 = 0; _i2032 < _a2031.length; _i2032++) {
                                              const v_x = _a2031[_i2032];
                                              const _h2033 = clueAt(cl.number, v_x);
                                              if (!((_h2033 === _h2034))) continue;
                                              _g2028++;
                                            }
                                          }
                                          _c2035 = (_g2028 === 0);
                                        }
                                        _c2036 = _c2035;
                                      }
                                      if (!(_c2036)) continue;
                                      _g2024++;
                                    }
                                  }
                                  _c2037 = (_g2019 < (2 - _g2024));
                                }
                                let _c2057: boolean = _c2037;
                                if (_c2057) {
                                  let _g2038 = 0;
                                  G2039: {
                                    const _a2041 = sp.adj4[v_y];
                                    for (let _i2042 = 0; _i2042 < _a2041.length; _i2042++) {
                                      const _t2043 = sp.adj4Edges[v_y][_i2042];
                                      if (!(((_t2043 === _wc1680 ? _wd1681 : (_t2043 === _wc1678 ? _wd1679 : (b.grid[_t2043] || -1))) === 1))) continue;
                                      _g2038++;
                                    }
                                  }
                                  let _g2044 = 0;
                                  G2045: {
                                    for (let _i2046 = 0; _i2046 < 1; _i2046++) {
                                      const v_k = v_y;
                                      const _h2047 = clueAt(cl.number, v_k);
                                      const _h2054 = (_h2047 + 1);
                                      let _c2056: boolean = (_h2047 !== -1);
                                      if (_c2056) {
                                        let _c2055: boolean = (_h554 || (_h2047 === 1));
                                        if (!_c2055) {
                                          let _g2048 = 0;
                                          G2049: {
                                            const _t2050 = (_h2047 + 1);
                                            const _a2051 = cluesValued(cl.number, _t2050);
                                            for (let _i2052 = 0; _i2052 < _a2051.length; _i2052++) {
                                              const v_x = _a2051[_i2052];
                                              const _h2053 = clueAt(cl.number, v_x);
                                              if (!((_h2053 === _h2054))) continue;
                                              _g2048++;
                                            }
                                          }
                                          _c2055 = (_g2048 === 0);
                                        }
                                        _c2056 = _c2055;
                                      }
                                      if (!(_c2056)) continue;
                                      _g2044++;
                                    }
                                  }
                                  _c2057 = (_g2038 < (2 - _g2044));
                                }
                                let _c2134: boolean = _c2057;
                                if (_c2134) {
                                  let _q2058 = true;
                                  Q2059: {
                                    const _g2060: number[] = [];
                                    G2061: {
                                      for (let _i2063 = 0; _i2063 < 1; _i2063++) {
                                        const v_x = v_s;
                                        const _h2064 = clueAt(cl.number, v_x);
                                        if (!((_h2064 !== -1))) continue;
                                        _g2060.push(v_x);
                                      }
                                    }
                                    const _g2065: number[] = [];
                                    G2066: {
                                      const _a2083 = throughWhere(sp, v_s, (_te2078: number): boolean => { let _c2080: boolean = ((_te2078 === _wc1680 ? _wd1681 : (_te2078 === _wc1678 ? _wd1679 : (b.grid[_te2078] || -1))) === 1); if (_c2080) {   const _t2079 = sp.edgeEnds[2 * _te2078];   _c2080 = !((clueAt(cl.number, _t2079) !== -1)); } let _c2082: boolean = _c2080; if (_c2082) {   const _t2081 = sp.edgeEnds[2 * _te2078 + 1];   _c2082 = !((clueAt(cl.number, _t2081) !== -1)); } return _c2082; });
                                      for (let _i2084 = 0; _i2084 < _a2083.length; _i2084++) {
                                        const v_t = _a2083[_i2084];
                                        const _h2087 = clueAt(cl.number, v_t);
                                        const _h2088 = (_h2087 !== -1);
                                        const _h2089 = _h2088;
                                        const _h2090 = !(_h2089);
                                        const _a2085 = sp.adj4[v_t];
                                        for (let _i2086 = 0; _i2086 < _a2085.length; _i2086++) {
                                          const v_x = _a2085[_i2086];
                                          const _h2091 = clueAt(cl.number, v_x);
                                          let _c2093: boolean = (_h2090 && (_h2091 !== -1));
                                          if (_c2093) {
                                            const _t2092 = sp.adj4Edges[v_t][_i2086];
                                            _c2093 = ((_t2092 === _wc1680 ? _wd1681 : (_t2092 === _wc1678 ? _wd1679 : (b.grid[_t2092] || -1))) === 1);
                                          }
                                          if (!(_c2093)) continue;
                                          if (!_g2065.includes(v_x)) _g2065.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2094 = union(_g2060, _g2065);
                                    for (let _i2095 = 0; _i2095 < _a2094.length; _i2095++) {
                                      const v_p = _a2094[_i2095];
                                      const _h2132 = clueAt(cl.number, v_p);
                                      const _g2096: number[] = [];
                                      G2097: {
                                        for (let _i2099 = 0; _i2099 < 1; _i2099++) {
                                          const v_x = v_y;
                                          const _h2100 = clueAt(cl.number, v_x);
                                          if (!((_h2100 !== -1))) continue;
                                          _g2096.push(v_x);
                                        }
                                      }
                                      const _g2101: number[] = [];
                                      G2102: {
                                        const _a2119 = throughWhere(sp, v_y, (_te2114: number): boolean => { let _c2116: boolean = ((_te2114 === _wc1680 ? _wd1681 : (_te2114 === _wc1678 ? _wd1679 : (b.grid[_te2114] || -1))) === 1); if (_c2116) {   const _t2115 = sp.edgeEnds[2 * _te2114];   _c2116 = !((clueAt(cl.number, _t2115) !== -1)); } let _c2118: boolean = _c2116; if (_c2118) {   const _t2117 = sp.edgeEnds[2 * _te2114 + 1];   _c2118 = !((clueAt(cl.number, _t2117) !== -1)); } return _c2118; });
                                        for (let _i2120 = 0; _i2120 < _a2119.length; _i2120++) {
                                          const v_t = _a2119[_i2120];
                                          const _h2123 = clueAt(cl.number, v_t);
                                          const _h2124 = (_h2123 !== -1);
                                          const _h2125 = _h2124;
                                          const _h2126 = !(_h2125);
                                          const _a2121 = sp.adj4[v_t];
                                          for (let _i2122 = 0; _i2122 < _a2121.length; _i2122++) {
                                            const v_x = _a2121[_i2122];
                                            const _h2127 = clueAt(cl.number, v_x);
                                            let _c2129: boolean = (_h2126 && (_h2127 !== -1));
                                            if (_c2129) {
                                              const _t2128 = sp.adj4Edges[v_t][_i2122];
                                              _c2129 = ((_t2128 === _wc1680 ? _wd1681 : (_t2128 === _wc1678 ? _wd1679 : (b.grid[_t2128] || -1))) === 1);
                                            }
                                            if (!(_c2129)) continue;
                                            if (!_g2101.includes(v_x)) _g2101.push(v_x);
                                          }
                                        }
                                      }
                                      const _a2130 = union(_g2096, _g2101);
                                      for (let _i2131 = 0; _i2131 < _a2130.length; _i2131++) {
                                        const v_q = _a2130[_i2131];
                                        const _h2133 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h2132 - _h2133)) === cl.step))) {
                                          _q2058 = false;
                                          break Q2059;
                                        }
                                      }
                                    }
                                  }
                                  _c2134 = _q2058;
                                }
                                if (!((_c2134 && (_h554 || !(throughWhere(sp, v_s, (_te2135: number): boolean => {  return ((_te2135 === _wc1680 ? _wd1681 : (_te2135 === _wc1678 ? _wd1679 : (b.grid[_te2135] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g2136 = 0;
                                G2137: {
                                  const _a2138 = sp.adj4[v_s];
                                  for (let _i2139 = 0; _i2139 < _a2138.length; _i2139++) {
                                    const _t2140 = sp.adj4Edges[v_s][_i2139];
                                    if (!(((_t2140 === _wc1680 ? _wd1681 : (_t2140 === _wc1678 ? _wd1679 : (b.grid[_t2140] || -1))) === 1))) continue;
                                    _g2136++;
                                  }
                                }
                                let _g2141 = 0;
                                G2142: {
                                  for (let _i2143 = 0; _i2143 < 1; _i2143++) {
                                    const v_k = v_s;
                                    const _h2144 = clueAt(cl.number, v_k);
                                    const _h2151 = (_h2144 + 1);
                                    let _c2153: boolean = (_h2144 !== -1);
                                    if (_c2153) {
                                      let _c2152: boolean = (_h554 || (_h2144 === 1));
                                      if (!_c2152) {
                                        let _g2145 = 0;
                                        G2146: {
                                          const _t2147 = (_h2144 + 1);
                                          const _a2148 = cluesValued(cl.number, _t2147);
                                          for (let _i2149 = 0; _i2149 < _a2148.length; _i2149++) {
                                            const v_x = _a2148[_i2149];
                                            const _h2150 = clueAt(cl.number, v_x);
                                            if (!((_h2150 === _h2151))) continue;
                                            _g2145++;
                                          }
                                        }
                                        _c2152 = (_g2145 === 0);
                                      }
                                      _c2153 = _c2152;
                                    }
                                    if (!(_c2153)) continue;
                                    _g2141++;
                                  }
                                }
                                let _c2276: boolean = ((_g2136 + 1) === (2 - _g2141));
                                if (!_c2276) {
                                  let _q2154 = false;
                                  Q2155: {
                                    const _a2156 = sp.adj4[v_s];
                                    const _n2157 = _i2017;
                                    for (let _i2158 = 0; _i2158 < _n2157; _i2158++) {
                                      const v_z = _a2156[_i2158];
                                      const _t2159 = sp.adj4Edges[v_s][_i2158];
                                      let _c2178: boolean = !((_t2159 === _wc1680 ? true : (_t2159 === _wc1678 ? true : (b.grid[_t2159] !== 0))));
                                      if (_c2178) {
                                        let _g2160 = 0;
                                        G2161: {
                                          const _a2162 = sp.adj4[v_s];
                                          for (let _i2163 = 0; _i2163 < _a2162.length; _i2163++) {
                                            const _t2164 = sp.adj4Edges[v_s][_i2163];
                                            if (!(((_t2164 === _wc1680 ? _wd1681 : (_t2164 === _wc1678 ? _wd1679 : (b.grid[_t2164] || -1))) === 1))) continue;
                                            _g2160++;
                                          }
                                        }
                                        let _g2165 = 0;
                                        G2166: {
                                          for (let _i2167 = 0; _i2167 < 1; _i2167++) {
                                            const v_k = v_s;
                                            const _h2168 = clueAt(cl.number, v_k);
                                            const _h2175 = (_h2168 + 1);
                                            let _c2177: boolean = (_h2168 !== -1);
                                            if (_c2177) {
                                              let _c2176: boolean = (_h554 || (_h2168 === 1));
                                              if (!_c2176) {
                                                let _g2169 = 0;
                                                G2170: {
                                                  const _t2171 = (_h2168 + 1);
                                                  const _a2172 = cluesValued(cl.number, _t2171);
                                                  for (let _i2173 = 0; _i2173 < _a2172.length; _i2173++) {
                                                    const v_x = _a2172[_i2173];
                                                    const _h2174 = clueAt(cl.number, v_x);
                                                    if (!((_h2174 === _h2175))) continue;
                                                    _g2169++;
                                                  }
                                                }
                                                _c2176 = (_g2169 === 0);
                                              }
                                              _c2177 = _c2176;
                                            }
                                            if (!(_c2177)) continue;
                                            _g2165++;
                                          }
                                        }
                                        _c2178 = (_g2160 < (2 - _g2165));
                                      }
                                      let _c2197: boolean = _c2178;
                                      if (_c2197) {
                                        let _g2179 = 0;
                                        G2180: {
                                          const _a2181 = sp.adj4[v_z];
                                          for (let _i2182 = 0; _i2182 < _a2181.length; _i2182++) {
                                            const _t2183 = sp.adj4Edges[v_z][_i2182];
                                            if (!(((_t2183 === _wc1680 ? _wd1681 : (_t2183 === _wc1678 ? _wd1679 : (b.grid[_t2183] || -1))) === 1))) continue;
                                            _g2179++;
                                          }
                                        }
                                        let _g2184 = 0;
                                        G2185: {
                                          for (let _i2186 = 0; _i2186 < 1; _i2186++) {
                                            const v_k = v_z;
                                            const _h2187 = clueAt(cl.number, v_k);
                                            const _h2194 = (_h2187 + 1);
                                            let _c2196: boolean = (_h2187 !== -1);
                                            if (_c2196) {
                                              let _c2195: boolean = (_h554 || (_h2187 === 1));
                                              if (!_c2195) {
                                                let _g2188 = 0;
                                                G2189: {
                                                  const _t2190 = (_h2187 + 1);
                                                  const _a2191 = cluesValued(cl.number, _t2190);
                                                  for (let _i2192 = 0; _i2192 < _a2191.length; _i2192++) {
                                                    const v_x = _a2191[_i2192];
                                                    const _h2193 = clueAt(cl.number, v_x);
                                                    if (!((_h2193 === _h2194))) continue;
                                                    _g2188++;
                                                  }
                                                }
                                                _c2195 = (_g2188 === 0);
                                              }
                                              _c2196 = _c2195;
                                            }
                                            if (!(_c2196)) continue;
                                            _g2184++;
                                          }
                                        }
                                        _c2197 = (_g2179 < (2 - _g2184));
                                      }
                                      let _c2274: boolean = _c2197;
                                      if (_c2274) {
                                        let _q2198 = true;
                                        Q2199: {
                                          const _g2200: number[] = [];
                                          G2201: {
                                            for (let _i2203 = 0; _i2203 < 1; _i2203++) {
                                              const v_x = v_s;
                                              const _h2204 = clueAt(cl.number, v_x);
                                              if (!((_h2204 !== -1))) continue;
                                              _g2200.push(v_x);
                                            }
                                          }
                                          const _g2205: number[] = [];
                                          G2206: {
                                            const _a2223 = throughWhere(sp, v_s, (_te2218: number): boolean => { let _c2220: boolean = ((_te2218 === _wc1680 ? _wd1681 : (_te2218 === _wc1678 ? _wd1679 : (b.grid[_te2218] || -1))) === 1); if (_c2220) {   const _t2219 = sp.edgeEnds[2 * _te2218];   _c2220 = !((clueAt(cl.number, _t2219) !== -1)); } let _c2222: boolean = _c2220; if (_c2222) {   const _t2221 = sp.edgeEnds[2 * _te2218 + 1];   _c2222 = !((clueAt(cl.number, _t2221) !== -1)); } return _c2222; });
                                            for (let _i2224 = 0; _i2224 < _a2223.length; _i2224++) {
                                              const v_t = _a2223[_i2224];
                                              const _h2227 = clueAt(cl.number, v_t);
                                              const _h2228 = (_h2227 !== -1);
                                              const _h2229 = _h2228;
                                              const _h2230 = !(_h2229);
                                              const _a2225 = sp.adj4[v_t];
                                              for (let _i2226 = 0; _i2226 < _a2225.length; _i2226++) {
                                                const v_x = _a2225[_i2226];
                                                const _h2231 = clueAt(cl.number, v_x);
                                                let _c2233: boolean = (_h2230 && (_h2231 !== -1));
                                                if (_c2233) {
                                                  const _t2232 = sp.adj4Edges[v_t][_i2226];
                                                  _c2233 = ((_t2232 === _wc1680 ? _wd1681 : (_t2232 === _wc1678 ? _wd1679 : (b.grid[_t2232] || -1))) === 1);
                                                }
                                                if (!(_c2233)) continue;
                                                if (!_g2205.includes(v_x)) _g2205.push(v_x);
                                              }
                                            }
                                          }
                                          const _a2234 = union(_g2200, _g2205);
                                          for (let _i2235 = 0; _i2235 < _a2234.length; _i2235++) {
                                            const v_p = _a2234[_i2235];
                                            const _h2272 = clueAt(cl.number, v_p);
                                            const _g2236: number[] = [];
                                            G2237: {
                                              for (let _i2239 = 0; _i2239 < 1; _i2239++) {
                                                const v_x = v_z;
                                                const _h2240 = clueAt(cl.number, v_x);
                                                if (!((_h2240 !== -1))) continue;
                                                _g2236.push(v_x);
                                              }
                                            }
                                            const _g2241: number[] = [];
                                            G2242: {
                                              const _a2259 = throughWhere(sp, v_z, (_te2254: number): boolean => { let _c2256: boolean = ((_te2254 === _wc1680 ? _wd1681 : (_te2254 === _wc1678 ? _wd1679 : (b.grid[_te2254] || -1))) === 1); if (_c2256) {   const _t2255 = sp.edgeEnds[2 * _te2254];   _c2256 = !((clueAt(cl.number, _t2255) !== -1)); } let _c2258: boolean = _c2256; if (_c2258) {   const _t2257 = sp.edgeEnds[2 * _te2254 + 1];   _c2258 = !((clueAt(cl.number, _t2257) !== -1)); } return _c2258; });
                                              for (let _i2260 = 0; _i2260 < _a2259.length; _i2260++) {
                                                const v_t = _a2259[_i2260];
                                                const _h2263 = clueAt(cl.number, v_t);
                                                const _h2264 = (_h2263 !== -1);
                                                const _h2265 = _h2264;
                                                const _h2266 = !(_h2265);
                                                const _a2261 = sp.adj4[v_t];
                                                for (let _i2262 = 0; _i2262 < _a2261.length; _i2262++) {
                                                  const v_x = _a2261[_i2262];
                                                  const _h2267 = clueAt(cl.number, v_x);
                                                  let _c2269: boolean = (_h2266 && (_h2267 !== -1));
                                                  if (_c2269) {
                                                    const _t2268 = sp.adj4Edges[v_t][_i2262];
                                                    _c2269 = ((_t2268 === _wc1680 ? _wd1681 : (_t2268 === _wc1678 ? _wd1679 : (b.grid[_t2268] || -1))) === 1);
                                                  }
                                                  if (!(_c2269)) continue;
                                                  if (!_g2241.includes(v_x)) _g2241.push(v_x);
                                                }
                                              }
                                            }
                                            const _a2270 = union(_g2236, _g2241);
                                            for (let _i2271 = 0; _i2271 < _a2270.length; _i2271++) {
                                              const v_q = _a2270[_i2271];
                                              const _h2273 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h2272 - _h2273)) === cl.step))) {
                                                _q2198 = false;
                                                break Q2199;
                                              }
                                            }
                                          }
                                        }
                                        _c2274 = _q2198;
                                      }
                                      if ((_c2274 && (_h554 || !(throughWhere(sp, v_s, (_te2275: number): boolean => {  return ((_te2275 === _wc1680 ? _wd1681 : (_te2275 === _wc1678 ? _wd1679 : (b.grid[_te2275] || -1))) === 1); }).includes(v_z))))) {
                                        _q2154 = true;
                                        break Q2155;
                                      }
                                    }
                                  }
                                  _c2276 = _q2154;
                                }
                                if (_c2276) {
                                  _q2014 = true;
                                  break Q2015;
                                }
                              }
                            }
                            _c2277 = !(_q2014);
                          }
                          if (_c2277) {
                            _q1992 = true;
                            break Q1993;
                          }
                        }
                      }
                      _c2278 = _q1992;
                    }
                    if (_c2278) {
                      let _wo2279: Witness | null = null;
                      let _g2280 = 0;
                      G2281: {
                        const _a2282 = sp.adj4[v_t];
                        for (let _i2283 = 0; _i2283 < _a2282.length; _i2283++) {
                          const _t2284 = sp.adj4Edges[v_t][_i2283];
                          if (!(((_t2284 === _wc1680 ? _wd1681 : (_t2284 === _wc1678 ? _wd1679 : (b.grid[_t2284] || -1))) === 1))) continue;
                          _g2280++;
                        }
                      }
                      let _g2285 = 0;
                      G2286: {
                        for (let _i2287 = 0; _i2287 < 1; _i2287++) {
                          const v_k = v_t;
                          const _h2288 = clueAt(cl.number, v_k);
                          const _h2295 = (_h2288 + 1);
                          let _c2297: boolean = (_h2288 !== -1);
                          if (_c2297) {
                            let _c2296: boolean = (_h554 || (_h2288 === 1));
                            if (!_c2296) {
                              let _g2289 = 0;
                              G2290: {
                                const _t2291 = (_h2288 + 1);
                                const _a2292 = cluesValued(cl.number, _t2291);
                                for (let _i2293 = 0; _i2293 < _a2292.length; _i2293++) {
                                  const v_x = _a2292[_i2293];
                                  const _h2294 = clueAt(cl.number, v_x);
                                  if (!((_h2294 === _h2295))) continue;
                                  _g2289++;
                                }
                              }
                              _c2296 = (_g2289 === 0);
                            }
                            _c2297 = _c2296;
                          }
                          if (!(_c2297)) continue;
                          _g2285++;
                        }
                      }
                      let _c2565: boolean = (_g2280 < (2 - _g2285));
                      if (_c2565) {
                        let _q2298 = false;
                        Q2299: {
                          const _a2300 = sp.adj4[v_t];
                          for (let _i2301 = 0; _i2301 < _a2300.length; _i2301++) {
                            const v_y = _a2300[_i2301];
                            const _t2302 = sp.adj4Edges[v_t][_i2301];
                            let _c2321: boolean = !((_t2302 === _wc1680 ? true : (_t2302 === _wc1678 ? true : (b.grid[_t2302] !== 0))));
                            if (_c2321) {
                              let _g2303 = 0;
                              G2304: {
                                const _a2305 = sp.adj4[v_t];
                                for (let _i2306 = 0; _i2306 < _a2305.length; _i2306++) {
                                  const _t2307 = sp.adj4Edges[v_t][_i2306];
                                  if (!(((_t2307 === _wc1680 ? _wd1681 : (_t2307 === _wc1678 ? _wd1679 : (b.grid[_t2307] || -1))) === 1))) continue;
                                  _g2303++;
                                }
                              }
                              let _g2308 = 0;
                              G2309: {
                                for (let _i2310 = 0; _i2310 < 1; _i2310++) {
                                  const v_k = v_t;
                                  const _h2311 = clueAt(cl.number, v_k);
                                  const _h2318 = (_h2311 + 1);
                                  let _c2320: boolean = (_h2311 !== -1);
                                  if (_c2320) {
                                    let _c2319: boolean = (_h554 || (_h2311 === 1));
                                    if (!_c2319) {
                                      let _g2312 = 0;
                                      G2313: {
                                        const _t2314 = (_h2311 + 1);
                                        const _a2315 = cluesValued(cl.number, _t2314);
                                        for (let _i2316 = 0; _i2316 < _a2315.length; _i2316++) {
                                          const v_x = _a2315[_i2316];
                                          const _h2317 = clueAt(cl.number, v_x);
                                          if (!((_h2317 === _h2318))) continue;
                                          _g2312++;
                                        }
                                      }
                                      _c2319 = (_g2312 === 0);
                                    }
                                    _c2320 = _c2319;
                                  }
                                  if (!(_c2320)) continue;
                                  _g2308++;
                                }
                              }
                              _c2321 = (_g2303 < (2 - _g2308));
                            }
                            let _c2341: boolean = _c2321;
                            if (_c2341) {
                              let _g2322 = 0;
                              G2323: {
                                const _a2325 = sp.adj4[v_y];
                                for (let _i2326 = 0; _i2326 < _a2325.length; _i2326++) {
                                  const _t2327 = sp.adj4Edges[v_y][_i2326];
                                  if (!(((_t2327 === _wc1680 ? _wd1681 : (_t2327 === _wc1678 ? _wd1679 : (b.grid[_t2327] || -1))) === 1))) continue;
                                  _g2322++;
                                }
                              }
                              let _g2328 = 0;
                              G2329: {
                                for (let _i2330 = 0; _i2330 < 1; _i2330++) {
                                  const v_k = v_y;
                                  const _h2331 = clueAt(cl.number, v_k);
                                  const _h2338 = (_h2331 + 1);
                                  let _c2340: boolean = (_h2331 !== -1);
                                  if (_c2340) {
                                    let _c2339: boolean = (_h554 || (_h2331 === 1));
                                    if (!_c2339) {
                                      let _g2332 = 0;
                                      G2333: {
                                        const _t2334 = (_h2331 + 1);
                                        const _a2335 = cluesValued(cl.number, _t2334);
                                        for (let _i2336 = 0; _i2336 < _a2335.length; _i2336++) {
                                          const v_x = _a2335[_i2336];
                                          const _h2337 = clueAt(cl.number, v_x);
                                          if (!((_h2337 === _h2338))) continue;
                                          _g2332++;
                                        }
                                      }
                                      _c2339 = (_g2332 === 0);
                                    }
                                    _c2340 = _c2339;
                                  }
                                  if (!(_c2340)) continue;
                                  _g2328++;
                                }
                              }
                              _c2341 = (_g2322 < (2 - _g2328));
                            }
                            let _c2420: boolean = _c2341;
                            if (_c2420) {
                              let _q2342 = true;
                              Q2343: {
                                const _g2344: number[] = [];
                                G2345: {
                                  for (let _i2347 = 0; _i2347 < 1; _i2347++) {
                                    const v_x = v_t;
                                    const _h2348 = clueAt(cl.number, v_x);
                                    if (!((_h2348 !== -1))) continue;
                                    _g2344.push(v_x);
                                  }
                                }
                                const _g2349: number[] = [];
                                G2350: {
                                  const _a2369 = throughWhere(sp, v_t, (_te2364: number): boolean => { let _c2366: boolean = ((_te2364 === _wc1680 ? _wd1681 : (_te2364 === _wc1678 ? _wd1679 : (b.grid[_te2364] || -1))) === 1); if (_c2366) {   const _t2365 = sp.edgeEnds[2 * _te2364];   _c2366 = !((clueAt(cl.number, _t2365) !== -1)); } let _c2368: boolean = _c2366; if (_c2368) {   const _t2367 = sp.edgeEnds[2 * _te2364 + 1];   _c2368 = !((clueAt(cl.number, _t2367) !== -1)); } return _c2368; });
                                  for (let _i2370 = 0; _i2370 < _a2369.length; _i2370++) {
                                    const v_t_2363 = _a2369[_i2370];
                                    const _h2373 = clueAt(cl.number, v_t_2363);
                                    const _h2374 = (_h2373 !== -1);
                                    const _h2375 = _h2374;
                                    const _h2376 = !(_h2375);
                                    const _a2371 = sp.adj4[v_t_2363];
                                    for (let _i2372 = 0; _i2372 < _a2371.length; _i2372++) {
                                      const v_x = _a2371[_i2372];
                                      const _h2377 = clueAt(cl.number, v_x);
                                      let _c2379: boolean = (_h2376 && (_h2377 !== -1));
                                      if (_c2379) {
                                        const _t2378 = sp.adj4Edges[v_t_2363][_i2372];
                                        _c2379 = ((_t2378 === _wc1680 ? _wd1681 : (_t2378 === _wc1678 ? _wd1679 : (b.grid[_t2378] || -1))) === 1);
                                      }
                                      if (!(_c2379)) continue;
                                      if (!_g2349.includes(v_x)) _g2349.push(v_x);
                                    }
                                  }
                                }
                                const _a2380 = union(_g2344, _g2349);
                                for (let _i2381 = 0; _i2381 < _a2380.length; _i2381++) {
                                  const v_p = _a2380[_i2381];
                                  const _h2418 = clueAt(cl.number, v_p);
                                  const _g2382: number[] = [];
                                  G2383: {
                                    for (let _i2385 = 0; _i2385 < 1; _i2385++) {
                                      const v_x = v_y;
                                      const _h2386 = clueAt(cl.number, v_x);
                                      if (!((_h2386 !== -1))) continue;
                                      _g2382.push(v_x);
                                    }
                                  }
                                  const _g2387: number[] = [];
                                  G2388: {
                                    const _a2405 = throughWhere(sp, v_y, (_te2400: number): boolean => { let _c2402: boolean = ((_te2400 === _wc1680 ? _wd1681 : (_te2400 === _wc1678 ? _wd1679 : (b.grid[_te2400] || -1))) === 1); if (_c2402) {   const _t2401 = sp.edgeEnds[2 * _te2400];   _c2402 = !((clueAt(cl.number, _t2401) !== -1)); } let _c2404: boolean = _c2402; if (_c2404) {   const _t2403 = sp.edgeEnds[2 * _te2400 + 1];   _c2404 = !((clueAt(cl.number, _t2403) !== -1)); } return _c2404; });
                                    for (let _i2406 = 0; _i2406 < _a2405.length; _i2406++) {
                                      const v_t = _a2405[_i2406];
                                      const _h2409 = clueAt(cl.number, v_t);
                                      const _h2410 = (_h2409 !== -1);
                                      const _h2411 = _h2410;
                                      const _h2412 = !(_h2411);
                                      const _a2407 = sp.adj4[v_t];
                                      for (let _i2408 = 0; _i2408 < _a2407.length; _i2408++) {
                                        const v_x = _a2407[_i2408];
                                        const _h2413 = clueAt(cl.number, v_x);
                                        let _c2415: boolean = (_h2412 && (_h2413 !== -1));
                                        if (_c2415) {
                                          const _t2414 = sp.adj4Edges[v_t][_i2408];
                                          _c2415 = ((_t2414 === _wc1680 ? _wd1681 : (_t2414 === _wc1678 ? _wd1679 : (b.grid[_t2414] || -1))) === 1);
                                        }
                                        if (!(_c2415)) continue;
                                        if (!_g2387.includes(v_x)) _g2387.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2416 = union(_g2382, _g2387);
                                  for (let _i2417 = 0; _i2417 < _a2416.length; _i2417++) {
                                    const v_q = _a2416[_i2417];
                                    const _h2419 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2418 - _h2419)) === cl.step))) {
                                      _q2342 = false;
                                      break Q2343;
                                    }
                                  }
                                }
                              }
                              _c2420 = _q2342;
                            }
                            if (!((_c2420 && (_h554 || !(throughWhere(sp, v_t, (_te2421: number): boolean => {  return ((_te2421 === _wc1680 ? _wd1681 : (_te2421 === _wc1678 ? _wd1679 : (b.grid[_te2421] || -1))) === 1); }).includes(v_y)))))) continue;
                            let _g2422 = 0;
                            G2423: {
                              const _a2424 = sp.adj4[v_t];
                              for (let _i2425 = 0; _i2425 < _a2424.length; _i2425++) {
                                const _t2426 = sp.adj4Edges[v_t][_i2425];
                                if (!(((_t2426 === _wc1680 ? _wd1681 : (_t2426 === _wc1678 ? _wd1679 : (b.grid[_t2426] || -1))) === 1))) continue;
                                _g2422++;
                              }
                            }
                            let _g2427 = 0;
                            G2428: {
                              for (let _i2429 = 0; _i2429 < 1; _i2429++) {
                                const v_k = v_t;
                                const _h2430 = clueAt(cl.number, v_k);
                                const _h2437 = (_h2430 + 1);
                                let _c2439: boolean = (_h2430 !== -1);
                                if (_c2439) {
                                  let _c2438: boolean = (_h554 || (_h2430 === 1));
                                  if (!_c2438) {
                                    let _g2431 = 0;
                                    G2432: {
                                      const _t2433 = (_h2430 + 1);
                                      const _a2434 = cluesValued(cl.number, _t2433);
                                      for (let _i2435 = 0; _i2435 < _a2434.length; _i2435++) {
                                        const v_x = _a2434[_i2435];
                                        const _h2436 = clueAt(cl.number, v_x);
                                        if (!((_h2436 === _h2437))) continue;
                                        _g2431++;
                                      }
                                    }
                                    _c2438 = (_g2431 === 0);
                                  }
                                  _c2439 = _c2438;
                                }
                                if (!(_c2439)) continue;
                                _g2427++;
                              }
                            }
                            let _c2564: boolean = ((_g2422 + 1) === (2 - _g2427));
                            if (!_c2564) {
                              let _q2440 = false;
                              Q2441: {
                                const _a2442 = sp.adj4[v_t];
                                const _n2443 = _i2301;
                                for (let _i2444 = 0; _i2444 < _n2443; _i2444++) {
                                  const v_z = _a2442[_i2444];
                                  const _t2445 = sp.adj4Edges[v_t][_i2444];
                                  let _c2464: boolean = !((_t2445 === _wc1680 ? true : (_t2445 === _wc1678 ? true : (b.grid[_t2445] !== 0))));
                                  if (_c2464) {
                                    let _g2446 = 0;
                                    G2447: {
                                      const _a2448 = sp.adj4[v_t];
                                      for (let _i2449 = 0; _i2449 < _a2448.length; _i2449++) {
                                        const _t2450 = sp.adj4Edges[v_t][_i2449];
                                        if (!(((_t2450 === _wc1680 ? _wd1681 : (_t2450 === _wc1678 ? _wd1679 : (b.grid[_t2450] || -1))) === 1))) continue;
                                        _g2446++;
                                      }
                                    }
                                    let _g2451 = 0;
                                    G2452: {
                                      for (let _i2453 = 0; _i2453 < 1; _i2453++) {
                                        const v_k = v_t;
                                        const _h2454 = clueAt(cl.number, v_k);
                                        const _h2461 = (_h2454 + 1);
                                        let _c2463: boolean = (_h2454 !== -1);
                                        if (_c2463) {
                                          let _c2462: boolean = (_h554 || (_h2454 === 1));
                                          if (!_c2462) {
                                            let _g2455 = 0;
                                            G2456: {
                                              const _t2457 = (_h2454 + 1);
                                              const _a2458 = cluesValued(cl.number, _t2457);
                                              for (let _i2459 = 0; _i2459 < _a2458.length; _i2459++) {
                                                const v_x = _a2458[_i2459];
                                                const _h2460 = clueAt(cl.number, v_x);
                                                if (!((_h2460 === _h2461))) continue;
                                                _g2455++;
                                              }
                                            }
                                            _c2462 = (_g2455 === 0);
                                          }
                                          _c2463 = _c2462;
                                        }
                                        if (!(_c2463)) continue;
                                        _g2451++;
                                      }
                                    }
                                    _c2464 = (_g2446 < (2 - _g2451));
                                  }
                                  let _c2483: boolean = _c2464;
                                  if (_c2483) {
                                    let _g2465 = 0;
                                    G2466: {
                                      const _a2467 = sp.adj4[v_z];
                                      for (let _i2468 = 0; _i2468 < _a2467.length; _i2468++) {
                                        const _t2469 = sp.adj4Edges[v_z][_i2468];
                                        if (!(((_t2469 === _wc1680 ? _wd1681 : (_t2469 === _wc1678 ? _wd1679 : (b.grid[_t2469] || -1))) === 1))) continue;
                                        _g2465++;
                                      }
                                    }
                                    let _g2470 = 0;
                                    G2471: {
                                      for (let _i2472 = 0; _i2472 < 1; _i2472++) {
                                        const v_k = v_z;
                                        const _h2473 = clueAt(cl.number, v_k);
                                        const _h2480 = (_h2473 + 1);
                                        let _c2482: boolean = (_h2473 !== -1);
                                        if (_c2482) {
                                          let _c2481: boolean = (_h554 || (_h2473 === 1));
                                          if (!_c2481) {
                                            let _g2474 = 0;
                                            G2475: {
                                              const _t2476 = (_h2473 + 1);
                                              const _a2477 = cluesValued(cl.number, _t2476);
                                              for (let _i2478 = 0; _i2478 < _a2477.length; _i2478++) {
                                                const v_x = _a2477[_i2478];
                                                const _h2479 = clueAt(cl.number, v_x);
                                                if (!((_h2479 === _h2480))) continue;
                                                _g2474++;
                                              }
                                            }
                                            _c2481 = (_g2474 === 0);
                                          }
                                          _c2482 = _c2481;
                                        }
                                        if (!(_c2482)) continue;
                                        _g2470++;
                                      }
                                    }
                                    _c2483 = (_g2465 < (2 - _g2470));
                                  }
                                  let _c2562: boolean = _c2483;
                                  if (_c2562) {
                                    let _q2484 = true;
                                    Q2485: {
                                      const _g2486: number[] = [];
                                      G2487: {
                                        for (let _i2489 = 0; _i2489 < 1; _i2489++) {
                                          const v_x = v_t;
                                          const _h2490 = clueAt(cl.number, v_x);
                                          if (!((_h2490 !== -1))) continue;
                                          _g2486.push(v_x);
                                        }
                                      }
                                      const _g2491: number[] = [];
                                      G2492: {
                                        const _a2511 = throughWhere(sp, v_t, (_te2506: number): boolean => { let _c2508: boolean = ((_te2506 === _wc1680 ? _wd1681 : (_te2506 === _wc1678 ? _wd1679 : (b.grid[_te2506] || -1))) === 1); if (_c2508) {   const _t2507 = sp.edgeEnds[2 * _te2506];   _c2508 = !((clueAt(cl.number, _t2507) !== -1)); } let _c2510: boolean = _c2508; if (_c2510) {   const _t2509 = sp.edgeEnds[2 * _te2506 + 1];   _c2510 = !((clueAt(cl.number, _t2509) !== -1)); } return _c2510; });
                                        for (let _i2512 = 0; _i2512 < _a2511.length; _i2512++) {
                                          const v_t_2505 = _a2511[_i2512];
                                          const _h2515 = clueAt(cl.number, v_t_2505);
                                          const _h2516 = (_h2515 !== -1);
                                          const _h2517 = _h2516;
                                          const _h2518 = !(_h2517);
                                          const _a2513 = sp.adj4[v_t_2505];
                                          for (let _i2514 = 0; _i2514 < _a2513.length; _i2514++) {
                                            const v_x = _a2513[_i2514];
                                            const _h2519 = clueAt(cl.number, v_x);
                                            let _c2521: boolean = (_h2518 && (_h2519 !== -1));
                                            if (_c2521) {
                                              const _t2520 = sp.adj4Edges[v_t_2505][_i2514];
                                              _c2521 = ((_t2520 === _wc1680 ? _wd1681 : (_t2520 === _wc1678 ? _wd1679 : (b.grid[_t2520] || -1))) === 1);
                                            }
                                            if (!(_c2521)) continue;
                                            if (!_g2491.includes(v_x)) _g2491.push(v_x);
                                          }
                                        }
                                      }
                                      const _a2522 = union(_g2486, _g2491);
                                      for (let _i2523 = 0; _i2523 < _a2522.length; _i2523++) {
                                        const v_p = _a2522[_i2523];
                                        const _h2560 = clueAt(cl.number, v_p);
                                        const _g2524: number[] = [];
                                        G2525: {
                                          for (let _i2527 = 0; _i2527 < 1; _i2527++) {
                                            const v_x = v_z;
                                            const _h2528 = clueAt(cl.number, v_x);
                                            if (!((_h2528 !== -1))) continue;
                                            _g2524.push(v_x);
                                          }
                                        }
                                        const _g2529: number[] = [];
                                        G2530: {
                                          const _a2547 = throughWhere(sp, v_z, (_te2542: number): boolean => { let _c2544: boolean = ((_te2542 === _wc1680 ? _wd1681 : (_te2542 === _wc1678 ? _wd1679 : (b.grid[_te2542] || -1))) === 1); if (_c2544) {   const _t2543 = sp.edgeEnds[2 * _te2542];   _c2544 = !((clueAt(cl.number, _t2543) !== -1)); } let _c2546: boolean = _c2544; if (_c2546) {   const _t2545 = sp.edgeEnds[2 * _te2542 + 1];   _c2546 = !((clueAt(cl.number, _t2545) !== -1)); } return _c2546; });
                                          for (let _i2548 = 0; _i2548 < _a2547.length; _i2548++) {
                                            const v_t = _a2547[_i2548];
                                            const _h2551 = clueAt(cl.number, v_t);
                                            const _h2552 = (_h2551 !== -1);
                                            const _h2553 = _h2552;
                                            const _h2554 = !(_h2553);
                                            const _a2549 = sp.adj4[v_t];
                                            for (let _i2550 = 0; _i2550 < _a2549.length; _i2550++) {
                                              const v_x = _a2549[_i2550];
                                              const _h2555 = clueAt(cl.number, v_x);
                                              let _c2557: boolean = (_h2554 && (_h2555 !== -1));
                                              if (_c2557) {
                                                const _t2556 = sp.adj4Edges[v_t][_i2550];
                                                _c2557 = ((_t2556 === _wc1680 ? _wd1681 : (_t2556 === _wc1678 ? _wd1679 : (b.grid[_t2556] || -1))) === 1);
                                              }
                                              if (!(_c2557)) continue;
                                              if (!_g2529.includes(v_x)) _g2529.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2558 = union(_g2524, _g2529);
                                        for (let _i2559 = 0; _i2559 < _a2558.length; _i2559++) {
                                          const v_q = _a2558[_i2559];
                                          const _h2561 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h2560 - _h2561)) === cl.step))) {
                                            _q2484 = false;
                                            break Q2485;
                                          }
                                        }
                                      }
                                    }
                                    _c2562 = _q2484;
                                  }
                                  if ((_c2562 && (_h554 || !(throughWhere(sp, v_t, (_te2563: number): boolean => {  return ((_te2563 === _wc1680 ? _wd1681 : (_te2563 === _wc1678 ? _wd1679 : (b.grid[_te2563] || -1))) === 1); }).includes(v_z))))) {
                                    _q2440 = true;
                                    break Q2441;
                                  }
                                }
                              }
                              _c2564 = _q2440;
                            }
                            if (_c2564) {
                              _q2298 = true;
                              break Q2299;
                            }
                          }
                        }
                        _c2565 = !(_q2298);
                      }
                      if (_c2565) {
                        _wo2279 = { held: "arm", arm: 0, of: { held: "def", name: "stuck", of: { held: "def", name: "spare", of: null } } };
                      }
                      if (!_c2565) {
                        let _wm2566: Witness | null = null;
                        W2567: {
                          const _a2568 = sp.adj4[v_t];
                          for (let _i2569 = 0; _i2569 < _a2568.length; _i2569++) {
                            const v_s = _a2568[_i2569];
                            let _g2570 = 0;
                            G2571: {
                              const _a2572 = sp.adj4[v_s];
                              for (let _i2573 = 0; _i2573 < _a2572.length; _i2573++) {
                                const _t2574 = sp.adj4Edges[v_s][_i2573];
                                if (!(((_t2574 === _wc1680 ? _wd1681 : (_t2574 === _wc1678 ? _wd1679 : (b.grid[_t2574] || -1))) === 1))) continue;
                                _g2570++;
                              }
                            }
                            let _g2575 = 0;
                            G2576: {
                              for (let _i2577 = 0; _i2577 < 1; _i2577++) {
                                const v_k = v_s;
                                const _h2578 = clueAt(cl.number, v_k);
                                const _h2585 = (_h2578 + 1);
                                let _c2587: boolean = (_h2578 !== -1);
                                if (_c2587) {
                                  let _c2586: boolean = (_h554 || (_h2578 === 1));
                                  if (!_c2586) {
                                    let _g2579 = 0;
                                    G2580: {
                                      const _t2581 = (_h2578 + 1);
                                      const _a2582 = cluesValued(cl.number, _t2581);
                                      for (let _i2583 = 0; _i2583 < _a2582.length; _i2583++) {
                                        const v_x = _a2582[_i2583];
                                        const _h2584 = clueAt(cl.number, v_x);
                                        if (!((_h2584 === _h2585))) continue;
                                        _g2579++;
                                      }
                                    }
                                    _c2586 = (_g2579 === 0);
                                  }
                                  _c2587 = _c2586;
                                }
                                if (!(_c2587)) continue;
                                _g2575++;
                              }
                            }
                            let _c2851: boolean = (_g2570 < (2 - _g2575));
                            if (_c2851) {
                              let _q2588 = false;
                              Q2589: {
                                const _a2590 = sp.adj4[v_s];
                                for (let _i2591 = 0; _i2591 < _a2590.length; _i2591++) {
                                  const v_y = _a2590[_i2591];
                                  const _t2592 = sp.adj4Edges[v_s][_i2591];
                                  let _c2611: boolean = !((_t2592 === _wc1680 ? true : (_t2592 === _wc1678 ? true : (b.grid[_t2592] !== 0))));
                                  if (_c2611) {
                                    let _g2593 = 0;
                                    G2594: {
                                      const _a2595 = sp.adj4[v_s];
                                      for (let _i2596 = 0; _i2596 < _a2595.length; _i2596++) {
                                        const _t2597 = sp.adj4Edges[v_s][_i2596];
                                        if (!(((_t2597 === _wc1680 ? _wd1681 : (_t2597 === _wc1678 ? _wd1679 : (b.grid[_t2597] || -1))) === 1))) continue;
                                        _g2593++;
                                      }
                                    }
                                    let _g2598 = 0;
                                    G2599: {
                                      for (let _i2600 = 0; _i2600 < 1; _i2600++) {
                                        const v_k = v_s;
                                        const _h2601 = clueAt(cl.number, v_k);
                                        const _h2608 = (_h2601 + 1);
                                        let _c2610: boolean = (_h2601 !== -1);
                                        if (_c2610) {
                                          let _c2609: boolean = (_h554 || (_h2601 === 1));
                                          if (!_c2609) {
                                            let _g2602 = 0;
                                            G2603: {
                                              const _t2604 = (_h2601 + 1);
                                              const _a2605 = cluesValued(cl.number, _t2604);
                                              for (let _i2606 = 0; _i2606 < _a2605.length; _i2606++) {
                                                const v_x = _a2605[_i2606];
                                                const _h2607 = clueAt(cl.number, v_x);
                                                if (!((_h2607 === _h2608))) continue;
                                                _g2602++;
                                              }
                                            }
                                            _c2609 = (_g2602 === 0);
                                          }
                                          _c2610 = _c2609;
                                        }
                                        if (!(_c2610)) continue;
                                        _g2598++;
                                      }
                                    }
                                    _c2611 = (_g2593 < (2 - _g2598));
                                  }
                                  let _c2631: boolean = _c2611;
                                  if (_c2631) {
                                    let _g2612 = 0;
                                    G2613: {
                                      const _a2615 = sp.adj4[v_y];
                                      for (let _i2616 = 0; _i2616 < _a2615.length; _i2616++) {
                                        const _t2617 = sp.adj4Edges[v_y][_i2616];
                                        if (!(((_t2617 === _wc1680 ? _wd1681 : (_t2617 === _wc1678 ? _wd1679 : (b.grid[_t2617] || -1))) === 1))) continue;
                                        _g2612++;
                                      }
                                    }
                                    let _g2618 = 0;
                                    G2619: {
                                      for (let _i2620 = 0; _i2620 < 1; _i2620++) {
                                        const v_k = v_y;
                                        const _h2621 = clueAt(cl.number, v_k);
                                        const _h2628 = (_h2621 + 1);
                                        let _c2630: boolean = (_h2621 !== -1);
                                        if (_c2630) {
                                          let _c2629: boolean = (_h554 || (_h2621 === 1));
                                          if (!_c2629) {
                                            let _g2622 = 0;
                                            G2623: {
                                              const _t2624 = (_h2621 + 1);
                                              const _a2625 = cluesValued(cl.number, _t2624);
                                              for (let _i2626 = 0; _i2626 < _a2625.length; _i2626++) {
                                                const v_x = _a2625[_i2626];
                                                const _h2627 = clueAt(cl.number, v_x);
                                                if (!((_h2627 === _h2628))) continue;
                                                _g2622++;
                                              }
                                            }
                                            _c2629 = (_g2622 === 0);
                                          }
                                          _c2630 = _c2629;
                                        }
                                        if (!(_c2630)) continue;
                                        _g2618++;
                                      }
                                    }
                                    _c2631 = (_g2612 < (2 - _g2618));
                                  }
                                  let _c2708: boolean = _c2631;
                                  if (_c2708) {
                                    let _q2632 = true;
                                    Q2633: {
                                      const _g2634: number[] = [];
                                      G2635: {
                                        for (let _i2637 = 0; _i2637 < 1; _i2637++) {
                                          const v_x = v_s;
                                          const _h2638 = clueAt(cl.number, v_x);
                                          if (!((_h2638 !== -1))) continue;
                                          _g2634.push(v_x);
                                        }
                                      }
                                      const _g2639: number[] = [];
                                      G2640: {
                                        const _a2657 = throughWhere(sp, v_s, (_te2652: number): boolean => { let _c2654: boolean = ((_te2652 === _wc1680 ? _wd1681 : (_te2652 === _wc1678 ? _wd1679 : (b.grid[_te2652] || -1))) === 1); if (_c2654) {   const _t2653 = sp.edgeEnds[2 * _te2652];   _c2654 = !((clueAt(cl.number, _t2653) !== -1)); } let _c2656: boolean = _c2654; if (_c2656) {   const _t2655 = sp.edgeEnds[2 * _te2652 + 1];   _c2656 = !((clueAt(cl.number, _t2655) !== -1)); } return _c2656; });
                                        for (let _i2658 = 0; _i2658 < _a2657.length; _i2658++) {
                                          const v_t = _a2657[_i2658];
                                          const _h2661 = clueAt(cl.number, v_t);
                                          const _h2662 = (_h2661 !== -1);
                                          const _h2663 = _h2662;
                                          const _h2664 = !(_h2663);
                                          const _a2659 = sp.adj4[v_t];
                                          for (let _i2660 = 0; _i2660 < _a2659.length; _i2660++) {
                                            const v_x = _a2659[_i2660];
                                            const _h2665 = clueAt(cl.number, v_x);
                                            let _c2667: boolean = (_h2664 && (_h2665 !== -1));
                                            if (_c2667) {
                                              const _t2666 = sp.adj4Edges[v_t][_i2660];
                                              _c2667 = ((_t2666 === _wc1680 ? _wd1681 : (_t2666 === _wc1678 ? _wd1679 : (b.grid[_t2666] || -1))) === 1);
                                            }
                                            if (!(_c2667)) continue;
                                            if (!_g2639.includes(v_x)) _g2639.push(v_x);
                                          }
                                        }
                                      }
                                      const _a2668 = union(_g2634, _g2639);
                                      for (let _i2669 = 0; _i2669 < _a2668.length; _i2669++) {
                                        const v_p = _a2668[_i2669];
                                        const _h2706 = clueAt(cl.number, v_p);
                                        const _g2670: number[] = [];
                                        G2671: {
                                          for (let _i2673 = 0; _i2673 < 1; _i2673++) {
                                            const v_x = v_y;
                                            const _h2674 = clueAt(cl.number, v_x);
                                            if (!((_h2674 !== -1))) continue;
                                            _g2670.push(v_x);
                                          }
                                        }
                                        const _g2675: number[] = [];
                                        G2676: {
                                          const _a2693 = throughWhere(sp, v_y, (_te2688: number): boolean => { let _c2690: boolean = ((_te2688 === _wc1680 ? _wd1681 : (_te2688 === _wc1678 ? _wd1679 : (b.grid[_te2688] || -1))) === 1); if (_c2690) {   const _t2689 = sp.edgeEnds[2 * _te2688];   _c2690 = !((clueAt(cl.number, _t2689) !== -1)); } let _c2692: boolean = _c2690; if (_c2692) {   const _t2691 = sp.edgeEnds[2 * _te2688 + 1];   _c2692 = !((clueAt(cl.number, _t2691) !== -1)); } return _c2692; });
                                          for (let _i2694 = 0; _i2694 < _a2693.length; _i2694++) {
                                            const v_t = _a2693[_i2694];
                                            const _h2697 = clueAt(cl.number, v_t);
                                            const _h2698 = (_h2697 !== -1);
                                            const _h2699 = _h2698;
                                            const _h2700 = !(_h2699);
                                            const _a2695 = sp.adj4[v_t];
                                            for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
                                              const v_x = _a2695[_i2696];
                                              const _h2701 = clueAt(cl.number, v_x);
                                              let _c2703: boolean = (_h2700 && (_h2701 !== -1));
                                              if (_c2703) {
                                                const _t2702 = sp.adj4Edges[v_t][_i2696];
                                                _c2703 = ((_t2702 === _wc1680 ? _wd1681 : (_t2702 === _wc1678 ? _wd1679 : (b.grid[_t2702] || -1))) === 1);
                                              }
                                              if (!(_c2703)) continue;
                                              if (!_g2675.includes(v_x)) _g2675.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2704 = union(_g2670, _g2675);
                                        for (let _i2705 = 0; _i2705 < _a2704.length; _i2705++) {
                                          const v_q = _a2704[_i2705];
                                          const _h2707 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h2706 - _h2707)) === cl.step))) {
                                            _q2632 = false;
                                            break Q2633;
                                          }
                                        }
                                      }
                                    }
                                    _c2708 = _q2632;
                                  }
                                  if (!((_c2708 && (_h554 || !(throughWhere(sp, v_s, (_te2709: number): boolean => {  return ((_te2709 === _wc1680 ? _wd1681 : (_te2709 === _wc1678 ? _wd1679 : (b.grid[_te2709] || -1))) === 1); }).includes(v_y)))))) continue;
                                  let _g2710 = 0;
                                  G2711: {
                                    const _a2712 = sp.adj4[v_s];
                                    for (let _i2713 = 0; _i2713 < _a2712.length; _i2713++) {
                                      const _t2714 = sp.adj4Edges[v_s][_i2713];
                                      if (!(((_t2714 === _wc1680 ? _wd1681 : (_t2714 === _wc1678 ? _wd1679 : (b.grid[_t2714] || -1))) === 1))) continue;
                                      _g2710++;
                                    }
                                  }
                                  let _g2715 = 0;
                                  G2716: {
                                    for (let _i2717 = 0; _i2717 < 1; _i2717++) {
                                      const v_k = v_s;
                                      const _h2718 = clueAt(cl.number, v_k);
                                      const _h2725 = (_h2718 + 1);
                                      let _c2727: boolean = (_h2718 !== -1);
                                      if (_c2727) {
                                        let _c2726: boolean = (_h554 || (_h2718 === 1));
                                        if (!_c2726) {
                                          let _g2719 = 0;
                                          G2720: {
                                            const _t2721 = (_h2718 + 1);
                                            const _a2722 = cluesValued(cl.number, _t2721);
                                            for (let _i2723 = 0; _i2723 < _a2722.length; _i2723++) {
                                              const v_x = _a2722[_i2723];
                                              const _h2724 = clueAt(cl.number, v_x);
                                              if (!((_h2724 === _h2725))) continue;
                                              _g2719++;
                                            }
                                          }
                                          _c2726 = (_g2719 === 0);
                                        }
                                        _c2727 = _c2726;
                                      }
                                      if (!(_c2727)) continue;
                                      _g2715++;
                                    }
                                  }
                                  let _c2850: boolean = ((_g2710 + 1) === (2 - _g2715));
                                  if (!_c2850) {
                                    let _q2728 = false;
                                    Q2729: {
                                      const _a2730 = sp.adj4[v_s];
                                      const _n2731 = _i2591;
                                      for (let _i2732 = 0; _i2732 < _n2731; _i2732++) {
                                        const v_z = _a2730[_i2732];
                                        const _t2733 = sp.adj4Edges[v_s][_i2732];
                                        let _c2752: boolean = !((_t2733 === _wc1680 ? true : (_t2733 === _wc1678 ? true : (b.grid[_t2733] !== 0))));
                                        if (_c2752) {
                                          let _g2734 = 0;
                                          G2735: {
                                            const _a2736 = sp.adj4[v_s];
                                            for (let _i2737 = 0; _i2737 < _a2736.length; _i2737++) {
                                              const _t2738 = sp.adj4Edges[v_s][_i2737];
                                              if (!(((_t2738 === _wc1680 ? _wd1681 : (_t2738 === _wc1678 ? _wd1679 : (b.grid[_t2738] || -1))) === 1))) continue;
                                              _g2734++;
                                            }
                                          }
                                          let _g2739 = 0;
                                          G2740: {
                                            for (let _i2741 = 0; _i2741 < 1; _i2741++) {
                                              const v_k = v_s;
                                              const _h2742 = clueAt(cl.number, v_k);
                                              const _h2749 = (_h2742 + 1);
                                              let _c2751: boolean = (_h2742 !== -1);
                                              if (_c2751) {
                                                let _c2750: boolean = (_h554 || (_h2742 === 1));
                                                if (!_c2750) {
                                                  let _g2743 = 0;
                                                  G2744: {
                                                    const _t2745 = (_h2742 + 1);
                                                    const _a2746 = cluesValued(cl.number, _t2745);
                                                    for (let _i2747 = 0; _i2747 < _a2746.length; _i2747++) {
                                                      const v_x = _a2746[_i2747];
                                                      const _h2748 = clueAt(cl.number, v_x);
                                                      if (!((_h2748 === _h2749))) continue;
                                                      _g2743++;
                                                    }
                                                  }
                                                  _c2750 = (_g2743 === 0);
                                                }
                                                _c2751 = _c2750;
                                              }
                                              if (!(_c2751)) continue;
                                              _g2739++;
                                            }
                                          }
                                          _c2752 = (_g2734 < (2 - _g2739));
                                        }
                                        let _c2771: boolean = _c2752;
                                        if (_c2771) {
                                          let _g2753 = 0;
                                          G2754: {
                                            const _a2755 = sp.adj4[v_z];
                                            for (let _i2756 = 0; _i2756 < _a2755.length; _i2756++) {
                                              const _t2757 = sp.adj4Edges[v_z][_i2756];
                                              if (!(((_t2757 === _wc1680 ? _wd1681 : (_t2757 === _wc1678 ? _wd1679 : (b.grid[_t2757] || -1))) === 1))) continue;
                                              _g2753++;
                                            }
                                          }
                                          let _g2758 = 0;
                                          G2759: {
                                            for (let _i2760 = 0; _i2760 < 1; _i2760++) {
                                              const v_k = v_z;
                                              const _h2761 = clueAt(cl.number, v_k);
                                              const _h2768 = (_h2761 + 1);
                                              let _c2770: boolean = (_h2761 !== -1);
                                              if (_c2770) {
                                                let _c2769: boolean = (_h554 || (_h2761 === 1));
                                                if (!_c2769) {
                                                  let _g2762 = 0;
                                                  G2763: {
                                                    const _t2764 = (_h2761 + 1);
                                                    const _a2765 = cluesValued(cl.number, _t2764);
                                                    for (let _i2766 = 0; _i2766 < _a2765.length; _i2766++) {
                                                      const v_x = _a2765[_i2766];
                                                      const _h2767 = clueAt(cl.number, v_x);
                                                      if (!((_h2767 === _h2768))) continue;
                                                      _g2762++;
                                                    }
                                                  }
                                                  _c2769 = (_g2762 === 0);
                                                }
                                                _c2770 = _c2769;
                                              }
                                              if (!(_c2770)) continue;
                                              _g2758++;
                                            }
                                          }
                                          _c2771 = (_g2753 < (2 - _g2758));
                                        }
                                        let _c2848: boolean = _c2771;
                                        if (_c2848) {
                                          let _q2772 = true;
                                          Q2773: {
                                            const _g2774: number[] = [];
                                            G2775: {
                                              for (let _i2777 = 0; _i2777 < 1; _i2777++) {
                                                const v_x = v_s;
                                                const _h2778 = clueAt(cl.number, v_x);
                                                if (!((_h2778 !== -1))) continue;
                                                _g2774.push(v_x);
                                              }
                                            }
                                            const _g2779: number[] = [];
                                            G2780: {
                                              const _a2797 = throughWhere(sp, v_s, (_te2792: number): boolean => { let _c2794: boolean = ((_te2792 === _wc1680 ? _wd1681 : (_te2792 === _wc1678 ? _wd1679 : (b.grid[_te2792] || -1))) === 1); if (_c2794) {   const _t2793 = sp.edgeEnds[2 * _te2792];   _c2794 = !((clueAt(cl.number, _t2793) !== -1)); } let _c2796: boolean = _c2794; if (_c2796) {   const _t2795 = sp.edgeEnds[2 * _te2792 + 1];   _c2796 = !((clueAt(cl.number, _t2795) !== -1)); } return _c2796; });
                                              for (let _i2798 = 0; _i2798 < _a2797.length; _i2798++) {
                                                const v_t = _a2797[_i2798];
                                                const _h2801 = clueAt(cl.number, v_t);
                                                const _h2802 = (_h2801 !== -1);
                                                const _h2803 = _h2802;
                                                const _h2804 = !(_h2803);
                                                const _a2799 = sp.adj4[v_t];
                                                for (let _i2800 = 0; _i2800 < _a2799.length; _i2800++) {
                                                  const v_x = _a2799[_i2800];
                                                  const _h2805 = clueAt(cl.number, v_x);
                                                  let _c2807: boolean = (_h2804 && (_h2805 !== -1));
                                                  if (_c2807) {
                                                    const _t2806 = sp.adj4Edges[v_t][_i2800];
                                                    _c2807 = ((_t2806 === _wc1680 ? _wd1681 : (_t2806 === _wc1678 ? _wd1679 : (b.grid[_t2806] || -1))) === 1);
                                                  }
                                                  if (!(_c2807)) continue;
                                                  if (!_g2779.includes(v_x)) _g2779.push(v_x);
                                                }
                                              }
                                            }
                                            const _a2808 = union(_g2774, _g2779);
                                            for (let _i2809 = 0; _i2809 < _a2808.length; _i2809++) {
                                              const v_p = _a2808[_i2809];
                                              const _h2846 = clueAt(cl.number, v_p);
                                              const _g2810: number[] = [];
                                              G2811: {
                                                for (let _i2813 = 0; _i2813 < 1; _i2813++) {
                                                  const v_x = v_z;
                                                  const _h2814 = clueAt(cl.number, v_x);
                                                  if (!((_h2814 !== -1))) continue;
                                                  _g2810.push(v_x);
                                                }
                                              }
                                              const _g2815: number[] = [];
                                              G2816: {
                                                const _a2833 = throughWhere(sp, v_z, (_te2828: number): boolean => { let _c2830: boolean = ((_te2828 === _wc1680 ? _wd1681 : (_te2828 === _wc1678 ? _wd1679 : (b.grid[_te2828] || -1))) === 1); if (_c2830) {   const _t2829 = sp.edgeEnds[2 * _te2828];   _c2830 = !((clueAt(cl.number, _t2829) !== -1)); } let _c2832: boolean = _c2830; if (_c2832) {   const _t2831 = sp.edgeEnds[2 * _te2828 + 1];   _c2832 = !((clueAt(cl.number, _t2831) !== -1)); } return _c2832; });
                                                for (let _i2834 = 0; _i2834 < _a2833.length; _i2834++) {
                                                  const v_t = _a2833[_i2834];
                                                  const _h2837 = clueAt(cl.number, v_t);
                                                  const _h2838 = (_h2837 !== -1);
                                                  const _h2839 = _h2838;
                                                  const _h2840 = !(_h2839);
                                                  const _a2835 = sp.adj4[v_t];
                                                  for (let _i2836 = 0; _i2836 < _a2835.length; _i2836++) {
                                                    const v_x = _a2835[_i2836];
                                                    const _h2841 = clueAt(cl.number, v_x);
                                                    let _c2843: boolean = (_h2840 && (_h2841 !== -1));
                                                    if (_c2843) {
                                                      const _t2842 = sp.adj4Edges[v_t][_i2836];
                                                      _c2843 = ((_t2842 === _wc1680 ? _wd1681 : (_t2842 === _wc1678 ? _wd1679 : (b.grid[_t2842] || -1))) === 1);
                                                    }
                                                    if (!(_c2843)) continue;
                                                    if (!_g2815.includes(v_x)) _g2815.push(v_x);
                                                  }
                                                }
                                              }
                                              const _a2844 = union(_g2810, _g2815);
                                              for (let _i2845 = 0; _i2845 < _a2844.length; _i2845++) {
                                                const v_q = _a2844[_i2845];
                                                const _h2847 = clueAt(cl.number, v_q);
                                                if (!((Math.abs((_h2846 - _h2847)) === cl.step))) {
                                                  _q2772 = false;
                                                  break Q2773;
                                                }
                                              }
                                            }
                                          }
                                          _c2848 = _q2772;
                                        }
                                        if ((_c2848 && (_h554 || !(throughWhere(sp, v_s, (_te2849: number): boolean => {  return ((_te2849 === _wc1680 ? _wd1681 : (_te2849 === _wc1678 ? _wd1679 : (b.grid[_te2849] || -1))) === 1); }).includes(v_z))))) {
                                          _q2728 = true;
                                          break Q2729;
                                        }
                                      }
                                    }
                                    _c2850 = _q2728;
                                  }
                                  if (_c2850) {
                                    _q2588 = true;
                                    break Q2589;
                                  }
                                }
                              }
                              _c2851 = !(_q2588);
                            }
                            if (_c2851) {
                              _wm2566 = { held: "member", member: { s: v_s }, of: { held: "def", name: "stuck", of: { held: "def", name: "spare", of: null } } };
                              break W2567;
                            }
                          }
                        }
                        _wo2279 = { held: "arm", arm: 1, of: _wm2566 };
                      }
                      _wm1682 = { held: "member", member: { t: v_t }, of: _wo2279 };
                      break W1683;
                    }
                  }
                }
                _wo1672 = { held: "arm", arm: 1, of: { held: "supposing", cell: _wc1678, value: _wd1679, of: { held: "supposing", cell: _wc1680, value: _wd1681, of: { held: "def", name: "shortNear", of: _wm1682 } } } };
              }
              const _w: Witness | null = { held: "def", name: "bothBreak", of: _wo1672 };
              const _says = { terms: { c: v_c, i: v_i, j: v_j }, marks: {  }, witness: _w };
              if (!fire({ c: v_c, U: v_U.slice(), k: v_k, I: v_I.slice(), i: v_i, j: v_j }, facts, _says)) return 1;
            }
            cands.fill(-1);
            meetsMarkedKept.clear();
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

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface WeighedSays {
  terms: { c: number; U: readonly number[]; P: readonly number[]; X: readonly number[]; };
  marks: {  };
}

const weighedFacts: number[] = [];
let weighedCands = new Int32Array(0);
const weighed_st2630 = stamps();
const weighed_st2754 = stamps();
const weighed_st2793 = stamps();
const weighed_st2900 = stamps();
const weighed_st2939 = stamps();
const weighed_st3051 = stamps();
const weighed_st3089 = stamps();
const weighed_st3195 = stamps();
const weighed_st3233 = stamps();
const weighed_st3779 = stamps();
const weighed_st3898 = stamps();
const weighed_st3937 = stamps();
const weighed_st4044 = stamps();
const weighed_st4083 = stamps();
const weighed_st4195 = stamps();
const weighed_st4233 = stamps();
const weighed_st4339 = stamps();
const weighed_st4377 = stamps();

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding, WeighedSays> | null): number {
  const _g2115: number[] = [];
  const _g2735: number[] = [];
  const _g2740: number[] = [];
  const _g2775: number[] = [];
  const _g2780: number[] = [];
  const _g2881: number[] = [];
  const _g2886: number[] = [];
  const _g2921: number[] = [];
  const _g2926: number[] = [];
  const _g3033: number[] = [];
  const _g3038: number[] = [];
  const _g3071: number[] = [];
  const _g3076: number[] = [];
  const _g3177: number[] = [];
  const _g3182: number[] = [];
  const _g3215: number[] = [];
  const _g3220: number[] = [];
  const _g3263: number[] = [];
  const _g3879: number[] = [];
  const _g3884: number[] = [];
  const _g3919: number[] = [];
  const _g3924: number[] = [];
  const _g4025: number[] = [];
  const _g4030: number[] = [];
  const _g4065: number[] = [];
  const _g4070: number[] = [];
  const _g4177: number[] = [];
  const _g4182: number[] = [];
  const _g4215: number[] = [];
  const _g4220: number[] = [];
  const _g4321: number[] = [];
  const _g4326: number[] = [];
  const _g4359: number[] = [];
  const _g4364: number[] = [];
  const _g4410: number[] = [];
  const _g4432: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _k2108 = takesKept.board(cl);
  const _h2660 = (cl.step === 0);
  if (weighedCands.length < sp.edges.length) weighedCands = new Int32Array(sp.edges.length);
  const cands = weighedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a2106 = sp.cells;
  for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
    const v_c = _a2106[_i2107];
    let _g2109 = 0;
    G2110: {
      const _a2111 = sp.adj4[v_c];
      for (let _i2112 = 0; _i2112 < _a2111.length; _i2112++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i2112]] || -1) === 1))) continue;
        _g2109++;
      }
    }
    if (!((((_k2108[v_c] ?? takes(sp, cl, v_c)) - _g2109) === 2))) continue;
    const _h2637 = clueAt(cl.number, v_c);
    const _h2638 = (_h2637 !== -1);
    const _h2639 = _h2638;
    const _h2640 = !(_h2639);
    L2113: {
      const v_U = ways(b, sp, cl, v_c);
      const _h2114 = v_U.length;
      if (!((_h2114 === 4))) break L2113;
      const _h4406 = (v_U[0] ?? -1);
      _g2115.length = 0;
      weighed_st2630.pass++;
      G2116: {
        const _a2631 = v_U;
        for (let _i2632 = 0; _i2632 < _a2631.length; _i2632++) {
          const v_i = _a2631[_i2632];
          const _h2635 = _i2632;
          const _h2636 = (_h2635 === 0);
          const _h2641 = sp.edgeOf(v_c, v_i);
          const _a2633 = v_U;
          for (let _i2634 = 0; _i2634 < _a2633.length; _i2634++) {
            const v_j = _a2633[_i2634];
            let _c3261: boolean = (_h2636 && (_i2634 > 0));
            if (_c3261) {
              let _c3260: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h2640 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c3260) {
                const _wc2642 = _h2641;
                const _wd2643 = 1;
                const _wc2644 = sp.edgeOf(v_c, v_j);
                const _wd2645 = 1;
                let _q2646 = false;
                Q2647: {
                  const _a2649 = throughWhere(sp, v_c, (_te2648: number): boolean => {  return ((_te2648 === _wc2644 ? _wd2645 : (_te2648 === _wc2642 ? _wd2643 : (b.grid[_te2648] || -1))) === 1); });
                  for (let _i2650 = 0; _i2650 < _a2649.length; _i2650++) {
                    const v_t = _a2649[_i2650];
                    let _c2670: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c2670) {
                      let _g2651 = 0;
                      G2652: {
                        const _a2653 = sp.adj4[v_t];
                        for (let _i2654 = 0; _i2654 < _a2653.length; _i2654++) {
                          const _t2655 = sp.adj4Edges[v_t][_i2654];
                          if (!(((_t2655 === _wc2644 ? _wd2645 : (_t2655 === _wc2642 ? _wd2643 : (b.grid[_t2655] || -1))) === 1))) continue;
                          _g2651++;
                        }
                      }
                      let _g2656 = 0;
                      G2657: {
                        for (let _i2658 = 0; _i2658 < 1; _i2658++) {
                          const v_k = v_t;
                          const _h2659 = clueAt(cl.number, v_k);
                          const _h2667 = (_h2659 + 1);
                          let _c2669: boolean = (_h2659 !== -1);
                          if (_c2669) {
                            let _c2668: boolean = (_h2660 || (_h2659 === 1));
                            if (!_c2668) {
                              let _g2661 = 0;
                              G2662: {
                                const _t2663 = (_h2659 + 1);
                                const _a2664 = cluesValued(cl.number, _t2663);
                                for (let _i2665 = 0; _i2665 < _a2664.length; _i2665++) {
                                  const v_x = _a2664[_i2665];
                                  const _h2666 = clueAt(cl.number, v_x);
                                  if (!((_h2666 === _h2667))) continue;
                                  _g2661++;
                                }
                              }
                              _c2668 = (_g2661 === 0);
                            }
                            _c2669 = _c2668;
                          }
                          if (!(_c2669)) continue;
                          _g2656++;
                        }
                      }
                      _c2670 = (_g2651 < (2 - _g2656));
                    }
                    if (!(_c2670)) continue;
                    let _g2671 = 0;
                    G2672: {
                      const _a2673 = sp.adj4[v_t];
                      for (let _i2674 = 0; _i2674 < _a2673.length; _i2674++) {
                        const _t2675 = sp.adj4Edges[v_t][_i2674];
                        if (!(((_t2675 === _wc2644 ? _wd2645 : (_t2675 === _wc2642 ? _wd2643 : (b.grid[_t2675] || -1))) === 1))) continue;
                        _g2671++;
                      }
                    }
                    let _g2676 = 0;
                    G2677: {
                      for (let _i2678 = 0; _i2678 < 1; _i2678++) {
                        const v_k = v_t;
                        const _h2679 = clueAt(cl.number, v_k);
                        const _h2686 = (_h2679 + 1);
                        let _c2688: boolean = (_h2679 !== -1);
                        if (_c2688) {
                          let _c2687: boolean = (_h2660 || (_h2679 === 1));
                          if (!_c2687) {
                            let _g2680 = 0;
                            G2681: {
                              const _t2682 = (_h2679 + 1);
                              const _a2683 = cluesValued(cl.number, _t2682);
                              for (let _i2684 = 0; _i2684 < _a2683.length; _i2684++) {
                                const v_x = _a2683[_i2684];
                                const _h2685 = clueAt(cl.number, v_x);
                                if (!((_h2685 === _h2686))) continue;
                                _g2680++;
                              }
                            }
                            _c2687 = (_g2680 === 0);
                          }
                          _c2688 = _c2687;
                        }
                        if (!(_c2688)) continue;
                        _g2676++;
                      }
                    }
                    let _c2964: boolean = (_g2671 < (2 - _g2676));
                    if (_c2964) {
                      let _q2689 = false;
                      Q2690: {
                        const _a2691 = sp.adj4[v_t];
                        for (let _i2692 = 0; _i2692 < _a2691.length; _i2692++) {
                          const v_y = _a2691[_i2692];
                          const _t2693 = sp.adj4Edges[v_t][_i2692];
                          let _c2712: boolean = !((_t2693 === _wc2644 ? true : (_t2693 === _wc2642 ? true : (b.grid[_t2693] !== 0))));
                          if (_c2712) {
                            let _g2694 = 0;
                            G2695: {
                              const _a2696 = sp.adj4[v_t];
                              for (let _i2697 = 0; _i2697 < _a2696.length; _i2697++) {
                                const _t2698 = sp.adj4Edges[v_t][_i2697];
                                if (!(((_t2698 === _wc2644 ? _wd2645 : (_t2698 === _wc2642 ? _wd2643 : (b.grid[_t2698] || -1))) === 1))) continue;
                                _g2694++;
                              }
                            }
                            let _g2699 = 0;
                            G2700: {
                              for (let _i2701 = 0; _i2701 < 1; _i2701++) {
                                const v_k = v_t;
                                const _h2702 = clueAt(cl.number, v_k);
                                const _h2709 = (_h2702 + 1);
                                let _c2711: boolean = (_h2702 !== -1);
                                if (_c2711) {
                                  let _c2710: boolean = (_h2660 || (_h2702 === 1));
                                  if (!_c2710) {
                                    let _g2703 = 0;
                                    G2704: {
                                      const _t2705 = (_h2702 + 1);
                                      const _a2706 = cluesValued(cl.number, _t2705);
                                      for (let _i2707 = 0; _i2707 < _a2706.length; _i2707++) {
                                        const v_x = _a2706[_i2707];
                                        const _h2708 = clueAt(cl.number, v_x);
                                        if (!((_h2708 === _h2709))) continue;
                                        _g2703++;
                                      }
                                    }
                                    _c2710 = (_g2703 === 0);
                                  }
                                  _c2711 = _c2710;
                                }
                                if (!(_c2711)) continue;
                                _g2699++;
                              }
                            }
                            _c2712 = (_g2694 < (2 - _g2699));
                          }
                          let _c2732: boolean = _c2712;
                          if (_c2732) {
                            let _g2713 = 0;
                            G2714: {
                              const _a2716 = sp.adj4[v_y];
                              for (let _i2717 = 0; _i2717 < _a2716.length; _i2717++) {
                                const _t2718 = sp.adj4Edges[v_y][_i2717];
                                if (!(((_t2718 === _wc2644 ? _wd2645 : (_t2718 === _wc2642 ? _wd2643 : (b.grid[_t2718] || -1))) === 1))) continue;
                                _g2713++;
                              }
                            }
                            let _g2719 = 0;
                            G2720: {
                              for (let _i2721 = 0; _i2721 < 1; _i2721++) {
                                const v_k = v_y;
                                const _h2722 = clueAt(cl.number, v_k);
                                const _h2729 = (_h2722 + 1);
                                let _c2731: boolean = (_h2722 !== -1);
                                if (_c2731) {
                                  let _c2730: boolean = (_h2660 || (_h2722 === 1));
                                  if (!_c2730) {
                                    let _g2723 = 0;
                                    G2724: {
                                      const _t2725 = (_h2722 + 1);
                                      const _a2726 = cluesValued(cl.number, _t2725);
                                      for (let _i2727 = 0; _i2727 < _a2726.length; _i2727++) {
                                        const v_x = _a2726[_i2727];
                                        const _h2728 = clueAt(cl.number, v_x);
                                        if (!((_h2728 === _h2729))) continue;
                                        _g2723++;
                                      }
                                    }
                                    _c2730 = (_g2723 === 0);
                                  }
                                  _c2731 = _c2730;
                                }
                                if (!(_c2731)) continue;
                                _g2719++;
                              }
                            }
                            _c2732 = (_g2713 < (2 - _g2719));
                          }
                          let _c2815: boolean = _c2732;
                          if (_c2815) {
                            let _q2733 = true;
                            Q2734: {
                              _g2735.length = 0;
                              G2736: {
                                for (let _i2738 = 0; _i2738 < 1; _i2738++) {
                                  const v_x = v_t;
                                  const _h2739 = clueAt(cl.number, v_x);
                                  if (!((_h2739 !== -1))) continue;
                                  _g2735.push(v_x);
                                }
                              }
                              _g2740.length = 0;
                              weighed_st2754.pass++;
                              G2741: {
                                const _a2761 = throughWhere(sp, v_t, (_te2756: number): boolean => { let _c2758: boolean = ((_te2756 === _wc2644 ? _wd2645 : (_te2756 === _wc2642 ? _wd2643 : (b.grid[_te2756] || -1))) === 1); if (_c2758) {   const _t2757 = sp.edgeEnds[2 * _te2756];   _c2758 = !((clueAt(cl.number, _t2757) !== -1)); } let _c2760: boolean = _c2758; if (_c2760) {   const _t2759 = sp.edgeEnds[2 * _te2756 + 1];   _c2760 = !((clueAt(cl.number, _t2759) !== -1)); } return _c2760; });
                                for (let _i2762 = 0; _i2762 < _a2761.length; _i2762++) {
                                  const v_t_2755 = _a2761[_i2762];
                                  const _h2765 = clueAt(cl.number, v_t_2755);
                                  const _h2766 = (_h2765 !== -1);
                                  const _h2767 = _h2766;
                                  const _h2768 = !(_h2767);
                                  const _a2763 = sp.adj4[v_t_2755];
                                  for (let _i2764 = 0; _i2764 < _a2763.length; _i2764++) {
                                    const v_x = _a2763[_i2764];
                                    const _h2769 = clueAt(cl.number, v_x);
                                    let _c2771: boolean = (_h2768 && (_h2769 !== -1));
                                    if (_c2771) {
                                      const _t2770 = sp.adj4Edges[v_t_2755][_i2764];
                                      _c2771 = ((_t2770 === _wc2644 ? _wd2645 : (_t2770 === _wc2642 ? _wd2643 : (b.grid[_t2770] || -1))) === 1);
                                    }
                                    if (!(_c2771)) continue;
                                    const _t2772 = v_x;
                                    if (_g2740.length < 16) { if (!_g2740.includes(_t2772)) _g2740.push(_t2772); } else addOnce(_g2740, weighed_st2754, _t2772);
                                  }
                                }
                              }
                              const _a2773 = union(_g2735, _g2740);
                              for (let _i2774 = 0; _i2774 < _a2773.length; _i2774++) {
                                const v_p = _a2773[_i2774];
                                const _h2813 = clueAt(cl.number, v_p);
                                _g2775.length = 0;
                                G2776: {
                                  for (let _i2778 = 0; _i2778 < 1; _i2778++) {
                                    const v_x = v_y;
                                    const _h2779 = clueAt(cl.number, v_x);
                                    if (!((_h2779 !== -1))) continue;
                                    _g2775.push(v_x);
                                  }
                                }
                                _g2780.length = 0;
                                weighed_st2793.pass++;
                                G2781: {
                                  const _a2799 = throughWhere(sp, v_y, (_te2794: number): boolean => { let _c2796: boolean = ((_te2794 === _wc2644 ? _wd2645 : (_te2794 === _wc2642 ? _wd2643 : (b.grid[_te2794] || -1))) === 1); if (_c2796) {   const _t2795 = sp.edgeEnds[2 * _te2794];   _c2796 = !((clueAt(cl.number, _t2795) !== -1)); } let _c2798: boolean = _c2796; if (_c2798) {   const _t2797 = sp.edgeEnds[2 * _te2794 + 1];   _c2798 = !((clueAt(cl.number, _t2797) !== -1)); } return _c2798; });
                                  for (let _i2800 = 0; _i2800 < _a2799.length; _i2800++) {
                                    const v_t = _a2799[_i2800];
                                    const _h2803 = clueAt(cl.number, v_t);
                                    const _h2804 = (_h2803 !== -1);
                                    const _h2805 = _h2804;
                                    const _h2806 = !(_h2805);
                                    const _a2801 = sp.adj4[v_t];
                                    for (let _i2802 = 0; _i2802 < _a2801.length; _i2802++) {
                                      const v_x = _a2801[_i2802];
                                      const _h2807 = clueAt(cl.number, v_x);
                                      let _c2809: boolean = (_h2806 && (_h2807 !== -1));
                                      if (_c2809) {
                                        const _t2808 = sp.adj4Edges[v_t][_i2802];
                                        _c2809 = ((_t2808 === _wc2644 ? _wd2645 : (_t2808 === _wc2642 ? _wd2643 : (b.grid[_t2808] || -1))) === 1);
                                      }
                                      if (!(_c2809)) continue;
                                      const _t2810 = v_x;
                                      if (_g2780.length < 16) { if (!_g2780.includes(_t2810)) _g2780.push(_t2810); } else addOnce(_g2780, weighed_st2793, _t2810);
                                    }
                                  }
                                }
                                const _a2811 = union(_g2775, _g2780);
                                for (let _i2812 = 0; _i2812 < _a2811.length; _i2812++) {
                                  const v_q = _a2811[_i2812];
                                  const _h2814 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h2813 - _h2814)) === cl.step))) {
                                    _q2733 = false;
                                    break Q2734;
                                  }
                                }
                              }
                            }
                            _c2815 = _q2733;
                          }
                          if (!((_c2815 && (_h2660 || !(throughWhere(sp, v_t, (_te2816: number): boolean => {  return ((_te2816 === _wc2644 ? _wd2645 : (_te2816 === _wc2642 ? _wd2643 : (b.grid[_te2816] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g2817 = 0;
                          G2818: {
                            const _a2819 = sp.adj4[v_t];
                            for (let _i2820 = 0; _i2820 < _a2819.length; _i2820++) {
                              const _t2821 = sp.adj4Edges[v_t][_i2820];
                              if (!(((_t2821 === _wc2644 ? _wd2645 : (_t2821 === _wc2642 ? _wd2643 : (b.grid[_t2821] || -1))) === 1))) continue;
                              _g2817++;
                            }
                          }
                          let _g2822 = 0;
                          G2823: {
                            for (let _i2824 = 0; _i2824 < 1; _i2824++) {
                              const v_k = v_t;
                              const _h2825 = clueAt(cl.number, v_k);
                              const _h2832 = (_h2825 + 1);
                              let _c2834: boolean = (_h2825 !== -1);
                              if (_c2834) {
                                let _c2833: boolean = (_h2660 || (_h2825 === 1));
                                if (!_c2833) {
                                  let _g2826 = 0;
                                  G2827: {
                                    const _t2828 = (_h2825 + 1);
                                    const _a2829 = cluesValued(cl.number, _t2828);
                                    for (let _i2830 = 0; _i2830 < _a2829.length; _i2830++) {
                                      const v_x = _a2829[_i2830];
                                      const _h2831 = clueAt(cl.number, v_x);
                                      if (!((_h2831 === _h2832))) continue;
                                      _g2826++;
                                    }
                                  }
                                  _c2833 = (_g2826 === 0);
                                }
                                _c2834 = _c2833;
                              }
                              if (!(_c2834)) continue;
                              _g2822++;
                            }
                          }
                          let _c2963: boolean = ((_g2817 + 1) === (2 - _g2822));
                          if (!_c2963) {
                            let _q2835 = false;
                            Q2836: {
                              const _a2837 = sp.adj4[v_t];
                              const _n2838 = _i2692;
                              for (let _i2839 = 0; _i2839 < _n2838; _i2839++) {
                                const v_z = _a2837[_i2839];
                                const _t2840 = sp.adj4Edges[v_t][_i2839];
                                let _c2859: boolean = !((_t2840 === _wc2644 ? true : (_t2840 === _wc2642 ? true : (b.grid[_t2840] !== 0))));
                                if (_c2859) {
                                  let _g2841 = 0;
                                  G2842: {
                                    const _a2843 = sp.adj4[v_t];
                                    for (let _i2844 = 0; _i2844 < _a2843.length; _i2844++) {
                                      const _t2845 = sp.adj4Edges[v_t][_i2844];
                                      if (!(((_t2845 === _wc2644 ? _wd2645 : (_t2845 === _wc2642 ? _wd2643 : (b.grid[_t2845] || -1))) === 1))) continue;
                                      _g2841++;
                                    }
                                  }
                                  let _g2846 = 0;
                                  G2847: {
                                    for (let _i2848 = 0; _i2848 < 1; _i2848++) {
                                      const v_k = v_t;
                                      const _h2849 = clueAt(cl.number, v_k);
                                      const _h2856 = (_h2849 + 1);
                                      let _c2858: boolean = (_h2849 !== -1);
                                      if (_c2858) {
                                        let _c2857: boolean = (_h2660 || (_h2849 === 1));
                                        if (!_c2857) {
                                          let _g2850 = 0;
                                          G2851: {
                                            const _t2852 = (_h2849 + 1);
                                            const _a2853 = cluesValued(cl.number, _t2852);
                                            for (let _i2854 = 0; _i2854 < _a2853.length; _i2854++) {
                                              const v_x = _a2853[_i2854];
                                              const _h2855 = clueAt(cl.number, v_x);
                                              if (!((_h2855 === _h2856))) continue;
                                              _g2850++;
                                            }
                                          }
                                          _c2857 = (_g2850 === 0);
                                        }
                                        _c2858 = _c2857;
                                      }
                                      if (!(_c2858)) continue;
                                      _g2846++;
                                    }
                                  }
                                  _c2859 = (_g2841 < (2 - _g2846));
                                }
                                let _c2878: boolean = _c2859;
                                if (_c2878) {
                                  let _g2860 = 0;
                                  G2861: {
                                    const _a2862 = sp.adj4[v_z];
                                    for (let _i2863 = 0; _i2863 < _a2862.length; _i2863++) {
                                      const _t2864 = sp.adj4Edges[v_z][_i2863];
                                      if (!(((_t2864 === _wc2644 ? _wd2645 : (_t2864 === _wc2642 ? _wd2643 : (b.grid[_t2864] || -1))) === 1))) continue;
                                      _g2860++;
                                    }
                                  }
                                  let _g2865 = 0;
                                  G2866: {
                                    for (let _i2867 = 0; _i2867 < 1; _i2867++) {
                                      const v_k = v_z;
                                      const _h2868 = clueAt(cl.number, v_k);
                                      const _h2875 = (_h2868 + 1);
                                      let _c2877: boolean = (_h2868 !== -1);
                                      if (_c2877) {
                                        let _c2876: boolean = (_h2660 || (_h2868 === 1));
                                        if (!_c2876) {
                                          let _g2869 = 0;
                                          G2870: {
                                            const _t2871 = (_h2868 + 1);
                                            const _a2872 = cluesValued(cl.number, _t2871);
                                            for (let _i2873 = 0; _i2873 < _a2872.length; _i2873++) {
                                              const v_x = _a2872[_i2873];
                                              const _h2874 = clueAt(cl.number, v_x);
                                              if (!((_h2874 === _h2875))) continue;
                                              _g2869++;
                                            }
                                          }
                                          _c2876 = (_g2869 === 0);
                                        }
                                        _c2877 = _c2876;
                                      }
                                      if (!(_c2877)) continue;
                                      _g2865++;
                                    }
                                  }
                                  _c2878 = (_g2860 < (2 - _g2865));
                                }
                                let _c2961: boolean = _c2878;
                                if (_c2961) {
                                  let _q2879 = true;
                                  Q2880: {
                                    _g2881.length = 0;
                                    G2882: {
                                      for (let _i2884 = 0; _i2884 < 1; _i2884++) {
                                        const v_x = v_t;
                                        const _h2885 = clueAt(cl.number, v_x);
                                        if (!((_h2885 !== -1))) continue;
                                        _g2881.push(v_x);
                                      }
                                    }
                                    _g2886.length = 0;
                                    weighed_st2900.pass++;
                                    G2887: {
                                      const _a2907 = throughWhere(sp, v_t, (_te2902: number): boolean => { let _c2904: boolean = ((_te2902 === _wc2644 ? _wd2645 : (_te2902 === _wc2642 ? _wd2643 : (b.grid[_te2902] || -1))) === 1); if (_c2904) {   const _t2903 = sp.edgeEnds[2 * _te2902];   _c2904 = !((clueAt(cl.number, _t2903) !== -1)); } let _c2906: boolean = _c2904; if (_c2906) {   const _t2905 = sp.edgeEnds[2 * _te2902 + 1];   _c2906 = !((clueAt(cl.number, _t2905) !== -1)); } return _c2906; });
                                      for (let _i2908 = 0; _i2908 < _a2907.length; _i2908++) {
                                        const v_t_2901 = _a2907[_i2908];
                                        const _h2911 = clueAt(cl.number, v_t_2901);
                                        const _h2912 = (_h2911 !== -1);
                                        const _h2913 = _h2912;
                                        const _h2914 = !(_h2913);
                                        const _a2909 = sp.adj4[v_t_2901];
                                        for (let _i2910 = 0; _i2910 < _a2909.length; _i2910++) {
                                          const v_x = _a2909[_i2910];
                                          const _h2915 = clueAt(cl.number, v_x);
                                          let _c2917: boolean = (_h2914 && (_h2915 !== -1));
                                          if (_c2917) {
                                            const _t2916 = sp.adj4Edges[v_t_2901][_i2910];
                                            _c2917 = ((_t2916 === _wc2644 ? _wd2645 : (_t2916 === _wc2642 ? _wd2643 : (b.grid[_t2916] || -1))) === 1);
                                          }
                                          if (!(_c2917)) continue;
                                          const _t2918 = v_x;
                                          if (_g2886.length < 16) { if (!_g2886.includes(_t2918)) _g2886.push(_t2918); } else addOnce(_g2886, weighed_st2900, _t2918);
                                        }
                                      }
                                    }
                                    const _a2919 = union(_g2881, _g2886);
                                    for (let _i2920 = 0; _i2920 < _a2919.length; _i2920++) {
                                      const v_p = _a2919[_i2920];
                                      const _h2959 = clueAt(cl.number, v_p);
                                      _g2921.length = 0;
                                      G2922: {
                                        for (let _i2924 = 0; _i2924 < 1; _i2924++) {
                                          const v_x = v_z;
                                          const _h2925 = clueAt(cl.number, v_x);
                                          if (!((_h2925 !== -1))) continue;
                                          _g2921.push(v_x);
                                        }
                                      }
                                      _g2926.length = 0;
                                      weighed_st2939.pass++;
                                      G2927: {
                                        const _a2945 = throughWhere(sp, v_z, (_te2940: number): boolean => { let _c2942: boolean = ((_te2940 === _wc2644 ? _wd2645 : (_te2940 === _wc2642 ? _wd2643 : (b.grid[_te2940] || -1))) === 1); if (_c2942) {   const _t2941 = sp.edgeEnds[2 * _te2940];   _c2942 = !((clueAt(cl.number, _t2941) !== -1)); } let _c2944: boolean = _c2942; if (_c2944) {   const _t2943 = sp.edgeEnds[2 * _te2940 + 1];   _c2944 = !((clueAt(cl.number, _t2943) !== -1)); } return _c2944; });
                                        for (let _i2946 = 0; _i2946 < _a2945.length; _i2946++) {
                                          const v_t = _a2945[_i2946];
                                          const _h2949 = clueAt(cl.number, v_t);
                                          const _h2950 = (_h2949 !== -1);
                                          const _h2951 = _h2950;
                                          const _h2952 = !(_h2951);
                                          const _a2947 = sp.adj4[v_t];
                                          for (let _i2948 = 0; _i2948 < _a2947.length; _i2948++) {
                                            const v_x = _a2947[_i2948];
                                            const _h2953 = clueAt(cl.number, v_x);
                                            let _c2955: boolean = (_h2952 && (_h2953 !== -1));
                                            if (_c2955) {
                                              const _t2954 = sp.adj4Edges[v_t][_i2948];
                                              _c2955 = ((_t2954 === _wc2644 ? _wd2645 : (_t2954 === _wc2642 ? _wd2643 : (b.grid[_t2954] || -1))) === 1);
                                            }
                                            if (!(_c2955)) continue;
                                            const _t2956 = v_x;
                                            if (_g2926.length < 16) { if (!_g2926.includes(_t2956)) _g2926.push(_t2956); } else addOnce(_g2926, weighed_st2939, _t2956);
                                          }
                                        }
                                      }
                                      const _a2957 = union(_g2921, _g2926);
                                      for (let _i2958 = 0; _i2958 < _a2957.length; _i2958++) {
                                        const v_q = _a2957[_i2958];
                                        const _h2960 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h2959 - _h2960)) === cl.step))) {
                                          _q2879 = false;
                                          break Q2880;
                                        }
                                      }
                                    }
                                  }
                                  _c2961 = _q2879;
                                }
                                if ((_c2961 && (_h2660 || !(throughWhere(sp, v_t, (_te2962: number): boolean => {  return ((_te2962 === _wc2644 ? _wd2645 : (_te2962 === _wc2642 ? _wd2643 : (b.grid[_te2962] || -1))) === 1); }).includes(v_z))))) {
                                  _q2835 = true;
                                  break Q2836;
                                }
                              }
                            }
                            _c2963 = _q2835;
                          }
                          if (_c2963) {
                            _q2689 = true;
                            break Q2690;
                          }
                        }
                      }
                      _c2964 = !(_q2689);
                    }
                    let _c3259: boolean = _c2964;
                    if (!_c3259) {
                      let _q2965 = false;
                      Q2966: {
                        const _a2967 = sp.adj4[v_t];
                        for (let _i2968 = 0; _i2968 < _a2967.length; _i2968++) {
                          const v_s = _a2967[_i2968];
                          let _g2969 = 0;
                          G2970: {
                            const _a2971 = sp.adj4[v_s];
                            for (let _i2972 = 0; _i2972 < _a2971.length; _i2972++) {
                              const _t2973 = sp.adj4Edges[v_s][_i2972];
                              if (!(((_t2973 === _wc2644 ? _wd2645 : (_t2973 === _wc2642 ? _wd2643 : (b.grid[_t2973] || -1))) === 1))) continue;
                              _g2969++;
                            }
                          }
                          let _g2974 = 0;
                          G2975: {
                            for (let _i2976 = 0; _i2976 < 1; _i2976++) {
                              const v_k = v_s;
                              const _h2977 = clueAt(cl.number, v_k);
                              const _h2984 = (_h2977 + 1);
                              let _c2986: boolean = (_h2977 !== -1);
                              if (_c2986) {
                                let _c2985: boolean = (_h2660 || (_h2977 === 1));
                                if (!_c2985) {
                                  let _g2978 = 0;
                                  G2979: {
                                    const _t2980 = (_h2977 + 1);
                                    const _a2981 = cluesValued(cl.number, _t2980);
                                    for (let _i2982 = 0; _i2982 < _a2981.length; _i2982++) {
                                      const v_x = _a2981[_i2982];
                                      const _h2983 = clueAt(cl.number, v_x);
                                      if (!((_h2983 === _h2984))) continue;
                                      _g2978++;
                                    }
                                  }
                                  _c2985 = (_g2978 === 0);
                                }
                                _c2986 = _c2985;
                              }
                              if (!(_c2986)) continue;
                              _g2974++;
                            }
                          }
                          let _c3258: boolean = (_g2969 < (2 - _g2974));
                          if (_c3258) {
                            let _q2987 = false;
                            Q2988: {
                              const _a2989 = sp.adj4[v_s];
                              for (let _i2990 = 0; _i2990 < _a2989.length; _i2990++) {
                                const v_y = _a2989[_i2990];
                                const _t2991 = sp.adj4Edges[v_s][_i2990];
                                let _c3010: boolean = !((_t2991 === _wc2644 ? true : (_t2991 === _wc2642 ? true : (b.grid[_t2991] !== 0))));
                                if (_c3010) {
                                  let _g2992 = 0;
                                  G2993: {
                                    const _a2994 = sp.adj4[v_s];
                                    for (let _i2995 = 0; _i2995 < _a2994.length; _i2995++) {
                                      const _t2996 = sp.adj4Edges[v_s][_i2995];
                                      if (!(((_t2996 === _wc2644 ? _wd2645 : (_t2996 === _wc2642 ? _wd2643 : (b.grid[_t2996] || -1))) === 1))) continue;
                                      _g2992++;
                                    }
                                  }
                                  let _g2997 = 0;
                                  G2998: {
                                    for (let _i2999 = 0; _i2999 < 1; _i2999++) {
                                      const v_k = v_s;
                                      const _h3000 = clueAt(cl.number, v_k);
                                      const _h3007 = (_h3000 + 1);
                                      let _c3009: boolean = (_h3000 !== -1);
                                      if (_c3009) {
                                        let _c3008: boolean = (_h2660 || (_h3000 === 1));
                                        if (!_c3008) {
                                          let _g3001 = 0;
                                          G3002: {
                                            const _t3003 = (_h3000 + 1);
                                            const _a3004 = cluesValued(cl.number, _t3003);
                                            for (let _i3005 = 0; _i3005 < _a3004.length; _i3005++) {
                                              const v_x = _a3004[_i3005];
                                              const _h3006 = clueAt(cl.number, v_x);
                                              if (!((_h3006 === _h3007))) continue;
                                              _g3001++;
                                            }
                                          }
                                          _c3008 = (_g3001 === 0);
                                        }
                                        _c3009 = _c3008;
                                      }
                                      if (!(_c3009)) continue;
                                      _g2997++;
                                    }
                                  }
                                  _c3010 = (_g2992 < (2 - _g2997));
                                }
                                let _c3030: boolean = _c3010;
                                if (_c3030) {
                                  let _g3011 = 0;
                                  G3012: {
                                    const _a3014 = sp.adj4[v_y];
                                    for (let _i3015 = 0; _i3015 < _a3014.length; _i3015++) {
                                      const _t3016 = sp.adj4Edges[v_y][_i3015];
                                      if (!(((_t3016 === _wc2644 ? _wd2645 : (_t3016 === _wc2642 ? _wd2643 : (b.grid[_t3016] || -1))) === 1))) continue;
                                      _g3011++;
                                    }
                                  }
                                  let _g3017 = 0;
                                  G3018: {
                                    for (let _i3019 = 0; _i3019 < 1; _i3019++) {
                                      const v_k = v_y;
                                      const _h3020 = clueAt(cl.number, v_k);
                                      const _h3027 = (_h3020 + 1);
                                      let _c3029: boolean = (_h3020 !== -1);
                                      if (_c3029) {
                                        let _c3028: boolean = (_h2660 || (_h3020 === 1));
                                        if (!_c3028) {
                                          let _g3021 = 0;
                                          G3022: {
                                            const _t3023 = (_h3020 + 1);
                                            const _a3024 = cluesValued(cl.number, _t3023);
                                            for (let _i3025 = 0; _i3025 < _a3024.length; _i3025++) {
                                              const v_x = _a3024[_i3025];
                                              const _h3026 = clueAt(cl.number, v_x);
                                              if (!((_h3026 === _h3027))) continue;
                                              _g3021++;
                                            }
                                          }
                                          _c3028 = (_g3021 === 0);
                                        }
                                        _c3029 = _c3028;
                                      }
                                      if (!(_c3029)) continue;
                                      _g3017++;
                                    }
                                  }
                                  _c3030 = (_g3011 < (2 - _g3017));
                                }
                                let _c3111: boolean = _c3030;
                                if (_c3111) {
                                  let _q3031 = true;
                                  Q3032: {
                                    _g3033.length = 0;
                                    G3034: {
                                      for (let _i3036 = 0; _i3036 < 1; _i3036++) {
                                        const v_x = v_s;
                                        const _h3037 = clueAt(cl.number, v_x);
                                        if (!((_h3037 !== -1))) continue;
                                        _g3033.push(v_x);
                                      }
                                    }
                                    _g3038.length = 0;
                                    weighed_st3051.pass++;
                                    G3039: {
                                      const _a3057 = throughWhere(sp, v_s, (_te3052: number): boolean => { let _c3054: boolean = ((_te3052 === _wc2644 ? _wd2645 : (_te3052 === _wc2642 ? _wd2643 : (b.grid[_te3052] || -1))) === 1); if (_c3054) {   const _t3053 = sp.edgeEnds[2 * _te3052];   _c3054 = !((clueAt(cl.number, _t3053) !== -1)); } let _c3056: boolean = _c3054; if (_c3056) {   const _t3055 = sp.edgeEnds[2 * _te3052 + 1];   _c3056 = !((clueAt(cl.number, _t3055) !== -1)); } return _c3056; });
                                      for (let _i3058 = 0; _i3058 < _a3057.length; _i3058++) {
                                        const v_t = _a3057[_i3058];
                                        const _h3061 = clueAt(cl.number, v_t);
                                        const _h3062 = (_h3061 !== -1);
                                        const _h3063 = _h3062;
                                        const _h3064 = !(_h3063);
                                        const _a3059 = sp.adj4[v_t];
                                        for (let _i3060 = 0; _i3060 < _a3059.length; _i3060++) {
                                          const v_x = _a3059[_i3060];
                                          const _h3065 = clueAt(cl.number, v_x);
                                          let _c3067: boolean = (_h3064 && (_h3065 !== -1));
                                          if (_c3067) {
                                            const _t3066 = sp.adj4Edges[v_t][_i3060];
                                            _c3067 = ((_t3066 === _wc2644 ? _wd2645 : (_t3066 === _wc2642 ? _wd2643 : (b.grid[_t3066] || -1))) === 1);
                                          }
                                          if (!(_c3067)) continue;
                                          const _t3068 = v_x;
                                          if (_g3038.length < 16) { if (!_g3038.includes(_t3068)) _g3038.push(_t3068); } else addOnce(_g3038, weighed_st3051, _t3068);
                                        }
                                      }
                                    }
                                    const _a3069 = union(_g3033, _g3038);
                                    for (let _i3070 = 0; _i3070 < _a3069.length; _i3070++) {
                                      const v_p = _a3069[_i3070];
                                      const _h3109 = clueAt(cl.number, v_p);
                                      _g3071.length = 0;
                                      G3072: {
                                        for (let _i3074 = 0; _i3074 < 1; _i3074++) {
                                          const v_x = v_y;
                                          const _h3075 = clueAt(cl.number, v_x);
                                          if (!((_h3075 !== -1))) continue;
                                          _g3071.push(v_x);
                                        }
                                      }
                                      _g3076.length = 0;
                                      weighed_st3089.pass++;
                                      G3077: {
                                        const _a3095 = throughWhere(sp, v_y, (_te3090: number): boolean => { let _c3092: boolean = ((_te3090 === _wc2644 ? _wd2645 : (_te3090 === _wc2642 ? _wd2643 : (b.grid[_te3090] || -1))) === 1); if (_c3092) {   const _t3091 = sp.edgeEnds[2 * _te3090];   _c3092 = !((clueAt(cl.number, _t3091) !== -1)); } let _c3094: boolean = _c3092; if (_c3094) {   const _t3093 = sp.edgeEnds[2 * _te3090 + 1];   _c3094 = !((clueAt(cl.number, _t3093) !== -1)); } return _c3094; });
                                        for (let _i3096 = 0; _i3096 < _a3095.length; _i3096++) {
                                          const v_t = _a3095[_i3096];
                                          const _h3099 = clueAt(cl.number, v_t);
                                          const _h3100 = (_h3099 !== -1);
                                          const _h3101 = _h3100;
                                          const _h3102 = !(_h3101);
                                          const _a3097 = sp.adj4[v_t];
                                          for (let _i3098 = 0; _i3098 < _a3097.length; _i3098++) {
                                            const v_x = _a3097[_i3098];
                                            const _h3103 = clueAt(cl.number, v_x);
                                            let _c3105: boolean = (_h3102 && (_h3103 !== -1));
                                            if (_c3105) {
                                              const _t3104 = sp.adj4Edges[v_t][_i3098];
                                              _c3105 = ((_t3104 === _wc2644 ? _wd2645 : (_t3104 === _wc2642 ? _wd2643 : (b.grid[_t3104] || -1))) === 1);
                                            }
                                            if (!(_c3105)) continue;
                                            const _t3106 = v_x;
                                            if (_g3076.length < 16) { if (!_g3076.includes(_t3106)) _g3076.push(_t3106); } else addOnce(_g3076, weighed_st3089, _t3106);
                                          }
                                        }
                                      }
                                      const _a3107 = union(_g3071, _g3076);
                                      for (let _i3108 = 0; _i3108 < _a3107.length; _i3108++) {
                                        const v_q = _a3107[_i3108];
                                        const _h3110 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h3109 - _h3110)) === cl.step))) {
                                          _q3031 = false;
                                          break Q3032;
                                        }
                                      }
                                    }
                                  }
                                  _c3111 = _q3031;
                                }
                                if (!((_c3111 && (_h2660 || !(throughWhere(sp, v_s, (_te3112: number): boolean => {  return ((_te3112 === _wc2644 ? _wd2645 : (_te3112 === _wc2642 ? _wd2643 : (b.grid[_te3112] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g3113 = 0;
                                G3114: {
                                  const _a3115 = sp.adj4[v_s];
                                  for (let _i3116 = 0; _i3116 < _a3115.length; _i3116++) {
                                    const _t3117 = sp.adj4Edges[v_s][_i3116];
                                    if (!(((_t3117 === _wc2644 ? _wd2645 : (_t3117 === _wc2642 ? _wd2643 : (b.grid[_t3117] || -1))) === 1))) continue;
                                    _g3113++;
                                  }
                                }
                                let _g3118 = 0;
                                G3119: {
                                  for (let _i3120 = 0; _i3120 < 1; _i3120++) {
                                    const v_k = v_s;
                                    const _h3121 = clueAt(cl.number, v_k);
                                    const _h3128 = (_h3121 + 1);
                                    let _c3130: boolean = (_h3121 !== -1);
                                    if (_c3130) {
                                      let _c3129: boolean = (_h2660 || (_h3121 === 1));
                                      if (!_c3129) {
                                        let _g3122 = 0;
                                        G3123: {
                                          const _t3124 = (_h3121 + 1);
                                          const _a3125 = cluesValued(cl.number, _t3124);
                                          for (let _i3126 = 0; _i3126 < _a3125.length; _i3126++) {
                                            const v_x = _a3125[_i3126];
                                            const _h3127 = clueAt(cl.number, v_x);
                                            if (!((_h3127 === _h3128))) continue;
                                            _g3122++;
                                          }
                                        }
                                        _c3129 = (_g3122 === 0);
                                      }
                                      _c3130 = _c3129;
                                    }
                                    if (!(_c3130)) continue;
                                    _g3118++;
                                  }
                                }
                                let _c3257: boolean = ((_g3113 + 1) === (2 - _g3118));
                                if (!_c3257) {
                                  let _q3131 = false;
                                  Q3132: {
                                    const _a3133 = sp.adj4[v_s];
                                    const _n3134 = _i2990;
                                    for (let _i3135 = 0; _i3135 < _n3134; _i3135++) {
                                      const v_z = _a3133[_i3135];
                                      const _t3136 = sp.adj4Edges[v_s][_i3135];
                                      let _c3155: boolean = !((_t3136 === _wc2644 ? true : (_t3136 === _wc2642 ? true : (b.grid[_t3136] !== 0))));
                                      if (_c3155) {
                                        let _g3137 = 0;
                                        G3138: {
                                          const _a3139 = sp.adj4[v_s];
                                          for (let _i3140 = 0; _i3140 < _a3139.length; _i3140++) {
                                            const _t3141 = sp.adj4Edges[v_s][_i3140];
                                            if (!(((_t3141 === _wc2644 ? _wd2645 : (_t3141 === _wc2642 ? _wd2643 : (b.grid[_t3141] || -1))) === 1))) continue;
                                            _g3137++;
                                          }
                                        }
                                        let _g3142 = 0;
                                        G3143: {
                                          for (let _i3144 = 0; _i3144 < 1; _i3144++) {
                                            const v_k = v_s;
                                            const _h3145 = clueAt(cl.number, v_k);
                                            const _h3152 = (_h3145 + 1);
                                            let _c3154: boolean = (_h3145 !== -1);
                                            if (_c3154) {
                                              let _c3153: boolean = (_h2660 || (_h3145 === 1));
                                              if (!_c3153) {
                                                let _g3146 = 0;
                                                G3147: {
                                                  const _t3148 = (_h3145 + 1);
                                                  const _a3149 = cluesValued(cl.number, _t3148);
                                                  for (let _i3150 = 0; _i3150 < _a3149.length; _i3150++) {
                                                    const v_x = _a3149[_i3150];
                                                    const _h3151 = clueAt(cl.number, v_x);
                                                    if (!((_h3151 === _h3152))) continue;
                                                    _g3146++;
                                                  }
                                                }
                                                _c3153 = (_g3146 === 0);
                                              }
                                              _c3154 = _c3153;
                                            }
                                            if (!(_c3154)) continue;
                                            _g3142++;
                                          }
                                        }
                                        _c3155 = (_g3137 < (2 - _g3142));
                                      }
                                      let _c3174: boolean = _c3155;
                                      if (_c3174) {
                                        let _g3156 = 0;
                                        G3157: {
                                          const _a3158 = sp.adj4[v_z];
                                          for (let _i3159 = 0; _i3159 < _a3158.length; _i3159++) {
                                            const _t3160 = sp.adj4Edges[v_z][_i3159];
                                            if (!(((_t3160 === _wc2644 ? _wd2645 : (_t3160 === _wc2642 ? _wd2643 : (b.grid[_t3160] || -1))) === 1))) continue;
                                            _g3156++;
                                          }
                                        }
                                        let _g3161 = 0;
                                        G3162: {
                                          for (let _i3163 = 0; _i3163 < 1; _i3163++) {
                                            const v_k = v_z;
                                            const _h3164 = clueAt(cl.number, v_k);
                                            const _h3171 = (_h3164 + 1);
                                            let _c3173: boolean = (_h3164 !== -1);
                                            if (_c3173) {
                                              let _c3172: boolean = (_h2660 || (_h3164 === 1));
                                              if (!_c3172) {
                                                let _g3165 = 0;
                                                G3166: {
                                                  const _t3167 = (_h3164 + 1);
                                                  const _a3168 = cluesValued(cl.number, _t3167);
                                                  for (let _i3169 = 0; _i3169 < _a3168.length; _i3169++) {
                                                    const v_x = _a3168[_i3169];
                                                    const _h3170 = clueAt(cl.number, v_x);
                                                    if (!((_h3170 === _h3171))) continue;
                                                    _g3165++;
                                                  }
                                                }
                                                _c3172 = (_g3165 === 0);
                                              }
                                              _c3173 = _c3172;
                                            }
                                            if (!(_c3173)) continue;
                                            _g3161++;
                                          }
                                        }
                                        _c3174 = (_g3156 < (2 - _g3161));
                                      }
                                      let _c3255: boolean = _c3174;
                                      if (_c3255) {
                                        let _q3175 = true;
                                        Q3176: {
                                          _g3177.length = 0;
                                          G3178: {
                                            for (let _i3180 = 0; _i3180 < 1; _i3180++) {
                                              const v_x = v_s;
                                              const _h3181 = clueAt(cl.number, v_x);
                                              if (!((_h3181 !== -1))) continue;
                                              _g3177.push(v_x);
                                            }
                                          }
                                          _g3182.length = 0;
                                          weighed_st3195.pass++;
                                          G3183: {
                                            const _a3201 = throughWhere(sp, v_s, (_te3196: number): boolean => { let _c3198: boolean = ((_te3196 === _wc2644 ? _wd2645 : (_te3196 === _wc2642 ? _wd2643 : (b.grid[_te3196] || -1))) === 1); if (_c3198) {   const _t3197 = sp.edgeEnds[2 * _te3196];   _c3198 = !((clueAt(cl.number, _t3197) !== -1)); } let _c3200: boolean = _c3198; if (_c3200) {   const _t3199 = sp.edgeEnds[2 * _te3196 + 1];   _c3200 = !((clueAt(cl.number, _t3199) !== -1)); } return _c3200; });
                                            for (let _i3202 = 0; _i3202 < _a3201.length; _i3202++) {
                                              const v_t = _a3201[_i3202];
                                              const _h3205 = clueAt(cl.number, v_t);
                                              const _h3206 = (_h3205 !== -1);
                                              const _h3207 = _h3206;
                                              const _h3208 = !(_h3207);
                                              const _a3203 = sp.adj4[v_t];
                                              for (let _i3204 = 0; _i3204 < _a3203.length; _i3204++) {
                                                const v_x = _a3203[_i3204];
                                                const _h3209 = clueAt(cl.number, v_x);
                                                let _c3211: boolean = (_h3208 && (_h3209 !== -1));
                                                if (_c3211) {
                                                  const _t3210 = sp.adj4Edges[v_t][_i3204];
                                                  _c3211 = ((_t3210 === _wc2644 ? _wd2645 : (_t3210 === _wc2642 ? _wd2643 : (b.grid[_t3210] || -1))) === 1);
                                                }
                                                if (!(_c3211)) continue;
                                                const _t3212 = v_x;
                                                if (_g3182.length < 16) { if (!_g3182.includes(_t3212)) _g3182.push(_t3212); } else addOnce(_g3182, weighed_st3195, _t3212);
                                              }
                                            }
                                          }
                                          const _a3213 = union(_g3177, _g3182);
                                          for (let _i3214 = 0; _i3214 < _a3213.length; _i3214++) {
                                            const v_p = _a3213[_i3214];
                                            const _h3253 = clueAt(cl.number, v_p);
                                            _g3215.length = 0;
                                            G3216: {
                                              for (let _i3218 = 0; _i3218 < 1; _i3218++) {
                                                const v_x = v_z;
                                                const _h3219 = clueAt(cl.number, v_x);
                                                if (!((_h3219 !== -1))) continue;
                                                _g3215.push(v_x);
                                              }
                                            }
                                            _g3220.length = 0;
                                            weighed_st3233.pass++;
                                            G3221: {
                                              const _a3239 = throughWhere(sp, v_z, (_te3234: number): boolean => { let _c3236: boolean = ((_te3234 === _wc2644 ? _wd2645 : (_te3234 === _wc2642 ? _wd2643 : (b.grid[_te3234] || -1))) === 1); if (_c3236) {   const _t3235 = sp.edgeEnds[2 * _te3234];   _c3236 = !((clueAt(cl.number, _t3235) !== -1)); } let _c3238: boolean = _c3236; if (_c3238) {   const _t3237 = sp.edgeEnds[2 * _te3234 + 1];   _c3238 = !((clueAt(cl.number, _t3237) !== -1)); } return _c3238; });
                                              for (let _i3240 = 0; _i3240 < _a3239.length; _i3240++) {
                                                const v_t = _a3239[_i3240];
                                                const _h3243 = clueAt(cl.number, v_t);
                                                const _h3244 = (_h3243 !== -1);
                                                const _h3245 = _h3244;
                                                const _h3246 = !(_h3245);
                                                const _a3241 = sp.adj4[v_t];
                                                for (let _i3242 = 0; _i3242 < _a3241.length; _i3242++) {
                                                  const v_x = _a3241[_i3242];
                                                  const _h3247 = clueAt(cl.number, v_x);
                                                  let _c3249: boolean = (_h3246 && (_h3247 !== -1));
                                                  if (_c3249) {
                                                    const _t3248 = sp.adj4Edges[v_t][_i3242];
                                                    _c3249 = ((_t3248 === _wc2644 ? _wd2645 : (_t3248 === _wc2642 ? _wd2643 : (b.grid[_t3248] || -1))) === 1);
                                                  }
                                                  if (!(_c3249)) continue;
                                                  const _t3250 = v_x;
                                                  if (_g3220.length < 16) { if (!_g3220.includes(_t3250)) _g3220.push(_t3250); } else addOnce(_g3220, weighed_st3233, _t3250);
                                                }
                                              }
                                            }
                                            const _a3251 = union(_g3215, _g3220);
                                            for (let _i3252 = 0; _i3252 < _a3251.length; _i3252++) {
                                              const v_q = _a3251[_i3252];
                                              const _h3254 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h3253 - _h3254)) === cl.step))) {
                                                _q3175 = false;
                                                break Q3176;
                                              }
                                            }
                                          }
                                        }
                                        _c3255 = _q3175;
                                      }
                                      if ((_c3255 && (_h2660 || !(throughWhere(sp, v_s, (_te3256: number): boolean => {  return ((_te3256 === _wc2644 ? _wd2645 : (_te3256 === _wc2642 ? _wd2643 : (b.grid[_te3256] || -1))) === 1); }).includes(v_z))))) {
                                        _q3131 = true;
                                        break Q3132;
                                      }
                                    }
                                  }
                                  _c3257 = _q3131;
                                }
                                if (_c3257) {
                                  _q2987 = true;
                                  break Q2988;
                                }
                              }
                            }
                            _c3258 = !(_q2987);
                          }
                          if (_c3258) {
                            _q2965 = true;
                            break Q2966;
                          }
                        }
                      }
                      _c3259 = _q2965;
                    }
                    if (_c3259) {
                      _q2646 = true;
                      break Q2647;
                    }
                  }
                }
                _c3260 = _q2646;
              }
              _c3261 = _c3260;
            }
            if (!(_c3261)) continue;
            const _t3262 = v_j;
            if (_g2115.length < 16) { if (!_g2115.includes(_t3262)) _g2115.push(_t3262); } else addOnce(_g2115, weighed_st2630, _t3262);
          }
        }
      }
      const v_A = _g2115;
      const _h4423 = v_A.length;
      const _h4424 = (_h4423 < 3);
      _g3263.length = 0;
      weighed_st3779.pass++;
      G3264: {
        const _a3780 = v_U;
        for (let _i3781 = 0; _i3781 < _a3780.length; _i3781++) {
          const v_i = _a3780[_i3781];
          const _h3784 = _i3781;
          const _h3785 = (_h3784 > 0);
          const _h3786 = sp.edgeOf(v_c, v_i);
          const _a3782 = v_U;
          for (let _i3783 = 0; _i3783 < _a3782.length; _i3783++) {
            const v_j = _a3782[_i3783];
            let _c4405: boolean = (_h3785 && (_h3784 < _i3783));
            if (_c4405) {
              let _c4404: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h2640 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c4404) {
                const _wc3787 = _h3786;
                const _wd3788 = 1;
                const _wc3789 = sp.edgeOf(v_c, v_j);
                const _wd3790 = 1;
                let _q3791 = false;
                Q3792: {
                  const _a3794 = throughWhere(sp, v_c, (_te3793: number): boolean => {  return ((_te3793 === _wc3789 ? _wd3790 : (_te3793 === _wc3787 ? _wd3788 : (b.grid[_te3793] || -1))) === 1); });
                  for (let _i3795 = 0; _i3795 < _a3794.length; _i3795++) {
                    const v_t = _a3794[_i3795];
                    let _c3814: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c3814) {
                      let _g3796 = 0;
                      G3797: {
                        const _a3798 = sp.adj4[v_t];
                        for (let _i3799 = 0; _i3799 < _a3798.length; _i3799++) {
                          const _t3800 = sp.adj4Edges[v_t][_i3799];
                          if (!(((_t3800 === _wc3789 ? _wd3790 : (_t3800 === _wc3787 ? _wd3788 : (b.grid[_t3800] || -1))) === 1))) continue;
                          _g3796++;
                        }
                      }
                      let _g3801 = 0;
                      G3802: {
                        for (let _i3803 = 0; _i3803 < 1; _i3803++) {
                          const v_k = v_t;
                          const _h3804 = clueAt(cl.number, v_k);
                          const _h3811 = (_h3804 + 1);
                          let _c3813: boolean = (_h3804 !== -1);
                          if (_c3813) {
                            let _c3812: boolean = (_h2660 || (_h3804 === 1));
                            if (!_c3812) {
                              let _g3805 = 0;
                              G3806: {
                                const _t3807 = (_h3804 + 1);
                                const _a3808 = cluesValued(cl.number, _t3807);
                                for (let _i3809 = 0; _i3809 < _a3808.length; _i3809++) {
                                  const v_x = _a3808[_i3809];
                                  const _h3810 = clueAt(cl.number, v_x);
                                  if (!((_h3810 === _h3811))) continue;
                                  _g3805++;
                                }
                              }
                              _c3812 = (_g3805 === 0);
                            }
                            _c3813 = _c3812;
                          }
                          if (!(_c3813)) continue;
                          _g3801++;
                        }
                      }
                      _c3814 = (_g3796 < (2 - _g3801));
                    }
                    if (!(_c3814)) continue;
                    let _g3815 = 0;
                    G3816: {
                      const _a3817 = sp.adj4[v_t];
                      for (let _i3818 = 0; _i3818 < _a3817.length; _i3818++) {
                        const _t3819 = sp.adj4Edges[v_t][_i3818];
                        if (!(((_t3819 === _wc3789 ? _wd3790 : (_t3819 === _wc3787 ? _wd3788 : (b.grid[_t3819] || -1))) === 1))) continue;
                        _g3815++;
                      }
                    }
                    let _g3820 = 0;
                    G3821: {
                      for (let _i3822 = 0; _i3822 < 1; _i3822++) {
                        const v_k = v_t;
                        const _h3823 = clueAt(cl.number, v_k);
                        const _h3830 = (_h3823 + 1);
                        let _c3832: boolean = (_h3823 !== -1);
                        if (_c3832) {
                          let _c3831: boolean = (_h2660 || (_h3823 === 1));
                          if (!_c3831) {
                            let _g3824 = 0;
                            G3825: {
                              const _t3826 = (_h3823 + 1);
                              const _a3827 = cluesValued(cl.number, _t3826);
                              for (let _i3828 = 0; _i3828 < _a3827.length; _i3828++) {
                                const v_x = _a3827[_i3828];
                                const _h3829 = clueAt(cl.number, v_x);
                                if (!((_h3829 === _h3830))) continue;
                                _g3824++;
                              }
                            }
                            _c3831 = (_g3824 === 0);
                          }
                          _c3832 = _c3831;
                        }
                        if (!(_c3832)) continue;
                        _g3820++;
                      }
                    }
                    let _c4108: boolean = (_g3815 < (2 - _g3820));
                    if (_c4108) {
                      let _q3833 = false;
                      Q3834: {
                        const _a3835 = sp.adj4[v_t];
                        for (let _i3836 = 0; _i3836 < _a3835.length; _i3836++) {
                          const v_y = _a3835[_i3836];
                          const _t3837 = sp.adj4Edges[v_t][_i3836];
                          let _c3856: boolean = !((_t3837 === _wc3789 ? true : (_t3837 === _wc3787 ? true : (b.grid[_t3837] !== 0))));
                          if (_c3856) {
                            let _g3838 = 0;
                            G3839: {
                              const _a3840 = sp.adj4[v_t];
                              for (let _i3841 = 0; _i3841 < _a3840.length; _i3841++) {
                                const _t3842 = sp.adj4Edges[v_t][_i3841];
                                if (!(((_t3842 === _wc3789 ? _wd3790 : (_t3842 === _wc3787 ? _wd3788 : (b.grid[_t3842] || -1))) === 1))) continue;
                                _g3838++;
                              }
                            }
                            let _g3843 = 0;
                            G3844: {
                              for (let _i3845 = 0; _i3845 < 1; _i3845++) {
                                const v_k = v_t;
                                const _h3846 = clueAt(cl.number, v_k);
                                const _h3853 = (_h3846 + 1);
                                let _c3855: boolean = (_h3846 !== -1);
                                if (_c3855) {
                                  let _c3854: boolean = (_h2660 || (_h3846 === 1));
                                  if (!_c3854) {
                                    let _g3847 = 0;
                                    G3848: {
                                      const _t3849 = (_h3846 + 1);
                                      const _a3850 = cluesValued(cl.number, _t3849);
                                      for (let _i3851 = 0; _i3851 < _a3850.length; _i3851++) {
                                        const v_x = _a3850[_i3851];
                                        const _h3852 = clueAt(cl.number, v_x);
                                        if (!((_h3852 === _h3853))) continue;
                                        _g3847++;
                                      }
                                    }
                                    _c3854 = (_g3847 === 0);
                                  }
                                  _c3855 = _c3854;
                                }
                                if (!(_c3855)) continue;
                                _g3843++;
                              }
                            }
                            _c3856 = (_g3838 < (2 - _g3843));
                          }
                          let _c3876: boolean = _c3856;
                          if (_c3876) {
                            let _g3857 = 0;
                            G3858: {
                              const _a3860 = sp.adj4[v_y];
                              for (let _i3861 = 0; _i3861 < _a3860.length; _i3861++) {
                                const _t3862 = sp.adj4Edges[v_y][_i3861];
                                if (!(((_t3862 === _wc3789 ? _wd3790 : (_t3862 === _wc3787 ? _wd3788 : (b.grid[_t3862] || -1))) === 1))) continue;
                                _g3857++;
                              }
                            }
                            let _g3863 = 0;
                            G3864: {
                              for (let _i3865 = 0; _i3865 < 1; _i3865++) {
                                const v_k = v_y;
                                const _h3866 = clueAt(cl.number, v_k);
                                const _h3873 = (_h3866 + 1);
                                let _c3875: boolean = (_h3866 !== -1);
                                if (_c3875) {
                                  let _c3874: boolean = (_h2660 || (_h3866 === 1));
                                  if (!_c3874) {
                                    let _g3867 = 0;
                                    G3868: {
                                      const _t3869 = (_h3866 + 1);
                                      const _a3870 = cluesValued(cl.number, _t3869);
                                      for (let _i3871 = 0; _i3871 < _a3870.length; _i3871++) {
                                        const v_x = _a3870[_i3871];
                                        const _h3872 = clueAt(cl.number, v_x);
                                        if (!((_h3872 === _h3873))) continue;
                                        _g3867++;
                                      }
                                    }
                                    _c3874 = (_g3867 === 0);
                                  }
                                  _c3875 = _c3874;
                                }
                                if (!(_c3875)) continue;
                                _g3863++;
                              }
                            }
                            _c3876 = (_g3857 < (2 - _g3863));
                          }
                          let _c3959: boolean = _c3876;
                          if (_c3959) {
                            let _q3877 = true;
                            Q3878: {
                              _g3879.length = 0;
                              G3880: {
                                for (let _i3882 = 0; _i3882 < 1; _i3882++) {
                                  const v_x = v_t;
                                  const _h3883 = clueAt(cl.number, v_x);
                                  if (!((_h3883 !== -1))) continue;
                                  _g3879.push(v_x);
                                }
                              }
                              _g3884.length = 0;
                              weighed_st3898.pass++;
                              G3885: {
                                const _a3905 = throughWhere(sp, v_t, (_te3900: number): boolean => { let _c3902: boolean = ((_te3900 === _wc3789 ? _wd3790 : (_te3900 === _wc3787 ? _wd3788 : (b.grid[_te3900] || -1))) === 1); if (_c3902) {   const _t3901 = sp.edgeEnds[2 * _te3900];   _c3902 = !((clueAt(cl.number, _t3901) !== -1)); } let _c3904: boolean = _c3902; if (_c3904) {   const _t3903 = sp.edgeEnds[2 * _te3900 + 1];   _c3904 = !((clueAt(cl.number, _t3903) !== -1)); } return _c3904; });
                                for (let _i3906 = 0; _i3906 < _a3905.length; _i3906++) {
                                  const v_t_3899 = _a3905[_i3906];
                                  const _h3909 = clueAt(cl.number, v_t_3899);
                                  const _h3910 = (_h3909 !== -1);
                                  const _h3911 = _h3910;
                                  const _h3912 = !(_h3911);
                                  const _a3907 = sp.adj4[v_t_3899];
                                  for (let _i3908 = 0; _i3908 < _a3907.length; _i3908++) {
                                    const v_x = _a3907[_i3908];
                                    const _h3913 = clueAt(cl.number, v_x);
                                    let _c3915: boolean = (_h3912 && (_h3913 !== -1));
                                    if (_c3915) {
                                      const _t3914 = sp.adj4Edges[v_t_3899][_i3908];
                                      _c3915 = ((_t3914 === _wc3789 ? _wd3790 : (_t3914 === _wc3787 ? _wd3788 : (b.grid[_t3914] || -1))) === 1);
                                    }
                                    if (!(_c3915)) continue;
                                    const _t3916 = v_x;
                                    if (_g3884.length < 16) { if (!_g3884.includes(_t3916)) _g3884.push(_t3916); } else addOnce(_g3884, weighed_st3898, _t3916);
                                  }
                                }
                              }
                              const _a3917 = union(_g3879, _g3884);
                              for (let _i3918 = 0; _i3918 < _a3917.length; _i3918++) {
                                const v_p = _a3917[_i3918];
                                const _h3957 = clueAt(cl.number, v_p);
                                _g3919.length = 0;
                                G3920: {
                                  for (let _i3922 = 0; _i3922 < 1; _i3922++) {
                                    const v_x = v_y;
                                    const _h3923 = clueAt(cl.number, v_x);
                                    if (!((_h3923 !== -1))) continue;
                                    _g3919.push(v_x);
                                  }
                                }
                                _g3924.length = 0;
                                weighed_st3937.pass++;
                                G3925: {
                                  const _a3943 = throughWhere(sp, v_y, (_te3938: number): boolean => { let _c3940: boolean = ((_te3938 === _wc3789 ? _wd3790 : (_te3938 === _wc3787 ? _wd3788 : (b.grid[_te3938] || -1))) === 1); if (_c3940) {   const _t3939 = sp.edgeEnds[2 * _te3938];   _c3940 = !((clueAt(cl.number, _t3939) !== -1)); } let _c3942: boolean = _c3940; if (_c3942) {   const _t3941 = sp.edgeEnds[2 * _te3938 + 1];   _c3942 = !((clueAt(cl.number, _t3941) !== -1)); } return _c3942; });
                                  for (let _i3944 = 0; _i3944 < _a3943.length; _i3944++) {
                                    const v_t = _a3943[_i3944];
                                    const _h3947 = clueAt(cl.number, v_t);
                                    const _h3948 = (_h3947 !== -1);
                                    const _h3949 = _h3948;
                                    const _h3950 = !(_h3949);
                                    const _a3945 = sp.adj4[v_t];
                                    for (let _i3946 = 0; _i3946 < _a3945.length; _i3946++) {
                                      const v_x = _a3945[_i3946];
                                      const _h3951 = clueAt(cl.number, v_x);
                                      let _c3953: boolean = (_h3950 && (_h3951 !== -1));
                                      if (_c3953) {
                                        const _t3952 = sp.adj4Edges[v_t][_i3946];
                                        _c3953 = ((_t3952 === _wc3789 ? _wd3790 : (_t3952 === _wc3787 ? _wd3788 : (b.grid[_t3952] || -1))) === 1);
                                      }
                                      if (!(_c3953)) continue;
                                      const _t3954 = v_x;
                                      if (_g3924.length < 16) { if (!_g3924.includes(_t3954)) _g3924.push(_t3954); } else addOnce(_g3924, weighed_st3937, _t3954);
                                    }
                                  }
                                }
                                const _a3955 = union(_g3919, _g3924);
                                for (let _i3956 = 0; _i3956 < _a3955.length; _i3956++) {
                                  const v_q = _a3955[_i3956];
                                  const _h3958 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h3957 - _h3958)) === cl.step))) {
                                    _q3877 = false;
                                    break Q3878;
                                  }
                                }
                              }
                            }
                            _c3959 = _q3877;
                          }
                          if (!((_c3959 && (_h2660 || !(throughWhere(sp, v_t, (_te3960: number): boolean => {  return ((_te3960 === _wc3789 ? _wd3790 : (_te3960 === _wc3787 ? _wd3788 : (b.grid[_te3960] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g3961 = 0;
                          G3962: {
                            const _a3963 = sp.adj4[v_t];
                            for (let _i3964 = 0; _i3964 < _a3963.length; _i3964++) {
                              const _t3965 = sp.adj4Edges[v_t][_i3964];
                              if (!(((_t3965 === _wc3789 ? _wd3790 : (_t3965 === _wc3787 ? _wd3788 : (b.grid[_t3965] || -1))) === 1))) continue;
                              _g3961++;
                            }
                          }
                          let _g3966 = 0;
                          G3967: {
                            for (let _i3968 = 0; _i3968 < 1; _i3968++) {
                              const v_k = v_t;
                              const _h3969 = clueAt(cl.number, v_k);
                              const _h3976 = (_h3969 + 1);
                              let _c3978: boolean = (_h3969 !== -1);
                              if (_c3978) {
                                let _c3977: boolean = (_h2660 || (_h3969 === 1));
                                if (!_c3977) {
                                  let _g3970 = 0;
                                  G3971: {
                                    const _t3972 = (_h3969 + 1);
                                    const _a3973 = cluesValued(cl.number, _t3972);
                                    for (let _i3974 = 0; _i3974 < _a3973.length; _i3974++) {
                                      const v_x = _a3973[_i3974];
                                      const _h3975 = clueAt(cl.number, v_x);
                                      if (!((_h3975 === _h3976))) continue;
                                      _g3970++;
                                    }
                                  }
                                  _c3977 = (_g3970 === 0);
                                }
                                _c3978 = _c3977;
                              }
                              if (!(_c3978)) continue;
                              _g3966++;
                            }
                          }
                          let _c4107: boolean = ((_g3961 + 1) === (2 - _g3966));
                          if (!_c4107) {
                            let _q3979 = false;
                            Q3980: {
                              const _a3981 = sp.adj4[v_t];
                              const _n3982 = _i3836;
                              for (let _i3983 = 0; _i3983 < _n3982; _i3983++) {
                                const v_z = _a3981[_i3983];
                                const _t3984 = sp.adj4Edges[v_t][_i3983];
                                let _c4003: boolean = !((_t3984 === _wc3789 ? true : (_t3984 === _wc3787 ? true : (b.grid[_t3984] !== 0))));
                                if (_c4003) {
                                  let _g3985 = 0;
                                  G3986: {
                                    const _a3987 = sp.adj4[v_t];
                                    for (let _i3988 = 0; _i3988 < _a3987.length; _i3988++) {
                                      const _t3989 = sp.adj4Edges[v_t][_i3988];
                                      if (!(((_t3989 === _wc3789 ? _wd3790 : (_t3989 === _wc3787 ? _wd3788 : (b.grid[_t3989] || -1))) === 1))) continue;
                                      _g3985++;
                                    }
                                  }
                                  let _g3990 = 0;
                                  G3991: {
                                    for (let _i3992 = 0; _i3992 < 1; _i3992++) {
                                      const v_k = v_t;
                                      const _h3993 = clueAt(cl.number, v_k);
                                      const _h4000 = (_h3993 + 1);
                                      let _c4002: boolean = (_h3993 !== -1);
                                      if (_c4002) {
                                        let _c4001: boolean = (_h2660 || (_h3993 === 1));
                                        if (!_c4001) {
                                          let _g3994 = 0;
                                          G3995: {
                                            const _t3996 = (_h3993 + 1);
                                            const _a3997 = cluesValued(cl.number, _t3996);
                                            for (let _i3998 = 0; _i3998 < _a3997.length; _i3998++) {
                                              const v_x = _a3997[_i3998];
                                              const _h3999 = clueAt(cl.number, v_x);
                                              if (!((_h3999 === _h4000))) continue;
                                              _g3994++;
                                            }
                                          }
                                          _c4001 = (_g3994 === 0);
                                        }
                                        _c4002 = _c4001;
                                      }
                                      if (!(_c4002)) continue;
                                      _g3990++;
                                    }
                                  }
                                  _c4003 = (_g3985 < (2 - _g3990));
                                }
                                let _c4022: boolean = _c4003;
                                if (_c4022) {
                                  let _g4004 = 0;
                                  G4005: {
                                    const _a4006 = sp.adj4[v_z];
                                    for (let _i4007 = 0; _i4007 < _a4006.length; _i4007++) {
                                      const _t4008 = sp.adj4Edges[v_z][_i4007];
                                      if (!(((_t4008 === _wc3789 ? _wd3790 : (_t4008 === _wc3787 ? _wd3788 : (b.grid[_t4008] || -1))) === 1))) continue;
                                      _g4004++;
                                    }
                                  }
                                  let _g4009 = 0;
                                  G4010: {
                                    for (let _i4011 = 0; _i4011 < 1; _i4011++) {
                                      const v_k = v_z;
                                      const _h4012 = clueAt(cl.number, v_k);
                                      const _h4019 = (_h4012 + 1);
                                      let _c4021: boolean = (_h4012 !== -1);
                                      if (_c4021) {
                                        let _c4020: boolean = (_h2660 || (_h4012 === 1));
                                        if (!_c4020) {
                                          let _g4013 = 0;
                                          G4014: {
                                            const _t4015 = (_h4012 + 1);
                                            const _a4016 = cluesValued(cl.number, _t4015);
                                            for (let _i4017 = 0; _i4017 < _a4016.length; _i4017++) {
                                              const v_x = _a4016[_i4017];
                                              const _h4018 = clueAt(cl.number, v_x);
                                              if (!((_h4018 === _h4019))) continue;
                                              _g4013++;
                                            }
                                          }
                                          _c4020 = (_g4013 === 0);
                                        }
                                        _c4021 = _c4020;
                                      }
                                      if (!(_c4021)) continue;
                                      _g4009++;
                                    }
                                  }
                                  _c4022 = (_g4004 < (2 - _g4009));
                                }
                                let _c4105: boolean = _c4022;
                                if (_c4105) {
                                  let _q4023 = true;
                                  Q4024: {
                                    _g4025.length = 0;
                                    G4026: {
                                      for (let _i4028 = 0; _i4028 < 1; _i4028++) {
                                        const v_x = v_t;
                                        const _h4029 = clueAt(cl.number, v_x);
                                        if (!((_h4029 !== -1))) continue;
                                        _g4025.push(v_x);
                                      }
                                    }
                                    _g4030.length = 0;
                                    weighed_st4044.pass++;
                                    G4031: {
                                      const _a4051 = throughWhere(sp, v_t, (_te4046: number): boolean => { let _c4048: boolean = ((_te4046 === _wc3789 ? _wd3790 : (_te4046 === _wc3787 ? _wd3788 : (b.grid[_te4046] || -1))) === 1); if (_c4048) {   const _t4047 = sp.edgeEnds[2 * _te4046];   _c4048 = !((clueAt(cl.number, _t4047) !== -1)); } let _c4050: boolean = _c4048; if (_c4050) {   const _t4049 = sp.edgeEnds[2 * _te4046 + 1];   _c4050 = !((clueAt(cl.number, _t4049) !== -1)); } return _c4050; });
                                      for (let _i4052 = 0; _i4052 < _a4051.length; _i4052++) {
                                        const v_t_4045 = _a4051[_i4052];
                                        const _h4055 = clueAt(cl.number, v_t_4045);
                                        const _h4056 = (_h4055 !== -1);
                                        const _h4057 = _h4056;
                                        const _h4058 = !(_h4057);
                                        const _a4053 = sp.adj4[v_t_4045];
                                        for (let _i4054 = 0; _i4054 < _a4053.length; _i4054++) {
                                          const v_x = _a4053[_i4054];
                                          const _h4059 = clueAt(cl.number, v_x);
                                          let _c4061: boolean = (_h4058 && (_h4059 !== -1));
                                          if (_c4061) {
                                            const _t4060 = sp.adj4Edges[v_t_4045][_i4054];
                                            _c4061 = ((_t4060 === _wc3789 ? _wd3790 : (_t4060 === _wc3787 ? _wd3788 : (b.grid[_t4060] || -1))) === 1);
                                          }
                                          if (!(_c4061)) continue;
                                          const _t4062 = v_x;
                                          if (_g4030.length < 16) { if (!_g4030.includes(_t4062)) _g4030.push(_t4062); } else addOnce(_g4030, weighed_st4044, _t4062);
                                        }
                                      }
                                    }
                                    const _a4063 = union(_g4025, _g4030);
                                    for (let _i4064 = 0; _i4064 < _a4063.length; _i4064++) {
                                      const v_p = _a4063[_i4064];
                                      const _h4103 = clueAt(cl.number, v_p);
                                      _g4065.length = 0;
                                      G4066: {
                                        for (let _i4068 = 0; _i4068 < 1; _i4068++) {
                                          const v_x = v_z;
                                          const _h4069 = clueAt(cl.number, v_x);
                                          if (!((_h4069 !== -1))) continue;
                                          _g4065.push(v_x);
                                        }
                                      }
                                      _g4070.length = 0;
                                      weighed_st4083.pass++;
                                      G4071: {
                                        const _a4089 = throughWhere(sp, v_z, (_te4084: number): boolean => { let _c4086: boolean = ((_te4084 === _wc3789 ? _wd3790 : (_te4084 === _wc3787 ? _wd3788 : (b.grid[_te4084] || -1))) === 1); if (_c4086) {   const _t4085 = sp.edgeEnds[2 * _te4084];   _c4086 = !((clueAt(cl.number, _t4085) !== -1)); } let _c4088: boolean = _c4086; if (_c4088) {   const _t4087 = sp.edgeEnds[2 * _te4084 + 1];   _c4088 = !((clueAt(cl.number, _t4087) !== -1)); } return _c4088; });
                                        for (let _i4090 = 0; _i4090 < _a4089.length; _i4090++) {
                                          const v_t = _a4089[_i4090];
                                          const _h4093 = clueAt(cl.number, v_t);
                                          const _h4094 = (_h4093 !== -1);
                                          const _h4095 = _h4094;
                                          const _h4096 = !(_h4095);
                                          const _a4091 = sp.adj4[v_t];
                                          for (let _i4092 = 0; _i4092 < _a4091.length; _i4092++) {
                                            const v_x = _a4091[_i4092];
                                            const _h4097 = clueAt(cl.number, v_x);
                                            let _c4099: boolean = (_h4096 && (_h4097 !== -1));
                                            if (_c4099) {
                                              const _t4098 = sp.adj4Edges[v_t][_i4092];
                                              _c4099 = ((_t4098 === _wc3789 ? _wd3790 : (_t4098 === _wc3787 ? _wd3788 : (b.grid[_t4098] || -1))) === 1);
                                            }
                                            if (!(_c4099)) continue;
                                            const _t4100 = v_x;
                                            if (_g4070.length < 16) { if (!_g4070.includes(_t4100)) _g4070.push(_t4100); } else addOnce(_g4070, weighed_st4083, _t4100);
                                          }
                                        }
                                      }
                                      const _a4101 = union(_g4065, _g4070);
                                      for (let _i4102 = 0; _i4102 < _a4101.length; _i4102++) {
                                        const v_q = _a4101[_i4102];
                                        const _h4104 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h4103 - _h4104)) === cl.step))) {
                                          _q4023 = false;
                                          break Q4024;
                                        }
                                      }
                                    }
                                  }
                                  _c4105 = _q4023;
                                }
                                if ((_c4105 && (_h2660 || !(throughWhere(sp, v_t, (_te4106: number): boolean => {  return ((_te4106 === _wc3789 ? _wd3790 : (_te4106 === _wc3787 ? _wd3788 : (b.grid[_te4106] || -1))) === 1); }).includes(v_z))))) {
                                  _q3979 = true;
                                  break Q3980;
                                }
                              }
                            }
                            _c4107 = _q3979;
                          }
                          if (_c4107) {
                            _q3833 = true;
                            break Q3834;
                          }
                        }
                      }
                      _c4108 = !(_q3833);
                    }
                    let _c4403: boolean = _c4108;
                    if (!_c4403) {
                      let _q4109 = false;
                      Q4110: {
                        const _a4111 = sp.adj4[v_t];
                        for (let _i4112 = 0; _i4112 < _a4111.length; _i4112++) {
                          const v_s = _a4111[_i4112];
                          let _g4113 = 0;
                          G4114: {
                            const _a4115 = sp.adj4[v_s];
                            for (let _i4116 = 0; _i4116 < _a4115.length; _i4116++) {
                              const _t4117 = sp.adj4Edges[v_s][_i4116];
                              if (!(((_t4117 === _wc3789 ? _wd3790 : (_t4117 === _wc3787 ? _wd3788 : (b.grid[_t4117] || -1))) === 1))) continue;
                              _g4113++;
                            }
                          }
                          let _g4118 = 0;
                          G4119: {
                            for (let _i4120 = 0; _i4120 < 1; _i4120++) {
                              const v_k = v_s;
                              const _h4121 = clueAt(cl.number, v_k);
                              const _h4128 = (_h4121 + 1);
                              let _c4130: boolean = (_h4121 !== -1);
                              if (_c4130) {
                                let _c4129: boolean = (_h2660 || (_h4121 === 1));
                                if (!_c4129) {
                                  let _g4122 = 0;
                                  G4123: {
                                    const _t4124 = (_h4121 + 1);
                                    const _a4125 = cluesValued(cl.number, _t4124);
                                    for (let _i4126 = 0; _i4126 < _a4125.length; _i4126++) {
                                      const v_x = _a4125[_i4126];
                                      const _h4127 = clueAt(cl.number, v_x);
                                      if (!((_h4127 === _h4128))) continue;
                                      _g4122++;
                                    }
                                  }
                                  _c4129 = (_g4122 === 0);
                                }
                                _c4130 = _c4129;
                              }
                              if (!(_c4130)) continue;
                              _g4118++;
                            }
                          }
                          let _c4402: boolean = (_g4113 < (2 - _g4118));
                          if (_c4402) {
                            let _q4131 = false;
                            Q4132: {
                              const _a4133 = sp.adj4[v_s];
                              for (let _i4134 = 0; _i4134 < _a4133.length; _i4134++) {
                                const v_y = _a4133[_i4134];
                                const _t4135 = sp.adj4Edges[v_s][_i4134];
                                let _c4154: boolean = !((_t4135 === _wc3789 ? true : (_t4135 === _wc3787 ? true : (b.grid[_t4135] !== 0))));
                                if (_c4154) {
                                  let _g4136 = 0;
                                  G4137: {
                                    const _a4138 = sp.adj4[v_s];
                                    for (let _i4139 = 0; _i4139 < _a4138.length; _i4139++) {
                                      const _t4140 = sp.adj4Edges[v_s][_i4139];
                                      if (!(((_t4140 === _wc3789 ? _wd3790 : (_t4140 === _wc3787 ? _wd3788 : (b.grid[_t4140] || -1))) === 1))) continue;
                                      _g4136++;
                                    }
                                  }
                                  let _g4141 = 0;
                                  G4142: {
                                    for (let _i4143 = 0; _i4143 < 1; _i4143++) {
                                      const v_k = v_s;
                                      const _h4144 = clueAt(cl.number, v_k);
                                      const _h4151 = (_h4144 + 1);
                                      let _c4153: boolean = (_h4144 !== -1);
                                      if (_c4153) {
                                        let _c4152: boolean = (_h2660 || (_h4144 === 1));
                                        if (!_c4152) {
                                          let _g4145 = 0;
                                          G4146: {
                                            const _t4147 = (_h4144 + 1);
                                            const _a4148 = cluesValued(cl.number, _t4147);
                                            for (let _i4149 = 0; _i4149 < _a4148.length; _i4149++) {
                                              const v_x = _a4148[_i4149];
                                              const _h4150 = clueAt(cl.number, v_x);
                                              if (!((_h4150 === _h4151))) continue;
                                              _g4145++;
                                            }
                                          }
                                          _c4152 = (_g4145 === 0);
                                        }
                                        _c4153 = _c4152;
                                      }
                                      if (!(_c4153)) continue;
                                      _g4141++;
                                    }
                                  }
                                  _c4154 = (_g4136 < (2 - _g4141));
                                }
                                let _c4174: boolean = _c4154;
                                if (_c4174) {
                                  let _g4155 = 0;
                                  G4156: {
                                    const _a4158 = sp.adj4[v_y];
                                    for (let _i4159 = 0; _i4159 < _a4158.length; _i4159++) {
                                      const _t4160 = sp.adj4Edges[v_y][_i4159];
                                      if (!(((_t4160 === _wc3789 ? _wd3790 : (_t4160 === _wc3787 ? _wd3788 : (b.grid[_t4160] || -1))) === 1))) continue;
                                      _g4155++;
                                    }
                                  }
                                  let _g4161 = 0;
                                  G4162: {
                                    for (let _i4163 = 0; _i4163 < 1; _i4163++) {
                                      const v_k = v_y;
                                      const _h4164 = clueAt(cl.number, v_k);
                                      const _h4171 = (_h4164 + 1);
                                      let _c4173: boolean = (_h4164 !== -1);
                                      if (_c4173) {
                                        let _c4172: boolean = (_h2660 || (_h4164 === 1));
                                        if (!_c4172) {
                                          let _g4165 = 0;
                                          G4166: {
                                            const _t4167 = (_h4164 + 1);
                                            const _a4168 = cluesValued(cl.number, _t4167);
                                            for (let _i4169 = 0; _i4169 < _a4168.length; _i4169++) {
                                              const v_x = _a4168[_i4169];
                                              const _h4170 = clueAt(cl.number, v_x);
                                              if (!((_h4170 === _h4171))) continue;
                                              _g4165++;
                                            }
                                          }
                                          _c4172 = (_g4165 === 0);
                                        }
                                        _c4173 = _c4172;
                                      }
                                      if (!(_c4173)) continue;
                                      _g4161++;
                                    }
                                  }
                                  _c4174 = (_g4155 < (2 - _g4161));
                                }
                                let _c4255: boolean = _c4174;
                                if (_c4255) {
                                  let _q4175 = true;
                                  Q4176: {
                                    _g4177.length = 0;
                                    G4178: {
                                      for (let _i4180 = 0; _i4180 < 1; _i4180++) {
                                        const v_x = v_s;
                                        const _h4181 = clueAt(cl.number, v_x);
                                        if (!((_h4181 !== -1))) continue;
                                        _g4177.push(v_x);
                                      }
                                    }
                                    _g4182.length = 0;
                                    weighed_st4195.pass++;
                                    G4183: {
                                      const _a4201 = throughWhere(sp, v_s, (_te4196: number): boolean => { let _c4198: boolean = ((_te4196 === _wc3789 ? _wd3790 : (_te4196 === _wc3787 ? _wd3788 : (b.grid[_te4196] || -1))) === 1); if (_c4198) {   const _t4197 = sp.edgeEnds[2 * _te4196];   _c4198 = !((clueAt(cl.number, _t4197) !== -1)); } let _c4200: boolean = _c4198; if (_c4200) {   const _t4199 = sp.edgeEnds[2 * _te4196 + 1];   _c4200 = !((clueAt(cl.number, _t4199) !== -1)); } return _c4200; });
                                      for (let _i4202 = 0; _i4202 < _a4201.length; _i4202++) {
                                        const v_t = _a4201[_i4202];
                                        const _h4205 = clueAt(cl.number, v_t);
                                        const _h4206 = (_h4205 !== -1);
                                        const _h4207 = _h4206;
                                        const _h4208 = !(_h4207);
                                        const _a4203 = sp.adj4[v_t];
                                        for (let _i4204 = 0; _i4204 < _a4203.length; _i4204++) {
                                          const v_x = _a4203[_i4204];
                                          const _h4209 = clueAt(cl.number, v_x);
                                          let _c4211: boolean = (_h4208 && (_h4209 !== -1));
                                          if (_c4211) {
                                            const _t4210 = sp.adj4Edges[v_t][_i4204];
                                            _c4211 = ((_t4210 === _wc3789 ? _wd3790 : (_t4210 === _wc3787 ? _wd3788 : (b.grid[_t4210] || -1))) === 1);
                                          }
                                          if (!(_c4211)) continue;
                                          const _t4212 = v_x;
                                          if (_g4182.length < 16) { if (!_g4182.includes(_t4212)) _g4182.push(_t4212); } else addOnce(_g4182, weighed_st4195, _t4212);
                                        }
                                      }
                                    }
                                    const _a4213 = union(_g4177, _g4182);
                                    for (let _i4214 = 0; _i4214 < _a4213.length; _i4214++) {
                                      const v_p = _a4213[_i4214];
                                      const _h4253 = clueAt(cl.number, v_p);
                                      _g4215.length = 0;
                                      G4216: {
                                        for (let _i4218 = 0; _i4218 < 1; _i4218++) {
                                          const v_x = v_y;
                                          const _h4219 = clueAt(cl.number, v_x);
                                          if (!((_h4219 !== -1))) continue;
                                          _g4215.push(v_x);
                                        }
                                      }
                                      _g4220.length = 0;
                                      weighed_st4233.pass++;
                                      G4221: {
                                        const _a4239 = throughWhere(sp, v_y, (_te4234: number): boolean => { let _c4236: boolean = ((_te4234 === _wc3789 ? _wd3790 : (_te4234 === _wc3787 ? _wd3788 : (b.grid[_te4234] || -1))) === 1); if (_c4236) {   const _t4235 = sp.edgeEnds[2 * _te4234];   _c4236 = !((clueAt(cl.number, _t4235) !== -1)); } let _c4238: boolean = _c4236; if (_c4238) {   const _t4237 = sp.edgeEnds[2 * _te4234 + 1];   _c4238 = !((clueAt(cl.number, _t4237) !== -1)); } return _c4238; });
                                        for (let _i4240 = 0; _i4240 < _a4239.length; _i4240++) {
                                          const v_t = _a4239[_i4240];
                                          const _h4243 = clueAt(cl.number, v_t);
                                          const _h4244 = (_h4243 !== -1);
                                          const _h4245 = _h4244;
                                          const _h4246 = !(_h4245);
                                          const _a4241 = sp.adj4[v_t];
                                          for (let _i4242 = 0; _i4242 < _a4241.length; _i4242++) {
                                            const v_x = _a4241[_i4242];
                                            const _h4247 = clueAt(cl.number, v_x);
                                            let _c4249: boolean = (_h4246 && (_h4247 !== -1));
                                            if (_c4249) {
                                              const _t4248 = sp.adj4Edges[v_t][_i4242];
                                              _c4249 = ((_t4248 === _wc3789 ? _wd3790 : (_t4248 === _wc3787 ? _wd3788 : (b.grid[_t4248] || -1))) === 1);
                                            }
                                            if (!(_c4249)) continue;
                                            const _t4250 = v_x;
                                            if (_g4220.length < 16) { if (!_g4220.includes(_t4250)) _g4220.push(_t4250); } else addOnce(_g4220, weighed_st4233, _t4250);
                                          }
                                        }
                                      }
                                      const _a4251 = union(_g4215, _g4220);
                                      for (let _i4252 = 0; _i4252 < _a4251.length; _i4252++) {
                                        const v_q = _a4251[_i4252];
                                        const _h4254 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h4253 - _h4254)) === cl.step))) {
                                          _q4175 = false;
                                          break Q4176;
                                        }
                                      }
                                    }
                                  }
                                  _c4255 = _q4175;
                                }
                                if (!((_c4255 && (_h2660 || !(throughWhere(sp, v_s, (_te4256: number): boolean => {  return ((_te4256 === _wc3789 ? _wd3790 : (_te4256 === _wc3787 ? _wd3788 : (b.grid[_te4256] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g4257 = 0;
                                G4258: {
                                  const _a4259 = sp.adj4[v_s];
                                  for (let _i4260 = 0; _i4260 < _a4259.length; _i4260++) {
                                    const _t4261 = sp.adj4Edges[v_s][_i4260];
                                    if (!(((_t4261 === _wc3789 ? _wd3790 : (_t4261 === _wc3787 ? _wd3788 : (b.grid[_t4261] || -1))) === 1))) continue;
                                    _g4257++;
                                  }
                                }
                                let _g4262 = 0;
                                G4263: {
                                  for (let _i4264 = 0; _i4264 < 1; _i4264++) {
                                    const v_k = v_s;
                                    const _h4265 = clueAt(cl.number, v_k);
                                    const _h4272 = (_h4265 + 1);
                                    let _c4274: boolean = (_h4265 !== -1);
                                    if (_c4274) {
                                      let _c4273: boolean = (_h2660 || (_h4265 === 1));
                                      if (!_c4273) {
                                        let _g4266 = 0;
                                        G4267: {
                                          const _t4268 = (_h4265 + 1);
                                          const _a4269 = cluesValued(cl.number, _t4268);
                                          for (let _i4270 = 0; _i4270 < _a4269.length; _i4270++) {
                                            const v_x = _a4269[_i4270];
                                            const _h4271 = clueAt(cl.number, v_x);
                                            if (!((_h4271 === _h4272))) continue;
                                            _g4266++;
                                          }
                                        }
                                        _c4273 = (_g4266 === 0);
                                      }
                                      _c4274 = _c4273;
                                    }
                                    if (!(_c4274)) continue;
                                    _g4262++;
                                  }
                                }
                                let _c4401: boolean = ((_g4257 + 1) === (2 - _g4262));
                                if (!_c4401) {
                                  let _q4275 = false;
                                  Q4276: {
                                    const _a4277 = sp.adj4[v_s];
                                    const _n4278 = _i4134;
                                    for (let _i4279 = 0; _i4279 < _n4278; _i4279++) {
                                      const v_z = _a4277[_i4279];
                                      const _t4280 = sp.adj4Edges[v_s][_i4279];
                                      let _c4299: boolean = !((_t4280 === _wc3789 ? true : (_t4280 === _wc3787 ? true : (b.grid[_t4280] !== 0))));
                                      if (_c4299) {
                                        let _g4281 = 0;
                                        G4282: {
                                          const _a4283 = sp.adj4[v_s];
                                          for (let _i4284 = 0; _i4284 < _a4283.length; _i4284++) {
                                            const _t4285 = sp.adj4Edges[v_s][_i4284];
                                            if (!(((_t4285 === _wc3789 ? _wd3790 : (_t4285 === _wc3787 ? _wd3788 : (b.grid[_t4285] || -1))) === 1))) continue;
                                            _g4281++;
                                          }
                                        }
                                        let _g4286 = 0;
                                        G4287: {
                                          for (let _i4288 = 0; _i4288 < 1; _i4288++) {
                                            const v_k = v_s;
                                            const _h4289 = clueAt(cl.number, v_k);
                                            const _h4296 = (_h4289 + 1);
                                            let _c4298: boolean = (_h4289 !== -1);
                                            if (_c4298) {
                                              let _c4297: boolean = (_h2660 || (_h4289 === 1));
                                              if (!_c4297) {
                                                let _g4290 = 0;
                                                G4291: {
                                                  const _t4292 = (_h4289 + 1);
                                                  const _a4293 = cluesValued(cl.number, _t4292);
                                                  for (let _i4294 = 0; _i4294 < _a4293.length; _i4294++) {
                                                    const v_x = _a4293[_i4294];
                                                    const _h4295 = clueAt(cl.number, v_x);
                                                    if (!((_h4295 === _h4296))) continue;
                                                    _g4290++;
                                                  }
                                                }
                                                _c4297 = (_g4290 === 0);
                                              }
                                              _c4298 = _c4297;
                                            }
                                            if (!(_c4298)) continue;
                                            _g4286++;
                                          }
                                        }
                                        _c4299 = (_g4281 < (2 - _g4286));
                                      }
                                      let _c4318: boolean = _c4299;
                                      if (_c4318) {
                                        let _g4300 = 0;
                                        G4301: {
                                          const _a4302 = sp.adj4[v_z];
                                          for (let _i4303 = 0; _i4303 < _a4302.length; _i4303++) {
                                            const _t4304 = sp.adj4Edges[v_z][_i4303];
                                            if (!(((_t4304 === _wc3789 ? _wd3790 : (_t4304 === _wc3787 ? _wd3788 : (b.grid[_t4304] || -1))) === 1))) continue;
                                            _g4300++;
                                          }
                                        }
                                        let _g4305 = 0;
                                        G4306: {
                                          for (let _i4307 = 0; _i4307 < 1; _i4307++) {
                                            const v_k = v_z;
                                            const _h4308 = clueAt(cl.number, v_k);
                                            const _h4315 = (_h4308 + 1);
                                            let _c4317: boolean = (_h4308 !== -1);
                                            if (_c4317) {
                                              let _c4316: boolean = (_h2660 || (_h4308 === 1));
                                              if (!_c4316) {
                                                let _g4309 = 0;
                                                G4310: {
                                                  const _t4311 = (_h4308 + 1);
                                                  const _a4312 = cluesValued(cl.number, _t4311);
                                                  for (let _i4313 = 0; _i4313 < _a4312.length; _i4313++) {
                                                    const v_x = _a4312[_i4313];
                                                    const _h4314 = clueAt(cl.number, v_x);
                                                    if (!((_h4314 === _h4315))) continue;
                                                    _g4309++;
                                                  }
                                                }
                                                _c4316 = (_g4309 === 0);
                                              }
                                              _c4317 = _c4316;
                                            }
                                            if (!(_c4317)) continue;
                                            _g4305++;
                                          }
                                        }
                                        _c4318 = (_g4300 < (2 - _g4305));
                                      }
                                      let _c4399: boolean = _c4318;
                                      if (_c4399) {
                                        let _q4319 = true;
                                        Q4320: {
                                          _g4321.length = 0;
                                          G4322: {
                                            for (let _i4324 = 0; _i4324 < 1; _i4324++) {
                                              const v_x = v_s;
                                              const _h4325 = clueAt(cl.number, v_x);
                                              if (!((_h4325 !== -1))) continue;
                                              _g4321.push(v_x);
                                            }
                                          }
                                          _g4326.length = 0;
                                          weighed_st4339.pass++;
                                          G4327: {
                                            const _a4345 = throughWhere(sp, v_s, (_te4340: number): boolean => { let _c4342: boolean = ((_te4340 === _wc3789 ? _wd3790 : (_te4340 === _wc3787 ? _wd3788 : (b.grid[_te4340] || -1))) === 1); if (_c4342) {   const _t4341 = sp.edgeEnds[2 * _te4340];   _c4342 = !((clueAt(cl.number, _t4341) !== -1)); } let _c4344: boolean = _c4342; if (_c4344) {   const _t4343 = sp.edgeEnds[2 * _te4340 + 1];   _c4344 = !((clueAt(cl.number, _t4343) !== -1)); } return _c4344; });
                                            for (let _i4346 = 0; _i4346 < _a4345.length; _i4346++) {
                                              const v_t = _a4345[_i4346];
                                              const _h4349 = clueAt(cl.number, v_t);
                                              const _h4350 = (_h4349 !== -1);
                                              const _h4351 = _h4350;
                                              const _h4352 = !(_h4351);
                                              const _a4347 = sp.adj4[v_t];
                                              for (let _i4348 = 0; _i4348 < _a4347.length; _i4348++) {
                                                const v_x = _a4347[_i4348];
                                                const _h4353 = clueAt(cl.number, v_x);
                                                let _c4355: boolean = (_h4352 && (_h4353 !== -1));
                                                if (_c4355) {
                                                  const _t4354 = sp.adj4Edges[v_t][_i4348];
                                                  _c4355 = ((_t4354 === _wc3789 ? _wd3790 : (_t4354 === _wc3787 ? _wd3788 : (b.grid[_t4354] || -1))) === 1);
                                                }
                                                if (!(_c4355)) continue;
                                                const _t4356 = v_x;
                                                if (_g4326.length < 16) { if (!_g4326.includes(_t4356)) _g4326.push(_t4356); } else addOnce(_g4326, weighed_st4339, _t4356);
                                              }
                                            }
                                          }
                                          const _a4357 = union(_g4321, _g4326);
                                          for (let _i4358 = 0; _i4358 < _a4357.length; _i4358++) {
                                            const v_p = _a4357[_i4358];
                                            const _h4397 = clueAt(cl.number, v_p);
                                            _g4359.length = 0;
                                            G4360: {
                                              for (let _i4362 = 0; _i4362 < 1; _i4362++) {
                                                const v_x = v_z;
                                                const _h4363 = clueAt(cl.number, v_x);
                                                if (!((_h4363 !== -1))) continue;
                                                _g4359.push(v_x);
                                              }
                                            }
                                            _g4364.length = 0;
                                            weighed_st4377.pass++;
                                            G4365: {
                                              const _a4383 = throughWhere(sp, v_z, (_te4378: number): boolean => { let _c4380: boolean = ((_te4378 === _wc3789 ? _wd3790 : (_te4378 === _wc3787 ? _wd3788 : (b.grid[_te4378] || -1))) === 1); if (_c4380) {   const _t4379 = sp.edgeEnds[2 * _te4378];   _c4380 = !((clueAt(cl.number, _t4379) !== -1)); } let _c4382: boolean = _c4380; if (_c4382) {   const _t4381 = sp.edgeEnds[2 * _te4378 + 1];   _c4382 = !((clueAt(cl.number, _t4381) !== -1)); } return _c4382; });
                                              for (let _i4384 = 0; _i4384 < _a4383.length; _i4384++) {
                                                const v_t = _a4383[_i4384];
                                                const _h4387 = clueAt(cl.number, v_t);
                                                const _h4388 = (_h4387 !== -1);
                                                const _h4389 = _h4388;
                                                const _h4390 = !(_h4389);
                                                const _a4385 = sp.adj4[v_t];
                                                for (let _i4386 = 0; _i4386 < _a4385.length; _i4386++) {
                                                  const v_x = _a4385[_i4386];
                                                  const _h4391 = clueAt(cl.number, v_x);
                                                  let _c4393: boolean = (_h4390 && (_h4391 !== -1));
                                                  if (_c4393) {
                                                    const _t4392 = sp.adj4Edges[v_t][_i4386];
                                                    _c4393 = ((_t4392 === _wc3789 ? _wd3790 : (_t4392 === _wc3787 ? _wd3788 : (b.grid[_t4392] || -1))) === 1);
                                                  }
                                                  if (!(_c4393)) continue;
                                                  const _t4394 = v_x;
                                                  if (_g4364.length < 16) { if (!_g4364.includes(_t4394)) _g4364.push(_t4394); } else addOnce(_g4364, weighed_st4377, _t4394);
                                                }
                                              }
                                            }
                                            const _a4395 = union(_g4359, _g4364);
                                            for (let _i4396 = 0; _i4396 < _a4395.length; _i4396++) {
                                              const v_q = _a4395[_i4396];
                                              const _h4398 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h4397 - _h4398)) === cl.step))) {
                                                _q4319 = false;
                                                break Q4320;
                                              }
                                            }
                                          }
                                        }
                                        _c4399 = _q4319;
                                      }
                                      if ((_c4399 && (_h2660 || !(throughWhere(sp, v_s, (_te4400: number): boolean => {  return ((_te4400 === _wc3789 ? _wd3790 : (_te4400 === _wc3787 ? _wd3788 : (b.grid[_te4400] || -1))) === 1); }).includes(v_z))))) {
                                        _q4275 = true;
                                        break Q4276;
                                      }
                                    }
                                  }
                                  _c4401 = _q4275;
                                }
                                if (_c4401) {
                                  _q4131 = true;
                                  break Q4132;
                                }
                              }
                            }
                            _c4402 = !(_q4131);
                          }
                          if (_c4402) {
                            _q4109 = true;
                            break Q4110;
                          }
                        }
                      }
                      _c4403 = _q4109;
                    }
                    if (_c4403) {
                      _q3791 = true;
                      break Q3792;
                    }
                  }
                }
                _c4404 = _q3791;
              }
              _c4405 = _c4404;
            }
            if (!(_c4405)) continue;
            const _t4407 = minus(v_U, setOf(_h4406, v_i, v_j));
            const _t4408 = (_t4407.length > 0 ? _t4407[0] : -1);
            const _t4409 = _t4408;
            if (_g3263.length < 16) { if (!_g3263.includes(_t4409)) _g3263.push(_t4409); } else addOnce(_g3263, weighed_st3779, _t4409);
          }
        }
      }
      const v_B = _g3263;
      const _h4444 = v_B.length;
      const _h4445 = (_h4444 === 3);
      _g4410.length = 0;
      G4411: {
        const _a4421 = v_U;
        for (let _i4422 = 0; _i4422 < _a4421.length; _i4422++) {
          const v_y = _a4421[_i4422];
          let _c4431: boolean = ((_i4422 === 0) && _h4424);
          if (!_c4431) {
            let _c4430: boolean = (_i4422 > 0);
            if (_c4430) {
              let _c4429: boolean = !(v_A.includes(v_y));
              if (!_c4429) {
                let _q4425 = false;
                Q4426: {
                  const _a4427 = v_U;
                  for (let _i4428 = 0; _i4428 < _a4427.length; _i4428++) {
                    const v_m = _a4427[_i4428];
                    if (!(((_i4428 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q4425 = true;
                      break Q4426;
                    }
                  }
                }
                _c4429 = _q4425;
              }
              _c4430 = _c4429;
            }
            _c4431 = _c4430;
          }
          if (!(_c4431)) continue;
          _g4410.push(v_y);
        }
      }
      const v_N = _g4410;
      const _h4453 = v_N.length;
      _g4432.length = 0;
      G4433: {
        const _a4442 = v_N;
        for (let _i4443 = 0; _i4443 < _a4442.length; _i4443++) {
          const v_y = _a4442[_i4443];
          let _c4451: boolean = ((v_U.indexOf(v_y) === 0) && _h4445);
          if (!_c4451) {
            let _c4450: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c4450) {
              let _q4446 = true;
              Q4447: {
                const _a4448 = v_U;
                for (let _i4449 = 0; _i4449 < _a4448.length; _i4449++) {
                  const v_m = _a4448[_i4449];
                  if (!(((_i4449 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q4446 = false;
                    break Q4447;
                  }
                }
              }
              _c4450 = _q4446;
            }
            _c4451 = _c4450;
          }
          if (!(_c4451)) continue;
          _g4432.push(v_y);
        }
      }
      const v_P = _g4432;
      const _h4454 = v_P.length;
      L4452: {
        const v_X = minus(v_U, v_N);
        const _h4455 = v_X.length;
        if (!((((_h4453 === 0) || (_h4454 > 0)) || (_h4455 > 0)))) break L4452;
        if (DEV && staleChecking) {
          let _g4456 = 0;
          G4457: {
            const _a4458 = sp.adj4[v_c];
            for (let _i4459 = 0; _i4459 < _a4458.length; _i4459++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i4459]] || -1) === 1))) continue;
              _g4456++;
            }
          }
          const _g4460: number[] = [];
          G4461: {
            const _a4975 = v_U;
            for (let _i4976 = 0; _i4976 < _a4975.length; _i4976++) {
              const v_i = _a4975[_i4976];
              const _a4977 = v_U;
              for (let _i4978 = 0; _i4978 < _a4977.length; _i4978++) {
                const v_j = _a4977[_i4978];
                let _c5487: boolean = ((_i4976 === 0) && (_i4978 > 0));
                if (_c5487) {
                  let _c5486: boolean = ((throughWhere(sp, v_i, (_te4979: number): boolean => {  return ((b.grid[_te4979] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
                  if (!_c5486) {
                    const _wc4980 = sp.edgeOf(v_c, v_i);
                    const _wd4981 = 1;
                    const _wc4982 = sp.edgeOf(v_c, v_j);
                    const _wd4983 = 1;
                    let _q4984 = false;
                    Q4985: {
                      const _a4987 = throughWhere(sp, v_c, (_te4986: number): boolean => {  return ((_te4986 === _wc4982 ? _wd4983 : (_te4986 === _wc4980 ? _wd4981 : (b.grid[_te4986] || -1))) === 1); });
                      for (let _i4988 = 0; _i4988 < _a4987.length; _i4988++) {
                        const v_t = _a4987[_i4988];
                        let _c5004: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                        if (!_c5004) {
                          let _g4989 = 0;
                          G4990: {
                            const _a4991 = sp.adj4[v_t];
                            for (let _i4992 = 0; _i4992 < _a4991.length; _i4992++) {
                              const _t4993 = sp.adj4Edges[v_t][_i4992];
                              if (!(((_t4993 === _wc4982 ? _wd4983 : (_t4993 === _wc4980 ? _wd4981 : (b.grid[_t4993] || -1))) === 1))) continue;
                              _g4989++;
                            }
                          }
                          let _g4994 = 0;
                          G4995: {
                            for (let _i4996 = 0; _i4996 < 1; _i4996++) {
                              const v_k = v_t;
                              let _c5003: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c5003) {
                                let _c5002: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c5002) {
                                  let _g4997 = 0;
                                  G4998: {
                                    const _t4999 = (clueAt(cl.number, v_k) + 1);
                                    const _a5000 = cluesValued(cl.number, _t4999);
                                    for (let _i5001 = 0; _i5001 < _a5000.length; _i5001++) {
                                      const v_x = _a5000[_i5001];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g4997++;
                                    }
                                  }
                                  _c5002 = (_g4997 === 0);
                                }
                                _c5003 = _c5002;
                              }
                              if (!(_c5003)) continue;
                              _g4994++;
                            }
                          }
                          _c5004 = (_g4989 < (2 - _g4994));
                        }
                        if (!(_c5004)) continue;
                        let _g5005 = 0;
                        G5006: {
                          const _a5007 = sp.adj4[v_t];
                          for (let _i5008 = 0; _i5008 < _a5007.length; _i5008++) {
                            const _t5009 = sp.adj4Edges[v_t][_i5008];
                            if (!(((_t5009 === _wc4982 ? _wd4983 : (_t5009 === _wc4980 ? _wd4981 : (b.grid[_t5009] || -1))) === 1))) continue;
                            _g5005++;
                          }
                        }
                        let _g5010 = 0;
                        G5011: {
                          for (let _i5012 = 0; _i5012 < 1; _i5012++) {
                            const v_k = v_t;
                            let _c5019: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c5019) {
                              let _c5018: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c5018) {
                                let _g5013 = 0;
                                G5014: {
                                  const _t5015 = (clueAt(cl.number, v_k) + 1);
                                  const _a5016 = cluesValued(cl.number, _t5015);
                                  for (let _i5017 = 0; _i5017 < _a5016.length; _i5017++) {
                                    const v_x = _a5016[_i5017];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g5013++;
                                  }
                                }
                                _c5018 = (_g5013 === 0);
                              }
                              _c5019 = _c5018;
                            }
                            if (!(_c5019)) continue;
                            _g5010++;
                          }
                        }
                        let _c5244: boolean = (_g5005 < (2 - _g5010));
                        if (_c5244) {
                          let _q5020 = false;
                          Q5021: {
                            const _a5022 = sp.adj4[v_t];
                            for (let _i5023 = 0; _i5023 < _a5022.length; _i5023++) {
                              const v_y = _a5022[_i5023];
                              const _t5024 = sp.adj4Edges[v_t][_i5023];
                              let _c5040: boolean = !((_t5024 === _wc4982 ? true : (_t5024 === _wc4980 ? true : (b.grid[_t5024] !== 0))));
                              if (_c5040) {
                                let _g5025 = 0;
                                G5026: {
                                  const _a5027 = sp.adj4[v_t];
                                  for (let _i5028 = 0; _i5028 < _a5027.length; _i5028++) {
                                    const _t5029 = sp.adj4Edges[v_t][_i5028];
                                    if (!(((_t5029 === _wc4982 ? _wd4983 : (_t5029 === _wc4980 ? _wd4981 : (b.grid[_t5029] || -1))) === 1))) continue;
                                    _g5025++;
                                  }
                                }
                                let _g5030 = 0;
                                G5031: {
                                  for (let _i5032 = 0; _i5032 < 1; _i5032++) {
                                    const v_k = v_t;
                                    let _c5039: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c5039) {
                                      let _c5038: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c5038) {
                                        let _g5033 = 0;
                                        G5034: {
                                          const _t5035 = (clueAt(cl.number, v_k) + 1);
                                          const _a5036 = cluesValued(cl.number, _t5035);
                                          for (let _i5037 = 0; _i5037 < _a5036.length; _i5037++) {
                                            const v_x = _a5036[_i5037];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g5033++;
                                          }
                                        }
                                        _c5038 = (_g5033 === 0);
                                      }
                                      _c5039 = _c5038;
                                    }
                                    if (!(_c5039)) continue;
                                    _g5030++;
                                  }
                                }
                                _c5040 = (_g5025 < (2 - _g5030));
                              }
                              let _c5057: boolean = _c5040;
                              if (_c5057) {
                                let _g5041 = 0;
                                G5042: {
                                  const _a5044 = sp.adj4[v_y];
                                  for (let _i5045 = 0; _i5045 < _a5044.length; _i5045++) {
                                    const _t5046 = sp.adj4Edges[v_y][_i5045];
                                    if (!(((_t5046 === _wc4982 ? _wd4983 : (_t5046 === _wc4980 ? _wd4981 : (b.grid[_t5046] || -1))) === 1))) continue;
                                    _g5041++;
                                  }
                                }
                                let _g5047 = 0;
                                G5048: {
                                  for (let _i5049 = 0; _i5049 < 1; _i5049++) {
                                    const v_k = v_y;
                                    let _c5056: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c5056) {
                                      let _c5055: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c5055) {
                                        let _g5050 = 0;
                                        G5051: {
                                          const _t5052 = (clueAt(cl.number, v_k) + 1);
                                          const _a5053 = cluesValued(cl.number, _t5052);
                                          for (let _i5054 = 0; _i5054 < _a5053.length; _i5054++) {
                                            const v_x = _a5053[_i5054];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g5050++;
                                          }
                                        }
                                        _c5055 = (_g5050 === 0);
                                      }
                                      _c5056 = _c5055;
                                    }
                                    if (!(_c5056)) continue;
                                    _g5047++;
                                  }
                                }
                                _c5057 = (_g5041 < (2 - _g5047));
                              }
                              let _c5122: boolean = _c5057;
                              if (_c5122) {
                                let _q5058 = true;
                                Q5059: {
                                  const _g5060: number[] = [];
                                  G5061: {
                                    for (let _i5063 = 0; _i5063 < 1; _i5063++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g5060.push(v_x);
                                    }
                                  }
                                  const _g5064: number[] = [];
                                  G5065: {
                                    const _a5084 = throughWhere(sp, v_t, (_te5079: number): boolean => { let _c5081: boolean = ((_te5079 === _wc4982 ? _wd4983 : (_te5079 === _wc4980 ? _wd4981 : (b.grid[_te5079] || -1))) === 1); if (_c5081) {   const _t5080 = sp.edgeEnds[2 * _te5079];   _c5081 = !((clueAt(cl.number, _t5080) !== -1)); } let _c5083: boolean = _c5081; if (_c5083) {   const _t5082 = sp.edgeEnds[2 * _te5079 + 1];   _c5083 = !((clueAt(cl.number, _t5082) !== -1)); } return _c5083; });
                                    for (let _i5085 = 0; _i5085 < _a5084.length; _i5085++) {
                                      const v_t_5078 = _a5084[_i5085];
                                      const _a5086 = sp.adj4[v_t_5078];
                                      for (let _i5087 = 0; _i5087 < _a5086.length; _i5087++) {
                                        const v_x = _a5086[_i5087];
                                        let _c5089: boolean = (!((clueAt(cl.number, v_t_5078) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c5089) {
                                          const _t5088 = sp.adj4Edges[v_t_5078][_i5087];
                                          _c5089 = ((_t5088 === _wc4982 ? _wd4983 : (_t5088 === _wc4980 ? _wd4981 : (b.grid[_t5088] || -1))) === 1);
                                        }
                                        if (!(_c5089)) continue;
                                        if (!_g5064.includes(v_x)) _g5064.push(v_x);
                                      }
                                    }
                                  }
                                  const _a5090 = union(_g5060, _g5064);
                                  for (let _i5091 = 0; _i5091 < _a5090.length; _i5091++) {
                                    const v_p = _a5090[_i5091];
                                    const _g5092: number[] = [];
                                    G5093: {
                                      for (let _i5095 = 0; _i5095 < 1; _i5095++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g5092.push(v_x);
                                      }
                                    }
                                    const _g5096: number[] = [];
                                    G5097: {
                                      const _a5114 = throughWhere(sp, v_y, (_te5109: number): boolean => { let _c5111: boolean = ((_te5109 === _wc4982 ? _wd4983 : (_te5109 === _wc4980 ? _wd4981 : (b.grid[_te5109] || -1))) === 1); if (_c5111) {   const _t5110 = sp.edgeEnds[2 * _te5109];   _c5111 = !((clueAt(cl.number, _t5110) !== -1)); } let _c5113: boolean = _c5111; if (_c5113) {   const _t5112 = sp.edgeEnds[2 * _te5109 + 1];   _c5113 = !((clueAt(cl.number, _t5112) !== -1)); } return _c5113; });
                                      for (let _i5115 = 0; _i5115 < _a5114.length; _i5115++) {
                                        const v_t = _a5114[_i5115];
                                        const _a5116 = sp.adj4[v_t];
                                        for (let _i5117 = 0; _i5117 < _a5116.length; _i5117++) {
                                          const v_x = _a5116[_i5117];
                                          let _c5119: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c5119) {
                                            const _t5118 = sp.adj4Edges[v_t][_i5117];
                                            _c5119 = ((_t5118 === _wc4982 ? _wd4983 : (_t5118 === _wc4980 ? _wd4981 : (b.grid[_t5118] || -1))) === 1);
                                          }
                                          if (!(_c5119)) continue;
                                          if (!_g5096.includes(v_x)) _g5096.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5120 = union(_g5092, _g5096);
                                    for (let _i5121 = 0; _i5121 < _a5120.length; _i5121++) {
                                      const v_q = _a5120[_i5121];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q5058 = false;
                                        break Q5059;
                                      }
                                    }
                                  }
                                }
                                _c5122 = _q5058;
                              }
                              if (!((_c5122 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te5123: number): boolean => {  return ((_te5123 === _wc4982 ? _wd4983 : (_te5123 === _wc4980 ? _wd4981 : (b.grid[_te5123] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g5124 = 0;
                              G5125: {
                                const _a5126 = sp.adj4[v_t];
                                for (let _i5127 = 0; _i5127 < _a5126.length; _i5127++) {
                                  const _t5128 = sp.adj4Edges[v_t][_i5127];
                                  if (!(((_t5128 === _wc4982 ? _wd4983 : (_t5128 === _wc4980 ? _wd4981 : (b.grid[_t5128] || -1))) === 1))) continue;
                                  _g5124++;
                                }
                              }
                              let _g5129 = 0;
                              G5130: {
                                for (let _i5131 = 0; _i5131 < 1; _i5131++) {
                                  const v_k = v_t;
                                  let _c5138: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c5138) {
                                    let _c5137: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c5137) {
                                      let _g5132 = 0;
                                      G5133: {
                                        const _t5134 = (clueAt(cl.number, v_k) + 1);
                                        const _a5135 = cluesValued(cl.number, _t5134);
                                        for (let _i5136 = 0; _i5136 < _a5135.length; _i5136++) {
                                          const v_x = _a5135[_i5136];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g5132++;
                                        }
                                      }
                                      _c5137 = (_g5132 === 0);
                                    }
                                    _c5138 = _c5137;
                                  }
                                  if (!(_c5138)) continue;
                                  _g5129++;
                                }
                              }
                              let _c5243: boolean = ((_g5124 + 1) === (2 - _g5129));
                              if (!_c5243) {
                                let _q5139 = false;
                                Q5140: {
                                  const _a5141 = sp.adj4[v_t];
                                  const _n5142 = _i5023;
                                  for (let _i5143 = 0; _i5143 < _n5142; _i5143++) {
                                    const v_z = _a5141[_i5143];
                                    const _t5144 = sp.adj4Edges[v_t][_i5143];
                                    let _c5160: boolean = !((_t5144 === _wc4982 ? true : (_t5144 === _wc4980 ? true : (b.grid[_t5144] !== 0))));
                                    if (_c5160) {
                                      let _g5145 = 0;
                                      G5146: {
                                        const _a5147 = sp.adj4[v_t];
                                        for (let _i5148 = 0; _i5148 < _a5147.length; _i5148++) {
                                          const _t5149 = sp.adj4Edges[v_t][_i5148];
                                          if (!(((_t5149 === _wc4982 ? _wd4983 : (_t5149 === _wc4980 ? _wd4981 : (b.grid[_t5149] || -1))) === 1))) continue;
                                          _g5145++;
                                        }
                                      }
                                      let _g5150 = 0;
                                      G5151: {
                                        for (let _i5152 = 0; _i5152 < 1; _i5152++) {
                                          const v_k = v_t;
                                          let _c5159: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c5159) {
                                            let _c5158: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c5158) {
                                              let _g5153 = 0;
                                              G5154: {
                                                const _t5155 = (clueAt(cl.number, v_k) + 1);
                                                const _a5156 = cluesValued(cl.number, _t5155);
                                                for (let _i5157 = 0; _i5157 < _a5156.length; _i5157++) {
                                                  const v_x = _a5156[_i5157];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g5153++;
                                                }
                                              }
                                              _c5158 = (_g5153 === 0);
                                            }
                                            _c5159 = _c5158;
                                          }
                                          if (!(_c5159)) continue;
                                          _g5150++;
                                        }
                                      }
                                      _c5160 = (_g5145 < (2 - _g5150));
                                    }
                                    let _c5176: boolean = _c5160;
                                    if (_c5176) {
                                      let _g5161 = 0;
                                      G5162: {
                                        const _a5163 = sp.adj4[v_z];
                                        for (let _i5164 = 0; _i5164 < _a5163.length; _i5164++) {
                                          const _t5165 = sp.adj4Edges[v_z][_i5164];
                                          if (!(((_t5165 === _wc4982 ? _wd4983 : (_t5165 === _wc4980 ? _wd4981 : (b.grid[_t5165] || -1))) === 1))) continue;
                                          _g5161++;
                                        }
                                      }
                                      let _g5166 = 0;
                                      G5167: {
                                        for (let _i5168 = 0; _i5168 < 1; _i5168++) {
                                          const v_k = v_z;
                                          let _c5175: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c5175) {
                                            let _c5174: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c5174) {
                                              let _g5169 = 0;
                                              G5170: {
                                                const _t5171 = (clueAt(cl.number, v_k) + 1);
                                                const _a5172 = cluesValued(cl.number, _t5171);
                                                for (let _i5173 = 0; _i5173 < _a5172.length; _i5173++) {
                                                  const v_x = _a5172[_i5173];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g5169++;
                                                }
                                              }
                                              _c5174 = (_g5169 === 0);
                                            }
                                            _c5175 = _c5174;
                                          }
                                          if (!(_c5175)) continue;
                                          _g5166++;
                                        }
                                      }
                                      _c5176 = (_g5161 < (2 - _g5166));
                                    }
                                    let _c5241: boolean = _c5176;
                                    if (_c5241) {
                                      let _q5177 = true;
                                      Q5178: {
                                        const _g5179: number[] = [];
                                        G5180: {
                                          for (let _i5182 = 0; _i5182 < 1; _i5182++) {
                                            const v_x = v_t;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g5179.push(v_x);
                                          }
                                        }
                                        const _g5183: number[] = [];
                                        G5184: {
                                          const _a5203 = throughWhere(sp, v_t, (_te5198: number): boolean => { let _c5200: boolean = ((_te5198 === _wc4982 ? _wd4983 : (_te5198 === _wc4980 ? _wd4981 : (b.grid[_te5198] || -1))) === 1); if (_c5200) {   const _t5199 = sp.edgeEnds[2 * _te5198];   _c5200 = !((clueAt(cl.number, _t5199) !== -1)); } let _c5202: boolean = _c5200; if (_c5202) {   const _t5201 = sp.edgeEnds[2 * _te5198 + 1];   _c5202 = !((clueAt(cl.number, _t5201) !== -1)); } return _c5202; });
                                          for (let _i5204 = 0; _i5204 < _a5203.length; _i5204++) {
                                            const v_t_5197 = _a5203[_i5204];
                                            const _a5205 = sp.adj4[v_t_5197];
                                            for (let _i5206 = 0; _i5206 < _a5205.length; _i5206++) {
                                              const v_x = _a5205[_i5206];
                                              let _c5208: boolean = (!((clueAt(cl.number, v_t_5197) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c5208) {
                                                const _t5207 = sp.adj4Edges[v_t_5197][_i5206];
                                                _c5208 = ((_t5207 === _wc4982 ? _wd4983 : (_t5207 === _wc4980 ? _wd4981 : (b.grid[_t5207] || -1))) === 1);
                                              }
                                              if (!(_c5208)) continue;
                                              if (!_g5183.includes(v_x)) _g5183.push(v_x);
                                            }
                                          }
                                        }
                                        const _a5209 = union(_g5179, _g5183);
                                        for (let _i5210 = 0; _i5210 < _a5209.length; _i5210++) {
                                          const v_p = _a5209[_i5210];
                                          const _g5211: number[] = [];
                                          G5212: {
                                            for (let _i5214 = 0; _i5214 < 1; _i5214++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g5211.push(v_x);
                                            }
                                          }
                                          const _g5215: number[] = [];
                                          G5216: {
                                            const _a5233 = throughWhere(sp, v_z, (_te5228: number): boolean => { let _c5230: boolean = ((_te5228 === _wc4982 ? _wd4983 : (_te5228 === _wc4980 ? _wd4981 : (b.grid[_te5228] || -1))) === 1); if (_c5230) {   const _t5229 = sp.edgeEnds[2 * _te5228];   _c5230 = !((clueAt(cl.number, _t5229) !== -1)); } let _c5232: boolean = _c5230; if (_c5232) {   const _t5231 = sp.edgeEnds[2 * _te5228 + 1];   _c5232 = !((clueAt(cl.number, _t5231) !== -1)); } return _c5232; });
                                            for (let _i5234 = 0; _i5234 < _a5233.length; _i5234++) {
                                              const v_t = _a5233[_i5234];
                                              const _a5235 = sp.adj4[v_t];
                                              for (let _i5236 = 0; _i5236 < _a5235.length; _i5236++) {
                                                const v_x = _a5235[_i5236];
                                                let _c5238: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c5238) {
                                                  const _t5237 = sp.adj4Edges[v_t][_i5236];
                                                  _c5238 = ((_t5237 === _wc4982 ? _wd4983 : (_t5237 === _wc4980 ? _wd4981 : (b.grid[_t5237] || -1))) === 1);
                                                }
                                                if (!(_c5238)) continue;
                                                if (!_g5215.includes(v_x)) _g5215.push(v_x);
                                              }
                                            }
                                          }
                                          const _a5239 = union(_g5211, _g5215);
                                          for (let _i5240 = 0; _i5240 < _a5239.length; _i5240++) {
                                            const v_q = _a5239[_i5240];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q5177 = false;
                                              break Q5178;
                                            }
                                          }
                                        }
                                      }
                                      _c5241 = _q5177;
                                    }
                                    if ((_c5241 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te5242: number): boolean => {  return ((_te5242 === _wc4982 ? _wd4983 : (_te5242 === _wc4980 ? _wd4981 : (b.grid[_te5242] || -1))) === 1); }).includes(v_z))))) {
                                      _q5139 = true;
                                      break Q5140;
                                    }
                                  }
                                }
                                _c5243 = _q5139;
                              }
                              if (_c5243) {
                                _q5020 = true;
                                break Q5021;
                              }
                            }
                          }
                          _c5244 = !(_q5020);
                        }
                        let _c5485: boolean = _c5244;
                        if (!_c5485) {
                          let _q5245 = false;
                          Q5246: {
                            const _a5247 = sp.adj4[v_t];
                            for (let _i5248 = 0; _i5248 < _a5247.length; _i5248++) {
                              const v_s = _a5247[_i5248];
                              let _g5249 = 0;
                              G5250: {
                                const _a5251 = sp.adj4[v_s];
                                for (let _i5252 = 0; _i5252 < _a5251.length; _i5252++) {
                                  const _t5253 = sp.adj4Edges[v_s][_i5252];
                                  if (!(((_t5253 === _wc4982 ? _wd4983 : (_t5253 === _wc4980 ? _wd4981 : (b.grid[_t5253] || -1))) === 1))) continue;
                                  _g5249++;
                                }
                              }
                              let _g5254 = 0;
                              G5255: {
                                for (let _i5256 = 0; _i5256 < 1; _i5256++) {
                                  const v_k = v_s;
                                  let _c5263: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c5263) {
                                    let _c5262: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c5262) {
                                      let _g5257 = 0;
                                      G5258: {
                                        const _t5259 = (clueAt(cl.number, v_k) + 1);
                                        const _a5260 = cluesValued(cl.number, _t5259);
                                        for (let _i5261 = 0; _i5261 < _a5260.length; _i5261++) {
                                          const v_x = _a5260[_i5261];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g5257++;
                                        }
                                      }
                                      _c5262 = (_g5257 === 0);
                                    }
                                    _c5263 = _c5262;
                                  }
                                  if (!(_c5263)) continue;
                                  _g5254++;
                                }
                              }
                              let _c5484: boolean = (_g5249 < (2 - _g5254));
                              if (_c5484) {
                                let _q5264 = false;
                                Q5265: {
                                  const _a5266 = sp.adj4[v_s];
                                  for (let _i5267 = 0; _i5267 < _a5266.length; _i5267++) {
                                    const v_y = _a5266[_i5267];
                                    const _t5268 = sp.adj4Edges[v_s][_i5267];
                                    let _c5284: boolean = !((_t5268 === _wc4982 ? true : (_t5268 === _wc4980 ? true : (b.grid[_t5268] !== 0))));
                                    if (_c5284) {
                                      let _g5269 = 0;
                                      G5270: {
                                        const _a5271 = sp.adj4[v_s];
                                        for (let _i5272 = 0; _i5272 < _a5271.length; _i5272++) {
                                          const _t5273 = sp.adj4Edges[v_s][_i5272];
                                          if (!(((_t5273 === _wc4982 ? _wd4983 : (_t5273 === _wc4980 ? _wd4981 : (b.grid[_t5273] || -1))) === 1))) continue;
                                          _g5269++;
                                        }
                                      }
                                      let _g5274 = 0;
                                      G5275: {
                                        for (let _i5276 = 0; _i5276 < 1; _i5276++) {
                                          const v_k = v_s;
                                          let _c5283: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c5283) {
                                            let _c5282: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c5282) {
                                              let _g5277 = 0;
                                              G5278: {
                                                const _t5279 = (clueAt(cl.number, v_k) + 1);
                                                const _a5280 = cluesValued(cl.number, _t5279);
                                                for (let _i5281 = 0; _i5281 < _a5280.length; _i5281++) {
                                                  const v_x = _a5280[_i5281];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g5277++;
                                                }
                                              }
                                              _c5282 = (_g5277 === 0);
                                            }
                                            _c5283 = _c5282;
                                          }
                                          if (!(_c5283)) continue;
                                          _g5274++;
                                        }
                                      }
                                      _c5284 = (_g5269 < (2 - _g5274));
                                    }
                                    let _c5301: boolean = _c5284;
                                    if (_c5301) {
                                      let _g5285 = 0;
                                      G5286: {
                                        const _a5288 = sp.adj4[v_y];
                                        for (let _i5289 = 0; _i5289 < _a5288.length; _i5289++) {
                                          const _t5290 = sp.adj4Edges[v_y][_i5289];
                                          if (!(((_t5290 === _wc4982 ? _wd4983 : (_t5290 === _wc4980 ? _wd4981 : (b.grid[_t5290] || -1))) === 1))) continue;
                                          _g5285++;
                                        }
                                      }
                                      let _g5291 = 0;
                                      G5292: {
                                        for (let _i5293 = 0; _i5293 < 1; _i5293++) {
                                          const v_k = v_y;
                                          let _c5300: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c5300) {
                                            let _c5299: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c5299) {
                                              let _g5294 = 0;
                                              G5295: {
                                                const _t5296 = (clueAt(cl.number, v_k) + 1);
                                                const _a5297 = cluesValued(cl.number, _t5296);
                                                for (let _i5298 = 0; _i5298 < _a5297.length; _i5298++) {
                                                  const v_x = _a5297[_i5298];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g5294++;
                                                }
                                              }
                                              _c5299 = (_g5294 === 0);
                                            }
                                            _c5300 = _c5299;
                                          }
                                          if (!(_c5300)) continue;
                                          _g5291++;
                                        }
                                      }
                                      _c5301 = (_g5285 < (2 - _g5291));
                                    }
                                    let _c5364: boolean = _c5301;
                                    if (_c5364) {
                                      let _q5302 = true;
                                      Q5303: {
                                        const _g5304: number[] = [];
                                        G5305: {
                                          for (let _i5307 = 0; _i5307 < 1; _i5307++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g5304.push(v_x);
                                          }
                                        }
                                        const _g5308: number[] = [];
                                        G5309: {
                                          const _a5326 = throughWhere(sp, v_s, (_te5321: number): boolean => { let _c5323: boolean = ((_te5321 === _wc4982 ? _wd4983 : (_te5321 === _wc4980 ? _wd4981 : (b.grid[_te5321] || -1))) === 1); if (_c5323) {   const _t5322 = sp.edgeEnds[2 * _te5321];   _c5323 = !((clueAt(cl.number, _t5322) !== -1)); } let _c5325: boolean = _c5323; if (_c5325) {   const _t5324 = sp.edgeEnds[2 * _te5321 + 1];   _c5325 = !((clueAt(cl.number, _t5324) !== -1)); } return _c5325; });
                                          for (let _i5327 = 0; _i5327 < _a5326.length; _i5327++) {
                                            const v_t = _a5326[_i5327];
                                            const _a5328 = sp.adj4[v_t];
                                            for (let _i5329 = 0; _i5329 < _a5328.length; _i5329++) {
                                              const v_x = _a5328[_i5329];
                                              let _c5331: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c5331) {
                                                const _t5330 = sp.adj4Edges[v_t][_i5329];
                                                _c5331 = ((_t5330 === _wc4982 ? _wd4983 : (_t5330 === _wc4980 ? _wd4981 : (b.grid[_t5330] || -1))) === 1);
                                              }
                                              if (!(_c5331)) continue;
                                              if (!_g5308.includes(v_x)) _g5308.push(v_x);
                                            }
                                          }
                                        }
                                        const _a5332 = union(_g5304, _g5308);
                                        for (let _i5333 = 0; _i5333 < _a5332.length; _i5333++) {
                                          const v_p = _a5332[_i5333];
                                          const _g5334: number[] = [];
                                          G5335: {
                                            for (let _i5337 = 0; _i5337 < 1; _i5337++) {
                                              const v_x = v_y;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g5334.push(v_x);
                                            }
                                          }
                                          const _g5338: number[] = [];
                                          G5339: {
                                            const _a5356 = throughWhere(sp, v_y, (_te5351: number): boolean => { let _c5353: boolean = ((_te5351 === _wc4982 ? _wd4983 : (_te5351 === _wc4980 ? _wd4981 : (b.grid[_te5351] || -1))) === 1); if (_c5353) {   const _t5352 = sp.edgeEnds[2 * _te5351];   _c5353 = !((clueAt(cl.number, _t5352) !== -1)); } let _c5355: boolean = _c5353; if (_c5355) {   const _t5354 = sp.edgeEnds[2 * _te5351 + 1];   _c5355 = !((clueAt(cl.number, _t5354) !== -1)); } return _c5355; });
                                            for (let _i5357 = 0; _i5357 < _a5356.length; _i5357++) {
                                              const v_t = _a5356[_i5357];
                                              const _a5358 = sp.adj4[v_t];
                                              for (let _i5359 = 0; _i5359 < _a5358.length; _i5359++) {
                                                const v_x = _a5358[_i5359];
                                                let _c5361: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c5361) {
                                                  const _t5360 = sp.adj4Edges[v_t][_i5359];
                                                  _c5361 = ((_t5360 === _wc4982 ? _wd4983 : (_t5360 === _wc4980 ? _wd4981 : (b.grid[_t5360] || -1))) === 1);
                                                }
                                                if (!(_c5361)) continue;
                                                if (!_g5338.includes(v_x)) _g5338.push(v_x);
                                              }
                                            }
                                          }
                                          const _a5362 = union(_g5334, _g5338);
                                          for (let _i5363 = 0; _i5363 < _a5362.length; _i5363++) {
                                            const v_q = _a5362[_i5363];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q5302 = false;
                                              break Q5303;
                                            }
                                          }
                                        }
                                      }
                                      _c5364 = _q5302;
                                    }
                                    if (!((_c5364 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te5365: number): boolean => {  return ((_te5365 === _wc4982 ? _wd4983 : (_te5365 === _wc4980 ? _wd4981 : (b.grid[_te5365] || -1))) === 1); }).includes(v_y)))))) continue;
                                    let _g5366 = 0;
                                    G5367: {
                                      const _a5368 = sp.adj4[v_s];
                                      for (let _i5369 = 0; _i5369 < _a5368.length; _i5369++) {
                                        const _t5370 = sp.adj4Edges[v_s][_i5369];
                                        if (!(((_t5370 === _wc4982 ? _wd4983 : (_t5370 === _wc4980 ? _wd4981 : (b.grid[_t5370] || -1))) === 1))) continue;
                                        _g5366++;
                                      }
                                    }
                                    let _g5371 = 0;
                                    G5372: {
                                      for (let _i5373 = 0; _i5373 < 1; _i5373++) {
                                        const v_k = v_s;
                                        let _c5380: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c5380) {
                                          let _c5379: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c5379) {
                                            let _g5374 = 0;
                                            G5375: {
                                              const _t5376 = (clueAt(cl.number, v_k) + 1);
                                              const _a5377 = cluesValued(cl.number, _t5376);
                                              for (let _i5378 = 0; _i5378 < _a5377.length; _i5378++) {
                                                const v_x = _a5377[_i5378];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g5374++;
                                              }
                                            }
                                            _c5379 = (_g5374 === 0);
                                          }
                                          _c5380 = _c5379;
                                        }
                                        if (!(_c5380)) continue;
                                        _g5371++;
                                      }
                                    }
                                    let _c5483: boolean = ((_g5366 + 1) === (2 - _g5371));
                                    if (!_c5483) {
                                      let _q5381 = false;
                                      Q5382: {
                                        const _a5383 = sp.adj4[v_s];
                                        const _n5384 = _i5267;
                                        for (let _i5385 = 0; _i5385 < _n5384; _i5385++) {
                                          const v_z = _a5383[_i5385];
                                          const _t5386 = sp.adj4Edges[v_s][_i5385];
                                          let _c5402: boolean = !((_t5386 === _wc4982 ? true : (_t5386 === _wc4980 ? true : (b.grid[_t5386] !== 0))));
                                          if (_c5402) {
                                            let _g5387 = 0;
                                            G5388: {
                                              const _a5389 = sp.adj4[v_s];
                                              for (let _i5390 = 0; _i5390 < _a5389.length; _i5390++) {
                                                const _t5391 = sp.adj4Edges[v_s][_i5390];
                                                if (!(((_t5391 === _wc4982 ? _wd4983 : (_t5391 === _wc4980 ? _wd4981 : (b.grid[_t5391] || -1))) === 1))) continue;
                                                _g5387++;
                                              }
                                            }
                                            let _g5392 = 0;
                                            G5393: {
                                              for (let _i5394 = 0; _i5394 < 1; _i5394++) {
                                                const v_k = v_s;
                                                let _c5401: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c5401) {
                                                  let _c5400: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c5400) {
                                                    let _g5395 = 0;
                                                    G5396: {
                                                      const _t5397 = (clueAt(cl.number, v_k) + 1);
                                                      const _a5398 = cluesValued(cl.number, _t5397);
                                                      for (let _i5399 = 0; _i5399 < _a5398.length; _i5399++) {
                                                        const v_x = _a5398[_i5399];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g5395++;
                                                      }
                                                    }
                                                    _c5400 = (_g5395 === 0);
                                                  }
                                                  _c5401 = _c5400;
                                                }
                                                if (!(_c5401)) continue;
                                                _g5392++;
                                              }
                                            }
                                            _c5402 = (_g5387 < (2 - _g5392));
                                          }
                                          let _c5418: boolean = _c5402;
                                          if (_c5418) {
                                            let _g5403 = 0;
                                            G5404: {
                                              const _a5405 = sp.adj4[v_z];
                                              for (let _i5406 = 0; _i5406 < _a5405.length; _i5406++) {
                                                const _t5407 = sp.adj4Edges[v_z][_i5406];
                                                if (!(((_t5407 === _wc4982 ? _wd4983 : (_t5407 === _wc4980 ? _wd4981 : (b.grid[_t5407] || -1))) === 1))) continue;
                                                _g5403++;
                                              }
                                            }
                                            let _g5408 = 0;
                                            G5409: {
                                              for (let _i5410 = 0; _i5410 < 1; _i5410++) {
                                                const v_k = v_z;
                                                let _c5417: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c5417) {
                                                  let _c5416: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c5416) {
                                                    let _g5411 = 0;
                                                    G5412: {
                                                      const _t5413 = (clueAt(cl.number, v_k) + 1);
                                                      const _a5414 = cluesValued(cl.number, _t5413);
                                                      for (let _i5415 = 0; _i5415 < _a5414.length; _i5415++) {
                                                        const v_x = _a5414[_i5415];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g5411++;
                                                      }
                                                    }
                                                    _c5416 = (_g5411 === 0);
                                                  }
                                                  _c5417 = _c5416;
                                                }
                                                if (!(_c5417)) continue;
                                                _g5408++;
                                              }
                                            }
                                            _c5418 = (_g5403 < (2 - _g5408));
                                          }
                                          let _c5481: boolean = _c5418;
                                          if (_c5481) {
                                            let _q5419 = true;
                                            Q5420: {
                                              const _g5421: number[] = [];
                                              G5422: {
                                                for (let _i5424 = 0; _i5424 < 1; _i5424++) {
                                                  const v_x = v_s;
                                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                  _g5421.push(v_x);
                                                }
                                              }
                                              const _g5425: number[] = [];
                                              G5426: {
                                                const _a5443 = throughWhere(sp, v_s, (_te5438: number): boolean => { let _c5440: boolean = ((_te5438 === _wc4982 ? _wd4983 : (_te5438 === _wc4980 ? _wd4981 : (b.grid[_te5438] || -1))) === 1); if (_c5440) {   const _t5439 = sp.edgeEnds[2 * _te5438];   _c5440 = !((clueAt(cl.number, _t5439) !== -1)); } let _c5442: boolean = _c5440; if (_c5442) {   const _t5441 = sp.edgeEnds[2 * _te5438 + 1];   _c5442 = !((clueAt(cl.number, _t5441) !== -1)); } return _c5442; });
                                                for (let _i5444 = 0; _i5444 < _a5443.length; _i5444++) {
                                                  const v_t = _a5443[_i5444];
                                                  const _a5445 = sp.adj4[v_t];
                                                  for (let _i5446 = 0; _i5446 < _a5445.length; _i5446++) {
                                                    const v_x = _a5445[_i5446];
                                                    let _c5448: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                    if (_c5448) {
                                                      const _t5447 = sp.adj4Edges[v_t][_i5446];
                                                      _c5448 = ((_t5447 === _wc4982 ? _wd4983 : (_t5447 === _wc4980 ? _wd4981 : (b.grid[_t5447] || -1))) === 1);
                                                    }
                                                    if (!(_c5448)) continue;
                                                    if (!_g5425.includes(v_x)) _g5425.push(v_x);
                                                  }
                                                }
                                              }
                                              const _a5449 = union(_g5421, _g5425);
                                              for (let _i5450 = 0; _i5450 < _a5449.length; _i5450++) {
                                                const v_p = _a5449[_i5450];
                                                const _g5451: number[] = [];
                                                G5452: {
                                                  for (let _i5454 = 0; _i5454 < 1; _i5454++) {
                                                    const v_x = v_z;
                                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                    _g5451.push(v_x);
                                                  }
                                                }
                                                const _g5455: number[] = [];
                                                G5456: {
                                                  const _a5473 = throughWhere(sp, v_z, (_te5468: number): boolean => { let _c5470: boolean = ((_te5468 === _wc4982 ? _wd4983 : (_te5468 === _wc4980 ? _wd4981 : (b.grid[_te5468] || -1))) === 1); if (_c5470) {   const _t5469 = sp.edgeEnds[2 * _te5468];   _c5470 = !((clueAt(cl.number, _t5469) !== -1)); } let _c5472: boolean = _c5470; if (_c5472) {   const _t5471 = sp.edgeEnds[2 * _te5468 + 1];   _c5472 = !((clueAt(cl.number, _t5471) !== -1)); } return _c5472; });
                                                  for (let _i5474 = 0; _i5474 < _a5473.length; _i5474++) {
                                                    const v_t = _a5473[_i5474];
                                                    const _a5475 = sp.adj4[v_t];
                                                    for (let _i5476 = 0; _i5476 < _a5475.length; _i5476++) {
                                                      const v_x = _a5475[_i5476];
                                                      let _c5478: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                      if (_c5478) {
                                                        const _t5477 = sp.adj4Edges[v_t][_i5476];
                                                        _c5478 = ((_t5477 === _wc4982 ? _wd4983 : (_t5477 === _wc4980 ? _wd4981 : (b.grid[_t5477] || -1))) === 1);
                                                      }
                                                      if (!(_c5478)) continue;
                                                      if (!_g5455.includes(v_x)) _g5455.push(v_x);
                                                    }
                                                  }
                                                }
                                                const _a5479 = union(_g5451, _g5455);
                                                for (let _i5480 = 0; _i5480 < _a5479.length; _i5480++) {
                                                  const v_q = _a5479[_i5480];
                                                  if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                                    _q5419 = false;
                                                    break Q5420;
                                                  }
                                                }
                                              }
                                            }
                                            _c5481 = _q5419;
                                          }
                                          if ((_c5481 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te5482: number): boolean => {  return ((_te5482 === _wc4982 ? _wd4983 : (_te5482 === _wc4980 ? _wd4981 : (b.grid[_te5482] || -1))) === 1); }).includes(v_z))))) {
                                            _q5381 = true;
                                            break Q5382;
                                          }
                                        }
                                      }
                                      _c5483 = _q5381;
                                    }
                                    if (_c5483) {
                                      _q5264 = true;
                                      break Q5265;
                                    }
                                  }
                                }
                                _c5484 = !(_q5264);
                              }
                              if (_c5484) {
                                _q5245 = true;
                                break Q5246;
                              }
                            }
                          }
                          _c5485 = _q5245;
                        }
                        if (_c5485) {
                          _q4984 = true;
                          break Q4985;
                        }
                      }
                    }
                    _c5486 = _q4984;
                  }
                  _c5487 = _c5486;
                }
                if (!(_c5487)) continue;
                if (!_g4460.includes(v_j)) _g4460.push(v_j);
              }
            }
          }
          const _g5488: number[] = [];
          G5489: {
            const _a6004 = v_U;
            for (let _i6005 = 0; _i6005 < _a6004.length; _i6005++) {
              const v_i = _a6004[_i6005];
              const _a6006 = v_U;
              for (let _i6007 = 0; _i6007 < _a6006.length; _i6007++) {
                const v_j = _a6006[_i6007];
                let _c6516: boolean = ((_i6005 > 0) && (_i6005 < _i6007));
                if (_c6516) {
                  let _c6515: boolean = ((throughWhere(sp, v_i, (_te6008: number): boolean => {  return ((b.grid[_te6008] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
                  if (!_c6515) {
                    const _wc6009 = sp.edgeOf(v_c, v_i);
                    const _wd6010 = 1;
                    const _wc6011 = sp.edgeOf(v_c, v_j);
                    const _wd6012 = 1;
                    let _q6013 = false;
                    Q6014: {
                      const _a6016 = throughWhere(sp, v_c, (_te6015: number): boolean => {  return ((_te6015 === _wc6011 ? _wd6012 : (_te6015 === _wc6009 ? _wd6010 : (b.grid[_te6015] || -1))) === 1); });
                      for (let _i6017 = 0; _i6017 < _a6016.length; _i6017++) {
                        const v_t = _a6016[_i6017];
                        let _c6033: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                        if (!_c6033) {
                          let _g6018 = 0;
                          G6019: {
                            const _a6020 = sp.adj4[v_t];
                            for (let _i6021 = 0; _i6021 < _a6020.length; _i6021++) {
                              const _t6022 = sp.adj4Edges[v_t][_i6021];
                              if (!(((_t6022 === _wc6011 ? _wd6012 : (_t6022 === _wc6009 ? _wd6010 : (b.grid[_t6022] || -1))) === 1))) continue;
                              _g6018++;
                            }
                          }
                          let _g6023 = 0;
                          G6024: {
                            for (let _i6025 = 0; _i6025 < 1; _i6025++) {
                              const v_k = v_t;
                              let _c6032: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c6032) {
                                let _c6031: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c6031) {
                                  let _g6026 = 0;
                                  G6027: {
                                    const _t6028 = (clueAt(cl.number, v_k) + 1);
                                    const _a6029 = cluesValued(cl.number, _t6028);
                                    for (let _i6030 = 0; _i6030 < _a6029.length; _i6030++) {
                                      const v_x = _a6029[_i6030];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g6026++;
                                    }
                                  }
                                  _c6031 = (_g6026 === 0);
                                }
                                _c6032 = _c6031;
                              }
                              if (!(_c6032)) continue;
                              _g6023++;
                            }
                          }
                          _c6033 = (_g6018 < (2 - _g6023));
                        }
                        if (!(_c6033)) continue;
                        let _g6034 = 0;
                        G6035: {
                          const _a6036 = sp.adj4[v_t];
                          for (let _i6037 = 0; _i6037 < _a6036.length; _i6037++) {
                            const _t6038 = sp.adj4Edges[v_t][_i6037];
                            if (!(((_t6038 === _wc6011 ? _wd6012 : (_t6038 === _wc6009 ? _wd6010 : (b.grid[_t6038] || -1))) === 1))) continue;
                            _g6034++;
                          }
                        }
                        let _g6039 = 0;
                        G6040: {
                          for (let _i6041 = 0; _i6041 < 1; _i6041++) {
                            const v_k = v_t;
                            let _c6048: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c6048) {
                              let _c6047: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c6047) {
                                let _g6042 = 0;
                                G6043: {
                                  const _t6044 = (clueAt(cl.number, v_k) + 1);
                                  const _a6045 = cluesValued(cl.number, _t6044);
                                  for (let _i6046 = 0; _i6046 < _a6045.length; _i6046++) {
                                    const v_x = _a6045[_i6046];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g6042++;
                                  }
                                }
                                _c6047 = (_g6042 === 0);
                              }
                              _c6048 = _c6047;
                            }
                            if (!(_c6048)) continue;
                            _g6039++;
                          }
                        }
                        let _c6273: boolean = (_g6034 < (2 - _g6039));
                        if (_c6273) {
                          let _q6049 = false;
                          Q6050: {
                            const _a6051 = sp.adj4[v_t];
                            for (let _i6052 = 0; _i6052 < _a6051.length; _i6052++) {
                              const v_y = _a6051[_i6052];
                              const _t6053 = sp.adj4Edges[v_t][_i6052];
                              let _c6069: boolean = !((_t6053 === _wc6011 ? true : (_t6053 === _wc6009 ? true : (b.grid[_t6053] !== 0))));
                              if (_c6069) {
                                let _g6054 = 0;
                                G6055: {
                                  const _a6056 = sp.adj4[v_t];
                                  for (let _i6057 = 0; _i6057 < _a6056.length; _i6057++) {
                                    const _t6058 = sp.adj4Edges[v_t][_i6057];
                                    if (!(((_t6058 === _wc6011 ? _wd6012 : (_t6058 === _wc6009 ? _wd6010 : (b.grid[_t6058] || -1))) === 1))) continue;
                                    _g6054++;
                                  }
                                }
                                let _g6059 = 0;
                                G6060: {
                                  for (let _i6061 = 0; _i6061 < 1; _i6061++) {
                                    const v_k = v_t;
                                    let _c6068: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c6068) {
                                      let _c6067: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c6067) {
                                        let _g6062 = 0;
                                        G6063: {
                                          const _t6064 = (clueAt(cl.number, v_k) + 1);
                                          const _a6065 = cluesValued(cl.number, _t6064);
                                          for (let _i6066 = 0; _i6066 < _a6065.length; _i6066++) {
                                            const v_x = _a6065[_i6066];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g6062++;
                                          }
                                        }
                                        _c6067 = (_g6062 === 0);
                                      }
                                      _c6068 = _c6067;
                                    }
                                    if (!(_c6068)) continue;
                                    _g6059++;
                                  }
                                }
                                _c6069 = (_g6054 < (2 - _g6059));
                              }
                              let _c6086: boolean = _c6069;
                              if (_c6086) {
                                let _g6070 = 0;
                                G6071: {
                                  const _a6073 = sp.adj4[v_y];
                                  for (let _i6074 = 0; _i6074 < _a6073.length; _i6074++) {
                                    const _t6075 = sp.adj4Edges[v_y][_i6074];
                                    if (!(((_t6075 === _wc6011 ? _wd6012 : (_t6075 === _wc6009 ? _wd6010 : (b.grid[_t6075] || -1))) === 1))) continue;
                                    _g6070++;
                                  }
                                }
                                let _g6076 = 0;
                                G6077: {
                                  for (let _i6078 = 0; _i6078 < 1; _i6078++) {
                                    const v_k = v_y;
                                    let _c6085: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c6085) {
                                      let _c6084: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c6084) {
                                        let _g6079 = 0;
                                        G6080: {
                                          const _t6081 = (clueAt(cl.number, v_k) + 1);
                                          const _a6082 = cluesValued(cl.number, _t6081);
                                          for (let _i6083 = 0; _i6083 < _a6082.length; _i6083++) {
                                            const v_x = _a6082[_i6083];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g6079++;
                                          }
                                        }
                                        _c6084 = (_g6079 === 0);
                                      }
                                      _c6085 = _c6084;
                                    }
                                    if (!(_c6085)) continue;
                                    _g6076++;
                                  }
                                }
                                _c6086 = (_g6070 < (2 - _g6076));
                              }
                              let _c6151: boolean = _c6086;
                              if (_c6151) {
                                let _q6087 = true;
                                Q6088: {
                                  const _g6089: number[] = [];
                                  G6090: {
                                    for (let _i6092 = 0; _i6092 < 1; _i6092++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g6089.push(v_x);
                                    }
                                  }
                                  const _g6093: number[] = [];
                                  G6094: {
                                    const _a6113 = throughWhere(sp, v_t, (_te6108: number): boolean => { let _c6110: boolean = ((_te6108 === _wc6011 ? _wd6012 : (_te6108 === _wc6009 ? _wd6010 : (b.grid[_te6108] || -1))) === 1); if (_c6110) {   const _t6109 = sp.edgeEnds[2 * _te6108];   _c6110 = !((clueAt(cl.number, _t6109) !== -1)); } let _c6112: boolean = _c6110; if (_c6112) {   const _t6111 = sp.edgeEnds[2 * _te6108 + 1];   _c6112 = !((clueAt(cl.number, _t6111) !== -1)); } return _c6112; });
                                    for (let _i6114 = 0; _i6114 < _a6113.length; _i6114++) {
                                      const v_t_6107 = _a6113[_i6114];
                                      const _a6115 = sp.adj4[v_t_6107];
                                      for (let _i6116 = 0; _i6116 < _a6115.length; _i6116++) {
                                        const v_x = _a6115[_i6116];
                                        let _c6118: boolean = (!((clueAt(cl.number, v_t_6107) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c6118) {
                                          const _t6117 = sp.adj4Edges[v_t_6107][_i6116];
                                          _c6118 = ((_t6117 === _wc6011 ? _wd6012 : (_t6117 === _wc6009 ? _wd6010 : (b.grid[_t6117] || -1))) === 1);
                                        }
                                        if (!(_c6118)) continue;
                                        if (!_g6093.includes(v_x)) _g6093.push(v_x);
                                      }
                                    }
                                  }
                                  const _a6119 = union(_g6089, _g6093);
                                  for (let _i6120 = 0; _i6120 < _a6119.length; _i6120++) {
                                    const v_p = _a6119[_i6120];
                                    const _g6121: number[] = [];
                                    G6122: {
                                      for (let _i6124 = 0; _i6124 < 1; _i6124++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g6121.push(v_x);
                                      }
                                    }
                                    const _g6125: number[] = [];
                                    G6126: {
                                      const _a6143 = throughWhere(sp, v_y, (_te6138: number): boolean => { let _c6140: boolean = ((_te6138 === _wc6011 ? _wd6012 : (_te6138 === _wc6009 ? _wd6010 : (b.grid[_te6138] || -1))) === 1); if (_c6140) {   const _t6139 = sp.edgeEnds[2 * _te6138];   _c6140 = !((clueAt(cl.number, _t6139) !== -1)); } let _c6142: boolean = _c6140; if (_c6142) {   const _t6141 = sp.edgeEnds[2 * _te6138 + 1];   _c6142 = !((clueAt(cl.number, _t6141) !== -1)); } return _c6142; });
                                      for (let _i6144 = 0; _i6144 < _a6143.length; _i6144++) {
                                        const v_t = _a6143[_i6144];
                                        const _a6145 = sp.adj4[v_t];
                                        for (let _i6146 = 0; _i6146 < _a6145.length; _i6146++) {
                                          const v_x = _a6145[_i6146];
                                          let _c6148: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c6148) {
                                            const _t6147 = sp.adj4Edges[v_t][_i6146];
                                            _c6148 = ((_t6147 === _wc6011 ? _wd6012 : (_t6147 === _wc6009 ? _wd6010 : (b.grid[_t6147] || -1))) === 1);
                                          }
                                          if (!(_c6148)) continue;
                                          if (!_g6125.includes(v_x)) _g6125.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6149 = union(_g6121, _g6125);
                                    for (let _i6150 = 0; _i6150 < _a6149.length; _i6150++) {
                                      const v_q = _a6149[_i6150];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q6087 = false;
                                        break Q6088;
                                      }
                                    }
                                  }
                                }
                                _c6151 = _q6087;
                              }
                              if (!((_c6151 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te6152: number): boolean => {  return ((_te6152 === _wc6011 ? _wd6012 : (_te6152 === _wc6009 ? _wd6010 : (b.grid[_te6152] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g6153 = 0;
                              G6154: {
                                const _a6155 = sp.adj4[v_t];
                                for (let _i6156 = 0; _i6156 < _a6155.length; _i6156++) {
                                  const _t6157 = sp.adj4Edges[v_t][_i6156];
                                  if (!(((_t6157 === _wc6011 ? _wd6012 : (_t6157 === _wc6009 ? _wd6010 : (b.grid[_t6157] || -1))) === 1))) continue;
                                  _g6153++;
                                }
                              }
                              let _g6158 = 0;
                              G6159: {
                                for (let _i6160 = 0; _i6160 < 1; _i6160++) {
                                  const v_k = v_t;
                                  let _c6167: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c6167) {
                                    let _c6166: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c6166) {
                                      let _g6161 = 0;
                                      G6162: {
                                        const _t6163 = (clueAt(cl.number, v_k) + 1);
                                        const _a6164 = cluesValued(cl.number, _t6163);
                                        for (let _i6165 = 0; _i6165 < _a6164.length; _i6165++) {
                                          const v_x = _a6164[_i6165];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g6161++;
                                        }
                                      }
                                      _c6166 = (_g6161 === 0);
                                    }
                                    _c6167 = _c6166;
                                  }
                                  if (!(_c6167)) continue;
                                  _g6158++;
                                }
                              }
                              let _c6272: boolean = ((_g6153 + 1) === (2 - _g6158));
                              if (!_c6272) {
                                let _q6168 = false;
                                Q6169: {
                                  const _a6170 = sp.adj4[v_t];
                                  const _n6171 = _i6052;
                                  for (let _i6172 = 0; _i6172 < _n6171; _i6172++) {
                                    const v_z = _a6170[_i6172];
                                    const _t6173 = sp.adj4Edges[v_t][_i6172];
                                    let _c6189: boolean = !((_t6173 === _wc6011 ? true : (_t6173 === _wc6009 ? true : (b.grid[_t6173] !== 0))));
                                    if (_c6189) {
                                      let _g6174 = 0;
                                      G6175: {
                                        const _a6176 = sp.adj4[v_t];
                                        for (let _i6177 = 0; _i6177 < _a6176.length; _i6177++) {
                                          const _t6178 = sp.adj4Edges[v_t][_i6177];
                                          if (!(((_t6178 === _wc6011 ? _wd6012 : (_t6178 === _wc6009 ? _wd6010 : (b.grid[_t6178] || -1))) === 1))) continue;
                                          _g6174++;
                                        }
                                      }
                                      let _g6179 = 0;
                                      G6180: {
                                        for (let _i6181 = 0; _i6181 < 1; _i6181++) {
                                          const v_k = v_t;
                                          let _c6188: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c6188) {
                                            let _c6187: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c6187) {
                                              let _g6182 = 0;
                                              G6183: {
                                                const _t6184 = (clueAt(cl.number, v_k) + 1);
                                                const _a6185 = cluesValued(cl.number, _t6184);
                                                for (let _i6186 = 0; _i6186 < _a6185.length; _i6186++) {
                                                  const v_x = _a6185[_i6186];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g6182++;
                                                }
                                              }
                                              _c6187 = (_g6182 === 0);
                                            }
                                            _c6188 = _c6187;
                                          }
                                          if (!(_c6188)) continue;
                                          _g6179++;
                                        }
                                      }
                                      _c6189 = (_g6174 < (2 - _g6179));
                                    }
                                    let _c6205: boolean = _c6189;
                                    if (_c6205) {
                                      let _g6190 = 0;
                                      G6191: {
                                        const _a6192 = sp.adj4[v_z];
                                        for (let _i6193 = 0; _i6193 < _a6192.length; _i6193++) {
                                          const _t6194 = sp.adj4Edges[v_z][_i6193];
                                          if (!(((_t6194 === _wc6011 ? _wd6012 : (_t6194 === _wc6009 ? _wd6010 : (b.grid[_t6194] || -1))) === 1))) continue;
                                          _g6190++;
                                        }
                                      }
                                      let _g6195 = 0;
                                      G6196: {
                                        for (let _i6197 = 0; _i6197 < 1; _i6197++) {
                                          const v_k = v_z;
                                          let _c6204: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c6204) {
                                            let _c6203: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c6203) {
                                              let _g6198 = 0;
                                              G6199: {
                                                const _t6200 = (clueAt(cl.number, v_k) + 1);
                                                const _a6201 = cluesValued(cl.number, _t6200);
                                                for (let _i6202 = 0; _i6202 < _a6201.length; _i6202++) {
                                                  const v_x = _a6201[_i6202];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g6198++;
                                                }
                                              }
                                              _c6203 = (_g6198 === 0);
                                            }
                                            _c6204 = _c6203;
                                          }
                                          if (!(_c6204)) continue;
                                          _g6195++;
                                        }
                                      }
                                      _c6205 = (_g6190 < (2 - _g6195));
                                    }
                                    let _c6270: boolean = _c6205;
                                    if (_c6270) {
                                      let _q6206 = true;
                                      Q6207: {
                                        const _g6208: number[] = [];
                                        G6209: {
                                          for (let _i6211 = 0; _i6211 < 1; _i6211++) {
                                            const v_x = v_t;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g6208.push(v_x);
                                          }
                                        }
                                        const _g6212: number[] = [];
                                        G6213: {
                                          const _a6232 = throughWhere(sp, v_t, (_te6227: number): boolean => { let _c6229: boolean = ((_te6227 === _wc6011 ? _wd6012 : (_te6227 === _wc6009 ? _wd6010 : (b.grid[_te6227] || -1))) === 1); if (_c6229) {   const _t6228 = sp.edgeEnds[2 * _te6227];   _c6229 = !((clueAt(cl.number, _t6228) !== -1)); } let _c6231: boolean = _c6229; if (_c6231) {   const _t6230 = sp.edgeEnds[2 * _te6227 + 1];   _c6231 = !((clueAt(cl.number, _t6230) !== -1)); } return _c6231; });
                                          for (let _i6233 = 0; _i6233 < _a6232.length; _i6233++) {
                                            const v_t_6226 = _a6232[_i6233];
                                            const _a6234 = sp.adj4[v_t_6226];
                                            for (let _i6235 = 0; _i6235 < _a6234.length; _i6235++) {
                                              const v_x = _a6234[_i6235];
                                              let _c6237: boolean = (!((clueAt(cl.number, v_t_6226) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c6237) {
                                                const _t6236 = sp.adj4Edges[v_t_6226][_i6235];
                                                _c6237 = ((_t6236 === _wc6011 ? _wd6012 : (_t6236 === _wc6009 ? _wd6010 : (b.grid[_t6236] || -1))) === 1);
                                              }
                                              if (!(_c6237)) continue;
                                              if (!_g6212.includes(v_x)) _g6212.push(v_x);
                                            }
                                          }
                                        }
                                        const _a6238 = union(_g6208, _g6212);
                                        for (let _i6239 = 0; _i6239 < _a6238.length; _i6239++) {
                                          const v_p = _a6238[_i6239];
                                          const _g6240: number[] = [];
                                          G6241: {
                                            for (let _i6243 = 0; _i6243 < 1; _i6243++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g6240.push(v_x);
                                            }
                                          }
                                          const _g6244: number[] = [];
                                          G6245: {
                                            const _a6262 = throughWhere(sp, v_z, (_te6257: number): boolean => { let _c6259: boolean = ((_te6257 === _wc6011 ? _wd6012 : (_te6257 === _wc6009 ? _wd6010 : (b.grid[_te6257] || -1))) === 1); if (_c6259) {   const _t6258 = sp.edgeEnds[2 * _te6257];   _c6259 = !((clueAt(cl.number, _t6258) !== -1)); } let _c6261: boolean = _c6259; if (_c6261) {   const _t6260 = sp.edgeEnds[2 * _te6257 + 1];   _c6261 = !((clueAt(cl.number, _t6260) !== -1)); } return _c6261; });
                                            for (let _i6263 = 0; _i6263 < _a6262.length; _i6263++) {
                                              const v_t = _a6262[_i6263];
                                              const _a6264 = sp.adj4[v_t];
                                              for (let _i6265 = 0; _i6265 < _a6264.length; _i6265++) {
                                                const v_x = _a6264[_i6265];
                                                let _c6267: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c6267) {
                                                  const _t6266 = sp.adj4Edges[v_t][_i6265];
                                                  _c6267 = ((_t6266 === _wc6011 ? _wd6012 : (_t6266 === _wc6009 ? _wd6010 : (b.grid[_t6266] || -1))) === 1);
                                                }
                                                if (!(_c6267)) continue;
                                                if (!_g6244.includes(v_x)) _g6244.push(v_x);
                                              }
                                            }
                                          }
                                          const _a6268 = union(_g6240, _g6244);
                                          for (let _i6269 = 0; _i6269 < _a6268.length; _i6269++) {
                                            const v_q = _a6268[_i6269];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q6206 = false;
                                              break Q6207;
                                            }
                                          }
                                        }
                                      }
                                      _c6270 = _q6206;
                                    }
                                    if ((_c6270 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te6271: number): boolean => {  return ((_te6271 === _wc6011 ? _wd6012 : (_te6271 === _wc6009 ? _wd6010 : (b.grid[_te6271] || -1))) === 1); }).includes(v_z))))) {
                                      _q6168 = true;
                                      break Q6169;
                                    }
                                  }
                                }
                                _c6272 = _q6168;
                              }
                              if (_c6272) {
                                _q6049 = true;
                                break Q6050;
                              }
                            }
                          }
                          _c6273 = !(_q6049);
                        }
                        let _c6514: boolean = _c6273;
                        if (!_c6514) {
                          let _q6274 = false;
                          Q6275: {
                            const _a6276 = sp.adj4[v_t];
                            for (let _i6277 = 0; _i6277 < _a6276.length; _i6277++) {
                              const v_s = _a6276[_i6277];
                              let _g6278 = 0;
                              G6279: {
                                const _a6280 = sp.adj4[v_s];
                                for (let _i6281 = 0; _i6281 < _a6280.length; _i6281++) {
                                  const _t6282 = sp.adj4Edges[v_s][_i6281];
                                  if (!(((_t6282 === _wc6011 ? _wd6012 : (_t6282 === _wc6009 ? _wd6010 : (b.grid[_t6282] || -1))) === 1))) continue;
                                  _g6278++;
                                }
                              }
                              let _g6283 = 0;
                              G6284: {
                                for (let _i6285 = 0; _i6285 < 1; _i6285++) {
                                  const v_k = v_s;
                                  let _c6292: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c6292) {
                                    let _c6291: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c6291) {
                                      let _g6286 = 0;
                                      G6287: {
                                        const _t6288 = (clueAt(cl.number, v_k) + 1);
                                        const _a6289 = cluesValued(cl.number, _t6288);
                                        for (let _i6290 = 0; _i6290 < _a6289.length; _i6290++) {
                                          const v_x = _a6289[_i6290];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g6286++;
                                        }
                                      }
                                      _c6291 = (_g6286 === 0);
                                    }
                                    _c6292 = _c6291;
                                  }
                                  if (!(_c6292)) continue;
                                  _g6283++;
                                }
                              }
                              let _c6513: boolean = (_g6278 < (2 - _g6283));
                              if (_c6513) {
                                let _q6293 = false;
                                Q6294: {
                                  const _a6295 = sp.adj4[v_s];
                                  for (let _i6296 = 0; _i6296 < _a6295.length; _i6296++) {
                                    const v_y = _a6295[_i6296];
                                    const _t6297 = sp.adj4Edges[v_s][_i6296];
                                    let _c6313: boolean = !((_t6297 === _wc6011 ? true : (_t6297 === _wc6009 ? true : (b.grid[_t6297] !== 0))));
                                    if (_c6313) {
                                      let _g6298 = 0;
                                      G6299: {
                                        const _a6300 = sp.adj4[v_s];
                                        for (let _i6301 = 0; _i6301 < _a6300.length; _i6301++) {
                                          const _t6302 = sp.adj4Edges[v_s][_i6301];
                                          if (!(((_t6302 === _wc6011 ? _wd6012 : (_t6302 === _wc6009 ? _wd6010 : (b.grid[_t6302] || -1))) === 1))) continue;
                                          _g6298++;
                                        }
                                      }
                                      let _g6303 = 0;
                                      G6304: {
                                        for (let _i6305 = 0; _i6305 < 1; _i6305++) {
                                          const v_k = v_s;
                                          let _c6312: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c6312) {
                                            let _c6311: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c6311) {
                                              let _g6306 = 0;
                                              G6307: {
                                                const _t6308 = (clueAt(cl.number, v_k) + 1);
                                                const _a6309 = cluesValued(cl.number, _t6308);
                                                for (let _i6310 = 0; _i6310 < _a6309.length; _i6310++) {
                                                  const v_x = _a6309[_i6310];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g6306++;
                                                }
                                              }
                                              _c6311 = (_g6306 === 0);
                                            }
                                            _c6312 = _c6311;
                                          }
                                          if (!(_c6312)) continue;
                                          _g6303++;
                                        }
                                      }
                                      _c6313 = (_g6298 < (2 - _g6303));
                                    }
                                    let _c6330: boolean = _c6313;
                                    if (_c6330) {
                                      let _g6314 = 0;
                                      G6315: {
                                        const _a6317 = sp.adj4[v_y];
                                        for (let _i6318 = 0; _i6318 < _a6317.length; _i6318++) {
                                          const _t6319 = sp.adj4Edges[v_y][_i6318];
                                          if (!(((_t6319 === _wc6011 ? _wd6012 : (_t6319 === _wc6009 ? _wd6010 : (b.grid[_t6319] || -1))) === 1))) continue;
                                          _g6314++;
                                        }
                                      }
                                      let _g6320 = 0;
                                      G6321: {
                                        for (let _i6322 = 0; _i6322 < 1; _i6322++) {
                                          const v_k = v_y;
                                          let _c6329: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c6329) {
                                            let _c6328: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c6328) {
                                              let _g6323 = 0;
                                              G6324: {
                                                const _t6325 = (clueAt(cl.number, v_k) + 1);
                                                const _a6326 = cluesValued(cl.number, _t6325);
                                                for (let _i6327 = 0; _i6327 < _a6326.length; _i6327++) {
                                                  const v_x = _a6326[_i6327];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g6323++;
                                                }
                                              }
                                              _c6328 = (_g6323 === 0);
                                            }
                                            _c6329 = _c6328;
                                          }
                                          if (!(_c6329)) continue;
                                          _g6320++;
                                        }
                                      }
                                      _c6330 = (_g6314 < (2 - _g6320));
                                    }
                                    let _c6393: boolean = _c6330;
                                    if (_c6393) {
                                      let _q6331 = true;
                                      Q6332: {
                                        const _g6333: number[] = [];
                                        G6334: {
                                          for (let _i6336 = 0; _i6336 < 1; _i6336++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g6333.push(v_x);
                                          }
                                        }
                                        const _g6337: number[] = [];
                                        G6338: {
                                          const _a6355 = throughWhere(sp, v_s, (_te6350: number): boolean => { let _c6352: boolean = ((_te6350 === _wc6011 ? _wd6012 : (_te6350 === _wc6009 ? _wd6010 : (b.grid[_te6350] || -1))) === 1); if (_c6352) {   const _t6351 = sp.edgeEnds[2 * _te6350];   _c6352 = !((clueAt(cl.number, _t6351) !== -1)); } let _c6354: boolean = _c6352; if (_c6354) {   const _t6353 = sp.edgeEnds[2 * _te6350 + 1];   _c6354 = !((clueAt(cl.number, _t6353) !== -1)); } return _c6354; });
                                          for (let _i6356 = 0; _i6356 < _a6355.length; _i6356++) {
                                            const v_t = _a6355[_i6356];
                                            const _a6357 = sp.adj4[v_t];
                                            for (let _i6358 = 0; _i6358 < _a6357.length; _i6358++) {
                                              const v_x = _a6357[_i6358];
                                              let _c6360: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c6360) {
                                                const _t6359 = sp.adj4Edges[v_t][_i6358];
                                                _c6360 = ((_t6359 === _wc6011 ? _wd6012 : (_t6359 === _wc6009 ? _wd6010 : (b.grid[_t6359] || -1))) === 1);
                                              }
                                              if (!(_c6360)) continue;
                                              if (!_g6337.includes(v_x)) _g6337.push(v_x);
                                            }
                                          }
                                        }
                                        const _a6361 = union(_g6333, _g6337);
                                        for (let _i6362 = 0; _i6362 < _a6361.length; _i6362++) {
                                          const v_p = _a6361[_i6362];
                                          const _g6363: number[] = [];
                                          G6364: {
                                            for (let _i6366 = 0; _i6366 < 1; _i6366++) {
                                              const v_x = v_y;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g6363.push(v_x);
                                            }
                                          }
                                          const _g6367: number[] = [];
                                          G6368: {
                                            const _a6385 = throughWhere(sp, v_y, (_te6380: number): boolean => { let _c6382: boolean = ((_te6380 === _wc6011 ? _wd6012 : (_te6380 === _wc6009 ? _wd6010 : (b.grid[_te6380] || -1))) === 1); if (_c6382) {   const _t6381 = sp.edgeEnds[2 * _te6380];   _c6382 = !((clueAt(cl.number, _t6381) !== -1)); } let _c6384: boolean = _c6382; if (_c6384) {   const _t6383 = sp.edgeEnds[2 * _te6380 + 1];   _c6384 = !((clueAt(cl.number, _t6383) !== -1)); } return _c6384; });
                                            for (let _i6386 = 0; _i6386 < _a6385.length; _i6386++) {
                                              const v_t = _a6385[_i6386];
                                              const _a6387 = sp.adj4[v_t];
                                              for (let _i6388 = 0; _i6388 < _a6387.length; _i6388++) {
                                                const v_x = _a6387[_i6388];
                                                let _c6390: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c6390) {
                                                  const _t6389 = sp.adj4Edges[v_t][_i6388];
                                                  _c6390 = ((_t6389 === _wc6011 ? _wd6012 : (_t6389 === _wc6009 ? _wd6010 : (b.grid[_t6389] || -1))) === 1);
                                                }
                                                if (!(_c6390)) continue;
                                                if (!_g6367.includes(v_x)) _g6367.push(v_x);
                                              }
                                            }
                                          }
                                          const _a6391 = union(_g6363, _g6367);
                                          for (let _i6392 = 0; _i6392 < _a6391.length; _i6392++) {
                                            const v_q = _a6391[_i6392];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q6331 = false;
                                              break Q6332;
                                            }
                                          }
                                        }
                                      }
                                      _c6393 = _q6331;
                                    }
                                    if (!((_c6393 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te6394: number): boolean => {  return ((_te6394 === _wc6011 ? _wd6012 : (_te6394 === _wc6009 ? _wd6010 : (b.grid[_te6394] || -1))) === 1); }).includes(v_y)))))) continue;
                                    let _g6395 = 0;
                                    G6396: {
                                      const _a6397 = sp.adj4[v_s];
                                      for (let _i6398 = 0; _i6398 < _a6397.length; _i6398++) {
                                        const _t6399 = sp.adj4Edges[v_s][_i6398];
                                        if (!(((_t6399 === _wc6011 ? _wd6012 : (_t6399 === _wc6009 ? _wd6010 : (b.grid[_t6399] || -1))) === 1))) continue;
                                        _g6395++;
                                      }
                                    }
                                    let _g6400 = 0;
                                    G6401: {
                                      for (let _i6402 = 0; _i6402 < 1; _i6402++) {
                                        const v_k = v_s;
                                        let _c6409: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c6409) {
                                          let _c6408: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c6408) {
                                            let _g6403 = 0;
                                            G6404: {
                                              const _t6405 = (clueAt(cl.number, v_k) + 1);
                                              const _a6406 = cluesValued(cl.number, _t6405);
                                              for (let _i6407 = 0; _i6407 < _a6406.length; _i6407++) {
                                                const v_x = _a6406[_i6407];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g6403++;
                                              }
                                            }
                                            _c6408 = (_g6403 === 0);
                                          }
                                          _c6409 = _c6408;
                                        }
                                        if (!(_c6409)) continue;
                                        _g6400++;
                                      }
                                    }
                                    let _c6512: boolean = ((_g6395 + 1) === (2 - _g6400));
                                    if (!_c6512) {
                                      let _q6410 = false;
                                      Q6411: {
                                        const _a6412 = sp.adj4[v_s];
                                        const _n6413 = _i6296;
                                        for (let _i6414 = 0; _i6414 < _n6413; _i6414++) {
                                          const v_z = _a6412[_i6414];
                                          const _t6415 = sp.adj4Edges[v_s][_i6414];
                                          let _c6431: boolean = !((_t6415 === _wc6011 ? true : (_t6415 === _wc6009 ? true : (b.grid[_t6415] !== 0))));
                                          if (_c6431) {
                                            let _g6416 = 0;
                                            G6417: {
                                              const _a6418 = sp.adj4[v_s];
                                              for (let _i6419 = 0; _i6419 < _a6418.length; _i6419++) {
                                                const _t6420 = sp.adj4Edges[v_s][_i6419];
                                                if (!(((_t6420 === _wc6011 ? _wd6012 : (_t6420 === _wc6009 ? _wd6010 : (b.grid[_t6420] || -1))) === 1))) continue;
                                                _g6416++;
                                              }
                                            }
                                            let _g6421 = 0;
                                            G6422: {
                                              for (let _i6423 = 0; _i6423 < 1; _i6423++) {
                                                const v_k = v_s;
                                                let _c6430: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c6430) {
                                                  let _c6429: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c6429) {
                                                    let _g6424 = 0;
                                                    G6425: {
                                                      const _t6426 = (clueAt(cl.number, v_k) + 1);
                                                      const _a6427 = cluesValued(cl.number, _t6426);
                                                      for (let _i6428 = 0; _i6428 < _a6427.length; _i6428++) {
                                                        const v_x = _a6427[_i6428];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g6424++;
                                                      }
                                                    }
                                                    _c6429 = (_g6424 === 0);
                                                  }
                                                  _c6430 = _c6429;
                                                }
                                                if (!(_c6430)) continue;
                                                _g6421++;
                                              }
                                            }
                                            _c6431 = (_g6416 < (2 - _g6421));
                                          }
                                          let _c6447: boolean = _c6431;
                                          if (_c6447) {
                                            let _g6432 = 0;
                                            G6433: {
                                              const _a6434 = sp.adj4[v_z];
                                              for (let _i6435 = 0; _i6435 < _a6434.length; _i6435++) {
                                                const _t6436 = sp.adj4Edges[v_z][_i6435];
                                                if (!(((_t6436 === _wc6011 ? _wd6012 : (_t6436 === _wc6009 ? _wd6010 : (b.grid[_t6436] || -1))) === 1))) continue;
                                                _g6432++;
                                              }
                                            }
                                            let _g6437 = 0;
                                            G6438: {
                                              for (let _i6439 = 0; _i6439 < 1; _i6439++) {
                                                const v_k = v_z;
                                                let _c6446: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c6446) {
                                                  let _c6445: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c6445) {
                                                    let _g6440 = 0;
                                                    G6441: {
                                                      const _t6442 = (clueAt(cl.number, v_k) + 1);
                                                      const _a6443 = cluesValued(cl.number, _t6442);
                                                      for (let _i6444 = 0; _i6444 < _a6443.length; _i6444++) {
                                                        const v_x = _a6443[_i6444];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g6440++;
                                                      }
                                                    }
                                                    _c6445 = (_g6440 === 0);
                                                  }
                                                  _c6446 = _c6445;
                                                }
                                                if (!(_c6446)) continue;
                                                _g6437++;
                                              }
                                            }
                                            _c6447 = (_g6432 < (2 - _g6437));
                                          }
                                          let _c6510: boolean = _c6447;
                                          if (_c6510) {
                                            let _q6448 = true;
                                            Q6449: {
                                              const _g6450: number[] = [];
                                              G6451: {
                                                for (let _i6453 = 0; _i6453 < 1; _i6453++) {
                                                  const v_x = v_s;
                                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                  _g6450.push(v_x);
                                                }
                                              }
                                              const _g6454: number[] = [];
                                              G6455: {
                                                const _a6472 = throughWhere(sp, v_s, (_te6467: number): boolean => { let _c6469: boolean = ((_te6467 === _wc6011 ? _wd6012 : (_te6467 === _wc6009 ? _wd6010 : (b.grid[_te6467] || -1))) === 1); if (_c6469) {   const _t6468 = sp.edgeEnds[2 * _te6467];   _c6469 = !((clueAt(cl.number, _t6468) !== -1)); } let _c6471: boolean = _c6469; if (_c6471) {   const _t6470 = sp.edgeEnds[2 * _te6467 + 1];   _c6471 = !((clueAt(cl.number, _t6470) !== -1)); } return _c6471; });
                                                for (let _i6473 = 0; _i6473 < _a6472.length; _i6473++) {
                                                  const v_t = _a6472[_i6473];
                                                  const _a6474 = sp.adj4[v_t];
                                                  for (let _i6475 = 0; _i6475 < _a6474.length; _i6475++) {
                                                    const v_x = _a6474[_i6475];
                                                    let _c6477: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                    if (_c6477) {
                                                      const _t6476 = sp.adj4Edges[v_t][_i6475];
                                                      _c6477 = ((_t6476 === _wc6011 ? _wd6012 : (_t6476 === _wc6009 ? _wd6010 : (b.grid[_t6476] || -1))) === 1);
                                                    }
                                                    if (!(_c6477)) continue;
                                                    if (!_g6454.includes(v_x)) _g6454.push(v_x);
                                                  }
                                                }
                                              }
                                              const _a6478 = union(_g6450, _g6454);
                                              for (let _i6479 = 0; _i6479 < _a6478.length; _i6479++) {
                                                const v_p = _a6478[_i6479];
                                                const _g6480: number[] = [];
                                                G6481: {
                                                  for (let _i6483 = 0; _i6483 < 1; _i6483++) {
                                                    const v_x = v_z;
                                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                    _g6480.push(v_x);
                                                  }
                                                }
                                                const _g6484: number[] = [];
                                                G6485: {
                                                  const _a6502 = throughWhere(sp, v_z, (_te6497: number): boolean => { let _c6499: boolean = ((_te6497 === _wc6011 ? _wd6012 : (_te6497 === _wc6009 ? _wd6010 : (b.grid[_te6497] || -1))) === 1); if (_c6499) {   const _t6498 = sp.edgeEnds[2 * _te6497];   _c6499 = !((clueAt(cl.number, _t6498) !== -1)); } let _c6501: boolean = _c6499; if (_c6501) {   const _t6500 = sp.edgeEnds[2 * _te6497 + 1];   _c6501 = !((clueAt(cl.number, _t6500) !== -1)); } return _c6501; });
                                                  for (let _i6503 = 0; _i6503 < _a6502.length; _i6503++) {
                                                    const v_t = _a6502[_i6503];
                                                    const _a6504 = sp.adj4[v_t];
                                                    for (let _i6505 = 0; _i6505 < _a6504.length; _i6505++) {
                                                      const v_x = _a6504[_i6505];
                                                      let _c6507: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                      if (_c6507) {
                                                        const _t6506 = sp.adj4Edges[v_t][_i6505];
                                                        _c6507 = ((_t6506 === _wc6011 ? _wd6012 : (_t6506 === _wc6009 ? _wd6010 : (b.grid[_t6506] || -1))) === 1);
                                                      }
                                                      if (!(_c6507)) continue;
                                                      if (!_g6484.includes(v_x)) _g6484.push(v_x);
                                                    }
                                                  }
                                                }
                                                const _a6508 = union(_g6480, _g6484);
                                                for (let _i6509 = 0; _i6509 < _a6508.length; _i6509++) {
                                                  const v_q = _a6508[_i6509];
                                                  if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                                    _q6448 = false;
                                                    break Q6449;
                                                  }
                                                }
                                              }
                                            }
                                            _c6510 = _q6448;
                                          }
                                          if ((_c6510 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te6511: number): boolean => {  return ((_te6511 === _wc6011 ? _wd6012 : (_te6511 === _wc6009 ? _wd6010 : (b.grid[_te6511] || -1))) === 1); }).includes(v_z))))) {
                                            _q6410 = true;
                                            break Q6411;
                                          }
                                        }
                                      }
                                      _c6512 = _q6410;
                                    }
                                    if (_c6512) {
                                      _q6293 = true;
                                      break Q6294;
                                    }
                                  }
                                }
                                _c6513 = !(_q6293);
                              }
                              if (_c6513) {
                                _q6274 = true;
                                break Q6275;
                              }
                            }
                          }
                          _c6514 = _q6274;
                        }
                        if (_c6514) {
                          _q6013 = true;
                          break Q6014;
                        }
                      }
                    }
                    _c6515 = _q6013;
                  }
                  _c6516 = _c6515;
                }
                if (!(_c6516)) continue;
                const _t6517 = minus(v_U, setOf((v_U[0] ?? -1), v_i, v_j));
                const _t6518 = (_t6517.length > 0 ? _t6517[0] : -1);
                if (!_g5488.includes(_t6518)) _g5488.push(_t6518);
              }
            }
          }
          const _g6519: number[] = [];
          G6520: {
            const _a6530 = v_U;
            for (let _i6531 = 0; _i6531 < _a6530.length; _i6531++) {
              const v_y = _a6530[_i6531];
              let _c6538: boolean = ((_i6531 === 0) && (v_A.length < 3));
              if (!_c6538) {
                let _c6537: boolean = (_i6531 > 0);
                if (_c6537) {
                  let _c6536: boolean = !(v_A.includes(v_y));
                  if (!_c6536) {
                    let _q6532 = false;
                    Q6533: {
                      const _a6534 = v_U;
                      for (let _i6535 = 0; _i6535 < _a6534.length; _i6535++) {
                        const v_m = _a6534[_i6535];
                        if (!(((_i6535 > 0) && (v_m !== v_y)))) continue;
                        if (!(v_B.includes(v_m))) {
                          _q6532 = true;
                          break Q6533;
                        }
                      }
                    }
                    _c6536 = _q6532;
                  }
                  _c6537 = _c6536;
                }
                _c6538 = _c6537;
              }
              if (!(_c6538)) continue;
              _g6519.push(v_y);
            }
          }
          const _g6539: number[] = [];
          G6540: {
            const _a6549 = v_N;
            for (let _i6550 = 0; _i6550 < _a6549.length; _i6550++) {
              const v_y = _a6549[_i6550];
              let _c6556: boolean = ((v_U.indexOf(v_y) === 0) && (v_B.length === 3));
              if (!_c6556) {
                let _c6555: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
                if (_c6555) {
                  let _q6551 = true;
                  Q6552: {
                    const _a6553 = v_U;
                    for (let _i6554 = 0; _i6554 < _a6553.length; _i6554++) {
                      const v_m = _a6553[_i6554];
                      if (!(((_i6554 > 0) && (v_m !== v_y)))) continue;
                      if (!((v_A.includes(v_m)))) {
                        _q6551 = false;
                        break Q6552;
                      }
                    }
                  }
                  _c6555 = _q6551;
                }
                _c6556 = _c6555;
              }
              if (!(_c6556)) continue;
              _g6539.push(v_y);
            }
          }
          freshBinding("weighed", [(sp.cells.includes(v_c)), ((takes(sp, cl, v_c) - _g4456) === 2), sameSet(v_U, ways(b, sp, cl, v_c)), (v_U.length === 4), sameSet(v_A, _g4460), sameSet(v_B, _g5488), sameSet(v_N, _g6519), sameSet(v_P, _g6539), sameSet(v_X, minus(v_U, v_N)), (((v_N.length === 0) || (v_P.length > 0)) || (v_X.length > 0))], ["c in", "where of c", "U =", "where of U", "A =", "B =", "N =", "P =", "X =", "where of X"]);
        }
        facts.length = 0;
        changed = false;
        let _c6562: boolean = (_h4453 > 0);
        if (_c6562) {
          let _q6557 = true;
          Q6558: {
            const _a6559 = v_P;
            for (let _i6560 = 0; _i6560 < _a6559.length; _i6560++) {
              const v_y = _a6559[_i6560];
              const _t6561 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t6561] !== 0)) { if (fire === null) { b.placeAt(_t6561, 1); changed = true; } else facts.push(PLACE, _t6561, 1); }
              if (!(true)) {
                _q6557 = false;
                break Q6558;
              }
            }
          }
          _c6562 = _q6557;
        }
        let _c6569: boolean = _c6562;
        if (_c6569) {
          let _c6568: boolean = !((_h4454 === 0));
          if (!_c6568) {
            let _q6563 = true;
            Q6564: {
              const _a6565 = v_X;
              for (let _i6566 = 0; _i6566 < _a6565.length; _i6566++) {
                const v_y = _a6565[_i6566];
                const _t6567 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t6567] !== 0)) { if (fire === null) { b.placeAt(_t6567, 2); changed = true; } else facts.push(PLACE, _t6567, 2); }
                if (!(true)) {
                  _q6563 = false;
                  break Q6564;
                }
              }
            }
            _c6568 = _q6563;
          }
          _c6569 = _c6568;
        }
        if (!(_c6569)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c, U: v_U.slice(), P: v_P.slice(), X: v_X.slice() }, marks: {  } };
            if (!fire({ c: v_c, U: v_U.slice(), A: v_A.slice(), B: v_B.slice(), N: v_N.slice(), P: v_P.slice(), X: v_X.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          meetsMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

const takesKept = keptStore<number>();
let takesOn: object | null = null;
let takesAt: Kept<number> = [];

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== takesOn) {
    takesAt = takesKept.board(cl);
    takesOn = cl;
  }
  const _kept: Kept<number> = takesAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      const v_k = v_c;
      let _c10: boolean = (clueAt(cl.number, v_k) !== -1);
      if (_c10) {
        let _c9: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
        if (!_c9) {
          let _g4 = 0;
          G5: {
            const _t6 = (clueAt(cl.number, v_k) + 1);
            const _a7 = cluesValued(cl.number, _t6);
            for (let _i8 = 0; _i8 < _a7.length; _i8++) {
              const v_x = _a7[_i8];
              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
              _g4++;
            }
          }
          _c9 = (_g4 === 0);
        }
        _c10 = _c9;
      }
      if (!(_c10)) continue;
      _g1++;
    }
  }
  const _made = (2 - _g1);
  _kept[v_c] = _made;
  return _made;
}

const spareKept = keptStore<boolean>();

/** `spare(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function spare(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): boolean {
  const _kept: Kept<boolean> = spareKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i4]] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = (_g1 < takes(sp, cl, v_c));
  _kept[v_c] = _made;
  return _made;
}

const nearestKept = keptStore<readonly number[]>();

/** `nearest(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function nearest(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearestKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    for (let _i4 = 0; _i4 < 1; _i4++) {
      const v_x = v_c;
      if (!((clueAt(cl.number, v_x) !== -1))) continue;
      _g1.push(v_x);
    }
  }
  const _g5: number[] = [];
  G6: {
    const _a21 = throughWhere(sp, v_c, (_te16: number): boolean => { let _c18: boolean = ((b.grid[_te16] || -1) === 1); if (_c18) {   const _t17 = sp.edgeEnds[2 * _te16];   _c18 = !((clueAt(cl.number, _t17) !== -1)); } let _c20: boolean = _c18; if (_c20) {   const _t19 = sp.edgeEnds[2 * _te16 + 1];   _c20 = !((clueAt(cl.number, _t19) !== -1)); } return _c20; });
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_t = _a21[_i22];
      const _a23 = sp.adj4[v_t];
      for (let _i24 = 0; _i24 < _a23.length; _i24++) {
        const v_x = _a23[_i24];
        if (!(((!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1)) && ((b.grid[sp.adj4Edges[v_t][_i24]] || -1) === 1)))) continue;
        if (!_g5.includes(v_x)) _g5.push(v_x);
      }
    }
  }
  const _made = union(_g1, _g5);
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g1: number[] = [];
  G2: {
    const _a13 = sp.adj4[v_c];
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_y = _a13[_i14];
      let _c21: boolean = ((!((b.grid[sp.adj4Edges[v_c][_i14]] !== 0)) && spare(b, sp, cl, v_c)) && spare(b, sp, cl, v_y));
      if (_c21) {
        let _q15 = true;
        Q16: {
          const _a17 = nearest(b, sp, cl, v_c);
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_p = _a17[_i18];
            const _a19 = nearest(b, sp, cl, v_y);
            for (let _i20 = 0; _i20 < _a19.length; _i20++) {
              const v_q = _a19[_i20];
              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                _q15 = false;
                break Q16;
              }
            }
          }
        }
        _c21 = _q15;
      }
      if (!((_c21 && ((cl.step === 0) || !(throughWhere(sp, v_c, (_te22: number): boolean => {  return ((b.grid[_te22] || -1) === 1); }).includes(v_y)))))) continue;
      _g1.push(v_y);
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const pieceKept = keptStore<readonly number[]>();

/** `piece(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function piece(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = pieceKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = throughWhere(sp, v_c, (_te1: number): boolean => {  return ((b.grid[_te1] || -1) === 1); });
  _kept[v_c] = _made;
  return _made;
}

const meetsMarkedKept = new Map<number, boolean>();

/** `meets(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetsMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _q1 = true;
  Q2: {
    const _a3 = nearest(b, sp, cl, v_a);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_p = _a3[_i4];
      const _a5 = nearest(b, sp, cl, v_b);
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_q = _a5[_i6];
        if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
          _q1 = false;
          break Q2;
        }
      }
    }
  }
  const _made = _q1;
  meetsMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const liveMarkedKept = new Map<number, boolean>();

/** `live(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function liveMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = liveMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  const _made = ((((!((b.grid[sp.edgeOf(v_a, v_b)] !== 0)) && spare(b, sp, cl, v_a)) && spare(b, sp, cl, v_b)) && meetsMarked(b, sp, cl, cands, v_a, v_b)) && ((cl.step === 0) || !(throughWhere(sp, v_a, (_te1: number): boolean => {  return ((b.grid[_te1] || -1) === 1); }).includes(v_b))));
  liveMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}
