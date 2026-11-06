// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, edgeGroups, linkedOf, linkedWith, pointGroups, rangeMask, slash } from "../../engine/describe-runtime.ts";

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
  const _links = pointGroups(sp, (_x642: number) => (g[_x642] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q636 = true;
  Q637: {
    const _a638 = sp.points;
    for (let _i639 = 0; _i639 < _a638.length; _i639++) {
      const v_k = _a638[_i639];
      let _q640 = false;
      Q641: {
        const _a643 = _links.of(v_k);
        for (let _i644 = 0; _i644 < _a643.length; _i644++) {
          const v_q = _a643[_i644];
          if ((sp.pointCells[v_q].length < 4)) {
            _q640 = true;
            break Q641;
          }
        }
      }
      if (!(_q640)) {
        _q636 = false;
        break Q637;
      }
    }
  }
  if (!(_q636)) return false;
  for (let _k645 = 0; _k645 < cl.n.at.length; _k645++) {
    const _at646 = cl.n.at[_k645];
    const _v647 = cl.n.v[_k645];
    let _g648 = 0;
    G649: {
      const _a650 = sp.pointCells[_at646];
      for (let _i651 = 0; _i651 < _a650.length; _i651++) {
        const v_c = _a650[_i651];
        if (!(((g[v_c] || -1) === slash(sp, v_c, _at646)))) continue;
        _g648++;
      }
    }
    if (!((_g648 === _v647))) return false;
  }
  return true;
}

export interface ClueBinding {
  k: number;
  O: readonly number[];
  left: number;
}

const clueFacts: number[] = [];

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
        if (!(!(b.known(v_c)))) continue;
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
        if (!((b.value(v_c) === slash(sp, v_c, v_k)))) continue;
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
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t31); changed = true; } else facts.push(PLACE, v_c, _t31); }
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
            if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t38); changed = true; } else facts.push(PLACE, v_c, _t38); }
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

