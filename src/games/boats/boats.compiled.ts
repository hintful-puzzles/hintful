// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, cluesValued, keptStore, rangeMask, setOf, stamps, step, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

/** What the board deals: its partitions by name, its relations, a set of
 * cells for each cell, its clues by kind, and the sizes a technique or the
 * rules read that the grid does not give. */
export interface Dealt {
  n: ClueList;
  seg: ClueList;
  fleet: { readonly n: number; readonly length: readonly number[]; readonly boats: readonly number[] };
}

/** The units no value repeats in, in the description's order: the
 * engine builds the space from them. */
export const units: readonly string[] = [];

/** Every technique a rung runs, by id: the description's, in its order. */
export type LadderId = "given" | "near" | "lineShips" | "total" | "center" | "extend" | "lineWater" | "isolated" | "grow" | "onlyFit" | "centerRoom" | "tooLong" | "shortRun" | "hidden" | "onlyRuns" | "shared" | "lastWater" | "lastShip" | "centerTrial";

/** Every technique run as each value is placed, by id. */
export type PlacingId = "touch";

/** The techniques run as each value is placed, in the description's order,
 * each with the variation that adds it where one does. */
export const placing: readonly { id: PlacingId; variation?: string }[] = [
  { id: "touch" },
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
  { id: "given", tier: 0 },
  { id: "near", tier: 0 },
  { id: "lineShips", tier: 0 },
  { id: "total", tier: 0 },
  { id: "center", tier: 0 },
  { id: "extend", tier: 0 },
  { id: "lineWater", tier: 0 },
  { id: "isolated", tier: 0 },
  { id: "grow", tier: 1 },
  { id: "onlyFit", tier: 1 },
  { id: "centerRoom", tier: 1 },
  { id: "tooLong", tier: 1 },
  { id: "shortRun", tier: 1 },
  { id: "hidden", tier: 2 },
  { id: "onlyRuns", tier: 2 },
  { id: "shared", tier: 2 },
  { id: "lastWater", tier: 3 },
  { id: "lastShip", tier: 3 },
  { id: "centerTrial", tier: 3 },
];

/** The description's tiers, by name. */
export const tiers: readonly string[] = ["Easy","Normal","Tricky","Hard"];

/** Whether `g`, a value a cell and 0 where it has none, is an answer to the
 * board: every cell a value of its domain, and every rule and dealt clue
 * true of it, a variation's rules where `variations` has it on. */
export function isAnswer(g: ArrayLike<number>, sp: GridSpace, cl: Dealt): boolean {
  const _g2801: number[] = [];
  const _g2809: number[] = [];
  const _g2902: number[] = [];
  const _g2910: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2777 = true;
  Q2778: {
    const _a2779 = sp.cells;
    for (let _i2780 = 0; _i2780 < _a2779.length; _i2780++) {
      const v_a = _a2779[_i2780];
      const _h2781 = (g[v_a] || -1);
      if (!((_h2781 === 1))) continue;
      let _q2782 = true;
      Q2783: {
        const _a2784 = sp.adj8[v_a];
        for (let _i2785 = 0; _i2785 < _a2784.length; _i2785++) {
          const v_b = _a2784[_i2785];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2786 = (g[v_b] || -1);
          if (!((_h2786 !== 1))) {
            _q2782 = false;
            break Q2783;
          }
        }
      }
      if (!(_q2782)) {
        _q2777 = false;
        break Q2778;
      }
    }
  }
  if (!(_q2777)) return false;
  let _q2787 = true;
  Q2788: {
    const _a2789 = sp.cells;
    for (let _i2790 = 0; _i2790 < _a2789.length; _i2790++) {
      const v_c = _a2789[_i2790];
      const _h2791 = (g[v_c] || -1);
      let _c2794: boolean = (_h2791 === 1);
      if (_c2794) {
        const _t2792 = step(sp, v_c, 1);
        const _h2793 = (g[_t2792] || -1);
        _c2794 = !(((_t2792 !== -1) && (_h2793 === 1)));
      }
      let _c2797: boolean = _c2794;
      if (_c2797) {
        const _t2795 = step(sp, v_c, 3);
        const _h2796 = (g[_t2795] || -1);
        _c2797 = !(((_t2795 !== -1) && (_h2796 === 1)));
      }
      if (!(_c2797)) continue;
      const _h2800 = sp.rowOf[v_c];
      const _h2808 = sp.colOf[v_c];
      let _q2798 = false;
      Q2799: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2801.length = 0;
          G2802: {
            const _a2805 = sp.lineCells[_h2800];
            for (let _i2806 = 0; _i2806 < _a2805.length; _i2806++) {
              const v_x = _a2805[_i2806];
              const _h2807 = (g[v_x] || -1);
              if (!((_h2807 === 1))) continue;
              _g2801.push(v_x);
            }
          }
          _g2809.length = 0;
          G2810: {
            const _a2813 = sp.lineCells[_h2808];
            for (let _i2814 = 0; _i2814 < _a2813.length; _i2814++) {
              const v_x = _a2813[_i2814];
              const _h2815 = (g[v_x] || -1);
              if (!((_h2815 === 1))) continue;
              _g2809.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2800], v_c, _g2801), stretch(sp.lineCells[_h2808], v_c, _g2809)).length)) {
            _q2798 = true;
            break Q2799;
          }
        }
      }
      if (!(_q2798)) {
        _q2787 = false;
        break Q2788;
      }
    }
  }
  if (!(_q2787)) return false;
  let _q2816 = true;
  Q2817: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2816 = false;
          break Q2817;
        }
      }
    }
  }
  if (!(_q2816)) return false;
  let _g2818 = 0;
  G2819: {
    const _a2820 = sp.cells;
    for (let _i2821 = 0; _i2821 < _a2820.length; _i2821++) {
      const v_c = _a2820[_i2821];
      const _h2822 = (g[v_c] || -1);
      if (!((_h2822 === 1))) continue;
      _g2818++;
    }
  }
  let _g2823 = 0;
  G2824: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2823 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2818 === _g2823))) return false;
  for (let _k2825 = 0; _k2825 < cl.n.at.length; _k2825++) {
    const _at2826 = cl.n.at[_k2825];
    const _v2827 = cl.n.v[_k2825];
    const _t2828 = sp.lineCells[_at2826];
    let _g2829 = 0;
    G2830: {
      const _a2831 = _t2828;
      for (let _i2832 = 0; _i2832 < _a2831.length; _i2832++) {
        const v_c = _a2831[_i2832];
        const _h2833 = (g[v_c] || -1);
        if (!((_h2833 === 1))) continue;
        _g2829++;
      }
    }
    if (!((_g2829 === _v2827))) return false;
  }
  for (let _k2834 = 0; _k2834 < cl.seg.at.length; _k2834++) {
    const _at2835 = cl.seg.at[_k2834];
    const _v2836 = cl.seg.v[_k2834];
    let _c2886: boolean = ((_v2836 === 2) && ((g[_at2835] || -1) === 2));
    if (!_c2886) {
      let _c2885: boolean = ((_v2836 > 2) && ((g[_at2835] || -1) === 1));
      if (_c2885) {
        let _c2843: boolean = (_v2836 === 3);
        if (!_c2843) {
          let _c2839: boolean = (_v2836 === 4);
          if (_c2839) {
            const _t2837 = step(sp, _at2835, 2);
            const _h2838 = (g[_t2837] || -1);
            _c2839 = ((_t2837 !== -1) && (_h2838 === 1));
          }
          let _c2842: boolean = _c2839;
          if (_c2842) {
            const _t2840 = step(sp, _at2835, 1);
            const _h2841 = (g[_t2840] || -1);
            _c2842 = !(((_t2840 !== -1) && (_h2841 === 1)));
          }
          _c2843 = _c2842;
        }
        let _c2850: boolean = _c2843;
        if (!_c2850) {
          let _c2846: boolean = (_v2836 === 5);
          if (_c2846) {
            const _t2844 = step(sp, _at2835, 1);
            const _h2845 = (g[_t2844] || -1);
            _c2846 = ((_t2844 !== -1) && (_h2845 === 1));
          }
          let _c2849: boolean = _c2846;
          if (_c2849) {
            const _t2847 = step(sp, _at2835, 2);
            const _h2848 = (g[_t2847] || -1);
            _c2849 = !(((_t2847 !== -1) && (_h2848 === 1)));
          }
          _c2850 = _c2849;
        }
        let _c2863: boolean = _c2850;
        if (!_c2863) {
          let _c2862: boolean = (_v2836 === 6);
          if (_c2862) {
            const _t2851 = step(sp, _at2835, 1);
            const _h2852 = (g[_t2851] || -1);
            let _c2855: boolean = ((_t2851 !== -1) && (_h2852 === 1));
            if (_c2855) {
              const _t2853 = step(sp, _at2835, 2);
              const _h2854 = (g[_t2853] || -1);
              _c2855 = ((_t2853 !== -1) && (_h2854 === 1));
            }
            let _c2861: boolean = _c2855;
            if (!_c2861) {
              const _t2856 = step(sp, _at2835, 3);
              const _h2857 = (g[_t2856] || -1);
              let _c2860: boolean = ((_t2856 !== -1) && (_h2857 === 1));
              if (_c2860) {
                const _t2858 = step(sp, _at2835, 4);
                const _h2859 = (g[_t2858] || -1);
                _c2860 = ((_t2858 !== -1) && (_h2859 === 1));
              }
              _c2861 = _c2860;
            }
            _c2862 = _c2861;
          }
          _c2863 = _c2862;
        }
        let _c2870: boolean = _c2863;
        if (!_c2870) {
          let _c2866: boolean = (_v2836 === 7);
          if (_c2866) {
            const _t2864 = step(sp, _at2835, 4);
            const _h2865 = (g[_t2864] || -1);
            _c2866 = ((_t2864 !== -1) && (_h2865 === 1));
          }
          let _c2869: boolean = _c2866;
          if (_c2869) {
            const _t2867 = step(sp, _at2835, 3);
            const _h2868 = (g[_t2867] || -1);
            _c2869 = !(((_t2867 !== -1) && (_h2868 === 1)));
          }
          _c2870 = _c2869;
        }
        let _c2877: boolean = _c2870;
        if (!_c2877) {
          let _c2873: boolean = (_v2836 === 8);
          if (_c2873) {
            const _t2871 = step(sp, _at2835, 3);
            const _h2872 = (g[_t2871] || -1);
            _c2873 = ((_t2871 !== -1) && (_h2872 === 1));
          }
          let _c2876: boolean = _c2873;
          if (_c2876) {
            const _t2874 = step(sp, _at2835, 4);
            const _h2875 = (g[_t2874] || -1);
            _c2876 = !(((_t2874 !== -1) && (_h2875 === 1)));
          }
          _c2877 = _c2876;
        }
        let _c2884: boolean = _c2877;
        if (!_c2884) {
          let _c2883: boolean = (_v2836 === 9);
          if (_c2883) {
            let _q2878 = false;
            Q2879: {
              const _a2880 = sp.adj4[_at2835];
              for (let _i2881 = 0; _i2881 < _a2880.length; _i2881++) {
                const v_x = _a2880[_i2881];
                const _h2882 = (g[v_x] || -1);
                if ((_h2882 === 1)) {
                  _q2878 = true;
                  break Q2879;
                }
              }
            }
            _c2883 = !(_q2878);
          }
          _c2884 = _c2883;
        }
        _c2885 = _c2884;
      }
      _c2886 = _c2885;
    }
    if (!(_c2886)) return false;
  }
  for (let _k2887 = 0; _k2887 < cl.fleet.n; _k2887++) {
    let _g2890 = 0;
    G2891: {
      const _a2892 = sp.cells;
      for (let _i2893 = 0; _i2893 < _a2892.length; _i2893++) {
        const v_c = _a2892[_i2893];
        const _h2894 = (g[v_c] || -1);
        let _c2897: boolean = (_h2894 === 1);
        if (_c2897) {
          const _t2895 = step(sp, v_c, 1);
          const _h2896 = (g[_t2895] || -1);
          _c2897 = !(((_t2895 !== -1) && (_h2896 === 1)));
        }
        let _c2900: boolean = _c2897;
        if (_c2900) {
          const _t2898 = step(sp, v_c, 3);
          const _h2899 = (g[_t2898] || -1);
          _c2900 = !(((_t2898 !== -1) && (_h2899 === 1)));
        }
        let _c2917: boolean = _c2900;
        if (_c2917) {
          const _t2901 = sp.rowOf[v_c];
          _g2902.length = 0;
          G2903: {
            const _a2906 = sp.lineCells[_t2901];
            for (let _i2907 = 0; _i2907 < _a2906.length; _i2907++) {
              const v_x = _a2906[_i2907];
              const _h2908 = (g[v_x] || -1);
              if (!((_h2908 === 1))) continue;
              _g2902.push(v_x);
            }
          }
          const _t2909 = sp.colOf[v_c];
          _g2910.length = 0;
          G2911: {
            const _a2914 = sp.lineCells[_t2909];
            for (let _i2915 = 0; _i2915 < _a2914.length; _i2915++) {
              const v_x = _a2914[_i2915];
              const _h2916 = (g[v_x] || -1);
              if (!((_h2916 === 1))) continue;
              _g2910.push(v_x);
            }
          }
          _c2917 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2902), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2910)).length === cl.fleet.length[_k2887]);
        }
        if (!(_c2917)) continue;
        _g2890++;
      }
    }
    if (!((_g2890 === cl.fleet.boats[_k2887]))) return false;
  }
  return true;
}

export interface GivenBinding {
  c: number;
  v: number;
}

const givenFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function given(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GivenBinding> | null): number {
  const facts = givenFacts;
  let fired = 0;
  let changed = false;
  const _a9 = sp.cells;
  for (let _i10 = 0; _i10 < _a9.length; _i10++) {
    const v_c = _a9[_i10];
    const _h11 = clueAt(cl.seg, v_c);
    L12: {
      const v_v = _h11;
      if (!((v_v >= 2))) break L12;
      facts.length = 0;
      changed = false;
      let _c13: boolean = !((v_v === 2));
      if (!_c13) {
        if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
        _c13 = true;
      }
      let _c15: boolean = _c13;
      if (_c15) {
        let _c14: boolean = !((v_v > 2));
        if (!_c14) {
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          _c14 = true;
        }
        _c15 = _c14;
      }
      let _c21: boolean = _c15;
      if (_c21) {
        let _c20: boolean = !((v_v === 4));
        if (!_c20) {
          const _t16 = step(sp, v_c, 2);
          let _c19: boolean = ((_t16 !== -1) && ((b.grid[_t16] || -1) === 1));
          if (!_c19) {
            let _c18: boolean = ((step(sp, v_c, 2) !== -1) && !((b.grid[step(sp, v_c, 2)] !== 0)));
            if (_c18) {
              const _t17 = step(sp, v_c, 2);
              if (!(b.grid[_t17] !== 0)) { if (fire === null) { b.placeAt(_t17, 1); changed = true; } else facts.push(PLACE, _t17, 1); }
              _c18 = true;
            }
            _c19 = _c18;
          }
          _c20 = _c19;
        }
        _c21 = _c20;
      }
      let _c27: boolean = _c21;
      if (_c27) {
        let _c26: boolean = !((v_v === 4));
        if (!_c26) {
          const _t22 = step(sp, v_c, 1);
          let _c25: boolean = ((_t22 === -1) || ((b.grid[_t22] || -1) === 2));
          if (!_c25) {
            let _c24: boolean = !((b.grid[step(sp, v_c, 1)] !== 0));
            if (_c24) {
              const _t23 = step(sp, v_c, 1);
              if (!(b.grid[_t23] !== 0)) { if (fire === null) { b.placeAt(_t23, 2); changed = true; } else facts.push(PLACE, _t23, 2); }
              _c24 = true;
            }
            _c25 = _c24;
          }
          _c26 = _c25;
        }
        _c27 = _c26;
      }
      let _c33: boolean = _c27;
      if (_c33) {
        let _c32: boolean = !((v_v === 5));
        if (!_c32) {
          const _t28 = step(sp, v_c, 1);
          let _c31: boolean = ((_t28 !== -1) && ((b.grid[_t28] || -1) === 1));
          if (!_c31) {
            let _c30: boolean = ((step(sp, v_c, 1) !== -1) && !((b.grid[step(sp, v_c, 1)] !== 0)));
            if (_c30) {
              const _t29 = step(sp, v_c, 1);
              if (!(b.grid[_t29] !== 0)) { if (fire === null) { b.placeAt(_t29, 1); changed = true; } else facts.push(PLACE, _t29, 1); }
              _c30 = true;
            }
            _c31 = _c30;
          }
          _c32 = _c31;
        }
        _c33 = _c32;
      }
      let _c39: boolean = _c33;
      if (_c39) {
        let _c38: boolean = !((v_v === 5));
        if (!_c38) {
          const _t34 = step(sp, v_c, 2);
          let _c37: boolean = ((_t34 === -1) || ((b.grid[_t34] || -1) === 2));
          if (!_c37) {
            let _c36: boolean = !((b.grid[step(sp, v_c, 2)] !== 0));
            if (_c36) {
              const _t35 = step(sp, v_c, 2);
              if (!(b.grid[_t35] !== 0)) { if (fire === null) { b.placeAt(_t35, 2); changed = true; } else facts.push(PLACE, _t35, 2); }
              _c36 = true;
            }
            _c37 = _c36;
          }
          _c38 = _c37;
        }
        _c39 = _c38;
      }
      let _c45: boolean = _c39;
      if (_c45) {
        let _c44: boolean = !((v_v === 7));
        if (!_c44) {
          const _t40 = step(sp, v_c, 4);
          let _c43: boolean = ((_t40 !== -1) && ((b.grid[_t40] || -1) === 1));
          if (!_c43) {
            let _c42: boolean = ((step(sp, v_c, 4) !== -1) && !((b.grid[step(sp, v_c, 4)] !== 0)));
            if (_c42) {
              const _t41 = step(sp, v_c, 4);
              if (!(b.grid[_t41] !== 0)) { if (fire === null) { b.placeAt(_t41, 1); changed = true; } else facts.push(PLACE, _t41, 1); }
              _c42 = true;
            }
            _c43 = _c42;
          }
          _c44 = _c43;
        }
        _c45 = _c44;
      }
      let _c51: boolean = _c45;
      if (_c51) {
        let _c50: boolean = !((v_v === 7));
        if (!_c50) {
          const _t46 = step(sp, v_c, 3);
          let _c49: boolean = ((_t46 === -1) || ((b.grid[_t46] || -1) === 2));
          if (!_c49) {
            let _c48: boolean = !((b.grid[step(sp, v_c, 3)] !== 0));
            if (_c48) {
              const _t47 = step(sp, v_c, 3);
              if (!(b.grid[_t47] !== 0)) { if (fire === null) { b.placeAt(_t47, 2); changed = true; } else facts.push(PLACE, _t47, 2); }
              _c48 = true;
            }
            _c49 = _c48;
          }
          _c50 = _c49;
        }
        _c51 = _c50;
      }
      let _c57: boolean = _c51;
      if (_c57) {
        let _c56: boolean = !((v_v === 8));
        if (!_c56) {
          const _t52 = step(sp, v_c, 3);
          let _c55: boolean = ((_t52 !== -1) && ((b.grid[_t52] || -1) === 1));
          if (!_c55) {
            let _c54: boolean = ((step(sp, v_c, 3) !== -1) && !((b.grid[step(sp, v_c, 3)] !== 0)));
            if (_c54) {
              const _t53 = step(sp, v_c, 3);
              if (!(b.grid[_t53] !== 0)) { if (fire === null) { b.placeAt(_t53, 1); changed = true; } else facts.push(PLACE, _t53, 1); }
              _c54 = true;
            }
            _c55 = _c54;
          }
          _c56 = _c55;
        }
        _c57 = _c56;
      }
      let _c63: boolean = _c57;
      if (_c63) {
        let _c62: boolean = !((v_v === 8));
        if (!_c62) {
          const _t58 = step(sp, v_c, 4);
          let _c61: boolean = ((_t58 === -1) || ((b.grid[_t58] || -1) === 2));
          if (!_c61) {
            let _c60: boolean = !((b.grid[step(sp, v_c, 4)] !== 0));
            if (_c60) {
              const _t59 = step(sp, v_c, 4);
              if (!(b.grid[_t59] !== 0)) { if (fire === null) { b.placeAt(_t59, 2); changed = true; } else facts.push(PLACE, _t59, 2); }
              _c60 = true;
            }
            _c61 = _c60;
          }
          _c62 = _c61;
        }
        _c63 = _c62;
      }
      let _c70: boolean = _c63;
      if (_c70) {
        let _c69: boolean = !((v_v === 9));
        if (!_c69) {
          let _q64 = true;
          Q65: {
            const _a66 = sp.adj4[v_c];
            for (let _i67 = 0; _i67 < _a66.length; _i67++) {
              const v_x = _a66[_i67];
              let _c68: boolean = ((b.grid[v_x] || -1) !== 1);
              if (_c68) {
                if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
                _c68 = true;
              }
              if (!(_c68)) {
                _q64 = false;
                break Q65;
              }
            }
          }
          _c69 = _q64;
        }
        _c70 = _c69;
      }
      if (!(_c70)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, v: v_v }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface NearBinding {
  c: number;
  D: readonly number[];
}

const nearFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function near(b: Marks, sp: GridSpace, fire: Fire<NearBinding> | null): number {
  const _g82: number[] = [];
  const facts = nearFacts;
  let fired = 0;
  let changed = false;
  const _a80 = cellsValued(b, sp.cells, 1);
  for (let _i81 = 0; _i81 < _a80.length; _i81++) {
    const v_c = _a80[_i81];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    _g82.length = 0;
    G83: {
      const _a86 = sp.adj8[v_c];
      for (let _i87 = 0; _i87 < _a86.length; _i87++) {
        const v_d = _a86[_i87];
        if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
        _g82.push(v_d);
      }
    }
    L88: {
      const v_D = _g82;
      const _h89 = v_D.length;
      if (!((_h89 > 0))) break L88;
      facts.length = 0;
      changed = false;
      let _q90 = true;
      Q91: {
        const _a92 = v_D;
        for (let _i93 = 0; _i93 < _a92.length; _i93++) {
          const v_d = _a92[_i93];
          if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
          if (!(true)) {
            _q90 = false;
            break Q91;
          }
        }
      }
      if (!(_q90)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ c: v_c, D: v_D.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface TouchBinding {
  c: number;
  d: number;
}

const touchFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function touch(b: Marks, sp: GridSpace, v_c: number, fire: Fire<TouchBinding> | null): number {
  const facts = touchFacts;
  let fired = 0;
  let changed = false;
  if (!(((b.grid[v_c] || -1) === 1))) return 0;
  const _a98 = sp.adj8[v_c];
  for (let _i99 = 0; _i99 < _a98.length; _i99++) {
    const v_d = _a98[_i99];
    if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null) fire({ c: v_c, d: v_d }, facts);
    }
  }
  return fired;
}

export interface LineShipsBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

const lineShipsFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function lineShips(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineShipsBinding> | null): number {
  const _g121: number[] = [];
  const facts = lineShipsFacts;
  let fired = 0;
  let changed = false;
  const _a116 = sp.lines;
  for (let _i117 = 0; _i117 < _a116.length; _i117++) {
    const v_L = _a116[_i117];
    const _h118 = clueAt(cl.n, v_L);
    L119: {
      const v_v = _h118;
      if (!((v_v >= 0))) break L119;
      const _t120 = sp.lineCells[v_L];
      _g121.length = 0;
      G122: {
        const _a125 = _t120;
        for (let _i126 = 0; _i126 < _a125.length; _i126++) {
          const v_c = _a125[_i126];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g121.push(v_c);
        }
      }
      L127: {
        const v_O = _g121;
        const _h128 = v_O.length;
        if (!((_h128 > 0))) break L127;
        const _t129 = sp.lineCells[v_L];
        let _g130 = 0;
        G131: {
          const _a132 = _t129;
          for (let _i133 = 0; _i133 < _a132.length; _i133++) {
            const v_c = _a132[_i133];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g130++;
          }
        }
        const v_left = (v_v - _g130);
        facts.length = 0;
        changed = false;
        let _c139: boolean = (v_left <= _h128);
        if (_c139) {
          let _c138: boolean = !((v_left === _h128));
          if (!_c138) {
            let _q134 = true;
            Q135: {
              const _a136 = v_O;
              for (let _i137 = 0; _i137 < _a136.length; _i137++) {
                const v_c = _a136[_i137];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q134 = false;
                  break Q135;
                }
              }
            }
            _c138 = _q134;
          }
          _c139 = _c138;
        }
        if (!(_c139)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O.slice(), left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface TotalBinding {
  O: readonly number[];
  left: number;
}

const totalFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function total(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TotalBinding> | null): number {
  const _g156: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _t155 = sp.cells;
  _g156.length = 0;
  G157: {
    const _a160 = _t155;
    for (let _i161 = 0; _i161 < _a160.length; _i161++) {
      const v_c = _a160[_i161];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g156.push(v_c);
    }
  }
  L162: {
    const v_O = _g156;
    const _h163 = v_O.length;
    if (!((_h163 > 0))) break L162;
    let _g164 = 0;
    G165: {
      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
        _g164 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
      }
    }
    const _t166 = sp.cells;
    let _g167 = 0;
    G168: {
      const _a169 = _t166;
      for (let _i170 = 0; _i170 < _a169.length; _i170++) {
        const v_c = _a169[_i170];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g167++;
      }
    }
    const v_left = (_g164 - _g167);
    facts.length = 0;
    changed = false;
    let _c176: boolean = (v_left <= _h163);
    if (_c176) {
      let _c175: boolean = !((v_left === _h163));
      if (!_c175) {
        let _q171 = true;
        Q172: {
          const _a173 = v_O;
          for (let _i174 = 0; _i174 < _a173.length; _i174++) {
            const v_c = _a173[_i174];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q171 = false;
              break Q172;
            }
          }
        }
        _c175 = _q171;
      }
      _c176 = _c175;
    }
    if (!(_c176)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ O: v_O.slice(), left: v_left }, facts)) return 1;
    }
  }
  return fired;
}

export interface CenterBinding {
  c: number;
  a: number;
  b: number;
  p: number;
  q: number;
}

const centerFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function center(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterBinding> | null): number {
  const facts = centerFacts;
  let fired = 0;
  let changed = false;
  const _h187 = ((1 << 1) | (1 << 3));
  const _a184 = cluesValued(cl.seg, 6);
  for (let _i185 = 0; _i185 < _a184.length; _i185++) {
    const v_c = _a184[_i185];
    const _h186 = clueAt(cl.seg, v_c);
    if (!((_h186 === 6))) continue;
    for (let _m188 = _h187; _m188 !== 0; _m188 &= _m188 - 1) {
      const v_a = 31 - Math.clz32(_m188 & -_m188);
      const v_b = (v_a + 1);
      const v_p = (4 - v_a);
      L189: {
        const v_q = (5 - v_a);
        const _t190 = step(sp, v_c, v_a);
        let _c192: boolean = ((_t190 === -1) || ((b.grid[_t190] || -1) === 2));
        if (!_c192) {
          const _t191 = step(sp, v_c, v_b);
          _c192 = ((_t191 === -1) || ((b.grid[_t191] || -1) === 2));
        }
        if (!(_c192)) break L189;
        facts.length = 0;
        changed = false;
        const _t193 = step(sp, v_c, v_p);
        let _c195: boolean = !(((_t193 === -1) || ((b.grid[_t193] || -1) === 2)));
        if (_c195) {
          const _t194 = step(sp, v_c, v_q);
          _c195 = !(((_t194 === -1) || ((b.grid[_t194] || -1) === 2)));
        }
        let _c197: boolean = _c195;
        if (_c197) {
          const _t196 = step(sp, v_c, v_p);
          if (!(b.grid[_t196] !== 0)) { if (fire === null) { b.placeAt(_t196, 1); changed = true; } else facts.push(PLACE, _t196, 1); }
          _c197 = true;
        }
        let _c199: boolean = _c197;
        if (_c199) {
          const _t198 = step(sp, v_c, v_q);
          if (!(b.grid[_t198] !== 0)) { if (fire === null) { b.placeAt(_t198, 1); changed = true; } else facts.push(PLACE, _t198, 1); }
          _c199 = true;
        }
        if (!(_c199)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ c: v_c, a: v_a, b: v_b, p: v_p, q: v_q }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface ExtendBinding {
  F: boolean;
  c: number;
  O: readonly number[];
}

const extendFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function extend(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExtendBinding> | null): number {
  const _g282: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  const _m127_0 = b.made[0];
  const _m127_1 = b.made[1];
  const v_F = full(b, sp, cl, 1);
  const _a275 = cellsValued(b, sp.cells, 1);
  for (let _i276 = 0; _i276 < _a275.length; _i276++) {
    const v_c = _a275[_i276];
    let _c281: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
    if (_c281) {
      let _q277 = false;
      Q278: {
        const _a279 = sp.adj4[v_c];
        for (let _i280 = 0; _i280 < _a279.length; _i280++) {
          const v_x = _a279[_i280];
          if (((b.grid[v_x] || -1) === 1)) {
            _q277 = true;
            break Q278;
          }
        }
      }
      _c281 = !(_q277);
    }
    if (!(_c281)) continue;
    _g282.length = 0;
    G283: {
      const _a286 = sp.adj4[v_c];
      for (let _i287 = 0; _i287 < _a286.length; _i287++) {
        const v_x = _a286[_i287];
        if (!(!((b.grid[v_x] !== 0)))) continue;
        _g282.push(v_x);
      }
    }
    L288: {
      const v_O = _g282;
      const _h289 = v_O.length;
      if (!((_h289 === 1))) break L288;
      if (b.made[0] !== _m127_0 || b.made[1] !== _m127_1) {
        if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
      }
      facts.length = 0;
      changed = false;
      let _q290 = true;
      Q291: {
        const _a292 = v_O;
        for (let _i293 = 0; _i293 < _a292.length; _i293++) {
          const v_x = _a292[_i293];
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) {
            _q290 = false;
            break Q291;
          }
        }
      }
      if (!(_q290)) return -1;
      if (changed || facts.length > 0) {
        fired = 1;
        if (fire !== null && !fire({ F: v_F, c: v_c, O: v_O.slice() }, facts)) return 1;
      }
    }
  }
  return fired;
}

export interface LineWaterBinding {
  L: number;
  v: number;
  O: readonly number[];
  left: number;
}

const lineWaterFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function lineWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LineWaterBinding> | null): number {
  const _g315: number[] = [];
  const facts = lineWaterFacts;
  let fired = 0;
  let changed = false;
  const _a310 = sp.lines;
  for (let _i311 = 0; _i311 < _a310.length; _i311++) {
    const v_L = _a310[_i311];
    const _h312 = clueAt(cl.n, v_L);
    L313: {
      const v_v = _h312;
      if (!((v_v >= 0))) break L313;
      const _t314 = sp.lineCells[v_L];
      _g315.length = 0;
      G316: {
        const _a319 = _t314;
        for (let _i320 = 0; _i320 < _a319.length; _i320++) {
          const v_c = _a319[_i320];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g315.push(v_c);
        }
      }
      L321: {
        const v_O = _g315;
        const _h322 = v_O.length;
        if (!((_h322 > 0))) break L321;
        const _t323 = sp.lineCells[v_L];
        let _g324 = 0;
        G325: {
          const _a326 = _t323;
          for (let _i327 = 0; _i327 < _a326.length; _i327++) {
            const v_c = _a326[_i327];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g324++;
          }
        }
        const v_left = (v_v - _g324);
        facts.length = 0;
        changed = false;
        let _c333: boolean = (v_left >= 0);
        if (_c333) {
          let _c332: boolean = !((v_left === 0));
          if (!_c332) {
            let _q328 = true;
            Q329: {
              const _a330 = v_O;
              for (let _i331 = 0; _i331 < _a330.length; _i331++) {
                const v_c = _a330[_i331];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q328 = false;
                  break Q329;
                }
              }
            }
            _c332 = _q328;
          }
          _c333 = _c332;
        }
        if (!(_c333)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O.slice(), left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface IsolatedBinding {
  F: boolean;
  c: number;
}

const isolatedFacts: number[] = [];

/** Its dearest read grows with the board as n. */
export function isolated(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<IsolatedBinding> | null): number {
  const facts = isolatedFacts;
  let fired = 0;
  let changed = false;
  const _m175_0 = b.made[0];
  const _m175_1 = b.made[1];
  const v_F = full(b, sp, cl, 1);
  const _a341 = sp.cells;
  for (let _i342 = 0; _i342 < _a341.length; _i342++) {
    const v_c = _a341[_i342];
    let _c347: boolean = (v_F && !((b.grid[v_c] !== 0)));
    if (_c347) {
      let _q343 = true;
      Q344: {
        const _a345 = sp.adj4[v_c];
        for (let _i346 = 0; _i346 < _a345.length; _i346++) {
          const v_x = _a345[_i346];
          if (!(((b.grid[v_x] || -1) === 2))) {
            _q343 = false;
            break Q344;
          }
        }
      }
      _c347 = _q343;
    }
    if (!(_c347)) continue;
    if (b.made[0] !== _m175_0 || b.made[1] !== _m175_1) {
      if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ F: v_F, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface GrowBinding {
  c: number;
  L: number;
  G: readonly number[];
  E: readonly number[];
}

const growFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function grow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GrowBinding> | null): number {
  const _g382: number[] = [];
  const _g390: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _m189_0 = b.made[0];
  const _m189_1 = b.made[1];
  const _a377 = cellsValued(b, sp.cells, 1);
  R1:
  for (let _i378 = 0; _i378 < _a377.length; _i378++) {
    const v_c = _a377[_i378];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    const _t379 = sp.rowOf[v_c];
    const _t380 = sp.colOf[v_c];
    for (let _i381 = 0; _i381 < 2; _i381++) {
      const v_L = _i381 === 0 ? _t379 : _t380;
      if (_i381 === 1 && (v_L === _t379)) continue;
      _g382.length = 0;
      G383: {
        const _a386 = sp.lineCells[v_L];
        for (let _i387 = 0; _i387 < _a386.length; _i387++) {
          const v_x = _a386[_i387];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g382.push(v_x);
        }
      }
      L388: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g382);
        const _h389 = v_G.length;
        if (!(((_h389 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L388;
        _g390.length = 0;
        G391: {
          const _a399 = sp.lineCells[v_L];
          for (let _i400 = 0; _i400 < _a399.length; _i400++) {
            const v_x = _a399[_i400];
            let _c405: boolean = !((b.grid[v_x] !== 0));
            if (_c405) {
              let _q401 = false;
              Q402: {
                const _a403 = v_G;
                for (let _i404 = 0; _i404 < _a403.length; _i404++) {
                  const v_g = _a403[_i404];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q401 = true;
                    break Q402;
                  }
                }
              }
              _c405 = _q401;
            }
            if (!(_c405)) continue;
            _g390.push(v_x);
          }
        }
        L406: {
          const v_E = _g390;
          const _h407 = v_E.length;
          if (!(((_h407 === 1) && full(b, sp, cl, _h389)))) break L406;
          if (b.made[0] !== _m189_0 || b.made[1] !== _m189_1) {
            if (!(((b.grid[v_c] || -1) === 1))) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          let _q408 = true;
          Q409: {
            const _a410 = v_E;
            for (let _i411 = 0; _i411 < _a410.length; _i411++) {
              const v_x = _a410[_i411];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q408 = false;
                break Q409;
              }
            }
          }
          if (!(_q408)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, G: v_G.slice(), E: v_E.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface OnlyFitBinding {
  M: number;
  L: number;
  c: number;
  R: readonly number[];
  m: number;
  b: number;
}

const onlyFitFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function onlyFit(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyFitBinding> | null): number {
  const _g499: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  const _k521 = boatsOfKept.board(cl);
  const _m216_0 = b.made[0];
  const _m216_1 = b.made[1];
  let _g484 = -1;
  G485: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t486 = cl.fleet.length[v_k];
      if (_g484 === -1 || _t486 > _g484) _g484 = _t486;
    }
  }
  const v_M = _g484;
  const _a487 = sp.lines;
  for (let _i488 = 0; _i488 < _a487.length; _i488++) {
    const v_L = _a487[_i488];
    const _h511 = clueAt(cl.n, v_L);
    const _h512 = (_h511 < 0);
    const _a489 = sp.lineCells[v_L];
    for (let _i490 = 0; _i490 < _a489.length; _i490++) {
      const v_c = _a489[_i490];
      const _h495 = (v_c % sp.w);
      const _h496 = ((v_c / sp.w) | 0);
      const _h497 = (_h495 + _h496);
      let _c498: boolean = ((b.grid[v_c] || -1) !== 2);
      if (_c498) {
        let _q491 = false;
        Q492: {
          const _a493 = sp.adj4[v_c];
          for (let _i494 = 0; _i494 < _a493.length; _i494++) {
            const v_p = _a493[_i494];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h497)))) continue;
            if (((b.grid[v_p] || -1) !== 2)) {
              _q491 = true;
              break Q492;
            }
          }
        }
        _c498 = !(_q491);
      }
      if (!(_c498)) continue;
      _g499.length = 0;
      G500: {
        const _a503 = sp.lineCells[v_L];
        for (let _i504 = 0; _i504 < _a503.length; _i504++) {
          const v_x = _a503[_i504];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g499.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g499);
      const _h505 = v_R.length;
      L506: {
        const v_m = _h505;
        let _c520: boolean = (v_m === v_M);
        if (_c520) {
          let _g507 = 0;
          G508: {
            const _a509 = v_R;
            for (let _i510 = 0; _i510 < _a509.length; _i510++) {
              const v_c = _a509[_i510];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g507++;
            }
          }
          let _c519: boolean = ((_g507 < _h505) && (_h505 >= v_m));
          if (_c519) {
            let _c518: boolean = _h512;
            if (!_c518) {
              const _t513 = sp.lineCells[v_L];
              let _g514 = 0;
              G515: {
                const _a516 = _t513;
                for (let _i517 = 0; _i517 < _a516.length; _i517++) {
                  const v_c = _a516[_i517];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g514++;
                }
              }
              _c518 = (((_h511 - _g514) + _g507) >= v_m);
            }
            _c519 = _c518;
          }
          _c520 = _c519;
        }
        if (!(_c520)) break L506;
        const _h530 = (v_m > 1);
        L522: {
          const v_b = ((_k521[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L522;
          if (b.made[0] !== _m216_0 || b.made[1] !== _m216_1) {
            let _g523 = -1;
            G524: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                const _t525 = cl.fleet.length[v_k];
                if (_g523 === -1 || _t525 > _g523) _g523 = _t525;
              }
            }
            if (!((v_M === _g523))) { return fired; }
          }
          facts.length = 0;
          changed = false;
          let _q526 = true;
          Q527: {
            const _a528 = v_R;
            for (let _i529 = 0; _i529 < _a528.length; _i529++) {
              const v_x = _a528[_i529];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c536: boolean = true;
              if (_c536) {
                let _c535: boolean = _h530;
                if (!_c535) {
                  let _q531 = true;
                  Q532: {
                    const _a533 = sp.adj4[v_x];
                    for (let _i534 = 0; _i534 < _a533.length; _i534++) {
                      const v_y = _a533[_i534];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q531 = false;
                        break Q532;
                      }
                    }
                  }
                  _c535 = _q531;
                }
                _c536 = _c535;
              }
              if (!(_c536)) {
                _q526 = false;
                break Q527;
              }
            }
          }
          if (!(_q526)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ M: v_M, L: v_L, c: v_c, R: v_R.slice(), m: v_m, b: v_b }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterRoomBinding {
  c: number;
  L: number;
  v: number;
  S: readonly number[];
}

const centerRoomFacts: number[] = [];

/** Its dearest read grows with the board as 1. */
export function centerRoom(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterRoomBinding> | null): number {
  const _g568: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a560 = cluesValued(cl.seg, 6);
  for (let _i561 = 0; _i561 < _a560.length; _i561++) {
    const v_c = _a560[_i561];
    const _h562 = clueAt(cl.seg, v_c);
    if (!((_h562 === 6))) continue;
    const _t563 = sp.rowOf[v_c];
    const _t564 = sp.colOf[v_c];
    for (let _i565 = 0; _i565 < 2; _i565++) {
      const v_L = _i565 === 0 ? _t563 : _t564;
      if (_i565 === 1 && (v_L === _t563)) continue;
      const _h566 = clueAt(cl.n, v_L);
      L567: {
        const v_v = _h566;
        if (!((v_v >= 0))) break L567;
        _g568.length = 0;
        G569: {
          const _a572 = sp.adj4[v_c];
          for (let _i573 = 0; _i573 < _a572.length; _i573++) {
            const v_x = _a572[_i573];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g568.push(v_x);
          }
        }
        L574: {
          const v_S = _g568;
          const _h575 = v_S.length;
          let _c585: boolean = (_h575 === 2);
          if (_c585) {
            const _t576 = sp.lineCells[v_L];
            let _g577 = 0;
            G578: {
              const _a579 = _t576;
              for (let _i580 = 0; _i580 < _a579.length; _i580++) {
                const v_c = _a579[_i580];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g577++;
              }
            }
            let _g581 = 0;
            G582: {
              const _a583 = v_S;
              for (let _i584 = 0; _i584 < _a583.length; _i584++) {
                const v_x = _a583[_i584];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g581++;
              }
            }
            _c585 = ((v_v - _g577) < _g581);
          }
          if (!(_c585)) break L574;
          facts.length = 0;
          changed = false;
          let _q586 = true;
          Q587: {
            const _a588 = v_S;
            for (let _i589 = 0; _i589 < _a588.length; _i589++) {
              const v_x = _a588[_i589];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q586 = false;
                break Q587;
              }
            }
          }
          if (!(_q586)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, v: v_v, S: v_S.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface TooLongBinding {
  M: number;
  c: number;
}

const tooLongFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function tooLong(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<TooLongBinding> | null): number {
  const _g624: number[] = [];
  const _g631: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  const _m286_0 = b.made[0];
  const _m286_1 = b.made[1];
  let _g614 = -1;
  G615: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t616 = cl.fleet.length[v_k];
      if (_g614 === -1 || _t616 > _g614) _g614 = _t616;
    }
  }
  const v_M = _g614;
  const _a617 = sp.cells;
  for (let _i618 = 0; _i618 < _a617.length; _i618++) {
    const v_c = _a617[_i618];
    let _c637: boolean = !((b.grid[v_c] !== 0));
    if (_c637) {
      let _g619 = 0;
      G620: {
        const _a621 = sp.adj4[v_c];
        for (let _i622 = 0; _i622 < _a621.length; _i622++) {
          const v_a = _a621[_i622];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t623 = sp.rowOf[v_a];
          _g624.length = 0;
          G625: {
            const _a628 = sp.lineCells[_t623];
            for (let _i629 = 0; _i629 < _a628.length; _i629++) {
              const v_x = _a628[_i629];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g624.push(v_x);
            }
          }
          const _t630 = sp.colOf[v_a];
          _g631.length = 0;
          G632: {
            const _a635 = sp.lineCells[_t630];
            for (let _i636 = 0; _i636 < _a635.length; _i636++) {
              const v_x = _a635[_i636];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g631.push(v_x);
            }
          }
          _g619 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g624), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g631)).length;
        }
      }
      _c637 = ((1 + _g619) > v_M);
    }
    if (!(_c637)) continue;
    if (b.made[0] !== _m286_0 || b.made[1] !== _m286_1) {
      let _g638 = -1;
      G639: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
          const _t640 = cl.fleet.length[v_k];
          if (_g638 === -1 || _t640 > _g638) _g638 = _t640;
        }
      }
      if (!((v_M === _g638))) { return fired; }
    }
    facts.length = 0;
    changed = false;
    if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
    if (!(true)) return -1;
    if (changed || facts.length > 0) {
      fired = 1;
      if (fire !== null && !fire({ M: v_M, c: v_c }, facts)) return 1;
    }
  }
  return fired;
}

export interface ShortRunBinding {
  L: number;
  c: number;
  R: readonly number[];
  O: readonly number[];
}

const shortRunFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function shortRun(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ShortRunBinding> | null): number {
  const _g663: number[] = [];
  const _g671: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a659 = sp.lines;
  for (let _i660 = 0; _i660 < _a659.length; _i660++) {
    const v_L = _a659[_i660];
    const _a661 = sp.lineCells[v_L];
    for (let _i662 = 0; _i662 < _a661.length; _i662++) {
      const v_c = _a661[_i662];
      _g663.length = 0;
      G664: {
        const _a667 = sp.lineCells[v_L];
        for (let _i668 = 0; _i668 < _a667.length; _i668++) {
          const v_x = _a667[_i668];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g663.push(v_x);
        }
      }
      L669: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g663);
        const _h670 = v_R.length;
        if (!(((_h670 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L669;
        _g671.length = 0;
        G672: {
          const _a675 = v_R;
          for (let _i676 = 0; _i676 < _a675.length; _i676++) {
            const v_c = _a675[_i676];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g671.push(v_c);
          }
        }
        L677: {
          const v_O = _g671;
          const _h678 = v_O.length;
          if (!(((_h678 === 1) && full(b, sp, cl, _h670)))) break L677;
          facts.length = 0;
          changed = false;
          let _q679 = true;
          Q680: {
            const _a681 = v_O;
            for (let _i682 = 0; _i682 < _a681.length; _i682++) {
              const v_x = _a681[_i682];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q679 = false;
                break Q680;
              }
            }
          }
          if (!(_q679)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R.slice(), O: v_O.slice() }, facts)) return 1;
          }
        }
      }
    }
  }
  return fired;
}

export interface HiddenBinding {
  L: number;
  O: readonly number[];
  v: number;
  left: number;
}

const hiddenFacts: number[] = [];

/** Its dearest read grows with the board as n^0.5. */
export function hidden(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<HiddenBinding> | null): number {
  const _g741: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a737 = sp.lines;
  for (let _i738 = 0; _i738 < _a737.length; _i738++) {
    const v_L = _a737[_i738];
    const _h739 = clueAt(cl.n, v_L);
    if (!((_h739 < 0))) continue;
    const _t740 = sp.lineCells[v_L];
    _g741.length = 0;
    G742: {
      const _a745 = _t740;
      for (let _i746 = 0; _i746 < _a745.length; _i746++) {
        const v_c = _a745[_i746];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g741.push(v_c);
      }
    }
    L747: {
      const v_O = _g741;
      const _h748 = v_O.length;
      if (!((_h748 > 0))) break L747;
      L749: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L749;
        const _t750 = sp.lineCells[v_L];
        let _g751 = 0;
        G752: {
          const _a753 = _t750;
          for (let _i754 = 0; _i754 < _a753.length; _i754++) {
            const v_c = _a753[_i754];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g751++;
          }
        }
        const v_left = (v_v - _g751);
        facts.length = 0;
        changed = false;
        let _c760: boolean = ((v_left >= 0) && (v_left <= _h748));
        if (_c760) {
          let _c759: boolean = !((v_left === 0));
          if (!_c759) {
            let _q755 = true;
            Q756: {
              const _a757 = v_O;
              for (let _i758 = 0; _i758 < _a757.length; _i758++) {
                const v_c = _a757[_i758];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q755 = false;
                  break Q756;
                }
              }
            }
            _c759 = _q755;
          }
          _c760 = _c759;
        }
        let _c766: boolean = _c760;
        if (_c766) {
          let _c765: boolean = !((v_left === _h748));
          if (!_c765) {
            let _q761 = true;
            Q762: {
              const _a763 = v_O;
              for (let _i764 = 0; _i764 < _a763.length; _i764++) {
                const v_c = _a763[_i764];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q761 = false;
                  break Q762;
                }
              }
            }
            _c765 = _q761;
          }
          _c766 = _c765;
        }
        if (!(_c766)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ L: v_L, O: v_O.slice(), v: v_v, left: v_left }, facts)) return 1;
        }
      }
    }
  }
  return fired;
}

export interface OnlyRunsBinding {
  m: number;
  L: number;
  c: number;
  R: readonly number[];
  C: readonly number[];
  b: number;
  r: number;
}

const onlyRunsFacts: number[] = [];

/** Its dearest read grows with the board as n^1.5. */
export function onlyRuns(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<OnlyRunsBinding> | null): number {
  const _g864: number[] = [];
  const _g887: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  const _k896 = boatsOfKept.board(cl);
  const _m363_0 = b.made[0];
  const _m363_1 = b.made[1];
  let _g848 = -1;
  G849: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t850 = cl.fleet.length[v_k];
      if (_g848 === -1 || _t850 > _g848) _g848 = _t850;
    }
  }
  L851: {
    const v_m = _g848;
    if (!((v_m > 0))) break L851;
    const _h886 = (2 * v_m);
    const _a852 = sp.lines;
    for (let _i853 = 0; _i853 < _a852.length; _i853++) {
      const v_L = _a852[_i853];
      const _h876 = clueAt(cl.n, v_L);
      const _h877 = (_h876 < 0);
      const _a854 = sp.lineCells[v_L];
      for (let _i855 = 0; _i855 < _a854.length; _i855++) {
        const v_c = _a854[_i855];
        const _h860 = (v_c % sp.w);
        const _h861 = ((v_c / sp.w) | 0);
        const _h862 = (_h860 + _h861);
        let _c863: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c863) {
          let _q856 = false;
          Q857: {
            const _a858 = sp.adj4[v_c];
            for (let _i859 = 0; _i859 < _a858.length; _i859++) {
              const v_p = _a858[_i859];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h862)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q856 = true;
                break Q857;
              }
            }
          }
          _c863 = !(_q856);
        }
        if (!(_c863)) continue;
        _g864.length = 0;
        G865: {
          const _a868 = sp.lineCells[v_L];
          for (let _i869 = 0; _i869 < _a868.length; _i869++) {
            const v_x = _a868[_i869];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g864.push(v_x);
          }
        }
        L870: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g864);
          const _h875 = v_R.length;
          let _g871 = 0;
          G872: {
            const _a873 = v_R;
            for (let _i874 = 0; _i874 < _a873.length; _i874++) {
              const v_c = _a873[_i874];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g871++;
            }
          }
          let _c885: boolean = (_g871 < _h875);
          if (_c885) {
            let _c884: boolean = ((_g871 < _h875) && (_h875 >= v_m));
            if (_c884) {
              let _c883: boolean = _h877;
              if (!_c883) {
                const _t878 = sp.lineCells[v_L];
                let _g879 = 0;
                G880: {
                  const _a881 = _t878;
                  for (let _i882 = 0; _i882 < _a881.length; _i882++) {
                    const v_c = _a881[_i882];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g879++;
                  }
                }
                _c883 = (((_h876 - _g879) + _g871) >= v_m);
              }
              _c884 = _c883;
            }
            _c885 = _c884;
          }
          if (!((_c885 && (_h875 < _h886)))) break L870;
          const _h893 = (_h875 - v_m);
          _g887.length = 0;
          G888: {
            const _a891 = v_R;
            for (let _i892 = 0; _i892 < _a891.length; _i892++) {
              const v_x = _a891[_i892];
              if (!(((_i892 >= _h893) && (_i892 < v_m)))) continue;
              _g887.push(v_x);
            }
          }
          L894: {
            const v_C = _g887;
            const _h895 = v_C.length;
            if (!((_h895 > 0))) break L894;
            const _h905 = (_h895 > 1);
            const v_b = ((_k896[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
            L897: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L897;
              if (b.made[0] !== _m363_0 || b.made[1] !== _m363_1) {
                let _g898 = -1;
                G899: {
                  for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                    if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                    const _t900 = cl.fleet.length[v_k];
                    if (_g898 === -1 || _t900 > _g898) _g898 = _t900;
                  }
                }
                if (!((v_m === _g898))) { return fired; }
              }
              facts.length = 0;
              changed = false;
              let _q901 = true;
              Q902: {
                const _a903 = v_C;
                for (let _i904 = 0; _i904 < _a903.length; _i904++) {
                  const v_x = _a903[_i904];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c911: boolean = true;
                  if (_c911) {
                    let _c910: boolean = _h905;
                    if (!_c910) {
                      let _q906 = true;
                      Q907: {
                        const _a908 = sp.adj4[v_x];
                        for (let _i909 = 0; _i909 < _a908.length; _i909++) {
                          const v_y = _a908[_i909];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q906 = false;
                            break Q907;
                          }
                        }
                      }
                      _c910 = _q906;
                    }
                    _c911 = _c910;
                  }
                  if (!(_c911)) {
                    _q901 = false;
                    break Q902;
                  }
                }
              }
              if (!(_q901)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ m: v_m, L: v_L, c: v_c, R: v_R.slice(), C: v_C.slice(), b: v_b, r: v_r }, facts)) return 1;
              }
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface SharedBinding {
  L: number;
  v: number;
  t: number;
  k: number;
  K: number;
  j: number;
  s: number;
}

const sharedFacts: number[] = [];
let sharedCands = new Int32Array(0);

/** Its dearest read grows with the board as n. */
export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  if (sharedCands.length < sp.cells.length) sharedCands = new Int32Array(sp.cells.length);
  const cands = sharedCands;
  cands.fill(-1);
  numMarkedKept.clear();
  const _a942 = sp.lines;
  R1:
  for (let _i943 = 0; _i943 < _a942.length; _i943++) {
    const v_L = _a942[_i943];
    const _m414_0 = b.made[0];
    const _m414_1 = b.made[1];
    L944: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      if (!((v_v >= 0))) break L944;
      let _g945 = 0;
      G946: {
        const _a947 = sp.lineCells[v_L];
        for (let _i948 = 0; _i948 < _a947.length; _i948++) {
          const v_c = _a947[_i948];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g945++;
        }
      }
      L949: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g945);
        if (!(((v_t === 1) || (v_t === 2)))) break L949;
        const _a950 = sp.lineCells[v_L];
        for (let _i951 = 0; _i951 < _a950.length; _i951++) {
          const v_k = _a950[_i951];
          const v_K = crossing(sp, v_L, v_k);
          const v_j = numMarked(b, sp, cl, cands, v_K);
          const _h959 = (v_j >= 0);
          let _g952 = 0;
          G953: {
            const _a954 = sp.adj4[v_k];
            for (let _i955 = 0; _i955 < _a954.length; _i955++) {
              const v_x = _a954[_i955];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g952++;
            }
          }
          let _g956 = 0;
          G957: {
            for (let _i958 = 0; _i958 < 1; _i958++) {
              const v_x = v_k;
              let _c965: boolean = (!((b.grid[v_x] !== 0)) && _h959);
              if (_c965) {
                const _t960 = sp.lineCells[v_K];
                let _g961 = 0;
                G962: {
                  const _a963 = _t960;
                  for (let _i964 = 0; _i964 < _a963.length; _i964++) {
                    const v_c = _a963[_i964];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g961++;
                  }
                }
                _c965 = ((v_j - _g961) === 1);
              }
              if (!(_c965)) continue;
              _g956++;
            }
          }
          L966: {
            const v_s = (_g952 + _g956);
            if (!((v_s > v_t))) break L966;
            if (b.made[0] !== _m414_0 || b.made[1] !== _m414_1) {
              if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
              let _g967 = 0;
              G968: {
                const _a969 = sp.lineCells[v_L];
                for (let _i970 = 0; _i970 < _a969.length; _i970++) {
                  const v_c = _a969[_i970];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g967++;
                }
              }
              if (!((v_t === ((sp.lineCells[v_L].length - v_v) - _g967)))) { continue R1; }
            }
            facts.length = 0;
            changed = false;
            let _q971 = true;
            Q972: {
              const _a973 = sp.adj4[v_k];
              for (let _i974 = 0; _i974 < _a973.length; _i974++) {
                const v_y = _a973[_i974];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q971 = false;
                  break Q972;
                }
              }
            }
            if (!(_q971)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ L: v_L, v: v_v, t: v_t, k: v_k, K: v_K, j: v_j, s: v_s }, facts)) return 1;
              cands.fill(-1);
              numMarkedKept.clear();
            }
          }
        }
      }
    }
  }
  return fired;
}

