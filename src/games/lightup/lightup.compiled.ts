// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, nextOfSize, stretch, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  wall: ClueList;
  number: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "darkSet" | "clueSet";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "shine";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "shine" },
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
  { id: "square", tier: 0 },
  { id: "darkSet", tier: 1 },
  { id: "clueSet", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Unreasonable"];

/** The values each cell may hold, by cell: its domain. */
export function domainOf(_sp: GridSpace, cl: Dealt, v_c: number): number {
  let _g1 = 0;
  G2: {
    for (let v_d = 1; v_d <= 2; v_d++) {
      if (!(((v_d === 2) || ((clueAt(cl.wall, v_c) < 0) && (clueAt(cl.number, v_c) < 0))))) continue;
      _g1 |= 1 << v_d;
    }
  }
  return _g1;
}

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g413: number[] = [];
  const _g422: number[] = [];
  const _g441: number[] = [];
  const _g450: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q404 = true;
  Q405: {
    const _a406 = sp.cells;
    for (let _i407 = 0; _i407 < _a406.length; _i407++) {
      const v_c = _a406[_i407];
      const _h408 = clueAt(cl.wall, v_c);
      const _h409 = clueAt(cl.number, v_c);
      if (!(((_h408 < 0) && (_h409 < 0)))) continue;
      let _q410 = false;
      Q411: {
        const _t412 = sp.rowOf[v_c];
        _g413.length = 0;
        G414: {
          const _a417 = sp.lineCells[_t412];
          for (let _i418 = 0; _i418 < _a417.length; _i418++) {
            const v_x = _a417[_i418];
            const _h419 = clueAt(cl.wall, v_x);
            const _h420 = clueAt(cl.number, v_x);
            if (!(((_h419 < 0) && (_h420 < 0)))) continue;
            _g413.push(v_x);
          }
        }
        const _t421 = sp.colOf[v_c];
        _g422.length = 0;
        G423: {
          const _a426 = sp.lineCells[_t421];
          for (let _i427 = 0; _i427 < _a426.length; _i427++) {
            const v_x = _a426[_i427];
            const _h428 = clueAt(cl.wall, v_x);
            const _h429 = clueAt(cl.number, v_x);
            if (!(((_h428 < 0) && (_h429 < 0)))) continue;
            _g422.push(v_x);
          }
        }
        const _a430 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g413), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g422));
        for (let _i431 = 0; _i431 < _a430.length; _i431++) {
          const v_p = _a430[_i431];
          const _h432 = (g[v_p] || -1);
          if ((_h432 === 1)) {
            _q410 = true;
            break Q411;
          }
        }
      }
      if (!(_q410)) {
        _q404 = false;
        break Q405;
      }
    }
  }
  if (!(_q404)) return false;
  let _q433 = true;
  Q434: {
    const _a435 = sp.cells;
    for (let _i436 = 0; _i436 < _a435.length; _i436++) {
      const v_c = _a435[_i436];
      const _h437 = (g[v_c] || -1);
      if (!((_h437 === 1))) continue;
      let _q438 = true;
      Q439: {
        const _t440 = sp.rowOf[v_c];
        _g441.length = 0;
        G442: {
          const _a445 = sp.lineCells[_t440];
          for (let _i446 = 0; _i446 < _a445.length; _i446++) {
            const v_x = _a445[_i446];
            const _h447 = clueAt(cl.wall, v_x);
            const _h448 = clueAt(cl.number, v_x);
            if (!(((_h447 < 0) && (_h448 < 0)))) continue;
            _g441.push(v_x);
          }
        }
        const _t449 = sp.colOf[v_c];
        _g450.length = 0;
        G451: {
          const _a454 = sp.lineCells[_t449];
          for (let _i455 = 0; _i455 < _a454.length; _i455++) {
            const v_x = _a454[_i455];
            const _h456 = clueAt(cl.wall, v_x);
            const _h457 = clueAt(cl.number, v_x);
            if (!(((_h456 < 0) && (_h457 < 0)))) continue;
            _g450.push(v_x);
          }
        }
        const _a458 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g441), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g450));
        for (let _i459 = 0; _i459 < _a458.length; _i459++) {
          const v_p = _a458[_i459];
          if (!((v_p !== v_c))) continue;
          const _h460 = (g[v_p] || -1);
          if (!((_h460 === 2))) {
            _q438 = false;
            break Q439;
          }
        }
      }
      if (!(_q438)) {
        _q433 = false;
        break Q434;
      }
    }
  }
  if (!(_q433)) return false;
  for (let _k461 = 0; _k461 < cl.wall.at.length; _k461++) {
    const _at462 = cl.wall.at[_k461];
    if (!(((g[_at462] || -1) === 2))) return false;
  }
  for (let _k464 = 0; _k464 < cl.number.at.length; _k464++) {
    const _at465 = cl.number.at[_k464];
    const _v466 = cl.number.v[_k464];
    let _c472: boolean = ((g[_at465] || -1) === 2);
    if (_c472) {
      let _g467 = 0;
      G468: {
        const _a469 = sp.adj4[_at465];
        for (let _i470 = 0; _i470 < _a469.length; _i470++) {
          const v_p = _a469[_i470];
          const _h471 = (g[v_p] || -1);
          if (!((_h471 === 1))) continue;
          _g467++;
        }
      }
      _c472 = (_g467 === _v466);
    }
    if (!(_c472)) return false;
  }
  return true;
}

