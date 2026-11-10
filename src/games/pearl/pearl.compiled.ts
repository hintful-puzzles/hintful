// Compiled by `npm run describe` from src/games/pearl/pearl.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, edgeGroups, freshBinding, keptEdgeGroups, keptStore, minus, rangeMask, sameSet, setOf, staleChecking, through, type Footprint, type Kept } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  pearl: ClueList;
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "square" | "blackPearl" | "blackRunsOn" | "blackCannotRunOn" | "whiteCannotTurn" | "whiteTurnsOpposite" | "closed" | "earlyLoop" | "earlyThrough";

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
  { id: "square", tier: 0 },
  { id: "blackPearl", tier: 0 },
  { id: "blackRunsOn", tier: 0 },
  { id: "blackCannotRunOn", tier: 0 },
  { id: "whiteCannotTurn", tier: 0 },
  { id: "whiteTurnsOpposite", tier: 0 },
  { id: "closed", tier: 0 },
  { id: "earlyLoop", tier: 1 },
  { id: "earlyThrough", tier: 1 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g1906: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.edges) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q1884 = true;
  Q1885: {
    const _a1886 = sp.cells;
    for (let _i1887 = 0; _i1887 < _a1886.length; _i1887++) {
      const v_c = _a1886[_i1887];
      let _g1888 = 0;
      G1889: {
        const _a1890 = sp.cellEdges[v_c];
        for (let _i1891 = 0; _i1891 < _a1890.length; _i1891++) {
          const v_e = _a1890[_i1891];
          const _h1892 = (g[v_e] || -1);
          if (!((_h1892 === 1))) continue;
          _g1888++;
        }
      }
      let _c1898: boolean = (_g1888 === 0);
      if (!_c1898) {
        let _g1893 = 0;
        G1894: {
          const _a1895 = sp.cellEdges[v_c];
          for (let _i1896 = 0; _i1896 < _a1895.length; _i1896++) {
            const v_e = _a1895[_i1896];
            const _h1897 = (g[v_e] || -1);
            if (!((_h1897 === 1))) continue;
            _g1893++;
          }
        }
        _c1898 = (_g1893 === 2);
      }
      if (!(_c1898)) {
        _q1884 = false;
        break Q1885;
      }
    }
  }
  if (!(_q1884)) return false;
  let _q1899 = false;
  Q1900: {
    const _a1901 = sp.edges;
    for (let _i1902 = 0; _i1902 < _a1901.length; _i1902++) {
      const v_e = _a1901[_i1902];
      const _h1903 = (g[v_e] || -1);
      if ((_h1903 === 1)) {
        _q1899 = true;
        break Q1900;
      }
    }
  }
  let _c1928: boolean = _q1899;
  if (_c1928) {
    let _q1904 = true;
    Q1905: {
      _g1906.length = 0;
      G1907: {
        const _a1910 = sp.edges;
        for (let _i1911 = 0; _i1911 < _a1910.length; _i1911++) {
          const v_e = _a1910[_i1911];
          const _h1912 = (g[v_e] || -1);
          if (!((_h1912 === 1))) continue;
          _g1906.push(v_e);
        }
      }
      const v_L = _g1906;
      const _eg1927 = edgeGroups(sp, v_L);
      const _a1913 = sp.cells;
      for (let _i1914 = 0; _i1914 < _a1913.length; _i1914++) {
        const v_a = _a1913[_i1914];
        let _g1915 = 0;
        G1916: {
          const _a1917 = sp.cellEdges[v_a];
          for (let _i1918 = 0; _i1918 < _a1917.length; _i1918++) {
            const v_e = _a1917[_i1918];
            const _h1919 = (g[v_e] || -1);
            if (!((_h1919 === 1))) continue;
            _g1915++;
          }
        }
        if (!((_g1915 > 0))) continue;
        const _a1920 = sp.cells;
        for (let _i1921 = 0; _i1921 < _a1920.length; _i1921++) {
          const v_b = _a1920[_i1921];
          let _g1922 = 0;
          G1923: {
            const _a1924 = sp.cellEdges[v_b];
            for (let _i1925 = 0; _i1925 < _a1924.length; _i1925++) {
              const v_e = _a1924[_i1925];
              const _h1926 = (g[v_e] || -1);
              if (!((_h1926 === 1))) continue;
              _g1922++;
            }
          }
          if (!((_g1922 > 0))) continue;
          if (!((_eg1927.of(v_b) === _eg1927.of(v_a)))) {
            _q1904 = false;
            break Q1905;
          }
        }
      }
    }
    _c1928 = _q1904;
  }
  if (!(_c1928)) return false;
  for (let _k1929 = 0; _k1929 < cl.pearl.at.length; _k1929++) {
    const _at1930 = cl.pearl.at[_k1929];
    const _v1931 = cl.pearl.v[_k1929];
    let _g1932 = 0;
    G1933: {
      const _a1934 = sp.cellEdges[_at1930];
      for (let _i1935 = 0; _i1935 < _a1934.length; _i1935++) {
        const v_e = _a1934[_i1935];
        const _h1936 = (g[v_e] || -1);
        if (!((_h1936 === 1))) continue;
        _g1932++;
      }
    }
    let _c1947: boolean = (_g1932 === 2);
    if (_c1947) {
      let _q1937 = true;
      Q1938: {
        const _a1939 = sp.cellEdges[_at1930];
        for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
          const v_e = _a1939[_i1940];
          const _h1944 = (g[v_e] || -1);
          const _h1945 = (_h1944 === 1);
          const _a1941 = sp.cellEdges[_at1930];
          const _n1942 = _i1940;
          for (let _i1943 = 0; _i1943 < _n1942; _i1943++) {
            const v_x = _a1941[_i1943];
            const _h1946 = (g[v_x] || -1);
            if (!((_h1945 && (_h1946 === 1)))) continue;
            if (!((bent(sp, v_e, v_x) === (_v1931 === 1)))) {
              _q1937 = false;
              break Q1938;
            }
          }
        }
      }
      _c1947 = _q1937;
    }
    let _c1959: boolean = _c1947;
    if (_c1959) {
      let _c1958: boolean = (_v1931 !== 1);
      if (!_c1958) {
        let _q1948 = true;
        Q1949: {
          const _a1950 = sp.cellEdges[_at1930];
          for (let _i1951 = 0; _i1951 < _a1950.length; _i1951++) {
            const v_e = _a1950[_i1951];
            const _h1952 = (g[v_e] || -1);
            if (!((_h1952 === 1))) continue;
            let _q1953 = false;
            Q1954: {
              const _a1955 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1930 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1956 = 0; _i1956 < _a1955.length; _i1956++) {
                const v_x = _a1955[_i1956];
                const _h1957 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1957 === 1)) && !(bent(sp, v_x, v_e)))) {
                  _q1953 = true;
                  break Q1954;
                }
              }
            }
            if (!(_q1953)) {
              _q1948 = false;
              break Q1949;
            }
          }
        }
        _c1958 = _q1948;
      }
      _c1959 = _c1958;
    }
    let _c1971: boolean = _c1959;
    if (_c1971) {
      let _c1970: boolean = (_v1931 !== 2);
      if (!_c1970) {
        let _q1960 = false;
        Q1961: {
          const _a1962 = sp.cellEdges[_at1930];
          for (let _i1963 = 0; _i1963 < _a1962.length; _i1963++) {
            const v_e = _a1962[_i1963];
            const _h1964 = (g[v_e] || -1);
            if (!((_h1964 === 1))) continue;
            let _q1965 = false;
            Q1966: {
              const _a1967 = sp.cellEdges[(sp.edgeEnds[2 * v_e] === _at1930 ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])];
              for (let _i1968 = 0; _i1968 < _a1967.length; _i1968++) {
                const v_x = _a1967[_i1968];
                const _h1969 = (g[v_x] || -1);
                if ((((v_x !== v_e) && (_h1969 === 1)) && bent(sp, v_x, v_e))) {
                  _q1965 = true;
                  break Q1966;
                }
              }
            }
            if (_q1965) {
              _q1960 = true;
              break Q1961;
            }
          }
        }
        _c1970 = _q1960;
      }
      _c1971 = _c1970;
    }
    if (!(_c1971)) return false;
  }
  return true;
}

export interface SquareBinding {
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const squareFacts: number[] = [];
let squareCands = new Int32Array(0);
let _p158 = new Int32Array(0);
let _l159: readonly number[] = [];
let _f164 = new Int32Array(0);
let _l165: readonly number[] = [];
let _p204 = new Int32Array(0);
let _l205: readonly number[] = [];
let _f210 = new Int32Array(0);
let _l211: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const squareFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as n. */
export function square(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SquareBinding> | null): number {
  const _g126: number[] = [];
  const _g134: number[] = [];
  if (_p158.length < sp.edges.length) _p158 = new Int32Array(sp.edges.length);
  else _p158.fill(0);
  _l159 = [];
  let _y160 = false;
  if (_f164.length < sp.edges.length) _f164 = new Int32Array(sp.edges.length).fill(-1);
  else _f164.fill(-1);
  _l165 = [];
  const _s166: number[] = [];
  const _g180: number[] = [];
  if (_p204.length < sp.edges.length) _p204 = new Int32Array(sp.edges.length);
  else _p204.fill(0);
  _l205 = [];
  let _y206 = false;
  if (_f210.length < sp.edges.length) _f210 = new Int32Array(sp.edges.length).fill(-1);
  else _f210.fill(-1);
  _l211 = [];
  const _s212: number[] = [];
  const facts = squareFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (squareCands.length < sp.edges.length) squareCands = new Int32Array(sp.edges.length);
  const cands = squareCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(squareFootprint) ?? null) : null;
  const _a123 = sp.cells;
  for (let _i124 = 0; _i124 < _a123.length; _i124++) {
    const v_c = _a123[_i124];
    const _h125 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h125 !== 1))) continue;
    let _g161 = -1;
    const _h179 = (_h125 === -1);
    let _g207 = -1;
    _g126.length = 0;
    G127: {
      const _a130 = sp.cellEdges[v_c];
      for (let _i131 = 0; _i131 < _a130.length; _i131++) {
        const v_e = _a130[_i131];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g126.push(v_e);
      }
    }
    L132: {
      const v_F = _g126;
      const _h133 = v_F.length;
      if (!((_h133 > 0))) break L132;
      _g134.length = 0;
      G135: {
        const _a156 = v_F;
        for (let _i157 = 0; _i157 < _a156.length; _i157++) {
          const v_e = _a156[_i157];
          if (_g161 !== _epoch) {
            _g161 = _epoch;
            for (const _e162 of _l159) _p158[_e162] = 0;
            _y160 = false;
            const _a163 = sp.cellEdges[v_c];
            for (const _e167 of _l165) _f164[_e167] = -1;
            _l165 = _a163;
            let _i169 = 0;
            _s166[0] = 0;
            let _o173 = _a163.length === 0;
            for (;;) {
              if (_a163.length === 0) {
                if (!_o173) break;
                _o173 = false;
              }
              while (_a163.length > 0 && _i169 >= 0) {
                const _e167 = _a163[_i169];
                if (_s166[_i169] > 0) _f164[_e167] = -1;
                let _r172 = (cands[_e167] >= 0 ? cands[_e167] : (cands[_e167] = b.cands[_e167])) & ~((2 << _s166[_i169]) - 1);
                let _d168 = 0;
                V171: for (; _r172 !== 0; _r172 &= _r172 - 1) {
                  _d168 = 31 - Math.clz32(_r172 & -_r172);
                  _f164[_e167] = _d168;
                  for (let _j170 = 0; _j170 < _i169; _j170++) {
                    const _y174 = _a163[_j170];
                    if (!(((_f164[_e167] === 1) && (_f164[_y174] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e167, _y174)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e167, _y174)))))) continue V171;
                  }
                  break;
                }
                if (_r172 === 0) {
                  _s166[_i169] = 0;
                  _i169--;
                  continue;
                }
                _s166[_i169] = _d168;
                if (_i169 === _a163.length - 1) break;
                _i169++;
                _s166[_i169] = 0;
              }
              if (_i169 < 0) break;
              let _g175 = 0;
              G176: {
                const _a177 = sp.cellEdges[v_c];
                for (let _i178 = 0; _i178 < _a177.length; _i178++) {
                  const v_x = _a177[_i178];
                  if (!((_f164[v_x] === 1))) continue;
                  _g175++;
                }
              }
              if (!(((_g175 === 2) || ((_g175 === 0) && _h179)))) continue;
              if (!(true)) continue;
              _l159 = _a163;
              _y160 = true;
              for (const _e162 of _a163) _p158[_e162] |= 1 << _f164[_e162];
            }
          }
          if (!(((((_p158[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y160 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g134.push(v_e);
        }
      }
      const v_W = _g134;
      _g180.length = 0;
      G181: {
        const _a202 = v_F;
        for (let _i203 = 0; _i203 < _a202.length; _i203++) {
          const v_e = _a202[_i203];
          if (_g207 !== _epoch) {
            _g207 = _epoch;
            for (const _e208 of _l205) _p204[_e208] = 0;
            _y206 = false;
            const _a209 = sp.cellEdges[v_c];
            for (const _e213 of _l211) _f210[_e213] = -1;
            _l211 = _a209;
            let _i215 = 0;
            _s212[0] = 0;
            let _o219 = _a209.length === 0;
            for (;;) {
              if (_a209.length === 0) {
                if (!_o219) break;
                _o219 = false;
              }
              while (_a209.length > 0 && _i215 >= 0) {
                const _e213 = _a209[_i215];
                if (_s212[_i215] > 0) _f210[_e213] = -1;
                let _r218 = (cands[_e213] >= 0 ? cands[_e213] : (cands[_e213] = b.cands[_e213])) & ~((2 << _s212[_i215]) - 1);
                let _d214 = 0;
                V217: for (; _r218 !== 0; _r218 &= _r218 - 1) {
                  _d214 = 31 - Math.clz32(_r218 & -_r218);
                  _f210[_e213] = _d214;
                  for (let _j216 = 0; _j216 < _i215; _j216++) {
                    const _y220 = _a209[_j216];
                    if (!(((_f210[_e213] === 1) && (_f210[_y220] === 1)))) continue;
                    if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e213, _y220)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e213, _y220)))))) continue V217;
                  }
                  break;
                }
                if (_r218 === 0) {
                  _s212[_i215] = 0;
                  _i215--;
                  continue;
                }
                _s212[_i215] = _d214;
                if (_i215 === _a209.length - 1) break;
                _i215++;
                _s212[_i215] = 0;
              }
              if (_i215 < 0) break;
              let _g221 = 0;
              G222: {
                const _a223 = sp.cellEdges[v_c];
                for (let _i224 = 0; _i224 < _a223.length; _i224++) {
                  const v_x = _a223[_i224];
                  if (!((_f210[v_x] === 1))) continue;
                  _g221++;
                }
              }
              if (!(((_g221 === 2) || ((_g221 === 0) && _h179)))) continue;
              if (!(true)) continue;
              _l205 = _a209;
              _y206 = true;
              for (const _e208 of _a209) _p204[_e208] |= 1 << _f210[_e208];
            }
          }
          if (!(((((_p204[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y206 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g180.push(v_e);
        }
      }
      L225: {
        const v_N = _g180;
        let _q226 = false;
        Q227: {
          const _a228 = v_F;
          for (let _i229 = 0; _i229 < _a228.length; _i229++) {
            const v_e = _a228[_i229];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q226 = true;
              break Q227;
            }
          }
        }
        if (!(_q226)) break L225;
        if (import.meta.env.DEV && staleChecking) {
          const _g230: number[] = [];
          G231: {
            const _a234 = sp.cellEdges[v_c];
            for (let _i235 = 0; _i235 < _a234.length; _i235++) {
              const v_e = _a234[_i235];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g230.push(v_e);
            }
          }
          const _g236: number[] = [];
          G237: {
            const _a258 = v_F;
            for (let _i259 = 0; _i259 < _a258.length; _i259++) {
              const v_e = _a258[_i259];
              let _q260 = false;
              Q261: {
                const _f263 = new Int32Array(sp.edges.length).fill(-1);
                let _l264: readonly number[] = [];
                const _s265: number[] = [];
                const _a262 = sp.cellEdges[v_c];
                for (const _e266 of _l264) _f263[_e266] = -1;
                _l264 = _a262;
                let _i268 = 0;
                _s265[0] = 0;
                let _o272 = _a262.length === 0;
                for (;;) {
                  if (_a262.length === 0) {
                    if (!_o272) break;
                    _o272 = false;
                  }
                  while (_a262.length > 0 && _i268 >= 0) {
                    const _e266 = _a262[_i268];
                    if (_s265[_i268] > 0) _f263[_e266] = -1;
                    let _r271 = (cands[_e266] >= 0 ? cands[_e266] : (cands[_e266] = b.cands[_e266])) & ~((2 << _s265[_i268]) - 1);
                    let _d267 = 0;
                    V270: for (; _r271 !== 0; _r271 &= _r271 - 1) {
                      _d267 = 31 - Math.clz32(_r271 & -_r271);
                      _f263[_e266] = _d267;
                      if (_e266 === v_e && _d267 !== 1) continue;
                      for (let _j269 = 0; _j269 < _i268; _j269++) {
                        const _y273 = _a262[_j269];
                        if (!(((_f263[_e266] === 1) && (_f263[_y273] === 1)))) continue;
                        if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e266, _y273)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e266, _y273)))))) continue V270;
                      }
                      break;
                    }
                    if (_r271 === 0) {
                      _s265[_i268] = 0;
                      _i268--;
                      continue;
                    }
                    _s265[_i268] = _d267;
                    if (_i268 === _a262.length - 1) break;
                    _i268++;
                    _s265[_i268] = 0;
                  }
                  if (_i268 < 0) break;
                  let _g274 = 0;
                  G275: {
                    const _a276 = sp.cellEdges[v_c];
                    for (let _i277 = 0; _i277 < _a276.length; _i277++) {
                      const v_x = _a276[_i277];
                      if (!((_f263[v_x] === 1))) continue;
                      _g274++;
                    }
                  }
                  if (!(((_g274 === 2) || ((_g274 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q260 = true;
                    break Q261;
                  }
                }
              }
              if (!(_q260)) continue;
              _g236.push(v_e);
            }
          }
          const _g278: number[] = [];
          G279: {
            const _a300 = v_F;
            for (let _i301 = 0; _i301 < _a300.length; _i301++) {
              const v_e = _a300[_i301];
              let _q302 = false;
              Q303: {
                const _f305 = new Int32Array(sp.edges.length).fill(-1);
                let _l306: readonly number[] = [];
                const _s307: number[] = [];
                const _a304 = sp.cellEdges[v_c];
                for (const _e308 of _l306) _f305[_e308] = -1;
                _l306 = _a304;
                let _i310 = 0;
                _s307[0] = 0;
                let _o314 = _a304.length === 0;
                for (;;) {
                  if (_a304.length === 0) {
                    if (!_o314) break;
                    _o314 = false;
                  }
                  while (_a304.length > 0 && _i310 >= 0) {
                    const _e308 = _a304[_i310];
                    if (_s307[_i310] > 0) _f305[_e308] = -1;
                    let _r313 = (cands[_e308] >= 0 ? cands[_e308] : (cands[_e308] = b.cands[_e308])) & ~((2 << _s307[_i310]) - 1);
                    let _d309 = 0;
                    V312: for (; _r313 !== 0; _r313 &= _r313 - 1) {
                      _d309 = 31 - Math.clz32(_r313 & -_r313);
                      _f305[_e308] = _d309;
                      if (_e308 === v_e && _d309 !== 2) continue;
                      for (let _j311 = 0; _j311 < _i310; _j311++) {
                        const _y315 = _a304[_j311];
                        if (!(((_f305[_e308] === 1) && (_f305[_y315] === 1)))) continue;
                        if (!((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e308, _y315)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e308, _y315)))))) continue V312;
                      }
                      break;
                    }
                    if (_r313 === 0) {
                      _s307[_i310] = 0;
                      _i310--;
                      continue;
                    }
                    _s307[_i310] = _d309;
                    if (_i310 === _a304.length - 1) break;
                    _i310++;
                    _s307[_i310] = 0;
                  }
                  if (_i310 < 0) break;
                  let _g316 = 0;
                  G317: {
                    const _a318 = sp.cellEdges[v_c];
                    for (let _i319 = 0; _i319 < _a318.length; _i319++) {
                      const v_x = _a318[_i319];
                      if (!((_f305[v_x] === 1))) continue;
                      _g316++;
                    }
                  }
                  if (!(((_g316 === 2) || ((_g316 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q302 = true;
                    break Q303;
                  }
                }
              }
              if (!(_q302)) continue;
              _g278.push(v_e);
            }
          }
          let _q320 = false;
          Q321: {
            const _a322 = v_F;
            for (let _i323 = 0; _i323 < _a322.length; _i323++) {
              const v_e = _a322[_i323];
              if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
                _q320 = true;
                break Q321;
              }
            }
          }
          freshBinding("square", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) !== 1), sameSet(v_F, _g230), (v_F.length > 0), sameSet(v_W, _g236), sameSet(v_N, _g278), _q320], ["c in", "where of c", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q324 = true;
        Q325: {
          const _a326 = v_F;
          for (let _i327 = 0; _i327 < _a326.length; _i327++) {
            const v_e = _a326[_i327];
            let _c329: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c329) {
              let _c328: boolean = !(!(v_W.includes(v_e)));
              if (!_c328) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c328 = true;
              }
              _c329 = _c328;
            }
            let _c331: boolean = _c329;
            if (_c331) {
              let _c330: boolean = !(!(v_N.includes(v_e)));
              if (!_c330) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c330 = true;
              }
              _c331 = _c330;
            }
            if (!(_c331)) {
              _q324 = false;
              break Q325;
            }
          }
        }
        if (!(_q324)) return -1;
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

