// Compiled by `npm run describe` from src/games/bricks/bricks.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, stretch } from "../../engine/describe-runtime.ts";

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
  const _g245: number[] = [];
  const _g257: number[] = [];
  const _g267: number[] = [];
  const _g286: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q241 = true;
  Q242: {
    const _a243 = sp.cells;
    for (let _i244 = 0; _i244 < _a243.length; _i244++) {
      const v_c = _a243[_i244];
      _g245.length = 0;
      G246: {
        const _a249 = sp.lineCells[sp.rowOf[v_c]];
        for (let _i250 = 0; _i250 < _a249.length; _i250++) {
          const v_x = _a249[_i250];
          if (!(((g[v_x] || -1) === 1))) continue;
          _g245.push(v_x);
        }
      }
      if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g245).length <= 2))) {
        _q241 = false;
        break Q242;
      }
    }
  }
  if (!(_q241)) return false;
  let _q251 = true;
  Q252: {
    const _a253 = sp.cells;
    for (let _i254 = 0; _i254 < _a253.length; _i254++) {
      const v_c = _a253[_i254];
      if (!(((g[v_c] || -1) === 1))) continue;
      let _c277 = (((v_c / sp.w) | 0) === (sp.h - 1));
      if (!_c277) {
        let _q255 = false;
        Q256: {
          _g257.length = 0;
          G258: {
            _g267.length = 0;
            G268: {
              const _a271 = sp.adj8[v_c];
              for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                const v_p = _a271[_i272];
                if (!((((v_p % sp.w) - (v_c % sp.w)) !== (((v_p / sp.w) | 0) - ((v_c / sp.w) | 0))))) continue;
                _g267.push(v_p);
              }
            }
            const _a273 = _g267;
            for (let _i274 = 0; _i274 < _a273.length; _i274++) {
              const v_p = _a273[_i274];
              if (!((((v_p / sp.w) | 0) > ((v_c / sp.w) | 0)))) continue;
              _g257.push(v_p);
            }
          }
          const _a275 = _g257;
          for (let _i276 = 0; _i276 < _a275.length; _i276++) {
            const v_p = _a275[_i276];
            if (((g[v_p] || -1) === 1)) {
              _q255 = true;
              break Q256;
            }
          }
        }
        _c277 = _q255;
      }
      if (!(_c277)) {
        _q251 = false;
        break Q252;
      }
    }
  }
  if (!(_q251)) return false;
  for (let _k278 = 0; _k278 < cl.hole.at.length; _k278++) {
    const _at279 = cl.hole.at[_k278];
    if (!(((g[_at279] || -1) === 2))) return false;
  }
  for (let _k281 = 0; _k281 < cl.number.at.length; _k281++) {
    const _at282 = cl.number.at[_k281];
    const _v283 = cl.number.v[_k281];
    let _c294 = ((g[_at282] || -1) === 2);
    if (_c294) {
      let _g284 = 0;
      G285: {
        _g286.length = 0;
        G287: {
          const _a290 = sp.adj8[_at282];
          for (let _i291 = 0; _i291 < _a290.length; _i291++) {
            const v_p = _a290[_i291];
            if (!((((v_p % sp.w) - (_at282 % sp.w)) !== (((v_p / sp.w) | 0) - ((_at282 / sp.w) | 0))))) continue;
            _g286.push(v_p);
          }
        }
        const _a292 = _g286;
        for (let _i293 = 0; _i293 < _a292.length; _i293++) {
          const v_p = _a292[_i293];
          if (!(((g[v_p] || -1) === 1))) continue;
          _g284++;
        }
      }
      _c294 = (_g284 === _v283);
    }
    if (!(_c294)) return false;
  }
  return true;
}

export interface StrandSupportBinding {
  a: number;
}

const strandSupportFacts: number[] = [];

