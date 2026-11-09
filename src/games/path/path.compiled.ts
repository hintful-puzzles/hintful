// Compiled by `npm run describe` from src/games/path/path.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, keptStore, minus, rangeMask, setOf, stamps, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g6874: number[] = [];
  const _g6879: number[] = [];
  const _st6890 = stamps();
  const _g6940: number[] = [];
  const _g6945: number[] = [];
  const _st6956 = stamps();
  const _domain = rangeMask(1, 2);
  const _k6868 = takesKept.board(cl);
  const _h6923 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q6859 = true;
  Q6860: {
    const _a6861 = sp.cells;
    for (let _i6862 = 0; _i6862 < _a6861.length; _i6862++) {
      const v_c = _a6861[_i6862];
      let _g6863 = 0;
      G6864: {
        const _a6865 = sp.adj4[v_c];
        for (let _i6866 = 0; _i6866 < _a6865.length; _i6866++) {
          const _h6867 = (g[sp.adj4Edges[v_c][_i6866]] || -1);
          if (!((_h6867 === 1))) continue;
          _g6863++;
        }
      }
      if (!((_g6863 === (_k6868[v_c] ?? takes(sp, cl, v_c))))) {
        _q6859 = false;
        break Q6860;
      }
    }
  }
  if (!(_q6859)) return false;
  let _q6869 = true;
  Q6870: {
    const _a6871 = sp.cells;
    for (let _i6872 = 0; _i6872 < _a6871.length; _i6872++) {
      const v_c = _a6871[_i6872];
      const _h6873 = clueAt(cl.number, v_c);
      if (!(!((_h6873 !== -1)))) continue;
      _g6874.length = 0;
      G6875: {
        for (let _i6877 = 0; _i6877 < 1; _i6877++) {
          const v_x = v_c;
          const _h6878 = clueAt(cl.number, v_x);
          if (!((_h6878 !== -1))) continue;
          _g6874.push(v_x);
        }
      }
      _g6879.length = 0;
      _st6890.pass++;
      G6880: {
        const _a6896 = throughWhere(sp, v_c, (_te6891: number): boolean => { let _c6893: boolean = ((g[_te6891] || -1) === 1); if (_c6893) {   const _t6892 = sp.edgeEnds[2 * _te6891];   _c6893 = !((clueAt(cl.number, _t6892) !== -1)); } let _c6895: boolean = _c6893; if (_c6895) {   const _t6894 = sp.edgeEnds[2 * _te6891 + 1];   _c6895 = !((clueAt(cl.number, _t6894) !== -1)); } return _c6895; });
        for (let _i6897 = 0; _i6897 < _a6896.length; _i6897++) {
          const v_t = _a6896[_i6897];
          const _h6900 = clueAt(cl.number, v_t);
          const _h6901 = (_h6900 !== -1);
          const _h6902 = _h6901;
          const _h6903 = !(_h6902);
          const _a6898 = sp.adj4[v_t];
          for (let _i6899 = 0; _i6899 < _a6898.length; _i6899++) {
            const v_x = _a6898[_i6899];
            const _h6904 = clueAt(cl.number, v_x);
            const _h6905 = (g[sp.adj4Edges[v_t][_i6899]] || -1);
            if (!(((_h6903 && (_h6904 !== -1)) && (_h6905 === 1)))) continue;
            const _t6906 = v_x;
            if (_g6879.length < 16) { if (!_g6879.includes(_t6906)) _g6879.push(_t6906); } else addOnce(_g6879, _st6890, _t6906);
          }
        }
      }
      if (!((union(_g6874, _g6879).length === 2))) {
        _q6869 = false;
        break Q6870;
      }
    }
  }
  if (!(_q6869)) return false;
  let _c6912: boolean = (cl.step === 0);
  if (!_c6912) {
    let _q6907 = false;
    Q6908: {
      const _a6909 = sp.cells;
      for (let _i6910 = 0; _i6910 < _a6909.length; _i6910++) {
        const v_x = _a6909[_i6910];
        const _h6911 = clueAt(cl.number, v_x);
        if ((_h6911 === 2)) {
          _q6907 = true;
          break Q6908;
        }
      }
    }
    _c6912 = _q6907;
  }
  let _c6932: boolean = _c6912;
  if (_c6932) {
    let _q6913 = true;
    Q6914: {
      const _a6915 = sp.cells;
      for (let _i6916 = 0; _i6916 < _a6915.length; _i6916++) {
        const v_x = _a6915[_i6916];
        const _h6917 = clueAt(cl.number, v_x);
        if (!((_h6917 !== -1))) continue;
        const _h6929 = (_h6917 - 1);
        let _g6918 = 0;
        G6919: {
          const _a6920 = cluesValued(cl.number, _h6917);
          for (let _i6921 = 0; _i6921 < _a6920.length; _i6921++) {
            const v_y = _a6920[_i6921];
            const _h6922 = clueAt(cl.number, v_y);
            if (!((_h6922 === _h6917))) continue;
            _g6918++;
          }
        }
        let _c6931: boolean = (_g6918 === _h6923);
        if (_c6931) {
          let _c6930: boolean = (_h6917 === 1);
          if (!_c6930) {
            let _q6924 = false;
            Q6925: {
              const _a6926 = sp.cells;
              for (let _i6927 = 0; _i6927 < _a6926.length; _i6927++) {
                const v_y = _a6926[_i6927];
                const _h6928 = clueAt(cl.number, v_y);
                if ((_h6928 === _h6929)) {
                  _q6924 = true;
                  break Q6925;
                }
              }
            }
            _c6930 = _q6924;
          }
          _c6931 = _c6930;
        }
        if (!(_c6931)) {
          _q6913 = false;
          break Q6914;
        }
      }
    }
    _c6932 = _q6913;
  }
  if (!(_c6932)) return false;
  for (let _k6933 = 0; _k6933 < cl.number.at.length; _k6933++) {
    const _at6934 = cl.number.at[_k6933];
    let _q6936 = true;
    Q6937: {
      const _a6938 = sp.adj4[_at6934];
      for (let _i6939 = 0; _i6939 < _a6938.length; _i6939++) {
        const v_y = _a6938[_i6939];
        if (!(((g[sp.adj4Edges[_at6934][_i6939]] || -1) === 1))) continue;
        _g6940.length = 0;
        G6941: {
          for (let _i6943 = 0; _i6943 < 1; _i6943++) {
            const v_x = v_y;
            const _h6944 = clueAt(cl.number, v_x);
            if (!((_h6944 !== -1))) continue;
            _g6940.push(v_x);
          }
        }
        _g6945.length = 0;
        _st6956.pass++;
        G6946: {
          const _a6962 = throughWhere(sp, v_y, (_te6957: number): boolean => { let _c6959: boolean = ((g[_te6957] || -1) === 1); if (_c6959) {   const _t6958 = sp.edgeEnds[2 * _te6957];   _c6959 = !((clueAt(cl.number, _t6958) !== -1)); } let _c6961: boolean = _c6959; if (_c6961) {   const _t6960 = sp.edgeEnds[2 * _te6957 + 1];   _c6961 = !((clueAt(cl.number, _t6960) !== -1)); } return _c6961; });
          for (let _i6963 = 0; _i6963 < _a6962.length; _i6963++) {
            const v_t = _a6962[_i6963];
            const _h6966 = clueAt(cl.number, v_t);
            const _h6967 = (_h6966 !== -1);
            const _h6968 = _h6967;
            const _h6969 = !(_h6968);
            const _a6964 = sp.adj4[v_t];
            for (let _i6965 = 0; _i6965 < _a6964.length; _i6965++) {
              const v_x = _a6964[_i6965];
              const _h6970 = clueAt(cl.number, v_x);
              const _h6971 = (g[sp.adj4Edges[v_t][_i6965]] || -1);
              if (!(((_h6969 && (_h6970 !== -1)) && (_h6971 === 1)))) continue;
              const _t6972 = v_x;
              if (_g6945.length < 16) { if (!_g6945.includes(_t6972)) _g6945.push(_t6972); } else addOnce(_g6945, _st6956, _t6972);
            }
          }
        }
        const _a6973 = union(_g6940, _g6945);
        for (let _i6974 = 0; _i6974 < _a6973.length; _i6974++) {
          const v_q = _a6973[_i6974];
          if (!((v_q !== _at6934))) continue;
          const _h6976 = clueAt(cl.number, v_q);
          const _h6975 = clueAt(cl.number, _at6934);
          if (!((Math.abs((_h6975 - _h6976)) === cl.step))) {
            _q6936 = false;
            break Q6937;
          }
        }
      }
    }
    if (!(_q6936)) return false;
  }
  for (let _k6977 = 0; _k6977 < cl.wall.at.length; _k6977++) {
    const _at6978 = cl.wall.at[_k6977];
    if (!(((g[_at6978] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const forcedFacts: number[] = [];
let forcedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function forced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ForcedBinding> | null): number {
  const facts = forcedFacts;
  let fired = 0;
  let changed = false;
  const _k70 = takesKept.board(cl);
  if (forcedCands.length < sp.edges.length) forcedCands = new Int32Array(sp.edges.length);
  const cands = forcedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a68 = sp.cells;
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_c = _a68[_i69];
    const _h85 = clueAt(cl.number, v_c);
    const _h86 = (_h85 !== -1);
    const _h87 = _h86;
    let _g71 = 0;
    G72: {
      const _a73 = sp.adj4[v_c];
      for (let _i74 = 0; _i74 < _a73.length; _i74++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i74]] || -1) === 1))) continue;
        _g71++;
      }
    }
    const v_n = ((_k70[v_c] ?? takes(sp, cl, v_c)) - _g71);
    L75: {
      const v_U = ways(b, sp, cl, v_c);
      const _h76 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h76 <= v_n))))) break L75;
      facts.length = 0;
      changed = false;
      let _c94: boolean = ((v_n >= 0) && (_h76 === v_n));
      if (_c94) {
        let _q77 = true;
        Q78: {
          const _a79 = v_U;
          for (let _i80 = 0; _i80 < _a79.length; _i80++) {
            const v_i = _a79[_i80];
            const _a81 = v_U;
            const _n82 = _i80;
            for (let _i83 = 0; _i83 < _n82; _i83++) {
              const v_j = _a81[_i83];
              if (!((!(piece(b, sp, v_i).includes(v_j)) && (_h87 || meetsMarked(b, sp, cl, cands, v_i, v_j))))) {
                _q77 = false;
                break Q78;
              }
            }
          }
        }
        _c94 = _q77;
      }
      let _c100: boolean = _c94;
      if (_c100) {
        let _q95 = true;
        Q96: {
          const _a97 = v_U;
          for (let _i98 = 0; _i98 < _a97.length; _i98++) {
            const v_y = _a97[_i98];
            const _t99 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t99] !== 0)) { if (fire === null) { b.placeAt(_t99, 1); changed = true; } else facts.push(PLACE, _t99, 1); }
            if (!(true)) {
              _q95 = false;
              break Q96;
            }
          }
        }
        _c100 = _q95;
      }
      if (!(_c100)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, n: v_n, U: v_U.slice() }, facts)) return 1;
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

