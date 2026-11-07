// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, keptStore, stretch, type Kept } from "../../engine/describe-runtime.ts";

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
    for (let v_d = 1; v_d <= 2; v_d++) {
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
  const _g221: number[] = [];
  const _g236: number[] = [];
  const _g246: number[] = [];
  const _g268: number[] = [];
  const _h233 = (sp.h - 1);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q217 = true;
  Q218: {
    const _a219 = sp.cells;
    for (let _i220 = 0; _i220 < _a219.length; _i220++) {
      const v_c = _a219[_i220];
      _g221.length = 0;
      G222: {
        const _a225 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i226 = 0; _i226 < _a225.length; _i226++) {
          const v_x = _a225[_i226];
          const _h227 = (g[v_x] || -1);
          if (!((_h227 === 1))) continue;
          _g221.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g221).length <= 2))) {
        _q217 = false;
        break Q218;
      }
    }
  }
  if (!(_q217)) return false;
  let _q228 = true;
  Q229: {
    const _a230 = sp.cells;
    for (let _i231 = 0; _i231 < _a230.length; _i231++) {
      const v_c = _a230[_i231];
      const _h232 = (g[v_c] || -1);
      if (!((_h232 === 1))) continue;
      const _h252 = (v_c % sp.w);
      const _h253 = ((v_c / sp.w) | 0);
      let _c259: boolean = (((v_c / sp.w) | 0) === _h233);
      if (!_c259) {
        let _q234 = false;
        Q235: {
          _g236.length = 0;
          G237: {
            _g246.length = 0;
            G247: {
              const _a250 = sp.adj8[v_c];
              for (let _i251 = 0; _i251 < _a250.length; _i251++) {
                const v_p = _a250[_i251];
                if (!((((v_p % sp.w) - _h252) !== (((v_p / sp.w) | 0) - _h253)))) continue;
                _g246.push(v_p);
              }
            }
            const _a254 = _g246;
            for (let _i255 = 0; _i255 < _a254.length; _i255++) {
              const v_p = _a254[_i255];
              if (!((((v_p / sp.w) | 0) > _h253))) continue;
              _g236.push(v_p);
            }
          }
          const _a256 = _g236;
          for (let _i257 = 0; _i257 < _a256.length; _i257++) {
            const v_p = _a256[_i257];
            const _h258 = (g[v_p] || -1);
            if ((_h258 === 1)) {
              _q234 = true;
              break Q235;
            }
          }
        }
        _c259 = _q234;
      }
      if (!(_c259)) {
        _q228 = false;
        break Q229;
      }
    }
  }
  if (!(_q228)) return false;
  for (let _k260 = 0; _k260 < cl.hole.at.length; _k260++) {
    const _at261 = cl.hole.at[_k260];
    if (!(((g[_at261] || -1) === 2))) return false;
  }
  for (let _k263 = 0; _k263 < cl.number.at.length; _k263++) {
    const _at264 = cl.number.at[_k263];
    const _v265 = cl.number.v[_k263];
    let _c279: boolean = ((g[_at264] || -1) === 2);
    if (_c279) {
      const _h274 = (_at264 % sp.w);
      const _h275 = ((_at264 / sp.w) | 0);
      let _g266 = 0;
      G267: {
        _g268.length = 0;
        G269: {
          const _a272 = sp.adj8[_at264];
          for (let _i273 = 0; _i273 < _a272.length; _i273++) {
            const v_p = _a272[_i273];
            if (!((((v_p % sp.w) - _h274) !== (((v_p / sp.w) | 0) - _h275)))) continue;
            _g268.push(v_p);
          }
        }
        const _a276 = _g268;
        for (let _i277 = 0; _i277 < _a276.length; _i277++) {
          const v_p = _a276[_i277];
          const _h278 = (g[v_p] || -1);
          if (!((_h278 === 1))) continue;
          _g266++;
        }
      }
      _c279 = (_g266 === _v265);
    }
    if (!(_c279)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

const strandSupportFacts: number[] = [];

export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding> | null): number {
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h7 = (sp.h - 1);
  const _a5 = sp.cells;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    if (!((((b.grid[v_a] || -1) === 1) && (((v_a / sp.w) | 0) < _h7)))) continue;
    facts.length = 0;
    changed = false;
    let _q30 = false;
    Q31: {
      const _a32 = below(sp, v_a);
      for (let _i33 = 0; _i33 < _a32.length; _i33++) {
        const v_p = _a32[_i33];
        if (((b.grid[v_p] || -1) !== 2)) {
          _q30 = true;
          break Q31;
        }
      }
    }
    let _c43: boolean = _q30;
    if (_c43) {
      let _q34 = true;
      Q35: {
        const _a36 = below(sp, v_a);
        for (let _i37 = 0; _i37 < _a36.length; _i37++) {
          const v_c = _a36[_i37];
          let _c42: boolean = !((b.grid[v_c] !== 0));
          if (_c42) {
            let _q38 = true;
            Q39: {
              const _a40 = below(sp, v_a);
              for (let _i41 = 0; _i41 < _a40.length; _i41++) {
                const v_p = _a40[_i41];
                if (!((v_p !== v_c))) continue;
                if (!(((b.grid[v_p] || -1) === 2))) {
                  _q38 = false;
                  break Q39;
                }
              }
            }
            _c42 = _q38;
          }
          if (!(_c42)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q34 = false;
            break Q35;
          }
        }
      }
      _c43 = _q34;
    }
    if (!(_c43)) return -1;
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
  const _g63: number[] = [];
  const _g85: number[] = [];
  const _g95: number[] = [];
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _a47 = sp.cells;
  for (let _i48 = 0; _i48 < _a47.length; _i48++) {
    const v_k = _a47[_i48];
    const _h49 = clueAt(cl.number, v_k);
    const _h69 = (v_k % sp.w);
    const _h70 = ((v_k / sp.w) | 0);
    L50: {
      const v_n = _h49;
      if (!((v_n >= 0))) break L50;
      facts.length = 0;
      changed = false;
      let _g61 = 0;
      G62: {
        _g63.length = 0;
        G64: {
          const _a67 = sp.adj8[v_k];
          for (let _i68 = 0; _i68 < _a67.length; _i68++) {
            const v_p = _a67[_i68];
            if (!((((v_p % sp.w) - _h69) !== (((v_p / sp.w) | 0) - _h70)))) continue;
            _g63.push(v_p);
          }
        }
        const _a71 = _g63;
        for (let _i72 = 0; _i72 < _a71.length; _i72++) {
          const v_p = _a71[_i72];
          if (!(((b.grid[v_p] || -1) !== 2))) continue;
          _g61++;
        }
      }
      let _c104: boolean = (_g61 >= v_n);
      if (_c104) {
        let _g83 = 0;
        G84: {
          _g85.length = 0;
          G86: {
            const _a89 = sp.adj8[v_k];
            for (let _i90 = 0; _i90 < _a89.length; _i90++) {
              const v_p = _a89[_i90];
              if (!((((v_p % sp.w) - _h69) !== (((v_p / sp.w) | 0) - _h70)))) continue;
              _g85.push(v_p);
            }
          }
          const _a91 = _g85;
          for (let _i92 = 0; _i92 < _a91.length; _i92++) {
            const v_p = _a91[_i92];
            if (!(((b.grid[v_p] || -1) !== 2))) continue;
            _g83++;
          }
        }
        let _c103: boolean = (_g83 > v_n);
        if (!_c103) {
          let _q93 = true;
          Q94: {
            _g95.length = 0;
            G96: {
              const _a99 = sp.adj8[v_k];
              for (let _i100 = 0; _i100 < _a99.length; _i100++) {
                const v_p = _a99[_i100];
                if (!((((v_p % sp.w) - _h69) !== (((v_p / sp.w) | 0) - _h70)))) continue;
                _g95.push(v_p);
              }
            }
            const _a101 = _g95;
            for (let _i102 = 0; _i102 < _a101.length; _i102++) {
              const v_c = _a101[_i102];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q93 = false;
                break Q94;
              }
            }
          }
          _c103 = _q93;
        }
        _c104 = _c103;
      }
      if (!(_c104)) return -1;
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
  const _g113: number[] = [];
  const _g125: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a107 = sp.rows;
  for (let _i108 = 0; _i108 < _a107.length; _i108++) {
    const v_L = _a107[_i108];
    facts.length = 0;
    changed = false;
    let _q109 = true;
    Q110: {
      const _a111 = sp.lineCells[v_L];
      for (let _i112 = 0; _i112 < _a111.length; _i112++) {
        const v_c = _a111[_i112];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g113.length = 0;
        G114: {
          const _a117 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i118 = 0; _i118 < _a117.length; _i118++) {
            const v_x = _a117[_i118];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g113.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g113).length <= 2))) {
          _q109 = false;
          break Q110;
        }
      }
    }
    let _c132: boolean = _q109;
    if (_c132) {
      let _q119 = true;
      Q120: {
        const _a121 = sp.lineCells[v_L];
        for (let _i122 = 0; _i122 < _a121.length; _i122++) {
          const v_c = _a121[_i122];
          let _c131: boolean = !((b.grid[v_c] !== 0));
          if (_c131) {
            const _wc123 = v_c;
            const _wd124 = 1;
            _g125.length = 0;
            G126: {
              const _a129 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i130 = 0; _i130 < _a129.length; _i130++) {
                const v_x = _a129[_i130];
                if (!(((v_x === _wc123 ? _wd124 : (b.grid[v_x] || -1)) === 1))) continue;
                _g125.push(v_x);
              }
            }
            _c131 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g125).length > 2);
          }
          if (!(_c131)) continue;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q119 = false;
            break Q120;
          }
        }
      }
      _c132 = _q119;
    }
    if (!(_c132)) return -1;
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
  const facts = unsupportedFacts;
  let fired = 0;
  let changed = false;
  const _h146 = (sp.h - 1);
  const _a144 = sp.cells;
  for (let _i145 = 0; _i145 < _a144.length; _i145++) {
    const v_c = _a144[_i145];
    let _c155: boolean = (!((b.grid[v_c] !== 0)) && (((v_c / sp.w) | 0) < _h146));
    if (_c155) {
      let _q151 = false;
      Q152: {
        const _a153 = below(sp, v_c);
        for (let _i154 = 0; _i154 < _a153.length; _i154++) {
          const v_p = _a153[_i154];
          if (((b.grid[v_p] || -1) !== 2)) {
            _q151 = true;
            break Q152;
          }
        }
      }
      _c155 = !(_q151);
    }
    if (!(_c155)) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
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
  const _g175: number[] = [];
  const _g197: number[] = [];
  const _g207: number[] = [];
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _a159 = sp.cells;
  for (let _i160 = 0; _i160 < _a159.length; _i160++) {
    const v_k = _a159[_i160];
    const _h161 = clueAt(cl.number, v_k);
    const _h181 = (v_k % sp.w);
    const _h182 = ((v_k / sp.w) | 0);
    L162: {
      const v_n = _h161;
      if (!((v_n >= 0))) break L162;
      facts.length = 0;
      changed = false;
      let _g173 = 0;
      G174: {
        _g175.length = 0;
        G176: {
          const _a179 = sp.adj8[v_k];
          for (let _i180 = 0; _i180 < _a179.length; _i180++) {
            const v_p = _a179[_i180];
            if (!((((v_p % sp.w) - _h181) !== (((v_p / sp.w) | 0) - _h182)))) continue;
            _g175.push(v_p);
          }
        }
        const _a183 = _g175;
        for (let _i184 = 0; _i184 < _a183.length; _i184++) {
          const v_p = _a183[_i184];
          if (!(((b.grid[v_p] || -1) === 1))) continue;
          _g173++;
        }
      }
      let _c216: boolean = (_g173 <= v_n);
      if (_c216) {
        let _g195 = 0;
        G196: {
          _g197.length = 0;
          G198: {
            const _a201 = sp.adj8[v_k];
            for (let _i202 = 0; _i202 < _a201.length; _i202++) {
              const v_p = _a201[_i202];
              if (!((((v_p % sp.w) - _h181) !== (((v_p / sp.w) | 0) - _h182)))) continue;
              _g197.push(v_p);
            }
          }
          const _a203 = _g197;
          for (let _i204 = 0; _i204 < _a203.length; _i204++) {
            const v_p = _a203[_i204];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g195++;
          }
        }
        let _c215: boolean = (_g195 < v_n);
        if (!_c215) {
          let _q205 = true;
          Q206: {
            _g207.length = 0;
            G208: {
              const _a211 = sp.adj8[v_k];
              for (let _i212 = 0; _i212 < _a211.length; _i212++) {
                const v_p = _a211[_i212];
                if (!((((v_p % sp.w) - _h181) !== (((v_p / sp.w) | 0) - _h182)))) continue;
                _g207.push(v_p);
              }
            }
            const _a213 = _g207;
            for (let _i214 = 0; _i214 < _a213.length; _i214++) {
              const v_c = _a213[_i214];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q205 = false;
                break Q206;
              }
            }
          }
          _c215 = _q205;
        }
        _c216 = _c215;
      }
      if (!(_c216)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}

const belowKept = keptStore<readonly number[]>();

/** `below(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function below(sp: GridSpace, v_c: number): readonly number[] {
  const _kept: Kept<readonly number[]> = belowKept.board(sp);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  const _g10: number[] = [];
  G11: {
    const _g20: number[] = [];
    G21: {
      const _a24 = sp.adj8[v_c];
      for (let _i25 = 0; _i25 < _a24.length; _i25++) {
        const v_p = _a24[_i25];
        if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
        _g20.push(v_p);
      }
    }
    const _a26 = _g20;
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_p = _a26[_i27];
      if (!((((v_p / sp.w) | 0) > ((v_c / sp.w) | 0)))) continue;
      _g10.push(v_p);
    }
  }
  const _made = _g10;
  _kept[v_c] = _made;
  return _made;
}
