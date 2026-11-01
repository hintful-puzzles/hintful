// Compiled by `npm run describe` from src/games/sokoban/sokoban.description.yaml: edit that, not this.

import { type GridSpace } from "../../engine/describe-runtime.ts";
import type { PositionRules } from "../../engine/position-runtime.ts";

/** The space's units, for `describedSpace`: the description's. */
export const units: readonly string[] = [];

/** The position's layers, in the description's order. */
export const layers = ["ground","target","barrel","label","man"] as const;

/** A position: a value a cell in each layer. */
export type Position = {
  readonly ground: Int32Array;
  readonly target: Int32Array;
  readonly barrel: Int32Array;
  readonly label: Int32Array;
  readonly man: Int32Array;
};

/** The board deals nothing the rules read beyond its grid. */
export type Dealt = Readonly<Record<string, never>>;

export interface StepMove {
  readonly move: "step";
  readonly b: number;
  readonly t: number;
}

export interface WalkMove {
  readonly move: "walk";
  readonly t: number;
}

export interface PushMove {
  readonly move: "push";
  readonly s: number;
  readonly o: number;
  readonly t: number;
}

/** A move: its name and its binding. */
export type Move = StepMove | WalkMove | PushMove;

/** The description's dead-end claims, by id. */
export type DeadEndId = "dead" | "jammed";

/** The claims in the order `deadEnd` tries them, the description's. */
export const deadEnds: readonly DeadEndId[] = ["dead", "jammed"];

/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers
 * only the first that holds. */
