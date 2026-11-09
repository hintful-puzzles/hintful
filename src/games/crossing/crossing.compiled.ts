// Compiled by `npm run describe` from src/games/crossing/crossing.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, STRIKE, cellsValued, clueAt, keptStore, least, listLength, nth, popcount, sameList, stretch, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  blank: ClueList;
  numbers: { readonly n: number; readonly digits: readonly Int32Array[] };
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "onlyNumber" | "onlyRun" | "sharedDigit" | "crossRuns" | "narrow" | "misread" | "twice";

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
  { id: "onlyNumber", tier: 0 },
  { id: "onlyRun", tier: 0 },
  { id: "sharedDigit", tier: 0 },
  { id: "crossRuns", tier: 0 },
  { id: "narrow", tier: 0 },
  { id: "misread", tier: 0 },
  { id: "twice", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 10; v_d++) {
      if (!(((v_d === 10) === (clueAt(cl.blank, v_c) >= 0)))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q419 = true;
  Q420: {
    const _a421 = sp.lines;
    for (let _i422 = 0; _i422 < _a421.length; _i422++) {
      const v_L = _a421[_i422];
      const _a423 = sp.lineCells[v_L];
      for (let _i424 = 0; _i424 < _a423.length; _i424++) {
        const v_c = _a423[_i424];
        if (!(head(sp, cl, v_L, v_c))) continue;
        let _q425 = false;
        Q426: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            const _t427 = run(sp, cl, v_L, v_c);
            const _h428 = _t427.length;
            let _c434: boolean = (listLength(cl.numbers.digits[v_k]) === _h428);
            if (_c434) {
              let _q429 = true;
              Q430: {
                const _a431 = _t427;
                for (let _i432 = 0; _i432 < _a431.length; _i432++) {
                  const v_x = _a431[_i432];
                  const _h433 = (g[v_x] || -1);
                  if (!((_h433 === nth(cl.numbers.digits[v_k], _i432)))) {
                    _q429 = false;
                    break Q430;
                  }
                }
              }
              _c434 = _q429;
            }
            if (_c434) {
              _q425 = true;
              break Q426;
            }
          }
        }
        if (!(_q425)) {
          _q419 = false;
          break Q420;
        }
      }
    }
  }
  if (!(_q419)) return false;
  let _q435 = true;
  Q436: {
    for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
      for (let v_j = 0; v_j < cl.numbers.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!(!sameList(cl.numbers.digits[v_j], cl.numbers.digits[v_k]))) {
          _q435 = false;
          break Q436;
        }
      }
    }
  }
  if (!(_q435)) return false;
  for (let _k437 = 0; _k437 < cl.blank.at.length; _k437++) {
    const _at438 = cl.blank.at[_k437];
    if (!(((g[_at438] || -1) === 10))) return false;
  }
  for (let _k440 = 0; _k440 < cl.numbers.n; _k440++) {
    let _g443 = 0;
    G444: {
      const _a445 = sp.lines;
      for (let _i446 = 0; _i446 < _a445.length; _i446++) {
        const v_L = _a445[_i446];
        const _a447 = sp.lineCells[v_L];
        for (let _i448 = 0; _i448 < _a447.length; _i448++) {
          const v_c = _a447[_i448];
          let _c457: boolean = head(sp, cl, v_L, v_c);
          if (_c457) {
            const _t449 = run(sp, cl, v_L, v_c);
            const _h450 = _t449.length;
            let _c456: boolean = (listLength(cl.numbers.digits[_k440]) === _h450);
            if (_c456) {
              let _q451 = true;
              Q452: {
                const _a453 = _t449;
                for (let _i454 = 0; _i454 < _a453.length; _i454++) {
                  const v_x = _a453[_i454];
                  const _h455 = (g[v_x] || -1);
                  if (!((_h455 === nth(cl.numbers.digits[_k440], _i454)))) {
                    _q451 = false;
                    break Q452;
                  }
                }
              }
              _c456 = _q451;
            }
            _c457 = _c456;
          }
          if (!(_c457)) continue;
          _g443++;
        }
      }
    }
    if (!((_g443 === 1))) return false;
  }
  return true;
}

export interface OnlyNumberBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
}

const onlyNumberFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyNumber(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyNumberBinding> | null): number {
  const _g56: number[] = [];
  const facts = onlyNumberFacts;
  let fired = 0;
  let changed = false;
  const _a47 = sp.lines;
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_L = _a47[_i48];
    const _a49 = sp.lineCells[v_L];
    for (let _i50 = 0; _i50 < _a49.length; _i50++) {
      const v_c = _a49[_i50];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L51: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q52 = false;
        Q53: {
          const _a54 = v_R;
          for (let _i55 = 0; _i55 < _a54.length; _i55++) {
            const v_x = _a54[_i55];
            if (!((b.grid[v_x] !== 0))) {
              _q52 = true;
              break Q53;
            }
          }
        }
        if (!(_q52)) break L51;
        const _h63 = v_R.length;
        _g56.length = 0;
        G57: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c68: boolean = (listLength(cl.numbers.digits[v_k]) === _h63);
            if (_c68) {
              let _q64 = true;
              Q65: {
                const _a66 = v_R;
                for (let _i67 = 0; _i67 < _a66.length; _i67++) {
                  const v_x = _a66[_i67];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i67)) & 1) !== 0))) {
                    _q64 = false;
                    break Q65;
                  }
                }
              }
              _c68 = _q64;
            }
            if (!((_c68 && !(written(b, sp, cl, v_k))))) continue;
            _g56.push(v_k);
          }
        }
        L69: {
          const v_K = _g56;
          const _h70 = v_K.length;
          if (!((_h70 < 2))) break L69;
          facts.length = 0;
          changed = false;
          let _c77: boolean = (_h70 === 1);
          if (_c77) {
            let _q71 = true;
            Q72: {
              const _a73 = v_R;
              for (let _i74 = 0; _i74 < _a73.length; _i74++) {
                const v_x = _a73[_i74];
                if (!(!((b.grid[v_x] !== 0)))) continue;
                const _t75 = (v_K.length > 0 ? v_K[0] : -1);
                const _t76 = nth(cl.numbers.digits[_t75], _i74);
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t76); changed = true; } else facts.push(PLACE, v_x, _t76); }
                if (!(true)) {
                  _q71 = false;
                  break Q72;
                }
              }
            }
            _c77 = _q71;
          }
          if (!(_c77)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyRunBinding {
  k: number;
  L: number;
  c: number;
  R: readonly number[];
}

const onlyRunFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function onlyRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunBinding> | null): number {
  const facts = onlyRunFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
    let _c117: boolean = !(written(b, sp, cl, v_k));
    if (_c117) {
      let _g103 = 0;
      G104: {
        const _a105 = sp.lines;
        for (let _i106 = 0; _i106 < _a105.length; _i106++) {
          const v_M = _a105[_i106];
          const _a107 = sp.lineCells[v_M];
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_b = _a107[_i108];
            let _c116: boolean = head(sp, cl, v_M, v_b);
            if (_c116) {
              const _t109 = run(sp, cl, v_M, v_b);
              const _h110 = _t109.length;
              let _c115: boolean = (listLength(cl.numbers.digits[v_k]) === _h110);
              if (_c115) {
                let _q111 = true;
                Q112: {
                  const _a113 = _t109;
                  for (let _i114 = 0; _i114 < _a113.length; _i114++) {
                    const v_x = _a113[_i114];
                    if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i114)) & 1) !== 0))) {
                      _q111 = false;
                      break Q112;
                    }
                  }
                }
                _c115 = _q111;
              }
              _c116 = _c115;
            }
            if (!(_c116)) continue;
            _g103++;
          }
        }
      }
      _c117 = (_g103 === 1);
    }
    if (!(_c117)) continue;
    const _a118 = sp.lines;
    for (let _i119 = 0; _i119 < _a118.length; _i119++) {
      const v_L = _a118[_i119];
      const _a120 = sp.lineCells[v_L];
      for (let _i121 = 0; _i121 < _a120.length; _i121++) {
        const v_c = _a120[_i121];
        let _c129: boolean = head(sp, cl, v_L, v_c);
        if (_c129) {
          const _t122 = run(sp, cl, v_L, v_c);
          const _h123 = _t122.length;
          let _c128: boolean = (listLength(cl.numbers.digits[v_k]) === _h123);
          if (_c128) {
            let _q124 = true;
            Q125: {
              const _a126 = _t122;
              for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                const v_x = _a126[_i127];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i127)) & 1) !== 0))) {
                  _q124 = false;
                  break Q125;
                }
              }
            }
            _c128 = _q124;
          }
          _c129 = _c128;
        }
        if (!(_c129)) continue;
        const v_R = run(sp, cl, v_L, v_c);
        facts.length = 0;
        changed = false;
        let _q130 = true;
        Q131: {
          const _a132 = v_R;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_x = _a132[_i133];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _t134 = nth(cl.numbers.digits[v_k], _i133);
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t134); changed = true; } else facts.push(PLACE, v_x, _t134); }
            if (!(true)) {
              _q130 = false;
              break Q131;
            }
          }
        }
        if (!(_q130)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ k: v_k, L: v_L, c: v_c, R: v_R.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface SharedDigitBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
  x: number;
  D: number;
}

const sharedDigitFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function sharedDigit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedDigitBinding> | null): number {
  const _g176: number[] = [];
  const facts = sharedDigitFacts;
  let fired = 0;
  let changed = false;
  const _a167 = sp.lines;
  for (let _i168 = 0; _i168 < _a167.length; _i168++) {
    const v_L = _a167[_i168];
    const _a169 = sp.lineCells[v_L];
    for (let _i170 = 0; _i170 < _a169.length; _i170++) {
      const v_c = _a169[_i170];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L171: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q172 = false;
        Q173: {
          const _a174 = v_R;
          for (let _i175 = 0; _i175 < _a174.length; _i175++) {
            const v_x = _a174[_i175];
            if (!((b.grid[v_x] !== 0))) {
              _q172 = true;
              break Q173;
            }
          }
        }
        if (!(_q172)) break L171;
        const _h183 = v_R.length;
        _g176.length = 0;
        G177: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c188: boolean = (listLength(cl.numbers.digits[v_k]) === _h183);
            if (_c188) {
              let _q184 = true;
              Q185: {
                const _a186 = v_R;
                for (let _i187 = 0; _i187 < _a186.length; _i187++) {
                  const v_x = _a186[_i187];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i187)) & 1) !== 0))) {
                    _q184 = false;
                    break Q185;
                  }
                }
              }
              _c188 = _q184;
            }
            if (!((_c188 && !(written(b, sp, cl, v_k))))) continue;
            _g176.push(v_k);
          }
        }
        L189: {
          const v_K = _g176;
          const _h190 = v_K.length;
          if (!((_h190 > 0))) break L189;
          const _a191 = v_R;
          for (let _i192 = 0; _i192 < _a191.length; _i192++) {
            const v_x = _a191[_i192];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            const _h199 = _i192;
            let _g193 = 0;
            G194: {
              const _a197 = v_K;
              for (let _i198 = 0; _i198 < _a197.length; _i198++) {
                const v_k = _a197[_i198];
                const _t200 = nth(cl.numbers.digits[v_k], _h199);
                _g193 |= 1 << _t200;
              }
            }
            L201: {
              const v_D = _g193;
              const _h202 = popcount(v_D);
              if (!((_h202 === 1))) break L201;
              facts.length = 0;
              changed = false;
              const _t203 = least(v_D);
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t203); changed = true; } else facts.push(PLACE, v_x, _t203); }
              if (!(true)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice(), x: v_x, D: v_D }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface CrossRunsBinding {
  x: number;
  A: readonly number[];
  B: readonly number[];
  KA: readonly number[];
  KB: readonly number[];
  D: number;
}

const crossRunsFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function crossRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CrossRunsBinding> | null): number {
  const _g264: number[] = [];
  const _g276: number[] = [];
  const facts = crossRunsFacts;
  let fired = 0;
  let changed = false;
  const _a258 = sp.cells;
  for (let _i259 = 0; _i259 < _a258.length; _i259++) {
    const v_x = _a258[_i259];
    const _h260 = clueAt(cl.blank, v_x);
    if (!(((_h260 < 0) && !((b.grid[v_x] !== 0))))) continue;
    const v_A = run(sp, cl, sp.rowOf[v_x], v_x);
    const _h262 = v_A.length;
    const _h308 = v_A.indexOf(v_x);
    L261: {
      const v_B = run(sp, cl, sp.colOf[v_x], v_x);
      const _h263 = v_B.length;
      if (!(((_h262 >= 2) && (_h263 >= 2)))) break L261;
      const _h315 = v_B.indexOf(v_x);
      _g264.length = 0;
      G265: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c275: boolean = (listLength(cl.numbers.digits[v_k]) === _h262);
          if (_c275) {
            let _q271 = true;
            Q272: {
              const _a273 = v_A;
              for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                const v_x = _a273[_i274];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i274)) & 1) !== 0))) {
                  _q271 = false;
                  break Q272;
                }
              }
            }
            _c275 = _q271;
          }
          if (!((_c275 && !(written(b, sp, cl, v_k))))) continue;
          _g264.push(v_k);
        }
      }
      const v_KA = _g264;
      _g276.length = 0;
      G277: {
        for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
          let _c287: boolean = (listLength(cl.numbers.digits[v_k]) === _h263);
          if (_c287) {
            let _q283 = true;
            Q284: {
              const _a285 = v_B;
              for (let _i286 = 0; _i286 < _a285.length; _i286++) {
                const v_x = _a285[_i286];
                if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i286)) & 1) !== 0))) {
                  _q283 = false;
                  break Q284;
                }
              }
            }
            _c287 = _q283;
          }
          if (!((_c287 && !(written(b, sp, cl, v_k))))) continue;
          _g276.push(v_k);
        }
      }
      const v_KB = _g276;
      let _g288 = 0;
      G289: {
        let _g302 = 0;
        G303: {
          const _a306 = v_KA;
          for (let _i307 = 0; _i307 < _a306.length; _i307++) {
            const v_k = _a306[_i307];
            const _t309 = nth(cl.numbers.digits[v_k], _h308);
            _g302 |= 1 << _t309;
          }
        }
        for (let _m310 = _g302; _m310 !== 0; _m310 &= _m310 - 1) {
          const v_d = 31 - Math.clz32(_m310 & -_m310);
          let _q311 = false;
          Q312: {
            const _a313 = v_KB;
            for (let _i314 = 0; _i314 < _a313.length; _i314++) {
              const v_k = _a313[_i314];
              if ((nth(cl.numbers.digits[v_k], _h315) === v_d)) {
                _q311 = true;
                break Q312;
              }
            }
          }
          if (!(_q311)) continue;
          _g288 |= 1 << v_d;
        }
      }
      L316: {
        const v_D = _g288;
        const _h317 = popcount(v_D);
        if (!((_h317 === 1))) break L316;
        facts.length = 0;
        changed = false;
        const _t318 = least(v_D);
        if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, _t318); changed = true; } else facts.push(PLACE, v_x, _t318); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ x: v_x, A: v_A.slice(), B: v_B.slice(), KA: v_KA.slice(), KB: v_KB.slice(), D: v_D }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface NarrowBinding {
  L: number;
  c: number;
  R: readonly number[];
  K: readonly number[];
  x: number;
}

