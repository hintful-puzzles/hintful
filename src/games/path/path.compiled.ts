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
  const _g7836: number[] = [];
  const _g7843: number[] = [];
  const _g7902: number[] = [];
  const _g7909: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h7821 = (cl.step === 0);
  const _h7885 = (2 - cl.step);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q7807 = true;
  Q7808: {
    const _a7809 = sp.cells;
    for (let _i7810 = 0; _i7810 < _a7809.length; _i7810++) {
      const v_c = _a7809[_i7810];
      let _g7811 = 0;
      G7812: {
        const _a7813 = sp.adj4[v_c];
        for (let _i7814 = 0; _i7814 < _a7813.length; _i7814++) {
          const v_y = _a7813[_i7814];
          const _h7815 = (g[sp.edgeOf(v_c, v_y)] || -1);
          if (!((_h7815 === 1))) continue;
          _g7811++;
        }
      }
      let _g7816 = 0;
      G7817: {
        const _a7818 = setOf(v_c);
        for (let _i7819 = 0; _i7819 < _a7818.length; _i7819++) {
          const v_k = _a7818[_i7819];
          const _h7820 = clueAt(cl.number, v_k);
          const _h7828 = (_h7820 + 1);
          let _c7830: boolean = (_h7820 !== -1);
          if (_c7830) {
            let _c7829: boolean = (_h7821 || (_h7820 === 1));
            if (!_c7829) {
              let _g7822 = 0;
              G7823: {
                const _t7824 = (_h7820 + 1);
                const _a7825 = cluesValued(cl.number, _t7824);
                for (let _i7826 = 0; _i7826 < _a7825.length; _i7826++) {
                  const v_x = _a7825[_i7826];
                  const _h7827 = clueAt(cl.number, v_x);
                  if (!((_h7827 === _h7828))) continue;
                  _g7822++;
                }
              }
              _c7829 = (_g7822 === 0);
            }
            _c7830 = _c7829;
          }
          if (!(_c7830)) continue;
          _g7816++;
        }
      }
      if (!((_g7811 === (2 - _g7816)))) {
        _q7807 = false;
        break Q7808;
      }
    }
  }
  if (!(_q7807)) return false;
  let _q7831 = true;
  Q7832: {
    const _a7833 = sp.cells;
    for (let _i7834 = 0; _i7834 < _a7833.length; _i7834++) {
      const v_c = _a7833[_i7834];
      const _h7835 = clueAt(cl.number, v_c);
      if (!(!((_h7835 !== -1)))) continue;
      _g7836.length = 0;
      G7837: {
        const _a7840 = setOf(v_c);
        for (let _i7841 = 0; _i7841 < _a7840.length; _i7841++) {
          const v_x = _a7840[_i7841];
          const _h7842 = clueAt(cl.number, v_x);
          if (!((_h7842 !== -1))) continue;
          _g7836.push(v_x);
        }
      }
      _g7843.length = 0;
      G7844: {
        const _a7859 = throughWhere(sp, v_c, (_te7854: number): boolean => { let _c7856: boolean = ((g[_te7854] || -1) === 1); if (_c7856) {   const _t7855 = sp.edgeEnds[2 * _te7854];   _c7856 = !((clueAt(cl.number, _t7855) !== -1)); } let _c7858: boolean = _c7856; if (_c7858) {   const _t7857 = sp.edgeEnds[2 * _te7854 + 1];   _c7858 = !((clueAt(cl.number, _t7857) !== -1)); } return _c7858; });
        for (let _i7860 = 0; _i7860 < _a7859.length; _i7860++) {
          const v_t = _a7859[_i7860];
          const _h7863 = clueAt(cl.number, v_t);
          const _h7864 = (_h7863 !== -1);
          const _h7865 = _h7864;
          const _h7866 = !(_h7865);
          const _a7861 = sp.adj4[v_t];
          for (let _i7862 = 0; _i7862 < _a7861.length; _i7862++) {
            const v_x = _a7861[_i7862];
            const _h7867 = clueAt(cl.number, v_x);
            const _h7868 = (g[sp.edgeOf(v_t, v_x)] || -1);
            if (!(((_h7866 && (_h7867 !== -1)) && (_h7868 === 1)))) continue;
            if (!_g7843.includes(v_x)) _g7843.push(v_x);
          }
        }
      }
      if (!((union(_g7836, _g7843).length === 2))) {
        _q7831 = false;
        break Q7832;
      }
    }
  }
  if (!(_q7831)) return false;
  let _c7874: boolean = (cl.step === 0);
  if (!_c7874) {
    let _q7869 = false;
    Q7870: {
      const _a7871 = sp.cells;
      for (let _i7872 = 0; _i7872 < _a7871.length; _i7872++) {
        const v_x = _a7871[_i7872];
        const _h7873 = clueAt(cl.number, v_x);
        if ((_h7873 === 2)) {
          _q7869 = true;
          break Q7870;
        }
      }
    }
    _c7874 = _q7869;
  }
  let _c7894: boolean = _c7874;
  if (_c7894) {
    let _q7875 = true;
    Q7876: {
      const _a7877 = sp.cells;
      for (let _i7878 = 0; _i7878 < _a7877.length; _i7878++) {
        const v_x = _a7877[_i7878];
        const _h7879 = clueAt(cl.number, v_x);
        if (!((_h7879 !== -1))) continue;
        const _h7891 = (_h7879 - 1);
        let _g7880 = 0;
        G7881: {
          const _a7882 = cluesValued(cl.number, _h7879);
          for (let _i7883 = 0; _i7883 < _a7882.length; _i7883++) {
            const v_y = _a7882[_i7883];
            const _h7884 = clueAt(cl.number, v_y);
            if (!((_h7884 === _h7879))) continue;
            _g7880++;
          }
        }
        let _c7893: boolean = (_g7880 === _h7885);
        if (_c7893) {
          let _c7892: boolean = (_h7879 === 1);
          if (!_c7892) {
            let _q7886 = false;
            Q7887: {
              const _a7888 = sp.cells;
              for (let _i7889 = 0; _i7889 < _a7888.length; _i7889++) {
                const v_y = _a7888[_i7889];
                const _h7890 = clueAt(cl.number, v_y);
                if ((_h7890 === _h7891)) {
                  _q7886 = true;
                  break Q7887;
                }
              }
            }
            _c7892 = _q7886;
          }
          _c7893 = _c7892;
        }
        if (!(_c7893)) {
          _q7875 = false;
          break Q7876;
        }
      }
    }
    _c7894 = _q7875;
  }
  if (!(_c7894)) return false;
  for (let _k7895 = 0; _k7895 < cl.number.at.length; _k7895++) {
    const _at7896 = cl.number.at[_k7895];
    let _q7898 = true;
    Q7899: {
      const _a7900 = sp.adj4[_at7896];
      for (let _i7901 = 0; _i7901 < _a7900.length; _i7901++) {
        const v_y = _a7900[_i7901];
        if (!(((g[sp.edgeOf(_at7896, v_y)] || -1) === 1))) continue;
        _g7902.length = 0;
        G7903: {
          const _a7906 = setOf(v_y);
          for (let _i7907 = 0; _i7907 < _a7906.length; _i7907++) {
            const v_x = _a7906[_i7907];
            const _h7908 = clueAt(cl.number, v_x);
            if (!((_h7908 !== -1))) continue;
            _g7902.push(v_x);
          }
        }
        _g7909.length = 0;
        G7910: {
          const _a7925 = throughWhere(sp, v_y, (_te7920: number): boolean => { let _c7922: boolean = ((g[_te7920] || -1) === 1); if (_c7922) {   const _t7921 = sp.edgeEnds[2 * _te7920];   _c7922 = !((clueAt(cl.number, _t7921) !== -1)); } let _c7924: boolean = _c7922; if (_c7924) {   const _t7923 = sp.edgeEnds[2 * _te7920 + 1];   _c7924 = !((clueAt(cl.number, _t7923) !== -1)); } return _c7924; });
          for (let _i7926 = 0; _i7926 < _a7925.length; _i7926++) {
            const v_t = _a7925[_i7926];
            const _h7929 = clueAt(cl.number, v_t);
            const _h7930 = (_h7929 !== -1);
            const _h7931 = _h7930;
            const _h7932 = !(_h7931);
            const _a7927 = sp.adj4[v_t];
            for (let _i7928 = 0; _i7928 < _a7927.length; _i7928++) {
              const v_x = _a7927[_i7928];
              const _h7933 = clueAt(cl.number, v_x);
              const _h7934 = (g[sp.edgeOf(v_t, v_x)] || -1);
              if (!(((_h7932 && (_h7933 !== -1)) && (_h7934 === 1)))) continue;
              if (!_g7909.includes(v_x)) _g7909.push(v_x);
            }
          }
        }
        const _a7935 = union(_g7902, _g7909);
        for (let _i7936 = 0; _i7936 < _a7935.length; _i7936++) {
          const v_q = _a7935[_i7936];
          if (!((v_q !== _at7896))) continue;
          const _h7938 = clueAt(cl.number, v_q);
          const _h7937 = clueAt(cl.number, _at7896);
          if (!((Math.abs((_h7937 - _h7938)) === cl.step))) {
            _q7898 = false;
            break Q7899;
          }
        }
      }
    }
    if (!(_q7898)) return false;
  }
  for (let _k7939 = 0; _k7939 < cl.wall.at.length; _k7939++) {
    const _at7940 = cl.wall.at[_k7939];
    if (!(((g[_at7940] || -1) === 2))) return false;
  }
  return true;
}

export interface ForcedBinding {
  c: number;
  n: number;
  U: readonly number[];
}

const forcedFacts: number[] = [];

export function forced(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ForcedBinding> | null): number {
  const facts = forcedFacts;
  let fired = 0;
  let changed = false;
  const _h310 = (cl.step === 0);
  const _a292 = sp.cells;
  for (let _i293 = 0; _i293 < _a292.length; _i293++) {
    const v_c = _a292[_i293];
    const _h334 = clueAt(cl.number, v_c);
    const _h335 = (_h334 !== -1);
    const _h336 = _h335;
    let _g305 = 0;
    G306: {
      const _a307 = setOf(v_c);
      for (let _i308 = 0; _i308 < _a307.length; _i308++) {
        const v_k = _a307[_i308];
        const _h309 = clueAt(cl.number, v_k);
        const _h317 = (_h309 + 1);
        let _c319: boolean = (_h309 !== -1);
        if (_c319) {
          let _c318: boolean = (_h310 || (_h309 === 1));
          if (!_c318) {
            let _g311 = 0;
            G312: {
              const _t313 = (_h309 + 1);
              const _a314 = cluesValued(cl.number, _t313);
              for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                const v_x = _a314[_i315];
                const _h316 = clueAt(cl.number, v_x);
                if (!((_h316 === _h317))) continue;
                _g311++;
              }
            }
            _c318 = (_g311 === 0);
          }
          _c319 = _c318;
        }
        if (!(_c319)) continue;
        _g305++;
      }
    }
    let _g320 = 0;
    G321: {
      const _a322 = sp.adj4[v_c];
      for (let _i323 = 0; _i323 < _a322.length; _i323++) {
        const v_y = _a322[_i323];
        if (!(((b.grid[sp.edgeOf(v_c, v_y)] || -1) === 1))) continue;
        _g320++;
      }
    }
    const v_n = ((2 - _g305) - _g320);
    L324: {
      const v_U = ways(b, sp, cl, v_c);
      const _h325 = v_U.length;
      if (!(((v_n < 0) || ((v_n > 0) && (_h325 <= v_n))))) break L324;
      facts.length = 0;
      changed = false;
      let _c347: boolean = ((v_n >= 0) && (_h325 === v_n));
      if (_c347) {
        let _q326 = true;
        Q327: {
          const _a328 = v_U;
          for (let _i329 = 0; _i329 < _a328.length; _i329++) {
            const v_i = _a328[_i329];
            const _a330 = v_U;
            const _n331 = _i329;
            for (let _i332 = 0; _i332 < _n331; _i332++) {
              const v_j = _a330[_i332];
              let _c346: boolean = !(throughWhere(sp, v_i, (_te333: number): boolean => {  return ((b.grid[_te333] || -1) === 1); }).includes(v_j));
              if (_c346) {
                let _c345: boolean = _h336;
                if (!_c345) {
                  let _q337 = true;
                  Q338: {
                    const _a339 = nearest(b, sp, cl, v_i);
                    for (let _i340 = 0; _i340 < _a339.length; _i340++) {
                      const v_p = _a339[_i340];
                      const _h343 = clueAt(cl.number, v_p);
                      const _a341 = nearest(b, sp, cl, v_j);
                      for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                        const v_q = _a341[_i342];
                        const _h344 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h343 - _h344)) === cl.step))) {
                          _q337 = false;
                          break Q338;
                        }
                      }
                    }
                  }
                  _c345 = _q337;
                }
                _c346 = _c345;
              }
              if (!(_c346)) {
                _q326 = false;
                break Q327;
              }
            }
          }
        }
        _c347 = _q326;
      }
      let _c353: boolean = _c347;
      if (_c353) {
        let _q348 = true;
        Q349: {
          const _a350 = v_U;
          for (let _i351 = 0; _i351 < _a350.length; _i351++) {
            const v_y = _a350[_i351];
            const _t352 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t352] !== 0)) { if (fire === null) { b.placeAt(_t352, 1); changed = true; } else facts.push(PLACE, _t352, 1); }
            if (!(true)) {
              _q348 = false;
              break Q349;
            }
          }
        }
        _c353 = _q348;
      }
      if (!(_c353)) return -1;
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

