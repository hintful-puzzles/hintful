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
  const _g2777: number[] = [];
  const _g2785: number[] = [];
  const _g2878: number[] = [];
  const _g2886: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2753 = true;
  Q2754: {
    const _a2755 = sp.cells;
    for (let _i2756 = 0; _i2756 < _a2755.length; _i2756++) {
      const v_a = _a2755[_i2756];
      const _h2757 = (g[v_a] || -1);
      if (!((_h2757 === 1))) continue;
      let _q2758 = true;
      Q2759: {
        const _a2760 = sp.adj8[v_a];
        for (let _i2761 = 0; _i2761 < _a2760.length; _i2761++) {
          const v_b = _a2760[_i2761];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2762 = (g[v_b] || -1);
          if (!((_h2762 !== 1))) {
            _q2758 = false;
            break Q2759;
          }
        }
      }
      if (!(_q2758)) {
        _q2753 = false;
        break Q2754;
      }
    }
  }
  if (!(_q2753)) return false;
  let _q2763 = true;
  Q2764: {
    const _a2765 = sp.cells;
    for (let _i2766 = 0; _i2766 < _a2765.length; _i2766++) {
      const v_c = _a2765[_i2766];
      const _h2767 = (g[v_c] || -1);
      let _c2770: boolean = (_h2767 === 1);
      if (_c2770) {
        const _t2768 = step(sp, v_c, 1);
        const _h2769 = (g[_t2768] || -1);
        _c2770 = !(((_t2768 !== -1) && (_h2769 === 1)));
      }
      let _c2773: boolean = _c2770;
      if (_c2773) {
        const _t2771 = step(sp, v_c, 3);
        const _h2772 = (g[_t2771] || -1);
        _c2773 = !(((_t2771 !== -1) && (_h2772 === 1)));
      }
      if (!(_c2773)) continue;
      const _h2776 = sp.rowOf[v_c];
      const _h2784 = sp.colOf[v_c];
      let _q2774 = false;
      Q2775: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2777.length = 0;
          G2778: {
            const _a2781 = sp.lineCells[_h2776];
            for (let _i2782 = 0; _i2782 < _a2781.length; _i2782++) {
              const v_x = _a2781[_i2782];
              const _h2783 = (g[v_x] || -1);
              if (!((_h2783 === 1))) continue;
              _g2777.push(v_x);
            }
          }
          _g2785.length = 0;
          G2786: {
            const _a2789 = sp.lineCells[_h2784];
            for (let _i2790 = 0; _i2790 < _a2789.length; _i2790++) {
              const v_x = _a2789[_i2790];
              const _h2791 = (g[v_x] || -1);
              if (!((_h2791 === 1))) continue;
              _g2785.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2776], v_c, _g2777), stretch(sp.lineCells[_h2784], v_c, _g2785)).length)) {
            _q2774 = true;
            break Q2775;
          }
        }
      }
      if (!(_q2774)) {
        _q2763 = false;
        break Q2764;
      }
    }
  }
  if (!(_q2763)) return false;
  let _q2792 = true;
  Q2793: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2792 = false;
          break Q2793;
        }
      }
    }
  }
  if (!(_q2792)) return false;
  let _g2794 = 0;
  G2795: {
    const _a2796 = sp.cells;
    for (let _i2797 = 0; _i2797 < _a2796.length; _i2797++) {
      const v_c = _a2796[_i2797];
      const _h2798 = (g[v_c] || -1);
      if (!((_h2798 === 1))) continue;
      _g2794++;
    }
  }
  let _g2799 = 0;
  G2800: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2799 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2794 === _g2799))) return false;
  for (let _k2801 = 0; _k2801 < cl.n.at.length; _k2801++) {
    const _at2802 = cl.n.at[_k2801];
    const _v2803 = cl.n.v[_k2801];
    const _t2804 = sp.lineCells[_at2802];
    let _g2805 = 0;
    G2806: {
      const _a2807 = _t2804;
      for (let _i2808 = 0; _i2808 < _a2807.length; _i2808++) {
        const v_c = _a2807[_i2808];
        const _h2809 = (g[v_c] || -1);
        if (!((_h2809 === 1))) continue;
        _g2805++;
      }
    }
    if (!((_g2805 === _v2803))) return false;
  }
  for (let _k2810 = 0; _k2810 < cl.seg.at.length; _k2810++) {
    const _at2811 = cl.seg.at[_k2810];
    const _v2812 = cl.seg.v[_k2810];
    let _c2862: boolean = ((_v2812 === 2) && ((g[_at2811] || -1) === 2));
    if (!_c2862) {
      let _c2861: boolean = ((_v2812 > 2) && ((g[_at2811] || -1) === 1));
      if (_c2861) {
        let _c2819: boolean = (_v2812 === 3);
        if (!_c2819) {
          let _c2815: boolean = (_v2812 === 4);
          if (_c2815) {
            const _t2813 = step(sp, _at2811, 2);
            const _h2814 = (g[_t2813] || -1);
            _c2815 = ((_t2813 !== -1) && (_h2814 === 1));
          }
          let _c2818: boolean = _c2815;
          if (_c2818) {
            const _t2816 = step(sp, _at2811, 1);
            const _h2817 = (g[_t2816] || -1);
            _c2818 = !(((_t2816 !== -1) && (_h2817 === 1)));
          }
          _c2819 = _c2818;
        }
        let _c2826: boolean = _c2819;
        if (!_c2826) {
          let _c2822: boolean = (_v2812 === 5);
          if (_c2822) {
            const _t2820 = step(sp, _at2811, 1);
            const _h2821 = (g[_t2820] || -1);
            _c2822 = ((_t2820 !== -1) && (_h2821 === 1));
          }
          let _c2825: boolean = _c2822;
          if (_c2825) {
            const _t2823 = step(sp, _at2811, 2);
            const _h2824 = (g[_t2823] || -1);
            _c2825 = !(((_t2823 !== -1) && (_h2824 === 1)));
          }
          _c2826 = _c2825;
        }
        let _c2839: boolean = _c2826;
        if (!_c2839) {
          let _c2838: boolean = (_v2812 === 6);
          if (_c2838) {
            const _t2827 = step(sp, _at2811, 1);
            const _h2828 = (g[_t2827] || -1);
            let _c2831: boolean = ((_t2827 !== -1) && (_h2828 === 1));
            if (_c2831) {
              const _t2829 = step(sp, _at2811, 2);
              const _h2830 = (g[_t2829] || -1);
              _c2831 = ((_t2829 !== -1) && (_h2830 === 1));
            }
            let _c2837: boolean = _c2831;
            if (!_c2837) {
              const _t2832 = step(sp, _at2811, 3);
              const _h2833 = (g[_t2832] || -1);
              let _c2836: boolean = ((_t2832 !== -1) && (_h2833 === 1));
              if (_c2836) {
                const _t2834 = step(sp, _at2811, 4);
                const _h2835 = (g[_t2834] || -1);
                _c2836 = ((_t2834 !== -1) && (_h2835 === 1));
              }
              _c2837 = _c2836;
            }
            _c2838 = _c2837;
          }
          _c2839 = _c2838;
        }
        let _c2846: boolean = _c2839;
        if (!_c2846) {
          let _c2842: boolean = (_v2812 === 7);
          if (_c2842) {
            const _t2840 = step(sp, _at2811, 4);
            const _h2841 = (g[_t2840] || -1);
            _c2842 = ((_t2840 !== -1) && (_h2841 === 1));
          }
          let _c2845: boolean = _c2842;
          if (_c2845) {
            const _t2843 = step(sp, _at2811, 3);
            const _h2844 = (g[_t2843] || -1);
            _c2845 = !(((_t2843 !== -1) && (_h2844 === 1)));
          }
          _c2846 = _c2845;
        }
        let _c2853: boolean = _c2846;
        if (!_c2853) {
          let _c2849: boolean = (_v2812 === 8);
          if (_c2849) {
            const _t2847 = step(sp, _at2811, 3);
            const _h2848 = (g[_t2847] || -1);
            _c2849 = ((_t2847 !== -1) && (_h2848 === 1));
          }
          let _c2852: boolean = _c2849;
          if (_c2852) {
            const _t2850 = step(sp, _at2811, 4);
            const _h2851 = (g[_t2850] || -1);
            _c2852 = !(((_t2850 !== -1) && (_h2851 === 1)));
          }
          _c2853 = _c2852;
        }
        let _c2860: boolean = _c2853;
        if (!_c2860) {
          let _c2859: boolean = (_v2812 === 9);
          if (_c2859) {
            let _q2854 = false;
            Q2855: {
              const _a2856 = sp.adj4[_at2811];
              for (let _i2857 = 0; _i2857 < _a2856.length; _i2857++) {
                const v_x = _a2856[_i2857];
                const _h2858 = (g[v_x] || -1);
                if ((_h2858 === 1)) {
                  _q2854 = true;
                  break Q2855;
                }
              }
            }
            _c2859 = !(_q2854);
          }
          _c2860 = _c2859;
        }
        _c2861 = _c2860;
      }
      _c2862 = _c2861;
    }
    if (!(_c2862)) return false;
  }
  for (let _k2863 = 0; _k2863 < cl.fleet.n; _k2863++) {
    let _g2866 = 0;
    G2867: {
      const _a2868 = sp.cells;
      for (let _i2869 = 0; _i2869 < _a2868.length; _i2869++) {
        const v_c = _a2868[_i2869];
        const _h2870 = (g[v_c] || -1);
        let _c2873: boolean = (_h2870 === 1);
        if (_c2873) {
          const _t2871 = step(sp, v_c, 1);
          const _h2872 = (g[_t2871] || -1);
          _c2873 = !(((_t2871 !== -1) && (_h2872 === 1)));
        }
        let _c2876: boolean = _c2873;
        if (_c2876) {
          const _t2874 = step(sp, v_c, 3);
          const _h2875 = (g[_t2874] || -1);
          _c2876 = !(((_t2874 !== -1) && (_h2875 === 1)));
        }
        let _c2893: boolean = _c2876;
        if (_c2893) {
          const _t2877 = sp.rowOf[v_c];
          _g2878.length = 0;
          G2879: {
            const _a2882 = sp.lineCells[_t2877];
            for (let _i2883 = 0; _i2883 < _a2882.length; _i2883++) {
              const v_x = _a2882[_i2883];
              const _h2884 = (g[v_x] || -1);
              if (!((_h2884 === 1))) continue;
              _g2878.push(v_x);
            }
          }
          const _t2885 = sp.colOf[v_c];
          _g2886.length = 0;
          G2887: {
            const _a2890 = sp.lineCells[_t2885];
            for (let _i2891 = 0; _i2891 < _a2890.length; _i2891++) {
              const v_x = _a2890[_i2891];
              const _h2892 = (g[v_x] || -1);
              if (!((_h2892 === 1))) continue;
              _g2886.push(v_x);
            }
          }
          _c2893 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2878), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2886)).length === cl.fleet.length[_k2863]);
        }
        if (!(_c2893)) continue;
        _g2866++;
      }
    }
    if (!((_g2866 === cl.fleet.boats[_k2863]))) return false;
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
  const _a377 = cellsValued(b, sp.cells, 1);
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
        const _h527 = (v_m > 1);
        L522: {
          const v_b = ((_k521[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L522;
          facts.length = 0;
          changed = false;
          let _q523 = true;
          Q524: {
            const _a525 = v_R;
            for (let _i526 = 0; _i526 < _a525.length; _i526++) {
              const v_x = _a525[_i526];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c533: boolean = true;
              if (_c533) {
                let _c532: boolean = _h527;
                if (!_c532) {
                  let _q528 = true;
                  Q529: {
                    const _a530 = sp.adj4[v_x];
                    for (let _i531 = 0; _i531 < _a530.length; _i531++) {
                      const v_y = _a530[_i531];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q528 = false;
                        break Q529;
                      }
                    }
                  }
                  _c532 = _q528;
                }
                _c533 = _c532;
              }
              if (!(_c533)) {
                _q523 = false;
                break Q524;
              }
            }
          }
          if (!(_q523)) return -1;
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
  const _g565: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a557 = cluesValued(cl.seg, 6);
  for (let _i558 = 0; _i558 < _a557.length; _i558++) {
    const v_c = _a557[_i558];
    const _h559 = clueAt(cl.seg, v_c);
    if (!((_h559 === 6))) continue;
    const _t560 = sp.rowOf[v_c];
    const _t561 = sp.colOf[v_c];
    for (let _i562 = 0; _i562 < 2; _i562++) {
      const v_L = _i562 === 0 ? _t560 : _t561;
      if (_i562 === 1 && (v_L === _t560)) continue;
      const _h563 = clueAt(cl.n, v_L);
      L564: {
        const v_v = _h563;
        if (!((v_v >= 0))) break L564;
        _g565.length = 0;
        G566: {
          const _a569 = sp.adj4[v_c];
          for (let _i570 = 0; _i570 < _a569.length; _i570++) {
            const v_x = _a569[_i570];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g565.push(v_x);
          }
        }
        L571: {
          const v_S = _g565;
          const _h572 = v_S.length;
          let _c582: boolean = (_h572 === 2);
          if (_c582) {
            const _t573 = sp.lineCells[v_L];
            let _g574 = 0;
            G575: {
              const _a576 = _t573;
              for (let _i577 = 0; _i577 < _a576.length; _i577++) {
                const v_c = _a576[_i577];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g574++;
              }
            }
            let _g578 = 0;
            G579: {
              const _a580 = v_S;
              for (let _i581 = 0; _i581 < _a580.length; _i581++) {
                const v_x = _a580[_i581];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g578++;
              }
            }
            _c582 = ((v_v - _g574) < _g578);
          }
          if (!(_c582)) break L571;
          facts.length = 0;
          changed = false;
          let _q583 = true;
          Q584: {
            const _a585 = v_S;
            for (let _i586 = 0; _i586 < _a585.length; _i586++) {
              const v_x = _a585[_i586];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q583 = false;
                break Q584;
              }
            }
          }
          if (!(_q583)) return -1;
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
  const _g621: number[] = [];
  const _g628: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  let _g611 = -1;
  G612: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t613 = cl.fleet.length[v_k];
      if (_g611 === -1 || _t613 > _g611) _g611 = _t613;
    }
  }
  const v_M = _g611;
  const _a614 = sp.cells;
  for (let _i615 = 0; _i615 < _a614.length; _i615++) {
    const v_c = _a614[_i615];
    let _c634: boolean = !((b.grid[v_c] !== 0));
    if (_c634) {
      let _g616 = 0;
      G617: {
        const _a618 = sp.adj4[v_c];
        for (let _i619 = 0; _i619 < _a618.length; _i619++) {
          const v_a = _a618[_i619];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t620 = sp.rowOf[v_a];
          _g621.length = 0;
          G622: {
            const _a625 = sp.lineCells[_t620];
            for (let _i626 = 0; _i626 < _a625.length; _i626++) {
              const v_x = _a625[_i626];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g621.push(v_x);
            }
          }
          const _t627 = sp.colOf[v_a];
          _g628.length = 0;
          G629: {
            const _a632 = sp.lineCells[_t627];
            for (let _i633 = 0; _i633 < _a632.length; _i633++) {
              const v_x = _a632[_i633];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g628.push(v_x);
            }
          }
          _g616 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g621), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g628)).length;
        }
      }
      _c634 = ((1 + _g616) > v_M);
    }
    if (!(_c634)) continue;
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
  const _g657: number[] = [];
  const _g665: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a653 = sp.lines;
  for (let _i654 = 0; _i654 < _a653.length; _i654++) {
    const v_L = _a653[_i654];
    const _a655 = sp.lineCells[v_L];
    for (let _i656 = 0; _i656 < _a655.length; _i656++) {
      const v_c = _a655[_i656];
      _g657.length = 0;
      G658: {
        const _a661 = sp.lineCells[v_L];
        for (let _i662 = 0; _i662 < _a661.length; _i662++) {
          const v_x = _a661[_i662];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g657.push(v_x);
        }
      }
      L663: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g657);
        const _h664 = v_R.length;
        if (!(((_h664 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L663;
        _g665.length = 0;
        G666: {
          const _a669 = v_R;
          for (let _i670 = 0; _i670 < _a669.length; _i670++) {
            const v_c = _a669[_i670];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g665.push(v_c);
          }
        }
        L671: {
          const v_O = _g665;
          const _h672 = v_O.length;
          if (!(((_h672 === 1) && full(b, sp, cl, _h664)))) break L671;
          facts.length = 0;
          changed = false;
          let _q673 = true;
          Q674: {
            const _a675 = v_O;
            for (let _i676 = 0; _i676 < _a675.length; _i676++) {
              const v_x = _a675[_i676];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q673 = false;
                break Q674;
              }
            }
          }
          if (!(_q673)) return -1;
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
  const _g735: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a731 = sp.lines;
  for (let _i732 = 0; _i732 < _a731.length; _i732++) {
    const v_L = _a731[_i732];
    const _h733 = clueAt(cl.n, v_L);
    if (!((_h733 < 0))) continue;
    const _t734 = sp.lineCells[v_L];
    _g735.length = 0;
    G736: {
      const _a739 = _t734;
      for (let _i740 = 0; _i740 < _a739.length; _i740++) {
        const v_c = _a739[_i740];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g735.push(v_c);
      }
    }
    L741: {
      const v_O = _g735;
      const _h742 = v_O.length;
      if (!((_h742 > 0))) break L741;
      L743: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L743;
        const _t744 = sp.lineCells[v_L];
        let _g745 = 0;
        G746: {
          const _a747 = _t744;
          for (let _i748 = 0; _i748 < _a747.length; _i748++) {
            const v_c = _a747[_i748];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g745++;
          }
        }
        const v_left = (v_v - _g745);
        facts.length = 0;
        changed = false;
        let _c754: boolean = ((v_left >= 0) && (v_left <= _h742));
        if (_c754) {
          let _c753: boolean = !((v_left === 0));
          if (!_c753) {
            let _q749 = true;
            Q750: {
              const _a751 = v_O;
              for (let _i752 = 0; _i752 < _a751.length; _i752++) {
                const v_c = _a751[_i752];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q749 = false;
                  break Q750;
                }
              }
            }
            _c753 = _q749;
          }
          _c754 = _c753;
        }
        let _c760: boolean = _c754;
        if (_c760) {
          let _c759: boolean = !((v_left === _h742));
          if (!_c759) {
            let _q755 = true;
            Q756: {
              const _a757 = v_O;
              for (let _i758 = 0; _i758 < _a757.length; _i758++) {
                const v_c = _a757[_i758];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
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
        if (!(_c760)) return -1;
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
  const _g858: number[] = [];
  const _g881: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  const _k890 = boatsOfKept.board(cl);
  let _g842 = -1;
  G843: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t844 = cl.fleet.length[v_k];
      if (_g842 === -1 || _t844 > _g842) _g842 = _t844;
    }
  }
  L845: {
    const v_m = _g842;
    if (!((v_m > 0))) break L845;
    const _h880 = (2 * v_m);
    const _a846 = sp.lines;
    for (let _i847 = 0; _i847 < _a846.length; _i847++) {
      const v_L = _a846[_i847];
      const _h870 = clueAt(cl.n, v_L);
      const _h871 = (_h870 < 0);
      const _a848 = sp.lineCells[v_L];
      for (let _i849 = 0; _i849 < _a848.length; _i849++) {
        const v_c = _a848[_i849];
        const _h854 = (v_c % sp.w);
        const _h855 = ((v_c / sp.w) | 0);
        const _h856 = (_h854 + _h855);
        let _c857: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c857) {
          let _q850 = false;
          Q851: {
            const _a852 = sp.adj4[v_c];
            for (let _i853 = 0; _i853 < _a852.length; _i853++) {
              const v_p = _a852[_i853];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h856)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q850 = true;
                break Q851;
              }
            }
          }
          _c857 = !(_q850);
        }
        if (!(_c857)) continue;
        _g858.length = 0;
        G859: {
          const _a862 = sp.lineCells[v_L];
          for (let _i863 = 0; _i863 < _a862.length; _i863++) {
            const v_x = _a862[_i863];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g858.push(v_x);
          }
        }
        L864: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g858);
          const _h869 = v_R.length;
          let _g865 = 0;
          G866: {
            const _a867 = v_R;
            for (let _i868 = 0; _i868 < _a867.length; _i868++) {
              const v_c = _a867[_i868];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g865++;
            }
          }
          let _c879: boolean = (_g865 < _h869);
          if (_c879) {
            let _c878: boolean = ((_g865 < _h869) && (_h869 >= v_m));
            if (_c878) {
              let _c877: boolean = _h871;
              if (!_c877) {
                const _t872 = sp.lineCells[v_L];
                let _g873 = 0;
                G874: {
                  const _a875 = _t872;
                  for (let _i876 = 0; _i876 < _a875.length; _i876++) {
                    const v_c = _a875[_i876];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g873++;
                  }
                }
                _c877 = (((_h870 - _g873) + _g865) >= v_m);
              }
              _c878 = _c877;
            }
            _c879 = _c878;
          }
          if (!((_c879 && (_h869 < _h880)))) break L864;
          const _h887 = (_h869 - v_m);
          _g881.length = 0;
          G882: {
            const _a885 = v_R;
            for (let _i886 = 0; _i886 < _a885.length; _i886++) {
              const v_x = _a885[_i886];
              if (!(((_i886 >= _h887) && (_i886 < v_m)))) continue;
              _g881.push(v_x);
            }
          }
          L888: {
            const v_C = _g881;
            const _h889 = v_C.length;
            if (!((_h889 > 0))) break L888;
            const _h896 = (_h889 > 1);
            const v_b = ((_k890[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
            L891: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L891;
              facts.length = 0;
              changed = false;
              let _q892 = true;
              Q893: {
                const _a894 = v_C;
                for (let _i895 = 0; _i895 < _a894.length; _i895++) {
                  const v_x = _a894[_i895];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c902: boolean = true;
                  if (_c902) {
                    let _c901: boolean = _h896;
                    if (!_c901) {
                      let _q897 = true;
                      Q898: {
                        const _a899 = sp.adj4[v_x];
                        for (let _i900 = 0; _i900 < _a899.length; _i900++) {
                          const v_y = _a899[_i900];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q897 = false;
                            break Q898;
                          }
                        }
                      }
                      _c901 = _q897;
                    }
                    _c902 = _c901;
                  }
                  if (!(_c902)) {
                    _q892 = false;
                    break Q893;
                  }
                }
              }
              if (!(_q892)) return -1;
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
  const _a933 = sp.lines;
  for (let _i934 = 0; _i934 < _a933.length; _i934++) {
    const v_L = _a933[_i934];
    L935: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      if (!((v_v >= 0))) break L935;
      let _g936 = 0;
      G937: {
        const _a938 = sp.lineCells[v_L];
        for (let _i939 = 0; _i939 < _a938.length; _i939++) {
          const v_c = _a938[_i939];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g936++;
        }
      }
      L940: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g936);
        if (!(((v_t === 1) || (v_t === 2)))) break L940;
        const _a941 = sp.lineCells[v_L];
        for (let _i942 = 0; _i942 < _a941.length; _i942++) {
          const v_k = _a941[_i942];
          const v_K = crossing(sp, v_L, v_k);
          const v_j = numMarked(b, sp, cl, cands, v_K);
          const _h950 = (v_j >= 0);
          let _g943 = 0;
          G944: {
            const _a945 = sp.adj4[v_k];
            for (let _i946 = 0; _i946 < _a945.length; _i946++) {
              const v_x = _a945[_i946];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g943++;
            }
          }
          let _g947 = 0;
          G948: {
            for (let _i949 = 0; _i949 < 1; _i949++) {
              const v_x = v_k;
              let _c956: boolean = (!((b.grid[v_x] !== 0)) && _h950);
              if (_c956) {
                const _t951 = sp.lineCells[v_K];
                let _g952 = 0;
                G953: {
                  const _a954 = _t951;
                  for (let _i955 = 0; _i955 < _a954.length; _i955++) {
                    const v_c = _a954[_i955];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g952++;
                  }
                }
                _c956 = ((v_j - _g952) === 1);
              }
              if (!(_c956)) continue;
              _g947++;
            }
          }
          L957: {
            const v_s = (_g943 + _g947);
            if (!((v_s > v_t))) break L957;
            facts.length = 0;
            changed = false;
            let _q958 = true;
            Q959: {
              const _a960 = sp.adj4[v_k];
              for (let _i961 = 0; _i961 < _a960.length; _i961++) {
                const v_y = _a960[_i961];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q958 = false;
                  break Q959;
                }
              }
            }
            if (!(_q958)) return -1;
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
const _st1312 = stamps();
const _st1334 = stamps();
const _st1470 = stamps();
const _st1477 = stamps();
const _st1519 = stamps();
const _st1553 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g1277: number[] = [];
  const _g1283: number[] = [];
  const _g1293: number[] = [];
  const _g1306: number[] = [];
  const _g1327: number[] = [];
  const _g1375: number[] = [];
  const _g1384: number[] = [];
  const _g1471: number[] = [];
  const _g1489: number[] = [];
  const _g1499: number[] = [];
  const _g1513: number[] = [];
  const _g1533: number[] = [];
  const _g1547: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  const _k1568 = boatsOfKept.board(cl);
  if (lastWaterCands.length < sp.cells.length) lastWaterCands = new Int32Array(sp.cells.length);
  const cands = lastWaterCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1256 = -1;
  G1257: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1258 = cl.fleet.length[v_k];
      if (_g1256 === -1 || _t1258 > _g1256) _g1256 = _t1258;
    }
  }
  const v_T = _g1256;
  const _a1259 = sp.lines;
  for (let _i1260 = 0; _i1260 < _a1259.length; _i1260++) {
    const v_L = _a1259[_i1260];
    let _q1261 = false;
    Q1262: {
      const _a1263 = sp.lineCells[v_L];
      for (let _i1264 = 0; _i1264 < _a1263.length; _i1264++) {
        const v_c = _a1263[_i1264];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q1261 = true;
          break Q1262;
        }
      }
    }
    if (!(_q1261)) continue;
    L1265: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1270: boolean = (v_v >= 0);
      if (_c1270) {
        let _g1266 = 0;
        G1267: {
          const _a1268 = sp.lineCells[v_L];
          for (let _i1269 = 0; _i1269 < _a1268.length; _i1269++) {
            const v_c = _a1268[_i1269];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1266++;
          }
        }
        _c1270 = (((sp.lineCells[v_L].length - v_v) - _g1266) === 1);
      }
      if (!(_c1270)) break L1265;
      const _a1271 = sp.lineCells[v_L];
      for (let _i1272 = 0; _i1272 < _a1271.length; _i1272++) {
        const v_c = _a1271[_i1272];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1301 = (v_j >= 0);
        let _g1273 = 0;
        G1274: {
          const _a1275 = sp.lineCells[v_K];
          for (let _i1276 = 0; _i1276 < _a1275.length; _i1276++) {
            const v_c = _a1275[_i1276];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1273++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1273);
        const _h1302 = (v_t === 1);
        const _h1303 = (_h1301 && _h1302);
        _g1277.length = 0;
        G1278: {
          const _a1281 = sp.lineCells[v_L];
          for (let _i1282 = 0; _i1282 < _a1281.length; _i1282++) {
            const v_x = _a1281[_i1282];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1277.push(v_x);
          }
        }
        _g1283.length = 0;
        G1284: {
          _g1293.length = 0;
          G1294: {
            const _a1297 = sp.lineCells[v_K];
            for (let _i1298 = 0; _i1298 < _a1297.length; _i1298++) {
              const v_x = _a1297[_i1298];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1293.push(v_x);
            }
          }
          const _a1299 = _g1293;
          for (let _i1300 = 0; _i1300 < _a1299.length; _i1300++) {
            const v_x = _a1299[_i1300];
            if (!(_h1303)) continue;
            _g1283.push(v_x);
          }
        }
        L1304: {
          const v_H = union(_g1277, _g1283);
          const _t1305 = setOf(v_c);
          _g1306.length = 0;
          _st1312.pass++;
          G1307: {
            const _a1313 = v_H;
            for (let _i1314 = 0; _i1314 < _a1313.length; _i1314++) {
              const v_a = _a1313[_i1314];
              const _a1315 = sp.adj8[v_a];
              for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
                const v_d = _a1315[_i1316];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t1317 = v_d;
                if (_g1306.length < 16) { if (!_g1306.includes(_t1317)) _g1306.push(_t1317); } else addOnce(_g1306, _st1312, _t1317);
              }
            }
          }
          const _t1318 = union(_t1305, _g1306);
          const _h1478 = union(v_H, _t1318);
          let _q1319 = false;
          Q1320: {
            const _a1321 = v_H;
            for (let _i1322 = 0; _i1322 < _a1321.length; _i1322++) {
              const v_a = _a1321[_i1322];
              const _a1323 = sp.adj8[v_a];
              for (let _i1324 = 0; _i1324 < _a1323.length; _i1324++) {
                const v_b = _a1323[_i1324];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1319 = true;
                  break Q1320;
                }
              }
            }
          }
          let _c1353: boolean = _q1319;
          if (!_c1353) {
            let _q1325 = false;
            Q1326: {
              _g1327.length = 0;
              _st1334.pass++;
              G1328: {
                const _a1335 = union(v_H, _t1318);
                for (let _i1336 = 0; _i1336 < _a1335.length; _i1336++) {
                  const v_a = _a1335[_i1336];
                  const _t1337 = sp.rowOf[v_a];
                  const _t1338 = sp.colOf[v_a];
                  for (let _i1339 = 0; _i1339 < 2; _i1339++) {
                    const v_M = _i1339 === 0 ? _t1337 : _t1338;
                    if (_i1339 === 1 && (v_M === _t1337)) continue;
                    const _t1340 = v_M;
                    if (_g1327.length < 16) { if (!_g1327.includes(_t1340)) _g1327.push(_t1340); } else addOnce(_g1327, _st1334, _t1340);
                  }
                }
              }
              const _a1341 = _g1327;
              for (let _i1342 = 0; _i1342 < _a1341.length; _i1342++) {
                const v_L = _a1341[_i1342];
                L1343: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1343;
                  let _g1344 = 0;
                  G1345: {
                    const _a1346 = sp.lineCells[v_L];
                    for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
                      const v_x = _a1346[_i1347];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1344++;
                    }
                  }
                  let _c1352: boolean = (_g1344 > v_v);
                  if (!_c1352) {
                    let _g1348 = 0;
                    G1349: {
                      const _a1350 = sp.lineCells[v_L];
                      for (let _i1351 = 0; _i1351 < _a1350.length; _i1351++) {
                        const v_x = _a1350[_i1351];
                        if (!((!(_t1318.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1348++;
                      }
                    }
                    _c1352 = (_g1348 < v_v);
                  }
                  if (_c1352) {
                    _q1325 = true;
                    break Q1326;
                  }
                }
              }
            }
            _c1353 = _q1325;
          }
          let _c1360: boolean = _c1353;
          if (!_c1360) {
            let _g1354 = 0;
            G1355: {
              const _a1356 = sp.cells;
              for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
                const v_x = _a1356[_i1357];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1354++;
              }
            }
            let _g1358 = 0;
            G1359: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1358 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1360 = (_g1354 > _g1358);
          }
          let _c1367: boolean = _c1360;
          if (!_c1367) {
            let _g1361 = 0;
            G1362: {
              const _a1363 = sp.cells;
              for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
                const v_x = _a1363[_i1364];
                if (!((!(_t1318.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1361++;
              }
            }
            let _g1365 = 0;
            G1366: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1365 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1367 = (_g1361 < _g1365);
          }
          let _c1381: boolean = _c1367;
          if (!_c1381) {
            let _q1368 = false;
            Q1369: {
              const _a1370 = v_H;
              for (let _i1371 = 0; _i1371 < _a1370.length; _i1371++) {
                const v_a = _a1370[_i1371];
                const _t1372 = sp.rowOf[v_a];
                const _t1373 = sp.colOf[v_a];
                for (let _i1374 = 0; _i1374 < 2; _i1374++) {
                  const v_L = _i1374 === 0 ? _t1372 : _t1373;
                  if (_i1374 === 1 && (v_L === _t1372)) continue;
                  _g1375.length = 0;
                  G1376: {
                    const _a1379 = sp.lineCells[v_L];
                    for (let _i1380 = 0; _i1380 < _a1379.length; _i1380++) {
                      const v_x = _a1379[_i1380];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1375.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1375).length > v_T)) {
                    _q1368 = true;
                    break Q1369;
                  }
                }
              }
            }
            _c1381 = _q1368;
          }
          let _c1569: boolean = _c1381;
          if (!_c1569) {
            let _q1382 = false;
            Q1383: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1384.length = 0;
                _st1470.pass++;
                G1385: {
                  _g1471.length = 0;
                  _st1477.pass++;
                  G1472: {
                    const _a1479 = _h1478;
                    for (let _i1480 = 0; _i1480 < _a1479.length; _i1480++) {
                      const v_x = _a1479[_i1480];
                      const _a1481 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1482 = 0; _i1482 < _a1481.length; _i1482++) {
                        const v_y = _a1481[_i1482];
                        const _t1483 = v_y;
                        if (_g1471.length < 16) { if (!_g1471.includes(_t1483)) _g1471.push(_t1483); } else addOnce(_g1471, _st1477, _t1483);
                      }
                    }
                  }
                  const _a1484 = _g1471;
                  for (let _i1485 = 0; _i1485 < _a1484.length; _i1485++) {
                    const v_a = _a1484[_i1485];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t1486 = sp.rowOf[v_a];
                    const _t1487 = sp.colOf[v_a];
                    for (let _i1488 = 0; _i1488 < 2; _i1488++) {
                      const v_L = _i1488 === 0 ? _t1486 : _t1487;
                      if (_i1488 === 1 && (v_L === _t1486)) continue;
                      _g1489.length = 0;
                      G1490: {
                        const _a1493 = sp.lineCells[v_L];
                        for (let _i1494 = 0; _i1494 < _a1493.length; _i1494++) {
                          const v_x = _a1493[_i1494];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1489.push(v_x);
                        }
                      }
                      L1495: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1489);
                        const _h1496 = v_G.length;
                        const _h1527 = (_h1496 === 1);
                        let _c1530: boolean = (_h1496 === v_m);
                        if (_c1530) {
                          let _q1497 = true;
                          Q1498: {
                            _g1499.length = 0;
                            G1500: {
                              _g1513.length = 0;
                              _st1519.pass++;
                              G1514: {
                                const _a1520 = v_G;
                                for (let _i1521 = 0; _i1521 < _a1520.length; _i1521++) {
                                  const v_g = _a1520[_i1521];
                                  const _a1522 = sp.adj4[v_g];
                                  for (let _i1523 = 0; _i1523 < _a1522.length; _i1523++) {
                                    const v_z = _a1522[_i1523];
                                    const _t1524 = v_z;
                                    if (_g1513.length < 16) { if (!_g1513.includes(_t1524)) _g1513.push(_t1524); } else addOnce(_g1513, _st1519, _t1524);
                                  }
                                }
                              }
                              const _a1525 = _g1513;
                              for (let _i1526 = 0; _i1526 < _a1525.length; _i1526++) {
                                const v_y = _a1525[_i1526];
                                if (!((!(v_G.includes(v_y)) && (_h1527 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1499.push(v_y);
                              }
                            }
                            const _a1528 = _g1499;
                            for (let _i1529 = 0; _i1529 < _a1528.length; _i1529++) {
                              const v_y = _a1528[_i1529];
                              if (!(((_t1318.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1497 = false;
                                break Q1498;
                              }
                            }
                          }
                          _c1530 = _q1497;
                        }
                        let _c1563: boolean = _c1530;
                        if (_c1563) {
                          let _q1531 = false;
                          Q1532: {
                            _g1533.length = 0;
                            G1534: {
                              _g1547.length = 0;
                              _st1553.pass++;
                              G1548: {
                                const _a1554 = v_G;
                                for (let _i1555 = 0; _i1555 < _a1554.length; _i1555++) {
                                  const v_g = _a1554[_i1555];
                                  const _a1556 = sp.adj4[v_g];
                                  for (let _i1557 = 0; _i1557 < _a1556.length; _i1557++) {
                                    const v_z = _a1556[_i1557];
                                    const _t1558 = v_z;
                                    if (_g1547.length < 16) { if (!_g1547.includes(_t1558)) _g1547.push(_t1558); } else addOnce(_g1547, _st1553, _t1558);
                                  }
                                }
                              }
                              const _a1559 = _g1547;
                              for (let _i1560 = 0; _i1560 < _a1559.length; _i1560++) {
                                const v_y = _a1559[_i1560];
                                if (!((!(v_G.includes(v_y)) && (_h1527 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1533.push(v_y);
                              }
                            }
                            const _a1561 = union(v_G, _g1533);
                            for (let _i1562 = 0; _i1562 < _a1561.length; _i1562++) {
                              const v_x = _a1561[_i1562];
                              if (((v_H.includes(v_x)) || (_t1318.includes(v_x)))) {
                                _q1531 = true;
                                break Q1532;
                              }
                            }
                          }
                          _c1563 = _q1531;
                        }
                        if (!(_c1563)) break L1495;
                        const _t1564 = (v_G[0] ?? -1);
                        const _t1565 = _t1564;
                        if (_g1384.length < 16) { if (!_g1384.includes(_t1565)) _g1384.push(_t1565); } else addOnce(_g1384, _st1470, _t1565);
                      }
                    }
                  }
                }
                L1566: {
                  const v_C = _g1384;
                  const _h1567 = v_C.length;
                  if (!((_h1567 > 0))) break L1566;
                  if ((_h1567 > ((_k1568[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q1382 = true;
                    break Q1383;
                  }
                }
              }
            }
            _c1569 = _q1382;
          }
          if (!(_c1569)) break L1304;
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
const _st1924 = stamps();
const _st1946 = stamps();
const _st2082 = stamps();
const _st2089 = stamps();
const _st2131 = stamps();
const _st2165 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g1889: number[] = [];
  const _g1895: number[] = [];
  const _g1905: number[] = [];
  const _g1918: number[] = [];
  const _g1939: number[] = [];
  const _g1987: number[] = [];
  const _g1996: number[] = [];
  const _g2083: number[] = [];
  const _g2101: number[] = [];
  const _g2111: number[] = [];
  const _g2125: number[] = [];
  const _g2145: number[] = [];
  const _g2159: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  const _k2180 = boatsOfKept.board(cl);
  if (lastShipCands.length < sp.cells.length) lastShipCands = new Int32Array(sp.cells.length);
  const cands = lastShipCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1866 = -1;
  G1867: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1868 = cl.fleet.length[v_k];
      if (_g1866 === -1 || _t1868 > _g1866) _g1866 = _t1868;
    }
  }
  const v_T = _g1866;
  const _a1869 = sp.lines;
  for (let _i1870 = 0; _i1870 < _a1869.length; _i1870++) {
    const v_L = _a1869[_i1870];
    let _q1871 = false;
    Q1872: {
      const _a1873 = sp.lineCells[v_L];
      for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
        const v_c = _a1873[_i1874];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q1871 = true;
          break Q1872;
        }
      }
    }
    if (!(_q1871)) continue;
    L1875: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1881: boolean = (v_v >= 0);
      if (_c1881) {
        const _t1876 = sp.lineCells[v_L];
        let _g1877 = 0;
        G1878: {
          const _a1879 = _t1876;
          for (let _i1880 = 0; _i1880 < _a1879.length; _i1880++) {
            const v_c = _a1879[_i1880];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1877++;
          }
        }
        _c1881 = ((v_v - _g1877) === 1);
      }
      if (!(_c1881)) break L1875;
      const _a1882 = sp.lineCells[v_L];
      for (let _i1883 = 0; _i1883 < _a1882.length; _i1883++) {
        const v_c = _a1882[_i1883];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1913 = (v_j >= 0);
        const _t1884 = sp.lineCells[v_K];
        let _g1885 = 0;
        G1886: {
          const _a1887 = _t1884;
          for (let _i1888 = 0; _i1888 < _a1887.length; _i1888++) {
            const v_c = _a1887[_i1888];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1885++;
          }
        }
        const v_u = (v_j - _g1885);
        const _h1914 = (v_u === 1);
        const _h1915 = (_h1913 && _h1914);
        _g1889.length = 0;
        G1890: {
          const _a1893 = sp.lineCells[v_L];
          for (let _i1894 = 0; _i1894 < _a1893.length; _i1894++) {
            const v_x = _a1893[_i1894];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1889.push(v_x);
          }
        }
        _g1895.length = 0;
        G1896: {
          _g1905.length = 0;
          G1906: {
            const _a1909 = sp.lineCells[v_K];
            for (let _i1910 = 0; _i1910 < _a1909.length; _i1910++) {
              const v_x = _a1909[_i1910];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1905.push(v_x);
            }
          }
          const _a1911 = _g1905;
          for (let _i1912 = 0; _i1912 < _a1911.length; _i1912++) {
            const v_x = _a1911[_i1912];
            if (!(_h1915)) continue;
            _g1895.push(v_x);
          }
        }
        L1916: {
          const v_W = union(_g1889, _g1895);
          const _t1917 = setOf(v_c);
          _g1918.length = 0;
          _st1924.pass++;
          G1919: {
            const _a1925 = _t1917;
            for (let _i1926 = 0; _i1926 < _a1925.length; _i1926++) {
              const v_a = _a1925[_i1926];
              const _a1927 = sp.adj8[v_a];
              for (let _i1928 = 0; _i1928 < _a1927.length; _i1928++) {
                const v_d = _a1927[_i1928];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t1929 = v_d;
                if (_g1918.length < 16) { if (!_g1918.includes(_t1929)) _g1918.push(_t1929); } else addOnce(_g1918, _st1924, _t1929);
              }
            }
          }
          const _t1930 = union(v_W, _g1918);
          const _h2090 = union(_t1917, _t1930);
          let _q1931 = false;
          Q1932: {
            const _a1933 = _t1917;
            for (let _i1934 = 0; _i1934 < _a1933.length; _i1934++) {
              const v_a = _a1933[_i1934];
              const _a1935 = sp.adj8[v_a];
              for (let _i1936 = 0; _i1936 < _a1935.length; _i1936++) {
                const v_b = _a1935[_i1936];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1917.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1931 = true;
                  break Q1932;
                }
              }
            }
          }
          let _c1965: boolean = _q1931;
          if (!_c1965) {
            let _q1937 = false;
            Q1938: {
              _g1939.length = 0;
              _st1946.pass++;
              G1940: {
                const _a1947 = union(_t1917, _t1930);
                for (let _i1948 = 0; _i1948 < _a1947.length; _i1948++) {
                  const v_a = _a1947[_i1948];
                  const _t1949 = sp.rowOf[v_a];
                  const _t1950 = sp.colOf[v_a];
                  for (let _i1951 = 0; _i1951 < 2; _i1951++) {
                    const v_M = _i1951 === 0 ? _t1949 : _t1950;
                    if (_i1951 === 1 && (v_M === _t1949)) continue;
                    const _t1952 = v_M;
                    if (_g1939.length < 16) { if (!_g1939.includes(_t1952)) _g1939.push(_t1952); } else addOnce(_g1939, _st1946, _t1952);
                  }
                }
              }
              const _a1953 = _g1939;
              for (let _i1954 = 0; _i1954 < _a1953.length; _i1954++) {
                const v_L = _a1953[_i1954];
                L1955: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1955;
                  let _g1956 = 0;
                  G1957: {
                    const _a1958 = sp.lineCells[v_L];
                    for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                      const v_x = _a1958[_i1959];
                      if (!(((_t1917.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1956++;
                    }
                  }
                  let _c1964: boolean = (_g1956 > v_v);
                  if (!_c1964) {
                    let _g1960 = 0;
                    G1961: {
                      const _a1962 = sp.lineCells[v_L];
                      for (let _i1963 = 0; _i1963 < _a1962.length; _i1963++) {
                        const v_x = _a1962[_i1963];
                        if (!((!(_t1930.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1960++;
                      }
                    }
                    _c1964 = (_g1960 < v_v);
                  }
                  if (_c1964) {
                    _q1937 = true;
                    break Q1938;
                  }
                }
              }
            }
            _c1965 = _q1937;
          }
          let _c1972: boolean = _c1965;
          if (!_c1972) {
            let _g1966 = 0;
            G1967: {
              const _a1968 = sp.cells;
              for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
                const v_x = _a1968[_i1969];
                if (!(((_t1917.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1966++;
              }
            }
            let _g1970 = 0;
            G1971: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1970 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1972 = (_g1966 > _g1970);
          }
          let _c1979: boolean = _c1972;
          if (!_c1979) {
            let _g1973 = 0;
            G1974: {
              const _a1975 = sp.cells;
              for (let _i1976 = 0; _i1976 < _a1975.length; _i1976++) {
                const v_x = _a1975[_i1976];
                if (!((!(_t1930.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1973++;
              }
            }
            let _g1977 = 0;
            G1978: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1977 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1979 = (_g1973 < _g1977);
          }
          let _c1993: boolean = _c1979;
          if (!_c1993) {
            let _q1980 = false;
            Q1981: {
              const _a1982 = _t1917;
              for (let _i1983 = 0; _i1983 < _a1982.length; _i1983++) {
                const v_a = _a1982[_i1983];
                const _t1984 = sp.rowOf[v_a];
                const _t1985 = sp.colOf[v_a];
                for (let _i1986 = 0; _i1986 < 2; _i1986++) {
                  const v_L = _i1986 === 0 ? _t1984 : _t1985;
                  if (_i1986 === 1 && (v_L === _t1984)) continue;
                  _g1987.length = 0;
                  G1988: {
                    const _a1991 = sp.lineCells[v_L];
                    for (let _i1992 = 0; _i1992 < _a1991.length; _i1992++) {
                      const v_x = _a1991[_i1992];
                      if (!(((_t1917.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1987.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1987).length > v_T)) {
                    _q1980 = true;
                    break Q1981;
                  }
                }
              }
            }
            _c1993 = _q1980;
          }
          let _c2181: boolean = _c1993;
          if (!_c2181) {
            let _q1994 = false;
            Q1995: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1996.length = 0;
                _st2082.pass++;
                G1997: {
                  _g2083.length = 0;
                  _st2089.pass++;
                  G2084: {
                    const _a2091 = _h2090;
                    for (let _i2092 = 0; _i2092 < _a2091.length; _i2092++) {
                      const v_x = _a2091[_i2092];
                      const _a2093 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2094 = 0; _i2094 < _a2093.length; _i2094++) {
                        const v_y = _a2093[_i2094];
                        const _t2095 = v_y;
                        if (_g2083.length < 16) { if (!_g2083.includes(_t2095)) _g2083.push(_t2095); } else addOnce(_g2083, _st2089, _t2095);
                      }
                    }
                  }
                  const _a2096 = _g2083;
                  for (let _i2097 = 0; _i2097 < _a2096.length; _i2097++) {
                    const v_a = _a2096[_i2097];
                    if (!(((_t1917.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2098 = sp.rowOf[v_a];
                    const _t2099 = sp.colOf[v_a];
                    for (let _i2100 = 0; _i2100 < 2; _i2100++) {
                      const v_L = _i2100 === 0 ? _t2098 : _t2099;
                      if (_i2100 === 1 && (v_L === _t2098)) continue;
                      _g2101.length = 0;
                      G2102: {
                        const _a2105 = sp.lineCells[v_L];
                        for (let _i2106 = 0; _i2106 < _a2105.length; _i2106++) {
                          const v_x = _a2105[_i2106];
                          if (!(((_t1917.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2101.push(v_x);
                        }
                      }
                      L2107: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2101);
                        const _h2108 = v_G.length;
                        const _h2139 = (_h2108 === 1);
                        let _c2142: boolean = (_h2108 === v_m);
                        if (_c2142) {
                          let _q2109 = true;
                          Q2110: {
                            _g2111.length = 0;
                            G2112: {
                              _g2125.length = 0;
                              _st2131.pass++;
                              G2126: {
                                const _a2132 = v_G;
                                for (let _i2133 = 0; _i2133 < _a2132.length; _i2133++) {
                                  const v_g = _a2132[_i2133];
                                  const _a2134 = sp.adj4[v_g];
                                  for (let _i2135 = 0; _i2135 < _a2134.length; _i2135++) {
                                    const v_z = _a2134[_i2135];
                                    const _t2136 = v_z;
                                    if (_g2125.length < 16) { if (!_g2125.includes(_t2136)) _g2125.push(_t2136); } else addOnce(_g2125, _st2131, _t2136);
                                  }
                                }
                              }
                              const _a2137 = _g2125;
                              for (let _i2138 = 0; _i2138 < _a2137.length; _i2138++) {
                                const v_y = _a2137[_i2138];
                                if (!((!(v_G.includes(v_y)) && (_h2139 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2111.push(v_y);
                              }
                            }
                            const _a2140 = _g2111;
                            for (let _i2141 = 0; _i2141 < _a2140.length; _i2141++) {
                              const v_y = _a2140[_i2141];
                              if (!(((_t1930.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2109 = false;
                                break Q2110;
                              }
                            }
                          }
                          _c2142 = _q2109;
                        }
                        let _c2175: boolean = _c2142;
                        if (_c2175) {
                          let _q2143 = false;
                          Q2144: {
                            _g2145.length = 0;
                            G2146: {
                              _g2159.length = 0;
                              _st2165.pass++;
                              G2160: {
                                const _a2166 = v_G;
                                for (let _i2167 = 0; _i2167 < _a2166.length; _i2167++) {
                                  const v_g = _a2166[_i2167];
                                  const _a2168 = sp.adj4[v_g];
                                  for (let _i2169 = 0; _i2169 < _a2168.length; _i2169++) {
                                    const v_z = _a2168[_i2169];
                                    const _t2170 = v_z;
                                    if (_g2159.length < 16) { if (!_g2159.includes(_t2170)) _g2159.push(_t2170); } else addOnce(_g2159, _st2165, _t2170);
                                  }
                                }
                              }
                              const _a2171 = _g2159;
                              for (let _i2172 = 0; _i2172 < _a2171.length; _i2172++) {
                                const v_y = _a2171[_i2172];
                                if (!((!(v_G.includes(v_y)) && (_h2139 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2145.push(v_y);
                              }
                            }
                            const _a2173 = union(v_G, _g2145);
                            for (let _i2174 = 0; _i2174 < _a2173.length; _i2174++) {
                              const v_x = _a2173[_i2174];
                              if (((_t1917.includes(v_x)) || (_t1930.includes(v_x)))) {
                                _q2143 = true;
                                break Q2144;
                              }
                            }
                          }
                          _c2175 = _q2143;
                        }
                        if (!(_c2175)) break L2107;
                        const _t2176 = (v_G[0] ?? -1);
                        const _t2177 = _t2176;
                        if (_g1996.length < 16) { if (!_g1996.includes(_t2177)) _g1996.push(_t2177); } else addOnce(_g1996, _st2082, _t2177);
                      }
                    }
                  }
                }
                L2178: {
                  const v_C = _g1996;
                  const _h2179 = v_C.length;
                  if (!((_h2179 > 0))) break L2178;
                  if ((_h2179 > ((_k2180[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q1994 = true;
                    break Q1995;
                  }
                }
              }
            }
            _c2181 = _q1994;
          }
          if (!(_c2181)) break L1916;
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
const _st2490 = stamps();
const _st2512 = stamps();
const _st2648 = stamps();
const _st2655 = stamps();
const _st2697 = stamps();
const _st2731 = stamps();

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g2465: number[] = [];
  const _g2478: number[] = [];
  const _g2484: number[] = [];
  const _g2505: number[] = [];
  const _g2553: number[] = [];
  const _g2562: number[] = [];
  const _g2649: number[] = [];
  const _g2667: number[] = [];
  const _g2677: number[] = [];
  const _g2691: number[] = [];
  const _g2711: number[] = [];
  const _g2725: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  const _k2746 = boatsOfKept.board(cl);
  if (centerTrialCands.length < sp.cells.length) centerTrialCands = new Int32Array(sp.cells.length);
  const cands = centerTrialCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g2456 = -1;
  G2457: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2458 = cl.fleet.length[v_k];
      if (_g2456 === -1 || _t2458 > _g2456) _g2456 = _t2458;
    }
  }
  const v_T = _g2456;
  const _a2459 = cluesValued(cl.seg, 6);
  for (let _i2460 = 0; _i2460 < _a2459.length; _i2460++) {
    const v_c = _a2459[_i2460];
    const _h2461 = clueAt(cl.seg, v_c);
    if (!((_h2461 === 6))) continue;
    const _t2462 = sp.rowOf[v_c];
    const _t2463 = sp.colOf[v_c];
    for (let _i2464 = 0; _i2464 < 2; _i2464++) {
      const v_L = _i2464 === 0 ? _t2462 : _t2463;
      if (_i2464 === 1 && (v_L === _t2462)) continue;
      _g2465.length = 0;
      G2466: {
        const _a2469 = sp.adj4[v_c];
        for (let _i2470 = 0; _i2470 < _a2469.length; _i2470++) {
          const v_x = _a2469[_i2470];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g2465.push(v_x);
        }
      }
      L2471: {
        const v_S = _g2465;
        const _h2472 = v_S.length;
        let _c2477: boolean = (_h2472 === 2);
        if (_c2477) {
          let _q2473 = false;
          Q2474: {
            const _a2475 = v_S;
            for (let _i2476 = 0; _i2476 < _a2475.length; _i2476++) {
              const v_x = _a2475[_i2476];
              if (!((b.grid[v_x] !== 0))) {
                _q2473 = true;
                break Q2474;
              }
            }
          }
          _c2477 = _q2473;
        }
        let _c2748: boolean = _c2477;
        if (_c2748) {
          _g2478.length = 0;
          G2479: {
            const _a2482 = v_S;
            for (let _i2483 = 0; _i2483 < _a2482.length; _i2483++) {
              const v_x = _a2482[_i2483];
              if (!((v_x !== v_x))) continue;
              _g2478.push(v_x);
            }
          }
          _g2484.length = 0;
          _st2490.pass++;
          G2485: {
            const _a2491 = v_S;
            for (let _i2492 = 0; _i2492 < _a2491.length; _i2492++) {
              const v_a = _a2491[_i2492];
              const _a2493 = sp.adj8[v_a];
              for (let _i2494 = 0; _i2494 < _a2493.length; _i2494++) {
                const v_d = _a2493[_i2494];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t2495 = v_d;
                if (_g2484.length < 16) { if (!_g2484.includes(_t2495)) _g2484.push(_t2495); } else addOnce(_g2484, _st2490, _t2495);
              }
            }
          }
          const _t2496 = union(_g2478, _g2484);
          const _h2656 = union(v_S, _t2496);
          let _q2497 = false;
          Q2498: {
            const _a2499 = v_S;
            for (let _i2500 = 0; _i2500 < _a2499.length; _i2500++) {
              const v_a = _a2499[_i2500];
              const _a2501 = sp.adj8[v_a];
              for (let _i2502 = 0; _i2502 < _a2501.length; _i2502++) {
                const v_b = _a2501[_i2502];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2497 = true;
                  break Q2498;
                }
              }
            }
          }
          let _c2531: boolean = _q2497;
          if (!_c2531) {
            let _q2503 = false;
            Q2504: {
              _g2505.length = 0;
              _st2512.pass++;
              G2506: {
                const _a2513 = union(v_S, _t2496);
                for (let _i2514 = 0; _i2514 < _a2513.length; _i2514++) {
                  const v_a = _a2513[_i2514];
                  const _t2515 = sp.rowOf[v_a];
                  const _t2516 = sp.colOf[v_a];
                  for (let _i2517 = 0; _i2517 < 2; _i2517++) {
                    const v_M = _i2517 === 0 ? _t2515 : _t2516;
                    if (_i2517 === 1 && (v_M === _t2515)) continue;
                    const _t2518 = v_M;
                    if (_g2505.length < 16) { if (!_g2505.includes(_t2518)) _g2505.push(_t2518); } else addOnce(_g2505, _st2512, _t2518);
                  }
                }
              }
              const _a2519 = _g2505;
              for (let _i2520 = 0; _i2520 < _a2519.length; _i2520++) {
                const v_L = _a2519[_i2520];
                L2521: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L2521;
                  let _g2522 = 0;
                  G2523: {
                    const _a2524 = sp.lineCells[v_L];
                    for (let _i2525 = 0; _i2525 < _a2524.length; _i2525++) {
                      const v_x = _a2524[_i2525];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2522++;
                    }
                  }
                  let _c2530: boolean = (_g2522 > v_v);
                  if (!_c2530) {
                    let _g2526 = 0;
                    G2527: {
                      const _a2528 = sp.lineCells[v_L];
                      for (let _i2529 = 0; _i2529 < _a2528.length; _i2529++) {
                        const v_x = _a2528[_i2529];
                        if (!((!(_t2496.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2526++;
                      }
                    }
                    _c2530 = (_g2526 < v_v);
                  }
                  if (_c2530) {
                    _q2503 = true;
                    break Q2504;
                  }
                }
              }
            }
            _c2531 = _q2503;
          }
          let _c2538: boolean = _c2531;
          if (!_c2538) {
            let _g2532 = 0;
            G2533: {
              const _a2534 = sp.cells;
              for (let _i2535 = 0; _i2535 < _a2534.length; _i2535++) {
                const v_x = _a2534[_i2535];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2532++;
              }
            }
            let _g2536 = 0;
            G2537: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2536 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2538 = (_g2532 > _g2536);
          }
          let _c2545: boolean = _c2538;
          if (!_c2545) {
            let _g2539 = 0;
            G2540: {
              const _a2541 = sp.cells;
              for (let _i2542 = 0; _i2542 < _a2541.length; _i2542++) {
                const v_x = _a2541[_i2542];
                if (!((!(_t2496.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2539++;
              }
            }
            let _g2543 = 0;
            G2544: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2543 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2545 = (_g2539 < _g2543);
          }
          let _c2559: boolean = _c2545;
          if (!_c2559) {
            let _q2546 = false;
            Q2547: {
              const _a2548 = v_S;
              for (let _i2549 = 0; _i2549 < _a2548.length; _i2549++) {
                const v_a = _a2548[_i2549];
                const _t2550 = sp.rowOf[v_a];
                const _t2551 = sp.colOf[v_a];
                for (let _i2552 = 0; _i2552 < 2; _i2552++) {
                  const v_L = _i2552 === 0 ? _t2550 : _t2551;
                  if (_i2552 === 1 && (v_L === _t2550)) continue;
                  _g2553.length = 0;
                  G2554: {
                    const _a2557 = sp.lineCells[v_L];
                    for (let _i2558 = 0; _i2558 < _a2557.length; _i2558++) {
                      const v_x = _a2557[_i2558];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2553.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2553).length > v_T)) {
                    _q2546 = true;
                    break Q2547;
                  }
                }
              }
            }
            _c2559 = _q2546;
          }
          let _c2747: boolean = _c2559;
          if (!_c2747) {
            let _q2560 = false;
            Q2561: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2562.length = 0;
                _st2648.pass++;
                G2563: {
                  _g2649.length = 0;
                  _st2655.pass++;
                  G2650: {
                    const _a2657 = _h2656;
                    for (let _i2658 = 0; _i2658 < _a2657.length; _i2658++) {
                      const v_x = _a2657[_i2658];
                      const _a2659 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2660 = 0; _i2660 < _a2659.length; _i2660++) {
                        const v_y = _a2659[_i2660];
                        const _t2661 = v_y;
                        if (_g2649.length < 16) { if (!_g2649.includes(_t2661)) _g2649.push(_t2661); } else addOnce(_g2649, _st2655, _t2661);
                      }
                    }
                  }
                  const _a2662 = _g2649;
                  for (let _i2663 = 0; _i2663 < _a2662.length; _i2663++) {
                    const v_a = _a2662[_i2663];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2664 = sp.rowOf[v_a];
                    const _t2665 = sp.colOf[v_a];
                    for (let _i2666 = 0; _i2666 < 2; _i2666++) {
                      const v_L = _i2666 === 0 ? _t2664 : _t2665;
                      if (_i2666 === 1 && (v_L === _t2664)) continue;
                      _g2667.length = 0;
                      G2668: {
                        const _a2671 = sp.lineCells[v_L];
                        for (let _i2672 = 0; _i2672 < _a2671.length; _i2672++) {
                          const v_x = _a2671[_i2672];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2667.push(v_x);
                        }
                      }
                      L2673: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2667);
                        const _h2674 = v_G.length;
                        const _h2705 = (_h2674 === 1);
                        let _c2708: boolean = (_h2674 === v_m);
                        if (_c2708) {
                          let _q2675 = true;
                          Q2676: {
                            _g2677.length = 0;
                            G2678: {
                              _g2691.length = 0;
                              _st2697.pass++;
                              G2692: {
                                const _a2698 = v_G;
                                for (let _i2699 = 0; _i2699 < _a2698.length; _i2699++) {
                                  const v_g = _a2698[_i2699];
                                  const _a2700 = sp.adj4[v_g];
                                  for (let _i2701 = 0; _i2701 < _a2700.length; _i2701++) {
                                    const v_z = _a2700[_i2701];
                                    const _t2702 = v_z;
                                    if (_g2691.length < 16) { if (!_g2691.includes(_t2702)) _g2691.push(_t2702); } else addOnce(_g2691, _st2697, _t2702);
                                  }
                                }
                              }
                              const _a2703 = _g2691;
                              for (let _i2704 = 0; _i2704 < _a2703.length; _i2704++) {
                                const v_y = _a2703[_i2704];
                                if (!((!(v_G.includes(v_y)) && (_h2705 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2677.push(v_y);
                              }
                            }
                            const _a2706 = _g2677;
                            for (let _i2707 = 0; _i2707 < _a2706.length; _i2707++) {
                              const v_y = _a2706[_i2707];
                              if (!(((_t2496.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2675 = false;
                                break Q2676;
                              }
                            }
                          }
                          _c2708 = _q2675;
                        }
                        let _c2741: boolean = _c2708;
                        if (_c2741) {
                          let _q2709 = false;
                          Q2710: {
                            _g2711.length = 0;
                            G2712: {
                              _g2725.length = 0;
                              _st2731.pass++;
                              G2726: {
                                const _a2732 = v_G;
                                for (let _i2733 = 0; _i2733 < _a2732.length; _i2733++) {
                                  const v_g = _a2732[_i2733];
                                  const _a2734 = sp.adj4[v_g];
                                  for (let _i2735 = 0; _i2735 < _a2734.length; _i2735++) {
                                    const v_z = _a2734[_i2735];
                                    const _t2736 = v_z;
                                    if (_g2725.length < 16) { if (!_g2725.includes(_t2736)) _g2725.push(_t2736); } else addOnce(_g2725, _st2731, _t2736);
                                  }
                                }
                              }
                              const _a2737 = _g2725;
                              for (let _i2738 = 0; _i2738 < _a2737.length; _i2738++) {
                                const v_y = _a2737[_i2738];
                                if (!((!(v_G.includes(v_y)) && (_h2705 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2711.push(v_y);
                              }
                            }
                            const _a2739 = union(v_G, _g2711);
                            for (let _i2740 = 0; _i2740 < _a2739.length; _i2740++) {
                              const v_x = _a2739[_i2740];
                              if (((v_S.includes(v_x)) || (_t2496.includes(v_x)))) {
                                _q2709 = true;
                                break Q2710;
                              }
                            }
                          }
                          _c2741 = _q2709;
                        }
                        if (!(_c2741)) break L2673;
                        const _t2742 = (v_G[0] ?? -1);
                        const _t2743 = _t2742;
                        if (_g2562.length < 16) { if (!_g2562.includes(_t2743)) _g2562.push(_t2743); } else addOnce(_g2562, _st2648, _t2743);
                      }
                    }
                  }
                }
                L2744: {
                  const v_C = _g2562;
                  const _h2745 = v_C.length;
                  if (!((_h2745 > 0))) break L2744;
                  if ((_h2745 > ((_k2746[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q2560 = true;
                    break Q2561;
                  }
                }
              }
            }
            _c2747 = _q2560;
          }
          _c2748 = _c2747;
        }
        if (!(_c2748)) break L2471;
        facts.length = 0;
        changed = false;
        let _q2749 = true;
        Q2750: {
          const _a2751 = v_S;
          for (let _i2752 = 0; _i2752 < _a2751.length; _i2752++) {
            const v_x = _a2751[_i2752];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2749 = false;
              break Q2750;
            }
          }
        }
        if (!(_q2749)) return -1;
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
  const _g692: number[] = [];
  G693: {
    const _a696 = sp.lines;
    for (let _i697 = 0; _i697 < _a696.length; _i697++) {
      const v_M = _a696[_i697];
      if (!(((v_M !== v_L) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)))))) continue;
      _g692.push(v_M);
    }
  }
  const _made = _g692;
  _kept[v_L] = _made;
  return _made;
}

const recKept = keptStore<number>();

/** `rec(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function rec(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = recKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  let _g687 = -1;
  G688: {
    for (let _i689 = 0; _i689 < 1; _i689++) {
      const v_K = v_L;
      let _c708: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c708) {
        let _q690 = true;
        Q691: {
          const _a698 = par(sp, v_K);
          for (let _i699 = 0; _i699 < _a698.length; _i699++) {
            const v_M = _a698[_i699];
            let _c707: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c707) {
              const _t700 = sp.lineCells[v_M];
              const _g701: number[] = [];
              G702: {
                const _a705 = _t700;
                for (let _i706 = 0; _i706 < _a705.length; _i706++) {
                  const v_c = _a705[_i706];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g701.push(v_c);
                }
              }
              _c707 = (_g701.length === 0);
            }
            if (!(_c707)) {
              _q690 = false;
              break Q691;
            }
          }
        }
        _c708 = _q690;
      }
      if (!(_c708)) continue;
      let _g709 = 0;
      G710: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g709 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g711 = 0;
      G712: {
        const _a713 = par(sp, v_K);
        for (let _i714 = 0; _i714 < _a713.length; _i714++) {
          const v_M = _a713[_i714];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g711 += clueAt(cl.n, v_M);
        }
      }
      let _g715 = 0;
      G716: {
        const _a717 = par(sp, v_K);
        for (let _i718 = 0; _i718 < _a717.length; _i718++) {
          const v_M = _a717[_i718];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t719 = sp.lineCells[v_M];
          let _g720 = 0;
          G721: {
            const _a722 = _t719;
            for (let _i723 = 0; _i723 < _a722.length; _i723++) {
              const v_c = _a722[_i723];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g720++;
            }
          }
          _g715 += _g720;
        }
      }
      const _t724 = ((_g709 - _g711) - _g715);
      if (_g687 === -1 || _t724 > _g687) _g687 = _t724;
    }
  }
  const _made = _g687;
  _kept[v_L] = _made;
  return _made;
}

const wideKept = keptStore<boolean>();

/** `wide(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function wide(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = wideKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q809 = false;
  Q810: {
    const _a811 = sp.lines;
    for (let _i812 = 0; _i812 < _a811.length; _i812++) {
      const v_K = _a811[_i812];
      const _a813 = sp.lineCells[v_K];
      for (let _i814 = 0; _i814 < _a813.length; _i814++) {
        const v_d = _a813[_i814];
        let _c819: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c819) {
          let _q815 = false;
          Q816: {
            const _a817 = sp.adj4[v_d];
            for (let _i818 = 0; _i818 < _a817.length; _i818++) {
              const v_p = _a817[_i818];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q815 = true;
                break Q816;
              }
            }
          }
          _c819 = !(_q815);
        }
        if (!(_c819)) continue;
        const _g820: number[] = [];
        G821: {
          const _a824 = sp.lineCells[v_K];
          for (let _i825 = 0; _i825 < _a824.length; _i825++) {
            const v_x = _a824[_i825];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g820.push(v_x);
          }
        }
        L826: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g820);
          let _g827 = 0;
          G828: {
            const _a829 = v_R;
            for (let _i830 = 0; _i830 < _a829.length; _i830++) {
              const v_c = _a829[_i830];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g827++;
            }
          }
          let _c841: boolean = ((_g827 < v_R.length) && (v_R.length >= v_m));
          if (_c841) {
            let _c840: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c840) {
              const _t831 = sp.lineCells[v_K];
              let _g832 = 0;
              G833: {
                const _a834 = _t831;
                for (let _i835 = 0; _i835 < _a834.length; _i835++) {
                  const v_c = _a834[_i835];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g832++;
                }
              }
              let _g836 = 0;
              G837: {
                const _a838 = v_R;
                for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                  const v_c = _a838[_i839];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g836++;
                }
              }
              _c840 = (((clueAt(cl.n, v_K) - _g832) + _g836) >= v_m);
            }
            _c841 = _c840;
          }
          if (!(_c841)) break L826;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q809 = true;
            break Q810;
          }
        }
      }
    }
  }
  const _made = _q809;
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
  let _g913 = -1;
  let _n915 = 0;
  G914: {
    const _t916 = sp.rowOf[v_c];
    const _t917 = sp.colOf[v_c];
    for (let _i918 = 0; _i918 < 2; _i918++) {
      const v_M = _i918 === 0 ? _t916 : _t917;
      if (_i918 === 1 && (v_M === _t916)) continue;
      if (!((v_M !== v_L))) continue;
      if (++_n915 === 2) {
        _g913 = -1;
        break G914;
      }
      _g913 = v_M;
    }
  }
  const _made = _g913;
  _kept1[v_c] = _made;
  return _made;
}
