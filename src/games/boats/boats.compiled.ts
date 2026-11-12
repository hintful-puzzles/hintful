// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, cluesValued, freshBinding, keptStore, least, rangeMask, sameSet, setOf, staleChecking, stamps, step, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  n: ClueList;
  seg: ClueList;
  fleet: { readonly n: number; readonly length: readonly number[]; readonly boats: readonly number[] };
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "given" | "near" | "lineShips" | "total" | "center" | "extend" | "lineWater" | "isolated" | "grow" | "onlyFit" | "centerRoom" | "tooLong" | "shortRun" | "hidden" | "onlyRuns" | "shared" | "lastWater" | "lastShip" | "centerTrial";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  given: GivenSays;
  near: NearSays;
  lineShips: LineShipsSays;
  total: TotalSays;
  center: CenterSays;
  extend: ExtendSays;
  lineWater: LineWaterSays;
  isolated: IsolatedSays;
  grow: GrowSays;
  onlyFit: OnlyFitSays;
  centerRoom: CenterRoomSays;
  tooLong: TooLongSays;
  shortRun: ShortRunSays;
  hidden: HiddenSays;
  onlyRuns: OnlyRunsSays;
  shared: SharedSays;
  lastWater: LastWaterSays;
  lastShip: LastShipSays;
  centerTrial: CenterTrialSays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["given","near","lineShips","total","center","extend","lineWater","isolated","grow","onlyFit","centerRoom","tooLong","shortRun","hidden.satisfied","hidden.forced","onlyRuns","shared","lastWater","lastShip","centerTrial"] as const;

/** Every technique run as each value is placed, by id. */
export type PlacingId = "touch";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "touch" },
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
  { id: "given", tier: 0 },
  { id: "near", tier: 0 },
  { id: "lineShips", tier: 0 },
  { id: "total", tier: 0 },
  { id: "center", tier: 0 },
  { id: "extend", tier: 0 },
  { id: "lineWater", tier: 0 },
  { id: "isolated", tier: 0 },
  { id: "grow", tier: 1 },
  { id: "onlyFit", tier: 1 },
  { id: "centerRoom", tier: 1 },
  { id: "tooLong", tier: 1 },
  { id: "shortRun", tier: 1 },
  { id: "hidden", tier: 2 },
  { id: "onlyRuns", tier: 2 },
  { id: "shared", tier: 2 },
  { id: "lastWater", tier: 3 },
  { id: "lastShip", tier: 3 },
  { id: "centerTrial", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g25: number[] = [];
  const _g33: number[] = [];
  const _g126: number[] = [];
  const _g134: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1 = true;
  Q2: {
    const _a3 = sp.cells;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_a = _a3[_i4];
      const _h5 = (g[v_a] || -1);
      if (!((_h5 === 1))) continue;
      let _q6 = true;
      Q7: {
        const _a8 = sp.adj8[v_a];
        for (let _i9 = 0; _i9 < _a8.length; _i9++) {
          const v_b = _a8[_i9];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h10 = (g[v_b] || -1);
          if (!((_h10 !== 1))) {
            _q6 = false;
            break Q7;
          }
        }
      }
      if (!(_q6)) {
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
      const _h15 = (g[v_c] || -1);
      let _c18: boolean = (_h15 === 1);
      if (_c18) {
        const _t16 = step(sp, v_c, 1);
        const _h17 = (g[_t16] || -1);
        _c18 = !(((_t16 !== -1) && (_h17 === 1)));
      }
      let _c21: boolean = _c18;
      if (_c21) {
        const _t19 = step(sp, v_c, 3);
        const _h20 = (g[_t19] || -1);
        _c21 = !(((_t19 !== -1) && (_h20 === 1)));
      }
      if (!(_c21)) continue;
      const _h24 = sp.rowOf[v_c];
      const _h32 = sp.colOf[v_c];
      let _q22 = false;
      Q23: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g25.length = 0;
          G26: {
            const _a29 = sp.lineCells[_h24];
            for (let _i30 = 0; _i30 < _a29.length; _i30++) {
              const v_x = _a29[_i30];
              const _h31 = (g[v_x] || -1);
              if (!((_h31 === 1))) continue;
              _g25.push(v_x);
            }
          }
          _g33.length = 0;
          G34: {
            const _a37 = sp.lineCells[_h32];
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_x = _a37[_i38];
              const _h39 = (g[v_x] || -1);
              if (!((_h39 === 1))) continue;
              _g33.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h24], v_c, _g25), stretch(sp.lineCells[_h32], v_c, _g33)).length)) {
            _q22 = true;
            break Q23;
          }
        }
      }
      if (!(_q22)) {
        _q11 = false;
        break Q12;
      }
    }
  }
  if (!(_q11)) return false;
  let _q40 = true;
  Q41: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q40 = false;
          break Q41;
        }
      }
    }
  }
  if (!(_q40)) return false;
  let _g42 = 0;
  G43: {
    const _a44 = sp.cells;
    for (let _i45 = 0; _i45 < _a44.length; _i45++) {
      const v_c = _a44[_i45];
      const _h46 = (g[v_c] || -1);
      if (!((_h46 === 1))) continue;
      _g42++;
    }
  }
  let _g47 = 0;
  G48: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g47 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g42 === _g47))) return false;
  for (let _k49 = 0; _k49 < cl.n.at.length; _k49++) {
    const _at50 = cl.n.at[_k49];
    const _v51 = cl.n.v[_k49];
    const _t52 = sp.lineCells[_at50];
    let _g53 = 0;
    G54: {
      const _a55 = _t52;
      for (let _i56 = 0; _i56 < _a55.length; _i56++) {
        const v_c = _a55[_i56];
        const _h57 = (g[v_c] || -1);
        if (!((_h57 === 1))) continue;
        _g53++;
      }
    }
    if (!((_g53 === _v51))) return false;
  }
  for (let _k58 = 0; _k58 < cl.seg.at.length; _k58++) {
    const _at59 = cl.seg.at[_k58];
    const _v60 = cl.seg.v[_k58];
    let _c110: boolean = ((_v60 === 2) && ((g[_at59] || -1) === 2));
    if (!_c110) {
      let _c109: boolean = ((_v60 > 2) && ((g[_at59] || -1) === 1));
      if (_c109) {
        let _c67: boolean = (_v60 === 3);
        if (!_c67) {
          let _c63: boolean = (_v60 === 4);
          if (_c63) {
            const _t61 = step(sp, _at59, 2);
            const _h62 = (g[_t61] || -1);
            _c63 = ((_t61 !== -1) && (_h62 === 1));
          }
          let _c66: boolean = _c63;
          if (_c66) {
            const _t64 = step(sp, _at59, 1);
            const _h65 = (g[_t64] || -1);
            _c66 = !(((_t64 !== -1) && (_h65 === 1)));
          }
          _c67 = _c66;
        }
        let _c74: boolean = _c67;
        if (!_c74) {
          let _c70: boolean = (_v60 === 5);
          if (_c70) {
            const _t68 = step(sp, _at59, 1);
            const _h69 = (g[_t68] || -1);
            _c70 = ((_t68 !== -1) && (_h69 === 1));
          }
          let _c73: boolean = _c70;
          if (_c73) {
            const _t71 = step(sp, _at59, 2);
            const _h72 = (g[_t71] || -1);
            _c73 = !(((_t71 !== -1) && (_h72 === 1)));
          }
          _c74 = _c73;
        }
        let _c87: boolean = _c74;
        if (!_c87) {
          let _c86: boolean = (_v60 === 6);
          if (_c86) {
            const _t75 = step(sp, _at59, 1);
            const _h76 = (g[_t75] || -1);
            let _c79: boolean = ((_t75 !== -1) && (_h76 === 1));
            if (_c79) {
              const _t77 = step(sp, _at59, 2);
              const _h78 = (g[_t77] || -1);
              _c79 = ((_t77 !== -1) && (_h78 === 1));
            }
            let _c85: boolean = _c79;
            if (!_c85) {
              const _t80 = step(sp, _at59, 3);
              const _h81 = (g[_t80] || -1);
              let _c84: boolean = ((_t80 !== -1) && (_h81 === 1));
              if (_c84) {
                const _t82 = step(sp, _at59, 4);
                const _h83 = (g[_t82] || -1);
                _c84 = ((_t82 !== -1) && (_h83 === 1));
              }
              _c85 = _c84;
            }
            _c86 = _c85;
          }
          _c87 = _c86;
        }
        let _c94: boolean = _c87;
        if (!_c94) {
          let _c90: boolean = (_v60 === 7);
          if (_c90) {
            const _t88 = step(sp, _at59, 4);
            const _h89 = (g[_t88] || -1);
            _c90 = ((_t88 !== -1) && (_h89 === 1));
          }
          let _c93: boolean = _c90;
          if (_c93) {
            const _t91 = step(sp, _at59, 3);
            const _h92 = (g[_t91] || -1);
            _c93 = !(((_t91 !== -1) && (_h92 === 1)));
          }
          _c94 = _c93;
        }
        let _c101: boolean = _c94;
        if (!_c101) {
          let _c97: boolean = (_v60 === 8);
          if (_c97) {
            const _t95 = step(sp, _at59, 3);
            const _h96 = (g[_t95] || -1);
            _c97 = ((_t95 !== -1) && (_h96 === 1));
          }
          let _c100: boolean = _c97;
          if (_c100) {
            const _t98 = step(sp, _at59, 4);
            const _h99 = (g[_t98] || -1);
            _c100 = !(((_t98 !== -1) && (_h99 === 1)));
          }
          _c101 = _c100;
        }
        let _c108: boolean = _c101;
        if (!_c108) {
          let _c107: boolean = (_v60 === 9);
          if (_c107) {
            let _q102 = false;
            Q103: {
              const _a104 = sp.adj4[_at59];
              for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                const v_x = _a104[_i105];
                const _h106 = (g[v_x] || -1);
                if ((_h106 === 1)) {
                  _q102 = true;
                  break Q103;
                }
              }
            }
            _c107 = !(_q102);
          }
          _c108 = _c107;
        }
        _c109 = _c108;
      }
      _c110 = _c109;
    }
    if (!(_c110)) return false;
  }
  for (let _k111 = 0; _k111 < cl.fleet.n; _k111++) {
    let _g114 = 0;
    G115: {
      const _a116 = sp.cells;
      for (let _i117 = 0; _i117 < _a116.length; _i117++) {
        const v_c = _a116[_i117];
        const _h118 = (g[v_c] || -1);
        let _c121: boolean = (_h118 === 1);
        if (_c121) {
          const _t119 = step(sp, v_c, 1);
          const _h120 = (g[_t119] || -1);
          _c121 = !(((_t119 !== -1) && (_h120 === 1)));
        }
        let _c124: boolean = _c121;
        if (_c124) {
          const _t122 = step(sp, v_c, 3);
          const _h123 = (g[_t122] || -1);
          _c124 = !(((_t122 !== -1) && (_h123 === 1)));
        }
        let _c141: boolean = _c124;
        if (_c141) {
          const _t125 = sp.rowOf[v_c];
          _g126.length = 0;
          G127: {
            const _a130 = sp.lineCells[_t125];
            for (let _i131 = 0; _i131 < _a130.length; _i131++) {
              const v_x = _a130[_i131];
              const _h132 = (g[v_x] || -1);
              if (!((_h132 === 1))) continue;
              _g126.push(v_x);
            }
          }
          const _t133 = sp.colOf[v_c];
          _g134.length = 0;
          G135: {
            const _a138 = sp.lineCells[_t133];
            for (let _i139 = 0; _i139 < _a138.length; _i139++) {
              const v_x = _a138[_i139];
              const _h140 = (g[v_x] || -1);
              if (!((_h140 === 1))) continue;
              _g134.push(v_x);
            }
          }
          _c141 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g126), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g134)).length === cl.fleet.length[_k111]);
        }
        if (!(_c141)) continue;
        _g114++;
      }
    }
    if (!((_g114 === cl.fleet.boats[_k111]))) return false;
  }
  return true;
}

