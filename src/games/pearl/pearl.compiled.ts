// Compiled by `npm run describe` from src/games/pearl/pearl.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, freshBinding, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, through, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  pearl: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "blackPearl" | "blackRunsOn" | "blackCannotRunOn" | "whiteCannotTurn" | "whiteTurnsOpposite" | "closed" | "earlyLoop" | "earlyThrough";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  square: SquareSays;
  blackPearl: BlackPearlSays;
  blackRunsOn: BlackRunsOnSays;
  blackCannotRunOn: BlackCannotRunOnSays;
  whiteCannotTurn: WhiteCannotTurnSays;
  whiteTurnsOpposite: WhiteTurnsOppositeSays;
  closed: ClosedSays;
  earlyLoop: EarlyLoopSays;
  earlyThrough: EarlyThroughSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["square","blackPearl","blackRunsOn","blackCannotRunOn","whiteCannotTurn","whiteTurnsOpposite","closed","earlyLoop","earlyThrough"] as const;

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
  { id: "square", tier: 0 },
  { id: "blackPearl", tier: 0 },
  { id: "blackRunsOn", tier: 0 },
  { id: "blackCannotRunOn", tier: 0 },
  { id: "whiteCannotTurn", tier: 0 },
  { id: "whiteTurnsOpposite", tier: 0 },
  { id: "closed", tier: 0 },
  { id: "earlyLoop", tier: 1 },
  { id: "earlyThrough", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g23: number[] = [];
  const _domain = rangeMask(1, 2);
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
        const _a7 = sp.cellEdges[v_c];
        for (let _i8 = 0; _i8 < _a7.length; _i8++) {
          const v_e = _a7[_i8];
          const _h9 = (g[v_e] || -1);
          if (!((_h9 === 1))) continue;
          _g5++;
        }
      }
      let _c15: boolean = (_g5 === 0);
      if (!_c15) {
        let _g10 = 0;
        G11: {
          const _a12 = sp.cellEdges[v_c];
          for (let _i13 = 0; _i13 < _a12.length; _i13++) {
            const v_e = _a12[_i13];
            const _h14 = (g[v_e] || -1);
            if (!((_h14 === 1))) continue;
            _g10++;
          }
        }
        _c15 = (_g10 === 2);
      }
      if (!(_c15)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _q16 = false;
  Q17: {
    const _a18 = sp.edges;
    for (let _i19 = 0; _i19 < _a18.length; _i19++) {
      const v_e = _a18[_i19];
      const _h20 = (g[v_e] || -1);
      if ((_h20 === 1)) {
        _q16 = true;
        break Q17;
      }
    }
  }
  let _c45: boolean = _q16;
  if (_c45) {
    let _q21 = true;
    Q22: {
      _g23.length = 0;
      G24: {
        const _a27 = sp.edges;
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_e = _a27[_i28];
          const _h29 = (g[v_e] || -1);
          if (!((_h29 === 1))) continue;
          _g23.push(v_e);
        }
      }
      const v_L = _g23;
      const _eg44 = edgeGroups(sp, v_L);
      const _a30 = sp.cells;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_a = _a30[_i31];
        let _g32 = 0;
        G33: {
          const _a34 = sp.cellEdges[v_a];
          for (let _i35 = 0; _i35 < _a34.length; _i35++) {
            const v_e = _a34[_i35];
            const _h36 = (g[v_e] || -1);
            if (!((_h36 === 1))) continue;
            _g32++;
          }
        }
        if (!((_g32 > 0))) continue;
        const _a37 = sp.cells;
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_b = _a37[_i38];
          let _g39 = 0;
          G40: {
            const _a41 = sp.cellEdges[v_b];
            for (let _i42 = 0; _i42 < _a41.length; _i42++) {
              const v_e = _a41[_i42];
              const _h43 = (g[v_e] || -1);
              if (!((_h43 === 1))) continue;
              _g39++;
            }
          }
          if (!((_g39 > 0))) continue;
          if (!((_eg44.of(v_b) === _eg44.of(v_a)))) {
            _q21 = false;
            break Q22;
          }
        }
      }
    }
    _c45 = _q21;
  }
  if (!(_c45)) return false;
  for (let _k46 = 0; _k46 < cl.pearl.at.length; _k46++) {
    const _at47 = cl.pearl.at[_k46];
    const _v48 = cl.pearl.v[_k46];
    let _g49 = 0;
    G50: {
      const _a51 = sp.cellEdges[_at47];
      for (let _i52 = 0; _i52 < _a51.length; _i52++) {
        const v_e = _a51[_i52];
        const _h53 = (g[v_e] || -1);
        if (!((_h53 === 1))) continue;
        _g49++;
      }
    }
    let _c64: boolean = (_g49 === 2);
    if (_c64) {
      let _q54 = true;
      Q55: {
        const _a56 = sp.cellEdges[_at47];
        for (let _i57 = 0; _i57 < _a56.length; _i57++) {
          const v_e = _a56[_i57];
          const _h61 = (g[v_e] || -1);
          const _h62 = (_h61 === 1);
          const _a58 = sp.cellEdges[_at47];
          const _n59 = _i57;
          for (let _i60 = 0; _i60 < _n59; _i60++) {
            const v_x = _a58[_i60];
            const _h63 = (g[v_x] || -1);
            if (!((_h62 && (_h63 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v48 === 1)))) {
              _q54 = false;
              break Q55;
            }
          }
        }
      }
      _c64 = _q54;
    }
    let _c76: boolean = _c64;
    if (_c76) {
      let _c75: boolean = (_v48 !== 1);
      if (!_c75) {
        let _q65 = true;
        Q66: {
          const _a67 = sp.cellEdges[_at47];
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_e = _a67[_i68];
            const _h69 = (g[v_e] || -1);
            if (!((_h69 === 1))) continue;
            let _q70 = false;
            Q71: {
              const _a72 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at47 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                const v_x = _a72[_i73];
                const _h74 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h74 === 1)) && !(bent(sp, v_x, v_e)))) {
                  _q70 = true;
                  break Q71;
                }
              }
            }
            if (!(_q70)) {
              _q65 = false;
              break Q66;
            }
          }
        }
        _c75 = _q65;
      }
      _c76 = _c75;
    }
    let _c88: boolean = _c76;
    if (_c88) {
      let _c87: boolean = (_v48 !== 2);
      if (!_c87) {
        let _q77 = false;
        Q78: {
          const _a79 = sp.cellEdges[_at47];
          for (let _i80 = 0; _i80 < _a79.length; _i80++) {
            const v_e = _a79[_i80];
            const _h81 = (g[v_e] || -1);
            if (!((_h81 === 1))) continue;
            let _q82 = false;
            Q83: {
              const _a84 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at47 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                const v_x = _a84[_i85];
                const _h86 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h86 === 1)) && bent(sp, v_x, v_e))) {
                  _q82 = true;
                  break Q83;
                }
              }
            }
            if (_q82) {
              _q77 = true;
              break Q78;
            }
          }
        }
        _c87 = _q77;
      }
      _c88 = _c87;
    }
    if (!(_c88)) return false;
  }
  return true;
}

