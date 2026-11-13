// Compiled by `npm run describe` from src/games/tracks/tracks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, cutEdges, edgeGroups, freshBinding, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, step, through, type Kept } from "../../engine/describe-runtime.ts";

const DEV = import.meta.env.DEV;

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  count: ClueList;
  end: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "oneWayIn" | "bothSidesLeft" | "clueFull" | "clueExact" | "closeLoop" | "strand" | "finishEarly" | "looseEnd" | "sharedFate" | "sharedFateEmpties" | "parity";

/** What a firing of each technique that says anything says, by id. */
export interface SaysById {
  oneWayIn: OneWayInSays;
  bothSidesLeft: BothSidesLeftSays;
  clueFull: ClueFullSays;
  clueExact: ClueExactSays;
  closeLoop: CloseLoopSays;
  strand: StrandSays;
  finishEarly: FinishEarlySays;
  looseEnd: LooseEndSays;
  sharedFate: SharedFateSays;
  sharedFateEmpties: SharedFateEmptiesSays;
  parity: ParitySays;
}

/** The kinds of step a firing can be: a technique's id, and for one whose
 * `says` has arms, `<id>.<arm>` for each. */
export const SAYS_KINDS = ["oneWayIn","bothSidesLeft","clueFull","clueExact","closeLoop","strand","finishEarly","looseEnd","sharedFate","sharedFateEmpties","parity"] as const;

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
  { id: "oneWayIn", tier: 0 },
  { id: "bothSidesLeft", tier: 0 },
  { id: "clueFull", tier: 0 },
  { id: "clueExact", tier: 0 },
  { id: "closeLoop", tier: 0 },
  { id: "strand", tier: 0 },
  { id: "finishEarly", tier: 0 },
  { id: "looseEnd", tier: 1 },
  { id: "sharedFate", tier: 1 },
  { id: "sharedFateEmpties", tier: 2 },
  { id: "parity", tier: 2 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g21: number[] = [];
  const _domain = rangeMask(1, 2);
  const _k10 = exitsKept.board(cl);
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
      let _c16: boolean = ((_g5 + (_k10[v_c] ?? exits(sp, cl, v_c))) === 0);
      if (!_c16) {
        let _g11 = 0;
        G12: {
          const _a13 = sp.adj4[v_c];
          for (let _i14 = 0; _i14 < _a13.length; _i14++) {
            const _h15 = (g[sp.adj4Edges[v_c][_i14]] || -1);
            if (!((_h15 === 1))) continue;
            _g11++;
          }
        }
        _c16 = ((_g11 + (_k10[v_c] ?? exits(sp, cl, v_c))) === 2);
      }
      if (!(_c16)) {
        _q1 = false;
        break Q2;
      }
    }
  }
  if (!(_q1)) return false;
  let _g17 = 0;
  G18: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      _g17++;
    }
  }
  if (!((_g17 === 2))) return false;
  let _q19 = true;
  Q20: {
    _g21.length = 0;
    G22: {
      const _a25 = sp.edges;
      for (let _i26 = 0; _i26 < _a25.length; _i26++) {
        const v_e = _a25[_i26];
        const _h27 = (g[v_e] || -1);
        if (!((_h27 === 1))) continue;
        _g21.push(v_e);
      }
    }
    const v_R = _g21;
    const _eg42 = edgeGroups(sp, v_R);
    const _a28 = sp.cells;
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_a = _a28[_i29];
      let _g30 = 0;
      G31: {
        const _a32 = sp.adj4[v_a];
        for (let _i33 = 0; _i33 < _a32.length; _i33++) {
          const _h34 = (g[sp.adj4Edges[v_a][_i33]] || -1);
          if (!((_h34 === 1))) continue;
          _g30++;
        }
      }
      if (!(((_g30 + (_k10[v_a] ?? exits(sp, cl, v_a))) > 0))) continue;
      const _a35 = sp.cells;
      for (let _i36 = 0; _i36 < _a35.length; _i36++) {
        const v_b = _a35[_i36];
        let _g37 = 0;
        G38: {
          const _a39 = sp.adj4[v_b];
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const _h41 = (g[sp.adj4Edges[v_b][_i40]] || -1);
            if (!((_h41 === 1))) continue;
            _g37++;
          }
        }
        if (!(((_g37 + (_k10[v_b] ?? exits(sp, cl, v_b))) > 0))) continue;
        if (!((_eg42.of(v_b) === _eg42.of(v_a)))) {
          _q19 = false;
          break Q20;
        }
      }
    }
  }
  if (!(_q19)) return false;
  for (let _k43 = 0; _k43 < cl.count.at.length; _k43++) {
    const _at44 = cl.count.at[_k43];
    const _v45 = cl.count.v[_k43];
    let _g46 = 0;
    G47: {
      const _a48 = sp.lineCells[_at44];
      for (let _i49 = 0; _i49 < _a48.length; _i49++) {
        const v_c = _a48[_i49];
        let _g50 = 0;
        G51: {
          const _a52 = sp.adj4[v_c];
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const _h54 = (g[sp.adj4Edges[v_c][_i53]] || -1);
            if (!((_h54 === 1))) continue;
            _g50++;
          }
        }
        if (!(((_g50 + (_k10[v_c] ?? exits(sp, cl, v_c))) > 0))) continue;
        _g46++;
      }
    }
    if (!((_g46 === _v45))) return false;
  }
  for (let _k55 = 0; _k55 < cl.end.at.length; _k55++) {
    const _at56 = cl.end.at[_k55];
    const _v57 = cl.end.v[_k55];
    let _g58 = 0;
    G59: {
      const _a60 = sp.adj4[_at56];
      for (let _i61 = 0; _i61 < _a60.length; _i61++) {
        const _h62 = (g[sp.adj4Edges[_at56][_i61]] || -1);
        if (!((_h62 === 1))) continue;
        _g58++;
      }
    }
    if (!((((_g58 + (_k10[_at56] ?? exits(sp, cl, _at56))) === 2) && (step(sp, _at56, _v57) === -1)))) return false;
  }
  return true;
}