const narrowFacts: number[] = [];
let narrowCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function narrow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<NarrowBinding> | null): number {
  const _g352: number[] = [];
  const facts = narrowFacts;
  let fired = 0;
  let changed = false;
  if (narrowCands.length < sp.cells.length) narrowCands = new Int32Array(sp.cells.length);
  const cands = narrowCands;
  cands.fill(-1);
  const _a342 = sp.lines;
  for (let _i343 = 0; _i343 < _a342.length; _i343++) {
    const v_L = _a342[_i343];
    const _a344 = sp.lineCells[v_L];
    for (let _i345 = 0; _i345 < _a344.length; _i345++) {
      const v_c = _a344[_i345];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L346: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q347 = false;
        Q348: {
          const _a349 = v_R;
          for (let _i350 = 0; _i350 < _a349.length; _i350++) {
            const v_x = _a349[_i350];
            const _h351 = (b.grid[v_x] !== 0);
            if (!(_h351)) {
              _q347 = true;
              break Q348;
            }
          }
        }
        if (!(_q347)) break L346;
        const _h359 = v_R.length;
        _g352.length = 0;
        G353: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c364: boolean = (listLength(cl.numbers.digits[v_k]) === _h359);
            if (_c364) {
              let _q360 = true;
              Q361: {
                const _a362 = v_R;
                for (let _i363 = 0; _i363 < _a362.length; _i363++) {
                  const v_x = _a362[_i363];
                  if (!((((b.cands[v_x] >> nth(cl.numbers.digits[v_k], _i363)) & 1) !== 0))) {
                    _q360 = false;
                    break Q361;
                  }
                }
              }
              _c364 = _q360;
            }
            if (!((_c364 && !(written(b, sp, cl, v_k))))) continue;
            _g352.push(v_k);
          }
        }
        const v_K = _g352;
        const _a365 = v_R;
        for (let _i366 = 0; _i366 < _a365.length; _i366++) {
          const v_x = _a365[_i366];
          const _h367 = (b.grid[v_x] !== 0);
          if (!(!(_h367))) continue;
          const _h375 = _i366;
          facts.length = 0;
          changed = false;
          let _q368 = true;
          Q369: {
            for (let _m370 = (cands[v_x] >= 0 ? cands[v_x] : (cands[v_x] = b.cands[v_x])); _m370 !== 0; _m370 &= _m370 - 1) {
              const v_d = 31 - Math.clz32(_m370 & -_m370);
              let _q371 = false;
              Q372: {
                const _a373 = v_K;
                for (let _i374 = 0; _i374 < _a373.length; _i374++) {
                  const v_k = _a373[_i374];
                  if ((nth(cl.numbers.digits[v_k], _h375) === v_d)) {
                    _q371 = true;
                    break Q372;
                  }
                }
              }
              if (!(!(_q371))) continue;
              if ((((b.cands[v_x] >> v_d) & 1) !== 0)) { if (fire === null) { b.strikeAt(v_x, v_d); changed = true; } else facts.push(STRIKE, v_x, v_d); }
              if (!(true)) {
                _q368 = false;
                break Q369;
              }
            }
          }
          if (!(_q368)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), K: v_K.slice(), x: v_x }, facts)) return 1;
            cands.fill(-1);
          }
        }
      }
    }
  }
  return fired;
}

export interface MisreadBinding {
  L: number;
  c: number;
  R: readonly number[];
}

const misreadFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function misread(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<MisreadBinding> | null): number {
  const facts = misreadFacts;
  let fired = 0;
  let changed = false;
  const _a385 = sp.lines;
  for (let _i386 = 0; _i386 < _a385.length; _i386++) {
    const v_L = _a385[_i386];
    const _a387 = sp.lineCells[v_L];
    for (let _i388 = 0; _i388 < _a387.length; _i388++) {
      const v_c = _a387[_i388];
      if (!(head(sp, cl, v_L, v_c))) continue;
      L389: {
        const v_R = run(sp, cl, v_L, v_c);
        let _q390 = true;
        Q391: {
          const _a392 = v_R;
          for (let _i393 = 0; _i393 < _a392.length; _i393++) {
            const v_x = _a392[_i393];
            const _h394 = (b.grid[v_x] !== 0);
            if (!(_h394)) {
              _q390 = false;
              break Q391;
            }
          }
        }
        if (!(_q390)) break L389;
        const _h397 = v_R.length;
        facts.length = 0;
        changed = false;
        let _q395 = false;
        Q396: {
          for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
            let _c403: boolean = (listLength(cl.numbers.digits[v_k]) === _h397);
            if (_c403) {
              let _q398 = true;
              Q399: {
                const _a400 = v_R;
                for (let _i401 = 0; _i401 < _a400.length; _i401++) {
                  const v_x = _a400[_i401];
                  const _h402 = (b.grid[v_x] || -1);
                  if (!((_h402 === nth(cl.numbers.digits[v_k], _i401)))) {
                    _q398 = false;
                    break Q399;
                  }
                }
              }
              _c403 = _q398;
            }
            if (_c403) {
              _q395 = true;
              break Q396;
            }
          }
        }
        if (!(_q395)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice() }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TwiceBinding {
  k: number;
}

const twiceFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function twice(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TwiceBinding> | null): number {
  const facts = twiceFacts;
  let fired = 0;
  let changed = false;
  for (let v_k = 0; v_k < cl.numbers.n; v_k++) {
    facts.length = 0;
    changed = false;
    let _g404 = 0;
    G405: {
      const _a406 = sp.lines;
      for (let _i407 = 0; _i407 < _a406.length; _i407++) {
        const v_L = _a406[_i407];
        const _a408 = sp.lineCells[v_L];
        for (let _i409 = 0; _i409 < _a408.length; _i409++) {
          const v_c = _a408[_i409];
          let _c418: boolean = head(sp, cl, v_L, v_c);
          if (_c418) {
            const _t410 = run(sp, cl, v_L, v_c);
            const _h411 = _t410.length;
            let _c417: boolean = (listLength(cl.numbers.digits[v_k]) === _h411);
            if (_c417) {
              let _q412 = true;
              Q413: {
                const _a414 = _t410;
                for (let _i415 = 0; _i415 < _a414.length; _i415++) {
                  const v_x = _a414[_i415];
                  const _h416 = (b.grid[v_x] || -1);
                  if (!((_h416 === nth(cl.numbers.digits[v_k], _i415)))) {
                    _q412 = false;
                    break Q413;
                  }
                }
              }
              _c417 = _q412;
            }
            _c418 = _c417;
          }
          if (!(_c418)) continue;
          _g404++;
        }
      }
    }
    if (!((_g404 < 2))) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ k: v_k }, facts)) return 1;
    }
  }
  return fired;
}

