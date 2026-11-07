// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, edgeGroups, linkedSum, linkedWith, pointGroups, rangeMask, slash } from "../../engine/describe-runtime.ts";

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
  const _links = pointGroups(sp, (_x499: number) => (g[_x499] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q493 = true;
  Q494: {
    const _a495 = sp.points;
    for (let _i496 = 0; _i496 < _a495.length; _i496++) {
      const v_k = _a495[_i496];
      let _q497 = false;
      Q498: {
        const _a500 = _links.of(v_k);
        for (let _i501 = 0; _i501 < _a500.length; _i501++) {
          const v_q = _a500[_i501];
          if ((sp.pointCells[v_q].length < 4)) {
            _q497 = true;
            break Q498;
          }
        }
      }
      if (!(_q497)) {
        _q493 = false;
        break Q494;
      }
    }
  }
  if (!(_q493)) return false;
  for (let _k502 = 0; _k502 < cl.n.at.length; _k502++) {
    const _at503 = cl.n.at[_k502];
    const _v504 = cl.n.v[_k502];
    let _g505 = 0;
    G506: {
      const _a507 = sp.pointCells[_at503];
      for (let _i508 = 0; _i508 < _a507.length; _i508++) {
        const v_c = _a507[_i508];
        const _h509 = (g[v_c] || -1);
        if (!((_h509 === slash(sp, v_c, _at503)))) continue;
        _g505++;
      }
    }
    if (!((_g505 === _v504))) return false;
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
      if (fire !== null && !fire({ k: v_k, O: v_O, left: v_left }, facts)) return 1;
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
  const _g147: number[] = [];
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
            _g147.length = 0;
            G148: {
              const _a151 = sp.pointCells[v_k];
              for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                const v_c = _a151[_i152];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g147.push(v_c);
              }
            }
            const _a153 = _g147;
            for (let _i154 = 0; _i154 < _a153.length; _i154++) {
              const v_c = _a153[_i154];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g137.push(v_c);
            }
          }
          const v_O = _g137;
          const _h159 = v_O.length;
          let _g155 = 0;
          G156: {
            const _a157 = sp.pointCells[v_k];
            for (let _i158 = 0; _i158 < _a157.length; _i158++) {
              const v_c = _a157[_i158];
              if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
              _g155++;
            }
          }
          const v_left = ((_h122 - _g155) - 1);
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
            if (fire !== null && !fire({ A: v_A, k: v_k, P: v_P, a: v_a, b: v_b, O: v_O, left: v_left }, facts)) return 1;
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
  const _g254: number[] = [];
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
  const _eg265 = edgeGroups(sp, v_A);
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
            _g254.length = 0;
            G255: {
              const _a258 = sp.pointCells[v_k];
              for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                const v_c = _a258[_i259];
                const _h260 = (b.grid[v_c] !== 0);
                if (!(!(_h260))) continue;
                _g254.push(v_c);
              }
            }
            const _a261 = _g254;
            for (let _i262 = 0; _i262 < _a261.length; _i262++) {
              const v_c = _a261[_i262];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g244.push(v_c);
            }
          }
          L263: {
            const v_R = _g244;
            const _h264 = v_R.length;
            if (!(((_h264 === 0) || (((_h264 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg265.of((v_R[1] ?? -1)) === _eg265.of((v_R[0] ?? -1))))))) break L263;
            let _g266 = 0;
            G267: {
              const _a268 = sp.pointCells[v_k];
              for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                const v_c = _a268[_i269];
                const _h270 = (b.grid[v_c] || -1);
                if (!((_h270 === slash(sp, v_c, v_k)))) continue;
                _g266++;
              }
            }
            L271: {
              const v_left = (_h227 - _g266);
              if (!(((2 * v_left) === (2 + _h264)))) break L271;
              facts.length = 0;
              changed = false;
              const _t272 = sp.edgeOf(v_b, v_a);
              if ((b.edgeCand(_t272) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(_t272, 1); changed = true; } else facts.push(STRIKE_EDGE, _t272, 1); }
              let _c274: boolean = true;
              if (_c274) {
                const _t273 = sp.edgeOf(v_b, v_a);
                if ((b.edgeCand(_t273) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(_t273, 2); changed = true; } else facts.push(STRIKE_EDGE, _t273, 2); }
                _c274 = true;
              }
              if (!(_c274)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ A: v_A, k: v_k, P: v_P, a: v_a, b: v_b, R: v_R, left: v_left }, facts)) return 1;
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
  const _a295 = sp.cells;
  for (let _i296 = 0; _i296 < _a295.length; _i296++) {
    const v_c = _a295[_i296];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c305: boolean = !((b.grid[v_c] !== 0));
      if (_c305) {
        let _q297 = false;
        Q298: {
          const _a299 = sp.cellPoints[v_c];
          for (let _i300 = 0; _i300 < _a299.length; _i300++) {
            const v_k = _a299[_i300];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a301 = sp.cellPoints[v_c];
            const _n302 = _i300;
            for (let _i303 = 0; _i303 < _n302; _i303++) {
              const v_q = _a301[_i303];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              let _c304: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c304) {
                _c304 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c304) {
                _q297 = true;
                break Q298;
              }
            }
          }
        }
        _c305 = _q297;
      }
      if (!(_c305)) continue;
      facts.length = 0;
      changed = false;
      const _t306 = (3 - v_d);
      let _q307 = false;
      Q308: {
        const _a309 = sp.cellPoints[v_c];
        for (let _i310 = 0; _i310 < _a309.length; _i310++) {
          const v_k = _a309[_i310];
          if (!((slash(sp, v_c, v_k) === _t306))) continue;
          const _a311 = sp.cellPoints[v_c];
          const _n312 = _i310;
          for (let _i313 = 0; _i313 < _n312; _i313++) {
            const v_q = _a311[_i313];
            if (!((slash(sp, v_c, v_q) === _t306))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q307 = true;
              break Q308;
            }
          }
        }
      }
      let _c323: boolean = !(_q307);
      if (_c323) {
        const _t314 = (3 - v_d);
        let _q315 = false;
        Q316: {
          const _a317 = sp.cellPoints[v_c];
          for (let _i318 = 0; _i318 < _a317.length; _i318++) {
            const v_k = _a317[_i318];
            if (!((slash(sp, v_c, v_k) === _t314))) continue;
            const _a319 = sp.cellPoints[v_c];
            const _n320 = _i318;
            for (let _i321 = 0; _i321 < _n320; _i321++) {
              const v_q = _a319[_i321];
              if (!((slash(sp, v_c, v_q) === _t314))) continue;
              let _c322: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c322) {
                _c322 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c322) {
                _q315 = true;
                break Q316;
              }
            }
          }
        }
        _c323 = !(_q315);
      }
      let _c325: boolean = _c323;
      if (_c325) {
        const _t324 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t324); changed = true; } else facts.push(PLACE, v_c, _t324); }
        _c325 = true;
      }
      if (!(_c325)) return -1;
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
  const _g336: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h342 = ((1 << 3));
  _g336.length = 0;
  G337: {
    const _a340 = sp.edges;
    for (let _i341 = 0; _i341 < _a340.length; _i341++) {
      const v_e = _a340[_i341];
      if (!((b.edgeCand(v_e) === _h342))) continue;
      _g336.push(v_e);
    }
  }
  const v_A = _g336;
  const _eg345 = edgeGroups(sp, v_A);
  const _a343 = sp.cells;
  for (let _i344 = 0; _i344 < _a343.length; _i344++) {
    const v_c = _a343[_i344];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    const _a346 = _eg345.of(v_c);
    for (let _i347 = 0; _i347 < _a346.length; _i347++) {
      const v_q = _a346[_i347];
      if (!((b.grid[v_q] !== 0))) continue;
      facts.length = 0;
      changed = false;
      const _t348 = (b.grid[v_q] || -1);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t348); changed = true; } else facts.push(PLACE, v_c, _t348); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ A: v_A, c: v_c, q: v_q }, facts)) return 1;
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
  const _g362: number[] = [];
  const facts = drawnFacts;
  let fired = 0;
  let changed = false;
  const _h359 = (b.grid[v_c] !== 0);
  const _h369 = (b.grid[v_c] || -1);
  if (!(_h359)) return 0;
  const _a360 = sp.adj4[v_c];
  for (let _i361 = 0; _i361 < _a360.length; _i361++) {
    const v_a = _a360[_i361];
    const v_e = sp.adj4Edges[v_c][_i361];
    const _h368 = sp.edgeEnds[2 * v_e + 1];
    _g362.length = 0;
    G363: {
      const _a366 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
      for (let _i367 = 0; _i367 < _a366.length; _i367++) {
        const v_k = _a366[_i367];
        if (!((sp.cellPoints[_h368].includes(v_k)))) continue;
        _g362.push(v_k);
      }
    }
    const v_S = _g362;
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h369 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
      facts.length = 0;
      changed = false;
      if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null) fire({ c: v_c, a: v_a, e: v_e, S: v_S, i: v_i }, facts);
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
  const _g391: number[] = [];
  const facts = oneFacts;
  let fired = 0;
  let changed = false;
  const _a383 = sp.points;
  for (let _i384 = 0; _i384 < _a383.length; _i384++) {
    const v_k = _a383[_i384];
    const _h385 = clueAt(cl.n, v_k);
    if (!((_h385 === 1))) continue;
    const _a386 = sp.pointCells[v_k];
    for (let _i387 = 0; _i387 < _a386.length; _i387++) {
      const v_a = _a386[_i387];
      const _a388 = sp.pointCells[v_k];
      const _n389 = _i387;
      for (let _i390 = 0; _i390 < _n389; _i390++) {
        const v_b = _a388[_i390];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        const _h395 = sp.edgeEnds[2 * v_e];
        const _h398 = sp.edgeEnds[2 * v_e + 1];
        for (let v_i = 1; v_i <= 2; v_i++) {
          _g391.length = 0;
          G392: {
            const _a396 = sp.cellPoints[_h395];
            for (let _i397 = 0; _i397 < _a396.length; _i397++) {
              const v_k = _a396[_i397];
              if (!((sp.cellPoints[_h398].includes(v_k)))) continue;
              _g391.push(v_k);
            }
          }
          if (!(((_g391[(v_i - 1)] ?? -1) === v_k))) continue;
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
  const _g420: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a412 = sp.points;
  for (let _i413 = 0; _i413 < _a412.length; _i413++) {
    const v_k = _a412[_i413];
    const _h414 = clueAt(cl.n, v_k);
    if (!((_h414 === 3))) continue;
    const _a415 = sp.pointCells[v_k];
    for (let _i416 = 0; _i416 < _a415.length; _i416++) {
      const v_a = _a415[_i416];
      const _a417 = sp.pointCells[v_k];
      const _n418 = _i416;
      for (let _i419 = 0; _i419 < _n418; _i419++) {
        const v_b = _a417[_i419];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        const _h424 = sp.edgeEnds[2 * v_e];
        const _h427 = sp.edgeEnds[2 * v_e + 1];
        for (let v_i = 1; v_i <= 2; v_i++) {
          _g420.length = 0;
          G421: {
            const _a425 = sp.cellPoints[_h424];
            for (let _i426 = 0; _i426 < _a425.length; _i426++) {
              const v_k = _a425[_i426];
              if (!((sp.cellPoints[_h427].includes(v_k)))) continue;
              _g420.push(v_k);
            }
          }
          if (!(((_g420[(v_i - 1)] ?? -1) !== v_k))) continue;
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
  const _g465: number[] = [];
  const _g473: number[] = [];
  const _g481: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h464 = ((1 << 3));
  const _h472 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _a455 = sp.points;
  for (let _i456 = 0; _i456 < _a455.length; _i456++) {
    const v_k = _a455[_i456];
    const _h457 = clueAt(cl.n, v_k);
    if (!(((_h457 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a458 = sp.pointCells[v_k];
    for (let _i459 = 0; _i459 < _a458.length; _i459++) {
      const v_a = _a458[_i459];
      const _a460 = sp.pointCells[v_k];
      const _n461 = _i459;
      for (let _i462 = 0; _i462 < _n461; _i462++) {
        const v_b = _a460[_i462];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L463: {
          const v_e = sp.edgeOf(v_b, v_a);
          if (!((b.edgeCand(v_e) !== _h464))) break L463;
          const _h477 = sp.edgeEnds[2 * v_e];
          const _h480 = sp.edgeEnds[2 * v_e + 1];
          _g465.length = 0;
          G466: {
            const _a469 = sp.pointCells[v_k];
            for (let _i470 = 0; _i470 < _a469.length; _i470++) {
              const v_c = _a469[_i470];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g465.push(v_c);
            }
          }
          const v_R = _g465;
          L471: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h472))) break L471;
            const _h485 = sp.edgeEnds[2 * v_f];
            const _h488 = sp.edgeEnds[2 * v_f + 1];
            for (let v_i = 1; v_i <= 2; v_i++) {
              _g473.length = 0;
              G474: {
                const _a478 = sp.cellPoints[_h477];
                for (let _i479 = 0; _i479 < _a478.length; _i479++) {
                  const v_k = _a478[_i479];
                  if (!((sp.cellPoints[_h480].includes(v_k)))) continue;
                  _g473.push(v_k);
                }
              }
              if (!(((_g473[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h490 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                _g481.length = 0;
                G482: {
                  const _a486 = sp.cellPoints[_h485];
                  for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                    const v_k = _a486[_i487];
                    if (!((sp.cellPoints[_h488].includes(v_k)))) continue;
                    _g481.push(v_k);
                  }
                }
                if (!(((_g481[(v_j - 1)] ?? -1) === v_k))) continue;
                facts.length = 0;
                changed = false;
                let _c489: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c489) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c489 = true;
                }
                let _c492: boolean = _c489;
                if (_c492) {
                  let _c491: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c491) {
                    if ((b.edgeCand(v_e) >> _h490) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h490); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h490); }
                    _c491 = true;
                  }
                  _c492 = _c491;
                }
                if (!(_c492)) return -1;
                if (changed || facts.length > 0) {
                  fired = 1;
                  if (fire !== null && !fire({ k: v_k, a: v_a, b: v_b, e: v_e, R: v_R, f: v_f, i: v_i, j: v_j }, facts)) return 1;
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

/** What each point of a group adds to a forall kept over the group. */
function linkTerm0(_b: Marks, sp: GridSpace, _cl: null, v_q: number): number {
  return ((sp.pointCells[v_q].length === 4)) ? 0 : 1;
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm1(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) >= 0))) return 0;
  let _g284 = 0;
  G285: {
    const _a286 = sp.pointCells[v_q];
    for (let _i287 = 0; _i287 < _a286.length; _i287++) {
      const v_c = _a286[_i287];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_q)))) continue;
      _g284++;
    }
  }
  return (clueAt(cl.n, v_q) - _g284);
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm2(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) < 0))) return 0;
  const _g288: number[] = [];
  G289: {
    const _a292 = sp.pointCells[v_q];
    for (let _i293 = 0; _i293 < _a292.length; _i293++) {
      const v_c = _a292[_i293];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g288.push(v_c);
    }
  }
  return _g288.length;
}
