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
  const _g410: number[] = [];
  const _g417: number[] = [];
  const _g432: number[] = [];
  const _g439: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q403 = true;
  Q404: {
    const _a405 = sp.cells;
    for (let _i406 = 0; _i406 < _a405.length; _i406++) {
      const v_c = _a405[_i406];
      if (!(((clueAt(cl.wall, v_c) < 0) && (clueAt(cl.number, v_c) < 0)))) continue;
      let _q407 = false;
      Q408: {
        const _t409 = sp.rowOf[v_c];
        _g410.length = 0;
        G411: {
          const _a414 = sp.lineCells[_t409];
          for (let _i415 = 0; _i415 < _a414.length; _i415++) {
            const v_x = _a414[_i415];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g410.push(v_x);
          }
        }
        const _t416 = sp.colOf[v_c];
        _g417.length = 0;
        G418: {
          const _a421 = sp.lineCells[_t416];
          for (let _i422 = 0; _i422 < _a421.length; _i422++) {
            const v_x = _a421[_i422];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g417.push(v_x);
          }
        }
        const _a423 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g410), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g417));
        for (let _i424 = 0; _i424 < _a423.length; _i424++) {
          const v_p = _a423[_i424];
          if (((g[v_p] || -1) === 1)) {
            _q407 = true;
            break Q408;
          }
        }
      }
      if (!(_q407)) {
        _q403 = false;
        break Q404;
      }
    }
  }
  if (!(_q403)) return false;
  let _q425 = true;
  Q426: {
    const _a427 = sp.cells;
    for (let _i428 = 0; _i428 < _a427.length; _i428++) {
      const v_c = _a427[_i428];
      if (!(((g[v_c] || -1) === 1))) continue;
      let _q429 = true;
      Q430: {
        const _t431 = sp.rowOf[v_c];
        _g432.length = 0;
        G433: {
          const _a436 = sp.lineCells[_t431];
          for (let _i437 = 0; _i437 < _a436.length; _i437++) {
            const v_x = _a436[_i437];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g432.push(v_x);
          }
        }
        const _t438 = sp.colOf[v_c];
        _g439.length = 0;
        G440: {
          const _a443 = sp.lineCells[_t438];
          for (let _i444 = 0; _i444 < _a443.length; _i444++) {
            const v_x = _a443[_i444];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g439.push(v_x);
          }
        }
        const _a445 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g432), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g439));
        for (let _i446 = 0; _i446 < _a445.length; _i446++) {
          const v_p = _a445[_i446];
          if (!((v_p !== v_c))) continue;
          if (!(((g[v_p] || -1) === 2))) {
            _q429 = false;
            break Q430;
          }
        }
      }
      if (!(_q429)) {
        _q425 = false;
        break Q426;
      }
    }
  }
  if (!(_q425)) return false;
  for (let _k447 = 0; _k447 < cl.wall.at.length; _k447++) {
    const _at448 = cl.wall.at[_k447];
    if (!(((g[_at448] || -1) === 2))) return false;
  }
  for (let _k450 = 0; _k450 < cl.number.at.length; _k450++) {
    const _at451 = cl.number.at[_k450];
    const _v452 = cl.number.v[_k450];
    let _c457: boolean = ((g[_at451] || -1) === 2);
    if (_c457) {
      let _g453 = 0;
      G454: {
        const _a455 = sp.adj4[_at451];
        for (let _i456 = 0; _i456 < _a455.length; _i456++) {
          const v_p = _a455[_i456];
          if (!(((g[v_p] || -1) === 1))) continue;
          _g453++;
        }
      }
      _c457 = (_g453 === _v452);
    }
    if (!(_c457)) return false;
  }
  return true;
}

export interface ShineBinding {
  c: number;
  p: number;
}

const shineFacts: number[] = [];

