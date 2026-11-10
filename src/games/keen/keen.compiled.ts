// Compiled by `npm run describe` from src/games/keen/keen.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, type Partition, STRIKE, clueAt, freshBinding, rangeMask, sameSet, staleChecking, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  cage: Partition;
  sum: ClueList;
  product: ClueList;
  difference: ClueList;
  quotient: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = ["rows","cols"];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "cageEasy" | "latin.hiddenSingle" | "latin.single" | "cage" | "cageLine" | "latin.set" | "latin.fish" | "latin.wing";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "latin.placed";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "latin.placed" },
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
  { id: "cageEasy", tier: 0, until: 1 },
  { id: "latin.hiddenSingle", tier: 0 },
  { id: "latin.single", tier: 0 },
  { id: "cage", tier: 1 },
  { id: "cageLine", tier: 2 },
  { id: "latin.set", tier: 2 },
  { id: "latin.fish", tier: 3 },
  { id: "latin.wing", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _domain = rangeMask(1, sp.w);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q539 = true;
  const _n543 = new Int32Array(32);
  Q540: for (const _u541 of sp.lines) {
    _n543.fill(0);
    for (const _c542 of sp.lineCells[_u541]) {
      const _t544 = (g[_c542] || -1);
      if (++_n543[_t544] > 1) {
        _q539 = false;
        break Q540;
      }
    }
  }
  if (!(_q539)) return false;
  for (let _k545 = 0; _k545 < cl.sum.at.length; _k545++) {
    const _at546 = cl.sum.at[_k545];
    const _v547 = cl.sum.v[_k545];
    let _g548 = 0;
    G549: {
      const _a550 = cl.cage.cells[_at546];
      for (let _i551 = 0; _i551 < _a550.length; _i551++) {
        const v_c = _a550[_i551];
        const _h552 = (g[v_c] || -1);
        _g548 += _h552;
      }
    }
    if (!((_g548 === _v547))) return false;
  }
  for (let _k553 = 0; _k553 < cl.product.at.length; _k553++) {
    const _at554 = cl.product.at[_k553];
    const _v555 = cl.product.v[_k553];
    let _g556 = 1;
    G557: {
      const _a558 = cl.cage.cells[_at554];
      for (let _i559 = 0; _i559 < _a558.length; _i559++) {
        const v_c = _a558[_i559];
        const _h560 = (g[v_c] || -1);
        _g556 *= _h560;
      }
    }
    if (!((_g556 === _v555))) return false;
  }
  for (let _k561 = 0; _k561 < cl.difference.at.length; _k561++) {
    const _at562 = cl.difference.at[_k561];
    const _v563 = cl.difference.v[_k561];
    let _g564 = -1;
    G565: {
      const _a566 = cl.cage.cells[_at562];
      for (let _i567 = 0; _i567 < _a566.length; _i567++) {
        const v_c = _a566[_i567];
        const _h568 = (g[v_c] || -1);
        if (_g564 === -1 || _h568 > _g564) _g564 = _h568;
      }
    }
    let _g569 = -1;
    G570: {
      const _a571 = cl.cage.cells[_at562];
      for (let _i572 = 0; _i572 < _a571.length; _i572++) {
        const v_c = _a571[_i572];
        const _h573 = (g[v_c] || -1);
        if (_g569 === -1 || _h573 < _g569) _g569 = _h573;
      }
    }
    if (!(((_g564 - _g569) === _v563))) return false;
  }
  for (let _k574 = 0; _k574 < cl.quotient.at.length; _k574++) {
    const _at575 = cl.quotient.at[_k574];
    const _v576 = cl.quotient.v[_k574];
    let _g577 = -1;
    G578: {
      const _a579 = cl.cage.cells[_at575];
      for (let _i580 = 0; _i580 < _a579.length; _i580++) {
        const v_c = _a579[_i580];
        const _h581 = (g[v_c] || -1);
        if (_g577 === -1 || _h581 > _g577) _g577 = _h581;
      }
    }
    let _g582 = -1;
    G583: {
      const _a584 = cl.cage.cells[_at575];
      for (let _i585 = 0; _i585 < _a584.length; _i585++) {
        const v_c = _a584[_i585];
        const _h586 = (g[v_c] || -1);
        if (_g582 === -1 || _h586 < _g582) _g582 = _h586;
      }
    }
    if (!((_g577 === (_v576 * _g582)))) return false;
  }
  return true;
}