const lineBreaksFacts: number[] = [];
let lineBreaksCands = new Int32Array(0);
const _st726 = stamps();
const _st765 = stamps();
const _st872 = stamps();
const _st911 = stamps();
const _st1023 = stamps();
const _st1061 = stamps();
const _st1167 = stamps();
const _st1205 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const _g707: number[] = [];
  const _g712: number[] = [];
  const _g747: number[] = [];
  const _g752: number[] = [];
  const _g853: number[] = [];
  const _g858: number[] = [];
  const _g893: number[] = [];
  const _g898: number[] = [];
  const _g1005: number[] = [];
  const _g1010: number[] = [];
  const _g1043: number[] = [];
  const _g1048: number[] = [];
  const _g1149: number[] = [];
  const _g1154: number[] = [];
  const _g1187: number[] = [];
  const _g1192: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h632 = (cl.step === 0);
  if (lineBreaksCands.length < sp.edges.length) lineBreaksCands = new Int32Array(sp.edges.length);
  const cands = lineBreaksCands;
  cands.fill(-1);
  liveMarkedKept.clear();
  meetsMarkedKept.clear();
  const _a612 = sp.edges;
  for (let _i613 = 0; _i613 < _a612.length; _i613++) {
    const v_e = _a612[_i613];
    const v_a = sp.edgeEnds[2 * v_e];
    L614: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c1233: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
      if (_c1233) {
        let _c1232: boolean = (throughWhere(sp, v_a, (_te615: number): boolean => {  return ((b.grid[_te615] || -1) === 1); }).includes(v_b));
        if (!_c1232) {
          const _wc616 = v_e;
          const _wd617 = 1;
          let _q618 = false;
          Q619: {
            const _a621 = throughWhere(sp, v_a, (_te620: number): boolean => {  return ((_te620 === _wc616 ? _wd617 : (b.grid[_te620] || -1)) === 1); });
            for (let _i622 = 0; _i622 < _a621.length; _i622++) {
              const v_t = _a621[_i622];
              let _c642: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c642) {
                let _g623 = 0;
                G624: {
                  const _a625 = sp.adj4[v_t];
                  for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                    const _t627 = sp.adj4Edges[v_t][_i626];
                    if (!(((_t627 === _wc616 ? _wd617 : (b.grid[_t627] || -1)) === 1))) continue;
                    _g623++;
                  }
                }
                let _g628 = 0;
                G629: {
                  for (let _i630 = 0; _i630 < 1; _i630++) {
                    const v_k = v_t;
                    const _h631 = clueAt(cl.number, v_k);
                    const _h639 = (_h631 + 1);
                    let _c641: boolean = (_h631 !== -1);
                    if (_c641) {
                      let _c640: boolean = (_h632 || (_h631 === 1));
                      if (!_c640) {
                        let _g633 = 0;
                        G634: {
                          const _t635 = (_h631 + 1);
                          const _a636 = cluesValued(cl.number, _t635);
                          for (let _i637 = 0; _i637 < _a636.length; _i637++) {
                            const v_x = _a636[_i637];
                            const _h638 = clueAt(cl.number, v_x);
                            if (!((_h638 === _h639))) continue;
                            _g633++;
                          }
                        }
                        _c640 = (_g633 === 0);
                      }
                      _c641 = _c640;
                    }
                    if (!(_c641)) continue;
                    _g628++;
                  }
                }
                _c642 = (_g623 < (2 - _g628));
              }
              if (!(_c642)) continue;
              let _g643 = 0;
              G644: {
                const _a645 = sp.adj4[v_t];
                for (let _i646 = 0; _i646 < _a645.length; _i646++) {
                  const _t647 = sp.adj4Edges[v_t][_i646];
                  if (!(((_t647 === _wc616 ? _wd617 : (b.grid[_t647] || -1)) === 1))) continue;
                  _g643++;
                }
              }
              let _g648 = 0;
              G649: {
                for (let _i650 = 0; _i650 < 1; _i650++) {
                  const v_k = v_t;
                  const _h651 = clueAt(cl.number, v_k);
                  const _h658 = (_h651 + 1);
                  let _c660: boolean = (_h651 !== -1);
                  if (_c660) {
                    let _c659: boolean = (_h632 || (_h651 === 1));
                    if (!_c659) {
                      let _g652 = 0;
                      G653: {
                        const _t654 = (_h651 + 1);
                        const _a655 = cluesValued(cl.number, _t654);
                        for (let _i656 = 0; _i656 < _a655.length; _i656++) {
                          const v_x = _a655[_i656];
                          const _h657 = clueAt(cl.number, v_x);
                          if (!((_h657 === _h658))) continue;
                          _g652++;
                        }
                      }
                      _c659 = (_g652 === 0);
                    }
                    _c660 = _c659;
                  }
                  if (!(_c660)) continue;
                  _g648++;
                }
              }
              let _c936: boolean = (_g643 < (2 - _g648));
              if (_c936) {
                let _q661 = false;
                Q662: {
                  const _a663 = sp.adj4[v_t];
                  for (let _i664 = 0; _i664 < _a663.length; _i664++) {
                    const v_y = _a663[_i664];
                    const _t665 = sp.adj4Edges[v_t][_i664];
                    let _c684: boolean = !((_t665 === _wc616 ? true : (b.grid[_t665] !== 0)));
                    if (_c684) {
                      let _g666 = 0;
                      G667: {
                        const _a668 = sp.adj4[v_t];
                        for (let _i669 = 0; _i669 < _a668.length; _i669++) {
                          const _t670 = sp.adj4Edges[v_t][_i669];
                          if (!(((_t670 === _wc616 ? _wd617 : (b.grid[_t670] || -1)) === 1))) continue;
                          _g666++;
                        }
                      }
                      let _g671 = 0;
                      G672: {
                        for (let _i673 = 0; _i673 < 1; _i673++) {
                          const v_k = v_t;
                          const _h674 = clueAt(cl.number, v_k);
                          const _h681 = (_h674 + 1);
                          let _c683: boolean = (_h674 !== -1);
                          if (_c683) {
                            let _c682: boolean = (_h632 || (_h674 === 1));
                            if (!_c682) {
                              let _g675 = 0;
                              G676: {
                                const _t677 = (_h674 + 1);
                                const _a678 = cluesValued(cl.number, _t677);
                                for (let _i679 = 0; _i679 < _a678.length; _i679++) {
                                  const v_x = _a678[_i679];
                                  const _h680 = clueAt(cl.number, v_x);
                                  if (!((_h680 === _h681))) continue;
                                  _g675++;
                                }
                              }
                              _c682 = (_g675 === 0);
                            }
                            _c683 = _c682;
                          }
                          if (!(_c683)) continue;
                          _g671++;
                        }
                      }
                      _c684 = (_g666 < (2 - _g671));
                    }
                    let _c704: boolean = _c684;
                    if (_c704) {
                      let _g685 = 0;
                      G686: {
                        const _a688 = sp.adj4[v_y];
                        for (let _i689 = 0; _i689 < _a688.length; _i689++) {
                          const _t690 = sp.adj4Edges[v_y][_i689];
                          if (!(((_t690 === _wc616 ? _wd617 : (b.grid[_t690] || -1)) === 1))) continue;
                          _g685++;
                        }
                      }
                      let _g691 = 0;
                      G692: {
                        for (let _i693 = 0; _i693 < 1; _i693++) {
                          const v_k = v_y;
                          const _h694 = clueAt(cl.number, v_k);
                          const _h701 = (_h694 + 1);
                          let _c703: boolean = (_h694 !== -1);
                          if (_c703) {
                            let _c702: boolean = (_h632 || (_h694 === 1));
                            if (!_c702) {
                              let _g695 = 0;
                              G696: {
                                const _t697 = (_h694 + 1);
                                const _a698 = cluesValued(cl.number, _t697);
                                for (let _i699 = 0; _i699 < _a698.length; _i699++) {
                                  const v_x = _a698[_i699];
                                  const _h700 = clueAt(cl.number, v_x);
                                  if (!((_h700 === _h701))) continue;
                                  _g695++;
                                }
                              }
                              _c702 = (_g695 === 0);
                            }
                            _c703 = _c702;
                          }
                          if (!(_c703)) continue;
                          _g691++;
                        }
                      }
                      _c704 = (_g685 < (2 - _g691));
                    }
                    let _c787: boolean = _c704;
                    if (_c787) {
                      let _q705 = true;
                      Q706: {
                        _g707.length = 0;
                        G708: {
                          for (let _i710 = 0; _i710 < 1; _i710++) {
                            const v_x = v_t;
                            const _h711 = clueAt(cl.number, v_x);
                            if (!((_h711 !== -1))) continue;
                            _g707.push(v_x);
                          }
                        }
                        _g712.length = 0;
                        _st726.pass++;
                        G713: {
                          const _a733 = throughWhere(sp, v_t, (_te728: number): boolean => { let _c730: boolean = ((_te728 === _wc616 ? _wd617 : (b.grid[_te728] || -1)) === 1); if (_c730) {   const _t729 = sp.edgeEnds[2 * _te728];   _c730 = !((clueAt(cl.number, _t729) !== -1)); } let _c732: boolean = _c730; if (_c732) {   const _t731 = sp.edgeEnds[2 * _te728 + 1];   _c732 = !((clueAt(cl.number, _t731) !== -1)); } return _c732; });
                          for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                            const v_t_727 = _a733[_i734];
                            const _h737 = clueAt(cl.number, v_t_727);
                            const _h738 = (_h737 !== -1);
                            const _h739 = _h738;
                            const _h740 = !(_h739);
                            const _a735 = sp.adj4[v_t_727];
                            for (let _i736 = 0; _i736 < _a735.length; _i736++) {
                              const v_x = _a735[_i736];
                              const _h741 = clueAt(cl.number, v_x);
                              let _c743: boolean = (_h740 && (_h741 !== -1));
                              if (_c743) {
                                const _t742 = sp.adj4Edges[v_t_727][_i736];
                                _c743 = ((_t742 === _wc616 ? _wd617 : (b.grid[_t742] || -1)) === 1);
                              }
                              if (!(_c743)) continue;
                              const _t744 = v_x;
                              if (_g712.length < 16) { if (!_g712.includes(_t744)) _g712.push(_t744); } else addOnce(_g712, _st726, _t744);
                            }
                          }
                        }
                        const _a745 = union(_g707, _g712);
                        for (let _i746 = 0; _i746 < _a745.length; _i746++) {
                          const v_p = _a745[_i746];
                          const _h785 = clueAt(cl.number, v_p);
                          _g747.length = 0;
                          G748: {
                            for (let _i750 = 0; _i750 < 1; _i750++) {
                              const v_x = v_y;
                              const _h751 = clueAt(cl.number, v_x);
                              if (!((_h751 !== -1))) continue;
                              _g747.push(v_x);
                            }
                          }
                          _g752.length = 0;
                          _st765.pass++;
                          G753: {
                            const _a771 = throughWhere(sp, v_y, (_te766: number): boolean => { let _c768: boolean = ((_te766 === _wc616 ? _wd617 : (b.grid[_te766] || -1)) === 1); if (_c768) {   const _t767 = sp.edgeEnds[2 * _te766];   _c768 = !((clueAt(cl.number, _t767) !== -1)); } let _c770: boolean = _c768; if (_c770) {   const _t769 = sp.edgeEnds[2 * _te766 + 1];   _c770 = !((clueAt(cl.number, _t769) !== -1)); } return _c770; });
                            for (let _i772 = 0; _i772 < _a771.length; _i772++) {
                              const v_t = _a771[_i772];
                              const _h775 = clueAt(cl.number, v_t);
                              const _h776 = (_h775 !== -1);
                              const _h777 = _h776;
                              const _h778 = !(_h777);
                              const _a773 = sp.adj4[v_t];
                              for (let _i774 = 0; _i774 < _a773.length; _i774++) {
                                const v_x = _a773[_i774];
                                const _h779 = clueAt(cl.number, v_x);
                                let _c781: boolean = (_h778 && (_h779 !== -1));
                                if (_c781) {
                                  const _t780 = sp.adj4Edges[v_t][_i774];
                                  _c781 = ((_t780 === _wc616 ? _wd617 : (b.grid[_t780] || -1)) === 1);
                                }
                                if (!(_c781)) continue;
                                const _t782 = v_x;
                                if (_g752.length < 16) { if (!_g752.includes(_t782)) _g752.push(_t782); } else addOnce(_g752, _st765, _t782);
                              }
                            }
                          }
                          const _a783 = union(_g747, _g752);
                          for (let _i784 = 0; _i784 < _a783.length; _i784++) {
                            const v_q = _a783[_i784];
                            const _h786 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h785 - _h786)) === cl.step))) {
                              _q705 = false;
                              break Q706;
                            }
                          }
                        }
                      }
                      _c787 = _q705;
                    }
                    if (!((_c787 && (_h632 || !(throughWhere(sp, v_t, (_te788: number): boolean => {  return ((_te788 === _wc616 ? _wd617 : (b.grid[_te788] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g789 = 0;
                    G790: {
                      const _a791 = sp.adj4[v_t];
                      for (let _i792 = 0; _i792 < _a791.length; _i792++) {
                        const _t793 = sp.adj4Edges[v_t][_i792];
                        if (!(((_t793 === _wc616 ? _wd617 : (b.grid[_t793] || -1)) === 1))) continue;
                        _g789++;
                      }
                    }
                    let _g794 = 0;
                    G795: {
                      for (let _i796 = 0; _i796 < 1; _i796++) {
                        const v_k = v_t;
                        const _h797 = clueAt(cl.number, v_k);
                        const _h804 = (_h797 + 1);
                        let _c806: boolean = (_h797 !== -1);
                        if (_c806) {
                          let _c805: boolean = (_h632 || (_h797 === 1));
                          if (!_c805) {
                            let _g798 = 0;
                            G799: {
                              const _t800 = (_h797 + 1);
                              const _a801 = cluesValued(cl.number, _t800);
                              for (let _i802 = 0; _i802 < _a801.length; _i802++) {
                                const v_x = _a801[_i802];
                                const _h803 = clueAt(cl.number, v_x);
                                if (!((_h803 === _h804))) continue;
                                _g798++;
                              }
                            }
                            _c805 = (_g798 === 0);
                          }
                          _c806 = _c805;
                        }
                        if (!(_c806)) continue;
                        _g794++;
                      }
                    }
                    let _c935: boolean = ((_g789 + 1) === (2 - _g794));
                    if (!_c935) {
                      let _q807 = false;
                      Q808: {
                        const _a809 = sp.adj4[v_t];
                        const _n810 = _i664;
                        for (let _i811 = 0; _i811 < _n810; _i811++) {
                          const v_z = _a809[_i811];
                          const _t812 = sp.adj4Edges[v_t][_i811];
                          let _c831: boolean = !((_t812 === _wc616 ? true : (b.grid[_t812] !== 0)));
                          if (_c831) {
                            let _g813 = 0;
                            G814: {
                              const _a815 = sp.adj4[v_t];
                              for (let _i816 = 0; _i816 < _a815.length; _i816++) {
                                const _t817 = sp.adj4Edges[v_t][_i816];
                                if (!(((_t817 === _wc616 ? _wd617 : (b.grid[_t817] || -1)) === 1))) continue;
                                _g813++;
                              }
                            }
                            let _g818 = 0;
                            G819: {
                              for (let _i820 = 0; _i820 < 1; _i820++) {
                                const v_k = v_t;
                                const _h821 = clueAt(cl.number, v_k);
                                const _h828 = (_h821 + 1);
                                let _c830: boolean = (_h821 !== -1);
                                if (_c830) {
                                  let _c829: boolean = (_h632 || (_h821 === 1));
                                  if (!_c829) {
                                    let _g822 = 0;
                                    G823: {
                                      const _t824 = (_h821 + 1);
                                      const _a825 = cluesValued(cl.number, _t824);
                                      for (let _i826 = 0; _i826 < _a825.length; _i826++) {
                                        const v_x = _a825[_i826];
                                        const _h827 = clueAt(cl.number, v_x);
                                        if (!((_h827 === _h828))) continue;
                                        _g822++;
                                      }
                                    }
                                    _c829 = (_g822 === 0);
                                  }
                                  _c830 = _c829;
                                }
                                if (!(_c830)) continue;
                                _g818++;
                              }
                            }
                            _c831 = (_g813 < (2 - _g818));
                          }
                          let _c850: boolean = _c831;
                          if (_c850) {
                            let _g832 = 0;
                            G833: {
                              const _a834 = sp.adj4[v_z];
                              for (let _i835 = 0; _i835 < _a834.length; _i835++) {
                                const _t836 = sp.adj4Edges[v_z][_i835];
                                if (!(((_t836 === _wc616 ? _wd617 : (b.grid[_t836] || -1)) === 1))) continue;
                                _g832++;
                              }
                            }
                            let _g837 = 0;
                            G838: {
                              for (let _i839 = 0; _i839 < 1; _i839++) {
                                const v_k = v_z;
                                const _h840 = clueAt(cl.number, v_k);
                                const _h847 = (_h840 + 1);
                                let _c849: boolean = (_h840 !== -1);
                                if (_c849) {
                                  let _c848: boolean = (_h632 || (_h840 === 1));
                                  if (!_c848) {
                                    let _g841 = 0;
                                    G842: {
                                      const _t843 = (_h840 + 1);
                                      const _a844 = cluesValued(cl.number, _t843);
                                      for (let _i845 = 0; _i845 < _a844.length; _i845++) {
                                        const v_x = _a844[_i845];
                                        const _h846 = clueAt(cl.number, v_x);
                                        if (!((_h846 === _h847))) continue;
                                        _g841++;
                                      }
                                    }
                                    _c848 = (_g841 === 0);
                                  }
                                  _c849 = _c848;
                                }
                                if (!(_c849)) continue;
                                _g837++;
                              }
                            }
                            _c850 = (_g832 < (2 - _g837));
                          }
                          let _c933: boolean = _c850;
                          if (_c933) {
                            let _q851 = true;
                            Q852: {
                              _g853.length = 0;
                              G854: {
                                for (let _i856 = 0; _i856 < 1; _i856++) {
                                  const v_x = v_t;
                                  const _h857 = clueAt(cl.number, v_x);
                                  if (!((_h857 !== -1))) continue;
                                  _g853.push(v_x);
                                }
                              }
                              _g858.length = 0;
                              _st872.pass++;
                              G859: {
                                const _a879 = throughWhere(sp, v_t, (_te874: number): boolean => { let _c876: boolean = ((_te874 === _wc616 ? _wd617 : (b.grid[_te874] || -1)) === 1); if (_c876) {   const _t875 = sp.edgeEnds[2 * _te874];   _c876 = !((clueAt(cl.number, _t875) !== -1)); } let _c878: boolean = _c876; if (_c878) {   const _t877 = sp.edgeEnds[2 * _te874 + 1];   _c878 = !((clueAt(cl.number, _t877) !== -1)); } return _c878; });
                                for (let _i880 = 0; _i880 < _a879.length; _i880++) {
                                  const v_t_873 = _a879[_i880];
                                  const _h883 = clueAt(cl.number, v_t_873);
                                  const _h884 = (_h883 !== -1);
                                  const _h885 = _h884;
                                  const _h886 = !(_h885);
                                  const _a881 = sp.adj4[v_t_873];
                                  for (let _i882 = 0; _i882 < _a881.length; _i882++) {
                                    const v_x = _a881[_i882];
                                    const _h887 = clueAt(cl.number, v_x);
                                    let _c889: boolean = (_h886 && (_h887 !== -1));
                                    if (_c889) {
                                      const _t888 = sp.adj4Edges[v_t_873][_i882];
                                      _c889 = ((_t888 === _wc616 ? _wd617 : (b.grid[_t888] || -1)) === 1);
                                    }
                                    if (!(_c889)) continue;
                                    const _t890 = v_x;
                                    if (_g858.length < 16) { if (!_g858.includes(_t890)) _g858.push(_t890); } else addOnce(_g858, _st872, _t890);
                                  }
                                }
                              }
                              const _a891 = union(_g853, _g858);
                              for (let _i892 = 0; _i892 < _a891.length; _i892++) {
                                const v_p = _a891[_i892];
                                const _h931 = clueAt(cl.number, v_p);
                                _g893.length = 0;
                                G894: {
                                  for (let _i896 = 0; _i896 < 1; _i896++) {
                                    const v_x = v_z;
                                    const _h897 = clueAt(cl.number, v_x);
                                    if (!((_h897 !== -1))) continue;
                                    _g893.push(v_x);
                                  }
                                }
                                _g898.length = 0;
                                _st911.pass++;
                                G899: {
                                  const _a917 = throughWhere(sp, v_z, (_te912: number): boolean => { let _c914: boolean = ((_te912 === _wc616 ? _wd617 : (b.grid[_te912] || -1)) === 1); if (_c914) {   const _t913 = sp.edgeEnds[2 * _te912];   _c914 = !((clueAt(cl.number, _t913) !== -1)); } let _c916: boolean = _c914; if (_c916) {   const _t915 = sp.edgeEnds[2 * _te912 + 1];   _c916 = !((clueAt(cl.number, _t915) !== -1)); } return _c916; });
                                  for (let _i918 = 0; _i918 < _a917.length; _i918++) {
                                    const v_t = _a917[_i918];
                                    const _h921 = clueAt(cl.number, v_t);
                                    const _h922 = (_h921 !== -1);
                                    const _h923 = _h922;
                                    const _h924 = !(_h923);
                                    const _a919 = sp.adj4[v_t];
                                    for (let _i920 = 0; _i920 < _a919.length; _i920++) {
                                      const v_x = _a919[_i920];
                                      const _h925 = clueAt(cl.number, v_x);
                                      let _c927: boolean = (_h924 && (_h925 !== -1));
                                      if (_c927) {
                                        const _t926 = sp.adj4Edges[v_t][_i920];
                                        _c927 = ((_t926 === _wc616 ? _wd617 : (b.grid[_t926] || -1)) === 1);
                                      }
                                      if (!(_c927)) continue;
                                      const _t928 = v_x;
                                      if (_g898.length < 16) { if (!_g898.includes(_t928)) _g898.push(_t928); } else addOnce(_g898, _st911, _t928);
                                    }
                                  }
                                }
                                const _a929 = union(_g893, _g898);
                                for (let _i930 = 0; _i930 < _a929.length; _i930++) {
                                  const v_q = _a929[_i930];
                                  const _h932 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h931 - _h932)) === cl.step))) {
                                    _q851 = false;
                                    break Q852;
                                  }
                                }
                              }
                            }
                            _c933 = _q851;
                          }
                          if ((_c933 && (_h632 || !(throughWhere(sp, v_t, (_te934: number): boolean => {  return ((_te934 === _wc616 ? _wd617 : (b.grid[_te934] || -1)) === 1); }).includes(v_z))))) {
                            _q807 = true;
                            break Q808;
                          }
                        }
                      }
                      _c935 = _q807;
                    }
                    if (_c935) {
                      _q661 = true;
                      break Q662;
                    }
                  }
                }
                _c936 = !(_q661);
              }
              let _c1231: boolean = _c936;
              if (!_c1231) {
                let _q937 = false;
                Q938: {
                  const _a939 = sp.adj4[v_t];
                  for (let _i940 = 0; _i940 < _a939.length; _i940++) {
                    const v_s = _a939[_i940];
                    let _g941 = 0;
                    G942: {
                      const _a943 = sp.adj4[v_s];
                      for (let _i944 = 0; _i944 < _a943.length; _i944++) {
                        const _t945 = sp.adj4Edges[v_s][_i944];
                        if (!(((_t945 === _wc616 ? _wd617 : (b.grid[_t945] || -1)) === 1))) continue;
                        _g941++;
                      }
                    }
                    let _g946 = 0;
                    G947: {
                      for (let _i948 = 0; _i948 < 1; _i948++) {
                        const v_k = v_s;
                        const _h949 = clueAt(cl.number, v_k);
                        const _h956 = (_h949 + 1);
                        let _c958: boolean = (_h949 !== -1);
                        if (_c958) {
                          let _c957: boolean = (_h632 || (_h949 === 1));
                          if (!_c957) {
                            let _g950 = 0;
                            G951: {
                              const _t952 = (_h949 + 1);
                              const _a953 = cluesValued(cl.number, _t952);
                              for (let _i954 = 0; _i954 < _a953.length; _i954++) {
                                const v_x = _a953[_i954];
                                const _h955 = clueAt(cl.number, v_x);
                                if (!((_h955 === _h956))) continue;
                                _g950++;
                              }
                            }
                            _c957 = (_g950 === 0);
                          }
                          _c958 = _c957;
                        }
                        if (!(_c958)) continue;
                        _g946++;
                      }
                    }
                    let _c1230: boolean = (_g941 < (2 - _g946));
                    if (_c1230) {
                      let _q959 = false;
                      Q960: {
                        const _a961 = sp.adj4[v_s];
                        for (let _i962 = 0; _i962 < _a961.length; _i962++) {
                          const v_y = _a961[_i962];
                          const _t963 = sp.adj4Edges[v_s][_i962];
                          let _c982: boolean = !((_t963 === _wc616 ? true : (b.grid[_t963] !== 0)));
                          if (_c982) {
                            let _g964 = 0;
                            G965: {
                              const _a966 = sp.adj4[v_s];
                              for (let _i967 = 0; _i967 < _a966.length; _i967++) {
                                const _t968 = sp.adj4Edges[v_s][_i967];
                                if (!(((_t968 === _wc616 ? _wd617 : (b.grid[_t968] || -1)) === 1))) continue;
                                _g964++;
                              }
                            }
                            let _g969 = 0;
                            G970: {
                              for (let _i971 = 0; _i971 < 1; _i971++) {
                                const v_k = v_s;
                                const _h972 = clueAt(cl.number, v_k);
                                const _h979 = (_h972 + 1);
                                let _c981: boolean = (_h972 !== -1);
                                if (_c981) {
                                  let _c980: boolean = (_h632 || (_h972 === 1));
                                  if (!_c980) {
                                    let _g973 = 0;
                                    G974: {
                                      const _t975 = (_h972 + 1);
                                      const _a976 = cluesValued(cl.number, _t975);
                                      for (let _i977 = 0; _i977 < _a976.length; _i977++) {
                                        const v_x = _a976[_i977];
                                        const _h978 = clueAt(cl.number, v_x);
                                        if (!((_h978 === _h979))) continue;
                                        _g973++;
                                      }
                                    }
                                    _c980 = (_g973 === 0);
                                  }
                                  _c981 = _c980;
                                }
                                if (!(_c981)) continue;
                                _g969++;
                              }
                            }
                            _c982 = (_g964 < (2 - _g969));
                          }
                          let _c1002: boolean = _c982;
                          if (_c1002) {
                            let _g983 = 0;
                            G984: {
                              const _a986 = sp.adj4[v_y];
                              for (let _i987 = 0; _i987 < _a986.length; _i987++) {
                                const _t988 = sp.adj4Edges[v_y][_i987];
                                if (!(((_t988 === _wc616 ? _wd617 : (b.grid[_t988] || -1)) === 1))) continue;
                                _g983++;
                              }
                            }
                            let _g989 = 0;
                            G990: {
                              for (let _i991 = 0; _i991 < 1; _i991++) {
                                const v_k = v_y;
                                const _h992 = clueAt(cl.number, v_k);
                                const _h999 = (_h992 + 1);
                                let _c1001: boolean = (_h992 !== -1);
                                if (_c1001) {
                                  let _c1000: boolean = (_h632 || (_h992 === 1));
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
                            _c1002 = (_g983 < (2 - _g989));
                          }
                          let _c1083: boolean = _c1002;
                          if (_c1083) {
                            let _q1003 = true;
                            Q1004: {
                              _g1005.length = 0;
                              G1006: {
                                for (let _i1008 = 0; _i1008 < 1; _i1008++) {
                                  const v_x = v_s;
                                  const _h1009 = clueAt(cl.number, v_x);
                                  if (!((_h1009 !== -1))) continue;
                                  _g1005.push(v_x);
                                }
                              }
                              _g1010.length = 0;
                              _st1023.pass++;
                              G1011: {
                                const _a1029 = throughWhere(sp, v_s, (_te1024: number): boolean => { let _c1026: boolean = ((_te1024 === _wc616 ? _wd617 : (b.grid[_te1024] || -1)) === 1); if (_c1026) {   const _t1025 = sp.edgeEnds[2 * _te1024];   _c1026 = !((clueAt(cl.number, _t1025) !== -1)); } let _c1028: boolean = _c1026; if (_c1028) {   const _t1027 = sp.edgeEnds[2 * _te1024 + 1];   _c1028 = !((clueAt(cl.number, _t1027) !== -1)); } return _c1028; });
                                for (let _i1030 = 0; _i1030 < _a1029.length; _i1030++) {
                                  const v_t = _a1029[_i1030];
                                  const _h1033 = clueAt(cl.number, v_t);
                                  const _h1034 = (_h1033 !== -1);
                                  const _h1035 = _h1034;
                                  const _h1036 = !(_h1035);
                                  const _a1031 = sp.adj4[v_t];
                                  for (let _i1032 = 0; _i1032 < _a1031.length; _i1032++) {
                                    const v_x = _a1031[_i1032];
                                    const _h1037 = clueAt(cl.number, v_x);
                                    let _c1039: boolean = (_h1036 && (_h1037 !== -1));
                                    if (_c1039) {
                                      const _t1038 = sp.adj4Edges[v_t][_i1032];
                                      _c1039 = ((_t1038 === _wc616 ? _wd617 : (b.grid[_t1038] || -1)) === 1);
                                    }
                                    if (!(_c1039)) continue;
                                    const _t1040 = v_x;
                                    if (_g1010.length < 16) { if (!_g1010.includes(_t1040)) _g1010.push(_t1040); } else addOnce(_g1010, _st1023, _t1040);
                                  }
                                }
                              }
                              const _a1041 = union(_g1005, _g1010);
                              for (let _i1042 = 0; _i1042 < _a1041.length; _i1042++) {
                                const v_p = _a1041[_i1042];
                                const _h1081 = clueAt(cl.number, v_p);
                                _g1043.length = 0;
                                G1044: {
                                  for (let _i1046 = 0; _i1046 < 1; _i1046++) {
                                    const v_x = v_y;
                                    const _h1047 = clueAt(cl.number, v_x);
                                    if (!((_h1047 !== -1))) continue;
                                    _g1043.push(v_x);
                                  }
                                }
                                _g1048.length = 0;
                                _st1061.pass++;
                                G1049: {
                                  const _a1067 = throughWhere(sp, v_y, (_te1062: number): boolean => { let _c1064: boolean = ((_te1062 === _wc616 ? _wd617 : (b.grid[_te1062] || -1)) === 1); if (_c1064) {   const _t1063 = sp.edgeEnds[2 * _te1062];   _c1064 = !((clueAt(cl.number, _t1063) !== -1)); } let _c1066: boolean = _c1064; if (_c1066) {   const _t1065 = sp.edgeEnds[2 * _te1062 + 1];   _c1066 = !((clueAt(cl.number, _t1065) !== -1)); } return _c1066; });
                                  for (let _i1068 = 0; _i1068 < _a1067.length; _i1068++) {
                                    const v_t = _a1067[_i1068];
                                    const _h1071 = clueAt(cl.number, v_t);
                                    const _h1072 = (_h1071 !== -1);
                                    const _h1073 = _h1072;
                                    const _h1074 = !(_h1073);
                                    const _a1069 = sp.adj4[v_t];
                                    for (let _i1070 = 0; _i1070 < _a1069.length; _i1070++) {
                                      const v_x = _a1069[_i1070];
                                      const _h1075 = clueAt(cl.number, v_x);
                                      let _c1077: boolean = (_h1074 && (_h1075 !== -1));
                                      if (_c1077) {
                                        const _t1076 = sp.adj4Edges[v_t][_i1070];
                                        _c1077 = ((_t1076 === _wc616 ? _wd617 : (b.grid[_t1076] || -1)) === 1);
                                      }
                                      if (!(_c1077)) continue;
                                      const _t1078 = v_x;
                                      if (_g1048.length < 16) { if (!_g1048.includes(_t1078)) _g1048.push(_t1078); } else addOnce(_g1048, _st1061, _t1078);
                                    }
                                  }
                                }
                                const _a1079 = union(_g1043, _g1048);
                                for (let _i1080 = 0; _i1080 < _a1079.length; _i1080++) {
                                  const v_q = _a1079[_i1080];
                                  const _h1082 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1081 - _h1082)) === cl.step))) {
                                    _q1003 = false;
                                    break Q1004;
                                  }
                                }
                              }
                            }
                            _c1083 = _q1003;
                          }
                          if (!((_c1083 && (_h632 || !(throughWhere(sp, v_s, (_te1084: number): boolean => {  return ((_te1084 === _wc616 ? _wd617 : (b.grid[_te1084] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g1085 = 0;
                          G1086: {
                            const _a1087 = sp.adj4[v_s];
                            for (let _i1088 = 0; _i1088 < _a1087.length; _i1088++) {
                              const _t1089 = sp.adj4Edges[v_s][_i1088];
                              if (!(((_t1089 === _wc616 ? _wd617 : (b.grid[_t1089] || -1)) === 1))) continue;
                              _g1085++;
                            }
                          }
                          let _g1090 = 0;
                          G1091: {
                            for (let _i1092 = 0; _i1092 < 1; _i1092++) {
                              const v_k = v_s;
                              const _h1093 = clueAt(cl.number, v_k);
                              const _h1100 = (_h1093 + 1);
                              let _c1102: boolean = (_h1093 !== -1);
                              if (_c1102) {
                                let _c1101: boolean = (_h632 || (_h1093 === 1));
                                if (!_c1101) {
                                  let _g1094 = 0;
                                  G1095: {
                                    const _t1096 = (_h1093 + 1);
                                    const _a1097 = cluesValued(cl.number, _t1096);
                                    for (let _i1098 = 0; _i1098 < _a1097.length; _i1098++) {
                                      const v_x = _a1097[_i1098];
                                      const _h1099 = clueAt(cl.number, v_x);
                                      if (!((_h1099 === _h1100))) continue;
                                      _g1094++;
                                    }
                                  }
                                  _c1101 = (_g1094 === 0);
                                }
                                _c1102 = _c1101;
                              }
                              if (!(_c1102)) continue;
                              _g1090++;
                            }
                          }
                          let _c1229: boolean = ((_g1085 + 1) === (2 - _g1090));
                          if (!_c1229) {
                            let _q1103 = false;
                            Q1104: {
                              const _a1105 = sp.adj4[v_s];
                              const _n1106 = _i962;
                              for (let _i1107 = 0; _i1107 < _n1106; _i1107++) {
                                const v_z = _a1105[_i1107];
                                const _t1108 = sp.adj4Edges[v_s][_i1107];
                                let _c1127: boolean = !((_t1108 === _wc616 ? true : (b.grid[_t1108] !== 0)));
                                if (_c1127) {
                                  let _g1109 = 0;
                                  G1110: {
                                    const _a1111 = sp.adj4[v_s];
                                    for (let _i1112 = 0; _i1112 < _a1111.length; _i1112++) {
                                      const _t1113 = sp.adj4Edges[v_s][_i1112];
                                      if (!(((_t1113 === _wc616 ? _wd617 : (b.grid[_t1113] || -1)) === 1))) continue;
                                      _g1109++;
                                    }
                                  }
                                  let _g1114 = 0;
                                  G1115: {
                                    for (let _i1116 = 0; _i1116 < 1; _i1116++) {
                                      const v_k = v_s;
                                      const _h1117 = clueAt(cl.number, v_k);
                                      const _h1124 = (_h1117 + 1);
                                      let _c1126: boolean = (_h1117 !== -1);
                                      if (_c1126) {
                                        let _c1125: boolean = (_h632 || (_h1117 === 1));
                                        if (!_c1125) {
                                          let _g1118 = 0;
                                          G1119: {
                                            const _t1120 = (_h1117 + 1);
                                            const _a1121 = cluesValued(cl.number, _t1120);
                                            for (let _i1122 = 0; _i1122 < _a1121.length; _i1122++) {
                                              const v_x = _a1121[_i1122];
                                              const _h1123 = clueAt(cl.number, v_x);
                                              if (!((_h1123 === _h1124))) continue;
                                              _g1118++;
                                            }
                                          }
                                          _c1125 = (_g1118 === 0);
                                        }
                                        _c1126 = _c1125;
                                      }
                                      if (!(_c1126)) continue;
                                      _g1114++;
                                    }
                                  }
                                  _c1127 = (_g1109 < (2 - _g1114));
                                }
                                let _c1146: boolean = _c1127;
                                if (_c1146) {
                                  let _g1128 = 0;
                                  G1129: {
                                    const _a1130 = sp.adj4[v_z];
                                    for (let _i1131 = 0; _i1131 < _a1130.length; _i1131++) {
                                      const _t1132 = sp.adj4Edges[v_z][_i1131];
                                      if (!(((_t1132 === _wc616 ? _wd617 : (b.grid[_t1132] || -1)) === 1))) continue;
                                      _g1128++;
                                    }
                                  }
                                  let _g1133 = 0;
                                  G1134: {
                                    for (let _i1135 = 0; _i1135 < 1; _i1135++) {
                                      const v_k = v_z;
                                      const _h1136 = clueAt(cl.number, v_k);
                                      const _h1143 = (_h1136 + 1);
                                      let _c1145: boolean = (_h1136 !== -1);
                                      if (_c1145) {
                                        let _c1144: boolean = (_h632 || (_h1136 === 1));
                                        if (!_c1144) {
                                          let _g1137 = 0;
                                          G1138: {
                                            const _t1139 = (_h1136 + 1);
                                            const _a1140 = cluesValued(cl.number, _t1139);
                                            for (let _i1141 = 0; _i1141 < _a1140.length; _i1141++) {
                                              const v_x = _a1140[_i1141];
                                              const _h1142 = clueAt(cl.number, v_x);
                                              if (!((_h1142 === _h1143))) continue;
                                              _g1137++;
                                            }
                                          }
                                          _c1144 = (_g1137 === 0);
                                        }
                                        _c1145 = _c1144;
                                      }
                                      if (!(_c1145)) continue;
                                      _g1133++;
                                    }
                                  }
                                  _c1146 = (_g1128 < (2 - _g1133));
                                }
                                let _c1227: boolean = _c1146;
                                if (_c1227) {
                                  let _q1147 = true;
                                  Q1148: {
                                    _g1149.length = 0;
                                    G1150: {
                                      for (let _i1152 = 0; _i1152 < 1; _i1152++) {
                                        const v_x = v_s;
                                        const _h1153 = clueAt(cl.number, v_x);
                                        if (!((_h1153 !== -1))) continue;
                                        _g1149.push(v_x);
                                      }
                                    }
                                    _g1154.length = 0;
                                    _st1167.pass++;
                                    G1155: {
                                      const _a1173 = throughWhere(sp, v_s, (_te1168: number): boolean => { let _c1170: boolean = ((_te1168 === _wc616 ? _wd617 : (b.grid[_te1168] || -1)) === 1); if (_c1170) {   const _t1169 = sp.edgeEnds[2 * _te1168];   _c1170 = !((clueAt(cl.number, _t1169) !== -1)); } let _c1172: boolean = _c1170; if (_c1172) {   const _t1171 = sp.edgeEnds[2 * _te1168 + 1];   _c1172 = !((clueAt(cl.number, _t1171) !== -1)); } return _c1172; });
                                      for (let _i1174 = 0; _i1174 < _a1173.length; _i1174++) {
                                        const v_t = _a1173[_i1174];
                                        const _h1177 = clueAt(cl.number, v_t);
                                        const _h1178 = (_h1177 !== -1);
                                        const _h1179 = _h1178;
                                        const _h1180 = !(_h1179);
                                        const _a1175 = sp.adj4[v_t];
                                        for (let _i1176 = 0; _i1176 < _a1175.length; _i1176++) {
                                          const v_x = _a1175[_i1176];
                                          const _h1181 = clueAt(cl.number, v_x);
                                          let _c1183: boolean = (_h1180 && (_h1181 !== -1));
                                          if (_c1183) {
                                            const _t1182 = sp.adj4Edges[v_t][_i1176];
                                            _c1183 = ((_t1182 === _wc616 ? _wd617 : (b.grid[_t1182] || -1)) === 1);
                                          }
                                          if (!(_c1183)) continue;
                                          const _t1184 = v_x;
                                          if (_g1154.length < 16) { if (!_g1154.includes(_t1184)) _g1154.push(_t1184); } else addOnce(_g1154, _st1167, _t1184);
                                        }
                                      }
                                    }
                                    const _a1185 = union(_g1149, _g1154);
                                    for (let _i1186 = 0; _i1186 < _a1185.length; _i1186++) {
                                      const v_p = _a1185[_i1186];
                                      const _h1225 = clueAt(cl.number, v_p);
                                      _g1187.length = 0;
                                      G1188: {
                                        for (let _i1190 = 0; _i1190 < 1; _i1190++) {
                                          const v_x = v_z;
                                          const _h1191 = clueAt(cl.number, v_x);
                                          if (!((_h1191 !== -1))) continue;
                                          _g1187.push(v_x);
                                        }
                                      }
                                      _g1192.length = 0;
                                      _st1205.pass++;
                                      G1193: {
                                        const _a1211 = throughWhere(sp, v_z, (_te1206: number): boolean => { let _c1208: boolean = ((_te1206 === _wc616 ? _wd617 : (b.grid[_te1206] || -1)) === 1); if (_c1208) {   const _t1207 = sp.edgeEnds[2 * _te1206];   _c1208 = !((clueAt(cl.number, _t1207) !== -1)); } let _c1210: boolean = _c1208; if (_c1210) {   const _t1209 = sp.edgeEnds[2 * _te1206 + 1];   _c1210 = !((clueAt(cl.number, _t1209) !== -1)); } return _c1210; });
                                        for (let _i1212 = 0; _i1212 < _a1211.length; _i1212++) {
                                          const v_t = _a1211[_i1212];
                                          const _h1215 = clueAt(cl.number, v_t);
                                          const _h1216 = (_h1215 !== -1);
                                          const _h1217 = _h1216;
                                          const _h1218 = !(_h1217);
                                          const _a1213 = sp.adj4[v_t];
                                          for (let _i1214 = 0; _i1214 < _a1213.length; _i1214++) {
                                            const v_x = _a1213[_i1214];
                                            const _h1219 = clueAt(cl.number, v_x);
                                            let _c1221: boolean = (_h1218 && (_h1219 !== -1));
                                            if (_c1221) {
                                              const _t1220 = sp.adj4Edges[v_t][_i1214];
                                              _c1221 = ((_t1220 === _wc616 ? _wd617 : (b.grid[_t1220] || -1)) === 1);
                                            }
                                            if (!(_c1221)) continue;
                                            const _t1222 = v_x;
                                            if (_g1192.length < 16) { if (!_g1192.includes(_t1222)) _g1192.push(_t1222); } else addOnce(_g1192, _st1205, _t1222);
                                          }
                                        }
                                      }
                                      const _a1223 = union(_g1187, _g1192);
                                      for (let _i1224 = 0; _i1224 < _a1223.length; _i1224++) {
                                        const v_q = _a1223[_i1224];
                                        const _h1226 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1225 - _h1226)) === cl.step))) {
                                          _q1147 = false;
                                          break Q1148;
                                        }
                                      }
                                    }
                                  }
                                  _c1227 = _q1147;
                                }
                                if ((_c1227 && (_h632 || !(throughWhere(sp, v_s, (_te1228: number): boolean => {  return ((_te1228 === _wc616 ? _wd617 : (b.grid[_te1228] || -1)) === 1); }).includes(v_z))))) {
                                  _q1103 = true;
                                  break Q1104;
                                }
                              }
                            }
                            _c1229 = _q1103;
                          }
                          if (_c1229) {
                            _q959 = true;
                            break Q960;
                          }
                        }
                      }
                      _c1230 = !(_q959);
                    }
                    if (_c1230) {
                      _q937 = true;
                      break Q938;
                    }
                  }
                }
                _c1231 = _q937;
              }
              if (_c1231) {
                _q618 = true;
                break Q619;
              }
            }
          }
          _c1232 = _q618;
        }
        _c1233 = _c1232;
      }
      if (!(_c1233)) break L614;
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ e: v_e, a: v_a, b: v_b }, facts)) return 1;
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