export interface OneWayInBinding {
  c: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface OneWayInSays {
  terms: { c: number; };
  marks: {  };
}

const oneWayInFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function oneWayIn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneWayInBinding, OneWayInSays> | null): number {
  const _g42: number[] = [];
  const facts = oneWayInFacts;
  let fired = 0;
  let changed = false;
  const _k68 = exitsKept.board(cl);
  const _a40 = sp.cells;
  for (let _i41 = 0; _i41 < _a40.length; _i41++) {
    const v_c = _a40[_i41];
    let _c78: boolean = !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0));
    if (_c78) {
      _g42.length = 0;
      G43: {
        const _a59 = sp.adj4[v_c];
        for (let _i60 = 0; _i60 < _a59.length; _i60++) {
          const v_y = _a59[_i60];
          const _h61 = (b.grid[sp.adj4Edges[v_c][_i60]] || -1);
          let _c72: boolean = (_h61 !== 1);
          if (_c72) {
            let _c71: boolean = (((_h61 === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
            if (!_c71) {
              let _c70: boolean = (_h61 !== 1);
              if (_c70) {
                let _c69: boolean = (drawn(b, sp, cl, v_c) === 2);
                if (!_c69) {
                  let _g62 = 0;
                  G63: {
                    const _a65 = sp.adj4[v_y];
                    for (let _i66 = 0; _i66 < _a65.length; _i66++) {
                      const _h67 = (b.grid[sp.adj4Edges[v_y][_i66]] || -1);
                      if (!((_h67 === 1))) continue;
                      _g62++;
                    }
                  }
                  _c69 = ((_g62 + (_k68[v_y] ?? exits(sp, cl, v_y))) === 2);
                }
                _c70 = _c69;
              }
              _c71 = _c70;
            }
            _c72 = !(_c71);
          }
          if (!(_c72)) continue;
          _g42.push(v_y);
        }
      }
      let _g73 = 0;
      G74: {
        const _a75 = sp.adj4[v_c];
        for (let _i76 = 0; _i76 < _a75.length; _i76++) {
          const _h77 = (b.grid[sp.adj4Edges[v_c][_i76]] || -1);
          if (!((_h77 === 1))) continue;
          _g73++;
        }
      }
      _c78 = ((_g42.length + (_g73 + (_k68[v_c] ?? exits(sp, cl, v_c)))) < 2);
    }
    if (!(_c78)) continue;
    if (DEV && staleChecking) {
      let _c115: boolean = !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0));
      if (_c115) {
        const _g79: number[] = [];
        G80: {
          const _a96 = sp.adj4[v_c];
          for (let _i97 = 0; _i97 < _a96.length; _i97++) {
            const v_y = _a96[_i97];
            let _c110: boolean = ((b.grid[sp.adj4Edges[v_c][_i97]] || -1) !== 1);
            if (_c110) {
              let _c109: boolean = ((((b.grid[sp.adj4Edges[v_c][_i97]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
              if (!_c109) {
                let _c108: boolean = ((b.grid[sp.adj4Edges[v_c][_i97]] || -1) !== 1);
                if (_c108) {
                  let _g98 = 0;
                  G99: {
                    const _a100 = sp.adj4[v_c];
                    for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                      if (!(((b.grid[sp.adj4Edges[v_c][_i101]] || -1) === 1))) continue;
                      _g98++;
                    }
                  }
                  let _c107: boolean = ((_g98 + exits(sp, cl, v_c)) === 2);
                  if (!_c107) {
                    let _g102 = 0;
                    G103: {
                      const _a105 = sp.adj4[v_y];
                      for (let _i106 = 0; _i106 < _a105.length; _i106++) {
                        if (!(((b.grid[sp.adj4Edges[v_y][_i106]] || -1) === 1))) continue;
                        _g102++;
                      }
                    }
                    _c107 = ((_g102 + exits(sp, cl, v_y)) === 2);
                  }
                  _c108 = _c107;
                }
                _c109 = _c108;
              }
              _c110 = !(_c109);
            }
            if (!(_c110)) continue;
            _g79.push(v_y);
          }
        }
        let _g111 = 0;
        G112: {
          const _a113 = sp.adj4[v_c];
          for (let _i114 = 0; _i114 < _a113.length; _i114++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i114]] || -1) === 1))) continue;
            _g111++;
          }
        }
        _c115 = ((_g79.length + (_g111 + exits(sp, cl, v_c))) < 2);
      }
      freshBinding("oneWayIn", [(sp.cells.includes(v_c)), _c115], ["c in", "where of c"]);
    }
    facts.length = 0;
    changed = false;
    let _c121: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c121) {
      let _g116 = 0;
      G117: {
        const _a118 = sp.adj4[v_c];
        for (let _i119 = 0; _i119 < _a118.length; _i119++) {
          const _h120 = (b.grid[sp.adj4Edges[v_c][_i119]] || -1);
          if (!((_h120 === 1))) continue;
          _g116++;
        }
      }
      _c121 = ((_g116 + (_k68[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c122: boolean = !(_c121);
    if (_c122) {
      if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
      _c122 = true;
    }
    if (!(_c122)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { c: v_c }, marks: {  } };
        if (!fire({ c: v_c }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

export interface BothSidesLeftBinding {
  c: number;
  F: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface BothSidesLeftSays {
  terms: { c: number; };
  marks: {  };
}

const bothSidesLeftFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function bothSidesLeft(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BothSidesLeftBinding, BothSidesLeftSays> | null): number {
  const _g64: number[] = [];
  const facts = bothSidesLeftFacts;
  let fired = 0;
  let changed = false;
  const _k57 = exitsKept.board(cl);
  const _a51 = sp.cells;
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_c = _a51[_i52];
    let _c58: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
    if (!_c58) {
      let _g53 = 0;
      G54: {
        const _a55 = sp.adj4[v_c];
        for (let _i56 = 0; _i56 < _a55.length; _i56++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i56]] || -1) === 1))) continue;
          _g53++;
        }
      }
      _c58 = ((_g53 + (_k57[v_c] ?? exits(sp, cl, v_c))) > 0);
    }
    let _c63: boolean = _c58;
    if (_c63) {
      let _g59 = 0;
      G60: {
        const _a61 = sp.adj4[v_c];
        for (let _i62 = 0; _i62 < _a61.length; _i62++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i62]] || -1) === 1))) continue;
          _g59++;
        }
      }
      _c63 = ((_g59 + (_k57[v_c] ?? exits(sp, cl, v_c))) < 2);
    }
    if (!(_c63)) continue;
    _g64.length = 0;
    G65: {
      const _a81 = sp.adj4[v_c];
      for (let _i82 = 0; _i82 < _a81.length; _i82++) {
        const v_y = _a81[_i82];
        let _c91: boolean = ((b.grid[sp.adj4Edges[v_c][_i82]] || -1) !== 1);
        if (_c91) {
          let _c90: boolean = ((((b.grid[sp.adj4Edges[v_c][_i82]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
          if (!_c90) {
            let _c89: boolean = ((b.grid[sp.adj4Edges[v_c][_i82]] || -1) !== 1);
            if (_c89) {
              let _c88: boolean = (drawn(b, sp, cl, v_c) === 2);
              if (!_c88) {
                let _g83 = 0;
                G84: {
                  const _a86 = sp.adj4[v_y];
                  for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                    if (!(((b.grid[sp.adj4Edges[v_y][_i87]] || -1) === 1))) continue;
                    _g83++;
                  }
                }
                _c88 = ((_g83 + (_k57[v_y] ?? exits(sp, cl, v_y))) === 2);
              }
              _c89 = _c88;
            }
            _c90 = _c89;
          }
          _c91 = !(_c90);
        }
        if (!(_c91)) continue;
        _g64.push(v_y);
      }
    }
    L92: {
      const v_F = _g64;
      const _h93 = v_F.length;
      let _c98: boolean = (_h93 > 0);
      if (_c98) {
        let _g94 = 0;
        G95: {
          const _a96 = sp.adj4[v_c];
          for (let _i97 = 0; _i97 < _a96.length; _i97++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i97]] || -1) === 1))) continue;
            _g94++;
          }
        }
        _c98 = ((_h93 + (_g94 + (_k57[v_c] ?? exits(sp, cl, v_c)))) <= 2);
      }
      if (!(_c98)) break L92;
      if (DEV && staleChecking) {
        let _c103: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c103) {
          let _g99 = 0;
          G100: {
            const _a101 = sp.adj4[v_c];
            for (let _i102 = 0; _i102 < _a101.length; _i102++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i102]] || -1) === 1))) continue;
              _g99++;
            }
          }
          _c103 = ((_g99 + exits(sp, cl, v_c)) > 0);
        }
        let _c108: boolean = _c103;
        if (_c108) {
          let _g104 = 0;
          G105: {
            const _a106 = sp.adj4[v_c];
            for (let _i107 = 0; _i107 < _a106.length; _i107++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i107]] || -1) === 1))) continue;
              _g104++;
            }
          }
          _c108 = ((_g104 + exits(sp, cl, v_c)) < 2);
        }
        const _g109: number[] = [];
        G110: {
          const _a126 = sp.adj4[v_c];
          for (let _i127 = 0; _i127 < _a126.length; _i127++) {
            const v_y = _a126[_i127];
            let _c140: boolean = ((b.grid[sp.adj4Edges[v_c][_i127]] || -1) !== 1);
            if (_c140) {
              let _c139: boolean = ((((b.grid[sp.adj4Edges[v_c][_i127]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
              if (!_c139) {
                let _c138: boolean = ((b.grid[sp.adj4Edges[v_c][_i127]] || -1) !== 1);
                if (_c138) {
                  let _g128 = 0;
                  G129: {
                    const _a130 = sp.adj4[v_c];
                    for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                      if (!(((b.grid[sp.adj4Edges[v_c][_i131]] || -1) === 1))) continue;
                      _g128++;
                    }
                  }
                  let _c137: boolean = ((_g128 + exits(sp, cl, v_c)) === 2);
                  if (!_c137) {
                    let _g132 = 0;
                    G133: {
                      const _a135 = sp.adj4[v_y];
                      for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                        if (!(((b.grid[sp.adj4Edges[v_y][_i136]] || -1) === 1))) continue;
                        _g132++;
                      }
                    }
                    _c137 = ((_g132 + exits(sp, cl, v_y)) === 2);
                  }
                  _c138 = _c137;
                }
                _c139 = _c138;
              }
              _c140 = !(_c139);
            }
            if (!(_c140)) continue;
            _g109.push(v_y);
          }
        }
        let _c145: boolean = (v_F.length > 0);
        if (_c145) {
          let _g141 = 0;
          G142: {
            const _a143 = sp.adj4[v_c];
            for (let _i144 = 0; _i144 < _a143.length; _i144++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i144]] || -1) === 1))) continue;
              _g141++;
            }
          }
          _c145 = ((v_F.length + (_g141 + exits(sp, cl, v_c))) <= 2);
        }
        freshBinding("bothSidesLeft", [(sp.cells.includes(v_c)), _c108, sameSet(v_F, _g109), _c145], ["c in", "where of c", "F =", "where of F"]);
      }
      facts.length = 0;
      changed = false;
      let _g146 = 0;
      G147: {
        const _a148 = sp.adj4[v_c];
        for (let _i149 = 0; _i149 < _a148.length; _i149++) {
          if (!(((b.grid[sp.adj4Edges[v_c][_i149]] || -1) === 1))) continue;
          _g146++;
        }
      }
      let _c155: boolean = ((_h93 + (_g146 + (_k57[v_c] ?? exits(sp, cl, v_c)))) === 2);
      if (_c155) {
        let _q150 = true;
        Q151: {
          const _a152 = v_F;
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_y = _a152[_i153];
            const _t154 = sp.edgeOf(v_c, v_y);
            if (!(b.grid[_t154] !== 0)) { if (fire === null) { b.placeAt(_t154, 1); changed = true; } else facts.push(PLACE, _t154, 1); }
            if (!(true)) {
              _q150 = false;
              break Q151;
            }
          }
        }
        _c155 = _q150;
      }
      if (!(_c155)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { c: v_c }, marks: {  } };
          if (!fire({ c: v_c, F: v_F.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ClueFullBinding {
  L: number;
  O: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ClueFullSays {
  terms: { L: number; };
  marks: {  };
}

const clueFullFacts: number[] = [];
let clueFullCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function clueFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueFullBinding, ClueFullSays> | null): number {
  const _g22: number[] = [];
  const facts = clueFullFacts;
  let fired = 0;
  let changed = false;
  const _k38 = exitsKept.board(cl);
  if (clueFullCands.length < sp.edges.length) clueFullCands = new Int32Array(sp.edges.length);
  const cands = clueFullCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a20 = sp.lines;
  for (let _i21 = 0; _i21 < _a20.length; _i21++) {
    const v_L = _a20[_i21];
    const _h42 = clueAt(cl.count, v_L);
    _g22.length = 0;
    G23: {
      const _a31 = sp.lineCells[v_L];
      for (let _i32 = 0; _i32 < _a31.length; _i32++) {
        const v_c = _a31[_i32];
        let _c39: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c39) {
          let _g33 = 0;
          G34: {
            const _a35 = sp.adj4[v_c];
            for (let _i36 = 0; _i36 < _a35.length; _i36++) {
              const _h37 = (b.grid[sp.adj4Edges[v_c][_i36]] || -1);
              if (!((_h37 === 1))) continue;
              _g33++;
            }
          }
          _c39 = ((_g33 + (_k38[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c39) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g22.push(v_c);
      }
    }
    L40: {
      const v_O = _g22;
      const _h41 = v_O.length;
      if (!(((_h41 > 0) && (laidMarked(b, sp, cl, cands, v_L) >= _h42)))) break L40;
      if (DEV && staleChecking) {
        const _g43: number[] = [];
        G44: {
          const _a52 = sp.lineCells[v_L];
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const v_c = _a52[_i53];
            let _c58: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c58) {
              let _g54 = 0;
              G55: {
                const _a56 = sp.adj4[v_c];
                for (let _i57 = 0; _i57 < _a56.length; _i57++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i57]] || -1) === 1))) continue;
                  _g54++;
                }
              }
              _c58 = ((_g54 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c58) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g43.push(v_c);
          }
        }
        freshBinding("clueFull", [(sp.lines.includes(v_L)), sameSet(v_O, _g43), ((v_O.length > 0) && (laidMarked(b, sp, cl, cands, v_L) >= clueAt(cl.count, v_L)))], ["L in", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _c63: boolean = (laidMarked(b, sp, cl, cands, v_L) === _h42);
      if (_c63) {
        let _q59 = true;
        Q60: {
          const _a61 = v_O;
          for (let _i62 = 0; _i62 < _a61.length; _i62++) {
            const v_c = _a61[_i62];
            if ((b.edgeCand(v_c) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 1); changed = true; } else facts.push(STRIKE_EDGE, v_c, 1); }
            if (!(true)) {
              _q59 = false;
              break Q60;
            }
          }
        }
        _c63 = _q59;
      }
      if (!(_c63)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { L: v_L }, marks: {  } };
          if (!fire({ L: v_L, O: v_O.slice() }, facts, _says)) return 1;
        }
        cands.fill(-1);
        laidMarkedKept.clear();
      }
    }
  }
  return fired;
}