export function strandSupport(b: Marks, sp: GridSpace, fire: Fire<StrandSupportBinding> | null): number {
  const _g10: number[] = [];
  const _g20: number[] = [];
  const _g34: number[] = [];
  const _g44: number[] = [];
  const _g56: number[] = [];
  const _g66: number[] = [];
  const facts = strandSupportFacts;
  let fired = 0;
  let changed = false;
  const _h7 = (sp.h - 1);
  const _a5 = sp.cells;
  for (let _i6 = 0; _i6 < _a5.length; _i6++) {
    const v_a = _a5[_i6];
    if (!(((b.value(v_a) === 1) && (((v_a / sp.w) | 0) < _h7)))) continue;
    const _h26 = (v_a % sp.w);
    const _h27 = ((v_a / sp.w) | 0);
    facts.length = 0;
    changed = false;
    let _q8 = false;
    Q9: {
      _g10.length = 0;
      G11: {
        _g20.length = 0;
        G21: {
          const _a24 = sp.adj8[v_a];
          for (let _i25 = 0; _i25 < _a24.length; _i25++) {
            const v_p = _a24[_i25];
            if (!((((v_p % sp.w) - _h26) !== (((v_p / sp.w) | 0) - _h27)))) continue;
            _g20.push(v_p);
          }
        }
        const _a28 = _g20;
        for (let _i29 = 0; _i29 < _a28.length; _i29++) {
          const v_p = _a28[_i29];
          if (!((((v_p / sp.w) | 0) > _h27))) continue;
          _g10.push(v_p);
        }
      }
      const _a30 = _g10;
      for (let _i31 = 0; _i31 < _a30.length; _i31++) {
        const v_p = _a30[_i31];
        if ((b.value(v_p) !== 2)) {
          _q8 = true;
          break Q9;
        }
      }
    }
    let _c77 = _q8;
    if (_c77) {
      let _q32 = true;
      Q33: {
        _g34.length = 0;
        G35: {
          _g44.length = 0;
          G45: {
            const _a48 = sp.adj8[v_a];
            for (let _i49 = 0; _i49 < _a48.length; _i49++) {
              const v_p = _a48[_i49];
              if (!((((v_p % sp.w) - _h26) !== (((v_p / sp.w) | 0) - _h27)))) continue;
              _g44.push(v_p);
            }
          }
          const _a50 = _g44;
          for (let _i51 = 0; _i51 < _a50.length; _i51++) {
            const v_p = _a50[_i51];
            if (!((((v_p / sp.w) | 0) > _h27))) continue;
            _g34.push(v_p);
          }
        }
        const _a52 = _g34;
        for (let _i53 = 0; _i53 < _a52.length; _i53++) {
          const v_c = _a52[_i53];
          let _c76 = !(b.known(v_c));
          if (_c76) {
            let _q54 = true;
            Q55: {
              _g56.length = 0;
              G57: {
                _g66.length = 0;
                G67: {
                  const _a70 = sp.adj8[v_a];
                  for (let _i71 = 0; _i71 < _a70.length; _i71++) {
                    const v_p = _a70[_i71];
                    if (!((((v_p % sp.w) - _h26) !== (((v_p / sp.w) | 0) - _h27)))) continue;
                    _g66.push(v_p);
                  }
                }
                const _a72 = _g66;
                for (let _i73 = 0; _i73 < _a72.length; _i73++) {
                  const v_p = _a72[_i73];
                  if (!((((v_p / sp.w) | 0) > _h27))) continue;
                  _g56.push(v_p);
                }
              }
              const _a74 = _g56;
              for (let _i75 = 0; _i75 < _a74.length; _i75++) {
                const v_p = _a74[_i75];
                if (!((v_p !== v_c))) continue;
                if (!((b.value(v_p) === 2))) {
                  _q54 = false;
                  break Q55;
                }
              }
            }
            _c76 = _q54;
          }
          if (!(_c76)) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) {
            _q32 = false;
            break Q33;
          }
        }
      }
      _c77 = _q32;
    }
    if (!(_c77)) return -1;
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
  const _g87: number[] = [];
  const _g99: number[] = [];
  const _g109: number[] = [];
  const facts = undercountFacts;
  let fired = 0;
  let changed = false;
  const _a81 = sp.cells;
  for (let _i82 = 0; _i82 < _a81.length; _i82++) {
    const v_k = _a81[_i82];
    const _h83 = clueAt(cl.number, v_k);
    const _h93 = (v_k % sp.w);
    const _h94 = ((v_k / sp.w) | 0);
    L84: {
      const v_n = _h83;
      if (!((v_n >= 0))) break L84;
      facts.length = 0;
      changed = false;
      let _g85 = 0;
      G86: {
        _g87.length = 0;
        G88: {
          const _a91 = sp.adj8[v_k];
          for (let _i92 = 0; _i92 < _a91.length; _i92++) {
            const v_p = _a91[_i92];
            if (!((((v_p % sp.w) - _h93) !== (((v_p / sp.w) | 0) - _h94)))) continue;
            _g87.push(v_p);
          }
        }
        const _a95 = _g87;
        for (let _i96 = 0; _i96 < _a95.length; _i96++) {
          const v_p = _a95[_i96];
          if (!((b.value(v_p) !== 2))) continue;
          _g85++;
        }
      }
      let _c118 = (_g85 >= v_n);
      if (_c118) {
        let _g97 = 0;
        G98: {
          _g99.length = 0;
          G100: {
            const _a103 = sp.adj8[v_k];
            for (let _i104 = 0; _i104 < _a103.length; _i104++) {
              const v_p = _a103[_i104];
              if (!((((v_p % sp.w) - _h93) !== (((v_p / sp.w) | 0) - _h94)))) continue;
              _g99.push(v_p);
            }
          }
          const _a105 = _g99;
          for (let _i106 = 0; _i106 < _a105.length; _i106++) {
            const v_p = _a105[_i106];
            if (!((b.value(v_p) !== 2))) continue;
            _g97++;
          }
        }
        let _c117 = (_g97 > v_n);
        if (!_c117) {
          let _q107 = true;
          Q108: {
            _g109.length = 0;
            G110: {
              const _a113 = sp.adj8[v_k];
              for (let _i114 = 0; _i114 < _a113.length; _i114++) {
                const v_p = _a113[_i114];
                if (!((((v_p % sp.w) - _h93) !== (((v_p / sp.w) | 0) - _h94)))) continue;
                _g109.push(v_p);
              }
            }
            const _a115 = _g109;
            for (let _i116 = 0; _i116 < _a115.length; _i116++) {
              const v_c = _a115[_i116];
              if (!(!(b.known(v_c)))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
              if (!(true)) {
                _q107 = false;
                break Q108;
              }
            }
          }
          _c117 = _q107;
        }
        _c118 = _c117;
      }
      if (!(_c118)) return -1;
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
  const _g127: number[] = [];
  const _g139: number[] = [];
  const facts = threeFacts;
  let fired = 0;
  let changed = false;
  const _a121 = sp.rows;
  for (let _i122 = 0; _i122 < _a121.length; _i122++) {
    const v_L = _a121[_i122];
    facts.length = 0;
    changed = false;
    let _q123 = true;
    Q124: {
      const _a125 = sp.lineCells[v_L];
      for (let _i126 = 0; _i126 < _a125.length; _i126++) {
        const v_c = _a125[_i126];
        if (!((b.value(v_c) === 1))) continue;
        _g127.length = 0;
        G128: {
          const _a131 = sp.lineCells[sp.rowOf[v_c]];
          for (let _i132 = 0; _i132 < _a131.length; _i132++) {
            const v_x = _a131[_i132];
            if (!((b.value(v_x) === 1))) continue;
            _g127.push(v_x);
          }
        }
        if (!((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g127).length <= 2))) {
          _q123 = false;
          break Q124;
        }
      }
    }
    let _c146 = _q123;
    if (_c146) {
      let _q133 = true;
      Q134: {
        const _a135 = sp.lineCells[v_L];
        for (let _i136 = 0; _i136 < _a135.length; _i136++) {
          const v_c = _a135[_i136];
          let _c145 = !(b.known(v_c));
          if (_c145) {
            const _wc137 = v_c;
            const _wd138 = 1;
            _g139.length = 0;
            G140: {
              const _a143 = sp.lineCells[sp.rowOf[v_c]];
              for (let _i144 = 0; _i144 < _a143.length; _i144++) {
                const v_x = _a143[_i144];
                if (!(((v_x === _wc137 ? _wd138 : b.value(v_x)) === 1))) continue;
                _g139.push(v_x);
              }
            }
            _c145 = (stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g139).length > 2);
          }
          if (!(_c145)) continue;
          if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) {
            _q133 = false;
            break Q134;
          }
        }
      }
      _c146 = _q133;
    }
    if (!(_c146)) return -1;
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
  const _g177: number[] = [];
  const _g187: number[] = [];
  const facts = unsupportedFacts;
  let fired = 0;
  let changed = false;
  const _h174 = (sp.h - 1);
  const _a172 = sp.cells;
  for (let _i173 = 0; _i173 < _a172.length; _i173++) {
    const v_c = _a172[_i173];
    const _h193 = (v_c % sp.w);
    const _h194 = ((v_c / sp.w) | 0);
    let _c199 = (!(b.known(v_c)) && (((v_c / sp.w) | 0) < _h174));
    if (_c199) {
      let _q175 = false;
      Q176: {
        _g177.length = 0;
        G178: {
          _g187.length = 0;
          G188: {
            const _a191 = sp.adj8[v_c];
            for (let _i192 = 0; _i192 < _a191.length; _i192++) {
              const v_p = _a191[_i192];
              if (!((((v_p % sp.w) - _h193) !== (((v_p / sp.w) | 0) - _h194)))) continue;
              _g187.push(v_p);
            }
          }
          const _a195 = _g187;
          for (let _i196 = 0; _i196 < _a195.length; _i196++) {
            const v_p = _a195[_i196];
            if (!((((v_p / sp.w) | 0) > _h194))) continue;
            _g177.push(v_p);
          }
        }
        const _a197 = _g177;
        for (let _i198 = 0; _i198 < _a197.length; _i198++) {
          const v_p = _a197[_i198];
          if ((b.value(v_p) !== 2)) {
            _q175 = true;
            break Q176;
          }
        }
      }
      _c199 = !(_q175);
    }
    if (!(_c199)) continue;
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
  const _g209: number[] = [];
  const _g221: number[] = [];
  const _g231: number[] = [];
  const facts = overcountFacts;
  let fired = 0;
  let changed = false;
  const _a203 = sp.cells;
  for (let _i204 = 0; _i204 < _a203.length; _i204++) {
    const v_k = _a203[_i204];
    const _h205 = clueAt(cl.number, v_k);
    const _h215 = (v_k % sp.w);
    const _h216 = ((v_k / sp.w) | 0);
    L206: {
      const v_n = _h205;
      if (!((v_n >= 0))) break L206;
      facts.length = 0;
      changed = false;
      let _g207 = 0;
      G208: {
        _g209.length = 0;
        G210: {
          const _a213 = sp.adj8[v_k];
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_p = _a213[_i214];
            if (!((((v_p % sp.w) - _h215) !== (((v_p / sp.w) | 0) - _h216)))) continue;
            _g209.push(v_p);
          }
        }
        const _a217 = _g209;
        for (let _i218 = 0; _i218 < _a217.length; _i218++) {
          const v_p = _a217[_i218];
          if (!((b.value(v_p) === 1))) continue;
          _g207++;
        }
      }
      let _c240 = (_g207 <= v_n);
      if (_c240) {
        let _g219 = 0;
        G220: {
          _g221.length = 0;
          G222: {
            const _a225 = sp.adj8[v_k];
            for (let _i226 = 0; _i226 < _a225.length; _i226++) {
              const v_p = _a225[_i226];
              if (!((((v_p % sp.w) - _h215) !== (((v_p / sp.w) | 0) - _h216)))) continue;
              _g221.push(v_p);
            }
          }
          const _a227 = _g221;
          for (let _i228 = 0; _i228 < _a227.length; _i228++) {
            const v_p = _a227[_i228];
            if (!((b.value(v_p) === 1))) continue;
            _g219++;
          }
        }
        let _c239 = (_g219 < v_n);
        if (!_c239) {
          let _q229 = true;
          Q230: {
            _g231.length = 0;
            G232: {
              const _a235 = sp.adj8[v_k];
              for (let _i236 = 0; _i236 < _a235.length; _i236++) {
                const v_p = _a235[_i236];
                if (!((((v_p % sp.w) - _h215) !== (((v_p / sp.w) | 0) - _h216)))) continue;
                _g231.push(v_p);
              }
            }
            const _a237 = _g231;
            for (let _i238 = 0; _i238 < _a237.length; _i238++) {
              const v_c = _a237[_i238];
              if (!(!(b.known(v_c)))) continue;
              if (!b.known(v_c)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
              if (!(true)) {
                _q229 = false;
                break Q230;
              }
            }
          }
          _c239 = _q229;
        }
        _c240 = _c239;
      }
      if (!(_c240)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ k: v_k, n: v_n }, facts)) return 1;
      }
    }
  }
  return fired;
}