const pairBreaksFacts: number[] = [];
let pairBreaksCands = new Int32Array(0);
const _st1882 = stamps();
const _st1921 = stamps();
const _st2028 = stamps();
const _st2067 = stamps();
const _st2179 = stamps();
const _st2217 = stamps();
const _st2323 = stamps();
const _st2361 = stamps();

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g1863: number[] = [];
  const _g1868: number[] = [];
  const _g1903: number[] = [];
  const _g1908: number[] = [];
  const _g2009: number[] = [];
  const _g2014: number[] = [];
  const _g2049: number[] = [];
  const _g2054: number[] = [];
  const _g2161: number[] = [];
  const _g2166: number[] = [];
  const _g2199: number[] = [];
  const _g2204: number[] = [];
  const _g2305: number[] = [];
  const _g2310: number[] = [];
  const _g2343: number[] = [];
  const _g2348: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k1755 = takesKept.board(cl);
  const _h1788 = (cl.step === 0);
  if (pairBreaksCands.length < sp.edges.length) pairBreaksCands = new Int32Array(sp.edges.length);
  const cands = pairBreaksCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a1753 = sp.cells;
  for (let _i1754 = 0; _i1754 < _a1753.length; _i1754++) {
    const v_c = _a1753[_i1754];
    let _g1756 = 0;
    G1757: {
      const _a1758 = sp.adj4[v_c];
      for (let _i1759 = 0; _i1759 < _a1758.length; _i1759++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i1759]] || -1) === 1))) continue;
        _g1756++;
      }
    }
    if (!((((_k1755[v_c] ?? takes(sp, cl, v_c)) - _g1756) === 2))) continue;
    const _h1766 = clueAt(cl.number, v_c);
    const _h1767 = (_h1766 !== -1);
    const _h1768 = _h1767;
    const _h1769 = !(_h1768);
    L1760: {
      const v_U = ways(b, sp, cl, v_c);
      const _h1761 = v_U.length;
      if (!((_h1761 === 3))) break L1760;
      const _a1762 = v_U;
      for (let _i1763 = 0; _i1763 < _a1762.length; _i1763++) {
        const v_k = _a1762[_i1763];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L1764: {
          const v_j = (v_I[1] ?? -1);
          let _c2389: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c2389) {
            let _c2388: boolean = ((throughWhere(sp, v_i, (_te1765: number): boolean => {  return ((b.grid[_te1765] || -1) === 1); }).includes(v_j)) || (_h1769 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
            if (!_c2388) {
              const _wc1770 = sp.edgeOf(v_c, v_i);
              const _wd1771 = 1;
              const _wc1772 = sp.edgeOf(v_c, v_j);
              const _wd1773 = 1;
              let _q1774 = false;
              Q1775: {
                const _a1777 = throughWhere(sp, v_c, (_te1776: number): boolean => {  return ((_te1776 === _wc1772 ? _wd1773 : (_te1776 === _wc1770 ? _wd1771 : (b.grid[_te1776] || -1))) === 1); });
                for (let _i1778 = 0; _i1778 < _a1777.length; _i1778++) {
                  const v_t = _a1777[_i1778];
                  let _c1798: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c1798) {
                    let _g1779 = 0;
                    G1780: {
                      const _a1781 = sp.adj4[v_t];
                      for (let _i1782 = 0; _i1782 < _a1781.length; _i1782++) {
                        const _t1783 = sp.adj4Edges[v_t][_i1782];
                        if (!(((_t1783 === _wc1772 ? _wd1773 : (_t1783 === _wc1770 ? _wd1771 : (b.grid[_t1783] || -1))) === 1))) continue;
                        _g1779++;
                      }
                    }
                    let _g1784 = 0;
                    G1785: {
                      for (let _i1786 = 0; _i1786 < 1; _i1786++) {
                        const v_k = v_t;
                        const _h1787 = clueAt(cl.number, v_k);
                        const _h1795 = (_h1787 + 1);
                        let _c1797: boolean = (_h1787 !== -1);
                        if (_c1797) {
                          let _c1796: boolean = (_h1788 || (_h1787 === 1));
                          if (!_c1796) {
                            let _g1789 = 0;
                            G1790: {
                              const _t1791 = (_h1787 + 1);
                              const _a1792 = cluesValued(cl.number, _t1791);
                              for (let _i1793 = 0; _i1793 < _a1792.length; _i1793++) {
                                const v_x = _a1792[_i1793];
                                const _h1794 = clueAt(cl.number, v_x);
                                if (!((_h1794 === _h1795))) continue;
                                _g1789++;
                              }
                            }
                            _c1796 = (_g1789 === 0);
                          }
                          _c1797 = _c1796;
                        }
                        if (!(_c1797)) continue;
                        _g1784++;
                      }
                    }
                    _c1798 = (_g1779 < (2 - _g1784));
                  }
                  if (!(_c1798)) continue;
                  let _g1799 = 0;
                  G1800: {
                    const _a1801 = sp.adj4[v_t];
                    for (let _i1802 = 0; _i1802 < _a1801.length; _i1802++) {
                      const _t1803 = sp.adj4Edges[v_t][_i1802];
                      if (!(((_t1803 === _wc1772 ? _wd1773 : (_t1803 === _wc1770 ? _wd1771 : (b.grid[_t1803] || -1))) === 1))) continue;
                      _g1799++;
                    }
                  }
                  let _g1804 = 0;
                  G1805: {
                    for (let _i1806 = 0; _i1806 < 1; _i1806++) {
                      const v_k = v_t;
                      const _h1807 = clueAt(cl.number, v_k);
                      const _h1814 = (_h1807 + 1);
                      let _c1816: boolean = (_h1807 !== -1);
                      if (_c1816) {
                        let _c1815: boolean = (_h1788 || (_h1807 === 1));
                        if (!_c1815) {
                          let _g1808 = 0;
                          G1809: {
                            const _t1810 = (_h1807 + 1);
                            const _a1811 = cluesValued(cl.number, _t1810);
                            for (let _i1812 = 0; _i1812 < _a1811.length; _i1812++) {
                              const v_x = _a1811[_i1812];
                              const _h1813 = clueAt(cl.number, v_x);
                              if (!((_h1813 === _h1814))) continue;
                              _g1808++;
                            }
                          }
                          _c1815 = (_g1808 === 0);
                        }
                        _c1816 = _c1815;
                      }
                      if (!(_c1816)) continue;
                      _g1804++;
                    }
                  }
                  let _c2092: boolean = (_g1799 < (2 - _g1804));
                  if (_c2092) {
                    let _q1817 = false;
                    Q1818: {
                      const _a1819 = sp.adj4[v_t];
                      for (let _i1820 = 0; _i1820 < _a1819.length; _i1820++) {
                        const v_y = _a1819[_i1820];
                        const _t1821 = sp.adj4Edges[v_t][_i1820];
                        let _c1840: boolean = !((_t1821 === _wc1772 ? true : (_t1821 === _wc1770 ? true : (b.grid[_t1821] !== 0))));
                        if (_c1840) {
                          let _g1822 = 0;
                          G1823: {
                            const _a1824 = sp.adj4[v_t];
                            for (let _i1825 = 0; _i1825 < _a1824.length; _i1825++) {
                              const _t1826 = sp.adj4Edges[v_t][_i1825];
                              if (!(((_t1826 === _wc1772 ? _wd1773 : (_t1826 === _wc1770 ? _wd1771 : (b.grid[_t1826] || -1))) === 1))) continue;
                              _g1822++;
                            }
                          }
                          let _g1827 = 0;
                          G1828: {
                            for (let _i1829 = 0; _i1829 < 1; _i1829++) {
                              const v_k = v_t;
                              const _h1830 = clueAt(cl.number, v_k);
                              const _h1837 = (_h1830 + 1);
                              let _c1839: boolean = (_h1830 !== -1);
                              if (_c1839) {
                                let _c1838: boolean = (_h1788 || (_h1830 === 1));
                                if (!_c1838) {
                                  let _g1831 = 0;
                                  G1832: {
                                    const _t1833 = (_h1830 + 1);
                                    const _a1834 = cluesValued(cl.number, _t1833);
                                    for (let _i1835 = 0; _i1835 < _a1834.length; _i1835++) {
                                      const v_x = _a1834[_i1835];
                                      const _h1836 = clueAt(cl.number, v_x);
                                      if (!((_h1836 === _h1837))) continue;
                                      _g1831++;
                                    }
                                  }
                                  _c1838 = (_g1831 === 0);
                                }
                                _c1839 = _c1838;
                              }
                              if (!(_c1839)) continue;
                              _g1827++;
                            }
                          }
                          _c1840 = (_g1822 < (2 - _g1827));
                        }
                        let _c1860: boolean = _c1840;
                        if (_c1860) {
                          let _g1841 = 0;
                          G1842: {
                            const _a1844 = sp.adj4[v_y];
                            for (let _i1845 = 0; _i1845 < _a1844.length; _i1845++) {
                              const _t1846 = sp.adj4Edges[v_y][_i1845];
                              if (!(((_t1846 === _wc1772 ? _wd1773 : (_t1846 === _wc1770 ? _wd1771 : (b.grid[_t1846] || -1))) === 1))) continue;
                              _g1841++;
                            }
                          }
                          let _g1847 = 0;
                          G1848: {
                            for (let _i1849 = 0; _i1849 < 1; _i1849++) {
                              const v_k = v_y;
                              const _h1850 = clueAt(cl.number, v_k);
                              const _h1857 = (_h1850 + 1);
                              let _c1859: boolean = (_h1850 !== -1);
                              if (_c1859) {
                                let _c1858: boolean = (_h1788 || (_h1850 === 1));
                                if (!_c1858) {
                                  let _g1851 = 0;
                                  G1852: {
                                    const _t1853 = (_h1850 + 1);
                                    const _a1854 = cluesValued(cl.number, _t1853);
                                    for (let _i1855 = 0; _i1855 < _a1854.length; _i1855++) {
                                      const v_x = _a1854[_i1855];
                                      const _h1856 = clueAt(cl.number, v_x);
                                      if (!((_h1856 === _h1857))) continue;
                                      _g1851++;
                                    }
                                  }
                                  _c1858 = (_g1851 === 0);
                                }
                                _c1859 = _c1858;
                              }
                              if (!(_c1859)) continue;
                              _g1847++;
                            }
                          }
                          _c1860 = (_g1841 < (2 - _g1847));
                        }
                        let _c1943: boolean = _c1860;
                        if (_c1943) {
                          let _q1861 = true;
                          Q1862: {
                            _g1863.length = 0;
                            G1864: {
                              for (let _i1866 = 0; _i1866 < 1; _i1866++) {
                                const v_x = v_t;
                                const _h1867 = clueAt(cl.number, v_x);
                                if (!((_h1867 !== -1))) continue;
                                _g1863.push(v_x);
                              }
                            }
                            _g1868.length = 0;
                            _st1882.pass++;
                            G1869: {
                              const _a1889 = throughWhere(sp, v_t, (_te1884: number): boolean => { let _c1886: boolean = ((_te1884 === _wc1772 ? _wd1773 : (_te1884 === _wc1770 ? _wd1771 : (b.grid[_te1884] || -1))) === 1); if (_c1886) {   const _t1885 = sp.edgeEnds[2 * _te1884];   _c1886 = !((clueAt(cl.number, _t1885) !== -1)); } let _c1888: boolean = _c1886; if (_c1888) {   const _t1887 = sp.edgeEnds[2 * _te1884 + 1];   _c1888 = !((clueAt(cl.number, _t1887) !== -1)); } return _c1888; });
                              for (let _i1890 = 0; _i1890 < _a1889.length; _i1890++) {
                                const v_t_1883 = _a1889[_i1890];
                                const _h1893 = clueAt(cl.number, v_t_1883);
                                const _h1894 = (_h1893 !== -1);
                                const _h1895 = _h1894;
                                const _h1896 = !(_h1895);
                                const _a1891 = sp.adj4[v_t_1883];
                                for (let _i1892 = 0; _i1892 < _a1891.length; _i1892++) {
                                  const v_x = _a1891[_i1892];
                                  const _h1897 = clueAt(cl.number, v_x);
                                  let _c1899: boolean = (_h1896 && (_h1897 !== -1));
                                  if (_c1899) {
                                    const _t1898 = sp.adj4Edges[v_t_1883][_i1892];
                                    _c1899 = ((_t1898 === _wc1772 ? _wd1773 : (_t1898 === _wc1770 ? _wd1771 : (b.grid[_t1898] || -1))) === 1);
                                  }
                                  if (!(_c1899)) continue;
                                  const _t1900 = v_x;
                                  if (_g1868.length < 16) { if (!_g1868.includes(_t1900)) _g1868.push(_t1900); } else addOnce(_g1868, _st1882, _t1900);
                                }
                              }
                            }
                            const _a1901 = union(_g1863, _g1868);
                            for (let _i1902 = 0; _i1902 < _a1901.length; _i1902++) {
                              const v_p = _a1901[_i1902];
                              const _h1941 = clueAt(cl.number, v_p);
                              _g1903.length = 0;
                              G1904: {
                                for (let _i1906 = 0; _i1906 < 1; _i1906++) {
                                  const v_x = v_y;
                                  const _h1907 = clueAt(cl.number, v_x);
                                  if (!((_h1907 !== -1))) continue;
                                  _g1903.push(v_x);
                                }
                              }
                              _g1908.length = 0;
                              _st1921.pass++;
                              G1909: {
                                const _a1927 = throughWhere(sp, v_y, (_te1922: number): boolean => { let _c1924: boolean = ((_te1922 === _wc1772 ? _wd1773 : (_te1922 === _wc1770 ? _wd1771 : (b.grid[_te1922] || -1))) === 1); if (_c1924) {   const _t1923 = sp.edgeEnds[2 * _te1922];   _c1924 = !((clueAt(cl.number, _t1923) !== -1)); } let _c1926: boolean = _c1924; if (_c1926) {   const _t1925 = sp.edgeEnds[2 * _te1922 + 1];   _c1926 = !((clueAt(cl.number, _t1925) !== -1)); } return _c1926; });
                                for (let _i1928 = 0; _i1928 < _a1927.length; _i1928++) {
                                  const v_t = _a1927[_i1928];
                                  const _h1931 = clueAt(cl.number, v_t);
                                  const _h1932 = (_h1931 !== -1);
                                  const _h1933 = _h1932;
                                  const _h1934 = !(_h1933);
                                  const _a1929 = sp.adj4[v_t];
                                  for (let _i1930 = 0; _i1930 < _a1929.length; _i1930++) {
                                    const v_x = _a1929[_i1930];
                                    const _h1935 = clueAt(cl.number, v_x);
                                    let _c1937: boolean = (_h1934 && (_h1935 !== -1));
                                    if (_c1937) {
                                      const _t1936 = sp.adj4Edges[v_t][_i1930];
                                      _c1937 = ((_t1936 === _wc1772 ? _wd1773 : (_t1936 === _wc1770 ? _wd1771 : (b.grid[_t1936] || -1))) === 1);
                                    }
                                    if (!(_c1937)) continue;
                                    const _t1938 = v_x;
                                    if (_g1908.length < 16) { if (!_g1908.includes(_t1938)) _g1908.push(_t1938); } else addOnce(_g1908, _st1921, _t1938);
                                  }
                                }
                              }
                              const _a1939 = union(_g1903, _g1908);
                              for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
                                const v_q = _a1939[_i1940];
                                const _h1942 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h1941 - _h1942)) === cl.step))) {
                                  _q1861 = false;
                                  break Q1862;
                                }
                              }
                            }
                          }
                          _c1943 = _q1861;
                        }
                        if (!((_c1943 && (_h1788 || !(throughWhere(sp, v_t, (_te1944: number): boolean => {  return ((_te1944 === _wc1772 ? _wd1773 : (_te1944 === _wc1770 ? _wd1771 : (b.grid[_te1944] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g1945 = 0;
                        G1946: {
                          const _a1947 = sp.adj4[v_t];
                          for (let _i1948 = 0; _i1948 < _a1947.length; _i1948++) {
                            const _t1949 = sp.adj4Edges[v_t][_i1948];
                            if (!(((_t1949 === _wc1772 ? _wd1773 : (_t1949 === _wc1770 ? _wd1771 : (b.grid[_t1949] || -1))) === 1))) continue;
                            _g1945++;
                          }
                        }
                        let _g1950 = 0;
                        G1951: {
                          for (let _i1952 = 0; _i1952 < 1; _i1952++) {
                            const v_k = v_t;
                            const _h1953 = clueAt(cl.number, v_k);
                            const _h1960 = (_h1953 + 1);
                            let _c1962: boolean = (_h1953 !== -1);
                            if (_c1962) {
                              let _c1961: boolean = (_h1788 || (_h1953 === 1));
                              if (!_c1961) {
                                let _g1954 = 0;
                                G1955: {
                                  const _t1956 = (_h1953 + 1);
                                  const _a1957 = cluesValued(cl.number, _t1956);
                                  for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
                                    const v_x = _a1957[_i1958];
                                    const _h1959 = clueAt(cl.number, v_x);
                                    if (!((_h1959 === _h1960))) continue;
                                    _g1954++;
                                  }
                                }
                                _c1961 = (_g1954 === 0);
                              }
                              _c1962 = _c1961;
                            }
                            if (!(_c1962)) continue;
                            _g1950++;
                          }
                        }
                        let _c2091: boolean = ((_g1945 + 1) === (2 - _g1950));
                        if (!_c2091) {
                          let _q1963 = false;
                          Q1964: {
                            const _a1965 = sp.adj4[v_t];
                            const _n1966 = _i1820;
                            for (let _i1967 = 0; _i1967 < _n1966; _i1967++) {
                              const v_z = _a1965[_i1967];
                              const _t1968 = sp.adj4Edges[v_t][_i1967];
                              let _c1987: boolean = !((_t1968 === _wc1772 ? true : (_t1968 === _wc1770 ? true : (b.grid[_t1968] !== 0))));
                              if (_c1987) {
                                let _g1969 = 0;
                                G1970: {
                                  const _a1971 = sp.adj4[v_t];
                                  for (let _i1972 = 0; _i1972 < _a1971.length; _i1972++) {
                                    const _t1973 = sp.adj4Edges[v_t][_i1972];
                                    if (!(((_t1973 === _wc1772 ? _wd1773 : (_t1973 === _wc1770 ? _wd1771 : (b.grid[_t1973] || -1))) === 1))) continue;
                                    _g1969++;
                                  }
                                }
                                let _g1974 = 0;
                                G1975: {
                                  for (let _i1976 = 0; _i1976 < 1; _i1976++) {
                                    const v_k = v_t;
                                    const _h1977 = clueAt(cl.number, v_k);
                                    const _h1984 = (_h1977 + 1);
                                    let _c1986: boolean = (_h1977 !== -1);
                                    if (_c1986) {
                                      let _c1985: boolean = (_h1788 || (_h1977 === 1));
                                      if (!_c1985) {
                                        let _g1978 = 0;
                                        G1979: {
                                          const _t1980 = (_h1977 + 1);
                                          const _a1981 = cluesValued(cl.number, _t1980);
                                          for (let _i1982 = 0; _i1982 < _a1981.length; _i1982++) {
                                            const v_x = _a1981[_i1982];
                                            const _h1983 = clueAt(cl.number, v_x);
                                            if (!((_h1983 === _h1984))) continue;
                                            _g1978++;
                                          }
                                        }
                                        _c1985 = (_g1978 === 0);
                                      }
                                      _c1986 = _c1985;
                                    }
                                    if (!(_c1986)) continue;
                                    _g1974++;
                                  }
                                }
                                _c1987 = (_g1969 < (2 - _g1974));
                              }
                              let _c2006: boolean = _c1987;
                              if (_c2006) {
                                let _g1988 = 0;
                                G1989: {
                                  const _a1990 = sp.adj4[v_z];
                                  for (let _i1991 = 0; _i1991 < _a1990.length; _i1991++) {
                                    const _t1992 = sp.adj4Edges[v_z][_i1991];
                                    if (!(((_t1992 === _wc1772 ? _wd1773 : (_t1992 === _wc1770 ? _wd1771 : (b.grid[_t1992] || -1))) === 1))) continue;
                                    _g1988++;
                                  }
                                }
                                let _g1993 = 0;
                                G1994: {
                                  for (let _i1995 = 0; _i1995 < 1; _i1995++) {
                                    const v_k = v_z;
                                    const _h1996 = clueAt(cl.number, v_k);
                                    const _h2003 = (_h1996 + 1);
                                    let _c2005: boolean = (_h1996 !== -1);
                                    if (_c2005) {
                                      let _c2004: boolean = (_h1788 || (_h1996 === 1));
                                      if (!_c2004) {
                                        let _g1997 = 0;
                                        G1998: {
                                          const _t1999 = (_h1996 + 1);
                                          const _a2000 = cluesValued(cl.number, _t1999);
                                          for (let _i2001 = 0; _i2001 < _a2000.length; _i2001++) {
                                            const v_x = _a2000[_i2001];
                                            const _h2002 = clueAt(cl.number, v_x);
                                            if (!((_h2002 === _h2003))) continue;
                                            _g1997++;
                                          }
                                        }
                                        _c2004 = (_g1997 === 0);
                                      }
                                      _c2005 = _c2004;
                                    }
                                    if (!(_c2005)) continue;
                                    _g1993++;
                                  }
                                }
                                _c2006 = (_g1988 < (2 - _g1993));
                              }
                              let _c2089: boolean = _c2006;
                              if (_c2089) {
                                let _q2007 = true;
                                Q2008: {
                                  _g2009.length = 0;
                                  G2010: {
                                    for (let _i2012 = 0; _i2012 < 1; _i2012++) {
                                      const v_x = v_t;
                                      const _h2013 = clueAt(cl.number, v_x);
                                      if (!((_h2013 !== -1))) continue;
                                      _g2009.push(v_x);
                                    }
                                  }
                                  _g2014.length = 0;
                                  _st2028.pass++;
                                  G2015: {
                                    const _a2035 = throughWhere(sp, v_t, (_te2030: number): boolean => { let _c2032: boolean = ((_te2030 === _wc1772 ? _wd1773 : (_te2030 === _wc1770 ? _wd1771 : (b.grid[_te2030] || -1))) === 1); if (_c2032) {   const _t2031 = sp.edgeEnds[2 * _te2030];   _c2032 = !((clueAt(cl.number, _t2031) !== -1)); } let _c2034: boolean = _c2032; if (_c2034) {   const _t2033 = sp.edgeEnds[2 * _te2030 + 1];   _c2034 = !((clueAt(cl.number, _t2033) !== -1)); } return _c2034; });
                                    for (let _i2036 = 0; _i2036 < _a2035.length; _i2036++) {
                                      const v_t_2029 = _a2035[_i2036];
                                      const _h2039 = clueAt(cl.number, v_t_2029);
                                      const _h2040 = (_h2039 !== -1);
                                      const _h2041 = _h2040;
                                      const _h2042 = !(_h2041);
                                      const _a2037 = sp.adj4[v_t_2029];
                                      for (let _i2038 = 0; _i2038 < _a2037.length; _i2038++) {
                                        const v_x = _a2037[_i2038];
                                        const _h2043 = clueAt(cl.number, v_x);
                                        let _c2045: boolean = (_h2042 && (_h2043 !== -1));
                                        if (_c2045) {
                                          const _t2044 = sp.adj4Edges[v_t_2029][_i2038];
                                          _c2045 = ((_t2044 === _wc1772 ? _wd1773 : (_t2044 === _wc1770 ? _wd1771 : (b.grid[_t2044] || -1))) === 1);
                                        }
                                        if (!(_c2045)) continue;
                                        const _t2046 = v_x;
                                        if (_g2014.length < 16) { if (!_g2014.includes(_t2046)) _g2014.push(_t2046); } else addOnce(_g2014, _st2028, _t2046);
                                      }
                                    }
                                  }
                                  const _a2047 = union(_g2009, _g2014);
                                  for (let _i2048 = 0; _i2048 < _a2047.length; _i2048++) {
                                    const v_p = _a2047[_i2048];
                                    const _h2087 = clueAt(cl.number, v_p);
                                    _g2049.length = 0;
                                    G2050: {
                                      for (let _i2052 = 0; _i2052 < 1; _i2052++) {
                                        const v_x = v_z;
                                        const _h2053 = clueAt(cl.number, v_x);
                                        if (!((_h2053 !== -1))) continue;
                                        _g2049.push(v_x);
                                      }
                                    }
                                    _g2054.length = 0;
                                    _st2067.pass++;
                                    G2055: {
                                      const _a2073 = throughWhere(sp, v_z, (_te2068: number): boolean => { let _c2070: boolean = ((_te2068 === _wc1772 ? _wd1773 : (_te2068 === _wc1770 ? _wd1771 : (b.grid[_te2068] || -1))) === 1); if (_c2070) {   const _t2069 = sp.edgeEnds[2 * _te2068];   _c2070 = !((clueAt(cl.number, _t2069) !== -1)); } let _c2072: boolean = _c2070; if (_c2072) {   const _t2071 = sp.edgeEnds[2 * _te2068 + 1];   _c2072 = !((clueAt(cl.number, _t2071) !== -1)); } return _c2072; });
                                      for (let _i2074 = 0; _i2074 < _a2073.length; _i2074++) {
                                        const v_t = _a2073[_i2074];
                                        const _h2077 = clueAt(cl.number, v_t);
                                        const _h2078 = (_h2077 !== -1);
                                        const _h2079 = _h2078;
                                        const _h2080 = !(_h2079);
                                        const _a2075 = sp.adj4[v_t];
                                        for (let _i2076 = 0; _i2076 < _a2075.length; _i2076++) {
                                          const v_x = _a2075[_i2076];
                                          const _h2081 = clueAt(cl.number, v_x);
                                          let _c2083: boolean = (_h2080 && (_h2081 !== -1));
                                          if (_c2083) {
                                            const _t2082 = sp.adj4Edges[v_t][_i2076];
                                            _c2083 = ((_t2082 === _wc1772 ? _wd1773 : (_t2082 === _wc1770 ? _wd1771 : (b.grid[_t2082] || -1))) === 1);
                                          }
                                          if (!(_c2083)) continue;
                                          const _t2084 = v_x;
                                          if (_g2054.length < 16) { if (!_g2054.includes(_t2084)) _g2054.push(_t2084); } else addOnce(_g2054, _st2067, _t2084);
                                        }
                                      }
                                    }
                                    const _a2085 = union(_g2049, _g2054);
                                    for (let _i2086 = 0; _i2086 < _a2085.length; _i2086++) {
                                      const v_q = _a2085[_i2086];
                                      const _h2088 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2087 - _h2088)) === cl.step))) {
                                        _q2007 = false;
                                        break Q2008;
                                      }
                                    }
                                  }
                                }
                                _c2089 = _q2007;
                              }
                              if ((_c2089 && (_h1788 || !(throughWhere(sp, v_t, (_te2090: number): boolean => {  return ((_te2090 === _wc1772 ? _wd1773 : (_te2090 === _wc1770 ? _wd1771 : (b.grid[_te2090] || -1))) === 1); }).includes(v_z))))) {
                                _q1963 = true;
                                break Q1964;
                              }
                            }
                          }
                          _c2091 = _q1963;
                        }
                        if (_c2091) {
                          _q1817 = true;
                          break Q1818;
                        }
                      }
                    }
                    _c2092 = !(_q1817);
                  }
                  let _c2387: boolean = _c2092;
                  if (!_c2387) {
                    let _q2093 = false;
                    Q2094: {
                      const _a2095 = sp.adj4[v_t];
                      for (let _i2096 = 0; _i2096 < _a2095.length; _i2096++) {
                        const v_s = _a2095[_i2096];
                        let _g2097 = 0;
                        G2098: {
                          const _a2099 = sp.adj4[v_s];
                          for (let _i2100 = 0; _i2100 < _a2099.length; _i2100++) {
                            const _t2101 = sp.adj4Edges[v_s][_i2100];
                            if (!(((_t2101 === _wc1772 ? _wd1773 : (_t2101 === _wc1770 ? _wd1771 : (b.grid[_t2101] || -1))) === 1))) continue;
                            _g2097++;
                          }
                        }
                        let _g2102 = 0;
                        G2103: {
                          for (let _i2104 = 0; _i2104 < 1; _i2104++) {
                            const v_k = v_s;
                            const _h2105 = clueAt(cl.number, v_k);
                            const _h2112 = (_h2105 + 1);
                            let _c2114: boolean = (_h2105 !== -1);
                            if (_c2114) {
                              let _c2113: boolean = (_h1788 || (_h2105 === 1));
                              if (!_c2113) {
                                let _g2106 = 0;
                                G2107: {
                                  const _t2108 = (_h2105 + 1);
                                  const _a2109 = cluesValued(cl.number, _t2108);
                                  for (let _i2110 = 0; _i2110 < _a2109.length; _i2110++) {
                                    const v_x = _a2109[_i2110];
                                    const _h2111 = clueAt(cl.number, v_x);
                                    if (!((_h2111 === _h2112))) continue;
                                    _g2106++;
                                  }
                                }
                                _c2113 = (_g2106 === 0);
                              }
                              _c2114 = _c2113;
                            }
                            if (!(_c2114)) continue;
                            _g2102++;
                          }
                        }
                        let _c2386: boolean = (_g2097 < (2 - _g2102));
                        if (_c2386) {
                          let _q2115 = false;
                          Q2116: {
                            const _a2117 = sp.adj4[v_s];
                            for (let _i2118 = 0; _i2118 < _a2117.length; _i2118++) {
                              const v_y = _a2117[_i2118];
                              const _t2119 = sp.adj4Edges[v_s][_i2118];
                              let _c2138: boolean = !((_t2119 === _wc1772 ? true : (_t2119 === _wc1770 ? true : (b.grid[_t2119] !== 0))));
                              if (_c2138) {
                                let _g2120 = 0;
                                G2121: {
                                  const _a2122 = sp.adj4[v_s];
                                  for (let _i2123 = 0; _i2123 < _a2122.length; _i2123++) {
                                    const _t2124 = sp.adj4Edges[v_s][_i2123];
                                    if (!(((_t2124 === _wc1772 ? _wd1773 : (_t2124 === _wc1770 ? _wd1771 : (b.grid[_t2124] || -1))) === 1))) continue;
                                    _g2120++;
                                  }
                                }
                                let _g2125 = 0;
                                G2126: {
                                  for (let _i2127 = 0; _i2127 < 1; _i2127++) {
                                    const v_k = v_s;
                                    const _h2128 = clueAt(cl.number, v_k);
                                    const _h2135 = (_h2128 + 1);
                                    let _c2137: boolean = (_h2128 !== -1);
                                    if (_c2137) {
                                      let _c2136: boolean = (_h1788 || (_h2128 === 1));
                                      if (!_c2136) {
                                        let _g2129 = 0;
                                        G2130: {
                                          const _t2131 = (_h2128 + 1);
                                          const _a2132 = cluesValued(cl.number, _t2131);
                                          for (let _i2133 = 0; _i2133 < _a2132.length; _i2133++) {
                                            const v_x = _a2132[_i2133];
                                            const _h2134 = clueAt(cl.number, v_x);
                                            if (!((_h2134 === _h2135))) continue;
                                            _g2129++;
                                          }
                                        }
                                        _c2136 = (_g2129 === 0);
                                      }
                                      _c2137 = _c2136;
                                    }
                                    if (!(_c2137)) continue;
                                    _g2125++;
                                  }
                                }
                                _c2138 = (_g2120 < (2 - _g2125));
                              }
                              let _c2158: boolean = _c2138;
                              if (_c2158) {
                                let _g2139 = 0;
                                G2140: {
                                  const _a2142 = sp.adj4[v_y];
                                  for (let _i2143 = 0; _i2143 < _a2142.length; _i2143++) {
                                    const _t2144 = sp.adj4Edges[v_y][_i2143];
                                    if (!(((_t2144 === _wc1772 ? _wd1773 : (_t2144 === _wc1770 ? _wd1771 : (b.grid[_t2144] || -1))) === 1))) continue;
                                    _g2139++;
                                  }
                                }
                                let _g2145 = 0;
                                G2146: {
                                  for (let _i2147 = 0; _i2147 < 1; _i2147++) {
                                    const v_k = v_y;
                                    const _h2148 = clueAt(cl.number, v_k);
                                    const _h2155 = (_h2148 + 1);
                                    let _c2157: boolean = (_h2148 !== -1);
                                    if (_c2157) {
                                      let _c2156: boolean = (_h1788 || (_h2148 === 1));
                                      if (!_c2156) {
                                        let _g2149 = 0;
                                        G2150: {
                                          const _t2151 = (_h2148 + 1);
                                          const _a2152 = cluesValued(cl.number, _t2151);
                                          for (let _i2153 = 0; _i2153 < _a2152.length; _i2153++) {
                                            const v_x = _a2152[_i2153];
                                            const _h2154 = clueAt(cl.number, v_x);
                                            if (!((_h2154 === _h2155))) continue;
                                            _g2149++;
                                          }
                                        }
                                        _c2156 = (_g2149 === 0);
                                      }
                                      _c2157 = _c2156;
                                    }
                                    if (!(_c2157)) continue;
                                    _g2145++;
                                  }
                                }
                                _c2158 = (_g2139 < (2 - _g2145));
                              }
                              let _c2239: boolean = _c2158;
                              if (_c2239) {
                                let _q2159 = true;
                                Q2160: {
                                  _g2161.length = 0;
                                  G2162: {
                                    for (let _i2164 = 0; _i2164 < 1; _i2164++) {
                                      const v_x = v_s;
                                      const _h2165 = clueAt(cl.number, v_x);
                                      if (!((_h2165 !== -1))) continue;
                                      _g2161.push(v_x);
                                    }
                                  }
                                  _g2166.length = 0;
                                  _st2179.pass++;
                                  G2167: {
                                    const _a2185 = throughWhere(sp, v_s, (_te2180: number): boolean => { let _c2182: boolean = ((_te2180 === _wc1772 ? _wd1773 : (_te2180 === _wc1770 ? _wd1771 : (b.grid[_te2180] || -1))) === 1); if (_c2182) {   const _t2181 = sp.edgeEnds[2 * _te2180];   _c2182 = !((clueAt(cl.number, _t2181) !== -1)); } let _c2184: boolean = _c2182; if (_c2184) {   const _t2183 = sp.edgeEnds[2 * _te2180 + 1];   _c2184 = !((clueAt(cl.number, _t2183) !== -1)); } return _c2184; });
                                    for (let _i2186 = 0; _i2186 < _a2185.length; _i2186++) {
                                      const v_t = _a2185[_i2186];
                                      const _h2189 = clueAt(cl.number, v_t);
                                      const _h2190 = (_h2189 !== -1);
                                      const _h2191 = _h2190;
                                      const _h2192 = !(_h2191);
                                      const _a2187 = sp.adj4[v_t];
                                      for (let _i2188 = 0; _i2188 < _a2187.length; _i2188++) {
                                        const v_x = _a2187[_i2188];
                                        const _h2193 = clueAt(cl.number, v_x);
                                        let _c2195: boolean = (_h2192 && (_h2193 !== -1));
                                        if (_c2195) {
                                          const _t2194 = sp.adj4Edges[v_t][_i2188];
                                          _c2195 = ((_t2194 === _wc1772 ? _wd1773 : (_t2194 === _wc1770 ? _wd1771 : (b.grid[_t2194] || -1))) === 1);
                                        }
                                        if (!(_c2195)) continue;
                                        const _t2196 = v_x;
                                        if (_g2166.length < 16) { if (!_g2166.includes(_t2196)) _g2166.push(_t2196); } else addOnce(_g2166, _st2179, _t2196);
                                      }
                                    }
                                  }
                                  const _a2197 = union(_g2161, _g2166);
                                  for (let _i2198 = 0; _i2198 < _a2197.length; _i2198++) {
                                    const v_p = _a2197[_i2198];
                                    const _h2237 = clueAt(cl.number, v_p);
                                    _g2199.length = 0;
                                    G2200: {
                                      for (let _i2202 = 0; _i2202 < 1; _i2202++) {
                                        const v_x = v_y;
                                        const _h2203 = clueAt(cl.number, v_x);
                                        if (!((_h2203 !== -1))) continue;
                                        _g2199.push(v_x);
                                      }
                                    }
                                    _g2204.length = 0;
                                    _st2217.pass++;
                                    G2205: {
                                      const _a2223 = throughWhere(sp, v_y, (_te2218: number): boolean => { let _c2220: boolean = ((_te2218 === _wc1772 ? _wd1773 : (_te2218 === _wc1770 ? _wd1771 : (b.grid[_te2218] || -1))) === 1); if (_c2220) {   const _t2219 = sp.edgeEnds[2 * _te2218];   _c2220 = !((clueAt(cl.number, _t2219) !== -1)); } let _c2222: boolean = _c2220; if (_c2222) {   const _t2221 = sp.edgeEnds[2 * _te2218 + 1];   _c2222 = !((clueAt(cl.number, _t2221) !== -1)); } return _c2222; });
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
                                            _c2233 = ((_t2232 === _wc1772 ? _wd1773 : (_t2232 === _wc1770 ? _wd1771 : (b.grid[_t2232] || -1))) === 1);
                                          }
                                          if (!(_c2233)) continue;
                                          const _t2234 = v_x;
                                          if (_g2204.length < 16) { if (!_g2204.includes(_t2234)) _g2204.push(_t2234); } else addOnce(_g2204, _st2217, _t2234);
                                        }
                                      }
                                    }
                                    const _a2235 = union(_g2199, _g2204);
                                    for (let _i2236 = 0; _i2236 < _a2235.length; _i2236++) {
                                      const v_q = _a2235[_i2236];
                                      const _h2238 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2237 - _h2238)) === cl.step))) {
                                        _q2159 = false;
                                        break Q2160;
                                      }
                                    }
                                  }
                                }
                                _c2239 = _q2159;
                              }
                              if (!((_c2239 && (_h1788 || !(throughWhere(sp, v_s, (_te2240: number): boolean => {  return ((_te2240 === _wc1772 ? _wd1773 : (_te2240 === _wc1770 ? _wd1771 : (b.grid[_te2240] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g2241 = 0;
                              G2242: {
                                const _a2243 = sp.adj4[v_s];
                                for (let _i2244 = 0; _i2244 < _a2243.length; _i2244++) {
                                  const _t2245 = sp.adj4Edges[v_s][_i2244];
                                  if (!(((_t2245 === _wc1772 ? _wd1773 : (_t2245 === _wc1770 ? _wd1771 : (b.grid[_t2245] || -1))) === 1))) continue;
                                  _g2241++;
                                }
                              }
                              let _g2246 = 0;
                              G2247: {
                                for (let _i2248 = 0; _i2248 < 1; _i2248++) {
                                  const v_k = v_s;
                                  const _h2249 = clueAt(cl.number, v_k);
                                  const _h2256 = (_h2249 + 1);
                                  let _c2258: boolean = (_h2249 !== -1);
                                  if (_c2258) {
                                    let _c2257: boolean = (_h1788 || (_h2249 === 1));
                                    if (!_c2257) {
                                      let _g2250 = 0;
                                      G2251: {
                                        const _t2252 = (_h2249 + 1);
                                        const _a2253 = cluesValued(cl.number, _t2252);
                                        for (let _i2254 = 0; _i2254 < _a2253.length; _i2254++) {
                                          const v_x = _a2253[_i2254];
                                          const _h2255 = clueAt(cl.number, v_x);
                                          if (!((_h2255 === _h2256))) continue;
                                          _g2250++;
                                        }
                                      }
                                      _c2257 = (_g2250 === 0);
                                    }
                                    _c2258 = _c2257;
                                  }
                                  if (!(_c2258)) continue;
                                  _g2246++;
                                }
                              }
                              let _c2385: boolean = ((_g2241 + 1) === (2 - _g2246));
                              if (!_c2385) {
                                let _q2259 = false;
                                Q2260: {
                                  const _a2261 = sp.adj4[v_s];
                                  const _n2262 = _i2118;
                                  for (let _i2263 = 0; _i2263 < _n2262; _i2263++) {
                                    const v_z = _a2261[_i2263];
                                    const _t2264 = sp.adj4Edges[v_s][_i2263];
                                    let _c2283: boolean = !((_t2264 === _wc1772 ? true : (_t2264 === _wc1770 ? true : (b.grid[_t2264] !== 0))));
                                    if (_c2283) {
                                      let _g2265 = 0;
                                      G2266: {
                                        const _a2267 = sp.adj4[v_s];
                                        for (let _i2268 = 0; _i2268 < _a2267.length; _i2268++) {
                                          const _t2269 = sp.adj4Edges[v_s][_i2268];
                                          if (!(((_t2269 === _wc1772 ? _wd1773 : (_t2269 === _wc1770 ? _wd1771 : (b.grid[_t2269] || -1))) === 1))) continue;
                                          _g2265++;
                                        }
                                      }
                                      let _g2270 = 0;
                                      G2271: {
                                        for (let _i2272 = 0; _i2272 < 1; _i2272++) {
                                          const v_k = v_s;
                                          const _h2273 = clueAt(cl.number, v_k);
                                          const _h2280 = (_h2273 + 1);
                                          let _c2282: boolean = (_h2273 !== -1);
                                          if (_c2282) {
                                            let _c2281: boolean = (_h1788 || (_h2273 === 1));
                                            if (!_c2281) {
                                              let _g2274 = 0;
                                              G2275: {
                                                const _t2276 = (_h2273 + 1);
                                                const _a2277 = cluesValued(cl.number, _t2276);
                                                for (let _i2278 = 0; _i2278 < _a2277.length; _i2278++) {
                                                  const v_x = _a2277[_i2278];
                                                  const _h2279 = clueAt(cl.number, v_x);
                                                  if (!((_h2279 === _h2280))) continue;
                                                  _g2274++;
                                                }
                                              }
                                              _c2281 = (_g2274 === 0);
                                            }
                                            _c2282 = _c2281;
                                          }
                                          if (!(_c2282)) continue;
                                          _g2270++;
                                        }
                                      }
                                      _c2283 = (_g2265 < (2 - _g2270));
                                    }
                                    let _c2302: boolean = _c2283;
                                    if (_c2302) {
                                      let _g2284 = 0;
                                      G2285: {
                                        const _a2286 = sp.adj4[v_z];
                                        for (let _i2287 = 0; _i2287 < _a2286.length; _i2287++) {
                                          const _t2288 = sp.adj4Edges[v_z][_i2287];
                                          if (!(((_t2288 === _wc1772 ? _wd1773 : (_t2288 === _wc1770 ? _wd1771 : (b.grid[_t2288] || -1))) === 1))) continue;
                                          _g2284++;
                                        }
                                      }
                                      let _g2289 = 0;
                                      G2290: {
                                        for (let _i2291 = 0; _i2291 < 1; _i2291++) {
                                          const v_k = v_z;
                                          const _h2292 = clueAt(cl.number, v_k);
                                          const _h2299 = (_h2292 + 1);
                                          let _c2301: boolean = (_h2292 !== -1);
                                          if (_c2301) {
                                            let _c2300: boolean = (_h1788 || (_h2292 === 1));
                                            if (!_c2300) {
                                              let _g2293 = 0;
                                              G2294: {
                                                const _t2295 = (_h2292 + 1);
                                                const _a2296 = cluesValued(cl.number, _t2295);
                                                for (let _i2297 = 0; _i2297 < _a2296.length; _i2297++) {
                                                  const v_x = _a2296[_i2297];
                                                  const _h2298 = clueAt(cl.number, v_x);
                                                  if (!((_h2298 === _h2299))) continue;
                                                  _g2293++;
                                                }
                                              }
                                              _c2300 = (_g2293 === 0);
                                            }
                                            _c2301 = _c2300;
                                          }
                                          if (!(_c2301)) continue;
                                          _g2289++;
                                        }
                                      }
                                      _c2302 = (_g2284 < (2 - _g2289));
                                    }
                                    let _c2383: boolean = _c2302;
                                    if (_c2383) {
                                      let _q2303 = true;
                                      Q2304: {
                                        _g2305.length = 0;
                                        G2306: {
                                          for (let _i2308 = 0; _i2308 < 1; _i2308++) {
                                            const v_x = v_s;
                                            const _h2309 = clueAt(cl.number, v_x);
                                            if (!((_h2309 !== -1))) continue;
                                            _g2305.push(v_x);
                                          }
                                        }
                                        _g2310.length = 0;
                                        _st2323.pass++;
                                        G2311: {
                                          const _a2329 = throughWhere(sp, v_s, (_te2324: number): boolean => { let _c2326: boolean = ((_te2324 === _wc1772 ? _wd1773 : (_te2324 === _wc1770 ? _wd1771 : (b.grid[_te2324] || -1))) === 1); if (_c2326) {   const _t2325 = sp.edgeEnds[2 * _te2324];   _c2326 = !((clueAt(cl.number, _t2325) !== -1)); } let _c2328: boolean = _c2326; if (_c2328) {   const _t2327 = sp.edgeEnds[2 * _te2324 + 1];   _c2328 = !((clueAt(cl.number, _t2327) !== -1)); } return _c2328; });
                                          for (let _i2330 = 0; _i2330 < _a2329.length; _i2330++) {
                                            const v_t = _a2329[_i2330];
                                            const _h2333 = clueAt(cl.number, v_t);
                                            const _h2334 = (_h2333 !== -1);
                                            const _h2335 = _h2334;
                                            const _h2336 = !(_h2335);
                                            const _a2331 = sp.adj4[v_t];
                                            for (let _i2332 = 0; _i2332 < _a2331.length; _i2332++) {
                                              const v_x = _a2331[_i2332];
                                              const _h2337 = clueAt(cl.number, v_x);
                                              let _c2339: boolean = (_h2336 && (_h2337 !== -1));
                                              if (_c2339) {
                                                const _t2338 = sp.adj4Edges[v_t][_i2332];
                                                _c2339 = ((_t2338 === _wc1772 ? _wd1773 : (_t2338 === _wc1770 ? _wd1771 : (b.grid[_t2338] || -1))) === 1);
                                              }
                                              if (!(_c2339)) continue;
                                              const _t2340 = v_x;
                                              if (_g2310.length < 16) { if (!_g2310.includes(_t2340)) _g2310.push(_t2340); } else addOnce(_g2310, _st2323, _t2340);
                                            }
                                          }
                                        }
                                        const _a2341 = union(_g2305, _g2310);
                                        for (let _i2342 = 0; _i2342 < _a2341.length; _i2342++) {
                                          const v_p = _a2341[_i2342];
                                          const _h2381 = clueAt(cl.number, v_p);
                                          _g2343.length = 0;
                                          G2344: {
                                            for (let _i2346 = 0; _i2346 < 1; _i2346++) {
                                              const v_x = v_z;
                                              const _h2347 = clueAt(cl.number, v_x);
                                              if (!((_h2347 !== -1))) continue;
                                              _g2343.push(v_x);
                                            }
                                          }
                                          _g2348.length = 0;
                                          _st2361.pass++;
                                          G2349: {
                                            const _a2367 = throughWhere(sp, v_z, (_te2362: number): boolean => { let _c2364: boolean = ((_te2362 === _wc1772 ? _wd1773 : (_te2362 === _wc1770 ? _wd1771 : (b.grid[_te2362] || -1))) === 1); if (_c2364) {   const _t2363 = sp.edgeEnds[2 * _te2362];   _c2364 = !((clueAt(cl.number, _t2363) !== -1)); } let _c2366: boolean = _c2364; if (_c2366) {   const _t2365 = sp.edgeEnds[2 * _te2362 + 1];   _c2366 = !((clueAt(cl.number, _t2365) !== -1)); } return _c2366; });
                                            for (let _i2368 = 0; _i2368 < _a2367.length; _i2368++) {
                                              const v_t = _a2367[_i2368];
                                              const _h2371 = clueAt(cl.number, v_t);
                                              const _h2372 = (_h2371 !== -1);
                                              const _h2373 = _h2372;
                                              const _h2374 = !(_h2373);
                                              const _a2369 = sp.adj4[v_t];
                                              for (let _i2370 = 0; _i2370 < _a2369.length; _i2370++) {
                                                const v_x = _a2369[_i2370];
                                                const _h2375 = clueAt(cl.number, v_x);
                                                let _c2377: boolean = (_h2374 && (_h2375 !== -1));
                                                if (_c2377) {
                                                  const _t2376 = sp.adj4Edges[v_t][_i2370];
                                                  _c2377 = ((_t2376 === _wc1772 ? _wd1773 : (_t2376 === _wc1770 ? _wd1771 : (b.grid[_t2376] || -1))) === 1);
                                                }
                                                if (!(_c2377)) continue;
                                                const _t2378 = v_x;
                                                if (_g2348.length < 16) { if (!_g2348.includes(_t2378)) _g2348.push(_t2378); } else addOnce(_g2348, _st2361, _t2378);
                                              }
                                            }
                                          }
                                          const _a2379 = union(_g2343, _g2348);
                                          for (let _i2380 = 0; _i2380 < _a2379.length; _i2380++) {
                                            const v_q = _a2379[_i2380];
                                            const _h2382 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h2381 - _h2382)) === cl.step))) {
                                              _q2303 = false;
                                              break Q2304;
                                            }
                                          }
                                        }
                                      }
                                      _c2383 = _q2303;
                                    }
                                    if ((_c2383 && (_h1788 || !(throughWhere(sp, v_s, (_te2384: number): boolean => {  return ((_te2384 === _wc1772 ? _wd1773 : (_te2384 === _wc1770 ? _wd1771 : (b.grid[_te2384] || -1))) === 1); }).includes(v_z))))) {
                                      _q2259 = true;
                                      break Q2260;
                                    }
                                  }
                                }
                                _c2385 = _q2259;
                              }
                              if (_c2385) {
                                _q2115 = true;
                                break Q2116;
                              }
                            }
                          }
                          _c2386 = !(_q2115);
                        }
                        if (_c2386) {
                          _q2093 = true;
                          break Q2094;
                        }
                      }
                    }
                    _c2387 = _q2093;
                  }
                  if (_c2387) {
                    _q1774 = true;
                    break Q1775;
                  }
                }
              }
              _c2388 = _q1774;
            }
            _c2389 = _c2388;
          }
          if (!(_c2389)) break L1764;
          facts.length = 0;
          changed = false;
          const _t2390 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t2390] !== 0)) { if (fire === null) { b.placeAt(_t2390, 1); changed = true; } else facts.push(PLACE, _t2390, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, U: v_U.slice(), k: v_k, I: v_I.slice(), i: v_i, j: v_j }, facts)) return 1;
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

