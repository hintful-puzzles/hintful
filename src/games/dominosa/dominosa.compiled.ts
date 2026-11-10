// Compiled by `npm run describe` from src/games/dominosa/dominosa.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, clueAt, cluesValued, edgeGroups, freshBinding, keptStore, minus, popcount, rangeMask, sameSet, setOf, staleChecking, stamps, through, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  number: ClueList;
  n: number;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlySpot" | "squareOnly" | "squareSingleDomino" | "mustOverlap" | "localDuplicate" | "localDuplicate2" | "parity" | "set" | "setDoubles";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "placed" },
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
  { id: "onlySpot", tier: 0 },
  { id: "squareOnly", tier: 0 },
  { id: "squareSingleDomino", tier: 1 },
  { id: "mustOverlap", tier: 1 },
  { id: "localDuplicate", tier: 1 },
  { id: "localDuplicate2", tier: 1 },
  { id: "parity", tier: 1 },
  { id: "set", tier: 2 },
  { id: "setDoubles", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1046 = true;
  Q1047: {
    const _a1048 = sp.cells;
    for (let _i1049 = 0; _i1049 < _a1048.length; _i1049++) {
      const v_c = _a1048[_i1049];
      let _g1050 = 0;
      G1051: {
        const _a1052 = sp.adj4[v_c];
        for (let _i1053 = 0; _i1053 < _a1052.length; _i1053++) {
          const _h1054 = (g[sp.adj4Edges[v_c][_i1053]] || -1);
          if (!((_h1054 === 1))) continue;
          _g1050++;
        }
      }
      if (!((_g1050 === 1))) {
        _q1046 = false;
        break Q1047;
      }
    }
  }
  if (!(_q1046)) return false;
  let _q1055 = true;
  Q1056: {
    const _a1057 = sp.edges;
    for (let _i1058 = 0; _i1058 < _a1057.length; _i1058++) {
      const v_e = _a1057[_i1058];
      const _h1061 = (g[v_e] || -1);
      const _h1062 = (_h1061 === 1);
      const _h1064 = sp.edgeEnds[2 * v_e];
      const _h1065 = clueAt(cl.number, _h1064);
      const _h1066 = _h1065;
      const _h1069 = sp.edgeEnds[2 * v_e + 1];
      const _h1070 = clueAt(cl.number, _h1069);
      const _h1071 = _h1070;
      const _a1059 = sp.edges;
      for (let _i1060 = 0; _i1060 < _a1059.length; _i1060++) {
        const v_f = _a1059[_i1060];
        const _h1063 = (g[v_f] || -1);
        if (!((((v_f !== v_e) && _h1062) && (_h1063 === 1)))) continue;
        const _t1067 = sp.edgeEnds[2 * v_f];
        const _h1068 = clueAt(cl.number, _t1067);
        let _c1074: boolean = (_h1066 === _h1068);
        if (_c1074) {
          const _t1072 = sp.edgeEnds[2 * v_f + 1];
          const _h1073 = clueAt(cl.number, _t1072);
          _c1074 = (_h1071 === _h1073);
        }
        let _c1080: boolean = _c1074;
        if (!_c1080) {
          const _t1075 = sp.edgeEnds[2 * v_f + 1];
          const _h1076 = clueAt(cl.number, _t1075);
          let _c1079: boolean = (_h1066 === _h1076);
          if (_c1079) {
            const _t1077 = sp.edgeEnds[2 * v_f];
            const _h1078 = clueAt(cl.number, _t1077);
            _c1079 = (_h1071 === _h1078);
          }
          _c1080 = _c1079;
        }
        if (!(!(_c1080))) {
          _q1055 = false;
          break Q1056;
        }
      }
    }
  }
  if (!(_q1055)) return false;
  for (let _k1081 = 0; _k1081 < cl.number.at.length; _k1081++) {
    const _at1082 = cl.number.at[_k1081];
    let _q1084 = true;
    Q1085: {
      const _a1086 = sp.adj4[_at1082];
      for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
        let _q1088 = false;
        Q1089: {
          const _a1090 = sp.edges;
          for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
            const v_f = _a1090[_i1091];
            const _h1092 = (g[v_f] || -1);
            if (!((_h1092 === 1))) continue;
            const _t1093 = sp.adj4Edges[_at1082][_i1087];
            const _t1094 = sp.edgeEnds[2 * _t1093];
            const _h1095 = clueAt(cl.number, _t1094);
            const _t1096 = sp.edgeEnds[2 * v_f];
            const _h1097 = clueAt(cl.number, _t1096);
            let _c1102: boolean = (_h1095 === _h1097);
            if (_c1102) {
              const _t1098 = sp.edgeEnds[2 * _t1093 + 1];
              const _h1099 = clueAt(cl.number, _t1098);
              const _t1100 = sp.edgeEnds[2 * v_f + 1];
              const _h1101 = clueAt(cl.number, _t1100);
              _c1102 = (_h1099 === _h1101);
            }
            let _c1112: boolean = _c1102;
            if (!_c1112) {
              const _t1103 = sp.edgeEnds[2 * _t1093];
              const _h1104 = clueAt(cl.number, _t1103);
              const _t1105 = sp.edgeEnds[2 * v_f + 1];
              const _h1106 = clueAt(cl.number, _t1105);
              let _c1111: boolean = (_h1104 === _h1106);
              if (_c1111) {
                const _t1107 = sp.edgeEnds[2 * _t1093 + 1];
                const _h1108 = clueAt(cl.number, _t1107);
                const _t1109 = sp.edgeEnds[2 * v_f];
                const _h1110 = clueAt(cl.number, _t1109);
                _c1111 = (_h1108 === _h1110);
              }
              _c1112 = _c1111;
            }
            if (_c1112) {
              _q1088 = true;
              break Q1089;
            }
          }
        }
        if (!(_q1088)) {
          _q1084 = false;
          break Q1085;
        }
      }
    }
    if (!(_q1084)) return false;
  }
  return true;
}

export interface PlacedBinding {
  e: number;
}

const placedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function placed(b: Marks, sp: GridSpace, cl: Dealt, v_e: number, fire: Fire<PlacedBinding> | null): number {
  const facts = placedFacts;
  let fired = 0;
  let changed = false;
  const _h15 = sp.edgeEnds[2 * v_e];
  const _h16 = clueAt(cl.number, _h15);
  const _h17 = _h16;
  const _h20 = sp.edgeEnds[2 * v_e + 1];
  const _h21 = clueAt(cl.number, _h20);
  const _h22 = _h21;
  if (!(((b.grid[v_e] || -1) === 1))) return 0;
  if (import.meta.env.DEV && staleChecking) {
    freshBinding("placed", [(sp.edges.includes(v_e)), ((b.grid[v_e] || -1) === 1)], ["e in", "where of e"]);
  }
  facts.length = 0;
  changed = false;
  let _q3 = true;
  Q4: {
    const _t5 = sp.edgeEnds[2 * v_e];
    const _t6 = sp.edgeEnds[2 * v_e + 1];
    for (let _i7 = 0; _i7 < 2; _i7++) {
      const v_x = _i7 === 0 ? _t5 : _t6;
      if (_i7 === 1 && (v_x === _t5)) continue;
      const _a8 = sp.adj4[v_x];
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        if (!((sp.adj4Edges[v_x][_i9] !== v_e))) continue;
        const _t10 = sp.adj4Edges[v_x][_i9];
        if (!(b.grid[_t10] !== 0)) { if (fire === null) { b.placeAt(_t10, 2); changed = true; } else facts.push(PLACE, _t10, 2); }
        if (!(true)) {
          _q3 = false;
          break Q4;
        }
      }
    }
  }
  let _c33: boolean = _q3;
  if (_c33) {
    let _q11 = true;
    Q12: {
      const _a13 = sp.edges;
      for (let _i14 = 0; _i14 < _a13.length; _i14++) {
        const v_f = _a13[_i14];
        let _c32: boolean = (v_f !== v_e);
        if (_c32) {
          const _t18 = sp.edgeEnds[2 * v_f];
          const _h19 = clueAt(cl.number, _t18);
          let _c25: boolean = (_h17 === _h19);
          if (_c25) {
            const _t23 = sp.edgeEnds[2 * v_f + 1];
            const _h24 = clueAt(cl.number, _t23);
            _c25 = (_h22 === _h24);
          }
          let _c31: boolean = _c25;
          if (!_c31) {
            const _t26 = sp.edgeEnds[2 * v_f + 1];
            const _h27 = clueAt(cl.number, _t26);
            let _c30: boolean = (_h17 === _h27);
            if (_c30) {
              const _t28 = sp.edgeEnds[2 * v_f];
              const _h29 = clueAt(cl.number, _t28);
              _c30 = (_h22 === _h29);
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        if (!(_c32)) continue;
        if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
        if (!(true)) {
          _q11 = false;
          break Q12;
        }
      }
    }
    _c33 = _q11;
  }
  if (!(_c33)) return -1;
  if (changed || facts.length > 0) {
    fired = 1;
    if (fire !== null) fire({ e: v_e }, facts);
  }
  return fired;
}

export interface OnlySpotBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

const onlySpotFacts: number[] = [];
const _st63 = stamps();

/** Its dearest read grows with the board as 1. */
export function onlySpot(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlySpotBinding> | null): number {
  const _g57: number[] = [];
  const facts = onlySpotFacts;
  let fired = 0;
  let changed = false;
  const _k64 = showingKept.board(cl);
  const _t55 = cl.n;
  for (let v_a = 0; v_a <= _t55; v_a++) {
    const _t56 = cl.n;
    for (let v_b = v_a; v_b <= _t56; v_b++) {
      _g57.length = 0;
      _st63.pass++;
      G58: {
        const _a65 = (_k64[v_a] ?? showing(sp, cl, v_a));
        for (let _i66 = 0; _i66 < _a65.length; _i66++) {
          const v_x = _a65[_i66];
          const _a67 = sp.adj4[v_x];
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_y = _a67[_i68];
            const _h69 = clueAt(cl.number, v_y);
            if (!(((_h69 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i68]] || -1) !== 2)))) continue;
            const _t70 = sp.adj4Edges[v_x][_i68];
            const _t71 = _t70;
            if (_g57.length < 16) { if (!_g57.includes(_t71)) _g57.push(_t71); } else addOnce(_g57, _st63, _t71);
          }
        }
      }
      L72: {
        const v_P = _g57;
        const _h73 = v_P.length;
        if (!((_h73 === 1))) break L72;
        L74: {
          const v_e = (v_P[0] ?? -1);
          if (!(!((b.grid[v_e] !== 0)))) break L74;
          if (import.meta.env.DEV && staleChecking) {
            const _g75: number[] = [];
            G76: {
              const _a81 = showing(sp, cl, v_a);
              for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                const v_x = _a81[_i82];
                const _a83 = sp.adj4[v_x];
                for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                  const v_y = _a83[_i84];
                  if (!(((clueAt(cl.number, v_y) === v_b) && ((b.grid[sp.adj4Edges[v_x][_i84]] || -1) !== 2)))) continue;
                  const _t85 = sp.adj4Edges[v_x][_i84];
                  if (!_g75.includes(_t85)) _g75.push(_t85);
                }
              }
            }
            freshBinding("onlySpot", [((0 <= v_a) && (v_a <= cl.n)), ((v_a <= v_b) && (v_b <= cl.n)), sameSet(v_P, _g75), (v_P.length === 1), (v_e === (v_P[0] ?? -1)), !((b.grid[v_e] !== 0))], ["a in", "b in", "P =", "where of P", "e =", "where of e"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface SquareOnlyBinding {
  c: number;
  S: readonly number[];
}

const squareOnlyFacts: number[] = [];
const _st107 = stamps();

/** Its dearest read grows with the board as n. */
export function squareOnly(b: Marks, sp: GridSpace, fire: Fire<SquareOnlyBinding> | null): number {
  const _g103: number[] = [];
  const facts = squareOnlyFacts;
  let fired = 0;
  let changed = false;
  const _a101 = sp.cells;
  for (let _i102 = 0; _i102 < _a101.length; _i102++) {
    const v_c = _a101[_i102];
    _g103.length = 0;
    _st107.pass++;
    G104: {
      const _a108 = sp.adj4[v_c];
      for (let _i109 = 0; _i109 < _a108.length; _i109++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i109]] || -1) !== 2))) continue;
        const _t110 = sp.adj4Edges[v_c][_i109];
        const _t111 = _t110;
        if (_g103.length < 16) { if (!_g103.includes(_t111)) _g103.push(_t111); } else addOnce(_g103, _st107, _t111);
      }
    }
    L112: {
      const v_S = _g103;
      const _h113 = v_S.length;
      let _c118: boolean = (_h113 <= 1);
      if (_c118) {
        let _q114 = false;
        Q115: {
          const _a116 = v_S;
          for (let _i117 = 0; _i117 < _a116.length; _i117++) {
            const v_f = _a116[_i117];
            if ((b.grid[v_f] !== 0)) {
              _q114 = true;
              break Q115;
            }
          }
        }
        _c118 = !(_q114);
      }
      if (!(_c118)) break L112;
      if (import.meta.env.DEV && staleChecking) {
        const _g119: number[] = [];
        G120: {
          const _a123 = sp.adj4[v_c];
          for (let _i124 = 0; _i124 < _a123.length; _i124++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i124]] || -1) !== 2))) continue;
            const _t125 = sp.adj4Edges[v_c][_i124];
            if (!_g119.includes(_t125)) _g119.push(_t125);
          }
        }
        let _c130: boolean = (v_S.length <= 1);
        if (_c130) {
          let _q126 = false;
          Q127: {
            const _a128 = v_S;
            for (let _i129 = 0; _i129 < _a128.length; _i129++) {
              const v_f = _a128[_i129];
              if ((b.grid[v_f] !== 0)) {
                _q126 = true;
                break Q127;
              }
            }
          }
          _c130 = !(_q126);
        }
        freshBinding("squareOnly", [(sp.cells.includes(v_c)), sameSet(v_S, _g119), _c130], ["c in", "S =", "where of S"]);
      }
      facts.length = 0;
      changed = false;
      let _c132: boolean = (_h113 === 1);
      if (_c132) {
        const _t131 = (v_S[0] ?? -1);
        if (!(b.grid[_t131] !== 0)) { if (fire === null) { b.placeAt(_t131, 1); changed = true; } else facts.push(PLACE, _t131, 1); }
        _c132 = true;
      }
      if (!(_c132)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, S: v_S.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SquareSingleDominoBinding {
  c: number;
  S: readonly number[];
  s: number;
}

const squareSingleDominoFacts: number[] = [];
const _st165 = stamps();

/** Its dearest read grows with the board as n^2. */
export function squareSingleDomino(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareSingleDominoBinding> | null): number {
  const _g161: number[] = [];
  const facts = squareSingleDominoFacts;
  let fired = 0;
  let changed = false;
  const _a159 = sp.cells;
  for (let _i160 = 0; _i160 < _a159.length; _i160++) {
    const v_c = _a159[_i160];
    _g161.length = 0;
    _st165.pass++;
    G162: {
      const _a166 = sp.adj4[v_c];
      for (let _i167 = 0; _i167 < _a166.length; _i167++) {
        if (!(((b.grid[sp.adj4Edges[v_c][_i167]] || -1) !== 2))) continue;
        const _t168 = sp.adj4Edges[v_c][_i167];
        const _t169 = _t168;
        if (_g161.length < 16) { if (!_g161.includes(_t169)) _g161.push(_t169); } else addOnce(_g161, _st165, _t169);
      }
    }
    L170: {
      const v_S = _g161;
      const _h171 = v_S.length;
      if (!((_h171 >= 2))) break L170;
      L172: {
        const v_s = (v_S[0] ?? -1);
        const _h179 = sp.edgeEnds[2 * v_s];
        const _h180 = clueAt(cl.number, _h179);
        const _h181 = _h180;
        const _h184 = sp.edgeEnds[2 * v_s + 1];
        const _h185 = clueAt(cl.number, _h184);
        const _h186 = _h185;
        let _q173 = true;
        Q174: {
          const _a175 = v_S;
          for (let _i176 = 0; _i176 < _a175.length; _i176++) {
            const v_f = _a175[_i176];
            const _t177 = sp.edgeEnds[2 * v_f];
            const _h178 = clueAt(cl.number, _t177);
            let _c187: boolean = (_h178 === _h181);
            if (_c187) {
              const _t182 = sp.edgeEnds[2 * v_f + 1];
              const _h183 = clueAt(cl.number, _t182);
              _c187 = (_h183 === _h186);
            }
            let _c193: boolean = _c187;
            if (!_c193) {
              const _t188 = sp.edgeEnds[2 * v_f];
              const _h189 = clueAt(cl.number, _t188);
              let _c192: boolean = (_h189 === _h186);
              if (_c192) {
                const _t190 = sp.edgeEnds[2 * v_f + 1];
                const _h191 = clueAt(cl.number, _t190);
                _c192 = (_h191 === _h181);
              }
              _c193 = _c192;
            }
            if (!(_c193)) {
              _q173 = false;
              break Q174;
            }
          }
        }
        if (!(_q173)) break L172;
        if (import.meta.env.DEV && staleChecking) {
          const _g194: number[] = [];
          G195: {
            const _a198 = sp.adj4[v_c];
            for (let _i199 = 0; _i199 < _a198.length; _i199++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i199]] || -1) !== 2))) continue;
              const _t200 = sp.adj4Edges[v_c][_i199];
              if (!_g194.includes(_t200)) _g194.push(_t200);
            }
          }
          let _q201 = true;
          Q202: {
            const _a203 = v_S;
            for (let _i204 = 0; _i204 < _a203.length; _i204++) {
              const v_f = _a203[_i204];
              const _t205 = sp.edgeEnds[2 * v_f];
              const _t206 = sp.edgeEnds[2 * v_s];
              let _c209: boolean = (clueAt(cl.number, _t205) === clueAt(cl.number, _t206));
              if (_c209) {
                const _t207 = sp.edgeEnds[2 * v_f + 1];
                const _t208 = sp.edgeEnds[2 * v_s + 1];
                _c209 = (clueAt(cl.number, _t207) === clueAt(cl.number, _t208));
              }
              let _c215: boolean = _c209;
              if (!_c215) {
                const _t210 = sp.edgeEnds[2 * v_f];
                const _t211 = sp.edgeEnds[2 * v_s + 1];
                let _c214: boolean = (clueAt(cl.number, _t210) === clueAt(cl.number, _t211));
                if (_c214) {
                  const _t212 = sp.edgeEnds[2 * v_f + 1];
                  const _t213 = sp.edgeEnds[2 * v_s];
                  _c214 = (clueAt(cl.number, _t212) === clueAt(cl.number, _t213));
                }
                _c215 = _c214;
              }
              if (!(_c215)) {
                _q201 = false;
                break Q202;
              }
            }
          }
          freshBinding("squareSingleDomino", [(sp.cells.includes(v_c)), sameSet(v_S, _g194), (v_S.length >= 2), (v_s === (v_S[0] ?? -1)), _q201], ["c in", "S =", "where of S", "s =", "where of s"]);
        }
        facts.length = 0;
        changed = false;
        let _q216 = true;
        Q217: {
          const _a218 = sp.edges;
          for (let _i219 = 0; _i219 < _a218.length; _i219++) {
            const v_f = _a218[_i219];
            let _c231: boolean = (!(v_S.includes(v_f)) && ((b.grid[v_f] || -1) !== 2));
            if (_c231) {
              const _t220 = sp.edgeEnds[2 * v_f];
              const _h221 = clueAt(cl.number, _t220);
              let _c224: boolean = (_h221 === _h181);
              if (_c224) {
                const _t222 = sp.edgeEnds[2 * v_f + 1];
                const _h223 = clueAt(cl.number, _t222);
                _c224 = (_h223 === _h186);
              }
              let _c230: boolean = _c224;
              if (!_c230) {
                const _t225 = sp.edgeEnds[2 * v_f];
                const _h226 = clueAt(cl.number, _t225);
                let _c229: boolean = (_h226 === _h186);
                if (_c229) {
                  const _t227 = sp.edgeEnds[2 * v_f + 1];
                  const _h228 = clueAt(cl.number, _t227);
                  _c229 = (_h228 === _h181);
                }
                _c230 = _c229;
              }
              _c231 = _c230;
            }
            if (!(_c231)) continue;
            if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
            if (!(true)) {
              _q216 = false;
              break Q217;
            }
          }
        }
        if (!(_q216)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, S: v_S.slice(), s: v_s }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface MustOverlapBinding {
  a: number;
  b: number;
  P: readonly number[];
  e: number;
}