export interface SquareBinding {
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SquareSays {
  terms: { c: number; };
  marks: {  };
}

const squareFacts: number[] = [];
let squareCands = new Int32Array(0);
let square_p154 = new Int32Array(0);
let square_l155: readonly number[] = [];
let square_f160 = new Int32Array(0);
let square_l161: readonly number[] = [];
let square_p200 = new Int32Array(0);
let square_l201: readonly number[] = [];
let square_f206 = new Int32Array(0);
let square_l207: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const squareFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding, SquareSays> | null): number {
  const _g122: number[] = [];
  const _g130: number[] = [];
  if (square_p154.length < sp.edges.length) square_p154 = new Int32Array(sp.edges.length);
  else square_p154.fill(0);
  square_l155 = [];
  let _y156 = false;
  if (square_f160.length < sp.edges.length) square_f160 = new Int32Array(sp.edges.length).fill(-1);
  else square_f160.fill(-1);
  square_l161 = [];
  const _s162: number[] = [];
  const _g176: number[] = [];
  if (square_p200.length < sp.edges.length) square_p200 = new Int32Array(sp.edges.length);
  else square_p200.fill(0);
  square_l201 = [];
  let _y202 = false;
  if (square_f206.length < sp.edges.length) square_f206 = new Int32Array(sp.edges.length).fill(-1);
  else square_f206.fill(-1);
  square_l207 = [];
  const _s208: number[] = [];
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (squareCands.length < sp.edges.length) squareCands = new Int32Array(sp.edges.length);
  const cands = squareCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(squareFootprint) ?? null) : null;
  const _a119 = sp.cells;
  for (let _i120 = 0; _i120 < _a119.length; _i120++) {
    const v_c = _a119[_i120];
    const _h121 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h121 !== 1))) continue;
    let _g157 = -1;
    const _h175 = (_h121 === -1);
    let _g203 = -1;
    _g122.length = 0;
    G123: {
      const _a126 = sp.cellEdges[v_c];
      for (let _i127 = 0; _i127 < _a126.length; _i127++) {
        const v_e = _a126[_i127];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g122.push(v_e);
      }
    }
    L128: {
      const v_F = _g122;
      const _h129 = v_F.length;
      if (!((_h129 > 0))) break L128;
      _g130.length = 0;
      G131: {
        const _a152 = v_F;
        for (let _i153 = 0; _i153 < _a152.length; _i153++) {
          const v_e = _a152[_i153];
          if (_g157 !== _epoch) {
            _g157 = _epoch;
            for (const _e158 of square_l155) square_p154[_e158] = 0;
            _y156 = false;
            const _a159 = sp.cellEdges[v_c];
            for (const _e163 of square_l161) square_f160[_e163] = -1;
            square_l161 = _a159;
            let _i165 = 0;
            _s162[0] = 0;
            let _o169 = _a159.length === 0;
            for (;;) {
              if (_a159.length === 0) {
                if (!_o169) break;
                _o169 = false;
              }
              while (_a159.length > 0 && _i165 >= 0) {
                const _e163 = _a159[_i165];
                if (_s162[_i165] > 0) square_f160[_e163] = -1;
                let _r168 = (cands[_e163] >= 0 ? cands[_e163] : (cands[_e163] = b.cands[_e163])) & ~((2 << _s162[_i165]) - 1);
                let _d164 = 0;
                V167: for (; _r168 !== 0; _r168 &= _r168 - 1) {
                  _d164 = 31 - Math.clz32(_r168 & -_r168);
                  square_f160[_e163] = _d164;
                  for (let _j166 = 0; _j166 < _i165; _j166++) {
                    const _y170 = _a159[_j166];
                    if (!(((square_f160[_e163] === 1) && (square_f160[_y170] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e163, _y170)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e163, _y170)))))) continue V167;
                  }
                  break;
                }
                if (_r168 === 0) {
                  _s162[_i165] = 0;
                  _i165--;
                  continue;
                }
                _s162[_i165] = _d164;
                if (_i165 === _a159.length - 1) break;
                _i165++;
                _s162[_i165] = 0;
              }
              if (_i165 < 0) break;
              let _g171 = 0;
              G172: {
                const _a173 = sp.cellEdges[v_c];
                for (let _i174 = 0; _i174 < _a173.length; _i174++) {
                  const v_x = _a173[_i174];
                  if (!((square_f160[v_x] === 1))) continue;
                  _g171++;
                }
              }
              if (!(((_g171 === 2) || ((_g171 === 0) && _h175)))) continue;
              if (!(true)) continue;
              square_l155 = _a159;
              _y156 = true;
              for (const _e158 of _a159) square_p154[_e158] |= 1 << square_f160[_e158];
            }
          }
          if (!(((((square_p154[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y156 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g130.push(v_e);
        }
      }
      const v_W = _g130;
      _g176.length = 0;
      G177: {
        const _a198 = v_F;
        for (let _i199 = 0; _i199 < _a198.length; _i199++) {
          const v_e = _a198[_i199];
          if (_g203 !== _epoch) {
            _g203 = _epoch;
            for (const _e204 of square_l201) square_p200[_e204] = 0;
            _y202 = false;
            const _a205 = sp.cellEdges[v_c];
            for (const _e209 of square_l207) square_f206[_e209] = -1;
            square_l207 = _a205;
            let _i211 = 0;
            _s208[0] = 0;
            let _o215 = _a205.length === 0;
            for (;;) {
              if (_a205.length === 0) {
                if (!_o215) break;
                _o215 = false;
              }
              while (_a205.length > 0 && _i211 >= 0) {
                const _e209 = _a205[_i211];
                if (_s208[_i211] > 0) square_f206[_e209] = -1;
                let _r214 = (cands[_e209] >= 0 ? cands[_e209] : (cands[_e209] = b.cands[_e209])) & ~((2 << _s208[_i211]) - 1);
                let _d210 = 0;
                V213: for (; _r214 !== 0; _r214 &= _r214 - 1) {
                  _d210 = 31 - Math.clz32(_r214 & -_r214);
                  square_f206[_e209] = _d210;
                  for (let _j212 = 0; _j212 < _i211; _j212++) {
                    const _y216 = _a205[_j212];
                    if (!(((square_f206[_e209] === 1) && (square_f206[_y216] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e209, _y216)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e209, _y216)))))) continue V213;
                  }
                  break;
                }
                if (_r214 === 0) {
                  _s208[_i211] = 0;
                  _i211--;
                  continue;
                }
                _s208[_i211] = _d210;
                if (_i211 === _a205.length - 1) break;
                _i211++;
                _s208[_i211] = 0;
              }
              if (_i211 < 0) break;
              let _g217 = 0;
              G218: {
                const _a219 = sp.cellEdges[v_c];
                for (let _i220 = 0; _i220 < _a219.length; _i220++) {
                  const v_x = _a219[_i220];
                  if (!((square_f206[v_x] === 1))) continue;
                  _g217++;
                }
              }
              if (!(((_g217 === 2) || ((_g217 === 0) && _h175)))) continue;
              if (!(true)) continue;
              square_l201 = _a205;
              _y202 = true;
              for (const _e204 of _a205) square_p200[_e204] |= 1 << square_f206[_e204];
            }
          }
          if (!(((((square_p200[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y202 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g176.push(v_e);
        }
      }
      L221: {
        const v_N = _g176;
        let _q222 = false;
        Q223: {
          const _a224 = v_F;
          for (let _i225 = 0; _i225 < _a224.length; _i225++) {
            const v_e = _a224[_i225];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q222 = true;
              break Q223;
            }
          }
        }
        if (!(_q222)) break L221;
        if (DEV && staleChecking) {
          const _g226: number[] = [];
          G227: {
            const _a230 = sp.cellEdges[v_c];
            for (let _i231 = 0; _i231 < _a230.length; _i231++) {
              const v_e = _a230[_i231];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g226.push(v_e);
            }
          }
          const _g232: number[] = [];
          G233: {
            const _a254 = v_F;
            for (let _i255 = 0; _i255 < _a254.length; _i255++) {
              const v_e = _a254[_i255];
              let _q256 = false;
              Q257: {
                const _f259 = new Int32Array(sp.edges.length).fill(-1);
                let _l260: readonly number[] = [];
                const _s261: number[] = [];
                const _a258 = sp.cellEdges[v_c];
                for (const _e262 of _l260) _f259[_e262] = -1;
                _l260 = _a258;
                let _i264 = 0;
                _s261[0] = 0;
                let _o268 = _a258.length === 0;
                for (;;) {
                  if (_a258.length === 0) {
                    if (!_o268) break;
                    _o268 = false;
                  }
                  while (_a258.length > 0 && _i264 >= 0) {
                    const _e262 = _a258[_i264];
                    if (_s261[_i264] > 0) _f259[_e262] = -1;
                    let _r267 = (cands[_e262] >= 0 ? cands[_e262] : (cands[_e262] = b.cands[_e262])) & ~((2 << _s261[_i264]) - 1);
                    let _d263 = 0;
                    V266: for (; _r267 !== 0; _r267 &= _r267 - 1) {
                      _d263 = 31 - Math.clz32(_r267 & -_r267);
                      _f259[_e262] = _d263;
                      if (_e262 === v_e && _d263 !== 1) continue;
                      for (let _j265 = 0; _j265 < _i264; _j265++) {
                        const _y269 = _a258[_j265];
                        if (!(((_f259[_e262] === 1) && (_f259[_y269] === 1)))) continue;
                        if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e262, _y269)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e262, _y269)))))) continue V266;
                      }
                      break;
                    }
                    if (_r267 === 0) {
                      _s261[_i264] = 0;
                      _i264--;
                      continue;
                    }
                    _s261[_i264] = _d263;
                    if (_i264 === _a258.length - 1) break;
                    _i264++;
                    _s261[_i264] = 0;
                  }
                  if (_i264 < 0) break;
                  let _g270 = 0;
                  G271: {
                    const _a272 = sp.cellEdges[v_c];
                    for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                      const v_x = _a272[_i273];
                      if (!((_f259[v_x] === 1))) continue;
                      _g270++;
                    }
                  }
                  if (!(((_g270 === 2) || ((_g270 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q256 = true;
                    break Q257;
                  }
                }
              }
              if (!(_q256)) continue;
              _g232.push(v_e);
            }
          }
          const _g274: number[] = [];
          G275: {
            const _a296 = v_F;
            for (let _i297 = 0; _i297 < _a296.length; _i297++) {
              const v_e = _a296[_i297];
              let _q298 = false;
              Q299: {
                const _f301 = new Int32Array(sp.edges.length).fill(-1);
                let _l302: readonly number[] = [];
                const _s303: number[] = [];
                const _a300 = sp.cellEdges[v_c];
                for (const _e304 of _l302) _f301[_e304] = -1;
                _l302 = _a300;
                let _i306 = 0;
                _s303[0] = 0;
                let _o310 = _a300.length === 0;
                for (;;) {
                  if (_a300.length === 0) {
                    if (!_o310) break;
                    _o310 = false;
                  }
                  while (_a300.length > 0 && _i306 >= 0) {
                    const _e304 = _a300[_i306];
                    if (_s303[_i306] > 0) _f301[_e304] = -1;
                    let _r309 = (cands[_e304] >= 0 ? cands[_e304] : (cands[_e304] = b.cands[_e304])) & ~((2 << _s303[_i306]) - 1);
                    let _d305 = 0;
                    V308: for (; _r309 !== 0; _r309 &= _r309 - 1) {
                      _d305 = 31 - Math.clz32(_r309 & -_r309);
                      _f301[_e304] = _d305;
                      if (_e304 === v_e && _d305 !== 2) continue;
                      for (let _j307 = 0; _j307 < _i306; _j307++) {
                        const _y311 = _a300[_j307];
                        if (!(((_f301[_e304] === 1) && (_f301[_y311] === 1)))) continue;
                        if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e304, _y311)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e304, _y311)))))) continue V308;
                      }
                      break;
                    }
                    if (_r309 === 0) {
                      _s303[_i306] = 0;
                      _i306--;
                      continue;
                    }
                    _s303[_i306] = _d305;
                    if (_i306 === _a300.length - 1) break;
                    _i306++;
                    _s303[_i306] = 0;
                  }
                  if (_i306 < 0) break;
                  let _g312 = 0;
                  G313: {
                    const _a314 = sp.cellEdges[v_c];
                    for (let _i315 = 0; _i315 < _a314.length; _i315++) {
                      const v_x = _a314[_i315];
                      if (!((_f301[v_x] === 1))) continue;
                      _g312++;
                    }
                  }
                  if (!(((_g312 === 2) || ((_g312 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q298 = true;
                    break Q299;
                  }
                }
              }
              if (!(_q298)) continue;
              _g274.push(v_e);
            }
          }
          let _q316 = false;
          Q317: {
            const _a318 = v_F;
            for (let _i319 = 0; _i319 < _a318.length; _i319++) {
              const v_e = _a318[_i319];
              if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
                _q316 = true;
                break Q317;
              }
            }
          }
          freshBinding("square", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) !== 1), sameSet(v_F, _g226), (v_F.length > 0), sameSet(v_W, _g232), sameSet(v_N, _g274), _q316], ["c in", "where of c", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q320 = true;
        Q321: {
          const _a322 = v_F;
          for (let _i323 = 0; _i323 < _a322.length; _i323++) {
            const v_e = _a322[_i323];
            let _c325: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c325) {
              let _c324: boolean = !(!(v_W.includes(v_e)));
              if (!_c324) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c324 = true;
              }
              _c325 = _c324;
            }
            let _c327: boolean = _c325;
            if (_c327) {
              let _c326: boolean = !(!(v_N.includes(v_e)));
              if (!_c326) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c326 = true;
              }
              _c327 = _c326;
            }
            if (!(_c327)) {
              _q320 = false;
              break Q321;
            }
          }
        }
        if (!(_q320)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c }, marks: {  } };
            if (!fire({ c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface BlackPearlBinding {
  c: number;
  e: number;
  A: boolean;
  B: boolean;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BlackPearlSays {
  terms: { c: number; };
  marks: {  };
}

const blackPearlFacts: number[] = [];
let blackPearlCands = new Int32Array(0);
let blackPearl_p47 = new Int32Array(0);
let blackPearl_l48: readonly number[] = [];
let blackPearl_f53 = new Int32Array(0);
let blackPearl_l54: readonly number[] = [];
let blackPearl_p68 = new Int32Array(0);
let blackPearl_l69: readonly number[] = [];
let blackPearl_f74 = new Int32Array(0);
let blackPearl_l75: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackPearlFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackPearl(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackPearlBinding, BlackPearlSays> | null): number {
  if (blackPearl_p47.length < sp.edges.length) blackPearl_p47 = new Int32Array(sp.edges.length);
  else blackPearl_p47.fill(0);
  blackPearl_l48 = [];
  let _y49 = false;
  if (blackPearl_f53.length < sp.edges.length) blackPearl_f53 = new Int32Array(sp.edges.length).fill(-1);
  else blackPearl_f53.fill(-1);
  blackPearl_l54 = [];
  const _s55: number[] = [];
  if (blackPearl_p68.length < sp.edges.length) blackPearl_p68 = new Int32Array(sp.edges.length);
  else blackPearl_p68.fill(0);
  blackPearl_l69 = [];
  let _y70 = false;
  if (blackPearl_f74.length < sp.edges.length) blackPearl_f74 = new Int32Array(sp.edges.length).fill(-1);
  else blackPearl_f74.fill(-1);
  blackPearl_l75 = [];
  const _s76: number[] = [];
  const facts = blackPearlFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (blackPearlCands.length < sp.edges.length) blackPearlCands = new Int32Array(sp.edges.length);
  const cands = blackPearlCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackPearlFootprint) ?? null) : null;
  const _a42 = cluesValued(cl.pearl, 1);
  for (let _i43 = 0; _i43 < _a42.length; _i43++) {
    const v_c = _a42[_i43];
    const _h44 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h44 === 1))) continue;
    let _g50 = -1;
    let _g71 = -1;
    const _a45 = sp.cellEdges[v_c];
    for (let _i46 = 0; _i46 < _a45.length; _i46++) {
      const v_e = _a45[_i46];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g50 !== _epoch) {
        _g50 = _epoch;
        for (const _e51 of blackPearl_l48) blackPearl_p47[_e51] = 0;
        _y49 = false;
        const _a52 = sp.cellEdges[v_c];
        for (const _e56 of blackPearl_l54) blackPearl_f53[_e56] = -1;
        blackPearl_l54 = _a52;
        let _i58 = 0;
        _s55[0] = 0;
        let _o62 = _a52.length === 0;
        for (;;) {
          if (_a52.length === 0) {
            if (!_o62) break;
            _o62 = false;
          }
          while (_a52.length > 0 && _i58 >= 0) {
            const _e56 = _a52[_i58];
            if (_s55[_i58] > 0) blackPearl_f53[_e56] = -1;
            let _r61 = (cands[_e56] >= 0 ? cands[_e56] : (cands[_e56] = b.cands[_e56])) & ~((2 << _s55[_i58]) - 1);
            let _d57 = 0;
            V60: for (; _r61 !== 0; _r61 &= _r61 - 1) {
              _d57 = 31 - Math.clz32(_r61 & -_r61);
              blackPearl_f53[_e56] = _d57;
              for (let _j59 = 0; _j59 < _i58; _j59++) {
                const _y63 = _a52[_j59];
                if (!(((blackPearl_f53[_e56] === 1) && (blackPearl_f53[_y63] === 1)))) continue;
                if (!(bent(sp, _e56, _y63))) continue V60;
              }
              break;
            }
            if (_r61 === 0) {
              _s55[_i58] = 0;
              _i58--;
              continue;
            }
            _s55[_i58] = _d57;
            if (_i58 === _a52.length - 1) break;
            _i58++;
            _s55[_i58] = 0;
          }
          if (_i58 < 0) break;
          let _g64 = 0;
          G65: {
            const _a66 = sp.cellEdges[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_x = _a66[_i67];
              if (!((blackPearl_f53[v_x] === 1))) continue;
              _g64++;
            }
          }
          if (!((_g64 === 2))) continue;
          if (!(true)) continue;
          blackPearl_l48 = _a52;
          _y49 = true;
          for (const _e51 of _a52) blackPearl_p47[_e51] |= 1 << blackPearl_f53[_e51];
        }
      }
      const v_A = ((((blackPearl_p47[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y49 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g71 !== _epoch) {
        _g71 = _epoch;
        for (const _e72 of blackPearl_l69) blackPearl_p68[_e72] = 0;
        _y70 = false;
        const _a73 = sp.cellEdges[v_c];
        for (const _e77 of blackPearl_l75) blackPearl_f74[_e77] = -1;
        blackPearl_l75 = _a73;
        let _i79 = 0;
        _s76[0] = 0;
        let _o83 = _a73.length === 0;
        for (;;) {
          if (_a73.length === 0) {
            if (!_o83) break;
            _o83 = false;
          }
          while (_a73.length > 0 && _i79 >= 0) {
            const _e77 = _a73[_i79];
            if (_s76[_i79] > 0) blackPearl_f74[_e77] = -1;
            let _r82 = (cands[_e77] >= 0 ? cands[_e77] : (cands[_e77] = b.cands[_e77])) & ~((2 << _s76[_i79]) - 1);
            let _d78 = 0;
            V81: for (; _r82 !== 0; _r82 &= _r82 - 1) {
              _d78 = 31 - Math.clz32(_r82 & -_r82);
              blackPearl_f74[_e77] = _d78;
              for (let _j80 = 0; _j80 < _i79; _j80++) {
                const _y84 = _a73[_j80];
                if (!(((blackPearl_f74[_e77] === 1) && (blackPearl_f74[_y84] === 1)))) continue;
                if (!(bent(sp, _e77, _y84))) continue V81;
              }
              break;
            }
            if (_r82 === 0) {
              _s76[_i79] = 0;
              _i79--;
              continue;
            }
            _s76[_i79] = _d78;
            if (_i79 === _a73.length - 1) break;
            _i79++;
            _s76[_i79] = 0;
          }
          if (_i79 < 0) break;
          let _g85 = 0;
          G86: {
            const _a87 = sp.cellEdges[v_c];
            for (let _i88 = 0; _i88 < _a87.length; _i88++) {
              const v_x = _a87[_i88];
              if (!((blackPearl_f74[v_x] === 1))) continue;
              _g85++;
            }
          }
          if (!((_g85 === 2))) continue;
          if (!(true)) continue;
          blackPearl_l69 = _a73;
          _y70 = true;
          for (const _e72 of _a73) blackPearl_p68[_e72] |= 1 << blackPearl_f74[_e72];
        }
      }
      L89: {
        const v_B = ((((blackPearl_p68[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y70 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L89;
        if (DEV && staleChecking) {
          let _q90 = false;
          Q91: {
            const _f93 = new Int32Array(sp.edges.length).fill(-1);
            let _l94: readonly number[] = [];
            const _s95: number[] = [];
            const _a92 = sp.cellEdges[v_c];
            for (const _e96 of _l94) _f93[_e96] = -1;
            _l94 = _a92;
            let _i98 = 0;
            _s95[0] = 0;
            let _o102 = _a92.length === 0;
            for (;;) {
              if (_a92.length === 0) {
                if (!_o102) break;
                _o102 = false;
              }
              while (_a92.length > 0 && _i98 >= 0) {
                const _e96 = _a92[_i98];
                if (_s95[_i98] > 0) _f93[_e96] = -1;
                let _r101 = (cands[_e96] >= 0 ? cands[_e96] : (cands[_e96] = b.cands[_e96])) & ~((2 << _s95[_i98]) - 1);
                let _d97 = 0;
                V100: for (; _r101 !== 0; _r101 &= _r101 - 1) {
                  _d97 = 31 - Math.clz32(_r101 & -_r101);
                  _f93[_e96] = _d97;
                  if (_e96 === v_e && _d97 !== 1) continue;
                  for (let _j99 = 0; _j99 < _i98; _j99++) {
                    const _y103 = _a92[_j99];
                    if (!(((_f93[_e96] === 1) && (_f93[_y103] === 1)))) continue;
                    if (!(bent(sp, _e96, _y103))) continue V100;
                  }
                  break;
                }
                if (_r101 === 0) {
                  _s95[_i98] = 0;
                  _i98--;
                  continue;
                }
                _s95[_i98] = _d97;
                if (_i98 === _a92.length - 1) break;
                _i98++;
                _s95[_i98] = 0;
              }
              if (_i98 < 0) break;
              let _g104 = 0;
              G105: {
                const _a106 = sp.cellEdges[v_c];
                for (let _i107 = 0; _i107 < _a106.length; _i107++) {
                  const v_x = _a106[_i107];
                  if (!((_f93[v_x] === 1))) continue;
                  _g104++;
                }
              }
              if (!((_g104 === 2))) continue;
              if (true) {
                _q90 = true;
                break Q91;
              }
            }
          }
          let _q108 = false;
          Q109: {
            const _f111 = new Int32Array(sp.edges.length).fill(-1);
            let _l112: readonly number[] = [];
            const _s113: number[] = [];
            const _a110 = sp.cellEdges[v_c];
            for (const _e114 of _l112) _f111[_e114] = -1;
            _l112 = _a110;
            let _i116 = 0;
            _s113[0] = 0;
            let _o120 = _a110.length === 0;
            for (;;) {
              if (_a110.length === 0) {
                if (!_o120) break;
                _o120 = false;
              }
              while (_a110.length > 0 && _i116 >= 0) {
                const _e114 = _a110[_i116];
                if (_s113[_i116] > 0) _f111[_e114] = -1;
                let _r119 = (cands[_e114] >= 0 ? cands[_e114] : (cands[_e114] = b.cands[_e114])) & ~((2 << _s113[_i116]) - 1);
                let _d115 = 0;
                V118: for (; _r119 !== 0; _r119 &= _r119 - 1) {
                  _d115 = 31 - Math.clz32(_r119 & -_r119);
                  _f111[_e114] = _d115;
                  if (_e114 === v_e && _d115 !== 2) continue;
                  for (let _j117 = 0; _j117 < _i116; _j117++) {
                    const _y121 = _a110[_j117];
                    if (!(((_f111[_e114] === 1) && (_f111[_y121] === 1)))) continue;
                    if (!(bent(sp, _e114, _y121))) continue V118;
                  }
                  break;
                }
                if (_r119 === 0) {
                  _s113[_i116] = 0;
                  _i116--;
                  continue;
                }
                _s113[_i116] = _d115;
                if (_i116 === _a110.length - 1) break;
                _i116++;
                _s113[_i116] = 0;
              }
              if (_i116 < 0) break;
              let _g122 = 0;
              G123: {
                const _a124 = sp.cellEdges[v_c];
                for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                  const v_x = _a124[_i125];
                  if (!((_f111[v_x] === 1))) continue;
                  _g122++;
                }
              }
              if (!((_g122 === 2))) continue;
              if (true) {
                _q108 = true;
                break Q109;
              }
            }
          }
          freshBinding("blackPearl", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q90), (v_B === _q108), (!(v_A) || !(v_B))], ["c in", "where of c", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c127: boolean = (v_A || v_B);
        if (_c127) {
          let _c126: boolean = !(!(v_A));
          if (!_c126) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c126 = true;
          }
          _c127 = _c126;
        }
        let _c129: boolean = _c127;
        if (_c129) {
          let _c128: boolean = !(!(v_B));
          if (!_c128) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c128 = true;
          }
          _c129 = _c128;
        }
        if (!(_c129)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c }, marks: {  } };
            if (!fire({ c: v_c, e: v_e, A: v_A, B: v_B }, facts, _says)) return 1;
          }
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface BlackRunsOnBinding {
  c: number;
  e: number;
  j: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BlackRunsOnSays {
  terms: { c: number; e: number; };
  marks: {  };
}

const blackRunsOnFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const blackRunsOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackRunsOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackRunsOnBinding, BlackRunsOnSays> | null): number {
  const facts = blackRunsOnFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(blackRunsOnFootprint) ?? null) : null;
  const _a10 = cluesValued(cl.pearl, 1);
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    const _h12 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h12 === 1))) continue;
    const _a13 = sp.cellEdges[v_c];
    for (let _i14 = 0; _i14 < _a13.length; _i14++) {
      const v_e = _a13[_i14];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      L15: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        let _q16 = false;
        Q17: {
          const _a18 = sp.cellEdges[v_j];
          for (let _i19 = 0; _i19 < _a18.length; _i19++) {
            const v_x = _a18[_i19];
            if ((((v_x !== v_e) && !(bent(sp, v_x, v_e))) && ((b.grid[v_x] || -1) === 1))) {
              _q16 = true;
              break Q17;
            }
          }
        }
        if (!(!(_q16))) break L15;
        if (DEV && staleChecking) {
          let _q20 = false;
          Q21: {
            const _a22 = sp.cellEdges[v_j];
            for (let _i23 = 0; _i23 < _a22.length; _i23++) {
              const v_x = _a22[_i23];
              if ((((v_x !== v_e) && !(bent(sp, v_x, v_e))) && ((b.grid[v_x] || -1) === 1))) {
                _q20 = true;
                break Q21;
              }
            }
          }
          freshBinding("blackRunsOn", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) === 1), (v_j === (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), !(_q20)], ["c in", "where of c", "e in", "where of e", "j =", "where of j"]);
        }
        facts.length = 0;
        changed = false;
        let _q24 = false;
        Q25: {
          const _a26 = sp.cellEdges[v_j];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_x = _a26[_i27];
            if (((v_x !== v_e) && !(bent(sp, v_x, v_e)))) {
              _q24 = true;
              break Q25;
            }
          }
        }
        let _c35: boolean = _q24;
        if (_c35) {
          let _q28 = true;
          Q29: {
            const _a30 = sp.cellEdges[v_j];
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_x = _a30[_i31];
              if (!((v_x !== v_e))) continue;
              let _c32: boolean = !(bent(sp, v_x, v_e));
              if (!_c32) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c32 = true;
              }
              let _c34: boolean = _c32;
              if (_c34) {
                let _c33: boolean = !(!(bent(sp, v_x, v_e)));
                if (!_c33) {
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  _c33 = true;
                }
                _c34 = _c33;
              }
              if (!(_c34)) {
                _q28 = false;
                break Q29;
              }
            }
          }
          _c35 = _q28;
        }
        if (!(_c35)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c, e: v_e }, marks: {  } };
            if (!fire({ c: v_c, e: v_e, j: v_j }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface BlackCannotRunOnBinding {
  c: number;
  e: number;
  j: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BlackCannotRunOnSays {
  terms: { c: number; e: number; };
  marks: {  };
}

const blackCannotRunOnFacts: number[] = [];
let blackCannotRunOnCands = new Int32Array(0);
let blackCannotRunOn_f38 = new Int32Array(0);
let blackCannotRunOn_l39: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackCannotRunOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackCannotRunOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackCannotRunOnBinding, BlackCannotRunOnSays> | null): number {
  if (blackCannotRunOn_f38.length < sp.edges.length) blackCannotRunOn_f38 = new Int32Array(sp.edges.length).fill(-1);
  else blackCannotRunOn_f38.fill(-1);
  blackCannotRunOn_l39 = [];
  const _s40: number[] = [];
  const facts = blackCannotRunOnFacts;
  let fired = 0;
  let changed = false;
  if (blackCannotRunOnCands.length < sp.edges.length) blackCannotRunOnCands = new Int32Array(sp.edges.length);
  const cands = blackCannotRunOnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackCannotRunOnFootprint) ?? null) : null;
  const _a29 = cluesValued(cl.pearl, 1);
  for (let _i30 = 0; _i30 < _a29.length; _i30++) {
    const v_c = _a29[_i30];
    const _h31 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h31 === 1))) continue;
    const _a32 = sp.cellEdges[v_c];
    for (let _i33 = 0; _i33 < _a32.length; _i33++) {
      const v_e = _a32[_i33];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      L34: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        const _h48 = clueAt(cl.pearl, v_j);
        const _h49 = (_h48 !== 1);
        let _q35 = false;
        Q36: {
          const _a37 = sp.cellEdges[v_j];
          for (const _e41 of blackCannotRunOn_l39) blackCannotRunOn_f38[_e41] = -1;
          blackCannotRunOn_l39 = _a37;
          let _i43 = 0;
          _s40[0] = 0;
          let _o47 = _a37.length === 0;
          for (;;) {
            if (_a37.length === 0) {
              if (!_o47) break;
              _o47 = false;
            }
            while (_a37.length > 0 && _i43 >= 0) {
              const _e41 = _a37[_i43];
              if (_s40[_i43] > 0) blackCannotRunOn_f38[_e41] = -1;
              let _r46 = (cands[_e41] >= 0 ? cands[_e41] : (cands[_e41] = b.cands[_e41])) & ~((2 << _s40[_i43]) - 1);
              let _d42 = 0;
              for (; _r46 !== 0; _r46 &= _r46 - 1) {
                _d42 = 31 - Math.clz32(_r46 & -_r46);
                blackCannotRunOn_f38[_e41] = _d42;
                if (_e41 === v_e && _d42 !== 1) continue;
                break;
              }
              if (_r46 === 0) {
                _s40[_i43] = 0;
                _i43--;
                continue;
              }
              _s40[_i43] = _d42;
              if (_i43 === _a37.length - 1) break;
              _i43++;
              _s40[_i43] = 0;
            }
            if (_i43 < 0) break;
            let _c54: boolean = _h49;
            if (_c54) {
              let _g50 = 0;
              G51: {
                const _a52 = sp.cellEdges[v_j];
                for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                  const v_x = _a52[_i53];
                  if (!((blackCannotRunOn_f38[v_x] === 1))) continue;
                  _g50++;
                }
              }
              _c54 = (_g50 === 2);
            }
            let _c59: boolean = _c54;
            if (_c59) {
              let _q55 = true;
              Q56: {
                const _a57 = sp.cellEdges[v_j];
                for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                  const v_x = _a57[_i58];
                  if (!(((blackCannotRunOn_f38[v_x] === 1) && (v_x !== v_e)))) continue;
                  if (!(!(bent(sp, v_x, v_e)))) {
                    _q55 = false;
                    break Q56;
                  }
                }
              }
              _c59 = _q55;
            }
            if (!(_c59)) continue;
            if (true) {
              _q35 = true;
              break Q36;
            }
          }
        }
        if (!(!(_q35))) break L34;
        if (DEV && staleChecking) {
          let _q60 = false;
          Q61: {
            const _f63 = new Int32Array(sp.edges.length).fill(-1);
            let _l64: readonly number[] = [];
            const _s65: number[] = [];
            const _a62 = sp.cellEdges[v_j];
            for (const _e66 of _l64) _f63[_e66] = -1;
            _l64 = _a62;
            let _i68 = 0;
            _s65[0] = 0;
            let _o72 = _a62.length === 0;
            for (;;) {
              if (_a62.length === 0) {
                if (!_o72) break;
                _o72 = false;
              }
              while (_a62.length > 0 && _i68 >= 0) {
                const _e66 = _a62[_i68];
                if (_s65[_i68] > 0) _f63[_e66] = -1;
                let _r71 = (cands[_e66] >= 0 ? cands[_e66] : (cands[_e66] = b.cands[_e66])) & ~((2 << _s65[_i68]) - 1);
                let _d67 = 0;
                for (; _r71 !== 0; _r71 &= _r71 - 1) {
                  _d67 = 31 - Math.clz32(_r71 & -_r71);
                  _f63[_e66] = _d67;
                  if (_e66 === v_e && _d67 !== 1) continue;
                  break;
                }
                if (_r71 === 0) {
                  _s65[_i68] = 0;
                  _i68--;
                  continue;
                }
                _s65[_i68] = _d67;
                if (_i68 === _a62.length - 1) break;
                _i68++;
                _s65[_i68] = 0;
              }
              if (_i68 < 0) break;
              let _c77: boolean = (clueAt(cl.pearl, v_j) !== 1);
              if (_c77) {
                let _g73 = 0;
                G74: {
                  const _a75 = sp.cellEdges[v_j];
                  for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                    const v_x = _a75[_i76];
                    if (!((_f63[v_x] === 1))) continue;
                    _g73++;
                  }
                }
                _c77 = (_g73 === 2);
              }
              let _c82: boolean = _c77;
              if (_c82) {
                let _q78 = true;
                Q79: {
                  const _a80 = sp.cellEdges[v_j];
                  for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                    const v_x = _a80[_i81];
                    if (!(((_f63[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(!(bent(sp, v_x, v_e)))) {
                      _q78 = false;
                      break Q79;
                    }
                  }
                }
                _c82 = _q78;
              }
              if (!(_c82)) continue;
              if (true) {
                _q60 = true;
                break Q61;
              }
            }
          }
          freshBinding("blackCannotRunOn", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_j === (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), !(_q60)], ["c in", "where of c", "e in", "where of e", "j =", "where of j"]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c, e: v_e }, marks: {  } };
            if (!fire({ c: v_c, e: v_e, j: v_j }, facts, _says)) return 1;
          }
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface WhiteCannotTurnBinding {
  c: number;
  e: number;
  f: number;
  P: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface WhiteCannotTurnSays {
  terms: { c: number; e: number; };
  marks: {  };
}

const whiteCannotTurnFacts: number[] = [];
let whiteCannotTurnCands = new Int32Array(0);
let whiteCannotTurn_p82 = new Int32Array(0);
let whiteCannotTurn_l83: readonly number[] = [];
let whiteCannotTurn_f88 = new Int32Array(0);
let whiteCannotTurn_l89: readonly number[] = [];
let whiteCannotTurn_f115 = new Int32Array(0);
let whiteCannotTurn_l116: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteCannotTurnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteCannotTurn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteCannotTurnBinding, WhiteCannotTurnSays> | null): number {
  if (whiteCannotTurn_p82.length < sp.edges.length) whiteCannotTurn_p82 = new Int32Array(sp.edges.length);
  else whiteCannotTurn_p82.fill(0);
  whiteCannotTurn_l83 = [];
  let _y84 = false;
  if (whiteCannotTurn_f88.length < sp.edges.length) whiteCannotTurn_f88 = new Int32Array(sp.edges.length).fill(-1);
  else whiteCannotTurn_f88.fill(-1);
  whiteCannotTurn_l89 = [];
  const _s90: number[] = [];
  if (whiteCannotTurn_f115.length < sp.edges.length) whiteCannotTurn_f115 = new Int32Array(sp.edges.length).fill(-1);
  else whiteCannotTurn_f115.fill(-1);
  whiteCannotTurn_l116 = [];
  const _s117: number[] = [];
  const _g138: number[] = [];
  const facts = whiteCannotTurnFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteCannotTurnCands.length < sp.edges.length) whiteCannotTurnCands = new Int32Array(sp.edges.length);
  const cands = whiteCannotTurnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteCannotTurnFootprint) ?? null) : null;
  const _a68 = cluesValued(cl.pearl, 2);
  R1:
  for (let _i69 = 0; _i69 < _a68.length; _i69++) {
    const v_c = _a68[_i69];
    const _m217_0 = b.made[0];
    const _h70 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _c75: boolean = (_h70 === 2);
    if (_c75) {
      let _q71 = false;
      Q72: {
        const _a73 = sp.cellEdges[v_c];
        for (let _i74 = 0; _i74 < _a73.length; _i74++) {
          const v_x = _a73[_i74];
          if (!((b.grid[v_x] !== 0))) {
            _q71 = true;
            break Q72;
          }
        }
      }
      _c75 = _q71;
    }
    if (!(_c75)) continue;
    const _a76 = sp.cellEdges[v_c];
    R2:
    for (let _i77 = 0; _i77 < _a76.length; _i77++) {
      const v_e = _a76[_i77];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      const _h80 = _i77;
      const _h81 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g85 = -1;
      const _h98 = clueAt(cl.pearl, _h81);
      const _h99 = (_h98 !== 2);
      const _a78 = sp.cellEdges[v_c];
      for (let _i79 = 0; _i79 < _a78.length; _i79++) {
        const v_f = _a78[_i79];
        let _c110: boolean = (((_i79 > _h80) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
        if (_c110) {
          if (_g85 !== _epoch) {
            _g85 = _epoch;
            for (const _e86 of whiteCannotTurn_l83) whiteCannotTurn_p82[_e86] = 0;
            _y84 = false;
            const _a87 = sp.cellEdges[_h81];
            for (const _e91 of whiteCannotTurn_l89) whiteCannotTurn_f88[_e91] = -1;
            whiteCannotTurn_l89 = _a87;
            let _i93 = 0;
            _s90[0] = 0;
            let _o97 = _a87.length === 0;
            for (;;) {
              if (_a87.length === 0) {
                if (!_o97) break;
                _o97 = false;
              }
              while (_a87.length > 0 && _i93 >= 0) {
                const _e91 = _a87[_i93];
                if (_s90[_i93] > 0) whiteCannotTurn_f88[_e91] = -1;
                let _r96 = (cands[_e91] >= 0 ? cands[_e91] : (cands[_e91] = b.cands[_e91])) & ~((2 << _s90[_i93]) - 1);
                let _d92 = 0;
                for (; _r96 !== 0; _r96 &= _r96 - 1) {
                  _d92 = 31 - Math.clz32(_r96 & -_r96);
                  whiteCannotTurn_f88[_e91] = _d92;
                  break;
                }
                if (_r96 === 0) {
                  _s90[_i93] = 0;
                  _i93--;
                  continue;
                }
                _s90[_i93] = _d92;
                if (_i93 === _a87.length - 1) break;
                _i93++;
                _s90[_i93] = 0;
              }
              if (_i93 < 0) break;
              let _c104: boolean = _h99;
              if (_c104) {
                let _g100 = 0;
                G101: {
                  const _a102 = sp.cellEdges[_h81];
                  for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                    const v_x = _a102[_i103];
                    if (!((whiteCannotTurn_f88[v_x] === 1))) continue;
                    _g100++;
                  }
                }
                _c104 = (_g100 === 2);
              }
              let _c109: boolean = _c104;
              if (_c109) {
                let _q105 = true;
                Q106: {
                  const _a107 = sp.cellEdges[_h81];
                  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                    const v_x = _a107[_i108];
                    if (!(((whiteCannotTurn_f88[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q105 = false;
                      break Q106;
                    }
                  }
                }
                _c109 = _q105;
              }
              if (!(_c109)) continue;
              if (!(true)) continue;
              whiteCannotTurn_l83 = _a87;
              _y84 = true;
              for (const _e86 of _a87) whiteCannotTurn_p82[_e86] |= 1 << whiteCannotTurn_f88[_e86];
            }
          }
          _c110 = !(((((whiteCannotTurn_p82[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y84 && !sp.cellEdges[_h81].includes(v_e))));
        }
        let _c137: boolean = _c110;
        if (_c137) {
          const _t111 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h125 = clueAt(cl.pearl, _t111);
          const _h126 = (_h125 !== 2);
          let _q112 = false;
          Q113: {
            const _a114 = sp.cellEdges[_t111];
            for (const _e118 of whiteCannotTurn_l116) whiteCannotTurn_f115[_e118] = -1;
            whiteCannotTurn_l116 = _a114;
            let _i120 = 0;
            _s117[0] = 0;
            let _o124 = _a114.length === 0;
            for (;;) {
              if (_a114.length === 0) {
                if (!_o124) break;
                _o124 = false;
              }
              while (_a114.length > 0 && _i120 >= 0) {
                const _e118 = _a114[_i120];
                if (_s117[_i120] > 0) whiteCannotTurn_f115[_e118] = -1;
                let _r123 = (cands[_e118] >= 0 ? cands[_e118] : (cands[_e118] = b.cands[_e118])) & ~((2 << _s117[_i120]) - 1);
                let _d119 = 0;
                for (; _r123 !== 0; _r123 &= _r123 - 1) {
                  _d119 = 31 - Math.clz32(_r123 & -_r123);
                  whiteCannotTurn_f115[_e118] = _d119;
                  if (_e118 === v_f && _d119 !== 1) continue;
                  break;
                }
                if (_r123 === 0) {
                  _s117[_i120] = 0;
                  _i120--;
                  continue;
                }
                _s117[_i120] = _d119;
                if (_i120 === _a114.length - 1) break;
                _i120++;
                _s117[_i120] = 0;
              }
              if (_i120 < 0) break;
              let _c131: boolean = _h126;
              if (_c131) {
                let _g127 = 0;
                G128: {
                  const _a129 = sp.cellEdges[_t111];
                  for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                    const v_x = _a129[_i130];
                    if (!((whiteCannotTurn_f115[v_x] === 1))) continue;
                    _g127++;
                  }
                }
                _c131 = (_g127 === 2);
              }
              let _c136: boolean = _c131;
              if (_c136) {
                let _q132 = true;
                Q133: {
                  const _a134 = sp.cellEdges[_t111];
                  for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                    const v_x = _a134[_i135];
                    if (!(((whiteCannotTurn_f115[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(bent(sp, v_x, v_f))) {
                      _q132 = false;
                      break Q133;
                    }
                  }
                }
                _c136 = _q132;
              }
              if (!(_c136)) continue;
              if (true) {
                _q112 = true;
                break Q113;
              }
            }
          }
          _c137 = !(_q112);
        }
        if (!(_c137)) continue;
        _g138.length = 0;
        G139: {
          const _a142 = sp.cellEdges[v_c];
          for (let _i143 = 0; _i143 < _a142.length; _i143++) {
            const v_x = _a142[_i143];
            if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
            _g138.push(v_x);
          }
        }
        const v_P = _g138;
        const _h211 = v_P.length;
        if (b.made[0] !== _m217_0) {
          let _c148: boolean = (clueAt(cl.pearl, v_c) === 2);
          if (_c148) {
            let _q144 = false;
            Q145: {
              const _a146 = sp.cellEdges[v_c];
              for (let _i147 = 0; _i147 < _a146.length; _i147++) {
                const v_x = _a146[_i147];
                if (!((b.grid[v_x] !== 0))) {
                  _q144 = true;
                  break Q145;
                }
              }
            }
            _c148 = _q144;
          }
          if (!(_c148)) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          if (!(((b.grid[v_e] || -1) !== 2))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
        }
        if (DEV && staleChecking) {
          let _c153: boolean = (clueAt(cl.pearl, v_c) === 2);
          if (_c153) {
            let _q149 = false;
            Q150: {
              const _a151 = sp.cellEdges[v_c];
              for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                const v_x = _a151[_i152];
                if (!((b.grid[v_x] !== 0))) {
                  _q149 = true;
                  break Q150;
                }
              }
            }
            _c153 = _q149;
          }
          let _c178: boolean = (((_i79 > _i77) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
          if (_c178) {
            const _t154 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
            let _q155 = false;
            Q156: {
              const _f158 = new Int32Array(sp.edges.length).fill(-1);
              let _l159: readonly number[] = [];
              const _s160: number[] = [];
              const _a157 = sp.cellEdges[_t154];
              for (const _e161 of _l159) _f158[_e161] = -1;
              _l159 = _a157;
              let _i163 = 0;
              _s160[0] = 0;
              let _o167 = _a157.length === 0;
              for (;;) {
                if (_a157.length === 0) {
                  if (!_o167) break;
                  _o167 = false;
                }
                while (_a157.length > 0 && _i163 >= 0) {
                  const _e161 = _a157[_i163];
                  if (_s160[_i163] > 0) _f158[_e161] = -1;
                  let _r166 = (cands[_e161] >= 0 ? cands[_e161] : (cands[_e161] = b.cands[_e161])) & ~((2 << _s160[_i163]) - 1);
                  let _d162 = 0;
                  for (; _r166 !== 0; _r166 &= _r166 - 1) {
                    _d162 = 31 - Math.clz32(_r166 & -_r166);
                    _f158[_e161] = _d162;
                    if (_e161 === v_e && _d162 !== 1) continue;
                    break;
                  }
                  if (_r166 === 0) {
                    _s160[_i163] = 0;
                    _i163--;
                    continue;
                  }
                  _s160[_i163] = _d162;
                  if (_i163 === _a157.length - 1) break;
                  _i163++;
                  _s160[_i163] = 0;
                }
                if (_i163 < 0) break;
                let _c172: boolean = (clueAt(cl.pearl, _t154) !== 2);
                if (_c172) {
                  let _g168 = 0;
                  G169: {
                    const _a170 = sp.cellEdges[_t154];
                    for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                      const v_x = _a170[_i171];
                      if (!((_f158[v_x] === 1))) continue;
                      _g168++;
                    }
                  }
                  _c172 = (_g168 === 2);
                }
                let _c177: boolean = _c172;
                if (_c177) {
                  let _q173 = true;
                  Q174: {
                    const _a175 = sp.cellEdges[_t154];
                    for (let _i176 = 0; _i176 < _a175.length; _i176++) {
                      const v_x = _a175[_i176];
                      if (!(((_f158[v_x] === 1) && (v_x !== v_e)))) continue;
                      if (!(bent(sp, v_x, v_e))) {
                        _q173 = false;
                        break Q174;
                      }
                    }
                  }
                  _c177 = _q173;
                }
                if (!(_c177)) continue;
                if (true) {
                  _q155 = true;
                  break Q156;
                }
              }
            }
            _c178 = !(_q155);
          }
          let _c203: boolean = _c178;
          if (_c203) {
            const _t179 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
            let _q180 = false;
            Q181: {
              const _f183 = new Int32Array(sp.edges.length).fill(-1);
              let _l184: readonly number[] = [];
              const _s185: number[] = [];
              const _a182 = sp.cellEdges[_t179];
              for (const _e186 of _l184) _f183[_e186] = -1;
              _l184 = _a182;
              let _i188 = 0;
              _s185[0] = 0;
              let _o192 = _a182.length === 0;
              for (;;) {
                if (_a182.length === 0) {
                  if (!_o192) break;
                  _o192 = false;
                }
                while (_a182.length > 0 && _i188 >= 0) {
                  const _e186 = _a182[_i188];
                  if (_s185[_i188] > 0) _f183[_e186] = -1;
                  let _r191 = (cands[_e186] >= 0 ? cands[_e186] : (cands[_e186] = b.cands[_e186])) & ~((2 << _s185[_i188]) - 1);
                  let _d187 = 0;
                  for (; _r191 !== 0; _r191 &= _r191 - 1) {
                    _d187 = 31 - Math.clz32(_r191 & -_r191);
                    _f183[_e186] = _d187;
                    if (_e186 === v_f && _d187 !== 1) continue;
                    break;
                  }
                  if (_r191 === 0) {
                    _s185[_i188] = 0;
                    _i188--;
                    continue;
                  }
                  _s185[_i188] = _d187;
                  if (_i188 === _a182.length - 1) break;
                  _i188++;
                  _s185[_i188] = 0;
                }
                if (_i188 < 0) break;
                let _c197: boolean = (clueAt(cl.pearl, _t179) !== 2);
                if (_c197) {
                  let _g193 = 0;
                  G194: {
                    const _a195 = sp.cellEdges[_t179];
                    for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                      const v_x = _a195[_i196];
                      if (!((_f183[v_x] === 1))) continue;
                      _g193++;
                    }
                  }
                  _c197 = (_g193 === 2);
                }
                let _c202: boolean = _c197;
                if (_c202) {
                  let _q198 = true;
                  Q199: {
                    const _a200 = sp.cellEdges[_t179];
                    for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                      const v_x = _a200[_i201];
                      if (!(((_f183[v_x] === 1) && (v_x !== v_f)))) continue;
                      if (!(bent(sp, v_x, v_f))) {
                        _q198 = false;
                        break Q199;
                      }
                    }
                  }
                  _c202 = _q198;
                }
                if (!(_c202)) continue;
                if (true) {
                  _q180 = true;
                  break Q181;
                }
              }
            }
            _c203 = !(_q180);
          }
          const _g204: number[] = [];
          G205: {
            const _a208 = sp.cellEdges[v_c];
            for (let _i209 = 0; _i209 < _a208.length; _i209++) {
              const v_x = _a208[_i209];
              if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
              _g204.push(v_x);
            }
          }
          freshBinding("whiteCannotTurn", [(sp.cells.includes(v_c)), _c153, (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) !== 2), (sp.cellEdges[v_c].includes(v_f)), _c203, sameSet(v_P, _g204)], ["c in", "where of c", "e in", "where of e", "f in", "where of f", "P ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        let _c210: boolean = true;
        if (_c210) {
          if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
          _c210 = true;
        }
        let _c216: boolean = (_c210 && (_h211 === 2));
        if (_c216) {
          let _q212 = true;
          Q213: {
            const _a214 = v_P;
            for (let _i215 = 0; _i215 < _a214.length; _i215++) {
              const v_x = _a214[_i215];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q212 = false;
                break Q213;
              }
            }
          }
          _c216 = _q212;
        }
        if (!(_c216)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c, e: v_e }, marks: {  } };
            if (!fire({ c: v_c, e: v_e, f: v_f, P: v_P.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface WhiteTurnsOppositeBinding {
  c: number;
  e: number;
  f: number;
  k: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface WhiteTurnsOppositeSays {
  terms: { c: number; e: number; };
  marks: {  };
}

const whiteTurnsOppositeFacts: number[] = [];
let whiteTurnsOppositeCands = new Int32Array(0);
let whiteTurnsOpposite_p180 = new Int32Array(0);
let whiteTurnsOpposite_l181: readonly number[] = [];
let whiteTurnsOpposite_f186 = new Int32Array(0);
let whiteTurnsOpposite_l187: readonly number[] = [];
let whiteTurnsOpposite_f213 = new Int32Array(0);
let whiteTurnsOpposite_l214: readonly number[] = [];
let whiteTurnsOpposite_f275 = new Int32Array(0);
let whiteTurnsOpposite_l276: readonly number[] = [];
let whiteTurnsOpposite_f328 = new Int32Array(0);
let whiteTurnsOpposite_l329: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteTurnsOppositeFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteTurnsOpposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteTurnsOppositeBinding, WhiteTurnsOppositeSays> | null): number {
  if (whiteTurnsOpposite_p180.length < sp.edges.length) whiteTurnsOpposite_p180 = new Int32Array(sp.edges.length);
  else whiteTurnsOpposite_p180.fill(0);
  whiteTurnsOpposite_l181 = [];
  let _y182 = false;
  if (whiteTurnsOpposite_f186.length < sp.edges.length) whiteTurnsOpposite_f186 = new Int32Array(sp.edges.length).fill(-1);
  else whiteTurnsOpposite_f186.fill(-1);
  whiteTurnsOpposite_l187 = [];
  const _s188: number[] = [];
  if (whiteTurnsOpposite_f213.length < sp.edges.length) whiteTurnsOpposite_f213 = new Int32Array(sp.edges.length).fill(-1);
  else whiteTurnsOpposite_f213.fill(-1);
  whiteTurnsOpposite_l214 = [];
  const _s215: number[] = [];
  const _g235: number[] = [];
  const _g243: number[] = [];
  if (whiteTurnsOpposite_f275.length < sp.edges.length) whiteTurnsOpposite_f275 = new Int32Array(sp.edges.length).fill(-1);
  else whiteTurnsOpposite_f275.fill(-1);
  whiteTurnsOpposite_l276 = [];
  const _s277: number[] = [];
  const _g296: number[] = [];
  if (whiteTurnsOpposite_f328.length < sp.edges.length) whiteTurnsOpposite_f328 = new Int32Array(sp.edges.length).fill(-1);
  else whiteTurnsOpposite_f328.fill(-1);
  whiteTurnsOpposite_l329 = [];
  const _s330: number[] = [];
  const facts = whiteTurnsOppositeFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteTurnsOppositeCands.length < sp.edges.length) whiteTurnsOppositeCands = new Int32Array(sp.edges.length);
  const cands = whiteTurnsOppositeCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteTurnsOppositeFootprint) ?? null) : null;
  const _a172 = cluesValued(cl.pearl, 2);
  for (let _i173 = 0; _i173 < _a172.length; _i173++) {
    const v_c = _a172[_i173];
    const _h174 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h174 === 2))) continue;
    const _a175 = sp.cellEdges[v_c];
    R2:
    for (let _i176 = 0; _i176 < _a175.length; _i176++) {
      const v_e = _a175[_i176];
      const _m523_0 = b.made[0];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      const _h179 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g183 = -1;
      const _h196 = clueAt(cl.pearl, _h179);
      const _h197 = (_h196 !== 2);
      const _a177 = sp.cellEdges[v_c];
      for (let _i178 = 0; _i178 < _a177.length; _i178++) {
        const v_f = _a177[_i178];
        let _c208: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
        if (_c208) {
          if (_g183 !== _epoch) {
            _g183 = _epoch;
            for (const _e184 of whiteTurnsOpposite_l181) whiteTurnsOpposite_p180[_e184] = 0;
            _y182 = false;
            const _a185 = sp.cellEdges[_h179];
            for (const _e189 of whiteTurnsOpposite_l187) whiteTurnsOpposite_f186[_e189] = -1;
            whiteTurnsOpposite_l187 = _a185;
            let _i191 = 0;
            _s188[0] = 0;
            let _o195 = _a185.length === 0;
            for (;;) {
              if (_a185.length === 0) {
                if (!_o195) break;
                _o195 = false;
              }
              while (_a185.length > 0 && _i191 >= 0) {
                const _e189 = _a185[_i191];
                if (_s188[_i191] > 0) whiteTurnsOpposite_f186[_e189] = -1;
                let _r194 = (cands[_e189] >= 0 ? cands[_e189] : (cands[_e189] = b.cands[_e189])) & ~((2 << _s188[_i191]) - 1);
                let _d190 = 0;
                for (; _r194 !== 0; _r194 &= _r194 - 1) {
                  _d190 = 31 - Math.clz32(_r194 & -_r194);
                  whiteTurnsOpposite_f186[_e189] = _d190;
                  break;
                }
                if (_r194 === 0) {
                  _s188[_i191] = 0;
                  _i191--;
                  continue;
                }
                _s188[_i191] = _d190;
                if (_i191 === _a185.length - 1) break;
                _i191++;
                _s188[_i191] = 0;
              }
              if (_i191 < 0) break;
              let _c202: boolean = _h197;
              if (_c202) {
                let _g198 = 0;
                G199: {
                  const _a200 = sp.cellEdges[_h179];
                  for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                    const v_x = _a200[_i201];
                    if (!((whiteTurnsOpposite_f186[v_x] === 1))) continue;
                    _g198++;
                  }
                }
                _c202 = (_g198 === 2);
              }
              let _c207: boolean = _c202;
              if (_c207) {
                let _q203 = true;
                Q204: {
                  const _a205 = sp.cellEdges[_h179];
                  for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                    const v_x = _a205[_i206];
                    if (!(((whiteTurnsOpposite_f186[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q203 = false;
                      break Q204;
                    }
                  }
                }
                _c207 = _q203;
              }
              if (!(_c207)) continue;
              if (!(true)) continue;
              whiteTurnsOpposite_l181 = _a185;
              _y182 = true;
              for (const _e184 of _a185) whiteTurnsOpposite_p180[_e184] |= 1 << whiteTurnsOpposite_f186[_e184];
            }
          }
          _c208 = !(((((whiteTurnsOpposite_p180[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y182 && !sp.cellEdges[_h179].includes(v_e))));
        }
        if (!(_c208)) continue;
        L209: {
          const v_k = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h223 = clueAt(cl.pearl, v_k);
          const _h224 = (_h223 !== 1);
          let _q210 = false;
          Q211: {
            const _a212 = sp.cellEdges[v_k];
            for (const _e216 of whiteTurnsOpposite_l214) whiteTurnsOpposite_f213[_e216] = -1;
            whiteTurnsOpposite_l214 = _a212;
            let _i218 = 0;
            _s215[0] = 0;
            let _o222 = _a212.length === 0;
            for (;;) {
              if (_a212.length === 0) {
                if (!_o222) break;
                _o222 = false;
              }
              while (_a212.length > 0 && _i218 >= 0) {
                const _e216 = _a212[_i218];
                if (_s215[_i218] > 0) whiteTurnsOpposite_f213[_e216] = -1;
                let _r221 = (cands[_e216] >= 0 ? cands[_e216] : (cands[_e216] = b.cands[_e216])) & ~((2 << _s215[_i218]) - 1);
                let _d217 = 0;
                for (; _r221 !== 0; _r221 &= _r221 - 1) {
                  _d217 = 31 - Math.clz32(_r221 & -_r221);
                  whiteTurnsOpposite_f213[_e216] = _d217;
                  if (_e216 === v_f && _d217 !== 1) continue;
                  break;
                }
                if (_r221 === 0) {
                  _s215[_i218] = 0;
                  _i218--;
                  continue;
                }
                _s215[_i218] = _d217;
                if (_i218 === _a212.length - 1) break;
                _i218++;
                _s215[_i218] = 0;
              }
              if (_i218 < 0) break;
              let _c229: boolean = _h224;
              if (_c229) {
                let _g225 = 0;
                G226: {
                  const _a227 = sp.cellEdges[v_k];
                  for (let _i228 = 0; _i228 < _a227.length; _i228++) {
                    const v_x = _a227[_i228];
                    if (!((whiteTurnsOpposite_f213[v_x] === 1))) continue;
                    _g225++;
                  }
                }
                _c229 = (_g225 === 2);
              }
              let _c234: boolean = _c229;
              if (_c234) {
                let _q230 = true;
                Q231: {
                  const _a232 = sp.cellEdges[v_k];
                  for (let _i233 = 0; _i233 < _a232.length; _i233++) {
                    const v_x = _a232[_i233];
                    if (!(((whiteTurnsOpposite_f213[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(!(bent(sp, v_x, v_f)))) {
                      _q230 = false;
                      break Q231;
                    }
                  }
                }
                _c234 = _q230;
              }
              if (!(_c234)) continue;
              if (true) {
                _q210 = true;
                break Q211;
              }
            }
          }
          if (!(_q210)) break L209;
          const _h285 = (_h223 !== 2);
          _g235.length = 0;
          G236: {
            const _a239 = sp.cellEdges[v_k];
            for (let _i240 = 0; _i240 < _a239.length; _i240++) {
              const v_x = _a239[_i240];
              if (!(!((b.grid[v_x] !== 0)))) continue;
              _g235.push(v_x);
            }
          }
          L241: {
            const v_F = _g235;
            const _h242 = v_F.length;
            if (!((_h242 > 0))) break L241;
            _g243.length = 0;
            G244: {
              const _a270 = v_F;
              for (let _i271 = 0; _i271 < _a270.length; _i271++) {
                const v_x = _a270[_i271];
                let _q272 = false;
                Q273: {
                  const _a274 = sp.cellEdges[v_k];
                  for (const _e278 of whiteTurnsOpposite_l276) whiteTurnsOpposite_f275[_e278] = -1;
                  whiteTurnsOpposite_l276 = _a274;
                  let _i280 = 0;
                  _s277[0] = 0;
                  let _o284 = _a274.length === 0;
                  for (;;) {
                    if (_a274.length === 0) {
                      if (!_o284) break;
                      _o284 = false;
                    }
                    while (_a274.length > 0 && _i280 >= 0) {
                      const _e278 = _a274[_i280];
                      if (_s277[_i280] > 0) whiteTurnsOpposite_f275[_e278] = -1;
                      let _r283 = (cands[_e278] >= 0 ? cands[_e278] : (cands[_e278] = b.cands[_e278])) & ~((2 << _s277[_i280]) - 1);
                      let _d279 = 0;
                      for (; _r283 !== 0; _r283 &= _r283 - 1) {
                        _d279 = 31 - Math.clz32(_r283 & -_r283);
                        whiteTurnsOpposite_f275[_e278] = _d279;
                        if (_e278 === v_f && _d279 !== 1) continue;
                        if (_e278 === v_x && _d279 !== 1) continue;
                        break;
                      }
                      if (_r283 === 0) {
                        _s277[_i280] = 0;
                        _i280--;
                        continue;
                      }
                      _s277[_i280] = _d279;
                      if (_i280 === _a274.length - 1) break;
                      _i280++;
                      _s277[_i280] = 0;
                    }
                    if (_i280 < 0) break;
                    let _c290: boolean = _h285;
                    if (_c290) {
                      let _g286 = 0;
                      G287: {
                        const _a288 = sp.cellEdges[v_k];
                        for (let _i289 = 0; _i289 < _a288.length; _i289++) {
                          const v_y = _a288[_i289];
                          if (!((whiteTurnsOpposite_f275[v_y] === 1))) continue;
                          _g286++;
                        }
                      }
                      _c290 = (_g286 === 2);
                    }
                    let _c295: boolean = _c290;
                    if (_c295) {
                      let _q291 = true;
                      Q292: {
                        const _a293 = sp.cellEdges[v_k];
                        for (let _i294 = 0; _i294 < _a293.length; _i294++) {
                          const v_y = _a293[_i294];
                          if (!(((whiteTurnsOpposite_f275[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q291 = false;
                            break Q292;
                          }
                        }
                      }
                      _c295 = _q291;
                    }
                    if (!(_c295)) continue;
                    if (true) {
                      _q272 = true;
                      break Q273;
                    }
                  }
                }
                if (!(_q272)) continue;
                _g243.push(v_x);
              }
            }
            const v_W = _g243;
            _g296.length = 0;
            G297: {
              const _a323 = v_F;
              for (let _i324 = 0; _i324 < _a323.length; _i324++) {
                const v_x = _a323[_i324];
                let _q325 = false;
                Q326: {
                  const _a327 = sp.cellEdges[v_k];
                  for (const _e331 of whiteTurnsOpposite_l329) whiteTurnsOpposite_f328[_e331] = -1;
                  whiteTurnsOpposite_l329 = _a327;
                  let _i333 = 0;
                  _s330[0] = 0;
                  let _o337 = _a327.length === 0;
                  for (;;) {
                    if (_a327.length === 0) {
                      if (!_o337) break;
                      _o337 = false;
                    }
                    while (_a327.length > 0 && _i333 >= 0) {
                      const _e331 = _a327[_i333];
                      if (_s330[_i333] > 0) whiteTurnsOpposite_f328[_e331] = -1;
                      let _r336 = (cands[_e331] >= 0 ? cands[_e331] : (cands[_e331] = b.cands[_e331])) & ~((2 << _s330[_i333]) - 1);
                      let _d332 = 0;
                      for (; _r336 !== 0; _r336 &= _r336 - 1) {
                        _d332 = 31 - Math.clz32(_r336 & -_r336);
                        whiteTurnsOpposite_f328[_e331] = _d332;
                        if (_e331 === v_f && _d332 !== 1) continue;
                        if (_e331 === v_x && _d332 !== 2) continue;
                        break;
                      }
                      if (_r336 === 0) {
                        _s330[_i333] = 0;
                        _i333--;
                        continue;
                      }
                      _s330[_i333] = _d332;
                      if (_i333 === _a327.length - 1) break;
                      _i333++;
                      _s330[_i333] = 0;
                    }
                    if (_i333 < 0) break;
                    let _c342: boolean = _h285;
                    if (_c342) {
                      let _g338 = 0;
                      G339: {
                        const _a340 = sp.cellEdges[v_k];
                        for (let _i341 = 0; _i341 < _a340.length; _i341++) {
                          const v_y = _a340[_i341];
                          if (!((whiteTurnsOpposite_f328[v_y] === 1))) continue;
                          _g338++;
                        }
                      }
                      _c342 = (_g338 === 2);
                    }
                    let _c347: boolean = _c342;
                    if (_c347) {
                      let _q343 = true;
                      Q344: {
                        const _a345 = sp.cellEdges[v_k];
                        for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                          const v_y = _a345[_i346];
                          if (!(((whiteTurnsOpposite_f328[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q343 = false;
                            break Q344;
                          }
                        }
                      }
                      _c347 = _q343;
                    }
                    if (!(_c347)) continue;
                    if (true) {
                      _q325 = true;
                      break Q326;
                    }
                  }
                }
                if (!(_q325)) continue;
                _g296.push(v_x);
              }
            }
            L348: {
              const v_N = _g296;
              let _q349 = false;
              Q350: {
                const _a351 = v_F;
                for (let _i352 = 0; _i352 < _a351.length; _i352++) {
                  const v_x = _a351[_i352];
                  if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                    _q349 = true;
                    break Q350;
                  }
                }
              }
              if (!(_q349)) break L348;
              if (b.made[0] !== _m523_0) {
                if (!(((b.grid[v_e] || -1) === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
              }
              if (DEV && staleChecking) {
                let _c377: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
                if (_c377) {
                  const _t353 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
                  let _q354 = false;
                  Q355: {
                    const _f357 = new Int32Array(sp.edges.length).fill(-1);
                    let _l358: readonly number[] = [];
                    const _s359: number[] = [];
                    const _a356 = sp.cellEdges[_t353];
                    for (const _e360 of _l358) _f357[_e360] = -1;
                    _l358 = _a356;
                    let _i362 = 0;
                    _s359[0] = 0;
                    let _o366 = _a356.length === 0;
                    for (;;) {
                      if (_a356.length === 0) {
                        if (!_o366) break;
                        _o366 = false;
                      }
                      while (_a356.length > 0 && _i362 >= 0) {
                        const _e360 = _a356[_i362];
                        if (_s359[_i362] > 0) _f357[_e360] = -1;
                        let _r365 = (cands[_e360] >= 0 ? cands[_e360] : (cands[_e360] = b.cands[_e360])) & ~((2 << _s359[_i362]) - 1);
                        let _d361 = 0;
                        for (; _r365 !== 0; _r365 &= _r365 - 1) {
                          _d361 = 31 - Math.clz32(_r365 & -_r365);
                          _f357[_e360] = _d361;
                          if (_e360 === v_e && _d361 !== 1) continue;
                          break;
                        }
                        if (_r365 === 0) {
                          _s359[_i362] = 0;
                          _i362--;
                          continue;
                        }
                        _s359[_i362] = _d361;
                        if (_i362 === _a356.length - 1) break;
                        _i362++;
                        _s359[_i362] = 0;
                      }
                      if (_i362 < 0) break;
                      let _c371: boolean = (clueAt(cl.pearl, _t353) !== 2);
                      if (_c371) {
                        let _g367 = 0;
                        G368: {
                          const _a369 = sp.cellEdges[_t353];
                          for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                            const v_x = _a369[_i370];
                            if (!((_f357[v_x] === 1))) continue;
                            _g367++;
                          }
                        }
                        _c371 = (_g367 === 2);
                      }
                      let _c376: boolean = _c371;
                      if (_c376) {
                        let _q372 = true;
                        Q373: {
                          const _a374 = sp.cellEdges[_t353];
                          for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                            const v_x = _a374[_i375];
                            if (!(((_f357[v_x] === 1) && (v_x !== v_e)))) continue;
                            if (!(bent(sp, v_x, v_e))) {
                              _q372 = false;
                              break Q373;
                            }
                          }
                        }
                        _c376 = _q372;
                      }
                      if (!(_c376)) continue;
                      if (true) {
                        _q354 = true;
                        break Q355;
                      }
                    }
                  }
                  _c377 = !(_q354);
                }
                let _q378 = false;
                Q379: {
                  const _f381 = new Int32Array(sp.edges.length).fill(-1);
                  let _l382: readonly number[] = [];
                  const _s383: number[] = [];
                  const _a380 = sp.cellEdges[v_k];
                  for (const _e384 of _l382) _f381[_e384] = -1;
                  _l382 = _a380;
                  let _i386 = 0;
                  _s383[0] = 0;
                  let _o390 = _a380.length === 0;
                  for (;;) {
                    if (_a380.length === 0) {
                      if (!_o390) break;
                      _o390 = false;
                    }
                    while (_a380.length > 0 && _i386 >= 0) {
                      const _e384 = _a380[_i386];
                      if (_s383[_i386] > 0) _f381[_e384] = -1;
                      let _r389 = (cands[_e384] >= 0 ? cands[_e384] : (cands[_e384] = b.cands[_e384])) & ~((2 << _s383[_i386]) - 1);
                      let _d385 = 0;
                      for (; _r389 !== 0; _r389 &= _r389 - 1) {
                        _d385 = 31 - Math.clz32(_r389 & -_r389);
                        _f381[_e384] = _d385;
                        if (_e384 === v_f && _d385 !== 1) continue;
                        break;
                      }
                      if (_r389 === 0) {
                        _s383[_i386] = 0;
                        _i386--;
                        continue;
                      }
                      _s383[_i386] = _d385;
                      if (_i386 === _a380.length - 1) break;
                      _i386++;
                      _s383[_i386] = 0;
                    }
                    if (_i386 < 0) break;
                    let _c395: boolean = (clueAt(cl.pearl, v_k) !== 1);
                    if (_c395) {
                      let _g391 = 0;
                      G392: {
                        const _a393 = sp.cellEdges[v_k];
                        for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                          const v_x = _a393[_i394];
                          if (!((_f381[v_x] === 1))) continue;
                          _g391++;
                        }
                      }
                      _c395 = (_g391 === 2);
                    }
                    let _c400: boolean = _c395;
                    if (_c400) {
                      let _q396 = true;
                      Q397: {
                        const _a398 = sp.cellEdges[v_k];
                        for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                          const v_x = _a398[_i399];
                          if (!(((_f381[v_x] === 1) && (v_x !== v_f)))) continue;
                          if (!(!(bent(sp, v_x, v_f)))) {
                            _q396 = false;
                            break Q397;
                          }
                        }
                      }
                      _c400 = _q396;
                    }
                    if (!(_c400)) continue;
                    if (true) {
                      _q378 = true;
                      break Q379;
                    }
                  }
                }
                const _g401: number[] = [];
                G402: {
                  const _a405 = sp.cellEdges[v_k];
                  for (let _i406 = 0; _i406 < _a405.length; _i406++) {
                    const v_x = _a405[_i406];
                    if (!(!((b.grid[v_x] !== 0)))) continue;
                    _g401.push(v_x);
                  }
                }
                const _g407: number[] = [];
                G408: {
                  const _a434 = v_F;
                  for (let _i435 = 0; _i435 < _a434.length; _i435++) {
                    const v_x = _a434[_i435];
                    let _q436 = false;
                    Q437: {
                      const _f439 = new Int32Array(sp.edges.length).fill(-1);
                      let _l440: readonly number[] = [];
                      const _s441: number[] = [];
                      const _a438 = sp.cellEdges[v_k];
                      for (const _e442 of _l440) _f439[_e442] = -1;
                      _l440 = _a438;
                      let _i444 = 0;
                      _s441[0] = 0;
                      let _o448 = _a438.length === 0;
                      for (;;) {
                        if (_a438.length === 0) {
                          if (!_o448) break;
                          _o448 = false;
                        }
                        while (_a438.length > 0 && _i444 >= 0) {
                          const _e442 = _a438[_i444];
                          if (_s441[_i444] > 0) _f439[_e442] = -1;
                          let _r447 = (cands[_e442] >= 0 ? cands[_e442] : (cands[_e442] = b.cands[_e442])) & ~((2 << _s441[_i444]) - 1);
                          let _d443 = 0;
                          for (; _r447 !== 0; _r447 &= _r447 - 1) {
                            _d443 = 31 - Math.clz32(_r447 & -_r447);
                            _f439[_e442] = _d443;
                            if (_e442 === v_f && _d443 !== 1) continue;
                            if (_e442 === v_x && _d443 !== 1) continue;
                            break;
                          }
                          if (_r447 === 0) {
                            _s441[_i444] = 0;
                            _i444--;
                            continue;
                          }
                          _s441[_i444] = _d443;
                          if (_i444 === _a438.length - 1) break;
                          _i444++;
                          _s441[_i444] = 0;
                        }
                        if (_i444 < 0) break;
                        let _c453: boolean = (clueAt(cl.pearl, v_k) !== 2);
                        if (_c453) {
                          let _g449 = 0;
                          G450: {
                            const _a451 = sp.cellEdges[v_k];
                            for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                              const v_y = _a451[_i452];
                              if (!((_f439[v_y] === 1))) continue;
                              _g449++;
                            }
                          }
                          _c453 = (_g449 === 2);
                        }
                        let _c458: boolean = _c453;
                        if (_c458) {
                          let _q454 = true;
                          Q455: {
                            const _a456 = sp.cellEdges[v_k];
                            for (let _i457 = 0; _i457 < _a456.length; _i457++) {
                              const v_y = _a456[_i457];
                              if (!(((_f439[v_y] === 1) && (v_y !== v_f)))) continue;
                              if (!(bent(sp, v_y, v_f))) {
                                _q454 = false;
                                break Q455;
                              }
                            }
                          }
                          _c458 = _q454;
                        }
                        if (!(_c458)) continue;
                        if (true) {
                          _q436 = true;
                          break Q437;
                        }
                      }
                    }
                    if (!(_q436)) continue;
                    _g407.push(v_x);
                  }
                }
                const _g459: number[] = [];
                G460: {
                  const _a486 = v_F;
                  for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                    const v_x = _a486[_i487];
                    let _q488 = false;
                    Q489: {
                      const _f491 = new Int32Array(sp.edges.length).fill(-1);
                      let _l492: readonly number[] = [];
                      const _s493: number[] = [];
                      const _a490 = sp.cellEdges[v_k];
                      for (const _e494 of _l492) _f491[_e494] = -1;
                      _l492 = _a490;
                      let _i496 = 0;
                      _s493[0] = 0;
                      let _o500 = _a490.length === 0;
                      for (;;) {
                        if (_a490.length === 0) {
                          if (!_o500) break;
                          _o500 = false;
                        }
                        while (_a490.length > 0 && _i496 >= 0) {
                          const _e494 = _a490[_i496];
                          if (_s493[_i496] > 0) _f491[_e494] = -1;
                          let _r499 = (cands[_e494] >= 0 ? cands[_e494] : (cands[_e494] = b.cands[_e494])) & ~((2 << _s493[_i496]) - 1);
                          let _d495 = 0;
                          for (; _r499 !== 0; _r499 &= _r499 - 1) {
                            _d495 = 31 - Math.clz32(_r499 & -_r499);
                            _f491[_e494] = _d495;
                            if (_e494 === v_f && _d495 !== 1) continue;
                            if (_e494 === v_x && _d495 !== 2) continue;
                            break;
                          }
                          if (_r499 === 0) {
                            _s493[_i496] = 0;
                            _i496--;
                            continue;
                          }
                          _s493[_i496] = _d495;
                          if (_i496 === _a490.length - 1) break;
                          _i496++;
                          _s493[_i496] = 0;
                        }
                        if (_i496 < 0) break;
                        let _c505: boolean = (clueAt(cl.pearl, v_k) !== 2);
                        if (_c505) {
                          let _g501 = 0;
                          G502: {
                            const _a503 = sp.cellEdges[v_k];
                            for (let _i504 = 0; _i504 < _a503.length; _i504++) {
                              const v_y = _a503[_i504];
                              if (!((_f491[v_y] === 1))) continue;
                              _g501++;
                            }
                          }
                          _c505 = (_g501 === 2);
                        }
                        let _c510: boolean = _c505;
                        if (_c510) {
                          let _q506 = true;
                          Q507: {
                            const _a508 = sp.cellEdges[v_k];
                            for (let _i509 = 0; _i509 < _a508.length; _i509++) {
                              const v_y = _a508[_i509];
                              if (!(((_f491[v_y] === 1) && (v_y !== v_f)))) continue;
                              if (!(bent(sp, v_y, v_f))) {
                                _q506 = false;
                                break Q507;
                              }
                            }
                          }
                          _c510 = _q506;
                        }
                        if (!(_c510)) continue;
                        if (true) {
                          _q488 = true;
                          break Q489;
                        }
                      }
                    }
                    if (!(_q488)) continue;
                    _g459.push(v_x);
                  }
                }
                let _q511 = false;
                Q512: {
                  const _a513 = v_F;
                  for (let _i514 = 0; _i514 < _a513.length; _i514++) {
                    const v_x = _a513[_i514];
                    if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                      _q511 = true;
                      break Q512;
                    }
                  }
                }
                freshBinding("whiteTurnsOpposite", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 2), (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) === 1), (sp.cellEdges[v_c].includes(v_f)), _c377, (v_k === (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f])), _q378, sameSet(v_F, _g401), (v_F.length > 0), sameSet(v_W, _g407), sameSet(v_N, _g459), _q511], ["c in", "where of c", "e in", "where of e", "f in", "where of f", "k =", "where of k", "F =", "where of F", "W =", "N =", "where of N"]);
              }
              facts.length = 0;
              changed = false;
              let _q515 = true;
              Q516: {
                const _a517 = v_F;
                for (let _i518 = 0; _i518 < _a517.length; _i518++) {
                  const v_x = _a517[_i518];
                  let _c520: boolean = ((v_W.includes(v_x)) || (v_N.includes(v_x)));
                  if (_c520) {
                    let _c519: boolean = !(!(v_W.includes(v_x)));
                    if (!_c519) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                      _c519 = true;
                    }
                    _c520 = _c519;
                  }
                  let _c522: boolean = _c520;
                  if (_c522) {
                    let _c521: boolean = !(!(v_N.includes(v_x)));
                    if (!_c521) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                      _c521 = true;
                    }
                    _c522 = _c521;
                  }
                  if (!(_c522)) {
                    _q515 = false;
                    break Q516;
                  }
                }
              }
              if (!(_q515)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null) {
                  const _says = { terms: { c: v_c, e: v_e }, marks: {  } };
                  if (!fire({ c: v_c, e: v_e, f: v_f, k: v_k, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts, _says)) return 1;
                }
                cands.fill(-1);
                _epoch++;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface ClosedBinding {
  L: readonly number[];
  g: number;
  G: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ClosedSays {
  terms: {  };
  marks: {  };
}

const closedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClosedBinding, ClosedSays> | null): number {
  const _g22: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g22.length = 0;
  G23: {
    const _a26 = sp.edges;
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_e = _a26[_i27];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g22.push(v_e);
    }
  }
  const v_L = _g22;
  const _eg43 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L28: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    let _c33: boolean = (v_g !== -1);
    if (_c33) {
      let _q29 = false;
      Q30: {
        const _a31 = sp.edges;
        for (let _i32 = 0; _i32 < _a31.length; _i32++) {
          const v_e = _a31[_i32];
          if (!((b.grid[v_e] !== 0))) {
            _q29 = true;
            break Q30;
          }
        }
      }
      _c33 = _q29;
    }
    let _c42: boolean = _c33;
    if (_c42) {
      let _q34 = true;
      Q35: {
        const _a36 = sp.cells;
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_c = _a36[_i37];
          let _g38 = 0;
          G39: {
            const _a40 = sp.cellEdges[v_c];
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_e = _a40[_i41];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g38++;
            }
          }
          if (!((_g38 !== 1))) {
            _q34 = false;
            break Q35;
          }
        }
      }
      _c42 = _q34;
    }
    if (!(_c42)) break L28;
    const v_G = _eg43.of(sp.edgeEnds[2 * v_g]);
    if (DEV && staleChecking) {
      const _g44: number[] = [];
      G45: {
        const _a48 = sp.edges;
        for (let _i49 = 0; _i49 < _a48.length; _i49++) {
          const v_e = _a48[_i49];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g44.push(v_e);
        }
      }
      let _c54: boolean = (v_g !== -1);
      if (_c54) {
        let _q50 = false;
        Q51: {
          const _a52 = sp.edges;
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const v_e = _a52[_i53];
            if (!((b.grid[v_e] !== 0))) {
              _q50 = true;
              break Q51;
            }
          }
        }
        _c54 = _q50;
      }
      let _c63: boolean = _c54;
      if (_c63) {
        let _q55 = true;
        Q56: {
          const _a57 = sp.cells;
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_c = _a57[_i58];
            let _g59 = 0;
            G60: {
              const _a61 = sp.cellEdges[v_c];
              for (let _i62 = 0; _i62 < _a61.length; _i62++) {
                const v_e = _a61[_i62];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g59++;
              }
            }
            if (!((_g59 !== 1))) {
              _q55 = false;
              break Q56;
            }
          }
        }
        _c63 = _q55;
      }
      freshBinding("closed", [sameSet(v_L, _g44), (v_g === (v_L.length > 0 ? v_L[0] : -1)), _c63, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_g], v_L))], ["L =", "g =", "where of g", "G ="]);
    }
    facts.length = 0;
    changed = false;
    let _q64 = true;
    Q65: {
      const _a66 = v_L;
      for (let _i67 = 0; _i67 < _a66.length; _i67++) {
        const v_x = _a66[_i67];
        if (!((_eg43.of(sp.edgeEnds[2 * v_x]) === v_G))) {
          _q64 = false;
          break Q65;
        }
      }
    }
    let _c73: boolean = _q64;
    if (_c73) {
      let _q68 = true;
      Q69: {
        const _a70 = sp.cells;
        for (let _i71 = 0; _i71 < _a70.length; _i71++) {
          const v_c = _a70[_i71];
          const _h72 = clueAt(cl.pearl, v_c);
          if (!((_h72 !== -1))) continue;
          if (!((_eg43.of(v_c) === v_G))) {
            _q68 = false;
            break Q69;
          }
        }
      }
      _c73 = _q68;
    }
    let _c78: boolean = _c73;
    if (_c78) {
      let _q74 = true;
      Q75: {
        const _a76 = sp.edges;
        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
          const v_e = _a76[_i77];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
          if (!(true)) {
            _q74 = false;
            break Q75;
          }
        }
      }
      _c78 = _q74;
    }
    if (!(_c78)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: {  }, marks: {  } };
        if (!fire({ L: v_L.slice(), g: v_g, G: v_G.slice() }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface EarlyLoopBinding {
  L: readonly number[];
  e: number;
  G: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface EarlyLoopSays {
  terms: { e: number; };
  marks: {  };
}

const earlyLoopFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function earlyLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyLoopBinding, EarlyLoopSays> | null): number {
  const _g21: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m62_0 = b.made[0];
  _g21.length = 0;
  G22: {
    const _a25 = sp.edges;
    for (let _i26 = 0; _i26 < _a25.length; _i26++) {
      const v_e = _a25[_i26];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g21.push(v_e);
    }
  }
  const v_L = _g21;
  const _m63_1 = b.made[1];
  const _eg29 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a27 = sp.edges;
  R1:
  for (let _i28 = 0; _i28 < _a27.length; _i28++) {
    const v_e = _a27[_i28];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L30: {
      const v_G = _eg29.of(sp.edgeEnds[2 * v_e]);
      let _c42: boolean = (_eg29.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c42) {
        let _q31 = false;
        Q32: {
          const _a33 = sp.cells;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            const _h35 = clueAt(cl.pearl, v_c);
            let _c41: boolean = !(_eg29.of(v_c) === v_G);
            if (_c41) {
              let _c40: boolean = (_h35 !== -1);
              if (!_c40) {
                let _g36 = 0;
                G37: {
                  const _a38 = sp.cellEdges[v_c];
                  for (let _i39 = 0; _i39 < _a38.length; _i39++) {
                    const v_e = _a38[_i39];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g36++;
                  }
                }
                _c40 = (_g36 > 0);
              }
              _c41 = _c40;
            }
            if (_c41) {
              _q31 = true;
              break Q32;
            }
          }
        }
        _c42 = _q31;
      }
      if (!(_c42)) break L30;
      if (b.made[0] !== _m62_0 || b.made[1] !== _m63_1) {
        const _now43 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now43 === _eg29.of(sp.edgeEnds[2 * v_e]) || sameSet(_now43, _eg29.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g44: number[] = [];
        G45: {
          const _a48 = sp.edges;
          for (let _i49 = 0; _i49 < _a48.length; _i49++) {
            const v_e = _a48[_i49];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g44.push(v_e);
          }
        }
        const _fg50 = edgeGroups(sp, _g44);
        let _c61: boolean = (_eg29.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c61) {
          let _q51 = false;
          Q52: {
            const _a53 = sp.cells;
            for (let _i54 = 0; _i54 < _a53.length; _i54++) {
              const v_c = _a53[_i54];
              let _c60: boolean = !(_eg29.of(v_c) === v_G);
              if (_c60) {
                let _c59: boolean = (clueAt(cl.pearl, v_c) !== -1);
                if (!_c59) {
                  let _g55 = 0;
                  G56: {
                    const _a57 = sp.cellEdges[v_c];
                    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
                      const v_e = _a57[_i58];
                      if (!(((b.grid[v_e] || -1) === 1))) continue;
                      _g55++;
                    }
                  }
                  _c59 = (_g55 > 0);
                }
                _c60 = _c59;
              }
              if (_c60) {
                _q51 = true;
                break Q52;
              }
            }
          }
          _c61 = _q51;
        }
        freshBinding("earlyLoop", [sameSet(_fg50.of(sp.edgeEnds[2 * v_e]), _eg29.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_L)), _c61], ["L's groups", "e in", "where of e", "G =", "where of G"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { e: v_e }, marks: {  } };
          if (!fire({ L: v_L.slice(), e: v_e, G: v_G.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface EarlyThroughBinding {
  L: readonly number[];
  Q: readonly number[];
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface EarlyThroughSays {
  terms: { c: number; };
  marks: {  };
}

const earlyThroughFacts: number[] = [];
let earlyThroughCands = new Int32Array(0);
let earlyThrough_p206 = new Int32Array(0);
let earlyThrough_l207: readonly number[] = [];
let earlyThrough_f212 = new Int32Array(0);
let earlyThrough_l213: readonly number[] = [];
let earlyThrough_p254 = new Int32Array(0);
let earlyThrough_l255: readonly number[] = [];
let earlyThrough_f260 = new Int32Array(0);
let earlyThrough_l261: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function earlyThrough(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyThroughBinding, EarlyThroughSays> | null): number {
  const _g145: number[] = [];
  const _g151: number[] = [];
  const _g174: number[] = [];
  const _g182: number[] = [];
  if (earlyThrough_p206.length < sp.edges.length) earlyThrough_p206 = new Int32Array(sp.edges.length);
  else earlyThrough_p206.fill(0);
  earlyThrough_l207 = [];
  let _y208 = false;
  if (earlyThrough_f212.length < sp.edges.length) earlyThrough_f212 = new Int32Array(sp.edges.length).fill(-1);
  else earlyThrough_f212.fill(-1);
  earlyThrough_l213 = [];
  const _s214: number[] = [];
  const _g230: number[] = [];
  if (earlyThrough_p254.length < sp.edges.length) earlyThrough_p254 = new Int32Array(sp.edges.length);
  else earlyThrough_p254.fill(0);
  earlyThrough_l255 = [];
  let _y256 = false;
  if (earlyThrough_f260.length < sp.edges.length) earlyThrough_f260 = new Int32Array(sp.edges.length).fill(-1);
  else earlyThrough_f260.fill(-1);
  earlyThrough_l261 = [];
  const _s262: number[] = [];
  const _g280: number[] = [];
  const _g286: number[] = [];
  const facts = earlyThroughFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (earlyThroughCands.length < sp.edges.length) earlyThroughCands = new Int32Array(sp.edges.length);
  const cands = earlyThroughCands;
  cands.fill(-1);
  const _m430_0 = b.made[0];
  _g145.length = 0;
  G146: {
    const _a149 = sp.edges;
    for (let _i150 = 0; _i150 < _a149.length; _i150++) {
      const v_e = _a149[_i150];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g145.push(v_e);
    }
  }
  const v_L = _g145;
  const _m431_1 = b.made[1];
  const _eg223 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g151.length = 0;
  G152: {
    const _a160 = sp.cells;
    for (let _i161 = 0; _i161 < _a160.length; _i161++) {
      const v_q = _a160[_i161];
      const _h162 = clueAt(cl.pearl, v_q);
      let _c167: boolean = (_h162 !== -1);
      if (!_c167) {
        let _g163 = 0;
        G164: {
          const _a165 = sp.cellEdges[v_q];
          for (let _i166 = 0; _i166 < _a165.length; _i166++) {
            const v_e = _a165[_i166];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g163++;
          }
        }
        _c167 = (_g163 > 0);
      }
      if (!(_c167)) continue;
      _g151.push(v_q);
    }
  }
  const v_Q = _g151;
  const _a168 = sp.cells;
  for (let _i169 = 0; _i169 < _a168.length; _i169++) {
    const v_c = _a168[_i169];
    let _g170 = 0;
    G171: {
      const _a172 = sp.cellEdges[v_c];
      for (let _i173 = 0; _i173 < _a172.length; _i173++) {
        const v_e = _a172[_i173];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g170++;
      }
    }
    if (!((_g170 === 0))) continue;
    let _g209 = -1;
    const _h228 = clueAt(cl.pearl, v_c);
    const _h229 = (_h228 === -1);
    let _g257 = -1;
    _g174.length = 0;
    G175: {
      const _a178 = sp.cellEdges[v_c];
      for (let _i179 = 0; _i179 < _a178.length; _i179++) {
        const v_e = _a178[_i179];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g174.push(v_e);
      }
    }
    L180: {
      const v_F = _g174;
      const _h181 = v_F.length;
      if (!((_h181 > 1))) break L180;
      _g182.length = 0;
      G183: {
        const _a204 = v_F;
        for (let _i205 = 0; _i205 < _a204.length; _i205++) {
          const v_e = _a204[_i205];
          if (_g209 !== _epoch) {
            _g209 = _epoch;
            for (const _e210 of earlyThrough_l207) earlyThrough_p206[_e210] = 0;
            _y208 = false;
            const _a211 = sp.cellEdges[v_c];
            for (const _e215 of earlyThrough_l213) earlyThrough_f212[_e215] = -1;
            earlyThrough_l213 = _a211;
            let _i217 = 0;
            _s214[0] = 0;
            let _o221 = _a211.length === 0;
            for (;;) {
              if (_a211.length === 0) {
                if (!_o221) break;
                _o221 = false;
              }
              while (_a211.length > 0 && _i217 >= 0) {
                const _e215 = _a211[_i217];
                if (_s214[_i217] > 0) earlyThrough_f212[_e215] = -1;
                let _r220 = (cands[_e215] >= 0 ? cands[_e215] : (cands[_e215] = b.cands[_e215])) & ~((2 << _s214[_i217]) - 1);
                let _d216 = 0;
                V219: for (; _r220 !== 0; _r220 &= _r220 - 1) {
                  _d216 = 31 - Math.clz32(_r220 & -_r220);
                  earlyThrough_f212[_e215] = _d216;
                  for (let _j218 = 0; _j218 < _i217; _j218++) {
                    const _y222 = _a211[_j218];
                    if (!(((earlyThrough_f212[_e215] === 1) && (earlyThrough_f212[_y222] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e215, _y222)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e215, _y222)))) && (!(_eg223.of((sp.edgeEnds[2 * _y222] === v_c ? sp.edgeEnds[2 * _y222 + 1] : sp.edgeEnds[2 * _y222])) === _eg223.of((sp.edgeEnds[2 * _e215] === v_c ? sp.edgeEnds[2 * _e215 + 1] : sp.edgeEnds[2 * _e215]))) || (minus(minus(v_Q, _eg223.of((sp.edgeEnds[2 * _e215] === v_c ? sp.edgeEnds[2 * _e215 + 1] : sp.edgeEnds[2 * _e215]))), setOf(v_c)).length === 0))))) continue V219;
                  }
                  break;
                }
                if (_r220 === 0) {
                  _s214[_i217] = 0;
                  _i217--;
                  continue;
                }
                _s214[_i217] = _d216;
                if (_i217 === _a211.length - 1) break;
                _i217++;
                _s214[_i217] = 0;
              }
              if (_i217 < 0) break;
              let _g224 = 0;
              G225: {
                const _a226 = sp.cellEdges[v_c];
                for (let _i227 = 0; _i227 < _a226.length; _i227++) {
                  const v_x = _a226[_i227];
                  if (!((earlyThrough_f212[v_x] === 1))) continue;
                  _g224++;
                }
              }
              if (!(((_g224 === 2) || ((_g224 === 0) && _h229)))) continue;
              if (!(true)) continue;
              earlyThrough_l207 = _a211;
              _y208 = true;
              for (const _e210 of _a211) earlyThrough_p206[_e210] |= 1 << earlyThrough_f212[_e210];
            }
          }
          if (!(((((earlyThrough_p206[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y208 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g182.push(v_e);
        }
      }
      const v_W = _g182;
      _g230.length = 0;
      G231: {
        const _a252 = v_F;
        for (let _i253 = 0; _i253 < _a252.length; _i253++) {
          const v_e = _a252[_i253];
          if (_g257 !== _epoch) {
            _g257 = _epoch;
            for (const _e258 of earlyThrough_l255) earlyThrough_p254[_e258] = 0;
            _y256 = false;
            const _a259 = sp.cellEdges[v_c];
            for (const _e263 of earlyThrough_l261) earlyThrough_f260[_e263] = -1;
            earlyThrough_l261 = _a259;
            let _i265 = 0;
            _s262[0] = 0;
            let _o269 = _a259.length === 0;
            for (;;) {
              if (_a259.length === 0) {
                if (!_o269) break;
                _o269 = false;
              }
              while (_a259.length > 0 && _i265 >= 0) {
                const _e263 = _a259[_i265];
                if (_s262[_i265] > 0) earlyThrough_f260[_e263] = -1;
                let _r268 = (cands[_e263] >= 0 ? cands[_e263] : (cands[_e263] = b.cands[_e263])) & ~((2 << _s262[_i265]) - 1);
                let _d264 = 0;
                V267: for (; _r268 !== 0; _r268 &= _r268 - 1) {
                  _d264 = 31 - Math.clz32(_r268 & -_r268);
                  earlyThrough_f260[_e263] = _d264;
                  for (let _j266 = 0; _j266 < _i265; _j266++) {
                    const _y270 = _a259[_j266];
                    if (!(((earlyThrough_f260[_e263] === 1) && (earlyThrough_f260[_y270] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e263, _y270)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e263, _y270)))) && (!(_eg223.of((sp.edgeEnds[2 * _y270] === v_c ? sp.edgeEnds[2 * _y270 + 1] : sp.edgeEnds[2 * _y270])) === _eg223.of((sp.edgeEnds[2 * _e263] === v_c ? sp.edgeEnds[2 * _e263 + 1] : sp.edgeEnds[2 * _e263]))) || (minus(minus(v_Q, _eg223.of((sp.edgeEnds[2 * _e263] === v_c ? sp.edgeEnds[2 * _e263 + 1] : sp.edgeEnds[2 * _e263]))), setOf(v_c)).length === 0))))) continue V267;
                  }
                  break;
                }
                if (_r268 === 0) {
                  _s262[_i265] = 0;
                  _i265--;
                  continue;
                }
                _s262[_i265] = _d264;
                if (_i265 === _a259.length - 1) break;
                _i265++;
                _s262[_i265] = 0;
              }
              if (_i265 < 0) break;
              let _g271 = 0;
              G272: {
                const _a273 = sp.cellEdges[v_c];
                for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                  const v_x = _a273[_i274];
                  if (!((earlyThrough_f260[v_x] === 1))) continue;
                  _g271++;
                }
              }
              if (!(((_g271 === 2) || ((_g271 === 0) && _h229)))) continue;
              if (!(true)) continue;
              earlyThrough_l255 = _a259;
              _y256 = true;
              for (const _e258 of _a259) earlyThrough_p254[_e258] |= 1 << earlyThrough_f260[_e258];
            }
          }
          if (!(((((earlyThrough_p254[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y256 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g230.push(v_e);
        }
      }
      L275: {
        const v_N = _g230;
        let _q276 = false;
        Q277: {
          const _a278 = v_F;
          for (let _i279 = 0; _i279 < _a278.length; _i279++) {
            const v_e = _a278[_i279];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q276 = true;
              break Q277;
            }
          }
        }
        if (!(_q276)) break L275;
        if (b.made[0] !== _m430_0 || b.made[1] !== _m431_1) {
          _g280.length = 0;
          G281: {
            const _a284 = sp.edges;
            for (let _i285 = 0; _i285 < _a284.length; _i285++) {
              const v_e = _a284[_i285];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g280.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g280))) { return fired; }
          _g286.length = 0;
          G287: {
            const _a295 = sp.cells;
            for (let _i296 = 0; _i296 < _a295.length; _i296++) {
              const v_q = _a295[_i296];
              let _c301: boolean = (clueAt(cl.pearl, v_q) !== -1);
              if (!_c301) {
                let _g297 = 0;
                G298: {
                  const _a299 = sp.cellEdges[v_q];
                  for (let _i300 = 0; _i300 < _a299.length; _i300++) {
                    const v_e = _a299[_i300];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g297++;
                  }
                }
                _c301 = (_g297 > 0);
              }
              if (!(_c301)) continue;
              _g286.push(v_q);
            }
          }
          if (!(sameSet(v_Q, _g286))) { return fired; }
        }
        if (DEV && staleChecking) {
          const _g302: number[] = [];
          G303: {
            const _a306 = sp.edges;
            for (let _i307 = 0; _i307 < _a306.length; _i307++) {
              const v_e = _a306[_i307];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g302.push(v_e);
            }
          }
          const _g308: number[] = [];
          G309: {
            const _a317 = sp.cells;
            for (let _i318 = 0; _i318 < _a317.length; _i318++) {
              const v_q = _a317[_i318];
              let _c323: boolean = (clueAt(cl.pearl, v_q) !== -1);
              if (!_c323) {
                let _g319 = 0;
                G320: {
                  const _a321 = sp.cellEdges[v_q];
                  for (let _i322 = 0; _i322 < _a321.length; _i322++) {
                    const v_e = _a321[_i322];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g319++;
                  }
                }
                _c323 = (_g319 > 0);
              }
              if (!(_c323)) continue;
              _g308.push(v_q);
            }
          }
          let _g324 = 0;
          G325: {
            const _a326 = sp.cellEdges[v_c];
            for (let _i327 = 0; _i327 < _a326.length; _i327++) {
              const v_e = _a326[_i327];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g324++;
            }
          }
          const _g328: number[] = [];
          G329: {
            const _a332 = sp.cellEdges[v_c];
            for (let _i333 = 0; _i333 < _a332.length; _i333++) {
              const v_e = _a332[_i333];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g328.push(v_e);
            }
          }
          const _g334: number[] = [];
          G335: {
            const _a356 = v_F;
            for (let _i357 = 0; _i357 < _a356.length; _i357++) {
              const v_e = _a356[_i357];
              let _q358 = false;
              Q359: {
                const _f361 = new Int32Array(sp.edges.length).fill(-1);
                let _l362: readonly number[] = [];
                const _s363: number[] = [];
                const _a360 = sp.cellEdges[v_c];
                for (const _e364 of _l362) _f361[_e364] = -1;
                _l362 = _a360;
                let _i366 = 0;
                _s363[0] = 0;
                let _o370 = _a360.length === 0;
                for (;;) {
                  if (_a360.length === 0) {
                    if (!_o370) break;
                    _o370 = false;
                  }
                  while (_a360.length > 0 && _i366 >= 0) {
                    const _e364 = _a360[_i366];
                    if (_s363[_i366] > 0) _f361[_e364] = -1;
                    let _r369 = (cands[_e364] >= 0 ? cands[_e364] : (cands[_e364] = b.cands[_e364])) & ~((2 << _s363[_i366]) - 1);
                    let _d365 = 0;
                    V368: for (; _r369 !== 0; _r369 &= _r369 - 1) {
                      _d365 = 31 - Math.clz32(_r369 & -_r369);
                      _f361[_e364] = _d365;
                      if (_e364 === v_e && _d365 !== 1) continue;
                      for (let _j367 = 0; _j367 < _i366; _j367++) {
                        const _y371 = _a360[_j367];
                        if (!(((_f361[_e364] === 1) && (_f361[_y371] === 1)))) continue;
                        if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e364, _y371)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e364, _y371)))) && (!(through(sp, (sp.edgeEnds[2 * _e364] === v_c ? sp.edgeEnds[2 * _e364 + 1] : sp.edgeEnds[2 * _e364]), v_L).includes((sp.edgeEnds[2 * _y371] === v_c ? sp.edgeEnds[2 * _y371 + 1] : sp.edgeEnds[2 * _y371]))) || (minus(minus(v_Q, through(sp, (sp.edgeEnds[2 * _e364] === v_c ? sp.edgeEnds[2 * _e364 + 1] : sp.edgeEnds[2 * _e364]), v_L)), setOf(v_c)).length === 0))))) continue V368;
                      }
                      break;
                    }
                    if (_r369 === 0) {
                      _s363[_i366] = 0;
                      _i366--;
                      continue;
                    }
                    _s363[_i366] = _d365;
                    if (_i366 === _a360.length - 1) break;
                    _i366++;
                    _s363[_i366] = 0;
                  }
                  if (_i366 < 0) break;
                  let _g372 = 0;
                  G373: {
                    const _a374 = sp.cellEdges[v_c];
                    for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                      const v_x = _a374[_i375];
                      if (!((_f361[v_x] === 1))) continue;
                      _g372++;
                    }
                  }
                  if (!(((_g372 === 2) || ((_g372 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q358 = true;
                    break Q359;
                  }
                }
              }
              if (!(_q358)) continue;
              _g334.push(v_e);
            }
          }
          const _g376: number[] = [];
          G377: {
            const _a398 = v_F;
            for (let _i399 = 0; _i399 < _a398.length; _i399++) {
              const v_e = _a398[_i399];
              let _q400 = false;
              Q401: {
                const _f403 = new Int32Array(sp.edges.length).fill(-1);
                let _l404: readonly number[] = [];
                const _s405: number[] = [];
                const _a402 = sp.cellEdges[v_c];
                for (const _e406 of _l404) _f403[_e406] = -1;
                _l404 = _a402;
                let _i408 = 0;
                _s405[0] = 0;
                let _o412 = _a402.length === 0;
                for (;;) {
                  if (_a402.length === 0) {
                    if (!_o412) break;
                    _o412 = false;
                  }
                  while (_a402.length > 0 && _i408 >= 0) {
                    const _e406 = _a402[_i408];
                    if (_s405[_i408] > 0) _f403[_e406] = -1;
                    let _r411 = (cands[_e406] >= 0 ? cands[_e406] : (cands[_e406] = b.cands[_e406])) & ~((2 << _s405[_i408]) - 1);
                    let _d407 = 0;
                    V410: for (; _r411 !== 0; _r411 &= _r411 - 1) {
                      _d407 = 31 - Math.clz32(_r411 & -_r411);
                      _f403[_e406] = _d407;
                      if (_e406 === v_e && _d407 !== 2) continue;
                      for (let _j409 = 0; _j409 < _i408; _j409++) {
                        const _y413 = _a402[_j409];
                        if (!(((_f403[_e406] === 1) && (_f403[_y413] === 1)))) continue;
                        if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e406, _y413)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e406, _y413)))) && (!(through(sp, (sp.edgeEnds[2 * _e406] === v_c ? sp.edgeEnds[2 * _e406 + 1] : sp.edgeEnds[2 * _e406]), v_L).includes((sp.edgeEnds[2 * _y413] === v_c ? sp.edgeEnds[2 * _y413 + 1] : sp.edgeEnds[2 * _y413]))) || (minus(minus(v_Q, through(sp, (sp.edgeEnds[2 * _e406] === v_c ? sp.edgeEnds[2 * _e406 + 1] : sp.edgeEnds[2 * _e406]), v_L)), setOf(v_c)).length === 0))))) continue V410;
                      }
                      break;
                    }
                    if (_r411 === 0) {
                      _s405[_i408] = 0;
                      _i408--;
                      continue;
                    }
                    _s405[_i408] = _d407;
                    if (_i408 === _a402.length - 1) break;
                    _i408++;
                    _s405[_i408] = 0;
                  }
                  if (_i408 < 0) break;
                  let _g414 = 0;
                  G415: {
                    const _a416 = sp.cellEdges[v_c];
                    for (let _i417 = 0; _i417 < _a416.length; _i417++) {
                      const v_x = _a416[_i417];
                      if (!((_f403[v_x] === 1))) continue;
                      _g414++;
                    }
                  }
                  if (!(((_g414 === 2) || ((_g414 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q400 = true;
                    break Q401;
                  }
                }
              }
              if (!(_q400)) continue;
              _g376.push(v_e);
            }
          }
          let _q418 = false;
          Q419: {
            const _a420 = v_F;
            for (let _i421 = 0; _i421 < _a420.length; _i421++) {
              const v_e = _a420[_i421];
              if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
                _q418 = true;
                break Q419;
              }
            }
          }
          freshBinding("earlyThrough", [sameSet(v_L, _g302), sameSet(v_Q, _g308), (sp.cells.includes(v_c)), (_g324 === 0), sameSet(v_F, _g328), (v_F.length > 1), sameSet(v_W, _g334), sameSet(v_N, _g376), _q418], ["L =", "Q =", "c in", "where of c", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q422 = true;
        Q423: {
          const _a424 = v_F;
          for (let _i425 = 0; _i425 < _a424.length; _i425++) {
            const v_e = _a424[_i425];
            let _c427: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c427) {
              let _c426: boolean = !(!(v_W.includes(v_e)));
              if (!_c426) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c426 = true;
              }
              _c427 = _c426;
            }
            let _c429: boolean = _c427;
            if (_c429) {
              let _c428: boolean = !(!(v_N.includes(v_e)));
              if (!_c428) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c428 = true;
              }
              _c429 = _c428;
            }
            if (!(_c429)) {
              _q422 = false;
              break Q423;
            }
          }
        }
        if (!(_q422)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { c: v_c }, marks: {  } };
            if (!fire({ L: v_L.slice(), Q: v_Q.slice(), c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const bentKept = keptStore<Kept<boolean>>();
let bentOn: object | null = null;
let bentAt: Kept<Kept<boolean>> = [];

/** `bent(e, x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function bent(sp: GridSpace, v_e: number, v_x: number): boolean {
  if (sp !== bentOn) {
    bentAt = bentKept.board(sp);
    bentOn = sp;
  }
  const _kept: Kept<Kept<boolean>> = bentAt;
  const _kept1 = (_kept[v_e] ??= []);
  if (_kept1[v_x] !== undefined) return _kept1[v_x];
  let _q1 = false;
  Q2: {
    const _a3 = sp.edgeFaces[v_e];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_f = _a3[_i4];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q1 = true;
        break Q2;
      }
    }
  }
  const _made = _q1;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