const weighedFacts: number[] = [];
let weighedCands = new Int32Array(0);
const _st5020 = stamps();
const _st5144 = stamps();
const _st5183 = stamps();
const _st5290 = stamps();
const _st5329 = stamps();
const _st5441 = stamps();
const _st5479 = stamps();
const _st5585 = stamps();
const _st5623 = stamps();
const _st6169 = stamps();
const _st6288 = stamps();
const _st6327 = stamps();
const _st6434 = stamps();
const _st6473 = stamps();
const _st6585 = stamps();
const _st6623 = stamps();
const _st6729 = stamps();
const _st6767 = stamps();

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g4505: number[] = [];
  const _g5125: number[] = [];
  const _g5130: number[] = [];
  const _g5165: number[] = [];
  const _g5170: number[] = [];
  const _g5271: number[] = [];
  const _g5276: number[] = [];
  const _g5311: number[] = [];
  const _g5316: number[] = [];
  const _g5423: number[] = [];
  const _g5428: number[] = [];
  const _g5461: number[] = [];
  const _g5466: number[] = [];
  const _g5567: number[] = [];
  const _g5572: number[] = [];
  const _g5605: number[] = [];
  const _g5610: number[] = [];
  const _g5653: number[] = [];
  const _g6269: number[] = [];
  const _g6274: number[] = [];
  const _g6309: number[] = [];
  const _g6314: number[] = [];
  const _g6415: number[] = [];
  const _g6420: number[] = [];
  const _g6455: number[] = [];
  const _g6460: number[] = [];
  const _g6567: number[] = [];
  const _g6572: number[] = [];
  const _g6605: number[] = [];
  const _g6610: number[] = [];
  const _g6711: number[] = [];
  const _g6716: number[] = [];
  const _g6749: number[] = [];
  const _g6754: number[] = [];
  const _g6800: number[] = [];
  const _g6822: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _k4498 = takesKept.board(cl);
  const _h5050 = (cl.step === 0);
  if (weighedCands.length < sp.edges.length) weighedCands = new Int32Array(sp.edges.length);
  const cands = weighedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a4496 = sp.cells;
  for (let _i4497 = 0; _i4497 < _a4496.length; _i4497++) {
    const v_c = _a4496[_i4497];
    let _g4499 = 0;
    G4500: {
      const _a4501 = sp.adj4[v_c];
      for (let _i4502 = 0; _i4502 < _a4501.length; _i4502++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i4502]] || -1) === 1))) continue;
        _g4499++;
      }
    }
    if (!((((_k4498[v_c] ?? takes(sp, cl, v_c)) - _g4499) === 2))) continue;
    const _h5027 = clueAt(cl.number, v_c);
    const _h5028 = (_h5027 !== -1);
    const _h5029 = _h5028;
    const _h5030 = !(_h5029);
    L4503: {
      const v_U = ways(b, sp, cl, v_c);
      const _h4504 = v_U.length;
      if (!((_h4504 === 4))) break L4503;
      const _h6796 = (v_U[0] ?? -1);
      _g4505.length = 0;
      _st5020.pass++;
      G4506: {
        const _a5021 = v_U;
        for (let _i5022 = 0; _i5022 < _a5021.length; _i5022++) {
          const v_i = _a5021[_i5022];
          const _h5025 = _i5022;
          const _h5026 = (_h5025 === 0);
          const _h5031 = sp.edgeOf(v_c, v_i);
          const _a5023 = v_U;
          for (let _i5024 = 0; _i5024 < _a5023.length; _i5024++) {
            const v_j = _a5023[_i5024];
            let _c5651: boolean = (_h5026 && (_i5024 > 0));
            if (_c5651) {
              let _c5650: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h5030 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c5650) {
                const _wc5032 = _h5031;
                const _wd5033 = 1;
                const _wc5034 = sp.edgeOf(v_c, v_j);
                const _wd5035 = 1;
                let _q5036 = false;
                Q5037: {
                  const _a5039 = throughWhere(sp, v_c, (_te5038: number): boolean => {  return ((_te5038 === _wc5034 ? _wd5035 : (_te5038 === _wc5032 ? _wd5033 : (b.grid[_te5038] || -1))) === 1); });
                  for (let _i5040 = 0; _i5040 < _a5039.length; _i5040++) {
                    const v_t = _a5039[_i5040];
                    let _c5060: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5060) {
                      let _g5041 = 0;
                      G5042: {
                        const _a5043 = sp.adj4[v_t];
                        for (let _i5044 = 0; _i5044 < _a5043.length; _i5044++) {
                          const _t5045 = sp.adj4Edges[v_t][_i5044];
                          if (!(((_t5045 === _wc5034 ? _wd5035 : (_t5045 === _wc5032 ? _wd5033 : (b.grid[_t5045] || -1))) === 1))) continue;
                          _g5041++;
                        }
                      }
                      let _g5046 = 0;
                      G5047: {
                        for (let _i5048 = 0; _i5048 < 1; _i5048++) {
                          const v_k = v_t;
                          const _h5049 = clueAt(cl.number, v_k);
                          const _h5057 = (_h5049 + 1);
                          let _c5059: boolean = (_h5049 !== -1);
                          if (_c5059) {
                            let _c5058: boolean = (_h5050 || (_h5049 === 1));
                            if (!_c5058) {
                              let _g5051 = 0;
                              G5052: {
                                const _t5053 = (_h5049 + 1);
                                const _a5054 = cluesValued(cl.number, _t5053);
                                for (let _i5055 = 0; _i5055 < _a5054.length; _i5055++) {
                                  const v_x = _a5054[_i5055];
                                  const _h5056 = clueAt(cl.number, v_x);
                                  if (!((_h5056 === _h5057))) continue;
                                  _g5051++;
                                }
                              }
                              _c5058 = (_g5051 === 0);
                            }
                            _c5059 = _c5058;
                          }
                          if (!(_c5059)) continue;
                          _g5046++;
                        }
                      }
                      _c5060 = (_g5041 < (2 - _g5046));
                    }
                    if (!(_c5060)) continue;
                    let _g5061 = 0;
                    G5062: {
                      const _a5063 = sp.adj4[v_t];
                      for (let _i5064 = 0; _i5064 < _a5063.length; _i5064++) {
                        const _t5065 = sp.adj4Edges[v_t][_i5064];
                        if (!(((_t5065 === _wc5034 ? _wd5035 : (_t5065 === _wc5032 ? _wd5033 : (b.grid[_t5065] || -1))) === 1))) continue;
                        _g5061++;
                      }
                    }
                    let _g5066 = 0;
                    G5067: {
                      for (let _i5068 = 0; _i5068 < 1; _i5068++) {
                        const v_k = v_t;
                        const _h5069 = clueAt(cl.number, v_k);
                        const _h5076 = (_h5069 + 1);
                        let _c5078: boolean = (_h5069 !== -1);
                        if (_c5078) {
                          let _c5077: boolean = (_h5050 || (_h5069 === 1));
                          if (!_c5077) {
                            let _g5070 = 0;
                            G5071: {
                              const _t5072 = (_h5069 + 1);
                              const _a5073 = cluesValued(cl.number, _t5072);
                              for (let _i5074 = 0; _i5074 < _a5073.length; _i5074++) {
                                const v_x = _a5073[_i5074];
                                const _h5075 = clueAt(cl.number, v_x);
                                if (!((_h5075 === _h5076))) continue;
                                _g5070++;
                              }
                            }
                            _c5077 = (_g5070 === 0);
                          }
                          _c5078 = _c5077;
                        }
                        if (!(_c5078)) continue;
                        _g5066++;
                      }
                    }
                    let _c5354: boolean = (_g5061 < (2 - _g5066));
                    if (_c5354) {
                      let _q5079 = false;
                      Q5080: {
                        const _a5081 = sp.adj4[v_t];
                        for (let _i5082 = 0; _i5082 < _a5081.length; _i5082++) {
                          const v_y = _a5081[_i5082];
                          const _t5083 = sp.adj4Edges[v_t][_i5082];
                          let _c5102: boolean = !((_t5083 === _wc5034 ? true : (_t5083 === _wc5032 ? true : (b.grid[_t5083] !== 0))));
                          if (_c5102) {
                            let _g5084 = 0;
                            G5085: {
                              const _a5086 = sp.adj4[v_t];
                              for (let _i5087 = 0; _i5087 < _a5086.length; _i5087++) {
                                const _t5088 = sp.adj4Edges[v_t][_i5087];
                                if (!(((_t5088 === _wc5034 ? _wd5035 : (_t5088 === _wc5032 ? _wd5033 : (b.grid[_t5088] || -1))) === 1))) continue;
                                _g5084++;
                              }
                            }
                            let _g5089 = 0;
                            G5090: {
                              for (let _i5091 = 0; _i5091 < 1; _i5091++) {
                                const v_k = v_t;
                                const _h5092 = clueAt(cl.number, v_k);
                                const _h5099 = (_h5092 + 1);
                                let _c5101: boolean = (_h5092 !== -1);
                                if (_c5101) {
                                  let _c5100: boolean = (_h5050 || (_h5092 === 1));
                                  if (!_c5100) {
                                    let _g5093 = 0;
                                    G5094: {
                                      const _t5095 = (_h5092 + 1);
                                      const _a5096 = cluesValued(cl.number, _t5095);
                                      for (let _i5097 = 0; _i5097 < _a5096.length; _i5097++) {
                                        const v_x = _a5096[_i5097];
                                        const _h5098 = clueAt(cl.number, v_x);
                                        if (!((_h5098 === _h5099))) continue;
                                        _g5093++;
                                      }
                                    }
                                    _c5100 = (_g5093 === 0);
                                  }
                                  _c5101 = _c5100;
                                }
                                if (!(_c5101)) continue;
                                _g5089++;
                              }
                            }
                            _c5102 = (_g5084 < (2 - _g5089));
                          }
                          let _c5122: boolean = _c5102;
                          if (_c5122) {
                            let _g5103 = 0;
                            G5104: {
                              const _a5106 = sp.adj4[v_y];
                              for (let _i5107 = 0; _i5107 < _a5106.length; _i5107++) {
                                const _t5108 = sp.adj4Edges[v_y][_i5107];
                                if (!(((_t5108 === _wc5034 ? _wd5035 : (_t5108 === _wc5032 ? _wd5033 : (b.grid[_t5108] || -1))) === 1))) continue;
                                _g5103++;
                              }
                            }
                            let _g5109 = 0;
                            G5110: {
                              for (let _i5111 = 0; _i5111 < 1; _i5111++) {
                                const v_k = v_y;
                                const _h5112 = clueAt(cl.number, v_k);
                                const _h5119 = (_h5112 + 1);
                                let _c5121: boolean = (_h5112 !== -1);
                                if (_c5121) {
                                  let _c5120: boolean = (_h5050 || (_h5112 === 1));
                                  if (!_c5120) {
                                    let _g5113 = 0;
                                    G5114: {
                                      const _t5115 = (_h5112 + 1);
                                      const _a5116 = cluesValued(cl.number, _t5115);
                                      for (let _i5117 = 0; _i5117 < _a5116.length; _i5117++) {
                                        const v_x = _a5116[_i5117];
                                        const _h5118 = clueAt(cl.number, v_x);
                                        if (!((_h5118 === _h5119))) continue;
                                        _g5113++;
                                      }
                                    }
                                    _c5120 = (_g5113 === 0);
                                  }
                                  _c5121 = _c5120;
                                }
                                if (!(_c5121)) continue;
                                _g5109++;
                              }
                            }
                            _c5122 = (_g5103 < (2 - _g5109));
                          }
                          let _c5205: boolean = _c5122;
                          if (_c5205) {
                            let _q5123 = true;
                            Q5124: {
                              _g5125.length = 0;
                              G5126: {
                                for (let _i5128 = 0; _i5128 < 1; _i5128++) {
                                  const v_x = v_t;
                                  const _h5129 = clueAt(cl.number, v_x);
                                  if (!((_h5129 !== -1))) continue;
                                  _g5125.push(v_x);
                                }
                              }
                              _g5130.length = 0;
                              _st5144.pass++;
                              G5131: {
                                const _a5151 = throughWhere(sp, v_t, (_te5146: number): boolean => { let _c5148: boolean = ((_te5146 === _wc5034 ? _wd5035 : (_te5146 === _wc5032 ? _wd5033 : (b.grid[_te5146] || -1))) === 1); if (_c5148) {   const _t5147 = sp.edgeEnds[2 * _te5146];   _c5148 = !((clueAt(cl.number, _t5147) !== -1)); } let _c5150: boolean = _c5148; if (_c5150) {   const _t5149 = sp.edgeEnds[2 * _te5146 + 1];   _c5150 = !((clueAt(cl.number, _t5149) !== -1)); } return _c5150; });
                                for (let _i5152 = 0; _i5152 < _a5151.length; _i5152++) {
                                  const v_t_5145 = _a5151[_i5152];
                                  const _h5155 = clueAt(cl.number, v_t_5145);
                                  const _h5156 = (_h5155 !== -1);
                                  const _h5157 = _h5156;
                                  const _h5158 = !(_h5157);
                                  const _a5153 = sp.adj4[v_t_5145];
                                  for (let _i5154 = 0; _i5154 < _a5153.length; _i5154++) {
                                    const v_x = _a5153[_i5154];
                                    const _h5159 = clueAt(cl.number, v_x);
                                    let _c5161: boolean = (_h5158 && (_h5159 !== -1));
                                    if (_c5161) {
                                      const _t5160 = sp.adj4Edges[v_t_5145][_i5154];
                                      _c5161 = ((_t5160 === _wc5034 ? _wd5035 : (_t5160 === _wc5032 ? _wd5033 : (b.grid[_t5160] || -1))) === 1);
                                    }
                                    if (!(_c5161)) continue;
                                    const _t5162 = v_x;
                                    if (_g5130.length < 16) { if (!_g5130.includes(_t5162)) _g5130.push(_t5162); } else addOnce(_g5130, _st5144, _t5162);
                                  }
                                }
                              }
                              const _a5163 = union(_g5125, _g5130);
                              for (let _i5164 = 0; _i5164 < _a5163.length; _i5164++) {
                                const v_p = _a5163[_i5164];
                                const _h5203 = clueAt(cl.number, v_p);
                                _g5165.length = 0;
                                G5166: {
                                  for (let _i5168 = 0; _i5168 < 1; _i5168++) {
                                    const v_x = v_y;
                                    const _h5169 = clueAt(cl.number, v_x);
                                    if (!((_h5169 !== -1))) continue;
                                    _g5165.push(v_x);
                                  }
                                }
                                _g5170.length = 0;
                                _st5183.pass++;
                                G5171: {
                                  const _a5189 = throughWhere(sp, v_y, (_te5184: number): boolean => { let _c5186: boolean = ((_te5184 === _wc5034 ? _wd5035 : (_te5184 === _wc5032 ? _wd5033 : (b.grid[_te5184] || -1))) === 1); if (_c5186) {   const _t5185 = sp.edgeEnds[2 * _te5184];   _c5186 = !((clueAt(cl.number, _t5185) !== -1)); } let _c5188: boolean = _c5186; if (_c5188) {   const _t5187 = sp.edgeEnds[2 * _te5184 + 1];   _c5188 = !((clueAt(cl.number, _t5187) !== -1)); } return _c5188; });
                                  for (let _i5190 = 0; _i5190 < _a5189.length; _i5190++) {
                                    const v_t = _a5189[_i5190];
                                    const _h5193 = clueAt(cl.number, v_t);
                                    const _h5194 = (_h5193 !== -1);
                                    const _h5195 = _h5194;
                                    const _h5196 = !(_h5195);
                                    const _a5191 = sp.adj4[v_t];
                                    for (let _i5192 = 0; _i5192 < _a5191.length; _i5192++) {
                                      const v_x = _a5191[_i5192];
                                      const _h5197 = clueAt(cl.number, v_x);
                                      let _c5199: boolean = (_h5196 && (_h5197 !== -1));
                                      if (_c5199) {
                                        const _t5198 = sp.adj4Edges[v_t][_i5192];
                                        _c5199 = ((_t5198 === _wc5034 ? _wd5035 : (_t5198 === _wc5032 ? _wd5033 : (b.grid[_t5198] || -1))) === 1);
                                      }
                                      if (!(_c5199)) continue;
                                      const _t5200 = v_x;
                                      if (_g5170.length < 16) { if (!_g5170.includes(_t5200)) _g5170.push(_t5200); } else addOnce(_g5170, _st5183, _t5200);
                                    }
                                  }
                                }
                                const _a5201 = union(_g5165, _g5170);
                                for (let _i5202 = 0; _i5202 < _a5201.length; _i5202++) {
                                  const v_q = _a5201[_i5202];
                                  const _h5204 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h5203 - _h5204)) === cl.step))) {
                                    _q5123 = false;
                                    break Q5124;
                                  }
                                }
                              }
                            }
                            _c5205 = _q5123;
                          }
                          if (!((_c5205 && (_h5050 || !(throughWhere(sp, v_t, (_te5206: number): boolean => {  return ((_te5206 === _wc5034 ? _wd5035 : (_te5206 === _wc5032 ? _wd5033 : (b.grid[_te5206] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g5207 = 0;
                          G5208: {
                            const _a5209 = sp.adj4[v_t];
                            for (let _i5210 = 0; _i5210 < _a5209.length; _i5210++) {
                              const _t5211 = sp.adj4Edges[v_t][_i5210];
                              if (!(((_t5211 === _wc5034 ? _wd5035 : (_t5211 === _wc5032 ? _wd5033 : (b.grid[_t5211] || -1))) === 1))) continue;
                              _g5207++;
                            }
                          }
                          let _g5212 = 0;
                          G5213: {
                            for (let _i5214 = 0; _i5214 < 1; _i5214++) {
                              const v_k = v_t;
                              const _h5215 = clueAt(cl.number, v_k);
                              const _h5222 = (_h5215 + 1);
                              let _c5224: boolean = (_h5215 !== -1);
                              if (_c5224) {
                                let _c5223: boolean = (_h5050 || (_h5215 === 1));
                                if (!_c5223) {
                                  let _g5216 = 0;
                                  G5217: {
                                    const _t5218 = (_h5215 + 1);
                                    const _a5219 = cluesValued(cl.number, _t5218);
                                    for (let _i5220 = 0; _i5220 < _a5219.length; _i5220++) {
                                      const v_x = _a5219[_i5220];
                                      const _h5221 = clueAt(cl.number, v_x);
                                      if (!((_h5221 === _h5222))) continue;
                                      _g5216++;
                                    }
                                  }
                                  _c5223 = (_g5216 === 0);
                                }
                                _c5224 = _c5223;
                              }
                              if (!(_c5224)) continue;
                              _g5212++;
                            }
                          }
                          let _c5353: boolean = ((_g5207 + 1) === (2 - _g5212));
                          if (!_c5353) {
                            let _q5225 = false;
                            Q5226: {
                              const _a5227 = sp.adj4[v_t];
                              const _n5228 = _i5082;
                              for (let _i5229 = 0; _i5229 < _n5228; _i5229++) {
                                const v_z = _a5227[_i5229];
                                const _t5230 = sp.adj4Edges[v_t][_i5229];
                                let _c5249: boolean = !((_t5230 === _wc5034 ? true : (_t5230 === _wc5032 ? true : (b.grid[_t5230] !== 0))));
                                if (_c5249) {
                                  let _g5231 = 0;
                                  G5232: {
                                    const _a5233 = sp.adj4[v_t];
                                    for (let _i5234 = 0; _i5234 < _a5233.length; _i5234++) {
                                      const _t5235 = sp.adj4Edges[v_t][_i5234];
                                      if (!(((_t5235 === _wc5034 ? _wd5035 : (_t5235 === _wc5032 ? _wd5033 : (b.grid[_t5235] || -1))) === 1))) continue;
                                      _g5231++;
                                    }
                                  }
                                  let _g5236 = 0;
                                  G5237: {
                                    for (let _i5238 = 0; _i5238 < 1; _i5238++) {
                                      const v_k = v_t;
                                      const _h5239 = clueAt(cl.number, v_k);
                                      const _h5246 = (_h5239 + 1);
                                      let _c5248: boolean = (_h5239 !== -1);
                                      if (_c5248) {
                                        let _c5247: boolean = (_h5050 || (_h5239 === 1));
                                        if (!_c5247) {
                                          let _g5240 = 0;
                                          G5241: {
                                            const _t5242 = (_h5239 + 1);
                                            const _a5243 = cluesValued(cl.number, _t5242);
                                            for (let _i5244 = 0; _i5244 < _a5243.length; _i5244++) {
                                              const v_x = _a5243[_i5244];
                                              const _h5245 = clueAt(cl.number, v_x);
                                              if (!((_h5245 === _h5246))) continue;
                                              _g5240++;
                                            }
                                          }
                                          _c5247 = (_g5240 === 0);
                                        }
                                        _c5248 = _c5247;
                                      }
                                      if (!(_c5248)) continue;
                                      _g5236++;
                                    }
                                  }
                                  _c5249 = (_g5231 < (2 - _g5236));
                                }
                                let _c5268: boolean = _c5249;
                                if (_c5268) {
                                  let _g5250 = 0;
                                  G5251: {
                                    const _a5252 = sp.adj4[v_z];
                                    for (let _i5253 = 0; _i5253 < _a5252.length; _i5253++) {
                                      const _t5254 = sp.adj4Edges[v_z][_i5253];
                                      if (!(((_t5254 === _wc5034 ? _wd5035 : (_t5254 === _wc5032 ? _wd5033 : (b.grid[_t5254] || -1))) === 1))) continue;
                                      _g5250++;
                                    }
                                  }
                                  let _g5255 = 0;
                                  G5256: {
                                    for (let _i5257 = 0; _i5257 < 1; _i5257++) {
                                      const v_k = v_z;
                                      const _h5258 = clueAt(cl.number, v_k);
                                      const _h5265 = (_h5258 + 1);
                                      let _c5267: boolean = (_h5258 !== -1);
                                      if (_c5267) {
                                        let _c5266: boolean = (_h5050 || (_h5258 === 1));
                                        if (!_c5266) {
                                          let _g5259 = 0;
                                          G5260: {
                                            const _t5261 = (_h5258 + 1);
                                            const _a5262 = cluesValued(cl.number, _t5261);
                                            for (let _i5263 = 0; _i5263 < _a5262.length; _i5263++) {
                                              const v_x = _a5262[_i5263];
                                              const _h5264 = clueAt(cl.number, v_x);
                                              if (!((_h5264 === _h5265))) continue;
                                              _g5259++;
                                            }
                                          }
                                          _c5266 = (_g5259 === 0);
                                        }
                                        _c5267 = _c5266;
                                      }
                                      if (!(_c5267)) continue;
                                      _g5255++;
                                    }
                                  }
                                  _c5268 = (_g5250 < (2 - _g5255));
                                }
                                let _c5351: boolean = _c5268;
                                if (_c5351) {
                                  let _q5269 = true;
                                  Q5270: {
                                    _g5271.length = 0;
                                    G5272: {
                                      for (let _i5274 = 0; _i5274 < 1; _i5274++) {
                                        const v_x = v_t;
                                        const _h5275 = clueAt(cl.number, v_x);
                                        if (!((_h5275 !== -1))) continue;
                                        _g5271.push(v_x);
                                      }
                                    }
                                    _g5276.length = 0;
                                    _st5290.pass++;
                                    G5277: {
                                      const _a5297 = throughWhere(sp, v_t, (_te5292: number): boolean => { let _c5294: boolean = ((_te5292 === _wc5034 ? _wd5035 : (_te5292 === _wc5032 ? _wd5033 : (b.grid[_te5292] || -1))) === 1); if (_c5294) {   const _t5293 = sp.edgeEnds[2 * _te5292];   _c5294 = !((clueAt(cl.number, _t5293) !== -1)); } let _c5296: boolean = _c5294; if (_c5296) {   const _t5295 = sp.edgeEnds[2 * _te5292 + 1];   _c5296 = !((clueAt(cl.number, _t5295) !== -1)); } return _c5296; });
                                      for (let _i5298 = 0; _i5298 < _a5297.length; _i5298++) {
                                        const v_t_5291 = _a5297[_i5298];
                                        const _h5301 = clueAt(cl.number, v_t_5291);
                                        const _h5302 = (_h5301 !== -1);
                                        const _h5303 = _h5302;
                                        const _h5304 = !(_h5303);
                                        const _a5299 = sp.adj4[v_t_5291];
                                        for (let _i5300 = 0; _i5300 < _a5299.length; _i5300++) {
                                          const v_x = _a5299[_i5300];
                                          const _h5305 = clueAt(cl.number, v_x);
                                          let _c5307: boolean = (_h5304 && (_h5305 !== -1));
                                          if (_c5307) {
                                            const _t5306 = sp.adj4Edges[v_t_5291][_i5300];
                                            _c5307 = ((_t5306 === _wc5034 ? _wd5035 : (_t5306 === _wc5032 ? _wd5033 : (b.grid[_t5306] || -1))) === 1);
                                          }
                                          if (!(_c5307)) continue;
                                          const _t5308 = v_x;
                                          if (_g5276.length < 16) { if (!_g5276.includes(_t5308)) _g5276.push(_t5308); } else addOnce(_g5276, _st5290, _t5308);
                                        }
                                      }
                                    }
                                    const _a5309 = union(_g5271, _g5276);
                                    for (let _i5310 = 0; _i5310 < _a5309.length; _i5310++) {
                                      const v_p = _a5309[_i5310];
                                      const _h5349 = clueAt(cl.number, v_p);
                                      _g5311.length = 0;
                                      G5312: {
                                        for (let _i5314 = 0; _i5314 < 1; _i5314++) {
                                          const v_x = v_z;
                                          const _h5315 = clueAt(cl.number, v_x);
                                          if (!((_h5315 !== -1))) continue;
                                          _g5311.push(v_x);
                                        }
                                      }
                                      _g5316.length = 0;
                                      _st5329.pass++;
                                      G5317: {
                                        const _a5335 = throughWhere(sp, v_z, (_te5330: number): boolean => { let _c5332: boolean = ((_te5330 === _wc5034 ? _wd5035 : (_te5330 === _wc5032 ? _wd5033 : (b.grid[_te5330] || -1))) === 1); if (_c5332) {   const _t5331 = sp.edgeEnds[2 * _te5330];   _c5332 = !((clueAt(cl.number, _t5331) !== -1)); } let _c5334: boolean = _c5332; if (_c5334) {   const _t5333 = sp.edgeEnds[2 * _te5330 + 1];   _c5334 = !((clueAt(cl.number, _t5333) !== -1)); } return _c5334; });
                                        for (let _i5336 = 0; _i5336 < _a5335.length; _i5336++) {
                                          const v_t = _a5335[_i5336];
                                          const _h5339 = clueAt(cl.number, v_t);
                                          const _h5340 = (_h5339 !== -1);
                                          const _h5341 = _h5340;
                                          const _h5342 = !(_h5341);
                                          const _a5337 = sp.adj4[v_t];
                                          for (let _i5338 = 0; _i5338 < _a5337.length; _i5338++) {
                                            const v_x = _a5337[_i5338];
                                            const _h5343 = clueAt(cl.number, v_x);
                                            let _c5345: boolean = (_h5342 && (_h5343 !== -1));
                                            if (_c5345) {
                                              const _t5344 = sp.adj4Edges[v_t][_i5338];
                                              _c5345 = ((_t5344 === _wc5034 ? _wd5035 : (_t5344 === _wc5032 ? _wd5033 : (b.grid[_t5344] || -1))) === 1);
                                            }
                                            if (!(_c5345)) continue;
                                            const _t5346 = v_x;
                                            if (_g5316.length < 16) { if (!_g5316.includes(_t5346)) _g5316.push(_t5346); } else addOnce(_g5316, _st5329, _t5346);
                                          }
                                        }
                                      }
                                      const _a5347 = union(_g5311, _g5316);
                                      for (let _i5348 = 0; _i5348 < _a5347.length; _i5348++) {
                                        const v_q = _a5347[_i5348];
                                        const _h5350 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5349 - _h5350)) === cl.step))) {
                                          _q5269 = false;
                                          break Q5270;
                                        }
                                      }
                                    }
                                  }
                                  _c5351 = _q5269;
                                }
                                if ((_c5351 && (_h5050 || !(throughWhere(sp, v_t, (_te5352: number): boolean => {  return ((_te5352 === _wc5034 ? _wd5035 : (_te5352 === _wc5032 ? _wd5033 : (b.grid[_te5352] || -1))) === 1); }).includes(v_z))))) {
                                  _q5225 = true;
                                  break Q5226;
                                }
                              }
                            }
                            _c5353 = _q5225;
                          }
                          if (_c5353) {
                            _q5079 = true;
                            break Q5080;
                          }
                        }
                      }
                      _c5354 = !(_q5079);
                    }
                    let _c5649: boolean = _c5354;
                    if (!_c5649) {
                      let _q5355 = false;
                      Q5356: {
                        const _a5357 = sp.adj4[v_t];
                        for (let _i5358 = 0; _i5358 < _a5357.length; _i5358++) {
                          const v_s = _a5357[_i5358];
                          let _g5359 = 0;
                          G5360: {
                            const _a5361 = sp.adj4[v_s];
                            for (let _i5362 = 0; _i5362 < _a5361.length; _i5362++) {
                              const _t5363 = sp.adj4Edges[v_s][_i5362];
                              if (!(((_t5363 === _wc5034 ? _wd5035 : (_t5363 === _wc5032 ? _wd5033 : (b.grid[_t5363] || -1))) === 1))) continue;
                              _g5359++;
                            }
                          }
                          let _g5364 = 0;
                          G5365: {
                            for (let _i5366 = 0; _i5366 < 1; _i5366++) {
                              const v_k = v_s;
                              const _h5367 = clueAt(cl.number, v_k);
                              const _h5374 = (_h5367 + 1);
                              let _c5376: boolean = (_h5367 !== -1);
                              if (_c5376) {
                                let _c5375: boolean = (_h5050 || (_h5367 === 1));
                                if (!_c5375) {
                                  let _g5368 = 0;
                                  G5369: {
                                    const _t5370 = (_h5367 + 1);
                                    const _a5371 = cluesValued(cl.number, _t5370);
                                    for (let _i5372 = 0; _i5372 < _a5371.length; _i5372++) {
                                      const v_x = _a5371[_i5372];
                                      const _h5373 = clueAt(cl.number, v_x);
                                      if (!((_h5373 === _h5374))) continue;
                                      _g5368++;
                                    }
                                  }
                                  _c5375 = (_g5368 === 0);
                                }
                                _c5376 = _c5375;
                              }
                              if (!(_c5376)) continue;
                              _g5364++;
                            }
                          }
                          let _c5648: boolean = (_g5359 < (2 - _g5364));
                          if (_c5648) {
                            let _q5377 = false;
                            Q5378: {
                              const _a5379 = sp.adj4[v_s];
                              for (let _i5380 = 0; _i5380 < _a5379.length; _i5380++) {
                                const v_y = _a5379[_i5380];
                                const _t5381 = sp.adj4Edges[v_s][_i5380];
                                let _c5400: boolean = !((_t5381 === _wc5034 ? true : (_t5381 === _wc5032 ? true : (b.grid[_t5381] !== 0))));
                                if (_c5400) {
                                  let _g5382 = 0;
                                  G5383: {
                                    const _a5384 = sp.adj4[v_s];
                                    for (let _i5385 = 0; _i5385 < _a5384.length; _i5385++) {
                                      const _t5386 = sp.adj4Edges[v_s][_i5385];
                                      if (!(((_t5386 === _wc5034 ? _wd5035 : (_t5386 === _wc5032 ? _wd5033 : (b.grid[_t5386] || -1))) === 1))) continue;
                                      _g5382++;
                                    }
                                  }
                                  let _g5387 = 0;
                                  G5388: {
                                    for (let _i5389 = 0; _i5389 < 1; _i5389++) {
                                      const v_k = v_s;
                                      const _h5390 = clueAt(cl.number, v_k);
                                      const _h5397 = (_h5390 + 1);
                                      let _c5399: boolean = (_h5390 !== -1);
                                      if (_c5399) {
                                        let _c5398: boolean = (_h5050 || (_h5390 === 1));
                                        if (!_c5398) {
                                          let _g5391 = 0;
                                          G5392: {
                                            const _t5393 = (_h5390 + 1);
                                            const _a5394 = cluesValued(cl.number, _t5393);
                                            for (let _i5395 = 0; _i5395 < _a5394.length; _i5395++) {
                                              const v_x = _a5394[_i5395];
                                              const _h5396 = clueAt(cl.number, v_x);
                                              if (!((_h5396 === _h5397))) continue;
                                              _g5391++;
                                            }
                                          }
                                          _c5398 = (_g5391 === 0);
                                        }
                                        _c5399 = _c5398;
                                      }
                                      if (!(_c5399)) continue;
                                      _g5387++;
                                    }
                                  }
                                  _c5400 = (_g5382 < (2 - _g5387));
                                }
                                let _c5420: boolean = _c5400;
                                if (_c5420) {
                                  let _g5401 = 0;
                                  G5402: {
                                    const _a5404 = sp.adj4[v_y];
                                    for (let _i5405 = 0; _i5405 < _a5404.length; _i5405++) {
                                      const _t5406 = sp.adj4Edges[v_y][_i5405];
                                      if (!(((_t5406 === _wc5034 ? _wd5035 : (_t5406 === _wc5032 ? _wd5033 : (b.grid[_t5406] || -1))) === 1))) continue;
                                      _g5401++;
                                    }
                                  }
                                  let _g5407 = 0;
                                  G5408: {
                                    for (let _i5409 = 0; _i5409 < 1; _i5409++) {
                                      const v_k = v_y;
                                      const _h5410 = clueAt(cl.number, v_k);
                                      const _h5417 = (_h5410 + 1);
                                      let _c5419: boolean = (_h5410 !== -1);
                                      if (_c5419) {
                                        let _c5418: boolean = (_h5050 || (_h5410 === 1));
                                        if (!_c5418) {
                                          let _g5411 = 0;
                                          G5412: {
                                            const _t5413 = (_h5410 + 1);
                                            const _a5414 = cluesValued(cl.number, _t5413);
                                            for (let _i5415 = 0; _i5415 < _a5414.length; _i5415++) {
                                              const v_x = _a5414[_i5415];
                                              const _h5416 = clueAt(cl.number, v_x);
                                              if (!((_h5416 === _h5417))) continue;
                                              _g5411++;
                                            }
                                          }
                                          _c5418 = (_g5411 === 0);
                                        }
                                        _c5419 = _c5418;
                                      }
                                      if (!(_c5419)) continue;
                                      _g5407++;
                                    }
                                  }
                                  _c5420 = (_g5401 < (2 - _g5407));
                                }
                                let _c5501: boolean = _c5420;
                                if (_c5501) {
                                  let _q5421 = true;
                                  Q5422: {
                                    _g5423.length = 0;
                                    G5424: {
                                      for (let _i5426 = 0; _i5426 < 1; _i5426++) {
                                        const v_x = v_s;
                                        const _h5427 = clueAt(cl.number, v_x);
                                        if (!((_h5427 !== -1))) continue;
                                        _g5423.push(v_x);
                                      }
                                    }
                                    _g5428.length = 0;
                                    _st5441.pass++;
                                    G5429: {
                                      const _a5447 = throughWhere(sp, v_s, (_te5442: number): boolean => { let _c5444: boolean = ((_te5442 === _wc5034 ? _wd5035 : (_te5442 === _wc5032 ? _wd5033 : (b.grid[_te5442] || -1))) === 1); if (_c5444) {   const _t5443 = sp.edgeEnds[2 * _te5442];   _c5444 = !((clueAt(cl.number, _t5443) !== -1)); } let _c5446: boolean = _c5444; if (_c5446) {   const _t5445 = sp.edgeEnds[2 * _te5442 + 1];   _c5446 = !((clueAt(cl.number, _t5445) !== -1)); } return _c5446; });
                                      for (let _i5448 = 0; _i5448 < _a5447.length; _i5448++) {
                                        const v_t = _a5447[_i5448];
                                        const _h5451 = clueAt(cl.number, v_t);
                                        const _h5452 = (_h5451 !== -1);
                                        const _h5453 = _h5452;
                                        const _h5454 = !(_h5453);
                                        const _a5449 = sp.adj4[v_t];
                                        for (let _i5450 = 0; _i5450 < _a5449.length; _i5450++) {
                                          const v_x = _a5449[_i5450];
                                          const _h5455 = clueAt(cl.number, v_x);
                                          let _c5457: boolean = (_h5454 && (_h5455 !== -1));
                                          if (_c5457) {
                                            const _t5456 = sp.adj4Edges[v_t][_i5450];
                                            _c5457 = ((_t5456 === _wc5034 ? _wd5035 : (_t5456 === _wc5032 ? _wd5033 : (b.grid[_t5456] || -1))) === 1);
                                          }
                                          if (!(_c5457)) continue;
                                          const _t5458 = v_x;
                                          if (_g5428.length < 16) { if (!_g5428.includes(_t5458)) _g5428.push(_t5458); } else addOnce(_g5428, _st5441, _t5458);
                                        }
                                      }
                                    }
                                    const _a5459 = union(_g5423, _g5428);
                                    for (let _i5460 = 0; _i5460 < _a5459.length; _i5460++) {
                                      const v_p = _a5459[_i5460];
                                      const _h5499 = clueAt(cl.number, v_p);
                                      _g5461.length = 0;
                                      G5462: {
                                        for (let _i5464 = 0; _i5464 < 1; _i5464++) {
                                          const v_x = v_y;
                                          const _h5465 = clueAt(cl.number, v_x);
                                          if (!((_h5465 !== -1))) continue;
                                          _g5461.push(v_x);
                                        }
                                      }
                                      _g5466.length = 0;
                                      _st5479.pass++;
                                      G5467: {
                                        const _a5485 = throughWhere(sp, v_y, (_te5480: number): boolean => { let _c5482: boolean = ((_te5480 === _wc5034 ? _wd5035 : (_te5480 === _wc5032 ? _wd5033 : (b.grid[_te5480] || -1))) === 1); if (_c5482) {   const _t5481 = sp.edgeEnds[2 * _te5480];   _c5482 = !((clueAt(cl.number, _t5481) !== -1)); } let _c5484: boolean = _c5482; if (_c5484) {   const _t5483 = sp.edgeEnds[2 * _te5480 + 1];   _c5484 = !((clueAt(cl.number, _t5483) !== -1)); } return _c5484; });
                                        for (let _i5486 = 0; _i5486 < _a5485.length; _i5486++) {
                                          const v_t = _a5485[_i5486];
                                          const _h5489 = clueAt(cl.number, v_t);
                                          const _h5490 = (_h5489 !== -1);
                                          const _h5491 = _h5490;
                                          const _h5492 = !(_h5491);
                                          const _a5487 = sp.adj4[v_t];
                                          for (let _i5488 = 0; _i5488 < _a5487.length; _i5488++) {
                                            const v_x = _a5487[_i5488];
                                            const _h5493 = clueAt(cl.number, v_x);
                                            let _c5495: boolean = (_h5492 && (_h5493 !== -1));
                                            if (_c5495) {
                                              const _t5494 = sp.adj4Edges[v_t][_i5488];
                                              _c5495 = ((_t5494 === _wc5034 ? _wd5035 : (_t5494 === _wc5032 ? _wd5033 : (b.grid[_t5494] || -1))) === 1);
                                            }
                                            if (!(_c5495)) continue;
                                            const _t5496 = v_x;
                                            if (_g5466.length < 16) { if (!_g5466.includes(_t5496)) _g5466.push(_t5496); } else addOnce(_g5466, _st5479, _t5496);
                                          }
                                        }
                                      }
                                      const _a5497 = union(_g5461, _g5466);
                                      for (let _i5498 = 0; _i5498 < _a5497.length; _i5498++) {
                                        const v_q = _a5497[_i5498];
                                        const _h5500 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5499 - _h5500)) === cl.step))) {
                                          _q5421 = false;
                                          break Q5422;
                                        }
                                      }
                                    }
                                  }
                                  _c5501 = _q5421;
                                }
                                if (!((_c5501 && (_h5050 || !(throughWhere(sp, v_s, (_te5502: number): boolean => {  return ((_te5502 === _wc5034 ? _wd5035 : (_te5502 === _wc5032 ? _wd5033 : (b.grid[_te5502] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g5503 = 0;
                                G5504: {
                                  const _a5505 = sp.adj4[v_s];
                                  for (let _i5506 = 0; _i5506 < _a5505.length; _i5506++) {
                                    const _t5507 = sp.adj4Edges[v_s][_i5506];
                                    if (!(((_t5507 === _wc5034 ? _wd5035 : (_t5507 === _wc5032 ? _wd5033 : (b.grid[_t5507] || -1))) === 1))) continue;
                                    _g5503++;
                                  }
                                }
                                let _g5508 = 0;
                                G5509: {
                                  for (let _i5510 = 0; _i5510 < 1; _i5510++) {
                                    const v_k = v_s;
                                    const _h5511 = clueAt(cl.number, v_k);
                                    const _h5518 = (_h5511 + 1);
                                    let _c5520: boolean = (_h5511 !== -1);
                                    if (_c5520) {
                                      let _c5519: boolean = (_h5050 || (_h5511 === 1));
                                      if (!_c5519) {
                                        let _g5512 = 0;
                                        G5513: {
                                          const _t5514 = (_h5511 + 1);
                                          const _a5515 = cluesValued(cl.number, _t5514);
                                          for (let _i5516 = 0; _i5516 < _a5515.length; _i5516++) {
                                            const v_x = _a5515[_i5516];
                                            const _h5517 = clueAt(cl.number, v_x);
                                            if (!((_h5517 === _h5518))) continue;
                                            _g5512++;
                                          }
                                        }
                                        _c5519 = (_g5512 === 0);
                                      }
                                      _c5520 = _c5519;
                                    }
                                    if (!(_c5520)) continue;
                                    _g5508++;
                                  }
                                }
                                let _c5647: boolean = ((_g5503 + 1) === (2 - _g5508));
                                if (!_c5647) {
                                  let _q5521 = false;
                                  Q5522: {
                                    const _a5523 = sp.adj4[v_s];
                                    const _n5524 = _i5380;
                                    for (let _i5525 = 0; _i5525 < _n5524; _i5525++) {
                                      const v_z = _a5523[_i5525];
                                      const _t5526 = sp.adj4Edges[v_s][_i5525];
                                      let _c5545: boolean = !((_t5526 === _wc5034 ? true : (_t5526 === _wc5032 ? true : (b.grid[_t5526] !== 0))));
                                      if (_c5545) {
                                        let _g5527 = 0;
                                        G5528: {
                                          const _a5529 = sp.adj4[v_s];
                                          for (let _i5530 = 0; _i5530 < _a5529.length; _i5530++) {
                                            const _t5531 = sp.adj4Edges[v_s][_i5530];
                                            if (!(((_t5531 === _wc5034 ? _wd5035 : (_t5531 === _wc5032 ? _wd5033 : (b.grid[_t5531] || -1))) === 1))) continue;
                                            _g5527++;
                                          }
                                        }
                                        let _g5532 = 0;
                                        G5533: {
                                          for (let _i5534 = 0; _i5534 < 1; _i5534++) {
                                            const v_k = v_s;
                                            const _h5535 = clueAt(cl.number, v_k);
                                            const _h5542 = (_h5535 + 1);
                                            let _c5544: boolean = (_h5535 !== -1);
                                            if (_c5544) {
                                              let _c5543: boolean = (_h5050 || (_h5535 === 1));
                                              if (!_c5543) {
                                                let _g5536 = 0;
                                                G5537: {
                                                  const _t5538 = (_h5535 + 1);
                                                  const _a5539 = cluesValued(cl.number, _t5538);
                                                  for (let _i5540 = 0; _i5540 < _a5539.length; _i5540++) {
                                                    const v_x = _a5539[_i5540];
                                                    const _h5541 = clueAt(cl.number, v_x);
                                                    if (!((_h5541 === _h5542))) continue;
                                                    _g5536++;
                                                  }
                                                }
                                                _c5543 = (_g5536 === 0);
                                              }
                                              _c5544 = _c5543;
                                            }
                                            if (!(_c5544)) continue;
                                            _g5532++;
                                          }
                                        }
                                        _c5545 = (_g5527 < (2 - _g5532));
                                      }
                                      let _c5564: boolean = _c5545;
                                      if (_c5564) {
                                        let _g5546 = 0;
                                        G5547: {
                                          const _a5548 = sp.adj4[v_z];
                                          for (let _i5549 = 0; _i5549 < _a5548.length; _i5549++) {
                                            const _t5550 = sp.adj4Edges[v_z][_i5549];
                                            if (!(((_t5550 === _wc5034 ? _wd5035 : (_t5550 === _wc5032 ? _wd5033 : (b.grid[_t5550] || -1))) === 1))) continue;
                                            _g5546++;
                                          }
                                        }
                                        let _g5551 = 0;
                                        G5552: {
                                          for (let _i5553 = 0; _i5553 < 1; _i5553++) {
                                            const v_k = v_z;
                                            const _h5554 = clueAt(cl.number, v_k);
                                            const _h5561 = (_h5554 + 1);
                                            let _c5563: boolean = (_h5554 !== -1);
                                            if (_c5563) {
                                              let _c5562: boolean = (_h5050 || (_h5554 === 1));
                                              if (!_c5562) {
                                                let _g5555 = 0;
                                                G5556: {
                                                  const _t5557 = (_h5554 + 1);
                                                  const _a5558 = cluesValued(cl.number, _t5557);
                                                  for (let _i5559 = 0; _i5559 < _a5558.length; _i5559++) {
                                                    const v_x = _a5558[_i5559];
                                                    const _h5560 = clueAt(cl.number, v_x);
                                                    if (!((_h5560 === _h5561))) continue;
                                                    _g5555++;
                                                  }
                                                }
                                                _c5562 = (_g5555 === 0);
                                              }
                                              _c5563 = _c5562;
                                            }
                                            if (!(_c5563)) continue;
                                            _g5551++;
                                          }
                                        }
                                        _c5564 = (_g5546 < (2 - _g5551));
                                      }
                                      let _c5645: boolean = _c5564;
                                      if (_c5645) {
                                        let _q5565 = true;
                                        Q5566: {
                                          _g5567.length = 0;
                                          G5568: {
                                            for (let _i5570 = 0; _i5570 < 1; _i5570++) {
                                              const v_x = v_s;
                                              const _h5571 = clueAt(cl.number, v_x);
                                              if (!((_h5571 !== -1))) continue;
                                              _g5567.push(v_x);
                                            }
                                          }
                                          _g5572.length = 0;
                                          _st5585.pass++;
                                          G5573: {
                                            const _a5591 = throughWhere(sp, v_s, (_te5586: number): boolean => { let _c5588: boolean = ((_te5586 === _wc5034 ? _wd5035 : (_te5586 === _wc5032 ? _wd5033 : (b.grid[_te5586] || -1))) === 1); if (_c5588) {   const _t5587 = sp.edgeEnds[2 * _te5586];   _c5588 = !((clueAt(cl.number, _t5587) !== -1)); } let _c5590: boolean = _c5588; if (_c5590) {   const _t5589 = sp.edgeEnds[2 * _te5586 + 1];   _c5590 = !((clueAt(cl.number, _t5589) !== -1)); } return _c5590; });
                                            for (let _i5592 = 0; _i5592 < _a5591.length; _i5592++) {
                                              const v_t = _a5591[_i5592];
                                              const _h5595 = clueAt(cl.number, v_t);
                                              const _h5596 = (_h5595 !== -1);
                                              const _h5597 = _h5596;
                                              const _h5598 = !(_h5597);
                                              const _a5593 = sp.adj4[v_t];
                                              for (let _i5594 = 0; _i5594 < _a5593.length; _i5594++) {
                                                const v_x = _a5593[_i5594];
                                                const _h5599 = clueAt(cl.number, v_x);
                                                let _c5601: boolean = (_h5598 && (_h5599 !== -1));
                                                if (_c5601) {
                                                  const _t5600 = sp.adj4Edges[v_t][_i5594];
                                                  _c5601 = ((_t5600 === _wc5034 ? _wd5035 : (_t5600 === _wc5032 ? _wd5033 : (b.grid[_t5600] || -1))) === 1);
                                                }
                                                if (!(_c5601)) continue;
                                                const _t5602 = v_x;
                                                if (_g5572.length < 16) { if (!_g5572.includes(_t5602)) _g5572.push(_t5602); } else addOnce(_g5572, _st5585, _t5602);
                                              }
                                            }
                                          }
                                          const _a5603 = union(_g5567, _g5572);
                                          for (let _i5604 = 0; _i5604 < _a5603.length; _i5604++) {
                                            const v_p = _a5603[_i5604];
                                            const _h5643 = clueAt(cl.number, v_p);
                                            _g5605.length = 0;
                                            G5606: {
                                              for (let _i5608 = 0; _i5608 < 1; _i5608++) {
                                                const v_x = v_z;
                                                const _h5609 = clueAt(cl.number, v_x);
                                                if (!((_h5609 !== -1))) continue;
                                                _g5605.push(v_x);
                                              }
                                            }
                                            _g5610.length = 0;
                                            _st5623.pass++;
                                            G5611: {
                                              const _a5629 = throughWhere(sp, v_z, (_te5624: number): boolean => { let _c5626: boolean = ((_te5624 === _wc5034 ? _wd5035 : (_te5624 === _wc5032 ? _wd5033 : (b.grid[_te5624] || -1))) === 1); if (_c5626) {   const _t5625 = sp.edgeEnds[2 * _te5624];   _c5626 = !((clueAt(cl.number, _t5625) !== -1)); } let _c5628: boolean = _c5626; if (_c5628) {   const _t5627 = sp.edgeEnds[2 * _te5624 + 1];   _c5628 = !((clueAt(cl.number, _t5627) !== -1)); } return _c5628; });
                                              for (let _i5630 = 0; _i5630 < _a5629.length; _i5630++) {
                                                const v_t = _a5629[_i5630];
                                                const _h5633 = clueAt(cl.number, v_t);
                                                const _h5634 = (_h5633 !== -1);
                                                const _h5635 = _h5634;
                                                const _h5636 = !(_h5635);
                                                const _a5631 = sp.adj4[v_t];
                                                for (let _i5632 = 0; _i5632 < _a5631.length; _i5632++) {
                                                  const v_x = _a5631[_i5632];
                                                  const _h5637 = clueAt(cl.number, v_x);
                                                  let _c5639: boolean = (_h5636 && (_h5637 !== -1));
                                                  if (_c5639) {
                                                    const _t5638 = sp.adj4Edges[v_t][_i5632];
                                                    _c5639 = ((_t5638 === _wc5034 ? _wd5035 : (_t5638 === _wc5032 ? _wd5033 : (b.grid[_t5638] || -1))) === 1);
                                                  }
                                                  if (!(_c5639)) continue;
                                                  const _t5640 = v_x;
                                                  if (_g5610.length < 16) { if (!_g5610.includes(_t5640)) _g5610.push(_t5640); } else addOnce(_g5610, _st5623, _t5640);
                                                }
                                              }
                                            }
                                            const _a5641 = union(_g5605, _g5610);
                                            for (let _i5642 = 0; _i5642 < _a5641.length; _i5642++) {
                                              const v_q = _a5641[_i5642];
                                              const _h5644 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h5643 - _h5644)) === cl.step))) {
                                                _q5565 = false;
                                                break Q5566;
                                              }
                                            }
                                          }
                                        }
                                        _c5645 = _q5565;
                                      }
                                      if ((_c5645 && (_h5050 || !(throughWhere(sp, v_s, (_te5646: number): boolean => {  return ((_te5646 === _wc5034 ? _wd5035 : (_te5646 === _wc5032 ? _wd5033 : (b.grid[_te5646] || -1))) === 1); }).includes(v_z))))) {
                                        _q5521 = true;
                                        break Q5522;
                                      }
                                    }
                                  }
                                  _c5647 = _q5521;
                                }
                                if (_c5647) {
                                  _q5377 = true;
                                  break Q5378;
                                }
                              }
                            }
                            _c5648 = !(_q5377);
                          }
                          if (_c5648) {
                            _q5355 = true;
                            break Q5356;
                          }
                        }
                      }
                      _c5649 = _q5355;
                    }
                    if (_c5649) {
                      _q5036 = true;
                      break Q5037;
                    }
                  }
                }
                _c5650 = _q5036;
              }
              _c5651 = _c5650;
            }
            if (!(_c5651)) continue;
            const _t5652 = v_j;
            if (_g4505.length < 16) { if (!_g4505.includes(_t5652)) _g4505.push(_t5652); } else addOnce(_g4505, _st5020, _t5652);
          }
        }
      }
      const v_A = _g4505;
      const _h6813 = v_A.length;
      const _h6814 = (_h6813 < 3);
      _g5653.length = 0;
      _st6169.pass++;
      G5654: {
        const _a6170 = v_U;
        for (let _i6171 = 0; _i6171 < _a6170.length; _i6171++) {
          const v_i = _a6170[_i6171];
          const _h6174 = _i6171;
          const _h6175 = (_h6174 > 0);
          const _h6176 = sp.edgeOf(v_c, v_i);
          const _a6172 = v_U;
          for (let _i6173 = 0; _i6173 < _a6172.length; _i6173++) {
            const v_j = _a6172[_i6173];
            let _c6795: boolean = (_h6175 && (_h6174 < _i6173));
            if (_c6795) {
              let _c6794: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h5030 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c6794) {
                const _wc6177 = _h6176;
                const _wd6178 = 1;
                const _wc6179 = sp.edgeOf(v_c, v_j);
                const _wd6180 = 1;
                let _q6181 = false;
                Q6182: {
                  const _a6184 = throughWhere(sp, v_c, (_te6183: number): boolean => {  return ((_te6183 === _wc6179 ? _wd6180 : (_te6183 === _wc6177 ? _wd6178 : (b.grid[_te6183] || -1))) === 1); });
                  for (let _i6185 = 0; _i6185 < _a6184.length; _i6185++) {
                    const v_t = _a6184[_i6185];
                    let _c6204: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6204) {
                      let _g6186 = 0;
                      G6187: {
                        const _a6188 = sp.adj4[v_t];
                        for (let _i6189 = 0; _i6189 < _a6188.length; _i6189++) {
                          const _t6190 = sp.adj4Edges[v_t][_i6189];
                          if (!(((_t6190 === _wc6179 ? _wd6180 : (_t6190 === _wc6177 ? _wd6178 : (b.grid[_t6190] || -1))) === 1))) continue;
                          _g6186++;
                        }
                      }
                      let _g6191 = 0;
                      G6192: {
                        for (let _i6193 = 0; _i6193 < 1; _i6193++) {
                          const v_k = v_t;
                          const _h6194 = clueAt(cl.number, v_k);
                          const _h6201 = (_h6194 + 1);
                          let _c6203: boolean = (_h6194 !== -1);
                          if (_c6203) {
                            let _c6202: boolean = (_h5050 || (_h6194 === 1));
                            if (!_c6202) {
                              let _g6195 = 0;
                              G6196: {
                                const _t6197 = (_h6194 + 1);
                                const _a6198 = cluesValued(cl.number, _t6197);
                                for (let _i6199 = 0; _i6199 < _a6198.length; _i6199++) {
                                  const v_x = _a6198[_i6199];
                                  const _h6200 = clueAt(cl.number, v_x);
                                  if (!((_h6200 === _h6201))) continue;
                                  _g6195++;
                                }
                              }
                              _c6202 = (_g6195 === 0);
                            }
                            _c6203 = _c6202;
                          }
                          if (!(_c6203)) continue;
                          _g6191++;
                        }
                      }
                      _c6204 = (_g6186 < (2 - _g6191));
                    }
                    if (!(_c6204)) continue;
                    let _g6205 = 0;
                    G6206: {
                      const _a6207 = sp.adj4[v_t];
                      for (let _i6208 = 0; _i6208 < _a6207.length; _i6208++) {
                        const _t6209 = sp.adj4Edges[v_t][_i6208];
                        if (!(((_t6209 === _wc6179 ? _wd6180 : (_t6209 === _wc6177 ? _wd6178 : (b.grid[_t6209] || -1))) === 1))) continue;
                        _g6205++;
                      }
                    }
                    let _g6210 = 0;
                    G6211: {
                      for (let _i6212 = 0; _i6212 < 1; _i6212++) {
                        const v_k = v_t;
                        const _h6213 = clueAt(cl.number, v_k);
                        const _h6220 = (_h6213 + 1);
                        let _c6222: boolean = (_h6213 !== -1);
                        if (_c6222) {
                          let _c6221: boolean = (_h5050 || (_h6213 === 1));
                          if (!_c6221) {
                            let _g6214 = 0;
                            G6215: {
                              const _t6216 = (_h6213 + 1);
                              const _a6217 = cluesValued(cl.number, _t6216);
                              for (let _i6218 = 0; _i6218 < _a6217.length; _i6218++) {
                                const v_x = _a6217[_i6218];
                                const _h6219 = clueAt(cl.number, v_x);
                                if (!((_h6219 === _h6220))) continue;
                                _g6214++;
                              }
                            }
                            _c6221 = (_g6214 === 0);
                          }
                          _c6222 = _c6221;
                        }
                        if (!(_c6222)) continue;
                        _g6210++;
                      }
                    }
                    let _c6498: boolean = (_g6205 < (2 - _g6210));
                    if (_c6498) {
                      let _q6223 = false;
                      Q6224: {
                        const _a6225 = sp.adj4[v_t];
                        for (let _i6226 = 0; _i6226 < _a6225.length; _i6226++) {
                          const v_y = _a6225[_i6226];
                          const _t6227 = sp.adj4Edges[v_t][_i6226];
                          let _c6246: boolean = !((_t6227 === _wc6179 ? true : (_t6227 === _wc6177 ? true : (b.grid[_t6227] !== 0))));
                          if (_c6246) {
                            let _g6228 = 0;
                            G6229: {
                              const _a6230 = sp.adj4[v_t];
                              for (let _i6231 = 0; _i6231 < _a6230.length; _i6231++) {
                                const _t6232 = sp.adj4Edges[v_t][_i6231];
                                if (!(((_t6232 === _wc6179 ? _wd6180 : (_t6232 === _wc6177 ? _wd6178 : (b.grid[_t6232] || -1))) === 1))) continue;
                                _g6228++;
                              }
                            }
                            let _g6233 = 0;
                            G6234: {
                              for (let _i6235 = 0; _i6235 < 1; _i6235++) {
                                const v_k = v_t;
                                const _h6236 = clueAt(cl.number, v_k);
                                const _h6243 = (_h6236 + 1);
                                let _c6245: boolean = (_h6236 !== -1);
                                if (_c6245) {
                                  let _c6244: boolean = (_h5050 || (_h6236 === 1));
                                  if (!_c6244) {
                                    let _g6237 = 0;
                                    G6238: {
                                      const _t6239 = (_h6236 + 1);
                                      const _a6240 = cluesValued(cl.number, _t6239);
                                      for (let _i6241 = 0; _i6241 < _a6240.length; _i6241++) {
                                        const v_x = _a6240[_i6241];
                                        const _h6242 = clueAt(cl.number, v_x);
                                        if (!((_h6242 === _h6243))) continue;
                                        _g6237++;
                                      }
                                    }
                                    _c6244 = (_g6237 === 0);
                                  }
                                  _c6245 = _c6244;
                                }
                                if (!(_c6245)) continue;
                                _g6233++;
                              }
                            }
                            _c6246 = (_g6228 < (2 - _g6233));
                          }
                          let _c6266: boolean = _c6246;
                          if (_c6266) {
                            let _g6247 = 0;
                            G6248: {
                              const _a6250 = sp.adj4[v_y];
                              for (let _i6251 = 0; _i6251 < _a6250.length; _i6251++) {
                                const _t6252 = sp.adj4Edges[v_y][_i6251];
                                if (!(((_t6252 === _wc6179 ? _wd6180 : (_t6252 === _wc6177 ? _wd6178 : (b.grid[_t6252] || -1))) === 1))) continue;
                                _g6247++;
                              }
                            }
                            let _g6253 = 0;
                            G6254: {
                              for (let _i6255 = 0; _i6255 < 1; _i6255++) {
                                const v_k = v_y;
                                const _h6256 = clueAt(cl.number, v_k);
                                const _h6263 = (_h6256 + 1);
                                let _c6265: boolean = (_h6256 !== -1);
                                if (_c6265) {
                                  let _c6264: boolean = (_h5050 || (_h6256 === 1));
                                  if (!_c6264) {
                                    let _g6257 = 0;
                                    G6258: {
                                      const _t6259 = (_h6256 + 1);
                                      const _a6260 = cluesValued(cl.number, _t6259);
                                      for (let _i6261 = 0; _i6261 < _a6260.length; _i6261++) {
                                        const v_x = _a6260[_i6261];
                                        const _h6262 = clueAt(cl.number, v_x);
                                        if (!((_h6262 === _h6263))) continue;
                                        _g6257++;
                                      }
                                    }
                                    _c6264 = (_g6257 === 0);
                                  }
                                  _c6265 = _c6264;
                                }
                                if (!(_c6265)) continue;
                                _g6253++;
                              }
                            }
                            _c6266 = (_g6247 < (2 - _g6253));
                          }
                          let _c6349: boolean = _c6266;
                          if (_c6349) {
                            let _q6267 = true;
                            Q6268: {
                              _g6269.length = 0;
                              G6270: {
                                for (let _i6272 = 0; _i6272 < 1; _i6272++) {
                                  const v_x = v_t;
                                  const _h6273 = clueAt(cl.number, v_x);
                                  if (!((_h6273 !== -1))) continue;
                                  _g6269.push(v_x);
                                }
                              }
                              _g6274.length = 0;
                              _st6288.pass++;
                              G6275: {
                                const _a6295 = throughWhere(sp, v_t, (_te6290: number): boolean => { let _c6292: boolean = ((_te6290 === _wc6179 ? _wd6180 : (_te6290 === _wc6177 ? _wd6178 : (b.grid[_te6290] || -1))) === 1); if (_c6292) {   const _t6291 = sp.edgeEnds[2 * _te6290];   _c6292 = !((clueAt(cl.number, _t6291) !== -1)); } let _c6294: boolean = _c6292; if (_c6294) {   const _t6293 = sp.edgeEnds[2 * _te6290 + 1];   _c6294 = !((clueAt(cl.number, _t6293) !== -1)); } return _c6294; });
                                for (let _i6296 = 0; _i6296 < _a6295.length; _i6296++) {
                                  const v_t_6289 = _a6295[_i6296];
                                  const _h6299 = clueAt(cl.number, v_t_6289);
                                  const _h6300 = (_h6299 !== -1);
                                  const _h6301 = _h6300;
                                  const _h6302 = !(_h6301);
                                  const _a6297 = sp.adj4[v_t_6289];
                                  for (let _i6298 = 0; _i6298 < _a6297.length; _i6298++) {
                                    const v_x = _a6297[_i6298];
                                    const _h6303 = clueAt(cl.number, v_x);
                                    let _c6305: boolean = (_h6302 && (_h6303 !== -1));
                                    if (_c6305) {
                                      const _t6304 = sp.adj4Edges[v_t_6289][_i6298];
                                      _c6305 = ((_t6304 === _wc6179 ? _wd6180 : (_t6304 === _wc6177 ? _wd6178 : (b.grid[_t6304] || -1))) === 1);
                                    }
                                    if (!(_c6305)) continue;
                                    const _t6306 = v_x;
                                    if (_g6274.length < 16) { if (!_g6274.includes(_t6306)) _g6274.push(_t6306); } else addOnce(_g6274, _st6288, _t6306);
                                  }
                                }
                              }
                              const _a6307 = union(_g6269, _g6274);
                              for (let _i6308 = 0; _i6308 < _a6307.length; _i6308++) {
                                const v_p = _a6307[_i6308];
                                const _h6347 = clueAt(cl.number, v_p);
                                _g6309.length = 0;
                                G6310: {
                                  for (let _i6312 = 0; _i6312 < 1; _i6312++) {
                                    const v_x = v_y;
                                    const _h6313 = clueAt(cl.number, v_x);
                                    if (!((_h6313 !== -1))) continue;
                                    _g6309.push(v_x);
                                  }
                                }
                                _g6314.length = 0;
                                _st6327.pass++;
                                G6315: {
                                  const _a6333 = throughWhere(sp, v_y, (_te6328: number): boolean => { let _c6330: boolean = ((_te6328 === _wc6179 ? _wd6180 : (_te6328 === _wc6177 ? _wd6178 : (b.grid[_te6328] || -1))) === 1); if (_c6330) {   const _t6329 = sp.edgeEnds[2 * _te6328];   _c6330 = !((clueAt(cl.number, _t6329) !== -1)); } let _c6332: boolean = _c6330; if (_c6332) {   const _t6331 = sp.edgeEnds[2 * _te6328 + 1];   _c6332 = !((clueAt(cl.number, _t6331) !== -1)); } return _c6332; });
                                  for (let _i6334 = 0; _i6334 < _a6333.length; _i6334++) {
                                    const v_t = _a6333[_i6334];
                                    const _h6337 = clueAt(cl.number, v_t);
                                    const _h6338 = (_h6337 !== -1);
                                    const _h6339 = _h6338;
                                    const _h6340 = !(_h6339);
                                    const _a6335 = sp.adj4[v_t];
                                    for (let _i6336 = 0; _i6336 < _a6335.length; _i6336++) {
                                      const v_x = _a6335[_i6336];
                                      const _h6341 = clueAt(cl.number, v_x);
                                      let _c6343: boolean = (_h6340 && (_h6341 !== -1));
                                      if (_c6343) {
                                        const _t6342 = sp.adj4Edges[v_t][_i6336];
                                        _c6343 = ((_t6342 === _wc6179 ? _wd6180 : (_t6342 === _wc6177 ? _wd6178 : (b.grid[_t6342] || -1))) === 1);
                                      }
                                      if (!(_c6343)) continue;
                                      const _t6344 = v_x;
                                      if (_g6314.length < 16) { if (!_g6314.includes(_t6344)) _g6314.push(_t6344); } else addOnce(_g6314, _st6327, _t6344);
                                    }
                                  }
                                }
                                const _a6345 = union(_g6309, _g6314);
                                for (let _i6346 = 0; _i6346 < _a6345.length; _i6346++) {
                                  const v_q = _a6345[_i6346];
                                  const _h6348 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6347 - _h6348)) === cl.step))) {
                                    _q6267 = false;
                                    break Q6268;
                                  }
                                }
                              }
                            }
                            _c6349 = _q6267;
                          }
                          if (!((_c6349 && (_h5050 || !(throughWhere(sp, v_t, (_te6350: number): boolean => {  return ((_te6350 === _wc6179 ? _wd6180 : (_te6350 === _wc6177 ? _wd6178 : (b.grid[_te6350] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6351 = 0;
                          G6352: {
                            const _a6353 = sp.adj4[v_t];
                            for (let _i6354 = 0; _i6354 < _a6353.length; _i6354++) {
                              const _t6355 = sp.adj4Edges[v_t][_i6354];
                              if (!(((_t6355 === _wc6179 ? _wd6180 : (_t6355 === _wc6177 ? _wd6178 : (b.grid[_t6355] || -1))) === 1))) continue;
                              _g6351++;
                            }
                          }
                          let _g6356 = 0;
                          G6357: {
                            for (let _i6358 = 0; _i6358 < 1; _i6358++) {
                              const v_k = v_t;
                              const _h6359 = clueAt(cl.number, v_k);
                              const _h6366 = (_h6359 + 1);
                              let _c6368: boolean = (_h6359 !== -1);
                              if (_c6368) {
                                let _c6367: boolean = (_h5050 || (_h6359 === 1));
                                if (!_c6367) {
                                  let _g6360 = 0;
                                  G6361: {
                                    const _t6362 = (_h6359 + 1);
                                    const _a6363 = cluesValued(cl.number, _t6362);
                                    for (let _i6364 = 0; _i6364 < _a6363.length; _i6364++) {
                                      const v_x = _a6363[_i6364];
                                      const _h6365 = clueAt(cl.number, v_x);
                                      if (!((_h6365 === _h6366))) continue;
                                      _g6360++;
                                    }
                                  }
                                  _c6367 = (_g6360 === 0);
                                }
                                _c6368 = _c6367;
                              }
                              if (!(_c6368)) continue;
                              _g6356++;
                            }
                          }
                          let _c6497: boolean = ((_g6351 + 1) === (2 - _g6356));
                          if (!_c6497) {
                            let _q6369 = false;
                            Q6370: {
                              const _a6371 = sp.adj4[v_t];
                              const _n6372 = _i6226;
                              for (let _i6373 = 0; _i6373 < _n6372; _i6373++) {
                                const v_z = _a6371[_i6373];
                                const _t6374 = sp.adj4Edges[v_t][_i6373];
                                let _c6393: boolean = !((_t6374 === _wc6179 ? true : (_t6374 === _wc6177 ? true : (b.grid[_t6374] !== 0))));
                                if (_c6393) {
                                  let _g6375 = 0;
                                  G6376: {
                                    const _a6377 = sp.adj4[v_t];
                                    for (let _i6378 = 0; _i6378 < _a6377.length; _i6378++) {
                                      const _t6379 = sp.adj4Edges[v_t][_i6378];
                                      if (!(((_t6379 === _wc6179 ? _wd6180 : (_t6379 === _wc6177 ? _wd6178 : (b.grid[_t6379] || -1))) === 1))) continue;
                                      _g6375++;
                                    }
                                  }
                                  let _g6380 = 0;
                                  G6381: {
                                    for (let _i6382 = 0; _i6382 < 1; _i6382++) {
                                      const v_k = v_t;
                                      const _h6383 = clueAt(cl.number, v_k);
                                      const _h6390 = (_h6383 + 1);
                                      let _c6392: boolean = (_h6383 !== -1);
                                      if (_c6392) {
                                        let _c6391: boolean = (_h5050 || (_h6383 === 1));
                                        if (!_c6391) {
                                          let _g6384 = 0;
                                          G6385: {
                                            const _t6386 = (_h6383 + 1);
                                            const _a6387 = cluesValued(cl.number, _t6386);
                                            for (let _i6388 = 0; _i6388 < _a6387.length; _i6388++) {
                                              const v_x = _a6387[_i6388];
                                              const _h6389 = clueAt(cl.number, v_x);
                                              if (!((_h6389 === _h6390))) continue;
                                              _g6384++;
                                            }
                                          }
                                          _c6391 = (_g6384 === 0);
                                        }
                                        _c6392 = _c6391;
                                      }
                                      if (!(_c6392)) continue;
                                      _g6380++;
                                    }
                                  }
                                  _c6393 = (_g6375 < (2 - _g6380));
                                }
                                let _c6412: boolean = _c6393;
                                if (_c6412) {
                                  let _g6394 = 0;
                                  G6395: {
                                    const _a6396 = sp.adj4[v_z];
                                    for (let _i6397 = 0; _i6397 < _a6396.length; _i6397++) {
                                      const _t6398 = sp.adj4Edges[v_z][_i6397];
                                      if (!(((_t6398 === _wc6179 ? _wd6180 : (_t6398 === _wc6177 ? _wd6178 : (b.grid[_t6398] || -1))) === 1))) continue;
                                      _g6394++;
                                    }
                                  }
                                  let _g6399 = 0;
                                  G6400: {
                                    for (let _i6401 = 0; _i6401 < 1; _i6401++) {
                                      const v_k = v_z;
                                      const _h6402 = clueAt(cl.number, v_k);
                                      const _h6409 = (_h6402 + 1);
                                      let _c6411: boolean = (_h6402 !== -1);
                                      if (_c6411) {
                                        let _c6410: boolean = (_h5050 || (_h6402 === 1));
                                        if (!_c6410) {
                                          let _g6403 = 0;
                                          G6404: {
                                            const _t6405 = (_h6402 + 1);
                                            const _a6406 = cluesValued(cl.number, _t6405);
                                            for (let _i6407 = 0; _i6407 < _a6406.length; _i6407++) {
                                              const v_x = _a6406[_i6407];
                                              const _h6408 = clueAt(cl.number, v_x);
                                              if (!((_h6408 === _h6409))) continue;
                                              _g6403++;
                                            }
                                          }
                                          _c6410 = (_g6403 === 0);
                                        }
                                        _c6411 = _c6410;
                                      }
                                      if (!(_c6411)) continue;
                                      _g6399++;
                                    }
                                  }
                                  _c6412 = (_g6394 < (2 - _g6399));
                                }
                                let _c6495: boolean = _c6412;
                                if (_c6495) {
                                  let _q6413 = true;
                                  Q6414: {
                                    _g6415.length = 0;
                                    G6416: {
                                      for (let _i6418 = 0; _i6418 < 1; _i6418++) {
                                        const v_x = v_t;
                                        const _h6419 = clueAt(cl.number, v_x);
                                        if (!((_h6419 !== -1))) continue;
                                        _g6415.push(v_x);
                                      }
                                    }
                                    _g6420.length = 0;
                                    _st6434.pass++;
                                    G6421: {
                                      const _a6441 = throughWhere(sp, v_t, (_te6436: number): boolean => { let _c6438: boolean = ((_te6436 === _wc6179 ? _wd6180 : (_te6436 === _wc6177 ? _wd6178 : (b.grid[_te6436] || -1))) === 1); if (_c6438) {   const _t6437 = sp.edgeEnds[2 * _te6436];   _c6438 = !((clueAt(cl.number, _t6437) !== -1)); } let _c6440: boolean = _c6438; if (_c6440) {   const _t6439 = sp.edgeEnds[2 * _te6436 + 1];   _c6440 = !((clueAt(cl.number, _t6439) !== -1)); } return _c6440; });
                                      for (let _i6442 = 0; _i6442 < _a6441.length; _i6442++) {
                                        const v_t_6435 = _a6441[_i6442];
                                        const _h6445 = clueAt(cl.number, v_t_6435);
                                        const _h6446 = (_h6445 !== -1);
                                        const _h6447 = _h6446;
                                        const _h6448 = !(_h6447);
                                        const _a6443 = sp.adj4[v_t_6435];
                                        for (let _i6444 = 0; _i6444 < _a6443.length; _i6444++) {
                                          const v_x = _a6443[_i6444];
                                          const _h6449 = clueAt(cl.number, v_x);
                                          let _c6451: boolean = (_h6448 && (_h6449 !== -1));
                                          if (_c6451) {
                                            const _t6450 = sp.adj4Edges[v_t_6435][_i6444];
                                            _c6451 = ((_t6450 === _wc6179 ? _wd6180 : (_t6450 === _wc6177 ? _wd6178 : (b.grid[_t6450] || -1))) === 1);
                                          }
                                          if (!(_c6451)) continue;
                                          const _t6452 = v_x;
                                          if (_g6420.length < 16) { if (!_g6420.includes(_t6452)) _g6420.push(_t6452); } else addOnce(_g6420, _st6434, _t6452);
                                        }
                                      }
                                    }
                                    const _a6453 = union(_g6415, _g6420);
                                    for (let _i6454 = 0; _i6454 < _a6453.length; _i6454++) {
                                      const v_p = _a6453[_i6454];
                                      const _h6493 = clueAt(cl.number, v_p);
                                      _g6455.length = 0;
                                      G6456: {
                                        for (let _i6458 = 0; _i6458 < 1; _i6458++) {
                                          const v_x = v_z;
                                          const _h6459 = clueAt(cl.number, v_x);
                                          if (!((_h6459 !== -1))) continue;
                                          _g6455.push(v_x);
                                        }
                                      }
                                      _g6460.length = 0;
                                      _st6473.pass++;
                                      G6461: {
                                        const _a6479 = throughWhere(sp, v_z, (_te6474: number): boolean => { let _c6476: boolean = ((_te6474 === _wc6179 ? _wd6180 : (_te6474 === _wc6177 ? _wd6178 : (b.grid[_te6474] || -1))) === 1); if (_c6476) {   const _t6475 = sp.edgeEnds[2 * _te6474];   _c6476 = !((clueAt(cl.number, _t6475) !== -1)); } let _c6478: boolean = _c6476; if (_c6478) {   const _t6477 = sp.edgeEnds[2 * _te6474 + 1];   _c6478 = !((clueAt(cl.number, _t6477) !== -1)); } return _c6478; });
                                        for (let _i6480 = 0; _i6480 < _a6479.length; _i6480++) {
                                          const v_t = _a6479[_i6480];
                                          const _h6483 = clueAt(cl.number, v_t);
                                          const _h6484 = (_h6483 !== -1);
                                          const _h6485 = _h6484;
                                          const _h6486 = !(_h6485);
                                          const _a6481 = sp.adj4[v_t];
                                          for (let _i6482 = 0; _i6482 < _a6481.length; _i6482++) {
                                            const v_x = _a6481[_i6482];
                                            const _h6487 = clueAt(cl.number, v_x);
                                            let _c6489: boolean = (_h6486 && (_h6487 !== -1));
                                            if (_c6489) {
                                              const _t6488 = sp.adj4Edges[v_t][_i6482];
                                              _c6489 = ((_t6488 === _wc6179 ? _wd6180 : (_t6488 === _wc6177 ? _wd6178 : (b.grid[_t6488] || -1))) === 1);
                                            }
                                            if (!(_c6489)) continue;
                                            const _t6490 = v_x;
                                            if (_g6460.length < 16) { if (!_g6460.includes(_t6490)) _g6460.push(_t6490); } else addOnce(_g6460, _st6473, _t6490);
                                          }
                                        }
                                      }
                                      const _a6491 = union(_g6455, _g6460);
                                      for (let _i6492 = 0; _i6492 < _a6491.length; _i6492++) {
                                        const v_q = _a6491[_i6492];
                                        const _h6494 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6493 - _h6494)) === cl.step))) {
                                          _q6413 = false;
                                          break Q6414;
                                        }
                                      }
                                    }
                                  }
                                  _c6495 = _q6413;
                                }
                                if ((_c6495 && (_h5050 || !(throughWhere(sp, v_t, (_te6496: number): boolean => {  return ((_te6496 === _wc6179 ? _wd6180 : (_te6496 === _wc6177 ? _wd6178 : (b.grid[_te6496] || -1))) === 1); }).includes(v_z))))) {
                                  _q6369 = true;
                                  break Q6370;
                                }
                              }
                            }
                            _c6497 = _q6369;
                          }
                          if (_c6497) {
                            _q6223 = true;
                            break Q6224;
                          }
                        }
                      }
                      _c6498 = !(_q6223);
                    }
                    let _c6793: boolean = _c6498;
                    if (!_c6793) {
                      let _q6499 = false;
                      Q6500: {
                        const _a6501 = sp.adj4[v_t];
                        for (let _i6502 = 0; _i6502 < _a6501.length; _i6502++) {
                          const v_s = _a6501[_i6502];
                          let _g6503 = 0;
                          G6504: {
                            const _a6505 = sp.adj4[v_s];
                            for (let _i6506 = 0; _i6506 < _a6505.length; _i6506++) {
                              const _t6507 = sp.adj4Edges[v_s][_i6506];
                              if (!(((_t6507 === _wc6179 ? _wd6180 : (_t6507 === _wc6177 ? _wd6178 : (b.grid[_t6507] || -1))) === 1))) continue;
                              _g6503++;
                            }
                          }
                          let _g6508 = 0;
                          G6509: {
                            for (let _i6510 = 0; _i6510 < 1; _i6510++) {
                              const v_k = v_s;
                              const _h6511 = clueAt(cl.number, v_k);
                              const _h6518 = (_h6511 + 1);
                              let _c6520: boolean = (_h6511 !== -1);
                              if (_c6520) {
                                let _c6519: boolean = (_h5050 || (_h6511 === 1));
                                if (!_c6519) {
                                  let _g6512 = 0;
                                  G6513: {
                                    const _t6514 = (_h6511 + 1);
                                    const _a6515 = cluesValued(cl.number, _t6514);
                                    for (let _i6516 = 0; _i6516 < _a6515.length; _i6516++) {
                                      const v_x = _a6515[_i6516];
                                      const _h6517 = clueAt(cl.number, v_x);
                                      if (!((_h6517 === _h6518))) continue;
                                      _g6512++;
                                    }
                                  }
                                  _c6519 = (_g6512 === 0);
                                }
                                _c6520 = _c6519;
                              }
                              if (!(_c6520)) continue;
                              _g6508++;
                            }
                          }
                          let _c6792: boolean = (_g6503 < (2 - _g6508));
                          if (_c6792) {
                            let _q6521 = false;
                            Q6522: {
                              const _a6523 = sp.adj4[v_s];
                              for (let _i6524 = 0; _i6524 < _a6523.length; _i6524++) {
                                const v_y = _a6523[_i6524];
                                const _t6525 = sp.adj4Edges[v_s][_i6524];
                                let _c6544: boolean = !((_t6525 === _wc6179 ? true : (_t6525 === _wc6177 ? true : (b.grid[_t6525] !== 0))));
                                if (_c6544) {
                                  let _g6526 = 0;
                                  G6527: {
                                    const _a6528 = sp.adj4[v_s];
                                    for (let _i6529 = 0; _i6529 < _a6528.length; _i6529++) {
                                      const _t6530 = sp.adj4Edges[v_s][_i6529];
                                      if (!(((_t6530 === _wc6179 ? _wd6180 : (_t6530 === _wc6177 ? _wd6178 : (b.grid[_t6530] || -1))) === 1))) continue;
                                      _g6526++;
                                    }
                                  }
                                  let _g6531 = 0;
                                  G6532: {
                                    for (let _i6533 = 0; _i6533 < 1; _i6533++) {
                                      const v_k = v_s;
                                      const _h6534 = clueAt(cl.number, v_k);
                                      const _h6541 = (_h6534 + 1);
                                      let _c6543: boolean = (_h6534 !== -1);
                                      if (_c6543) {
                                        let _c6542: boolean = (_h5050 || (_h6534 === 1));
                                        if (!_c6542) {
                                          let _g6535 = 0;
                                          G6536: {
                                            const _t6537 = (_h6534 + 1);
                                            const _a6538 = cluesValued(cl.number, _t6537);
                                            for (let _i6539 = 0; _i6539 < _a6538.length; _i6539++) {
                                              const v_x = _a6538[_i6539];
                                              const _h6540 = clueAt(cl.number, v_x);
                                              if (!((_h6540 === _h6541))) continue;
                                              _g6535++;
                                            }
                                          }
                                          _c6542 = (_g6535 === 0);
                                        }
                                        _c6543 = _c6542;
                                      }
                                      if (!(_c6543)) continue;
                                      _g6531++;
                                    }
                                  }
                                  _c6544 = (_g6526 < (2 - _g6531));
                                }
                                let _c6564: boolean = _c6544;
                                if (_c6564) {
                                  let _g6545 = 0;
                                  G6546: {
                                    const _a6548 = sp.adj4[v_y];
                                    for (let _i6549 = 0; _i6549 < _a6548.length; _i6549++) {
                                      const _t6550 = sp.adj4Edges[v_y][_i6549];
                                      if (!(((_t6550 === _wc6179 ? _wd6180 : (_t6550 === _wc6177 ? _wd6178 : (b.grid[_t6550] || -1))) === 1))) continue;
                                      _g6545++;
                                    }
                                  }
                                  let _g6551 = 0;
                                  G6552: {
                                    for (let _i6553 = 0; _i6553 < 1; _i6553++) {
                                      const v_k = v_y;
                                      const _h6554 = clueAt(cl.number, v_k);
                                      const _h6561 = (_h6554 + 1);
                                      let _c6563: boolean = (_h6554 !== -1);
                                      if (_c6563) {
                                        let _c6562: boolean = (_h5050 || (_h6554 === 1));
                                        if (!_c6562) {
                                          let _g6555 = 0;
                                          G6556: {
                                            const _t6557 = (_h6554 + 1);
                                            const _a6558 = cluesValued(cl.number, _t6557);
                                            for (let _i6559 = 0; _i6559 < _a6558.length; _i6559++) {
                                              const v_x = _a6558[_i6559];
                                              const _h6560 = clueAt(cl.number, v_x);
                                              if (!((_h6560 === _h6561))) continue;
                                              _g6555++;
                                            }
                                          }
                                          _c6562 = (_g6555 === 0);
                                        }
                                        _c6563 = _c6562;
                                      }
                                      if (!(_c6563)) continue;
                                      _g6551++;
                                    }
                                  }
                                  _c6564 = (_g6545 < (2 - _g6551));
                                }
                                let _c6645: boolean = _c6564;
                                if (_c6645) {
                                  let _q6565 = true;
                                  Q6566: {
                                    _g6567.length = 0;
                                    G6568: {
                                      for (let _i6570 = 0; _i6570 < 1; _i6570++) {
                                        const v_x = v_s;
                                        const _h6571 = clueAt(cl.number, v_x);
                                        if (!((_h6571 !== -1))) continue;
                                        _g6567.push(v_x);
                                      }
                                    }
                                    _g6572.length = 0;
                                    _st6585.pass++;
                                    G6573: {
                                      const _a6591 = throughWhere(sp, v_s, (_te6586: number): boolean => { let _c6588: boolean = ((_te6586 === _wc6179 ? _wd6180 : (_te6586 === _wc6177 ? _wd6178 : (b.grid[_te6586] || -1))) === 1); if (_c6588) {   const _t6587 = sp.edgeEnds[2 * _te6586];   _c6588 = !((clueAt(cl.number, _t6587) !== -1)); } let _c6590: boolean = _c6588; if (_c6590) {   const _t6589 = sp.edgeEnds[2 * _te6586 + 1];   _c6590 = !((clueAt(cl.number, _t6589) !== -1)); } return _c6590; });
                                      for (let _i6592 = 0; _i6592 < _a6591.length; _i6592++) {
                                        const v_t = _a6591[_i6592];
                                        const _h6595 = clueAt(cl.number, v_t);
                                        const _h6596 = (_h6595 !== -1);
                                        const _h6597 = _h6596;
                                        const _h6598 = !(_h6597);
                                        const _a6593 = sp.adj4[v_t];
                                        for (let _i6594 = 0; _i6594 < _a6593.length; _i6594++) {
                                          const v_x = _a6593[_i6594];
                                          const _h6599 = clueAt(cl.number, v_x);
                                          let _c6601: boolean = (_h6598 && (_h6599 !== -1));
                                          if (_c6601) {
                                            const _t6600 = sp.adj4Edges[v_t][_i6594];
                                            _c6601 = ((_t6600 === _wc6179 ? _wd6180 : (_t6600 === _wc6177 ? _wd6178 : (b.grid[_t6600] || -1))) === 1);
                                          }
                                          if (!(_c6601)) continue;
                                          const _t6602 = v_x;
                                          if (_g6572.length < 16) { if (!_g6572.includes(_t6602)) _g6572.push(_t6602); } else addOnce(_g6572, _st6585, _t6602);
                                        }
                                      }
                                    }
                                    const _a6603 = union(_g6567, _g6572);
                                    for (let _i6604 = 0; _i6604 < _a6603.length; _i6604++) {
                                      const v_p = _a6603[_i6604];
                                      const _h6643 = clueAt(cl.number, v_p);
                                      _g6605.length = 0;
                                      G6606: {
                                        for (let _i6608 = 0; _i6608 < 1; _i6608++) {
                                          const v_x = v_y;
                                          const _h6609 = clueAt(cl.number, v_x);
                                          if (!((_h6609 !== -1))) continue;
                                          _g6605.push(v_x);
                                        }
                                      }
                                      _g6610.length = 0;
                                      _st6623.pass++;
                                      G6611: {
                                        const _a6629 = throughWhere(sp, v_y, (_te6624: number): boolean => { let _c6626: boolean = ((_te6624 === _wc6179 ? _wd6180 : (_te6624 === _wc6177 ? _wd6178 : (b.grid[_te6624] || -1))) === 1); if (_c6626) {   const _t6625 = sp.edgeEnds[2 * _te6624];   _c6626 = !((clueAt(cl.number, _t6625) !== -1)); } let _c6628: boolean = _c6626; if (_c6628) {   const _t6627 = sp.edgeEnds[2 * _te6624 + 1];   _c6628 = !((clueAt(cl.number, _t6627) !== -1)); } return _c6628; });
                                        for (let _i6630 = 0; _i6630 < _a6629.length; _i6630++) {
                                          const v_t = _a6629[_i6630];
                                          const _h6633 = clueAt(cl.number, v_t);
                                          const _h6634 = (_h6633 !== -1);
                                          const _h6635 = _h6634;
                                          const _h6636 = !(_h6635);
                                          const _a6631 = sp.adj4[v_t];
                                          for (let _i6632 = 0; _i6632 < _a6631.length; _i6632++) {
                                            const v_x = _a6631[_i6632];
                                            const _h6637 = clueAt(cl.number, v_x);
                                            let _c6639: boolean = (_h6636 && (_h6637 !== -1));
                                            if (_c6639) {
                                              const _t6638 = sp.adj4Edges[v_t][_i6632];
                                              _c6639 = ((_t6638 === _wc6179 ? _wd6180 : (_t6638 === _wc6177 ? _wd6178 : (b.grid[_t6638] || -1))) === 1);
                                            }
                                            if (!(_c6639)) continue;
                                            const _t6640 = v_x;
                                            if (_g6610.length < 16) { if (!_g6610.includes(_t6640)) _g6610.push(_t6640); } else addOnce(_g6610, _st6623, _t6640);
                                          }
                                        }
                                      }
                                      const _a6641 = union(_g6605, _g6610);
                                      for (let _i6642 = 0; _i6642 < _a6641.length; _i6642++) {
                                        const v_q = _a6641[_i6642];
                                        const _h6644 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6643 - _h6644)) === cl.step))) {
                                          _q6565 = false;
                                          break Q6566;
                                        }
                                      }
                                    }
                                  }
                                  _c6645 = _q6565;
                                }
                                if (!((_c6645 && (_h5050 || !(throughWhere(sp, v_s, (_te6646: number): boolean => {  return ((_te6646 === _wc6179 ? _wd6180 : (_te6646 === _wc6177 ? _wd6178 : (b.grid[_te6646] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g6647 = 0;
                                G6648: {
                                  const _a6649 = sp.adj4[v_s];
                                  for (let _i6650 = 0; _i6650 < _a6649.length; _i6650++) {
                                    const _t6651 = sp.adj4Edges[v_s][_i6650];
                                    if (!(((_t6651 === _wc6179 ? _wd6180 : (_t6651 === _wc6177 ? _wd6178 : (b.grid[_t6651] || -1))) === 1))) continue;
                                    _g6647++;
                                  }
                                }
                                let _g6652 = 0;
                                G6653: {
                                  for (let _i6654 = 0; _i6654 < 1; _i6654++) {
                                    const v_k = v_s;
                                    const _h6655 = clueAt(cl.number, v_k);
                                    const _h6662 = (_h6655 + 1);
                                    let _c6664: boolean = (_h6655 !== -1);
                                    if (_c6664) {
                                      let _c6663: boolean = (_h5050 || (_h6655 === 1));
                                      if (!_c6663) {
                                        let _g6656 = 0;
                                        G6657: {
                                          const _t6658 = (_h6655 + 1);
                                          const _a6659 = cluesValued(cl.number, _t6658);
                                          for (let _i6660 = 0; _i6660 < _a6659.length; _i6660++) {
                                            const v_x = _a6659[_i6660];
                                            const _h6661 = clueAt(cl.number, v_x);
                                            if (!((_h6661 === _h6662))) continue;
                                            _g6656++;
                                          }
                                        }
                                        _c6663 = (_g6656 === 0);
                                      }
                                      _c6664 = _c6663;
                                    }
                                    if (!(_c6664)) continue;
                                    _g6652++;
                                  }
                                }
                                let _c6791: boolean = ((_g6647 + 1) === (2 - _g6652));
                                if (!_c6791) {
                                  let _q6665 = false;
                                  Q6666: {
                                    const _a6667 = sp.adj4[v_s];
                                    const _n6668 = _i6524;
                                    for (let _i6669 = 0; _i6669 < _n6668; _i6669++) {
                                      const v_z = _a6667[_i6669];
                                      const _t6670 = sp.adj4Edges[v_s][_i6669];
                                      let _c6689: boolean = !((_t6670 === _wc6179 ? true : (_t6670 === _wc6177 ? true : (b.grid[_t6670] !== 0))));
                                      if (_c6689) {
                                        let _g6671 = 0;
                                        G6672: {
                                          const _a6673 = sp.adj4[v_s];
                                          for (let _i6674 = 0; _i6674 < _a6673.length; _i6674++) {
                                            const _t6675 = sp.adj4Edges[v_s][_i6674];
                                            if (!(((_t6675 === _wc6179 ? _wd6180 : (_t6675 === _wc6177 ? _wd6178 : (b.grid[_t6675] || -1))) === 1))) continue;
                                            _g6671++;
                                          }
                                        }
                                        let _g6676 = 0;
                                        G6677: {
                                          for (let _i6678 = 0; _i6678 < 1; _i6678++) {
                                            const v_k = v_s;
                                            const _h6679 = clueAt(cl.number, v_k);
                                            const _h6686 = (_h6679 + 1);
                                            let _c6688: boolean = (_h6679 !== -1);
                                            if (_c6688) {
                                              let _c6687: boolean = (_h5050 || (_h6679 === 1));
                                              if (!_c6687) {
                                                let _g6680 = 0;
                                                G6681: {
                                                  const _t6682 = (_h6679 + 1);
                                                  const _a6683 = cluesValued(cl.number, _t6682);
                                                  for (let _i6684 = 0; _i6684 < _a6683.length; _i6684++) {
                                                    const v_x = _a6683[_i6684];
                                                    const _h6685 = clueAt(cl.number, v_x);
                                                    if (!((_h6685 === _h6686))) continue;
                                                    _g6680++;
                                                  }
                                                }
                                                _c6687 = (_g6680 === 0);
                                              }
                                              _c6688 = _c6687;
                                            }
                                            if (!(_c6688)) continue;
                                            _g6676++;
                                          }
                                        }
                                        _c6689 = (_g6671 < (2 - _g6676));
                                      }
                                      let _c6708: boolean = _c6689;
                                      if (_c6708) {
                                        let _g6690 = 0;
                                        G6691: {
                                          const _a6692 = sp.adj4[v_z];
                                          for (let _i6693 = 0; _i6693 < _a6692.length; _i6693++) {
                                            const _t6694 = sp.adj4Edges[v_z][_i6693];
                                            if (!(((_t6694 === _wc6179 ? _wd6180 : (_t6694 === _wc6177 ? _wd6178 : (b.grid[_t6694] || -1))) === 1))) continue;
                                            _g6690++;
                                          }
                                        }
                                        let _g6695 = 0;
                                        G6696: {
                                          for (let _i6697 = 0; _i6697 < 1; _i6697++) {
                                            const v_k = v_z;
                                            const _h6698 = clueAt(cl.number, v_k);
                                            const _h6705 = (_h6698 + 1);
                                            let _c6707: boolean = (_h6698 !== -1);
                                            if (_c6707) {
                                              let _c6706: boolean = (_h5050 || (_h6698 === 1));
                                              if (!_c6706) {
                                                let _g6699 = 0;
                                                G6700: {
                                                  const _t6701 = (_h6698 + 1);
                                                  const _a6702 = cluesValued(cl.number, _t6701);
                                                  for (let _i6703 = 0; _i6703 < _a6702.length; _i6703++) {
                                                    const v_x = _a6702[_i6703];
                                                    const _h6704 = clueAt(cl.number, v_x);
                                                    if (!((_h6704 === _h6705))) continue;
                                                    _g6699++;
                                                  }
                                                }
                                                _c6706 = (_g6699 === 0);
                                              }
                                              _c6707 = _c6706;
                                            }
                                            if (!(_c6707)) continue;
                                            _g6695++;
                                          }
                                        }
                                        _c6708 = (_g6690 < (2 - _g6695));
                                      }
                                      let _c6789: boolean = _c6708;
                                      if (_c6789) {
                                        let _q6709 = true;
                                        Q6710: {
                                          _g6711.length = 0;
                                          G6712: {
                                            for (let _i6714 = 0; _i6714 < 1; _i6714++) {
                                              const v_x = v_s;
                                              const _h6715 = clueAt(cl.number, v_x);
                                              if (!((_h6715 !== -1))) continue;
                                              _g6711.push(v_x);
                                            }
                                          }
                                          _g6716.length = 0;
                                          _st6729.pass++;
                                          G6717: {
                                            const _a6735 = throughWhere(sp, v_s, (_te6730: number): boolean => { let _c6732: boolean = ((_te6730 === _wc6179 ? _wd6180 : (_te6730 === _wc6177 ? _wd6178 : (b.grid[_te6730] || -1))) === 1); if (_c6732) {   const _t6731 = sp.edgeEnds[2 * _te6730];   _c6732 = !((clueAt(cl.number, _t6731) !== -1)); } let _c6734: boolean = _c6732; if (_c6734) {   const _t6733 = sp.edgeEnds[2 * _te6730 + 1];   _c6734 = !((clueAt(cl.number, _t6733) !== -1)); } return _c6734; });
                                            for (let _i6736 = 0; _i6736 < _a6735.length; _i6736++) {
                                              const v_t = _a6735[_i6736];
                                              const _h6739 = clueAt(cl.number, v_t);
                                              const _h6740 = (_h6739 !== -1);
                                              const _h6741 = _h6740;
                                              const _h6742 = !(_h6741);
                                              const _a6737 = sp.adj4[v_t];
                                              for (let _i6738 = 0; _i6738 < _a6737.length; _i6738++) {
                                                const v_x = _a6737[_i6738];
                                                const _h6743 = clueAt(cl.number, v_x);
                                                let _c6745: boolean = (_h6742 && (_h6743 !== -1));
                                                if (_c6745) {
                                                  const _t6744 = sp.adj4Edges[v_t][_i6738];
                                                  _c6745 = ((_t6744 === _wc6179 ? _wd6180 : (_t6744 === _wc6177 ? _wd6178 : (b.grid[_t6744] || -1))) === 1);
                                                }
                                                if (!(_c6745)) continue;
                                                const _t6746 = v_x;
                                                if (_g6716.length < 16) { if (!_g6716.includes(_t6746)) _g6716.push(_t6746); } else addOnce(_g6716, _st6729, _t6746);
                                              }
                                            }
                                          }
                                          const _a6747 = union(_g6711, _g6716);
                                          for (let _i6748 = 0; _i6748 < _a6747.length; _i6748++) {
                                            const v_p = _a6747[_i6748];
                                            const _h6787 = clueAt(cl.number, v_p);
                                            _g6749.length = 0;
                                            G6750: {
                                              for (let _i6752 = 0; _i6752 < 1; _i6752++) {
                                                const v_x = v_z;
                                                const _h6753 = clueAt(cl.number, v_x);
                                                if (!((_h6753 !== -1))) continue;
                                                _g6749.push(v_x);
                                              }
                                            }
                                            _g6754.length = 0;
                                            _st6767.pass++;
                                            G6755: {
                                              const _a6773 = throughWhere(sp, v_z, (_te6768: number): boolean => { let _c6770: boolean = ((_te6768 === _wc6179 ? _wd6180 : (_te6768 === _wc6177 ? _wd6178 : (b.grid[_te6768] || -1))) === 1); if (_c6770) {   const _t6769 = sp.edgeEnds[2 * _te6768];   _c6770 = !((clueAt(cl.number, _t6769) !== -1)); } let _c6772: boolean = _c6770; if (_c6772) {   const _t6771 = sp.edgeEnds[2 * _te6768 + 1];   _c6772 = !((clueAt(cl.number, _t6771) !== -1)); } return _c6772; });
                                              for (let _i6774 = 0; _i6774 < _a6773.length; _i6774++) {
                                                const v_t = _a6773[_i6774];
                                                const _h6777 = clueAt(cl.number, v_t);
                                                const _h6778 = (_h6777 !== -1);
                                                const _h6779 = _h6778;
                                                const _h6780 = !(_h6779);
                                                const _a6775 = sp.adj4[v_t];
                                                for (let _i6776 = 0; _i6776 < _a6775.length; _i6776++) {
                                                  const v_x = _a6775[_i6776];
                                                  const _h6781 = clueAt(cl.number, v_x);
                                                  let _c6783: boolean = (_h6780 && (_h6781 !== -1));
                                                  if (_c6783) {
                                                    const _t6782 = sp.adj4Edges[v_t][_i6776];
                                                    _c6783 = ((_t6782 === _wc6179 ? _wd6180 : (_t6782 === _wc6177 ? _wd6178 : (b.grid[_t6782] || -1))) === 1);
                                                  }
                                                  if (!(_c6783)) continue;
                                                  const _t6784 = v_x;
                                                  if (_g6754.length < 16) { if (!_g6754.includes(_t6784)) _g6754.push(_t6784); } else addOnce(_g6754, _st6767, _t6784);
                                                }
                                              }
                                            }
                                            const _a6785 = union(_g6749, _g6754);
                                            for (let _i6786 = 0; _i6786 < _a6785.length; _i6786++) {
                                              const v_q = _a6785[_i6786];
                                              const _h6788 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h6787 - _h6788)) === cl.step))) {
                                                _q6709 = false;
                                                break Q6710;
                                              }
                                            }
                                          }
                                        }
                                        _c6789 = _q6709;
                                      }
                                      if ((_c6789 && (_h5050 || !(throughWhere(sp, v_s, (_te6790: number): boolean => {  return ((_te6790 === _wc6179 ? _wd6180 : (_te6790 === _wc6177 ? _wd6178 : (b.grid[_te6790] || -1))) === 1); }).includes(v_z))))) {
                                        _q6665 = true;
                                        break Q6666;
                                      }
                                    }
                                  }
                                  _c6791 = _q6665;
                                }
                                if (_c6791) {
                                  _q6521 = true;
                                  break Q6522;
                                }
                              }
                            }
                            _c6792 = !(_q6521);
                          }
                          if (_c6792) {
                            _q6499 = true;
                            break Q6500;
                          }
                        }
                      }
                      _c6793 = _q6499;
                    }
                    if (_c6793) {
                      _q6181 = true;
                      break Q6182;
                    }
                  }
                }
                _c6794 = _q6181;
              }
              _c6795 = _c6794;
            }
            if (!(_c6795)) continue;
            const _t6797 = minus(v_U, setOf(_h6796, v_i, v_j));
            const _t6798 = (_t6797.length > 0 ? _t6797[0] : -1);
            const _t6799 = _t6798;
            if (_g5653.length < 16) { if (!_g5653.includes(_t6799)) _g5653.push(_t6799); } else addOnce(_g5653, _st6169, _t6799);
          }
        }
      }
      const v_B = _g5653;
      const _h6834 = v_B.length;
      const _h6835 = (_h6834 === 3);
      _g6800.length = 0;
      G6801: {
        const _a6811 = v_U;
        for (let _i6812 = 0; _i6812 < _a6811.length; _i6812++) {
          const v_y = _a6811[_i6812];
          let _c6821: boolean = ((_i6812 === 0) && _h6814);
          if (!_c6821) {
            let _c6820: boolean = (_i6812 > 0);
            if (_c6820) {
              let _c6819: boolean = !(v_A.includes(v_y));
              if (!_c6819) {
                let _q6815 = false;
                Q6816: {
                  const _a6817 = v_U;
                  for (let _i6818 = 0; _i6818 < _a6817.length; _i6818++) {
                    const v_m = _a6817[_i6818];
                    if (!(((_i6818 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q6815 = true;
                      break Q6816;
                    }
                  }
                }
                _c6819 = _q6815;
              }
              _c6820 = _c6819;
            }
            _c6821 = _c6820;
          }
          if (!(_c6821)) continue;
          _g6800.push(v_y);
        }
      }
      const v_N = _g6800;
      const _h6843 = v_N.length;
      _g6822.length = 0;
      G6823: {
        const _a6832 = v_N;
        for (let _i6833 = 0; _i6833 < _a6832.length; _i6833++) {
          const v_y = _a6832[_i6833];
          let _c6841: boolean = ((v_U.indexOf(v_y) === 0) && _h6835);
          if (!_c6841) {
            let _c6840: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c6840) {
              let _q6836 = true;
              Q6837: {
                const _a6838 = v_U;
                for (let _i6839 = 0; _i6839 < _a6838.length; _i6839++) {
                  const v_m = _a6838[_i6839];
                  if (!(((_i6839 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q6836 = false;
                    break Q6837;
                  }
                }
              }
              _c6840 = _q6836;
            }
            _c6841 = _c6840;
          }
          if (!(_c6841)) continue;
          _g6822.push(v_y);
        }
      }
      const v_P = _g6822;
      const _h6844 = v_P.length;
      L6842: {
        const v_X = minus(v_U, v_N);
        const _h6845 = v_X.length;
        if (!((((_h6843 === 0) || (_h6844 > 0)) || (_h6845 > 0)))) break L6842;
        facts.length = 0;
        changed = false;
        let _c6851: boolean = (_h6843 > 0);
        if (_c6851) {
          let _q6846 = true;
          Q6847: {
            const _a6848 = v_P;
            for (let _i6849 = 0; _i6849 < _a6848.length; _i6849++) {
              const v_y = _a6848[_i6849];
              const _t6850 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t6850] !== 0)) { if (fire === null) { b.placeAt(_t6850, 1); changed = true; } else facts.push(PLACE, _t6850, 1); }
              if (!(true)) {
                _q6846 = false;
                break Q6847;
              }
            }
          }
          _c6851 = _q6846;
        }
        let _c6858: boolean = _c6851;
        if (_c6858) {
          let _c6857: boolean = !((_h6844 === 0));
          if (!_c6857) {
            let _q6852 = true;
            Q6853: {
              const _a6854 = v_X;
              for (let _i6855 = 0; _i6855 < _a6854.length; _i6855++) {
                const v_y = _a6854[_i6855];
                const _t6856 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t6856] !== 0)) { if (fire === null) { b.placeAt(_t6856, 2); changed = true; } else facts.push(PLACE, _t6856, 2); }
                if (!(true)) {
                  _q6852 = false;
                  break Q6853;
                }
              }
            }
            _c6857 = _q6852;
          }
          _c6858 = _c6857;
        }
        if (!(_c6858)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, U: v_U.slice(), A: v_A.slice(), B: v_B.slice(), N: v_N.slice(), P: v_P.slice(), X: v_X.slice() }, facts)) return 1;
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
  let _g3 = 0;
  G4: {
    for (let _i5 = 0; _i5 < 1; _i5++) {
      const v_k = v_c;
      let _c12: boolean = (clueAt(cl.number, v_k) !== -1);
      if (_c12) {
        let _c11: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
        if (!_c11) {
          let _g6 = 0;
          G7: {
            const _t8 = (clueAt(cl.number, v_k) + 1);
            const _a9 = cluesValued(cl.number, _t8);
            for (let _i10 = 0; _i10 < _a9.length; _i10++) {
              const v_x = _a9[_i10];
              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
              _g6++;
            }
          }
          _c11 = (_g6 === 0);
        }
        _c12 = _c11;
      }
      if (!(_c12)) continue;
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
  let _g21 = 0;
  G22: {
    const _a23 = sp.adj4[v_c];
    for (let _i24 = 0; _i24 < _a23.length; _i24++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i24]] || -1) === 1))) continue;
      _g21++;
    }
  }
  const _made = (_g21 < takes(sp, cl, v_c));
  _kept[v_c] = _made;
  return _made;
}