export interface ClueExactBinding {
  L: number;
  O: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ClueExactSays {
  terms: { L: number; };
  marks: {  };
}

const clueExactFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clueExact(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueExactBinding, ClueExactSays> | null): number {
  const _g27: number[] = [];
  const facts = clueExactFacts;
  let fired = 0;
  let changed = false;
  const _k43 = exitsKept.board(cl);
  const _a25 = sp.lines;
  for (let _i26 = 0; _i26 < _a25.length; _i26++) {
    const v_L = _a25[_i26];
    const _h51 = clueAt(cl.count, v_L);
    _g27.length = 0;
    G28: {
      const _a36 = sp.lineCells[v_L];
      for (let _i37 = 0; _i37 < _a36.length; _i37++) {
        const v_c = _a36[_i37];
        let _c44: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c44) {
          let _g38 = 0;
          G39: {
            const _a40 = sp.adj4[v_c];
            for (let _i41 = 0; _i41 < _a40.length; _i41++) {
              const _h42 = (b.grid[sp.adj4Edges[v_c][_i41]] || -1);
              if (!((_h42 === 1))) continue;
              _g38++;
            }
          }
          _c44 = ((_g38 + (_k43[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c44) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g27.push(v_c);
      }
    }
    L45: {
      const v_O = _g27;
      const _h46 = v_O.length;
      let _c52: boolean = (_h46 > 0);
      if (_c52) {
        let _g47 = 0;
        G48: {
          const _a49 = sp.lineCells[v_L];
          for (let _i50 = 0; _i50 < _a49.length; _i50++) {
            const v_c = _a49[_i50];
            if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
            _g47++;
          }
        }
        _c52 = ((sp.lineCells[v_L].length - _g47) <= _h51);
      }
      if (!(_c52)) break L45;
      if (DEV && staleChecking) {
        const _g53: number[] = [];
        G54: {
          const _a62 = sp.lineCells[v_L];
          for (let _i63 = 0; _i63 < _a62.length; _i63++) {
            const v_c = _a62[_i63];
            let _c68: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c68) {
              let _g64 = 0;
              G65: {
                const _a66 = sp.adj4[v_c];
                for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i67]] || -1) === 1))) continue;
                  _g64++;
                }
              }
              _c68 = ((_g64 + exits(sp, cl, v_c)) > 0);
            }
            if (!((!(_c68) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g53.push(v_c);
          }
        }
        let _c73: boolean = (v_O.length > 0);
        if (_c73) {
          let _g69 = 0;
          G70: {
            const _a71 = sp.lineCells[v_L];
            for (let _i72 = 0; _i72 < _a71.length; _i72++) {
              const v_c = _a71[_i72];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g69++;
            }
          }
          _c73 = ((sp.lineCells[v_L].length - _g69) <= clueAt(cl.count, v_L));
        }
        freshBinding("clueExact", [(sp.lines.includes(v_L)), sameSet(v_O, _g53), _c73], ["L in", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _g74 = 0;
      G75: {
        const _a76 = sp.lineCells[v_L];
        for (let _i77 = 0; _i77 < _a76.length; _i77++) {
          const v_c = _a76[_i77];
          if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
          _g74++;
        }
      }
      let _c82: boolean = ((sp.lineCells[v_L].length - _g74) === _h51);
      if (_c82) {
        let _q78 = true;
        Q79: {
          const _a80 = v_O;
          for (let _i81 = 0; _i81 < _a80.length; _i81++) {
            const v_c = _a80[_i81];
            if ((b.edgeCand(v_c) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_c, 2); changed = true; } else facts.push(STRIKE_EDGE, v_c, 2); }
            if (!(true)) {
              _q78 = false;
              break Q79;
            }
          }
        }
        _c82 = _q78;
      }
      if (!(_c82)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { L: v_L }, marks: {  } };
          if (!fire({ L: v_L, O: v_O.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CloseLoopBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface CloseLoopSays {
  terms: { e: number; G: readonly number[]; };
  marks: {  };
}

const closeLoopFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closeLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CloseLoopBinding, CloseLoopSays> | null): number {
  const _g38: number[] = [];
  const facts = closeLoopFacts;
  let fired = 0;
  let changed = false;
  const _k51 = exitsKept.board(cl);
  const _m113_0 = b.made[0];
  _g38.length = 0;
  G39: {
    const _a42 = sp.edges;
    for (let _i43 = 0; _i43 < _a42.length; _i43++) {
      const v_e = _a42[_i43];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g38.push(v_e);
    }
  }
  const v_R = _g38;
  const _m114_1 = b.made[1];
  const _m115_2 = b.made[2];
  const _eg75 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a44 = sp.edges;
  R1:
  for (let _i45 = 0; _i45 < _a44.length; _i45++) {
    const v_e = _a44[_i45];
    let _c53: boolean = !((b.grid[v_e] !== 0));
    if (_c53) {
      const _t46 = sp.edgeEnds[2 * v_e];
      let _c52: boolean = !(((b.edgeCand(_t46) >> 2) & 1) !== 0);
      if (!_c52) {
        let _g47 = 0;
        G48: {
          const _a49 = sp.adj4[_t46];
          for (let _i50 = 0; _i50 < _a49.length; _i50++) {
            if (!(((b.grid[sp.adj4Edges[_t46][_i50]] || -1) === 1))) continue;
            _g47++;
          }
        }
        _c52 = ((_g47 + (_k51[_t46] ?? exits(sp, cl, _t46))) > 0);
      }
      _c53 = _c52;
    }
    let _c60: boolean = _c53;
    if (_c60) {
      const _t54 = sp.edgeEnds[2 * v_e + 1];
      let _c59: boolean = !(((b.edgeCand(_t54) >> 2) & 1) !== 0);
      if (!_c59) {
        let _g55 = 0;
        G56: {
          const _a57 = sp.adj4[_t54];
          for (let _i58 = 0; _i58 < _a57.length; _i58++) {
            if (!(((b.grid[sp.adj4Edges[_t54][_i58]] || -1) === 1))) continue;
            _g55++;
          }
        }
        _c59 = ((_g55 + (_k51[_t54] ?? exits(sp, cl, _t54))) > 0);
      }
      _c60 = _c59;
    }
    let _c74: boolean = _c60;
    if (_c74) {
      const _t61 = sp.edgeEnds[2 * v_e];
      const _t62 = sp.edgeEnds[2 * v_e + 1];
      let _c73: boolean = ((((b.grid[sp.edgeOf(_t61, _t62)] || -1) === 2) || !(((b.edgeCand(_t61) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t62) >> 1) & 1) !== 0));
      if (!_c73) {
        let _c72: boolean = ((b.grid[sp.edgeOf(_t61, _t62)] || -1) !== 1);
        if (_c72) {
          let _g63 = 0;
          G64: {
            const _a65 = sp.adj4[_t61];
            for (let _i66 = 0; _i66 < _a65.length; _i66++) {
              if (!(((b.grid[sp.adj4Edges[_t61][_i66]] || -1) === 1))) continue;
              _g63++;
            }
          }
          let _c71: boolean = ((_g63 + (_k51[_t61] ?? exits(sp, cl, _t61))) === 2);
          if (!_c71) {
            let _g67 = 0;
            G68: {
              const _a69 = sp.adj4[_t62];
              for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                if (!(((b.grid[sp.adj4Edges[_t62][_i70]] || -1) === 1))) continue;
                _g67++;
              }
            }
            _c71 = ((_g67 + (_k51[_t62] ?? exits(sp, cl, _t62))) === 2);
          }
          _c72 = _c71;
        }
        _c73 = _c72;
      }
      _c74 = !(_c73);
    }
    if (!(_c74)) continue;
    L76: {
      const v_G = _eg75.of(sp.edgeEnds[2 * v_e]);
      if (!((_eg75.of(sp.edgeEnds[2 * v_e + 1]) === v_G))) break L76;
      if (b.made[0] !== _m113_0 || b.made[1] !== _m114_1 || b.made[2] !== _m115_2) {
        const _now77 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now77 === _eg75.of(sp.edgeEnds[2 * v_e]) || sameSet(_now77, _eg75.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g78: number[] = [];
        G79: {
          const _a82 = sp.edges;
          for (let _i83 = 0; _i83 < _a82.length; _i83++) {
            const v_e = _a82[_i83];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g78.push(v_e);
          }
        }
        const _fg84 = edgeGroups(sp, _g78);
        let _c91: boolean = !((b.grid[v_e] !== 0));
        if (_c91) {
          const _t85 = sp.edgeEnds[2 * v_e];
          let _c90: boolean = !(((b.edgeCand(_t85) >> 2) & 1) !== 0);
          if (!_c90) {
            let _g86 = 0;
            G87: {
              const _a88 = sp.adj4[_t85];
              for (let _i89 = 0; _i89 < _a88.length; _i89++) {
                if (!(((b.grid[sp.adj4Edges[_t85][_i89]] || -1) === 1))) continue;
                _g86++;
              }
            }
            _c90 = ((_g86 + exits(sp, cl, _t85)) > 0);
          }
          _c91 = _c90;
        }
        let _c98: boolean = _c91;
        if (_c98) {
          const _t92 = sp.edgeEnds[2 * v_e + 1];
          let _c97: boolean = !(((b.edgeCand(_t92) >> 2) & 1) !== 0);
          if (!_c97) {
            let _g93 = 0;
            G94: {
              const _a95 = sp.adj4[_t92];
              for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                if (!(((b.grid[sp.adj4Edges[_t92][_i96]] || -1) === 1))) continue;
                _g93++;
              }
            }
            _c97 = ((_g93 + exits(sp, cl, _t92)) > 0);
          }
          _c98 = _c97;
        }
        let _c112: boolean = _c98;
        if (_c112) {
          const _t99 = sp.edgeEnds[2 * v_e];
          const _t100 = sp.edgeEnds[2 * v_e + 1];
          let _c111: boolean = ((((b.grid[sp.edgeOf(_t99, _t100)] || -1) === 2) || !(((b.edgeCand(_t99) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t100) >> 1) & 1) !== 0));
          if (!_c111) {
            let _c110: boolean = ((b.grid[sp.edgeOf(_t99, _t100)] || -1) !== 1);
            if (_c110) {
              let _g101 = 0;
              G102: {
                const _a103 = sp.adj4[_t99];
                for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                  if (!(((b.grid[sp.adj4Edges[_t99][_i104]] || -1) === 1))) continue;
                  _g101++;
                }
              }
              let _c109: boolean = ((_g101 + exits(sp, cl, _t99)) === 2);
              if (!_c109) {
                let _g105 = 0;
                G106: {
                  const _a107 = sp.adj4[_t100];
                  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                    if (!(((b.grid[sp.adj4Edges[_t100][_i108]] || -1) === 1))) continue;
                    _g105++;
                  }
                }
                _c109 = ((_g105 + exits(sp, cl, _t100)) === 2);
              }
              _c110 = _c109;
            }
            _c111 = _c110;
          }
          _c112 = !(_c111);
        }
        freshBinding("closeLoop", [sameSet(_fg84.of(sp.edgeEnds[2 * v_e]), _eg75.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), _c112, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), (_eg75.of(sp.edgeEnds[2 * v_e + 1]) === v_G)], ["R's groups", "e in", "where of e", "G =", "where of G"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { e: v_e, G: v_G.slice() }, marks: {  } };
          if (!fire({ R: v_R.slice(), e: v_e, G: v_G.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface StrandBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
  H: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface StrandSays {
  terms: { e: number; G: readonly number[]; H: readonly number[]; };
  marks: {  };
}

const strandFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function strand(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandBinding, StrandSays> | null): number {
  const _g54: number[] = [];
  const facts = strandFacts;
  let fired = 0;
  let changed = false;
  const _k67 = exitsKept.board(cl);
  const _m162_0 = b.made[0];
  _g54.length = 0;
  G55: {
    const _a58 = sp.edges;
    for (let _i59 = 0; _i59 < _a58.length; _i59++) {
      const v_e = _a58[_i59];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g54.push(v_e);
    }
  }
  const v_R = _g54;
  const _m163_1 = b.made[1];
  const _m164_2 = b.made[2];
  const _eg91 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a60 = sp.edges;
  R1:
  for (let _i61 = 0; _i61 < _a60.length; _i61++) {
    const v_e = _a60[_i61];
    let _c69: boolean = !((b.grid[v_e] !== 0));
    if (_c69) {
      const _t62 = sp.edgeEnds[2 * v_e];
      let _c68: boolean = !(((b.edgeCand(_t62) >> 2) & 1) !== 0);
      if (!_c68) {
        let _g63 = 0;
        G64: {
          const _a65 = sp.adj4[_t62];
          for (let _i66 = 0; _i66 < _a65.length; _i66++) {
            if (!(((b.grid[sp.adj4Edges[_t62][_i66]] || -1) === 1))) continue;
            _g63++;
          }
        }
        _c68 = ((_g63 + (_k67[_t62] ?? exits(sp, cl, _t62))) > 0);
      }
      _c69 = _c68;
    }
    let _c76: boolean = _c69;
    if (_c76) {
      const _t70 = sp.edgeEnds[2 * v_e + 1];
      let _c75: boolean = !(((b.edgeCand(_t70) >> 2) & 1) !== 0);
      if (!_c75) {
        let _g71 = 0;
        G72: {
          const _a73 = sp.adj4[_t70];
          for (let _i74 = 0; _i74 < _a73.length; _i74++) {
            if (!(((b.grid[sp.adj4Edges[_t70][_i74]] || -1) === 1))) continue;
            _g71++;
          }
        }
        _c75 = ((_g71 + (_k67[_t70] ?? exits(sp, cl, _t70))) > 0);
      }
      _c76 = _c75;
    }
    let _c90: boolean = _c76;
    if (_c90) {
      const _t77 = sp.edgeEnds[2 * v_e];
      const _t78 = sp.edgeEnds[2 * v_e + 1];
      let _c89: boolean = ((((b.grid[sp.edgeOf(_t77, _t78)] || -1) === 2) || !(((b.edgeCand(_t77) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t78) >> 1) & 1) !== 0));
      if (!_c89) {
        let _c88: boolean = ((b.grid[sp.edgeOf(_t77, _t78)] || -1) !== 1);
        if (_c88) {
          let _g79 = 0;
          G80: {
            const _a81 = sp.adj4[_t77];
            for (let _i82 = 0; _i82 < _a81.length; _i82++) {
              if (!(((b.grid[sp.adj4Edges[_t77][_i82]] || -1) === 1))) continue;
              _g79++;
            }
          }
          let _c87: boolean = ((_g79 + (_k67[_t77] ?? exits(sp, cl, _t77))) === 2);
          if (!_c87) {
            let _g83 = 0;
            G84: {
              const _a85 = sp.adj4[_t78];
              for (let _i86 = 0; _i86 < _a85.length; _i86++) {
                if (!(((b.grid[sp.adj4Edges[_t78][_i86]] || -1) === 1))) continue;
                _g83++;
              }
            }
            _c87 = ((_g83 + (_k67[_t78] ?? exits(sp, cl, _t78))) === 2);
          }
          _c88 = _c87;
        }
        _c89 = _c88;
      }
      _c90 = !(_c89);
    }
    if (!(_c90)) continue;
    const v_G = _eg91.of(sp.edgeEnds[2 * v_e]);
    L92: {
      const v_H = _eg91.of(sp.edgeEnds[2 * v_e + 1]);
      let _c95: boolean = !(_eg91.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c95) {
        let _q93 = false;
        Q94: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg91.of(cl.end.at[v_q]) === v_G)) {
              _q93 = true;
              break Q94;
            }
          }
        }
        _c95 = _q93;
      }
      let _c98: boolean = _c95;
      if (_c98) {
        let _q96 = false;
        Q97: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg91.of(cl.end.at[v_q]) === v_H)) {
              _q96 = true;
              break Q97;
            }
          }
        }
        _c98 = _q96;
      }
      let _c108: boolean = _c98;
      if (_c108) {
        let _q99 = false;
        Q100: {
          const _a101 = sp.cells;
          for (let _i102 = 0; _i102 < _a101.length; _i102++) {
            const v_c = _a101[_i102];
            let _c107: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c107) {
              let _g103 = 0;
              G104: {
                const _a105 = sp.adj4[v_c];
                for (let _i106 = 0; _i106 < _a105.length; _i106++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i106]] || -1) === 1))) continue;
                  _g103++;
                }
              }
              _c107 = ((_g103 + (_k67[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (((_c107 && !(_eg91.of(v_c) === v_G)) && !(_eg91.of(v_c) === v_H))) {
              _q99 = true;
              break Q100;
            }
          }
        }
        _c108 = _q99;
      }
      if (!(_c108)) break L92;
      if (b.made[0] !== _m162_0 || b.made[1] !== _m163_1 || b.made[2] !== _m164_2) {
        const _now109 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now109 === _eg91.of(sp.edgeEnds[2 * v_e]) || sameSet(_now109, _eg91.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now110 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now110 === _eg91.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now110, _eg91.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g111: number[] = [];
        G112: {
          const _a115 = sp.edges;
          for (let _i116 = 0; _i116 < _a115.length; _i116++) {
            const v_e = _a115[_i116];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g111.push(v_e);
          }
        }
        const _fg117 = edgeGroups(sp, _g111);
        let _c124: boolean = !((b.grid[v_e] !== 0));
        if (_c124) {
          const _t118 = sp.edgeEnds[2 * v_e];
          let _c123: boolean = !(((b.edgeCand(_t118) >> 2) & 1) !== 0);
          if (!_c123) {
            let _g119 = 0;
            G120: {
              const _a121 = sp.adj4[_t118];
              for (let _i122 = 0; _i122 < _a121.length; _i122++) {
                if (!(((b.grid[sp.adj4Edges[_t118][_i122]] || -1) === 1))) continue;
                _g119++;
              }
            }
            _c123 = ((_g119 + exits(sp, cl, _t118)) > 0);
          }
          _c124 = _c123;
        }
        let _c131: boolean = _c124;
        if (_c131) {
          const _t125 = sp.edgeEnds[2 * v_e + 1];
          let _c130: boolean = !(((b.edgeCand(_t125) >> 2) & 1) !== 0);
          if (!_c130) {
            let _g126 = 0;
            G127: {
              const _a128 = sp.adj4[_t125];
              for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                if (!(((b.grid[sp.adj4Edges[_t125][_i129]] || -1) === 1))) continue;
                _g126++;
              }
            }
            _c130 = ((_g126 + exits(sp, cl, _t125)) > 0);
          }
          _c131 = _c130;
        }
        let _c145: boolean = _c131;
        if (_c145) {
          const _t132 = sp.edgeEnds[2 * v_e];
          const _t133 = sp.edgeEnds[2 * v_e + 1];
          let _c144: boolean = ((((b.grid[sp.edgeOf(_t132, _t133)] || -1) === 2) || !(((b.edgeCand(_t132) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t133) >> 1) & 1) !== 0));
          if (!_c144) {
            let _c143: boolean = ((b.grid[sp.edgeOf(_t132, _t133)] || -1) !== 1);
            if (_c143) {
              let _g134 = 0;
              G135: {
                const _a136 = sp.adj4[_t132];
                for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                  if (!(((b.grid[sp.adj4Edges[_t132][_i137]] || -1) === 1))) continue;
                  _g134++;
                }
              }
              let _c142: boolean = ((_g134 + exits(sp, cl, _t132)) === 2);
              if (!_c142) {
                let _g138 = 0;
                G139: {
                  const _a140 = sp.adj4[_t133];
                  for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                    if (!(((b.grid[sp.adj4Edges[_t133][_i141]] || -1) === 1))) continue;
                    _g138++;
                  }
                }
                _c142 = ((_g138 + exits(sp, cl, _t133)) === 2);
              }
              _c143 = _c142;
            }
            _c144 = _c143;
          }
          _c145 = !(_c144);
        }
        let _c148: boolean = !(_eg91.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c148) {
          let _q146 = false;
          Q147: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg91.of(cl.end.at[v_q]) === v_G)) {
                _q146 = true;
                break Q147;
              }
            }
          }
          _c148 = _q146;
        }
        let _c151: boolean = _c148;
        if (_c151) {
          let _q149 = false;
          Q150: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg91.of(cl.end.at[v_q]) === v_H)) {
                _q149 = true;
                break Q150;
              }
            }
          }
          _c151 = _q149;
        }
        let _c161: boolean = _c151;
        if (_c161) {
          let _q152 = false;
          Q153: {
            const _a154 = sp.cells;
            for (let _i155 = 0; _i155 < _a154.length; _i155++) {
              const v_c = _a154[_i155];
              let _c160: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c160) {
                let _g156 = 0;
                G157: {
                  const _a158 = sp.adj4[v_c];
                  for (let _i159 = 0; _i159 < _a158.length; _i159++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i159]] || -1) === 1))) continue;
                    _g156++;
                  }
                }
                _c160 = ((_g156 + exits(sp, cl, v_c)) > 0);
              }
              if (((_c160 && !(_eg91.of(v_c) === v_G)) && !(_eg91.of(v_c) === v_H))) {
                _q152 = true;
                break Q153;
              }
            }
          }
          _c161 = _q152;
        }
        freshBinding("strand", [sameSet(_fg117.of(sp.edgeEnds[2 * v_e]), _eg91.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg117.of(sp.edgeEnds[2 * v_e + 1]), _eg91.of(sp.edgeEnds[2 * v_e + 1])), (sp.edges.includes(v_e)), _c145, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), sameSet(v_H, through(sp, sp.edgeEnds[2 * v_e + 1], v_R)), _c161], ["R's groups", "e in", "where of e", "G =", "H =", "where of H"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { e: v_e, G: v_G.slice(), H: v_H.slice() }, marks: {  } };
          if (!fire({ R: v_R.slice(), e: v_e, G: v_G.slice(), H: v_H.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface FinishEarlyBinding {
  R: readonly number[];
  e: number;
  G: readonly number[];
  H: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface FinishEarlySays {
  terms: { e: number; G: readonly number[]; H: readonly number[]; };
  marks: {  };
}

const finishEarlyFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function finishEarly(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FinishEarlyBinding, FinishEarlySays> | null): number {
  const _g53: number[] = [];
  const facts = finishEarlyFacts;
  let fired = 0;
  let changed = false;
  const _k66 = exitsKept.board(cl);
  const _m160_0 = b.made[0];
  _g53.length = 0;
  G54: {
    const _a57 = sp.edges;
    for (let _i58 = 0; _i58 < _a57.length; _i58++) {
      const v_e = _a57[_i58];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g53.push(v_e);
    }
  }
  const v_R = _g53;
  const _m161_1 = b.made[1];
  const _m162_2 = b.made[2];
  const _eg90 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a59 = sp.edges;
  R1:
  for (let _i60 = 0; _i60 < _a59.length; _i60++) {
    const v_e = _a59[_i60];
    let _c68: boolean = !((b.grid[v_e] !== 0));
    if (_c68) {
      const _t61 = sp.edgeEnds[2 * v_e];
      let _c67: boolean = !(((b.edgeCand(_t61) >> 2) & 1) !== 0);
      if (!_c67) {
        let _g62 = 0;
        G63: {
          const _a64 = sp.adj4[_t61];
          for (let _i65 = 0; _i65 < _a64.length; _i65++) {
            if (!(((b.grid[sp.adj4Edges[_t61][_i65]] || -1) === 1))) continue;
            _g62++;
          }
        }
        _c67 = ((_g62 + (_k66[_t61] ?? exits(sp, cl, _t61))) > 0);
      }
      _c68 = _c67;
    }
    let _c75: boolean = _c68;
    if (_c75) {
      const _t69 = sp.edgeEnds[2 * v_e + 1];
      let _c74: boolean = !(((b.edgeCand(_t69) >> 2) & 1) !== 0);
      if (!_c74) {
        let _g70 = 0;
        G71: {
          const _a72 = sp.adj4[_t69];
          for (let _i73 = 0; _i73 < _a72.length; _i73++) {
            if (!(((b.grid[sp.adj4Edges[_t69][_i73]] || -1) === 1))) continue;
            _g70++;
          }
        }
        _c74 = ((_g70 + (_k66[_t69] ?? exits(sp, cl, _t69))) > 0);
      }
      _c75 = _c74;
    }
    let _c89: boolean = _c75;
    if (_c89) {
      const _t76 = sp.edgeEnds[2 * v_e];
      const _t77 = sp.edgeEnds[2 * v_e + 1];
      let _c88: boolean = ((((b.grid[sp.edgeOf(_t76, _t77)] || -1) === 2) || !(((b.edgeCand(_t76) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t77) >> 1) & 1) !== 0));
      if (!_c88) {
        let _c87: boolean = ((b.grid[sp.edgeOf(_t76, _t77)] || -1) !== 1);
        if (_c87) {
          let _g78 = 0;
          G79: {
            const _a80 = sp.adj4[_t76];
            for (let _i81 = 0; _i81 < _a80.length; _i81++) {
              if (!(((b.grid[sp.adj4Edges[_t76][_i81]] || -1) === 1))) continue;
              _g78++;
            }
          }
          let _c86: boolean = ((_g78 + (_k66[_t76] ?? exits(sp, cl, _t76))) === 2);
          if (!_c86) {
            let _g82 = 0;
            G83: {
              const _a84 = sp.adj4[_t77];
              for (let _i85 = 0; _i85 < _a84.length; _i85++) {
                if (!(((b.grid[sp.adj4Edges[_t77][_i85]] || -1) === 1))) continue;
                _g82++;
              }
            }
            _c86 = ((_g82 + (_k66[_t77] ?? exits(sp, cl, _t77))) === 2);
          }
          _c87 = _c86;
        }
        _c88 = _c87;
      }
      _c89 = !(_c88);
    }
    if (!(_c89)) continue;
    const v_G = _eg90.of(sp.edgeEnds[2 * v_e]);
    L91: {
      const v_H = _eg90.of(sp.edgeEnds[2 * v_e + 1]);
      let _c94: boolean = !(_eg90.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c94) {
        let _q92 = false;
        Q93: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg90.of(cl.end.at[v_q]) === v_G)) {
              _q92 = true;
              break Q93;
            }
          }
        }
        _c94 = _q92;
      }
      let _c97: boolean = _c94;
      if (_c97) {
        let _q95 = false;
        Q96: {
          for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
            if ((_eg90.of(cl.end.at[v_q]) === v_H)) {
              _q95 = true;
              break Q96;
            }
          }
        }
        _c97 = _q95;
      }
      let _c107: boolean = _c97;
      if (_c107) {
        let _q98 = false;
        Q99: {
          const _a100 = sp.lines;
          for (let _i101 = 0; _i101 < _a100.length; _i101++) {
            const v_L = _a100[_i101];
            const _h106 = clueAt(cl.count, v_L);
            let _g102 = 0;
            G103: {
              const _a104 = sp.lineCells[v_L];
              for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                const v_c = _a104[_i105];
                if (!(((_eg90.of(v_c) === v_G) || (_eg90.of(v_c) === v_H)))) continue;
                _g102++;
              }
            }
            if ((_g102 < _h106)) {
              _q98 = true;
              break Q99;
            }
          }
        }
        _c107 = _q98;
      }
      if (!(_c107)) break L91;
      if (b.made[0] !== _m160_0 || b.made[1] !== _m161_1 || b.made[2] !== _m162_2) {
        const _now108 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now108 === _eg90.of(sp.edgeEnds[2 * v_e]) || sameSet(_now108, _eg90.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
        const _now109 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e + 1]);
        if (!(_now109 === _eg90.of(sp.edgeEnds[2 * v_e + 1]) || sameSet(_now109, _eg90.of(sp.edgeEnds[2 * v_e + 1])))) { continue R1; }
      }
      if (DEV && staleChecking) {
        const _g110: number[] = [];
        G111: {
          const _a114 = sp.edges;
          for (let _i115 = 0; _i115 < _a114.length; _i115++) {
            const v_e = _a114[_i115];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g110.push(v_e);
          }
        }
        const _fg116 = edgeGroups(sp, _g110);
        let _c123: boolean = !((b.grid[v_e] !== 0));
        if (_c123) {
          const _t117 = sp.edgeEnds[2 * v_e];
          let _c122: boolean = !(((b.edgeCand(_t117) >> 2) & 1) !== 0);
          if (!_c122) {
            let _g118 = 0;
            G119: {
              const _a120 = sp.adj4[_t117];
              for (let _i121 = 0; _i121 < _a120.length; _i121++) {
                if (!(((b.grid[sp.adj4Edges[_t117][_i121]] || -1) === 1))) continue;
                _g118++;
              }
            }
            _c122 = ((_g118 + exits(sp, cl, _t117)) > 0);
          }
          _c123 = _c122;
        }
        let _c130: boolean = _c123;
        if (_c130) {
          const _t124 = sp.edgeEnds[2 * v_e + 1];
          let _c129: boolean = !(((b.edgeCand(_t124) >> 2) & 1) !== 0);
          if (!_c129) {
            let _g125 = 0;
            G126: {
              const _a127 = sp.adj4[_t124];
              for (let _i128 = 0; _i128 < _a127.length; _i128++) {
                if (!(((b.grid[sp.adj4Edges[_t124][_i128]] || -1) === 1))) continue;
                _g125++;
              }
            }
            _c129 = ((_g125 + exits(sp, cl, _t124)) > 0);
          }
          _c130 = _c129;
        }
        let _c144: boolean = _c130;
        if (_c144) {
          const _t131 = sp.edgeEnds[2 * v_e];
          const _t132 = sp.edgeEnds[2 * v_e + 1];
          let _c143: boolean = ((((b.grid[sp.edgeOf(_t131, _t132)] || -1) === 2) || !(((b.edgeCand(_t131) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t132) >> 1) & 1) !== 0));
          if (!_c143) {
            let _c142: boolean = ((b.grid[sp.edgeOf(_t131, _t132)] || -1) !== 1);
            if (_c142) {
              let _g133 = 0;
              G134: {
                const _a135 = sp.adj4[_t131];
                for (let _i136 = 0; _i136 < _a135.length; _i136++) {
                  if (!(((b.grid[sp.adj4Edges[_t131][_i136]] || -1) === 1))) continue;
                  _g133++;
                }
              }
              let _c141: boolean = ((_g133 + exits(sp, cl, _t131)) === 2);
              if (!_c141) {
                let _g137 = 0;
                G138: {
                  const _a139 = sp.adj4[_t132];
                  for (let _i140 = 0; _i140 < _a139.length; _i140++) {
                    if (!(((b.grid[sp.adj4Edges[_t132][_i140]] || -1) === 1))) continue;
                    _g137++;
                  }
                }
                _c141 = ((_g137 + exits(sp, cl, _t132)) === 2);
              }
              _c142 = _c141;
            }
            _c143 = _c142;
          }
          _c144 = !(_c143);
        }
        let _c147: boolean = !(_eg90.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c147) {
          let _q145 = false;
          Q146: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg90.of(cl.end.at[v_q]) === v_G)) {
                _q145 = true;
                break Q146;
              }
            }
          }
          _c147 = _q145;
        }
        let _c150: boolean = _c147;
        if (_c150) {
          let _q148 = false;
          Q149: {
            for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
              if ((_eg90.of(cl.end.at[v_q]) === v_H)) {
                _q148 = true;
                break Q149;
              }
            }
          }
          _c150 = _q148;
        }
        let _c159: boolean = _c150;
        if (_c159) {
          let _q151 = false;
          Q152: {
            const _a153 = sp.lines;
            for (let _i154 = 0; _i154 < _a153.length; _i154++) {
              const v_L = _a153[_i154];
              let _g155 = 0;
              G156: {
                const _a157 = sp.lineCells[v_L];
                for (let _i158 = 0; _i158 < _a157.length; _i158++) {
                  const v_c = _a157[_i158];
                  if (!(((_eg90.of(v_c) === v_G) || (_eg90.of(v_c) === v_H)))) continue;
                  _g155++;
                }
              }
              if ((_g155 < clueAt(cl.count, v_L))) {
                _q151 = true;
                break Q152;
              }
            }
          }
          _c159 = _q151;
        }
        freshBinding("finishEarly", [sameSet(_fg116.of(sp.edgeEnds[2 * v_e]), _eg90.of(sp.edgeEnds[2 * v_e])) && sameSet(_fg116.of(sp.edgeEnds[2 * v_e + 1]), _eg90.of(sp.edgeEnds[2 * v_e + 1])), (sp.edges.includes(v_e)), _c144, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_R)), sameSet(v_H, through(sp, sp.edgeEnds[2 * v_e + 1], v_R)), _c159], ["R's groups", "e in", "where of e", "G =", "H =", "where of H"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) {
          const _says = { terms: { e: v_e, G: v_G.slice(), H: v_H.slice() }, marks: {  } };
          if (!fire({ R: v_R.slice(), e: v_e, G: v_G.slice(), H: v_H.slice() }, facts, _says)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface LooseEndBinding {
  L: number;
  F: readonly number[];
  P: readonly number[];
  p: number;
  Q: readonly number[];
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface LooseEndSays {
  terms: { L: number; };
  marks: {  };
}

const looseEndFacts: number[] = [];
let looseEndCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function looseEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LooseEndBinding, LooseEndSays> | null): number {
  const _g62: number[] = [];
  const _g89: number[] = [];
  const _g119: number[] = [];
  const facts = looseEndFacts;
  let fired = 0;
  let changed = false;
  const _k76 = exitsKept.board(cl);
  if (looseEndCands.length < sp.edges.length) looseEndCands = new Int32Array(sp.edges.length);
  const cands = looseEndCands;
  cands.fill(-1);
  crossableMarkedKept.clear();
  const _a60 = sp.lines;
  for (let _i61 = 0; _i61 < _a60.length; _i61++) {
    const v_L = _a60[_i61];
    const _h78 = clueAt(cl.count, v_L);
    const _h110 = (sp.rows.includes(v_L));
    _g62.length = 0;
    G63: {
      const _a70 = sp.lineCells[v_L];
      for (let _i71 = 0; _i71 < _a70.length; _i71++) {
        const v_c = _a70[_i71];
        let _g72 = 0;
        G73: {
          const _a74 = sp.adj4[v_c];
          for (let _i75 = 0; _i75 < _a74.length; _i75++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i75]] || -1) === 1))) continue;
            _g72++;
          }
        }
        if (!(((_g72 + (_k76[v_c] ?? exits(sp, cl, v_c))) === 2))) continue;
        _g62.push(v_c);
      }
    }
    L77: {
      const v_F = _g62;
      const _h79 = v_F.length;
      let _c88: boolean = ((_h78 - _h79) === 2);
      if (_c88) {
        let _q80 = true;
        Q81: {
          const _a82 = sp.lineCells[v_L];
          for (let _i83 = 0; _i83 < _a82.length; _i83++) {
            const v_c = _a82[_i83];
            let _g84 = 0;
            G85: {
              const _a86 = sp.adj4[v_c];
              for (let _i87 = 0; _i87 < _a86.length; _i87++) {
                if (!(((b.grid[sp.adj4Edges[v_c][_i87]] || -1) === 1))) continue;
                _g84++;
              }
            }
            if (!(((_g84 + (_k76[v_c] ?? exits(sp, cl, v_c))) !== 2))) continue;
            if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
              _q80 = false;
              break Q81;
            }
          }
        }
        _c88 = _q80;
      }
      if (!(_c88)) break L77;
      _g89.length = 0;
      G90: {
        const _a103 = sp.lineCells[v_L];
        for (let _i104 = 0; _i104 < _a103.length; _i104++) {
          const v_c = _a103[_i104];
          const _h109 = clueAt(cl.end, v_c);
          let _g105 = 0;
          G106: {
            const _a107 = sp.adj4[v_c];
            for (let _i108 = 0; _i108 < _a107.length; _i108++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i108]] || -1) === 1))) continue;
              _g105++;
            }
          }
          let _c116: boolean = ((_g105 + (_k76[v_c] ?? exits(sp, cl, v_c))) === 1);
          if (_c116) {
            let _c115: boolean = ((_h109 >= 1) && ((_h109 >= 3) === _h110));
            if (!_c115) {
              let _q111 = false;
              Q112: {
                const _a113 = sp.adj4[v_c];
                for (let _i114 = 0; _i114 < _a113.length; _i114++) {
                  const v_y = _a113[_i114];
                  if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                  if (((b.grid[sp.adj4Edges[v_c][_i114]] || -1) === 1)) {
                    _q111 = true;
                    break Q112;
                  }
                }
              }
              _c115 = _q111;
            }
            _c116 = _c115;
          }
          if (!(_c116)) continue;
          _g89.push(v_c);
        }
      }
      L117: {
        const v_P = _g89;
        const _h118 = v_P.length;
        if (!((_h118 === 1))) break L117;
        const v_p = (v_P[0] ?? -1);
        _g119.length = 0;
        G120: {
          const _a123 = sp.adj4[v_p];
          for (let _i124 = 0; _i124 < _a123.length; _i124++) {
            const v_y = _a123[_i124];
            if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i124]] || -1) !== 1)))) continue;
            _g119.push(v_y);
          }
        }
        const v_Q = _g119;
        const _h180 = v_Q.length;
        if (DEV && staleChecking) {
          const _g125: number[] = [];
          G126: {
            const _a133 = sp.lineCells[v_L];
            for (let _i134 = 0; _i134 < _a133.length; _i134++) {
              const v_c = _a133[_i134];
              let _g135 = 0;
              G136: {
                const _a137 = sp.adj4[v_c];
                for (let _i138 = 0; _i138 < _a137.length; _i138++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i138]] || -1) === 1))) continue;
                  _g135++;
                }
              }
              if (!(((_g135 + exits(sp, cl, v_c)) === 2))) continue;
              _g125.push(v_c);
            }
          }
          let _c147: boolean = ((clueAt(cl.count, v_L) - v_F.length) === 2);
          if (_c147) {
            let _q139 = true;
            Q140: {
              const _a141 = sp.lineCells[v_L];
              for (let _i142 = 0; _i142 < _a141.length; _i142++) {
                const v_c = _a141[_i142];
                let _g143 = 0;
                G144: {
                  const _a145 = sp.adj4[v_c];
                  for (let _i146 = 0; _i146 < _a145.length; _i146++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i146]] || -1) === 1))) continue;
                    _g143++;
                  }
                }
                if (!(((_g143 + exits(sp, cl, v_c)) !== 2))) continue;
                if (!(!(crossableMarked(b, sp, cl, cands, v_c, v_L)))) {
                  _q139 = false;
                  break Q140;
                }
              }
            }
            _c147 = _q139;
          }
          const _g148: number[] = [];
          G149: {
            const _a162 = sp.lineCells[v_L];
            for (let _i163 = 0; _i163 < _a162.length; _i163++) {
              const v_c = _a162[_i163];
              let _g164 = 0;
              G165: {
                const _a166 = sp.adj4[v_c];
                for (let _i167 = 0; _i167 < _a166.length; _i167++) {
                  if (!(((b.grid[sp.adj4Edges[v_c][_i167]] || -1) === 1))) continue;
                  _g164++;
                }
              }
              let _c173: boolean = ((_g164 + exits(sp, cl, v_c)) === 1);
              if (_c173) {
                let _c172: boolean = ((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L))));
                if (!_c172) {
                  let _q168 = false;
                  Q169: {
                    const _a170 = sp.adj4[v_c];
                    for (let _i171 = 0; _i171 < _a170.length; _i171++) {
                      const v_y = _a170[_i171];
                      if (!((sp.lineCells[v_L].includes(v_y)))) continue;
                      if (((b.grid[sp.adj4Edges[v_c][_i171]] || -1) === 1)) {
                        _q168 = true;
                        break Q169;
                      }
                    }
                  }
                  _c172 = _q168;
                }
                _c173 = _c172;
              }
              if (!(_c173)) continue;
              _g148.push(v_c);
            }
          }
          const _g174: number[] = [];
          G175: {
            const _a178 = sp.adj4[v_p];
            for (let _i179 = 0; _i179 < _a178.length; _i179++) {
              const v_y = _a178[_i179];
              if (!(((sp.lineCells[v_L].includes(v_y)) && ((b.grid[sp.adj4Edges[v_p][_i179]] || -1) !== 1)))) continue;
              _g174.push(v_y);
            }
          }
          freshBinding("looseEnd", [(sp.lines.includes(v_L)), sameSet(v_F, _g125), _c147, sameSet(v_P, _g148), (v_P.length === 1), (v_p === (v_P[0] ?? -1)), sameSet(v_Q, _g174)], ["L in", "F =", "where of F", "P =", "where of P", "p =", "Q ="]);
        }
        facts.length = 0;
        changed = false;
        let _c186: boolean = (_h180 === 1);
        if (_c186) {
          let _q181 = true;
          Q182: {
            const _a183 = v_Q;
            for (let _i184 = 0; _i184 < _a183.length; _i184++) {
              const v_y = _a183[_i184];
              const _t185 = sp.edgeOf(v_p, v_y);
              if (!(b.grid[_t185] !== 0)) { if (fire === null) { b.placeAt(_t185, 1); changed = true; } else facts.push(PLACE, _t185, 1); }
              if (!(true)) {
                _q181 = false;
                break Q182;
              }
            }
          }
          _c186 = _q181;
        }
        if (!(_c186)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { L: v_L }, marks: {  } };
            if (!fire({ L: v_L, F: v_F.slice(), P: v_P.slice(), p: v_p, Q: v_Q.slice() }, facts, _says)) return 1;
          }
          cands.fill(-1);
          crossableMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface SharedFateBinding {
  L: number;
  p: number;
  q: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SharedFateSays {
  terms: { L: number; p: number; q: number; };
  marks: {  };
}

const sharedFateFacts: number[] = [];
let sharedFateCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function sharedFate(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedFateBinding, SharedFateSays> | null): number {
  const _g60: number[] = [];
  const _g82: number[] = [];
  const _g115: number[] = [];
  const facts = sharedFateFacts;
  let fired = 0;
  let changed = false;
  const _k76 = exitsKept.board(cl);
  if (sharedFateCands.length < sp.edges.length) sharedFateCands = new Int32Array(sp.edges.length);
  const cands = sharedFateCands;
  cands.fill(-1);
  laidMarkedKept.clear();
  const _a57 = sp.lines;
  R1:
  for (let _i58 = 0; _i58 < _a57.length; _i58++) {
    const v_L = _a57[_i58];
    const _m181_0 = b.made[0];
    const _m182_1 = b.made[1];
    const _m183_2 = b.made[2];
    const _h59 = clueAt(cl.count, v_L);
    if (!(((_h59 - laidMarked(b, sp, cl, cands, v_L)) === 1))) continue;
    _g60.length = 0;
    G61: {
      const _a69 = sp.lineCells[v_L];
      for (let _i70 = 0; _i70 < _a69.length; _i70++) {
        const v_c = _a69[_i70];
        let _c77: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c77) {
          let _g71 = 0;
          G72: {
            const _a73 = sp.adj4[v_c];
            for (let _i74 = 0; _i74 < _a73.length; _i74++) {
              const _h75 = (b.grid[sp.adj4Edges[v_c][_i74]] || -1);
              if (!((_h75 === 1))) continue;
              _g71++;
            }
          }
          _c77 = ((_g71 + (_k76[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c77) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g60.push(v_c);
      }
    }
    const _a78 = _g60;
    R2:
    for (let _i79 = 0; _i79 < _a78.length; _i79++) {
      const v_p = _a78[_i79];
      const _a80 = sp.adj4[v_p];
      for (let _i81 = 0; _i81 < _a80.length; _i81++) {
        const v_q = _a80[_i81];
        _g82.length = 0;
        G83: {
          const _a91 = sp.lineCells[v_L];
          for (let _i92 = 0; _i92 < _a91.length; _i92++) {
            const v_c = _a91[_i92];
            let _c98: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c98) {
              let _g93 = 0;
              G94: {
                const _a95 = sp.adj4[v_c];
                for (let _i96 = 0; _i96 < _a95.length; _i96++) {
                  const _h97 = (b.grid[sp.adj4Edges[v_c][_i96]] || -1);
                  if (!((_h97 === 1))) continue;
                  _g93++;
                }
              }
              _c98 = ((_g93 + (_k76[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c98) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g82.push(v_c);
          }
        }
        let _c114: boolean = (_g82.includes(v_q));
        if (_c114) {
          let _g99 = 0;
          G100: {
            const _a101 = sp.adj4[v_p];
            for (let _i102 = 0; _i102 < _a101.length; _i102++) {
              const v_y = _a101[_i102];
              const _h103 = (b.grid[sp.adj4Edges[v_p][_i102]] || -1);
              let _c113: boolean = (v_y !== v_q);
              if (_c113) {
                let _c112: boolean = (((_h103 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c112) {
                  let _c111: boolean = (_h103 !== 1);
                  if (_c111) {
                    let _c110: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c110) {
                      let _g104 = 0;
                      G105: {
                        const _a107 = sp.adj4[v_y];
                        for (let _i108 = 0; _i108 < _a107.length; _i108++) {
                          const _h109 = (b.grid[sp.adj4Edges[v_y][_i108]] || -1);
                          if (!((_h109 === 1))) continue;
                          _g104++;
                        }
                      }
                      _c110 = ((_g104 + (_k76[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c111 = _c110;
                  }
                  _c112 = _c111;
                }
                _c113 = !(_c112);
              }
              if (!(_c113)) continue;
              _g99++;
            }
          }
          _c114 = (_g99 < 2);
        }
        if (!(_c114)) continue;
        if (b.made[0] !== _m181_0 || b.made[1] !== _m182_1 || b.made[2] !== _m183_2) {
          if (!(((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1))) { continue R1; }
          _g115.length = 0;
          G116: {
            const _a124 = sp.lineCells[v_L];
            for (let _i125 = 0; _i125 < _a124.length; _i125++) {
              const v_c = _a124[_i125];
              let _c130: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c130) {
                let _g126 = 0;
                G127: {
                  const _a128 = sp.adj4[v_c];
                  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i129]] || -1) === 1))) continue;
                    _g126++;
                  }
                }
                _c130 = ((_g126 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c130) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g115.push(v_c);
            }
          }
          if (!((_g115.includes(v_p)))) { continue R2; }
        }
        if (DEV && staleChecking) {
          const _g131: number[] = [];
          G132: {
            const _a140 = sp.lineCells[v_L];
            for (let _i141 = 0; _i141 < _a140.length; _i141++) {
              const v_c = _a140[_i141];
              let _c146: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c146) {
                let _g142 = 0;
                G143: {
                  const _a144 = sp.adj4[v_c];
                  for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i145]] || -1) === 1))) continue;
                    _g142++;
                  }
                }
                _c146 = ((_g142 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c146) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g131.push(v_c);
            }
          }
          const _g147: number[] = [];
          G148: {
            const _a156 = sp.lineCells[v_L];
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_c = _a156[_i157];
              let _c162: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c162) {
                let _g158 = 0;
                G159: {
                  const _a160 = sp.adj4[v_c];
                  for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i161]] || -1) === 1))) continue;
                    _g158++;
                  }
                }
                _c162 = ((_g158 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c162) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g147.push(v_c);
            }
          }
          let _c180: boolean = (_g147.includes(v_q));
          if (_c180) {
            let _g163 = 0;
            G164: {
              const _a165 = sp.adj4[v_p];
              for (let _i166 = 0; _i166 < _a165.length; _i166++) {
                const v_y = _a165[_i166];
                let _c179: boolean = (v_y !== v_q);
                if (_c179) {
                  let _c178: boolean = ((((b.grid[sp.adj4Edges[v_p][_i166]] || -1) === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                  if (!_c178) {
                    let _c177: boolean = ((b.grid[sp.adj4Edges[v_p][_i166]] || -1) !== 1);
                    if (_c177) {
                      let _g167 = 0;
                      G168: {
                        const _a169 = sp.adj4[v_p];
                        for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                          if (!(((b.grid[sp.adj4Edges[v_p][_i170]] || -1) === 1))) continue;
                          _g167++;
                        }
                      }
                      let _c176: boolean = ((_g167 + exits(sp, cl, v_p)) === 2);
                      if (!_c176) {
                        let _g171 = 0;
                        G172: {
                          const _a174 = sp.adj4[v_y];
                          for (let _i175 = 0; _i175 < _a174.length; _i175++) {
                            if (!(((b.grid[sp.adj4Edges[v_y][_i175]] || -1) === 1))) continue;
                            _g171++;
                          }
                        }
                        _c176 = ((_g171 + exits(sp, cl, v_y)) === 2);
                      }
                      _c177 = _c176;
                    }
                    _c178 = _c177;
                  }
                  _c179 = !(_c178);
                }
                if (!(_c179)) continue;
                _g163++;
              }
            }
            _c180 = (_g163 < 2);
          }
          freshBinding("sharedFate", [(sp.lines.includes(v_L)), ((clueAt(cl.count, v_L) - laidMarked(b, sp, cl, cands, v_L)) === 1), (_g131.includes(v_p)), (sp.adj4[v_p].includes(v_q)), _c180], ["L in", "where of L", "p in", "q in", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_p) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(v_p, 1); changed = true; } else facts.push(STRIKE_EDGE, v_p, 1); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { L: v_L, p: v_p, q: v_q }, marks: {  } };
            if (!fire({ L: v_L, p: v_p, q: v_q }, facts, _says)) return 1;
          }
          cands.fill(-1);
          laidMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

