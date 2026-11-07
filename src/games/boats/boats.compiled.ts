// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, rangeMask, setOf, step, stretch, union } from "../../engine/describe-runtime.ts";

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
  const _g9059: number[] = [];
  const _g9067: number[] = [];
  const _g9160: number[] = [];
  const _g9168: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q9035 = true;
  Q9036: {
    const _a9037 = sp.cells;
    for (let _i9038 = 0; _i9038 < _a9037.length; _i9038++) {
      const v_a = _a9037[_i9038];
      const _h9039 = (g[v_a] || -1);
      if (!((_h9039 === 1))) continue;
      let _q9040 = true;
      Q9041: {
        const _a9042 = sp.adj8[v_a];
        for (let _i9043 = 0; _i9043 < _a9042.length; _i9043++) {
          const v_b = _a9042[_i9043];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h9044 = (g[v_b] || -1);
          if (!((_h9044 !== 1))) {
            _q9040 = false;
            break Q9041;
          }
        }
      }
      if (!(_q9040)) {
        _q9035 = false;
        break Q9036;
      }
    }
  }
  if (!(_q9035)) return false;
  let _q9045 = true;
  Q9046: {
    const _a9047 = sp.cells;
    for (let _i9048 = 0; _i9048 < _a9047.length; _i9048++) {
      const v_c = _a9047[_i9048];
      const _h9049 = (g[v_c] || -1);
      let _c9052: boolean = (_h9049 === 1);
      if (_c9052) {
        const _t9050 = step(sp, v_c, 1);
        const _h9051 = (g[_t9050] || -1);
        _c9052 = !(((_t9050 !== -1) && (_h9051 === 1)));
      }
      let _c9055: boolean = _c9052;
      if (_c9055) {
        const _t9053 = step(sp, v_c, 3);
        const _h9054 = (g[_t9053] || -1);
        _c9055 = !(((_t9053 !== -1) && (_h9054 === 1)));
      }
      if (!(_c9055)) continue;
      const _h9058 = sp.rowOf[v_c];
      const _h9066 = sp.colOf[v_c];
      let _q9056 = false;
      Q9057: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g9059.length = 0;
          G9060: {
            const _a9063 = sp.lineCells[_h9058];
            for (let _i9064 = 0; _i9064 < _a9063.length; _i9064++) {
              const v_x = _a9063[_i9064];
              const _h9065 = (g[v_x] || -1);
              if (!((_h9065 === 1))) continue;
              _g9059.push(v_x);
            }
          }
          _g9067.length = 0;
          G9068: {
            const _a9071 = sp.lineCells[_h9066];
            for (let _i9072 = 0; _i9072 < _a9071.length; _i9072++) {
              const v_x = _a9071[_i9072];
              const _h9073 = (g[v_x] || -1);
              if (!((_h9073 === 1))) continue;
              _g9067.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h9058], v_c, _g9059), stretch(sp.lineCells[_h9066], v_c, _g9067)).length)) {
            _q9056 = true;
            break Q9057;
          }
        }
      }
      if (!(_q9056)) {
        _q9045 = false;
        break Q9046;
      }
    }
  }
  if (!(_q9045)) return false;
  let _q9074 = true;
  Q9075: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q9074 = false;
          break Q9075;
        }
      }
    }
  }
  if (!(_q9074)) return false;
  let _g9076 = 0;
  G9077: {
    const _a9078 = sp.cells;
    for (let _i9079 = 0; _i9079 < _a9078.length; _i9079++) {
      const v_c = _a9078[_i9079];
      const _h9080 = (g[v_c] || -1);
      if (!((_h9080 === 1))) continue;
      _g9076++;
    }
  }
  let _g9081 = 0;
  G9082: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g9081 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g9076 === _g9081))) return false;
  for (let _k9083 = 0; _k9083 < cl.n.at.length; _k9083++) {
    const _at9084 = cl.n.at[_k9083];
    const _v9085 = cl.n.v[_k9083];
    const _t9086 = sp.lineCells[_at9084];
    let _g9087 = 0;
    G9088: {
      const _a9089 = _t9086;
      for (let _i9090 = 0; _i9090 < _a9089.length; _i9090++) {
        const v_c = _a9089[_i9090];
        const _h9091 = (g[v_c] || -1);
        if (!((_h9091 === 1))) continue;
        _g9087++;
      }
    }
    if (!((_g9087 === _v9085))) return false;
  }
  for (let _k9092 = 0; _k9092 < cl.seg.at.length; _k9092++) {
    const _at9093 = cl.seg.at[_k9092];
    const _v9094 = cl.seg.v[_k9092];
    let _c9144: boolean = ((_v9094 === 2) && ((g[_at9093] || -1) === 2));
    if (!_c9144) {
      let _c9143: boolean = ((_v9094 > 2) && ((g[_at9093] || -1) === 1));
      if (_c9143) {
        let _c9101: boolean = (_v9094 === 3);
        if (!_c9101) {
          let _c9097: boolean = (_v9094 === 4);
          if (_c9097) {
            const _t9095 = step(sp, _at9093, 2);
            const _h9096 = (g[_t9095] || -1);
            _c9097 = ((_t9095 !== -1) && (_h9096 === 1));
          }
          let _c9100: boolean = _c9097;
          if (_c9100) {
            const _t9098 = step(sp, _at9093, 1);
            const _h9099 = (g[_t9098] || -1);
            _c9100 = !(((_t9098 !== -1) && (_h9099 === 1)));
          }
          _c9101 = _c9100;
        }
        let _c9108: boolean = _c9101;
        if (!_c9108) {
          let _c9104: boolean = (_v9094 === 5);
          if (_c9104) {
            const _t9102 = step(sp, _at9093, 1);
            const _h9103 = (g[_t9102] || -1);
            _c9104 = ((_t9102 !== -1) && (_h9103 === 1));
          }
          let _c9107: boolean = _c9104;
          if (_c9107) {
            const _t9105 = step(sp, _at9093, 2);
            const _h9106 = (g[_t9105] || -1);
            _c9107 = !(((_t9105 !== -1) && (_h9106 === 1)));
          }
          _c9108 = _c9107;
        }
        let _c9121: boolean = _c9108;
        if (!_c9121) {
          let _c9120: boolean = (_v9094 === 6);
          if (_c9120) {
            const _t9109 = step(sp, _at9093, 1);
            const _h9110 = (g[_t9109] || -1);
            let _c9113: boolean = ((_t9109 !== -1) && (_h9110 === 1));
            if (_c9113) {
              const _t9111 = step(sp, _at9093, 2);
              const _h9112 = (g[_t9111] || -1);
              _c9113 = ((_t9111 !== -1) && (_h9112 === 1));
            }
            let _c9119: boolean = _c9113;
            if (!_c9119) {
              const _t9114 = step(sp, _at9093, 3);
              const _h9115 = (g[_t9114] || -1);
              let _c9118: boolean = ((_t9114 !== -1) && (_h9115 === 1));
              if (_c9118) {
                const _t9116 = step(sp, _at9093, 4);
                const _h9117 = (g[_t9116] || -1);
                _c9118 = ((_t9116 !== -1) && (_h9117 === 1));
              }
              _c9119 = _c9118;
            }
            _c9120 = _c9119;
          }
          _c9121 = _c9120;
        }
        let _c9128: boolean = _c9121;
        if (!_c9128) {
          let _c9124: boolean = (_v9094 === 7);
          if (_c9124) {
            const _t9122 = step(sp, _at9093, 4);
            const _h9123 = (g[_t9122] || -1);
            _c9124 = ((_t9122 !== -1) && (_h9123 === 1));
          }
          let _c9127: boolean = _c9124;
          if (_c9127) {
            const _t9125 = step(sp, _at9093, 3);
            const _h9126 = (g[_t9125] || -1);
            _c9127 = !(((_t9125 !== -1) && (_h9126 === 1)));
          }
          _c9128 = _c9127;
        }
        let _c9135: boolean = _c9128;
        if (!_c9135) {
          let _c9131: boolean = (_v9094 === 8);
          if (_c9131) {
            const _t9129 = step(sp, _at9093, 3);
            const _h9130 = (g[_t9129] || -1);
            _c9131 = ((_t9129 !== -1) && (_h9130 === 1));
          }
          let _c9134: boolean = _c9131;
          if (_c9134) {
            const _t9132 = step(sp, _at9093, 4);
            const _h9133 = (g[_t9132] || -1);
            _c9134 = !(((_t9132 !== -1) && (_h9133 === 1)));
          }
          _c9135 = _c9134;
        }
        let _c9142: boolean = _c9135;
        if (!_c9142) {
          let _c9141: boolean = (_v9094 === 9);
          if (_c9141) {
            let _q9136 = false;
            Q9137: {
              const _a9138 = sp.adj4[_at9093];
              for (let _i9139 = 0; _i9139 < _a9138.length; _i9139++) {
                const v_x = _a9138[_i9139];
                const _h9140 = (g[v_x] || -1);
                if ((_h9140 === 1)) {
                  _q9136 = true;
                  break Q9137;
                }
              }
            }
            _c9141 = !(_q9136);
          }
          _c9142 = _c9141;
        }
        _c9143 = _c9142;
      }
      _c9144 = _c9143;
    }
    if (!(_c9144)) return false;
  }
  for (let _k9145 = 0; _k9145 < cl.fleet.n; _k9145++) {
    let _g9148 = 0;
    G9149: {
      const _a9150 = sp.cells;
      for (let _i9151 = 0; _i9151 < _a9150.length; _i9151++) {
        const v_c = _a9150[_i9151];
        const _h9152 = (g[v_c] || -1);
        let _c9155: boolean = (_h9152 === 1);
        if (_c9155) {
          const _t9153 = step(sp, v_c, 1);
          const _h9154 = (g[_t9153] || -1);
          _c9155 = !(((_t9153 !== -1) && (_h9154 === 1)));
        }
        let _c9158: boolean = _c9155;
        if (_c9158) {
          const _t9156 = step(sp, v_c, 3);
          const _h9157 = (g[_t9156] || -1);
          _c9158 = !(((_t9156 !== -1) && (_h9157 === 1)));
        }
        let _c9175: boolean = _c9158;
        if (_c9175) {
          const _t9159 = sp.rowOf[v_c];
          _g9160.length = 0;
          G9161: {
            const _a9164 = sp.lineCells[_t9159];
            for (let _i9165 = 0; _i9165 < _a9164.length; _i9165++) {
              const v_x = _a9164[_i9165];
              const _h9166 = (g[v_x] || -1);
              if (!((_h9166 === 1))) continue;
              _g9160.push(v_x);
            }
          }
          const _t9167 = sp.colOf[v_c];
          _g9168.length = 0;
          G9169: {
            const _a9172 = sp.lineCells[_t9167];
            for (let _i9173 = 0; _i9173 < _a9172.length; _i9173++) {
              const v_x = _a9172[_i9173];
              const _h9174 = (g[v_x] || -1);
              if (!((_h9174 === 1))) continue;
              _g9168.push(v_x);
            }
          }
          _c9175 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g9160), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g9168)).length === cl.fleet.length[_k9145]);
        }
        if (!(_c9175)) continue;
        _g9148++;
      }
    }
    if (!((_g9148 === cl.fleet.boats[_k9145]))) return false;
  }
  return true;
}

export interface GivenBinding {
  c: number;
  v: number;
}

const givenFacts: number[] = [];

export function given(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GivenBinding> | null): number {
  const facts = givenFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    const _h11 = clueAt(cl.seg, v_c);
    L12: {
      const v_v = _h11;
      if (!((v_v >= 2))) break L12;
      facts.length = 0;
      changed = false;
      let _c13: boolean = !((v_v === 2));
      if (!_c13) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        _c13 = true;
      }
      let _c15: boolean = _c13;
      if (_c15) {
        let _c14: boolean = !((v_v > 2));
        if (!_c14) {
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          _c14 = true;
        }
        _c15 = _c14;
      }
      let _c21: boolean = _c15;
      if (_c21) {
        let _c20: boolean = !((v_v === 4));
        if (!_c20) {
          const _t16 = step(sp, v_c, 2);
          let _c19: boolean = ((_t16 !== -1) && ((b.grid[_t16] || -1) === 1));
          if (!_c19) {
            let _c18: boolean = ((step(sp, v_c, 2) !== -1) && !((b.grid[step(sp, v_c, 2)] !== 0)));
            if (_c18) {
              const _t17 = step(sp, v_c, 2);
              if (!(b.grid[_t17] !== 0)) { if (fire === null) { b.placeAt(_t17, 1); changed = true; } else facts.push(PLACE, _t17, 1); }
              _c18 = true;
            }
            _c19 = _c18;
          }
          _c20 = _c19;
        }
        _c21 = _c20;
      }
      let _c27: boolean = _c21;
      if (_c27) {
        let _c26: boolean = !((v_v === 4));
        if (!_c26) {
          const _t22 = step(sp, v_c, 1);
          let _c25: boolean = ((_t22 === -1) || ((b.grid[_t22] || -1) === 2));
          if (!_c25) {
            let _c24: boolean = !((b.grid[step(sp, v_c, 1)] !== 0));
            if (_c24) {
              const _t23 = step(sp, v_c, 1);
              if (!(b.grid[_t23] !== 0)) { if (fire === null) { b.placeAt(_t23, 2); changed = true; } else facts.push(PLACE, _t23, 2); }
              _c24 = true;
            }
            _c25 = _c24;
          }
          _c26 = _c25;
        }
        _c27 = _c26;
      }
      let _c33: boolean = _c27;
      if (_c33) {
        let _c32: boolean = !((v_v === 5));
        if (!_c32) {
          const _t28 = step(sp, v_c, 1);
          let _c31: boolean = ((_t28 !== -1) && ((b.grid[_t28] || -1) === 1));
          if (!_c31) {
            let _c30: boolean = ((step(sp, v_c, 1) !== -1) && !((b.grid[step(sp, v_c, 1)] !== 0)));
            if (_c30) {
              const _t29 = step(sp, v_c, 1);
              if (!(b.grid[_t29] !== 0)) { if (fire === null) { b.placeAt(_t29, 1); changed = true; } else facts.push(PLACE, _t29, 1); }
              _c30 = true;
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        _c33 = _c32;
      }
      let _c39: boolean = _c33;
      if (_c39) {
        let _c38: boolean = !((v_v === 5));
        if (!_c38) {
          const _t34 = step(sp, v_c, 2);
          let _c37: boolean = ((_t34 === -1) || ((b.grid[_t34] || -1) === 2));
          if (!_c37) {
            let _c36: boolean = !((b.grid[step(sp, v_c, 2)] !== 0));
            if (_c36) {
              const _t35 = step(sp, v_c, 2);
              if (!(b.grid[_t35] !== 0)) { if (fire === null) { b.placeAt(_t35, 2); changed = true; } else facts.push(PLACE, _t35, 2); }
              _c36 = true;
            }
            _c37 = _c36;
          }
          _c38 = _c37;
        }
        _c39 = _c38;
      }
      let _c45: boolean = _c39;
      if (_c45) {
        let _c44: boolean = !((v_v === 7));
        if (!_c44) {
          const _t40 = step(sp, v_c, 4);
          let _c43: boolean = ((_t40 !== -1) && ((b.grid[_t40] || -1) === 1));
          if (!_c43) {
            let _c42: boolean = ((step(sp, v_c, 4) !== -1) && !((b.grid[step(sp, v_c, 4)] !== 0)));
            if (_c42) {
              const _t41 = step(sp, v_c, 4);
              if (!(b.grid[_t41] !== 0)) { if (fire === null) { b.placeAt(_t41, 1); changed = true; } else facts.push(PLACE, _t41, 1); }
              _c42 = true;
            }
            _c43 = _c42;
          }
          _c44 = _c43;
        }
        _c45 = _c44;
      }
      let _c51: boolean = _c45;
      if (_c51) {
        let _c50: boolean = !((v_v === 7));
        if (!_c50) {
          const _t46 = step(sp, v_c, 3);
          let _c49: boolean = ((_t46 === -1) || ((b.grid[_t46] || -1) === 2));
          if (!_c49) {
            let _c48: boolean = !((b.grid[step(sp, v_c, 3)] !== 0));
            if (_c48) {
              const _t47 = step(sp, v_c, 3);
              if (!(b.grid[_t47] !== 0)) { if (fire === null) { b.placeAt(_t47, 2); changed = true; } else facts.push(PLACE, _t47, 2); }
              _c48 = true;
            }
            _c49 = _c48;
          }
          _c50 = _c49;
        }
        _c51 = _c50;
      }
      let _c57: boolean = _c51;
      if (_c57) {
        let _c56: boolean = !((v_v === 8));
        if (!_c56) {
          const _t52 = step(sp, v_c, 3);
          let _c55: boolean = ((_t52 !== -1) && ((b.grid[_t52] || -1) === 1));
          if (!_c55) {
            let _c54: boolean = ((step(sp, v_c, 3) !== -1) && !((b.grid[step(sp, v_c, 3)] !== 0)));
            if (_c54) {
              const _t53 = step(sp, v_c, 3);
              if (!(b.grid[_t53] !== 0)) { if (fire === null) { b.placeAt(_t53, 1); changed = true; } else facts.push(PLACE, _t53, 1); }
              _c54 = true;
            }
            _c55 = _c54;
          }
          _c56 = _c55;
        }
        _c57 = _c56;
      }
      let _c63: boolean = _c57;
      if (_c63) {
        let _c62: boolean = !((v_v === 8));
        if (!_c62) {
          const _t58 = step(sp, v_c, 4);
          let _c61: boolean = ((_t58 === -1) || ((b.grid[_t58] || -1) === 2));
          if (!_c61) {
            let _c60: boolean = !((b.grid[step(sp, v_c, 4)] !== 0));
            if (_c60) {
              const _t59 = step(sp, v_c, 4);
              if (!(b.grid[_t59] !== 0)) { if (fire === null) { b.placeAt(_t59, 2); changed = true; } else facts.push(PLACE, _t59, 2); }
              _c60 = true;
            }
            _c61 = _c60;
          }
          _c62 = _c61;
        }
        _c63 = _c62;
      }
      let _c70: boolean = _c63;
      if (_c70) {
        let _c69: boolean = !((v_v === 9));
        if (!_c69) {
          let _q64 = true;
          Q65: {
            const _a66 = sp.adj4[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_x = _a66[_i67];
              let _c68: boolean = ((b.grid[v_x] || -1) !== 1);
              if (_c68) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c68 = true;
              }
              if (!(_c68)) {
                _q64 = false;
                break Q65;
              }
            }
          }
          _c69 = _q64;
        }
        _c70 = _c69;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, v: v_v }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NearBinding {
  c: number;
  D: readonly number[];
}

const nearFacts: number[] = [];

export function near(b: Marks, sp: GridSpace, fire: Fire<NearBinding> | null): number {
  const _g82: number[] = [];
  const facts = nearFacts;
  let fired = 0;
  let changed = false;
  const _a80 = sp.cells;
  for (let _i81 = 0; _i81 < _a80.length; _i81++) {
    const v_c = _a80[_i81];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    _g82.length = 0;
    G83: {
      const _a86 = sp.adj8[v_c];
      for (let _i87 = 0; _i87 < _a86.length; _i87++) {
        const v_d = _a86[_i87];
        if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
        _g82.push(v_d);
      }
    }
    L88: {
      const v_D = _g82;
      const _h89 = v_D.length;
      if (!((_h89 > 0))) break L88;
      facts.length = 0;
      changed = false;
      let _q90 = true;
      Q91: {
        const _a92 = v_D;
        for (let _i93 = 0; _i93 < _a92.length; _i93++) {
          const v_d = _a92[_i93];
          if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
          if (!(true)) {
            _q90 = false;
            break Q91;
          }
        }
      }
      if (!(_q90)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, D: v_D }, facts)) return 1;
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

export function touch(b: Marks, sp: GridSpace, v_c: number, fire: Fire<TouchBinding> | null): number {
  const facts = touchFacts;
  let fired = 0;
  let changed = false;
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a98 = sp.adj8[v_c];
  for (let _i99 = 0; _i99 < _a98.length; _i99++) {
    const v_d = _a98[_i99];
    if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
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

const lineShipsFacts: number[] = [];

export function lineShips(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineShipsBinding> | null): number {
  const _g121: number[] = [];
  const facts = lineShipsFacts;
  let fired = 0;
  let changed = false;
  const _a116 = sp.lines;
  for (let _i117 = 0; _i117 < _a116.length; _i117++) {
    const v_L = _a116[_i117];
    const _h118 = clueAt(cl.n, v_L);
    L119: {
      const v_v = _h118;
      if (!((v_v >= 0))) break L119;
      const _t120 = sp.lineCells[v_L];
      _g121.length = 0;
      G122: {
        const _a125 = _t120;
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_c = _a125[_i126];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g121.push(v_c);
        }
      }
      L127: {
        const v_O = _g121;
        const _h128 = v_O.length;
        if (!((_h128 > 0))) break L127;
        const _t129 = sp.lineCells[v_L];
        let _g130 = 0;
        G131: {
          const _a132 = _t129;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_c = _a132[_i133];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g130++;
          }
        }
        const v_left = (v_v - _g130);
        facts.length = 0;
        changed = false;
        let _c139: boolean = (v_left <= _h128);
        if (_c139) {
          let _c138: boolean = !((v_left === _h128));
          if (!_c138) {
            let _q134 = true;
            Q135: {
              const _a136 = v_O;
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_c = _a136[_i137];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q134 = false;
                  break Q135;
                }
              }
            }
            _c138 = _q134;
          }
          _c139 = _c138;
        }
        if (!(_c139)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
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

const totalFacts: number[] = [];

export function total(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalBinding> | null): number {
  const _g156: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _t155 = sp.cells;
  _g156.length = 0;
  G157: {
    const _a160 = _t155;
    for (let _i161 = 0; _i161 < _a160.length; _i161++) {
      const v_c = _a160[_i161];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g156.push(v_c);
    }
  }
  L162: {
    const v_O = _g156;
    const _h163 = v_O.length;
    if (!((_h163 > 0))) break L162;
    let _g164 = 0;
    G165: {
      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
        _g164 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
      }
    }
    const _t166 = sp.cells;
    let _g167 = 0;
    G168: {
      const _a169 = _t166;
      for (let _i170 = 0; _i170 < _a169.length; _i170++) {
        const v_c = _a169[_i170];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g167++;
      }
    }
    const v_left = (_g164 - _g167);
    facts.length = 0;
    changed = false;
    let _c176: boolean = (v_left <= _h163);
    if (_c176) {
      let _c175: boolean = !((v_left === _h163));
      if (!_c175) {
        let _q171 = true;
        Q172: {
          const _a173 = v_O;
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_c = _a173[_i174];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q171 = false;
              break Q172;
            }
          }
        }
        _c175 = _q171;
      }
      _c176 = _c175;
    }
    if (!(_c176)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O, left: v_left }, facts)) return 1;
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

const centerFacts: number[] = [];

export function center(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterBinding> | null): number {
  const facts = centerFacts;
  let fired = 0;
  let changed = false;
  const _h187 = ((1 << 1) | (1 << 3));
  const _a184 = cluesValued(cl.seg, 6);
  for (let _i185 = 0; _i185 < _a184.length; _i185++) {
    const v_c = _a184[_i185];
    const _h186 = clueAt(cl.seg, v_c);
    if (!((_h186 === 6))) continue;
    for (let _m188 = _h187; _m188 !== 0; _m188 &= _m188 - 1) {
      const v_a = 31 - Math.clz32(_m188 & -_m188);
      const v_b = (v_a + 1);
      const v_p = (4 - v_a);
      L189: {
        const v_q = (5 - v_a);
        const _t190 = step(sp, v_c, v_a);
        let _c192: boolean = ((_t190 === -1) || ((b.grid[_t190] || -1) === 2));
        if (!_c192) {
          const _t191 = step(sp, v_c, v_b);
          _c192 = ((_t191 === -1) || ((b.grid[_t191] || -1) === 2));
        }
        if (!(_c192)) break L189;
        facts.length = 0;
        changed = false;
        const _t193 = step(sp, v_c, v_p);
        let _c195: boolean = !(((_t193 === -1) || ((b.grid[_t193] || -1) === 2)));
        if (_c195) {
          const _t194 = step(sp, v_c, v_q);
          _c195 = !(((_t194 === -1) || ((b.grid[_t194] || -1) === 2)));
        }
        let _c197: boolean = _c195;
        if (_c197) {
          const _t196 = step(sp, v_c, v_p);
          if (!(b.grid[_t196] !== 0)) { if (fire === null) { b.placeAt(_t196, 1); changed = true; } else facts.push(PLACE, _t196, 1); }
          _c197 = true;
        }
        let _c199: boolean = _c197;
        if (_c199) {
          const _t198 = step(sp, v_c, v_q);
          if (!(b.grid[_t198] !== 0)) { if (fire === null) { b.placeAt(_t198, 1); changed = true; } else facts.push(PLACE, _t198, 1); }
          _c199 = true;
        }
        if (!(_c199)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, a: v_a, b: v_b, p: v_p, q: v_q }, facts)) return 1;
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

const extendFacts: number[] = [];

export function extend(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExtendBinding> | null): number {
  const _g323: number[] = [];
  const _g330: number[] = [];
  const _g376: number[] = [];
  const _g383: number[] = [];
  const _g394: number[] = [];
  const _g402: number[] = [];
  const _g417: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  let _q312 = true;
  Q313: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === 1))) continue;
      let _g314 = 0;
      G315: {
        const _a316 = sp.cells;
        for (let _i317 = 0; _i317 < _a316.length; _i317++) {
          const v_c = _a316[_i317];
          const _h393 = sp.rowOf[v_c];
          const _h401 = sp.colOf[v_c];
          let _c319: boolean = ((b.grid[v_c] || -1) === 1);
          if (_c319) {
            const _t318 = step(sp, v_c, 1);
            _c319 = !(((_t318 !== -1) && ((b.grid[_t318] || -1) === 1)));
          }
          let _c321: boolean = _c319;
          if (_c321) {
            const _t320 = step(sp, v_c, 3);
            _c321 = !(((_t320 !== -1) && ((b.grid[_t320] || -1) === 1)));
          }
          let _c336: boolean = _c321;
          if (_c336) {
            const _t322 = sp.rowOf[v_c];
            _g323.length = 0;
            G324: {
              const _a327 = sp.lineCells[_t322];
              for (let _i328 = 0; _i328 < _a327.length; _i328++) {
                const v_x = _a327[_i328];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g323.push(v_x);
              }
            }
            const _t329 = sp.colOf[v_c];
            _g330.length = 0;
            G331: {
              const _a334 = sp.lineCells[_t329];
              for (let _i335 = 0; _i335 < _a334.length; _i335++) {
                const v_x = _a334[_i335];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g330.push(v_x);
              }
            }
            _c336 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g323), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g330)).length === 1);
          }
          let _c409: boolean = _c336;
          if (_c409) {
            let _q373 = true;
            Q374: {
              const _t375 = sp.rowOf[v_c];
              _g376.length = 0;
              G377: {
                const _a380 = sp.lineCells[_t375];
                for (let _i381 = 0; _i381 < _a380.length; _i381++) {
                  const v_x = _a380[_i381];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g376.push(v_x);
                }
              }
              const _t382 = sp.colOf[v_c];
              _g383.length = 0;
              G384: {
                const _a387 = sp.lineCells[_t382];
                for (let _i388 = 0; _i388 < _a387.length; _i388++) {
                  const v_x = _a387[_i388];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g383.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g376), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g383));
              const _a389 = v_G;
              for (let _i390 = 0; _i390 < _a389.length; _i390++) {
                const v_x = _a389[_i390];
                const _a391 = sp.adj4[v_x];
                for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                  const v_y = _a391[_i392];
                  let _c400: boolean = !(v_G.includes(v_y));
                  if (_c400) {
                    _g394.length = 0;
                    G395: {
                      const _a398 = sp.lineCells[_h393];
                      for (let _i399 = 0; _i399 < _a398.length; _i399++) {
                        const v_x = _a398[_i399];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g394.push(v_x);
                      }
                    }
                    _c400 = ((stretch(sp.lineCells[_h393], v_c, _g394).length === 1) || (sp.lineCells[_h393].includes(v_y)));
                  }
                  let _c408: boolean = _c400;
                  if (_c408) {
                    _g402.length = 0;
                    G403: {
                      const _a406 = sp.lineCells[_h401];
                      for (let _i407 = 0; _i407 < _a406.length; _i407++) {
                        const v_x = _a406[_i407];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g402.push(v_x);
                      }
                    }
                    _c408 = ((stretch(sp.lineCells[_h401], v_c, _g402).length === 1) || (sp.lineCells[_h401].includes(v_y)));
                  }
                  if (!(_c408)) continue;
                  if (!(((b.grid[v_y] || -1) === 2))) {
                    _q373 = false;
                    break Q374;
                  }
                }
              }
            }
            _c409 = _q373;
          }
          if (!(_c409)) continue;
          _g314++;
        }
      }
      if (!((cl.fleet.boats[v_k] <= _g314))) {
        _q312 = false;
        break Q313;
      }
    }
  }
  const v_F = _q312;
  const _a410 = sp.cells;
  for (let _i411 = 0; _i411 < _a410.length; _i411++) {
    const v_c = _a410[_i411];
    let _c416: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
    if (_c416) {
      let _q412 = false;
      Q413: {
        const _a414 = sp.adj4[v_c];
        for (let _i415 = 0; _i415 < _a414.length; _i415++) {
          const v_x = _a414[_i415];
          if (((b.grid[v_x] || -1) === 1)) {
            _q412 = true;
            break Q413;
          }
        }
      }
      _c416 = !(_q412);
    }
    if (!(_c416)) continue;
    _g417.length = 0;
    G418: {
      const _a421 = sp.adj4[v_c];
      for (let _i422 = 0; _i422 < _a421.length; _i422++) {
        const v_x = _a421[_i422];
        if (!(!((b.grid[v_x] !== 0)))) continue;
        _g417.push(v_x);
      }
    }
    L423: {
      const v_O = _g417;
      const _h424 = v_O.length;
      if (!((_h424 === 1))) break L423;
      facts.length = 0;
      changed = false;
      let _q425 = true;
      Q426: {
        const _a427 = v_O;
        for (let _i428 = 0; _i428 < _a427.length; _i428++) {
          const v_x = _a427[_i428];
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) {
            _q425 = false;
            break Q426;
          }
        }
      }
      if (!(_q425)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ F: v_F, c: v_c, O: v_O }, facts)) return 1;
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