export interface ShineBinding {
  c: number;
  p: number;
}

const shineFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function shine(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<ShineBinding> | null): number {
  const _g22: number[] = [];
  const _g31: number[] = [];
  const facts = shineFacts;
  let fired = 0;
  let changed = false;
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _t21 = sp.rowOf[v_c];
  _g22.length = 0;
  G23: {
    const _a26 = sp.lineCells[_t21];
    for (let _i27 = 0; _i27 < _a26.length; _i27++) {
      const v_x = _a26[_i27];
      const _h28 = clueAt(cl.wall, v_x);
      const _h29 = clueAt(cl.number, v_x);
      if (!(((_h28 < 0) && (_h29 < 0)))) continue;
      _g22.push(v_x);
    }
  }
  const _t30 = sp.colOf[v_c];
  _g31.length = 0;
  G32: {
    const _a35 = sp.lineCells[_t30];
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_x = _a35[_i36];
      const _h37 = clueAt(cl.wall, v_x);
      const _h38 = clueAt(cl.number, v_x);
      if (!(((_h37 < 0) && (_h38 < 0)))) continue;
      _g31.push(v_x);
    }
  }
  const _a39 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g22), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g31));
  for (let _i40 = 0; _i40 < _a39.length; _i40++) {
    const v_p = _a39[_i40];
    if (!(((v_p !== v_c) && !((b.grid[v_p] !== 0))))) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, p: v_p }, facts);
    }
  }
  return fired;
}

export interface SquareBinding {
  X: number;
  c: number;
  n: number;
  L: readonly number[];
}

const squareFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const _g65: number[] = [];
  const _g74: number[] = [];
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  const _a59 = sp.cols;
  for (let _i60 = 0; _i60 < _a59.length; _i60++) {
    const v_X = _a59[_i60];
    const _a61 = sp.lineCells[v_X];
    for (let _i62 = 0; _i62 < _a61.length; _i62++) {
      const v_c = _a61[_i62];
      const _h63 = clueAt(cl.number, v_c);
      const _h82 = clueAt(cl.wall, v_c);
      const v_n = _h63;
      const _t64 = sp.rowOf[v_c];
      _g65.length = 0;
      G66: {
        const _a69 = sp.lineCells[_t64];
        for (let _i70 = 0; _i70 < _a69.length; _i70++) {
          const v_x = _a69[_i70];
          const _h71 = clueAt(cl.wall, v_x);
          const _h72 = clueAt(cl.number, v_x);
          if (!(((_h71 < 0) && (_h72 < 0)))) continue;
          _g65.push(v_x);
        }
      }
      const _t73 = sp.colOf[v_c];
      _g74.length = 0;
      G75: {
        const _a78 = sp.lineCells[_t73];
        for (let _i79 = 0; _i79 < _a78.length; _i79++) {
          const v_x = _a78[_i79];
          const _h80 = clueAt(cl.wall, v_x);
          const _h81 = clueAt(cl.number, v_x);
          if (!(((_h80 < 0) && (_h81 < 0)))) continue;
          _g74.push(v_x);
        }
      }
      const v_L = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g65), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g74));
      facts.length = 0;
      changed = false;
      let _c108: boolean = !(((_h82 < 0) && (_h63 < 0)));
      if (!_c108) {
        let _c87: boolean = ((b.grid[v_c] || -1) !== 1);
        if (!_c87) {
          let _q83 = true;
          Q84: {
            const _a85 = v_L;
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_p = _a85[_i86];
              if (!((v_p !== v_c))) continue;
              if (!(((b.grid[v_p] || -1) !== 1))) {
                _q83 = false;
                break Q84;
              }
            }
          }
          _c87 = _q83;
        }
        let _c107: boolean = _c87;
        if (_c107) {
          let _q88 = false;
          Q89: {
            const _a90 = v_L;
            for (let _i91 = 0; _i91 < _a90.length; _i91++) {
              const v_p = _a90[_i91];
              if (((b.grid[v_p] || -1) === 1)) {
                _q88 = true;
                break Q89;
              }
            }
          }
          let _c106: boolean = _q88;
          if (!_c106) {
            let _g92 = 0;
            G93: {
              const _a94 = v_L;
              for (let _i95 = 0; _i95 < _a94.length; _i95++) {
                const v_p = _a94[_i95];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g92++;
              }
            }
            let _c105: boolean = (_g92 >= 1);
            if (_c105) {
              let _g96 = 0;
              G97: {
                const _a98 = v_L;
                for (let _i99 = 0; _i99 < _a98.length; _i99++) {
                  const v_p = _a98[_i99];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  _g96++;
                }
              }
              let _c104: boolean = (_g96 > 1);
              if (!_c104) {
                let _q100 = true;
                Q101: {
                  const _a102 = v_L;
                  for (let _i103 = 0; _i103 < _a102.length; _i103++) {
                    const v_p = _a102[_i103];
                    if (!(!((b.grid[v_p] !== 0)))) continue;
                    if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                    if (!(true)) {
                      _q100 = false;
                      break Q101;
                    }
                  }
                }
                _c104 = _q100;
              }
              _c105 = _c104;
            }
            _c106 = _c105;
          }
          _c107 = _c106;
        }
        _c108 = _c107;
      }
      let _c147: boolean = _c108;
      if (_c147) {
        let _c146: boolean = (v_n < 0);
        if (!_c146) {
          let _g109 = 0;
          G110: {
            const _a111 = sp.adj4[v_c];
            for (let _i112 = 0; _i112 < _a111.length; _i112++) {
              const v_p = _a111[_i112];
              if (!(((b.grid[v_p] || -1) === 1))) continue;
              _g109++;
            }
          }
          let _c121: boolean = (_g109 <= v_n);
          if (_c121) {
            let _g113 = 0;
            G114: {
              const _a115 = sp.adj4[v_c];
              for (let _i116 = 0; _i116 < _a115.length; _i116++) {
                const v_p = _a115[_i116];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g113++;
              }
            }
            let _g117 = 0;
            G118: {
              const _a119 = sp.adj4[v_c];
              for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                const v_p = _a119[_i120];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g117++;
              }
            }
            _c121 = ((_g113 + _g117) >= v_n);
          }
          let _c131: boolean = _c121;
          if (_c131) {
            let _g122 = 0;
            G123: {
              const _a124 = sp.adj4[v_c];
              for (let _i125 = 0; _i125 < _a124.length; _i125++) {
                const v_p = _a124[_i125];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g122++;
              }
            }
            let _c130: boolean = (_g122 < v_n);
            if (!_c130) {
              let _q126 = true;
              Q127: {
                const _a128 = sp.adj4[v_c];
                for (let _i129 = 0; _i129 < _a128.length; _i129++) {
                  const v_p = _a128[_i129];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                  if (!(true)) {
                    _q126 = false;
                    break Q127;
                  }
                }
              }
              _c130 = _q126;
            }
            _c131 = _c130;
          }
          let _c145: boolean = _c131;
          if (_c145) {
            let _g132 = 0;
            G133: {
              const _a134 = sp.adj4[v_c];
              for (let _i135 = 0; _i135 < _a134.length; _i135++) {
                const v_p = _a134[_i135];
                if (!(((b.grid[v_p] || -1) === 1))) continue;
                _g132++;
              }
            }
            let _g136 = 0;
            G137: {
              const _a138 = sp.adj4[v_c];
              for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                const v_p = _a138[_i139];
                if (!(!((b.grid[v_p] !== 0)))) continue;
                _g136++;
              }
            }
            let _c144: boolean = ((_g132 + _g136) > v_n);
            if (!_c144) {
              let _q140 = true;
              Q141: {
                const _a142 = sp.adj4[v_c];
                for (let _i143 = 0; _i143 < _a142.length; _i143++) {
                  const v_p = _a142[_i143];
                  if (!(!((b.grid[v_p] !== 0)))) continue;
                  if (!(b.grid[v_p] !== 0)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                  if (!(true)) {
                    _q140 = false;
                    break Q141;
                  }
                }
              }
              _c144 = _q140;
            }
            _c145 = _c144;
          }
          _c146 = _c145;
        }
        _c147 = _c146;
      }
      if (!(_c147)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ X: v_X, c: v_c, n: v_n, L: v_L }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface DarkSetBinding {
  X: number;
  u: number;
  L: readonly number[];
  S: readonly number[];
}

const darkSetFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function darkSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<DarkSetBinding> | null): number {
  const _g184: number[] = [];
  const _g193: number[] = [];
  const _g206: number[] = [];
  const _g217: number[] = [];
  const _g226: number[] = [];
  const _g234: number[] = [];
  const _g247: number[] = [];
  const _g256: number[] = [];
  const facts = darkSetFacts;
  let fired = 0;
  let changed = false;
  const _a177 = sp.cols;
  for (let _i178 = 0; _i178 < _a177.length; _i178++) {
    const v_X = _a177[_i178];
    const _a179 = sp.lineCells[v_X];
    for (let _i180 = 0; _i180 < _a179.length; _i180++) {
      const v_u = _a179[_i180];
      const _h181 = clueAt(cl.wall, v_u);
      const _h182 = clueAt(cl.number, v_u);
      if (!(((_h181 < 0) && (_h182 < 0)))) continue;
      const _t183 = sp.rowOf[v_u];
      _g184.length = 0;
      G185: {
        const _a188 = sp.lineCells[_t183];
        for (let _i189 = 0; _i189 < _a188.length; _i189++) {
          const v_x = _a188[_i189];
          const _h190 = clueAt(cl.wall, v_x);
          const _h191 = clueAt(cl.number, v_x);
          if (!(((_h190 < 0) && (_h191 < 0)))) continue;
          _g184.push(v_x);
        }
      }
      const _t192 = sp.colOf[v_u];
      _g193.length = 0;
      G194: {
        const _a197 = sp.lineCells[_t192];
        for (let _i198 = 0; _i198 < _a197.length; _i198++) {
          const v_x = _a197[_i198];
          const _h199 = clueAt(cl.wall, v_x);
          const _h200 = clueAt(cl.number, v_x);
          if (!(((_h199 < 0) && (_h200 < 0)))) continue;
          _g193.push(v_x);
        }
      }
      L201: {
        const v_L = union(stretch(sp.lineCells[sp.rowOf[v_u]], v_u, _g184), stretch(sp.lineCells[sp.colOf[v_u]], v_u, _g193));
        let _q202 = false;
        Q203: {
          const _a204 = v_L;
          for (let _i205 = 0; _i205 < _a204.length; _i205++) {
            const v_p = _a204[_i205];
            if (((b.grid[v_p] || -1) === 1)) {
              _q202 = true;
              break Q203;
            }
          }
        }
        if (!(!(_q202))) break L201;
        _g206.length = 0;
        G207: {
          const _a210 = v_L;
          for (let _i211 = 0; _i211 < _a210.length; _i211++) {
            const v_s = _a210[_i211];
            if (!(!((b.grid[v_s] !== 0)))) continue;
            _g206.push(v_s);
          }
        }
        const v_S = _g206;
        const _h212 = v_S.length;
        facts.length = 0;
        changed = false;
        let _c280: boolean = (_h212 > 0);
        if (_c280) {
          let _q213 = true;
          Q214: {
            const _t215 = (v_S.length > 0 ? v_S[0] : -1);
            const _t216 = sp.rowOf[_t215];
            _g217.length = 0;
            G218: {
              const _a221 = sp.lineCells[_t216];
              for (let _i222 = 0; _i222 < _a221.length; _i222++) {
                const v_x = _a221[_i222];
                const _h223 = clueAt(cl.wall, v_x);
                const _h224 = clueAt(cl.number, v_x);
                if (!(((_h223 < 0) && (_h224 < 0)))) continue;
                _g217.push(v_x);
              }
            }
            const _t225 = sp.colOf[_t215];
            _g226.length = 0;
            G227: {
              const _a230 = sp.lineCells[_t225];
              for (let _i231 = 0; _i231 < _a230.length; _i231++) {
                const v_x = _a230[_i231];
                const _h232 = clueAt(cl.wall, v_x);
                const _h233 = clueAt(cl.number, v_x);
                if (!(((_h232 < 0) && (_h233 < 0)))) continue;
                _g226.push(v_x);
              }
            }
            _g234.length = 0;
            G235: {
              const _a240 = sp.adj4[_t215];
              for (let _i241 = 0; _i241 < _a240.length; _i241++) {
                const v_k = _a240[_i241];
                const _a242 = sp.adj4[v_k];
                for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                  const v_p = _a242[_i243];
                  if (!_g234.includes(v_p)) _g234.push(v_p);
                }
              }
            }
            const _a244 = union(union(stretch(sp.lineCells[sp.rowOf[_t215]], _t215, _g217), stretch(sp.lineCells[sp.colOf[_t215]], _t215, _g226)), _g234);
            for (let _i245 = 0; _i245 < _a244.length; _i245++) {
              const v_d = _a244[_i245];
              if (!(!((b.grid[v_d] !== 0)))) continue;
              const _t246 = sp.rowOf[v_d];
              _g247.length = 0;
              G248: {
                const _a251 = sp.lineCells[_t246];
                for (let _i252 = 0; _i252 < _a251.length; _i252++) {
                  const v_x = _a251[_i252];
                  const _h253 = clueAt(cl.wall, v_x);
                  const _h254 = clueAt(cl.number, v_x);
                  if (!(((_h253 < 0) && (_h254 < 0)))) continue;
                  _g247.push(v_x);
                }
              }
              const _t255 = sp.colOf[v_d];
              _g256.length = 0;
              G257: {
                const _a260 = sp.lineCells[_t255];
                for (let _i261 = 0; _i261 < _a260.length; _i261++) {
                  const v_x = _a260[_i261];
                  const _h262 = clueAt(cl.wall, v_x);
                  const _h263 = clueAt(cl.number, v_x);
                  if (!(((_h262 < 0) && (_h263 < 0)))) continue;
                  _g256.push(v_x);
                }
              }
              L264: {
                const v_D = union(stretch(sp.lineCells[sp.rowOf[v_d]], v_d, _g247), stretch(sp.lineCells[sp.colOf[v_d]], v_d, _g256));
                let _q265 = true;
                Q266: {
                  const _a267 = v_S;
                  for (let _i268 = 0; _i268 < _a267.length; _i268++) {
                    const v_s = _a267[_i268];
                    let _c279: boolean = (v_s !== v_d);
                    if (_c279) {
                      let _c278: boolean = (v_D.includes(v_s));
                      if (!_c278) {
                        let _q269 = false;
                        Q270: {
                          const _a271 = sp.adj4[v_d];
                          for (let _i272 = 0; _i272 < _a271.length; _i272++) {
                            const v_k = _a271[_i272];
                            const _h273 = clueAt(cl.number, v_k);
                            if (!(((_h273 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g274 = 0;
                            G275: {
                              const _a276 = sp.adj4[v_k];
                              for (let _i277 = 0; _i277 < _a276.length; _i277++) {
                                const v_p = _a276[_i277];
                                if (!(((b.grid[v_p] || -1) === 1))) continue;
                                _g274++;
                              }
                            }
                            if (((_g274 + 1) === _h273)) {
                              _q269 = true;
                              break Q270;
                            }
                          }
                        }
                        _c278 = _q269;
                      }
                      _c279 = _c278;
                    }
                    if (!(_c279)) {
                      _q265 = false;
                      break Q266;
                    }
                  }
                }
                if (!(_q265)) break L264;
                if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q213 = false;
                  break Q214;
                }
              }
            }
          }
          _c280 = _q213;
        }
        if (!(_c280)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ X: v_X, u: v_u, L: v_L, S: v_S }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ClueSetBinding {
  X: number;
  k: number;
  n: number;
  F: readonly number[];
  m: number;
  T: readonly number[];
}

const clueSetFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function clueSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueSetBinding> | null): number {
  const _g316: number[] = [];
  const _g333: number[] = [];
  const _g341: number[] = [];
  const _g350: number[] = [];
  const _g358: number[] = [];
  const _g371: number[] = [];
  const _g380: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _a306 = sp.cols;
  for (let _i307 = 0; _i307 < _a306.length; _i307++) {
    const v_X = _a306[_i307];
    const _a308 = sp.lineCells[v_X];
    for (let _i309 = 0; _i309 < _a308.length; _i309++) {
      const v_k = _a308[_i309];
      const _h310 = clueAt(cl.number, v_k);
      L311: {
        const v_n = _h310;
        let _g312 = 0;
        G313: {
          const _a314 = sp.adj4[v_k];
          for (let _i315 = 0; _i315 < _a314.length; _i315++) {
            const v_p = _a314[_i315];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g312++;
          }
        }
        if (!((v_n > _g312))) break L311;
        _g316.length = 0;
        G317: {
          const _a320 = sp.adj4[v_k];
          for (let _i321 = 0; _i321 < _a320.length; _i321++) {
            const v_p = _a320[_i321];
            if (!(!((b.grid[v_p] !== 0)))) continue;
            _g316.push(v_p);
          }
        }
        const v_F = _g316;
        const _h327 = v_F.length;
        let _g322 = 0;
        G323: {
          const _a324 = sp.adj4[v_k];
          for (let _i325 = 0; _i325 < _a324.length; _i325++) {
            const v_p = _a324[_i325];
            if (!(((b.grid[v_p] || -1) === 1))) continue;
            _g322++;
          }
        }
        L326: {
          const v_m = (v_n - _g322);
          if (!((v_m <= _h327))) break L326;
          const _h335 = (_h327 - v_m);
          const _h336 = (_h335 + 1);
          const _e328 = v_F;
          const _t331 = ((_h327 - v_m) + 1);
          const _n332 = 1 << _e328.length;
          for (let _k329 = _t331 > _e328.length ? _n332 : (1 << _t331) - 1; _k329 < _n332; _k329 = _t331 === 0 ? _n332 : nextOfSize(_k329)) {
            const v_T = _g333;
            v_T.length = 0;
            for (let _j330 = 0; _j330 < _e328.length; _j330++) if ((_k329 >> (_e328.length - 1 - _j330)) & 1) v_T.push(_e328[_j330]);
            const _h334 = v_T.length;
            if (!((_h334 === _h336))) continue;
            facts.length = 0;
            changed = false;
            let _q337 = true;
            Q338: {
              const _t339 = (v_T.length > 0 ? v_T[0] : -1);
              const _t340 = sp.rowOf[_t339];
              _g341.length = 0;
              G342: {
                const _a345 = sp.lineCells[_t340];
                for (let _i346 = 0; _i346 < _a345.length; _i346++) {
                  const v_x = _a345[_i346];
                  const _h347 = clueAt(cl.wall, v_x);
                  const _h348 = clueAt(cl.number, v_x);
                  if (!(((_h347 < 0) && (_h348 < 0)))) continue;
                  _g341.push(v_x);
                }
              }
              const _t349 = sp.colOf[_t339];
              _g350.length = 0;
              G351: {
                const _a354 = sp.lineCells[_t349];
                for (let _i355 = 0; _i355 < _a354.length; _i355++) {
                  const v_x = _a354[_i355];
                  const _h356 = clueAt(cl.wall, v_x);
                  const _h357 = clueAt(cl.number, v_x);
                  if (!(((_h356 < 0) && (_h357 < 0)))) continue;
                  _g350.push(v_x);
                }
              }
              _g358.length = 0;
              G359: {
                const _a364 = sp.adj4[_t339];
                for (let _i365 = 0; _i365 < _a364.length; _i365++) {
                  const v_k = _a364[_i365];
                  const _a366 = sp.adj4[v_k];
                  for (let _i367 = 0; _i367 < _a366.length; _i367++) {
                    const v_p = _a366[_i367];
                    if (!_g358.includes(v_p)) _g358.push(v_p);
                  }
                }
              }
              const _a368 = union(union(stretch(sp.lineCells[sp.rowOf[_t339]], _t339, _g341), stretch(sp.lineCells[sp.colOf[_t339]], _t339, _g350)), _g358);
              for (let _i369 = 0; _i369 < _a368.length; _i369++) {
                const v_d = _a368[_i369];
                if (!(!((b.grid[v_d] !== 0)))) continue;
                const _t370 = sp.rowOf[v_d];
                _g371.length = 0;
                G372: {
                  const _a375 = sp.lineCells[_t370];
                  for (let _i376 = 0; _i376 < _a375.length; _i376++) {
                    const v_x = _a375[_i376];
                    const _h377 = clueAt(cl.wall, v_x);
                    const _h378 = clueAt(cl.number, v_x);
                    if (!(((_h377 < 0) && (_h378 < 0)))) continue;
                    _g371.push(v_x);
                  }
                }
                const _t379 = sp.colOf[v_d];
                _g380.length = 0;
                G381: {
                  const _a384 = sp.lineCells[_t379];
                  for (let _i385 = 0; _i385 < _a384.length; _i385++) {
                    const v_x = _a384[_i385];
                    const _h386 = clueAt(cl.wall, v_x);
                    const _h387 = clueAt(cl.number, v_x);
                    if (!(((_h386 < 0) && (_h387 < 0)))) continue;
                    _g380.push(v_x);
                  }
                }
                L388: {
                  const v_D = union(stretch(sp.lineCells[sp.rowOf[v_d]], v_d, _g371), stretch(sp.lineCells[sp.colOf[v_d]], v_d, _g380));
                  let _q389 = true;
                  Q390: {
                    const _a391 = v_T;
                    for (let _i392 = 0; _i392 < _a391.length; _i392++) {
                      const v_s = _a391[_i392];
                      let _c403: boolean = (v_s !== v_d);
                      if (_c403) {
                        let _c402: boolean = (v_D.includes(v_s));
                        if (!_c402) {
                          let _q393 = false;
                          Q394: {
                            const _a395 = sp.adj4[v_d];
                            for (let _i396 = 0; _i396 < _a395.length; _i396++) {
                              const v_k = _a395[_i396];
                              const _h397 = clueAt(cl.number, v_k);
                              if (!(((_h397 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g398 = 0;
                              G399: {
                                const _a400 = sp.adj4[v_k];
                                for (let _i401 = 0; _i401 < _a400.length; _i401++) {
                                  const v_p = _a400[_i401];
                                  if (!(((b.grid[v_p] || -1) === 1))) continue;
                                  _g398++;
                                }
                              }
                              if (((_g398 + 1) === _h397)) {
                                _q393 = true;
                                break Q394;
                              }
                            }
                          }
                          _c402 = _q393;
                        }
                        _c403 = _c402;
                      }
                      if (!(_c403)) {
                        _q389 = false;
                        break Q390;
                      }
                    }
                  }
                  if (!(_q389)) break L388;
                  if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q337 = false;
                    break Q338;
                  }
                }
              }
            }
            if (!(_q337)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ X: v_X, k: v_k, n: v_n, F: v_F, m: v_m, T: v_T }, facts)) return 1;
            }
          }
        }
      }
    }
  }
  return fired;
}