export interface CageEasyBinding {
  r: number;
  K: readonly number[];
  D: number;
}

const cageEasyFacts: number[] = [];
let cageEasyCands = new Int32Array(0);
let _f192 = new Int32Array(0);
let _l193: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cageEasy(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageEasyBinding> | null): number {
  if (_f192.length < sp.cells.length) _f192 = new Int32Array(sp.cells.length).fill(-1);
  else _f192.fill(-1);
  _l193 = [];
  const _s194: number[] = [];
  const facts = cageEasyFacts;
  let fired = 0;
  let changed = false;
  if (cageEasyCands.length < sp.cells.length) cageEasyCands = new Int32Array(sp.cells.length);
  const cands = cageEasyCands;
  cands.fill(-1);
  const _a128 = cl.cage.parts;
  for (let _i129 = 0; _i129 < _a128.length; _i129++) {
    const v_r = _a128[_i129];
    const _h200 = clueAt(cl.sum, v_r);
    const _h204 = clueAt(cl.product, v_r);
    const _h213 = (_h200 === -1);
    const _h219 = (_h204 === -1);
    const _h226 = clueAt(cl.difference, v_r);
    const _h227 = (_h226 === -1);
    const _h240 = clueAt(cl.quotient, v_r);
    const _h241 = (_h240 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g130 = 0;
    G131: {
      const _a191 = v_K;
      const _t201 = (_h200 === -1);
      const _lo202 = 31 - Math.clz32(b.domain & -b.domain);
      const _hi203 = 31 - Math.clz32(b.domain);
      const _t205 = (_h204 === -1);
      for (const _e195 of _l193) _f192[_e195] = -1;
      _l193 = _a191;
      let _i197 = 0;
      _s194[0] = 0;
      let _o209 = _a191.length === 0;
      for (;;) {
        if (_a191.length === 0) {
          if (!_o209) break;
          _o209 = false;
        }
        while (_a191.length > 0 && _i197 >= 0) {
          const _e195 = _a191[_i197];
          if (_s194[_i197] > 0) _f192[_e195] = -1;
          let _r208 = (cands[_e195] >= 0 ? cands[_e195] : (cands[_e195] = b.cands[_e195])) & ~((2 << _s194[_i197]) - 1);
          let _d196 = 0;
          V199: for (; _r208 !== 0; _r208 &= _r208 - 1) {
            _d196 = 31 - Math.clz32(_r208 & -_r208);
            _f192[_e195] = _d196;
            for (let _j198 = 0; _j198 < _i197; _j198++) {
              const _y210 = _a191[_j198];
              if (!(((sp.rowOf[_e195] === sp.rowOf[_y210]) || (sp.colOf[_e195] === sp.colOf[_y210])))) continue;
              if (!((_f192[_e195] !== _f192[_y210]))) continue V199;
            }
            if (!_t201) {
              let _t211 = _d196;
              for (let _j198 = 0; _j198 < _i197; _j198++) _t211 += _f192[_a191[_j198]];
              if (_t211 + (_a191.length - _i197 - 1) * _lo202 > _h200) continue;
              if (_t211 + (_a191.length - _i197 - 1) * _hi203 < _h200) continue;
            }
            if (!_t205) {
              let _t212 = _d196;
              for (let _j198 = 0; _j198 < _i197; _j198++) _t212 *= _f192[_a191[_j198]];
              if (_t212 > 0 && _h204 % _t212 !== 0) continue;
            }
            break;
          }
          if (_r208 === 0) {
            _s194[_i197] = 0;
            _i197--;
            continue;
          }
          _s194[_i197] = _d196;
          if (_i197 === _a191.length - 1) break;
          _i197++;
          _s194[_i197] = 0;
        }
        if (_i197 < 0) break;
        let _c218: boolean = _h213;
        if (!_c218) {
          let _g214 = 0;
          G215: {
            const _a216 = cl.cage.cells[v_r];
            for (let _i217 = 0; _i217 < _a216.length; _i217++) {
              const v_x = _a216[_i217];
              _g214 += _f192[v_x];
            }
          }
          _c218 = (_g214 === _h200);
        }
        let _c225: boolean = _c218;
        if (_c225) {
          let _c224: boolean = _h219;
          if (!_c224) {
            let _g220 = 1;
            G221: {
              const _a222 = cl.cage.cells[v_r];
              for (let _i223 = 0; _i223 < _a222.length; _i223++) {
                const v_x = _a222[_i223];
                _g220 *= _f192[v_x];
              }
            }
            _c224 = (_g220 === _h204);
          }
          _c225 = _c224;
        }
        let _c239: boolean = _c225;
        if (_c239) {
          let _c238: boolean = _h227;
          if (!_c238) {
            let _g228 = -1;
            G229: {
              const _a230 = cl.cage.cells[v_r];
              for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                const v_x = _a230[_i231];
                const _t232 = _f192[v_x];
                if (_g228 === -1 || _t232 > _g228) _g228 = _t232;
              }
            }
            let _g233 = -1;
            G234: {
              const _a235 = cl.cage.cells[v_r];
              for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                const v_x = _a235[_i236];
                const _t237 = _f192[v_x];
                if (_g233 === -1 || _t237 < _g233) _g233 = _t237;
              }
            }
            _c238 = ((_g228 - _g233) === _h226);
          }
          _c239 = _c238;
        }
        let _c253: boolean = _c239;
        if (_c253) {
          let _c252: boolean = _h241;
          if (!_c252) {
            let _g242 = -1;
            G243: {
              const _a244 = cl.cage.cells[v_r];
              for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                const v_x = _a244[_i245];
                const _t246 = _f192[v_x];
                if (_g242 === -1 || _t246 > _g242) _g242 = _t246;
              }
            }
            let _g247 = -1;
            G248: {
              const _a249 = cl.cage.cells[v_r];
              for (let _i250 = 0; _i250 < _a249.length; _i250++) {
                const v_x = _a249[_i250];
                const _t251 = _f192[v_x];
                if (_g247 === -1 || _t251 < _g247) _g247 = _t251;
              }
            }
            _c252 = (_g242 === (_h240 * _g247));
          }
          _c253 = _c252;
        }
        if (!(_c253)) continue;
        const _a254 = v_K;
        for (let _i255 = 0; _i255 < _a254.length; _i255++) {
          const v_x = _a254[_i255];
          const _t256 = _f192[v_x];
          _g130 |= 1 << _t256;
        }
      }
    }
    const v_D = _g130;
    if (import.meta.env.DEV && staleChecking) {
      let _g257 = 0;
      G258: {
        const _f319 = new Int32Array(sp.cells.length).fill(-1);
        let _l320: readonly number[] = [];
        const _s321: number[] = [];
        const _a318 = v_K;
        const _t327 = (clueAt(cl.sum, v_r) === -1);
        const _t328 = clueAt(cl.sum, v_r);
        const _lo329 = 31 - Math.clz32(b.domain & -b.domain);
        const _hi330 = 31 - Math.clz32(b.domain);
        const _t331 = (clueAt(cl.product, v_r) === -1);
        const _t332 = clueAt(cl.product, v_r);
        for (const _e322 of _l320) _f319[_e322] = -1;
        _l320 = _a318;
        let _i324 = 0;
        _s321[0] = 0;
        let _o336 = _a318.length === 0;
        for (;;) {
          if (_a318.length === 0) {
            if (!_o336) break;
            _o336 = false;
          }
          while (_a318.length > 0 && _i324 >= 0) {
            const _e322 = _a318[_i324];
            if (_s321[_i324] > 0) _f319[_e322] = -1;
            let _r335 = (cands[_e322] >= 0 ? cands[_e322] : (cands[_e322] = b.cands[_e322])) & ~((2 << _s321[_i324]) - 1);
            let _d323 = 0;
            V326: for (; _r335 !== 0; _r335 &= _r335 - 1) {
              _d323 = 31 - Math.clz32(_r335 & -_r335);
              _f319[_e322] = _d323;
              for (let _j325 = 0; _j325 < _i324; _j325++) {
                const _y337 = _a318[_j325];
                if (!(((sp.rowOf[_e322] === sp.rowOf[_y337]) || (sp.colOf[_e322] === sp.colOf[_y337])))) continue;
                if (!((_f319[_e322] !== _f319[_y337]))) continue V326;
              }
              if (!_t327) {
                let _t338 = _d323;
                for (let _j325 = 0; _j325 < _i324; _j325++) _t338 += _f319[_a318[_j325]];
                if (_t338 + (_a318.length - _i324 - 1) * _lo329 > _t328) continue;
                if (_t338 + (_a318.length - _i324 - 1) * _hi330 < _t328) continue;
              }
              if (!_t331) {
                let _t339 = _d323;
                for (let _j325 = 0; _j325 < _i324; _j325++) _t339 *= _f319[_a318[_j325]];
                if (_t339 > 0 && _t332 % _t339 !== 0) continue;
              }
              break;
            }
            if (_r335 === 0) {
              _s321[_i324] = 0;
              _i324--;
              continue;
            }
            _s321[_i324] = _d323;
            if (_i324 === _a318.length - 1) break;
            _i324++;
            _s321[_i324] = 0;
          }
          if (_i324 < 0) break;
          let _c344: boolean = (clueAt(cl.sum, v_r) === -1);
          if (!_c344) {
            let _g340 = 0;
            G341: {
              const _a342 = cl.cage.cells[v_r];
              for (let _i343 = 0; _i343 < _a342.length; _i343++) {
                const v_x = _a342[_i343];
                _g340 += _f319[v_x];
              }
            }
            _c344 = (_g340 === clueAt(cl.sum, v_r));
          }
          let _c350: boolean = _c344;
          if (_c350) {
            let _c349: boolean = (clueAt(cl.product, v_r) === -1);
            if (!_c349) {
              let _g345 = 1;
              G346: {
                const _a347 = cl.cage.cells[v_r];
                for (let _i348 = 0; _i348 < _a347.length; _i348++) {
                  const v_x = _a347[_i348];
                  _g345 *= _f319[v_x];
                }
              }
              _c349 = (_g345 === clueAt(cl.product, v_r));
            }
            _c350 = _c349;
          }
          let _c362: boolean = _c350;
          if (_c362) {
            let _c361: boolean = (clueAt(cl.difference, v_r) === -1);
            if (!_c361) {
              let _g351 = -1;
              G352: {
                const _a353 = cl.cage.cells[v_r];
                for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                  const v_x = _a353[_i354];
                  const _t355 = _f319[v_x];
                  if (_g351 === -1 || _t355 > _g351) _g351 = _t355;
                }
              }
              let _g356 = -1;
              G357: {
                const _a358 = cl.cage.cells[v_r];
                for (let _i359 = 0; _i359 < _a358.length; _i359++) {
                  const v_x = _a358[_i359];
                  const _t360 = _f319[v_x];
                  if (_g356 === -1 || _t360 < _g356) _g356 = _t360;
                }
              }
              _c361 = ((_g351 - _g356) === clueAt(cl.difference, v_r));
            }
            _c362 = _c361;
          }
          let _c374: boolean = _c362;
          if (_c374) {
            let _c373: boolean = (clueAt(cl.quotient, v_r) === -1);
            if (!_c373) {
              let _g363 = -1;
              G364: {
                const _a365 = cl.cage.cells[v_r];
                for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                  const v_x = _a365[_i366];
                  const _t367 = _f319[v_x];
                  if (_g363 === -1 || _t367 > _g363) _g363 = _t367;
                }
              }
              let _g368 = -1;
              G369: {
                const _a370 = cl.cage.cells[v_r];
                for (let _i371 = 0; _i371 < _a370.length; _i371++) {
                  const v_x = _a370[_i371];
                  const _t372 = _f319[v_x];
                  if (_g368 === -1 || _t372 < _g368) _g368 = _t372;
                }
              }
              _c373 = (_g363 === (clueAt(cl.quotient, v_r) * _g368));
            }
            _c374 = _c373;
          }
          if (!(_c374)) continue;
          const _a375 = v_K;
          for (let _i376 = 0; _i376 < _a375.length; _i376++) {
            const v_x = _a375[_i376];
            const _t377 = _f319[v_x];
            _g257 |= 1 << _t377;
          }
        }
      }
      freshBinding("cageEasy", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r]), (v_D === _g257)], ["r in", "K =", "D ="]);
    }
    facts.length = 0;
    changed = false;
    let _q378 = true;
    Q379: {
      const _a380 = v_K;
      for (let _i381 = 0; _i381 < _a380.length; _i381++) {
        const v_c = _a380[_i381];
        for (let _m382 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m382 !== 0; _m382 &= _m382 - 1) {
          const v_d = 31 - Math.clz32(_m382 & -_m382);
          if (!(!(((v_D >> v_d) & 1) !== 0))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q378 = false;
            break Q379;
          }
        }
      }
    }
    if (!(_q378)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K.slice(), D: v_D }, facts)) return 1;
      cands.fill(-1);
    }
  }
  return fired;
}