const lineWaterFacts: number[] = [];

export function lineWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineWaterBinding> | null): number {
  const _g450: number[] = [];
  const facts = lineWaterFacts;
  let fired = 0;
  let changed = false;
  const _a445 = sp.lines;
  for (let _i446 = 0; _i446 < _a445.length; _i446++) {
    const v_L = _a445[_i446];
    const _h447 = clueAt(cl.n, v_L);
    L448: {
      const v_v = _h447;
      if (!((v_v >= 0))) break L448;
      const _t449 = sp.lineCells[v_L];
      _g450.length = 0;
      G451: {
        const _a454 = _t449;
        for (let _i455 = 0; _i455 < _a454.length; _i455++) {
          const v_c = _a454[_i455];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g450.push(v_c);
        }
      }
      L456: {
        const v_O = _g450;
        const _h457 = v_O.length;
        if (!((_h457 > 0))) break L456;
        const _t458 = sp.lineCells[v_L];
        let _g459 = 0;
        G460: {
          const _a461 = _t458;
          for (let _i462 = 0; _i462 < _a461.length; _i462++) {
            const v_c = _a461[_i462];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g459++;
          }
        }
        const v_left = (v_v - _g459);
        facts.length = 0;
        changed = false;
        let _c468: boolean = (v_left >= 0);
        if (_c468) {
          let _c467: boolean = !((v_left === 0));
          if (!_c467) {
            let _q463 = true;
            Q464: {
              const _a465 = v_O;
              for (let _i466 = 0; _i466 < _a465.length; _i466++) {
                const v_c = _a465[_i466];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q463 = false;
                  break Q464;
                }
              }
            }
            _c467 = _q463;
          }
          _c468 = _c467;
        }
        if (!(_c468)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
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

const isolatedFacts: number[] = [];

export function isolated(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<IsolatedBinding> | null): number {
  const _g585: number[] = [];
  const _g592: number[] = [];
  const _g638: number[] = [];
  const _g645: number[] = [];
  const _g656: number[] = [];
  const _g664: number[] = [];
  const facts = isolatedFacts;
  let fired = 0;
  let changed = false;
  let _q574 = true;
  Q575: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === 1))) continue;
      let _g576 = 0;
      G577: {
        const _a578 = sp.cells;
        for (let _i579 = 0; _i579 < _a578.length; _i579++) {
          const v_c = _a578[_i579];
          const _h655 = sp.rowOf[v_c];
          const _h663 = sp.colOf[v_c];
          let _c581: boolean = ((b.grid[v_c] || -1) === 1);
          if (_c581) {
            const _t580 = step(sp, v_c, 1);
            _c581 = !(((_t580 !== -1) && ((b.grid[_t580] || -1) === 1)));
          }
          let _c583: boolean = _c581;
          if (_c583) {
            const _t582 = step(sp, v_c, 3);
            _c583 = !(((_t582 !== -1) && ((b.grid[_t582] || -1) === 1)));
          }
          let _c598: boolean = _c583;
          if (_c598) {
            const _t584 = sp.rowOf[v_c];
            _g585.length = 0;
            G586: {
              const _a589 = sp.lineCells[_t584];
              for (let _i590 = 0; _i590 < _a589.length; _i590++) {
                const v_x = _a589[_i590];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g585.push(v_x);
              }
            }
            const _t591 = sp.colOf[v_c];
            _g592.length = 0;
            G593: {
              const _a596 = sp.lineCells[_t591];
              for (let _i597 = 0; _i597 < _a596.length; _i597++) {
                const v_x = _a596[_i597];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g592.push(v_x);
              }
            }
            _c598 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g585), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g592)).length === 1);
          }
          let _c671: boolean = _c598;
          if (_c671) {
            let _q635 = true;
            Q636: {
              const _t637 = sp.rowOf[v_c];
              _g638.length = 0;
              G639: {
                const _a642 = sp.lineCells[_t637];
                for (let _i643 = 0; _i643 < _a642.length; _i643++) {
                  const v_x = _a642[_i643];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g638.push(v_x);
                }
              }
              const _t644 = sp.colOf[v_c];
              _g645.length = 0;
              G646: {
                const _a649 = sp.lineCells[_t644];
                for (let _i650 = 0; _i650 < _a649.length; _i650++) {
                  const v_x = _a649[_i650];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g645.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g638), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g645));
              const _a651 = v_G;
              for (let _i652 = 0; _i652 < _a651.length; _i652++) {
                const v_x = _a651[_i652];
                const _a653 = sp.adj4[v_x];
                for (let _i654 = 0; _i654 < _a653.length; _i654++) {
                  const v_y = _a653[_i654];
                  let _c662: boolean = !(v_G.includes(v_y));
                  if (_c662) {
                    _g656.length = 0;
                    G657: {
                      const _a660 = sp.lineCells[_h655];
                      for (let _i661 = 0; _i661 < _a660.length; _i661++) {
                        const v_x = _a660[_i661];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g656.push(v_x);
                      }
                    }
                    _c662 = ((stretch(sp.lineCells[_h655], v_c, _g656).length === 1) || (sp.lineCells[_h655].includes(v_y)));
                  }
                  let _c670: boolean = _c662;
                  if (_c670) {
                    _g664.length = 0;
                    G665: {
                      const _a668 = sp.lineCells[_h663];
                      for (let _i669 = 0; _i669 < _a668.length; _i669++) {
                        const v_x = _a668[_i669];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g664.push(v_x);
                      }
                    }
                    _c670 = ((stretch(sp.lineCells[_h663], v_c, _g664).length === 1) || (sp.lineCells[_h663].includes(v_y)));
                  }
                  if (!(_c670)) continue;
                  if (!(((b.grid[v_y] || -1) === 2))) {
                    _q635 = false;
                    break Q636;
                  }
                }
              }
            }
            _c671 = _q635;
          }
          if (!(_c671)) continue;
          _g576++;
        }
      }
      if (!((cl.fleet.boats[v_k] <= _g576))) {
        _q574 = false;
        break Q575;
      }
    }
  }
  const v_F = _q574;
  const _a672 = sp.cells;
  for (let _i673 = 0; _i673 < _a672.length; _i673++) {
    const v_c = _a672[_i673];
    let _c678: boolean = (v_F && !((b.grid[v_c] !== 0)));
    if (_c678) {
      let _q674 = true;
      Q675: {
        const _a676 = sp.adj4[v_c];
        for (let _i677 = 0; _i677 < _a676.length; _i677++) {
          const v_x = _a676[_i677];
          if (!(((b.grid[v_x] || -1) === 2))) {
            _q674 = false;
            break Q675;
          }
        }
      }
      _c678 = _q674;
    }
    if (!(_c678)) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ F: v_F, c: v_c }, facts)) return 1;
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

const growFacts: number[] = [];

export function grow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GrowBinding> | null): number {
  const _g811: number[] = [];
  const _g819: number[] = [];
  const _g848: number[] = [];
  const _g855: number[] = [];
  const _g901: number[] = [];
  const _g908: number[] = [];
  const _g919: number[] = [];
  const _g927: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _a807 = sp.cells;
  for (let _i808 = 0; _i808 < _a807.length; _i808++) {
    const v_c = _a807[_i808];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    const _a809 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i810 = 0; _i810 < _a809.length; _i810++) {
      const v_L = _a809[_i810];
      _g811.length = 0;
      G812: {
        const _a815 = sp.lineCells[v_L];
        for (let _i816 = 0; _i816 < _a815.length; _i816++) {
          const v_x = _a815[_i816];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g811.push(v_x);
        }
      }
      L817: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g811);
        const _h818 = v_G.length;
        if (!(((_h818 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L817;
        _g819.length = 0;
        G820: {
          const _a828 = sp.lineCells[v_L];
          for (let _i829 = 0; _i829 < _a828.length; _i829++) {
            const v_x = _a828[_i829];
            let _c834: boolean = !((b.grid[v_x] !== 0));
            if (_c834) {
              let _q830 = false;
              Q831: {
                const _a832 = v_G;
                for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                  const v_g = _a832[_i833];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q830 = true;
                    break Q831;
                  }
                }
              }
              _c834 = _q830;
            }
            if (!(_c834)) continue;
            _g819.push(v_x);
          }
        }
        L835: {
          const v_E = _g819;
          const _h836 = v_E.length;
          let _c935: boolean = (_h836 === 1);
          if (_c935) {
            let _q837 = true;
            Q838: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === _h818))) continue;
                let _g839 = 0;
                G840: {
                  const _a841 = sp.cells;
                  for (let _i842 = 0; _i842 < _a841.length; _i842++) {
                    const v_c = _a841[_i842];
                    const _h918 = sp.rowOf[v_c];
                    const _h926 = sp.colOf[v_c];
                    let _c844: boolean = ((b.grid[v_c] || -1) === 1);
                    if (_c844) {
                      const _t843 = step(sp, v_c, 1);
                      _c844 = !(((_t843 !== -1) && ((b.grid[_t843] || -1) === 1)));
                    }
                    let _c846: boolean = _c844;
                    if (_c846) {
                      const _t845 = step(sp, v_c, 3);
                      _c846 = !(((_t845 !== -1) && ((b.grid[_t845] || -1) === 1)));
                    }
                    let _c861: boolean = _c846;
                    if (_c861) {
                      const _t847 = sp.rowOf[v_c];
                      _g848.length = 0;
                      G849: {
                        const _a852 = sp.lineCells[_t847];
                        for (let _i853 = 0; _i853 < _a852.length; _i853++) {
                          const v_x = _a852[_i853];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g848.push(v_x);
                        }
                      }
                      const _t854 = sp.colOf[v_c];
                      _g855.length = 0;
                      G856: {
                        const _a859 = sp.lineCells[_t854];
                        for (let _i860 = 0; _i860 < _a859.length; _i860++) {
                          const v_x = _a859[_i860];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g855.push(v_x);
                        }
                      }
                      _c861 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g848), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g855)).length === _h818);
                    }
                    let _c934: boolean = _c861;
                    if (_c934) {
                      let _q898 = true;
                      Q899: {
                        const _t900 = sp.rowOf[v_c];
                        _g901.length = 0;
                        G902: {
                          const _a905 = sp.lineCells[_t900];
                          for (let _i906 = 0; _i906 < _a905.length; _i906++) {
                            const v_x = _a905[_i906];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g901.push(v_x);
                          }
                        }
                        const _t907 = sp.colOf[v_c];
                        _g908.length = 0;
                        G909: {
                          const _a912 = sp.lineCells[_t907];
                          for (let _i913 = 0; _i913 < _a912.length; _i913++) {
                            const v_x = _a912[_i913];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g908.push(v_x);
                          }
                        }
                        const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g901), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g908));
                        const _a914 = v_G;
                        for (let _i915 = 0; _i915 < _a914.length; _i915++) {
                          const v_x = _a914[_i915];
                          const _a916 = sp.adj4[v_x];
                          for (let _i917 = 0; _i917 < _a916.length; _i917++) {
                            const v_y = _a916[_i917];
                            let _c925: boolean = !(v_G.includes(v_y));
                            if (_c925) {
                              _g919.length = 0;
                              G920: {
                                const _a923 = sp.lineCells[_h918];
                                for (let _i924 = 0; _i924 < _a923.length; _i924++) {
                                  const v_x = _a923[_i924];
                                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                                  _g919.push(v_x);
                                }
                              }
                              _c925 = ((stretch(sp.lineCells[_h918], v_c, _g919).length === 1) || (sp.lineCells[_h918].includes(v_y)));
                            }
                            let _c933: boolean = _c925;
                            if (_c933) {
                              _g927.length = 0;
                              G928: {
                                const _a931 = sp.lineCells[_h926];
                                for (let _i932 = 0; _i932 < _a931.length; _i932++) {
                                  const v_x = _a931[_i932];
                                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                                  _g927.push(v_x);
                                }
                              }
                              _c933 = ((stretch(sp.lineCells[_h926], v_c, _g927).length === 1) || (sp.lineCells[_h926].includes(v_y)));
                            }
                            if (!(_c933)) continue;
                            if (!(((b.grid[v_y] || -1) === 2))) {
                              _q898 = false;
                              break Q899;
                            }
                          }
                        }
                      }
                      _c934 = _q898;
                    }
                    if (!(_c934)) continue;
                    _g839++;
                  }
                }
                if (!((cl.fleet.boats[v_k] <= _g839))) {
                  _q837 = false;
                  break Q838;
                }
              }
            }
            _c935 = _q837;
          }
          if (!(_c935)) break L835;
          facts.length = 0;
          changed = false;
          let _q936 = true;
          Q937: {
            const _a938 = v_E;
            for (let _i939 = 0; _i939 < _a938.length; _i939++) {
              const v_x = _a938[_i939];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q936 = false;
                break Q937;
              }
            }
          }
          if (!(_q936)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, G: v_G, E: v_E }, facts)) return 1;
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

const onlyFitFacts: number[] = [];