export function lineBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineBreaksBinding> | null): number {
  const _g1228: number[] = [];
  const _g1235: number[] = [];
  const _g1268: number[] = [];
  const _g1275: number[] = [];
  const _g1377: number[] = [];
  const _g1384: number[] = [];
  const _g1417: number[] = [];
  const _g1424: number[] = [];
  const _g1532: number[] = [];
  const _g1539: number[] = [];
  const _g1570: number[] = [];
  const _g1577: number[] = [];
  const _g1679: number[] = [];
  const _g1686: number[] = [];
  const _g1717: number[] = [];
  const _g1724: number[] = [];
  const facts = lineBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h1056 = (cl.step === 0);
  const _a1007 = sp.edges;
  for (let _i1008 = 0; _i1008 < _a1007.length; _i1008++) {
    const v_e = _a1007[_i1008];
    const v_a = sp.edgeEnds[2 * v_e];
    L1009: {
      const v_b = sp.edgeEnds[2 * v_e + 1];
      let _c1066: boolean = !((b.grid[sp.edgeOf(v_a, v_b)] !== 0));
      if (_c1066) {
        let _g1036 = 0;
        G1037: {
          const _a1038 = sp.adj4[v_a];
          for (let _i1039 = 0; _i1039 < _a1038.length; _i1039++) {
            const v_y = _a1038[_i1039];
            if (!(((b.grid[sp.edgeOf(v_a, v_y)] || -1) === 1))) continue;
            _g1036++;
          }
        }
        let _g1051 = 0;
        G1052: {
          const _a1053 = setOf(v_a);
          for (let _i1054 = 0; _i1054 < _a1053.length; _i1054++) {
            const v_k = _a1053[_i1054];
            const _h1055 = clueAt(cl.number, v_k);
            const _h1063 = (_h1055 + 1);
            let _c1065: boolean = (_h1055 !== -1);
            if (_c1065) {
              let _c1064: boolean = (_h1056 || (_h1055 === 1));
              if (!_c1064) {
                let _g1057 = 0;
                G1058: {
                  const _t1059 = (_h1055 + 1);
                  const _a1060 = cluesValued(cl.number, _t1059);
                  for (let _i1061 = 0; _i1061 < _a1060.length; _i1061++) {
                    const v_x = _a1060[_i1061];
                    const _h1062 = clueAt(cl.number, v_x);
                    if (!((_h1062 === _h1063))) continue;
                    _g1057++;
                  }
                }
                _c1064 = (_g1057 === 0);
              }
              _c1065 = _c1064;
            }
            if (!(_c1065)) continue;
            _g1051++;
          }
        }
        _c1066 = (_g1036 < (2 - _g1051));
      }
      let _c1122: boolean = _c1066;
      if (_c1122) {
        let _g1093 = 0;
        G1094: {
          const _a1095 = sp.adj4[v_b];
          for (let _i1096 = 0; _i1096 < _a1095.length; _i1096++) {
            const v_y = _a1095[_i1096];
            if (!(((b.grid[sp.edgeOf(v_b, v_y)] || -1) === 1))) continue;
            _g1093++;
          }
        }
        let _g1108 = 0;
        G1109: {
          const _a1110 = setOf(v_b);
          for (let _i1111 = 0; _i1111 < _a1110.length; _i1111++) {
            const v_k = _a1110[_i1111];
            const _h1112 = clueAt(cl.number, v_k);
            const _h1119 = (_h1112 + 1);
            let _c1121: boolean = (_h1112 !== -1);
            if (_c1121) {
              let _c1120: boolean = (_h1056 || (_h1112 === 1));
              if (!_c1120) {
                let _g1113 = 0;
                G1114: {
                  const _t1115 = (_h1112 + 1);
                  const _a1116 = cluesValued(cl.number, _t1115);
                  for (let _i1117 = 0; _i1117 < _a1116.length; _i1117++) {
                    const v_x = _a1116[_i1117];
                    const _h1118 = clueAt(cl.number, v_x);
                    if (!((_h1118 === _h1119))) continue;
                    _g1113++;
                  }
                }
                _c1120 = (_g1113 === 0);
              }
              _c1121 = _c1120;
            }
            if (!(_c1121)) continue;
            _g1108++;
          }
        }
        _c1122 = (_g1093 < (2 - _g1108));
      }
      let _c1131: boolean = _c1122;
      if (_c1131) {
        let _q1123 = true;
        Q1124: {
          const _a1125 = nearest(b, sp, cl, v_a);
          for (let _i1126 = 0; _i1126 < _a1125.length; _i1126++) {
            const v_p = _a1125[_i1126];
            const _h1129 = clueAt(cl.number, v_p);
            const _a1127 = nearest(b, sp, cl, v_b);
            for (let _i1128 = 0; _i1128 < _a1127.length; _i1128++) {
              const v_q = _a1127[_i1128];
              const _h1130 = clueAt(cl.number, v_q);
              if (!((Math.abs((_h1129 - _h1130)) === cl.step))) {
                _q1123 = false;
                break Q1124;
              }
            }
          }
        }
        _c1131 = _q1123;
      }
      let _c1763: boolean = (_c1131 && (_h1056 || !(throughWhere(sp, v_a, (_te1132: number): boolean => {  return ((b.grid[_te1132] || -1) === 1); }).includes(v_b))));
      if (_c1763) {
        let _c1762: boolean = (throughWhere(sp, v_a, (_te1133: number): boolean => {  return ((b.grid[_te1133] || -1) === 1); }).includes(v_b));
        if (!_c1762) {
          const _wc1134 = v_e;
          const _wd1135 = 1;
          let _q1136 = false;
          Q1137: {
            const _a1139 = throughWhere(sp, v_a, (_te1138: number): boolean => {  return ((_te1138 === _wc1134 ? _wd1135 : (b.grid[_te1138] || -1)) === 1); });
            for (let _i1140 = 0; _i1140 < _a1139.length; _i1140++) {
              const v_t = _a1139[_i1140];
              let _c1160: boolean = (((v_t === v_a) || (v_t === v_b)) || (v_t === v_b));
              if (!_c1160) {
                let _g1141 = 0;
                G1142: {
                  const _a1143 = sp.adj4[v_t];
                  for (let _i1144 = 0; _i1144 < _a1143.length; _i1144++) {
                    const v_y = _a1143[_i1144];
                    const _t1145 = sp.edgeOf(v_t, v_y);
                    if (!(((_t1145 === _wc1134 ? _wd1135 : (b.grid[_t1145] || -1)) === 1))) continue;
                    _g1141++;
                  }
                }
                let _g1146 = 0;
                G1147: {
                  const _a1148 = setOf(v_t);
                  for (let _i1149 = 0; _i1149 < _a1148.length; _i1149++) {
                    const v_k = _a1148[_i1149];
                    const _h1150 = clueAt(cl.number, v_k);
                    const _h1157 = (_h1150 + 1);
                    let _c1159: boolean = (_h1150 !== -1);
                    if (_c1159) {
                      let _c1158: boolean = (_h1056 || (_h1150 === 1));
                      if (!_c1158) {
                        let _g1151 = 0;
                        G1152: {
                          const _t1153 = (_h1150 + 1);
                          const _a1154 = cluesValued(cl.number, _t1153);
                          for (let _i1155 = 0; _i1155 < _a1154.length; _i1155++) {
                            const v_x = _a1154[_i1155];
                            const _h1156 = clueAt(cl.number, v_x);
                            if (!((_h1156 === _h1157))) continue;
                            _g1151++;
                          }
                        }
                        _c1158 = (_g1151 === 0);
                      }
                      _c1159 = _c1158;
                    }
                    if (!(_c1159)) continue;
                    _g1146++;
                  }
                }
                _c1160 = (_g1141 < (2 - _g1146));
              }
              if (!(_c1160)) continue;
              let _g1161 = 0;
              G1162: {
                const _a1163 = sp.adj4[v_t];
                for (let _i1164 = 0; _i1164 < _a1163.length; _i1164++) {
                  const v_y = _a1163[_i1164];
                  const _t1165 = sp.edgeOf(v_t, v_y);
                  if (!(((_t1165 === _wc1134 ? _wd1135 : (b.grid[_t1165] || -1)) === 1))) continue;
                  _g1161++;
                }
              }
              let _g1166 = 0;
              G1167: {
                const _a1168 = setOf(v_t);
                for (let _i1169 = 0; _i1169 < _a1168.length; _i1169++) {
                  const v_k = _a1168[_i1169];
                  const _h1170 = clueAt(cl.number, v_k);
                  const _h1177 = (_h1170 + 1);
                  let _c1179: boolean = (_h1170 !== -1);
                  if (_c1179) {
                    let _c1178: boolean = (_h1056 || (_h1170 === 1));
                    if (!_c1178) {
                      let _g1171 = 0;
                      G1172: {
                        const _t1173 = (_h1170 + 1);
                        const _a1174 = cluesValued(cl.number, _t1173);
                        for (let _i1175 = 0; _i1175 < _a1174.length; _i1175++) {
                          const v_x = _a1174[_i1175];
                          const _h1176 = clueAt(cl.number, v_x);
                          if (!((_h1176 === _h1177))) continue;
                          _g1171++;
                        }
                      }
                      _c1178 = (_g1171 === 0);
                    }
                    _c1179 = _c1178;
                  }
                  if (!(_c1179)) continue;
                  _g1166++;
                }
              }
              let _c1460: boolean = (_g1161 < (2 - _g1166));
              if (_c1460) {
                let _q1180 = false;
                Q1181: {
                  const _a1182 = sp.adj4[v_t];
                  for (let _i1183 = 0; _i1183 < _a1182.length; _i1183++) {
                    const v_y = _a1182[_i1183];
                    const _t1184 = sp.edgeOf(v_t, v_y);
                    let _c1204: boolean = !((_t1184 === _wc1134 ? true : (b.grid[_t1184] !== 0)));
                    if (_c1204) {
                      let _g1185 = 0;
                      G1186: {
                        const _a1187 = sp.adj4[v_t];
                        for (let _i1188 = 0; _i1188 < _a1187.length; _i1188++) {
                          const v_y = _a1187[_i1188];
                          const _t1189 = sp.edgeOf(v_t, v_y);
                          if (!(((_t1189 === _wc1134 ? _wd1135 : (b.grid[_t1189] || -1)) === 1))) continue;
                          _g1185++;
                        }
                      }
                      let _g1190 = 0;
                      G1191: {
                        const _a1192 = setOf(v_t);
                        for (let _i1193 = 0; _i1193 < _a1192.length; _i1193++) {
                          const v_k = _a1192[_i1193];
                          const _h1194 = clueAt(cl.number, v_k);
                          const _h1201 = (_h1194 + 1);
                          let _c1203: boolean = (_h1194 !== -1);
                          if (_c1203) {
                            let _c1202: boolean = (_h1056 || (_h1194 === 1));
                            if (!_c1202) {
                              let _g1195 = 0;
                              G1196: {
                                const _t1197 = (_h1194 + 1);
                                const _a1198 = cluesValued(cl.number, _t1197);
                                for (let _i1199 = 0; _i1199 < _a1198.length; _i1199++) {
                                  const v_x = _a1198[_i1199];
                                  const _h1200 = clueAt(cl.number, v_x);
                                  if (!((_h1200 === _h1201))) continue;
                                  _g1195++;
                                }
                              }
                              _c1202 = (_g1195 === 0);
                            }
                            _c1203 = _c1202;
                          }
                          if (!(_c1203)) continue;
                          _g1190++;
                        }
                      }
                      _c1204 = (_g1185 < (2 - _g1190));
                    }
                    let _c1225: boolean = _c1204;
                    if (_c1225) {
                      let _g1205 = 0;
                      G1206: {
                        const _a1208 = sp.adj4[v_y];
                        for (let _i1209 = 0; _i1209 < _a1208.length; _i1209++) {
                          const v_y_1207 = _a1208[_i1209];
                          const _t1210 = sp.edgeOf(v_y, v_y_1207);
                          if (!(((_t1210 === _wc1134 ? _wd1135 : (b.grid[_t1210] || -1)) === 1))) continue;
                          _g1205++;
                        }
                      }
                      let _g1211 = 0;
                      G1212: {
                        const _a1213 = setOf(v_y);
                        for (let _i1214 = 0; _i1214 < _a1213.length; _i1214++) {
                          const v_k = _a1213[_i1214];
                          const _h1215 = clueAt(cl.number, v_k);
                          const _h1222 = (_h1215 + 1);
                          let _c1224: boolean = (_h1215 !== -1);
                          if (_c1224) {
                            let _c1223: boolean = (_h1056 || (_h1215 === 1));
                            if (!_c1223) {
                              let _g1216 = 0;
                              G1217: {
                                const _t1218 = (_h1215 + 1);
                                const _a1219 = cluesValued(cl.number, _t1218);
                                for (let _i1220 = 0; _i1220 < _a1219.length; _i1220++) {
                                  const v_x = _a1219[_i1220];
                                  const _h1221 = clueAt(cl.number, v_x);
                                  if (!((_h1221 === _h1222))) continue;
                                  _g1216++;
                                }
                              }
                              _c1223 = (_g1216 === 0);
                            }
                            _c1224 = _c1223;
                          }
                          if (!(_c1224)) continue;
                          _g1211++;
                        }
                      }
                      _c1225 = (_g1205 < (2 - _g1211));
                    }
                    let _c1308: boolean = _c1225;
                    if (_c1308) {
                      let _q1226 = true;
                      Q1227: {
                        _g1228.length = 0;
                        G1229: {
                          const _a1232 = setOf(v_t);
                          for (let _i1233 = 0; _i1233 < _a1232.length; _i1233++) {
                            const v_x = _a1232[_i1233];
                            const _h1234 = clueAt(cl.number, v_x);
                            if (!((_h1234 !== -1))) continue;
                            _g1228.push(v_x);
                          }
                        }
                        _g1235.length = 0;
                        G1236: {
                          const _a1255 = throughWhere(sp, v_t, (_te1250: number): boolean => { let _c1252: boolean = ((_te1250 === _wc1134 ? _wd1135 : (b.grid[_te1250] || -1)) === 1); if (_c1252) {   const _t1251 = sp.edgeEnds[2 * _te1250];   _c1252 = !((clueAt(cl.number, _t1251) !== -1)); } let _c1254: boolean = _c1252; if (_c1254) {   const _t1253 = sp.edgeEnds[2 * _te1250 + 1];   _c1254 = !((clueAt(cl.number, _t1253) !== -1)); } return _c1254; });
                          for (let _i1256 = 0; _i1256 < _a1255.length; _i1256++) {
                            const v_t_1249 = _a1255[_i1256];
                            const _h1259 = clueAt(cl.number, v_t_1249);
                            const _h1260 = (_h1259 !== -1);
                            const _h1261 = _h1260;
                            const _h1262 = !(_h1261);
                            const _a1257 = sp.adj4[v_t_1249];
                            for (let _i1258 = 0; _i1258 < _a1257.length; _i1258++) {
                              const v_x = _a1257[_i1258];
                              const _h1263 = clueAt(cl.number, v_x);
                              let _c1265: boolean = (_h1262 && (_h1263 !== -1));
                              if (_c1265) {
                                const _t1264 = sp.edgeOf(v_t_1249, v_x);
                                _c1265 = ((_t1264 === _wc1134 ? _wd1135 : (b.grid[_t1264] || -1)) === 1);
                              }
                              if (!(_c1265)) continue;
                              if (!_g1235.includes(v_x)) _g1235.push(v_x);
                            }
                          }
                        }
                        const _a1266 = union(_g1228, _g1235);
                        for (let _i1267 = 0; _i1267 < _a1266.length; _i1267++) {
                          const v_p = _a1266[_i1267];
                          const _h1306 = clueAt(cl.number, v_p);
                          _g1268.length = 0;
                          G1269: {
                            const _a1272 = setOf(v_y);
                            for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
                              const v_x = _a1272[_i1273];
                              const _h1274 = clueAt(cl.number, v_x);
                              if (!((_h1274 !== -1))) continue;
                              _g1268.push(v_x);
                            }
                          }
                          _g1275.length = 0;
                          G1276: {
                            const _a1293 = throughWhere(sp, v_y, (_te1288: number): boolean => { let _c1290: boolean = ((_te1288 === _wc1134 ? _wd1135 : (b.grid[_te1288] || -1)) === 1); if (_c1290) {   const _t1289 = sp.edgeEnds[2 * _te1288];   _c1290 = !((clueAt(cl.number, _t1289) !== -1)); } let _c1292: boolean = _c1290; if (_c1292) {   const _t1291 = sp.edgeEnds[2 * _te1288 + 1];   _c1292 = !((clueAt(cl.number, _t1291) !== -1)); } return _c1292; });
                            for (let _i1294 = 0; _i1294 < _a1293.length; _i1294++) {
                              const v_t = _a1293[_i1294];
                              const _h1297 = clueAt(cl.number, v_t);
                              const _h1298 = (_h1297 !== -1);
                              const _h1299 = _h1298;
                              const _h1300 = !(_h1299);
                              const _a1295 = sp.adj4[v_t];
                              for (let _i1296 = 0; _i1296 < _a1295.length; _i1296++) {
                                const v_x = _a1295[_i1296];
                                const _h1301 = clueAt(cl.number, v_x);
                                let _c1303: boolean = (_h1300 && (_h1301 !== -1));
                                if (_c1303) {
                                  const _t1302 = sp.edgeOf(v_t, v_x);
                                  _c1303 = ((_t1302 === _wc1134 ? _wd1135 : (b.grid[_t1302] || -1)) === 1);
                                }
                                if (!(_c1303)) continue;
                                if (!_g1275.includes(v_x)) _g1275.push(v_x);
                              }
                            }
                          }
                          const _a1304 = union(_g1268, _g1275);
                          for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
                            const v_q = _a1304[_i1305];
                            const _h1307 = clueAt(cl.number, v_q);
                            if (!((Math.abs((_h1306 - _h1307)) === cl.step))) {
                              _q1226 = false;
                              break Q1227;
                            }
                          }
                        }
                      }
                      _c1308 = _q1226;
                    }
                    if (!((_c1308 && (_h1056 || !(throughWhere(sp, v_t, (_te1309: number): boolean => {  return ((_te1309 === _wc1134 ? _wd1135 : (b.grid[_te1309] || -1)) === 1); }).includes(v_y)))))) continue;
                    let _g1310 = 0;
                    G1311: {
                      const _a1312 = sp.adj4[v_t];
                      for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
                        const v_y = _a1312[_i1313];
                        const _t1314 = sp.edgeOf(v_t, v_y);
                        if (!(((_t1314 === _wc1134 ? _wd1135 : (b.grid[_t1314] || -1)) === 1))) continue;
                        _g1310++;
                      }
                    }
                    let _g1315 = 0;
                    G1316: {
                      const _a1317 = setOf(v_t);
                      for (let _i1318 = 0; _i1318 < _a1317.length; _i1318++) {
                        const v_k = _a1317[_i1318];
                        const _h1319 = clueAt(cl.number, v_k);
                        const _h1326 = (_h1319 + 1);
                        let _c1328: boolean = (_h1319 !== -1);
                        if (_c1328) {
                          let _c1327: boolean = (_h1056 || (_h1319 === 1));
                          if (!_c1327) {
                            let _g1320 = 0;
                            G1321: {
                              const _t1322 = (_h1319 + 1);
                              const _a1323 = cluesValued(cl.number, _t1322);
                              for (let _i1324 = 0; _i1324 < _a1323.length; _i1324++) {
                                const v_x = _a1323[_i1324];
                                const _h1325 = clueAt(cl.number, v_x);
                                if (!((_h1325 === _h1326))) continue;
                                _g1320++;
                              }
                            }
                            _c1327 = (_g1320 === 0);
                          }
                          _c1328 = _c1327;
                        }
                        if (!(_c1328)) continue;
                        _g1315++;
                      }
                    }
                    let _c1459: boolean = ((_g1310 + 1) === (2 - _g1315));
                    if (!_c1459) {
                      let _q1329 = false;
                      Q1330: {
                        const _a1331 = sp.adj4[v_t];
                        const _n1332 = _i1183;
                        for (let _i1333 = 0; _i1333 < _n1332; _i1333++) {
                          const v_z = _a1331[_i1333];
                          const _t1334 = sp.edgeOf(v_t, v_z);
                          let _c1354: boolean = !((_t1334 === _wc1134 ? true : (b.grid[_t1334] !== 0)));
                          if (_c1354) {
                            let _g1335 = 0;
                            G1336: {
                              const _a1337 = sp.adj4[v_t];
                              for (let _i1338 = 0; _i1338 < _a1337.length; _i1338++) {
                                const v_y = _a1337[_i1338];
                                const _t1339 = sp.edgeOf(v_t, v_y);
                                if (!(((_t1339 === _wc1134 ? _wd1135 : (b.grid[_t1339] || -1)) === 1))) continue;
                                _g1335++;
                              }
                            }
                            let _g1340 = 0;
                            G1341: {
                              const _a1342 = setOf(v_t);
                              for (let _i1343 = 0; _i1343 < _a1342.length; _i1343++) {
                                const v_k = _a1342[_i1343];
                                const _h1344 = clueAt(cl.number, v_k);
                                const _h1351 = (_h1344 + 1);
                                let _c1353: boolean = (_h1344 !== -1);
                                if (_c1353) {
                                  let _c1352: boolean = (_h1056 || (_h1344 === 1));
                                  if (!_c1352) {
                                    let _g1345 = 0;
                                    G1346: {
                                      const _t1347 = (_h1344 + 1);
                                      const _a1348 = cluesValued(cl.number, _t1347);
                                      for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
                                        const v_x = _a1348[_i1349];
                                        const _h1350 = clueAt(cl.number, v_x);
                                        if (!((_h1350 === _h1351))) continue;
                                        _g1345++;
                                      }
                                    }
                                    _c1352 = (_g1345 === 0);
                                  }
                                  _c1353 = _c1352;
                                }
                                if (!(_c1353)) continue;
                                _g1340++;
                              }
                            }
                            _c1354 = (_g1335 < (2 - _g1340));
                          }
                          let _c1374: boolean = _c1354;
                          if (_c1374) {
                            let _g1355 = 0;
                            G1356: {
                              const _a1357 = sp.adj4[v_z];
                              for (let _i1358 = 0; _i1358 < _a1357.length; _i1358++) {
                                const v_y = _a1357[_i1358];
                                const _t1359 = sp.edgeOf(v_z, v_y);
                                if (!(((_t1359 === _wc1134 ? _wd1135 : (b.grid[_t1359] || -1)) === 1))) continue;
                                _g1355++;
                              }
                            }
                            let _g1360 = 0;
                            G1361: {
                              const _a1362 = setOf(v_z);
                              for (let _i1363 = 0; _i1363 < _a1362.length; _i1363++) {
                                const v_k = _a1362[_i1363];
                                const _h1364 = clueAt(cl.number, v_k);
                                const _h1371 = (_h1364 + 1);
                                let _c1373: boolean = (_h1364 !== -1);
                                if (_c1373) {
                                  let _c1372: boolean = (_h1056 || (_h1364 === 1));
                                  if (!_c1372) {
                                    let _g1365 = 0;
                                    G1366: {
                                      const _t1367 = (_h1364 + 1);
                                      const _a1368 = cluesValued(cl.number, _t1367);
                                      for (let _i1369 = 0; _i1369 < _a1368.length; _i1369++) {
                                        const v_x = _a1368[_i1369];
                                        const _h1370 = clueAt(cl.number, v_x);
                                        if (!((_h1370 === _h1371))) continue;
                                        _g1365++;
                                      }
                                    }
                                    _c1372 = (_g1365 === 0);
                                  }
                                  _c1373 = _c1372;
                                }
                                if (!(_c1373)) continue;
                                _g1360++;
                              }
                            }
                            _c1374 = (_g1355 < (2 - _g1360));
                          }
                          let _c1457: boolean = _c1374;
                          if (_c1457) {
                            let _q1375 = true;
                            Q1376: {
                              _g1377.length = 0;
                              G1378: {
                                const _a1381 = setOf(v_t);
                                for (let _i1382 = 0; _i1382 < _a1381.length; _i1382++) {
                                  const v_x = _a1381[_i1382];
                                  const _h1383 = clueAt(cl.number, v_x);
                                  if (!((_h1383 !== -1))) continue;
                                  _g1377.push(v_x);
                                }
                              }
                              _g1384.length = 0;
                              G1385: {
                                const _a1404 = throughWhere(sp, v_t, (_te1399: number): boolean => { let _c1401: boolean = ((_te1399 === _wc1134 ? _wd1135 : (b.grid[_te1399] || -1)) === 1); if (_c1401) {   const _t1400 = sp.edgeEnds[2 * _te1399];   _c1401 = !((clueAt(cl.number, _t1400) !== -1)); } let _c1403: boolean = _c1401; if (_c1403) {   const _t1402 = sp.edgeEnds[2 * _te1399 + 1];   _c1403 = !((clueAt(cl.number, _t1402) !== -1)); } return _c1403; });
                                for (let _i1405 = 0; _i1405 < _a1404.length; _i1405++) {
                                  const v_t_1398 = _a1404[_i1405];
                                  const _h1408 = clueAt(cl.number, v_t_1398);
                                  const _h1409 = (_h1408 !== -1);
                                  const _h1410 = _h1409;
                                  const _h1411 = !(_h1410);
                                  const _a1406 = sp.adj4[v_t_1398];
                                  for (let _i1407 = 0; _i1407 < _a1406.length; _i1407++) {
                                    const v_x = _a1406[_i1407];
                                    const _h1412 = clueAt(cl.number, v_x);
                                    let _c1414: boolean = (_h1411 && (_h1412 !== -1));
                                    if (_c1414) {
                                      const _t1413 = sp.edgeOf(v_t_1398, v_x);
                                      _c1414 = ((_t1413 === _wc1134 ? _wd1135 : (b.grid[_t1413] || -1)) === 1);
                                    }
                                    if (!(_c1414)) continue;
                                    if (!_g1384.includes(v_x)) _g1384.push(v_x);
                                  }
                                }
                              }
                              const _a1415 = union(_g1377, _g1384);
                              for (let _i1416 = 0; _i1416 < _a1415.length; _i1416++) {
                                const v_p = _a1415[_i1416];
                                const _h1455 = clueAt(cl.number, v_p);
                                _g1417.length = 0;
                                G1418: {
                                  const _a1421 = setOf(v_z);
                                  for (let _i1422 = 0; _i1422 < _a1421.length; _i1422++) {
                                    const v_x = _a1421[_i1422];
                                    const _h1423 = clueAt(cl.number, v_x);
                                    if (!((_h1423 !== -1))) continue;
                                    _g1417.push(v_x);
                                  }
                                }
                                _g1424.length = 0;
                                G1425: {
                                  const _a1442 = throughWhere(sp, v_z, (_te1437: number): boolean => { let _c1439: boolean = ((_te1437 === _wc1134 ? _wd1135 : (b.grid[_te1437] || -1)) === 1); if (_c1439) {   const _t1438 = sp.edgeEnds[2 * _te1437];   _c1439 = !((clueAt(cl.number, _t1438) !== -1)); } let _c1441: boolean = _c1439; if (_c1441) {   const _t1440 = sp.edgeEnds[2 * _te1437 + 1];   _c1441 = !((clueAt(cl.number, _t1440) !== -1)); } return _c1441; });
                                  for (let _i1443 = 0; _i1443 < _a1442.length; _i1443++) {
                                    const v_t = _a1442[_i1443];
                                    const _h1446 = clueAt(cl.number, v_t);
                                    const _h1447 = (_h1446 !== -1);
                                    const _h1448 = _h1447;
                                    const _h1449 = !(_h1448);
                                    const _a1444 = sp.adj4[v_t];
                                    for (let _i1445 = 0; _i1445 < _a1444.length; _i1445++) {
                                      const v_x = _a1444[_i1445];
                                      const _h1450 = clueAt(cl.number, v_x);
                                      let _c1452: boolean = (_h1449 && (_h1450 !== -1));
                                      if (_c1452) {
                                        const _t1451 = sp.edgeOf(v_t, v_x);
                                        _c1452 = ((_t1451 === _wc1134 ? _wd1135 : (b.grid[_t1451] || -1)) === 1);
                                      }
                                      if (!(_c1452)) continue;
                                      if (!_g1424.includes(v_x)) _g1424.push(v_x);
                                    }
                                  }
                                }
                                const _a1453 = union(_g1417, _g1424);
                                for (let _i1454 = 0; _i1454 < _a1453.length; _i1454++) {
                                  const v_q = _a1453[_i1454];
                                  const _h1456 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1455 - _h1456)) === cl.step))) {
                                    _q1375 = false;
                                    break Q1376;
                                  }
                                }
                              }
                            }
                            _c1457 = _q1375;
                          }
                          if ((_c1457 && (_h1056 || !(throughWhere(sp, v_t, (_te1458: number): boolean => {  return ((_te1458 === _wc1134 ? _wd1135 : (b.grid[_te1458] || -1)) === 1); }).includes(v_z))))) {
                            _q1329 = true;
                            break Q1330;
                          }
                        }
                      }
                      _c1459 = _q1329;
                    }
                    if (_c1459) {
                      _q1180 = true;
                      break Q1181;
                    }
                  }
                }
                _c1460 = !(_q1180);
              }
              let _c1761: boolean = _c1460;
              if (!_c1761) {
                let _q1461 = false;
                Q1462: {
                  const _a1463 = sp.adj4[v_t];
                  for (let _i1464 = 0; _i1464 < _a1463.length; _i1464++) {
                    const v_s = _a1463[_i1464];
                    let _g1465 = 0;
                    G1466: {
                      const _a1467 = sp.adj4[v_s];
                      for (let _i1468 = 0; _i1468 < _a1467.length; _i1468++) {
                        const v_y = _a1467[_i1468];
                        const _t1469 = sp.edgeOf(v_s, v_y);
                        if (!(((_t1469 === _wc1134 ? _wd1135 : (b.grid[_t1469] || -1)) === 1))) continue;
                        _g1465++;
                      }
                    }
                    let _g1470 = 0;
                    G1471: {
                      const _a1472 = setOf(v_s);
                      for (let _i1473 = 0; _i1473 < _a1472.length; _i1473++) {
                        const v_k = _a1472[_i1473];
                        const _h1474 = clueAt(cl.number, v_k);
                        const _h1481 = (_h1474 + 1);
                        let _c1483: boolean = (_h1474 !== -1);
                        if (_c1483) {
                          let _c1482: boolean = (_h1056 || (_h1474 === 1));
                          if (!_c1482) {
                            let _g1475 = 0;
                            G1476: {
                              const _t1477 = (_h1474 + 1);
                              const _a1478 = cluesValued(cl.number, _t1477);
                              for (let _i1479 = 0; _i1479 < _a1478.length; _i1479++) {
                                const v_x = _a1478[_i1479];
                                const _h1480 = clueAt(cl.number, v_x);
                                if (!((_h1480 === _h1481))) continue;
                                _g1475++;
                              }
                            }
                            _c1482 = (_g1475 === 0);
                          }
                          _c1483 = _c1482;
                        }
                        if (!(_c1483)) continue;
                        _g1470++;
                      }
                    }
                    let _c1760: boolean = (_g1465 < (2 - _g1470));
                    if (_c1760) {
                      let _q1484 = false;
                      Q1485: {
                        const _a1486 = sp.adj4[v_s];
                        for (let _i1487 = 0; _i1487 < _a1486.length; _i1487++) {
                          const v_y = _a1486[_i1487];
                          const _t1488 = sp.edgeOf(v_s, v_y);
                          let _c1508: boolean = !((_t1488 === _wc1134 ? true : (b.grid[_t1488] !== 0)));
                          if (_c1508) {
                            let _g1489 = 0;
                            G1490: {
                              const _a1491 = sp.adj4[v_s];
                              for (let _i1492 = 0; _i1492 < _a1491.length; _i1492++) {
                                const v_y = _a1491[_i1492];
                                const _t1493 = sp.edgeOf(v_s, v_y);
                                if (!(((_t1493 === _wc1134 ? _wd1135 : (b.grid[_t1493] || -1)) === 1))) continue;
                                _g1489++;
                              }
                            }
                            let _g1494 = 0;
                            G1495: {
                              const _a1496 = setOf(v_s);
                              for (let _i1497 = 0; _i1497 < _a1496.length; _i1497++) {
                                const v_k = _a1496[_i1497];
                                const _h1498 = clueAt(cl.number, v_k);
                                const _h1505 = (_h1498 + 1);
                                let _c1507: boolean = (_h1498 !== -1);
                                if (_c1507) {
                                  let _c1506: boolean = (_h1056 || (_h1498 === 1));
                                  if (!_c1506) {
                                    let _g1499 = 0;
                                    G1500: {
                                      const _t1501 = (_h1498 + 1);
                                      const _a1502 = cluesValued(cl.number, _t1501);
                                      for (let _i1503 = 0; _i1503 < _a1502.length; _i1503++) {
                                        const v_x = _a1502[_i1503];
                                        const _h1504 = clueAt(cl.number, v_x);
                                        if (!((_h1504 === _h1505))) continue;
                                        _g1499++;
                                      }
                                    }
                                    _c1506 = (_g1499 === 0);
                                  }
                                  _c1507 = _c1506;
                                }
                                if (!(_c1507)) continue;
                                _g1494++;
                              }
                            }
                            _c1508 = (_g1489 < (2 - _g1494));
                          }
                          let _c1529: boolean = _c1508;
                          if (_c1529) {
                            let _g1509 = 0;
                            G1510: {
                              const _a1512 = sp.adj4[v_y];
                              for (let _i1513 = 0; _i1513 < _a1512.length; _i1513++) {
                                const v_y_1511 = _a1512[_i1513];
                                const _t1514 = sp.edgeOf(v_y, v_y_1511);
                                if (!(((_t1514 === _wc1134 ? _wd1135 : (b.grid[_t1514] || -1)) === 1))) continue;
                                _g1509++;
                              }
                            }
                            let _g1515 = 0;
                            G1516: {
                              const _a1517 = setOf(v_y);
                              for (let _i1518 = 0; _i1518 < _a1517.length; _i1518++) {
                                const v_k = _a1517[_i1518];
                                const _h1519 = clueAt(cl.number, v_k);
                                const _h1526 = (_h1519 + 1);
                                let _c1528: boolean = (_h1519 !== -1);
                                if (_c1528) {
                                  let _c1527: boolean = (_h1056 || (_h1519 === 1));
                                  if (!_c1527) {
                                    let _g1520 = 0;
                                    G1521: {
                                      const _t1522 = (_h1519 + 1);
                                      const _a1523 = cluesValued(cl.number, _t1522);
                                      for (let _i1524 = 0; _i1524 < _a1523.length; _i1524++) {
                                        const v_x = _a1523[_i1524];
                                        const _h1525 = clueAt(cl.number, v_x);
                                        if (!((_h1525 === _h1526))) continue;
                                        _g1520++;
                                      }
                                    }
                                    _c1527 = (_g1520 === 0);
                                  }
                                  _c1528 = _c1527;
                                }
                                if (!(_c1528)) continue;
                                _g1515++;
                              }
                            }
                            _c1529 = (_g1509 < (2 - _g1515));
                          }
                          let _c1610: boolean = _c1529;
                          if (_c1610) {
                            let _q1530 = true;
                            Q1531: {
                              _g1532.length = 0;
                              G1533: {
                                const _a1536 = setOf(v_s);
                                for (let _i1537 = 0; _i1537 < _a1536.length; _i1537++) {
                                  const v_x = _a1536[_i1537];
                                  const _h1538 = clueAt(cl.number, v_x);
                                  if (!((_h1538 !== -1))) continue;
                                  _g1532.push(v_x);
                                }
                              }
                              _g1539.length = 0;
                              G1540: {
                                const _a1557 = throughWhere(sp, v_s, (_te1552: number): boolean => { let _c1554: boolean = ((_te1552 === _wc1134 ? _wd1135 : (b.grid[_te1552] || -1)) === 1); if (_c1554) {   const _t1553 = sp.edgeEnds[2 * _te1552];   _c1554 = !((clueAt(cl.number, _t1553) !== -1)); } let _c1556: boolean = _c1554; if (_c1556) {   const _t1555 = sp.edgeEnds[2 * _te1552 + 1];   _c1556 = !((clueAt(cl.number, _t1555) !== -1)); } return _c1556; });
                                for (let _i1558 = 0; _i1558 < _a1557.length; _i1558++) {
                                  const v_t = _a1557[_i1558];
                                  const _h1561 = clueAt(cl.number, v_t);
                                  const _h1562 = (_h1561 !== -1);
                                  const _h1563 = _h1562;
                                  const _h1564 = !(_h1563);
                                  const _a1559 = sp.adj4[v_t];
                                  for (let _i1560 = 0; _i1560 < _a1559.length; _i1560++) {
                                    const v_x = _a1559[_i1560];
                                    const _h1565 = clueAt(cl.number, v_x);
                                    let _c1567: boolean = (_h1564 && (_h1565 !== -1));
                                    if (_c1567) {
                                      const _t1566 = sp.edgeOf(v_t, v_x);
                                      _c1567 = ((_t1566 === _wc1134 ? _wd1135 : (b.grid[_t1566] || -1)) === 1);
                                    }
                                    if (!(_c1567)) continue;
                                    if (!_g1539.includes(v_x)) _g1539.push(v_x);
                                  }
                                }
                              }
                              const _a1568 = union(_g1532, _g1539);
                              for (let _i1569 = 0; _i1569 < _a1568.length; _i1569++) {
                                const v_p = _a1568[_i1569];
                                const _h1608 = clueAt(cl.number, v_p);
                                _g1570.length = 0;
                                G1571: {
                                  const _a1574 = setOf(v_y);
                                  for (let _i1575 = 0; _i1575 < _a1574.length; _i1575++) {
                                    const v_x = _a1574[_i1575];
                                    const _h1576 = clueAt(cl.number, v_x);
                                    if (!((_h1576 !== -1))) continue;
                                    _g1570.push(v_x);
                                  }
                                }
                                _g1577.length = 0;
                                G1578: {
                                  const _a1595 = throughWhere(sp, v_y, (_te1590: number): boolean => { let _c1592: boolean = ((_te1590 === _wc1134 ? _wd1135 : (b.grid[_te1590] || -1)) === 1); if (_c1592) {   const _t1591 = sp.edgeEnds[2 * _te1590];   _c1592 = !((clueAt(cl.number, _t1591) !== -1)); } let _c1594: boolean = _c1592; if (_c1594) {   const _t1593 = sp.edgeEnds[2 * _te1590 + 1];   _c1594 = !((clueAt(cl.number, _t1593) !== -1)); } return _c1594; });
                                  for (let _i1596 = 0; _i1596 < _a1595.length; _i1596++) {
                                    const v_t = _a1595[_i1596];
                                    const _h1599 = clueAt(cl.number, v_t);
                                    const _h1600 = (_h1599 !== -1);
                                    const _h1601 = _h1600;
                                    const _h1602 = !(_h1601);
                                    const _a1597 = sp.adj4[v_t];
                                    for (let _i1598 = 0; _i1598 < _a1597.length; _i1598++) {
                                      const v_x = _a1597[_i1598];
                                      const _h1603 = clueAt(cl.number, v_x);
                                      let _c1605: boolean = (_h1602 && (_h1603 !== -1));
                                      if (_c1605) {
                                        const _t1604 = sp.edgeOf(v_t, v_x);
                                        _c1605 = ((_t1604 === _wc1134 ? _wd1135 : (b.grid[_t1604] || -1)) === 1);
                                      }
                                      if (!(_c1605)) continue;
                                      if (!_g1577.includes(v_x)) _g1577.push(v_x);
                                    }
                                  }
                                }
                                const _a1606 = union(_g1570, _g1577);
                                for (let _i1607 = 0; _i1607 < _a1606.length; _i1607++) {
                                  const v_q = _a1606[_i1607];
                                  const _h1609 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h1608 - _h1609)) === cl.step))) {
                                    _q1530 = false;
                                    break Q1531;
                                  }
                                }
                              }
                            }
                            _c1610 = _q1530;
                          }
                          if (!((_c1610 && (_h1056 || !(throughWhere(sp, v_s, (_te1611: number): boolean => {  return ((_te1611 === _wc1134 ? _wd1135 : (b.grid[_te1611] || -1)) === 1); }).includes(v_y)))))) continue;
                          let _g1612 = 0;
                          G1613: {
                            const _a1614 = sp.adj4[v_s];
                            for (let _i1615 = 0; _i1615 < _a1614.length; _i1615++) {
                              const v_y = _a1614[_i1615];
                              const _t1616 = sp.edgeOf(v_s, v_y);
                              if (!(((_t1616 === _wc1134 ? _wd1135 : (b.grid[_t1616] || -1)) === 1))) continue;
                              _g1612++;
                            }
                          }
                          let _g1617 = 0;
                          G1618: {
                            const _a1619 = setOf(v_s);
                            for (let _i1620 = 0; _i1620 < _a1619.length; _i1620++) {
                              const v_k = _a1619[_i1620];
                              const _h1621 = clueAt(cl.number, v_k);
                              const _h1628 = (_h1621 + 1);
                              let _c1630: boolean = (_h1621 !== -1);
                              if (_c1630) {
                                let _c1629: boolean = (_h1056 || (_h1621 === 1));
                                if (!_c1629) {
                                  let _g1622 = 0;
                                  G1623: {
                                    const _t1624 = (_h1621 + 1);
                                    const _a1625 = cluesValued(cl.number, _t1624);
                                    for (let _i1626 = 0; _i1626 < _a1625.length; _i1626++) {
                                      const v_x = _a1625[_i1626];
                                      const _h1627 = clueAt(cl.number, v_x);
                                      if (!((_h1627 === _h1628))) continue;
                                      _g1622++;
                                    }
                                  }
                                  _c1629 = (_g1622 === 0);
                                }
                                _c1630 = _c1629;
                              }
                              if (!(_c1630)) continue;
                              _g1617++;
                            }
                          }
                          let _c1759: boolean = ((_g1612 + 1) === (2 - _g1617));
                          if (!_c1759) {
                            let _q1631 = false;
                            Q1632: {
                              const _a1633 = sp.adj4[v_s];
                              const _n1634 = _i1487;
                              for (let _i1635 = 0; _i1635 < _n1634; _i1635++) {
                                const v_z = _a1633[_i1635];
                                const _t1636 = sp.edgeOf(v_s, v_z);
                                let _c1656: boolean = !((_t1636 === _wc1134 ? true : (b.grid[_t1636] !== 0)));
                                if (_c1656) {
                                  let _g1637 = 0;
                                  G1638: {
                                    const _a1639 = sp.adj4[v_s];
                                    for (let _i1640 = 0; _i1640 < _a1639.length; _i1640++) {
                                      const v_y = _a1639[_i1640];
                                      const _t1641 = sp.edgeOf(v_s, v_y);
                                      if (!(((_t1641 === _wc1134 ? _wd1135 : (b.grid[_t1641] || -1)) === 1))) continue;
                                      _g1637++;
                                    }
                                  }
                                  let _g1642 = 0;
                                  G1643: {
                                    const _a1644 = setOf(v_s);
                                    for (let _i1645 = 0; _i1645 < _a1644.length; _i1645++) {
                                      const v_k = _a1644[_i1645];
                                      const _h1646 = clueAt(cl.number, v_k);
                                      const _h1653 = (_h1646 + 1);
                                      let _c1655: boolean = (_h1646 !== -1);
                                      if (_c1655) {
                                        let _c1654: boolean = (_h1056 || (_h1646 === 1));
                                        if (!_c1654) {
                                          let _g1647 = 0;
                                          G1648: {
                                            const _t1649 = (_h1646 + 1);
                                            const _a1650 = cluesValued(cl.number, _t1649);
                                            for (let _i1651 = 0; _i1651 < _a1650.length; _i1651++) {
                                              const v_x = _a1650[_i1651];
                                              const _h1652 = clueAt(cl.number, v_x);
                                              if (!((_h1652 === _h1653))) continue;
                                              _g1647++;
                                            }
                                          }
                                          _c1654 = (_g1647 === 0);
                                        }
                                        _c1655 = _c1654;
                                      }
                                      if (!(_c1655)) continue;
                                      _g1642++;
                                    }
                                  }
                                  _c1656 = (_g1637 < (2 - _g1642));
                                }
                                let _c1676: boolean = _c1656;
                                if (_c1676) {
                                  let _g1657 = 0;
                                  G1658: {
                                    const _a1659 = sp.adj4[v_z];
                                    for (let _i1660 = 0; _i1660 < _a1659.length; _i1660++) {
                                      const v_y = _a1659[_i1660];
                                      const _t1661 = sp.edgeOf(v_z, v_y);
                                      if (!(((_t1661 === _wc1134 ? _wd1135 : (b.grid[_t1661] || -1)) === 1))) continue;
                                      _g1657++;
                                    }
                                  }
                                  let _g1662 = 0;
                                  G1663: {
                                    const _a1664 = setOf(v_z);
                                    for (let _i1665 = 0; _i1665 < _a1664.length; _i1665++) {
                                      const v_k = _a1664[_i1665];
                                      const _h1666 = clueAt(cl.number, v_k);
                                      const _h1673 = (_h1666 + 1);
                                      let _c1675: boolean = (_h1666 !== -1);
                                      if (_c1675) {
                                        let _c1674: boolean = (_h1056 || (_h1666 === 1));
                                        if (!_c1674) {
                                          let _g1667 = 0;
                                          G1668: {
                                            const _t1669 = (_h1666 + 1);
                                            const _a1670 = cluesValued(cl.number, _t1669);
                                            for (let _i1671 = 0; _i1671 < _a1670.length; _i1671++) {
                                              const v_x = _a1670[_i1671];
                                              const _h1672 = clueAt(cl.number, v_x);
                                              if (!((_h1672 === _h1673))) continue;
                                              _g1667++;
                                            }
                                          }
                                          _c1674 = (_g1667 === 0);
                                        }
                                        _c1675 = _c1674;
                                      }
                                      if (!(_c1675)) continue;
                                      _g1662++;
                                    }
                                  }
                                  _c1676 = (_g1657 < (2 - _g1662));
                                }
                                let _c1757: boolean = _c1676;
                                if (_c1757) {
                                  let _q1677 = true;
                                  Q1678: {
                                    _g1679.length = 0;
                                    G1680: {
                                      const _a1683 = setOf(v_s);
                                      for (let _i1684 = 0; _i1684 < _a1683.length; _i1684++) {
                                        const v_x = _a1683[_i1684];
                                        const _h1685 = clueAt(cl.number, v_x);
                                        if (!((_h1685 !== -1))) continue;
                                        _g1679.push(v_x);
                                      }
                                    }
                                    _g1686.length = 0;
                                    G1687: {
                                      const _a1704 = throughWhere(sp, v_s, (_te1699: number): boolean => { let _c1701: boolean = ((_te1699 === _wc1134 ? _wd1135 : (b.grid[_te1699] || -1)) === 1); if (_c1701) {   const _t1700 = sp.edgeEnds[2 * _te1699];   _c1701 = !((clueAt(cl.number, _t1700) !== -1)); } let _c1703: boolean = _c1701; if (_c1703) {   const _t1702 = sp.edgeEnds[2 * _te1699 + 1];   _c1703 = !((clueAt(cl.number, _t1702) !== -1)); } return _c1703; });
                                      for (let _i1705 = 0; _i1705 < _a1704.length; _i1705++) {
                                        const v_t = _a1704[_i1705];
                                        const _h1708 = clueAt(cl.number, v_t);
                                        const _h1709 = (_h1708 !== -1);
                                        const _h1710 = _h1709;
                                        const _h1711 = !(_h1710);
                                        const _a1706 = sp.adj4[v_t];
                                        for (let _i1707 = 0; _i1707 < _a1706.length; _i1707++) {
                                          const v_x = _a1706[_i1707];
                                          const _h1712 = clueAt(cl.number, v_x);
                                          let _c1714: boolean = (_h1711 && (_h1712 !== -1));
                                          if (_c1714) {
                                            const _t1713 = sp.edgeOf(v_t, v_x);
                                            _c1714 = ((_t1713 === _wc1134 ? _wd1135 : (b.grid[_t1713] || -1)) === 1);
                                          }
                                          if (!(_c1714)) continue;
                                          if (!_g1686.includes(v_x)) _g1686.push(v_x);
                                        }
                                      }
                                    }
                                    const _a1715 = union(_g1679, _g1686);
                                    for (let _i1716 = 0; _i1716 < _a1715.length; _i1716++) {
                                      const v_p = _a1715[_i1716];
                                      const _h1755 = clueAt(cl.number, v_p);
                                      _g1717.length = 0;
                                      G1718: {
                                        const _a1721 = setOf(v_z);
                                        for (let _i1722 = 0; _i1722 < _a1721.length; _i1722++) {
                                          const v_x = _a1721[_i1722];
                                          const _h1723 = clueAt(cl.number, v_x);
                                          if (!((_h1723 !== -1))) continue;
                                          _g1717.push(v_x);
                                        }
                                      }
                                      _g1724.length = 0;
                                      G1725: {
                                        const _a1742 = throughWhere(sp, v_z, (_te1737: number): boolean => { let _c1739: boolean = ((_te1737 === _wc1134 ? _wd1135 : (b.grid[_te1737] || -1)) === 1); if (_c1739) {   const _t1738 = sp.edgeEnds[2 * _te1737];   _c1739 = !((clueAt(cl.number, _t1738) !== -1)); } let _c1741: boolean = _c1739; if (_c1741) {   const _t1740 = sp.edgeEnds[2 * _te1737 + 1];   _c1741 = !((clueAt(cl.number, _t1740) !== -1)); } return _c1741; });
                                        for (let _i1743 = 0; _i1743 < _a1742.length; _i1743++) {
                                          const v_t = _a1742[_i1743];
                                          const _h1746 = clueAt(cl.number, v_t);
                                          const _h1747 = (_h1746 !== -1);
                                          const _h1748 = _h1747;
                                          const _h1749 = !(_h1748);
                                          const _a1744 = sp.adj4[v_t];
                                          for (let _i1745 = 0; _i1745 < _a1744.length; _i1745++) {
                                            const v_x = _a1744[_i1745];
                                            const _h1750 = clueAt(cl.number, v_x);
                                            let _c1752: boolean = (_h1749 && (_h1750 !== -1));
                                            if (_c1752) {
                                              const _t1751 = sp.edgeOf(v_t, v_x);
                                              _c1752 = ((_t1751 === _wc1134 ? _wd1135 : (b.grid[_t1751] || -1)) === 1);
                                            }
                                            if (!(_c1752)) continue;
                                            if (!_g1724.includes(v_x)) _g1724.push(v_x);
                                          }
                                        }
                                      }
                                      const _a1753 = union(_g1717, _g1724);
                                      for (let _i1754 = 0; _i1754 < _a1753.length; _i1754++) {
                                        const v_q = _a1753[_i1754];
                                        const _h1756 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h1755 - _h1756)) === cl.step))) {
                                          _q1677 = false;
                                          break Q1678;
                                        }
                                      }
                                    }
                                  }
                                  _c1757 = _q1677;
                                }
                                if ((_c1757 && (_h1056 || !(throughWhere(sp, v_s, (_te1758: number): boolean => {  return ((_te1758 === _wc1134 ? _wd1135 : (b.grid[_te1758] || -1)) === 1); }).includes(v_z))))) {
                                  _q1631 = true;
                                  break Q1632;
                                }
                              }
                            }
                            _c1759 = _q1631;
                          }
                          if (_c1759) {
                            _q1484 = true;
                            break Q1485;
                          }
                        }
                      }
                      _c1760 = !(_q1484);
                    }
                    if (_c1760) {
                      _q1461 = true;
                      break Q1462;
                    }
                  }
                }
                _c1761 = _q1461;
              }
              if (_c1761) {
                _q1136 = true;
                break Q1137;
              }
            }
          }
          _c1762 = _q1136;
        }
        _c1763 = _c1762;
      }
      if (!(_c1763)) break L1009;
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