const nearestKept = keptStore<readonly number[]>();

/** `nearest(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function nearest(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearestKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g27: number[] = [];
  G28: {
    for (let _i30 = 0; _i30 < 1; _i30++) {
      const v_x = v_c;
      if (!((clueAt(cl.number, v_x) !== -1))) continue;
      _g27.push(v_x);
    }
  }
  const _g31: number[] = [];
  G32: {
    const _a47 = throughWhere(sp, v_c, (_te42: number): boolean => { let _c44: boolean = ((b.grid[_te42] || -1) === 1); if (_c44) {   const _t43 = sp.edgeEnds[2 * _te42];   _c44 = !((clueAt(cl.number, _t43) !== -1)); } let _c46: boolean = _c44; if (_c46) {   const _t45 = sp.edgeEnds[2 * _te42 + 1];   _c46 = !((clueAt(cl.number, _t45) !== -1)); } return _c46; });
    for (let _i48 = 0; _i48 < _a47.length; _i48++) {
      const v_t = _a47[_i48];
      const _a49 = sp.adj4[v_t];
      for (let _i50 = 0; _i50 < _a49.length; _i50++) {
        const v_x = _a49[_i50];
        if (!(((!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1)) && ((b.grid[sp.adj4Edges[v_t][_i50]] || -1) === 1)))) continue;
        if (!_g31.includes(v_x)) _g31.push(v_x);
      }
    }
  }
  const _made = union(_g27, _g31);
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g17: number[] = [];
  G18: {
    const _a57 = sp.adj4[v_c];
    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
      const v_y = _a57[_i58];
      let _c65: boolean = ((!((b.grid[sp.adj4Edges[v_c][_i58]] !== 0)) && spare(b, sp, cl, v_c)) && spare(b, sp, cl, v_y));
      if (_c65) {
        let _q59 = true;
        Q60: {
          const _a61 = nearest(b, sp, cl, v_c);
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_p = _a61[_i62];
            const _a63 = nearest(b, sp, cl, v_y);
            for (let _i64 = 0; _i64 < _a63.length; _i64++) {
              const v_q = _a63[_i64];
              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                _q59 = false;
                break Q60;
              }
            }
          }
        }
        _c65 = _q59;
      }
      if (!((_c65 && ((cl.step === 0) || !(throughWhere(sp, v_c, (_te66: number): boolean => {  return ((b.grid[_te66] || -1) === 1); }).includes(v_y)))))) continue;
      _g17.push(v_y);
    }
  }
  const _made = _g17;
  _kept[v_c] = _made;
  return _made;
}

const pieceKept = keptStore<readonly number[]>();

/** `piece(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function piece(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = pieceKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _made = throughWhere(sp, v_c, (_te84: number): boolean => {  return ((b.grid[_te84] || -1) === 1); });
  _kept[v_c] = _made;
  return _made;
}

const meetsMarkedKept = new Map<number, boolean>();

/** `meets(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetsMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _q88 = true;
  Q89: {
    const _a90 = nearest(b, sp, cl, v_a);
    for (let _i91 = 0; _i91 < _a90.length; _i91++) {
      const v_p = _a90[_i91];
      const _a92 = nearest(b, sp, cl, v_b);
      for (let _i93 = 0; _i93 < _a92.length; _i93++) {
        const v_q = _a92[_i93];
        if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
          _q88 = false;
          break Q89;
        }
      }
    }
  }
  const _made = _q88;
  meetsMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const liveMarkedKept = new Map<number, boolean>();

/** `live(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function liveMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = liveMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  const _made = ((((!((b.grid[sp.edgeOf(v_a, v_b)] !== 0)) && spare(b, sp, cl, v_a)) && spare(b, sp, cl, v_b)) && meetsMarked(b, sp, cl, cands, v_a, v_b)) && ((cl.step === 0) || !(throughWhere(sp, v_a, (_te104: number): boolean => {  return ((b.grid[_te104] || -1) === 1); }).includes(v_b))));
  liveMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}
