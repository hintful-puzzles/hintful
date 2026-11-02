// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, rangeMask, stretch } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  hole: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "strandSupport" | "undercount" | "three" | "unsupported" | "overcount";

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
  { id: "strandSupport", tier: 0 },
  { id: "undercount", tier: 0 },
  { id: "three", tier: 0 },
  { id: "unsupported", tier: 0 },
  { id: "overcount", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let _m4 = rangeMask(1, 2); _m4 !== 0; _m4 &= _m4 - 1) {
      const v_d = 31 - Math.clz32(_m4 & -_m4);
      if (!(((v_d === 2) || ((clueAt(cl.hole, v_c) < 0) && (clueAt(cl.number, v_c) < 0))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g247: number[] = [];
  const _g259: number[] = [];
  const _g269: number[] = [];
  const _g288: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q243 = true;
  Q244: {
    const _a245 = sp.cells;
    for (let _i246 = 0; _i246 < _a245.length; _i246++) {
      const v_c = _a245[_i246];
      _g247.length = 0;
      G248: {
        const _a251 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i252 = 0; _i252 < _a251.length; _i252++) {
          const v_x = _a251[_i252];
          if (!(((g[v_x] || -1) === 1))) continue;
          _g247.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g247).length <= 2))) {
        _q243 = false;
        break Q244;
      }
    }
  }
  if (!(_q243)) return false;
  let _q253 = true;
  Q254: {
    const _a255 = sp.cells;
    for (let _i256 = 0; _i256 < _a255.length; _i256++) {
      const v_c = _a255[_i256];
      if (!(((g[v_c] || -1) === 1))) continue;
      let _c279 = (((v_c / sp.w) | 0) === (sp.h - 1));
      if (!_c279) {
        let _q257 = false;
        Q258: {
          _g259.length = 0;
          G260: {
            _g269.length = 0;
            G270: {
              const _a273 = sp.adj8[v_c];
              for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                const v_p = _a273[_i274];
                if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
                _g269.push(v_p);
              }
            }
            const _a275 = _g269;
            for (let _i276 = 0; _i276 < _a275.length; _i276++) {
              const v_p = _a275[_i276];
              if (!((((v_p / sp.w) | 0) > ((v_c / sp.w) | 0)))) continue;
              _g259.push(v_p);
            }
          }
          const _a277 = _g259;
          for (let _i278 = 0; _i278 < _a277.length; _i278++) {
            const v_p = _a277[_i278];
            if (((g[v_p] || -1) === 1)) {
              _q257 = true;
              break Q258;
            }
          }
        }
        _c279 = _q257;
      }
      if (!(_c279)) {
        _q253 = false;
        break Q254;
      }
    }
  }
  if (!(_q253)) return false;
  for (let _k280 = 0; _k280 < cl.hole.at.length; _k280++) {
    const _at281 = cl.hole.at[_k280];
    if (!(((g[_at281] || -1) === 2))) return false;
  }
  for (let _k283 = 0; _k283 < cl.number.at.length; _k283++) {
    const _at284 = cl.number.at[_k283];
    const _v285 = cl.number.v[_k283];
    let _c296 = ((g[_at284] || -1) === 2);
    if (_c296) {
      let _g286 = 0;
      G287: {
        _g288.length = 0;
        G289: {
          const _a292 = sp.adj8[_at284];
          for (let _i293 = 0; _i293 < _a292.length; _i293++) {
            const v_p = _a292[_i293];
            if (!((((v_p % sp.w) - (_at284 % sp.w)) !== (((v_p / sp.w) | 0) - ((_at284 / sp.w) | 0))))) continue;
            _g288.push(v_p);
          }
        }
        const _a294 = _g288;
        for (let _i295 = 0; _i295 < _a294.length; _i295++) {
          const v_p = _a294[_i295];
          if (!(((g[v_p] || -1) === 1))) continue;
          _g286++;
        }
      }
      _c296 = (_g286 === _v285);
    }
    if (!(_c296)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

const strandSupportFacts: number[] = [];

export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding> | null): number {
  const _g12: number[] = [];
  const _g22: number[] = [];
  const _g36: number[] = [];
  const _g46: number[] = [];
  const _g58: number[] = [];
  const _g68: number[] = [];
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h9 = (sp.h - 1);
  const _a7 = sp.cells;
  for (let _i8 = 0; _i8 < _a7.length; _i8++) {
    const v_a = _a7[_i8];
    if (!(((b.value(v_a) === 1) && (((v_a / sp.w) | 0) < _h9)))) continue;
    const _h28 = (v_a % sp.w);
    const _h29 = ((v_a / sp.w) | 0);
    facts.length = 0;
    changed = false;
    let _q10 = false;
    Q11: {
      _g12.length = 0;
      G13: {
        _g22.length = 0;
        G23: {
          const _a26 = sp.adj8[v_a];
          for (let _i27 = 0; _i27 < _a26.length; _i27++) {
            const v_p = _a26[_i27];
            if (!((((v_p % sp.w) - _h28) !== (((v_p / sp.w) | 0) - _h29)))) continue;
            _g22.push(v_p);
          }
        }
        const _a30 = _g22;
        for (let _i31 = 0; _i31 < _a30.length; _i31++) {
          const v_p = _a30[_i31];
          if (!((((v_p / sp.w) | 0) > _h29))) continue;
          _g12.push(v_p);
        }
      }
      const _a32 = _g12;
      for (let _i33 = 0; _i33 < _a32.length; _i33++) {
        const v_p = _a32[_i33];
        if ((b.value(v_p) !== 2)) {
          _q10 = true;
          break Q11;
        }
      }
    }
    let _c79 = _q10;
    if (_c79) {
      let _q34 = true;
      Q35: {
        _g36.length = 0;
        G37: {
          _g46.length = 0;
          G47: {
            const _a50 = sp.adj8[v_a];
            for (let _i51 = 0; _i51 < _a50.length; _i51++) {
              const v_p = _a50[_i51];
              if (!((((v_p % sp.w) - _h28) !== (((v_p / sp.w) | 0) - _h29)))) continue;
              _g46.push(v_p);
            }
          }
          const _a52 = _g46;
          for (let _i53 = 0; _i53 < _a52.length; _i53++) {
            const v_p = _a52[_i53];
            if (!((((v_p / sp.w) | 0) > _h29))) continue;
            _g36.push(v_p);
          }
        }
        const _a54 = _g36;
        for (let _i55 = 0; _i55 < _a54.length; _i55++) {
          const v_c = _a54[_i55];
          let _c78 = !(b.known(v_c));
          if (_c78) {
            let _q56 = true;
            Q57: {
              _g58.length = 0;
              G59: {
                _g68.length = 0;
                G69: {
                  const _a72 = sp.adj8[v_a];
                  for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                    const v_p = _a72[_i73];
                    if (!((((v_p % sp.w) - _h28) !== (((v_p / sp.w) | 0) - _h29)))) continue;
                    _g68.push(v_p);
                  }
                }
                const _a74 = _g68;
                for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                  const v_p = _a74[_i75];
                  if (!((((v_p / sp.w) | 0) > _h29))) continue;
                  _g58.push(v_p);
                }
              }
              const _a76 = _g58;
              for (let _i77 = 0; _i77 < _a76.length; _i77++) {
                const v_p = _a76[_i77];
                if (!((v_p !== v_c))) continue;
                if (!((b.value(v_p) === 2))) {
                  _q56 = false;
                  break Q57;
                }
              }
            }
            _c78 = _q56;
          }
          if (!(_c78)) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q34 = false;
            break Q35;
          }
        }
      }
      _c79 = _q34;
    }
    if (!(_c79)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ a: v_a }, facts)) return 1;
    }
  }
  return fired;
}

