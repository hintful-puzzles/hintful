// Compiled by `npm run describe` from src/games/path/path.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, freshBinding, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, stamps, throughWhere, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g10000: number[] = [];
  const _g10005: number[] = [];
  const _st10016 = stamps();
  const _g10066: number[] = [];
  const _g10071: number[] = [];
  const _st10082 = stamps();
  const _domain = rangeMask(1, 2);
  const _k9994 = takesKept.board(cl);
  const _h10049 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q9985 = true;
  Q9986: {
    const _a9987 = sp.cells;
    for (let _i9988 = 0; _i9988 < _a9987.length; _i9988++) {
      const v_c = _a9987[_i9988];
      let _g9989 = 0;
      G9990: {
        const _a9991 = sp.adj4[v_c];
        for (let _i9992 = 0; _i9992 < _a9991.length; _i9992++) {
          const _h9993 = (g[sp.adj4Edges[v_c][_i9992]] || -1);
          if (!((_h9993 === 1))) continue;
          _g9989++;
        }
      }
      if (!((_g9989 === (_k9994[v_c] ?? takes(sp, cl, v_c))))) {
        _q9985 = false;
        break Q9986;
      }
    }
  }
  if (!(_q9985)) return false;
  let _q9995 = true;
  Q9996: {
    const _a9997 = sp.cells;
    for (let _i9998 = 0; _i9998 < _a9997.length; _i9998++) {
      const v_c = _a9997[_i9998];
      const _h9999 = clueAt(cl.number, v_c);
      if (!(!((_h9999 !== -1)))) continue;
      _g10000.length = 0;
      G10001: {
        for (let _i10003 = 0; _i10003 < 1; _i10003++) {
          const v_x = v_c;
          const _h10004 = clueAt(cl.number, v_x);
          if (!((_h10004 !== -1))) continue;
          _g10000.push(v_x);
        }
      }
      _g10005.length = 0;
      _st10016.pass++;
      G10006: {
        const _a10022 = throughWhere(sp, v_c, (_te10017: number): boolean => { let _c10019: boolean = ((g[_te10017] || -1) === 1); if (_c10019) {   const _t10018 = sp.edgeEnds[2 * _te10017];   _c10019 = !((clueAt(cl.number, _t10018) !== -1)); } let _c10021: boolean = _c10019; if (_c10021) {   const _t10020 = sp.edgeEnds[2 * _te10017 + 1];   _c10021 = !((clueAt(cl.number, _t10020) !== -1)); } return _c10021; });
        for (let _i10023 = 0; _i10023 < _a10022.length; _i10023++) {
          const v_t = _a10022[_i10023];
          const _h10026 = clueAt(cl.number, v_t);
          const _h10027 = (_h10026 !== -1);
          const _h10028 = _h10027;
          const _h10029 = !(_h10028);
          const _a10024 = sp.adj4[v_t];
          for (let _i10025 = 0; _i10025 < _a10024.length; _i10025++) {
            const v_x = _a10024[_i10025];
            const _h10030 = clueAt(cl.number, v_x);
            const _h10031 = (g[sp.adj4Edges[v_t][_i10025]] || -1);
            if (!(((_h10029 && (_h10030 !== -1)) && (_h10031 === 1)))) continue;
            const _t10032 = v_x;
            if (_g10005.length < 16) { if (!_g10005.includes(_t10032)) _g10005.push(_t10032); } else addOnce(_g10005, _st10016, _t10032);
          }
        }
      }
      if (!((union(_g10000, _g10005).length === 2))) {
        _q9995 = false;
        break Q9996;
      }
    }
  }
  if (!(_q9995)) return false;
  let _c10038: boolean = (cl.step === 0);
  if (!_c10038) {
    let _q10033 = false;
    Q10034: {
      const _a10035 = sp.cells;
      for (let _i10036 = 0; _i10036 < _a10035.length; _i10036++) {
        const v_x = _a10035[_i10036];
        const _h10037 = clueAt(cl.number, v_x);
        if ((_h10037 === 2)) {
          _q10033 = true;
          break Q10034;
        }
      }
    }
    _c10038 = _q10033;
  }
  let _c10058: boolean = _c10038;
  if (_c10058) {
    let _q10039 = true;
    Q10040: {
      const _a10041 = sp.cells;
      for (let _i10042 = 0; _i10042 < _a10041.length; _i10042++) {
        const v_x = _a10041[_i10042];
        const _h10043 = clueAt(cl.number, v_x);
        if (!((_h10043 !== -1))) continue;
        const _h10055 = (_h10043 - 1);
        let _g10044 = 0;
        G10045: {
          const _a10046 = cluesValued(cl.number, _h10043);
          for (let _i10047 = 0; _i10047 < _a10046.length; _i10047++) {
            const v_y = _a10046[_i10047];
            const _h10048 = clueAt(cl.number, v_y);
            if (!((_h10048 === _h10043))) continue;
            _g10044++;
          }
        }
        let _c10057: boolean = (_g10044 === _h10049);
        if (_c10057) {
          let _c10056: boolean = (_h10043 === 1);
          if (!_c10056) {
            let _q10050 = false;
            Q10051: {
              const _a10052 = sp.cells;
              for (let _i10053 = 0; _i10053 < _a10052.length; _i10053++) {
                const v_y = _a10052[_i10053];
                const _h10054 = clueAt(cl.number, v_y);
                if ((_h10054 === _h10055)) {
                  _q10050 = true;
                  break Q10051;
                }
              }
            }
            _c10056 = _q10050;
          }
          _c10057 = _c10056;
        }
        if (!(_c10057)) {
          _q10039 = false;
          break Q10040;
        }
      }
    }
    _c10058 = _q10039;
  }
  if (!(_c10058)) return false;
  for (let _k10059 = 0; _k10059 < cl.number.at.length; _k10059++) {
    const _at10060 = cl.number.at[_k10059];
    let _q10062 = true;
    Q10063: {
      const _a10064 = sp.adj4[_at10060];
      for (let _i10065 = 0; _i10065 < _a10064.length; _i10065++) {
        const v_y = _a10064[_i10065];
        if (!(((g[sp.adj4Edges[_at10060][_i10065]] || -1) === 1))) continue;
        _g10066.length = 0;
        G10067: {
          for (let _i10069 = 0; _i10069 < 1; _i10069++) {
            const v_x = v_y;
            const _h10070 = clueAt(cl.number, v_x);
            if (!((_h10070 !== -1))) continue;
            _g10066.push(v_x);
          }
        }
        _g10071.length = 0;
        _st10082.pass++;
        G10072: {
          const _a10088 = throughWhere(sp, v_y, (_te10083: number): boolean => { let _c10085: boolean = ((g[_te10083] || -1) === 1); if (_c10085) {   const _t10084 = sp.edgeEnds[2 * _te10083];   _c10085 = !((clueAt(cl.number, _t10084) !== -1)); } let _c10087: boolean = _c10085; if (_c10087) {   const _t10086 = sp.edgeEnds[2 * _te10083 + 1];   _c10087 = !((clueAt(cl.number, _t10086) !== -1)); } return _c10087; });
          for (let _i10089 = 0; _i10089 < _a10088.length; _i10089++) {
            const v_t = _a10088[_i10089];
            const _h10092 = clueAt(cl.number, v_t);
            const _h10093 = (_h10092 !== -1);
            const _h10094 = _h10093;
            const _h10095 = !(_h10094);
            const _a10090 = sp.adj4[v_t];
            for (let _i10091 = 0; _i10091 < _a10090.length; _i10091++) {
              const v_x = _a10090[_i10091];
              const _h10096 = clueAt(cl.number, v_x);
              const _h10097 = (g[sp.adj4Edges[v_t][_i10091]] || -1);
              if (!(((_h10095 && (_h10096 !== -1)) && (_h10097 === 1)))) continue;
              const _t10098 = v_x;
              if (_g10071.length < 16) { if (!_g10071.includes(_t10098)) _g10071.push(_t10098); } else addOnce(_g10071, _st10082, _t10098);
            }
          }
        }
        const _a10099 = union(_g10066, _g10071);
        for (let _i10100 = 0; _i10100 < _a10099.length; _i10100++) {
          const v_q = _a10099[_i10100];
          if (!((v_q !== _at10060))) continue;
          const _h10102 = clueAt(cl.number, v_q);
          const _h10101 = clueAt(cl.number, _at10060);
          if (!((Math.abs((_h10101 - _h10102)) === cl.step))) {
            _q10062 = false;
            break Q10063;
          }
        }
      }
    }
    if (!(_q10062)) return false;
  }
  for (let _k10103 = 0; _k10103 < cl.wall.at.length; _k10103++) {
    const _at10104 = cl.wall.at[_k10103];
    if (!(((g[_at10104] || -1) === 2))) return false;
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
    const _h89 = clueAt(cl.number, v_c);
    const _h90 = (_h89 !== -1);
    const _h91 = _h90;
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
      if (import.meta.env.DEV && staleChecking) {
        let _g77 = 0;
        G78: {
          const _a79 = sp.adj4[v_c];
          for (let _i80 = 0; _i80 < _a79.length; _i80++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i80]] || -1) === 1))) continue;
            _g77++;
          }
        }
        freshBinding("forced", [(sp.cells.includes(v_c)), (v_n === (takes(sp, cl, v_c) - _g77)), sameSet(v_U, ways(b, sp, cl, v_c)), ((v_n < 0) || ((v_n > 0) && (v_U.length <= v_n)))], ["c in", "n =", "U =", "where of U"]);
      }
      facts.length = 0;
      changed = false;
      let _c98: boolean = ((v_n >= 0) && (_h76 === v_n));
      if (_c98) {
        let _q81 = true;
        Q82: {
          const _a83 = v_U;
          for (let _i84 = 0; _i84 < _a83.length; _i84++) {
            const v_i = _a83[_i84];
            const _a85 = v_U;
            const _n86 = _i84;
            for (let _i87 = 0; _i87 < _n86; _i87++) {
              const v_j = _a85[_i87];
              if (!((!(piece(b, sp, v_i).includes(v_j)) && (_h91 || meetsMarked(b, sp, cl, cands, v_i, v_j))))) {
                _q81 = false;
                break Q82;
              }
            }
          }
        }
        _c98 = _q81;
      }
      let _c104: boolean = _c98;
      if (_c104) {
        let _q99 = true;
        Q100: {
          const _a101 = v_U;
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_y = _a101[_i102];
            const _t103 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t103] !== 0)) { if (fire === null) { b.placeAt(_t103, 1); changed = true; } else facts.push(PLACE, _t103, 1); }
            if (!(true)) {
              _q99 = false;
              break Q100;
            }
          }
        }
        _c104 = _q99;
      }
      if (!(_c104)) return -1;
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
const _st730 = stamps();
const _st769 = stamps();
const _st876 = stamps();
const _st915 = stamps();
const _st1027 = stamps();
const _st1065 = stamps();
const _st1171 = stamps();
const _st1209 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const _g711: number[] = [];
  const _g716: number[] = [];
  const _g751: number[] = [];
  const _g756: number[] = [];
  const _g857: number[] = [];
  const _g862: number[] = [];
  const _g897: number[] = [];
  const _g902: number[] = [];
  const _g1009: number[] = [];
  const _g1014: number[] = [];
  const _g1047: number[] = [];
  const _g1052: number[] = [];
  const _g1153: number[] = [];
  const _g1158: number[] = [];
  const _g1191: number[] = [];
  const _g1196: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h636 = (cl.step === 0);
  if (lineBreaksCands.length < sp.edges.length) lineBreaksCands = new Int32Array(sp.edges.length);
  const cands = lineBreaksCands;
  cands.fill(-1);
  liveMarkedKept.clear();
  meetsMarkedKept.clear();
  const _a616 = sp.edges;
  for (let _i617 = 0; _i617 < _a616.length; _i617++) {
    const v_e = _a616[_i617];
    const v_a = sp.edgeEnds[2 * v_e];
    L618: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c1237: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
      if (_c1237) {
        let _c1236: boolean = (throughWhere(sp, v_a, (_te619: number): boolean => {  return ((b.grid[_te619] || -1) === 1); }).includes(v_b));
        if (!_c1236) {
          const _wc620 = v_e;
          const _wd621 = 1;
          let _q622 = false;
          Q623: {
            const _a625 = throughWhere(sp, v_a, (_te624: number): boolean => {  return ((_te624 === _wc620 ? _wd621 : (b.grid[_te624] || -1)) === 1); });
            for (let _i626 = 0; _i626 < _a625.length; _i626++) {
              const v_t = _a625[_i626];
              let _c646: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c646) {
                let _g627 = 0;
                G628: {
                  const _a629 = sp.adj4[v_t];
                  for (let _i630 = 0; _i630 < _a629.length; _i630++) {
                    const _t631 = sp.adj4Edges[v_t][_i630];
                    if (!(((_t631 === _wc620 ? _wd621 : (b.grid[_t631] || -1)) === 1))) continue;
                    _g627++;
                  }
                }
                let _g632 = 0;
                G633: {
                  for (let _i634 = 0; _i634 < 1; _i634++) {
                    const v_k = v_t;
                    const _h635 = clueAt(cl.number, v_k);
                    const _h643 = (_h635 + 1);
                    let _c645: boolean = (_h635 !== -1);
                    if (_c645) {
                      let _c644: boolean = (_h636 || (_h635 === 1));
                      if (!_c644) {
                        let _g637 = 0;
                        G638: {
                          const _t639 = (_h635 + 1);
                          const _a640 = cluesValued(cl.number, _t639);
                          for (let _i641 = 0; _i641 < _a640.length; _i641++) {
                            const v_x = _a640[_i641];
                            const _h642 = clueAt(cl.number, v_x);
                            if (!((_h642 === _h643))) continue;
                            _g637++;
                          }
                        }
                        _c644 = (_g637 === 0);
                      }
                      _c645 = _c644;
                    }
                    if (!(_c645)) continue;
                    _g632++;
                  }
                }
                _c646 = (_g627 < (2 - _g632));
              }
              if (!(_c646)) continue;
              let _g647 = 0;
              G648: {
                const _a649 = sp.adj4[v_t];
                for (let _i650 = 0; _i650 < _a649.length; _i650++) {
                  const _t651 = sp.adj4Edges[v_t][_i650];
                  if (!(((_t651 === _wc620 ? _wd621 : (b.grid[_t651] || -1)) === 1))) continue;
                  _g647++;
                }
              }
              let _g652 = 0;
              G653: {
                for (let _i654 = 0; _i654 < 1; _i654++) {
                  const v_k = v_t;
                  const _h655 = clueAt(cl.number, v_k);
                  const _h662 = (_h655 + 1);
                  let _c664: boolean = (_h655 !== -1);
                  if (_c664) {
                    let _c663: boolean = (_h636 || (_h655 === 1));
                    if (!_c663) {
                      let _g656 = 0;
                      G657: {
                        const _t658 = (_h655 + 1);
                        const _a659 = cluesValued(cl.number, _t658);
                        for (let _i660 = 0; _i660 < _a659.length; _i660++) {
                          const v_x = _a659[_i660];
                          const _h661 = clueAt(cl.number, v_x);
                          if (!((_h661 === _h662))) continue;
                          _g656++;
                        }
                      }
                      _c663 = (_g656 === 0);
                    }
                    _c664 = _c663;
                  }
                  if (!(_c664)) continue;
                  _g652++;
                }
              }
              let _c940: boolean = (_g647 < (2 - _g652));
              if (_c940) {
                let _q665 = false;
                Q666: {
                  const _a667 = sp.adj4[v_t];
                  for (let _i668 = 0; _i668 < _a667.length; _i668++) {
                    const v_y = _a667[_i668];
                    const _t669 = sp.adj4Edges[v_t][_i668];
                    let _c688: boolean = !((_t669 === _wc620 ? true : (b.grid[_t669] !== 0)));
                    if (_c688) {
                      let _g670 = 0;
                      G671: {
                        const _a672 = sp.adj4[v_t];
                        for (let _i673 = 0; _i673 < _a672.length; _i673++) {
                          const _t674 = sp.adj4Edges[v_t][_i673];
                          if (!(((_t674 === _wc620 ? _wd621 : (b.grid[_t674] || -1)) === 1))) continue;
                          _g670++;
                        }
                      }
                      let _g675 = 0;
                      G676: {
                        for (let _i677 = 0; _i677 < 1; _i677++) {
                          const v_k = v_t;
                          const _h678 = clueAt(cl.number, v_k);
                          const _h685 = (_h678 + 1);
                          let _c687: boolean = (_h678 !== -1);
                          if (_c687) {
                            let _c686: boolean = (_h636 || (_h678 === 1));
                            if (!_c686) {
                              let _g679 = 0;
                              G680: {
                                const _t681 = (_h678 + 1);
                                const _a682 = cluesValued(cl.number, _t681);
                                for (let _i683 = 0; _i683 < _a682.length; _i683++) {
                                  const v_x = _a682[_i683];
                                  const _h684 = clueAt(cl.number, v_x);
                                  if (!((_h684 === _h685))) continue;
                                  _g679++;
                                }
                              }
                              _c686 = (_g679 === 0);
                            }
                            _c687 = _c686;
                          }
                          if (!(_c687)) continue;
                          _g675++;
                        }
                      }
                      _c688 = (_g670 < (2 - _g675));
                    }
                    let _c708: boolean = _c688;
                    if (_c708) {
                      let _g689 = 0;
                      G690: {
                        const _a692 = sp.adj4[v_y];
                        for (let _i693 = 0; _i693 < _a692.length; _i693++) {
                          const _t694 = sp.adj4Edges[v_y][_i693];
                          if (!(((_t694 === _wc620 ? _wd621 : (b.grid[_t694] || -1)) === 1))) continue;
                          _g689++;
                        }
                      }
                      let _g695 = 0;
                      G696: {
                        for (let _i697 = 0; _i697 < 1; _i697++) {
                          const v_k = v_y;
                          const _h698 = clueAt(cl.number, v_k);
                          const _h705 = (_h698 + 1);
                          let _c707: boolean = (_h698 !== -1);
                          if (_c707) {
                            let _c706: boolean = (_h636 || (_h698 === 1));
                            if (!_c706) {
                              let _g699 = 0;
                              G700: {
                                const _t701 = (_h698 + 1);
                                const _a702 = cluesValued(cl.number, _t701);
                                for (let _i703 = 0; _i703 < _a702.length; _i703++) {
                                  const v_x = _a702[_i703];
                                  const _h704 = clueAt(cl.number, v_x);
                                  if (!((_h704 === _h705))) continue;
                                  _g699++;
                                }
                              }
                              _c706 = (_g699 === 0);
                            }
                            _c707 = _c706;
                          }
                          if (!(_c707)) continue;
                          _g695++;
                        }
                      }
                      _c708 = (_g689 < (2 - _g695));
                    }
                    let _c791: boolean = _c708;
                    if (_c791) {
                      let _q709 = true;
                      Q710: {
                        _g711.length = 0;
                        G712: {
                          for (let _i714 = 0; _i714 < 1; _i714++) {
                            const v_x = v_t;
                            const _h715 = clueAt(cl.number, v_x);
                            if (!((_h715 !== -1))) continue;
                            _g711.push(v_x);
                          }
                        }
                        _g716.length = 0;
                        _st730.pass++;
                        G717: {
                          const _a737 = throughWhere(sp, v_t, (_te732: number): boolean => { let _c734: boolean = ((_te732 === _wc620 ? _wd621 : (b.grid[_te732] || -1)) === 1); if (_c734) {   const _t733 = sp.edgeEnds[2 * _te732];   _c734 = !((clueAt(cl.number, _t733) !== -1)); } let _c736: boolean = _c734; if (_c736) {   const _t735 = sp.edgeEnds[2 * _te732 + 1];   _c736 = !((clueAt(cl.number, _t735) !== -1)); } return _c736; });
                          for (let _i738 = 0; _i738 < _a737.length; _i738++) {
                            const v_t_731 = _a737[_i738];
                            const _h741 = clueAt(cl.number, v_t_731);
                            const _h742 = (_h741 !== -1);
                            const _h743 = _h742;
                            const _h744 = !(_h743);
                            const _a739 = sp.adj4[v_t_731];
                            for (let _i740 = 0; _i740 < _a739.length; _i740++) {
                              const v_x = _a739[_i740];
                              const _h745 = clueAt(cl.number, v_x);
                              let _c747: boolean = (_h744 && (_h745 !== -1));
                              if (_c747) {
                                const _t746 = sp.adj4Edges[v_t_731][_i740];
                                _c747 = ((_t746 === _wc620 ? _wd621 : (b.grid[_t746] || -1)) === 1);
                              }
                              if (!(_c747)) continue;
                              const _t748 = v_x;
                              if (_g716.length < 16) { if (!_g716.includes(_t748)) _g716.push(_t748); } else addOnce(_g716, _st730, _t748);
                            }
                          }
                        }
                        const _a749 = union(_g711, _g716);
                        for (let _i750 = 0; _i750 < _a749.length; _i750++) {
                          const v_p = _a749[_i750];
                          const _h789 = clueAt(cl.number, v_p);
                          _g751.length = 0;
                          G752: {
                            for (let _i754 = 0; _i754 < 1; _i754++) {
                              const v_x = v_y;
                              const _h755 = clueAt(cl.number, v_x);
                              if (!((_h755 !== -1))) continue;
                              _g751.push(v_x);
                            }
                          }
                          _g756.length = 0;
                          _st769.pass++;
                          G757: {
                            const _a775 = throughWhere(sp, v_y, (_te770: number): boolean => { let _c772: boolean = ((_te770 === _wc620 ? _wd621 : (b.grid[_te770] || -1)) === 1); if (_c772) {   const _t771 = sp.edgeEnds[2 * _te770];   _c772 = !((clueAt(cl.number, _t771) !== -1)); } let _c774: boolean = _c772; if (_c774) {   const _t773 = sp.edgeEnds[2 * _te770 + 1];   _c774 = !((clueAt(cl.number, _t773) !== -1)); } return _c774; });
                            for (let _i776 = 0; _i776 < _a775.length; _i776++) {
                              const v_t = _a775[_i776];
                              const _h779 = clueAt(cl.number, v_t);
                              const _h780 = (_h779 !== -1);
                              const _h781 = _h780;
                              const _h782 = !(_h781);
                              const _a777 = sp.adj4[v_t];
                              for (let _i778 = 0; _i778 < _a777.length; _i778++) {
                                const v_x = _a777[_i778];
                                const _h783 = clueAt(cl.number, v_x);
                                let _c785: boolean = (_h782 && (_h783 !== -1));
                                if (_c785) {
                                  const _t784 = sp.adj4Edges[v_t][_i778];
                                  _c785 = ((_t784 === _wc620 ? _wd621 : (b.grid[_t784] || -1)) === 1);
                                }
                                if (!(_c785)) continue;
                                const _t786 = v_x;
                                if (_g756.length < 16) { if (!_g756.includes(_t786)) _g756.push(_t786); } else addOnce(_g756, _st769, _t786);
                              }
                            }
                          }
                          const _a787 = union(_g751, _g756);
                          for (let _i788 = 0; _i788 < _a787.length; _i788++) {
                            const v_q = _a787[_i788];
                            const _h790 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h789 - _h790)) === cl.step))) {
                              _q709 = false;
                              break Q710;
                            }
                          }
                        }
                      }
                      _c791 = _q709;
                    }
                    if (!((_c791 && (_h636 || !(throughWhere(sp, v_t, (_te792: number): boolean => {  return ((_te792 === _wc620 ? _wd621 : (b.grid[_te792] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g793 = 0;
                    G794: {
                      const _a795 = sp.adj4[v_t];
                      for (let _i796 = 0; _i796 < _a795.length; _i796++) {
                        const _t797 = sp.adj4Edges[v_t][_i796];
                        if (!(((_t797 === _wc620 ? _wd621 : (b.grid[_t797] || -1)) === 1))) continue;
                        _g793++;
                      }
                    }
                    let _g798 = 0;
                    G799: {
                      for (let _i800 = 0; _i800 < 1; _i800++) {
                        const v_k = v_t;
                        const _h801 = clueAt(cl.number, v_k);
                        const _h808 = (_h801 + 1);
                        let _c810: boolean = (_h801 !== -1);
                        if (_c810) {
                          let _c809: boolean = (_h636 || (_h801 === 1));
                          if (!_c809) {
                            let _g802 = 0;
                            G803: {
                              const _t804 = (_h801 + 1);
                              const _a805 = cluesValued(cl.number, _t804);
                              for (let _i806 = 0; _i806 < _a805.length; _i806++) {
                                const v_x = _a805[_i806];
                                const _h807 = clueAt(cl.number, v_x);
                                if (!((_h807 === _h808))) continue;
                                _g802++;
                              }
                            }
                            _c809 = (_g802 === 0);
                          }
                          _c810 = _c809;
                        }
                        if (!(_c810)) continue;
                        _g798++;
                      }
                    }
                    let _c939: boolean = ((_g793 + 1) === (2 - _g798));
                    if (!_c939) {
                      let _q811 = false;
                      Q812: {
                        const _a813 = sp.adj4[v_t];
                        const _n814 = _i668;
                        for (let _i815 = 0; _i815 < _n814; _i815++) {
                          const v_z = _a813[_i815];
                          const _t816 = sp.adj4Edges[v_t][_i815];
                          let _c835: boolean = !((_t816 === _wc620 ? true : (b.grid[_t816] !== 0)));
                          if (_c835) {
                            let _g817 = 0;
                            G818: {
                              const _a819 = sp.adj4[v_t];
                              for (let _i820 = 0; _i820 < _a819.length; _i820++) {
                                const _t821 = sp.adj4Edges[v_t][_i820];
                                if (!(((_t821 === _wc620 ? _wd621 : (b.grid[_t821] || -1)) === 1))) continue;
                                _g817++;
                              }
                            }
                            let _g822 = 0;
                            G823: {
                              for (let _i824 = 0; _i824 < 1; _i824++) {
                                const v_k = v_t;
                                const _h825 = clueAt(cl.number, v_k);
                                const _h832 = (_h825 + 1);
                                let _c834: boolean = (_h825 !== -1);
                                if (_c834) {
                                  let _c833: boolean = (_h636 || (_h825 === 1));
                                  if (!_c833) {
                                    let _g826 = 0;
                                    G827: {
                                      const _t828 = (_h825 + 1);
                                      const _a829 = cluesValued(cl.number, _t828);
                                      for (let _i830 = 0; _i830 < _a829.length; _i830++) {
                                        const v_x = _a829[_i830];
                                        const _h831 = clueAt(cl.number, v_x);
                                        if (!((_h831 === _h832))) continue;
                                        _g826++;
                                      }
                                    }
                                    _c833 = (_g826 === 0);
                                  }
                                  _c834 = _c833;
                                }
                                if (!(_c834)) continue;
                                _g822++;
                              }
                            }
                            _c835 = (_g817 < (2 - _g822));
                          }
                          let _c854: boolean = _c835;
                          if (_c854) {
                            let _g836 = 0;
                            G837: {
                              const _a838 = sp.adj4[v_z];
                              for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                                const _t840 = sp.adj4Edges[v_z][_i839];
                                if (!(((_t840 === _wc620 ? _wd621 : (b.grid[_t840] || -1)) === 1))) continue;
                                _g836++;
                              }
                            }
                            let _g841 = 0;
                            G842: {
                              for (let _i843 = 0; _i843 < 1; _i843++) {
                                const v_k = v_z;
                                const _h844 = clueAt(cl.number, v_k);
                                const _h851 = (_h844 + 1);
                                let _c853: boolean = (_h844 !== -1);
                                if (_c853) {
                                  let _c852: boolean = (_h636 || (_h844 === 1));
                                  if (!_c852) {
                                    let _g845 = 0;
                                    G846: {
                                      const _t847 = (_h844 + 1);
                                      const _a848 = cluesValued(cl.number, _t847);
                                      for (let _i849 = 0; _i849 < _a848.length; _i849++) {
                                        const v_x = _a848[_i849];
                                        const _h850 = clueAt(cl.number, v_x);
                                        if (!((_h850 === _h851))) continue;
                                        _g845++;
                                      }
                                    }
                                    _c852 = (_g845 === 0);
                                  }
                                  _c853 = _c852;
                                }
                                if (!(_c853)) continue;
                                _g841++;
                              }
                            }
                            _c854 = (_g836 < (2 - _g841));
                          }
                          let _c937: boolean = _c854;
                          if (_c937) {
                            let _q855 = true;
                            Q856: {
                              _g857.length = 0;
                              G858: {
                                for (let _i860 = 0; _i860 < 1; _i860++) {
                                  const v_x = v_t;
                                  const _h861 = clueAt(cl.number, v_x);
                                  if (!((_h861 !== -1))) continue;
                                  _g857.push(v_x);
                                }
                              }
                              _g862.length = 0;
                              _st876.pass++;
                              G863: {
                                const _a883 = throughWhere(sp, v_t, (_te878: number): boolean => { let _c880: boolean = ((_te878 === _wc620 ? _wd621 : (b.grid[_te878] || -1)) === 1); if (_c880) {   const _t879 = sp.edgeEnds[2 * _te878];   _c880 = !((clueAt(cl.number, _t879) !== -1)); } let _c882: boolean = _c880; if (_c882) {   const _t881 = sp.edgeEnds[2 * _te878 + 1];   _c882 = !((clueAt(cl.number, _t881) !== -1)); } return _c882; });
                                for (let _i884 = 0; _i884 < _a883.length; _i884++) {
                                  const v_t_877 = _a883[_i884];
                                  const _h887 = clueAt(cl.number, v_t_877);
                                  const _h888 = (_h887 !== -1);
                                  const _h889 = _h888;
                                  const _h890 = !(_h889);
                                  const _a885 = sp.adj4[v_t_877];
                                  for (let _i886 = 0; _i886 < _a885.length; _i886++) {
                                    const v_x = _a885[_i886];
                                    const _h891 = clueAt(cl.number, v_x);
                                    let _c893: boolean = (_h890 && (_h891 !== -1));
                                    if (_c893) {
                                      const _t892 = sp.adj4Edges[v_t_877][_i886];
                                      _c893 = ((_t892 === _wc620 ? _wd621 : (b.grid[_t892] || -1)) === 1);
                                    }
                                    if (!(_c893)) continue;
                                    const _t894 = v_x;
                                    if (_g862.length < 16) { if (!_g862.includes(_t894)) _g862.push(_t894); } else addOnce(_g862, _st876, _t894);
                                  }
                                }
                              }
                              const _a895 = union(_g857, _g862);
                              for (let _i896 = 0; _i896 < _a895.length; _i896++) {
                                const v_p = _a895[_i896];
                                const _h935 = clueAt(cl.number, v_p);
                                _g897.length = 0;
                                G898: {
                                  for (let _i900 = 0; _i900 < 1; _i900++) {
                                    const v_x = v_z;
                                    const _h901 = clueAt(cl.number, v_x);
                                    if (!((_h901 !== -1))) continue;
                                    _g897.push(v_x);
                                  }
                                }
                                _g902.length = 0;
                                _st915.pass++;
                                G903: {
                                  const _a921 = throughWhere(sp, v_z, (_te916: number): boolean => { let _c918: boolean = ((_te916 === _wc620 ? _wd621 : (b.grid[_te916] || -1)) === 1); if (_c918) {   const _t917 = sp.edgeEnds[2 * _te916];   _c918 = !((clueAt(cl.number, _t917) !== -1)); } let _c920: boolean = _c918; if (_c920) {   const _t919 = sp.edgeEnds[2 * _te916 + 1];   _c920 = !((clueAt(cl.number, _t919) !== -1)); } return _c920; });
                                  for (let _i922 = 0; _i922 < _a921.length; _i922++) {
                                    const v_t = _a921[_i922];
                                    const _h925 = clueAt(cl.number, v_t);
                                    const _h926 = (_h925 !== -1);
                                    const _h927 = _h926;
                                    const _h928 = !(_h927);
                                    const _a923 = sp.adj4[v_t];
                                    for (let _i924 = 0; _i924 < _a923.length; _i924++) {
                                      const v_x = _a923[_i924];
                                      const _h929 = clueAt(cl.number, v_x);
                                      let _c931: boolean = (_h928 && (_h929 !== -1));
                                      if (_c931) {
                                        const _t930 = sp.adj4Edges[v_t][_i924];
                                        _c931 = ((_t930 === _wc620 ? _wd621 : (b.grid[_t930] || -1)) === 1);
                                      }
                                      if (!(_c931)) continue;
                                      const _t932 = v_x;
                                      if (_g902.length < 16) { if (!_g902.includes(_t932)) _g902.push(_t932); } else addOnce(_g902, _st915, _t932);
                                    }
                                  }
                                }
                                const _a933 = union(_g897, _g902);
                                for (let _i934 = 0; _i934 < _a933.length; _i934++) {
                                  const v_q = _a933[_i934];
                                  const _h936 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h935 - _h936)) === cl.step))) {
                                    _q855 = false;
                                    break Q856;
                                  }
                                }
                              }
                            }
                            _c937 = _q855;
                          }
                          if ((_c937 && (_h636 || !(throughWhere(sp, v_t, (_te938: number): boolean => {  return ((_te938 === _wc620 ? _wd621 : (b.grid[_te938] || -1)) === 1); }).includes(v_z))))) {
                            _q811 = true;
                            break Q812;
                          }
                        }
                      }
                      _c939 = _q811;
                    }
                    if (_c939) {
                      _q665 = true;
                      break Q666;
                    }
                  }
                }
                _c940 = !(_q665);
              }
              let _c1235: boolean = _c940;
              if (!_c1235) {
                let _q941 = false;
                Q942: {
                  const _a943 = sp.adj4[v_t];
                  for (let _i944 = 0; _i944 < _a943.length; _i944++) {
                    const v_s = _a943[_i944];
                    let _g945 = 0;
                    G946: {
                      const _a947 = sp.adj4[v_s];
                      for (let _i948 = 0; _i948 < _a947.length; _i948++) {
                        const _t949 = sp.adj4Edges[v_s][_i948];
                        if (!(((_t949 === _wc620 ? _wd621 : (b.grid[_t949] || -1)) === 1))) continue;
                        _g945++;
                      }
                    }
                    let _g950 = 0;
                    G951: {
                      for (let _i952 = 0; _i952 < 1; _i952++) {
                        const v_k = v_s;
                        const _h953 = clueAt(cl.number, v_k);
                        const _h960 = (_h953 + 1);
                        let _c962: boolean = (_h953 !== -1);
                        if (_c962) {
                          let _c961: boolean = (_h636 || (_h953 === 1));
                          if (!_c961) {
                            let _g954 = 0;
                            G955: {
                              const _t956 = (_h953 + 1);
                              const _a957 = cluesValued(cl.number, _t956);
                              for (let _i958 = 0; _i958 < _a957.length; _i958++) {
                                const v_x = _a957[_i958];
                                const _h959 = clueAt(cl.number, v_x);
                                if (!((_h959 === _h960))) continue;
                                _g954++;
                              }
                            }
                            _c961 = (_g954 === 0);
                          }
                          _c962 = _c961;
                        }
                        if (!(_c962)) continue;
                        _g950++;
                      }
                    }
                    let _c1234: boolean = (_g945 < (2 - _g950));
                    if (_c1234) {
                      let _q963 = false;
                      Q964: {
                        const _a965 = sp.adj4[v_s];
                        for (let _i966 = 0; _i966 < _a965.length; _i966++) {
                          const v_y = _a965[_i966];
                          const _t967 = sp.adj4Edges[v_s][_i966];
                          let _c986: boolean = !((_t967 === _wc620 ? true : (b.grid[_t967] !== 0)));
                          if (_c986) {
                            let _g968 = 0;
                            G969: {
                              const _a970 = sp.adj4[v_s];
                              for (let _i971 = 0; _i971 < _a970.length; _i971++) {
                                const _t972 = sp.adj4Edges[v_s][_i971];
                                if (!(((_t972 === _wc620 ? _wd621 : (b.grid[_t972] || -1)) === 1))) continue;
                                _g968++;
                              }
                            }
                            let _g973 = 0;
                            G974: {
                              for (let _i975 = 0; _i975 < 1; _i975++) {
                                const v_k = v_s;
                                const _h976 = clueAt(cl.number, v_k);
                                const _h983 = (_h976 + 1);
                                let _c985: boolean = (_h976 !== -1);
                                if (_c985) {
                                  let _c984: boolean = (_h636 || (_h976 === 1));
                                  if (!_c984) {
                                    let _g977 = 0;
                                    G978: {
                                      const _t979 = (_h976 + 1);
                                      const _a980 = cluesValued(cl.number, _t979);
                                      for (let _i981 = 0; _i981 < _a980.length; _i981++) {
                                        const v_x = _a980[_i981];
                                        const _h982 = clueAt(cl.number, v_x);
                                        if (!((_h982 === _h983))) continue;
                                        _g977++;
                                      }
                                    }
                                    _c984 = (_g977 === 0);
                                  }
                                  _c985 = _c984;
                                }
                                if (!(_c985)) continue;
                                _g973++;
                              }
                            }
                            _c986 = (_g968 < (2 - _g973));
                          }
                          let _c1006: boolean = _c986;
                          if (_c1006) {
                            let _g987 = 0;
                            G988: {
                              const _a990 = sp.adj4[v_y];
                              for (let _i991 = 0; _i991 < _a990.length; _i991++) {
                                const _t992 = sp.adj4Edges[v_y][_i991];
                                if (!(((_t992 === _wc620 ? _wd621 : (b.grid[_t992] || -1)) === 1))) continue;
                                _g987++;
                              }
                            }
                            let _g993 = 0;
                            G994: {
                              for (let _i995 = 0; _i995 < 1; _i995++) {
                                const v_k = v_y;
                                const _h996 = clueAt(cl.number, v_k);
                                const _h1003 = (_h996 + 1);
                                let _c1005: boolean = (_h996 !== -1);
                                if (_c1005) {
                                  let _c1004: boolean = (_h636 || (_h996 === 1));
                                  if (!_c1004) {
                                    let _g997 = 0;
                                    G998: {
                                      const _t999 = (_h996 + 1);
                                      const _a1000 = cluesValued(cl.number, _t999);
                                      for (let _i1001 = 0; _i1001 < _a1000.length; _i1001++) {
                                        const v_x = _a1000[_i1001];
                                        const _h1002 = clueAt(cl.number, v_x);
                                        if (!((_h1002 === _h1003))) continue;
                                        _g997++;
                                      }
                                    }
                                    _c1004 = (_g997 === 0);
                                  }
                                  _c1005 = _c1004;
                                }
                                if (!(_c1005)) continue;
                                _g993++;
                              }
                            }
                            _c1006 = (_g987 < (2 - _g993));
                          }
                          let _c1087: boolean = _c1006;
                          if (_c1087) {
                            let _q1007 = true;
                            Q1008: {
                              _g1009.length = 0;
                              G1010: {
                                for (let _i1012 = 0; _i1012 < 1; _i1012++) {
                                  const v_x = v_s;
                                  const _h1013 = clueAt(cl.number, v_x);
                                  if (!((_h1013 !== -1))) continue;
                                  _g1009.push(v_x);
                                }
                              }
                              _g1014.length = 0;
                              _st1027.pass++;
                              G1015: {
                                const _a1033 = throughWhere(sp, v_s, (_te1028: number): boolean => { let _c1030: boolean = ((_te1028 === _wc620 ? _wd621 : (b.grid[_te1028] || -1)) === 1); if (_c1030) {   const _t1029 = sp.edgeEnds[2 * _te1028];   _c1030 = !((clueAt(cl.number, _t1029) !== -1)); } let _c1032: boolean = _c1030; if (_c1032) {   const _t1031 = sp.edgeEnds[2 * _te1028 + 1];   _c1032 = !((clueAt(cl.number, _t1031) !== -1)); } return _c1032; });
                                for (let _i1034 = 0; _i1034 < _a1033.length; _i1034++) {
                                  const v_t = _a1033[_i1034];
                                  const _h1037 = clueAt(cl.number, v_t);
                                  const _h1038 = (_h1037 !== -1);
                                  const _h1039 = _h1038;
                                  const _h1040 = !(_h1039);
                                  const _a1035 = sp.adj4[v_t];
                                  for (let _i1036 = 0; _i1036 < _a1035.length; _i1036++) {
                                    const v_x = _a1035[_i1036];
                                    const _h1041 = clueAt(cl.number, v_x);
                                    let _c1043: boolean = (_h1040 && (_h1041 !== -1));
                                    if (_c1043) {
                                      const _t1042 = sp.adj4Edges[v_t][_i1036];
                                      _c1043 = ((_t1042 === _wc620 ? _wd621 : (b.grid[_t1042] || -1)) === 1);
                                    }
                                    if (!(_c1043)) continue;
                                    const _t1044 = v_x;
                                    if (_g1014.length < 16) { if (!_g1014.includes(_t1044)) _g1014.push(_t1044); } else addOnce(_g1014, _st1027, _t1044);
                                  }
                                }
                              }
                              const _a1045 = union(_g1009, _g1014);
                              for (let _i1046 = 0; _i1046 < _a1045.length; _i1046++) {
                                const v_p = _a1045[_i1046];
                                const _h1085 = clueAt(cl.number, v_p);
                                _g1047.length = 0;
                                G1048: {
                                  for (let _i1050 = 0; _i1050 < 1; _i1050++) {
                                    const v_x = v_y;
                                    const _h1051 = clueAt(cl.number, v_x);
                                    if (!((_h1051 !== -1))) continue;
                                    _g1047.push(v_x);
                                  }
                                }
                                _g1052.length = 0;
                                _st1065.pass++;
                                G1053: {
                                  const _a1071 = throughWhere(sp, v_y, (_te1066: number): boolean => { let _c1068: boolean = ((_te1066 === _wc620 ? _wd621 : (b.grid[_te1066] || -1)) === 1); if (_c1068) {   const _t1067 = sp.edgeEnds[2 * _te1066];   _c1068 = !((clueAt(cl.number, _t1067) !== -1)); } let _c1070: boolean = _c1068; if (_c1070) {   const _t1069 = sp.edgeEnds[2 * _te1066 + 1];   _c1070 = !((clueAt(cl.number, _t1069) !== -1)); } return _c1070; });
                                  for (let _i1072 = 0; _i1072 < _a1071.length; _i1072++) {
                                    const v_t = _a1071[_i1072];
                                    const _h1075 = clueAt(cl.number, v_t);
                                    const _h1076 = (_h1075 !== -1);
                                    const _h1077 = _h1076;
                                    const _h1078 = !(_h1077);
                                    const _a1073 = sp.adj4[v_t];
                                    for (let _i1074 = 0; _i1074 < _a1073.length; _i1074++) {
                                      const v_x = _a1073[_i1074];
                                      const _h1079 = clueAt(cl.number, v_x);
                                      let _c1081: boolean = (_h1078 && (_h1079 !== -1));
                                      if (_c1081) {
                                        const _t1080 = sp.adj4Edges[v_t][_i1074];
                                        _c1081 = ((_t1080 === _wc620 ? _wd621 : (b.grid[_t1080] || -1)) === 1);
                                      }
                                      if (!(_c1081)) continue;
                                      const _t1082 = v_x;
                                      if (_g1052.length < 16) { if (!_g1052.includes(_t1082)) _g1052.push(_t1082); } else addOnce(_g1052, _st1065, _t1082);
                                    }
                                  }
                                }
                                const _a1083 = union(_g1047, _g1052);
                                for (let _i1084 = 0; _i1084 < _a1083.length; _i1084++) {
                                  const v_q = _a1083[_i1084];
                                  const _h1086 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1085 - _h1086)) === cl.step))) {
                                    _q1007 = false;
                                    break Q1008;
                                  }
                                }
                              }
                            }
                            _c1087 = _q1007;
                          }
                          if (!((_c1087 && (_h636 || !(throughWhere(sp, v_s, (_te1088: number): boolean => {  return ((_te1088 === _wc620 ? _wd621 : (b.grid[_te1088] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g1089 = 0;
                          G1090: {
                            const _a1091 = sp.adj4[v_s];
                            for (let _i1092 = 0; _i1092 < _a1091.length; _i1092++) {
                              const _t1093 = sp.adj4Edges[v_s][_i1092];
                              if (!(((_t1093 === _wc620 ? _wd621 : (b.grid[_t1093] || -1)) === 1))) continue;
                              _g1089++;
                            }
                          }
                          let _g1094 = 0;
                          G1095: {
                            for (let _i1096 = 0; _i1096 < 1; _i1096++) {
                              const v_k = v_s;
                              const _h1097 = clueAt(cl.number, v_k);
                              const _h1104 = (_h1097 + 1);
                              let _c1106: boolean = (_h1097 !== -1);
                              if (_c1106) {
                                let _c1105: boolean = (_h636 || (_h1097 === 1));
                                if (!_c1105) {
                                  let _g1098 = 0;
                                  G1099: {
                                    const _t1100 = (_h1097 + 1);
                                    const _a1101 = cluesValued(cl.number, _t1100);
                                    for (let _i1102 = 0; _i1102 < _a1101.length; _i1102++) {
                                      const v_x = _a1101[_i1102];
                                      const _h1103 = clueAt(cl.number, v_x);
                                      if (!((_h1103 === _h1104))) continue;
                                      _g1098++;
                                    }
                                  }
                                  _c1105 = (_g1098 === 0);
                                }
                                _c1106 = _c1105;
                              }
                              if (!(_c1106)) continue;
                              _g1094++;
                            }
                          }
                          let _c1233: boolean = ((_g1089 + 1) === (2 - _g1094));
                          if (!_c1233) {
                            let _q1107 = false;
                            Q1108: {
                              const _a1109 = sp.adj4[v_s];
                              const _n1110 = _i966;
                              for (let _i1111 = 0; _i1111 < _n1110; _i1111++) {
                                const v_z = _a1109[_i1111];
                                const _t1112 = sp.adj4Edges[v_s][_i1111];
                                let _c1131: boolean = !((_t1112 === _wc620 ? true : (b.grid[_t1112] !== 0)));
                                if (_c1131) {
                                  let _g1113 = 0;
                                  G1114: {
                                    const _a1115 = sp.adj4[v_s];
                                    for (let _i1116 = 0; _i1116 < _a1115.length; _i1116++) {
                                      const _t1117 = sp.adj4Edges[v_s][_i1116];
                                      if (!(((_t1117 === _wc620 ? _wd621 : (b.grid[_t1117] || -1)) === 1))) continue;
                                      _g1113++;
                                    }
                                  }
                                  let _g1118 = 0;
                                  G1119: {
                                    for (let _i1120 = 0; _i1120 < 1; _i1120++) {
                                      const v_k = v_s;
                                      const _h1121 = clueAt(cl.number, v_k);
                                      const _h1128 = (_h1121 + 1);
                                      let _c1130: boolean = (_h1121 !== -1);
                                      if (_c1130) {
                                        let _c1129: boolean = (_h636 || (_h1121 === 1));
                                        if (!_c1129) {
                                          let _g1122 = 0;
                                          G1123: {
                                            const _t1124 = (_h1121 + 1);
                                            const _a1125 = cluesValued(cl.number, _t1124);
                                            for (let _i1126 = 0; _i1126 < _a1125.length; _i1126++) {
                                              const v_x = _a1125[_i1126];
                                              const _h1127 = clueAt(cl.number, v_x);
                                              if (!((_h1127 === _h1128))) continue;
                                              _g1122++;
                                            }
                                          }
                                          _c1129 = (_g1122 === 0);
                                        }
                                        _c1130 = _c1129;
                                      }
                                      if (!(_c1130)) continue;
                                      _g1118++;
                                    }
                                  }
                                  _c1131 = (_g1113 < (2 - _g1118));
                                }
                                let _c1150: boolean = _c1131;
                                if (_c1150) {
                                  let _g1132 = 0;
                                  G1133: {
                                    const _a1134 = sp.adj4[v_z];
                                    for (let _i1135 = 0; _i1135 < _a1134.length; _i1135++) {
                                      const _t1136 = sp.adj4Edges[v_z][_i1135];
                                      if (!(((_t1136 === _wc620 ? _wd621 : (b.grid[_t1136] || -1)) === 1))) continue;
                                      _g1132++;
                                    }
                                  }
                                  let _g1137 = 0;
                                  G1138: {
                                    for (let _i1139 = 0; _i1139 < 1; _i1139++) {
                                      const v_k = v_z;
                                      const _h1140 = clueAt(cl.number, v_k);
                                      const _h1147 = (_h1140 + 1);
                                      let _c1149: boolean = (_h1140 !== -1);
                                      if (_c1149) {
                                        let _c1148: boolean = (_h636 || (_h1140 === 1));
                                        if (!_c1148) {
                                          let _g1141 = 0;
                                          G1142: {
                                            const _t1143 = (_h1140 + 1);
                                            const _a1144 = cluesValued(cl.number, _t1143);
                                            for (let _i1145 = 0; _i1145 < _a1144.length; _i1145++) {
                                              const v_x = _a1144[_i1145];
                                              const _h1146 = clueAt(cl.number, v_x);
                                              if (!((_h1146 === _h1147))) continue;
                                              _g1141++;
                                            }
                                          }
                                          _c1148 = (_g1141 === 0);
                                        }
                                        _c1149 = _c1148;
                                      }
                                      if (!(_c1149)) continue;
                                      _g1137++;
                                    }
                                  }
                                  _c1150 = (_g1132 < (2 - _g1137));
                                }
                                let _c1231: boolean = _c1150;
                                if (_c1231) {
                                  let _q1151 = true;
                                  Q1152: {
                                    _g1153.length = 0;
                                    G1154: {
                                      for (let _i1156 = 0; _i1156 < 1; _i1156++) {
                                        const v_x = v_s;
                                        const _h1157 = clueAt(cl.number, v_x);
                                        if (!((_h1157 !== -1))) continue;
                                        _g1153.push(v_x);
                                      }
                                    }
                                    _g1158.length = 0;
                                    _st1171.pass++;
                                    G1159: {
                                      const _a1177 = throughWhere(sp, v_s, (_te1172: number): boolean => { let _c1174: boolean = ((_te1172 === _wc620 ? _wd621 : (b.grid[_te1172] || -1)) === 1); if (_c1174) {   const _t1173 = sp.edgeEnds[2 * _te1172];   _c1174 = !((clueAt(cl.number, _t1173) !== -1)); } let _c1176: boolean = _c1174; if (_c1176) {   const _t1175 = sp.edgeEnds[2 * _te1172 + 1];   _c1176 = !((clueAt(cl.number, _t1175) !== -1)); } return _c1176; });
                                      for (let _i1178 = 0; _i1178 < _a1177.length; _i1178++) {
                                        const v_t = _a1177[_i1178];
                                        const _h1181 = clueAt(cl.number, v_t);
                                        const _h1182 = (_h1181 !== -1);
                                        const _h1183 = _h1182;
                                        const _h1184 = !(_h1183);
                                        const _a1179 = sp.adj4[v_t];
                                        for (let _i1180 = 0; _i1180 < _a1179.length; _i1180++) {
                                          const v_x = _a1179[_i1180];
                                          const _h1185 = clueAt(cl.number, v_x);
                                          let _c1187: boolean = (_h1184 && (_h1185 !== -1));
                                          if (_c1187) {
                                            const _t1186 = sp.adj4Edges[v_t][_i1180];
                                            _c1187 = ((_t1186 === _wc620 ? _wd621 : (b.grid[_t1186] || -1)) === 1);
                                          }
                                          if (!(_c1187)) continue;
                                          const _t1188 = v_x;
                                          if (_g1158.length < 16) { if (!_g1158.includes(_t1188)) _g1158.push(_t1188); } else addOnce(_g1158, _st1171, _t1188);
                                        }
                                      }
                                    }
                                    const _a1189 = union(_g1153, _g1158);
                                    for (let _i1190 = 0; _i1190 < _a1189.length; _i1190++) {
                                      const v_p = _a1189[_i1190];
                                      const _h1229 = clueAt(cl.number, v_p);
                                      _g1191.length = 0;
                                      G1192: {
                                        for (let _i1194 = 0; _i1194 < 1; _i1194++) {
                                          const v_x = v_z;
                                          const _h1195 = clueAt(cl.number, v_x);
                                          if (!((_h1195 !== -1))) continue;
                                          _g1191.push(v_x);
                                        }
                                      }
                                      _g1196.length = 0;
                                      _st1209.pass++;
                                      G1197: {
                                        const _a1215 = throughWhere(sp, v_z, (_te1210: number): boolean => { let _c1212: boolean = ((_te1210 === _wc620 ? _wd621 : (b.grid[_te1210] || -1)) === 1); if (_c1212) {   const _t1211 = sp.edgeEnds[2 * _te1210];   _c1212 = !((clueAt(cl.number, _t1211) !== -1)); } let _c1214: boolean = _c1212; if (_c1214) {   const _t1213 = sp.edgeEnds[2 * _te1210 + 1];   _c1214 = !((clueAt(cl.number, _t1213) !== -1)); } return _c1214; });
                                        for (let _i1216 = 0; _i1216 < _a1215.length; _i1216++) {
                                          const v_t = _a1215[_i1216];
                                          const _h1219 = clueAt(cl.number, v_t);
                                          const _h1220 = (_h1219 !== -1);
                                          const _h1221 = _h1220;
                                          const _h1222 = !(_h1221);
                                          const _a1217 = sp.adj4[v_t];
                                          for (let _i1218 = 0; _i1218 < _a1217.length; _i1218++) {
                                            const v_x = _a1217[_i1218];
                                            const _h1223 = clueAt(cl.number, v_x);
                                            let _c1225: boolean = (_h1222 && (_h1223 !== -1));
                                            if (_c1225) {
                                              const _t1224 = sp.adj4Edges[v_t][_i1218];
                                              _c1225 = ((_t1224 === _wc620 ? _wd621 : (b.grid[_t1224] || -1)) === 1);
                                            }
                                            if (!(_c1225)) continue;
                                            const _t1226 = v_x;
                                            if (_g1196.length < 16) { if (!_g1196.includes(_t1226)) _g1196.push(_t1226); } else addOnce(_g1196, _st1209, _t1226);
                                          }
                                        }
                                      }
                                      const _a1227 = union(_g1191, _g1196);
                                      for (let _i1228 = 0; _i1228 < _a1227.length; _i1228++) {
                                        const v_q = _a1227[_i1228];
                                        const _h1230 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1229 - _h1230)) === cl.step))) {
                                          _q1151 = false;
                                          break Q1152;
                                        }
                                      }
                                    }
                                  }
                                  _c1231 = _q1151;
                                }
                                if ((_c1231 && (_h636 || !(throughWhere(sp, v_s, (_te1232: number): boolean => {  return ((_te1232 === _wc620 ? _wd621 : (b.grid[_te1232] || -1)) === 1); }).includes(v_z))))) {
                                  _q1107 = true;
                                  break Q1108;
                                }
                              }
                            }
                            _c1233 = _q1107;
                          }
                          if (_c1233) {
                            _q963 = true;
                            break Q964;
                          }
                        }
                      }
                      _c1234 = !(_q963);
                    }
                    if (_c1234) {
                      _q941 = true;
                      break Q942;
                    }
                  }
                }
                _c1235 = _q941;
              }
              if (_c1235) {
                _q622 = true;
                break Q623;
              }
            }
          }
          _c1236 = _q622;
        }
        _c1237 = _c1236;
      }
      if (!(_c1237)) break L618;
      if (import.meta.env.DEV && staleChecking) {
        let _c1744: boolean = liveMarked(b, sp, cl, cands, v_a, v_b);
        if (_c1744) {
          let _c1743: boolean = (throughWhere(sp, v_a, (_te1238: number): boolean => {  return ((b.grid[_te1238] || -1) === 1); }).includes(v_b));
          if (!_c1743) {
            const _wc1239 = v_e;
            const _wd1240 = 1;
            let _q1241 = false;
            Q1242: {
              const _a1244 = throughWhere(sp, v_a, (_te1243: number): boolean => {  return ((_te1243 === _wc1239 ? _wd1240 : (b.grid[_te1243] || -1)) === 1); });
              for (let _i1245 = 0; _i1245 < _a1244.length; _i1245++) {
                const v_t = _a1244[_i1245];
                let _c1261: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
                if (!_c1261) {
                  let _g1246 = 0;
                  G1247: {
                    const _a1248 = sp.adj4[v_t];
                    for (let _i1249 = 0; _i1249 < _a1248.length; _i1249++) {
                      const _t1250 = sp.adj4Edges[v_t][_i1249];
                      if (!(((_t1250 === _wc1239 ? _wd1240 : (b.grid[_t1250] || -1)) === 1))) continue;
                      _g1246++;
                    }
                  }
                  let _g1251 = 0;
                  G1252: {
                    for (let _i1253 = 0; _i1253 < 1; _i1253++) {
                      const v_k = v_t;
                      let _c1260: boolean = (clueAt(cl.number, v_k) !== -1);
                      if (_c1260) {
                        let _c1259: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                        if (!_c1259) {
                          let _g1254 = 0;
                          G1255: {
                            const _t1256 = (clueAt(cl.number, v_k) + 1);
                            const _a1257 = cluesValued(cl.number, _t1256);
                            for (let _i1258 = 0; _i1258 < _a1257.length; _i1258++) {
                              const v_x = _a1257[_i1258];
                              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                              _g1254++;
                            }
                          }
                          _c1259 = (_g1254 === 0);
                        }
                        _c1260 = _c1259;
                      }
                      if (!(_c1260)) continue;
                      _g1251++;
                    }
                  }
                  _c1261 = (_g1246 < (2 - _g1251));
                }
                if (!(_c1261)) continue;
                let _g1262 = 0;
                G1263: {
                  const _a1264 = sp.adj4[v_t];
                  for (let _i1265 = 0; _i1265 < _a1264.length; _i1265++) {
                    const _t1266 = sp.adj4Edges[v_t][_i1265];
                    if (!(((_t1266 === _wc1239 ? _wd1240 : (b.grid[_t1266] || -1)) === 1))) continue;
                    _g1262++;
                  }
                }
                let _g1267 = 0;
                G1268: {
                  for (let _i1269 = 0; _i1269 < 1; _i1269++) {
                    const v_k = v_t;
                    let _c1276: boolean = (clueAt(cl.number, v_k) !== -1);
                    if (_c1276) {
                      let _c1275: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                      if (!_c1275) {
                        let _g1270 = 0;
                        G1271: {
                          const _t1272 = (clueAt(cl.number, v_k) + 1);
                          const _a1273 = cluesValued(cl.number, _t1272);
                          for (let _i1274 = 0; _i1274 < _a1273.length; _i1274++) {
                            const v_x = _a1273[_i1274];
                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                            _g1270++;
                          }
                        }
                        _c1275 = (_g1270 === 0);
                      }
                      _c1276 = _c1275;
                    }
                    if (!(_c1276)) continue;
                    _g1267++;
                  }
                }
                let _c1501: boolean = (_g1262 < (2 - _g1267));
                if (_c1501) {
                  let _q1277 = false;
                  Q1278: {
                    const _a1279 = sp.adj4[v_t];
                    for (let _i1280 = 0; _i1280 < _a1279.length; _i1280++) {
                      const v_y = _a1279[_i1280];
                      const _t1281 = sp.adj4Edges[v_t][_i1280];
                      let _c1297: boolean = !((_t1281 === _wc1239 ? true : (b.grid[_t1281] !== 0)));
                      if (_c1297) {
                        let _g1282 = 0;
                        G1283: {
                          const _a1284 = sp.adj4[v_t];
                          for (let _i1285 = 0; _i1285 < _a1284.length; _i1285++) {
                            const _t1286 = sp.adj4Edges[v_t][_i1285];
                            if (!(((_t1286 === _wc1239 ? _wd1240 : (b.grid[_t1286] || -1)) === 1))) continue;
                            _g1282++;
                          }
                        }
                        let _g1287 = 0;
                        G1288: {
                          for (let _i1289 = 0; _i1289 < 1; _i1289++) {
                            const v_k = v_t;
                            let _c1296: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1296) {
                              let _c1295: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1295) {
                                let _g1290 = 0;
                                G1291: {
                                  const _t1292 = (clueAt(cl.number, v_k) + 1);
                                  const _a1293 = cluesValued(cl.number, _t1292);
                                  for (let _i1294 = 0; _i1294 < _a1293.length; _i1294++) {
                                    const v_x = _a1293[_i1294];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1290++;
                                  }
                                }
                                _c1295 = (_g1290 === 0);
                              }
                              _c1296 = _c1295;
                            }
                            if (!(_c1296)) continue;
                            _g1287++;
                          }
                        }
                        _c1297 = (_g1282 < (2 - _g1287));
                      }
                      let _c1314: boolean = _c1297;
                      if (_c1314) {
                        let _g1298 = 0;
                        G1299: {
                          const _a1301 = sp.adj4[v_y];
                          for (let _i1302 = 0; _i1302 < _a1301.length; _i1302++) {
                            const _t1303 = sp.adj4Edges[v_y][_i1302];
                            if (!(((_t1303 === _wc1239 ? _wd1240 : (b.grid[_t1303] || -1)) === 1))) continue;
                            _g1298++;
                          }
                        }
                        let _g1304 = 0;
                        G1305: {
                          for (let _i1306 = 0; _i1306 < 1; _i1306++) {
                            const v_k = v_y;
                            let _c1313: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c1313) {
                              let _c1312: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c1312) {
                                let _g1307 = 0;
                                G1308: {
                                  const _t1309 = (clueAt(cl.number, v_k) + 1);
                                  const _a1310 = cluesValued(cl.number, _t1309);
                                  for (let _i1311 = 0; _i1311 < _a1310.length; _i1311++) {
                                    const v_x = _a1310[_i1311];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g1307++;
                                  }
                                }
                                _c1312 = (_g1307 === 0);
                              }
                              _c1313 = _c1312;
                            }
                            if (!(_c1313)) continue;
                            _g1304++;
                          }
                        }
                        _c1314 = (_g1298 < (2 - _g1304));
                      }
                      let _c1379: boolean = _c1314;
                      if (_c1379) {
                        let _q1315 = true;
                        Q1316: {
                          const _g1317: number[] = [];
                          G1318: {
                            for (let _i1320 = 0; _i1320 < 1; _i1320++) {
                              const v_x = v_t;
                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                              _g1317.push(v_x);
                            }
                          }
                          const _g1321: number[] = [];
                          G1322: {
                            const _a1341 = throughWhere(sp, v_t, (_te1336: number): boolean => { let _c1338: boolean = ((_te1336 === _wc1239 ? _wd1240 : (b.grid[_te1336] || -1)) === 1); if (_c1338) {   const _t1337 = sp.edgeEnds[2 * _te1336];   _c1338 = !((clueAt(cl.number, _t1337) !== -1)); } let _c1340: boolean = _c1338; if (_c1340) {   const _t1339 = sp.edgeEnds[2 * _te1336 + 1];   _c1340 = !((clueAt(cl.number, _t1339) !== -1)); } return _c1340; });
                            for (let _i1342 = 0; _i1342 < _a1341.length; _i1342++) {
                              const v_t_1335 = _a1341[_i1342];
                              const _a1343 = sp.adj4[v_t_1335];
                              for (let _i1344 = 0; _i1344 < _a1343.length; _i1344++) {
                                const v_x = _a1343[_i1344];
                                let _c1346: boolean = (!((clueAt(cl.number, v_t_1335) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                if (_c1346) {
                                  const _t1345 = sp.adj4Edges[v_t_1335][_i1344];
                                  _c1346 = ((_t1345 === _wc1239 ? _wd1240 : (b.grid[_t1345] || -1)) === 1);
                                }
                                if (!(_c1346)) continue;
                                if (!_g1321.includes(v_x)) _g1321.push(v_x);
                              }
                            }
                          }
                          const _a1347 = union(_g1317, _g1321);
                          for (let _i1348 = 0; _i1348 < _a1347.length; _i1348++) {
                            const v_p = _a1347[_i1348];
                            const _g1349: number[] = [];
                            G1350: {
                              for (let _i1352 = 0; _i1352 < 1; _i1352++) {
                                const v_x = v_y;
                                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                _g1349.push(v_x);
                              }
                            }
                            const _g1353: number[] = [];
                            G1354: {
                              const _a1371 = throughWhere(sp, v_y, (_te1366: number): boolean => { let _c1368: boolean = ((_te1366 === _wc1239 ? _wd1240 : (b.grid[_te1366] || -1)) === 1); if (_c1368) {   const _t1367 = sp.edgeEnds[2 * _te1366];   _c1368 = !((clueAt(cl.number, _t1367) !== -1)); } let _c1370: boolean = _c1368; if (_c1370) {   const _t1369 = sp.edgeEnds[2 * _te1366 + 1];   _c1370 = !((clueAt(cl.number, _t1369) !== -1)); } return _c1370; });
                              for (let _i1372 = 0; _i1372 < _a1371.length; _i1372++) {
                                const v_t = _a1371[_i1372];
                                const _a1373 = sp.adj4[v_t];
                                for (let _i1374 = 0; _i1374 < _a1373.length; _i1374++) {
                                  const v_x = _a1373[_i1374];
                                  let _c1376: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                  if (_c1376) {
                                    const _t1375 = sp.adj4Edges[v_t][_i1374];
                                    _c1376 = ((_t1375 === _wc1239 ? _wd1240 : (b.grid[_t1375] || -1)) === 1);
                                  }
                                  if (!(_c1376)) continue;
                                  if (!_g1353.includes(v_x)) _g1353.push(v_x);
                                }
                              }
                            }
                            const _a1377 = union(_g1349, _g1353);
                            for (let _i1378 = 0; _i1378 < _a1377.length; _i1378++) {
                              const v_q = _a1377[_i1378];
                              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                _q1315 = false;
                                break Q1316;
                              }
                            }
                          }
                        }
                        _c1379 = _q1315;
                      }
                      if (!((_c1379 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1380: number): boolean => {  return ((_te1380 === _wc1239 ? _wd1240 : (b.grid[_te1380] || -1)) === 1); }).includes(v_y)))))) continue;
                      let _g1381 = 0;
                      G1382: {
                        const _a1383 = sp.adj4[v_t];
                        for (let _i1384 = 0; _i1384 < _a1383.length; _i1384++) {
                          const _t1385 = sp.adj4Edges[v_t][_i1384];
                          if (!(((_t1385 === _wc1239 ? _wd1240 : (b.grid[_t1385] || -1)) === 1))) continue;
                          _g1381++;
                        }
                      }
                      let _g1386 = 0;
                      G1387: {
                        for (let _i1388 = 0; _i1388 < 1; _i1388++) {
                          const v_k = v_t;
                          let _c1395: boolean = (clueAt(cl.number, v_k) !== -1);
                          if (_c1395) {
                            let _c1394: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                            if (!_c1394) {
                              let _g1389 = 0;
                              G1390: {
                                const _t1391 = (clueAt(cl.number, v_k) + 1);
                                const _a1392 = cluesValued(cl.number, _t1391);
                                for (let _i1393 = 0; _i1393 < _a1392.length; _i1393++) {
                                  const v_x = _a1392[_i1393];
                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                  _g1389++;
                                }
                              }
                              _c1394 = (_g1389 === 0);
                            }
                            _c1395 = _c1394;
                          }
                          if (!(_c1395)) continue;
                          _g1386++;
                        }
                      }
                      let _c1500: boolean = ((_g1381 + 1) === (2 - _g1386));
                      if (!_c1500) {
                        let _q1396 = false;
                        Q1397: {
                          const _a1398 = sp.adj4[v_t];
                          const _n1399 = _i1280;
                          for (let _i1400 = 0; _i1400 < _n1399; _i1400++) {
                            const v_z = _a1398[_i1400];
                            const _t1401 = sp.adj4Edges[v_t][_i1400];
                            let _c1417: boolean = !((_t1401 === _wc1239 ? true : (b.grid[_t1401] !== 0)));
                            if (_c1417) {
                              let _g1402 = 0;
                              G1403: {
                                const _a1404 = sp.adj4[v_t];
                                for (let _i1405 = 0; _i1405 < _a1404.length; _i1405++) {
                                  const _t1406 = sp.adj4Edges[v_t][_i1405];
                                  if (!(((_t1406 === _wc1239 ? _wd1240 : (b.grid[_t1406] || -1)) === 1))) continue;
                                  _g1402++;
                                }
                              }
                              let _g1407 = 0;
                              G1408: {
                                for (let _i1409 = 0; _i1409 < 1; _i1409++) {
                                  const v_k = v_t;
                                  let _c1416: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1416) {
                                    let _c1415: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1415) {
                                      let _g1410 = 0;
                                      G1411: {
                                        const _t1412 = (clueAt(cl.number, v_k) + 1);
                                        const _a1413 = cluesValued(cl.number, _t1412);
                                        for (let _i1414 = 0; _i1414 < _a1413.length; _i1414++) {
                                          const v_x = _a1413[_i1414];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1410++;
                                        }
                                      }
                                      _c1415 = (_g1410 === 0);
                                    }
                                    _c1416 = _c1415;
                                  }
                                  if (!(_c1416)) continue;
                                  _g1407++;
                                }
                              }
                              _c1417 = (_g1402 < (2 - _g1407));
                            }
                            let _c1433: boolean = _c1417;
                            if (_c1433) {
                              let _g1418 = 0;
                              G1419: {
                                const _a1420 = sp.adj4[v_z];
                                for (let _i1421 = 0; _i1421 < _a1420.length; _i1421++) {
                                  const _t1422 = sp.adj4Edges[v_z][_i1421];
                                  if (!(((_t1422 === _wc1239 ? _wd1240 : (b.grid[_t1422] || -1)) === 1))) continue;
                                  _g1418++;
                                }
                              }
                              let _g1423 = 0;
                              G1424: {
                                for (let _i1425 = 0; _i1425 < 1; _i1425++) {
                                  const v_k = v_z;
                                  let _c1432: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1432) {
                                    let _c1431: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1431) {
                                      let _g1426 = 0;
                                      G1427: {
                                        const _t1428 = (clueAt(cl.number, v_k) + 1);
                                        const _a1429 = cluesValued(cl.number, _t1428);
                                        for (let _i1430 = 0; _i1430 < _a1429.length; _i1430++) {
                                          const v_x = _a1429[_i1430];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1426++;
                                        }
                                      }
                                      _c1431 = (_g1426 === 0);
                                    }
                                    _c1432 = _c1431;
                                  }
                                  if (!(_c1432)) continue;
                                  _g1423++;
                                }
                              }
                              _c1433 = (_g1418 < (2 - _g1423));
                            }
                            let _c1498: boolean = _c1433;
                            if (_c1498) {
                              let _q1434 = true;
                              Q1435: {
                                const _g1436: number[] = [];
                                G1437: {
                                  for (let _i1439 = 0; _i1439 < 1; _i1439++) {
                                    const v_x = v_t;
                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                    _g1436.push(v_x);
                                  }
                                }
                                const _g1440: number[] = [];
                                G1441: {
                                  const _a1460 = throughWhere(sp, v_t, (_te1455: number): boolean => { let _c1457: boolean = ((_te1455 === _wc1239 ? _wd1240 : (b.grid[_te1455] || -1)) === 1); if (_c1457) {   const _t1456 = sp.edgeEnds[2 * _te1455];   _c1457 = !((clueAt(cl.number, _t1456) !== -1)); } let _c1459: boolean = _c1457; if (_c1459) {   const _t1458 = sp.edgeEnds[2 * _te1455 + 1];   _c1459 = !((clueAt(cl.number, _t1458) !== -1)); } return _c1459; });
                                  for (let _i1461 = 0; _i1461 < _a1460.length; _i1461++) {
                                    const v_t_1454 = _a1460[_i1461];
                                    const _a1462 = sp.adj4[v_t_1454];
                                    for (let _i1463 = 0; _i1463 < _a1462.length; _i1463++) {
                                      const v_x = _a1462[_i1463];
                                      let _c1465: boolean = (!((clueAt(cl.number, v_t_1454) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                      if (_c1465) {
                                        const _t1464 = sp.adj4Edges[v_t_1454][_i1463];
                                        _c1465 = ((_t1464 === _wc1239 ? _wd1240 : (b.grid[_t1464] || -1)) === 1);
                                      }
                                      if (!(_c1465)) continue;
                                      if (!_g1440.includes(v_x)) _g1440.push(v_x);
                                    }
                                  }
                                }
                                const _a1466 = union(_g1436, _g1440);
                                for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                                  const v_p = _a1466[_i1467];
                                  const _g1468: number[] = [];
                                  G1469: {
                                    for (let _i1471 = 0; _i1471 < 1; _i1471++) {
                                      const v_x = v_z;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1468.push(v_x);
                                    }
                                  }
                                  const _g1472: number[] = [];
                                  G1473: {
                                    const _a1490 = throughWhere(sp, v_z, (_te1485: number): boolean => { let _c1487: boolean = ((_te1485 === _wc1239 ? _wd1240 : (b.grid[_te1485] || -1)) === 1); if (_c1487) {   const _t1486 = sp.edgeEnds[2 * _te1485];   _c1487 = !((clueAt(cl.number, _t1486) !== -1)); } let _c1489: boolean = _c1487; if (_c1489) {   const _t1488 = sp.edgeEnds[2 * _te1485 + 1];   _c1489 = !((clueAt(cl.number, _t1488) !== -1)); } return _c1489; });
                                    for (let _i1491 = 0; _i1491 < _a1490.length; _i1491++) {
                                      const v_t = _a1490[_i1491];
                                      const _a1492 = sp.adj4[v_t];
                                      for (let _i1493 = 0; _i1493 < _a1492.length; _i1493++) {
                                        const v_x = _a1492[_i1493];
                                        let _c1495: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1495) {
                                          const _t1494 = sp.adj4Edges[v_t][_i1493];
                                          _c1495 = ((_t1494 === _wc1239 ? _wd1240 : (b.grid[_t1494] || -1)) === 1);
                                        }
                                        if (!(_c1495)) continue;
                                        if (!_g1472.includes(v_x)) _g1472.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1496 = union(_g1468, _g1472);
                                  for (let _i1497 = 0; _i1497 < _a1496.length; _i1497++) {
                                    const v_q = _a1496[_i1497];
                                    if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                      _q1434 = false;
                                      break Q1435;
                                    }
                                  }
                                }
                              }
                              _c1498 = _q1434;
                            }
                            if ((_c1498 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te1499: number): boolean => {  return ((_te1499 === _wc1239 ? _wd1240 : (b.grid[_te1499] || -1)) === 1); }).includes(v_z))))) {
                              _q1396 = true;
                              break Q1397;
                            }
                          }
                        }
                        _c1500 = _q1396;
                      }
                      if (_c1500) {
                        _q1277 = true;
                        break Q1278;
                      }
                    }
                  }
                  _c1501 = !(_q1277);
                }
                let _c1742: boolean = _c1501;
                if (!_c1742) {
                  let _q1502 = false;
                  Q1503: {
                    const _a1504 = sp.adj4[v_t];
                    for (let _i1505 = 0; _i1505 < _a1504.length; _i1505++) {
                      const v_s = _a1504[_i1505];
                      let _g1506 = 0;
                      G1507: {
                        const _a1508 = sp.adj4[v_s];
                        for (let _i1509 = 0; _i1509 < _a1508.length; _i1509++) {
                          const _t1510 = sp.adj4Edges[v_s][_i1509];
                          if (!(((_t1510 === _wc1239 ? _wd1240 : (b.grid[_t1510] || -1)) === 1))) continue;
                          _g1506++;
                        }
                      }
                      let _g1511 = 0;
                      G1512: {
                        for (let _i1513 = 0; _i1513 < 1; _i1513++) {
                          const v_k = v_s;
                          let _c1520: boolean = (clueAt(cl.number, v_k) !== -1);
                          if (_c1520) {
                            let _c1519: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                            if (!_c1519) {
                              let _g1514 = 0;
                              G1515: {
                                const _t1516 = (clueAt(cl.number, v_k) + 1);
                                const _a1517 = cluesValued(cl.number, _t1516);
                                for (let _i1518 = 0; _i1518 < _a1517.length; _i1518++) {
                                  const v_x = _a1517[_i1518];
                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                  _g1514++;
                                }
                              }
                              _c1519 = (_g1514 === 0);
                            }
                            _c1520 = _c1519;
                          }
                          if (!(_c1520)) continue;
                          _g1511++;
                        }
                      }
                      let _c1741: boolean = (_g1506 < (2 - _g1511));
                      if (_c1741) {
                        let _q1521 = false;
                        Q1522: {
                          const _a1523 = sp.adj4[v_s];
                          for (let _i1524 = 0; _i1524 < _a1523.length; _i1524++) {
                            const v_y = _a1523[_i1524];
                            const _t1525 = sp.adj4Edges[v_s][_i1524];
                            let _c1541: boolean = !((_t1525 === _wc1239 ? true : (b.grid[_t1525] !== 0)));
                            if (_c1541) {
                              let _g1526 = 0;
                              G1527: {
                                const _a1528 = sp.adj4[v_s];
                                for (let _i1529 = 0; _i1529 < _a1528.length; _i1529++) {
                                  const _t1530 = sp.adj4Edges[v_s][_i1529];
                                  if (!(((_t1530 === _wc1239 ? _wd1240 : (b.grid[_t1530] || -1)) === 1))) continue;
                                  _g1526++;
                                }
                              }
                              let _g1531 = 0;
                              G1532: {
                                for (let _i1533 = 0; _i1533 < 1; _i1533++) {
                                  const v_k = v_s;
                                  let _c1540: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1540) {
                                    let _c1539: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1539) {
                                      let _g1534 = 0;
                                      G1535: {
                                        const _t1536 = (clueAt(cl.number, v_k) + 1);
                                        const _a1537 = cluesValued(cl.number, _t1536);
                                        for (let _i1538 = 0; _i1538 < _a1537.length; _i1538++) {
                                          const v_x = _a1537[_i1538];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1534++;
                                        }
                                      }
                                      _c1539 = (_g1534 === 0);
                                    }
                                    _c1540 = _c1539;
                                  }
                                  if (!(_c1540)) continue;
                                  _g1531++;
                                }
                              }
                              _c1541 = (_g1526 < (2 - _g1531));
                            }
                            let _c1558: boolean = _c1541;
                            if (_c1558) {
                              let _g1542 = 0;
                              G1543: {
                                const _a1545 = sp.adj4[v_y];
                                for (let _i1546 = 0; _i1546 < _a1545.length; _i1546++) {
                                  const _t1547 = sp.adj4Edges[v_y][_i1546];
                                  if (!(((_t1547 === _wc1239 ? _wd1240 : (b.grid[_t1547] || -1)) === 1))) continue;
                                  _g1542++;
                                }
                              }
                              let _g1548 = 0;
                              G1549: {
                                for (let _i1550 = 0; _i1550 < 1; _i1550++) {
                                  const v_k = v_y;
                                  let _c1557: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c1557) {
                                    let _c1556: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c1556) {
                                      let _g1551 = 0;
                                      G1552: {
                                        const _t1553 = (clueAt(cl.number, v_k) + 1);
                                        const _a1554 = cluesValued(cl.number, _t1553);
                                        for (let _i1555 = 0; _i1555 < _a1554.length; _i1555++) {
                                          const v_x = _a1554[_i1555];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g1551++;
                                        }
                                      }
                                      _c1556 = (_g1551 === 0);
                                    }
                                    _c1557 = _c1556;
                                  }
                                  if (!(_c1557)) continue;
                                  _g1548++;
                                }
                              }
                              _c1558 = (_g1542 < (2 - _g1548));
                            }
                            let _c1621: boolean = _c1558;
                            if (_c1621) {
                              let _q1559 = true;
                              Q1560: {
                                const _g1561: number[] = [];
                                G1562: {
                                  for (let _i1564 = 0; _i1564 < 1; _i1564++) {
                                    const v_x = v_s;
                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                    _g1561.push(v_x);
                                  }
                                }
                                const _g1565: number[] = [];
                                G1566: {
                                  const _a1583 = throughWhere(sp, v_s, (_te1578: number): boolean => { let _c1580: boolean = ((_te1578 === _wc1239 ? _wd1240 : (b.grid[_te1578] || -1)) === 1); if (_c1580) {   const _t1579 = sp.edgeEnds[2 * _te1578];   _c1580 = !((clueAt(cl.number, _t1579) !== -1)); } let _c1582: boolean = _c1580; if (_c1582) {   const _t1581 = sp.edgeEnds[2 * _te1578 + 1];   _c1582 = !((clueAt(cl.number, _t1581) !== -1)); } return _c1582; });
                                  for (let _i1584 = 0; _i1584 < _a1583.length; _i1584++) {
                                    const v_t = _a1583[_i1584];
                                    const _a1585 = sp.adj4[v_t];
                                    for (let _i1586 = 0; _i1586 < _a1585.length; _i1586++) {
                                      const v_x = _a1585[_i1586];
                                      let _c1588: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                      if (_c1588) {
                                        const _t1587 = sp.adj4Edges[v_t][_i1586];
                                        _c1588 = ((_t1587 === _wc1239 ? _wd1240 : (b.grid[_t1587] || -1)) === 1);
                                      }
                                      if (!(_c1588)) continue;
                                      if (!_g1565.includes(v_x)) _g1565.push(v_x);
                                    }
                                  }
                                }
                                const _a1589 = union(_g1561, _g1565);
                                for (let _i1590 = 0; _i1590 < _a1589.length; _i1590++) {
                                  const v_p = _a1589[_i1590];
                                  const _g1591: number[] = [];
                                  G1592: {
                                    for (let _i1594 = 0; _i1594 < 1; _i1594++) {
                                      const v_x = v_y;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g1591.push(v_x);
                                    }
                                  }
                                  const _g1595: number[] = [];
                                  G1596: {
                                    const _a1613 = throughWhere(sp, v_y, (_te1608: number): boolean => { let _c1610: boolean = ((_te1608 === _wc1239 ? _wd1240 : (b.grid[_te1608] || -1)) === 1); if (_c1610) {   const _t1609 = sp.edgeEnds[2 * _te1608];   _c1610 = !((clueAt(cl.number, _t1609) !== -1)); } let _c1612: boolean = _c1610; if (_c1612) {   const _t1611 = sp.edgeEnds[2 * _te1608 + 1];   _c1612 = !((clueAt(cl.number, _t1611) !== -1)); } return _c1612; });
                                    for (let _i1614 = 0; _i1614 < _a1613.length; _i1614++) {
                                      const v_t = _a1613[_i1614];
                                      const _a1615 = sp.adj4[v_t];
                                      for (let _i1616 = 0; _i1616 < _a1615.length; _i1616++) {
                                        const v_x = _a1615[_i1616];
                                        let _c1618: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c1618) {
                                          const _t1617 = sp.adj4Edges[v_t][_i1616];
                                          _c1618 = ((_t1617 === _wc1239 ? _wd1240 : (b.grid[_t1617] || -1)) === 1);
                                        }
                                        if (!(_c1618)) continue;
                                        if (!_g1595.includes(v_x)) _g1595.push(v_x);
                                      }
                                    }
                                  }
                                  const _a1619 = union(_g1591, _g1595);
                                  for (let _i1620 = 0; _i1620 < _a1619.length; _i1620++) {
                                    const v_q = _a1619[_i1620];
                                    if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                      _q1559 = false;
                                      break Q1560;
                                    }
                                  }
                                }
                              }
                              _c1621 = _q1559;
                            }
                            if (!((_c1621 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1622: number): boolean => {  return ((_te1622 === _wc1239 ? _wd1240 : (b.grid[_te1622] || -1)) === 1); }).includes(v_y)))))) continue;
                            let _g1623 = 0;
                            G1624: {
                              const _a1625 = sp.adj4[v_s];
                              for (let _i1626 = 0; _i1626 < _a1625.length; _i1626++) {
                                const _t1627 = sp.adj4Edges[v_s][_i1626];
                                if (!(((_t1627 === _wc1239 ? _wd1240 : (b.grid[_t1627] || -1)) === 1))) continue;
                                _g1623++;
                              }
                            }
                            let _g1628 = 0;
                            G1629: {
                              for (let _i1630 = 0; _i1630 < 1; _i1630++) {
                                const v_k = v_s;
                                let _c1637: boolean = (clueAt(cl.number, v_k) !== -1);
                                if (_c1637) {
                                  let _c1636: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                  if (!_c1636) {
                                    let _g1631 = 0;
                                    G1632: {
                                      const _t1633 = (clueAt(cl.number, v_k) + 1);
                                      const _a1634 = cluesValued(cl.number, _t1633);
                                      for (let _i1635 = 0; _i1635 < _a1634.length; _i1635++) {
                                        const v_x = _a1634[_i1635];
                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                        _g1631++;
                                      }
                                    }
                                    _c1636 = (_g1631 === 0);
                                  }
                                  _c1637 = _c1636;
                                }
                                if (!(_c1637)) continue;
                                _g1628++;
                              }
                            }
                            let _c1740: boolean = ((_g1623 + 1) === (2 - _g1628));
                            if (!_c1740) {
                              let _q1638 = false;
                              Q1639: {
                                const _a1640 = sp.adj4[v_s];
                                const _n1641 = _i1524;
                                for (let _i1642 = 0; _i1642 < _n1641; _i1642++) {
                                  const v_z = _a1640[_i1642];
                                  const _t1643 = sp.adj4Edges[v_s][_i1642];
                                  let _c1659: boolean = !((_t1643 === _wc1239 ? true : (b.grid[_t1643] !== 0)));
                                  if (_c1659) {
                                    let _g1644 = 0;
                                    G1645: {
                                      const _a1646 = sp.adj4[v_s];
                                      for (let _i1647 = 0; _i1647 < _a1646.length; _i1647++) {
                                        const _t1648 = sp.adj4Edges[v_s][_i1647];
                                        if (!(((_t1648 === _wc1239 ? _wd1240 : (b.grid[_t1648] || -1)) === 1))) continue;
                                        _g1644++;
                                      }
                                    }
                                    let _g1649 = 0;
                                    G1650: {
                                      for (let _i1651 = 0; _i1651 < 1; _i1651++) {
                                        const v_k = v_s;
                                        let _c1658: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c1658) {
                                          let _c1657: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c1657) {
                                            let _g1652 = 0;
                                            G1653: {
                                              const _t1654 = (clueAt(cl.number, v_k) + 1);
                                              const _a1655 = cluesValued(cl.number, _t1654);
                                              for (let _i1656 = 0; _i1656 < _a1655.length; _i1656++) {
                                                const v_x = _a1655[_i1656];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g1652++;
                                              }
                                            }
                                            _c1657 = (_g1652 === 0);
                                          }
                                          _c1658 = _c1657;
                                        }
                                        if (!(_c1658)) continue;
                                        _g1649++;
                                      }
                                    }
                                    _c1659 = (_g1644 < (2 - _g1649));
                                  }
                                  let _c1675: boolean = _c1659;
                                  if (_c1675) {
                                    let _g1660 = 0;
                                    G1661: {
                                      const _a1662 = sp.adj4[v_z];
                                      for (let _i1663 = 0; _i1663 < _a1662.length; _i1663++) {
                                        const _t1664 = sp.adj4Edges[v_z][_i1663];
                                        if (!(((_t1664 === _wc1239 ? _wd1240 : (b.grid[_t1664] || -1)) === 1))) continue;
                                        _g1660++;
                                      }
                                    }
                                    let _g1665 = 0;
                                    G1666: {
                                      for (let _i1667 = 0; _i1667 < 1; _i1667++) {
                                        const v_k = v_z;
                                        let _c1674: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c1674) {
                                          let _c1673: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c1673) {
                                            let _g1668 = 0;
                                            G1669: {
                                              const _t1670 = (clueAt(cl.number, v_k) + 1);
                                              const _a1671 = cluesValued(cl.number, _t1670);
                                              for (let _i1672 = 0; _i1672 < _a1671.length; _i1672++) {
                                                const v_x = _a1671[_i1672];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g1668++;
                                              }
                                            }
                                            _c1673 = (_g1668 === 0);
                                          }
                                          _c1674 = _c1673;
                                        }
                                        if (!(_c1674)) continue;
                                        _g1665++;
                                      }
                                    }
                                    _c1675 = (_g1660 < (2 - _g1665));
                                  }
                                  let _c1738: boolean = _c1675;
                                  if (_c1738) {
                                    let _q1676 = true;
                                    Q1677: {
                                      const _g1678: number[] = [];
                                      G1679: {
                                        for (let _i1681 = 0; _i1681 < 1; _i1681++) {
                                          const v_x = v_s;
                                          if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                          _g1678.push(v_x);
                                        }
                                      }
                                      const _g1682: number[] = [];
                                      G1683: {
                                        const _a1700 = throughWhere(sp, v_s, (_te1695: number): boolean => { let _c1697: boolean = ((_te1695 === _wc1239 ? _wd1240 : (b.grid[_te1695] || -1)) === 1); if (_c1697) {   const _t1696 = sp.edgeEnds[2 * _te1695];   _c1697 = !((clueAt(cl.number, _t1696) !== -1)); } let _c1699: boolean = _c1697; if (_c1699) {   const _t1698 = sp.edgeEnds[2 * _te1695 + 1];   _c1699 = !((clueAt(cl.number, _t1698) !== -1)); } return _c1699; });
                                        for (let _i1701 = 0; _i1701 < _a1700.length; _i1701++) {
                                          const v_t = _a1700[_i1701];
                                          const _a1702 = sp.adj4[v_t];
                                          for (let _i1703 = 0; _i1703 < _a1702.length; _i1703++) {
                                            const v_x = _a1702[_i1703];
                                            let _c1705: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                            if (_c1705) {
                                              const _t1704 = sp.adj4Edges[v_t][_i1703];
                                              _c1705 = ((_t1704 === _wc1239 ? _wd1240 : (b.grid[_t1704] || -1)) === 1);
                                            }
                                            if (!(_c1705)) continue;
                                            if (!_g1682.includes(v_x)) _g1682.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1706 = union(_g1678, _g1682);
                                      for (let _i1707 = 0; _i1707 < _a1706.length; _i1707++) {
                                        const v_p = _a1706[_i1707];
                                        const _g1708: number[] = [];
                                        G1709: {
                                          for (let _i1711 = 0; _i1711 < 1; _i1711++) {
                                            const v_x = v_z;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g1708.push(v_x);
                                          }
                                        }
                                        const _g1712: number[] = [];
                                        G1713: {
                                          const _a1730 = throughWhere(sp, v_z, (_te1725: number): boolean => { let _c1727: boolean = ((_te1725 === _wc1239 ? _wd1240 : (b.grid[_te1725] || -1)) === 1); if (_c1727) {   const _t1726 = sp.edgeEnds[2 * _te1725];   _c1727 = !((clueAt(cl.number, _t1726) !== -1)); } let _c1729: boolean = _c1727; if (_c1729) {   const _t1728 = sp.edgeEnds[2 * _te1725 + 1];   _c1729 = !((clueAt(cl.number, _t1728) !== -1)); } return _c1729; });
                                          for (let _i1731 = 0; _i1731 < _a1730.length; _i1731++) {
                                            const v_t = _a1730[_i1731];
                                            const _a1732 = sp.adj4[v_t];
                                            for (let _i1733 = 0; _i1733 < _a1732.length; _i1733++) {
                                              const v_x = _a1732[_i1733];
                                              let _c1735: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c1735) {
                                                const _t1734 = sp.adj4Edges[v_t][_i1733];
                                                _c1735 = ((_t1734 === _wc1239 ? _wd1240 : (b.grid[_t1734] || -1)) === 1);
                                              }
                                              if (!(_c1735)) continue;
                                              if (!_g1712.includes(v_x)) _g1712.push(v_x);
                                            }
                                          }
                                        }
                                        const _a1736 = union(_g1708, _g1712);
                                        for (let _i1737 = 0; _i1737 < _a1736.length; _i1737++) {
                                          const v_q = _a1736[_i1737];
                                          if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                            _q1676 = false;
                                            break Q1677;
                                          }
                                        }
                                      }
                                    }
                                    _c1738 = _q1676;
                                  }
                                  if ((_c1738 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te1739: number): boolean => {  return ((_te1739 === _wc1239 ? _wd1240 : (b.grid[_te1739] || -1)) === 1); }).includes(v_z))))) {
                                    _q1638 = true;
                                    break Q1639;
                                  }
                                }
                              }
                              _c1740 = _q1638;
                            }
                            if (_c1740) {
                              _q1521 = true;
                              break Q1522;
                            }
                          }
                        }
                        _c1741 = !(_q1521);
                      }
                      if (_c1741) {
                        _q1502 = true;
                        break Q1503;
                      }
                    }
                  }
                  _c1742 = _q1502;
                }
                if (_c1742) {
                  _q1241 = true;
                  break Q1242;
                }
              }
            }
            _c1743 = _q1241;
          }
          _c1744 = _c1743;
        }
        freshBinding("lineBreaks", [(sp.edges.includes(v_e)), (v_a === sp.edgeEnds[2 * v_e]), (v_b === sp.edgeEnds[2 * v_e + 1]), _c1744], ["e in", "a =", "b =", "where of b"]);
      }
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
const _st2392 = stamps();
const _st2431 = stamps();
const _st2538 = stamps();
const _st2577 = stamps();
const _st2689 = stamps();
const _st2727 = stamps();
const _st2833 = stamps();
const _st2871 = stamps();

/** Its dearest read grows with the board as n^2. */
export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g2373: number[] = [];
  const _g2378: number[] = [];
  const _g2413: number[] = [];
  const _g2418: number[] = [];
  const _g2519: number[] = [];
  const _g2524: number[] = [];
  const _g2559: number[] = [];
  const _g2564: number[] = [];
  const _g2671: number[] = [];
  const _g2676: number[] = [];
  const _g2709: number[] = [];
  const _g2714: number[] = [];
  const _g2815: number[] = [];
  const _g2820: number[] = [];
  const _g2853: number[] = [];
  const _g2858: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _k2265 = takesKept.board(cl);
  const _h2298 = (cl.step === 0);
  if (pairBreaksCands.length < sp.edges.length) pairBreaksCands = new Int32Array(sp.edges.length);
  const cands = pairBreaksCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a2263 = sp.cells;
  R1:
  for (let _i2264 = 0; _i2264 < _a2263.length; _i2264++) {
    const v_c = _a2263[_i2264];
    const _m177_0 = b.made[0];
    let _g2266 = 0;
    G2267: {
      const _a2268 = sp.adj4[v_c];
      for (let _i2269 = 0; _i2269 < _a2268.length; _i2269++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i2269]] || -1) === 1))) continue;
        _g2266++;
      }
    }
    if (!((((_k2265[v_c] ?? takes(sp, cl, v_c)) - _g2266) === 2))) continue;
    const _h2276 = clueAt(cl.number, v_c);
    const _h2277 = (_h2276 !== -1);
    const _h2278 = _h2277;
    const _h2279 = !(_h2278);
    const _m182_1 = b.made[1];
    L2270: {
      const v_U = ways(b, sp, cl, v_c);
      const _h2271 = v_U.length;
      if (!((_h2271 === 3))) break L2270;
      const _a2272 = v_U;
      for (let _i2273 = 0; _i2273 < _a2272.length; _i2273++) {
        const v_k = _a2272[_i2273];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L2274: {
          const v_j = (v_I[1] ?? -1);
          let _c2898: boolean = ((throughWhere(sp, v_i, (_te2275: number): boolean => {  return ((b.grid[_te2275] || -1) === 1); }).includes(v_j)) || (_h2279 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
          if (!_c2898) {
            const _wc2280 = sp.edgeOf(v_c, v_i);
            const _wd2281 = 1;
            const _wc2282 = sp.edgeOf(v_c, v_j);
            const _wd2283 = 1;
            let _q2284 = false;
            Q2285: {
              const _a2287 = throughWhere(sp, v_c, (_te2286: number): boolean => {  return ((_te2286 === _wc2282 ? _wd2283 : (_te2286 === _wc2280 ? _wd2281 : (b.grid[_te2286] || -1))) === 1); });
              for (let _i2288 = 0; _i2288 < _a2287.length; _i2288++) {
                const v_t = _a2287[_i2288];
                let _c2308: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                if (!_c2308) {
                  let _g2289 = 0;
                  G2290: {
                    const _a2291 = sp.adj4[v_t];
                    for (let _i2292 = 0; _i2292 < _a2291.length; _i2292++) {
                      const _t2293 = sp.adj4Edges[v_t][_i2292];
                      if (!(((_t2293 === _wc2282 ? _wd2283 : (_t2293 === _wc2280 ? _wd2281 : (b.grid[_t2293] || -1))) === 1))) continue;
                      _g2289++;
                    }
                  }
                  let _g2294 = 0;
                  G2295: {
                    for (let _i2296 = 0; _i2296 < 1; _i2296++) {
                      const v_k = v_t;
                      const _h2297 = clueAt(cl.number, v_k);
                      const _h2305 = (_h2297 + 1);
                      let _c2307: boolean = (_h2297 !== -1);
                      if (_c2307) {
                        let _c2306: boolean = (_h2298 || (_h2297 === 1));
                        if (!_c2306) {
                          let _g2299 = 0;
                          G2300: {
                            const _t2301 = (_h2297 + 1);
                            const _a2302 = cluesValued(cl.number, _t2301);
                            for (let _i2303 = 0; _i2303 < _a2302.length; _i2303++) {
                              const v_x = _a2302[_i2303];
                              const _h2304 = clueAt(cl.number, v_x);
                              if (!((_h2304 === _h2305))) continue;
                              _g2299++;
                            }
                          }
                          _c2306 = (_g2299 === 0);
                        }
                        _c2307 = _c2306;
                      }
                      if (!(_c2307)) continue;
                      _g2294++;
                    }
                  }
                  _c2308 = (_g2289 < (2 - _g2294));
                }
                if (!(_c2308)) continue;
                let _g2309 = 0;
                G2310: {
                  const _a2311 = sp.adj4[v_t];
                  for (let _i2312 = 0; _i2312 < _a2311.length; _i2312++) {
                    const _t2313 = sp.adj4Edges[v_t][_i2312];
                    if (!(((_t2313 === _wc2282 ? _wd2283 : (_t2313 === _wc2280 ? _wd2281 : (b.grid[_t2313] || -1))) === 1))) continue;
                    _g2309++;
                  }
                }
                let _g2314 = 0;
                G2315: {
                  for (let _i2316 = 0; _i2316 < 1; _i2316++) {
                    const v_k = v_t;
                    const _h2317 = clueAt(cl.number, v_k);
                    const _h2324 = (_h2317 + 1);
                    let _c2326: boolean = (_h2317 !== -1);
                    if (_c2326) {
                      let _c2325: boolean = (_h2298 || (_h2317 === 1));
                      if (!_c2325) {
                        let _g2318 = 0;
                        G2319: {
                          const _t2320 = (_h2317 + 1);
                          const _a2321 = cluesValued(cl.number, _t2320);
                          for (let _i2322 = 0; _i2322 < _a2321.length; _i2322++) {
                            const v_x = _a2321[_i2322];
                            const _h2323 = clueAt(cl.number, v_x);
                            if (!((_h2323 === _h2324))) continue;
                            _g2318++;
                          }
                        }
                        _c2325 = (_g2318 === 0);
                      }
                      _c2326 = _c2325;
                    }
                    if (!(_c2326)) continue;
                    _g2314++;
                  }
                }
                let _c2602: boolean = (_g2309 < (2 - _g2314));
                if (_c2602) {
                  let _q2327 = false;
                  Q2328: {
                    const _a2329 = sp.adj4[v_t];
                    for (let _i2330 = 0; _i2330 < _a2329.length; _i2330++) {
                      const v_y = _a2329[_i2330];
                      const _t2331 = sp.adj4Edges[v_t][_i2330];
                      let _c2350: boolean = !((_t2331 === _wc2282 ? true : (_t2331 === _wc2280 ? true : (b.grid[_t2331] !== 0))));
                      if (_c2350) {
                        let _g2332 = 0;
                        G2333: {
                          const _a2334 = sp.adj4[v_t];
                          for (let _i2335 = 0; _i2335 < _a2334.length; _i2335++) {
                            const _t2336 = sp.adj4Edges[v_t][_i2335];
                            if (!(((_t2336 === _wc2282 ? _wd2283 : (_t2336 === _wc2280 ? _wd2281 : (b.grid[_t2336] || -1))) === 1))) continue;
                            _g2332++;
                          }
                        }
                        let _g2337 = 0;
                        G2338: {
                          for (let _i2339 = 0; _i2339 < 1; _i2339++) {
                            const v_k = v_t;
                            const _h2340 = clueAt(cl.number, v_k);
                            const _h2347 = (_h2340 + 1);
                            let _c2349: boolean = (_h2340 !== -1);
                            if (_c2349) {
                              let _c2348: boolean = (_h2298 || (_h2340 === 1));
                              if (!_c2348) {
                                let _g2341 = 0;
                                G2342: {
                                  const _t2343 = (_h2340 + 1);
                                  const _a2344 = cluesValued(cl.number, _t2343);
                                  for (let _i2345 = 0; _i2345 < _a2344.length; _i2345++) {
                                    const v_x = _a2344[_i2345];
                                    const _h2346 = clueAt(cl.number, v_x);
                                    if (!((_h2346 === _h2347))) continue;
                                    _g2341++;
                                  }
                                }
                                _c2348 = (_g2341 === 0);
                              }
                              _c2349 = _c2348;
                            }
                            if (!(_c2349)) continue;
                            _g2337++;
                          }
                        }
                        _c2350 = (_g2332 < (2 - _g2337));
                      }
                      let _c2370: boolean = _c2350;
                      if (_c2370) {
                        let _g2351 = 0;
                        G2352: {
                          const _a2354 = sp.adj4[v_y];
                          for (let _i2355 = 0; _i2355 < _a2354.length; _i2355++) {
                            const _t2356 = sp.adj4Edges[v_y][_i2355];
                            if (!(((_t2356 === _wc2282 ? _wd2283 : (_t2356 === _wc2280 ? _wd2281 : (b.grid[_t2356] || -1))) === 1))) continue;
                            _g2351++;
                          }
                        }
                        let _g2357 = 0;
                        G2358: {
                          for (let _i2359 = 0; _i2359 < 1; _i2359++) {
                            const v_k = v_y;
                            const _h2360 = clueAt(cl.number, v_k);
                            const _h2367 = (_h2360 + 1);
                            let _c2369: boolean = (_h2360 !== -1);
                            if (_c2369) {
                              let _c2368: boolean = (_h2298 || (_h2360 === 1));
                              if (!_c2368) {
                                let _g2361 = 0;
                                G2362: {
                                  const _t2363 = (_h2360 + 1);
                                  const _a2364 = cluesValued(cl.number, _t2363);
                                  for (let _i2365 = 0; _i2365 < _a2364.length; _i2365++) {
                                    const v_x = _a2364[_i2365];
                                    const _h2366 = clueAt(cl.number, v_x);
                                    if (!((_h2366 === _h2367))) continue;
                                    _g2361++;
                                  }
                                }
                                _c2368 = (_g2361 === 0);
                              }
                              _c2369 = _c2368;
                            }
                            if (!(_c2369)) continue;
                            _g2357++;
                          }
                        }
                        _c2370 = (_g2351 < (2 - _g2357));
                      }
                      let _c2453: boolean = _c2370;
                      if (_c2453) {
                        let _q2371 = true;
                        Q2372: {
                          _g2373.length = 0;
                          G2374: {
                            for (let _i2376 = 0; _i2376 < 1; _i2376++) {
                              const v_x = v_t;
                              const _h2377 = clueAt(cl.number, v_x);
                              if (!((_h2377 !== -1))) continue;
                              _g2373.push(v_x);
                            }
                          }
                          _g2378.length = 0;
                          _st2392.pass++;
                          G2379: {
                            const _a2399 = throughWhere(sp, v_t, (_te2394: number): boolean => { let _c2396: boolean = ((_te2394 === _wc2282 ? _wd2283 : (_te2394 === _wc2280 ? _wd2281 : (b.grid[_te2394] || -1))) === 1); if (_c2396) {   const _t2395 = sp.edgeEnds[2 * _te2394];   _c2396 = !((clueAt(cl.number, _t2395) !== -1)); } let _c2398: boolean = _c2396; if (_c2398) {   const _t2397 = sp.edgeEnds[2 * _te2394 + 1];   _c2398 = !((clueAt(cl.number, _t2397) !== -1)); } return _c2398; });
                            for (let _i2400 = 0; _i2400 < _a2399.length; _i2400++) {
                              const v_t_2393 = _a2399[_i2400];
                              const _h2403 = clueAt(cl.number, v_t_2393);
                              const _h2404 = (_h2403 !== -1);
                              const _h2405 = _h2404;
                              const _h2406 = !(_h2405);
                              const _a2401 = sp.adj4[v_t_2393];
                              for (let _i2402 = 0; _i2402 < _a2401.length; _i2402++) {
                                const v_x = _a2401[_i2402];
                                const _h2407 = clueAt(cl.number, v_x);
                                let _c2409: boolean = (_h2406 && (_h2407 !== -1));
                                if (_c2409) {
                                  const _t2408 = sp.adj4Edges[v_t_2393][_i2402];
                                  _c2409 = ((_t2408 === _wc2282 ? _wd2283 : (_t2408 === _wc2280 ? _wd2281 : (b.grid[_t2408] || -1))) === 1);
                                }
                                if (!(_c2409)) continue;
                                const _t2410 = v_x;
                                if (_g2378.length < 16) { if (!_g2378.includes(_t2410)) _g2378.push(_t2410); } else addOnce(_g2378, _st2392, _t2410);
                              }
                            }
                          }
                          const _a2411 = union(_g2373, _g2378);
                          for (let _i2412 = 0; _i2412 < _a2411.length; _i2412++) {
                            const v_p = _a2411[_i2412];
                            const _h2451 = clueAt(cl.number, v_p);
                            _g2413.length = 0;
                            G2414: {
                              for (let _i2416 = 0; _i2416 < 1; _i2416++) {
                                const v_x = v_y;
                                const _h2417 = clueAt(cl.number, v_x);
                                if (!((_h2417 !== -1))) continue;
                                _g2413.push(v_x);
                              }
                            }
                            _g2418.length = 0;
                            _st2431.pass++;
                            G2419: {
                              const _a2437 = throughWhere(sp, v_y, (_te2432: number): boolean => { let _c2434: boolean = ((_te2432 === _wc2282 ? _wd2283 : (_te2432 === _wc2280 ? _wd2281 : (b.grid[_te2432] || -1))) === 1); if (_c2434) {   const _t2433 = sp.edgeEnds[2 * _te2432];   _c2434 = !((clueAt(cl.number, _t2433) !== -1)); } let _c2436: boolean = _c2434; if (_c2436) {   const _t2435 = sp.edgeEnds[2 * _te2432 + 1];   _c2436 = !((clueAt(cl.number, _t2435) !== -1)); } return _c2436; });
                              for (let _i2438 = 0; _i2438 < _a2437.length; _i2438++) {
                                const v_t = _a2437[_i2438];
                                const _h2441 = clueAt(cl.number, v_t);
                                const _h2442 = (_h2441 !== -1);
                                const _h2443 = _h2442;
                                const _h2444 = !(_h2443);
                                const _a2439 = sp.adj4[v_t];
                                for (let _i2440 = 0; _i2440 < _a2439.length; _i2440++) {
                                  const v_x = _a2439[_i2440];
                                  const _h2445 = clueAt(cl.number, v_x);
                                  let _c2447: boolean = (_h2444 && (_h2445 !== -1));
                                  if (_c2447) {
                                    const _t2446 = sp.adj4Edges[v_t][_i2440];
                                    _c2447 = ((_t2446 === _wc2282 ? _wd2283 : (_t2446 === _wc2280 ? _wd2281 : (b.grid[_t2446] || -1))) === 1);
                                  }
                                  if (!(_c2447)) continue;
                                  const _t2448 = v_x;
                                  if (_g2418.length < 16) { if (!_g2418.includes(_t2448)) _g2418.push(_t2448); } else addOnce(_g2418, _st2431, _t2448);
                                }
                              }
                            }
                            const _a2449 = union(_g2413, _g2418);
                            for (let _i2450 = 0; _i2450 < _a2449.length; _i2450++) {
                              const v_q = _a2449[_i2450];
                              const _h2452 = clueAt(cl.number, v_q);
                              if (!((Math.abs((_h2451 - _h2452)) === cl.step))) {
                                _q2371 = false;
                                break Q2372;
                              }
                            }
                          }
                        }
                        _c2453 = _q2371;
                      }
                      if (!((_c2453 && (_h2298 || !(throughWhere(sp, v_t, (_te2454: number): boolean => {  return ((_te2454 === _wc2282 ? _wd2283 : (_te2454 === _wc2280 ? _wd2281 : (b.grid[_te2454] || -1))) === 1); }).includes(v_y)))))) continue;
                      let _g2455 = 0;
                      G2456: {
                        const _a2457 = sp.adj4[v_t];
                        for (let _i2458 = 0; _i2458 < _a2457.length; _i2458++) {
                          const _t2459 = sp.adj4Edges[v_t][_i2458];
                          if (!(((_t2459 === _wc2282 ? _wd2283 : (_t2459 === _wc2280 ? _wd2281 : (b.grid[_t2459] || -1))) === 1))) continue;
                          _g2455++;
                        }
                      }
                      let _g2460 = 0;
                      G2461: {
                        for (let _i2462 = 0; _i2462 < 1; _i2462++) {
                          const v_k = v_t;
                          const _h2463 = clueAt(cl.number, v_k);
                          const _h2470 = (_h2463 + 1);
                          let _c2472: boolean = (_h2463 !== -1);
                          if (_c2472) {
                            let _c2471: boolean = (_h2298 || (_h2463 === 1));
                            if (!_c2471) {
                              let _g2464 = 0;
                              G2465: {
                                const _t2466 = (_h2463 + 1);
                                const _a2467 = cluesValued(cl.number, _t2466);
                                for (let _i2468 = 0; _i2468 < _a2467.length; _i2468++) {
                                  const v_x = _a2467[_i2468];
                                  const _h2469 = clueAt(cl.number, v_x);
                                  if (!((_h2469 === _h2470))) continue;
                                  _g2464++;
                                }
                              }
                              _c2471 = (_g2464 === 0);
                            }
                            _c2472 = _c2471;
                          }
                          if (!(_c2472)) continue;
                          _g2460++;
                        }
                      }
                      let _c2601: boolean = ((_g2455 + 1) === (2 - _g2460));
                      if (!_c2601) {
                        let _q2473 = false;
                        Q2474: {
                          const _a2475 = sp.adj4[v_t];
                          const _n2476 = _i2330;
                          for (let _i2477 = 0; _i2477 < _n2476; _i2477++) {
                            const v_z = _a2475[_i2477];
                            const _t2478 = sp.adj4Edges[v_t][_i2477];
                            let _c2497: boolean = !((_t2478 === _wc2282 ? true : (_t2478 === _wc2280 ? true : (b.grid[_t2478] !== 0))));
                            if (_c2497) {
                              let _g2479 = 0;
                              G2480: {
                                const _a2481 = sp.adj4[v_t];
                                for (let _i2482 = 0; _i2482 < _a2481.length; _i2482++) {
                                  const _t2483 = sp.adj4Edges[v_t][_i2482];
                                  if (!(((_t2483 === _wc2282 ? _wd2283 : (_t2483 === _wc2280 ? _wd2281 : (b.grid[_t2483] || -1))) === 1))) continue;
                                  _g2479++;
                                }
                              }
                              let _g2484 = 0;
                              G2485: {
                                for (let _i2486 = 0; _i2486 < 1; _i2486++) {
                                  const v_k = v_t;
                                  const _h2487 = clueAt(cl.number, v_k);
                                  const _h2494 = (_h2487 + 1);
                                  let _c2496: boolean = (_h2487 !== -1);
                                  if (_c2496) {
                                    let _c2495: boolean = (_h2298 || (_h2487 === 1));
                                    if (!_c2495) {
                                      let _g2488 = 0;
                                      G2489: {
                                        const _t2490 = (_h2487 + 1);
                                        const _a2491 = cluesValued(cl.number, _t2490);
                                        for (let _i2492 = 0; _i2492 < _a2491.length; _i2492++) {
                                          const v_x = _a2491[_i2492];
                                          const _h2493 = clueAt(cl.number, v_x);
                                          if (!((_h2493 === _h2494))) continue;
                                          _g2488++;
                                        }
                                      }
                                      _c2495 = (_g2488 === 0);
                                    }
                                    _c2496 = _c2495;
                                  }
                                  if (!(_c2496)) continue;
                                  _g2484++;
                                }
                              }
                              _c2497 = (_g2479 < (2 - _g2484));
                            }
                            let _c2516: boolean = _c2497;
                            if (_c2516) {
                              let _g2498 = 0;
                              G2499: {
                                const _a2500 = sp.adj4[v_z];
                                for (let _i2501 = 0; _i2501 < _a2500.length; _i2501++) {
                                  const _t2502 = sp.adj4Edges[v_z][_i2501];
                                  if (!(((_t2502 === _wc2282 ? _wd2283 : (_t2502 === _wc2280 ? _wd2281 : (b.grid[_t2502] || -1))) === 1))) continue;
                                  _g2498++;
                                }
                              }
                              let _g2503 = 0;
                              G2504: {
                                for (let _i2505 = 0; _i2505 < 1; _i2505++) {
                                  const v_k = v_z;
                                  const _h2506 = clueAt(cl.number, v_k);
                                  const _h2513 = (_h2506 + 1);
                                  let _c2515: boolean = (_h2506 !== -1);
                                  if (_c2515) {
                                    let _c2514: boolean = (_h2298 || (_h2506 === 1));
                                    if (!_c2514) {
                                      let _g2507 = 0;
                                      G2508: {
                                        const _t2509 = (_h2506 + 1);
                                        const _a2510 = cluesValued(cl.number, _t2509);
                                        for (let _i2511 = 0; _i2511 < _a2510.length; _i2511++) {
                                          const v_x = _a2510[_i2511];
                                          const _h2512 = clueAt(cl.number, v_x);
                                          if (!((_h2512 === _h2513))) continue;
                                          _g2507++;
                                        }
                                      }
                                      _c2514 = (_g2507 === 0);
                                    }
                                    _c2515 = _c2514;
                                  }
                                  if (!(_c2515)) continue;
                                  _g2503++;
                                }
                              }
                              _c2516 = (_g2498 < (2 - _g2503));
                            }
                            let _c2599: boolean = _c2516;
                            if (_c2599) {
                              let _q2517 = true;
                              Q2518: {
                                _g2519.length = 0;
                                G2520: {
                                  for (let _i2522 = 0; _i2522 < 1; _i2522++) {
                                    const v_x = v_t;
                                    const _h2523 = clueAt(cl.number, v_x);
                                    if (!((_h2523 !== -1))) continue;
                                    _g2519.push(v_x);
                                  }
                                }
                                _g2524.length = 0;
                                _st2538.pass++;
                                G2525: {
                                  const _a2545 = throughWhere(sp, v_t, (_te2540: number): boolean => { let _c2542: boolean = ((_te2540 === _wc2282 ? _wd2283 : (_te2540 === _wc2280 ? _wd2281 : (b.grid[_te2540] || -1))) === 1); if (_c2542) {   const _t2541 = sp.edgeEnds[2 * _te2540];   _c2542 = !((clueAt(cl.number, _t2541) !== -1)); } let _c2544: boolean = _c2542; if (_c2544) {   const _t2543 = sp.edgeEnds[2 * _te2540 + 1];   _c2544 = !((clueAt(cl.number, _t2543) !== -1)); } return _c2544; });
                                  for (let _i2546 = 0; _i2546 < _a2545.length; _i2546++) {
                                    const v_t_2539 = _a2545[_i2546];
                                    const _h2549 = clueAt(cl.number, v_t_2539);
                                    const _h2550 = (_h2549 !== -1);
                                    const _h2551 = _h2550;
                                    const _h2552 = !(_h2551);
                                    const _a2547 = sp.adj4[v_t_2539];
                                    for (let _i2548 = 0; _i2548 < _a2547.length; _i2548++) {
                                      const v_x = _a2547[_i2548];
                                      const _h2553 = clueAt(cl.number, v_x);
                                      let _c2555: boolean = (_h2552 && (_h2553 !== -1));
                                      if (_c2555) {
                                        const _t2554 = sp.adj4Edges[v_t_2539][_i2548];
                                        _c2555 = ((_t2554 === _wc2282 ? _wd2283 : (_t2554 === _wc2280 ? _wd2281 : (b.grid[_t2554] || -1))) === 1);
                                      }
                                      if (!(_c2555)) continue;
                                      const _t2556 = v_x;
                                      if (_g2524.length < 16) { if (!_g2524.includes(_t2556)) _g2524.push(_t2556); } else addOnce(_g2524, _st2538, _t2556);
                                    }
                                  }
                                }
                                const _a2557 = union(_g2519, _g2524);
                                for (let _i2558 = 0; _i2558 < _a2557.length; _i2558++) {
                                  const v_p = _a2557[_i2558];
                                  const _h2597 = clueAt(cl.number, v_p);
                                  _g2559.length = 0;
                                  G2560: {
                                    for (let _i2562 = 0; _i2562 < 1; _i2562++) {
                                      const v_x = v_z;
                                      const _h2563 = clueAt(cl.number, v_x);
                                      if (!((_h2563 !== -1))) continue;
                                      _g2559.push(v_x);
                                    }
                                  }
                                  _g2564.length = 0;
                                  _st2577.pass++;
                                  G2565: {
                                    const _a2583 = throughWhere(sp, v_z, (_te2578: number): boolean => { let _c2580: boolean = ((_te2578 === _wc2282 ? _wd2283 : (_te2578 === _wc2280 ? _wd2281 : (b.grid[_te2578] || -1))) === 1); if (_c2580) {   const _t2579 = sp.edgeEnds[2 * _te2578];   _c2580 = !((clueAt(cl.number, _t2579) !== -1)); } let _c2582: boolean = _c2580; if (_c2582) {   const _t2581 = sp.edgeEnds[2 * _te2578 + 1];   _c2582 = !((clueAt(cl.number, _t2581) !== -1)); } return _c2582; });
                                    for (let _i2584 = 0; _i2584 < _a2583.length; _i2584++) {
                                      const v_t = _a2583[_i2584];
                                      const _h2587 = clueAt(cl.number, v_t);
                                      const _h2588 = (_h2587 !== -1);
                                      const _h2589 = _h2588;
                                      const _h2590 = !(_h2589);
                                      const _a2585 = sp.adj4[v_t];
                                      for (let _i2586 = 0; _i2586 < _a2585.length; _i2586++) {
                                        const v_x = _a2585[_i2586];
                                        const _h2591 = clueAt(cl.number, v_x);
                                        let _c2593: boolean = (_h2590 && (_h2591 !== -1));
                                        if (_c2593) {
                                          const _t2592 = sp.adj4Edges[v_t][_i2586];
                                          _c2593 = ((_t2592 === _wc2282 ? _wd2283 : (_t2592 === _wc2280 ? _wd2281 : (b.grid[_t2592] || -1))) === 1);
                                        }
                                        if (!(_c2593)) continue;
                                        const _t2594 = v_x;
                                        if (_g2564.length < 16) { if (!_g2564.includes(_t2594)) _g2564.push(_t2594); } else addOnce(_g2564, _st2577, _t2594);
                                      }
                                    }
                                  }
                                  const _a2595 = union(_g2559, _g2564);
                                  for (let _i2596 = 0; _i2596 < _a2595.length; _i2596++) {
                                    const v_q = _a2595[_i2596];
                                    const _h2598 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2597 - _h2598)) === cl.step))) {
                                      _q2517 = false;
                                      break Q2518;
                                    }
                                  }
                                }
                              }
                              _c2599 = _q2517;
                            }
                            if ((_c2599 && (_h2298 || !(throughWhere(sp, v_t, (_te2600: number): boolean => {  return ((_te2600 === _wc2282 ? _wd2283 : (_te2600 === _wc2280 ? _wd2281 : (b.grid[_te2600] || -1))) === 1); }).includes(v_z))))) {
                              _q2473 = true;
                              break Q2474;
                            }
                          }
                        }
                        _c2601 = _q2473;
                      }
                      if (_c2601) {
                        _q2327 = true;
                        break Q2328;
                      }
                    }
                  }
                  _c2602 = !(_q2327);
                }
                let _c2897: boolean = _c2602;
                if (!_c2897) {
                  let _q2603 = false;
                  Q2604: {
                    const _a2605 = sp.adj4[v_t];
                    for (let _i2606 = 0; _i2606 < _a2605.length; _i2606++) {
                      const v_s = _a2605[_i2606];
                      let _g2607 = 0;
                      G2608: {
                        const _a2609 = sp.adj4[v_s];
                        for (let _i2610 = 0; _i2610 < _a2609.length; _i2610++) {
                          const _t2611 = sp.adj4Edges[v_s][_i2610];
                          if (!(((_t2611 === _wc2282 ? _wd2283 : (_t2611 === _wc2280 ? _wd2281 : (b.grid[_t2611] || -1))) === 1))) continue;
                          _g2607++;
                        }
                      }
                      let _g2612 = 0;
                      G2613: {
                        for (let _i2614 = 0; _i2614 < 1; _i2614++) {
                          const v_k = v_s;
                          const _h2615 = clueAt(cl.number, v_k);
                          const _h2622 = (_h2615 + 1);
                          let _c2624: boolean = (_h2615 !== -1);
                          if (_c2624) {
                            let _c2623: boolean = (_h2298 || (_h2615 === 1));
                            if (!_c2623) {
                              let _g2616 = 0;
                              G2617: {
                                const _t2618 = (_h2615 + 1);
                                const _a2619 = cluesValued(cl.number, _t2618);
                                for (let _i2620 = 0; _i2620 < _a2619.length; _i2620++) {
                                  const v_x = _a2619[_i2620];
                                  const _h2621 = clueAt(cl.number, v_x);
                                  if (!((_h2621 === _h2622))) continue;
                                  _g2616++;
                                }
                              }
                              _c2623 = (_g2616 === 0);
                            }
                            _c2624 = _c2623;
                          }
                          if (!(_c2624)) continue;
                          _g2612++;
                        }
                      }
                      let _c2896: boolean = (_g2607 < (2 - _g2612));
                      if (_c2896) {
                        let _q2625 = false;
                        Q2626: {
                          const _a2627 = sp.adj4[v_s];
                          for (let _i2628 = 0; _i2628 < _a2627.length; _i2628++) {
                            const v_y = _a2627[_i2628];
                            const _t2629 = sp.adj4Edges[v_s][_i2628];
                            let _c2648: boolean = !((_t2629 === _wc2282 ? true : (_t2629 === _wc2280 ? true : (b.grid[_t2629] !== 0))));
                            if (_c2648) {
                              let _g2630 = 0;
                              G2631: {
                                const _a2632 = sp.adj4[v_s];
                                for (let _i2633 = 0; _i2633 < _a2632.length; _i2633++) {
                                  const _t2634 = sp.adj4Edges[v_s][_i2633];
                                  if (!(((_t2634 === _wc2282 ? _wd2283 : (_t2634 === _wc2280 ? _wd2281 : (b.grid[_t2634] || -1))) === 1))) continue;
                                  _g2630++;
                                }
                              }
                              let _g2635 = 0;
                              G2636: {
                                for (let _i2637 = 0; _i2637 < 1; _i2637++) {
                                  const v_k = v_s;
                                  const _h2638 = clueAt(cl.number, v_k);
                                  const _h2645 = (_h2638 + 1);
                                  let _c2647: boolean = (_h2638 !== -1);
                                  if (_c2647) {
                                    let _c2646: boolean = (_h2298 || (_h2638 === 1));
                                    if (!_c2646) {
                                      let _g2639 = 0;
                                      G2640: {
                                        const _t2641 = (_h2638 + 1);
                                        const _a2642 = cluesValued(cl.number, _t2641);
                                        for (let _i2643 = 0; _i2643 < _a2642.length; _i2643++) {
                                          const v_x = _a2642[_i2643];
                                          const _h2644 = clueAt(cl.number, v_x);
                                          if (!((_h2644 === _h2645))) continue;
                                          _g2639++;
                                        }
                                      }
                                      _c2646 = (_g2639 === 0);
                                    }
                                    _c2647 = _c2646;
                                  }
                                  if (!(_c2647)) continue;
                                  _g2635++;
                                }
                              }
                              _c2648 = (_g2630 < (2 - _g2635));
                            }
                            let _c2668: boolean = _c2648;
                            if (_c2668) {
                              let _g2649 = 0;
                              G2650: {
                                const _a2652 = sp.adj4[v_y];
                                for (let _i2653 = 0; _i2653 < _a2652.length; _i2653++) {
                                  const _t2654 = sp.adj4Edges[v_y][_i2653];
                                  if (!(((_t2654 === _wc2282 ? _wd2283 : (_t2654 === _wc2280 ? _wd2281 : (b.grid[_t2654] || -1))) === 1))) continue;
                                  _g2649++;
                                }
                              }
                              let _g2655 = 0;
                              G2656: {
                                for (let _i2657 = 0; _i2657 < 1; _i2657++) {
                                  const v_k = v_y;
                                  const _h2658 = clueAt(cl.number, v_k);
                                  const _h2665 = (_h2658 + 1);
                                  let _c2667: boolean = (_h2658 !== -1);
                                  if (_c2667) {
                                    let _c2666: boolean = (_h2298 || (_h2658 === 1));
                                    if (!_c2666) {
                                      let _g2659 = 0;
                                      G2660: {
                                        const _t2661 = (_h2658 + 1);
                                        const _a2662 = cluesValued(cl.number, _t2661);
                                        for (let _i2663 = 0; _i2663 < _a2662.length; _i2663++) {
                                          const v_x = _a2662[_i2663];
                                          const _h2664 = clueAt(cl.number, v_x);
                                          if (!((_h2664 === _h2665))) continue;
                                          _g2659++;
                                        }
                                      }
                                      _c2666 = (_g2659 === 0);
                                    }
                                    _c2667 = _c2666;
                                  }
                                  if (!(_c2667)) continue;
                                  _g2655++;
                                }
                              }
                              _c2668 = (_g2649 < (2 - _g2655));
                            }
                            let _c2749: boolean = _c2668;
                            if (_c2749) {
                              let _q2669 = true;
                              Q2670: {
                                _g2671.length = 0;
                                G2672: {
                                  for (let _i2674 = 0; _i2674 < 1; _i2674++) {
                                    const v_x = v_s;
                                    const _h2675 = clueAt(cl.number, v_x);
                                    if (!((_h2675 !== -1))) continue;
                                    _g2671.push(v_x);
                                  }
                                }
                                _g2676.length = 0;
                                _st2689.pass++;
                                G2677: {
                                  const _a2695 = throughWhere(sp, v_s, (_te2690: number): boolean => { let _c2692: boolean = ((_te2690 === _wc2282 ? _wd2283 : (_te2690 === _wc2280 ? _wd2281 : (b.grid[_te2690] || -1))) === 1); if (_c2692) {   const _t2691 = sp.edgeEnds[2 * _te2690];   _c2692 = !((clueAt(cl.number, _t2691) !== -1)); } let _c2694: boolean = _c2692; if (_c2694) {   const _t2693 = sp.edgeEnds[2 * _te2690 + 1];   _c2694 = !((clueAt(cl.number, _t2693) !== -1)); } return _c2694; });
                                  for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
                                    const v_t = _a2695[_i2696];
                                    const _h2699 = clueAt(cl.number, v_t);
                                    const _h2700 = (_h2699 !== -1);
                                    const _h2701 = _h2700;
                                    const _h2702 = !(_h2701);
                                    const _a2697 = sp.adj4[v_t];
                                    for (let _i2698 = 0; _i2698 < _a2697.length; _i2698++) {
                                      const v_x = _a2697[_i2698];
                                      const _h2703 = clueAt(cl.number, v_x);
                                      let _c2705: boolean = (_h2702 && (_h2703 !== -1));
                                      if (_c2705) {
                                        const _t2704 = sp.adj4Edges[v_t][_i2698];
                                        _c2705 = ((_t2704 === _wc2282 ? _wd2283 : (_t2704 === _wc2280 ? _wd2281 : (b.grid[_t2704] || -1))) === 1);
                                      }
                                      if (!(_c2705)) continue;
                                      const _t2706 = v_x;
                                      if (_g2676.length < 16) { if (!_g2676.includes(_t2706)) _g2676.push(_t2706); } else addOnce(_g2676, _st2689, _t2706);
                                    }
                                  }
                                }
                                const _a2707 = union(_g2671, _g2676);
                                for (let _i2708 = 0; _i2708 < _a2707.length; _i2708++) {
                                  const v_p = _a2707[_i2708];
                                  const _h2747 = clueAt(cl.number, v_p);
                                  _g2709.length = 0;
                                  G2710: {
                                    for (let _i2712 = 0; _i2712 < 1; _i2712++) {
                                      const v_x = v_y;
                                      const _h2713 = clueAt(cl.number, v_x);
                                      if (!((_h2713 !== -1))) continue;
                                      _g2709.push(v_x);
                                    }
                                  }
                                  _g2714.length = 0;
                                  _st2727.pass++;
                                  G2715: {
                                    const _a2733 = throughWhere(sp, v_y, (_te2728: number): boolean => { let _c2730: boolean = ((_te2728 === _wc2282 ? _wd2283 : (_te2728 === _wc2280 ? _wd2281 : (b.grid[_te2728] || -1))) === 1); if (_c2730) {   const _t2729 = sp.edgeEnds[2 * _te2728];   _c2730 = !((clueAt(cl.number, _t2729) !== -1)); } let _c2732: boolean = _c2730; if (_c2732) {   const _t2731 = sp.edgeEnds[2 * _te2728 + 1];   _c2732 = !((clueAt(cl.number, _t2731) !== -1)); } return _c2732; });
                                    for (let _i2734 = 0; _i2734 < _a2733.length; _i2734++) {
                                      const v_t = _a2733[_i2734];
                                      const _h2737 = clueAt(cl.number, v_t);
                                      const _h2738 = (_h2737 !== -1);
                                      const _h2739 = _h2738;
                                      const _h2740 = !(_h2739);
                                      const _a2735 = sp.adj4[v_t];
                                      for (let _i2736 = 0; _i2736 < _a2735.length; _i2736++) {
                                        const v_x = _a2735[_i2736];
                                        const _h2741 = clueAt(cl.number, v_x);
                                        let _c2743: boolean = (_h2740 && (_h2741 !== -1));
                                        if (_c2743) {
                                          const _t2742 = sp.adj4Edges[v_t][_i2736];
                                          _c2743 = ((_t2742 === _wc2282 ? _wd2283 : (_t2742 === _wc2280 ? _wd2281 : (b.grid[_t2742] || -1))) === 1);
                                        }
                                        if (!(_c2743)) continue;
                                        const _t2744 = v_x;
                                        if (_g2714.length < 16) { if (!_g2714.includes(_t2744)) _g2714.push(_t2744); } else addOnce(_g2714, _st2727, _t2744);
                                      }
                                    }
                                  }
                                  const _a2745 = union(_g2709, _g2714);
                                  for (let _i2746 = 0; _i2746 < _a2745.length; _i2746++) {
                                    const v_q = _a2745[_i2746];
                                    const _h2748 = clueAt(cl.number, v_q);
                                    if (!((Math.abs((_h2747 - _h2748)) === cl.step))) {
                                      _q2669 = false;
                                      break Q2670;
                                    }
                                  }
                                }
                              }
                              _c2749 = _q2669;
                            }
                            if (!((_c2749 && (_h2298 || !(throughWhere(sp, v_s, (_te2750: number): boolean => {  return ((_te2750 === _wc2282 ? _wd2283 : (_te2750 === _wc2280 ? _wd2281 : (b.grid[_te2750] || -1))) === 1); }).includes(v_y)))))) continue;
                            let _g2751 = 0;
                            G2752: {
                              const _a2753 = sp.adj4[v_s];
                              for (let _i2754 = 0; _i2754 < _a2753.length; _i2754++) {
                                const _t2755 = sp.adj4Edges[v_s][_i2754];
                                if (!(((_t2755 === _wc2282 ? _wd2283 : (_t2755 === _wc2280 ? _wd2281 : (b.grid[_t2755] || -1))) === 1))) continue;
                                _g2751++;
                              }
                            }
                            let _g2756 = 0;
                            G2757: {
                              for (let _i2758 = 0; _i2758 < 1; _i2758++) {
                                const v_k = v_s;
                                const _h2759 = clueAt(cl.number, v_k);
                                const _h2766 = (_h2759 + 1);
                                let _c2768: boolean = (_h2759 !== -1);
                                if (_c2768) {
                                  let _c2767: boolean = (_h2298 || (_h2759 === 1));
                                  if (!_c2767) {
                                    let _g2760 = 0;
                                    G2761: {
                                      const _t2762 = (_h2759 + 1);
                                      const _a2763 = cluesValued(cl.number, _t2762);
                                      for (let _i2764 = 0; _i2764 < _a2763.length; _i2764++) {
                                        const v_x = _a2763[_i2764];
                                        const _h2765 = clueAt(cl.number, v_x);
                                        if (!((_h2765 === _h2766))) continue;
                                        _g2760++;
                                      }
                                    }
                                    _c2767 = (_g2760 === 0);
                                  }
                                  _c2768 = _c2767;
                                }
                                if (!(_c2768)) continue;
                                _g2756++;
                              }
                            }
                            let _c2895: boolean = ((_g2751 + 1) === (2 - _g2756));
                            if (!_c2895) {
                              let _q2769 = false;
                              Q2770: {
                                const _a2771 = sp.adj4[v_s];
                                const _n2772 = _i2628;
                                for (let _i2773 = 0; _i2773 < _n2772; _i2773++) {
                                  const v_z = _a2771[_i2773];
                                  const _t2774 = sp.adj4Edges[v_s][_i2773];
                                  let _c2793: boolean = !((_t2774 === _wc2282 ? true : (_t2774 === _wc2280 ? true : (b.grid[_t2774] !== 0))));
                                  if (_c2793) {
                                    let _g2775 = 0;
                                    G2776: {
                                      const _a2777 = sp.adj4[v_s];
                                      for (let _i2778 = 0; _i2778 < _a2777.length; _i2778++) {
                                        const _t2779 = sp.adj4Edges[v_s][_i2778];
                                        if (!(((_t2779 === _wc2282 ? _wd2283 : (_t2779 === _wc2280 ? _wd2281 : (b.grid[_t2779] || -1))) === 1))) continue;
                                        _g2775++;
                                      }
                                    }
                                    let _g2780 = 0;
                                    G2781: {
                                      for (let _i2782 = 0; _i2782 < 1; _i2782++) {
                                        const v_k = v_s;
                                        const _h2783 = clueAt(cl.number, v_k);
                                        const _h2790 = (_h2783 + 1);
                                        let _c2792: boolean = (_h2783 !== -1);
                                        if (_c2792) {
                                          let _c2791: boolean = (_h2298 || (_h2783 === 1));
                                          if (!_c2791) {
                                            let _g2784 = 0;
                                            G2785: {
                                              const _t2786 = (_h2783 + 1);
                                              const _a2787 = cluesValued(cl.number, _t2786);
                                              for (let _i2788 = 0; _i2788 < _a2787.length; _i2788++) {
                                                const v_x = _a2787[_i2788];
                                                const _h2789 = clueAt(cl.number, v_x);
                                                if (!((_h2789 === _h2790))) continue;
                                                _g2784++;
                                              }
                                            }
                                            _c2791 = (_g2784 === 0);
                                          }
                                          _c2792 = _c2791;
                                        }
                                        if (!(_c2792)) continue;
                                        _g2780++;
                                      }
                                    }
                                    _c2793 = (_g2775 < (2 - _g2780));
                                  }
                                  let _c2812: boolean = _c2793;
                                  if (_c2812) {
                                    let _g2794 = 0;
                                    G2795: {
                                      const _a2796 = sp.adj4[v_z];
                                      for (let _i2797 = 0; _i2797 < _a2796.length; _i2797++) {
                                        const _t2798 = sp.adj4Edges[v_z][_i2797];
                                        if (!(((_t2798 === _wc2282 ? _wd2283 : (_t2798 === _wc2280 ? _wd2281 : (b.grid[_t2798] || -1))) === 1))) continue;
                                        _g2794++;
                                      }
                                    }
                                    let _g2799 = 0;
                                    G2800: {
                                      for (let _i2801 = 0; _i2801 < 1; _i2801++) {
                                        const v_k = v_z;
                                        const _h2802 = clueAt(cl.number, v_k);
                                        const _h2809 = (_h2802 + 1);
                                        let _c2811: boolean = (_h2802 !== -1);
                                        if (_c2811) {
                                          let _c2810: boolean = (_h2298 || (_h2802 === 1));
                                          if (!_c2810) {
                                            let _g2803 = 0;
                                            G2804: {
                                              const _t2805 = (_h2802 + 1);
                                              const _a2806 = cluesValued(cl.number, _t2805);
                                              for (let _i2807 = 0; _i2807 < _a2806.length; _i2807++) {
                                                const v_x = _a2806[_i2807];
                                                const _h2808 = clueAt(cl.number, v_x);
                                                if (!((_h2808 === _h2809))) continue;
                                                _g2803++;
                                              }
                                            }
                                            _c2810 = (_g2803 === 0);
                                          }
                                          _c2811 = _c2810;
                                        }
                                        if (!(_c2811)) continue;
                                        _g2799++;
                                      }
                                    }
                                    _c2812 = (_g2794 < (2 - _g2799));
                                  }
                                  let _c2893: boolean = _c2812;
                                  if (_c2893) {
                                    let _q2813 = true;
                                    Q2814: {
                                      _g2815.length = 0;
                                      G2816: {
                                        for (let _i2818 = 0; _i2818 < 1; _i2818++) {
                                          const v_x = v_s;
                                          const _h2819 = clueAt(cl.number, v_x);
                                          if (!((_h2819 !== -1))) continue;
                                          _g2815.push(v_x);
                                        }
                                      }
                                      _g2820.length = 0;
                                      _st2833.pass++;
                                      G2821: {
                                        const _a2839 = throughWhere(sp, v_s, (_te2834: number): boolean => { let _c2836: boolean = ((_te2834 === _wc2282 ? _wd2283 : (_te2834 === _wc2280 ? _wd2281 : (b.grid[_te2834] || -1))) === 1); if (_c2836) {   const _t2835 = sp.edgeEnds[2 * _te2834];   _c2836 = !((clueAt(cl.number, _t2835) !== -1)); } let _c2838: boolean = _c2836; if (_c2838) {   const _t2837 = sp.edgeEnds[2 * _te2834 + 1];   _c2838 = !((clueAt(cl.number, _t2837) !== -1)); } return _c2838; });
                                        for (let _i2840 = 0; _i2840 < _a2839.length; _i2840++) {
                                          const v_t = _a2839[_i2840];
                                          const _h2843 = clueAt(cl.number, v_t);
                                          const _h2844 = (_h2843 !== -1);
                                          const _h2845 = _h2844;
                                          const _h2846 = !(_h2845);
                                          const _a2841 = sp.adj4[v_t];
                                          for (let _i2842 = 0; _i2842 < _a2841.length; _i2842++) {
                                            const v_x = _a2841[_i2842];
                                            const _h2847 = clueAt(cl.number, v_x);
                                            let _c2849: boolean = (_h2846 && (_h2847 !== -1));
                                            if (_c2849) {
                                              const _t2848 = sp.adj4Edges[v_t][_i2842];
                                              _c2849 = ((_t2848 === _wc2282 ? _wd2283 : (_t2848 === _wc2280 ? _wd2281 : (b.grid[_t2848] || -1))) === 1);
                                            }
                                            if (!(_c2849)) continue;
                                            const _t2850 = v_x;
                                            if (_g2820.length < 16) { if (!_g2820.includes(_t2850)) _g2820.push(_t2850); } else addOnce(_g2820, _st2833, _t2850);
                                          }
                                        }
                                      }
                                      const _a2851 = union(_g2815, _g2820);
                                      for (let _i2852 = 0; _i2852 < _a2851.length; _i2852++) {
                                        const v_p = _a2851[_i2852];
                                        const _h2891 = clueAt(cl.number, v_p);
                                        _g2853.length = 0;
                                        G2854: {
                                          for (let _i2856 = 0; _i2856 < 1; _i2856++) {
                                            const v_x = v_z;
                                            const _h2857 = clueAt(cl.number, v_x);
                                            if (!((_h2857 !== -1))) continue;
                                            _g2853.push(v_x);
                                          }
                                        }
                                        _g2858.length = 0;
                                        _st2871.pass++;
                                        G2859: {
                                          const _a2877 = throughWhere(sp, v_z, (_te2872: number): boolean => { let _c2874: boolean = ((_te2872 === _wc2282 ? _wd2283 : (_te2872 === _wc2280 ? _wd2281 : (b.grid[_te2872] || -1))) === 1); if (_c2874) {   const _t2873 = sp.edgeEnds[2 * _te2872];   _c2874 = !((clueAt(cl.number, _t2873) !== -1)); } let _c2876: boolean = _c2874; if (_c2876) {   const _t2875 = sp.edgeEnds[2 * _te2872 + 1];   _c2876 = !((clueAt(cl.number, _t2875) !== -1)); } return _c2876; });
                                          for (let _i2878 = 0; _i2878 < _a2877.length; _i2878++) {
                                            const v_t = _a2877[_i2878];
                                            const _h2881 = clueAt(cl.number, v_t);
                                            const _h2882 = (_h2881 !== -1);
                                            const _h2883 = _h2882;
                                            const _h2884 = !(_h2883);
                                            const _a2879 = sp.adj4[v_t];
                                            for (let _i2880 = 0; _i2880 < _a2879.length; _i2880++) {
                                              const v_x = _a2879[_i2880];
                                              const _h2885 = clueAt(cl.number, v_x);
                                              let _c2887: boolean = (_h2884 && (_h2885 !== -1));
                                              if (_c2887) {
                                                const _t2886 = sp.adj4Edges[v_t][_i2880];
                                                _c2887 = ((_t2886 === _wc2282 ? _wd2283 : (_t2886 === _wc2280 ? _wd2281 : (b.grid[_t2886] || -1))) === 1);
                                              }
                                              if (!(_c2887)) continue;
                                              const _t2888 = v_x;
                                              if (_g2858.length < 16) { if (!_g2858.includes(_t2888)) _g2858.push(_t2888); } else addOnce(_g2858, _st2871, _t2888);
                                            }
                                          }
                                        }
                                        const _a2889 = union(_g2853, _g2858);
                                        for (let _i2890 = 0; _i2890 < _a2889.length; _i2890++) {
                                          const v_q = _a2889[_i2890];
                                          const _h2892 = clueAt(cl.number, v_q);
                                          if (!((Math.abs((_h2891 - _h2892)) === cl.step))) {
                                            _q2813 = false;
                                            break Q2814;
                                          }
                                        }
                                      }
                                    }
                                    _c2893 = _q2813;
                                  }
                                  if ((_c2893 && (_h2298 || !(throughWhere(sp, v_s, (_te2894: number): boolean => {  return ((_te2894 === _wc2282 ? _wd2283 : (_te2894 === _wc2280 ? _wd2281 : (b.grid[_te2894] || -1))) === 1); }).includes(v_z))))) {
                                    _q2769 = true;
                                    break Q2770;
                                  }
                                }
                              }
                              _c2895 = _q2769;
                            }
                            if (_c2895) {
                              _q2625 = true;
                              break Q2626;
                            }
                          }
                        }
                        _c2896 = !(_q2625);
                      }
                      if (_c2896) {
                        _q2603 = true;
                        break Q2604;
                      }
                    }
                  }
                  _c2897 = _q2603;
                }
                if (_c2897) {
                  _q2284 = true;
                  break Q2285;
                }
              }
            }
            _c2898 = _q2284;
          }
          if (!(_c2898)) break L2274;
          if (b.made[0] !== _m177_0 || b.made[1] !== _m182_1) {
            let _g2899 = 0;
            G2900: {
              const _a2901 = sp.adj4[v_c];
              for (let _i2902 = 0; _i2902 < _a2901.length; _i2902++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i2902]] || -1) === 1))) continue;
                _g2899++;
              }
            }
            if (!(((takes(sp, cl, v_c) - _g2899) === 2))) { continue R1; }
            if (!(sameSet(v_U, ways(b, sp, cl, v_c)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g2903 = 0;
            G2904: {
              const _a2905 = sp.adj4[v_c];
              for (let _i2906 = 0; _i2906 < _a2905.length; _i2906++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i2906]] || -1) === 1))) continue;
                _g2903++;
              }
            }
            let _c3414: boolean = ((throughWhere(sp, v_i, (_te2907: number): boolean => {  return ((b.grid[_te2907] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
            if (!_c3414) {
              const _wc2908 = sp.edgeOf(v_c, v_i);
              const _wd2909 = 1;
              const _wc2910 = sp.edgeOf(v_c, v_j);
              const _wd2911 = 1;
              let _q2912 = false;
              Q2913: {
                const _a2915 = throughWhere(sp, v_c, (_te2914: number): boolean => {  return ((_te2914 === _wc2910 ? _wd2911 : (_te2914 === _wc2908 ? _wd2909 : (b.grid[_te2914] || -1))) === 1); });
                for (let _i2916 = 0; _i2916 < _a2915.length; _i2916++) {
                  const v_t = _a2915[_i2916];
                  let _c2932: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c2932) {
                    let _g2917 = 0;
                    G2918: {
                      const _a2919 = sp.adj4[v_t];
                      for (let _i2920 = 0; _i2920 < _a2919.length; _i2920++) {
                        const _t2921 = sp.adj4Edges[v_t][_i2920];
                        if (!(((_t2921 === _wc2910 ? _wd2911 : (_t2921 === _wc2908 ? _wd2909 : (b.grid[_t2921] || -1))) === 1))) continue;
                        _g2917++;
                      }
                    }
                    let _g2922 = 0;
                    G2923: {
                      for (let _i2924 = 0; _i2924 < 1; _i2924++) {
                        const v_k = v_t;
                        let _c2931: boolean = (clueAt(cl.number, v_k) !== -1);
                        if (_c2931) {
                          let _c2930: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                          if (!_c2930) {
                            let _g2925 = 0;
                            G2926: {
                              const _t2927 = (clueAt(cl.number, v_k) + 1);
                              const _a2928 = cluesValued(cl.number, _t2927);
                              for (let _i2929 = 0; _i2929 < _a2928.length; _i2929++) {
                                const v_x = _a2928[_i2929];
                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                _g2925++;
                              }
                            }
                            _c2930 = (_g2925 === 0);
                          }
                          _c2931 = _c2930;
                        }
                        if (!(_c2931)) continue;
                        _g2922++;
                      }
                    }
                    _c2932 = (_g2917 < (2 - _g2922));
                  }
                  if (!(_c2932)) continue;
                  let _g2933 = 0;
                  G2934: {
                    const _a2935 = sp.adj4[v_t];
                    for (let _i2936 = 0; _i2936 < _a2935.length; _i2936++) {
                      const _t2937 = sp.adj4Edges[v_t][_i2936];
                      if (!(((_t2937 === _wc2910 ? _wd2911 : (_t2937 === _wc2908 ? _wd2909 : (b.grid[_t2937] || -1))) === 1))) continue;
                      _g2933++;
                    }
                  }
                  let _g2938 = 0;
                  G2939: {
                    for (let _i2940 = 0; _i2940 < 1; _i2940++) {
                      const v_k = v_t;
                      let _c2947: boolean = (clueAt(cl.number, v_k) !== -1);
                      if (_c2947) {
                        let _c2946: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                        if (!_c2946) {
                          let _g2941 = 0;
                          G2942: {
                            const _t2943 = (clueAt(cl.number, v_k) + 1);
                            const _a2944 = cluesValued(cl.number, _t2943);
                            for (let _i2945 = 0; _i2945 < _a2944.length; _i2945++) {
                              const v_x = _a2944[_i2945];
                              if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                              _g2941++;
                            }
                          }
                          _c2946 = (_g2941 === 0);
                        }
                        _c2947 = _c2946;
                      }
                      if (!(_c2947)) continue;
                      _g2938++;
                    }
                  }
                  let _c3172: boolean = (_g2933 < (2 - _g2938));
                  if (_c3172) {
                    let _q2948 = false;
                    Q2949: {
                      const _a2950 = sp.adj4[v_t];
                      for (let _i2951 = 0; _i2951 < _a2950.length; _i2951++) {
                        const v_y = _a2950[_i2951];
                        const _t2952 = sp.adj4Edges[v_t][_i2951];
                        let _c2968: boolean = !((_t2952 === _wc2910 ? true : (_t2952 === _wc2908 ? true : (b.grid[_t2952] !== 0))));
                        if (_c2968) {
                          let _g2953 = 0;
                          G2954: {
                            const _a2955 = sp.adj4[v_t];
                            for (let _i2956 = 0; _i2956 < _a2955.length; _i2956++) {
                              const _t2957 = sp.adj4Edges[v_t][_i2956];
                              if (!(((_t2957 === _wc2910 ? _wd2911 : (_t2957 === _wc2908 ? _wd2909 : (b.grid[_t2957] || -1))) === 1))) continue;
                              _g2953++;
                            }
                          }
                          let _g2958 = 0;
                          G2959: {
                            for (let _i2960 = 0; _i2960 < 1; _i2960++) {
                              const v_k = v_t;
                              let _c2967: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c2967) {
                                let _c2966: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c2966) {
                                  let _g2961 = 0;
                                  G2962: {
                                    const _t2963 = (clueAt(cl.number, v_k) + 1);
                                    const _a2964 = cluesValued(cl.number, _t2963);
                                    for (let _i2965 = 0; _i2965 < _a2964.length; _i2965++) {
                                      const v_x = _a2964[_i2965];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g2961++;
                                    }
                                  }
                                  _c2966 = (_g2961 === 0);
                                }
                                _c2967 = _c2966;
                              }
                              if (!(_c2967)) continue;
                              _g2958++;
                            }
                          }
                          _c2968 = (_g2953 < (2 - _g2958));
                        }
                        let _c2985: boolean = _c2968;
                        if (_c2985) {
                          let _g2969 = 0;
                          G2970: {
                            const _a2972 = sp.adj4[v_y];
                            for (let _i2973 = 0; _i2973 < _a2972.length; _i2973++) {
                              const _t2974 = sp.adj4Edges[v_y][_i2973];
                              if (!(((_t2974 === _wc2910 ? _wd2911 : (_t2974 === _wc2908 ? _wd2909 : (b.grid[_t2974] || -1))) === 1))) continue;
                              _g2969++;
                            }
                          }
                          let _g2975 = 0;
                          G2976: {
                            for (let _i2977 = 0; _i2977 < 1; _i2977++) {
                              const v_k = v_y;
                              let _c2984: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c2984) {
                                let _c2983: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c2983) {
                                  let _g2978 = 0;
                                  G2979: {
                                    const _t2980 = (clueAt(cl.number, v_k) + 1);
                                    const _a2981 = cluesValued(cl.number, _t2980);
                                    for (let _i2982 = 0; _i2982 < _a2981.length; _i2982++) {
                                      const v_x = _a2981[_i2982];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g2978++;
                                    }
                                  }
                                  _c2983 = (_g2978 === 0);
                                }
                                _c2984 = _c2983;
                              }
                              if (!(_c2984)) continue;
                              _g2975++;
                            }
                          }
                          _c2985 = (_g2969 < (2 - _g2975));
                        }
                        let _c3050: boolean = _c2985;
                        if (_c3050) {
                          let _q2986 = true;
                          Q2987: {
                            const _g2988: number[] = [];
                            G2989: {
                              for (let _i2991 = 0; _i2991 < 1; _i2991++) {
                                const v_x = v_t;
                                if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                _g2988.push(v_x);
                              }
                            }
                            const _g2992: number[] = [];
                            G2993: {
                              const _a3012 = throughWhere(sp, v_t, (_te3007: number): boolean => { let _c3009: boolean = ((_te3007 === _wc2910 ? _wd2911 : (_te3007 === _wc2908 ? _wd2909 : (b.grid[_te3007] || -1))) === 1); if (_c3009) {   const _t3008 = sp.edgeEnds[2 * _te3007];   _c3009 = !((clueAt(cl.number, _t3008) !== -1)); } let _c3011: boolean = _c3009; if (_c3011) {   const _t3010 = sp.edgeEnds[2 * _te3007 + 1];   _c3011 = !((clueAt(cl.number, _t3010) !== -1)); } return _c3011; });
                              for (let _i3013 = 0; _i3013 < _a3012.length; _i3013++) {
                                const v_t_3006 = _a3012[_i3013];
                                const _a3014 = sp.adj4[v_t_3006];
                                for (let _i3015 = 0; _i3015 < _a3014.length; _i3015++) {
                                  const v_x = _a3014[_i3015];
                                  let _c3017: boolean = (!((clueAt(cl.number, v_t_3006) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                  if (_c3017) {
                                    const _t3016 = sp.adj4Edges[v_t_3006][_i3015];
                                    _c3017 = ((_t3016 === _wc2910 ? _wd2911 : (_t3016 === _wc2908 ? _wd2909 : (b.grid[_t3016] || -1))) === 1);
                                  }
                                  if (!(_c3017)) continue;
                                  if (!_g2992.includes(v_x)) _g2992.push(v_x);
                                }
                              }
                            }
                            const _a3018 = union(_g2988, _g2992);
                            for (let _i3019 = 0; _i3019 < _a3018.length; _i3019++) {
                              const v_p = _a3018[_i3019];
                              const _g3020: number[] = [];
                              G3021: {
                                for (let _i3023 = 0; _i3023 < 1; _i3023++) {
                                  const v_x = v_y;
                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                  _g3020.push(v_x);
                                }
                              }
                              const _g3024: number[] = [];
                              G3025: {
                                const _a3042 = throughWhere(sp, v_y, (_te3037: number): boolean => { let _c3039: boolean = ((_te3037 === _wc2910 ? _wd2911 : (_te3037 === _wc2908 ? _wd2909 : (b.grid[_te3037] || -1))) === 1); if (_c3039) {   const _t3038 = sp.edgeEnds[2 * _te3037];   _c3039 = !((clueAt(cl.number, _t3038) !== -1)); } let _c3041: boolean = _c3039; if (_c3041) {   const _t3040 = sp.edgeEnds[2 * _te3037 + 1];   _c3041 = !((clueAt(cl.number, _t3040) !== -1)); } return _c3041; });
                                for (let _i3043 = 0; _i3043 < _a3042.length; _i3043++) {
                                  const v_t = _a3042[_i3043];
                                  const _a3044 = sp.adj4[v_t];
                                  for (let _i3045 = 0; _i3045 < _a3044.length; _i3045++) {
                                    const v_x = _a3044[_i3045];
                                    let _c3047: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                    if (_c3047) {
                                      const _t3046 = sp.adj4Edges[v_t][_i3045];
                                      _c3047 = ((_t3046 === _wc2910 ? _wd2911 : (_t3046 === _wc2908 ? _wd2909 : (b.grid[_t3046] || -1))) === 1);
                                    }
                                    if (!(_c3047)) continue;
                                    if (!_g3024.includes(v_x)) _g3024.push(v_x);
                                  }
                                }
                              }
                              const _a3048 = union(_g3020, _g3024);
                              for (let _i3049 = 0; _i3049 < _a3048.length; _i3049++) {
                                const v_q = _a3048[_i3049];
                                if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                  _q2986 = false;
                                  break Q2987;
                                }
                              }
                            }
                          }
                          _c3050 = _q2986;
                        }
                        if (!((_c3050 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te3051: number): boolean => {  return ((_te3051 === _wc2910 ? _wd2911 : (_te3051 === _wc2908 ? _wd2909 : (b.grid[_te3051] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g3052 = 0;
                        G3053: {
                          const _a3054 = sp.adj4[v_t];
                          for (let _i3055 = 0; _i3055 < _a3054.length; _i3055++) {
                            const _t3056 = sp.adj4Edges[v_t][_i3055];
                            if (!(((_t3056 === _wc2910 ? _wd2911 : (_t3056 === _wc2908 ? _wd2909 : (b.grid[_t3056] || -1))) === 1))) continue;
                            _g3052++;
                          }
                        }
                        let _g3057 = 0;
                        G3058: {
                          for (let _i3059 = 0; _i3059 < 1; _i3059++) {
                            const v_k = v_t;
                            let _c3066: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c3066) {
                              let _c3065: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c3065) {
                                let _g3060 = 0;
                                G3061: {
                                  const _t3062 = (clueAt(cl.number, v_k) + 1);
                                  const _a3063 = cluesValued(cl.number, _t3062);
                                  for (let _i3064 = 0; _i3064 < _a3063.length; _i3064++) {
                                    const v_x = _a3063[_i3064];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g3060++;
                                  }
                                }
                                _c3065 = (_g3060 === 0);
                              }
                              _c3066 = _c3065;
                            }
                            if (!(_c3066)) continue;
                            _g3057++;
                          }
                        }
                        let _c3171: boolean = ((_g3052 + 1) === (2 - _g3057));
                        if (!_c3171) {
                          let _q3067 = false;
                          Q3068: {
                            const _a3069 = sp.adj4[v_t];
                            const _n3070 = _i2951;
                            for (let _i3071 = 0; _i3071 < _n3070; _i3071++) {
                              const v_z = _a3069[_i3071];
                              const _t3072 = sp.adj4Edges[v_t][_i3071];
                              let _c3088: boolean = !((_t3072 === _wc2910 ? true : (_t3072 === _wc2908 ? true : (b.grid[_t3072] !== 0))));
                              if (_c3088) {
                                let _g3073 = 0;
                                G3074: {
                                  const _a3075 = sp.adj4[v_t];
                                  for (let _i3076 = 0; _i3076 < _a3075.length; _i3076++) {
                                    const _t3077 = sp.adj4Edges[v_t][_i3076];
                                    if (!(((_t3077 === _wc2910 ? _wd2911 : (_t3077 === _wc2908 ? _wd2909 : (b.grid[_t3077] || -1))) === 1))) continue;
                                    _g3073++;
                                  }
                                }
                                let _g3078 = 0;
                                G3079: {
                                  for (let _i3080 = 0; _i3080 < 1; _i3080++) {
                                    const v_k = v_t;
                                    let _c3087: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c3087) {
                                      let _c3086: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c3086) {
                                        let _g3081 = 0;
                                        G3082: {
                                          const _t3083 = (clueAt(cl.number, v_k) + 1);
                                          const _a3084 = cluesValued(cl.number, _t3083);
                                          for (let _i3085 = 0; _i3085 < _a3084.length; _i3085++) {
                                            const v_x = _a3084[_i3085];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g3081++;
                                          }
                                        }
                                        _c3086 = (_g3081 === 0);
                                      }
                                      _c3087 = _c3086;
                                    }
                                    if (!(_c3087)) continue;
                                    _g3078++;
                                  }
                                }
                                _c3088 = (_g3073 < (2 - _g3078));
                              }
                              let _c3104: boolean = _c3088;
                              if (_c3104) {
                                let _g3089 = 0;
                                G3090: {
                                  const _a3091 = sp.adj4[v_z];
                                  for (let _i3092 = 0; _i3092 < _a3091.length; _i3092++) {
                                    const _t3093 = sp.adj4Edges[v_z][_i3092];
                                    if (!(((_t3093 === _wc2910 ? _wd2911 : (_t3093 === _wc2908 ? _wd2909 : (b.grid[_t3093] || -1))) === 1))) continue;
                                    _g3089++;
                                  }
                                }
                                let _g3094 = 0;
                                G3095: {
                                  for (let _i3096 = 0; _i3096 < 1; _i3096++) {
                                    const v_k = v_z;
                                    let _c3103: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c3103) {
                                      let _c3102: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c3102) {
                                        let _g3097 = 0;
                                        G3098: {
                                          const _t3099 = (clueAt(cl.number, v_k) + 1);
                                          const _a3100 = cluesValued(cl.number, _t3099);
                                          for (let _i3101 = 0; _i3101 < _a3100.length; _i3101++) {
                                            const v_x = _a3100[_i3101];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g3097++;
                                          }
                                        }
                                        _c3102 = (_g3097 === 0);
                                      }
                                      _c3103 = _c3102;
                                    }
                                    if (!(_c3103)) continue;
                                    _g3094++;
                                  }
                                }
                                _c3104 = (_g3089 < (2 - _g3094));
                              }
                              let _c3169: boolean = _c3104;
                              if (_c3169) {
                                let _q3105 = true;
                                Q3106: {
                                  const _g3107: number[] = [];
                                  G3108: {
                                    for (let _i3110 = 0; _i3110 < 1; _i3110++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g3107.push(v_x);
                                    }
                                  }
                                  const _g3111: number[] = [];
                                  G3112: {
                                    const _a3131 = throughWhere(sp, v_t, (_te3126: number): boolean => { let _c3128: boolean = ((_te3126 === _wc2910 ? _wd2911 : (_te3126 === _wc2908 ? _wd2909 : (b.grid[_te3126] || -1))) === 1); if (_c3128) {   const _t3127 = sp.edgeEnds[2 * _te3126];   _c3128 = !((clueAt(cl.number, _t3127) !== -1)); } let _c3130: boolean = _c3128; if (_c3130) {   const _t3129 = sp.edgeEnds[2 * _te3126 + 1];   _c3130 = !((clueAt(cl.number, _t3129) !== -1)); } return _c3130; });
                                    for (let _i3132 = 0; _i3132 < _a3131.length; _i3132++) {
                                      const v_t_3125 = _a3131[_i3132];
                                      const _a3133 = sp.adj4[v_t_3125];
                                      for (let _i3134 = 0; _i3134 < _a3133.length; _i3134++) {
                                        const v_x = _a3133[_i3134];
                                        let _c3136: boolean = (!((clueAt(cl.number, v_t_3125) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c3136) {
                                          const _t3135 = sp.adj4Edges[v_t_3125][_i3134];
                                          _c3136 = ((_t3135 === _wc2910 ? _wd2911 : (_t3135 === _wc2908 ? _wd2909 : (b.grid[_t3135] || -1))) === 1);
                                        }
                                        if (!(_c3136)) continue;
                                        if (!_g3111.includes(v_x)) _g3111.push(v_x);
                                      }
                                    }
                                  }
                                  const _a3137 = union(_g3107, _g3111);
                                  for (let _i3138 = 0; _i3138 < _a3137.length; _i3138++) {
                                    const v_p = _a3137[_i3138];
                                    const _g3139: number[] = [];
                                    G3140: {
                                      for (let _i3142 = 0; _i3142 < 1; _i3142++) {
                                        const v_x = v_z;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g3139.push(v_x);
                                      }
                                    }
                                    const _g3143: number[] = [];
                                    G3144: {
                                      const _a3161 = throughWhere(sp, v_z, (_te3156: number): boolean => { let _c3158: boolean = ((_te3156 === _wc2910 ? _wd2911 : (_te3156 === _wc2908 ? _wd2909 : (b.grid[_te3156] || -1))) === 1); if (_c3158) {   const _t3157 = sp.edgeEnds[2 * _te3156];   _c3158 = !((clueAt(cl.number, _t3157) !== -1)); } let _c3160: boolean = _c3158; if (_c3160) {   const _t3159 = sp.edgeEnds[2 * _te3156 + 1];   _c3160 = !((clueAt(cl.number, _t3159) !== -1)); } return _c3160; });
                                      for (let _i3162 = 0; _i3162 < _a3161.length; _i3162++) {
                                        const v_t = _a3161[_i3162];
                                        const _a3163 = sp.adj4[v_t];
                                        for (let _i3164 = 0; _i3164 < _a3163.length; _i3164++) {
                                          const v_x = _a3163[_i3164];
                                          let _c3166: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c3166) {
                                            const _t3165 = sp.adj4Edges[v_t][_i3164];
                                            _c3166 = ((_t3165 === _wc2910 ? _wd2911 : (_t3165 === _wc2908 ? _wd2909 : (b.grid[_t3165] || -1))) === 1);
                                          }
                                          if (!(_c3166)) continue;
                                          if (!_g3143.includes(v_x)) _g3143.push(v_x);
                                        }
                                      }
                                    }
                                    const _a3167 = union(_g3139, _g3143);
                                    for (let _i3168 = 0; _i3168 < _a3167.length; _i3168++) {
                                      const v_q = _a3167[_i3168];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q3105 = false;
                                        break Q3106;
                                      }
                                    }
                                  }
                                }
                                _c3169 = _q3105;
                              }
                              if ((_c3169 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te3170: number): boolean => {  return ((_te3170 === _wc2910 ? _wd2911 : (_te3170 === _wc2908 ? _wd2909 : (b.grid[_te3170] || -1))) === 1); }).includes(v_z))))) {
                                _q3067 = true;
                                break Q3068;
                              }
                            }
                          }
                          _c3171 = _q3067;
                        }
                        if (_c3171) {
                          _q2948 = true;
                          break Q2949;
                        }
                      }
                    }
                    _c3172 = !(_q2948);
                  }
                  let _c3413: boolean = _c3172;
                  if (!_c3413) {
                    let _q3173 = false;
                    Q3174: {
                      const _a3175 = sp.adj4[v_t];
                      for (let _i3176 = 0; _i3176 < _a3175.length; _i3176++) {
                        const v_s = _a3175[_i3176];
                        let _g3177 = 0;
                        G3178: {
                          const _a3179 = sp.adj4[v_s];
                          for (let _i3180 = 0; _i3180 < _a3179.length; _i3180++) {
                            const _t3181 = sp.adj4Edges[v_s][_i3180];
                            if (!(((_t3181 === _wc2910 ? _wd2911 : (_t3181 === _wc2908 ? _wd2909 : (b.grid[_t3181] || -1))) === 1))) continue;
                            _g3177++;
                          }
                        }
                        let _g3182 = 0;
                        G3183: {
                          for (let _i3184 = 0; _i3184 < 1; _i3184++) {
                            const v_k = v_s;
                            let _c3191: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c3191) {
                              let _c3190: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c3190) {
                                let _g3185 = 0;
                                G3186: {
                                  const _t3187 = (clueAt(cl.number, v_k) + 1);
                                  const _a3188 = cluesValued(cl.number, _t3187);
                                  for (let _i3189 = 0; _i3189 < _a3188.length; _i3189++) {
                                    const v_x = _a3188[_i3189];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g3185++;
                                  }
                                }
                                _c3190 = (_g3185 === 0);
                              }
                              _c3191 = _c3190;
                            }
                            if (!(_c3191)) continue;
                            _g3182++;
                          }
                        }
                        let _c3412: boolean = (_g3177 < (2 - _g3182));
                        if (_c3412) {
                          let _q3192 = false;
                          Q3193: {
                            const _a3194 = sp.adj4[v_s];
                            for (let _i3195 = 0; _i3195 < _a3194.length; _i3195++) {
                              const v_y = _a3194[_i3195];
                              const _t3196 = sp.adj4Edges[v_s][_i3195];
                              let _c3212: boolean = !((_t3196 === _wc2910 ? true : (_t3196 === _wc2908 ? true : (b.grid[_t3196] !== 0))));
                              if (_c3212) {
                                let _g3197 = 0;
                                G3198: {
                                  const _a3199 = sp.adj4[v_s];
                                  for (let _i3200 = 0; _i3200 < _a3199.length; _i3200++) {
                                    const _t3201 = sp.adj4Edges[v_s][_i3200];
                                    if (!(((_t3201 === _wc2910 ? _wd2911 : (_t3201 === _wc2908 ? _wd2909 : (b.grid[_t3201] || -1))) === 1))) continue;
                                    _g3197++;
                                  }
                                }
                                let _g3202 = 0;
                                G3203: {
                                  for (let _i3204 = 0; _i3204 < 1; _i3204++) {
                                    const v_k = v_s;
                                    let _c3211: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c3211) {
                                      let _c3210: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c3210) {
                                        let _g3205 = 0;
                                        G3206: {
                                          const _t3207 = (clueAt(cl.number, v_k) + 1);
                                          const _a3208 = cluesValued(cl.number, _t3207);
                                          for (let _i3209 = 0; _i3209 < _a3208.length; _i3209++) {
                                            const v_x = _a3208[_i3209];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g3205++;
                                          }
                                        }
                                        _c3210 = (_g3205 === 0);
                                      }
                                      _c3211 = _c3210;
                                    }
                                    if (!(_c3211)) continue;
                                    _g3202++;
                                  }
                                }
                                _c3212 = (_g3197 < (2 - _g3202));
                              }
                              let _c3229: boolean = _c3212;
                              if (_c3229) {
                                let _g3213 = 0;
                                G3214: {
                                  const _a3216 = sp.adj4[v_y];
                                  for (let _i3217 = 0; _i3217 < _a3216.length; _i3217++) {
                                    const _t3218 = sp.adj4Edges[v_y][_i3217];
                                    if (!(((_t3218 === _wc2910 ? _wd2911 : (_t3218 === _wc2908 ? _wd2909 : (b.grid[_t3218] || -1))) === 1))) continue;
                                    _g3213++;
                                  }
                                }
                                let _g3219 = 0;
                                G3220: {
                                  for (let _i3221 = 0; _i3221 < 1; _i3221++) {
                                    const v_k = v_y;
                                    let _c3228: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c3228) {
                                      let _c3227: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c3227) {
                                        let _g3222 = 0;
                                        G3223: {
                                          const _t3224 = (clueAt(cl.number, v_k) + 1);
                                          const _a3225 = cluesValued(cl.number, _t3224);
                                          for (let _i3226 = 0; _i3226 < _a3225.length; _i3226++) {
                                            const v_x = _a3225[_i3226];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g3222++;
                                          }
                                        }
                                        _c3227 = (_g3222 === 0);
                                      }
                                      _c3228 = _c3227;
                                    }
                                    if (!(_c3228)) continue;
                                    _g3219++;
                                  }
                                }
                                _c3229 = (_g3213 < (2 - _g3219));
                              }
                              let _c3292: boolean = _c3229;
                              if (_c3292) {
                                let _q3230 = true;
                                Q3231: {
                                  const _g3232: number[] = [];
                                  G3233: {
                                    for (let _i3235 = 0; _i3235 < 1; _i3235++) {
                                      const v_x = v_s;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g3232.push(v_x);
                                    }
                                  }
                                  const _g3236: number[] = [];
                                  G3237: {
                                    const _a3254 = throughWhere(sp, v_s, (_te3249: number): boolean => { let _c3251: boolean = ((_te3249 === _wc2910 ? _wd2911 : (_te3249 === _wc2908 ? _wd2909 : (b.grid[_te3249] || -1))) === 1); if (_c3251) {   const _t3250 = sp.edgeEnds[2 * _te3249];   _c3251 = !((clueAt(cl.number, _t3250) !== -1)); } let _c3253: boolean = _c3251; if (_c3253) {   const _t3252 = sp.edgeEnds[2 * _te3249 + 1];   _c3253 = !((clueAt(cl.number, _t3252) !== -1)); } return _c3253; });
                                    for (let _i3255 = 0; _i3255 < _a3254.length; _i3255++) {
                                      const v_t = _a3254[_i3255];
                                      const _a3256 = sp.adj4[v_t];
                                      for (let _i3257 = 0; _i3257 < _a3256.length; _i3257++) {
                                        const v_x = _a3256[_i3257];
                                        let _c3259: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c3259) {
                                          const _t3258 = sp.adj4Edges[v_t][_i3257];
                                          _c3259 = ((_t3258 === _wc2910 ? _wd2911 : (_t3258 === _wc2908 ? _wd2909 : (b.grid[_t3258] || -1))) === 1);
                                        }
                                        if (!(_c3259)) continue;
                                        if (!_g3236.includes(v_x)) _g3236.push(v_x);
                                      }
                                    }
                                  }
                                  const _a3260 = union(_g3232, _g3236);
                                  for (let _i3261 = 0; _i3261 < _a3260.length; _i3261++) {
                                    const v_p = _a3260[_i3261];
                                    const _g3262: number[] = [];
                                    G3263: {
                                      for (let _i3265 = 0; _i3265 < 1; _i3265++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g3262.push(v_x);
                                      }
                                    }
                                    const _g3266: number[] = [];
                                    G3267: {
                                      const _a3284 = throughWhere(sp, v_y, (_te3279: number): boolean => { let _c3281: boolean = ((_te3279 === _wc2910 ? _wd2911 : (_te3279 === _wc2908 ? _wd2909 : (b.grid[_te3279] || -1))) === 1); if (_c3281) {   const _t3280 = sp.edgeEnds[2 * _te3279];   _c3281 = !((clueAt(cl.number, _t3280) !== -1)); } let _c3283: boolean = _c3281; if (_c3283) {   const _t3282 = sp.edgeEnds[2 * _te3279 + 1];   _c3283 = !((clueAt(cl.number, _t3282) !== -1)); } return _c3283; });
                                      for (let _i3285 = 0; _i3285 < _a3284.length; _i3285++) {
                                        const v_t = _a3284[_i3285];
                                        const _a3286 = sp.adj4[v_t];
                                        for (let _i3287 = 0; _i3287 < _a3286.length; _i3287++) {
                                          const v_x = _a3286[_i3287];
                                          let _c3289: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c3289) {
                                            const _t3288 = sp.adj4Edges[v_t][_i3287];
                                            _c3289 = ((_t3288 === _wc2910 ? _wd2911 : (_t3288 === _wc2908 ? _wd2909 : (b.grid[_t3288] || -1))) === 1);
                                          }
                                          if (!(_c3289)) continue;
                                          if (!_g3266.includes(v_x)) _g3266.push(v_x);
                                        }
                                      }
                                    }
                                    const _a3290 = union(_g3262, _g3266);
                                    for (let _i3291 = 0; _i3291 < _a3290.length; _i3291++) {
                                      const v_q = _a3290[_i3291];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q3230 = false;
                                        break Q3231;
                                      }
                                    }
                                  }
                                }
                                _c3292 = _q3230;
                              }
                              if (!((_c3292 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te3293: number): boolean => {  return ((_te3293 === _wc2910 ? _wd2911 : (_te3293 === _wc2908 ? _wd2909 : (b.grid[_te3293] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g3294 = 0;
                              G3295: {
                                const _a3296 = sp.adj4[v_s];
                                for (let _i3297 = 0; _i3297 < _a3296.length; _i3297++) {
                                  const _t3298 = sp.adj4Edges[v_s][_i3297];
                                  if (!(((_t3298 === _wc2910 ? _wd2911 : (_t3298 === _wc2908 ? _wd2909 : (b.grid[_t3298] || -1))) === 1))) continue;
                                  _g3294++;
                                }
                              }
                              let _g3299 = 0;
                              G3300: {
                                for (let _i3301 = 0; _i3301 < 1; _i3301++) {
                                  const v_k = v_s;
                                  let _c3308: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c3308) {
                                    let _c3307: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c3307) {
                                      let _g3302 = 0;
                                      G3303: {
                                        const _t3304 = (clueAt(cl.number, v_k) + 1);
                                        const _a3305 = cluesValued(cl.number, _t3304);
                                        for (let _i3306 = 0; _i3306 < _a3305.length; _i3306++) {
                                          const v_x = _a3305[_i3306];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g3302++;
                                        }
                                      }
                                      _c3307 = (_g3302 === 0);
                                    }
                                    _c3308 = _c3307;
                                  }
                                  if (!(_c3308)) continue;
                                  _g3299++;
                                }
                              }
                              let _c3411: boolean = ((_g3294 + 1) === (2 - _g3299));
                              if (!_c3411) {
                                let _q3309 = false;
                                Q3310: {
                                  const _a3311 = sp.adj4[v_s];
                                  const _n3312 = _i3195;
                                  for (let _i3313 = 0; _i3313 < _n3312; _i3313++) {
                                    const v_z = _a3311[_i3313];
                                    const _t3314 = sp.adj4Edges[v_s][_i3313];
                                    let _c3330: boolean = !((_t3314 === _wc2910 ? true : (_t3314 === _wc2908 ? true : (b.grid[_t3314] !== 0))));
                                    if (_c3330) {
                                      let _g3315 = 0;
                                      G3316: {
                                        const _a3317 = sp.adj4[v_s];
                                        for (let _i3318 = 0; _i3318 < _a3317.length; _i3318++) {
                                          const _t3319 = sp.adj4Edges[v_s][_i3318];
                                          if (!(((_t3319 === _wc2910 ? _wd2911 : (_t3319 === _wc2908 ? _wd2909 : (b.grid[_t3319] || -1))) === 1))) continue;
                                          _g3315++;
                                        }
                                      }
                                      let _g3320 = 0;
                                      G3321: {
                                        for (let _i3322 = 0; _i3322 < 1; _i3322++) {
                                          const v_k = v_s;
                                          let _c3329: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c3329) {
                                            let _c3328: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c3328) {
                                              let _g3323 = 0;
                                              G3324: {
                                                const _t3325 = (clueAt(cl.number, v_k) + 1);
                                                const _a3326 = cluesValued(cl.number, _t3325);
                                                for (let _i3327 = 0; _i3327 < _a3326.length; _i3327++) {
                                                  const v_x = _a3326[_i3327];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g3323++;
                                                }
                                              }
                                              _c3328 = (_g3323 === 0);
                                            }
                                            _c3329 = _c3328;
                                          }
                                          if (!(_c3329)) continue;
                                          _g3320++;
                                        }
                                      }
                                      _c3330 = (_g3315 < (2 - _g3320));
                                    }
                                    let _c3346: boolean = _c3330;
                                    if (_c3346) {
                                      let _g3331 = 0;
                                      G3332: {
                                        const _a3333 = sp.adj4[v_z];
                                        for (let _i3334 = 0; _i3334 < _a3333.length; _i3334++) {
                                          const _t3335 = sp.adj4Edges[v_z][_i3334];
                                          if (!(((_t3335 === _wc2910 ? _wd2911 : (_t3335 === _wc2908 ? _wd2909 : (b.grid[_t3335] || -1))) === 1))) continue;
                                          _g3331++;
                                        }
                                      }
                                      let _g3336 = 0;
                                      G3337: {
                                        for (let _i3338 = 0; _i3338 < 1; _i3338++) {
                                          const v_k = v_z;
                                          let _c3345: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c3345) {
                                            let _c3344: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c3344) {
                                              let _g3339 = 0;
                                              G3340: {
                                                const _t3341 = (clueAt(cl.number, v_k) + 1);
                                                const _a3342 = cluesValued(cl.number, _t3341);
                                                for (let _i3343 = 0; _i3343 < _a3342.length; _i3343++) {
                                                  const v_x = _a3342[_i3343];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g3339++;
                                                }
                                              }
                                              _c3344 = (_g3339 === 0);
                                            }
                                            _c3345 = _c3344;
                                          }
                                          if (!(_c3345)) continue;
                                          _g3336++;
                                        }
                                      }
                                      _c3346 = (_g3331 < (2 - _g3336));
                                    }
                                    let _c3409: boolean = _c3346;
                                    if (_c3409) {
                                      let _q3347 = true;
                                      Q3348: {
                                        const _g3349: number[] = [];
                                        G3350: {
                                          for (let _i3352 = 0; _i3352 < 1; _i3352++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g3349.push(v_x);
                                          }
                                        }
                                        const _g3353: number[] = [];
                                        G3354: {
                                          const _a3371 = throughWhere(sp, v_s, (_te3366: number): boolean => { let _c3368: boolean = ((_te3366 === _wc2910 ? _wd2911 : (_te3366 === _wc2908 ? _wd2909 : (b.grid[_te3366] || -1))) === 1); if (_c3368) {   const _t3367 = sp.edgeEnds[2 * _te3366];   _c3368 = !((clueAt(cl.number, _t3367) !== -1)); } let _c3370: boolean = _c3368; if (_c3370) {   const _t3369 = sp.edgeEnds[2 * _te3366 + 1];   _c3370 = !((clueAt(cl.number, _t3369) !== -1)); } return _c3370; });
                                          for (let _i3372 = 0; _i3372 < _a3371.length; _i3372++) {
                                            const v_t = _a3371[_i3372];
                                            const _a3373 = sp.adj4[v_t];
                                            for (let _i3374 = 0; _i3374 < _a3373.length; _i3374++) {
                                              const v_x = _a3373[_i3374];
                                              let _c3376: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c3376) {
                                                const _t3375 = sp.adj4Edges[v_t][_i3374];
                                                _c3376 = ((_t3375 === _wc2910 ? _wd2911 : (_t3375 === _wc2908 ? _wd2909 : (b.grid[_t3375] || -1))) === 1);
                                              }
                                              if (!(_c3376)) continue;
                                              if (!_g3353.includes(v_x)) _g3353.push(v_x);
                                            }
                                          }
                                        }
                                        const _a3377 = union(_g3349, _g3353);
                                        for (let _i3378 = 0; _i3378 < _a3377.length; _i3378++) {
                                          const v_p = _a3377[_i3378];
                                          const _g3379: number[] = [];
                                          G3380: {
                                            for (let _i3382 = 0; _i3382 < 1; _i3382++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g3379.push(v_x);
                                            }
                                          }
                                          const _g3383: number[] = [];
                                          G3384: {
                                            const _a3401 = throughWhere(sp, v_z, (_te3396: number): boolean => { let _c3398: boolean = ((_te3396 === _wc2910 ? _wd2911 : (_te3396 === _wc2908 ? _wd2909 : (b.grid[_te3396] || -1))) === 1); if (_c3398) {   const _t3397 = sp.edgeEnds[2 * _te3396];   _c3398 = !((clueAt(cl.number, _t3397) !== -1)); } let _c3400: boolean = _c3398; if (_c3400) {   const _t3399 = sp.edgeEnds[2 * _te3396 + 1];   _c3400 = !((clueAt(cl.number, _t3399) !== -1)); } return _c3400; });
                                            for (let _i3402 = 0; _i3402 < _a3401.length; _i3402++) {
                                              const v_t = _a3401[_i3402];
                                              const _a3403 = sp.adj4[v_t];
                                              for (let _i3404 = 0; _i3404 < _a3403.length; _i3404++) {
                                                const v_x = _a3403[_i3404];
                                                let _c3406: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c3406) {
                                                  const _t3405 = sp.adj4Edges[v_t][_i3404];
                                                  _c3406 = ((_t3405 === _wc2910 ? _wd2911 : (_t3405 === _wc2908 ? _wd2909 : (b.grid[_t3405] || -1))) === 1);
                                                }
                                                if (!(_c3406)) continue;
                                                if (!_g3383.includes(v_x)) _g3383.push(v_x);
                                              }
                                            }
                                          }
                                          const _a3407 = union(_g3379, _g3383);
                                          for (let _i3408 = 0; _i3408 < _a3407.length; _i3408++) {
                                            const v_q = _a3407[_i3408];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q3347 = false;
                                              break Q3348;
                                            }
                                          }
                                        }
                                      }
                                      _c3409 = _q3347;
                                    }
                                    if ((_c3409 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te3410: number): boolean => {  return ((_te3410 === _wc2910 ? _wd2911 : (_te3410 === _wc2908 ? _wd2909 : (b.grid[_te3410] || -1))) === 1); }).includes(v_z))))) {
                                      _q3309 = true;
                                      break Q3310;
                                    }
                                  }
                                }
                                _c3411 = _q3309;
                              }
                              if (_c3411) {
                                _q3192 = true;
                                break Q3193;
                              }
                            }
                          }
                          _c3412 = !(_q3192);
                        }
                        if (_c3412) {
                          _q3173 = true;
                          break Q3174;
                        }
                      }
                    }
                    _c3413 = _q3173;
                  }
                  if (_c3413) {
                    _q2912 = true;
                    break Q2913;
                  }
                }
              }
              _c3414 = _q2912;
            }
            freshBinding("pairBreaks", [(sp.cells.includes(v_c)), ((takes(sp, cl, v_c) - _g2903) === 2), sameSet(v_U, ways(b, sp, cl, v_c)), (v_U.length === 3), (v_U.includes(v_k)), sameSet(v_I, minus(v_U, setOf(v_k))), (v_i === (v_I[0] ?? -1)), (v_j === (v_I[1] ?? -1)), _c3414], ["c in", "where of c", "U =", "where of U", "k in", "I =", "i =", "j =", "where of j"]);
          }
          facts.length = 0;
          changed = false;
          const _t3415 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t3415] !== 0)) { if (fire === null) { b.placeAt(_t3415, 1); changed = true; } else facts.push(PLACE, _t3415, 1); }
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
const _st6045 = stamps();
const _st6169 = stamps();
const _st6208 = stamps();
const _st6315 = stamps();
const _st6354 = stamps();
const _st6466 = stamps();
const _st6504 = stamps();
const _st6610 = stamps();
const _st6648 = stamps();
const _st7194 = stamps();
const _st7313 = stamps();
const _st7352 = stamps();
const _st7459 = stamps();
const _st7498 = stamps();
const _st7610 = stamps();
const _st7648 = stamps();
const _st7754 = stamps();
const _st7792 = stamps();

/** Its dearest read grows with the board as n^2. */
export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g5530: number[] = [];
  const _g6150: number[] = [];
  const _g6155: number[] = [];
  const _g6190: number[] = [];
  const _g6195: number[] = [];
  const _g6296: number[] = [];
  const _g6301: number[] = [];
  const _g6336: number[] = [];
  const _g6341: number[] = [];
  const _g6448: number[] = [];
  const _g6453: number[] = [];
  const _g6486: number[] = [];
  const _g6491: number[] = [];
  const _g6592: number[] = [];
  const _g6597: number[] = [];
  const _g6630: number[] = [];
  const _g6635: number[] = [];
  const _g6678: number[] = [];
  const _g7294: number[] = [];
  const _g7299: number[] = [];
  const _g7334: number[] = [];
  const _g7339: number[] = [];
  const _g7440: number[] = [];
  const _g7445: number[] = [];
  const _g7480: number[] = [];
  const _g7485: number[] = [];
  const _g7592: number[] = [];
  const _g7597: number[] = [];
  const _g7630: number[] = [];
  const _g7635: number[] = [];
  const _g7736: number[] = [];
  const _g7741: number[] = [];
  const _g7774: number[] = [];
  const _g7779: number[] = [];
  const _g7825: number[] = [];
  const _g7847: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _k5523 = takesKept.board(cl);
  const _h6075 = (cl.step === 0);
  if (weighedCands.length < sp.edges.length) weighedCands = new Int32Array(sp.edges.length);
  const cands = weighedCands;
  cands.fill(-1);
  meetsMarkedKept.clear();
  const _a5521 = sp.cells;
  for (let _i5522 = 0; _i5522 < _a5521.length; _i5522++) {
    const v_c = _a5521[_i5522];
    let _g5524 = 0;
    G5525: {
      const _a5526 = sp.adj4[v_c];
      for (let _i5527 = 0; _i5527 < _a5526.length; _i5527++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i5527]] || -1) === 1))) continue;
        _g5524++;
      }
    }
    if (!((((_k5523[v_c] ?? takes(sp, cl, v_c)) - _g5524) === 2))) continue;
    const _h6052 = clueAt(cl.number, v_c);
    const _h6053 = (_h6052 !== -1);
    const _h6054 = _h6053;
    const _h6055 = !(_h6054);
    L5528: {
      const v_U = ways(b, sp, cl, v_c);
      const _h5529 = v_U.length;
      if (!((_h5529 === 4))) break L5528;
      const _h7821 = (v_U[0] ?? -1);
      _g5530.length = 0;
      _st6045.pass++;
      G5531: {
        const _a6046 = v_U;
        for (let _i6047 = 0; _i6047 < _a6046.length; _i6047++) {
          const v_i = _a6046[_i6047];
          const _h6050 = _i6047;
          const _h6051 = (_h6050 === 0);
          const _h6056 = sp.edgeOf(v_c, v_i);
          const _a6048 = v_U;
          for (let _i6049 = 0; _i6049 < _a6048.length; _i6049++) {
            const v_j = _a6048[_i6049];
            let _c6676: boolean = (_h6051 && (_i6049 > 0));
            if (_c6676) {
              let _c6675: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h6055 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c6675) {
                const _wc6057 = _h6056;
                const _wd6058 = 1;
                const _wc6059 = sp.edgeOf(v_c, v_j);
                const _wd6060 = 1;
                let _q6061 = false;
                Q6062: {
                  const _a6064 = throughWhere(sp, v_c, (_te6063: number): boolean => {  return ((_te6063 === _wc6059 ? _wd6060 : (_te6063 === _wc6057 ? _wd6058 : (b.grid[_te6063] || -1))) === 1); });
                  for (let _i6065 = 0; _i6065 < _a6064.length; _i6065++) {
                    const v_t = _a6064[_i6065];
                    let _c6085: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c6085) {
                      let _g6066 = 0;
                      G6067: {
                        const _a6068 = sp.adj4[v_t];
                        for (let _i6069 = 0; _i6069 < _a6068.length; _i6069++) {
                          const _t6070 = sp.adj4Edges[v_t][_i6069];
                          if (!(((_t6070 === _wc6059 ? _wd6060 : (_t6070 === _wc6057 ? _wd6058 : (b.grid[_t6070] || -1))) === 1))) continue;
                          _g6066++;
                        }
                      }
                      let _g6071 = 0;
                      G6072: {
                        for (let _i6073 = 0; _i6073 < 1; _i6073++) {
                          const v_k = v_t;
                          const _h6074 = clueAt(cl.number, v_k);
                          const _h6082 = (_h6074 + 1);
                          let _c6084: boolean = (_h6074 !== -1);
                          if (_c6084) {
                            let _c6083: boolean = (_h6075 || (_h6074 === 1));
                            if (!_c6083) {
                              let _g6076 = 0;
                              G6077: {
                                const _t6078 = (_h6074 + 1);
                                const _a6079 = cluesValued(cl.number, _t6078);
                                for (let _i6080 = 0; _i6080 < _a6079.length; _i6080++) {
                                  const v_x = _a6079[_i6080];
                                  const _h6081 = clueAt(cl.number, v_x);
                                  if (!((_h6081 === _h6082))) continue;
                                  _g6076++;
                                }
                              }
                              _c6083 = (_g6076 === 0);
                            }
                            _c6084 = _c6083;
                          }
                          if (!(_c6084)) continue;
                          _g6071++;
                        }
                      }
                      _c6085 = (_g6066 < (2 - _g6071));
                    }
                    if (!(_c6085)) continue;
                    let _g6086 = 0;
                    G6087: {
                      const _a6088 = sp.adj4[v_t];
                      for (let _i6089 = 0; _i6089 < _a6088.length; _i6089++) {
                        const _t6090 = sp.adj4Edges[v_t][_i6089];
                        if (!(((_t6090 === _wc6059 ? _wd6060 : (_t6090 === _wc6057 ? _wd6058 : (b.grid[_t6090] || -1))) === 1))) continue;
                        _g6086++;
                      }
                    }
                    let _g6091 = 0;
                    G6092: {
                      for (let _i6093 = 0; _i6093 < 1; _i6093++) {
                        const v_k = v_t;
                        const _h6094 = clueAt(cl.number, v_k);
                        const _h6101 = (_h6094 + 1);
                        let _c6103: boolean = (_h6094 !== -1);
                        if (_c6103) {
                          let _c6102: boolean = (_h6075 || (_h6094 === 1));
                          if (!_c6102) {
                            let _g6095 = 0;
                            G6096: {
                              const _t6097 = (_h6094 + 1);
                              const _a6098 = cluesValued(cl.number, _t6097);
                              for (let _i6099 = 0; _i6099 < _a6098.length; _i6099++) {
                                const v_x = _a6098[_i6099];
                                const _h6100 = clueAt(cl.number, v_x);
                                if (!((_h6100 === _h6101))) continue;
                                _g6095++;
                              }
                            }
                            _c6102 = (_g6095 === 0);
                          }
                          _c6103 = _c6102;
                        }
                        if (!(_c6103)) continue;
                        _g6091++;
                      }
                    }
                    let _c6379: boolean = (_g6086 < (2 - _g6091));
                    if (_c6379) {
                      let _q6104 = false;
                      Q6105: {
                        const _a6106 = sp.adj4[v_t];
                        for (let _i6107 = 0; _i6107 < _a6106.length; _i6107++) {
                          const v_y = _a6106[_i6107];
                          const _t6108 = sp.adj4Edges[v_t][_i6107];
                          let _c6127: boolean = !((_t6108 === _wc6059 ? true : (_t6108 === _wc6057 ? true : (b.grid[_t6108] !== 0))));
                          if (_c6127) {
                            let _g6109 = 0;
                            G6110: {
                              const _a6111 = sp.adj4[v_t];
                              for (let _i6112 = 0; _i6112 < _a6111.length; _i6112++) {
                                const _t6113 = sp.adj4Edges[v_t][_i6112];
                                if (!(((_t6113 === _wc6059 ? _wd6060 : (_t6113 === _wc6057 ? _wd6058 : (b.grid[_t6113] || -1))) === 1))) continue;
                                _g6109++;
                              }
                            }
                            let _g6114 = 0;
                            G6115: {
                              for (let _i6116 = 0; _i6116 < 1; _i6116++) {
                                const v_k = v_t;
                                const _h6117 = clueAt(cl.number, v_k);
                                const _h6124 = (_h6117 + 1);
                                let _c6126: boolean = (_h6117 !== -1);
                                if (_c6126) {
                                  let _c6125: boolean = (_h6075 || (_h6117 === 1));
                                  if (!_c6125) {
                                    let _g6118 = 0;
                                    G6119: {
                                      const _t6120 = (_h6117 + 1);
                                      const _a6121 = cluesValued(cl.number, _t6120);
                                      for (let _i6122 = 0; _i6122 < _a6121.length; _i6122++) {
                                        const v_x = _a6121[_i6122];
                                        const _h6123 = clueAt(cl.number, v_x);
                                        if (!((_h6123 === _h6124))) continue;
                                        _g6118++;
                                      }
                                    }
                                    _c6125 = (_g6118 === 0);
                                  }
                                  _c6126 = _c6125;
                                }
                                if (!(_c6126)) continue;
                                _g6114++;
                              }
                            }
                            _c6127 = (_g6109 < (2 - _g6114));
                          }
                          let _c6147: boolean = _c6127;
                          if (_c6147) {
                            let _g6128 = 0;
                            G6129: {
                              const _a6131 = sp.adj4[v_y];
                              for (let _i6132 = 0; _i6132 < _a6131.length; _i6132++) {
                                const _t6133 = sp.adj4Edges[v_y][_i6132];
                                if (!(((_t6133 === _wc6059 ? _wd6060 : (_t6133 === _wc6057 ? _wd6058 : (b.grid[_t6133] || -1))) === 1))) continue;
                                _g6128++;
                              }
                            }
                            let _g6134 = 0;
                            G6135: {
                              for (let _i6136 = 0; _i6136 < 1; _i6136++) {
                                const v_k = v_y;
                                const _h6137 = clueAt(cl.number, v_k);
                                const _h6144 = (_h6137 + 1);
                                let _c6146: boolean = (_h6137 !== -1);
                                if (_c6146) {
                                  let _c6145: boolean = (_h6075 || (_h6137 === 1));
                                  if (!_c6145) {
                                    let _g6138 = 0;
                                    G6139: {
                                      const _t6140 = (_h6137 + 1);
                                      const _a6141 = cluesValued(cl.number, _t6140);
                                      for (let _i6142 = 0; _i6142 < _a6141.length; _i6142++) {
                                        const v_x = _a6141[_i6142];
                                        const _h6143 = clueAt(cl.number, v_x);
                                        if (!((_h6143 === _h6144))) continue;
                                        _g6138++;
                                      }
                                    }
                                    _c6145 = (_g6138 === 0);
                                  }
                                  _c6146 = _c6145;
                                }
                                if (!(_c6146)) continue;
                                _g6134++;
                              }
                            }
                            _c6147 = (_g6128 < (2 - _g6134));
                          }
                          let _c6230: boolean = _c6147;
                          if (_c6230) {
                            let _q6148 = true;
                            Q6149: {
                              _g6150.length = 0;
                              G6151: {
                                for (let _i6153 = 0; _i6153 < 1; _i6153++) {
                                  const v_x = v_t;
                                  const _h6154 = clueAt(cl.number, v_x);
                                  if (!((_h6154 !== -1))) continue;
                                  _g6150.push(v_x);
                                }
                              }
                              _g6155.length = 0;
                              _st6169.pass++;
                              G6156: {
                                const _a6176 = throughWhere(sp, v_t, (_te6171: number): boolean => { let _c6173: boolean = ((_te6171 === _wc6059 ? _wd6060 : (_te6171 === _wc6057 ? _wd6058 : (b.grid[_te6171] || -1))) === 1); if (_c6173) {   const _t6172 = sp.edgeEnds[2 * _te6171];   _c6173 = !((clueAt(cl.number, _t6172) !== -1)); } let _c6175: boolean = _c6173; if (_c6175) {   const _t6174 = sp.edgeEnds[2 * _te6171 + 1];   _c6175 = !((clueAt(cl.number, _t6174) !== -1)); } return _c6175; });
                                for (let _i6177 = 0; _i6177 < _a6176.length; _i6177++) {
                                  const v_t_6170 = _a6176[_i6177];
                                  const _h6180 = clueAt(cl.number, v_t_6170);
                                  const _h6181 = (_h6180 !== -1);
                                  const _h6182 = _h6181;
                                  const _h6183 = !(_h6182);
                                  const _a6178 = sp.adj4[v_t_6170];
                                  for (let _i6179 = 0; _i6179 < _a6178.length; _i6179++) {
                                    const v_x = _a6178[_i6179];
                                    const _h6184 = clueAt(cl.number, v_x);
                                    let _c6186: boolean = (_h6183 && (_h6184 !== -1));
                                    if (_c6186) {
                                      const _t6185 = sp.adj4Edges[v_t_6170][_i6179];
                                      _c6186 = ((_t6185 === _wc6059 ? _wd6060 : (_t6185 === _wc6057 ? _wd6058 : (b.grid[_t6185] || -1))) === 1);
                                    }
                                    if (!(_c6186)) continue;
                                    const _t6187 = v_x;
                                    if (_g6155.length < 16) { if (!_g6155.includes(_t6187)) _g6155.push(_t6187); } else addOnce(_g6155, _st6169, _t6187);
                                  }
                                }
                              }
                              const _a6188 = union(_g6150, _g6155);
                              for (let _i6189 = 0; _i6189 < _a6188.length; _i6189++) {
                                const v_p = _a6188[_i6189];
                                const _h6228 = clueAt(cl.number, v_p);
                                _g6190.length = 0;
                                G6191: {
                                  for (let _i6193 = 0; _i6193 < 1; _i6193++) {
                                    const v_x = v_y;
                                    const _h6194 = clueAt(cl.number, v_x);
                                    if (!((_h6194 !== -1))) continue;
                                    _g6190.push(v_x);
                                  }
                                }
                                _g6195.length = 0;
                                _st6208.pass++;
                                G6196: {
                                  const _a6214 = throughWhere(sp, v_y, (_te6209: number): boolean => { let _c6211: boolean = ((_te6209 === _wc6059 ? _wd6060 : (_te6209 === _wc6057 ? _wd6058 : (b.grid[_te6209] || -1))) === 1); if (_c6211) {   const _t6210 = sp.edgeEnds[2 * _te6209];   _c6211 = !((clueAt(cl.number, _t6210) !== -1)); } let _c6213: boolean = _c6211; if (_c6213) {   const _t6212 = sp.edgeEnds[2 * _te6209 + 1];   _c6213 = !((clueAt(cl.number, _t6212) !== -1)); } return _c6213; });
                                  for (let _i6215 = 0; _i6215 < _a6214.length; _i6215++) {
                                    const v_t = _a6214[_i6215];
                                    const _h6218 = clueAt(cl.number, v_t);
                                    const _h6219 = (_h6218 !== -1);
                                    const _h6220 = _h6219;
                                    const _h6221 = !(_h6220);
                                    const _a6216 = sp.adj4[v_t];
                                    for (let _i6217 = 0; _i6217 < _a6216.length; _i6217++) {
                                      const v_x = _a6216[_i6217];
                                      const _h6222 = clueAt(cl.number, v_x);
                                      let _c6224: boolean = (_h6221 && (_h6222 !== -1));
                                      if (_c6224) {
                                        const _t6223 = sp.adj4Edges[v_t][_i6217];
                                        _c6224 = ((_t6223 === _wc6059 ? _wd6060 : (_t6223 === _wc6057 ? _wd6058 : (b.grid[_t6223] || -1))) === 1);
                                      }
                                      if (!(_c6224)) continue;
                                      const _t6225 = v_x;
                                      if (_g6195.length < 16) { if (!_g6195.includes(_t6225)) _g6195.push(_t6225); } else addOnce(_g6195, _st6208, _t6225);
                                    }
                                  }
                                }
                                const _a6226 = union(_g6190, _g6195);
                                for (let _i6227 = 0; _i6227 < _a6226.length; _i6227++) {
                                  const v_q = _a6226[_i6227];
                                  const _h6229 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6228 - _h6229)) === cl.step))) {
                                    _q6148 = false;
                                    break Q6149;
                                  }
                                }
                              }
                            }
                            _c6230 = _q6148;
                          }
                          if (!((_c6230 && (_h6075 || !(throughWhere(sp, v_t, (_te6231: number): boolean => {  return ((_te6231 === _wc6059 ? _wd6060 : (_te6231 === _wc6057 ? _wd6058 : (b.grid[_te6231] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6232 = 0;
                          G6233: {
                            const _a6234 = sp.adj4[v_t];
                            for (let _i6235 = 0; _i6235 < _a6234.length; _i6235++) {
                              const _t6236 = sp.adj4Edges[v_t][_i6235];
                              if (!(((_t6236 === _wc6059 ? _wd6060 : (_t6236 === _wc6057 ? _wd6058 : (b.grid[_t6236] || -1))) === 1))) continue;
                              _g6232++;
                            }
                          }
                          let _g6237 = 0;
                          G6238: {
                            for (let _i6239 = 0; _i6239 < 1; _i6239++) {
                              const v_k = v_t;
                              const _h6240 = clueAt(cl.number, v_k);
                              const _h6247 = (_h6240 + 1);
                              let _c6249: boolean = (_h6240 !== -1);
                              if (_c6249) {
                                let _c6248: boolean = (_h6075 || (_h6240 === 1));
                                if (!_c6248) {
                                  let _g6241 = 0;
                                  G6242: {
                                    const _t6243 = (_h6240 + 1);
                                    const _a6244 = cluesValued(cl.number, _t6243);
                                    for (let _i6245 = 0; _i6245 < _a6244.length; _i6245++) {
                                      const v_x = _a6244[_i6245];
                                      const _h6246 = clueAt(cl.number, v_x);
                                      if (!((_h6246 === _h6247))) continue;
                                      _g6241++;
                                    }
                                  }
                                  _c6248 = (_g6241 === 0);
                                }
                                _c6249 = _c6248;
                              }
                              if (!(_c6249)) continue;
                              _g6237++;
                            }
                          }
                          let _c6378: boolean = ((_g6232 + 1) === (2 - _g6237));
                          if (!_c6378) {
                            let _q6250 = false;
                            Q6251: {
                              const _a6252 = sp.adj4[v_t];
                              const _n6253 = _i6107;
                              for (let _i6254 = 0; _i6254 < _n6253; _i6254++) {
                                const v_z = _a6252[_i6254];
                                const _t6255 = sp.adj4Edges[v_t][_i6254];
                                let _c6274: boolean = !((_t6255 === _wc6059 ? true : (_t6255 === _wc6057 ? true : (b.grid[_t6255] !== 0))));
                                if (_c6274) {
                                  let _g6256 = 0;
                                  G6257: {
                                    const _a6258 = sp.adj4[v_t];
                                    for (let _i6259 = 0; _i6259 < _a6258.length; _i6259++) {
                                      const _t6260 = sp.adj4Edges[v_t][_i6259];
                                      if (!(((_t6260 === _wc6059 ? _wd6060 : (_t6260 === _wc6057 ? _wd6058 : (b.grid[_t6260] || -1))) === 1))) continue;
                                      _g6256++;
                                    }
                                  }
                                  let _g6261 = 0;
                                  G6262: {
                                    for (let _i6263 = 0; _i6263 < 1; _i6263++) {
                                      const v_k = v_t;
                                      const _h6264 = clueAt(cl.number, v_k);
                                      const _h6271 = (_h6264 + 1);
                                      let _c6273: boolean = (_h6264 !== -1);
                                      if (_c6273) {
                                        let _c6272: boolean = (_h6075 || (_h6264 === 1));
                                        if (!_c6272) {
                                          let _g6265 = 0;
                                          G6266: {
                                            const _t6267 = (_h6264 + 1);
                                            const _a6268 = cluesValued(cl.number, _t6267);
                                            for (let _i6269 = 0; _i6269 < _a6268.length; _i6269++) {
                                              const v_x = _a6268[_i6269];
                                              const _h6270 = clueAt(cl.number, v_x);
                                              if (!((_h6270 === _h6271))) continue;
                                              _g6265++;
                                            }
                                          }
                                          _c6272 = (_g6265 === 0);
                                        }
                                        _c6273 = _c6272;
                                      }
                                      if (!(_c6273)) continue;
                                      _g6261++;
                                    }
                                  }
                                  _c6274 = (_g6256 < (2 - _g6261));
                                }
                                let _c6293: boolean = _c6274;
                                if (_c6293) {
                                  let _g6275 = 0;
                                  G6276: {
                                    const _a6277 = sp.adj4[v_z];
                                    for (let _i6278 = 0; _i6278 < _a6277.length; _i6278++) {
                                      const _t6279 = sp.adj4Edges[v_z][_i6278];
                                      if (!(((_t6279 === _wc6059 ? _wd6060 : (_t6279 === _wc6057 ? _wd6058 : (b.grid[_t6279] || -1))) === 1))) continue;
                                      _g6275++;
                                    }
                                  }
                                  let _g6280 = 0;
                                  G6281: {
                                    for (let _i6282 = 0; _i6282 < 1; _i6282++) {
                                      const v_k = v_z;
                                      const _h6283 = clueAt(cl.number, v_k);
                                      const _h6290 = (_h6283 + 1);
                                      let _c6292: boolean = (_h6283 !== -1);
                                      if (_c6292) {
                                        let _c6291: boolean = (_h6075 || (_h6283 === 1));
                                        if (!_c6291) {
                                          let _g6284 = 0;
                                          G6285: {
                                            const _t6286 = (_h6283 + 1);
                                            const _a6287 = cluesValued(cl.number, _t6286);
                                            for (let _i6288 = 0; _i6288 < _a6287.length; _i6288++) {
                                              const v_x = _a6287[_i6288];
                                              const _h6289 = clueAt(cl.number, v_x);
                                              if (!((_h6289 === _h6290))) continue;
                                              _g6284++;
                                            }
                                          }
                                          _c6291 = (_g6284 === 0);
                                        }
                                        _c6292 = _c6291;
                                      }
                                      if (!(_c6292)) continue;
                                      _g6280++;
                                    }
                                  }
                                  _c6293 = (_g6275 < (2 - _g6280));
                                }
                                let _c6376: boolean = _c6293;
                                if (_c6376) {
                                  let _q6294 = true;
                                  Q6295: {
                                    _g6296.length = 0;
                                    G6297: {
                                      for (let _i6299 = 0; _i6299 < 1; _i6299++) {
                                        const v_x = v_t;
                                        const _h6300 = clueAt(cl.number, v_x);
                                        if (!((_h6300 !== -1))) continue;
                                        _g6296.push(v_x);
                                      }
                                    }
                                    _g6301.length = 0;
                                    _st6315.pass++;
                                    G6302: {
                                      const _a6322 = throughWhere(sp, v_t, (_te6317: number): boolean => { let _c6319: boolean = ((_te6317 === _wc6059 ? _wd6060 : (_te6317 === _wc6057 ? _wd6058 : (b.grid[_te6317] || -1))) === 1); if (_c6319) {   const _t6318 = sp.edgeEnds[2 * _te6317];   _c6319 = !((clueAt(cl.number, _t6318) !== -1)); } let _c6321: boolean = _c6319; if (_c6321) {   const _t6320 = sp.edgeEnds[2 * _te6317 + 1];   _c6321 = !((clueAt(cl.number, _t6320) !== -1)); } return _c6321; });
                                      for (let _i6323 = 0; _i6323 < _a6322.length; _i6323++) {
                                        const v_t_6316 = _a6322[_i6323];
                                        const _h6326 = clueAt(cl.number, v_t_6316);
                                        const _h6327 = (_h6326 !== -1);
                                        const _h6328 = _h6327;
                                        const _h6329 = !(_h6328);
                                        const _a6324 = sp.adj4[v_t_6316];
                                        for (let _i6325 = 0; _i6325 < _a6324.length; _i6325++) {
                                          const v_x = _a6324[_i6325];
                                          const _h6330 = clueAt(cl.number, v_x);
                                          let _c6332: boolean = (_h6329 && (_h6330 !== -1));
                                          if (_c6332) {
                                            const _t6331 = sp.adj4Edges[v_t_6316][_i6325];
                                            _c6332 = ((_t6331 === _wc6059 ? _wd6060 : (_t6331 === _wc6057 ? _wd6058 : (b.grid[_t6331] || -1))) === 1);
                                          }
                                          if (!(_c6332)) continue;
                                          const _t6333 = v_x;
                                          if (_g6301.length < 16) { if (!_g6301.includes(_t6333)) _g6301.push(_t6333); } else addOnce(_g6301, _st6315, _t6333);
                                        }
                                      }
                                    }
                                    const _a6334 = union(_g6296, _g6301);
                                    for (let _i6335 = 0; _i6335 < _a6334.length; _i6335++) {
                                      const v_p = _a6334[_i6335];
                                      const _h6374 = clueAt(cl.number, v_p);
                                      _g6336.length = 0;
                                      G6337: {
                                        for (let _i6339 = 0; _i6339 < 1; _i6339++) {
                                          const v_x = v_z;
                                          const _h6340 = clueAt(cl.number, v_x);
                                          if (!((_h6340 !== -1))) continue;
                                          _g6336.push(v_x);
                                        }
                                      }
                                      _g6341.length = 0;
                                      _st6354.pass++;
                                      G6342: {
                                        const _a6360 = throughWhere(sp, v_z, (_te6355: number): boolean => { let _c6357: boolean = ((_te6355 === _wc6059 ? _wd6060 : (_te6355 === _wc6057 ? _wd6058 : (b.grid[_te6355] || -1))) === 1); if (_c6357) {   const _t6356 = sp.edgeEnds[2 * _te6355];   _c6357 = !((clueAt(cl.number, _t6356) !== -1)); } let _c6359: boolean = _c6357; if (_c6359) {   const _t6358 = sp.edgeEnds[2 * _te6355 + 1];   _c6359 = !((clueAt(cl.number, _t6358) !== -1)); } return _c6359; });
                                        for (let _i6361 = 0; _i6361 < _a6360.length; _i6361++) {
                                          const v_t = _a6360[_i6361];
                                          const _h6364 = clueAt(cl.number, v_t);
                                          const _h6365 = (_h6364 !== -1);
                                          const _h6366 = _h6365;
                                          const _h6367 = !(_h6366);
                                          const _a6362 = sp.adj4[v_t];
                                          for (let _i6363 = 0; _i6363 < _a6362.length; _i6363++) {
                                            const v_x = _a6362[_i6363];
                                            const _h6368 = clueAt(cl.number, v_x);
                                            let _c6370: boolean = (_h6367 && (_h6368 !== -1));
                                            if (_c6370) {
                                              const _t6369 = sp.adj4Edges[v_t][_i6363];
                                              _c6370 = ((_t6369 === _wc6059 ? _wd6060 : (_t6369 === _wc6057 ? _wd6058 : (b.grid[_t6369] || -1))) === 1);
                                            }
                                            if (!(_c6370)) continue;
                                            const _t6371 = v_x;
                                            if (_g6341.length < 16) { if (!_g6341.includes(_t6371)) _g6341.push(_t6371); } else addOnce(_g6341, _st6354, _t6371);
                                          }
                                        }
                                      }
                                      const _a6372 = union(_g6336, _g6341);
                                      for (let _i6373 = 0; _i6373 < _a6372.length; _i6373++) {
                                        const v_q = _a6372[_i6373];
                                        const _h6375 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6374 - _h6375)) === cl.step))) {
                                          _q6294 = false;
                                          break Q6295;
                                        }
                                      }
                                    }
                                  }
                                  _c6376 = _q6294;
                                }
                                if ((_c6376 && (_h6075 || !(throughWhere(sp, v_t, (_te6377: number): boolean => {  return ((_te6377 === _wc6059 ? _wd6060 : (_te6377 === _wc6057 ? _wd6058 : (b.grid[_te6377] || -1))) === 1); }).includes(v_z))))) {
                                  _q6250 = true;
                                  break Q6251;
                                }
                              }
                            }
                            _c6378 = _q6250;
                          }
                          if (_c6378) {
                            _q6104 = true;
                            break Q6105;
                          }
                        }
                      }
                      _c6379 = !(_q6104);
                    }
                    let _c6674: boolean = _c6379;
                    if (!_c6674) {
                      let _q6380 = false;
                      Q6381: {
                        const _a6382 = sp.adj4[v_t];
                        for (let _i6383 = 0; _i6383 < _a6382.length; _i6383++) {
                          const v_s = _a6382[_i6383];
                          let _g6384 = 0;
                          G6385: {
                            const _a6386 = sp.adj4[v_s];
                            for (let _i6387 = 0; _i6387 < _a6386.length; _i6387++) {
                              const _t6388 = sp.adj4Edges[v_s][_i6387];
                              if (!(((_t6388 === _wc6059 ? _wd6060 : (_t6388 === _wc6057 ? _wd6058 : (b.grid[_t6388] || -1))) === 1))) continue;
                              _g6384++;
                            }
                          }
                          let _g6389 = 0;
                          G6390: {
                            for (let _i6391 = 0; _i6391 < 1; _i6391++) {
                              const v_k = v_s;
                              const _h6392 = clueAt(cl.number, v_k);
                              const _h6399 = (_h6392 + 1);
                              let _c6401: boolean = (_h6392 !== -1);
                              if (_c6401) {
                                let _c6400: boolean = (_h6075 || (_h6392 === 1));
                                if (!_c6400) {
                                  let _g6393 = 0;
                                  G6394: {
                                    const _t6395 = (_h6392 + 1);
                                    const _a6396 = cluesValued(cl.number, _t6395);
                                    for (let _i6397 = 0; _i6397 < _a6396.length; _i6397++) {
                                      const v_x = _a6396[_i6397];
                                      const _h6398 = clueAt(cl.number, v_x);
                                      if (!((_h6398 === _h6399))) continue;
                                      _g6393++;
                                    }
                                  }
                                  _c6400 = (_g6393 === 0);
                                }
                                _c6401 = _c6400;
                              }
                              if (!(_c6401)) continue;
                              _g6389++;
                            }
                          }
                          let _c6673: boolean = (_g6384 < (2 - _g6389));
                          if (_c6673) {
                            let _q6402 = false;
                            Q6403: {
                              const _a6404 = sp.adj4[v_s];
                              for (let _i6405 = 0; _i6405 < _a6404.length; _i6405++) {
                                const v_y = _a6404[_i6405];
                                const _t6406 = sp.adj4Edges[v_s][_i6405];
                                let _c6425: boolean = !((_t6406 === _wc6059 ? true : (_t6406 === _wc6057 ? true : (b.grid[_t6406] !== 0))));
                                if (_c6425) {
                                  let _g6407 = 0;
                                  G6408: {
                                    const _a6409 = sp.adj4[v_s];
                                    for (let _i6410 = 0; _i6410 < _a6409.length; _i6410++) {
                                      const _t6411 = sp.adj4Edges[v_s][_i6410];
                                      if (!(((_t6411 === _wc6059 ? _wd6060 : (_t6411 === _wc6057 ? _wd6058 : (b.grid[_t6411] || -1))) === 1))) continue;
                                      _g6407++;
                                    }
                                  }
                                  let _g6412 = 0;
                                  G6413: {
                                    for (let _i6414 = 0; _i6414 < 1; _i6414++) {
                                      const v_k = v_s;
                                      const _h6415 = clueAt(cl.number, v_k);
                                      const _h6422 = (_h6415 + 1);
                                      let _c6424: boolean = (_h6415 !== -1);
                                      if (_c6424) {
                                        let _c6423: boolean = (_h6075 || (_h6415 === 1));
                                        if (!_c6423) {
                                          let _g6416 = 0;
                                          G6417: {
                                            const _t6418 = (_h6415 + 1);
                                            const _a6419 = cluesValued(cl.number, _t6418);
                                            for (let _i6420 = 0; _i6420 < _a6419.length; _i6420++) {
                                              const v_x = _a6419[_i6420];
                                              const _h6421 = clueAt(cl.number, v_x);
                                              if (!((_h6421 === _h6422))) continue;
                                              _g6416++;
                                            }
                                          }
                                          _c6423 = (_g6416 === 0);
                                        }
                                        _c6424 = _c6423;
                                      }
                                      if (!(_c6424)) continue;
                                      _g6412++;
                                    }
                                  }
                                  _c6425 = (_g6407 < (2 - _g6412));
                                }
                                let _c6445: boolean = _c6425;
                                if (_c6445) {
                                  let _g6426 = 0;
                                  G6427: {
                                    const _a6429 = sp.adj4[v_y];
                                    for (let _i6430 = 0; _i6430 < _a6429.length; _i6430++) {
                                      const _t6431 = sp.adj4Edges[v_y][_i6430];
                                      if (!(((_t6431 === _wc6059 ? _wd6060 : (_t6431 === _wc6057 ? _wd6058 : (b.grid[_t6431] || -1))) === 1))) continue;
                                      _g6426++;
                                    }
                                  }
                                  let _g6432 = 0;
                                  G6433: {
                                    for (let _i6434 = 0; _i6434 < 1; _i6434++) {
                                      const v_k = v_y;
                                      const _h6435 = clueAt(cl.number, v_k);
                                      const _h6442 = (_h6435 + 1);
                                      let _c6444: boolean = (_h6435 !== -1);
                                      if (_c6444) {
                                        let _c6443: boolean = (_h6075 || (_h6435 === 1));
                                        if (!_c6443) {
                                          let _g6436 = 0;
                                          G6437: {
                                            const _t6438 = (_h6435 + 1);
                                            const _a6439 = cluesValued(cl.number, _t6438);
                                            for (let _i6440 = 0; _i6440 < _a6439.length; _i6440++) {
                                              const v_x = _a6439[_i6440];
                                              const _h6441 = clueAt(cl.number, v_x);
                                              if (!((_h6441 === _h6442))) continue;
                                              _g6436++;
                                            }
                                          }
                                          _c6443 = (_g6436 === 0);
                                        }
                                        _c6444 = _c6443;
                                      }
                                      if (!(_c6444)) continue;
                                      _g6432++;
                                    }
                                  }
                                  _c6445 = (_g6426 < (2 - _g6432));
                                }
                                let _c6526: boolean = _c6445;
                                if (_c6526) {
                                  let _q6446 = true;
                                  Q6447: {
                                    _g6448.length = 0;
                                    G6449: {
                                      for (let _i6451 = 0; _i6451 < 1; _i6451++) {
                                        const v_x = v_s;
                                        const _h6452 = clueAt(cl.number, v_x);
                                        if (!((_h6452 !== -1))) continue;
                                        _g6448.push(v_x);
                                      }
                                    }
                                    _g6453.length = 0;
                                    _st6466.pass++;
                                    G6454: {
                                      const _a6472 = throughWhere(sp, v_s, (_te6467: number): boolean => { let _c6469: boolean = ((_te6467 === _wc6059 ? _wd6060 : (_te6467 === _wc6057 ? _wd6058 : (b.grid[_te6467] || -1))) === 1); if (_c6469) {   const _t6468 = sp.edgeEnds[2 * _te6467];   _c6469 = !((clueAt(cl.number, _t6468) !== -1)); } let _c6471: boolean = _c6469; if (_c6471) {   const _t6470 = sp.edgeEnds[2 * _te6467 + 1];   _c6471 = !((clueAt(cl.number, _t6470) !== -1)); } return _c6471; });
                                      for (let _i6473 = 0; _i6473 < _a6472.length; _i6473++) {
                                        const v_t = _a6472[_i6473];
                                        const _h6476 = clueAt(cl.number, v_t);
                                        const _h6477 = (_h6476 !== -1);
                                        const _h6478 = _h6477;
                                        const _h6479 = !(_h6478);
                                        const _a6474 = sp.adj4[v_t];
                                        for (let _i6475 = 0; _i6475 < _a6474.length; _i6475++) {
                                          const v_x = _a6474[_i6475];
                                          const _h6480 = clueAt(cl.number, v_x);
                                          let _c6482: boolean = (_h6479 && (_h6480 !== -1));
                                          if (_c6482) {
                                            const _t6481 = sp.adj4Edges[v_t][_i6475];
                                            _c6482 = ((_t6481 === _wc6059 ? _wd6060 : (_t6481 === _wc6057 ? _wd6058 : (b.grid[_t6481] || -1))) === 1);
                                          }
                                          if (!(_c6482)) continue;
                                          const _t6483 = v_x;
                                          if (_g6453.length < 16) { if (!_g6453.includes(_t6483)) _g6453.push(_t6483); } else addOnce(_g6453, _st6466, _t6483);
                                        }
                                      }
                                    }
                                    const _a6484 = union(_g6448, _g6453);
                                    for (let _i6485 = 0; _i6485 < _a6484.length; _i6485++) {
                                      const v_p = _a6484[_i6485];
                                      const _h6524 = clueAt(cl.number, v_p);
                                      _g6486.length = 0;
                                      G6487: {
                                        for (let _i6489 = 0; _i6489 < 1; _i6489++) {
                                          const v_x = v_y;
                                          const _h6490 = clueAt(cl.number, v_x);
                                          if (!((_h6490 !== -1))) continue;
                                          _g6486.push(v_x);
                                        }
                                      }
                                      _g6491.length = 0;
                                      _st6504.pass++;
                                      G6492: {
                                        const _a6510 = throughWhere(sp, v_y, (_te6505: number): boolean => { let _c6507: boolean = ((_te6505 === _wc6059 ? _wd6060 : (_te6505 === _wc6057 ? _wd6058 : (b.grid[_te6505] || -1))) === 1); if (_c6507) {   const _t6506 = sp.edgeEnds[2 * _te6505];   _c6507 = !((clueAt(cl.number, _t6506) !== -1)); } let _c6509: boolean = _c6507; if (_c6509) {   const _t6508 = sp.edgeEnds[2 * _te6505 + 1];   _c6509 = !((clueAt(cl.number, _t6508) !== -1)); } return _c6509; });
                                        for (let _i6511 = 0; _i6511 < _a6510.length; _i6511++) {
                                          const v_t = _a6510[_i6511];
                                          const _h6514 = clueAt(cl.number, v_t);
                                          const _h6515 = (_h6514 !== -1);
                                          const _h6516 = _h6515;
                                          const _h6517 = !(_h6516);
                                          const _a6512 = sp.adj4[v_t];
                                          for (let _i6513 = 0; _i6513 < _a6512.length; _i6513++) {
                                            const v_x = _a6512[_i6513];
                                            const _h6518 = clueAt(cl.number, v_x);
                                            let _c6520: boolean = (_h6517 && (_h6518 !== -1));
                                            if (_c6520) {
                                              const _t6519 = sp.adj4Edges[v_t][_i6513];
                                              _c6520 = ((_t6519 === _wc6059 ? _wd6060 : (_t6519 === _wc6057 ? _wd6058 : (b.grid[_t6519] || -1))) === 1);
                                            }
                                            if (!(_c6520)) continue;
                                            const _t6521 = v_x;
                                            if (_g6491.length < 16) { if (!_g6491.includes(_t6521)) _g6491.push(_t6521); } else addOnce(_g6491, _st6504, _t6521);
                                          }
                                        }
                                      }
                                      const _a6522 = union(_g6486, _g6491);
                                      for (let _i6523 = 0; _i6523 < _a6522.length; _i6523++) {
                                        const v_q = _a6522[_i6523];
                                        const _h6525 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6524 - _h6525)) === cl.step))) {
                                          _q6446 = false;
                                          break Q6447;
                                        }
                                      }
                                    }
                                  }
                                  _c6526 = _q6446;
                                }
                                if (!((_c6526 && (_h6075 || !(throughWhere(sp, v_s, (_te6527: number): boolean => {  return ((_te6527 === _wc6059 ? _wd6060 : (_te6527 === _wc6057 ? _wd6058 : (b.grid[_te6527] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g6528 = 0;
                                G6529: {
                                  const _a6530 = sp.adj4[v_s];
                                  for (let _i6531 = 0; _i6531 < _a6530.length; _i6531++) {
                                    const _t6532 = sp.adj4Edges[v_s][_i6531];
                                    if (!(((_t6532 === _wc6059 ? _wd6060 : (_t6532 === _wc6057 ? _wd6058 : (b.grid[_t6532] || -1))) === 1))) continue;
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
                                      let _c6544: boolean = (_h6075 || (_h6536 === 1));
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
                                let _c6672: boolean = ((_g6528 + 1) === (2 - _g6533));
                                if (!_c6672) {
                                  let _q6546 = false;
                                  Q6547: {
                                    const _a6548 = sp.adj4[v_s];
                                    const _n6549 = _i6405;
                                    for (let _i6550 = 0; _i6550 < _n6549; _i6550++) {
                                      const v_z = _a6548[_i6550];
                                      const _t6551 = sp.adj4Edges[v_s][_i6550];
                                      let _c6570: boolean = !((_t6551 === _wc6059 ? true : (_t6551 === _wc6057 ? true : (b.grid[_t6551] !== 0))));
                                      if (_c6570) {
                                        let _g6552 = 0;
                                        G6553: {
                                          const _a6554 = sp.adj4[v_s];
                                          for (let _i6555 = 0; _i6555 < _a6554.length; _i6555++) {
                                            const _t6556 = sp.adj4Edges[v_s][_i6555];
                                            if (!(((_t6556 === _wc6059 ? _wd6060 : (_t6556 === _wc6057 ? _wd6058 : (b.grid[_t6556] || -1))) === 1))) continue;
                                            _g6552++;
                                          }
                                        }
                                        let _g6557 = 0;
                                        G6558: {
                                          for (let _i6559 = 0; _i6559 < 1; _i6559++) {
                                            const v_k = v_s;
                                            const _h6560 = clueAt(cl.number, v_k);
                                            const _h6567 = (_h6560 + 1);
                                            let _c6569: boolean = (_h6560 !== -1);
                                            if (_c6569) {
                                              let _c6568: boolean = (_h6075 || (_h6560 === 1));
                                              if (!_c6568) {
                                                let _g6561 = 0;
                                                G6562: {
                                                  const _t6563 = (_h6560 + 1);
                                                  const _a6564 = cluesValued(cl.number, _t6563);
                                                  for (let _i6565 = 0; _i6565 < _a6564.length; _i6565++) {
                                                    const v_x = _a6564[_i6565];
                                                    const _h6566 = clueAt(cl.number, v_x);
                                                    if (!((_h6566 === _h6567))) continue;
                                                    _g6561++;
                                                  }
                                                }
                                                _c6568 = (_g6561 === 0);
                                              }
                                              _c6569 = _c6568;
                                            }
                                            if (!(_c6569)) continue;
                                            _g6557++;
                                          }
                                        }
                                        _c6570 = (_g6552 < (2 - _g6557));
                                      }
                                      let _c6589: boolean = _c6570;
                                      if (_c6589) {
                                        let _g6571 = 0;
                                        G6572: {
                                          const _a6573 = sp.adj4[v_z];
                                          for (let _i6574 = 0; _i6574 < _a6573.length; _i6574++) {
                                            const _t6575 = sp.adj4Edges[v_z][_i6574];
                                            if (!(((_t6575 === _wc6059 ? _wd6060 : (_t6575 === _wc6057 ? _wd6058 : (b.grid[_t6575] || -1))) === 1))) continue;
                                            _g6571++;
                                          }
                                        }
                                        let _g6576 = 0;
                                        G6577: {
                                          for (let _i6578 = 0; _i6578 < 1; _i6578++) {
                                            const v_k = v_z;
                                            const _h6579 = clueAt(cl.number, v_k);
                                            const _h6586 = (_h6579 + 1);
                                            let _c6588: boolean = (_h6579 !== -1);
                                            if (_c6588) {
                                              let _c6587: boolean = (_h6075 || (_h6579 === 1));
                                              if (!_c6587) {
                                                let _g6580 = 0;
                                                G6581: {
                                                  const _t6582 = (_h6579 + 1);
                                                  const _a6583 = cluesValued(cl.number, _t6582);
                                                  for (let _i6584 = 0; _i6584 < _a6583.length; _i6584++) {
                                                    const v_x = _a6583[_i6584];
                                                    const _h6585 = clueAt(cl.number, v_x);
                                                    if (!((_h6585 === _h6586))) continue;
                                                    _g6580++;
                                                  }
                                                }
                                                _c6587 = (_g6580 === 0);
                                              }
                                              _c6588 = _c6587;
                                            }
                                            if (!(_c6588)) continue;
                                            _g6576++;
                                          }
                                        }
                                        _c6589 = (_g6571 < (2 - _g6576));
                                      }
                                      let _c6670: boolean = _c6589;
                                      if (_c6670) {
                                        let _q6590 = true;
                                        Q6591: {
                                          _g6592.length = 0;
                                          G6593: {
                                            for (let _i6595 = 0; _i6595 < 1; _i6595++) {
                                              const v_x = v_s;
                                              const _h6596 = clueAt(cl.number, v_x);
                                              if (!((_h6596 !== -1))) continue;
                                              _g6592.push(v_x);
                                            }
                                          }
                                          _g6597.length = 0;
                                          _st6610.pass++;
                                          G6598: {
                                            const _a6616 = throughWhere(sp, v_s, (_te6611: number): boolean => { let _c6613: boolean = ((_te6611 === _wc6059 ? _wd6060 : (_te6611 === _wc6057 ? _wd6058 : (b.grid[_te6611] || -1))) === 1); if (_c6613) {   const _t6612 = sp.edgeEnds[2 * _te6611];   _c6613 = !((clueAt(cl.number, _t6612) !== -1)); } let _c6615: boolean = _c6613; if (_c6615) {   const _t6614 = sp.edgeEnds[2 * _te6611 + 1];   _c6615 = !((clueAt(cl.number, _t6614) !== -1)); } return _c6615; });
                                            for (let _i6617 = 0; _i6617 < _a6616.length; _i6617++) {
                                              const v_t = _a6616[_i6617];
                                              const _h6620 = clueAt(cl.number, v_t);
                                              const _h6621 = (_h6620 !== -1);
                                              const _h6622 = _h6621;
                                              const _h6623 = !(_h6622);
                                              const _a6618 = sp.adj4[v_t];
                                              for (let _i6619 = 0; _i6619 < _a6618.length; _i6619++) {
                                                const v_x = _a6618[_i6619];
                                                const _h6624 = clueAt(cl.number, v_x);
                                                let _c6626: boolean = (_h6623 && (_h6624 !== -1));
                                                if (_c6626) {
                                                  const _t6625 = sp.adj4Edges[v_t][_i6619];
                                                  _c6626 = ((_t6625 === _wc6059 ? _wd6060 : (_t6625 === _wc6057 ? _wd6058 : (b.grid[_t6625] || -1))) === 1);
                                                }
                                                if (!(_c6626)) continue;
                                                const _t6627 = v_x;
                                                if (_g6597.length < 16) { if (!_g6597.includes(_t6627)) _g6597.push(_t6627); } else addOnce(_g6597, _st6610, _t6627);
                                              }
                                            }
                                          }
                                          const _a6628 = union(_g6592, _g6597);
                                          for (let _i6629 = 0; _i6629 < _a6628.length; _i6629++) {
                                            const v_p = _a6628[_i6629];
                                            const _h6668 = clueAt(cl.number, v_p);
                                            _g6630.length = 0;
                                            G6631: {
                                              for (let _i6633 = 0; _i6633 < 1; _i6633++) {
                                                const v_x = v_z;
                                                const _h6634 = clueAt(cl.number, v_x);
                                                if (!((_h6634 !== -1))) continue;
                                                _g6630.push(v_x);
                                              }
                                            }
                                            _g6635.length = 0;
                                            _st6648.pass++;
                                            G6636: {
                                              const _a6654 = throughWhere(sp, v_z, (_te6649: number): boolean => { let _c6651: boolean = ((_te6649 === _wc6059 ? _wd6060 : (_te6649 === _wc6057 ? _wd6058 : (b.grid[_te6649] || -1))) === 1); if (_c6651) {   const _t6650 = sp.edgeEnds[2 * _te6649];   _c6651 = !((clueAt(cl.number, _t6650) !== -1)); } let _c6653: boolean = _c6651; if (_c6653) {   const _t6652 = sp.edgeEnds[2 * _te6649 + 1];   _c6653 = !((clueAt(cl.number, _t6652) !== -1)); } return _c6653; });
                                              for (let _i6655 = 0; _i6655 < _a6654.length; _i6655++) {
                                                const v_t = _a6654[_i6655];
                                                const _h6658 = clueAt(cl.number, v_t);
                                                const _h6659 = (_h6658 !== -1);
                                                const _h6660 = _h6659;
                                                const _h6661 = !(_h6660);
                                                const _a6656 = sp.adj4[v_t];
                                                for (let _i6657 = 0; _i6657 < _a6656.length; _i6657++) {
                                                  const v_x = _a6656[_i6657];
                                                  const _h6662 = clueAt(cl.number, v_x);
                                                  let _c6664: boolean = (_h6661 && (_h6662 !== -1));
                                                  if (_c6664) {
                                                    const _t6663 = sp.adj4Edges[v_t][_i6657];
                                                    _c6664 = ((_t6663 === _wc6059 ? _wd6060 : (_t6663 === _wc6057 ? _wd6058 : (b.grid[_t6663] || -1))) === 1);
                                                  }
                                                  if (!(_c6664)) continue;
                                                  const _t6665 = v_x;
                                                  if (_g6635.length < 16) { if (!_g6635.includes(_t6665)) _g6635.push(_t6665); } else addOnce(_g6635, _st6648, _t6665);
                                                }
                                              }
                                            }
                                            const _a6666 = union(_g6630, _g6635);
                                            for (let _i6667 = 0; _i6667 < _a6666.length; _i6667++) {
                                              const v_q = _a6666[_i6667];
                                              const _h6669 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h6668 - _h6669)) === cl.step))) {
                                                _q6590 = false;
                                                break Q6591;
                                              }
                                            }
                                          }
                                        }
                                        _c6670 = _q6590;
                                      }
                                      if ((_c6670 && (_h6075 || !(throughWhere(sp, v_s, (_te6671: number): boolean => {  return ((_te6671 === _wc6059 ? _wd6060 : (_te6671 === _wc6057 ? _wd6058 : (b.grid[_te6671] || -1))) === 1); }).includes(v_z))))) {
                                        _q6546 = true;
                                        break Q6547;
                                      }
                                    }
                                  }
                                  _c6672 = _q6546;
                                }
                                if (_c6672) {
                                  _q6402 = true;
                                  break Q6403;
                                }
                              }
                            }
                            _c6673 = !(_q6402);
                          }
                          if (_c6673) {
                            _q6380 = true;
                            break Q6381;
                          }
                        }
                      }
                      _c6674 = _q6380;
                    }
                    if (_c6674) {
                      _q6061 = true;
                      break Q6062;
                    }
                  }
                }
                _c6675 = _q6061;
              }
              _c6676 = _c6675;
            }
            if (!(_c6676)) continue;
            const _t6677 = v_j;
            if (_g5530.length < 16) { if (!_g5530.includes(_t6677)) _g5530.push(_t6677); } else addOnce(_g5530, _st6045, _t6677);
          }
        }
      }
      const v_A = _g5530;
      const _h7838 = v_A.length;
      const _h7839 = (_h7838 < 3);
      _g6678.length = 0;
      _st7194.pass++;
      G6679: {
        const _a7195 = v_U;
        for (let _i7196 = 0; _i7196 < _a7195.length; _i7196++) {
          const v_i = _a7195[_i7196];
          const _h7199 = _i7196;
          const _h7200 = (_h7199 > 0);
          const _h7201 = sp.edgeOf(v_c, v_i);
          const _a7197 = v_U;
          for (let _i7198 = 0; _i7198 < _a7197.length; _i7198++) {
            const v_j = _a7197[_i7198];
            let _c7820: boolean = (_h7200 && (_h7199 < _i7198));
            if (_c7820) {
              let _c7819: boolean = ((piece(b, sp, v_i).includes(v_j)) || (_h6055 && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
              if (!_c7819) {
                const _wc7202 = _h7201;
                const _wd7203 = 1;
                const _wc7204 = sp.edgeOf(v_c, v_j);
                const _wd7205 = 1;
                let _q7206 = false;
                Q7207: {
                  const _a7209 = throughWhere(sp, v_c, (_te7208: number): boolean => {  return ((_te7208 === _wc7204 ? _wd7205 : (_te7208 === _wc7202 ? _wd7203 : (b.grid[_te7208] || -1))) === 1); });
                  for (let _i7210 = 0; _i7210 < _a7209.length; _i7210++) {
                    const v_t = _a7209[_i7210];
                    let _c7229: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c7229) {
                      let _g7211 = 0;
                      G7212: {
                        const _a7213 = sp.adj4[v_t];
                        for (let _i7214 = 0; _i7214 < _a7213.length; _i7214++) {
                          const _t7215 = sp.adj4Edges[v_t][_i7214];
                          if (!(((_t7215 === _wc7204 ? _wd7205 : (_t7215 === _wc7202 ? _wd7203 : (b.grid[_t7215] || -1))) === 1))) continue;
                          _g7211++;
                        }
                      }
                      let _g7216 = 0;
                      G7217: {
                        for (let _i7218 = 0; _i7218 < 1; _i7218++) {
                          const v_k = v_t;
                          const _h7219 = clueAt(cl.number, v_k);
                          const _h7226 = (_h7219 + 1);
                          let _c7228: boolean = (_h7219 !== -1);
                          if (_c7228) {
                            let _c7227: boolean = (_h6075 || (_h7219 === 1));
                            if (!_c7227) {
                              let _g7220 = 0;
                              G7221: {
                                const _t7222 = (_h7219 + 1);
                                const _a7223 = cluesValued(cl.number, _t7222);
                                for (let _i7224 = 0; _i7224 < _a7223.length; _i7224++) {
                                  const v_x = _a7223[_i7224];
                                  const _h7225 = clueAt(cl.number, v_x);
                                  if (!((_h7225 === _h7226))) continue;
                                  _g7220++;
                                }
                              }
                              _c7227 = (_g7220 === 0);
                            }
                            _c7228 = _c7227;
                          }
                          if (!(_c7228)) continue;
                          _g7216++;
                        }
                      }
                      _c7229 = (_g7211 < (2 - _g7216));
                    }
                    if (!(_c7229)) continue;
                    let _g7230 = 0;
                    G7231: {
                      const _a7232 = sp.adj4[v_t];
                      for (let _i7233 = 0; _i7233 < _a7232.length; _i7233++) {
                        const _t7234 = sp.adj4Edges[v_t][_i7233];
                        if (!(((_t7234 === _wc7204 ? _wd7205 : (_t7234 === _wc7202 ? _wd7203 : (b.grid[_t7234] || -1))) === 1))) continue;
                        _g7230++;
                      }
                    }
                    let _g7235 = 0;
                    G7236: {
                      for (let _i7237 = 0; _i7237 < 1; _i7237++) {
                        const v_k = v_t;
                        const _h7238 = clueAt(cl.number, v_k);
                        const _h7245 = (_h7238 + 1);
                        let _c7247: boolean = (_h7238 !== -1);
                        if (_c7247) {
                          let _c7246: boolean = (_h6075 || (_h7238 === 1));
                          if (!_c7246) {
                            let _g7239 = 0;
                            G7240: {
                              const _t7241 = (_h7238 + 1);
                              const _a7242 = cluesValued(cl.number, _t7241);
                              for (let _i7243 = 0; _i7243 < _a7242.length; _i7243++) {
                                const v_x = _a7242[_i7243];
                                const _h7244 = clueAt(cl.number, v_x);
                                if (!((_h7244 === _h7245))) continue;
                                _g7239++;
                              }
                            }
                            _c7246 = (_g7239 === 0);
                          }
                          _c7247 = _c7246;
                        }
                        if (!(_c7247)) continue;
                        _g7235++;
                      }
                    }
                    let _c7523: boolean = (_g7230 < (2 - _g7235));
                    if (_c7523) {
                      let _q7248 = false;
                      Q7249: {
                        const _a7250 = sp.adj4[v_t];
                        for (let _i7251 = 0; _i7251 < _a7250.length; _i7251++) {
                          const v_y = _a7250[_i7251];
                          const _t7252 = sp.adj4Edges[v_t][_i7251];
                          let _c7271: boolean = !((_t7252 === _wc7204 ? true : (_t7252 === _wc7202 ? true : (b.grid[_t7252] !== 0))));
                          if (_c7271) {
                            let _g7253 = 0;
                            G7254: {
                              const _a7255 = sp.adj4[v_t];
                              for (let _i7256 = 0; _i7256 < _a7255.length; _i7256++) {
                                const _t7257 = sp.adj4Edges[v_t][_i7256];
                                if (!(((_t7257 === _wc7204 ? _wd7205 : (_t7257 === _wc7202 ? _wd7203 : (b.grid[_t7257] || -1))) === 1))) continue;
                                _g7253++;
                              }
                            }
                            let _g7258 = 0;
                            G7259: {
                              for (let _i7260 = 0; _i7260 < 1; _i7260++) {
                                const v_k = v_t;
                                const _h7261 = clueAt(cl.number, v_k);
                                const _h7268 = (_h7261 + 1);
                                let _c7270: boolean = (_h7261 !== -1);
                                if (_c7270) {
                                  let _c7269: boolean = (_h6075 || (_h7261 === 1));
                                  if (!_c7269) {
                                    let _g7262 = 0;
                                    G7263: {
                                      const _t7264 = (_h7261 + 1);
                                      const _a7265 = cluesValued(cl.number, _t7264);
                                      for (let _i7266 = 0; _i7266 < _a7265.length; _i7266++) {
                                        const v_x = _a7265[_i7266];
                                        const _h7267 = clueAt(cl.number, v_x);
                                        if (!((_h7267 === _h7268))) continue;
                                        _g7262++;
                                      }
                                    }
                                    _c7269 = (_g7262 === 0);
                                  }
                                  _c7270 = _c7269;
                                }
                                if (!(_c7270)) continue;
                                _g7258++;
                              }
                            }
                            _c7271 = (_g7253 < (2 - _g7258));
                          }
                          let _c7291: boolean = _c7271;
                          if (_c7291) {
                            let _g7272 = 0;
                            G7273: {
                              const _a7275 = sp.adj4[v_y];
                              for (let _i7276 = 0; _i7276 < _a7275.length; _i7276++) {
                                const _t7277 = sp.adj4Edges[v_y][_i7276];
                                if (!(((_t7277 === _wc7204 ? _wd7205 : (_t7277 === _wc7202 ? _wd7203 : (b.grid[_t7277] || -1))) === 1))) continue;
                                _g7272++;
                              }
                            }
                            let _g7278 = 0;
                            G7279: {
                              for (let _i7280 = 0; _i7280 < 1; _i7280++) {
                                const v_k = v_y;
                                const _h7281 = clueAt(cl.number, v_k);
                                const _h7288 = (_h7281 + 1);
                                let _c7290: boolean = (_h7281 !== -1);
                                if (_c7290) {
                                  let _c7289: boolean = (_h6075 || (_h7281 === 1));
                                  if (!_c7289) {
                                    let _g7282 = 0;
                                    G7283: {
                                      const _t7284 = (_h7281 + 1);
                                      const _a7285 = cluesValued(cl.number, _t7284);
                                      for (let _i7286 = 0; _i7286 < _a7285.length; _i7286++) {
                                        const v_x = _a7285[_i7286];
                                        const _h7287 = clueAt(cl.number, v_x);
                                        if (!((_h7287 === _h7288))) continue;
                                        _g7282++;
                                      }
                                    }
                                    _c7289 = (_g7282 === 0);
                                  }
                                  _c7290 = _c7289;
                                }
                                if (!(_c7290)) continue;
                                _g7278++;
                              }
                            }
                            _c7291 = (_g7272 < (2 - _g7278));
                          }
                          let _c7374: boolean = _c7291;
                          if (_c7374) {
                            let _q7292 = true;
                            Q7293: {
                              _g7294.length = 0;
                              G7295: {
                                for (let _i7297 = 0; _i7297 < 1; _i7297++) {
                                  const v_x = v_t;
                                  const _h7298 = clueAt(cl.number, v_x);
                                  if (!((_h7298 !== -1))) continue;
                                  _g7294.push(v_x);
                                }
                              }
                              _g7299.length = 0;
                              _st7313.pass++;
                              G7300: {
                                const _a7320 = throughWhere(sp, v_t, (_te7315: number): boolean => { let _c7317: boolean = ((_te7315 === _wc7204 ? _wd7205 : (_te7315 === _wc7202 ? _wd7203 : (b.grid[_te7315] || -1))) === 1); if (_c7317) {   const _t7316 = sp.edgeEnds[2 * _te7315];   _c7317 = !((clueAt(cl.number, _t7316) !== -1)); } let _c7319: boolean = _c7317; if (_c7319) {   const _t7318 = sp.edgeEnds[2 * _te7315 + 1];   _c7319 = !((clueAt(cl.number, _t7318) !== -1)); } return _c7319; });
                                for (let _i7321 = 0; _i7321 < _a7320.length; _i7321++) {
                                  const v_t_7314 = _a7320[_i7321];
                                  const _h7324 = clueAt(cl.number, v_t_7314);
                                  const _h7325 = (_h7324 !== -1);
                                  const _h7326 = _h7325;
                                  const _h7327 = !(_h7326);
                                  const _a7322 = sp.adj4[v_t_7314];
                                  for (let _i7323 = 0; _i7323 < _a7322.length; _i7323++) {
                                    const v_x = _a7322[_i7323];
                                    const _h7328 = clueAt(cl.number, v_x);
                                    let _c7330: boolean = (_h7327 && (_h7328 !== -1));
                                    if (_c7330) {
                                      const _t7329 = sp.adj4Edges[v_t_7314][_i7323];
                                      _c7330 = ((_t7329 === _wc7204 ? _wd7205 : (_t7329 === _wc7202 ? _wd7203 : (b.grid[_t7329] || -1))) === 1);
                                    }
                                    if (!(_c7330)) continue;
                                    const _t7331 = v_x;
                                    if (_g7299.length < 16) { if (!_g7299.includes(_t7331)) _g7299.push(_t7331); } else addOnce(_g7299, _st7313, _t7331);
                                  }
                                }
                              }
                              const _a7332 = union(_g7294, _g7299);
                              for (let _i7333 = 0; _i7333 < _a7332.length; _i7333++) {
                                const v_p = _a7332[_i7333];
                                const _h7372 = clueAt(cl.number, v_p);
                                _g7334.length = 0;
                                G7335: {
                                  for (let _i7337 = 0; _i7337 < 1; _i7337++) {
                                    const v_x = v_y;
                                    const _h7338 = clueAt(cl.number, v_x);
                                    if (!((_h7338 !== -1))) continue;
                                    _g7334.push(v_x);
                                  }
                                }
                                _g7339.length = 0;
                                _st7352.pass++;
                                G7340: {
                                  const _a7358 = throughWhere(sp, v_y, (_te7353: number): boolean => { let _c7355: boolean = ((_te7353 === _wc7204 ? _wd7205 : (_te7353 === _wc7202 ? _wd7203 : (b.grid[_te7353] || -1))) === 1); if (_c7355) {   const _t7354 = sp.edgeEnds[2 * _te7353];   _c7355 = !((clueAt(cl.number, _t7354) !== -1)); } let _c7357: boolean = _c7355; if (_c7357) {   const _t7356 = sp.edgeEnds[2 * _te7353 + 1];   _c7357 = !((clueAt(cl.number, _t7356) !== -1)); } return _c7357; });
                                  for (let _i7359 = 0; _i7359 < _a7358.length; _i7359++) {
                                    const v_t = _a7358[_i7359];
                                    const _h7362 = clueAt(cl.number, v_t);
                                    const _h7363 = (_h7362 !== -1);
                                    const _h7364 = _h7363;
                                    const _h7365 = !(_h7364);
                                    const _a7360 = sp.adj4[v_t];
                                    for (let _i7361 = 0; _i7361 < _a7360.length; _i7361++) {
                                      const v_x = _a7360[_i7361];
                                      const _h7366 = clueAt(cl.number, v_x);
                                      let _c7368: boolean = (_h7365 && (_h7366 !== -1));
                                      if (_c7368) {
                                        const _t7367 = sp.adj4Edges[v_t][_i7361];
                                        _c7368 = ((_t7367 === _wc7204 ? _wd7205 : (_t7367 === _wc7202 ? _wd7203 : (b.grid[_t7367] || -1))) === 1);
                                      }
                                      if (!(_c7368)) continue;
                                      const _t7369 = v_x;
                                      if (_g7339.length < 16) { if (!_g7339.includes(_t7369)) _g7339.push(_t7369); } else addOnce(_g7339, _st7352, _t7369);
                                    }
                                  }
                                }
                                const _a7370 = union(_g7334, _g7339);
                                for (let _i7371 = 0; _i7371 < _a7370.length; _i7371++) {
                                  const v_q = _a7370[_i7371];
                                  const _h7373 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h7372 - _h7373)) === cl.step))) {
                                    _q7292 = false;
                                    break Q7293;
                                  }
                                }
                              }
                            }
                            _c7374 = _q7292;
                          }
                          if (!((_c7374 && (_h6075 || !(throughWhere(sp, v_t, (_te7375: number): boolean => {  return ((_te7375 === _wc7204 ? _wd7205 : (_te7375 === _wc7202 ? _wd7203 : (b.grid[_te7375] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g7376 = 0;
                          G7377: {
                            const _a7378 = sp.adj4[v_t];
                            for (let _i7379 = 0; _i7379 < _a7378.length; _i7379++) {
                              const _t7380 = sp.adj4Edges[v_t][_i7379];
                              if (!(((_t7380 === _wc7204 ? _wd7205 : (_t7380 === _wc7202 ? _wd7203 : (b.grid[_t7380] || -1))) === 1))) continue;
                              _g7376++;
                            }
                          }
                          let _g7381 = 0;
                          G7382: {
                            for (let _i7383 = 0; _i7383 < 1; _i7383++) {
                              const v_k = v_t;
                              const _h7384 = clueAt(cl.number, v_k);
                              const _h7391 = (_h7384 + 1);
                              let _c7393: boolean = (_h7384 !== -1);
                              if (_c7393) {
                                let _c7392: boolean = (_h6075 || (_h7384 === 1));
                                if (!_c7392) {
                                  let _g7385 = 0;
                                  G7386: {
                                    const _t7387 = (_h7384 + 1);
                                    const _a7388 = cluesValued(cl.number, _t7387);
                                    for (let _i7389 = 0; _i7389 < _a7388.length; _i7389++) {
                                      const v_x = _a7388[_i7389];
                                      const _h7390 = clueAt(cl.number, v_x);
                                      if (!((_h7390 === _h7391))) continue;
                                      _g7385++;
                                    }
                                  }
                                  _c7392 = (_g7385 === 0);
                                }
                                _c7393 = _c7392;
                              }
                              if (!(_c7393)) continue;
                              _g7381++;
                            }
                          }
                          let _c7522: boolean = ((_g7376 + 1) === (2 - _g7381));
                          if (!_c7522) {
                            let _q7394 = false;
                            Q7395: {
                              const _a7396 = sp.adj4[v_t];
                              const _n7397 = _i7251;
                              for (let _i7398 = 0; _i7398 < _n7397; _i7398++) {
                                const v_z = _a7396[_i7398];
                                const _t7399 = sp.adj4Edges[v_t][_i7398];
                                let _c7418: boolean = !((_t7399 === _wc7204 ? true : (_t7399 === _wc7202 ? true : (b.grid[_t7399] !== 0))));
                                if (_c7418) {
                                  let _g7400 = 0;
                                  G7401: {
                                    const _a7402 = sp.adj4[v_t];
                                    for (let _i7403 = 0; _i7403 < _a7402.length; _i7403++) {
                                      const _t7404 = sp.adj4Edges[v_t][_i7403];
                                      if (!(((_t7404 === _wc7204 ? _wd7205 : (_t7404 === _wc7202 ? _wd7203 : (b.grid[_t7404] || -1))) === 1))) continue;
                                      _g7400++;
                                    }
                                  }
                                  let _g7405 = 0;
                                  G7406: {
                                    for (let _i7407 = 0; _i7407 < 1; _i7407++) {
                                      const v_k = v_t;
                                      const _h7408 = clueAt(cl.number, v_k);
                                      const _h7415 = (_h7408 + 1);
                                      let _c7417: boolean = (_h7408 !== -1);
                                      if (_c7417) {
                                        let _c7416: boolean = (_h6075 || (_h7408 === 1));
                                        if (!_c7416) {
                                          let _g7409 = 0;
                                          G7410: {
                                            const _t7411 = (_h7408 + 1);
                                            const _a7412 = cluesValued(cl.number, _t7411);
                                            for (let _i7413 = 0; _i7413 < _a7412.length; _i7413++) {
                                              const v_x = _a7412[_i7413];
                                              const _h7414 = clueAt(cl.number, v_x);
                                              if (!((_h7414 === _h7415))) continue;
                                              _g7409++;
                                            }
                                          }
                                          _c7416 = (_g7409 === 0);
                                        }
                                        _c7417 = _c7416;
                                      }
                                      if (!(_c7417)) continue;
                                      _g7405++;
                                    }
                                  }
                                  _c7418 = (_g7400 < (2 - _g7405));
                                }
                                let _c7437: boolean = _c7418;
                                if (_c7437) {
                                  let _g7419 = 0;
                                  G7420: {
                                    const _a7421 = sp.adj4[v_z];
                                    for (let _i7422 = 0; _i7422 < _a7421.length; _i7422++) {
                                      const _t7423 = sp.adj4Edges[v_z][_i7422];
                                      if (!(((_t7423 === _wc7204 ? _wd7205 : (_t7423 === _wc7202 ? _wd7203 : (b.grid[_t7423] || -1))) === 1))) continue;
                                      _g7419++;
                                    }
                                  }
                                  let _g7424 = 0;
                                  G7425: {
                                    for (let _i7426 = 0; _i7426 < 1; _i7426++) {
                                      const v_k = v_z;
                                      const _h7427 = clueAt(cl.number, v_k);
                                      const _h7434 = (_h7427 + 1);
                                      let _c7436: boolean = (_h7427 !== -1);
                                      if (_c7436) {
                                        let _c7435: boolean = (_h6075 || (_h7427 === 1));
                                        if (!_c7435) {
                                          let _g7428 = 0;
                                          G7429: {
                                            const _t7430 = (_h7427 + 1);
                                            const _a7431 = cluesValued(cl.number, _t7430);
                                            for (let _i7432 = 0; _i7432 < _a7431.length; _i7432++) {
                                              const v_x = _a7431[_i7432];
                                              const _h7433 = clueAt(cl.number, v_x);
                                              if (!((_h7433 === _h7434))) continue;
                                              _g7428++;
                                            }
                                          }
                                          _c7435 = (_g7428 === 0);
                                        }
                                        _c7436 = _c7435;
                                      }
                                      if (!(_c7436)) continue;
                                      _g7424++;
                                    }
                                  }
                                  _c7437 = (_g7419 < (2 - _g7424));
                                }
                                let _c7520: boolean = _c7437;
                                if (_c7520) {
                                  let _q7438 = true;
                                  Q7439: {
                                    _g7440.length = 0;
                                    G7441: {
                                      for (let _i7443 = 0; _i7443 < 1; _i7443++) {
                                        const v_x = v_t;
                                        const _h7444 = clueAt(cl.number, v_x);
                                        if (!((_h7444 !== -1))) continue;
                                        _g7440.push(v_x);
                                      }
                                    }
                                    _g7445.length = 0;
                                    _st7459.pass++;
                                    G7446: {
                                      const _a7466 = throughWhere(sp, v_t, (_te7461: number): boolean => { let _c7463: boolean = ((_te7461 === _wc7204 ? _wd7205 : (_te7461 === _wc7202 ? _wd7203 : (b.grid[_te7461] || -1))) === 1); if (_c7463) {   const _t7462 = sp.edgeEnds[2 * _te7461];   _c7463 = !((clueAt(cl.number, _t7462) !== -1)); } let _c7465: boolean = _c7463; if (_c7465) {   const _t7464 = sp.edgeEnds[2 * _te7461 + 1];   _c7465 = !((clueAt(cl.number, _t7464) !== -1)); } return _c7465; });
                                      for (let _i7467 = 0; _i7467 < _a7466.length; _i7467++) {
                                        const v_t_7460 = _a7466[_i7467];
                                        const _h7470 = clueAt(cl.number, v_t_7460);
                                        const _h7471 = (_h7470 !== -1);
                                        const _h7472 = _h7471;
                                        const _h7473 = !(_h7472);
                                        const _a7468 = sp.adj4[v_t_7460];
                                        for (let _i7469 = 0; _i7469 < _a7468.length; _i7469++) {
                                          const v_x = _a7468[_i7469];
                                          const _h7474 = clueAt(cl.number, v_x);
                                          let _c7476: boolean = (_h7473 && (_h7474 !== -1));
                                          if (_c7476) {
                                            const _t7475 = sp.adj4Edges[v_t_7460][_i7469];
                                            _c7476 = ((_t7475 === _wc7204 ? _wd7205 : (_t7475 === _wc7202 ? _wd7203 : (b.grid[_t7475] || -1))) === 1);
                                          }
                                          if (!(_c7476)) continue;
                                          const _t7477 = v_x;
                                          if (_g7445.length < 16) { if (!_g7445.includes(_t7477)) _g7445.push(_t7477); } else addOnce(_g7445, _st7459, _t7477);
                                        }
                                      }
                                    }
                                    const _a7478 = union(_g7440, _g7445);
                                    for (let _i7479 = 0; _i7479 < _a7478.length; _i7479++) {
                                      const v_p = _a7478[_i7479];
                                      const _h7518 = clueAt(cl.number, v_p);
                                      _g7480.length = 0;
                                      G7481: {
                                        for (let _i7483 = 0; _i7483 < 1; _i7483++) {
                                          const v_x = v_z;
                                          const _h7484 = clueAt(cl.number, v_x);
                                          if (!((_h7484 !== -1))) continue;
                                          _g7480.push(v_x);
                                        }
                                      }
                                      _g7485.length = 0;
                                      _st7498.pass++;
                                      G7486: {
                                        const _a7504 = throughWhere(sp, v_z, (_te7499: number): boolean => { let _c7501: boolean = ((_te7499 === _wc7204 ? _wd7205 : (_te7499 === _wc7202 ? _wd7203 : (b.grid[_te7499] || -1))) === 1); if (_c7501) {   const _t7500 = sp.edgeEnds[2 * _te7499];   _c7501 = !((clueAt(cl.number, _t7500) !== -1)); } let _c7503: boolean = _c7501; if (_c7503) {   const _t7502 = sp.edgeEnds[2 * _te7499 + 1];   _c7503 = !((clueAt(cl.number, _t7502) !== -1)); } return _c7503; });
                                        for (let _i7505 = 0; _i7505 < _a7504.length; _i7505++) {
                                          const v_t = _a7504[_i7505];
                                          const _h7508 = clueAt(cl.number, v_t);
                                          const _h7509 = (_h7508 !== -1);
                                          const _h7510 = _h7509;
                                          const _h7511 = !(_h7510);
                                          const _a7506 = sp.adj4[v_t];
                                          for (let _i7507 = 0; _i7507 < _a7506.length; _i7507++) {
                                            const v_x = _a7506[_i7507];
                                            const _h7512 = clueAt(cl.number, v_x);
                                            let _c7514: boolean = (_h7511 && (_h7512 !== -1));
                                            if (_c7514) {
                                              const _t7513 = sp.adj4Edges[v_t][_i7507];
                                              _c7514 = ((_t7513 === _wc7204 ? _wd7205 : (_t7513 === _wc7202 ? _wd7203 : (b.grid[_t7513] || -1))) === 1);
                                            }
                                            if (!(_c7514)) continue;
                                            const _t7515 = v_x;
                                            if (_g7485.length < 16) { if (!_g7485.includes(_t7515)) _g7485.push(_t7515); } else addOnce(_g7485, _st7498, _t7515);
                                          }
                                        }
                                      }
                                      const _a7516 = union(_g7480, _g7485);
                                      for (let _i7517 = 0; _i7517 < _a7516.length; _i7517++) {
                                        const v_q = _a7516[_i7517];
                                        const _h7519 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7518 - _h7519)) === cl.step))) {
                                          _q7438 = false;
                                          break Q7439;
                                        }
                                      }
                                    }
                                  }
                                  _c7520 = _q7438;
                                }
                                if ((_c7520 && (_h6075 || !(throughWhere(sp, v_t, (_te7521: number): boolean => {  return ((_te7521 === _wc7204 ? _wd7205 : (_te7521 === _wc7202 ? _wd7203 : (b.grid[_te7521] || -1))) === 1); }).includes(v_z))))) {
                                  _q7394 = true;
                                  break Q7395;
                                }
                              }
                            }
                            _c7522 = _q7394;
                          }
                          if (_c7522) {
                            _q7248 = true;
                            break Q7249;
                          }
                        }
                      }
                      _c7523 = !(_q7248);
                    }
                    let _c7818: boolean = _c7523;
                    if (!_c7818) {
                      let _q7524 = false;
                      Q7525: {
                        const _a7526 = sp.adj4[v_t];
                        for (let _i7527 = 0; _i7527 < _a7526.length; _i7527++) {
                          const v_s = _a7526[_i7527];
                          let _g7528 = 0;
                          G7529: {
                            const _a7530 = sp.adj4[v_s];
                            for (let _i7531 = 0; _i7531 < _a7530.length; _i7531++) {
                              const _t7532 = sp.adj4Edges[v_s][_i7531];
                              if (!(((_t7532 === _wc7204 ? _wd7205 : (_t7532 === _wc7202 ? _wd7203 : (b.grid[_t7532] || -1))) === 1))) continue;
                              _g7528++;
                            }
                          }
                          let _g7533 = 0;
                          G7534: {
                            for (let _i7535 = 0; _i7535 < 1; _i7535++) {
                              const v_k = v_s;
                              const _h7536 = clueAt(cl.number, v_k);
                              const _h7543 = (_h7536 + 1);
                              let _c7545: boolean = (_h7536 !== -1);
                              if (_c7545) {
                                let _c7544: boolean = (_h6075 || (_h7536 === 1));
                                if (!_c7544) {
                                  let _g7537 = 0;
                                  G7538: {
                                    const _t7539 = (_h7536 + 1);
                                    const _a7540 = cluesValued(cl.number, _t7539);
                                    for (let _i7541 = 0; _i7541 < _a7540.length; _i7541++) {
                                      const v_x = _a7540[_i7541];
                                      const _h7542 = clueAt(cl.number, v_x);
                                      if (!((_h7542 === _h7543))) continue;
                                      _g7537++;
                                    }
                                  }
                                  _c7544 = (_g7537 === 0);
                                }
                                _c7545 = _c7544;
                              }
                              if (!(_c7545)) continue;
                              _g7533++;
                            }
                          }
                          let _c7817: boolean = (_g7528 < (2 - _g7533));
                          if (_c7817) {
                            let _q7546 = false;
                            Q7547: {
                              const _a7548 = sp.adj4[v_s];
                              for (let _i7549 = 0; _i7549 < _a7548.length; _i7549++) {
                                const v_y = _a7548[_i7549];
                                const _t7550 = sp.adj4Edges[v_s][_i7549];
                                let _c7569: boolean = !((_t7550 === _wc7204 ? true : (_t7550 === _wc7202 ? true : (b.grid[_t7550] !== 0))));
                                if (_c7569) {
                                  let _g7551 = 0;
                                  G7552: {
                                    const _a7553 = sp.adj4[v_s];
                                    for (let _i7554 = 0; _i7554 < _a7553.length; _i7554++) {
                                      const _t7555 = sp.adj4Edges[v_s][_i7554];
                                      if (!(((_t7555 === _wc7204 ? _wd7205 : (_t7555 === _wc7202 ? _wd7203 : (b.grid[_t7555] || -1))) === 1))) continue;
                                      _g7551++;
                                    }
                                  }
                                  let _g7556 = 0;
                                  G7557: {
                                    for (let _i7558 = 0; _i7558 < 1; _i7558++) {
                                      const v_k = v_s;
                                      const _h7559 = clueAt(cl.number, v_k);
                                      const _h7566 = (_h7559 + 1);
                                      let _c7568: boolean = (_h7559 !== -1);
                                      if (_c7568) {
                                        let _c7567: boolean = (_h6075 || (_h7559 === 1));
                                        if (!_c7567) {
                                          let _g7560 = 0;
                                          G7561: {
                                            const _t7562 = (_h7559 + 1);
                                            const _a7563 = cluesValued(cl.number, _t7562);
                                            for (let _i7564 = 0; _i7564 < _a7563.length; _i7564++) {
                                              const v_x = _a7563[_i7564];
                                              const _h7565 = clueAt(cl.number, v_x);
                                              if (!((_h7565 === _h7566))) continue;
                                              _g7560++;
                                            }
                                          }
                                          _c7567 = (_g7560 === 0);
                                        }
                                        _c7568 = _c7567;
                                      }
                                      if (!(_c7568)) continue;
                                      _g7556++;
                                    }
                                  }
                                  _c7569 = (_g7551 < (2 - _g7556));
                                }
                                let _c7589: boolean = _c7569;
                                if (_c7589) {
                                  let _g7570 = 0;
                                  G7571: {
                                    const _a7573 = sp.adj4[v_y];
                                    for (let _i7574 = 0; _i7574 < _a7573.length; _i7574++) {
                                      const _t7575 = sp.adj4Edges[v_y][_i7574];
                                      if (!(((_t7575 === _wc7204 ? _wd7205 : (_t7575 === _wc7202 ? _wd7203 : (b.grid[_t7575] || -1))) === 1))) continue;
                                      _g7570++;
                                    }
                                  }
                                  let _g7576 = 0;
                                  G7577: {
                                    for (let _i7578 = 0; _i7578 < 1; _i7578++) {
                                      const v_k = v_y;
                                      const _h7579 = clueAt(cl.number, v_k);
                                      const _h7586 = (_h7579 + 1);
                                      let _c7588: boolean = (_h7579 !== -1);
                                      if (_c7588) {
                                        let _c7587: boolean = (_h6075 || (_h7579 === 1));
                                        if (!_c7587) {
                                          let _g7580 = 0;
                                          G7581: {
                                            const _t7582 = (_h7579 + 1);
                                            const _a7583 = cluesValued(cl.number, _t7582);
                                            for (let _i7584 = 0; _i7584 < _a7583.length; _i7584++) {
                                              const v_x = _a7583[_i7584];
                                              const _h7585 = clueAt(cl.number, v_x);
                                              if (!((_h7585 === _h7586))) continue;
                                              _g7580++;
                                            }
                                          }
                                          _c7587 = (_g7580 === 0);
                                        }
                                        _c7588 = _c7587;
                                      }
                                      if (!(_c7588)) continue;
                                      _g7576++;
                                    }
                                  }
                                  _c7589 = (_g7570 < (2 - _g7576));
                                }
                                let _c7670: boolean = _c7589;
                                if (_c7670) {
                                  let _q7590 = true;
                                  Q7591: {
                                    _g7592.length = 0;
                                    G7593: {
                                      for (let _i7595 = 0; _i7595 < 1; _i7595++) {
                                        const v_x = v_s;
                                        const _h7596 = clueAt(cl.number, v_x);
                                        if (!((_h7596 !== -1))) continue;
                                        _g7592.push(v_x);
                                      }
                                    }
                                    _g7597.length = 0;
                                    _st7610.pass++;
                                    G7598: {
                                      const _a7616 = throughWhere(sp, v_s, (_te7611: number): boolean => { let _c7613: boolean = ((_te7611 === _wc7204 ? _wd7205 : (_te7611 === _wc7202 ? _wd7203 : (b.grid[_te7611] || -1))) === 1); if (_c7613) {   const _t7612 = sp.edgeEnds[2 * _te7611];   _c7613 = !((clueAt(cl.number, _t7612) !== -1)); } let _c7615: boolean = _c7613; if (_c7615) {   const _t7614 = sp.edgeEnds[2 * _te7611 + 1];   _c7615 = !((clueAt(cl.number, _t7614) !== -1)); } return _c7615; });
                                      for (let _i7617 = 0; _i7617 < _a7616.length; _i7617++) {
                                        const v_t = _a7616[_i7617];
                                        const _h7620 = clueAt(cl.number, v_t);
                                        const _h7621 = (_h7620 !== -1);
                                        const _h7622 = _h7621;
                                        const _h7623 = !(_h7622);
                                        const _a7618 = sp.adj4[v_t];
                                        for (let _i7619 = 0; _i7619 < _a7618.length; _i7619++) {
                                          const v_x = _a7618[_i7619];
                                          const _h7624 = clueAt(cl.number, v_x);
                                          let _c7626: boolean = (_h7623 && (_h7624 !== -1));
                                          if (_c7626) {
                                            const _t7625 = sp.adj4Edges[v_t][_i7619];
                                            _c7626 = ((_t7625 === _wc7204 ? _wd7205 : (_t7625 === _wc7202 ? _wd7203 : (b.grid[_t7625] || -1))) === 1);
                                          }
                                          if (!(_c7626)) continue;
                                          const _t7627 = v_x;
                                          if (_g7597.length < 16) { if (!_g7597.includes(_t7627)) _g7597.push(_t7627); } else addOnce(_g7597, _st7610, _t7627);
                                        }
                                      }
                                    }
                                    const _a7628 = union(_g7592, _g7597);
                                    for (let _i7629 = 0; _i7629 < _a7628.length; _i7629++) {
                                      const v_p = _a7628[_i7629];
                                      const _h7668 = clueAt(cl.number, v_p);
                                      _g7630.length = 0;
                                      G7631: {
                                        for (let _i7633 = 0; _i7633 < 1; _i7633++) {
                                          const v_x = v_y;
                                          const _h7634 = clueAt(cl.number, v_x);
                                          if (!((_h7634 !== -1))) continue;
                                          _g7630.push(v_x);
                                        }
                                      }
                                      _g7635.length = 0;
                                      _st7648.pass++;
                                      G7636: {
                                        const _a7654 = throughWhere(sp, v_y, (_te7649: number): boolean => { let _c7651: boolean = ((_te7649 === _wc7204 ? _wd7205 : (_te7649 === _wc7202 ? _wd7203 : (b.grid[_te7649] || -1))) === 1); if (_c7651) {   const _t7650 = sp.edgeEnds[2 * _te7649];   _c7651 = !((clueAt(cl.number, _t7650) !== -1)); } let _c7653: boolean = _c7651; if (_c7653) {   const _t7652 = sp.edgeEnds[2 * _te7649 + 1];   _c7653 = !((clueAt(cl.number, _t7652) !== -1)); } return _c7653; });
                                        for (let _i7655 = 0; _i7655 < _a7654.length; _i7655++) {
                                          const v_t = _a7654[_i7655];
                                          const _h7658 = clueAt(cl.number, v_t);
                                          const _h7659 = (_h7658 !== -1);
                                          const _h7660 = _h7659;
                                          const _h7661 = !(_h7660);
                                          const _a7656 = sp.adj4[v_t];
                                          for (let _i7657 = 0; _i7657 < _a7656.length; _i7657++) {
                                            const v_x = _a7656[_i7657];
                                            const _h7662 = clueAt(cl.number, v_x);
                                            let _c7664: boolean = (_h7661 && (_h7662 !== -1));
                                            if (_c7664) {
                                              const _t7663 = sp.adj4Edges[v_t][_i7657];
                                              _c7664 = ((_t7663 === _wc7204 ? _wd7205 : (_t7663 === _wc7202 ? _wd7203 : (b.grid[_t7663] || -1))) === 1);
                                            }
                                            if (!(_c7664)) continue;
                                            const _t7665 = v_x;
                                            if (_g7635.length < 16) { if (!_g7635.includes(_t7665)) _g7635.push(_t7665); } else addOnce(_g7635, _st7648, _t7665);
                                          }
                                        }
                                      }
                                      const _a7666 = union(_g7630, _g7635);
                                      for (let _i7667 = 0; _i7667 < _a7666.length; _i7667++) {
                                        const v_q = _a7666[_i7667];
                                        const _h7669 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7668 - _h7669)) === cl.step))) {
                                          _q7590 = false;
                                          break Q7591;
                                        }
                                      }
                                    }
                                  }
                                  _c7670 = _q7590;
                                }
                                if (!((_c7670 && (_h6075 || !(throughWhere(sp, v_s, (_te7671: number): boolean => {  return ((_te7671 === _wc7204 ? _wd7205 : (_te7671 === _wc7202 ? _wd7203 : (b.grid[_te7671] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g7672 = 0;
                                G7673: {
                                  const _a7674 = sp.adj4[v_s];
                                  for (let _i7675 = 0; _i7675 < _a7674.length; _i7675++) {
                                    const _t7676 = sp.adj4Edges[v_s][_i7675];
                                    if (!(((_t7676 === _wc7204 ? _wd7205 : (_t7676 === _wc7202 ? _wd7203 : (b.grid[_t7676] || -1))) === 1))) continue;
                                    _g7672++;
                                  }
                                }
                                let _g7677 = 0;
                                G7678: {
                                  for (let _i7679 = 0; _i7679 < 1; _i7679++) {
                                    const v_k = v_s;
                                    const _h7680 = clueAt(cl.number, v_k);
                                    const _h7687 = (_h7680 + 1);
                                    let _c7689: boolean = (_h7680 !== -1);
                                    if (_c7689) {
                                      let _c7688: boolean = (_h6075 || (_h7680 === 1));
                                      if (!_c7688) {
                                        let _g7681 = 0;
                                        G7682: {
                                          const _t7683 = (_h7680 + 1);
                                          const _a7684 = cluesValued(cl.number, _t7683);
                                          for (let _i7685 = 0; _i7685 < _a7684.length; _i7685++) {
                                            const v_x = _a7684[_i7685];
                                            const _h7686 = clueAt(cl.number, v_x);
                                            if (!((_h7686 === _h7687))) continue;
                                            _g7681++;
                                          }
                                        }
                                        _c7688 = (_g7681 === 0);
                                      }
                                      _c7689 = _c7688;
                                    }
                                    if (!(_c7689)) continue;
                                    _g7677++;
                                  }
                                }
                                let _c7816: boolean = ((_g7672 + 1) === (2 - _g7677));
                                if (!_c7816) {
                                  let _q7690 = false;
                                  Q7691: {
                                    const _a7692 = sp.adj4[v_s];
                                    const _n7693 = _i7549;
                                    for (let _i7694 = 0; _i7694 < _n7693; _i7694++) {
                                      const v_z = _a7692[_i7694];
                                      const _t7695 = sp.adj4Edges[v_s][_i7694];
                                      let _c7714: boolean = !((_t7695 === _wc7204 ? true : (_t7695 === _wc7202 ? true : (b.grid[_t7695] !== 0))));
                                      if (_c7714) {
                                        let _g7696 = 0;
                                        G7697: {
                                          const _a7698 = sp.adj4[v_s];
                                          for (let _i7699 = 0; _i7699 < _a7698.length; _i7699++) {
                                            const _t7700 = sp.adj4Edges[v_s][_i7699];
                                            if (!(((_t7700 === _wc7204 ? _wd7205 : (_t7700 === _wc7202 ? _wd7203 : (b.grid[_t7700] || -1))) === 1))) continue;
                                            _g7696++;
                                          }
                                        }
                                        let _g7701 = 0;
                                        G7702: {
                                          for (let _i7703 = 0; _i7703 < 1; _i7703++) {
                                            const v_k = v_s;
                                            const _h7704 = clueAt(cl.number, v_k);
                                            const _h7711 = (_h7704 + 1);
                                            let _c7713: boolean = (_h7704 !== -1);
                                            if (_c7713) {
                                              let _c7712: boolean = (_h6075 || (_h7704 === 1));
                                              if (!_c7712) {
                                                let _g7705 = 0;
                                                G7706: {
                                                  const _t7707 = (_h7704 + 1);
                                                  const _a7708 = cluesValued(cl.number, _t7707);
                                                  for (let _i7709 = 0; _i7709 < _a7708.length; _i7709++) {
                                                    const v_x = _a7708[_i7709];
                                                    const _h7710 = clueAt(cl.number, v_x);
                                                    if (!((_h7710 === _h7711))) continue;
                                                    _g7705++;
                                                  }
                                                }
                                                _c7712 = (_g7705 === 0);
                                              }
                                              _c7713 = _c7712;
                                            }
                                            if (!(_c7713)) continue;
                                            _g7701++;
                                          }
                                        }
                                        _c7714 = (_g7696 < (2 - _g7701));
                                      }
                                      let _c7733: boolean = _c7714;
                                      if (_c7733) {
                                        let _g7715 = 0;
                                        G7716: {
                                          const _a7717 = sp.adj4[v_z];
                                          for (let _i7718 = 0; _i7718 < _a7717.length; _i7718++) {
                                            const _t7719 = sp.adj4Edges[v_z][_i7718];
                                            if (!(((_t7719 === _wc7204 ? _wd7205 : (_t7719 === _wc7202 ? _wd7203 : (b.grid[_t7719] || -1))) === 1))) continue;
                                            _g7715++;
                                          }
                                        }
                                        let _g7720 = 0;
                                        G7721: {
                                          for (let _i7722 = 0; _i7722 < 1; _i7722++) {
                                            const v_k = v_z;
                                            const _h7723 = clueAt(cl.number, v_k);
                                            const _h7730 = (_h7723 + 1);
                                            let _c7732: boolean = (_h7723 !== -1);
                                            if (_c7732) {
                                              let _c7731: boolean = (_h6075 || (_h7723 === 1));
                                              if (!_c7731) {
                                                let _g7724 = 0;
                                                G7725: {
                                                  const _t7726 = (_h7723 + 1);
                                                  const _a7727 = cluesValued(cl.number, _t7726);
                                                  for (let _i7728 = 0; _i7728 < _a7727.length; _i7728++) {
                                                    const v_x = _a7727[_i7728];
                                                    const _h7729 = clueAt(cl.number, v_x);
                                                    if (!((_h7729 === _h7730))) continue;
                                                    _g7724++;
                                                  }
                                                }
                                                _c7731 = (_g7724 === 0);
                                              }
                                              _c7732 = _c7731;
                                            }
                                            if (!(_c7732)) continue;
                                            _g7720++;
                                          }
                                        }
                                        _c7733 = (_g7715 < (2 - _g7720));
                                      }
                                      let _c7814: boolean = _c7733;
                                      if (_c7814) {
                                        let _q7734 = true;
                                        Q7735: {
                                          _g7736.length = 0;
                                          G7737: {
                                            for (let _i7739 = 0; _i7739 < 1; _i7739++) {
                                              const v_x = v_s;
                                              const _h7740 = clueAt(cl.number, v_x);
                                              if (!((_h7740 !== -1))) continue;
                                              _g7736.push(v_x);
                                            }
                                          }
                                          _g7741.length = 0;
                                          _st7754.pass++;
                                          G7742: {
                                            const _a7760 = throughWhere(sp, v_s, (_te7755: number): boolean => { let _c7757: boolean = ((_te7755 === _wc7204 ? _wd7205 : (_te7755 === _wc7202 ? _wd7203 : (b.grid[_te7755] || -1))) === 1); if (_c7757) {   const _t7756 = sp.edgeEnds[2 * _te7755];   _c7757 = !((clueAt(cl.number, _t7756) !== -1)); } let _c7759: boolean = _c7757; if (_c7759) {   const _t7758 = sp.edgeEnds[2 * _te7755 + 1];   _c7759 = !((clueAt(cl.number, _t7758) !== -1)); } return _c7759; });
                                            for (let _i7761 = 0; _i7761 < _a7760.length; _i7761++) {
                                              const v_t = _a7760[_i7761];
                                              const _h7764 = clueAt(cl.number, v_t);
                                              const _h7765 = (_h7764 !== -1);
                                              const _h7766 = _h7765;
                                              const _h7767 = !(_h7766);
                                              const _a7762 = sp.adj4[v_t];
                                              for (let _i7763 = 0; _i7763 < _a7762.length; _i7763++) {
                                                const v_x = _a7762[_i7763];
                                                const _h7768 = clueAt(cl.number, v_x);
                                                let _c7770: boolean = (_h7767 && (_h7768 !== -1));
                                                if (_c7770) {
                                                  const _t7769 = sp.adj4Edges[v_t][_i7763];
                                                  _c7770 = ((_t7769 === _wc7204 ? _wd7205 : (_t7769 === _wc7202 ? _wd7203 : (b.grid[_t7769] || -1))) === 1);
                                                }
                                                if (!(_c7770)) continue;
                                                const _t7771 = v_x;
                                                if (_g7741.length < 16) { if (!_g7741.includes(_t7771)) _g7741.push(_t7771); } else addOnce(_g7741, _st7754, _t7771);
                                              }
                                            }
                                          }
                                          const _a7772 = union(_g7736, _g7741);
                                          for (let _i7773 = 0; _i7773 < _a7772.length; _i7773++) {
                                            const v_p = _a7772[_i7773];
                                            const _h7812 = clueAt(cl.number, v_p);
                                            _g7774.length = 0;
                                            G7775: {
                                              for (let _i7777 = 0; _i7777 < 1; _i7777++) {
                                                const v_x = v_z;
                                                const _h7778 = clueAt(cl.number, v_x);
                                                if (!((_h7778 !== -1))) continue;
                                                _g7774.push(v_x);
                                              }
                                            }
                                            _g7779.length = 0;
                                            _st7792.pass++;
                                            G7780: {
                                              const _a7798 = throughWhere(sp, v_z, (_te7793: number): boolean => { let _c7795: boolean = ((_te7793 === _wc7204 ? _wd7205 : (_te7793 === _wc7202 ? _wd7203 : (b.grid[_te7793] || -1))) === 1); if (_c7795) {   const _t7794 = sp.edgeEnds[2 * _te7793];   _c7795 = !((clueAt(cl.number, _t7794) !== -1)); } let _c7797: boolean = _c7795; if (_c7797) {   const _t7796 = sp.edgeEnds[2 * _te7793 + 1];   _c7797 = !((clueAt(cl.number, _t7796) !== -1)); } return _c7797; });
                                              for (let _i7799 = 0; _i7799 < _a7798.length; _i7799++) {
                                                const v_t = _a7798[_i7799];
                                                const _h7802 = clueAt(cl.number, v_t);
                                                const _h7803 = (_h7802 !== -1);
                                                const _h7804 = _h7803;
                                                const _h7805 = !(_h7804);
                                                const _a7800 = sp.adj4[v_t];
                                                for (let _i7801 = 0; _i7801 < _a7800.length; _i7801++) {
                                                  const v_x = _a7800[_i7801];
                                                  const _h7806 = clueAt(cl.number, v_x);
                                                  let _c7808: boolean = (_h7805 && (_h7806 !== -1));
                                                  if (_c7808) {
                                                    const _t7807 = sp.adj4Edges[v_t][_i7801];
                                                    _c7808 = ((_t7807 === _wc7204 ? _wd7205 : (_t7807 === _wc7202 ? _wd7203 : (b.grid[_t7807] || -1))) === 1);
                                                  }
                                                  if (!(_c7808)) continue;
                                                  const _t7809 = v_x;
                                                  if (_g7779.length < 16) { if (!_g7779.includes(_t7809)) _g7779.push(_t7809); } else addOnce(_g7779, _st7792, _t7809);
                                                }
                                              }
                                            }
                                            const _a7810 = union(_g7774, _g7779);
                                            for (let _i7811 = 0; _i7811 < _a7810.length; _i7811++) {
                                              const v_q = _a7810[_i7811];
                                              const _h7813 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h7812 - _h7813)) === cl.step))) {
                                                _q7734 = false;
                                                break Q7735;
                                              }
                                            }
                                          }
                                        }
                                        _c7814 = _q7734;
                                      }
                                      if ((_c7814 && (_h6075 || !(throughWhere(sp, v_s, (_te7815: number): boolean => {  return ((_te7815 === _wc7204 ? _wd7205 : (_te7815 === _wc7202 ? _wd7203 : (b.grid[_te7815] || -1))) === 1); }).includes(v_z))))) {
                                        _q7690 = true;
                                        break Q7691;
                                      }
                                    }
                                  }
                                  _c7816 = _q7690;
                                }
                                if (_c7816) {
                                  _q7546 = true;
                                  break Q7547;
                                }
                              }
                            }
                            _c7817 = !(_q7546);
                          }
                          if (_c7817) {
                            _q7524 = true;
                            break Q7525;
                          }
                        }
                      }
                      _c7818 = _q7524;
                    }
                    if (_c7818) {
                      _q7206 = true;
                      break Q7207;
                    }
                  }
                }
                _c7819 = _q7206;
              }
              _c7820 = _c7819;
            }
            if (!(_c7820)) continue;
            const _t7822 = minus(v_U, setOf(_h7821, v_i, v_j));
            const _t7823 = (_t7822.length > 0 ? _t7822[0] : -1);
            const _t7824 = _t7823;
            if (_g6678.length < 16) { if (!_g6678.includes(_t7824)) _g6678.push(_t7824); } else addOnce(_g6678, _st7194, _t7824);
          }
        }
      }
      const v_B = _g6678;
      const _h7859 = v_B.length;
      const _h7860 = (_h7859 === 3);
      _g7825.length = 0;
      G7826: {
        const _a7836 = v_U;
        for (let _i7837 = 0; _i7837 < _a7836.length; _i7837++) {
          const v_y = _a7836[_i7837];
          let _c7846: boolean = ((_i7837 === 0) && _h7839);
          if (!_c7846) {
            let _c7845: boolean = (_i7837 > 0);
            if (_c7845) {
              let _c7844: boolean = !(v_A.includes(v_y));
              if (!_c7844) {
                let _q7840 = false;
                Q7841: {
                  const _a7842 = v_U;
                  for (let _i7843 = 0; _i7843 < _a7842.length; _i7843++) {
                    const v_m = _a7842[_i7843];
                    if (!(((_i7843 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q7840 = true;
                      break Q7841;
                    }
                  }
                }
                _c7844 = _q7840;
              }
              _c7845 = _c7844;
            }
            _c7846 = _c7845;
          }
          if (!(_c7846)) continue;
          _g7825.push(v_y);
        }
      }
      const v_N = _g7825;
      const _h7868 = v_N.length;
      _g7847.length = 0;
      G7848: {
        const _a7857 = v_N;
        for (let _i7858 = 0; _i7858 < _a7857.length; _i7858++) {
          const v_y = _a7857[_i7858];
          let _c7866: boolean = ((v_U.indexOf(v_y) === 0) && _h7860);
          if (!_c7866) {
            let _c7865: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c7865) {
              let _q7861 = true;
              Q7862: {
                const _a7863 = v_U;
                for (let _i7864 = 0; _i7864 < _a7863.length; _i7864++) {
                  const v_m = _a7863[_i7864];
                  if (!(((_i7864 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q7861 = false;
                    break Q7862;
                  }
                }
              }
              _c7865 = _q7861;
            }
            _c7866 = _c7865;
          }
          if (!(_c7866)) continue;
          _g7847.push(v_y);
        }
      }
      const v_P = _g7847;
      const _h7869 = v_P.length;
      L7867: {
        const v_X = minus(v_U, v_N);
        const _h7870 = v_X.length;
        if (!((((_h7868 === 0) || (_h7869 > 0)) || (_h7870 > 0)))) break L7867;
        if (import.meta.env.DEV && staleChecking) {
          let _g7871 = 0;
          G7872: {
            const _a7873 = sp.adj4[v_c];
            for (let _i7874 = 0; _i7874 < _a7873.length; _i7874++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i7874]] || -1) === 1))) continue;
              _g7871++;
            }
          }
          const _g7875: number[] = [];
          G7876: {
            const _a8390 = v_U;
            for (let _i8391 = 0; _i8391 < _a8390.length; _i8391++) {
              const v_i = _a8390[_i8391];
              const _a8392 = v_U;
              for (let _i8393 = 0; _i8393 < _a8392.length; _i8393++) {
                const v_j = _a8392[_i8393];
                let _c8902: boolean = ((_i8391 === 0) && (_i8393 > 0));
                if (_c8902) {
                  let _c8901: boolean = ((throughWhere(sp, v_i, (_te8394: number): boolean => {  return ((b.grid[_te8394] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
                  if (!_c8901) {
                    const _wc8395 = sp.edgeOf(v_c, v_i);
                    const _wd8396 = 1;
                    const _wc8397 = sp.edgeOf(v_c, v_j);
                    const _wd8398 = 1;
                    let _q8399 = false;
                    Q8400: {
                      const _a8402 = throughWhere(sp, v_c, (_te8401: number): boolean => {  return ((_te8401 === _wc8397 ? _wd8398 : (_te8401 === _wc8395 ? _wd8396 : (b.grid[_te8401] || -1))) === 1); });
                      for (let _i8403 = 0; _i8403 < _a8402.length; _i8403++) {
                        const v_t = _a8402[_i8403];
                        let _c8419: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                        if (!_c8419) {
                          let _g8404 = 0;
                          G8405: {
                            const _a8406 = sp.adj4[v_t];
                            for (let _i8407 = 0; _i8407 < _a8406.length; _i8407++) {
                              const _t8408 = sp.adj4Edges[v_t][_i8407];
                              if (!(((_t8408 === _wc8397 ? _wd8398 : (_t8408 === _wc8395 ? _wd8396 : (b.grid[_t8408] || -1))) === 1))) continue;
                              _g8404++;
                            }
                          }
                          let _g8409 = 0;
                          G8410: {
                            for (let _i8411 = 0; _i8411 < 1; _i8411++) {
                              const v_k = v_t;
                              let _c8418: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c8418) {
                                let _c8417: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c8417) {
                                  let _g8412 = 0;
                                  G8413: {
                                    const _t8414 = (clueAt(cl.number, v_k) + 1);
                                    const _a8415 = cluesValued(cl.number, _t8414);
                                    for (let _i8416 = 0; _i8416 < _a8415.length; _i8416++) {
                                      const v_x = _a8415[_i8416];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g8412++;
                                    }
                                  }
                                  _c8417 = (_g8412 === 0);
                                }
                                _c8418 = _c8417;
                              }
                              if (!(_c8418)) continue;
                              _g8409++;
                            }
                          }
                          _c8419 = (_g8404 < (2 - _g8409));
                        }
                        if (!(_c8419)) continue;
                        let _g8420 = 0;
                        G8421: {
                          const _a8422 = sp.adj4[v_t];
                          for (let _i8423 = 0; _i8423 < _a8422.length; _i8423++) {
                            const _t8424 = sp.adj4Edges[v_t][_i8423];
                            if (!(((_t8424 === _wc8397 ? _wd8398 : (_t8424 === _wc8395 ? _wd8396 : (b.grid[_t8424] || -1))) === 1))) continue;
                            _g8420++;
                          }
                        }
                        let _g8425 = 0;
                        G8426: {
                          for (let _i8427 = 0; _i8427 < 1; _i8427++) {
                            const v_k = v_t;
                            let _c8434: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c8434) {
                              let _c8433: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c8433) {
                                let _g8428 = 0;
                                G8429: {
                                  const _t8430 = (clueAt(cl.number, v_k) + 1);
                                  const _a8431 = cluesValued(cl.number, _t8430);
                                  for (let _i8432 = 0; _i8432 < _a8431.length; _i8432++) {
                                    const v_x = _a8431[_i8432];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g8428++;
                                  }
                                }
                                _c8433 = (_g8428 === 0);
                              }
                              _c8434 = _c8433;
                            }
                            if (!(_c8434)) continue;
                            _g8425++;
                          }
                        }
                        let _c8659: boolean = (_g8420 < (2 - _g8425));
                        if (_c8659) {
                          let _q8435 = false;
                          Q8436: {
                            const _a8437 = sp.adj4[v_t];
                            for (let _i8438 = 0; _i8438 < _a8437.length; _i8438++) {
                              const v_y = _a8437[_i8438];
                              const _t8439 = sp.adj4Edges[v_t][_i8438];
                              let _c8455: boolean = !((_t8439 === _wc8397 ? true : (_t8439 === _wc8395 ? true : (b.grid[_t8439] !== 0))));
                              if (_c8455) {
                                let _g8440 = 0;
                                G8441: {
                                  const _a8442 = sp.adj4[v_t];
                                  for (let _i8443 = 0; _i8443 < _a8442.length; _i8443++) {
                                    const _t8444 = sp.adj4Edges[v_t][_i8443];
                                    if (!(((_t8444 === _wc8397 ? _wd8398 : (_t8444 === _wc8395 ? _wd8396 : (b.grid[_t8444] || -1))) === 1))) continue;
                                    _g8440++;
                                  }
                                }
                                let _g8445 = 0;
                                G8446: {
                                  for (let _i8447 = 0; _i8447 < 1; _i8447++) {
                                    const v_k = v_t;
                                    let _c8454: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c8454) {
                                      let _c8453: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c8453) {
                                        let _g8448 = 0;
                                        G8449: {
                                          const _t8450 = (clueAt(cl.number, v_k) + 1);
                                          const _a8451 = cluesValued(cl.number, _t8450);
                                          for (let _i8452 = 0; _i8452 < _a8451.length; _i8452++) {
                                            const v_x = _a8451[_i8452];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g8448++;
                                          }
                                        }
                                        _c8453 = (_g8448 === 0);
                                      }
                                      _c8454 = _c8453;
                                    }
                                    if (!(_c8454)) continue;
                                    _g8445++;
                                  }
                                }
                                _c8455 = (_g8440 < (2 - _g8445));
                              }
                              let _c8472: boolean = _c8455;
                              if (_c8472) {
                                let _g8456 = 0;
                                G8457: {
                                  const _a8459 = sp.adj4[v_y];
                                  for (let _i8460 = 0; _i8460 < _a8459.length; _i8460++) {
                                    const _t8461 = sp.adj4Edges[v_y][_i8460];
                                    if (!(((_t8461 === _wc8397 ? _wd8398 : (_t8461 === _wc8395 ? _wd8396 : (b.grid[_t8461] || -1))) === 1))) continue;
                                    _g8456++;
                                  }
                                }
                                let _g8462 = 0;
                                G8463: {
                                  for (let _i8464 = 0; _i8464 < 1; _i8464++) {
                                    const v_k = v_y;
                                    let _c8471: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c8471) {
                                      let _c8470: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c8470) {
                                        let _g8465 = 0;
                                        G8466: {
                                          const _t8467 = (clueAt(cl.number, v_k) + 1);
                                          const _a8468 = cluesValued(cl.number, _t8467);
                                          for (let _i8469 = 0; _i8469 < _a8468.length; _i8469++) {
                                            const v_x = _a8468[_i8469];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g8465++;
                                          }
                                        }
                                        _c8470 = (_g8465 === 0);
                                      }
                                      _c8471 = _c8470;
                                    }
                                    if (!(_c8471)) continue;
                                    _g8462++;
                                  }
                                }
                                _c8472 = (_g8456 < (2 - _g8462));
                              }
                              let _c8537: boolean = _c8472;
                              if (_c8537) {
                                let _q8473 = true;
                                Q8474: {
                                  const _g8475: number[] = [];
                                  G8476: {
                                    for (let _i8478 = 0; _i8478 < 1; _i8478++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g8475.push(v_x);
                                    }
                                  }
                                  const _g8479: number[] = [];
                                  G8480: {
                                    const _a8499 = throughWhere(sp, v_t, (_te8494: number): boolean => { let _c8496: boolean = ((_te8494 === _wc8397 ? _wd8398 : (_te8494 === _wc8395 ? _wd8396 : (b.grid[_te8494] || -1))) === 1); if (_c8496) {   const _t8495 = sp.edgeEnds[2 * _te8494];   _c8496 = !((clueAt(cl.number, _t8495) !== -1)); } let _c8498: boolean = _c8496; if (_c8498) {   const _t8497 = sp.edgeEnds[2 * _te8494 + 1];   _c8498 = !((clueAt(cl.number, _t8497) !== -1)); } return _c8498; });
                                    for (let _i8500 = 0; _i8500 < _a8499.length; _i8500++) {
                                      const v_t_8493 = _a8499[_i8500];
                                      const _a8501 = sp.adj4[v_t_8493];
                                      for (let _i8502 = 0; _i8502 < _a8501.length; _i8502++) {
                                        const v_x = _a8501[_i8502];
                                        let _c8504: boolean = (!((clueAt(cl.number, v_t_8493) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c8504) {
                                          const _t8503 = sp.adj4Edges[v_t_8493][_i8502];
                                          _c8504 = ((_t8503 === _wc8397 ? _wd8398 : (_t8503 === _wc8395 ? _wd8396 : (b.grid[_t8503] || -1))) === 1);
                                        }
                                        if (!(_c8504)) continue;
                                        if (!_g8479.includes(v_x)) _g8479.push(v_x);
                                      }
                                    }
                                  }
                                  const _a8505 = union(_g8475, _g8479);
                                  for (let _i8506 = 0; _i8506 < _a8505.length; _i8506++) {
                                    const v_p = _a8505[_i8506];
                                    const _g8507: number[] = [];
                                    G8508: {
                                      for (let _i8510 = 0; _i8510 < 1; _i8510++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g8507.push(v_x);
                                      }
                                    }
                                    const _g8511: number[] = [];
                                    G8512: {
                                      const _a8529 = throughWhere(sp, v_y, (_te8524: number): boolean => { let _c8526: boolean = ((_te8524 === _wc8397 ? _wd8398 : (_te8524 === _wc8395 ? _wd8396 : (b.grid[_te8524] || -1))) === 1); if (_c8526) {   const _t8525 = sp.edgeEnds[2 * _te8524];   _c8526 = !((clueAt(cl.number, _t8525) !== -1)); } let _c8528: boolean = _c8526; if (_c8528) {   const _t8527 = sp.edgeEnds[2 * _te8524 + 1];   _c8528 = !((clueAt(cl.number, _t8527) !== -1)); } return _c8528; });
                                      for (let _i8530 = 0; _i8530 < _a8529.length; _i8530++) {
                                        const v_t = _a8529[_i8530];
                                        const _a8531 = sp.adj4[v_t];
                                        for (let _i8532 = 0; _i8532 < _a8531.length; _i8532++) {
                                          const v_x = _a8531[_i8532];
                                          let _c8534: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c8534) {
                                            const _t8533 = sp.adj4Edges[v_t][_i8532];
                                            _c8534 = ((_t8533 === _wc8397 ? _wd8398 : (_t8533 === _wc8395 ? _wd8396 : (b.grid[_t8533] || -1))) === 1);
                                          }
                                          if (!(_c8534)) continue;
                                          if (!_g8511.includes(v_x)) _g8511.push(v_x);
                                        }
                                      }
                                    }
                                    const _a8535 = union(_g8507, _g8511);
                                    for (let _i8536 = 0; _i8536 < _a8535.length; _i8536++) {
                                      const v_q = _a8535[_i8536];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q8473 = false;
                                        break Q8474;
                                      }
                                    }
                                  }
                                }
                                _c8537 = _q8473;
                              }
                              if (!((_c8537 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te8538: number): boolean => {  return ((_te8538 === _wc8397 ? _wd8398 : (_te8538 === _wc8395 ? _wd8396 : (b.grid[_te8538] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g8539 = 0;
                              G8540: {
                                const _a8541 = sp.adj4[v_t];
                                for (let _i8542 = 0; _i8542 < _a8541.length; _i8542++) {
                                  const _t8543 = sp.adj4Edges[v_t][_i8542];
                                  if (!(((_t8543 === _wc8397 ? _wd8398 : (_t8543 === _wc8395 ? _wd8396 : (b.grid[_t8543] || -1))) === 1))) continue;
                                  _g8539++;
                                }
                              }
                              let _g8544 = 0;
                              G8545: {
                                for (let _i8546 = 0; _i8546 < 1; _i8546++) {
                                  const v_k = v_t;
                                  let _c8553: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c8553) {
                                    let _c8552: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c8552) {
                                      let _g8547 = 0;
                                      G8548: {
                                        const _t8549 = (clueAt(cl.number, v_k) + 1);
                                        const _a8550 = cluesValued(cl.number, _t8549);
                                        for (let _i8551 = 0; _i8551 < _a8550.length; _i8551++) {
                                          const v_x = _a8550[_i8551];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g8547++;
                                        }
                                      }
                                      _c8552 = (_g8547 === 0);
                                    }
                                    _c8553 = _c8552;
                                  }
                                  if (!(_c8553)) continue;
                                  _g8544++;
                                }
                              }
                              let _c8658: boolean = ((_g8539 + 1) === (2 - _g8544));
                              if (!_c8658) {
                                let _q8554 = false;
                                Q8555: {
                                  const _a8556 = sp.adj4[v_t];
                                  const _n8557 = _i8438;
                                  for (let _i8558 = 0; _i8558 < _n8557; _i8558++) {
                                    const v_z = _a8556[_i8558];
                                    const _t8559 = sp.adj4Edges[v_t][_i8558];
                                    let _c8575: boolean = !((_t8559 === _wc8397 ? true : (_t8559 === _wc8395 ? true : (b.grid[_t8559] !== 0))));
                                    if (_c8575) {
                                      let _g8560 = 0;
                                      G8561: {
                                        const _a8562 = sp.adj4[v_t];
                                        for (let _i8563 = 0; _i8563 < _a8562.length; _i8563++) {
                                          const _t8564 = sp.adj4Edges[v_t][_i8563];
                                          if (!(((_t8564 === _wc8397 ? _wd8398 : (_t8564 === _wc8395 ? _wd8396 : (b.grid[_t8564] || -1))) === 1))) continue;
                                          _g8560++;
                                        }
                                      }
                                      let _g8565 = 0;
                                      G8566: {
                                        for (let _i8567 = 0; _i8567 < 1; _i8567++) {
                                          const v_k = v_t;
                                          let _c8574: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c8574) {
                                            let _c8573: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c8573) {
                                              let _g8568 = 0;
                                              G8569: {
                                                const _t8570 = (clueAt(cl.number, v_k) + 1);
                                                const _a8571 = cluesValued(cl.number, _t8570);
                                                for (let _i8572 = 0; _i8572 < _a8571.length; _i8572++) {
                                                  const v_x = _a8571[_i8572];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g8568++;
                                                }
                                              }
                                              _c8573 = (_g8568 === 0);
                                            }
                                            _c8574 = _c8573;
                                          }
                                          if (!(_c8574)) continue;
                                          _g8565++;
                                        }
                                      }
                                      _c8575 = (_g8560 < (2 - _g8565));
                                    }
                                    let _c8591: boolean = _c8575;
                                    if (_c8591) {
                                      let _g8576 = 0;
                                      G8577: {
                                        const _a8578 = sp.adj4[v_z];
                                        for (let _i8579 = 0; _i8579 < _a8578.length; _i8579++) {
                                          const _t8580 = sp.adj4Edges[v_z][_i8579];
                                          if (!(((_t8580 === _wc8397 ? _wd8398 : (_t8580 === _wc8395 ? _wd8396 : (b.grid[_t8580] || -1))) === 1))) continue;
                                          _g8576++;
                                        }
                                      }
                                      let _g8581 = 0;
                                      G8582: {
                                        for (let _i8583 = 0; _i8583 < 1; _i8583++) {
                                          const v_k = v_z;
                                          let _c8590: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c8590) {
                                            let _c8589: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c8589) {
                                              let _g8584 = 0;
                                              G8585: {
                                                const _t8586 = (clueAt(cl.number, v_k) + 1);
                                                const _a8587 = cluesValued(cl.number, _t8586);
                                                for (let _i8588 = 0; _i8588 < _a8587.length; _i8588++) {
                                                  const v_x = _a8587[_i8588];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g8584++;
                                                }
                                              }
                                              _c8589 = (_g8584 === 0);
                                            }
                                            _c8590 = _c8589;
                                          }
                                          if (!(_c8590)) continue;
                                          _g8581++;
                                        }
                                      }
                                      _c8591 = (_g8576 < (2 - _g8581));
                                    }
                                    let _c8656: boolean = _c8591;
                                    if (_c8656) {
                                      let _q8592 = true;
                                      Q8593: {
                                        const _g8594: number[] = [];
                                        G8595: {
                                          for (let _i8597 = 0; _i8597 < 1; _i8597++) {
                                            const v_x = v_t;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g8594.push(v_x);
                                          }
                                        }
                                        const _g8598: number[] = [];
                                        G8599: {
                                          const _a8618 = throughWhere(sp, v_t, (_te8613: number): boolean => { let _c8615: boolean = ((_te8613 === _wc8397 ? _wd8398 : (_te8613 === _wc8395 ? _wd8396 : (b.grid[_te8613] || -1))) === 1); if (_c8615) {   const _t8614 = sp.edgeEnds[2 * _te8613];   _c8615 = !((clueAt(cl.number, _t8614) !== -1)); } let _c8617: boolean = _c8615; if (_c8617) {   const _t8616 = sp.edgeEnds[2 * _te8613 + 1];   _c8617 = !((clueAt(cl.number, _t8616) !== -1)); } return _c8617; });
                                          for (let _i8619 = 0; _i8619 < _a8618.length; _i8619++) {
                                            const v_t_8612 = _a8618[_i8619];
                                            const _a8620 = sp.adj4[v_t_8612];
                                            for (let _i8621 = 0; _i8621 < _a8620.length; _i8621++) {
                                              const v_x = _a8620[_i8621];
                                              let _c8623: boolean = (!((clueAt(cl.number, v_t_8612) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c8623) {
                                                const _t8622 = sp.adj4Edges[v_t_8612][_i8621];
                                                _c8623 = ((_t8622 === _wc8397 ? _wd8398 : (_t8622 === _wc8395 ? _wd8396 : (b.grid[_t8622] || -1))) === 1);
                                              }
                                              if (!(_c8623)) continue;
                                              if (!_g8598.includes(v_x)) _g8598.push(v_x);
                                            }
                                          }
                                        }
                                        const _a8624 = union(_g8594, _g8598);
                                        for (let _i8625 = 0; _i8625 < _a8624.length; _i8625++) {
                                          const v_p = _a8624[_i8625];
                                          const _g8626: number[] = [];
                                          G8627: {
                                            for (let _i8629 = 0; _i8629 < 1; _i8629++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g8626.push(v_x);
                                            }
                                          }
                                          const _g8630: number[] = [];
                                          G8631: {
                                            const _a8648 = throughWhere(sp, v_z, (_te8643: number): boolean => { let _c8645: boolean = ((_te8643 === _wc8397 ? _wd8398 : (_te8643 === _wc8395 ? _wd8396 : (b.grid[_te8643] || -1))) === 1); if (_c8645) {   const _t8644 = sp.edgeEnds[2 * _te8643];   _c8645 = !((clueAt(cl.number, _t8644) !== -1)); } let _c8647: boolean = _c8645; if (_c8647) {   const _t8646 = sp.edgeEnds[2 * _te8643 + 1];   _c8647 = !((clueAt(cl.number, _t8646) !== -1)); } return _c8647; });
                                            for (let _i8649 = 0; _i8649 < _a8648.length; _i8649++) {
                                              const v_t = _a8648[_i8649];
                                              const _a8650 = sp.adj4[v_t];
                                              for (let _i8651 = 0; _i8651 < _a8650.length; _i8651++) {
                                                const v_x = _a8650[_i8651];
                                                let _c8653: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c8653) {
                                                  const _t8652 = sp.adj4Edges[v_t][_i8651];
                                                  _c8653 = ((_t8652 === _wc8397 ? _wd8398 : (_t8652 === _wc8395 ? _wd8396 : (b.grid[_t8652] || -1))) === 1);
                                                }
                                                if (!(_c8653)) continue;
                                                if (!_g8630.includes(v_x)) _g8630.push(v_x);
                                              }
                                            }
                                          }
                                          const _a8654 = union(_g8626, _g8630);
                                          for (let _i8655 = 0; _i8655 < _a8654.length; _i8655++) {
                                            const v_q = _a8654[_i8655];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q8592 = false;
                                              break Q8593;
                                            }
                                          }
                                        }
                                      }
                                      _c8656 = _q8592;
                                    }
                                    if ((_c8656 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te8657: number): boolean => {  return ((_te8657 === _wc8397 ? _wd8398 : (_te8657 === _wc8395 ? _wd8396 : (b.grid[_te8657] || -1))) === 1); }).includes(v_z))))) {
                                      _q8554 = true;
                                      break Q8555;
                                    }
                                  }
                                }
                                _c8658 = _q8554;
                              }
                              if (_c8658) {
                                _q8435 = true;
                                break Q8436;
                              }
                            }
                          }
                          _c8659 = !(_q8435);
                        }
                        let _c8900: boolean = _c8659;
                        if (!_c8900) {
                          let _q8660 = false;
                          Q8661: {
                            const _a8662 = sp.adj4[v_t];
                            for (let _i8663 = 0; _i8663 < _a8662.length; _i8663++) {
                              const v_s = _a8662[_i8663];
                              let _g8664 = 0;
                              G8665: {
                                const _a8666 = sp.adj4[v_s];
                                for (let _i8667 = 0; _i8667 < _a8666.length; _i8667++) {
                                  const _t8668 = sp.adj4Edges[v_s][_i8667];
                                  if (!(((_t8668 === _wc8397 ? _wd8398 : (_t8668 === _wc8395 ? _wd8396 : (b.grid[_t8668] || -1))) === 1))) continue;
                                  _g8664++;
                                }
                              }
                              let _g8669 = 0;
                              G8670: {
                                for (let _i8671 = 0; _i8671 < 1; _i8671++) {
                                  const v_k = v_s;
                                  let _c8678: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c8678) {
                                    let _c8677: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c8677) {
                                      let _g8672 = 0;
                                      G8673: {
                                        const _t8674 = (clueAt(cl.number, v_k) + 1);
                                        const _a8675 = cluesValued(cl.number, _t8674);
                                        for (let _i8676 = 0; _i8676 < _a8675.length; _i8676++) {
                                          const v_x = _a8675[_i8676];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g8672++;
                                        }
                                      }
                                      _c8677 = (_g8672 === 0);
                                    }
                                    _c8678 = _c8677;
                                  }
                                  if (!(_c8678)) continue;
                                  _g8669++;
                                }
                              }
                              let _c8899: boolean = (_g8664 < (2 - _g8669));
                              if (_c8899) {
                                let _q8679 = false;
                                Q8680: {
                                  const _a8681 = sp.adj4[v_s];
                                  for (let _i8682 = 0; _i8682 < _a8681.length; _i8682++) {
                                    const v_y = _a8681[_i8682];
                                    const _t8683 = sp.adj4Edges[v_s][_i8682];
                                    let _c8699: boolean = !((_t8683 === _wc8397 ? true : (_t8683 === _wc8395 ? true : (b.grid[_t8683] !== 0))));
                                    if (_c8699) {
                                      let _g8684 = 0;
                                      G8685: {
                                        const _a8686 = sp.adj4[v_s];
                                        for (let _i8687 = 0; _i8687 < _a8686.length; _i8687++) {
                                          const _t8688 = sp.adj4Edges[v_s][_i8687];
                                          if (!(((_t8688 === _wc8397 ? _wd8398 : (_t8688 === _wc8395 ? _wd8396 : (b.grid[_t8688] || -1))) === 1))) continue;
                                          _g8684++;
                                        }
                                      }
                                      let _g8689 = 0;
                                      G8690: {
                                        for (let _i8691 = 0; _i8691 < 1; _i8691++) {
                                          const v_k = v_s;
                                          let _c8698: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c8698) {
                                            let _c8697: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c8697) {
                                              let _g8692 = 0;
                                              G8693: {
                                                const _t8694 = (clueAt(cl.number, v_k) + 1);
                                                const _a8695 = cluesValued(cl.number, _t8694);
                                                for (let _i8696 = 0; _i8696 < _a8695.length; _i8696++) {
                                                  const v_x = _a8695[_i8696];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g8692++;
                                                }
                                              }
                                              _c8697 = (_g8692 === 0);
                                            }
                                            _c8698 = _c8697;
                                          }
                                          if (!(_c8698)) continue;
                                          _g8689++;
                                        }
                                      }
                                      _c8699 = (_g8684 < (2 - _g8689));
                                    }
                                    let _c8716: boolean = _c8699;
                                    if (_c8716) {
                                      let _g8700 = 0;
                                      G8701: {
                                        const _a8703 = sp.adj4[v_y];
                                        for (let _i8704 = 0; _i8704 < _a8703.length; _i8704++) {
                                          const _t8705 = sp.adj4Edges[v_y][_i8704];
                                          if (!(((_t8705 === _wc8397 ? _wd8398 : (_t8705 === _wc8395 ? _wd8396 : (b.grid[_t8705] || -1))) === 1))) continue;
                                          _g8700++;
                                        }
                                      }
                                      let _g8706 = 0;
                                      G8707: {
                                        for (let _i8708 = 0; _i8708 < 1; _i8708++) {
                                          const v_k = v_y;
                                          let _c8715: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c8715) {
                                            let _c8714: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c8714) {
                                              let _g8709 = 0;
                                              G8710: {
                                                const _t8711 = (clueAt(cl.number, v_k) + 1);
                                                const _a8712 = cluesValued(cl.number, _t8711);
                                                for (let _i8713 = 0; _i8713 < _a8712.length; _i8713++) {
                                                  const v_x = _a8712[_i8713];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g8709++;
                                                }
                                              }
                                              _c8714 = (_g8709 === 0);
                                            }
                                            _c8715 = _c8714;
                                          }
                                          if (!(_c8715)) continue;
                                          _g8706++;
                                        }
                                      }
                                      _c8716 = (_g8700 < (2 - _g8706));
                                    }
                                    let _c8779: boolean = _c8716;
                                    if (_c8779) {
                                      let _q8717 = true;
                                      Q8718: {
                                        const _g8719: number[] = [];
                                        G8720: {
                                          for (let _i8722 = 0; _i8722 < 1; _i8722++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g8719.push(v_x);
                                          }
                                        }
                                        const _g8723: number[] = [];
                                        G8724: {
                                          const _a8741 = throughWhere(sp, v_s, (_te8736: number): boolean => { let _c8738: boolean = ((_te8736 === _wc8397 ? _wd8398 : (_te8736 === _wc8395 ? _wd8396 : (b.grid[_te8736] || -1))) === 1); if (_c8738) {   const _t8737 = sp.edgeEnds[2 * _te8736];   _c8738 = !((clueAt(cl.number, _t8737) !== -1)); } let _c8740: boolean = _c8738; if (_c8740) {   const _t8739 = sp.edgeEnds[2 * _te8736 + 1];   _c8740 = !((clueAt(cl.number, _t8739) !== -1)); } return _c8740; });
                                          for (let _i8742 = 0; _i8742 < _a8741.length; _i8742++) {
                                            const v_t = _a8741[_i8742];
                                            const _a8743 = sp.adj4[v_t];
                                            for (let _i8744 = 0; _i8744 < _a8743.length; _i8744++) {
                                              const v_x = _a8743[_i8744];
                                              let _c8746: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c8746) {
                                                const _t8745 = sp.adj4Edges[v_t][_i8744];
                                                _c8746 = ((_t8745 === _wc8397 ? _wd8398 : (_t8745 === _wc8395 ? _wd8396 : (b.grid[_t8745] || -1))) === 1);
                                              }
                                              if (!(_c8746)) continue;
                                              if (!_g8723.includes(v_x)) _g8723.push(v_x);
                                            }
                                          }
                                        }
                                        const _a8747 = union(_g8719, _g8723);
                                        for (let _i8748 = 0; _i8748 < _a8747.length; _i8748++) {
                                          const v_p = _a8747[_i8748];
                                          const _g8749: number[] = [];
                                          G8750: {
                                            for (let _i8752 = 0; _i8752 < 1; _i8752++) {
                                              const v_x = v_y;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g8749.push(v_x);
                                            }
                                          }
                                          const _g8753: number[] = [];
                                          G8754: {
                                            const _a8771 = throughWhere(sp, v_y, (_te8766: number): boolean => { let _c8768: boolean = ((_te8766 === _wc8397 ? _wd8398 : (_te8766 === _wc8395 ? _wd8396 : (b.grid[_te8766] || -1))) === 1); if (_c8768) {   const _t8767 = sp.edgeEnds[2 * _te8766];   _c8768 = !((clueAt(cl.number, _t8767) !== -1)); } let _c8770: boolean = _c8768; if (_c8770) {   const _t8769 = sp.edgeEnds[2 * _te8766 + 1];   _c8770 = !((clueAt(cl.number, _t8769) !== -1)); } return _c8770; });
                                            for (let _i8772 = 0; _i8772 < _a8771.length; _i8772++) {
                                              const v_t = _a8771[_i8772];
                                              const _a8773 = sp.adj4[v_t];
                                              for (let _i8774 = 0; _i8774 < _a8773.length; _i8774++) {
                                                const v_x = _a8773[_i8774];
                                                let _c8776: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c8776) {
                                                  const _t8775 = sp.adj4Edges[v_t][_i8774];
                                                  _c8776 = ((_t8775 === _wc8397 ? _wd8398 : (_t8775 === _wc8395 ? _wd8396 : (b.grid[_t8775] || -1))) === 1);
                                                }
                                                if (!(_c8776)) continue;
                                                if (!_g8753.includes(v_x)) _g8753.push(v_x);
                                              }
                                            }
                                          }
                                          const _a8777 = union(_g8749, _g8753);
                                          for (let _i8778 = 0; _i8778 < _a8777.length; _i8778++) {
                                            const v_q = _a8777[_i8778];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q8717 = false;
                                              break Q8718;
                                            }
                                          }
                                        }
                                      }
                                      _c8779 = _q8717;
                                    }
                                    if (!((_c8779 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te8780: number): boolean => {  return ((_te8780 === _wc8397 ? _wd8398 : (_te8780 === _wc8395 ? _wd8396 : (b.grid[_te8780] || -1))) === 1); }).includes(v_y)))))) continue;
                                    let _g8781 = 0;
                                    G8782: {
                                      const _a8783 = sp.adj4[v_s];
                                      for (let _i8784 = 0; _i8784 < _a8783.length; _i8784++) {
                                        const _t8785 = sp.adj4Edges[v_s][_i8784];
                                        if (!(((_t8785 === _wc8397 ? _wd8398 : (_t8785 === _wc8395 ? _wd8396 : (b.grid[_t8785] || -1))) === 1))) continue;
                                        _g8781++;
                                      }
                                    }
                                    let _g8786 = 0;
                                    G8787: {
                                      for (let _i8788 = 0; _i8788 < 1; _i8788++) {
                                        const v_k = v_s;
                                        let _c8795: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c8795) {
                                          let _c8794: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c8794) {
                                            let _g8789 = 0;
                                            G8790: {
                                              const _t8791 = (clueAt(cl.number, v_k) + 1);
                                              const _a8792 = cluesValued(cl.number, _t8791);
                                              for (let _i8793 = 0; _i8793 < _a8792.length; _i8793++) {
                                                const v_x = _a8792[_i8793];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g8789++;
                                              }
                                            }
                                            _c8794 = (_g8789 === 0);
                                          }
                                          _c8795 = _c8794;
                                        }
                                        if (!(_c8795)) continue;
                                        _g8786++;
                                      }
                                    }
                                    let _c8898: boolean = ((_g8781 + 1) === (2 - _g8786));
                                    if (!_c8898) {
                                      let _q8796 = false;
                                      Q8797: {
                                        const _a8798 = sp.adj4[v_s];
                                        const _n8799 = _i8682;
                                        for (let _i8800 = 0; _i8800 < _n8799; _i8800++) {
                                          const v_z = _a8798[_i8800];
                                          const _t8801 = sp.adj4Edges[v_s][_i8800];
                                          let _c8817: boolean = !((_t8801 === _wc8397 ? true : (_t8801 === _wc8395 ? true : (b.grid[_t8801] !== 0))));
                                          if (_c8817) {
                                            let _g8802 = 0;
                                            G8803: {
                                              const _a8804 = sp.adj4[v_s];
                                              for (let _i8805 = 0; _i8805 < _a8804.length; _i8805++) {
                                                const _t8806 = sp.adj4Edges[v_s][_i8805];
                                                if (!(((_t8806 === _wc8397 ? _wd8398 : (_t8806 === _wc8395 ? _wd8396 : (b.grid[_t8806] || -1))) === 1))) continue;
                                                _g8802++;
                                              }
                                            }
                                            let _g8807 = 0;
                                            G8808: {
                                              for (let _i8809 = 0; _i8809 < 1; _i8809++) {
                                                const v_k = v_s;
                                                let _c8816: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c8816) {
                                                  let _c8815: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c8815) {
                                                    let _g8810 = 0;
                                                    G8811: {
                                                      const _t8812 = (clueAt(cl.number, v_k) + 1);
                                                      const _a8813 = cluesValued(cl.number, _t8812);
                                                      for (let _i8814 = 0; _i8814 < _a8813.length; _i8814++) {
                                                        const v_x = _a8813[_i8814];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g8810++;
                                                      }
                                                    }
                                                    _c8815 = (_g8810 === 0);
                                                  }
                                                  _c8816 = _c8815;
                                                }
                                                if (!(_c8816)) continue;
                                                _g8807++;
                                              }
                                            }
                                            _c8817 = (_g8802 < (2 - _g8807));
                                          }
                                          let _c8833: boolean = _c8817;
                                          if (_c8833) {
                                            let _g8818 = 0;
                                            G8819: {
                                              const _a8820 = sp.adj4[v_z];
                                              for (let _i8821 = 0; _i8821 < _a8820.length; _i8821++) {
                                                const _t8822 = sp.adj4Edges[v_z][_i8821];
                                                if (!(((_t8822 === _wc8397 ? _wd8398 : (_t8822 === _wc8395 ? _wd8396 : (b.grid[_t8822] || -1))) === 1))) continue;
                                                _g8818++;
                                              }
                                            }
                                            let _g8823 = 0;
                                            G8824: {
                                              for (let _i8825 = 0; _i8825 < 1; _i8825++) {
                                                const v_k = v_z;
                                                let _c8832: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c8832) {
                                                  let _c8831: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c8831) {
                                                    let _g8826 = 0;
                                                    G8827: {
                                                      const _t8828 = (clueAt(cl.number, v_k) + 1);
                                                      const _a8829 = cluesValued(cl.number, _t8828);
                                                      for (let _i8830 = 0; _i8830 < _a8829.length; _i8830++) {
                                                        const v_x = _a8829[_i8830];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g8826++;
                                                      }
                                                    }
                                                    _c8831 = (_g8826 === 0);
                                                  }
                                                  _c8832 = _c8831;
                                                }
                                                if (!(_c8832)) continue;
                                                _g8823++;
                                              }
                                            }
                                            _c8833 = (_g8818 < (2 - _g8823));
                                          }
                                          let _c8896: boolean = _c8833;
                                          if (_c8896) {
                                            let _q8834 = true;
                                            Q8835: {
                                              const _g8836: number[] = [];
                                              G8837: {
                                                for (let _i8839 = 0; _i8839 < 1; _i8839++) {
                                                  const v_x = v_s;
                                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                  _g8836.push(v_x);
                                                }
                                              }
                                              const _g8840: number[] = [];
                                              G8841: {
                                                const _a8858 = throughWhere(sp, v_s, (_te8853: number): boolean => { let _c8855: boolean = ((_te8853 === _wc8397 ? _wd8398 : (_te8853 === _wc8395 ? _wd8396 : (b.grid[_te8853] || -1))) === 1); if (_c8855) {   const _t8854 = sp.edgeEnds[2 * _te8853];   _c8855 = !((clueAt(cl.number, _t8854) !== -1)); } let _c8857: boolean = _c8855; if (_c8857) {   const _t8856 = sp.edgeEnds[2 * _te8853 + 1];   _c8857 = !((clueAt(cl.number, _t8856) !== -1)); } return _c8857; });
                                                for (let _i8859 = 0; _i8859 < _a8858.length; _i8859++) {
                                                  const v_t = _a8858[_i8859];
                                                  const _a8860 = sp.adj4[v_t];
                                                  for (let _i8861 = 0; _i8861 < _a8860.length; _i8861++) {
                                                    const v_x = _a8860[_i8861];
                                                    let _c8863: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                    if (_c8863) {
                                                      const _t8862 = sp.adj4Edges[v_t][_i8861];
                                                      _c8863 = ((_t8862 === _wc8397 ? _wd8398 : (_t8862 === _wc8395 ? _wd8396 : (b.grid[_t8862] || -1))) === 1);
                                                    }
                                                    if (!(_c8863)) continue;
                                                    if (!_g8840.includes(v_x)) _g8840.push(v_x);
                                                  }
                                                }
                                              }
                                              const _a8864 = union(_g8836, _g8840);
                                              for (let _i8865 = 0; _i8865 < _a8864.length; _i8865++) {
                                                const v_p = _a8864[_i8865];
                                                const _g8866: number[] = [];
                                                G8867: {
                                                  for (let _i8869 = 0; _i8869 < 1; _i8869++) {
                                                    const v_x = v_z;
                                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                    _g8866.push(v_x);
                                                  }
                                                }
                                                const _g8870: number[] = [];
                                                G8871: {
                                                  const _a8888 = throughWhere(sp, v_z, (_te8883: number): boolean => { let _c8885: boolean = ((_te8883 === _wc8397 ? _wd8398 : (_te8883 === _wc8395 ? _wd8396 : (b.grid[_te8883] || -1))) === 1); if (_c8885) {   const _t8884 = sp.edgeEnds[2 * _te8883];   _c8885 = !((clueAt(cl.number, _t8884) !== -1)); } let _c8887: boolean = _c8885; if (_c8887) {   const _t8886 = sp.edgeEnds[2 * _te8883 + 1];   _c8887 = !((clueAt(cl.number, _t8886) !== -1)); } return _c8887; });
                                                  for (let _i8889 = 0; _i8889 < _a8888.length; _i8889++) {
                                                    const v_t = _a8888[_i8889];
                                                    const _a8890 = sp.adj4[v_t];
                                                    for (let _i8891 = 0; _i8891 < _a8890.length; _i8891++) {
                                                      const v_x = _a8890[_i8891];
                                                      let _c8893: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                      if (_c8893) {
                                                        const _t8892 = sp.adj4Edges[v_t][_i8891];
                                                        _c8893 = ((_t8892 === _wc8397 ? _wd8398 : (_t8892 === _wc8395 ? _wd8396 : (b.grid[_t8892] || -1))) === 1);
                                                      }
                                                      if (!(_c8893)) continue;
                                                      if (!_g8870.includes(v_x)) _g8870.push(v_x);
                                                    }
                                                  }
                                                }
                                                const _a8894 = union(_g8866, _g8870);
                                                for (let _i8895 = 0; _i8895 < _a8894.length; _i8895++) {
                                                  const v_q = _a8894[_i8895];
                                                  if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                                    _q8834 = false;
                                                    break Q8835;
                                                  }
                                                }
                                              }
                                            }
                                            _c8896 = _q8834;
                                          }
                                          if ((_c8896 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te8897: number): boolean => {  return ((_te8897 === _wc8397 ? _wd8398 : (_te8897 === _wc8395 ? _wd8396 : (b.grid[_te8897] || -1))) === 1); }).includes(v_z))))) {
                                            _q8796 = true;
                                            break Q8797;
                                          }
                                        }
                                      }
                                      _c8898 = _q8796;
                                    }
                                    if (_c8898) {
                                      _q8679 = true;
                                      break Q8680;
                                    }
                                  }
                                }
                                _c8899 = !(_q8679);
                              }
                              if (_c8899) {
                                _q8660 = true;
                                break Q8661;
                              }
                            }
                          }
                          _c8900 = _q8660;
                        }
                        if (_c8900) {
                          _q8399 = true;
                          break Q8400;
                        }
                      }
                    }
                    _c8901 = _q8399;
                  }
                  _c8902 = _c8901;
                }
                if (!(_c8902)) continue;
                if (!_g7875.includes(v_j)) _g7875.push(v_j);
              }
            }
          }
          const _g8903: number[] = [];
          G8904: {
            const _a9419 = v_U;
            for (let _i9420 = 0; _i9420 < _a9419.length; _i9420++) {
              const v_i = _a9419[_i9420];
              const _a9421 = v_U;
              for (let _i9422 = 0; _i9422 < _a9421.length; _i9422++) {
                const v_j = _a9421[_i9422];
                let _c9931: boolean = ((_i9420 > 0) && (_i9420 < _i9422));
                if (_c9931) {
                  let _c9930: boolean = ((throughWhere(sp, v_i, (_te9423: number): boolean => {  return ((b.grid[_te9423] || -1) === 1); }).includes(v_j)) || (!((clueAt(cl.number, v_c) !== -1)) && !(meetsMarked(b, sp, cl, cands, v_i, v_j))));
                  if (!_c9930) {
                    const _wc9424 = sp.edgeOf(v_c, v_i);
                    const _wd9425 = 1;
                    const _wc9426 = sp.edgeOf(v_c, v_j);
                    const _wd9427 = 1;
                    let _q9428 = false;
                    Q9429: {
                      const _a9431 = throughWhere(sp, v_c, (_te9430: number): boolean => {  return ((_te9430 === _wc9426 ? _wd9427 : (_te9430 === _wc9424 ? _wd9425 : (b.grid[_te9430] || -1))) === 1); });
                      for (let _i9432 = 0; _i9432 < _a9431.length; _i9432++) {
                        const v_t = _a9431[_i9432];
                        let _c9448: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                        if (!_c9448) {
                          let _g9433 = 0;
                          G9434: {
                            const _a9435 = sp.adj4[v_t];
                            for (let _i9436 = 0; _i9436 < _a9435.length; _i9436++) {
                              const _t9437 = sp.adj4Edges[v_t][_i9436];
                              if (!(((_t9437 === _wc9426 ? _wd9427 : (_t9437 === _wc9424 ? _wd9425 : (b.grid[_t9437] || -1))) === 1))) continue;
                              _g9433++;
                            }
                          }
                          let _g9438 = 0;
                          G9439: {
                            for (let _i9440 = 0; _i9440 < 1; _i9440++) {
                              const v_k = v_t;
                              let _c9447: boolean = (clueAt(cl.number, v_k) !== -1);
                              if (_c9447) {
                                let _c9446: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                if (!_c9446) {
                                  let _g9441 = 0;
                                  G9442: {
                                    const _t9443 = (clueAt(cl.number, v_k) + 1);
                                    const _a9444 = cluesValued(cl.number, _t9443);
                                    for (let _i9445 = 0; _i9445 < _a9444.length; _i9445++) {
                                      const v_x = _a9444[_i9445];
                                      if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                      _g9441++;
                                    }
                                  }
                                  _c9446 = (_g9441 === 0);
                                }
                                _c9447 = _c9446;
                              }
                              if (!(_c9447)) continue;
                              _g9438++;
                            }
                          }
                          _c9448 = (_g9433 < (2 - _g9438));
                        }
                        if (!(_c9448)) continue;
                        let _g9449 = 0;
                        G9450: {
                          const _a9451 = sp.adj4[v_t];
                          for (let _i9452 = 0; _i9452 < _a9451.length; _i9452++) {
                            const _t9453 = sp.adj4Edges[v_t][_i9452];
                            if (!(((_t9453 === _wc9426 ? _wd9427 : (_t9453 === _wc9424 ? _wd9425 : (b.grid[_t9453] || -1))) === 1))) continue;
                            _g9449++;
                          }
                        }
                        let _g9454 = 0;
                        G9455: {
                          for (let _i9456 = 0; _i9456 < 1; _i9456++) {
                            const v_k = v_t;
                            let _c9463: boolean = (clueAt(cl.number, v_k) !== -1);
                            if (_c9463) {
                              let _c9462: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                              if (!_c9462) {
                                let _g9457 = 0;
                                G9458: {
                                  const _t9459 = (clueAt(cl.number, v_k) + 1);
                                  const _a9460 = cluesValued(cl.number, _t9459);
                                  for (let _i9461 = 0; _i9461 < _a9460.length; _i9461++) {
                                    const v_x = _a9460[_i9461];
                                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                    _g9457++;
                                  }
                                }
                                _c9462 = (_g9457 === 0);
                              }
                              _c9463 = _c9462;
                            }
                            if (!(_c9463)) continue;
                            _g9454++;
                          }
                        }
                        let _c9688: boolean = (_g9449 < (2 - _g9454));
                        if (_c9688) {
                          let _q9464 = false;
                          Q9465: {
                            const _a9466 = sp.adj4[v_t];
                            for (let _i9467 = 0; _i9467 < _a9466.length; _i9467++) {
                              const v_y = _a9466[_i9467];
                              const _t9468 = sp.adj4Edges[v_t][_i9467];
                              let _c9484: boolean = !((_t9468 === _wc9426 ? true : (_t9468 === _wc9424 ? true : (b.grid[_t9468] !== 0))));
                              if (_c9484) {
                                let _g9469 = 0;
                                G9470: {
                                  const _a9471 = sp.adj4[v_t];
                                  for (let _i9472 = 0; _i9472 < _a9471.length; _i9472++) {
                                    const _t9473 = sp.adj4Edges[v_t][_i9472];
                                    if (!(((_t9473 === _wc9426 ? _wd9427 : (_t9473 === _wc9424 ? _wd9425 : (b.grid[_t9473] || -1))) === 1))) continue;
                                    _g9469++;
                                  }
                                }
                                let _g9474 = 0;
                                G9475: {
                                  for (let _i9476 = 0; _i9476 < 1; _i9476++) {
                                    const v_k = v_t;
                                    let _c9483: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c9483) {
                                      let _c9482: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c9482) {
                                        let _g9477 = 0;
                                        G9478: {
                                          const _t9479 = (clueAt(cl.number, v_k) + 1);
                                          const _a9480 = cluesValued(cl.number, _t9479);
                                          for (let _i9481 = 0; _i9481 < _a9480.length; _i9481++) {
                                            const v_x = _a9480[_i9481];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g9477++;
                                          }
                                        }
                                        _c9482 = (_g9477 === 0);
                                      }
                                      _c9483 = _c9482;
                                    }
                                    if (!(_c9483)) continue;
                                    _g9474++;
                                  }
                                }
                                _c9484 = (_g9469 < (2 - _g9474));
                              }
                              let _c9501: boolean = _c9484;
                              if (_c9501) {
                                let _g9485 = 0;
                                G9486: {
                                  const _a9488 = sp.adj4[v_y];
                                  for (let _i9489 = 0; _i9489 < _a9488.length; _i9489++) {
                                    const _t9490 = sp.adj4Edges[v_y][_i9489];
                                    if (!(((_t9490 === _wc9426 ? _wd9427 : (_t9490 === _wc9424 ? _wd9425 : (b.grid[_t9490] || -1))) === 1))) continue;
                                    _g9485++;
                                  }
                                }
                                let _g9491 = 0;
                                G9492: {
                                  for (let _i9493 = 0; _i9493 < 1; _i9493++) {
                                    const v_k = v_y;
                                    let _c9500: boolean = (clueAt(cl.number, v_k) !== -1);
                                    if (_c9500) {
                                      let _c9499: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                      if (!_c9499) {
                                        let _g9494 = 0;
                                        G9495: {
                                          const _t9496 = (clueAt(cl.number, v_k) + 1);
                                          const _a9497 = cluesValued(cl.number, _t9496);
                                          for (let _i9498 = 0; _i9498 < _a9497.length; _i9498++) {
                                            const v_x = _a9497[_i9498];
                                            if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                            _g9494++;
                                          }
                                        }
                                        _c9499 = (_g9494 === 0);
                                      }
                                      _c9500 = _c9499;
                                    }
                                    if (!(_c9500)) continue;
                                    _g9491++;
                                  }
                                }
                                _c9501 = (_g9485 < (2 - _g9491));
                              }
                              let _c9566: boolean = _c9501;
                              if (_c9566) {
                                let _q9502 = true;
                                Q9503: {
                                  const _g9504: number[] = [];
                                  G9505: {
                                    for (let _i9507 = 0; _i9507 < 1; _i9507++) {
                                      const v_x = v_t;
                                      if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                      _g9504.push(v_x);
                                    }
                                  }
                                  const _g9508: number[] = [];
                                  G9509: {
                                    const _a9528 = throughWhere(sp, v_t, (_te9523: number): boolean => { let _c9525: boolean = ((_te9523 === _wc9426 ? _wd9427 : (_te9523 === _wc9424 ? _wd9425 : (b.grid[_te9523] || -1))) === 1); if (_c9525) {   const _t9524 = sp.edgeEnds[2 * _te9523];   _c9525 = !((clueAt(cl.number, _t9524) !== -1)); } let _c9527: boolean = _c9525; if (_c9527) {   const _t9526 = sp.edgeEnds[2 * _te9523 + 1];   _c9527 = !((clueAt(cl.number, _t9526) !== -1)); } return _c9527; });
                                    for (let _i9529 = 0; _i9529 < _a9528.length; _i9529++) {
                                      const v_t_9522 = _a9528[_i9529];
                                      const _a9530 = sp.adj4[v_t_9522];
                                      for (let _i9531 = 0; _i9531 < _a9530.length; _i9531++) {
                                        const v_x = _a9530[_i9531];
                                        let _c9533: boolean = (!((clueAt(cl.number, v_t_9522) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                        if (_c9533) {
                                          const _t9532 = sp.adj4Edges[v_t_9522][_i9531];
                                          _c9533 = ((_t9532 === _wc9426 ? _wd9427 : (_t9532 === _wc9424 ? _wd9425 : (b.grid[_t9532] || -1))) === 1);
                                        }
                                        if (!(_c9533)) continue;
                                        if (!_g9508.includes(v_x)) _g9508.push(v_x);
                                      }
                                    }
                                  }
                                  const _a9534 = union(_g9504, _g9508);
                                  for (let _i9535 = 0; _i9535 < _a9534.length; _i9535++) {
                                    const v_p = _a9534[_i9535];
                                    const _g9536: number[] = [];
                                    G9537: {
                                      for (let _i9539 = 0; _i9539 < 1; _i9539++) {
                                        const v_x = v_y;
                                        if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                        _g9536.push(v_x);
                                      }
                                    }
                                    const _g9540: number[] = [];
                                    G9541: {
                                      const _a9558 = throughWhere(sp, v_y, (_te9553: number): boolean => { let _c9555: boolean = ((_te9553 === _wc9426 ? _wd9427 : (_te9553 === _wc9424 ? _wd9425 : (b.grid[_te9553] || -1))) === 1); if (_c9555) {   const _t9554 = sp.edgeEnds[2 * _te9553];   _c9555 = !((clueAt(cl.number, _t9554) !== -1)); } let _c9557: boolean = _c9555; if (_c9557) {   const _t9556 = sp.edgeEnds[2 * _te9553 + 1];   _c9557 = !((clueAt(cl.number, _t9556) !== -1)); } return _c9557; });
                                      for (let _i9559 = 0; _i9559 < _a9558.length; _i9559++) {
                                        const v_t = _a9558[_i9559];
                                        const _a9560 = sp.adj4[v_t];
                                        for (let _i9561 = 0; _i9561 < _a9560.length; _i9561++) {
                                          const v_x = _a9560[_i9561];
                                          let _c9563: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                          if (_c9563) {
                                            const _t9562 = sp.adj4Edges[v_t][_i9561];
                                            _c9563 = ((_t9562 === _wc9426 ? _wd9427 : (_t9562 === _wc9424 ? _wd9425 : (b.grid[_t9562] || -1))) === 1);
                                          }
                                          if (!(_c9563)) continue;
                                          if (!_g9540.includes(v_x)) _g9540.push(v_x);
                                        }
                                      }
                                    }
                                    const _a9564 = union(_g9536, _g9540);
                                    for (let _i9565 = 0; _i9565 < _a9564.length; _i9565++) {
                                      const v_q = _a9564[_i9565];
                                      if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                        _q9502 = false;
                                        break Q9503;
                                      }
                                    }
                                  }
                                }
                                _c9566 = _q9502;
                              }
                              if (!((_c9566 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te9567: number): boolean => {  return ((_te9567 === _wc9426 ? _wd9427 : (_te9567 === _wc9424 ? _wd9425 : (b.grid[_te9567] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g9568 = 0;
                              G9569: {
                                const _a9570 = sp.adj4[v_t];
                                for (let _i9571 = 0; _i9571 < _a9570.length; _i9571++) {
                                  const _t9572 = sp.adj4Edges[v_t][_i9571];
                                  if (!(((_t9572 === _wc9426 ? _wd9427 : (_t9572 === _wc9424 ? _wd9425 : (b.grid[_t9572] || -1))) === 1))) continue;
                                  _g9568++;
                                }
                              }
                              let _g9573 = 0;
                              G9574: {
                                for (let _i9575 = 0; _i9575 < 1; _i9575++) {
                                  const v_k = v_t;
                                  let _c9582: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c9582) {
                                    let _c9581: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c9581) {
                                      let _g9576 = 0;
                                      G9577: {
                                        const _t9578 = (clueAt(cl.number, v_k) + 1);
                                        const _a9579 = cluesValued(cl.number, _t9578);
                                        for (let _i9580 = 0; _i9580 < _a9579.length; _i9580++) {
                                          const v_x = _a9579[_i9580];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g9576++;
                                        }
                                      }
                                      _c9581 = (_g9576 === 0);
                                    }
                                    _c9582 = _c9581;
                                  }
                                  if (!(_c9582)) continue;
                                  _g9573++;
                                }
                              }
                              let _c9687: boolean = ((_g9568 + 1) === (2 - _g9573));
                              if (!_c9687) {
                                let _q9583 = false;
                                Q9584: {
                                  const _a9585 = sp.adj4[v_t];
                                  const _n9586 = _i9467;
                                  for (let _i9587 = 0; _i9587 < _n9586; _i9587++) {
                                    const v_z = _a9585[_i9587];
                                    const _t9588 = sp.adj4Edges[v_t][_i9587];
                                    let _c9604: boolean = !((_t9588 === _wc9426 ? true : (_t9588 === _wc9424 ? true : (b.grid[_t9588] !== 0))));
                                    if (_c9604) {
                                      let _g9589 = 0;
                                      G9590: {
                                        const _a9591 = sp.adj4[v_t];
                                        for (let _i9592 = 0; _i9592 < _a9591.length; _i9592++) {
                                          const _t9593 = sp.adj4Edges[v_t][_i9592];
                                          if (!(((_t9593 === _wc9426 ? _wd9427 : (_t9593 === _wc9424 ? _wd9425 : (b.grid[_t9593] || -1))) === 1))) continue;
                                          _g9589++;
                                        }
                                      }
                                      let _g9594 = 0;
                                      G9595: {
                                        for (let _i9596 = 0; _i9596 < 1; _i9596++) {
                                          const v_k = v_t;
                                          let _c9603: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c9603) {
                                            let _c9602: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c9602) {
                                              let _g9597 = 0;
                                              G9598: {
                                                const _t9599 = (clueAt(cl.number, v_k) + 1);
                                                const _a9600 = cluesValued(cl.number, _t9599);
                                                for (let _i9601 = 0; _i9601 < _a9600.length; _i9601++) {
                                                  const v_x = _a9600[_i9601];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g9597++;
                                                }
                                              }
                                              _c9602 = (_g9597 === 0);
                                            }
                                            _c9603 = _c9602;
                                          }
                                          if (!(_c9603)) continue;
                                          _g9594++;
                                        }
                                      }
                                      _c9604 = (_g9589 < (2 - _g9594));
                                    }
                                    let _c9620: boolean = _c9604;
                                    if (_c9620) {
                                      let _g9605 = 0;
                                      G9606: {
                                        const _a9607 = sp.adj4[v_z];
                                        for (let _i9608 = 0; _i9608 < _a9607.length; _i9608++) {
                                          const _t9609 = sp.adj4Edges[v_z][_i9608];
                                          if (!(((_t9609 === _wc9426 ? _wd9427 : (_t9609 === _wc9424 ? _wd9425 : (b.grid[_t9609] || -1))) === 1))) continue;
                                          _g9605++;
                                        }
                                      }
                                      let _g9610 = 0;
                                      G9611: {
                                        for (let _i9612 = 0; _i9612 < 1; _i9612++) {
                                          const v_k = v_z;
                                          let _c9619: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c9619) {
                                            let _c9618: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c9618) {
                                              let _g9613 = 0;
                                              G9614: {
                                                const _t9615 = (clueAt(cl.number, v_k) + 1);
                                                const _a9616 = cluesValued(cl.number, _t9615);
                                                for (let _i9617 = 0; _i9617 < _a9616.length; _i9617++) {
                                                  const v_x = _a9616[_i9617];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g9613++;
                                                }
                                              }
                                              _c9618 = (_g9613 === 0);
                                            }
                                            _c9619 = _c9618;
                                          }
                                          if (!(_c9619)) continue;
                                          _g9610++;
                                        }
                                      }
                                      _c9620 = (_g9605 < (2 - _g9610));
                                    }
                                    let _c9685: boolean = _c9620;
                                    if (_c9685) {
                                      let _q9621 = true;
                                      Q9622: {
                                        const _g9623: number[] = [];
                                        G9624: {
                                          for (let _i9626 = 0; _i9626 < 1; _i9626++) {
                                            const v_x = v_t;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g9623.push(v_x);
                                          }
                                        }
                                        const _g9627: number[] = [];
                                        G9628: {
                                          const _a9647 = throughWhere(sp, v_t, (_te9642: number): boolean => { let _c9644: boolean = ((_te9642 === _wc9426 ? _wd9427 : (_te9642 === _wc9424 ? _wd9425 : (b.grid[_te9642] || -1))) === 1); if (_c9644) {   const _t9643 = sp.edgeEnds[2 * _te9642];   _c9644 = !((clueAt(cl.number, _t9643) !== -1)); } let _c9646: boolean = _c9644; if (_c9646) {   const _t9645 = sp.edgeEnds[2 * _te9642 + 1];   _c9646 = !((clueAt(cl.number, _t9645) !== -1)); } return _c9646; });
                                          for (let _i9648 = 0; _i9648 < _a9647.length; _i9648++) {
                                            const v_t_9641 = _a9647[_i9648];
                                            const _a9649 = sp.adj4[v_t_9641];
                                            for (let _i9650 = 0; _i9650 < _a9649.length; _i9650++) {
                                              const v_x = _a9649[_i9650];
                                              let _c9652: boolean = (!((clueAt(cl.number, v_t_9641) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c9652) {
                                                const _t9651 = sp.adj4Edges[v_t_9641][_i9650];
                                                _c9652 = ((_t9651 === _wc9426 ? _wd9427 : (_t9651 === _wc9424 ? _wd9425 : (b.grid[_t9651] || -1))) === 1);
                                              }
                                              if (!(_c9652)) continue;
                                              if (!_g9627.includes(v_x)) _g9627.push(v_x);
                                            }
                                          }
                                        }
                                        const _a9653 = union(_g9623, _g9627);
                                        for (let _i9654 = 0; _i9654 < _a9653.length; _i9654++) {
                                          const v_p = _a9653[_i9654];
                                          const _g9655: number[] = [];
                                          G9656: {
                                            for (let _i9658 = 0; _i9658 < 1; _i9658++) {
                                              const v_x = v_z;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g9655.push(v_x);
                                            }
                                          }
                                          const _g9659: number[] = [];
                                          G9660: {
                                            const _a9677 = throughWhere(sp, v_z, (_te9672: number): boolean => { let _c9674: boolean = ((_te9672 === _wc9426 ? _wd9427 : (_te9672 === _wc9424 ? _wd9425 : (b.grid[_te9672] || -1))) === 1); if (_c9674) {   const _t9673 = sp.edgeEnds[2 * _te9672];   _c9674 = !((clueAt(cl.number, _t9673) !== -1)); } let _c9676: boolean = _c9674; if (_c9676) {   const _t9675 = sp.edgeEnds[2 * _te9672 + 1];   _c9676 = !((clueAt(cl.number, _t9675) !== -1)); } return _c9676; });
                                            for (let _i9678 = 0; _i9678 < _a9677.length; _i9678++) {
                                              const v_t = _a9677[_i9678];
                                              const _a9679 = sp.adj4[v_t];
                                              for (let _i9680 = 0; _i9680 < _a9679.length; _i9680++) {
                                                const v_x = _a9679[_i9680];
                                                let _c9682: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c9682) {
                                                  const _t9681 = sp.adj4Edges[v_t][_i9680];
                                                  _c9682 = ((_t9681 === _wc9426 ? _wd9427 : (_t9681 === _wc9424 ? _wd9425 : (b.grid[_t9681] || -1))) === 1);
                                                }
                                                if (!(_c9682)) continue;
                                                if (!_g9659.includes(v_x)) _g9659.push(v_x);
                                              }
                                            }
                                          }
                                          const _a9683 = union(_g9655, _g9659);
                                          for (let _i9684 = 0; _i9684 < _a9683.length; _i9684++) {
                                            const v_q = _a9683[_i9684];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q9621 = false;
                                              break Q9622;
                                            }
                                          }
                                        }
                                      }
                                      _c9685 = _q9621;
                                    }
                                    if ((_c9685 && ((cl.step === 0) || !(throughWhere(sp, v_t, (_te9686: number): boolean => {  return ((_te9686 === _wc9426 ? _wd9427 : (_te9686 === _wc9424 ? _wd9425 : (b.grid[_te9686] || -1))) === 1); }).includes(v_z))))) {
                                      _q9583 = true;
                                      break Q9584;
                                    }
                                  }
                                }
                                _c9687 = _q9583;
                              }
                              if (_c9687) {
                                _q9464 = true;
                                break Q9465;
                              }
                            }
                          }
                          _c9688 = !(_q9464);
                        }
                        let _c9929: boolean = _c9688;
                        if (!_c9929) {
                          let _q9689 = false;
                          Q9690: {
                            const _a9691 = sp.adj4[v_t];
                            for (let _i9692 = 0; _i9692 < _a9691.length; _i9692++) {
                              const v_s = _a9691[_i9692];
                              let _g9693 = 0;
                              G9694: {
                                const _a9695 = sp.adj4[v_s];
                                for (let _i9696 = 0; _i9696 < _a9695.length; _i9696++) {
                                  const _t9697 = sp.adj4Edges[v_s][_i9696];
                                  if (!(((_t9697 === _wc9426 ? _wd9427 : (_t9697 === _wc9424 ? _wd9425 : (b.grid[_t9697] || -1))) === 1))) continue;
                                  _g9693++;
                                }
                              }
                              let _g9698 = 0;
                              G9699: {
                                for (let _i9700 = 0; _i9700 < 1; _i9700++) {
                                  const v_k = v_s;
                                  let _c9707: boolean = (clueAt(cl.number, v_k) !== -1);
                                  if (_c9707) {
                                    let _c9706: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                    if (!_c9706) {
                                      let _g9701 = 0;
                                      G9702: {
                                        const _t9703 = (clueAt(cl.number, v_k) + 1);
                                        const _a9704 = cluesValued(cl.number, _t9703);
                                        for (let _i9705 = 0; _i9705 < _a9704.length; _i9705++) {
                                          const v_x = _a9704[_i9705];
                                          if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                          _g9701++;
                                        }
                                      }
                                      _c9706 = (_g9701 === 0);
                                    }
                                    _c9707 = _c9706;
                                  }
                                  if (!(_c9707)) continue;
                                  _g9698++;
                                }
                              }
                              let _c9928: boolean = (_g9693 < (2 - _g9698));
                              if (_c9928) {
                                let _q9708 = false;
                                Q9709: {
                                  const _a9710 = sp.adj4[v_s];
                                  for (let _i9711 = 0; _i9711 < _a9710.length; _i9711++) {
                                    const v_y = _a9710[_i9711];
                                    const _t9712 = sp.adj4Edges[v_s][_i9711];
                                    let _c9728: boolean = !((_t9712 === _wc9426 ? true : (_t9712 === _wc9424 ? true : (b.grid[_t9712] !== 0))));
                                    if (_c9728) {
                                      let _g9713 = 0;
                                      G9714: {
                                        const _a9715 = sp.adj4[v_s];
                                        for (let _i9716 = 0; _i9716 < _a9715.length; _i9716++) {
                                          const _t9717 = sp.adj4Edges[v_s][_i9716];
                                          if (!(((_t9717 === _wc9426 ? _wd9427 : (_t9717 === _wc9424 ? _wd9425 : (b.grid[_t9717] || -1))) === 1))) continue;
                                          _g9713++;
                                        }
                                      }
                                      let _g9718 = 0;
                                      G9719: {
                                        for (let _i9720 = 0; _i9720 < 1; _i9720++) {
                                          const v_k = v_s;
                                          let _c9727: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c9727) {
                                            let _c9726: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c9726) {
                                              let _g9721 = 0;
                                              G9722: {
                                                const _t9723 = (clueAt(cl.number, v_k) + 1);
                                                const _a9724 = cluesValued(cl.number, _t9723);
                                                for (let _i9725 = 0; _i9725 < _a9724.length; _i9725++) {
                                                  const v_x = _a9724[_i9725];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g9721++;
                                                }
                                              }
                                              _c9726 = (_g9721 === 0);
                                            }
                                            _c9727 = _c9726;
                                          }
                                          if (!(_c9727)) continue;
                                          _g9718++;
                                        }
                                      }
                                      _c9728 = (_g9713 < (2 - _g9718));
                                    }
                                    let _c9745: boolean = _c9728;
                                    if (_c9745) {
                                      let _g9729 = 0;
                                      G9730: {
                                        const _a9732 = sp.adj4[v_y];
                                        for (let _i9733 = 0; _i9733 < _a9732.length; _i9733++) {
                                          const _t9734 = sp.adj4Edges[v_y][_i9733];
                                          if (!(((_t9734 === _wc9426 ? _wd9427 : (_t9734 === _wc9424 ? _wd9425 : (b.grid[_t9734] || -1))) === 1))) continue;
                                          _g9729++;
                                        }
                                      }
                                      let _g9735 = 0;
                                      G9736: {
                                        for (let _i9737 = 0; _i9737 < 1; _i9737++) {
                                          const v_k = v_y;
                                          let _c9744: boolean = (clueAt(cl.number, v_k) !== -1);
                                          if (_c9744) {
                                            let _c9743: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                            if (!_c9743) {
                                              let _g9738 = 0;
                                              G9739: {
                                                const _t9740 = (clueAt(cl.number, v_k) + 1);
                                                const _a9741 = cluesValued(cl.number, _t9740);
                                                for (let _i9742 = 0; _i9742 < _a9741.length; _i9742++) {
                                                  const v_x = _a9741[_i9742];
                                                  if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                  _g9738++;
                                                }
                                              }
                                              _c9743 = (_g9738 === 0);
                                            }
                                            _c9744 = _c9743;
                                          }
                                          if (!(_c9744)) continue;
                                          _g9735++;
                                        }
                                      }
                                      _c9745 = (_g9729 < (2 - _g9735));
                                    }
                                    let _c9808: boolean = _c9745;
                                    if (_c9808) {
                                      let _q9746 = true;
                                      Q9747: {
                                        const _g9748: number[] = [];
                                        G9749: {
                                          for (let _i9751 = 0; _i9751 < 1; _i9751++) {
                                            const v_x = v_s;
                                            if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                            _g9748.push(v_x);
                                          }
                                        }
                                        const _g9752: number[] = [];
                                        G9753: {
                                          const _a9770 = throughWhere(sp, v_s, (_te9765: number): boolean => { let _c9767: boolean = ((_te9765 === _wc9426 ? _wd9427 : (_te9765 === _wc9424 ? _wd9425 : (b.grid[_te9765] || -1))) === 1); if (_c9767) {   const _t9766 = sp.edgeEnds[2 * _te9765];   _c9767 = !((clueAt(cl.number, _t9766) !== -1)); } let _c9769: boolean = _c9767; if (_c9769) {   const _t9768 = sp.edgeEnds[2 * _te9765 + 1];   _c9769 = !((clueAt(cl.number, _t9768) !== -1)); } return _c9769; });
                                          for (let _i9771 = 0; _i9771 < _a9770.length; _i9771++) {
                                            const v_t = _a9770[_i9771];
                                            const _a9772 = sp.adj4[v_t];
                                            for (let _i9773 = 0; _i9773 < _a9772.length; _i9773++) {
                                              const v_x = _a9772[_i9773];
                                              let _c9775: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                              if (_c9775) {
                                                const _t9774 = sp.adj4Edges[v_t][_i9773];
                                                _c9775 = ((_t9774 === _wc9426 ? _wd9427 : (_t9774 === _wc9424 ? _wd9425 : (b.grid[_t9774] || -1))) === 1);
                                              }
                                              if (!(_c9775)) continue;
                                              if (!_g9752.includes(v_x)) _g9752.push(v_x);
                                            }
                                          }
                                        }
                                        const _a9776 = union(_g9748, _g9752);
                                        for (let _i9777 = 0; _i9777 < _a9776.length; _i9777++) {
                                          const v_p = _a9776[_i9777];
                                          const _g9778: number[] = [];
                                          G9779: {
                                            for (let _i9781 = 0; _i9781 < 1; _i9781++) {
                                              const v_x = v_y;
                                              if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                              _g9778.push(v_x);
                                            }
                                          }
                                          const _g9782: number[] = [];
                                          G9783: {
                                            const _a9800 = throughWhere(sp, v_y, (_te9795: number): boolean => { let _c9797: boolean = ((_te9795 === _wc9426 ? _wd9427 : (_te9795 === _wc9424 ? _wd9425 : (b.grid[_te9795] || -1))) === 1); if (_c9797) {   const _t9796 = sp.edgeEnds[2 * _te9795];   _c9797 = !((clueAt(cl.number, _t9796) !== -1)); } let _c9799: boolean = _c9797; if (_c9799) {   const _t9798 = sp.edgeEnds[2 * _te9795 + 1];   _c9799 = !((clueAt(cl.number, _t9798) !== -1)); } return _c9799; });
                                            for (let _i9801 = 0; _i9801 < _a9800.length; _i9801++) {
                                              const v_t = _a9800[_i9801];
                                              const _a9802 = sp.adj4[v_t];
                                              for (let _i9803 = 0; _i9803 < _a9802.length; _i9803++) {
                                                const v_x = _a9802[_i9803];
                                                let _c9805: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                if (_c9805) {
                                                  const _t9804 = sp.adj4Edges[v_t][_i9803];
                                                  _c9805 = ((_t9804 === _wc9426 ? _wd9427 : (_t9804 === _wc9424 ? _wd9425 : (b.grid[_t9804] || -1))) === 1);
                                                }
                                                if (!(_c9805)) continue;
                                                if (!_g9782.includes(v_x)) _g9782.push(v_x);
                                              }
                                            }
                                          }
                                          const _a9806 = union(_g9778, _g9782);
                                          for (let _i9807 = 0; _i9807 < _a9806.length; _i9807++) {
                                            const v_q = _a9806[_i9807];
                                            if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                              _q9746 = false;
                                              break Q9747;
                                            }
                                          }
                                        }
                                      }
                                      _c9808 = _q9746;
                                    }
                                    if (!((_c9808 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te9809: number): boolean => {  return ((_te9809 === _wc9426 ? _wd9427 : (_te9809 === _wc9424 ? _wd9425 : (b.grid[_te9809] || -1))) === 1); }).includes(v_y)))))) continue;
                                    let _g9810 = 0;
                                    G9811: {
                                      const _a9812 = sp.adj4[v_s];
                                      for (let _i9813 = 0; _i9813 < _a9812.length; _i9813++) {
                                        const _t9814 = sp.adj4Edges[v_s][_i9813];
                                        if (!(((_t9814 === _wc9426 ? _wd9427 : (_t9814 === _wc9424 ? _wd9425 : (b.grid[_t9814] || -1))) === 1))) continue;
                                        _g9810++;
                                      }
                                    }
                                    let _g9815 = 0;
                                    G9816: {
                                      for (let _i9817 = 0; _i9817 < 1; _i9817++) {
                                        const v_k = v_s;
                                        let _c9824: boolean = (clueAt(cl.number, v_k) !== -1);
                                        if (_c9824) {
                                          let _c9823: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                          if (!_c9823) {
                                            let _g9818 = 0;
                                            G9819: {
                                              const _t9820 = (clueAt(cl.number, v_k) + 1);
                                              const _a9821 = cluesValued(cl.number, _t9820);
                                              for (let _i9822 = 0; _i9822 < _a9821.length; _i9822++) {
                                                const v_x = _a9821[_i9822];
                                                if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                _g9818++;
                                              }
                                            }
                                            _c9823 = (_g9818 === 0);
                                          }
                                          _c9824 = _c9823;
                                        }
                                        if (!(_c9824)) continue;
                                        _g9815++;
                                      }
                                    }
                                    let _c9927: boolean = ((_g9810 + 1) === (2 - _g9815));
                                    if (!_c9927) {
                                      let _q9825 = false;
                                      Q9826: {
                                        const _a9827 = sp.adj4[v_s];
                                        const _n9828 = _i9711;
                                        for (let _i9829 = 0; _i9829 < _n9828; _i9829++) {
                                          const v_z = _a9827[_i9829];
                                          const _t9830 = sp.adj4Edges[v_s][_i9829];
                                          let _c9846: boolean = !((_t9830 === _wc9426 ? true : (_t9830 === _wc9424 ? true : (b.grid[_t9830] !== 0))));
                                          if (_c9846) {
                                            let _g9831 = 0;
                                            G9832: {
                                              const _a9833 = sp.adj4[v_s];
                                              for (let _i9834 = 0; _i9834 < _a9833.length; _i9834++) {
                                                const _t9835 = sp.adj4Edges[v_s][_i9834];
                                                if (!(((_t9835 === _wc9426 ? _wd9427 : (_t9835 === _wc9424 ? _wd9425 : (b.grid[_t9835] || -1))) === 1))) continue;
                                                _g9831++;
                                              }
                                            }
                                            let _g9836 = 0;
                                            G9837: {
                                              for (let _i9838 = 0; _i9838 < 1; _i9838++) {
                                                const v_k = v_s;
                                                let _c9845: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c9845) {
                                                  let _c9844: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c9844) {
                                                    let _g9839 = 0;
                                                    G9840: {
                                                      const _t9841 = (clueAt(cl.number, v_k) + 1);
                                                      const _a9842 = cluesValued(cl.number, _t9841);
                                                      for (let _i9843 = 0; _i9843 < _a9842.length; _i9843++) {
                                                        const v_x = _a9842[_i9843];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g9839++;
                                                      }
                                                    }
                                                    _c9844 = (_g9839 === 0);
                                                  }
                                                  _c9845 = _c9844;
                                                }
                                                if (!(_c9845)) continue;
                                                _g9836++;
                                              }
                                            }
                                            _c9846 = (_g9831 < (2 - _g9836));
                                          }
                                          let _c9862: boolean = _c9846;
                                          if (_c9862) {
                                            let _g9847 = 0;
                                            G9848: {
                                              const _a9849 = sp.adj4[v_z];
                                              for (let _i9850 = 0; _i9850 < _a9849.length; _i9850++) {
                                                const _t9851 = sp.adj4Edges[v_z][_i9850];
                                                if (!(((_t9851 === _wc9426 ? _wd9427 : (_t9851 === _wc9424 ? _wd9425 : (b.grid[_t9851] || -1))) === 1))) continue;
                                                _g9847++;
                                              }
                                            }
                                            let _g9852 = 0;
                                            G9853: {
                                              for (let _i9854 = 0; _i9854 < 1; _i9854++) {
                                                const v_k = v_z;
                                                let _c9861: boolean = (clueAt(cl.number, v_k) !== -1);
                                                if (_c9861) {
                                                  let _c9860: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
                                                  if (!_c9860) {
                                                    let _g9855 = 0;
                                                    G9856: {
                                                      const _t9857 = (clueAt(cl.number, v_k) + 1);
                                                      const _a9858 = cluesValued(cl.number, _t9857);
                                                      for (let _i9859 = 0; _i9859 < _a9858.length; _i9859++) {
                                                        const v_x = _a9858[_i9859];
                                                        if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                                                        _g9855++;
                                                      }
                                                    }
                                                    _c9860 = (_g9855 === 0);
                                                  }
                                                  _c9861 = _c9860;
                                                }
                                                if (!(_c9861)) continue;
                                                _g9852++;
                                              }
                                            }
                                            _c9862 = (_g9847 < (2 - _g9852));
                                          }
                                          let _c9925: boolean = _c9862;
                                          if (_c9925) {
                                            let _q9863 = true;
                                            Q9864: {
                                              const _g9865: number[] = [];
                                              G9866: {
                                                for (let _i9868 = 0; _i9868 < 1; _i9868++) {
                                                  const v_x = v_s;
                                                  if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                  _g9865.push(v_x);
                                                }
                                              }
                                              const _g9869: number[] = [];
                                              G9870: {
                                                const _a9887 = throughWhere(sp, v_s, (_te9882: number): boolean => { let _c9884: boolean = ((_te9882 === _wc9426 ? _wd9427 : (_te9882 === _wc9424 ? _wd9425 : (b.grid[_te9882] || -1))) === 1); if (_c9884) {   const _t9883 = sp.edgeEnds[2 * _te9882];   _c9884 = !((clueAt(cl.number, _t9883) !== -1)); } let _c9886: boolean = _c9884; if (_c9886) {   const _t9885 = sp.edgeEnds[2 * _te9882 + 1];   _c9886 = !((clueAt(cl.number, _t9885) !== -1)); } return _c9886; });
                                                for (let _i9888 = 0; _i9888 < _a9887.length; _i9888++) {
                                                  const v_t = _a9887[_i9888];
                                                  const _a9889 = sp.adj4[v_t];
                                                  for (let _i9890 = 0; _i9890 < _a9889.length; _i9890++) {
                                                    const v_x = _a9889[_i9890];
                                                    let _c9892: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                    if (_c9892) {
                                                      const _t9891 = sp.adj4Edges[v_t][_i9890];
                                                      _c9892 = ((_t9891 === _wc9426 ? _wd9427 : (_t9891 === _wc9424 ? _wd9425 : (b.grid[_t9891] || -1))) === 1);
                                                    }
                                                    if (!(_c9892)) continue;
                                                    if (!_g9869.includes(v_x)) _g9869.push(v_x);
                                                  }
                                                }
                                              }
                                              const _a9893 = union(_g9865, _g9869);
                                              for (let _i9894 = 0; _i9894 < _a9893.length; _i9894++) {
                                                const v_p = _a9893[_i9894];
                                                const _g9895: number[] = [];
                                                G9896: {
                                                  for (let _i9898 = 0; _i9898 < 1; _i9898++) {
                                                    const v_x = v_z;
                                                    if (!((clueAt(cl.number, v_x) !== -1))) continue;
                                                    _g9895.push(v_x);
                                                  }
                                                }
                                                const _g9899: number[] = [];
                                                G9900: {
                                                  const _a9917 = throughWhere(sp, v_z, (_te9912: number): boolean => { let _c9914: boolean = ((_te9912 === _wc9426 ? _wd9427 : (_te9912 === _wc9424 ? _wd9425 : (b.grid[_te9912] || -1))) === 1); if (_c9914) {   const _t9913 = sp.edgeEnds[2 * _te9912];   _c9914 = !((clueAt(cl.number, _t9913) !== -1)); } let _c9916: boolean = _c9914; if (_c9916) {   const _t9915 = sp.edgeEnds[2 * _te9912 + 1];   _c9916 = !((clueAt(cl.number, _t9915) !== -1)); } return _c9916; });
                                                  for (let _i9918 = 0; _i9918 < _a9917.length; _i9918++) {
                                                    const v_t = _a9917[_i9918];
                                                    const _a9919 = sp.adj4[v_t];
                                                    for (let _i9920 = 0; _i9920 < _a9919.length; _i9920++) {
                                                      const v_x = _a9919[_i9920];
                                                      let _c9922: boolean = (!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1));
                                                      if (_c9922) {
                                                        const _t9921 = sp.adj4Edges[v_t][_i9920];
                                                        _c9922 = ((_t9921 === _wc9426 ? _wd9427 : (_t9921 === _wc9424 ? _wd9425 : (b.grid[_t9921] || -1))) === 1);
                                                      }
                                                      if (!(_c9922)) continue;
                                                      if (!_g9899.includes(v_x)) _g9899.push(v_x);
                                                    }
                                                  }
                                                }
                                                const _a9923 = union(_g9895, _g9899);
                                                for (let _i9924 = 0; _i9924 < _a9923.length; _i9924++) {
                                                  const v_q = _a9923[_i9924];
                                                  if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                                                    _q9863 = false;
                                                    break Q9864;
                                                  }
                                                }
                                              }
                                            }
                                            _c9925 = _q9863;
                                          }
                                          if ((_c9925 && ((cl.step === 0) || !(throughWhere(sp, v_s, (_te9926: number): boolean => {  return ((_te9926 === _wc9426 ? _wd9427 : (_te9926 === _wc9424 ? _wd9425 : (b.grid[_te9926] || -1))) === 1); }).includes(v_z))))) {
                                            _q9825 = true;
                                            break Q9826;
                                          }
                                        }
                                      }
                                      _c9927 = _q9825;
                                    }
                                    if (_c9927) {
                                      _q9708 = true;
                                      break Q9709;
                                    }
                                  }
                                }
                                _c9928 = !(_q9708);
                              }
                              if (_c9928) {
                                _q9689 = true;
                                break Q9690;
                              }
                            }
                          }
                          _c9929 = _q9689;
                        }
                        if (_c9929) {
                          _q9428 = true;
                          break Q9429;
                        }
                      }
                    }
                    _c9930 = _q9428;
                  }
                  _c9931 = _c9930;
                }
                if (!(_c9931)) continue;
                const _t9932 = minus(v_U, setOf((v_U[0] ?? -1), v_i, v_j));
                const _t9933 = (_t9932.length > 0 ? _t9932[0] : -1);
                if (!_g8903.includes(_t9933)) _g8903.push(_t9933);
              }
            }
          }
          const _g9934: number[] = [];
          G9935: {
            const _a9945 = v_U;
            for (let _i9946 = 0; _i9946 < _a9945.length; _i9946++) {
              const v_y = _a9945[_i9946];
              let _c9953: boolean = ((_i9946 === 0) && (v_A.length < 3));
              if (!_c9953) {
                let _c9952: boolean = (_i9946 > 0);
                if (_c9952) {
                  let _c9951: boolean = !(v_A.includes(v_y));
                  if (!_c9951) {
                    let _q9947 = false;
                    Q9948: {
                      const _a9949 = v_U;
                      for (let _i9950 = 0; _i9950 < _a9949.length; _i9950++) {
                        const v_m = _a9949[_i9950];
                        if (!(((_i9950 > 0) && (v_m !== v_y)))) continue;
                        if (!(v_B.includes(v_m))) {
                          _q9947 = true;
                          break Q9948;
                        }
                      }
                    }
                    _c9951 = _q9947;
                  }
                  _c9952 = _c9951;
                }
                _c9953 = _c9952;
              }
              if (!(_c9953)) continue;
              _g9934.push(v_y);
            }
          }
          const _g9954: number[] = [];
          G9955: {
            const _a9964 = v_N;
            for (let _i9965 = 0; _i9965 < _a9964.length; _i9965++) {
              const v_y = _a9964[_i9965];
              let _c9971: boolean = ((v_U.indexOf(v_y) === 0) && (v_B.length === 3));
              if (!_c9971) {
                let _c9970: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
                if (_c9970) {
                  let _q9966 = true;
                  Q9967: {
                    const _a9968 = v_U;
                    for (let _i9969 = 0; _i9969 < _a9968.length; _i9969++) {
                      const v_m = _a9968[_i9969];
                      if (!(((_i9969 > 0) && (v_m !== v_y)))) continue;
                      if (!((v_A.includes(v_m)))) {
                        _q9966 = false;
                        break Q9967;
                      }
                    }
                  }
                  _c9970 = _q9966;
                }
                _c9971 = _c9970;
              }
              if (!(_c9971)) continue;
              _g9954.push(v_y);
            }
          }
          freshBinding("weighed", [(sp.cells.includes(v_c)), ((takes(sp, cl, v_c) - _g7871) === 2), sameSet(v_U, ways(b, sp, cl, v_c)), (v_U.length === 4), sameSet(v_A, _g7875), sameSet(v_B, _g8903), sameSet(v_N, _g9934), sameSet(v_P, _g9954), sameSet(v_X, minus(v_U, v_N)), (((v_N.length === 0) || (v_P.length > 0)) || (v_X.length > 0))], ["c in", "where of c", "U =", "where of U", "A =", "B =", "N =", "P =", "X =", "where of X"]);
        }
        facts.length = 0;
        changed = false;
        let _c9977: boolean = (_h7868 > 0);
        if (_c9977) {
          let _q9972 = true;
          Q9973: {
            const _a9974 = v_P;
            for (let _i9975 = 0; _i9975 < _a9974.length; _i9975++) {
              const v_y = _a9974[_i9975];
              const _t9976 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t9976] !== 0)) { if (fire === null) { b.placeAt(_t9976, 1); changed = true; } else facts.push(PLACE, _t9976, 1); }
              if (!(true)) {
                _q9972 = false;
                break Q9973;
              }
            }
          }
          _c9977 = _q9972;
        }
        let _c9984: boolean = _c9977;
        if (_c9984) {
          let _c9983: boolean = !((_h7869 === 0));
          if (!_c9983) {
            let _q9978 = true;
            Q9979: {
              const _a9980 = v_X;
              for (let _i9981 = 0; _i9981 < _a9980.length; _i9981++) {
                const v_y = _a9980[_i9981];
                const _t9982 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t9982] !== 0)) { if (fire === null) { b.placeAt(_t9982, 2); changed = true; } else facts.push(PLACE, _t9982, 2); }
                if (!(true)) {
                  _q9978 = false;
                  break Q9979;
                }
              }
            }
            _c9983 = _q9978;
          }
          _c9984 = _c9983;
        }
        if (!(_c9984)) return -1;
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
  const _made = throughWhere(sp, v_c, (_te88: number): boolean => {  return ((b.grid[_te88] || -1) === 1); });
  _kept[v_c] = _made;
  return _made;
}

const meetsMarkedKept = new Map<number, boolean>();

/** `meets(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function meetsMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = meetsMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  let _q92 = true;
  Q93: {
    const _a94 = nearest(b, sp, cl, v_a);
    for (let _i95 = 0; _i95 < _a94.length; _i95++) {
      const v_p = _a94[_i95];
      const _a96 = nearest(b, sp, cl, v_b);
      for (let _i97 = 0; _i97 < _a96.length; _i97++) {
        const v_q = _a96[_i97];
        if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
          _q92 = false;
          break Q93;
        }
      }
    }
  }
  const _made = _q92;
  meetsMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}

const liveMarkedKept = new Map<number, boolean>();

/** `live(a, b)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function liveMarked(b: Marks, sp: GridSpace, cl: Dealt, cands: Int32Array, v_a: number, v_b: number): boolean {
  const _was = liveMarkedKept.get((v_a + 1) * 1048577 + (v_b + 1));
  if (_was !== undefined) return _was;
  const _made = ((((!((b.grid[sp.edgeOf(v_a, v_b)] !== 0)) && spare(b, sp, cl, v_a)) && spare(b, sp, cl, v_b)) && meetsMarked(b, sp, cl, cands, v_a, v_b)) && ((cl.step === 0) || !(throughWhere(sp, v_a, (_te108: number): boolean => {  return ((b.grid[_te108] || -1) === 1); }).includes(v_b))));
  liveMarkedKept.set((v_a + 1) * 1048577 + (v_b + 1), _made);
  return _made;
}