export function onlyFit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyFitBinding> | null): number {
  const _g1218: number[] = [];
  const _g1225: number[] = [];
  const _g1271: number[] = [];
  const _g1278: number[] = [];
  const _g1289: number[] = [];
  const _g1297: number[] = [];
  const _g1318: number[] = [];
  const _g1355: number[] = [];
  const _g1362: number[] = [];
  const _g1408: number[] = [];
  const _g1415: number[] = [];
  const _g1426: number[] = [];
  const _g1434: number[] = [];
  const _g1457: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  let _g1206 = -1;
  G1207: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t1208 = cl.fleet.length[v_k];
      let _g1209 = 0;
      G1210: {
        const _a1211 = sp.cells;
        for (let _i1212 = 0; _i1212 < _a1211.length; _i1212++) {
          const v_c = _a1211[_i1212];
          const _h1288 = sp.rowOf[v_c];
          const _h1296 = sp.colOf[v_c];
          let _c1214: boolean = ((b.grid[v_c] || -1) === 1);
          if (_c1214) {
            const _t1213 = step(sp, v_c, 1);
            _c1214 = !(((_t1213 !== -1) && ((b.grid[_t1213] || -1) === 1)));
          }
          let _c1216: boolean = _c1214;
          if (_c1216) {
            const _t1215 = step(sp, v_c, 3);
            _c1216 = !(((_t1215 !== -1) && ((b.grid[_t1215] || -1) === 1)));
          }
          let _c1231: boolean = _c1216;
          if (_c1231) {
            const _t1217 = sp.rowOf[v_c];
            _g1218.length = 0;
            G1219: {
              const _a1222 = sp.lineCells[_t1217];
              for (let _i1223 = 0; _i1223 < _a1222.length; _i1223++) {
                const v_x = _a1222[_i1223];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g1218.push(v_x);
              }
            }
            const _t1224 = sp.colOf[v_c];
            _g1225.length = 0;
            G1226: {
              const _a1229 = sp.lineCells[_t1224];
              for (let _i1230 = 0; _i1230 < _a1229.length; _i1230++) {
                const v_x = _a1229[_i1230];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g1225.push(v_x);
              }
            }
            _c1231 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1218), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1225)).length === _t1208);
          }
          let _c1304: boolean = _c1231;
          if (_c1304) {
            let _q1268 = true;
            Q1269: {
              const _t1270 = sp.rowOf[v_c];
              _g1271.length = 0;
              G1272: {
                const _a1275 = sp.lineCells[_t1270];
                for (let _i1276 = 0; _i1276 < _a1275.length; _i1276++) {
                  const v_x = _a1275[_i1276];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1271.push(v_x);
                }
              }
              const _t1277 = sp.colOf[v_c];
              _g1278.length = 0;
              G1279: {
                const _a1282 = sp.lineCells[_t1277];
                for (let _i1283 = 0; _i1283 < _a1282.length; _i1283++) {
                  const v_x = _a1282[_i1283];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1278.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1271), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1278));
              const _a1284 = v_G;
              for (let _i1285 = 0; _i1285 < _a1284.length; _i1285++) {
                const v_x = _a1284[_i1285];
                const _a1286 = sp.adj4[v_x];
                for (let _i1287 = 0; _i1287 < _a1286.length; _i1287++) {
                  const v_y = _a1286[_i1287];
                  let _c1295: boolean = !(v_G.includes(v_y));
                  if (_c1295) {
                    _g1289.length = 0;
                    G1290: {
                      const _a1293 = sp.lineCells[_h1288];
                      for (let _i1294 = 0; _i1294 < _a1293.length; _i1294++) {
                        const v_x = _a1293[_i1294];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g1289.push(v_x);
                      }
                    }
                    _c1295 = ((stretch(sp.lineCells[_h1288], v_c, _g1289).length === 1) || (sp.lineCells[_h1288].includes(v_y)));
                  }
                  let _c1303: boolean = _c1295;
                  if (_c1303) {
                    _g1297.length = 0;
                    G1298: {
                      const _a1301 = sp.lineCells[_h1296];
                      for (let _i1302 = 0; _i1302 < _a1301.length; _i1302++) {
                        const v_x = _a1301[_i1302];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g1297.push(v_x);
                      }
                    }
                    _c1303 = ((stretch(sp.lineCells[_h1296], v_c, _g1297).length === 1) || (sp.lineCells[_h1296].includes(v_y)));
                  }
                  if (!(_c1303)) continue;
                  if (!(((b.grid[v_y] || -1) === 2))) {
                    _q1268 = false;
                    break Q1269;
                  }
                }
              }
            }
            _c1304 = _q1268;
          }
          if (!(_c1304)) continue;
          _g1209++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g1209))) continue;
      const _t1305 = cl.fleet.length[v_k];
      if (_g1206 === -1 || _t1305 > _g1206) _g1206 = _t1305;
    }
  }
  const v_M = _g1206;
  const _a1306 = sp.lines;
  for (let _i1307 = 0; _i1307 < _a1306.length; _i1307++) {
    const v_L = _a1306[_i1307];
    const _h1330 = clueAt(cl.n, v_L);
    const _h1331 = (_h1330 < 0);
    const _a1308 = sp.lineCells[v_L];
    for (let _i1309 = 0; _i1309 < _a1308.length; _i1309++) {
      const v_c = _a1308[_i1309];
      const _h1314 = (v_c % sp.w);
      const _h1315 = ((v_c / sp.w) | 0);
      const _h1316 = (_h1314 + _h1315);
      let _c1317: boolean = ((b.grid[v_c] || -1) !== 2);
      if (_c1317) {
        let _q1310 = false;
        Q1311: {
          const _a1312 = sp.adj4[v_c];
          for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
            const v_p = _a1312[_i1313];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h1316)))) continue;
            if (((b.grid[v_p] || -1) !== 2)) {
              _q1310 = true;
              break Q1311;
            }
          }
        }
        _c1317 = !(_q1310);
      }
      if (!(_c1317)) continue;
      _g1318.length = 0;
      G1319: {
        const _a1322 = sp.lineCells[v_L];
        for (let _i1323 = 0; _i1323 < _a1322.length; _i1323++) {
          const v_x = _a1322[_i1323];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g1318.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g1318);
      const _h1324 = v_R.length;
      L1325: {
        const v_m = _h1324;
        let _c1343: boolean = (v_m === v_M);
        if (_c1343) {
          let _g1326 = 0;
          G1327: {
            const _a1328 = v_R;
            for (let _i1329 = 0; _i1329 < _a1328.length; _i1329++) {
              const v_c = _a1328[_i1329];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1326++;
            }
          }
          let _c1342: boolean = ((_g1326 < _h1324) && (_h1324 >= v_m));
          if (_c1342) {
            let _c1341: boolean = _h1331;
            if (!_c1341) {
              const _t1332 = sp.lineCells[v_L];
              let _g1333 = 0;
              G1334: {
                const _a1335 = _t1332;
                for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
                  const v_c = _a1335[_i1336];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1333++;
                }
              }
              let _g1337 = 0;
              G1338: {
                const _a1339 = v_R;
                for (let _i1340 = 0; _i1340 < _a1339.length; _i1340++) {
                  const v_c = _a1339[_i1340];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1337++;
                }
              }
              _c1341 = (((_h1330 - _g1333) + _g1337) >= v_m);
            }
            _c1342 = _c1341;
          }
          _c1343 = _c1342;
        }
        if (!(_c1343)) break L1325;
        const _h1488 = (v_m > 1);
        let _g1344 = 0;
        G1345: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            if (!((cl.fleet.length[v_k] === v_m))) continue;
            _g1344 += cl.fleet.boats[v_k];
          }
        }
        let _g1346 = 0;
        G1347: {
          const _a1348 = sp.cells;
          for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
            const v_c = _a1348[_i1349];
            const _h1425 = sp.rowOf[v_c];
            const _h1433 = sp.colOf[v_c];
            let _c1351: boolean = ((b.grid[v_c] || -1) === 1);
            if (_c1351) {
              const _t1350 = step(sp, v_c, 1);
              _c1351 = !(((_t1350 !== -1) && ((b.grid[_t1350] || -1) === 1)));
            }
            let _c1353: boolean = _c1351;
            if (_c1353) {
              const _t1352 = step(sp, v_c, 3);
              _c1353 = !(((_t1352 !== -1) && ((b.grid[_t1352] || -1) === 1)));
            }
            let _c1368: boolean = _c1353;
            if (_c1368) {
              const _t1354 = sp.rowOf[v_c];
              _g1355.length = 0;
              G1356: {
                const _a1359 = sp.lineCells[_t1354];
                for (let _i1360 = 0; _i1360 < _a1359.length; _i1360++) {
                  const v_x = _a1359[_i1360];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1355.push(v_x);
                }
              }
              const _t1361 = sp.colOf[v_c];
              _g1362.length = 0;
              G1363: {
                const _a1366 = sp.lineCells[_t1361];
                for (let _i1367 = 0; _i1367 < _a1366.length; _i1367++) {
                  const v_x = _a1366[_i1367];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1362.push(v_x);
                }
              }
              _c1368 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1355), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1362)).length === v_m);
            }
            let _c1441: boolean = _c1368;
            if (_c1441) {
              let _q1405 = true;
              Q1406: {
                const _t1407 = sp.rowOf[v_c];
                _g1408.length = 0;
                G1409: {
                  const _a1412 = sp.lineCells[_t1407];
                  for (let _i1413 = 0; _i1413 < _a1412.length; _i1413++) {
                    const v_x = _a1412[_i1413];
                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                    _g1408.push(v_x);
                  }
                }
                const _t1414 = sp.colOf[v_c];
                _g1415.length = 0;
                G1416: {
                  const _a1419 = sp.lineCells[_t1414];
                  for (let _i1420 = 0; _i1420 < _a1419.length; _i1420++) {
                    const v_x = _a1419[_i1420];
                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                    _g1415.push(v_x);
                  }
                }
                const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1408), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1415));
                const _a1421 = v_G;
                for (let _i1422 = 0; _i1422 < _a1421.length; _i1422++) {
                  const v_x = _a1421[_i1422];
                  const _a1423 = sp.adj4[v_x];
                  for (let _i1424 = 0; _i1424 < _a1423.length; _i1424++) {
                    const v_y = _a1423[_i1424];
                    let _c1432: boolean = !(v_G.includes(v_y));
                    if (_c1432) {
                      _g1426.length = 0;
                      G1427: {
                        const _a1430 = sp.lineCells[_h1425];
                        for (let _i1431 = 0; _i1431 < _a1430.length; _i1431++) {
                          const v_x = _a1430[_i1431];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g1426.push(v_x);
                        }
                      }
                      _c1432 = ((stretch(sp.lineCells[_h1425], v_c, _g1426).length === 1) || (sp.lineCells[_h1425].includes(v_y)));
                    }
                    let _c1440: boolean = _c1432;
                    if (_c1440) {
                      _g1434.length = 0;
                      G1435: {
                        const _a1438 = sp.lineCells[_h1433];
                        for (let _i1439 = 0; _i1439 < _a1438.length; _i1439++) {
                          const v_x = _a1438[_i1439];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g1434.push(v_x);
                        }
                      }
                      _c1440 = ((stretch(sp.lineCells[_h1433], v_c, _g1434).length === 1) || (sp.lineCells[_h1433].includes(v_y)));
                    }
                    if (!(_c1440)) continue;
                    if (!(((b.grid[v_y] || -1) === 2))) {
                      _q1405 = false;
                      break Q1406;
                    }
                  }
                }
              }
              _c1441 = _q1405;
            }
            if (!(_c1441)) continue;
            _g1346++;
          }
        }
        L1442: {
          const v_b = (_g1344 - _g1346);
          let _c1483: boolean = (v_b === 1);
          if (_c1483) {
            let _g1443 = 0;
            G1444: {
              const _a1445 = sp.lines;
              for (let _i1446 = 0; _i1446 < _a1445.length; _i1446++) {
                const v_K = _a1445[_i1446];
                const _h1469 = clueAt(cl.n, v_K);
                const _h1470 = (_h1469 < 0);
                const _a1447 = sp.lineCells[v_K];
                for (let _i1448 = 0; _i1448 < _a1447.length; _i1448++) {
                  const v_d = _a1447[_i1448];
                  const _h1453 = (v_d % sp.w);
                  const _h1454 = ((v_d / sp.w) | 0);
                  const _h1455 = (_h1453 + _h1454);
                  let _c1456: boolean = ((b.grid[v_d] || -1) !== 2);
                  if (_c1456) {
                    let _q1449 = false;
                    Q1450: {
                      const _a1451 = sp.adj4[v_d];
                      for (let _i1452 = 0; _i1452 < _a1451.length; _i1452++) {
                        const v_p = _a1451[_i1452];
                        if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h1455)))) continue;
                        if (((b.grid[v_p] || -1) !== 2)) {
                          _q1449 = true;
                          break Q1450;
                        }
                      }
                    }
                    _c1456 = !(_q1449);
                  }
                  let _c1482: boolean = _c1456;
                  if (_c1482) {
                    _g1457.length = 0;
                    G1458: {
                      const _a1461 = sp.lineCells[v_K];
                      for (let _i1462 = 0; _i1462 < _a1461.length; _i1462++) {
                        const v_x = _a1461[_i1462];
                        if (!(((b.grid[v_x] || -1) !== 2))) continue;
                        _g1457.push(v_x);
                      }
                    }
                    const _t1463 = stretch(sp.lineCells[v_K], v_d, _g1457);
                    const _h1468 = _t1463.length;
                    let _g1464 = 0;
                    G1465: {
                      const _a1466 = _t1463;
                      for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                        const v_c = _a1466[_i1467];
                        if (!(((b.grid[v_c] || -1) === 1))) continue;
                        _g1464++;
                      }
                    }
                    let _c1481: boolean = ((_g1464 < _h1468) && (_h1468 >= v_m));
                    if (_c1481) {
                      let _c1480: boolean = _h1470;
                      if (!_c1480) {
                        const _t1471 = sp.lineCells[v_K];
                        let _g1472 = 0;
                        G1473: {
                          const _a1474 = _t1471;
                          for (let _i1475 = 0; _i1475 < _a1474.length; _i1475++) {
                            const v_c = _a1474[_i1475];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g1472++;
                          }
                        }
                        let _g1476 = 0;
                        G1477: {
                          const _a1478 = _t1463;
                          for (let _i1479 = 0; _i1479 < _a1478.length; _i1479++) {
                            const v_c = _a1478[_i1479];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g1476++;
                          }
                        }
                        _c1480 = (((_h1469 - _g1472) + _g1476) >= v_m);
                      }
                      _c1481 = _c1480;
                    }
                    _c1482 = _c1481;
                  }
                  if (!(_c1482)) continue;
                  _g1443++;
                }
              }
            }
            _c1483 = (_g1443 === 1);
          }
          if (!(_c1483)) break L1442;
          facts.length = 0;
          changed = false;
          let _q1484 = true;
          Q1485: {
            const _a1486 = v_R;
            for (let _i1487 = 0; _i1487 < _a1486.length; _i1487++) {
              const v_x = _a1486[_i1487];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c1494: boolean = true;
              if (_c1494) {
                let _c1493: boolean = _h1488;
                if (!_c1493) {
                  let _q1489 = true;
                  Q1490: {
                    const _a1491 = sp.adj4[v_x];
                    for (let _i1492 = 0; _i1492 < _a1491.length; _i1492++) {
                      const v_y = _a1491[_i1492];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q1489 = false;
                        break Q1490;
                      }
                    }
                  }
                  _c1493 = _q1489;
                }
                _c1494 = _c1493;
              }
              if (!(_c1494)) {
                _q1484 = false;
                break Q1485;
              }
            }
          }
          if (!(_q1484)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ M: v_M, L: v_L, c: v_c, R: v_R, m: v_m, b: v_b }, facts)) return 1;
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

const centerRoomFacts: number[] = [];

export function centerRoom(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterRoomBinding> | null): number {
  const _g1524: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a1517 = cluesValued(cl.seg, 6);
  for (let _i1518 = 0; _i1518 < _a1517.length; _i1518++) {
    const v_c = _a1517[_i1518];
    const _h1519 = clueAt(cl.seg, v_c);
    if (!((_h1519 === 6))) continue;
    const _a1520 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i1521 = 0; _i1521 < _a1520.length; _i1521++) {
      const v_L = _a1520[_i1521];
      const _h1522 = clueAt(cl.n, v_L);
      L1523: {
        const v_v = _h1522;
        if (!((v_v >= 0))) break L1523;
        _g1524.length = 0;
        G1525: {
          const _a1528 = sp.adj4[v_c];
          for (let _i1529 = 0; _i1529 < _a1528.length; _i1529++) {
            const v_x = _a1528[_i1529];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g1524.push(v_x);
          }
        }
        L1530: {
          const v_S = _g1524;
          const _h1531 = v_S.length;
          let _c1541: boolean = (_h1531 === 2);
          if (_c1541) {
            const _t1532 = sp.lineCells[v_L];
            let _g1533 = 0;
            G1534: {
              const _a1535 = _t1532;
              for (let _i1536 = 0; _i1536 < _a1535.length; _i1536++) {
                const v_c = _a1535[_i1536];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g1533++;
              }
            }
            let _g1537 = 0;
            G1538: {
              const _a1539 = v_S;
              for (let _i1540 = 0; _i1540 < _a1539.length; _i1540++) {
                const v_x = _a1539[_i1540];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g1537++;
              }
            }
            _c1541 = ((v_v - _g1533) < _g1537);
          }
          if (!(_c1541)) break L1530;
          facts.length = 0;
          changed = false;
          let _q1542 = true;
          Q1543: {
            const _a1544 = v_S;
            for (let _i1545 = 0; _i1545 < _a1544.length; _i1545++) {
              const v_x = _a1544[_i1545];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q1542 = false;
                break Q1543;
              }
            }
          }
          if (!(_q1542)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, v: v_v, S: v_S }, facts)) return 1;
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

const tooLongFacts: number[] = [];

export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g1679: number[] = [];
  const _g1686: number[] = [];
  const _g1732: number[] = [];
  const _g1739: number[] = [];
  const _g1750: number[] = [];
  const _g1758: number[] = [];
  const _g1774: number[] = [];
  const _g1781: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  let _g1667 = -1;
  G1668: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t1669 = cl.fleet.length[v_k];
      let _g1670 = 0;
      G1671: {
        const _a1672 = sp.cells;
        for (let _i1673 = 0; _i1673 < _a1672.length; _i1673++) {
          const v_c = _a1672[_i1673];
          const _h1749 = sp.rowOf[v_c];
          const _h1757 = sp.colOf[v_c];
          let _c1675: boolean = ((b.grid[v_c] || -1) === 1);
          if (_c1675) {
            const _t1674 = step(sp, v_c, 1);
            _c1675 = !(((_t1674 !== -1) && ((b.grid[_t1674] || -1) === 1)));
          }
          let _c1677: boolean = _c1675;
          if (_c1677) {
            const _t1676 = step(sp, v_c, 3);
            _c1677 = !(((_t1676 !== -1) && ((b.grid[_t1676] || -1) === 1)));
          }
          let _c1692: boolean = _c1677;
          if (_c1692) {
            const _t1678 = sp.rowOf[v_c];
            _g1679.length = 0;
            G1680: {
              const _a1683 = sp.lineCells[_t1678];
              for (let _i1684 = 0; _i1684 < _a1683.length; _i1684++) {
                const v_x = _a1683[_i1684];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g1679.push(v_x);
              }
            }
            const _t1685 = sp.colOf[v_c];
            _g1686.length = 0;
            G1687: {
              const _a1690 = sp.lineCells[_t1685];
              for (let _i1691 = 0; _i1691 < _a1690.length; _i1691++) {
                const v_x = _a1690[_i1691];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g1686.push(v_x);
              }
            }
            _c1692 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1679), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1686)).length === _t1669);
          }
          let _c1765: boolean = _c1692;
          if (_c1765) {
            let _q1729 = true;
            Q1730: {
              const _t1731 = sp.rowOf[v_c];
              _g1732.length = 0;
              G1733: {
                const _a1736 = sp.lineCells[_t1731];
                for (let _i1737 = 0; _i1737 < _a1736.length; _i1737++) {
                  const v_x = _a1736[_i1737];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1732.push(v_x);
                }
              }
              const _t1738 = sp.colOf[v_c];
              _g1739.length = 0;
              G1740: {
                const _a1743 = sp.lineCells[_t1738];
                for (let _i1744 = 0; _i1744 < _a1743.length; _i1744++) {
                  const v_x = _a1743[_i1744];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g1739.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1732), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1739));
              const _a1745 = v_G;
              for (let _i1746 = 0; _i1746 < _a1745.length; _i1746++) {
                const v_x = _a1745[_i1746];
                const _a1747 = sp.adj4[v_x];
                for (let _i1748 = 0; _i1748 < _a1747.length; _i1748++) {
                  const v_y = _a1747[_i1748];
                  let _c1756: boolean = !(v_G.includes(v_y));
                  if (_c1756) {
                    _g1750.length = 0;
                    G1751: {
                      const _a1754 = sp.lineCells[_h1749];
                      for (let _i1755 = 0; _i1755 < _a1754.length; _i1755++) {
                        const v_x = _a1754[_i1755];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g1750.push(v_x);
                      }
                    }
                    _c1756 = ((stretch(sp.lineCells[_h1749], v_c, _g1750).length === 1) || (sp.lineCells[_h1749].includes(v_y)));
                  }
                  let _c1764: boolean = _c1756;
                  if (_c1764) {
                    _g1758.length = 0;
                    G1759: {
                      const _a1762 = sp.lineCells[_h1757];
                      for (let _i1763 = 0; _i1763 < _a1762.length; _i1763++) {
                        const v_x = _a1762[_i1763];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g1758.push(v_x);
                      }
                    }
                    _c1764 = ((stretch(sp.lineCells[_h1757], v_c, _g1758).length === 1) || (sp.lineCells[_h1757].includes(v_y)));
                  }
                  if (!(_c1764)) continue;
                  if (!(((b.grid[v_y] || -1) === 2))) {
                    _q1729 = false;
                    break Q1730;
                  }
                }
              }
            }
            _c1765 = _q1729;
          }
          if (!(_c1765)) continue;
          _g1670++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g1670))) continue;
      const _t1766 = cl.fleet.length[v_k];
      if (_g1667 === -1 || _t1766 > _g1667) _g1667 = _t1766;
    }
  }
  const v_M = _g1667;
  const _a1767 = sp.cells;
  for (let _i1768 = 0; _i1768 < _a1767.length; _i1768++) {
    const v_c = _a1767[_i1768];
    let _c1787: boolean = !((b.grid[v_c] !== 0));
    if (_c1787) {
      let _g1769 = 0;
      G1770: {
        const _a1771 = sp.adj4[v_c];
        for (let _i1772 = 0; _i1772 < _a1771.length; _i1772++) {
          const v_a = _a1771[_i1772];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t1773 = sp.rowOf[v_a];
          _g1774.length = 0;
          G1775: {
            const _a1778 = sp.lineCells[_t1773];
            for (let _i1779 = 0; _i1779 < _a1778.length; _i1779++) {
              const v_x = _a1778[_i1779];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g1774.push(v_x);
            }
          }
          const _t1780 = sp.colOf[v_a];
          _g1781.length = 0;
          G1782: {
            const _a1785 = sp.lineCells[_t1780];
            for (let _i1786 = 0; _i1786 < _a1785.length; _i1786++) {
              const v_x = _a1785[_i1786];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g1781.push(v_x);
            }
          }
          _g1769 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g1774), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g1781)).length;
        }
      }
      _c1787 = ((1 + _g1769) > v_M);
    }
    if (!(_c1787)) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ M: v_M, c: v_c }, facts)) return 1;
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

const shortRunFacts: number[] = [];