export function shine(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<ShineBinding> | null): number {
  const _g22: number[] = [];
  const _g31: number[] = [];
  const facts = shineFacts;
  let fired = 0;
  let changed = false;
  if (!((b.value(v_c) === 1))) return 0;
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
    if (!(((v_p !== v_c) && !(b.known(v_p))))) continue;
    facts.length = 0;
    changed = false;
    if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
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
        let _c87: boolean = (b.value(v_c) !== 1);
        if (!_c87) {
          let _q83 = true;
          Q84: {
            const _a85 = v_L;
            for (let _i86 = 0; _i86 < _a85.length; _i86++) {
              const v_p = _a85[_i86];
              if (!((v_p !== v_c))) continue;
              if (!((b.value(v_p) !== 1))) {
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
              if ((b.value(v_p) === 1)) {
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
                if (!(!(b.known(v_p)))) continue;
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
                  if (!(!(b.known(v_p)))) continue;
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
                    if (!(!(b.known(v_p)))) continue;
                    if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
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
              if (!((b.value(v_p) === 1))) continue;
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
                if (!((b.value(v_p) === 1))) continue;
                _g113++;
              }
            }
            let _g117 = 0;
            G118: {
              const _a119 = sp.adj4[v_c];
              for (let _i120 = 0; _i120 < _a119.length; _i120++) {
                const v_p = _a119[_i120];
                if (!(!(b.known(v_p)))) continue;
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
                if (!((b.value(v_p) === 1))) continue;
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
                  if (!(!(b.known(v_p)))) continue;
                  if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
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
                if (!((b.value(v_p) === 1))) continue;
                _g132++;
              }
            }
            let _g136 = 0;
            G137: {
              const _a138 = sp.adj4[v_c];
              for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                const v_p = _a138[_i139];
                if (!(!(b.known(v_p)))) continue;
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
                  if (!(!(b.known(v_p)))) continue;
                  if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
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
            if ((b.value(v_p) === 1)) {
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
            if (!(!(b.known(v_s)))) continue;
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
              if (!(!(b.known(v_d)))) continue;
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
                                if (!((b.value(v_p) === 1))) continue;
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
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
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

export function clueSet(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClueSetBinding> | null): number {
  const _g316: number[] = [];
  const _g340: number[] = [];
  const _g349: number[] = [];
  const _g357: number[] = [];
  const _g370: number[] = [];
  const _g379: number[] = [];
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
            if (!((b.value(v_p) === 1))) continue;
            _g312++;
          }
        }
        if (!((v_n > _g312))) break L311;
        _g316.length = 0;
        G317: {
          const _a320 = sp.adj4[v_k];
          for (let _i321 = 0; _i321 < _a320.length; _i321++) {
            const v_p = _a320[_i321];
            if (!(!(b.known(v_p)))) continue;
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
            if (!((b.value(v_p) === 1))) continue;
            _g322++;
          }
        }
        L326: {
          const v_m = (v_n - _g322);
          if (!((v_m <= _h327))) break L326;
          const _h334 = (_h327 - v_m);
          const _h335 = (_h334 + 1);
          const _e328 = v_F;
          const _t331 = ((_h327 - v_m) + 1);
          const _n332 = 1 << _e328.length;
          for (let _k329 = _t331 > _e328.length ? _n332 : (1 << _t331) - 1; _k329 < _n332; _k329 = _t331 === 0 ? _n332 : nextOfSize(_k329)) {
            const v_T: number[] = [];
            for (let _j330 = 0; _j330 < _e328.length; _j330++) if ((_k329 >> (_e328.length - 1 - _j330)) & 1) v_T.push(_e328[_j330]);
            const _h333 = v_T.length;
            if (!((_h333 === _h335))) continue;
            facts.length = 0;
            changed = false;
            let _q336 = true;
            Q337: {
              const _t338 = (v_T.length > 0 ? v_T[0] : -1);
              const _t339 = sp.rowOf[_t338];
              _g340.length = 0;
              G341: {
                const _a344 = sp.lineCells[_t339];
                for (let _i345 = 0; _i345 < _a344.length; _i345++) {
                  const v_x = _a344[_i345];
                  const _h346 = clueAt(cl.wall, v_x);
                  const _h347 = clueAt(cl.number, v_x);
                  if (!(((_h346 < 0) && (_h347 < 0)))) continue;
                  _g340.push(v_x);
                }
              }
              const _t348 = sp.colOf[_t338];
              _g349.length = 0;
              G350: {
                const _a353 = sp.lineCells[_t348];
                for (let _i354 = 0; _i354 < _a353.length; _i354++) {
                  const v_x = _a353[_i354];
                  const _h355 = clueAt(cl.wall, v_x);
                  const _h356 = clueAt(cl.number, v_x);
                  if (!(((_h355 < 0) && (_h356 < 0)))) continue;
                  _g349.push(v_x);
                }
              }
              _g357.length = 0;
              G358: {
                const _a363 = sp.adj4[_t338];
                for (let _i364 = 0; _i364 < _a363.length; _i364++) {
                  const v_k = _a363[_i364];
                  const _a365 = sp.adj4[v_k];
                  for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                    const v_p = _a365[_i366];
                    if (!_g357.includes(v_p)) _g357.push(v_p);
                  }
                }
              }
              const _a367 = union(union(stretch(sp.lineCells[sp.rowOf[_t338]], _t338, _g340), stretch(sp.lineCells[sp.colOf[_t338]], _t338, _g349)), _g357);
              for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                const v_d = _a367[_i368];
                if (!(!(b.known(v_d)))) continue;
                const _t369 = sp.rowOf[v_d];
                _g370.length = 0;
                G371: {
                  const _a374 = sp.lineCells[_t369];
                  for (let _i375 = 0; _i375 < _a374.length; _i375++) {
                    const v_x = _a374[_i375];
                    const _h376 = clueAt(cl.wall, v_x);
                    const _h377 = clueAt(cl.number, v_x);
                    if (!(((_h376 < 0) && (_h377 < 0)))) continue;
                    _g370.push(v_x);
                  }
                }
                const _t378 = sp.colOf[v_d];
                _g379.length = 0;
                G380: {
                  const _a383 = sp.lineCells[_t378];
                  for (let _i384 = 0; _i384 < _a383.length; _i384++) {
                    const v_x = _a383[_i384];
                    const _h385 = clueAt(cl.wall, v_x);
                    const _h386 = clueAt(cl.number, v_x);
                    if (!(((_h385 < 0) && (_h386 < 0)))) continue;
                    _g379.push(v_x);
                  }
                }
                L387: {
                  const v_D = union(stretch(sp.lineCells[sp.rowOf[v_d]], v_d, _g370), stretch(sp.lineCells[sp.colOf[v_d]], v_d, _g379));
                  let _q388 = true;
                  Q389: {
                    const _a390 = v_T;
                    for (let _i391 = 0; _i391 < _a390.length; _i391++) {
                      const v_s = _a390[_i391];
                      let _c402: boolean = (v_s !== v_d);
                      if (_c402) {
                        let _c401: boolean = (v_D.includes(v_s));
                        if (!_c401) {
                          let _q392 = false;
                          Q393: {
                            const _a394 = sp.adj4[v_d];
                            for (let _i395 = 0; _i395 < _a394.length; _i395++) {
                              const v_k = _a394[_i395];
                              const _h396 = clueAt(cl.number, v_k);
                              if (!(((_h396 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g397 = 0;
                              G398: {
                                const _a399 = sp.adj4[v_k];
                                for (let _i400 = 0; _i400 < _a399.length; _i400++) {
                                  const v_p = _a399[_i400];
                                  if (!((b.value(v_p) === 1))) continue;
                                  _g397++;
                                }
                              }
                              if (((_g397 + 1) === _h396)) {
                                _q392 = true;
                                break Q393;
                              }
                            }
                          }
                          _c401 = _q392;
                        }
                        _c402 = _c401;
                      }
                      if (!(_c402)) {
                        _q388 = false;
                        break Q389;
                      }
                    }
                  }
                  if (!(_q388)) break L387;
                  if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q336 = false;
                    break Q337;
                  }
                }
              }
            }
            if (!(_q336)) return -1;
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