export interface CageBinding {
  r: number;
  K: readonly number[];
}

const cageFacts: number[] = [];
let cageCands = new Int32Array(0);
let _p392 = new Int32Array(0);
let _l393: readonly number[] = [];
let _f398 = new Int32Array(0);
let _l399: readonly number[] = [];

/** Its dearest read grows with the board as 1. */
export function cage(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageBinding> | null): number {
  if (_p392.length < sp.cells.length) _p392 = new Int32Array(sp.cells.length);
  else _p392.fill(0);
  _l393 = [];
  let _y394 = false;
  if (_f398.length < sp.cells.length) _f398 = new Int32Array(sp.cells.length).fill(-1);
  else _f398.fill(-1);
  _l399 = [];
  const _s400: number[] = [];
  const facts = cageFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (cageCands.length < sp.cells.length) cageCands = new Int32Array(sp.cells.length);
  const cands = cageCands;
  cands.fill(-1);
  const _a385 = cl.cage.parts;
  for (let _i386 = 0; _i386 < _a385.length; _i386++) {
    const v_r = _a385[_i386];
    const _h406 = clueAt(cl.sum, v_r);
    const _h407 = (_h406 === -1);
    const _h410 = clueAt(cl.product, v_r);
    const _h411 = (_h410 === -1);
    const _h430 = clueAt(cl.difference, v_r);
    const _h431 = (_h430 === -1);
    const _h444 = clueAt(cl.quotient, v_r);
    const _h445 = (_h444 === -1);
    const v_K = cl.cage.cells[v_r];
    let _g395 = -1;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("cage", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r])], ["r in", "K ="]);
    }
    facts.length = 0;
    changed = false;
    let _q387 = true;
    Q388: {
      const _a389 = v_K;
      for (let _i390 = 0; _i390 < _a389.length; _i390++) {
        const v_c = _a389[_i390];
        for (let _m391 = (cands[v_c] >= 0 ? cands[v_c] : (cands[v_c] = b.cands[v_c])); _m391 !== 0; _m391 &= _m391 - 1) {
          const v_d = 31 - Math.clz32(_m391 & -_m391);
          if (_g395 !== _epoch) {
            _g395 = _epoch;
            for (const _e396 of _l393) _p392[_e396] = 0;
            _y394 = false;
            const _a397 = v_K;
            const _lo408 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi409 = 31 - Math.clz32(b.domain);
            for (const _e401 of _l399) _f398[_e401] = -1;
            _l399 = _a397;
            let _i403 = 0;
            _s400[0] = 0;
            let _o415 = _a397.length === 0;
            for (;;) {
              if (_a397.length === 0) {
                if (!_o415) break;
                _o415 = false;
              }
              while (_a397.length > 0 && _i403 >= 0) {
                const _e401 = _a397[_i403];
                if (_s400[_i403] > 0) _f398[_e401] = -1;
                let _r414 = (cands[_e401] >= 0 ? cands[_e401] : (cands[_e401] = b.cands[_e401])) & ~((2 << _s400[_i403]) - 1);
                let _d402 = 0;
                V405: for (; _r414 !== 0; _r414 &= _r414 - 1) {
                  _d402 = 31 - Math.clz32(_r414 & -_r414);
                  _f398[_e401] = _d402;
                  for (let _j404 = 0; _j404 < _i403; _j404++) {
                    const _y416 = _a397[_j404];
                    if (!(((sp.rowOf[_e401] === sp.rowOf[_y416]) || (sp.colOf[_e401] === sp.colOf[_y416])))) continue;
                    if (!((_f398[_e401] !== _f398[_y416]))) continue V405;
                  }
                  if (!_h407) {
                    let _t417 = _d402;
                    for (let _j404 = 0; _j404 < _i403; _j404++) _t417 += _f398[_a397[_j404]];
                    if (_t417 + (_a397.length - _i403 - 1) * _lo408 > _h406) continue;
                    if (_t417 + (_a397.length - _i403 - 1) * _hi409 < _h406) continue;
                  }
                  if (!_h411) {
                    let _t418 = _d402;
                    for (let _j404 = 0; _j404 < _i403; _j404++) _t418 *= _f398[_a397[_j404]];
                    if (_t418 > 0 && _h410 % _t418 !== 0) continue;
                  }
                  break;
                }
                if (_r414 === 0) {
                  _s400[_i403] = 0;
                  _i403--;
                  continue;
                }
                _s400[_i403] = _d402;
                if (_i403 === _a397.length - 1) break;
                _i403++;
                _s400[_i403] = 0;
              }
              if (_i403 < 0) break;
              let _c423: boolean = _h407;
              if (!_c423) {
                let _g419 = 0;
                G420: {
                  const _a421 = cl.cage.cells[v_r];
                  for (let _i422 = 0; _i422 < _a421.length; _i422++) {
                    const v_x = _a421[_i422];
                    _g419 += _f398[v_x];
                  }
                }
                _c423 = (_g419 === _h406);
              }
              let _c429: boolean = _c423;
              if (_c429) {
                let _c428: boolean = _h411;
                if (!_c428) {
                  let _g424 = 1;
                  G425: {
                    const _a426 = cl.cage.cells[v_r];
                    for (let _i427 = 0; _i427 < _a426.length; _i427++) {
                      const v_x = _a426[_i427];
                      _g424 *= _f398[v_x];
                    }
                  }
                  _c428 = (_g424 === _h410);
                }
                _c429 = _c428;
              }
              let _c443: boolean = _c429;
              if (_c443) {
                let _c442: boolean = _h431;
                if (!_c442) {
                  let _g432 = -1;
                  G433: {
                    const _a434 = cl.cage.cells[v_r];
                    for (let _i435 = 0; _i435 < _a434.length; _i435++) {
                      const v_x = _a434[_i435];
                      const _t436 = _f398[v_x];
                      if (_g432 === -1 || _t436 > _g432) _g432 = _t436;
                    }
                  }
                  let _g437 = -1;
                  G438: {
                    const _a439 = cl.cage.cells[v_r];
                    for (let _i440 = 0; _i440 < _a439.length; _i440++) {
                      const v_x = _a439[_i440];
                      const _t441 = _f398[v_x];
                      if (_g437 === -1 || _t441 < _g437) _g437 = _t441;
                    }
                  }
                  _c442 = ((_g432 - _g437) === _h430);
                }
                _c443 = _c442;
              }
              let _c457: boolean = _c443;
              if (_c457) {
                let _c456: boolean = _h445;
                if (!_c456) {
                  let _g446 = -1;
                  G447: {
                    const _a448 = cl.cage.cells[v_r];
                    for (let _i449 = 0; _i449 < _a448.length; _i449++) {
                      const v_x = _a448[_i449];
                      const _t450 = _f398[v_x];
                      if (_g446 === -1 || _t450 > _g446) _g446 = _t450;
                    }
                  }
                  let _g451 = -1;
                  G452: {
                    const _a453 = cl.cage.cells[v_r];
                    for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                      const v_x = _a453[_i454];
                      const _t455 = _f398[v_x];
                      if (_g451 === -1 || _t455 < _g451) _g451 = _t455;
                    }
                  }
                  _c456 = (_g446 === (_h444 * _g451));
                }
                _c457 = _c456;
              }
              if (!(_c457)) continue;
              if (!(true)) continue;
              _l393 = _a397;
              _y394 = true;
              for (const _e396 of _a397) _p392[_e396] |= 1 << _f398[_e396];
            }
          }
          if (!(!(((((_p392[v_c] >> v_d) & 1) !== 0) || ((v_d as number) === -1 && _y394 && !v_K.includes(v_c)))))) continue;
          if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
          if (!(true)) {
            _q387 = false;
            break Q388;
          }
        }
      }
    }
    if (!(_q387)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ r: v_r, K: v_K.slice() }, facts)) return 1;
      cands.fill(-1);
      _epoch++;
    }
  }
  return fired;
}