export function shortRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShortRunBinding> | null): number {
  const _g1910: number[] = [];
  const _g1918: number[] = [];
  const _g1937: number[] = [];
  const _g1944: number[] = [];
  const _g1990: number[] = [];
  const _g1997: number[] = [];
  const _g2008: number[] = [];
  const _g2016: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a1906 = sp.lines;
  for (let _i1907 = 0; _i1907 < _a1906.length; _i1907++) {
    const v_L = _a1906[_i1907];
    const _a1908 = sp.lineCells[v_L];
    for (let _i1909 = 0; _i1909 < _a1908.length; _i1909++) {
      const v_c = _a1908[_i1909];
      _g1910.length = 0;
      G1911: {
        const _a1914 = sp.lineCells[v_L];
        for (let _i1915 = 0; _i1915 < _a1914.length; _i1915++) {
          const v_x = _a1914[_i1915];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g1910.push(v_x);
        }
      }
      L1916: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g1910);
        const _h1917 = v_R.length;
        if (!(((_h1917 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L1916;
        _g1918.length = 0;
        G1919: {
          const _a1922 = v_R;
          for (let _i1923 = 0; _i1923 < _a1922.length; _i1923++) {
            const v_c = _a1922[_i1923];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g1918.push(v_c);
          }
        }
        L1924: {
          const v_O = _g1918;
          const _h1925 = v_O.length;
          let _c2024: boolean = (_h1925 === 1);
          if (_c2024) {
            let _q1926 = true;
            Q1927: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === _h1917))) continue;
                let _g1928 = 0;
                G1929: {
                  const _a1930 = sp.cells;
                  for (let _i1931 = 0; _i1931 < _a1930.length; _i1931++) {
                    const v_c = _a1930[_i1931];
                    const _h2007 = sp.rowOf[v_c];
                    const _h2015 = sp.colOf[v_c];
                    let _c1933: boolean = ((b.grid[v_c] || -1) === 1);
                    if (_c1933) {
                      const _t1932 = step(sp, v_c, 1);
                      _c1933 = !(((_t1932 !== -1) && ((b.grid[_t1932] || -1) === 1)));
                    }
                    let _c1935: boolean = _c1933;
                    if (_c1935) {
                      const _t1934 = step(sp, v_c, 3);
                      _c1935 = !(((_t1934 !== -1) && ((b.grid[_t1934] || -1) === 1)));
                    }
                    let _c1950: boolean = _c1935;
                    if (_c1950) {
                      const _t1936 = sp.rowOf[v_c];
                      _g1937.length = 0;
                      G1938: {
                        const _a1941 = sp.lineCells[_t1936];
                        for (let _i1942 = 0; _i1942 < _a1941.length; _i1942++) {
                          const v_x = _a1941[_i1942];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g1937.push(v_x);
                        }
                      }
                      const _t1943 = sp.colOf[v_c];
                      _g1944.length = 0;
                      G1945: {
                        const _a1948 = sp.lineCells[_t1943];
                        for (let _i1949 = 0; _i1949 < _a1948.length; _i1949++) {
                          const v_x = _a1948[_i1949];
                          if (!(((b.grid[v_x] || -1) === 1))) continue;
                          _g1944.push(v_x);
                        }
                      }
                      _c1950 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1937), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1944)).length === _h1917);
                    }
                    let _c2023: boolean = _c1950;
                    if (_c2023) {
                      let _q1987 = true;
                      Q1988: {
                        const _t1989 = sp.rowOf[v_c];
                        _g1990.length = 0;
                        G1991: {
                          const _a1994 = sp.lineCells[_t1989];
                          for (let _i1995 = 0; _i1995 < _a1994.length; _i1995++) {
                            const v_x = _a1994[_i1995];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g1990.push(v_x);
                          }
                        }
                        const _t1996 = sp.colOf[v_c];
                        _g1997.length = 0;
                        G1998: {
                          const _a2001 = sp.lineCells[_t1996];
                          for (let _i2002 = 0; _i2002 < _a2001.length; _i2002++) {
                            const v_x = _a2001[_i2002];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g1997.push(v_x);
                          }
                        }
                        const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g1990), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g1997));
                        const _a2003 = v_G;
                        for (let _i2004 = 0; _i2004 < _a2003.length; _i2004++) {
                          const v_x = _a2003[_i2004];
                          const _a2005 = sp.adj4[v_x];
                          for (let _i2006 = 0; _i2006 < _a2005.length; _i2006++) {
                            const v_y = _a2005[_i2006];
                            let _c2014: boolean = !(v_G.includes(v_y));
                            if (_c2014) {
                              _g2008.length = 0;
                              G2009: {
                                const _a2012 = sp.lineCells[_h2007];
                                for (let _i2013 = 0; _i2013 < _a2012.length; _i2013++) {
                                  const v_x = _a2012[_i2013];
                                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                                  _g2008.push(v_x);
                                }
                              }
                              _c2014 = ((stretch(sp.lineCells[_h2007], v_c, _g2008).length === 1) || (sp.lineCells[_h2007].includes(v_y)));
                            }
                            let _c2022: boolean = _c2014;
                            if (_c2022) {
                              _g2016.length = 0;
                              G2017: {
                                const _a2020 = sp.lineCells[_h2015];
                                for (let _i2021 = 0; _i2021 < _a2020.length; _i2021++) {
                                  const v_x = _a2020[_i2021];
                                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                                  _g2016.push(v_x);
                                }
                              }
                              _c2022 = ((stretch(sp.lineCells[_h2015], v_c, _g2016).length === 1) || (sp.lineCells[_h2015].includes(v_y)));
                            }
                            if (!(_c2022)) continue;
                            if (!(((b.grid[v_y] || -1) === 2))) {
                              _q1987 = false;
                              break Q1988;
                            }
                          }
                        }
                      }
                      _c2023 = _q1987;
                    }
                    if (!(_c2023)) continue;
                    _g1928++;
                  }
                }
                if (!((cl.fleet.boats[v_k] <= _g1928))) {
                  _q1926 = false;
                  break Q1927;
                }
              }
            }
            _c2024 = _q1926;
          }
          if (!(_c2024)) break L1924;
          facts.length = 0;
          changed = false;
          let _q2025 = true;
          Q2026: {
            const _a2027 = v_O;
            for (let _i2028 = 0; _i2028 < _a2027.length; _i2028++) {
              const v_x = _a2027[_i2028];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q2025 = false;
                break Q2026;
              }
            }
          }
          if (!(_q2025)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R, O: v_O }, facts)) return 1;
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

const hiddenFacts: number[] = [];

export function hidden(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<HiddenBinding> | null): number {
  const _g2151: number[] = [];
  const _g2217: number[] = [];
  const _g2227: number[] = [];
  const _g2239: number[] = [];
  const _g2250: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a2147 = sp.lines;
  for (let _i2148 = 0; _i2148 < _a2147.length; _i2148++) {
    const v_L = _a2147[_i2148];
    const _h2149 = clueAt(cl.n, v_L);
    if (!((_h2149 < 0))) continue;
    const _t2150 = sp.lineCells[v_L];
    _g2151.length = 0;
    G2152: {
      const _a2155 = _t2150;
      for (let _i2156 = 0; _i2156 < _a2155.length; _i2156++) {
        const v_c = _a2155[_i2156];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g2151.push(v_c);
      }
    }
    L2157: {
      const v_O = _g2151;
      const _h2158 = v_O.length;
      if (!((_h2158 > 0))) break L2157;
      let _g2210 = -1;
      G2211: {
        const _a2212 = setOf(v_L);
        for (let _i2213 = 0; _i2213 < _a2212.length; _i2213++) {
          const v_K = _a2212[_i2213];
          const _h2214 = clueAt(cl.n, v_K);
          let _c2234: boolean = (_h2214 < 0);
          if (_c2234) {
            let _q2215 = true;
            Q2216: {
              _g2217.length = 0;
              G2218: {
                const _a2221 = sp.lines;
                for (let _i2222 = 0; _i2222 < _a2221.length; _i2222++) {
                  const v_M = _a2221[_i2222];
                  if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                  _g2217.push(v_M);
                }
              }
              const _a2223 = _g2217;
              for (let _i2224 = 0; _i2224 < _a2223.length; _i2224++) {
                const v_M = _a2223[_i2224];
                const _h2225 = clueAt(cl.n, v_M);
                let _c2233: boolean = (_h2225 >= 0);
                if (!_c2233) {
                  const _t2226 = sp.lineCells[v_M];
                  _g2227.length = 0;
                  G2228: {
                    const _a2231 = _t2226;
                    for (let _i2232 = 0; _i2232 < _a2231.length; _i2232++) {
                      const v_c = _a2231[_i2232];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g2227.push(v_c);
                    }
                  }
                  _c2233 = (_g2227.length === 0);
                }
                if (!(_c2233)) {
                  _q2215 = false;
                  break Q2216;
                }
              }
            }
            _c2234 = _q2215;
          }
          if (!(_c2234)) continue;
          let _g2235 = 0;
          G2236: {
            for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
              _g2235 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
            }
          }
          let _g2237 = 0;
          G2238: {
            _g2239.length = 0;
            G2240: {
              const _a2243 = sp.lines;
              for (let _i2244 = 0; _i2244 < _a2243.length; _i2244++) {
                const v_M = _a2243[_i2244];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2239.push(v_M);
              }
            }
            const _a2245 = _g2239;
            for (let _i2246 = 0; _i2246 < _a2245.length; _i2246++) {
              const v_M = _a2245[_i2246];
              const _h2247 = clueAt(cl.n, v_M);
              if (!((_h2247 >= 0))) continue;
              _g2237 += _h2247;
            }
          }
          let _g2248 = 0;
          G2249: {
            _g2250.length = 0;
            G2251: {
              const _a2254 = sp.lines;
              for (let _i2255 = 0; _i2255 < _a2254.length; _i2255++) {
                const v_M = _a2254[_i2255];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g2250.push(v_M);
              }
            }
            const _a2256 = _g2250;
            for (let _i2257 = 0; _i2257 < _a2256.length; _i2257++) {
              const v_M = _a2256[_i2257];
              const _h2258 = clueAt(cl.n, v_M);
              if (!((_h2258 < 0))) continue;
              const _t2259 = sp.lineCells[v_M];
              let _g2260 = 0;
              G2261: {
                const _a2262 = _t2259;
                for (let _i2263 = 0; _i2263 < _a2262.length; _i2263++) {
                  const v_c = _a2262[_i2263];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g2260++;
                }
              }
              _g2248 += _g2260;
            }
          }
          const _t2264 = ((_g2235 - _g2237) - _g2248);
          if (_g2210 === -1 || _t2264 > _g2210) _g2210 = _t2264;
        }
      }
      L2265: {
        const v_v = _g2210;
        if (!((v_v >= 0))) break L2265;
        const _t2266 = sp.lineCells[v_L];
        let _g2267 = 0;
        G2268: {
          const _a2269 = _t2266;
          for (let _i2270 = 0; _i2270 < _a2269.length; _i2270++) {
            const v_c = _a2269[_i2270];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g2267++;
          }
        }
        const v_left = (v_v - _g2267);
        facts.length = 0;
        changed = false;
        let _c2276: boolean = ((v_left >= 0) && (v_left <= _h2158));
        if (_c2276) {
          let _c2275: boolean = !((v_left === 0));
          if (!_c2275) {
            let _q2271 = true;
            Q2272: {
              const _a2273 = v_O;
              for (let _i2274 = 0; _i2274 < _a2273.length; _i2274++) {
                const v_c = _a2273[_i2274];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q2271 = false;
                  break Q2272;
                }
              }
            }
            _c2275 = _q2271;
          }
          _c2276 = _c2275;
        }
        let _c2282: boolean = _c2276;
        if (_c2282) {
          let _c2281: boolean = !((v_left === _h2158));
          if (!_c2281) {
            let _q2277 = true;
            Q2278: {
              const _a2279 = v_O;
              for (let _i2280 = 0; _i2280 < _a2279.length; _i2280++) {
                const v_c = _a2279[_i2280];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q2277 = false;
                  break Q2278;
                }
              }
            }
            _c2281 = _q2277;
          }
          _c2282 = _c2281;
        }
        if (!(_c2282)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, O: v_O, v: v_v, left: v_left }, facts)) return 1;
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

const onlyRunsFacts: number[] = [];

export function onlyRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunsBinding> | null): number {
  const _g2606: number[] = [];
  const _g2613: number[] = [];
  const _g2659: number[] = [];
  const _g2666: number[] = [];
  const _g2677: number[] = [];
  const _g2685: number[] = [];
  const _g2707: number[] = [];
  const _g2738: number[] = [];
  const _g2758: number[] = [];
  const _g2765: number[] = [];
  const _g2811: number[] = [];
  const _g2818: number[] = [];
  const _g2829: number[] = [];
  const _g2837: number[] = [];
  const _g2859: number[] = [];
  const _g2900: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  let _g2594 = -1;
  G2595: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      const _t2596 = cl.fleet.length[v_k];
      let _g2597 = 0;
      G2598: {
        const _a2599 = sp.cells;
        for (let _i2600 = 0; _i2600 < _a2599.length; _i2600++) {
          const v_c = _a2599[_i2600];
          const _h2676 = sp.rowOf[v_c];
          const _h2684 = sp.colOf[v_c];
          let _c2602: boolean = ((b.grid[v_c] || -1) === 1);
          if (_c2602) {
            const _t2601 = step(sp, v_c, 1);
            _c2602 = !(((_t2601 !== -1) && ((b.grid[_t2601] || -1) === 1)));
          }
          let _c2604: boolean = _c2602;
          if (_c2604) {
            const _t2603 = step(sp, v_c, 3);
            _c2604 = !(((_t2603 !== -1) && ((b.grid[_t2603] || -1) === 1)));
          }
          let _c2619: boolean = _c2604;
          if (_c2619) {
            const _t2605 = sp.rowOf[v_c];
            _g2606.length = 0;
            G2607: {
              const _a2610 = sp.lineCells[_t2605];
              for (let _i2611 = 0; _i2611 < _a2610.length; _i2611++) {
                const v_x = _a2610[_i2611];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g2606.push(v_x);
              }
            }
            const _t2612 = sp.colOf[v_c];
            _g2613.length = 0;
            G2614: {
              const _a2617 = sp.lineCells[_t2612];
              for (let _i2618 = 0; _i2618 < _a2617.length; _i2618++) {
                const v_x = _a2617[_i2618];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g2613.push(v_x);
              }
            }
            _c2619 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2606), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2613)).length === _t2596);
          }
          let _c2692: boolean = _c2619;
          if (_c2692) {
            let _q2656 = true;
            Q2657: {
              const _t2658 = sp.rowOf[v_c];
              _g2659.length = 0;
              G2660: {
                const _a2663 = sp.lineCells[_t2658];
                for (let _i2664 = 0; _i2664 < _a2663.length; _i2664++) {
                  const v_x = _a2663[_i2664];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g2659.push(v_x);
                }
              }
              const _t2665 = sp.colOf[v_c];
              _g2666.length = 0;
              G2667: {
                const _a2670 = sp.lineCells[_t2665];
                for (let _i2671 = 0; _i2671 < _a2670.length; _i2671++) {
                  const v_x = _a2670[_i2671];
                  if (!(((b.grid[v_x] || -1) === 1))) continue;
                  _g2666.push(v_x);
                }
              }
              const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2659), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2666));
              const _a2672 = v_G;
              for (let _i2673 = 0; _i2673 < _a2672.length; _i2673++) {
                const v_x = _a2672[_i2673];
                const _a2674 = sp.adj4[v_x];
                for (let _i2675 = 0; _i2675 < _a2674.length; _i2675++) {
                  const v_y = _a2674[_i2675];
                  let _c2683: boolean = !(v_G.includes(v_y));
                  if (_c2683) {
                    _g2677.length = 0;
                    G2678: {
                      const _a2681 = sp.lineCells[_h2676];
                      for (let _i2682 = 0; _i2682 < _a2681.length; _i2682++) {
                        const v_x = _a2681[_i2682];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g2677.push(v_x);
                      }
                    }
                    _c2683 = ((stretch(sp.lineCells[_h2676], v_c, _g2677).length === 1) || (sp.lineCells[_h2676].includes(v_y)));
                  }
                  let _c2691: boolean = _c2683;
                  if (_c2691) {
                    _g2685.length = 0;
                    G2686: {
                      const _a2689 = sp.lineCells[_h2684];
                      for (let _i2690 = 0; _i2690 < _a2689.length; _i2690++) {
                        const v_x = _a2689[_i2690];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g2685.push(v_x);
                      }
                    }
                    _c2691 = ((stretch(sp.lineCells[_h2684], v_c, _g2685).length === 1) || (sp.lineCells[_h2684].includes(v_y)));
                  }
                  if (!(_c2691)) continue;
                  if (!(((b.grid[v_y] || -1) === 2))) {
                    _q2656 = false;
                    break Q2657;
                  }
                }
              }
            }
            _c2692 = _q2656;
          }
          if (!(_c2692)) continue;
          _g2597++;
        }
      }
      if (!((cl.fleet.boats[v_k] > _g2597))) continue;
      const _t2693 = cl.fleet.length[v_k];
      if (_g2594 === -1 || _t2693 > _g2594) _g2594 = _t2693;
    }
  }
  L2694: {
    const v_m = _g2594;
    if (!((v_m > 0))) break L2694;
    const _h2737 = (2 * v_m);
    const _h2925 = (_h2737 + 1);
    const _a2695 = sp.lines;
    for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
      const v_L = _a2695[_i2696];
      const _h2723 = clueAt(cl.n, v_L);
      const _h2724 = (_h2723 < 0);
      const _a2697 = sp.lineCells[v_L];
      for (let _i2698 = 0; _i2698 < _a2697.length; _i2698++) {
        const v_c = _a2697[_i2698];
        const _h2703 = (v_c % sp.w);
        const _h2704 = ((v_c / sp.w) | 0);
        const _h2705 = (_h2703 + _h2704);
        let _c2706: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c2706) {
          let _q2699 = false;
          Q2700: {
            const _a2701 = sp.adj4[v_c];
            for (let _i2702 = 0; _i2702 < _a2701.length; _i2702++) {
              const v_p = _a2701[_i2702];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h2705)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q2699 = true;
                break Q2700;
              }
            }
          }
          _c2706 = !(_q2699);
        }
        if (!(_c2706)) continue;
        _g2707.length = 0;
        G2708: {
          const _a2711 = sp.lineCells[v_L];
          for (let _i2712 = 0; _i2712 < _a2711.length; _i2712++) {
            const v_x = _a2711[_i2712];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g2707.push(v_x);
          }
        }
        L2713: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g2707);
          const _h2718 = v_R.length;
          let _g2714 = 0;
          G2715: {
            const _a2716 = v_R;
            for (let _i2717 = 0; _i2717 < _a2716.length; _i2717++) {
              const v_c = _a2716[_i2717];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g2714++;
            }
          }
          let _c2736: boolean = (_g2714 < _h2718);
          if (_c2736) {
            let _g2719 = 0;
            G2720: {
              const _a2721 = v_R;
              for (let _i2722 = 0; _i2722 < _a2721.length; _i2722++) {
                const v_c = _a2721[_i2722];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g2719++;
              }
            }
            let _c2735: boolean = ((_g2719 < _h2718) && (_h2718 >= v_m));
            if (_c2735) {
              let _c2734: boolean = _h2724;
              if (!_c2734) {
                const _t2725 = sp.lineCells[v_L];
                let _g2726 = 0;
                G2727: {
                  const _a2728 = _t2725;
                  for (let _i2729 = 0; _i2729 < _a2728.length; _i2729++) {
                    const v_c = _a2728[_i2729];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g2726++;
                  }
                }
                let _g2730 = 0;
                G2731: {
                  const _a2732 = v_R;
                  for (let _i2733 = 0; _i2733 < _a2732.length; _i2733++) {
                    const v_c = _a2732[_i2733];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g2730++;
                  }
                }
                _c2734 = (((_h2723 - _g2726) + _g2730) >= v_m);
              }
              _c2735 = _c2734;
            }
            _c2736 = _c2735;
          }
          if (!((_c2736 && (_h2718 < _h2737)))) break L2713;
          const _h2744 = (_h2718 - v_m);
          _g2738.length = 0;
          G2739: {
            const _a2742 = v_R;
            for (let _i2743 = 0; _i2743 < _a2742.length; _i2743++) {
              const v_x = _a2742[_i2743];
              if (!(((_i2743 >= _h2744) && (_i2743 < v_m)))) continue;
              _g2738.push(v_x);
            }
          }
          L2745: {
            const v_C = _g2738;
            const _h2746 = v_C.length;
            if (!((_h2746 > 0))) break L2745;
            const _h2931 = (_h2746 > 1);
            let _g2747 = 0;
            G2748: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === v_m))) continue;
                _g2747 += cl.fleet.boats[v_k];
              }
            }
            let _g2749 = 0;
            G2750: {
              const _a2751 = sp.cells;
              for (let _i2752 = 0; _i2752 < _a2751.length; _i2752++) {
                const v_c = _a2751[_i2752];
                const _h2828 = sp.rowOf[v_c];
                const _h2836 = sp.colOf[v_c];
                let _c2754: boolean = ((b.grid[v_c] || -1) === 1);
                if (_c2754) {
                  const _t2753 = step(sp, v_c, 1);
                  _c2754 = !(((_t2753 !== -1) && ((b.grid[_t2753] || -1) === 1)));
                }
                let _c2756: boolean = _c2754;
                if (_c2756) {
                  const _t2755 = step(sp, v_c, 3);
                  _c2756 = !(((_t2755 !== -1) && ((b.grid[_t2755] || -1) === 1)));
                }
                let _c2771: boolean = _c2756;
                if (_c2771) {
                  const _t2757 = sp.rowOf[v_c];
                  _g2758.length = 0;
                  G2759: {
                    const _a2762 = sp.lineCells[_t2757];
                    for (let _i2763 = 0; _i2763 < _a2762.length; _i2763++) {
                      const v_x = _a2762[_i2763];
                      if (!(((b.grid[v_x] || -1) === 1))) continue;
                      _g2758.push(v_x);
                    }
                  }
                  const _t2764 = sp.colOf[v_c];
                  _g2765.length = 0;
                  G2766: {
                    const _a2769 = sp.lineCells[_t2764];
                    for (let _i2770 = 0; _i2770 < _a2769.length; _i2770++) {
                      const v_x = _a2769[_i2770];
                      if (!(((b.grid[v_x] || -1) === 1))) continue;
                      _g2765.push(v_x);
                    }
                  }
                  _c2771 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2758), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2765)).length === v_m);
                }
                let _c2844: boolean = _c2771;
                if (_c2844) {
                  let _q2808 = true;
                  Q2809: {
                    const _t2810 = sp.rowOf[v_c];
                    _g2811.length = 0;
                    G2812: {
                      const _a2815 = sp.lineCells[_t2810];
                      for (let _i2816 = 0; _i2816 < _a2815.length; _i2816++) {
                        const v_x = _a2815[_i2816];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g2811.push(v_x);
                      }
                    }
                    const _t2817 = sp.colOf[v_c];
                    _g2818.length = 0;
                    G2819: {
                      const _a2822 = sp.lineCells[_t2817];
                      for (let _i2823 = 0; _i2823 < _a2822.length; _i2823++) {
                        const v_x = _a2822[_i2823];
                        if (!(((b.grid[v_x] || -1) === 1))) continue;
                        _g2818.push(v_x);
                      }
                    }
                    const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2811), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2818));
                    const _a2824 = v_G;
                    for (let _i2825 = 0; _i2825 < _a2824.length; _i2825++) {
                      const v_x = _a2824[_i2825];
                      const _a2826 = sp.adj4[v_x];
                      for (let _i2827 = 0; _i2827 < _a2826.length; _i2827++) {
                        const v_y = _a2826[_i2827];
                        let _c2835: boolean = !(v_G.includes(v_y));
                        if (_c2835) {
                          _g2829.length = 0;
                          G2830: {
                            const _a2833 = sp.lineCells[_h2828];
                            for (let _i2834 = 0; _i2834 < _a2833.length; _i2834++) {
                              const v_x = _a2833[_i2834];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g2829.push(v_x);
                            }
                          }
                          _c2835 = ((stretch(sp.lineCells[_h2828], v_c, _g2829).length === 1) || (sp.lineCells[_h2828].includes(v_y)));
                        }
                        let _c2843: boolean = _c2835;
                        if (_c2843) {
                          _g2837.length = 0;
                          G2838: {
                            const _a2841 = sp.lineCells[_h2836];
                            for (let _i2842 = 0; _i2842 < _a2841.length; _i2842++) {
                              const v_x = _a2841[_i2842];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g2837.push(v_x);
                            }
                          }
                          _c2843 = ((stretch(sp.lineCells[_h2836], v_c, _g2837).length === 1) || (sp.lineCells[_h2836].includes(v_y)));
                        }
                        if (!(_c2843)) continue;
                        if (!(((b.grid[v_y] || -1) === 2))) {
                          _q2808 = false;
                          break Q2809;
                        }
                      }
                    }
                  }
                  _c2844 = _q2808;
                }
                if (!(_c2844)) continue;
                _g2749++;
              }
            }
            const v_b = (_g2747 - _g2749);
            let _g2845 = 0;
            G2846: {
              const _a2847 = sp.lines;
              for (let _i2848 = 0; _i2848 < _a2847.length; _i2848++) {
                const v_K = _a2847[_i2848];
                const _h2871 = clueAt(cl.n, v_K);
                const _h2872 = (_h2871 < 0);
                const _a2849 = sp.lineCells[v_K];
                for (let _i2850 = 0; _i2850 < _a2849.length; _i2850++) {
                  const v_d = _a2849[_i2850];
                  const _h2855 = (v_d % sp.w);
                  const _h2856 = ((v_d / sp.w) | 0);
                  const _h2857 = (_h2855 + _h2856);
                  let _c2858: boolean = ((b.grid[v_d] || -1) !== 2);
                  if (_c2858) {
                    let _q2851 = false;
                    Q2852: {
                      const _a2853 = sp.adj4[v_d];
                      for (let _i2854 = 0; _i2854 < _a2853.length; _i2854++) {
                        const v_p = _a2853[_i2854];
                        if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h2857)))) continue;
                        if (((b.grid[v_p] || -1) !== 2)) {
                          _q2851 = true;
                          break Q2852;
                        }
                      }
                    }
                    _c2858 = !(_q2851);
                  }
                  let _c2884: boolean = _c2858;
                  if (_c2884) {
                    _g2859.length = 0;
                    G2860: {
                      const _a2863 = sp.lineCells[v_K];
                      for (let _i2864 = 0; _i2864 < _a2863.length; _i2864++) {
                        const v_x = _a2863[_i2864];
                        if (!(((b.grid[v_x] || -1) !== 2))) continue;
                        _g2859.push(v_x);
                      }
                    }
                    const _t2865 = stretch(sp.lineCells[v_K], v_d, _g2859);
                    const _h2870 = _t2865.length;
                    let _g2866 = 0;
                    G2867: {
                      const _a2868 = _t2865;
                      for (let _i2869 = 0; _i2869 < _a2868.length; _i2869++) {
                        const v_c = _a2868[_i2869];
                        if (!(((b.grid[v_c] || -1) === 1))) continue;
                        _g2866++;
                      }
                    }
                    let _c2883: boolean = ((_g2866 < _h2870) && (_h2870 >= v_m));
                    if (_c2883) {
                      let _c2882: boolean = _h2872;
                      if (!_c2882) {
                        const _t2873 = sp.lineCells[v_K];
                        let _g2874 = 0;
                        G2875: {
                          const _a2876 = _t2873;
                          for (let _i2877 = 0; _i2877 < _a2876.length; _i2877++) {
                            const v_c = _a2876[_i2877];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g2874++;
                          }
                        }
                        let _g2878 = 0;
                        G2879: {
                          const _a2880 = _t2865;
                          for (let _i2881 = 0; _i2881 < _a2880.length; _i2881++) {
                            const v_c = _a2880[_i2881];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g2878++;
                          }
                        }
                        _c2882 = (((_h2871 - _g2874) + _g2878) >= v_m);
                      }
                      _c2883 = _c2882;
                    }
                    _c2884 = _c2883;
                  }
                  if (!(_c2884)) continue;
                  _g2845++;
                }
              }
            }
            L2885: {
              const v_r = _g2845;
              let _c2926: boolean = (v_r === v_b);
              if (_c2926) {
                let _q2886 = false;
                Q2887: {
                  const _a2888 = sp.lines;
                  for (let _i2889 = 0; _i2889 < _a2888.length; _i2889++) {
                    const v_K = _a2888[_i2889];
                    const _h2912 = clueAt(cl.n, v_K);
                    const _h2913 = (_h2912 < 0);
                    const _a2890 = sp.lineCells[v_K];
                    for (let _i2891 = 0; _i2891 < _a2890.length; _i2891++) {
                      const v_d = _a2890[_i2891];
                      const _h2896 = (v_d % sp.w);
                      const _h2897 = ((v_d / sp.w) | 0);
                      const _h2898 = (_h2896 + _h2897);
                      let _c2899: boolean = ((b.grid[v_d] || -1) !== 2);
                      if (_c2899) {
                        let _q2892 = false;
                        Q2893: {
                          const _a2894 = sp.adj4[v_d];
                          for (let _i2895 = 0; _i2895 < _a2894.length; _i2895++) {
                            const v_p = _a2894[_i2895];
                            if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h2898)))) continue;
                            if (((b.grid[v_p] || -1) !== 2)) {
                              _q2892 = true;
                              break Q2893;
                            }
                          }
                        }
                        _c2899 = !(_q2892);
                      }
                      if (!(_c2899)) continue;
                      _g2900.length = 0;
                      G2901: {
                        const _a2904 = sp.lineCells[v_K];
                        for (let _i2905 = 0; _i2905 < _a2904.length; _i2905++) {
                          const v_x = _a2904[_i2905];
                          if (!(((b.grid[v_x] || -1) !== 2))) continue;
                          _g2900.push(v_x);
                        }
                      }
                      L2906: {
                        const v_R = stretch(sp.lineCells[v_K], v_d, _g2900);
                        const _h2911 = v_R.length;
                        let _g2907 = 0;
                        G2908: {
                          const _a2909 = v_R;
                          for (let _i2910 = 0; _i2910 < _a2909.length; _i2910++) {
                            const v_c = _a2909[_i2910];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g2907++;
                          }
                        }
                        let _c2924: boolean = ((_g2907 < _h2911) && (_h2911 >= v_m));
                        if (_c2924) {
                          let _c2923: boolean = _h2913;
                          if (!_c2923) {
                            const _t2914 = sp.lineCells[v_K];
                            let _g2915 = 0;
                            G2916: {
                              const _a2917 = _t2914;
                              for (let _i2918 = 0; _i2918 < _a2917.length; _i2918++) {
                                const v_c = _a2917[_i2918];
                                if (!(((b.grid[v_c] || -1) === 1))) continue;
                                _g2915++;
                              }
                            }
                            let _g2919 = 0;
                            G2920: {
                              const _a2921 = v_R;
                              for (let _i2922 = 0; _i2922 < _a2921.length; _i2922++) {
                                const v_c = _a2921[_i2922];
                                if (!(((b.grid[v_c] || -1) === 1))) continue;
                                _g2919++;
                              }
                            }
                            _c2923 = (((_h2912 - _g2915) + _g2919) >= v_m);
                          }
                          _c2924 = _c2923;
                        }
                        if (!(_c2924)) break L2906;
                        if ((_h2911 >= _h2925)) {
                          _q2886 = true;
                          break Q2887;
                        }
                      }
                    }
                  }
                }
                _c2926 = !(_q2886);
              }
              if (!(_c2926)) break L2885;
              facts.length = 0;
              changed = false;
              let _q2927 = true;
              Q2928: {
                const _a2929 = v_C;
                for (let _i2930 = 0; _i2930 < _a2929.length; _i2930++) {
                  const v_x = _a2929[_i2930];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c2937: boolean = true;
                  if (_c2937) {
                    let _c2936: boolean = _h2931;
                    if (!_c2936) {
                      let _q2932 = true;
                      Q2933: {
                        const _a2934 = sp.adj4[v_x];
                        for (let _i2935 = 0; _i2935 < _a2934.length; _i2935++) {
                          const v_y = _a2934[_i2935];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q2932 = false;
                            break Q2933;
                          }
                        }
                      }
                      _c2936 = _q2932;
                    }
                    _c2937 = _c2936;
                  }
                  if (!(_c2937)) {
                    _q2927 = false;
                    break Q2928;
                  }
                }
              }
              if (!(_q2927)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ m: v_m, L: v_L, c: v_c, R: v_R, C: v_C, b: v_b, r: v_r }, facts)) return 1;
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