export interface SharedFateEmptiesBinding {
  L: number;
  p: number;
  q: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface SharedFateEmptiesSays {
  terms: { L: number; p: number; q: number; };
  marks: {  };
}

const sharedFateEmptiesFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function sharedFateEmpties(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedFateEmptiesBinding, SharedFateEmptiesSays> | null): number {
  const _g68: number[] = [];
  const _g90: number[] = [];
  const _g127: number[] = [];
  const facts = sharedFateEmptiesFacts;
  let fired = 0;
  let changed = false;
  const _k84 = exitsKept.board(cl);
  const _a61 = sp.lines;
  R1:
  for (let _i62 = 0; _i62 < _a61.length; _i62++) {
    const v_L = _a61[_i62];
    const _m198_2 = b.made[2];
    const _h63 = clueAt(cl.count, v_L);
    let _g64 = 0;
    G65: {
      const _a66 = sp.lineCells[v_L];
      for (let _i67 = 0; _i67 < _a66.length; _i67++) {
        const v_c = _a66[_i67];
        if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
        _g64++;
      }
    }
    if (!((((sp.lineCells[v_L].length - _h63) - _g64) === 1))) continue;
    const _m197_0 = b.made[0];
    _g68.length = 0;
    G69: {
      const _a77 = sp.lineCells[v_L];
      for (let _i78 = 0; _i78 < _a77.length; _i78++) {
        const v_c = _a77[_i78];
        let _c85: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
        if (!_c85) {
          let _g79 = 0;
          G80: {
            const _a81 = sp.adj4[v_c];
            for (let _i82 = 0; _i82 < _a81.length; _i82++) {
              const _h83 = (b.grid[sp.adj4Edges[v_c][_i82]] || -1);
              if (!((_h83 === 1))) continue;
              _g79++;
            }
          }
          _c85 = ((_g79 + (_k84[v_c] ?? exits(sp, cl, v_c))) > 0);
        }
        if (!((!(_c85) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
        _g68.push(v_c);
      }
    }
    const _a86 = _g68;
    R2:
    for (let _i87 = 0; _i87 < _a86.length; _i87++) {
      const v_p = _a86[_i87];
      const _a88 = sp.adj4[v_p];
      for (let _i89 = 0; _i89 < _a88.length; _i89++) {
        const v_q = _a88[_i89];
        _g90.length = 0;
        G91: {
          const _a99 = sp.lineCells[v_L];
          for (let _i100 = 0; _i100 < _a99.length; _i100++) {
            const v_c = _a99[_i100];
            let _c106: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
            if (!_c106) {
              let _g101 = 0;
              G102: {
                const _a103 = sp.adj4[v_c];
                for (let _i104 = 0; _i104 < _a103.length; _i104++) {
                  const _h105 = (b.grid[sp.adj4Edges[v_c][_i104]] || -1);
                  if (!((_h105 === 1))) continue;
                  _g101++;
                }
              }
              _c106 = ((_g101 + (_k84[v_c] ?? exits(sp, cl, v_c))) > 0);
            }
            if (!((!(_c106) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
            _g90.push(v_c);
          }
        }
        let _c122: boolean = (_g90.includes(v_q));
        if (_c122) {
          let _g107 = 0;
          G108: {
            const _a109 = sp.adj4[v_p];
            for (let _i110 = 0; _i110 < _a109.length; _i110++) {
              const v_y = _a109[_i110];
              const _h111 = (b.grid[sp.adj4Edges[v_p][_i110]] || -1);
              let _c121: boolean = (v_y !== v_q);
              if (_c121) {
                let _c120: boolean = (((_h111 === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                if (!_c120) {
                  let _c119: boolean = (_h111 !== 1);
                  if (_c119) {
                    let _c118: boolean = (drawn(b, sp, cl, v_p) === 2);
                    if (!_c118) {
                      let _g112 = 0;
                      G113: {
                        const _a115 = sp.adj4[v_y];
                        for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                          const _h117 = (b.grid[sp.adj4Edges[v_y][_i116]] || -1);
                          if (!((_h117 === 1))) continue;
                          _g112++;
                        }
                      }
                      _c118 = ((_g112 + (_k84[v_y] ?? exits(sp, cl, v_y))) === 2);
                    }
                    _c119 = _c118;
                  }
                  _c120 = _c119;
                }
                _c121 = !(_c120);
              }
              if (!(_c121)) continue;
              _g107++;
            }
          }
          _c122 = (_g107 < 2);
        }
        if (!(_c122)) continue;
        if (b.made[0] !== _m197_0 || b.made[2] !== _m198_2) {
          let _g123 = 0;
          G124: {
            const _a125 = sp.lineCells[v_L];
            for (let _i126 = 0; _i126 < _a125.length; _i126++) {
              const v_c = _a125[_i126];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g123++;
            }
          }
          if (!((((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g123) === 1))) { continue R1; }
          _g127.length = 0;
          G128: {
            const _a136 = sp.lineCells[v_L];
            for (let _i137 = 0; _i137 < _a136.length; _i137++) {
              const v_c = _a136[_i137];
              let _c142: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c142) {
                let _g138 = 0;
                G139: {
                  const _a140 = sp.adj4[v_c];
                  for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i141]] || -1) === 1))) continue;
                    _g138++;
                  }
                }
                _c142 = ((_g138 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c142) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g127.push(v_c);
            }
          }
          if (!((_g127.includes(v_p)))) { continue R2; }
        }
        if (DEV && staleChecking) {
          let _g143 = 0;
          G144: {
            const _a145 = sp.lineCells[v_L];
            for (let _i146 = 0; _i146 < _a145.length; _i146++) {
              const v_c = _a145[_i146];
              if (!(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))) continue;
              _g143++;
            }
          }
          const _g147: number[] = [];
          G148: {
            const _a156 = sp.lineCells[v_L];
            for (let _i157 = 0; _i157 < _a156.length; _i157++) {
              const v_c = _a156[_i157];
              let _c162: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c162) {
                let _g158 = 0;
                G159: {
                  const _a160 = sp.adj4[v_c];
                  for (let _i161 = 0; _i161 < _a160.length; _i161++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i161]] || -1) === 1))) continue;
                    _g158++;
                  }
                }
                _c162 = ((_g158 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c162) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g147.push(v_c);
            }
          }
          const _g163: number[] = [];
          G164: {
            const _a172 = sp.lineCells[v_L];
            for (let _i173 = 0; _i173 < _a172.length; _i173++) {
              const v_c = _a172[_i173];
              let _c178: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
              if (!_c178) {
                let _g174 = 0;
                G175: {
                  const _a176 = sp.adj4[v_c];
                  for (let _i177 = 0; _i177 < _a176.length; _i177++) {
                    if (!(((b.grid[sp.adj4Edges[v_c][_i177]] || -1) === 1))) continue;
                    _g174++;
                  }
                }
                _c178 = ((_g174 + exits(sp, cl, v_c)) > 0);
              }
              if (!((!(_c178) && !(!(((b.edgeCand(v_c) >> 1) & 1) !== 0))))) continue;
              _g163.push(v_c);
            }
          }
          let _c196: boolean = (_g163.includes(v_q));
          if (_c196) {
            let _g179 = 0;
            G180: {
              const _a181 = sp.adj4[v_p];
              for (let _i182 = 0; _i182 < _a181.length; _i182++) {
                const v_y = _a181[_i182];
                let _c195: boolean = (v_y !== v_q);
                if (_c195) {
                  let _c194: boolean = ((((b.grid[sp.adj4Edges[v_p][_i182]] || -1) === 2) || !(((b.edgeCand(v_p) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
                  if (!_c194) {
                    let _c193: boolean = ((b.grid[sp.adj4Edges[v_p][_i182]] || -1) !== 1);
                    if (_c193) {
                      let _g183 = 0;
                      G184: {
                        const _a185 = sp.adj4[v_p];
                        for (let _i186 = 0; _i186 < _a185.length; _i186++) {
                          if (!(((b.grid[sp.adj4Edges[v_p][_i186]] || -1) === 1))) continue;
                          _g183++;
                        }
                      }
                      let _c192: boolean = ((_g183 + exits(sp, cl, v_p)) === 2);
                      if (!_c192) {
                        let _g187 = 0;
                        G188: {
                          const _a190 = sp.adj4[v_y];
                          for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                            if (!(((b.grid[sp.adj4Edges[v_y][_i191]] || -1) === 1))) continue;
                            _g187++;
                          }
                        }
                        _c192 = ((_g187 + exits(sp, cl, v_y)) === 2);
                      }
                      _c193 = _c192;
                    }
                    _c194 = _c193;
                  }
                  _c195 = !(_c194);
                }
                if (!(_c195)) continue;
                _g179++;
              }
            }
            _c196 = (_g179 < 2);
          }
          freshBinding("sharedFateEmpties", [(sp.lines.includes(v_L)), (((sp.lineCells[v_L].length - clueAt(cl.count, v_L)) - _g143) === 1), (_g147.includes(v_p)), (sp.adj4[v_p].includes(v_q)), _c196], ["L in", "where of L", "p in", "q in", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        if ((b.edgeCand(v_q) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(v_q, 2); changed = true; } else facts.push(STRIKE_EDGE, v_q, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null) {
            const _says = { terms: { L: v_L, p: v_p, q: v_q }, marks: {  } };
            if (!fire({ L: v_L, p: v_p, q: v_q }, facts, _says)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ParityBinding {
  O: readonly number[];
  e: number;
  G: readonly number[];
  k: number;
}

/** What a step for a firing of it speaks of: its terms, and the elements it marks by role. */
export interface ParitySays {
  terms: { e: number; G: readonly number[]; };
  marks: {  };
}

const parityFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function parity(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ParityBinding, ParitySays> | null): number {
  const _g45: number[] = [];
  const _g90: number[] = [];
  const facts = parityFacts;
  let fired = 0;
  let changed = false;
  const _k71 = exitsKept.board(cl);
  const _m169_0 = b.made[0];
  const _m170_2 = b.made[2];
  _g45.length = 0;
  G46: {
    const _a63 = sp.edges;
    for (let _i64 = 0; _i64 < _a63.length; _i64++) {
      const v_x = _a63[_i64];
      let _c79: boolean = !((b.grid[v_x] !== 0));
      if (_c79) {
        const _t65 = sp.edgeEnds[2 * v_x];
        const _t66 = sp.edgeEnds[2 * v_x + 1];
        let _c78: boolean = ((((b.grid[sp.edgeOf(_t65, _t66)] || -1) === 2) || !(((b.edgeCand(_t65) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t66) >> 1) & 1) !== 0));
        if (!_c78) {
          let _c77: boolean = ((b.grid[sp.edgeOf(_t65, _t66)] || -1) !== 1);
          if (_c77) {
            let _g67 = 0;
            G68: {
              const _a69 = sp.adj4[_t65];
              for (let _i70 = 0; _i70 < _a69.length; _i70++) {
                if (!(((b.grid[sp.adj4Edges[_t65][_i70]] || -1) === 1))) continue;
                _g67++;
              }
            }
            let _c76: boolean = ((_g67 + (_k71[_t65] ?? exits(sp, cl, _t65))) === 2);
            if (!_c76) {
              let _g72 = 0;
              G73: {
                const _a74 = sp.adj4[_t66];
                for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                  if (!(((b.grid[sp.adj4Edges[_t66][_i75]] || -1) === 1))) continue;
                  _g72++;
                }
              }
              _c76 = ((_g72 + (_k71[_t66] ?? exits(sp, cl, _t66))) === 2);
            }
            _c77 = _c76;
          }
          _c78 = _c77;
        }
        _c79 = !(_c78);
      }
      if (!(_c79)) continue;
      _g45.push(v_x);
    }
  }
  const v_O = _g45;
  const _a80 = cutEdges(sp, v_O);
  for (let _i81 = 0; _i81 < _a80.length; _i81++) {
    const v_e = _a80[_i81];
    const v_G = through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)));
    let _g82 = 0;
    G83: {
      const _a84 = v_G;
      for (let _i85 = 0; _i85 < _a84.length; _i85++) {
        const v_c = _a84[_i85];
        let _g86 = 0;
        G87: {
          const _a88 = sp.adj4[v_c];
          for (let _i89 = 0; _i89 < _a88.length; _i89++) {
            const v_y = _a88[_i89];
            if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i89]] || -1) === 1)))) continue;
            _g86++;
          }
        }
        _g82 += (_g86 + (_k71[v_c] ?? exits(sp, cl, v_c)));
      }
    }
    const v_k = _g82;
    if (b.made[0] !== _m169_0 || b.made[2] !== _m170_2) {
      _g90.length = 0;
      G91: {
        const _a108 = sp.edges;
        for (let _i109 = 0; _i109 < _a108.length; _i109++) {
          const v_x = _a108[_i109];
          let _c123: boolean = !((b.grid[v_x] !== 0));
          if (_c123) {
            const _t110 = sp.edgeEnds[2 * v_x];
            const _t111 = sp.edgeEnds[2 * v_x + 1];
            let _c122: boolean = ((((b.grid[sp.edgeOf(_t110, _t111)] || -1) === 2) || !(((b.edgeCand(_t110) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t111) >> 1) & 1) !== 0));
            if (!_c122) {
              let _c121: boolean = ((b.grid[sp.edgeOf(_t110, _t111)] || -1) !== 1);
              if (_c121) {
                let _g112 = 0;
                G113: {
                  const _a114 = sp.adj4[_t110];
                  for (let _i115 = 0; _i115 < _a114.length; _i115++) {
                    if (!(((b.grid[sp.adj4Edges[_t110][_i115]] || -1) === 1))) continue;
                    _g112++;
                  }
                }
                let _c120: boolean = ((_g112 + exits(sp, cl, _t110)) === 2);
                if (!_c120) {
                  let _g116 = 0;
                  G117: {
                    const _a118 = sp.adj4[_t111];
                    for (let _i119 = 0; _i119 < _a118.length; _i119++) {
                      if (!(((b.grid[sp.adj4Edges[_t111][_i119]] || -1) === 1))) continue;
                      _g116++;
                    }
                  }
                  _c120 = ((_g116 + exits(sp, cl, _t111)) === 2);
                }
                _c121 = _c120;
              }
              _c122 = _c121;
            }
            _c123 = !(_c122);
          }
          if (!(_c123)) continue;
          _g90.push(v_x);
        }
      }
      if (!(sameSet(v_O, _g90))) { return fired; }
    }
    if (DEV && staleChecking) {
      const _g124: number[] = [];
      G125: {
        const _a142 = sp.edges;
        for (let _i143 = 0; _i143 < _a142.length; _i143++) {
          const v_x = _a142[_i143];
          let _c157: boolean = !((b.grid[v_x] !== 0));
          if (_c157) {
            const _t144 = sp.edgeEnds[2 * v_x];
            const _t145 = sp.edgeEnds[2 * v_x + 1];
            let _c156: boolean = ((((b.grid[sp.edgeOf(_t144, _t145)] || -1) === 2) || !(((b.edgeCand(_t144) >> 1) & 1) !== 0)) || !(((b.edgeCand(_t145) >> 1) & 1) !== 0));
            if (!_c156) {
              let _c155: boolean = ((b.grid[sp.edgeOf(_t144, _t145)] || -1) !== 1);
              if (_c155) {
                let _g146 = 0;
                G147: {
                  const _a148 = sp.adj4[_t144];
                  for (let _i149 = 0; _i149 < _a148.length; _i149++) {
                    if (!(((b.grid[sp.adj4Edges[_t144][_i149]] || -1) === 1))) continue;
                    _g146++;
                  }
                }
                let _c154: boolean = ((_g146 + exits(sp, cl, _t144)) === 2);
                if (!_c154) {
                  let _g150 = 0;
                  G151: {
                    const _a152 = sp.adj4[_t145];
                    for (let _i153 = 0; _i153 < _a152.length; _i153++) {
                      if (!(((b.grid[sp.adj4Edges[_t145][_i153]] || -1) === 1))) continue;
                      _g150++;
                    }
                  }
                  _c154 = ((_g150 + exits(sp, cl, _t145)) === 2);
                }
                _c155 = _c154;
              }
              _c156 = _c155;
            }
            _c157 = !(_c156);
          }
          if (!(_c157)) continue;
          _g124.push(v_x);
        }
      }
      let _g158 = 0;
      G159: {
        const _a160 = v_G;
        for (let _i161 = 0; _i161 < _a160.length; _i161++) {
          const v_c = _a160[_i161];
          let _g162 = 0;
          G163: {
            const _a164 = sp.adj4[v_c];
            for (let _i165 = 0; _i165 < _a164.length; _i165++) {
              const v_y = _a164[_i165];
              if (!((!(v_G.includes(v_y)) && ((b.grid[sp.adj4Edges[v_c][_i165]] || -1) === 1)))) continue;
              _g162++;
            }
          }
          _g158 += (_g162 + exits(sp, cl, v_c));
        }
      }
      freshBinding("parity", [sameSet(v_O, _g124), (cutEdges(sp, v_O).includes(v_e)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], minus(v_O, setOf(v_e)))), (v_k === _g158)], ["O =", "e in", "G =", "k ="]);
    }
    facts.length = 0;
    changed = false;
    let _c166: boolean = !(((v_k % 2) === 1));
    if (!_c166) {
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
      _c166 = true;
    }
    let _c168: boolean = _c166;
    if (_c168) {
      let _c167: boolean = !(((v_k % 2) === 0));
      if (!_c167) {
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        _c167 = true;
      }
      _c168 = _c167;
    }
    if (!(_c168)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) {
        const _says = { terms: { e: v_e, G: v_G.slice() }, marks: {  } };
        if (!fire({ O: v_O.slice(), e: v_e, G: v_G.slice(), k: v_k }, facts, _says)) return 1;
      }
    }
  }
  return fired;
}

