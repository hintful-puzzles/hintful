// Compiled by `npm run describe` from src/games/lightup/lightup.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, nextOfSize, rangeMask, stretch, union } from "../../engine/describe-runtime.ts";

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
    for (let _m4 = rangeMask(1, 2); _m4 !== 0; _m4 &= _m4 - 1) {
      const v_d = 31 - Math.clz32(_m4 & -_m4);
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
  const _g412: number[] = [];
  const _g419: number[] = [];
  const _g434: number[] = [];
  const _g441: number[] = [];
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;
  }
  let _q405 = true;
  Q406: {
    const _a407 = sp.cells;
    for (let _i408 = 0; _i408 < _a407.length; _i408++) {
      const v_c = _a407[_i408];
      if (!(((clueAt(cl.wall, v_c) < 0) && (clueAt(cl.number, v_c) < 0)))) continue;
      let _q409 = false;
      Q410: {
        const _t411 = sp.rowOf[v_c];
        _g412.length = 0;
        G413: {
          const _a416 = sp.lineCells[_t411];
          for (let _i417 = 0; _i417 < _a416.length; _i417++) {
            const v_x = _a416[_i417];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g412.push(v_x);
          }
        }
        const _t418 = sp.colOf[v_c];
        _g419.length = 0;
        G420: {
          const _a423 = sp.lineCells[_t418];
          for (let _i424 = 0; _i424 < _a423.length; _i424++) {
            const v_x = _a423[_i424];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g419.push(v_x);
          }
        }
        const _a425 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g412), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g419));
        for (let _i426 = 0; _i426 < _a425.length; _i426++) {
          const v_p = _a425[_i426];
          if (((g[v_p] || -1) === 1)) {
            _q409 = true;
            break Q410;
          }
        }
      }
      if (!(_q409)) {
        _q405 = false;
        break Q406;
      }
    }
  }
  if (!(_q405)) return false;
  let _q427 = true;
  Q428: {
    const _a429 = sp.cells;
    for (let _i430 = 0; _i430 < _a429.length; _i430++) {
      const v_c = _a429[_i430];
      if (!(((g[v_c] || -1) === 1))) continue;
      let _q431 = true;
      Q432: {
        const _t433 = sp.rowOf[v_c];
        _g434.length = 0;
        G435: {
          const _a438 = sp.lineCells[_t433];
          for (let _i439 = 0; _i439 < _a438.length; _i439++) {
            const v_x = _a438[_i439];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g434.push(v_x);
          }
        }
        const _t440 = sp.colOf[v_c];
        _g441.length = 0;
        G442: {
          const _a445 = sp.lineCells[_t440];
          for (let _i446 = 0; _i446 < _a445.length; _i446++) {
            const v_x = _a445[_i446];
            if (!(((clueAt(cl.wall, v_x) < 0) && (clueAt(cl.number, v_x) < 0)))) continue;
            _g441.push(v_x);
          }
        }
        const _a447 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g434), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g441));
        for (let _i448 = 0; _i448 < _a447.length; _i448++) {
          const v_p = _a447[_i448];
          if (!((v_p !== v_c))) continue;
          if (!(((g[v_p] || -1) === 2))) {
            _q431 = false;
            break Q432;
          }
        }
      }
      if (!(_q431)) {
        _q427 = false;
        break Q428;
      }
    }
  }
  if (!(_q427)) return false;
  for (let _k449 = 0; _k449 < cl.wall.at.length; _k449++) {
    const _at450 = cl.wall.at[_k449];
    if (!(((g[_at450] || -1) === 2))) return false;
  }
  for (let _k452 = 0; _k452 < cl.number.at.length; _k452++) {
    const _at453 = cl.number.at[_k452];
    const _v454 = cl.number.v[_k452];
    let _c459 = ((g[_at453] || -1) === 2);
    if (_c459) {
      let _g455 = 0;
      G456: {
        const _a457 = sp.adj4[_at453];
        for (let _i458 = 0; _i458 < _a457.length; _i458++) {
          const v_p = _a457[_i458];
          if (!(((g[v_p] || -1) === 1))) continue;
          _g455++;
        }
      }
      _c459 = (_g455 === _v454);
    }
    if (!(_c459)) return false;
  }
  return true;
}