export interface BlackPearlBinding {
  c: number;
  e: number;
  A: boolean;
  B: boolean;
}

const blackPearlFacts: number[] = [];
let blackPearlCands = new Int32Array(0);
let _p378 = new Int32Array(0);
let _l379: readonly number[] = [];
let _f384 = new Int32Array(0);
let _l385: readonly number[] = [];
let _p399 = new Int32Array(0);
let _l400: readonly number[] = [];
let _f405 = new Int32Array(0);
let _l406: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackPearlFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackPearl(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackPearlBinding> | null): number {
  if (_p378.length < sp.edges.length) _p378 = new Int32Array(sp.edges.length);
  else _p378.fill(0);
  _l379 = [];
  let _y380 = false;
  if (_f384.length < sp.edges.length) _f384 = new Int32Array(sp.edges.length).fill(-1);
  else _f384.fill(-1);
  _l385 = [];
  const _s386: number[] = [];
  if (_p399.length < sp.edges.length) _p399 = new Int32Array(sp.edges.length);
  else _p399.fill(0);
  _l400 = [];
  let _y401 = false;
  if (_f405.length < sp.edges.length) _f405 = new Int32Array(sp.edges.length).fill(-1);
  else _f405.fill(-1);
  _l406 = [];
  const _s407: number[] = [];
  const facts = blackPearlFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (blackPearlCands.length < sp.edges.length) blackPearlCands = new Int32Array(sp.edges.length);
  const cands = blackPearlCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackPearlFootprint) ?? null) : null;
  const _a373 = cluesValued(cl.pearl, 1);
  for (let _i374 = 0; _i374 < _a373.length; _i374++) {
    const v_c = _a373[_i374];
    const _h375 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h375 === 1))) continue;
    let _g381 = -1;
    let _g402 = -1;
    const _a376 = sp.cellEdges[v_c];
    for (let _i377 = 0; _i377 < _a376.length; _i377++) {
      const v_e = _a376[_i377];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      if (_g381 !== _epoch) {
        _g381 = _epoch;
        for (const _e382 of _l379) _p378[_e382] = 0;
        _y380 = false;
        const _a383 = sp.cellEdges[v_c];
        for (const _e387 of _l385) _f384[_e387] = -1;
        _l385 = _a383;
        let _i389 = 0;
        _s386[0] = 0;
        let _o393 = _a383.length === 0;
        for (;;) {
          if (_a383.length === 0) {
            if (!_o393) break;
            _o393 = false;
          }
          while (_a383.length > 0 && _i389 >= 0) {
            const _e387 = _a383[_i389];
            if (_s386[_i389] > 0) _f384[_e387] = -1;
            let _r392 = (cands[_e387] >= 0 ? cands[_e387] : (cands[_e387] = b.cands[_e387])) & ~((2 << _s386[_i389]) - 1);
            let _d388 = 0;
            V391: for (; _r392 !== 0; _r392 &= _r392 - 1) {
              _d388 = 31 - Math.clz32(_r392 & -_r392);
              _f384[_e387] = _d388;
              for (let _j390 = 0; _j390 < _i389; _j390++) {
                const _y394 = _a383[_j390];
                if (!(((_f384[_e387] === 1) && (_f384[_y394] === 1)))) continue;
                if (!(bent(sp, _e387, _y394))) continue V391;
              }
              break;
            }
            if (_r392 === 0) {
              _s386[_i389] = 0;
              _i389--;
              continue;
            }
            _s386[_i389] = _d388;
            if (_i389 === _a383.length - 1) break;
            _i389++;
            _s386[_i389] = 0;
          }
          if (_i389 < 0) break;
          let _g395 = 0;
          G396: {
            const _a397 = sp.cellEdges[v_c];
            for (let _i398 = 0; _i398 < _a397.length; _i398++) {
              const v_x = _a397[_i398];
              if (!((_f384[v_x] === 1))) continue;
              _g395++;
            }
          }
          if (!((_g395 === 2))) continue;
          if (!(true)) continue;
          _l379 = _a383;
          _y380 = true;
          for (const _e382 of _a383) _p378[_e382] |= 1 << _f384[_e382];
        }
      }
      const v_A = ((((_p378[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y380 && !sp.cellEdges[v_c].includes(v_e)));
      if (_g402 !== _epoch) {
        _g402 = _epoch;
        for (const _e403 of _l400) _p399[_e403] = 0;
        _y401 = false;
        const _a404 = sp.cellEdges[v_c];
        for (const _e408 of _l406) _f405[_e408] = -1;
        _l406 = _a404;
        let _i410 = 0;
        _s407[0] = 0;
        let _o414 = _a404.length === 0;
        for (;;) {
          if (_a404.length === 0) {
            if (!_o414) break;
            _o414 = false;
          }
          while (_a404.length > 0 && _i410 >= 0) {
            const _e408 = _a404[_i410];
            if (_s407[_i410] > 0) _f405[_e408] = -1;
            let _r413 = (cands[_e408] >= 0 ? cands[_e408] : (cands[_e408] = b.cands[_e408])) & ~((2 << _s407[_i410]) - 1);
            let _d409 = 0;
            V412: for (; _r413 !== 0; _r413 &= _r413 - 1) {
              _d409 = 31 - Math.clz32(_r413 & -_r413);
              _f405[_e408] = _d409;
              for (let _j411 = 0; _j411 < _i410; _j411++) {
                const _y415 = _a404[_j411];
                if (!(((_f405[_e408] === 1) && (_f405[_y415] === 1)))) continue;
                if (!(bent(sp, _e408, _y415))) continue V412;
              }
              break;
            }
            if (_r413 === 0) {
              _s407[_i410] = 0;
              _i410--;
              continue;
            }
            _s407[_i410] = _d409;
            if (_i410 === _a404.length - 1) break;
            _i410++;
            _s407[_i410] = 0;
          }
          if (_i410 < 0) break;
          let _g416 = 0;
          G417: {
            const _a418 = sp.cellEdges[v_c];
            for (let _i419 = 0; _i419 < _a418.length; _i419++) {
              const v_x = _a418[_i419];
              if (!((_f405[v_x] === 1))) continue;
              _g416++;
            }
          }
          if (!((_g416 === 2))) continue;
          if (!(true)) continue;
          _l400 = _a404;
          _y401 = true;
          for (const _e403 of _a404) _p399[_e403] |= 1 << _f405[_e403];
        }
      }
      L420: {
        const v_B = ((((_p399[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y401 && !sp.cellEdges[v_c].includes(v_e)));
        if (!((!(v_A) || !(v_B)))) break L420;
        if (import.meta.env.DEV && staleChecking) {
          let _q421 = false;
          Q422: {
            const _f424 = new Int32Array(sp.edges.length).fill(-1);
            let _l425: readonly number[] = [];
            const _s426: number[] = [];
            const _a423 = sp.cellEdges[v_c];
            for (const _e427 of _l425) _f424[_e427] = -1;
            _l425 = _a423;
            let _i429 = 0;
            _s426[0] = 0;
            let _o433 = _a423.length === 0;
            for (;;) {
              if (_a423.length === 0) {
                if (!_o433) break;
                _o433 = false;
              }
              while (_a423.length > 0 && _i429 >= 0) {
                const _e427 = _a423[_i429];
                if (_s426[_i429] > 0) _f424[_e427] = -1;
                let _r432 = (cands[_e427] >= 0 ? cands[_e427] : (cands[_e427] = b.cands[_e427])) & ~((2 << _s426[_i429]) - 1);
                let _d428 = 0;
                V431: for (; _r432 !== 0; _r432 &= _r432 - 1) {
                  _d428 = 31 - Math.clz32(_r432 & -_r432);
                  _f424[_e427] = _d428;
                  if (_e427 === v_e && _d428 !== 1) continue;
                  for (let _j430 = 0; _j430 < _i429; _j430++) {
                    const _y434 = _a423[_j430];
                    if (!(((_f424[_e427] === 1) && (_f424[_y434] === 1)))) continue;
                    if (!(bent(sp, _e427, _y434))) continue V431;
                  }
                  break;
                }
                if (_r432 === 0) {
                  _s426[_i429] = 0;
                  _i429--;
                  continue;
                }
                _s426[_i429] = _d428;
                if (_i429 === _a423.length - 1) break;
                _i429++;
                _s426[_i429] = 0;
              }
              if (_i429 < 0) break;
              let _g435 = 0;
              G436: {
                const _a437 = sp.cellEdges[v_c];
                for (let _i438 = 0; _i438 < _a437.length; _i438++) {
                  const v_x = _a437[_i438];
                  if (!((_f424[v_x] === 1))) continue;
                  _g435++;
                }
              }
              if (!((_g435 === 2))) continue;
              if (true) {
                _q421 = true;
                break Q422;
              }
            }
          }
          let _q439 = false;
          Q440: {
            const _f442 = new Int32Array(sp.edges.length).fill(-1);
            let _l443: readonly number[] = [];
            const _s444: number[] = [];
            const _a441 = sp.cellEdges[v_c];
            for (const _e445 of _l443) _f442[_e445] = -1;
            _l443 = _a441;
            let _i447 = 0;
            _s444[0] = 0;
            let _o451 = _a441.length === 0;
            for (;;) {
              if (_a441.length === 0) {
                if (!_o451) break;
                _o451 = false;
              }
              while (_a441.length > 0 && _i447 >= 0) {
                const _e445 = _a441[_i447];
                if (_s444[_i447] > 0) _f442[_e445] = -1;
                let _r450 = (cands[_e445] >= 0 ? cands[_e445] : (cands[_e445] = b.cands[_e445])) & ~((2 << _s444[_i447]) - 1);
                let _d446 = 0;
                V449: for (; _r450 !== 0; _r450 &= _r450 - 1) {
                  _d446 = 31 - Math.clz32(_r450 & -_r450);
                  _f442[_e445] = _d446;
                  if (_e445 === v_e && _d446 !== 2) continue;
                  for (let _j448 = 0; _j448 < _i447; _j448++) {
                    const _y452 = _a441[_j448];
                    if (!(((_f442[_e445] === 1) && (_f442[_y452] === 1)))) continue;
                    if (!(bent(sp, _e445, _y452))) continue V449;
                  }
                  break;
                }
                if (_r450 === 0) {
                  _s444[_i447] = 0;
                  _i447--;
                  continue;
                }
                _s444[_i447] = _d446;
                if (_i447 === _a441.length - 1) break;
                _i447++;
                _s444[_i447] = 0;
              }
              if (_i447 < 0) break;
              let _g453 = 0;
              G454: {
                const _a455 = sp.cellEdges[v_c];
                for (let _i456 = 0; _i456 < _a455.length; _i456++) {
                  const v_x = _a455[_i456];
                  if (!((_f442[v_x] === 1))) continue;
                  _g453++;
                }
              }
              if (!((_g453 === 2))) continue;
              if (true) {
                _q439 = true;
                break Q440;
              }
            }
          }
          freshBinding("blackPearl", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_A === _q421), (v_B === _q439), (!(v_A) || !(v_B))], ["c in", "where of c", "e in", "where of e", "A =", "B =", "where of B"]);
        }
        facts.length = 0;
        changed = false;
        let _c458: boolean = (v_A || v_B);
        if (_c458) {
          let _c457: boolean = !(!(v_A));
          if (!_c457) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
            _c457 = true;
          }
          _c458 = _c457;
        }
        let _c460: boolean = _c458;
        if (_c460) {
          let _c459: boolean = !(!(v_B));
          if (!_c459) {
            if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
            _c459 = true;
          }
          _c460 = _c459;
        }
        if (!(_c460)) return -1;
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

export interface BlackRunsOnBinding {
  c: number;
  e: number;
  j: number;
}

const blackRunsOnFacts: number[] = [];

/** What a binding at one element of its first binder reads. */
const blackRunsOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackRunsOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackRunsOnBinding> | null): number {
  const facts = blackRunsOnFacts;
  let fired = 0;
  let changed = false;
  const _visit = fire === null ? (b.visit?.(blackRunsOnFootprint) ?? null) : null;
  const _a470 = cluesValued(cl.pearl, 1);
  for (let _i471 = 0; _i471 < _a470.length; _i471++) {
    const v_c = _a470[_i471];
    const _h472 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h472 === 1))) continue;
    const _a473 = sp.cellEdges[v_c];
    for (let _i474 = 0; _i474 < _a473.length; _i474++) {
      const v_e = _a473[_i474];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      L475: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        let _q476 = false;
        Q477: {
          const _a478 = sp.cellEdges[v_j];
          for (let _i479 = 0; _i479 < _a478.length; _i479++) {
            const v_x = _a478[_i479];
            if ((((v_x !== v_e) && !(bent(sp, v_x, v_e))) && ((b.grid[v_x] || -1) === 1))) {
              _q476 = true;
              break Q477;
            }
          }
        }
        if (!(!(_q476))) break L475;
        if (import.meta.env.DEV && staleChecking) {
          let _q480 = false;
          Q481: {
            const _a482 = sp.cellEdges[v_j];
            for (let _i483 = 0; _i483 < _a482.length; _i483++) {
              const v_x = _a482[_i483];
              if ((((v_x !== v_e) && !(bent(sp, v_x, v_e))) && ((b.grid[v_x] || -1) === 1))) {
                _q480 = true;
                break Q481;
              }
            }
          }
          freshBinding("blackRunsOn", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) === 1), (v_j === (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), !(_q480)], ["c in", "where of c", "e in", "where of e", "j =", "where of j"]);
        }
        facts.length = 0;
        changed = false;
        let _q484 = false;
        Q485: {
          const _a486 = sp.cellEdges[v_j];
          for (let _i487 = 0; _i487 < _a486.length; _i487++) {
            const v_x = _a486[_i487];
            if (((v_x !== v_e) && !(bent(sp, v_x, v_e)))) {
              _q484 = true;
              break Q485;
            }
          }
        }
        let _c495: boolean = _q484;
        if (_c495) {
          let _q488 = true;
          Q489: {
            const _a490 = sp.cellEdges[v_j];
            for (let _i491 = 0; _i491 < _a490.length; _i491++) {
              const v_x = _a490[_i491];
              if (!((v_x !== v_e))) continue;
              let _c492: boolean = !(bent(sp, v_x, v_e));
              if (!_c492) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c492 = true;
              }
              let _c494: boolean = _c492;
              if (_c494) {
                let _c493: boolean = !(!(bent(sp, v_x, v_e)));
                if (!_c493) {
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  _c493 = true;
                }
                _c494 = _c493;
              }
              if (!(_c494)) {
                _q488 = false;
                break Q489;
              }
            }
          }
          _c495 = _q488;
        }
        if (!(_c495)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, j: v_j }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface BlackCannotRunOnBinding {
  c: number;
  e: number;
  j: number;
}

const blackCannotRunOnFacts: number[] = [];
let blackCannotRunOnCands = new Int32Array(0);
let _f533 = new Int32Array(0);
let _l534: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const blackCannotRunOnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function blackCannotRunOn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<BlackCannotRunOnBinding> | null): number {
  if (_f533.length < sp.edges.length) _f533 = new Int32Array(sp.edges.length).fill(-1);
  else _f533.fill(-1);
  _l534 = [];
  const _s535: number[] = [];
  const facts = blackCannotRunOnFacts;
  let fired = 0;
  let changed = false;
  if (blackCannotRunOnCands.length < sp.edges.length) blackCannotRunOnCands = new Int32Array(sp.edges.length);
  const cands = blackCannotRunOnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(blackCannotRunOnFootprint) ?? null) : null;
  const _a524 = cluesValued(cl.pearl, 1);
  for (let _i525 = 0; _i525 < _a524.length; _i525++) {
    const v_c = _a524[_i525];
    const _h526 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h526 === 1))) continue;
    const _a527 = sp.cellEdges[v_c];
    for (let _i528 = 0; _i528 < _a527.length; _i528++) {
      const v_e = _a527[_i528];
      if (!(!((b.grid[v_e] !== 0)))) continue;
      L529: {
        const v_j = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
        const _h543 = clueAt(cl.pearl, v_j);
        const _h544 = (_h543 !== 1);
        let _q530 = false;
        Q531: {
          const _a532 = sp.cellEdges[v_j];
          for (const _e536 of _l534) _f533[_e536] = -1;
          _l534 = _a532;
          let _i538 = 0;
          _s535[0] = 0;
          let _o542 = _a532.length === 0;
          for (;;) {
            if (_a532.length === 0) {
              if (!_o542) break;
              _o542 = false;
            }
            while (_a532.length > 0 && _i538 >= 0) {
              const _e536 = _a532[_i538];
              if (_s535[_i538] > 0) _f533[_e536] = -1;
              let _r541 = (cands[_e536] >= 0 ? cands[_e536] : (cands[_e536] = b.cands[_e536])) & ~((2 << _s535[_i538]) - 1);
              let _d537 = 0;
              for (; _r541 !== 0; _r541 &= _r541 - 1) {
                _d537 = 31 - Math.clz32(_r541 & -_r541);
                _f533[_e536] = _d537;
                if (_e536 === v_e && _d537 !== 1) continue;
                break;
              }
              if (_r541 === 0) {
                _s535[_i538] = 0;
                _i538--;
                continue;
              }
              _s535[_i538] = _d537;
              if (_i538 === _a532.length - 1) break;
              _i538++;
              _s535[_i538] = 0;
            }
            if (_i538 < 0) break;
            let _c549: boolean = _h544;
            if (_c549) {
              let _g545 = 0;
              G546: {
                const _a547 = sp.cellEdges[v_j];
                for (let _i548 = 0; _i548 < _a547.length; _i548++) {
                  const v_x = _a547[_i548];
                  if (!((_f533[v_x] === 1))) continue;
                  _g545++;
                }
              }
              _c549 = (_g545 === 2);
            }
            let _c554: boolean = _c549;
            if (_c554) {
              let _q550 = true;
              Q551: {
                const _a552 = sp.cellEdges[v_j];
                for (let _i553 = 0; _i553 < _a552.length; _i553++) {
                  const v_x = _a552[_i553];
                  if (!(((_f533[v_x] === 1) && (v_x !== v_e)))) continue;
                  if (!(!(bent(sp, v_x, v_e)))) {
                    _q550 = false;
                    break Q551;
                  }
                }
              }
              _c554 = _q550;
            }
            if (!(_c554)) continue;
            if (true) {
              _q530 = true;
              break Q531;
            }
          }
        }
        if (!(!(_q530))) break L529;
        if (import.meta.env.DEV && staleChecking) {
          let _q555 = false;
          Q556: {
            const _f558 = new Int32Array(sp.edges.length).fill(-1);
            let _l559: readonly number[] = [];
            const _s560: number[] = [];
            const _a557 = sp.cellEdges[v_j];
            for (const _e561 of _l559) _f558[_e561] = -1;
            _l559 = _a557;
            let _i563 = 0;
            _s560[0] = 0;
            let _o567 = _a557.length === 0;
            for (;;) {
              if (_a557.length === 0) {
                if (!_o567) break;
                _o567 = false;
              }
              while (_a557.length > 0 && _i563 >= 0) {
                const _e561 = _a557[_i563];
                if (_s560[_i563] > 0) _f558[_e561] = -1;
                let _r566 = (cands[_e561] >= 0 ? cands[_e561] : (cands[_e561] = b.cands[_e561])) & ~((2 << _s560[_i563]) - 1);
                let _d562 = 0;
                for (; _r566 !== 0; _r566 &= _r566 - 1) {
                  _d562 = 31 - Math.clz32(_r566 & -_r566);
                  _f558[_e561] = _d562;
                  if (_e561 === v_e && _d562 !== 1) continue;
                  break;
                }
                if (_r566 === 0) {
                  _s560[_i563] = 0;
                  _i563--;
                  continue;
                }
                _s560[_i563] = _d562;
                if (_i563 === _a557.length - 1) break;
                _i563++;
                _s560[_i563] = 0;
              }
              if (_i563 < 0) break;
              let _c572: boolean = (clueAt(cl.pearl, v_j) !== 1);
              if (_c572) {
                let _g568 = 0;
                G569: {
                  const _a570 = sp.cellEdges[v_j];
                  for (let _i571 = 0; _i571 < _a570.length; _i571++) {
                    const v_x = _a570[_i571];
                    if (!((_f558[v_x] === 1))) continue;
                    _g568++;
                  }
                }
                _c572 = (_g568 === 2);
              }
              let _c577: boolean = _c572;
              if (_c577) {
                let _q573 = true;
                Q574: {
                  const _a575 = sp.cellEdges[v_j];
                  for (let _i576 = 0; _i576 < _a575.length; _i576++) {
                    const v_x = _a575[_i576];
                    if (!(((_f558[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(!(bent(sp, v_x, v_e)))) {
                      _q573 = false;
                      break Q574;
                    }
                  }
                }
                _c577 = _q573;
              }
              if (!(_c577)) continue;
              if (true) {
                _q555 = true;
                break Q556;
              }
            }
          }
          freshBinding("blackCannotRunOn", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 1), (sp.cellEdges[v_c].includes(v_e)), !((b.grid[v_e] !== 0)), (v_j === (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e])), !(_q555)], ["c in", "where of c", "e in", "where of e", "j =", "where of j"]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        if (!(true)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, j: v_j }, facts)) return 1;
          cands.fill(-1);
        }
      }
    }
  }
  return fired;
}