export interface UndercountBinding {
  k: number;
  n: number;
}

const undercountFacts: number[] = [];

export function undercount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<UndercountBinding> | null): number {
  const _g89: number[] = [];
  const _g101: number[] = [];
  const _g111: number[] = [];
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _a83 = sp.cells;
  for (let _i84 = 0; _i84 < _a83.length; _i84++) {
    const v_k = _a83[_i84];
    const _h85 = clueAt(cl.number, v_k);
    const _h95 = (v_k % sp.w);
    const _h96 = ((v_k / sp.w) | 0);
    L86: {
      const v_n = _h85;
      if (!((v_n >= 0))) break L86;
      facts.length = 0;
      changed = false;
      let _g87 = 0;
      G88: {
        _g89.length = 0;
        G90: {
          const _a93 = sp.adj8[v_k];
          for (let _i94 = 0; _i94 < _a93.length; _i94++) {
            const v_p = _a93[_i94];
            if (!((((v_p % sp.w) - _h95) !== (((v_p / sp.w) | 0) - _h96)))) continue;
            _g89.push(v_p);
          }
        }
        const _a97 = _g89;
        for (let _i98 = 0; _i98 < _a97.length; _i98++) {
          const v_p = _a97[_i98];
          if (!((b.value(v_p) !== 2))) continue;
          _g87++;
        }
      }
      let _c120 = (_g87 >= v_n);
      if (_c120) {
        let _g99 = 0;
        G100: {
          _g101.length = 0;
          G102: {
            const _a105 = sp.adj8[v_k];
            for (let _i106 = 0; _i106 < _a105.length; _i106++) {
              const v_p = _a105[_i106];
              if (!((((v_p % sp.w) - _h95) !== (((v_p / sp.w) | 0) - _h96)))) continue;
              _g101.push(v_p);
            }
          }
          const _a107 = _g101;
          for (let _i108 = 0; _i108 < _a107.length; _i108++) {
            const v_p = _a107[_i108];
            if (!((b.value(v_p) !== 2))) continue;
            _g99++;
          }
        }
        let _c119 = (_g99 > v_n);
        if (!_c119) {
          let _q109 = true;
          Q110: {
            _g111.length = 0;
            G112: {
              const _a115 = sp.adj8[v_k];
              for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                const v_p = _a115[_i116];
                if (!((((v_p % sp.w) - _h95) !== (((v_p / sp.w) | 0) - _h96)))) continue;
                _g111.push(v_p);
              }
            }
            const _a117 = _g111;
            for (let _i118 = 0; _i118 < _a117.length; _i118++) {
              const v_c = _a117[_i118];
              if (!(!(b.known(v_c)))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q109 = false;
                break Q110;
              }
            }
          }
          _c119 = _q109;
        }
        _c120 = _c119;
      }
      if (!(_c120)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface ThreeBinding {
  L: number;
}

const threeFacts: number[] = [];

export function three(b: Marks, sp: GridSpace, fire: Fire<ThreeBinding> | null): number {
  const _g129: number[] = [];
  const _g141: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a123 = sp.rows;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_L = _a123[_i124];
    facts.length = 0;
    changed = false;
    let _q125 = true;
    Q126: {
      const _a127 = sp.lineCells[v_L];
      for (let _i128 = 0; _i128 < _a127.length; _i128++) {
        const v_c = _a127[_i128];
        if (!((b.value(v_c) === 1))) continue;
        _g129.length = 0;
        G130: {
          const _a133 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i134 = 0; _i134 < _a133.length; _i134++) {
            const v_x = _a133[_i134];
            if (!((b.value(v_x) === 1))) continue;
            _g129.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g129).length <= 2))) {
          _q125 = false;
          break Q126;
        }
      }
    }
    let _c148 = _q125;
    if (_c148) {
      let _q135 = true;
      Q136: {
        const _a137 = sp.lineCells[v_L];
        for (let _i138 = 0; _i138 < _a137.length; _i138++) {
          const v_c = _a137[_i138];
          let _c147 = !(b.known(v_c));
          if (_c147) {
            const _wc139 = v_c;
            const _wd140 = 1;
            _g141.length = 0;
            G142: {
              const _a145 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i146 = 0; _i146 < _a145.length; _i146++) {
                const v_x = _a145[_i146];
                if (!(((v_x === _wc139 ? _wd140 : b.value(v_x)) === 1))) continue;
                _g141.push(v_x);
              }
            }
            _c147 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g141).length > 2);
          }
          if (!(_c147)) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q135 = false;
            break Q136;
          }
        }
      }
      _c148 = _q135;
    }
    if (!(_c148)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L }, facts)) return 1;
    }
  }
  return fired;
}