export interface ShineBinding {
  c: number;
  p: number;
}

const shineFacts: number[] = [];

export function shine(b: Marks, sp: GridSpace, cl: Dealt, v_c: number, fire: Fire<ShineBinding> | null): number {
  const _g24: number[] = [];
  const _g33: number[] = [];
  const facts = shineFacts;
  let fired = 0;
  let changed = false;
  if (!((b.value(v_c) === 1))) return 0;
  const _t23 = sp.rowOf[v_c];
  _g24.length = 0;
  G25: {
    const _a28 = sp.lineCells[_t23];
    for (let _i29 = 0; _i29 < _a28.length; _i29++) {
      const v_x = _a28[_i29];
      const _h30 = clueAt(cl.wall, v_x);
      const _h31 = clueAt(cl.number, v_x);
      if (!(((_h30 < 0) && (_h31 < 0)))) continue;
      _g24.push(v_x);
    }
  }
  const _t32 = sp.colOf[v_c];
  _g33.length = 0;
  G34: {
    const _a37 = sp.lineCells[_t32];
    for (let _i38 = 0; _i38 < _a37.length; _i38++) {
      const v_x = _a37[_i38];
      const _h39 = clueAt(cl.wall, v_x);
      const _h40 = clueAt(cl.number, v_x);
      if (!(((_h39 < 0) && (_h40 < 0)))) continue;
      _g33.push(v_x);
    }
  }
  const _a41 = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g24), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g33));
  for (let _i42 = 0; _i42 < _a41.length; _i42++) {
    const v_p = _a41[_i42];
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
  const _g67: number[] = [];
  const _g76: number[] = [];
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  const _a61 = sp.cols;
  for (let _i62 = 0; _i62 < _a61.length; _i62++) {
    const v_X = _a61[_i62];
    const _a63 = sp.lineCells[v_X];
    for (let _i64 = 0; _i64 < _a63.length; _i64++) {
      const v_c = _a63[_i64];
      const _h65 = clueAt(cl.number, v_c);
      const _h84 = clueAt(cl.wall, v_c);
      const v_n = _h65;
      const _t66 = sp.rowOf[v_c];
      _g67.length = 0;
      G68: {
        const _a71 = sp.lineCells[_t66];
        for (let _i72 = 0; _i72 < _a71.length; _i72++) {
          const v_x = _a71[_i72];
          const _h73 = clueAt(cl.wall, v_x);
          const _h74 = clueAt(cl.number, v_x);
          if (!(((_h73 < 0) && (_h74 < 0)))) continue;
          _g67.push(v_x);
        }
      }
      const _t75 = sp.colOf[v_c];
      _g76.length = 0;
      G77: {
        const _a80 = sp.lineCells[_t75];
        for (let _i81 = 0; _i81 < _a80.length; _i81++) {
          const v_x = _a80[_i81];
          const _h82 = clueAt(cl.wall, v_x);
          const _h83 = clueAt(cl.number, v_x);
          if (!(((_h82 < 0) && (_h83 < 0)))) continue;
          _g76.push(v_x);
        }
      }
      const v_L = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g67), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g76));
      facts.length = 0;
      changed = false;
      let _c110 = !(((_h84 < 0) && (_h65 < 0)));
      if (!_c110) {
        let _c89 = (b.value(v_c) !== 1);
        if (!_c89) {
          let _q85 = true;
          Q86: {
            const _a87 = v_L;
            for (let _i88 = 0; _i88 < _a87.length; _i88++) {
              const v_p = _a87[_i88];
              if (!((v_p !== v_c))) continue;
              if (!((b.value(v_p) !== 1))) {
                _q85 = false;
                break Q86;
              }
            }
          }
          _c89 = _q85;
        }
        let _c109 = _c89;
        if (_c109) {
          let _q90 = false;
          Q91: {
            const _a92 = v_L;
            for (let _i93 = 0; _i93 < _a92.length; _i93++) {
              const v_p = _a92[_i93];
              if ((b.value(v_p) === 1)) {
                _q90 = true;
                break Q91;
              }
            }
          }
          let _c108 = _q90;
          if (!_c108) {
            let _g94 = 0;
            G95: {
              const _a96 = v_L;
              for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                const v_p = _a96[_i97];
                if (!(!(b.known(v_p)))) continue;
                _g94++;
              }
            }
            let _c107 = (_g94 >= 1);
            if (_c107) {
              let _g98 = 0;
              G99: {
                const _a100 = v_L;
                for (let _i101 = 0; _i101 < _a100.length; _i101++) {
                  const v_p = _a100[_i101];
                  if (!(!(b.known(v_p)))) continue;
                  _g98++;
                }
              }
              let _c106 = (_g98 > 1);
              if (!_c106) {
                let _q102 = true;
                Q103: {
                  const _a104 = v_L;
                  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
                    const v_p = _a104[_i105];
                    if (!(!(b.known(v_p)))) continue;
                    if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                    if (!(true)) {
                      _q102 = false;
                      break Q103;
                    }
                  }
                }
                _c106 = _q102;
              }
              _c107 = _c106;
            }
            _c108 = _c107;
          }
          _c109 = _c108;
        }
        _c110 = _c109;
      }
      let _c149 = _c110;
      if (_c149) {
        let _c148 = (v_n < 0);
        if (!_c148) {
          let _g111 = 0;
          G112: {
            const _a113 = sp.adj4[v_c];
            for (let _i114 = 0; _i114 < _a113.length; _i114++) {
              const v_p = _a113[_i114];
              if (!((b.value(v_p) === 1))) continue;
              _g111++;
            }
          }
          let _c123 = (_g111 <= v_n);
          if (_c123) {
            let _g115 = 0;
            G116: {
              const _a117 = sp.adj4[v_c];
              for (let _i118 = 0; _i118 < _a117.length; _i118++) {
                const v_p = _a117[_i118];
                if (!((b.value(v_p) === 1))) continue;
                _g115++;
              }
            }
            let _g119 = 0;
            G120: {
              const _a121 = sp.adj4[v_c];
              for (let _i122 = 0; _i122 < _a121.length; _i122++) {
                const v_p = _a121[_i122];
                if (!(!(b.known(v_p)))) continue;
                _g119++;
              }
            }
            _c123 = ((_g115 + _g119) >= v_n);
          }
          let _c133 = _c123;
          if (_c133) {
            let _g124 = 0;
            G125: {
              const _a126 = sp.adj4[v_c];
              for (let _i127 = 0; _i127 < _a126.length; _i127++) {
                const v_p = _a126[_i127];
                if (!((b.value(v_p) === 1))) continue;
                _g124++;
              }
            }
            let _c132 = (_g124 < v_n);
            if (!_c132) {
              let _q128 = true;
              Q129: {
                const _a130 = sp.adj4[v_c];
                for (let _i131 = 0; _i131 < _a130.length; _i131++) {
                  const v_p = _a130[_i131];
                  if (!(!(b.known(v_p)))) continue;
                  if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 2); changed = true; } else facts.push(PLACE, v_p, 2); }
                  if (!(true)) {
                    _q128 = false;
                    break Q129;
                  }
                }
              }
              _c132 = _q128;
            }
            _c133 = _c132;
          }
          let _c147 = _c133;
          if (_c147) {
            let _g134 = 0;
            G135: {
              const _a136 = sp.adj4[v_c];
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_p = _a136[_i137];
                if (!((b.value(v_p) === 1))) continue;
                _g134++;
              }
            }
            let _g138 = 0;
            G139: {
              const _a140 = sp.adj4[v_c];
              for (let _i141 = 0; _i141 < _a140.length; _i141++) {
                const v_p = _a140[_i141];
                if (!(!(b.known(v_p)))) continue;
                _g138++;
              }
            }
            let _c146 = ((_g134 + _g138) > v_n);
            if (!_c146) {
              let _q142 = true;
              Q143: {
                const _a144 = sp.adj4[v_c];
                for (let _i145 = 0; _i145 < _a144.length; _i145++) {
                  const v_p = _a144[_i145];
                  if (!(!(b.known(v_p)))) continue;
                  if (!b.known(v_p)) { if (fire === null) { b.placeAt(v_p, 1); changed = true; } else facts.push(PLACE, v_p, 1); }
                  if (!(true)) {
                    _q142 = false;
                    break Q143;
                  }
                }
              }
              _c146 = _q142;
            }
            _c147 = _c146;
          }
          _c148 = _c147;
        }
        _c149 = _c148;
      }
      if (!(_c149)) return -1;
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
  const _g186: number[] = [];
  const _g195: number[] = [];
  const _g208: number[] = [];
  const _g219: number[] = [];
  const _g228: number[] = [];
  const _g236: number[] = [];
  const _g249: number[] = [];
  const _g258: number[] = [];
  const facts = darkSetFacts;
  let fired = 0;
  let changed = false;
  const _a179 = sp.cols;
  for (let _i180 = 0; _i180 < _a179.length; _i180++) {
    const v_X = _a179[_i180];
    const _a181 = sp.lineCells[v_X];
    for (let _i182 = 0; _i182 < _a181.length; _i182++) {
      const v_u = _a181[_i182];
      const _h183 = clueAt(cl.wall, v_u);
      const _h184 = clueAt(cl.number, v_u);
      if (!(((_h183 < 0) && (_h184 < 0)))) continue;
      const _t185 = sp.rowOf[v_u];
      _g186.length = 0;
      G187: {
        const _a190 = sp.lineCells[_t185];
        for (let _i191 = 0; _i191 < _a190.length; _i191++) {
          const v_x = _a190[_i191];
          const _h192 = clueAt(cl.wall, v_x);
          const _h193 = clueAt(cl.number, v_x);
          if (!(((_h192 < 0) && (_h193 < 0)))) continue;
          _g186.push(v_x);
        }
      }
      const _t194 = sp.colOf[v_u];
      _g195.length = 0;
      G196: {
        const _a199 = sp.lineCells[_t194];
        for (let _i200 = 0; _i200 < _a199.length; _i200++) {
          const v_x = _a199[_i200];
          const _h201 = clueAt(cl.wall, v_x);
          const _h202 = clueAt(cl.number, v_x);
          if (!(((_h201 < 0) && (_h202 < 0)))) continue;
          _g195.push(v_x);
        }
      }
      L203: {
        const v_L = union(stretch(sp.lineCells[sp.rowOf[v_u]], v_u, _g186), stretch(sp.lineCells[sp.colOf[v_u]], v_u, _g195));
        let _q204 = false;
        Q205: {
          const _a206 = v_L;
          for (let _i207 = 0; _i207 < _a206.length; _i207++) {
            const v_p = _a206[_i207];
            if ((b.value(v_p) === 1)) {
              _q204 = true;
              break Q205;
            }
          }
        }
        if (!(!(_q204))) break L203;
        _g208.length = 0;
        G209: {
          const _a212 = v_L;
          for (let _i213 = 0; _i213 < _a212.length; _i213++) {
            const v_s = _a212[_i213];
            if (!(!(b.known(v_s)))) continue;
            _g208.push(v_s);
          }
        }
        const v_S = _g208;
        const _h214 = v_S.length;
        facts.length = 0;
        changed = false;
        let _c282 = (_h214 > 0);
        if (_c282) {
          let _q215 = true;
          Q216: {
            const _t217 = (v_S.length > 0 ? v_S[0] : -1);
            const _t218 = sp.rowOf[_t217];
            _g219.length = 0;
            G220: {
              const _a223 = sp.lineCells[_t218];
              for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                const v_x = _a223[_i224];
                const _h225 = clueAt(cl.wall, v_x);
                const _h226 = clueAt(cl.number, v_x);
                if (!(((_h225 < 0) && (_h226 < 0)))) continue;
                _g219.push(v_x);
              }
            }
            const _t227 = sp.colOf[_t217];
            _g228.length = 0;
            G229: {
              const _a232 = sp.lineCells[_t227];
              for (let _i233 = 0; _i233 < _a232.length; _i233++) {
                const v_x = _a232[_i233];
                const _h234 = clueAt(cl.wall, v_x);
                const _h235 = clueAt(cl.number, v_x);
                if (!(((_h234 < 0) && (_h235 < 0)))) continue;
                _g228.push(v_x);
              }
            }
            _g236.length = 0;
            G237: {
              const _a242 = sp.adj4[_t217];
              for (let _i243 = 0; _i243 < _a242.length; _i243++) {
                const v_k = _a242[_i243];
                const _a244 = sp.adj4[v_k];
                for (let _i245 = 0; _i245 < _a244.length; _i245++) {
                  const v_p = _a244[_i245];
                  if (!_g236.includes(v_p)) _g236.push(v_p);
                }
              }
            }
            const _a246 = union(union(stretch(sp.lineCells[sp.rowOf[_t217]], _t217, _g219), stretch(sp.lineCells[sp.colOf[_t217]], _t217, _g228)), _g236);
            for (let _i247 = 0; _i247 < _a246.length; _i247++) {
              const v_d = _a246[_i247];
              if (!(!(b.known(v_d)))) continue;
              const _t248 = sp.rowOf[v_d];
              _g249.length = 0;
              G250: {
                const _a253 = sp.lineCells[_t248];
                for (let _i254 = 0; _i254 < _a253.length; _i254++) {
                  const v_x = _a253[_i254];
                  const _h255 = clueAt(cl.wall, v_x);
                  const _h256 = clueAt(cl.number, v_x);
                  if (!(((_h255 < 0) && (_h256 < 0)))) continue;
                  _g249.push(v_x);
                }
              }
              const _t257 = sp.colOf[v_d];
              _g258.length = 0;
              G259: {
                const _a262 = sp.lineCells[_t257];
                for (let _i263 = 0; _i263 < _a262.length; _i263++) {
                  const v_x = _a262[_i263];
                  const _h264 = clueAt(cl.wall, v_x);
                  const _h265 = clueAt(cl.number, v_x);
                  if (!(((_h264 < 0) && (_h265 < 0)))) continue;
                  _g258.push(v_x);
                }
              }
              L266: {
                const v_D = union(stretch(sp.lineCells[sp.rowOf[v_d]], v_d, _g249), stretch(sp.lineCells[sp.colOf[v_d]], v_d, _g258));
                let _q267 = true;
                Q268: {
                  const _a269 = v_S;
                  for (let _i270 = 0; _i270 < _a269.length; _i270++) {
                    const v_s = _a269[_i270];
                    let _c281 = (v_s !== v_d);
                    if (_c281) {
                      let _c280 = (v_D.includes(v_s));
                      if (!_c280) {
                        let _q271 = false;
                        Q272: {
                          const _a273 = sp.adj4[v_d];
                          for (let _i274 = 0; _i274 < _a273.length; _i274++) {
                            const v_k = _a273[_i274];
                            const _h275 = clueAt(cl.number, v_k);
                            if (!(((_h275 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                            let _g276 = 0;
                            G277: {
                              const _a278 = sp.adj4[v_k];
                              for (let _i279 = 0; _i279 < _a278.length; _i279++) {
                                const v_p = _a278[_i279];
                                if (!((b.value(v_p) === 1))) continue;
                                _g276++;
                              }
                            }
                            if (((_g276 + 1) === _h275)) {
                              _q271 = true;
                              break Q272;
                            }
                          }
                        }
                        _c280 = _q271;
                      }
                      _c281 = _c280;
                    }
                    if (!(_c281)) {
                      _q267 = false;
                      break Q268;
                    }
                  }
                }
                if (!(_q267)) break L266;
                if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                if (!(true)) {
                  _q215 = false;
                  break Q216;
                }
              }
            }
          }
          _c282 = _q215;
        }
        if (!(_c282)) return -1;
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
  const _g318: number[] = [];
  const _g342: number[] = [];
  const _g351: number[] = [];
  const _g359: number[] = [];
  const _g372: number[] = [];
  const _g381: number[] = [];
  const facts = clueSetFacts;
  let fired = 0;
  let changed = false;
  const _a308 = sp.cols;
  for (let _i309 = 0; _i309 < _a308.length; _i309++) {
    const v_X = _a308[_i309];
    const _a310 = sp.lineCells[v_X];
    for (let _i311 = 0; _i311 < _a310.length; _i311++) {
      const v_k = _a310[_i311];
      const _h312 = clueAt(cl.number, v_k);
      L313: {
        const v_n = _h312;
        let _g314 = 0;
        G315: {
          const _a316 = sp.adj4[v_k];
          for (let _i317 = 0; _i317 < _a316.length; _i317++) {
            const v_p = _a316[_i317];
            if (!((b.value(v_p) === 1))) continue;
            _g314++;
          }
        }
        if (!((v_n > _g314))) break L313;
        _g318.length = 0;
        G319: {
          const _a322 = sp.adj4[v_k];
          for (let _i323 = 0; _i323 < _a322.length; _i323++) {
            const v_p = _a322[_i323];
            if (!(!(b.known(v_p)))) continue;
            _g318.push(v_p);
          }
        }
        const v_F = _g318;
        const _h329 = v_F.length;
        let _g324 = 0;
        G325: {
          const _a326 = sp.adj4[v_k];
          for (let _i327 = 0; _i327 < _a326.length; _i327++) {
            const v_p = _a326[_i327];
            if (!((b.value(v_p) === 1))) continue;
            _g324++;
          }
        }
        L328: {
          const v_m = (v_n - _g324);
          if (!((v_m <= _h329))) break L328;
          const _h336 = (_h329 - v_m);
          const _h337 = (_h336 + 1);
          const _e330 = v_F;
          const _t333 = ((_h329 - v_m) + 1);
          const _n334 = 1 << _e330.length;
          for (let _k331 = _t333 > _e330.length ? _n334 : (1 << _t333) - 1; _k331 < _n334; _k331 = _t333 === 0 ? _n334 : nextOfSize(_k331)) {
            const v_T: number[] = [];
            for (let _j332 = 0; _j332 < _e330.length; _j332++) if ((_k331 >> (_e330.length - 1 - _j332)) & 1) v_T.push(_e330[_j332]);
            const _h335 = v_T.length;
            if (!((_h335 === _h337))) continue;
            facts.length = 0;
            changed = false;
            let _q338 = true;
            Q339: {
              const _t340 = (v_T.length > 0 ? v_T[0] : -1);
              const _t341 = sp.rowOf[_t340];
              _g342.length = 0;
              G343: {
                const _a346 = sp.lineCells[_t341];
                for (let _i347 = 0; _i347 < _a346.length; _i347++) {
                  const v_x = _a346[_i347];
                  const _h348 = clueAt(cl.wall, v_x);
                  const _h349 = clueAt(cl.number, v_x);
                  if (!(((_h348 < 0) && (_h349 < 0)))) continue;
                  _g342.push(v_x);
                }
              }
              const _t350 = sp.colOf[_t340];
              _g351.length = 0;
              G352: {
                const _a355 = sp.lineCells[_t350];
                for (let _i356 = 0; _i356 < _a355.length; _i356++) {
                  const v_x = _a355[_i356];
                  const _h357 = clueAt(cl.wall, v_x);
                  const _h358 = clueAt(cl.number, v_x);
                  if (!(((_h357 < 0) && (_h358 < 0)))) continue;
                  _g351.push(v_x);
                }
              }
              _g359.length = 0;
              G360: {
                const _a365 = sp.adj4[_t340];
                for (let _i366 = 0; _i366 < _a365.length; _i366++) {
                  const v_k = _a365[_i366];
                  const _a367 = sp.adj4[v_k];
                  for (let _i368 = 0; _i368 < _a367.length; _i368++) {
                    const v_p = _a367[_i368];
                    if (!_g359.includes(v_p)) _g359.push(v_p);
                  }
                }
              }
              const _a369 = union(union(stretch(sp.lineCells[sp.rowOf[_t340]], _t340, _g342), stretch(sp.lineCells[sp.colOf[_t340]], _t340, _g351)), _g359);
              for (let _i370 = 0; _i370 < _a369.length; _i370++) {
                const v_d = _a369[_i370];
                if (!(!(b.known(v_d)))) continue;
                const _t371 = sp.rowOf[v_d];
                _g372.length = 0;
                G373: {
                  const _a376 = sp.lineCells[_t371];
                  for (let _i377 = 0; _i377 < _a376.length; _i377++) {
                    const v_x = _a376[_i377];
                    const _h378 = clueAt(cl.wall, v_x);
                    const _h379 = clueAt(cl.number, v_x);
                    if (!(((_h378 < 0) && (_h379 < 0)))) continue;
                    _g372.push(v_x);
                  }
                }
                const _t380 = sp.colOf[v_d];
                _g381.length = 0;
                G382: {
                  const _a385 = sp.lineCells[_t380];
                  for (let _i386 = 0; _i386 < _a385.length; _i386++) {
                    const v_x = _a385[_i386];
                    const _h387 = clueAt(cl.wall, v_x);
                    const _h388 = clueAt(cl.number, v_x);
                    if (!(((_h387 < 0) && (_h388 < 0)))) continue;
                    _g381.push(v_x);
                  }
                }
                L389: {
                  const v_D = union(stretch(sp.lineCells[sp.rowOf[v_d]], v_d, _g372), stretch(sp.lineCells[sp.colOf[v_d]], v_d, _g381));
                  let _q390 = true;
                  Q391: {
                    const _a392 = v_T;
                    for (let _i393 = 0; _i393 < _a392.length; _i393++) {
                      const v_s = _a392[_i393];
                      let _c404 = (v_s !== v_d);
                      if (_c404) {
                        let _c403 = (v_D.includes(v_s));
                        if (!_c403) {
                          let _q394 = false;
                          Q395: {
                            const _a396 = sp.adj4[v_d];
                            for (let _i397 = 0; _i397 < _a396.length; _i397++) {
                              const v_k = _a396[_i397];
                              const _h398 = clueAt(cl.number, v_k);
                              if (!(((_h398 >= 0) && (sp.adj4[v_k].includes(v_s))))) continue;
                              let _g399 = 0;
                              G400: {
                                const _a401 = sp.adj4[v_k];
                                for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                                  const v_p = _a401[_i402];
                                  if (!((b.value(v_p) === 1))) continue;
                                  _g399++;
                                }
                              }
                              if (((_g399 + 1) === _h398)) {
                                _q394 = true;
                                break Q395;
                              }
                            }
                          }
                          _c403 = _q394;
                        }
                        _c404 = _c403;
                      }
                      if (!(_c404)) {
                        _q390 = false;
                        break Q391;
                      }
                    }
                  }
                  if (!(_q390)) break L389;
                  if (!b.known(v_d)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
                  if (!(true)) {
                    _q338 = false;
                    break Q339;
                  }
                }
              }
            }
            if (!(_q338)) return -1;
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
