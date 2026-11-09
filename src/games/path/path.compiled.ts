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
  const _g6802: number[] = [];
  const _g6807: number[] = [];
  const _g6866: number[] = [];
  const _g6871: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h6849 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q6788 = true;
  Q6789: {
    const _a6790 = sp.cells;
    for (let _i6791 = 0; _i6791 < _a6790.length; _i6791++) {
      const v_c = _a6790[_i6791];
      let _g6792 = 0;
      G6793: {
        const _a6794 = sp.adj4[v_c];
        for (let _i6795 = 0; _i6795 < _a6794.length; _i6795++) {
          const _h6796 = (g[sp.adj4Edges[v_c][_i6795]] || -1);
          if (!((_h6796 === 1))) continue;
          _g6792++;
        }
      }
      if (!((_g6792 === takes(sp, cl, v_c)))) {
        _q6788 = false;
        break Q6789;
      }
    }
  }
  if (!(_q6788)) return false;
  let _q6797 = true;
  Q6798: {
    const _a6799 = sp.cells;
    for (let _i6800 = 0; _i6800 < _a6799.length; _i6800++) {
      const v_c = _a6799[_i6800];
      const _h6801 = clueAt(cl.number, v_c);
      if (!(!((_h6801 !== -1)))) continue;
      _g6802.length = 0;
      G6803: {
        for (let _i6805 = 0; _i6805 < 1; _i6805++) {
          const v_x = v_c;
          const _h6806 = clueAt(cl.number, v_x);
          if (!((_h6806 !== -1))) continue;
          _g6802.push(v_x);
        }
      }
      _g6807.length = 0;
      G6808: {
        const _a6823 = throughWhere(sp, v_c, (_te6818: number): boolean => { let _c6820: boolean = ((g[_te6818] || -1) === 1); if (_c6820) {   const _t6819 = sp.edgeEnds[2 * _te6818];   _c6820 = !((clueAt(cl.number, _t6819) !== -1)); } let _c6822: boolean = _c6820; if (_c6822) {   const _t6821 = sp.edgeEnds[2 * _te6818 + 1];   _c6822 = !((clueAt(cl.number, _t6821) !== -1)); } return _c6822; });
        for (let _i6824 = 0; _i6824 < _a6823.length; _i6824++) {
          const v_t = _a6823[_i6824];
          const _h6827 = clueAt(cl.number, v_t);
          const _h6828 = (_h6827 !== -1);
          const _h6829 = _h6828;
          const _h6830 = !(_h6829);
          const _a6825 = sp.adj4[v_t];
          for (let _i6826 = 0; _i6826 < _a6825.length; _i6826++) {
            const v_x = _a6825[_i6826];
            const _h6831 = clueAt(cl.number, v_x);
            const _h6832 = (g[sp.adj4Edges[v_t][_i6826]] || -1);
            if (!(((_h6830 && (_h6831 !== -1)) && (_h6832 === 1)))) continue;
            if (!_g6807.includes(v_x)) _g6807.push(v_x);
          }
        }
      }
      if (!((union(_g6802, _g6807).length === 2))) {
        _q6797 = false;
        break Q6798;
      }
    }
  }
  if (!(_q6797)) return false;
  let _c6838: boolean = (cl.step === 0);
  if (!_c6838) {
    let _q6833 = false;
    Q6834: {
      const _a6835 = sp.cells;
      for (let _i6836 = 0; _i6836 < _a6835.length; _i6836++) {
        const v_x = _a6835[_i6836];
        const _h6837 = clueAt(cl.number, v_x);
        if ((_h6837 === 2)) {
          _q6833 = true;
          break Q6834;
        }
      }
    }
    _c6838 = _q6833;
  }
  let _c6858: boolean = _c6838;
  if (_c6858) {
    let _q6839 = true;
    Q6840: {
      const _a6841 = sp.cells;
      for (let _i6842 = 0; _i6842 < _a6841.length; _i6842++) {
        const v_x = _a6841[_i6842];
        const _h6843 = clueAt(cl.number, v_x);
        if (!((_h6843 !== -1))) continue;
        const _h6855 = (_h6843 - 1);
        let _g6844 = 0;
        G6845: {
          const _a6846 = cluesValued(cl.number, _h6843);
          for (let _i6847 = 0; _i6847 < _a6846.length; _i6847++) {
            const v_y = _a6846[_i6847];
            const _h6848 = clueAt(cl.number, v_y);
            if (!((_h6848 === _h6843))) continue;
            _g6844++;
          }
        }
        let _c6857: boolean = (_g6844 === _h6849);
        if (_c6857) {
          let _c6856: boolean = (_h6843 === 1);
          if (!_c6856) {
            let _q6850 = false;
            Q6851: {
              const _a6852 = sp.cells;
              for (let _i6853 = 0; _i6853 < _a6852.length; _i6853++) {
                const v_y = _a6852[_i6853];
                const _h6854 = clueAt(cl.number, v_y);
                if ((_h6854 === _h6855)) {
                  _q6850 = true;
                  break Q6851;
                }
              }
            }
            _c6856 = _q6850;
          }
          _c6857 = _c6856;
        }
        if (!(_c6857)) {
          _q6839 = false;
          break Q6840;
        }
      }
    }
    _c6858 = _q6839;
  }
  if (!(_c6858)) return false;
  for (let _k6859 = 0; _k6859 < cl.number.at.length; _k6859++) {
    const _at6860 = cl.number.at[_k6859];
    let _q6862 = true;
    Q6863: {
      const _a6864 = sp.adj4[_at6860];
      for (let _i6865 = 0; _i6865 < _a6864.length; _i6865++) {
        const v_y = _a6864[_i6865];
        if (!(((g[sp.adj4Edges[_at6860][_i6865]] || -1) === 1))) continue;
        _g6866.length = 0;
        G6867: {
          for (let _i6869 = 0; _i6869 < 1; _i6869++) {
            const v_x = v_y;
            const _h6870 = clueAt(cl.number, v_x);
            if (!((_h6870 !== -1))) continue;
            _g6866.push(v_x);
          }
        }
        _g6871.length = 0;
        G6872: {
          const _a6887 = throughWhere(sp, v_y, (_te6882: number): boolean => { let _c6884: boolean = ((g[_te6882] || -1) === 1); if (_c6884) {   const _t6883 = sp.edgeEnds[2 * _te6882];   _c6884 = !((clueAt(cl.number, _t6883) !== -1)); } let _c6886: boolean = _c6884; if (_c6886) {   const _t6885 = sp.edgeEnds[2 * _te6882 + 1];   _c6886 = !((clueAt(cl.number, _t6885) !== -1)); } return _c6886; });
          for (let _i6888 = 0; _i6888 < _a6887.length; _i6888++) {
            const v_t = _a6887[_i6888];
            const _h6891 = clueAt(cl.number, v_t);
            const _h6892 = (_h6891 !== -1);
            const _h6893 = _h6892;
            const _h6894 = !(_h6893);
            const _a6889 = sp.adj4[v_t];
            for (let _i6890 = 0; _i6890 < _a6889.length; _i6890++) {
              const v_x = _a6889[_i6890];
              const _h6895 = clueAt(cl.number, v_x);
              const _h6896 = (g[sp.adj4Edges[v_t][_i6890]] || -1);
              if (!(((_h6894 && (_h6895 !== -1)) && (_h6896 === 1)))) continue;
              if (!_g6871.includes(v_x)) _g6871.push(v_x);
            }
          }
        }
        const _a6897 = union(_g6866, _g6871);
        for (let _i6898 = 0; _i6898 < _a6897.length; _i6898++) {
          const v_q = _a6897[_i6898];
          if (!((v_q !== _at6860))) continue;
          const _h6900 = clueAt(cl.number, v_q);
          const _h6899 = clueAt(cl.number, _at6860);
          if (!((Math.abs((_h6899 - _h6900)) === cl.step))) {
            _q6862 = false;
            break Q6863;
          }
        }
      }
    }
    if (!(_q6862)) return false;
  }
  for (let _k6901 = 0; _k6901 < cl.wall.at.length; _k6901++) {
    const _at6902 = cl.wall.at[_k6901];
    if (!(((g[_at6902] || -1) === 2))) return false;
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
  if (forcedCands.length < sp.edges.length) forcedCands = new Int32Array(sp.edges.length);
  const cands = forcedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a68 = sp.cells;
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_c = _a68[_i69];
    const _h84 = clueAt(cl.number, v_c);
    const _h85 = (_h84 !== -1);
    const _h86 = _h85;
    let _g70 = 0;
    G71: {
      const _a72 = sp.adj4[v_c];
      for (let _i73 = 0; _i73 < _a72.length; _i73++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i73]] || -1) === 1))) continue;
        _g70++;
      }
    }
    const v_n = (takes(sp, cl, v_c) - _g70);
    L74: {
      const v_U = ways(b, sp, cl, v_c);
      const _h75 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h75 <= v_n))))) break L74;
      facts.length = 0;
      changed = false;
      let _c93: boolean = ((v_n >= 0) && (_h75 === v_n));
      if (_c93) {
        let _q76 = true;
        Q77: {
          const _a78 = v_U;
          for (let _i79 = 0; _i79 < _a78.length; _i79++) {
            const v_i = _a78[_i79];
            const _a80 = v_U;
            const _n81 = _i79;
            for (let _i82 = 0; _i82 < _n81; _i82++) {
              const v_j = _a80[_i82];
              if (!((!(piece(b, sp, v_i).includes(v_j)) && (_h86 || meetsMarked(b, sp, cl, cands, v_i, v_j))))) {
                _q76 = false;
                break Q77;
              }
            }
          }
        }
        _c93 = _q76;
      }
      let _c99: boolean = _c93;
      if (_c99) {
        let _q94 = true;
        Q95: {
          const _a96 = v_U;
          for (let _i97 = 0; _i97 < _a96.length; _i97++) {
            const v_y = _a96[_i97];
            const _t98 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t98] !== 0)) { if (fire === null) { b.placeAt(_t98, 1); changed = true; } else facts.push(PLACE, _t98, 1); }
            if (!(true)) {
              _q94 = false;
              break Q95;
            }
          }
        }
        _c99 = _q94;
      }
      if (!(_c99)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const _g706: number[] = [];
  const _g711: number[] = [];
  const _g744: number[] = [];
  const _g749: number[] = [];
  const _g848: number[] = [];
  const _g853: number[] = [];
  const _g886: number[] = [];
  const _g891: number[] = [];
  const _g996: number[] = [];
  const _g1001: number[] = [];
  const _g1032: number[] = [];
  const _g1037: number[] = [];
  const _g1136: number[] = [];
  const _g1141: number[] = [];
  const _g1172: number[] = [];
  const _g1177: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h631 = (cl.step === 0);
  if (lineBreaksCands.length < sp.edges.length) lineBreaksCands = new Int32Array(sp.edges.length);
  const cands = lineBreaksCands;
  cands.fill(-1);
  liveMarkedKept.clear();
  meetsMarkedKept.clear();
  const _a611 = sp.edges;
  for (let _i612 = 0; _i612 < _a611.length; _i612++) {
    const v_e = _a611[_i612];
    const v_a = sp.edgeEnds[2 * v_e];
    L613: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c1216: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
      if (_c1216) {
        let _c1215: boolean = (throughWhere(sp, v_a, (_te614: number): boolean => {  return ((b.grid[_te614] || -1) === 1); }).includes(v_b));
        if (!_c1215) {
          const _wc615 = v_e;
          const _wd616 = 1;
          let _q617 = false;
          Q618: {
            const _a620 = throughWhere(sp, v_a, (_te619: number): boolean => {  return ((_te619 === _wc615 ? _wd616 : (b.grid[_te619] || -1)) === 1); });
            for (let _i621 = 0; _i621 < _a620.length; _i621++) {
              const v_t = _a620[_i621];
              let _c641: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c641) {
                let _g622 = 0;
                G623: {
                  const _a624 = sp.adj4[v_t];
                  for (let _i625 = 0; _i625 < _a624.length; _i625++) {
                    const _t626 = sp.adj4Edges[v_t][_i625];
                    if (!(((_t626 === _wc615 ? _wd616 : (b.grid[_t626] || -1)) === 1))) continue;
                    _g622++;
                  }
                }
                let _g627 = 0;
                G628: {
                  for (let _i629 = 0; _i629 < 1; _i629++) {
                    const v_k = v_t;
                    const _h630 = clueAt(cl.number, v_k);
                    const _h638 = (_h630 + 1);
                    let _c640: boolean = (_h630 !== -1);
                    if (_c640) {
                      let _c639: boolean = (_h631 || (_h630 === 1));
                      if (!_c639) {
                        let _g632 = 0;
                        G633: {
                          const _t634 = (_h630 + 1);
                          const _a635 = cluesValued(cl.number, _t634);
                          for (let _i636 = 0; _i636 < _a635.length; _i636++) {
                            const v_x = _a635[_i636];
                            const _h637 = clueAt(cl.number, v_x);
                            if (!((_h637 === _h638))) continue;
                            _g632++;
                          }
                        }
                        _c639 = (_g632 === 0);
                      }
                      _c640 = _c639;
                    }
                    if (!(_c640)) continue;
                    _g627++;
                  }
                }
                _c641 = (_g622 < (2 - _g627));
              }
              if (!(_c641)) continue;
              let _g642 = 0;
              G643: {
                const _a644 = sp.adj4[v_t];
                for (let _i645 = 0; _i645 < _a644.length; _i645++) {
                  const _t646 = sp.adj4Edges[v_t][_i645];
                  if (!(((_t646 === _wc615 ? _wd616 : (b.grid[_t646] || -1)) === 1))) continue;
                  _g642++;
                }
              }
              let _g647 = 0;
              G648: {
                for (let _i649 = 0; _i649 < 1; _i649++) {
                  const v_k = v_t;
                  const _h650 = clueAt(cl.number, v_k);
                  const _h657 = (_h650 + 1);
                  let _c659: boolean = (_h650 !== -1);
                  if (_c659) {
                    let _c658: boolean = (_h631 || (_h650 === 1));
                    if (!_c658) {
                      let _g651 = 0;
                      G652: {
                        const _t653 = (_h650 + 1);
                        const _a654 = cluesValued(cl.number, _t653);
                        for (let _i655 = 0; _i655 < _a654.length; _i655++) {
                          const v_x = _a654[_i655];
                          const _h656 = clueAt(cl.number, v_x);
                          if (!((_h656 === _h657))) continue;
                          _g651++;
                        }
                      }
                      _c658 = (_g651 === 0);
                    }
                    _c659 = _c658;
                  }
                  if (!(_c659)) continue;
                  _g647++;
                }
              }
              let _c927: boolean = (_g642 < (2 - _g647));
              if (_c927) {
                let _q660 = false;
                Q661: {
                  const _a662 = sp.adj4[v_t];
                  for (let _i663 = 0; _i663 < _a662.length; _i663++) {
                    const v_y = _a662[_i663];
                    const _t664 = sp.adj4Edges[v_t][_i663];
                    let _c683: boolean = !((_t664 === _wc615 ? true : (b.grid[_t664] !== 0)));
                    if (_c683) {
                      let _g665 = 0;
                      G666: {
                        const _a667 = sp.adj4[v_t];
                        for (let _i668 = 0; _i668 < _a667.length; _i668++) {
                          const _t669 = sp.adj4Edges[v_t][_i668];
                          if (!(((_t669 === _wc615 ? _wd616 : (b.grid[_t669] || -1)) === 1))) continue;
                          _g665++;
                        }
                      }
                      let _g670 = 0;
                      G671: {
                        for (let _i672 = 0; _i672 < 1; _i672++) {
                          const v_k = v_t;
                          const _h673 = clueAt(cl.number, v_k);
                          const _h680 = (_h673 + 1);
                          let _c682: boolean = (_h673 !== -1);
                          if (_c682) {
                            let _c681: boolean = (_h631 || (_h673 === 1));
                            if (!_c681) {
                              let _g674 = 0;
                              G675: {
                                const _t676 = (_h673 + 1);
                                const _a677 = cluesValued(cl.number, _t676);
                                for (let _i678 = 0; _i678 < _a677.length; _i678++) {
                                  const v_x = _a677[_i678];
                                  const _h679 = clueAt(cl.number, v_x);
                                  if (!((_h679 === _h680))) continue;
                                  _g674++;
                                }
                              }
                              _c681 = (_g674 === 0);
                            }
                            _c682 = _c681;
                          }
                          if (!(_c682)) continue;
                          _g670++;
                        }
                      }
                      _c683 = (_g665 < (2 - _g670));
                    }
                    let _c703: boolean = _c683;
                    if (_c703) {
                      let _g684 = 0;
                      G685: {
                        const _a687 = sp.adj4[v_y];
                        for (let _i688 = 0; _i688 < _a687.length; _i688++) {
                          const _t689 = sp.adj4Edges[v_y][_i688];
                          if (!(((_t689 === _wc615 ? _wd616 : (b.grid[_t689] || -1)) === 1))) continue;
                          _g684++;
                        }
                      }
                      let _g690 = 0;
                      G691: {
                        for (let _i692 = 0; _i692 < 1; _i692++) {
                          const v_k = v_y;
                          const _h693 = clueAt(cl.number, v_k);
                          const _h700 = (_h693 + 1);
                          let _c702: boolean = (_h693 !== -1);
                          if (_c702) {
                            let _c701: boolean = (_h631 || (_h693 === 1));
                            if (!_c701) {
                              let _g694 = 0;
                              G695: {
                                const _t696 = (_h693 + 1);
                                const _a697 = cluesValued(cl.number, _t696);
                                for (let _i698 = 0; _i698 < _a697.length; _i698++) {
                                  const v_x = _a697[_i698];
                                  const _h699 = clueAt(cl.number, v_x);
                                  if (!((_h699 === _h700))) continue;
                                  _g694++;
                                }
                              }
                              _c701 = (_g694 === 0);
                            }
                            _c702 = _c701;
                          }
                          if (!(_c702)) continue;
                          _g690++;
                        }
                      }
                      _c703 = (_g684 < (2 - _g690));
                    }
                    let _c782: boolean = _c703;
                    if (_c782) {
                      let _q704 = true;
                      Q705: {
                        _g706.length = 0;
                        G707: {
                          for (let _i709 = 0; _i709 < 1; _i709++) {
                            const v_x = v_t;
                            const _h710 = clueAt(cl.number, v_x);
                            if (!((_h710 !== -1))) continue;
                            _g706.push(v_x);
                          }
                        }
                        _g711.length = 0;
                        G712: {
                          const _a731 = throughWhere(sp, v_t, (_te726: number): boolean => { let _c728: boolean = ((_te726 === _wc615 ? _wd616 : (b.grid[_te726] || -1)) === 1); if (_c728) {   const _t727 = sp.edgeEnds[2 * _te726];   _c728 = !((clueAt(cl.number, _t727) !== -1)); } let _c730: boolean = _c728; if (_c730) {   const _t729 = sp.edgeEnds[2 * _te726 + 1];   _c730 = !((clueAt(cl.number, _t729) !== -1)); } return _c730; });
                          for (let _i732 = 0; _i732 < _a731.length; _i732++) {
                            const v_t_725 = _a731[_i732];
                            const _h735 = clueAt(cl.number, v_t_725);
                            const _h736 = (_h735 !== -1);
                            const _h737 = _h736;
                            const _h738 = !(_h737);
                            const _a733 = sp.adj4[v_t_725];
                            for (let _i734 = 0; _i734 < _a733.length; _i734++) {
                              const v_x = _a733[_i734];
                              const _h739 = clueAt(cl.number, v_x);
                              let _c741: boolean = (_h738 && (_h739 !== -1));
                              if (_c741) {
                                const _t740 = sp.adj4Edges[v_t_725][_i734];
                                _c741 = ((_t740 === _wc615 ? _wd616 : (b.grid[_t740] || -1)) === 1);
                              }
                              if (!(_c741)) continue;
                              if (!_g711.includes(v_x)) _g711.push(v_x);
                            }
                          }
                        }
                        const _a742 = union(_g706, _g711);
                        for (let _i743 = 0; _i743 < _a742.length; _i743++) {
                          const v_p = _a742[_i743];
                          const _h780 = clueAt(cl.number, v_p);
                          _g744.length = 0;
                          G745: {
                            for (let _i747 = 0; _i747 < 1; _i747++) {
                              const v_x = v_y;
                              const _h748 = clueAt(cl.number, v_x);
                              if (!((_h748 !== -1))) continue;
                              _g744.push(v_x);
                            }
                          }
                          _g749.length = 0;
                          G750: {
                            const _a767 = throughWhere(sp, v_y, (_te762: number): boolean => { let _c764: boolean = ((_te762 === _wc615 ? _wd616 : (b.grid[_te762] || -1)) === 1); if (_c764) {   const _t763 = sp.edgeEnds[2 * _te762];   _c764 = !((clueAt(cl.number, _t763) !== -1)); } let _c766: boolean = _c764; if (_c766) {   const _t765 = sp.edgeEnds[2 * _te762 + 1];   _c766 = !((clueAt(cl.number, _t765) !== -1)); } return _c766; });
                            for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                              const v_t = _a767[_i768];
                              const _h771 = clueAt(cl.number, v_t);
                              const _h772 = (_h771 !== -1);
                              const _h773 = _h772;
                              const _h774 = !(_h773);
                              const _a769 = sp.adj4[v_t];
                              for (let _i770 = 0; _i770 < _a769.length; _i770++) {
                                const v_x = _a769[_i770];
                                const _h775 = clueAt(cl.number, v_x);
                                let _c777: boolean = (_h774 && (_h775 !== -1));
                                if (_c777) {
                                  const _t776 = sp.adj4Edges[v_t][_i770];
                                  _c777 = ((_t776 === _wc615 ? _wd616 : (b.grid[_t776] || -1)) === 1);
                                }
                                if (!(_c777)) continue;
                                if (!_g749.includes(v_x)) _g749.push(v_x);
                              }
                            }
                          }
                          const _a778 = union(_g744, _g749);
                          for (let _i779 = 0; _i779 < _a778.length; _i779++) {
                            const v_q = _a778[_i779];
                            const _h781 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h780 - _h781)) === cl.step))) {
                              _q704 = false;
                              break Q705;
                            }
                          }
                        }
                      }
                      _c782 = _q704;
                    }
                    if (!((_c782 && (_h631 || !(throughWhere(sp, v_t, (_te783: number): boolean => {  return ((_te783 === _wc615 ? _wd616 : (b.grid[_te783] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g784 = 0;
                    G785: {
                      const _a786 = sp.adj4[v_t];
                      for (let _i787 = 0; _i787 < _a786.length; _i787++) {
                        const _t788 = sp.adj4Edges[v_t][_i787];
                        if (!(((_t788 === _wc615 ? _wd616 : (b.grid[_t788] || -1)) === 1))) continue;
                        _g784++;
                      }
                    }
                    let _g789 = 0;
                    G790: {
                      for (let _i791 = 0; _i791 < 1; _i791++) {
                        const v_k = v_t;
                        const _h792 = clueAt(cl.number, v_k);
                        const _h799 = (_h792 + 1);
                        let _c801: boolean = (_h792 !== -1);
                        if (_c801) {
                          let _c800: boolean = (_h631 || (_h792 === 1));
                          if (!_c800) {
                            let _g793 = 0;
                            G794: {
                              const _t795 = (_h792 + 1);
                              const _a796 = cluesValued(cl.number, _t795);
                              for (let _i797 = 0; _i797 < _a796.length; _i797++) {
                                const v_x = _a796[_i797];
                                const _h798 = clueAt(cl.number, v_x);
                                if (!((_h798 === _h799))) continue;
                                _g793++;
                              }
                            }
                            _c800 = (_g793 === 0);
                          }
                          _c801 = _c800;
                        }
                        if (!(_c801)) continue;
                        _g789++;
                      }
                    }
                    let _c926: boolean = ((_g784 + 1) === (2 - _g789));
                    if (!_c926) {
                      let _q802 = false;
                      Q803: {
                        const _a804 = sp.adj4[v_t];
                        const _n805 = _i663;
                        for (let _i806 = 0; _i806 < _n805; _i806++) {
                          const v_z = _a804[_i806];
                          const _t807 = sp.adj4Edges[v_t][_i806];
                          let _c826: boolean = !((_t807 === _wc615 ? true : (b.grid[_t807] !== 0)));
                          if (_c826) {
                            let _g808 = 0;
                            G809: {
                              const _a810 = sp.adj4[v_t];
                              for (let _i811 = 0; _i811 < _a810.length; _i811++) {
                                const _t812 = sp.adj4Edges[v_t][_i811];
                                if (!(((_t812 === _wc615 ? _wd616 : (b.grid[_t812] || -1)) === 1))) continue;
                                _g808++;
                              }
                            }
                            let _g813 = 0;
                            G814: {
                              for (let _i815 = 0; _i815 < 1; _i815++) {
                                const v_k = v_t;
                                const _h816 = clueAt(cl.number, v_k);
                                const _h823 = (_h816 + 1);
                                let _c825: boolean = (_h816 !== -1);
                                if (_c825) {
                                  let _c824: boolean = (_h631 || (_h816 === 1));
                                  if (!_c824) {
                                    let _g817 = 0;
                                    G818: {
                                      const _t819 = (_h816 + 1);
                                      const _a820 = cluesValued(cl.number, _t819);
                                      for (let _i821 = 0; _i821 < _a820.length; _i821++) {
                                        const v_x = _a820[_i821];
                                        const _h822 = clueAt(cl.number, v_x);
                                        if (!((_h822 === _h823))) continue;
                                        _g817++;
                                      }
                                    }
                                    _c824 = (_g817 === 0);
                                  }
                                  _c825 = _c824;
                                }
                                if (!(_c825)) continue;
                                _g813++;
                              }
                            }
                            _c826 = (_g808 < (2 - _g813));
                          }
                          let _c845: boolean = _c826;
                          if (_c845) {
                            let _g827 = 0;
                            G828: {
                              const _a829 = sp.adj4[v_z];
                              for (let _i830 = 0; _i830 < _a829.length; _i830++) {
                                const _t831 = sp.adj4Edges[v_z][_i830];
                                if (!(((_t831 === _wc615 ? _wd616 : (b.grid[_t831] || -1)) === 1))) continue;
                                _g827++;
                              }
                            }
                            let _g832 = 0;
                            G833: {
                              for (let _i834 = 0; _i834 < 1; _i834++) {
                                const v_k = v_z;
                                const _h835 = clueAt(cl.number, v_k);
                                const _h842 = (_h835 + 1);
                                let _c844: boolean = (_h835 !== -1);
                                if (_c844) {
                                  let _c843: boolean = (_h631 || (_h835 === 1));
                                  if (!_c843) {
                                    let _g836 = 0;
                                    G837: {
                                      const _t838 = (_h835 + 1);
                                      const _a839 = cluesValued(cl.number, _t838);
                                      for (let _i840 = 0; _i840 < _a839.length; _i840++) {
                                        const v_x = _a839[_i840];
                                        const _h841 = clueAt(cl.number, v_x);
                                        if (!((_h841 === _h842))) continue;
                                        _g836++;
                                      }
                                    }
                                    _c843 = (_g836 === 0);
                                  }
                                  _c844 = _c843;
                                }
                                if (!(_c844)) continue;
                                _g832++;
                              }
                            }
                            _c845 = (_g827 < (2 - _g832));
                          }
                          let _c924: boolean = _c845;
                          if (_c924) {
                            let _q846 = true;
                            Q847: {
                              _g848.length = 0;
                              G849: {
                                for (let _i851 = 0; _i851 < 1; _i851++) {
                                  const v_x = v_t;
                                  const _h852 = clueAt(cl.number, v_x);
                                  if (!((_h852 !== -1))) continue;
                                  _g848.push(v_x);
                                }
                              }
                              _g853.length = 0;
                              G854: {
                                const _a873 = throughWhere(sp, v_t, (_te868: number): boolean => { let _c870: boolean = ((_te868 === _wc615 ? _wd616 : (b.grid[_te868] || -1)) === 1); if (_c870) {   const _t869 = sp.edgeEnds[2 * _te868];   _c870 = !((clueAt(cl.number, _t869) !== -1)); } let _c872: boolean = _c870; if (_c872) {   const _t871 = sp.edgeEnds[2 * _te868 + 1];   _c872 = !((clueAt(cl.number, _t871) !== -1)); } return _c872; });
                                for (let _i874 = 0; _i874 < _a873.length; _i874++) {
                                  const v_t_867 = _a873[_i874];
                                  const _h877 = clueAt(cl.number, v_t_867);
                                  const _h878 = (_h877 !== -1);
                                  const _h879 = _h878;
                                  const _h880 = !(_h879);
                                  const _a875 = sp.adj4[v_t_867];
                                  for (let _i876 = 0; _i876 < _a875.length; _i876++) {
                                    const v_x = _a875[_i876];
                                    const _h881 = clueAt(cl.number, v_x);
                                    let _c883: boolean = (_h880 && (_h881 !== -1));
                                    if (_c883) {
                                      const _t882 = sp.adj4Edges[v_t_867][_i876];
                                      _c883 = ((_t882 === _wc615 ? _wd616 : (b.grid[_t882] || -1)) === 1);
                                    }
                                    if (!(_c883)) continue;
                                    if (!_g853.includes(v_x)) _g853.push(v_x);
                                  }
                                }
                              }
                              const _a884 = union(_g848, _g853);
                              for (let _i885 = 0; _i885 < _a884.length; _i885++) {
                                const v_p = _a884[_i885];
                                const _h922 = clueAt(cl.number, v_p);
                                _g886.length = 0;
                                G887: {
                                  for (let _i889 = 0; _i889 < 1; _i889++) {
                                    const v_x = v_z;
                                    const _h890 = clueAt(cl.number, v_x);
                                    if (!((_h890 !== -1))) continue;
                                    _g886.push(v_x);
                                  }
                                }
                                _g891.length = 0;
                                G892: {
                                  const _a909 = throughWhere(sp, v_z, (_te904: number): boolean => { let _c906: boolean = ((_te904 === _wc615 ? _wd616 : (b.grid[_te904] || -1)) === 1); if (_c906) {   const _t905 = sp.edgeEnds[2 * _te904];   _c906 = !((clueAt(cl.number, _t905) !== -1)); } let _c908: boolean = _c906; if (_c908) {   const _t907 = sp.edgeEnds[2 * _te904 + 1];   _c908 = !((clueAt(cl.number, _t907) !== -1)); } return _c908; });
                                  for (let _i910 = 0; _i910 < _a909.length; _i910++) {
                                    const v_t = _a909[_i910];
                                    const _h913 = clueAt(cl.number, v_t);
                                    const _h914 = (_h913 !== -1);
                                    const _h915 = _h914;
                                    const _h916 = !(_h915);
                                    const _a911 = sp.adj4[v_t];
                                    for (let _i912 = 0; _i912 < _a911.length; _i912++) {
                                      const v_x = _a911[_i912];
                                      const _h917 = clueAt(cl.number, v_x);
                                      let _c919: boolean = (_h916 && (_h917 !== -1));
                                      if (_c919) {
                                        const _t918 = sp.adj4Edges[v_t][_i912];
                                        _c919 = ((_t918 === _wc615 ? _wd616 : (b.grid[_t918] || -1)) === 1);
                                      }
                                      if (!(_c919)) continue;
                                      if (!_g891.includes(v_x)) _g891.push(v_x);
                                    }
                                  }
                                }
                                const _a920 = union(_g886, _g891);
                                for (let _i921 = 0; _i921 < _a920.length; _i921++) {
                                  const v_q = _a920[_i921];
                                  const _h923 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h922 - _h923)) === cl.step))) {
                                    _q846 = false;
                                    break Q847;
                                  }
                                }
                              }
                            }
                            _c924 = _q846;
                          }
                          if ((_c924 && (_h631 || !(throughWhere(sp, v_t, (_te925: number): boolean => {  return ((_te925 === _wc615 ? _wd616 : (b.grid[_te925] || -1)) === 1); }).includes(v_z))))) {
                            _q802 = true;
                            break Q803;
                          }
                        }
                      }
                      _c926 = _q802;
                    }
                    if (_c926) {
                      _q660 = true;
                      break Q661;
                    }
                  }
                }
                _c927 = !(_q660);
              }
              let _c1214: boolean = _c927;
              if (!_c1214) {
                let _q928 = false;
                Q929: {
                  const _a930 = sp.adj4[v_t];
                  for (let _i931 = 0; _i931 < _a930.length; _i931++) {
                    const v_s = _a930[_i931];
                    let _g932 = 0;
                    G933: {
                      const _a934 = sp.adj4[v_s];
                      for (let _i935 = 0; _i935 < _a934.length; _i935++) {
                        const _t936 = sp.adj4Edges[v_s][_i935];
                        if (!(((_t936 === _wc615 ? _wd616 : (b.grid[_t936] || -1)) === 1))) continue;
                        _g932++;
                      }
                    }
                    let _g937 = 0;
                    G938: {
                      for (let _i939 = 0; _i939 < 1; _i939++) {
                        const v_k = v_s;
                        const _h940 = clueAt(cl.number, v_k);
                        const _h947 = (_h940 + 1);
                        let _c949: boolean = (_h940 !== -1);
                        if (_c949) {
                          let _c948: boolean = (_h631 || (_h940 === 1));
                          if (!_c948) {
                            let _g941 = 0;
                            G942: {
                              const _t943 = (_h940 + 1);
                              const _a944 = cluesValued(cl.number, _t943);
                              for (let _i945 = 0; _i945 < _a944.length; _i945++) {
                                const v_x = _a944[_i945];
                                const _h946 = clueAt(cl.number, v_x);
                                if (!((_h946 === _h947))) continue;
                                _g941++;
                              }
                            }
                            _c948 = (_g941 === 0);
                          }
                          _c949 = _c948;
                        }
                        if (!(_c949)) continue;
                        _g937++;
                      }
                    }
                    let _c1213: boolean = (_g932 < (2 - _g937));
                    if (_c1213) {
                      let _q950 = false;
                      Q951: {
                        const _a952 = sp.adj4[v_s];
                        for (let _i953 = 0; _i953 < _a952.length; _i953++) {
                          const v_y = _a952[_i953];
                          const _t954 = sp.adj4Edges[v_s][_i953];
                          let _c973: boolean = !((_t954 === _wc615 ? true : (b.grid[_t954] !== 0)));
                          if (_c973) {
                            let _g955 = 0;
                            G956: {
                              const _a957 = sp.adj4[v_s];
                              for (let _i958 = 0; _i958 < _a957.length; _i958++) {
                                const _t959 = sp.adj4Edges[v_s][_i958];
                                if (!(((_t959 === _wc615 ? _wd616 : (b.grid[_t959] || -1)) === 1))) continue;
                                _g955++;
                              }
                            }
                            let _g960 = 0;
                            G961: {
                              for (let _i962 = 0; _i962 < 1; _i962++) {
                                const v_k = v_s;
                                const _h963 = clueAt(cl.number, v_k);
                                const _h970 = (_h963 + 1);
                                let _c972: boolean = (_h963 !== -1);
                                if (_c972) {
                                  let _c971: boolean = (_h631 || (_h963 === 1));
                                  if (!_c971) {
                                    let _g964 = 0;
                                    G965: {
                                      const _t966 = (_h963 + 1);
                                      const _a967 = cluesValued(cl.number, _t966);
                                      for (let _i968 = 0; _i968 < _a967.length; _i968++) {
                                        const v_x = _a967[_i968];
                                        const _h969 = clueAt(cl.number, v_x);
                                        if (!((_h969 === _h970))) continue;
                                        _g964++;
                                      }
                                    }
                                    _c971 = (_g964 === 0);
                                  }
                                  _c972 = _c971;
                                }
                                if (!(_c972)) continue;
                                _g960++;
                              }
                            }
                            _c973 = (_g955 < (2 - _g960));
                          }
                          let _c993: boolean = _c973;
                          if (_c993) {
                            let _g974 = 0;
                            G975: {
                              const _a977 = sp.adj4[v_y];
                              for (let _i978 = 0; _i978 < _a977.length; _i978++) {
                                const _t979 = sp.adj4Edges[v_y][_i978];
                                if (!(((_t979 === _wc615 ? _wd616 : (b.grid[_t979] || -1)) === 1))) continue;
                                _g974++;
                              }
                            }
                            let _g980 = 0;
                            G981: {
                              for (let _i982 = 0; _i982 < 1; _i982++) {
                                const v_k = v_y;
                                const _h983 = clueAt(cl.number, v_k);
                                const _h990 = (_h983 + 1);
                                let _c992: boolean = (_h983 !== -1);
                                if (_c992) {
                                  let _c991: boolean = (_h631 || (_h983 === 1));
                                  if (!_c991) {
                                    let _g984 = 0;
                                    G985: {
                                      const _t986 = (_h983 + 1);
                                      const _a987 = cluesValued(cl.number, _t986);
                                      for (let _i988 = 0; _i988 < _a987.length; _i988++) {
                                        const v_x = _a987[_i988];
                                        const _h989 = clueAt(cl.number, v_x);
                                        if (!((_h989 === _h990))) continue;
                                        _g984++;
                                      }
                                    }
                                    _c991 = (_g984 === 0);
                                  }
                                  _c992 = _c991;
                                }
                                if (!(_c992)) continue;
                                _g980++;
                              }
                            }
                            _c993 = (_g974 < (2 - _g980));
                          }
                          let _c1070: boolean = _c993;
                          if (_c1070) {
                            let _q994 = true;
                            Q995: {
                              _g996.length = 0;
                              G997: {
                                for (let _i999 = 0; _i999 < 1; _i999++) {
                                  const v_x = v_s;
                                  const _h1000 = clueAt(cl.number, v_x);
                                  if (!((_h1000 !== -1))) continue;
                                  _g996.push(v_x);
                                }
                              }
                              _g1001.length = 0;
                              G1002: {
                                const _a1019 = throughWhere(sp, v_s, (_te1014: number): boolean => { let _c1016: boolean = ((_te1014 === _wc615 ? _wd616 : (b.grid[_te1014] || -1)) === 1); if (_c1016) {   const _t1015 = sp.edgeEnds[2 * _te1014];   _c1016 = !((clueAt(cl.number, _t1015) !== -1)); } let _c1018: boolean = _c1016; if (_c1018) {   const _t1017 = sp.edgeEnds[2 * _te1014 + 1];   _c1018 = !((clueAt(cl.number, _t1017) !== -1)); } return _c1018; });
                                for (let _i1020 = 0; _i1020 < _a1019.length; _i1020++) {
                                  const v_t = _a1019[_i1020];
                                  const _h1023 = clueAt(cl.number, v_t);
                                  const _h1024 = (_h1023 !== -1);
                                  const _h1025 = _h1024;
                                  const _h1026 = !(_h1025);
                                  const _a1021 = sp.adj4[v_t];
                                  for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
                                    const v_x = _a1021[_i1022];
                                    const _h1027 = clueAt(cl.number, v_x);
                                    let _c1029: boolean = (_h1026 && (_h1027 !== -1));
                                    if (_c1029) {
                                      const _t1028 = sp.adj4Edges[v_t][_i1022];
                                      _c1029 = ((_t1028 === _wc615 ? _wd616 : (b.grid[_t1028] || -1)) === 1);
                                    }
                                    if (!(_c1029)) continue;
                                    if (!_g1001.includes(v_x)) _g1001.push(v_x);
                                  }
                                }
                              }
                              const _a1030 = union(_g996, _g1001);
                              for (let _i1031 = 0; _i1031 < _a1030.length; _i1031++) {
                                const v_p = _a1030[_i1031];
                                const _h1068 = clueAt(cl.number, v_p);
                                _g1032.length = 0;
                                G1033: {
                                  for (let _i1035 = 0; _i1035 < 1; _i1035++) {
                                    const v_x = v_y;
                                    const _h1036 = clueAt(cl.number, v_x);
                                    if (!((_h1036 !== -1))) continue;
                                    _g1032.push(v_x);
                                  }
                                }
                                _g1037.length = 0;
                                G1038: {
                                  const _a1055 = throughWhere(sp, v_y, (_te1050: number): boolean => { let _c1052: boolean = ((_te1050 === _wc615 ? _wd616 : (b.grid[_te1050] || -1)) === 1); if (_c1052) {   const _t1051 = sp.edgeEnds[2 * _te1050];   _c1052 = !((clueAt(cl.number, _t1051) !== -1)); } let _c1054: boolean = _c1052; if (_c1054) {   const _t1053 = sp.edgeEnds[2 * _te1050 + 1];   _c1054 = !((clueAt(cl.number, _t1053) !== -1)); } return _c1054; });
                                  for (let _i1056 = 0; _i1056 < _a1055.length; _i1056++) {
                                    const v_t = _a1055[_i1056];
                                    const _h1059 = clueAt(cl.number, v_t);
                                    const _h1060 = (_h1059 !== -1);
                                    const _h1061 = _h1060;
                                    const _h1062 = !(_h1061);
                                    const _a1057 = sp.adj4[v_t];
                                    for (let _i1058 = 0; _i1058 < _a1057.length; _i1058++) {
                                      const v_x = _a1057[_i1058];
                                      const _h1063 = clueAt(cl.number, v_x);
                                      let _c1065: boolean = (_h1062 && (_h1063 !== -1));
                                      if (_c1065) {
                                        const _t1064 = sp.adj4Edges[v_t][_i1058];
                                        _c1065 = ((_t1064 === _wc615 ? _wd616 : (b.grid[_t1064] || -1)) === 1);
                                      }
                                      if (!(_c1065)) continue;
                                      if (!_g1037.includes(v_x)) _g1037.push(v_x);
                                    }
                                  }
                                }
                                const _a1066 = union(_g1032, _g1037);
                                for (let _i1067 = 0; _i1067 < _a1066.length; _i1067++) {
                                  const v_q = _a1066[_i1067];
                                  const _h1069 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1068 - _h1069)) === cl.step))) {
                                    _q994 = false;
                                    break Q995;
                                  }
                                }
                              }
                            }
                            _c1070 = _q994;
                          }
                          if (!((_c1070 && (_h631 || !(throughWhere(sp, v_s, (_te1071: number): boolean => {  return ((_te1071 === _wc615 ? _wd616 : (b.grid[_te1071] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g1072 = 0;
                          G1073: {
                            const _a1074 = sp.adj4[v_s];
                            for (let _i1075 = 0; _i1075 < _a1074.length; _i1075++) {
                              const _t1076 = sp.adj4Edges[v_s][_i1075];
                              if (!(((_t1076 === _wc615 ? _wd616 : (b.grid[_t1076] || -1)) === 1))) continue;
                              _g1072++;
                            }
                          }
                          let _g1077 = 0;
                          G1078: {
                            for (let _i1079 = 0; _i1079 < 1; _i1079++) {
                              const v_k = v_s;
                              const _h1080 = clueAt(cl.number, v_k);
                              const _h1087 = (_h1080 + 1);
                              let _c1089: boolean = (_h1080 !== -1);
                              if (_c1089) {
                                let _c1088: boolean = (_h631 || (_h1080 === 1));
                                if (!_c1088) {
                                  let _g1081 = 0;
                                  G1082: {
                                    const _t1083 = (_h1080 + 1);
                                    const _a1084 = cluesValued(cl.number, _t1083);
                                    for (let _i1085 = 0; _i1085 < _a1084.length; _i1085++) {
                                      const v_x = _a1084[_i1085];
                                      const _h1086 = clueAt(cl.number, v_x);
                                      if (!((_h1086 === _h1087))) continue;
                                      _g1081++;
                                    }
                                  }
                                  _c1088 = (_g1081 === 0);
                                }
                                _c1089 = _c1088;
                              }
                              if (!(_c1089)) continue;
                              _g1077++;
                            }
                          }
                          let _c1212: boolean = ((_g1072 + 1) === (2 - _g1077));
                          if (!_c1212) {
                            let _q1090 = false;
                            Q1091: {
                              const _a1092 = sp.adj4[v_s];
                              const _n1093 = _i953;
                              for (let _i1094 = 0; _i1094 < _n1093; _i1094++) {
                                const v_z = _a1092[_i1094];
                                const _t1095 = sp.adj4Edges[v_s][_i1094];
                                let _c1114: boolean = !((_t1095 === _wc615 ? true : (b.grid[_t1095] !== 0)));
                                if (_c1114) {
                                  let _g1096 = 0;
                                  G1097: {
                                    const _a1098 = sp.adj4[v_s];
                                    for (let _i1099 = 0; _i1099 < _a1098.length; _i1099++) {
                                      const _t1100 = sp.adj4Edges[v_s][_i1099];
                                      if (!(((_t1100 === _wc615 ? _wd616 : (b.grid[_t1100] || -1)) === 1))) continue;
                                      _g1096++;
                                    }
                                  }
                                  let _g1101 = 0;
                                  G1102: {
                                    for (let _i1103 = 0; _i1103 < 1; _i1103++) {
                                      const v_k = v_s;
                                      const _h1104 = clueAt(cl.number, v_k);
                                      const _h1111 = (_h1104 + 1);
                                      let _c1113: boolean = (_h1104 !== -1);
                                      if (_c1113) {
                                        let _c1112: boolean = (_h631 || (_h1104 === 1));
                                        if (!_c1112) {
                                          let _g1105 = 0;
                                          G1106: {
                                            const _t1107 = (_h1104 + 1);
                                            const _a1108 = cluesValued(cl.number, _t1107);
                                            for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
                                              const v_x = _a1108[_i1109];
                                              const _h1110 = clueAt(cl.number, v_x);
                                              if (!((_h1110 === _h1111))) continue;
                                              _g1105++;
                                            }
                                          }
                                          _c1112 = (_g1105 === 0);
                                        }
                                        _c1113 = _c1112;
                                      }
                                      if (!(_c1113)) continue;
                                      _g1101++;
                                    }
                                  }
                                  _c1114 = (_g1096 < (2 - _g1101));
                                }
                                let _c1133: boolean = _c1114;
                                if (_c1133) {
                                  let _g1115 = 0;
                                  G1116: {
                                    const _a1117 = sp.adj4[v_z];
                                    for (let _i1118 = 0; _i1118 < _a1117.length; _i1118++) {
                                      const _t1119 = sp.adj4Edges[v_z][_i1118];
                                      if (!(((_t1119 === _wc615 ? _wd616 : (b.grid[_t1119] || -1)) === 1))) continue;
                                      _g1115++;
                                    }
                                  }
                                  let _g1120 = 0;
                                  G1121: {
                                    for (let _i1122 = 0; _i1122 < 1; _i1122++) {
                                      const v_k = v_z;
                                      const _h1123 = clueAt(cl.number, v_k);
                                      const _h1130 = (_h1123 + 1);
                                      let _c1132: boolean = (_h1123 !== -1);
                                      if (_c1132) {
                                        let _c1131: boolean = (_h631 || (_h1123 === 1));
                                        if (!_c1131) {
                                          let _g1124 = 0;
                                          G1125: {
                                            const _t1126 = (_h1123 + 1);
                                            const _a1127 = cluesValued(cl.number, _t1126);
                                            for (let _i1128 = 0; _i1128 < _a1127.length; _i1128++) {
                                              const v_x = _a1127[_i1128];
                                              const _h1129 = clueAt(cl.number, v_x);
                                              if (!((_h1129 === _h1130))) continue;
                                              _g1124++;
                                            }
                                          }
                                          _c1131 = (_g1124 === 0);
                                        }
                                        _c1132 = _c1131;
                                      }
                                      if (!(_c1132)) continue;
                                      _g1120++;
                                    }
                                  }
                                  _c1133 = (_g1115 < (2 - _g1120));
                                }
                                let _c1210: boolean = _c1133;
                                if (_c1210) {
                                  let _q1134 = true;
                                  Q1135: {
                                    _g1136.length = 0;
                                    G1137: {
                                      for (let _i1139 = 0; _i1139 < 1; _i1139++) {
                                        const v_x = v_s;
                                        const _h1140 = clueAt(cl.number, v_x);
                                        if (!((_h1140 !== -1))) continue;
                                        _g1136.push(v_x);
                                      }
                                    }
                                    _g1141.length = 0;
                                    G1142: {
                                      const _a1159 = throughWhere(sp, v_s, (_te1154: number): boolean => { let _c1156: boolean = ((_te1154 === _wc615 ? _wd616 : (b.grid[_te1154] || -1)) === 1); if (_c1156) {   const _t1155 = sp.edgeEnds[2 * _te1154];   _c1156 = !((clueAt(cl.number, _t1155) !== -1)); } let _c1158: boolean = _c1156; if (_c1158) {   const _t1157 = sp.edgeEnds[2 * _te1154 + 1];   _c1158 = !((clueAt(cl.number, _t1157) !== -1)); } return _c1158; });
                                      for (let _i1160 = 0; _i1160 < _a1159.length; _i1160++) {
                                        const v_t = _a1159[_i1160];
                                        const _h1163 = clueAt(cl.number, v_t);
                                        const _h1164 = (_h1163 !== -1);
                                        const _h1165 = _h1164;
                                        const _h1166 = !(_h1165);
                                        const _a1161 = sp.adj4[v_t];
                                        for (let _i1162 = 0; _i1162 < _a1161.length; _i1162++) {
                                          const v_x = _a1161[_i1162];
                                          const _h1167 = clueAt(cl.number, v_x);
                                          let _c1169: boolean = (_h1166 && (_h1167 !== -1));
                                          if (_c1169) {
                                            const _t1168 = sp.adj4Edges[v_t][_i1162];
                                            _c1169 = ((_t1168 === _wc615 ? _wd616 : (b.grid[_t1168] || -1)) === 1);
                                          }
                                          if (!(_c1169)) continue;
                                          if (!_g1141.includes(v_x)) _g1141.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1170 = union(_g1136, _g1141);
                                    for (let _i1171 = 0; _i1171 < _a1170.length; _i1171++) {
                                      const v_p = _a1170[_i1171];
                                      const _h1208 = clueAt(cl.number, v_p);
                                      _g1172.length = 0;
                                      G1173: {
                                        for (let _i1175 = 0; _i1175 < 1; _i1175++) {
                                          const v_x = v_z;
                                          const _h1176 = clueAt(cl.number, v_x);
                                          if (!((_h1176 !== -1))) continue;
                                          _g1172.push(v_x);
                                        }
                                      }
                                      _g1177.length = 0;
                                      G1178: {
                                        const _a1195 = throughWhere(sp, v_z, (_te1190: number): boolean => { let _c1192: boolean = ((_te1190 === _wc615 ? _wd616 : (b.grid[_te1190] || -1)) === 1); if (_c1192) {   const _t1191 = sp.edgeEnds[2 * _te1190];   _c1192 = !((clueAt(cl.number, _t1191) !== -1)); } let _c1194: boolean = _c1192; if (_c1194) {   const _t1193 = sp.edgeEnds[2 * _te1190 + 1];   _c1194 = !((clueAt(cl.number, _t1193) !== -1)); } return _c1194; });
                                        for (let _i1196 = 0; _i1196 < _a1195.length; _i1196++) {
                                          const v_t = _a1195[_i1196];
                                          const _h1199 = clueAt(cl.number, v_t);
                                          const _h1200 = (_h1199 !== -1);
                                          const _h1201 = _h1200;
                                          const _h1202 = !(_h1201);
                                          const _a1197 = sp.adj4[v_t];
                                          for (let _i1198 = 0; _i1198 < _a1197.length; _i1198++) {
                                            const v_x = _a1197[_i1198];
                                            const _h1203 = clueAt(cl.number, v_x);
                                            let _c1205: boolean = (_h1202 && (_h1203 !== -1));
                                            if (_c1205) {
                                              const _t1204 = sp.adj4Edges[v_t][_i1198];
                                              _c1205 = ((_t1204 === _wc615 ? _wd616 : (b.grid[_t1204] || -1)) === 1);
                                            }
                                            if (!(_c1205)) continue;
                                            if (!_g1177.includes(v_x)) _g1177.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1206 = union(_g1172, _g1177);
                                      for (let _i1207 = 0; _i1207 < _a1206.length; _i1207++) {
                                        const v_q = _a1206[_i1207];
                                        const _h1209 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1208 - _h1209)) === cl.step))) {
                                          _q1134 = false;
                                          break Q1135;
                                        }
                                      }
                                    }
                                  }
                                  _c1210 = _q1134;
                                }
                                if ((_c1210 && (_h631 || !(throughWhere(sp, v_s, (_te1211: number): boolean => {  return ((_te1211 === _wc615 ? _wd616 : (b.grid[_te1211] || -1)) === 1); }).includes(v_z))))) {
                                  _q1090 = true;
                                  break Q1091;
                                }
                              }
                            }
                            _c1212 = _q1090;
                          }
                          if (_c1212) {
                            _q950 = true;
                            break Q951;
                          }
                        }
                      }
                      _c1213 = !(_q950);
                    }
                    if (_c1213) {
                      _q928 = true;
                      break Q929;
                    }
                  }
                }
                _c1214 = _q928;
              }
              if (_c1214) {
                _q617 = true;
                break Q618;
              }
            }
          }
          _c1215 = _q617;
        }
        _c1216 = _c1215;
      }
      if (!(_c1216)) break L613;
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

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g1845: number[] = [];
  const _g1850: number[] = [];
  const _g1883: number[] = [];
  const _g1888: number[] = [];
  const _g1987: number[] = [];
  const _g1992: number[] = [];
  const _g2025: number[] = [];
  const _g2030: number[] = [];
  const _g2135: number[] = [];
  const _g2140: number[] = [];
  const _g2171: number[] = [];
  const _g2176: number[] = [];
  const _g2275: number[] = [];
  const _g2280: number[] = [];
  const _g2311: number[] = [];
  const _g2316: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h1770 = (cl.step === 0);
  if (pairBreaksCands.length < sp.edges.length) pairBreaksCands = new Int32Array(sp.edges.length);
  const cands = pairBreaksCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a1736 = sp.cells;
  for (let _i1737 = 0; _i1737 < _a1736.length; _i1737++) {
    const v_c = _a1736[_i1737];
    let _g1738 = 0;
    G1739: {
      const _a1740 = sp.adj4[v_c];
      for (let _i1741 = 0; _i1741 < _a1740.length; _i1741++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i1741]] || -1) === 1))) continue;
        _g1738++;
      }
    }
    if (!(((takes(sp, cl, v_c) - _g1738) === 2))) continue;
    const _h1748 = clueAt(cl.number, v_c);
    const _h1749 = (_h1748 !== -1);
    const _h1750 = _h1749;
    const _h1751 = !(_h1750);
    L1742: {
      const v_U = ways(b, sp, cl, v_c);
      const _h1743 = v_U.length;
      if (!((_h1743 === 3))) break L1742;
      const _a1744 = v_U;
      for (let _i1745 = 0; _i1745 < _a1744.length; _i1745++) {
        const v_k = _a1744[_i1745];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L1746: {
          const v_j = (v_I[1] ?? -1);
          let _c2355: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c2355) {
            let _c2354: boolean = ((throughWhere(sp, v_i, (_te1747: number): boolean => {  return ((b.grid[_te1747] || -1) === 1); }).includes(v_j)) || (_h1751 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
            if (!_c2354) {
              const _wc1752 = sp.edgeOf(v_c, v_i);
              const _wd1753 = 1;
              const _wc1754 = sp.edgeOf(v_c, v_j);
              const _wd1755 = 1;
              let _q1756 = false;
              Q1757: {
                const _a1759 = throughWhere(sp, v_c, (_te1758: number): boolean => {  return ((_te1758 === _wc1754 ? _wd1755 : (_te1758 === _wc1752 ? _wd1753 : (b.grid[_te1758] || -1))) === 1); });
                for (let _i1760 = 0; _i1760 < _a1759.length; _i1760++) {
                  const v_t = _a1759[_i1760];
                  let _c1780: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c1780) {
                    let _g1761 = 0;
                    G1762: {
                      const _a1763 = sp.adj4[v_t];
                      for (let _i1764 = 0; _i1764 < _a1763.length; _i1764++) {
                        const _t1765 = sp.adj4Edges[v_t][_i1764];
                        if (!(((_t1765 === _wc1754 ? _wd1755 : (_t1765 === _wc1752 ? _wd1753 : (b.grid[_t1765] || -1))) === 1))) continue;
                        _g1761++;
                      }
                    }
                    let _g1766 = 0;
                    G1767: {
                      for (let _i1768 = 0; _i1768 < 1; _i1768++) {
                        const v_k = v_t;
                        const _h1769 = clueAt(cl.number, v_k);
                        const _h1777 = (_h1769 + 1);
                        let _c1779: boolean = (_h1769 !== -1);
                        if (_c1779) {
                          let _c1778: boolean = (_h1770 || (_h1769 === 1));
                          if (!_c1778) {
                            let _g1771 = 0;
                            G1772: {
                              const _t1773 = (_h1769 + 1);
                              const _a1774 = cluesValued(cl.number, _t1773);
                              for (let _i1775 = 0; _i1775 < _a1774.length; _i1775++) {
                                const v_x = _a1774[_i1775];
                                const _h1776 = clueAt(cl.number, v_x);
                                if (!((_h1776 === _h1777))) continue;
                                _g1771++;
                              }
                            }
                            _c1778 = (_g1771 === 0);
                          }
                          _c1779 = _c1778;
                        }
                        if (!(_c1779)) continue;
                        _g1766++;
                      }
                    }
                    _c1780 = (_g1761 < (2 - _g1766));
                  }
                  if (!(_c1780)) continue;
                  let _g1781 = 0;
                  G1782: {
                    const _a1783 = sp.adj4[v_t];
                    for (let _i1784 = 0; _i1784 < _a1783.length; _i1784++) {
                      const _t1785 = sp.adj4Edges[v_t][_i1784];
                      if (!(((_t1785 === _wc1754 ? _wd1755 : (_t1785 === _wc1752 ? _wd1753 : (b.grid[_t1785] || -1))) === 1))) continue;
                      _g1781++;
                    }
                  }
                  let _g1786 = 0;
                  G1787: {
                    for (let _i1788 = 0; _i1788 < 1; _i1788++) {
                      const v_k = v_t;
                      const _h1789 = clueAt(cl.number, v_k);
                      const _h1796 = (_h1789 + 1);
                      let _c1798: boolean = (_h1789 !== -1);
                      if (_c1798) {
                        let _c1797: boolean = (_h1770 || (_h1789 === 1));
                        if (!_c1797) {
                          let _g1790 = 0;
                          G1791: {
                            const _t1792 = (_h1789 + 1);
                            const _a1793 = cluesValued(cl.number, _t1792);
                            for (let _i1794 = 0; _i1794 < _a1793.length; _i1794++) {
                              const v_x = _a1793[_i1794];
                              const _h1795 = clueAt(cl.number, v_x);
                              if (!((_h1795 === _h1796))) continue;
                              _g1790++;
                            }
                          }
                          _c1797 = (_g1790 === 0);
                        }
                        _c1798 = _c1797;
                      }
                      if (!(_c1798)) continue;
                      _g1786++;
                    }
                  }
                  let _c2066: boolean = (_g1781 < (2 - _g1786));
                  if (_c2066) {
                    let _q1799 = false;
                    Q1800: {
                      const _a1801 = sp.adj4[v_t];
                      for (let _i1802 = 0; _i1802 < _a1801.length; _i1802++) {
                        const v_y = _a1801[_i1802];
                        const _t1803 = sp.adj4Edges[v_t][_i1802];
                        let _c1822: boolean = !((_t1803 === _wc1754 ? true : (_t1803 === _wc1752 ? true : (b.grid[_t1803] !== 0))));
                        if (_c1822) {
                          let _g1804 = 0;
                          G1805: {
                            const _a1806 = sp.adj4[v_t];
                            for (let _i1807 = 0; _i1807 < _a1806.length; _i1807++) {
                              const _t1808 = sp.adj4Edges[v_t][_i1807];
                              if (!(((_t1808 === _wc1754 ? _wd1755 : (_t1808 === _wc1752 ? _wd1753 : (b.grid[_t1808] || -1))) === 1))) continue;
                              _g1804++;
                            }
                          }
                          let _g1809 = 0;
                          G1810: {
                            for (let _i1811 = 0; _i1811 < 1; _i1811++) {
                              const v_k = v_t;
                              const _h1812 = clueAt(cl.number, v_k);
                              const _h1819 = (_h1812 + 1);
                              let _c1821: boolean = (_h1812 !== -1);
                              if (_c1821) {
                                let _c1820: boolean = (_h1770 || (_h1812 === 1));
                                if (!_c1820) {
                                  let _g1813 = 0;
                                  G1814: {
                                    const _t1815 = (_h1812 + 1);
                                    const _a1816 = cluesValued(cl.number, _t1815);
                                    for (let _i1817 = 0; _i1817 < _a1816.length; _i1817++) {
                                      const v_x = _a1816[_i1817];
                                      const _h1818 = clueAt(cl.number, v_x);
                                      if (!((_h1818 === _h1819))) continue;
                                      _g1813++;
                                    }
                                  }
                                  _c1820 = (_g1813 === 0);
                                }
                                _c1821 = _c1820;
                              }
                              if (!(_c1821)) continue;
                              _g1809++;
                            }
                          }
                          _c1822 = (_g1804 < (2 - _g1809));
                        }
                        let _c1842: boolean = _c1822;
                        if (_c1842) {
                          let _g1823 = 0;
                          G1824: {
                            const _a1826 = sp.adj4[v_y];
                            for (let _i1827 = 0; _i1827 < _a1826.length; _i1827++) {
                              const _t1828 = sp.adj4Edges[v_y][_i1827];
                              if (!(((_t1828 === _wc1754 ? _wd1755 : (_t1828 === _wc1752 ? _wd1753 : (b.grid[_t1828] || -1))) === 1))) continue;
                              _g1823++;
                            }
                          }
                          let _g1829 = 0;
                          G1830: {
                            for (let _i1831 = 0; _i1831 < 1; _i1831++) {
                              const v_k = v_y;
                              const _h1832 = clueAt(cl.number, v_k);
                              const _h1839 = (_h1832 + 1);
                              let _c1841: boolean = (_h1832 !== -1);
                              if (_c1841) {
                                let _c1840: boolean = (_h1770 || (_h1832 === 1));
                                if (!_c1840) {
                                  let _g1833 = 0;
                                  G1834: {
                                    const _t1835 = (_h1832 + 1);
                                    const _a1836 = cluesValued(cl.number, _t1835);
                                    for (let _i1837 = 0; _i1837 < _a1836.length; _i1837++) {
                                      const v_x = _a1836[_i1837];
                                      const _h1838 = clueAt(cl.number, v_x);
                                      if (!((_h1838 === _h1839))) continue;
                                      _g1833++;
                                    }
                                  }
                                  _c1840 = (_g1833 === 0);
                                }
                                _c1841 = _c1840;
                              }
                              if (!(_c1841)) continue;
                              _g1829++;
                            }
                          }
                          _c1842 = (_g1823 < (2 - _g1829));
                        }
                        let _c1921: boolean = _c1842;
                        if (_c1921) {
                          let _q1843 = true;
                          Q1844: {
                            _g1845.length = 0;
                            G1846: {
                              for (let _i1848 = 0; _i1848 < 1; _i1848++) {
                                const v_x = v_t;
                                const _h1849 = clueAt(cl.number, v_x);
                                if (!((_h1849 !== -1))) continue;
                                _g1845.push(v_x);
                              }
                            }
                            _g1850.length = 0;
                            G1851: {
                              const _a1870 = throughWhere(sp, v_t, (_te1865: number): boolean => { let _c1867: boolean = ((_te1865 === _wc1754 ? _wd1755 : (_te1865 === _wc1752 ? _wd1753 : (b.grid[_te1865] || -1))) === 1); if (_c1867) {   const _t1866 = sp.edgeEnds[2 * _te1865];   _c1867 = !((clueAt(cl.number, _t1866) !== -1)); } let _c1869: boolean = _c1867; if (_c1869) {   const _t1868 = sp.edgeEnds[2 * _te1865 + 1];   _c1869 = !((clueAt(cl.number, _t1868) !== -1)); } return _c1869; });
                              for (let _i1871 = 0; _i1871 < _a1870.length; _i1871++) {
                                const v_t_1864 = _a1870[_i1871];
                                const _h1874 = clueAt(cl.number, v_t_1864);
                                const _h1875 = (_h1874 !== -1);
                                const _h1876 = _h1875;
                                const _h1877 = !(_h1876);
                                const _a1872 = sp.adj4[v_t_1864];
                                for (let _i1873 = 0; _i1873 < _a1872.length; _i1873++) {
                                  const v_x = _a1872[_i1873];
                                  const _h1878 = clueAt(cl.number, v_x);
                                  let _c1880: boolean = (_h1877 && (_h1878 !== -1));
                                  if (_c1880) {
                                    const _t1879 = sp.adj4Edges[v_t_1864][_i1873];
                                    _c1880 = ((_t1879 === _wc1754 ? _wd1755 : (_t1879 === _wc1752 ? _wd1753 : (b.grid[_t1879] || -1))) === 1);
                                  }
                                  if (!(_c1880)) continue;
                                  if (!_g1850.includes(v_x)) _g1850.push(v_x);
                                }
                              }
                            }
                            const _a1881 = union(_g1845, _g1850);
                            for (let _i1882 = 0; _i1882 < _a1881.length; _i1882++) {
                              const v_p = _a1881[_i1882];
                              const _h1919 = clueAt(cl.number, v_p);
                              _g1883.length = 0;
                              G1884: {
                                for (let _i1886 = 0; _i1886 < 1; _i1886++) {
                                  const v_x = v_y;
                                  const _h1887 = clueAt(cl.number, v_x);
                                  if (!((_h1887 !== -1))) continue;
                                  _g1883.push(v_x);
                                }
                              }
                              _g1888.length = 0;
                              G1889: {
                                const _a1906 = throughWhere(sp, v_y, (_te1901: number): boolean => { let _c1903: boolean = ((_te1901 === _wc1754 ? _wd1755 : (_te1901 === _wc1752 ? _wd1753 : (b.grid[_te1901] || -1))) === 1); if (_c1903) {   const _t1902 = sp.edgeEnds[2 * _te1901];   _c1903 = !((clueAt(cl.number, _t1902) !== -1)); } let _c1905: boolean = _c1903; if (_c1905) {   const _t1904 = sp.edgeEnds[2 * _te1901 + 1];   _c1905 = !((clueAt(cl.number, _t1904) !== -1)); } return _c1905; });
                                for (let _i1907 = 0; _i1907 < _a1906.length; _i1907++) {
                                  const v_t = _a1906[_i1907];
                                  const _h1910 = clueAt(cl.number, v_t);
                                  const _h1911 = (_h1910 !== -1);
                                  const _h1912 = _h1911;
                                  const _h1913 = !(_h1912);
                                  const _a1908 = sp.adj4[v_t];
                                  for (let _i1909 = 0; _i1909 < _a1908.length; _i1909++) {
                                    const v_x = _a1908[_i1909];
                                    const _h1914 = clueAt(cl.number, v_x);
                                    let _c1916: boolean = (_h1913 && (_h1914 !== -1));
                                    if (_c1916) {
                                      const _t1915 = sp.adj4Edges[v_t][_i1909];
                                      _c1916 = ((_t1915 === _wc1754 ? _wd1755 : (_t1915 === _wc1752 ? _wd1753 : (b.grid[_t1915] || -1))) === 1);
                                    }
                                    if (!(_c1916)) continue;
                                    if (!_g1888.includes(v_x)) _g1888.push(v_x);
                                  }
                                }
                              }
                              const _a1917 = union(_g1883, _g1888);
                              for (let _i1918 = 0; _i1918 < _a1917.length; _i1918++) {
                                const v_q = _a1917[_i1918];
                                const _h1920 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h1919 - _h1920)) === cl.step))) {
                                  _q1843 = false;
                                  break Q1844;
                                }
                              }
                            }
                          }
                          _c1921 = _q1843;
                        }
                        if (!((_c1921 && (_h1770 || !(throughWhere(sp, v_t, (_te1922: number): boolean => {  return ((_te1922 === _wc1754 ? _wd1755 : (_te1922 === _wc1752 ? _wd1753 : (b.grid[_te1922] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g1923 = 0;
                        G1924: {
                          const _a1925 = sp.adj4[v_t];
                          for (let _i1926 = 0; _i1926 < _a1925.length; _i1926++) {
                            const _t1927 = sp.adj4Edges[v_t][_i1926];
                            if (!(((_t1927 === _wc1754 ? _wd1755 : (_t1927 === _wc1752 ? _wd1753 : (b.grid[_t1927] || -1))) === 1))) continue;
                            _g1923++;
                          }
                        }
                        let _g1928 = 0;
                        G1929: {
                          for (let _i1930 = 0; _i1930 < 1; _i1930++) {
                            const v_k = v_t;
                            const _h1931 = clueAt(cl.number, v_k);
                            const _h1938 = (_h1931 + 1);
                            let _c1940: boolean = (_h1931 !== -1);
                            if (_c1940) {
                              let _c1939: boolean = (_h1770 || (_h1931 === 1));
                              if (!_c1939) {
                                let _g1932 = 0;
                                G1933: {
                                  const _t1934 = (_h1931 + 1);
                                  const _a1935 = cluesValued(cl.number, _t1934);
                                  for (let _i1936 = 0; _i1936 < _a1935.length; _i1936++) {
                                    const v_x = _a1935[_i1936];
                                    const _h1937 = clueAt(cl.number, v_x);
                                    if (!((_h1937 === _h1938))) continue;
                                    _g1932++;
                                  }
                                }
                                _c1939 = (_g1932 === 0);
                              }
                              _c1940 = _c1939;
                            }
                            if (!(_c1940)) continue;
                            _g1928++;
                          }
                        }
                        let _c2065: boolean = ((_g1923 + 1) === (2 - _g1928));
                        if (!_c2065) {
                          let _q1941 = false;
                          Q1942: {
                            const _a1943 = sp.adj4[v_t];
                            const _n1944 = _i1802;
                            for (let _i1945 = 0; _i1945 < _n1944; _i1945++) {
                              const v_z = _a1943[_i1945];
                              const _t1946 = sp.adj4Edges[v_t][_i1945];
                              let _c1965: boolean = !((_t1946 === _wc1754 ? true : (_t1946 === _wc1752 ? true : (b.grid[_t1946] !== 0))));
                              if (_c1965) {
                                let _g1947 = 0;
                                G1948: {
                                  const _a1949 = sp.adj4[v_t];
                                  for (let _i1950 = 0; _i1950 < _a1949.length; _i1950++) {
                                    const _t1951 = sp.adj4Edges[v_t][_i1950];
                                    if (!(((_t1951 === _wc1754 ? _wd1755 : (_t1951 === _wc1752 ? _wd1753 : (b.grid[_t1951] || -1))) === 1))) continue;
                                    _g1947++;
                                  }
                                }
                                let _g1952 = 0;
                                G1953: {
                                  for (let _i1954 = 0; _i1954 < 1; _i1954++) {
                                    const v_k = v_t;
                                    const _h1955 = clueAt(cl.number, v_k);
                                    const _h1962 = (_h1955 + 1);
                                    let _c1964: boolean = (_h1955 !== -1);
                                    if (_c1964) {
                                      let _c1963: boolean = (_h1770 || (_h1955 === 1));
                                      if (!_c1963) {
                                        let _g1956 = 0;
                                        G1957: {
                                          const _t1958 = (_h1955 + 1);
                                          const _a1959 = cluesValued(cl.number, _t1958);
                                          for (let _i1960 = 0; _i1960 < _a1959.length; _i1960++) {
                                            const v_x = _a1959[_i1960];
                                            const _h1961 = clueAt(cl.number, v_x);
                                            if (!((_h1961 === _h1962))) continue;
                                            _g1956++;
                                          }
                                        }
                                        _c1963 = (_g1956 === 0);
                                      }
                                      _c1964 = _c1963;
                                    }
                                    if (!(_c1964)) continue;
                                    _g1952++;
                                  }
                                }
                                _c1965 = (_g1947 < (2 - _g1952));
                              }
                              let _c1984: boolean = _c1965;
                              if (_c1984) {
                                let _g1966 = 0;
                                G1967: {
                                  const _a1968 = sp.adj4[v_z];
                                  for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
                                    const _t1970 = sp.adj4Edges[v_z][_i1969];
                                    if (!(((_t1970 === _wc1754 ? _wd1755 : (_t1970 === _wc1752 ? _wd1753 : (b.grid[_t1970] || -1))) === 1))) continue;
                                    _g1966++;
                                  }
                                }
                                let _g1971 = 0;
                                G1972: {
                                  for (let _i1973 = 0; _i1973 < 1; _i1973++) {
                                    const v_k = v_z;
                                    const _h1974 = clueAt(cl.number, v_k);
                                    const _h1981 = (_h1974 + 1);
                                    let _c1983: boolean = (_h1974 !== -1);
                                    if (_c1983) {
                                      let _c1982: boolean = (_h1770 || (_h1974 === 1));
                                      if (!_c1982) {
                                        let _g1975 = 0;
                                        G1976: {
                                          const _t1977 = (_h1974 + 1);
                                          const _a1978 = cluesValued(cl.number, _t1977);
                                          for (let _i1979 = 0; _i1979 < _a1978.length; _i1979++) {
                                            const v_x = _a1978[_i1979];
                                            const _h1980 = clueAt(cl.number, v_x);
                                            if (!((_h1980 === _h1981))) continue;
                                            _g1975++;
                                          }
                                        }
                                        _c1982 = (_g1975 === 0);
                                      }
                                      _c1983 = _c1982;
                                    }
                                    if (!(_c1983)) continue;
                                    _g1971++;
                                  }
                                }
                                _c1984 = (_g1966 < (2 - _g1971));
                              }
                              let _c2063: boolean = _c1984;
                              if (_c2063) {
                                let _q1985 = true;
                                Q1986: {
                                  _g1987.length = 0;
                                  G1988: {
                                    for (let _i1990 = 0; _i1990 < 1; _i1990++) {
                                      const v_x = v_t;
                                      const _h1991 = clueAt(cl.number, v_x);
                                      if (!((_h1991 !== -1))) continue;
                                      _g1987.push(v_x);
                                    }
                                  }
                                  _g1992.length = 0;
                                  G1993: {
                                    const _a2012 = throughWhere(sp, v_t, (_te2007: number): boolean => { let _c2009: boolean = ((_te2007 === _wc1754 ? _wd1755 : (_te2007 === _wc1752 ? _wd1753 : (b.grid[_te2007] || -1))) === 1); if (_c2009) {   const _t2008 = sp.edgeEnds[2 * _te2007];   _c2009 = !((clueAt(cl.number, _t2008) !== -1)); } let _c2011: boolean = _c2009; if (_c2011) {   const _t2010 = sp.edgeEnds[2 * _te2007 + 1];   _c2011 = !((clueAt(cl.number, _t2010) !== -1)); } return _c2011; });
                                    for (let _i2013 = 0; _i2013 < _a2012.length; _i2013++) {
                                      const v_t_2006 = _a2012[_i2013];
                                      const _h2016 = clueAt(cl.number, v_t_2006);
                                      const _h2017 = (_h2016 !== -1);
                                      const _h2018 = _h2017;
                                      const _h2019 = !(_h2018);
                                      const _a2014 = sp.adj4[v_t_2006];
                                      for (let _i2015 = 0; _i2015 < _a2014.length; _i2015++) {
                                        const v_x = _a2014[_i2015];
                                        const _h2020 = clueAt(cl.number, v_x);
                                        let _c2022: boolean = (_h2019 && (_h2020 !== -1));
                                        if (_c2022) {
                                          const _t2021 = sp.adj4Edges[v_t_2006][_i2015];
                                          _c2022 = ((_t2021 === _wc1754 ? _wd1755 : (_t2021 === _wc1752 ? _wd1753 : (b.grid[_t2021] || -1))) === 1);
                                        }
                                        if (!(_c2022)) continue;
                                        if (!_g1992.includes(v_x)) _g1992.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2023 = union(_g1987, _g1992);
                                  for (let _i2024 = 0; _i2024 < _a2023.length; _i2024++) {
                                    const v_p = _a2023[_i2024];
                                    const _h2061 = clueAt(cl.number, v_p);
                                    _g2025.length = 0;
                                    G2026: {
                                      for (let _i2028 = 0; _i2028 < 1; _i2028++) {
                                        const v_x = v_z;
                                        const _h2029 = clueAt(cl.number, v_x);
                                        if (!((_h2029 !== -1))) continue;
                                        _g2025.push(v_x);
                                      }
                                    }
                                    _g2030.length = 0;
                                    G2031: {
                                      const _a2048 = throughWhere(sp, v_z, (_te2043: number): boolean => { let _c2045: boolean = ((_te2043 === _wc1754 ? _wd1755 : (_te2043 === _wc1752 ? _wd1753 : (b.grid[_te2043] || -1))) === 1); if (_c2045) {   const _t2044 = sp.edgeEnds[2 * _te2043];   _c2045 = !((clueAt(cl.number, _t2044) !== -1)); } let _c2047: boolean = _c2045; if (_c2047) {   const _t2046 = sp.edgeEnds[2 * _te2043 + 1];   _c2047 = !((clueAt(cl.number, _t2046) !== -1)); } return _c2047; });
                                      for (let _i2049 = 0; _i2049 < _a2048.length; _i2049++) {
                                        const v_t = _a2048[_i2049];
                                        const _h2052 = clueAt(cl.number, v_t);
                                        const _h2053 = (_h2052 !== -1);
                                        const _h2054 = _h2053;
                                        const _h2055 = !(_h2054);
                                        const _a2050 = sp.adj4[v_t];
                                        for (let _i2051 = 0; _i2051 < _a2050.length; _i2051++) {
                                          const v_x = _a2050[_i2051];
                                          const _h2056 = clueAt(cl.number, v_x);
                                          let _c2058: boolean = (_h2055 && (_h2056 !== -1));
                                          if (_c2058) {
                                            const _t2057 = sp.adj4Edges[v_t][_i2051];
                                            _c2058 = ((_t2057 === _wc1754 ? _wd1755 : (_t2057 === _wc1752 ? _wd1753 : (b.grid[_t2057] || -1))) === 1);
                                          }
                                          if (!(_c2058)) continue;
                                          if (!_g2030.includes(v_x)) _g2030.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2059 = union(_g2025, _g2030);
                                    for (let _i2060 = 0; _i2060 < _a2059.length; _i2060++) {
                                      const v_q = _a2059[_i2060];
                                      const _h2062 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2061 - _h2062)) === cl.step))) {
                                        _q1985 = false;
                                        break Q1986;
                                      }
                                    }
                                  }
                                }
                                _c2063 = _q1985;
                              }
                              if ((_c2063 && (_h1770 || !(throughWhere(sp, v_t, (_te2064: number): boolean => {  return ((_te2064 === _wc1754 ? _wd1755 : (_te2064 === _wc1752 ? _wd1753 : (b.grid[_te2064] || -1))) === 1); }).includes(v_z))))) {
                                _q1941 = true;
                                break Q1942;
                              }
                            }
                          }
                          _c2065 = _q1941;
                        }
                        if (_c2065) {
                          _q1799 = true;
                          break Q1800;
                        }
                      }
                    }
                    _c2066 = !(_q1799);
                  }
                  let _c2353: boolean = _c2066;
                  if (!_c2353) {
                    let _q2067 = false;
                    Q2068: {
                      const _a2069 = sp.adj4[v_t];
                      for (let _i2070 = 0; _i2070 < _a2069.length; _i2070++) {
                        const v_s = _a2069[_i2070];
                        let _g2071 = 0;
                        G2072: {
                          const _a2073 = sp.adj4[v_s];
                          for (let _i2074 = 0; _i2074 < _a2073.length; _i2074++) {
                            const _t2075 = sp.adj4Edges[v_s][_i2074];
                            if (!(((_t2075 === _wc1754 ? _wd1755 : (_t2075 === _wc1752 ? _wd1753 : (b.grid[_t2075] || -1))) === 1))) continue;
                            _g2071++;
                          }
                        }
                        let _g2076 = 0;
                        G2077: {
                          for (let _i2078 = 0; _i2078 < 1; _i2078++) {
                            const v_k = v_s;
                            const _h2079 = clueAt(cl.number, v_k);
                            const _h2086 = (_h2079 + 1);
                            let _c2088: boolean = (_h2079 !== -1);
                            if (_c2088) {
                              let _c2087: boolean = (_h1770 || (_h2079 === 1));
                              if (!_c2087) {
                                let _g2080 = 0;
                                G2081: {
                                  const _t2082 = (_h2079 + 1);
                                  const _a2083 = cluesValued(cl.number, _t2082);
                                  for (let _i2084 = 0; _i2084 < _a2083.length; _i2084++) {
                                    const v_x = _a2083[_i2084];
                                    const _h2085 = clueAt(cl.number, v_x);
                                    if (!((_h2085 === _h2086))) continue;
                                    _g2080++;
                                  }
                                }
                                _c2087 = (_g2080 === 0);
                              }
                              _c2088 = _c2087;
                            }
                            if (!(_c2088)) continue;
                            _g2076++;
                          }
                        }
                        let _c2352: boolean = (_g2071 < (2 - _g2076));
                        if (_c2352) {
                          let _q2089 = false;
                          Q2090: {
                            const _a2091 = sp.adj4[v_s];
                            for (let _i2092 = 0; _i2092 < _a2091.length; _i2092++) {
                              const v_y = _a2091[_i2092];
                              const _t2093 = sp.adj4Edges[v_s][_i2092];
                              let _c2112: boolean = !((_t2093 === _wc1754 ? true : (_t2093 === _wc1752 ? true : (b.grid[_t2093] !== 0))));
                              if (_c2112) {
                                let _g2094 = 0;
                                G2095: {
                                  const _a2096 = sp.adj4[v_s];
                                  for (let _i2097 = 0; _i2097 < _a2096.length; _i2097++) {
                                    const _t2098 = sp.adj4Edges[v_s][_i2097];
                                    if (!(((_t2098 === _wc1754 ? _wd1755 : (_t2098 === _wc1752 ? _wd1753 : (b.grid[_t2098] || -1))) === 1))) continue;
                                    _g2094++;
                                  }
                                }
                                let _g2099 = 0;
                                G2100: {
                                  for (let _i2101 = 0; _i2101 < 1; _i2101++) {
                                    const v_k = v_s;
                                    const _h2102 = clueAt(cl.number, v_k);
                                    const _h2109 = (_h2102 + 1);
                                    let _c2111: boolean = (_h2102 !== -1);
                                    if (_c2111) {
                                      let _c2110: boolean = (_h1770 || (_h2102 === 1));
                                      if (!_c2110) {
                                        let _g2103 = 0;
                                        G2104: {
                                          const _t2105 = (_h2102 + 1);
                                          const _a2106 = cluesValued(cl.number, _t2105);
                                          for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
                                            const v_x = _a2106[_i2107];
                                            const _h2108 = clueAt(cl.number, v_x);
                                            if (!((_h2108 === _h2109))) continue;
                                            _g2103++;
                                          }
                                        }
                                        _c2110 = (_g2103 === 0);
                                      }
                                      _c2111 = _c2110;
                                    }
                                    if (!(_c2111)) continue;
                                    _g2099++;
                                  }
                                }
                                _c2112 = (_g2094 < (2 - _g2099));
                              }
                              let _c2132: boolean = _c2112;
                              if (_c2132) {
                                let _g2113 = 0;
                                G2114: {
                                  const _a2116 = sp.adj4[v_y];
                                  for (let _i2117 = 0; _i2117 < _a2116.length; _i2117++) {
                                    const _t2118 = sp.adj4Edges[v_y][_i2117];
                                    if (!(((_t2118 === _wc1754 ? _wd1755 : (_t2118 === _wc1752 ? _wd1753 : (b.grid[_t2118] || -1))) === 1))) continue;
                                    _g2113++;
                                  }
                                }
                                let _g2119 = 0;
                                G2120: {
                                  for (let _i2121 = 0; _i2121 < 1; _i2121++) {
                                    const v_k = v_y;
                                    const _h2122 = clueAt(cl.number, v_k);
                                    const _h2129 = (_h2122 + 1);
                                    let _c2131: boolean = (_h2122 !== -1);
                                    if (_c2131) {
                                      let _c2130: boolean = (_h1770 || (_h2122 === 1));
                                      if (!_c2130) {
                                        let _g2123 = 0;
                                        G2124: {
                                          const _t2125 = (_h2122 + 1);
                                          const _a2126 = cluesValued(cl.number, _t2125);
                                          for (let _i2127 = 0; _i2127 < _a2126.length; _i2127++) {
                                            const v_x = _a2126[_i2127];
                                            const _h2128 = clueAt(cl.number, v_x);
                                            if (!((_h2128 === _h2129))) continue;
                                            _g2123++;
                                          }
                                        }
                                        _c2130 = (_g2123 === 0);
                                      }
                                      _c2131 = _c2130;
                                    }
                                    if (!(_c2131)) continue;
                                    _g2119++;
                                  }
                                }
                                _c2132 = (_g2113 < (2 - _g2119));
                              }
                              let _c2209: boolean = _c2132;
                              if (_c2209) {
                                let _q2133 = true;
                                Q2134: {
                                  _g2135.length = 0;
                                  G2136: {
                                    for (let _i2138 = 0; _i2138 < 1; _i2138++) {
                                      const v_x = v_s;
                                      const _h2139 = clueAt(cl.number, v_x);
                                      if (!((_h2139 !== -1))) continue;
                                      _g2135.push(v_x);
                                    }
                                  }
                                  _g2140.length = 0;
                                  G2141: {
                                    const _a2158 = throughWhere(sp, v_s, (_te2153: number): boolean => { let _c2155: boolean = ((_te2153 === _wc1754 ? _wd1755 : (_te2153 === _wc1752 ? _wd1753 : (b.grid[_te2153] || -1))) === 1); if (_c2155) {   const _t2154 = sp.edgeEnds[2 * _te2153];   _c2155 = !((clueAt(cl.number, _t2154) !== -1)); } let _c2157: boolean = _c2155; if (_c2157) {   const _t2156 = sp.edgeEnds[2 * _te2153 + 1];   _c2157 = !((clueAt(cl.number, _t2156) !== -1)); } return _c2157; });
                                    for (let _i2159 = 0; _i2159 < _a2158.length; _i2159++) {
                                      const v_t = _a2158[_i2159];
                                      const _h2162 = clueAt(cl.number, v_t);
                                      const _h2163 = (_h2162 !== -1);
                                      const _h2164 = _h2163;
                                      const _h2165 = !(_h2164);
                                      const _a2160 = sp.adj4[v_t];
                                      for (let _i2161 = 0; _i2161 < _a2160.length; _i2161++) {
                                        const v_x = _a2160[_i2161];
                                        const _h2166 = clueAt(cl.number, v_x);
                                        let _c2168: boolean = (_h2165 && (_h2166 !== -1));
                                        if (_c2168) {
                                          const _t2167 = sp.adj4Edges[v_t][_i2161];
                                          _c2168 = ((_t2167 === _wc1754 ? _wd1755 : (_t2167 === _wc1752 ? _wd1753 : (b.grid[_t2167] || -1))) === 1);
                                        }
                                        if (!(_c2168)) continue;
                                        if (!_g2140.includes(v_x)) _g2140.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2169 = union(_g2135, _g2140);
                                  for (let _i2170 = 0; _i2170 < _a2169.length; _i2170++) {
                                    const v_p = _a2169[_i2170];
                                    const _h2207 = clueAt(cl.number, v_p);
                                    _g2171.length = 0;
                                    G2172: {
                                      for (let _i2174 = 0; _i2174 < 1; _i2174++) {
                                        const v_x = v_y;
                                        const _h2175 = clueAt(cl.number, v_x);
                                        if (!((_h2175 !== -1))) continue;
                                        _g2171.push(v_x);
                                      }
                                    }
                                    _g2176.length = 0;
                                    G2177: {
                                      const _a2194 = throughWhere(sp, v_y, (_te2189: number): boolean => { let _c2191: boolean = ((_te2189 === _wc1754 ? _wd1755 : (_te2189 === _wc1752 ? _wd1753 : (b.grid[_te2189] || -1))) === 1); if (_c2191) {   const _t2190 = sp.edgeEnds[2 * _te2189];   _c2191 = !((clueAt(cl.number, _t2190) !== -1)); } let _c2193: boolean = _c2191; if (_c2193) {   const _t2192 = sp.edgeEnds[2 * _te2189 + 1];   _c2193 = !((clueAt(cl.number, _t2192) !== -1)); } return _c2193; });
                                      for (let _i2195 = 0; _i2195 < _a2194.length; _i2195++) {
                                        const v_t = _a2194[_i2195];
                                        const _h2198 = clueAt(cl.number, v_t);
                                        const _h2199 = (_h2198 !== -1);
                                        const _h2200 = _h2199;
                                        const _h2201 = !(_h2200);
                                        const _a2196 = sp.adj4[v_t];
                                        for (let _i2197 = 0; _i2197 < _a2196.length; _i2197++) {
                                          const v_x = _a2196[_i2197];
                                          const _h2202 = clueAt(cl.number, v_x);
                                          let _c2204: boolean = (_h2201 && (_h2202 !== -1));
                                          if (_c2204) {
                                            const _t2203 = sp.adj4Edges[v_t][_i2197];
                                            _c2204 = ((_t2203 === _wc1754 ? _wd1755 : (_t2203 === _wc1752 ? _wd1753 : (b.grid[_t2203] || -1))) === 1);
                                          }
                                          if (!(_c2204)) continue;
                                          if (!_g2176.includes(v_x)) _g2176.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2205 = union(_g2171, _g2176);
                                    for (let _i2206 = 0; _i2206 < _a2205.length; _i2206++) {
                                      const v_q = _a2205[_i2206];
                                      const _h2208 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2207 - _h2208)) === cl.step))) {
                                        _q2133 = false;
                                        break Q2134;
                                      }
                                    }
                                  }
                                }
                                _c2209 = _q2133;
                              }
                              if (!((_c2209 && (_h1770 || !(throughWhere(sp, v_s, (_te2210: number): boolean => {  return ((_te2210 === _wc1754 ? _wd1755 : (_te2210 === _wc1752 ? _wd1753 : (b.grid[_te2210] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g2211 = 0;
                              G2212: {
                                const _a2213 = sp.adj4[v_s];
                                for (let _i2214 = 0; _i2214 < _a2213.length; _i2214++) {
                                  const _t2215 = sp.adj4Edges[v_s][_i2214];
                                  if (!(((_t2215 === _wc1754 ? _wd1755 : (_t2215 === _wc1752 ? _wd1753 : (b.grid[_t2215] || -1))) === 1))) continue;
                                  _g2211++;
                                }
                              }
                              let _g2216 = 0;
                              G2217: {
                                for (let _i2218 = 0; _i2218 < 1; _i2218++) {
                                  const v_k = v_s;
                                  const _h2219 = clueAt(cl.number, v_k);
                                  const _h2226 = (_h2219 + 1);
                                  let _c2228: boolean = (_h2219 !== -1);
                                  if (_c2228) {
                                    let _c2227: boolean = (_h1770 || (_h2219 === 1));
                                    if (!_c2227) {
                                      let _g2220 = 0;
                                      G2221: {
                                        const _t2222 = (_h2219 + 1);
                                        const _a2223 = cluesValued(cl.number, _t2222);
                                        for (let _i2224 = 0; _i2224 < _a2223.length; _i2224++) {
                                          const v_x = _a2223[_i2224];
                                          const _h2225 = clueAt(cl.number, v_x);
                                          if (!((_h2225 === _h2226))) continue;
                                          _g2220++;
                                        }
                                      }
                                      _c2227 = (_g2220 === 0);
                                    }
                                    _c2228 = _c2227;
                                  }
                                  if (!(_c2228)) continue;
                                  _g2216++;
                                }
                              }
                              let _c2351: boolean = ((_g2211 + 1) === (2 - _g2216));
                              if (!_c2351) {
                                let _q2229 = false;
                                Q2230: {
                                  const _a2231 = sp.adj4[v_s];
                                  const _n2232 = _i2092;
                                  for (let _i2233 = 0; _i2233 < _n2232; _i2233++) {
                                    const v_z = _a2231[_i2233];
                                    const _t2234 = sp.adj4Edges[v_s][_i2233];
                                    let _c2253: boolean = !((_t2234 === _wc1754 ? true : (_t2234 === _wc1752 ? true : (b.grid[_t2234] !== 0))));
                                    if (_c2253) {
                                      let _g2235 = 0;
                                      G2236: {
                                        const _a2237 = sp.adj4[v_s];
                                        for (let _i2238 = 0; _i2238 < _a2237.length; _i2238++) {
                                          const _t2239 = sp.adj4Edges[v_s][_i2238];
                                          if (!(((_t2239 === _wc1754 ? _wd1755 : (_t2239 === _wc1752 ? _wd1753 : (b.grid[_t2239] || -1))) === 1))) continue;
                                          _g2235++;
                                        }
                                      }
                                      let _g2240 = 0;
                                      G2241: {
                                        for (let _i2242 = 0; _i2242 < 1; _i2242++) {
                                          const v_k = v_s;
                                          const _h2243 = clueAt(cl.number, v_k);
                                          const _h2250 = (_h2243 + 1);
                                          let _c2252: boolean = (_h2243 !== -1);
                                          if (_c2252) {
                                            let _c2251: boolean = (_h1770 || (_h2243 === 1));
                                            if (!_c2251) {
                                              let _g2244 = 0;
                                              G2245: {
                                                const _t2246 = (_h2243 + 1);
                                                const _a2247 = cluesValued(cl.number, _t2246);
                                                for (let _i2248 = 0; _i2248 < _a2247.length; _i2248++) {
                                                  const v_x = _a2247[_i2248];
                                                  const _h2249 = clueAt(cl.number, v_x);
                                                  if (!((_h2249 === _h2250))) continue;
                                                  _g2244++;
                                                }
                                              }
                                              _c2251 = (_g2244 === 0);
                                            }
                                            _c2252 = _c2251;
                                          }
                                          if (!(_c2252)) continue;
                                          _g2240++;
                                        }
                                      }
                                      _c2253 = (_g2235 < (2 - _g2240));
                                    }
                                    let _c2272: boolean = _c2253;
                                    if (_c2272) {
                                      let _g2254 = 0;
                                      G2255: {
                                        const _a2256 = sp.adj4[v_z];
                                        for (let _i2257 = 0; _i2257 < _a2256.length; _i2257++) {
                                          const _t2258 = sp.adj4Edges[v_z][_i2257];
                                          if (!(((_t2258 === _wc1754 ? _wd1755 : (_t2258 === _wc1752 ? _wd1753 : (b.grid[_t2258] || -1))) === 1))) continue;
                                          _g2254++;
                                        }
                                      }
                                      let _g2259 = 0;
                                      G2260: {
                                        for (let _i2261 = 0; _i2261 < 1; _i2261++) {
                                          const v_k = v_z;
                                          const _h2262 = clueAt(cl.number, v_k);
                                          const _h2269 = (_h2262 + 1);
                                          let _c2271: boolean = (_h2262 !== -1);
                                          if (_c2271) {
                                            let _c2270: boolean = (_h1770 || (_h2262 === 1));
                                            if (!_c2270) {
                                              let _g2263 = 0;
                                              G2264: {
                                                const _t2265 = (_h2262 + 1);
                                                const _a2266 = cluesValued(cl.number, _t2265);
                                                for (let _i2267 = 0; _i2267 < _a2266.length; _i2267++) {
                                                  const v_x = _a2266[_i2267];
                                                  const _h2268 = clueAt(cl.number, v_x);
                                                  if (!((_h2268 === _h2269))) continue;
                                                  _g2263++;
                                                }
                                              }
                                              _c2270 = (_g2263 === 0);
                                            }
                                            _c2271 = _c2270;
                                          }
                                          if (!(_c2271)) continue;
                                          _g2259++;
                                        }
                                      }
                                      _c2272 = (_g2254 < (2 - _g2259));
                                    }
                                    let _c2349: boolean = _c2272;
                                    if (_c2349) {
                                      let _q2273 = true;
                                      Q2274: {
                                        _g2275.length = 0;
                                        G2276: {
                                          for (let _i2278 = 0; _i2278 < 1; _i2278++) {
                                            const v_x = v_s;
                                            const _h2279 = clueAt(cl.number, v_x);
                                            if (!((_h2279 !== -1))) continue;
                                            _g2275.push(v_x);
                                          }
                                        }
                                        _g2280.length = 0;
                                        G2281: {
                                          const _a2298 = throughWhere(sp, v_s, (_te2293: number): boolean => { let _c2295: boolean = ((_te2293 === _wc1754 ? _wd1755 : (_te2293 === _wc1752 ? _wd1753 : (b.grid[_te2293] || -1))) === 1); if (_c2295) {   const _t2294 = sp.edgeEnds[2 * _te2293];   _c2295 = !((clueAt(cl.number, _t2294) !== -1)); } let _c2297: boolean = _c2295; if (_c2297) {   const _t2296 = sp.edgeEnds[2 * _te2293 + 1];   _c2297 = !((clueAt(cl.number, _t2296) !== -1)); } return _c2297; });
                                          for (let _i2299 = 0; _i2299 < _a2298.length; _i2299++) {
                                            const v_t = _a2298[_i2299];
                                            const _h2302 = clueAt(cl.number, v_t);
                                            const _h2303 = (_h2302 !== -1);
                                            const _h2304 = _h2303;
                                            const _h2305 = !(_h2304);
                                            const _a2300 = sp.adj4[v_t];
                                            for (let _i2301 = 0; _i2301 < _a2300.length; _i2301++) {
                                              const v_x = _a2300[_i2301];
                                              const _h2306 = clueAt(cl.number, v_x);
                                              let _c2308: boolean = (_h2305 && (_h2306 !== -1));
                                              if (_c2308) {
                                                const _t2307 = sp.adj4Edges[v_t][_i2301];
                                                _c2308 = ((_t2307 === _wc1754 ? _wd1755 : (_t2307 === _wc1752 ? _wd1753 : (b.grid[_t2307] || -1))) === 1);
                                              }
                                              if (!(_c2308)) continue;
                                              if (!_g2280.includes(v_x)) _g2280.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2309 = union(_g2275, _g2280);
                                        for (let _i2310 = 0; _i2310 < _a2309.length; _i2310++) {
                                          const v_p = _a2309[_i2310];
                                          const _h2347 = clueAt(cl.number, v_p);
                                          _g2311.length = 0;
                                          G2312: {
                                            for (let _i2314 = 0; _i2314 < 1; _i2314++) {
                                              const v_x = v_z;
                                              const _h2315 = clueAt(cl.number, v_x);
                                              if (!((_h2315 !== -1))) continue;
                                              _g2311.push(v_x);
                                            }
                                          }
                                          _g2316.length = 0;
                                          G2317: {
                                            const _a2334 = throughWhere(sp, v_z, (_te2329: number): boolean => { let _c2331: boolean = ((_te2329 === _wc1754 ? _wd1755 : (_te2329 === _wc1752 ? _wd1753 : (b.grid[_te2329] || -1))) === 1); if (_c2331) {   const _t2330 = sp.edgeEnds[2 * _te2329];   _c2331 = !((clueAt(cl.number, _t2330) !== -1)); } let _c2333: boolean = _c2331; if (_c2333) {   const _t2332 = sp.edgeEnds[2 * _te2329 + 1];   _c2333 = !((clueAt(cl.number, _t2332) !== -1)); } return _c2333; });
                                            for (let _i2335 = 0; _i2335 < _a2334.length; _i2335++) {
                                              const v_t = _a2334[_i2335];
                                              const _h2338 = clueAt(cl.number, v_t);
                                              const _h2339 = (_h2338 !== -1);
                                              const _h2340 = _h2339;
                                              const _h2341 = !(_h2340);
                                              const _a2336 = sp.adj4[v_t];
                                              for (let _i2337 = 0; _i2337 < _a2336.length; _i2337++) {
                                                const v_x = _a2336[_i2337];
                                                const _h2342 = clueAt(cl.number, v_x);
                                                let _c2344: boolean = (_h2341 && (_h2342 !== -1));
                                                if (_c2344) {
                                                  const _t2343 = sp.adj4Edges[v_t][_i2337];
                                                  _c2344 = ((_t2343 === _wc1754 ? _wd1755 : (_t2343 === _wc1752 ? _wd1753 : (b.grid[_t2343] || -1))) === 1);
                                                }
                                                if (!(_c2344)) continue;
                                                if (!_g2316.includes(v_x)) _g2316.push(v_x);
                                              }
                                            }
                                          }
                                          const _a2345 = union(_g2311, _g2316);
                                          for (let _i2346 = 0; _i2346 < _a2345.length; _i2346++) {
                                            const v_q = _a2345[_i2346];
                                            const _h2348 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h2347 - _h2348)) === cl.step))) {
                                              _q2273 = false;
                                              break Q2274;
                                            }
                                          }
                                        }
                                      }
                                      _c2349 = _q2273;
                                    }
                                    if ((_c2349 && (_h1770 || !(throughWhere(sp, v_s, (_te2350: number): boolean => {  return ((_te2350 === _wc1754 ? _wd1755 : (_te2350 === _wc1752 ? _wd1753 : (b.grid[_te2350] || -1))) === 1); }).includes(v_z))))) {
                                      _q2229 = true;
                                      break Q2230;
                                    }
                                  }
                                }
                                _c2351 = _q2229;
                              }
                              if (_c2351) {
                                _q2089 = true;
                                break Q2090;
                              }
                            }
                          }
                          _c2352 = !(_q2089);
                        }
                        if (_c2352) {
                          _q2067 = true;
                          break Q2068;
                        }
                      }
                    }
                    _c2353 = _q2067;
                  }
                  if (_c2353) {
                    _q1756 = true;
                    break Q1757;
                  }
                }
              }
              _c2354 = _q1756;
            }
            _c2355 = _c2354;
          }
          if (!(_c2355)) break L1746;
          facts.length = 0;
          changed = false;
          const _t2356 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t2356] !== 0)) { if (fire === null) { b.placeAt(_t2356, 1); changed = true; } else facts.push(PLACE, _t2356, 1); }
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

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g4470: number[] = [];
  const _g5089: number[] = [];
  const _g5094: number[] = [];
  const _g5127: number[] = [];
  const _g5132: number[] = [];
  const _g5231: number[] = [];
  const _g5236: number[] = [];
  const _g5269: number[] = [];
  const _g5274: number[] = [];
  const _g5379: number[] = [];
  const _g5384: number[] = [];
  const _g5415: number[] = [];
  const _g5420: number[] = [];
  const _g5519: number[] = [];
  const _g5524: number[] = [];
  const _g5555: number[] = [];
  const _g5560: number[] = [];
  const _g5600: number[] = [];
  const _g6215: number[] = [];
  const _g6220: number[] = [];
  const _g6253: number[] = [];
  const _g6258: number[] = [];
  const _g6357: number[] = [];
  const _g6362: number[] = [];
  const _g6395: number[] = [];
  const _g6400: number[] = [];
  const _g6505: number[] = [];
  const _g6510: number[] = [];
  const _g6541: number[] = [];
  const _g6546: number[] = [];
  const _g6645: number[] = [];
  const _g6650: number[] = [];
  const _g6681: number[] = [];
  const _g6686: number[] = [];
  const _g6729: number[] = [];
  const _g6751: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _h5014 = (cl.step === 0);
  if (weighedCands.length < sp.edges.length) weighedCands = new Int32Array(sp.edges.length);
  const cands = weighedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a4462 = sp.cells;
  for (let _i4463 = 0; _i4463 < _a4462.length; _i4463++) {
    const v_c = _a4462[_i4463];
    let _g4464 = 0;
    G4465: {
      const _a4466 = sp.adj4[v_c];
      for (let _i4467 = 0; _i4467 < _a4466.length; _i4467++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i4467]] || -1) === 1))) continue;
        _g4464++;
      }
    }
    if (!(((takes(sp, cl, v_c) - _g4464) === 2))) continue;
    const _h4991 = clueAt(cl.number, v_c);
    const _h4992 = (_h4991 !== -1);
    const _h4993 = _h4992;
    const _h4994 = !(_h4993);
    L4468: {
      const v_U = ways(b, sp, cl, v_c);
      const _h4469 = v_U.length;
      if (!((_h4469 === 4))) break L4468;
      const _h6726 = (v_U[0] ?? -1);
      _g4470.length = 0;
      G4471: {
        const _a4985 = v_U;
        for (let _i4986 = 0; _i4986 < _a4985.length; _i4986++) {
          const v_i = _a4985[_i4986];
          const _h4989 = _i4986;
          const _h4990 = (_h4989 === 0);
          const _h4995 = sp.edgeOf(v_c, v_i);
          const _a4987 = v_U;
          for (let _i4988 = 0; _i4988 < _a4987.length; _i4988++) {
            const v_j = _a4987[_i4988];
            let _c5599: boolean = (_h4990 && (_i4988 > 0));
            if (_c5599) {
              let _c5598: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h4994 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c5598) {
                const _wc4996 = _h4995;
                const _wd4997 = 1;
                const _wc4998 = sp.edgeOf(v_c, v_j);
                const _wd4999 = 1;
                let _q5000 = false;
                Q5001: {
                  const _a5003 = throughWhere(sp, v_c, (_te5002: number): boolean => {  return ((_te5002 === _wc4998 ? _wd4999 : (_te5002 === _wc4996 ? _wd4997 : (b.grid[_te5002] || -1))) === 1); });
                  for (let _i5004 = 0; _i5004 < _a5003.length; _i5004++) {
                    const v_t = _a5003[_i5004];
                    let _c5024: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5024) {
                      let _g5005 = 0;
                      G5006: {
                        const _a5007 = sp.adj4[v_t];
                        for (let _i5008 = 0; _i5008 < _a5007.length; _i5008++) {
                          const _t5009 = sp.adj4Edges[v_t][_i5008];
                          if (!(((_t5009 === _wc4998 ? _wd4999 : (_t5009 === _wc4996 ? _wd4997 : (b.grid[_t5009] || -1))) === 1))) continue;
                          _g5005++;
                        }
                      }
                      let _g5010 = 0;
                      G5011: {
                        for (let _i5012 = 0; _i5012 < 1; _i5012++) {
                          const v_k = v_t;
                          const _h5013 = clueAt(cl.number, v_k);
                          const _h5021 = (_h5013 + 1);
                          let _c5023: boolean = (_h5013 !== -1);
                          if (_c5023) {
                            let _c5022: boolean = (_h5014 || (_h5013 === 1));
                            if (!_c5022) {
                              let _g5015 = 0;
                              G5016: {
                                const _t5017 = (_h5013 + 1);
                                const _a5018 = cluesValued(cl.number, _t5017);
                                for (let _i5019 = 0; _i5019 < _a5018.length; _i5019++) {
                                  const v_x = _a5018[_i5019];
                                  const _h5020 = clueAt(cl.number, v_x);
                                  if (!((_h5020 === _h5021))) continue;
                                  _g5015++;
                                }
                              }
                              _c5022 = (_g5015 === 0);
                            }
                            _c5023 = _c5022;
                          }
                          if (!(_c5023)) continue;
                          _g5010++;
                        }
                      }
                      _c5024 = (_g5005 < (2 - _g5010));
                    }
                    if (!(_c5024)) continue;
                    let _g5025 = 0;
                    G5026: {
                      const _a5027 = sp.adj4[v_t];
                      for (let _i5028 = 0; _i5028 < _a5027.length; _i5028++) {
                        const _t5029 = sp.adj4Edges[v_t][_i5028];
                        if (!(((_t5029 === _wc4998 ? _wd4999 : (_t5029 === _wc4996 ? _wd4997 : (b.grid[_t5029] || -1))) === 1))) continue;
                        _g5025++;
                      }
                    }
                    let _g5030 = 0;
                    G5031: {
                      for (let _i5032 = 0; _i5032 < 1; _i5032++) {
                        const v_k = v_t;
                        const _h5033 = clueAt(cl.number, v_k);
                        const _h5040 = (_h5033 + 1);
                        let _c5042: boolean = (_h5033 !== -1);
                        if (_c5042) {
                          let _c5041: boolean = (_h5014 || (_h5033 === 1));
                          if (!_c5041) {
                            let _g5034 = 0;
                            G5035: {
                              const _t5036 = (_h5033 + 1);
                              const _a5037 = cluesValued(cl.number, _t5036);
                              for (let _i5038 = 0; _i5038 < _a5037.length; _i5038++) {
                                const v_x = _a5037[_i5038];
                                const _h5039 = clueAt(cl.number, v_x);
                                if (!((_h5039 === _h5040))) continue;
                                _g5034++;
                              }
                            }
                            _c5041 = (_g5034 === 0);
                          }
                          _c5042 = _c5041;
                        }
                        if (!(_c5042)) continue;
                        _g5030++;
                      }
                    }
                    let _c5310: boolean = (_g5025 < (2 - _g5030));
                    if (_c5310) {
                      let _q5043 = false;
                      Q5044: {
                        const _a5045 = sp.adj4[v_t];
                        for (let _i5046 = 0; _i5046 < _a5045.length; _i5046++) {
                          const v_y = _a5045[_i5046];
                          const _t5047 = sp.adj4Edges[v_t][_i5046];
                          let _c5066: boolean = !((_t5047 === _wc4998 ? true : (_t5047 === _wc4996 ? true : (b.grid[_t5047] !== 0))));
                          if (_c5066) {
                            let _g5048 = 0;
                            G5049: {
                              const _a5050 = sp.adj4[v_t];
                              for (let _i5051 = 0; _i5051 < _a5050.length; _i5051++) {
                                const _t5052 = sp.adj4Edges[v_t][_i5051];
                                if (!(((_t5052 === _wc4998 ? _wd4999 : (_t5052 === _wc4996 ? _wd4997 : (b.grid[_t5052] || -1))) === 1))) continue;
                                _g5048++;
                              }
                            }
                            let _g5053 = 0;
                            G5054: {
                              for (let _i5055 = 0; _i5055 < 1; _i5055++) {
                                const v_k = v_t;
                                const _h5056 = clueAt(cl.number, v_k);
                                const _h5063 = (_h5056 + 1);
                                let _c5065: boolean = (_h5056 !== -1);
                                if (_c5065) {
                                  let _c5064: boolean = (_h5014 || (_h5056 === 1));
                                  if (!_c5064) {
                                    let _g5057 = 0;
                                    G5058: {
                                      const _t5059 = (_h5056 + 1);
                                      const _a5060 = cluesValued(cl.number, _t5059);
                                      for (let _i5061 = 0; _i5061 < _a5060.length; _i5061++) {
                                        const v_x = _a5060[_i5061];
                                        const _h5062 = clueAt(cl.number, v_x);
                                        if (!((_h5062 === _h5063))) continue;
                                        _g5057++;
                                      }
                                    }
                                    _c5064 = (_g5057 === 0);
                                  }
                                  _c5065 = _c5064;
                                }
                                if (!(_c5065)) continue;
                                _g5053++;
                              }
                            }
                            _c5066 = (_g5048 < (2 - _g5053));
                          }
                          let _c5086: boolean = _c5066;
                          if (_c5086) {
                            let _g5067 = 0;
                            G5068: {
                              const _a5070 = sp.adj4[v_y];
                              for (let _i5071 = 0; _i5071 < _a5070.length; _i5071++) {
                                const _t5072 = sp.adj4Edges[v_y][_i5071];
                                if (!(((_t5072 === _wc4998 ? _wd4999 : (_t5072 === _wc4996 ? _wd4997 : (b.grid[_t5072] || -1))) === 1))) continue;
                                _g5067++;
                              }
                            }
                            let _g5073 = 0;
                            G5074: {
                              for (let _i5075 = 0; _i5075 < 1; _i5075++) {
                                const v_k = v_y;
                                const _h5076 = clueAt(cl.number, v_k);
                                const _h5083 = (_h5076 + 1);
                                let _c5085: boolean = (_h5076 !== -1);
                                if (_c5085) {
                                  let _c5084: boolean = (_h5014 || (_h5076 === 1));
                                  if (!_c5084) {
                                    let _g5077 = 0;
                                    G5078: {
                                      const _t5079 = (_h5076 + 1);
                                      const _a5080 = cluesValued(cl.number, _t5079);
                                      for (let _i5081 = 0; _i5081 < _a5080.length; _i5081++) {
                                        const v_x = _a5080[_i5081];
                                        const _h5082 = clueAt(cl.number, v_x);
                                        if (!((_h5082 === _h5083))) continue;
                                        _g5077++;
                                      }
                                    }
                                    _c5084 = (_g5077 === 0);
                                  }
                                  _c5085 = _c5084;
                                }
                                if (!(_c5085)) continue;
                                _g5073++;
                              }
                            }
                            _c5086 = (_g5067 < (2 - _g5073));
                          }
                          let _c5165: boolean = _c5086;
                          if (_c5165) {
                            let _q5087 = true;
                            Q5088: {
                              _g5089.length = 0;
                              G5090: {
                                for (let _i5092 = 0; _i5092 < 1; _i5092++) {
                                  const v_x = v_t;
                                  const _h5093 = clueAt(cl.number, v_x);
                                  if (!((_h5093 !== -1))) continue;
                                  _g5089.push(v_x);
                                }
                              }
                              _g5094.length = 0;
                              G5095: {
                                const _a5114 = throughWhere(sp, v_t, (_te5109: number): boolean => { let _c5111: boolean = ((_te5109 === _wc4998 ? _wd4999 : (_te5109 === _wc4996 ? _wd4997 : (b.grid[_te5109] || -1))) === 1); if (_c5111) {   const _t5110 = sp.edgeEnds[2 * _te5109];   _c5111 = !((clueAt(cl.number, _t5110) !== -1)); } let _c5113: boolean = _c5111; if (_c5113) {   const _t5112 = sp.edgeEnds[2 * _te5109 + 1];   _c5113 = !((clueAt(cl.number, _t5112) !== -1)); } return _c5113; });
                                for (let _i5115 = 0; _i5115 < _a5114.length; _i5115++) {
                                  const v_t_5108 = _a5114[_i5115];
                                  const _h5118 = clueAt(cl.number, v_t_5108);
                                  const _h5119 = (_h5118 !== -1);
                                  const _h5120 = _h5119;
                                  const _h5121 = !(_h5120);
                                  const _a5116 = sp.adj4[v_t_5108];
                                  for (let _i5117 = 0; _i5117 < _a5116.length; _i5117++) {
                                    const v_x = _a5116[_i5117];
                                    const _h5122 = clueAt(cl.number, v_x);
                                    let _c5124: boolean = (_h5121 && (_h5122 !== -1));
                                    if (_c5124) {
                                      const _t5123 = sp.adj4Edges[v_t_5108][_i5117];
                                      _c5124 = ((_t5123 === _wc4998 ? _wd4999 : (_t5123 === _wc4996 ? _wd4997 : (b.grid[_t5123] || -1))) === 1);
                                    }
                                    if (!(_c5124)) continue;
                                    if (!_g5094.includes(v_x)) _g5094.push(v_x);
                                  }
                                }
                              }
                              const _a5125 = union(_g5089, _g5094);
                              for (let _i5126 = 0; _i5126 < _a5125.length; _i5126++) {
                                const v_p = _a5125[_i5126];
                                const _h5163 = clueAt(cl.number, v_p);
                                _g5127.length = 0;
                                G5128: {
                                  for (let _i5130 = 0; _i5130 < 1; _i5130++) {
                                    const v_x = v_y;
                                    const _h5131 = clueAt(cl.number, v_x);
                                    if (!((_h5131 !== -1))) continue;
                                    _g5127.push(v_x);
                                  }
                                }
                                _g5132.length = 0;
                                G5133: {
                                  const _a5150 = throughWhere(sp, v_y, (_te5145: number): boolean => { let _c5147: boolean = ((_te5145 === _wc4998 ? _wd4999 : (_te5145 === _wc4996 ? _wd4997 : (b.grid[_te5145] || -1))) === 1); if (_c5147) {   const _t5146 = sp.edgeEnds[2 * _te5145];   _c5147 = !((clueAt(cl.number, _t5146) !== -1)); } let _c5149: boolean = _c5147; if (_c5149) {   const _t5148 = sp.edgeEnds[2 * _te5145 + 1];   _c5149 = !((clueAt(cl.number, _t5148) !== -1)); } return _c5149; });
                                  for (let _i5151 = 0; _i5151 < _a5150.length; _i5151++) {
                                    const v_t = _a5150[_i5151];
                                    const _h5154 = clueAt(cl.number, v_t);
                                    const _h5155 = (_h5154 !== -1);
                                    const _h5156 = _h5155;
                                    const _h5157 = !(_h5156);
                                    const _a5152 = sp.adj4[v_t];
                                    for (let _i5153 = 0; _i5153 < _a5152.length; _i5153++) {
                                      const v_x = _a5152[_i5153];
                                      const _h5158 = clueAt(cl.number, v_x);
                                      let _c5160: boolean = (_h5157 && (_h5158 !== -1));
                                      if (_c5160) {
                                        const _t5159 = sp.adj4Edges[v_t][_i5153];
                                        _c5160 = ((_t5159 === _wc4998 ? _wd4999 : (_t5159 === _wc4996 ? _wd4997 : (b.grid[_t5159] || -1))) === 1);
                                      }
                                      if (!(_c5160)) continue;
                                      if (!_g5132.includes(v_x)) _g5132.push(v_x);
                                    }
                                  }
                                }
                                const _a5161 = union(_g5127, _g5132);
                                for (let _i5162 = 0; _i5162 < _a5161.length; _i5162++) {
                                  const v_q = _a5161[_i5162];
                                  const _h5164 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h5163 - _h5164)) === cl.step))) {
                                    _q5087 = false;
                                    break Q5088;
                                  }
                                }
                              }
                            }
                            _c5165 = _q5087;
                          }
                          if (!((_c5165 && (_h5014 || !(throughWhere(sp, v_t, (_te5166: number): boolean => {  return ((_te5166 === _wc4998 ? _wd4999 : (_te5166 === _wc4996 ? _wd4997 : (b.grid[_te5166] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g5167 = 0;
                          G5168: {
                            const _a5169 = sp.adj4[v_t];
                            for (let _i5170 = 0; _i5170 < _a5169.length; _i5170++) {
                              const _t5171 = sp.adj4Edges[v_t][_i5170];
                              if (!(((_t5171 === _wc4998 ? _wd4999 : (_t5171 === _wc4996 ? _wd4997 : (b.grid[_t5171] || -1))) === 1))) continue;
                              _g5167++;
                            }
                          }
                          let _g5172 = 0;
                          G5173: {
                            for (let _i5174 = 0; _i5174 < 1; _i5174++) {
                              const v_k = v_t;
                              const _h5175 = clueAt(cl.number, v_k);
                              const _h5182 = (_h5175 + 1);
                              let _c5184: boolean = (_h5175 !== -1);
                              if (_c5184) {
                                let _c5183: boolean = (_h5014 || (_h5175 === 1));
                                if (!_c5183) {
                                  let _g5176 = 0;
                                  G5177: {
                                    const _t5178 = (_h5175 + 1);
                                    const _a5179 = cluesValued(cl.number, _t5178);
                                    for (let _i5180 = 0; _i5180 < _a5179.length; _i5180++) {
                                      const v_x = _a5179[_i5180];
                                      const _h5181 = clueAt(cl.number, v_x);
                                      if (!((_h5181 === _h5182))) continue;
                                      _g5176++;
                                    }
                                  }
                                  _c5183 = (_g5176 === 0);
                                }
                                _c5184 = _c5183;
                              }
                              if (!(_c5184)) continue;
                              _g5172++;
                            }
                          }
                          let _c5309: boolean = ((_g5167 + 1) === (2 - _g5172));
                          if (!_c5309) {
                            let _q5185 = false;
                            Q5186: {
                              const _a5187 = sp.adj4[v_t];
                              const _n5188 = _i5046;
                              for (let _i5189 = 0; _i5189 < _n5188; _i5189++) {
                                const v_z = _a5187[_i5189];
                                const _t5190 = sp.adj4Edges[v_t][_i5189];
                                let _c5209: boolean = !((_t5190 === _wc4998 ? true : (_t5190 === _wc4996 ? true : (b.grid[_t5190] !== 0))));
                                if (_c5209) {
                                  let _g5191 = 0;
                                  G5192: {
                                    const _a5193 = sp.adj4[v_t];
                                    for (let _i5194 = 0; _i5194 < _a5193.length; _i5194++) {
                                      const _t5195 = sp.adj4Edges[v_t][_i5194];
                                      if (!(((_t5195 === _wc4998 ? _wd4999 : (_t5195 === _wc4996 ? _wd4997 : (b.grid[_t5195] || -1))) === 1))) continue;
                                      _g5191++;
                                    }
                                  }
                                  let _g5196 = 0;
                                  G5197: {
                                    for (let _i5198 = 0; _i5198 < 1; _i5198++) {
                                      const v_k = v_t;
                                      const _h5199 = clueAt(cl.number, v_k);
                                      const _h5206 = (_h5199 + 1);
                                      let _c5208: boolean = (_h5199 !== -1);
                                      if (_c5208) {
                                        let _c5207: boolean = (_h5014 || (_h5199 === 1));
                                        if (!_c5207) {
                                          let _g5200 = 0;
                                          G5201: {
                                            const _t5202 = (_h5199 + 1);
                                            const _a5203 = cluesValued(cl.number, _t5202);
                                            for (let _i5204 = 0; _i5204 < _a5203.length; _i5204++) {
                                              const v_x = _a5203[_i5204];
                                              const _h5205 = clueAt(cl.number, v_x);
                                              if (!((_h5205 === _h5206))) continue;
                                              _g5200++;
                                            }
                                          }
                                          _c5207 = (_g5200 === 0);
                                        }
                                        _c5208 = _c5207;
                                      }
                                      if (!(_c5208)) continue;
                                      _g5196++;
                                    }
                                  }
                                  _c5209 = (_g5191 < (2 - _g5196));
                                }
                                let _c5228: boolean = _c5209;
                                if (_c5228) {
                                  let _g5210 = 0;
                                  G5211: {
                                    const _a5212 = sp.adj4[v_z];
                                    for (let _i5213 = 0; _i5213 < _a5212.length; _i5213++) {
                                      const _t5214 = sp.adj4Edges[v_z][_i5213];
                                      if (!(((_t5214 === _wc4998 ? _wd4999 : (_t5214 === _wc4996 ? _wd4997 : (b.grid[_t5214] || -1))) === 1))) continue;
                                      _g5210++;
                                    }
                                  }
                                  let _g5215 = 0;
                                  G5216: {
                                    for (let _i5217 = 0; _i5217 < 1; _i5217++) {
                                      const v_k = v_z;
                                      const _h5218 = clueAt(cl.number, v_k);
                                      const _h5225 = (_h5218 + 1);
                                      let _c5227: boolean = (_h5218 !== -1);
                                      if (_c5227) {
                                        let _c5226: boolean = (_h5014 || (_h5218 === 1));
                                        if (!_c5226) {
                                          let _g5219 = 0;
                                          G5220: {
                                            const _t5221 = (_h5218 + 1);
                                            const _a5222 = cluesValued(cl.number, _t5221);
                                            for (let _i5223 = 0; _i5223 < _a5222.length; _i5223++) {
                                              const v_x = _a5222[_i5223];
                                              const _h5224 = clueAt(cl.number, v_x);
                                              if (!((_h5224 === _h5225))) continue;
                                              _g5219++;
                                            }
                                          }
                                          _c5226 = (_g5219 === 0);
                                        }
                                        _c5227 = _c5226;
                                      }
                                      if (!(_c5227)) continue;
                                      _g5215++;
                                    }
                                  }
                                  _c5228 = (_g5210 < (2 - _g5215));
                                }
                                let _c5307: boolean = _c5228;
                                if (_c5307) {
                                  let _q5229 = true;
                                  Q5230: {
                                    _g5231.length = 0;
                                    G5232: {
                                      for (let _i5234 = 0; _i5234 < 1; _i5234++) {
                                        const v_x = v_t;
                                        const _h5235 = clueAt(cl.number, v_x);
                                        if (!((_h5235 !== -1))) continue;
                                        _g5231.push(v_x);
                                      }
                                    }
                                    _g5236.length = 0;
                                    G5237: {
                                      const _a5256 = throughWhere(sp, v_t, (_te5251: number): boolean => { let _c5253: boolean = ((_te5251 === _wc4998 ? _wd4999 : (_te5251 === _wc4996 ? _wd4997 : (b.grid[_te5251] || -1))) === 1); if (_c5253) {   const _t5252 = sp.edgeEnds[2 * _te5251];   _c5253 = !((clueAt(cl.number, _t5252) !== -1)); } let _c5255: boolean = _c5253; if (_c5255) {   const _t5254 = sp.edgeEnds[2 * _te5251 + 1];   _c5255 = !((clueAt(cl.number, _t5254) !== -1)); } return _c5255; });
                                      for (let _i5257 = 0; _i5257 < _a5256.length; _i5257++) {
                                        const v_t_5250 = _a5256[_i5257];
                                        const _h5260 = clueAt(cl.number, v_t_5250);
                                        const _h5261 = (_h5260 !== -1);
                                        const _h5262 = _h5261;
                                        const _h5263 = !(_h5262);
                                        const _a5258 = sp.adj4[v_t_5250];
                                        for (let _i5259 = 0; _i5259 < _a5258.length; _i5259++) {
                                          const v_x = _a5258[_i5259];
                                          const _h5264 = clueAt(cl.number, v_x);
                                          let _c5266: boolean = (_h5263 && (_h5264 !== -1));
                                          if (_c5266) {
                                            const _t5265 = sp.adj4Edges[v_t_5250][_i5259];
                                            _c5266 = ((_t5265 === _wc4998 ? _wd4999 : (_t5265 === _wc4996 ? _wd4997 : (b.grid[_t5265] || -1))) === 1);
                                          }
                                          if (!(_c5266)) continue;
                                          if (!_g5236.includes(v_x)) _g5236.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5267 = union(_g5231, _g5236);
                                    for (let _i5268 = 0; _i5268 < _a5267.length; _i5268++) {
                                      const v_p = _a5267[_i5268];
                                      const _h5305 = clueAt(cl.number, v_p);
                                      _g5269.length = 0;
                                      G5270: {
                                        for (let _i5272 = 0; _i5272 < 1; _i5272++) {
                                          const v_x = v_z;
                                          const _h5273 = clueAt(cl.number, v_x);
                                          if (!((_h5273 !== -1))) continue;
                                          _g5269.push(v_x);
                                        }
                                      }
                                      _g5274.length = 0;
                                      G5275: {
                                        const _a5292 = throughWhere(sp, v_z, (_te5287: number): boolean => { let _c5289: boolean = ((_te5287 === _wc4998 ? _wd4999 : (_te5287 === _wc4996 ? _wd4997 : (b.grid[_te5287] || -1))) === 1); if (_c5289) {   const _t5288 = sp.edgeEnds[2 * _te5287];   _c5289 = !((clueAt(cl.number, _t5288) !== -1)); } let _c5291: boolean = _c5289; if (_c5291) {   const _t5290 = sp.edgeEnds[2 * _te5287 + 1];   _c5291 = !((clueAt(cl.number, _t5290) !== -1)); } return _c5291; });
                                        for (let _i5293 = 0; _i5293 < _a5292.length; _i5293++) {
                                          const v_t = _a5292[_i5293];
                                          const _h5296 = clueAt(cl.number, v_t);
                                          const _h5297 = (_h5296 !== -1);
                                          const _h5298 = _h5297;
                                          const _h5299 = !(_h5298);
                                          const _a5294 = sp.adj4[v_t];
                                          for (let _i5295 = 0; _i5295 < _a5294.length; _i5295++) {
                                            const v_x = _a5294[_i5295];
                                            const _h5300 = clueAt(cl.number, v_x);
                                            let _c5302: boolean = (_h5299 && (_h5300 !== -1));
                                            if (_c5302) {
                                              const _t5301 = sp.adj4Edges[v_t][_i5295];
                                              _c5302 = ((_t5301 === _wc4998 ? _wd4999 : (_t5301 === _wc4996 ? _wd4997 : (b.grid[_t5301] || -1))) === 1);
                                            }
                                            if (!(_c5302)) continue;
                                            if (!_g5274.includes(v_x)) _g5274.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5303 = union(_g5269, _g5274);
                                      for (let _i5304 = 0; _i5304 < _a5303.length; _i5304++) {
                                        const v_q = _a5303[_i5304];
                                        const _h5306 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5305 - _h5306)) === cl.step))) {
                                          _q5229 = false;
                                          break Q5230;
                                        }
                                      }
                                    }
                                  }
                                  _c5307 = _q5229;
                                }
                                if ((_c5307 && (_h5014 || !(throughWhere(sp, v_t, (_te5308: number): boolean => {  return ((_te5308 === _wc4998 ? _wd4999 : (_te5308 === _wc4996 ? _wd4997 : (b.grid[_te5308] || -1))) === 1); }).includes(v_z))))) {
                                  _q5185 = true;
                                  break Q5186;
                                }
                              }
                            }
                            _c5309 = _q5185;
                          }
                          if (_c5309) {
                            _q5043 = true;
                            break Q5044;
                          }
                        }
                      }
                      _c5310 = !(_q5043);
                    }
                    let _c5597: boolean = _c5310;
                    if (!_c5597) {
                      let _q5311 = false;
                      Q5312: {
                        const _a5313 = sp.adj4[v_t];
                        for (let _i5314 = 0; _i5314 < _a5313.length; _i5314++) {
                          const v_s = _a5313[_i5314];
                          let _g5315 = 0;
                          G5316: {
                            const _a5317 = sp.adj4[v_s];
                            for (let _i5318 = 0; _i5318 < _a5317.length; _i5318++) {
                              const _t5319 = sp.adj4Edges[v_s][_i5318];
                              if (!(((_t5319 === _wc4998 ? _wd4999 : (_t5319 === _wc4996 ? _wd4997 : (b.grid[_t5319] || -1))) === 1))) continue;
                              _g5315++;
                            }
                          }
                          let _g5320 = 0;
                          G5321: {
                            for (let _i5322 = 0; _i5322 < 1; _i5322++) {
                              const v_k = v_s;
                              const _h5323 = clueAt(cl.number, v_k);
                              const _h5330 = (_h5323 + 1);
                              let _c5332: boolean = (_h5323 !== -1);
                              if (_c5332) {
                                let _c5331: boolean = (_h5014 || (_h5323 === 1));
                                if (!_c5331) {
                                  let _g5324 = 0;
                                  G5325: {
                                    const _t5326 = (_h5323 + 1);
                                    const _a5327 = cluesValued(cl.number, _t5326);
                                    for (let _i5328 = 0; _i5328 < _a5327.length; _i5328++) {
                                      const v_x = _a5327[_i5328];
                                      const _h5329 = clueAt(cl.number, v_x);
                                      if (!((_h5329 === _h5330))) continue;
                                      _g5324++;
                                    }
                                  }
                                  _c5331 = (_g5324 === 0);
                                }
                                _c5332 = _c5331;
                              }
                              if (!(_c5332)) continue;
                              _g5320++;
                            }
                          }
                          let _c5596: boolean = (_g5315 < (2 - _g5320));
                          if (_c5596) {
                            let _q5333 = false;
                            Q5334: {
                              const _a5335 = sp.adj4[v_s];
                              for (let _i5336 = 0; _i5336 < _a5335.length; _i5336++) {
                                const v_y = _a5335[_i5336];
                                const _t5337 = sp.adj4Edges[v_s][_i5336];
                                let _c5356: boolean = !((_t5337 === _wc4998 ? true : (_t5337 === _wc4996 ? true : (b.grid[_t5337] !== 0))));
                                if (_c5356) {
                                  let _g5338 = 0;
                                  G5339: {
                                    const _a5340 = sp.adj4[v_s];
                                    for (let _i5341 = 0; _i5341 < _a5340.length; _i5341++) {
                                      const _t5342 = sp.adj4Edges[v_s][_i5341];
                                      if (!(((_t5342 === _wc4998 ? _wd4999 : (_t5342 === _wc4996 ? _wd4997 : (b.grid[_t5342] || -1))) === 1))) continue;
                                      _g5338++;
                                    }
                                  }
                                  let _g5343 = 0;
                                  G5344: {
                                    for (let _i5345 = 0; _i5345 < 1; _i5345++) {
                                      const v_k = v_s;
                                      const _h5346 = clueAt(cl.number, v_k);
                                      const _h5353 = (_h5346 + 1);
                                      let _c5355: boolean = (_h5346 !== -1);
                                      if (_c5355) {
                                        let _c5354: boolean = (_h5014 || (_h5346 === 1));
                                        if (!_c5354) {
                                          let _g5347 = 0;
                                          G5348: {
                                            const _t5349 = (_h5346 + 1);
                                            const _a5350 = cluesValued(cl.number, _t5349);
                                            for (let _i5351 = 0; _i5351 < _a5350.length; _i5351++) {
                                              const v_x = _a5350[_i5351];
                                              const _h5352 = clueAt(cl.number, v_x);
                                              if (!((_h5352 === _h5353))) continue;
                                              _g5347++;
                                            }
                                          }
                                          _c5354 = (_g5347 === 0);
                                        }
                                        _c5355 = _c5354;
                                      }
                                      if (!(_c5355)) continue;
                                      _g5343++;
                                    }
                                  }
                                  _c5356 = (_g5338 < (2 - _g5343));
                                }
                                let _c5376: boolean = _c5356;
                                if (_c5376) {
                                  let _g5357 = 0;
                                  G5358: {
                                    const _a5360 = sp.adj4[v_y];
                                    for (let _i5361 = 0; _i5361 < _a5360.length; _i5361++) {
                                      const _t5362 = sp.adj4Edges[v_y][_i5361];
                                      if (!(((_t5362 === _wc4998 ? _wd4999 : (_t5362 === _wc4996 ? _wd4997 : (b.grid[_t5362] || -1))) === 1))) continue;
                                      _g5357++;
                                    }
                                  }
                                  let _g5363 = 0;
                                  G5364: {
                                    for (let _i5365 = 0; _i5365 < 1; _i5365++) {
                                      const v_k = v_y;
                                      const _h5366 = clueAt(cl.number, v_k);
                                      const _h5373 = (_h5366 + 1);
                                      let _c5375: boolean = (_h5366 !== -1);
                                      if (_c5375) {
                                        let _c5374: boolean = (_h5014 || (_h5366 === 1));
                                        if (!_c5374) {
                                          let _g5367 = 0;
                                          G5368: {
                                            const _t5369 = (_h5366 + 1);
                                            const _a5370 = cluesValued(cl.number, _t5369);
                                            for (let _i5371 = 0; _i5371 < _a5370.length; _i5371++) {
                                              const v_x = _a5370[_i5371];
                                              const _h5372 = clueAt(cl.number, v_x);
                                              if (!((_h5372 === _h5373))) continue;
                                              _g5367++;
                                            }
                                          }
                                          _c5374 = (_g5367 === 0);
                                        }
                                        _c5375 = _c5374;
                                      }
                                      if (!(_c5375)) continue;
                                      _g5363++;
                                    }
                                  }
                                  _c5376 = (_g5357 < (2 - _g5363));
                                }
                                let _c5453: boolean = _c5376;
                                if (_c5453) {
                                  let _q5377 = true;
                                  Q5378: {
                                    _g5379.length = 0;
                                    G5380: {
                                      for (let _i5382 = 0; _i5382 < 1; _i5382++) {
                                        const v_x = v_s;
                                        const _h5383 = clueAt(cl.number, v_x);
                                        if (!((_h5383 !== -1))) continue;
                                        _g5379.push(v_x);
                                      }
                                    }
                                    _g5384.length = 0;
                                    G5385: {
                                      const _a5402 = throughWhere(sp, v_s, (_te5397: number): boolean => { let _c5399: boolean = ((_te5397 === _wc4998 ? _wd4999 : (_te5397 === _wc4996 ? _wd4997 : (b.grid[_te5397] || -1))) === 1); if (_c5399) {   const _t5398 = sp.edgeEnds[2 * _te5397];   _c5399 = !((clueAt(cl.number, _t5398) !== -1)); } let _c5401: boolean = _c5399; if (_c5401) {   const _t5400 = sp.edgeEnds[2 * _te5397 + 1];   _c5401 = !((clueAt(cl.number, _t5400) !== -1)); } return _c5401; });
                                      for (let _i5403 = 0; _i5403 < _a5402.length; _i5403++) {
                                        const v_t = _a5402[_i5403];
                                        const _h5406 = clueAt(cl.number, v_t);
                                        const _h5407 = (_h5406 !== -1);
                                        const _h5408 = _h5407;
                                        const _h5409 = !(_h5408);
                                        const _a5404 = sp.adj4[v_t];
                                        for (let _i5405 = 0; _i5405 < _a5404.length; _i5405++) {
                                          const v_x = _a5404[_i5405];
                                          const _h5410 = clueAt(cl.number, v_x);
                                          let _c5412: boolean = (_h5409 && (_h5410 !== -1));
                                          if (_c5412) {
                                            const _t5411 = sp.adj4Edges[v_t][_i5405];
                                            _c5412 = ((_t5411 === _wc4998 ? _wd4999 : (_t5411 === _wc4996 ? _wd4997 : (b.grid[_t5411] || -1))) === 1);
                                          }
                                          if (!(_c5412)) continue;
                                          if (!_g5384.includes(v_x)) _g5384.push(v_x);
                                        }
                                      }
                                    }
                                    const _a5413 = union(_g5379, _g5384);
                                    for (let _i5414 = 0; _i5414 < _a5413.length; _i5414++) {
                                      const v_p = _a5413[_i5414];
                                      const _h5451 = clueAt(cl.number, v_p);
                                      _g5415.length = 0;
                                      G5416: {
                                        for (let _i5418 = 0; _i5418 < 1; _i5418++) {
                                          const v_x = v_y;
                                          const _h5419 = clueAt(cl.number, v_x);
                                          if (!((_h5419 !== -1))) continue;
                                          _g5415.push(v_x);
                                        }
                                      }
                                      _g5420.length = 0;
                                      G5421: {
                                        const _a5438 = throughWhere(sp, v_y, (_te5433: number): boolean => { let _c5435: boolean = ((_te5433 === _wc4998 ? _wd4999 : (_te5433 === _wc4996 ? _wd4997 : (b.grid[_te5433] || -1))) === 1); if (_c5435) {   const _t5434 = sp.edgeEnds[2 * _te5433];   _c5435 = !((clueAt(cl.number, _t5434) !== -1)); } let _c5437: boolean = _c5435; if (_c5437) {   const _t5436 = sp.edgeEnds[2 * _te5433 + 1];   _c5437 = !((clueAt(cl.number, _t5436) !== -1)); } return _c5437; });
                                        for (let _i5439 = 0; _i5439 < _a5438.length; _i5439++) {
                                          const v_t = _a5438[_i5439];
                                          const _h5442 = clueAt(cl.number, v_t);
                                          const _h5443 = (_h5442 !== -1);
                                          const _h5444 = _h5443;
                                          const _h5445 = !(_h5444);
                                          const _a5440 = sp.adj4[v_t];
                                          for (let _i5441 = 0; _i5441 < _a5440.length; _i5441++) {
                                            const v_x = _a5440[_i5441];
                                            const _h5446 = clueAt(cl.number, v_x);
                                            let _c5448: boolean = (_h5445 && (_h5446 !== -1));
                                            if (_c5448) {
                                              const _t5447 = sp.adj4Edges[v_t][_i5441];
                                              _c5448 = ((_t5447 === _wc4998 ? _wd4999 : (_t5447 === _wc4996 ? _wd4997 : (b.grid[_t5447] || -1))) === 1);
                                            }
                                            if (!(_c5448)) continue;
                                            if (!_g5420.includes(v_x)) _g5420.push(v_x);
                                          }
                                        }
                                      }
                                      const _a5449 = union(_g5415, _g5420);
                                      for (let _i5450 = 0; _i5450 < _a5449.length; _i5450++) {
                                        const v_q = _a5449[_i5450];
                                        const _h5452 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h5451 - _h5452)) === cl.step))) {
                                          _q5377 = false;
                                          break Q5378;
                                        }
                                      }
                                    }
                                  }
                                  _c5453 = _q5377;
                                }
                                if (!((_c5453 && (_h5014 || !(throughWhere(sp, v_s, (_te5454: number): boolean => {  return ((_te5454 === _wc4998 ? _wd4999 : (_te5454 === _wc4996 ? _wd4997 : (b.grid[_te5454] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g5455 = 0;
                                G5456: {
                                  const _a5457 = sp.adj4[v_s];
                                  for (let _i5458 = 0; _i5458 < _a5457.length; _i5458++) {
                                    const _t5459 = sp.adj4Edges[v_s][_i5458];
                                    if (!(((_t5459 === _wc4998 ? _wd4999 : (_t5459 === _wc4996 ? _wd4997 : (b.grid[_t5459] || -1))) === 1))) continue;
                                    _g5455++;
                                  }
                                }
                                let _g5460 = 0;
                                G5461: {
                                  for (let _i5462 = 0; _i5462 < 1; _i5462++) {
                                    const v_k = v_s;
                                    const _h5463 = clueAt(cl.number, v_k);
                                    const _h5470 = (_h5463 + 1);
                                    let _c5472: boolean = (_h5463 !== -1);
                                    if (_c5472) {
                                      let _c5471: boolean = (_h5014 || (_h5463 === 1));
                                      if (!_c5471) {
                                        let _g5464 = 0;
                                        G5465: {
                                          const _t5466 = (_h5463 + 1);
                                          const _a5467 = cluesValued(cl.number, _t5466);
                                          for (let _i5468 = 0; _i5468 < _a5467.length; _i5468++) {
                                            const v_x = _a5467[_i5468];
                                            const _h5469 = clueAt(cl.number, v_x);
                                            if (!((_h5469 === _h5470))) continue;
                                            _g5464++;
                                          }
                                        }
                                        _c5471 = (_g5464 === 0);
                                      }
                                      _c5472 = _c5471;
                                    }
                                    if (!(_c5472)) continue;
                                    _g5460++;
                                  }
                                }
                                let _c5595: boolean = ((_g5455 + 1) === (2 - _g5460));
                                if (!_c5595) {
                                  let _q5473 = false;
                                  Q5474: {
                                    const _a5475 = sp.adj4[v_s];
                                    const _n5476 = _i5336;
                                    for (let _i5477 = 0; _i5477 < _n5476; _i5477++) {
                                      const v_z = _a5475[_i5477];
                                      const _t5478 = sp.adj4Edges[v_s][_i5477];
                                      let _c5497: boolean = !((_t5478 === _wc4998 ? true : (_t5478 === _wc4996 ? true : (b.grid[_t5478] !== 0))));
                                      if (_c5497) {
                                        let _g5479 = 0;
                                        G5480: {
                                          const _a5481 = sp.adj4[v_s];
                                          for (let _i5482 = 0; _i5482 < _a5481.length; _i5482++) {
                                            const _t5483 = sp.adj4Edges[v_s][_i5482];
                                            if (!(((_t5483 === _wc4998 ? _wd4999 : (_t5483 === _wc4996 ? _wd4997 : (b.grid[_t5483] || -1))) === 1))) continue;
                                            _g5479++;
                                          }
                                        }
                                        let _g5484 = 0;
                                        G5485: {
                                          for (let _i5486 = 0; _i5486 < 1; _i5486++) {
                                            const v_k = v_s;
                                            const _h5487 = clueAt(cl.number, v_k);
                                            const _h5494 = (_h5487 + 1);
                                            let _c5496: boolean = (_h5487 !== -1);
                                            if (_c5496) {
                                              let _c5495: boolean = (_h5014 || (_h5487 === 1));
                                              if (!_c5495) {
                                                let _g5488 = 0;
                                                G5489: {
                                                  const _t5490 = (_h5487 + 1);
                                                  const _a5491 = cluesValued(cl.number, _t5490);
                                                  for (let _i5492 = 0; _i5492 < _a5491.length; _i5492++) {
                                                    const v_x = _a5491[_i5492];
                                                    const _h5493 = clueAt(cl.number, v_x);
                                                    if (!((_h5493 === _h5494))) continue;
                                                    _g5488++;
                                                  }
                                                }
                                                _c5495 = (_g5488 === 0);
                                              }
                                              _c5496 = _c5495;
                                            }
                                            if (!(_c5496)) continue;
                                            _g5484++;
                                          }
                                        }
                                        _c5497 = (_g5479 < (2 - _g5484));
                                      }
                                      let _c5516: boolean = _c5497;
                                      if (_c5516) {
                                        let _g5498 = 0;
                                        G5499: {
                                          const _a5500 = sp.adj4[v_z];
                                          for (let _i5501 = 0; _i5501 < _a5500.length; _i5501++) {
                                            const _t5502 = sp.adj4Edges[v_z][_i5501];
                                            if (!(((_t5502 === _wc4998 ? _wd4999 : (_t5502 === _wc4996 ? _wd4997 : (b.grid[_t5502] || -1))) === 1))) continue;
                                            _g5498++;
                                          }
                                        }
                                        let _g5503 = 0;
                                        G5504: {
                                          for (let _i5505 = 0; _i5505 < 1; _i5505++) {
                                            const v_k = v_z;
                                            const _h5506 = clueAt(cl.number, v_k);
                                            const _h5513 = (_h5506 + 1);
                                            let _c5515: boolean = (_h5506 !== -1);
                                            if (_c5515) {
                                              let _c5514: boolean = (_h5014 || (_h5506 === 1));
                                              if (!_c5514) {
                                                let _g5507 = 0;
                                                G5508: {
                                                  const _t5509 = (_h5506 + 1);
                                                  const _a5510 = cluesValued(cl.number, _t5509);
                                                  for (let _i5511 = 0; _i5511 < _a5510.length; _i5511++) {
                                                    const v_x = _a5510[_i5511];
                                                    const _h5512 = clueAt(cl.number, v_x);
                                                    if (!((_h5512 === _h5513))) continue;
                                                    _g5507++;
                                                  }
                                                }
                                                _c5514 = (_g5507 === 0);
                                              }
                                              _c5515 = _c5514;
                                            }
                                            if (!(_c5515)) continue;
                                            _g5503++;
                                          }
                                        }
                                        _c5516 = (_g5498 < (2 - _g5503));
                                      }
                                      let _c5593: boolean = _c5516;
                                      if (_c5593) {
                                        let _q5517 = true;
                                        Q5518: {
                                          _g5519.length = 0;
                                          G5520: {
                                            for (let _i5522 = 0; _i5522 < 1; _i5522++) {
                                              const v_x = v_s;
                                              const _h5523 = clueAt(cl.number, v_x);
                                              if (!((_h5523 !== -1))) continue;
                                              _g5519.push(v_x);
                                            }
                                          }
                                          _g5524.length = 0;
                                          G5525: {
                                            const _a5542 = throughWhere(sp, v_s, (_te5537: number): boolean => { let _c5539: boolean = ((_te5537 === _wc4998 ? _wd4999 : (_te5537 === _wc4996 ? _wd4997 : (b.grid[_te5537] || -1))) === 1); if (_c5539) {   const _t5538 = sp.edgeEnds[2 * _te5537];   _c5539 = !((clueAt(cl.number, _t5538) !== -1)); } let _c5541: boolean = _c5539; if (_c5541) {   const _t5540 = sp.edgeEnds[2 * _te5537 + 1];   _c5541 = !((clueAt(cl.number, _t5540) !== -1)); } return _c5541; });
                                            for (let _i5543 = 0; _i5543 < _a5542.length; _i5543++) {
                                              const v_t = _a5542[_i5543];
                                              const _h5546 = clueAt(cl.number, v_t);
                                              const _h5547 = (_h5546 !== -1);
                                              const _h5548 = _h5547;
                                              const _h5549 = !(_h5548);
                                              const _a5544 = sp.adj4[v_t];
                                              for (let _i5545 = 0; _i5545 < _a5544.length; _i5545++) {
                                                const v_x = _a5544[_i5545];
                                                const _h5550 = clueAt(cl.number, v_x);
                                                let _c5552: boolean = (_h5549 && (_h5550 !== -1));
                                                if (_c5552) {
                                                  const _t5551 = sp.adj4Edges[v_t][_i5545];
                                                  _c5552 = ((_t5551 === _wc4998 ? _wd4999 : (_t5551 === _wc4996 ? _wd4997 : (b.grid[_t5551] || -1))) === 1);
                                                }
                                                if (!(_c5552)) continue;
                                                if (!_g5524.includes(v_x)) _g5524.push(v_x);
                                              }
                                            }
                                          }
                                          const _a5553 = union(_g5519, _g5524);
                                          for (let _i5554 = 0; _i5554 < _a5553.length; _i5554++) {
                                            const v_p = _a5553[_i5554];
                                            const _h5591 = clueAt(cl.number, v_p);
                                            _g5555.length = 0;
                                            G5556: {
                                              for (let _i5558 = 0; _i5558 < 1; _i5558++) {
                                                const v_x = v_z;
                                                const _h5559 = clueAt(cl.number, v_x);
                                                if (!((_h5559 !== -1))) continue;
                                                _g5555.push(v_x);
                                              }
                                            }
                                            _g5560.length = 0;
                                            G5561: {
                                              const _a5578 = throughWhere(sp, v_z, (_te5573: number): boolean => { let _c5575: boolean = ((_te5573 === _wc4998 ? _wd4999 : (_te5573 === _wc4996 ? _wd4997 : (b.grid[_te5573] || -1))) === 1); if (_c5575) {   const _t5574 = sp.edgeEnds[2 * _te5573];   _c5575 = !((clueAt(cl.number, _t5574) !== -1)); } let _c5577: boolean = _c5575; if (_c5577) {   const _t5576 = sp.edgeEnds[2 * _te5573 + 1];   _c5577 = !((clueAt(cl.number, _t5576) !== -1)); } return _c5577; });
                                              for (let _i5579 = 0; _i5579 < _a5578.length; _i5579++) {
                                                const v_t = _a5578[_i5579];
                                                const _h5582 = clueAt(cl.number, v_t);
                                                const _h5583 = (_h5582 !== -1);
                                                const _h5584 = _h5583;
                                                const _h5585 = !(_h5584);
                                                const _a5580 = sp.adj4[v_t];
                                                for (let _i5581 = 0; _i5581 < _a5580.length; _i5581++) {
                                                  const v_x = _a5580[_i5581];
                                                  const _h5586 = clueAt(cl.number, v_x);
                                                  let _c5588: boolean = (_h5585 && (_h5586 !== -1));
                                                  if (_c5588) {
                                                    const _t5587 = sp.adj4Edges[v_t][_i5581];
                                                    _c5588 = ((_t5587 === _wc4998 ? _wd4999 : (_t5587 === _wc4996 ? _wd4997 : (b.grid[_t5587] || -1))) === 1);
                                                  }
                                                  if (!(_c5588)) continue;
                                                  if (!_g5560.includes(v_x)) _g5560.push(v_x);
                                                }
                                              }
                                            }
                                            const _a5589 = union(_g5555, _g5560);
                                            for (let _i5590 = 0; _i5590 < _a5589.length; _i5590++) {
                                              const v_q = _a5589[_i5590];
                                              const _h5592 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h5591 - _h5592)) === cl.step))) {
                                                _q5517 = false;
                                                break Q5518;
                                              }
                                            }
                                          }
                                        }
                                        _c5593 = _q5517;
                                      }
                                      if ((_c5593 && (_h5014 || !(throughWhere(sp, v_s, (_te5594: number): boolean => {  return ((_te5594 === _wc4998 ? _wd4999 : (_te5594 === _wc4996 ? _wd4997 : (b.grid[_te5594] || -1))) === 1); }).includes(v_z))))) {
                                        _q5473 = true;
                                        break Q5474;
                                      }
                                    }
                                  }
                                  _c5595 = _q5473;
                                }
                                if (_c5595) {
                                  _q5333 = true;
                                  break Q5334;
                                }
                              }
                            }
                            _c5596 = !(_q5333);
                          }
                          if (_c5596) {
                            _q5311 = true;
                            break Q5312;
                          }
                        }
                      }
                      _c5597 = _q5311;
                    }
                    if (_c5597) {
                      _q5000 = true;
                      break Q5001;
                    }
                  }
                }
                _c5598 = _q5000;
              }
              _c5599 = _c5598;
            }
            if (!(_c5599)) continue;
            if (!_g4470.includes(v_j)) _g4470.push(v_j);
          }
        }
      }
      const v_A = _g4470;
      const _h6742 = v_A.length;
      const _h6743 = (_h6742 < 3);
      _g5600.length = 0;
      G5601: {
        const _a6116 = v_U;
        for (let _i6117 = 0; _i6117 < _a6116.length; _i6117++) {
          const v_i = _a6116[_i6117];
          const _h6120 = _i6117;
          const _h6121 = (_h6120 > 0);
          const _h6122 = sp.edgeOf(v_c, v_i);
          const _a6118 = v_U;
          for (let _i6119 = 0; _i6119 < _a6118.length; _i6119++) {
            const v_j = _a6118[_i6119];
            let _c6725: boolean = (_h6121 && (_h6120 < _i6119));
            if (_c6725) {
              let _c6724: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h4994 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c6724) {
                const _wc6123 = _h6122;
                const _wd6124 = 1;
                const _wc6125 = sp.edgeOf(v_c, v_j);
                const _wd6126 = 1;
                let _q6127 = false;
                Q6128: {
                  const _a6130 = throughWhere(sp, v_c, (_te6129: number): boolean => {  return ((_te6129 === _wc6125 ? _wd6126 : (_te6129 === _wc6123 ? _wd6124 : (b.grid[_te6129] || -1))) === 1); });
                  for (let _i6131 = 0; _i6131 < _a6130.length; _i6131++) {
                    const v_t = _a6130[_i6131];
                    let _c6150: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6150) {
                      let _g6132 = 0;
                      G6133: {
                        const _a6134 = sp.adj4[v_t];
                        for (let _i6135 = 0; _i6135 < _a6134.length; _i6135++) {
                          const _t6136 = sp.adj4Edges[v_t][_i6135];
                          if (!(((_t6136 === _wc6125 ? _wd6126 : (_t6136 === _wc6123 ? _wd6124 : (b.grid[_t6136] || -1))) === 1))) continue;
                          _g6132++;
                        }
                      }
                      let _g6137 = 0;
                      G6138: {
                        for (let _i6139 = 0; _i6139 < 1; _i6139++) {
                          const v_k = v_t;
                          const _h6140 = clueAt(cl.number, v_k);
                          const _h6147 = (_h6140 + 1);
                          let _c6149: boolean = (_h6140 !== -1);
                          if (_c6149) {
                            let _c6148: boolean = (_h5014 || (_h6140 === 1));
                            if (!_c6148) {
                              let _g6141 = 0;
                              G6142: {
                                const _t6143 = (_h6140 + 1);
                                const _a6144 = cluesValued(cl.number, _t6143);
                                for (let _i6145 = 0; _i6145 < _a6144.length; _i6145++) {
                                  const v_x = _a6144[_i6145];
                                  const _h6146 = clueAt(cl.number, v_x);
                                  if (!((_h6146 === _h6147))) continue;
                                  _g6141++;
                                }
                              }
                              _c6148 = (_g6141 === 0);
                            }
                            _c6149 = _c6148;
                          }
                          if (!(_c6149)) continue;
                          _g6137++;
                        }
                      }
                      _c6150 = (_g6132 < (2 - _g6137));
                    }
                    if (!(_c6150)) continue;
                    let _g6151 = 0;
                    G6152: {
                      const _a6153 = sp.adj4[v_t];
                      for (let _i6154 = 0; _i6154 < _a6153.length; _i6154++) {
                        const _t6155 = sp.adj4Edges[v_t][_i6154];
                        if (!(((_t6155 === _wc6125 ? _wd6126 : (_t6155 === _wc6123 ? _wd6124 : (b.grid[_t6155] || -1))) === 1))) continue;
                        _g6151++;
                      }
                    }
                    let _g6156 = 0;
                    G6157: {
                      for (let _i6158 = 0; _i6158 < 1; _i6158++) {
                        const v_k = v_t;
                        const _h6159 = clueAt(cl.number, v_k);
                        const _h6166 = (_h6159 + 1);
                        let _c6168: boolean = (_h6159 !== -1);
                        if (_c6168) {
                          let _c6167: boolean = (_h5014 || (_h6159 === 1));
                          if (!_c6167) {
                            let _g6160 = 0;
                            G6161: {
                              const _t6162 = (_h6159 + 1);
                              const _a6163 = cluesValued(cl.number, _t6162);
                              for (let _i6164 = 0; _i6164 < _a6163.length; _i6164++) {
                                const v_x = _a6163[_i6164];
                                const _h6165 = clueAt(cl.number, v_x);
                                if (!((_h6165 === _h6166))) continue;
                                _g6160++;
                              }
                            }
                            _c6167 = (_g6160 === 0);
                          }
                          _c6168 = _c6167;
                        }
                        if (!(_c6168)) continue;
                        _g6156++;
                      }
                    }
                    let _c6436: boolean = (_g6151 < (2 - _g6156));
                    if (_c6436) {
                      let _q6169 = false;
                      Q6170: {
                        const _a6171 = sp.adj4[v_t];
                        for (let _i6172 = 0; _i6172 < _a6171.length; _i6172++) {
                          const v_y = _a6171[_i6172];
                          const _t6173 = sp.adj4Edges[v_t][_i6172];
                          let _c6192: boolean = !((_t6173 === _wc6125 ? true : (_t6173 === _wc6123 ? true : (b.grid[_t6173] !== 0))));
                          if (_c6192) {
                            let _g6174 = 0;
                            G6175: {
                              const _a6176 = sp.adj4[v_t];
                              for (let _i6177 = 0; _i6177 < _a6176.length; _i6177++) {
                                const _t6178 = sp.adj4Edges[v_t][_i6177];
                                if (!(((_t6178 === _wc6125 ? _wd6126 : (_t6178 === _wc6123 ? _wd6124 : (b.grid[_t6178] || -1))) === 1))) continue;
                                _g6174++;
                              }
                            }
                            let _g6179 = 0;
                            G6180: {
                              for (let _i6181 = 0; _i6181 < 1; _i6181++) {
                                const v_k = v_t;
                                const _h6182 = clueAt(cl.number, v_k);
                                const _h6189 = (_h6182 + 1);
                                let _c6191: boolean = (_h6182 !== -1);
                                if (_c6191) {
                                  let _c6190: boolean = (_h5014 || (_h6182 === 1));
                                  if (!_c6190) {
                                    let _g6183 = 0;
                                    G6184: {
                                      const _t6185 = (_h6182 + 1);
                                      const _a6186 = cluesValued(cl.number, _t6185);
                                      for (let _i6187 = 0; _i6187 < _a6186.length; _i6187++) {
                                        const v_x = _a6186[_i6187];
                                        const _h6188 = clueAt(cl.number, v_x);
                                        if (!((_h6188 === _h6189))) continue;
                                        _g6183++;
                                      }
                                    }
                                    _c6190 = (_g6183 === 0);
                                  }
                                  _c6191 = _c6190;
                                }
                                if (!(_c6191)) continue;
                                _g6179++;
                              }
                            }
                            _c6192 = (_g6174 < (2 - _g6179));
                          }
                          let _c6212: boolean = _c6192;
                          if (_c6212) {
                            let _g6193 = 0;
                            G6194: {
                              const _a6196 = sp.adj4[v_y];
                              for (let _i6197 = 0; _i6197 < _a6196.length; _i6197++) {
                                const _t6198 = sp.adj4Edges[v_y][_i6197];
                                if (!(((_t6198 === _wc6125 ? _wd6126 : (_t6198 === _wc6123 ? _wd6124 : (b.grid[_t6198] || -1))) === 1))) continue;
                                _g6193++;
                              }
                            }
                            let _g6199 = 0;
                            G6200: {
                              for (let _i6201 = 0; _i6201 < 1; _i6201++) {
                                const v_k = v_y;
                                const _h6202 = clueAt(cl.number, v_k);
                                const _h6209 = (_h6202 + 1);
                                let _c6211: boolean = (_h6202 !== -1);
                                if (_c6211) {
                                  let _c6210: boolean = (_h5014 || (_h6202 === 1));
                                  if (!_c6210) {
                                    let _g6203 = 0;
                                    G6204: {
                                      const _t6205 = (_h6202 + 1);
                                      const _a6206 = cluesValued(cl.number, _t6205);
                                      for (let _i6207 = 0; _i6207 < _a6206.length; _i6207++) {
                                        const v_x = _a6206[_i6207];
                                        const _h6208 = clueAt(cl.number, v_x);
                                        if (!((_h6208 === _h6209))) continue;
                                        _g6203++;
                                      }
                                    }
                                    _c6210 = (_g6203 === 0);
                                  }
                                  _c6211 = _c6210;
                                }
                                if (!(_c6211)) continue;
                                _g6199++;
                              }
                            }
                            _c6212 = (_g6193 < (2 - _g6199));
                          }
                          let _c6291: boolean = _c6212;
                          if (_c6291) {
                            let _q6213 = true;
                            Q6214: {
                              _g6215.length = 0;
                              G6216: {
                                for (let _i6218 = 0; _i6218 < 1; _i6218++) {
                                  const v_x = v_t;
                                  const _h6219 = clueAt(cl.number, v_x);
                                  if (!((_h6219 !== -1))) continue;
                                  _g6215.push(v_x);
                                }
                              }
                              _g6220.length = 0;
                              G6221: {
                                const _a6240 = throughWhere(sp, v_t, (_te6235: number): boolean => { let _c6237: boolean = ((_te6235 === _wc6125 ? _wd6126 : (_te6235 === _wc6123 ? _wd6124 : (b.grid[_te6235] || -1))) === 1); if (_c6237) {   const _t6236 = sp.edgeEnds[2 * _te6235];   _c6237 = !((clueAt(cl.number, _t6236) !== -1)); } let _c6239: boolean = _c6237; if (_c6239) {   const _t6238 = sp.edgeEnds[2 * _te6235 + 1];   _c6239 = !((clueAt(cl.number, _t6238) !== -1)); } return _c6239; });
                                for (let _i6241 = 0; _i6241 < _a6240.length; _i6241++) {
                                  const v_t_6234 = _a6240[_i6241];
                                  const _h6244 = clueAt(cl.number, v_t_6234);
                                  const _h6245 = (_h6244 !== -1);
                                  const _h6246 = _h6245;
                                  const _h6247 = !(_h6246);
                                  const _a6242 = sp.adj4[v_t_6234];
                                  for (let _i6243 = 0; _i6243 < _a6242.length; _i6243++) {
                                    const v_x = _a6242[_i6243];
                                    const _h6248 = clueAt(cl.number, v_x);
                                    let _c6250: boolean = (_h6247 && (_h6248 !== -1));
                                    if (_c6250) {
                                      const _t6249 = sp.adj4Edges[v_t_6234][_i6243];
                                      _c6250 = ((_t6249 === _wc6125 ? _wd6126 : (_t6249 === _wc6123 ? _wd6124 : (b.grid[_t6249] || -1))) === 1);
                                    }
                                    if (!(_c6250)) continue;
                                    if (!_g6220.includes(v_x)) _g6220.push(v_x);
                                  }
                                }
                              }
                              const _a6251 = union(_g6215, _g6220);
                              for (let _i6252 = 0; _i6252 < _a6251.length; _i6252++) {
                                const v_p = _a6251[_i6252];
                                const _h6289 = clueAt(cl.number, v_p);
                                _g6253.length = 0;
                                G6254: {
                                  for (let _i6256 = 0; _i6256 < 1; _i6256++) {
                                    const v_x = v_y;
                                    const _h6257 = clueAt(cl.number, v_x);
                                    if (!((_h6257 !== -1))) continue;
                                    _g6253.push(v_x);
                                  }
                                }
                                _g6258.length = 0;
                                G6259: {
                                  const _a6276 = throughWhere(sp, v_y, (_te6271: number): boolean => { let _c6273: boolean = ((_te6271 === _wc6125 ? _wd6126 : (_te6271 === _wc6123 ? _wd6124 : (b.grid[_te6271] || -1))) === 1); if (_c6273) {   const _t6272 = sp.edgeEnds[2 * _te6271];   _c6273 = !((clueAt(cl.number, _t6272) !== -1)); } let _c6275: boolean = _c6273; if (_c6275) {   const _t6274 = sp.edgeEnds[2 * _te6271 + 1];   _c6275 = !((clueAt(cl.number, _t6274) !== -1)); } return _c6275; });
                                  for (let _i6277 = 0; _i6277 < _a6276.length; _i6277++) {
                                    const v_t = _a6276[_i6277];
                                    const _h6280 = clueAt(cl.number, v_t);
                                    const _h6281 = (_h6280 !== -1);
                                    const _h6282 = _h6281;
                                    const _h6283 = !(_h6282);
                                    const _a6278 = sp.adj4[v_t];
                                    for (let _i6279 = 0; _i6279 < _a6278.length; _i6279++) {
                                      const v_x = _a6278[_i6279];
                                      const _h6284 = clueAt(cl.number, v_x);
                                      let _c6286: boolean = (_h6283 && (_h6284 !== -1));
                                      if (_c6286) {
                                        const _t6285 = sp.adj4Edges[v_t][_i6279];
                                        _c6286 = ((_t6285 === _wc6125 ? _wd6126 : (_t6285 === _wc6123 ? _wd6124 : (b.grid[_t6285] || -1))) === 1);
                                      }
                                      if (!(_c6286)) continue;
                                      if (!_g6258.includes(v_x)) _g6258.push(v_x);
                                    }
                                  }
                                }
                                const _a6287 = union(_g6253, _g6258);
                                for (let _i6288 = 0; _i6288 < _a6287.length; _i6288++) {
                                  const v_q = _a6287[_i6288];
                                  const _h6290 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6289 - _h6290)) === cl.step))) {
                                    _q6213 = false;
                                    break Q6214;
                                  }
                                }
                              }
                            }
                            _c6291 = _q6213;
                          }
                          if (!((_c6291 && (_h5014 || !(throughWhere(sp, v_t, (_te6292: number): boolean => {  return ((_te6292 === _wc6125 ? _wd6126 : (_te6292 === _wc6123 ? _wd6124 : (b.grid[_te6292] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6293 = 0;
                          G6294: {
                            const _a6295 = sp.adj4[v_t];
                            for (let _i6296 = 0; _i6296 < _a6295.length; _i6296++) {
                              const _t6297 = sp.adj4Edges[v_t][_i6296];
                              if (!(((_t6297 === _wc6125 ? _wd6126 : (_t6297 === _wc6123 ? _wd6124 : (b.grid[_t6297] || -1))) === 1))) continue;
                              _g6293++;
                            }
                          }
                          let _g6298 = 0;
                          G6299: {
                            for (let _i6300 = 0; _i6300 < 1; _i6300++) {
                              const v_k = v_t;
                              const _h6301 = clueAt(cl.number, v_k);
                              const _h6308 = (_h6301 + 1);
                              let _c6310: boolean = (_h6301 !== -1);
                              if (_c6310) {
                                let _c6309: boolean = (_h5014 || (_h6301 === 1));
                                if (!_c6309) {
                                  let _g6302 = 0;
                                  G6303: {
                                    const _t6304 = (_h6301 + 1);
                                    const _a6305 = cluesValued(cl.number, _t6304);
                                    for (let _i6306 = 0; _i6306 < _a6305.length; _i6306++) {
                                      const v_x = _a6305[_i6306];
                                      const _h6307 = clueAt(cl.number, v_x);
                                      if (!((_h6307 === _h6308))) continue;
                                      _g6302++;
                                    }
                                  }
                                  _c6309 = (_g6302 === 0);
                                }
                                _c6310 = _c6309;
                              }
                              if (!(_c6310)) continue;
                              _g6298++;
                            }
                          }
                          let _c6435: boolean = ((_g6293 + 1) === (2 - _g6298));
                          if (!_c6435) {
                            let _q6311 = false;
                            Q6312: {
                              const _a6313 = sp.adj4[v_t];
                              const _n6314 = _i6172;
                              for (let _i6315 = 0; _i6315 < _n6314; _i6315++) {
                                const v_z = _a6313[_i6315];
                                const _t6316 = sp.adj4Edges[v_t][_i6315];
                                let _c6335: boolean = !((_t6316 === _wc6125 ? true : (_t6316 === _wc6123 ? true : (b.grid[_t6316] !== 0))));
                                if (_c6335) {
                                  let _g6317 = 0;
                                  G6318: {
                                    const _a6319 = sp.adj4[v_t];
                                    for (let _i6320 = 0; _i6320 < _a6319.length; _i6320++) {
                                      const _t6321 = sp.adj4Edges[v_t][_i6320];
                                      if (!(((_t6321 === _wc6125 ? _wd6126 : (_t6321 === _wc6123 ? _wd6124 : (b.grid[_t6321] || -1))) === 1))) continue;
                                      _g6317++;
                                    }
                                  }
                                  let _g6322 = 0;
                                  G6323: {
                                    for (let _i6324 = 0; _i6324 < 1; _i6324++) {
                                      const v_k = v_t;
                                      const _h6325 = clueAt(cl.number, v_k);
                                      const _h6332 = (_h6325 + 1);
                                      let _c6334: boolean = (_h6325 !== -1);
                                      if (_c6334) {
                                        let _c6333: boolean = (_h5014 || (_h6325 === 1));
                                        if (!_c6333) {
                                          let _g6326 = 0;
                                          G6327: {
                                            const _t6328 = (_h6325 + 1);
                                            const _a6329 = cluesValued(cl.number, _t6328);
                                            for (let _i6330 = 0; _i6330 < _a6329.length; _i6330++) {
                                              const v_x = _a6329[_i6330];
                                              const _h6331 = clueAt(cl.number, v_x);
                                              if (!((_h6331 === _h6332))) continue;
                                              _g6326++;
                                            }
                                          }
                                          _c6333 = (_g6326 === 0);
                                        }
                                        _c6334 = _c6333;
                                      }
                                      if (!(_c6334)) continue;
                                      _g6322++;
                                    }
                                  }
                                  _c6335 = (_g6317 < (2 - _g6322));
                                }
                                let _c6354: boolean = _c6335;
                                if (_c6354) {
                                  let _g6336 = 0;
                                  G6337: {
                                    const _a6338 = sp.adj4[v_z];
                                    for (let _i6339 = 0; _i6339 < _a6338.length; _i6339++) {
                                      const _t6340 = sp.adj4Edges[v_z][_i6339];
                                      if (!(((_t6340 === _wc6125 ? _wd6126 : (_t6340 === _wc6123 ? _wd6124 : (b.grid[_t6340] || -1))) === 1))) continue;
                                      _g6336++;
                                    }
                                  }
                                  let _g6341 = 0;
                                  G6342: {
                                    for (let _i6343 = 0; _i6343 < 1; _i6343++) {
                                      const v_k = v_z;
                                      const _h6344 = clueAt(cl.number, v_k);
                                      const _h6351 = (_h6344 + 1);
                                      let _c6353: boolean = (_h6344 !== -1);
                                      if (_c6353) {
                                        let _c6352: boolean = (_h5014 || (_h6344 === 1));
                                        if (!_c6352) {
                                          let _g6345 = 0;
                                          G6346: {
                                            const _t6347 = (_h6344 + 1);
                                            const _a6348 = cluesValued(cl.number, _t6347);
                                            for (let _i6349 = 0; _i6349 < _a6348.length; _i6349++) {
                                              const v_x = _a6348[_i6349];
                                              const _h6350 = clueAt(cl.number, v_x);
                                              if (!((_h6350 === _h6351))) continue;
                                              _g6345++;
                                            }
                                          }
                                          _c6352 = (_g6345 === 0);
                                        }
                                        _c6353 = _c6352;
                                      }
                                      if (!(_c6353)) continue;
                                      _g6341++;
                                    }
                                  }
                                  _c6354 = (_g6336 < (2 - _g6341));
                                }
                                let _c6433: boolean = _c6354;
                                if (_c6433) {
                                  let _q6355 = true;
                                  Q6356: {
                                    _g6357.length = 0;
                                    G6358: {
                                      for (let _i6360 = 0; _i6360 < 1; _i6360++) {
                                        const v_x = v_t;
                                        const _h6361 = clueAt(cl.number, v_x);
                                        if (!((_h6361 !== -1))) continue;
                                        _g6357.push(v_x);
                                      }
                                    }
                                    _g6362.length = 0;
                                    G6363: {
                                      const _a6382 = throughWhere(sp, v_t, (_te6377: number): boolean => { let _c6379: boolean = ((_te6377 === _wc6125 ? _wd6126 : (_te6377 === _wc6123 ? _wd6124 : (b.grid[_te6377] || -1))) === 1); if (_c6379) {   const _t6378 = sp.edgeEnds[2 * _te6377];   _c6379 = !((clueAt(cl.number, _t6378) !== -1)); } let _c6381: boolean = _c6379; if (_c6381) {   const _t6380 = sp.edgeEnds[2 * _te6377 + 1];   _c6381 = !((clueAt(cl.number, _t6380) !== -1)); } return _c6381; });
                                      for (let _i6383 = 0; _i6383 < _a6382.length; _i6383++) {
                                        const v_t_6376 = _a6382[_i6383];
                                        const _h6386 = clueAt(cl.number, v_t_6376);
                                        const _h6387 = (_h6386 !== -1);
                                        const _h6388 = _h6387;
                                        const _h6389 = !(_h6388);
                                        const _a6384 = sp.adj4[v_t_6376];
                                        for (let _i6385 = 0; _i6385 < _a6384.length; _i6385++) {
                                          const v_x = _a6384[_i6385];
                                          const _h6390 = clueAt(cl.number, v_x);
                                          let _c6392: boolean = (_h6389 && (_h6390 !== -1));
                                          if (_c6392) {
                                            const _t6391 = sp.adj4Edges[v_t_6376][_i6385];
                                            _c6392 = ((_t6391 === _wc6125 ? _wd6126 : (_t6391 === _wc6123 ? _wd6124 : (b.grid[_t6391] || -1))) === 1);
                                          }
                                          if (!(_c6392)) continue;
                                          if (!_g6362.includes(v_x)) _g6362.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6393 = union(_g6357, _g6362);
                                    for (let _i6394 = 0; _i6394 < _a6393.length; _i6394++) {
                                      const v_p = _a6393[_i6394];
                                      const _h6431 = clueAt(cl.number, v_p);
                                      _g6395.length = 0;
                                      G6396: {
                                        for (let _i6398 = 0; _i6398 < 1; _i6398++) {
                                          const v_x = v_z;
                                          const _h6399 = clueAt(cl.number, v_x);
                                          if (!((_h6399 !== -1))) continue;
                                          _g6395.push(v_x);
                                        }
                                      }
                                      _g6400.length = 0;
                                      G6401: {
                                        const _a6418 = throughWhere(sp, v_z, (_te6413: number): boolean => { let _c6415: boolean = ((_te6413 === _wc6125 ? _wd6126 : (_te6413 === _wc6123 ? _wd6124 : (b.grid[_te6413] || -1))) === 1); if (_c6415) {   const _t6414 = sp.edgeEnds[2 * _te6413];   _c6415 = !((clueAt(cl.number, _t6414) !== -1)); } let _c6417: boolean = _c6415; if (_c6417) {   const _t6416 = sp.edgeEnds[2 * _te6413 + 1];   _c6417 = !((clueAt(cl.number, _t6416) !== -1)); } return _c6417; });
                                        for (let _i6419 = 0; _i6419 < _a6418.length; _i6419++) {
                                          const v_t = _a6418[_i6419];
                                          const _h6422 = clueAt(cl.number, v_t);
                                          const _h6423 = (_h6422 !== -1);
                                          const _h6424 = _h6423;
                                          const _h6425 = !(_h6424);
                                          const _a6420 = sp.adj4[v_t];
                                          for (let _i6421 = 0; _i6421 < _a6420.length; _i6421++) {
                                            const v_x = _a6420[_i6421];
                                            const _h6426 = clueAt(cl.number, v_x);
                                            let _c6428: boolean = (_h6425 && (_h6426 !== -1));
                                            if (_c6428) {
                                              const _t6427 = sp.adj4Edges[v_t][_i6421];
                                              _c6428 = ((_t6427 === _wc6125 ? _wd6126 : (_t6427 === _wc6123 ? _wd6124 : (b.grid[_t6427] || -1))) === 1);
                                            }
                                            if (!(_c6428)) continue;
                                            if (!_g6400.includes(v_x)) _g6400.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6429 = union(_g6395, _g6400);
                                      for (let _i6430 = 0; _i6430 < _a6429.length; _i6430++) {
                                        const v_q = _a6429[_i6430];
                                        const _h6432 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6431 - _h6432)) === cl.step))) {
                                          _q6355 = false;
                                          break Q6356;
                                        }
                                      }
                                    }
                                  }
                                  _c6433 = _q6355;
                                }
                                if ((_c6433 && (_h5014 || !(throughWhere(sp, v_t, (_te6434: number): boolean => {  return ((_te6434 === _wc6125 ? _wd6126 : (_te6434 === _wc6123 ? _wd6124 : (b.grid[_te6434] || -1))) === 1); }).includes(v_z))))) {
                                  _q6311 = true;
                                  break Q6312;
                                }
                              }
                            }
                            _c6435 = _q6311;
                          }
                          if (_c6435) {
                            _q6169 = true;
                            break Q6170;
                          }
                        }
                      }
                      _c6436 = !(_q6169);
                    }
                    let _c6723: boolean = _c6436;
                    if (!_c6723) {
                      let _q6437 = false;
                      Q6438: {
                        const _a6439 = sp.adj4[v_t];
                        for (let _i6440 = 0; _i6440 < _a6439.length; _i6440++) {
                          const v_s = _a6439[_i6440];
                          let _g6441 = 0;
                          G6442: {
                            const _a6443 = sp.adj4[v_s];
                            for (let _i6444 = 0; _i6444 < _a6443.length; _i6444++) {
                              const _t6445 = sp.adj4Edges[v_s][_i6444];
                              if (!(((_t6445 === _wc6125 ? _wd6126 : (_t6445 === _wc6123 ? _wd6124 : (b.grid[_t6445] || -1))) === 1))) continue;
                              _g6441++;
                            }
                          }
                          let _g6446 = 0;
                          G6447: {
                            for (let _i6448 = 0; _i6448 < 1; _i6448++) {
                              const v_k = v_s;
                              const _h6449 = clueAt(cl.number, v_k);
                              const _h6456 = (_h6449 + 1);
                              let _c6458: boolean = (_h6449 !== -1);
                              if (_c6458) {
                                let _c6457: boolean = (_h5014 || (_h6449 === 1));
                                if (!_c6457) {
                                  let _g6450 = 0;
                                  G6451: {
                                    const _t6452 = (_h6449 + 1);
                                    const _a6453 = cluesValued(cl.number, _t6452);
                                    for (let _i6454 = 0; _i6454 < _a6453.length; _i6454++) {
                                      const v_x = _a6453[_i6454];
                                      const _h6455 = clueAt(cl.number, v_x);
                                      if (!((_h6455 === _h6456))) continue;
                                      _g6450++;
                                    }
                                  }
                                  _c6457 = (_g6450 === 0);
                                }
                                _c6458 = _c6457;
                              }
                              if (!(_c6458)) continue;
                              _g6446++;
                            }
                          }
                          let _c6722: boolean = (_g6441 < (2 - _g6446));
                          if (_c6722) {
                            let _q6459 = false;
                            Q6460: {
                              const _a6461 = sp.adj4[v_s];
                              for (let _i6462 = 0; _i6462 < _a6461.length; _i6462++) {
                                const v_y = _a6461[_i6462];
                                const _t6463 = sp.adj4Edges[v_s][_i6462];
                                let _c6482: boolean = !((_t6463 === _wc6125 ? true : (_t6463 === _wc6123 ? true : (b.grid[_t6463] !== 0))));
                                if (_c6482) {
                                  let _g6464 = 0;
                                  G6465: {
                                    const _a6466 = sp.adj4[v_s];
                                    for (let _i6467 = 0; _i6467 < _a6466.length; _i6467++) {
                                      const _t6468 = sp.adj4Edges[v_s][_i6467];
                                      if (!(((_t6468 === _wc6125 ? _wd6126 : (_t6468 === _wc6123 ? _wd6124 : (b.grid[_t6468] || -1))) === 1))) continue;
                                      _g6464++;
                                    }
                                  }
                                  let _g6469 = 0;
                                  G6470: {
                                    for (let _i6471 = 0; _i6471 < 1; _i6471++) {
                                      const v_k = v_s;
                                      const _h6472 = clueAt(cl.number, v_k);
                                      const _h6479 = (_h6472 + 1);
                                      let _c6481: boolean = (_h6472 !== -1);
                                      if (_c6481) {
                                        let _c6480: boolean = (_h5014 || (_h6472 === 1));
                                        if (!_c6480) {
                                          let _g6473 = 0;
                                          G6474: {
                                            const _t6475 = (_h6472 + 1);
                                            const _a6476 = cluesValued(cl.number, _t6475);
                                            for (let _i6477 = 0; _i6477 < _a6476.length; _i6477++) {
                                              const v_x = _a6476[_i6477];
                                              const _h6478 = clueAt(cl.number, v_x);
                                              if (!((_h6478 === _h6479))) continue;
                                              _g6473++;
                                            }
                                          }
                                          _c6480 = (_g6473 === 0);
                                        }
                                        _c6481 = _c6480;
                                      }
                                      if (!(_c6481)) continue;
                                      _g6469++;
                                    }
                                  }
                                  _c6482 = (_g6464 < (2 - _g6469));
                                }
                                let _c6502: boolean = _c6482;
                                if (_c6502) {
                                  let _g6483 = 0;
                                  G6484: {
                                    const _a6486 = sp.adj4[v_y];
                                    for (let _i6487 = 0; _i6487 < _a6486.length; _i6487++) {
                                      const _t6488 = sp.adj4Edges[v_y][_i6487];
                                      if (!(((_t6488 === _wc6125 ? _wd6126 : (_t6488 === _wc6123 ? _wd6124 : (b.grid[_t6488] || -1))) === 1))) continue;
                                      _g6483++;
                                    }
                                  }
                                  let _g6489 = 0;
                                  G6490: {
                                    for (let _i6491 = 0; _i6491 < 1; _i6491++) {
                                      const v_k = v_y;
                                      const _h6492 = clueAt(cl.number, v_k);
                                      const _h6499 = (_h6492 + 1);
                                      let _c6501: boolean = (_h6492 !== -1);
                                      if (_c6501) {
                                        let _c6500: boolean = (_h5014 || (_h6492 === 1));
                                        if (!_c6500) {
                                          let _g6493 = 0;
                                          G6494: {
                                            const _t6495 = (_h6492 + 1);
                                            const _a6496 = cluesValued(cl.number, _t6495);
                                            for (let _i6497 = 0; _i6497 < _a6496.length; _i6497++) {
                                              const v_x = _a6496[_i6497];
                                              const _h6498 = clueAt(cl.number, v_x);
                                              if (!((_h6498 === _h6499))) continue;
                                              _g6493++;
                                            }
                                          }
                                          _c6500 = (_g6493 === 0);
                                        }
                                        _c6501 = _c6500;
                                      }
                                      if (!(_c6501)) continue;
                                      _g6489++;
                                    }
                                  }
                                  _c6502 = (_g6483 < (2 - _g6489));
                                }
                                let _c6579: boolean = _c6502;
                                if (_c6579) {
                                  let _q6503 = true;
                                  Q6504: {
                                    _g6505.length = 0;
                                    G6506: {
                                      for (let _i6508 = 0; _i6508 < 1; _i6508++) {
                                        const v_x = v_s;
                                        const _h6509 = clueAt(cl.number, v_x);
                                        if (!((_h6509 !== -1))) continue;
                                        _g6505.push(v_x);
                                      }
                                    }
                                    _g6510.length = 0;
                                    G6511: {
                                      const _a6528 = throughWhere(sp, v_s, (_te6523: number): boolean => { let _c6525: boolean = ((_te6523 === _wc6125 ? _wd6126 : (_te6523 === _wc6123 ? _wd6124 : (b.grid[_te6523] || -1))) === 1); if (_c6525) {   const _t6524 = sp.edgeEnds[2 * _te6523];   _c6525 = !((clueAt(cl.number, _t6524) !== -1)); } let _c6527: boolean = _c6525; if (_c6527) {   const _t6526 = sp.edgeEnds[2 * _te6523 + 1];   _c6527 = !((clueAt(cl.number, _t6526) !== -1)); } return _c6527; });
                                      for (let _i6529 = 0; _i6529 < _a6528.length; _i6529++) {
                                        const v_t = _a6528[_i6529];
                                        const _h6532 = clueAt(cl.number, v_t);
                                        const _h6533 = (_h6532 !== -1);
                                        const _h6534 = _h6533;
                                        const _h6535 = !(_h6534);
                                        const _a6530 = sp.adj4[v_t];
                                        for (let _i6531 = 0; _i6531 < _a6530.length; _i6531++) {
                                          const v_x = _a6530[_i6531];
                                          const _h6536 = clueAt(cl.number, v_x);
                                          let _c6538: boolean = (_h6535 && (_h6536 !== -1));
                                          if (_c6538) {
                                            const _t6537 = sp.adj4Edges[v_t][_i6531];
                                            _c6538 = ((_t6537 === _wc6125 ? _wd6126 : (_t6537 === _wc6123 ? _wd6124 : (b.grid[_t6537] || -1))) === 1);
                                          }
                                          if (!(_c6538)) continue;
                                          if (!_g6510.includes(v_x)) _g6510.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6539 = union(_g6505, _g6510);
                                    for (let _i6540 = 0; _i6540 < _a6539.length; _i6540++) {
                                      const v_p = _a6539[_i6540];
                                      const _h6577 = clueAt(cl.number, v_p);
                                      _g6541.length = 0;
                                      G6542: {
                                        for (let _i6544 = 0; _i6544 < 1; _i6544++) {
                                          const v_x = v_y;
                                          const _h6545 = clueAt(cl.number, v_x);
                                          if (!((_h6545 !== -1))) continue;
                                          _g6541.push(v_x);
                                        }
                                      }
                                      _g6546.length = 0;
                                      G6547: {
                                        const _a6564 = throughWhere(sp, v_y, (_te6559: number): boolean => { let _c6561: boolean = ((_te6559 === _wc6125 ? _wd6126 : (_te6559 === _wc6123 ? _wd6124 : (b.grid[_te6559] || -1))) === 1); if (_c6561) {   const _t6560 = sp.edgeEnds[2 * _te6559];   _c6561 = !((clueAt(cl.number, _t6560) !== -1)); } let _c6563: boolean = _c6561; if (_c6563) {   const _t6562 = sp.edgeEnds[2 * _te6559 + 1];   _c6563 = !((clueAt(cl.number, _t6562) !== -1)); } return _c6563; });
                                        for (let _i6565 = 0; _i6565 < _a6564.length; _i6565++) {
                                          const v_t = _a6564[_i6565];
                                          const _h6568 = clueAt(cl.number, v_t);
                                          const _h6569 = (_h6568 !== -1);
                                          const _h6570 = _h6569;
                                          const _h6571 = !(_h6570);
                                          const _a6566 = sp.adj4[v_t];
                                          for (let _i6567 = 0; _i6567 < _a6566.length; _i6567++) {
                                            const v_x = _a6566[_i6567];
                                            const _h6572 = clueAt(cl.number, v_x);
                                            let _c6574: boolean = (_h6571 && (_h6572 !== -1));
                                            if (_c6574) {
                                              const _t6573 = sp.adj4Edges[v_t][_i6567];
                                              _c6574 = ((_t6573 === _wc6125 ? _wd6126 : (_t6573 === _wc6123 ? _wd6124 : (b.grid[_t6573] || -1))) === 1);
                                            }
                                            if (!(_c6574)) continue;
                                            if (!_g6546.includes(v_x)) _g6546.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6575 = union(_g6541, _g6546);
                                      for (let _i6576 = 0; _i6576 < _a6575.length; _i6576++) {
                                        const v_q = _a6575[_i6576];
                                        const _h6578 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6577 - _h6578)) === cl.step))) {
                                          _q6503 = false;
                                          break Q6504;
                                        }
                                      }
                                    }
                                  }
                                  _c6579 = _q6503;
                                }
                                if (!((_c6579 && (_h5014 || !(throughWhere(sp, v_s, (_te6580: number): boolean => {  return ((_te6580 === _wc6125 ? _wd6126 : (_te6580 === _wc6123 ? _wd6124 : (b.grid[_te6580] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g6581 = 0;
                                G6582: {
                                  const _a6583 = sp.adj4[v_s];
                                  for (let _i6584 = 0; _i6584 < _a6583.length; _i6584++) {
                                    const _t6585 = sp.adj4Edges[v_s][_i6584];
                                    if (!(((_t6585 === _wc6125 ? _wd6126 : (_t6585 === _wc6123 ? _wd6124 : (b.grid[_t6585] || -1))) === 1))) continue;
                                    _g6581++;
                                  }
                                }
                                let _g6586 = 0;
                                G6587: {
                                  for (let _i6588 = 0; _i6588 < 1; _i6588++) {
                                    const v_k = v_s;
                                    const _h6589 = clueAt(cl.number, v_k);
                                    const _h6596 = (_h6589 + 1);
                                    let _c6598: boolean = (_h6589 !== -1);
                                    if (_c6598) {
                                      let _c6597: boolean = (_h5014 || (_h6589 === 1));
                                      if (!_c6597) {
                                        let _g6590 = 0;
                                        G6591: {
                                          const _t6592 = (_h6589 + 1);
                                          const _a6593 = cluesValued(cl.number, _t6592);
                                          for (let _i6594 = 0; _i6594 < _a6593.length; _i6594++) {
                                            const v_x = _a6593[_i6594];
                                            const _h6595 = clueAt(cl.number, v_x);
                                            if (!((_h6595 === _h6596))) continue;
                                            _g6590++;
                                          }
                                        }
                                        _c6597 = (_g6590 === 0);
                                      }
                                      _c6598 = _c6597;
                                    }
                                    if (!(_c6598)) continue;
                                    _g6586++;
                                  }
                                }
                                let _c6721: boolean = ((_g6581 + 1) === (2 - _g6586));
                                if (!_c6721) {
                                  let _q6599 = false;
                                  Q6600: {
                                    const _a6601 = sp.adj4[v_s];
                                    const _n6602 = _i6462;
                                    for (let _i6603 = 0; _i6603 < _n6602; _i6603++) {
                                      const v_z = _a6601[_i6603];
                                      const _t6604 = sp.adj4Edges[v_s][_i6603];
                                      let _c6623: boolean = !((_t6604 === _wc6125 ? true : (_t6604 === _wc6123 ? true : (b.grid[_t6604] !== 0))));
                                      if (_c6623) {
                                        let _g6605 = 0;
                                        G6606: {
                                          const _a6607 = sp.adj4[v_s];
                                          for (let _i6608 = 0; _i6608 < _a6607.length; _i6608++) {
                                            const _t6609 = sp.adj4Edges[v_s][_i6608];
                                            if (!(((_t6609 === _wc6125 ? _wd6126 : (_t6609 === _wc6123 ? _wd6124 : (b.grid[_t6609] || -1))) === 1))) continue;
                                            _g6605++;
                                          }
                                        }
                                        let _g6610 = 0;
                                        G6611: {
                                          for (let _i6612 = 0; _i6612 < 1; _i6612++) {
                                            const v_k = v_s;
                                            const _h6613 = clueAt(cl.number, v_k);
                                            const _h6620 = (_h6613 + 1);
                                            let _c6622: boolean = (_h6613 !== -1);
                                            if (_c6622) {
                                              let _c6621: boolean = (_h5014 || (_h6613 === 1));
                                              if (!_c6621) {
                                                let _g6614 = 0;
                                                G6615: {
                                                  const _t6616 = (_h6613 + 1);
                                                  const _a6617 = cluesValued(cl.number, _t6616);
                                                  for (let _i6618 = 0; _i6618 < _a6617.length; _i6618++) {
                                                    const v_x = _a6617[_i6618];
                                                    const _h6619 = clueAt(cl.number, v_x);
                                                    if (!((_h6619 === _h6620))) continue;
                                                    _g6614++;
                                                  }
                                                }
                                                _c6621 = (_g6614 === 0);
                                              }
                                              _c6622 = _c6621;
                                            }
                                            if (!(_c6622)) continue;
                                            _g6610++;
                                          }
                                        }
                                        _c6623 = (_g6605 < (2 - _g6610));
                                      }
                                      let _c6642: boolean = _c6623;
                                      if (_c6642) {
                                        let _g6624 = 0;
                                        G6625: {
                                          const _a6626 = sp.adj4[v_z];
                                          for (let _i6627 = 0; _i6627 < _a6626.length; _i6627++) {
                                            const _t6628 = sp.adj4Edges[v_z][_i6627];
                                            if (!(((_t6628 === _wc6125 ? _wd6126 : (_t6628 === _wc6123 ? _wd6124 : (b.grid[_t6628] || -1))) === 1))) continue;
                                            _g6624++;
                                          }
                                        }
                                        let _g6629 = 0;
                                        G6630: {
                                          for (let _i6631 = 0; _i6631 < 1; _i6631++) {
                                            const v_k = v_z;
                                            const _h6632 = clueAt(cl.number, v_k);
                                            const _h6639 = (_h6632 + 1);
                                            let _c6641: boolean = (_h6632 !== -1);
                                            if (_c6641) {
                                              let _c6640: boolean = (_h5014 || (_h6632 === 1));
                                              if (!_c6640) {
                                                let _g6633 = 0;
                                                G6634: {
                                                  const _t6635 = (_h6632 + 1);
                                                  const _a6636 = cluesValued(cl.number, _t6635);
                                                  for (let _i6637 = 0; _i6637 < _a6636.length; _i6637++) {
                                                    const v_x = _a6636[_i6637];
                                                    const _h6638 = clueAt(cl.number, v_x);
                                                    if (!((_h6638 === _h6639))) continue;
                                                    _g6633++;
                                                  }
                                                }
                                                _c6640 = (_g6633 === 0);
                                              }
                                              _c6641 = _c6640;
                                            }
                                            if (!(_c6641)) continue;
                                            _g6629++;
                                          }
                                        }
                                        _c6642 = (_g6624 < (2 - _g6629));
                                      }
                                      let _c6719: boolean = _c6642;
                                      if (_c6719) {
                                        let _q6643 = true;
                                        Q6644: {
                                          _g6645.length = 0;
                                          G6646: {
                                            for (let _i6648 = 0; _i6648 < 1; _i6648++) {
                                              const v_x = v_s;
                                              const _h6649 = clueAt(cl.number, v_x);
                                              if (!((_h6649 !== -1))) continue;
                                              _g6645.push(v_x);
                                            }
                                          }
                                          _g6650.length = 0;
                                          G6651: {
                                            const _a6668 = throughWhere(sp, v_s, (_te6663: number): boolean => { let _c6665: boolean = ((_te6663 === _wc6125 ? _wd6126 : (_te6663 === _wc6123 ? _wd6124 : (b.grid[_te6663] || -1))) === 1); if (_c6665) {   const _t6664 = sp.edgeEnds[2 * _te6663];   _c6665 = !((clueAt(cl.number, _t6664) !== -1)); } let _c6667: boolean = _c6665; if (_c6667) {   const _t6666 = sp.edgeEnds[2 * _te6663 + 1];   _c6667 = !((clueAt(cl.number, _t6666) !== -1)); } return _c6667; });
                                            for (let _i6669 = 0; _i6669 < _a6668.length; _i6669++) {
                                              const v_t = _a6668[_i6669];
                                              const _h6672 = clueAt(cl.number, v_t);
                                              const _h6673 = (_h6672 !== -1);
                                              const _h6674 = _h6673;
                                              const _h6675 = !(_h6674);
                                              const _a6670 = sp.adj4[v_t];
                                              for (let _i6671 = 0; _i6671 < _a6670.length; _i6671++) {
                                                const v_x = _a6670[_i6671];
                                                const _h6676 = clueAt(cl.number, v_x);
                                                let _c6678: boolean = (_h6675 && (_h6676 !== -1));
                                                if (_c6678) {
                                                  const _t6677 = sp.adj4Edges[v_t][_i6671];
                                                  _c6678 = ((_t6677 === _wc6125 ? _wd6126 : (_t6677 === _wc6123 ? _wd6124 : (b.grid[_t6677] || -1))) === 1);
                                                }
                                                if (!(_c6678)) continue;
                                                if (!_g6650.includes(v_x)) _g6650.push(v_x);
                                              }
                                            }
                                          }
                                          const _a6679 = union(_g6645, _g6650);
                                          for (let _i6680 = 0; _i6680 < _a6679.length; _i6680++) {
                                            const v_p = _a6679[_i6680];
                                            const _h6717 = clueAt(cl.number, v_p);
                                            _g6681.length = 0;
                                            G6682: {
                                              for (let _i6684 = 0; _i6684 < 1; _i6684++) {
                                                const v_x = v_z;
                                                const _h6685 = clueAt(cl.number, v_x);
                                                if (!((_h6685 !== -1))) continue;
                                                _g6681.push(v_x);
                                              }
                                            }
                                            _g6686.length = 0;
                                            G6687: {
                                              const _a6704 = throughWhere(sp, v_z, (_te6699: number): boolean => { let _c6701: boolean = ((_te6699 === _wc6125 ? _wd6126 : (_te6699 === _wc6123 ? _wd6124 : (b.grid[_te6699] || -1))) === 1); if (_c6701) {   const _t6700 = sp.edgeEnds[2 * _te6699];   _c6701 = !((clueAt(cl.number, _t6700) !== -1)); } let _c6703: boolean = _c6701; if (_c6703) {   const _t6702 = sp.edgeEnds[2 * _te6699 + 1];   _c6703 = !((clueAt(cl.number, _t6702) !== -1)); } return _c6703; });
                                              for (let _i6705 = 0; _i6705 < _a6704.length; _i6705++) {
                                                const v_t = _a6704[_i6705];
                                                const _h6708 = clueAt(cl.number, v_t);
                                                const _h6709 = (_h6708 !== -1);
                                                const _h6710 = _h6709;
                                                const _h6711 = !(_h6710);
                                                const _a6706 = sp.adj4[v_t];
                                                for (let _i6707 = 0; _i6707 < _a6706.length; _i6707++) {
                                                  const v_x = _a6706[_i6707];
                                                  const _h6712 = clueAt(cl.number, v_x);
                                                  let _c6714: boolean = (_h6711 && (_h6712 !== -1));
                                                  if (_c6714) {
                                                    const _t6713 = sp.adj4Edges[v_t][_i6707];
                                                    _c6714 = ((_t6713 === _wc6125 ? _wd6126 : (_t6713 === _wc6123 ? _wd6124 : (b.grid[_t6713] || -1))) === 1);
                                                  }
                                                  if (!(_c6714)) continue;
                                                  if (!_g6686.includes(v_x)) _g6686.push(v_x);
                                                }
                                              }
                                            }
                                            const _a6715 = union(_g6681, _g6686);
                                            for (let _i6716 = 0; _i6716 < _a6715.length; _i6716++) {
                                              const v_q = _a6715[_i6716];
                                              const _h6718 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h6717 - _h6718)) === cl.step))) {
                                                _q6643 = false;
                                                break Q6644;
                                              }
                                            }
                                          }
                                        }
                                        _c6719 = _q6643;
                                      }
                                      if ((_c6719 && (_h5014 || !(throughWhere(sp, v_s, (_te6720: number): boolean => {  return ((_te6720 === _wc6125 ? _wd6126 : (_te6720 === _wc6123 ? _wd6124 : (b.grid[_te6720] || -1))) === 1); }).includes(v_z))))) {
                                        _q6599 = true;
                                        break Q6600;
                                      }
                                    }
                                  }
                                  _c6721 = _q6599;
                                }
                                if (_c6721) {
                                  _q6459 = true;
                                  break Q6460;
                                }
                              }
                            }
                            _c6722 = !(_q6459);
                          }
                          if (_c6722) {
                            _q6437 = true;
                            break Q6438;
                          }
                        }
                      }
                      _c6723 = _q6437;
                    }
                    if (_c6723) {
                      _q6127 = true;
                      break Q6128;
                    }
                  }
                }
                _c6724 = _q6127;
              }
              _c6725 = _c6724;
            }
            if (!(_c6725)) continue;
            const _t6727 = minus(v_U, setOf(_h6726, v_i, v_j));
            const _t6728 = (_t6727.length > 0 ? _t6727[0] : -1);
            if (!_g5600.includes(_t6728)) _g5600.push(_t6728);
          }
        }
      }
      const v_B = _g5600;
      const _h6763 = v_B.length;
      const _h6764 = (_h6763 === 3);
      _g6729.length = 0;
      G6730: {
        const _a6740 = v_U;
        for (let _i6741 = 0; _i6741 < _a6740.length; _i6741++) {
          const v_y = _a6740[_i6741];
          let _c6750: boolean = ((_i6741 === 0) && _h6743);
          if (!_c6750) {
            let _c6749: boolean = (_i6741 > 0);
            if (_c6749) {
              let _c6748: boolean = !(v_A.includes(v_y));
              if (!_c6748) {
                let _q6744 = false;
                Q6745: {
                  const _a6746 = v_U;
                  for (let _i6747 = 0; _i6747 < _a6746.length; _i6747++) {
                    const v_m = _a6746[_i6747];
                    if (!(((_i6747 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q6744 = true;
                      break Q6745;
                    }
                  }
                }
                _c6748 = _q6744;
              }
              _c6749 = _c6748;
            }
            _c6750 = _c6749;
          }
          if (!(_c6750)) continue;
          _g6729.push(v_y);
        }
      }
      const v_N = _g6729;
      const _h6772 = v_N.length;
      _g6751.length = 0;
      G6752: {
        const _a6761 = v_N;
        for (let _i6762 = 0; _i6762 < _a6761.length; _i6762++) {
          const v_y = _a6761[_i6762];
          let _c6770: boolean = ((v_U.indexOf(v_y) === 0) && _h6764);
          if (!_c6770) {
            let _c6769: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c6769) {
              let _q6765 = true;
              Q6766: {
                const _a6767 = v_U;
                for (let _i6768 = 0; _i6768 < _a6767.length; _i6768++) {
                  const v_m = _a6767[_i6768];
                  if (!(((_i6768 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q6765 = false;
                    break Q6766;
                  }
                }
              }
              _c6769 = _q6765;
            }
            _c6770 = _c6769;
          }
          if (!(_c6770)) continue;
          _g6751.push(v_y);
        }
      }
      const v_P = _g6751;
      const _h6773 = v_P.length;
      L6771: {
        const v_X = minus(v_U, v_N);
        const _h6774 = v_X.length;
        if (!((((_h6772 === 0) || (_h6773 > 0)) || (_h6774 > 0)))) break L6771;
        facts.length = 0;
        changed = false;
        let _c6780: boolean = (_h6772 > 0);
        if (_c6780) {
          let _q6775 = true;
          Q6776: {
            const _a6777 = v_P;
            for (let _i6778 = 0; _i6778 < _a6777.length; _i6778++) {
              const v_y = _a6777[_i6778];
              const _t6779 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t6779] !== 0)) { if (fire === null) { b.placeAt(_t6779, 1); changed = true; } else facts.push(PLACE, _t6779, 1); }
              if (!(true)) {
                _q6775 = false;
                break Q6776;
              }
            }
          }
          _c6780 = _q6775;
        }
        let _c6787: boolean = _c6780;
        if (_c6787) {
          let _c6786: boolean = !((_h6773 === 0));
          if (!_c6786) {
            let _q6781 = true;
            Q6782: {
              const _a6783 = v_X;
              for (let _i6784 = 0; _i6784 < _a6783.length; _i6784++) {
                const v_y = _a6783[_i6784];
                const _t6785 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t6785] !== 0)) { if (fire === null) { b.placeAt(_t6785, 2); changed = true; } else facts.push(PLACE, _t6785, 2); }
                if (!(true)) {
                  _q6781 = false;
                  break Q6782;
                }
              }
            }
            _c6786 = _q6781;
          }
          _c6787 = _c6786;
        }
        if (!(_c6787)) return -1;
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

/** `takes(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function takes(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = takesKept.board(cl);
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
  const _made = throughWhere(sp, v_c, (_te83: number): boolean => {  return ((b.grid[_te83] || -1) === 1); });
  _kept[v_c] = _made;
  return _made;
}

const meetsMarkedKept = new Map<number, boolean>();

/** `meets(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetsMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _q87 = true;
  Q88: {
    const _a89 = nearest(b, sp, cl, v_a);
    for (let _i90 = 0; _i90 < _a89.length; _i90++) {
      const v_p = _a89[_i90];
      const _a91 = nearest(b, sp, cl, v_b);
      for (let _i92 = 0; _i92 < _a91.length; _i92++) {
        const v_q = _a91[_i92];
        if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
          _q87 = false;
          break Q88;
        }
      }
    }
  }
  const _made = _q87;
  meetsMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const liveMarkedKept = new Map<number, boolean>();

/** `live(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function liveMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = liveMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  const _made = ((((!((b.grid[sp.edgeOf(v_a, v_b)] !== 0)) && spare(b, sp, cl, v_a)) && spare(b, sp, cl, v_b)) && meetsMarked(b, sp, cl, cands, v_a, v_b)) && ((cl.step === 0) || !(throughWhere(sp, v_a, (_te103: number): boolean => {  return ((b.grid[_te103] || -1) === 1); }).includes(v_b))));
  liveMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}