export interface UnsupportedBinding {
  c: number;
}

const unsupportedFacts: number[] = [];

export function unsupported(b: Marks, sp: GridSpace, fire: Fire<UnsupportedBinding> | null): number {
  const _g179: number[] = [];
  const _g189: number[] = [];
  const facts = unsupportedFacts;
  let fired = 0;
  let changed = false;
  const _h176 = (sp.h - 1);
  const _a174 = sp.cells;
  for (let _i175 = 0; _i175 < _a174.length; _i175++) {
    const v_c = _a174[_i175];
    const _h195 = (v_c % sp.w);
    const _h196 = ((v_c / sp.w) | 0);
    let _c201 = (!(b.known(v_c)) && (((v_c / sp.w) | 0) < _h176));
    if (_c201) {
      let _q177 = false;
      Q178: {
        _g179.length = 0;
        G180: {
          _g189.length = 0;
          G190: {
            const _a193 = sp.adj8[v_c];
            for (let _i194 = 0; _i194 < _a193.length; _i194++) {
              const v_p = _a193[_i194];
              if (!((((v_p % sp.w) - _h195) !== (((v_p / sp.w) | 0) - _h196)))) continue;
              _g189.push(v_p);
            }
          }
          const _a197 = _g189;
          for (let _i198 = 0; _i198 < _a197.length; _i198++) {
            const v_p = _a197[_i198];
            if (!((((v_p / sp.w) | 0) > _h196))) continue;
            _g179.push(v_p);
          }
        }
        const _a199 = _g179;
        for (let _i200 = 0; _i200 < _a199.length; _i200++) {
          const v_p = _a199[_i200];
          if ((b.value(v_p) !== 2)) {
            _q177 = true;
            break Q178;
          }
        }
      }
      _c201 = !(_q177);
    }
    if (!(_c201)) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface OvercountBinding {
  k: number;
  n: number;
}

const overcountFacts: number[] = [];

export function overcount(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OvercountBinding> | null): number {
  const _g211: number[] = [];
  const _g223: number[] = [];
  const _g233: number[] = [];
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _a205 = sp.cells;
  for (let _i206 = 0; _i206 < _a205.length; _i206++) {
    const v_k = _a205[_i206];
    const _h207 = clueAt(cl.number, v_k);
    const _h217 = (v_k % sp.w);
    const _h218 = ((v_k / sp.w) | 0);
    L208: {
      const v_n = _h207;
      if (!((v_n >= 0))) break L208;
      facts.length = 0;
      changed = false;
      let _g209 = 0;
      G210: {
        _g211.length = 0;
        G212: {
          const _a215 = sp.adj8[v_k];
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            const v_p = _a215[_i216];
            if (!((((v_p % sp.w) - _h217) !== (((v_p / sp.w) | 0) - _h218)))) continue;
            _g211.push(v_p);
          }
        }
        const _a219 = _g211;
        for (let _i220 = 0; _i220 < _a219.length; _i220++) {
          const v_p = _a219[_i220];
          if (!((b.value(v_p) === 1))) continue;
          _g209++;
        }
      }
      let _c242 = (_g209 <= v_n);
      if (_c242) {
        let _g221 = 0;
        G222: {
          _g223.length = 0;
          G224: {
            const _a227 = sp.adj8[v_k];
            for (let _i228 = 0; _i228 < _a227.length; _i228++) {
              const v_p = _a227[_i228];
              if (!((((v_p % sp.w) - _h217) !== (((v_p / sp.w) | 0) - _h218)))) continue;
              _g223.push(v_p);
            }
          }
          const _a229 = _g223;
          for (let _i230 = 0; _i230 < _a229.length; _i230++) {
            const v_p = _a229[_i230];
            if (!((b.value(v_p) === 1))) continue;
            _g221++;
          }
        }
        let _c241 = (_g221 < v_n);
        if (!_c241) {
          let _q231 = true;
          Q232: {
            _g233.length = 0;
            G234: {
              const _a237 = sp.adj8[v_k];
              for (let _i238 = 0; _i238 < _a237.length; _i238++) {
                const v_p = _a237[_i238];
                if (!((((v_p % sp.w) - _h217) !== (((v_p / sp.w) | 0) - _h218)))) continue;
                _g233.push(v_p);
              }
            }
            const _a239 = _g233;
            for (let _i240 = 0; _i240 < _a239.length; _i240++) {
              const v_c = _a239[_i240];
              if (!(!(b.known(v_c)))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q231 = false;
                break Q232;
              }
            }
          }
          _c241 = _q231;
        }
        _c242 = _c241;
      }
      if (!(_c242)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}