const runKept = keptStore<Kept<readonly number[]>>();

/** `run(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function run(sp: GridSpace, cl: Dealt, v_L: number, v_c: number): readonly number[] {
  const _kept: Kept<Kept<readonly number[]>> = runKept.board(cl);
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  const _g7: number[] = [];
  G8: {
    const _a11 = sp.cells;
    for (let _i12 = 0; _i12 < _a11.length; _i12++) {
      const v_c = _a11[_i12];
      if (!((clueAt(cl.blank, v_c) < 0))) continue;
      _g7.push(v_c);
    }
  }
  const _made = stretch(sp.lineCells[v_L], v_c, _g7);
  _kept1[v_c] = _made;
  return _made;
}

const headKept = keptStore<Kept<boolean>>();

/** `head(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function head(sp: GridSpace, cl: Dealt, v_L: number, v_c: number): boolean {
  const _kept: Kept<Kept<boolean>> = headKept.board(cl);
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  let _c14: boolean = ((clueAt(cl.blank, v_c) < 0) && (run(sp, cl, v_L, v_c).length >= 2));
  if (_c14) {
    const _t13 = run(sp, cl, v_L, v_c);
    _c14 = ((_t13.length > 0 ? _t13[0] : -1) === v_c);
  }
  const _made = _c14;
  _kept1[v_c] = _made;
  return _made;
}

const writtenKept = keptStore<boolean>();

/** `written(k)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function written(b: Marks, sp: GridSpace, cl: Dealt, v_k: number): boolean {
  const _kept: Kept<boolean> = writtenKept.marks(b);
  if (_kept[v_k] !== undefined) return _kept[v_k];
  let _q27 = false;
  Q28: {
    const _t29 = nth(cl.numbers.digits[v_k], 0);
    const _a30 = cellsValued(b, sp.cells, _t29);
    for (let _i31 = 0; _i31 < _a30.length; _i31++) {
      const v_c = _a30[_i31];
      if (!(((b.grid[v_c] || -1) === nth(cl.numbers.digits[v_k], 0)))) continue;
      const _t32 = sp.rowOf[v_c];
      const _t33 = sp.colOf[v_c];
      for (let _i34 = 0; _i34 < 2; _i34++) {
        const v_L = _i34 === 0 ? _t32 : _t33;
        if (_i34 === 1 && (v_L === _t32)) continue;
        if (!(head(sp, cl, v_L, v_c))) continue;
        const _t35 = run(sp, cl, v_L, v_c);
        let _c40: boolean = (listLength(cl.numbers.digits[v_k]) === _t35.length);
        if (_c40) {
          let _q36 = true;
          Q37: {
            const _a38 = _t35;
            for (let _i39 = 0; _i39 < _a38.length; _i39++) {
              const v_x = _a38[_i39];
              if (!(((b.grid[v_x] || -1) === nth(cl.numbers.digits[v_k], _i39)))) {
                _q36 = false;
                break Q37;
              }
            }
          }
          _c40 = _q36;
        }
        if (_c40) {
          _q27 = true;
          break Q28;
        }
      }
    }
  }
  const _made = _q27;
  _kept[v_k] = _made;
  return _made;
}
