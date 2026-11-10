// Compiled by `npm run describe` from src/games/clusters/clusters.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, freshBinding, keptStore, rangeMask, sameSet, setOf, staleChecking, type Kept, union, within } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  dot: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "broken" | "refute" | "countFull" | "countShort";

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
  { id: "broken", tier: 0 },
  { id: "refute", tier: 0 },
  { id: "countFull", tier: 1 },
  { id: "countShort", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q601 = true;
  Q602: {
    const _a603 = cluesValued(cl.dot, -1);
    for (let _i604 = 0; _i604 < _a603.length; _i604++) {
      const v_c = _a603[_i604];
      const _h605 = clueAt(cl.dot, v_c);
      if (!((_h605 === -1))) continue;
      const _h611 = (g[v_c] || -1);
      let _g606 = 0;
      G607: {
        const _a608 = sp.adj4[v_c];
        for (let _i609 = 0; _i609 < _a608.length; _i609++) {
          const v_m = _a608[_i609];
          const _h610 = (g[v_m] || -1);
          if (!((_h610 === _h611))) continue;
          _g606++;
        }
      }
      if (!((_g606 >= 2))) {
        _q601 = false;
        break Q602;
      }
    }
  }
  if (!(_q601)) return false;
  for (let _k612 = 0; _k612 < cl.dot.at.length; _k612++) {
    const _at613 = cl.dot.at[_k612];
    const _v614 = cl.dot.v[_k612];
    let _c620: boolean = ((g[_at613] || -1) === _v614);
    if (_c620) {
      let _g615 = 0;
      G616: {
        const _a617 = sp.adj4[_at613];
        for (let _i618 = 0; _i618 < _a617.length; _i618++) {
          const v_m = _a617[_i618];
          const _h619 = (g[v_m] || -1);
          if (!((_h619 === _v614))) continue;
          _g615++;
        }
      }
      _c620 = (_g615 === 1);
    }
    if (!(_c620)) return false;
  }
  return true;
}

export interface BrokenBinding {
  c: number;
  r: number;
}

const brokenFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function broken(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BrokenBinding> | null): number {
  const facts = brokenFacts;
  let fired = 0;
  let changed = false;
  const _k26 = dotKept.board(cl);
  const _a8 = sp.cells;
  for (let _i9 = 0; _i9 < _a8.length; _i9++) {
    const v_c = _a8[_i9];
    const _h10 = (b.grid[v_c] !== 0);
    if (!(_h10)) continue;
    const _h11 = (b.grid[v_c] || -1);
    let _g12 = 0;
    G13: {
      const _a14 = sp.adj4[v_c];
      for (let _i15 = 0; _i15 < _a14.length; _i15++) {
        const v_m = _a14[_i15];
        const _h16 = (b.grid[v_m] !== 0);
        const _h17 = (b.grid[v_m] || -1);
        if (!(((v_m !== v_c) && (!(_h16) || (_h17 === _h11))))) continue;
        _g12++;
      }
    }
    const v_r = _g12;
    if (import.meta.env.DEV && staleChecking) {
      const _t18 = (b.grid[v_c] || -1);
      let _g19 = 0;
      G20: {
        const _a21 = sp.adj4[v_c];
        for (let _i22 = 0; _i22 < _a21.length; _i22++) {
          const v_m = _a21[_i22];
          if (!(((v_m !== v_c) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === _t18))))) continue;
          _g19++;
        }
      }
      freshBinding("broken", [(sp.cells.includes(v_c)), (b.grid[v_c] !== 0), (v_r === _g19)], ["c in", "where of c", "r ="]);
    }
    facts.length = 0;
    changed = false;
    let _c33: boolean = ((v_r >= 1) && (((_k26[v_c] ?? dot(sp, cl, v_c)) === 1) || (v_r >= 2)));
    if (_c33) {
      let _c32: boolean = ((_k26[v_c] ?? dot(sp, cl, v_c)) === 0);
      if (!_c32) {
        let _g27 = 0;
        G28: {
          const _a29 = sp.adj4[v_c];
          for (let _i30 = 0; _i30 < _a29.length; _i30++) {
            const v_m = _a29[_i30];
            const _h31 = (b.grid[v_m] || -1);
            if (!((_h31 === _h11))) continue;
            _g27++;
          }
        }
        _c32 = (_g27 <= 1);
      }
      _c33 = _c32;
    }
    if (!(_c33)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c, r: v_r }, facts)) return 1;
    }
  }
  return fired;
}

