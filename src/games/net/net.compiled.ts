// Compiled by `npm run describe` from src/games/net/net.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, edgeGroups, keptEdgeGroups, keptStore, minus, rangeMask, setOf, type Footprint, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  piece: ClueList;
  wall: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "fitLock" | "fitNote" | "loopLock" | "loopNote" | "sealLock" | "sealNote" | "strandLock" | "strandNote";

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
  { id: "fitLock", tier: 0 },
  { id: "fitNote", tier: 0 },
  { id: "loopLock", tier: 0 },
  { id: "loopNote", tier: 0 },
  { id: "sealLock", tier: 0 },
  { id: "sealNote", tier: 0 },
  { id: "strandLock", tier: 0 },
  { id: "strandNote", tier: 0 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Unreasonable"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g8173: number[] = [];
  const _domain = rangeMask(1, 2);
  const _h8182 = sp.cells.length;
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q8166 = true;
  Q8167: {
    const _a8168 = sp.cells;
    for (let _i8169 = 0; _i8169 < _a8168.length; _i8169++) {
      const v_c = _a8168[_i8169];
      const _h8170 = clueAt(cl.piece, v_c);
      if (!((_h8170 !== -1))) {
        _q8166 = false;
        break Q8167;
      }
    }
  }
  if (!(_q8166)) return false;
  let _q8171 = true;
  Q8172: {
    _g8173.length = 0;
    G8174: {
      const _a8177 = sp.edges;
      for (let _i8178 = 0; _i8178 < _a8177.length; _i8178++) {
        const v_e = _a8177[_i8178];
        const _h8179 = (g[v_e] || -1);
        if (!((_h8179 === 1))) continue;
        _g8173.push(v_e);
      }
    }
    const v_L = _g8173;
    const _h8181 = v_L.length;
    const _eg8187 = edgeGroups(sp, v_L);
    const _t8180 = sp.cells;
    const v_s = (_t8180.length > 0 ? _t8180[0] : -1);
    let _c8188: boolean = (_h8181 === (_h8182 - 1));
    if (_c8188) {
      let _q8183 = true;
      Q8184: {
        const _a8185 = sp.cells;
        for (let _i8186 = 0; _i8186 < _a8185.length; _i8186++) {
          const v_c = _a8185[_i8186];
          if (!((_eg8187.of(v_c) === _eg8187.of(v_s)))) {
            _q8183 = false;
            break Q8184;
          }
        }
      }
      _c8188 = _q8183;
    }
    if (!(_c8188)) {
      _q8171 = false;
      break Q8172;
    }
  }
  if (!(_q8171)) return false;
  for (let _k8189 = 0; _k8189 < cl.piece.at.length; _k8189++) {
    const _at8190 = cl.piece.at[_k8189];
    const _v8191 = cl.piece.v[_k8189];
    let _g8192 = 0;
    G8193: {
      const _a8194 = sp.cellEdges[_at8190];
      for (let _i8195 = 0; _i8195 < _a8194.length; _i8195++) {
        const v_e = _a8194[_i8195];
        const _h8196 = (g[v_e] || -1);
        if (!((_h8196 === 1))) continue;
        _g8192++;
      }
    }
    let _c8207: boolean = (_g8192 === arms(sp, cl, _at8190));
    if (_c8207) {
      let _q8197 = true;
      Q8198: {
        const _a8199 = sp.cellEdges[_at8190];
        for (let _i8200 = 0; _i8200 < _a8199.length; _i8200++) {
          const v_e = _a8199[_i8200];
          const _h8204 = (g[v_e] || -1);
          const _h8205 = (_h8204 === 1);
          const _a8201 = sp.cellEdges[_at8190];
          const _n8202 = _i8200;
          for (let _i8203 = 0; _i8203 < _n8202; _i8203++) {
            const v_x = _a8201[_i8203];
            const _h8206 = (g[v_x] || -1);
            if (!((((arms(sp, cl, _at8190) === 2) && _h8205) && (_h8206 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v8191 === 3)))) {
              _q8197 = false;
              break Q8198;
            }
          }
        }
      }
      _c8207 = _q8197;
    }
    if (!(_c8207)) return false;
  }
  for (let _k8208 = 0; _k8208 < cl.wall.at.length; _k8208++) {
    const _at8209 = cl.wall.at[_k8208];
    if (!(((g[_at8209] || -1) === 2))) return false;
  }
  return true;
}