export interface LastWaterBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  t: number;
  H: readonly number[];
}

const lastWaterFacts: number[] = [];
let lastWaterCands = new Int32Array(0);
const _st1325 = stamps();
const _st1347 = stamps();
const _st1483 = stamps();
const _st1490 = stamps();
const _st1532 = stamps();
const _st1566 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g1290: number[] = [];
  const _g1296: number[] = [];
  const _g1306: number[] = [];
  const _g1319: number[] = [];
  const _g1340: number[] = [];
  const _g1388: number[] = [];
  const _g1397: number[] = [];
  const _g1484: number[] = [];
  const _g1502: number[] = [];
  const _g1512: number[] = [];
  const _g1526: number[] = [];
  const _g1546: number[] = [];
  const _g1560: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  const _k1581 = boatsOfKept.board(cl);
  if (lastWaterCands.length < sp.cells.length) lastWaterCands = new Int32Array(sp.cells.length);
  const cands = lastWaterCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1269 = -1;
  G1270: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1271 = cl.fleet.length[v_k];
      if (_g1269 === -1 || _t1271 > _g1269) _g1269 = _t1271;
    }
  }
  const v_T = _g1269;
  const _a1272 = sp.lines;
  R1:
  for (let _i1273 = 0; _i1273 < _a1272.length; _i1273++) {
    const v_L = _a1272[_i1273];
    const _m460_0 = b.made[0];
    const _m460_1 = b.made[1];
    let _q1274 = false;
    Q1275: {
      const _a1276 = sp.lineCells[v_L];
      for (let _i1277 = 0; _i1277 < _a1276.length; _i1277++) {
        const v_c = _a1276[_i1277];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q1274 = true;
          break Q1275;
        }
      }
    }
    if (!(_q1274)) continue;
    L1278: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1283: boolean = (v_v >= 0);
      if (_c1283) {
        let _g1279 = 0;
        G1280: {
          const _a1281 = sp.lineCells[v_L];
          for (let _i1282 = 0; _i1282 < _a1281.length; _i1282++) {
            const v_c = _a1281[_i1282];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1279++;
          }
        }
        _c1283 = (((sp.lineCells[v_L].length - v_v) - _g1279) === 1);
      }
      if (!(_c1283)) break L1278;
      const _a1284 = sp.lineCells[v_L];
      for (let _i1285 = 0; _i1285 < _a1284.length; _i1285++) {
        const v_c = _a1284[_i1285];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1314 = (v_j >= 0);
        let _g1286 = 0;
        G1287: {
          const _a1288 = sp.lineCells[v_K];
          for (let _i1289 = 0; _i1289 < _a1288.length; _i1289++) {
            const v_c = _a1288[_i1289];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1286++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1286);
        const _h1315 = (v_t === 1);
        const _h1316 = (_h1314 && _h1315);
        _g1290.length = 0;
        G1291: {
          const _a1294 = sp.lineCells[v_L];
          for (let _i1295 = 0; _i1295 < _a1294.length; _i1295++) {
            const v_x = _a1294[_i1295];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1290.push(v_x);
          }
        }
        _g1296.length = 0;
        G1297: {
          _g1306.length = 0;
          G1307: {
            const _a1310 = sp.lineCells[v_K];
            for (let _i1311 = 0; _i1311 < _a1310.length; _i1311++) {
              const v_x = _a1310[_i1311];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1306.push(v_x);
            }
          }
          const _a1312 = _g1306;
          for (let _i1313 = 0; _i1313 < _a1312.length; _i1313++) {
            const v_x = _a1312[_i1313];
            if (!(_h1316)) continue;
            _g1296.push(v_x);
          }
        }
        L1317: {
          const v_H = union(_g1290, _g1296);
          const _t1318 = setOf(v_c);
          _g1319.length = 0;
          _st1325.pass++;
          G1320: {
            const _a1326 = v_H;
            for (let _i1327 = 0; _i1327 < _a1326.length; _i1327++) {
              const v_a = _a1326[_i1327];
              const _a1328 = sp.adj8[v_a];
              for (let _i1329 = 0; _i1329 < _a1328.length; _i1329++) {
                const v_d = _a1328[_i1329];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t1330 = v_d;
                if (_g1319.length < 16) { if (!_g1319.includes(_t1330)) _g1319.push(_t1330); } else addOnce(_g1319, _st1325, _t1330);
              }
            }
          }
          const _t1331 = union(_t1318, _g1319);
          const _h1491 = union(v_H, _t1331);
          let _q1332 = false;
          Q1333: {
            const _a1334 = v_H;
            for (let _i1335 = 0; _i1335 < _a1334.length; _i1335++) {
              const v_a = _a1334[_i1335];
              const _a1336 = sp.adj8[v_a];
              for (let _i1337 = 0; _i1337 < _a1336.length; _i1337++) {
                const v_b = _a1336[_i1337];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1332 = true;
                  break Q1333;
                }
              }
            }
          }
          let _c1366: boolean = _q1332;
          if (!_c1366) {
            let _q1338 = false;
            Q1339: {
              _g1340.length = 0;
              _st1347.pass++;
              G1341: {
                const _a1348 = union(v_H, _t1331);
                for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
                  const v_a = _a1348[_i1349];
                  const _t1350 = sp.rowOf[v_a];
                  const _t1351 = sp.colOf[v_a];
                  for (let _i1352 = 0; _i1352 < 2; _i1352++) {
                    const v_M = _i1352 === 0 ? _t1350 : _t1351;
                    if (_i1352 === 1 && (v_M === _t1350)) continue;
                    const _t1353 = v_M;
                    if (_g1340.length < 16) { if (!_g1340.includes(_t1353)) _g1340.push(_t1353); } else addOnce(_g1340, _st1347, _t1353);
                  }
                }
              }
              const _a1354 = _g1340;
              for (let _i1355 = 0; _i1355 < _a1354.length; _i1355++) {
                const v_L = _a1354[_i1355];
                L1356: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1356;
                  let _g1357 = 0;
                  G1358: {
                    const _a1359 = sp.lineCells[v_L];
                    for (let _i1360 = 0; _i1360 < _a1359.length; _i1360++) {
                      const v_x = _a1359[_i1360];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1357++;
                    }
                  }
                  let _c1365: boolean = (_g1357 > v_v);
                  if (!_c1365) {
                    let _g1361 = 0;
                    G1362: {
                      const _a1363 = sp.lineCells[v_L];
                      for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
                        const v_x = _a1363[_i1364];
                        if (!((!(_t1331.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1361++;
                      }
                    }
                    _c1365 = (_g1361 < v_v);
                  }
                  if (_c1365) {
                    _q1338 = true;
                    break Q1339;
                  }
                }
              }
            }
            _c1366 = _q1338;
          }
          let _c1373: boolean = _c1366;
          if (!_c1373) {
            let _g1367 = 0;
            G1368: {
              const _a1369 = sp.cells;
              for (let _i1370 = 0; _i1370 < _a1369.length; _i1370++) {
                const v_x = _a1369[_i1370];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1367++;
              }
            }
            let _g1371 = 0;
            G1372: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1371 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1373 = (_g1367 > _g1371);
          }
          let _c1380: boolean = _c1373;
          if (!_c1380) {
            let _g1374 = 0;
            G1375: {
              const _a1376 = sp.cells;
              for (let _i1377 = 0; _i1377 < _a1376.length; _i1377++) {
                const v_x = _a1376[_i1377];
                if (!((!(_t1331.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1374++;
              }
            }
            let _g1378 = 0;
            G1379: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1378 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1380 = (_g1374 < _g1378);
          }
          let _c1394: boolean = _c1380;
          if (!_c1394) {
            let _q1381 = false;
            Q1382: {
              const _a1383 = v_H;
              for (let _i1384 = 0; _i1384 < _a1383.length; _i1384++) {
                const v_a = _a1383[_i1384];
                const _t1385 = sp.rowOf[v_a];
                const _t1386 = sp.colOf[v_a];
                for (let _i1387 = 0; _i1387 < 2; _i1387++) {
                  const v_L = _i1387 === 0 ? _t1385 : _t1386;
                  if (_i1387 === 1 && (v_L === _t1385)) continue;
                  _g1388.length = 0;
                  G1389: {
                    const _a1392 = sp.lineCells[v_L];
                    for (let _i1393 = 0; _i1393 < _a1392.length; _i1393++) {
                      const v_x = _a1392[_i1393];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1388.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1388).length > v_T)) {
                    _q1381 = true;
                    break Q1382;
                  }
                }
              }
            }
            _c1394 = _q1381;
          }
          let _c1582: boolean = _c1394;
          if (!_c1582) {
            let _q1395 = false;
            Q1396: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1397.length = 0;
                _st1483.pass++;
                G1398: {
                  _g1484.length = 0;
                  _st1490.pass++;
                  G1485: {
                    const _a1492 = _h1491;
                    for (let _i1493 = 0; _i1493 < _a1492.length; _i1493++) {
                      const v_x = _a1492[_i1493];
                      const _a1494 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1495 = 0; _i1495 < _a1494.length; _i1495++) {
                        const v_y = _a1494[_i1495];
                        const _t1496 = v_y;
                        if (_g1484.length < 16) { if (!_g1484.includes(_t1496)) _g1484.push(_t1496); } else addOnce(_g1484, _st1490, _t1496);
                      }
                    }
                  }
                  const _a1497 = _g1484;
                  for (let _i1498 = 0; _i1498 < _a1497.length; _i1498++) {
                    const v_a = _a1497[_i1498];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t1499 = sp.rowOf[v_a];
                    const _t1500 = sp.colOf[v_a];
                    for (let _i1501 = 0; _i1501 < 2; _i1501++) {
                      const v_L = _i1501 === 0 ? _t1499 : _t1500;
                      if (_i1501 === 1 && (v_L === _t1499)) continue;
                      _g1502.length = 0;
                      G1503: {
                        const _a1506 = sp.lineCells[v_L];
                        for (let _i1507 = 0; _i1507 < _a1506.length; _i1507++) {
                          const v_x = _a1506[_i1507];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1502.push(v_x);
                        }
                      }
                      L1508: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1502);
                        const _h1509 = v_G.length;
                        const _h1540 = (_h1509 === 1);
                        let _c1543: boolean = (_h1509 === v_m);
                        if (_c1543) {
                          let _q1510 = true;
                          Q1511: {
                            _g1512.length = 0;
                            G1513: {
                              _g1526.length = 0;
                              _st1532.pass++;
                              G1527: {
                                const _a1533 = v_G;
                                for (let _i1534 = 0; _i1534 < _a1533.length; _i1534++) {
                                  const v_g = _a1533[_i1534];
                                  const _a1535 = sp.adj4[v_g];
                                  for (let _i1536 = 0; _i1536 < _a1535.length; _i1536++) {
                                    const v_z = _a1535[_i1536];
                                    const _t1537 = v_z;
                                    if (_g1526.length < 16) { if (!_g1526.includes(_t1537)) _g1526.push(_t1537); } else addOnce(_g1526, _st1532, _t1537);
                                  }
                                }
                              }
                              const _a1538 = _g1526;
                              for (let _i1539 = 0; _i1539 < _a1538.length; _i1539++) {
                                const v_y = _a1538[_i1539];
                                if (!((!(v_G.includes(v_y)) && (_h1540 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1512.push(v_y);
                              }
                            }
                            const _a1541 = _g1512;
                            for (let _i1542 = 0; _i1542 < _a1541.length; _i1542++) {
                              const v_y = _a1541[_i1542];
                              if (!(((_t1331.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1510 = false;
                                break Q1511;
                              }
                            }
                          }
                          _c1543 = _q1510;
                        }
                        let _c1576: boolean = _c1543;
                        if (_c1576) {
                          let _q1544 = false;
                          Q1545: {
                            _g1546.length = 0;
                            G1547: {
                              _g1560.length = 0;
                              _st1566.pass++;
                              G1561: {
                                const _a1567 = v_G;
                                for (let _i1568 = 0; _i1568 < _a1567.length; _i1568++) {
                                  const v_g = _a1567[_i1568];
                                  const _a1569 = sp.adj4[v_g];
                                  for (let _i1570 = 0; _i1570 < _a1569.length; _i1570++) {
                                    const v_z = _a1569[_i1570];
                                    const _t1571 = v_z;
                                    if (_g1560.length < 16) { if (!_g1560.includes(_t1571)) _g1560.push(_t1571); } else addOnce(_g1560, _st1566, _t1571);
                                  }
                                }
                              }
                              const _a1572 = _g1560;
                              for (let _i1573 = 0; _i1573 < _a1572.length; _i1573++) {
                                const v_y = _a1572[_i1573];
                                if (!((!(v_G.includes(v_y)) && (_h1540 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1546.push(v_y);
                              }
                            }
                            const _a1574 = union(v_G, _g1546);
                            for (let _i1575 = 0; _i1575 < _a1574.length; _i1575++) {
                              const v_x = _a1574[_i1575];
                              if (((v_H.includes(v_x)) || (_t1331.includes(v_x)))) {
                                _q1544 = true;
                                break Q1545;
                              }
                            }
                          }
                          _c1576 = _q1544;
                        }
                        if (!(_c1576)) break L1508;
                        const _t1577 = (v_G[0] ?? -1);
                        const _t1578 = _t1577;
                        if (_g1397.length < 16) { if (!_g1397.includes(_t1578)) _g1397.push(_t1578); } else addOnce(_g1397, _st1483, _t1578);
                      }
                    }
                  }
                }
                L1579: {
                  const v_C = _g1397;
                  const _h1580 = v_C.length;
                  if (!((_h1580 > 0))) break L1579;
                  if ((_h1580 > ((_k1581[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q1395 = true;
                    break Q1396;
                  }
                }
              }
            }
            _c1582 = _q1395;
          }
          if (!(_c1582)) break L1317;
          if (b.made[0] !== _m460_0 || b.made[1] !== _m460_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c1587: boolean = (v_v >= 0);
            if (_c1587) {
              let _g1583 = 0;
              G1584: {
                const _a1585 = sp.lineCells[v_L];
                for (let _i1586 = 0; _i1586 < _a1585.length; _i1586++) {
                  const v_c = _a1585[_i1586];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g1583++;
                }
              }
              _c1587 = (((sp.lineCells[v_L].length - v_v) - _g1583) === 1);
            }
            if (!(_c1587)) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, t: v_t, H: v_H.slice() }, facts)) return 1;
            cands.fill(-1);
            numMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface LastShipBinding {
  T: number;
  L: number;
  v: number;
  c: number;
  K: number;
  j: number;
  u: number;
  W: readonly number[];
}

const lastShipFacts: number[] = [];
let lastShipCands = new Int32Array(0);
const _st1942 = stamps();
const _st1964 = stamps();
const _st2100 = stamps();
const _st2107 = stamps();
const _st2149 = stamps();
const _st2183 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g1907: number[] = [];
  const _g1913: number[] = [];
  const _g1923: number[] = [];
  const _g1936: number[] = [];
  const _g1957: number[] = [];
  const _g2005: number[] = [];
  const _g2014: number[] = [];
  const _g2101: number[] = [];
  const _g2119: number[] = [];
  const _g2129: number[] = [];
  const _g2143: number[] = [];
  const _g2163: number[] = [];
  const _g2177: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  const _k2198 = boatsOfKept.board(cl);
  if (lastShipCands.length < sp.cells.length) lastShipCands = new Int32Array(sp.cells.length);
  const cands = lastShipCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1884 = -1;
  G1885: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1886 = cl.fleet.length[v_k];
      if (_g1884 === -1 || _t1886 > _g1884) _g1884 = _t1886;
    }
  }
  const v_T = _g1884;
  const _a1887 = sp.lines;
  R1:
  for (let _i1888 = 0; _i1888 < _a1887.length; _i1888++) {
    const v_L = _a1887[_i1888];
    const _m556_0 = b.made[0];
    const _m556_1 = b.made[1];
    let _q1889 = false;
    Q1890: {
      const _a1891 = sp.lineCells[v_L];
      for (let _i1892 = 0; _i1892 < _a1891.length; _i1892++) {
        const v_c = _a1891[_i1892];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q1889 = true;
          break Q1890;
        }
      }
    }
    if (!(_q1889)) continue;
    L1893: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1899: boolean = (v_v >= 0);
      if (_c1899) {
        const _t1894 = sp.lineCells[v_L];
        let _g1895 = 0;
        G1896: {
          const _a1897 = _t1894;
          for (let _i1898 = 0; _i1898 < _a1897.length; _i1898++) {
            const v_c = _a1897[_i1898];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1895++;
          }
        }
        _c1899 = ((v_v - _g1895) === 1);
      }
      if (!(_c1899)) break L1893;
      const _a1900 = sp.lineCells[v_L];
      for (let _i1901 = 0; _i1901 < _a1900.length; _i1901++) {
        const v_c = _a1900[_i1901];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1931 = (v_j >= 0);
        const _t1902 = sp.lineCells[v_K];
        let _g1903 = 0;
        G1904: {
          const _a1905 = _t1902;
          for (let _i1906 = 0; _i1906 < _a1905.length; _i1906++) {
            const v_c = _a1905[_i1906];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1903++;
          }
        }
        const v_u = (v_j - _g1903);
        const _h1932 = (v_u === 1);
        const _h1933 = (_h1931 && _h1932);
        _g1907.length = 0;
        G1908: {
          const _a1911 = sp.lineCells[v_L];
          for (let _i1912 = 0; _i1912 < _a1911.length; _i1912++) {
            const v_x = _a1911[_i1912];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1907.push(v_x);
          }
        }
        _g1913.length = 0;
        G1914: {
          _g1923.length = 0;
          G1924: {
            const _a1927 = sp.lineCells[v_K];
            for (let _i1928 = 0; _i1928 < _a1927.length; _i1928++) {
              const v_x = _a1927[_i1928];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1923.push(v_x);
            }
          }
          const _a1929 = _g1923;
          for (let _i1930 = 0; _i1930 < _a1929.length; _i1930++) {
            const v_x = _a1929[_i1930];
            if (!(_h1933)) continue;
            _g1913.push(v_x);
          }
        }
        L1934: {
          const v_W = union(_g1907, _g1913);
          const _t1935 = setOf(v_c);
          _g1936.length = 0;
          _st1942.pass++;
          G1937: {
            const _a1943 = _t1935;
            for (let _i1944 = 0; _i1944 < _a1943.length; _i1944++) {
              const v_a = _a1943[_i1944];
              const _a1945 = sp.adj8[v_a];
              for (let _i1946 = 0; _i1946 < _a1945.length; _i1946++) {
                const v_d = _a1945[_i1946];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t1947 = v_d;
                if (_g1936.length < 16) { if (!_g1936.includes(_t1947)) _g1936.push(_t1947); } else addOnce(_g1936, _st1942, _t1947);
              }
            }
          }
          const _t1948 = union(v_W, _g1936);
          const _h2108 = union(_t1935, _t1948);
          let _q1949 = false;
          Q1950: {
            const _a1951 = _t1935;
            for (let _i1952 = 0; _i1952 < _a1951.length; _i1952++) {
              const v_a = _a1951[_i1952];
              const _a1953 = sp.adj8[v_a];
              for (let _i1954 = 0; _i1954 < _a1953.length; _i1954++) {
                const v_b = _a1953[_i1954];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1935.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1949 = true;
                  break Q1950;
                }
              }
            }
          }
          let _c1983: boolean = _q1949;
          if (!_c1983) {
            let _q1955 = false;
            Q1956: {
              _g1957.length = 0;
              _st1964.pass++;
              G1958: {
                const _a1965 = union(_t1935, _t1948);
                for (let _i1966 = 0; _i1966 < _a1965.length; _i1966++) {
                  const v_a = _a1965[_i1966];
                  const _t1967 = sp.rowOf[v_a];
                  const _t1968 = sp.colOf[v_a];
                  for (let _i1969 = 0; _i1969 < 2; _i1969++) {
                    const v_M = _i1969 === 0 ? _t1967 : _t1968;
                    if (_i1969 === 1 && (v_M === _t1967)) continue;
                    const _t1970 = v_M;
                    if (_g1957.length < 16) { if (!_g1957.includes(_t1970)) _g1957.push(_t1970); } else addOnce(_g1957, _st1964, _t1970);
                  }
                }
              }
              const _a1971 = _g1957;
              for (let _i1972 = 0; _i1972 < _a1971.length; _i1972++) {
                const v_L = _a1971[_i1972];
                L1973: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1973;
                  let _g1974 = 0;
                  G1975: {
                    const _a1976 = sp.lineCells[v_L];
                    for (let _i1977 = 0; _i1977 < _a1976.length; _i1977++) {
                      const v_x = _a1976[_i1977];
                      if (!(((_t1935.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1974++;
                    }
                  }
                  let _c1982: boolean = (_g1974 > v_v);
                  if (!_c1982) {
                    let _g1978 = 0;
                    G1979: {
                      const _a1980 = sp.lineCells[v_L];
                      for (let _i1981 = 0; _i1981 < _a1980.length; _i1981++) {
                        const v_x = _a1980[_i1981];
                        if (!((!(_t1948.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1978++;
                      }
                    }
                    _c1982 = (_g1978 < v_v);
                  }
                  if (_c1982) {
                    _q1955 = true;
                    break Q1956;
                  }
                }
              }
            }
            _c1983 = _q1955;
          }
          let _c1990: boolean = _c1983;
          if (!_c1990) {
            let _g1984 = 0;
            G1985: {
              const _a1986 = sp.cells;
              for (let _i1987 = 0; _i1987 < _a1986.length; _i1987++) {
                const v_x = _a1986[_i1987];
                if (!(((_t1935.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1984++;
              }
            }
            let _g1988 = 0;
            G1989: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1988 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1990 = (_g1984 > _g1988);
          }
          let _c1997: boolean = _c1990;
          if (!_c1997) {
            let _g1991 = 0;
            G1992: {
              const _a1993 = sp.cells;
              for (let _i1994 = 0; _i1994 < _a1993.length; _i1994++) {
                const v_x = _a1993[_i1994];
                if (!((!(_t1948.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1991++;
              }
            }
            let _g1995 = 0;
            G1996: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1995 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1997 = (_g1991 < _g1995);
          }
          let _c2011: boolean = _c1997;
          if (!_c2011) {
            let _q1998 = false;
            Q1999: {
              const _a2000 = _t1935;
              for (let _i2001 = 0; _i2001 < _a2000.length; _i2001++) {
                const v_a = _a2000[_i2001];
                const _t2002 = sp.rowOf[v_a];
                const _t2003 = sp.colOf[v_a];
                for (let _i2004 = 0; _i2004 < 2; _i2004++) {
                  const v_L = _i2004 === 0 ? _t2002 : _t2003;
                  if (_i2004 === 1 && (v_L === _t2002)) continue;
                  _g2005.length = 0;
                  G2006: {
                    const _a2009 = sp.lineCells[v_L];
                    for (let _i2010 = 0; _i2010 < _a2009.length; _i2010++) {
                      const v_x = _a2009[_i2010];
                      if (!(((_t1935.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2005.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2005).length > v_T)) {
                    _q1998 = true;
                    break Q1999;
                  }
                }
              }
            }
            _c2011 = _q1998;
          }
          let _c2199: boolean = _c2011;
          if (!_c2199) {
            let _q2012 = false;
            Q2013: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2014.length = 0;
                _st2100.pass++;
                G2015: {
                  _g2101.length = 0;
                  _st2107.pass++;
                  G2102: {
                    const _a2109 = _h2108;
                    for (let _i2110 = 0; _i2110 < _a2109.length; _i2110++) {
                      const v_x = _a2109[_i2110];
                      const _a2111 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2112 = 0; _i2112 < _a2111.length; _i2112++) {
                        const v_y = _a2111[_i2112];
                        const _t2113 = v_y;
                        if (_g2101.length < 16) { if (!_g2101.includes(_t2113)) _g2101.push(_t2113); } else addOnce(_g2101, _st2107, _t2113);
                      }
                    }
                  }
                  const _a2114 = _g2101;
                  for (let _i2115 = 0; _i2115 < _a2114.length; _i2115++) {
                    const v_a = _a2114[_i2115];
                    if (!(((_t1935.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2116 = sp.rowOf[v_a];
                    const _t2117 = sp.colOf[v_a];
                    for (let _i2118 = 0; _i2118 < 2; _i2118++) {
                      const v_L = _i2118 === 0 ? _t2116 : _t2117;
                      if (_i2118 === 1 && (v_L === _t2116)) continue;
                      _g2119.length = 0;
                      G2120: {
                        const _a2123 = sp.lineCells[v_L];
                        for (let _i2124 = 0; _i2124 < _a2123.length; _i2124++) {
                          const v_x = _a2123[_i2124];
                          if (!(((_t1935.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2119.push(v_x);
                        }
                      }
                      L2125: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2119);
                        const _h2126 = v_G.length;
                        const _h2157 = (_h2126 === 1);
                        let _c2160: boolean = (_h2126 === v_m);
                        if (_c2160) {
                          let _q2127 = true;
                          Q2128: {
                            _g2129.length = 0;
                            G2130: {
                              _g2143.length = 0;
                              _st2149.pass++;
                              G2144: {
                                const _a2150 = v_G;
                                for (let _i2151 = 0; _i2151 < _a2150.length; _i2151++) {
                                  const v_g = _a2150[_i2151];
                                  const _a2152 = sp.adj4[v_g];
                                  for (let _i2153 = 0; _i2153 < _a2152.length; _i2153++) {
                                    const v_z = _a2152[_i2153];
                                    const _t2154 = v_z;
                                    if (_g2143.length < 16) { if (!_g2143.includes(_t2154)) _g2143.push(_t2154); } else addOnce(_g2143, _st2149, _t2154);
                                  }
                                }
                              }
                              const _a2155 = _g2143;
                              for (let _i2156 = 0; _i2156 < _a2155.length; _i2156++) {
                                const v_y = _a2155[_i2156];
                                if (!((!(v_G.includes(v_y)) && (_h2157 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2129.push(v_y);
                              }
                            }
                            const _a2158 = _g2129;
                            for (let _i2159 = 0; _i2159 < _a2158.length; _i2159++) {
                              const v_y = _a2158[_i2159];
                              if (!(((_t1948.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2127 = false;
                                break Q2128;
                              }
                            }
                          }
                          _c2160 = _q2127;
                        }
                        let _c2193: boolean = _c2160;
                        if (_c2193) {
                          let _q2161 = false;
                          Q2162: {
                            _g2163.length = 0;
                            G2164: {
                              _g2177.length = 0;
                              _st2183.pass++;
                              G2178: {
                                const _a2184 = v_G;
                                for (let _i2185 = 0; _i2185 < _a2184.length; _i2185++) {
                                  const v_g = _a2184[_i2185];
                                  const _a2186 = sp.adj4[v_g];
                                  for (let _i2187 = 0; _i2187 < _a2186.length; _i2187++) {
                                    const v_z = _a2186[_i2187];
                                    const _t2188 = v_z;
                                    if (_g2177.length < 16) { if (!_g2177.includes(_t2188)) _g2177.push(_t2188); } else addOnce(_g2177, _st2183, _t2188);
                                  }
                                }
                              }
                              const _a2189 = _g2177;
                              for (let _i2190 = 0; _i2190 < _a2189.length; _i2190++) {
                                const v_y = _a2189[_i2190];
                                if (!((!(v_G.includes(v_y)) && (_h2157 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2163.push(v_y);
                              }
                            }
                            const _a2191 = union(v_G, _g2163);
                            for (let _i2192 = 0; _i2192 < _a2191.length; _i2192++) {
                              const v_x = _a2191[_i2192];
                              if (((_t1935.includes(v_x)) || (_t1948.includes(v_x)))) {
                                _q2161 = true;
                                break Q2162;
                              }
                            }
                          }
                          _c2193 = _q2161;
                        }
                        if (!(_c2193)) break L2125;
                        const _t2194 = (v_G[0] ?? -1);
                        const _t2195 = _t2194;
                        if (_g2014.length < 16) { if (!_g2014.includes(_t2195)) _g2014.push(_t2195); } else addOnce(_g2014, _st2100, _t2195);
                      }
                    }
                  }
                }
                L2196: {
                  const v_C = _g2014;
                  const _h2197 = v_C.length;
                  if (!((_h2197 > 0))) break L2196;
                  if ((_h2197 > ((_k2198[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q2012 = true;
                    break Q2013;
                  }
                }
              }
            }
            _c2199 = _q2012;
          }
          if (!(_c2199)) break L1934;
          if (b.made[0] !== _m556_0 || b.made[1] !== _m556_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c2205: boolean = (v_v >= 0);
            if (_c2205) {
              const _t2200 = sp.lineCells[v_L];
              let _g2201 = 0;
              G2202: {
                const _a2203 = _t2200;
                for (let _i2204 = 0; _i2204 < _a2203.length; _i2204++) {
                  const v_c = _a2203[_i2204];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g2201++;
                }
              }
              _c2205 = ((v_v - _g2201) === 1);
            }
            if (!(_c2205)) { continue R1; }
          }
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, u: v_u, W: v_W.slice() }, facts)) return 1;
            cands.fill(-1);
            numMarkedKept.clear();
          }
        }
      }
    }
  }
  return fired;
}

export interface CenterTrialBinding {
  T: number;
  c: number;
  L: number;
  S: readonly number[];
}

const centerTrialFacts: number[] = [];
let centerTrialCands = new Int32Array(0);
const _st2514 = stamps();
const _st2536 = stamps();
const _st2672 = stamps();
const _st2679 = stamps();
const _st2721 = stamps();
const _st2755 = stamps();

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g2489: number[] = [];
  const _g2502: number[] = [];
  const _g2508: number[] = [];
  const _g2529: number[] = [];
  const _g2577: number[] = [];
  const _g2586: number[] = [];
  const _g2673: number[] = [];
  const _g2691: number[] = [];
  const _g2701: number[] = [];
  const _g2715: number[] = [];
  const _g2735: number[] = [];
  const _g2749: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  const _k2770 = boatsOfKept.board(cl);
  if (centerTrialCands.length < sp.cells.length) centerTrialCands = new Int32Array(sp.cells.length);
  const cands = centerTrialCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g2480 = -1;
  G2481: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2482 = cl.fleet.length[v_k];
      if (_g2480 === -1 || _t2482 > _g2480) _g2480 = _t2482;
    }
  }
  const v_T = _g2480;
  const _a2483 = cluesValued(cl.seg, 6);
  for (let _i2484 = 0; _i2484 < _a2483.length; _i2484++) {
    const v_c = _a2483[_i2484];
    const _h2485 = clueAt(cl.seg, v_c);
    if (!((_h2485 === 6))) continue;
    const _t2486 = sp.rowOf[v_c];
    const _t2487 = sp.colOf[v_c];
    for (let _i2488 = 0; _i2488 < 2; _i2488++) {
      const v_L = _i2488 === 0 ? _t2486 : _t2487;
      if (_i2488 === 1 && (v_L === _t2486)) continue;
      _g2489.length = 0;
      G2490: {
        const _a2493 = sp.adj4[v_c];
        for (let _i2494 = 0; _i2494 < _a2493.length; _i2494++) {
          const v_x = _a2493[_i2494];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g2489.push(v_x);
        }
      }
      L2495: {
        const v_S = _g2489;
        const _h2496 = v_S.length;
        let _c2501: boolean = (_h2496 === 2);
        if (_c2501) {
          let _q2497 = false;
          Q2498: {
            const _a2499 = v_S;
            for (let _i2500 = 0; _i2500 < _a2499.length; _i2500++) {
              const v_x = _a2499[_i2500];
              if (!((b.grid[v_x] !== 0))) {
                _q2497 = true;
                break Q2498;
              }
            }
          }
          _c2501 = _q2497;
        }
        let _c2772: boolean = _c2501;
        if (_c2772) {
          _g2502.length = 0;
          G2503: {
            const _a2506 = v_S;
            for (let _i2507 = 0; _i2507 < _a2506.length; _i2507++) {
              const v_x = _a2506[_i2507];
              if (!((v_x !== v_x))) continue;
              _g2502.push(v_x);
            }
          }
          _g2508.length = 0;
          _st2514.pass++;
          G2509: {
            const _a2515 = v_S;
            for (let _i2516 = 0; _i2516 < _a2515.length; _i2516++) {
              const v_a = _a2515[_i2516];
              const _a2517 = sp.adj8[v_a];
              for (let _i2518 = 0; _i2518 < _a2517.length; _i2518++) {
                const v_d = _a2517[_i2518];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t2519 = v_d;
                if (_g2508.length < 16) { if (!_g2508.includes(_t2519)) _g2508.push(_t2519); } else addOnce(_g2508, _st2514, _t2519);
              }
            }
          }
          const _t2520 = union(_g2502, _g2508);
          const _h2680 = union(v_S, _t2520);
          let _q2521 = false;
          Q2522: {
            const _a2523 = v_S;
            for (let _i2524 = 0; _i2524 < _a2523.length; _i2524++) {
              const v_a = _a2523[_i2524];
              const _a2525 = sp.adj8[v_a];
              for (let _i2526 = 0; _i2526 < _a2525.length; _i2526++) {
                const v_b = _a2525[_i2526];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2521 = true;
                  break Q2522;
                }
              }
            }
          }
          let _c2555: boolean = _q2521;
          if (!_c2555) {
            let _q2527 = false;
            Q2528: {
              _g2529.length = 0;
              _st2536.pass++;
              G2530: {
                const _a2537 = union(v_S, _t2520);
                for (let _i2538 = 0; _i2538 < _a2537.length; _i2538++) {
                  const v_a = _a2537[_i2538];
                  const _t2539 = sp.rowOf[v_a];
                  const _t2540 = sp.colOf[v_a];
                  for (let _i2541 = 0; _i2541 < 2; _i2541++) {
                    const v_M = _i2541 === 0 ? _t2539 : _t2540;
                    if (_i2541 === 1 && (v_M === _t2539)) continue;
                    const _t2542 = v_M;
                    if (_g2529.length < 16) { if (!_g2529.includes(_t2542)) _g2529.push(_t2542); } else addOnce(_g2529, _st2536, _t2542);
                  }
                }
              }
              const _a2543 = _g2529;
              for (let _i2544 = 0; _i2544 < _a2543.length; _i2544++) {
                const v_L = _a2543[_i2544];
                L2545: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L2545;
                  let _g2546 = 0;
                  G2547: {
                    const _a2548 = sp.lineCells[v_L];
                    for (let _i2549 = 0; _i2549 < _a2548.length; _i2549++) {
                      const v_x = _a2548[_i2549];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2546++;
                    }
                  }
                  let _c2554: boolean = (_g2546 > v_v);
                  if (!_c2554) {
                    let _g2550 = 0;
                    G2551: {
                      const _a2552 = sp.lineCells[v_L];
                      for (let _i2553 = 0; _i2553 < _a2552.length; _i2553++) {
                        const v_x = _a2552[_i2553];
                        if (!((!(_t2520.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2550++;
                      }
                    }
                    _c2554 = (_g2550 < v_v);
                  }
                  if (_c2554) {
                    _q2527 = true;
                    break Q2528;
                  }
                }
              }
            }
            _c2555 = _q2527;
          }
          let _c2562: boolean = _c2555;
          if (!_c2562) {
            let _g2556 = 0;
            G2557: {
              const _a2558 = sp.cells;
              for (let _i2559 = 0; _i2559 < _a2558.length; _i2559++) {
                const v_x = _a2558[_i2559];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2556++;
              }
            }
            let _g2560 = 0;
            G2561: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2560 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2562 = (_g2556 > _g2560);
          }
          let _c2569: boolean = _c2562;
          if (!_c2569) {
            let _g2563 = 0;
            G2564: {
              const _a2565 = sp.cells;
              for (let _i2566 = 0; _i2566 < _a2565.length; _i2566++) {
                const v_x = _a2565[_i2566];
                if (!((!(_t2520.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2563++;
              }
            }
            let _g2567 = 0;
            G2568: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2567 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2569 = (_g2563 < _g2567);
          }
          let _c2583: boolean = _c2569;
          if (!_c2583) {
            let _q2570 = false;
            Q2571: {
              const _a2572 = v_S;
              for (let _i2573 = 0; _i2573 < _a2572.length; _i2573++) {
                const v_a = _a2572[_i2573];
                const _t2574 = sp.rowOf[v_a];
                const _t2575 = sp.colOf[v_a];
                for (let _i2576 = 0; _i2576 < 2; _i2576++) {
                  const v_L = _i2576 === 0 ? _t2574 : _t2575;
                  if (_i2576 === 1 && (v_L === _t2574)) continue;
                  _g2577.length = 0;
                  G2578: {
                    const _a2581 = sp.lineCells[v_L];
                    for (let _i2582 = 0; _i2582 < _a2581.length; _i2582++) {
                      const v_x = _a2581[_i2582];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2577.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2577).length > v_T)) {
                    _q2570 = true;
                    break Q2571;
                  }
                }
              }
            }
            _c2583 = _q2570;
          }
          let _c2771: boolean = _c2583;
          if (!_c2771) {
            let _q2584 = false;
            Q2585: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2586.length = 0;
                _st2672.pass++;
                G2587: {
                  _g2673.length = 0;
                  _st2679.pass++;
                  G2674: {
                    const _a2681 = _h2680;
                    for (let _i2682 = 0; _i2682 < _a2681.length; _i2682++) {
                      const v_x = _a2681[_i2682];
                      const _a2683 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2684 = 0; _i2684 < _a2683.length; _i2684++) {
                        const v_y = _a2683[_i2684];
                        const _t2685 = v_y;
                        if (_g2673.length < 16) { if (!_g2673.includes(_t2685)) _g2673.push(_t2685); } else addOnce(_g2673, _st2679, _t2685);
                      }
                    }
                  }
                  const _a2686 = _g2673;
                  for (let _i2687 = 0; _i2687 < _a2686.length; _i2687++) {
                    const v_a = _a2686[_i2687];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2688 = sp.rowOf[v_a];
                    const _t2689 = sp.colOf[v_a];
                    for (let _i2690 = 0; _i2690 < 2; _i2690++) {
                      const v_L = _i2690 === 0 ? _t2688 : _t2689;
                      if (_i2690 === 1 && (v_L === _t2688)) continue;
                      _g2691.length = 0;
                      G2692: {
                        const _a2695 = sp.lineCells[v_L];
                        for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
                          const v_x = _a2695[_i2696];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2691.push(v_x);
                        }
                      }
                      L2697: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2691);
                        const _h2698 = v_G.length;
                        const _h2729 = (_h2698 === 1);
                        let _c2732: boolean = (_h2698 === v_m);
                        if (_c2732) {
                          let _q2699 = true;
                          Q2700: {
                            _g2701.length = 0;
                            G2702: {
                              _g2715.length = 0;
                              _st2721.pass++;
                              G2716: {
                                const _a2722 = v_G;
                                for (let _i2723 = 0; _i2723 < _a2722.length; _i2723++) {
                                  const v_g = _a2722[_i2723];
                                  const _a2724 = sp.adj4[v_g];
                                  for (let _i2725 = 0; _i2725 < _a2724.length; _i2725++) {
                                    const v_z = _a2724[_i2725];
                                    const _t2726 = v_z;
                                    if (_g2715.length < 16) { if (!_g2715.includes(_t2726)) _g2715.push(_t2726); } else addOnce(_g2715, _st2721, _t2726);
                                  }
                                }
                              }
                              const _a2727 = _g2715;
                              for (let _i2728 = 0; _i2728 < _a2727.length; _i2728++) {
                                const v_y = _a2727[_i2728];
                                if (!((!(v_G.includes(v_y)) && (_h2729 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2701.push(v_y);
                              }
                            }
                            const _a2730 = _g2701;
                            for (let _i2731 = 0; _i2731 < _a2730.length; _i2731++) {
                              const v_y = _a2730[_i2731];
                              if (!(((_t2520.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2699 = false;
                                break Q2700;
                              }
                            }
                          }
                          _c2732 = _q2699;
                        }
                        let _c2765: boolean = _c2732;
                        if (_c2765) {
                          let _q2733 = false;
                          Q2734: {
                            _g2735.length = 0;
                            G2736: {
                              _g2749.length = 0;
                              _st2755.pass++;
                              G2750: {
                                const _a2756 = v_G;
                                for (let _i2757 = 0; _i2757 < _a2756.length; _i2757++) {
                                  const v_g = _a2756[_i2757];
                                  const _a2758 = sp.adj4[v_g];
                                  for (let _i2759 = 0; _i2759 < _a2758.length; _i2759++) {
                                    const v_z = _a2758[_i2759];
                                    const _t2760 = v_z;
                                    if (_g2749.length < 16) { if (!_g2749.includes(_t2760)) _g2749.push(_t2760); } else addOnce(_g2749, _st2755, _t2760);
                                  }
                                }
                              }
                              const _a2761 = _g2749;
                              for (let _i2762 = 0; _i2762 < _a2761.length; _i2762++) {
                                const v_y = _a2761[_i2762];
                                if (!((!(v_G.includes(v_y)) && (_h2729 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2735.push(v_y);
                              }
                            }
                            const _a2763 = union(v_G, _g2735);
                            for (let _i2764 = 0; _i2764 < _a2763.length; _i2764++) {
                              const v_x = _a2763[_i2764];
                              if (((v_S.includes(v_x)) || (_t2520.includes(v_x)))) {
                                _q2733 = true;
                                break Q2734;
                              }
                            }
                          }
                          _c2765 = _q2733;
                        }
                        if (!(_c2765)) break L2697;
                        const _t2766 = (v_G[0] ?? -1);
                        const _t2767 = _t2766;
                        if (_g2586.length < 16) { if (!_g2586.includes(_t2767)) _g2586.push(_t2767); } else addOnce(_g2586, _st2672, _t2767);
                      }
                    }
                  }
                }
                L2768: {
                  const v_C = _g2586;
                  const _h2769 = v_C.length;
                  if (!((_h2769 > 0))) break L2768;
                  if ((_h2769 > ((_k2770[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q2584 = true;
                    break Q2585;
                  }
                }
              }
            }
            _c2771 = _q2584;
          }
          _c2772 = _c2771;
        }
        if (!(_c2772)) break L2495;
        facts.length = 0;
        changed = false;
        let _q2773 = true;
        Q2774: {
          const _a2775 = v_S;
          for (let _i2776 = 0; _i2776 < _a2775.length; _i2776++) {
            const v_x = _a2775[_i2776];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2773 = false;
              break Q2774;
            }
          }
        }
        if (!(_q2773)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ T: v_T, c: v_c, L: v_L, S: v_S.slice() }, facts)) return 1;
          cands.fill(-1);
          numMarkedKept.clear();
        }
      }
    }
  }
  return fired;
}

const closedKept = keptStore<boolean>();

/** `closed(c)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function closed(b: Marks, sp: GridSpace, v_c: number): boolean {
  const _kept: Kept<boolean> = closedKept.marks(b);
  if (_kept[v_c] !== undefined) return _kept[v_c];
  let _q225 = true;
  Q226: {
    const _t227 = sp.rowOf[v_c];
    const _g228: number[] = [];
    G229: {
      const _a232 = sp.lineCells[_t227];
      for (let _i233 = 0; _i233 < _a232.length; _i233++) {
        const v_x = _a232[_i233];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g228.push(v_x);
      }
    }
    const _t234 = sp.colOf[v_c];
    const _g235: number[] = [];
    G236: {
      const _a239 = sp.lineCells[_t234];
      for (let _i240 = 0; _i240 < _a239.length; _i240++) {
        const v_x = _a239[_i240];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g235.push(v_x);
      }
    }
    const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g228), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g235));
    const _a241 = v_G;
    for (let _i242 = 0; _i242 < _a241.length; _i242++) {
      const v_x = _a241[_i242];
      const _a243 = sp.adj4[v_x];
      for (let _i244 = 0; _i244 < _a243.length; _i244++) {
        const v_y = _a243[_i244];
        let _c252: boolean = !(v_G.includes(v_y));
        if (_c252) {
          const _t245 = sp.rowOf[v_c];
          const _g246: number[] = [];
          G247: {
            const _a250 = sp.lineCells[_t245];
            for (let _i251 = 0; _i251 < _a250.length; _i251++) {
              const v_x = _a250[_i251];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g246.push(v_x);
            }
          }
          _c252 = ((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g246).length === 1) || (sp.lineCells[sp.rowOf[v_c]].includes(v_y)));
        }
        let _c260: boolean = _c252;
        if (_c260) {
          const _t253 = sp.colOf[v_c];
          const _g254: number[] = [];
          G255: {
            const _a258 = sp.lineCells[_t253];
            for (let _i259 = 0; _i259 < _a258.length; _i259++) {
              const v_x = _a258[_i259];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g254.push(v_x);
            }
          }
          _c260 = ((stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g254).length === 1) || (sp.lineCells[sp.colOf[v_c]].includes(v_y)));
        }
        if (!(_c260)) continue;
        if (!(((b.grid[v_y] || -1) === 2))) {
          _q225 = false;
          break Q226;
        }
      }
    }
  }
  const _made = _q225;
  _kept[v_c] = _made;
  return _made;
}

const doneKept = keptStore<number>();

/** `done(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function done(b: Marks, sp: GridSpace, v_m: number): number {
  const _kept: Kept<number> = doneKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g202 = 0;
  G203: {
    const _a204 = cellsValued(b, sp.cells, 1);
    for (let _i205 = 0; _i205 < _a204.length; _i205++) {
      const v_c = _a204[_i205];
      let _c207: boolean = ((b.grid[v_c] || -1) === 1);
      if (_c207) {
        const _t206 = step(sp, v_c, 1);
        _c207 = !(((_t206 !== -1) && ((b.grid[_t206] || -1) === 1)));
      }
      let _c209: boolean = _c207;
      if (_c209) {
        const _t208 = step(sp, v_c, 3);
        _c209 = !(((_t208 !== -1) && ((b.grid[_t208] || -1) === 1)));
      }
      let _c224: boolean = _c209;
      if (_c224) {
        const _t210 = sp.rowOf[v_c];
        const _g211: number[] = [];
        G212: {
          const _a215 = sp.lineCells[_t210];
          for (let _i216 = 0; _i216 < _a215.length; _i216++) {
            const v_x = _a215[_i216];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g211.push(v_x);
          }
        }
        const _t217 = sp.colOf[v_c];
        const _g218: number[] = [];
        G219: {
          const _a222 = sp.lineCells[_t217];
          for (let _i223 = 0; _i223 < _a222.length; _i223++) {
            const v_x = _a222[_i223];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g218.push(v_x);
          }
        }
        _c224 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g211), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g218)).length === v_m);
      }
      if (!((_c224 && closed(b, sp, v_c)))) continue;
      _g202++;
    }
  }
  const _made = _g202;
  _kept[v_m] = _made;
  return _made;
}

const fullKept = keptStore<boolean>();

/** `full(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function full(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = fullKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q200 = true;
  Q201: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      if (!((cl.fleet.boats[v_k] <= done(b, sp, v_m)))) {
        _q200 = false;
        break Q201;
      }
    }
  }
  const _made = _q200;
  _kept[v_m] = _made;
  return _made;
}

const boatsOfKept = keptStore<number>();
let boatsOfOn: object | null = null;
let boatsOfAt: Kept<number> = [];

/** `boatsOf(m)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function boatsOf(_sp: GridSpace, cl: Dealt, v_m: number): number {
  if (cl !== boatsOfOn) {
    boatsOfAt = boatsOfKept.board(cl);
    boatsOfOn = cl;
  }
  const _kept: Kept<number> = boatsOfAt;
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g447 = 0;
  G448: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      _g447 += cl.fleet.boats[v_k];
    }
  }
  const _made = _g447;
  _kept[v_m] = _made;
  return _made;
}

const takingKept = keptStore<number>();

/** `taking(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function taking(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = takingKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g450 = 0;
  G451: {
    const _a452 = sp.lines;
    for (let _i453 = 0; _i453 < _a452.length; _i453++) {
      const v_K = _a452[_i453];
      const _a454 = sp.lineCells[v_K];
      for (let _i455 = 0; _i455 < _a454.length; _i455++) {
        const v_d = _a454[_i455];
        let _c460: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c460) {
          let _q456 = false;
          Q457: {
            const _a458 = sp.adj4[v_d];
            for (let _i459 = 0; _i459 < _a458.length; _i459++) {
              const v_p = _a458[_i459];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q456 = true;
                break Q457;
              }
            }
          }
          _c460 = !(_q456);
        }
        let _c483: boolean = _c460;
        if (_c483) {
          const _g461: number[] = [];
          G462: {
            const _a465 = sp.lineCells[v_K];
            for (let _i466 = 0; _i466 < _a465.length; _i466++) {
              const v_x = _a465[_i466];
              if (!(((b.grid[v_x] || -1) !== 2))) continue;
              _g461.push(v_x);
            }
          }
          const _t467 = stretch(sp.lineCells[v_K], v_d, _g461);
          let _g468 = 0;
          G469: {
            const _a470 = _t467;
            for (let _i471 = 0; _i471 < _a470.length; _i471++) {
              const v_c = _a470[_i471];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g468++;
            }
          }
          let _c482: boolean = ((_g468 < _t467.length) && (_t467.length >= v_m));
          if (_c482) {
            let _c481: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c481) {
              const _t472 = sp.lineCells[v_K];
              let _g473 = 0;
              G474: {
                const _a475 = _t472;
                for (let _i476 = 0; _i476 < _a475.length; _i476++) {
                  const v_c = _a475[_i476];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g473++;
                }
              }
              let _g477 = 0;
              G478: {
                const _a479 = _t467;
                for (let _i480 = 0; _i480 < _a479.length; _i480++) {
                  const v_c = _a479[_i480];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g477++;
                }
              }
              _c481 = (((clueAt(cl.n, v_K) - _g473) + _g477) >= v_m);
            }
            _c482 = _c481;
          }
          _c483 = _c482;
        }
        if (!(_c483)) continue;
        _g450++;
      }
    }
  }
  const _made = _g450;
  _kept[v_m] = _made;
  return _made;
}

const parKept = keptStore<readonly number[]>();
let parOn: object | null = null;
let parAt: Kept<readonly number[]> = [];

/** `par(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function par(sp: GridSpace, v_L: number): readonly number[] {
  if (sp !== parOn) {
    parAt = parKept.board(sp);
    parOn = sp;
  }
  const _kept: Kept<readonly number[]> = parAt;
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _g698: number[] = [];
  G699: {
    const _a702 = sp.lines;
    for (let _i703 = 0; _i703 < _a702.length; _i703++) {
      const v_M = _a702[_i703];
      if (!(((v_M !== v_L) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)))))) continue;
      _g698.push(v_M);
    }
  }
  const _made = _g698;
  _kept[v_L] = _made;
  return _made;
}

const recKept = keptStore<number>();

/** `rec(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function rec(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = recKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  let _g693 = -1;
  G694: {
    for (let _i695 = 0; _i695 < 1; _i695++) {
      const v_K = v_L;
      let _c714: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c714) {
        let _q696 = true;
        Q697: {
          const _a704 = par(sp, v_K);
          for (let _i705 = 0; _i705 < _a704.length; _i705++) {
            const v_M = _a704[_i705];
            let _c713: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c713) {
              const _t706 = sp.lineCells[v_M];
              const _g707: number[] = [];
              G708: {
                const _a711 = _t706;
                for (let _i712 = 0; _i712 < _a711.length; _i712++) {
                  const v_c = _a711[_i712];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g707.push(v_c);
                }
              }
              _c713 = (_g707.length === 0);
            }
            if (!(_c713)) {
              _q696 = false;
              break Q697;
            }
          }
        }
        _c714 = _q696;
      }
      if (!(_c714)) continue;
      let _g715 = 0;
      G716: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g715 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g717 = 0;
      G718: {
        const _a719 = par(sp, v_K);
        for (let _i720 = 0; _i720 < _a719.length; _i720++) {
          const v_M = _a719[_i720];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g717 += clueAt(cl.n, v_M);
        }
      }
      let _g721 = 0;
      G722: {
        const _a723 = par(sp, v_K);
        for (let _i724 = 0; _i724 < _a723.length; _i724++) {
          const v_M = _a723[_i724];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t725 = sp.lineCells[v_M];
          let _g726 = 0;
          G727: {
            const _a728 = _t725;
            for (let _i729 = 0; _i729 < _a728.length; _i729++) {
              const v_c = _a728[_i729];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g726++;
            }
          }
          _g721 += _g726;
        }
      }
      const _t730 = ((_g715 - _g717) - _g721);
      if (_g693 === -1 || _t730 > _g693) _g693 = _t730;
    }
  }
  const _made = _g693;
  _kept[v_L] = _made;
  return _made;
}

const wideKept = keptStore<boolean>();

/** `wide(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function wide(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = wideKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q815 = false;
  Q816: {
    const _a817 = sp.lines;
    for (let _i818 = 0; _i818 < _a817.length; _i818++) {
      const v_K = _a817[_i818];
      const _a819 = sp.lineCells[v_K];
      for (let _i820 = 0; _i820 < _a819.length; _i820++) {
        const v_d = _a819[_i820];
        let _c825: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c825) {
          let _q821 = false;
          Q822: {
            const _a823 = sp.adj4[v_d];
            for (let _i824 = 0; _i824 < _a823.length; _i824++) {
              const v_p = _a823[_i824];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q821 = true;
                break Q822;
              }
            }
          }
          _c825 = !(_q821);
        }
        if (!(_c825)) continue;
        const _g826: number[] = [];
        G827: {
          const _a830 = sp.lineCells[v_K];
          for (let _i831 = 0; _i831 < _a830.length; _i831++) {
            const v_x = _a830[_i831];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g826.push(v_x);
          }
        }
        L832: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g826);
          let _g833 = 0;
          G834: {
            const _a835 = v_R;
            for (let _i836 = 0; _i836 < _a835.length; _i836++) {
              const v_c = _a835[_i836];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g833++;
            }
          }
          let _c847: boolean = ((_g833 < v_R.length) && (v_R.length >= v_m));
          if (_c847) {
            let _c846: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c846) {
              const _t837 = sp.lineCells[v_K];
              let _g838 = 0;
              G839: {
                const _a840 = _t837;
                for (let _i841 = 0; _i841 < _a840.length; _i841++) {
                  const v_c = _a840[_i841];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g838++;
                }
              }
              let _g842 = 0;
              G843: {
                const _a844 = v_R;
                for (let _i845 = 0; _i845 < _a844.length; _i845++) {
                  const v_c = _a844[_i845];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g842++;
                }
              }
              _c846 = (((clueAt(cl.n, v_K) - _g838) + _g842) >= v_m);
            }
            _c847 = _c846;
          }
          if (!(_c847)) break L832;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q815 = true;
            break Q816;
          }
        }
      }
    }
  }
  const _made = _q815;
  _kept[v_m] = _made;
  return _made;
}

const numMarkedKept = new Map<number, number>();

/** `num(L)` as the description defines it, kept by
 * the rung that reads it until a firing changes the marks. */
export function numMarked(b: Marks, sp: GridSpace, cl: Dealt, _cands: Int32Array, v_L: number): number {
  const _was = numMarkedKept.get(v_L);
  if (_was !== undefined) return _was;
  const _made = ((clueAt(cl.n, v_L) + rec(b, sp, cl, v_L)) + 1);
  numMarkedKept.set(v_L, _made);
  return _made;
}

const crossingKept = keptStore<Kept<number>>();
let crossingOn: object | null = null;
let crossingAt: Kept<Kept<number>> = [];

/** `crossing(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function crossing(sp: GridSpace, v_L: number, v_c: number): number {
  if (sp !== crossingOn) {
    crossingAt = crossingKept.board(sp);
    crossingOn = sp;
  }
  const _kept: Kept<Kept<number>> = crossingAt;
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  let _g922 = -1;
  let _n924 = 0;
  G923: {
    const _t925 = sp.rowOf[v_c];
    const _t926 = sp.colOf[v_c];
    for (let _i927 = 0; _i927 < 2; _i927++) {
      const v_M = _i927 === 0 ? _t925 : _t926;
      if (_i927 === 1 && (v_M === _t925)) continue;
      if (!((v_M !== v_L))) continue;
      if (++_n924 === 2) {
        _g922 = -1;
        break G923;
      }
      _g922 = v_M;
    }
  }
  const _made = _g922;
  _kept1[v_c] = _made;
  return _made;
}
