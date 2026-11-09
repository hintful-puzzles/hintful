// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, clueAt, edgeGroups, keptStore, linkedSum, linkedWith, pointGroups, rangeMask, sameSet, slash, type Kept } from "../../engine/describe-runtime.ts";

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
  const _links = pointGroups(sp, (_x454: number) => (g[_x454] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q448 = true;
  Q449: {
    const _a450 = sp.points;
    for (let _i451 = 0; _i451 < _a450.length; _i451++) {
      const v_k = _a450[_i451];
      let _q452 = false;
      Q453: {
        const _a455 = _links.of(v_k);
        for (let _i456 = 0; _i456 < _a455.length; _i456++) {
          const v_q = _a455[_i456];
          if ((sp.pointCells[v_q].length < 4)) {
            _q452 = true;
            break Q453;
          }
        }
      }
      if (!(_q452)) {
        _q448 = false;
        break Q449;
      }
    }
  }
  if (!(_q448)) return false;
  for (let _k457 = 0; _k457 < cl.n.at.length; _k457++) {
    const _at458 = cl.n.at[_k457];
    const _v459 = cl.n.v[_k457];
    let _g460 = 0;
    G461: {
      const _a462 = sp.pointCells[_at458];
      for (let _i463 = 0; _i463 < _a462.length; _i463++) {
        const v_c = _a462[_i463];
        const _h464 = (g[v_c] || -1);
        if (!((_h464 === slash(sp, v_c, _at458)))) continue;
        _g460++;
      }
    }
    if (!((_g460 === _v459))) return false;
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
  const _a50 = sp.cells;
  R1:
  for (let _i51 = 0; _i51 < _a50.length; _i51++) {
    const v_c = _a50[_i51];
    const _m27_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _q52 = false;
      Q53: {
        const _a54 = sp.cellPoints[v_c];
        for (let _i55 = 0; _i55 < _a54.length; _i55++) {
          const v_k = _a54[_i55];
          if (!((slash(sp, v_c, v_k) === v_d))) continue;
          const _a56 = sp.cellPoints[v_c];
          const _n57 = _i55;
          for (let _i58 = 0; _i58 < _n57; _i58++) {
            const v_q = _a56[_i58];
            if (!((slash(sp, v_c, v_q) === v_d))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q52 = true;
              break Q53;
            }
          }
        }
      }
      if (!(_q52)) continue;
      if (b.made[0] !== _m27_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      const _t59 = (3 - v_d);
      let _q60 = false;
      Q61: {
        const _a62 = sp.cellPoints[v_c];
        for (let _i63 = 0; _i63 < _a62.length; _i63++) {
          const v_k = _a62[_i63];
          if (!((slash(sp, v_c, v_k) === _t59))) continue;
          const _a64 = sp.cellPoints[v_c];
          const _n65 = _i63;
          for (let _i66 = 0; _i66 < _n65; _i66++) {
            const v_q = _a64[_i66];
            if (!((slash(sp, v_c, v_q) === _t59))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q60 = true;
              break Q61;
            }
          }
        }
      }
      let _c68: boolean = !(_q60);
      if (_c68) {
        const _t67 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t67); changed = true; } else facts.push(PLACE, v_c, _t67); }
        _c68 = true;
      }
      if (!(_c68)) return -1;
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
  const _g111: number[] = [];
  const _g121: number[] = [];
  const _g135: number[] = [];
  const _g157: number[] = [];
  const _g163: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _h117 = ((1 << 3));
  const _m49_2 = b.made[2];
  _g111.length = 0;
  G112: {
    const _a115 = sp.edges;
    for (let _i116 = 0; _i116 < _a115.length; _i116++) {
      const v_e = _a115[_i116];
      if (!((b.edgeCand(v_e) === _h117))) continue;
      _g111.push(v_e);
    }
  }
  const v_A = _g111;
  const _eg134 = edgeGroups(sp, v_A);
  const _a118 = sp.points;
  R1:
  for (let _i119 = 0; _i119 < _a118.length; _i119++) {
    const v_k = _a118[_i119];
    const _h120 = clueAt(cl.n, v_k);
    if (!((_h120 >= 0))) continue;
    const _m58_0 = b.made[0];
    _g121.length = 0;
    G122: {
      const _a125 = sp.pointCells[v_k];
      for (let _i126 = 0; _i126 < _a125.length; _i126++) {
        const v_c = _a125[_i126];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g121.push(v_c);
      }
    }
    L127: {
      const v_P = _g121;
      const _h128 = v_P.length;
      if (!((_h128 > 2))) break L127;
      const _a129 = v_P;
      for (let _i130 = 0; _i130 < _a129.length; _i130++) {
        const v_a = _a129[_i130];
        const _a131 = v_P;
        const _n132 = _i130;
        for (let _i133 = 0; _i133 < _n132; _i133++) {
          const v_b = _a131[_i133];
          if (!(((sp.adj4[v_a].includes(v_b)) && (_eg134.of(v_b) === _eg134.of(v_a))))) continue;
          _g135.length = 0;
          G136: {
            const _a151 = open(b, sp, v_k);
            for (let _i152 = 0; _i152 < _a151.length; _i152++) {
              const v_c = _a151[_i152];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g135.push(v_c);
            }
          }
          const v_O = _g135;
          const _h169 = v_O.length;
          const v_left = ((_h120 - lines(b, sp, v_k)) - 1);
          if (b.made[0] !== _m58_0 || b.made[2] !== _m49_2) {
            _g157.length = 0;
            G158: {
              const _a161 = sp.edges;
              for (let _i162 = 0; _i162 < _a161.length; _i162++) {
                const v_e = _a161[_i162];
                if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                _g157.push(v_e);
              }
            }
            if (!(sameSet(v_A, _g157))) { return fired; }
            _g163.length = 0;
            G164: {
              const _a167 = sp.pointCells[v_k];
              for (let _i168 = 0; _i168 < _a167.length; _i168++) {
                const v_c = _a167[_i168];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g163.push(v_c);
              }
            }
            if (!(sameSet(v_P, _g163))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _c176: boolean = ((v_left >= 0) && (v_left <= _h169));
          if (_c176) {
            let _c175: boolean = !((v_left === 0));
            if (!_c175) {
              let _q170 = true;
              Q171: {
                const _a172 = v_O;
                for (let _i173 = 0; _i173 < _a172.length; _i173++) {
                  const v_c = _a172[_i173];
                  const _t174 = (3 - slash(sp, v_c, v_k));
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t174); changed = true; } else facts.push(PLACE, v_c, _t174); }
                  if (!(true)) {
                    _q170 = false;
                    break Q171;
                  }
                }
              }
              _c175 = _q170;
            }
            _c176 = _c175;
          }
          let _c183: boolean = _c176;
          if (_c183) {
            let _c182: boolean = !((v_left === _h169));
            if (!_c182) {
              let _q177 = true;
              Q178: {
                const _a179 = v_O;
                for (let _i180 = 0; _i180 < _a179.length; _i180++) {
                  const v_c = _a179[_i180];
                  const _t181 = slash(sp, v_c, v_k);
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t181); changed = true; } else facts.push(PLACE, v_c, _t181); }
                  if (!(true)) {
                    _q177 = false;
                    break Q178;
                  }
                }
              }
              _c182 = _q177;
            }
            _c183 = _c182;
          }
          if (!(_c183)) return -1;
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
  const _g228: number[] = [];
  const _g238: number[] = [];
  const _g252: number[] = [];
  const _g268: number[] = [];
  const _g274: number[] = [];
  const facts = shareFacts;
  let fired = 0;
  let changed = false;
  const _h234 = ((1 << 3));
  const _m87_2 = b.made[2];
  _g228.length = 0;
  G229: {
    const _a232 = sp.edges;
    for (let _i233 = 0; _i233 < _a232.length; _i233++) {
      const v_e = _a232[_i233];
      if (!((b.edgeCand(v_e) === _h234))) continue;
      _g228.push(v_e);
    }
  }
  const v_A = _g228;
  const _eg266 = edgeGroups(sp, v_A);
  const _a235 = sp.points;
  R1:
  for (let _i236 = 0; _i236 < _a235.length; _i236++) {
    const v_k = _a235[_i236];
    const _h237 = clueAt(cl.n, v_k);
    if (!((_h237 >= 0))) continue;
    const _m96_0 = b.made[0];
    _g238.length = 0;
    G239: {
      const _a242 = sp.pointCells[v_k];
      for (let _i243 = 0; _i243 < _a242.length; _i243++) {
        const v_c = _a242[_i243];
        const _h244 = (b.grid[v_c] !== 0);
        if (!(!(_h244))) continue;
        _g238.push(v_c);
      }
    }
    L245: {
      const v_P = _g238;
      const _h246 = v_P.length;
      if (!(((_h246 === 2) || (_h246 === 4)))) break L245;
      const _a247 = v_P;
      for (let _i248 = 0; _i248 < _a247.length; _i248++) {
        const v_a = _a247[_i248];
        const _a249 = v_P;
        const _n250 = _i248;
        for (let _i251 = 0; _i251 < _n250; _i251++) {
          const v_b = _a249[_i251];
          if (!((sp.adj4[v_a].includes(v_b)))) continue;
          _g252.length = 0;
          G253: {
            const _a262 = open(b, sp, v_k);
            for (let _i263 = 0; _i263 < _a262.length; _i263++) {
              const v_c = _a262[_i263];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g252.push(v_c);
            }
          }
          L264: {
            const v_R = _g252;
            const _h265 = v_R.length;
            if (!(((_h265 === 0) || (((_h265 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg266.of((v_R[1] ?? -1)) === _eg266.of((v_R[0] ?? -1))))))) break L264;
            L267: {
              const v_left = (_h237 - lines(b, sp, v_k));
              if (!(((2 * v_left) === (2 + _h265)))) break L267;
              if (b.made[0] !== _m96_0 || b.made[2] !== _m87_2) {
                _g268.length = 0;
                G269: {
                  const _a272 = sp.edges;
                  for (let _i273 = 0; _i273 < _a272.length; _i273++) {
                    const v_e = _a272[_i273];
                    if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                    _g268.push(v_e);
                  }
                }
                if (!(sameSet(v_A, _g268))) { return fired; }
                _g274.length = 0;
                G275: {
                  const _a278 = sp.pointCells[v_k];
                  for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                    const v_c = _a278[_i279];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g274.push(v_c);
                  }
                }
                if (!(sameSet(v_P, _g274))) { continue R1; }
              }
              facts.length = 0;
              changed = false;
              const _t280 = sp.edgeOf(v_b, v_a);
              if ((b.edgeCand(_t280) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(_t280, 1); changed = true; } else facts.push(STRIKE_EDGE, _t280, 1); }
              let _c282: boolean = true;
              if (_c282) {
                const _t281 = sp.edgeOf(v_b, v_a);
                if ((b.edgeCand(_t281) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(_t281, 2); changed = true; } else facts.push(STRIKE_EDGE, _t281, 2); }
                _c282 = true;
              }
              if (!(_c282)) return -1;
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
  const _a303 = sp.cells;
  R1:
  for (let _i304 = 0; _i304 < _a303.length; _i304++) {
    const v_c = _a303[_i304];
    const _m126_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c313: boolean = !((b.grid[v_c] !== 0));
      if (_c313) {
        let _q305 = false;
        Q306: {
          const _a307 = sp.cellPoints[v_c];
          for (let _i308 = 0; _i308 < _a307.length; _i308++) {
            const v_k = _a307[_i308];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a309 = sp.cellPoints[v_c];
            const _n310 = _i308;
            for (let _i311 = 0; _i311 < _n310; _i311++) {
              const v_q = _a309[_i311];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              let _c312: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c312) {
                _c312 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c312) {
                _q305 = true;
                break Q306;
              }
            }
          }
        }
        _c313 = _q305;
      }
      if (!(_c313)) continue;
      if (b.made[0] !== _m126_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
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
            if (linkedWith(sp, b, v_q, v_k)) {
              _q315 = true;
              break Q316;
            }
          }
        }
      }
      let _c331: boolean = !(_q315);
      if (_c331) {
        const _t322 = (3 - v_d);
        let _q323 = false;
        Q324: {
          const _a325 = sp.cellPoints[v_c];
          for (let _i326 = 0; _i326 < _a325.length; _i326++) {
            const v_k = _a325[_i326];
            if (!((slash(sp, v_c, v_k) === _t322))) continue;
            const _a327 = sp.cellPoints[v_c];
            const _n328 = _i326;
            for (let _i329 = 0; _i329 < _n328; _i329++) {
              const v_q = _a327[_i329];
              if (!((slash(sp, v_c, v_q) === _t322))) continue;
              let _c330: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c330) {
                _c330 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c330) {
                _q323 = true;
                break Q324;
              }
            }
          }
        }
        _c331 = !(_q323);
      }
      let _c333: boolean = _c331;
      if (_c333) {
        const _t332 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t332); changed = true; } else facts.push(PLACE, v_c, _t332); }
        _c333 = true;
      }
      if (!(_c333)) return -1;
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
  const _g344: number[] = [];
  const _g356: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h350 = ((1 << 3));
  const _m157_2 = b.made[2];
  _g344.length = 0;
  G345: {
    const _a348 = sp.edges;
    for (let _i349 = 0; _i349 < _a348.length; _i349++) {
      const v_e = _a348[_i349];
      if (!((b.edgeCand(v_e) === _h350))) continue;
      _g344.push(v_e);
    }
  }
  const v_A = _g344;
  const _eg353 = edgeGroups(sp, v_A);
  const _a351 = sp.cells;
  R1:
  for (let _i352 = 0; _i352 < _a351.length; _i352++) {
    const v_c = _a351[_i352];
    const _m163_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    const _a354 = _eg353.of(v_c);
    for (let _i355 = 0; _i355 < _a354.length; _i355++) {
      const v_q = _a354[_i355];
      if (!((b.grid[v_q] !== 0))) continue;
      if (b.made[0] !== _m163_0 || b.made[2] !== _m157_2) {
        _g356.length = 0;
        G357: {
          const _a360 = sp.edges;
          for (let _i361 = 0; _i361 < _a360.length; _i361++) {
            const v_e = _a360[_i361];
            if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
            _g356.push(v_e);
          }
        }
        if (!(sameSet(v_A, _g356))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      facts.length = 0;
      changed = false;
      const _t362 = (b.grid[v_q] || -1);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t362); changed = true; } else facts.push(PLACE, v_c, _t362); }
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
  const _h373 = (b.grid[v_c] !== 0);
  const _k376 = sideKept.board(sp);
  const _h377 = (b.grid[v_c] || -1);
  if (!(_h373)) return 0;
  const _a374 = sp.adj4[v_c];
  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
    const v_a = _a374[_i375];
    const v_e = sp.adj4Edges[v_c][_i375];
    const v_S = (_k376[v_e] ?? side(sp, v_e));
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h377 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
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
  const _k393 = sideKept.board(sp);
  const _a385 = sp.points;
  for (let _i386 = 0; _i386 < _a385.length; _i386++) {
    const v_k = _a385[_i386];
    const _h387 = clueAt(cl.n, v_k);
    if (!((_h387 === 1))) continue;
    const _a388 = sp.pointCells[v_k];
    for (let _i389 = 0; _i389 < _a388.length; _i389++) {
      const v_a = _a388[_i389];
      const _a390 = sp.pointCells[v_k];
      const _n391 = _i389;
      for (let _i392 = 0; _i392 < _n391; _i392++) {
        const v_b = _a390[_i392];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k393[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
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
  const _k409 = sideKept.board(sp);
  const _a401 = sp.points;
  for (let _i402 = 0; _i402 < _a401.length; _i402++) {
    const v_k = _a401[_i402];
    const _h403 = clueAt(cl.n, v_k);
    if (!((_h403 === 3))) continue;
    const _a404 = sp.pointCells[v_k];
    for (let _i405 = 0; _i405 < _a404.length; _i405++) {
      const v_a = _a404[_i405];
      const _a406 = sp.pointCells[v_k];
      const _n407 = _i405;
      for (let _i408 = 0; _i408 < _n407; _i408++) {
        const v_b = _a406[_i408];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k409[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) !== v_k))) continue;
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
  const _g435: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h434 = ((1 << 3));
  const _h442 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _k443 = sideKept.board(sp);
  const _a425 = sp.points;
  for (let _i426 = 0; _i426 < _a425.length; _i426++) {
    const v_k = _a425[_i426];
    const _h427 = clueAt(cl.n, v_k);
    if (!(((_h427 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a428 = sp.pointCells[v_k];
    for (let _i429 = 0; _i429 < _a428.length; _i429++) {
      const v_a = _a428[_i429];
      const _a430 = sp.pointCells[v_k];
      const _n431 = _i429;
      R3:
      for (let _i432 = 0; _i432 < _n431; _i432++) {
        const v_b = _a430[_i432];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L433: {
          const v_e = sp.edgeOf(v_b, v_a);
          const _m254_2 = b.made[2];
          if (!((b.edgeCand(v_e) !== _h434))) break L433;
          _g435.length = 0;
          G436: {
            const _a439 = sp.pointCells[v_k];
            for (let _i440 = 0; _i440 < _a439.length; _i440++) {
              const v_c = _a439[_i440];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g435.push(v_c);
            }
          }
          const v_R = _g435;
          L441: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h442))) break L441;
            for (let v_i = 1; v_i <= 2; v_i++) {
              if (!((((_k443[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h445 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                if (!((((_k443[v_f] ?? side(sp, v_f))[(v_j - 1)] ?? -1) === v_k))) continue;
                if (b.made[2] !== _m254_2) {
                  if (!((b.edgeCand(v_e) !== ((1 << 3))))) { continue R3; }
                  if (!((b.edgeCand(v_f) !== ((1 << 1) | (1 << 2) | (1 << 3))))) { continue R3; }
                }
                facts.length = 0;
                changed = false;
                let _c444: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c444) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c444 = true;
                }
                let _c447: boolean = _c444;
                if (_c447) {
                  let _c446: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c446) {
                    if ((b.edgeCand(v_e) >> _h445) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h445); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h445); }
                    _c446 = true;
                  }
                  _c447 = _c446;
                }
                if (!(_c447)) return -1;
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
  const _g145: number[] = [];
  G146: {
    const _a149 = sp.pointCells[v_k];
    for (let _i150 = 0; _i150 < _a149.length; _i150++) {
      const v_c = _a149[_i150];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g145.push(v_c);
    }
  }
  const _made = _g145;
  _kept[v_k] = _made;
  return _made;
}

const linesKept = keptStore<number>();

/** `lines(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lines(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = linesKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g153 = 0;
  G154: {
    const _a155 = sp.pointCells[v_k];
    for (let _i156 = 0; _i156 < _a155.length; _i156++) {
      const v_c = _a155[_i156];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
      _g153++;
    }
  }
  const _made = _g153;
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
  let _g292 = 0;
  G293: {
    const _a294 = sp.pointCells[v_q];
    for (let _i295 = 0; _i295 < _a294.length; _i295++) {
      const v_c = _a294[_i295];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_q)))) continue;
      _g292++;
    }
  }
  return (clueAt(cl.n, v_q) - _g292);
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm2(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) < 0))) return 0;
  const _g296: number[] = [];
  G297: {
    const _a300 = sp.pointCells[v_q];
    for (let _i301 = 0; _i301 < _a300.length; _i301++) {
      const v_c = _a300[_i301];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g296.push(v_c);
    }
  }
  return _g296.length;
}

const sideKept = keptStore<readonly number[]>();
let sideOn: object | null = null;
let sideAt: Kept<readonly number[]> = [];

/** `side(e)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function side(sp: GridSpace, v_e: number): readonly number[] {
  if (sp !== sideOn) {
    sideAt = sideKept.board(sp);
    sideOn = sp;
  }
  const _kept: Kept<readonly number[]> = sideAt;
  if (_kept[v_e] !== undefined) return _kept[v_e];
  const _g367: number[] = [];
  G368: {
    const _a371 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
    for (let _i372 = 0; _i372 < _a371.length; _i372++) {
      const v_k = _a371[_i372];
      if (!((sp.cellPoints[sp.edgeEnds[2 * v_e + 1]].includes(v_k)))) continue;
      _g367.push(v_k);
    }
  }
  const _made = _g367;
  _kept[v_e] = _made;
  return _made;
}