export interface FitLockBinding {
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const fitLockFacts: number[] = [];
let fitLockCands = new Int32Array(0);

/** What a binding at one element of its first binder reads. */
const fitLockFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitLockBinding> | null): number {
  const _g108: number[] = [];
  const _g116: number[] = [];
  const _p140 = new Int32Array(sp.edges.length);
  let _l141: readonly number[] = [];
  let _y142 = false;
  const _f146 = new Int32Array(sp.edges.length).fill(-1);
  let _l147: readonly number[] = [];
  const _s148: number[] = [];
  const _g161: number[] = [];
  const _p185 = new Int32Array(sp.edges.length);
  let _l186: readonly number[] = [];
  let _y187 = false;
  const _f191 = new Int32Array(sp.edges.length).fill(-1);
  let _l192: readonly number[] = [];
  const _s193: number[] = [];
  const facts = fitLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (fitLockCands.length < sp.edges.length) fitLockCands = new Int32Array(sp.edges.length);
  const cands = fitLockCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitLockFootprint) ?? null) : null;
  const _a106 = sp.cells;
  for (let _i107 = 0; _i107 < _a106.length; _i107++) {
    const v_c = _a106[_i107];
    let _g143 = -1;
    let _g188 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    _g108.length = 0;
    G109: {
      const _a112 = sp.cellEdges[v_c];
      for (let _i113 = 0; _i113 < _a112.length; _i113++) {
        const v_e = _a112[_i113];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g108.push(v_e);
      }
    }
    L114: {
      const v_F = _g108;
      const _h115 = v_F.length;
      if (!((_h115 > 0))) break L114;
      _g116.length = 0;
      G117: {
        const _a138 = v_F;
        for (let _i139 = 0; _i139 < _a138.length; _i139++) {
          const v_e = _a138[_i139];
          if (_g143 !== _epoch) {
            _g143 = _epoch;
            for (const _e144 of _l141) _p140[_e144] = 0;
            _y142 = false;
            const _a145 = sp.cellEdges[v_c];
            for (const _e149 of _l147) _f146[_e149] = -1;
            _l147 = _a145;
            let _i151 = 0;
            _s148[0] = 0;
            let _o155 = _a145.length === 0;
            for (;;) {
              if (_a145.length === 0) {
                if (!_o155) break;
                _o155 = false;
              }
              while (_a145.length > 0 && _i151 >= 0) {
                const _e149 = _a145[_i151];
                if (_s148[_i151] > 0) _f146[_e149] = -1;
                let _r154 = (cands[_e149] >= 0 ? cands[_e149] : (cands[_e149] = b.cands[_e149])) & ~((2 << _s148[_i151]) - 1);
                let _d150 = 0;
                V153: for (; _r154 !== 0; _r154 &= _r154 - 1) {
                  _d150 = 31 - Math.clz32(_r154 & -_r154);
                  _f146[_e149] = _d150;
                  for (let _j152 = 0; _j152 < _i151; _j152++) {
                    const _y156 = _a145[_j152];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f146[_e149] === 1)) && (_f146[_y156] === 1)))) continue;
                    if (!((bent(sp, _e149, _y156) === (clueAt(cl.piece, v_c) === 3)))) continue V153;
                  }
                  break;
                }
                if (_r154 === 0) {
                  _s148[_i151] = 0;
                  _i151--;
                  continue;
                }
                _s148[_i151] = _d150;
                if (_i151 === _a145.length - 1) break;
                _i151++;
                _s148[_i151] = 0;
              }
              if (_i151 < 0) break;
              let _g157 = 0;
              G158: {
                const _a159 = sp.cellEdges[v_c];
                for (let _i160 = 0; _i160 < _a159.length; _i160++) {
                  const v_x = _a159[_i160];
                  if (!((_f146[v_x] === 1))) continue;
                  _g157++;
                }
              }
              if (!((_g157 === arms(sp, cl, v_c)))) continue;
              if (!(true)) continue;
              _l141 = _a145;
              _y142 = true;
              for (const _e144 of _a145) _p140[_e144] |= 1 << _f146[_e144];
            }
          }
          if (!(((((_p140[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y142 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g116.push(v_e);
        }
      }
      const v_W = _g116;
      _g161.length = 0;
      G162: {
        const _a183 = v_F;
        for (let _i184 = 0; _i184 < _a183.length; _i184++) {
          const v_e = _a183[_i184];
          if (_g188 !== _epoch) {
            _g188 = _epoch;
            for (const _e189 of _l186) _p185[_e189] = 0;
            _y187 = false;
            const _a190 = sp.cellEdges[v_c];
            for (const _e194 of _l192) _f191[_e194] = -1;
            _l192 = _a190;
            let _i196 = 0;
            _s193[0] = 0;
            let _o200 = _a190.length === 0;
            for (;;) {
              if (_a190.length === 0) {
                if (!_o200) break;
                _o200 = false;
              }
              while (_a190.length > 0 && _i196 >= 0) {
                const _e194 = _a190[_i196];
                if (_s193[_i196] > 0) _f191[_e194] = -1;
                let _r199 = (cands[_e194] >= 0 ? cands[_e194] : (cands[_e194] = b.cands[_e194])) & ~((2 << _s193[_i196]) - 1);
                let _d195 = 0;
                V198: for (; _r199 !== 0; _r199 &= _r199 - 1) {
                  _d195 = 31 - Math.clz32(_r199 & -_r199);
                  _f191[_e194] = _d195;
                  for (let _j197 = 0; _j197 < _i196; _j197++) {
                    const _y201 = _a190[_j197];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f191[_e194] === 1)) && (_f191[_y201] === 1)))) continue;
                    if (!((bent(sp, _e194, _y201) === (clueAt(cl.piece, v_c) === 3)))) continue V198;
                  }
                  break;
                }
                if (_r199 === 0) {
                  _s193[_i196] = 0;
                  _i196--;
                  continue;
                }
                _s193[_i196] = _d195;
                if (_i196 === _a190.length - 1) break;
                _i196++;
                _s193[_i196] = 0;
              }
              if (_i196 < 0) break;
              let _g202 = 0;
              G203: {
                const _a204 = sp.cellEdges[v_c];
                for (let _i205 = 0; _i205 < _a204.length; _i205++) {
                  const v_x = _a204[_i205];
                  if (!((_f191[v_x] === 1))) continue;
                  _g202++;
                }
              }
              if (!((_g202 === arms(sp, cl, v_c)))) continue;
              if (!(true)) continue;
              _l186 = _a190;
              _y187 = true;
              for (const _e189 of _a190) _p185[_e189] |= 1 << _f191[_e189];
            }
          }
          if (!(((((_p185[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y187 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g161.push(v_e);
        }
      }
      L206: {
        const v_N = _g161;
        let _q207 = true;
        Q208: {
          const _a209 = v_F;
          for (let _i210 = 0; _i210 < _a209.length; _i210++) {
            const v_e = _a209[_i210];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q207 = false;
              break Q208;
            }
          }
        }
        if (!(_q207)) break L206;
        facts.length = 0;
        changed = false;
        let _q211 = true;
        Q212: {
          const _a213 = v_F;
          for (let _i214 = 0; _i214 < _a213.length; _i214++) {
            const v_e = _a213[_i214];
            let _c216: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c216) {
              let _c215: boolean = !(!(v_W.includes(v_e)));
              if (!_c215) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c215 = true;
              }
              _c216 = _c215;
            }
            let _c218: boolean = _c216;
            if (_c218) {
              let _c217: boolean = !(!(v_N.includes(v_e)));
              if (!_c217) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c217 = true;
              }
              _c218 = _c217;
            }
            if (!(_c218)) {
              _q211 = false;
              break Q212;
            }
          }
        }
        if (!(_q211)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface FitNoteBinding {
  c: number;
  e: number;
  A: boolean;
  B: boolean;
}

const fitNoteFacts: number[] = [];
let fitNoteCands = new Int32Array(0);

/** What a binding at one element of its first binder reads. */
const fitNoteFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function fitNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<FitNoteBinding> | null): number {
  const _p264 = new Int32Array(sp.edges.length);
  let _l265: readonly number[] = [];
  let _y266 = false;
  const _f270 = new Int32Array(sp.edges.length).fill(-1);
  let _l271: readonly number[] = [];
  const _s272: number[] = [];
  const _p285 = new Int32Array(sp.edges.length);
  let _l286: readonly number[] = [];
  let _y287 = false;
  const _f291 = new Int32Array(sp.edges.length).fill(-1);
  let _l292: readonly number[] = [];
  const _s293: number[] = [];
  const facts = fitNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (fitNoteCands.length < sp.edges.length) fitNoteCands = new Int32Array(sp.edges.length);
  const cands = fitNoteCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(fitNoteFootprint) ?? null) : null;
  const _a260 = sp.cells;
  for (let _i261 = 0; _i261 < _a260.length; _i261++) {
    const v_c = _a260[_i261];
    let _g267 = -1;
    let _g288 = -1;
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    const _a262 = sp.cellEdges[v_c];
    for (let _i263 = 0; _i263 < _a262.length; _i263++) {
      const v_e = _a262[_i263];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g267 !== _epoch) {
        _g267 = _epoch;
        for (const _e268 of _l265) _p264[_e268] = 0;
        _y266 = false;
        const _a269 = sp.cellEdges[v_c];
        for (const _e273 of _l271) _f270[_e273] = -1;
        _l271 = _a269;
        let _i275 = 0;
        _s272[0] = 0;
        let _o279 = _a269.length === 0;
        for (;;) {
          if (_a269.length === 0) {
            if (!_o279) break;
            _o279 = false;
          }
          while (_a269.length > 0 && _i275 >= 0) {
            const _e273 = _a269[_i275];
            if (_s272[_i275] > 0) _f270[_e273] = -1;
            let _r278 = (cands[_e273] >= 0 ? cands[_e273] : (cands[_e273] = b.cands[_e273])) & ~((2 << _s272[_i275]) - 1);
            let _d274 = 0;
            V277: for (; _r278 !== 0; _r278 &= _r278 - 1) {
              _d274 = 31 - Math.clz32(_r278 & -_r278);
              _f270[_e273] = _d274;
              for (let _j276 = 0; _j276 < _i275; _j276++) {
                const _y280 = _a269[_j276];
                if (!((((arms(sp, cl, v_c) === 2) && (_f270[_e273] === 1)) && (_f270[_y280] === 1)))) continue;
                if (!((bent(sp, _e273, _y280) === (clueAt(cl.piece, v_c) === 3)))) continue V277;
              }
              break;
            }
            if (_r278 === 0) {
              _s272[_i275] = 0;
              _i275--;
              continue;
            }
            _s272[_i275] = _d274;
            if (_i275 === _a269.length - 1) break;
            _i275++;
            _s272[_i275] = 0;
          }
          if (_i275 < 0) break;
          let _g281 = 0;
          G282: {
            const _a283 = sp.cellEdges[v_c];
            for (let _i284 = 0; _i284 < _a283.length; _i284++) {
              const v_x = _a283[_i284];
              if (!((_f270[v_x] === 1))) continue;
              _g281++;
            }
          }
          if (!((_g281 === arms(sp, cl, v_c)))) continue;
          if (!(true)) continue;
          _l265 = _a269;
          _y266 = true;
          for (const _e268 of _a269) _p264[_e268] |= 1 << _f270[_e268];
        }
      }
      const v_A = ((((_p264[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y266 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g288 !== _epoch) {
        _g288 = _epoch;
        for (const _e289 of _l286) _p285[_e289] = 0;
        _y287 = false;
        const _a290 = sp.cellEdges[v_c];
        for (const _e294 of _l292) _f291[_e294] = -1;
        _l292 = _a290;
        let _i296 = 0;
        _s293[0] = 0;
        let _o300 = _a290.length === 0;
        for (;;) {
          if (_a290.length === 0) {
            if (!_o300) break;
            _o300 = false;
          }
          while (_a290.length > 0 && _i296 >= 0) {
            const _e294 = _a290[_i296];
            if (_s293[_i296] > 0) _f291[_e294] = -1;
            let _r299 = (cands[_e294] >= 0 ? cands[_e294] : (cands[_e294] = b.cands[_e294])) & ~((2 << _s293[_i296]) - 1);
            let _d295 = 0;
            V298: for (; _r299 !== 0; _r299 &= _r299 - 1) {
              _d295 = 31 - Math.clz32(_r299 & -_r299);
              _f291[_e294] = _d295;
              for (let _j297 = 0; _j297 < _i296; _j297++) {
                const _y301 = _a290[_j297];
                if (!((((arms(sp, cl, v_c) === 2) && (_f291[_e294] === 1)) && (_f291[_y301] === 1)))) continue;
                if (!((bent(sp, _e294, _y301) === (clueAt(cl.piece, v_c) === 3)))) continue V298;
              }
              break;
            }
            if (_r299 === 0) {
              _s293[_i296] = 0;
              _i296--;
              continue;
            }
            _s293[_i296] = _d295;
            if (_i296 === _a290.length - 1) break;
            _i296++;
            _s293[_i296] = 0;
          }
          if (_i296 < 0) break;
          let _g302 = 0;
          G303: {
            const _a304 = sp.cellEdges[v_c];
            for (let _i305 = 0; _i305 < _a304.length; _i305++) {
              const v_x = _a304[_i305];
              if (!((_f291[v_x] === 1))) continue;
              _g302++;
            }
          }
          if (!((_g302 === arms(sp, cl, v_c)))) continue;
          if (!(true)) continue;
          _l286 = _a290;
          _y287 = true;
          for (const _e289 of _a290) _p285[_e289] |= 1 << _f291[_e289];
        }
      }
      L306: {
        const v_B = ((((_p285[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y287 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L306;
        facts.length = 0;
        changed = false;
        let _c308: boolean = (v_A || v_B);
        if (_c308) {
          let _c307: boolean = !(!(v_A));
          if (!_c307) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c307 = true;
          }
          _c308 = _c307;
        }
        let _c310: boolean = _c308;
        if (_c310) {
          let _c309: boolean = !(!(v_B));
          if (!_c309) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c309 = true;
          }
          _c310 = _c309;
        }
        if (!(_c310)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface LoopLockBinding {
  L: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const loopLockFacts: number[] = [];
let loopLockCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function loopLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopLockBinding> | null): number {
  const _g439: number[] = [];
  const _g447: number[] = [];
  const _g456: number[] = [];
  const _p486 = new Int32Array(sp.edges.length);
  let _l487: readonly number[] = [];
  let _y488 = false;
  const _f492 = new Int32Array(sp.edges.length).fill(-1);
  let _l493: readonly number[] = [];
  const _s494: number[] = [];
  const _g513: number[] = [];
  const _p543 = new Int32Array(sp.edges.length);
  let _l544: readonly number[] = [];
  let _y545 = false;
  const _f549 = new Int32Array(sp.edges.length).fill(-1);
  let _l550: readonly number[] = [];
  const _s551: number[] = [];
  const facts = loopLockFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (loopLockCands.length < sp.edges.length) loopLockCands = new Int32Array(sp.edges.length);
  const cands = loopLockCands;
  cands.fill(-1);
  _g439.length = 0;
  G440: {
    const _a443 = sp.edges;
    for (let _i444 = 0; _i444 < _a443.length; _i444++) {
      const v_e = _a443[_i444];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g439.push(v_e);
    }
  }
  const v_L = _g439;
  const _eg455 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a445 = sp.cells;
  for (let _i446 = 0; _i446 < _a445.length; _i446++) {
    const v_c = _a445[_i446];
    _g447.length = 0;
    G448: {
      const _a451 = sp.cellEdges[v_c];
      for (let _i452 = 0; _i452 < _a451.length; _i452++) {
        const v_e = _a451[_i452];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g447.push(v_e);
      }
    }
    L453: {
      const v_F = _g447;
      const _h454 = v_F.length;
      if (!((_h454 > 0))) break L453;
      const v_G = _eg455.of(v_c);
      let _g489 = -1;
      let _g546 = -1;
      _g456.length = 0;
      G457: {
        const _a484 = v_F;
        for (let _i485 = 0; _i485 < _a484.length; _i485++) {
          const v_e = _a484[_i485];
          if (_g489 !== _epoch) {
            _g489 = _epoch;
            for (const _e490 of _l487) _p486[_e490] = 0;
            _y488 = false;
            const _a491 = sp.cellEdges[v_c];
            for (const _e495 of _l493) _f492[_e495] = -1;
            _l493 = _a491;
            let _i497 = 0;
            _s494[0] = 0;
            let _o501 = _a491.length === 0;
            for (;;) {
              if (_a491.length === 0) {
                if (!_o501) break;
                _o501 = false;
              }
              while (_a491.length > 0 && _i497 >= 0) {
                const _e495 = _a491[_i497];
                if (_s494[_i497] > 0) _f492[_e495] = -1;
                let _r500 = (cands[_e495] >= 0 ? cands[_e495] : (cands[_e495] = b.cands[_e495])) & ~((2 << _s494[_i497]) - 1);
                let _d496 = 0;
                V499: for (; _r500 !== 0; _r500 &= _r500 - 1) {
                  _d496 = 31 - Math.clz32(_r500 & -_r500);
                  _f492[_e495] = _d496;
                  for (let _j498 = 0; _j498 < _i497; _j498++) {
                    const _y502 = _a491[_j498];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f492[_e495] === 1)) && (_f492[_y502] === 1)))) continue;
                    if (!((bent(sp, _e495, _y502) === (clueAt(cl.piece, v_c) === 3)))) continue V499;
                  }
                  for (let _j498 = 0; _j498 < _i497; _j498++) {
                    const _y503 = _a491[_j498];
                    if (!(((((_f492[_e495] === 1) && (_f492[_y503] === 1)) && !((b.grid[_e495] !== 0))) && !((b.grid[_y503] !== 0))))) continue;
                    if (!(!(_eg455.of((sp.edgeEnds[2 * _y503] === v_c ? sp.edgeEnds[2 * _y503 + 1] : sp.edgeEnds[2 * _y503])) === _eg455.of((sp.edgeEnds[2 * _e495] === v_c ? sp.edgeEnds[2 * _e495 + 1] : sp.edgeEnds[2 * _e495]))))) continue V499;
                  }
                  break;
                }
                if (_r500 === 0) {
                  _s494[_i497] = 0;
                  _i497--;
                  continue;
                }
                _s494[_i497] = _d496;
                if (_i497 === _a491.length - 1) break;
                _i497++;
                _s494[_i497] = 0;
              }
              if (_i497 < 0) break;
              let _g504 = 0;
              G505: {
                const _a506 = sp.cellEdges[v_c];
                for (let _i507 = 0; _i507 < _a506.length; _i507++) {
                  const v_x = _a506[_i507];
                  if (!((_f492[v_x] === 1))) continue;
                  _g504++;
                }
              }
              let _c512: boolean = (_g504 === arms(sp, cl, v_c));
              if (_c512) {
                let _q508 = true;
                Q509: {
                  const _a510 = sp.cellEdges[v_c];
                  for (let _i511 = 0; _i511 < _a510.length; _i511++) {
                    const v_x = _a510[_i511];
                    if (!(((_f492[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg455.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q508 = false;
                      break Q509;
                    }
                  }
                }
                _c512 = _q508;
              }
              if (!(_c512)) continue;
              if (!(true)) continue;
              _l487 = _a491;
              _y488 = true;
              for (const _e490 of _a491) _p486[_e490] |= 1 << _f492[_e490];
            }
          }
          if (!(((((_p486[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y488 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g456.push(v_e);
        }
      }
      const v_W = _g456;
      _g513.length = 0;
      G514: {
        const _a541 = v_F;
        for (let _i542 = 0; _i542 < _a541.length; _i542++) {
          const v_e = _a541[_i542];
          if (_g546 !== _epoch) {
            _g546 = _epoch;
            for (const _e547 of _l544) _p543[_e547] = 0;
            _y545 = false;
            const _a548 = sp.cellEdges[v_c];
            for (const _e552 of _l550) _f549[_e552] = -1;
            _l550 = _a548;
            let _i554 = 0;
            _s551[0] = 0;
            let _o558 = _a548.length === 0;
            for (;;) {
              if (_a548.length === 0) {
                if (!_o558) break;
                _o558 = false;
              }
              while (_a548.length > 0 && _i554 >= 0) {
                const _e552 = _a548[_i554];
                if (_s551[_i554] > 0) _f549[_e552] = -1;
                let _r557 = (cands[_e552] >= 0 ? cands[_e552] : (cands[_e552] = b.cands[_e552])) & ~((2 << _s551[_i554]) - 1);
                let _d553 = 0;
                V556: for (; _r557 !== 0; _r557 &= _r557 - 1) {
                  _d553 = 31 - Math.clz32(_r557 & -_r557);
                  _f549[_e552] = _d553;
                  for (let _j555 = 0; _j555 < _i554; _j555++) {
                    const _y559 = _a548[_j555];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f549[_e552] === 1)) && (_f549[_y559] === 1)))) continue;
                    if (!((bent(sp, _e552, _y559) === (clueAt(cl.piece, v_c) === 3)))) continue V556;
                  }
                  for (let _j555 = 0; _j555 < _i554; _j555++) {
                    const _y560 = _a548[_j555];
                    if (!(((((_f549[_e552] === 1) && (_f549[_y560] === 1)) && !((b.grid[_e552] !== 0))) && !((b.grid[_y560] !== 0))))) continue;
                    if (!(!(_eg455.of((sp.edgeEnds[2 * _y560] === v_c ? sp.edgeEnds[2 * _y560 + 1] : sp.edgeEnds[2 * _y560])) === _eg455.of((sp.edgeEnds[2 * _e552] === v_c ? sp.edgeEnds[2 * _e552 + 1] : sp.edgeEnds[2 * _e552]))))) continue V556;
                  }
                  break;
                }
                if (_r557 === 0) {
                  _s551[_i554] = 0;
                  _i554--;
                  continue;
                }
                _s551[_i554] = _d553;
                if (_i554 === _a548.length - 1) break;
                _i554++;
                _s551[_i554] = 0;
              }
              if (_i554 < 0) break;
              let _g561 = 0;
              G562: {
                const _a563 = sp.cellEdges[v_c];
                for (let _i564 = 0; _i564 < _a563.length; _i564++) {
                  const v_x = _a563[_i564];
                  if (!((_f549[v_x] === 1))) continue;
                  _g561++;
                }
              }
              let _c569: boolean = (_g561 === arms(sp, cl, v_c));
              if (_c569) {
                let _q565 = true;
                Q566: {
                  const _a567 = sp.cellEdges[v_c];
                  for (let _i568 = 0; _i568 < _a567.length; _i568++) {
                    const v_x = _a567[_i568];
                    if (!(((_f549[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg455.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q565 = false;
                      break Q566;
                    }
                  }
                }
                _c569 = _q565;
              }
              if (!(_c569)) continue;
              if (!(true)) continue;
              _l544 = _a548;
              _y545 = true;
              for (const _e547 of _a548) _p543[_e547] |= 1 << _f549[_e547];
            }
          }
          if (!(((((_p543[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y545 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g513.push(v_e);
        }
      }
      L570: {
        const v_N = _g513;
        let _q571 = true;
        Q572: {
          const _a573 = v_F;
          for (let _i574 = 0; _i574 < _a573.length; _i574++) {
            const v_e = _a573[_i574];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q571 = false;
              break Q572;
            }
          }
        }
        if (!(_q571)) break L570;
        facts.length = 0;
        changed = false;
        let _q575 = true;
        Q576: {
          const _a577 = v_F;
          for (let _i578 = 0; _i578 < _a577.length; _i578++) {
            const v_e = _a577[_i578];
            let _c580: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c580) {
              let _c579: boolean = !(!(v_W.includes(v_e)));
              if (!_c579) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c579 = true;
              }
              _c580 = _c579;
            }
            let _c582: boolean = _c580;
            if (_c582) {
              let _c581: boolean = !(!(v_N.includes(v_e)));
              if (!_c581) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c581 = true;
              }
              _c582 = _c581;
            }
            if (!(_c582)) {
              _q575 = false;
              break Q576;
            }
          }
        }
        if (!(_q575)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface LoopNoteBinding {
  L: readonly number[];
  c: number;
  G: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const loopNoteFacts: number[] = [];
let loopNoteCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function loopNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LoopNoteBinding> | null): number {
  const _g642: number[] = [];
  const _p653 = new Int32Array(sp.edges.length);
  let _l654: readonly number[] = [];
  let _y655 = false;
  const _f659 = new Int32Array(sp.edges.length).fill(-1);
  let _l660: readonly number[] = [];
  const _s661: number[] = [];
  const _p680 = new Int32Array(sp.edges.length);
  let _l681: readonly number[] = [];
  let _y682 = false;
  const _f686 = new Int32Array(sp.edges.length).fill(-1);
  let _l687: readonly number[] = [];
  const _s688: number[] = [];
  const facts = loopNoteFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (loopNoteCands.length < sp.edges.length) loopNoteCands = new Int32Array(sp.edges.length);
  const cands = loopNoteCands;
  cands.fill(-1);
  _g642.length = 0;
  G643: {
    const _a646 = sp.edges;
    for (let _i647 = 0; _i647 < _a646.length; _i647++) {
      const v_e = _a646[_i647];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g642.push(v_e);
    }
  }
  const v_L = _g642;
  const _eg650 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a648 = sp.cells;
  for (let _i649 = 0; _i649 < _a648.length; _i649++) {
    const v_c = _a648[_i649];
    const v_G = _eg650.of(v_c);
    let _g656 = -1;
    let _g683 = -1;
    const _a651 = sp.cellEdges[v_c];
    for (let _i652 = 0; _i652 < _a651.length; _i652++) {
      const v_e = _a651[_i652];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g656 !== _epoch) {
        _g656 = _epoch;
        for (const _e657 of _l654) _p653[_e657] = 0;
        _y655 = false;
        const _a658 = sp.cellEdges[v_c];
        for (const _e662 of _l660) _f659[_e662] = -1;
        _l660 = _a658;
        let _i664 = 0;
        _s661[0] = 0;
        let _o668 = _a658.length === 0;
        for (;;) {
          if (_a658.length === 0) {
            if (!_o668) break;
            _o668 = false;
          }
          while (_a658.length > 0 && _i664 >= 0) {
            const _e662 = _a658[_i664];
            if (_s661[_i664] > 0) _f659[_e662] = -1;
            let _r667 = (cands[_e662] >= 0 ? cands[_e662] : (cands[_e662] = b.cands[_e662])) & ~((2 << _s661[_i664]) - 1);
            let _d663 = 0;
            V666: for (; _r667 !== 0; _r667 &= _r667 - 1) {
              _d663 = 31 - Math.clz32(_r667 & -_r667);
              _f659[_e662] = _d663;
              for (let _j665 = 0; _j665 < _i664; _j665++) {
                const _y669 = _a658[_j665];
                if (!((((arms(sp, cl, v_c) === 2) && (_f659[_e662] === 1)) && (_f659[_y669] === 1)))) continue;
                if (!((bent(sp, _e662, _y669) === (clueAt(cl.piece, v_c) === 3)))) continue V666;
              }
              for (let _j665 = 0; _j665 < _i664; _j665++) {
                const _y670 = _a658[_j665];
                if (!(((((_f659[_e662] === 1) && (_f659[_y670] === 1)) && !((b.grid[_e662] !== 0))) && !((b.grid[_y670] !== 0))))) continue;
                if (!(!(_eg650.of((sp.edgeEnds[2 * _y670] === v_c ? sp.edgeEnds[2 * _y670 + 1] : sp.edgeEnds[2 * _y670])) === _eg650.of((sp.edgeEnds[2 * _e662] === v_c ? sp.edgeEnds[2 * _e662 + 1] : sp.edgeEnds[2 * _e662]))))) continue V666;
              }
              break;
            }
            if (_r667 === 0) {
              _s661[_i664] = 0;
              _i664--;
              continue;
            }
            _s661[_i664] = _d663;
            if (_i664 === _a658.length - 1) break;
            _i664++;
            _s661[_i664] = 0;
          }
          if (_i664 < 0) break;
          let _g671 = 0;
          G672: {
            const _a673 = sp.cellEdges[v_c];
            for (let _i674 = 0; _i674 < _a673.length; _i674++) {
              const v_x = _a673[_i674];
              if (!((_f659[v_x] === 1))) continue;
              _g671++;
            }
          }
          let _c679: boolean = (_g671 === arms(sp, cl, v_c));
          if (_c679) {
            let _q675 = true;
            Q676: {
              const _a677 = sp.cellEdges[v_c];
              for (let _i678 = 0; _i678 < _a677.length; _i678++) {
                const v_x = _a677[_i678];
                if (!(((_f659[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg650.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q675 = false;
                  break Q676;
                }
              }
            }
            _c679 = _q675;
          }
          if (!(_c679)) continue;
          if (!(true)) continue;
          _l654 = _a658;
          _y655 = true;
          for (const _e657 of _a658) _p653[_e657] |= 1 << _f659[_e657];
        }
      }
      const v_A = ((((_p653[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y655 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g683 !== _epoch) {
        _g683 = _epoch;
        for (const _e684 of _l681) _p680[_e684] = 0;
        _y682 = false;
        const _a685 = sp.cellEdges[v_c];
        for (const _e689 of _l687) _f686[_e689] = -1;
        _l687 = _a685;
        let _i691 = 0;
        _s688[0] = 0;
        let _o695 = _a685.length === 0;
        for (;;) {
          if (_a685.length === 0) {
            if (!_o695) break;
            _o695 = false;
          }
          while (_a685.length > 0 && _i691 >= 0) {
            const _e689 = _a685[_i691];
            if (_s688[_i691] > 0) _f686[_e689] = -1;
            let _r694 = (cands[_e689] >= 0 ? cands[_e689] : (cands[_e689] = b.cands[_e689])) & ~((2 << _s688[_i691]) - 1);
            let _d690 = 0;
            V693: for (; _r694 !== 0; _r694 &= _r694 - 1) {
              _d690 = 31 - Math.clz32(_r694 & -_r694);
              _f686[_e689] = _d690;
              for (let _j692 = 0; _j692 < _i691; _j692++) {
                const _y696 = _a685[_j692];
                if (!((((arms(sp, cl, v_c) === 2) && (_f686[_e689] === 1)) && (_f686[_y696] === 1)))) continue;
                if (!((bent(sp, _e689, _y696) === (clueAt(cl.piece, v_c) === 3)))) continue V693;
              }
              for (let _j692 = 0; _j692 < _i691; _j692++) {
                const _y697 = _a685[_j692];
                if (!(((((_f686[_e689] === 1) && (_f686[_y697] === 1)) && !((b.grid[_e689] !== 0))) && !((b.grid[_y697] !== 0))))) continue;
                if (!(!(_eg650.of((sp.edgeEnds[2 * _y697] === v_c ? sp.edgeEnds[2 * _y697 + 1] : sp.edgeEnds[2 * _y697])) === _eg650.of((sp.edgeEnds[2 * _e689] === v_c ? sp.edgeEnds[2 * _e689 + 1] : sp.edgeEnds[2 * _e689]))))) continue V693;
              }
              break;
            }
            if (_r694 === 0) {
              _s688[_i691] = 0;
              _i691--;
              continue;
            }
            _s688[_i691] = _d690;
            if (_i691 === _a685.length - 1) break;
            _i691++;
            _s688[_i691] = 0;
          }
          if (_i691 < 0) break;
          let _g698 = 0;
          G699: {
            const _a700 = sp.cellEdges[v_c];
            for (let _i701 = 0; _i701 < _a700.length; _i701++) {
              const v_x = _a700[_i701];
              if (!((_f686[v_x] === 1))) continue;
              _g698++;
            }
          }
          let _c706: boolean = (_g698 === arms(sp, cl, v_c));
          if (_c706) {
            let _q702 = true;
            Q703: {
              const _a704 = sp.cellEdges[v_c];
              for (let _i705 = 0; _i705 < _a704.length; _i705++) {
                const v_x = _a704[_i705];
                if (!(((_f686[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg650.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q702 = false;
                  break Q703;
                }
              }
            }
            _c706 = _q702;
          }
          if (!(_c706)) continue;
          if (!(true)) continue;
          _l681 = _a685;
          _y682 = true;
          for (const _e684 of _a685) _p680[_e684] |= 1 << _f686[_e684];
        }
      }
      L707: {
        const v_B = ((((_p680[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y682 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L707;
        facts.length = 0;
        changed = false;
        let _c709: boolean = (v_A || v_B);
        if (_c709) {
          let _c708: boolean = !(!(v_A));
          if (!_c708) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c708 = true;
          }
          _c709 = _c708;
        }
        let _c711: boolean = _c709;
        if (_c711) {
          let _c710: boolean = !(!(v_B));
          if (!_c710) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c710 = true;
          }
          _c711 = _c710;
        }
        if (!(_c711)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), c: v_c, G: v_G.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface SealLockBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  K: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const sealLockFacts: number[] = [];
let sealLockCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function sealLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealLockBinding> | null): number {
  const _g1770: number[] = [];
  const _g1776: number[] = [];
  const _f1825 = new Int32Array(sp.edges.length).fill(-1);
  let _l1826: readonly number[] = [];
  const _s1827: number[] = [];
  const _f1844 = new Int32Array(sp.edges.length).fill(-1);
  let _l1845: readonly number[] = [];
  const _s1846: number[] = [];
  const _g1860: number[] = [];
  const _g1868: number[] = [];
  const _g1877: number[] = [];
  const _g1961: number[] = [];
  const _f2005 = new Int32Array(sp.edges.length).fill(-1);
  let _l2006: readonly number[] = [];
  const _s2007: number[] = [];
  const _g2024: number[] = [];
  const _g2039: number[] = [];
  const _p2239 = new Int32Array(sp.edges.length);
  let _l2240: readonly number[] = [];
  let _y2241 = false;
  const _f2245 = new Int32Array(sp.edges.length).fill(-1);
  let _l2246: readonly number[] = [];
  const _s2247: number[] = [];
  const _g2270: number[] = [];
  const _g2356: number[] = [];
  const _f2400 = new Int32Array(sp.edges.length).fill(-1);
  let _l2401: readonly number[] = [];
  const _s2402: number[] = [];
  const _g2419: number[] = [];
  const _g2437: number[] = [];
  const _p2637 = new Int32Array(sp.edges.length);
  let _l2638: readonly number[] = [];
  let _y2639 = false;
  const _f2643 = new Int32Array(sp.edges.length).fill(-1);
  let _l2644: readonly number[] = [];
  const _s2645: number[] = [];
  const _g2668: number[] = [];
  const _g2754: number[] = [];
  const _f2798 = new Int32Array(sp.edges.length).fill(-1);
  let _l2799: readonly number[] = [];
  const _s2800: number[] = [];
  const _g2817: number[] = [];
  const facts = sealLockFacts;
  let fired = 0;
  let changed = false;
  const _h2038 = sp.cells.length;
  let _epoch = 0;
  if (sealLockCands.length < sp.edges.length) sealLockCands = new Int32Array(sp.edges.length);
  const cands = sealLockCands;
  cands.fill(-1);
  _g1770.length = 0;
  G1771: {
    const _a1774 = sp.edges;
    for (let _i1775 = 0; _i1775 < _a1774.length; _i1775++) {
      const v_e = _a1774[_i1775];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1770.push(v_e);
    }
  }
  const v_L = _g1770;
  const _eg1876 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1776.length = 0;
  G1777: {
    const _a1819 = sp.edges;
    for (let _i1820 = 0; _i1820 < _a1819.length; _i1820++) {
      const v_e = _a1819[_i1820];
      const _t1821 = sp.edgeEnds[2 * v_e];
      let _q1822 = false;
      Q1823: {
        const _a1824 = sp.cellEdges[_t1821];
        for (const _e1828 of _l1826) _f1825[_e1828] = -1;
        _l1826 = _a1824;
        let _i1830 = 0;
        _s1827[0] = 0;
        let _o1834 = _a1824.length === 0;
        for (;;) {
          if (_a1824.length === 0) {
            if (!_o1834) break;
            _o1834 = false;
          }
          while (_a1824.length > 0 && _i1830 >= 0) {
            const _e1828 = _a1824[_i1830];
            if (_s1827[_i1830] > 0) _f1825[_e1828] = -1;
            let _r1833 = (cands[_e1828] >= 0 ? cands[_e1828] : (cands[_e1828] = b.cands[_e1828])) & ~((2 << _s1827[_i1830]) - 1);
            let _d1829 = 0;
            V1832: for (; _r1833 !== 0; _r1833 &= _r1833 - 1) {
              _d1829 = 31 - Math.clz32(_r1833 & -_r1833);
              _f1825[_e1828] = _d1829;
              if (_e1828 === v_e && _d1829 !== 1) continue;
              for (let _j1831 = 0; _j1831 < _i1830; _j1831++) {
                const _y1835 = _a1824[_j1831];
                if (!((((arms(sp, cl, _t1821) === 2) && (_f1825[_e1828] === 1)) && (_f1825[_y1835] === 1)))) continue;
                if (!((bent(sp, _e1828, _y1835) === (clueAt(cl.piece, _t1821) === 3)))) continue V1832;
              }
              break;
            }
            if (_r1833 === 0) {
              _s1827[_i1830] = 0;
              _i1830--;
              continue;
            }
            _s1827[_i1830] = _d1829;
            if (_i1830 === _a1824.length - 1) break;
            _i1830++;
            _s1827[_i1830] = 0;
          }
          if (_i1830 < 0) break;
          let _g1836 = 0;
          G1837: {
            const _a1838 = sp.cellEdges[_t1821];
            for (let _i1839 = 0; _i1839 < _a1838.length; _i1839++) {
              const v_x = _a1838[_i1839];
              if (!((_f1825[v_x] === 1))) continue;
              _g1836++;
            }
          }
          if (!((_g1836 === arms(sp, cl, _t1821)))) continue;
          if (true) {
            _q1822 = true;
            break Q1823;
          }
        }
      }
      let _c1859: boolean = _q1822;
      if (_c1859) {
        const _t1840 = sp.edgeEnds[2 * v_e + 1];
        let _q1841 = false;
        Q1842: {
          const _a1843 = sp.cellEdges[_t1840];
          for (const _e1847 of _l1845) _f1844[_e1847] = -1;
          _l1845 = _a1843;
          let _i1849 = 0;
          _s1846[0] = 0;
          let _o1853 = _a1843.length === 0;
          for (;;) {
            if (_a1843.length === 0) {
              if (!_o1853) break;
              _o1853 = false;
            }
            while (_a1843.length > 0 && _i1849 >= 0) {
              const _e1847 = _a1843[_i1849];
              if (_s1846[_i1849] > 0) _f1844[_e1847] = -1;
              let _r1852 = (cands[_e1847] >= 0 ? cands[_e1847] : (cands[_e1847] = b.cands[_e1847])) & ~((2 << _s1846[_i1849]) - 1);
              let _d1848 = 0;
              V1851: for (; _r1852 !== 0; _r1852 &= _r1852 - 1) {
                _d1848 = 31 - Math.clz32(_r1852 & -_r1852);
                _f1844[_e1847] = _d1848;
                if (_e1847 === v_e && _d1848 !== 1) continue;
                for (let _j1850 = 0; _j1850 < _i1849; _j1850++) {
                  const _y1854 = _a1843[_j1850];
                  if (!((((arms(sp, cl, _t1840) === 2) && (_f1844[_e1847] === 1)) && (_f1844[_y1854] === 1)))) continue;
                  if (!((bent(sp, _e1847, _y1854) === (clueAt(cl.piece, _t1840) === 3)))) continue V1851;
                }
                break;
              }
              if (_r1852 === 0) {
                _s1846[_i1849] = 0;
                _i1849--;
                continue;
              }
              _s1846[_i1849] = _d1848;
              if (_i1849 === _a1843.length - 1) break;
              _i1849++;
              _s1846[_i1849] = 0;
            }
            if (_i1849 < 0) break;
            let _g1855 = 0;
            G1856: {
              const _a1857 = sp.cellEdges[_t1840];
              for (let _i1858 = 0; _i1858 < _a1857.length; _i1858++) {
                const v_x = _a1857[_i1858];
                if (!((_f1844[v_x] === 1))) continue;
                _g1855++;
              }
            }
            if (!((_g1855 === arms(sp, cl, _t1840)))) continue;
            if (true) {
              _q1841 = true;
              break Q1842;
            }
          }
        }
        _c1859 = _q1841;
      }
      if (!(_c1859)) continue;
      _g1776.push(v_e);
    }
  }
  const v_U = _g1776;
  _g1860.length = 0;
  G1861: {
    const _a1864 = v_U;
    for (let _i1865 = 0; _i1865 < _a1864.length; _i1865++) {
      const v_e = _a1864[_i1865];
      if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
      _g1860.push(v_e);
    }
  }
  const v_P = _g1860;
  const _a1866 = sp.cells;
  for (let _i1867 = 0; _i1867 < _a1866.length; _i1867++) {
    const v_c = _a1866[_i1867];
    _g1868.length = 0;
    G1869: {
      const _a1872 = sp.cellEdges[v_c];
      for (let _i1873 = 0; _i1873 < _a1872.length; _i1873++) {
        const v_e = _a1872[_i1873];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1868.push(v_e);
      }
    }
    L1874: {
      const v_F = _g1868;
      const _h1875 = v_F.length;
      if (!((_h1875 > 0))) break L1874;
      const v_G = _eg1876.of(v_c);
      _g1877.length = 0;
      G1878: {
        const _a1958 = sp.cellEdges[v_c];
        for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
          const v_x = _a1958[_i1959];
          const _t1960 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          _g1961.length = 0;
          G1962: {
            const _a2000 = sp.cellEdges[_t1960];
            for (let _i2001 = 0; _i2001 < _a2000.length; _i2001++) {
              const v_y = _a2000[_i2001];
              let _c2020: boolean = (v_y !== v_x);
              if (_c2020) {
                let _q2002 = false;
                Q2003: {
                  const _a2004 = sp.cellEdges[_t1960];
                  for (const _e2008 of _l2006) _f2005[_e2008] = -1;
                  _l2006 = _a2004;
                  let _i2010 = 0;
                  _s2007[0] = 0;
                  let _o2014 = _a2004.length === 0;
                  for (;;) {
                    if (_a2004.length === 0) {
                      if (!_o2014) break;
                      _o2014 = false;
                    }
                    while (_a2004.length > 0 && _i2010 >= 0) {
                      const _e2008 = _a2004[_i2010];
                      if (_s2007[_i2010] > 0) _f2005[_e2008] = -1;
                      let _r2013 = (cands[_e2008] >= 0 ? cands[_e2008] : (cands[_e2008] = b.cands[_e2008])) & ~((2 << _s2007[_i2010]) - 1);
                      let _d2009 = 0;
                      V2012: for (; _r2013 !== 0; _r2013 &= _r2013 - 1) {
                        _d2009 = 31 - Math.clz32(_r2013 & -_r2013);
                        _f2005[_e2008] = _d2009;
                        if (_e2008 === v_x && _d2009 !== 1) continue;
                        if (_e2008 === v_y && _d2009 !== 1) continue;
                        for (let _j2011 = 0; _j2011 < _i2010; _j2011++) {
                          const _y2015 = _a2004[_j2011];
                          if (!((((arms(sp, cl, _t1960) === 2) && (_f2005[_e2008] === 1)) && (_f2005[_y2015] === 1)))) continue;
                          if (!((bent(sp, _e2008, _y2015) === (clueAt(cl.piece, _t1960) === 3)))) continue V2012;
                        }
                        break;
                      }
                      if (_r2013 === 0) {
                        _s2007[_i2010] = 0;
                        _i2010--;
                        continue;
                      }
                      _s2007[_i2010] = _d2009;
                      if (_i2010 === _a2004.length - 1) break;
                      _i2010++;
                      _s2007[_i2010] = 0;
                    }
                    if (_i2010 < 0) break;
                    let _g2016 = 0;
                    G2017: {
                      const _a2018 = sp.cellEdges[_t1960];
                      for (let _i2019 = 0; _i2019 < _a2018.length; _i2019++) {
                        const v_z = _a2018[_i2019];
                        if (!((_f2005[v_z] === 1))) continue;
                        _g2016++;
                      }
                    }
                    if (!((_g2016 === arms(sp, cl, _t1960)))) continue;
                    if (true) {
                      _q2002 = true;
                      break Q2003;
                    }
                  }
                }
                _c2020 = _q2002;
              }
              if (!(_c2020)) continue;
              const _t2021 = (sp.edgeEnds[2 * v_y] === _t1960 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t2022 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t1960]);
              const _eg2023 = edgeGroups(sp, _t2022);
              _g2024.length = 0;
              G2025: {
                const _a2031 = _eg2023.of(_t2021);
                for (let _i2032 = 0; _i2032 < _a2031.length; _i2032++) {
                  const v_t = _a2031[_i2032];
                  if (!((arms(sp, cl, v_t) > 1))) continue;
                  const _a2033 = sp.cellEdges[v_t];
                  for (let _i2034 = 0; _i2034 < _a2033.length; _i2034++) {
                    const v_y = _a2033[_i2034];
                    L2035: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2035;
                      if (!_g2024.includes(v_z)) _g2024.push(v_z);
                    }
                  }
                }
              }
              const _a2036 = union(_eg2023.of(_t2021), _g2024);
              for (let _i2037 = 0; _i2037 < _a2036.length; _i2037++) {
                const v_t = _a2036[_i2037];
                if (!_g1961.includes(v_t)) _g1961.push(v_t);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t1960), _g1961)).length >= _h2038))) continue;
          _g1877.push(v_x);
        }
      }
      const v_K = _g1877;
      let _g2242 = -1;
      let _g2640 = -1;
      _g2039.length = 0;
      G2040: {
        const _a2237 = v_F;
        for (let _i2238 = 0; _i2238 < _a2237.length; _i2238++) {
          const v_e = _a2237[_i2238];
          if (_g2242 !== _epoch) {
            _g2242 = _epoch;
            for (const _e2243 of _l2240) _p2239[_e2243] = 0;
            _y2241 = false;
            const _a2244 = sp.cellEdges[v_c];
            for (const _e2248 of _l2246) _f2245[_e2248] = -1;
            _l2246 = _a2244;
            let _i2250 = 0;
            _s2247[0] = 0;
            let _o2254 = _a2244.length === 0;
            for (;;) {
              if (_a2244.length === 0) {
                if (!_o2254) break;
                _o2254 = false;
              }
              while (_a2244.length > 0 && _i2250 >= 0) {
                const _e2248 = _a2244[_i2250];
                if (_s2247[_i2250] > 0) _f2245[_e2248] = -1;
                let _r2253 = (cands[_e2248] >= 0 ? cands[_e2248] : (cands[_e2248] = b.cands[_e2248])) & ~((2 << _s2247[_i2250]) - 1);
                let _d2249 = 0;
                V2252: for (; _r2253 !== 0; _r2253 &= _r2253 - 1) {
                  _d2249 = 31 - Math.clz32(_r2253 & -_r2253);
                  _f2245[_e2248] = _d2249;
                  for (let _j2251 = 0; _j2251 < _i2250; _j2251++) {
                    const _y2255 = _a2244[_j2251];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f2245[_e2248] === 1)) && (_f2245[_y2255] === 1)))) continue;
                    if (!((bent(sp, _e2248, _y2255) === (clueAt(cl.piece, v_c) === 3)))) continue V2252;
                  }
                  for (let _j2251 = 0; _j2251 < _i2250; _j2251++) {
                    const _y2256 = _a2244[_j2251];
                    if (!(((((_f2245[_e2248] === 1) && (_f2245[_y2256] === 1)) && !((b.grid[_e2248] !== 0))) && !((b.grid[_y2256] !== 0))))) continue;
                    if (!(!(_eg1876.of((sp.edgeEnds[2 * _y2256] === v_c ? sp.edgeEnds[2 * _y2256 + 1] : sp.edgeEnds[2 * _y2256])) === _eg1876.of((sp.edgeEnds[2 * _e2248] === v_c ? sp.edgeEnds[2 * _e2248 + 1] : sp.edgeEnds[2 * _e2248]))))) continue V2252;
                  }
                  break;
                }
                if (_r2253 === 0) {
                  _s2247[_i2250] = 0;
                  _i2250--;
                  continue;
                }
                _s2247[_i2250] = _d2249;
                if (_i2250 === _a2244.length - 1) break;
                _i2250++;
                _s2247[_i2250] = 0;
              }
              if (_i2250 < 0) break;
              let _g2257 = 0;
              G2258: {
                const _a2259 = sp.cellEdges[v_c];
                for (let _i2260 = 0; _i2260 < _a2259.length; _i2260++) {
                  const v_x = _a2259[_i2260];
                  if (!((_f2245[v_x] === 1))) continue;
                  _g2257++;
                }
              }
              let _c2265: boolean = (_g2257 === arms(sp, cl, v_c));
              if (_c2265) {
                let _q2261 = true;
                Q2262: {
                  const _a2263 = sp.cellEdges[v_c];
                  for (let _i2264 = 0; _i2264 < _a2263.length; _i2264++) {
                    const v_x = _a2263[_i2264];
                    if (!(((_f2245[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1876.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2261 = false;
                      break Q2262;
                    }
                  }
                }
                _c2265 = _q2261;
              }
              let _c2436: boolean = _c2265;
              if (_c2436) {
                let _q2266 = false;
                Q2267: {
                  const _a2268 = sp.cellEdges[v_c];
                  for (let _i2269 = 0; _i2269 < _a2268.length; _i2269++) {
                    const v_x = _a2268[_i2269];
                    if (!((_f2245[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2266 = true;
                      break Q2267;
                    }
                  }
                }
                let _c2435: boolean = _q2266;
                if (!_c2435) {
                  _g2270.length = 0;
                  G2271: {
                    const _a2353 = sp.cellEdges[v_c];
                    for (let _i2354 = 0; _i2354 < _a2353.length; _i2354++) {
                      const v_x = _a2353[_i2354];
                      if (!((_f2245[v_x] === 1))) continue;
                      const _t2355 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      _g2356.length = 0;
                      G2357: {
                        const _a2395 = sp.cellEdges[_t2355];
                        for (let _i2396 = 0; _i2396 < _a2395.length; _i2396++) {
                          const v_y = _a2395[_i2396];
                          let _c2415: boolean = (v_y !== v_x);
                          if (_c2415) {
                            let _q2397 = false;
                            Q2398: {
                              const _a2399 = sp.cellEdges[_t2355];
                              for (const _e2403 of _l2401) _f2400[_e2403] = -1;
                              _l2401 = _a2399;
                              let _i2405 = 0;
                              _s2402[0] = 0;
                              let _o2409 = _a2399.length === 0;
                              for (;;) {
                                if (_a2399.length === 0) {
                                  if (!_o2409) break;
                                  _o2409 = false;
                                }
                                while (_a2399.length > 0 && _i2405 >= 0) {
                                  const _e2403 = _a2399[_i2405];
                                  if (_s2402[_i2405] > 0) _f2400[_e2403] = -1;
                                  let _r2408 = (cands[_e2403] >= 0 ? cands[_e2403] : (cands[_e2403] = b.cands[_e2403])) & ~((2 << _s2402[_i2405]) - 1);
                                  let _d2404 = 0;
                                  V2407: for (; _r2408 !== 0; _r2408 &= _r2408 - 1) {
                                    _d2404 = 31 - Math.clz32(_r2408 & -_r2408);
                                    _f2400[_e2403] = _d2404;
                                    if (_e2403 === v_x && _d2404 !== 1) continue;
                                    if (_e2403 === v_y && _d2404 !== 1) continue;
                                    for (let _j2406 = 0; _j2406 < _i2405; _j2406++) {
                                      const _y2410 = _a2399[_j2406];
                                      if (!((((arms(sp, cl, _t2355) === 2) && (_f2400[_e2403] === 1)) && (_f2400[_y2410] === 1)))) continue;
                                      if (!((bent(sp, _e2403, _y2410) === (clueAt(cl.piece, _t2355) === 3)))) continue V2407;
                                    }
                                    break;
                                  }
                                  if (_r2408 === 0) {
                                    _s2402[_i2405] = 0;
                                    _i2405--;
                                    continue;
                                  }
                                  _s2402[_i2405] = _d2404;
                                  if (_i2405 === _a2399.length - 1) break;
                                  _i2405++;
                                  _s2402[_i2405] = 0;
                                }
                                if (_i2405 < 0) break;
                                let _g2411 = 0;
                                G2412: {
                                  const _a2413 = sp.cellEdges[_t2355];
                                  for (let _i2414 = 0; _i2414 < _a2413.length; _i2414++) {
                                    const v_z = _a2413[_i2414];
                                    if (!((_f2400[v_z] === 1))) continue;
                                    _g2411++;
                                  }
                                }
                                if (!((_g2411 === arms(sp, cl, _t2355)))) continue;
                                if (true) {
                                  _q2397 = true;
                                  break Q2398;
                                }
                              }
                            }
                            _c2415 = _q2397;
                          }
                          if (!(_c2415)) continue;
                          const _t2416 = (sp.edgeEnds[2 * v_y] === _t2355 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2417 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2355]);
                          const _eg2418 = edgeGroups(sp, _t2417);
                          _g2419.length = 0;
                          G2420: {
                            const _a2426 = _eg2418.of(_t2416);
                            for (let _i2427 = 0; _i2427 < _a2426.length; _i2427++) {
                              const v_t = _a2426[_i2427];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a2428 = sp.cellEdges[v_t];
                              for (let _i2429 = 0; _i2429 < _a2428.length; _i2429++) {
                                const v_y = _a2428[_i2429];
                                L2430: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2430;
                                  if (!_g2419.includes(v_z)) _g2419.push(v_z);
                                }
                              }
                            }
                          }
                          const _a2431 = union(_eg2418.of(_t2416), _g2419);
                          for (let _i2432 = 0; _i2432 < _a2431.length; _i2432++) {
                            const v_t = _a2431[_i2432];
                            if (!_g2356.includes(v_t)) _g2356.push(v_t);
                          }
                        }
                      }
                      const _a2433 = union(setOf(_t2355), _g2356);
                      for (let _i2434 = 0; _i2434 < _a2433.length; _i2434++) {
                        const v_t = _a2433[_i2434];
                        if (!_g2270.includes(v_t)) _g2270.push(v_t);
                      }
                    }
                  }
                  _c2435 = (union(setOf(v_c), _g2270).length >= _h2038);
                }
                _c2436 = _c2435;
              }
              if (!(_c2436)) continue;
              if (!(true)) continue;
              _l2240 = _a2244;
              _y2241 = true;
              for (const _e2243 of _a2244) _p2239[_e2243] |= 1 << _f2245[_e2243];
            }
          }
          if (!(((((_p2239[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y2241 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2039.push(v_e);
        }
      }
      const v_W = _g2039;
      _g2437.length = 0;
      G2438: {
        const _a2635 = v_F;
        for (let _i2636 = 0; _i2636 < _a2635.length; _i2636++) {
          const v_e = _a2635[_i2636];
          if (_g2640 !== _epoch) {
            _g2640 = _epoch;
            for (const _e2641 of _l2638) _p2637[_e2641] = 0;
            _y2639 = false;
            const _a2642 = sp.cellEdges[v_c];
            for (const _e2646 of _l2644) _f2643[_e2646] = -1;
            _l2644 = _a2642;
            let _i2648 = 0;
            _s2645[0] = 0;
            let _o2652 = _a2642.length === 0;
            for (;;) {
              if (_a2642.length === 0) {
                if (!_o2652) break;
                _o2652 = false;
              }
              while (_a2642.length > 0 && _i2648 >= 0) {
                const _e2646 = _a2642[_i2648];
                if (_s2645[_i2648] > 0) _f2643[_e2646] = -1;
                let _r2651 = (cands[_e2646] >= 0 ? cands[_e2646] : (cands[_e2646] = b.cands[_e2646])) & ~((2 << _s2645[_i2648]) - 1);
                let _d2647 = 0;
                V2650: for (; _r2651 !== 0; _r2651 &= _r2651 - 1) {
                  _d2647 = 31 - Math.clz32(_r2651 & -_r2651);
                  _f2643[_e2646] = _d2647;
                  for (let _j2649 = 0; _j2649 < _i2648; _j2649++) {
                    const _y2653 = _a2642[_j2649];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f2643[_e2646] === 1)) && (_f2643[_y2653] === 1)))) continue;
                    if (!((bent(sp, _e2646, _y2653) === (clueAt(cl.piece, v_c) === 3)))) continue V2650;
                  }
                  for (let _j2649 = 0; _j2649 < _i2648; _j2649++) {
                    const _y2654 = _a2642[_j2649];
                    if (!(((((_f2643[_e2646] === 1) && (_f2643[_y2654] === 1)) && !((b.grid[_e2646] !== 0))) && !((b.grid[_y2654] !== 0))))) continue;
                    if (!(!(_eg1876.of((sp.edgeEnds[2 * _y2654] === v_c ? sp.edgeEnds[2 * _y2654 + 1] : sp.edgeEnds[2 * _y2654])) === _eg1876.of((sp.edgeEnds[2 * _e2646] === v_c ? sp.edgeEnds[2 * _e2646 + 1] : sp.edgeEnds[2 * _e2646]))))) continue V2650;
                  }
                  break;
                }
                if (_r2651 === 0) {
                  _s2645[_i2648] = 0;
                  _i2648--;
                  continue;
                }
                _s2645[_i2648] = _d2647;
                if (_i2648 === _a2642.length - 1) break;
                _i2648++;
                _s2645[_i2648] = 0;
              }
              if (_i2648 < 0) break;
              let _g2655 = 0;
              G2656: {
                const _a2657 = sp.cellEdges[v_c];
                for (let _i2658 = 0; _i2658 < _a2657.length; _i2658++) {
                  const v_x = _a2657[_i2658];
                  if (!((_f2643[v_x] === 1))) continue;
                  _g2655++;
                }
              }
              let _c2663: boolean = (_g2655 === arms(sp, cl, v_c));
              if (_c2663) {
                let _q2659 = true;
                Q2660: {
                  const _a2661 = sp.cellEdges[v_c];
                  for (let _i2662 = 0; _i2662 < _a2661.length; _i2662++) {
                    const v_x = _a2661[_i2662];
                    if (!(((_f2643[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg1876.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q2659 = false;
                      break Q2660;
                    }
                  }
                }
                _c2663 = _q2659;
              }
              let _c2834: boolean = _c2663;
              if (_c2834) {
                let _q2664 = false;
                Q2665: {
                  const _a2666 = sp.cellEdges[v_c];
                  for (let _i2667 = 0; _i2667 < _a2666.length; _i2667++) {
                    const v_x = _a2666[_i2667];
                    if (!((_f2643[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q2664 = true;
                      break Q2665;
                    }
                  }
                }
                let _c2833: boolean = _q2664;
                if (!_c2833) {
                  _g2668.length = 0;
                  G2669: {
                    const _a2751 = sp.cellEdges[v_c];
                    for (let _i2752 = 0; _i2752 < _a2751.length; _i2752++) {
                      const v_x = _a2751[_i2752];
                      if (!((_f2643[v_x] === 1))) continue;
                      const _t2753 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      _g2754.length = 0;
                      G2755: {
                        const _a2793 = sp.cellEdges[_t2753];
                        for (let _i2794 = 0; _i2794 < _a2793.length; _i2794++) {
                          const v_y = _a2793[_i2794];
                          let _c2813: boolean = (v_y !== v_x);
                          if (_c2813) {
                            let _q2795 = false;
                            Q2796: {
                              const _a2797 = sp.cellEdges[_t2753];
                              for (const _e2801 of _l2799) _f2798[_e2801] = -1;
                              _l2799 = _a2797;
                              let _i2803 = 0;
                              _s2800[0] = 0;
                              let _o2807 = _a2797.length === 0;
                              for (;;) {
                                if (_a2797.length === 0) {
                                  if (!_o2807) break;
                                  _o2807 = false;
                                }
                                while (_a2797.length > 0 && _i2803 >= 0) {
                                  const _e2801 = _a2797[_i2803];
                                  if (_s2800[_i2803] > 0) _f2798[_e2801] = -1;
                                  let _r2806 = (cands[_e2801] >= 0 ? cands[_e2801] : (cands[_e2801] = b.cands[_e2801])) & ~((2 << _s2800[_i2803]) - 1);
                                  let _d2802 = 0;
                                  V2805: for (; _r2806 !== 0; _r2806 &= _r2806 - 1) {
                                    _d2802 = 31 - Math.clz32(_r2806 & -_r2806);
                                    _f2798[_e2801] = _d2802;
                                    if (_e2801 === v_x && _d2802 !== 1) continue;
                                    if (_e2801 === v_y && _d2802 !== 1) continue;
                                    for (let _j2804 = 0; _j2804 < _i2803; _j2804++) {
                                      const _y2808 = _a2797[_j2804];
                                      if (!((((arms(sp, cl, _t2753) === 2) && (_f2798[_e2801] === 1)) && (_f2798[_y2808] === 1)))) continue;
                                      if (!((bent(sp, _e2801, _y2808) === (clueAt(cl.piece, _t2753) === 3)))) continue V2805;
                                    }
                                    break;
                                  }
                                  if (_r2806 === 0) {
                                    _s2800[_i2803] = 0;
                                    _i2803--;
                                    continue;
                                  }
                                  _s2800[_i2803] = _d2802;
                                  if (_i2803 === _a2797.length - 1) break;
                                  _i2803++;
                                  _s2800[_i2803] = 0;
                                }
                                if (_i2803 < 0) break;
                                let _g2809 = 0;
                                G2810: {
                                  const _a2811 = sp.cellEdges[_t2753];
                                  for (let _i2812 = 0; _i2812 < _a2811.length; _i2812++) {
                                    const v_z = _a2811[_i2812];
                                    if (!((_f2798[v_z] === 1))) continue;
                                    _g2809++;
                                  }
                                }
                                if (!((_g2809 === arms(sp, cl, _t2753)))) continue;
                                if (true) {
                                  _q2795 = true;
                                  break Q2796;
                                }
                              }
                            }
                            _c2813 = _q2795;
                          }
                          if (!(_c2813)) continue;
                          const _t2814 = (sp.edgeEnds[2 * v_y] === _t2753 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t2815 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t2753]);
                          const _eg2816 = edgeGroups(sp, _t2815);
                          _g2817.length = 0;
                          G2818: {
                            const _a2824 = _eg2816.of(_t2814);
                            for (let _i2825 = 0; _i2825 < _a2824.length; _i2825++) {
                              const v_t = _a2824[_i2825];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a2826 = sp.cellEdges[v_t];
                              for (let _i2827 = 0; _i2827 < _a2826.length; _i2827++) {
                                const v_y = _a2826[_i2827];
                                L2828: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L2828;
                                  if (!_g2817.includes(v_z)) _g2817.push(v_z);
                                }
                              }
                            }
                          }
                          const _a2829 = union(_eg2816.of(_t2814), _g2817);
                          for (let _i2830 = 0; _i2830 < _a2829.length; _i2830++) {
                            const v_t = _a2829[_i2830];
                            if (!_g2754.includes(v_t)) _g2754.push(v_t);
                          }
                        }
                      }
                      const _a2831 = union(setOf(_t2753), _g2754);
                      for (let _i2832 = 0; _i2832 < _a2831.length; _i2832++) {
                        const v_t = _a2831[_i2832];
                        if (!_g2668.includes(v_t)) _g2668.push(v_t);
                      }
                    }
                  }
                  _c2833 = (union(setOf(v_c), _g2668).length >= _h2038);
                }
                _c2834 = _c2833;
              }
              if (!(_c2834)) continue;
              if (!(true)) continue;
              _l2638 = _a2642;
              _y2639 = true;
              for (const _e2641 of _a2642) _p2637[_e2641] |= 1 << _f2643[_e2641];
            }
          }
          if (!(((((_p2637[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y2639 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g2437.push(v_e);
        }
      }
      L2835: {
        const v_N = _g2437;
        let _q2836 = true;
        Q2837: {
          const _a2838 = v_F;
          for (let _i2839 = 0; _i2839 < _a2838.length; _i2839++) {
            const v_e = _a2838[_i2839];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q2836 = false;
              break Q2837;
            }
          }
        }
        if (!(_q2836)) break L2835;
        facts.length = 0;
        changed = false;
        let _q2840 = true;
        Q2841: {
          const _a2842 = v_F;
          for (let _i2843 = 0; _i2843 < _a2842.length; _i2843++) {
            const v_e = _a2842[_i2843];
            let _c2845: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c2845) {
              let _c2844: boolean = !(!(v_W.includes(v_e)));
              if (!_c2844) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c2844 = true;
              }
              _c2845 = _c2844;
            }
            let _c2847: boolean = _c2845;
            if (_c2847) {
              let _c2846: boolean = !(!(v_N.includes(v_e)));
              if (!_c2846) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c2846 = true;
              }
              _c2847 = _c2846;
            }
            if (!(_c2847)) {
              _q2840 = false;
              break Q2841;
            }
          }
        }
        if (!(_q2840)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), K: v_K.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface SealNoteBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  G: readonly number[];
  K: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const sealNoteFacts: number[] = [];
let sealNoteCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function sealNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SealNoteBinding> | null): number {
  const _g3497: number[] = [];
  const _g3503: number[] = [];
  const _f3552 = new Int32Array(sp.edges.length).fill(-1);
  let _l3553: readonly number[] = [];
  const _s3554: number[] = [];
  const _f3571 = new Int32Array(sp.edges.length).fill(-1);
  let _l3572: readonly number[] = [];
  const _s3573: number[] = [];
  const _g3587: number[] = [];
  const _g3596: number[] = [];
  const _g3680: number[] = [];
  const _f3724 = new Int32Array(sp.edges.length).fill(-1);
  let _l3725: readonly number[] = [];
  const _s3726: number[] = [];
  const _g3743: number[] = [];
  const _p3760 = new Int32Array(sp.edges.length);
  let _l3761: readonly number[] = [];
  let _y3762 = false;
  const _f3766 = new Int32Array(sp.edges.length).fill(-1);
  let _l3767: readonly number[] = [];
  const _s3768: number[] = [];
  const _g3791: number[] = [];
  const _g3877: number[] = [];
  const _f3921 = new Int32Array(sp.edges.length).fill(-1);
  let _l3922: readonly number[] = [];
  const _s3923: number[] = [];
  const _g3940: number[] = [];
  const _p3958 = new Int32Array(sp.edges.length);
  let _l3959: readonly number[] = [];
  let _y3960 = false;
  const _f3964 = new Int32Array(sp.edges.length).fill(-1);
  let _l3965: readonly number[] = [];
  const _s3966: number[] = [];
  const _g3989: number[] = [];
  const _g4075: number[] = [];
  const _f4119 = new Int32Array(sp.edges.length).fill(-1);
  let _l4120: readonly number[] = [];
  const _s4121: number[] = [];
  const _g4138: number[] = [];
  const facts = sealNoteFacts;
  let fired = 0;
  let changed = false;
  const _h3757 = sp.cells.length;
  let _epoch = 0;
  if (sealNoteCands.length < sp.edges.length) sealNoteCands = new Int32Array(sp.edges.length);
  const cands = sealNoteCands;
  cands.fill(-1);
  _g3497.length = 0;
  G3498: {
    const _a3501 = sp.edges;
    for (let _i3502 = 0; _i3502 < _a3501.length; _i3502++) {
      const v_e = _a3501[_i3502];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g3497.push(v_e);
    }
  }
  const v_L = _g3497;
  const _eg3595 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g3503.length = 0;
  G3504: {
    const _a3546 = sp.edges;
    for (let _i3547 = 0; _i3547 < _a3546.length; _i3547++) {
      const v_e = _a3546[_i3547];
      const _t3548 = sp.edgeEnds[2 * v_e];
      let _q3549 = false;
      Q3550: {
        const _a3551 = sp.cellEdges[_t3548];
        for (const _e3555 of _l3553) _f3552[_e3555] = -1;
        _l3553 = _a3551;
        let _i3557 = 0;
        _s3554[0] = 0;
        let _o3561 = _a3551.length === 0;
        for (;;) {
          if (_a3551.length === 0) {
            if (!_o3561) break;
            _o3561 = false;
          }
          while (_a3551.length > 0 && _i3557 >= 0) {
            const _e3555 = _a3551[_i3557];
            if (_s3554[_i3557] > 0) _f3552[_e3555] = -1;
            let _r3560 = (cands[_e3555] >= 0 ? cands[_e3555] : (cands[_e3555] = b.cands[_e3555])) & ~((2 << _s3554[_i3557]) - 1);
            let _d3556 = 0;
            V3559: for (; _r3560 !== 0; _r3560 &= _r3560 - 1) {
              _d3556 = 31 - Math.clz32(_r3560 & -_r3560);
              _f3552[_e3555] = _d3556;
              if (_e3555 === v_e && _d3556 !== 1) continue;
              for (let _j3558 = 0; _j3558 < _i3557; _j3558++) {
                const _y3562 = _a3551[_j3558];
                if (!((((arms(sp, cl, _t3548) === 2) && (_f3552[_e3555] === 1)) && (_f3552[_y3562] === 1)))) continue;
                if (!((bent(sp, _e3555, _y3562) === (clueAt(cl.piece, _t3548) === 3)))) continue V3559;
              }
              break;
            }
            if (_r3560 === 0) {
              _s3554[_i3557] = 0;
              _i3557--;
              continue;
            }
            _s3554[_i3557] = _d3556;
            if (_i3557 === _a3551.length - 1) break;
            _i3557++;
            _s3554[_i3557] = 0;
          }
          if (_i3557 < 0) break;
          let _g3563 = 0;
          G3564: {
            const _a3565 = sp.cellEdges[_t3548];
            for (let _i3566 = 0; _i3566 < _a3565.length; _i3566++) {
              const v_x = _a3565[_i3566];
              if (!((_f3552[v_x] === 1))) continue;
              _g3563++;
            }
          }
          if (!((_g3563 === arms(sp, cl, _t3548)))) continue;
          if (true) {
            _q3549 = true;
            break Q3550;
          }
        }
      }
      let _c3586: boolean = _q3549;
      if (_c3586) {
        const _t3567 = sp.edgeEnds[2 * v_e + 1];
        let _q3568 = false;
        Q3569: {
          const _a3570 = sp.cellEdges[_t3567];
          for (const _e3574 of _l3572) _f3571[_e3574] = -1;
          _l3572 = _a3570;
          let _i3576 = 0;
          _s3573[0] = 0;
          let _o3580 = _a3570.length === 0;
          for (;;) {
            if (_a3570.length === 0) {
              if (!_o3580) break;
              _o3580 = false;
            }
            while (_a3570.length > 0 && _i3576 >= 0) {
              const _e3574 = _a3570[_i3576];
              if (_s3573[_i3576] > 0) _f3571[_e3574] = -1;
              let _r3579 = (cands[_e3574] >= 0 ? cands[_e3574] : (cands[_e3574] = b.cands[_e3574])) & ~((2 << _s3573[_i3576]) - 1);
              let _d3575 = 0;
              V3578: for (; _r3579 !== 0; _r3579 &= _r3579 - 1) {
                _d3575 = 31 - Math.clz32(_r3579 & -_r3579);
                _f3571[_e3574] = _d3575;
                if (_e3574 === v_e && _d3575 !== 1) continue;
                for (let _j3577 = 0; _j3577 < _i3576; _j3577++) {
                  const _y3581 = _a3570[_j3577];
                  if (!((((arms(sp, cl, _t3567) === 2) && (_f3571[_e3574] === 1)) && (_f3571[_y3581] === 1)))) continue;
                  if (!((bent(sp, _e3574, _y3581) === (clueAt(cl.piece, _t3567) === 3)))) continue V3578;
                }
                break;
              }
              if (_r3579 === 0) {
                _s3573[_i3576] = 0;
                _i3576--;
                continue;
              }
              _s3573[_i3576] = _d3575;
              if (_i3576 === _a3570.length - 1) break;
              _i3576++;
              _s3573[_i3576] = 0;
            }
            if (_i3576 < 0) break;
            let _g3582 = 0;
            G3583: {
              const _a3584 = sp.cellEdges[_t3567];
              for (let _i3585 = 0; _i3585 < _a3584.length; _i3585++) {
                const v_x = _a3584[_i3585];
                if (!((_f3571[v_x] === 1))) continue;
                _g3582++;
              }
            }
            if (!((_g3582 === arms(sp, cl, _t3567)))) continue;
            if (true) {
              _q3568 = true;
              break Q3569;
            }
          }
        }
        _c3586 = _q3568;
      }
      if (!(_c3586)) continue;
      _g3503.push(v_e);
    }
  }
  const v_U = _g3503;
  _g3587.length = 0;
  G3588: {
    const _a3591 = v_U;
    for (let _i3592 = 0; _i3592 < _a3591.length; _i3592++) {
      const v_e = _a3591[_i3592];
      if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
      _g3587.push(v_e);
    }
  }
  const v_P = _g3587;
  const _a3593 = sp.cells;
  for (let _i3594 = 0; _i3594 < _a3593.length; _i3594++) {
    const v_c = _a3593[_i3594];
    const v_G = _eg3595.of(v_c);
    _g3596.length = 0;
    G3597: {
      const _a3677 = sp.cellEdges[v_c];
      for (let _i3678 = 0; _i3678 < _a3677.length; _i3678++) {
        const v_x = _a3677[_i3678];
        const _t3679 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        _g3680.length = 0;
        G3681: {
          const _a3719 = sp.cellEdges[_t3679];
          for (let _i3720 = 0; _i3720 < _a3719.length; _i3720++) {
            const v_y = _a3719[_i3720];
            let _c3739: boolean = (v_y !== v_x);
            if (_c3739) {
              let _q3721 = false;
              Q3722: {
                const _a3723 = sp.cellEdges[_t3679];
                for (const _e3727 of _l3725) _f3724[_e3727] = -1;
                _l3725 = _a3723;
                let _i3729 = 0;
                _s3726[0] = 0;
                let _o3733 = _a3723.length === 0;
                for (;;) {
                  if (_a3723.length === 0) {
                    if (!_o3733) break;
                    _o3733 = false;
                  }
                  while (_a3723.length > 0 && _i3729 >= 0) {
                    const _e3727 = _a3723[_i3729];
                    if (_s3726[_i3729] > 0) _f3724[_e3727] = -1;
                    let _r3732 = (cands[_e3727] >= 0 ? cands[_e3727] : (cands[_e3727] = b.cands[_e3727])) & ~((2 << _s3726[_i3729]) - 1);
                    let _d3728 = 0;
                    V3731: for (; _r3732 !== 0; _r3732 &= _r3732 - 1) {
                      _d3728 = 31 - Math.clz32(_r3732 & -_r3732);
                      _f3724[_e3727] = _d3728;
                      if (_e3727 === v_x && _d3728 !== 1) continue;
                      if (_e3727 === v_y && _d3728 !== 1) continue;
                      for (let _j3730 = 0; _j3730 < _i3729; _j3730++) {
                        const _y3734 = _a3723[_j3730];
                        if (!((((arms(sp, cl, _t3679) === 2) && (_f3724[_e3727] === 1)) && (_f3724[_y3734] === 1)))) continue;
                        if (!((bent(sp, _e3727, _y3734) === (clueAt(cl.piece, _t3679) === 3)))) continue V3731;
                      }
                      break;
                    }
                    if (_r3732 === 0) {
                      _s3726[_i3729] = 0;
                      _i3729--;
                      continue;
                    }
                    _s3726[_i3729] = _d3728;
                    if (_i3729 === _a3723.length - 1) break;
                    _i3729++;
                    _s3726[_i3729] = 0;
                  }
                  if (_i3729 < 0) break;
                  let _g3735 = 0;
                  G3736: {
                    const _a3737 = sp.cellEdges[_t3679];
                    for (let _i3738 = 0; _i3738 < _a3737.length; _i3738++) {
                      const v_z = _a3737[_i3738];
                      if (!((_f3724[v_z] === 1))) continue;
                      _g3735++;
                    }
                  }
                  if (!((_g3735 === arms(sp, cl, _t3679)))) continue;
                  if (true) {
                    _q3721 = true;
                    break Q3722;
                  }
                }
              }
              _c3739 = _q3721;
            }
            if (!(_c3739)) continue;
            const _t3740 = (sp.edgeEnds[2 * v_y] === _t3679 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t3741 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3679]);
            const _eg3742 = edgeGroups(sp, _t3741);
            _g3743.length = 0;
            G3744: {
              const _a3750 = _eg3742.of(_t3740);
              for (let _i3751 = 0; _i3751 < _a3750.length; _i3751++) {
                const v_t = _a3750[_i3751];
                if (!((arms(sp, cl, v_t) > 1))) continue;
                const _a3752 = sp.cellEdges[v_t];
                for (let _i3753 = 0; _i3753 < _a3752.length; _i3753++) {
                  const v_y = _a3752[_i3753];
                  L3754: {
                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                    if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3754;
                    if (!_g3743.includes(v_z)) _g3743.push(v_z);
                  }
                }
              }
            }
            const _a3755 = union(_eg3742.of(_t3740), _g3743);
            for (let _i3756 = 0; _i3756 < _a3755.length; _i3756++) {
              const v_t = _a3755[_i3756];
              if (!_g3680.includes(v_t)) _g3680.push(v_t);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t3679), _g3680)).length >= _h3757))) continue;
        _g3596.push(v_x);
      }
    }
    const v_K = _g3596;
    let _g3763 = -1;
    let _g3961 = -1;
    const _a3758 = sp.cellEdges[v_c];
    for (let _i3759 = 0; _i3759 < _a3758.length; _i3759++) {
      const v_e = _a3758[_i3759];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g3763 !== _epoch) {
        _g3763 = _epoch;
        for (const _e3764 of _l3761) _p3760[_e3764] = 0;
        _y3762 = false;
        const _a3765 = sp.cellEdges[v_c];
        for (const _e3769 of _l3767) _f3766[_e3769] = -1;
        _l3767 = _a3765;
        let _i3771 = 0;
        _s3768[0] = 0;
        let _o3775 = _a3765.length === 0;
        for (;;) {
          if (_a3765.length === 0) {
            if (!_o3775) break;
            _o3775 = false;
          }
          while (_a3765.length > 0 && _i3771 >= 0) {
            const _e3769 = _a3765[_i3771];
            if (_s3768[_i3771] > 0) _f3766[_e3769] = -1;
            let _r3774 = (cands[_e3769] >= 0 ? cands[_e3769] : (cands[_e3769] = b.cands[_e3769])) & ~((2 << _s3768[_i3771]) - 1);
            let _d3770 = 0;
            V3773: for (; _r3774 !== 0; _r3774 &= _r3774 - 1) {
              _d3770 = 31 - Math.clz32(_r3774 & -_r3774);
              _f3766[_e3769] = _d3770;
              for (let _j3772 = 0; _j3772 < _i3771; _j3772++) {
                const _y3776 = _a3765[_j3772];
                if (!((((arms(sp, cl, v_c) === 2) && (_f3766[_e3769] === 1)) && (_f3766[_y3776] === 1)))) continue;
                if (!((bent(sp, _e3769, _y3776) === (clueAt(cl.piece, v_c) === 3)))) continue V3773;
              }
              for (let _j3772 = 0; _j3772 < _i3771; _j3772++) {
                const _y3777 = _a3765[_j3772];
                if (!(((((_f3766[_e3769] === 1) && (_f3766[_y3777] === 1)) && !((b.grid[_e3769] !== 0))) && !((b.grid[_y3777] !== 0))))) continue;
                if (!(!(_eg3595.of((sp.edgeEnds[2 * _y3777] === v_c ? sp.edgeEnds[2 * _y3777 + 1] : sp.edgeEnds[2 * _y3777])) === _eg3595.of((sp.edgeEnds[2 * _e3769] === v_c ? sp.edgeEnds[2 * _e3769 + 1] : sp.edgeEnds[2 * _e3769]))))) continue V3773;
              }
              break;
            }
            if (_r3774 === 0) {
              _s3768[_i3771] = 0;
              _i3771--;
              continue;
            }
            _s3768[_i3771] = _d3770;
            if (_i3771 === _a3765.length - 1) break;
            _i3771++;
            _s3768[_i3771] = 0;
          }
          if (_i3771 < 0) break;
          let _g3778 = 0;
          G3779: {
            const _a3780 = sp.cellEdges[v_c];
            for (let _i3781 = 0; _i3781 < _a3780.length; _i3781++) {
              const v_x = _a3780[_i3781];
              if (!((_f3766[v_x] === 1))) continue;
              _g3778++;
            }
          }
          let _c3786: boolean = (_g3778 === arms(sp, cl, v_c));
          if (_c3786) {
            let _q3782 = true;
            Q3783: {
              const _a3784 = sp.cellEdges[v_c];
              for (let _i3785 = 0; _i3785 < _a3784.length; _i3785++) {
                const v_x = _a3784[_i3785];
                if (!(((_f3766[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3595.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q3782 = false;
                  break Q3783;
                }
              }
            }
            _c3786 = _q3782;
          }
          let _c3957: boolean = _c3786;
          if (_c3957) {
            let _q3787 = false;
            Q3788: {
              const _a3789 = sp.cellEdges[v_c];
              for (let _i3790 = 0; _i3790 < _a3789.length; _i3790++) {
                const v_x = _a3789[_i3790];
                if (!((_f3766[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q3787 = true;
                  break Q3788;
                }
              }
            }
            let _c3956: boolean = _q3787;
            if (!_c3956) {
              _g3791.length = 0;
              G3792: {
                const _a3874 = sp.cellEdges[v_c];
                for (let _i3875 = 0; _i3875 < _a3874.length; _i3875++) {
                  const v_x = _a3874[_i3875];
                  if (!((_f3766[v_x] === 1))) continue;
                  const _t3876 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  _g3877.length = 0;
                  G3878: {
                    const _a3916 = sp.cellEdges[_t3876];
                    for (let _i3917 = 0; _i3917 < _a3916.length; _i3917++) {
                      const v_y = _a3916[_i3917];
                      let _c3936: boolean = (v_y !== v_x);
                      if (_c3936) {
                        let _q3918 = false;
                        Q3919: {
                          const _a3920 = sp.cellEdges[_t3876];
                          for (const _e3924 of _l3922) _f3921[_e3924] = -1;
                          _l3922 = _a3920;
                          let _i3926 = 0;
                          _s3923[0] = 0;
                          let _o3930 = _a3920.length === 0;
                          for (;;) {
                            if (_a3920.length === 0) {
                              if (!_o3930) break;
                              _o3930 = false;
                            }
                            while (_a3920.length > 0 && _i3926 >= 0) {
                              const _e3924 = _a3920[_i3926];
                              if (_s3923[_i3926] > 0) _f3921[_e3924] = -1;
                              let _r3929 = (cands[_e3924] >= 0 ? cands[_e3924] : (cands[_e3924] = b.cands[_e3924])) & ~((2 << _s3923[_i3926]) - 1);
                              let _d3925 = 0;
                              V3928: for (; _r3929 !== 0; _r3929 &= _r3929 - 1) {
                                _d3925 = 31 - Math.clz32(_r3929 & -_r3929);
                                _f3921[_e3924] = _d3925;
                                if (_e3924 === v_x && _d3925 !== 1) continue;
                                if (_e3924 === v_y && _d3925 !== 1) continue;
                                for (let _j3927 = 0; _j3927 < _i3926; _j3927++) {
                                  const _y3931 = _a3920[_j3927];
                                  if (!((((arms(sp, cl, _t3876) === 2) && (_f3921[_e3924] === 1)) && (_f3921[_y3931] === 1)))) continue;
                                  if (!((bent(sp, _e3924, _y3931) === (clueAt(cl.piece, _t3876) === 3)))) continue V3928;
                                }
                                break;
                              }
                              if (_r3929 === 0) {
                                _s3923[_i3926] = 0;
                                _i3926--;
                                continue;
                              }
                              _s3923[_i3926] = _d3925;
                              if (_i3926 === _a3920.length - 1) break;
                              _i3926++;
                              _s3923[_i3926] = 0;
                            }
                            if (_i3926 < 0) break;
                            let _g3932 = 0;
                            G3933: {
                              const _a3934 = sp.cellEdges[_t3876];
                              for (let _i3935 = 0; _i3935 < _a3934.length; _i3935++) {
                                const v_z = _a3934[_i3935];
                                if (!((_f3921[v_z] === 1))) continue;
                                _g3932++;
                              }
                            }
                            if (!((_g3932 === arms(sp, cl, _t3876)))) continue;
                            if (true) {
                              _q3918 = true;
                              break Q3919;
                            }
                          }
                        }
                        _c3936 = _q3918;
                      }
                      if (!(_c3936)) continue;
                      const _t3937 = (sp.edgeEnds[2 * v_y] === _t3876 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t3938 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t3876]);
                      const _eg3939 = edgeGroups(sp, _t3938);
                      _g3940.length = 0;
                      G3941: {
                        const _a3947 = _eg3939.of(_t3937);
                        for (let _i3948 = 0; _i3948 < _a3947.length; _i3948++) {
                          const v_t = _a3947[_i3948];
                          if (!((arms(sp, cl, v_t) > 1))) continue;
                          const _a3949 = sp.cellEdges[v_t];
                          for (let _i3950 = 0; _i3950 < _a3949.length; _i3950++) {
                            const v_y = _a3949[_i3950];
                            L3951: {
                              const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L3951;
                              if (!_g3940.includes(v_z)) _g3940.push(v_z);
                            }
                          }
                        }
                      }
                      const _a3952 = union(_eg3939.of(_t3937), _g3940);
                      for (let _i3953 = 0; _i3953 < _a3952.length; _i3953++) {
                        const v_t = _a3952[_i3953];
                        if (!_g3877.includes(v_t)) _g3877.push(v_t);
                      }
                    }
                  }
                  const _a3954 = union(setOf(_t3876), _g3877);
                  for (let _i3955 = 0; _i3955 < _a3954.length; _i3955++) {
                    const v_t = _a3954[_i3955];
                    if (!_g3791.includes(v_t)) _g3791.push(v_t);
                  }
                }
              }
              _c3956 = (union(setOf(v_c), _g3791).length >= _h3757);
            }
            _c3957 = _c3956;
          }
          if (!(_c3957)) continue;
          if (!(true)) continue;
          _l3761 = _a3765;
          _y3762 = true;
          for (const _e3764 of _a3765) _p3760[_e3764] |= 1 << _f3766[_e3764];
        }
      }
      const v_A = ((((_p3760[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y3762 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g3961 !== _epoch) {
        _g3961 = _epoch;
        for (const _e3962 of _l3959) _p3958[_e3962] = 0;
        _y3960 = false;
        const _a3963 = sp.cellEdges[v_c];
        for (const _e3967 of _l3965) _f3964[_e3967] = -1;
        _l3965 = _a3963;
        let _i3969 = 0;
        _s3966[0] = 0;
        let _o3973 = _a3963.length === 0;
        for (;;) {
          if (_a3963.length === 0) {
            if (!_o3973) break;
            _o3973 = false;
          }
          while (_a3963.length > 0 && _i3969 >= 0) {
            const _e3967 = _a3963[_i3969];
            if (_s3966[_i3969] > 0) _f3964[_e3967] = -1;
            let _r3972 = (cands[_e3967] >= 0 ? cands[_e3967] : (cands[_e3967] = b.cands[_e3967])) & ~((2 << _s3966[_i3969]) - 1);
            let _d3968 = 0;
            V3971: for (; _r3972 !== 0; _r3972 &= _r3972 - 1) {
              _d3968 = 31 - Math.clz32(_r3972 & -_r3972);
              _f3964[_e3967] = _d3968;
              for (let _j3970 = 0; _j3970 < _i3969; _j3970++) {
                const _y3974 = _a3963[_j3970];
                if (!((((arms(sp, cl, v_c) === 2) && (_f3964[_e3967] === 1)) && (_f3964[_y3974] === 1)))) continue;
                if (!((bent(sp, _e3967, _y3974) === (clueAt(cl.piece, v_c) === 3)))) continue V3971;
              }
              for (let _j3970 = 0; _j3970 < _i3969; _j3970++) {
                const _y3975 = _a3963[_j3970];
                if (!(((((_f3964[_e3967] === 1) && (_f3964[_y3975] === 1)) && !((b.grid[_e3967] !== 0))) && !((b.grid[_y3975] !== 0))))) continue;
                if (!(!(_eg3595.of((sp.edgeEnds[2 * _y3975] === v_c ? sp.edgeEnds[2 * _y3975 + 1] : sp.edgeEnds[2 * _y3975])) === _eg3595.of((sp.edgeEnds[2 * _e3967] === v_c ? sp.edgeEnds[2 * _e3967 + 1] : sp.edgeEnds[2 * _e3967]))))) continue V3971;
              }
              break;
            }
            if (_r3972 === 0) {
              _s3966[_i3969] = 0;
              _i3969--;
              continue;
            }
            _s3966[_i3969] = _d3968;
            if (_i3969 === _a3963.length - 1) break;
            _i3969++;
            _s3966[_i3969] = 0;
          }
          if (_i3969 < 0) break;
          let _g3976 = 0;
          G3977: {
            const _a3978 = sp.cellEdges[v_c];
            for (let _i3979 = 0; _i3979 < _a3978.length; _i3979++) {
              const v_x = _a3978[_i3979];
              if (!((_f3964[v_x] === 1))) continue;
              _g3976++;
            }
          }
          let _c3984: boolean = (_g3976 === arms(sp, cl, v_c));
          if (_c3984) {
            let _q3980 = true;
            Q3981: {
              const _a3982 = sp.cellEdges[v_c];
              for (let _i3983 = 0; _i3983 < _a3982.length; _i3983++) {
                const v_x = _a3982[_i3983];
                if (!(((_f3964[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg3595.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q3980 = false;
                  break Q3981;
                }
              }
            }
            _c3984 = _q3980;
          }
          let _c4155: boolean = _c3984;
          if (_c4155) {
            let _q3985 = false;
            Q3986: {
              const _a3987 = sp.cellEdges[v_c];
              for (let _i3988 = 0; _i3988 < _a3987.length; _i3988++) {
                const v_x = _a3987[_i3988];
                if (!((_f3964[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q3985 = true;
                  break Q3986;
                }
              }
            }
            let _c4154: boolean = _q3985;
            if (!_c4154) {
              _g3989.length = 0;
              G3990: {
                const _a4072 = sp.cellEdges[v_c];
                for (let _i4073 = 0; _i4073 < _a4072.length; _i4073++) {
                  const v_x = _a4072[_i4073];
                  if (!((_f3964[v_x] === 1))) continue;
                  const _t4074 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  _g4075.length = 0;
                  G4076: {
                    const _a4114 = sp.cellEdges[_t4074];
                    for (let _i4115 = 0; _i4115 < _a4114.length; _i4115++) {
                      const v_y = _a4114[_i4115];
                      let _c4134: boolean = (v_y !== v_x);
                      if (_c4134) {
                        let _q4116 = false;
                        Q4117: {
                          const _a4118 = sp.cellEdges[_t4074];
                          for (const _e4122 of _l4120) _f4119[_e4122] = -1;
                          _l4120 = _a4118;
                          let _i4124 = 0;
                          _s4121[0] = 0;
                          let _o4128 = _a4118.length === 0;
                          for (;;) {
                            if (_a4118.length === 0) {
                              if (!_o4128) break;
                              _o4128 = false;
                            }
                            while (_a4118.length > 0 && _i4124 >= 0) {
                              const _e4122 = _a4118[_i4124];
                              if (_s4121[_i4124] > 0) _f4119[_e4122] = -1;
                              let _r4127 = (cands[_e4122] >= 0 ? cands[_e4122] : (cands[_e4122] = b.cands[_e4122])) & ~((2 << _s4121[_i4124]) - 1);
                              let _d4123 = 0;
                              V4126: for (; _r4127 !== 0; _r4127 &= _r4127 - 1) {
                                _d4123 = 31 - Math.clz32(_r4127 & -_r4127);
                                _f4119[_e4122] = _d4123;
                                if (_e4122 === v_x && _d4123 !== 1) continue;
                                if (_e4122 === v_y && _d4123 !== 1) continue;
                                for (let _j4125 = 0; _j4125 < _i4124; _j4125++) {
                                  const _y4129 = _a4118[_j4125];
                                  if (!((((arms(sp, cl, _t4074) === 2) && (_f4119[_e4122] === 1)) && (_f4119[_y4129] === 1)))) continue;
                                  if (!((bent(sp, _e4122, _y4129) === (clueAt(cl.piece, _t4074) === 3)))) continue V4126;
                                }
                                break;
                              }
                              if (_r4127 === 0) {
                                _s4121[_i4124] = 0;
                                _i4124--;
                                continue;
                              }
                              _s4121[_i4124] = _d4123;
                              if (_i4124 === _a4118.length - 1) break;
                              _i4124++;
                              _s4121[_i4124] = 0;
                            }
                            if (_i4124 < 0) break;
                            let _g4130 = 0;
                            G4131: {
                              const _a4132 = sp.cellEdges[_t4074];
                              for (let _i4133 = 0; _i4133 < _a4132.length; _i4133++) {
                                const v_z = _a4132[_i4133];
                                if (!((_f4119[v_z] === 1))) continue;
                                _g4130++;
                              }
                            }
                            if (!((_g4130 === arms(sp, cl, _t4074)))) continue;
                            if (true) {
                              _q4116 = true;
                              break Q4117;
                            }
                          }
                        }
                        _c4134 = _q4116;
                      }
                      if (!(_c4134)) continue;
                      const _t4135 = (sp.edgeEnds[2 * v_y] === _t4074 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t4136 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t4074]);
                      const _eg4137 = edgeGroups(sp, _t4136);
                      _g4138.length = 0;
                      G4139: {
                        const _a4145 = _eg4137.of(_t4135);
                        for (let _i4146 = 0; _i4146 < _a4145.length; _i4146++) {
                          const v_t = _a4145[_i4146];
                          if (!((arms(sp, cl, v_t) > 1))) continue;
                          const _a4147 = sp.cellEdges[v_t];
                          for (let _i4148 = 0; _i4148 < _a4147.length; _i4148++) {
                            const v_y = _a4147[_i4148];
                            L4149: {
                              const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L4149;
                              if (!_g4138.includes(v_z)) _g4138.push(v_z);
                            }
                          }
                        }
                      }
                      const _a4150 = union(_eg4137.of(_t4135), _g4138);
                      for (let _i4151 = 0; _i4151 < _a4150.length; _i4151++) {
                        const v_t = _a4150[_i4151];
                        if (!_g4075.includes(v_t)) _g4075.push(v_t);
                      }
                    }
                  }
                  const _a4152 = union(setOf(_t4074), _g4075);
                  for (let _i4153 = 0; _i4153 < _a4152.length; _i4153++) {
                    const v_t = _a4152[_i4153];
                    if (!_g3989.includes(v_t)) _g3989.push(v_t);
                  }
                }
              }
              _c4154 = (union(setOf(v_c), _g3989).length >= _h3757);
            }
            _c4155 = _c4154;
          }
          if (!(_c4155)) continue;
          if (!(true)) continue;
          _l3959 = _a3963;
          _y3960 = true;
          for (const _e3962 of _a3963) _p3958[_e3962] |= 1 << _f3964[_e3962];
        }
      }
      L4156: {
        const v_B = ((((_p3958[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y3960 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L4156;
        facts.length = 0;
        changed = false;
        let _c4158: boolean = (v_A || v_B);
        if (_c4158) {
          let _c4157: boolean = !(!(v_A));
          if (!_c4157) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c4157 = true;
          }
          _c4158 = _c4157;
        }
        let _c4160: boolean = _c4158;
        if (_c4160) {
          let _c4159: boolean = !(!(v_B));
          if (!_c4159) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c4159 = true;
          }
          _c4160 = _c4159;
        }
        if (!(_c4160)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, G: v_G.slice(), K: v_K.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface StrandLockBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  F: readonly number[];
  G: readonly number[];
  K: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const strandLockFacts: number[] = [];
let strandLockCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function strandLock(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandLockBinding> | null): number {
  const _g5403: number[] = [];
  const _g5409: number[] = [];
  const _f5458 = new Int32Array(sp.edges.length).fill(-1);
  let _l5459: readonly number[] = [];
  const _s5460: number[] = [];
  const _f5477 = new Int32Array(sp.edges.length).fill(-1);
  let _l5478: readonly number[] = [];
  const _s5479: number[] = [];
  const _g5493: number[] = [];
  const _g5501: number[] = [];
  const _g5510: number[] = [];
  const _g5594: number[] = [];
  const _f5638 = new Int32Array(sp.edges.length).fill(-1);
  let _l5639: readonly number[] = [];
  const _s5640: number[] = [];
  const _g5657: number[] = [];
  const _g5672: number[] = [];
  const _p5918 = new Int32Array(sp.edges.length);
  let _l5919: readonly number[] = [];
  let _y5920 = false;
  const _f5924 = new Int32Array(sp.edges.length).fill(-1);
  let _l5925: readonly number[] = [];
  const _s5926: number[] = [];
  const _g5949: number[] = [];
  const _g6035: number[] = [];
  const _f6079 = new Int32Array(sp.edges.length).fill(-1);
  let _l6080: readonly number[] = [];
  const _s6081: number[] = [];
  const _g6098: number[] = [];
  const _g6118: number[] = [];
  const _f6135 = new Int32Array(sp.edges.length).fill(-1);
  let _l6136: readonly number[] = [];
  const _s6137: number[] = [];
  const _g6163: number[] = [];
  const _p6409 = new Int32Array(sp.edges.length);
  let _l6410: readonly number[] = [];
  let _y6411 = false;
  const _f6415 = new Int32Array(sp.edges.length).fill(-1);
  let _l6416: readonly number[] = [];
  const _s6417: number[] = [];
  const _g6440: number[] = [];
  const _g6526: number[] = [];
  const _f6570 = new Int32Array(sp.edges.length).fill(-1);
  let _l6571: readonly number[] = [];
  const _s6572: number[] = [];
  const _g6589: number[] = [];
  const _g6609: number[] = [];
  const _f6626 = new Int32Array(sp.edges.length).fill(-1);
  let _l6627: readonly number[] = [];
  const _s6628: number[] = [];
  const facts = strandLockFacts;
  let fired = 0;
  let changed = false;
  const _h5671 = sp.cells.length;
  let _epoch = 0;
  if (strandLockCands.length < sp.edges.length) strandLockCands = new Int32Array(sp.edges.length);
  const cands = strandLockCands;
  cands.fill(-1);
  _g5403.length = 0;
  G5404: {
    const _a5407 = sp.edges;
    for (let _i5408 = 0; _i5408 < _a5407.length; _i5408++) {
      const v_e = _a5407[_i5408];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g5403.push(v_e);
    }
  }
  const v_L = _g5403;
  const _eg5509 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g5409.length = 0;
  G5410: {
    const _a5452 = sp.edges;
    for (let _i5453 = 0; _i5453 < _a5452.length; _i5453++) {
      const v_e = _a5452[_i5453];
      const _t5454 = sp.edgeEnds[2 * v_e];
      let _q5455 = false;
      Q5456: {
        const _a5457 = sp.cellEdges[_t5454];
        for (const _e5461 of _l5459) _f5458[_e5461] = -1;
        _l5459 = _a5457;
        let _i5463 = 0;
        _s5460[0] = 0;
        let _o5467 = _a5457.length === 0;
        for (;;) {
          if (_a5457.length === 0) {
            if (!_o5467) break;
            _o5467 = false;
          }
          while (_a5457.length > 0 && _i5463 >= 0) {
            const _e5461 = _a5457[_i5463];
            if (_s5460[_i5463] > 0) _f5458[_e5461] = -1;
            let _r5466 = (cands[_e5461] >= 0 ? cands[_e5461] : (cands[_e5461] = b.cands[_e5461])) & ~((2 << _s5460[_i5463]) - 1);
            let _d5462 = 0;
            V5465: for (; _r5466 !== 0; _r5466 &= _r5466 - 1) {
              _d5462 = 31 - Math.clz32(_r5466 & -_r5466);
              _f5458[_e5461] = _d5462;
              if (_e5461 === v_e && _d5462 !== 1) continue;
              for (let _j5464 = 0; _j5464 < _i5463; _j5464++) {
                const _y5468 = _a5457[_j5464];
                if (!((((arms(sp, cl, _t5454) === 2) && (_f5458[_e5461] === 1)) && (_f5458[_y5468] === 1)))) continue;
                if (!((bent(sp, _e5461, _y5468) === (clueAt(cl.piece, _t5454) === 3)))) continue V5465;
              }
              break;
            }
            if (_r5466 === 0) {
              _s5460[_i5463] = 0;
              _i5463--;
              continue;
            }
            _s5460[_i5463] = _d5462;
            if (_i5463 === _a5457.length - 1) break;
            _i5463++;
            _s5460[_i5463] = 0;
          }
          if (_i5463 < 0) break;
          let _g5469 = 0;
          G5470: {
            const _a5471 = sp.cellEdges[_t5454];
            for (let _i5472 = 0; _i5472 < _a5471.length; _i5472++) {
              const v_x = _a5471[_i5472];
              if (!((_f5458[v_x] === 1))) continue;
              _g5469++;
            }
          }
          if (!((_g5469 === arms(sp, cl, _t5454)))) continue;
          if (true) {
            _q5455 = true;
            break Q5456;
          }
        }
      }
      let _c5492: boolean = _q5455;
      if (_c5492) {
        const _t5473 = sp.edgeEnds[2 * v_e + 1];
        let _q5474 = false;
        Q5475: {
          const _a5476 = sp.cellEdges[_t5473];
          for (const _e5480 of _l5478) _f5477[_e5480] = -1;
          _l5478 = _a5476;
          let _i5482 = 0;
          _s5479[0] = 0;
          let _o5486 = _a5476.length === 0;
          for (;;) {
            if (_a5476.length === 0) {
              if (!_o5486) break;
              _o5486 = false;
            }
            while (_a5476.length > 0 && _i5482 >= 0) {
              const _e5480 = _a5476[_i5482];
              if (_s5479[_i5482] > 0) _f5477[_e5480] = -1;
              let _r5485 = (cands[_e5480] >= 0 ? cands[_e5480] : (cands[_e5480] = b.cands[_e5480])) & ~((2 << _s5479[_i5482]) - 1);
              let _d5481 = 0;
              V5484: for (; _r5485 !== 0; _r5485 &= _r5485 - 1) {
                _d5481 = 31 - Math.clz32(_r5485 & -_r5485);
                _f5477[_e5480] = _d5481;
                if (_e5480 === v_e && _d5481 !== 1) continue;
                for (let _j5483 = 0; _j5483 < _i5482; _j5483++) {
                  const _y5487 = _a5476[_j5483];
                  if (!((((arms(sp, cl, _t5473) === 2) && (_f5477[_e5480] === 1)) && (_f5477[_y5487] === 1)))) continue;
                  if (!((bent(sp, _e5480, _y5487) === (clueAt(cl.piece, _t5473) === 3)))) continue V5484;
                }
                break;
              }
              if (_r5485 === 0) {
                _s5479[_i5482] = 0;
                _i5482--;
                continue;
              }
              _s5479[_i5482] = _d5481;
              if (_i5482 === _a5476.length - 1) break;
              _i5482++;
              _s5479[_i5482] = 0;
            }
            if (_i5482 < 0) break;
            let _g5488 = 0;
            G5489: {
              const _a5490 = sp.cellEdges[_t5473];
              for (let _i5491 = 0; _i5491 < _a5490.length; _i5491++) {
                const v_x = _a5490[_i5491];
                if (!((_f5477[v_x] === 1))) continue;
                _g5488++;
              }
            }
            if (!((_g5488 === arms(sp, cl, _t5473)))) continue;
            if (true) {
              _q5474 = true;
              break Q5475;
            }
          }
        }
        _c5492 = _q5474;
      }
      if (!(_c5492)) continue;
      _g5409.push(v_e);
    }
  }
  const v_U = _g5409;
  _g5493.length = 0;
  G5494: {
    const _a5497 = v_U;
    for (let _i5498 = 0; _i5498 < _a5497.length; _i5498++) {
      const v_e = _a5497[_i5498];
      if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
      _g5493.push(v_e);
    }
  }
  const v_P = _g5493;
  const _a5499 = sp.cells;
  for (let _i5500 = 0; _i5500 < _a5499.length; _i5500++) {
    const v_c = _a5499[_i5500];
    _g5501.length = 0;
    G5502: {
      const _a5505 = sp.cellEdges[v_c];
      for (let _i5506 = 0; _i5506 < _a5505.length; _i5506++) {
        const v_e = _a5505[_i5506];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g5501.push(v_e);
      }
    }
    L5507: {
      const v_F = _g5501;
      const _h5508 = v_F.length;
      if (!((_h5508 > 0))) break L5507;
      const v_G = _eg5509.of(v_c);
      _g5510.length = 0;
      G5511: {
        const _a5591 = sp.cellEdges[v_c];
        for (let _i5592 = 0; _i5592 < _a5591.length; _i5592++) {
          const v_x = _a5591[_i5592];
          const _t5593 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
          _g5594.length = 0;
          G5595: {
            const _a5633 = sp.cellEdges[_t5593];
            for (let _i5634 = 0; _i5634 < _a5633.length; _i5634++) {
              const v_y = _a5633[_i5634];
              let _c5653: boolean = (v_y !== v_x);
              if (_c5653) {
                let _q5635 = false;
                Q5636: {
                  const _a5637 = sp.cellEdges[_t5593];
                  for (const _e5641 of _l5639) _f5638[_e5641] = -1;
                  _l5639 = _a5637;
                  let _i5643 = 0;
                  _s5640[0] = 0;
                  let _o5647 = _a5637.length === 0;
                  for (;;) {
                    if (_a5637.length === 0) {
                      if (!_o5647) break;
                      _o5647 = false;
                    }
                    while (_a5637.length > 0 && _i5643 >= 0) {
                      const _e5641 = _a5637[_i5643];
                      if (_s5640[_i5643] > 0) _f5638[_e5641] = -1;
                      let _r5646 = (cands[_e5641] >= 0 ? cands[_e5641] : (cands[_e5641] = b.cands[_e5641])) & ~((2 << _s5640[_i5643]) - 1);
                      let _d5642 = 0;
                      V5645: for (; _r5646 !== 0; _r5646 &= _r5646 - 1) {
                        _d5642 = 31 - Math.clz32(_r5646 & -_r5646);
                        _f5638[_e5641] = _d5642;
                        if (_e5641 === v_x && _d5642 !== 1) continue;
                        if (_e5641 === v_y && _d5642 !== 1) continue;
                        for (let _j5644 = 0; _j5644 < _i5643; _j5644++) {
                          const _y5648 = _a5637[_j5644];
                          if (!((((arms(sp, cl, _t5593) === 2) && (_f5638[_e5641] === 1)) && (_f5638[_y5648] === 1)))) continue;
                          if (!((bent(sp, _e5641, _y5648) === (clueAt(cl.piece, _t5593) === 3)))) continue V5645;
                        }
                        break;
                      }
                      if (_r5646 === 0) {
                        _s5640[_i5643] = 0;
                        _i5643--;
                        continue;
                      }
                      _s5640[_i5643] = _d5642;
                      if (_i5643 === _a5637.length - 1) break;
                      _i5643++;
                      _s5640[_i5643] = 0;
                    }
                    if (_i5643 < 0) break;
                    let _g5649 = 0;
                    G5650: {
                      const _a5651 = sp.cellEdges[_t5593];
                      for (let _i5652 = 0; _i5652 < _a5651.length; _i5652++) {
                        const v_z = _a5651[_i5652];
                        if (!((_f5638[v_z] === 1))) continue;
                        _g5649++;
                      }
                    }
                    if (!((_g5649 === arms(sp, cl, _t5593)))) continue;
                    if (true) {
                      _q5635 = true;
                      break Q5636;
                    }
                  }
                }
                _c5653 = _q5635;
              }
              if (!(_c5653)) continue;
              const _t5654 = (sp.edgeEnds[2 * v_y] === _t5593 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
              const _t5655 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t5593]);
              const _eg5656 = edgeGroups(sp, _t5655);
              _g5657.length = 0;
              G5658: {
                const _a5664 = _eg5656.of(_t5654);
                for (let _i5665 = 0; _i5665 < _a5664.length; _i5665++) {
                  const v_t = _a5664[_i5665];
                  if (!((arms(sp, cl, v_t) > 1))) continue;
                  const _a5666 = sp.cellEdges[v_t];
                  for (let _i5667 = 0; _i5667 < _a5666.length; _i5667++) {
                    const v_y = _a5666[_i5667];
                    L5668: {
                      const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L5668;
                      if (!_g5657.includes(v_z)) _g5657.push(v_z);
                    }
                  }
                }
              }
              const _a5669 = union(_eg5656.of(_t5654), _g5657);
              for (let _i5670 = 0; _i5670 < _a5669.length; _i5670++) {
                const v_t = _a5669[_i5670];
                if (!_g5594.includes(v_t)) _g5594.push(v_t);
              }
            }
          }
          if (!((union(setOf(v_c), union(setOf(_t5593), _g5594)).length >= _h5671))) continue;
          _g5510.push(v_x);
        }
      }
      const v_K = _g5510;
      let _g5921 = -1;
      let _g6412 = -1;
      _g5672.length = 0;
      G5673: {
        const _a5916 = v_F;
        for (let _i5917 = 0; _i5917 < _a5916.length; _i5917++) {
          const v_e = _a5916[_i5917];
          if (_g5921 !== _epoch) {
            _g5921 = _epoch;
            for (const _e5922 of _l5919) _p5918[_e5922] = 0;
            _y5920 = false;
            const _a5923 = sp.cellEdges[v_c];
            for (const _e5927 of _l5925) _f5924[_e5927] = -1;
            _l5925 = _a5923;
            let _i5929 = 0;
            _s5926[0] = 0;
            let _o5933 = _a5923.length === 0;
            for (;;) {
              if (_a5923.length === 0) {
                if (!_o5933) break;
                _o5933 = false;
              }
              while (_a5923.length > 0 && _i5929 >= 0) {
                const _e5927 = _a5923[_i5929];
                if (_s5926[_i5929] > 0) _f5924[_e5927] = -1;
                let _r5932 = (cands[_e5927] >= 0 ? cands[_e5927] : (cands[_e5927] = b.cands[_e5927])) & ~((2 << _s5926[_i5929]) - 1);
                let _d5928 = 0;
                V5931: for (; _r5932 !== 0; _r5932 &= _r5932 - 1) {
                  _d5928 = 31 - Math.clz32(_r5932 & -_r5932);
                  _f5924[_e5927] = _d5928;
                  for (let _j5930 = 0; _j5930 < _i5929; _j5930++) {
                    const _y5934 = _a5923[_j5930];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f5924[_e5927] === 1)) && (_f5924[_y5934] === 1)))) continue;
                    if (!((bent(sp, _e5927, _y5934) === (clueAt(cl.piece, v_c) === 3)))) continue V5931;
                  }
                  for (let _j5930 = 0; _j5930 < _i5929; _j5930++) {
                    const _y5935 = _a5923[_j5930];
                    if (!(((((_f5924[_e5927] === 1) && (_f5924[_y5935] === 1)) && !((b.grid[_e5927] !== 0))) && !((b.grid[_y5935] !== 0))))) continue;
                    if (!(!(_eg5509.of((sp.edgeEnds[2 * _y5935] === v_c ? sp.edgeEnds[2 * _y5935 + 1] : sp.edgeEnds[2 * _y5935])) === _eg5509.of((sp.edgeEnds[2 * _e5927] === v_c ? sp.edgeEnds[2 * _e5927 + 1] : sp.edgeEnds[2 * _e5927]))))) continue V5931;
                  }
                  break;
                }
                if (_r5932 === 0) {
                  _s5926[_i5929] = 0;
                  _i5929--;
                  continue;
                }
                _s5926[_i5929] = _d5928;
                if (_i5929 === _a5923.length - 1) break;
                _i5929++;
                _s5926[_i5929] = 0;
              }
              if (_i5929 < 0) break;
              let _g5936 = 0;
              G5937: {
                const _a5938 = sp.cellEdges[v_c];
                for (let _i5939 = 0; _i5939 < _a5938.length; _i5939++) {
                  const v_x = _a5938[_i5939];
                  if (!((_f5924[v_x] === 1))) continue;
                  _g5936++;
                }
              }
              let _c5944: boolean = (_g5936 === arms(sp, cl, v_c));
              if (_c5944) {
                let _q5940 = true;
                Q5941: {
                  const _a5942 = sp.cellEdges[v_c];
                  for (let _i5943 = 0; _i5943 < _a5942.length; _i5943++) {
                    const v_x = _a5942[_i5943];
                    if (!(((_f5924[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5509.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q5940 = false;
                      break Q5941;
                    }
                  }
                }
                _c5944 = _q5940;
              }
              let _c6115: boolean = _c5944;
              if (_c6115) {
                let _q5945 = false;
                Q5946: {
                  const _a5947 = sp.cellEdges[v_c];
                  for (let _i5948 = 0; _i5948 < _a5947.length; _i5948++) {
                    const v_x = _a5947[_i5948];
                    if (!((_f5924[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q5945 = true;
                      break Q5946;
                    }
                  }
                }
                let _c6114: boolean = _q5945;
                if (!_c6114) {
                  _g5949.length = 0;
                  G5950: {
                    const _a6032 = sp.cellEdges[v_c];
                    for (let _i6033 = 0; _i6033 < _a6032.length; _i6033++) {
                      const v_x = _a6032[_i6033];
                      if (!((_f5924[v_x] === 1))) continue;
                      const _t6034 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      _g6035.length = 0;
                      G6036: {
                        const _a6074 = sp.cellEdges[_t6034];
                        for (let _i6075 = 0; _i6075 < _a6074.length; _i6075++) {
                          const v_y = _a6074[_i6075];
                          let _c6094: boolean = (v_y !== v_x);
                          if (_c6094) {
                            let _q6076 = false;
                            Q6077: {
                              const _a6078 = sp.cellEdges[_t6034];
                              for (const _e6082 of _l6080) _f6079[_e6082] = -1;
                              _l6080 = _a6078;
                              let _i6084 = 0;
                              _s6081[0] = 0;
                              let _o6088 = _a6078.length === 0;
                              for (;;) {
                                if (_a6078.length === 0) {
                                  if (!_o6088) break;
                                  _o6088 = false;
                                }
                                while (_a6078.length > 0 && _i6084 >= 0) {
                                  const _e6082 = _a6078[_i6084];
                                  if (_s6081[_i6084] > 0) _f6079[_e6082] = -1;
                                  let _r6087 = (cands[_e6082] >= 0 ? cands[_e6082] : (cands[_e6082] = b.cands[_e6082])) & ~((2 << _s6081[_i6084]) - 1);
                                  let _d6083 = 0;
                                  V6086: for (; _r6087 !== 0; _r6087 &= _r6087 - 1) {
                                    _d6083 = 31 - Math.clz32(_r6087 & -_r6087);
                                    _f6079[_e6082] = _d6083;
                                    if (_e6082 === v_x && _d6083 !== 1) continue;
                                    if (_e6082 === v_y && _d6083 !== 1) continue;
                                    for (let _j6085 = 0; _j6085 < _i6084; _j6085++) {
                                      const _y6089 = _a6078[_j6085];
                                      if (!((((arms(sp, cl, _t6034) === 2) && (_f6079[_e6082] === 1)) && (_f6079[_y6089] === 1)))) continue;
                                      if (!((bent(sp, _e6082, _y6089) === (clueAt(cl.piece, _t6034) === 3)))) continue V6086;
                                    }
                                    break;
                                  }
                                  if (_r6087 === 0) {
                                    _s6081[_i6084] = 0;
                                    _i6084--;
                                    continue;
                                  }
                                  _s6081[_i6084] = _d6083;
                                  if (_i6084 === _a6078.length - 1) break;
                                  _i6084++;
                                  _s6081[_i6084] = 0;
                                }
                                if (_i6084 < 0) break;
                                let _g6090 = 0;
                                G6091: {
                                  const _a6092 = sp.cellEdges[_t6034];
                                  for (let _i6093 = 0; _i6093 < _a6092.length; _i6093++) {
                                    const v_z = _a6092[_i6093];
                                    if (!((_f6079[v_z] === 1))) continue;
                                    _g6090++;
                                  }
                                }
                                if (!((_g6090 === arms(sp, cl, _t6034)))) continue;
                                if (true) {
                                  _q6076 = true;
                                  break Q6077;
                                }
                              }
                            }
                            _c6094 = _q6076;
                          }
                          if (!(_c6094)) continue;
                          const _t6095 = (sp.edgeEnds[2 * v_y] === _t6034 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6096 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t6034]);
                          const _eg6097 = edgeGroups(sp, _t6096);
                          _g6098.length = 0;
                          G6099: {
                            const _a6105 = _eg6097.of(_t6095);
                            for (let _i6106 = 0; _i6106 < _a6105.length; _i6106++) {
                              const v_t = _a6105[_i6106];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a6107 = sp.cellEdges[v_t];
                              for (let _i6108 = 0; _i6108 < _a6107.length; _i6108++) {
                                const v_y = _a6107[_i6108];
                                L6109: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L6109;
                                  if (!_g6098.includes(v_z)) _g6098.push(v_z);
                                }
                              }
                            }
                          }
                          const _a6110 = union(_eg6097.of(_t6095), _g6098);
                          for (let _i6111 = 0; _i6111 < _a6110.length; _i6111++) {
                            const v_t = _a6110[_i6111];
                            if (!_g6035.includes(v_t)) _g6035.push(v_t);
                          }
                        }
                      }
                      const _a6112 = union(setOf(_t6034), _g6035);
                      for (let _i6113 = 0; _i6113 < _a6112.length; _i6113++) {
                        const v_t = _a6112[_i6113];
                        if (!_g5949.includes(v_t)) _g5949.push(v_t);
                      }
                    }
                  }
                  _c6114 = (union(setOf(v_c), _g5949).length >= _h5671);
                }
                _c6115 = _c6114;
              }
              let _c6162: boolean = _c6115;
              if (_c6162) {
                let _q6116 = true;
                Q6117: {
                  _g6118.length = 0;
                  G6119: {
                    const _a6122 = sp.cellEdges[v_c];
                    for (let _i6123 = 0; _i6123 < _a6122.length; _i6123++) {
                      const v_x = _a6122[_i6123];
                      if (!((_f5924[v_x] === 1))) continue;
                      _g6118.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6118);
                  const _eg6147 = edgeGroups(sp, v_M);
                  const _a6124 = sp.cellEdges[v_c];
                  for (let _i6125 = 0; _i6125 < _a6124.length; _i6125++) {
                    const v_x = _a6124[_i6125];
                    L6126: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6131: boolean = (v_j !== v_c);
                      if (_c6131) {
                        let _q6127 = false;
                        Q6128: {
                          const _a6129 = sp.cellEdges[v_j];
                          for (let _i6130 = 0; _i6130 < _a6129.length; _i6130++) {
                            const v_y = _a6129[_i6130];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6127 = true;
                              break Q6128;
                            }
                          }
                        }
                        _c6131 = _q6127;
                      }
                      if (!(_c6131)) break L6126;
                      let _q6132 = false;
                      Q6133: {
                        const _a6134 = sp.cellEdges[v_j];
                        for (const _e6138 of _l6136) _f6135[_e6138] = -1;
                        _l6136 = _a6134;
                        let _i6140 = 0;
                        _s6137[0] = 0;
                        let _o6144 = _a6134.length === 0;
                        for (;;) {
                          if (_a6134.length === 0) {
                            if (!_o6144) break;
                            _o6144 = false;
                          }
                          while (_a6134.length > 0 && _i6140 >= 0) {
                            const _e6138 = _a6134[_i6140];
                            if (_s6137[_i6140] > 0) _f6135[_e6138] = -1;
                            let _r6143 = (cands[_e6138] >= 0 ? cands[_e6138] : (cands[_e6138] = b.cands[_e6138])) & ~((2 << _s6137[_i6140]) - 1);
                            let _d6139 = 0;
                            V6142: for (; _r6143 !== 0; _r6143 &= _r6143 - 1) {
                              _d6139 = 31 - Math.clz32(_r6143 & -_r6143);
                              _f6135[_e6138] = _d6139;
                              for (let _j6141 = 0; _j6141 < _i6140; _j6141++) {
                                const _y6145 = _a6134[_j6141];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f6135[_e6138] === 1)) && (_f6135[_y6145] === 1)))) continue;
                                if (!((bent(sp, _e6138, _y6145) === (clueAt(cl.piece, v_j) === 3)))) continue V6142;
                              }
                              for (let _j6141 = 0; _j6141 < _i6140; _j6141++) {
                                const _y6146 = _a6134[_j6141];
                                if (!(((((((_f6135[_e6138] === 1) && (_f6135[_y6146] === 1)) && !((b.grid[_e6138] !== 0))) && !((b.grid[_y6146] !== 0))) && !([sp.edgeEnds[2 * _e6138], sp.edgeEnds[2 * _e6138 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6146], sp.edgeEnds[2 * _y6146 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6147.of((sp.edgeEnds[2 * _y6146] === v_j ? sp.edgeEnds[2 * _y6146 + 1] : sp.edgeEnds[2 * _y6146])) === _eg6147.of((sp.edgeEnds[2 * _e6138] === v_j ? sp.edgeEnds[2 * _e6138 + 1] : sp.edgeEnds[2 * _e6138]))))) continue V6142;
                              }
                              break;
                            }
                            if (_r6143 === 0) {
                              _s6137[_i6140] = 0;
                              _i6140--;
                              continue;
                            }
                            _s6137[_i6140] = _d6139;
                            if (_i6140 === _a6134.length - 1) break;
                            _i6140++;
                            _s6137[_i6140] = 0;
                          }
                          if (_i6140 < 0) break;
                          let _q6148 = true;
                          Q6149: {
                            const _a6150 = sp.cellEdges[v_j];
                            for (let _i6151 = 0; _i6151 < _a6150.length; _i6151++) {
                              const v_y = _a6150[_i6151];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6135[v_y] === _f5924[v_y]))) {
                                _q6148 = false;
                                break Q6149;
                              }
                            }
                          }
                          let _c6156: boolean = _q6148;
                          if (_c6156) {
                            let _g6152 = 0;
                            G6153: {
                              const _a6154 = sp.cellEdges[v_j];
                              for (let _i6155 = 0; _i6155 < _a6154.length; _i6155++) {
                                const v_y = _a6154[_i6155];
                                if (!((_f6135[v_y] === 1))) continue;
                                _g6152++;
                              }
                            }
                            _c6156 = (_g6152 === arms(sp, cl, v_j));
                          }
                          let _c6161: boolean = _c6156;
                          if (_c6161) {
                            let _q6157 = true;
                            Q6158: {
                              const _a6159 = sp.cellEdges[v_j];
                              for (let _i6160 = 0; _i6160 < _a6159.length; _i6160++) {
                                const v_y = _a6159[_i6160];
                                if (!((((_f6135[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6147.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6147.of(v_j)))) {
                                  _q6157 = false;
                                  break Q6158;
                                }
                              }
                            }
                            _c6161 = _q6157;
                          }
                          if (!(_c6161)) continue;
                          if (true) {
                            _q6132 = true;
                            break Q6133;
                          }
                        }
                      }
                      if (!(_q6132)) {
                        _q6116 = false;
                        break Q6117;
                      }
                    }
                  }
                }
                _c6162 = _q6116;
              }
              if (!(_c6162)) continue;
              if (!(true)) continue;
              _l5919 = _a5923;
              _y5920 = true;
              for (const _e5922 of _a5923) _p5918[_e5922] |= 1 << _f5924[_e5922];
            }
          }
          if (!(((((_p5918[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y5920 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g5672.push(v_e);
        }
      }
      const v_W = _g5672;
      _g6163.length = 0;
      G6164: {
        const _a6407 = v_F;
        for (let _i6408 = 0; _i6408 < _a6407.length; _i6408++) {
          const v_e = _a6407[_i6408];
          if (_g6412 !== _epoch) {
            _g6412 = _epoch;
            for (const _e6413 of _l6410) _p6409[_e6413] = 0;
            _y6411 = false;
            const _a6414 = sp.cellEdges[v_c];
            for (const _e6418 of _l6416) _f6415[_e6418] = -1;
            _l6416 = _a6414;
            let _i6420 = 0;
            _s6417[0] = 0;
            let _o6424 = _a6414.length === 0;
            for (;;) {
              if (_a6414.length === 0) {
                if (!_o6424) break;
                _o6424 = false;
              }
              while (_a6414.length > 0 && _i6420 >= 0) {
                const _e6418 = _a6414[_i6420];
                if (_s6417[_i6420] > 0) _f6415[_e6418] = -1;
                let _r6423 = (cands[_e6418] >= 0 ? cands[_e6418] : (cands[_e6418] = b.cands[_e6418])) & ~((2 << _s6417[_i6420]) - 1);
                let _d6419 = 0;
                V6422: for (; _r6423 !== 0; _r6423 &= _r6423 - 1) {
                  _d6419 = 31 - Math.clz32(_r6423 & -_r6423);
                  _f6415[_e6418] = _d6419;
                  for (let _j6421 = 0; _j6421 < _i6420; _j6421++) {
                    const _y6425 = _a6414[_j6421];
                    if (!((((arms(sp, cl, v_c) === 2) && (_f6415[_e6418] === 1)) && (_f6415[_y6425] === 1)))) continue;
                    if (!((bent(sp, _e6418, _y6425) === (clueAt(cl.piece, v_c) === 3)))) continue V6422;
                  }
                  for (let _j6421 = 0; _j6421 < _i6420; _j6421++) {
                    const _y6426 = _a6414[_j6421];
                    if (!(((((_f6415[_e6418] === 1) && (_f6415[_y6426] === 1)) && !((b.grid[_e6418] !== 0))) && !((b.grid[_y6426] !== 0))))) continue;
                    if (!(!(_eg5509.of((sp.edgeEnds[2 * _y6426] === v_c ? sp.edgeEnds[2 * _y6426 + 1] : sp.edgeEnds[2 * _y6426])) === _eg5509.of((sp.edgeEnds[2 * _e6418] === v_c ? sp.edgeEnds[2 * _e6418 + 1] : sp.edgeEnds[2 * _e6418]))))) continue V6422;
                  }
                  break;
                }
                if (_r6423 === 0) {
                  _s6417[_i6420] = 0;
                  _i6420--;
                  continue;
                }
                _s6417[_i6420] = _d6419;
                if (_i6420 === _a6414.length - 1) break;
                _i6420++;
                _s6417[_i6420] = 0;
              }
              if (_i6420 < 0) break;
              let _g6427 = 0;
              G6428: {
                const _a6429 = sp.cellEdges[v_c];
                for (let _i6430 = 0; _i6430 < _a6429.length; _i6430++) {
                  const v_x = _a6429[_i6430];
                  if (!((_f6415[v_x] === 1))) continue;
                  _g6427++;
                }
              }
              let _c6435: boolean = (_g6427 === arms(sp, cl, v_c));
              if (_c6435) {
                let _q6431 = true;
                Q6432: {
                  const _a6433 = sp.cellEdges[v_c];
                  for (let _i6434 = 0; _i6434 < _a6433.length; _i6434++) {
                    const v_x = _a6433[_i6434];
                    if (!(((_f6415[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                    if (!(!(_eg5509.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                      _q6431 = false;
                      break Q6432;
                    }
                  }
                }
                _c6435 = _q6431;
              }
              let _c6606: boolean = _c6435;
              if (_c6606) {
                let _q6436 = false;
                Q6437: {
                  const _a6438 = sp.cellEdges[v_c];
                  for (let _i6439 = 0; _i6439 < _a6438.length; _i6439++) {
                    const v_x = _a6438[_i6439];
                    if (!((_f6415[v_x] === 1))) continue;
                    if ((v_K.includes(v_x))) {
                      _q6436 = true;
                      break Q6437;
                    }
                  }
                }
                let _c6605: boolean = _q6436;
                if (!_c6605) {
                  _g6440.length = 0;
                  G6441: {
                    const _a6523 = sp.cellEdges[v_c];
                    for (let _i6524 = 0; _i6524 < _a6523.length; _i6524++) {
                      const v_x = _a6523[_i6524];
                      if (!((_f6415[v_x] === 1))) continue;
                      const _t6525 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      _g6526.length = 0;
                      G6527: {
                        const _a6565 = sp.cellEdges[_t6525];
                        for (let _i6566 = 0; _i6566 < _a6565.length; _i6566++) {
                          const v_y = _a6565[_i6566];
                          let _c6585: boolean = (v_y !== v_x);
                          if (_c6585) {
                            let _q6567 = false;
                            Q6568: {
                              const _a6569 = sp.cellEdges[_t6525];
                              for (const _e6573 of _l6571) _f6570[_e6573] = -1;
                              _l6571 = _a6569;
                              let _i6575 = 0;
                              _s6572[0] = 0;
                              let _o6579 = _a6569.length === 0;
                              for (;;) {
                                if (_a6569.length === 0) {
                                  if (!_o6579) break;
                                  _o6579 = false;
                                }
                                while (_a6569.length > 0 && _i6575 >= 0) {
                                  const _e6573 = _a6569[_i6575];
                                  if (_s6572[_i6575] > 0) _f6570[_e6573] = -1;
                                  let _r6578 = (cands[_e6573] >= 0 ? cands[_e6573] : (cands[_e6573] = b.cands[_e6573])) & ~((2 << _s6572[_i6575]) - 1);
                                  let _d6574 = 0;
                                  V6577: for (; _r6578 !== 0; _r6578 &= _r6578 - 1) {
                                    _d6574 = 31 - Math.clz32(_r6578 & -_r6578);
                                    _f6570[_e6573] = _d6574;
                                    if (_e6573 === v_x && _d6574 !== 1) continue;
                                    if (_e6573 === v_y && _d6574 !== 1) continue;
                                    for (let _j6576 = 0; _j6576 < _i6575; _j6576++) {
                                      const _y6580 = _a6569[_j6576];
                                      if (!((((arms(sp, cl, _t6525) === 2) && (_f6570[_e6573] === 1)) && (_f6570[_y6580] === 1)))) continue;
                                      if (!((bent(sp, _e6573, _y6580) === (clueAt(cl.piece, _t6525) === 3)))) continue V6577;
                                    }
                                    break;
                                  }
                                  if (_r6578 === 0) {
                                    _s6572[_i6575] = 0;
                                    _i6575--;
                                    continue;
                                  }
                                  _s6572[_i6575] = _d6574;
                                  if (_i6575 === _a6569.length - 1) break;
                                  _i6575++;
                                  _s6572[_i6575] = 0;
                                }
                                if (_i6575 < 0) break;
                                let _g6581 = 0;
                                G6582: {
                                  const _a6583 = sp.cellEdges[_t6525];
                                  for (let _i6584 = 0; _i6584 < _a6583.length; _i6584++) {
                                    const v_z = _a6583[_i6584];
                                    if (!((_f6570[v_z] === 1))) continue;
                                    _g6581++;
                                  }
                                }
                                if (!((_g6581 === arms(sp, cl, _t6525)))) continue;
                                if (true) {
                                  _q6567 = true;
                                  break Q6568;
                                }
                              }
                            }
                            _c6585 = _q6567;
                          }
                          if (!(_c6585)) continue;
                          const _t6586 = (sp.edgeEnds[2 * v_y] === _t6525 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                          const _t6587 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t6525]);
                          const _eg6588 = edgeGroups(sp, _t6587);
                          _g6589.length = 0;
                          G6590: {
                            const _a6596 = _eg6588.of(_t6586);
                            for (let _i6597 = 0; _i6597 < _a6596.length; _i6597++) {
                              const v_t = _a6596[_i6597];
                              if (!((arms(sp, cl, v_t) > 1))) continue;
                              const _a6598 = sp.cellEdges[v_t];
                              for (let _i6599 = 0; _i6599 < _a6598.length; _i6599++) {
                                const v_y = _a6598[_i6599];
                                L6600: {
                                  const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                                  if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L6600;
                                  if (!_g6589.includes(v_z)) _g6589.push(v_z);
                                }
                              }
                            }
                          }
                          const _a6601 = union(_eg6588.of(_t6586), _g6589);
                          for (let _i6602 = 0; _i6602 < _a6601.length; _i6602++) {
                            const v_t = _a6601[_i6602];
                            if (!_g6526.includes(v_t)) _g6526.push(v_t);
                          }
                        }
                      }
                      const _a6603 = union(setOf(_t6525), _g6526);
                      for (let _i6604 = 0; _i6604 < _a6603.length; _i6604++) {
                        const v_t = _a6603[_i6604];
                        if (!_g6440.includes(v_t)) _g6440.push(v_t);
                      }
                    }
                  }
                  _c6605 = (union(setOf(v_c), _g6440).length >= _h5671);
                }
                _c6606 = _c6605;
              }
              let _c6653: boolean = _c6606;
              if (_c6653) {
                let _q6607 = true;
                Q6608: {
                  _g6609.length = 0;
                  G6610: {
                    const _a6613 = sp.cellEdges[v_c];
                    for (let _i6614 = 0; _i6614 < _a6613.length; _i6614++) {
                      const v_x = _a6613[_i6614];
                      if (!((_f6415[v_x] === 1))) continue;
                      _g6609.push(v_x);
                    }
                  }
                  const v_M = union(v_L, _g6609);
                  const _eg6638 = edgeGroups(sp, v_M);
                  const _a6615 = sp.cellEdges[v_c];
                  for (let _i6616 = 0; _i6616 < _a6615.length; _i6616++) {
                    const v_x = _a6615[_i6616];
                    L6617: {
                      const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                      let _c6622: boolean = (v_j !== v_c);
                      if (_c6622) {
                        let _q6618 = false;
                        Q6619: {
                          const _a6620 = sp.cellEdges[v_j];
                          for (let _i6621 = 0; _i6621 < _a6620.length; _i6621++) {
                            const v_y = _a6620[_i6621];
                            if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                              _q6618 = true;
                              break Q6619;
                            }
                          }
                        }
                        _c6622 = _q6618;
                      }
                      if (!(_c6622)) break L6617;
                      let _q6623 = false;
                      Q6624: {
                        const _a6625 = sp.cellEdges[v_j];
                        for (const _e6629 of _l6627) _f6626[_e6629] = -1;
                        _l6627 = _a6625;
                        let _i6631 = 0;
                        _s6628[0] = 0;
                        let _o6635 = _a6625.length === 0;
                        for (;;) {
                          if (_a6625.length === 0) {
                            if (!_o6635) break;
                            _o6635 = false;
                          }
                          while (_a6625.length > 0 && _i6631 >= 0) {
                            const _e6629 = _a6625[_i6631];
                            if (_s6628[_i6631] > 0) _f6626[_e6629] = -1;
                            let _r6634 = (cands[_e6629] >= 0 ? cands[_e6629] : (cands[_e6629] = b.cands[_e6629])) & ~((2 << _s6628[_i6631]) - 1);
                            let _d6630 = 0;
                            V6633: for (; _r6634 !== 0; _r6634 &= _r6634 - 1) {
                              _d6630 = 31 - Math.clz32(_r6634 & -_r6634);
                              _f6626[_e6629] = _d6630;
                              for (let _j6632 = 0; _j6632 < _i6631; _j6632++) {
                                const _y6636 = _a6625[_j6632];
                                if (!((((arms(sp, cl, v_j) === 2) && (_f6626[_e6629] === 1)) && (_f6626[_y6636] === 1)))) continue;
                                if (!((bent(sp, _e6629, _y6636) === (clueAt(cl.piece, v_j) === 3)))) continue V6633;
                              }
                              for (let _j6632 = 0; _j6632 < _i6631; _j6632++) {
                                const _y6637 = _a6625[_j6632];
                                if (!(((((((_f6626[_e6629] === 1) && (_f6626[_y6637] === 1)) && !((b.grid[_e6629] !== 0))) && !((b.grid[_y6637] !== 0))) && !([sp.edgeEnds[2 * _e6629], sp.edgeEnds[2 * _e6629 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y6637], sp.edgeEnds[2 * _y6637 + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6638.of((sp.edgeEnds[2 * _y6637] === v_j ? sp.edgeEnds[2 * _y6637 + 1] : sp.edgeEnds[2 * _y6637])) === _eg6638.of((sp.edgeEnds[2 * _e6629] === v_j ? sp.edgeEnds[2 * _e6629 + 1] : sp.edgeEnds[2 * _e6629]))))) continue V6633;
                              }
                              break;
                            }
                            if (_r6634 === 0) {
                              _s6628[_i6631] = 0;
                              _i6631--;
                              continue;
                            }
                            _s6628[_i6631] = _d6630;
                            if (_i6631 === _a6625.length - 1) break;
                            _i6631++;
                            _s6628[_i6631] = 0;
                          }
                          if (_i6631 < 0) break;
                          let _q6639 = true;
                          Q6640: {
                            const _a6641 = sp.cellEdges[v_j];
                            for (let _i6642 = 0; _i6642 < _a6641.length; _i6642++) {
                              const v_y = _a6641[_i6642];
                              if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                              if (!((_f6626[v_y] === _f6415[v_y]))) {
                                _q6639 = false;
                                break Q6640;
                              }
                            }
                          }
                          let _c6647: boolean = _q6639;
                          if (_c6647) {
                            let _g6643 = 0;
                            G6644: {
                              const _a6645 = sp.cellEdges[v_j];
                              for (let _i6646 = 0; _i6646 < _a6645.length; _i6646++) {
                                const v_y = _a6645[_i6646];
                                if (!((_f6626[v_y] === 1))) continue;
                                _g6643++;
                              }
                            }
                            _c6647 = (_g6643 === arms(sp, cl, v_j));
                          }
                          let _c6652: boolean = _c6647;
                          if (_c6652) {
                            let _q6648 = true;
                            Q6649: {
                              const _a6650 = sp.cellEdges[v_j];
                              for (let _i6651 = 0; _i6651 < _a6650.length; _i6651++) {
                                const v_y = _a6650[_i6651];
                                if (!((((_f6626[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                                if (!(!(_eg6638.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg6638.of(v_j)))) {
                                  _q6648 = false;
                                  break Q6649;
                                }
                              }
                            }
                            _c6652 = _q6648;
                          }
                          if (!(_c6652)) continue;
                          if (true) {
                            _q6623 = true;
                            break Q6624;
                          }
                        }
                      }
                      if (!(_q6623)) {
                        _q6607 = false;
                        break Q6608;
                      }
                    }
                  }
                }
                _c6653 = _q6607;
              }
              if (!(_c6653)) continue;
              if (!(true)) continue;
              _l6410 = _a6414;
              _y6411 = true;
              for (const _e6413 of _a6414) _p6409[_e6413] |= 1 << _f6415[_e6413];
            }
          }
          if (!(((((_p6409[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y6411 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g6163.push(v_e);
        }
      }
      L6654: {
        const v_N = _g6163;
        let _q6655 = true;
        Q6656: {
          const _a6657 = v_F;
          for (let _i6658 = 0; _i6658 < _a6657.length; _i6658++) {
            const v_e = _a6657[_i6658];
            if (!((!(v_W.includes(v_e)) || !(v_N.includes(v_e))))) {
              _q6655 = false;
              break Q6656;
            }
          }
        }
        if (!(_q6655)) break L6654;
        facts.length = 0;
        changed = false;
        let _q6659 = true;
        Q6660: {
          const _a6661 = v_F;
          for (let _i6662 = 0; _i6662 < _a6661.length; _i6662++) {
            const v_e = _a6661[_i6662];
            let _c6664: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c6664) {
              let _c6663: boolean = !(!(v_W.includes(v_e)));
              if (!_c6663) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c6663 = true;
              }
              _c6664 = _c6663;
            }
            let _c6666: boolean = _c6664;
            if (_c6666) {
              let _c6665: boolean = !(!(v_N.includes(v_e)));
              if (!_c6665) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c6665 = true;
              }
              _c6666 = _c6665;
            }
            if (!(_c6666)) {
              _q6659 = false;
              break Q6660;
            }
          }
        }
        if (!(_q6659)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, F: v_F.slice(), G: v_G.slice(), K: v_K.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface StrandNoteBinding {
  L: readonly number[];
  U: readonly number[];
  P: readonly number[];
  c: number;
  G: readonly number[];
  K: readonly number[];
  e: number;
  A: boolean;
  B: boolean;
}

const strandNoteFacts: number[] = [];
let strandNoteCands = new Int32Array(0);

/** Its dearest read grows with the board as n^2. */
export function strandNote(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<StrandNoteBinding> | null): number {
  const _g7408: number[] = [];
  const _g7414: number[] = [];
  const _f7463 = new Int32Array(sp.edges.length).fill(-1);
  let _l7464: readonly number[] = [];
  const _s7465: number[] = [];
  const _f7482 = new Int32Array(sp.edges.length).fill(-1);
  let _l7483: readonly number[] = [];
  const _s7484: number[] = [];
  const _g7498: number[] = [];
  const _g7507: number[] = [];
  const _g7591: number[] = [];
  const _f7635 = new Int32Array(sp.edges.length).fill(-1);
  let _l7636: readonly number[] = [];
  const _s7637: number[] = [];
  const _g7654: number[] = [];
  const _p7671 = new Int32Array(sp.edges.length);
  let _l7672: readonly number[] = [];
  let _y7673 = false;
  const _f7677 = new Int32Array(sp.edges.length).fill(-1);
  let _l7678: readonly number[] = [];
  const _s7679: number[] = [];
  const _g7702: number[] = [];
  const _g7788: number[] = [];
  const _f7832 = new Int32Array(sp.edges.length).fill(-1);
  let _l7833: readonly number[] = [];
  const _s7834: number[] = [];
  const _g7851: number[] = [];
  const _g7871: number[] = [];
  const _f7888 = new Int32Array(sp.edges.length).fill(-1);
  let _l7889: readonly number[] = [];
  const _s7890: number[] = [];
  const _p7916 = new Int32Array(sp.edges.length);
  let _l7917: readonly number[] = [];
  let _y7918 = false;
  const _f7922 = new Int32Array(sp.edges.length).fill(-1);
  let _l7923: readonly number[] = [];
  const _s7924: number[] = [];
  const _g7947: number[] = [];
  const _g8033: number[] = [];
  const _f8077 = new Int32Array(sp.edges.length).fill(-1);
  let _l8078: readonly number[] = [];
  const _s8079: number[] = [];
  const _g8096: number[] = [];
  const _g8116: number[] = [];
  const _f8133 = new Int32Array(sp.edges.length).fill(-1);
  let _l8134: readonly number[] = [];
  const _s8135: number[] = [];
  const facts = strandNoteFacts;
  let fired = 0;
  let changed = false;
  const _h7668 = sp.cells.length;
  let _epoch = 0;
  if (strandNoteCands.length < sp.edges.length) strandNoteCands = new Int32Array(sp.edges.length);
  const cands = strandNoteCands;
  cands.fill(-1);
  _g7408.length = 0;
  G7409: {
    const _a7412 = sp.edges;
    for (let _i7413 = 0; _i7413 < _a7412.length; _i7413++) {
      const v_e = _a7412[_i7413];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g7408.push(v_e);
    }
  }
  const v_L = _g7408;
  const _eg7506 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g7414.length = 0;
  G7415: {
    const _a7457 = sp.edges;
    for (let _i7458 = 0; _i7458 < _a7457.length; _i7458++) {
      const v_e = _a7457[_i7458];
      const _t7459 = sp.edgeEnds[2 * v_e];
      let _q7460 = false;
      Q7461: {
        const _a7462 = sp.cellEdges[_t7459];
        for (const _e7466 of _l7464) _f7463[_e7466] = -1;
        _l7464 = _a7462;
        let _i7468 = 0;
        _s7465[0] = 0;
        let _o7472 = _a7462.length === 0;
        for (;;) {
          if (_a7462.length === 0) {
            if (!_o7472) break;
            _o7472 = false;
          }
          while (_a7462.length > 0 && _i7468 >= 0) {
            const _e7466 = _a7462[_i7468];
            if (_s7465[_i7468] > 0) _f7463[_e7466] = -1;
            let _r7471 = (cands[_e7466] >= 0 ? cands[_e7466] : (cands[_e7466] = b.cands[_e7466])) & ~((2 << _s7465[_i7468]) - 1);
            let _d7467 = 0;
            V7470: for (; _r7471 !== 0; _r7471 &= _r7471 - 1) {
              _d7467 = 31 - Math.clz32(_r7471 & -_r7471);
              _f7463[_e7466] = _d7467;
              if (_e7466 === v_e && _d7467 !== 1) continue;
              for (let _j7469 = 0; _j7469 < _i7468; _j7469++) {
                const _y7473 = _a7462[_j7469];
                if (!((((arms(sp, cl, _t7459) === 2) && (_f7463[_e7466] === 1)) && (_f7463[_y7473] === 1)))) continue;
                if (!((bent(sp, _e7466, _y7473) === (clueAt(cl.piece, _t7459) === 3)))) continue V7470;
              }
              break;
            }
            if (_r7471 === 0) {
              _s7465[_i7468] = 0;
              _i7468--;
              continue;
            }
            _s7465[_i7468] = _d7467;
            if (_i7468 === _a7462.length - 1) break;
            _i7468++;
            _s7465[_i7468] = 0;
          }
          if (_i7468 < 0) break;
          let _g7474 = 0;
          G7475: {
            const _a7476 = sp.cellEdges[_t7459];
            for (let _i7477 = 0; _i7477 < _a7476.length; _i7477++) {
              const v_x = _a7476[_i7477];
              if (!((_f7463[v_x] === 1))) continue;
              _g7474++;
            }
          }
          if (!((_g7474 === arms(sp, cl, _t7459)))) continue;
          if (true) {
            _q7460 = true;
            break Q7461;
          }
        }
      }
      let _c7497: boolean = _q7460;
      if (_c7497) {
        const _t7478 = sp.edgeEnds[2 * v_e + 1];
        let _q7479 = false;
        Q7480: {
          const _a7481 = sp.cellEdges[_t7478];
          for (const _e7485 of _l7483) _f7482[_e7485] = -1;
          _l7483 = _a7481;
          let _i7487 = 0;
          _s7484[0] = 0;
          let _o7491 = _a7481.length === 0;
          for (;;) {
            if (_a7481.length === 0) {
              if (!_o7491) break;
              _o7491 = false;
            }
            while (_a7481.length > 0 && _i7487 >= 0) {
              const _e7485 = _a7481[_i7487];
              if (_s7484[_i7487] > 0) _f7482[_e7485] = -1;
              let _r7490 = (cands[_e7485] >= 0 ? cands[_e7485] : (cands[_e7485] = b.cands[_e7485])) & ~((2 << _s7484[_i7487]) - 1);
              let _d7486 = 0;
              V7489: for (; _r7490 !== 0; _r7490 &= _r7490 - 1) {
                _d7486 = 31 - Math.clz32(_r7490 & -_r7490);
                _f7482[_e7485] = _d7486;
                if (_e7485 === v_e && _d7486 !== 1) continue;
                for (let _j7488 = 0; _j7488 < _i7487; _j7488++) {
                  const _y7492 = _a7481[_j7488];
                  if (!((((arms(sp, cl, _t7478) === 2) && (_f7482[_e7485] === 1)) && (_f7482[_y7492] === 1)))) continue;
                  if (!((bent(sp, _e7485, _y7492) === (clueAt(cl.piece, _t7478) === 3)))) continue V7489;
                }
                break;
              }
              if (_r7490 === 0) {
                _s7484[_i7487] = 0;
                _i7487--;
                continue;
              }
              _s7484[_i7487] = _d7486;
              if (_i7487 === _a7481.length - 1) break;
              _i7487++;
              _s7484[_i7487] = 0;
            }
            if (_i7487 < 0) break;
            let _g7493 = 0;
            G7494: {
              const _a7495 = sp.cellEdges[_t7478];
              for (let _i7496 = 0; _i7496 < _a7495.length; _i7496++) {
                const v_x = _a7495[_i7496];
                if (!((_f7482[v_x] === 1))) continue;
                _g7493++;
              }
            }
            if (!((_g7493 === arms(sp, cl, _t7478)))) continue;
            if (true) {
              _q7479 = true;
              break Q7480;
            }
          }
        }
        _c7497 = _q7479;
      }
      if (!(_c7497)) continue;
      _g7414.push(v_e);
    }
  }
  const v_U = _g7414;
  _g7498.length = 0;
  G7499: {
    const _a7502 = v_U;
    for (let _i7503 = 0; _i7503 < _a7502.length; _i7503++) {
      const v_e = _a7502[_i7503];
      if (!(((arms(sp, cl, sp.edgeEnds[2 * v_e]) > 1) && (arms(sp, cl, sp.edgeEnds[2 * v_e + 1]) > 1)))) continue;
      _g7498.push(v_e);
    }
  }
  const v_P = _g7498;
  const _a7504 = sp.cells;
  for (let _i7505 = 0; _i7505 < _a7504.length; _i7505++) {
    const v_c = _a7504[_i7505];
    const v_G = _eg7506.of(v_c);
    _g7507.length = 0;
    G7508: {
      const _a7588 = sp.cellEdges[v_c];
      for (let _i7589 = 0; _i7589 < _a7588.length; _i7589++) {
        const v_x = _a7588[_i7589];
        const _t7590 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
        _g7591.length = 0;
        G7592: {
          const _a7630 = sp.cellEdges[_t7590];
          for (let _i7631 = 0; _i7631 < _a7630.length; _i7631++) {
            const v_y = _a7630[_i7631];
            let _c7650: boolean = (v_y !== v_x);
            if (_c7650) {
              let _q7632 = false;
              Q7633: {
                const _a7634 = sp.cellEdges[_t7590];
                for (const _e7638 of _l7636) _f7635[_e7638] = -1;
                _l7636 = _a7634;
                let _i7640 = 0;
                _s7637[0] = 0;
                let _o7644 = _a7634.length === 0;
                for (;;) {
                  if (_a7634.length === 0) {
                    if (!_o7644) break;
                    _o7644 = false;
                  }
                  while (_a7634.length > 0 && _i7640 >= 0) {
                    const _e7638 = _a7634[_i7640];
                    if (_s7637[_i7640] > 0) _f7635[_e7638] = -1;
                    let _r7643 = (cands[_e7638] >= 0 ? cands[_e7638] : (cands[_e7638] = b.cands[_e7638])) & ~((2 << _s7637[_i7640]) - 1);
                    let _d7639 = 0;
                    V7642: for (; _r7643 !== 0; _r7643 &= _r7643 - 1) {
                      _d7639 = 31 - Math.clz32(_r7643 & -_r7643);
                      _f7635[_e7638] = _d7639;
                      if (_e7638 === v_x && _d7639 !== 1) continue;
                      if (_e7638 === v_y && _d7639 !== 1) continue;
                      for (let _j7641 = 0; _j7641 < _i7640; _j7641++) {
                        const _y7645 = _a7634[_j7641];
                        if (!((((arms(sp, cl, _t7590) === 2) && (_f7635[_e7638] === 1)) && (_f7635[_y7645] === 1)))) continue;
                        if (!((bent(sp, _e7638, _y7645) === (clueAt(cl.piece, _t7590) === 3)))) continue V7642;
                      }
                      break;
                    }
                    if (_r7643 === 0) {
                      _s7637[_i7640] = 0;
                      _i7640--;
                      continue;
                    }
                    _s7637[_i7640] = _d7639;
                    if (_i7640 === _a7634.length - 1) break;
                    _i7640++;
                    _s7637[_i7640] = 0;
                  }
                  if (_i7640 < 0) break;
                  let _g7646 = 0;
                  G7647: {
                    const _a7648 = sp.cellEdges[_t7590];
                    for (let _i7649 = 0; _i7649 < _a7648.length; _i7649++) {
                      const v_z = _a7648[_i7649];
                      if (!((_f7635[v_z] === 1))) continue;
                      _g7646++;
                    }
                  }
                  if (!((_g7646 === arms(sp, cl, _t7590)))) continue;
                  if (true) {
                    _q7632 = true;
                    break Q7633;
                  }
                }
              }
              _c7650 = _q7632;
            }
            if (!(_c7650)) continue;
            const _t7651 = (sp.edgeEnds[2 * v_y] === _t7590 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
            const _t7652 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t7590]);
            const _eg7653 = edgeGroups(sp, _t7652);
            _g7654.length = 0;
            G7655: {
              const _a7661 = _eg7653.of(_t7651);
              for (let _i7662 = 0; _i7662 < _a7661.length; _i7662++) {
                const v_t = _a7661[_i7662];
                if (!((arms(sp, cl, v_t) > 1))) continue;
                const _a7663 = sp.cellEdges[v_t];
                for (let _i7664 = 0; _i7664 < _a7663.length; _i7664++) {
                  const v_y = _a7663[_i7664];
                  L7665: {
                    const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                    if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L7665;
                    if (!_g7654.includes(v_z)) _g7654.push(v_z);
                  }
                }
              }
            }
            const _a7666 = union(_eg7653.of(_t7651), _g7654);
            for (let _i7667 = 0; _i7667 < _a7666.length; _i7667++) {
              const v_t = _a7666[_i7667];
              if (!_g7591.includes(v_t)) _g7591.push(v_t);
            }
          }
        }
        if (!((union(setOf(v_c), union(setOf(_t7590), _g7591)).length >= _h7668))) continue;
        _g7507.push(v_x);
      }
    }
    const v_K = _g7507;
    let _g7674 = -1;
    let _g7919 = -1;
    const _a7669 = sp.cellEdges[v_c];
    for (let _i7670 = 0; _i7670 < _a7669.length; _i7670++) {
      const v_e = _a7669[_i7670];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g7674 !== _epoch) {
        _g7674 = _epoch;
        for (const _e7675 of _l7672) _p7671[_e7675] = 0;
        _y7673 = false;
        const _a7676 = sp.cellEdges[v_c];
        for (const _e7680 of _l7678) _f7677[_e7680] = -1;
        _l7678 = _a7676;
        let _i7682 = 0;
        _s7679[0] = 0;
        let _o7686 = _a7676.length === 0;
        for (;;) {
          if (_a7676.length === 0) {
            if (!_o7686) break;
            _o7686 = false;
          }
          while (_a7676.length > 0 && _i7682 >= 0) {
            const _e7680 = _a7676[_i7682];
            if (_s7679[_i7682] > 0) _f7677[_e7680] = -1;
            let _r7685 = (cands[_e7680] >= 0 ? cands[_e7680] : (cands[_e7680] = b.cands[_e7680])) & ~((2 << _s7679[_i7682]) - 1);
            let _d7681 = 0;
            V7684: for (; _r7685 !== 0; _r7685 &= _r7685 - 1) {
              _d7681 = 31 - Math.clz32(_r7685 & -_r7685);
              _f7677[_e7680] = _d7681;
              for (let _j7683 = 0; _j7683 < _i7682; _j7683++) {
                const _y7687 = _a7676[_j7683];
                if (!((((arms(sp, cl, v_c) === 2) && (_f7677[_e7680] === 1)) && (_f7677[_y7687] === 1)))) continue;
                if (!((bent(sp, _e7680, _y7687) === (clueAt(cl.piece, v_c) === 3)))) continue V7684;
              }
              for (let _j7683 = 0; _j7683 < _i7682; _j7683++) {
                const _y7688 = _a7676[_j7683];
                if (!(((((_f7677[_e7680] === 1) && (_f7677[_y7688] === 1)) && !((b.grid[_e7680] !== 0))) && !((b.grid[_y7688] !== 0))))) continue;
                if (!(!(_eg7506.of((sp.edgeEnds[2 * _y7688] === v_c ? sp.edgeEnds[2 * _y7688 + 1] : sp.edgeEnds[2 * _y7688])) === _eg7506.of((sp.edgeEnds[2 * _e7680] === v_c ? sp.edgeEnds[2 * _e7680 + 1] : sp.edgeEnds[2 * _e7680]))))) continue V7684;
              }
              break;
            }
            if (_r7685 === 0) {
              _s7679[_i7682] = 0;
              _i7682--;
              continue;
            }
            _s7679[_i7682] = _d7681;
            if (_i7682 === _a7676.length - 1) break;
            _i7682++;
            _s7679[_i7682] = 0;
          }
          if (_i7682 < 0) break;
          let _g7689 = 0;
          G7690: {
            const _a7691 = sp.cellEdges[v_c];
            for (let _i7692 = 0; _i7692 < _a7691.length; _i7692++) {
              const v_x = _a7691[_i7692];
              if (!((_f7677[v_x] === 1))) continue;
              _g7689++;
            }
          }
          let _c7697: boolean = (_g7689 === arms(sp, cl, v_c));
          if (_c7697) {
            let _q7693 = true;
            Q7694: {
              const _a7695 = sp.cellEdges[v_c];
              for (let _i7696 = 0; _i7696 < _a7695.length; _i7696++) {
                const v_x = _a7695[_i7696];
                if (!(((_f7677[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7506.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q7693 = false;
                  break Q7694;
                }
              }
            }
            _c7697 = _q7693;
          }
          let _c7868: boolean = _c7697;
          if (_c7868) {
            let _q7698 = false;
            Q7699: {
              const _a7700 = sp.cellEdges[v_c];
              for (let _i7701 = 0; _i7701 < _a7700.length; _i7701++) {
                const v_x = _a7700[_i7701];
                if (!((_f7677[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q7698 = true;
                  break Q7699;
                }
              }
            }
            let _c7867: boolean = _q7698;
            if (!_c7867) {
              _g7702.length = 0;
              G7703: {
                const _a7785 = sp.cellEdges[v_c];
                for (let _i7786 = 0; _i7786 < _a7785.length; _i7786++) {
                  const v_x = _a7785[_i7786];
                  if (!((_f7677[v_x] === 1))) continue;
                  const _t7787 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  _g7788.length = 0;
                  G7789: {
                    const _a7827 = sp.cellEdges[_t7787];
                    for (let _i7828 = 0; _i7828 < _a7827.length; _i7828++) {
                      const v_y = _a7827[_i7828];
                      let _c7847: boolean = (v_y !== v_x);
                      if (_c7847) {
                        let _q7829 = false;
                        Q7830: {
                          const _a7831 = sp.cellEdges[_t7787];
                          for (const _e7835 of _l7833) _f7832[_e7835] = -1;
                          _l7833 = _a7831;
                          let _i7837 = 0;
                          _s7834[0] = 0;
                          let _o7841 = _a7831.length === 0;
                          for (;;) {
                            if (_a7831.length === 0) {
                              if (!_o7841) break;
                              _o7841 = false;
                            }
                            while (_a7831.length > 0 && _i7837 >= 0) {
                              const _e7835 = _a7831[_i7837];
                              if (_s7834[_i7837] > 0) _f7832[_e7835] = -1;
                              let _r7840 = (cands[_e7835] >= 0 ? cands[_e7835] : (cands[_e7835] = b.cands[_e7835])) & ~((2 << _s7834[_i7837]) - 1);
                              let _d7836 = 0;
                              V7839: for (; _r7840 !== 0; _r7840 &= _r7840 - 1) {
                                _d7836 = 31 - Math.clz32(_r7840 & -_r7840);
                                _f7832[_e7835] = _d7836;
                                if (_e7835 === v_x && _d7836 !== 1) continue;
                                if (_e7835 === v_y && _d7836 !== 1) continue;
                                for (let _j7838 = 0; _j7838 < _i7837; _j7838++) {
                                  const _y7842 = _a7831[_j7838];
                                  if (!((((arms(sp, cl, _t7787) === 2) && (_f7832[_e7835] === 1)) && (_f7832[_y7842] === 1)))) continue;
                                  if (!((bent(sp, _e7835, _y7842) === (clueAt(cl.piece, _t7787) === 3)))) continue V7839;
                                }
                                break;
                              }
                              if (_r7840 === 0) {
                                _s7834[_i7837] = 0;
                                _i7837--;
                                continue;
                              }
                              _s7834[_i7837] = _d7836;
                              if (_i7837 === _a7831.length - 1) break;
                              _i7837++;
                              _s7834[_i7837] = 0;
                            }
                            if (_i7837 < 0) break;
                            let _g7843 = 0;
                            G7844: {
                              const _a7845 = sp.cellEdges[_t7787];
                              for (let _i7846 = 0; _i7846 < _a7845.length; _i7846++) {
                                const v_z = _a7845[_i7846];
                                if (!((_f7832[v_z] === 1))) continue;
                                _g7843++;
                              }
                            }
                            if (!((_g7843 === arms(sp, cl, _t7787)))) continue;
                            if (true) {
                              _q7829 = true;
                              break Q7830;
                            }
                          }
                        }
                        _c7847 = _q7829;
                      }
                      if (!(_c7847)) continue;
                      const _t7848 = (sp.edgeEnds[2 * v_y] === _t7787 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t7849 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t7787]);
                      const _eg7850 = edgeGroups(sp, _t7849);
                      _g7851.length = 0;
                      G7852: {
                        const _a7858 = _eg7850.of(_t7848);
                        for (let _i7859 = 0; _i7859 < _a7858.length; _i7859++) {
                          const v_t = _a7858[_i7859];
                          if (!((arms(sp, cl, v_t) > 1))) continue;
                          const _a7860 = sp.cellEdges[v_t];
                          for (let _i7861 = 0; _i7861 < _a7860.length; _i7861++) {
                            const v_y = _a7860[_i7861];
                            L7862: {
                              const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L7862;
                              if (!_g7851.includes(v_z)) _g7851.push(v_z);
                            }
                          }
                        }
                      }
                      const _a7863 = union(_eg7850.of(_t7848), _g7851);
                      for (let _i7864 = 0; _i7864 < _a7863.length; _i7864++) {
                        const v_t = _a7863[_i7864];
                        if (!_g7788.includes(v_t)) _g7788.push(v_t);
                      }
                    }
                  }
                  const _a7865 = union(setOf(_t7787), _g7788);
                  for (let _i7866 = 0; _i7866 < _a7865.length; _i7866++) {
                    const v_t = _a7865[_i7866];
                    if (!_g7702.includes(v_t)) _g7702.push(v_t);
                  }
                }
              }
              _c7867 = (union(setOf(v_c), _g7702).length >= _h7668);
            }
            _c7868 = _c7867;
          }
          let _c7915: boolean = _c7868;
          if (_c7915) {
            let _q7869 = true;
            Q7870: {
              _g7871.length = 0;
              G7872: {
                const _a7875 = sp.cellEdges[v_c];
                for (let _i7876 = 0; _i7876 < _a7875.length; _i7876++) {
                  const v_x = _a7875[_i7876];
                  if (!((_f7677[v_x] === 1))) continue;
                  _g7871.push(v_x);
                }
              }
              const v_M = union(v_L, _g7871);
              const _eg7900 = edgeGroups(sp, v_M);
              const _a7877 = sp.cellEdges[v_c];
              for (let _i7878 = 0; _i7878 < _a7877.length; _i7878++) {
                const v_x = _a7877[_i7878];
                L7879: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c7884: boolean = (v_j !== v_c);
                  if (_c7884) {
                    let _q7880 = false;
                    Q7881: {
                      const _a7882 = sp.cellEdges[v_j];
                      for (let _i7883 = 0; _i7883 < _a7882.length; _i7883++) {
                        const v_y = _a7882[_i7883];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q7880 = true;
                          break Q7881;
                        }
                      }
                    }
                    _c7884 = _q7880;
                  }
                  if (!(_c7884)) break L7879;
                  let _q7885 = false;
                  Q7886: {
                    const _a7887 = sp.cellEdges[v_j];
                    for (const _e7891 of _l7889) _f7888[_e7891] = -1;
                    _l7889 = _a7887;
                    let _i7893 = 0;
                    _s7890[0] = 0;
                    let _o7897 = _a7887.length === 0;
                    for (;;) {
                      if (_a7887.length === 0) {
                        if (!_o7897) break;
                        _o7897 = false;
                      }
                      while (_a7887.length > 0 && _i7893 >= 0) {
                        const _e7891 = _a7887[_i7893];
                        if (_s7890[_i7893] > 0) _f7888[_e7891] = -1;
                        let _r7896 = (cands[_e7891] >= 0 ? cands[_e7891] : (cands[_e7891] = b.cands[_e7891])) & ~((2 << _s7890[_i7893]) - 1);
                        let _d7892 = 0;
                        V7895: for (; _r7896 !== 0; _r7896 &= _r7896 - 1) {
                          _d7892 = 31 - Math.clz32(_r7896 & -_r7896);
                          _f7888[_e7891] = _d7892;
                          for (let _j7894 = 0; _j7894 < _i7893; _j7894++) {
                            const _y7898 = _a7887[_j7894];
                            if (!((((arms(sp, cl, v_j) === 2) && (_f7888[_e7891] === 1)) && (_f7888[_y7898] === 1)))) continue;
                            if (!((bent(sp, _e7891, _y7898) === (clueAt(cl.piece, v_j) === 3)))) continue V7895;
                          }
                          for (let _j7894 = 0; _j7894 < _i7893; _j7894++) {
                            const _y7899 = _a7887[_j7894];
                            if (!(((((((_f7888[_e7891] === 1) && (_f7888[_y7899] === 1)) && !((b.grid[_e7891] !== 0))) && !((b.grid[_y7899] !== 0))) && !([sp.edgeEnds[2 * _e7891], sp.edgeEnds[2 * _e7891 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y7899], sp.edgeEnds[2 * _y7899 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg7900.of((sp.edgeEnds[2 * _y7899] === v_j ? sp.edgeEnds[2 * _y7899 + 1] : sp.edgeEnds[2 * _y7899])) === _eg7900.of((sp.edgeEnds[2 * _e7891] === v_j ? sp.edgeEnds[2 * _e7891 + 1] : sp.edgeEnds[2 * _e7891]))))) continue V7895;
                          }
                          break;
                        }
                        if (_r7896 === 0) {
                          _s7890[_i7893] = 0;
                          _i7893--;
                          continue;
                        }
                        _s7890[_i7893] = _d7892;
                        if (_i7893 === _a7887.length - 1) break;
                        _i7893++;
                        _s7890[_i7893] = 0;
                      }
                      if (_i7893 < 0) break;
                      let _q7901 = true;
                      Q7902: {
                        const _a7903 = sp.cellEdges[v_j];
                        for (let _i7904 = 0; _i7904 < _a7903.length; _i7904++) {
                          const v_y = _a7903[_i7904];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f7888[v_y] === _f7677[v_y]))) {
                            _q7901 = false;
                            break Q7902;
                          }
                        }
                      }
                      let _c7909: boolean = _q7901;
                      if (_c7909) {
                        let _g7905 = 0;
                        G7906: {
                          const _a7907 = sp.cellEdges[v_j];
                          for (let _i7908 = 0; _i7908 < _a7907.length; _i7908++) {
                            const v_y = _a7907[_i7908];
                            if (!((_f7888[v_y] === 1))) continue;
                            _g7905++;
                          }
                        }
                        _c7909 = (_g7905 === arms(sp, cl, v_j));
                      }
                      let _c7914: boolean = _c7909;
                      if (_c7914) {
                        let _q7910 = true;
                        Q7911: {
                          const _a7912 = sp.cellEdges[v_j];
                          for (let _i7913 = 0; _i7913 < _a7912.length; _i7913++) {
                            const v_y = _a7912[_i7913];
                            if (!((((_f7888[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg7900.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg7900.of(v_j)))) {
                              _q7910 = false;
                              break Q7911;
                            }
                          }
                        }
                        _c7914 = _q7910;
                      }
                      if (!(_c7914)) continue;
                      if (true) {
                        _q7885 = true;
                        break Q7886;
                      }
                    }
                  }
                  if (!(_q7885)) {
                    _q7869 = false;
                    break Q7870;
                  }
                }
              }
            }
            _c7915 = _q7869;
          }
          if (!(_c7915)) continue;
          if (!(true)) continue;
          _l7672 = _a7676;
          _y7673 = true;
          for (const _e7675 of _a7676) _p7671[_e7675] |= 1 << _f7677[_e7675];
        }
      }
      const v_A = ((((_p7671[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y7673 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g7919 !== _epoch) {
        _g7919 = _epoch;
        for (const _e7920 of _l7917) _p7916[_e7920] = 0;
        _y7918 = false;
        const _a7921 = sp.cellEdges[v_c];
        for (const _e7925 of _l7923) _f7922[_e7925] = -1;
        _l7923 = _a7921;
        let _i7927 = 0;
        _s7924[0] = 0;
        let _o7931 = _a7921.length === 0;
        for (;;) {
          if (_a7921.length === 0) {
            if (!_o7931) break;
            _o7931 = false;
          }
          while (_a7921.length > 0 && _i7927 >= 0) {
            const _e7925 = _a7921[_i7927];
            if (_s7924[_i7927] > 0) _f7922[_e7925] = -1;
            let _r7930 = (cands[_e7925] >= 0 ? cands[_e7925] : (cands[_e7925] = b.cands[_e7925])) & ~((2 << _s7924[_i7927]) - 1);
            let _d7926 = 0;
            V7929: for (; _r7930 !== 0; _r7930 &= _r7930 - 1) {
              _d7926 = 31 - Math.clz32(_r7930 & -_r7930);
              _f7922[_e7925] = _d7926;
              for (let _j7928 = 0; _j7928 < _i7927; _j7928++) {
                const _y7932 = _a7921[_j7928];
                if (!((((arms(sp, cl, v_c) === 2) && (_f7922[_e7925] === 1)) && (_f7922[_y7932] === 1)))) continue;
                if (!((bent(sp, _e7925, _y7932) === (clueAt(cl.piece, v_c) === 3)))) continue V7929;
              }
              for (let _j7928 = 0; _j7928 < _i7927; _j7928++) {
                const _y7933 = _a7921[_j7928];
                if (!(((((_f7922[_e7925] === 1) && (_f7922[_y7933] === 1)) && !((b.grid[_e7925] !== 0))) && !((b.grid[_y7933] !== 0))))) continue;
                if (!(!(_eg7506.of((sp.edgeEnds[2 * _y7933] === v_c ? sp.edgeEnds[2 * _y7933 + 1] : sp.edgeEnds[2 * _y7933])) === _eg7506.of((sp.edgeEnds[2 * _e7925] === v_c ? sp.edgeEnds[2 * _e7925 + 1] : sp.edgeEnds[2 * _e7925]))))) continue V7929;
              }
              break;
            }
            if (_r7930 === 0) {
              _s7924[_i7927] = 0;
              _i7927--;
              continue;
            }
            _s7924[_i7927] = _d7926;
            if (_i7927 === _a7921.length - 1) break;
            _i7927++;
            _s7924[_i7927] = 0;
          }
          if (_i7927 < 0) break;
          let _g7934 = 0;
          G7935: {
            const _a7936 = sp.cellEdges[v_c];
            for (let _i7937 = 0; _i7937 < _a7936.length; _i7937++) {
              const v_x = _a7936[_i7937];
              if (!((_f7922[v_x] === 1))) continue;
              _g7934++;
            }
          }
          let _c7942: boolean = (_g7934 === arms(sp, cl, v_c));
          if (_c7942) {
            let _q7938 = true;
            Q7939: {
              const _a7940 = sp.cellEdges[v_c];
              for (let _i7941 = 0; _i7941 < _a7940.length; _i7941++) {
                const v_x = _a7940[_i7941];
                if (!(((_f7922[v_x] === 1) && !((b.grid[v_x] !== 0))))) continue;
                if (!(!(_eg7506.of((sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x])) === v_G))) {
                  _q7938 = false;
                  break Q7939;
                }
              }
            }
            _c7942 = _q7938;
          }
          let _c8113: boolean = _c7942;
          if (_c8113) {
            let _q7943 = false;
            Q7944: {
              const _a7945 = sp.cellEdges[v_c];
              for (let _i7946 = 0; _i7946 < _a7945.length; _i7946++) {
                const v_x = _a7945[_i7946];
                if (!((_f7922[v_x] === 1))) continue;
                if ((v_K.includes(v_x))) {
                  _q7943 = true;
                  break Q7944;
                }
              }
            }
            let _c8112: boolean = _q7943;
            if (!_c8112) {
              _g7947.length = 0;
              G7948: {
                const _a8030 = sp.cellEdges[v_c];
                for (let _i8031 = 0; _i8031 < _a8030.length; _i8031++) {
                  const v_x = _a8030[_i8031];
                  if (!((_f7922[v_x] === 1))) continue;
                  const _t8032 = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  _g8033.length = 0;
                  G8034: {
                    const _a8072 = sp.cellEdges[_t8032];
                    for (let _i8073 = 0; _i8073 < _a8072.length; _i8073++) {
                      const v_y = _a8072[_i8073];
                      let _c8092: boolean = (v_y !== v_x);
                      if (_c8092) {
                        let _q8074 = false;
                        Q8075: {
                          const _a8076 = sp.cellEdges[_t8032];
                          for (const _e8080 of _l8078) _f8077[_e8080] = -1;
                          _l8078 = _a8076;
                          let _i8082 = 0;
                          _s8079[0] = 0;
                          let _o8086 = _a8076.length === 0;
                          for (;;) {
                            if (_a8076.length === 0) {
                              if (!_o8086) break;
                              _o8086 = false;
                            }
                            while (_a8076.length > 0 && _i8082 >= 0) {
                              const _e8080 = _a8076[_i8082];
                              if (_s8079[_i8082] > 0) _f8077[_e8080] = -1;
                              let _r8085 = (cands[_e8080] >= 0 ? cands[_e8080] : (cands[_e8080] = b.cands[_e8080])) & ~((2 << _s8079[_i8082]) - 1);
                              let _d8081 = 0;
                              V8084: for (; _r8085 !== 0; _r8085 &= _r8085 - 1) {
                                _d8081 = 31 - Math.clz32(_r8085 & -_r8085);
                                _f8077[_e8080] = _d8081;
                                if (_e8080 === v_x && _d8081 !== 1) continue;
                                if (_e8080 === v_y && _d8081 !== 1) continue;
                                for (let _j8083 = 0; _j8083 < _i8082; _j8083++) {
                                  const _y8087 = _a8076[_j8083];
                                  if (!((((arms(sp, cl, _t8032) === 2) && (_f8077[_e8080] === 1)) && (_f8077[_y8087] === 1)))) continue;
                                  if (!((bent(sp, _e8080, _y8087) === (clueAt(cl.piece, _t8032) === 3)))) continue V8084;
                                }
                                break;
                              }
                              if (_r8085 === 0) {
                                _s8079[_i8082] = 0;
                                _i8082--;
                                continue;
                              }
                              _s8079[_i8082] = _d8081;
                              if (_i8082 === _a8076.length - 1) break;
                              _i8082++;
                              _s8079[_i8082] = 0;
                            }
                            if (_i8082 < 0) break;
                            let _g8088 = 0;
                            G8089: {
                              const _a8090 = sp.cellEdges[_t8032];
                              for (let _i8091 = 0; _i8091 < _a8090.length; _i8091++) {
                                const v_z = _a8090[_i8091];
                                if (!((_f8077[v_z] === 1))) continue;
                                _g8088++;
                              }
                            }
                            if (!((_g8088 === arms(sp, cl, _t8032)))) continue;
                            if (true) {
                              _q8074 = true;
                              break Q8075;
                            }
                          }
                        }
                        _c8092 = _q8074;
                      }
                      if (!(_c8092)) continue;
                      const _t8093 = (sp.edgeEnds[2 * v_y] === _t8032 ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                      const _t8094 = minus(minus(v_P, sp.cellEdges[v_c]), sp.cellEdges[_t8032]);
                      const _eg8095 = edgeGroups(sp, _t8094);
                      _g8096.length = 0;
                      G8097: {
                        const _a8103 = _eg8095.of(_t8093);
                        for (let _i8104 = 0; _i8104 < _a8103.length; _i8104++) {
                          const v_t = _a8103[_i8104];
                          if (!((arms(sp, cl, v_t) > 1))) continue;
                          const _a8105 = sp.cellEdges[v_t];
                          for (let _i8106 = 0; _i8106 < _a8105.length; _i8106++) {
                            const v_y = _a8105[_i8106];
                            L8107: {
                              const v_z = (sp.edgeEnds[2 * v_y] === v_t ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y]);
                              if (!(((arms(sp, cl, v_z) === 1) && (v_U.includes(v_y))))) break L8107;
                              if (!_g8096.includes(v_z)) _g8096.push(v_z);
                            }
                          }
                        }
                      }
                      const _a8108 = union(_eg8095.of(_t8093), _g8096);
                      for (let _i8109 = 0; _i8109 < _a8108.length; _i8109++) {
                        const v_t = _a8108[_i8109];
                        if (!_g8033.includes(v_t)) _g8033.push(v_t);
                      }
                    }
                  }
                  const _a8110 = union(setOf(_t8032), _g8033);
                  for (let _i8111 = 0; _i8111 < _a8110.length; _i8111++) {
                    const v_t = _a8110[_i8111];
                    if (!_g7947.includes(v_t)) _g7947.push(v_t);
                  }
                }
              }
              _c8112 = (union(setOf(v_c), _g7947).length >= _h7668);
            }
            _c8113 = _c8112;
          }
          let _c8160: boolean = _c8113;
          if (_c8160) {
            let _q8114 = true;
            Q8115: {
              _g8116.length = 0;
              G8117: {
                const _a8120 = sp.cellEdges[v_c];
                for (let _i8121 = 0; _i8121 < _a8120.length; _i8121++) {
                  const v_x = _a8120[_i8121];
                  if (!((_f7922[v_x] === 1))) continue;
                  _g8116.push(v_x);
                }
              }
              const v_M = union(v_L, _g8116);
              const _eg8145 = edgeGroups(sp, v_M);
              const _a8122 = sp.cellEdges[v_c];
              for (let _i8123 = 0; _i8123 < _a8122.length; _i8123++) {
                const v_x = _a8122[_i8123];
                L8124: {
                  const v_j = (sp.edgeEnds[2 * v_x] === v_c ? sp.edgeEnds[2 * v_x + 1] : sp.edgeEnds[2 * v_x]);
                  let _c8129: boolean = (v_j !== v_c);
                  if (_c8129) {
                    let _q8125 = false;
                    Q8126: {
                      const _a8127 = sp.cellEdges[v_j];
                      for (let _i8128 = 0; _i8128 < _a8127.length; _i8128++) {
                        const v_y = _a8127[_i8128];
                        if ((!((b.grid[v_y] !== 0)) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) {
                          _q8125 = true;
                          break Q8126;
                        }
                      }
                    }
                    _c8129 = _q8125;
                  }
                  if (!(_c8129)) break L8124;
                  let _q8130 = false;
                  Q8131: {
                    const _a8132 = sp.cellEdges[v_j];
                    for (const _e8136 of _l8134) _f8133[_e8136] = -1;
                    _l8134 = _a8132;
                    let _i8138 = 0;
                    _s8135[0] = 0;
                    let _o8142 = _a8132.length === 0;
                    for (;;) {
                      if (_a8132.length === 0) {
                        if (!_o8142) break;
                        _o8142 = false;
                      }
                      while (_a8132.length > 0 && _i8138 >= 0) {
                        const _e8136 = _a8132[_i8138];
                        if (_s8135[_i8138] > 0) _f8133[_e8136] = -1;
                        let _r8141 = (cands[_e8136] >= 0 ? cands[_e8136] : (cands[_e8136] = b.cands[_e8136])) & ~((2 << _s8135[_i8138]) - 1);
                        let _d8137 = 0;
                        V8140: for (; _r8141 !== 0; _r8141 &= _r8141 - 1) {
                          _d8137 = 31 - Math.clz32(_r8141 & -_r8141);
                          _f8133[_e8136] = _d8137;
                          for (let _j8139 = 0; _j8139 < _i8138; _j8139++) {
                            const _y8143 = _a8132[_j8139];
                            if (!((((arms(sp, cl, v_j) === 2) && (_f8133[_e8136] === 1)) && (_f8133[_y8143] === 1)))) continue;
                            if (!((bent(sp, _e8136, _y8143) === (clueAt(cl.piece, v_j) === 3)))) continue V8140;
                          }
                          for (let _j8139 = 0; _j8139 < _i8138; _j8139++) {
                            const _y8144 = _a8132[_j8139];
                            if (!(((((((_f8133[_e8136] === 1) && (_f8133[_y8144] === 1)) && !((b.grid[_e8136] !== 0))) && !((b.grid[_y8144] !== 0))) && !([sp.edgeEnds[2 * _e8136], sp.edgeEnds[2 * _e8136 + 1]].includes(v_c))) && !([sp.edgeEnds[2 * _y8144], sp.edgeEnds[2 * _y8144 + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8145.of((sp.edgeEnds[2 * _y8144] === v_j ? sp.edgeEnds[2 * _y8144 + 1] : sp.edgeEnds[2 * _y8144])) === _eg8145.of((sp.edgeEnds[2 * _e8136] === v_j ? sp.edgeEnds[2 * _e8136 + 1] : sp.edgeEnds[2 * _e8136]))))) continue V8140;
                          }
                          break;
                        }
                        if (_r8141 === 0) {
                          _s8135[_i8138] = 0;
                          _i8138--;
                          continue;
                        }
                        _s8135[_i8138] = _d8137;
                        if (_i8138 === _a8132.length - 1) break;
                        _i8138++;
                        _s8135[_i8138] = 0;
                      }
                      if (_i8138 < 0) break;
                      let _q8146 = true;
                      Q8147: {
                        const _a8148 = sp.cellEdges[v_j];
                        for (let _i8149 = 0; _i8149 < _a8148.length; _i8149++) {
                          const v_y = _a8148[_i8149];
                          if (!(([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c)))) continue;
                          if (!((_f8133[v_y] === _f7922[v_y]))) {
                            _q8146 = false;
                            break Q8147;
                          }
                        }
                      }
                      let _c8154: boolean = _q8146;
                      if (_c8154) {
                        let _g8150 = 0;
                        G8151: {
                          const _a8152 = sp.cellEdges[v_j];
                          for (let _i8153 = 0; _i8153 < _a8152.length; _i8153++) {
                            const v_y = _a8152[_i8153];
                            if (!((_f8133[v_y] === 1))) continue;
                            _g8150++;
                          }
                        }
                        _c8154 = (_g8150 === arms(sp, cl, v_j));
                      }
                      let _c8159: boolean = _c8154;
                      if (_c8159) {
                        let _q8155 = true;
                        Q8156: {
                          const _a8157 = sp.cellEdges[v_j];
                          for (let _i8158 = 0; _i8158 < _a8157.length; _i8158++) {
                            const v_y = _a8157[_i8158];
                            if (!((((_f8133[v_y] === 1) && !((b.grid[v_y] !== 0))) && !([sp.edgeEnds[2 * v_y], sp.edgeEnds[2 * v_y + 1]].includes(v_c))))) continue;
                            if (!(!(_eg8145.of((sp.edgeEnds[2 * v_y] === v_j ? sp.edgeEnds[2 * v_y + 1] : sp.edgeEnds[2 * v_y])) === _eg8145.of(v_j)))) {
                              _q8155 = false;
                              break Q8156;
                            }
                          }
                        }
                        _c8159 = _q8155;
                      }
                      if (!(_c8159)) continue;
                      if (true) {
                        _q8130 = true;
                        break Q8131;
                      }
                    }
                  }
                  if (!(_q8130)) {
                    _q8114 = false;
                    break Q8115;
                  }
                }
              }
            }
            _c8160 = _q8114;
          }
          if (!(_c8160)) continue;
          if (!(true)) continue;
          _l7917 = _a7921;
          _y7918 = true;
          for (const _e7920 of _a7921) _p7916[_e7920] |= 1 << _f7922[_e7920];
        }
      }
      L8161: {
        const v_B = ((((_p7916[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y7918 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L8161;
        facts.length = 0;
        changed = false;
        let _c8163: boolean = (v_A || v_B);
        if (_c8163) {
          let _c8162: boolean = !(!(v_A));
          if (!_c8162) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c8162 = true;
          }
          _c8163 = _c8162;
        }
        let _c8165: boolean = _c8163;
        if (_c8165) {
          let _c8164: boolean = !(!(v_B));
          if (!_c8164) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c8164 = true;
          }
          _c8165 = _c8164;
        }
        if (!(_c8165)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), U: v_U.slice(), P: v_P.slice(), c: v_c, G: v_G.slice(), K: v_K.slice(), e: v_e, A: v_A, B: v_B }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const armsKept = keptStore<number>();

/** `arms(c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function arms(_sp: GridSpace, cl: Dealt, v_c: number): number {
  const _kept: Kept<number> = armsKept.board(cl);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _g28 = 0;
  G29: {
    for (let _i30 = 0; _i30 < 1; _i30++) {
      const v_k = v_c;
      if (!((clueAt(cl.piece, v_k) >= 3))) continue;
      _g28++;
    }
  }
  const _made = (clueAt(cl.piece, v_c) - _g28);
  _kept[v_c] = _made;
  return _made;
}

const bentKept = keptStore<Kept<boolean>>();

/** `bent(e, x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function bent(sp: GridSpace, v_e: number, v_x: number): boolean {
  const _kept: Kept<Kept<boolean>> = bentKept.board(sp);
  const _kept1 = (_kept[v_e] ??= []);
  if (_kept1[v_x] !== undefined) return _kept1[v_x];
  let _q31 = false;
  Q32: {
    const _a33 = sp.edgeFaces[v_e];
    for (let _i34 = 0; _i34 < _a33.length; _i34++) {
      const v_f = _a33[_i34];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q31 = true;
        break Q32;
      }
    }
  }
  const _made = _q31;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