const sharedFacts: number[] = [];

export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const _g3540: number[] = [];
  const _g3550: number[] = [];
  const _g3562: number[] = [];
  const _g3573: number[] = [];
  const _g3763: number[] = [];
  const _g3773: number[] = [];
  const _g3785: number[] = [];
  const _g3796: number[] = [];
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  const _a3377 = sp.lines;
  for (let _i3378 = 0; _i3378 < _a3377.length; _i3378++) {
    const v_L = _a3377[_i3378];
    const _h3481 = clueAt(cl.n, v_L);
    let _g3533 = -1;
    G3534: {
      const _a3535 = setOf(v_L);
      for (let _i3536 = 0; _i3536 < _a3535.length; _i3536++) {
        const v_K = _a3535[_i3536];
        const _h3537 = clueAt(cl.n, v_K);
        let _c3557: boolean = (_h3537 < 0);
        if (_c3557) {
          let _q3538 = true;
          Q3539: {
            _g3540.length = 0;
            G3541: {
              const _a3544 = sp.lines;
              for (let _i3545 = 0; _i3545 < _a3544.length; _i3545++) {
                const v_M = _a3544[_i3545];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g3540.push(v_M);
              }
            }
            const _a3546 = _g3540;
            for (let _i3547 = 0; _i3547 < _a3546.length; _i3547++) {
              const v_M = _a3546[_i3547];
              const _h3548 = clueAt(cl.n, v_M);
              let _c3556: boolean = (_h3548 >= 0);
              if (!_c3556) {
                const _t3549 = sp.lineCells[v_M];
                _g3550.length = 0;
                G3551: {
                  const _a3554 = _t3549;
                  for (let _i3555 = 0; _i3555 < _a3554.length; _i3555++) {
                    const v_c = _a3554[_i3555];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g3550.push(v_c);
                  }
                }
                _c3556 = (_g3550.length === 0);
              }
              if (!(_c3556)) {
                _q3538 = false;
                break Q3539;
              }
            }
          }
          _c3557 = _q3538;
        }
        if (!(_c3557)) continue;
        let _g3558 = 0;
        G3559: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g3558 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g3560 = 0;
        G3561: {
          _g3562.length = 0;
          G3563: {
            const _a3566 = sp.lines;
            for (let _i3567 = 0; _i3567 < _a3566.length; _i3567++) {
              const v_M = _a3566[_i3567];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3562.push(v_M);
            }
          }
          const _a3568 = _g3562;
          for (let _i3569 = 0; _i3569 < _a3568.length; _i3569++) {
            const v_M = _a3568[_i3569];
            const _h3570 = clueAt(cl.n, v_M);
            if (!((_h3570 >= 0))) continue;
            _g3560 += _h3570;
          }
        }
        let _g3571 = 0;
        G3572: {
          _g3573.length = 0;
          G3574: {
            const _a3577 = sp.lines;
            for (let _i3578 = 0; _i3578 < _a3577.length; _i3578++) {
              const v_M = _a3577[_i3578];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g3573.push(v_M);
            }
          }
          const _a3579 = _g3573;
          for (let _i3580 = 0; _i3580 < _a3579.length; _i3580++) {
            const v_M = _a3579[_i3580];
            const _h3581 = clueAt(cl.n, v_M);
            if (!((_h3581 < 0))) continue;
            const _t3582 = sp.lineCells[v_M];
            let _g3583 = 0;
            G3584: {
              const _a3585 = _t3582;
              for (let _i3586 = 0; _i3586 < _a3585.length; _i3586++) {
                const v_c = _a3585[_i3586];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g3583++;
              }
            }
            _g3571 += _g3583;
          }
        }
        const _t3587 = ((_g3558 - _g3560) - _g3571);
        if (_g3533 === -1 || _t3587 > _g3533) _g3533 = _t3587;
      }
    }
    L3588: {
      const v_v = ((_h3481 + _g3533) + 1);
      if (!((v_v >= 0))) break L3588;
      let _g3589 = 0;
      G3590: {
        const _a3591 = sp.lineCells[v_L];
        for (let _i3592 = 0; _i3592 < _a3591.length; _i3592++) {
          const v_c = _a3591[_i3592];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g3589++;
        }
      }
      L3593: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g3589);
        if (!(((v_t === 1) || (v_t === 2)))) break L3593;
        const _a3594 = sp.lineCells[v_L];
        for (let _i3595 = 0; _i3595 < _a3594.length; _i3595++) {
          const v_k = _a3594[_i3595];
          let _g3596 = -1;
          let _n3598 = 0;
          G3597: {
            const _a3599 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i3600 = 0; _i3600 < _a3599.length; _i3600++) {
              const v_M = _a3599[_i3600];
              if (!((v_M !== v_L))) continue;
              if (++_n3598 === 2) {
                _g3596 = -1;
                break G3597;
              }
              _g3596 = v_M;
            }
          }
          const v_K = _g3596;
          const _h3703 = clueAt(cl.n, v_K);
          let _g3755 = -1;
          G3756: {
            const _a3758 = setOf(v_K);
            for (let _i3759 = 0; _i3759 < _a3758.length; _i3759++) {
              const v_K_3757 = _a3758[_i3759];
              const _h3760 = clueAt(cl.n, v_K_3757);
              let _c3780: boolean = (_h3760 < 0);
              if (_c3780) {
                let _q3761 = true;
                Q3762: {
                  _g3763.length = 0;
                  G3764: {
                    const _a3767 = sp.lines;
                    for (let _i3768 = 0; _i3768 < _a3767.length; _i3768++) {
                      const v_M = _a3767[_i3768];
                      if (!(((v_M !== v_K_3757) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3757][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3757][1] ?? -1) % sp.w)))))) continue;
                      _g3763.push(v_M);
                    }
                  }
                  const _a3769 = _g3763;
                  for (let _i3770 = 0; _i3770 < _a3769.length; _i3770++) {
                    const v_M = _a3769[_i3770];
                    const _h3771 = clueAt(cl.n, v_M);
                    let _c3779: boolean = (_h3771 >= 0);
                    if (!_c3779) {
                      const _t3772 = sp.lineCells[v_M];
                      _g3773.length = 0;
                      G3774: {
                        const _a3777 = _t3772;
                        for (let _i3778 = 0; _i3778 < _a3777.length; _i3778++) {
                          const v_c = _a3777[_i3778];
                          if (!(!((b.grid[v_c] !== 0)))) continue;
                          _g3773.push(v_c);
                        }
                      }
                      _c3779 = (_g3773.length === 0);
                    }
                    if (!(_c3779)) {
                      _q3761 = false;
                      break Q3762;
                    }
                  }
                }
                _c3780 = _q3761;
              }
              if (!(_c3780)) continue;
              let _g3781 = 0;
              G3782: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g3781 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              let _g3783 = 0;
              G3784: {
                _g3785.length = 0;
                G3786: {
                  const _a3789 = sp.lines;
                  for (let _i3790 = 0; _i3790 < _a3789.length; _i3790++) {
                    const v_M = _a3789[_i3790];
                    if (!(((v_M !== v_K_3757) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3757][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3757][1] ?? -1) % sp.w)))))) continue;
                    _g3785.push(v_M);
                  }
                }
                const _a3791 = _g3785;
                for (let _i3792 = 0; _i3792 < _a3791.length; _i3792++) {
                  const v_M = _a3791[_i3792];
                  const _h3793 = clueAt(cl.n, v_M);
                  if (!((_h3793 >= 0))) continue;
                  _g3783 += _h3793;
                }
              }
              let _g3794 = 0;
              G3795: {
                _g3796.length = 0;
                G3797: {
                  const _a3800 = sp.lines;
                  for (let _i3801 = 0; _i3801 < _a3800.length; _i3801++) {
                    const v_M = _a3800[_i3801];
                    if (!(((v_M !== v_K_3757) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_3757][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_3757][1] ?? -1) % sp.w)))))) continue;
                    _g3796.push(v_M);
                  }
                }
                const _a3802 = _g3796;
                for (let _i3803 = 0; _i3803 < _a3802.length; _i3803++) {
                  const v_M = _a3802[_i3803];
                  const _h3804 = clueAt(cl.n, v_M);
                  if (!((_h3804 < 0))) continue;
                  const _t3805 = sp.lineCells[v_M];
                  let _g3806 = 0;
                  G3807: {
                    const _a3808 = _t3805;
                    for (let _i3809 = 0; _i3809 < _a3808.length; _i3809++) {
                      const v_c = _a3808[_i3809];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g3806++;
                    }
                  }
                  _g3794 += _g3806;
                }
              }
              const _t3810 = ((_g3781 - _g3783) - _g3794);
              if (_g3755 === -1 || _t3810 > _g3755) _g3755 = _t3810;
            }
          }
          const v_j = ((_h3703 + _g3755) + 1);
          const _h3819 = (v_j >= 0);
          let _g3811 = 0;
          G3812: {
            const _a3813 = sp.adj4[v_k];
            for (let _i3814 = 0; _i3814 < _a3813.length; _i3814++) {
              const v_x = _a3813[_i3814];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g3811++;
            }
          }
          let _g3815 = 0;
          G3816: {
            const _a3817 = setOf(v_k);
            for (let _i3818 = 0; _i3818 < _a3817.length; _i3818++) {
              const v_x = _a3817[_i3818];
              let _c3825: boolean = (!((b.grid[v_x] !== 0)) && _h3819);
              if (_c3825) {
                const _t3820 = sp.lineCells[v_K];
                let _g3821 = 0;
                G3822: {
                  const _a3823 = _t3820;
                  for (let _i3824 = 0; _i3824 < _a3823.length; _i3824++) {
                    const v_c = _a3823[_i3824];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g3821++;
                  }
                }
                _c3825 = ((v_j - _g3821) === 1);
              }
              if (!(_c3825)) continue;
              _g3815++;
            }
          }
          L3826: {
            const v_s = (_g3811 + _g3815);
            if (!((v_s > v_t))) break L3826;
            facts.length = 0;
            changed = false;
            let _q3827 = true;
            Q3828: {
              const _a3829 = sp.adj4[v_k];
              for (let _i3830 = 0; _i3830 < _a3829.length; _i3830++) {
                const v_y = _a3829[_i3830];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q3827 = false;
                  break Q3828;
                }
              }
            }
            if (!(_q3827)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ L: v_L, v: v_v, t: v_t, k: v_k, K: v_K, j: v_j, s: v_s }, facts)) return 1;
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

const lastWaterFacts: number[] = [];

