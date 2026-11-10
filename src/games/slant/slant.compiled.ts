// Compiled by `npm run describe` from src/games/slant/slant.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE_EDGE, before, clueAt, edgeGroups, freshBinding, keptStore, linkedSum, linkedWith, pointGroups, rangeMask, sameSet, slash, staleChecking, through, type Kept } from "../../engine/describe-runtime.ts";

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
  const _links = pointGroups(sp, (_x559: number) => (g[_x559] || -1));
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q553 = true;
  Q554: {
    const _a555 = sp.points;
    for (let _i556 = 0; _i556 < _a555.length; _i556++) {
      const v_k = _a555[_i556];
      let _q557 = false;
      Q558: {
        const _a560 = _links.of(v_k);
        for (let _i561 = 0; _i561 < _a560.length; _i561++) {
          const v_q = _a560[_i561];
          if ((sp.pointCells[v_q].length < 4)) {
            _q557 = true;
            break Q558;
          }
        }
      }
      if (!(_q557)) {
        _q553 = false;
        break Q554;
      }
    }
  }
  if (!(_q553)) return false;
  for (let _k562 = 0; _k562 < cl.n.at.length; _k562++) {
    const _at563 = cl.n.at[_k562];
    const _v564 = cl.n.v[_k562];
    let _g565 = 0;
    G566: {
      const _a567 = sp.pointCells[_at563];
      for (let _i568 = 0; _i568 < _a567.length; _i568++) {
        const v_c = _a567[_i568];
        const _h569 = (g[v_c] || -1);
        if (!((_h569 === slash(sp, v_c, _at563)))) continue;
        _g565++;
      }
    }
    if (!((_g565 === _v564))) return false;
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
    const _h36 = v_O.length;
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
    if (import.meta.env.DEV && staleChecking) {
      const _g26: number[] = [];
      G27: {
        const _a30 = sp.pointCells[v_k];
        for (let _i31 = 0; _i31 < _a30.length; _i31++) {
          const v_c = _a30[_i31];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g26.push(v_c);
        }
      }
      let _g32 = 0;
      G33: {
        const _a34 = sp.pointCells[v_k];
        for (let _i35 = 0; _i35 < _a34.length; _i35++) {
          const v_c = _a34[_i35];
          if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
          _g32++;
        }
      }
      freshBinding("clue", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_O, _g26), (v_left === (clueAt(cl.n, v_k) - _g32))], ["k in", "where of k", "O =", "left ="]);
    }
    facts.length = 0;
    changed = false;
    let _c43: boolean = ((v_left >= 0) && (v_left <= _h36));
    if (_c43) {
      let _c42: boolean = !((v_left === 0));
      if (!_c42) {
        let _q37 = true;
        Q38: {
          const _a39 = v_O;
          for (let _i40 = 0; _i40 < _a39.length; _i40++) {
            const v_c = _a39[_i40];
            const _t41 = (3 - slash(sp, v_c, v_k));
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t41); changed = true; } else facts.push(PLACE, v_c, _t41); }
            if (!(true)) {
              _q37 = false;
              break Q38;
            }
          }
        }
        _c42 = _q37;
      }
      _c43 = _c42;
    }
    let _c50: boolean = _c43;
    if (_c50) {
      let _c49: boolean = !((v_left === _h36));
      if (!_c49) {
        let _q44 = true;
        Q45: {
          const _a46 = v_O;
          for (let _i47 = 0; _i47 < _a46.length; _i47++) {
            const v_c = _a46[_i47];
            const _t48 = slash(sp, v_c, v_k);
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t48); changed = true; } else facts.push(PLACE, v_c, _t48); }
            if (!(true)) {
              _q44 = false;
              break Q45;
            }
          }
        }
        _c49 = _q44;
      }
      _c50 = _c49;
    }
    if (!(_c50)) return -1;
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
  const _a60 = sp.cells;
  R1:
  for (let _i61 = 0; _i61 < _a60.length; _i61++) {
    const v_c = _a60[_i61];
    const _m27_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _q62 = false;
      Q63: {
        const _a64 = sp.cellPoints[v_c];
        for (let _i65 = 0; _i65 < _a64.length; _i65++) {
          const v_k = _a64[_i65];
          if (!((slash(sp, v_c, v_k) === v_d))) continue;
          const _a66 = sp.cellPoints[v_c];
          const _n67 = _i65;
          for (let _i68 = 0; _i68 < _n67; _i68++) {
            const v_q = _a66[_i68];
            if (!((slash(sp, v_c, v_q) === v_d))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q62 = true;
              break Q63;
            }
          }
        }
      }
      if (!(_q62)) continue;
      if (b.made[0] !== _m27_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _q69 = false;
        Q70: {
          const _a71 = sp.cellPoints[v_c];
          for (let _i72 = 0; _i72 < _a71.length; _i72++) {
            const v_k = _a71[_i72];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a73 = sp.cellPoints[v_c];
            const _n74 = _i72;
            for (let _i75 = 0; _i75 < _n74; _i75++) {
              const v_q = _a73[_i75];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              if (linkedWith(sp, b, v_q, v_k)) {
                _q69 = true;
                break Q70;
              }
            }
          }
        }
        freshBinding("loop", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), ((1 <= v_d) && (v_d <= 2)), _q69], ["c in", "where of c", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      const _t76 = (3 - v_d);
      let _q77 = false;
      Q78: {
        const _a79 = sp.cellPoints[v_c];
        for (let _i80 = 0; _i80 < _a79.length; _i80++) {
          const v_k = _a79[_i80];
          if (!((slash(sp, v_c, v_k) === _t76))) continue;
          const _a81 = sp.cellPoints[v_c];
          const _n82 = _i80;
          for (let _i83 = 0; _i83 < _n82; _i83++) {
            const v_q = _a81[_i83];
            if (!((slash(sp, v_c, v_q) === _t76))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q77 = true;
              break Q78;
            }
          }
        }
      }
      let _c85: boolean = !(_q77);
      if (_c85) {
        const _t84 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t84); changed = true; } else facts.push(PLACE, v_c, _t84); }
        _c85 = true;
      }
      if (!(_c85)) return -1;
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
  const _g128: number[] = [];
  const _g138: number[] = [];
  const _g152: number[] = [];
  const _g174: number[] = [];
  const _g180: number[] = [];
  const facts = pairFacts;
  let fired = 0;
  let changed = false;
  const _h134 = ((1 << 3));
  const _m49_2 = b.made[2];
  _g128.length = 0;
  G129: {
    const _a132 = sp.edges;
    for (let _i133 = 0; _i133 < _a132.length; _i133++) {
      const v_e = _a132[_i133];
      if (!((b.edgeCand(v_e) === _h134))) continue;
      _g128.push(v_e);
    }
  }
  const v_A = _g128;
  const _eg151 = edgeGroups(sp, v_A);
  const _a135 = sp.points;
  R1:
  for (let _i136 = 0; _i136 < _a135.length; _i136++) {
    const v_k = _a135[_i136];
    const _h137 = clueAt(cl.n, v_k);
    if (!((_h137 >= 0))) continue;
    const _m58_0 = b.made[0];
    _g138.length = 0;
    G139: {
      const _a142 = sp.pointCells[v_k];
      for (let _i143 = 0; _i143 < _a142.length; _i143++) {
        const v_c = _a142[_i143];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g138.push(v_c);
      }
    }
    L144: {
      const v_P = _g138;
      const _h145 = v_P.length;
      if (!((_h145 > 2))) break L144;
      const _a146 = v_P;
      for (let _i147 = 0; _i147 < _a146.length; _i147++) {
        const v_a = _a146[_i147];
        const _a148 = v_P;
        const _n149 = _i147;
        for (let _i150 = 0; _i150 < _n149; _i150++) {
          const v_b = _a148[_i150];
          if (!(((sp.adj4[v_a].includes(v_b)) && (_eg151.of(v_b) === _eg151.of(v_a))))) continue;
          _g152.length = 0;
          G153: {
            const _a168 = open(b, sp, v_k);
            for (let _i169 = 0; _i169 < _a168.length; _i169++) {
              const v_c = _a168[_i169];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g152.push(v_c);
            }
          }
          const v_O = _g152;
          const _h220 = v_O.length;
          const v_left = ((_h137 - lines(b, sp, v_k)) - 1);
          if (b.made[0] !== _m58_0 || b.made[2] !== _m49_2) {
            _g174.length = 0;
            G175: {
              const _a178 = sp.edges;
              for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                const v_e = _a178[_i179];
                if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                _g174.push(v_e);
              }
            }
            if (!(sameSet(v_A, _g174))) { return fired; }
            _g180.length = 0;
            G181: {
              const _a184 = sp.pointCells[v_k];
              for (let _i185 = 0; _i185 < _a184.length; _i185++) {
                const v_c = _a184[_i185];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g180.push(v_c);
              }
            }
            if (!(sameSet(v_P, _g180))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g186: number[] = [];
            G187: {
              const _a190 = sp.edges;
              for (let _i191 = 0; _i191 < _a190.length; _i191++) {
                const v_e = _a190[_i191];
                if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                _g186.push(v_e);
              }
            }
            const _g192: number[] = [];
            G193: {
              const _a196 = sp.pointCells[v_k];
              for (let _i197 = 0; _i197 < _a196.length; _i197++) {
                const v_c = _a196[_i197];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g192.push(v_c);
              }
            }
            const _g198: number[] = [];
            G199: {
              const _g208: number[] = [];
              G209: {
                const _a212 = sp.pointCells[v_k];
                for (let _i213 = 0; _i213 < _a212.length; _i213++) {
                  const v_c = _a212[_i213];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g208.push(v_c);
                }
              }
              const _a214 = _g208;
              for (let _i215 = 0; _i215 < _a214.length; _i215++) {
                const v_c = _a214[_i215];
                if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                _g198.push(v_c);
              }
            }
            let _g216 = 0;
            G217: {
              const _a218 = sp.pointCells[v_k];
              for (let _i219 = 0; _i219 < _a218.length; _i219++) {
                const v_c = _a218[_i219];
                if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
                _g216++;
              }
            }
            freshBinding("pair", [sameSet(v_A, _g186), (sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_P, _g192), (v_P.length > 2), (v_P.includes(v_a)), (before(v_a, v_P).includes(v_b)), ((sp.adj4[v_a].includes(v_b)) && (through(sp, v_a, v_A).includes(v_b))), sameSet(v_O, _g198), (v_left === ((clueAt(cl.n, v_k) - _g216) - 1))], ["A =", "k in", "where of k", "P =", "where of P", "a in", "b in", "where of b", "O =", "left ="]);
          }
          facts.length = 0;
          changed = false;
          let _c227: boolean = ((v_left >= 0) && (v_left <= _h220));
          if (_c227) {
            let _c226: boolean = !((v_left === 0));
            if (!_c226) {
              let _q221 = true;
              Q222: {
                const _a223 = v_O;
                for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                  const v_c = _a223[_i224];
                  const _t225 = (3 - slash(sp, v_c, v_k));
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t225); changed = true; } else facts.push(PLACE, v_c, _t225); }
                  if (!(true)) {
                    _q221 = false;
                    break Q222;
                  }
                }
              }
              _c226 = _q221;
            }
            _c227 = _c226;
          }
          let _c234: boolean = _c227;
          if (_c234) {
            let _c233: boolean = !((v_left === _h220));
            if (!_c233) {
              let _q228 = true;
              Q229: {
                const _a230 = v_O;
                for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                  const v_c = _a230[_i231];
                  const _t232 = slash(sp, v_c, v_k);
                  if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t232); changed = true; } else facts.push(PLACE, v_c, _t232); }
                  if (!(true)) {
                    _q228 = false;
                    break Q229;
                  }
                }
              }
              _c233 = _q228;
            }
            _c234 = _c233;
          }
          if (!(_c234)) return -1;
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
  const _g279: number[] = [];
  const _g289: number[] = [];
  const _g303: number[] = [];
  const _g319: number[] = [];
  const _g325: number[] = [];
  const facts = shareFacts;
  let fired = 0;
  let changed = false;
  const _h285 = ((1 << 3));
  const _m87_2 = b.made[2];
  _g279.length = 0;
  G280: {
    const _a283 = sp.edges;
    for (let _i284 = 0; _i284 < _a283.length; _i284++) {
      const v_e = _a283[_i284];
      if (!((b.edgeCand(v_e) === _h285))) continue;
      _g279.push(v_e);
    }
  }
  const v_A = _g279;
  const _eg317 = edgeGroups(sp, v_A);
  const _a286 = sp.points;
  R1:
  for (let _i287 = 0; _i287 < _a286.length; _i287++) {
    const v_k = _a286[_i287];
    const _h288 = clueAt(cl.n, v_k);
    if (!((_h288 >= 0))) continue;
    const _m96_0 = b.made[0];
    _g289.length = 0;
    G290: {
      const _a293 = sp.pointCells[v_k];
      for (let _i294 = 0; _i294 < _a293.length; _i294++) {
        const v_c = _a293[_i294];
        const _h295 = (b.grid[v_c] !== 0);
        if (!(!(_h295))) continue;
        _g289.push(v_c);
      }
    }
    L296: {
      const v_P = _g289;
      const _h297 = v_P.length;
      if (!(((_h297 === 2) || (_h297 === 4)))) break L296;
      const _a298 = v_P;
      for (let _i299 = 0; _i299 < _a298.length; _i299++) {
        const v_a = _a298[_i299];
        const _a300 = v_P;
        const _n301 = _i299;
        for (let _i302 = 0; _i302 < _n301; _i302++) {
          const v_b = _a300[_i302];
          if (!((sp.adj4[v_a].includes(v_b)))) continue;
          _g303.length = 0;
          G304: {
            const _a313 = open(b, sp, v_k);
            for (let _i314 = 0; _i314 < _a313.length; _i314++) {
              const v_c = _a313[_i314];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g303.push(v_c);
            }
          }
          L315: {
            const v_R = _g303;
            const _h316 = v_R.length;
            if (!(((_h316 === 0) || (((_h316 === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (_eg317.of((v_R[1] ?? -1)) === _eg317.of((v_R[0] ?? -1))))))) break L315;
            L318: {
              const v_left = (_h288 - lines(b, sp, v_k));
              if (!(((2 * v_left) === (2 + _h316)))) break L318;
              if (b.made[0] !== _m96_0 || b.made[2] !== _m87_2) {
                _g319.length = 0;
                G320: {
                  const _a323 = sp.edges;
                  for (let _i324 = 0; _i324 < _a323.length; _i324++) {
                    const v_e = _a323[_i324];
                    if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                    _g319.push(v_e);
                  }
                }
                if (!(sameSet(v_A, _g319))) { return fired; }
                _g325.length = 0;
                G326: {
                  const _a329 = sp.pointCells[v_k];
                  for (let _i330 = 0; _i330 < _a329.length; _i330++) {
                    const v_c = _a329[_i330];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g325.push(v_c);
                  }
                }
                if (!(sameSet(v_P, _g325))) { continue R1; }
              }
              if (import.meta.env.DEV && staleChecking) {
                const _g331: number[] = [];
                G332: {
                  const _a335 = sp.edges;
                  for (let _i336 = 0; _i336 < _a335.length; _i336++) {
                    const v_e = _a335[_i336];
                    if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
                    _g331.push(v_e);
                  }
                }
                const _g337: number[] = [];
                G338: {
                  const _a341 = sp.pointCells[v_k];
                  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
                    const v_c = _a341[_i342];
                    if (!(!((b.grid[v_c] !== 0)))) continue;
                    _g337.push(v_c);
                  }
                }
                const _g343: number[] = [];
                G344: {
                  const _g353: number[] = [];
                  G354: {
                    const _a357 = sp.pointCells[v_k];
                    for (let _i358 = 0; _i358 < _a357.length; _i358++) {
                      const v_c = _a357[_i358];
                      if (!(!((b.grid[v_c] !== 0)))) continue;
                      _g353.push(v_c);
                    }
                  }
                  const _a359 = _g353;
                  for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                    const v_c = _a359[_i360];
                    if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                    _g343.push(v_c);
                  }
                }
                let _g361 = 0;
                G362: {
                  const _a363 = sp.pointCells[v_k];
                  for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                    const v_c = _a363[_i364];
                    if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
                    _g361++;
                  }
                }
                freshBinding("share", [sameSet(v_A, _g331), (sp.points.includes(v_k)), (clueAt(cl.n, v_k) >= 0), sameSet(v_P, _g337), ((v_P.length === 2) || (v_P.length === 4)), (v_P.includes(v_a)), (before(v_a, v_P).includes(v_b)), (sp.adj4[v_a].includes(v_b)), sameSet(v_R, _g343), ((v_R.length === 0) || (((v_R.length === 2) && (sp.adj4[(v_R[0] ?? -1)].includes((v_R[1] ?? -1)))) && (through(sp, (v_R[0] ?? -1), v_A).includes((v_R[1] ?? -1))))), (v_left === (clueAt(cl.n, v_k) - _g361)), ((2 * v_left) === (2 + v_R.length))], ["A =", "k in", "where of k", "P =", "where of P", "a in", "b in", "where of b", "R =", "where of R", "left =", "where of left"]);
              }
              facts.length = 0;
              changed = false;
              const _t365 = sp.edgeOf(v_b, v_a);
              if ((b.edgeCand(_t365) >> 1) & 1) { if (fire === null) { b.edgeStrikeAt(_t365, 1); changed = true; } else facts.push(STRIKE_EDGE, _t365, 1); }
              let _c367: boolean = true;
              if (_c367) {
                const _t366 = sp.edgeOf(v_b, v_a);
                if ((b.edgeCand(_t366) >> 2) & 1) { if (fire === null) { b.edgeStrikeAt(_t366, 2); changed = true; } else facts.push(STRIKE_EDGE, _t366, 2); }
                _c367 = true;
              }
              if (!(_c367)) return -1;
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
  const _a388 = sp.cells;
  R1:
  for (let _i389 = 0; _i389 < _a388.length; _i389++) {
    const v_c = _a388[_i389];
    const _m126_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    for (let v_d = 1; v_d <= 2; v_d++) {
      let _c398: boolean = !((b.grid[v_c] !== 0));
      if (_c398) {
        let _q390 = false;
        Q391: {
          const _a392 = sp.cellPoints[v_c];
          for (let _i393 = 0; _i393 < _a392.length; _i393++) {
            const v_k = _a392[_i393];
            if (!((slash(sp, v_c, v_k) === v_d))) continue;
            const _a394 = sp.cellPoints[v_c];
            const _n395 = _i393;
            for (let _i396 = 0; _i396 < _n395; _i396++) {
              const v_q = _a394[_i396];
              if (!((slash(sp, v_c, v_q) === v_d))) continue;
              let _c397: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c397) {
                _c397 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c397) {
                _q390 = true;
                break Q391;
              }
            }
          }
        }
        _c398 = _q390;
      }
      if (!(_c398)) continue;
      if (b.made[0] !== _m126_0) {
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c406: boolean = !((b.grid[v_c] !== 0));
        if (_c406) {
          let _q399 = false;
          Q400: {
            const _a401 = sp.cellPoints[v_c];
            for (let _i402 = 0; _i402 < _a401.length; _i402++) {
              const v_k = _a401[_i402];
              if (!((slash(sp, v_c, v_k) === v_d))) continue;
              const _a403 = sp.cellPoints[v_c];
              const _n404 = _i402;
              for (let _i405 = 0; _i405 < _n404; _i405++) {
                const v_q = _a403[_i405];
                if (!((slash(sp, v_c, v_q) === v_d))) continue;
                if ((((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1)) && ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1)))) {
                  _q399 = true;
                  break Q400;
                }
              }
            }
          }
          _c406 = _q399;
        }
        freshBinding("deadEnd", [(sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), ((1 <= v_d) && (v_d <= 2)), _c406], ["c in", "where of c", "d in", "where of d"]);
      }
      facts.length = 0;
      changed = false;
      const _t407 = (3 - v_d);
      let _q408 = false;
      Q409: {
        const _a410 = sp.cellPoints[v_c];
        for (let _i411 = 0; _i411 < _a410.length; _i411++) {
          const v_k = _a410[_i411];
          if (!((slash(sp, v_c, v_k) === _t407))) continue;
          const _a412 = sp.cellPoints[v_c];
          const _n413 = _i411;
          for (let _i414 = 0; _i414 < _n413; _i414++) {
            const v_q = _a412[_i414];
            if (!((slash(sp, v_c, v_q) === _t407))) continue;
            if (linkedWith(sp, b, v_q, v_k)) {
              _q408 = true;
              break Q409;
            }
          }
        }
      }
      let _c424: boolean = !(_q408);
      if (_c424) {
        const _t415 = (3 - v_d);
        let _q416 = false;
        Q417: {
          const _a418 = sp.cellPoints[v_c];
          for (let _i419 = 0; _i419 < _a418.length; _i419++) {
            const v_k = _a418[_i419];
            if (!((slash(sp, v_c, v_k) === _t415))) continue;
            const _a420 = sp.cellPoints[v_c];
            const _n421 = _i419;
            for (let _i422 = 0; _i422 < _n421; _i422++) {
              const v_q = _a420[_i422];
              if (!((slash(sp, v_c, v_q) === _t415))) continue;
              let _c423: boolean = ((linkedSum(sp, b, null, linkTerm0, v_k) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_k) + linkedSum(sp, b, cl, linkTerm2, v_k)) <= 1));
              if (_c423) {
                _c423 = ((linkedSum(sp, b, null, linkTerm0, v_q) === 0) && ((linkedSum(sp, b, cl, linkTerm1, v_q) + linkedSum(sp, b, cl, linkTerm2, v_q)) <= 1));
              }
              if (_c423) {
                _q416 = true;
                break Q417;
              }
            }
          }
        }
        _c424 = !(_q416);
      }
      let _c426: boolean = _c424;
      if (_c426) {
        const _t425 = (3 - v_d);
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t425); changed = true; } else facts.push(PLACE, v_c, _t425); }
        _c426 = true;
      }
      if (!(_c426)) return -1;
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
  const _g437: number[] = [];
  const _g449: number[] = [];
  const facts = sameFacts;
  let fired = 0;
  let changed = false;
  const _h443 = ((1 << 3));
  const _m157_2 = b.made[2];
  _g437.length = 0;
  G438: {
    const _a441 = sp.edges;
    for (let _i442 = 0; _i442 < _a441.length; _i442++) {
      const v_e = _a441[_i442];
      if (!((b.edgeCand(v_e) === _h443))) continue;
      _g437.push(v_e);
    }
  }
  const v_A = _g437;
  const _eg446 = edgeGroups(sp, v_A);
  const _a444 = sp.cells;
  R1:
  for (let _i445 = 0; _i445 < _a444.length; _i445++) {
    const v_c = _a444[_i445];
    const _m163_0 = b.made[0];
    if (!(!((b.grid[v_c] !== 0)))) continue;
    const _a447 = _eg446.of(v_c);
    for (let _i448 = 0; _i448 < _a447.length; _i448++) {
      const v_q = _a447[_i448];
      if (!((b.grid[v_q] !== 0))) continue;
      if (b.made[0] !== _m163_0 || b.made[2] !== _m157_2) {
        _g449.length = 0;
        G450: {
          const _a453 = sp.edges;
          for (let _i454 = 0; _i454 < _a453.length; _i454++) {
            const v_e = _a453[_i454];
            if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
            _g449.push(v_e);
          }
        }
        if (!(sameSet(v_A, _g449))) { return fired; }
        if (!(!((b.grid[v_c] !== 0)))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g455: number[] = [];
        G456: {
          const _a459 = sp.edges;
          for (let _i460 = 0; _i460 < _a459.length; _i460++) {
            const v_e = _a459[_i460];
            if (!((b.edgeCand(v_e) === ((1 << 3))))) continue;
            _g455.push(v_e);
          }
        }
        freshBinding("same", [sameSet(v_A, _g455), (sp.cells.includes(v_c)), !((b.grid[v_c] !== 0)), (through(sp, v_c, v_A).includes(v_q)), (b.grid[v_q] !== 0)], ["A =", "c in", "where of c", "q in", "where of q"]);
      }
      facts.length = 0;
      changed = false;
      const _t461 = (b.grid[v_q] || -1);
      if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, _t461); changed = true; } else facts.push(PLACE, v_c, _t461); }
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
  const _h472 = (b.grid[v_c] !== 0);
  const _k475 = sideKept.board(sp);
  const _h476 = (b.grid[v_c] || -1);
  if (!(_h472)) return 0;
  const _a473 = sp.adj4[v_c];
  for (let _i474 = 0; _i474 < _a473.length; _i474++) {
    const v_a = _a473[_i474];
    const v_e = sp.adj4Edges[v_c][_i474];
    const v_S = (_k475[v_e] ?? side(sp, v_e));
    for (let v_i = 1; v_i <= 2; v_i++) {
      if (!((_h476 !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1))))) continue;
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("drawn", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (sp.adj4[v_c].includes(v_a)), (v_e === sp.adj4Edges[v_c][_i474]), sameSet(v_S, side(sp, v_e)), ((1 <= v_i) && (v_i <= 2)), ((b.grid[v_c] || -1) !== slash(sp, v_c, (v_S[(v_i - 1)] ?? -1)))], ["c in", "where of c", "a in", "e =", "S =", "i in", "where of i"]);
      }
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
  const _k492 = sideKept.board(sp);
  const _a484 = sp.points;
  for (let _i485 = 0; _i485 < _a484.length; _i485++) {
    const v_k = _a484[_i485];
    const _h486 = clueAt(cl.n, v_k);
    if (!((_h486 === 1))) continue;
    const _a487 = sp.pointCells[v_k];
    for (let _i488 = 0; _i488 < _a487.length; _i488++) {
      const v_a = _a487[_i488];
      const _a489 = sp.pointCells[v_k];
      const _n490 = _i488;
      for (let _i491 = 0; _i491 < _n490; _i491++) {
        const v_b = _a489[_i491];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k492[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
          if (import.meta.env.DEV && staleChecking) {
            freshBinding("one", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) === 1), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "i in", "where of i"]);
          }
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
  const _k508 = sideKept.board(sp);
  const _a500 = sp.points;
  for (let _i501 = 0; _i501 < _a500.length; _i501++) {
    const v_k = _a500[_i501];
    const _h502 = clueAt(cl.n, v_k);
    if (!((_h502 === 3))) continue;
    const _a503 = sp.pointCells[v_k];
    for (let _i504 = 0; _i504 < _a503.length; _i504++) {
      const v_a = _a503[_i504];
      const _a505 = sp.pointCells[v_k];
      const _n506 = _i504;
      for (let _i507 = 0; _i507 < _n506; _i507++) {
        const v_b = _a505[_i507];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        const v_e = sp.edgeOf(v_b, v_a);
        for (let v_i = 1; v_i <= 2; v_i++) {
          if (!((((_k508[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) !== v_k))) continue;
          if (import.meta.env.DEV && staleChecking) {
            freshBinding("three", [(sp.points.includes(v_k)), (clueAt(cl.n, v_k) === 3), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) !== v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "i in", "where of i"]);
          }
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
  const _g534: number[] = [];
  const facts = twoFacts;
  let fired = 0;
  let changed = false;
  const _h533 = ((1 << 3));
  const _h541 = ((1 << 1) | (1 << 2) | (1 << 3));
  const _k542 = sideKept.board(sp);
  const _a524 = sp.points;
  for (let _i525 = 0; _i525 < _a524.length; _i525++) {
    const v_k = _a524[_i525];
    const _h526 = clueAt(cl.n, v_k);
    if (!(((_h526 === 2) && (sp.pointCells[v_k].length === 4)))) continue;
    const _a527 = sp.pointCells[v_k];
    for (let _i528 = 0; _i528 < _a527.length; _i528++) {
      const v_a = _a527[_i528];
      const _a529 = sp.pointCells[v_k];
      const _n530 = _i528;
      R3:
      for (let _i531 = 0; _i531 < _n530; _i531++) {
        const v_b = _a529[_i531];
        if (!((sp.adj4[v_a].includes(v_b)))) continue;
        L532: {
          const v_e = sp.edgeOf(v_b, v_a);
          const _m254_2 = b.made[2];
          if (!((b.edgeCand(v_e) !== _h533))) break L532;
          _g534.length = 0;
          G535: {
            const _a538 = sp.pointCells[v_k];
            for (let _i539 = 0; _i539 < _a538.length; _i539++) {
              const v_c = _a538[_i539];
              if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
              _g534.push(v_c);
            }
          }
          const v_R = _g534;
          L540: {
            const v_f = sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1));
            if (!((b.edgeCand(v_f) !== _h541))) break L540;
            for (let v_i = 1; v_i <= 2; v_i++) {
              if (!((((_k542[v_e] ?? side(sp, v_e))[(v_i - 1)] ?? -1) === v_k))) continue;
              const _h550 = (3 - v_i);
              for (let v_j = 1; v_j <= 2; v_j++) {
                if (!((((_k542[v_f] ?? side(sp, v_f))[(v_j - 1)] ?? -1) === v_k))) continue;
                if (b.made[2] !== _m254_2) {
                  if (!((b.edgeCand(v_e) !== ((1 << 3))))) { continue R3; }
                  if (!((b.edgeCand(v_f) !== ((1 << 1) | (1 << 2) | (1 << 3))))) { continue R3; }
                }
                if (import.meta.env.DEV && staleChecking) {
                  const _g543: number[] = [];
                  G544: {
                    const _a547 = sp.pointCells[v_k];
                    for (let _i548 = 0; _i548 < _a547.length; _i548++) {
                      const v_c = _a547[_i548];
                      if (!(((v_c !== v_a) && (v_c !== v_b)))) continue;
                      _g543.push(v_c);
                    }
                  }
                  freshBinding("two", [(sp.points.includes(v_k)), ((clueAt(cl.n, v_k) === 2) && (sp.pointCells[v_k].length === 4)), (sp.pointCells[v_k].includes(v_a)), (before(v_a, sp.pointCells[v_k]).includes(v_b)), (sp.adj4[v_a].includes(v_b)), (v_e === sp.edgeOf(v_b, v_a)), (b.edgeCand(v_e) !== ((1 << 3))), sameSet(v_R, _g543), (v_f === sp.edgeOf((v_R[0] ?? -1), (v_R[1] ?? -1))), (b.edgeCand(v_f) !== ((1 << 1) | (1 << 2) | (1 << 3))), ((1 <= v_i) && (v_i <= 2)), ((side(sp, v_e)[(v_i - 1)] ?? -1) === v_k), ((1 <= v_j) && (v_j <= 2)), ((side(sp, v_f)[(v_j - 1)] ?? -1) === v_k)], ["k in", "where of k", "a in", "b in", "where of b", "e =", "where of e", "R =", "f =", "where of f", "i in", "where of i", "j in", "where of j"]);
                }
                facts.length = 0;
                changed = false;
                let _c549: boolean = !(!(((b.edgeCand(v_f) >> (3 - v_j)) & 1) !== 0));
                if (!_c549) {
                  if ((b.edgeCand(v_e) >> v_i) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, v_i); changed = true; } else facts.push(STRIKE_EDGE, v_e, v_i); }
                  _c549 = true;
                }
                let _c552: boolean = _c549;
                if (_c552) {
                  let _c551: boolean = !(!(((b.edgeCand(v_f) >> v_j) & 1) !== 0));
                  if (!_c551) {
                    if ((b.edgeCand(v_e) >> _h550) & 1) { if (fire === null) { b.edgeStrikeAt(v_e, _h550); changed = true; } else facts.push(STRIKE_EDGE, v_e, _h550); }
                    _c551 = true;
                  }
                  _c552 = _c551;
                }
                if (!(_c552)) return -1;
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
  const _g162: number[] = [];
  G163: {
    const _a166 = sp.pointCells[v_k];
    for (let _i167 = 0; _i167 < _a166.length; _i167++) {
      const v_c = _a166[_i167];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g162.push(v_c);
    }
  }
  const _made = _g162;
  _kept[v_k] = _made;
  return _made;
}

const linesKept = keptStore<number>();

/** `lines(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lines(b: Marks, sp: GridSpace, v_k: number): number {
  const _kept: Kept<number> = linesKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _g170 = 0;
  G171: {
    const _a172 = sp.pointCells[v_k];
    for (let _i173 = 0; _i173 < _a172.length; _i173++) {
      const v_c = _a172[_i173];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_k)))) continue;
      _g170++;
    }
  }
  const _made = _g170;
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
  let _g377 = 0;
  G378: {
    const _a379 = sp.pointCells[v_q];
    for (let _i380 = 0; _i380 < _a379.length; _i380++) {
      const v_c = _a379[_i380];
      if (!(((b.grid[v_c] || -1) === slash(sp, v_c, v_q)))) continue;
      _g377++;
    }
  }
  return (clueAt(cl.n, v_q) - _g377);
}

/** What each point of a group adds to a sum kept over the group. */
function linkTerm2(b: Marks, sp: GridSpace, cl: Dealt, v_q: number): number {
  if (!((clueAt(cl.n, v_q) < 0))) return 0;
  const _g381: number[] = [];
  G382: {
    const _a385 = sp.pointCells[v_q];
    for (let _i386 = 0; _i386 < _a385.length; _i386++) {
      const v_c = _a385[_i386];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g381.push(v_c);
    }
  }
  return _g381.length;
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
  const _g466: number[] = [];
  G467: {
    const _a470 = sp.cellPoints[sp.edgeEnds[2 * v_e]];
    for (let _i471 = 0; _i471 < _a470.length; _i471++) {
      const v_k = _a470[_i471];
      if (!((sp.cellPoints[sp.edgeEnds[2 * v_e + 1]].includes(v_k)))) continue;
      _g466.push(v_k);
    }
  }
  const _made = _g466;
  _kept[v_e] = _made;
  return _made;
}
