// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, edgeGroups, keptStore, linkedSum, linkedWith, pointGroups, rangeMask, slash, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  n: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "clue" | "loop" | "pair" | "share" | "deadEnd" | "same" | "one" | "three" | "two";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "drawn";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "drawn" },
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
  { id: "clue", tier: 0 },
  { id: "loop", tier: 0 },
  { id: "pair", tier: 1 },
  { id: "share", tier: 1 },
  { id: "deadEnd", tier: 1 },
  { id: "same", tier: 1 },
  { id: "one", tier: 1 },
  { id: "three", tier: 1 },
  { id: "two", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _links = pointGroups(sp, (_x424: number) => (g[_x424] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q418 = true;
  Q419: {
    const _a420 = sp.points;
    for (let _i421 = 0; _i421 < _a420.length; _i421++) {
      const v_k = _a420[_i421];
      let _q422 = false;
      Q423: {
        const _a425 = _links.of(v_k);
        for (let _i426 = 0; _i426 < _a425.length; _i426++) {
          const v_q = _a425[_i426];
          if ((sp.pointCells[v_q].length < 4)) {
            _q422 = true;
            break Q423;
          }
        }
      }
      if (!(_q422)) {
        _q418 = false;
        break Q419;
      }
    }
  }
  if (!(_q418)) return false;
  for (let _k427 = 0; _k427 < cl.n.at.length; _k427++) {
    const _at428 = cl.n.at[_k427];
    const _v429 = cl.n.v[_k427];
    let _g430 = 0;
    G431: {
      const _a432 = sp.pointCells[_at428];
      for (let _i433 = 0; _i433 < _a432.length; _i433++) {
        const v_c = _a432[_i433];
        const _h434 = (g[v_c] || -1);
        if (!((_h434 === slash(sp, v_c, _at428)))) continue;
        _g430++;
      }
    }
    if (!((_g430 === _v429))) return false;
  }
  return true;
}

export interface ClueBinding {
  k: number;
  O: readonly number[];
  left: number;
}

const clueFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function clue(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueBinding> | null): number {
  const _g16: number[] = [];
  const facts = clueFacts;
  let fired = 0;
  let changed = false;
  const _a13 = sp.points;
  for (let _i14 = 0; _i14 < _a13.length; _i14++) {
    const v_k = _a13[_i14];
    const _h15 = clueAt(cl.n, v_k);
    if (!((_h15 >= 0))) continue;
    _g16.length = 0;
    G17: {
      const _a20 = sp.pointCells[v_k];
      for (let _i21 = 0; _i21 < _a20.length; _i21++) {
        const v_c = _a20[_i21];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g16.push(v_c);
      }
    }
    const v_O = _g16;
    const _h26 = v_O.length;
    let _g22 = 0;
    G23: {
      const _a24 = sp.pointCells[v_k];
      for (let _i25 = 0; _i25 < _a24.length; _i25++) {
        const v_c = _a24[_i25];
        if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
        _g22++;
      }
    }
    const v_left = (_h15 - _g22);
    facts.length = 0;
    changed = false;
    let _c33: boolean = ((v_left >= 0) && (v_left <= _h26));
    if (_c33) {
      let _c32: boolean = !((v_left === 0));
      if (!_c32) {
        let _q27 = true;
        Q28: {
          const _a29 = v_O;
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_c = _a29[_i30];
            const _t31 = (3 - slash(sp, v_c, v_k));
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t31); changed = true; } else facts.push(PLACE, v_c, _t31); }
            if (!(true)) {
              _q27 = false;
              break Q28;
            }
          }
        }
        _c32 = _q27;
      }
      _c33 = _c32;
    }
    let _c40: boolean = _c33;
    if (_c40) {
      let _c39: boolean = !((v_left === _h26));
      if (!_c39) {
        let _q34 = true;
        Q35: {
          const _a36 = v_O;
          for (let _i37 = 0; _i37 < _a36.length; _i37++) {
            const v_c = _a36[_i37];
            const _t38 = slash(sp, v_c, v_k);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t38); changed = true; } else facts.push(PLACE, v_c, _t38); }
            if (!(true)) {
              _q34 = false;
              break Q35;
            }
          }
        }
        _c39 = _q34;
      }
      _c40 = _c39;
    }
    if (!(_c40)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k, O: v_O.slice(), left: v_left }, facts)) return 1;
    }
  }
  return fired;
}