export interface CageLineBinding {
  r: number;
  K: readonly number[];
  L: number;
}

const cageLineFacts: number[] = [];
let cageLineCands = new Int32Array(0);
let _f473 = new Int32Array(0);
let _l474: readonly number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function cageLine(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CageLineBinding> | null): number {
  if (_f473.length < sp.cells.length) _f473 = new Int32Array(sp.cells.length).fill(-1);
  else _f473.fill(-1);
  _l474 = [];
  const _s475: number[] = [];
  const facts = cageLineFacts;
  let fired = 0;
  let changed = false;
  const _h464 = union(sp.cols, sp.rows);
  if (cageLineCands.length < sp.cells.length) cageLineCands = new Int32Array(sp.cells.length);
  const cands = cageLineCands;
  cands.fill(-1);
  const _a462 = cl.cage.parts;
  for (let _i463 = 0; _i463 < _a462.length; _i463++) {
    const v_r = _a462[_i463];
    const _h481 = clueAt(cl.sum, v_r);
    const _h482 = (_h481 === -1);
    const _h485 = clueAt(cl.product, v_r);
    const _h486 = (_h485 === -1);
    const _h505 = clueAt(cl.difference, v_r);
    const _h506 = (_h505 === -1);
    const _h519 = clueAt(cl.quotient, v_r);
    const _h520 = (_h519 === -1);
    const v_K = cl.cage.cells[v_r];
    const _a465 = _h464;
    for (let _i466 = 0; _i466 < _a465.length; _i466++) {
      const v_L = _a465[_i466];
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("cageLine", [(cl.cage.parts.includes(v_r)), sameSet(v_K, cl.cage.cells[v_r]), (union(sp.cols, sp.rows).includes(v_L))], ["r in", "K =", "L in"]);
      }
      facts.length = 0;
      changed = false;
      let _q467 = true;
      Q468: {
        for (let _m469 = b.domain; _m469 !== 0; _m469 &= _m469 - 1) {
          const v_d = 31 - Math.clz32(_m469 & -_m469);
          let _q470 = true;
          Q471: {
            const _a472 = v_K;
            const _lo483 = 31 - Math.clz32(b.domain & -b.domain);
            const _hi484 = 31 - Math.clz32(b.domain);
            for (const _e476 of _l474) _f473[_e476] = -1;
            _l474 = _a472;
            let _i478 = 0;
            _s475[0] = 0;
            let _o490 = _a472.length === 0;
            for (;;) {
              if (_a472.length === 0) {
                if (!_o490) break;
                _o490 = false;
              }
              while (_a472.length > 0 && _i478 >= 0) {
                const _e476 = _a472[_i478];
                if (_s475[_i478] > 0) _f473[_e476] = -1;
                let _r489 = (cands[_e476] >= 0 ? cands[_e476] : (cands[_e476] = b.cands[_e476])) & ~((2 << _s475[_i478]) - 1);
                let _d477 = 0;
                V480: for (; _r489 !== 0; _r489 &= _r489 - 1) {
                  _d477 = 31 - Math.clz32(_r489 & -_r489);
                  _f473[_e476] = _d477;
                  for (let _j479 = 0; _j479 < _i478; _j479++) {
                    const _y491 = _a472[_j479];
                    if (!(((sp.rowOf[_e476] === sp.rowOf[_y491]) || (sp.colOf[_e476] === sp.colOf[_y491])))) continue;
                    if (!((_f473[_e476] !== _f473[_y491]))) continue V480;
                  }
                  if (!_h482) {
                    let _t492 = _d477;
                    for (let _j479 = 0; _j479 < _i478; _j479++) _t492 += _f473[_a472[_j479]];
                    if (_t492 + (_a472.length - _i478 - 1) * _lo483 > _h481) continue;
                    if (_t492 + (_a472.length - _i478 - 1) * _hi484 < _h481) continue;
                  }
                  if (!_h486) {
                    let _t493 = _d477;
                    for (let _j479 = 0; _j479 < _i478; _j479++) _t493 *= _f473[_a472[_j479]];
                    if (_t493 > 0 && _h485 % _t493 !== 0) continue;
                  }
                  break;
                }
                if (_r489 === 0) {
                  _s475[_i478] = 0;
                  _i478--;
                  continue;
                }
                _s475[_i478] = _d477;
                if (_i478 === _a472.length - 1) break;
                _i478++;
                _s475[_i478] = 0;
              }
              if (_i478 < 0) break;
              let _c498: boolean = _h482;
              if (!_c498) {
                let _g494 = 0;
                G495: {
                  const _a496 = cl.cage.cells[v_r];
                  for (let _i497 = 0; _i497 < _a496.length; _i497++) {
                    const v_x = _a496[_i497];
                    _g494 += _f473[v_x];
                  }
                }
                _c498 = (_g494 === _h481);
              }
              let _c504: boolean = _c498;
              if (_c504) {
                let _c503: boolean = _h486;
                if (!_c503) {
                  let _g499 = 1;
                  G500: {
                    const _a501 = cl.cage.cells[v_r];
                    for (let _i502 = 0; _i502 < _a501.length; _i502++) {
                      const v_x = _a501[_i502];
                      _g499 *= _f473[v_x];
                    }
                  }
                  _c503 = (_g499 === _h485);
                }
                _c504 = _c503;
              }
              let _c518: boolean = _c504;
              if (_c518) {
                let _c517: boolean = _h506;
                if (!_c517) {
                  let _g507 = -1;
                  G508: {
                    const _a509 = cl.cage.cells[v_r];
                    for (let _i510 = 0; _i510 < _a509.length; _i510++) {
                      const v_x = _a509[_i510];
                      const _t511 = _f473[v_x];
                      if (_g507 === -1 || _t511 > _g507) _g507 = _t511;
                    }
                  }
                  let _g512 = -1;
                  G513: {
                    const _a514 = cl.cage.cells[v_r];
                    for (let _i515 = 0; _i515 < _a514.length; _i515++) {
                      const v_x = _a514[_i515];
                      const _t516 = _f473[v_x];
                      if (_g512 === -1 || _t516 < _g512) _g512 = _t516;
                    }
                  }
                  _c517 = ((_g507 - _g512) === _h505);
                }
                _c518 = _c517;
              }
              let _c532: boolean = _c518;
              if (_c532) {
                let _c531: boolean = _h520;
                if (!_c531) {
                  let _g521 = -1;
                  G522: {
                    const _a523 = cl.cage.cells[v_r];
                    for (let _i524 = 0; _i524 < _a523.length; _i524++) {
                      const v_x = _a523[_i524];
                      const _t525 = _f473[v_x];
                      if (_g521 === -1 || _t525 > _g521) _g521 = _t525;
                    }
                  }
                  let _g526 = -1;
                  G527: {
                    const _a528 = cl.cage.cells[v_r];
                    for (let _i529 = 0; _i529 < _a528.length; _i529++) {
                      const v_x = _a528[_i529];
                      const _t530 = _f473[v_x];
                      if (_g526 === -1 || _t530 < _g526) _g526 = _t530;
                    }
                  }
                  _c531 = (_g521 === (_h519 * _g526));
                }
                _c532 = _c531;
              }
              if (!(_c532)) continue;
              let _q533 = false;
              Q534: {
                const _a535 = sp.lineCells[v_L];
                for (let _i536 = 0; _i536 < _a535.length; _i536++) {
                  const v_x = _a535[_i536];
                  if (((v_K.includes(v_x)) && (_f473[v_x] === v_d))) {
                    _q533 = true;
                    break Q534;
                  }
                }
              }
              if (!(_q533)) {
                _q470 = false;
                break Q471;
              }
            }
          }
          if (!(_q470)) continue;
          const _a537 = sp.lineCells[v_L];
          for (let _i538 = 0; _i538 < _a537.length; _i538++) {
            const v_c = _a537[_i538];
            if (!(!(v_K.includes(v_c)))) continue;
            if ((((b.cands[v_c] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_c, v_d); changed = true; } else facts.push(STRIKE, v_c, v_d); }
            if (!(true)) {
              _q467 = false;
              break Q468;
            }
          }
        }
      }
      if (!(_q467)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ r: v_r, K: v_K.slice(), L: v_L }, facts)) return 1;
        cands.fill(-1);
      }
    }
  }
  return fired;
}