export interface WhiteCannotTurnBinding {
  c: number;
  e: number;
  f: number;
  P: readonly number[];
}

const whiteCannotTurnFacts: number[] = [];
let whiteCannotTurnCands = new Int32Array(0);
let _p659 = new Int32Array(0);
let _l660: readonly number[] = [];
let _f665 = new Int32Array(0);
let _l666: readonly number[] = [];
let _f692 = new Int32Array(0);
let _l693: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteCannotTurnFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteCannotTurn(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteCannotTurnBinding> | null): number {
  if (_p659.length < sp.edges.length) _p659 = new Int32Array(sp.edges.length);
  else _p659.fill(0);
  _l660 = [];
  let _y661 = false;
  if (_f665.length < sp.edges.length) _f665 = new Int32Array(sp.edges.length).fill(-1);
  else _f665.fill(-1);
  _l666 = [];
  const _s667: number[] = [];
  if (_f692.length < sp.edges.length) _f692 = new Int32Array(sp.edges.length).fill(-1);
  else _f692.fill(-1);
  _l693 = [];
  const _s694: number[] = [];
  const _g715: number[] = [];
  const facts = whiteCannotTurnFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteCannotTurnCands.length < sp.edges.length) whiteCannotTurnCands = new Int32Array(sp.edges.length);
  const cands = whiteCannotTurnCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteCannotTurnFootprint) ?? null) : null;
  const _a645 = cluesValued(cl.pearl, 2);
  R1:
  for (let _i646 = 0; _i646 < _a645.length; _i646++) {
    const v_c = _a645[_i646];
    const _m118_0 = b.made[0];
    const _h647 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    let _c652: boolean = (_h647 === 2);
    if (_c652) {
      let _q648 = false;
      Q649: {
        const _a650 = sp.cellEdges[v_c];
        for (let _i651 = 0; _i651 < _a650.length; _i651++) {
          const v_x = _a650[_i651];
          if (!((b.grid[v_x] !== 0))) {
            _q648 = true;
            break Q649;
          }
        }
      }
      _c652 = _q648;
    }
    if (!(_c652)) continue;
    const _a653 = sp.cellEdges[v_c];
    R2:
    for (let _i654 = 0; _i654 < _a653.length; _i654++) {
      const v_e = _a653[_i654];
      if (!(((b.grid[v_e] || -1) !== 2))) continue;
      const _h657 = _i654;
      const _h658 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g662 = -1;
      const _h675 = clueAt(cl.pearl, _h658);
      const _h676 = (_h675 !== 2);
      const _a655 = sp.cellEdges[v_c];
      for (let _i656 = 0; _i656 < _a655.length; _i656++) {
        const v_f = _a655[_i656];
        let _c687: boolean = (((_i656 > _h657) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
        if (_c687) {
          if (_g662 !== _epoch) {
            _g662 = _epoch;
            for (const _e663 of _l660) _p659[_e663] = 0;
            _y661 = false;
            const _a664 = sp.cellEdges[_h658];
            for (const _e668 of _l666) _f665[_e668] = -1;
            _l666 = _a664;
            let _i670 = 0;
            _s667[0] = 0;
            let _o674 = _a664.length === 0;
            for (;;) {
              if (_a664.length === 0) {
                if (!_o674) break;
                _o674 = false;
              }
              while (_a664.length > 0 && _i670 >= 0) {
                const _e668 = _a664[_i670];
                if (_s667[_i670] > 0) _f665[_e668] = -1;
                let _r673 = (cands[_e668] >= 0 ? cands[_e668] : (cands[_e668] = b.cands[_e668])) & ~((2 << _s667[_i670]) - 1);
                let _d669 = 0;
                for (; _r673 !== 0; _r673 &= _r673 - 1) {
                  _d669 = 31 - Math.clz32(_r673 & -_r673);
                  _f665[_e668] = _d669;
                  break;
                }
                if (_r673 === 0) {
                  _s667[_i670] = 0;
                  _i670--;
                  continue;
                }
                _s667[_i670] = _d669;
                if (_i670 === _a664.length - 1) break;
                _i670++;
                _s667[_i670] = 0;
              }
              if (_i670 < 0) break;
              let _c681: boolean = _h676;
              if (_c681) {
                let _g677 = 0;
                G678: {
                  const _a679 = sp.cellEdges[_h658];
                  for (let _i680 = 0; _i680 < _a679.length; _i680++) {
                    const v_x = _a679[_i680];
                    if (!((_f665[v_x] === 1))) continue;
                    _g677++;
                  }
                }
                _c681 = (_g677 === 2);
              }
              let _c686: boolean = _c681;
              if (_c686) {
                let _q682 = true;
                Q683: {
                  const _a684 = sp.cellEdges[_h658];
                  for (let _i685 = 0; _i685 < _a684.length; _i685++) {
                    const v_x = _a684[_i685];
                    if (!(((_f665[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q682 = false;
                      break Q683;
                    }
                  }
                }
                _c686 = _q682;
              }
              if (!(_c686)) continue;
              if (!(true)) continue;
              _l660 = _a664;
              _y661 = true;
              for (const _e663 of _a664) _p659[_e663] |= 1 << _f665[_e663];
            }
          }
          _c687 = !(((((_p659[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y661 && !sp.cellEdges[_h658].includes(v_e))));
        }
        let _c714: boolean = _c687;
        if (_c714) {
          const _t688 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h702 = clueAt(cl.pearl, _t688);
          const _h703 = (_h702 !== 2);
          let _q689 = false;
          Q690: {
            const _a691 = sp.cellEdges[_t688];
            for (const _e695 of _l693) _f692[_e695] = -1;
            _l693 = _a691;
            let _i697 = 0;
            _s694[0] = 0;
            let _o701 = _a691.length === 0;
            for (;;) {
              if (_a691.length === 0) {
                if (!_o701) break;
                _o701 = false;
              }
              while (_a691.length > 0 && _i697 >= 0) {
                const _e695 = _a691[_i697];
                if (_s694[_i697] > 0) _f692[_e695] = -1;
                let _r700 = (cands[_e695] >= 0 ? cands[_e695] : (cands[_e695] = b.cands[_e695])) & ~((2 << _s694[_i697]) - 1);
                let _d696 = 0;
                for (; _r700 !== 0; _r700 &= _r700 - 1) {
                  _d696 = 31 - Math.clz32(_r700 & -_r700);
                  _f692[_e695] = _d696;
                  if (_e695 === v_f && _d696 !== 1) continue;
                  break;
                }
                if (_r700 === 0) {
                  _s694[_i697] = 0;
                  _i697--;
                  continue;
                }
                _s694[_i697] = _d696;
                if (_i697 === _a691.length - 1) break;
                _i697++;
                _s694[_i697] = 0;
              }
              if (_i697 < 0) break;
              let _c708: boolean = _h703;
              if (_c708) {
                let _g704 = 0;
                G705: {
                  const _a706 = sp.cellEdges[_t688];
                  for (let _i707 = 0; _i707 < _a706.length; _i707++) {
                    const v_x = _a706[_i707];
                    if (!((_f692[v_x] === 1))) continue;
                    _g704++;
                  }
                }
                _c708 = (_g704 === 2);
              }
              let _c713: boolean = _c708;
              if (_c713) {
                let _q709 = true;
                Q710: {
                  const _a711 = sp.cellEdges[_t688];
                  for (let _i712 = 0; _i712 < _a711.length; _i712++) {
                    const v_x = _a711[_i712];
                    if (!(((_f692[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(bent(sp, v_x, v_f))) {
                      _q709 = false;
                      break Q710;
                    }
                  }
                }
                _c713 = _q709;
              }
              if (!(_c713)) continue;
              if (true) {
                _q689 = true;
                break Q690;
              }
            }
          }
          _c714 = !(_q689);
        }
        if (!(_c714)) continue;
        _g715.length = 0;
        G716: {
          const _a719 = sp.cellEdges[v_c];
          for (let _i720 = 0; _i720 < _a719.length; _i720++) {
            const v_x = _a719[_i720];
            if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
            _g715.push(v_x);
          }
        }
        const v_P = _g715;
        const _h788 = v_P.length;
        if (b.made[0] !== _m118_0) {
          let _c725: boolean = (clueAt(cl.pearl, v_c) === 2);
          if (_c725) {
            let _q721 = false;
            Q722: {
              const _a723 = sp.cellEdges[v_c];
              for (let _i724 = 0; _i724 < _a723.length; _i724++) {
                const v_x = _a723[_i724];
                if (!((b.grid[v_x] !== 0))) {
                  _q721 = true;
                  break Q722;
                }
              }
            }
            _c725 = _q721;
          }
          if (!(_c725)) { if (_visit !== null) _visit[v_c] = 1; continue R1; }
          if (!(((b.grid[v_e] || -1) !== 2))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
        }
        if (import.meta.env.DEV && staleChecking) {
          let _c730: boolean = (clueAt(cl.pearl, v_c) === 2);
          if (_c730) {
            let _q726 = false;
            Q727: {
              const _a728 = sp.cellEdges[v_c];
              for (let _i729 = 0; _i729 < _a728.length; _i729++) {
                const v_x = _a728[_i729];
                if (!((b.grid[v_x] !== 0))) {
                  _q726 = true;
                  break Q727;
                }
              }
            }
            _c730 = _q726;
          }
          let _c755: boolean = (((_i656 > _i654) && !(bent(sp, v_e, v_f))) && ((b.grid[v_f] || -1) !== 2));
          if (_c755) {
            const _t731 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
            let _q732 = false;
            Q733: {
              const _f735 = new Int32Array(sp.edges.length).fill(-1);
              let _l736: readonly number[] = [];
              const _s737: number[] = [];
              const _a734 = sp.cellEdges[_t731];
              for (const _e738 of _l736) _f735[_e738] = -1;
              _l736 = _a734;
              let _i740 = 0;
              _s737[0] = 0;
              let _o744 = _a734.length === 0;
              for (;;) {
                if (_a734.length === 0) {
                  if (!_o744) break;
                  _o744 = false;
                }
                while (_a734.length > 0 && _i740 >= 0) {
                  const _e738 = _a734[_i740];
                  if (_s737[_i740] > 0) _f735[_e738] = -1;
                  let _r743 = (cands[_e738] >= 0 ? cands[_e738] : (cands[_e738] = b.cands[_e738])) & ~((2 << _s737[_i740]) - 1);
                  let _d739 = 0;
                  for (; _r743 !== 0; _r743 &= _r743 - 1) {
                    _d739 = 31 - Math.clz32(_r743 & -_r743);
                    _f735[_e738] = _d739;
                    if (_e738 === v_e && _d739 !== 1) continue;
                    break;
                  }
                  if (_r743 === 0) {
                    _s737[_i740] = 0;
                    _i740--;
                    continue;
                  }
                  _s737[_i740] = _d739;
                  if (_i740 === _a734.length - 1) break;
                  _i740++;
                  _s737[_i740] = 0;
                }
                if (_i740 < 0) break;
                let _c749: boolean = (clueAt(cl.pearl, _t731) !== 2);
                if (_c749) {
                  let _g745 = 0;
                  G746: {
                    const _a747 = sp.cellEdges[_t731];
                    for (let _i748 = 0; _i748 < _a747.length; _i748++) {
                      const v_x = _a747[_i748];
                      if (!((_f735[v_x] === 1))) continue;
                      _g745++;
                    }
                  }
                  _c749 = (_g745 === 2);
                }
                let _c754: boolean = _c749;
                if (_c754) {
                  let _q750 = true;
                  Q751: {
                    const _a752 = sp.cellEdges[_t731];
                    for (let _i753 = 0; _i753 < _a752.length; _i753++) {
                      const v_x = _a752[_i753];
                      if (!(((_f735[v_x] === 1) && (v_x !== v_e)))) continue;
                      if (!(bent(sp, v_x, v_e))) {
                        _q750 = false;
                        break Q751;
                      }
                    }
                  }
                  _c754 = _q750;
                }
                if (!(_c754)) continue;
                if (true) {
                  _q732 = true;
                  break Q733;
                }
              }
            }
            _c755 = !(_q732);
          }
          let _c780: boolean = _c755;
          if (_c780) {
            const _t756 = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
            let _q757 = false;
            Q758: {
              const _f760 = new Int32Array(sp.edges.length).fill(-1);
              let _l761: readonly number[] = [];
              const _s762: number[] = [];
              const _a759 = sp.cellEdges[_t756];
              for (const _e763 of _l761) _f760[_e763] = -1;
              _l761 = _a759;
              let _i765 = 0;
              _s762[0] = 0;
              let _o769 = _a759.length === 0;
              for (;;) {
                if (_a759.length === 0) {
                  if (!_o769) break;
                  _o769 = false;
                }
                while (_a759.length > 0 && _i765 >= 0) {
                  const _e763 = _a759[_i765];
                  if (_s762[_i765] > 0) _f760[_e763] = -1;
                  let _r768 = (cands[_e763] >= 0 ? cands[_e763] : (cands[_e763] = b.cands[_e763])) & ~((2 << _s762[_i765]) - 1);
                  let _d764 = 0;
                  for (; _r768 !== 0; _r768 &= _r768 - 1) {
                    _d764 = 31 - Math.clz32(_r768 & -_r768);
                    _f760[_e763] = _d764;
                    if (_e763 === v_f && _d764 !== 1) continue;
                    break;
                  }
                  if (_r768 === 0) {
                    _s762[_i765] = 0;
                    _i765--;
                    continue;
                  }
                  _s762[_i765] = _d764;
                  if (_i765 === _a759.length - 1) break;
                  _i765++;
                  _s762[_i765] = 0;
                }
                if (_i765 < 0) break;
                let _c774: boolean = (clueAt(cl.pearl, _t756) !== 2);
                if (_c774) {
                  let _g770 = 0;
                  G771: {
                    const _a772 = sp.cellEdges[_t756];
                    for (let _i773 = 0; _i773 < _a772.length; _i773++) {
                      const v_x = _a772[_i773];
                      if (!((_f760[v_x] === 1))) continue;
                      _g770++;
                    }
                  }
                  _c774 = (_g770 === 2);
                }
                let _c779: boolean = _c774;
                if (_c779) {
                  let _q775 = true;
                  Q776: {
                    const _a777 = sp.cellEdges[_t756];
                    for (let _i778 = 0; _i778 < _a777.length; _i778++) {
                      const v_x = _a777[_i778];
                      if (!(((_f760[v_x] === 1) && (v_x !== v_f)))) continue;
                      if (!(bent(sp, v_x, v_f))) {
                        _q775 = false;
                        break Q776;
                      }
                    }
                  }
                  _c779 = _q775;
                }
                if (!(_c779)) continue;
                if (true) {
                  _q757 = true;
                  break Q758;
                }
              }
            }
            _c780 = !(_q757);
          }
          const _g781: number[] = [];
          G782: {
            const _a785 = sp.cellEdges[v_c];
            for (let _i786 = 0; _i786 < _a785.length; _i786++) {
              const v_x = _a785[_i786];
              if (!(((v_x !== v_e) && (v_x !== v_f)))) continue;
              _g781.push(v_x);
            }
          }
          freshBinding("whiteCannotTurn", [(sp.cells.includes(v_c)), _c730, (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) !== 2), (sp.cellEdges[v_c].includes(v_f)), _c780, sameSet(v_P, _g781)], ["c in", "where of c", "e in", "where of e", "f in", "where of f", "P ="]);
        }
        facts.length = 0;
        changed = false;
        if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
        let _c787: boolean = true;
        if (_c787) {
          if (!(b.grid[v_f] !== 0)) { if (fire === null) { b.placeAt(v_f, 2); changed = true; } else facts.push(PLACE, v_f, 2); }
          _c787 = true;
        }
        let _c793: boolean = (_c787 && (_h788 === 2));
        if (_c793) {
          let _q789 = true;
          Q790: {
            const _a791 = v_P;
            for (let _i792 = 0; _i792 < _a791.length; _i792++) {
              const v_x = _a791[_i792];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q789 = false;
                break Q790;
              }
            }
          }
          _c793 = _q789;
        }
        if (!(_c793)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, e: v_e, f: v_f, P: v_P.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

export interface WhiteTurnsOppositeBinding {
  c: number;
  e: number;
  f: number;
  k: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const whiteTurnsOppositeFacts: number[] = [];
let whiteTurnsOppositeCands = new Int32Array(0);
let _p973 = new Int32Array(0);
let _l974: readonly number[] = [];
let _f979 = new Int32Array(0);
let _l980: readonly number[] = [];
let _f1006 = new Int32Array(0);
let _l1007: readonly number[] = [];
let _f1068 = new Int32Array(0);
let _l1069: readonly number[] = [];
let _f1121 = new Int32Array(0);
let _l1122: readonly number[] = [];

/** What a binding at one element of its first binder reads. */
const whiteTurnsOppositeFootprint: Footprint = {"sort":"cell","reads":[{"steps":["cellEdges"],"kind":"answer"},{"steps":["cellEdges","edgeEnds","cellEdges"],"kind":"answer"}],"relation":false};

/** Its dearest read grows with the board as 1. */
export function whiteTurnsOpposite(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<WhiteTurnsOppositeBinding> | null): number {
  if (_p973.length < sp.edges.length) _p973 = new Int32Array(sp.edges.length);
  else _p973.fill(0);
  _l974 = [];
  let _y975 = false;
  if (_f979.length < sp.edges.length) _f979 = new Int32Array(sp.edges.length).fill(-1);
  else _f979.fill(-1);
  _l980 = [];
  const _s981: number[] = [];
  if (_f1006.length < sp.edges.length) _f1006 = new Int32Array(sp.edges.length).fill(-1);
  else _f1006.fill(-1);
  _l1007 = [];
  const _s1008: number[] = [];
  const _g1028: number[] = [];
  const _g1036: number[] = [];
  if (_f1068.length < sp.edges.length) _f1068 = new Int32Array(sp.edges.length).fill(-1);
  else _f1068.fill(-1);
  _l1069 = [];
  const _s1070: number[] = [];
  const _g1089: number[] = [];
  if (_f1121.length < sp.edges.length) _f1121 = new Int32Array(sp.edges.length).fill(-1);
  else _f1121.fill(-1);
  _l1122 = [];
  const _s1123: number[] = [];
  const facts = whiteTurnsOppositeFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (whiteTurnsOppositeCands.length < sp.edges.length) whiteTurnsOppositeCands = new Int32Array(sp.edges.length);
  const cands = whiteTurnsOppositeCands;
  cands.fill(-1);
  const _visit = fire === null ? (b.visit?.(whiteTurnsOppositeFootprint) ?? null) : null;
  const _a965 = cluesValued(cl.pearl, 2);
  for (let _i966 = 0; _i966 < _a965.length; _i966++) {
    const v_c = _a965[_i966];
    const _h967 = clueAt(cl.pearl, v_c);
    if (_visit !== null) { if (_visit[v_c] === 0) continue; _visit[v_c] = 0; }
    if (!((_h967 === 2))) continue;
    const _a968 = sp.cellEdges[v_c];
    R2:
    for (let _i969 = 0; _i969 < _a968.length; _i969++) {
      const v_e = _a968[_i969];
      const _m160_0 = b.made[0];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      const _h972 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
      let _g976 = -1;
      const _h989 = clueAt(cl.pearl, _h972);
      const _h990 = (_h989 !== 2);
      const _a970 = sp.cellEdges[v_c];
      for (let _i971 = 0; _i971 < _a970.length; _i971++) {
        const v_f = _a970[_i971];
        let _c1001: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
        if (_c1001) {
          if (_g976 !== _epoch) {
            _g976 = _epoch;
            for (const _e977 of _l974) _p973[_e977] = 0;
            _y975 = false;
            const _a978 = sp.cellEdges[_h972];
            for (const _e982 of _l980) _f979[_e982] = -1;
            _l980 = _a978;
            let _i984 = 0;
            _s981[0] = 0;
            let _o988 = _a978.length === 0;
            for (;;) {
              if (_a978.length === 0) {
                if (!_o988) break;
                _o988 = false;
              }
              while (_a978.length > 0 && _i984 >= 0) {
                const _e982 = _a978[_i984];
                if (_s981[_i984] > 0) _f979[_e982] = -1;
                let _r987 = (cands[_e982] >= 0 ? cands[_e982] : (cands[_e982] = b.cands[_e982])) & ~((2 << _s981[_i984]) - 1);
                let _d983 = 0;
                for (; _r987 !== 0; _r987 &= _r987 - 1) {
                  _d983 = 31 - Math.clz32(_r987 & -_r987);
                  _f979[_e982] = _d983;
                  break;
                }
                if (_r987 === 0) {
                  _s981[_i984] = 0;
                  _i984--;
                  continue;
                }
                _s981[_i984] = _d983;
                if (_i984 === _a978.length - 1) break;
                _i984++;
                _s981[_i984] = 0;
              }
              if (_i984 < 0) break;
              let _c995: boolean = _h990;
              if (_c995) {
                let _g991 = 0;
                G992: {
                  const _a993 = sp.cellEdges[_h972];
                  for (let _i994 = 0; _i994 < _a993.length; _i994++) {
                    const v_x = _a993[_i994];
                    if (!((_f979[v_x] === 1))) continue;
                    _g991++;
                  }
                }
                _c995 = (_g991 === 2);
              }
              let _c1000: boolean = _c995;
              if (_c1000) {
                let _q996 = true;
                Q997: {
                  const _a998 = sp.cellEdges[_h972];
                  for (let _i999 = 0; _i999 < _a998.length; _i999++) {
                    const v_x = _a998[_i999];
                    if (!(((_f979[v_x] === 1) && (v_x !== v_e)))) continue;
                    if (!(bent(sp, v_x, v_e))) {
                      _q996 = false;
                      break Q997;
                    }
                  }
                }
                _c1000 = _q996;
              }
              if (!(_c1000)) continue;
              if (!(true)) continue;
              _l974 = _a978;
              _y975 = true;
              for (const _e977 of _a978) _p973[_e977] |= 1 << _f979[_e977];
            }
          }
          _c1001 = !(((((_p973[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y975 && !sp.cellEdges[_h972].includes(v_e))));
        }
        if (!(_c1001)) continue;
        L1002: {
          const v_k = (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f]);
          const _h1016 = clueAt(cl.pearl, v_k);
          const _h1017 = (_h1016 !== 1);
          let _q1003 = false;
          Q1004: {
            const _a1005 = sp.cellEdges[v_k];
            for (const _e1009 of _l1007) _f1006[_e1009] = -1;
            _l1007 = _a1005;
            let _i1011 = 0;
            _s1008[0] = 0;
            let _o1015 = _a1005.length === 0;
            for (;;) {
              if (_a1005.length === 0) {
                if (!_o1015) break;
                _o1015 = false;
              }
              while (_a1005.length > 0 && _i1011 >= 0) {
                const _e1009 = _a1005[_i1011];
                if (_s1008[_i1011] > 0) _f1006[_e1009] = -1;
                let _r1014 = (cands[_e1009] >= 0 ? cands[_e1009] : (cands[_e1009] = b.cands[_e1009])) & ~((2 << _s1008[_i1011]) - 1);
                let _d1010 = 0;
                for (; _r1014 !== 0; _r1014 &= _r1014 - 1) {
                  _d1010 = 31 - Math.clz32(_r1014 & -_r1014);
                  _f1006[_e1009] = _d1010;
                  if (_e1009 === v_f && _d1010 !== 1) continue;
                  break;
                }
                if (_r1014 === 0) {
                  _s1008[_i1011] = 0;
                  _i1011--;
                  continue;
                }
                _s1008[_i1011] = _d1010;
                if (_i1011 === _a1005.length - 1) break;
                _i1011++;
                _s1008[_i1011] = 0;
              }
              if (_i1011 < 0) break;
              let _c1022: boolean = _h1017;
              if (_c1022) {
                let _g1018 = 0;
                G1019: {
                  const _a1020 = sp.cellEdges[v_k];
                  for (let _i1021 = 0; _i1021 < _a1020.length; _i1021++) {
                    const v_x = _a1020[_i1021];
                    if (!((_f1006[v_x] === 1))) continue;
                    _g1018++;
                  }
                }
                _c1022 = (_g1018 === 2);
              }
              let _c1027: boolean = _c1022;
              if (_c1027) {
                let _q1023 = true;
                Q1024: {
                  const _a1025 = sp.cellEdges[v_k];
                  for (let _i1026 = 0; _i1026 < _a1025.length; _i1026++) {
                    const v_x = _a1025[_i1026];
                    if (!(((_f1006[v_x] === 1) && (v_x !== v_f)))) continue;
                    if (!(!(bent(sp, v_x, v_f)))) {
                      _q1023 = false;
                      break Q1024;
                    }
                  }
                }
                _c1027 = _q1023;
              }
              if (!(_c1027)) continue;
              if (true) {
                _q1003 = true;
                break Q1004;
              }
            }
          }
          if (!(_q1003)) break L1002;
          const _h1078 = (_h1016 !== 2);
          _g1028.length = 0;
          G1029: {
            const _a1032 = sp.cellEdges[v_k];
            for (let _i1033 = 0; _i1033 < _a1032.length; _i1033++) {
              const v_x = _a1032[_i1033];
              if (!(!((b.grid[v_x] !== 0)))) continue;
              _g1028.push(v_x);
            }
          }
          L1034: {
            const v_F = _g1028;
            const _h1035 = v_F.length;
            if (!((_h1035 > 0))) break L1034;
            _g1036.length = 0;
            G1037: {
              const _a1063 = v_F;
              for (let _i1064 = 0; _i1064 < _a1063.length; _i1064++) {
                const v_x = _a1063[_i1064];
                let _q1065 = false;
                Q1066: {
                  const _a1067 = sp.cellEdges[v_k];
                  for (const _e1071 of _l1069) _f1068[_e1071] = -1;
                  _l1069 = _a1067;
                  let _i1073 = 0;
                  _s1070[0] = 0;
                  let _o1077 = _a1067.length === 0;
                  for (;;) {
                    if (_a1067.length === 0) {
                      if (!_o1077) break;
                      _o1077 = false;
                    }
                    while (_a1067.length > 0 && _i1073 >= 0) {
                      const _e1071 = _a1067[_i1073];
                      if (_s1070[_i1073] > 0) _f1068[_e1071] = -1;
                      let _r1076 = (cands[_e1071] >= 0 ? cands[_e1071] : (cands[_e1071] = b.cands[_e1071])) & ~((2 << _s1070[_i1073]) - 1);
                      let _d1072 = 0;
                      for (; _r1076 !== 0; _r1076 &= _r1076 - 1) {
                        _d1072 = 31 - Math.clz32(_r1076 & -_r1076);
                        _f1068[_e1071] = _d1072;
                        if (_e1071 === v_f && _d1072 !== 1) continue;
                        if (_e1071 === v_x && _d1072 !== 1) continue;
                        break;
                      }
                      if (_r1076 === 0) {
                        _s1070[_i1073] = 0;
                        _i1073--;
                        continue;
                      }
                      _s1070[_i1073] = _d1072;
                      if (_i1073 === _a1067.length - 1) break;
                      _i1073++;
                      _s1070[_i1073] = 0;
                    }
                    if (_i1073 < 0) break;
                    let _c1083: boolean = _h1078;
                    if (_c1083) {
                      let _g1079 = 0;
                      G1080: {
                        const _a1081 = sp.cellEdges[v_k];
                        for (let _i1082 = 0; _i1082 < _a1081.length; _i1082++) {
                          const v_y = _a1081[_i1082];
                          if (!((_f1068[v_y] === 1))) continue;
                          _g1079++;
                        }
                      }
                      _c1083 = (_g1079 === 2);
                    }
                    let _c1088: boolean = _c1083;
                    if (_c1088) {
                      let _q1084 = true;
                      Q1085: {
                        const _a1086 = sp.cellEdges[v_k];
                        for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
                          const v_y = _a1086[_i1087];
                          if (!(((_f1068[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q1084 = false;
                            break Q1085;
                          }
                        }
                      }
                      _c1088 = _q1084;
                    }
                    if (!(_c1088)) continue;
                    if (true) {
                      _q1065 = true;
                      break Q1066;
                    }
                  }
                }
                if (!(_q1065)) continue;
                _g1036.push(v_x);
              }
            }
            const v_W = _g1036;
            _g1089.length = 0;
            G1090: {
              const _a1116 = v_F;
              for (let _i1117 = 0; _i1117 < _a1116.length; _i1117++) {
                const v_x = _a1116[_i1117];
                let _q1118 = false;
                Q1119: {
                  const _a1120 = sp.cellEdges[v_k];
                  for (const _e1124 of _l1122) _f1121[_e1124] = -1;
                  _l1122 = _a1120;
                  let _i1126 = 0;
                  _s1123[0] = 0;
                  let _o1130 = _a1120.length === 0;
                  for (;;) {
                    if (_a1120.length === 0) {
                      if (!_o1130) break;
                      _o1130 = false;
                    }
                    while (_a1120.length > 0 && _i1126 >= 0) {
                      const _e1124 = _a1120[_i1126];
                      if (_s1123[_i1126] > 0) _f1121[_e1124] = -1;
                      let _r1129 = (cands[_e1124] >= 0 ? cands[_e1124] : (cands[_e1124] = b.cands[_e1124])) & ~((2 << _s1123[_i1126]) - 1);
                      let _d1125 = 0;
                      for (; _r1129 !== 0; _r1129 &= _r1129 - 1) {
                        _d1125 = 31 - Math.clz32(_r1129 & -_r1129);
                        _f1121[_e1124] = _d1125;
                        if (_e1124 === v_f && _d1125 !== 1) continue;
                        if (_e1124 === v_x && _d1125 !== 2) continue;
                        break;
                      }
                      if (_r1129 === 0) {
                        _s1123[_i1126] = 0;
                        _i1126--;
                        continue;
                      }
                      _s1123[_i1126] = _d1125;
                      if (_i1126 === _a1120.length - 1) break;
                      _i1126++;
                      _s1123[_i1126] = 0;
                    }
                    if (_i1126 < 0) break;
                    let _c1135: boolean = _h1078;
                    if (_c1135) {
                      let _g1131 = 0;
                      G1132: {
                        const _a1133 = sp.cellEdges[v_k];
                        for (let _i1134 = 0; _i1134 < _a1133.length; _i1134++) {
                          const v_y = _a1133[_i1134];
                          if (!((_f1121[v_y] === 1))) continue;
                          _g1131++;
                        }
                      }
                      _c1135 = (_g1131 === 2);
                    }
                    let _c1140: boolean = _c1135;
                    if (_c1140) {
                      let _q1136 = true;
                      Q1137: {
                        const _a1138 = sp.cellEdges[v_k];
                        for (let _i1139 = 0; _i1139 < _a1138.length; _i1139++) {
                          const v_y = _a1138[_i1139];
                          if (!(((_f1121[v_y] === 1) && (v_y !== v_f)))) continue;
                          if (!(bent(sp, v_y, v_f))) {
                            _q1136 = false;
                            break Q1137;
                          }
                        }
                      }
                      _c1140 = _q1136;
                    }
                    if (!(_c1140)) continue;
                    if (true) {
                      _q1118 = true;
                      break Q1119;
                    }
                  }
                }
                if (!(_q1118)) continue;
                _g1089.push(v_x);
              }
            }
            L1141: {
              const v_N = _g1089;
              let _q1142 = false;
              Q1143: {
                const _a1144 = v_F;
                for (let _i1145 = 0; _i1145 < _a1144.length; _i1145++) {
                  const v_x = _a1144[_i1145];
                  if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                    _q1142 = true;
                    break Q1143;
                  }
                }
              }
              if (!(_q1142)) break L1141;
              if (b.made[0] !== _m160_0) {
                if (!(((b.grid[v_e] || -1) === 1))) { if (_visit !== null) _visit[v_c] = 1; continue R2; }
              }
              if (import.meta.env.DEV && staleChecking) {
                let _c1170: boolean = (((v_f !== v_e) && ((b.grid[v_f] || -1) === 1)) && !(bent(sp, v_e, v_f)));
                if (_c1170) {
                  const _t1146 = (sp.edgeEnds[2 * v_e] === v_c ? sp.edgeEnds[2 * v_e + 1] : sp.edgeEnds[2 * v_e]);
                  let _q1147 = false;
                  Q1148: {
                    const _f1150 = new Int32Array(sp.edges.length).fill(-1);
                    let _l1151: readonly number[] = [];
                    const _s1152: number[] = [];
                    const _a1149 = sp.cellEdges[_t1146];
                    for (const _e1153 of _l1151) _f1150[_e1153] = -1;
                    _l1151 = _a1149;
                    let _i1155 = 0;
                    _s1152[0] = 0;
                    let _o1159 = _a1149.length === 0;
                    for (;;) {
                      if (_a1149.length === 0) {
                        if (!_o1159) break;
                        _o1159 = false;
                      }
                      while (_a1149.length > 0 && _i1155 >= 0) {
                        const _e1153 = _a1149[_i1155];
                        if (_s1152[_i1155] > 0) _f1150[_e1153] = -1;
                        let _r1158 = (cands[_e1153] >= 0 ? cands[_e1153] : (cands[_e1153] = b.cands[_e1153])) & ~((2 << _s1152[_i1155]) - 1);
                        let _d1154 = 0;
                        for (; _r1158 !== 0; _r1158 &= _r1158 - 1) {
                          _d1154 = 31 - Math.clz32(_r1158 & -_r1158);
                          _f1150[_e1153] = _d1154;
                          if (_e1153 === v_e && _d1154 !== 1) continue;
                          break;
                        }
                        if (_r1158 === 0) {
                          _s1152[_i1155] = 0;
                          _i1155--;
                          continue;
                        }
                        _s1152[_i1155] = _d1154;
                        if (_i1155 === _a1149.length - 1) break;
                        _i1155++;
                        _s1152[_i1155] = 0;
                      }
                      if (_i1155 < 0) break;
                      let _c1164: boolean = (clueAt(cl.pearl, _t1146) !== 2);
                      if (_c1164) {
                        let _g1160 = 0;
                        G1161: {
                          const _a1162 = sp.cellEdges[_t1146];
                          for (let _i1163 = 0; _i1163 < _a1162.length; _i1163++) {
                            const v_x = _a1162[_i1163];
                            if (!((_f1150[v_x] === 1))) continue;
                            _g1160++;
                          }
                        }
                        _c1164 = (_g1160 === 2);
                      }
                      let _c1169: boolean = _c1164;
                      if (_c1169) {
                        let _q1165 = true;
                        Q1166: {
                          const _a1167 = sp.cellEdges[_t1146];
                          for (let _i1168 = 0; _i1168 < _a1167.length; _i1168++) {
                            const v_x = _a1167[_i1168];
                            if (!(((_f1150[v_x] === 1) && (v_x !== v_e)))) continue;
                            if (!(bent(sp, v_x, v_e))) {
                              _q1165 = false;
                              break Q1166;
                            }
                          }
                        }
                        _c1169 = _q1165;
                      }
                      if (!(_c1169)) continue;
                      if (true) {
                        _q1147 = true;
                        break Q1148;
                      }
                    }
                  }
                  _c1170 = !(_q1147);
                }
                let _q1171 = false;
                Q1172: {
                  const _f1174 = new Int32Array(sp.edges.length).fill(-1);
                  let _l1175: readonly number[] = [];
                  const _s1176: number[] = [];
                  const _a1173 = sp.cellEdges[v_k];
                  for (const _e1177 of _l1175) _f1174[_e1177] = -1;
                  _l1175 = _a1173;
                  let _i1179 = 0;
                  _s1176[0] = 0;
                  let _o1183 = _a1173.length === 0;
                  for (;;) {
                    if (_a1173.length === 0) {
                      if (!_o1183) break;
                      _o1183 = false;
                    }
                    while (_a1173.length > 0 && _i1179 >= 0) {
                      const _e1177 = _a1173[_i1179];
                      if (_s1176[_i1179] > 0) _f1174[_e1177] = -1;
                      let _r1182 = (cands[_e1177] >= 0 ? cands[_e1177] : (cands[_e1177] = b.cands[_e1177])) & ~((2 << _s1176[_i1179]) - 1);
                      let _d1178 = 0;
                      for (; _r1182 !== 0; _r1182 &= _r1182 - 1) {
                        _d1178 = 31 - Math.clz32(_r1182 & -_r1182);
                        _f1174[_e1177] = _d1178;
                        if (_e1177 === v_f && _d1178 !== 1) continue;
                        break;
                      }
                      if (_r1182 === 0) {
                        _s1176[_i1179] = 0;
                        _i1179--;
                        continue;
                      }
                      _s1176[_i1179] = _d1178;
                      if (_i1179 === _a1173.length - 1) break;
                      _i1179++;
                      _s1176[_i1179] = 0;
                    }
                    if (_i1179 < 0) break;
                    let _c1188: boolean = (clueAt(cl.pearl, v_k) !== 1);
                    if (_c1188) {
                      let _g1184 = 0;
                      G1185: {
                        const _a1186 = sp.cellEdges[v_k];
                        for (let _i1187 = 0; _i1187 < _a1186.length; _i1187++) {
                          const v_x = _a1186[_i1187];
                          if (!((_f1174[v_x] === 1))) continue;
                          _g1184++;
                        }
                      }
                      _c1188 = (_g1184 === 2);
                    }
                    let _c1193: boolean = _c1188;
                    if (_c1193) {
                      let _q1189 = true;
                      Q1190: {
                        const _a1191 = sp.cellEdges[v_k];
                        for (let _i1192 = 0; _i1192 < _a1191.length; _i1192++) {
                          const v_x = _a1191[_i1192];
                          if (!(((_f1174[v_x] === 1) && (v_x !== v_f)))) continue;
                          if (!(!(bent(sp, v_x, v_f)))) {
                            _q1189 = false;
                            break Q1190;
                          }
                        }
                      }
                      _c1193 = _q1189;
                    }
                    if (!(_c1193)) continue;
                    if (true) {
                      _q1171 = true;
                      break Q1172;
                    }
                  }
                }
                const _g1194: number[] = [];
                G1195: {
                  const _a1198 = sp.cellEdges[v_k];
                  for (let _i1199 = 0; _i1199 < _a1198.length; _i1199++) {
                    const v_x = _a1198[_i1199];
                    if (!(!((b.grid[v_x] !== 0)))) continue;
                    _g1194.push(v_x);
                  }
                }
                const _g1200: number[] = [];
                G1201: {
                  const _a1227 = v_F;
                  for (let _i1228 = 0; _i1228 < _a1227.length; _i1228++) {
                    const v_x = _a1227[_i1228];
                    let _q1229 = false;
                    Q1230: {
                      const _f1232 = new Int32Array(sp.edges.length).fill(-1);
                      let _l1233: readonly number[] = [];
                      const _s1234: number[] = [];
                      const _a1231 = sp.cellEdges[v_k];
                      for (const _e1235 of _l1233) _f1232[_e1235] = -1;
                      _l1233 = _a1231;
                      let _i1237 = 0;
                      _s1234[0] = 0;
                      let _o1241 = _a1231.length === 0;
                      for (;;) {
                        if (_a1231.length === 0) {
                          if (!_o1241) break;
                          _o1241 = false;
                        }
                        while (_a1231.length > 0 && _i1237 >= 0) {
                          const _e1235 = _a1231[_i1237];
                          if (_s1234[_i1237] > 0) _f1232[_e1235] = -1;
                          let _r1240 = (cands[_e1235] >= 0 ? cands[_e1235] : (cands[_e1235] = b.cands[_e1235])) & ~((2 << _s1234[_i1237]) - 1);
                          let _d1236 = 0;
                          for (; _r1240 !== 0; _r1240 &= _r1240 - 1) {
                            _d1236 = 31 - Math.clz32(_r1240 & -_r1240);
                            _f1232[_e1235] = _d1236;
                            if (_e1235 === v_f && _d1236 !== 1) continue;
                            if (_e1235 === v_x && _d1236 !== 1) continue;
                            break;
                          }
                          if (_r1240 === 0) {
                            _s1234[_i1237] = 0;
                            _i1237--;
                            continue;
                          }
                          _s1234[_i1237] = _d1236;
                          if (_i1237 === _a1231.length - 1) break;
                          _i1237++;
                          _s1234[_i1237] = 0;
                        }
                        if (_i1237 < 0) break;
                        let _c1246: boolean = (clueAt(cl.pearl, v_k) !== 2);
                        if (_c1246) {
                          let _g1242 = 0;
                          G1243: {
                            const _a1244 = sp.cellEdges[v_k];
                            for (let _i1245 = 0; _i1245 < _a1244.length; _i1245++) {
                              const v_y = _a1244[_i1245];
                              if (!((_f1232[v_y] === 1))) continue;
                              _g1242++;
                            }
                          }
                          _c1246 = (_g1242 === 2);
                        }
                        let _c1251: boolean = _c1246;
                        if (_c1251) {
                          let _q1247 = true;
                          Q1248: {
                            const _a1249 = sp.cellEdges[v_k];
                            for (let _i1250 = 0; _i1250 < _a1249.length; _i1250++) {
                              const v_y = _a1249[_i1250];
                              if (!(((_f1232[v_y] === 1) && (v_y !== v_f)))) continue;
                              if (!(bent(sp, v_y, v_f))) {
                                _q1247 = false;
                                break Q1248;
                              }
                            }
                          }
                          _c1251 = _q1247;
                        }
                        if (!(_c1251)) continue;
                        if (true) {
                          _q1229 = true;
                          break Q1230;
                        }
                      }
                    }
                    if (!(_q1229)) continue;
                    _g1200.push(v_x);
                  }
                }
                const _g1252: number[] = [];
                G1253: {
                  const _a1279 = v_F;
                  for (let _i1280 = 0; _i1280 < _a1279.length; _i1280++) {
                    const v_x = _a1279[_i1280];
                    let _q1281 = false;
                    Q1282: {
                      const _f1284 = new Int32Array(sp.edges.length).fill(-1);
                      let _l1285: readonly number[] = [];
                      const _s1286: number[] = [];
                      const _a1283 = sp.cellEdges[v_k];
                      for (const _e1287 of _l1285) _f1284[_e1287] = -1;
                      _l1285 = _a1283;
                      let _i1289 = 0;
                      _s1286[0] = 0;
                      let _o1293 = _a1283.length === 0;
                      for (;;) {
                        if (_a1283.length === 0) {
                          if (!_o1293) break;
                          _o1293 = false;
                        }
                        while (_a1283.length > 0 && _i1289 >= 0) {
                          const _e1287 = _a1283[_i1289];
                          if (_s1286[_i1289] > 0) _f1284[_e1287] = -1;
                          let _r1292 = (cands[_e1287] >= 0 ? cands[_e1287] : (cands[_e1287] = b.cands[_e1287])) & ~((2 << _s1286[_i1289]) - 1);
                          let _d1288 = 0;
                          for (; _r1292 !== 0; _r1292 &= _r1292 - 1) {
                            _d1288 = 31 - Math.clz32(_r1292 & -_r1292);
                            _f1284[_e1287] = _d1288;
                            if (_e1287 === v_f && _d1288 !== 1) continue;
                            if (_e1287 === v_x && _d1288 !== 2) continue;
                            break;
                          }
                          if (_r1292 === 0) {
                            _s1286[_i1289] = 0;
                            _i1289--;
                            continue;
                          }
                          _s1286[_i1289] = _d1288;
                          if (_i1289 === _a1283.length - 1) break;
                          _i1289++;
                          _s1286[_i1289] = 0;
                        }
                        if (_i1289 < 0) break;
                        let _c1298: boolean = (clueAt(cl.pearl, v_k) !== 2);
                        if (_c1298) {
                          let _g1294 = 0;
                          G1295: {
                            const _a1296 = sp.cellEdges[v_k];
                            for (let _i1297 = 0; _i1297 < _a1296.length; _i1297++) {
                              const v_y = _a1296[_i1297];
                              if (!((_f1284[v_y] === 1))) continue;
                              _g1294++;
                            }
                          }
                          _c1298 = (_g1294 === 2);
                        }
                        let _c1303: boolean = _c1298;
                        if (_c1303) {
                          let _q1299 = true;
                          Q1300: {
                            const _a1301 = sp.cellEdges[v_k];
                            for (let _i1302 = 0; _i1302 < _a1301.length; _i1302++) {
                              const v_y = _a1301[_i1302];
                              if (!(((_f1284[v_y] === 1) && (v_y !== v_f)))) continue;
                              if (!(bent(sp, v_y, v_f))) {
                                _q1299 = false;
                                break Q1300;
                              }
                            }
                          }
                          _c1303 = _q1299;
                        }
                        if (!(_c1303)) continue;
                        if (true) {
                          _q1281 = true;
                          break Q1282;
                        }
                      }
                    }
                    if (!(_q1281)) continue;
                    _g1252.push(v_x);
                  }
                }
                let _q1304 = false;
                Q1305: {
                  const _a1306 = v_F;
                  for (let _i1307 = 0; _i1307 < _a1306.length; _i1307++) {
                    const v_x = _a1306[_i1307];
                    if ((!(v_W.includes(v_x)) || !(v_N.includes(v_x)))) {
                      _q1304 = true;
                      break Q1305;
                    }
                  }
                }
                freshBinding("whiteTurnsOpposite", [(sp.cells.includes(v_c)), (clueAt(cl.pearl, v_c) === 2), (sp.cellEdges[v_c].includes(v_e)), ((b.grid[v_e] || -1) === 1), (sp.cellEdges[v_c].includes(v_f)), _c1170, (v_k === (sp.edgeEnds[2 * v_f] === v_c ? sp.edgeEnds[2 * v_f + 1] : sp.edgeEnds[2 * v_f])), _q1171, sameSet(v_F, _g1194), (v_F.length > 0), sameSet(v_W, _g1200), sameSet(v_N, _g1252), _q1304], ["c in", "where of c", "e in", "where of e", "f in", "where of f", "k =", "where of k", "F =", "where of F", "W =", "N =", "where of N"]);
              }
              facts.length = 0;
              changed = false;
              let _q1308 = true;
              Q1309: {
                const _a1310 = v_F;
                for (let _i1311 = 0; _i1311 < _a1310.length; _i1311++) {
                  const v_x = _a1310[_i1311];
                  let _c1313: boolean = ((v_W.includes(v_x)) || (v_N.includes(v_x)));
                  if (_c1313) {
                    let _c1312: boolean = !(!(v_W.includes(v_x)));
                    if (!_c1312) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                      _c1312 = true;
                    }
                    _c1313 = _c1312;
                  }
                  let _c1315: boolean = _c1313;
                  if (_c1315) {
                    let _c1314: boolean = !(!(v_N.includes(v_x)));
                    if (!_c1314) {
                      if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                      _c1314 = true;
                    }
                    _c1315 = _c1314;
                  }
                  if (!(_c1315)) {
                    _q1308 = false;
                    break Q1309;
                  }
                }
              }
              if (!(_q1308)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ c: v_c, e: v_e, f: v_f, k: v_k, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
                cands.fill(-1);
                _epoch++;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface ClosedBinding {
  L: readonly number[];
  g: number;
  G: readonly number[];
}

const closedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function closed(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ClosedBinding> | null): number {
  const _g1337: number[] = [];
  const facts = closedFacts;
  let fired = 0;
  let changed = false;
  _g1337.length = 0;
  G1338: {
    const _a1341 = sp.edges;
    for (let _i1342 = 0; _i1342 < _a1341.length; _i1342++) {
      const v_e = _a1341[_i1342];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1337.push(v_e);
    }
  }
  const v_L = _g1337;
  const _eg1358 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  L1343: {
    const v_g = (v_L.length > 0 ? v_L[0] : -1);
    let _c1348: boolean = (v_g !== -1);
    if (_c1348) {
      let _q1344 = false;
      Q1345: {
        const _a1346 = sp.edges;
        for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
          const v_e = _a1346[_i1347];
          if (!((b.grid[v_e] !== 0))) {
            _q1344 = true;
            break Q1345;
          }
        }
      }
      _c1348 = _q1344;
    }
    let _c1357: boolean = _c1348;
    if (_c1357) {
      let _q1349 = true;
      Q1350: {
        const _a1351 = sp.cells;
        for (let _i1352 = 0; _i1352 < _a1351.length; _i1352++) {
          const v_c = _a1351[_i1352];
          let _g1353 = 0;
          G1354: {
            const _a1355 = sp.cellEdges[v_c];
            for (let _i1356 = 0; _i1356 < _a1355.length; _i1356++) {
              const v_e = _a1355[_i1356];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1353++;
            }
          }
          if (!((_g1353 !== 1))) {
            _q1349 = false;
            break Q1350;
          }
        }
      }
      _c1357 = _q1349;
    }
    if (!(_c1357)) break L1343;
    const v_G = _eg1358.of(sp.edgeEnds[2 * v_g]);
    if (import.meta.env.DEV && staleChecking) {
      const _g1359: number[] = [];
      G1360: {
        const _a1363 = sp.edges;
        for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
          const v_e = _a1363[_i1364];
          if (!(((b.grid[v_e] || -1) === 1))) continue;
          _g1359.push(v_e);
        }
      }
      let _c1369: boolean = (v_g !== -1);
      if (_c1369) {
        let _q1365 = false;
        Q1366: {
          const _a1367 = sp.edges;
          for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
            const v_e = _a1367[_i1368];
            if (!((b.grid[v_e] !== 0))) {
              _q1365 = true;
              break Q1366;
            }
          }
        }
        _c1369 = _q1365;
      }
      let _c1378: boolean = _c1369;
      if (_c1378) {
        let _q1370 = true;
        Q1371: {
          const _a1372 = sp.cells;
          for (let _i1373 = 0; _i1373 < _a1372.length; _i1373++) {
            const v_c = _a1372[_i1373];
            let _g1374 = 0;
            G1375: {
              const _a1376 = sp.cellEdges[v_c];
              for (let _i1377 = 0; _i1377 < _a1376.length; _i1377++) {
                const v_e = _a1376[_i1377];
                if (!(((b.grid[v_e] || -1) === 1))) continue;
                _g1374++;
              }
            }
            if (!((_g1374 !== 1))) {
              _q1370 = false;
              break Q1371;
            }
          }
        }
        _c1378 = _q1370;
      }
      freshBinding("closed", [sameSet(v_L, _g1359), (v_g === (v_L.length > 0 ? v_L[0] : -1)), _c1378, sameSet(v_G, through(sp, sp.edgeEnds[2 * v_g], v_L))], ["L =", "g =", "where of g", "G ="]);
    }
    facts.length = 0;
    changed = false;
    let _q1379 = true;
    Q1380: {
      const _a1381 = v_L;
      for (let _i1382 = 0; _i1382 < _a1381.length; _i1382++) {
        const v_x = _a1381[_i1382];
        if (!((_eg1358.of(sp.edgeEnds[2 * v_x]) === v_G))) {
          _q1379 = false;
          break Q1380;
        }
      }
    }
    let _c1388: boolean = _q1379;
    if (_c1388) {
      let _q1383 = true;
      Q1384: {
        const _a1385 = sp.cells;
        for (let _i1386 = 0; _i1386 < _a1385.length; _i1386++) {
          const v_c = _a1385[_i1386];
          const _h1387 = clueAt(cl.pearl, v_c);
          if (!((_h1387 !== -1))) continue;
          if (!((_eg1358.of(v_c) === v_G))) {
            _q1383 = false;
            break Q1384;
          }
        }
      }
      _c1388 = _q1383;
    }
    let _c1393: boolean = _c1388;
    if (_c1393) {
      let _q1389 = true;
      Q1390: {
        const _a1391 = sp.edges;
        for (let _i1392 = 0; _i1392 < _a1391.length; _i1392++) {
          const v_e = _a1391[_i1392];
          if (!(!((b.grid[v_e] !== 0)))) continue;
          if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
          if (!(true)) {
            _q1389 = false;
            break Q1390;
          }
        }
      }
      _c1393 = _q1389;
    }
    if (!(_c1393)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ L: v_L.slice(), g: v_g, G: v_G.slice() }, facts)) return 1;
    }
  }
  return fired;
}

export interface EarlyLoopBinding {
  L: readonly number[];
  e: number;
  G: readonly number[];
}

const earlyLoopFacts: number[] = [];

/** Its dearest read grows with the board as n^2. */
export function earlyLoop(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyLoopBinding> | null): number {
  const _g1414: number[] = [];
  const facts = earlyLoopFacts;
  let fired = 0;
  let changed = false;
  const _m246_0 = b.made[0];
  _g1414.length = 0;
  G1415: {
    const _a1418 = sp.edges;
    for (let _i1419 = 0; _i1419 < _a1418.length; _i1419++) {
      const v_e = _a1418[_i1419];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1414.push(v_e);
    }
  }
  const v_L = _g1414;
  const _m249_1 = b.made[1];
  const _eg1422 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  const _a1420 = sp.edges;
  R1:
  for (let _i1421 = 0; _i1421 < _a1420.length; _i1421++) {
    const v_e = _a1420[_i1421];
    if (!(!((b.grid[v_e] !== 0)))) continue;
    L1423: {
      const v_G = _eg1422.of(sp.edgeEnds[2 * v_e]);
      let _c1435: boolean = (_eg1422.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
      if (_c1435) {
        let _q1424 = false;
        Q1425: {
          const _a1426 = sp.cells;
          for (let _i1427 = 0; _i1427 < _a1426.length; _i1427++) {
            const v_c = _a1426[_i1427];
            const _h1428 = clueAt(cl.pearl, v_c);
            let _c1434: boolean = !(_eg1422.of(v_c) === v_G);
            if (_c1434) {
              let _c1433: boolean = (_h1428 !== -1);
              if (!_c1433) {
                let _g1429 = 0;
                G1430: {
                  const _a1431 = sp.cellEdges[v_c];
                  for (let _i1432 = 0; _i1432 < _a1431.length; _i1432++) {
                    const v_e = _a1431[_i1432];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1429++;
                  }
                }
                _c1433 = (_g1429 > 0);
              }
              _c1434 = _c1433;
            }
            if (_c1434) {
              _q1424 = true;
              break Q1425;
            }
          }
        }
        _c1435 = _q1424;
      }
      if (!(_c1435)) break L1423;
      if (b.made[0] !== _m246_0 || b.made[1] !== _m249_1) {
        const _now1436 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true).of(sp.edgeEnds[2 * v_e]);
        if (!(_now1436 === _eg1422.of(sp.edgeEnds[2 * v_e]) || sameSet(_now1436, _eg1422.of(sp.edgeEnds[2 * v_e])))) { continue R1; }
      }
      if (import.meta.env.DEV && staleChecking) {
        const _g1437: number[] = [];
        G1438: {
          const _a1441 = sp.edges;
          for (let _i1442 = 0; _i1442 < _a1441.length; _i1442++) {
            const v_e = _a1441[_i1442];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1437.push(v_e);
          }
        }
        const _fg1443 = edgeGroups(sp, _g1437);
        let _c1454: boolean = (_eg1422.of(sp.edgeEnds[2 * v_e + 1]) === v_G);
        if (_c1454) {
          let _q1444 = false;
          Q1445: {
            const _a1446 = sp.cells;
            for (let _i1447 = 0; _i1447 < _a1446.length; _i1447++) {
              const v_c = _a1446[_i1447];
              let _c1453: boolean = !(_eg1422.of(v_c) === v_G);
              if (_c1453) {
                let _c1452: boolean = (clueAt(cl.pearl, v_c) !== -1);
                if (!_c1452) {
                  let _g1448 = 0;
                  G1449: {
                    const _a1450 = sp.cellEdges[v_c];
                    for (let _i1451 = 0; _i1451 < _a1450.length; _i1451++) {
                      const v_e = _a1450[_i1451];
                      if (!(((b.grid[v_e] || -1) === 1))) continue;
                      _g1448++;
                    }
                  }
                  _c1452 = (_g1448 > 0);
                }
                _c1453 = _c1452;
              }
              if (_c1453) {
                _q1444 = true;
                break Q1445;
              }
            }
          }
          _c1454 = _q1444;
        }
        freshBinding("earlyLoop", [sameSet(_fg1443.of(sp.edgeEnds[2 * v_e]), _eg1422.of(sp.edgeEnds[2 * v_e])), (sp.edges.includes(v_e)), !((b.grid[v_e] !== 0)), sameSet(v_G, through(sp, sp.edgeEnds[2 * v_e], v_L)), _c1454], ["L's groups", "e in", "where of e", "G =", "where of G"]);
      }
      facts.length = 0;
      changed = false;
      if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
      if (!(true)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ L: v_L.slice(), e: v_e, G: v_G.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface EarlyThroughBinding {
  L: readonly number[];
  Q: readonly number[];
  c: number;
  F: readonly number[];
  W: readonly number[];
  N: readonly number[];
}

const earlyThroughFacts: number[] = [];
let earlyThroughCands = new Int32Array(0);
let _p1660 = new Int32Array(0);
let _l1661: readonly number[] = [];
let _f1666 = new Int32Array(0);
let _l1667: readonly number[] = [];
let _p1708 = new Int32Array(0);
let _l1709: readonly number[] = [];
let _f1714 = new Int32Array(0);
let _l1715: readonly number[] = [];

/** Its dearest read grows with the board as n. */
export function earlyThrough(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<EarlyThroughBinding> | null): number {
  const _g1599: number[] = [];
  const _g1605: number[] = [];
  const _g1628: number[] = [];
  const _g1636: number[] = [];
  if (_p1660.length < sp.edges.length) _p1660 = new Int32Array(sp.edges.length);
  else _p1660.fill(0);
  _l1661 = [];
  let _y1662 = false;
  if (_f1666.length < sp.edges.length) _f1666 = new Int32Array(sp.edges.length).fill(-1);
  else _f1666.fill(-1);
  _l1667 = [];
  const _s1668: number[] = [];
  const _g1684: number[] = [];
  if (_p1708.length < sp.edges.length) _p1708 = new Int32Array(sp.edges.length);
  else _p1708.fill(0);
  _l1709 = [];
  let _y1710 = false;
  if (_f1714.length < sp.edges.length) _f1714 = new Int32Array(sp.edges.length).fill(-1);
  else _f1714.fill(-1);
  _l1715 = [];
  const _s1716: number[] = [];
  const _g1734: number[] = [];
  const _g1740: number[] = [];
  const facts = earlyThroughFacts;
  let fired = 0;
  let changed = false;
  let _epoch = 0;
  if (earlyThroughCands.length < sp.edges.length) earlyThroughCands = new Int32Array(sp.edges.length);
  const cands = earlyThroughCands;
  cands.fill(-1);
  const _m268_0 = b.made[0];
  _g1599.length = 0;
  G1600: {
    const _a1603 = sp.edges;
    for (let _i1604 = 0; _i1604 < _a1603.length; _i1604++) {
      const v_e = _a1603[_i1604];
      if (!(((b.grid[v_e] || -1) === 1))) continue;
      _g1599.push(v_e);
    }
  }
  const v_L = _g1599;
  const _m271_1 = b.made[1];
  const _eg1677 = keptEdgeGroups(sp, b, null, edgeHolds0, 0, true);
  _g1605.length = 0;
  G1606: {
    const _a1614 = sp.cells;
    for (let _i1615 = 0; _i1615 < _a1614.length; _i1615++) {
      const v_q = _a1614[_i1615];
      const _h1616 = clueAt(cl.pearl, v_q);
      let _c1621: boolean = (_h1616 !== -1);
      if (!_c1621) {
        let _g1617 = 0;
        G1618: {
          const _a1619 = sp.cellEdges[v_q];
          for (let _i1620 = 0; _i1620 < _a1619.length; _i1620++) {
            const v_e = _a1619[_i1620];
            if (!(((b.grid[v_e] || -1) === 1))) continue;
            _g1617++;
          }
        }
        _c1621 = (_g1617 > 0);
      }
      if (!(_c1621)) continue;
      _g1605.push(v_q);
    }
  }
  const v_Q = _g1605;
  const _a1622 = sp.cells;
  for (let _i1623 = 0; _i1623 < _a1622.length; _i1623++) {
    const v_c = _a1622[_i1623];
    let _g1624 = 0;
    G1625: {
      const _a1626 = sp.cellEdges[v_c];
      for (let _i1627 = 0; _i1627 < _a1626.length; _i1627++) {
        const v_e = _a1626[_i1627];
        if (!(((b.grid[v_e] || -1) === 1))) continue;
        _g1624++;
      }
    }
    if (!((_g1624 === 0))) continue;
    let _g1663 = -1;
    const _h1682 = clueAt(cl.pearl, v_c);
    const _h1683 = (_h1682 === -1);
    let _g1711 = -1;
    _g1628.length = 0;
    G1629: {
      const _a1632 = sp.cellEdges[v_c];
      for (let _i1633 = 0; _i1633 < _a1632.length; _i1633++) {
        const v_e = _a1632[_i1633];
        if (!(!((b.grid[v_e] !== 0)))) continue;
        _g1628.push(v_e);
      }
    }
    L1634: {
      const v_F = _g1628;
      const _h1635 = v_F.length;
      if (!((_h1635 > 1))) break L1634;
      _g1636.length = 0;
      G1637: {
        const _a1658 = v_F;
        for (let _i1659 = 0; _i1659 < _a1658.length; _i1659++) {
          const v_e = _a1658[_i1659];
          if (_g1663 !== _epoch) {
            _g1663 = _epoch;
            for (const _e1664 of _l1661) _p1660[_e1664] = 0;
            _y1662 = false;
            const _a1665 = sp.cellEdges[v_c];
            for (const _e1669 of _l1667) _f1666[_e1669] = -1;
            _l1667 = _a1665;
            let _i1671 = 0;
            _s1668[0] = 0;
            let _o1675 = _a1665.length === 0;
            for (;;) {
              if (_a1665.length === 0) {
                if (!_o1675) break;
                _o1675 = false;
              }
              while (_a1665.length > 0 && _i1671 >= 0) {
                const _e1669 = _a1665[_i1671];
                if (_s1668[_i1671] > 0) _f1666[_e1669] = -1;
                let _r1674 = (cands[_e1669] >= 0 ? cands[_e1669] : (cands[_e1669] = b.cands[_e1669])) & ~((2 << _s1668[_i1671]) - 1);
                let _d1670 = 0;
                V1673: for (; _r1674 !== 0; _r1674 &= _r1674 - 1) {
                  _d1670 = 31 - Math.clz32(_r1674 & -_r1674);
                  _f1666[_e1669] = _d1670;
                  for (let _j1672 = 0; _j1672 < _i1671; _j1672++) {
                    const _y1676 = _a1665[_j1672];
                    if (!(((_f1666[_e1669] === 1) && (_f1666[_y1676] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1669, _y1676)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1669, _y1676)))) && (!(_eg1677.of((sp.edgeEnds[2 * _y1676] === v_c ? sp.edgeEnds[2 * _y1676 + 1] : sp.edgeEnds[2 * _y1676])) === _eg1677.of((sp.edgeEnds[2 * _e1669] === v_c ? sp.edgeEnds[2 * _e1669 + 1] : sp.edgeEnds[2 * _e1669]))) || (minus(minus(v_Q, _eg1677.of((sp.edgeEnds[2 * _e1669] === v_c ? sp.edgeEnds[2 * _e1669 + 1] : sp.edgeEnds[2 * _e1669]))), setOf(v_c)).length === 0))))) continue V1673;
                  }
                  break;
                }
                if (_r1674 === 0) {
                  _s1668[_i1671] = 0;
                  _i1671--;
                  continue;
                }
                _s1668[_i1671] = _d1670;
                if (_i1671 === _a1665.length - 1) break;
                _i1671++;
                _s1668[_i1671] = 0;
              }
              if (_i1671 < 0) break;
              let _g1678 = 0;
              G1679: {
                const _a1680 = sp.cellEdges[v_c];
                for (let _i1681 = 0; _i1681 < _a1680.length; _i1681++) {
                  const v_x = _a1680[_i1681];
                  if (!((_f1666[v_x] === 1))) continue;
                  _g1678++;
                }
              }
              if (!(((_g1678 === 2) || ((_g1678 === 0) && _h1683)))) continue;
              if (!(true)) continue;
              _l1661 = _a1665;
              _y1662 = true;
              for (const _e1664 of _a1665) _p1660[_e1664] |= 1 << _f1666[_e1664];
            }
          }
          if (!(((((_p1660[v_e] >> 1) & 1) !== 0) || ((1 as number) === -1 && _y1662 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1636.push(v_e);
        }
      }
      const v_W = _g1636;
      _g1684.length = 0;
      G1685: {
        const _a1706 = v_F;
        for (let _i1707 = 0; _i1707 < _a1706.length; _i1707++) {
          const v_e = _a1706[_i1707];
          if (_g1711 !== _epoch) {
            _g1711 = _epoch;
            for (const _e1712 of _l1709) _p1708[_e1712] = 0;
            _y1710 = false;
            const _a1713 = sp.cellEdges[v_c];
            for (const _e1717 of _l1715) _f1714[_e1717] = -1;
            _l1715 = _a1713;
            let _i1719 = 0;
            _s1716[0] = 0;
            let _o1723 = _a1713.length === 0;
            for (;;) {
              if (_a1713.length === 0) {
                if (!_o1723) break;
                _o1723 = false;
              }
              while (_a1713.length > 0 && _i1719 >= 0) {
                const _e1717 = _a1713[_i1719];
                if (_s1716[_i1719] > 0) _f1714[_e1717] = -1;
                let _r1722 = (cands[_e1717] >= 0 ? cands[_e1717] : (cands[_e1717] = b.cands[_e1717])) & ~((2 << _s1716[_i1719]) - 1);
                let _d1718 = 0;
                V1721: for (; _r1722 !== 0; _r1722 &= _r1722 - 1) {
                  _d1718 = 31 - Math.clz32(_r1722 & -_r1722);
                  _f1714[_e1717] = _d1718;
                  for (let _j1720 = 0; _j1720 < _i1719; _j1720++) {
                    const _y1724 = _a1713[_j1720];
                    if (!(((_f1714[_e1717] === 1) && (_f1714[_y1724] === 1)))) continue;
                    if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1717, _y1724)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1717, _y1724)))) && (!(_eg1677.of((sp.edgeEnds[2 * _y1724] === v_c ? sp.edgeEnds[2 * _y1724 + 1] : sp.edgeEnds[2 * _y1724])) === _eg1677.of((sp.edgeEnds[2 * _e1717] === v_c ? sp.edgeEnds[2 * _e1717 + 1] : sp.edgeEnds[2 * _e1717]))) || (minus(minus(v_Q, _eg1677.of((sp.edgeEnds[2 * _e1717] === v_c ? sp.edgeEnds[2 * _e1717 + 1] : sp.edgeEnds[2 * _e1717]))), setOf(v_c)).length === 0))))) continue V1721;
                  }
                  break;
                }
                if (_r1722 === 0) {
                  _s1716[_i1719] = 0;
                  _i1719--;
                  continue;
                }
                _s1716[_i1719] = _d1718;
                if (_i1719 === _a1713.length - 1) break;
                _i1719++;
                _s1716[_i1719] = 0;
              }
              if (_i1719 < 0) break;
              let _g1725 = 0;
              G1726: {
                const _a1727 = sp.cellEdges[v_c];
                for (let _i1728 = 0; _i1728 < _a1727.length; _i1728++) {
                  const v_x = _a1727[_i1728];
                  if (!((_f1714[v_x] === 1))) continue;
                  _g1725++;
                }
              }
              if (!(((_g1725 === 2) || ((_g1725 === 0) && _h1683)))) continue;
              if (!(true)) continue;
              _l1709 = _a1713;
              _y1710 = true;
              for (const _e1712 of _a1713) _p1708[_e1712] |= 1 << _f1714[_e1712];
            }
          }
          if (!(((((_p1708[v_e] >> 2) & 1) !== 0) || ((2 as number) === -1 && _y1710 && !sp.cellEdges[v_c].includes(v_e))))) continue;
          _g1684.push(v_e);
        }
      }
      L1729: {
        const v_N = _g1684;
        let _q1730 = false;
        Q1731: {
          const _a1732 = v_F;
          for (let _i1733 = 0; _i1733 < _a1732.length; _i1733++) {
            const v_e = _a1732[_i1733];
            if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
              _q1730 = true;
              break Q1731;
            }
          }
        }
        if (!(_q1730)) break L1729;
        if (b.made[0] !== _m268_0 || b.made[1] !== _m271_1) {
          _g1734.length = 0;
          G1735: {
            const _a1738 = sp.edges;
            for (let _i1739 = 0; _i1739 < _a1738.length; _i1739++) {
              const v_e = _a1738[_i1739];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1734.push(v_e);
            }
          }
          if (!(sameSet(v_L, _g1734))) { return fired; }
          _g1740.length = 0;
          G1741: {
            const _a1749 = sp.cells;
            for (let _i1750 = 0; _i1750 < _a1749.length; _i1750++) {
              const v_q = _a1749[_i1750];
              let _c1755: boolean = (clueAt(cl.pearl, v_q) !== -1);
              if (!_c1755) {
                let _g1751 = 0;
                G1752: {
                  const _a1753 = sp.cellEdges[v_q];
                  for (let _i1754 = 0; _i1754 < _a1753.length; _i1754++) {
                    const v_e = _a1753[_i1754];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1751++;
                  }
                }
                _c1755 = (_g1751 > 0);
              }
              if (!(_c1755)) continue;
              _g1740.push(v_q);
            }
          }
          if (!(sameSet(v_Q, _g1740))) { return fired; }
        }
        if (import.meta.env.DEV && staleChecking) {
          const _g1756: number[] = [];
          G1757: {
            const _a1760 = sp.edges;
            for (let _i1761 = 0; _i1761 < _a1760.length; _i1761++) {
              const v_e = _a1760[_i1761];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1756.push(v_e);
            }
          }
          const _g1762: number[] = [];
          G1763: {
            const _a1771 = sp.cells;
            for (let _i1772 = 0; _i1772 < _a1771.length; _i1772++) {
              const v_q = _a1771[_i1772];
              let _c1777: boolean = (clueAt(cl.pearl, v_q) !== -1);
              if (!_c1777) {
                let _g1773 = 0;
                G1774: {
                  const _a1775 = sp.cellEdges[v_q];
                  for (let _i1776 = 0; _i1776 < _a1775.length; _i1776++) {
                    const v_e = _a1775[_i1776];
                    if (!(((b.grid[v_e] || -1) === 1))) continue;
                    _g1773++;
                  }
                }
                _c1777 = (_g1773 > 0);
              }
              if (!(_c1777)) continue;
              _g1762.push(v_q);
            }
          }
          let _g1778 = 0;
          G1779: {
            const _a1780 = sp.cellEdges[v_c];
            for (let _i1781 = 0; _i1781 < _a1780.length; _i1781++) {
              const v_e = _a1780[_i1781];
              if (!(((b.grid[v_e] || -1) === 1))) continue;
              _g1778++;
            }
          }
          const _g1782: number[] = [];
          G1783: {
            const _a1786 = sp.cellEdges[v_c];
            for (let _i1787 = 0; _i1787 < _a1786.length; _i1787++) {
              const v_e = _a1786[_i1787];
              if (!(!((b.grid[v_e] !== 0)))) continue;
              _g1782.push(v_e);
            }
          }
          const _g1788: number[] = [];
          G1789: {
            const _a1810 = v_F;
            for (let _i1811 = 0; _i1811 < _a1810.length; _i1811++) {
              const v_e = _a1810[_i1811];
              let _q1812 = false;
              Q1813: {
                const _f1815 = new Int32Array(sp.edges.length).fill(-1);
                let _l1816: readonly number[] = [];
                const _s1817: number[] = [];
                const _a1814 = sp.cellEdges[v_c];
                for (const _e1818 of _l1816) _f1815[_e1818] = -1;
                _l1816 = _a1814;
                let _i1820 = 0;
                _s1817[0] = 0;
                let _o1824 = _a1814.length === 0;
                for (;;) {
                  if (_a1814.length === 0) {
                    if (!_o1824) break;
                    _o1824 = false;
                  }
                  while (_a1814.length > 0 && _i1820 >= 0) {
                    const _e1818 = _a1814[_i1820];
                    if (_s1817[_i1820] > 0) _f1815[_e1818] = -1;
                    let _r1823 = (cands[_e1818] >= 0 ? cands[_e1818] : (cands[_e1818] = b.cands[_e1818])) & ~((2 << _s1817[_i1820]) - 1);
                    let _d1819 = 0;
                    V1822: for (; _r1823 !== 0; _r1823 &= _r1823 - 1) {
                      _d1819 = 31 - Math.clz32(_r1823 & -_r1823);
                      _f1815[_e1818] = _d1819;
                      if (_e1818 === v_e && _d1819 !== 1) continue;
                      for (let _j1821 = 0; _j1821 < _i1820; _j1821++) {
                        const _y1825 = _a1814[_j1821];
                        if (!(((_f1815[_e1818] === 1) && (_f1815[_y1825] === 1)))) continue;
                        if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1818, _y1825)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1818, _y1825)))) && (!(through(sp, (sp.edgeEnds[2 * _e1818] === v_c ? sp.edgeEnds[2 * _e1818 + 1] : sp.edgeEnds[2 * _e1818]), v_L).includes((sp.edgeEnds[2 * _y1825] === v_c ? sp.edgeEnds[2 * _y1825 + 1] : sp.edgeEnds[2 * _y1825]))) || (minus(minus(v_Q, through(sp, (sp.edgeEnds[2 * _e1818] === v_c ? sp.edgeEnds[2 * _e1818 + 1] : sp.edgeEnds[2 * _e1818]), v_L)), setOf(v_c)).length === 0))))) continue V1822;
                      }
                      break;
                    }
                    if (_r1823 === 0) {
                      _s1817[_i1820] = 0;
                      _i1820--;
                      continue;
                    }
                    _s1817[_i1820] = _d1819;
                    if (_i1820 === _a1814.length - 1) break;
                    _i1820++;
                    _s1817[_i1820] = 0;
                  }
                  if (_i1820 < 0) break;
                  let _g1826 = 0;
                  G1827: {
                    const _a1828 = sp.cellEdges[v_c];
                    for (let _i1829 = 0; _i1829 < _a1828.length; _i1829++) {
                      const v_x = _a1828[_i1829];
                      if (!((_f1815[v_x] === 1))) continue;
                      _g1826++;
                    }
                  }
                  if (!(((_g1826 === 2) || ((_g1826 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q1812 = true;
                    break Q1813;
                  }
                }
              }
              if (!(_q1812)) continue;
              _g1788.push(v_e);
            }
          }
          const _g1830: number[] = [];
          G1831: {
            const _a1852 = v_F;
            for (let _i1853 = 0; _i1853 < _a1852.length; _i1853++) {
              const v_e = _a1852[_i1853];
              let _q1854 = false;
              Q1855: {
                const _f1857 = new Int32Array(sp.edges.length).fill(-1);
                let _l1858: readonly number[] = [];
                const _s1859: number[] = [];
                const _a1856 = sp.cellEdges[v_c];
                for (const _e1860 of _l1858) _f1857[_e1860] = -1;
                _l1858 = _a1856;
                let _i1862 = 0;
                _s1859[0] = 0;
                let _o1866 = _a1856.length === 0;
                for (;;) {
                  if (_a1856.length === 0) {
                    if (!_o1866) break;
                    _o1866 = false;
                  }
                  while (_a1856.length > 0 && _i1862 >= 0) {
                    const _e1860 = _a1856[_i1862];
                    if (_s1859[_i1862] > 0) _f1857[_e1860] = -1;
                    let _r1865 = (cands[_e1860] >= 0 ? cands[_e1860] : (cands[_e1860] = b.cands[_e1860])) & ~((2 << _s1859[_i1862]) - 1);
                    let _d1861 = 0;
                    V1864: for (; _r1865 !== 0; _r1865 &= _r1865 - 1) {
                      _d1861 = 31 - Math.clz32(_r1865 & -_r1865);
                      _f1857[_e1860] = _d1861;
                      if (_e1860 === v_e && _d1861 !== 2) continue;
                      for (let _j1863 = 0; _j1863 < _i1862; _j1863++) {
                        const _y1867 = _a1856[_j1863];
                        if (!(((_f1857[_e1860] === 1) && (_f1857[_y1867] === 1)))) continue;
                        if (!(((((clueAt(cl.pearl, v_c) !== 1) || bent(sp, _e1860, _y1867)) && ((clueAt(cl.pearl, v_c) !== 2) || !(bent(sp, _e1860, _y1867)))) && (!(through(sp, (sp.edgeEnds[2 * _e1860] === v_c ? sp.edgeEnds[2 * _e1860 + 1] : sp.edgeEnds[2 * _e1860]), v_L).includes((sp.edgeEnds[2 * _y1867] === v_c ? sp.edgeEnds[2 * _y1867 + 1] : sp.edgeEnds[2 * _y1867]))) || (minus(minus(v_Q, through(sp, (sp.edgeEnds[2 * _e1860] === v_c ? sp.edgeEnds[2 * _e1860 + 1] : sp.edgeEnds[2 * _e1860]), v_L)), setOf(v_c)).length === 0))))) continue V1864;
                      }
                      break;
                    }
                    if (_r1865 === 0) {
                      _s1859[_i1862] = 0;
                      _i1862--;
                      continue;
                    }
                    _s1859[_i1862] = _d1861;
                    if (_i1862 === _a1856.length - 1) break;
                    _i1862++;
                    _s1859[_i1862] = 0;
                  }
                  if (_i1862 < 0) break;
                  let _g1868 = 0;
                  G1869: {
                    const _a1870 = sp.cellEdges[v_c];
                    for (let _i1871 = 0; _i1871 < _a1870.length; _i1871++) {
                      const v_x = _a1870[_i1871];
                      if (!((_f1857[v_x] === 1))) continue;
                      _g1868++;
                    }
                  }
                  if (!(((_g1868 === 2) || ((_g1868 === 0) && (clueAt(cl.pearl, v_c) === -1))))) continue;
                  if (true) {
                    _q1854 = true;
                    break Q1855;
                  }
                }
              }
              if (!(_q1854)) continue;
              _g1830.push(v_e);
            }
          }
          let _q1872 = false;
          Q1873: {
            const _a1874 = v_F;
            for (let _i1875 = 0; _i1875 < _a1874.length; _i1875++) {
              const v_e = _a1874[_i1875];
              if ((!(v_W.includes(v_e)) || !(v_N.includes(v_e)))) {
                _q1872 = true;
                break Q1873;
              }
            }
          }
          freshBinding("earlyThrough", [sameSet(v_L, _g1756), sameSet(v_Q, _g1762), (sp.cells.includes(v_c)), (_g1778 === 0), sameSet(v_F, _g1782), (v_F.length > 1), sameSet(v_W, _g1788), sameSet(v_N, _g1830), _q1872], ["L =", "Q =", "c in", "where of c", "F =", "where of F", "W =", "N =", "where of N"]);
        }
        facts.length = 0;
        changed = false;
        let _q1876 = true;
        Q1877: {
          const _a1878 = v_F;
          for (let _i1879 = 0; _i1879 < _a1878.length; _i1879++) {
            const v_e = _a1878[_i1879];
            let _c1881: boolean = ((v_W.includes(v_e)) || (v_N.includes(v_e)));
            if (_c1881) {
              let _c1880: boolean = !(!(v_W.includes(v_e)));
              if (!_c1880) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 2); changed = true; } else facts.push(PLACE, v_e, 2); }
                _c1880 = true;
              }
              _c1881 = _c1880;
            }
            let _c1883: boolean = _c1881;
            if (_c1883) {
              let _c1882: boolean = !(!(v_N.includes(v_e)));
              if (!_c1882) {
                if (!(b.grid[v_e] !== 0)) { if (fire === null) { b.placeAt(v_e, 1); changed = true; } else facts.push(PLACE, v_e, 1); }
                _c1882 = true;
              }
              _c1883 = _c1882;
            }
            if (!(_c1883)) {
              _q1876 = false;
              break Q1877;
            }
          }
        }
        if (!(_q1876)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L.slice(), Q: v_Q.slice(), c: v_c, F: v_F.slice(), W: v_W.slice(), N: v_N.slice() }, facts)) return 1;
          cands.fill(-1);
          _epoch++;
        }
      }
    }
  }
  return fired;
}

const bentKept = keptStore<Kept<boolean>>();
let bentOn: object | null = null;
let bentAt: Kept<Kept<boolean>> = [];

/** `bent(e, x)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function bent(sp: GridSpace, v_e: number, v_x: number): boolean {
  if (sp !== bentOn) {
    bentAt = bentKept.board(sp);
    bentOn = sp;
  }
  const _kept: Kept<Kept<boolean>> = bentAt;
  const _kept1 = (_kept[v_e] ??= []);
  if (_kept1[v_x] !== undefined) return _kept1[v_x];
  let _q28 = false;
  Q29: {
    const _a30 = sp.edgeFaces[v_e];
    for (let _i31 = 0; _i31 < _a30.length; _i31++) {
      const v_f = _a30[_i31];
      if ((sp.edgeFaces[v_x].includes(v_f))) {
        _q28 = true;
        break Q29;
      }
    }
  }
  const _made = _q28;
  _kept1[v_x] = _made;
  return _made;
}

/** Whether an edge is in a set whose groups are kept on the marks. */
function edgeHolds0(b: Marks, _sp: GridSpace, _cl: null, v_e: number, _a: number): boolean {
  return ((b.grid[v_e] || -1) === 1);
}