export interface LoopBinding {
  c: number;
  d: number;
}

const loopFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function loop(b: Marks, sp: GridSpace, fire: Fire<LoopBinding> | null): number {
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  const _a51 = sp.cells;
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_c = _a51[_i52];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c60: boolean = !((b.grid[v_c] !== 0));
      if (_c60) {
        let _q53 = false;
        Q54: {
          const _a55 = sp.cellPoints[v_c];
          for (let _i56 = 0; _i56 < _a55.length; _i56++) {
            const v_k = _a55[_i56];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a57 = sp.cellPoints[v_c];
            const _n58 = _i56;
            for (let _i59 = 0; _i59 < _n58; _i59++) {
              const v_q = _a57[_i59];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              if (linkedWith(sp, b, v_q, v_k)) {
                _q53 = true;
                break Q54;
              }
            }
          }
        }
        _c60 = _q53;
      }
      if (!(_c60)) continue;
      facts.length = 0;
      changed = false;
      const _t61 = (3 - v_d);
      let _q62 = false;
      Q63: {
        const _a64 = sp.cellPoints[v_c];
        for (let _i65 = 0; _i65 < _a64.length; _i65++) {
          const v_k = _a64[_i65];
          if (!((slash(sp, v_c, v_k) === _t61))) continue;
          const _a66 = sp.cellPoints[v_c];
          const _n67 = _i65;
          for (let _i68 = 0; _i68 < _n67; _i68++) {
            const v_q = _a66[_i68];
            if (!((slash(sp, v_c, v_q) === _t61))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q62 = true;
              break Q63;
            }
          }
        }
      }
      let _c70: boolean = !(_q62);
      if (_c70) {
        const _t69 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t69); changed = true; } else facts.push(PLACE, v_c, _t69); }
        _c70 = true;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface PairBinding {
  A: readonly number[];
  k: number;
  P: readonly number[];
  a: number;
  b: number;
  O: readonly number[];
  left: number;
}

const pairFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function pair(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<PairBinding> | null): number {
  const _g113: number[] = [];
  const _g123: number[] = [];
  const _g137: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _h119 = ((1 << 3));
  _g113.length = 0;
  G114: {
    const _a117 = sp.edges;
    for (let _i118 = 0; _i118 < _a117.length; _i118++) {
      const v_e = _a117[_i118];
      if (!((b.edgeCand(v_e) === _h119))) continue;
      _g113.push(v_e);
    }
  }
  const v_A = _g113;
  const _eg136 = edgeGroups(sp, v_A);
  const _a120 = sp.points;
  for (let _i121 = 0; _i121 < _a120.length; _i121++) {
    const v_k = _a120[_i121];
    const _h122 = clueAt(cl.n, v_k);
    if (!((_h122 >= 0))) continue;
    _g123.length = 0;
    G124: {
      const _a127 = sp.pointCells[v_k];
      for (let _i128 = 0; _i128 < _a127.length; _i128++) {
        const v_c = _a127[_i128];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g123.push(v_c);
      }
    }
    L129: {
      const v_P = _g123;
      const _h130 = v_P.length;
      if (!((_h130 > 2))) break L129;
      const _a131 = v_P;
      for (let _i132 = 0; _i132 < _a131.length; _i132++) {
        const v_a = _a131[_i132];
        if (!(!((b.grid[v_a] !== 0)))) continue;
        const _a133 = v_P;
        const _n134 = _i132;
        for (let _i135 = 0; _i135 < _n134; _i135++) {
          const v_b = _a133[_i135];
          if (!(((!((b.grid[v_b] !== 0)) && (sp.adj4[v_a].includes(v_b))) && (_eg136.of(v_b) === _eg136.of(v_a))))) continue;
          _g137.length = 0;
          G138: {
            const _a153 = open(b, sp, v_k);
            for (let _i154 = 0; _i154 < _a153.length; _i154++) {
              const v_c = _a153[_i154];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g137.push(v_c);
            }
          }
          const v_O = _g137;
          const _h159 = v_O.length;
          const v_left = ((_h122 - lines(b, sp, v_k)) - 1);
          facts.length = 0;
          changed = false;
          let _c166: boolean = ((v_left >= 0) && (v_left <= _h159));
          if (_c166) {
            let _c165: boolean = !((v_left === 0));
            if (!_c165) {
              let _q160 = true;
              Q161: {
                const _a162 = v_O;
                for (let _i163 = 0; _i163 < _a162.length; _i163++) {
                  const v_c = _a162[_i163];
                  const _t164 = (3 - slash(sp, v_c, v_k));
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t164); changed = true; } else facts.push(PLACE, v_c, _t164); }
                  if (!(true)) {
                    _q160 = false;
                    break Q161;
                  }
                }
              }
              _c165 = _q160;
            }
            _c166 = _c165;
          }
          let _c173: boolean = _c166;
          if (_c173) {
            let _c172: boolean = !((v_left === _h159));
            if (!_c172) {
              let _q167 = true;
              Q168: {
                const _a169 = v_O;
                for (let _i170 = 0; _i170 < _a169.length; _i170++) {
                  const v_c = _a169[_i170];
                  const _t171 = slash(sp, v_c, v_k);
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t171); changed = true; } else facts.push(PLACE, v_c, _t171); }
                  if (!(true)) {
                    _q167 = false;
                    break Q168;
                  }
                }
              }
              _c172 = _q167;
            }
            _c173 = _c172;
          }
          if (!(_c173)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ A: v_A.slice(), k: v_k, P: v_P.slice(), a: v_a, b: v_b, O: v_O.slice(), left: v_left }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ShareBinding {
  A: readonly number[];
  k: number;
  P: readonly number[];
  a: number;
  b: number;
  R: readonly number[];
  left: number;
}

const shareFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function share(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShareBinding> | null): number {
  const _g218: number[] = [];
  const _g228: number[] = [];
  const _g244: number[] = [];
  const facts = shareFacts;
  let fired = 0;
  let changed = false;
  const _h224 = ((1 << 3));
  _g218.length = 0;
  G219: {
    const _a222 = sp.edges;
    for (let _i223 = 0; _i223 < _a222.length; _i223++) {
      const v_e = _a222[_i223];
      if (!((b.edgeCand(v_e) === _h224))) continue;
      _g218.push(v_e);
    }
  }
  const v_A = _g218;
  const _eg258 = edgeGroups(sp, v_A);
  const _a225 = sp.points;
  for (let _i226 = 0; _i226 < _a225.length; _i226++) {
    const v_k = _a225[_i226];
    const _h227 = clueAt(cl.n, v_k);
    if (!((_h227 >= 0))) continue;
    _g228.length = 0;
    G229: {
      const _a232 = sp.pointCells[v_k];
      for (let _i233 = 0; _i233 < _a232.length; _i233++) {
        const v_c = _a232[_i233];
        const _h234 = (b.grid[v_c] !== 0);
        if (!(!(_h234))) continue;
        _g228.push(v_c);
      }
    }
    L235: {
      const v_P = _g228;
      const _h236 = v_P.length;
      if (!(((_h236 === 2) || (_h236 === 4)))) break L235;
      const _a237 = v_P;
      for (let _i238 = 0; _i238 < _a237.length; _i238++) {
        const v_a = _a237[_i238];
        const _h239 = (b.grid[v_a] !== 0);
        if (!(!(_h239))) continue;
        const _a240 = v_P;
        const _n241 = _i238;
        for (let _i242 = 0; _i242 < _n241; _i242++) {
          const v_b = _a240[_i242];
          const _h243 = (b.grid[v_b] !== 0);
          if (!((!(_h243) && (sp.adj4[v_a].includes(v_b))))) continue;
          _g244.length = 0;
          G245: {
            const _a254 = open(b, sp, v_k);
            for (let _i255 = 0; _i255 < _a254.length; _i255++) {
              const v_c = _a254[_i255];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g244.push(v_c);
            }
          }
          L256: {
            const v_R = _g244;
            const _h257 = v_R.length;
            if (!(((_h257 === 0) || (((_h257 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg258.of((v_R[1] ?? -1)) === _eg258.of((v_R[0] ?? -1))))))) break L256;
            L259: {
              const v_left = (_h227 - lines(b, sp, v_k));
              if (!(((2 * v_left) === (2 + _h257)))) break L259;
              facts.length = 0;
              changed = false;
              const _t260 = sp.edgeOf(v_b, v_a);
              if ((b.edgeCand(_t260) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(_t260, 1); changed = true; } else facts.push(STRIKE_EDGE, _t260, 1); }
              let _c262: boolean = true;
              if (_c262) {
                const _t261 = sp.edgeOf(v_b, v_a);
                if ((b.edgeCand(_t261) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(_t261, 2); changed = true; } else facts.push(STRIKE_EDGE, _t261, 2); }
                _c262 = true;
              }
              if (!(_c262)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ A: v_A.slice(), k: v_k, P: v_P.slice(), a: v_a, b: v_b, R: v_R.slice(), left: v_left }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface DeadEndBinding {
  c: number;
  d: number;
}

const deadEndFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function deadEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DeadEndBinding> | null): number {
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _a283 = sp.cells;
  for (let _i284 = 0; _i284 < _a283.length; _i284++) {
    const v_c = _a283[_i284];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c293: boolean = !((b.grid[v_c] !== 0));
      if (_c293) {
        let _q285 = false;
        Q286: {
          const _a287 = sp.cellPoints[v_c];
          for (let _i288 = 0; _i288 < _a287.length; _i288++) {
            const v_k = _a287[_i288];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a289 = sp.cellPoints[v_c];
            const _n290 = _i288;
            for (let _i291 = 0; _i291 < _n290; _i291++) {
              const v_q = _a289[_i291];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              let _c292: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c292) {
                _c292 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c292) {
                _q285 = true;
                break Q286;
              }
            }
          }
        }
        _c293 = _q285;
      }
      if (!(_c293)) continue;
      facts.length = 0;
      changed = false;
      const _t294 = (3 - v_d);
      let _q295 = false;
      Q296: {
        const _a297 = sp.cellPoints[v_c];
        for (let _i298 = 0; _i298 < _a297.length; _i298++) {
          const v_k = _a297[_i298];
          if (!((slash(sp, v_c, v_k) === _t294))) continue;
          const _a299 = sp.cellPoints[v_c];
          const _n300 = _i298;
          for (let _i301 = 0; _i301 < _n300; _i301++) {
            const v_q = _a299[_i301];
            if (!((slash(sp, v_c, v_q) === _t294))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q295 = true;
              break Q296;
            }
          }
        }
      }
      let _c311: boolean = !(_q295);
      if (_c311) {
        const _t302 = (3 - v_d);
        let _q303 = false;
        Q304: {
          const _a305 = sp.cellPoints[v_c];
          for (let _i306 = 0; _i306 < _a305.length; _i306++) {
            const v_k = _a305[_i306];
            if (!((slash(sp, v_c, v_k) === _t302))) continue;
            const _a307 = sp.cellPoints[v_c];
            const _n308 = _i306;
            for (let _i309 = 0; _i309 < _n308; _i309++) {
              const v_q = _a307[_i309];
              if (!((slash(sp, v_c, v_q) === _t302))) continue;
              let _c310: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c310) {
                _c310 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c310) {
                _q303 = true;
                break Q304;
              }
            }
          }
        }
        _c311 = !(_q303);
      }
      let _c313: boolean = _c311;
      if (_c313) {
        const _t312 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t312); changed = true; } else facts.push(PLACE, v_c, _t312); }
        _c313 = true;
      }
      if (!(_c313)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, d: v_d }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface SameBinding {
  A: readonly number[];
  c: number;
  q: number;
}

const sameFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function same(b: Marks, sp: GridSpace, fire: Fire<SameBinding> | null): number {
  const _g324: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h330 = ((1 << 3));
  _g324.length = 0;
  G325: {
    const _a328 = sp.edges;
    for (let _i329 = 0; _i329 < _a328.length; _i329++) {
      const v_e = _a328[_i329];
      if (!((b.edgeCand(v_e) === _h330))) continue;
      _g324.push(v_e);
    }
  }
  const v_A = _g324;
  const _eg333 = edgeGroups(sp, v_A);
  const _a331 = sp.cells;
  for (let _i332 = 0; _i332 < _a331.length; _i332++) {
    const v_c = _a331[_i332];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    const _a334 = _eg333.of(v_c);
    for (let _i335 = 0; _i335 < _a334.length; _i335++) {
      const v_q = _a334[_i335];
      if (!((b.grid[v_q] !== 0))) continue;
      facts.length = 0;
      changed = false;
      const _t336 = (b.grid[v_q] || -1);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t336); changed = true; } else facts.push(PLACE, v_c, _t336); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ A: v_A.slice(), c: v_c, q: v_q }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DrawnBinding {
  c: number;
  a: number;
  e: number;
  S: readonly number[];
  i: number;
}

const drawnFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function drawn(b: Marks, sp: GridSpace, v_c: number, fire: Fire<DrawnBinding> | null): number {
  const facts = drawnFacts;
  let fired = 0;
  let changed = false;
  const _h347 = (b.grid[v_c] !== 0);
  const _h350 = (b.grid[v_c] || -1);
  if (!(_h347)) return 0;
  const _a348 = sp.adj4[v_c];
  for (let _i349 = 0; _i349 < _a348.length; _i349++) {
    const v_a = _a348[_i349];
    const v_e = sp.adj4Edges[v_c][_i349];
    const v_S = side(sp, v_e);
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h350 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) fire({ c: v_c, a: v_a, e: v_e, S: v_S.slice(), i: v_i }, facts);
      }
    }
  }
  return fired;
}

export interface OneBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  i: number;
}

const oneFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function one(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneBinding> | null): number {
  const facts = oneFacts;
  let fired = 0;
  let changed = false;
  const _a358 = sp.points;
  for (let _i359 = 0; _i359 < _a358.length; _i359++) {
    const v_k = _a358[_i359];
    const _h360 = clueAt(cl.n, v_k);
    if (!((_h360 === 1))) continue;
    const _a361 = sp.pointCells[v_k];
    for (let _i362 = 0; _i362 < _a361.length; _i362++) {
      const v_a = _a361[_i362];
      const _a363 = sp.pointCells[v_k];
      const _n364 = _i362;
      for (let _i365 = 0; _i365 < _n364; _i365++) {
        const v_b = _a363[_i365];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!(((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k))) continue;
          facts.length = 0;
          changed = false;
          if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, i: v_i }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface ThreeBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  i: number;
}

const threeFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function three(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ThreeBinding> | null): number {
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a373 = sp.points;
  for (let _i374 = 0; _i374 < _a373.length; _i374++) {
    const v_k = _a373[_i374];
    const _h375 = clueAt(cl.n, v_k);
    if (!((_h375 === 3))) continue;
    const _a376 = sp.pointCells[v_k];
    for (let _i377 = 0; _i377 < _a376.length; _i377++) {
      const v_a = _a376[_i377];
      const _a378 = sp.pointCells[v_k];
      const _n379 = _i377;
      for (let _i380 = 0; _i380 < _n379; _i380++) {
        const v_b = _a378[_i380];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!(((side(sp, v_e)[(v_i - 1)] ?? -1) !== v_k))) continue;
          facts.length = 0;
          changed = false;
          if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, i: v_i }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface TwoBinding {
  k: number;
  a: number;
  b: number;
  e: number;
  R: readonly number[];
  f: number;
  i: number;
  j: number;
}

const twoFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function two(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoBinding> | null): number {
  const _g406: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h405 = ((1 << 3));
  const _h413 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _a396 = sp.points;
  for (let _i397 = 0; _i397 < _a396.length; _i397++) {
    const v_k = _a396[_i397];
    const _h398 = clueAt(cl.n, v_k);
    if (!(((_h398 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a399 = sp.pointCells[v_k];
    for (let _i400 = 0; _i400 < _a399.length; _i400++) {
      const v_a = _a399[_i400];
      const _a401 = sp.pointCells[v_k];
      const _n402 = _i400;
      for (let _i403 = 0; _i403 < _n402; _i403++) {
        const v_b = _a401[_i403];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L404: {
          const v_e = sp.edgeOf(v_b, v_a);
          if (!((b.edgeCand(v_e) !== _h405))) break L404;
          _g406.length = 0;
          G407: {
            const _a410 = sp.pointCells[v_k];
            for (let _i411 = 0; _i411 < _a410.length; _i411++) {
              const v_c = _a410[_i411];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g406.push(v_c);
            }
          }
          const v_R = _g406;
          L412: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h413))) break L412;
            for (let v_i = 1; v_i <= 2; v_i++) {
              if (!(((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h415 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                if (!(((side(sp, v_f)[(v_j - 1)] ?? -1) === v_k))) continue;
                facts.length = 0;
                changed = false;
                let _c414: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c414) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c414 = true;
                }
                let _c417: boolean = _c414;
                if (_c417) {
                  let _c416: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c416) {
                    if ((b.edgeCand(v_e) >> _h415) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h415); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h415); }
                    _c416 = true;
                  }
                  _c417 = _c416;
                }
                if (!(_c417)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, R: v_R.slice(), f: v_f, i: v_i, j: v_j }, facts)) return 1;
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

const openKept = keptStore<readonly number[]>();

/** `open(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_k: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  const _g147: number[] = [];
  G148: {
    const _a151 = sp.pointCells[v_k];
    for (let _i152 = 0; _i152 < _a151.length; _i152++) {
      const v_c = _a151[_i152];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g147.push(v_c);
    }
  }
  const _made = _g147;
  _kept[v_k] = _made;
  return _made;
}

const linesKept = keptStore<number>();

/** `lines(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lines(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = linesKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g155 = 0;
  G156: {
    const _a157 = sp.pointCells[v_k];
    for (let _i158 = 0; _i158 < _a157.length; _i158++) {
      const v_c = _a157[_i158];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
      _g155++;
    }
  }
  const _made = _g155;
  _kept[v_k] = _made;
  return _made;
}

/** What each point of a group adds to a forall kept over the group. */
function linkTerm0(_b: Marks, sp: GridSpace, _cl: null, v_q: number): number {
  return ((sp.pointCells[v_q].length === 4)) ? 0 : 1;
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm1(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) >= 0))) return 0;
  let _g272 = 0;
  G273: {
    const _a274 = sp.pointCells[v_q];
    for (let _i275 = 0; _i275 < _a274.length; _i275++) {
      const v_c = _a274[_i275];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_q)))) continue;
      _g272++;
    }
  }
  return (clueAt(cl.n, v_q) - _g272);
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm2(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) < 0))) return 0;
  const _g276: number[] = [];
  G277: {
    const _a280 = sp.pointCells[v_q];
    for (let _i281 = 0; _i281 < _a280.length; _i281++) {
      const v_c = _a280[_i281];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g276.push(v_c);
    }
  }
  return _g276.length;
}

const sideKept = keptStore<readonly number[]>();

/** `side(e)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function side(sp: GridSpace, v_e: number): readonly number[] {
  const _kept: Kept<readonly number[]> = sideKept.board(sp);
  if (_kept[v_e] !== undefined) return _kept[v_e];
  const _g341: number[] = [];
  G342: {
    const _a345 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
    for (let _i346 = 0; _i346 < _a345.length; _i346++) {
      const v_k = _a345[_i346];
      if (!((sp.cellPoints[sp.edgeEnds[2 * v_e + 1]].includes(v_k)))) continue;
      _g341.push(v_k);
    }
  }
  const _made = _g341;
  _kept[v_e] = _made;
  return _made;
}