const exitsKept = keptStore<number>();
let exitsOn: object | null = null;
let exitsAt: Kept<number> = [];

/** `exits(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function exits(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== exitsOn) {
    exitsAt = exitsKept.board(cl);
    exitsOn = cl;
  }
  const _kept: Kept<number> = exitsAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    for (let v_q = 0; v_q < cl.end.at.length; v_q++) {
      if (!((cl.end.at[v_q] === v_c))) continue;
      _g1++;
    }
  }
  const _made = _g1;
  _kept[v_c] = _made;
  return _made;
}

const drawnKept = keptStore<number>();

/** `drawn(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function drawn(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = drawnKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g1 = 0;
  G2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      if (!(((b.grid[sp.adj4Edges[v_c][_i4]] || -1) === 1))) continue;
      _g1++;
    }
  }
  const _made = (_g1 + exits(sp, cl, v_c));
  _kept[v_c] = _made;
  return _made;
}

const laidMarkedKept = new Map<number, number>();

/** `laid(L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function laidMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number): number {
  const _was = laidMarkedKept.get(v_L);
  if (_was !== undefined) return _was;
  let _g1 = 0;
  G2: {
    const _a3 = sp.lineCells[v_L];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_c = _a3[_i4];
      let _c9: boolean = !(((b.edgeCand(v_c) >> 2) & 1) !== 0);
      if (!_c9) {
        let _g5 = 0;
        G6: {
          const _a7 = sp.adj4[v_c];
          for (let _i8 = 0; _i8 < _a7.length; _i8++) {
            if (!(((b.grid[sp.adj4Edges[v_c][_i8]] || -1) === 1))) continue;
            _g5++;
          }
        }
        _c9 = ((_g5 + exits(sp, cl, v_c)) > 0);
      }
      if (!(_c9)) continue;
      _g1++;
    }
  }
  const _made = _g1;
  laidMarkedKept.set(v_L, _made);
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}

const crossableMarkedKept = new Map<number, boolean>();

/** `crossable(c, L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function crossableMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_c: number, v_L: number): boolean {
  const _was = crossableMarkedKept.get((v_c + 1) * 1048577 + (v_L + 1));
  if (_was !== undefined) return _was;
  let _q1 = true;
  Q2: {
    const _a3 = sp.adj4[v_c];
    for (let _i4 = 0; _i4 < _a3.length; _i4++) {
      const v_y = _a3[_i4];
      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
      let _c16: boolean = ((((b.grid[sp.adj4Edges[v_c][_i4]] || -1) === 2) || !(((b.edgeCand(v_c) >> 1) & 1) !== 0)) || !(((b.edgeCand(v_y) >> 1) & 1) !== 0));
      if (!_c16) {
        let _c15: boolean = ((b.grid[sp.adj4Edges[v_c][_i4]] || -1) !== 1);
        if (_c15) {
          let _g5 = 0;
          G6: {
            const _a7 = sp.adj4[v_c];
            for (let _i8 = 0; _i8 < _a7.length; _i8++) {
              if (!(((b.grid[sp.adj4Edges[v_c][_i8]] || -1) === 1))) continue;
              _g5++;
            }
          }
          let _c14: boolean = ((_g5 + exits(sp, cl, v_c)) === 2);
          if (!_c14) {
            let _g9 = 0;
            G10: {
              const _a12 = sp.adj4[v_y];
              for (let _i13 = 0; _i13 < _a12.length; _i13++) {
                if (!(((b.grid[sp.adj4Edges[v_y][_i13]] || -1) === 1))) continue;
                _g9++;
              }
            }
            _c14 = ((_g9 + exits(sp, cl, v_y)) === 2);
          }
          _c15 = _c14;
        }
        _c16 = _c15;
      }
      if (!(!(_c16))) {
        _q1 = false;
        break Q2;
      }
    }
  }
  let _c21: boolean = _q1;
  if (_c21) {
    let _g17 = 0;
    G18: {
      const _a19 = sp.adj4[v_c];
      for (let _i20 = 0; _i20 < _a19.length; _i20++) {
        const v_y = _a19[_i20];
        if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
        _g17++;
      }
    }
    _c21 = ((_g17 === 2) || ((clueAt(cl.end, v_c) >= 1) && !(((clueAt(cl.end, v_c) >= 1) && ((clueAt(cl.end, v_c) >= 3) === (sp.rows.includes(v_L)))))));
  }
  const _made = _c21;
  crossableMarkedKept.set((v_c + 1) * 1048577 + (v_L + 1), _made);
  return _made;
}