export function loop(b: Marks, sp: GridSpace, fire: Fire<LoopBinding> | null): number {
  const facts = loopFacts;
  let fired = 0;
  let changed = false;
  const _a51 = sp.cells;
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_c = _a51[_i52];
    if (!(!(b.known(v_c)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c60: boolean = !(b.known(v_c));
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
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t69); changed = true; } else facts.push(PLACE, v_c, _t69); }
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
        if (!(!(b.known(v_c)))) continue;
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
        if (!(!(b.known(v_a)))) continue;
        const _a133 = v_P;
        const _n134 = _i132;
        for (let _i135 = 0; _i135 < _n134; _i135++) {
          const v_b = _a133[_i135];
          if (!(((!(b.known(v_b)) && (sp.adj4[v_a].includes(v_b))) && (_eg136.of(v_a).includes(v_b))))) continue;
          _g137.length = 0;
          G138: {
            _g147.length = 0;
            G148: {
              const _a151 = sp.pointCells[v_k];
              for (let _i152 = 0; _i152 < _a151.length; _i152++) {
                const v_c = _a151[_i152];
                if (!(!(b.known(v_c)))) continue;
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
              if (!((b.value(v_c) === slash(sp, v_c, v_k)))) continue;
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
                  if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t164); changed = true; } else facts.push(PLACE, v_c, _t164); }
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
                  if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t171); changed = true; } else facts.push(PLACE, v_c, _t171); }
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
        const _h234 = b.known(v_c);
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
        const _h239 = b.known(v_a);
        if (!(!(_h239))) continue;
        const _a240 = v_P;
        const _n241 = _i238;
        for (let _i242 = 0; _i242 < _n241; _i242++) {
          const v_b = _a240[_i242];
          const _h243 = b.known(v_b);
          if (!((!(_h243) && (sp.adj4[v_a].includes(v_b))))) continue;
          _g244.length = 0;
          G245: {
            _g254.length = 0;
            G255: {
              const _a258 = sp.pointCells[v_k];
              for (let _i259 = 0; _i259 < _a258.length; _i259++) {
                const v_c = _a258[_i259];
                const _h260 = b.known(v_c);
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
            if (!(((_h264 === 0) || (((_h264 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg265.of((v_R[0] ?? -1)).includes((v_R[1] ?? -1))))))) break L263;
            let _g266 = 0;
            G267: {
              const _a268 = sp.pointCells[v_k];
              for (let _i269 = 0; _i269 < _a268.length; _i269++) {
                const v_c = _a268[_i269];
                const _h270 = b.value(v_c);
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

export function deadEnd(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DeadEndBinding> | null): number {
  const _g362: number[] = [];
  const _g388: number[] = [];
  const _g432: number[] = [];
  const _g458: number[] = [];
  const facts = deadEndFacts;
  let fired = 0;
  let changed = false;
  const _a334 = sp.cells;
  for (let _i335 = 0; _i335 < _a334.length; _i335++) {
    const v_c = _a334[_i335];
    if (!(!(b.known(v_c)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c396: boolean = !(b.known(v_c));
      if (_c396) {
        let _q336 = false;
        Q337: {
          const _a338 = sp.cellPoints[v_c];
          for (let _i339 = 0; _i339 < _a338.length; _i339++) {
            const v_k = _a338[_i339];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a340 = sp.cellPoints[v_c];
            const _n341 = _i339;
            for (let _i342 = 0; _i342 < _n341; _i342++) {
              const v_q = _a340[_i342];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              const _t343 = linkedOf(sp, b, v_k);
              let _q344 = true;
              Q345: {
                const _a346 = _t343;
                for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                  const v_q = _a346[_i347];
                  if (!((sp.pointCells[v_q].length === 4))) {
                    _q344 = false;
                    break Q345;
                  }
                }
              }
              let _c368: boolean = _q344;
              if (_c368) {
                let _g348 = 0;
                G349: {
                  const _a350 = _t343;
                  for (let _i351 = 0; _i351 < _a350.length; _i351++) {
                    const v_q = _a350[_i351];
                    const _h352 = clueAt(cl.n, v_q);
                    if (!((_h352 >= 0))) continue;
                    let _g353 = 0;
                    G354: {
                      const _a355 = sp.pointCells[v_q];
                      for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                        const v_c = _a355[_i356];
                        if (!((b.value(v_c) === slash(sp, v_c, v_q)))) continue;
                        _g353++;
                      }
                    }
                    _g348 += (_h352 - _g353);
                  }
                }
                let _g357 = 0;
                G358: {
                  const _a359 = _t343;
                  for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                    const v_q = _a359[_i360];
                    const _h361 = clueAt(cl.n, v_q);
                    if (!((_h361 < 0))) continue;
                    _g362.length = 0;
                    G363: {
                      const _a366 = sp.pointCells[v_q];
                      for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                        const v_c = _a366[_i367];
                        if (!(!(b.known(v_c)))) continue;
                        _g362.push(v_c);
                      }
                    }
                    _g357 += _g362.length;
                  }
                }
                _c368 = ((_g348 + _g357) <= 1);
              }
              let _c395: boolean = _c368;
              if (_c395) {
                const _t369 = linkedOf(sp, b, v_q);
                let _q370 = true;
                Q371: {
                  const _a372 = _t369;
                  for (let _i373 = 0; _i373 < _a372.length; _i373++) {
                    const v_q = _a372[_i373];
                    if (!((sp.pointCells[v_q].length === 4))) {
                      _q370 = false;
                      break Q371;
                    }
                  }
                }
                let _c394: boolean = _q370;
                if (_c394) {
                  let _g374 = 0;
                  G375: {
                    const _a376 = _t369;
                    for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                      const v_q = _a376[_i377];
                      const _h378 = clueAt(cl.n, v_q);
                      if (!((_h378 >= 0))) continue;
                      let _g379 = 0;
                      G380: {
                        const _a381 = sp.pointCells[v_q];
                        for (let _i382 = 0; _i382 < _a381.length; _i382++) {
                          const v_c = _a381[_i382];
                          if (!((b.value(v_c) === slash(sp, v_c, v_q)))) continue;
                          _g379++;
                        }
                      }
                      _g374 += (_h378 - _g379);
                    }
                  }
                  let _g383 = 0;
                  G384: {
                    const _a385 = _t369;
                    for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                      const v_q = _a385[_i386];
                      const _h387 = clueAt(cl.n, v_q);
                      if (!((_h387 < 0))) continue;
                      _g388.length = 0;
                      G389: {
                        const _a392 = sp.pointCells[v_q];
                        for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                          const v_c = _a392[_i393];
                          if (!(!(b.known(v_c)))) continue;
                          _g388.push(v_c);
                        }
                      }
                      _g383 += _g388.length;
                    }
                  }
                  _c394 = ((_g374 + _g383) <= 1);
                }
                _c395 = _c394;
              }
              if (_c395) {
                _q336 = true;
                break Q337;
              }
            }
          }
        }
        _c396 = _q336;
      }
      if (!(_c396)) continue;
      facts.length = 0;
      changed = false;
      const _t397 = (3 - v_d);
      let _q398 = false;
      Q399: {
        const _a400 = sp.cellPoints[v_c];
        for (let _i401 = 0; _i401 < _a400.length; _i401++) {
          const v_k = _a400[_i401];
          if (!((slash(sp, v_c, v_k) === _t397))) continue;
          const _a402 = sp.cellPoints[v_c];
          const _n403 = _i401;
          for (let _i404 = 0; _i404 < _n403; _i404++) {
            const v_q = _a402[_i404];
            if (!((slash(sp, v_c, v_q) === _t397))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q398 = true;
              break Q399;
            }
          }
        }
      }
      let _c466: boolean = !(_q398);
      if (_c466) {
        const _t405 = (3 - v_d);
        let _q406 = false;
        Q407: {
          const _a408 = sp.cellPoints[v_c];
          for (let _i409 = 0; _i409 < _a408.length; _i409++) {
            const v_k = _a408[_i409];
            if (!((slash(sp, v_c, v_k) === _t405))) continue;
            const _a410 = sp.cellPoints[v_c];
            const _n411 = _i409;
            for (let _i412 = 0; _i412 < _n411; _i412++) {
              const v_q = _a410[_i412];
              if (!((slash(sp, v_c, v_q) === _t405))) continue;
              const _t413 = linkedOf(sp, b, v_k);
              let _q414 = true;
              Q415: {
                const _a416 = _t413;
                for (let _i417 = 0; _i417 < _a416.length; _i417++) {
                  const v_q = _a416[_i417];
                  if (!((sp.pointCells[v_q].length === 4))) {
                    _q414 = false;
                    break Q415;
                  }
                }
              }
              let _c438: boolean = _q414;
              if (_c438) {
                let _g418 = 0;
                G419: {
                  const _a420 = _t413;
                  for (let _i421 = 0; _i421 < _a420.length; _i421++) {
                    const v_q = _a420[_i421];
                    const _h422 = clueAt(cl.n, v_q);
                    if (!((_h422 >= 0))) continue;
                    let _g423 = 0;
                    G424: {
                      const _a425 = sp.pointCells[v_q];
                      for (let _i426 = 0; _i426 < _a425.length; _i426++) {
                        const v_c = _a425[_i426];
                        if (!((b.value(v_c) === slash(sp, v_c, v_q)))) continue;
                        _g423++;
                      }
                    }
                    _g418 += (_h422 - _g423);
                  }
                }
                let _g427 = 0;
                G428: {
                  const _a429 = _t413;
                  for (let _i430 = 0; _i430 < _a429.length; _i430++) {
                    const v_q = _a429[_i430];
                    const _h431 = clueAt(cl.n, v_q);
                    if (!((_h431 < 0))) continue;
                    _g432.length = 0;
                    G433: {
                      const _a436 = sp.pointCells[v_q];
                      for (let _i437 = 0; _i437 < _a436.length; _i437++) {
                        const v_c = _a436[_i437];
                        if (!(!(b.known(v_c)))) continue;
                        _g432.push(v_c);
                      }
                    }
                    _g427 += _g432.length;
                  }
                }
                _c438 = ((_g418 + _g427) <= 1);
              }
              let _c465: boolean = _c438;
              if (_c465) {
                const _t439 = linkedOf(sp, b, v_q);
                let _q440 = true;
                Q441: {
                  const _a442 = _t439;
                  for (let _i443 = 0; _i443 < _a442.length; _i443++) {
                    const v_q = _a442[_i443];
                    if (!((sp.pointCells[v_q].length === 4))) {
                      _q440 = false;
                      break Q441;
                    }
                  }
                }
                let _c464: boolean = _q440;
                if (_c464) {
                  let _g444 = 0;
                  G445: {
                    const _a446 = _t439;
                    for (let _i447 = 0; _i447 < _a446.length; _i447++) {
                      const v_q = _a446[_i447];
                      const _h448 = clueAt(cl.n, v_q);
                      if (!((_h448 >= 0))) continue;
                      let _g449 = 0;
                      G450: {
                        const _a451 = sp.pointCells[v_q];
                        for (let _i452 = 0; _i452 < _a451.length; _i452++) {
                          const v_c = _a451[_i452];
                          if (!((b.value(v_c) === slash(sp, v_c, v_q)))) continue;
                          _g449++;
                        }
                      }
                      _g444 += (_h448 - _g449);
                    }
                  }
                  let _g453 = 0;
                  G454: {
                    const _a455 = _t439;
                    for (let _i456 = 0; _i456 < _a455.length; _i456++) {
                      const v_q = _a455[_i456];
                      const _h457 = clueAt(cl.n, v_q);
                      if (!((_h457 < 0))) continue;
                      _g458.length = 0;
                      G459: {
                        const _a462 = sp.pointCells[v_q];
                        for (let _i463 = 0; _i463 < _a462.length; _i463++) {
                          const v_c = _a462[_i463];
                          if (!(!(b.known(v_c)))) continue;
                          _g458.push(v_c);
                        }
                      }
                      _g453 += _g458.length;
                    }
                  }
                  _c464 = ((_g444 + _g453) <= 1);
                }
                _c465 = _c464;
              }
              if (_c465) {
                _q406 = true;
                break Q407;
              }
            }
          }
        }
        _c466 = !(_q406);
      }
      let _c468: boolean = _c466;
      if (_c468) {
        const _t467 = (3 - v_d);
        if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t467); changed = true; } else facts.push(PLACE, v_c, _t467); }
        _c468 = true;
      }
      if (!(_c468)) return -1;
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

export function same(b: Marks, sp: GridSpace, fire: Fire<SameBinding> | null): number {
  const _g479: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h485 = ((1 << 3));
  _g479.length = 0;
  G480: {
    const _a483 = sp.edges;
    for (let _i484 = 0; _i484 < _a483.length; _i484++) {
      const v_e = _a483[_i484];
      if (!((b.edgeCand(v_e) === _h485))) continue;
      _g479.push(v_e);
    }
  }
  const v_A = _g479;
  const _eg488 = edgeGroups(sp, v_A);
  const _a486 = sp.cells;
  for (let _i487 = 0; _i487 < _a486.length; _i487++) {
    const v_c = _a486[_i487];
    if (!(!(b.known(v_c)))) continue;
    const _a489 = _eg488.of(v_c);
    for (let _i490 = 0; _i490 < _a489.length; _i490++) {
      const v_q = _a489[_i490];
      if (!(b.known(v_q))) continue;
      facts.length = 0;
      changed = false;
      const _t491 = b.value(v_q);
      if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, _t491); changed = true; } else facts.push(PLACE, v_c, _t491); }
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

export function drawn(b: Marks, sp: GridSpace, v_c: number, fire: Fire<DrawnBinding> | null): number {
  const _g505: number[] = [];
  const facts = drawnFacts;
  let fired = 0;
  let changed = false;
  const _h502 = b.known(v_c);
  const _h512 = b.value(v_c);
  if (!(_h502)) return 0;
  const _a503 = sp.adj4[v_c];
  for (let _i504 = 0; _i504 < _a503.length; _i504++) {
    const v_a = _a503[_i504];
    const v_e = sp.edgeOf(v_c, v_a);
    const _h511 = sp.edgeEnds[2 * v_e + 1];
    _g505.length = 0;
    G506: {
      const _a509 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
      for (let _i510 = 0; _i510 < _a509.length; _i510++) {
        const v_k = _a509[_i510];
        if (!((sp.cellPoints[_h511].includes(v_k)))) continue;
        _g505.push(v_k);
      }
    }
    const v_S = _g505;
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h512 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
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

export function one(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OneBinding> | null): number {
  const _g534: number[] = [];
  const facts = oneFacts;
  let fired = 0;
  let changed = false;
  const _a526 = sp.points;
  for (let _i527 = 0; _i527 < _a526.length; _i527++) {
    const v_k = _a526[_i527];
    const _h528 = clueAt(cl.n, v_k);
    if (!((_h528 === 1))) continue;
    const _a529 = sp.pointCells[v_k];
    for (let _i530 = 0; _i530 < _a529.length; _i530++) {
      const v_a = _a529[_i530];
      const _a531 = sp.pointCells[v_k];
      const _n532 = _i530;
      for (let _i533 = 0; _i533 < _n532; _i533++) {
        const v_b = _a531[_i533];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        const _h538 = sp.edgeEnds[2 * v_e];
        const _h541 = sp.edgeEnds[2 * v_e + 1];
        for (let v_i = 1; v_i <= 2; v_i++) {
          _g534.length = 0;
          G535: {
            const _a539 = sp.cellPoints[_h538];
            for (let _i540 = 0; _i540 < _a539.length; _i540++) {
              const v_k = _a539[_i540];
              if (!((sp.cellPoints[_h541].includes(v_k)))) continue;
              _g534.push(v_k);
            }
          }
          if (!(((_g534[(v_i - 1)] ?? -1) === v_k))) continue;
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

export function three(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ThreeBinding> | null): number {
  const _g563: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a555 = sp.points;
  for (let _i556 = 0; _i556 < _a555.length; _i556++) {
    const v_k = _a555[_i556];
    const _h557 = clueAt(cl.n, v_k);
    if (!((_h557 === 3))) continue;
    const _a558 = sp.pointCells[v_k];
    for (let _i559 = 0; _i559 < _a558.length; _i559++) {
      const v_a = _a558[_i559];
      const _a560 = sp.pointCells[v_k];
      const _n561 = _i559;
      for (let _i562 = 0; _i562 < _n561; _i562++) {
        const v_b = _a560[_i562];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        const _h567 = sp.edgeEnds[2 * v_e];
        const _h570 = sp.edgeEnds[2 * v_e + 1];
        for (let v_i = 1; v_i <= 2; v_i++) {
          _g563.length = 0;
          G564: {
            const _a568 = sp.cellPoints[_h567];
            for (let _i569 = 0; _i569 < _a568.length; _i569++) {
              const v_k = _a568[_i569];
              if (!((sp.cellPoints[_h570].includes(v_k)))) continue;
              _g563.push(v_k);
            }
          }
          if (!(((_g563[(v_i - 1)] ?? -1) !== v_k))) continue;
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

export function two(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwoBinding> | null): number {
  const _g608: number[] = [];
  const _g616: number[] = [];
  const _g624: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h607 = ((1 << 3));
  const _h615 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _a598 = sp.points;
  for (let _i599 = 0; _i599 < _a598.length; _i599++) {
    const v_k = _a598[_i599];
    const _h600 = clueAt(cl.n, v_k);
    if (!(((_h600 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a601 = sp.pointCells[v_k];
    for (let _i602 = 0; _i602 < _a601.length; _i602++) {
      const v_a = _a601[_i602];
      const _a603 = sp.pointCells[v_k];
      const _n604 = _i602;
      for (let _i605 = 0; _i605 < _n604; _i605++) {
        const v_b = _a603[_i605];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L606: {
          const v_e = sp.edgeOf(v_b, v_a);
          if (!((b.edgeCand(v_e) !== _h607))) break L606;
          const _h620 = sp.edgeEnds[2 * v_e];
          const _h623 = sp.edgeEnds[2 * v_e + 1];
          _g608.length = 0;
          G609: {
            const _a612 = sp.pointCells[v_k];
            for (let _i613 = 0; _i613 < _a612.length; _i613++) {
              const v_c = _a612[_i613];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g608.push(v_c);
            }
          }
          const v_R = _g608;
          L614: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h615))) break L614;
            const _h628 = sp.edgeEnds[2 * v_f];
            const _h631 = sp.edgeEnds[2 * v_f + 1];
            for (let v_i = 1; v_i <= 2; v_i++) {
              _g616.length = 0;
              G617: {
                const _a621 = sp.cellPoints[_h620];
                for (let _i622 = 0; _i622 < _a621.length; _i622++) {
                  const v_k = _a621[_i622];
                  if (!((sp.cellPoints[_h623].includes(v_k)))) continue;
                  _g616.push(v_k);
                }
              }
              if (!(((_g616[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h633 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                _g624.length = 0;
                G625: {
                  const _a629 = sp.cellPoints[_h628];
                  for (let _i630 = 0; _i630 < _a629.length; _i630++) {
                    const v_k = _a629[_i630];
                    if (!((sp.cellPoints[_h631].includes(v_k)))) continue;
                    _g624.push(v_k);
                  }
                }
                if (!(((_g624[(v_j - 1)] ?? -1) === v_k))) continue;
                facts.length = 0;
                changed = false;
                let _c632: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c632) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c632 = true;
                }
                let _c635: boolean = _c632;
                if (_c635) {
                  let _c634: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c634) {
                    if ((b.edgeCand(v_e) >> _h633) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h633); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h633); }
                    _c634 = true;
                  }
                  _c635 = _c634;
                }
                if (!(_c635)) return -1;
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