export interface RefuteBinding {
  x: number;
  d: number;
  n: number;
  e: number;
  r: number;
}

const refuteFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function refute(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<RefuteBinding> | null): number {
  const facts = refuteFacts;
  let fired = 0;
  let changed = false;
  const _k64 = dotKept.board(cl);
  const _a51 = sp.cells;
  R1:
  for (let _i52 = 0; _i52 < _a51.length; _i52++) {
    const v_x = _a51[_i52];
    const _m22_0 = b.made[0];
    if (!(!((b.grid[v_x] !== 0)))) continue;
    for (let _m53 = b.domain; _m53 !== 0; _m53 &= _m53 - 1) {
      const v_d = 31 - Math.clz32(_m53 & -_m53);
      const _h79 = (3 - v_d);
      const _h80 = _h79;
      const _a54 = union(setOf(v_x), sp.adj4[v_x]);
      R3:
      for (let _i55 = 0; _i55 < _a54.length; _i55++) {
        const v_n = _a54[_i55];
        if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) continue;
        const _h57 = (v_n === v_x);
        const _h58 = (v_n !== v_x);
        for (let _m56 = b.domain; _m56 !== 0; _m56 &= _m56 - 1) {
          const v_e = 31 - Math.clz32(_m56 & -_m56);
          if (!(((_h57 && (v_e === v_d)) || (_h58 && (v_e === (b.grid[v_n] || -1)))))) continue;
          let _g59 = 0;
          G60: {
            const _a61 = sp.adj4[v_n];
            for (let _i62 = 0; _i62 < _a61.length; _i62++) {
              const v_m = _a61[_i62];
              if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
              _g59++;
            }
          }
          L63: {
            const v_r = _g59;
            if (!((((_h57 || (v_e !== v_d)) && ((v_r < 1) || (((_k64[v_n] ?? dot(sp, cl, v_n)) === 0) && (v_r < 2)))) || (((_h58 && (v_e === v_d)) && ((_k64[v_n] ?? dot(sp, cl, v_n)) === 1)) && (same(b, sp, v_n) >= 1))))) break L63;
            if (b.made[0] !== _m22_0) {
              if (!(!((b.grid[v_x] !== 0)))) { continue R1; }
              if (!(((v_n === v_x) || (b.grid[v_n] !== 0)))) { continue R3; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _g69 = 0;
              G70: {
                const _a71 = sp.adj4[v_n];
                for (let _i72 = 0; _i72 < _a71.length; _i72++) {
                  const v_m = _a71[_i72];
                  if (!(((v_m !== v_x) && (!((b.grid[v_m] !== 0)) || ((b.grid[v_m] || -1) === v_e))))) continue;
                  _g69++;
                }
              }
              let _c78: boolean = (((v_n === v_x) || (v_e !== v_d)) && ((v_r < 1) || ((dot(sp, cl, v_n) === 0) && (v_r < 2))));
              if (!_c78) {
                let _c77: boolean = (((v_n !== v_x) && (v_e === v_d)) && (dot(sp, cl, v_n) === 1));
                if (_c77) {
                  let _g73 = 0;
                  G74: {
                    const _a75 = sp.adj4[v_n];
                    for (let _i76 = 0; _i76 < _a75.length; _i76++) {
                      const v_m = _a75[_i76];
                      if (!(((b.grid[v_m] || -1) === (b.grid[v_n] || -1)))) continue;
                      _g73++;
                    }
                  }
                  _c77 = (_g73 >= 1);
                }
                _c78 = _c77;
              }
              freshBinding("refute", [(sp.cells.includes(v_x)), !((b.grid[v_x] !== 0)), (((b.domain >> v_d) & 1) !== 0), (union(setOf(v_x), sp.adj4[v_x]).includes(v_n)), ((v_n === v_x) || (b.grid[v_n] !== 0)), (((b.domain >> v_e) & 1) !== 0), (((v_n === v_x) && (v_e === v_d)) || ((v_n !== v_x) && (v_e === (b.grid[v_n] || -1)))), (v_r === _g69), _c78], ["x in", "where of x", "d in", "n in", "where of n", "e in", "where of e", "r =", "where of r"]);
            }
            facts.length = 0;
            changed = false;
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _h80); changed = true; } else facts.push(PLACE, v_x, _h80); }
            if (!(true)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ x: v_x, d: v_d, n: v_n, e: v_e, r: v_r }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CountFullBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
}

const countFullFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function countFull(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountFullBinding> | null): number {
  const _g188: number[] = [];
  const _g197: number[] = [];
  const _g215: number[] = [];
  const _g229: number[] = [];
  const _g259: number[] = [];
  const _g272: number[] = [];
  const facts = countFullFacts;
  let fired = 0;
  let changed = false;
  const _k183 = dotKept.board(cl);
  const _a181 = sp.cells;
  R1:
  for (let _i182 = 0; _i182 < _a181.length; _i182++) {
    const v_a = _a181[_i182];
    const _m49_0 = b.made[0];
    let _c194: boolean = (b.grid[v_a] !== 0);
    if (_c194) {
      let _g184 = 0;
      G185: {
        const _a186 = sp.adj4[v_a];
        for (let _i187 = 0; _i187 < _a186.length; _i187++) {
          const v_m = _a186[_i187];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g184++;
        }
      }
      _g188.length = 0;
      G189: {
        const _a192 = sp.adj4[v_a];
        for (let _i193 = 0; _i193 < _a192.length; _i193++) {
          const v_m = _a192[_i193];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g188.push(v_m);
        }
      }
      _c194 = ((((_k183[v_a] ?? dot(sp, cl, v_a)) * ((2 - (_k183[v_a] ?? dot(sp, cl, v_a))) - _g184)) + ((1 - (_k183[v_a] ?? dot(sp, cl, v_a))) * _g188.length)) > 0);
    }
    if (!(_c194)) continue;
    const _a195 = within(sp, v_a, 2);
    for (let _i196 = 0; _i196 < _a195.length; _i196++) {
      const v_b = _a195[_i196];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g197.length = 0;
      G198: {
        const _a213 = open(b, sp, v_a);
        for (let _i214 = 0; _i214 < _a213.length; _i214++) {
          const v_u = _a213[_i214];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g197.push(v_u);
        }
      }
      const v_S = _g197;
      const _h238 = v_S.length;
      _g215.length = 0;
      G216: {
        const _a225 = open(b, sp, v_a);
        for (let _i226 = 0; _i226 < _a225.length; _i226++) {
          const v_u = _a225[_i226];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g215.push(v_u);
        }
      }
      const v_R = _g215;
      const _h239 = v_R.length;
      let _g227 = 0;
      G228: {
        _g229.length = 0;
        G230: {
          const _a233 = sp.adj4[v_b];
          for (let _i234 = 0; _i234 < _a233.length; _i234++) {
            const v_m = _a233[_i234];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g229.push(v_m);
          }
        }
        const _a235 = _g229;
        for (let _i236 = 0; _i236 < _a235.length; _i236++) {
          const v_u = _a235[_i236];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g227++;
        }
      }
      L237: {
        const v_bo = _g227;
        let _c267: boolean = ((_h238 > 0) && (_h239 > 0));
        if (_c267) {
          let _c254: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
          if (_c254) {
            let _g240 = 0;
            G241: {
              const _a242 = sp.adj4[v_b];
              for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                const v_m = _a242[_i243];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                _g240++;
              }
            }
            _c254 = ((((2 - (_k183[v_b] ?? dot(sp, cl, v_b))) - _g240) - v_bo) >= hi(b, sp, cl, v_a));
          }
          let _c266: boolean = _c254;
          if (!_c266) {
            let _c265: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
            if (_c265) {
              let _g255 = 0;
              G256: {
                const _a257 = sp.adj4[v_b];
                for (let _i258 = 0; _i258 < _a257.length; _i258++) {
                  const v_m = _a257[_i258];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g255++;
                }
              }
              _g259.length = 0;
              G260: {
                const _a263 = sp.adj4[v_b];
                for (let _i264 = 0; _i264 < _a263.length; _i264++) {
                  const v_m = _a263[_i264];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g259.push(v_m);
                }
              }
              _c265 = ((_h238 - (((_k183[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k183[v_b] ?? dot(sp, cl, v_b))) - _g255)) + ((1 - (_k183[v_b] ?? dot(sp, cl, v_b))) * _g259.length))) >= hi(b, sp, cl, v_a));
            }
            _c266 = _c265;
          }
          _c267 = _c266;
        }
        if (!(_c267)) break L237;
        if (b.made[0] !== _m49_0) {
          let _c278: boolean = (b.grid[v_a] !== 0);
          if (_c278) {
            let _g268 = 0;
            G269: {
              const _a270 = sp.adj4[v_a];
              for (let _i271 = 0; _i271 < _a270.length; _i271++) {
                const v_m = _a270[_i271];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g268++;
              }
            }
            _g272.length = 0;
            G273: {
              const _a276 = sp.adj4[v_a];
              for (let _i277 = 0; _i277 < _a276.length; _i277++) {
                const v_m = _a276[_i277];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g272.push(v_m);
              }
            }
            _c278 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g268)) + ((1 - dot(sp, cl, v_a)) * _g272.length)) > 0);
          }
          if (!(_c278)) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c289: boolean = (b.grid[v_a] !== 0);
          if (_c289) {
            let _g279 = 0;
            G280: {
              const _a281 = sp.adj4[v_a];
              for (let _i282 = 0; _i282 < _a281.length; _i282++) {
                const v_m = _a281[_i282];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g279++;
              }
            }
            const _g283: number[] = [];
            G284: {
              const _a287 = sp.adj4[v_a];
              for (let _i288 = 0; _i288 < _a287.length; _i288++) {
                const v_m = _a287[_i288];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g283.push(v_m);
              }
            }
            _c289 = (((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g279)) + ((1 - dot(sp, cl, v_a)) * _g283.length)) > 0);
          }
          const _g290: number[] = [];
          G291: {
            const _g300: number[] = [];
            G301: {
              const _a304 = sp.adj4[v_a];
              for (let _i305 = 0; _i305 < _a304.length; _i305++) {
                const v_m = _a304[_i305];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g300.push(v_m);
              }
            }
            const _a306 = _g300;
            for (let _i307 = 0; _i307 < _a306.length; _i307++) {
              const v_u = _a306[_i307];
              if (!((sp.adj4[v_b].includes(v_u)))) continue;
              _g290.push(v_u);
            }
          }
          const _g308: number[] = [];
          G309: {
            const _g318: number[] = [];
            G319: {
              const _a322 = sp.adj4[v_a];
              for (let _i323 = 0; _i323 < _a322.length; _i323++) {
                const v_m = _a322[_i323];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g318.push(v_m);
              }
            }
            const _a324 = _g318;
            for (let _i325 = 0; _i325 < _a324.length; _i325++) {
              const v_u = _a324[_i325];
              if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
              _g308.push(v_u);
            }
          }
          let _g326 = 0;
          G327: {
            const _g328: number[] = [];
            G329: {
              const _a332 = sp.adj4[v_b];
              for (let _i333 = 0; _i333 < _a332.length; _i333++) {
                const v_m = _a332[_i333];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g328.push(v_m);
              }
            }
            const _a334 = _g328;
            for (let _i335 = 0; _i335 < _a334.length; _i335++) {
              const v_u = _a334[_i335];
              if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
              _g326++;
            }
          }
          let _c373: boolean = ((v_S.length > 0) && (v_R.length > 0));
          if (_c373) {
            let _c350: boolean = ((b.grid[v_b] || -1) === (b.grid[v_a] || -1));
            if (_c350) {
              let _g336 = 0;
              G337: {
                const _a338 = sp.adj4[v_b];
                for (let _i339 = 0; _i339 < _a338.length; _i339++) {
                  const v_m = _a338[_i339];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                  _g336++;
                }
              }
              let _g340 = 0;
              G341: {
                const _a342 = sp.adj4[v_a];
                for (let _i343 = 0; _i343 < _a342.length; _i343++) {
                  const v_m = _a342[_i343];
                  if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                  _g340++;
                }
              }
              const _g344: number[] = [];
              G345: {
                const _a348 = sp.adj4[v_a];
                for (let _i349 = 0; _i349 < _a348.length; _i349++) {
                  const v_m = _a348[_i349];
                  if (!(!((b.grid[v_m] !== 0)))) continue;
                  _g344.push(v_m);
                }
              }
              _c350 = ((((2 - dot(sp, cl, v_b)) - _g336) - v_bo) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g340)) + ((1 - dot(sp, cl, v_a)) * _g344.length)));
            }
            let _c372: boolean = _c350;
            if (!_c372) {
              let _c371: boolean = ((b.grid[v_b] || -1) !== (b.grid[v_a] || -1));
              if (_c371) {
                let _g351 = 0;
                G352: {
                  const _a353 = sp.adj4[v_b];
                  for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                    const v_m = _a353[_i354];
                    if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
                    _g351++;
                  }
                }
                const _g355: number[] = [];
                G356: {
                  const _a359 = sp.adj4[v_b];
                  for (let _i360 = 0; _i360 < _a359.length; _i360++) {
                    const v_m = _a359[_i360];
                    if (!(!((b.grid[v_m] !== 0)))) continue;
                    _g355.push(v_m);
                  }
                }
                let _g361 = 0;
                G362: {
                  const _a363 = sp.adj4[v_a];
                  for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                    const v_m = _a363[_i364];
                    if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                    _g361++;
                  }
                }
                const _g365: number[] = [];
                G366: {
                  const _a369 = sp.adj4[v_a];
                  for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                    const v_m = _a369[_i370];
                    if (!(!((b.grid[v_m] !== 0)))) continue;
                    _g365.push(v_m);
                  }
                }
                _c371 = ((v_S.length - ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g351)) + ((1 - dot(sp, cl, v_b)) * _g355.length))) >= ((dot(sp, cl, v_a) * ((2 - dot(sp, cl, v_a)) - _g361)) + ((1 - dot(sp, cl, v_a)) * _g365.length)));
              }
              _c372 = _c371;
            }
            _c373 = _c372;
          }
          freshBinding("countFull", [(sp.cells.includes(v_a)), _c289, (within(sp, v_a, 2).includes(v_b)), ((v_b !== v_a) && (b.grid[v_b] !== 0)), sameSet(v_S, _g290), sameSet(v_R, _g308), (v_bo === _g326), _c373], ["a in", "where of a", "b in", "where of b", "S =", "R =", "bo =", "where of bo"]);
        }
        facts.length = 0;
        changed = false;
        let _q374 = true;
        Q375: {
          const _a376 = v_R;
          for (let _i377 = 0; _i377 < _a376.length; _i377++) {
            const v_u = _a376[_i377];
            const _t378 = (b.grid[v_a] || -1);
            const _t379 = (3 - _t378);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t379); changed = true; } else facts.push(PLACE, v_u, _t379); }
            if (!(true)) {
              _q374 = false;
              break Q375;
            }
          }
        }
        if (!(_q374)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface CountShortBinding {
  a: number;
  b: number;
  S: readonly number[];
  R: readonly number[];
  bo: number;
  alike: number;
  most: number;
}

const countShortFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function countShort(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CountShortBinding> | null): number {
  const _g468: number[] = [];
  const _g480: number[] = [];
  const _g494: number[] = [];
  const _g509: number[] = [];
  const facts = countShortFacts;
  let fired = 0;
  let changed = false;
  const _k460 = dotKept.board(cl);
  const _a458 = sp.cells;
  R1:
  for (let _i459 = 0; _i459 < _a458.length; _i459++) {
    const v_a = _a458[_i459];
    const _m93_0 = b.made[0];
    let _c465: boolean = (b.grid[v_a] !== 0);
    if (_c465) {
      let _g461 = 0;
      G462: {
        const _a463 = sp.adj4[v_a];
        for (let _i464 = 0; _i464 < _a463.length; _i464++) {
          const v_m = _a463[_i464];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
          _g461++;
        }
      }
      _c465 = (((2 - (_k460[v_a] ?? dot(sp, cl, v_a))) - _g461) > 0);
    }
    if (!(_c465)) continue;
    const _a466 = within(sp, v_a, 2);
    for (let _i467 = 0; _i467 < _a466.length; _i467++) {
      const v_b = _a466[_i467];
      if (!(((v_b !== v_a) && (b.grid[v_b] !== 0)))) continue;
      _g468.length = 0;
      G469: {
        const _a478 = open(b, sp, v_a);
        for (let _i479 = 0; _i479 < _a478.length; _i479++) {
          const v_u = _a478[_i479];
          if (!((sp.adj4[v_b].includes(v_u)))) continue;
          _g468.push(v_u);
        }
      }
      const v_S = _g468;
      const _h515 = v_S.length;
      _g480.length = 0;
      G481: {
        const _a490 = open(b, sp, v_a);
        for (let _i491 = 0; _i491 < _a490.length; _i491++) {
          const v_u = _a490[_i491];
          if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
          _g480.push(v_u);
        }
      }
      const v_R = _g480;
      const _h517 = v_R.length;
      let _g492 = 0;
      G493: {
        _g494.length = 0;
        G495: {
          const _a498 = sp.adj4[v_b];
          for (let _i499 = 0; _i499 < _a498.length; _i499++) {
            const v_m = _a498[_i499];
            if (!(!((b.grid[v_m] !== 0)))) continue;
            _g494.push(v_m);
          }
        }
        const _a500 = _g494;
        for (let _i501 = 0; _i501 < _a500.length; _i501++) {
          const v_u = _a500[_i501];
          if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
          _g492++;
        }
      }
      const v_bo = _g492;
      let _g502 = 0;
      G503: {
        for (let _i504 = 0; _i504 < 1; _i504++) {
          const v_k = v_b;
          if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
          _g502++;
        }
      }
      const v_alike = _g502;
      let _g505 = 0;
      G506: {
        const _a507 = sp.adj4[v_b];
        for (let _i508 = 0; _i508 < _a507.length; _i508++) {
          const v_m = _a507[_i508];
          if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
          _g505++;
        }
      }
      _g509.length = 0;
      G510: {
        const _a513 = sp.adj4[v_b];
        for (let _i514 = 0; _i514 < _a513.length; _i514++) {
          const v_m = _a513[_i514];
          if (!(!((b.grid[v_m] !== 0)))) continue;
          _g509.push(v_m);
        }
      }
      L516: {
        const v_most = ((v_alike * (((_k460[v_b] ?? dot(sp, cl, v_b)) * ((2 - (_k460[v_b] ?? dot(sp, cl, v_b))) - _g505)) + ((1 - (_k460[v_b] ?? dot(sp, cl, v_b))) * _g509.length))) + ((1 - v_alike) * ((_h515 - ((2 - (_k460[v_b] ?? dot(sp, cl, v_b))) - _g505)) + v_bo)));
        if (!(((((_h515 > 0) && (_h517 > 0)) && (v_most < _h515)) && ((lo(b, sp, cl, v_a) - v_most) >= _h517)))) break L516;
        if (b.made[0] !== _m93_0) {
          let _c526: boolean = (b.grid[v_a] !== 0);
          if (_c526) {
            let _g522 = 0;
            G523: {
              const _a524 = sp.adj4[v_a];
              for (let _i525 = 0; _i525 < _a524.length; _i525++) {
                const v_m = _a524[_i525];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g522++;
              }
            }
            _c526 = (((2 - dot(sp, cl, v_a)) - _g522) > 0);
          }
          if (!(_c526)) { continue R1; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c531: boolean = (b.grid[v_a] !== 0);
          if (_c531) {
            let _g527 = 0;
            G528: {
              const _a529 = sp.adj4[v_a];
              for (let _i530 = 0; _i530 < _a529.length; _i530++) {
                const v_m = _a529[_i530];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g527++;
              }
            }
            _c531 = (((2 - dot(sp, cl, v_a)) - _g527) > 0);
          }
          const _g532: number[] = [];
          G533: {
            const _g542: number[] = [];
            G543: {
              const _a546 = sp.adj4[v_a];
              for (let _i547 = 0; _i547 < _a546.length; _i547++) {
                const v_m = _a546[_i547];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g542.push(v_m);
              }
            }
            const _a548 = _g542;
            for (let _i549 = 0; _i549 < _a548.length; _i549++) {
              const v_u = _a548[_i549];
              if (!((sp.adj4[v_b].includes(v_u)))) continue;
              _g532.push(v_u);
            }
          }
          const _g550: number[] = [];
          G551: {
            const _g560: number[] = [];
            G561: {
              const _a564 = sp.adj4[v_a];
              for (let _i565 = 0; _i565 < _a564.length; _i565++) {
                const v_m = _a564[_i565];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g560.push(v_m);
              }
            }
            const _a566 = _g560;
            for (let _i567 = 0; _i567 < _a566.length; _i567++) {
              const v_u = _a566[_i567];
              if (!(!(sp.adj4[v_b].includes(v_u)))) continue;
              _g550.push(v_u);
            }
          }
          let _g568 = 0;
          G569: {
            const _g570: number[] = [];
            G571: {
              const _a574 = sp.adj4[v_b];
              for (let _i575 = 0; _i575 < _a574.length; _i575++) {
                const v_m = _a574[_i575];
                if (!(!((b.grid[v_m] !== 0)))) continue;
                _g570.push(v_m);
              }
            }
            const _a576 = _g570;
            for (let _i577 = 0; _i577 < _a576.length; _i577++) {
              const v_u = _a576[_i577];
              if (!(!(sp.adj4[v_a].includes(v_u)))) continue;
              _g568++;
            }
          }
          let _g578 = 0;
          G579: {
            for (let _i580 = 0; _i580 < 1; _i580++) {
              const v_k = v_b;
              if (!(((b.grid[v_k] || -1) === (b.grid[v_a] || -1)))) continue;
              _g578++;
            }
          }
          let _g581 = 0;
          G582: {
            const _a583 = sp.adj4[v_b];
            for (let _i584 = 0; _i584 < _a583.length; _i584++) {
              const v_m = _a583[_i584];
              if (!(((b.grid[v_m] || -1) === (b.grid[v_b] || -1)))) continue;
              _g581++;
            }
          }
          const _g585: number[] = [];
          G586: {
            const _a589 = sp.adj4[v_b];
            for (let _i590 = 0; _i590 < _a589.length; _i590++) {
              const v_m = _a589[_i590];
              if (!(!((b.grid[v_m] !== 0)))) continue;
              _g585.push(v_m);
            }
          }
          let _c595: boolean = (((v_S.length > 0) && (v_R.length > 0)) && (v_most < v_S.length));
          if (_c595) {
            let _g591 = 0;
            G592: {
              const _a593 = sp.adj4[v_a];
              for (let _i594 = 0; _i594 < _a593.length; _i594++) {
                const v_m = _a593[_i594];
                if (!(((b.grid[v_m] || -1) === (b.grid[v_a] || -1)))) continue;
                _g591++;
              }
            }
            _c595 = ((((2 - dot(sp, cl, v_a)) - _g591) - v_most) >= v_R.length);
          }
          freshBinding("countShort", [(sp.cells.includes(v_a)), _c531, (within(sp, v_a, 2).includes(v_b)), ((v_b !== v_a) && (b.grid[v_b] !== 0)), sameSet(v_S, _g532), sameSet(v_R, _g550), (v_bo === _g568), (v_alike === _g578), (v_most === ((v_alike * ((dot(sp, cl, v_b) * ((2 - dot(sp, cl, v_b)) - _g581)) + ((1 - dot(sp, cl, v_b)) * _g585.length))) + ((1 - v_alike) * ((v_S.length - ((2 - dot(sp, cl, v_b)) - _g581)) + v_bo)))), _c595], ["a in", "where of a", "b in", "where of b", "S =", "R =", "bo =", "alike =", "most =", "where of most"]);
        }
        facts.length = 0;
        changed = false;
        let _q596 = true;
        Q597: {
          const _a598 = v_R;
          for (let _i599 = 0; _i599 < _a598.length; _i599++) {
            const v_u = _a598[_i599];
            const _t600 = (b.grid[v_a] || -1);
            if (!(b.grid[v_u] !== 0)) { if (fire === null) { b.placeAt(v_u, _t600); changed = true; } else facts.push(PLACE, v_u, _t600); }
            if (!(true)) {
              _q596 = false;
              break Q597;
            }
          }
        }
        if (!(_q596)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ a: v_a, b: v_b, S: v_S.slice(), R: v_R.slice(), bo: v_bo, alike: v_alike, most: v_most }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

const dotKept = keptStore<number>();
let dotOn: object | null = null;
let dotAt: Kept<number> = [];

/** `dot(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function dot(_sp: GridSpace, cl: Dealt, v_c: number): number {
  if (cl !== dotOn) {
    dotAt = dotKept.board(cl);
    dotOn = cl;
  }
  const _kept: Kept<number> = dotAt;
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g23 = 0;
  G24: {
    for (let _i25 = 0; _i25 < 1; _i25++) {
      const v_k = v_c;
      if (!((clueAt(cl.dot, v_k) !== -1))) continue;
      _g23++;
    }
  }
  const _made = _g23;
  _kept[v_c] = _made;
  return _made;
}

const sameKept = keptStore<number>();

/** `same(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function same(b: Marks, sp: GridSpace, v_c: number): number {
  const _kept: Kept<number> = sameKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g65 = 0;
  G66: {
    const _a67 = sp.adj4[v_c];
    for (let _i68 = 0; _i68 < _a67.length; _i68++) {
      const v_m = _a67[_i68];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g65++;
    }
  }
  const _made = _g65;
  _kept[v_c] = _made;
  return _made;
}

const openKept = keptStore<readonly number[]>();

/** `open(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function open(b: Marks, sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = openKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g207: number[] = [];
  G208: {
    const _a211 = sp.adj4[v_c];
    for (let _i212 = 0; _i212 < _a211.length; _i212++) {
      const v_m = _a211[_i212];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g207.push(v_m);
    }
  }
  const _made = _g207;
  _kept[v_c] = _made;
  return _made;
}

const hiKept = keptStore<number>();

/** `hi(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function hi(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = hiKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g244 = 0;
  G245: {
    const _a246 = sp.adj4[v_c];
    for (let _i247 = 0; _i247 < _a246.length; _i247++) {
      const v_m = _a246[_i247];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g244++;
    }
  }
  const _g248: number[] = [];
  G249: {
    const _a252 = sp.adj4[v_c];
    for (let _i253 = 0; _i253 < _a252.length; _i253++) {
      const v_m = _a252[_i253];
      if (!(!((b.grid[v_m] !== 0)))) continue;
      _g248.push(v_m);
    }
  }
  const _made = ((dot(sp, cl, v_c) * ((2 - dot(sp, cl, v_c)) - _g244)) + ((1 - dot(sp, cl, v_c)) * _g248.length));
  _kept[v_c] = _made;
  return _made;
}

const loKept = keptStore<number>();

/** `lo(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function lo(b: Marks, sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = loKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g518 = 0;
  G519: {
    const _a520 = sp.adj4[v_c];
    for (let _i521 = 0; _i521 < _a520.length; _i521++) {
      const v_m = _a520[_i521];
      if (!(((b.grid[v_m] || -1) === (b.grid[v_c] || -1)))) continue;
      _g518++;
    }
  }
  const _made = ((2 - dot(sp, cl, v_c)) - _g518);
  _kept[v_c] = _made;
  return _made;
}