export function claims(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {
  return {
    dead: (p) => {
      const _fix133 = new Uint8Array(sp.cells.length);
      for (let _grew135 = true; _grew135; ) {
        _grew135 = false;
        for (let _c134 = 0; _c134 < sp.cells.length; _c134++) {
          if (_fix133[_c134] === 1) continue;
          let _c144 = (p.ground[_c134] !== 1);
          if (_c144) {
            let _c143 = (p.target[_c134] === 1);
            if (!_c143) {
              let _q136 = false;
              Q137: {
                const _a138 = sp.adj4[_c134];
                for (let _i139 = 0; _i139 < _a138.length; _i139++) {
                  const v_n = _a138[_i139];
                  let _c142 = (p.ground[v_n] !== 1);
                  if (_c142) {
                    const _t140 = ((2 * (_c134 % sp.w)) - (v_n % sp.w));
                    const _t141 = ((2 * ((_c134 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c142 = ((_t140 >= 0 && _t140 < sp.w && _t141 >= 0 && _t141 < sp.h) && (p.ground[(_t141 * sp.w + _t140)] !== 1));
                  }
                  if (!(_c142)) continue;
                  if ((_fix133[v_n] === 1)) {
                    _q136 = true;
                    break Q137;
                  }
                }
              }
              _c143 = _q136;
            }
            _c144 = _c143;
          }
          if (_c144) {
            _fix133[_c134] = 1;
            _grew135 = true;
          }
        }
      }
      let _q116 = true;
      Q117: {
        const _a118 = sp.cells;
        for (let _i119 = 0; _i119 < _a118.length; _i119++) {
          const v_c = _a118[_i119];
          if (!((p.ground[v_c] < 2))) {
            _q116 = false;
            break Q117;
          }
        }
      }
      let _c128 = _q116;
      if (_c128) {
        let _g120 = 0;
        G121: {
          const _a122 = sp.cells;
          for (let _i123 = 0; _i123 < _a122.length; _i123++) {
            const v_c = _a122[_i123];
            if (!((p.barrel[v_c] === 1))) continue;
            _g120++;
          }
        }
        let _g124 = 0;
        G125: {
          const _a126 = sp.cells;
          for (let _i127 = 0; _i127 < _a126.length; _i127++) {
            const v_c = _a126[_i127];
            if (!((p.target[v_c] === 1))) continue;
            _g124++;
          }
        }
        _c128 = (_g120 <= _g124);
      }
      let _c145 = _c128;
      if (_c145) {
        let _q129 = false;
        Q130: {
          const _a131 = sp.cells;
          for (let _i132 = 0; _i132 < _a131.length; _i132++) {
            const v_c = _a131[_i132];
            if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
            if (!((_fix133[v_c] === 1))) {
              _q129 = true;
              break Q130;
            }
          }
        }
        _c145 = _q129;
      }
      return _c145;
    },
    jammed: (p) => {
      const _fix173 = new Uint8Array(sp.cells.length);
      for (let _grew175 = true; _grew175; ) {
        _grew175 = false;
        for (let _c174 = 0; _c174 < sp.cells.length; _c174++) {
          if (_fix173[_c174] === 1) continue;
          let _c184 = (p.ground[_c174] !== 1);
          if (_c184) {
            let _c183 = (p.target[_c174] === 1);
            if (!_c183) {
              let _q176 = false;
              Q177: {
                const _a178 = sp.adj4[_c174];
                for (let _i179 = 0; _i179 < _a178.length; _i179++) {
                  const v_n = _a178[_i179];
                  let _c182 = (p.ground[v_n] !== 1);
                  if (_c182) {
                    const _t180 = ((2 * (_c174 % sp.w)) - (v_n % sp.w));
                    const _t181 = ((2 * ((_c174 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c182 = ((_t180 >= 0 && _t180 < sp.w && _t181 >= 0 && _t181 < sp.h) && (p.ground[(_t181 * sp.w + _t180)] !== 1));
                  }
                  if (!(_c182)) continue;
                  if ((_fix173[v_n] === 1)) {
                    _q176 = true;
                    break Q177;
                  }
                }
              }
              _c183 = _q176;
            }
            _c184 = _c183;
          }
          if (_c184) {
            _fix173[_c174] = 1;
            _grew175 = true;
          }
        }
      }
      const _fix163 = new Uint8Array(sp.cells.length);
      for (let _grew165 = true; _grew165; ) {
        _grew165 = false;
        for (let _c164 = 0; _c164 < sp.cells.length; _c164++) {
          if (_fix163[_c164] === 1) continue;
          let _q166 = false;
          Q167: {
            const _a168 = sp.adj4[_c164];
            for (let _i169 = 0; _i169 < _a168.length; _i169++) {
              const v_n = _a168[_i169];
              let _c172 = (p.ground[v_n] !== 1);
              if (_c172) {
                const _t170 = ((2 * (_c164 % sp.w)) - (v_n % sp.w));
                const _t171 = ((2 * ((_c164 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                _c172 = ((_t170 >= 0 && _t170 < sp.w && _t171 >= 0 && _t171 < sp.h) && (p.ground[(_t171 * sp.w + _t170)] !== 1));
              }
              if (!(_c172)) continue;
              const v_a = (((2 * ((_c164 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + ((2 * (_c164 % sp.w)) - (v_n % sp.w)));
              if (((((_fix173[v_n] === 1) || (_fix173[v_a] === 1)) && ((p.barrel[v_n] === 0) || (_fix163[v_n] === 1))) && ((p.barrel[v_a] === 0) || (_fix163[v_a] === 1)))) {
                _q166 = true;
                break Q167;
              }
            }
          }
          if (_q166) {
            _fix163[_c164] = 1;
            _grew165 = true;
          }
        }
      }
      let _q146 = true;
      Q147: {
        const _a148 = sp.cells;
        for (let _i149 = 0; _i149 < _a148.length; _i149++) {
          const v_c = _a148[_i149];
          if (!((p.ground[v_c] < 2))) {
            _q146 = false;
            break Q147;
          }
        }
      }
      let _c158 = _q146;
      if (_c158) {
        let _g150 = 0;
        G151: {
          const _a152 = sp.cells;
          for (let _i153 = 0; _i153 < _a152.length; _i153++) {
            const v_c = _a152[_i153];
            if (!((p.barrel[v_c] === 1))) continue;
            _g150++;
          }
        }
        let _g154 = 0;
        G155: {
          const _a156 = sp.cells;
          for (let _i157 = 0; _i157 < _a156.length; _i157++) {
            const v_c = _a156[_i157];
            if (!((p.target[v_c] === 1))) continue;
            _g154++;
          }
        }
        _c158 = (_g150 <= _g154);
      }
      let _c185 = _c158;
      if (_c185) {
        let _q159 = false;
        Q160: {
          const _a161 = sp.cells;
          for (let _i162 = 0; _i162 < _a161.length; _i162++) {
            const v_c = _a161[_i162];
            if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
            if (!((_fix163[v_c] === 1))) {
              _q159 = true;
              break Q160;
            }
          }
        }
        _c185 = _q159;
      }
      return _c185;
    },
  };
}

/** The cells each claim holds of, as a banner outlines them: none where the
 * claim does not hold, or names no cell. */
export function claimWitnesses(sp: GridSpace, _cl: Dealt, _variations: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {
  return {
    dead: (p) => {
      const _fix201 = new Uint8Array(sp.cells.length);
      for (let _grew203 = true; _grew203; ) {
        _grew203 = false;
        for (let _c202 = 0; _c202 < sp.cells.length; _c202++) {
          if (_fix201[_c202] === 1) continue;
          let _c212 = (p.ground[_c202] !== 1);
          if (_c212) {
            let _c211 = (p.target[_c202] === 1);
            if (!_c211) {
              let _q204 = false;
              Q205: {
                const _a206 = sp.adj4[_c202];
                for (let _i207 = 0; _i207 < _a206.length; _i207++) {
                  const v_n = _a206[_i207];
                  let _c210 = (p.ground[v_n] !== 1);
                  if (_c210) {
                    const _t208 = ((2 * (_c202 % sp.w)) - (v_n % sp.w));
                    const _t209 = ((2 * ((_c202 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c210 = ((_t208 >= 0 && _t208 < sp.w && _t209 >= 0 && _t209 < sp.h) && (p.ground[(_t209 * sp.w + _t208)] !== 1));
                  }
                  if (!(_c210)) continue;
                  if ((_fix201[v_n] === 1)) {
                    _q204 = true;
                    break Q205;
                  }
                }
              }
              _c211 = _q204;
            }
            _c212 = _c211;
          }
          if (_c212) {
            _fix201[_c202] = 1;
            _grew203 = true;
          }
        }
      }
      const at: number[] = [];
      let _q186 = true;
      Q187: {
        const _a188 = sp.cells;
        for (let _i189 = 0; _i189 < _a188.length; _i189++) {
          const v_c = _a188[_i189];
          if (!((p.ground[v_c] < 2))) {
            _q186 = false;
            break Q187;
          }
        }
      }
      let _c198 = _q186;
      if (_c198) {
        let _g190 = 0;
        G191: {
          const _a192 = sp.cells;
          for (let _i193 = 0; _i193 < _a192.length; _i193++) {
            const v_c = _a192[_i193];
            if (!((p.barrel[v_c] === 1))) continue;
            _g190++;
          }
        }
        let _g194 = 0;
        G195: {
          const _a196 = sp.cells;
          for (let _i197 = 0; _i197 < _a196.length; _i197++) {
            const v_c = _a196[_i197];
            if (!((p.target[v_c] === 1))) continue;
            _g194++;
          }
        }
        _c198 = (_g190 <= _g194);
      }
      if (!(_c198)) return at;
      const _a199 = sp.cells;
      for (let _i200 = 0; _i200 < _a199.length; _i200++) {
        const v_c = _a199[_i200];
        if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
        if (!((_fix201[v_c] === 1))) at.push(v_c);
      }
      return at;
    },
    jammed: (p) => {
      const _fix238 = new Uint8Array(sp.cells.length);
      for (let _grew240 = true; _grew240; ) {
        _grew240 = false;
        for (let _c239 = 0; _c239 < sp.cells.length; _c239++) {
          if (_fix238[_c239] === 1) continue;
          let _c249 = (p.ground[_c239] !== 1);
          if (_c249) {
            let _c248 = (p.target[_c239] === 1);
            if (!_c248) {
              let _q241 = false;
              Q242: {
                const _a243 = sp.adj4[_c239];
                for (let _i244 = 0; _i244 < _a243.length; _i244++) {
                  const v_n = _a243[_i244];
                  let _c247 = (p.ground[v_n] !== 1);
                  if (_c247) {
                    const _t245 = ((2 * (_c239 % sp.w)) - (v_n % sp.w));
                    const _t246 = ((2 * ((_c239 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                    _c247 = ((_t245 >= 0 && _t245 < sp.w && _t246 >= 0 && _t246 < sp.h) && (p.ground[(_t246 * sp.w + _t245)] !== 1));
                  }
                  if (!(_c247)) continue;
                  if ((_fix238[v_n] === 1)) {
                    _q241 = true;
                    break Q242;
                  }
                }
              }
              _c248 = _q241;
            }
            _c249 = _c248;
          }
          if (_c249) {
            _fix238[_c239] = 1;
            _grew240 = true;
          }
        }
      }
      const _fix228 = new Uint8Array(sp.cells.length);
      for (let _grew230 = true; _grew230; ) {
        _grew230 = false;
        for (let _c229 = 0; _c229 < sp.cells.length; _c229++) {
          if (_fix228[_c229] === 1) continue;
          let _q231 = false;
          Q232: {
            const _a233 = sp.adj4[_c229];
            for (let _i234 = 0; _i234 < _a233.length; _i234++) {
              const v_n = _a233[_i234];
              let _c237 = (p.ground[v_n] !== 1);
              if (_c237) {
                const _t235 = ((2 * (_c229 % sp.w)) - (v_n % sp.w));
                const _t236 = ((2 * ((_c229 / sp.w) | 0)) - ((v_n / sp.w) | 0));
                _c237 = ((_t235 >= 0 && _t235 < sp.w && _t236 >= 0 && _t236 < sp.h) && (p.ground[(_t236 * sp.w + _t235)] !== 1));
              }
              if (!(_c237)) continue;
              const v_a = (((2 * ((_c229 / sp.w) | 0)) - ((v_n / sp.w) | 0)) * sp.w + ((2 * (_c229 % sp.w)) - (v_n % sp.w)));
              if (((((_fix238[v_n] === 1) || (_fix238[v_a] === 1)) && ((p.barrel[v_n] === 0) || (_fix228[v_n] === 1))) && ((p.barrel[v_a] === 0) || (_fix228[v_a] === 1)))) {
                _q231 = true;
                break Q232;
              }
            }
          }
          if (_q231) {
            _fix228[_c229] = 1;
            _grew230 = true;
          }
        }
      }
      const at: number[] = [];
      let _q213 = true;
      Q214: {
        const _a215 = sp.cells;
        for (let _i216 = 0; _i216 < _a215.length; _i216++) {
          const v_c = _a215[_i216];
          if (!((p.ground[v_c] < 2))) {
            _q213 = false;
            break Q214;
          }
        }
      }
      let _c225 = _q213;
      if (_c225) {
        let _g217 = 0;
        G218: {
          const _a219 = sp.cells;
          for (let _i220 = 0; _i220 < _a219.length; _i220++) {
            const v_c = _a219[_i220];
            if (!((p.barrel[v_c] === 1))) continue;
            _g217++;
          }
        }
        let _g221 = 0;
        G222: {
          const _a223 = sp.cells;
          for (let _i224 = 0; _i224 < _a223.length; _i224++) {
            const v_c = _a223[_i224];
            if (!((p.target[v_c] === 1))) continue;
            _g221++;
          }
        }
        _c225 = (_g217 <= _g221);
      }
      if (!(_c225)) return at;
      const _a226 = sp.cells;
      for (let _i227 = 0; _i227 < _a226.length; _i227++) {
        const v_c = _a226[_i227];
        if (!(((p.barrel[v_c] === 1) && (p.target[v_c] === 0)))) continue;
        if (!((_fix228[v_c] === 1))) at.push(v_c);
      }
      return at;
    },
  };
}

/** The rules on one board: its grid, what it deals, and the variations it
 * has on. */
export function rules(sp: GridSpace, cl: Dealt, variations: readonly string[]): PositionRules<Position, Move, DeadEndId> {
  function stepMoves(p: Position, into: Move[]): void {
    const _a10 = sp.cells;
    for (let _i11 = 0; _i11 < _a10.length; _i11++) {
      const v_b = _a10[_i11];
      if (!((p.man[v_b] === 1))) continue;
      const _a12 = sp.adj8[v_b];
      for (let _i13 = 0; _i13 < _a12.length; _i13++) {
        const v_t = _a12[_i13];
        let _c18 = ((p.ground[v_t] === 0) && (p.barrel[v_t] === 0));
        if (_c18) {
          let _c15 = (((v_t % sp.w) === (v_b % sp.w)) || (((v_t / sp.w) | 0) === ((v_b / sp.w) | 0)));
          if (!_c15) {
            const _t14 = (((v_b / sp.w) | 0) * sp.w + (v_t % sp.w));
            _c15 = ((p.ground[_t14] === 0) && (p.barrel[_t14] === 0));
          }
          let _c17 = _c15;
          if (!_c17) {
            const _t16 = (((v_t / sp.w) | 0) * sp.w + (v_b % sp.w));
            _c17 = ((p.ground[_t16] === 0) && (p.barrel[_t16] === 0));
          }
          _c18 = _c17;
        }
        if (!(_c18)) continue;
        into.push({ move: "step", b: v_b, t: v_t });
      }
    }
  }

  function stepLegal(p: Position, m: StepMove): boolean {
    const v_b = m.b;
    const v_t = m.t;
    if (!(Number.isInteger(v_b) && v_b >= 0 && v_b < sp.cells.length)) return false;
    if (!((p.man[v_b] === 1))) return false;
    if (!sp.adj8[v_b].includes(v_t)) return false;
    let _c23 = ((p.ground[v_t] === 0) && (p.barrel[v_t] === 0));
    if (_c23) {
      let _c20 = (((v_t % sp.w) === (v_b % sp.w)) || (((v_t / sp.w) | 0) === ((v_b / sp.w) | 0)));
      if (!_c20) {
        const _t19 = (((v_b / sp.w) | 0) * sp.w + (v_t % sp.w));
        _c20 = ((p.ground[_t19] === 0) && (p.barrel[_t19] === 0));
      }
      let _c22 = _c20;
      if (!_c22) {
        const _t21 = (((v_t / sp.w) | 0) * sp.w + (v_b % sp.w));
        _c22 = ((p.ground[_t21] === 0) && (p.barrel[_t21] === 0));
      }
      _c23 = _c22;
    }
    if (!(_c23)) return false;
    return true;
  }

  function stepPlay(p: Position, m: StepMove): Position {
    const v_b = m.b;
    const v_t = m.t;
    const q: Position = { ...p, man: p.man.slice() };
    {
      const v_c = v_b;
      q.man[v_c] = 0;
    }
    {
      const v_c = v_t;
      q.man[v_c] = 1;
    }
    return q;
  }

  function walkMoves(p: Position, into: Move[]): void {
    const _fix37 = new Uint8Array(sp.cells.length);
    for (let _grew39 = true; _grew39; ) {
      _grew39 = false;
      for (let _c38 = 0; _c38 < sp.cells.length; _c38++) {
        if (_fix37[_c38] === 1) continue;
        let _c45 = (p.man[_c38] === 1);
        if (!_c45) {
          let _c44 = ((p.ground[_c38] === 0) && (p.barrel[_c38] === 0));
          if (_c44) {
            let _q40 = false;
            Q41: {
              const _a42 = sp.adj4[_c38];
              for (let _i43 = 0; _i43 < _a42.length; _i43++) {
                const v_n = _a42[_i43];
                if ((_fix37[v_n] === 1)) {
                  _q40 = true;
                  break Q41;
                }
              }
            }
            _c44 = _q40;
          }
          _c45 = _c44;
        }
        if (_c45) {
          _fix37[_c38] = 1;
          _grew39 = true;
        }
      }
    }
    const _a35 = sp.cells;
    for (let _i36 = 0; _i36 < _a35.length; _i36++) {
      const v_t = _a35[_i36];
      if (!(((p.man[v_t] === 0) && (_fix37[v_t] === 1)))) continue;
      into.push({ move: "walk", t: v_t });
    }
  }

  function walkLegal(p: Position, m: WalkMove): boolean {
    const v_t = m.t;
    const _fix46 = new Uint8Array(sp.cells.length);
    for (let _grew48 = true; _grew48; ) {
      _grew48 = false;
      for (let _c47 = 0; _c47 < sp.cells.length; _c47++) {
        if (_fix46[_c47] === 1) continue;
        let _c54 = (p.man[_c47] === 1);
        if (!_c54) {
          let _c53 = ((p.ground[_c47] === 0) && (p.barrel[_c47] === 0));
          if (_c53) {
            let _q49 = false;
            Q50: {
              const _a51 = sp.adj4[_c47];
              for (let _i52 = 0; _i52 < _a51.length; _i52++) {
                const v_n = _a51[_i52];
                if ((_fix46[v_n] === 1)) {
                  _q49 = true;
                  break Q50;
                }
              }
            }
            _c53 = _q49;
          }
          _c54 = _c53;
        }
        if (_c54) {
          _fix46[_c47] = 1;
          _grew48 = true;
        }
      }
    }
    if (!(Number.isInteger(v_t) && v_t >= 0 && v_t < sp.cells.length)) return false;
    if (!(((p.man[v_t] === 0) && (_fix46[v_t] === 1)))) return false;
    return true;
  }

  function walkPlay(p: Position, m: WalkMove): Position {
    const v_t = m.t;
    const q: Position = { ...p, man: p.man.slice() };
    {
      const _a55 = sp.cells;
      for (let _i56 = 0; _i56 < _a55.length; _i56++) {
        const v_c = _a55[_i56];
        if (!((p.man[v_c] === 1))) continue;
        q.man[v_c] = 0;
      }
    }
    {
      const v_c = v_t;
      q.man[v_c] = 1;
    }
    return q;
  }

  function pushMoves(p: Position, into: Move[]): void {
    const _fix76 = new Uint8Array(sp.cells.length);
    for (let _grew78 = true; _grew78; ) {
      _grew78 = false;
      for (let _c77 = 0; _c77 < sp.cells.length; _c77++) {
        if (_fix76[_c77] === 1) continue;
        let _c84 = (p.man[_c77] === 1);
        if (!_c84) {
          let _c83 = ((p.ground[_c77] === 0) && (p.barrel[_c77] === 0));
          if (_c83) {
            let _q79 = false;
            Q80: {
              const _a81 = sp.adj4[_c77];
              for (let _i82 = 0; _i82 < _a81.length; _i82++) {
                const v_n = _a81[_i82];
                if ((_fix76[v_n] === 1)) {
                  _q79 = true;
                  break Q80;
                }
              }
            }
            _c83 = _q79;
          }
          _c84 = _c83;
        }
        if (_c84) {
          _fix76[_c77] = 1;
          _grew78 = true;
        }
      }
    }
    const _a74 = sp.cells;
    for (let _i75 = 0; _i75 < _a74.length; _i75++) {
      const v_s = _a74[_i75];
      if (!((_fix76[v_s] === 1))) continue;
      const _a85 = sp.adj4[v_s];
      for (let _i86 = 0; _i86 < _a85.length; _i86++) {
        const v_o = _a85[_i86];
        let _c89 = (p.barrel[v_o] === 1);
        if (_c89) {
          const _t87 = ((2 * (v_o % sp.w)) - (v_s % sp.w));
          const _t88 = ((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0));
          _c89 = (_t87 >= 0 && _t87 < sp.w && _t88 >= 0 && _t88 < sp.h);
        }
        if (!(_c89)) continue;
        L90: {
          const v_t = (((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_s % sp.w)));
          if (!(((p.barrel[v_t] === 0) && (p.ground[v_t] !== 1)))) break L90;
          into.push({ move: "push", s: v_s, o: v_o, t: v_t });
        }
      }
    }
  }

  function pushLegal(p: Position, m: PushMove): boolean {
    const v_s = m.s;
    const v_o = m.o;
    const v_t = m.t;
    const _fix91 = new Uint8Array(sp.cells.length);
    for (let _grew93 = true; _grew93; ) {
      _grew93 = false;
      for (let _c92 = 0; _c92 < sp.cells.length; _c92++) {
        if (_fix91[_c92] === 1) continue;
        let _c99 = (p.man[_c92] === 1);
        if (!_c99) {
          let _c98 = ((p.ground[_c92] === 0) && (p.barrel[_c92] === 0));
          if (_c98) {
            let _q94 = false;
            Q95: {
              const _a96 = sp.adj4[_c92];
              for (let _i97 = 0; _i97 < _a96.length; _i97++) {
                const v_n = _a96[_i97];
                if ((_fix91[v_n] === 1)) {
                  _q94 = true;
                  break Q95;
                }
              }
            }
            _c98 = _q94;
          }
          _c99 = _c98;
        }
        if (_c99) {
          _fix91[_c92] = 1;
          _grew93 = true;
        }
      }
    }
    if (!(Number.isInteger(v_s) && v_s >= 0 && v_s < sp.cells.length)) return false;
    if (!((_fix91[v_s] === 1))) return false;
    if (!sp.adj4[v_s].includes(v_o)) return false;
    let _c102 = (p.barrel[v_o] === 1);
    if (_c102) {
      const _t100 = ((2 * (v_o % sp.w)) - (v_s % sp.w));
      const _t101 = ((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0));
      _c102 = (_t100 >= 0 && _t100 < sp.w && _t101 >= 0 && _t101 < sp.h);
    }
    if (!(_c102)) return false;
    if (v_t !== (((2 * ((v_o / sp.w) | 0)) - ((v_s / sp.w) | 0)) * sp.w + ((2 * (v_o % sp.w)) - (v_s % sp.w)))) return false;
    if (!(((p.barrel[v_t] === 0) && (p.ground[v_t] !== 1)))) return false;
    return true;
  }

  function pushPlay(p: Position, m: PushMove): Position {
    const v_o = m.o;
    const v_t = m.t;
    const q: Position = { ...p, ground: p.ground.slice(), barrel: p.barrel.slice(), label: p.label.slice(), man: p.man.slice() };
    {
      const _a103 = sp.cells;
      for (let _i104 = 0; _i104 < _a103.length; _i104++) {
        const v_c = _a103[_i104];
        if (!((p.man[v_c] === 1))) continue;
        q.man[v_c] = 0;
      }
    }
    {
      const v_c = v_o;
      q.man[v_c] = 1;
      q.barrel[v_c] = 0;
      q.label[v_c] = 0;
    }
    {
      L105: {
        const v_c = v_t;
        if (!((p.ground[v_t] === 0))) break L105;
        q.barrel[v_c] = 1;
        q.label[v_c] = p.label[v_o];
      }
    }
    {
      L106: {
        const v_c = v_t;
        if (!((p.ground[v_t] === 2))) break L106;
        q.ground[v_c] = 0;
      }
    }
    return q;
  }

  function finished(p: Position): boolean {
    {
      let _q107 = true;
      Q108: {
        const _a109 = sp.cells;
        for (let _i110 = 0; _i110 < _a109.length; _i110++) {
          const v_c = _a109[_i110];
          if (!(((p.barrel[v_c] === 0) || (p.target[v_c] === 1)))) {
            _q107 = false;
            break Q108;
          }
        }
      }
      let _c115 = _q107;
      if (!_c115) {
        let _q111 = true;
        Q112: {
          const _a113 = sp.cells;
          for (let _i114 = 0; _i114 < _a113.length; _i114++) {
            const v_c = _a113[_i114];
            if (!(((p.ground[v_c] < 2) && ((p.target[v_c] === 0) || (p.barrel[v_c] === 1))))) {
              _q111 = false;
              break Q112;
            }
          }
        }
        _c115 = _q111;
      }
      if (!(_c115)) return false;
    }
    return true;
  }

  function lost(_p: Position): boolean {
    return false;
  }

  const holds = claims(sp, cl, variations);
  function deadEnd(p: Position): DeadEndId | null {
    for (const id of deadEnds) if (holds[id](p)) return id;
    return null;
  }
  const at = claimWitnesses(sp, cl, variations);

  return {
    moves: (p) => {
      const into: Move[] = [];
      stepMoves(p, into);
      walkMoves(p, into);
      pushMoves(p, into);
      return into;
    },
    legal: (p, m) => {
      switch (m.move) {
        case "step": return stepLegal(p, m);
        case "walk": return walkLegal(p, m);
        case "push": return pushLegal(p, m);
      }
    },
    play: (p, m) => {
      switch (m.move) {
        case "step": return stepPlay(p, m);
        case "walk": return walkPlay(p, m);
        case "push": return pushPlay(p, m);
      }
    },
    finished,
    lost,
    deadEnd,
    witnesses: (id, p) => at[id](p),
  };
}