export function pairBreaks(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBreaksBinding> | null): number {
  const _g2490: number[] = [];
  const _g2497: number[] = [];
  const _g2530: number[] = [];
  const _g2537: number[] = [];
  const _g2639: number[] = [];
  const _g2646: number[] = [];
  const _g2679: number[] = [];
  const _g2686: number[] = [];
  const _g2794: number[] = [];
  const _g2801: number[] = [];
  const _g2832: number[] = [];
  const _g2839: number[] = [];
  const _g2941: number[] = [];
  const _g2948: number[] = [];
  const _g2979: number[] = [];
  const _g2986: number[] = [];
  const facts = pairBreaksFacts;
  let fired = 0;
  let changed = false;
  const _h2360 = (cl.step === 0);
  const _a2342 = sp.cells;
  for (let _i2343 = 0; _i2343 < _a2342.length; _i2343++) {
    const v_c = _a2342[_i2343];
    let _g2355 = 0;
    G2356: {
      const _a2357 = setOf(v_c);
      for (let _i2358 = 0; _i2358 < _a2357.length; _i2358++) {
        const v_k = _a2357[_i2358];
        const _h2359 = clueAt(cl.number, v_k);
        const _h2367 = (_h2359 + 1);
        let _c2369: boolean = (_h2359 !== -1);
        if (_c2369) {
          let _c2368: boolean = (_h2360 || (_h2359 === 1));
          if (!_c2368) {
            let _g2361 = 0;
            G2362: {
              const _t2363 = (_h2359 + 1);
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
        _g2355++;
      }
    }
    let _g2370 = 0;
    G2371: {
      const _a2372 = sp.adj4[v_c];
      for (let _i2373 = 0; _i2373 < _a2372.length; _i2373++) {
        const v_y = _a2372[_i2373];
        if (!(((b.grid[sp.edgeOf(v_c, v_y)] || -1) === 1))) continue;
        _g2370++;
      }
    }
    if (!((((2 - _g2355) - _g2370) === 2))) continue;
    const _h2380 = clueAt(cl.number, v_c);
    const _h2381 = (_h2380 !== -1);
    const _h2382 = _h2381;
    const _h2383 = !(_h2382);
    L2374: {
      const v_U = ways(b, sp, cl, v_c);
      const _h2375 = v_U.length;
      if (!((_h2375 === 3))) break L2374;
      const _a2376 = v_U;
      for (let _i2377 = 0; _i2377 < _a2376.length; _i2377++) {
        const v_k = _a2376[_i2377];
        const v_I = minus(v_U, setOf(v_k));
        const v_i = (v_I[0] ?? -1);
        L2378: {
          const v_j = (v_I[1] ?? -1);
          let _c3025: boolean = ((!((b.grid[sp.edgeOf(v_c, v_k)] !== 0)) && !((b.grid[sp.edgeOf(v_c, v_i)] !== 0))) && !((b.grid[sp.edgeOf(v_c, v_j)] !== 0)));
          if (_c3025) {
            let _c2393: boolean = (throughWhere(sp, v_i, (_te2379: number): boolean => {  return ((b.grid[_te2379] || -1) === 1); }).includes(v_j));
            if (!_c2393) {
              let _c2392: boolean = _h2383;
              if (_c2392) {
                let _q2384 = true;
                Q2385: {
                  const _a2386 = nearest(b, sp, cl, v_i);
                  for (let _i2387 = 0; _i2387 < _a2386.length; _i2387++) {
                    const v_p = _a2386[_i2387];
                    const _h2390 = clueAt(cl.number, v_p);
                    const _a2388 = nearest(b, sp, cl, v_j);
                    for (let _i2389 = 0; _i2389 < _a2388.length; _i2389++) {
                      const v_q = _a2388[_i2389];
                      const _h2391 = clueAt(cl.number, v_q);
                      if (!((Math.abs((_h2390 - _h2391)) === cl.step))) {
                        _q2384 = false;
                        break Q2385;
                      }
                    }
                  }
                }
                _c2392 = !(_q2384);
              }
              _c2393 = _c2392;
            }
            let _c3024: boolean = _c2393;
            if (!_c3024) {
              const _wc2394 = sp.edgeOf(v_c, v_i);
              const _wd2395 = 1;
              const _wc2396 = sp.edgeOf(v_c, v_j);
              const _wd2397 = 1;
              let _q2398 = false;
              Q2399: {
                const _a2401 = throughWhere(sp, v_c, (_te2400: number): boolean => {  return ((_te2400 === _wc2396 ? _wd2397 : (_te2400 === _wc2394 ? _wd2395 : (b.grid[_te2400] || -1))) === 1); });
                for (let _i2402 = 0; _i2402 < _a2401.length; _i2402++) {
                  const v_t = _a2401[_i2402];
                  let _c2422: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                  if (!_c2422) {
                    let _g2403 = 0;
                    G2404: {
                      const _a2405 = sp.adj4[v_t];
                      for (let _i2406 = 0; _i2406 < _a2405.length; _i2406++) {
                        const v_y = _a2405[_i2406];
                        const _t2407 = sp.edgeOf(v_t, v_y);
                        if (!(((_t2407 === _wc2396 ? _wd2397 : (_t2407 === _wc2394 ? _wd2395 : (b.grid[_t2407] || -1))) === 1))) continue;
                        _g2403++;
                      }
                    }
                    let _g2408 = 0;
                    G2409: {
                      const _a2410 = setOf(v_t);
                      for (let _i2411 = 0; _i2411 < _a2410.length; _i2411++) {
                        const v_k = _a2410[_i2411];
                        const _h2412 = clueAt(cl.number, v_k);
                        const _h2419 = (_h2412 + 1);
                        let _c2421: boolean = (_h2412 !== -1);
                        if (_c2421) {
                          let _c2420: boolean = (_h2360 || (_h2412 === 1));
                          if (!_c2420) {
                            let _g2413 = 0;
                            G2414: {
                              const _t2415 = (_h2412 + 1);
                              const _a2416 = cluesValued(cl.number, _t2415);
                              for (let _i2417 = 0; _i2417 < _a2416.length; _i2417++) {
                                const v_x = _a2416[_i2417];
                                const _h2418 = clueAt(cl.number, v_x);
                                if (!((_h2418 === _h2419))) continue;
                                _g2413++;
                              }
                            }
                            _c2420 = (_g2413 === 0);
                          }
                          _c2421 = _c2420;
                        }
                        if (!(_c2421)) continue;
                        _g2408++;
                      }
                    }
                    _c2422 = (_g2403 < (2 - _g2408));
                  }
                  if (!(_c2422)) continue;
                  let _g2423 = 0;
                  G2424: {
                    const _a2425 = sp.adj4[v_t];
                    for (let _i2426 = 0; _i2426 < _a2425.length; _i2426++) {
                      const v_y = _a2425[_i2426];
                      const _t2427 = sp.edgeOf(v_t, v_y);
                      if (!(((_t2427 === _wc2396 ? _wd2397 : (_t2427 === _wc2394 ? _wd2395 : (b.grid[_t2427] || -1))) === 1))) continue;
                      _g2423++;
                    }
                  }
                  let _g2428 = 0;
                  G2429: {
                    const _a2430 = setOf(v_t);
                    for (let _i2431 = 0; _i2431 < _a2430.length; _i2431++) {
                      const v_k = _a2430[_i2431];
                      const _h2432 = clueAt(cl.number, v_k);
                      const _h2439 = (_h2432 + 1);
                      let _c2441: boolean = (_h2432 !== -1);
                      if (_c2441) {
                        let _c2440: boolean = (_h2360 || (_h2432 === 1));
                        if (!_c2440) {
                          let _g2433 = 0;
                          G2434: {
                            const _t2435 = (_h2432 + 1);
                            const _a2436 = cluesValued(cl.number, _t2435);
                            for (let _i2437 = 0; _i2437 < _a2436.length; _i2437++) {
                              const v_x = _a2436[_i2437];
                              const _h2438 = clueAt(cl.number, v_x);
                              if (!((_h2438 === _h2439))) continue;
                              _g2433++;
                            }
                          }
                          _c2440 = (_g2433 === 0);
                        }
                        _c2441 = _c2440;
                      }
                      if (!(_c2441)) continue;
                      _g2428++;
                    }
                  }
                  let _c2722: boolean = (_g2423 < (2 - _g2428));
                  if (_c2722) {
                    let _q2442 = false;
                    Q2443: {
                      const _a2444 = sp.adj4[v_t];
                      for (let _i2445 = 0; _i2445 < _a2444.length; _i2445++) {
                        const v_y = _a2444[_i2445];
                        const _t2446 = sp.edgeOf(v_t, v_y);
                        let _c2466: boolean = !((_t2446 === _wc2396 ? true : (_t2446 === _wc2394 ? true : (b.grid[_t2446] !== 0))));
                        if (_c2466) {
                          let _g2447 = 0;
                          G2448: {
                            const _a2449 = sp.adj4[v_t];
                            for (let _i2450 = 0; _i2450 < _a2449.length; _i2450++) {
                              const v_y = _a2449[_i2450];
                              const _t2451 = sp.edgeOf(v_t, v_y);
                              if (!(((_t2451 === _wc2396 ? _wd2397 : (_t2451 === _wc2394 ? _wd2395 : (b.grid[_t2451] || -1))) === 1))) continue;
                              _g2447++;
                            }
                          }
                          let _g2452 = 0;
                          G2453: {
                            const _a2454 = setOf(v_t);
                            for (let _i2455 = 0; _i2455 < _a2454.length; _i2455++) {
                              const v_k = _a2454[_i2455];
                              const _h2456 = clueAt(cl.number, v_k);
                              const _h2463 = (_h2456 + 1);
                              let _c2465: boolean = (_h2456 !== -1);
                              if (_c2465) {
                                let _c2464: boolean = (_h2360 || (_h2456 === 1));
                                if (!_c2464) {
                                  let _g2457 = 0;
                                  G2458: {
                                    const _t2459 = (_h2456 + 1);
                                    const _a2460 = cluesValued(cl.number, _t2459);
                                    for (let _i2461 = 0; _i2461 < _a2460.length; _i2461++) {
                                      const v_x = _a2460[_i2461];
                                      const _h2462 = clueAt(cl.number, v_x);
                                      if (!((_h2462 === _h2463))) continue;
                                      _g2457++;
                                    }
                                  }
                                  _c2464 = (_g2457 === 0);
                                }
                                _c2465 = _c2464;
                              }
                              if (!(_c2465)) continue;
                              _g2452++;
                            }
                          }
                          _c2466 = (_g2447 < (2 - _g2452));
                        }
                        let _c2487: boolean = _c2466;
                        if (_c2487) {
                          let _g2467 = 0;
                          G2468: {
                            const _a2470 = sp.adj4[v_y];
                            for (let _i2471 = 0; _i2471 < _a2470.length; _i2471++) {
                              const v_y_2469 = _a2470[_i2471];
                              const _t2472 = sp.edgeOf(v_y, v_y_2469);
                              if (!(((_t2472 === _wc2396 ? _wd2397 : (_t2472 === _wc2394 ? _wd2395 : (b.grid[_t2472] || -1))) === 1))) continue;
                              _g2467++;
                            }
                          }
                          let _g2473 = 0;
                          G2474: {
                            const _a2475 = setOf(v_y);
                            for (let _i2476 = 0; _i2476 < _a2475.length; _i2476++) {
                              const v_k = _a2475[_i2476];
                              const _h2477 = clueAt(cl.number, v_k);
                              const _h2484 = (_h2477 + 1);
                              let _c2486: boolean = (_h2477 !== -1);
                              if (_c2486) {
                                let _c2485: boolean = (_h2360 || (_h2477 === 1));
                                if (!_c2485) {
                                  let _g2478 = 0;
                                  G2479: {
                                    const _t2480 = (_h2477 + 1);
                                    const _a2481 = cluesValued(cl.number, _t2480);
                                    for (let _i2482 = 0; _i2482 < _a2481.length; _i2482++) {
                                      const v_x = _a2481[_i2482];
                                      const _h2483 = clueAt(cl.number, v_x);
                                      if (!((_h2483 === _h2484))) continue;
                                      _g2478++;
                                    }
                                  }
                                  _c2485 = (_g2478 === 0);
                                }
                                _c2486 = _c2485;
                              }
                              if (!(_c2486)) continue;
                              _g2473++;
                            }
                          }
                          _c2487 = (_g2467 < (2 - _g2473));
                        }
                        let _c2570: boolean = _c2487;
                        if (_c2570) {
                          let _q2488 = true;
                          Q2489: {
                            _g2490.length = 0;
                            G2491: {
                              const _a2494 = setOf(v_t);
                              for (let _i2495 = 0; _i2495 < _a2494.length; _i2495++) {
                                const v_x = _a2494[_i2495];
                                const _h2496 = clueAt(cl.number, v_x);
                                if (!((_h2496 !== -1))) continue;
                                _g2490.push(v_x);
                              }
                            }
                            _g2497.length = 0;
                            G2498: {
                              const _a2517 = throughWhere(sp, v_t, (_te2512: number): boolean => { let _c2514: boolean = ((_te2512 === _wc2396 ? _wd2397 : (_te2512 === _wc2394 ? _wd2395 : (b.grid[_te2512] || -1))) === 1); if (_c2514) {   const _t2513 = sp.edgeEnds[2 * _te2512];   _c2514 = !((clueAt(cl.number, _t2513) !== -1)); } let _c2516: boolean = _c2514; if (_c2516) {   const _t2515 = sp.edgeEnds[2 * _te2512 + 1];   _c2516 = !((clueAt(cl.number, _t2515) !== -1)); } return _c2516; });
                              for (let _i2518 = 0; _i2518 < _a2517.length; _i2518++) {
                                const v_t_2511 = _a2517[_i2518];
                                const _h2521 = clueAt(cl.number, v_t_2511);
                                const _h2522 = (_h2521 !== -1);
                                const _h2523 = _h2522;
                                const _h2524 = !(_h2523);
                                const _a2519 = sp.adj4[v_t_2511];
                                for (let _i2520 = 0; _i2520 < _a2519.length; _i2520++) {
                                  const v_x = _a2519[_i2520];
                                  const _h2525 = clueAt(cl.number, v_x);
                                  let _c2527: boolean = (_h2524 && (_h2525 !== -1));
                                  if (_c2527) {
                                    const _t2526 = sp.edgeOf(v_t_2511, v_x);
                                    _c2527 = ((_t2526 === _wc2396 ? _wd2397 : (_t2526 === _wc2394 ? _wd2395 : (b.grid[_t2526] || -1))) === 1);
                                  }
                                  if (!(_c2527)) continue;
                                  if (!_g2497.includes(v_x)) _g2497.push(v_x);
                                }
                              }
                            }
                            const _a2528 = union(_g2490, _g2497);
                            for (let _i2529 = 0; _i2529 < _a2528.length; _i2529++) {
                              const v_p = _a2528[_i2529];
                              const _h2568 = clueAt(cl.number, v_p);
                              _g2530.length = 0;
                              G2531: {
                                const _a2534 = setOf(v_y);
                                for (let _i2535 = 0; _i2535 < _a2534.length; _i2535++) {
                                  const v_x = _a2534[_i2535];
                                  const _h2536 = clueAt(cl.number, v_x);
                                  if (!((_h2536 !== -1))) continue;
                                  _g2530.push(v_x);
                                }
                              }
                              _g2537.length = 0;
                              G2538: {
                                const _a2555 = throughWhere(sp, v_y, (_te2550: number): boolean => { let _c2552: boolean = ((_te2550 === _wc2396 ? _wd2397 : (_te2550 === _wc2394 ? _wd2395 : (b.grid[_te2550] || -1))) === 1); if (_c2552) {   const _t2551 = sp.edgeEnds[2 * _te2550];   _c2552 = !((clueAt(cl.number, _t2551) !== -1)); } let _c2554: boolean = _c2552; if (_c2554) {   const _t2553 = sp.edgeEnds[2 * _te2550 + 1];   _c2554 = !((clueAt(cl.number, _t2553) !== -1)); } return _c2554; });
                                for (let _i2556 = 0; _i2556 < _a2555.length; _i2556++) {
                                  const v_t = _a2555[_i2556];
                                  const _h2559 = clueAt(cl.number, v_t);
                                  const _h2560 = (_h2559 !== -1);
                                  const _h2561 = _h2560;
                                  const _h2562 = !(_h2561);
                                  const _a2557 = sp.adj4[v_t];
                                  for (let _i2558 = 0; _i2558 < _a2557.length; _i2558++) {
                                    const v_x = _a2557[_i2558];
                                    const _h2563 = clueAt(cl.number, v_x);
                                    let _c2565: boolean = (_h2562 && (_h2563 !== -1));
                                    if (_c2565) {
                                      const _t2564 = sp.edgeOf(v_t, v_x);
                                      _c2565 = ((_t2564 === _wc2396 ? _wd2397 : (_t2564 === _wc2394 ? _wd2395 : (b.grid[_t2564] || -1))) === 1);
                                    }
                                    if (!(_c2565)) continue;
                                    if (!_g2537.includes(v_x)) _g2537.push(v_x);
                                  }
                                }
                              }
                              const _a2566 = union(_g2530, _g2537);
                              for (let _i2567 = 0; _i2567 < _a2566.length; _i2567++) {
                                const v_q = _a2566[_i2567];
                                const _h2569 = clueAt(cl.number, v_q);
                                if (!((Math.abs((_h2568 - _h2569)) === cl.step))) {
                                  _q2488 = false;
                                  break Q2489;
                                }
                              }
                            }
                          }
                          _c2570 = _q2488;
                        }
                        if (!((_c2570 && (_h2360 || !(throughWhere(sp, v_t, (_te2571: number): boolean => {  return ((_te2571 === _wc2396 ? _wd2397 : (_te2571 === _wc2394 ? _wd2395 : (b.grid[_te2571] || -1))) === 1); }).includes(v_y)))))) continue;
                        let _g2572 = 0;
                        G2573: {
                          const _a2574 = sp.adj4[v_t];
                          for (let _i2575 = 0; _i2575 < _a2574.length; _i2575++) {
                            const v_y = _a2574[_i2575];
                            const _t2576 = sp.edgeOf(v_t, v_y);
                            if (!(((_t2576 === _wc2396 ? _wd2397 : (_t2576 === _wc2394 ? _wd2395 : (b.grid[_t2576] || -1))) === 1))) continue;
                            _g2572++;
                          }
                        }
                        let _g2577 = 0;
                        G2578: {
                          const _a2579 = setOf(v_t);
                          for (let _i2580 = 0; _i2580 < _a2579.length; _i2580++) {
                            const v_k = _a2579[_i2580];
                            const _h2581 = clueAt(cl.number, v_k);
                            const _h2588 = (_h2581 + 1);
                            let _c2590: boolean = (_h2581 !== -1);
                            if (_c2590) {
                              let _c2589: boolean = (_h2360 || (_h2581 === 1));
                              if (!_c2589) {
                                let _g2582 = 0;
                                G2583: {
                                  const _t2584 = (_h2581 + 1);
                                  const _a2585 = cluesValued(cl.number, _t2584);
                                  for (let _i2586 = 0; _i2586 < _a2585.length; _i2586++) {
                                    const v_x = _a2585[_i2586];
                                    const _h2587 = clueAt(cl.number, v_x);
                                    if (!((_h2587 === _h2588))) continue;
                                    _g2582++;
                                  }
                                }
                                _c2589 = (_g2582 === 0);
                              }
                              _c2590 = _c2589;
                            }
                            if (!(_c2590)) continue;
                            _g2577++;
                          }
                        }
                        let _c2721: boolean = ((_g2572 + 1) === (2 - _g2577));
                        if (!_c2721) {
                          let _q2591 = false;
                          Q2592: {
                            const _a2593 = sp.adj4[v_t];
                            const _n2594 = _i2445;
                            for (let _i2595 = 0; _i2595 < _n2594; _i2595++) {
                              const v_z = _a2593[_i2595];
                              const _t2596 = sp.edgeOf(v_t, v_z);
                              let _c2616: boolean = !((_t2596 === _wc2396 ? true : (_t2596 === _wc2394 ? true : (b.grid[_t2596] !== 0))));
                              if (_c2616) {
                                let _g2597 = 0;
                                G2598: {
                                  const _a2599 = sp.adj4[v_t];
                                  for (let _i2600 = 0; _i2600 < _a2599.length; _i2600++) {
                                    const v_y = _a2599[_i2600];
                                    const _t2601 = sp.edgeOf(v_t, v_y);
                                    if (!(((_t2601 === _wc2396 ? _wd2397 : (_t2601 === _wc2394 ? _wd2395 : (b.grid[_t2601] || -1))) === 1))) continue;
                                    _g2597++;
                                  }
                                }
                                let _g2602 = 0;
                                G2603: {
                                  const _a2604 = setOf(v_t);
                                  for (let _i2605 = 0; _i2605 < _a2604.length; _i2605++) {
                                    const v_k = _a2604[_i2605];
                                    const _h2606 = clueAt(cl.number, v_k);
                                    const _h2613 = (_h2606 + 1);
                                    let _c2615: boolean = (_h2606 !== -1);
                                    if (_c2615) {
                                      let _c2614: boolean = (_h2360 || (_h2606 === 1));
                                      if (!_c2614) {
                                        let _g2607 = 0;
                                        G2608: {
                                          const _t2609 = (_h2606 + 1);
                                          const _a2610 = cluesValued(cl.number, _t2609);
                                          for (let _i2611 = 0; _i2611 < _a2610.length; _i2611++) {
                                            const v_x = _a2610[_i2611];
                                            const _h2612 = clueAt(cl.number, v_x);
                                            if (!((_h2612 === _h2613))) continue;
                                            _g2607++;
                                          }
                                        }
                                        _c2614 = (_g2607 === 0);
                                      }
                                      _c2615 = _c2614;
                                    }
                                    if (!(_c2615)) continue;
                                    _g2602++;
                                  }
                                }
                                _c2616 = (_g2597 < (2 - _g2602));
                              }
                              let _c2636: boolean = _c2616;
                              if (_c2636) {
                                let _g2617 = 0;
                                G2618: {
                                  const _a2619 = sp.adj4[v_z];
                                  for (let _i2620 = 0; _i2620 < _a2619.length; _i2620++) {
                                    const v_y = _a2619[_i2620];
                                    const _t2621 = sp.edgeOf(v_z, v_y);
                                    if (!(((_t2621 === _wc2396 ? _wd2397 : (_t2621 === _wc2394 ? _wd2395 : (b.grid[_t2621] || -1))) === 1))) continue;
                                    _g2617++;
                                  }
                                }
                                let _g2622 = 0;
                                G2623: {
                                  const _a2624 = setOf(v_z);
                                  for (let _i2625 = 0; _i2625 < _a2624.length; _i2625++) {
                                    const v_k = _a2624[_i2625];
                                    const _h2626 = clueAt(cl.number, v_k);
                                    const _h2633 = (_h2626 + 1);
                                    let _c2635: boolean = (_h2626 !== -1);
                                    if (_c2635) {
                                      let _c2634: boolean = (_h2360 || (_h2626 === 1));
                                      if (!_c2634) {
                                        let _g2627 = 0;
                                        G2628: {
                                          const _t2629 = (_h2626 + 1);
                                          const _a2630 = cluesValued(cl.number, _t2629);
                                          for (let _i2631 = 0; _i2631 < _a2630.length; _i2631++) {
                                            const v_x = _a2630[_i2631];
                                            const _h2632 = clueAt(cl.number, v_x);
                                            if (!((_h2632 === _h2633))) continue;
                                            _g2627++;
                                          }
                                        }
                                        _c2634 = (_g2627 === 0);
                                      }
                                      _c2635 = _c2634;
                                    }
                                    if (!(_c2635)) continue;
                                    _g2622++;
                                  }
                                }
                                _c2636 = (_g2617 < (2 - _g2622));
                              }
                              let _c2719: boolean = _c2636;
                              if (_c2719) {
                                let _q2637 = true;
                                Q2638: {
                                  _g2639.length = 0;
                                  G2640: {
                                    const _a2643 = setOf(v_t);
                                    for (let _i2644 = 0; _i2644 < _a2643.length; _i2644++) {
                                      const v_x = _a2643[_i2644];
                                      const _h2645 = clueAt(cl.number, v_x);
                                      if (!((_h2645 !== -1))) continue;
                                      _g2639.push(v_x);
                                    }
                                  }
                                  _g2646.length = 0;
                                  G2647: {
                                    const _a2666 = throughWhere(sp, v_t, (_te2661: number): boolean => { let _c2663: boolean = ((_te2661 === _wc2396 ? _wd2397 : (_te2661 === _wc2394 ? _wd2395 : (b.grid[_te2661] || -1))) === 1); if (_c2663) {   const _t2662 = sp.edgeEnds[2 * _te2661];   _c2663 = !((clueAt(cl.number, _t2662) !== -1)); } let _c2665: boolean = _c2663; if (_c2665) {   const _t2664 = sp.edgeEnds[2 * _te2661 + 1];   _c2665 = !((clueAt(cl.number, _t2664) !== -1)); } return _c2665; });
                                    for (let _i2667 = 0; _i2667 < _a2666.length; _i2667++) {
                                      const v_t_2660 = _a2666[_i2667];
                                      const _h2670 = clueAt(cl.number, v_t_2660);
                                      const _h2671 = (_h2670 !== -1);
                                      const _h2672 = _h2671;
                                      const _h2673 = !(_h2672);
                                      const _a2668 = sp.adj4[v_t_2660];
                                      for (let _i2669 = 0; _i2669 < _a2668.length; _i2669++) {
                                        const v_x = _a2668[_i2669];
                                        const _h2674 = clueAt(cl.number, v_x);
                                        let _c2676: boolean = (_h2673 && (_h2674 !== -1));
                                        if (_c2676) {
                                          const _t2675 = sp.edgeOf(v_t_2660, v_x);
                                          _c2676 = ((_t2675 === _wc2396 ? _wd2397 : (_t2675 === _wc2394 ? _wd2395 : (b.grid[_t2675] || -1))) === 1);
                                        }
                                        if (!(_c2676)) continue;
                                        if (!_g2646.includes(v_x)) _g2646.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2677 = union(_g2639, _g2646);
                                  for (let _i2678 = 0; _i2678 < _a2677.length; _i2678++) {
                                    const v_p = _a2677[_i2678];
                                    const _h2717 = clueAt(cl.number, v_p);
                                    _g2679.length = 0;
                                    G2680: {
                                      const _a2683 = setOf(v_z);
                                      for (let _i2684 = 0; _i2684 < _a2683.length; _i2684++) {
                                        const v_x = _a2683[_i2684];
                                        const _h2685 = clueAt(cl.number, v_x);
                                        if (!((_h2685 !== -1))) continue;
                                        _g2679.push(v_x);
                                      }
                                    }
                                    _g2686.length = 0;
                                    G2687: {
                                      const _a2704 = throughWhere(sp, v_z, (_te2699: number): boolean => { let _c2701: boolean = ((_te2699 === _wc2396 ? _wd2397 : (_te2699 === _wc2394 ? _wd2395 : (b.grid[_te2699] || -1))) === 1); if (_c2701) {   const _t2700 = sp.edgeEnds[2 * _te2699];   _c2701 = !((clueAt(cl.number, _t2700) !== -1)); } let _c2703: boolean = _c2701; if (_c2703) {   const _t2702 = sp.edgeEnds[2 * _te2699 + 1];   _c2703 = !((clueAt(cl.number, _t2702) !== -1)); } return _c2703; });
                                      for (let _i2705 = 0; _i2705 < _a2704.length; _i2705++) {
                                        const v_t = _a2704[_i2705];
                                        const _h2708 = clueAt(cl.number, v_t);
                                        const _h2709 = (_h2708 !== -1);
                                        const _h2710 = _h2709;
                                        const _h2711 = !(_h2710);
                                        const _a2706 = sp.adj4[v_t];
                                        for (let _i2707 = 0; _i2707 < _a2706.length; _i2707++) {
                                          const v_x = _a2706[_i2707];
                                          const _h2712 = clueAt(cl.number, v_x);
                                          let _c2714: boolean = (_h2711 && (_h2712 !== -1));
                                          if (_c2714) {
                                            const _t2713 = sp.edgeOf(v_t, v_x);
                                            _c2714 = ((_t2713 === _wc2396 ? _wd2397 : (_t2713 === _wc2394 ? _wd2395 : (b.grid[_t2713] || -1))) === 1);
                                          }
                                          if (!(_c2714)) continue;
                                          if (!_g2686.includes(v_x)) _g2686.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2715 = union(_g2679, _g2686);
                                    for (let _i2716 = 0; _i2716 < _a2715.length; _i2716++) {
                                      const v_q = _a2715[_i2716];
                                      const _h2718 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2717 - _h2718)) === cl.step))) {
                                        _q2637 = false;
                                        break Q2638;
                                      }
                                    }
                                  }
                                }
                                _c2719 = _q2637;
                              }
                              if ((_c2719 && (_h2360 || !(throughWhere(sp, v_t, (_te2720: number): boolean => {  return ((_te2720 === _wc2396 ? _wd2397 : (_te2720 === _wc2394 ? _wd2395 : (b.grid[_te2720] || -1))) === 1); }).includes(v_z))))) {
                                _q2591 = true;
                                break Q2592;
                              }
                            }
                          }
                          _c2721 = _q2591;
                        }
                        if (_c2721) {
                          _q2442 = true;
                          break Q2443;
                        }
                      }
                    }
                    _c2722 = !(_q2442);
                  }
                  let _c3023: boolean = _c2722;
                  if (!_c3023) {
                    let _q2723 = false;
                    Q2724: {
                      const _a2725 = sp.adj4[v_t];
                      for (let _i2726 = 0; _i2726 < _a2725.length; _i2726++) {
                        const v_s = _a2725[_i2726];
                        let _g2727 = 0;
                        G2728: {
                          const _a2729 = sp.adj4[v_s];
                          for (let _i2730 = 0; _i2730 < _a2729.length; _i2730++) {
                            const v_y = _a2729[_i2730];
                            const _t2731 = sp.edgeOf(v_s, v_y);
                            if (!(((_t2731 === _wc2396 ? _wd2397 : (_t2731 === _wc2394 ? _wd2395 : (b.grid[_t2731] || -1))) === 1))) continue;
                            _g2727++;
                          }
                        }
                        let _g2732 = 0;
                        G2733: {
                          const _a2734 = setOf(v_s);
                          for (let _i2735 = 0; _i2735 < _a2734.length; _i2735++) {
                            const v_k = _a2734[_i2735];
                            const _h2736 = clueAt(cl.number, v_k);
                            const _h2743 = (_h2736 + 1);
                            let _c2745: boolean = (_h2736 !== -1);
                            if (_c2745) {
                              let _c2744: boolean = (_h2360 || (_h2736 === 1));
                              if (!_c2744) {
                                let _g2737 = 0;
                                G2738: {
                                  const _t2739 = (_h2736 + 1);
                                  const _a2740 = cluesValued(cl.number, _t2739);
                                  for (let _i2741 = 0; _i2741 < _a2740.length; _i2741++) {
                                    const v_x = _a2740[_i2741];
                                    const _h2742 = clueAt(cl.number, v_x);
                                    if (!((_h2742 === _h2743))) continue;
                                    _g2737++;
                                  }
                                }
                                _c2744 = (_g2737 === 0);
                              }
                              _c2745 = _c2744;
                            }
                            if (!(_c2745)) continue;
                            _g2732++;
                          }
                        }
                        let _c3022: boolean = (_g2727 < (2 - _g2732));
                        if (_c3022) {
                          let _q2746 = false;
                          Q2747: {
                            const _a2748 = sp.adj4[v_s];
                            for (let _i2749 = 0; _i2749 < _a2748.length; _i2749++) {
                              const v_y = _a2748[_i2749];
                              const _t2750 = sp.edgeOf(v_s, v_y);
                              let _c2770: boolean = !((_t2750 === _wc2396 ? true : (_t2750 === _wc2394 ? true : (b.grid[_t2750] !== 0))));
                              if (_c2770) {
                                let _g2751 = 0;
                                G2752: {
                                  const _a2753 = sp.adj4[v_s];
                                  for (let _i2754 = 0; _i2754 < _a2753.length; _i2754++) {
                                    const v_y = _a2753[_i2754];
                                    const _t2755 = sp.edgeOf(v_s, v_y);
                                    if (!(((_t2755 === _wc2396 ? _wd2397 : (_t2755 === _wc2394 ? _wd2395 : (b.grid[_t2755] || -1))) === 1))) continue;
                                    _g2751++;
                                  }
                                }
                                let _g2756 = 0;
                                G2757: {
                                  const _a2758 = setOf(v_s);
                                  for (let _i2759 = 0; _i2759 < _a2758.length; _i2759++) {
                                    const v_k = _a2758[_i2759];
                                    const _h2760 = clueAt(cl.number, v_k);
                                    const _h2767 = (_h2760 + 1);
                                    let _c2769: boolean = (_h2760 !== -1);
                                    if (_c2769) {
                                      let _c2768: boolean = (_h2360 || (_h2760 === 1));
                                      if (!_c2768) {
                                        let _g2761 = 0;
                                        G2762: {
                                          const _t2763 = (_h2760 + 1);
                                          const _a2764 = cluesValued(cl.number, _t2763);
                                          for (let _i2765 = 0; _i2765 < _a2764.length; _i2765++) {
                                            const v_x = _a2764[_i2765];
                                            const _h2766 = clueAt(cl.number, v_x);
                                            if (!((_h2766 === _h2767))) continue;
                                            _g2761++;
                                          }
                                        }
                                        _c2768 = (_g2761 === 0);
                                      }
                                      _c2769 = _c2768;
                                    }
                                    if (!(_c2769)) continue;
                                    _g2756++;
                                  }
                                }
                                _c2770 = (_g2751 < (2 - _g2756));
                              }
                              let _c2791: boolean = _c2770;
                              if (_c2791) {
                                let _g2771 = 0;
                                G2772: {
                                  const _a2774 = sp.adj4[v_y];
                                  for (let _i2775 = 0; _i2775 < _a2774.length; _i2775++) {
                                    const v_y_2773 = _a2774[_i2775];
                                    const _t2776 = sp.edgeOf(v_y, v_y_2773);
                                    if (!(((_t2776 === _wc2396 ? _wd2397 : (_t2776 === _wc2394 ? _wd2395 : (b.grid[_t2776] || -1))) === 1))) continue;
                                    _g2771++;
                                  }
                                }
                                let _g2777 = 0;
                                G2778: {
                                  const _a2779 = setOf(v_y);
                                  for (let _i2780 = 0; _i2780 < _a2779.length; _i2780++) {
                                    const v_k = _a2779[_i2780];
                                    const _h2781 = clueAt(cl.number, v_k);
                                    const _h2788 = (_h2781 + 1);
                                    let _c2790: boolean = (_h2781 !== -1);
                                    if (_c2790) {
                                      let _c2789: boolean = (_h2360 || (_h2781 === 1));
                                      if (!_c2789) {
                                        let _g2782 = 0;
                                        G2783: {
                                          const _t2784 = (_h2781 + 1);
                                          const _a2785 = cluesValued(cl.number, _t2784);
                                          for (let _i2786 = 0; _i2786 < _a2785.length; _i2786++) {
                                            const v_x = _a2785[_i2786];
                                            const _h2787 = clueAt(cl.number, v_x);
                                            if (!((_h2787 === _h2788))) continue;
                                            _g2782++;
                                          }
                                        }
                                        _c2789 = (_g2782 === 0);
                                      }
                                      _c2790 = _c2789;
                                    }
                                    if (!(_c2790)) continue;
                                    _g2777++;
                                  }
                                }
                                _c2791 = (_g2771 < (2 - _g2777));
                              }
                              let _c2872: boolean = _c2791;
                              if (_c2872) {
                                let _q2792 = true;
                                Q2793: {
                                  _g2794.length = 0;
                                  G2795: {
                                    const _a2798 = setOf(v_s);
                                    for (let _i2799 = 0; _i2799 < _a2798.length; _i2799++) {
                                      const v_x = _a2798[_i2799];
                                      const _h2800 = clueAt(cl.number, v_x);
                                      if (!((_h2800 !== -1))) continue;
                                      _g2794.push(v_x);
                                    }
                                  }
                                  _g2801.length = 0;
                                  G2802: {
                                    const _a2819 = throughWhere(sp, v_s, (_te2814: number): boolean => { let _c2816: boolean = ((_te2814 === _wc2396 ? _wd2397 : (_te2814 === _wc2394 ? _wd2395 : (b.grid[_te2814] || -1))) === 1); if (_c2816) {   const _t2815 = sp.edgeEnds[2 * _te2814];   _c2816 = !((clueAt(cl.number, _t2815) !== -1)); } let _c2818: boolean = _c2816; if (_c2818) {   const _t2817 = sp.edgeEnds[2 * _te2814 + 1];   _c2818 = !((clueAt(cl.number, _t2817) !== -1)); } return _c2818; });
                                    for (let _i2820 = 0; _i2820 < _a2819.length; _i2820++) {
                                      const v_t = _a2819[_i2820];
                                      const _h2823 = clueAt(cl.number, v_t);
                                      const _h2824 = (_h2823 !== -1);
                                      const _h2825 = _h2824;
                                      const _h2826 = !(_h2825);
                                      const _a2821 = sp.adj4[v_t];
                                      for (let _i2822 = 0; _i2822 < _a2821.length; _i2822++) {
                                        const v_x = _a2821[_i2822];
                                        const _h2827 = clueAt(cl.number, v_x);
                                        let _c2829: boolean = (_h2826 && (_h2827 !== -1));
                                        if (_c2829) {
                                          const _t2828 = sp.edgeOf(v_t, v_x);
                                          _c2829 = ((_t2828 === _wc2396 ? _wd2397 : (_t2828 === _wc2394 ? _wd2395 : (b.grid[_t2828] || -1))) === 1);
                                        }
                                        if (!(_c2829)) continue;
                                        if (!_g2801.includes(v_x)) _g2801.push(v_x);
                                      }
                                    }
                                  }
                                  const _a2830 = union(_g2794, _g2801);
                                  for (let _i2831 = 0; _i2831 < _a2830.length; _i2831++) {
                                    const v_p = _a2830[_i2831];
                                    const _h2870 = clueAt(cl.number, v_p);
                                    _g2832.length = 0;
                                    G2833: {
                                      const _a2836 = setOf(v_y);
                                      for (let _i2837 = 0; _i2837 < _a2836.length; _i2837++) {
                                        const v_x = _a2836[_i2837];
                                        const _h2838 = clueAt(cl.number, v_x);
                                        if (!((_h2838 !== -1))) continue;
                                        _g2832.push(v_x);
                                      }
                                    }
                                    _g2839.length = 0;
                                    G2840: {
                                      const _a2857 = throughWhere(sp, v_y, (_te2852: number): boolean => { let _c2854: boolean = ((_te2852 === _wc2396 ? _wd2397 : (_te2852 === _wc2394 ? _wd2395 : (b.grid[_te2852] || -1))) === 1); if (_c2854) {   const _t2853 = sp.edgeEnds[2 * _te2852];   _c2854 = !((clueAt(cl.number, _t2853) !== -1)); } let _c2856: boolean = _c2854; if (_c2856) {   const _t2855 = sp.edgeEnds[2 * _te2852 + 1];   _c2856 = !((clueAt(cl.number, _t2855) !== -1)); } return _c2856; });
                                      for (let _i2858 = 0; _i2858 < _a2857.length; _i2858++) {
                                        const v_t = _a2857[_i2858];
                                        const _h2861 = clueAt(cl.number, v_t);
                                        const _h2862 = (_h2861 !== -1);
                                        const _h2863 = _h2862;
                                        const _h2864 = !(_h2863);
                                        const _a2859 = sp.adj4[v_t];
                                        for (let _i2860 = 0; _i2860 < _a2859.length; _i2860++) {
                                          const v_x = _a2859[_i2860];
                                          const _h2865 = clueAt(cl.number, v_x);
                                          let _c2867: boolean = (_h2864 && (_h2865 !== -1));
                                          if (_c2867) {
                                            const _t2866 = sp.edgeOf(v_t, v_x);
                                            _c2867 = ((_t2866 === _wc2396 ? _wd2397 : (_t2866 === _wc2394 ? _wd2395 : (b.grid[_t2866] || -1))) === 1);
                                          }
                                          if (!(_c2867)) continue;
                                          if (!_g2839.includes(v_x)) _g2839.push(v_x);
                                        }
                                      }
                                    }
                                    const _a2868 = union(_g2832, _g2839);
                                    for (let _i2869 = 0; _i2869 < _a2868.length; _i2869++) {
                                      const v_q = _a2868[_i2869];
                                      const _h2871 = clueAt(cl.number, v_q);
                                      if (!((Math.abs((_h2870 - _h2871)) === cl.step))) {
                                        _q2792 = false;
                                        break Q2793;
                                      }
                                    }
                                  }
                                }
                                _c2872 = _q2792;
                              }
                              if (!((_c2872 && (_h2360 || !(throughWhere(sp, v_s, (_te2873: number): boolean => {  return ((_te2873 === _wc2396 ? _wd2397 : (_te2873 === _wc2394 ? _wd2395 : (b.grid[_te2873] || -1))) === 1); }).includes(v_y)))))) continue;
                              let _g2874 = 0;
                              G2875: {
                                const _a2876 = sp.adj4[v_s];
                                for (let _i2877 = 0; _i2877 < _a2876.length; _i2877++) {
                                  const v_y = _a2876[_i2877];
                                  const _t2878 = sp.edgeOf(v_s, v_y);
                                  if (!(((_t2878 === _wc2396 ? _wd2397 : (_t2878 === _wc2394 ? _wd2395 : (b.grid[_t2878] || -1))) === 1))) continue;
                                  _g2874++;
                                }
                              }
                              let _g2879 = 0;
                              G2880: {
                                const _a2881 = setOf(v_s);
                                for (let _i2882 = 0; _i2882 < _a2881.length; _i2882++) {
                                  const v_k = _a2881[_i2882];
                                  const _h2883 = clueAt(cl.number, v_k);
                                  const _h2890 = (_h2883 + 1);
                                  let _c2892: boolean = (_h2883 !== -1);
                                  if (_c2892) {
                                    let _c2891: boolean = (_h2360 || (_h2883 === 1));
                                    if (!_c2891) {
                                      let _g2884 = 0;
                                      G2885: {
                                        const _t2886 = (_h2883 + 1);
                                        const _a2887 = cluesValued(cl.number, _t2886);
                                        for (let _i2888 = 0; _i2888 < _a2887.length; _i2888++) {
                                          const v_x = _a2887[_i2888];
                                          const _h2889 = clueAt(cl.number, v_x);
                                          if (!((_h2889 === _h2890))) continue;
                                          _g2884++;
                                        }
                                      }
                                      _c2891 = (_g2884 === 0);
                                    }
                                    _c2892 = _c2891;
                                  }
                                  if (!(_c2892)) continue;
                                  _g2879++;
                                }
                              }
                              let _c3021: boolean = ((_g2874 + 1) === (2 - _g2879));
                              if (!_c3021) {
                                let _q2893 = false;
                                Q2894: {
                                  const _a2895 = sp.adj4[v_s];
                                  const _n2896 = _i2749;
                                  for (let _i2897 = 0; _i2897 < _n2896; _i2897++) {
                                    const v_z = _a2895[_i2897];
                                    const _t2898 = sp.edgeOf(v_s, v_z);
                                    let _c2918: boolean = !((_t2898 === _wc2396 ? true : (_t2898 === _wc2394 ? true : (b.grid[_t2898] !== 0))));
                                    if (_c2918) {
                                      let _g2899 = 0;
                                      G2900: {
                                        const _a2901 = sp.adj4[v_s];
                                        for (let _i2902 = 0; _i2902 < _a2901.length; _i2902++) {
                                          const v_y = _a2901[_i2902];
                                          const _t2903 = sp.edgeOf(v_s, v_y);
                                          if (!(((_t2903 === _wc2396 ? _wd2397 : (_t2903 === _wc2394 ? _wd2395 : (b.grid[_t2903] || -1))) === 1))) continue;
                                          _g2899++;
                                        }
                                      }
                                      let _g2904 = 0;
                                      G2905: {
                                        const _a2906 = setOf(v_s);
                                        for (let _i2907 = 0; _i2907 < _a2906.length; _i2907++) {
                                          const v_k = _a2906[_i2907];
                                          const _h2908 = clueAt(cl.number, v_k);
                                          const _h2915 = (_h2908 + 1);
                                          let _c2917: boolean = (_h2908 !== -1);
                                          if (_c2917) {
                                            let _c2916: boolean = (_h2360 || (_h2908 === 1));
                                            if (!_c2916) {
                                              let _g2909 = 0;
                                              G2910: {
                                                const _t2911 = (_h2908 + 1);
                                                const _a2912 = cluesValued(cl.number, _t2911);
                                                for (let _i2913 = 0; _i2913 < _a2912.length; _i2913++) {
                                                  const v_x = _a2912[_i2913];
                                                  const _h2914 = clueAt(cl.number, v_x);
                                                  if (!((_h2914 === _h2915))) continue;
                                                  _g2909++;
                                                }
                                              }
                                              _c2916 = (_g2909 === 0);
                                            }
                                            _c2917 = _c2916;
                                          }
                                          if (!(_c2917)) continue;
                                          _g2904++;
                                        }
                                      }
                                      _c2918 = (_g2899 < (2 - _g2904));
                                    }
                                    let _c2938: boolean = _c2918;
                                    if (_c2938) {
                                      let _g2919 = 0;
                                      G2920: {
                                        const _a2921 = sp.adj4[v_z];
                                        for (let _i2922 = 0; _i2922 < _a2921.length; _i2922++) {
                                          const v_y = _a2921[_i2922];
                                          const _t2923 = sp.edgeOf(v_z, v_y);
                                          if (!(((_t2923 === _wc2396 ? _wd2397 : (_t2923 === _wc2394 ? _wd2395 : (b.grid[_t2923] || -1))) === 1))) continue;
                                          _g2919++;
                                        }
                                      }
                                      let _g2924 = 0;
                                      G2925: {
                                        const _a2926 = setOf(v_z);
                                        for (let _i2927 = 0; _i2927 < _a2926.length; _i2927++) {
                                          const v_k = _a2926[_i2927];
                                          const _h2928 = clueAt(cl.number, v_k);
                                          const _h2935 = (_h2928 + 1);
                                          let _c2937: boolean = (_h2928 !== -1);
                                          if (_c2937) {
                                            let _c2936: boolean = (_h2360 || (_h2928 === 1));
                                            if (!_c2936) {
                                              let _g2929 = 0;
                                              G2930: {
                                                const _t2931 = (_h2928 + 1);
                                                const _a2932 = cluesValued(cl.number, _t2931);
                                                for (let _i2933 = 0; _i2933 < _a2932.length; _i2933++) {
                                                  const v_x = _a2932[_i2933];
                                                  const _h2934 = clueAt(cl.number, v_x);
                                                  if (!((_h2934 === _h2935))) continue;
                                                  _g2929++;
                                                }
                                              }
                                              _c2936 = (_g2929 === 0);
                                            }
                                            _c2937 = _c2936;
                                          }
                                          if (!(_c2937)) continue;
                                          _g2924++;
                                        }
                                      }
                                      _c2938 = (_g2919 < (2 - _g2924));
                                    }
                                    let _c3019: boolean = _c2938;
                                    if (_c3019) {
                                      let _q2939 = true;
                                      Q2940: {
                                        _g2941.length = 0;
                                        G2942: {
                                          const _a2945 = setOf(v_s);
                                          for (let _i2946 = 0; _i2946 < _a2945.length; _i2946++) {
                                            const v_x = _a2945[_i2946];
                                            const _h2947 = clueAt(cl.number, v_x);
                                            if (!((_h2947 !== -1))) continue;
                                            _g2941.push(v_x);
                                          }
                                        }
                                        _g2948.length = 0;
                                        G2949: {
                                          const _a2966 = throughWhere(sp, v_s, (_te2961: number): boolean => { let _c2963: boolean = ((_te2961 === _wc2396 ? _wd2397 : (_te2961 === _wc2394 ? _wd2395 : (b.grid[_te2961] || -1))) === 1); if (_c2963) {   const _t2962 = sp.edgeEnds[2 * _te2961];   _c2963 = !((clueAt(cl.number, _t2962) !== -1)); } let _c2965: boolean = _c2963; if (_c2965) {   const _t2964 = sp.edgeEnds[2 * _te2961 + 1];   _c2965 = !((clueAt(cl.number, _t2964) !== -1)); } return _c2965; });
                                          for (let _i2967 = 0; _i2967 < _a2966.length; _i2967++) {
                                            const v_t = _a2966[_i2967];
                                            const _h2970 = clueAt(cl.number, v_t);
                                            const _h2971 = (_h2970 !== -1);
                                            const _h2972 = _h2971;
                                            const _h2973 = !(_h2972);
                                            const _a2968 = sp.adj4[v_t];
                                            for (let _i2969 = 0; _i2969 < _a2968.length; _i2969++) {
                                              const v_x = _a2968[_i2969];
                                              const _h2974 = clueAt(cl.number, v_x);
                                              let _c2976: boolean = (_h2973 && (_h2974 !== -1));
                                              if (_c2976) {
                                                const _t2975 = sp.edgeOf(v_t, v_x);
                                                _c2976 = ((_t2975 === _wc2396 ? _wd2397 : (_t2975 === _wc2394 ? _wd2395 : (b.grid[_t2975] || -1))) === 1);
                                              }
                                              if (!(_c2976)) continue;
                                              if (!_g2948.includes(v_x)) _g2948.push(v_x);
                                            }
                                          }
                                        }
                                        const _a2977 = union(_g2941, _g2948);
                                        for (let _i2978 = 0; _i2978 < _a2977.length; _i2978++) {
                                          const v_p = _a2977[_i2978];
                                          const _h3017 = clueAt(cl.number, v_p);
                                          _g2979.length = 0;
                                          G2980: {
                                            const _a2983 = setOf(v_z);
                                            for (let _i2984 = 0; _i2984 < _a2983.length; _i2984++) {
                                              const v_x = _a2983[_i2984];
                                              const _h2985 = clueAt(cl.number, v_x);
                                              if (!((_h2985 !== -1))) continue;
                                              _g2979.push(v_x);
                                            }
                                          }
                                          _g2986.length = 0;
                                          G2987: {
                                            const _a3004 = throughWhere(sp, v_z, (_te2999: number): boolean => { let _c3001: boolean = ((_te2999 === _wc2396 ? _wd2397 : (_te2999 === _wc2394 ? _wd2395 : (b.grid[_te2999] || -1))) === 1); if (_c3001) {   const _t3000 = sp.edgeEnds[2 * _te2999];   _c3001 = !((clueAt(cl.number, _t3000) !== -1)); } let _c3003: boolean = _c3001; if (_c3003) {   const _t3002 = sp.edgeEnds[2 * _te2999 + 1];   _c3003 = !((clueAt(cl.number, _t3002) !== -1)); } return _c3003; });
                                            for (let _i3005 = 0; _i3005 < _a3004.length; _i3005++) {
                                              const v_t = _a3004[_i3005];
                                              const _h3008 = clueAt(cl.number, v_t);
                                              const _h3009 = (_h3008 !== -1);
                                              const _h3010 = _h3009;
                                              const _h3011 = !(_h3010);
                                              const _a3006 = sp.adj4[v_t];
                                              for (let _i3007 = 0; _i3007 < _a3006.length; _i3007++) {
                                                const v_x = _a3006[_i3007];
                                                const _h3012 = clueAt(cl.number, v_x);
                                                let _c3014: boolean = (_h3011 && (_h3012 !== -1));
                                                if (_c3014) {
                                                  const _t3013 = sp.edgeOf(v_t, v_x);
                                                  _c3014 = ((_t3013 === _wc2396 ? _wd2397 : (_t3013 === _wc2394 ? _wd2395 : (b.grid[_t3013] || -1))) === 1);
                                                }
                                                if (!(_c3014)) continue;
                                                if (!_g2986.includes(v_x)) _g2986.push(v_x);
                                              }
                                            }
                                          }
                                          const _a3015 = union(_g2979, _g2986);
                                          for (let _i3016 = 0; _i3016 < _a3015.length; _i3016++) {
                                            const v_q = _a3015[_i3016];
                                            const _h3018 = clueAt(cl.number, v_q);
                                            if (!((Math.abs((_h3017 - _h3018)) === cl.step))) {
                                              _q2939 = false;
                                              break Q2940;
                                            }
                                          }
                                        }
                                      }
                                      _c3019 = _q2939;
                                    }
                                    if ((_c3019 && (_h2360 || !(throughWhere(sp, v_s, (_te3020: number): boolean => {  return ((_te3020 === _wc2396 ? _wd2397 : (_te3020 === _wc2394 ? _wd2395 : (b.grid[_te3020] || -1))) === 1); }).includes(v_z))))) {
                                      _q2893 = true;
                                      break Q2894;
                                    }
                                  }
                                }
                                _c3021 = _q2893;
                              }
                              if (_c3021) {
                                _q2746 = true;
                                break Q2747;
                              }
                            }
                          }
                          _c3022 = !(_q2746);
                        }
                        if (_c3022) {
                          _q2723 = true;
                          break Q2724;
                        }
                      }
                    }
                    _c3023 = _q2723;
                  }
                  if (_c3023) {
                    _q2398 = true;
                    break Q2399;
                  }
                }
              }
              _c3024 = _q2398;
            }
            _c3025 = _c3024;
          }
          if (!(_c3025)) break L2378;
          facts.length = 0;
          changed = false;
          const _t3026 = sp.edgeOf(v_c, v_k);
          if (!(b.grid[_t3026] !== 0)) { if (fire === null) { b.placeAt(_t3026, 1); changed = true; } else facts.push(PLACE, _t3026, 1); }
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

export function weighed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WeighedBinding> | null): number {
  const _g5336: number[] = [];
  const _g6006: number[] = [];
  const _g6013: number[] = [];
  const _g6046: number[] = [];
  const _g6053: number[] = [];
  const _g6155: number[] = [];
  const _g6162: number[] = [];
  const _g6195: number[] = [];
  const _g6202: number[] = [];
  const _g6310: number[] = [];
  const _g6317: number[] = [];
  const _g6348: number[] = [];
  const _g6355: number[] = [];
  const _g6457: number[] = [];
  const _g6464: number[] = [];
  const _g6495: number[] = [];
  const _g6502: number[] = [];
  const _g6542: number[] = [];
  const _g7209: number[] = [];
  const _g7216: number[] = [];
  const _g7249: number[] = [];
  const _g7256: number[] = [];
  const _g7358: number[] = [];
  const _g7365: number[] = [];
  const _g7398: number[] = [];
  const _g7405: number[] = [];
  const _g7513: number[] = [];
  const _g7520: number[] = [];
  const _g7551: number[] = [];
  const _g7558: number[] = [];
  const _g7660: number[] = [];
  const _g7667: number[] = [];
  const _g7698: number[] = [];
  const _g7705: number[] = [];
  const _g7748: number[] = [];
  const _g7770: number[] = [];
  const facts = weighedFacts;
  let fired = 0;
  let changed = false;
  const _h5320 = (cl.step === 0);
  const _a5302 = sp.cells;
  for (let _i5303 = 0; _i5303 < _a5302.length; _i5303++) {
    const v_c = _a5302[_i5303];
    let _g5315 = 0;
    G5316: {
      const _a5317 = setOf(v_c);
      for (let _i5318 = 0; _i5318 < _a5317.length; _i5318++) {
        const v_k = _a5317[_i5318];
        const _h5319 = clueAt(cl.number, v_k);
        const _h5327 = (_h5319 + 1);
        let _c5329: boolean = (_h5319 !== -1);
        if (_c5329) {
          let _c5328: boolean = (_h5320 || (_h5319 === 1));
          if (!_c5328) {
            let _g5321 = 0;
            G5322: {
              const _t5323 = (_h5319 + 1);
              const _a5324 = cluesValued(cl.number, _t5323);
              for (let _i5325 = 0; _i5325 < _a5324.length; _i5325++) {
                const v_x = _a5324[_i5325];
                const _h5326 = clueAt(cl.number, v_x);
                if (!((_h5326 === _h5327))) continue;
                _g5321++;
              }
            }
            _c5328 = (_g5321 === 0);
          }
          _c5329 = _c5328;
        }
        if (!(_c5329)) continue;
        _g5315++;
      }
    }
    let _g5330 = 0;
    G5331: {
      const _a5332 = sp.adj4[v_c];
      for (let _i5333 = 0; _i5333 < _a5332.length; _i5333++) {
        const v_y = _a5332[_i5333];
        if (!(((b.grid[sp.edgeOf(v_c, v_y)] || -1) === 1))) continue;
        _g5330++;
      }
    }
    if (!((((2 - _g5315) - _g5330) === 2))) continue;
    const _h5895 = clueAt(cl.number, v_c);
    const _h5896 = (_h5895 !== -1);
    const _h5897 = _h5896;
    const _h5898 = !(_h5897);
    L5334: {
      const v_U = ways(b, sp, cl, v_c);
      const _h5335 = v_U.length;
      if (!((_h5335 === 4))) break L5334;
      const _h7745 = (v_U[0] ?? -1);
      _g5336.length = 0;
      G5337: {
        const _a5888 = v_U;
        for (let _i5889 = 0; _i5889 < _a5888.length; _i5889++) {
          const v_i = _a5888[_i5889];
          const _h5892 = _i5889;
          const _h5893 = (_h5892 === 0);
          const _h5909 = sp.edgeOf(v_c, v_i);
          const _a5890 = v_U;
          for (let _i5891 = 0; _i5891 < _a5890.length; _i5891++) {
            const v_j = _a5890[_i5891];
            let _c6541: boolean = (_h5893 && (_i5891 > 0));
            if (_c6541) {
              let _c5908: boolean = (throughWhere(sp, v_i, (_te5894: number): boolean => {  return ((b.grid[_te5894] || -1) === 1); }).includes(v_j));
              if (!_c5908) {
                let _c5907: boolean = _h5898;
                if (_c5907) {
                  let _q5899 = true;
                  Q5900: {
                    const _a5901 = nearest(b, sp, cl, v_i);
                    for (let _i5902 = 0; _i5902 < _a5901.length; _i5902++) {
                      const v_p = _a5901[_i5902];
                      const _h5905 = clueAt(cl.number, v_p);
                      const _a5903 = nearest(b, sp, cl, v_j);
                      for (let _i5904 = 0; _i5904 < _a5903.length; _i5904++) {
                        const v_q = _a5903[_i5904];
                        const _h5906 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h5905 - _h5906)) === cl.step))) {
                          _q5899 = false;
                          break Q5900;
                        }
                      }
                    }
                  }
                  _c5907 = !(_q5899);
                }
                _c5908 = _c5907;
              }
              let _c6540: boolean = _c5908;
              if (!_c6540) {
                const _wc5910 = _h5909;
                const _wd5911 = 1;
                const _wc5912 = sp.edgeOf(v_c, v_j);
                const _wd5913 = 1;
                let _q5914 = false;
                Q5915: {
                  const _a5917 = throughWhere(sp, v_c, (_te5916: number): boolean => {  return ((_te5916 === _wc5912 ? _wd5913 : (_te5916 === _wc5910 ? _wd5911 : (b.grid[_te5916] || -1))) === 1); });
                  for (let _i5918 = 0; _i5918 < _a5917.length; _i5918++) {
                    const v_t = _a5917[_i5918];
                    let _c5938: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c5938) {
                      let _g5919 = 0;
                      G5920: {
                        const _a5921 = sp.adj4[v_t];
                        for (let _i5922 = 0; _i5922 < _a5921.length; _i5922++) {
                          const v_y = _a5921[_i5922];
                          const _t5923 = sp.edgeOf(v_t, v_y);
                          if (!(((_t5923 === _wc5912 ? _wd5913 : (_t5923 === _wc5910 ? _wd5911 : (b.grid[_t5923] || -1))) === 1))) continue;
                          _g5919++;
                        }
                      }
                      let _g5924 = 0;
                      G5925: {
                        const _a5926 = setOf(v_t);
                        for (let _i5927 = 0; _i5927 < _a5926.length; _i5927++) {
                          const v_k = _a5926[_i5927];
                          const _h5928 = clueAt(cl.number, v_k);
                          const _h5935 = (_h5928 + 1);
                          let _c5937: boolean = (_h5928 !== -1);
                          if (_c5937) {
                            let _c5936: boolean = (_h5320 || (_h5928 === 1));
                            if (!_c5936) {
                              let _g5929 = 0;
                              G5930: {
                                const _t5931 = (_h5928 + 1);
                                const _a5932 = cluesValued(cl.number, _t5931);
                                for (let _i5933 = 0; _i5933 < _a5932.length; _i5933++) {
                                  const v_x = _a5932[_i5933];
                                  const _h5934 = clueAt(cl.number, v_x);
                                  if (!((_h5934 === _h5935))) continue;
                                  _g5929++;
                                }
                              }
                              _c5936 = (_g5929 === 0);
                            }
                            _c5937 = _c5936;
                          }
                          if (!(_c5937)) continue;
                          _g5924++;
                        }
                      }
                      _c5938 = (_g5919 < (2 - _g5924));
                    }
                    if (!(_c5938)) continue;
                    let _g5939 = 0;
                    G5940: {
                      const _a5941 = sp.adj4[v_t];
                      for (let _i5942 = 0; _i5942 < _a5941.length; _i5942++) {
                        const v_y = _a5941[_i5942];
                        const _t5943 = sp.edgeOf(v_t, v_y);
                        if (!(((_t5943 === _wc5912 ? _wd5913 : (_t5943 === _wc5910 ? _wd5911 : (b.grid[_t5943] || -1))) === 1))) continue;
                        _g5939++;
                      }
                    }
                    let _g5944 = 0;
                    G5945: {
                      const _a5946 = setOf(v_t);
                      for (let _i5947 = 0; _i5947 < _a5946.length; _i5947++) {
                        const v_k = _a5946[_i5947];
                        const _h5948 = clueAt(cl.number, v_k);
                        const _h5955 = (_h5948 + 1);
                        let _c5957: boolean = (_h5948 !== -1);
                        if (_c5957) {
                          let _c5956: boolean = (_h5320 || (_h5948 === 1));
                          if (!_c5956) {
                            let _g5949 = 0;
                            G5950: {
                              const _t5951 = (_h5948 + 1);
                              const _a5952 = cluesValued(cl.number, _t5951);
                              for (let _i5953 = 0; _i5953 < _a5952.length; _i5953++) {
                                const v_x = _a5952[_i5953];
                                const _h5954 = clueAt(cl.number, v_x);
                                if (!((_h5954 === _h5955))) continue;
                                _g5949++;
                              }
                            }
                            _c5956 = (_g5949 === 0);
                          }
                          _c5957 = _c5956;
                        }
                        if (!(_c5957)) continue;
                        _g5944++;
                      }
                    }
                    let _c6238: boolean = (_g5939 < (2 - _g5944));
                    if (_c6238) {
                      let _q5958 = false;
                      Q5959: {
                        const _a5960 = sp.adj4[v_t];
                        for (let _i5961 = 0; _i5961 < _a5960.length; _i5961++) {
                          const v_y = _a5960[_i5961];
                          const _t5962 = sp.edgeOf(v_t, v_y);
                          let _c5982: boolean = !((_t5962 === _wc5912 ? true : (_t5962 === _wc5910 ? true : (b.grid[_t5962] !== 0))));
                          if (_c5982) {
                            let _g5963 = 0;
                            G5964: {
                              const _a5965 = sp.adj4[v_t];
                              for (let _i5966 = 0; _i5966 < _a5965.length; _i5966++) {
                                const v_y = _a5965[_i5966];
                                const _t5967 = sp.edgeOf(v_t, v_y);
                                if (!(((_t5967 === _wc5912 ? _wd5913 : (_t5967 === _wc5910 ? _wd5911 : (b.grid[_t5967] || -1))) === 1))) continue;
                                _g5963++;
                              }
                            }
                            let _g5968 = 0;
                            G5969: {
                              const _a5970 = setOf(v_t);
                              for (let _i5971 = 0; _i5971 < _a5970.length; _i5971++) {
                                const v_k = _a5970[_i5971];
                                const _h5972 = clueAt(cl.number, v_k);
                                const _h5979 = (_h5972 + 1);
                                let _c5981: boolean = (_h5972 !== -1);
                                if (_c5981) {
                                  let _c5980: boolean = (_h5320 || (_h5972 === 1));
                                  if (!_c5980) {
                                    let _g5973 = 0;
                                    G5974: {
                                      const _t5975 = (_h5972 + 1);
                                      const _a5976 = cluesValued(cl.number, _t5975);
                                      for (let _i5977 = 0; _i5977 < _a5976.length; _i5977++) {
                                        const v_x = _a5976[_i5977];
                                        const _h5978 = clueAt(cl.number, v_x);
                                        if (!((_h5978 === _h5979))) continue;
                                        _g5973++;
                                      }
                                    }
                                    _c5980 = (_g5973 === 0);
                                  }
                                  _c5981 = _c5980;
                                }
                                if (!(_c5981)) continue;
                                _g5968++;
                              }
                            }
                            _c5982 = (_g5963 < (2 - _g5968));
                          }
                          let _c6003: boolean = _c5982;
                          if (_c6003) {
                            let _g5983 = 0;
                            G5984: {
                              const _a5986 = sp.adj4[v_y];
                              for (let _i5987 = 0; _i5987 < _a5986.length; _i5987++) {
                                const v_y_5985 = _a5986[_i5987];
                                const _t5988 = sp.edgeOf(v_y, v_y_5985);
                                if (!(((_t5988 === _wc5912 ? _wd5913 : (_t5988 === _wc5910 ? _wd5911 : (b.grid[_t5988] || -1))) === 1))) continue;
                                _g5983++;
                              }
                            }
                            let _g5989 = 0;
                            G5990: {
                              const _a5991 = setOf(v_y);
                              for (let _i5992 = 0; _i5992 < _a5991.length; _i5992++) {
                                const v_k = _a5991[_i5992];
                                const _h5993 = clueAt(cl.number, v_k);
                                const _h6000 = (_h5993 + 1);
                                let _c6002: boolean = (_h5993 !== -1);
                                if (_c6002) {
                                  let _c6001: boolean = (_h5320 || (_h5993 === 1));
                                  if (!_c6001) {
                                    let _g5994 = 0;
                                    G5995: {
                                      const _t5996 = (_h5993 + 1);
                                      const _a5997 = cluesValued(cl.number, _t5996);
                                      for (let _i5998 = 0; _i5998 < _a5997.length; _i5998++) {
                                        const v_x = _a5997[_i5998];
                                        const _h5999 = clueAt(cl.number, v_x);
                                        if (!((_h5999 === _h6000))) continue;
                                        _g5994++;
                                      }
                                    }
                                    _c6001 = (_g5994 === 0);
                                  }
                                  _c6002 = _c6001;
                                }
                                if (!(_c6002)) continue;
                                _g5989++;
                              }
                            }
                            _c6003 = (_g5983 < (2 - _g5989));
                          }
                          let _c6086: boolean = _c6003;
                          if (_c6086) {
                            let _q6004 = true;
                            Q6005: {
                              _g6006.length = 0;
                              G6007: {
                                const _a6010 = setOf(v_t);
                                for (let _i6011 = 0; _i6011 < _a6010.length; _i6011++) {
                                  const v_x = _a6010[_i6011];
                                  const _h6012 = clueAt(cl.number, v_x);
                                  if (!((_h6012 !== -1))) continue;
                                  _g6006.push(v_x);
                                }
                              }
                              _g6013.length = 0;
                              G6014: {
                                const _a6033 = throughWhere(sp, v_t, (_te6028: number): boolean => { let _c6030: boolean = ((_te6028 === _wc5912 ? _wd5913 : (_te6028 === _wc5910 ? _wd5911 : (b.grid[_te6028] || -1))) === 1); if (_c6030) {   const _t6029 = sp.edgeEnds[2 * _te6028];   _c6030 = !((clueAt(cl.number, _t6029) !== -1)); } let _c6032: boolean = _c6030; if (_c6032) {   const _t6031 = sp.edgeEnds[2 * _te6028 + 1];   _c6032 = !((clueAt(cl.number, _t6031) !== -1)); } return _c6032; });
                                for (let _i6034 = 0; _i6034 < _a6033.length; _i6034++) {
                                  const v_t_6027 = _a6033[_i6034];
                                  const _h6037 = clueAt(cl.number, v_t_6027);
                                  const _h6038 = (_h6037 !== -1);
                                  const _h6039 = _h6038;
                                  const _h6040 = !(_h6039);
                                  const _a6035 = sp.adj4[v_t_6027];
                                  for (let _i6036 = 0; _i6036 < _a6035.length; _i6036++) {
                                    const v_x = _a6035[_i6036];
                                    const _h6041 = clueAt(cl.number, v_x);
                                    let _c6043: boolean = (_h6040 && (_h6041 !== -1));
                                    if (_c6043) {
                                      const _t6042 = sp.edgeOf(v_t_6027, v_x);
                                      _c6043 = ((_t6042 === _wc5912 ? _wd5913 : (_t6042 === _wc5910 ? _wd5911 : (b.grid[_t6042] || -1))) === 1);
                                    }
                                    if (!(_c6043)) continue;
                                    if (!_g6013.includes(v_x)) _g6013.push(v_x);
                                  }
                                }
                              }
                              const _a6044 = union(_g6006, _g6013);
                              for (let _i6045 = 0; _i6045 < _a6044.length; _i6045++) {
                                const v_p = _a6044[_i6045];
                                const _h6084 = clueAt(cl.number, v_p);
                                _g6046.length = 0;
                                G6047: {
                                  const _a6050 = setOf(v_y);
                                  for (let _i6051 = 0; _i6051 < _a6050.length; _i6051++) {
                                    const v_x = _a6050[_i6051];
                                    const _h6052 = clueAt(cl.number, v_x);
                                    if (!((_h6052 !== -1))) continue;
                                    _g6046.push(v_x);
                                  }
                                }
                                _g6053.length = 0;
                                G6054: {
                                  const _a6071 = throughWhere(sp, v_y, (_te6066: number): boolean => { let _c6068: boolean = ((_te6066 === _wc5912 ? _wd5913 : (_te6066 === _wc5910 ? _wd5911 : (b.grid[_te6066] || -1))) === 1); if (_c6068) {   const _t6067 = sp.edgeEnds[2 * _te6066];   _c6068 = !((clueAt(cl.number, _t6067) !== -1)); } let _c6070: boolean = _c6068; if (_c6070) {   const _t6069 = sp.edgeEnds[2 * _te6066 + 1];   _c6070 = !((clueAt(cl.number, _t6069) !== -1)); } return _c6070; });
                                  for (let _i6072 = 0; _i6072 < _a6071.length; _i6072++) {
                                    const v_t = _a6071[_i6072];
                                    const _h6075 = clueAt(cl.number, v_t);
                                    const _h6076 = (_h6075 !== -1);
                                    const _h6077 = _h6076;
                                    const _h6078 = !(_h6077);
                                    const _a6073 = sp.adj4[v_t];
                                    for (let _i6074 = 0; _i6074 < _a6073.length; _i6074++) {
                                      const v_x = _a6073[_i6074];
                                      const _h6079 = clueAt(cl.number, v_x);
                                      let _c6081: boolean = (_h6078 && (_h6079 !== -1));
                                      if (_c6081) {
                                        const _t6080 = sp.edgeOf(v_t, v_x);
                                        _c6081 = ((_t6080 === _wc5912 ? _wd5913 : (_t6080 === _wc5910 ? _wd5911 : (b.grid[_t6080] || -1))) === 1);
                                      }
                                      if (!(_c6081)) continue;
                                      if (!_g6053.includes(v_x)) _g6053.push(v_x);
                                    }
                                  }
                                }
                                const _a6082 = union(_g6046, _g6053);
                                for (let _i6083 = 0; _i6083 < _a6082.length; _i6083++) {
                                  const v_q = _a6082[_i6083];
                                  const _h6085 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h6084 - _h6085)) === cl.step))) {
                                    _q6004 = false;
                                    break Q6005;
                                  }
                                }
                              }
                            }
                            _c6086 = _q6004;
                          }
                          if (!((_c6086 && (_h5320 || !(throughWhere(sp, v_t, (_te6087: number): boolean => {  return ((_te6087 === _wc5912 ? _wd5913 : (_te6087 === _wc5910 ? _wd5911 : (b.grid[_te6087] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g6088 = 0;
                          G6089: {
                            const _a6090 = sp.adj4[v_t];
                            for (let _i6091 = 0; _i6091 < _a6090.length; _i6091++) {
                              const v_y = _a6090[_i6091];
                              const _t6092 = sp.edgeOf(v_t, v_y);
                              if (!(((_t6092 === _wc5912 ? _wd5913 : (_t6092 === _wc5910 ? _wd5911 : (b.grid[_t6092] || -1))) === 1))) continue;
                              _g6088++;
                            }
                          }
                          let _g6093 = 0;
                          G6094: {
                            const _a6095 = setOf(v_t);
                            for (let _i6096 = 0; _i6096 < _a6095.length; _i6096++) {
                              const v_k = _a6095[_i6096];
                              const _h6097 = clueAt(cl.number, v_k);
                              const _h6104 = (_h6097 + 1);
                              let _c6106: boolean = (_h6097 !== -1);
                              if (_c6106) {
                                let _c6105: boolean = (_h5320 || (_h6097 === 1));
                                if (!_c6105) {
                                  let _g6098 = 0;
                                  G6099: {
                                    const _t6100 = (_h6097 + 1);
                                    const _a6101 = cluesValued(cl.number, _t6100);
                                    for (let _i6102 = 0; _i6102 < _a6101.length; _i6102++) {
                                      const v_x = _a6101[_i6102];
                                      const _h6103 = clueAt(cl.number, v_x);
                                      if (!((_h6103 === _h6104))) continue;
                                      _g6098++;
                                    }
                                  }
                                  _c6105 = (_g6098 === 0);
                                }
                                _c6106 = _c6105;
                              }
                              if (!(_c6106)) continue;
                              _g6093++;
                            }
                          }
                          let _c6237: boolean = ((_g6088 + 1) === (2 - _g6093));
                          if (!_c6237) {
                            let _q6107 = false;
                            Q6108: {
                              const _a6109 = sp.adj4[v_t];
                              const _n6110 = _i5961;
                              for (let _i6111 = 0; _i6111 < _n6110; _i6111++) {
                                const v_z = _a6109[_i6111];
                                const _t6112 = sp.edgeOf(v_t, v_z);
                                let _c6132: boolean = !((_t6112 === _wc5912 ? true : (_t6112 === _wc5910 ? true : (b.grid[_t6112] !== 0))));
                                if (_c6132) {
                                  let _g6113 = 0;
                                  G6114: {
                                    const _a6115 = sp.adj4[v_t];
                                    for (let _i6116 = 0; _i6116 < _a6115.length; _i6116++) {
                                      const v_y = _a6115[_i6116];
                                      const _t6117 = sp.edgeOf(v_t, v_y);
                                      if (!(((_t6117 === _wc5912 ? _wd5913 : (_t6117 === _wc5910 ? _wd5911 : (b.grid[_t6117] || -1))) === 1))) continue;
                                      _g6113++;
                                    }
                                  }
                                  let _g6118 = 0;
                                  G6119: {
                                    const _a6120 = setOf(v_t);
                                    for (let _i6121 = 0; _i6121 < _a6120.length; _i6121++) {
                                      const v_k = _a6120[_i6121];
                                      const _h6122 = clueAt(cl.number, v_k);
                                      const _h6129 = (_h6122 + 1);
                                      let _c6131: boolean = (_h6122 !== -1);
                                      if (_c6131) {
                                        let _c6130: boolean = (_h5320 || (_h6122 === 1));
                                        if (!_c6130) {
                                          let _g6123 = 0;
                                          G6124: {
                                            const _t6125 = (_h6122 + 1);
                                            const _a6126 = cluesValued(cl.number, _t6125);
                                            for (let _i6127 = 0; _i6127 < _a6126.length; _i6127++) {
                                              const v_x = _a6126[_i6127];
                                              const _h6128 = clueAt(cl.number, v_x);
                                              if (!((_h6128 === _h6129))) continue;
                                              _g6123++;
                                            }
                                          }
                                          _c6130 = (_g6123 === 0);
                                        }
                                        _c6131 = _c6130;
                                      }
                                      if (!(_c6131)) continue;
                                      _g6118++;
                                    }
                                  }
                                  _c6132 = (_g6113 < (2 - _g6118));
                                }
                                let _c6152: boolean = _c6132;
                                if (_c6152) {
                                  let _g6133 = 0;
                                  G6134: {
                                    const _a6135 = sp.adj4[v_z];
                                    for (let _i6136 = 0; _i6136 < _a6135.length; _i6136++) {
                                      const v_y = _a6135[_i6136];
                                      const _t6137 = sp.edgeOf(v_z, v_y);
                                      if (!(((_t6137 === _wc5912 ? _wd5913 : (_t6137 === _wc5910 ? _wd5911 : (b.grid[_t6137] || -1))) === 1))) continue;
                                      _g6133++;
                                    }
                                  }
                                  let _g6138 = 0;
                                  G6139: {
                                    const _a6140 = setOf(v_z);
                                    for (let _i6141 = 0; _i6141 < _a6140.length; _i6141++) {
                                      const v_k = _a6140[_i6141];
                                      const _h6142 = clueAt(cl.number, v_k);
                                      const _h6149 = (_h6142 + 1);
                                      let _c6151: boolean = (_h6142 !== -1);
                                      if (_c6151) {
                                        let _c6150: boolean = (_h5320 || (_h6142 === 1));
                                        if (!_c6150) {
                                          let _g6143 = 0;
                                          G6144: {
                                            const _t6145 = (_h6142 + 1);
                                            const _a6146 = cluesValued(cl.number, _t6145);
                                            for (let _i6147 = 0; _i6147 < _a6146.length; _i6147++) {
                                              const v_x = _a6146[_i6147];
                                              const _h6148 = clueAt(cl.number, v_x);
                                              if (!((_h6148 === _h6149))) continue;
                                              _g6143++;
                                            }
                                          }
                                          _c6150 = (_g6143 === 0);
                                        }
                                        _c6151 = _c6150;
                                      }
                                      if (!(_c6151)) continue;
                                      _g6138++;
                                    }
                                  }
                                  _c6152 = (_g6133 < (2 - _g6138));
                                }
                                let _c6235: boolean = _c6152;
                                if (_c6235) {
                                  let _q6153 = true;
                                  Q6154: {
                                    _g6155.length = 0;
                                    G6156: {
                                      const _a6159 = setOf(v_t);
                                      for (let _i6160 = 0; _i6160 < _a6159.length; _i6160++) {
                                        const v_x = _a6159[_i6160];
                                        const _h6161 = clueAt(cl.number, v_x);
                                        if (!((_h6161 !== -1))) continue;
                                        _g6155.push(v_x);
                                      }
                                    }
                                    _g6162.length = 0;
                                    G6163: {
                                      const _a6182 = throughWhere(sp, v_t, (_te6177: number): boolean => { let _c6179: boolean = ((_te6177 === _wc5912 ? _wd5913 : (_te6177 === _wc5910 ? _wd5911 : (b.grid[_te6177] || -1))) === 1); if (_c6179) {   const _t6178 = sp.edgeEnds[2 * _te6177];   _c6179 = !((clueAt(cl.number, _t6178) !== -1)); } let _c6181: boolean = _c6179; if (_c6181) {   const _t6180 = sp.edgeEnds[2 * _te6177 + 1];   _c6181 = !((clueAt(cl.number, _t6180) !== -1)); } return _c6181; });
                                      for (let _i6183 = 0; _i6183 < _a6182.length; _i6183++) {
                                        const v_t_6176 = _a6182[_i6183];
                                        const _h6186 = clueAt(cl.number, v_t_6176);
                                        const _h6187 = (_h6186 !== -1);
                                        const _h6188 = _h6187;
                                        const _h6189 = !(_h6188);
                                        const _a6184 = sp.adj4[v_t_6176];
                                        for (let _i6185 = 0; _i6185 < _a6184.length; _i6185++) {
                                          const v_x = _a6184[_i6185];
                                          const _h6190 = clueAt(cl.number, v_x);
                                          let _c6192: boolean = (_h6189 && (_h6190 !== -1));
                                          if (_c6192) {
                                            const _t6191 = sp.edgeOf(v_t_6176, v_x);
                                            _c6192 = ((_t6191 === _wc5912 ? _wd5913 : (_t6191 === _wc5910 ? _wd5911 : (b.grid[_t6191] || -1))) === 1);
                                          }
                                          if (!(_c6192)) continue;
                                          if (!_g6162.includes(v_x)) _g6162.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6193 = union(_g6155, _g6162);
                                    for (let _i6194 = 0; _i6194 < _a6193.length; _i6194++) {
                                      const v_p = _a6193[_i6194];
                                      const _h6233 = clueAt(cl.number, v_p);
                                      _g6195.length = 0;
                                      G6196: {
                                        const _a6199 = setOf(v_z);
                                        for (let _i6200 = 0; _i6200 < _a6199.length; _i6200++) {
                                          const v_x = _a6199[_i6200];
                                          const _h6201 = clueAt(cl.number, v_x);
                                          if (!((_h6201 !== -1))) continue;
                                          _g6195.push(v_x);
                                        }
                                      }
                                      _g6202.length = 0;
                                      G6203: {
                                        const _a6220 = throughWhere(sp, v_z, (_te6215: number): boolean => { let _c6217: boolean = ((_te6215 === _wc5912 ? _wd5913 : (_te6215 === _wc5910 ? _wd5911 : (b.grid[_te6215] || -1))) === 1); if (_c6217) {   const _t6216 = sp.edgeEnds[2 * _te6215];   _c6217 = !((clueAt(cl.number, _t6216) !== -1)); } let _c6219: boolean = _c6217; if (_c6219) {   const _t6218 = sp.edgeEnds[2 * _te6215 + 1];   _c6219 = !((clueAt(cl.number, _t6218) !== -1)); } return _c6219; });
                                        for (let _i6221 = 0; _i6221 < _a6220.length; _i6221++) {
                                          const v_t = _a6220[_i6221];
                                          const _h6224 = clueAt(cl.number, v_t);
                                          const _h6225 = (_h6224 !== -1);
                                          const _h6226 = _h6225;
                                          const _h6227 = !(_h6226);
                                          const _a6222 = sp.adj4[v_t];
                                          for (let _i6223 = 0; _i6223 < _a6222.length; _i6223++) {
                                            const v_x = _a6222[_i6223];
                                            const _h6228 = clueAt(cl.number, v_x);
                                            let _c6230: boolean = (_h6227 && (_h6228 !== -1));
                                            if (_c6230) {
                                              const _t6229 = sp.edgeOf(v_t, v_x);
                                              _c6230 = ((_t6229 === _wc5912 ? _wd5913 : (_t6229 === _wc5910 ? _wd5911 : (b.grid[_t6229] || -1))) === 1);
                                            }
                                            if (!(_c6230)) continue;
                                            if (!_g6202.includes(v_x)) _g6202.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6231 = union(_g6195, _g6202);
                                      for (let _i6232 = 0; _i6232 < _a6231.length; _i6232++) {
                                        const v_q = _a6231[_i6232];
                                        const _h6234 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6233 - _h6234)) === cl.step))) {
                                          _q6153 = false;
                                          break Q6154;
                                        }
                                      }
                                    }
                                  }
                                  _c6235 = _q6153;
                                }
                                if ((_c6235 && (_h5320 || !(throughWhere(sp, v_t, (_te6236: number): boolean => {  return ((_te6236 === _wc5912 ? _wd5913 : (_te6236 === _wc5910 ? _wd5911 : (b.grid[_te6236] || -1))) === 1); }).includes(v_z))))) {
                                  _q6107 = true;
                                  break Q6108;
                                }
                              }
                            }
                            _c6237 = _q6107;
                          }
                          if (_c6237) {
                            _q5958 = true;
                            break Q5959;
                          }
                        }
                      }
                      _c6238 = !(_q5958);
                    }
                    let _c6539: boolean = _c6238;
                    if (!_c6539) {
                      let _q6239 = false;
                      Q6240: {
                        const _a6241 = sp.adj4[v_t];
                        for (let _i6242 = 0; _i6242 < _a6241.length; _i6242++) {
                          const v_s = _a6241[_i6242];
                          let _g6243 = 0;
                          G6244: {
                            const _a6245 = sp.adj4[v_s];
                            for (let _i6246 = 0; _i6246 < _a6245.length; _i6246++) {
                              const v_y = _a6245[_i6246];
                              const _t6247 = sp.edgeOf(v_s, v_y);
                              if (!(((_t6247 === _wc5912 ? _wd5913 : (_t6247 === _wc5910 ? _wd5911 : (b.grid[_t6247] || -1))) === 1))) continue;
                              _g6243++;
                            }
                          }
                          let _g6248 = 0;
                          G6249: {
                            const _a6250 = setOf(v_s);
                            for (let _i6251 = 0; _i6251 < _a6250.length; _i6251++) {
                              const v_k = _a6250[_i6251];
                              const _h6252 = clueAt(cl.number, v_k);
                              const _h6259 = (_h6252 + 1);
                              let _c6261: boolean = (_h6252 !== -1);
                              if (_c6261) {
                                let _c6260: boolean = (_h5320 || (_h6252 === 1));
                                if (!_c6260) {
                                  let _g6253 = 0;
                                  G6254: {
                                    const _t6255 = (_h6252 + 1);
                                    const _a6256 = cluesValued(cl.number, _t6255);
                                    for (let _i6257 = 0; _i6257 < _a6256.length; _i6257++) {
                                      const v_x = _a6256[_i6257];
                                      const _h6258 = clueAt(cl.number, v_x);
                                      if (!((_h6258 === _h6259))) continue;
                                      _g6253++;
                                    }
                                  }
                                  _c6260 = (_g6253 === 0);
                                }
                                _c6261 = _c6260;
                              }
                              if (!(_c6261)) continue;
                              _g6248++;
                            }
                          }
                          let _c6538: boolean = (_g6243 < (2 - _g6248));
                          if (_c6538) {
                            let _q6262 = false;
                            Q6263: {
                              const _a6264 = sp.adj4[v_s];
                              for (let _i6265 = 0; _i6265 < _a6264.length; _i6265++) {
                                const v_y = _a6264[_i6265];
                                const _t6266 = sp.edgeOf(v_s, v_y);
                                let _c6286: boolean = !((_t6266 === _wc5912 ? true : (_t6266 === _wc5910 ? true : (b.grid[_t6266] !== 0))));
                                if (_c6286) {
                                  let _g6267 = 0;
                                  G6268: {
                                    const _a6269 = sp.adj4[v_s];
                                    for (let _i6270 = 0; _i6270 < _a6269.length; _i6270++) {
                                      const v_y = _a6269[_i6270];
                                      const _t6271 = sp.edgeOf(v_s, v_y);
                                      if (!(((_t6271 === _wc5912 ? _wd5913 : (_t6271 === _wc5910 ? _wd5911 : (b.grid[_t6271] || -1))) === 1))) continue;
                                      _g6267++;
                                    }
                                  }
                                  let _g6272 = 0;
                                  G6273: {
                                    const _a6274 = setOf(v_s);
                                    for (let _i6275 = 0; _i6275 < _a6274.length; _i6275++) {
                                      const v_k = _a6274[_i6275];
                                      const _h6276 = clueAt(cl.number, v_k);
                                      const _h6283 = (_h6276 + 1);
                                      let _c6285: boolean = (_h6276 !== -1);
                                      if (_c6285) {
                                        let _c6284: boolean = (_h5320 || (_h6276 === 1));
                                        if (!_c6284) {
                                          let _g6277 = 0;
                                          G6278: {
                                            const _t6279 = (_h6276 + 1);
                                            const _a6280 = cluesValued(cl.number, _t6279);
                                            for (let _i6281 = 0; _i6281 < _a6280.length; _i6281++) {
                                              const v_x = _a6280[_i6281];
                                              const _h6282 = clueAt(cl.number, v_x);
                                              if (!((_h6282 === _h6283))) continue;
                                              _g6277++;
                                            }
                                          }
                                          _c6284 = (_g6277 === 0);
                                        }
                                        _c6285 = _c6284;
                                      }
                                      if (!(_c6285)) continue;
                                      _g6272++;
                                    }
                                  }
                                  _c6286 = (_g6267 < (2 - _g6272));
                                }
                                let _c6307: boolean = _c6286;
                                if (_c6307) {
                                  let _g6287 = 0;
                                  G6288: {
                                    const _a6290 = sp.adj4[v_y];
                                    for (let _i6291 = 0; _i6291 < _a6290.length; _i6291++) {
                                      const v_y_6289 = _a6290[_i6291];
                                      const _t6292 = sp.edgeOf(v_y, v_y_6289);
                                      if (!(((_t6292 === _wc5912 ? _wd5913 : (_t6292 === _wc5910 ? _wd5911 : (b.grid[_t6292] || -1))) === 1))) continue;
                                      _g6287++;
                                    }
                                  }
                                  let _g6293 = 0;
                                  G6294: {
                                    const _a6295 = setOf(v_y);
                                    for (let _i6296 = 0; _i6296 < _a6295.length; _i6296++) {
                                      const v_k = _a6295[_i6296];
                                      const _h6297 = clueAt(cl.number, v_k);
                                      const _h6304 = (_h6297 + 1);
                                      let _c6306: boolean = (_h6297 !== -1);
                                      if (_c6306) {
                                        let _c6305: boolean = (_h5320 || (_h6297 === 1));
                                        if (!_c6305) {
                                          let _g6298 = 0;
                                          G6299: {
                                            const _t6300 = (_h6297 + 1);
                                            const _a6301 = cluesValued(cl.number, _t6300);
                                            for (let _i6302 = 0; _i6302 < _a6301.length; _i6302++) {
                                              const v_x = _a6301[_i6302];
                                              const _h6303 = clueAt(cl.number, v_x);
                                              if (!((_h6303 === _h6304))) continue;
                                              _g6298++;
                                            }
                                          }
                                          _c6305 = (_g6298 === 0);
                                        }
                                        _c6306 = _c6305;
                                      }
                                      if (!(_c6306)) continue;
                                      _g6293++;
                                    }
                                  }
                                  _c6307 = (_g6287 < (2 - _g6293));
                                }
                                let _c6388: boolean = _c6307;
                                if (_c6388) {
                                  let _q6308 = true;
                                  Q6309: {
                                    _g6310.length = 0;
                                    G6311: {
                                      const _a6314 = setOf(v_s);
                                      for (let _i6315 = 0; _i6315 < _a6314.length; _i6315++) {
                                        const v_x = _a6314[_i6315];
                                        const _h6316 = clueAt(cl.number, v_x);
                                        if (!((_h6316 !== -1))) continue;
                                        _g6310.push(v_x);
                                      }
                                    }
                                    _g6317.length = 0;
                                    G6318: {
                                      const _a6335 = throughWhere(sp, v_s, (_te6330: number): boolean => { let _c6332: boolean = ((_te6330 === _wc5912 ? _wd5913 : (_te6330 === _wc5910 ? _wd5911 : (b.grid[_te6330] || -1))) === 1); if (_c6332) {   const _t6331 = sp.edgeEnds[2 * _te6330];   _c6332 = !((clueAt(cl.number, _t6331) !== -1)); } let _c6334: boolean = _c6332; if (_c6334) {   const _t6333 = sp.edgeEnds[2 * _te6330 + 1];   _c6334 = !((clueAt(cl.number, _t6333) !== -1)); } return _c6334; });
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
                                            const _t6344 = sp.edgeOf(v_t, v_x);
                                            _c6345 = ((_t6344 === _wc5912 ? _wd5913 : (_t6344 === _wc5910 ? _wd5911 : (b.grid[_t6344] || -1))) === 1);
                                          }
                                          if (!(_c6345)) continue;
                                          if (!_g6317.includes(v_x)) _g6317.push(v_x);
                                        }
                                      }
                                    }
                                    const _a6346 = union(_g6310, _g6317);
                                    for (let _i6347 = 0; _i6347 < _a6346.length; _i6347++) {
                                      const v_p = _a6346[_i6347];
                                      const _h6386 = clueAt(cl.number, v_p);
                                      _g6348.length = 0;
                                      G6349: {
                                        const _a6352 = setOf(v_y);
                                        for (let _i6353 = 0; _i6353 < _a6352.length; _i6353++) {
                                          const v_x = _a6352[_i6353];
                                          const _h6354 = clueAt(cl.number, v_x);
                                          if (!((_h6354 !== -1))) continue;
                                          _g6348.push(v_x);
                                        }
                                      }
                                      _g6355.length = 0;
                                      G6356: {
                                        const _a6373 = throughWhere(sp, v_y, (_te6368: number): boolean => { let _c6370: boolean = ((_te6368 === _wc5912 ? _wd5913 : (_te6368 === _wc5910 ? _wd5911 : (b.grid[_te6368] || -1))) === 1); if (_c6370) {   const _t6369 = sp.edgeEnds[2 * _te6368];   _c6370 = !((clueAt(cl.number, _t6369) !== -1)); } let _c6372: boolean = _c6370; if (_c6372) {   const _t6371 = sp.edgeEnds[2 * _te6368 + 1];   _c6372 = !((clueAt(cl.number, _t6371) !== -1)); } return _c6372; });
                                        for (let _i6374 = 0; _i6374 < _a6373.length; _i6374++) {
                                          const v_t = _a6373[_i6374];
                                          const _h6377 = clueAt(cl.number, v_t);
                                          const _h6378 = (_h6377 !== -1);
                                          const _h6379 = _h6378;
                                          const _h6380 = !(_h6379);
                                          const _a6375 = sp.adj4[v_t];
                                          for (let _i6376 = 0; _i6376 < _a6375.length; _i6376++) {
                                            const v_x = _a6375[_i6376];
                                            const _h6381 = clueAt(cl.number, v_x);
                                            let _c6383: boolean = (_h6380 && (_h6381 !== -1));
                                            if (_c6383) {
                                              const _t6382 = sp.edgeOf(v_t, v_x);
                                              _c6383 = ((_t6382 === _wc5912 ? _wd5913 : (_t6382 === _wc5910 ? _wd5911 : (b.grid[_t6382] || -1))) === 1);
                                            }
                                            if (!(_c6383)) continue;
                                            if (!_g6355.includes(v_x)) _g6355.push(v_x);
                                          }
                                        }
                                      }
                                      const _a6384 = union(_g6348, _g6355);
                                      for (let _i6385 = 0; _i6385 < _a6384.length; _i6385++) {
                                        const v_q = _a6384[_i6385];
                                        const _h6387 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h6386 - _h6387)) === cl.step))) {
                                          _q6308 = false;
                                          break Q6309;
                                        }
                                      }
                                    }
                                  }
                                  _c6388 = _q6308;
                                }
                                if (!((_c6388 && (_h5320 || !(throughWhere(sp, v_s, (_te6389: number): boolean => {  return ((_te6389 === _wc5912 ? _wd5913 : (_te6389 === _wc5910 ? _wd5911 : (b.grid[_te6389] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g6390 = 0;
                                G6391: {
                                  const _a6392 = sp.adj4[v_s];
                                  for (let _i6393 = 0; _i6393 < _a6392.length; _i6393++) {
                                    const v_y = _a6392[_i6393];
                                    const _t6394 = sp.edgeOf(v_s, v_y);
                                    if (!(((_t6394 === _wc5912 ? _wd5913 : (_t6394 === _wc5910 ? _wd5911 : (b.grid[_t6394] || -1))) === 1))) continue;
                                    _g6390++;
                                  }
                                }
                                let _g6395 = 0;
                                G6396: {
                                  const _a6397 = setOf(v_s);
                                  for (let _i6398 = 0; _i6398 < _a6397.length; _i6398++) {
                                    const v_k = _a6397[_i6398];
                                    const _h6399 = clueAt(cl.number, v_k);
                                    const _h6406 = (_h6399 + 1);
                                    let _c6408: boolean = (_h6399 !== -1);
                                    if (_c6408) {
                                      let _c6407: boolean = (_h5320 || (_h6399 === 1));
                                      if (!_c6407) {
                                        let _g6400 = 0;
                                        G6401: {
                                          const _t6402 = (_h6399 + 1);
                                          const _a6403 = cluesValued(cl.number, _t6402);
                                          for (let _i6404 = 0; _i6404 < _a6403.length; _i6404++) {
                                            const v_x = _a6403[_i6404];
                                            const _h6405 = clueAt(cl.number, v_x);
                                            if (!((_h6405 === _h6406))) continue;
                                            _g6400++;
                                          }
                                        }
                                        _c6407 = (_g6400 === 0);
                                      }
                                      _c6408 = _c6407;
                                    }
                                    if (!(_c6408)) continue;
                                    _g6395++;
                                  }
                                }
                                let _c6537: boolean = ((_g6390 + 1) === (2 - _g6395));
                                if (!_c6537) {
                                  let _q6409 = false;
                                  Q6410: {
                                    const _a6411 = sp.adj4[v_s];
                                    const _n6412 = _i6265;
                                    for (let _i6413 = 0; _i6413 < _n6412; _i6413++) {
                                      const v_z = _a6411[_i6413];
                                      const _t6414 = sp.edgeOf(v_s, v_z);
                                      let _c6434: boolean = !((_t6414 === _wc5912 ? true : (_t6414 === _wc5910 ? true : (b.grid[_t6414] !== 0))));
                                      if (_c6434) {
                                        let _g6415 = 0;
                                        G6416: {
                                          const _a6417 = sp.adj4[v_s];
                                          for (let _i6418 = 0; _i6418 < _a6417.length; _i6418++) {
                                            const v_y = _a6417[_i6418];
                                            const _t6419 = sp.edgeOf(v_s, v_y);
                                            if (!(((_t6419 === _wc5912 ? _wd5913 : (_t6419 === _wc5910 ? _wd5911 : (b.grid[_t6419] || -1))) === 1))) continue;
                                            _g6415++;
                                          }
                                        }
                                        let _g6420 = 0;
                                        G6421: {
                                          const _a6422 = setOf(v_s);
                                          for (let _i6423 = 0; _i6423 < _a6422.length; _i6423++) {
                                            const v_k = _a6422[_i6423];
                                            const _h6424 = clueAt(cl.number, v_k);
                                            const _h6431 = (_h6424 + 1);
                                            let _c6433: boolean = (_h6424 !== -1);
                                            if (_c6433) {
                                              let _c6432: boolean = (_h5320 || (_h6424 === 1));
                                              if (!_c6432) {
                                                let _g6425 = 0;
                                                G6426: {
                                                  const _t6427 = (_h6424 + 1);
                                                  const _a6428 = cluesValued(cl.number, _t6427);
                                                  for (let _i6429 = 0; _i6429 < _a6428.length; _i6429++) {
                                                    const v_x = _a6428[_i6429];
                                                    const _h6430 = clueAt(cl.number, v_x);
                                                    if (!((_h6430 === _h6431))) continue;
                                                    _g6425++;
                                                  }
                                                }
                                                _c6432 = (_g6425 === 0);
                                              }
                                              _c6433 = _c6432;
                                            }
                                            if (!(_c6433)) continue;
                                            _g6420++;
                                          }
                                        }
                                        _c6434 = (_g6415 < (2 - _g6420));
                                      }
                                      let _c6454: boolean = _c6434;
                                      if (_c6454) {
                                        let _g6435 = 0;
                                        G6436: {
                                          const _a6437 = sp.adj4[v_z];
                                          for (let _i6438 = 0; _i6438 < _a6437.length; _i6438++) {
                                            const v_y = _a6437[_i6438];
                                            const _t6439 = sp.edgeOf(v_z, v_y);
                                            if (!(((_t6439 === _wc5912 ? _wd5913 : (_t6439 === _wc5910 ? _wd5911 : (b.grid[_t6439] || -1))) === 1))) continue;
                                            _g6435++;
                                          }
                                        }
                                        let _g6440 = 0;
                                        G6441: {
                                          const _a6442 = setOf(v_z);
                                          for (let _i6443 = 0; _i6443 < _a6442.length; _i6443++) {
                                            const v_k = _a6442[_i6443];
                                            const _h6444 = clueAt(cl.number, v_k);
                                            const _h6451 = (_h6444 + 1);
                                            let _c6453: boolean = (_h6444 !== -1);
                                            if (_c6453) {
                                              let _c6452: boolean = (_h5320 || (_h6444 === 1));
                                              if (!_c6452) {
                                                let _g6445 = 0;
                                                G6446: {
                                                  const _t6447 = (_h6444 + 1);
                                                  const _a6448 = cluesValued(cl.number, _t6447);
                                                  for (let _i6449 = 0; _i6449 < _a6448.length; _i6449++) {
                                                    const v_x = _a6448[_i6449];
                                                    const _h6450 = clueAt(cl.number, v_x);
                                                    if (!((_h6450 === _h6451))) continue;
                                                    _g6445++;
                                                  }
                                                }
                                                _c6452 = (_g6445 === 0);
                                              }
                                              _c6453 = _c6452;
                                            }
                                            if (!(_c6453)) continue;
                                            _g6440++;
                                          }
                                        }
                                        _c6454 = (_g6435 < (2 - _g6440));
                                      }
                                      let _c6535: boolean = _c6454;
                                      if (_c6535) {
                                        let _q6455 = true;
                                        Q6456: {
                                          _g6457.length = 0;
                                          G6458: {
                                            const _a6461 = setOf(v_s);
                                            for (let _i6462 = 0; _i6462 < _a6461.length; _i6462++) {
                                              const v_x = _a6461[_i6462];
                                              const _h6463 = clueAt(cl.number, v_x);
                                              if (!((_h6463 !== -1))) continue;
                                              _g6457.push(v_x);
                                            }
                                          }
                                          _g6464.length = 0;
                                          G6465: {
                                            const _a6482 = throughWhere(sp, v_s, (_te6477: number): boolean => { let _c6479: boolean = ((_te6477 === _wc5912 ? _wd5913 : (_te6477 === _wc5910 ? _wd5911 : (b.grid[_te6477] || -1))) === 1); if (_c6479) {   const _t6478 = sp.edgeEnds[2 * _te6477];   _c6479 = !((clueAt(cl.number, _t6478) !== -1)); } let _c6481: boolean = _c6479; if (_c6481) {   const _t6480 = sp.edgeEnds[2 * _te6477 + 1];   _c6481 = !((clueAt(cl.number, _t6480) !== -1)); } return _c6481; });
                                            for (let _i6483 = 0; _i6483 < _a6482.length; _i6483++) {
                                              const v_t = _a6482[_i6483];
                                              const _h6486 = clueAt(cl.number, v_t);
                                              const _h6487 = (_h6486 !== -1);
                                              const _h6488 = _h6487;
                                              const _h6489 = !(_h6488);
                                              const _a6484 = sp.adj4[v_t];
                                              for (let _i6485 = 0; _i6485 < _a6484.length; _i6485++) {
                                                const v_x = _a6484[_i6485];
                                                const _h6490 = clueAt(cl.number, v_x);
                                                let _c6492: boolean = (_h6489 && (_h6490 !== -1));
                                                if (_c6492) {
                                                  const _t6491 = sp.edgeOf(v_t, v_x);
                                                  _c6492 = ((_t6491 === _wc5912 ? _wd5913 : (_t6491 === _wc5910 ? _wd5911 : (b.grid[_t6491] || -1))) === 1);
                                                }
                                                if (!(_c6492)) continue;
                                                if (!_g6464.includes(v_x)) _g6464.push(v_x);
                                              }
                                            }
                                          }
                                          const _a6493 = union(_g6457, _g6464);
                                          for (let _i6494 = 0; _i6494 < _a6493.length; _i6494++) {
                                            const v_p = _a6493[_i6494];
                                            const _h6533 = clueAt(cl.number, v_p);
                                            _g6495.length = 0;
                                            G6496: {
                                              const _a6499 = setOf(v_z);
                                              for (let _i6500 = 0; _i6500 < _a6499.length; _i6500++) {
                                                const v_x = _a6499[_i6500];
                                                const _h6501 = clueAt(cl.number, v_x);
                                                if (!((_h6501 !== -1))) continue;
                                                _g6495.push(v_x);
                                              }
                                            }
                                            _g6502.length = 0;
                                            G6503: {
                                              const _a6520 = throughWhere(sp, v_z, (_te6515: number): boolean => { let _c6517: boolean = ((_te6515 === _wc5912 ? _wd5913 : (_te6515 === _wc5910 ? _wd5911 : (b.grid[_te6515] || -1))) === 1); if (_c6517) {   const _t6516 = sp.edgeEnds[2 * _te6515];   _c6517 = !((clueAt(cl.number, _t6516) !== -1)); } let _c6519: boolean = _c6517; if (_c6519) {   const _t6518 = sp.edgeEnds[2 * _te6515 + 1];   _c6519 = !((clueAt(cl.number, _t6518) !== -1)); } return _c6519; });
                                              for (let _i6521 = 0; _i6521 < _a6520.length; _i6521++) {
                                                const v_t = _a6520[_i6521];
                                                const _h6524 = clueAt(cl.number, v_t);
                                                const _h6525 = (_h6524 !== -1);
                                                const _h6526 = _h6525;
                                                const _h6527 = !(_h6526);
                                                const _a6522 = sp.adj4[v_t];
                                                for (let _i6523 = 0; _i6523 < _a6522.length; _i6523++) {
                                                  const v_x = _a6522[_i6523];
                                                  const _h6528 = clueAt(cl.number, v_x);
                                                  let _c6530: boolean = (_h6527 && (_h6528 !== -1));
                                                  if (_c6530) {
                                                    const _t6529 = sp.edgeOf(v_t, v_x);
                                                    _c6530 = ((_t6529 === _wc5912 ? _wd5913 : (_t6529 === _wc5910 ? _wd5911 : (b.grid[_t6529] || -1))) === 1);
                                                  }
                                                  if (!(_c6530)) continue;
                                                  if (!_g6502.includes(v_x)) _g6502.push(v_x);
                                                }
                                              }
                                            }
                                            const _a6531 = union(_g6495, _g6502);
                                            for (let _i6532 = 0; _i6532 < _a6531.length; _i6532++) {
                                              const v_q = _a6531[_i6532];
                                              const _h6534 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h6533 - _h6534)) === cl.step))) {
                                                _q6455 = false;
                                                break Q6456;
                                              }
                                            }
                                          }
                                        }
                                        _c6535 = _q6455;
                                      }
                                      if ((_c6535 && (_h5320 || !(throughWhere(sp, v_s, (_te6536: number): boolean => {  return ((_te6536 === _wc5912 ? _wd5913 : (_te6536 === _wc5910 ? _wd5911 : (b.grid[_te6536] || -1))) === 1); }).includes(v_z))))) {
                                        _q6409 = true;
                                        break Q6410;
                                      }
                                    }
                                  }
                                  _c6537 = _q6409;
                                }
                                if (_c6537) {
                                  _q6262 = true;
                                  break Q6263;
                                }
                              }
                            }
                            _c6538 = !(_q6262);
                          }
                          if (_c6538) {
                            _q6239 = true;
                            break Q6240;
                          }
                        }
                      }
                      _c6539 = _q6239;
                    }
                    if (_c6539) {
                      _q5914 = true;
                      break Q5915;
                    }
                  }
                }
                _c6540 = _q5914;
              }
              _c6541 = _c6540;
            }
            if (!(_c6541)) continue;
            if (!_g5336.includes(v_j)) _g5336.push(v_j);
          }
        }
      }
      const v_A = _g5336;
      const _h7761 = v_A.length;
      const _h7762 = (_h7761 < 3);
      _g6542.length = 0;
      G6543: {
        const _a7095 = v_U;
        for (let _i7096 = 0; _i7096 < _a7095.length; _i7096++) {
          const v_i = _a7095[_i7096];
          const _h7099 = _i7096;
          const _h7100 = (_h7099 > 0);
          const _h7112 = sp.edgeOf(v_c, v_i);
          const _a7097 = v_U;
          for (let _i7098 = 0; _i7098 < _a7097.length; _i7098++) {
            const v_j = _a7097[_i7098];
            let _c7744: boolean = (_h7100 && (_h7099 < _i7098));
            if (_c7744) {
              let _c7111: boolean = (throughWhere(sp, v_i, (_te7101: number): boolean => {  return ((b.grid[_te7101] || -1) === 1); }).includes(v_j));
              if (!_c7111) {
                let _c7110: boolean = _h5898;
                if (_c7110) {
                  let _q7102 = true;
                  Q7103: {
                    const _a7104 = nearest(b, sp, cl, v_i);
                    for (let _i7105 = 0; _i7105 < _a7104.length; _i7105++) {
                      const v_p = _a7104[_i7105];
                      const _h7108 = clueAt(cl.number, v_p);
                      const _a7106 = nearest(b, sp, cl, v_j);
                      for (let _i7107 = 0; _i7107 < _a7106.length; _i7107++) {
                        const v_q = _a7106[_i7107];
                        const _h7109 = clueAt(cl.number, v_q);
                        if (!((Math.abs((_h7108 - _h7109)) === cl.step))) {
                          _q7102 = false;
                          break Q7103;
                        }
                      }
                    }
                  }
                  _c7110 = !(_q7102);
                }
                _c7111 = _c7110;
              }
              let _c7743: boolean = _c7111;
              if (!_c7743) {
                const _wc7113 = _h7112;
                const _wd7114 = 1;
                const _wc7115 = sp.edgeOf(v_c, v_j);
                const _wd7116 = 1;
                let _q7117 = false;
                Q7118: {
                  const _a7120 = throughWhere(sp, v_c, (_te7119: number): boolean => {  return ((_te7119 === _wc7115 ? _wd7116 : (_te7119 === _wc7113 ? _wd7114 : (b.grid[_te7119] || -1))) === 1); });
                  for (let _i7121 = 0; _i7121 < _a7120.length; _i7121++) {
                    const v_t = _a7120[_i7121];
                    let _c7141: boolean = (((v_t === v_c) || (v_t === v_i)) || (v_t === v_j));
                    if (!_c7141) {
                      let _g7122 = 0;
                      G7123: {
                        const _a7124 = sp.adj4[v_t];
                        for (let _i7125 = 0; _i7125 < _a7124.length; _i7125++) {
                          const v_y = _a7124[_i7125];
                          const _t7126 = sp.edgeOf(v_t, v_y);
                          if (!(((_t7126 === _wc7115 ? _wd7116 : (_t7126 === _wc7113 ? _wd7114 : (b.grid[_t7126] || -1))) === 1))) continue;
                          _g7122++;
                        }
                      }
                      let _g7127 = 0;
                      G7128: {
                        const _a7129 = setOf(v_t);
                        for (let _i7130 = 0; _i7130 < _a7129.length; _i7130++) {
                          const v_k = _a7129[_i7130];
                          const _h7131 = clueAt(cl.number, v_k);
                          const _h7138 = (_h7131 + 1);
                          let _c7140: boolean = (_h7131 !== -1);
                          if (_c7140) {
                            let _c7139: boolean = (_h5320 || (_h7131 === 1));
                            if (!_c7139) {
                              let _g7132 = 0;
                              G7133: {
                                const _t7134 = (_h7131 + 1);
                                const _a7135 = cluesValued(cl.number, _t7134);
                                for (let _i7136 = 0; _i7136 < _a7135.length; _i7136++) {
                                  const v_x = _a7135[_i7136];
                                  const _h7137 = clueAt(cl.number, v_x);
                                  if (!((_h7137 === _h7138))) continue;
                                  _g7132++;
                                }
                              }
                              _c7139 = (_g7132 === 0);
                            }
                            _c7140 = _c7139;
                          }
                          if (!(_c7140)) continue;
                          _g7127++;
                        }
                      }
                      _c7141 = (_g7122 < (2 - _g7127));
                    }
                    if (!(_c7141)) continue;
                    let _g7142 = 0;
                    G7143: {
                      const _a7144 = sp.adj4[v_t];
                      for (let _i7145 = 0; _i7145 < _a7144.length; _i7145++) {
                        const v_y = _a7144[_i7145];
                        const _t7146 = sp.edgeOf(v_t, v_y);
                        if (!(((_t7146 === _wc7115 ? _wd7116 : (_t7146 === _wc7113 ? _wd7114 : (b.grid[_t7146] || -1))) === 1))) continue;
                        _g7142++;
                      }
                    }
                    let _g7147 = 0;
                    G7148: {
                      const _a7149 = setOf(v_t);
                      for (let _i7150 = 0; _i7150 < _a7149.length; _i7150++) {
                        const v_k = _a7149[_i7150];
                        const _h7151 = clueAt(cl.number, v_k);
                        const _h7158 = (_h7151 + 1);
                        let _c7160: boolean = (_h7151 !== -1);
                        if (_c7160) {
                          let _c7159: boolean = (_h5320 || (_h7151 === 1));
                          if (!_c7159) {
                            let _g7152 = 0;
                            G7153: {
                              const _t7154 = (_h7151 + 1);
                              const _a7155 = cluesValued(cl.number, _t7154);
                              for (let _i7156 = 0; _i7156 < _a7155.length; _i7156++) {
                                const v_x = _a7155[_i7156];
                                const _h7157 = clueAt(cl.number, v_x);
                                if (!((_h7157 === _h7158))) continue;
                                _g7152++;
                              }
                            }
                            _c7159 = (_g7152 === 0);
                          }
                          _c7160 = _c7159;
                        }
                        if (!(_c7160)) continue;
                        _g7147++;
                      }
                    }
                    let _c7441: boolean = (_g7142 < (2 - _g7147));
                    if (_c7441) {
                      let _q7161 = false;
                      Q7162: {
                        const _a7163 = sp.adj4[v_t];
                        for (let _i7164 = 0; _i7164 < _a7163.length; _i7164++) {
                          const v_y = _a7163[_i7164];
                          const _t7165 = sp.edgeOf(v_t, v_y);
                          let _c7185: boolean = !((_t7165 === _wc7115 ? true : (_t7165 === _wc7113 ? true : (b.grid[_t7165] !== 0))));
                          if (_c7185) {
                            let _g7166 = 0;
                            G7167: {
                              const _a7168 = sp.adj4[v_t];
                              for (let _i7169 = 0; _i7169 < _a7168.length; _i7169++) {
                                const v_y = _a7168[_i7169];
                                const _t7170 = sp.edgeOf(v_t, v_y);
                                if (!(((_t7170 === _wc7115 ? _wd7116 : (_t7170 === _wc7113 ? _wd7114 : (b.grid[_t7170] || -1))) === 1))) continue;
                                _g7166++;
                              }
                            }
                            let _g7171 = 0;
                            G7172: {
                              const _a7173 = setOf(v_t);
                              for (let _i7174 = 0; _i7174 < _a7173.length; _i7174++) {
                                const v_k = _a7173[_i7174];
                                const _h7175 = clueAt(cl.number, v_k);
                                const _h7182 = (_h7175 + 1);
                                let _c7184: boolean = (_h7175 !== -1);
                                if (_c7184) {
                                  let _c7183: boolean = (_h5320 || (_h7175 === 1));
                                  if (!_c7183) {
                                    let _g7176 = 0;
                                    G7177: {
                                      const _t7178 = (_h7175 + 1);
                                      const _a7179 = cluesValued(cl.number, _t7178);
                                      for (let _i7180 = 0; _i7180 < _a7179.length; _i7180++) {
                                        const v_x = _a7179[_i7180];
                                        const _h7181 = clueAt(cl.number, v_x);
                                        if (!((_h7181 === _h7182))) continue;
                                        _g7176++;
                                      }
                                    }
                                    _c7183 = (_g7176 === 0);
                                  }
                                  _c7184 = _c7183;
                                }
                                if (!(_c7184)) continue;
                                _g7171++;
                              }
                            }
                            _c7185 = (_g7166 < (2 - _g7171));
                          }
                          let _c7206: boolean = _c7185;
                          if (_c7206) {
                            let _g7186 = 0;
                            G7187: {
                              const _a7189 = sp.adj4[v_y];
                              for (let _i7190 = 0; _i7190 < _a7189.length; _i7190++) {
                                const v_y_7188 = _a7189[_i7190];
                                const _t7191 = sp.edgeOf(v_y, v_y_7188);
                                if (!(((_t7191 === _wc7115 ? _wd7116 : (_t7191 === _wc7113 ? _wd7114 : (b.grid[_t7191] || -1))) === 1))) continue;
                                _g7186++;
                              }
                            }
                            let _g7192 = 0;
                            G7193: {
                              const _a7194 = setOf(v_y);
                              for (let _i7195 = 0; _i7195 < _a7194.length; _i7195++) {
                                const v_k = _a7194[_i7195];
                                const _h7196 = clueAt(cl.number, v_k);
                                const _h7203 = (_h7196 + 1);
                                let _c7205: boolean = (_h7196 !== -1);
                                if (_c7205) {
                                  let _c7204: boolean = (_h5320 || (_h7196 === 1));
                                  if (!_c7204) {
                                    let _g7197 = 0;
                                    G7198: {
                                      const _t7199 = (_h7196 + 1);
                                      const _a7200 = cluesValued(cl.number, _t7199);
                                      for (let _i7201 = 0; _i7201 < _a7200.length; _i7201++) {
                                        const v_x = _a7200[_i7201];
                                        const _h7202 = clueAt(cl.number, v_x);
                                        if (!((_h7202 === _h7203))) continue;
                                        _g7197++;
                                      }
                                    }
                                    _c7204 = (_g7197 === 0);
                                  }
                                  _c7205 = _c7204;
                                }
                                if (!(_c7205)) continue;
                                _g7192++;
                              }
                            }
                            _c7206 = (_g7186 < (2 - _g7192));
                          }
                          let _c7289: boolean = _c7206;
                          if (_c7289) {
                            let _q7207 = true;
                            Q7208: {
                              _g7209.length = 0;
                              G7210: {
                                const _a7213 = setOf(v_t);
                                for (let _i7214 = 0; _i7214 < _a7213.length; _i7214++) {
                                  const v_x = _a7213[_i7214];
                                  const _h7215 = clueAt(cl.number, v_x);
                                  if (!((_h7215 !== -1))) continue;
                                  _g7209.push(v_x);
                                }
                              }
                              _g7216.length = 0;
                              G7217: {
                                const _a7236 = throughWhere(sp, v_t, (_te7231: number): boolean => { let _c7233: boolean = ((_te7231 === _wc7115 ? _wd7116 : (_te7231 === _wc7113 ? _wd7114 : (b.grid[_te7231] || -1))) === 1); if (_c7233) {   const _t7232 = sp.edgeEnds[2 * _te7231];   _c7233 = !((clueAt(cl.number, _t7232) !== -1)); } let _c7235: boolean = _c7233; if (_c7235) {   const _t7234 = sp.edgeEnds[2 * _te7231 + 1];   _c7235 = !((clueAt(cl.number, _t7234) !== -1)); } return _c7235; });
                                for (let _i7237 = 0; _i7237 < _a7236.length; _i7237++) {
                                  const v_t_7230 = _a7236[_i7237];
                                  const _h7240 = clueAt(cl.number, v_t_7230);
                                  const _h7241 = (_h7240 !== -1);
                                  const _h7242 = _h7241;
                                  const _h7243 = !(_h7242);
                                  const _a7238 = sp.adj4[v_t_7230];
                                  for (let _i7239 = 0; _i7239 < _a7238.length; _i7239++) {
                                    const v_x = _a7238[_i7239];
                                    const _h7244 = clueAt(cl.number, v_x);
                                    let _c7246: boolean = (_h7243 && (_h7244 !== -1));
                                    if (_c7246) {
                                      const _t7245 = sp.edgeOf(v_t_7230, v_x);
                                      _c7246 = ((_t7245 === _wc7115 ? _wd7116 : (_t7245 === _wc7113 ? _wd7114 : (b.grid[_t7245] || -1))) === 1);
                                    }
                                    if (!(_c7246)) continue;
                                    if (!_g7216.includes(v_x)) _g7216.push(v_x);
                                  }
                                }
                              }
                              const _a7247 = union(_g7209, _g7216);
                              for (let _i7248 = 0; _i7248 < _a7247.length; _i7248++) {
                                const v_p = _a7247[_i7248];
                                const _h7287 = clueAt(cl.number, v_p);
                                _g7249.length = 0;
                                G7250: {
                                  const _a7253 = setOf(v_y);
                                  for (let _i7254 = 0; _i7254 < _a7253.length; _i7254++) {
                                    const v_x = _a7253[_i7254];
                                    const _h7255 = clueAt(cl.number, v_x);
                                    if (!((_h7255 !== -1))) continue;
                                    _g7249.push(v_x);
                                  }
                                }
                                _g7256.length = 0;
                                G7257: {
                                  const _a7274 = throughWhere(sp, v_y, (_te7269: number): boolean => { let _c7271: boolean = ((_te7269 === _wc7115 ? _wd7116 : (_te7269 === _wc7113 ? _wd7114 : (b.grid[_te7269] || -1))) === 1); if (_c7271) {   const _t7270 = sp.edgeEnds[2 * _te7269];   _c7271 = !((clueAt(cl.number, _t7270) !== -1)); } let _c7273: boolean = _c7271; if (_c7273) {   const _t7272 = sp.edgeEnds[2 * _te7269 + 1];   _c7273 = !((clueAt(cl.number, _t7272) !== -1)); } return _c7273; });
                                  for (let _i7275 = 0; _i7275 < _a7274.length; _i7275++) {
                                    const v_t = _a7274[_i7275];
                                    const _h7278 = clueAt(cl.number, v_t);
                                    const _h7279 = (_h7278 !== -1);
                                    const _h7280 = _h7279;
                                    const _h7281 = !(_h7280);
                                    const _a7276 = sp.adj4[v_t];
                                    for (let _i7277 = 0; _i7277 < _a7276.length; _i7277++) {
                                      const v_x = _a7276[_i7277];
                                      const _h7282 = clueAt(cl.number, v_x);
                                      let _c7284: boolean = (_h7281 && (_h7282 !== -1));
                                      if (_c7284) {
                                        const _t7283 = sp.edgeOf(v_t, v_x);
                                        _c7284 = ((_t7283 === _wc7115 ? _wd7116 : (_t7283 === _wc7113 ? _wd7114 : (b.grid[_t7283] || -1))) === 1);
                                      }
                                      if (!(_c7284)) continue;
                                      if (!_g7256.includes(v_x)) _g7256.push(v_x);
                                    }
                                  }
                                }
                                const _a7285 = union(_g7249, _g7256);
                                for (let _i7286 = 0; _i7286 < _a7285.length; _i7286++) {
                                  const v_q = _a7285[_i7286];
                                  const _h7288 = clueAt(cl.number, v_q);
                                  if (!((Math.abs((_h7287 - _h7288)) === cl.step))) {
                                    _q7207 = false;
                                    break Q7208;
                                  }
                                }
                              }
                            }
                            _c7289 = _q7207;
                          }
                          if (!((_c7289 && (_h5320 || !(throughWhere(sp, v_t, (_te7290: number): boolean => {  return ((_te7290 === _wc7115 ? _wd7116 : (_te7290 === _wc7113 ? _wd7114 : (b.grid[_te7290] || -1))) === 1); }).includes(v_y)))))) continue;
                          let _g7291 = 0;
                          G7292: {
                            const _a7293 = sp.adj4[v_t];
                            for (let _i7294 = 0; _i7294 < _a7293.length; _i7294++) {
                              const v_y = _a7293[_i7294];
                              const _t7295 = sp.edgeOf(v_t, v_y);
                              if (!(((_t7295 === _wc7115 ? _wd7116 : (_t7295 === _wc7113 ? _wd7114 : (b.grid[_t7295] || -1))) === 1))) continue;
                              _g7291++;
                            }
                          }
                          let _g7296 = 0;
                          G7297: {
                            const _a7298 = setOf(v_t);
                            for (let _i7299 = 0; _i7299 < _a7298.length; _i7299++) {
                              const v_k = _a7298[_i7299];
                              const _h7300 = clueAt(cl.number, v_k);
                              const _h7307 = (_h7300 + 1);
                              let _c7309: boolean = (_h7300 !== -1);
                              if (_c7309) {
                                let _c7308: boolean = (_h5320 || (_h7300 === 1));
                                if (!_c7308) {
                                  let _g7301 = 0;
                                  G7302: {
                                    const _t7303 = (_h7300 + 1);
                                    const _a7304 = cluesValued(cl.number, _t7303);
                                    for (let _i7305 = 0; _i7305 < _a7304.length; _i7305++) {
                                      const v_x = _a7304[_i7305];
                                      const _h7306 = clueAt(cl.number, v_x);
                                      if (!((_h7306 === _h7307))) continue;
                                      _g7301++;
                                    }
                                  }
                                  _c7308 = (_g7301 === 0);
                                }
                                _c7309 = _c7308;
                              }
                              if (!(_c7309)) continue;
                              _g7296++;
                            }
                          }
                          let _c7440: boolean = ((_g7291 + 1) === (2 - _g7296));
                          if (!_c7440) {
                            let _q7310 = false;
                            Q7311: {
                              const _a7312 = sp.adj4[v_t];
                              const _n7313 = _i7164;
                              for (let _i7314 = 0; _i7314 < _n7313; _i7314++) {
                                const v_z = _a7312[_i7314];
                                const _t7315 = sp.edgeOf(v_t, v_z);
                                let _c7335: boolean = !((_t7315 === _wc7115 ? true : (_t7315 === _wc7113 ? true : (b.grid[_t7315] !== 0))));
                                if (_c7335) {
                                  let _g7316 = 0;
                                  G7317: {
                                    const _a7318 = sp.adj4[v_t];
                                    for (let _i7319 = 0; _i7319 < _a7318.length; _i7319++) {
                                      const v_y = _a7318[_i7319];
                                      const _t7320 = sp.edgeOf(v_t, v_y);
                                      if (!(((_t7320 === _wc7115 ? _wd7116 : (_t7320 === _wc7113 ? _wd7114 : (b.grid[_t7320] || -1))) === 1))) continue;
                                      _g7316++;
                                    }
                                  }
                                  let _g7321 = 0;
                                  G7322: {
                                    const _a7323 = setOf(v_t);
                                    for (let _i7324 = 0; _i7324 < _a7323.length; _i7324++) {
                                      const v_k = _a7323[_i7324];
                                      const _h7325 = clueAt(cl.number, v_k);
                                      const _h7332 = (_h7325 + 1);
                                      let _c7334: boolean = (_h7325 !== -1);
                                      if (_c7334) {
                                        let _c7333: boolean = (_h5320 || (_h7325 === 1));
                                        if (!_c7333) {
                                          let _g7326 = 0;
                                          G7327: {
                                            const _t7328 = (_h7325 + 1);
                                            const _a7329 = cluesValued(cl.number, _t7328);
                                            for (let _i7330 = 0; _i7330 < _a7329.length; _i7330++) {
                                              const v_x = _a7329[_i7330];
                                              const _h7331 = clueAt(cl.number, v_x);
                                              if (!((_h7331 === _h7332))) continue;
                                              _g7326++;
                                            }
                                          }
                                          _c7333 = (_g7326 === 0);
                                        }
                                        _c7334 = _c7333;
                                      }
                                      if (!(_c7334)) continue;
                                      _g7321++;
                                    }
                                  }
                                  _c7335 = (_g7316 < (2 - _g7321));
                                }
                                let _c7355: boolean = _c7335;
                                if (_c7355) {
                                  let _g7336 = 0;
                                  G7337: {
                                    const _a7338 = sp.adj4[v_z];
                                    for (let _i7339 = 0; _i7339 < _a7338.length; _i7339++) {
                                      const v_y = _a7338[_i7339];
                                      const _t7340 = sp.edgeOf(v_z, v_y);
                                      if (!(((_t7340 === _wc7115 ? _wd7116 : (_t7340 === _wc7113 ? _wd7114 : (b.grid[_t7340] || -1))) === 1))) continue;
                                      _g7336++;
                                    }
                                  }
                                  let _g7341 = 0;
                                  G7342: {
                                    const _a7343 = setOf(v_z);
                                    for (let _i7344 = 0; _i7344 < _a7343.length; _i7344++) {
                                      const v_k = _a7343[_i7344];
                                      const _h7345 = clueAt(cl.number, v_k);
                                      const _h7352 = (_h7345 + 1);
                                      let _c7354: boolean = (_h7345 !== -1);
                                      if (_c7354) {
                                        let _c7353: boolean = (_h5320 || (_h7345 === 1));
                                        if (!_c7353) {
                                          let _g7346 = 0;
                                          G7347: {
                                            const _t7348 = (_h7345 + 1);
                                            const _a7349 = cluesValued(cl.number, _t7348);
                                            for (let _i7350 = 0; _i7350 < _a7349.length; _i7350++) {
                                              const v_x = _a7349[_i7350];
                                              const _h7351 = clueAt(cl.number, v_x);
                                              if (!((_h7351 === _h7352))) continue;
                                              _g7346++;
                                            }
                                          }
                                          _c7353 = (_g7346 === 0);
                                        }
                                        _c7354 = _c7353;
                                      }
                                      if (!(_c7354)) continue;
                                      _g7341++;
                                    }
                                  }
                                  _c7355 = (_g7336 < (2 - _g7341));
                                }
                                let _c7438: boolean = _c7355;
                                if (_c7438) {
                                  let _q7356 = true;
                                  Q7357: {
                                    _g7358.length = 0;
                                    G7359: {
                                      const _a7362 = setOf(v_t);
                                      for (let _i7363 = 0; _i7363 < _a7362.length; _i7363++) {
                                        const v_x = _a7362[_i7363];
                                        const _h7364 = clueAt(cl.number, v_x);
                                        if (!((_h7364 !== -1))) continue;
                                        _g7358.push(v_x);
                                      }
                                    }
                                    _g7365.length = 0;
                                    G7366: {
                                      const _a7385 = throughWhere(sp, v_t, (_te7380: number): boolean => { let _c7382: boolean = ((_te7380 === _wc7115 ? _wd7116 : (_te7380 === _wc7113 ? _wd7114 : (b.grid[_te7380] || -1))) === 1); if (_c7382) {   const _t7381 = sp.edgeEnds[2 * _te7380];   _c7382 = !((clueAt(cl.number, _t7381) !== -1)); } let _c7384: boolean = _c7382; if (_c7384) {   const _t7383 = sp.edgeEnds[2 * _te7380 + 1];   _c7384 = !((clueAt(cl.number, _t7383) !== -1)); } return _c7384; });
                                      for (let _i7386 = 0; _i7386 < _a7385.length; _i7386++) {
                                        const v_t_7379 = _a7385[_i7386];
                                        const _h7389 = clueAt(cl.number, v_t_7379);
                                        const _h7390 = (_h7389 !== -1);
                                        const _h7391 = _h7390;
                                        const _h7392 = !(_h7391);
                                        const _a7387 = sp.adj4[v_t_7379];
                                        for (let _i7388 = 0; _i7388 < _a7387.length; _i7388++) {
                                          const v_x = _a7387[_i7388];
                                          const _h7393 = clueAt(cl.number, v_x);
                                          let _c7395: boolean = (_h7392 && (_h7393 !== -1));
                                          if (_c7395) {
                                            const _t7394 = sp.edgeOf(v_t_7379, v_x);
                                            _c7395 = ((_t7394 === _wc7115 ? _wd7116 : (_t7394 === _wc7113 ? _wd7114 : (b.grid[_t7394] || -1))) === 1);
                                          }
                                          if (!(_c7395)) continue;
                                          if (!_g7365.includes(v_x)) _g7365.push(v_x);
                                        }
                                      }
                                    }
                                    const _a7396 = union(_g7358, _g7365);
                                    for (let _i7397 = 0; _i7397 < _a7396.length; _i7397++) {
                                      const v_p = _a7396[_i7397];
                                      const _h7436 = clueAt(cl.number, v_p);
                                      _g7398.length = 0;
                                      G7399: {
                                        const _a7402 = setOf(v_z);
                                        for (let _i7403 = 0; _i7403 < _a7402.length; _i7403++) {
                                          const v_x = _a7402[_i7403];
                                          const _h7404 = clueAt(cl.number, v_x);
                                          if (!((_h7404 !== -1))) continue;
                                          _g7398.push(v_x);
                                        }
                                      }
                                      _g7405.length = 0;
                                      G7406: {
                                        const _a7423 = throughWhere(sp, v_z, (_te7418: number): boolean => { let _c7420: boolean = ((_te7418 === _wc7115 ? _wd7116 : (_te7418 === _wc7113 ? _wd7114 : (b.grid[_te7418] || -1))) === 1); if (_c7420) {   const _t7419 = sp.edgeEnds[2 * _te7418];   _c7420 = !((clueAt(cl.number, _t7419) !== -1)); } let _c7422: boolean = _c7420; if (_c7422) {   const _t7421 = sp.edgeEnds[2 * _te7418 + 1];   _c7422 = !((clueAt(cl.number, _t7421) !== -1)); } return _c7422; });
                                        for (let _i7424 = 0; _i7424 < _a7423.length; _i7424++) {
                                          const v_t = _a7423[_i7424];
                                          const _h7427 = clueAt(cl.number, v_t);
                                          const _h7428 = (_h7427 !== -1);
                                          const _h7429 = _h7428;
                                          const _h7430 = !(_h7429);
                                          const _a7425 = sp.adj4[v_t];
                                          for (let _i7426 = 0; _i7426 < _a7425.length; _i7426++) {
                                            const v_x = _a7425[_i7426];
                                            const _h7431 = clueAt(cl.number, v_x);
                                            let _c7433: boolean = (_h7430 && (_h7431 !== -1));
                                            if (_c7433) {
                                              const _t7432 = sp.edgeOf(v_t, v_x);
                                              _c7433 = ((_t7432 === _wc7115 ? _wd7116 : (_t7432 === _wc7113 ? _wd7114 : (b.grid[_t7432] || -1))) === 1);
                                            }
                                            if (!(_c7433)) continue;
                                            if (!_g7405.includes(v_x)) _g7405.push(v_x);
                                          }
                                        }
                                      }
                                      const _a7434 = union(_g7398, _g7405);
                                      for (let _i7435 = 0; _i7435 < _a7434.length; _i7435++) {
                                        const v_q = _a7434[_i7435];
                                        const _h7437 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7436 - _h7437)) === cl.step))) {
                                          _q7356 = false;
                                          break Q7357;
                                        }
                                      }
                                    }
                                  }
                                  _c7438 = _q7356;
                                }
                                if ((_c7438 && (_h5320 || !(throughWhere(sp, v_t, (_te7439: number): boolean => {  return ((_te7439 === _wc7115 ? _wd7116 : (_te7439 === _wc7113 ? _wd7114 : (b.grid[_te7439] || -1))) === 1); }).includes(v_z))))) {
                                  _q7310 = true;
                                  break Q7311;
                                }
                              }
                            }
                            _c7440 = _q7310;
                          }
                          if (_c7440) {
                            _q7161 = true;
                            break Q7162;
                          }
                        }
                      }
                      _c7441 = !(_q7161);
                    }
                    let _c7742: boolean = _c7441;
                    if (!_c7742) {
                      let _q7442 = false;
                      Q7443: {
                        const _a7444 = sp.adj4[v_t];
                        for (let _i7445 = 0; _i7445 < _a7444.length; _i7445++) {
                          const v_s = _a7444[_i7445];
                          let _g7446 = 0;
                          G7447: {
                            const _a7448 = sp.adj4[v_s];
                            for (let _i7449 = 0; _i7449 < _a7448.length; _i7449++) {
                              const v_y = _a7448[_i7449];
                              const _t7450 = sp.edgeOf(v_s, v_y);
                              if (!(((_t7450 === _wc7115 ? _wd7116 : (_t7450 === _wc7113 ? _wd7114 : (b.grid[_t7450] || -1))) === 1))) continue;
                              _g7446++;
                            }
                          }
                          let _g7451 = 0;
                          G7452: {
                            const _a7453 = setOf(v_s);
                            for (let _i7454 = 0; _i7454 < _a7453.length; _i7454++) {
                              const v_k = _a7453[_i7454];
                              const _h7455 = clueAt(cl.number, v_k);
                              const _h7462 = (_h7455 + 1);
                              let _c7464: boolean = (_h7455 !== -1);
                              if (_c7464) {
                                let _c7463: boolean = (_h5320 || (_h7455 === 1));
                                if (!_c7463) {
                                  let _g7456 = 0;
                                  G7457: {
                                    const _t7458 = (_h7455 + 1);
                                    const _a7459 = cluesValued(cl.number, _t7458);
                                    for (let _i7460 = 0; _i7460 < _a7459.length; _i7460++) {
                                      const v_x = _a7459[_i7460];
                                      const _h7461 = clueAt(cl.number, v_x);
                                      if (!((_h7461 === _h7462))) continue;
                                      _g7456++;
                                    }
                                  }
                                  _c7463 = (_g7456 === 0);
                                }
                                _c7464 = _c7463;
                              }
                              if (!(_c7464)) continue;
                              _g7451++;
                            }
                          }
                          let _c7741: boolean = (_g7446 < (2 - _g7451));
                          if (_c7741) {
                            let _q7465 = false;
                            Q7466: {
                              const _a7467 = sp.adj4[v_s];
                              for (let _i7468 = 0; _i7468 < _a7467.length; _i7468++) {
                                const v_y = _a7467[_i7468];
                                const _t7469 = sp.edgeOf(v_s, v_y);
                                let _c7489: boolean = !((_t7469 === _wc7115 ? true : (_t7469 === _wc7113 ? true : (b.grid[_t7469] !== 0))));
                                if (_c7489) {
                                  let _g7470 = 0;
                                  G7471: {
                                    const _a7472 = sp.adj4[v_s];
                                    for (let _i7473 = 0; _i7473 < _a7472.length; _i7473++) {
                                      const v_y = _a7472[_i7473];
                                      const _t7474 = sp.edgeOf(v_s, v_y);
                                      if (!(((_t7474 === _wc7115 ? _wd7116 : (_t7474 === _wc7113 ? _wd7114 : (b.grid[_t7474] || -1))) === 1))) continue;
                                      _g7470++;
                                    }
                                  }
                                  let _g7475 = 0;
                                  G7476: {
                                    const _a7477 = setOf(v_s);
                                    for (let _i7478 = 0; _i7478 < _a7477.length; _i7478++) {
                                      const v_k = _a7477[_i7478];
                                      const _h7479 = clueAt(cl.number, v_k);
                                      const _h7486 = (_h7479 + 1);
                                      let _c7488: boolean = (_h7479 !== -1);
                                      if (_c7488) {
                                        let _c7487: boolean = (_h5320 || (_h7479 === 1));
                                        if (!_c7487) {
                                          let _g7480 = 0;
                                          G7481: {
                                            const _t7482 = (_h7479 + 1);
                                            const _a7483 = cluesValued(cl.number, _t7482);
                                            for (let _i7484 = 0; _i7484 < _a7483.length; _i7484++) {
                                              const v_x = _a7483[_i7484];
                                              const _h7485 = clueAt(cl.number, v_x);
                                              if (!((_h7485 === _h7486))) continue;
                                              _g7480++;
                                            }
                                          }
                                          _c7487 = (_g7480 === 0);
                                        }
                                        _c7488 = _c7487;
                                      }
                                      if (!(_c7488)) continue;
                                      _g7475++;
                                    }
                                  }
                                  _c7489 = (_g7470 < (2 - _g7475));
                                }
                                let _c7510: boolean = _c7489;
                                if (_c7510) {
                                  let _g7490 = 0;
                                  G7491: {
                                    const _a7493 = sp.adj4[v_y];
                                    for (let _i7494 = 0; _i7494 < _a7493.length; _i7494++) {
                                      const v_y_7492 = _a7493[_i7494];
                                      const _t7495 = sp.edgeOf(v_y, v_y_7492);
                                      if (!(((_t7495 === _wc7115 ? _wd7116 : (_t7495 === _wc7113 ? _wd7114 : (b.grid[_t7495] || -1))) === 1))) continue;
                                      _g7490++;
                                    }
                                  }
                                  let _g7496 = 0;
                                  G7497: {
                                    const _a7498 = setOf(v_y);
                                    for (let _i7499 = 0; _i7499 < _a7498.length; _i7499++) {
                                      const v_k = _a7498[_i7499];
                                      const _h7500 = clueAt(cl.number, v_k);
                                      const _h7507 = (_h7500 + 1);
                                      let _c7509: boolean = (_h7500 !== -1);
                                      if (_c7509) {
                                        let _c7508: boolean = (_h5320 || (_h7500 === 1));
                                        if (!_c7508) {
                                          let _g7501 = 0;
                                          G7502: {
                                            const _t7503 = (_h7500 + 1);
                                            const _a7504 = cluesValued(cl.number, _t7503);
                                            for (let _i7505 = 0; _i7505 < _a7504.length; _i7505++) {
                                              const v_x = _a7504[_i7505];
                                              const _h7506 = clueAt(cl.number, v_x);
                                              if (!((_h7506 === _h7507))) continue;
                                              _g7501++;
                                            }
                                          }
                                          _c7508 = (_g7501 === 0);
                                        }
                                        _c7509 = _c7508;
                                      }
                                      if (!(_c7509)) continue;
                                      _g7496++;
                                    }
                                  }
                                  _c7510 = (_g7490 < (2 - _g7496));
                                }
                                let _c7591: boolean = _c7510;
                                if (_c7591) {
                                  let _q7511 = true;
                                  Q7512: {
                                    _g7513.length = 0;
                                    G7514: {
                                      const _a7517 = setOf(v_s);
                                      for (let _i7518 = 0; _i7518 < _a7517.length; _i7518++) {
                                        const v_x = _a7517[_i7518];
                                        const _h7519 = clueAt(cl.number, v_x);
                                        if (!((_h7519 !== -1))) continue;
                                        _g7513.push(v_x);
                                      }
                                    }
                                    _g7520.length = 0;
                                    G7521: {
                                      const _a7538 = throughWhere(sp, v_s, (_te7533: number): boolean => { let _c7535: boolean = ((_te7533 === _wc7115 ? _wd7116 : (_te7533 === _wc7113 ? _wd7114 : (b.grid[_te7533] || -1))) === 1); if (_c7535) {   const _t7534 = sp.edgeEnds[2 * _te7533];   _c7535 = !((clueAt(cl.number, _t7534) !== -1)); } let _c7537: boolean = _c7535; if (_c7537) {   const _t7536 = sp.edgeEnds[2 * _te7533 + 1];   _c7537 = !((clueAt(cl.number, _t7536) !== -1)); } return _c7537; });
                                      for (let _i7539 = 0; _i7539 < _a7538.length; _i7539++) {
                                        const v_t = _a7538[_i7539];
                                        const _h7542 = clueAt(cl.number, v_t);
                                        const _h7543 = (_h7542 !== -1);
                                        const _h7544 = _h7543;
                                        const _h7545 = !(_h7544);
                                        const _a7540 = sp.adj4[v_t];
                                        for (let _i7541 = 0; _i7541 < _a7540.length; _i7541++) {
                                          const v_x = _a7540[_i7541];
                                          const _h7546 = clueAt(cl.number, v_x);
                                          let _c7548: boolean = (_h7545 && (_h7546 !== -1));
                                          if (_c7548) {
                                            const _t7547 = sp.edgeOf(v_t, v_x);
                                            _c7548 = ((_t7547 === _wc7115 ? _wd7116 : (_t7547 === _wc7113 ? _wd7114 : (b.grid[_t7547] || -1))) === 1);
                                          }
                                          if (!(_c7548)) continue;
                                          if (!_g7520.includes(v_x)) _g7520.push(v_x);
                                        }
                                      }
                                    }
                                    const _a7549 = union(_g7513, _g7520);
                                    for (let _i7550 = 0; _i7550 < _a7549.length; _i7550++) {
                                      const v_p = _a7549[_i7550];
                                      const _h7589 = clueAt(cl.number, v_p);
                                      _g7551.length = 0;
                                      G7552: {
                                        const _a7555 = setOf(v_y);
                                        for (let _i7556 = 0; _i7556 < _a7555.length; _i7556++) {
                                          const v_x = _a7555[_i7556];
                                          const _h7557 = clueAt(cl.number, v_x);
                                          if (!((_h7557 !== -1))) continue;
                                          _g7551.push(v_x);
                                        }
                                      }
                                      _g7558.length = 0;
                                      G7559: {
                                        const _a7576 = throughWhere(sp, v_y, (_te7571: number): boolean => { let _c7573: boolean = ((_te7571 === _wc7115 ? _wd7116 : (_te7571 === _wc7113 ? _wd7114 : (b.grid[_te7571] || -1))) === 1); if (_c7573) {   const _t7572 = sp.edgeEnds[2 * _te7571];   _c7573 = !((clueAt(cl.number, _t7572) !== -1)); } let _c7575: boolean = _c7573; if (_c7575) {   const _t7574 = sp.edgeEnds[2 * _te7571 + 1];   _c7575 = !((clueAt(cl.number, _t7574) !== -1)); } return _c7575; });
                                        for (let _i7577 = 0; _i7577 < _a7576.length; _i7577++) {
                                          const v_t = _a7576[_i7577];
                                          const _h7580 = clueAt(cl.number, v_t);
                                          const _h7581 = (_h7580 !== -1);
                                          const _h7582 = _h7581;
                                          const _h7583 = !(_h7582);
                                          const _a7578 = sp.adj4[v_t];
                                          for (let _i7579 = 0; _i7579 < _a7578.length; _i7579++) {
                                            const v_x = _a7578[_i7579];
                                            const _h7584 = clueAt(cl.number, v_x);
                                            let _c7586: boolean = (_h7583 && (_h7584 !== -1));
                                            if (_c7586) {
                                              const _t7585 = sp.edgeOf(v_t, v_x);
                                              _c7586 = ((_t7585 === _wc7115 ? _wd7116 : (_t7585 === _wc7113 ? _wd7114 : (b.grid[_t7585] || -1))) === 1);
                                            }
                                            if (!(_c7586)) continue;
                                            if (!_g7558.includes(v_x)) _g7558.push(v_x);
                                          }
                                        }
                                      }
                                      const _a7587 = union(_g7551, _g7558);
                                      for (let _i7588 = 0; _i7588 < _a7587.length; _i7588++) {
                                        const v_q = _a7587[_i7588];
                                        const _h7590 = clueAt(cl.number, v_q);
                                        if (!((Math.abs((_h7589 - _h7590)) === cl.step))) {
                                          _q7511 = false;
                                          break Q7512;
                                        }
                                      }
                                    }
                                  }
                                  _c7591 = _q7511;
                                }
                                if (!((_c7591 && (_h5320 || !(throughWhere(sp, v_s, (_te7592: number): boolean => {  return ((_te7592 === _wc7115 ? _wd7116 : (_te7592 === _wc7113 ? _wd7114 : (b.grid[_te7592] || -1))) === 1); }).includes(v_y)))))) continue;
                                let _g7593 = 0;
                                G7594: {
                                  const _a7595 = sp.adj4[v_s];
                                  for (let _i7596 = 0; _i7596 < _a7595.length; _i7596++) {
                                    const v_y = _a7595[_i7596];
                                    const _t7597 = sp.edgeOf(v_s, v_y);
                                    if (!(((_t7597 === _wc7115 ? _wd7116 : (_t7597 === _wc7113 ? _wd7114 : (b.grid[_t7597] || -1))) === 1))) continue;
                                    _g7593++;
                                  }
                                }
                                let _g7598 = 0;
                                G7599: {
                                  const _a7600 = setOf(v_s);
                                  for (let _i7601 = 0; _i7601 < _a7600.length; _i7601++) {
                                    const v_k = _a7600[_i7601];
                                    const _h7602 = clueAt(cl.number, v_k);
                                    const _h7609 = (_h7602 + 1);
                                    let _c7611: boolean = (_h7602 !== -1);
                                    if (_c7611) {
                                      let _c7610: boolean = (_h5320 || (_h7602 === 1));
                                      if (!_c7610) {
                                        let _g7603 = 0;
                                        G7604: {
                                          const _t7605 = (_h7602 + 1);
                                          const _a7606 = cluesValued(cl.number, _t7605);
                                          for (let _i7607 = 0; _i7607 < _a7606.length; _i7607++) {
                                            const v_x = _a7606[_i7607];
                                            const _h7608 = clueAt(cl.number, v_x);
                                            if (!((_h7608 === _h7609))) continue;
                                            _g7603++;
                                          }
                                        }
                                        _c7610 = (_g7603 === 0);
                                      }
                                      _c7611 = _c7610;
                                    }
                                    if (!(_c7611)) continue;
                                    _g7598++;
                                  }
                                }
                                let _c7740: boolean = ((_g7593 + 1) === (2 - _g7598));
                                if (!_c7740) {
                                  let _q7612 = false;
                                  Q7613: {
                                    const _a7614 = sp.adj4[v_s];
                                    const _n7615 = _i7468;
                                    for (let _i7616 = 0; _i7616 < _n7615; _i7616++) {
                                      const v_z = _a7614[_i7616];
                                      const _t7617 = sp.edgeOf(v_s, v_z);
                                      let _c7637: boolean = !((_t7617 === _wc7115 ? true : (_t7617 === _wc7113 ? true : (b.grid[_t7617] !== 0))));
                                      if (_c7637) {
                                        let _g7618 = 0;
                                        G7619: {
                                          const _a7620 = sp.adj4[v_s];
                                          for (let _i7621 = 0; _i7621 < _a7620.length; _i7621++) {
                                            const v_y = _a7620[_i7621];
                                            const _t7622 = sp.edgeOf(v_s, v_y);
                                            if (!(((_t7622 === _wc7115 ? _wd7116 : (_t7622 === _wc7113 ? _wd7114 : (b.grid[_t7622] || -1))) === 1))) continue;
                                            _g7618++;
                                          }
                                        }
                                        let _g7623 = 0;
                                        G7624: {
                                          const _a7625 = setOf(v_s);
                                          for (let _i7626 = 0; _i7626 < _a7625.length; _i7626++) {
                                            const v_k = _a7625[_i7626];
                                            const _h7627 = clueAt(cl.number, v_k);
                                            const _h7634 = (_h7627 + 1);
                                            let _c7636: boolean = (_h7627 !== -1);
                                            if (_c7636) {
                                              let _c7635: boolean = (_h5320 || (_h7627 === 1));
                                              if (!_c7635) {
                                                let _g7628 = 0;
                                                G7629: {
                                                  const _t7630 = (_h7627 + 1);
                                                  const _a7631 = cluesValued(cl.number, _t7630);
                                                  for (let _i7632 = 0; _i7632 < _a7631.length; _i7632++) {
                                                    const v_x = _a7631[_i7632];
                                                    const _h7633 = clueAt(cl.number, v_x);
                                                    if (!((_h7633 === _h7634))) continue;
                                                    _g7628++;
                                                  }
                                                }
                                                _c7635 = (_g7628 === 0);
                                              }
                                              _c7636 = _c7635;
                                            }
                                            if (!(_c7636)) continue;
                                            _g7623++;
                                          }
                                        }
                                        _c7637 = (_g7618 < (2 - _g7623));
                                      }
                                      let _c7657: boolean = _c7637;
                                      if (_c7657) {
                                        let _g7638 = 0;
                                        G7639: {
                                          const _a7640 = sp.adj4[v_z];
                                          for (let _i7641 = 0; _i7641 < _a7640.length; _i7641++) {
                                            const v_y = _a7640[_i7641];
                                            const _t7642 = sp.edgeOf(v_z, v_y);
                                            if (!(((_t7642 === _wc7115 ? _wd7116 : (_t7642 === _wc7113 ? _wd7114 : (b.grid[_t7642] || -1))) === 1))) continue;
                                            _g7638++;
                                          }
                                        }
                                        let _g7643 = 0;
                                        G7644: {
                                          const _a7645 = setOf(v_z);
                                          for (let _i7646 = 0; _i7646 < _a7645.length; _i7646++) {
                                            const v_k = _a7645[_i7646];
                                            const _h7647 = clueAt(cl.number, v_k);
                                            const _h7654 = (_h7647 + 1);
                                            let _c7656: boolean = (_h7647 !== -1);
                                            if (_c7656) {
                                              let _c7655: boolean = (_h5320 || (_h7647 === 1));
                                              if (!_c7655) {
                                                let _g7648 = 0;
                                                G7649: {
                                                  const _t7650 = (_h7647 + 1);
                                                  const _a7651 = cluesValued(cl.number, _t7650);
                                                  for (let _i7652 = 0; _i7652 < _a7651.length; _i7652++) {
                                                    const v_x = _a7651[_i7652];
                                                    const _h7653 = clueAt(cl.number, v_x);
                                                    if (!((_h7653 === _h7654))) continue;
                                                    _g7648++;
                                                  }
                                                }
                                                _c7655 = (_g7648 === 0);
                                              }
                                              _c7656 = _c7655;
                                            }
                                            if (!(_c7656)) continue;
                                            _g7643++;
                                          }
                                        }
                                        _c7657 = (_g7638 < (2 - _g7643));
                                      }
                                      let _c7738: boolean = _c7657;
                                      if (_c7738) {
                                        let _q7658 = true;
                                        Q7659: {
                                          _g7660.length = 0;
                                          G7661: {
                                            const _a7664 = setOf(v_s);
                                            for (let _i7665 = 0; _i7665 < _a7664.length; _i7665++) {
                                              const v_x = _a7664[_i7665];
                                              const _h7666 = clueAt(cl.number, v_x);
                                              if (!((_h7666 !== -1))) continue;
                                              _g7660.push(v_x);
                                            }
                                          }
                                          _g7667.length = 0;
                                          G7668: {
                                            const _a7685 = throughWhere(sp, v_s, (_te7680: number): boolean => { let _c7682: boolean = ((_te7680 === _wc7115 ? _wd7116 : (_te7680 === _wc7113 ? _wd7114 : (b.grid[_te7680] || -1))) === 1); if (_c7682) {   const _t7681 = sp.edgeEnds[2 * _te7680];   _c7682 = !((clueAt(cl.number, _t7681) !== -1)); } let _c7684: boolean = _c7682; if (_c7684) {   const _t7683 = sp.edgeEnds[2 * _te7680 + 1];   _c7684 = !((clueAt(cl.number, _t7683) !== -1)); } return _c7684; });
                                            for (let _i7686 = 0; _i7686 < _a7685.length; _i7686++) {
                                              const v_t = _a7685[_i7686];
                                              const _h7689 = clueAt(cl.number, v_t);
                                              const _h7690 = (_h7689 !== -1);
                                              const _h7691 = _h7690;
                                              const _h7692 = !(_h7691);
                                              const _a7687 = sp.adj4[v_t];
                                              for (let _i7688 = 0; _i7688 < _a7687.length; _i7688++) {
                                                const v_x = _a7687[_i7688];
                                                const _h7693 = clueAt(cl.number, v_x);
                                                let _c7695: boolean = (_h7692 && (_h7693 !== -1));
                                                if (_c7695) {
                                                  const _t7694 = sp.edgeOf(v_t, v_x);
                                                  _c7695 = ((_t7694 === _wc7115 ? _wd7116 : (_t7694 === _wc7113 ? _wd7114 : (b.grid[_t7694] || -1))) === 1);
                                                }
                                                if (!(_c7695)) continue;
                                                if (!_g7667.includes(v_x)) _g7667.push(v_x);
                                              }
                                            }
                                          }
                                          const _a7696 = union(_g7660, _g7667);
                                          for (let _i7697 = 0; _i7697 < _a7696.length; _i7697++) {
                                            const v_p = _a7696[_i7697];
                                            const _h7736 = clueAt(cl.number, v_p);
                                            _g7698.length = 0;
                                            G7699: {
                                              const _a7702 = setOf(v_z);
                                              for (let _i7703 = 0; _i7703 < _a7702.length; _i7703++) {
                                                const v_x = _a7702[_i7703];
                                                const _h7704 = clueAt(cl.number, v_x);
                                                if (!((_h7704 !== -1))) continue;
                                                _g7698.push(v_x);
                                              }
                                            }
                                            _g7705.length = 0;
                                            G7706: {
                                              const _a7723 = throughWhere(sp, v_z, (_te7718: number): boolean => { let _c7720: boolean = ((_te7718 === _wc7115 ? _wd7116 : (_te7718 === _wc7113 ? _wd7114 : (b.grid[_te7718] || -1))) === 1); if (_c7720) {   const _t7719 = sp.edgeEnds[2 * _te7718];   _c7720 = !((clueAt(cl.number, _t7719) !== -1)); } let _c7722: boolean = _c7720; if (_c7722) {   const _t7721 = sp.edgeEnds[2 * _te7718 + 1];   _c7722 = !((clueAt(cl.number, _t7721) !== -1)); } return _c7722; });
                                              for (let _i7724 = 0; _i7724 < _a7723.length; _i7724++) {
                                                const v_t = _a7723[_i7724];
                                                const _h7727 = clueAt(cl.number, v_t);
                                                const _h7728 = (_h7727 !== -1);
                                                const _h7729 = _h7728;
                                                const _h7730 = !(_h7729);
                                                const _a7725 = sp.adj4[v_t];
                                                for (let _i7726 = 0; _i7726 < _a7725.length; _i7726++) {
                                                  const v_x = _a7725[_i7726];
                                                  const _h7731 = clueAt(cl.number, v_x);
                                                  let _c7733: boolean = (_h7730 && (_h7731 !== -1));
                                                  if (_c7733) {
                                                    const _t7732 = sp.edgeOf(v_t, v_x);
                                                    _c7733 = ((_t7732 === _wc7115 ? _wd7116 : (_t7732 === _wc7113 ? _wd7114 : (b.grid[_t7732] || -1))) === 1);
                                                  }
                                                  if (!(_c7733)) continue;
                                                  if (!_g7705.includes(v_x)) _g7705.push(v_x);
                                                }
                                              }
                                            }
                                            const _a7734 = union(_g7698, _g7705);
                                            for (let _i7735 = 0; _i7735 < _a7734.length; _i7735++) {
                                              const v_q = _a7734[_i7735];
                                              const _h7737 = clueAt(cl.number, v_q);
                                              if (!((Math.abs((_h7736 - _h7737)) === cl.step))) {
                                                _q7658 = false;
                                                break Q7659;
                                              }
                                            }
                                          }
                                        }
                                        _c7738 = _q7658;
                                      }
                                      if ((_c7738 && (_h5320 || !(throughWhere(sp, v_s, (_te7739: number): boolean => {  return ((_te7739 === _wc7115 ? _wd7116 : (_te7739 === _wc7113 ? _wd7114 : (b.grid[_te7739] || -1))) === 1); }).includes(v_z))))) {
                                        _q7612 = true;
                                        break Q7613;
                                      }
                                    }
                                  }
                                  _c7740 = _q7612;
                                }
                                if (_c7740) {
                                  _q7465 = true;
                                  break Q7466;
                                }
                              }
                            }
                            _c7741 = !(_q7465);
                          }
                          if (_c7741) {
                            _q7442 = true;
                            break Q7443;
                          }
                        }
                      }
                      _c7742 = _q7442;
                    }
                    if (_c7742) {
                      _q7117 = true;
                      break Q7118;
                    }
                  }
                }
                _c7743 = _q7117;
              }
              _c7744 = _c7743;
            }
            if (!(_c7744)) continue;
            const _t7746 = minus(v_U, setOf(_h7745, v_i, v_j));
            const _t7747 = (_t7746.length > 0 ? _t7746[0] : -1);
            if (!_g6542.includes(_t7747)) _g6542.push(_t7747);
          }
        }
      }
      const v_B = _g6542;
      const _h7782 = v_B.length;
      const _h7783 = (_h7782 === 3);
      _g7748.length = 0;
      G7749: {
        const _a7759 = v_U;
        for (let _i7760 = 0; _i7760 < _a7759.length; _i7760++) {
          const v_y = _a7759[_i7760];
          let _c7769: boolean = ((_i7760 === 0) && _h7762);
          if (!_c7769) {
            let _c7768: boolean = (_i7760 > 0);
            if (_c7768) {
              let _c7767: boolean = !(v_A.includes(v_y));
              if (!_c7767) {
                let _q7763 = false;
                Q7764: {
                  const _a7765 = v_U;
                  for (let _i7766 = 0; _i7766 < _a7765.length; _i7766++) {
                    const v_m = _a7765[_i7766];
                    if (!(((_i7766 > 0) && (v_m !== v_y)))) continue;
                    if (!(v_B.includes(v_m))) {
                      _q7763 = true;
                      break Q7764;
                    }
                  }
                }
                _c7767 = _q7763;
              }
              _c7768 = _c7767;
            }
            _c7769 = _c7768;
          }
          if (!(_c7769)) continue;
          _g7748.push(v_y);
        }
      }
      const v_N = _g7748;
      const _h7791 = v_N.length;
      _g7770.length = 0;
      G7771: {
        const _a7780 = v_N;
        for (let _i7781 = 0; _i7781 < _a7780.length; _i7781++) {
          const v_y = _a7780[_i7781];
          let _c7789: boolean = ((v_U.indexOf(v_y) === 0) && _h7783);
          if (!_c7789) {
            let _c7788: boolean = ((v_U.indexOf(v_y) > 0) && (v_B.includes(v_y)));
            if (_c7788) {
              let _q7784 = true;
              Q7785: {
                const _a7786 = v_U;
                for (let _i7787 = 0; _i7787 < _a7786.length; _i7787++) {
                  const v_m = _a7786[_i7787];
                  if (!(((_i7787 > 0) && (v_m !== v_y)))) continue;
                  if (!((v_A.includes(v_m)))) {
                    _q7784 = false;
                    break Q7785;
                  }
                }
              }
              _c7788 = _q7784;
            }
            _c7789 = _c7788;
          }
          if (!(_c7789)) continue;
          _g7770.push(v_y);
        }
      }
      const v_P = _g7770;
      const _h7792 = v_P.length;
      L7790: {
        const v_X = minus(v_U, v_N);
        const _h7793 = v_X.length;
        if (!((((_h7791 === 0) || (_h7792 > 0)) || (_h7793 > 0)))) break L7790;
        facts.length = 0;
        changed = false;
        let _c7799: boolean = (_h7791 > 0);
        if (_c7799) {
          let _q7794 = true;
          Q7795: {
            const _a7796 = v_P;
            for (let _i7797 = 0; _i7797 < _a7796.length; _i7797++) {
              const v_y = _a7796[_i7797];
              const _t7798 = sp.edgeOf(v_c, v_y);
              if (!(b.grid[_t7798] !== 0)) { if (fire === null) { b.placeAt(_t7798, 1); changed = true; } else facts.push(PLACE, _t7798, 1); }
              if (!(true)) {
                _q7794 = false;
                break Q7795;
              }
            }
          }
          _c7799 = _q7794;
        }
        let _c7806: boolean = _c7799;
        if (_c7806) {
          let _c7805: boolean = !((_h7792 === 0));
          if (!_c7805) {
            let _q7800 = true;
            Q7801: {
              const _a7802 = v_X;
              for (let _i7803 = 0; _i7803 < _a7802.length; _i7803++) {
                const v_y = _a7802[_i7803];
                const _t7804 = sp.edgeOf(v_c, v_y);
                if (!(b.grid[_t7804] !== 0)) { if (fire === null) { b.placeAt(_t7804, 2); changed = true; } else facts.push(PLACE, _t7804, 2); }
                if (!(true)) {
                  _q7800 = false;
                  break Q7801;
                }
              }
            }
            _c7805 = _q7800;
          }
          _c7806 = _c7805;
        }
        if (!(_c7806)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, U: v_U, A: v_A, B: v_B, N: v_N, P: v_P, X: v_X }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const nearestKept = keptStore<readonly number[]>();

/** `nearest(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function nearest(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = nearestKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g142: number[] = [];
  G143: {
    const _a146 = setOf(v_c);
    for (let _i147 = 0; _i147 < _a146.length; _i147++) {
      const v_x = _a146[_i147];
      if (!((clueAt(cl.number, v_x) !== -1))) continue;
      _g142.push(v_x);
    }
  }
  const _g148: number[] = [];
  G149: {
    const _a164 = throughWhere(sp, v_c, (_te159: number): boolean => { let _c161: boolean = ((b.grid[_te159] || -1) === 1); if (_c161) {   const _t160 = sp.edgeEnds[2 * _te159];   _c161 = !((clueAt(cl.number, _t160) !== -1)); } let _c163: boolean = _c161; if (_c163) {   const _t162 = sp.edgeEnds[2 * _te159 + 1];   _c163 = !((clueAt(cl.number, _t162) !== -1)); } return _c163; });
    for (let _i165 = 0; _i165 < _a164.length; _i165++) {
      const v_t = _a164[_i165];
      const _a166 = sp.adj4[v_t];
      for (let _i167 = 0; _i167 < _a166.length; _i167++) {
        const v_x = _a166[_i167];
        if (!(((!((clueAt(cl.number, v_t) !== -1)) && (clueAt(cl.number, v_x) !== -1)) && ((b.grid[sp.edgeOf(v_t, v_x)] || -1) === 1)))) continue;
        if (!_g148.includes(v_x)) _g148.push(v_x);
      }
    }
  }
  const _made = union(_g142, _g148);
  _kept[v_c] = _made;
  return _made;
}

const waysKept = keptStore<readonly number[]>();

/** `ways(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function ways(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = waysKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g29: number[] = [];
  G30: {
    const _a174 = sp.adj4[v_c];
    for (let _i175 = 0; _i175 < _a174.length; _i175++) {
      const v_y = _a174[_i175];
      let _c228: boolean = !((b.grid[sp.edgeOf(v_c, v_y)] !== 0));
      if (_c228) {
        let _g202 = 0;
        G203: {
          const _a204 = sp.adj4[v_c];
          for (let _i205 = 0; _i205 < _a204.length; _i205++) {
            const v_y = _a204[_i205];
            if (!(((b.grid[sp.edgeOf(v_c, v_y)] || -1) === 1))) continue;
            _g202++;
          }
        }
        let _g217 = 0;
        G218: {
          const _a219 = setOf(v_c);
          for (let _i220 = 0; _i220 < _a219.length; _i220++) {
            const v_k = _a219[_i220];
            let _c227: boolean = (clueAt(cl.number, v_k) !== -1);
            if (_c227) {
              let _c226: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
              if (!_c226) {
                let _g221 = 0;
                G222: {
                  const _t223 = (clueAt(cl.number, v_k) + 1);
                  const _a224 = cluesValued(cl.number, _t223);
                  for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                    const v_x = _a224[_i225];
                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                    _g221++;
                  }
                }
                _c226 = (_g221 === 0);
              }
              _c227 = _c226;
            }
            if (!(_c227)) continue;
            _g217++;
          }
        }
        _c228 = (_g202 < (2 - _g217));
      }
      let _c282: boolean = _c228;
      if (_c282) {
        let _g255 = 0;
        G256: {
          const _a258 = sp.adj4[v_y];
          for (let _i259 = 0; _i259 < _a258.length; _i259++) {
            const v_y_257 = _a258[_i259];
            if (!(((b.grid[sp.edgeOf(v_y, v_y_257)] || -1) === 1))) continue;
            _g255++;
          }
        }
        let _g271 = 0;
        G272: {
          const _a273 = setOf(v_y);
          for (let _i274 = 0; _i274 < _a273.length; _i274++) {
            const v_k = _a273[_i274];
            let _c281: boolean = (clueAt(cl.number, v_k) !== -1);
            if (_c281) {
              let _c280: boolean = ((cl.step === 0) || (clueAt(cl.number, v_k) === 1));
              if (!_c280) {
                let _g275 = 0;
                G276: {
                  const _t277 = (clueAt(cl.number, v_k) + 1);
                  const _a278 = cluesValued(cl.number, _t277);
                  for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                    const v_x = _a278[_i279];
                    if (!((clueAt(cl.number, v_x) === (clueAt(cl.number, v_k) + 1)))) continue;
                    _g275++;
                  }
                }
                _c280 = (_g275 === 0);
              }
              _c281 = _c280;
            }
            if (!(_c281)) continue;
            _g271++;
          }
        }
        _c282 = (_g255 < (2 - _g271));
      }
      let _c289: boolean = _c282;
      if (_c289) {
        let _q283 = true;
        Q284: {
          const _a285 = nearest(b, sp, cl, v_c);
          for (let _i286 = 0; _i286 < _a285.length; _i286++) {
            const v_p = _a285[_i286];
            const _a287 = nearest(b, sp, cl, v_y);
            for (let _i288 = 0; _i288 < _a287.length; _i288++) {
              const v_q = _a287[_i288];
              if (!((Math.abs((clueAt(cl.number, v_p) - clueAt(cl.number, v_q))) === cl.step))) {
                _q283 = false;
                break Q284;
              }
            }
          }
        }
        _c289 = _q283;
      }
      if (!((_c289 && ((cl.step === 0) || !(throughWhere(sp, v_c, (_te290: number): boolean => {  return ((b.grid[_te290] || -1) === 1); }).includes(v_y)))))) continue;
      _g29.push(v_y);
    }
  }
  const _made = _g29;
  _kept[v_c] = _made;
  return _made;
}