export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g4998: number[] = [];
  const _g5008: number[] = [];
  const _g5020: number[] = [];
  const _g5031: number[] = [];
  const _g5221: number[] = [];
  const _g5231: number[] = [];
  const _g5243: number[] = [];
  const _g5254: number[] = [];
  const _g5273: number[] = [];
  const _g5279: number[] = [];
  const _g5289: number[] = [];
  const _g5302: number[] = [];
  const _g5321: number[] = [];
  const _g5494: number[] = [];
  const _g5504: number[] = [];
  const _g5516: number[] = [];
  const _g5527: number[] = [];
  const _g5573: number[] = [];
  const _g5582: number[] = [];
  const _g5667: number[] = [];
  const _g5681: number[] = [];
  const _g5691: number[] = [];
  const _g5705: number[] = [];
  const _g5723: number[] = [];
  const _g5737: number[] = [];
  const _g5766: number[] = [];
  const _g5773: number[] = [];
  const _g5819: number[] = [];
  const _g5826: number[] = [];
  const _g5837: number[] = [];
  const _g5845: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g4832 = -1;
  G4833: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t4834 = cl.fleet.length[v_k];
      if (_g4832 === -1 || _t4834 > _g4832) _g4832 = _t4834;
    }
  }
  const v_T = _g4832;
  const _a4835 = sp.lines;
  for (let _i4836 = 0; _i4836 < _a4835.length; _i4836++) {
    const v_L = _a4835[_i4836];
    const _h4939 = clueAt(cl.n, v_L);
    let _g4991 = -1;
    G4992: {
      const _a4993 = setOf(v_L);
      for (let _i4994 = 0; _i4994 < _a4993.length; _i4994++) {
        const v_K = _a4993[_i4994];
        const _h4995 = clueAt(cl.n, v_K);
        let _c5015: boolean = (_h4995 < 0);
        if (_c5015) {
          let _q4996 = true;
          Q4997: {
            _g4998.length = 0;
            G4999: {
              const _a5002 = sp.lines;
              for (let _i5003 = 0; _i5003 < _a5002.length; _i5003++) {
                const v_M = _a5002[_i5003];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g4998.push(v_M);
              }
            }
            const _a5004 = _g4998;
            for (let _i5005 = 0; _i5005 < _a5004.length; _i5005++) {
              const v_M = _a5004[_i5005];
              const _h5006 = clueAt(cl.n, v_M);
              let _c5014: boolean = (_h5006 >= 0);
              if (!_c5014) {
                const _t5007 = sp.lineCells[v_M];
                _g5008.length = 0;
                G5009: {
                  const _a5012 = _t5007;
                  for (let _i5013 = 0; _i5013 < _a5012.length; _i5013++) {
                    const v_c = _a5012[_i5013];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g5008.push(v_c);
                  }
                }
                _c5014 = (_g5008.length === 0);
              }
              if (!(_c5014)) {
                _q4996 = false;
                break Q4997;
              }
            }
          }
          _c5015 = _q4996;
        }
        if (!(_c5015)) continue;
        let _g5016 = 0;
        G5017: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g5016 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g5018 = 0;
        G5019: {
          _g5020.length = 0;
          G5021: {
            const _a5024 = sp.lines;
            for (let _i5025 = 0; _i5025 < _a5024.length; _i5025++) {
              const v_M = _a5024[_i5025];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g5020.push(v_M);
            }
          }
          const _a5026 = _g5020;
          for (let _i5027 = 0; _i5027 < _a5026.length; _i5027++) {
            const v_M = _a5026[_i5027];
            const _h5028 = clueAt(cl.n, v_M);
            if (!((_h5028 >= 0))) continue;
            _g5018 += _h5028;
          }
        }
        let _g5029 = 0;
        G5030: {
          _g5031.length = 0;
          G5032: {
            const _a5035 = sp.lines;
            for (let _i5036 = 0; _i5036 < _a5035.length; _i5036++) {
              const v_M = _a5035[_i5036];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g5031.push(v_M);
            }
          }
          const _a5037 = _g5031;
          for (let _i5038 = 0; _i5038 < _a5037.length; _i5038++) {
            const v_M = _a5037[_i5038];
            const _h5039 = clueAt(cl.n, v_M);
            if (!((_h5039 < 0))) continue;
            const _t5040 = sp.lineCells[v_M];
            let _g5041 = 0;
            G5042: {
              const _a5043 = _t5040;
              for (let _i5044 = 0; _i5044 < _a5043.length; _i5044++) {
                const v_c = _a5043[_i5044];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g5041++;
              }
            }
            _g5029 += _g5041;
          }
        }
        const _t5045 = ((_g5016 - _g5018) - _g5029);
        if (_g4991 === -1 || _t5045 > _g4991) _g4991 = _t5045;
      }
    }
    L5046: {
      const v_v = ((_h4939 + _g4991) + 1);
      let _c5051: boolean = (v_v >= 0);
      if (_c5051) {
        let _g5047 = 0;
        G5048: {
          const _a5049 = sp.lineCells[v_L];
          for (let _i5050 = 0; _i5050 < _a5049.length; _i5050++) {
            const v_c = _a5049[_i5050];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g5047++;
          }
        }
        _c5051 = (((sp.lineCells[v_L].length - v_v) - _g5047) === 1);
      }
      if (!(_c5051)) break L5046;
      const _a5052 = sp.lineCells[v_L];
      for (let _i5053 = 0; _i5053 < _a5052.length; _i5053++) {
        const v_c = _a5052[_i5053];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g5054 = -1;
        let _n5056 = 0;
        G5055: {
          const _a5057 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i5058 = 0; _i5058 < _a5057.length; _i5058++) {
            const v_M = _a5057[_i5058];
            if (!((v_M !== v_L))) continue;
            if (++_n5056 === 2) {
              _g5054 = -1;
              break G5055;
            }
            _g5054 = v_M;
          }
        }
        const v_K = _g5054;
        const _h5161 = clueAt(cl.n, v_K);
        let _g5213 = -1;
        G5214: {
          const _a5216 = setOf(v_K);
          for (let _i5217 = 0; _i5217 < _a5216.length; _i5217++) {
            const v_K_5215 = _a5216[_i5217];
            const _h5218 = clueAt(cl.n, v_K_5215);
            let _c5238: boolean = (_h5218 < 0);
            if (_c5238) {
              let _q5219 = true;
              Q5220: {
                _g5221.length = 0;
                G5222: {
                  const _a5225 = sp.lines;
                  for (let _i5226 = 0; _i5226 < _a5225.length; _i5226++) {
                    const v_M = _a5225[_i5226];
                    if (!(((v_M !== v_K_5215) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_5215][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_5215][1] ?? -1) % sp.w)))))) continue;
                    _g5221.push(v_M);
                  }
                }
                const _a5227 = _g5221;
                for (let _i5228 = 0; _i5228 < _a5227.length; _i5228++) {
                  const v_M = _a5227[_i5228];
                  const _h5229 = clueAt(cl.n, v_M);
                  let _c5237: boolean = (_h5229 >= 0);
                  if (!_c5237) {
                    const _t5230 = sp.lineCells[v_M];
                    _g5231.length = 0;
                    G5232: {
                      const _a5235 = _t5230;
                      for (let _i5236 = 0; _i5236 < _a5235.length; _i5236++) {
                        const v_c = _a5235[_i5236];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g5231.push(v_c);
                      }
                    }
                    _c5237 = (_g5231.length === 0);
                  }
                  if (!(_c5237)) {
                    _q5219 = false;
                    break Q5220;
                  }
                }
              }
              _c5238 = _q5219;
            }
            if (!(_c5238)) continue;
            let _g5239 = 0;
            G5240: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5239 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g5241 = 0;
            G5242: {
              _g5243.length = 0;
              G5244: {
                const _a5247 = sp.lines;
                for (let _i5248 = 0; _i5248 < _a5247.length; _i5248++) {
                  const v_M = _a5247[_i5248];
                  if (!(((v_M !== v_K_5215) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_5215][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_5215][1] ?? -1) % sp.w)))))) continue;
                  _g5243.push(v_M);
                }
              }
              const _a5249 = _g5243;
              for (let _i5250 = 0; _i5250 < _a5249.length; _i5250++) {
                const v_M = _a5249[_i5250];
                const _h5251 = clueAt(cl.n, v_M);
                if (!((_h5251 >= 0))) continue;
                _g5241 += _h5251;
              }
            }
            let _g5252 = 0;
            G5253: {
              _g5254.length = 0;
              G5255: {
                const _a5258 = sp.lines;
                for (let _i5259 = 0; _i5259 < _a5258.length; _i5259++) {
                  const v_M = _a5258[_i5259];
                  if (!(((v_M !== v_K_5215) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_5215][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_5215][1] ?? -1) % sp.w)))))) continue;
                  _g5254.push(v_M);
                }
              }
              const _a5260 = _g5254;
              for (let _i5261 = 0; _i5261 < _a5260.length; _i5261++) {
                const v_M = _a5260[_i5261];
                const _h5262 = clueAt(cl.n, v_M);
                if (!((_h5262 < 0))) continue;
                const _t5263 = sp.lineCells[v_M];
                let _g5264 = 0;
                G5265: {
                  const _a5266 = _t5263;
                  for (let _i5267 = 0; _i5267 < _a5266.length; _i5267++) {
                    const v_c = _a5266[_i5267];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g5264++;
                  }
                }
                _g5252 += _g5264;
              }
            }
            const _t5268 = ((_g5239 - _g5241) - _g5252);
            if (_g5213 === -1 || _t5268 > _g5213) _g5213 = _t5268;
          }
        }
        const v_j = ((_h5161 + _g5213) + 1);
        const _h5297 = (v_j >= 0);
        let _g5269 = 0;
        G5270: {
          const _a5271 = sp.lineCells[v_K];
          for (let _i5272 = 0; _i5272 < _a5271.length; _i5272++) {
            const v_c = _a5271[_i5272];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g5269++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g5269);
        const _h5298 = (v_t === 1);
        const _h5299 = (_h5297 && _h5298);
        _g5273.length = 0;
        G5274: {
          const _a5277 = sp.lineCells[v_L];
          for (let _i5278 = 0; _i5278 < _a5277.length; _i5278++) {
            const v_x = _a5277[_i5278];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g5273.push(v_x);
          }
        }
        _g5279.length = 0;
        G5280: {
          _g5289.length = 0;
          G5290: {
            const _a5293 = sp.lineCells[v_K];
            for (let _i5294 = 0; _i5294 < _a5293.length; _i5294++) {
              const v_x = _a5293[_i5294];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g5289.push(v_x);
            }
          }
          const _a5295 = _g5289;
          for (let _i5296 = 0; _i5296 < _a5295.length; _i5296++) {
            const v_x = _a5295[_i5296];
            if (!(_h5299)) continue;
            _g5279.push(v_x);
          }
        }
        L5300: {
          const v_H = union(_g5273, _g5279);
          const _t5301 = setOf(v_c);
          _g5302.length = 0;
          G5303: {
            const _a5308 = v_H;
            for (let _i5309 = 0; _i5309 < _a5308.length; _i5309++) {
              const v_a = _a5308[_i5309];
              const _a5310 = sp.adj8[v_a];
              for (let _i5311 = 0; _i5311 < _a5310.length; _i5311++) {
                const v_d = _a5310[_i5311];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g5302.includes(v_d)) _g5302.push(v_d);
              }
            }
          }
          const _t5312 = union(_t5301, _g5302);
          let _q5313 = false;
          Q5314: {
            const _a5315 = v_H;
            for (let _i5316 = 0; _i5316 < _a5315.length; _i5316++) {
              const v_a = _a5315[_i5316];
              const _a5317 = sp.adj8[v_a];
              for (let _i5318 = 0; _i5318 < _a5317.length; _i5318++) {
                const v_b = _a5317[_i5318];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q5313 = true;
                  break Q5314;
                }
              }
            }
          }
          let _c5552: boolean = _q5313;
          if (!_c5552) {
            let _q5319 = false;
            Q5320: {
              _g5321.length = 0;
              G5322: {
                const _a5327 = union(v_H, _t5312);
                for (let _i5328 = 0; _i5328 < _a5327.length; _i5328++) {
                  const v_a = _a5327[_i5328];
                  const _a5329 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i5330 = 0; _i5330 < _a5329.length; _i5330++) {
                    const v_M = _a5329[_i5330];
                    if (!_g5321.includes(v_M)) _g5321.push(v_M);
                  }
                }
              }
              const _a5331 = _g5321;
              for (let _i5332 = 0; _i5332 < _a5331.length; _i5332++) {
                const v_L = _a5331[_i5332];
                const _h5435 = clueAt(cl.n, v_L);
                let _g5487 = -1;
                G5488: {
                  const _a5489 = setOf(v_L);
                  for (let _i5490 = 0; _i5490 < _a5489.length; _i5490++) {
                    const v_K = _a5489[_i5490];
                    const _h5491 = clueAt(cl.n, v_K);
                    let _c5511: boolean = (_h5491 < 0);
                    if (_c5511) {
                      let _q5492 = true;
                      Q5493: {
                        _g5494.length = 0;
                        G5495: {
                          const _a5498 = sp.lines;
                          for (let _i5499 = 0; _i5499 < _a5498.length; _i5499++) {
                            const v_M = _a5498[_i5499];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g5494.push(v_M);
                          }
                        }
                        const _a5500 = _g5494;
                        for (let _i5501 = 0; _i5501 < _a5500.length; _i5501++) {
                          const v_M = _a5500[_i5501];
                          const _h5502 = clueAt(cl.n, v_M);
                          let _c5510: boolean = (_h5502 >= 0);
                          if (!_c5510) {
                            const _t5503 = sp.lineCells[v_M];
                            _g5504.length = 0;
                            G5505: {
                              const _a5508 = _t5503;
                              for (let _i5509 = 0; _i5509 < _a5508.length; _i5509++) {
                                const v_c = _a5508[_i5509];
                                if (!(!((b.grid[v_c] !== 0)))) continue;
                                _g5504.push(v_c);
                              }
                            }
                            _c5510 = (_g5504.length === 0);
                          }
                          if (!(_c5510)) {
                            _q5492 = false;
                            break Q5493;
                          }
                        }
                      }
                      _c5511 = _q5492;
                    }
                    if (!(_c5511)) continue;
                    let _g5512 = 0;
                    G5513: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g5512 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g5514 = 0;
                    G5515: {
                      _g5516.length = 0;
                      G5517: {
                        const _a5520 = sp.lines;
                        for (let _i5521 = 0; _i5521 < _a5520.length; _i5521++) {
                          const v_M = _a5520[_i5521];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5516.push(v_M);
                        }
                      }
                      const _a5522 = _g5516;
                      for (let _i5523 = 0; _i5523 < _a5522.length; _i5523++) {
                        const v_M = _a5522[_i5523];
                        const _h5524 = clueAt(cl.n, v_M);
                        if (!((_h5524 >= 0))) continue;
                        _g5514 += _h5524;
                      }
                    }
                    let _g5525 = 0;
                    G5526: {
                      _g5527.length = 0;
                      G5528: {
                        const _a5531 = sp.lines;
                        for (let _i5532 = 0; _i5532 < _a5531.length; _i5532++) {
                          const v_M = _a5531[_i5532];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g5527.push(v_M);
                        }
                      }
                      const _a5533 = _g5527;
                      for (let _i5534 = 0; _i5534 < _a5533.length; _i5534++) {
                        const v_M = _a5533[_i5534];
                        const _h5535 = clueAt(cl.n, v_M);
                        if (!((_h5535 < 0))) continue;
                        const _t5536 = sp.lineCells[v_M];
                        let _g5537 = 0;
                        G5538: {
                          const _a5539 = _t5536;
                          for (let _i5540 = 0; _i5540 < _a5539.length; _i5540++) {
                            const v_c = _a5539[_i5540];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g5537++;
                          }
                        }
                        _g5525 += _g5537;
                      }
                    }
                    const _t5541 = ((_g5512 - _g5514) - _g5525);
                    if (_g5487 === -1 || _t5541 > _g5487) _g5487 = _t5541;
                  }
                }
                L5542: {
                  const v_v = ((_h5435 + _g5487) + 1);
                  if (!((v_v >= 0))) break L5542;
                  let _g5543 = 0;
                  G5544: {
                    const _a5545 = sp.lineCells[v_L];
                    for (let _i5546 = 0; _i5546 < _a5545.length; _i5546++) {
                      const v_x = _a5545[_i5546];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g5543++;
                    }
                  }
                  let _c5551: boolean = (_g5543 > v_v);
                  if (!_c5551) {
                    let _g5547 = 0;
                    G5548: {
                      const _a5549 = sp.lineCells[v_L];
                      for (let _i5550 = 0; _i5550 < _a5549.length; _i5550++) {
                        const v_x = _a5549[_i5550];
                        if (!((!(_t5312.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g5547++;
                      }
                    }
                    _c5551 = (_g5547 < v_v);
                  }
                  if (_c5551) {
                    _q5319 = true;
                    break Q5320;
                  }
                }
              }
            }
            _c5552 = _q5319;
          }
          let _c5559: boolean = _c5552;
          if (!_c5559) {
            let _g5553 = 0;
            G5554: {
              const _a5555 = sp.cells;
              for (let _i5556 = 0; _i5556 < _a5555.length; _i5556++) {
                const v_x = _a5555[_i5556];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g5553++;
              }
            }
            let _g5557 = 0;
            G5558: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5557 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5559 = (_g5553 > _g5557);
          }
          let _c5566: boolean = _c5559;
          if (!_c5566) {
            let _g5560 = 0;
            G5561: {
              const _a5562 = sp.cells;
              for (let _i5563 = 0; _i5563 < _a5562.length; _i5563++) {
                const v_x = _a5562[_i5563];
                if (!((!(_t5312.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g5560++;
              }
            }
            let _g5564 = 0;
            G5565: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g5564 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c5566 = (_g5560 < _g5564);
          }
          let _c5579: boolean = _c5566;
          if (!_c5579) {
            let _q5567 = false;
            Q5568: {
              const _a5569 = v_H;
              for (let _i5570 = 0; _i5570 < _a5569.length; _i5570++) {
                const v_a = _a5569[_i5570];
                const _a5571 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i5572 = 0; _i5572 < _a5571.length; _i5572++) {
                  const v_L = _a5571[_i5572];
                  _g5573.length = 0;
                  G5574: {
                    const _a5577 = sp.lineCells[v_L];
                    for (let _i5578 = 0; _i5578 < _a5577.length; _i5578++) {
                      const v_x = _a5577[_i5578];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g5573.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g5573).length > v_T)) {
                    _q5567 = true;
                    break Q5568;
                  }
                }
              }
            }
            _c5579 = _q5567;
          }
          let _c5853: boolean = _c5579;
          if (!_c5853) {
            let _q5580 = false;
            Q5581: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g5582.length = 0;
                G5583: {
                  _g5667.length = 0;
                  G5668: {
                    const _a5673 = union(v_H, _t5312);
                    for (let _i5674 = 0; _i5674 < _a5673.length; _i5674++) {
                      const v_x = _a5673[_i5674];
                      const _a5675 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i5676 = 0; _i5676 < _a5675.length; _i5676++) {
                        const v_y = _a5675[_i5676];
                        if (!_g5667.includes(v_y)) _g5667.push(v_y);
                      }
                    }
                  }
                  const _a5677 = _g5667;
                  for (let _i5678 = 0; _i5678 < _a5677.length; _i5678++) {
                    const v_a = _a5677[_i5678];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a5679 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i5680 = 0; _i5680 < _a5679.length; _i5680++) {
                      const v_L = _a5679[_i5680];
                      _g5681.length = 0;
                      G5682: {
                        const _a5685 = sp.lineCells[v_L];
                        for (let _i5686 = 0; _i5686 < _a5685.length; _i5686++) {
                          const v_x = _a5685[_i5686];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g5681.push(v_x);
                        }
                      }
                      L5687: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g5681);
                        const _h5688 = v_G.length;
                        const _h5717 = (_h5688 === 1);
                        let _c5720: boolean = (_h5688 === v_m);
                        if (_c5720) {
                          let _q5689 = true;
                          Q5690: {
                            _g5691.length = 0;
                            G5692: {
                              _g5705.length = 0;
                              G5706: {
                                const _a5711 = v_G;
                                for (let _i5712 = 0; _i5712 < _a5711.length; _i5712++) {
                                  const v_g = _a5711[_i5712];
                                  const _a5713 = sp.adj4[v_g];
                                  for (let _i5714 = 0; _i5714 < _a5713.length; _i5714++) {
                                    const v_z = _a5713[_i5714];
                                    if (!_g5705.includes(v_z)) _g5705.push(v_z);
                                  }
                                }
                              }
                              const _a5715 = _g5705;
                              for (let _i5716 = 0; _i5716 < _a5715.length; _i5716++) {
                                const v_y = _a5715[_i5716];
                                if (!((!(v_G.includes(v_y)) && (_h5717 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5691.push(v_y);
                              }
                            }
                            const _a5718 = _g5691;
                            for (let _i5719 = 0; _i5719 < _a5718.length; _i5719++) {
                              const v_y = _a5718[_i5719];
                              if (!(((_t5312.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q5689 = false;
                                break Q5690;
                              }
                            }
                          }
                          _c5720 = _q5689;
                        }
                        let _c5751: boolean = _c5720;
                        if (_c5751) {
                          let _q5721 = false;
                          Q5722: {
                            _g5723.length = 0;
                            G5724: {
                              _g5737.length = 0;
                              G5738: {
                                const _a5743 = v_G;
                                for (let _i5744 = 0; _i5744 < _a5743.length; _i5744++) {
                                  const v_g = _a5743[_i5744];
                                  const _a5745 = sp.adj4[v_g];
                                  for (let _i5746 = 0; _i5746 < _a5745.length; _i5746++) {
                                    const v_z = _a5745[_i5746];
                                    if (!_g5737.includes(v_z)) _g5737.push(v_z);
                                  }
                                }
                              }
                              const _a5747 = _g5737;
                              for (let _i5748 = 0; _i5748 < _a5747.length; _i5748++) {
                                const v_y = _a5747[_i5748];
                                if (!((!(v_G.includes(v_y)) && (_h5717 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g5723.push(v_y);
                              }
                            }
                            const _a5749 = union(v_G, _g5723);
                            for (let _i5750 = 0; _i5750 < _a5749.length; _i5750++) {
                              const v_x = _a5749[_i5750];
                              if (((v_H.includes(v_x)) || (_t5312.includes(v_x)))) {
                                _q5721 = true;
                                break Q5722;
                              }
                            }
                          }
                          _c5751 = _q5721;
                        }
                        if (!(_c5751)) break L5687;
                        const _t5752 = (v_G[0] ?? -1);
                        if (!_g5582.includes(_t5752)) _g5582.push(_t5752);
                      }
                    }
                  }
                }
                L5753: {
                  const v_C = _g5582;
                  const _h5754 = v_C.length;
                  if (!((_h5754 > 0))) break L5753;
                  let _g5755 = 0;
                  G5756: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g5755 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g5757 = 0;
                  G5758: {
                    const _a5759 = sp.cells;
                    for (let _i5760 = 0; _i5760 < _a5759.length; _i5760++) {
                      const v_c = _a5759[_i5760];
                      const _h5836 = sp.rowOf[v_c];
                      const _h5844 = sp.colOf[v_c];
                      let _c5762: boolean = ((b.grid[v_c] || -1) === 1);
                      if (_c5762) {
                        const _t5761 = step(sp, v_c, 1);
                        _c5762 = !(((_t5761 !== -1) && ((b.grid[_t5761] || -1) === 1)));
                      }
                      let _c5764: boolean = _c5762;
                      if (_c5764) {
                        const _t5763 = step(sp, v_c, 3);
                        _c5764 = !(((_t5763 !== -1) && ((b.grid[_t5763] || -1) === 1)));
                      }
                      let _c5779: boolean = _c5764;
                      if (_c5779) {
                        const _t5765 = sp.rowOf[v_c];
                        _g5766.length = 0;
                        G5767: {
                          const _a5770 = sp.lineCells[_t5765];
                          for (let _i5771 = 0; _i5771 < _a5770.length; _i5771++) {
                            const v_x = _a5770[_i5771];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g5766.push(v_x);
                          }
                        }
                        const _t5772 = sp.colOf[v_c];
                        _g5773.length = 0;
                        G5774: {
                          const _a5777 = sp.lineCells[_t5772];
                          for (let _i5778 = 0; _i5778 < _a5777.length; _i5778++) {
                            const v_x = _a5777[_i5778];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g5773.push(v_x);
                          }
                        }
                        _c5779 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5766), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5773)).length === v_m);
                      }
                      let _c5852: boolean = _c5779;
                      if (_c5852) {
                        let _q5816 = true;
                        Q5817: {
                          const _t5818 = sp.rowOf[v_c];
                          _g5819.length = 0;
                          G5820: {
                            const _a5823 = sp.lineCells[_t5818];
                            for (let _i5824 = 0; _i5824 < _a5823.length; _i5824++) {
                              const v_x = _a5823[_i5824];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g5819.push(v_x);
                            }
                          }
                          const _t5825 = sp.colOf[v_c];
                          _g5826.length = 0;
                          G5827: {
                            const _a5830 = sp.lineCells[_t5825];
                            for (let _i5831 = 0; _i5831 < _a5830.length; _i5831++) {
                              const v_x = _a5830[_i5831];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g5826.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g5819), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g5826));
                          const _a5832 = v_G;
                          for (let _i5833 = 0; _i5833 < _a5832.length; _i5833++) {
                            const v_x = _a5832[_i5833];
                            const _a5834 = sp.adj4[v_x];
                            for (let _i5835 = 0; _i5835 < _a5834.length; _i5835++) {
                              const v_y = _a5834[_i5835];
                              let _c5843: boolean = !(v_G.includes(v_y));
                              if (_c5843) {
                                _g5837.length = 0;
                                G5838: {
                                  const _a5841 = sp.lineCells[_h5836];
                                  for (let _i5842 = 0; _i5842 < _a5841.length; _i5842++) {
                                    const v_x = _a5841[_i5842];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g5837.push(v_x);
                                  }
                                }
                                _c5843 = ((stretch(sp.lineCells[_h5836], v_c, _g5837).length === 1) || (sp.lineCells[_h5836].includes(v_y)));
                              }
                              let _c5851: boolean = _c5843;
                              if (_c5851) {
                                _g5845.length = 0;
                                G5846: {
                                  const _a5849 = sp.lineCells[_h5844];
                                  for (let _i5850 = 0; _i5850 < _a5849.length; _i5850++) {
                                    const v_x = _a5849[_i5850];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g5845.push(v_x);
                                  }
                                }
                                _c5851 = ((stretch(sp.lineCells[_h5844], v_c, _g5845).length === 1) || (sp.lineCells[_h5844].includes(v_y)));
                              }
                              if (!(_c5851)) continue;
                              if (!(((b.grid[v_y] || -1) === 2))) {
                                _q5816 = false;
                                break Q5817;
                              }
                            }
                          }
                        }
                        _c5852 = _q5816;
                      }
                      if (!(_c5852)) continue;
                      _g5757++;
                    }
                  }
                  if ((_h5754 > (_g5755 - _g5757))) {
                    _q5580 = true;
                    break Q5581;
                  }
                }
              }
            }
            _c5853 = _q5580;
          }
          if (!(_c5853)) break L5300;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, t: v_t, H: v_H }, facts)) return 1;
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

const lastShipFacts: number[] = [];

export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g7023: number[] = [];
  const _g7033: number[] = [];
  const _g7045: number[] = [];
  const _g7056: number[] = [];
  const _g7247: number[] = [];
  const _g7257: number[] = [];
  const _g7269: number[] = [];
  const _g7280: number[] = [];
  const _g7300: number[] = [];
  const _g7306: number[] = [];
  const _g7316: number[] = [];
  const _g7329: number[] = [];
  const _g7348: number[] = [];
  const _g7521: number[] = [];
  const _g7531: number[] = [];
  const _g7543: number[] = [];
  const _g7554: number[] = [];
  const _g7600: number[] = [];
  const _g7609: number[] = [];
  const _g7694: number[] = [];
  const _g7708: number[] = [];
  const _g7718: number[] = [];
  const _g7732: number[] = [];
  const _g7750: number[] = [];
  const _g7764: number[] = [];
  const _g7793: number[] = [];
  const _g7800: number[] = [];
  const _g7846: number[] = [];
  const _g7853: number[] = [];
  const _g7864: number[] = [];
  const _g7872: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g6857 = -1;
  G6858: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t6859 = cl.fleet.length[v_k];
      if (_g6857 === -1 || _t6859 > _g6857) _g6857 = _t6859;
    }
  }
  const v_T = _g6857;
  const _a6860 = sp.lines;
  for (let _i6861 = 0; _i6861 < _a6860.length; _i6861++) {
    const v_L = _a6860[_i6861];
    const _h6964 = clueAt(cl.n, v_L);
    let _g7016 = -1;
    G7017: {
      const _a7018 = setOf(v_L);
      for (let _i7019 = 0; _i7019 < _a7018.length; _i7019++) {
        const v_K = _a7018[_i7019];
        const _h7020 = clueAt(cl.n, v_K);
        let _c7040: boolean = (_h7020 < 0);
        if (_c7040) {
          let _q7021 = true;
          Q7022: {
            _g7023.length = 0;
            G7024: {
              const _a7027 = sp.lines;
              for (let _i7028 = 0; _i7028 < _a7027.length; _i7028++) {
                const v_M = _a7027[_i7028];
                if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                _g7023.push(v_M);
              }
            }
            const _a7029 = _g7023;
            for (let _i7030 = 0; _i7030 < _a7029.length; _i7030++) {
              const v_M = _a7029[_i7030];
              const _h7031 = clueAt(cl.n, v_M);
              let _c7039: boolean = (_h7031 >= 0);
              if (!_c7039) {
                const _t7032 = sp.lineCells[v_M];
                _g7033.length = 0;
                G7034: {
                  const _a7037 = _t7032;
                  for (let _i7038 = 0; _i7038 < _a7037.length; _i7038++) {
                    const v_c = _a7037[_i7038];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g7033.push(v_c);
                  }
                }
                _c7039 = (_g7033.length === 0);
              }
              if (!(_c7039)) {
                _q7021 = false;
                break Q7022;
              }
            }
          }
          _c7040 = _q7021;
        }
        if (!(_c7040)) continue;
        let _g7041 = 0;
        G7042: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            _g7041 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
          }
        }
        let _g7043 = 0;
        G7044: {
          _g7045.length = 0;
          G7046: {
            const _a7049 = sp.lines;
            for (let _i7050 = 0; _i7050 < _a7049.length; _i7050++) {
              const v_M = _a7049[_i7050];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g7045.push(v_M);
            }
          }
          const _a7051 = _g7045;
          for (let _i7052 = 0; _i7052 < _a7051.length; _i7052++) {
            const v_M = _a7051[_i7052];
            const _h7053 = clueAt(cl.n, v_M);
            if (!((_h7053 >= 0))) continue;
            _g7043 += _h7053;
          }
        }
        let _g7054 = 0;
        G7055: {
          _g7056.length = 0;
          G7057: {
            const _a7060 = sp.lines;
            for (let _i7061 = 0; _i7061 < _a7060.length; _i7061++) {
              const v_M = _a7060[_i7061];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g7056.push(v_M);
            }
          }
          const _a7062 = _g7056;
          for (let _i7063 = 0; _i7063 < _a7062.length; _i7063++) {
            const v_M = _a7062[_i7063];
            const _h7064 = clueAt(cl.n, v_M);
            if (!((_h7064 < 0))) continue;
            const _t7065 = sp.lineCells[v_M];
            let _g7066 = 0;
            G7067: {
              const _a7068 = _t7065;
              for (let _i7069 = 0; _i7069 < _a7068.length; _i7069++) {
                const v_c = _a7068[_i7069];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g7066++;
              }
            }
            _g7054 += _g7066;
          }
        }
        const _t7070 = ((_g7041 - _g7043) - _g7054);
        if (_g7016 === -1 || _t7070 > _g7016) _g7016 = _t7070;
      }
    }
    L7071: {
      const v_v = ((_h6964 + _g7016) + 1);
      let _c7077: boolean = (v_v >= 0);
      if (_c7077) {
        const _t7072 = sp.lineCells[v_L];
        let _g7073 = 0;
        G7074: {
          const _a7075 = _t7072;
          for (let _i7076 = 0; _i7076 < _a7075.length; _i7076++) {
            const v_c = _a7075[_i7076];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g7073++;
          }
        }
        _c7077 = ((v_v - _g7073) === 1);
      }
      if (!(_c7077)) break L7071;
      const _a7078 = sp.lineCells[v_L];
      for (let _i7079 = 0; _i7079 < _a7078.length; _i7079++) {
        const v_c = _a7078[_i7079];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g7080 = -1;
        let _n7082 = 0;
        G7081: {
          const _a7083 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i7084 = 0; _i7084 < _a7083.length; _i7084++) {
            const v_M = _a7083[_i7084];
            if (!((v_M !== v_L))) continue;
            if (++_n7082 === 2) {
              _g7080 = -1;
              break G7081;
            }
            _g7080 = v_M;
          }
        }
        const v_K = _g7080;
        const _h7187 = clueAt(cl.n, v_K);
        let _g7239 = -1;
        G7240: {
          const _a7242 = setOf(v_K);
          for (let _i7243 = 0; _i7243 < _a7242.length; _i7243++) {
            const v_K_7241 = _a7242[_i7243];
            const _h7244 = clueAt(cl.n, v_K_7241);
            let _c7264: boolean = (_h7244 < 0);
            if (_c7264) {
              let _q7245 = true;
              Q7246: {
                _g7247.length = 0;
                G7248: {
                  const _a7251 = sp.lines;
                  for (let _i7252 = 0; _i7252 < _a7251.length; _i7252++) {
                    const v_M = _a7251[_i7252];
                    if (!(((v_M !== v_K_7241) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_7241][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_7241][1] ?? -1) % sp.w)))))) continue;
                    _g7247.push(v_M);
                  }
                }
                const _a7253 = _g7247;
                for (let _i7254 = 0; _i7254 < _a7253.length; _i7254++) {
                  const v_M = _a7253[_i7254];
                  const _h7255 = clueAt(cl.n, v_M);
                  let _c7263: boolean = (_h7255 >= 0);
                  if (!_c7263) {
                    const _t7256 = sp.lineCells[v_M];
                    _g7257.length = 0;
                    G7258: {
                      const _a7261 = _t7256;
                      for (let _i7262 = 0; _i7262 < _a7261.length; _i7262++) {
                        const v_c = _a7261[_i7262];
                        if (!(!((b.grid[v_c] !== 0)))) continue;
                        _g7257.push(v_c);
                      }
                    }
                    _c7263 = (_g7257.length === 0);
                  }
                  if (!(_c7263)) {
                    _q7245 = false;
                    break Q7246;
                  }
                }
              }
              _c7264 = _q7245;
            }
            if (!(_c7264)) continue;
            let _g7265 = 0;
            G7266: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g7265 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            let _g7267 = 0;
            G7268: {
              _g7269.length = 0;
              G7270: {
                const _a7273 = sp.lines;
                for (let _i7274 = 0; _i7274 < _a7273.length; _i7274++) {
                  const v_M = _a7273[_i7274];
                  if (!(((v_M !== v_K_7241) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_7241][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_7241][1] ?? -1) % sp.w)))))) continue;
                  _g7269.push(v_M);
                }
              }
              const _a7275 = _g7269;
              for (let _i7276 = 0; _i7276 < _a7275.length; _i7276++) {
                const v_M = _a7275[_i7276];
                const _h7277 = clueAt(cl.n, v_M);
                if (!((_h7277 >= 0))) continue;
                _g7267 += _h7277;
              }
            }
            let _g7278 = 0;
            G7279: {
              _g7280.length = 0;
              G7281: {
                const _a7284 = sp.lines;
                for (let _i7285 = 0; _i7285 < _a7284.length; _i7285++) {
                  const v_M = _a7284[_i7285];
                  if (!(((v_M !== v_K_7241) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K_7241][0] ?? -1) % sp.w) === ((sp.lineCells[v_K_7241][1] ?? -1) % sp.w)))))) continue;
                  _g7280.push(v_M);
                }
              }
              const _a7286 = _g7280;
              for (let _i7287 = 0; _i7287 < _a7286.length; _i7287++) {
                const v_M = _a7286[_i7287];
                const _h7288 = clueAt(cl.n, v_M);
                if (!((_h7288 < 0))) continue;
                const _t7289 = sp.lineCells[v_M];
                let _g7290 = 0;
                G7291: {
                  const _a7292 = _t7289;
                  for (let _i7293 = 0; _i7293 < _a7292.length; _i7293++) {
                    const v_c = _a7292[_i7293];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g7290++;
                  }
                }
                _g7278 += _g7290;
              }
            }
            const _t7294 = ((_g7265 - _g7267) - _g7278);
            if (_g7239 === -1 || _t7294 > _g7239) _g7239 = _t7294;
          }
        }
        const v_j = ((_h7187 + _g7239) + 1);
        const _h7324 = (v_j >= 0);
        const _t7295 = sp.lineCells[v_K];
        let _g7296 = 0;
        G7297: {
          const _a7298 = _t7295;
          for (let _i7299 = 0; _i7299 < _a7298.length; _i7299++) {
            const v_c = _a7298[_i7299];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g7296++;
          }
        }
        const v_u = (v_j - _g7296);
        const _h7325 = (v_u === 1);
        const _h7326 = (_h7324 && _h7325);
        _g7300.length = 0;
        G7301: {
          const _a7304 = sp.lineCells[v_L];
          for (let _i7305 = 0; _i7305 < _a7304.length; _i7305++) {
            const v_x = _a7304[_i7305];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g7300.push(v_x);
          }
        }
        _g7306.length = 0;
        G7307: {
          _g7316.length = 0;
          G7317: {
            const _a7320 = sp.lineCells[v_K];
            for (let _i7321 = 0; _i7321 < _a7320.length; _i7321++) {
              const v_x = _a7320[_i7321];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g7316.push(v_x);
            }
          }
          const _a7322 = _g7316;
          for (let _i7323 = 0; _i7323 < _a7322.length; _i7323++) {
            const v_x = _a7322[_i7323];
            if (!(_h7326)) continue;
            _g7306.push(v_x);
          }
        }
        L7327: {
          const v_W = union(_g7300, _g7306);
          const _t7328 = setOf(v_c);
          _g7329.length = 0;
          G7330: {
            const _a7335 = _t7328;
            for (let _i7336 = 0; _i7336 < _a7335.length; _i7336++) {
              const v_a = _a7335[_i7336];
              const _a7337 = sp.adj8[v_a];
              for (let _i7338 = 0; _i7338 < _a7337.length; _i7338++) {
                const v_d = _a7337[_i7338];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g7329.includes(v_d)) _g7329.push(v_d);
              }
            }
          }
          const _t7339 = union(v_W, _g7329);
          let _q7340 = false;
          Q7341: {
            const _a7342 = _t7328;
            for (let _i7343 = 0; _i7343 < _a7342.length; _i7343++) {
              const v_a = _a7342[_i7343];
              const _a7344 = sp.adj8[v_a];
              for (let _i7345 = 0; _i7345 < _a7344.length; _i7345++) {
                const v_b = _a7344[_i7345];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t7328.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q7340 = true;
                  break Q7341;
                }
              }
            }
          }
          let _c7579: boolean = _q7340;
          if (!_c7579) {
            let _q7346 = false;
            Q7347: {
              _g7348.length = 0;
              G7349: {
                const _a7354 = union(_t7328, _t7339);
                for (let _i7355 = 0; _i7355 < _a7354.length; _i7355++) {
                  const v_a = _a7354[_i7355];
                  const _a7356 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i7357 = 0; _i7357 < _a7356.length; _i7357++) {
                    const v_M = _a7356[_i7357];
                    if (!_g7348.includes(v_M)) _g7348.push(v_M);
                  }
                }
              }
              const _a7358 = _g7348;
              for (let _i7359 = 0; _i7359 < _a7358.length; _i7359++) {
                const v_L = _a7358[_i7359];
                const _h7462 = clueAt(cl.n, v_L);
                let _g7514 = -1;
                G7515: {
                  const _a7516 = setOf(v_L);
                  for (let _i7517 = 0; _i7517 < _a7516.length; _i7517++) {
                    const v_K = _a7516[_i7517];
                    const _h7518 = clueAt(cl.n, v_K);
                    let _c7538: boolean = (_h7518 < 0);
                    if (_c7538) {
                      let _q7519 = true;
                      Q7520: {
                        _g7521.length = 0;
                        G7522: {
                          const _a7525 = sp.lines;
                          for (let _i7526 = 0; _i7526 < _a7525.length; _i7526++) {
                            const v_M = _a7525[_i7526];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g7521.push(v_M);
                          }
                        }
                        const _a7527 = _g7521;
                        for (let _i7528 = 0; _i7528 < _a7527.length; _i7528++) {
                          const v_M = _a7527[_i7528];
                          const _h7529 = clueAt(cl.n, v_M);
                          let _c7537: boolean = (_h7529 >= 0);
                          if (!_c7537) {
                            const _t7530 = sp.lineCells[v_M];
                            _g7531.length = 0;
                            G7532: {
                              const _a7535 = _t7530;
                              for (let _i7536 = 0; _i7536 < _a7535.length; _i7536++) {
                                const v_c = _a7535[_i7536];
                                if (!(!((b.grid[v_c] !== 0)))) continue;
                                _g7531.push(v_c);
                              }
                            }
                            _c7537 = (_g7531.length === 0);
                          }
                          if (!(_c7537)) {
                            _q7519 = false;
                            break Q7520;
                          }
                        }
                      }
                      _c7538 = _q7519;
                    }
                    if (!(_c7538)) continue;
                    let _g7539 = 0;
                    G7540: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g7539 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g7541 = 0;
                    G7542: {
                      _g7543.length = 0;
                      G7544: {
                        const _a7547 = sp.lines;
                        for (let _i7548 = 0; _i7548 < _a7547.length; _i7548++) {
                          const v_M = _a7547[_i7548];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g7543.push(v_M);
                        }
                      }
                      const _a7549 = _g7543;
                      for (let _i7550 = 0; _i7550 < _a7549.length; _i7550++) {
                        const v_M = _a7549[_i7550];
                        const _h7551 = clueAt(cl.n, v_M);
                        if (!((_h7551 >= 0))) continue;
                        _g7541 += _h7551;
                      }
                    }
                    let _g7552 = 0;
                    G7553: {
                      _g7554.length = 0;
                      G7555: {
                        const _a7558 = sp.lines;
                        for (let _i7559 = 0; _i7559 < _a7558.length; _i7559++) {
                          const v_M = _a7558[_i7559];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g7554.push(v_M);
                        }
                      }
                      const _a7560 = _g7554;
                      for (let _i7561 = 0; _i7561 < _a7560.length; _i7561++) {
                        const v_M = _a7560[_i7561];
                        const _h7562 = clueAt(cl.n, v_M);
                        if (!((_h7562 < 0))) continue;
                        const _t7563 = sp.lineCells[v_M];
                        let _g7564 = 0;
                        G7565: {
                          const _a7566 = _t7563;
                          for (let _i7567 = 0; _i7567 < _a7566.length; _i7567++) {
                            const v_c = _a7566[_i7567];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g7564++;
                          }
                        }
                        _g7552 += _g7564;
                      }
                    }
                    const _t7568 = ((_g7539 - _g7541) - _g7552);
                    if (_g7514 === -1 || _t7568 > _g7514) _g7514 = _t7568;
                  }
                }
                L7569: {
                  const v_v = ((_h7462 + _g7514) + 1);
                  if (!((v_v >= 0))) break L7569;
                  let _g7570 = 0;
                  G7571: {
                    const _a7572 = sp.lineCells[v_L];
                    for (let _i7573 = 0; _i7573 < _a7572.length; _i7573++) {
                      const v_x = _a7572[_i7573];
                      if (!(((_t7328.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g7570++;
                    }
                  }
                  let _c7578: boolean = (_g7570 > v_v);
                  if (!_c7578) {
                    let _g7574 = 0;
                    G7575: {
                      const _a7576 = sp.lineCells[v_L];
                      for (let _i7577 = 0; _i7577 < _a7576.length; _i7577++) {
                        const v_x = _a7576[_i7577];
                        if (!((!(_t7339.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g7574++;
                      }
                    }
                    _c7578 = (_g7574 < v_v);
                  }
                  if (_c7578) {
                    _q7346 = true;
                    break Q7347;
                  }
                }
              }
            }
            _c7579 = _q7346;
          }
          let _c7586: boolean = _c7579;
          if (!_c7586) {
            let _g7580 = 0;
            G7581: {
              const _a7582 = sp.cells;
              for (let _i7583 = 0; _i7583 < _a7582.length; _i7583++) {
                const v_x = _a7582[_i7583];
                if (!(((_t7328.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g7580++;
              }
            }
            let _g7584 = 0;
            G7585: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g7584 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c7586 = (_g7580 > _g7584);
          }
          let _c7593: boolean = _c7586;
          if (!_c7593) {
            let _g7587 = 0;
            G7588: {
              const _a7589 = sp.cells;
              for (let _i7590 = 0; _i7590 < _a7589.length; _i7590++) {
                const v_x = _a7589[_i7590];
                if (!((!(_t7339.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g7587++;
              }
            }
            let _g7591 = 0;
            G7592: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g7591 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c7593 = (_g7587 < _g7591);
          }
          let _c7606: boolean = _c7593;
          if (!_c7606) {
            let _q7594 = false;
            Q7595: {
              const _a7596 = _t7328;
              for (let _i7597 = 0; _i7597 < _a7596.length; _i7597++) {
                const v_a = _a7596[_i7597];
                const _a7598 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i7599 = 0; _i7599 < _a7598.length; _i7599++) {
                  const v_L = _a7598[_i7599];
                  _g7600.length = 0;
                  G7601: {
                    const _a7604 = sp.lineCells[v_L];
                    for (let _i7605 = 0; _i7605 < _a7604.length; _i7605++) {
                      const v_x = _a7604[_i7605];
                      if (!(((_t7328.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g7600.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g7600).length > v_T)) {
                    _q7594 = true;
                    break Q7595;
                  }
                }
              }
            }
            _c7606 = _q7594;
          }
          let _c7880: boolean = _c7606;
          if (!_c7880) {
            let _q7607 = false;
            Q7608: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g7609.length = 0;
                G7610: {
                  _g7694.length = 0;
                  G7695: {
                    const _a7700 = union(_t7328, _t7339);
                    for (let _i7701 = 0; _i7701 < _a7700.length; _i7701++) {
                      const v_x = _a7700[_i7701];
                      const _a7702 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i7703 = 0; _i7703 < _a7702.length; _i7703++) {
                        const v_y = _a7702[_i7703];
                        if (!_g7694.includes(v_y)) _g7694.push(v_y);
                      }
                    }
                  }
                  const _a7704 = _g7694;
                  for (let _i7705 = 0; _i7705 < _a7704.length; _i7705++) {
                    const v_a = _a7704[_i7705];
                    if (!(((_t7328.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a7706 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i7707 = 0; _i7707 < _a7706.length; _i7707++) {
                      const v_L = _a7706[_i7707];
                      _g7708.length = 0;
                      G7709: {
                        const _a7712 = sp.lineCells[v_L];
                        for (let _i7713 = 0; _i7713 < _a7712.length; _i7713++) {
                          const v_x = _a7712[_i7713];
                          if (!(((_t7328.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g7708.push(v_x);
                        }
                      }
                      L7714: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g7708);
                        const _h7715 = v_G.length;
                        const _h7744 = (_h7715 === 1);
                        let _c7747: boolean = (_h7715 === v_m);
                        if (_c7747) {
                          let _q7716 = true;
                          Q7717: {
                            _g7718.length = 0;
                            G7719: {
                              _g7732.length = 0;
                              G7733: {
                                const _a7738 = v_G;
                                for (let _i7739 = 0; _i7739 < _a7738.length; _i7739++) {
                                  const v_g = _a7738[_i7739];
                                  const _a7740 = sp.adj4[v_g];
                                  for (let _i7741 = 0; _i7741 < _a7740.length; _i7741++) {
                                    const v_z = _a7740[_i7741];
                                    if (!_g7732.includes(v_z)) _g7732.push(v_z);
                                  }
                                }
                              }
                              const _a7742 = _g7732;
                              for (let _i7743 = 0; _i7743 < _a7742.length; _i7743++) {
                                const v_y = _a7742[_i7743];
                                if (!((!(v_G.includes(v_y)) && (_h7744 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g7718.push(v_y);
                              }
                            }
                            const _a7745 = _g7718;
                            for (let _i7746 = 0; _i7746 < _a7745.length; _i7746++) {
                              const v_y = _a7745[_i7746];
                              if (!(((_t7339.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q7716 = false;
                                break Q7717;
                              }
                            }
                          }
                          _c7747 = _q7716;
                        }
                        let _c7778: boolean = _c7747;
                        if (_c7778) {
                          let _q7748 = false;
                          Q7749: {
                            _g7750.length = 0;
                            G7751: {
                              _g7764.length = 0;
                              G7765: {
                                const _a7770 = v_G;
                                for (let _i7771 = 0; _i7771 < _a7770.length; _i7771++) {
                                  const v_g = _a7770[_i7771];
                                  const _a7772 = sp.adj4[v_g];
                                  for (let _i7773 = 0; _i7773 < _a7772.length; _i7773++) {
                                    const v_z = _a7772[_i7773];
                                    if (!_g7764.includes(v_z)) _g7764.push(v_z);
                                  }
                                }
                              }
                              const _a7774 = _g7764;
                              for (let _i7775 = 0; _i7775 < _a7774.length; _i7775++) {
                                const v_y = _a7774[_i7775];
                                if (!((!(v_G.includes(v_y)) && (_h7744 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g7750.push(v_y);
                              }
                            }
                            const _a7776 = union(v_G, _g7750);
                            for (let _i7777 = 0; _i7777 < _a7776.length; _i7777++) {
                              const v_x = _a7776[_i7777];
                              if (((_t7328.includes(v_x)) || (_t7339.includes(v_x)))) {
                                _q7748 = true;
                                break Q7749;
                              }
                            }
                          }
                          _c7778 = _q7748;
                        }
                        if (!(_c7778)) break L7714;
                        const _t7779 = (v_G[0] ?? -1);
                        if (!_g7609.includes(_t7779)) _g7609.push(_t7779);
                      }
                    }
                  }
                }
                L7780: {
                  const v_C = _g7609;
                  const _h7781 = v_C.length;
                  if (!((_h7781 > 0))) break L7780;
                  let _g7782 = 0;
                  G7783: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g7782 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g7784 = 0;
                  G7785: {
                    const _a7786 = sp.cells;
                    for (let _i7787 = 0; _i7787 < _a7786.length; _i7787++) {
                      const v_c = _a7786[_i7787];
                      const _h7863 = sp.rowOf[v_c];
                      const _h7871 = sp.colOf[v_c];
                      let _c7789: boolean = ((b.grid[v_c] || -1) === 1);
                      if (_c7789) {
                        const _t7788 = step(sp, v_c, 1);
                        _c7789 = !(((_t7788 !== -1) && ((b.grid[_t7788] || -1) === 1)));
                      }
                      let _c7791: boolean = _c7789;
                      if (_c7791) {
                        const _t7790 = step(sp, v_c, 3);
                        _c7791 = !(((_t7790 !== -1) && ((b.grid[_t7790] || -1) === 1)));
                      }
                      let _c7806: boolean = _c7791;
                      if (_c7806) {
                        const _t7792 = sp.rowOf[v_c];
                        _g7793.length = 0;
                        G7794: {
                          const _a7797 = sp.lineCells[_t7792];
                          for (let _i7798 = 0; _i7798 < _a7797.length; _i7798++) {
                            const v_x = _a7797[_i7798];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g7793.push(v_x);
                          }
                        }
                        const _t7799 = sp.colOf[v_c];
                        _g7800.length = 0;
                        G7801: {
                          const _a7804 = sp.lineCells[_t7799];
                          for (let _i7805 = 0; _i7805 < _a7804.length; _i7805++) {
                            const v_x = _a7804[_i7805];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g7800.push(v_x);
                          }
                        }
                        _c7806 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g7793), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g7800)).length === v_m);
                      }
                      let _c7879: boolean = _c7806;
                      if (_c7879) {
                        let _q7843 = true;
                        Q7844: {
                          const _t7845 = sp.rowOf[v_c];
                          _g7846.length = 0;
                          G7847: {
                            const _a7850 = sp.lineCells[_t7845];
                            for (let _i7851 = 0; _i7851 < _a7850.length; _i7851++) {
                              const v_x = _a7850[_i7851];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g7846.push(v_x);
                            }
                          }
                          const _t7852 = sp.colOf[v_c];
                          _g7853.length = 0;
                          G7854: {
                            const _a7857 = sp.lineCells[_t7852];
                            for (let _i7858 = 0; _i7858 < _a7857.length; _i7858++) {
                              const v_x = _a7857[_i7858];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g7853.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g7846), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g7853));
                          const _a7859 = v_G;
                          for (let _i7860 = 0; _i7860 < _a7859.length; _i7860++) {
                            const v_x = _a7859[_i7860];
                            const _a7861 = sp.adj4[v_x];
                            for (let _i7862 = 0; _i7862 < _a7861.length; _i7862++) {
                              const v_y = _a7861[_i7862];
                              let _c7870: boolean = !(v_G.includes(v_y));
                              if (_c7870) {
                                _g7864.length = 0;
                                G7865: {
                                  const _a7868 = sp.lineCells[_h7863];
                                  for (let _i7869 = 0; _i7869 < _a7868.length; _i7869++) {
                                    const v_x = _a7868[_i7869];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g7864.push(v_x);
                                  }
                                }
                                _c7870 = ((stretch(sp.lineCells[_h7863], v_c, _g7864).length === 1) || (sp.lineCells[_h7863].includes(v_y)));
                              }
                              let _c7878: boolean = _c7870;
                              if (_c7878) {
                                _g7872.length = 0;
                                G7873: {
                                  const _a7876 = sp.lineCells[_h7871];
                                  for (let _i7877 = 0; _i7877 < _a7876.length; _i7877++) {
                                    const v_x = _a7876[_i7877];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g7872.push(v_x);
                                  }
                                }
                                _c7878 = ((stretch(sp.lineCells[_h7871], v_c, _g7872).length === 1) || (sp.lineCells[_h7871].includes(v_y)));
                              }
                              if (!(_c7878)) continue;
                              if (!(((b.grid[v_y] || -1) === 2))) {
                                _q7843 = false;
                                break Q7844;
                              }
                            }
                          }
                        }
                        _c7879 = _q7843;
                      }
                      if (!(_c7879)) continue;
                      _g7784++;
                    }
                  }
                  if ((_h7781 > (_g7782 - _g7784))) {
                    _q7607 = true;
                    break Q7608;
                  }
                }
              }
            }
            _c7880 = _q7607;
          }
          if (!(_c7880)) break L7327;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, u: v_u, W: v_W }, facts)) return 1;
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

const centerTrialFacts: number[] = [];

export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g8459: number[] = [];
  const _g8472: number[] = [];
  const _g8478: number[] = [];
  const _g8497: number[] = [];
  const _g8670: number[] = [];
  const _g8680: number[] = [];
  const _g8692: number[] = [];
  const _g8703: number[] = [];
  const _g8749: number[] = [];
  const _g8758: number[] = [];
  const _g8843: number[] = [];
  const _g8857: number[] = [];
  const _g8867: number[] = [];
  const _g8881: number[] = [];
  const _g8899: number[] = [];
  const _g8913: number[] = [];
  const _g8942: number[] = [];
  const _g8949: number[] = [];
  const _g8995: number[] = [];
  const _g9002: number[] = [];
  const _g9013: number[] = [];
  const _g9021: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g8451 = -1;
  G8452: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t8453 = cl.fleet.length[v_k];
      if (_g8451 === -1 || _t8453 > _g8451) _g8451 = _t8453;
    }
  }
  const v_T = _g8451;
  const _a8454 = cluesValued(cl.seg, 6);
  for (let _i8455 = 0; _i8455 < _a8454.length; _i8455++) {
    const v_c = _a8454[_i8455];
    const _h8456 = clueAt(cl.seg, v_c);
    if (!((_h8456 === 6))) continue;
    const _a8457 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i8458 = 0; _i8458 < _a8457.length; _i8458++) {
      const v_L = _a8457[_i8458];
      _g8459.length = 0;
      G8460: {
        const _a8463 = sp.adj4[v_c];
        for (let _i8464 = 0; _i8464 < _a8463.length; _i8464++) {
          const v_x = _a8463[_i8464];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g8459.push(v_x);
        }
      }
      L8465: {
        const v_S = _g8459;
        const _h8466 = v_S.length;
        let _c8471: boolean = (_h8466 === 2);
        if (_c8471) {
          let _q8467 = false;
          Q8468: {
            const _a8469 = v_S;
            for (let _i8470 = 0; _i8470 < _a8469.length; _i8470++) {
              const v_x = _a8469[_i8470];
              if (!((b.grid[v_x] !== 0))) {
                _q8467 = true;
                break Q8468;
              }
            }
          }
          _c8471 = _q8467;
        }
        let _c9030: boolean = _c8471;
        if (_c9030) {
          _g8472.length = 0;
          G8473: {
            const _a8476 = v_S;
            for (let _i8477 = 0; _i8477 < _a8476.length; _i8477++) {
              const v_x = _a8476[_i8477];
              if (!((v_x !== v_x))) continue;
              _g8472.push(v_x);
            }
          }
          _g8478.length = 0;
          G8479: {
            const _a8484 = v_S;
            for (let _i8485 = 0; _i8485 < _a8484.length; _i8485++) {
              const v_a = _a8484[_i8485];
              const _a8486 = sp.adj8[v_a];
              for (let _i8487 = 0; _i8487 < _a8486.length; _i8487++) {
                const v_d = _a8486[_i8487];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g8478.includes(v_d)) _g8478.push(v_d);
              }
            }
          }
          const _t8488 = union(_g8472, _g8478);
          let _q8489 = false;
          Q8490: {
            const _a8491 = v_S;
            for (let _i8492 = 0; _i8492 < _a8491.length; _i8492++) {
              const v_a = _a8491[_i8492];
              const _a8493 = sp.adj8[v_a];
              for (let _i8494 = 0; _i8494 < _a8493.length; _i8494++) {
                const v_b = _a8493[_i8494];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q8489 = true;
                  break Q8490;
                }
              }
            }
          }
          let _c8728: boolean = _q8489;
          if (!_c8728) {
            let _q8495 = false;
            Q8496: {
              _g8497.length = 0;
              G8498: {
                const _a8503 = union(v_S, _t8488);
                for (let _i8504 = 0; _i8504 < _a8503.length; _i8504++) {
                  const v_a = _a8503[_i8504];
                  const _a8505 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i8506 = 0; _i8506 < _a8505.length; _i8506++) {
                    const v_M = _a8505[_i8506];
                    if (!_g8497.includes(v_M)) _g8497.push(v_M);
                  }
                }
              }
              const _a8507 = _g8497;
              for (let _i8508 = 0; _i8508 < _a8507.length; _i8508++) {
                const v_L = _a8507[_i8508];
                const _h8611 = clueAt(cl.n, v_L);
                let _g8663 = -1;
                G8664: {
                  const _a8665 = setOf(v_L);
                  for (let _i8666 = 0; _i8666 < _a8665.length; _i8666++) {
                    const v_K = _a8665[_i8666];
                    const _h8667 = clueAt(cl.n, v_K);
                    let _c8687: boolean = (_h8667 < 0);
                    if (_c8687) {
                      let _q8668 = true;
                      Q8669: {
                        _g8670.length = 0;
                        G8671: {
                          const _a8674 = sp.lines;
                          for (let _i8675 = 0; _i8675 < _a8674.length; _i8675++) {
                            const v_M = _a8674[_i8675];
                            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                            _g8670.push(v_M);
                          }
                        }
                        const _a8676 = _g8670;
                        for (let _i8677 = 0; _i8677 < _a8676.length; _i8677++) {
                          const v_M = _a8676[_i8677];
                          const _h8678 = clueAt(cl.n, v_M);
                          let _c8686: boolean = (_h8678 >= 0);
                          if (!_c8686) {
                            const _t8679 = sp.lineCells[v_M];
                            _g8680.length = 0;
                            G8681: {
                              const _a8684 = _t8679;
                              for (let _i8685 = 0; _i8685 < _a8684.length; _i8685++) {
                                const v_c = _a8684[_i8685];
                                if (!(!((b.grid[v_c] !== 0)))) continue;
                                _g8680.push(v_c);
                              }
                            }
                            _c8686 = (_g8680.length === 0);
                          }
                          if (!(_c8686)) {
                            _q8668 = false;
                            break Q8669;
                          }
                        }
                      }
                      _c8687 = _q8668;
                    }
                    if (!(_c8687)) continue;
                    let _g8688 = 0;
                    G8689: {
                      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                        _g8688 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                      }
                    }
                    let _g8690 = 0;
                    G8691: {
                      _g8692.length = 0;
                      G8693: {
                        const _a8696 = sp.lines;
                        for (let _i8697 = 0; _i8697 < _a8696.length; _i8697++) {
                          const v_M = _a8696[_i8697];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g8692.push(v_M);
                        }
                      }
                      const _a8698 = _g8692;
                      for (let _i8699 = 0; _i8699 < _a8698.length; _i8699++) {
                        const v_M = _a8698[_i8699];
                        const _h8700 = clueAt(cl.n, v_M);
                        if (!((_h8700 >= 0))) continue;
                        _g8690 += _h8700;
                      }
                    }
                    let _g8701 = 0;
                    G8702: {
                      _g8703.length = 0;
                      G8704: {
                        const _a8707 = sp.lines;
                        for (let _i8708 = 0; _i8708 < _a8707.length; _i8708++) {
                          const v_M = _a8707[_i8708];
                          if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
                          _g8703.push(v_M);
                        }
                      }
                      const _a8709 = _g8703;
                      for (let _i8710 = 0; _i8710 < _a8709.length; _i8710++) {
                        const v_M = _a8709[_i8710];
                        const _h8711 = clueAt(cl.n, v_M);
                        if (!((_h8711 < 0))) continue;
                        const _t8712 = sp.lineCells[v_M];
                        let _g8713 = 0;
                        G8714: {
                          const _a8715 = _t8712;
                          for (let _i8716 = 0; _i8716 < _a8715.length; _i8716++) {
                            const v_c = _a8715[_i8716];
                            if (!(((b.grid[v_c] || -1) === 1))) continue;
                            _g8713++;
                          }
                        }
                        _g8701 += _g8713;
                      }
                    }
                    const _t8717 = ((_g8688 - _g8690) - _g8701);
                    if (_g8663 === -1 || _t8717 > _g8663) _g8663 = _t8717;
                  }
                }
                L8718: {
                  const v_v = ((_h8611 + _g8663) + 1);
                  if (!((v_v >= 0))) break L8718;
                  let _g8719 = 0;
                  G8720: {
                    const _a8721 = sp.lineCells[v_L];
                    for (let _i8722 = 0; _i8722 < _a8721.length; _i8722++) {
                      const v_x = _a8721[_i8722];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g8719++;
                    }
                  }
                  let _c8727: boolean = (_g8719 > v_v);
                  if (!_c8727) {
                    let _g8723 = 0;
                    G8724: {
                      const _a8725 = sp.lineCells[v_L];
                      for (let _i8726 = 0; _i8726 < _a8725.length; _i8726++) {
                        const v_x = _a8725[_i8726];
                        if (!((!(_t8488.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g8723++;
                      }
                    }
                    _c8727 = (_g8723 < v_v);
                  }
                  if (_c8727) {
                    _q8495 = true;
                    break Q8496;
                  }
                }
              }
            }
            _c8728 = _q8495;
          }
          let _c8735: boolean = _c8728;
          if (!_c8735) {
            let _g8729 = 0;
            G8730: {
              const _a8731 = sp.cells;
              for (let _i8732 = 0; _i8732 < _a8731.length; _i8732++) {
                const v_x = _a8731[_i8732];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g8729++;
              }
            }
            let _g8733 = 0;
            G8734: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g8733 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c8735 = (_g8729 > _g8733);
          }
          let _c8742: boolean = _c8735;
          if (!_c8742) {
            let _g8736 = 0;
            G8737: {
              const _a8738 = sp.cells;
              for (let _i8739 = 0; _i8739 < _a8738.length; _i8739++) {
                const v_x = _a8738[_i8739];
                if (!((!(_t8488.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g8736++;
              }
            }
            let _g8740 = 0;
            G8741: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g8740 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c8742 = (_g8736 < _g8740);
          }
          let _c8755: boolean = _c8742;
          if (!_c8755) {
            let _q8743 = false;
            Q8744: {
              const _a8745 = v_S;
              for (let _i8746 = 0; _i8746 < _a8745.length; _i8746++) {
                const v_a = _a8745[_i8746];
                const _a8747 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i8748 = 0; _i8748 < _a8747.length; _i8748++) {
                  const v_L = _a8747[_i8748];
                  _g8749.length = 0;
                  G8750: {
                    const _a8753 = sp.lineCells[v_L];
                    for (let _i8754 = 0; _i8754 < _a8753.length; _i8754++) {
                      const v_x = _a8753[_i8754];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g8749.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g8749).length > v_T)) {
                    _q8743 = true;
                    break Q8744;
                  }
                }
              }
            }
            _c8755 = _q8743;
          }
          let _c9029: boolean = _c8755;
          if (!_c9029) {
            let _q8756 = false;
            Q8757: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g8758.length = 0;
                G8759: {
                  _g8843.length = 0;
                  G8844: {
                    const _a8849 = union(v_S, _t8488);
                    for (let _i8850 = 0; _i8850 < _a8849.length; _i8850++) {
                      const v_x = _a8849[_i8850];
                      const _a8851 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i8852 = 0; _i8852 < _a8851.length; _i8852++) {
                        const v_y = _a8851[_i8852];
                        if (!_g8843.includes(v_y)) _g8843.push(v_y);
                      }
                    }
                  }
                  const _a8853 = _g8843;
                  for (let _i8854 = 0; _i8854 < _a8853.length; _i8854++) {
                    const v_a = _a8853[_i8854];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a8855 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i8856 = 0; _i8856 < _a8855.length; _i8856++) {
                      const v_L = _a8855[_i8856];
                      _g8857.length = 0;
                      G8858: {
                        const _a8861 = sp.lineCells[v_L];
                        for (let _i8862 = 0; _i8862 < _a8861.length; _i8862++) {
                          const v_x = _a8861[_i8862];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g8857.push(v_x);
                        }
                      }
                      L8863: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g8857);
                        const _h8864 = v_G.length;
                        const _h8893 = (_h8864 === 1);
                        let _c8896: boolean = (_h8864 === v_m);
                        if (_c8896) {
                          let _q8865 = true;
                          Q8866: {
                            _g8867.length = 0;
                            G8868: {
                              _g8881.length = 0;
                              G8882: {
                                const _a8887 = v_G;
                                for (let _i8888 = 0; _i8888 < _a8887.length; _i8888++) {
                                  const v_g = _a8887[_i8888];
                                  const _a8889 = sp.adj4[v_g];
                                  for (let _i8890 = 0; _i8890 < _a8889.length; _i8890++) {
                                    const v_z = _a8889[_i8890];
                                    if (!_g8881.includes(v_z)) _g8881.push(v_z);
                                  }
                                }
                              }
                              const _a8891 = _g8881;
                              for (let _i8892 = 0; _i8892 < _a8891.length; _i8892++) {
                                const v_y = _a8891[_i8892];
                                if (!((!(v_G.includes(v_y)) && (_h8893 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g8867.push(v_y);
                              }
                            }
                            const _a8894 = _g8867;
                            for (let _i8895 = 0; _i8895 < _a8894.length; _i8895++) {
                              const v_y = _a8894[_i8895];
                              if (!(((_t8488.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q8865 = false;
                                break Q8866;
                              }
                            }
                          }
                          _c8896 = _q8865;
                        }
                        let _c8927: boolean = _c8896;
                        if (_c8927) {
                          let _q8897 = false;
                          Q8898: {
                            _g8899.length = 0;
                            G8900: {
                              _g8913.length = 0;
                              G8914: {
                                const _a8919 = v_G;
                                for (let _i8920 = 0; _i8920 < _a8919.length; _i8920++) {
                                  const v_g = _a8919[_i8920];
                                  const _a8921 = sp.adj4[v_g];
                                  for (let _i8922 = 0; _i8922 < _a8921.length; _i8922++) {
                                    const v_z = _a8921[_i8922];
                                    if (!_g8913.includes(v_z)) _g8913.push(v_z);
                                  }
                                }
                              }
                              const _a8923 = _g8913;
                              for (let _i8924 = 0; _i8924 < _a8923.length; _i8924++) {
                                const v_y = _a8923[_i8924];
                                if (!((!(v_G.includes(v_y)) && (_h8893 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g8899.push(v_y);
                              }
                            }
                            const _a8925 = union(v_G, _g8899);
                            for (let _i8926 = 0; _i8926 < _a8925.length; _i8926++) {
                              const v_x = _a8925[_i8926];
                              if (((v_S.includes(v_x)) || (_t8488.includes(v_x)))) {
                                _q8897 = true;
                                break Q8898;
                              }
                            }
                          }
                          _c8927 = _q8897;
                        }
                        if (!(_c8927)) break L8863;
                        const _t8928 = (v_G[0] ?? -1);
                        if (!_g8758.includes(_t8928)) _g8758.push(_t8928);
                      }
                    }
                  }
                }
                L8929: {
                  const v_C = _g8758;
                  const _h8930 = v_C.length;
                  if (!((_h8930 > 0))) break L8929;
                  let _g8931 = 0;
                  G8932: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g8931 += cl.fleet.boats[v_k];
                    }
                  }
                  let _g8933 = 0;
                  G8934: {
                    const _a8935 = sp.cells;
                    for (let _i8936 = 0; _i8936 < _a8935.length; _i8936++) {
                      const v_c = _a8935[_i8936];
                      const _h9012 = sp.rowOf[v_c];
                      const _h9020 = sp.colOf[v_c];
                      let _c8938: boolean = ((b.grid[v_c] || -1) === 1);
                      if (_c8938) {
                        const _t8937 = step(sp, v_c, 1);
                        _c8938 = !(((_t8937 !== -1) && ((b.grid[_t8937] || -1) === 1)));
                      }
                      let _c8940: boolean = _c8938;
                      if (_c8940) {
                        const _t8939 = step(sp, v_c, 3);
                        _c8940 = !(((_t8939 !== -1) && ((b.grid[_t8939] || -1) === 1)));
                      }
                      let _c8955: boolean = _c8940;
                      if (_c8955) {
                        const _t8941 = sp.rowOf[v_c];
                        _g8942.length = 0;
                        G8943: {
                          const _a8946 = sp.lineCells[_t8941];
                          for (let _i8947 = 0; _i8947 < _a8946.length; _i8947++) {
                            const v_x = _a8946[_i8947];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g8942.push(v_x);
                          }
                        }
                        const _t8948 = sp.colOf[v_c];
                        _g8949.length = 0;
                        G8950: {
                          const _a8953 = sp.lineCells[_t8948];
                          for (let _i8954 = 0; _i8954 < _a8953.length; _i8954++) {
                            const v_x = _a8953[_i8954];
                            if (!(((b.grid[v_x] || -1) === 1))) continue;
                            _g8949.push(v_x);
                          }
                        }
                        _c8955 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g8942), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g8949)).length === v_m);
                      }
                      let _c9028: boolean = _c8955;
                      if (_c9028) {
                        let _q8992 = true;
                        Q8993: {
                          const _t8994 = sp.rowOf[v_c];
                          _g8995.length = 0;
                          G8996: {
                            const _a8999 = sp.lineCells[_t8994];
                            for (let _i9000 = 0; _i9000 < _a8999.length; _i9000++) {
                              const v_x = _a8999[_i9000];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g8995.push(v_x);
                            }
                          }
                          const _t9001 = sp.colOf[v_c];
                          _g9002.length = 0;
                          G9003: {
                            const _a9006 = sp.lineCells[_t9001];
                            for (let _i9007 = 0; _i9007 < _a9006.length; _i9007++) {
                              const v_x = _a9006[_i9007];
                              if (!(((b.grid[v_x] || -1) === 1))) continue;
                              _g9002.push(v_x);
                            }
                          }
                          const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g8995), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g9002));
                          const _a9008 = v_G;
                          for (let _i9009 = 0; _i9009 < _a9008.length; _i9009++) {
                            const v_x = _a9008[_i9009];
                            const _a9010 = sp.adj4[v_x];
                            for (let _i9011 = 0; _i9011 < _a9010.length; _i9011++) {
                              const v_y = _a9010[_i9011];
                              let _c9019: boolean = !(v_G.includes(v_y));
                              if (_c9019) {
                                _g9013.length = 0;
                                G9014: {
                                  const _a9017 = sp.lineCells[_h9012];
                                  for (let _i9018 = 0; _i9018 < _a9017.length; _i9018++) {
                                    const v_x = _a9017[_i9018];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g9013.push(v_x);
                                  }
                                }
                                _c9019 = ((stretch(sp.lineCells[_h9012], v_c, _g9013).length === 1) || (sp.lineCells[_h9012].includes(v_y)));
                              }
                              let _c9027: boolean = _c9019;
                              if (_c9027) {
                                _g9021.length = 0;
                                G9022: {
                                  const _a9025 = sp.lineCells[_h9020];
                                  for (let _i9026 = 0; _i9026 < _a9025.length; _i9026++) {
                                    const v_x = _a9025[_i9026];
                                    if (!(((b.grid[v_x] || -1) === 1))) continue;
                                    _g9021.push(v_x);
                                  }
                                }
                                _c9027 = ((stretch(sp.lineCells[_h9020], v_c, _g9021).length === 1) || (sp.lineCells[_h9020].includes(v_y)));
                              }
                              if (!(_c9027)) continue;
                              if (!(((b.grid[v_y] || -1) === 2))) {
                                _q8992 = false;
                                break Q8993;
                              }
                            }
                          }
                        }
                        _c9028 = _q8992;
                      }
                      if (!(_c9028)) continue;
                      _g8933++;
                    }
                  }
                  if ((_h8930 > (_g8931 - _g8933))) {
                    _q8756 = true;
                    break Q8757;
                  }
                }
              }
            }
            _c9029 = _q8756;
          }
          _c9030 = _c9029;
        }
        if (!(_c9030)) break L8465;
        facts.length = 0;
        changed = false;
        let _q9031 = true;
        Q9032: {
          const _a9033 = v_S;
          for (let _i9034 = 0; _i9034 < _a9033.length; _i9034++) {
            const v_x = _a9033[_i9034];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q9031 = false;
              break Q9032;
            }
          }
        }
        if (!(_q9031)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ T: v_T, c: v_c, L: v_L, S: v_S }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}