const mustOverlapFacts: number[] = [];
const _st254 = stamps();

/** Its dearest read grows with the board as 1. */
export function mustOverlap(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MustOverlapBinding> | null): number {
  const _g248: number[] = [];
  const facts = mustOverlapFacts;
  let fired = 0;
  let changed = false;
  const _k255 = showingKept.board(cl);
  const _t246 = cl.n;
  for (let v_a = 0; v_a <= _t246; v_a++) {
    const _t247 = cl.n;
    for (let v_b = v_a; v_b <= _t247; v_b++) {
      _g248.length = 0;
      _st254.pass++;
      G249: {
        const _a256 = (_k255[v_a] ?? showing(sp, cl, v_a));
        for (let _i257 = 0; _i257 < _a256.length; _i257++) {
          const v_x = _a256[_i257];
          const _a258 = sp.adj4[v_x];
          for (let _i259 = 0; _i259 < _a258.length; _i259++) {
            const v_y = _a258[_i259];
            const _h260 = clueAt(cl.number, v_y);
            if (!(((_h260 === v_b) && ((b.grid[sp.adj4Edges[v_x][_i259]] || -1) !== 2)))) continue;
            const _t261 = sp.adj4Edges[v_x][_i259];
            const _t262 = _t261;
            if (_g248.length < 16) { if (!_g248.includes(_t262)) _g248.push(_t262); } else addOnce(_g248, _st254, _t262);
          }
        }
      }
      L263: {
        const v_P = _g248;
        const _h264 = v_P.length;
        if (!((_h264 >= 2))) break L263;
        const v_e = (v_P[0] ?? -1);
        if (import.meta.env.DEV && staleChecking) {
          const _g265: number[] = [];
          G266: {
            const _a271 = showing(sp, cl, v_a);
            for (let _i272 = 0; _i272 < _a271.length; _i272++) {
              const v_x = _a271[_i272];
              const _a273 = sp.adj4[v_x];
              for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                const v_y = _a273[_i274];
                if (!(((clueAt(cl.number, v_y) === v_b) && ((b.grid[sp.adj4Edges[v_x][_i274]] || -1) !== 2)))) continue;
                const _t275 = sp.adj4Edges[v_x][_i274];
                if (!_g265.includes(_t275)) _g265.push(_t275);
              }
            }
          }
          freshBinding("mustOverlap", [((0 <= v_a) && (v_a <= cl.n)), ((v_a <= v_b) && (v_b <= cl.n)), sameSet(v_P, _g265), (v_P.length >= 2), (v_e === (v_P[0] ?? -1))], ["a in", "b in", "P =", "where of P", "e ="]);
        }
        facts.length = 0;
        changed = false;
        let _q276 = true;
        Q277: {
          const _t278 = sp.edgeEnds[2 * v_e];
          const _t279 = sp.edgeEnds[2 * v_e + 1];
          for (let _i280 = 0; _i280 < 2; _i280++) {
            const v_x = _i280 === 0 ? _t278 : _t279;
            if (_i280 === 1 && (v_x === _t278)) continue;
            const _a281 = sp.adj4[v_x];
            for (let _i282 = 0; _i282 < _a281.length; _i282++) {
              const _h287 = sp.adj4Edges[v_x][_i282];
              const _h288 = sp.edgeEnds[2 * _h287];
              const _h289 = sp.edgeEnds[2 * _h287 + 1];
              let _c290: boolean = (!(v_P.includes(sp.adj4Edges[v_x][_i282])) && ((b.grid[sp.adj4Edges[v_x][_i282]] || -1) !== 2));
              if (_c290) {
                let _q283 = true;
                Q284: {
                  const _a285 = v_P;
                  for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                    const v_f = _a285[_i286];
                    if (!(((((sp.edgeEnds[2 * v_f] === _h288) || (sp.edgeEnds[2 * v_f] === _h289)) || (sp.edgeEnds[2 * v_f + 1] === _h288)) || (sp.edgeEnds[2 * v_f + 1] === _h289)))) {
                      _q283 = false;
                      break Q284;
                    }
                  }
                }
                _c290 = _q283;
              }
              if (!(_c290)) continue;
              const _t291 = sp.adj4Edges[v_x][_i282];
              if (!(b.grid[_t291] !== 0)) { if (fire === null) { b.placeAt(_t291, 2); changed = true; } else facts.push(PLACE, _t291, 2); }
              if (!(true)) {
                _q276 = false;
                break Q277;
              }
            }
          }
        }
        if (!(_q276)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, P: v_P.slice(), e: v_e }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicateBinding {
  p: number;
  x: number;
  y: number;
  q: number;
}

const localDuplicateFacts: number[] = [];
const _st340 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicateBinding> | null): number {
  const _g335: number[] = [];
  const facts = localDuplicateFacts;
  let fired = 0;
  let changed = false;
  const _a325 = sp.edges;
  R1:
  for (let _i326 = 0; _i326 < _a325.length; _i326++) {
    const v_p = _a325[_i326];
    const _m114_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h350 = sp.edgeEnds[2 * v_p];
    const _h351 = clueAt(cl.number, _h350);
    const _h352 = _h351;
    const _h355 = sp.edgeEnds[2 * v_p + 1];
    const _h356 = clueAt(cl.number, _h355);
    const _h357 = _h356;
    const _t327 = sp.edgeEnds[2 * v_p];
    const _t328 = sp.edgeEnds[2 * v_p + 1];
    for (let _i329 = 0; _i329 < 2; _i329++) {
      const v_x = _i329 === 0 ? _t327 : _t328;
      if (_i329 === 1 && (v_x === _t327)) continue;
      const _a330 = sp.adj4[v_x];
      for (let _i331 = 0; _i331 < _a330.length; _i331++) {
        const v_y = _a330[_i331];
        L332: {
          const v_q = sp.adj4Edges[v_x][_i331];
          let _c365: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
          if (_c365) {
            let _q333 = true;
            Q334: {
              _g335.length = 0;
              _st340.pass++;
              G336: {
                const _a342 = sp.adj4[v_y];
                for (let _i343 = 0; _i343 < _a342.length; _i343++) {
                  if (!(((b.grid[sp.adj4Edges[v_y][_i343]] || -1) !== 2))) continue;
                  const _t344 = sp.adj4Edges[v_y][_i343];
                  const _t345 = _t344;
                  if (_g335.length < 16) { if (!_g335.includes(_t345)) _g335.push(_t345); } else addOnce(_g335, _st340, _t345);
                }
              }
              const _a346 = _g335;
              for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                const v_r = _a346[_i347];
                if (!((v_r !== v_q))) continue;
                const _t348 = sp.edgeEnds[2 * v_r];
                const _h349 = clueAt(cl.number, _t348);
                let _c358: boolean = (_h349 === _h352);
                if (_c358) {
                  const _t353 = sp.edgeEnds[2 * v_r + 1];
                  const _h354 = clueAt(cl.number, _t353);
                  _c358 = (_h354 === _h357);
                }
                let _c364: boolean = _c358;
                if (!_c364) {
                  const _t359 = sp.edgeEnds[2 * v_r];
                  const _h360 = clueAt(cl.number, _t359);
                  let _c363: boolean = (_h360 === _h357);
                  if (_c363) {
                    const _t361 = sp.edgeEnds[2 * v_r + 1];
                    const _h362 = clueAt(cl.number, _t361);
                    _c363 = (_h362 === _h352);
                  }
                  _c364 = _c363;
                }
                if (!(_c364)) {
                  _q333 = false;
                  break Q334;
                }
              }
            }
            _c365 = _q333;
          }
          if (!(_c365)) break L332;
          if (b.made[0] !== _m114_0) {
            if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _c390: boolean = ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2));
            if (_c390) {
              let _q366 = true;
              Q367: {
                const _g368: number[] = [];
                G369: {
                  const _a374 = sp.adj4[v_y];
                  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i375]] || -1) !== 2))) continue;
                    const _t376 = sp.adj4Edges[v_y][_i375];
                    if (!_g368.includes(_t376)) _g368.push(_t376);
                  }
                }
                const _a377 = _g368;
                for (let _i378 = 0; _i378 < _a377.length; _i378++) {
                  const v_r = _a377[_i378];
                  if (!((v_r !== v_q))) continue;
                  const _t379 = sp.edgeEnds[2 * v_r];
                  const _t380 = sp.edgeEnds[2 * v_p];
                  let _c383: boolean = (clueAt(cl.number, _t379) === clueAt(cl.number, _t380));
                  if (_c383) {
                    const _t381 = sp.edgeEnds[2 * v_r + 1];
                    const _t382 = sp.edgeEnds[2 * v_p + 1];
                    _c383 = (clueAt(cl.number, _t381) === clueAt(cl.number, _t382));
                  }
                  let _c389: boolean = _c383;
                  if (!_c389) {
                    const _t384 = sp.edgeEnds[2 * v_r];
                    const _t385 = sp.edgeEnds[2 * v_p + 1];
                    let _c388: boolean = (clueAt(cl.number, _t384) === clueAt(cl.number, _t385));
                    if (_c388) {
                      const _t386 = sp.edgeEnds[2 * v_r + 1];
                      const _t387 = sp.edgeEnds[2 * v_p];
                      _c388 = (clueAt(cl.number, _t386) === clueAt(cl.number, _t387));
                    }
                    _c389 = _c388;
                  }
                  if (!(_c389)) {
                    _q366 = false;
                    break Q367;
                  }
                }
              }
              _c390 = _q366;
            }
            freshBinding("localDuplicate", [(sp.edges.includes(v_p)), !((b.grid[v_p] !== 0)), ((v_x === sp.edgeEnds[2 * v_p]) || (v_x === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x].includes(v_y)), (v_q === sp.adj4Edges[v_x][_i331]), _c390], ["p in", "where of p", "x in", "y in", "q =", "where of q"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ p: v_p, x: v_x, y: v_y, q: v_q }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface LocalDuplicate2Binding {
  p: number;
  x: number;
  y: number;
  q: number;
  R: readonly number[];
  d: number;
  x2: number;
  z: number;
  q2: number;
  S: readonly number[];
}

const localDuplicate2Facts: number[] = [];
const _st509 = stamps();
const _st562 = stamps();
const _st607 = stamps();

/** Its dearest read grows with the board as n. */
export function localDuplicate2(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LocalDuplicate2Binding> | null): number {
  const _g491: number[] = [];
  const _g504: number[] = [];
  const _g547: number[] = [];
  const _g558: number[] = [];
  const _g589: number[] = [];
  const _g602: number[] = [];
  const facts = localDuplicate2Facts;
  let fired = 0;
  let changed = false;
  const _a483 = sp.edges;
  R1:
  for (let _i484 = 0; _i484 < _a483.length; _i484++) {
    const v_p = _a483[_i484];
    const _m142_0 = b.made[0];
    if (!(!((b.grid[v_p] !== 0)))) continue;
    const _h541 = sp.edgeEnds[2 * v_p];
    const _h542 = sp.edgeEnds[2 * v_p + 1];
    const _t485 = sp.edgeEnds[2 * v_p];
    const _t486 = sp.edgeEnds[2 * v_p + 1];
    for (let _i487 = 0; _i487 < 2; _i487++) {
      const v_x = _i487 === 0 ? _t485 : _t486;
      if (_i487 === 1 && (v_x === _t485)) continue;
      const _a488 = sp.adj4[v_x];
      R3:
      for (let _i489 = 0; _i489 < _a488.length; _i489++) {
        const v_y = _a488[_i489];
        L490: {
          const v_q = sp.adj4Edges[v_x][_i489];
          if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) break L490;
          const _h586 = sp.edgeEnds[2 * v_q];
          const _h587 = sp.edgeEnds[2 * v_q + 1];
          _g491.length = 0;
          G492: {
            _g504.length = 0;
            _st509.pass++;
            G505: {
              const _a511 = sp.adj4[v_y];
              for (let _i512 = 0; _i512 < _a511.length; _i512++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i512]] || -1) !== 2))) continue;
                const _t513 = sp.adj4Edges[v_y][_i512];
                const _t514 = _t513;
                if (_g504.length < 16) { if (!_g504.includes(_t514)) _g504.push(_t514); } else addOnce(_g504, _st509, _t514);
              }
            }
            const _a515 = _g504;
            for (let _i516 = 0; _i516 < _a515.length; _i516++) {
              const v_r = _a515[_i516];
              if (!((v_r !== v_q))) continue;
              _g491.push(v_r);
            }
          }
          L517: {
            const v_R = _g491;
            const _h518 = v_R.length;
            if (!((_h518 >= 1))) break L517;
            L519: {
              const v_d = (v_R[0] ?? -1);
              const _h526 = sp.edgeEnds[2 * v_d];
              const _h527 = clueAt(cl.number, _h526);
              const _h528 = _h527;
              const _h531 = sp.edgeEnds[2 * v_d + 1];
              const _h532 = clueAt(cl.number, _h531);
              const _h533 = _h532;
              let _q520 = true;
              Q521: {
                const _a522 = v_R;
                for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                  const v_r = _a522[_i523];
                  const _t524 = sp.edgeEnds[2 * v_r];
                  const _h525 = clueAt(cl.number, _t524);
                  let _c534: boolean = (_h525 === _h528);
                  if (_c534) {
                    const _t529 = sp.edgeEnds[2 * v_r + 1];
                    const _h530 = clueAt(cl.number, _t529);
                    _c534 = (_h530 === _h533);
                  }
                  let _c540: boolean = _c534;
                  if (!_c540) {
                    const _t535 = sp.edgeEnds[2 * v_r];
                    const _h536 = clueAt(cl.number, _t535);
                    let _c539: boolean = (_h536 === _h533);
                    if (_c539) {
                      const _t537 = sp.edgeEnds[2 * v_r + 1];
                      const _h538 = clueAt(cl.number, _t537);
                      _c539 = (_h538 === _h528);
                    }
                    _c540 = _c539;
                  }
                  if (!(_c540)) {
                    _q520 = false;
                    break Q521;
                  }
                }
              }
              if (!(_q520)) break L519;
              for (let _i543 = 0; _i543 < 2; _i543++) {
                const v_x2 = _i543 === 0 ? _h541 : _h542;
                if (_i543 === 1 && (v_x2 === _h541)) continue;
                const _a544 = sp.adj4[v_x2];
                for (let _i545 = 0; _i545 < _a544.length; _i545++) {
                  const v_z = _a544[_i545];
                  L546: {
                    const v_q2 = sp.adj4Edges[v_x2][_i545];
                    if (!((((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)))) break L546;
                    _g547.length = 0;
                    G548: {
                      _g558.length = 0;
                      _st562.pass++;
                      G559: {
                        const _a563 = sp.adj4[v_z];
                        for (let _i564 = 0; _i564 < _a563.length; _i564++) {
                          if (!(((b.grid[sp.adj4Edges[v_z][_i564]] || -1) !== 2))) continue;
                          const _t565 = sp.adj4Edges[v_z][_i564];
                          const _t566 = _t565;
                          if (_g558.length < 16) { if (!_g558.includes(_t566)) _g558.push(_t566); } else addOnce(_g558, _st562, _t566);
                        }
                      }
                      const _a567 = _g558;
                      for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                        const v_r = _a567[_i568];
                        if (!((v_r !== v_q2))) continue;
                        _g547.push(v_r);
                      }
                    }
                    L569: {
                      const v_S = _g547;
                      const _h570 = v_S.length;
                      let _c588: boolean = (_h570 >= 1);
                      if (_c588) {
                        let _q571 = true;
                        Q572: {
                          const _a573 = v_S;
                          for (let _i574 = 0; _i574 < _a573.length; _i574++) {
                            const v_r = _a573[_i574];
                            const _t575 = sp.edgeEnds[2 * v_r];
                            const _h576 = clueAt(cl.number, _t575);
                            let _c579: boolean = (_h576 === _h528);
                            if (_c579) {
                              const _t577 = sp.edgeEnds[2 * v_r + 1];
                              const _h578 = clueAt(cl.number, _t577);
                              _c579 = (_h578 === _h533);
                            }
                            let _c585: boolean = _c579;
                            if (!_c585) {
                              const _t580 = sp.edgeEnds[2 * v_r];
                              const _h581 = clueAt(cl.number, _t580);
                              let _c584: boolean = (_h581 === _h533);
                              if (_c584) {
                                const _t582 = sp.edgeEnds[2 * v_r + 1];
                                const _h583 = clueAt(cl.number, _t582);
                                _c584 = (_h583 === _h528);
                              }
                              _c585 = _c584;
                            }
                            if (!((_c585 && !(((((sp.edgeEnds[2 * v_r] === _h586) || (sp.edgeEnds[2 * v_r] === _h587)) || (sp.edgeEnds[2 * v_r + 1] === _h586)) || (sp.edgeEnds[2 * v_r + 1] === _h587)))))) {
                              _q571 = false;
                              break Q572;
                            }
                          }
                        }
                        _c588 = _q571;
                      }
                      if (!(_c588)) break L569;
                      if (b.made[0] !== _m142_0) {
                        if (!(!((b.grid[v_p] !== 0)))) { continue R1; }
                        if (!(((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)))) { continue R3; }
                        _g589.length = 0;
                        G590: {
                          _g602.length = 0;
                          _st607.pass++;
                          G603: {
                            const _a609 = sp.adj4[v_y];
                            for (let _i610 = 0; _i610 < _a609.length; _i610++) {
                              if (!(((b.grid[sp.adj4Edges[v_y][_i610]] || -1) !== 2))) continue;
                              const _t611 = sp.adj4Edges[v_y][_i610];
                              const _t612 = _t611;
                              if (_g602.length < 16) { if (!_g602.includes(_t612)) _g602.push(_t612); } else addOnce(_g602, _st607, _t612);
                            }
                          }
                          const _a613 = _g602;
                          for (let _i614 = 0; _i614 < _a613.length; _i614++) {
                            const v_r = _a613[_i614];
                            if (!((v_r !== v_q))) continue;
                            _g589.push(v_r);
                          }
                        }
                        if (!(sameSet(v_R, _g589))) { continue R3; }
                      }
                      if (import.meta.env.DEV && staleChecking) {
                        const _g615: number[] = [];
                        G616: {
                          const _g628: number[] = [];
                          G629: {
                            const _a634 = sp.adj4[v_y];
                            for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                              if (!(((b.grid[sp.adj4Edges[v_y][_i635]] || -1) !== 2))) continue;
                              const _t636 = sp.adj4Edges[v_y][_i635];
                              if (!_g628.includes(_t636)) _g628.push(_t636);
                            }
                          }
                          const _a637 = _g628;
                          for (let _i638 = 0; _i638 < _a637.length; _i638++) {
                            const v_r = _a637[_i638];
                            if (!((v_r !== v_q))) continue;
                            _g615.push(v_r);
                          }
                        }
                        let _q639 = true;
                        Q640: {
                          const _a641 = v_R;
                          for (let _i642 = 0; _i642 < _a641.length; _i642++) {
                            const v_r = _a641[_i642];
                            const _t643 = sp.edgeEnds[2 * v_r];
                            const _t644 = sp.edgeEnds[2 * v_d];
                            let _c647: boolean = (clueAt(cl.number, _t643) === clueAt(cl.number, _t644));
                            if (_c647) {
                              const _t645 = sp.edgeEnds[2 * v_r + 1];
                              const _t646 = sp.edgeEnds[2 * v_d + 1];
                              _c647 = (clueAt(cl.number, _t645) === clueAt(cl.number, _t646));
                            }
                            let _c653: boolean = _c647;
                            if (!_c653) {
                              const _t648 = sp.edgeEnds[2 * v_r];
                              const _t649 = sp.edgeEnds[2 * v_d + 1];
                              let _c652: boolean = (clueAt(cl.number, _t648) === clueAt(cl.number, _t649));
                              if (_c652) {
                                const _t650 = sp.edgeEnds[2 * v_r + 1];
                                const _t651 = sp.edgeEnds[2 * v_d];
                                _c652 = (clueAt(cl.number, _t650) === clueAt(cl.number, _t651));
                              }
                              _c653 = _c652;
                            }
                            if (!(_c653)) {
                              _q639 = false;
                              break Q640;
                            }
                          }
                        }
                        const _g654: number[] = [];
                        G655: {
                          const _g665: number[] = [];
                          G666: {
                            const _a669 = sp.adj4[v_z];
                            for (let _i670 = 0; _i670 < _a669.length; _i670++) {
                              if (!(((b.grid[sp.adj4Edges[v_z][_i670]] || -1) !== 2))) continue;
                              const _t671 = sp.adj4Edges[v_z][_i670];
                              if (!_g665.includes(_t671)) _g665.push(_t671);
                            }
                          }
                          const _a672 = _g665;
                          for (let _i673 = 0; _i673 < _a672.length; _i673++) {
                            const v_r = _a672[_i673];
                            if (!((v_r !== v_q2))) continue;
                            _g654.push(v_r);
                          }
                        }
                        let _c689: boolean = (v_S.length >= 1);
                        if (_c689) {
                          let _q674 = true;
                          Q675: {
                            const _a676 = v_S;
                            for (let _i677 = 0; _i677 < _a676.length; _i677++) {
                              const v_r = _a676[_i677];
                              const _t678 = sp.edgeEnds[2 * v_r];
                              const _t679 = sp.edgeEnds[2 * v_d];
                              let _c682: boolean = (clueAt(cl.number, _t678) === clueAt(cl.number, _t679));
                              if (_c682) {
                                const _t680 = sp.edgeEnds[2 * v_r + 1];
                                const _t681 = sp.edgeEnds[2 * v_d + 1];
                                _c682 = (clueAt(cl.number, _t680) === clueAt(cl.number, _t681));
                              }
                              let _c688: boolean = _c682;
                              if (!_c688) {
                                const _t683 = sp.edgeEnds[2 * v_r];
                                const _t684 = sp.edgeEnds[2 * v_d + 1];
                                let _c687: boolean = (clueAt(cl.number, _t683) === clueAt(cl.number, _t684));
                                if (_c687) {
                                  const _t685 = sp.edgeEnds[2 * v_r + 1];
                                  const _t686 = sp.edgeEnds[2 * v_d];
                                  _c687 = (clueAt(cl.number, _t685) === clueAt(cl.number, _t686));
                                }
                                _c688 = _c687;
                              }
                              if (!((_c688 && !(((((sp.edgeEnds[2 * v_r] === sp.edgeEnds[2 * v_q]) || (sp.edgeEnds[2 * v_r] === sp.edgeEnds[2 * v_q + 1])) || (sp.edgeEnds[2 * v_r + 1] === sp.edgeEnds[2 * v_q])) || (sp.edgeEnds[2 * v_r + 1] === sp.edgeEnds[2 * v_q + 1])))))) {
                                _q674 = false;
                                break Q675;
                              }
                            }
                          }
                          _c689 = _q674;
                        }
                        freshBinding("localDuplicate2", [(sp.edges.includes(v_p)), !((b.grid[v_p] !== 0)), ((v_x === sp.edgeEnds[2 * v_p]) || (v_x === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x].includes(v_y)), (v_q === sp.adj4Edges[v_x][_i489]), ((v_q !== v_p) && ((b.grid[v_q] || -1) !== 2)), sameSet(v_R, _g615), (v_R.length >= 1), (v_d === (v_R[0] ?? -1)), _q639, ((v_x2 === sp.edgeEnds[2 * v_p]) || (v_x2 === sp.edgeEnds[2 * v_p + 1])), (sp.adj4[v_x2].includes(v_z)), (v_q2 === sp.adj4Edges[v_x2][_i545]), (((v_q2 !== v_p) && (v_q2 !== v_q)) && ((b.grid[v_q2] || -1) !== 2)), sameSet(v_S, _g654), _c689], ["p in", "where of p", "x in", "y in", "q =", "where of q", "R =", "where of R", "d =", "where of d", "x2 in", "z in", "q2 =", "where of q2", "S =", "where of S"]);
                      }
                      facts.length = 0;
                      changed = false;
                      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                      if (!(true)) return -1;
                      if (changed || facts.length > 0) {
                        fired = 1;
                        if (fire !== null && !fire({ p: v_p, x: v_x, y: v_y, q: v_q, R: v_R.slice(), d: v_d, x2: v_x2, z: v_z, q2: v_q2, S: v_S.slice() }, facts)) return 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface ParityBinding {
  P: readonly number[];
  p: number;
  Q: readonly number[];
  A: readonly number[];
}

const parityFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function parity(b: Marks, sp: GridSpace, fire: Fire<ParityBinding> | null): number {
  const _g706: number[] = [];
  const _g729: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _m201_0 = b.made[0];
  _g706.length = 0;
  G707: {
    const _a710 = sp.edges;
    for (let _i711 = 0; _i711 < _a710.length; _i711++) {
      const v_e = _a710[_i711];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      _g706.push(v_e);
    }
  }
  const v_P = _g706;
  const _a712 = sp.edges;
  for (let _i713 = 0; _i713 < _a712.length; _i713++) {
    const v_p = _a712[_i713];
    const _h718 = sp.edgeEnds[2 * v_p + 1];
    const _h722 = sp.edgeEnds[2 * v_p];
    let _c724: boolean = !((b.grid[v_p] !== 0));
    if (_c724) {
      let _q714 = false;
      Q715: {
        const _a716 = sp.adj4[sp.edgeEnds[2 * v_p]];
        for (let _i717 = 0; _i717 < _a716.length; _i717++) {
          const v_x = _a716[_i717];
          const _h721 = (v_x !== _h718);
          const _h723 = sp.edgeOf(_h722, v_x);
          const _a719 = sp.adj4[_h718];
          for (let _i720 = 0; _i720 < _a719.length; _i720++) {
            const v_y = _a719[_i720];
            if (!(((_h721 && (v_y !== _h722)) && (sp.adj4[v_x].includes(v_y))))) continue;
            if (((((b.grid[_h723] || -1) !== 2) && ((b.grid[sp.adj4Edges[_h718][_i720]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
              _q714 = true;
              break Q715;
            }
          }
        }
      }
      _c724 = !(_q714);
    }
    if (!(_c724)) continue;
    const v_Q = minus(v_P, setOf(v_p));
    const _eg725 = edgeGroups(sp, v_Q);
    const _h728 = _eg725.of(sp.edgeEnds[2 * v_p + 1]).length;
    L726: {
      const v_A = _eg725.of(sp.edgeEnds[2 * v_p]);
      const _h727 = v_A.length;
      if (!(((!(_eg725.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((_h727 % 2) === 0)) && ((_h728 % 2) === 0)))) break L726;
      if (b.made[0] !== _m201_0) {
        _g729.length = 0;
        G730: {
          const _a733 = sp.edges;
          for (let _i734 = 0; _i734 < _a733.length; _i734++) {
            const v_e = _a733[_i734];
            if (!(((b.grid[v_e] || -1) !== 2))) continue;
            _g729.push(v_e);
          }
        }
        if (!(sameSet(v_P, _g729))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g735: number[] = [];
        G736: {
          const _a739 = sp.edges;
          for (let _i740 = 0; _i740 < _a739.length; _i740++) {
            const v_e = _a739[_i740];
            if (!(((b.grid[v_e] || -1) !== 2))) continue;
            _g735.push(v_e);
          }
        }
        let _c747: boolean = !((b.grid[v_p] !== 0));
        if (_c747) {
          let _q741 = false;
          Q742: {
            const _a743 = sp.adj4[sp.edgeEnds[2 * v_p]];
            for (let _i744 = 0; _i744 < _a743.length; _i744++) {
              const v_x = _a743[_i744];
              const _a745 = sp.adj4[sp.edgeEnds[2 * v_p + 1]];
              for (let _i746 = 0; _i746 < _a745.length; _i746++) {
                const v_y = _a745[_i746];
                if (!((((v_x !== sp.edgeEnds[2 * v_p + 1]) && (v_y !== sp.edgeEnds[2 * v_p])) && (sp.adj4[v_x].includes(v_y))))) continue;
                if (((((b.grid[sp.adj4Edges[sp.edgeEnds[2 * v_p]][_i744]] || -1) !== 2) && ((b.grid[sp.adj4Edges[sp.edgeEnds[2 * v_p + 1]][_i746]] || -1) !== 2)) && ((b.grid[sp.edgeOf(v_x, v_y)] || -1) !== 2))) {
                  _q741 = true;
                  break Q742;
                }
              }
            }
          }
          _c747 = !(_q741);
        }
        freshBinding("parity", [sameSet(v_P, _g735), (sp.edges.includes(v_p)), _c747, sameSet(v_Q, minus(v_P, setOf(v_p))), sameSet(v_A, through(sp, sp.edgeEnds[2 * v_p], v_Q)), ((!(_eg725.of(sp.edgeEnds[2 * v_p + 1]) === v_A) && ((v_A.length % 2) === 0)) && ((through(sp, sp.edgeEnds[2 * v_p + 1], v_Q).length % 2) === 0))], ["P =", "p in", "where of p", "Q =", "A =", "where of A"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ P: v_P.slice(), p: v_p, Q: v_Q.slice(), A: v_A.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SetBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

const setFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function set(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetBinding> | null): number {
  const _g790: number[] = [];
  const _g807: number[] = [];
  const _g836: number[] = [];
  const facts = setFacts;
  let fired = 0;
  let changed = false;
  const _k787 = showingKept.board(cl);
  const _t786 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t786; v_a++) {
    L788: {
      const v_S = (_k787[v_a] ?? showing(sp, cl, v_a));
      const _h789 = v_S.length;
      if (!((_h789 <= 16))) break L788;
      const _h809 = (_h789 - 2);
      const _m233_0 = b.made[0];
      _g790.length = 0;
      G791: {
        const _a798 = v_S;
        for (let _i799 = 0; _i799 < _a798.length; _i799++) {
          const v_c = _a798[_i799];
          let _q800 = false;
          Q801: {
            const _a802 = sp.adj4[v_c];
            for (let _i803 = 0; _i803 < _a802.length; _i803++) {
              if (((b.grid[sp.adj4Edges[v_c][_i803]] || -1) === 1)) {
                _q800 = true;
                break Q801;
              }
            }
          }
          if (!(!(_q800))) continue;
          _g790.push(v_c);
        }
      }
      const v_U = _g790;
      const _e804 = v_U;
      const _pm816: number[] = [];
      let _pp817 = -1;
      for (let _k805 = 0; _k805 < 1 << _e804.length; _k805++) {
        if (!(popcount(_k805) >= 2)) continue;
        const v_T = _g807;
        v_T.length = 0;
        for (let _j806 = 0; _j806 < _e804.length; _j806++) if ((_k805 >> (_e804.length - 1 - _j806)) & 1) v_T.push(_e804[_j806]);
        const _h808 = v_T.length;
        if (!(((_h808 >= 2) && (_h808 <= _h809)))) continue;
        let _g810 = 0;
        if (_pp817 !== b.placed) {
          _pp817 = b.placed;
          for (let _j818 = 0; _j818 < _e804.length; _j818++) {
            const v_m819 = _e804[_j818];
            let _g820 = 0;
            G821: {
              const _a824 = sp.adj4[v_m819];
              for (let _i825 = 0; _i825 < _a824.length; _i825++) {
                const v_y = _a824[_i825];
                if (!(((b.grid[sp.adj4Edges[v_m819][_i825]] || -1) !== 2))) continue;
                const _t826 = clueAt(cl.number, v_y);
                _g820 |= 1 << _t826;
              }
            }
            _pm816[_j818] = _g820;
          }
        }
        for (let _j818 = 0; _j818 < _e804.length; _j818++) if ((_k805 >> (_e804.length - 1 - _j818)) & 1) _g810 |= _pm816[_j818];
        L827: {
          const v_O = _g810;
          const _h828 = popcount(v_O);
          let _c835: boolean = (_h828 === _h808);
          if (_c835) {
            let _q829 = false;
            Q830: {
              const _a831 = v_T;
              for (let _i832 = 0; _i832 < _a831.length; _i832++) {
                const v_x = _a831[_i832];
                const _a833 = sp.adj4[v_x];
                for (let _i834 = 0; _i834 < _a833.length; _i834++) {
                  const v_y = _a833[_i834];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i834]] || -1) !== 2)) {
                    _q829 = true;
                    break Q830;
                  }
                }
              }
            }
            _c835 = !(_q829);
          }
          if (!(_c835)) break L827;
          if (b.made[0] !== _m233_0) {
            _g836.length = 0;
            G837: {
              const _a844 = v_S;
              for (let _i845 = 0; _i845 < _a844.length; _i845++) {
                const v_c = _a844[_i845];
                let _q846 = false;
                Q847: {
                  const _a848 = sp.adj4[v_c];
                  for (let _i849 = 0; _i849 < _a848.length; _i849++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i849]] || -1) === 1)) {
                      _q846 = true;
                      break Q847;
                    }
                  }
                }
                if (!(!(_q846))) continue;
                _g836.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g836))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g850: number[] = [];
            G851: {
              const _a858 = v_S;
              for (let _i859 = 0; _i859 < _a858.length; _i859++) {
                const v_c = _a858[_i859];
                let _q860 = false;
                Q861: {
                  const _a862 = sp.adj4[v_c];
                  for (let _i863 = 0; _i863 < _a862.length; _i863++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i863]] || -1) === 1)) {
                      _q860 = true;
                      break Q861;
                    }
                  }
                }
                if (!(!(_q860))) continue;
                _g850.push(v_c);
              }
            }
            let _g864 = 0;
            G865: {
              const _a870 = v_T;
              for (let _i871 = 0; _i871 < _a870.length; _i871++) {
                const v_x = _a870[_i871];
                const _a872 = sp.adj4[v_x];
                for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                  const v_y = _a872[_i873];
                  if (!(((b.grid[sp.adj4Edges[v_x][_i873]] || -1) !== 2))) continue;
                  const _t874 = clueAt(cl.number, v_y);
                  _g864 |= 1 << _t874;
                }
              }
            }
            let _c881: boolean = (popcount(v_O) === v_T.length);
            if (_c881) {
              let _q875 = false;
              Q876: {
                const _a877 = v_T;
                for (let _i878 = 0; _i878 < _a877.length; _i878++) {
                  const v_x = _a877[_i878];
                  const _a879 = sp.adj4[v_x];
                  for (let _i880 = 0; _i880 < _a879.length; _i880++) {
                    const v_y = _a879[_i880];
                    if (!((v_T.includes(v_y)))) continue;
                    if (((b.grid[sp.adj4Edges[v_x][_i880]] || -1) !== 2)) {
                      _q875 = true;
                      break Q876;
                    }
                  }
                }
              }
              _c881 = !(_q875);
            }
            freshBinding("set", [((0 <= v_a) && (v_a <= cl.n)), sameSet(v_S, showing(sp, cl, v_a)), (v_S.length <= 16), sameSet(v_U, _g850), ((v_T.length >= 2) && (v_T.length <= (v_S.length - 2))), (v_O === _g864), _c881], ["a in", "S =", "where of S", "U =", "where of T", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q882 = true;
          Q883: {
            const _a884 = v_S;
            for (let _i885 = 0; _i885 < _a884.length; _i885++) {
              const v_x = _a884[_i885];
              const _a886 = sp.adj4[v_x];
              for (let _i887 = 0; _i887 < _a886.length; _i887++) {
                const v_y = _a886[_i887];
                const _h889 = clueAt(cl.number, v_y);
                L888: {
                  const v_f = sp.adj4Edges[v_x][_i887];
                  if (!(((((b.grid[v_f] || -1) !== 2) && (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])))) && (((v_O >> _h889) & 1) !== 0)))) break L888;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q882 = false;
                    break Q883;
                  }
                }
              }
            }
          }
          if (!(_q882)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface SetDoublesBinding {
  a: number;
  S: readonly number[];
  U: readonly number[];
  T: readonly number[];
  O: number;
}

const setDoublesFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function setDoubles(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SetDoublesBinding> | null): number {
  const _g932: number[] = [];
  const _g949: number[] = [];
  const _g978: number[] = [];
  const facts = setDoublesFacts;
  let fired = 0;
  let changed = false;
  const _k929 = showingKept.board(cl);
  const _t928 = cl.n;
  R1:
  for (let v_a = 0; v_a <= _t928; v_a++) {
    L930: {
      const v_S = (_k929[v_a] ?? showing(sp, cl, v_a));
      const _h931 = v_S.length;
      if (!((_h931 <= 16))) break L930;
      const _h970 = (_h931 - 2);
      const _m268_0 = b.made[0];
      _g932.length = 0;
      G933: {
        const _a940 = v_S;
        for (let _i941 = 0; _i941 < _a940.length; _i941++) {
          const v_c = _a940[_i941];
          let _q942 = false;
          Q943: {
            const _a944 = sp.adj4[v_c];
            for (let _i945 = 0; _i945 < _a944.length; _i945++) {
              if (((b.grid[sp.adj4Edges[v_c][_i945]] || -1) === 1)) {
                _q942 = true;
                break Q943;
              }
            }
          }
          if (!(!(_q942))) continue;
          _g932.push(v_c);
        }
      }
      const v_U = _g932;
      const _e946 = v_U;
      const _pm957: number[] = [];
      let _pp958 = -1;
      for (let _k947 = 0; _k947 < 1 << _e946.length; _k947++) {
        if (!(popcount(_k947) >= 3)) continue;
        const v_T = _g949;
        v_T.length = 0;
        for (let _j948 = 0; _j948 < _e946.length; _j948++) if ((_k947 >> (_e946.length - 1 - _j948)) & 1) v_T.push(_e946[_j948]);
        const _h950 = v_T.length;
        if (!((_h950 >= 3))) continue;
        let _g951 = 0;
        if (_pp958 !== b.placed) {
          _pp958 = b.placed;
          for (let _j959 = 0; _j959 < _e946.length; _j959++) {
            const v_m960 = _e946[_j959];
            let _g961 = 0;
            G962: {
              const _a965 = sp.adj4[v_m960];
              for (let _i966 = 0; _i966 < _a965.length; _i966++) {
                const v_y = _a965[_i966];
                if (!(((b.grid[sp.adj4Edges[v_m960][_i966]] || -1) !== 2))) continue;
                const _t967 = clueAt(cl.number, v_y);
                _g961 |= 1 << _t967;
              }
            }
            _pm957[_j959] = _g961;
          }
        }
        for (let _j959 = 0; _j959 < _e946.length; _j959++) if ((_k947 >> (_e946.length - 1 - _j959)) & 1) _g951 |= _pm957[_j959];
        L968: {
          const v_O = _g951;
          const _h969 = popcount(v_O);
          let _c977: boolean = (((2 <= _h969) && (_h969 <= _h970)) && ((_h969 === _h950) || (_h969 === (_h950 - 1))));
          if (_c977) {
            let _q971 = false;
            Q972: {
              const _a973 = v_T;
              for (let _i974 = 0; _i974 < _a973.length; _i974++) {
                const v_x = _a973[_i974];
                const _a975 = sp.adj4[v_x];
                for (let _i976 = 0; _i976 < _a975.length; _i976++) {
                  const v_y = _a975[_i976];
                  if (!((v_T.includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_x][_i976]] || -1) !== 2)) {
                    _q971 = true;
                    break Q972;
                  }
                }
              }
            }
            _c977 = _q971;
          }
          if (!(_c977)) break L968;
          const _h1032 = (_h969 < _h950);
          if (b.made[0] !== _m268_0) {
            _g978.length = 0;
            G979: {
              const _a986 = v_S;
              for (let _i987 = 0; _i987 < _a986.length; _i987++) {
                const v_c = _a986[_i987];
                let _q988 = false;
                Q989: {
                  const _a990 = sp.adj4[v_c];
                  for (let _i991 = 0; _i991 < _a990.length; _i991++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i991]] || -1) === 1)) {
                      _q988 = true;
                      break Q989;
                    }
                  }
                }
                if (!(!(_q988))) continue;
                _g978.push(v_c);
              }
            }
            if (!(sameSet(v_U, _g978))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g992: number[] = [];
            G993: {
              const _a1000 = v_S;
              for (let _i1001 = 0; _i1001 < _a1000.length; _i1001++) {
                const v_c = _a1000[_i1001];
                let _q1002 = false;
                Q1003: {
                  const _a1004 = sp.adj4[v_c];
                  for (let _i1005 = 0; _i1005 < _a1004.length; _i1005++) {
                    if (((b.grid[sp.adj4Edges[v_c][_i1005]] || -1) === 1)) {
                      _q1002 = true;
                      break Q1003;
                    }
                  }
                }
                if (!(!(_q1002))) continue;
                _g992.push(v_c);
              }
            }
            let _g1006 = 0;
            G1007: {
              const _a1012 = v_T;
              for (let _i1013 = 0; _i1013 < _a1012.length; _i1013++) {
                const v_x = _a1012[_i1013];
                const _a1014 = sp.adj4[v_x];
                for (let _i1015 = 0; _i1015 < _a1014.length; _i1015++) {
                  const v_y = _a1014[_i1015];
                  if (!(((b.grid[sp.adj4Edges[v_x][_i1015]] || -1) !== 2))) continue;
                  const _t1016 = clueAt(cl.number, v_y);
                  _g1006 |= 1 << _t1016;
                }
              }
            }
            let _c1023: boolean = (((2 <= popcount(v_O)) && (popcount(v_O) <= (v_S.length - 2))) && ((popcount(v_O) === v_T.length) || (popcount(v_O) === (v_T.length - 1))));
            if (_c1023) {
              let _q1017 = false;
              Q1018: {
                const _a1019 = v_T;
                for (let _i1020 = 0; _i1020 < _a1019.length; _i1020++) {
                  const v_x = _a1019[_i1020];
                  const _a1021 = sp.adj4[v_x];
                  for (let _i1022 = 0; _i1022 < _a1021.length; _i1022++) {
                    const v_y = _a1021[_i1022];
                    if (!((v_T.includes(v_y)))) continue;
                    if (((b.grid[sp.adj4Edges[v_x][_i1022]] || -1) !== 2)) {
                      _q1017 = true;
                      break Q1018;
                    }
                  }
                }
              }
              _c1023 = _q1017;
            }
            freshBinding("setDoubles", [((0 <= v_a) && (v_a <= cl.n)), sameSet(v_S, showing(sp, cl, v_a)), (v_S.length <= 16), sameSet(v_U, _g992), (v_T.length >= 3), (v_O === _g1006), _c1023], ["a in", "S =", "where of S", "U =", "where of T", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q1024 = true;
          Q1025: {
            const _a1026 = v_S;
            for (let _i1027 = 0; _i1027 < _a1026.length; _i1027++) {
              const v_x = _a1026[_i1027];
              const _a1028 = sp.adj4[v_x];
              for (let _i1029 = 0; _i1029 < _a1028.length; _i1029++) {
                const v_y = _a1028[_i1029];
                const _h1031 = clueAt(cl.number, v_y);
                L1030: {
                  const v_f = sp.adj4Edges[v_x][_i1029];
                  let _c1045: boolean = (((b.grid[v_f] || -1) !== 2) && (((v_O >> _h1031) & 1) !== 0));
                  if (_c1045) {
                    let _c1038: boolean = (!(v_T.includes(sp.edgeEnds[2 * v_f])) && !(v_T.includes(sp.edgeEnds[2 * v_f + 1])));
                    if (_c1038) {
                      let _c1037: boolean = _h1032;
                      if (!_c1037) {
                        const _t1033 = sp.edgeEnds[2 * v_f];
                        const _h1034 = clueAt(cl.number, _t1033);
                        const _t1035 = sp.edgeEnds[2 * v_f + 1];
                        const _h1036 = clueAt(cl.number, _t1035);
                        _c1037 = (_h1034 === _h1036);
                      }
                      _c1038 = _c1037;
                    }
                    let _c1044: boolean = _c1038;
                    if (!_c1044) {
                      let _c1043: boolean = _h1032;
                      if (_c1043) {
                        const _t1039 = sp.edgeEnds[2 * v_f];
                        const _h1040 = clueAt(cl.number, _t1039);
                        const _t1041 = sp.edgeEnds[2 * v_f + 1];
                        const _h1042 = clueAt(cl.number, _t1041);
                        _c1043 = (_h1040 === _h1042);
                      }
                      _c1044 = (_c1043 && !(((v_T.includes(sp.edgeEnds[2 * v_f])) && (v_T.includes(sp.edgeEnds[2 * v_f + 1])))));
                    }
                    _c1045 = _c1044;
                  }
                  if (!(_c1045)) break L1030;
                  if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
                  if (!(true)) {
                    _q1024 = false;
                    break Q1025;
                  }
                }
              }
            }
          }
          if (!(_q1024)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ a: v_a, S: v_S.slice(), U: v_U.slice(), T: v_T.slice(), O: v_O }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

const showingKept = keptStore<readonly number[]>();
let showingOn: object | null = null;
let showingAt: Kept<readonly number[]> = [];

/** `showing(a)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function showing(_sp: GridSpace, cl: Dealt, v_a: number): readonly number[] {
  if (cl !== showingOn) {
    showingAt = showingKept.board(cl);
    showingOn = cl;
  }
  const _kept: Kept<readonly number[]> = showingAt;
  if (_kept[v_a] !== undefined) return _kept[v_a];
  const _g38: number[] = [];
  G39: {
    const _a42 = cluesValued(cl.number, v_a);
    for (let _i43 = 0; _i43 < _a42.length; _i43++) {
      const v_c = _a42[_i43];
      if (!((clueAt(cl.number, v_c) === v_a))) continue;
      _g38.push(v_c);
    }
  }
  const _made = _g38;
  _kept[v_a] = _made;
  return _made;
}
