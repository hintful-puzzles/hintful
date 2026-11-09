// Compiled by `npm run describe` from src/games/path/path.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, keptStore, minus, rangeMask, sameSet, setOf, stamps, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g6876: number[] = [];
  const _g6881: number[] = [];
  const _st6892 = stamps();
  const _g6942: number[] = [];
  const _g6947: number[] = [];
  const _st6958 = stamps();
  const _domain = rangeMask(1, 2);
  const _k6870 = takesKept.board(cl);
  const _h6925 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q6861 = true;
  Q6862: {
    const _a6863 = sp.cells;
    for (let _i6864 = 0; _i6864 < _a6863.length; _i6864++) {
      const v_c = _a6863[_i6864];
      let _g6865 = 0;
      G6866: {
        const _a6867 = sp.adj4[v_c];
        for (let _i6868 = 0; _i6868 < _a6867.length; _i6868++) {
          const _h6869 = (g[sp.adj4Edges[v_c][_i6868]] || -1);
          if (!((_h6869 === 1))) continue;
          _g6865++;
        }
      }
      if (!((_g6865 === (_k6870[v_c] ?? takes(sp, cl, v_c))))) {
        _q6861 = false;
        break Q6862;
      }
    }
  }
  if (!(_q6861)) return false;
  let _q6871 = true;
  Q6872: {
    const _a6873 = sp.cells;
    for (let _i6874 = 0; _i6874 < _a6873.length; _i6874++) {
      const v_c = _a6873[_i6874];
      const _h6875 = clueAt(cl.number, v_c);
      if (!(!((_h6875 !== -1)))) continue;
      _g6876.length = 0;
      G6877: {
        for (let _i6879 = 0; _i6879 < 1; _i6879++) {
          const v_x = v_c;
          const _h6880 = clueAt(cl.number, v_x);
          if (!((_h6880 !== -1))) continue;
          _g6876.push(v_x);
        }
      }
      _g6881.length = 0;
      _st6892.pass++;
      G6882: {
        const _a6898 = throughWhere(sp, v_c, (_te6893: number): boolean => { let _c6895: boolean = ((g[_te6893] || -1) === 1); if (_c6895) {   const _t6894 = sp.edgeEnds[2 * _te6893];   _c6895 = !((clueAt(cl.number, _t6894) !== -1)); } let _c6897: boolean = _c6895; if (_c6897) {   const _t6896 = sp.edgeEnds[2 * _te6893 + 1];   _c6897 = !((clueAt(cl.number, _t6896) !== -1)); } return _c6897; });
        for (let _i6899 = 0; _i6899 < _a6898.length; _i6899++) {
          const v_t = _a6898[_i6899];
          const _h6902 = clueAt(cl.number, v_t);
          const _h6903 = (_h6902 !== -1);
          const _h6904 = _h6903;
          const _h6905 = !(_h6904);
          const _a6900 = sp.adj4[v_t];
          for (let _i6901 = 0; _i6901 < _a6900.length; _i6901++) {
            const v_x = _a6900[_i6901];
            const _h6906 = clueAt(cl.number, v_x);
            const _h6907 = (g[sp.adj4Edges[v_t][_i6901]] || -1);
            if (!(((_h6905 && (_h6906 !== -1)) && (_h6907 === 1)))) continue;
            const _t6908 = v_x;
            if (_g6881.length < 16) { if (!_g6881.includes(_t6908)) _g6881.push(_t6908); } else addOnce(_g6881, _st6892, _t6908);
          }
        }
      }
      if (!((union(_g6876, _g6881).length === 2))) {
        _q6871 = false;
        break Q6872;
      }
    }
  }
  if (!(_q6871)) return false;
  let _c6914: boolean = (cl.step === 0);
  if (!_c6914) {
    let _q6909 = false;
    Q6910: {
      const _a6911 = sp.cells;
      for (let _i6912 = 0; _i6912 < _a6911.length; _i6912++) {
        const v_x = _a6911[_i6912];
        const _h6913 = clueAt(cl.number, v_x);
        if ((_h6913 === 2)) {
          _q6909 = true;
          break Q6910;
        }
      }
    }
    _c6914 = _q6909;
  }
  let _c6934: boolean = _c6914;
  if (_c6934) {
    let _q6915 = true;
    Q6916: {
      const _a6917 = sp.cells;
      for (let _i6918 = 0; _i6918 < _a6917.length; _i6918++) {
        const v_x = _a6917[_i6918];
        const _h6919 = clueAt(cl.number, v_x);
        if (!((_h6919 !== -1))) continue;
        const _h6931 = (_h6919 - 1);
        let _g6920 = 0;
        G6921: {
          const _a6922 = cluesValued(cl.number, _h6919);
          for (let _i6923 = 0; _i6923 < _a6922.length; _i6923++) {
            const v_y = _a6922[_i6923];
            const _h6924 = clueAt(cl.number, v_y);
            if (!((_h6924 === _h6919))) continue;
            _g6920++;
          }
        }
        let _c6933: boolean = (_g6920 === _h6925);
        if (_c6933) {
          let _c6932: boolean = (_h6919 === 1);
          if (!_c6932) {
            let _q6926 = false;
            Q6927: {
              const _a6928 = sp.cells;
              for (let _i6929 = 0; _i6929 < _a6928.length; _i6929++) {
                const v_y = _a6928[_i6929];
                const _h6930 = clueAt(cl.number, v_y);
                if ((_h6930 === _h6931)) {
                  _q6926 = true;
                  break Q6927;
                }
              }
            }
            _c6932 = _q6926;
          }
          _c6933 = _c6932;
        }
        if (!(_c6933)) {
          _q6915 = false;
          break Q6916;
        }
      }
    }
    _c6934 = _q6915;
  }
  if (!(_c6934)) return false;
  for (let _k6935 = 0; _k6935 < cl.number.at.length; _k6935++) {
    const _at6936 = cl.number.at[_k6935];
    let _q6938 = true;
    Q6939: {
      const _a6940 = sp.adj4[_at6936];
      for (let _i6941 = 0; _i6941 < _a6940.length; _i6941++) {
        const v_y = _a6940[_i6941];
        if (!(((g[sp.adj4Edges[_at6936][_i6941]] || -1) === 1))) continue;
        _g6942.length = 0;
        G6943: {
          for (let _i6945 = 0; _i6945 < 1; _i6945++) {
            const v_x = v_y;
            const _h6946 = clueAt(cl.number, v_x);
            if (!((_h6946 !== -1))) continue;
            _g6942.push(v_x);
          }
        }
        _g6947.length = 0;
        _st6958.pass++;
        G6948: {
          const _a6964 = throughWhere(sp, v_y, (_te6959: number): boolean => { let _c6961: boolean = ((g[_te6959] || -1) === 1); if (_c6961) {   const _t6960 = sp.edgeEnds[2 * _te6959];   _c6961 = !((clueAt(cl.number, _t6960) !== -1)); } let _c6963: boolean = _c6961; if (_c6963) {   const _t6962 = sp.edgeEnds[2 * _te6959 + 1];   _c6963 = !((clueAt(cl.number, _t6962) !== -1)); } return _c6963; });
          for (let _i6965 = 0; _i6965 < _a6964.length; _i6965++) {
            const v_t = _a6964[_i6965];
            const _h6968 = clueAt(cl.number, v_t);
            const _h6969 = (_h6968 !== -1);
            const _h6970 = _h6969;
            const _h6971 = !(_h6970);
            const _a6966 = sp.adj4[v_t];
            for (let _i6967 = 0; _i6967 < _a6966.length; _i6967++) {
              const v_x = _a6966[_i6967];
              const _h6972 = clueAt(cl.number, v_x);
              const _h6973 = (g[sp.adj4Edges[v_t][_i6967]] || -1);
              if (!(((_h6971 && (_h6972 !== -1)) && (_h6973 === 1)))) continue;
              const _t6974 = v_x;
              if (_g6947.length < 16) { if (!_g6947.includes(_t6974)) _g6947.push(_t6974); } else addOnce(_g6947, _st6958, _t6974);
            }
          }
        }
        const _a6975 = union(_g6942, _g6947);
        for (let _i6976 = 0; _i6976 < _a6975.length; _i6976++) {
          const v_q = _a6975[_i6976];
          if (!((v_q !== _at6936))) continue;
          const _h6978 = clueAt(cl.number, v_q);
          const _h6977 = clueAt(cl.number, _at6936);
          if (!((Math.abs((_h6977 - _h6978)) === cl.step))) {
            _q6938 = false;
            break Q6939;
          }
        }
      }
    }
    if (!(_q6938)) return false;
  }
  for (let _k6979 = 0; _k6979 < cl.wall.at.length; _k6979++) {
    const _at6980 = cl.wall.at[_k6979];
    if (!(((g[_at6980] || -1) === 2))) return false;
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
const _st1881 = stamps();
const _st1920 = stamps();
const _st2027 = stamps();
const _st2066 = stamps();
const _st2178 = stamps();
const _st2216 = stamps();
const _st2322 = stamps();
const _st2360 = stamps();

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g1862: number[] = [];
  const _g1867: number[] = [];
  const _g1902: number[] = [];
  const _g1907: number[] = [];
  const _g2008: number[] = [];
  const _g2013: number[] = [];
  const _g2048: number[] = [];
  const _g2053: number[] = [];
  const _g2160: number[] = [];
  const _g2165: number[] = [];
  const _g2198: number[] = [];
  const _g2203: number[] = [];
  const _g2304: number[] = [];
  const _g2309: number[] = [];
  const _g2342: number[] = [];
  const _g2347: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k1754 = takesKept.board(cl);
  const _h1787 = (cl.step === 0);
  if (pairBreaksCands.length < sp.edges.length) pairBreaksCands = new Int32Array(sp.edges.length);
  const cands = pairBreaksCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a1752 = sp.cells;
  R1:
  for (let _i1753 = 0; _i1753 < _a1752.length; _i1753++) {
    const v_c = _a1752[_i1753];
    const _m177_0 = b.made[0];
    let _g1755 = 0;
    G1756: {
      const _a1757 = sp.adj4[v_c];
      for (let _i1758 = 0; _i1758 < _a1757.length; _i1758++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i1758]] || -1) === 1))) continue;
        _g1755++;
      }
    }
    if (!((((_k1754[v_c] ?? takes(sp, cl, v_c)) - _g1755) === 2))) continue;
    const _h1765 = clueAt(cl.number, v_c);
    const _h1766 = (_h1765 !== -1);
    const _h1767 = _h1766;
    const _h1768 = !(_h1767);
    const _m182_1 = b.made[1];
    L1759: {
      const v_U = ways(b, sp, cl, v_c);
      const _h1760 = v_U.length;
      if (!((_h1760 === 3))) break L1759;
      const _a1761 = v_U;
      for (let _i1762 = 0; _i1762 < _a1761.length; _i1762++) {
        const v_k = _a1761[_i1762];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L1763: {
          const v_j = (v_I[1] ?? -1);
          let _c2387: boolean = ((throughWhere(sp, v_i, (_te1764: number): boolean => {  return ((b.grid[_te1764] || -1) === 1); }).includes(v_j)) || (_h1768 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
          if (!_c2387) {
            const _wc1769 = sp.edgeOf(v_c, v_i);
            const _wd1770 = 1;
            const _wc1771 = sp.edgeOf(v_c, v_j);
            const _wd1772 = 1;
            let _q1773 = false;
            Q1774: {
              const _a1776 = throughWhere(sp, v_c, (_te1775: number): boolean => {  return ((_te1775 === _wc1771 ? _wd1772 : (_te1775 === _wc1769 ? _wd1770 : (b.grid[_te1775] || -1))) === 1); });
              for (let _i1777 = 0; _i1777 < _a1776.length; _i1777++) {
                const v_t = _a1776[_i1777];
                let _c1797: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                if (!_c1797) {
                  let _g1778 = 0;
                  G1779: {
                    const _a1780 = sp.adj4[v_t];
                    for (let _i1781 = 0; _i1781 < _a1780.length; _i1781++) {
                      const _t1782 = sp.adj4Edges[v_t][_i1781];
                      if (!(((_t1782 === _wc1771 ? _wd1772 : (_t1782 === _wc1769 ? _wd1770 : (b.grid[_t1782] || -1))) === 1))) continue;
                      _g1778++;
                    }
                  }
                  let _g1783 = 0;
                  G1784: {
                    for (let _i1785 = 0; _i1785 < 1; _i1785++) {
                      const v_k = v_t;
                      const _h1786 = clueAt(cl.number, v_k);
                      const _h1794 = (_h1786 + 1);
                      let _c1796: boolean = (_h1786 !== -1);
                      if (_c1796) {
                        let _c1795: boolean = (_h1787 || (_h1786 === 1));
                        if (!_c1795) {
                          let _g1788 = 0;
                          G1789: {
                            const _t1790 = (_h1786 + 1);
                            const _a1791 = cluesValued(cl.number, _t1790);
                            for (let _i1792 = 0; _i1792 < _a1791.length; _i1792++) {
                              const v_x = _a1791[_i1792];
                              const _h1793 = clueAt(cl.number, v_x);
                              if (!((_h1793 === _h1794))) continue;
                              _g1788++;
                            }
                          }
                          _c1795 = (_g1788 === 0);
                        }
                        _c1796 = _c1795;
                      }
                      if (!(_c1796)) continue;
                      _g1783++;
                    }
                  }
                  _c1797 = (_g1778 < (2 - _g1783));
                }
                if (!(_c1797)) continue;
                let _g1798 = 0;
                G1799: {
                  const _a1800 = sp.adj4[v_t];
                  for (let _i1801 = 0; _i1801 < _a1800.length; _i1801++) {
                    const _t1802 = sp.adj4Edges[v_t][_i1801];
                    if (!(((_t1802 === _wc1771 ? _wd1772 : (_t1802 === _wc1769 ? _wd1770 : (b.grid[_t1802] || -1))) === 1))) continue;
                    _g1798++;
                  }
                }
                let _g1803 = 0;
                G1804: {
                  for (let _i1805 = 0; _i1805 < 1; _i1805++) {
                    const v_k = v_t;
                    const _h1806 = clueAt(cl.number, v_k);
                    const _h1813 = (_h1806 + 1);
                    let _c1815: boolean = (_h1806 !== -1);
                    if (_c1815) {
                      let _c1814: boolean = (_h1787 || (_h1806 === 1));
                      if (!_c1814) {
                        let _g1807 = 0;
                        G1808: {
                          const _t1809 = (_h1806 + 1);
                          const _a1810 = cluesValued(cl.number, _t1809);
                          for (let _i1811 = 0; _i1811 < _a1810.length; _i1811++) {
                            const v_x = _a1810[_i1811];
                            const _h1812 = clueAt(cl.number, v_x);
                            if (!((_h1812 === _h1813))) continue;
                            _g1807++;
                          }
                        }
                        _c1814 = (_g1807 === 0);
                      }
                      _c1815 = _c1814;
                    }
                    if (!(_c1815)) continue;
                    _g1803++;
                  }
                }
                let _c2091: boolean = (_g1798 < (2 - _g1803));
                if (_c2091) {
                  let _q1816 = false;
                  Q1817: {
                    const _a1818 = sp.adj4[v_t];
                    for (let _i1819 = 0; _i1819 < _a1818.length; _i1819++) {
                      const v_y = _a1818[_i1819];
                      const _t1820 = sp.adj4Edges[v_t][_i1819];
                      let _c1839: boolean = !((_t1820 === _wc1771 ? true : (_t1820 === _wc1769 ? true : (b.grid[_t1820] !== 0))));
                      if (_c1839) {
                        let _g1821 = 0;
                        G1822: {
                          const _a1823 = sp.adj4[v_t];
                          for (let _i1824 = 0; _i1824 < _a1823.length; _i1824++) {
                            const _t1825 = sp.adj4Edges[v_t][_i1824];
                            if (!(((_t1825 === _wc1771 ? _wd1772 : (_t1825 === _wc1769 ? _wd1770 : (b.grid[_t1825] || -1))) === 1))) continue;
                            _g1821++;
                          }
                        }
                        let _g1826 = 0;
                        G1827: {
                          for (let _i1828 = 0; _i1828 < 1; _i1828++) {
                            const v_k = v_t;
                            const _h1829 = clueAt(cl.number, v_k);
                            const _h1836 = (_h1829 + 1);
                            let _c1838: boolean = (_h1829 !== -1);
                            if (_c1838) {
                              let _c1837: boolean = (_h1787 || (_h1829 === 1));
                              if (!_c1837) {
                                let _g1830 = 0;
                                G1831: {
                                  const _t1832 = (_h1829 + 1);
                                  const _a1833 = cluesValued(cl.number, _t1832);
                                  for (let _i1834 = 0; _i1834 < _a1833.length; _i1834++) {
                                    const v_x = _a1833[_i1834];
                                    const _h1835 = clueAt(cl.number, v_x);
                                    if (!((_h1835 === _h1836))) continue;
                                    _g1830++;
                                  }
                                }
                                _c1837 = (_g1830 === 0);
                              }
                              _c1838 = _c1837;
                            }
                            if (!(_c1838)) continue;
                            _g1826++;
                          }
                        }
                        _c1839 = (_g1821 < (2 - _g1826));
                      }
                      let _c1859: boolean = _c1839;
                      if (_c1859) {
                        let _g1840 = 0;
                        G1841: {
                          const _a1843 = sp.adj4[v_y];
                          for (let _i1844 = 0; _i1844 < _a1843.length; _i1844++) {
                            const _t1845 = sp.adj4Edges[v_y][_i1844];
                            if (!(((_t1845 === _wc1771 ? _wd1772 : (_t1845 === _wc1769 ? _wd1770 : (b.grid[_t1845] || -1))) === 1))) continue;
                            _g1840++;
                          }
                        }
                        let _g1846 = 0;
                        G1847: {
                          for (let _i1848 = 0; _i1848 < 1; _i1848++) {
                            const v_k = v_y;
                            const _h1849 = clueAt(cl.number, v_k);
                            const _h1856 = (_h1849 + 1);
                            let _c1858: boolean = (_h1849 !== -1);
                            if (_c1858) {
                              let _c1857: boolean = (_h1787 || (_h1849 === 1));
                              if (!_c1857) {
                                let _g1850 = 0;
                                G1851: {
                                  const _t1852 = (_h1849 + 1);
                                  const _a1853 = cluesValued(cl.number, _t1852);
                                  for (let _i1854 = 0; _i1854 < _a1853.length; _i1854++) {
                                    const v_x = _a1853[_i1854];
                                    const _h1855 = clueAt(cl.number, v_x);
                                    if (!((_h1855 === _h1856))) continue;
                                    _g1850++;
                                  }
                                }
                                _c1857 = (_g1850 === 0);
                              }
                              _c1858 = _c1857;
                            }
                            if (!(_c1858)) continue;
                            _g1846++;
                          }
                        }
                        _c1859 = (_g1840 < (2 - _g1846));
                      }
                      let _c1942: boolean = _c1859;
                      if (_c1942) {
                        let _q1860 = true;
                        Q1861: {
                          _g1862.length = 0;
                          G1863: {
                            for (let _i1865 = 0; _i1865 < 1; _i1865++) {
                              const v_x = v_t;
                              const _h1866 = clueAt(cl.number, v_x);
                              if (!((_h1866 !== -1))) continue;
                              _g1862.push(v_x);
                            }
                          }
                          _g1867.length = 0;
                          _st1881.pass++;
                          G1868: {
                            const _a1888 = throughWhere(sp, v_t, (_te1883: number): boolean => { let _c1885: boolean = ((_te1883 === _wc1771 ? _wd1772 : (_te1883 === _wc1769 ? _wd1770 : (b.grid[_te1883] || -1))) === 1); if (_c1885) {   const _t1884 = sp.edgeEnds[2 * _te1883];   _c1885 = !((clueAt(cl.number, _t1884) !== -1)); } let _c1887: boolean = _c1885; if (_c1887) {   const _t1886 = sp.edgeEnds[2 * _te1883 + 1];   _c1887 = !((clueAt(cl.number, _t1886) !== -1)); } return _c1887; });
                            for (let _i1889 = 0; _i1889 < _a1888.length; _i1889++) {
                              const v_t_1882 = _a1888[_i1889];
                              const _h1892 = clueAt(cl.number, v_t_1882);
                              const _h1893 = (_h1892 !== -1);
                              const _h1894 = _h1893;
                              const _h1895 = !(_h1894);
                              const _a1890 = sp.adj4[v_t_1882];
                              for (let _i1891 = 0; _i1891 < _a1890.length; _i1891++) {
                                const v_x = _a1890[_i1891];
                                const _h1896 = clueAt(cl.number, v_x);
                                let _c1898: boolean = (_h1895 && (_h1896 !== -1));
                                if (_c1898) {
                                  const _t1897 = sp.adj4Edges[v_t_1882][_i1891];
                                  _c1898 = ((_t1897 === _wc1771 ? _wd1772 : (_t1897 === _wc1769 ? _wd1770 : (b.grid[_t1897] || -1))) === 1);
                                }
                                if (!(_c1898)) continue;
                                const _t1899 = v_x;
                                if (_g1867.length < 16) { if (!_g1867.includes(_t1899)) _g1867.push(_t1899); } else addOnce(_g1867, _st1881, _t1899);
                              }
                            }
                          }
                          const _a1900 = union(_g1862, _g1867);
                          for (let _i1901 = 0; _i1901 < _a1900.length; _i1901++) {
                            const v_p = _a1900[_i1901];
                            const _h1940 = clueAt(cl.number, v_p);
                            _g1902.length = 0;
                            G1903: {
                              for (let _i1905 = 0; _i1905 < 1; _i1905++) {
                                const v_x = v_y;
                                const _h1906 = clueAt(cl.number, v_x);
                                if (!((_h1906 !== -1))) continue;
                                _g1902.push(v_x);
                              }
                            }
                            _g1907.length = 0;
                            _st1920.pass++;
                            G1908: {
                              const _a1926 = throughWhere(sp, v_y, (_te1921: number): boolean => { let _c1923: boolean = ((_te1921 === _wc1771 ? _wd1772 : (_te1921 === _wc1769 ? _wd1770 : (b.grid[_te1921] || -1))) === 1); if (_c1923) {   const _t1922 = sp.edgeEnds[2 * _te1921];   _c1923 = !((clueAt(cl.number, _t1922) !== -1)); } let _c1925: boolean = _c1923; if (_c1925) {   const _t1924 = sp.edgeEnds[2 * _te1921 + 1];   _c1925 = !((clueAt(cl.number, _t1924) !== -1)); } return _c1925; });
                              for (let _i1927 = 0; _i1927 < _a1926.length; _i1927++) {
                                const v_t = _a1926[_i1927];
                                const _h1930 = clueAt(cl.number, v_t);
                                const _h1931 = (_h1930 !== -1);
                                const _h1932 = _h1931;
                                const _h1933 = !(_h1932);
                                const _a1928 = sp.adj4[v_t];
                                for (let _i1929 = 0; _i1929 < _a1928.length; _i1929++) {
                                  const v_x = _a1928[_i1929];
                                  const _h1934 = clueAt(cl.number, v_x);
                                  let _c1936: boolean = (_h1933 && (_h1934 !== -1));
                                  if (_c1936) {
                                    const _t1935 = sp.adj4Edges[v_t][_i1929];
                                    _c1936 = ((_t1935 === _wc1771 ? _wd1772 : (_t1935 === _wc1769 ? _wd1770 : (b.grid[_t1935] || -1))) === 1);
                                  }
                                  if (!(_c1936)) continue;
                                  const _t1937 = v_x;
                                  if (_g1907.length < 16) { if (!_g1907.includes(_t1937)) _g1907.push(_t1937); } else addOnce(_g1907, _st1920, _t1937);
                                }
                              }
                            }
                            const _a1938 = union(_g1902, _g1907);
                            for (let _i1939 = 0; _i1939 < _a1938.length; _i1939++) {
                              const v_q = _a1938[_i1939];
                              const _h1941 = clueAt(cl.number, v_q);
                              if (!((Math.abs((_h1940 - _h1941)) === cl.step))) {
                                _q1860 = false;
                                break Q1861;
                              }
                            }
                          }
                        }
                        _c1942 = _q1860;
                      }
                      if (!((_c1942 && (_h1787 || !(throughWhere(sp, v_t, (_te1943: number): boolean => {  return ((_te1943 === _wc1771 ? _wd1772 : (_te1943 === _wc1769 ? _wd1770 : (b.grid[_te1943] || -1))) === 1); }).includes(v_y)))))) continue;
                      let _g1944 = 0;
                      G1945: {
                        const _a1946 = sp.adj4[v_t];
                        for (let _i1947 = 0; _i1947 < _a1946.length; _i1947++) {
                          const _t1948 = sp.adj4Edges[v_t][_i1947];
                          if (!(((_t1948 === _wc1771 ? _wd1772 : (_t1948 === _wc1769 ? _wd1770 : (b.grid[_t1948] || -1))) === 1))) continue;
                          _g1944++;
                        }
                      }
                      let _g1949 = 0;
                      G1950: {
                        for (let _i1951 = 0; _i1951 < 1; _i1951++) {
                          const v_k = v_t;
                          const _h1952 = clueAt(cl.number, v_k);
                          const _h1959 = (_h1952 + 1);
                          let _c1961: boolean = (_h1952 !== -1);
                          if (_c1961) {
                            let _c1960: boolean = (_h1787 || (_h1952 === 1));
                            if (!_c1960) {
                              let _g1953 = 0;
                              G1954: {
                                const _t1955 = (_h1952 + 1);
                                const _a1956 = cluesValued(cl.number, _t1955);
                                for (let _i1957 = 0; _i1957 < _a1956.length; _i1957++) {
                                  const v_x = _a1956[_i1957];
                                  const _h1958 = clueAt(cl.number, v_x);
                                  if (!((_h1958 === _h1959))) continue;
                                  _g1953++;
                                }
                              }
                              _c1960 = (_g1953 === 0);
                            }
                            _c1961 = _c1960;
                          }
                          if (!(_c1961)) continue;
                          _g1949++;
                        }
                      }
                      let _c2090: boolean = ((_g1944 + 1) === (2 - _g1949));
                      if (!_c2090) {
                        let _q1962 = false;
                        Q1963: {
                          const _a1964 = sp.adj4[v_t];
                          const _n1965 = _i1819;
                          for (let _i1966 = 0; _i1966 < _n1965; _i1966++) {
                            const v_z = _a1964[_i1966];
                            const _t1967 = sp.adj4Edges[v_t][_i1966];
                            let _c1986: boolean = !((_t1967 === _wc1771 ? true : (_t1967 === _wc1769 ? true : (b.grid[_t1967] !== 0))));
                            if (_c1986) {
                              let _g1968 = 0;
                              G1969: {
                                const _a1970 = sp.adj4[v_t];
                                for (let _i1971 = 0; _i1971 < _a1970.length; _i1971++) {
                                  const _t1972 = sp.adj4Edges[v_t][_i1971];
                                  if (!(((_t1972 === _wc1771 ? _wd1772 : (_t1972 === _wc1769 ? _wd1770 : (b.grid[_t1972] || -1))) === 1))) continue;
                                  _g1968++;
                                }
                              }
                              let _g1973 = 0;
                              G1974: {
                                for (let _i1975 = 0; _i1975 < 1; _i1975++) {
                                  const v_k = v_t;
                                  const _h1976 = clueAt(cl.number, v_k);
                                  const _h1983 = (_h1976 + 1);
                                  let _c1985: boolean = (_h1976 !== -1);
                                  if (_c1985) {
                                    let _c1984: boolean = (_h1787 || (_h1976 === 1));
                                    if (!_c1984) {
                                      let _g1977 = 0;
                                      G1978: {
                                        const _t1979 = (_h1976 + 1);
                                        const _a1980 = cluesValued(cl.number, _t1979);
                                        for (let _i1981 = 0; _i1981 < _a1980.length; _i1981++) {
                                          const v_x = _a1980[_i1981];
                                          const _h1982 = clueAt(cl.number, v_x);
                                          if (!((_h1982 === _h1983))) continue;
                                          _g1977++;
                                        }
                                      }
                                      _c1984 = (_g1977 === 0);
                                    }
                                    _c1985 = _c1984;
                                  }
                                  if (!(_c1985)) continue;
                                  _g1973++;
                                }
                              }
                              _c1986 = (_g1968 < (2 - _g1973));
                            }
                            let _c2005: boolean = _c1986;
                            if (_c2005) {
                              let _g1987 = 0;
                              G1988: {
                                const _a1989 = sp.adj4[v_z];
                                for (let _i1990 = 0; _i1990 < _a1989.length; _i1990++) {
                                  const _t1991 = sp.adj4Edges[v_z][_i1990];
                                  if (!(((_t1991 === _wc1771 ? _wd1772 : (_t1991 === _wc1769 ? _wd1770 : (b.grid[_t1991] || -1))) === 1))) continue;
                                  _g1987++;
                                }
                              }
                              let _g1992 = 0;
                              G1993: {
                                for (let _i1994 = 0; _i1994 < 1; _i1994++) {
                                  const v_k = v_z;
                                  const _h1995 = clueAt(cl.number, v_k);
                                  const _h2002 = (_h1995 + 1);
                                  let _c2004: boolean = (_h1995 !== -1);
                                  if (_c2004) {
                                    let _c2003: boolean = (_h1787 || (_h1995 === 1));
                                    if (!_c2003) {
                                      let _g1996 = 0;
                                      G1997: {
                                        const _t1998 = (_h1995 + 1);
                                        const _a1999 = cluesValued(cl.number, _t1998);
                                        for (let _i2000 = 0; _i2000 < _a1999.length; _i2000++) {
                                          const v_x = _a1999[_i2000];
                                          const _h2001 = clueAt(cl.number, v_x);
                                          if (!((_h2001 === _h2002))) continue;
                                          _g1996++;
                                        }
                                      }
                                      _c2003 = (_g1996 === 0);
                                    }
                                    _c2004 = _c2003;
                                  }
                                  if (!(_c2004)) continue;
                                  _g1992++;
                                }
                              }
                              _c2005 = (_g1987 < (2 - _g1992));
                            }
                            let _c2088: boolean = _c2005;
                            if (_c2088) {
                              let _q2006 = true;
                              Q2007: {
                                _g2008.length = 0;
                                G2009: {
                                  for (let _i2011 = 0; _i2011 < 1; _i2011++) {
                                    const v_x = v_t;
                                    const _h2012 = clueAt(cl.number, v_x);
                                    if (!((_h2012 !== -1))) continue;
                                    _g2008.push(v_x);
                                  }
                                }
                                _g2013.length = 0;
                                _st2027.pass++;
                                G2014: {
                                  const _a2034 = throughWhere(sp, v_t, (_te2029: number): boolean => { let _c2031: boolean = ((_te2029 === _wc1771 ? _wd1772 : (_te2029 === _wc1769 ? _wd1770 : (b.grid[_te2029] || -1))) === 1); if (_c2031) {   const _t2030 = sp.edgeEnds[2 * _te2029];   _c2031 = !((clueAt(cl.number, _t2030) !== -1)); } let _c2033: boolean = _c2031; if (_c2033) {   const _t2032 = sp.edgeEnds[2 * _te2029 + 1];   _c2033 = !((clueAt(cl.number, _t2032) !== -1)); } return _c2033; });
                                  for (let _i2035 = 0; _i2035 < _a2034.length; _i2035++) {
                                    const v_t_2028 = _a2034[_i2035];
                                    const _h2038 = clueAt(cl.number, v_t_2028);
                                    const _h2039 = (_h2038 !== -1);
                                    const _h2040 = _h2039;
                                    const _h2041 = !(_h2040);
                                    const _a2036 = sp.adj4[v_t_2028];
                                    for (let _i2037 = 0; _i2037 < _a2036.length; _i2037++) {
                                      const v_x = _a2036[_i2037];
                                      const _h2042 = clueAt(cl.number, v_x);
                                      let _c2044: boolean = (_h2041 && (_h2042 !== -1));
                                      if (_c2044) {
                                        const _t2043 = sp.adj4Edges[v_t_2028][_i2037];
                                        _c2044 = ((_t2043 === _wc1771 ? _wd1772 : (_t2043 === _wc1769 ? _wd1770 : (b.grid[_t2043] || -1))) === 1);
                                      }
                                      if (!(_c2044)) continue;
                                      const _t2045 = v_x;
                                      if (_g2013.length < 16) { if (!_g2013.includes(_t2045)) _g2013.push(_t2045); } else addOnce(_g2013, _st2027, _t2045);
                                    }
                                  }
                                }
                                const _a2046 = union(_g2008, _g2013);
                                for (let _i2047 = 0; _i2047 < _a2046.length; _i2047++) {
                                  const v_p = _a2046[_i2047];
                                  const _h2086 = clueAt(cl.number, v_p);
                                  _g2048.length = 0;
                                  G2049: {
                                    for (let _i2051 = 0; _i2051 < 1; _i2051++) {
                                      const v_x = v_z;
                                      const _h2052 = clueAt(cl.number, v_x);
                                      if (!((_h2052 !== -1))) continue;
                                      _g2048.push(v_x);
                                    }
                                  }
                                  _g2053.length = 0;
                                  _st2066.pass++;
                                  G2054: {
                                    const _a2072 = throughWhere(sp, v_z, (_te2067: number): boolean => { let _c2069: boolean = ((_te2067 === _wc1771 ? _wd1772 : (_te2067 === _wc1769 ? _wd1770 : (b.grid[_te2067] || -1))) === 1); if (_c2069) {   const _t2068 = sp.edgeEnds[2 * _te2067];   _c2069 = !((clueAt(cl.number, _t2068) !== -1)); } let _c2071: boolean = _c2069; if (_c2071) {   const _t2070 = sp.edgeEnds[2 * _te2067 + 1];   _c2071 = !((clueAt(cl.number, _t2070) !== -1)); } return _c2071; });
                                    for (let _i2073 = 0; _i2073 < _a2072.length; _i2073++) {
                                      const v_t = _a2072[_i2073];
                                      const _h2076 = clueAt(cl.number, v_t);
                                      const _h2077 = (_h2076 !== -1);
                                      const _h2078 = _h2077;
                                      const _h2079 = !(_h2078);
                                      const _a2074 = sp.adj4[v_t];
                                      for (let _i2075 = 0; _i2075 < _a2074.length; _i2075++) {
                                        const v_x = _a2074[_i2075];
                                        const _h2080 = clueAt(cl.number, v_x);
                                        let _c2082: boolean = (_h2079 && (_h2080 !== -1));
                                        if (_c2082) {
                                          const _t2081 = sp.adj4Edges[v_t][_i2075];
                                          _c2082 = ((_t2081 === _wc1771 ? _wd1772 : (_t2081 === _wc1769 ? _wd1770 : (b.grid[_t2081] || -1))) === 1);
                                        }
                                        if (!(_c2082)) continue;
                                        const _t2083 = v_x;
                                        if (_g2053.length < 16) { if (!_g2053.includes(_t2083)) _g2053.push(_t2083); } else addOnce(_g2053, _st2066, _t2083);
                                      }
                                    }
                                  }
                                  const _a2084 = union(_g2048, _g2053);
                                  for (let _i2085 = 0; _i2085 < _a2084.length; _i2085++) {
                                    const v_q = _a2084[_i2085];
                                    const _h2087 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2086 - _h2087)) === cl.step))) {
                                      _q2006 = false;
                                      break Q2007;
                                    }
                                  }
                                }
                              }
                              _c2088 = _q2006;
                            }
                            if ((_c2088 && (_h1787 || !(throughWhere(sp, v_t, (_te2089: number): boolean => {  return ((_te2089 === _wc1771 ? _wd1772 : (_te2089 === _wc1769 ? _wd1770 : (b.grid[_te2089] || -1))) === 1); }).includes(v_z))))) {
                              _q1962 = true;
                              break Q1963;
                            }
                          }
                        }
                        _c2090 = _q1962;
                      }
                      if (_c2090) {
                        _q1816 = true;
                        break Q1817;
                      }
                    }
                  }
                  _c2091 = !(_q1816);
                }
                let _c2386: boolean = _c2091;
                if (!_c2386) {
                  let _q2092 = false;
                  Q2093: {
                    const _a2094 = sp.adj4[v_t];
                    for (let _i2095 = 0; _i2095 < _a2094.length; _i2095++) {
                      const v_s = _a2094[_i2095];
                      let _g2096 = 0;
                      G2097: {
                        const _a2098 = sp.adj4[v_s];
                        for (let _i2099 = 0; _i2099 < _a2098.length; _i2099++) {
                          const _t2100 = sp.adj4Edges[v_s][_i2099];
                          if (!(((_t2100 === _wc1771 ? _wd1772 : (_t2100 === _wc1769 ? _wd1770 : (b.grid[_t2100] || -1))) === 1))) continue;
                          _g2096++;
                        }
                      }
                      let _g2101 = 0;
                      G2102: {
                        for (let _i2103 = 0; _i2103 < 1; _i2103++) {
                          const v_k = v_s;
                          const _h2104 = clueAt(cl.number, v_k);
                          const _h2111 = (_h2104 + 1);
                          let _c2113: boolean = (_h2104 !== -1);
                          if (_c2113) {
                            let _c2112: boolean = (_h1787 || (_h2104 === 1));
                            if (!_c2112) {
                              let _g2105 = 0;
                              G2106: {
                                const _t2107 = (_h2104 + 1);
                                const _a2108 = cluesValued(cl.number, _t2107);
                                for (let _i2109 = 0; _i2109 < _a2108.length; _i2109++) {
                                  const v_x = _a2108[_i2109];
                                  const _h2110 = clueAt(cl.number, v_x);
                                  if (!((_h2110 === _h2111))) continue;
                                  _g2105++;
                                }
                              }
                              _c2112 = (_g2105 === 0);
                            }
                            _c2113 = _c2112;
                          }
                          if (!(_c2113)) continue;
                          _g2101++;
                        }
                      }
                      let _c2385: boolean = (_g2096 < (2 - _g2101));
                      if (_c2385) {
                        let _q2114 = false;
                        Q2115: {
                          const _a2116 = sp.adj4[v_s];
                          for (let _i2117 = 0; _i2117 < _a2116.length; _i2117++) {
                            const v_y = _a2116[_i2117];
                            const _t2118 = sp.adj4Edges[v_s][_i2117];
                            let _c2137: boolean = !((_t2118 === _wc1771 ? true : (_t2118 === _wc1769 ? true : (b.grid[_t2118] !== 0))));
                            if (_c2137) {
                              let _g2119 = 0;
                              G2120: {
                                const _a2121 = sp.adj4[v_s];
                                for (let _i2122 = 0; _i2122 < _a2121.length; _i2122++) {
                                  const _t2123 = sp.adj4Edges[v_s][_i2122];
                                  if (!(((_t2123 === _wc1771 ? _wd1772 : (_t2123 === _wc1769 ? _wd1770 : (b.grid[_t2123] || -1))) === 1))) continue;
                                  _g2119++;
                                }
                              }
                              let _g2124 = 0;
                              G2125: {
                                for (let _i2126 = 0; _i2126 < 1; _i2126++) {
                                  const v_k = v_s;
                                  const _h2127 = clueAt(cl.number, v_k);
                                  const _h2134 = (_h2127 + 1);
                                  let _c2136: boolean = (_h2127 !== -1);
                                  if (_c2136) {
                                    let _c2135: boolean = (_h1787 || (_h2127 === 1));
                                    if (!_c2135) {
                                      let _g2128 = 0;
                                      G2129: {
                                        const _t2130 = (_h2127 + 1);
                                        const _a2131 = cluesValued(cl.number, _t2130);
                                        for (let _i2132 = 0; _i2132 < _a2131.length; _i2132++) {
                                          const v_x = _a2131[_i2132];
                                          const _h2133 = clueAt(cl.number, v_x);
                                          if (!((_h2133 === _h2134))) continue;
                                          _g2128++;
                                        }
                                      }
                                      _c2135 = (_g2128 === 0);
                                    }
                                    _c2136 = _c2135;
                                  }
                                  if (!(_c2136)) continue;
                                  _g2124++;
                                }
                              }
                              _c2137 = (_g2119 < (2 - _g2124));
                            }
                            let _c2157: boolean = _c2137;
                            if (_c2157) {
                              let _g2138 = 0;
                              G2139: {
                                const _a2141 = sp.adj4[v_y];
                                for (let _i2142 = 0; _i2142 < _a2141.length; _i2142++) {
                                  const _t2143 = sp.adj4Edges[v_y][_i2142];
                                  if (!(((_t2143 === _wc1771 ? _wd1772 : (_t2143 === _wc1769 ? _wd1770 : (b.grid[_t2143] || -1))) === 1))) continue;
                                  _g2138++;
                                }
                              }
                              let _g2144 = 0;
                              G2145: {
                                for (let _i2146 = 0; _i2146 < 1; _i2146++) {
                                  const v_k = v_y;
                                  const _h2147 = clueAt(cl.number, v_k);
                                  const _h2154 = (_h2147 + 1);
                                  let _c2156: boolean = (_h2147 !== -1);
                                  if (_c2156) {
                                    let _c2155: boolean = (_h1787 || (_h2147 === 1));
                                    if (!_c2155) {
                                      let _g2148 = 0;
                                      G2149: {
                                        const _t2150 = (_h2147 + 1);
                                        const _a2151 = cluesValued(cl.number, _t2150);
                                        for (let _i2152 = 0; _i2152 < _a2151.length; _i2152++) {
                                          const v_x = _a2151[_i2152];
                                          const _h2153 = clueAt(cl.number, v_x);
                                          if (!((_h2153 === _h2154))) continue;
                                          _g2148++;
                                        }
                                      }
                                      _c2155 = (_g2148 === 0);
                                    }
                                    _c2156 = _c2155;
                                  }
                                  if (!(_c2156)) continue;
                                  _g2144++;
                                }
                              }
                              _c2157 = (_g2138 < (2 - _g2144));
                            }
                            let _c2238: boolean = _c2157;
                            if (_c2238) {
                              let _q2158 = true;
                              Q2159: {
                                _g2160.length = 0;
                                G2161: {
                                  for (let _i2163 = 0; _i2163 < 1; _i2163++) {
                                    const v_x = v_s;
                                    const _h2164 = clueAt(cl.number, v_x);
                                    if (!((_h2164 !== -1))) continue;
                                    _g2160.push(v_x);
                                  }
                                }
                                _g2165.length = 0;
                                _st2178.pass++;
                                G2166: {
                                  const _a2184 = throughWhere(sp, v_s, (_te2179: number): boolean => { let _c2181: boolean = ((_te2179 === _wc1771 ? _wd1772 : (_te2179 === _wc1769 ? _wd1770 : (b.grid[_te2179] || -1))) === 1); if (_c2181) {   const _t2180 = sp.edgeEnds[2 * _te2179];   _c2181 = !((clueAt(cl.number, _t2180) !== -1)); } let _c2183: boolean = _c2181; if (_c2183) {   const _t2182 = sp.edgeEnds[2 * _te2179 + 1];   _c2183 = !((clueAt(cl.number, _t2182) !== -1)); } return _c2183; });
                                  for (let _i2185 = 0; _i2185 < _a2184.length; _i2185++) {
                                    const v_t = _a2184[_i2185];
                                    const _h2188 = clueAt(cl.number, v_t);
                                    const _h2189 = (_h2188 !== -1);
                                    const _h2190 = _h2189;
                                    const _h2191 = !(_h2190);
                                    const _a2186 = sp.adj4[v_t];
                                    for (let _i2187 = 0; _i2187 < _a2186.length; _i2187++) {
                                      const v_x = _a2186[_i2187];
                                      const _h2192 = clueAt(cl.number, v_x);
                                      let _c2194: boolean = (_h2191 && (_h2192 !== -1));
                                      if (_c2194) {
                                        const _t2193 = sp.adj4Edges[v_t][_i2187];
                                        _c2194 = ((_t2193 === _wc1771 ? _wd1772 : (_t2193 === _wc1769 ? _wd1770 : (b.grid[_t2193] || -1))) === 1);
                                      }
                                      if (!(_c2194)) continue;
                                      const _t2195 = v_x;
                                      if (_g2165.length < 16) { if (!_g2165.includes(_t2195)) _g2165.push(_t2195); } else addOnce(_g2165, _st2178, _t2195);
                                    }
                                  }
                                }
                                const _a2196 = union(_g2160, _g2165);
                                for (let _i2197 = 0; _i2197 < _a2196.length; _i2197++) {
                                  const v_p = _a2196[_i2197];
                                  const _h2236 = clueAt(cl.number, v_p);
                                  _g2198.length = 0;
                                  G2199: {
                                    for (let _i2201 = 0; _i2201 < 1; _i2201++) {
                                      const v_x = v_y;
                                      const _h2202 = clueAt(cl.number, v_x);
                                      if (!((_h2202 !== -1))) continue;
                                      _g2198.push(v_x);
                                    }
                                  }
                                  _g2203.length = 0;
                                  _st2216.pass++;
                                  G2204: {
                                    const _a2222 = throughWhere(sp, v_y, (_te2217: number): boolean => { let _c2219: boolean = ((_te2217 === _wc1771 ? _wd1772 : (_te2217 === _wc1769 ? _wd1770 : (b.grid[_te2217] || -1))) === 1); if (_c2219) {   const _t2218 = sp.edgeEnds[2 * _te2217];   _c2219 = !((clueAt(cl.number, _t2218) !== -1)); } let _c2221: boolean = _c2219; if (_c2221) {   const _t2220 = sp.edgeEnds[2 * _te2217 + 1];   _c2221 = !((clueAt(cl.number, _t2220) !== -1)); } return _c2221; });
                                    for (let _i2223 = 0; _i2223 < _a2222.length; _i2223++) {
                                      const v_t = _a2222[_i2223];
                                      const _h2226 = clueAt(cl.number, v_t);
                                      const _h2227 = (_h2226 !== -1);
                                      const _h2228 = _h2227;
                                      const _h2229 = !(_h2228);
                                      const _a2224 = sp.adj4[v_t];
                                      for (let _i2225 = 0; _i2225 < _a2224.length; _i2225++) {
                                        const v_x = _a2224[_i2225];
                                        const _h2230 = clueAt(cl.number, v_x);
                                        let _c2232: boolean = (_h2229 && (_h2230 !== -1));
                                        if (_c2232) {
                                          const _t2231 = sp.adj4Edges[v_t][_i2225];
                                          _c2232 = ((_t2231 === _wc1771 ? _wd1772 : (_t2231 === _wc1769 ? _wd1770 : (b.grid[_t2231] || -1))) === 1);
                                        }
                                        if (!(_c2232)) continue;
                                        const _t2233 = v_x;
                                        if (_g2203.length < 16) { if (!_g2203.includes(_t2233)) _g2203.push(_t2233); } else addOnce(_g2203, _st2216, _t2233);
                                      }
                                    }
                                  }
                                  const _a2234 = union(_g2198, _g2203);
                                  for (let _i2235 = 0; _i2235 < _a2234.length; _i2235++) {
                                    const v_q = _a2234[_i2235];
                                    const _h2237 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2236 - _h2237)) === cl.step))) {
                                      _q2158 = false;
                                      break Q2159;
                                    }
                                  }
                                }
                              }
                              _c2238 = _q2158;
                            }
                            if (!((_c2238 && (_h1787 || !(throughWhere(sp, v_s, (_te2239: number): boolean => {  return ((_te2239 === _wc1771 ? _wd1772 : (_te2239 === _wc1769 ? _wd1770 : (b.grid[_te2239] || -1))) === 1); }).includes(v_y)))))) continue;
                            let _g2240 = 0;
                            G2241: {
                              const _a2242 = sp.adj4[v_s];
                              for (let _i2243 = 0; _i2243 < _a2242.length; _i2243++) {
                                const _t2244 = sp.adj4Edges[v_s][_i2243];
                                if (!(((_t2244 === _wc1771 ? _wd1772 : (_t2244 === _wc1769 ? _wd1770 : (b.grid[_t2244] || -1))) === 1))) continue;
                                _g2240++;
                              }
                            }
                            let _g2245 = 0;
                            G2246: {
                              for (let _i2247 = 0; _i2247 < 1; _i2247++) {
                                const v_k = v_s;
                                const _h2248 = clueAt(cl.number, v_k);
                                const _h2255 = (_h2248 + 1);
                                let _c2257: boolean = (_h2248 !== -1);
                                if (_c2257) {
                                  let _c2256: boolean = (_h1787 || (_h2248 === 1));
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
                                _g2245++;
                              }
                            }
                            let _c2384: boolean = ((_g2240 + 1) === (2 - _g2245));
                            if (!_c2384) {
                              let _q2258 = false;
                              Q2259: {
                                const _a2260 = sp.adj4[v_s];
                                const _n2261 = _i2117;
                                for (let _i2262 = 0; _i2262 < _n2261; _i2262++) {
                                  const v_z = _a2260[_i2262];
                                  const _t2263 = sp.adj4Edges[v_s][_i2262];
                                  let _c2282: boolean = !((_t2263 === _wc1771 ? true : (_t2263 === _wc1769 ? true : (b.grid[_t2263] !== 0))));
                                  if (_c2282) {
                                    let _g2264 = 0;
                                    G2265: {
                                      const _a2266 = sp.adj4[v_s];
                                      for (let _i2267 = 0; _i2267 < _a2266.length; _i2267++) {
                                        const _t2268 = sp.adj4Edges[v_s][_i2267];
                                        if (!(((_t2268 === _wc1771 ? _wd1772 : (_t2268 === _wc1769 ? _wd1770 : (b.grid[_t2268] || -1))) === 1))) continue;
                                        _g2264++;
                                      }
                                    }
                                    let _g2269 = 0;
                                    G2270: {
                                      for (let _i2271 = 0; _i2271 < 1; _i2271++) {
                                        const v_k = v_s;
                                        const _h2272 = clueAt(cl.number, v_k);
                                        const _h2279 = (_h2272 + 1);
                                        let _c2281: boolean = (_h2272 !== -1);
                                        if (_c2281) {
                                          let _c2280: boolean = (_h1787 || (_h2272 === 1));
                                          if (!_c2280) {
                                            let _g2273 = 0;
                                            G2274: {
                                              const _t2275 = (_h2272 + 1);
                                              const _a2276 = cluesValued(cl.number, _t2275);
                                              for (let _i2277 = 0; _i2277 < _a2276.length; _i2277++) {
                                                const v_x = _a2276[_i2277];
                                                const _h2278 = clueAt(cl.number, v_x);
                                                if (!((_h2278 === _h2279))) continue;
                                                _g2273++;
                                              }
                                            }
                                            _c2280 = (_g2273 === 0);
                                          }
                                          _c2281 = _c2280;
                                        }
                                        if (!(_c2281)) continue;
                                        _g2269++;
                                      }
                                    }
                                    _c2282 = (_g2264 < (2 - _g2269));
                                  }
                                  let _c2301: boolean = _c2282;
                                  if (_c2301) {
                                    let _g2283 = 0;
                                    G2284: {
                                      const _a2285 = sp.adj4[v_z];
                                      for (let _i2286 = 0; _i2286 < _a2285.length; _i2286++) {
                                        const _t2287 = sp.adj4Edges[v_z][_i2286];
                                        if (!(((_t2287 === _wc1771 ? _wd1772 : (_t2287 === _wc1769 ? _wd1770 : (b.grid[_t2287] || -1))) === 1))) continue;
                                        _g2283++;
                                      }
                                    }
                                    let _g2288 = 0;
                                    G2289: {
                                      for (let _i2290 = 0; _i2290 < 1; _i2290++) {
                                        const v_k = v_z;
                                        const _h2291 = clueAt(cl.number, v_k);
                                        const _h2298 = (_h2291 + 1);
                                        let _c2300: boolean = (_h2291 !== -1);
                                        if (_c2300) {
                                          let _c2299: boolean = (_h1787 || (_h2291 === 1));
                                          if (!_c2299) {
                                            let _g2292 = 0;
                                            G2293: {
                                              const _t2294 = (_h2291 + 1);
                                              const _a2295 = cluesValued(cl.number, _t2294);
                                              for (let _i2296 = 0; _i2296 < _a2295.length; _i2296++) {
                                                const v_x = _a2295[_i2296];
                                                const _h2297 = clueAt(cl.number, v_x);
                                                if (!((_h2297 === _h2298))) continue;
                                                _g2292++;
                                              }
                                            }
                                            _c2299 = (_g2292 === 0);
                                          }
                                          _c2300 = _c2299;
                                        }
                                        if (!(_c2300)) continue;
                                        _g2288++;
                                      }
                                    }
                                    _c2301 = (_g2283 < (2 - _g2288));
                                  }
                                  let _c2382: boolean = _c2301;
                                  if (_c2382) {
                                    let _q2302 = true;
                                    Q2303: {
                                      _g2304.length = 0;
                                      G2305: {
                                        for (let _i2307 = 0; _i2307 < 1; _i2307++) {
                                          const v_x = v_s;
                                          const _h2308 = clueAt(cl.number, v_x);
                                          if (!((_h2308 !== -1))) continue;
                                          _g2304.push(v_x);
                                        }
                                      }
                                      _g2309.length = 0;
                                      _st2322.pass++;
                                      G2310: {
                                        const _a2328 = throughWhere(sp, v_s, (_te2323: number): boolean => { let _c2325: boolean = ((_te2323 === _wc1771 ? _wd1772 : (_te2323 === _wc1769 ? _wd1770 : (b.grid[_te2323] || -1))) === 1); if (_c2325) {   const _t2324 = sp.edgeEnds[2 * _te2323];   _c2325 = !((clueAt(cl.number, _t2324) !== -1)); } let _c2327: boolean = _c2325; if (_c2327) {   const _t2326 = sp.edgeEnds[2 * _te2323 + 1];   _c2327 = !((clueAt(cl.number, _t2326) !== -1)); } return _c2327; });
                                        for (let _i2329 = 0; _i2329 < _a2328.length; _i2329++) {
                                          const v_t = _a2328[_i2329];
                                          const _h2332 = clueAt(cl.number, v_t);
                                          const _h2333 = (_h2332 !== -1);
                                          const _h2334 = _h2333;
                                          const _h2335 = !(_h2334);
                                          const _a2330 = sp.adj4[v_t];
                                          for (let _i2331 = 0; _i2331 < _a2330.length; _i2331++) {
                                            const v_x = _a2330[_i2331];
                                            const _h2336 = clueAt(cl.number, v_x);
                                            let _c2338: boolean = (_h2335 && (_h2336 !== -1));
                                            if (_c2338) {
                                              const _t2337 = sp.adj4Edges[v_t][_i2331];
                                              _c2338 = ((_t2337 === _wc1771 ? _wd1772 : (_t2337 === _wc1769 ? _wd1770 : (b.grid[_t2337] || -1))) === 1);
                                            }
                                            if (!(_c2338)) continue;
                                            const _t2339 = v_x;
                                            if (_g2309.length < 16) { if (!_g2309.includes(_t2339)) _g2309.push(_t2339); } else addOnce(_g2309, _st2322, _t2339);
                                          }
                                        }
                                      }
                                      const _a2340 = union(_g2304, _g2309);
                                      for (let _i2341 = 0; _i2341 < _a2340.length; _i2341++) {
                                        const v_p = _a2340[_i2341];
                                        const _h2380 = clueAt(cl.number, v_p);
                                        _g2342.length = 0;
                                        G2343: {
                                          for (let _i2345 = 0; _i2345 < 1; _i2345++) {
                                            const v_x = v_z;
                                            const _h2346 = clueAt(cl.number, v_x);
                                            if (!((_h2346 !== -1))) continue;
                                            _g2342.push(v_x);
                                          }
                                        }
                                        _g2347.length = 0;
                                        _st2360.pass++;
                                        G2348: {
                                          const _a2366 = throughWhere(sp, v_z, (_te2361: number): boolean => { let _c2363: boolean = ((_te2361 === _wc1771 ? _wd1772 : (_te2361 === _wc1769 ? _wd1770 : (b.grid[_te2361] || -1))) === 1); if (_c2363) {   const _t2362 = sp.edgeEnds[2 * _te2361];   _c2363 = !((clueAt(cl.number, _t2362) !== -1)); } let _c2365: boolean = _c2363; if (_c2365) {   const _t2364 = sp.edgeEnds[2 * _te2361 + 1];   _c2365 = !((clueAt(cl.number, _t2364) !== -1)); } return _c2365; });
                                          for (let _i2367 = 0; _i2367 < _a2366.length; _i2367++) {
                                            const v_t = _a2366[_i2367];
                                            const _h2370 = clueAt(cl.number, v_t);
                                            const _h2371 = (_h2370 !== -1);
                                            const _h2372 = _h2371;
                                            const _h2373 = !(_h2372);
                                            const _a2368 = sp.adj4[v_t];
                                            for (let _i2369 = 0; _i2369 < _a2368.length; _i2369++) {
                                              const v_x = _a2368[_i2369];
                                              const _h2374 = clueAt(cl.number, v_x);
                                              let _c2376: boolean = (_h2373 && (_h2374 !== -1));
                                              if (_c2376) {
                                                const _t2375 = sp.adj4Edges[v_t][_i2369];
                                                _c2376 = ((_t2375 === _wc1771 ? _wd1772 : (_t2375 === _wc1769 ? _wd1770 : (b.grid[_t2375] || -1))) === 1);
                                              }
                                              if (!(_c2376)) continue;
                                              const _t2377 = v_x;
                                              if (_g2347.length < 16) { if (!_g2347.includes(_t2377)) _g2347.push(_t2377); } else addOnce(_g2347, _st2360, _t2377);
                                            }
                                          }
                                        }
                                        const _a2378 = union(_g2342, _g2347);
                                        for (let _i2379 = 0; _i2379 < _a2378.length; _i2379++) {
                                          const v_q = _a2378[_i2379];
                                          const _h2381 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h2380 - _h2381)) === cl.step))) {
                                            _q2302 = false;
                                            break Q2303;
                                          }
                                        }
                                      }
                                    }
                                    _c2382 = _q2302;
                                  }
                                  if ((_c2382 && (_h1787 || !(throughWhere(sp, v_s, (_te2383: number): boolean => {  return ((_te2383 === _wc1771 ? _wd1772 : (_te2383 === _wc1769 ? _wd1770 : (b.grid[_te2383] || -1))) === 1); }).includes(v_z))))) {
                                    _q2258 = true;
                                    break Q2259;
                                  }
                                }
                              }
                              _c2384 = _q2258;
                            }
                            if (_c2384) {
                              _q2114 = true;
                              break Q2115;
                            }
                          }
                        }
                        _c2385 = !(_q2114);
                      }
                      if (_c2385) {
                        _q2092 = true;
                        break Q2093;
                      }
                    }
                  }
                  _c2386 = _q2092;
                }
                if (_c2386) {
                  _q1773 = true;
                  break Q1774;
                }
              }
            }
            _c2387 = _q1773;
          }
          if (!(_c2387)) break L1763;
          if (b.made[0] !== _m177_0 || b.made[1] !== _m182_1) {
            let _g2388 = 0;
            G2389: {
              const _a2390 = sp.adj4[v_c];
              for (let _i2391 = 0; _i2391 < _a2390.length; _i2391++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i2391]] || -1) === 1))) continue;
                _g2388++;
              }
            }
            if (!(((takes(sp, cl, v_c) - _g2388) === 2))) { continue R1; }
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          const _t2392 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t2392] !== 0)) { if (fire === null) { b.placeAt(_t2392, 1); changed = true; } else facts.push(PLACE, _t2392, 1); }
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
const _st5022 = stamps();
const _st5146 = stamps();
const _st5185 = stamps();
const _st5292 = stamps();
const _st5331 = stamps();
const _st5443 = stamps();
const _st5481 = stamps();
const _st5587 = stamps();
const _st5625 = stamps();
const _st6171 = stamps();
const _st6290 = stamps();
const _st6329 = stamps();
const _st6436 = stamps();
const _st6475 = stamps();
const _st6587 = stamps();
const _st6625 = stamps();
const _st6731 = stamps();
const _st6769 = stamps();

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g4507: number[] = [];
  const _g5127: number[] = [];
  const _g5132: number[] = [];
  const _g5167: number[] = [];
  const _g5172: number[] = [];
  const _g5273: number[] = [];
  const _g5278: number[] = [];
  const _g5313: number[] = [];
  const _g5318: number[] = [];
  const _g5425: number[] = [];
  const _g5430: number[] = [];
  const _g5463: number[] = [];
  const _g5468: number[] = [];
  const _g5569: number[] = [];
  const _g5574: number[] = [];
  const _g5607: number[] = [];
  const _g5612: number[] = [];
  const _g5655: number[] = [];
  const _g6271: number[] = [];
  const _g6276: number[] = [];
  const _g6311: number[] = [];
  const _g6316: number[] = [];
  const _g6417: number[] = [];
  const _g6422: number[] = [];
  const _g6457: number[] = [];
  const _g6462: number[] = [];
  const _g6569: number[] = [];
  const _g6574: number[] = [];
  const _g6607: number[] = [];
  const _g6612: number[] = [];
  const _g6713: number[] = [];
  const _g6718: number[] = [];
  const _g6751: number[] = [];
  const _g6756: number[] = [];
  const _g6802: number[] = [];
  const _g6824: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _k4500 = takesKept.board(cl);
  const _h5052 = (cl.step === 0);
  if (weighedCands.length < sp.edges.length) weighedCands = new Int32Array(sp.edges.length);
  const cands = weighedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a4498 = sp.cells;
  for (let _i4499 = 0; _i4499 < _a4498.length; _i4499++) {
    const v_c = _a4498[_i4499];
    let _g4501 = 0;
    G4502: {
      const _a4503 = sp.adj4[v_c];
      for (let _i4504 = 0; _i4504 < _a4503.length; _i4504++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i4504]] || -1) === 1))) continue;
        _g4501++;
      }
    }
    if (!((((_k4500[v_c] ?? takes(sp, cl, v_c)) - _g4501) === 2))) continue;
    const _h5029 = clueAt(cl.number, v_c);
    const _h5030 = (_h5029 !== -1);
    const _h5031 = _h5030;
    const _h5032 = !(_h5031);
    L4505: {
      const v_U = ways(b, sp, cl, v_c);
      const _h4506 = v_U.length;
      if (!((_h4506 === 4))) break L4505;
      const _h6798 = (v_U[0] ?? -1);
      _g4507.length = 0;
      _st5022.pass++;
      G4508: {
        const _a5023 = v_U;
        for (let _i5024 = 0; _i5024 < _a5023.length; _i5024++) {
          const v_i = _a5023[_i5024];
          const _h5027 = _i5024;
          const _h5028 = (_h5027 === 0);
          const _h5033 = sp.edgeOf(v_c, v_i);
          const _a5025 = v_U;
          for (let _i5026 = 0; _i5026 < _a5025.length; _i5026++) {
            const v_j = _a5025[_i5026];
            let _c5653: boolean = (_h5028 && (_i5026 > 0));
            if (_c5653) {
              let _c5652: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h5032 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c5652) {
                const _wc5034 = _h5033;
                const _wd5035 = 1;
                const _wc5036 = sp.edgeOf(v_c, v_j);
                const _wd5037 = 1;
                let _q5038 = false;
                Q5039: {
                  const _a5041 = throughWhere(sp, v_c, (_te5040: number): boolean => {  return ((_te5040 === _wc5036 ? _wd5037 : (_te5040 === _wc5034 ? _wd5035 : (b.grid[_te5040] || -1))) === 1); });
                  for (let _i5042 = 0; _i5042 < _a5041.length; _i5042++) {
                    const v_t = _a5041[_i5042];
                    let _c5062: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5062) {
                      let _g5043 = 0;
                      G5044: {
                        const _a5045 = sp.adj4[v_t];
                        for (let _i5046 = 0; _i5046 < _a5045.length; _i5046++) {
                          const _t5047 = sp.adj4Edges[v_t][_i5046];
                          if (!(((_t5047 === _wc5036 ? _wd5037 : (_t5047 === _wc5034 ? _wd5035 : (b.grid[_t5047] || -1))) === 1))) continue;
                          _g5043++;
                        }
                      }
                      let _g5048 = 0;
                      G5049: {
                        for (let _i5050 = 0; _i5050 < 1; _i5050++) {
                          const v_k = v_t;
                          const _h5051 = clueAt(cl.number, v_k);
                          const _h5059 = (_h5051 + 1);
                          let _c5061: boolean = (_h5051 !== -1);
                          if (_c5061) {
                            let _c5060: boolean = (_h5052 || (_h5051 === 1));
                            if (!_c5060) {
                              let _g5053 = 0;
                              G5054: {
                                const _t5055 = (_h5051 + 1);
                                const _a5056 = cluesValued(cl.number, _t5055);
                                for (let _i5057 = 0; _i5057 < _a5056.length; _i5057++) {
                                  const v_x = _a5056[_i5057];
                                  const _h5058 = clueAt(cl.number, v_x);
                                  if (!((_h5058 === _h5059))) continue;
                                  _g5053++;
                                }
                              }
                              _c5060 = (_g5053 === 0);
                            }
                            _c5061 = _c5060;
                          }
                          if (!(_c5061)) continue;
                          _g5048++;
                        }
                      }
                      _c5062 = (_g5043 < (2 - _g5048));
                    }
                    if (!(_c5062)) continue;
                    let _g5063 = 0;
                    G5064: {
                      const _a5065 = sp.adj4[v_t];
                      for (let _i5066 = 0; _i5066 < _a5065.length; _i5066++) {
                        const _t5067 = sp.adj4Edges[v_t][_i5066];
                        if (!(((_t5067 === _wc5036 ? _wd5037 : (_t5067 === _wc5034 ? _wd5035 : (b.grid[_t5067] || -1))) === 1))) continue;
                        _g5063++;
                      }
                    }
                    let _g5068 = 0;
                    G5069: {
                      for (let _i5070 = 0; _i5070 < 1; _i5070++) {
                        const v_k = v_t;
                        const _h5071 = clueAt(cl.number, v_k);
                        const _h5078 = (_h5071 + 1);
                        let _c5080: boolean = (_h5071 !== -1);
                        if (_c5080) {
                          let _c5079: boolean = (_h5052 || (_h5071 === 1));
                          if (!_c5079) {
                            let _g5072 = 0;
                            G5073: {
                              const _t5074 = (_h5071 + 1);
                              const _a5075 = cluesValued(cl.number, _t5074);
                              for (let _i5076 = 0; _i5076 < _a5075.length; _i5076++) {
                                const v_x = _a5075[_i5076];
                                const _h5077 = clueAt(cl.number, v_x);
                                if (!((_h5077 === _h5078))) continue;
                                _g5072++;
                              }
                            }
                            _c5079 = (_g5072 === 0);
                          }
                          _c5080 = _c5079;
                        }
                        if (!(_c5080)) continue;
                        _g5068++;
                      }
                    }
                    let _c5356: boolean = (_g5063 < (2 - _g5068));
                    if (_c5356) {
                      let _q5081 = false;
                      Q5082: {
                        const _a5083 = sp.adj4[v_t];
                        for (let _i5084 = 0; _i5084 < _a5083.length; _i5084++) {
                          const v_y = _a5083[_i5084];
                          const _t5085 = sp.adj4Edges[v_t][_i5084];
                          let _c5104: boolean = !((_t5085 === _wc5036 ? true : (_t5085 === _wc5034 ? true : (b.grid[_t5085] !== 0))));
                          if (_c5104) {
                            let _g5086 = 0;
                            G5087: {
                              const _a5088 = sp.adj4[v_t];
                              for (let _i5089 = 0; _i5089 < _a5088.length; _i5089++) {
                                const _t5090 = sp.adj4Edges[v_t][_i5089];
                                if (!(((_t5090 === _wc5036 ? _wd5037 : (_t5090 === _wc5034 ? _wd5035 : (b.grid[_t5090] || -1))) === 1))) continue;
                                _g5086++;
                              }
                            }
                            let _g5091 = 0;
                            G5092: {
                              for (let _i5093 = 0; _i5093 < 1; _i5093++) {
                                const v_k = v_t;
                                const _h5094 = clueAt(cl.number, v_k);
                                const _h5101 = (_h5094 + 1);
                                let _c5103: boolean = (_h5094 !== -1);
                                if (_c5103) {
                                  let _c5102: boolean = (_h5052 || (_h5094 === 1));
                                  if (!_c5102) {
                                    let _g5095 = 0;
                                    G5096: {
                                      const _t5097 = (_h5094 + 1);
                                      const _a5098 = cluesValued(cl.number, _t5097);
                                      for (let _i5099 = 0; _i5099 < _a5098.length; _i5099++) {
                                        const v_x = _a5098[_i5099];
                                        const _h5100 = clueAt(cl.number, v_x);
                                        if (!((_h5100 === _h5101))) continue;
                                        _g5095++;
                                      }
                                    }
                                    _c5102 = (_g5095 === 0);
                                  }
                                  _c5103 = _c5102;
                                }
                                if (!(_c5103)) continue;
                                _g5091++;
                              }
                            }
                            _c5104 = (_g5086 < (2 - _g5091));
                          }
                          let _c5124: boolean = _c5104;
                          if (_c5124) {
                            let _g5105 = 0;
                            G5106: {
                              const _a5108 = sp.adj4[v_y];
                              for (let _i5109 = 0; _i5109 < _a5108.length; _i5109++) {
                                const _t5110 = sp.adj4Edges[v_y][_i5109];
                                if (!(((_t5110 === _wc5036 ? _wd5037 : (_t5110 === _wc5034 ? _wd5035 : (b.grid[_t5110] || -1))) === 1))) continue;
                                _g5105++;
                              }
                            }
                            let _g5111 = 0;
                            G5112: {
                              for (let _i5113 = 0; _i5113 < 1; _i5113++) {
                                const v_k = v_y;
                                const _h5114 = clueAt(cl.number, v_k);
                                const _h5121 = (_h5114 + 1);
                                let _c5123: boolean = (_h5114 !== -1);
                                if (_c5123) {
                                  let _c5122: boolean = (_h5052 || (_h5114 === 1));
                                  if (!_c5122) {
                                    let _g5115 = 0;
                                    G5116: {
                                      const _t5117 = (_h5114 + 1);
                                      const _a5118 = cluesValued(cl.number, _t5117);
                                      for (let _i5119 = 0; _i5119 < _a5118.length; _i5119++) {
                                        const v_x = _a5118[_i5119];
                                        const _h5120 = clueAt(cl.number, v_x);
                                        if (!((_h5120 === _h5121))) continue;
                                        _g5115++;
                                      }
                                    }
                                    _c5122 = (_g5115 === 0);
                                  }
                                  _c5123 = _c5122;
                                }
                                if (!(_c5123)) continue;
                                _g5111++;
                              }
                            }
                            _c5124 = (_g5105 < (2 - _g5111));
                          }
                          let _c5207: boolean = _c5124;
                          if (_c5207) {
                            let _q5125 = true;
                            Q5126: {
                              _g5127.length = 0;
                              G5128: {
                                for (let _i5130 = 0; _i5130 < 1; _i5130++) {
                                  const v_x = v_t;
                                  const _h5131 = clueAt(cl.number, v_x);
                                  if (!((_h5131 !== -1))) continue;
                                  _g5127.push(v_x);
                                }
                              }
                              _g5132.length = 0;
                              _st5146.pass++;
                              G5133: {
                                const _a5153 = throughWhere(sp, v_t, (_te5148: number): boolean => { let _c5150: boolean = ((_te5148 === _wc5036 ? _wd5037 : (_te5148 === _wc5034 ? _wd5035 : (b.grid[_te5148] || -1))) === 1); if (_c5150) {   const _t5149 = sp.edgeEnds[2 * _te5148];   _c5150 = !((clueAt(cl.number, _t5149) !== -1)); } let _c5152: boolean = _c5150; if (_c5152) {   const _t5151 = sp.edgeEnds[2 * _te5148 + 1];   _c5152 = !((clueAt(cl.number, _t5151) !== -1)); } return _c5152; });
                                for (let _i5154 = 0; _i5154 < _a5153.length; _i5154++) {
                                  const v_t_5147 = _a5153[_i5154];
                                  const _h5157 = clueAt(cl.number, v_t_5147);
                                  const _h5158 = (_h5157 !== -1);
                                  const _h5159 = _h5158;
                                  const _h5160 = !(_h5159);
                                  const _a5155 = sp.adj4[v_t_5147];
                                  for (let _i5156 = 0; _i5156 < _a5155.length; _i5156++) {
                                    const v_x = _a5155[_i5156];
                                    const _h5161 = clueAt(cl.number, v_x);
                                    let _c5163: boolean = (_h5160 && (_h5161 !== -1));
                                    if (_c5163) {
                                      const _t5162 = sp.adj4Edges[v_t_5147][_i5156];
                                      _c5163 = ((_t5162 === _wc5036 ? _wd5037 : (_t5162 === _wc5034 ? _wd5035 : (b.grid[_t5162] || -1))) === 1);
                                    }
                                    if (!(_c5163)) continue;
                                    const _t5164 = v_x;
                                    if (_g5132.length < 16) { if (!_g5132.includes(_t5164)) _g5132.push(_t5164); } else addOnce(_g5132, _st5146, _t5164);
                                  }
                                }
                              }
                              const _a5165 = union(_g5127, _g5132);
                              for (let _i5166 = 0; _i5166 < _a5165.length; _i5166++) {
                                const v_p = _a5165[_i5166];
                                const _h5205 = clueAt(cl.number, v_p);
                                _g5167.length = 0;
                                G5168: {
                                  for (let _i5170 = 0; _i5170 < 1; _i5170++) {
                                    const v_x = v_y;
                                    const _h5171 = clueAt(cl.number, v_x);
                                    if (!((_h5171 !== -1))) continue;
                                    _g5167.push(v_x);
                                  }
                                }
                                _g5172.length = 0;
                                _st5185.pass++;
                                G5173: {
                                  const _a5191 = throughWhere(sp, v_y, (_te5186: number): boolean => { let _c5188: boolean = ((_te5186 === _wc5036 ? _wd5037 : (_te5186 === _wc5034 ? _wd5035 : (b.grid[_te5186] || -1))) === 1); if (_c5188) {   const _t5187 = sp.edgeEnds[2 * _te5186];   _c5188 = !((clueAt(cl.number, _t5187) !== -1)); } let _c5190: boolean = _c5188; if (_c5190) {   const _t5189 = sp.edgeEnds[2 * _te5186 + 1];   _c5190 = !((clueAt(cl.number, _t5189) !== -1)); } return _c5190; });
                                  for (let _i5192 = 0; _i5192 < _a5191.length; _i5192++) {
                                    const v_t = _a5191[_i5192];
                                    const _h5195 = clueAt(cl.number, v_t);
                                    const _h5196 = (_h5195 !== -1);
                                    const _h5197 = _h5196;
                                    const _h5198 = !(_h5197);
                                    const _a5193 = sp.adj4[v_t];
                                    for (let _i5194 = 0; _i5194 < _a5193.length; _i5194++) {
                                      const v_x = _a5193[_i5194];
                                      const _h5199 = clueAt(cl.number, v_x);
                                      let _c5201: boolean = (_h5198 && (_h5199 !== -1));
                                      if (_c5201) {
                                        const _t5200 = sp.adj4Edges[v_t][_i5194];
                                        _c5201 = ((_t5200 === _wc5036 ? _wd5037 : (_t5200 === _wc5034 ? _wd5035 : (b.grid[_t5200] || -1))) === 1);
                                      }
                                      if (!(_c5201)) continue;
                                      const _t5202 = v_x;
                                      if (_g5172.length < 16) { if (!_g5172.includes(_t5202)) _g5172.push(_t5202); } else addOnce(_g5172, _st5185, _t5202);
                                    }
                                  }
                                }
                                const _a5203 = union(_g5167, _g5172);
                                for (let _i5204 = 0; _i5204 < _a5203.length; _i5204++) {
                                  const v_q = _a5203[_i5204];
                                  const _h5206 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h5205 - _h5206)) === cl.step))) {
                                    _q5125 = false;
                                    break Q5126;
                                  }
                                }
                              }
                            }
                            _c5207 = _q5125;
                          }
                          if (!((_c5207 && (_h5052 || !(throughWhere(sp, v_t, (_te5208: number): boolean => {  return ((_te5208 === _wc5036 ? _wd5037 : (_te5208 === _wc5034 ? _wd5035 : (b.grid[_te5208] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g5209 = 0;
                          G5210: {
                            const _a5211 = sp.adj4[v_t];
                            for (let _i5212 = 0; _i5212 < _a5211.length; _i5212++) {
                              const _t5213 = sp.adj4Edges[v_t][_i5212];
                              if (!(((_t5213 === _wc5036 ? _wd5037 : (_t5213 === _wc5034 ? _wd5035 : (b.grid[_t5213] || -1))) === 1))) continue;
                              _g5209++;
                            }
                          }
                          let _g5214 = 0;
                          G5215: {
                            for (let _i5216 = 0; _i5216 < 1; _i5216++) {
                              const v_k = v_t;
                              const _h5217 = clueAt(cl.number, v_k);
                              const _h5224 = (_h5217 + 1);
                              let _c5226: boolean = (_h5217 !== -1);
                              if (_c5226) {
                                let _c5225: boolean = (_h5052 || (_h5217 === 1));
                                if (!_c5225) {
                                  let _g5218 = 0;
                                  G5219: {
                                    const _t5220 = (_h5217 + 1);
                                    const _a5221 = cluesValued(cl.number, _t5220);
                                    for (let _i5222 = 0; _i5222 < _a5221.length; _i5222++) {
                                      const v_x = _a5221[_i5222];
                                      const _h5223 = clueAt(cl.number, v_x);
                                      if (!((_h5223 === _h5224))) continue;
                                      _g5218++;
                                    }
                                  }
                                  _c5225 = (_g5218 === 0);
                                }
                                _c5226 = _c5225;
                              }
                              if (!(_c5226)) continue;
                              _g5214++;
                            }
                          }
                          let _c5355: boolean = ((_g5209 + 1) === (2 - _g5214));
                          if (!_c5355) {
                            let _q5227 = false;
                            Q5228: {
                              const _a5229 = sp.adj4[v_t];
                              const _n5230 = _i5084;
                              for (let _i5231 = 0; _i5231 < _n5230; _i5231++) {
                                const v_z = _a5229[_i5231];
                                const _t5232 = sp.adj4Edges[v_t][_i5231];
                                let _c5251: boolean = !((_t5232 === _wc5036 ? true : (_t5232 === _wc5034 ? true : (b.grid[_t5232] !== 0))));
                                if (_c5251) {
                                  let _g5233 = 0;
                                  G5234: {
                                    const _a5235 = sp.adj4[v_t];
                                    for (let _i5236 = 0; _i5236 < _a5235.length; _i5236++) {
                                      const _t5237 = sp.adj4Edges[v_t][_i5236];
                                      if (!(((_t5237 === _wc5036 ? _wd5037 : (_t5237 === _wc5034 ? _wd5035 : (b.grid[_t5237] || -1))) === 1))) continue;
                                      _g5233++;
                                    }
                                  }
                                  let _g5238 = 0;
                                  G5239: {
                                    for (let _i5240 = 0; _i5240 < 1; _i5240++) {
                                      const v_k = v_t;
                                      const _h5241 = clueAt(cl.number, v_k);
                                      const _h5248 = (_h5241 + 1);
                                      let _c5250: boolean = (_h5241 !== -1);
                                      if (_c5250) {
                                        let _c5249: boolean = (_h5052 || (_h5241 === 1));
                                        if (!_c5249) {
                                          let _g5242 = 0;
                                          G5243: {
                                            const _t5244 = (_h5241 + 1);
                                            const _a5245 = cluesValued(cl.number, _t5244);
                                            for (let _i5246 = 0; _i5246 < _a5245.length; _i5246++) {
                                              const v_x = _a5245[_i5246];
                                              const _h5247 = clueAt(cl.number, v_x);
                                              if (!((_h5247 === _h5248))) continue;
                                              _g5242++;
                                            }
                                          }
                                          _c5249 = (_g5242 === 0);
                                        }
                                        _c5250 = _c5249;
                                      }
                                      if (!(_c5250)) continue;
                                      _g5238++;
                                    }
                                  }
                                  _c5251 = (_g5233 < (2 - _g5238));
                                }
                                let _c5270: boolean = _c5251;
                                if (_c5270) {
                                  let _g5252 = 0;
                                  G5253: {
                                    const _a5254 = sp.adj4[v_z];
                                    for (let _i5255 = 0; _i5255 < _a5254.length; _i5255++) {
                                      const _t5256 = sp.adj4Edges[v_z][_i5255];
                                      if (!(((_t5256 === _wc5036 ? _wd5037 : (_t5256 === _wc5034 ? _wd5035 : (b.grid[_t5256] || -1))) === 1))) continue;
                                      _g5252++;
                                    }
                                  }
                                  let _g5257 = 0;
                                  G5258: {
                                    for (let _i5259 = 0; _i5259 < 1; _i5259++) {
                                      const v_k = v_z;
                                      const _h5260 = clueAt(cl.number, v_k);
                                      const _h5267 = (_h5260 + 1);
                                      let _c5269: boolean = (_h5260 !== -1);
                                      if (_c5269) {
                                        let _c5268: boolean = (_h5052 || (_h5260 === 1));
                                        if (!_c5268) {
                                          let _g5261 = 0;
                                          G5262: {
                                            const _t5263 = (_h5260 + 1);
                                            const _a5264 = cluesValued(cl.number, _t5263);
                                            for (let _i5265 = 0; _i5265 < _a5264.length; _i5265++) {
                                              const v_x = _a5264[_i5265];
                                              const _h5266 = clueAt(cl.number, v_x);
                                              if (!((_h5266 === _h5267))) continue;
                                              _g5261++;
                                            }
                                          }
                                          _c5268 = (_g5261 === 0);
                                        }
                                        _c5269 = _c5268;
                                      }
                                      if (!(_c5269)) continue;
                                      _g5257++;
                                    }
                                  }
                                  _c5270 = (_g5252 < (2 - _g5257));
                                }
                                let _c5353: boolean = _c5270;
                                if (_c5353) {
                                  let _q5271 = true;
                                  Q5272: {
                                    _g5273.length = 0;
                                    G5274: {
                                      for (let _i5276 = 0; _i5276 < 1; _i5276++) {
                                        const v_x = v_t;
                                        const _h5277 = clueAt(cl.number, v_x);
                                        if (!((_h5277 !== -1))) continue;
                                        _g5273.push(v_x);
                                      }
                                    }
                                    _g5278.length = 0;
                                    _st5292.pass++;
                                    G5279: {
                                      const _a5299 = throughWhere(sp, v_t, (_te5294: number): boolean => { let _c5296: boolean = ((_te5294 === _wc5036 ? _wd5037 : (_te5294 === _wc5034 ? _wd5035 : (b.grid[_te5294] || -1))) === 1); if (_c5296) {   const _t5295 = sp.edgeEnds[2 * _te5294];   _c5296 = !((clueAt(cl.number, _t5295) !== -1)); } let _c5298: boolean = _c5296; if (_c5298) {   const _t5297 = sp.edgeEnds[2 * _te5294 + 1];   _c5298 = !((clueAt(cl.number, _t5297) !== -1)); } return _c5298; });
                                      for (let _i5300 = 0; _i5300 < _a5299.length; _i5300++) {
                                        const v_t_5293 = _a5299[_i5300];
                                        const _h5303 = clueAt(cl.number, v_t_5293);
                                        const _h5304 = (_h5303 !== -1);
                                        const _h5305 = _h5304;
                                        const _h5306 = !(_h5305);
                                        const _a5301 = sp.adj4[v_t_5293];
                                        for (let _i5302 = 0; _i5302 < _a5301.length; _i5302++) {
                                          const v_x = _a5301[_i5302];
                                          const _h5307 = clueAt(cl.number, v_x);
                                          let _c5309: boolean = (_h5306 && (_h5307 !== -1));
                                          if (_c5309) {
                                            const _t5308 = sp.adj4Edges[v_t_5293][_i5302];
                                            _c5309 = ((_t5308 === _wc5036 ? _wd5037 : (_t5308 === _wc5034 ? _wd5035 : (b.grid[_t5308] || -1))) === 1);
                                          }
                                          if (!(_c5309)) continue;
                                          const _t5310 = v_x;
                                          if (_g5278.length < 16) { if (!_g5278.includes(_t5310)) _g5278.push(_t5310); } else addOnce(_g5278, _st5292, _t5310);
                                        }
                                      }
                                    }
                                    const _a5311 = union(_g5273, _g5278);
                                    for (let _i5312 = 0; _i5312 < _a5311.length; _i5312++) {
                                      const v_p = _a5311[_i5312];
                                      const _h5351 = clueAt(cl.number, v_p);
                                      _g5313.length = 0;
                                      G5314: {
                                        for (let _i5316 = 0; _i5316 < 1; _i5316++) {
                                          const v_x = v_z;
                                          const _h5317 = clueAt(cl.number, v_x);
                                          if (!((_h5317 !== -1))) continue;
                                          _g5313.push(v_x);
                                        }
                                      }
                                      _g5318.length = 0;
                                      _st5331.pass++;
                                      G5319: {
                                        const _a5337 = throughWhere(sp, v_z, (_te5332: number): boolean => { let _c5334: boolean = ((_te5332 === _wc5036 ? _wd5037 : (_te5332 === _wc5034 ? _wd5035 : (b.grid[_te5332] || -1))) === 1); if (_c5334) {   const _t5333 = sp.edgeEnds[2 * _te5332];   _c5334 = !((clueAt(cl.number, _t5333) !== -1)); } let _c5336: boolean = _c5334; if (_c5336) {   const _t5335 = sp.edgeEnds[2 * _te5332 + 1];   _c5336 = !((clueAt(cl.number, _t5335) !== -1)); } return _c5336; });
                                        for (let _i5338 = 0; _i5338 < _a5337.length; _i5338++) {
                                          const v_t = _a5337[_i5338];
                                          const _h5341 = clueAt(cl.number, v_t);
                                          const _h5342 = (_h5341 !== -1);
                                          const _h5343 = _h5342;
                                          const _h5344 = !(_h5343);
                                          const _a5339 = sp.adj4[v_t];
                                          for (let _i5340 = 0; _i5340 < _a5339.length; _i5340++) {
                                            const v_x = _a5339[_i5340];
                                            const _h5345 = clueAt(cl.number, v_x);
                                            let _c5347: boolean = (_h5344 && (_h5345 !== -1));
                                            if (_c5347) {
                                              const _t5346 = sp.adj4Edges[v_t][_i5340];
                                              _c5347 = ((_t5346 === _wc5036 ? _wd5037 : (_t5346 === _wc5034 ? _wd5035 : (b.grid[_t5346] || -1))) === 1);
                                            }
                                            if (!(_c5347)) continue;
                                            const _t5348 = v_x;
                                            if (_g5318.length < 16) { if (!_g5318.includes(_t5348)) _g5318.push(_t5348); } else addOnce(_g5318, _st5331, _t5348);
                                          }
                                        }
                                      }
                                      const _a5349 = union(_g5313, _g5318);
                                      for (let _i5350 = 0; _i5350 < _a5349.length; _i5350++) {
                                        const v_q = _a5349[_i5350];
                                        const _h5352 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5351 - _h5352)) === cl.step))) {
                                          _q5271 = false;
                                          break Q5272;
                                        }
                                      }
                                    }
                                  }
                                  _c5353 = _q5271;
                                }
                                if ((_c5353 && (_h5052 || !(throughWhere(sp, v_t, (_te5354: number): boolean => {  return ((_te5354 === _wc5036 ? _wd5037 : (_te5354 === _wc5034 ? _wd5035 : (b.grid[_te5354] || -1))) === 1); }).includes(v_z))))) {
                                  _q5227 = true;
                                  break Q5228;
                                }
                              }
                            }
                            _c5355 = _q5227;
                          }
                          if (_c5355) {
                            _q5081 = true;
                            break Q5082;
                          }
                        }
                      }
                      _c5356 = !(_q5081);
                    }
                    let _c5651: boolean = _c5356;
                    if (!_c5651) {
                      let _q5357 = false;
                      Q5358: {
                        const _a5359 = sp.adj4[v_t];
                        for (let _i5360 = 0; _i5360 < _a5359.length; _i5360++) {
                          const v_s = _a5359[_i5360];
                          let _g5361 = 0;
                          G5362: {
                            const _a5363 = sp.adj4[v_s];
                            for (let _i5364 = 0; _i5364 < _a5363.length; _i5364++) {
                              const _t5365 = sp.adj4Edges[v_s][_i5364];
                              if (!(((_t5365 === _wc5036 ? _wd5037 : (_t5365 === _wc5034 ? _wd5035 : (b.grid[_t5365] || -1))) === 1))) continue;
                              _g5361++;
                            }
                          }
                          let _g5366 = 0;
                          G5367: {
                            for (let _i5368 = 0; _i5368 < 1; _i5368++) {
                              const v_k = v_s;
                              const _h5369 = clueAt(cl.number, v_k);
                              const _h5376 = (_h5369 + 1);
                              let _c5378: boolean = (_h5369 !== -1);
                              if (_c5378) {
                                let _c5377: boolean = (_h5052 || (_h5369 === 1));
                                if (!_c5377) {
                                  let _g5370 = 0;
                                  G5371: {
                                    const _t5372 = (_h5369 + 1);
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
                              _g5366++;
                            }
                          }
                          let _c5650: boolean = (_g5361 < (2 - _g5366));
                          if (_c5650) {
                            let _q5379 = false;
                            Q5380: {
                              const _a5381 = sp.adj4[v_s];
                              for (let _i5382 = 0; _i5382 < _a5381.length; _i5382++) {
                                const v_y = _a5381[_i5382];
                                const _t5383 = sp.adj4Edges[v_s][_i5382];
                                let _c5402: boolean = !((_t5383 === _wc5036 ? true : (_t5383 === _wc5034 ? true : (b.grid[_t5383] !== 0))));
                                if (_c5402) {
                                  let _g5384 = 0;
                                  G5385: {
                                    const _a5386 = sp.adj4[v_s];
                                    for (let _i5387 = 0; _i5387 < _a5386.length; _i5387++) {
                                      const _t5388 = sp.adj4Edges[v_s][_i5387];
                                      if (!(((_t5388 === _wc5036 ? _wd5037 : (_t5388 === _wc5034 ? _wd5035 : (b.grid[_t5388] || -1))) === 1))) continue;
                                      _g5384++;
                                    }
                                  }
                                  let _g5389 = 0;
                                  G5390: {
                                    for (let _i5391 = 0; _i5391 < 1; _i5391++) {
                                      const v_k = v_s;
                                      const _h5392 = clueAt(cl.number, v_k);
                                      const _h5399 = (_h5392 + 1);
                                      let _c5401: boolean = (_h5392 !== -1);
                                      if (_c5401) {
                                        let _c5400: boolean = (_h5052 || (_h5392 === 1));
                                        if (!_c5400) {
                                          let _g5393 = 0;
                                          G5394: {
                                            const _t5395 = (_h5392 + 1);
                                            const _a5396 = cluesValued(cl.number, _t5395);
                                            for (let _i5397 = 0; _i5397 < _a5396.length; _i5397++) {
                                              const v_x = _a5396[_i5397];
                                              const _h5398 = clueAt(cl.number, v_x);
                                              if (!((_h5398 === _h5399))) continue;
                                              _g5393++;
                                            }
                                          }
                                          _c5400 = (_g5393 === 0);
                                        }
                                        _c5401 = _c5400;
                                      }
                                      if (!(_c5401)) continue;
                                      _g5389++;
                                    }
                                  }
                                  _c5402 = (_g5384 < (2 - _g5389));
                                }
                                let _c5422: boolean = _c5402;
                                if (_c5422) {
                                  let _g5403 = 0;
                                  G5404: {
                                    const _a5406 = sp.adj4[v_y];
                                    for (let _i5407 = 0; _i5407 < _a5406.length; _i5407++) {
                                      const _t5408 = sp.adj4Edges[v_y][_i5407];
                                      if (!(((_t5408 === _wc5036 ? _wd5037 : (_t5408 === _wc5034 ? _wd5035 : (b.grid[_t5408] || -1))) === 1))) continue;
                                      _g5403++;
                                    }
                                  }
                                  let _g5409 = 0;
                                  G5410: {
                                    for (let _i5411 = 0; _i5411 < 1; _i5411++) {
                                      const v_k = v_y;
                                      const _h5412 = clueAt(cl.number, v_k);
                                      const _h5419 = (_h5412 + 1);
                                      let _c5421: boolean = (_h5412 !== -1);
                                      if (_c5421) {
                                        let _c5420: boolean = (_h5052 || (_h5412 === 1));
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
                                      _g5409++;
                                    }
                                  }
                                  _c5422 = (_g5403 < (2 - _g5409));
                                }
                                let _c5503: boolean = _c5422;
                                if (_c5503) {
                                  let _q5423 = true;
                                  Q5424: {
                                    _g5425.length = 0;
                                    G5426: {
                                      for (let _i5428 = 0; _i5428 < 1; _i5428++) {
                                        const v_x = v_s;
                                        const _h5429 = clueAt(cl.number, v_x);
                                        if (!((_h5429 !== -1))) continue;
                                        _g5425.push(v_x);
                                      }
                                    }
                                    _g5430.length = 0;
                                    _st5443.pass++;
                                    G5431: {
                                      const _a5449 = throughWhere(sp, v_s, (_te5444: number): boolean => { let _c5446: boolean = ((_te5444 === _wc5036 ? _wd5037 : (_te5444 === _wc5034 ? _wd5035 : (b.grid[_te5444] || -1))) === 1); if (_c5446) {   const _t5445 = sp.edgeEnds[2 * _te5444];   _c5446 = !((clueAt(cl.number, _t5445) !== -1)); } let _c5448: boolean = _c5446; if (_c5448) {   const _t5447 = sp.edgeEnds[2 * _te5444 + 1];   _c5448 = !((clueAt(cl.number, _t5447) !== -1)); } return _c5448; });
                                      for (let _i5450 = 0; _i5450 < _a5449.length; _i5450++) {
                                        const v_t = _a5449[_i5450];
                                        const _h5453 = clueAt(cl.number, v_t);
                                        const _h5454 = (_h5453 !== -1);
                                        const _h5455 = _h5454;
                                        const _h5456 = !(_h5455);
                                        const _a5451 = sp.adj4[v_t];
                                        for (let _i5452 = 0; _i5452 < _a5451.length; _i5452++) {
                                          const v_x = _a5451[_i5452];
                                          const _h5457 = clueAt(cl.number, v_x);
                                          let _c5459: boolean = (_h5456 && (_h5457 !== -1));
                                          if (_c5459) {
                                            const _t5458 = sp.adj4Edges[v_t][_i5452];
                                            _c5459 = ((_t5458 === _wc5036 ? _wd5037 : (_t5458 === _wc5034 ? _wd5035 : (b.grid[_t5458] || -1))) === 1);
                                          }
                                          if (!(_c5459)) continue;
                                          const _t5460 = v_x;
                                          if (_g5430.length < 16) { if (!_g5430.includes(_t5460)) _g5430.push(_t5460); } else addOnce(_g5430, _st5443, _t5460);
                                        }
                                      }
                                    }
                                    const _a5461 = union(_g5425, _g5430);
                                    for (let _i5462 = 0; _i5462 < _a5461.length; _i5462++) {
                                      const v_p = _a5461[_i5462];
                                      const _h5501 = clueAt(cl.number, v_p);
                                      _g5463.length = 0;
                                      G5464: {
                                        for (let _i5466 = 0; _i5466 < 1; _i5466++) {
                                          const v_x = v_y;
                                          const _h5467 = clueAt(cl.number, v_x);
                                          if (!((_h5467 !== -1))) continue;
                                          _g5463.push(v_x);
                                        }
                                      }
                                      _g5468.length = 0;
                                      _st5481.pass++;
                                      G5469: {
                                        const _a5487 = throughWhere(sp, v_y, (_te5482: number): boolean => { let _c5484: boolean = ((_te5482 === _wc5036 ? _wd5037 : (_te5482 === _wc5034 ? _wd5035 : (b.grid[_te5482] || -1))) === 1); if (_c5484) {   const _t5483 = sp.edgeEnds[2 * _te5482];   _c5484 = !((clueAt(cl.number, _t5483) !== -1)); } let _c5486: boolean = _c5484; if (_c5486) {   const _t5485 = sp.edgeEnds[2 * _te5482 + 1];   _c5486 = !((clueAt(cl.number, _t5485) !== -1)); } return _c5486; });
                                        for (let _i5488 = 0; _i5488 < _a5487.length; _i5488++) {
                                          const v_t = _a5487[_i5488];
                                          const _h5491 = clueAt(cl.number, v_t);
                                          const _h5492 = (_h5491 !== -1);
                                          const _h5493 = _h5492;
                                          const _h5494 = !(_h5493);
                                          const _a5489 = sp.adj4[v_t];
                                          for (let _i5490 = 0; _i5490 < _a5489.length; _i5490++) {
                                            const v_x = _a5489[_i5490];
                                            const _h5495 = clueAt(cl.number, v_x);
                                            let _c5497: boolean = (_h5494 && (_h5495 !== -1));
                                            if (_c5497) {
                                              const _t5496 = sp.adj4Edges[v_t][_i5490];
                                              _c5497 = ((_t5496 === _wc5036 ? _wd5037 : (_t5496 === _wc5034 ? _wd5035 : (b.grid[_t5496] || -1))) === 1);
                                            }
                                            if (!(_c5497)) continue;
                                            const _t5498 = v_x;
                                            if (_g5468.length < 16) { if (!_g5468.includes(_t5498)) _g5468.push(_t5498); } else addOnce(_g5468, _st5481, _t5498);
                                          }
                                        }
                                      }
                                      const _a5499 = union(_g5463, _g5468);
                                      for (let _i5500 = 0; _i5500 < _a5499.length; _i5500++) {
                                        const v_q = _a5499[_i5500];
                                        const _h5502 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5501 - _h5502)) === cl.step))) {
                                          _q5423 = false;
                                          break Q5424;
                                        }
                                      }
                                    }
                                  }
                                  _c5503 = _q5423;
                                }
                                if (!((_c5503 && (_h5052 || !(throughWhere(sp, v_s, (_te5504: number): boolean => {  return ((_te5504 === _wc5036 ? _wd5037 : (_te5504 === _wc5034 ? _wd5035 : (b.grid[_te5504] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g5505 = 0;
                                G5506: {
                                  const _a5507 = sp.adj4[v_s];
                                  for (let _i5508 = 0; _i5508 < _a5507.length; _i5508++) {
                                    const _t5509 = sp.adj4Edges[v_s][_i5508];
                                    if (!(((_t5509 === _wc5036 ? _wd5037 : (_t5509 === _wc5034 ? _wd5035 : (b.grid[_t5509] || -1))) === 1))) continue;
                                    _g5505++;
                                  }
                                }
                                let _g5510 = 0;
                                G5511: {
                                  for (let _i5512 = 0; _i5512 < 1; _i5512++) {
                                    const v_k = v_s;
                                    const _h5513 = clueAt(cl.number, v_k);
                                    const _h5520 = (_h5513 + 1);
                                    let _c5522: boolean = (_h5513 !== -1);
                                    if (_c5522) {
                                      let _c5521: boolean = (_h5052 || (_h5513 === 1));
                                      if (!_c5521) {
                                        let _g5514 = 0;
                                        G5515: {
                                          const _t5516 = (_h5513 + 1);
                                          const _a5517 = cluesValued(cl.number, _t5516);
                                          for (let _i5518 = 0; _i5518 < _a5517.length; _i5518++) {
                                            const v_x = _a5517[_i5518];
                                            const _h5519 = clueAt(cl.number, v_x);
                                            if (!((_h5519 === _h5520))) continue;
                                            _g5514++;
                                          }
                                        }
                                        _c5521 = (_g5514 === 0);
                                      }
                                      _c5522 = _c5521;
                                    }
                                    if (!(_c5522)) continue;
                                    _g5510++;
                                  }
                                }
                                let _c5649: boolean = ((_g5505 + 1) === (2 - _g5510));
                                if (!_c5649) {
                                  let _q5523 = false;
                                  Q5524: {
                                    const _a5525 = sp.adj4[v_s];
                                    const _n5526 = _i5382;
                                    for (let _i5527 = 0; _i5527 < _n5526; _i5527++) {
                                      const v_z = _a5525[_i5527];
                                      const _t5528 = sp.adj4Edges[v_s][_i5527];
                                      let _c5547: boolean = !((_t5528 === _wc5036 ? true : (_t5528 === _wc5034 ? true : (b.grid[_t5528] !== 0))));
                                      if (_c5547) {
                                        let _g5529 = 0;
                                        G5530: {
                                          const _a5531 = sp.adj4[v_s];
                                          for (let _i5532 = 0; _i5532 < _a5531.length; _i5532++) {
                                            const _t5533 = sp.adj4Edges[v_s][_i5532];
                                            if (!(((_t5533 === _wc5036 ? _wd5037 : (_t5533 === _wc5034 ? _wd5035 : (b.grid[_t5533] || -1))) === 1))) continue;
                                            _g5529++;
                                          }
                                        }
                                        let _g5534 = 0;
                                        G5535: {
                                          for (let _i5536 = 0; _i5536 < 1; _i5536++) {
                                            const v_k = v_s;
                                            const _h5537 = clueAt(cl.number, v_k);
                                            const _h5544 = (_h5537 + 1);
                                            let _c5546: boolean = (_h5537 !== -1);
                                            if (_c5546) {
                                              let _c5545: boolean = (_h5052 || (_h5537 === 1));
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
                                            _g5534++;
                                          }
                                        }
                                        _c5547 = (_g5529 < (2 - _g5534));
                                      }
                                      let _c5566: boolean = _c5547;
                                      if (_c5566) {
                                        let _g5548 = 0;
                                        G5549: {
                                          const _a5550 = sp.adj4[v_z];
                                          for (let _i5551 = 0; _i5551 < _a5550.length; _i5551++) {
                                            const _t5552 = sp.adj4Edges[v_z][_i5551];
                                            if (!(((_t5552 === _wc5036 ? _wd5037 : (_t5552 === _wc5034 ? _wd5035 : (b.grid[_t5552] || -1))) === 1))) continue;
                                            _g5548++;
                                          }
                                        }
                                        let _g5553 = 0;
                                        G5554: {
                                          for (let _i5555 = 0; _i5555 < 1; _i5555++) {
                                            const v_k = v_z;
                                            const _h5556 = clueAt(cl.number, v_k);
                                            const _h5563 = (_h5556 + 1);
                                            let _c5565: boolean = (_h5556 !== -1);
                                            if (_c5565) {
                                              let _c5564: boolean = (_h5052 || (_h5556 === 1));
                                              if (!_c5564) {
                                                let _g5557 = 0;
                                                G5558: {
                                                  const _t5559 = (_h5556 + 1);
                                                  const _a5560 = cluesValued(cl.number, _t5559);
                                                  for (let _i5561 = 0; _i5561 < _a5560.length; _i5561++) {
                                                    const v_x = _a5560[_i5561];
                                                    const _h5562 = clueAt(cl.number, v_x);
                                                    if (!((_h5562 === _h5563))) continue;
                                                    _g5557++;
                                                  }
                                                }
                                                _c5564 = (_g5557 === 0);
                                              }
                                              _c5565 = _c5564;
                                            }
                                            if (!(_c5565)) continue;
                                            _g5553++;
                                          }
                                        }
                                        _c5566 = (_g5548 < (2 - _g5553));
                                      }
                                      let _c5647: boolean = _c5566;
                                      if (_c5647) {
                                        let _q5567 = true;
                                        Q5568: {
                                          _g5569.length = 0;
                                          G5570: {
                                            for (let _i5572 = 0; _i5572 < 1; _i5572++) {
                                              const v_x = v_s;
                                              const _h5573 = clueAt(cl.number, v_x);
                                              if (!((_h5573 !== -1))) continue;
                                              _g5569.push(v_x);
                                            }
                                          }
                                          _g5574.length = 0;
                                          _st5587.pass++;
                                          G5575: {
                                            const _a5593 = throughWhere(sp, v_s, (_te5588: number): boolean => { let _c5590: boolean = ((_te5588 === _wc5036 ? _wd5037 : (_te5588 === _wc5034 ? _wd5035 : (b.grid[_te5588] || -1))) === 1); if (_c5590) {   const _t5589 = sp.edgeEnds[2 * _te5588];   _c5590 = !((clueAt(cl.number, _t5589) !== -1)); } let _c5592: boolean = _c5590; if (_c5592) {   const _t5591 = sp.edgeEnds[2 * _te5588 + 1];   _c5592 = !((clueAt(cl.number, _t5591) !== -1)); } return _c5592; });
                                            for (let _i5594 = 0; _i5594 < _a5593.length; _i5594++) {
                                              const v_t = _a5593[_i5594];
                                              const _h5597 = clueAt(cl.number, v_t);
                                              const _h5598 = (_h5597 !== -1);
                                              const _h5599 = _h5598;
                                              const _h5600 = !(_h5599);
                                              const _a5595 = sp.adj4[v_t];
                                              for (let _i5596 = 0; _i5596 < _a5595.length; _i5596++) {
                                                const v_x = _a5595[_i5596];
                                                const _h5601 = clueAt(cl.number, v_x);
                                                let _c5603: boolean = (_h5600 && (_h5601 !== -1));
                                                if (_c5603) {
                                                  const _t5602 = sp.adj4Edges[v_t][_i5596];
                                                  _c5603 = ((_t5602 === _wc5036 ? _wd5037 : (_t5602 === _wc5034 ? _wd5035 : (b.grid[_t5602] || -1))) === 1);
                                                }
                                                if (!(_c5603)) continue;
                                                const _t5604 = v_x;
                                                if (_g5574.length < 16) { if (!_g5574.includes(_t5604)) _g5574.push(_t5604); } else addOnce(_g5574, _st5587, _t5604);
                                              }
                                            }
                                          }
                                          const _a5605 = union(_g5569, _g5574);
                                          for (let _i5606 = 0; _i5606 < _a5605.length; _i5606++) {
                                            const v_p = _a5605[_i5606];
                                            const _h5645 = clueAt(cl.number, v_p);
                                            _g5607.length = 0;
                                            G5608: {
                                              for (let _i5610 = 0; _i5610 < 1; _i5610++) {
                                                const v_x = v_z;
                                                const _h5611 = clueAt(cl.number, v_x);
                                                if (!((_h5611 !== -1))) continue;
                                                _g5607.push(v_x);
                                              }
                                            }
                                            _g5612.length = 0;
                                            _st5625.pass++;
                                            G5613: {
                                              const _a5631 = throughWhere(sp, v_z, (_te5626: number): boolean => { let _c5628: boolean = ((_te5626 === _wc5036 ? _wd5037 : (_te5626 === _wc5034 ? _wd5035 : (b.grid[_te5626] || -1))) === 1); if (_c5628) {   const _t5627 = sp.edgeEnds[2 * _te5626];   _c5628 = !((clueAt(cl.number, _t5627) !== -1)); } let _c5630: boolean = _c5628; if (_c5630) {   const _t5629 = sp.edgeEnds[2 * _te5626 + 1];   _c5630 = !((clueAt(cl.number, _t5629) !== -1)); } return _c5630; });
                                              for (let _i5632 = 0; _i5632 < _a5631.length; _i5632++) {
                                                const v_t = _a5631[_i5632];
                                                const _h5635 = clueAt(cl.number, v_t);
                                                const _h5636 = (_h5635 !== -1);
                                                const _h5637 = _h5636;
                                                const _h5638 = !(_h5637);
                                                const _a5633 = sp.adj4[v_t];
                                                for (let _i5634 = 0; _i5634 < _a5633.length; _i5634++) {
                                                  const v_x = _a5633[_i5634];
                                                  const _h5639 = clueAt(cl.number, v_x);
                                                  let _c5641: boolean = (_h5638 && (_h5639 !== -1));
                                                  if (_c5641) {
                                                    const _t5640 = sp.adj4Edges[v_t][_i5634];
                                                    _c5641 = ((_t5640 === _wc5036 ? _wd5037 : (_t5640 === _wc5034 ? _wd5035 : (b.grid[_t5640] || -1))) === 1);
                                                  }
                                                  if (!(_c5641)) continue;
                                                  const _t5642 = v_x;
                                                  if (_g5612.length < 16) { if (!_g5612.includes(_t5642)) _g5612.push(_t5642); } else addOnce(_g5612, _st5625, _t5642);
                                                }
                                              }
                                            }
                                            const _a5643 = union(_g5607, _g5612);
                                            for (let _i5644 = 0; _i5644 < _a5643.length; _i5644++) {
                                              const v_q = _a5643[_i5644];
                                              const _h5646 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h5645 - _h5646)) === cl.step))) {
                                                _q5567 = false;
                                                break Q5568;
                                              }
                                            }
                                          }
                                        }
                                        _c5647 = _q5567;
                                      }
                                      if ((_c5647 && (_h5052 || !(throughWhere(sp, v_s, (_te5648: number): boolean => {  return ((_te5648 === _wc5036 ? _wd5037 : (_te5648 === _wc5034 ? _wd5035 : (b.grid[_te5648] || -1))) === 1); }).includes(v_z))))) {
                                        _q5523 = true;
                                        break Q5524;
                                      }
                                    }
                                  }
                                  _c5649 = _q5523;
                                }
                                if (_c5649) {
                                  _q5379 = true;
                                  break Q5380;
                                }
                              }
                            }
                            _c5650 = !(_q5379);
                          }
                          if (_c5650) {
                            _q5357 = true;
                            break Q5358;
                          }
                        }
                      }
                      _c5651 = _q5357;
                    }
                    if (_c5651) {
                      _q5038 = true;
                      break Q5039;
                    }
                  }
                }
                _c5652 = _q5038;
              }
              _c5653 = _c5652;
            }
            if (!(_c5653)) continue;
            const _t5654 = v_j;
            if (_g4507.length < 16) { if (!_g4507.includes(_t5654)) _g4507.push(_t5654); } else addOnce(_g4507, _st5022, _t5654);
          }
        }
      }
      const v_A = _g4507;
      const _h6815 = v_A.length;
      const _h6816 = (_h6815 < 3);
      _g5655.length = 0;
      _st6171.pass++;
      G5656: {
        const _a6172 = v_U;
        for (let _i6173 = 0; _i6173 < _a6172.length; _i6173++) {
          const v_i = _a6172[_i6173];
          const _h6176 = _i6173;
          const _h6177 = (_h6176 > 0);
          const _h6178 = sp.edgeOf(v_c, v_i);
          const _a6174 = v_U;
          for (let _i6175 = 0; _i6175 < _a6174.length; _i6175++) {
            const v_j = _a6174[_i6175];
            let _c6797: boolean = (_h6177 && (_h6176 < _i6175));
            if (_c6797) {
              let _c6796: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h5032 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c6796) {
                const _wc6179 = _h6178;
                const _wd6180 = 1;
                const _wc6181 = sp.edgeOf(v_c, v_j);
                const _wd6182 = 1;
                let _q6183 = false;
                Q6184: {
                  const _a6186 = throughWhere(sp, v_c, (_te6185: number): boolean => {  return ((_te6185 === _wc6181 ? _wd6182 : (_te6185 === _wc6179 ? _wd6180 : (b.grid[_te6185] || -1))) === 1); });
                  for (let _i6187 = 0; _i6187 < _a6186.length; _i6187++) {
                    const v_t = _a6186[_i6187];
                    let _c6206: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6206) {
                      let _g6188 = 0;
                      G6189: {
                        const _a6190 = sp.adj4[v_t];
                        for (let _i6191 = 0; _i6191 < _a6190.length; _i6191++) {
                          const _t6192 = sp.adj4Edges[v_t][_i6191];
                          if (!(((_t6192 === _wc6181 ? _wd6182 : (_t6192 === _wc6179 ? _wd6180 : (b.grid[_t6192] || -1))) === 1))) continue;
                          _g6188++;
                        }
                      }
                      let _g6193 = 0;
                      G6194: {
                        for (let _i6195 = 0; _i6195 < 1; _i6195++) {
                          const v_k = v_t;
                          const _h6196 = clueAt(cl.number, v_k);
                          const _h6203 = (_h6196 + 1);
                          let _c6205: boolean = (_h6196 !== -1);
                          if (_c6205) {
                            let _c6204: boolean = (_h5052 || (_h6196 === 1));
                            if (!_c6204) {
                              let _g6197 = 0;
                              G6198: {
                                const _t6199 = (_h6196 + 1);
                                const _a6200 = cluesValued(cl.number, _t6199);
                                for (let _i6201 = 0; _i6201 < _a6200.length; _i6201++) {
                                  const v_x = _a6200[_i6201];
                                  const _h6202 = clueAt(cl.number, v_x);
                                  if (!((_h6202 === _h6203))) continue;
                                  _g6197++;
                                }
                              }
                              _c6204 = (_g6197 === 0);
                            }
                            _c6205 = _c6204;
                          }
                          if (!(_c6205)) continue;
                          _g6193++;
                        }
                      }
                      _c6206 = (_g6188 < (2 - _g6193));
                    }
                    if (!(_c6206)) continue;
                    let _g6207 = 0;
                    G6208: {
                      const _a6209 = sp.adj4[v_t];
                      for (let _i6210 = 0; _i6210 < _a6209.length; _i6210++) {
                        const _t6211 = sp.adj4Edges[v_t][_i6210];
                        if (!(((_t6211 === _wc6181 ? _wd6182 : (_t6211 === _wc6179 ? _wd6180 : (b.grid[_t6211] || -1))) === 1))) continue;
                        _g6207++;
                      }
                    }
                    let _g6212 = 0;
                    G6213: {
                      for (let _i6214 = 0; _i6214 < 1; _i6214++) {
                        const v_k = v_t;
                        const _h6215 = clueAt(cl.number, v_k);
                        const _h6222 = (_h6215 + 1);
                        let _c6224: boolean = (_h6215 !== -1);
                        if (_c6224) {
                          let _c6223: boolean = (_h5052 || (_h6215 === 1));
                          if (!_c6223) {
                            let _g6216 = 0;
                            G6217: {
                              const _t6218 = (_h6215 + 1);
                              const _a6219 = cluesValued(cl.number, _t6218);
                              for (let _i6220 = 0; _i6220 < _a6219.length; _i6220++) {
                                const v_x = _a6219[_i6220];
                                const _h6221 = clueAt(cl.number, v_x);
                                if (!((_h6221 === _h6222))) continue;
                                _g6216++;
                              }
                            }
                            _c6223 = (_g6216 === 0);
                          }
                          _c6224 = _c6223;
                        }
                        if (!(_c6224)) continue;
                        _g6212++;
                      }
                    }
                    let _c6500: boolean = (_g6207 < (2 - _g6212));
                    if (_c6500) {
                      let _q6225 = false;
                      Q6226: {
                        const _a6227 = sp.adj4[v_t];
                        for (let _i6228 = 0; _i6228 < _a6227.length; _i6228++) {
                          const v_y = _a6227[_i6228];
                          const _t6229 = sp.adj4Edges[v_t][_i6228];
                          let _c6248: boolean = !((_t6229 === _wc6181 ? true : (_t6229 === _wc6179 ? true : (b.grid[_t6229] !== 0))));
                          if (_c6248) {
                            let _g6230 = 0;
                            G6231: {
                              const _a6232 = sp.adj4[v_t];
                              for (let _i6233 = 0; _i6233 < _a6232.length; _i6233++) {
                                const _t6234 = sp.adj4Edges[v_t][_i6233];
                                if (!(((_t6234 === _wc6181 ? _wd6182 : (_t6234 === _wc6179 ? _wd6180 : (b.grid[_t6234] || -1))) === 1))) continue;
                                _g6230++;
                              }
                            }
                            let _g6235 = 0;
                            G6236: {
                              for (let _i6237 = 0; _i6237 < 1; _i6237++) {
                                const v_k = v_t;
                                const _h6238 = clueAt(cl.number, v_k);
                                const _h6245 = (_h6238 + 1);
                                let _c6247: boolean = (_h6238 !== -1);
                                if (_c6247) {
                                  let _c6246: boolean = (_h5052 || (_h6238 === 1));
                                  if (!_c6246) {
                                    let _g6239 = 0;
                                    G6240: {
                                      const _t6241 = (_h6238 + 1);
                                      const _a6242 = cluesValued(cl.number, _t6241);
                                      for (let _i6243 = 0; _i6243 < _a6242.length; _i6243++) {
                                        const v_x = _a6242[_i6243];
                                        const _h6244 = clueAt(cl.number, v_x);
                                        if (!((_h6244 === _h6245))) continue;
                                        _g6239++;
                                      }
                                    }
                                    _c6246 = (_g6239 === 0);
                                  }
                                  _c6247 = _c6246;
                                }
                                if (!(_c6247)) continue;
                                _g6235++;
                              }
                            }
                            _c6248 = (_g6230 < (2 - _g6235));
                          }
                          let _c6268: boolean = _c6248;
                          if (_c6268) {
                            let _g6249 = 0;
                            G6250: {
                              const _a6252 = sp.adj4[v_y];
                              for (let _i6253 = 0; _i6253 < _a6252.length; _i6253++) {
                                const _t6254 = sp.adj4Edges[v_y][_i6253];
                                if (!(((_t6254 === _wc6181 ? _wd6182 : (_t6254 === _wc6179 ? _wd6180 : (b.grid[_t6254] || -1))) === 1))) continue;
                                _g6249++;
                              }
                            }
                            let _g6255 = 0;
                            G6256: {
                              for (let _i6257 = 0; _i6257 < 1; _i6257++) {
                                const v_k = v_y;
                                const _h6258 = clueAt(cl.number, v_k);
                                const _h6265 = (_h6258 + 1);
                                let _c6267: boolean = (_h6258 !== -1);
                                if (_c6267) {
                                  let _c6266: boolean = (_h5052 || (_h6258 === 1));
                                  if (!_c6266) {
                                    let _g6259 = 0;
                                    G6260: {
                                      const _t6261 = (_h6258 + 1);
                                      const _a6262 = cluesValued(cl.number, _t6261);
                                      for (let _i6263 = 0; _i6263 < _a6262.length; _i6263++) {
                                        const v_x = _a6262[_i6263];
                                        const _h6264 = clueAt(cl.number, v_x);
                                        if (!((_h6264 === _h6265))) continue;
                                        _g6259++;
                                      }
                                    }
                                    _c6266 = (_g6259 === 0);
                                  }
                                  _c6267 = _c6266;
                                }
                                if (!(_c6267)) continue;
                                _g6255++;
                              }
                            }
                            _c6268 = (_g6249 < (2 - _g6255));
                          }
                          let _c6351: boolean = _c6268;
                          if (_c6351) {
                            let _q6269 = true;
                            Q6270: {
                              _g6271.length = 0;
                              G6272: {
                                for (let _i6274 = 0; _i6274 < 1; _i6274++) {
                                  const v_x = v_t;
                                  const _h6275 = clueAt(cl.number, v_x);
                                  if (!((_h6275 !== -1))) continue;
                                  _g6271.push(v_x);
                                }
                              }
                              _g6276.length = 0;
                              _st6290.pass++;
                              G6277: {
                                const _a6297 = throughWhere(sp, v_t, (_te6292: number): boolean => { let _c6294: boolean = ((_te6292 === _wc6181 ? _wd6182 : (_te6292 === _wc6179 ? _wd6180 : (b.grid[_te6292] || -1))) === 1); if (_c6294) {   const _t6293 = sp.edgeEnds[2 * _te6292];   _c6294 = !((clueAt(cl.number, _t6293) !== -1)); } let _c6296: boolean = _c6294; if (_c6296) {   const _t6295 = sp.edgeEnds[2 * _te6292 + 1];   _c6296 = !((clueAt(cl.number, _t6295) !== -1)); } return _c6296; });
                                for (let _i6298 = 0; _i6298 < _a6297.length; _i6298++) {
                                  const v_t_6291 = _a6297[_i6298];
                                  const _h6301 = clueAt(cl.number, v_t_6291);
                                  const _h6302 = (_h6301 !== -1);
                                  const _h6303 = _h6302;
                                  const _h6304 = !(_h6303);
                                  const _a6299 = sp.adj4[v_t_6291];
                                  for (let _i6300 = 0; _i6300 < _a6299.length; _i6300++) {
                                    const v_x = _a6299[_i6300];
                                    const _h6305 = clueAt(cl.number, v_x);
                                    let _c6307: boolean = (_h6304 && (_h6305 !== -1));
                                    if (_c6307) {
                                      const _t6306 = sp.adj4Edges[v_t_6291][_i6300];
                                      _c6307 = ((_t6306 === _wc6181 ? _wd6182 : (_t6306 === _wc6179 ? _wd6180 : (b.grid[_t6306] || -1))) === 1);
                                    }
                                    if (!(_c6307)) continue;
                                    const _t6308 = v_x;
                                    if (_g6276.length < 16) { if (!_g6276.includes(_t6308)) _g6276.push(_t6308); } else addOnce(_g6276, _st6290, _t6308);
                                  }
                                }
                              }
                              const _a6309 = union(_g6271, _g6276);
                              for (let _i6310 = 0; _i6310 < _a6309.length; _i6310++) {
                                const v_p = _a6309[_i6310];
                                const _h6349 = clueAt(cl.number, v_p);
                                _g6311.length = 0;
                                G6312: {
                                  for (let _i6314 = 0; _i6314 < 1; _i6314++) {
                                    const v_x = v_y;
                                    const _h6315 = clueAt(cl.number, v_x);
                                    if (!((_h6315 !== -1))) continue;
                                    _g6311.push(v_x);
                                  }
                                }
                                _g6316.length = 0;
                                _st6329.pass++;
                                G6317: {
                                  const _a6335 = throughWhere(sp, v_y, (_te6330: number): boolean => { let _c6332: boolean = ((_te6330 === _wc6181 ? _wd6182 : (_te6330 === _wc6179 ? _wd6180 : (b.grid[_te6330] || -1))) === 1); if (_c6332) {   const _t6331 = sp.edgeEnds[2 * _te6330];   _c6332 = !((clueAt(cl.number, _t6331) !== -1)); } let _c6334: boolean = _c6332; if (_c6334) {   const _t6333 = sp.edgeEnds[2 * _te6330 + 1];   _c6334 = !((clueAt(cl.number, _t6333) !== -1)); } return _c6334; });
                                  for (let _i6336 = 0; _i6336 < _a6335.length; _i6336++) {
                                    const v_t = _a6335[_i6336];
                                    const _h6339 = clueAt(cl.number, v_t);
                                    const _h6340 = (_h6339 !== -1);
                                    const _h6341 = _h6340;
                                    const _h6342 = !(_h6341);
                                    const _a6337 = sp.adj4[v_t];
                                    for (let _i6338 = 0; _i6338 < _a6337.length; _i6338++) {
                                      const v_x = _a6337[_i6338];
                                      const _h6343 = clueAt(cl.number, v_x);
                                      let _c6345: boolean = (_h6342 && (_h6343 !== -1));
                                      if (_c6345) {
                                        const _t6344 = sp.adj4Edges[v_t][_i6338];
                                        _c6345 = ((_t6344 === _wc6181 ? _wd6182 : (_t6344 === _wc6179 ? _wd6180 : (b.grid[_t6344] || -1))) === 1);
                                      }
                                      if (!(_c6345)) continue;
                                      const _t6346 = v_x;
                                      if (_g6316.length < 16) { if (!_g6316.includes(_t6346)) _g6316.push(_t6346); } else addOnce(_g6316, _st6329, _t6346);
                                    }
                                  }
                                }
                                const _a6347 = union(_g6311, _g6316);
                                for (let _i6348 = 0; _i6348 < _a6347.length; _i6348++) {
                                  const v_q = _a6347[_i6348];
                                  const _h6350 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6349 - _h6350)) === cl.step))) {
                                    _q6269 = false;
                                    break Q6270;
                                  }
                                }
                              }
                            }
                            _c6351 = _q6269;
                          }
                          if (!((_c6351 && (_h5052 || !(throughWhere(sp, v_t, (_te6352: number): boolean => {  return ((_te6352 === _wc6181 ? _wd6182 : (_te6352 === _wc6179 ? _wd6180 : (b.grid[_te6352] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6353 = 0;
                          G6354: {
                            const _a6355 = sp.adj4[v_t];
                            for (let _i6356 = 0; _i6356 < _a6355.length; _i6356++) {
                              const _t6357 = sp.adj4Edges[v_t][_i6356];
                              if (!(((_t6357 === _wc6181 ? _wd6182 : (_t6357 === _wc6179 ? _wd6180 : (b.grid[_t6357] || -1))) === 1))) continue;
                              _g6353++;
                            }
                          }
                          let _g6358 = 0;
                          G6359: {
                            for (let _i6360 = 0; _i6360 < 1; _i6360++) {
                              const v_k = v_t;
                              const _h6361 = clueAt(cl.number, v_k);
                              const _h6368 = (_h6361 + 1);
                              let _c6370: boolean = (_h6361 !== -1);
                              if (_c6370) {
                                let _c6369: boolean = (_h5052 || (_h6361 === 1));
                                if (!_c6369) {
                                  let _g6362 = 0;
                                  G6363: {
                                    const _t6364 = (_h6361 + 1);
                                    const _a6365 = cluesValued(cl.number, _t6364);
                                    for (let _i6366 = 0; _i6366 < _a6365.length; _i6366++) {
                                      const v_x = _a6365[_i6366];
                                      const _h6367 = clueAt(cl.number, v_x);
                                      if (!((_h6367 === _h6368))) continue;
                                      _g6362++;
                                    }
                                  }
                                  _c6369 = (_g6362 === 0);
                                }
                                _c6370 = _c6369;
                              }
                              if (!(_c6370)) continue;
                              _g6358++;
                            }
                          }
                          let _c6499: boolean = ((_g6353 + 1) === (2 - _g6358));
                          if (!_c6499) {
                            let _q6371 = false;
                            Q6372: {
                              const _a6373 = sp.adj4[v_t];
                              const _n6374 = _i6228;
                              for (let _i6375 = 0; _i6375 < _n6374; _i6375++) {
                                const v_z = _a6373[_i6375];
                                const _t6376 = sp.adj4Edges[v_t][_i6375];
                                let _c6395: boolean = !((_t6376 === _wc6181 ? true : (_t6376 === _wc6179 ? true : (b.grid[_t6376] !== 0))));
                                if (_c6395) {
                                  let _g6377 = 0;
                                  G6378: {
                                    const _a6379 = sp.adj4[v_t];
                                    for (let _i6380 = 0; _i6380 < _a6379.length; _i6380++) {
                                      const _t6381 = sp.adj4Edges[v_t][_i6380];
                                      if (!(((_t6381 === _wc6181 ? _wd6182 : (_t6381 === _wc6179 ? _wd6180 : (b.grid[_t6381] || -1))) === 1))) continue;
                                      _g6377++;
                                    }
                                  }
                                  let _g6382 = 0;
                                  G6383: {
                                    for (let _i6384 = 0; _i6384 < 1; _i6384++) {
                                      const v_k = v_t;
                                      const _h6385 = clueAt(cl.number, v_k);
                                      const _h6392 = (_h6385 + 1);
                                      let _c6394: boolean = (_h6385 !== -1);
                                      if (_c6394) {
                                        let _c6393: boolean = (_h5052 || (_h6385 === 1));
                                        if (!_c6393) {
                                          let _g6386 = 0;
                                          G6387: {
                                            const _t6388 = (_h6385 + 1);
                                            const _a6389 = cluesValued(cl.number, _t6388);
                                            for (let _i6390 = 0; _i6390 < _a6389.length; _i6390++) {
                                              const v_x = _a6389[_i6390];
                                              const _h6391 = clueAt(cl.number, v_x);
                                              if (!((_h6391 === _h6392))) continue;
                                              _g6386++;
                                            }
                                          }
                                          _c6393 = (_g6386 === 0);
                                        }
                                        _c6394 = _c6393;
                                      }
                                      if (!(_c6394)) continue;
                                      _g6382++;
                                    }
                                  }
                                  _c6395 = (_g6377 < (2 - _g6382));
                                }
                                let _c6414: boolean = _c6395;
                                if (_c6414) {
                                  let _g6396 = 0;
                                  G6397: {
                                    const _a6398 = sp.adj4[v_z];
                                    for (let _i6399 = 0; _i6399 < _a6398.length; _i6399++) {
                                      const _t6400 = sp.adj4Edges[v_z][_i6399];
                                      if (!(((_t6400 === _wc6181 ? _wd6182 : (_t6400 === _wc6179 ? _wd6180 : (b.grid[_t6400] || -1))) === 1))) continue;
                                      _g6396++;
                                    }
                                  }
                                  let _g6401 = 0;
                                  G6402: {
                                    for (let _i6403 = 0; _i6403 < 1; _i6403++) {
                                      const v_k = v_z;
                                      const _h6404 = clueAt(cl.number, v_k);
                                      const _h6411 = (_h6404 + 1);
                                      let _c6413: boolean = (_h6404 !== -1);
                                      if (_c6413) {
                                        let _c6412: boolean = (_h5052 || (_h6404 === 1));
                                        if (!_c6412) {
                                          let _g6405 = 0;
                                          G6406: {
                                            const _t6407 = (_h6404 + 1);
                                            const _a6408 = cluesValued(cl.number, _t6407);
                                            for (let _i6409 = 0; _i6409 < _a6408.length; _i6409++) {
                                              const v_x = _a6408[_i6409];
                                              const _h6410 = clueAt(cl.number, v_x);
                                              if (!((_h6410 === _h6411))) continue;
                                              _g6405++;
                                            }
                                          }
                                          _c6412 = (_g6405 === 0);
                                        }
                                        _c6413 = _c6412;
                                      }
                                      if (!(_c6413)) continue;
                                      _g6401++;
                                    }
                                  }
                                  _c6414 = (_g6396 < (2 - _g6401));
                                }
                                let _c6497: boolean = _c6414;
                                if (_c6497) {
                                  let _q6415 = true;
                                  Q6416: {
                                    _g6417.length = 0;
                                    G6418: {
                                      for (let _i6420 = 0; _i6420 < 1; _i6420++) {
                                        const v_x = v_t;
                                        const _h6421 = clueAt(cl.number, v_x);
                                        if (!((_h6421 !== -1))) continue;
                                        _g6417.push(v_x);
                                      }
                                    }
                                    _g6422.length = 0;
                                    _st6436.pass++;
                                    G6423: {
                                      const _a6443 = throughWhere(sp, v_t, (_te6438: number): boolean => { let _c6440: boolean = ((_te6438 === _wc6181 ? _wd6182 : (_te6438 === _wc6179 ? _wd6180 : (b.grid[_te6438] || -1))) === 1); if (_c6440) {   const _t6439 = sp.edgeEnds[2 * _te6438];   _c6440 = !((clueAt(cl.number, _t6439) !== -1)); } let _c6442: boolean = _c6440; if (_c6442) {   const _t6441 = sp.edgeEnds[2 * _te6438 + 1];   _c6442 = !((clueAt(cl.number, _t6441) !== -1)); } return _c6442; });
                                      for (let _i6444 = 0; _i6444 < _a6443.length; _i6444++) {
                                        const v_t_6437 = _a6443[_i6444];
                                        const _h6447 = clueAt(cl.number, v_t_6437);
                                        const _h6448 = (_h6447 !== -1);
                                        const _h6449 = _h6448;
                                        const _h6450 = !(_h6449);
                                        const _a6445 = sp.adj4[v_t_6437];
                                        for (let _i6446 = 0; _i6446 < _a6445.length; _i6446++) {
                                          const v_x = _a6445[_i6446];
                                          const _h6451 = clueAt(cl.number, v_x);
                                          let _c6453: boolean = (_h6450 && (_h6451 !== -1));
                                          if (_c6453) {
                                            const _t6452 = sp.adj4Edges[v_t_6437][_i6446];
                                            _c6453 = ((_t6452 === _wc6181 ? _wd6182 : (_t6452 === _wc6179 ? _wd6180 : (b.grid[_t6452] || -1))) === 1);
                                          }
                                          if (!(_c6453)) continue;
                                          const _t6454 = v_x;
                                          if (_g6422.length < 16) { if (!_g6422.includes(_t6454)) _g6422.push(_t6454); } else addOnce(_g6422, _st6436, _t6454);
                                        }
                                      }
                                    }
                                    const _a6455 = union(_g6417, _g6422);
                                    for (let _i6456 = 0; _i6456 < _a6455.length; _i6456++) {
                                      const v_p = _a6455[_i6456];
                                      const _h6495 = clueAt(cl.number, v_p);
                                      _g6457.length = 0;
                                      G6458: {
                                        for (let _i6460 = 0; _i6460 < 1; _i6460++) {
                                          const v_x = v_z;
                                          const _h6461 = clueAt(cl.number, v_x);
                                          if (!((_h6461 !== -1))) continue;
                                          _g6457.push(v_x);
                                        }
                                      }
                                      _g6462.length = 0;
                                      _st6475.pass++;
                                      G6463: {
                                        const _a6481 = throughWhere(sp, v_z, (_te6476: number): boolean => { let _c6478: boolean = ((_te6476 === _wc6181 ? _wd6182 : (_te6476 === _wc6179 ? _wd6180 : (b.grid[_te6476] || -1))) === 1); if (_c6478) {   const _t6477 = sp.edgeEnds[2 * _te6476];   _c6478 = !((clueAt(cl.number, _t6477) !== -1)); } let _c6480: boolean = _c6478; if (_c6480) {   const _t6479 = sp.edgeEnds[2 * _te6476 + 1];   _c6480 = !((clueAt(cl.number, _t6479) !== -1)); } return _c6480; });
                                        for (let _i6482 = 0; _i6482 < _a6481.length; _i6482++) {
                                          const v_t = _a6481[_i6482];
                                          const _h6485 = clueAt(cl.number, v_t);
                                          const _h6486 = (_h6485 !== -1);
                                          const _h6487 = _h6486;
                                          const _h6488 = !(_h6487);
                                          const _a6483 = sp.adj4[v_t];
                                          for (let _i6484 = 0; _i6484 < _a6483.length; _i6484++) {
                                            const v_x = _a6483[_i6484];
                                            const _h6489 = clueAt(cl.number, v_x);
                                            let _c6491: boolean = (_h6488 && (_h6489 !== -1));
                                            if (_c6491) {
                                              const _t6490 = sp.adj4Edges[v_t][_i6484];
                                              _c6491 = ((_t6490 === _wc6181 ? _wd6182 : (_t6490 === _wc6179 ? _wd6180 : (b.grid[_t6490] || -1))) === 1);
                                            }
                                            if (!(_c6491)) continue;
                                            const _t6492 = v_x;
                                            if (_g6462.length < 16) { if (!_g6462.includes(_t6492)) _g6462.push(_t6492); } else addOnce(_g6462, _st6475, _t6492);
                                          }
                                        }
                                      }
                                      const _a6493 = union(_g6457, _g6462);
                                      for (let _i6494 = 0; _i6494 < _a6493.length; _i6494++) {
                                        const v_q = _a6493[_i6494];
                                        const _h6496 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6495 - _h6496)) === cl.step))) {
                                          _q6415 = false;
                                          break Q6416;
                                        }
                                      }
                                    }
                                  }
                                  _c6497 = _q6415;
                                }
                                if ((_c6497 && (_h5052 || !(throughWhere(sp, v_t, (_te6498: number): boolean => {  return ((_te6498 === _wc6181 ? _wd6182 : (_te6498 === _wc6179 ? _wd6180 : (b.grid[_te6498] || -1))) === 1); }).includes(v_z))))) {
                                  _q6371 = true;
                                  break Q6372;
                                }
                              }
                            }
                            _c6499 = _q6371;
                          }
                          if (_c6499) {
                            _q6225 = true;
                            break Q6226;
                          }
                        }
                      }
                      _c6500 = !(_q6225);
                    }
                    let _c6795: boolean = _c6500;
                    if (!_c6795) {
                      let _q6501 = false;
                      Q6502: {
                        const _a6503 = sp.adj4[v_t];
                        for (let _i6504 = 0; _i6504 < _a6503.length; _i6504++) {
                          const v_s = _a6503[_i6504];
                          let _g6505 = 0;
                          G6506: {
                            const _a6507 = sp.adj4[v_s];
                            for (let _i6508 = 0; _i6508 < _a6507.length; _i6508++) {
                              const _t6509 = sp.adj4Edges[v_s][_i6508];
                              if (!(((_t6509 === _wc6181 ? _wd6182 : (_t6509 === _wc6179 ? _wd6180 : (b.grid[_t6509] || -1))) === 1))) continue;
                              _g6505++;
                            }
                          }
                          let _g6510 = 0;
                          G6511: {
                            for (let _i6512 = 0; _i6512 < 1; _i6512++) {
                              const v_k = v_s;
                              const _h6513 = clueAt(cl.number, v_k);
                              const _h6520 = (_h6513 + 1);
                              let _c6522: boolean = (_h6513 !== -1);
                              if (_c6522) {
                                let _c6521: boolean = (_h5052 || (_h6513 === 1));
                                if (!_c6521) {
                                  let _g6514 = 0;
                                  G6515: {
                                    const _t6516 = (_h6513 + 1);
                                    const _a6517 = cluesValued(cl.number, _t6516);
                                    for (let _i6518 = 0; _i6518 < _a6517.length; _i6518++) {
                                      const v_x = _a6517[_i6518];
                                      const _h6519 = clueAt(cl.number, v_x);
                                      if (!((_h6519 === _h6520))) continue;
                                      _g6514++;
                                    }
                                  }
                                  _c6521 = (_g6514 === 0);
                                }
                                _c6522 = _c6521;
                              }
                              if (!(_c6522)) continue;
                              _g6510++;
                            }
                          }
                          let _c6794: boolean = (_g6505 < (2 - _g6510));
                          if (_c6794) {
                            let _q6523 = false;
                            Q6524: {
                              const _a6525 = sp.adj4[v_s];
                              for (let _i6526 = 0; _i6526 < _a6525.length; _i6526++) {
                                const v_y = _a6525[_i6526];
                                const _t6527 = sp.adj4Edges[v_s][_i6526];
                                let _c6546: boolean = !((_t6527 === _wc6181 ? true : (_t6527 === _wc6179 ? true : (b.grid[_t6527] !== 0))));
                                if (_c6546) {
                                  let _g6528 = 0;
                                  G6529: {
                                    const _a6530 = sp.adj4[v_s];
                                    for (let _i6531 = 0; _i6531 < _a6530.length; _i6531++) {
                                      const _t6532 = sp.adj4Edges[v_s][_i6531];
                                      if (!(((_t6532 === _wc6181 ? _wd6182 : (_t6532 === _wc6179 ? _wd6180 : (b.grid[_t6532] || -1))) === 1))) continue;
                                      _g6528++;
                                    }
                                  }
                                  let _g6533 = 0;
                                  G6534: {
                                    for (let _i6535 = 0; _i6535 < 1; _i6535++) {
                                      const v_k = v_s;
                                      const _h6536 = clueAt(cl.number, v_k);
                                      const _h6543 = (_h6536 + 1);
                                      let _c6545: boolean = (_h6536 !== -1);
                                      if (_c6545) {
                                        let _c6544: boolean = (_h5052 || (_h6536 === 1));
                                        if (!_c6544) {
                                          let _g6537 = 0;
                                          G6538: {
                                            const _t6539 = (_h6536 + 1);
                                            const _a6540 = cluesValued(cl.number, _t6539);
                                            for (let _i6541 = 0; _i6541 < _a6540.length; _i6541++) {
                                              const v_x = _a6540[_i6541];
                                              const _h6542 = clueAt(cl.number, v_x);
                                              if (!((_h6542 === _h6543))) continue;
                                              _g6537++;
                                            }
                                          }
                                          _c6544 = (_g6537 === 0);
                                        }
                                        _c6545 = _c6544;
                                      }
                                      if (!(_c6545)) continue;
                                      _g6533++;
                                    }
                                  }
                                  _c6546 = (_g6528 < (2 - _g6533));
                                }
                                let _c6566: boolean = _c6546;
                                if (_c6566) {
                                  let _g6547 = 0;
                                  G6548: {
                                    const _a6550 = sp.adj4[v_y];
                                    for (let _i6551 = 0; _i6551 < _a6550.length; _i6551++) {
                                      const _t6552 = sp.adj4Edges[v_y][_i6551];
                                      if (!(((_t6552 === _wc6181 ? _wd6182 : (_t6552 === _wc6179 ? _wd6180 : (b.grid[_t6552] || -1))) === 1))) continue;
                                      _g6547++;
                                    }
                                  }
                                  let _g6553 = 0;
                                  G6554: {
                                    for (let _i6555 = 0; _i6555 < 1; _i6555++) {
                                      const v_k = v_y;
                                      const _h6556 = clueAt(cl.number, v_k);
                                      const _h6563 = (_h6556 + 1);
                                      let _c6565: boolean = (_h6556 !== -1);
                                      if (_c6565) {
                                        let _c6564: boolean = (_h5052 || (_h6556 === 1));
                                        if (!_c6564) {
                                          let _g6557 = 0;
                                          G6558: {
                                            const _t6559 = (_h6556 + 1);
                                            const _a6560 = cluesValued(cl.number, _t6559);
                                            for (let _i6561 = 0; _i6561 < _a6560.length; _i6561++) {
                                              const v_x = _a6560[_i6561];
                                              const _h6562 = clueAt(cl.number, v_x);
                                              if (!((_h6562 === _h6563))) continue;
                                              _g6557++;
                                            }
                                          }
                                          _c6564 = (_g6557 === 0);
                                        }
                                        _c6565 = _c6564;
                                      }
                                      if (!(_c6565)) continue;
                                      _g6553++;
                                    }
                                  }
                                  _c6566 = (_g6547 < (2 - _g6553));
                                }
                                let _c6647: boolean = _c6566;
                                if (_c6647) {
                                  let _q6567 = true;
                                  Q6568: {
                                    _g6569.length = 0;
                                    G6570: {
                                      for (let _i6572 = 0; _i6572 < 1; _i6572++) {
                                        const v_x = v_s;
                                        const _h6573 = clueAt(cl.number, v_x);
                                        if (!((_h6573 !== -1))) continue;
                                        _g6569.push(v_x);
                                      }
                                    }
                                    _g6574.length = 0;
                                    _st6587.pass++;
                                    G6575: {
                                      const _a6593 = throughWhere(sp, v_s, (_te6588: number): boolean => { let _c6590: boolean = ((_te6588 === _wc6181 ? _wd6182 : (_te6588 === _wc6179 ? _wd6180 : (b.grid[_te6588] || -1))) === 1); if (_c6590) {   const _t6589 = sp.edgeEnds[2 * _te6588];   _c6590 = !((clueAt(cl.number, _t6589) !== -1)); } let _c6592: boolean = _c6590; if (_c6592) {   const _t6591 = sp.edgeEnds[2 * _te6588 + 1];   _c6592 = !((clueAt(cl.number, _t6591) !== -1)); } return _c6592; });
                                      for (let _i6594 = 0; _i6594 < _a6593.length; _i6594++) {
                                        const v_t = _a6593[_i6594];
                                        const _h6597 = clueAt(cl.number, v_t);
                                        const _h6598 = (_h6597 !== -1);
                                        const _h6599 = _h6598;
                                        const _h6600 = !(_h6599);
                                        const _a6595 = sp.adj4[v_t];
                                        for (let _i6596 = 0; _i6596 < _a6595.length; _i6596++) {
                                          const v_x = _a6595[_i6596];
                                          const _h6601 = clueAt(cl.number, v_x);
                                          let _c6603: boolean = (_h6600 && (_h6601 !== -1));
                                          if (_c6603) {
                                            const _t6602 = sp.adj4Edges[v_t][_i6596];
                                            _c6603 = ((_t6602 === _wc6181 ? _wd6182 : (_t6602 === _wc6179 ? _wd6180 : (b.grid[_t6602] || -1))) === 1);
                                          }
                                          if (!(_c6603)) continue;
                                          const _t6604 = v_x;
                                          if (_g6574.length < 16) { if (!_g6574.includes(_t6604)) _g6574.push(_t6604); } else addOnce(_g6574, _st6587, _t6604);
                                        }
                                      }
                                    }
                                    const _a6605 = union(_g6569, _g6574);
                                    for (let _i6606 = 0; _i6606 < _a6605.length; _i6606++) {
                                      const v_p = _a6605[_i6606];
                                      const _h6645 = clueAt(cl.number, v_p);
                                      _g6607.length = 0;
                                      G6608: {
                                        for (let _i6610 = 0; _i6610 < 1; _i6610++) {
                                          const v_x = v_y;
                                          const _h6611 = clueAt(cl.number, v_x);
                                          if (!((_h6611 !== -1))) continue;
                                          _g6607.push(v_x);
                                        }
                                      }
                                      _g6612.length = 0;
                                      _st6625.pass++;
                                      G6613: {
                                        const _a6631 = throughWhere(sp, v_y, (_te6626: number): boolean => { let _c6628: boolean = ((_te6626 === _wc6181 ? _wd6182 : (_te6626 === _wc6179 ? _wd6180 : (b.grid[_te6626] || -1))) === 1); if (_c6628) {   const _t6627 = sp.edgeEnds[2 * _te6626];   _c6628 = !((clueAt(cl.number, _t6627) !== -1)); } let _c6630: boolean = _c6628; if (_c6630) {   const _t6629 = sp.edgeEnds[2 * _te6626 + 1];   _c6630 = !((clueAt(cl.number, _t6629) !== -1)); } return _c6630; });
                                        for (let _i6632 = 0; _i6632 < _a6631.length; _i6632++) {
                                          const v_t = _a6631[_i6632];
                                          const _h6635 = clueAt(cl.number, v_t);
                                          const _h6636 = (_h6635 !== -1);
                                          const _h6637 = _h6636;
                                          const _h6638 = !(_h6637);
                                          const _a6633 = sp.adj4[v_t];
                                          for (let _i6634 = 0; _i6634 < _a6633.length; _i6634++) {
                                            const v_x = _a6633[_i6634];
                                            const _h6639 = clueAt(cl.number, v_x);
                                            let _c6641: boolean = (_h6638 && (_h6639 !== -1));
                                            if (_c6641) {
                                              const _t6640 = sp.adj4Edges[v_t][_i6634];
                                              _c6641 = ((_t6640 === _wc6181 ? _wd6182 : (_t6640 === _wc6179 ? _wd6180 : (b.grid[_t6640] || -1))) === 1);
                                            }
                                            if (!(_c6641)) continue;
                                            const _t6642 = v_x;
                                            if (_g6612.length < 16) { if (!_g6612.includes(_t6642)) _g6612.push(_t6642); } else addOnce(_g6612, _st6625, _t6642);
                                          }
                                        }
                                      }
                                      const _a6643 = union(_g6607, _g6612);
                                      for (let _i6644 = 0; _i6644 < _a6643.length; _i6644++) {
                                        const v_q = _a6643[_i6644];
                                        const _h6646 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6645 - _h6646)) === cl.step))) {
                                          _q6567 = false;
                                          break Q6568;
                                        }
                                      }
                                    }
                                  }
                                  _c6647 = _q6567;
                                }
                                if (!((_c6647 && (_h5052 || !(throughWhere(sp, v_s, (_te6648: number): boolean => {  return ((_te6648 === _wc6181 ? _wd6182 : (_te6648 === _wc6179 ? _wd6180 : (b.grid[_te6648] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g6649 = 0;
                                G6650: {
                                  const _a6651 = sp.adj4[v_s];
                                  for (let _i6652 = 0; _i6652 < _a6651.length; _i6652++) {
                                    const _t6653 = sp.adj4Edges[v_s][_i6652];
                                    if (!(((_t6653 === _wc6181 ? _wd6182 : (_t6653 === _wc6179 ? _wd6180 : (b.grid[_t6653] || -1))) === 1))) continue;
                                    _g6649++;
                                  }
                                }
                                let _g6654 = 0;
                                G6655: {
                                  for (let _i6656 = 0; _i6656 < 1; _i6656++) {
                                    const v_k = v_s;
                                    const _h6657 = clueAt(cl.number, v_k);
                                    const _h6664 = (_h6657 + 1);
                                    let _c6666: boolean = (_h6657 !== -1);
                                    if (_c6666) {
                                      let _c6665: boolean = (_h5052 || (_h6657 === 1));
                                      if (!_c6665) {
                                        let _g6658 = 0;
                                        G6659: {
                                          const _t6660 = (_h6657 + 1);
                                          const _a6661 = cluesValued(cl.number, _t6660);
                                          for (let _i6662 = 0; _i6662 < _a6661.length; _i6662++) {
                                            const v_x = _a6661[_i6662];
                                            const _h6663 = clueAt(cl.number, v_x);
                                            if (!((_h6663 === _h6664))) continue;
                                            _g6658++;
                                          }
                                        }
                                        _c6665 = (_g6658 === 0);
                                      }
                                      _c6666 = _c6665;
                                    }
                                    if (!(_c6666)) continue;
                                    _g6654++;
                                  }
                                }
                                let _c6793: boolean = ((_g6649 + 1) === (2 - _g6654));
                                if (!_c6793) {
                                  let _q6667 = false;
                                  Q6668: {
                                    const _a6669 = sp.adj4[v_s];
                                    const _n6670 = _i6526;
                                    for (let _i6671 = 0; _i6671 < _n6670; _i6671++) {
                                      const v_z = _a6669[_i6671];
                                      const _t6672 = sp.adj4Edges[v_s][_i6671];
                                      let _c6691: boolean = !((_t6672 === _wc6181 ? true : (_t6672 === _wc6179 ? true : (b.grid[_t6672] !== 0))));
                                      if (_c6691) {
                                        let _g6673 = 0;
                                        G6674: {
                                          const _a6675 = sp.adj4[v_s];
                                          for (let _i6676 = 0; _i6676 < _a6675.length; _i6676++) {
                                            const _t6677 = sp.adj4Edges[v_s][_i6676];
                                            if (!(((_t6677 === _wc6181 ? _wd6182 : (_t6677 === _wc6179 ? _wd6180 : (b.grid[_t6677] || -1))) === 1))) continue;
                                            _g6673++;
                                          }
                                        }
                                        let _g6678 = 0;
                                        G6679: {
                                          for (let _i6680 = 0; _i6680 < 1; _i6680++) {
                                            const v_k = v_s;
                                            const _h6681 = clueAt(cl.number, v_k);
                                            const _h6688 = (_h6681 + 1);
                                            let _c6690: boolean = (_h6681 !== -1);
                                            if (_c6690) {
                                              let _c6689: boolean = (_h5052 || (_h6681 === 1));
                                              if (!_c6689) {
                                                let _g6682 = 0;
                                                G6683: {
                                                  const _t6684 = (_h6681 + 1);
                                                  const _a6685 = cluesValued(cl.number, _t6684);
                                                  for (let _i6686 = 0; _i6686 < _a6685.length; _i6686++) {
                                                    const v_x = _a6685[_i6686];
                                                    const _h6687 = clueAt(cl.number, v_x);
                                                    if (!((_h6687 === _h6688))) continue;
                                                    _g6682++;
                                                  }
                                                }
                                                _c6689 = (_g6682 === 0);
                                              }
                                              _c6690 = _c6689;
                                            }
                                            if (!(_c6690)) continue;
                                            _g6678++;
                                          }
                                        }
                                        _c6691 = (_g6673 < (2 - _g6678));
                                      }
                                      let _c6710: boolean = _c6691;
                                      if (_c6710) {
                                        let _g6692 = 0;
                                        G6693: {
                                          const _a6694 = sp.adj4[v_z];
                                          for (let _i6695 = 0; _i6695 < _a6694.length; _i6695++) {
                                            const _t6696 = sp.adj4Edges[v_z][_i6695];
                                            if (!(((_t6696 === _wc6181 ? _wd6182 : (_t6696 === _wc6179 ? _wd6180 : (b.grid[_t6696] || -1))) === 1))) continue;
                                            _g6692++;
                                          }
                                        }
                                        let _g6697 = 0;
                                        G6698: {
                                          for (let _i6699 = 0; _i6699 < 1; _i6699++) {
                                            const v_k = v_z;
                                            const _h6700 = clueAt(cl.number, v_k);
                                            const _h6707 = (_h6700 + 1);
                                            let _c6709: boolean = (_h6700 !== -1);
                                            if (_c6709) {
                                              let _c6708: boolean = (_h5052 || (_h6700 === 1));
                                              if (!_c6708) {
                                                let _g6701 = 0;
                                                G6702: {
                                                  const _t6703 = (_h6700 + 1);
                                                  const _a6704 = cluesValued(cl.number, _t6703);
                                                  for (let _i6705 = 0; _i6705 < _a6704.length; _i6705++) {
                                                    const v_x = _a6704[_i6705];
                                                    const _h6706 = clueAt(cl.number, v_x);
                                                    if (!((_h6706 === _h6707))) continue;
                                                    _g6701++;
                                                  }
                                                }
                                                _c6708 = (_g6701 === 0);
                                              }
                                              _c6709 = _c6708;
                                            }
                                            if (!(_c6709)) continue;
                                            _g6697++;
                                          }
                                        }
                                        _c6710 = (_g6692 < (2 - _g6697));
                                      }
                                      let _c6791: boolean = _c6710;
                                      if (_c6791) {
                                        let _q6711 = true;
                                        Q6712: {
                                          _g6713.length = 0;
                                          G6714: {
                                            for (let _i6716 = 0; _i6716 < 1; _i6716++) {
                                              const v_x = v_s;
                                              const _h6717 = clueAt(cl.number, v_x);
                                              if (!((_h6717 !== -1))) continue;
                                              _g6713.push(v_x);
                                            }
                                          }
                                          _g6718.length = 0;
                                          _st6731.pass++;
                                          G6719: {
                                            const _a6737 = throughWhere(sp, v_s, (_te6732: number): boolean => { let _c6734: boolean = ((_te6732 === _wc6181 ? _wd6182 : (_te6732 === _wc6179 ? _wd6180 : (b.grid[_te6732] || -1))) === 1); if (_c6734) {   const _t6733 = sp.edgeEnds[2 * _te6732];   _c6734 = !((clueAt(cl.number, _t6733) !== -1)); } let _c6736: boolean = _c6734; if (_c6736) {   const _t6735 = sp.edgeEnds[2 * _te6732 + 1];   _c6736 = !((clueAt(cl.number, _t6735) !== -1)); } return _c6736; });
                                            for (let _i6738 = 0; _i6738 < _a6737.length; _i6738++) {
                                              const v_t = _a6737[_i6738];
                                              const _h6741 = clueAt(cl.number, v_t);
                                              const _h6742 = (_h6741 !== -1);
                                              const _h6743 = _h6742;
                                              const _h6744 = !(_h6743);
                                              const _a6739 = sp.adj4[v_t];
                                              for (let _i6740 = 0; _i6740 < _a6739.length; _i6740++) {
                                                const v_x = _a6739[_i6740];
                                                const _h6745 = clueAt(cl.number, v_x);
                                                let _c6747: boolean = (_h6744 && (_h6745 !== -1));
                                                if (_c6747) {
                                                  const _t6746 = sp.adj4Edges[v_t][_i6740];
                                                  _c6747 = ((_t6746 === _wc6181 ? _wd6182 : (_t6746 === _wc6179 ? _wd6180 : (b.grid[_t6746] || -1))) === 1);
                                                }
                                                if (!(_c6747)) continue;
                                                const _t6748 = v_x;
                                                if (_g6718.length < 16) { if (!_g6718.includes(_t6748)) _g6718.push(_t6748); } else addOnce(_g6718, _st6731, _t6748);
                                              }
                                            }
                                          }
                                          const _a6749 = union(_g6713, _g6718);
                                          for (let _i6750 = 0; _i6750 < _a6749.length; _i6750++) {
                                            const v_p = _a6749[_i6750];
                                            const _h6789 = clueAt(cl.number, v_p);
                                            _g6751.length = 0;
                                            G6752: {
                                              for (let _i6754 = 0; _i6754 < 1; _i6754++) {
                                                const v_x = v_z;
                                                const _h6755 = clueAt(cl.number, v_x);
                                                if (!((_h6755 !== -1))) continue;
                                                _g6751.push(v_x);
                                              }
                                            }
                                            _g6756.length = 0;
                                            _st6769.pass++;
                                            G6757: {
                                              const _a6775 = throughWhere(sp, v_z, (_te6770: number): boolean => { let _c6772: boolean = ((_te6770 === _wc6181 ? _wd6182 : (_te6770 === _wc6179 ? _wd6180 : (b.grid[_te6770] || -1))) === 1); if (_c6772) {   const _t6771 = sp.edgeEnds[2 * _te6770];   _c6772 = !((clueAt(cl.number, _t6771) !== -1)); } let _c6774: boolean = _c6772; if (_c6774) {   const _t6773 = sp.edgeEnds[2 * _te6770 + 1];   _c6774 = !((clueAt(cl.number, _t6773) !== -1)); } return _c6774; });
                                              for (let _i6776 = 0; _i6776 < _a6775.length; _i6776++) {
                                                const v_t = _a6775[_i6776];
                                                const _h6779 = clueAt(cl.number, v_t);
                                                const _h6780 = (_h6779 !== -1);
                                                const _h6781 = _h6780;
                                                const _h6782 = !(_h6781);
                                                const _a6777 = sp.adj4[v_t];
                                                for (let _i6778 = 0; _i6778 < _a6777.length; _i6778++) {
                                                  const v_x = _a6777[_i6778];
                                                  const _h6783 = clueAt(cl.number, v_x);
                                                  let _c6785: boolean = (_h6782 && (_h6783 !== -1));
                                                  if (_c6785) {
                                                    const _t6784 = sp.adj4Edges[v_t][_i6778];
                                                    _c6785 = ((_t6784 === _wc6181 ? _wd6182 : (_t6784 === _wc6179 ? _wd6180 : (b.grid[_t6784] || -1))) === 1);
                                                  }
                                                  if (!(_c6785)) continue;
                                                  const _t6786 = v_x;
                                                  if (_g6756.length < 16) { if (!_g6756.includes(_t6786)) _g6756.push(_t6786); } else addOnce(_g6756, _st6769, _t6786);
                                                }
                                              }
                                            }
                                            const _a6787 = union(_g6751, _g6756);
                                            for (let _i6788 = 0; _i6788 < _a6787.length; _i6788++) {
                                              const v_q = _a6787[_i6788];
                                              const _h6790 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h6789 - _h6790)) === cl.step))) {
                                                _q6711 = false;
                                                break Q6712;
                                              }
                                            }
                                          }
                                        }
                                        _c6791 = _q6711;
                                      }
                                      if ((_c6791 && (_h5052 || !(throughWhere(sp, v_s, (_te6792: number): boolean => {  return ((_te6792 === _wc6181 ? _wd6182 : (_te6792 === _wc6179 ? _wd6180 : (b.grid[_te6792] || -1))) === 1); }).includes(v_z))))) {
                                        _q6667 = true;
                                        break Q6668;
                                      }
                                    }
                                  }
                                  _c6793 = _q6667;
                                }
                                if (_c6793) {
                                  _q6523 = true;
                                  break Q6524;
                                }
                              }
                            }
                            _c6794 = !(_q6523);
                          }
                          if (_c6794) {
                            _q6501 = true;
                            break Q6502;
                          }
                        }
                      }
                      _c6795 = _q6501;
                    }
                    if (_c6795) {
                      _q6183 = true;
                      break Q6184;
                    }
                  }
                }
                _c6796 = _q6183;
              }
              _c6797 = _c6796;
            }
            if (!(_c6797)) continue;
            const _t6799 = minus(v_U, setOf(_h6798, v_i, v_j));
            const _t6800 = (_t6799.length > 0 ? _t6799[0] : -1);
            const _t6801 = _t6800;
            if (_g5655.length < 16) { if (!_g5655.includes(_t6801)) _g5655.push(_t6801); } else addOnce(_g5655, _st6171, _t6801);
          }
        }
      }
      const v_B = _g5655;
      const _h6836 = v_B.length;
      const _h6837 = (_h6836 === 3);
      _g6802.length = 0;
      G6803: {
        const _a6813 = v_U;
        for (let _i6814 = 0; _i6814 < _a6813.length; _i6814++) {
          const v_y = _a6813[_i6814];
          let _c6823: boolean = ((_i6814 === 0) && _h6816);
          if (!_c6823) {
            let _c6822: boolean = (_i6814 > 0);
            if (_c6822) {
              let _c6821: boolean = !(v_A.includes(v_y));
              if (!_c6821) {
                let _q6817 = false;
                Q6818: {
                  const _a6819 = v_U;
                  for (let _i6820 = 0; _i6820 < _a6819.length; _i6820++) {
                    const v_m = _a6819[_i6820];
                    if (!(((_i6820 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q6817 = true;
                      break Q6818;
                    }
                  }
                }
                _c6821 = _q6817;
              }
              _c6822 = _c6821;
            }
            _c6823 = _c6822;
          }
          if (!(_c6823)) continue;
          _g6802.push(v_y);
        }
      }
      const v_N = _g6802;
      const _h6845 = v_N.length;
      _g6824.length = 0;
      G6825: {
        const _a6834 = v_N;
        for (let _i6835 = 0; _i6835 < _a6834.length; _i6835++) {
          const v_y = _a6834[_i6835];
          let _c6843: boolean = ((v_U.indexOf(v_y) === 0) && _h6837);
          if (!_c6843) {
            let _c6842: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c6842) {
              let _q6838 = true;
              Q6839: {
                const _a6840 = v_U;
                for (let _i6841 = 0; _i6841 < _a6840.length; _i6841++) {
                  const v_m = _a6840[_i6841];
                  if (!(((_i6841 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q6838 = false;
                    break Q6839;
                  }
                }
              }
              _c6842 = _q6838;
            }
            _c6843 = _c6842;
          }
          if (!(_c6843)) continue;
          _g6824.push(v_y);
        }
      }
      const v_P = _g6824;
      const _h6846 = v_P.length;
      L6844: {
        const v_X = minus(v_U, v_N);
        const _h6847 = v_X.length;
        if (!((((_h6845 === 0) || (_h6846 > 0)) || (_h6847 > 0)))) break L6844;
        facts.length = 0;
        changed = false;
        let _c6853: boolean = (_h6845 > 0);
        if (_c6853) {
          let _q6848 = true;
          Q6849: {
            const _a6850 = v_P;
            for (let _i6851 = 0; _i6851 < _a6850.length; _i6851++) {
              const v_y = _a6850[_i6851];
              const _t6852 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t6852] !== 0)) { if (fire === null) { b.placeAt(_t6852, 1); changed = true; } else facts.push(PLACE, _t6852, 1); }
              if (!(true)) {
                _q6848 = false;
                break Q6849;
              }
            }
          }
          _c6853 = _q6848;
        }
        let _c6860: boolean = _c6853;
        if (_c6860) {
          let _c6859: boolean = !((_h6846 === 0));
          if (!_c6859) {
            let _q6854 = true;
            Q6855: {
              const _a6856 = v_X;
              for (let _i6857 = 0; _i6857 < _a6856.length; _i6857++) {
                const v_y = _a6856[_i6857];
                const _t6858 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t6858] !== 0)) { if (fire === null) { b.placeAt(_t6858, 2); changed = true; } else facts.push(PLACE, _t6858, 2); }
                if (!(true)) {
                  _q6854 = false;
                  break Q6855;
                }
              }
            }
            _c6859 = _q6854;
          }
          _c6860 = _c6859;
        }
        if (!(_c6860)) return -1;
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