export interface GivenBinding {
  c: number;
  v: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface GivenSays {
  terms: { shape: number; };
  marks: { outline: readonly number[]; };
}

const givenFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function given(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GivenBinding, GivenSays> | null): number {
  const facts = givenFacts;
  let fired = 0;
  let changed = false;
  const _a4 = sp.cells;
  for (let _i5 = 0; _i5 < _a4.length; _i5++) {
    const v_c = _a4[_i5];
    const _h6 = clueAt(cl.seg, v_c);
    L7: {
      const v_v = _h6;
      if (!((v_v >= 2))) break L7;
      if (DEV && staleChecking) {
        freshBinding("given", [(sp.cells.includes(v_c)), (v_v === clueAt(cl.seg, v_c)), (v_v >= 2)], ["c in", "v =", "where of v"]);
      }
      facts.length = 0;
      changed = false;
      let _c8: boolean = !((v_v === 2));
      if (!_c8) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        _c8 = true;
      }
      let _c10: boolean = _c8;
      if (_c10) {
        let _c9: boolean = !((v_v > 2));
        if (!_c9) {
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          _c9 = true;
        }
        _c10 = _c9;
      }
      let _c16: boolean = _c10;
      if (_c16) {
        let _c15: boolean = !((v_v === 4));
        if (!_c15) {
          const _t11 = step(sp, v_c, 2);
          let _c14: boolean = ((_t11 !== -1) && ((b.grid[_t11] || -1) === 1));
          if (!_c14) {
            let _c13: boolean = ((step(sp, v_c, 2) !== -1) && !((b.grid[step(sp, v_c, 2)] !== 0)));
            if (_c13) {
              const _t12 = step(sp, v_c, 2);
              if (!(b.grid[_t12] !== 0)) { if (fire === null) { b.placeAt(_t12, 1); changed = true; } else facts.push(PLACE, _t12, 1); }
              _c13 = true;
            }
            _c14 = _c13;
          }
          _c15 = _c14;
        }
        _c16 = _c15;
      }
      let _c22: boolean = _c16;
      if (_c22) {
        let _c21: boolean = !((v_v === 4));
        if (!_c21) {
          const _t17 = step(sp, v_c, 1);
          let _c20: boolean = ((_t17 === -1) || ((b.grid[_t17] || -1) === 2));
          if (!_c20) {
            let _c19: boolean = !((b.grid[step(sp, v_c, 1)] !== 0));
            if (_c19) {
              const _t18 = step(sp, v_c, 1);
              if (!(b.grid[_t18] !== 0)) { if (fire === null) { b.placeAt(_t18, 2); changed = true; } else facts.push(PLACE, _t18, 2); }
              _c19 = true;
            }
            _c20 = _c19;
          }
          _c21 = _c20;
        }
        _c22 = _c21;
      }
      let _c28: boolean = _c22;
      if (_c28) {
        let _c27: boolean = !((v_v === 5));
        if (!_c27) {
          const _t23 = step(sp, v_c, 1);
          let _c26: boolean = ((_t23 !== -1) && ((b.grid[_t23] || -1) === 1));
          if (!_c26) {
            let _c25: boolean = ((step(sp, v_c, 1) !== -1) && !((b.grid[step(sp, v_c, 1)] !== 0)));
            if (_c25) {
              const _t24 = step(sp, v_c, 1);
              if (!(b.grid[_t24] !== 0)) { if (fire === null) { b.placeAt(_t24, 1); changed = true; } else facts.push(PLACE, _t24, 1); }
              _c25 = true;
            }
            _c26 = _c25;
          }
          _c27 = _c26;
        }
        _c28 = _c27;
      }
      let _c34: boolean = _c28;
      if (_c34) {
        let _c33: boolean = !((v_v === 5));
        if (!_c33) {
          const _t29 = step(sp, v_c, 2);
          let _c32: boolean = ((_t29 === -1) || ((b.grid[_t29] || -1) === 2));
          if (!_c32) {
            let _c31: boolean = !((b.grid[step(sp, v_c, 2)] !== 0));
            if (_c31) {
              const _t30 = step(sp, v_c, 2);
              if (!(b.grid[_t30] !== 0)) { if (fire === null) { b.placeAt(_t30, 2); changed = true; } else facts.push(PLACE, _t30, 2); }
              _c31 = true;
            }
            _c32 = _c31;
          }
          _c33 = _c32;
        }
        _c34 = _c33;
      }
      let _c40: boolean = _c34;
      if (_c40) {
        let _c39: boolean = !((v_v === 7));
        if (!_c39) {
          const _t35 = step(sp, v_c, 4);
          let _c38: boolean = ((_t35 !== -1) && ((b.grid[_t35] || -1) === 1));
          if (!_c38) {
            let _c37: boolean = ((step(sp, v_c, 4) !== -1) && !((b.grid[step(sp, v_c, 4)] !== 0)));
            if (_c37) {
              const _t36 = step(sp, v_c, 4);
              if (!(b.grid[_t36] !== 0)) { if (fire === null) { b.placeAt(_t36, 1); changed = true; } else facts.push(PLACE, _t36, 1); }
              _c37 = true;
            }
            _c38 = _c37;
          }
          _c39 = _c38;
        }
        _c40 = _c39;
      }
      let _c46: boolean = _c40;
      if (_c46) {
        let _c45: boolean = !((v_v === 7));
        if (!_c45) {
          const _t41 = step(sp, v_c, 3);
          let _c44: boolean = ((_t41 === -1) || ((b.grid[_t41] || -1) === 2));
          if (!_c44) {
            let _c43: boolean = !((b.grid[step(sp, v_c, 3)] !== 0));
            if (_c43) {
              const _t42 = step(sp, v_c, 3);
              if (!(b.grid[_t42] !== 0)) { if (fire === null) { b.placeAt(_t42, 2); changed = true; } else facts.push(PLACE, _t42, 2); }
              _c43 = true;
            }
            _c44 = _c43;
          }
          _c45 = _c44;
        }
        _c46 = _c45;
      }
      let _c52: boolean = _c46;
      if (_c52) {
        let _c51: boolean = !((v_v === 8));
        if (!_c51) {
          const _t47 = step(sp, v_c, 3);
          let _c50: boolean = ((_t47 !== -1) && ((b.grid[_t47] || -1) === 1));
          if (!_c50) {
            let _c49: boolean = ((step(sp, v_c, 3) !== -1) && !((b.grid[step(sp, v_c, 3)] !== 0)));
            if (_c49) {
              const _t48 = step(sp, v_c, 3);
              if (!(b.grid[_t48] !== 0)) { if (fire === null) { b.placeAt(_t48, 1); changed = true; } else facts.push(PLACE, _t48, 1); }
              _c49 = true;
            }
            _c50 = _c49;
          }
          _c51 = _c50;
        }
        _c52 = _c51;
      }
      let _c58: boolean = _c52;
      if (_c58) {
        let _c57: boolean = !((v_v === 8));
        if (!_c57) {
          const _t53 = step(sp, v_c, 4);
          let _c56: boolean = ((_t53 === -1) || ((b.grid[_t53] || -1) === 2));
          if (!_c56) {
            let _c55: boolean = !((b.grid[step(sp, v_c, 4)] !== 0));
            if (_c55) {
              const _t54 = step(sp, v_c, 4);
              if (!(b.grid[_t54] !== 0)) { if (fire === null) { b.placeAt(_t54, 2); changed = true; } else facts.push(PLACE, _t54, 2); }
              _c55 = true;
            }
            _c56 = _c55;
          }
          _c57 = _c56;
        }
        _c58 = _c57;
      }
      let _c65: boolean = _c58;
      if (_c65) {
        let _c64: boolean = !((v_v === 9));
        if (!_c64) {
          let _q59 = true;
          Q60: {
            const _a61 = sp.adj4[v_c];
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_x = _a61[_i62];
              let _c63: boolean = ((b.grid[v_x] || -1) !== 1);
              if (_c63) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c63 = true;
              }
              if (!(_c63)) {
                _q59 = false;
                break Q60;
              }
            }
          }
          _c64 = _q59;
        }
        _c65 = _c64;
      }
      if (!(_c65)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { shape: v_v }, marks: { outline: setOf(v_c).slice() } };
          if (!fire({ c: v_c, v: v_v }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface NearBinding {
  c: number;
  D: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface NearSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const nearFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function near(b: Marks, sp: GridSpace, fire: Fire<NearBinding, NearSays> | null): number {
  const _g12: number[] = [];
  const facts = nearFacts;
  let fired = 0;
  let changed = false;
  const _a10 = cellsValued(b, sp.cells, 1);
  for (let _i11 = 0; _i11 < _a10.length; _i11++) {
    const v_c = _a10[_i11];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    _g12.length = 0;
    G13: {
      const _a16 = sp.adj8[v_c];
      for (let _i17 = 0; _i17 < _a16.length; _i17++) {
        const v_d = _a16[_i17];
        if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
        _g12.push(v_d);
      }
    }
    L18: {
      const v_D = _g12;
      const _h19 = v_D.length;
      if (!((_h19 > 0))) break L18;
      if (DEV && staleChecking) {
        const _g20: number[] = [];
        G21: {
          const _a24 = sp.adj8[v_c];
          for (let _i25 = 0; _i25 < _a24.length; _i25++) {
            const v_d = _a24[_i25];
            if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
            _g20.push(v_d);
          }
        }
        freshBinding("near", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), sameSet(v_D, _g20), (v_D.length > 0)], ["c in", "where of c", "D =", "where of D"]);
      }
      facts.length = 0;
      changed = false;
      let _q26 = true;
      Q27: {
        const _a28 = v_D;
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_d = _a28[_i29];
          if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
          if (!(true)) {
            _q26 = false;
            break Q27;
          }
        }
      }
      if (!(_q26)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: {  }, marks: { outline: setOf(v_c).slice() } };
          if (!fire({ c: v_c, D: v_D.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TouchBinding {
  c: number;
  d: number;
}

const touchFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function touch(b: Marks, sp: GridSpace, v_c: number, fire: Fire<TouchBinding> | null): number {
  const facts = touchFacts;
  let fired = 0;
  let changed = false;
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a5 = sp.adj8[v_c];
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_d = _a5[_i6];
    if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
    if (DEV && staleChecking) {
      freshBinding("touch", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), (sp.adj8[v_c].includes(v_d)), (!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0)))], ["c in", "where of c", "d in", "where of d"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, d: v_d }, facts);
    }
  }
  return fired;
}

export interface LineShipsBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LineShipsSays {
  terms: { line: number; number: number; };
  marks: { stripes: readonly number[]; reads: readonly number[]; };
}

const lineShipsFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function lineShips(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineShipsBinding, LineShipsSays> | null): number {
  const _g22: number[] = [];
  const facts = lineShipsFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.lines;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_L = _a17[_i18];
    const _h19 = clueAt(cl.n, v_L);
    L20: {
      const v_v = _h19;
      if (!((v_v >= 0))) break L20;
      const _t21 = sp.lineCells[v_L];
      _g22.length = 0;
      G23: {
        const _a26 = _t21;
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_c = _a26[_i27];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g22.push(v_c);
        }
      }
      L28: {
        const v_O = _g22;
        const _h29 = v_O.length;
        if (!((_h29 > 0))) break L28;
        const _t30 = sp.lineCells[v_L];
        let _g31 = 0;
        G32: {
          const _a33 = _t30;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g31++;
          }
        }
        const v_left = (v_v - _g31);
        if (DEV && staleChecking) {
          const _t35 = sp.lineCells[v_L];
          const _g36: number[] = [];
          G37: {
            const _a40 = _t35;
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_c = _a40[_i41];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g36.push(v_c);
            }
          }
          const _t42 = sp.lineCells[v_L];
          let _g43 = 0;
          G44: {
            const _a45 = _t42;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_c = _a45[_i46];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g43++;
            }
          }
          freshBinding("lineShips", [(sp.lines.includes(v_L)), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_O, _g36), (v_O.length > 0), (v_left === (v_v - _g43))], ["L in", "v =", "where of v", "O =", "where of O", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c52: boolean = (v_left <= _h29);
        if (_c52) {
          let _c51: boolean = !((v_left === _h29));
          if (!_c51) {
            let _q47 = true;
            Q48: {
              const _a49 = v_O;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_c = _a49[_i50];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q47 = false;
                  break Q48;
                }
              }
            }
            _c51 = _q47;
          }
          _c52 = _c51;
        }
        if (!(_c52)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { line: v_L, number: v_v }, marks: { stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
            if (!fire({ L: v_L, v: v_v, O: v_O.slice(), left: v_left }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface TotalBinding {
  O: readonly number[];
  left: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface TotalSays {
  terms: {  };
  marks: {  };
}

const totalFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function total(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalBinding, TotalSays> | null): number {
  const _g17: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _t16 = sp.cells;
  _g17.length = 0;
  G18: {
    const _a21 = _t16;
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_c = _a21[_i22];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g17.push(v_c);
    }
  }
  L23: {
    const v_O = _g17;
    const _h24 = v_O.length;
    if (!((_h24 > 0))) break L23;
    let _g25 = 0;
    G26: {
      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
        _g25 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
      }
    }
    const _t27 = sp.cells;
    let _g28 = 0;
    G29: {
      const _a30 = _t27;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_c = _a30[_i31];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g28++;
      }
    }
    const v_left = (_g25 - _g28);
    if (DEV && staleChecking) {
      const _t32 = sp.cells;
      const _g33: number[] = [];
      G34: {
        const _a37 = _t32;
        for (let _i38 = 0; _i38 < _a37.length; _i38++) {
          const v_c = _a37[_i38];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g33.push(v_c);
        }
      }
      let _g39 = 0;
      G40: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g39 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      const _t41 = sp.cells;
      let _g42 = 0;
      G43: {
        const _a44 = _t41;
        for (let _i45 = 0; _i45 < _a44.length; _i45++) {
          const v_c = _a44[_i45];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g42++;
        }
      }
      freshBinding("total", [sameSet(v_O, _g33), (v_O.length > 0), (v_left === (_g39 - _g42))], ["O =", "where of O", "left ="]);
    }
    facts.length = 0;
    changed = false;
    let _c51: boolean = (v_left <= _h24);
    if (_c51) {
      let _c50: boolean = !((v_left === _h24));
      if (!_c50) {
        let _q46 = true;
        Q47: {
          const _a48 = v_O;
          for (let _i49 = 0; _i49 < _a48.length; _i49++) {
            const v_c = _a48[_i49];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q46 = false;
              break Q47;
            }
          }
        }
        _c50 = _q46;
      }
      _c51 = _c50;
    }
    if (!(_c51)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: {  }, marks: {  } };
        if (!fire({ O: v_O.slice(), left: v_left }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface CenterBinding {
  c: number;
  a: number;
  b: number;
  p: number;
  q: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CenterSays {
  terms: { vertical: boolean; center: number; side: number; };
  marks: { outline: readonly number[]; };
}

const centerFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function center(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterBinding, CenterSays> | null): number {
  const _g33: number[] = [];
  const facts = centerFacts;
  let fired = 0;
  let changed = false;
  const _h11 = ((1 << 1) | (1 << 3));
  const _a8 = cluesValued(cl.seg, 6);
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h10 = clueAt(cl.seg, v_c);
    if (!((_h10 === 6))) continue;
    for (let _m12 = _h11; _m12 !== 0; _m12 &= _m12 - 1) {
      const v_a = 31 - Math.clz32(_m12 & -_m12);
      const v_b = (v_a + 1);
      const v_p = (4 - v_a);
      L13: {
        const v_q = (5 - v_a);
        const _t14 = step(sp, v_c, v_a);
        let _c16: boolean = ((_t14 === -1) || ((b.grid[_t14] || -1) === 2));
        if (!_c16) {
          const _t15 = step(sp, v_c, v_b);
          _c16 = ((_t15 === -1) || ((b.grid[_t15] || -1) === 2));
        }
        if (!(_c16)) break L13;
        if (DEV && staleChecking) {
          const _t17 = step(sp, v_c, v_a);
          let _c19: boolean = ((_t17 === -1) || ((b.grid[_t17] || -1) === 2));
          if (!_c19) {
            const _t18 = step(sp, v_c, v_b);
            _c19 = ((_t18 === -1) || ((b.grid[_t18] || -1) === 2));
          }
          freshBinding("center", [(sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_a === 1) || (v_a === 3)), (v_b === (v_a + 1)), (v_p === (4 - v_a)), (v_q === (5 - v_a)), _c19], ["c in", "where of c", "a in", "b =", "p =", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        const _t20 = step(sp, v_c, v_p);
        let _c22: boolean = !(((_t20 === -1) || ((b.grid[_t20] || -1) === 2)));
        if (_c22) {
          const _t21 = step(sp, v_c, v_q);
          _c22 = !(((_t21 === -1) || ((b.grid[_t21] || -1) === 2)));
        }
        let _c24: boolean = _c22;
        if (_c24) {
          const _t23 = step(sp, v_c, v_p);
          if (!(b.grid[_t23] !== 0)) { if (fire === null) { b.placeAt(_t23, 1); changed = true; } else facts.push(PLACE, _t23, 1); }
          _c24 = true;
        }
        let _c26: boolean = _c24;
        if (_c26) {
          const _t25 = step(sp, v_c, v_q);
          if (!(b.grid[_t25] !== 0)) { if (fire === null) { b.placeAt(_t25, 1); changed = true; } else facts.push(PLACE, _t25, 1); }
          _c26 = true;
        }
        if (!(_c26)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            let _g27 = 0;
            G28: {
              for (let _m31 = ((1 << v_a) | (1 << v_b)); _m31 !== 0; _m31 &= _m31 - 1) {
                const v_e = 31 - Math.clz32(_m31 & -_m31);
                const _t32 = step(sp, v_c, v_e);
                if (!(((_t32 === -1) || ((b.grid[_t32] || -1) === 2)))) continue;
                _g27 |= 1 << v_e;
              }
            }
            _g33.length = 0;
            G34: {
              let _g55 = 0;
              G56: {
                for (let _m59 = ((1 << v_a) | (1 << v_b)); _m59 !== 0; _m59 &= _m59 - 1) {
                  const v_e = 31 - Math.clz32(_m59 & -_m59);
                  const _t60 = step(sp, v_c, v_e);
                  if (!(((_t60 === -1) || ((b.grid[_t60] || -1) === 2)))) continue;
                  _g55 |= 1 << v_e;
                }
              }
              const _t61 = step(sp, v_c, least(_g55));
              for (let _i62 = 0; _i62 < 2; _i62++) {
                const v_x = _i62 === 0 ? v_c : _t61;
                if (_i62 === 1 && (v_x === v_c)) continue;
                if (!((v_x !== -1))) continue;
                _g33.push(v_x);
              }
            }
            const _says = { terms: { vertical: (v_a === 3), center: v_c, side: least(_g27) }, marks: { outline: _g33.slice() } };
            if (!fire({ c: v_c, a: v_a, b: v_b, p: v_p, q: v_q }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ExtendBinding {
  F: boolean;
  c: number;
  O: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ExtendSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const extendFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function extend(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExtendBinding, ExtendSays> | null): number {
  const _g22: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  const _m45_0 = b.made[0];
  const _m46_1 = b.made[1];
  const v_F = full(b, sp, cl, 1);
  const _a15 = cellsValued(b, sp.cells, 1);
  for (let _i16 = 0; _i16 < _a15.length; _i16++) {
    const v_c = _a15[_i16];
    let _c21: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
    if (_c21) {
      let _q17 = false;
      Q18: {
        const _a19 = sp.adj4[v_c];
        for (let _i20 = 0; _i20 < _a19.length; _i20++) {
          const v_x = _a19[_i20];
          if (((b.grid[v_x] || -1) === 1)) {
            _q17 = true;
            break Q18;
          }
        }
      }
      _c21 = !(_q17);
    }
    if (!(_c21)) continue;
    _g22.length = 0;
    G23: {
      const _a26 = sp.adj4[v_c];
      for (let _i27 = 0; _i27 < _a26.length; _i27++) {
        const v_x = _a26[_i27];
        if (!(!((b.grid[v_x] !== 0)))) continue;
        _g22.push(v_x);
      }
    }
    L28: {
      const v_O = _g22;
      const _h29 = v_O.length;
      if (!((_h29 === 1))) break L28;
      if (b.made[0] !== _m45_0 || b.made[1] !== _m46_1) {
        if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
      }
      if (DEV && staleChecking) {
        let _c34: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
        if (_c34) {
          let _q30 = false;
          Q31: {
            const _a32 = sp.adj4[v_c];
            for (let _i33 = 0; _i33 < _a32.length; _i33++) {
              const v_x = _a32[_i33];
              if (((b.grid[v_x] || -1) === 1)) {
                _q30 = true;
                break Q31;
              }
            }
          }
          _c34 = !(_q30);
        }
        const _g35: number[] = [];
        G36: {
          const _a39 = sp.adj4[v_c];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_x = _a39[_i40];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            _g35.push(v_x);
          }
        }
        freshBinding("extend", [(v_F === full(b, sp, cl, 1)), (sp.cells.includes(v_c)), _c34, sameSet(v_O, _g35), (v_O.length === 1)], ["F =", "c in", "where of c", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _q41 = true;
      Q42: {
        const _a43 = v_O;
        for (let _i44 = 0; _i44 < _a43.length; _i44++) {
          const v_x = _a43[_i44];
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) {
            _q41 = false;
            break Q42;
          }
        }
      }
      if (!(_q41)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: {  }, marks: { outline: setOf(v_c).slice() } };
          if (!fire({ F: v_F, c: v_c, O: v_O.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface LineWaterBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LineWaterSays {
  terms: { line: number; number: number; };
  marks: { stripes: readonly number[]; reads: readonly number[]; };
}

const lineWaterFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function lineWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineWaterBinding, LineWaterSays> | null): number {
  const _g22: number[] = [];
  const facts = lineWaterFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.lines;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_L = _a17[_i18];
    const _h19 = clueAt(cl.n, v_L);
    L20: {
      const v_v = _h19;
      if (!((v_v >= 0))) break L20;
      const _t21 = sp.lineCells[v_L];
      _g22.length = 0;
      G23: {
        const _a26 = _t21;
        for (let _i27 = 0; _i27 < _a26.length; _i27++) {
          const v_c = _a26[_i27];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g22.push(v_c);
        }
      }
      L28: {
        const v_O = _g22;
        const _h29 = v_O.length;
        if (!((_h29 > 0))) break L28;
        const _t30 = sp.lineCells[v_L];
        let _g31 = 0;
        G32: {
          const _a33 = _t30;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g31++;
          }
        }
        const v_left = (v_v - _g31);
        if (DEV && staleChecking) {
          const _t35 = sp.lineCells[v_L];
          const _g36: number[] = [];
          G37: {
            const _a40 = _t35;
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_c = _a40[_i41];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g36.push(v_c);
            }
          }
          const _t42 = sp.lineCells[v_L];
          let _g43 = 0;
          G44: {
            const _a45 = _t42;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_c = _a45[_i46];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g43++;
            }
          }
          freshBinding("lineWater", [(sp.lines.includes(v_L)), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_O, _g36), (v_O.length > 0), (v_left === (v_v - _g43))], ["L in", "v =", "where of v", "O =", "where of O", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c52: boolean = (v_left >= 0);
        if (_c52) {
          let _c51: boolean = !((v_left === 0));
          if (!_c51) {
            let _q47 = true;
            Q48: {
              const _a49 = v_O;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_c = _a49[_i50];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q47 = false;
                  break Q48;
                }
              }
            }
            _c51 = _q47;
          }
          _c52 = _c51;
        }
        if (!(_c52)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { line: v_L, number: v_v }, marks: { stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
            if (!fire({ L: v_L, v: v_v, O: v_O.slice(), left: v_left }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface IsolatedBinding {
  F: boolean;
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface IsolatedSays {
  terms: {  };
  marks: { outline: readonly number[]; };
}

const isolatedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function isolated(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<IsolatedBinding, IsolatedSays> | null): number {
  const facts = isolatedFacts;
  let fired = 0;
  let changed = false;
  const _m20_0 = b.made[0];
  const _m21_1 = b.made[1];
  const v_F = full(b, sp, cl, 1);
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    let _c14: boolean = (v_F && !((b.grid[v_c] !== 0)));
    if (_c14) {
      let _q10 = true;
      Q11: {
        const _a12 = sp.adj4[v_c];
        for (let _i13 = 0; _i13 < _a12.length; _i13++) {
          const v_x = _a12[_i13];
          if (!(((b.grid[v_x] || -1) === 2))) {
            _q10 = false;
            break Q11;
          }
        }
      }
      _c14 = _q10;
    }
    if (!(_c14)) continue;
    if (b.made[0] !== _m20_0 || b.made[1] !== _m21_1) {
      if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
    }
    if (DEV && staleChecking) {
      let _c19: boolean = (v_F && !((b.grid[v_c] !== 0)));
      if (_c19) {
        let _q15 = true;
        Q16: {
          const _a17 = sp.adj4[v_c];
          for (let _i18 = 0; _i18 < _a17.length; _i18++) {
            const v_x = _a17[_i18];
            if (!(((b.grid[v_x] || -1) === 2))) {
              _q15 = false;
              break Q16;
            }
          }
        }
        _c19 = _q15;
      }
      freshBinding("isolated", [(v_F === full(b, sp, cl, 1)), (sp.cells.includes(v_c)), _c19], ["F =", "c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: {  }, marks: { outline: sp.adj4[v_c].slice() } };
        if (!fire({ F: v_F, c: v_c }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface GrowBinding {
  c: number;
  L: number;
  G: readonly number[];
  E: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface GrowSays {
  terms: { length: number; };
  marks: { outline: readonly number[]; };
}

const growFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function grow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GrowBinding, GrowSays> | null): number {
  const _g35: number[] = [];
  const _g43: number[] = [];
  const _g87: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _m93_0 = b.made[0];
  const _m94_1 = b.made[1];
  const _a30 = cellsValued(b, sp.cells, 1);
  R1:
  for (let _i31 = 0; _i31 < _a30.length; _i31++) {
    const v_c = _a30[_i31];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    const _t32 = sp.rowOf[v_c];
    const _t33 = sp.colOf[v_c];
    for (let _i34 = 0; _i34 < 2; _i34++) {
      const v_L = _i34 === 0 ? _t32 : _t33;
      if (_i34 === 1 && (v_L === _t32)) continue;
      _g35.length = 0;
      G36: {
        const _a39 = sp.lineCells[v_L];
        for (let _i40 = 0; _i40 < _a39.length; _i40++) {
          const v_x = _a39[_i40];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g35.push(v_x);
        }
      }
      L41: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g35);
        const _h42 = v_G.length;
        if (!(((_h42 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L41;
        _g43.length = 0;
        G44: {
          const _a52 = sp.lineCells[v_L];
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const v_x = _a52[_i53];
            let _c58: boolean = !((b.grid[v_x] !== 0));
            if (_c58) {
              let _q54 = false;
              Q55: {
                const _a56 = v_G;
                for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                  const v_g = _a56[_i57];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q54 = true;
                    break Q55;
                  }
                }
              }
              _c58 = _q54;
            }
            if (!(_c58)) continue;
            _g43.push(v_x);
          }
        }
        L59: {
          const v_E = _g43;
          const _h60 = v_E.length;
          if (!(((_h60 === 1) && full(b, sp, cl, _h42)))) break L59;
          if (b.made[0] !== _m93_0 || b.made[1] !== _m94_1) {
            if (!(((b.grid[v_c] || -1) === 1))) { continue R1; }
          }
          if (DEV && staleChecking) {
            const _g61: number[] = [];
            G62: {
              const _a65 = sp.lineCells[v_L];
              for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                const v_x = _a65[_i66];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g61.push(v_x);
              }
            }
            const _g67: number[] = [];
            G68: {
              const _a76 = sp.lineCells[v_L];
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_x = _a76[_i77];
                let _c82: boolean = !((b.grid[v_x] !== 0));
                if (_c82) {
                  let _q78 = false;
                  Q79: {
                    const _a80 = v_G;
                    for (let _i81 = 0; _i81 < _a80.length; _i81++) {
                      const v_g = _a80[_i81];
                      if ((sp.adj4[v_g].includes(v_x))) {
                        _q78 = true;
                        break Q79;
                      }
                    }
                  }
                  _c82 = _q78;
                }
                if (!(_c82)) continue;
                _g67.push(v_x);
              }
            }
            freshBinding("grow", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), sameSet(v_G, stretch(sp.lineCells[v_L], v_c, _g61)), ((v_G.length >= 2) && ((v_G[0] ?? -1) === v_c)), sameSet(v_E, _g67), ((v_E.length === 1) && full(b, sp, cl, v_G.length))], ["c in", "where of c", "L in", "G =", "where of G", "E =", "where of E"]);
          }
          facts.length = 0;
          changed = false;
          let _q83 = true;
          Q84: {
            const _a85 = v_E;
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_x = _a85[_i86];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q83 = false;
                break Q84;
              }
            }
          }
          if (!(_q83)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              _g87.length = 0;
              G88: {
                const _a91 = v_G;
                for (let _i92 = 0; _i92 < _a91.length; _i92++) {
                  const v_x = _a91[_i92];
                  _g87.push(v_x);
                }
              }
              const _says = { terms: { length: _h42 }, marks: { outline: _g87.slice() } };
              if (!fire({ c: v_c, L: v_L, G: v_G.slice(), E: v_E.slice() }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyFitBinding {
  M: number;
  L: number;
  c: number;
  R: readonly number[];
  m: number;
  b: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OnlyFitSays {
  terms: { size: number; };
  marks: { outline: readonly number[]; };
}

const onlyFitFacts: number[] = [];
const onlyFit_st154 = stamps();

/** Its dearest read grows with the board as n^1.5. */
export function onlyFit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyFitBinding, OnlyFitSays> | null): number {
  const _g52: number[] = [];
  const _g116: number[] = [];
  const _g167: number[] = [];
  const _g189: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  const _k74 = boatsOfKept.board(cl);
  const _m198_0 = b.made[0];
  const _m199_1 = b.made[1];
  let _g37 = -1;
  G38: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t39 = cl.fleet.length[v_k];
      if (_g37 === -1 || _t39 > _g37) _g37 = _t39;
    }
  }
  const v_M = _g37;
  const _a40 = sp.lines;
  for (let _i41 = 0; _i41 < _a40.length; _i41++) {
    const v_L = _a40[_i41];
    const _h64 = clueAt(cl.n, v_L);
    const _h65 = (_h64 < 0);
    const _a42 = sp.lineCells[v_L];
    for (let _i43 = 0; _i43 < _a42.length; _i43++) {
      const v_c = _a42[_i43];
      const _h48 = (v_c % sp.w);
      const _h49 = ((v_c / sp.w) | 0);
      const _h50 = (_h48 + _h49);
      let _c51: boolean = ((b.grid[v_c] || -1) !== 2);
      if (_c51) {
        let _q44 = false;
        Q45: {
          const _a46 = sp.adj4[v_c];
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_p = _a46[_i47];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h50)))) continue;
            if (((b.grid[v_p] || -1) !== 2)) {
              _q44 = true;
              break Q45;
            }
          }
        }
        _c51 = !(_q44);
      }
      if (!(_c51)) continue;
      _g52.length = 0;
      G53: {
        const _a56 = sp.lineCells[v_L];
        for (let _i57 = 0; _i57 < _a56.length; _i57++) {
          const v_x = _a56[_i57];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g52.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g52);
      const _h58 = v_R.length;
      L59: {
        const v_m = _h58;
        let _c73: boolean = (v_m === v_M);
        if (_c73) {
          let _g60 = 0;
          G61: {
            const _a62 = v_R;
            for (let _i63 = 0; _i63 < _a62.length; _i63++) {
              const v_c = _a62[_i63];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g60++;
            }
          }
          let _c72: boolean = ((_g60 < _h58) && (_h58 >= v_m));
          if (_c72) {
            let _c71: boolean = _h65;
            if (!_c71) {
              const _t66 = sp.lineCells[v_L];
              let _g67 = 0;
              G68: {
                const _a69 = _t66;
                for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                  const v_c = _a69[_i70];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g67++;
                }
              }
              _c71 = (((_h64 - _g67) + _g60) >= v_m);
            }
            _c72 = _c71;
          }
          _c73 = _c72;
        }
        if (!(_c73)) break L59;
        const _h109 = (v_m > 1);
        L75: {
          const v_b = ((_k74[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L75;
          if (b.made[0] !== _m198_0 || b.made[1] !== _m199_1) {
            let _g76 = -1;
            G77: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                const _t78 = cl.fleet.length[v_k];
                if (_g76 === -1 || _t78 > _g76) _g76 = _t78;
              }
            }
            if (!((v_M === _g76))) { return fired; }
          }
          if (DEV && staleChecking) {
            let _g79 = -1;
            G80: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                const _t81 = cl.fleet.length[v_k];
                if (_g79 === -1 || _t81 > _g79) _g79 = _t81;
              }
            }
            let _c86: boolean = ((b.grid[v_c] || -1) !== 2);
            if (_c86) {
              let _q82 = false;
              Q83: {
                const _a84 = sp.adj4[v_c];
                for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                  const v_p = _a84[_i85];
                  if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_c % sp.w) + ((v_c / sp.w) | 0)))))) continue;
                  if (((b.grid[v_p] || -1) !== 2)) {
                    _q82 = true;
                    break Q83;
                  }
                }
              }
              _c86 = !(_q82);
            }
            const _g87: number[] = [];
            G88: {
              const _a91 = sp.lineCells[v_L];
              for (let _i92 = 0; _i92 < _a91.length; _i92++) {
                const v_x = _a91[_i92];
                if (!(((b.grid[v_x] || -1) !== 2))) continue;
                _g87.push(v_x);
              }
            }
            let _c104: boolean = (v_m === v_M);
            if (_c104) {
              let _g93 = 0;
              G94: {
                const _a95 = v_R;
                for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                  const v_c = _a95[_i96];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g93++;
                }
              }
              let _c103: boolean = ((_g93 < v_R.length) && (v_R.length >= v_m));
              if (_c103) {
                let _c102: boolean = (clueAt(cl.n, v_L) < 0);
                if (!_c102) {
                  const _t97 = sp.lineCells[v_L];
                  let _g98 = 0;
                  G99: {
                    const _a100 = _t97;
                    for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                      const v_c = _a100[_i101];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g98++;
                    }
                  }
                  _c102 = (((clueAt(cl.n, v_L) - _g98) + _g93) >= v_m);
                }
                _c103 = _c102;
              }
              _c104 = _c103;
            }
            freshBinding("onlyFit", [(v_M === _g79), (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c86, sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g87)), (v_m === v_R.length), _c104, (v_b === (boatsOf(sp, cl, v_m) - done(b, sp, v_m))), ((v_b === 1) && (taking(b, sp, cl, v_m) === 1))], ["M =", "L in", "c in", "where of c", "R =", "m =", "where of m", "b =", "where of b"]);
          }
          facts.length = 0;
          changed = false;
          let _q105 = true;
          Q106: {
            const _a107 = v_R;
            for (let _i108 = 0; _i108 < _a107.length; _i108++) {
              const v_x = _a107[_i108];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c115: boolean = true;
              if (_c115) {
                let _c114: boolean = _h109;
                if (!_c114) {
                  let _q110 = true;
                  Q111: {
                    const _a112 = sp.adj4[v_x];
                    for (let _i113 = 0; _i113 < _a112.length; _i113++) {
                      const v_y = _a112[_i113];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q110 = false;
                        break Q111;
                      }
                    }
                  }
                  _c114 = _q110;
                }
                _c115 = _c114;
              }
              if (!(_c115)) {
                _q105 = false;
                break Q106;
              }
            }
          }
          if (!(_q105)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              _g116.length = 0;
              onlyFit_st154.pass++;
              G117: {
                const _a155 = sp.lines;
                for (let _i156 = 0; _i156 < _a155.length; _i156++) {
                  const v_K = _a155[_i156];
                  const _h179 = clueAt(cl.n, v_K);
                  const _h180 = (_h179 < 0);
                  const _a157 = sp.lineCells[v_K];
                  for (let _i158 = 0; _i158 < _a157.length; _i158++) {
                    const v_d = _a157[_i158];
                    const _h163 = (v_d % sp.w);
                    const _h164 = ((v_d / sp.w) | 0);
                    const _h165 = (_h163 + _h164);
                    let _c166: boolean = ((b.grid[v_d] || -1) !== 2);
                    if (_c166) {
                      let _q159 = false;
                      Q160: {
                        const _a161 = sp.adj4[v_d];
                        for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                          const v_p = _a161[_i162];
                          if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h165)))) continue;
                          if (((b.grid[v_p] || -1) !== 2)) {
                            _q159 = true;
                            break Q160;
                          }
                        }
                      }
                      _c166 = !(_q159);
                    }
                    let _c188: boolean = _c166;
                    if (_c188) {
                      _g167.length = 0;
                      G168: {
                        const _a171 = sp.lineCells[v_K];
                        for (let _i172 = 0; _i172 < _a171.length; _i172++) {
                          const v_x = _a171[_i172];
                          if (!(((b.grid[v_x] || -1) !== 2))) continue;
                          _g167.push(v_x);
                        }
                      }
                      const _t173 = stretch(sp.lineCells[v_K], v_d, _g167);
                      const _h178 = _t173.length;
                      let _g174 = 0;
                      G175: {
                        const _a176 = _t173;
                        for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                          const v_c = _a176[_i177];
                          if (!(((b.grid[v_c] || -1) === 1))) continue;
                          _g174++;
                        }
                      }
                      let _c187: boolean = ((_g174 < _h178) && (_h178 >= v_m));
                      if (_c187) {
                        let _c186: boolean = _h180;
                        if (!_c186) {
                          const _t181 = sp.lineCells[v_K];
                          let _g182 = 0;
                          G183: {
                            const _a184 = _t181;
                            for (let _i185 = 0; _i185 < _a184.length; _i185++) {
                              const v_c = _a184[_i185];
                              if (!(((b.grid[v_c] || -1) === 1))) continue;
                              _g182++;
                            }
                          }
                          _c186 = (((_h179 - _g182) + _g174) >= v_m);
                        }
                        _c187 = _c186;
                      }
                      _c188 = _c187;
                    }
                    if (!(_c188)) continue;
                    _g189.length = 0;
                    G190: {
                      const _a193 = sp.lineCells[v_K];
                      for (let _i194 = 0; _i194 < _a193.length; _i194++) {
                        const v_x = _a193[_i194];
                        if (!(((b.grid[v_x] || -1) !== 2))) continue;
                        _g189.push(v_x);
                      }
                    }
                    const _a195 = stretch(sp.lineCells[v_K], v_d, _g189);
                    for (let _i196 = 0; _i196 < _a195.length; _i196++) {
                      const v_x = _a195[_i196];
                      const _t197 = v_x;
                      if (_g116.length < 16) { if (!_g116.includes(_t197)) _g116.push(_t197); } else addOnce(_g116, onlyFit_st154, _t197);
                    }
                  }
                }
              }
              const _says = { terms: { size: v_m }, marks: { outline: _g116.slice() } };
              if (!fire({ M: v_M, L: v_L, c: v_c, R: v_R.slice(), m: v_m, b: v_b }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterRoomBinding {
  c: number;
  L: number;
  v: number;
  S: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CenterRoomSays {
  terms: { line: number; number: number; };
  marks: { outline: readonly number[]; stripes: readonly number[]; reads: readonly number[]; };
}

const centerRoomFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function centerRoom(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterRoomBinding, CenterRoomSays> | null): number {
  const _g32: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a24 = cluesValued(cl.seg, 6);
  for (let _i25 = 0; _i25 < _a24.length; _i25++) {
    const v_c = _a24[_i25];
    const _h26 = clueAt(cl.seg, v_c);
    if (!((_h26 === 6))) continue;
    const _t27 = sp.rowOf[v_c];
    const _t28 = sp.colOf[v_c];
    for (let _i29 = 0; _i29 < 2; _i29++) {
      const v_L = _i29 === 0 ? _t27 : _t28;
      if (_i29 === 1 && (v_L === _t27)) continue;
      const _h30 = clueAt(cl.n, v_L);
      L31: {
        const v_v = _h30;
        if (!((v_v >= 0))) break L31;
        _g32.length = 0;
        G33: {
          const _a36 = sp.adj4[v_c];
          for (let _i37 = 0; _i37 < _a36.length; _i37++) {
            const v_x = _a36[_i37];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g32.push(v_x);
          }
        }
        L38: {
          const v_S = _g32;
          const _h39 = v_S.length;
          let _c49: boolean = (_h39 === 2);
          if (_c49) {
            const _t40 = sp.lineCells[v_L];
            let _g41 = 0;
            G42: {
              const _a43 = _t40;
              for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                const v_c = _a43[_i44];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g41++;
              }
            }
            let _g45 = 0;
            G46: {
              const _a47 = v_S;
              for (let _i48 = 0; _i48 < _a47.length; _i48++) {
                const v_x = _a47[_i48];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g45++;
              }
            }
            _c49 = ((v_v - _g41) < _g45);
          }
          if (!(_c49)) break L38;
          if (DEV && staleChecking) {
            const _g50: number[] = [];
            G51: {
              const _a54 = sp.adj4[v_c];
              for (let _i55 = 0; _i55 < _a54.length; _i55++) {
                const v_x = _a54[_i55];
                if (!((sp.lineCells[v_L].includes(v_x)))) continue;
                _g50.push(v_x);
              }
            }
            let _c65: boolean = (v_S.length === 2);
            if (_c65) {
              const _t56 = sp.lineCells[v_L];
              let _g57 = 0;
              G58: {
                const _a59 = _t56;
                for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                  const v_c = _a59[_i60];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g57++;
                }
              }
              let _g61 = 0;
              G62: {
                const _a63 = v_S;
                for (let _i64 = 0; _i64 < _a63.length; _i64++) {
                  const v_x = _a63[_i64];
                  if (!(((b.grid[v_x] || -1) !== 1))) continue;
                  _g61++;
                }
              }
              _c65 = ((v_v - _g57) < _g61);
            }
            freshBinding("centerRoom", [(sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_S, _g50), _c65], ["c in", "where of c", "L in", "v =", "where of v", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          let _q66 = true;
          Q67: {
            const _a68 = v_S;
            for (let _i69 = 0; _i69 < _a68.length; _i69++) {
              const v_x = _a68[_i69];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q66 = false;
                break Q67;
              }
            }
          }
          if (!(_q66)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              const _says = { terms: { line: v_L, number: v_v }, marks: { outline: setOf(v_c).slice(), stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
              if (!fire({ c: v_c, L: v_L, v: v_v, S: v_S.slice() }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface TooLongBinding {
  M: number;
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface TooLongSays {
  terms: { joined: number; largest: number; };
  marks: { outline: readonly number[]; };
}

const tooLongFacts: number[] = [];
const tooLong_st112 = stamps();

/** Its dearest read grows with the board as n^1.5. */
export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding, TooLongSays> | null): number {
  const _g35: number[] = [];
  const _g42: number[] = [];
  const _g79: number[] = [];
  const _g86: number[] = [];
  const _g92: number[] = [];
  const _g116: number[] = [];
  const _g123: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  const _m132_0 = b.made[0];
  const _m133_1 = b.made[1];
  let _g25 = -1;
  G26: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t27 = cl.fleet.length[v_k];
      if (_g25 === -1 || _t27 > _g25) _g25 = _t27;
    }
  }
  const v_M = _g25;
  const _a28 = sp.cells;
  for (let _i29 = 0; _i29 < _a28.length; _i29++) {
    const v_c = _a28[_i29];
    let _c48: boolean = !((b.grid[v_c] !== 0));
    if (_c48) {
      let _g30 = 0;
      G31: {
        const _a32 = sp.adj4[v_c];
        for (let _i33 = 0; _i33 < _a32.length; _i33++) {
          const v_a = _a32[_i33];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t34 = sp.rowOf[v_a];
          _g35.length = 0;
          G36: {
            const _a39 = sp.lineCells[_t34];
            for (let _i40 = 0; _i40 < _a39.length; _i40++) {
              const v_x = _a39[_i40];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g35.push(v_x);
            }
          }
          const _t41 = sp.colOf[v_a];
          _g42.length = 0;
          G43: {
            const _a46 = sp.lineCells[_t41];
            for (let _i47 = 0; _i47 < _a46.length; _i47++) {
              const v_x = _a46[_i47];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g42.push(v_x);
            }
          }
          _g30 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g35), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g42)).length;
        }
      }
      _c48 = ((1 + _g30) > v_M);
    }
    if (!(_c48)) continue;
    if (b.made[0] !== _m132_0 || b.made[1] !== _m133_1) {
      let _g49 = -1;
      G50: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
          const _t51 = cl.fleet.length[v_k];
          if (_g49 === -1 || _t51 > _g49) _g49 = _t51;
        }
      }
      if (!((v_M === _g49))) { return fired; }
    }
    if (DEV && staleChecking) {
      let _g52 = -1;
      G53: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
          const _t54 = cl.fleet.length[v_k];
          if (_g52 === -1 || _t54 > _g52) _g52 = _t54;
        }
      }
      let _c73: boolean = !((b.grid[v_c] !== 0));
      if (_c73) {
        let _g55 = 0;
        G56: {
          const _a57 = sp.adj4[v_c];
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            const v_a = _a57[_i58];
            if (!(((b.grid[v_a] || -1) === 1))) continue;
            const _t59 = sp.rowOf[v_a];
            const _g60: number[] = [];
            G61: {
              const _a64 = sp.lineCells[_t59];
              for (let _i65 = 0; _i65 < _a64.length; _i65++) {
                const v_x = _a64[_i65];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g60.push(v_x);
              }
            }
            const _t66 = sp.colOf[v_a];
            const _g67: number[] = [];
            G68: {
              const _a71 = sp.lineCells[_t66];
              for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                const v_x = _a71[_i72];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g67.push(v_x);
              }
            }
            _g55 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g60), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g67)).length;
          }
        }
        _c73 = ((1 + _g55) > v_M);
      }
      freshBinding("tooLong", [(v_M === _g52), (sp.cells.includes(v_c)), _c73], ["M =", "c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        let _g74 = 0;
        G75: {
          const _a76 = sp.adj4[v_c];
          for (let _i77 = 0; _i77 < _a76.length; _i77++) {
            const v_a = _a76[_i77];
            if (!(((b.grid[v_a] || -1) === 1))) continue;
            const _t78 = sp.rowOf[v_a];
            _g79.length = 0;
            G80: {
              const _a83 = sp.lineCells[_t78];
              for (let _i84 = 0; _i84 < _a83.length; _i84++) {
                const v_x = _a83[_i84];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g79.push(v_x);
              }
            }
            const _t85 = sp.colOf[v_a];
            _g86.length = 0;
            G87: {
              const _a90 = sp.lineCells[_t85];
              for (let _i91 = 0; _i91 < _a90.length; _i91++) {
                const v_x = _a90[_i91];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g86.push(v_x);
              }
            }
            _g74 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g79), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g86)).length;
          }
        }
        _g92.length = 0;
        tooLong_st112.pass++;
        G93: {
          const _a113 = sp.adj4[v_c];
          for (let _i114 = 0; _i114 < _a113.length; _i114++) {
            const v_a = _a113[_i114];
            if (!(((b.grid[v_a] || -1) === 1))) continue;
            const _t115 = sp.rowOf[v_a];
            _g116.length = 0;
            G117: {
              const _a120 = sp.lineCells[_t115];
              for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                const v_x = _a120[_i121];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g116.push(v_x);
              }
            }
            const _t122 = sp.colOf[v_a];
            _g123.length = 0;
            G124: {
              const _a127 = sp.lineCells[_t122];
              for (let _i128 = 0; _i128 < _a127.length; _i128++) {
                const v_x = _a127[_i128];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g123.push(v_x);
              }
            }
            const _a129 = union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g116), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g123));
            for (let _i130 = 0; _i130 < _a129.length; _i130++) {
              const v_x = _a129[_i130];
              const _t131 = v_x;
              if (_g92.length < 16) { if (!_g92.includes(_t131)) _g92.push(_t131); } else addOnce(_g92, tooLong_st112, _t131);
            }
          }
        }
        const _says = { terms: { joined: (1 + _g74), largest: v_M }, marks: { outline: _g92.slice() } };
        if (!fire({ M: v_M, c: v_c }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface ShortRunBinding {
  L: number;
  c: number;
  R: readonly number[];
  O: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ShortRunSays {
  terms: { length: number; };
  marks: { outline: readonly number[]; };
}

const shortRunFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function shortRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShortRunBinding, ShortRunSays> | null): number {
  const _g23: number[] = [];
  const _g31: number[] = [];
  const _g55: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a19 = sp.lines;
  for (let _i20 = 0; _i20 < _a19.length; _i20++) {
    const v_L = _a19[_i20];
    const _a21 = sp.lineCells[v_L];
    for (let _i22 = 0; _i22 < _a21.length; _i22++) {
      const v_c = _a21[_i22];
      _g23.length = 0;
      G24: {
        const _a27 = sp.lineCells[v_L];
        for (let _i28 = 0; _i28 < _a27.length; _i28++) {
          const v_x = _a27[_i28];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g23.push(v_x);
        }
      }
      L29: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g23);
        const _h30 = v_R.length;
        if (!(((_h30 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L29;
        _g31.length = 0;
        G32: {
          const _a35 = v_R;
          for (let _i36 = 0; _i36 < _a35.length; _i36++) {
            const v_c = _a35[_i36];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g31.push(v_c);
          }
        }
        L37: {
          const v_O = _g31;
          const _h38 = v_O.length;
          if (!(((_h38 === 1) && full(b, sp, cl, _h30)))) break L37;
          if (DEV && staleChecking) {
            const _g39: number[] = [];
            G40: {
              const _a43 = sp.lineCells[v_L];
              for (let _i44 = 0; _i44 < _a43.length; _i44++) {
                const v_x = _a43[_i44];
                if (!(((b.grid[v_x] || -1) !== 2))) continue;
                _g39.push(v_x);
              }
            }
            const _g45: number[] = [];
            G46: {
              const _a49 = v_R;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_c = _a49[_i50];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g45.push(v_c);
              }
            }
            freshBinding("shortRun", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g39)), ((v_R.length >= 2) && ((v_R[0] ?? -1) === v_c)), sameSet(v_O, _g45), ((v_O.length === 1) && full(b, sp, cl, v_R.length))], ["L in", "c in", "R =", "where of R", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q51 = true;
          Q52: {
            const _a53 = v_O;
            for (let _i54 = 0; _i54 < _a53.length; _i54++) {
              const v_x = _a53[_i54];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q51 = false;
                break Q52;
              }
            }
          }
          if (!(_q51)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              _g55.length = 0;
              G56: {
                const _a59 = v_R;
                for (let _i60 = 0; _i60 < _a59.length; _i60++) {
                  const v_x = _a59[_i60];
                  _g55.push(v_x);
                }
              }
              const _says = { terms: { length: _h30 }, marks: { outline: _g55.slice() } };
              if (!fire({ L: v_L, c: v_c, R: v_R.slice(), O: v_O.slice() }, facts, _says)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface HiddenBinding {
  L: number;
  O: readonly number[];
  v: number;
  left: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role; the arm that holds says which way it reads. */
export type HiddenSays =
  | { arm: "satisfied"; terms: { line: number; number: number; }; marks: { stripes: readonly number[]; reads: readonly number[]; } }
  | { arm: "forced"; terms: { line: number; number: number; }; marks: { stripes: readonly number[]; reads: readonly number[]; } }
;

const hiddenFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function hidden(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<HiddenBinding, HiddenSays> | null): number {
  const _g21: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a17 = sp.lines;
  for (let _i18 = 0; _i18 < _a17.length; _i18++) {
    const v_L = _a17[_i18];
    const _h19 = clueAt(cl.n, v_L);
    if (!((_h19 < 0))) continue;
    const _t20 = sp.lineCells[v_L];
    _g21.length = 0;
    G22: {
      const _a25 = _t20;
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_c = _a25[_i26];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g21.push(v_c);
      }
    }
    L27: {
      const v_O = _g21;
      const _h28 = v_O.length;
      if (!((_h28 > 0))) break L27;
      L29: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L29;
        const _t30 = sp.lineCells[v_L];
        let _g31 = 0;
        G32: {
          const _a33 = _t30;
          for (let _i34 = 0; _i34 < _a33.length; _i34++) {
            const v_c = _a33[_i34];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g31++;
          }
        }
        const v_left = (v_v - _g31);
        if (DEV && staleChecking) {
          const _t35 = sp.lineCells[v_L];
          const _g36: number[] = [];
          G37: {
            const _a40 = _t35;
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const v_c = _a40[_i41];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g36.push(v_c);
            }
          }
          const _t42 = sp.lineCells[v_L];
          let _g43 = 0;
          G44: {
            const _a45 = _t42;
            for (let _i46 = 0; _i46 < _a45.length; _i46++) {
              const v_c = _a45[_i46];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g43++;
            }
          }
          freshBinding("hidden", [(sp.lines.includes(v_L)), (clueAt(cl.n, v_L) < 0), sameSet(v_O, _g36), (v_O.length > 0), (v_v === rec(b, sp, cl, v_L)), (v_v >= 0), (v_left === (v_v - _g43))], ["L in", "where of L", "O =", "where of O", "v =", "where of v", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c52: boolean = ((v_left >= 0) && (v_left <= _h28));
        if (_c52) {
          let _c51: boolean = !((v_left === 0));
          if (!_c51) {
            let _q47 = true;
            Q48: {
              const _a49 = v_O;
              for (let _i50 = 0; _i50 < _a49.length; _i50++) {
                const v_c = _a49[_i50];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q47 = false;
                  break Q48;
                }
              }
            }
            _c51 = _q47;
          }
          _c52 = _c51;
        }
        let _c58: boolean = _c52;
        if (_c58) {
          let _c57: boolean = !((v_left === _h28));
          if (!_c57) {
            let _q53 = true;
            Q54: {
              const _a55 = v_O;
              for (let _i56 = 0; _i56 < _a55.length; _i56++) {
                const v_c = _a55[_i56];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q53 = false;
                  break Q54;
                }
              }
            }
            _c57 = _q53;
          }
          _c58 = _c57;
        }
        if (!(_c58)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            let _arm = -1;
            if ((v_left === 0)) _arm = 0; else if ((v_left === _h28)) _arm = 1;
            let _says: HiddenSays | null = null;
            if (_arm === 0) {
              _says = { arm: "satisfied", terms: { line: v_L, number: v_v }, marks: { stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
            }
            if (_arm === 1) {
              _says = { arm: "forced", terms: { line: v_L, number: v_v }, marks: { stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
            }
            if (_says === null) throw new Error("hidden: no arm of says holds");
            if (!fire({ L: v_L, O: v_O.slice(), v: v_v, left: v_left }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyRunsBinding {
  m: number;
  L: number;
  c: number;
  R: readonly number[];
  C: readonly number[];
  b: number;
  r: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OnlyRunsSays {
  terms: { size: number; runs: number; };
  marks: { outline: readonly number[]; };
}

const onlyRunsFacts: number[] = [];
const onlyRuns_st183 = stamps();

/** Its dearest read grows with the board as n^1.5. */
export function onlyRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunsBinding, OnlyRunsSays> | null): number {
  const _g65: number[] = [];
  const _g88: number[] = [];
  const _g145: number[] = [];
  const _g196: number[] = [];
  const _g218: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  const _k97 = boatsOfKept.board(cl);
  const _m227_0 = b.made[0];
  const _m228_1 = b.made[1];
  let _g49 = -1;
  G50: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t51 = cl.fleet.length[v_k];
      if (_g49 === -1 || _t51 > _g49) _g49 = _t51;
    }
  }
  L52: {
    const v_m = _g49;
    if (!((v_m > 0))) break L52;
    const _h87 = (2 * v_m);
    const _a53 = sp.lines;
    for (let _i54 = 0; _i54 < _a53.length; _i54++) {
      const v_L = _a53[_i54];
      const _h77 = clueAt(cl.n, v_L);
      const _h78 = (_h77 < 0);
      const _a55 = sp.lineCells[v_L];
      for (let _i56 = 0; _i56 < _a55.length; _i56++) {
        const v_c = _a55[_i56];
        const _h61 = (v_c % sp.w);
        const _h62 = ((v_c / sp.w) | 0);
        const _h63 = (_h61 + _h62);
        let _c64: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c64) {
          let _q57 = false;
          Q58: {
            const _a59 = sp.adj4[v_c];
            for (let _i60 = 0; _i60 < _a59.length; _i60++) {
              const v_p = _a59[_i60];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h63)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q57 = true;
                break Q58;
              }
            }
          }
          _c64 = !(_q57);
        }
        if (!(_c64)) continue;
        _g65.length = 0;
        G66: {
          const _a69 = sp.lineCells[v_L];
          for (let _i70 = 0; _i70 < _a69.length; _i70++) {
            const v_x = _a69[_i70];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g65.push(v_x);
          }
        }
        L71: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g65);
          const _h76 = v_R.length;
          let _g72 = 0;
          G73: {
            const _a74 = v_R;
            for (let _i75 = 0; _i75 < _a74.length; _i75++) {
              const v_c = _a74[_i75];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g72++;
            }
          }
          let _c86: boolean = (_g72 < _h76);
          if (_c86) {
            let _c85: boolean = ((_g72 < _h76) && (_h76 >= v_m));
            if (_c85) {
              let _c84: boolean = _h78;
              if (!_c84) {
                const _t79 = sp.lineCells[v_L];
                let _g80 = 0;
                G81: {
                  const _a82 = _t79;
                  for (let _i83 = 0; _i83 < _a82.length; _i83++) {
                    const v_c = _a82[_i83];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g80++;
                  }
                }
                _c84 = (((_h77 - _g80) + _g72) >= v_m);
              }
              _c85 = _c84;
            }
            _c86 = _c85;
          }
          if (!((_c86 && (_h76 < _h87)))) break L71;
          const _h94 = (_h76 - v_m);
          _g88.length = 0;
          G89: {
            const _a92 = v_R;
            for (let _i93 = 0; _i93 < _a92.length; _i93++) {
              const v_x = _a92[_i93];
              if (!(((_i93 >= _h94) && (_i93 < v_m)))) continue;
              _g88.push(v_x);
            }
          }
          L95: {
            const v_C = _g88;
            const _h96 = v_C.length;
            if (!((_h96 > 0))) break L95;
            const _h138 = (_h96 > 1);
            const v_b = ((_k97[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
            L98: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L98;
              if (b.made[0] !== _m227_0 || b.made[1] !== _m228_1) {
                let _g99 = -1;
                G100: {
                  for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                    if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                    const _t101 = cl.fleet.length[v_k];
                    if (_g99 === -1 || _t101 > _g99) _g99 = _t101;
                  }
                }
                if (!((v_m === _g99))) { return fired; }
              }
              if (DEV && staleChecking) {
                let _g102 = -1;
                G103: {
                  for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                    if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                    const _t104 = cl.fleet.length[v_k];
                    if (_g102 === -1 || _t104 > _g102) _g102 = _t104;
                  }
                }
                let _c109: boolean = ((b.grid[v_c] || -1) !== 2);
                if (_c109) {
                  let _q105 = false;
                  Q106: {
                    const _a107 = sp.adj4[v_c];
                    for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                      const v_p = _a107[_i108];
                      if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_c % sp.w) + ((v_c / sp.w) | 0)))))) continue;
                      if (((b.grid[v_p] || -1) !== 2)) {
                        _q105 = true;
                        break Q106;
                      }
                    }
                  }
                  _c109 = !(_q105);
                }
                const _g110: number[] = [];
                G111: {
                  const _a114 = sp.lineCells[v_L];
                  for (let _i115 = 0; _i115 < _a114.length; _i115++) {
                    const v_x = _a114[_i115];
                    if (!(((b.grid[v_x] || -1) !== 2))) continue;
                    _g110.push(v_x);
                  }
                }
                let _g116 = 0;
                G117: {
                  const _a118 = v_R;
                  for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                    const v_c = _a118[_i119];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g116++;
                  }
                }
                let _c127: boolean = (_g116 < v_R.length);
                if (_c127) {
                  let _c126: boolean = ((_g116 < v_R.length) && (v_R.length >= v_m));
                  if (_c126) {
                    let _c125: boolean = (clueAt(cl.n, v_L) < 0);
                    if (!_c125) {
                      const _t120 = sp.lineCells[v_L];
                      let _g121 = 0;
                      G122: {
                        const _a123 = _t120;
                        for (let _i124 = 0; _i124 < _a123.length; _i124++) {
                          const v_c = _a123[_i124];
                          if (!(((b.grid[v_c] || -1) === 1))) continue;
                          _g121++;
                        }
                      }
                      _c125 = (((clueAt(cl.n, v_L) - _g121) + _g116) >= v_m);
                    }
                    _c126 = _c125;
                  }
                  _c127 = _c126;
                }
                const _g128: number[] = [];
                G129: {
                  const _a132 = v_R;
                  for (let _i133 = 0; _i133 < _a132.length; _i133++) {
                    const v_x = _a132[_i133];
                    if (!(((_i133 >= (v_R.length - v_m)) && (_i133 < v_m)))) continue;
                    _g128.push(v_x);
                  }
                }
                freshBinding("onlyRuns", [(v_m === _g102), (v_m > 0), (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c109, sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g110)), (_c127 && (v_R.length < (2 * v_m))), sameSet(v_C, _g128), (v_C.length > 0), (v_b === (boatsOf(sp, cl, v_m) - done(b, sp, v_m))), (v_r === taking(b, sp, cl, v_m)), ((v_r === v_b) && !(wide(b, sp, cl, v_m)))], ["m =", "where of m", "L in", "c in", "where of c", "R =", "where of R", "C =", "where of C", "b =", "r =", "where of r"]);
              }
              facts.length = 0;
              changed = false;
              let _q134 = true;
              Q135: {
                const _a136 = v_C;
                for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                  const v_x = _a136[_i137];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c144: boolean = true;
                  if (_c144) {
                    let _c143: boolean = _h138;
                    if (!_c143) {
                      let _q139 = true;
                      Q140: {
                        const _a141 = sp.adj4[v_x];
                        for (let _i142 = 0; _i142 < _a141.length; _i142++) {
                          const v_y = _a141[_i142];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q139 = false;
                            break Q140;
                          }
                        }
                      }
                      _c143 = _q139;
                    }
                    _c144 = _c143;
                  }
                  if (!(_c144)) {
                    _q134 = false;
                    break Q135;
                  }
                }
              }
              if (!(_q134)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null) {
                  _g145.length = 0;
                  onlyRuns_st183.pass++;
                  G146: {
                    const _a184 = sp.lines;
                    for (let _i185 = 0; _i185 < _a184.length; _i185++) {
                      const v_K = _a184[_i185];
                      const _h208 = clueAt(cl.n, v_K);
                      const _h209 = (_h208 < 0);
                      const _a186 = sp.lineCells[v_K];
                      for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                        const v_d = _a186[_i187];
                        const _h192 = (v_d % sp.w);
                        const _h193 = ((v_d / sp.w) | 0);
                        const _h194 = (_h192 + _h193);
                        let _c195: boolean = ((b.grid[v_d] || -1) !== 2);
                        if (_c195) {
                          let _q188 = false;
                          Q189: {
                            const _a190 = sp.adj4[v_d];
                            for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                              const v_p = _a190[_i191];
                              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h194)))) continue;
                              if (((b.grid[v_p] || -1) !== 2)) {
                                _q188 = true;
                                break Q189;
                              }
                            }
                          }
                          _c195 = !(_q188);
                        }
                        let _c217: boolean = _c195;
                        if (_c217) {
                          _g196.length = 0;
                          G197: {
                            const _a200 = sp.lineCells[v_K];
                            for (let _i201 = 0; _i201 < _a200.length; _i201++) {
                              const v_x = _a200[_i201];
                              if (!(((b.grid[v_x] || -1) !== 2))) continue;
                              _g196.push(v_x);
                            }
                          }
                          const _t202 = stretch(sp.lineCells[v_K], v_d, _g196);
                          const _h207 = _t202.length;
                          let _g203 = 0;
                          G204: {
                            const _a205 = _t202;
                            for (let _i206 = 0; _i206 < _a205.length; _i206++) {
                              const v_c = _a205[_i206];
                              if (!(((b.grid[v_c] || -1) === 1))) continue;
                              _g203++;
                            }
                          }
                          let _c216: boolean = ((_g203 < _h207) && (_h207 >= v_m));
                          if (_c216) {
                            let _c215: boolean = _h209;
                            if (!_c215) {
                              const _t210 = sp.lineCells[v_K];
                              let _g211 = 0;
                              G212: {
                                const _a213 = _t210;
                                for (let _i214 = 0; _i214 < _a213.length; _i214++) {
                                  const v_c = _a213[_i214];
                                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                                  _g211++;
                                }
                              }
                              _c215 = (((_h208 - _g211) + _g203) >= v_m);
                            }
                            _c216 = _c215;
                          }
                          _c217 = _c216;
                        }
                        if (!(_c217)) continue;
                        _g218.length = 0;
                        G219: {
                          const _a222 = sp.lineCells[v_K];
                          for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                            const v_x = _a222[_i223];
                            if (!(((b.grid[v_x] || -1) !== 2))) continue;
                            _g218.push(v_x);
                          }
                        }
                        const _a224 = stretch(sp.lineCells[v_K], v_d, _g218);
                        for (let _i225 = 0; _i225 < _a224.length; _i225++) {
                          const v_x = _a224[_i225];
                          const _t226 = v_x;
                          if (_g145.length < 16) { if (!_g145.includes(_t226)) _g145.push(_t226); } else addOnce(_g145, onlyRuns_st183, _t226);
                        }
                      }
                    }
                  }
                  const _says = { terms: { size: v_m, runs: v_r }, marks: { outline: _g145.slice() } };
                  if (!fire({ m: v_m, L: v_L, c: v_c, R: v_R.slice(), C: v_C.slice(), b: v_b, r: v_r }, facts, _says)) return 1;
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

export interface SharedBinding {
  L: number;
  v: number;
  t: number;
  k: number;
  K: number;
  j: number;
  s: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SharedSays {
  terms: { line: number; number: number; room: number; middle: boolean; };
  marks: { outline: readonly number[]; stripes: readonly number[]; reads: readonly number[]; };
}

const sharedFacts: number[] = [];
let sharedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding, SharedSays> | null): number {
  const _g81: number[] = [];
  const _g87: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  if (sharedCands.length < sp.cells.length) sharedCands = new Int32Array(sp.cells.length);
  const cands = sharedCands;
  cands.fill(-1);
  numMarkedKept.clear();
  const _a25 = sp.lines;
  R1:
  for (let _i26 = 0; _i26 < _a25.length; _i26++) {
    const v_L = _a25[_i26];
    const _m103_0 = b.made[0];
    const _m104_1 = b.made[1];
    L27: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      if (!((v_v >= 0))) break L27;
      let _g28 = 0;
      G29: {
        const _a30 = sp.lineCells[v_L];
        for (let _i31 = 0; _i31 < _a30.length; _i31++) {
          const v_c = _a30[_i31];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g28++;
        }
      }
      L32: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g28);
        if (!(((v_t === 1) || (v_t === 2)))) break L32;
        const _a33 = sp.lineCells[v_L];
        for (let _i34 = 0; _i34 < _a33.length; _i34++) {
          const v_k = _a33[_i34];
          const v_K = crossing(sp, v_L, v_k);
          const v_j = numMarked(b, sp, cl, cands, v_K);
          const _h42 = (v_j >= 0);
          let _g35 = 0;
          G36: {
            const _a37 = sp.adj4[v_k];
            for (let _i38 = 0; _i38 < _a37.length; _i38++) {
              const v_x = _a37[_i38];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g35++;
            }
          }
          let _g39 = 0;
          G40: {
            for (let _i41 = 0; _i41 < 1; _i41++) {
              const v_x = v_k;
              let _c48: boolean = (!((b.grid[v_x] !== 0)) && _h42);
              if (_c48) {
                const _t43 = sp.lineCells[v_K];
                let _g44 = 0;
                G45: {
                  const _a46 = _t43;
                  for (let _i47 = 0; _i47 < _a46.length; _i47++) {
                    const v_c = _a46[_i47];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g44++;
                  }
                }
                _c48 = ((v_j - _g44) === 1);
              }
              if (!(_c48)) continue;
              _g39++;
            }
          }
          L49: {
            const v_s = (_g35 + _g39);
            if (!((v_s > v_t))) break L49;
            if (b.made[0] !== _m103_0 || b.made[1] !== _m104_1) {
              if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
              let _g50 = 0;
              G51: {
                const _a52 = sp.lineCells[v_L];
                for (let _i53 = 0; _i53 < _a52.length; _i53++) {
                  const v_c = _a52[_i53];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g50++;
                }
              }
              if (!((v_t === ((sp.lineCells[v_L].length - v_v) - _g50)))) { continue R1; }
            }
            if (DEV && staleChecking) {
              let _g54 = 0;
              G55: {
                const _a56 = sp.lineCells[v_L];
                for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                  const v_c = _a56[_i57];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g54++;
                }
              }
              let _g58 = 0;
              G59: {
                const _a60 = sp.adj4[v_k];
                for (let _i61 = 0; _i61 < _a60.length; _i61++) {
                  const v_x = _a60[_i61];
                  if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
                  _g58++;
                }
              }
              let _g62 = 0;
              G63: {
                for (let _i64 = 0; _i64 < 1; _i64++) {
                  const v_x = v_k;
                  let _c70: boolean = (!((b.grid[v_x] !== 0)) && (v_j >= 0));
                  if (_c70) {
                    const _t65 = sp.lineCells[v_K];
                    let _g66 = 0;
                    G67: {
                      const _a68 = _t65;
                      for (let _i69 = 0; _i69 < _a68.length; _i69++) {
                        const v_c = _a68[_i69];
                        if (!(((b.grid[v_c] || -1) === 1))) continue;
                        _g66++;
                      }
                    }
                    _c70 = ((v_j - _g66) === 1);
                  }
                  if (!(_c70)) continue;
                  _g62++;
                }
              }
              freshBinding("shared", [(sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), (v_v >= 0), (v_t === ((sp.lineCells[v_L].length - v_v) - _g54)), ((v_t === 1) || (v_t === 2)), (sp.lineCells[v_L].includes(v_k)), (v_K === crossing(sp, v_L, v_k)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_s === (_g58 + _g62)), (v_s > v_t)], ["L in", "v =", "where of v", "t =", "where of t", "k in", "K =", "j =", "s =", "where of s"]);
            }
            facts.length = 0;
            changed = false;
            let _q71 = true;
            Q72: {
              const _a73 = sp.adj4[v_k];
              for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                const v_y = _a73[_i74];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q71 = false;
                  break Q72;
                }
              }
            }
            if (!(_q71)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null) {
                let _c80: boolean = (!((b.grid[v_k] !== 0)) && (v_j >= 0));
                if (_c80) {
                  const _t75 = sp.lineCells[v_K];
                  let _g76 = 0;
                  G77: {
                    const _a78 = _t75;
                    for (let _i79 = 0; _i79 < _a78.length; _i79++) {
                      const v_c = _a78[_i79];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g76++;
                    }
                  }
                  _c80 = ((v_j - _g76) === 1);
                }
                _g81.length = 0;
                G82: {
                  const _a85 = sp.adj4[v_k];
                  for (let _i86 = 0; _i86 < _a85.length; _i86++) {
                    const v_x = _a85[_i86];
                    if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
                    _g81.push(v_x);
                  }
                }
                _g87.length = 0;
                G88: {
                  for (let _i96 = 0; _i96 < 1; _i96++) {
                    const v_x = v_k;
                    let _c102: boolean = (!((b.grid[v_k] !== 0)) && _h42);
                    if (_c102) {
                      const _t97 = sp.lineCells[v_K];
                      let _g98 = 0;
                      G99: {
                        const _a100 = _t97;
                        for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                          const v_c = _a100[_i101];
                          if (!(((b.grid[v_c] || -1) === 1))) continue;
                          _g98++;
                        }
                      }
                      _c102 = ((v_j - _g98) === 1);
                    }
                    if (!(_c102)) continue;
                    _g87.push(v_x);
                  }
                }
                const _says = { terms: { line: v_L, number: v_v, room: v_t, middle: _c80 }, marks: { outline: union(_g81, _g87).slice(), stripes: sp.lineCells[v_L].slice(), reads: sp.lineCells[v_L].slice() } };
                if (!fire({ L: v_L, v: v_v, t: v_t, k: v_k, K: v_K, j: v_j, s: v_s }, facts, _says)) return 1;
              }
              cands.fill(-1);
              numMarkedKept.clear();
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface LastWaterBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  t: number;
  H: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LastWaterSays {
  terms: { horizontal: boolean; crossing: boolean; };
  marks: {  };
}

const lastWaterFacts: number[] = [];
let lastWaterCands = new Int32Array(0);
const lastWater_st351 = stamps();
const lastWater_st373 = stamps();
const lastWater_st509 = stamps();
const lastWater_st516 = stamps();
const lastWater_st558 = stamps();
const lastWater_st592 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding, LastWaterSays> | null): number {
  const _g316: number[] = [];
  const _g322: number[] = [];
  const _g332: number[] = [];
  const _g345: number[] = [];
  const _g366: number[] = [];
  const _g414: number[] = [];
  const _g423: number[] = [];
  const _g510: number[] = [];
  const _g528: number[] = [];
  const _g538: number[] = [];
  const _g552: number[] = [];
  const _g572: number[] = [];
  const _g586: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  const _k607 = boatsOfKept.board(cl);
  if (lastWaterCands.length < sp.cells.length) lastWaterCands = new Int32Array(sp.cells.length);
  const cands = lastWaterCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g295 = -1;
  G296: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t297 = cl.fleet.length[v_k];
      if (_g295 === -1 || _t297 > _g295) _g295 = _t297;
    }
  }
  const v_T = _g295;
  const _a298 = sp.lines;
  R1:
  for (let _i299 = 0; _i299 < _a298.length; _i299++) {
    const v_L = _a298[_i299];
    const _m902_0 = b.made[0];
    const _m903_1 = b.made[1];
    let _q300 = false;
    Q301: {
      const _a302 = sp.lineCells[v_L];
      for (let _i303 = 0; _i303 < _a302.length; _i303++) {
        const v_c = _a302[_i303];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q300 = true;
          break Q301;
        }
      }
    }
    if (!(_q300)) continue;
    L304: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c309: boolean = (v_v >= 0);
      if (_c309) {
        let _g305 = 0;
        G306: {
          const _a307 = sp.lineCells[v_L];
          for (let _i308 = 0; _i308 < _a307.length; _i308++) {
            const v_c = _a307[_i308];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g305++;
          }
        }
        _c309 = (((sp.lineCells[v_L].length - v_v) - _g305) === 1);
      }
      if (!(_c309)) break L304;
      const _a310 = sp.lineCells[v_L];
      for (let _i311 = 0; _i311 < _a310.length; _i311++) {
        const v_c = _a310[_i311];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h340 = (v_j >= 0);
        let _g312 = 0;
        G313: {
          const _a314 = sp.lineCells[v_K];
          for (let _i315 = 0; _i315 < _a314.length; _i315++) {
            const v_c = _a314[_i315];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g312++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g312);
        const _h341 = (v_t === 1);
        const _h342 = (_h340 && _h341);
        _g316.length = 0;
        G317: {
          const _a320 = sp.lineCells[v_L];
          for (let _i321 = 0; _i321 < _a320.length; _i321++) {
            const v_x = _a320[_i321];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g316.push(v_x);
          }
        }
        _g322.length = 0;
        G323: {
          _g332.length = 0;
          G333: {
            const _a336 = sp.lineCells[v_K];
            for (let _i337 = 0; _i337 < _a336.length; _i337++) {
              const v_x = _a336[_i337];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g332.push(v_x);
            }
          }
          const _a338 = _g332;
          for (let _i339 = 0; _i339 < _a338.length; _i339++) {
            const v_x = _a338[_i339];
            if (!(_h342)) continue;
            _g322.push(v_x);
          }
        }
        L343: {
          const v_H = union(_g316, _g322);
          const _t344 = setOf(v_c);
          _g345.length = 0;
          lastWater_st351.pass++;
          G346: {
            const _a352 = v_H;
            for (let _i353 = 0; _i353 < _a352.length; _i353++) {
              const v_a = _a352[_i353];
              const _a354 = sp.adj8[v_a];
              for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                const v_d = _a354[_i355];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t356 = v_d;
                if (_g345.length < 16) { if (!_g345.includes(_t356)) _g345.push(_t356); } else addOnce(_g345, lastWater_st351, _t356);
              }
            }
          }
          const _t357 = union(_t344, _g345);
          const _h517 = union(v_H, _t357);
          let _q358 = false;
          Q359: {
            const _a360 = v_H;
            for (let _i361 = 0; _i361 < _a360.length; _i361++) {
              const v_a = _a360[_i361];
              const _a362 = sp.adj8[v_a];
              for (let _i363 = 0; _i363 < _a362.length; _i363++) {
                const v_b = _a362[_i363];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q358 = true;
                  break Q359;
                }
              }
            }
          }
          let _c392: boolean = _q358;
          if (!_c392) {
            let _q364 = false;
            Q365: {
              _g366.length = 0;
              lastWater_st373.pass++;
              G367: {
                const _a374 = union(v_H, _t357);
                for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                  const v_a = _a374[_i375];
                  const _t376 = sp.rowOf[v_a];
                  const _t377 = sp.colOf[v_a];
                  for (let _i378 = 0; _i378 < 2; _i378++) {
                    const v_M = _i378 === 0 ? _t376 : _t377;
                    if (_i378 === 1 && (v_M === _t376)) continue;
                    const _t379 = v_M;
                    if (_g366.length < 16) { if (!_g366.includes(_t379)) _g366.push(_t379); } else addOnce(_g366, lastWater_st373, _t379);
                  }
                }
              }
              const _a380 = _g366;
              for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                const v_L = _a380[_i381];
                L382: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L382;
                  let _g383 = 0;
                  G384: {
                    const _a385 = sp.lineCells[v_L];
                    for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                      const v_x = _a385[_i386];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g383++;
                    }
                  }
                  let _c391: boolean = (_g383 > v_v);
                  if (!_c391) {
                    let _g387 = 0;
                    G388: {
                      const _a389 = sp.lineCells[v_L];
                      for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                        const v_x = _a389[_i390];
                        if (!((!(_t357.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g387++;
                      }
                    }
                    _c391 = (_g387 < v_v);
                  }
                  if (_c391) {
                    _q364 = true;
                    break Q365;
                  }
                }
              }
            }
            _c392 = _q364;
          }
          let _c399: boolean = _c392;
          if (!_c399) {
            let _g393 = 0;
            G394: {
              const _a395 = sp.cells;
              for (let _i396 = 0; _i396 < _a395.length; _i396++) {
                const v_x = _a395[_i396];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g393++;
              }
            }
            let _g397 = 0;
            G398: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g397 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c399 = (_g393 > _g397);
          }
          let _c406: boolean = _c399;
          if (!_c406) {
            let _g400 = 0;
            G401: {
              const _a402 = sp.cells;
              for (let _i403 = 0; _i403 < _a402.length; _i403++) {
                const v_x = _a402[_i403];
                if (!((!(_t357.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g400++;
              }
            }
            let _g404 = 0;
            G405: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g404 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c406 = (_g400 < _g404);
          }
          let _c420: boolean = _c406;
          if (!_c420) {
            let _q407 = false;
            Q408: {
              const _a409 = v_H;
              for (let _i410 = 0; _i410 < _a409.length; _i410++) {
                const v_a = _a409[_i410];
                const _t411 = sp.rowOf[v_a];
                const _t412 = sp.colOf[v_a];
                for (let _i413 = 0; _i413 < 2; _i413++) {
                  const v_L = _i413 === 0 ? _t411 : _t412;
                  if (_i413 === 1 && (v_L === _t411)) continue;
                  _g414.length = 0;
                  G415: {
                    const _a418 = sp.lineCells[v_L];
                    for (let _i419 = 0; _i419 < _a418.length; _i419++) {
                      const v_x = _a418[_i419];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g414.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g414).length > v_T)) {
                    _q407 = true;
                    break Q408;
                  }
                }
              }
            }
            _c420 = _q407;
          }
          let _c608: boolean = _c420;
          if (!_c608) {
            let _q421 = false;
            Q422: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g423.length = 0;
                lastWater_st509.pass++;
                G424: {
                  _g510.length = 0;
                  lastWater_st516.pass++;
                  G511: {
                    const _a518 = _h517;
                    for (let _i519 = 0; _i519 < _a518.length; _i519++) {
                      const v_x = _a518[_i519];
                      const _a520 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i521 = 0; _i521 < _a520.length; _i521++) {
                        const v_y = _a520[_i521];
                        const _t522 = v_y;
                        if (_g510.length < 16) { if (!_g510.includes(_t522)) _g510.push(_t522); } else addOnce(_g510, lastWater_st516, _t522);
                      }
                    }
                  }
                  const _a523 = _g510;
                  for (let _i524 = 0; _i524 < _a523.length; _i524++) {
                    const v_a = _a523[_i524];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t525 = sp.rowOf[v_a];
                    const _t526 = sp.colOf[v_a];
                    for (let _i527 = 0; _i527 < 2; _i527++) {
                      const v_L = _i527 === 0 ? _t525 : _t526;
                      if (_i527 === 1 && (v_L === _t525)) continue;
                      _g528.length = 0;
                      G529: {
                        const _a532 = sp.lineCells[v_L];
                        for (let _i533 = 0; _i533 < _a532.length; _i533++) {
                          const v_x = _a532[_i533];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g528.push(v_x);
                        }
                      }
                      L534: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g528);
                        const _h535 = v_G.length;
                        const _h566 = (_h535 === 1);
                        let _c569: boolean = (_h535 === v_m);
                        if (_c569) {
                          let _q536 = true;
                          Q537: {
                            _g538.length = 0;
                            G539: {
                              _g552.length = 0;
                              lastWater_st558.pass++;
                              G553: {
                                const _a559 = v_G;
                                for (let _i560 = 0; _i560 < _a559.length; _i560++) {
                                  const v_g = _a559[_i560];
                                  const _a561 = sp.adj4[v_g];
                                  for (let _i562 = 0; _i562 < _a561.length; _i562++) {
                                    const v_z = _a561[_i562];
                                    const _t563 = v_z;
                                    if (_g552.length < 16) { if (!_g552.includes(_t563)) _g552.push(_t563); } else addOnce(_g552, lastWater_st558, _t563);
                                  }
                                }
                              }
                              const _a564 = _g552;
                              for (let _i565 = 0; _i565 < _a564.length; _i565++) {
                                const v_y = _a564[_i565];
                                if (!((!(v_G.includes(v_y)) && (_h566 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g538.push(v_y);
                              }
                            }
                            const _a567 = _g538;
                            for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                              const v_y = _a567[_i568];
                              if (!(((_t357.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q536 = false;
                                break Q537;
                              }
                            }
                          }
                          _c569 = _q536;
                        }
                        let _c602: boolean = _c569;
                        if (_c602) {
                          let _q570 = false;
                          Q571: {
                            _g572.length = 0;
                            G573: {
                              _g586.length = 0;
                              lastWater_st592.pass++;
                              G587: {
                                const _a593 = v_G;
                                for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                                  const v_g = _a593[_i594];
                                  const _a595 = sp.adj4[v_g];
                                  for (let _i596 = 0; _i596 < _a595.length; _i596++) {
                                    const v_z = _a595[_i596];
                                    const _t597 = v_z;
                                    if (_g586.length < 16) { if (!_g586.includes(_t597)) _g586.push(_t597); } else addOnce(_g586, lastWater_st592, _t597);
                                  }
                                }
                              }
                              const _a598 = _g586;
                              for (let _i599 = 0; _i599 < _a598.length; _i599++) {
                                const v_y = _a598[_i599];
                                if (!((!(v_G.includes(v_y)) && (_h566 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g572.push(v_y);
                              }
                            }
                            const _a600 = union(v_G, _g572);
                            for (let _i601 = 0; _i601 < _a600.length; _i601++) {
                              const v_x = _a600[_i601];
                              if (((v_H.includes(v_x)) || (_t357.includes(v_x)))) {
                                _q570 = true;
                                break Q571;
                              }
                            }
                          }
                          _c602 = _q570;
                        }
                        if (!(_c602)) break L534;
                        const _t603 = (v_G[0] ?? -1);
                        const _t604 = _t603;
                        if (_g423.length < 16) { if (!_g423.includes(_t604)) _g423.push(_t604); } else addOnce(_g423, lastWater_st509, _t604);
                      }
                    }
                  }
                }
                L605: {
                  const v_C = _g423;
                  const _h606 = v_C.length;
                  if (!((_h606 > 0))) break L605;
                  if ((_h606 > ((_k607[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q421 = true;
                    break Q422;
                  }
                }
              }
            }
            _c608 = _q421;
          }
          if (!(_c608)) break L343;
          if (b.made[0] !== _m902_0 || b.made[1] !== _m903_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c613: boolean = (v_v >= 0);
            if (_c613) {
              let _g609 = 0;
              G610: {
                const _a611 = sp.lineCells[v_L];
                for (let _i612 = 0; _i612 < _a611.length; _i612++) {
                  const v_c = _a611[_i612];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g609++;
                }
              }
              _c613 = (((sp.lineCells[v_L].length - v_v) - _g609) === 1);
            }
            if (!(_c613)) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g614 = -1;
            G615: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > 0))) continue;
                const _t616 = cl.fleet.length[v_k];
                if (_g614 === -1 || _t616 > _g614) _g614 = _t616;
              }
            }
            let _c621: boolean = (v_v >= 0);
            if (_c621) {
              let _g617 = 0;
              G618: {
                const _a619 = sp.lineCells[v_L];
                for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                  const v_c = _a619[_i620];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g617++;
                }
              }
              _c621 = (((sp.lineCells[v_L].length - v_v) - _g617) === 1);
            }
            let _g622 = 0;
            G623: {
              const _a624 = sp.lineCells[v_K];
              for (let _i625 = 0; _i625 < _a624.length; _i625++) {
                const v_c = _a624[_i625];
                if (!(((b.grid[v_c] || -1) === 2))) continue;
                _g622++;
              }
            }
            const _g626: number[] = [];
            G627: {
              const _a630 = sp.lineCells[v_L];
              for (let _i631 = 0; _i631 < _a630.length; _i631++) {
                const v_x = _a630[_i631];
                if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                _g626.push(v_x);
              }
            }
            const _g632: number[] = [];
            G633: {
              const _g642: number[] = [];
              G643: {
                const _a646 = sp.lineCells[v_K];
                for (let _i647 = 0; _i647 < _a646.length; _i647++) {
                  const v_x = _a646[_i647];
                  if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                  _g642.push(v_x);
                }
              }
              const _a648 = _g642;
              for (let _i649 = 0; _i649 < _a648.length; _i649++) {
                const v_x = _a648[_i649];
                if (!(((v_j >= 0) && (v_t === 1)))) continue;
                _g632.push(v_x);
              }
            }
            const _t650 = setOf(v_c);
            const _g651: number[] = [];
            G652: {
              const _a657 = v_H;
              for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                const v_a = _a657[_i658];
                const _a659 = sp.adj8[v_a];
                for (let _i660 = 0; _i660 < _a659.length; _i660++) {
                  const v_d = _a659[_i660];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g651.includes(v_d)) _g651.push(v_d);
                }
              }
            }
            const _t661 = union(_t650, _g651);
            let _q662 = false;
            Q663: {
              const _a664 = v_H;
              for (let _i665 = 0; _i665 < _a664.length; _i665++) {
                const v_a = _a664[_i665];
                const _a666 = sp.adj8[v_a];
                for (let _i667 = 0; _i667 < _a666.length; _i667++) {
                  const v_b = _a666[_i667];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q662 = true;
                    break Q663;
                  }
                }
              }
            }
            let _c694: boolean = _q662;
            if (!_c694) {
              let _q668 = false;
              Q669: {
                const _g670: number[] = [];
                G671: {
                  const _a677 = union(v_H, _t661);
                  for (let _i678 = 0; _i678 < _a677.length; _i678++) {
                    const v_a = _a677[_i678];
                    const _t679 = sp.rowOf[v_a];
                    const _t680 = sp.colOf[v_a];
                    for (let _i681 = 0; _i681 < 2; _i681++) {
                      const v_M = _i681 === 0 ? _t679 : _t680;
                      if (_i681 === 1 && (v_M === _t679)) continue;
                      if (!_g670.includes(v_M)) _g670.push(v_M);
                    }
                  }
                }
                const _a682 = _g670;
                for (let _i683 = 0; _i683 < _a682.length; _i683++) {
                  const v_L = _a682[_i683];
                  L684: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L684;
                    let _g685 = 0;
                    G686: {
                      const _a687 = sp.lineCells[v_L];
                      for (let _i688 = 0; _i688 < _a687.length; _i688++) {
                        const v_x = _a687[_i688];
                        if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g685++;
                      }
                    }
                    let _c693: boolean = (_g685 > v_v);
                    if (!_c693) {
                      let _g689 = 0;
                      G690: {
                        const _a691 = sp.lineCells[v_L];
                        for (let _i692 = 0; _i692 < _a691.length; _i692++) {
                          const v_x = _a691[_i692];
                          if (!((!(_t661.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g689++;
                        }
                      }
                      _c693 = (_g689 < v_v);
                    }
                    if (_c693) {
                      _q668 = true;
                      break Q669;
                    }
                  }
                }
              }
              _c694 = _q668;
            }
            let _c701: boolean = _c694;
            if (!_c701) {
              let _g695 = 0;
              G696: {
                const _a697 = sp.cells;
                for (let _i698 = 0; _i698 < _a697.length; _i698++) {
                  const v_x = _a697[_i698];
                  if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g695++;
                }
              }
              let _g699 = 0;
              G700: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g699 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c701 = (_g695 > _g699);
            }
            let _c708: boolean = _c701;
            if (!_c708) {
              let _g702 = 0;
              G703: {
                const _a704 = sp.cells;
                for (let _i705 = 0; _i705 < _a704.length; _i705++) {
                  const v_x = _a704[_i705];
                  if (!((!(_t661.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g702++;
                }
              }
              let _g706 = 0;
              G707: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g706 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c708 = (_g702 < _g706);
            }
            let _c722: boolean = _c708;
            if (!_c722) {
              let _q709 = false;
              Q710: {
                const _a711 = v_H;
                for (let _i712 = 0; _i712 < _a711.length; _i712++) {
                  const v_a = _a711[_i712];
                  const _t713 = sp.rowOf[v_a];
                  const _t714 = sp.colOf[v_a];
                  for (let _i715 = 0; _i715 < 2; _i715++) {
                    const v_L = _i715 === 0 ? _t713 : _t714;
                    if (_i715 === 1 && (v_L === _t713)) continue;
                    const _g716: number[] = [];
                    G717: {
                      const _a720 = sp.lineCells[v_L];
                      for (let _i721 = 0; _i721 < _a720.length; _i721++) {
                        const v_x = _a720[_i721];
                        if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g716.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g716).length > v_T)) {
                      _q709 = true;
                      break Q710;
                    }
                  }
                }
              }
              _c722 = _q709;
            }
            let _c897: boolean = _c722;
            if (!_c897) {
              let _q723 = false;
              Q724: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g725: number[] = [];
                  G726: {
                    const _g811: number[] = [];
                    G812: {
                      const _a817 = union(v_H, _t661);
                      for (let _i818 = 0; _i818 < _a817.length; _i818++) {
                        const v_x = _a817[_i818];
                        const _a819 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i820 = 0; _i820 < _a819.length; _i820++) {
                          const v_y = _a819[_i820];
                          if (!_g811.includes(v_y)) _g811.push(v_y);
                        }
                      }
                    }
                    const _a821 = _g811;
                    for (let _i822 = 0; _i822 < _a821.length; _i822++) {
                      const v_a = _a821[_i822];
                      if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t823 = sp.rowOf[v_a];
                      const _t824 = sp.colOf[v_a];
                      for (let _i825 = 0; _i825 < 2; _i825++) {
                        const v_L = _i825 === 0 ? _t823 : _t824;
                        if (_i825 === 1 && (v_L === _t823)) continue;
                        const _g826: number[] = [];
                        G827: {
                          const _a830 = sp.lineCells[v_L];
                          for (let _i831 = 0; _i831 < _a830.length; _i831++) {
                            const v_x = _a830[_i831];
                            if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g826.push(v_x);
                          }
                        }
                        L832: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g826);
                          let _c863: boolean = (v_G.length === v_m);
                          if (_c863) {
                            let _q833 = true;
                            Q834: {
                              const _g835: number[] = [];
                              G836: {
                                const _g849: number[] = [];
                                G850: {
                                  const _a855 = v_G;
                                  for (let _i856 = 0; _i856 < _a855.length; _i856++) {
                                    const v_g = _a855[_i856];
                                    const _a857 = sp.adj4[v_g];
                                    for (let _i858 = 0; _i858 < _a857.length; _i858++) {
                                      const v_z = _a857[_i858];
                                      if (!_g849.includes(v_z)) _g849.push(v_z);
                                    }
                                  }
                                }
                                const _a859 = _g849;
                                for (let _i860 = 0; _i860 < _a859.length; _i860++) {
                                  const v_y = _a859[_i860];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g835.push(v_y);
                                }
                              }
                              const _a861 = _g835;
                              for (let _i862 = 0; _i862 < _a861.length; _i862++) {
                                const v_y = _a861[_i862];
                                if (!(((_t661.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q833 = false;
                                  break Q834;
                                }
                              }
                            }
                            _c863 = _q833;
                          }
                          let _c894: boolean = _c863;
                          if (_c894) {
                            let _q864 = false;
                            Q865: {
                              const _g866: number[] = [];
                              G867: {
                                const _g880: number[] = [];
                                G881: {
                                  const _a886 = v_G;
                                  for (let _i887 = 0; _i887 < _a886.length; _i887++) {
                                    const v_g = _a886[_i887];
                                    const _a888 = sp.adj4[v_g];
                                    for (let _i889 = 0; _i889 < _a888.length; _i889++) {
                                      const v_z = _a888[_i889];
                                      if (!_g880.includes(v_z)) _g880.push(v_z);
                                    }
                                  }
                                }
                                const _a890 = _g880;
                                for (let _i891 = 0; _i891 < _a890.length; _i891++) {
                                  const v_y = _a890[_i891];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g866.push(v_y);
                                }
                              }
                              const _a892 = union(v_G, _g866);
                              for (let _i893 = 0; _i893 < _a892.length; _i893++) {
                                const v_x = _a892[_i893];
                                if (((v_H.includes(v_x)) || (_t661.includes(v_x)))) {
                                  _q864 = true;
                                  break Q865;
                                }
                              }
                            }
                            _c894 = _q864;
                          }
                          if (!(_c894)) break L832;
                          const _t895 = (v_G[0] ?? -1);
                          if (!_g725.includes(_t895)) _g725.push(_t895);
                        }
                      }
                    }
                  }
                  L896: {
                    const v_C = _g725;
                    if (!((v_C.length > 0))) break L896;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q723 = true;
                      break Q724;
                    }
                  }
                }
              }
              _c897 = _q723;
            }
            freshBinding("lastWater", [(v_T === _g614), (sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), _c621, (sp.lineCells[v_L].includes(v_c)), !((b.grid[v_c] !== 0)), (v_K === crossing(sp, v_L, v_c)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_t === ((sp.lineCells[v_K].length - v_j) - _g622)), sameSet(v_H, union(_g626, _g632)), _c897], ["T =", "L in", "v =", "where of v", "c in", "where of c", "K =", "j =", "t =", "H =", "where of H"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              let _g898 = 0;
              G899: {
                const _a900 = v_H;
                for (let _i901 = 0; _i901 < _a900.length; _i901++) {
                  const v_x = _a900[_i901];
                  if (!(!(sp.lineCells[v_L].includes(v_x)))) continue;
                  _g898++;
                }
              }
              const _says = { terms: { horizontal: !((((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w))), crossing: (_g898 > 0) }, marks: {  } };
              if (!fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, t: v_t, H: v_H.slice() }, facts, _says)) return 1;
            }
            cands.fill(-1);
            numMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface LastShipBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  u: number;
  W: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LastShipSays {
  terms: { horizontal: boolean; crossing: boolean; };
  marks: {  };
}

const lastShipFacts: number[] = [];
let lastShipCands = new Int32Array(0);
const lastShip_st355 = stamps();
const lastShip_st377 = stamps();
const lastShip_st513 = stamps();
const lastShip_st520 = stamps();
const lastShip_st562 = stamps();
const lastShip_st596 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding, LastShipSays> | null): number {
  const _g320: number[] = [];
  const _g326: number[] = [];
  const _g336: number[] = [];
  const _g349: number[] = [];
  const _g370: number[] = [];
  const _g418: number[] = [];
  const _g427: number[] = [];
  const _g514: number[] = [];
  const _g532: number[] = [];
  const _g542: number[] = [];
  const _g556: number[] = [];
  const _g576: number[] = [];
  const _g590: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  const _k611 = boatsOfKept.board(cl);
  if (lastShipCands.length < sp.cells.length) lastShipCands = new Int32Array(sp.cells.length);
  const cands = lastShipCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g297 = -1;
  G298: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t299 = cl.fleet.length[v_k];
      if (_g297 === -1 || _t299 > _g297) _g297 = _t299;
    }
  }
  const v_T = _g297;
  const _a300 = sp.lines;
  R1:
  for (let _i301 = 0; _i301 < _a300.length; _i301++) {
    const v_L = _a300[_i301];
    const _m909_0 = b.made[0];
    const _m910_1 = b.made[1];
    let _q302 = false;
    Q303: {
      const _a304 = sp.lineCells[v_L];
      for (let _i305 = 0; _i305 < _a304.length; _i305++) {
        const v_c = _a304[_i305];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q302 = true;
          break Q303;
        }
      }
    }
    if (!(_q302)) continue;
    L306: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c312: boolean = (v_v >= 0);
      if (_c312) {
        const _t307 = sp.lineCells[v_L];
        let _g308 = 0;
        G309: {
          const _a310 = _t307;
          for (let _i311 = 0; _i311 < _a310.length; _i311++) {
            const v_c = _a310[_i311];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g308++;
          }
        }
        _c312 = ((v_v - _g308) === 1);
      }
      if (!(_c312)) break L306;
      const _a313 = sp.lineCells[v_L];
      for (let _i314 = 0; _i314 < _a313.length; _i314++) {
        const v_c = _a313[_i314];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h344 = (v_j >= 0);
        const _t315 = sp.lineCells[v_K];
        let _g316 = 0;
        G317: {
          const _a318 = _t315;
          for (let _i319 = 0; _i319 < _a318.length; _i319++) {
            const v_c = _a318[_i319];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g316++;
          }
        }
        const v_u = (v_j - _g316);
        const _h345 = (v_u === 1);
        const _h346 = (_h344 && _h345);
        _g320.length = 0;
        G321: {
          const _a324 = sp.lineCells[v_L];
          for (let _i325 = 0; _i325 < _a324.length; _i325++) {
            const v_x = _a324[_i325];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g320.push(v_x);
          }
        }
        _g326.length = 0;
        G327: {
          _g336.length = 0;
          G337: {
            const _a340 = sp.lineCells[v_K];
            for (let _i341 = 0; _i341 < _a340.length; _i341++) {
              const v_x = _a340[_i341];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g336.push(v_x);
            }
          }
          const _a342 = _g336;
          for (let _i343 = 0; _i343 < _a342.length; _i343++) {
            const v_x = _a342[_i343];
            if (!(_h346)) continue;
            _g326.push(v_x);
          }
        }
        L347: {
          const v_W = union(_g320, _g326);
          const _t348 = setOf(v_c);
          _g349.length = 0;
          lastShip_st355.pass++;
          G350: {
            const _a356 = _t348;
            for (let _i357 = 0; _i357 < _a356.length; _i357++) {
              const v_a = _a356[_i357];
              const _a358 = sp.adj8[v_a];
              for (let _i359 = 0; _i359 < _a358.length; _i359++) {
                const v_d = _a358[_i359];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t360 = v_d;
                if (_g349.length < 16) { if (!_g349.includes(_t360)) _g349.push(_t360); } else addOnce(_g349, lastShip_st355, _t360);
              }
            }
          }
          const _t361 = union(v_W, _g349);
          const _h521 = union(_t348, _t361);
          let _q362 = false;
          Q363: {
            const _a364 = _t348;
            for (let _i365 = 0; _i365 < _a364.length; _i365++) {
              const v_a = _a364[_i365];
              const _a366 = sp.adj8[v_a];
              for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                const v_b = _a366[_i367];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t348.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q362 = true;
                  break Q363;
                }
              }
            }
          }
          let _c396: boolean = _q362;
          if (!_c396) {
            let _q368 = false;
            Q369: {
              _g370.length = 0;
              lastShip_st377.pass++;
              G371: {
                const _a378 = union(_t348, _t361);
                for (let _i379 = 0; _i379 < _a378.length; _i379++) {
                  const v_a = _a378[_i379];
                  const _t380 = sp.rowOf[v_a];
                  const _t381 = sp.colOf[v_a];
                  for (let _i382 = 0; _i382 < 2; _i382++) {
                    const v_M = _i382 === 0 ? _t380 : _t381;
                    if (_i382 === 1 && (v_M === _t380)) continue;
                    const _t383 = v_M;
                    if (_g370.length < 16) { if (!_g370.includes(_t383)) _g370.push(_t383); } else addOnce(_g370, lastShip_st377, _t383);
                  }
                }
              }
              const _a384 = _g370;
              for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                const v_L = _a384[_i385];
                L386: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L386;
                  let _g387 = 0;
                  G388: {
                    const _a389 = sp.lineCells[v_L];
                    for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                      const v_x = _a389[_i390];
                      if (!(((_t348.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g387++;
                    }
                  }
                  let _c395: boolean = (_g387 > v_v);
                  if (!_c395) {
                    let _g391 = 0;
                    G392: {
                      const _a393 = sp.lineCells[v_L];
                      for (let _i394 = 0; _i394 < _a393.length; _i394++) {
                        const v_x = _a393[_i394];
                        if (!((!(_t361.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g391++;
                      }
                    }
                    _c395 = (_g391 < v_v);
                  }
                  if (_c395) {
                    _q368 = true;
                    break Q369;
                  }
                }
              }
            }
            _c396 = _q368;
          }
          let _c403: boolean = _c396;
          if (!_c403) {
            let _g397 = 0;
            G398: {
              const _a399 = sp.cells;
              for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                const v_x = _a399[_i400];
                if (!(((_t348.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g397++;
              }
            }
            let _g401 = 0;
            G402: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g401 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c403 = (_g397 > _g401);
          }
          let _c410: boolean = _c403;
          if (!_c410) {
            let _g404 = 0;
            G405: {
              const _a406 = sp.cells;
              for (let _i407 = 0; _i407 < _a406.length; _i407++) {
                const v_x = _a406[_i407];
                if (!((!(_t361.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g404++;
              }
            }
            let _g408 = 0;
            G409: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g408 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c410 = (_g404 < _g408);
          }
          let _c424: boolean = _c410;
          if (!_c424) {
            let _q411 = false;
            Q412: {
              const _a413 = _t348;
              for (let _i414 = 0; _i414 < _a413.length; _i414++) {
                const v_a = _a413[_i414];
                const _t415 = sp.rowOf[v_a];
                const _t416 = sp.colOf[v_a];
                for (let _i417 = 0; _i417 < 2; _i417++) {
                  const v_L = _i417 === 0 ? _t415 : _t416;
                  if (_i417 === 1 && (v_L === _t415)) continue;
                  _g418.length = 0;
                  G419: {
                    const _a422 = sp.lineCells[v_L];
                    for (let _i423 = 0; _i423 < _a422.length; _i423++) {
                      const v_x = _a422[_i423];
                      if (!(((_t348.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g418.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g418).length > v_T)) {
                    _q411 = true;
                    break Q412;
                  }
                }
              }
            }
            _c424 = _q411;
          }
          let _c612: boolean = _c424;
          if (!_c612) {
            let _q425 = false;
            Q426: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g427.length = 0;
                lastShip_st513.pass++;
                G428: {
                  _g514.length = 0;
                  lastShip_st520.pass++;
                  G515: {
                    const _a522 = _h521;
                    for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                      const v_x = _a522[_i523];
                      const _a524 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i525 = 0; _i525 < _a524.length; _i525++) {
                        const v_y = _a524[_i525];
                        const _t526 = v_y;
                        if (_g514.length < 16) { if (!_g514.includes(_t526)) _g514.push(_t526); } else addOnce(_g514, lastShip_st520, _t526);
                      }
                    }
                  }
                  const _a527 = _g514;
                  for (let _i528 = 0; _i528 < _a527.length; _i528++) {
                    const v_a = _a527[_i528];
                    if (!(((_t348.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t529 = sp.rowOf[v_a];
                    const _t530 = sp.colOf[v_a];
                    for (let _i531 = 0; _i531 < 2; _i531++) {
                      const v_L = _i531 === 0 ? _t529 : _t530;
                      if (_i531 === 1 && (v_L === _t529)) continue;
                      _g532.length = 0;
                      G533: {
                        const _a536 = sp.lineCells[v_L];
                        for (let _i537 = 0; _i537 < _a536.length; _i537++) {
                          const v_x = _a536[_i537];
                          if (!(((_t348.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g532.push(v_x);
                        }
                      }
                      L538: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g532);
                        const _h539 = v_G.length;
                        const _h570 = (_h539 === 1);
                        let _c573: boolean = (_h539 === v_m);
                        if (_c573) {
                          let _q540 = true;
                          Q541: {
                            _g542.length = 0;
                            G543: {
                              _g556.length = 0;
                              lastShip_st562.pass++;
                              G557: {
                                const _a563 = v_G;
                                for (let _i564 = 0; _i564 < _a563.length; _i564++) {
                                  const v_g = _a563[_i564];
                                  const _a565 = sp.adj4[v_g];
                                  for (let _i566 = 0; _i566 < _a565.length; _i566++) {
                                    const v_z = _a565[_i566];
                                    const _t567 = v_z;
                                    if (_g556.length < 16) { if (!_g556.includes(_t567)) _g556.push(_t567); } else addOnce(_g556, lastShip_st562, _t567);
                                  }
                                }
                              }
                              const _a568 = _g556;
                              for (let _i569 = 0; _i569 < _a568.length; _i569++) {
                                const v_y = _a568[_i569];
                                if (!((!(v_G.includes(v_y)) && (_h570 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g542.push(v_y);
                              }
                            }
                            const _a571 = _g542;
                            for (let _i572 = 0; _i572 < _a571.length; _i572++) {
                              const v_y = _a571[_i572];
                              if (!(((_t361.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q540 = false;
                                break Q541;
                              }
                            }
                          }
                          _c573 = _q540;
                        }
                        let _c606: boolean = _c573;
                        if (_c606) {
                          let _q574 = false;
                          Q575: {
                            _g576.length = 0;
                            G577: {
                              _g590.length = 0;
                              lastShip_st596.pass++;
                              G591: {
                                const _a597 = v_G;
                                for (let _i598 = 0; _i598 < _a597.length; _i598++) {
                                  const v_g = _a597[_i598];
                                  const _a599 = sp.adj4[v_g];
                                  for (let _i600 = 0; _i600 < _a599.length; _i600++) {
                                    const v_z = _a599[_i600];
                                    const _t601 = v_z;
                                    if (_g590.length < 16) { if (!_g590.includes(_t601)) _g590.push(_t601); } else addOnce(_g590, lastShip_st596, _t601);
                                  }
                                }
                              }
                              const _a602 = _g590;
                              for (let _i603 = 0; _i603 < _a602.length; _i603++) {
                                const v_y = _a602[_i603];
                                if (!((!(v_G.includes(v_y)) && (_h570 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g576.push(v_y);
                              }
                            }
                            const _a604 = union(v_G, _g576);
                            for (let _i605 = 0; _i605 < _a604.length; _i605++) {
                              const v_x = _a604[_i605];
                              if (((_t348.includes(v_x)) || (_t361.includes(v_x)))) {
                                _q574 = true;
                                break Q575;
                              }
                            }
                          }
                          _c606 = _q574;
                        }
                        if (!(_c606)) break L538;
                        const _t607 = (v_G[0] ?? -1);
                        const _t608 = _t607;
                        if (_g427.length < 16) { if (!_g427.includes(_t608)) _g427.push(_t608); } else addOnce(_g427, lastShip_st513, _t608);
                      }
                    }
                  }
                }
                L609: {
                  const v_C = _g427;
                  const _h610 = v_C.length;
                  if (!((_h610 > 0))) break L609;
                  if ((_h610 > ((_k611[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q425 = true;
                    break Q426;
                  }
                }
              }
            }
            _c612 = _q425;
          }
          if (!(_c612)) break L347;
          if (b.made[0] !== _m909_0 || b.made[1] !== _m910_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c618: boolean = (v_v >= 0);
            if (_c618) {
              const _t613 = sp.lineCells[v_L];
              let _g614 = 0;
              G615: {
                const _a616 = _t613;
                for (let _i617 = 0; _i617 < _a616.length; _i617++) {
                  const v_c = _a616[_i617];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g614++;
                }
              }
              _c618 = ((v_v - _g614) === 1);
            }
            if (!(_c618)) { continue R1; }
          }
          if (DEV && staleChecking) {
            let _g619 = -1;
            G620: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > 0))) continue;
                const _t621 = cl.fleet.length[v_k];
                if (_g619 === -1 || _t621 > _g619) _g619 = _t621;
              }
            }
            let _c627: boolean = (v_v >= 0);
            if (_c627) {
              const _t622 = sp.lineCells[v_L];
              let _g623 = 0;
              G624: {
                const _a625 = _t622;
                for (let _i626 = 0; _i626 < _a625.length; _i626++) {
                  const v_c = _a625[_i626];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g623++;
                }
              }
              _c627 = ((v_v - _g623) === 1);
            }
            const _t628 = sp.lineCells[v_K];
            let _g629 = 0;
            G630: {
              const _a631 = _t628;
              for (let _i632 = 0; _i632 < _a631.length; _i632++) {
                const v_c = _a631[_i632];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g629++;
              }
            }
            const _g633: number[] = [];
            G634: {
              const _a637 = sp.lineCells[v_L];
              for (let _i638 = 0; _i638 < _a637.length; _i638++) {
                const v_x = _a637[_i638];
                if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                _g633.push(v_x);
              }
            }
            const _g639: number[] = [];
            G640: {
              const _g649: number[] = [];
              G650: {
                const _a653 = sp.lineCells[v_K];
                for (let _i654 = 0; _i654 < _a653.length; _i654++) {
                  const v_x = _a653[_i654];
                  if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                  _g649.push(v_x);
                }
              }
              const _a655 = _g649;
              for (let _i656 = 0; _i656 < _a655.length; _i656++) {
                const v_x = _a655[_i656];
                if (!(((v_j >= 0) && (v_u === 1)))) continue;
                _g639.push(v_x);
              }
            }
            const _t657 = setOf(v_c);
            const _g658: number[] = [];
            G659: {
              const _a664 = _t657;
              for (let _i665 = 0; _i665 < _a664.length; _i665++) {
                const v_a = _a664[_i665];
                const _a666 = sp.adj8[v_a];
                for (let _i667 = 0; _i667 < _a666.length; _i667++) {
                  const v_d = _a666[_i667];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g658.includes(v_d)) _g658.push(v_d);
                }
              }
            }
            const _t668 = union(v_W, _g658);
            let _q669 = false;
            Q670: {
              const _a671 = _t657;
              for (let _i672 = 0; _i672 < _a671.length; _i672++) {
                const v_a = _a671[_i672];
                const _a673 = sp.adj8[v_a];
                for (let _i674 = 0; _i674 < _a673.length; _i674++) {
                  const v_b = _a673[_i674];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((_t657.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q669 = true;
                    break Q670;
                  }
                }
              }
            }
            let _c701: boolean = _q669;
            if (!_c701) {
              let _q675 = false;
              Q676: {
                const _g677: number[] = [];
                G678: {
                  const _a684 = union(_t657, _t668);
                  for (let _i685 = 0; _i685 < _a684.length; _i685++) {
                    const v_a = _a684[_i685];
                    const _t686 = sp.rowOf[v_a];
                    const _t687 = sp.colOf[v_a];
                    for (let _i688 = 0; _i688 < 2; _i688++) {
                      const v_M = _i688 === 0 ? _t686 : _t687;
                      if (_i688 === 1 && (v_M === _t686)) continue;
                      if (!_g677.includes(v_M)) _g677.push(v_M);
                    }
                  }
                }
                const _a689 = _g677;
                for (let _i690 = 0; _i690 < _a689.length; _i690++) {
                  const v_L = _a689[_i690];
                  L691: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L691;
                    let _g692 = 0;
                    G693: {
                      const _a694 = sp.lineCells[v_L];
                      for (let _i695 = 0; _i695 < _a694.length; _i695++) {
                        const v_x = _a694[_i695];
                        if (!(((_t657.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g692++;
                      }
                    }
                    let _c700: boolean = (_g692 > v_v);
                    if (!_c700) {
                      let _g696 = 0;
                      G697: {
                        const _a698 = sp.lineCells[v_L];
                        for (let _i699 = 0; _i699 < _a698.length; _i699++) {
                          const v_x = _a698[_i699];
                          if (!((!(_t668.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g696++;
                        }
                      }
                      _c700 = (_g696 < v_v);
                    }
                    if (_c700) {
                      _q675 = true;
                      break Q676;
                    }
                  }
                }
              }
              _c701 = _q675;
            }
            let _c708: boolean = _c701;
            if (!_c708) {
              let _g702 = 0;
              G703: {
                const _a704 = sp.cells;
                for (let _i705 = 0; _i705 < _a704.length; _i705++) {
                  const v_x = _a704[_i705];
                  if (!(((_t657.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g702++;
                }
              }
              let _g706 = 0;
              G707: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g706 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c708 = (_g702 > _g706);
            }
            let _c715: boolean = _c708;
            if (!_c715) {
              let _g709 = 0;
              G710: {
                const _a711 = sp.cells;
                for (let _i712 = 0; _i712 < _a711.length; _i712++) {
                  const v_x = _a711[_i712];
                  if (!((!(_t668.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g709++;
                }
              }
              let _g713 = 0;
              G714: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g713 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c715 = (_g709 < _g713);
            }
            let _c729: boolean = _c715;
            if (!_c729) {
              let _q716 = false;
              Q717: {
                const _a718 = _t657;
                for (let _i719 = 0; _i719 < _a718.length; _i719++) {
                  const v_a = _a718[_i719];
                  const _t720 = sp.rowOf[v_a];
                  const _t721 = sp.colOf[v_a];
                  for (let _i722 = 0; _i722 < 2; _i722++) {
                    const v_L = _i722 === 0 ? _t720 : _t721;
                    if (_i722 === 1 && (v_L === _t720)) continue;
                    const _g723: number[] = [];
                    G724: {
                      const _a727 = sp.lineCells[v_L];
                      for (let _i728 = 0; _i728 < _a727.length; _i728++) {
                        const v_x = _a727[_i728];
                        if (!(((_t657.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g723.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g723).length > v_T)) {
                      _q716 = true;
                      break Q717;
                    }
                  }
                }
              }
              _c729 = _q716;
            }
            let _c904: boolean = _c729;
            if (!_c904) {
              let _q730 = false;
              Q731: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g732: number[] = [];
                  G733: {
                    const _g818: number[] = [];
                    G819: {
                      const _a824 = union(_t657, _t668);
                      for (let _i825 = 0; _i825 < _a824.length; _i825++) {
                        const v_x = _a824[_i825];
                        const _a826 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i827 = 0; _i827 < _a826.length; _i827++) {
                          const v_y = _a826[_i827];
                          if (!_g818.includes(v_y)) _g818.push(v_y);
                        }
                      }
                    }
                    const _a828 = _g818;
                    for (let _i829 = 0; _i829 < _a828.length; _i829++) {
                      const v_a = _a828[_i829];
                      if (!(((_t657.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t830 = sp.rowOf[v_a];
                      const _t831 = sp.colOf[v_a];
                      for (let _i832 = 0; _i832 < 2; _i832++) {
                        const v_L = _i832 === 0 ? _t830 : _t831;
                        if (_i832 === 1 && (v_L === _t830)) continue;
                        const _g833: number[] = [];
                        G834: {
                          const _a837 = sp.lineCells[v_L];
                          for (let _i838 = 0; _i838 < _a837.length; _i838++) {
                            const v_x = _a837[_i838];
                            if (!(((_t657.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g833.push(v_x);
                          }
                        }
                        L839: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g833);
                          let _c870: boolean = (v_G.length === v_m);
                          if (_c870) {
                            let _q840 = true;
                            Q841: {
                              const _g842: number[] = [];
                              G843: {
                                const _g856: number[] = [];
                                G857: {
                                  const _a862 = v_G;
                                  for (let _i863 = 0; _i863 < _a862.length; _i863++) {
                                    const v_g = _a862[_i863];
                                    const _a864 = sp.adj4[v_g];
                                    for (let _i865 = 0; _i865 < _a864.length; _i865++) {
                                      const v_z = _a864[_i865];
                                      if (!_g856.includes(v_z)) _g856.push(v_z);
                                    }
                                  }
                                }
                                const _a866 = _g856;
                                for (let _i867 = 0; _i867 < _a866.length; _i867++) {
                                  const v_y = _a866[_i867];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g842.push(v_y);
                                }
                              }
                              const _a868 = _g842;
                              for (let _i869 = 0; _i869 < _a868.length; _i869++) {
                                const v_y = _a868[_i869];
                                if (!(((_t668.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q840 = false;
                                  break Q841;
                                }
                              }
                            }
                            _c870 = _q840;
                          }
                          let _c901: boolean = _c870;
                          if (_c901) {
                            let _q871 = false;
                            Q872: {
                              const _g873: number[] = [];
                              G874: {
                                const _g887: number[] = [];
                                G888: {
                                  const _a893 = v_G;
                                  for (let _i894 = 0; _i894 < _a893.length; _i894++) {
                                    const v_g = _a893[_i894];
                                    const _a895 = sp.adj4[v_g];
                                    for (let _i896 = 0; _i896 < _a895.length; _i896++) {
                                      const v_z = _a895[_i896];
                                      if (!_g887.includes(v_z)) _g887.push(v_z);
                                    }
                                  }
                                }
                                const _a897 = _g887;
                                for (let _i898 = 0; _i898 < _a897.length; _i898++) {
                                  const v_y = _a897[_i898];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g873.push(v_y);
                                }
                              }
                              const _a899 = union(v_G, _g873);
                              for (let _i900 = 0; _i900 < _a899.length; _i900++) {
                                const v_x = _a899[_i900];
                                if (((_t657.includes(v_x)) || (_t668.includes(v_x)))) {
                                  _q871 = true;
                                  break Q872;
                                }
                              }
                            }
                            _c901 = _q871;
                          }
                          if (!(_c901)) break L839;
                          const _t902 = (v_G[0] ?? -1);
                          if (!_g732.includes(_t902)) _g732.push(_t902);
                        }
                      }
                    }
                  }
                  L903: {
                    const v_C = _g732;
                    if (!((v_C.length > 0))) break L903;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q730 = true;
                      break Q731;
                    }
                  }
                }
              }
              _c904 = _q730;
            }
            freshBinding("lastShip", [(v_T === _g619), (sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), _c627, (sp.lineCells[v_L].includes(v_c)), !((b.grid[v_c] !== 0)), (v_K === crossing(sp, v_L, v_c)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_u === (v_j - _g629)), sameSet(v_W, union(_g633, _g639)), _c904], ["T =", "L in", "v =", "where of v", "c in", "where of c", "K =", "j =", "u =", "W =", "where of W"]);
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null) {
              let _g905 = 0;
              G906: {
                const _a907 = v_W;
                for (let _i908 = 0; _i908 < _a907.length; _i908++) {
                  const v_x = _a907[_i908];
                  if (!(!(sp.lineCells[v_L].includes(v_x)))) continue;
                  _g905++;
                }
              }
              const _says = { terms: { horizontal: !((((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w))), crossing: (_g905 > 0) }, marks: {  } };
              if (!fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, u: v_u, W: v_W.slice() }, facts, _says)) return 1;
            }
            cands.fill(-1);
            numMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterTrialBinding {
  T: number;
  c: number;
  L: number;
  S: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CenterTrialSays {
  terms: { center: number; vertical: boolean; };
  marks: { outline: readonly number[]; };
}

const centerTrialFacts: number[] = [];
let centerTrialCands = new Int32Array(0);
const centerTrial_st309 = stamps();
const centerTrial_st331 = stamps();
const centerTrial_st467 = stamps();
const centerTrial_st474 = stamps();
const centerTrial_st516 = stamps();
const centerTrial_st550 = stamps();

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding, CenterTrialSays> | null): number {
  const _g284: number[] = [];
  const _g297: number[] = [];
  const _g303: number[] = [];
  const _g324: number[] = [];
  const _g372: number[] = [];
  const _g381: number[] = [];
  const _g468: number[] = [];
  const _g486: number[] = [];
  const _g496: number[] = [];
  const _g510: number[] = [];
  const _g530: number[] = [];
  const _g544: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  const _k565 = boatsOfKept.board(cl);
  if (centerTrialCands.length < sp.cells.length) centerTrialCands = new Int32Array(sp.cells.length);
  const cands = centerTrialCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g275 = -1;
  G276: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t277 = cl.fleet.length[v_k];
      if (_g275 === -1 || _t277 > _g275) _g275 = _t277;
    }
  }
  const v_T = _g275;
  const _a278 = cluesValued(cl.seg, 6);
  for (let _i279 = 0; _i279 < _a278.length; _i279++) {
    const v_c = _a278[_i279];
    const _h280 = clueAt(cl.seg, v_c);
    if (!((_h280 === 6))) continue;
    const _t281 = sp.rowOf[v_c];
    const _t282 = sp.colOf[v_c];
    for (let _i283 = 0; _i283 < 2; _i283++) {
      const v_L = _i283 === 0 ? _t281 : _t282;
      if (_i283 === 1 && (v_L === _t281)) continue;
      _g284.length = 0;
      G285: {
        const _a288 = sp.adj4[v_c];
        for (let _i289 = 0; _i289 < _a288.length; _i289++) {
          const v_x = _a288[_i289];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g284.push(v_x);
        }
      }
      L290: {
        const v_S = _g284;
        const _h291 = v_S.length;
        let _c296: boolean = (_h291 === 2);
        if (_c296) {
          let _q292 = false;
          Q293: {
            const _a294 = v_S;
            for (let _i295 = 0; _i295 < _a294.length; _i295++) {
              const v_x = _a294[_i295];
              if (!((b.grid[v_x] !== 0))) {
                _q292 = true;
                break Q293;
              }
            }
          }
          _c296 = _q292;
        }
        let _c567: boolean = _c296;
        if (_c567) {
          _g297.length = 0;
          G298: {
            const _a301 = v_S;
            for (let _i302 = 0; _i302 < _a301.length; _i302++) {
              const v_x = _a301[_i302];
              if (!((v_x !== v_x))) continue;
              _g297.push(v_x);
            }
          }
          _g303.length = 0;
          centerTrial_st309.pass++;
          G304: {
            const _a310 = v_S;
            for (let _i311 = 0; _i311 < _a310.length; _i311++) {
              const v_a = _a310[_i311];
              const _a312 = sp.adj8[v_a];
              for (let _i313 = 0; _i313 < _a312.length; _i313++) {
                const v_d = _a312[_i313];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t314 = v_d;
                if (_g303.length < 16) { if (!_g303.includes(_t314)) _g303.push(_t314); } else addOnce(_g303, centerTrial_st309, _t314);
              }
            }
          }
          const _t315 = union(_g297, _g303);
          const _h475 = union(v_S, _t315);
          let _q316 = false;
          Q317: {
            const _a318 = v_S;
            for (let _i319 = 0; _i319 < _a318.length; _i319++) {
              const v_a = _a318[_i319];
              const _a320 = sp.adj8[v_a];
              for (let _i321 = 0; _i321 < _a320.length; _i321++) {
                const v_b = _a320[_i321];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q316 = true;
                  break Q317;
                }
              }
            }
          }
          let _c350: boolean = _q316;
          if (!_c350) {
            let _q322 = false;
            Q323: {
              _g324.length = 0;
              centerTrial_st331.pass++;
              G325: {
                const _a332 = union(v_S, _t315);
                for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                  const v_a = _a332[_i333];
                  const _t334 = sp.rowOf[v_a];
                  const _t335 = sp.colOf[v_a];
                  for (let _i336 = 0; _i336 < 2; _i336++) {
                    const v_M = _i336 === 0 ? _t334 : _t335;
                    if (_i336 === 1 && (v_M === _t334)) continue;
                    const _t337 = v_M;
                    if (_g324.length < 16) { if (!_g324.includes(_t337)) _g324.push(_t337); } else addOnce(_g324, centerTrial_st331, _t337);
                  }
                }
              }
              const _a338 = _g324;
              for (let _i339 = 0; _i339 < _a338.length; _i339++) {
                const v_L = _a338[_i339];
                L340: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L340;
                  let _g341 = 0;
                  G342: {
                    const _a343 = sp.lineCells[v_L];
                    for (let _i344 = 0; _i344 < _a343.length; _i344++) {
                      const v_x = _a343[_i344];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g341++;
                    }
                  }
                  let _c349: boolean = (_g341 > v_v);
                  if (!_c349) {
                    let _g345 = 0;
                    G346: {
                      const _a347 = sp.lineCells[v_L];
                      for (let _i348 = 0; _i348 < _a347.length; _i348++) {
                        const v_x = _a347[_i348];
                        if (!((!(_t315.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g345++;
                      }
                    }
                    _c349 = (_g345 < v_v);
                  }
                  if (_c349) {
                    _q322 = true;
                    break Q323;
                  }
                }
              }
            }
            _c350 = _q322;
          }
          let _c357: boolean = _c350;
          if (!_c357) {
            let _g351 = 0;
            G352: {
              const _a353 = sp.cells;
              for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                const v_x = _a353[_i354];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g351++;
              }
            }
            let _g355 = 0;
            G356: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g355 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c357 = (_g351 > _g355);
          }
          let _c364: boolean = _c357;
          if (!_c364) {
            let _g358 = 0;
            G359: {
              const _a360 = sp.cells;
              for (let _i361 = 0; _i361 < _a360.length; _i361++) {
                const v_x = _a360[_i361];
                if (!((!(_t315.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g358++;
              }
            }
            let _g362 = 0;
            G363: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g362 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c364 = (_g358 < _g362);
          }
          let _c378: boolean = _c364;
          if (!_c378) {
            let _q365 = false;
            Q366: {
              const _a367 = v_S;
              for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                const v_a = _a367[_i368];
                const _t369 = sp.rowOf[v_a];
                const _t370 = sp.colOf[v_a];
                for (let _i371 = 0; _i371 < 2; _i371++) {
                  const v_L = _i371 === 0 ? _t369 : _t370;
                  if (_i371 === 1 && (v_L === _t369)) continue;
                  _g372.length = 0;
                  G373: {
                    const _a376 = sp.lineCells[v_L];
                    for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                      const v_x = _a376[_i377];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g372.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g372).length > v_T)) {
                    _q365 = true;
                    break Q366;
                  }
                }
              }
            }
            _c378 = _q365;
          }
          let _c566: boolean = _c378;
          if (!_c566) {
            let _q379 = false;
            Q380: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g381.length = 0;
                centerTrial_st467.pass++;
                G382: {
                  _g468.length = 0;
                  centerTrial_st474.pass++;
                  G469: {
                    const _a476 = _h475;
                    for (let _i477 = 0; _i477 < _a476.length; _i477++) {
                      const v_x = _a476[_i477];
                      const _a478 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i479 = 0; _i479 < _a478.length; _i479++) {
                        const v_y = _a478[_i479];
                        const _t480 = v_y;
                        if (_g468.length < 16) { if (!_g468.includes(_t480)) _g468.push(_t480); } else addOnce(_g468, centerTrial_st474, _t480);
                      }
                    }
                  }
                  const _a481 = _g468;
                  for (let _i482 = 0; _i482 < _a481.length; _i482++) {
                    const v_a = _a481[_i482];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t483 = sp.rowOf[v_a];
                    const _t484 = sp.colOf[v_a];
                    for (let _i485 = 0; _i485 < 2; _i485++) {
                      const v_L = _i485 === 0 ? _t483 : _t484;
                      if (_i485 === 1 && (v_L === _t483)) continue;
                      _g486.length = 0;
                      G487: {
                        const _a490 = sp.lineCells[v_L];
                        for (let _i491 = 0; _i491 < _a490.length; _i491++) {
                          const v_x = _a490[_i491];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g486.push(v_x);
                        }
                      }
                      L492: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g486);
                        const _h493 = v_G.length;
                        const _h524 = (_h493 === 1);
                        let _c527: boolean = (_h493 === v_m);
                        if (_c527) {
                          let _q494 = true;
                          Q495: {
                            _g496.length = 0;
                            G497: {
                              _g510.length = 0;
                              centerTrial_st516.pass++;
                              G511: {
                                const _a517 = v_G;
                                for (let _i518 = 0; _i518 < _a517.length; _i518++) {
                                  const v_g = _a517[_i518];
                                  const _a519 = sp.adj4[v_g];
                                  for (let _i520 = 0; _i520 < _a519.length; _i520++) {
                                    const v_z = _a519[_i520];
                                    const _t521 = v_z;
                                    if (_g510.length < 16) { if (!_g510.includes(_t521)) _g510.push(_t521); } else addOnce(_g510, centerTrial_st516, _t521);
                                  }
                                }
                              }
                              const _a522 = _g510;
                              for (let _i523 = 0; _i523 < _a522.length; _i523++) {
                                const v_y = _a522[_i523];
                                if (!((!(v_G.includes(v_y)) && (_h524 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g496.push(v_y);
                              }
                            }
                            const _a525 = _g496;
                            for (let _i526 = 0; _i526 < _a525.length; _i526++) {
                              const v_y = _a525[_i526];
                              if (!(((_t315.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q494 = false;
                                break Q495;
                              }
                            }
                          }
                          _c527 = _q494;
                        }
                        let _c560: boolean = _c527;
                        if (_c560) {
                          let _q528 = false;
                          Q529: {
                            _g530.length = 0;
                            G531: {
                              _g544.length = 0;
                              centerTrial_st550.pass++;
                              G545: {
                                const _a551 = v_G;
                                for (let _i552 = 0; _i552 < _a551.length; _i552++) {
                                  const v_g = _a551[_i552];
                                  const _a553 = sp.adj4[v_g];
                                  for (let _i554 = 0; _i554 < _a553.length; _i554++) {
                                    const v_z = _a553[_i554];
                                    const _t555 = v_z;
                                    if (_g544.length < 16) { if (!_g544.includes(_t555)) _g544.push(_t555); } else addOnce(_g544, centerTrial_st550, _t555);
                                  }
                                }
                              }
                              const _a556 = _g544;
                              for (let _i557 = 0; _i557 < _a556.length; _i557++) {
                                const v_y = _a556[_i557];
                                if (!((!(v_G.includes(v_y)) && (_h524 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g530.push(v_y);
                              }
                            }
                            const _a558 = union(v_G, _g530);
                            for (let _i559 = 0; _i559 < _a558.length; _i559++) {
                              const v_x = _a558[_i559];
                              if (((v_S.includes(v_x)) || (_t315.includes(v_x)))) {
                                _q528 = true;
                                break Q529;
                              }
                            }
                          }
                          _c560 = _q528;
                        }
                        if (!(_c560)) break L492;
                        const _t561 = (v_G[0] ?? -1);
                        const _t562 = _t561;
                        if (_g381.length < 16) { if (!_g381.includes(_t562)) _g381.push(_t562); } else addOnce(_g381, centerTrial_st467, _t562);
                      }
                    }
                  }
                }
                L563: {
                  const v_C = _g381;
                  const _h564 = v_C.length;
                  if (!((_h564 > 0))) break L563;
                  if ((_h564 > ((_k565[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q379 = true;
                    break Q380;
                  }
                }
              }
            }
            _c566 = _q379;
          }
          _c567 = _c566;
        }
        if (!(_c567)) break L290;
        if (DEV && staleChecking) {
          let _g568 = -1;
          G569: {
            for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
              if (!((cl.fleet.boats[v_k] > 0))) continue;
              const _t570 = cl.fleet.length[v_k];
              if (_g568 === -1 || _t570 > _g568) _g568 = _t570;
            }
          }
          const _g571: number[] = [];
          G572: {
            const _a575 = sp.adj4[v_c];
            for (let _i576 = 0; _i576 < _a575.length; _i576++) {
              const v_x = _a575[_i576];
              if (!((sp.lineCells[v_L].includes(v_x)))) continue;
              _g571.push(v_x);
            }
          }
          let _c581: boolean = (v_S.length === 2);
          if (_c581) {
            let _q577 = false;
            Q578: {
              const _a579 = v_S;
              for (let _i580 = 0; _i580 < _a579.length; _i580++) {
                const v_x = _a579[_i580];
                if (!((b.grid[v_x] !== 0))) {
                  _q577 = true;
                  break Q578;
                }
              }
            }
            _c581 = _q577;
          }
          let _c835: boolean = _c581;
          if (_c835) {
            const _g582: number[] = [];
            G583: {
              const _a586 = v_S;
              for (let _i587 = 0; _i587 < _a586.length; _i587++) {
                const v_x = _a586[_i587];
                if (!((v_x !== v_x))) continue;
                _g582.push(v_x);
              }
            }
            const _g588: number[] = [];
            G589: {
              const _a594 = v_S;
              for (let _i595 = 0; _i595 < _a594.length; _i595++) {
                const v_a = _a594[_i595];
                const _a596 = sp.adj8[v_a];
                for (let _i597 = 0; _i597 < _a596.length; _i597++) {
                  const v_d = _a596[_i597];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g588.includes(v_d)) _g588.push(v_d);
                }
              }
            }
            const _t598 = union(_g582, _g588);
            let _q599 = false;
            Q600: {
              const _a601 = v_S;
              for (let _i602 = 0; _i602 < _a601.length; _i602++) {
                const v_a = _a601[_i602];
                const _a603 = sp.adj8[v_a];
                for (let _i604 = 0; _i604 < _a603.length; _i604++) {
                  const v_b = _a603[_i604];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q599 = true;
                    break Q600;
                  }
                }
              }
            }
            let _c631: boolean = _q599;
            if (!_c631) {
              let _q605 = false;
              Q606: {
                const _g607: number[] = [];
                G608: {
                  const _a614 = union(v_S, _t598);
                  for (let _i615 = 0; _i615 < _a614.length; _i615++) {
                    const v_a = _a614[_i615];
                    const _t616 = sp.rowOf[v_a];
                    const _t617 = sp.colOf[v_a];
                    for (let _i618 = 0; _i618 < 2; _i618++) {
                      const v_M = _i618 === 0 ? _t616 : _t617;
                      if (_i618 === 1 && (v_M === _t616)) continue;
                      if (!_g607.includes(v_M)) _g607.push(v_M);
                    }
                  }
                }
                const _a619 = _g607;
                for (let _i620 = 0; _i620 < _a619.length; _i620++) {
                  const v_L = _a619[_i620];
                  L621: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L621;
                    let _g622 = 0;
                    G623: {
                      const _a624 = sp.lineCells[v_L];
                      for (let _i625 = 0; _i625 < _a624.length; _i625++) {
                        const v_x = _a624[_i625];
                        if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g622++;
                      }
                    }
                    let _c630: boolean = (_g622 > v_v);
                    if (!_c630) {
                      let _g626 = 0;
                      G627: {
                        const _a628 = sp.lineCells[v_L];
                        for (let _i629 = 0; _i629 < _a628.length; _i629++) {
                          const v_x = _a628[_i629];
                          if (!((!(_t598.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g626++;
                        }
                      }
                      _c630 = (_g626 < v_v);
                    }
                    if (_c630) {
                      _q605 = true;
                      break Q606;
                    }
                  }
                }
              }
              _c631 = _q605;
            }
            let _c638: boolean = _c631;
            if (!_c638) {
              let _g632 = 0;
              G633: {
                const _a634 = sp.cells;
                for (let _i635 = 0; _i635 < _a634.length; _i635++) {
                  const v_x = _a634[_i635];
                  if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g632++;
                }
              }
              let _g636 = 0;
              G637: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g636 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c638 = (_g632 > _g636);
            }
            let _c645: boolean = _c638;
            if (!_c645) {
              let _g639 = 0;
              G640: {
                const _a641 = sp.cells;
                for (let _i642 = 0; _i642 < _a641.length; _i642++) {
                  const v_x = _a641[_i642];
                  if (!((!(_t598.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g639++;
                }
              }
              let _g643 = 0;
              G644: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g643 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c645 = (_g639 < _g643);
            }
            let _c659: boolean = _c645;
            if (!_c659) {
              let _q646 = false;
              Q647: {
                const _a648 = v_S;
                for (let _i649 = 0; _i649 < _a648.length; _i649++) {
                  const v_a = _a648[_i649];
                  const _t650 = sp.rowOf[v_a];
                  const _t651 = sp.colOf[v_a];
                  for (let _i652 = 0; _i652 < 2; _i652++) {
                    const v_L = _i652 === 0 ? _t650 : _t651;
                    if (_i652 === 1 && (v_L === _t650)) continue;
                    const _g653: number[] = [];
                    G654: {
                      const _a657 = sp.lineCells[v_L];
                      for (let _i658 = 0; _i658 < _a657.length; _i658++) {
                        const v_x = _a657[_i658];
                        if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g653.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g653).length > v_T)) {
                      _q646 = true;
                      break Q647;
                    }
                  }
                }
              }
              _c659 = _q646;
            }
            let _c834: boolean = _c659;
            if (!_c834) {
              let _q660 = false;
              Q661: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g662: number[] = [];
                  G663: {
                    const _g748: number[] = [];
                    G749: {
                      const _a754 = union(v_S, _t598);
                      for (let _i755 = 0; _i755 < _a754.length; _i755++) {
                        const v_x = _a754[_i755];
                        const _a756 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i757 = 0; _i757 < _a756.length; _i757++) {
                          const v_y = _a756[_i757];
                          if (!_g748.includes(v_y)) _g748.push(v_y);
                        }
                      }
                    }
                    const _a758 = _g748;
                    for (let _i759 = 0; _i759 < _a758.length; _i759++) {
                      const v_a = _a758[_i759];
                      if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t760 = sp.rowOf[v_a];
                      const _t761 = sp.colOf[v_a];
                      for (let _i762 = 0; _i762 < 2; _i762++) {
                        const v_L = _i762 === 0 ? _t760 : _t761;
                        if (_i762 === 1 && (v_L === _t760)) continue;
                        const _g763: number[] = [];
                        G764: {
                          const _a767 = sp.lineCells[v_L];
                          for (let _i768 = 0; _i768 < _a767.length; _i768++) {
                            const v_x = _a767[_i768];
                            if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g763.push(v_x);
                          }
                        }
                        L769: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g763);
                          let _c800: boolean = (v_G.length === v_m);
                          if (_c800) {
                            let _q770 = true;
                            Q771: {
                              const _g772: number[] = [];
                              G773: {
                                const _g786: number[] = [];
                                G787: {
                                  const _a792 = v_G;
                                  for (let _i793 = 0; _i793 < _a792.length; _i793++) {
                                    const v_g = _a792[_i793];
                                    const _a794 = sp.adj4[v_g];
                                    for (let _i795 = 0; _i795 < _a794.length; _i795++) {
                                      const v_z = _a794[_i795];
                                      if (!_g786.includes(v_z)) _g786.push(v_z);
                                    }
                                  }
                                }
                                const _a796 = _g786;
                                for (let _i797 = 0; _i797 < _a796.length; _i797++) {
                                  const v_y = _a796[_i797];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g772.push(v_y);
                                }
                              }
                              const _a798 = _g772;
                              for (let _i799 = 0; _i799 < _a798.length; _i799++) {
                                const v_y = _a798[_i799];
                                if (!(((_t598.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q770 = false;
                                  break Q771;
                                }
                              }
                            }
                            _c800 = _q770;
                          }
                          let _c831: boolean = _c800;
                          if (_c831) {
                            let _q801 = false;
                            Q802: {
                              const _g803: number[] = [];
                              G804: {
                                const _g817: number[] = [];
                                G818: {
                                  const _a823 = v_G;
                                  for (let _i824 = 0; _i824 < _a823.length; _i824++) {
                                    const v_g = _a823[_i824];
                                    const _a825 = sp.adj4[v_g];
                                    for (let _i826 = 0; _i826 < _a825.length; _i826++) {
                                      const v_z = _a825[_i826];
                                      if (!_g817.includes(v_z)) _g817.push(v_z);
                                    }
                                  }
                                }
                                const _a827 = _g817;
                                for (let _i828 = 0; _i828 < _a827.length; _i828++) {
                                  const v_y = _a827[_i828];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g803.push(v_y);
                                }
                              }
                              const _a829 = union(v_G, _g803);
                              for (let _i830 = 0; _i830 < _a829.length; _i830++) {
                                const v_x = _a829[_i830];
                                if (((v_S.includes(v_x)) || (_t598.includes(v_x)))) {
                                  _q801 = true;
                                  break Q802;
                                }
                              }
                            }
                            _c831 = _q801;
                          }
                          if (!(_c831)) break L769;
                          const _t832 = (v_G[0] ?? -1);
                          if (!_g662.includes(_t832)) _g662.push(_t832);
                        }
                      }
                    }
                  }
                  L833: {
                    const v_C = _g662;
                    if (!((v_C.length > 0))) break L833;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q660 = true;
                      break Q661;
                    }
                  }
                }
              }
              _c834 = _q660;
            }
            _c835 = _c834;
          }
          freshBinding("centerTrial", [(v_T === _g568), (sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), sameSet(v_S, _g571), _c835], ["T =", "c in", "where of c", "L in", "S =", "where of S"]);
        }
        facts.length = 0;
        changed = false;
        let _q836 = true;
        Q837: {
          const _a838 = v_S;
          for (let _i839 = 0; _i839 < _a838.length; _i839++) {
            const v_x = _a838[_i839];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q836 = false;
              break Q837;
            }
          }
        }
        if (!(_q836)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { center: v_c, vertical: (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)) }, marks: { outline: setOf(v_c).slice() } };
            if (!fire({ T: v_T, c: v_c, L: v_L, S: v_S.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          numMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

const closedKept = keptStore<boolean>();

/** `closed(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function closed(b: Marks, sp: GridSpace, v_c: number): boolean {
  const _kept: Kept<boolean> = closedKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _q1 = true;
  Q2: {
    const _t3 = sp.rowOf[v_c];
    const _g4: number[] = [];
    G5: {
      const _a8 = sp.lineCells[_t3];
      for (let _i9 = 0; _i9 < _a8.length; _i9++) {
        const v_x = _a8[_i9];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g4.push(v_x);
      }
    }
    const _t10 = sp.colOf[v_c];
    const _g11: number[] = [];
    G12: {
      const _a15 = sp.lineCells[_t10];
      for (let _i16 = 0; _i16 < _a15.length; _i16++) {
        const v_x = _a15[_i16];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g11.push(v_x);
      }
    }
    const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g4), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g11));
    const _a17 = v_G;
    for (let _i18 = 0; _i18 < _a17.length; _i18++) {
      const v_x = _a17[_i18];
      const _a19 = sp.adj4[v_x];
      for (let _i20 = 0; _i20 < _a19.length; _i20++) {
        const v_y = _a19[_i20];
        let _c28: boolean = !(v_G.includes(v_y));
        if (_c28) {
          const _t21 = sp.rowOf[v_c];
          const _g22: number[] = [];
          G23: {
            const _a26 = sp.lineCells[_t21];
            for (let _i27 = 0; _i27 < _a26.length; _i27++) {
              const v_x = _a26[_i27];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g22.push(v_x);
            }
          }
          _c28 = ((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g22).length === 1) || (sp.lineCells[sp.rowOf[v_c]].includes(v_y)));
        }
        let _c36: boolean = _c28;
        if (_c36) {
          const _t29 = sp.colOf[v_c];
          const _g30: number[] = [];
          G31: {
            const _a34 = sp.lineCells[_t29];
            for (let _i35 = 0; _i35 < _a34.length; _i35++) {
              const v_x = _a34[_i35];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g30.push(v_x);
            }
          }
          _c36 = ((stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g30).length === 1) || (sp.lineCells[sp.colOf[v_c]].includes(v_y)));
        }
        if (!(_c36)) continue;
        if (!(((b.grid[v_y] || -1) === 2))) {
          _q1 = false;
          break Q2;
        }
      }
    }
  }
  const _made = _q1;
  _kept[v_c] = _made;
  return _made;
}

const doneKept = keptStore<number>();

/** `done(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function done(b: Marks, sp: GridSpace, v_m: number): number {
  const _kept: Kept<number> = doneKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g1 = 0;
  G2: {
    const _a3 = cellsValued(b, sp.cells, 1);
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _c6: boolean = ((b.grid[v_c] || -1) === 1);
      if (_c6) {
        const _t5 = step(sp, v_c, 1);
        _c6 = !(((_t5 !== -1) && ((b.grid[_t5] || -1) === 1)));
      }
      let _c8: boolean = _c6;
      if (_c8) {
        const _t7 = step(sp, v_c, 3);
        _c8 = !(((_t7 !== -1) && ((b.grid[_t7] || -1) === 1)));
      }
      let _c23: boolean = _c8;
      if (_c23) {
        const _t9 = sp.rowOf[v_c];
        const _g10: number[] = [];
        G11: {
          const _a14 = sp.lineCells[_t9];
          for (let _i15 = 0; _i15 < _a14.length; _i15++) {
            const v_x = _a14[_i15];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g10.push(v_x);
          }
        }
        const _t16 = sp.colOf[v_c];
        const _g17: number[] = [];
        G18: {
          const _a21 = sp.lineCells[_t16];
          for (let _i22 = 0; _i22 < _a21.length; _i22++) {
            const v_x = _a21[_i22];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g17.push(v_x);
          }
        }
        _c23 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g10), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g17)).length === v_m);
      }
      if (!((_c23 && closed(b, sp, v_c)))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_m] = _made;
  return _made;
}

const fullKept = keptStore<boolean>();

/** `full(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function full(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = fullKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q1 = true;
  Q2: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      if (!((cl.fleet.boats[v_k] <= done(b, sp, v_m)))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  const _made = _q1;
  _kept[v_m] = _made;
  return _made;
}

const boatsOfKept = keptStore<number>();
let boatsOfOn: object | null = null;
let boatsOfAt: Kept<number> = [];

/** `boatsOf(m)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function boatsOf(_sp: GridSpace, cl: Dealt, v_m: number): number {
  if (cl !== boatsOfOn) {
    boatsOfAt = boatsOfKept.board(cl);
    boatsOfOn = cl;
  }
  const _kept: Kept<number> = boatsOfAt;
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g1 = 0;
  G2: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      _g1 += cl.fleet.boats[v_k];
    }
  }
  const _made = _g1;
  _kept[v_m] = _made;
  return _made;
}

const takingKept = keptStore<number>();

/** `taking(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function taking(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = takingKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g1 = 0;
  G2: {
    const _a3 = sp.lines;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_K = _a3[_i4];
      const _a5 = sp.lineCells[v_K];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_d = _a5[_i6];
        let _c11: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c11) {
          let _q7 = false;
          Q8: {
            const _a9 = sp.adj4[v_d];
            for (let _i10 = 0; _i10 < _a9.length; _i10++) {
              const v_p = _a9[_i10];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q7 = true;
                break Q8;
              }
            }
          }
          _c11 = !(_q7);
        }
        let _c34: boolean = _c11;
        if (_c34) {
          const _g12: number[] = [];
          G13: {
            const _a16 = sp.lineCells[v_K];
            for (let _i17 = 0; _i17 < _a16.length; _i17++) {
              const v_x = _a16[_i17];
              if (!(((b.grid[v_x] || -1) !== 2))) continue;
              _g12.push(v_x);
            }
          }
          const _t18 = stretch(sp.lineCells[v_K], v_d, _g12);
          let _g19 = 0;
          G20: {
            const _a21 = _t18;
            for (let _i22 = 0; _i22 < _a21.length; _i22++) {
              const v_c = _a21[_i22];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g19++;
            }
          }
          let _c33: boolean = ((_g19 < _t18.length) && (_t18.length >= v_m));
          if (_c33) {
            let _c32: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c32) {
              const _t23 = sp.lineCells[v_K];
              let _g24 = 0;
              G25: {
                const _a26 = _t23;
                for (let _i27 = 0; _i27 < _a26.length; _i27++) {
                  const v_c = _a26[_i27];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g24++;
                }
              }
              let _g28 = 0;
              G29: {
                const _a30 = _t18;
                for (let _i31 = 0; _i31 < _a30.length; _i31++) {
                  const v_c = _a30[_i31];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g28++;
                }
              }
              _c32 = (((clueAt(cl.n, v_K) - _g24) + _g28) >= v_m);
            }
            _c33 = _c32;
          }
          _c34 = _c33;
        }
        if (!(_c34)) continue;
        _g1++;
      }
    }
  }
  const _made = _g1;
  _kept[v_m] = _made;
  return _made;
}

const parKept = keptStore<readonly number[]>();
let parOn: object | null = null;
let parAt: Kept<readonly number[]> = [];

/** `par(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function par(sp: GridSpace, v_L: number): readonly number[] {
  if (sp !== parOn) {
    parAt = parKept.board(sp);
    parOn = sp;
  }
  const _kept: Kept<readonly number[]> = parAt;
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _g1: number[] = [];
  G2: {
    const _a5 = sp.lines;
    for (let _i6 = 0; _i6 < _a5.length; _i6++) {
      const v_M = _a5[_i6];
      if (!(((v_M !== v_L) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)))))) continue;
      _g1.push(v_M);
    }
  }
  const _made = _g1;
  _kept[v_L] = _made;
  return _made;
}

const recKept = keptStore<number>();

/** `rec(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function rec(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = recKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  let _g1 = -1;
  G2: {
    for (let _i3 = 0; _i3 < 1; _i3++) {
      const v_K = v_L;
      let _c16: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c16) {
        let _q4 = true;
        Q5: {
          const _a6 = par(sp, v_K);
          for (let _i7 = 0; _i7 < _a6.length; _i7++) {
            const v_M = _a6[_i7];
            let _c15: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c15) {
              const _t8 = sp.lineCells[v_M];
              const _g9: number[] = [];
              G10: {
                const _a13 = _t8;
                for (let _i14 = 0; _i14 < _a13.length; _i14++) {
                  const v_c = _a13[_i14];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g9.push(v_c);
                }
              }
              _c15 = (_g9.length === 0);
            }
            if (!(_c15)) {
              _q4 = false;
              break Q5;
            }
          }
        }
        _c16 = _q4;
      }
      if (!(_c16)) continue;
      let _g17 = 0;
      G18: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g17 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g19 = 0;
      G20: {
        const _a21 = par(sp, v_K);
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_M = _a21[_i22];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g19 += clueAt(cl.n, v_M);
        }
      }
      let _g23 = 0;
      G24: {
        const _a25 = par(sp, v_K);
        for (let _i26 = 0; _i26 < _a25.length; _i26++) {
          const v_M = _a25[_i26];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t27 = sp.lineCells[v_M];
          let _g28 = 0;
          G29: {
            const _a30 = _t27;
            for (let _i31 = 0; _i31 < _a30.length; _i31++) {
              const v_c = _a30[_i31];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g28++;
            }
          }
          _g23 += _g28;
        }
      }
      const _t32 = ((_g17 - _g19) - _g23);
      if (_g1 === -1 || _t32 > _g1) _g1 = _t32;
    }
  }
  const _made = _g1;
  _kept[v_L] = _made;
  return _made;
}

const wideKept = keptStore<boolean>();

/** `wide(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function wide(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = wideKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q1 = false;
  Q2: {
    const _a3 = sp.lines;
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_K = _a3[_i4];
      const _a5 = sp.lineCells[v_K];
      for (let _i6 = 0; _i6 < _a5.length; _i6++) {
        const v_d = _a5[_i6];
        let _c11: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c11) {
          let _q7 = false;
          Q8: {
            const _a9 = sp.adj4[v_d];
            for (let _i10 = 0; _i10 < _a9.length; _i10++) {
              const v_p = _a9[_i10];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q7 = true;
                break Q8;
              }
            }
          }
          _c11 = !(_q7);
        }
        if (!(_c11)) continue;
        const _g12: number[] = [];
        G13: {
          const _a16 = sp.lineCells[v_K];
          for (let _i17 = 0; _i17 < _a16.length; _i17++) {
            const v_x = _a16[_i17];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g12.push(v_x);
          }
        }
        L18: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g12);
          let _g19 = 0;
          G20: {
            const _a21 = v_R;
            for (let _i22 = 0; _i22 < _a21.length; _i22++) {
              const v_c = _a21[_i22];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g19++;
            }
          }
          let _c33: boolean = ((_g19 < v_R.length) && (v_R.length >= v_m));
          if (_c33) {
            let _c32: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c32) {
              const _t23 = sp.lineCells[v_K];
              let _g24 = 0;
              G25: {
                const _a26 = _t23;
                for (let _i27 = 0; _i27 < _a26.length; _i27++) {
                  const v_c = _a26[_i27];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g24++;
                }
              }
              let _g28 = 0;
              G29: {
                const _a30 = v_R;
                for (let _i31 = 0; _i31 < _a30.length; _i31++) {
                  const v_c = _a30[_i31];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g28++;
                }
              }
              _c32 = (((clueAt(cl.n, v_K) - _g24) + _g28) >= v_m);
            }
            _c33 = _c32;
          }
          if (!(_c33)) break L18;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q1 = true;
            break Q2;
          }
        }
      }
    }
  }
  const _made = _q1;
  _kept[v_m] = _made;
  return _made;
}

const numMarkedKept = new Map<number, number>();

/** `num(L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function numMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number): number {
  const _was = numMarkedKept.get(v_L);
  if (_was !== undefined) return _was;
  const _made = ((clueAt(cl.n, v_L) + rec(b, sp, cl, v_L)) + 1);
  numMarkedKept.set(v_L, _made);
  return _made;
}

const crossingKept = keptStore<Kept<number>>();
let crossingOn: object | null = null;
let crossingAt: Kept<Kept<number>> = [];

/** `crossing(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function crossing(sp: GridSpace, v_L: number, v_c: number): number {
  if (sp !== crossingOn) {
    crossingAt = crossingKept.board(sp);
    crossingOn = sp;
  }
  const _kept: Kept<Kept<number>> = crossingAt;
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  let _g1 = -1;
  let _n3 = 0;
  G2: {
    const _t4 = sp.rowOf[v_c];
    const _t5 = sp.colOf[v_c];
    for (let _i6 = 0; _i6 < 2; _i6++) {
      const v_M = _i6 === 0 ? _t4 : _t5;
      if (_i6 === 1 && (v_M === _t4)) continue;
      if (!((v_M !== v_L))) continue;
      if (++_n3 === 2) {
        _g1 = -1;
        break G2;
      }
      _g1 = v_M;
    }
  }
  const _made = _g1;
  _kept1[v_c] = _made;
  return _made;
}
