// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, clueAt, cluesValued, keptStore, rangeMask, setOf, step, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g2759: number[] = [];
  const _g2767: number[] = [];
  const _g2860: number[] = [];
  const _g2868: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2735 = true;
  Q2736: {
    const _a2737 = sp.cells;
    for (let _i2738 = 0; _i2738 < _a2737.length; _i2738++) {
      const v_a = _a2737[_i2738];
      const _h2739 = (g[v_a] || -1);
      if (!((_h2739 === 1))) continue;
      let _q2740 = true;
      Q2741: {
        const _a2742 = sp.adj8[v_a];
        for (let _i2743 = 0; _i2743 < _a2742.length; _i2743++) {
          const v_b = _a2742[_i2743];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2744 = (g[v_b] || -1);
          if (!((_h2744 !== 1))) {
            _q2740 = false;
            break Q2741;
          }
        }
      }
      if (!(_q2740)) {
        _q2735 = false;
        break Q2736;
      }
    }
  }
  if (!(_q2735)) return false;
  let _q2745 = true;
  Q2746: {
    const _a2747 = sp.cells;
    for (let _i2748 = 0; _i2748 < _a2747.length; _i2748++) {
      const v_c = _a2747[_i2748];
      const _h2749 = (g[v_c] || -1);
      let _c2752: boolean = (_h2749 === 1);
      if (_c2752) {
        const _t2750 = step(sp, v_c, 1);
        const _h2751 = (g[_t2750] || -1);
        _c2752 = !(((_t2750 !== -1) && (_h2751 === 1)));
      }
      let _c2755: boolean = _c2752;
      if (_c2755) {
        const _t2753 = step(sp, v_c, 3);
        const _h2754 = (g[_t2753] || -1);
        _c2755 = !(((_t2753 !== -1) && (_h2754 === 1)));
      }
      if (!(_c2755)) continue;
      const _h2758 = sp.rowOf[v_c];
      const _h2766 = sp.colOf[v_c];
      let _q2756 = false;
      Q2757: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2759.length = 0;
          G2760: {
            const _a2763 = sp.lineCells[_h2758];
            for (let _i2764 = 0; _i2764 < _a2763.length; _i2764++) {
              const v_x = _a2763[_i2764];
              const _h2765 = (g[v_x] || -1);
              if (!((_h2765 === 1))) continue;
              _g2759.push(v_x);
            }
          }
          _g2767.length = 0;
          G2768: {
            const _a2771 = sp.lineCells[_h2766];
            for (let _i2772 = 0; _i2772 < _a2771.length; _i2772++) {
              const v_x = _a2771[_i2772];
              const _h2773 = (g[v_x] || -1);
              if (!((_h2773 === 1))) continue;
              _g2767.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2758], v_c, _g2759), stretch(sp.lineCells[_h2766], v_c, _g2767)).length)) {
            _q2756 = true;
            break Q2757;
          }
        }
      }
      if (!(_q2756)) {
        _q2745 = false;
        break Q2746;
      }
    }
  }
  if (!(_q2745)) return false;
  let _q2774 = true;
  Q2775: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2774 = false;
          break Q2775;
        }
      }
    }
  }
  if (!(_q2774)) return false;
  let _g2776 = 0;
  G2777: {
    const _a2778 = sp.cells;
    for (let _i2779 = 0; _i2779 < _a2778.length; _i2779++) {
      const v_c = _a2778[_i2779];
      const _h2780 = (g[v_c] || -1);
      if (!((_h2780 === 1))) continue;
      _g2776++;
    }
  }
  let _g2781 = 0;
  G2782: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2781 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2776 === _g2781))) return false;
  for (let _k2783 = 0; _k2783 < cl.n.at.length; _k2783++) {
    const _at2784 = cl.n.at[_k2783];
    const _v2785 = cl.n.v[_k2783];
    const _t2786 = sp.lineCells[_at2784];
    let _g2787 = 0;
    G2788: {
      const _a2789 = _t2786;
      for (let _i2790 = 0; _i2790 < _a2789.length; _i2790++) {
        const v_c = _a2789[_i2790];
        const _h2791 = (g[v_c] || -1);
        if (!((_h2791 === 1))) continue;
        _g2787++;
      }
    }
    if (!((_g2787 === _v2785))) return false;
  }
  for (let _k2792 = 0; _k2792 < cl.seg.at.length; _k2792++) {
    const _at2793 = cl.seg.at[_k2792];
    const _v2794 = cl.seg.v[_k2792];
    let _c2844: boolean = ((_v2794 === 2) && ((g[_at2793] || -1) === 2));
    if (!_c2844) {
      let _c2843: boolean = ((_v2794 > 2) && ((g[_at2793] || -1) === 1));
      if (_c2843) {
        let _c2801: boolean = (_v2794 === 3);
        if (!_c2801) {
          let _c2797: boolean = (_v2794 === 4);
          if (_c2797) {
            const _t2795 = step(sp, _at2793, 2);
            const _h2796 = (g[_t2795] || -1);
            _c2797 = ((_t2795 !== -1) && (_h2796 === 1));
          }
          let _c2800: boolean = _c2797;
          if (_c2800) {
            const _t2798 = step(sp, _at2793, 1);
            const _h2799 = (g[_t2798] || -1);
            _c2800 = !(((_t2798 !== -1) && (_h2799 === 1)));
          }
          _c2801 = _c2800;
        }
        let _c2808: boolean = _c2801;
        if (!_c2808) {
          let _c2804: boolean = (_v2794 === 5);
          if (_c2804) {
            const _t2802 = step(sp, _at2793, 1);
            const _h2803 = (g[_t2802] || -1);
            _c2804 = ((_t2802 !== -1) && (_h2803 === 1));
          }
          let _c2807: boolean = _c2804;
          if (_c2807) {
            const _t2805 = step(sp, _at2793, 2);
            const _h2806 = (g[_t2805] || -1);
            _c2807 = !(((_t2805 !== -1) && (_h2806 === 1)));
          }
          _c2808 = _c2807;
        }
        let _c2821: boolean = _c2808;
        if (!_c2821) {
          let _c2820: boolean = (_v2794 === 6);
          if (_c2820) {
            const _t2809 = step(sp, _at2793, 1);
            const _h2810 = (g[_t2809] || -1);
            let _c2813: boolean = ((_t2809 !== -1) && (_h2810 === 1));
            if (_c2813) {
              const _t2811 = step(sp, _at2793, 2);
              const _h2812 = (g[_t2811] || -1);
              _c2813 = ((_t2811 !== -1) && (_h2812 === 1));
            }
            let _c2819: boolean = _c2813;
            if (!_c2819) {
              const _t2814 = step(sp, _at2793, 3);
              const _h2815 = (g[_t2814] || -1);
              let _c2818: boolean = ((_t2814 !== -1) && (_h2815 === 1));
              if (_c2818) {
                const _t2816 = step(sp, _at2793, 4);
                const _h2817 = (g[_t2816] || -1);
                _c2818 = ((_t2816 !== -1) && (_h2817 === 1));
              }
              _c2819 = _c2818;
            }
            _c2820 = _c2819;
          }
          _c2821 = _c2820;
        }
        let _c2828: boolean = _c2821;
        if (!_c2828) {
          let _c2824: boolean = (_v2794 === 7);
          if (_c2824) {
            const _t2822 = step(sp, _at2793, 4);
            const _h2823 = (g[_t2822] || -1);
            _c2824 = ((_t2822 !== -1) && (_h2823 === 1));
          }
          let _c2827: boolean = _c2824;
          if (_c2827) {
            const _t2825 = step(sp, _at2793, 3);
            const _h2826 = (g[_t2825] || -1);
            _c2827 = !(((_t2825 !== -1) && (_h2826 === 1)));
          }
          _c2828 = _c2827;
        }
        let _c2835: boolean = _c2828;
        if (!_c2835) {
          let _c2831: boolean = (_v2794 === 8);
          if (_c2831) {
            const _t2829 = step(sp, _at2793, 3);
            const _h2830 = (g[_t2829] || -1);
            _c2831 = ((_t2829 !== -1) && (_h2830 === 1));
          }
          let _c2834: boolean = _c2831;
          if (_c2834) {
            const _t2832 = step(sp, _at2793, 4);
            const _h2833 = (g[_t2832] || -1);
            _c2834 = !(((_t2832 !== -1) && (_h2833 === 1)));
          }
          _c2835 = _c2834;
        }
        let _c2842: boolean = _c2835;
        if (!_c2842) {
          let _c2841: boolean = (_v2794 === 9);
          if (_c2841) {
            let _q2836 = false;
            Q2837: {
              const _a2838 = sp.adj4[_at2793];
              for (let _i2839 = 0; _i2839 < _a2838.length; _i2839++) {
                const v_x = _a2838[_i2839];
                const _h2840 = (g[v_x] || -1);
                if ((_h2840 === 1)) {
                  _q2836 = true;
                  break Q2837;
                }
              }
            }
            _c2841 = !(_q2836);
          }
          _c2842 = _c2841;
        }
        _c2843 = _c2842;
      }
      _c2844 = _c2843;
    }
    if (!(_c2844)) return false;
  }
  for (let _k2845 = 0; _k2845 < cl.fleet.n; _k2845++) {
    let _g2848 = 0;
    G2849: {
      const _a2850 = sp.cells;
      for (let _i2851 = 0; _i2851 < _a2850.length; _i2851++) {
        const v_c = _a2850[_i2851];
        const _h2852 = (g[v_c] || -1);
        let _c2855: boolean = (_h2852 === 1);
        if (_c2855) {
          const _t2853 = step(sp, v_c, 1);
          const _h2854 = (g[_t2853] || -1);
          _c2855 = !(((_t2853 !== -1) && (_h2854 === 1)));
        }
        let _c2858: boolean = _c2855;
        if (_c2858) {
          const _t2856 = step(sp, v_c, 3);
          const _h2857 = (g[_t2856] || -1);
          _c2858 = !(((_t2856 !== -1) && (_h2857 === 1)));
        }
        let _c2875: boolean = _c2858;
        if (_c2875) {
          const _t2859 = sp.rowOf[v_c];
          _g2860.length = 0;
          G2861: {
            const _a2864 = sp.lineCells[_t2859];
            for (let _i2865 = 0; _i2865 < _a2864.length; _i2865++) {
              const v_x = _a2864[_i2865];
              const _h2866 = (g[v_x] || -1);
              if (!((_h2866 === 1))) continue;
              _g2860.push(v_x);
            }
          }
          const _t2867 = sp.colOf[v_c];
          _g2868.length = 0;
          G2869: {
            const _a2872 = sp.lineCells[_t2867];
            for (let _i2873 = 0; _i2873 < _a2872.length; _i2873++) {
              const v_x = _a2872[_i2873];
              const _h2874 = (g[v_x] || -1);
              if (!((_h2874 === 1))) continue;
              _g2868.push(v_x);
            }
          }
          _c2875 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2860), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2868)).length === cl.fleet.length[_k2845]);
        }
        if (!(_c2875)) continue;
        _g2848++;
      }
    }
    if (!((_g2848 === cl.fleet.boats[_k2845]))) return false;
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

/** Its dearest read grows with the board as n. */
export function near(b: Marks, sp: GridSpace, fire: Fire<NearBinding> | null): number {
  const _g82: number[] = [];
  const facts = nearFacts;
  let fired = 0;
  let changed = false;
  const _a80 = sp.cells;
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
        if (fire !== null && !fire({ c: v_c, D: v_D }, facts)) return 1;
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
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
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
      if (fire !== null && !fire({ O: v_O, left: v_left }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function extend(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<ExtendBinding> | null): number {
  const _g282: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  const v_F = full(b, sp, cl, 1);
  const _a275 = sp.cells;
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
        if (fire !== null && !fire({ F: v_F, c: v_c, O: v_O }, facts)) return 1;
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
          if (fire !== null && !fire({ L: v_L, v: v_v, O: v_O, left: v_left }, facts)) return 1;
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

/** Its dearest read grows with the board as n^1.5. */
export function grow(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<GrowBinding> | null): number {
  const _g380: number[] = [];
  const _g388: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _a376 = sp.cells;
  for (let _i377 = 0; _i377 < _a376.length; _i377++) {
    const v_c = _a376[_i377];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    const _a378 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i379 = 0; _i379 < _a378.length; _i379++) {
      const v_L = _a378[_i379];
      _g380.length = 0;
      G381: {
        const _a384 = sp.lineCells[v_L];
        for (let _i385 = 0; _i385 < _a384.length; _i385++) {
          const v_x = _a384[_i385];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g380.push(v_x);
        }
      }
      L386: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g380);
        const _h387 = v_G.length;
        if (!(((_h387 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L386;
        _g388.length = 0;
        G389: {
          const _a397 = sp.lineCells[v_L];
          for (let _i398 = 0; _i398 < _a397.length; _i398++) {
            const v_x = _a397[_i398];
            let _c403: boolean = !((b.grid[v_x] !== 0));
            if (_c403) {
              let _q399 = false;
              Q400: {
                const _a401 = v_G;
                for (let _i402 = 0; _i402 < _a401.length; _i402++) {
                  const v_g = _a401[_i402];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q399 = true;
                    break Q400;
                  }
                }
              }
              _c403 = _q399;
            }
            if (!(_c403)) continue;
            _g388.push(v_x);
          }
        }
        L404: {
          const v_E = _g388;
          const _h405 = v_E.length;
          if (!(((_h405 === 1) && full(b, sp, cl, _h387)))) break L404;
          facts.length = 0;
          changed = false;
          let _q406 = true;
          Q407: {
            const _a408 = v_E;
            for (let _i409 = 0; _i409 < _a408.length; _i409++) {
              const v_x = _a408[_i409];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q406 = false;
                break Q407;
              }
            }
          }
          if (!(_q406)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, G: v_G, E: v_E }, facts)) return 1;
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
  const _g497: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  let _g482 = -1;
  G483: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t484 = cl.fleet.length[v_k];
      if (_g482 === -1 || _t484 > _g482) _g482 = _t484;
    }
  }
  const v_M = _g482;
  const _a485 = sp.lines;
  for (let _i486 = 0; _i486 < _a485.length; _i486++) {
    const v_L = _a485[_i486];
    const _h509 = clueAt(cl.n, v_L);
    const _h510 = (_h509 < 0);
    const _a487 = sp.lineCells[v_L];
    for (let _i488 = 0; _i488 < _a487.length; _i488++) {
      const v_c = _a487[_i488];
      const _h493 = (v_c % sp.w);
      const _h494 = ((v_c / sp.w) | 0);
      const _h495 = (_h493 + _h494);
      let _c496: boolean = ((b.grid[v_c] || -1) !== 2);
      if (_c496) {
        let _q489 = false;
        Q490: {
          const _a491 = sp.adj4[v_c];
          for (let _i492 = 0; _i492 < _a491.length; _i492++) {
            const v_p = _a491[_i492];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h495)))) continue;
            if (((b.grid[v_p] || -1) !== 2)) {
              _q489 = true;
              break Q490;
            }
          }
        }
        _c496 = !(_q489);
      }
      if (!(_c496)) continue;
      _g497.length = 0;
      G498: {
        const _a501 = sp.lineCells[v_L];
        for (let _i502 = 0; _i502 < _a501.length; _i502++) {
          const v_x = _a501[_i502];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g497.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g497);
      const _h503 = v_R.length;
      L504: {
        const v_m = _h503;
        let _c522: boolean = (v_m === v_M);
        if (_c522) {
          let _g505 = 0;
          G506: {
            const _a507 = v_R;
            for (let _i508 = 0; _i508 < _a507.length; _i508++) {
              const v_c = _a507[_i508];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g505++;
            }
          }
          let _c521: boolean = ((_g505 < _h503) && (_h503 >= v_m));
          if (_c521) {
            let _c520: boolean = _h510;
            if (!_c520) {
              const _t511 = sp.lineCells[v_L];
              let _g512 = 0;
              G513: {
                const _a514 = _t511;
                for (let _i515 = 0; _i515 < _a514.length; _i515++) {
                  const v_c = _a514[_i515];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g512++;
                }
              }
              let _g516 = 0;
              G517: {
                const _a518 = v_R;
                for (let _i519 = 0; _i519 < _a518.length; _i519++) {
                  const v_c = _a518[_i519];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g516++;
                }
              }
              _c520 = (((_h509 - _g512) + _g516) >= v_m);
            }
            _c521 = _c520;
          }
          _c522 = _c521;
        }
        if (!(_c522)) break L504;
        const _h528 = (v_m > 1);
        L523: {
          const v_b = (boatsOf(sp, cl, v_m) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L523;
          facts.length = 0;
          changed = false;
          let _q524 = true;
          Q525: {
            const _a526 = v_R;
            for (let _i527 = 0; _i527 < _a526.length; _i527++) {
              const v_x = _a526[_i527];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c534: boolean = true;
              if (_c534) {
                let _c533: boolean = _h528;
                if (!_c533) {
                  let _q529 = true;
                  Q530: {
                    const _a531 = sp.adj4[v_x];
                    for (let _i532 = 0; _i532 < _a531.length; _i532++) {
                      const v_y = _a531[_i532];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q529 = false;
                        break Q530;
                      }
                    }
                  }
                  _c533 = _q529;
                }
                _c534 = _c533;
              }
              if (!(_c534)) {
                _q524 = false;
                break Q525;
              }
            }
          }
          if (!(_q524)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ M: v_M, L: v_L, c: v_c, R: v_R, m: v_m, b: v_b }, facts)) return 1;
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
  const _g564: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a557 = cluesValued(cl.seg, 6);
  for (let _i558 = 0; _i558 < _a557.length; _i558++) {
    const v_c = _a557[_i558];
    const _h559 = clueAt(cl.seg, v_c);
    if (!((_h559 === 6))) continue;
    const _a560 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i561 = 0; _i561 < _a560.length; _i561++) {
      const v_L = _a560[_i561];
      const _h562 = clueAt(cl.n, v_L);
      L563: {
        const v_v = _h562;
        if (!((v_v >= 0))) break L563;
        _g564.length = 0;
        G565: {
          const _a568 = sp.adj4[v_c];
          for (let _i569 = 0; _i569 < _a568.length; _i569++) {
            const v_x = _a568[_i569];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g564.push(v_x);
          }
        }
        L570: {
          const v_S = _g564;
          const _h571 = v_S.length;
          let _c581: boolean = (_h571 === 2);
          if (_c581) {
            const _t572 = sp.lineCells[v_L];
            let _g573 = 0;
            G574: {
              const _a575 = _t572;
              for (let _i576 = 0; _i576 < _a575.length; _i576++) {
                const v_c = _a575[_i576];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g573++;
              }
            }
            let _g577 = 0;
            G578: {
              const _a579 = v_S;
              for (let _i580 = 0; _i580 < _a579.length; _i580++) {
                const v_x = _a579[_i580];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g577++;
              }
            }
            _c581 = ((v_v - _g573) < _g577);
          }
          if (!(_c581)) break L570;
          facts.length = 0;
          changed = false;
          let _q582 = true;
          Q583: {
            const _a584 = v_S;
            for (let _i585 = 0; _i585 < _a584.length; _i585++) {
              const v_x = _a584[_i585];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q582 = false;
                break Q583;
              }
            }
          }
          if (!(_q582)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ c: v_c, L: v_L, v: v_v, S: v_S }, facts)) return 1;
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
  const _g620: number[] = [];
  const _g627: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  let _g610 = -1;
  G611: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t612 = cl.fleet.length[v_k];
      if (_g610 === -1 || _t612 > _g610) _g610 = _t612;
    }
  }
  const v_M = _g610;
  const _a613 = sp.cells;
  for (let _i614 = 0; _i614 < _a613.length; _i614++) {
    const v_c = _a613[_i614];
    let _c633: boolean = !((b.grid[v_c] !== 0));
    if (_c633) {
      let _g615 = 0;
      G616: {
        const _a617 = sp.adj4[v_c];
        for (let _i618 = 0; _i618 < _a617.length; _i618++) {
          const v_a = _a617[_i618];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t619 = sp.rowOf[v_a];
          _g620.length = 0;
          G621: {
            const _a624 = sp.lineCells[_t619];
            for (let _i625 = 0; _i625 < _a624.length; _i625++) {
              const v_x = _a624[_i625];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g620.push(v_x);
            }
          }
          const _t626 = sp.colOf[v_a];
          _g627.length = 0;
          G628: {
            const _a631 = sp.lineCells[_t626];
            for (let _i632 = 0; _i632 < _a631.length; _i632++) {
              const v_x = _a631[_i632];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g627.push(v_x);
            }
          }
          _g615 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g620), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g627)).length;
        }
      }
      _c633 = ((1 + _g615) > v_M);
    }
    if (!(_c633)) continue;
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
  const _g656: number[] = [];
  const _g664: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a652 = sp.lines;
  for (let _i653 = 0; _i653 < _a652.length; _i653++) {
    const v_L = _a652[_i653];
    const _a654 = sp.lineCells[v_L];
    for (let _i655 = 0; _i655 < _a654.length; _i655++) {
      const v_c = _a654[_i655];
      _g656.length = 0;
      G657: {
        const _a660 = sp.lineCells[v_L];
        for (let _i661 = 0; _i661 < _a660.length; _i661++) {
          const v_x = _a660[_i661];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g656.push(v_x);
        }
      }
      L662: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g656);
        const _h663 = v_R.length;
        if (!(((_h663 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L662;
        _g664.length = 0;
        G665: {
          const _a668 = v_R;
          for (let _i669 = 0; _i669 < _a668.length; _i669++) {
            const v_c = _a668[_i669];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g664.push(v_c);
          }
        }
        L670: {
          const v_O = _g664;
          const _h671 = v_O.length;
          if (!(((_h671 === 1) && full(b, sp, cl, _h663)))) break L670;
          facts.length = 0;
          changed = false;
          let _q672 = true;
          Q673: {
            const _a674 = v_O;
            for (let _i675 = 0; _i675 < _a674.length; _i675++) {
              const v_x = _a674[_i675];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q672 = false;
                break Q673;
              }
            }
          }
          if (!(_q672)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ L: v_L, c: v_c, R: v_R, O: v_O }, facts)) return 1;
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
          if (fire !== null && !fire({ L: v_L, O: v_O, v: v_v, left: v_left }, facts)) return 1;
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
  const _g889: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
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
    const _h888 = (2 * v_m);
    const _a846 = sp.lines;
    for (let _i847 = 0; _i847 < _a846.length; _i847++) {
      const v_L = _a846[_i847];
      const _h874 = clueAt(cl.n, v_L);
      const _h875 = (_h874 < 0);
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
          let _c887: boolean = (_g865 < _h869);
          if (_c887) {
            let _g870 = 0;
            G871: {
              const _a872 = v_R;
              for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                const v_c = _a872[_i873];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g870++;
              }
            }
            let _c886: boolean = ((_g870 < _h869) && (_h869 >= v_m));
            if (_c886) {
              let _c885: boolean = _h875;
              if (!_c885) {
                const _t876 = sp.lineCells[v_L];
                let _g877 = 0;
                G878: {
                  const _a879 = _t876;
                  for (let _i880 = 0; _i880 < _a879.length; _i880++) {
                    const v_c = _a879[_i880];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g877++;
                  }
                }
                let _g881 = 0;
                G882: {
                  const _a883 = v_R;
                  for (let _i884 = 0; _i884 < _a883.length; _i884++) {
                    const v_c = _a883[_i884];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g881++;
                  }
                }
                _c885 = (((_h874 - _g877) + _g881) >= v_m);
              }
              _c886 = _c885;
            }
            _c887 = _c886;
          }
          if (!((_c887 && (_h869 < _h888)))) break L864;
          const _h895 = (_h869 - v_m);
          _g889.length = 0;
          G890: {
            const _a893 = v_R;
            for (let _i894 = 0; _i894 < _a893.length; _i894++) {
              const v_x = _a893[_i894];
              if (!(((_i894 >= _h895) && (_i894 < v_m)))) continue;
              _g889.push(v_x);
            }
          }
          L896: {
            const v_C = _g889;
            const _h897 = v_C.length;
            if (!((_h897 > 0))) break L896;
            const _h903 = (_h897 > 1);
            const v_b = (boatsOf(sp, cl, v_m) - done(b, sp, v_m));
            L898: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L898;
              facts.length = 0;
              changed = false;
              let _q899 = true;
              Q900: {
                const _a901 = v_C;
                for (let _i902 = 0; _i902 < _a901.length; _i902++) {
                  const v_x = _a901[_i902];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c909: boolean = true;
                  if (_c909) {
                    let _c908: boolean = _h903;
                    if (!_c908) {
                      let _q904 = true;
                      Q905: {
                        const _a906 = sp.adj4[v_x];
                        for (let _i907 = 0; _i907 < _a906.length; _i907++) {
                          const v_y = _a906[_i907];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q904 = false;
                            break Q905;
                          }
                        }
                      }
                      _c908 = _q904;
                    }
                    _c909 = _c908;
                  }
                  if (!(_c909)) {
                    _q899 = false;
                    break Q900;
                  }
                }
              }
              if (!(_q899)) return -1;
              if (changed || facts.length > 0) {
                fired = 1;
                if (fire !== null && !fire({ m: v_m, L: v_L, c: v_c, R: v_R, C: v_C, b: v_b, r: v_r }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function shared(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<SharedBinding> | null): number {
  const facts = sharedFacts;
  let fired = 0;
  let changed = false;
  const _a945 = sp.lines;
  for (let _i946 = 0; _i946 < _a945.length; _i946++) {
    const v_L = _a945[_i946];
    const _h947 = clueAt(cl.n, v_L);
    L948: {
      const v_v = ((_h947 + rec(b, sp, cl, v_L)) + 1);
      if (!((v_v >= 0))) break L948;
      let _g949 = 0;
      G950: {
        const _a951 = sp.lineCells[v_L];
        for (let _i952 = 0; _i952 < _a951.length; _i952++) {
          const v_c = _a951[_i952];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g949++;
        }
      }
      L953: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g949);
        if (!(((v_t === 1) || (v_t === 2)))) break L953;
        const _a954 = sp.lineCells[v_L];
        for (let _i955 = 0; _i955 < _a954.length; _i955++) {
          const v_k = _a954[_i955];
          let _g961 = -1;
          let _n963 = 0;
          G962: {
            const _a964 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i965 = 0; _i965 < _a964.length; _i965++) {
              const v_M = _a964[_i965];
              if (!((v_M !== v_L))) continue;
              if (++_n963 === 2) {
                _g961 = -1;
                break G962;
              }
              _g961 = v_M;
            }
          }
          const v_K = _g961;
          const _h966 = clueAt(cl.n, v_K);
          const v_j = ((_h966 + rec(b, sp, cl, v_K)) + 1);
          const _h975 = (v_j >= 0);
          let _g967 = 0;
          G968: {
            const _a969 = sp.adj4[v_k];
            for (let _i970 = 0; _i970 < _a969.length; _i970++) {
              const v_x = _a969[_i970];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g967++;
            }
          }
          let _g971 = 0;
          G972: {
            const _a973 = setOf(v_k);
            for (let _i974 = 0; _i974 < _a973.length; _i974++) {
              const v_x = _a973[_i974];
              let _c981: boolean = (!((b.grid[v_x] !== 0)) && _h975);
              if (_c981) {
                const _t976 = sp.lineCells[v_K];
                let _g977 = 0;
                G978: {
                  const _a979 = _t976;
                  for (let _i980 = 0; _i980 < _a979.length; _i980++) {
                    const v_c = _a979[_i980];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g977++;
                  }
                }
                _c981 = ((v_j - _g977) === 1);
              }
              if (!(_c981)) continue;
              _g971++;
            }
          }
          L982: {
            const v_s = (_g967 + _g971);
            if (!((v_s > v_t))) break L982;
            facts.length = 0;
            changed = false;
            let _q983 = true;
            Q984: {
              const _a985 = sp.adj4[v_k];
              for (let _i986 = 0; _i986 < _a985.length; _i986++) {
                const v_y = _a985[_i986];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q983 = false;
                  break Q984;
                }
              }
            }
            if (!(_q983)) return -1;
            if (changed || facts.length > 0) {
              fired = 1;
              if (fire !== null && !fire({ L: v_L, v: v_v, t: v_t, k: v_k, K: v_K, j: v_j, s: v_s }, facts)) return 1;
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

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g1311: number[] = [];
  const _g1317: number[] = [];
  const _g1327: number[] = [];
  const _g1340: number[] = [];
  const _g1359: number[] = [];
  const _g1403: number[] = [];
  const _g1412: number[] = [];
  const _g1497: number[] = [];
  const _g1511: number[] = [];
  const _g1521: number[] = [];
  const _g1535: number[] = [];
  const _g1553: number[] = [];
  const _g1567: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g1282 = -1;
  G1283: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1284 = cl.fleet.length[v_k];
      if (_g1282 === -1 || _t1284 > _g1282) _g1282 = _t1284;
    }
  }
  const v_T = _g1282;
  const _a1285 = sp.lines;
  for (let _i1286 = 0; _i1286 < _a1285.length; _i1286++) {
    const v_L = _a1285[_i1286];
    const _h1287 = clueAt(cl.n, v_L);
    L1288: {
      const v_v = ((_h1287 + rec(b, sp, cl, v_L)) + 1);
      let _c1293: boolean = (v_v >= 0);
      if (_c1293) {
        let _g1289 = 0;
        G1290: {
          const _a1291 = sp.lineCells[v_L];
          for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
            const v_c = _a1291[_i1292];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1289++;
          }
        }
        _c1293 = (((sp.lineCells[v_L].length - v_v) - _g1289) === 1);
      }
      if (!(_c1293)) break L1288;
      const _a1294 = sp.lineCells[v_L];
      for (let _i1295 = 0; _i1295 < _a1294.length; _i1295++) {
        const v_c = _a1294[_i1295];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1301 = -1;
        let _n1303 = 0;
        G1302: {
          const _a1304 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
            const v_M = _a1304[_i1305];
            if (!((v_M !== v_L))) continue;
            if (++_n1303 === 2) {
              _g1301 = -1;
              break G1302;
            }
            _g1301 = v_M;
          }
        }
        const v_K = _g1301;
        const _h1306 = clueAt(cl.n, v_K);
        const v_j = ((_h1306 + rec(b, sp, cl, v_K)) + 1);
        const _h1335 = (v_j >= 0);
        let _g1307 = 0;
        G1308: {
          const _a1309 = sp.lineCells[v_K];
          for (let _i1310 = 0; _i1310 < _a1309.length; _i1310++) {
            const v_c = _a1309[_i1310];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1307++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1307);
        const _h1336 = (v_t === 1);
        const _h1337 = (_h1335 && _h1336);
        _g1311.length = 0;
        G1312: {
          const _a1315 = sp.lineCells[v_L];
          for (let _i1316 = 0; _i1316 < _a1315.length; _i1316++) {
            const v_x = _a1315[_i1316];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1311.push(v_x);
          }
        }
        _g1317.length = 0;
        G1318: {
          _g1327.length = 0;
          G1328: {
            const _a1331 = sp.lineCells[v_K];
            for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
              const v_x = _a1331[_i1332];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1327.push(v_x);
            }
          }
          const _a1333 = _g1327;
          for (let _i1334 = 0; _i1334 < _a1333.length; _i1334++) {
            const v_x = _a1333[_i1334];
            if (!(_h1337)) continue;
            _g1317.push(v_x);
          }
        }
        L1338: {
          const v_H = union(_g1311, _g1317);
          const _t1339 = setOf(v_c);
          _g1340.length = 0;
          G1341: {
            const _a1346 = v_H;
            for (let _i1347 = 0; _i1347 < _a1346.length; _i1347++) {
              const v_a = _a1346[_i1347];
              const _a1348 = sp.adj8[v_a];
              for (let _i1349 = 0; _i1349 < _a1348.length; _i1349++) {
                const v_d = _a1348[_i1349];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1340.includes(v_d)) _g1340.push(v_d);
              }
            }
          }
          const _t1350 = union(_t1339, _g1340);
          let _q1351 = false;
          Q1352: {
            const _a1353 = v_H;
            for (let _i1354 = 0; _i1354 < _a1353.length; _i1354++) {
              const v_a = _a1353[_i1354];
              const _a1355 = sp.adj8[v_a];
              for (let _i1356 = 0; _i1356 < _a1355.length; _i1356++) {
                const v_b = _a1355[_i1356];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1351 = true;
                  break Q1352;
                }
              }
            }
          }
          let _c1382: boolean = _q1351;
          if (!_c1382) {
            let _q1357 = false;
            Q1358: {
              _g1359.length = 0;
              G1360: {
                const _a1365 = union(v_H, _t1350);
                for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
                  const v_a = _a1365[_i1366];
                  const _a1367 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
                    const v_M = _a1367[_i1368];
                    if (!_g1359.includes(v_M)) _g1359.push(v_M);
                  }
                }
              }
              const _a1369 = _g1359;
              for (let _i1370 = 0; _i1370 < _a1369.length; _i1370++) {
                const v_L = _a1369[_i1370];
                const _h1371 = clueAt(cl.n, v_L);
                L1372: {
                  const v_v = ((_h1371 + rec(b, sp, cl, v_L)) + 1);
                  if (!((v_v >= 0))) break L1372;
                  let _g1373 = 0;
                  G1374: {
                    const _a1375 = sp.lineCells[v_L];
                    for (let _i1376 = 0; _i1376 < _a1375.length; _i1376++) {
                      const v_x = _a1375[_i1376];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1373++;
                    }
                  }
                  let _c1381: boolean = (_g1373 > v_v);
                  if (!_c1381) {
                    let _g1377 = 0;
                    G1378: {
                      const _a1379 = sp.lineCells[v_L];
                      for (let _i1380 = 0; _i1380 < _a1379.length; _i1380++) {
                        const v_x = _a1379[_i1380];
                        if (!((!(_t1350.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1377++;
                      }
                    }
                    _c1381 = (_g1377 < v_v);
                  }
                  if (_c1381) {
                    _q1357 = true;
                    break Q1358;
                  }
                }
              }
            }
            _c1382 = _q1357;
          }
          let _c1389: boolean = _c1382;
          if (!_c1389) {
            let _g1383 = 0;
            G1384: {
              const _a1385 = sp.cells;
              for (let _i1386 = 0; _i1386 < _a1385.length; _i1386++) {
                const v_x = _a1385[_i1386];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1383++;
              }
            }
            let _g1387 = 0;
            G1388: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1387 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1389 = (_g1383 > _g1387);
          }
          let _c1396: boolean = _c1389;
          if (!_c1396) {
            let _g1390 = 0;
            G1391: {
              const _a1392 = sp.cells;
              for (let _i1393 = 0; _i1393 < _a1392.length; _i1393++) {
                const v_x = _a1392[_i1393];
                if (!((!(_t1350.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1390++;
              }
            }
            let _g1394 = 0;
            G1395: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1394 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1396 = (_g1390 < _g1394);
          }
          let _c1409: boolean = _c1396;
          if (!_c1409) {
            let _q1397 = false;
            Q1398: {
              const _a1399 = v_H;
              for (let _i1400 = 0; _i1400 < _a1399.length; _i1400++) {
                const v_a = _a1399[_i1400];
                const _a1401 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i1402 = 0; _i1402 < _a1401.length; _i1402++) {
                  const v_L = _a1401[_i1402];
                  _g1403.length = 0;
                  G1404: {
                    const _a1407 = sp.lineCells[v_L];
                    for (let _i1408 = 0; _i1408 < _a1407.length; _i1408++) {
                      const v_x = _a1407[_i1408];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1403.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1403).length > v_T)) {
                    _q1397 = true;
                    break Q1398;
                  }
                }
              }
            }
            _c1409 = _q1397;
          }
          let _c1585: boolean = _c1409;
          if (!_c1585) {
            let _q1410 = false;
            Q1411: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1412.length = 0;
                G1413: {
                  _g1497.length = 0;
                  G1498: {
                    const _a1503 = union(v_H, _t1350);
                    for (let _i1504 = 0; _i1504 < _a1503.length; _i1504++) {
                      const v_x = _a1503[_i1504];
                      const _a1505 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1506 = 0; _i1506 < _a1505.length; _i1506++) {
                        const v_y = _a1505[_i1506];
                        if (!_g1497.includes(v_y)) _g1497.push(v_y);
                      }
                    }
                  }
                  const _a1507 = _g1497;
                  for (let _i1508 = 0; _i1508 < _a1507.length; _i1508++) {
                    const v_a = _a1507[_i1508];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a1509 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i1510 = 0; _i1510 < _a1509.length; _i1510++) {
                      const v_L = _a1509[_i1510];
                      _g1511.length = 0;
                      G1512: {
                        const _a1515 = sp.lineCells[v_L];
                        for (let _i1516 = 0; _i1516 < _a1515.length; _i1516++) {
                          const v_x = _a1515[_i1516];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1511.push(v_x);
                        }
                      }
                      L1517: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1511);
                        const _h1518 = v_G.length;
                        const _h1547 = (_h1518 === 1);
                        let _c1550: boolean = (_h1518 === v_m);
                        if (_c1550) {
                          let _q1519 = true;
                          Q1520: {
                            _g1521.length = 0;
                            G1522: {
                              _g1535.length = 0;
                              G1536: {
                                const _a1541 = v_G;
                                for (let _i1542 = 0; _i1542 < _a1541.length; _i1542++) {
                                  const v_g = _a1541[_i1542];
                                  const _a1543 = sp.adj4[v_g];
                                  for (let _i1544 = 0; _i1544 < _a1543.length; _i1544++) {
                                    const v_z = _a1543[_i1544];
                                    if (!_g1535.includes(v_z)) _g1535.push(v_z);
                                  }
                                }
                              }
                              const _a1545 = _g1535;
                              for (let _i1546 = 0; _i1546 < _a1545.length; _i1546++) {
                                const v_y = _a1545[_i1546];
                                if (!((!(v_G.includes(v_y)) && (_h1547 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1521.push(v_y);
                              }
                            }
                            const _a1548 = _g1521;
                            for (let _i1549 = 0; _i1549 < _a1548.length; _i1549++) {
                              const v_y = _a1548[_i1549];
                              if (!(((_t1350.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1519 = false;
                                break Q1520;
                              }
                            }
                          }
                          _c1550 = _q1519;
                        }
                        let _c1581: boolean = _c1550;
                        if (_c1581) {
                          let _q1551 = false;
                          Q1552: {
                            _g1553.length = 0;
                            G1554: {
                              _g1567.length = 0;
                              G1568: {
                                const _a1573 = v_G;
                                for (let _i1574 = 0; _i1574 < _a1573.length; _i1574++) {
                                  const v_g = _a1573[_i1574];
                                  const _a1575 = sp.adj4[v_g];
                                  for (let _i1576 = 0; _i1576 < _a1575.length; _i1576++) {
                                    const v_z = _a1575[_i1576];
                                    if (!_g1567.includes(v_z)) _g1567.push(v_z);
                                  }
                                }
                              }
                              const _a1577 = _g1567;
                              for (let _i1578 = 0; _i1578 < _a1577.length; _i1578++) {
                                const v_y = _a1577[_i1578];
                                if (!((!(v_G.includes(v_y)) && (_h1547 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1553.push(v_y);
                              }
                            }
                            const _a1579 = union(v_G, _g1553);
                            for (let _i1580 = 0; _i1580 < _a1579.length; _i1580++) {
                              const v_x = _a1579[_i1580];
                              if (((v_H.includes(v_x)) || (_t1350.includes(v_x)))) {
                                _q1551 = true;
                                break Q1552;
                              }
                            }
                          }
                          _c1581 = _q1551;
                        }
                        if (!(_c1581)) break L1517;
                        const _t1582 = (v_G[0] ?? -1);
                        if (!_g1412.includes(_t1582)) _g1412.push(_t1582);
                      }
                    }
                  }
                }
                L1583: {
                  const v_C = _g1412;
                  const _h1584 = v_C.length;
                  if (!((_h1584 > 0))) break L1583;
                  if ((_h1584 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q1410 = true;
                    break Q1411;
                  }
                }
              }
            }
            _c1585 = _q1410;
          }
          if (!(_c1585)) break L1338;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, t: v_t, H: v_H }, facts)) return 1;
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

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g1914: number[] = [];
  const _g1920: number[] = [];
  const _g1930: number[] = [];
  const _g1943: number[] = [];
  const _g1962: number[] = [];
  const _g2006: number[] = [];
  const _g2015: number[] = [];
  const _g2100: number[] = [];
  const _g2114: number[] = [];
  const _g2124: number[] = [];
  const _g2138: number[] = [];
  const _g2156: number[] = [];
  const _g2170: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g1883 = -1;
  G1884: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1885 = cl.fleet.length[v_k];
      if (_g1883 === -1 || _t1885 > _g1883) _g1883 = _t1885;
    }
  }
  const v_T = _g1883;
  const _a1886 = sp.lines;
  for (let _i1887 = 0; _i1887 < _a1886.length; _i1887++) {
    const v_L = _a1886[_i1887];
    const _h1888 = clueAt(cl.n, v_L);
    L1889: {
      const v_v = ((_h1888 + rec(b, sp, cl, v_L)) + 1);
      let _c1895: boolean = (v_v >= 0);
      if (_c1895) {
        const _t1890 = sp.lineCells[v_L];
        let _g1891 = 0;
        G1892: {
          const _a1893 = _t1890;
          for (let _i1894 = 0; _i1894 < _a1893.length; _i1894++) {
            const v_c = _a1893[_i1894];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1891++;
          }
        }
        _c1895 = ((v_v - _g1891) === 1);
      }
      if (!(_c1895)) break L1889;
      const _a1896 = sp.lineCells[v_L];
      for (let _i1897 = 0; _i1897 < _a1896.length; _i1897++) {
        const v_c = _a1896[_i1897];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1903 = -1;
        let _n1905 = 0;
        G1904: {
          const _a1906 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1907 = 0; _i1907 < _a1906.length; _i1907++) {
            const v_M = _a1906[_i1907];
            if (!((v_M !== v_L))) continue;
            if (++_n1905 === 2) {
              _g1903 = -1;
              break G1904;
            }
            _g1903 = v_M;
          }
        }
        const v_K = _g1903;
        const _h1908 = clueAt(cl.n, v_K);
        const v_j = ((_h1908 + rec(b, sp, cl, v_K)) + 1);
        const _h1938 = (v_j >= 0);
        const _t1909 = sp.lineCells[v_K];
        let _g1910 = 0;
        G1911: {
          const _a1912 = _t1909;
          for (let _i1913 = 0; _i1913 < _a1912.length; _i1913++) {
            const v_c = _a1912[_i1913];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1910++;
          }
        }
        const v_u = (v_j - _g1910);
        const _h1939 = (v_u === 1);
        const _h1940 = (_h1938 && _h1939);
        _g1914.length = 0;
        G1915: {
          const _a1918 = sp.lineCells[v_L];
          for (let _i1919 = 0; _i1919 < _a1918.length; _i1919++) {
            const v_x = _a1918[_i1919];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1914.push(v_x);
          }
        }
        _g1920.length = 0;
        G1921: {
          _g1930.length = 0;
          G1931: {
            const _a1934 = sp.lineCells[v_K];
            for (let _i1935 = 0; _i1935 < _a1934.length; _i1935++) {
              const v_x = _a1934[_i1935];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1930.push(v_x);
            }
          }
          const _a1936 = _g1930;
          for (let _i1937 = 0; _i1937 < _a1936.length; _i1937++) {
            const v_x = _a1936[_i1937];
            if (!(_h1940)) continue;
            _g1920.push(v_x);
          }
        }
        L1941: {
          const v_W = union(_g1914, _g1920);
          const _t1942 = setOf(v_c);
          _g1943.length = 0;
          G1944: {
            const _a1949 = _t1942;
            for (let _i1950 = 0; _i1950 < _a1949.length; _i1950++) {
              const v_a = _a1949[_i1950];
              const _a1951 = sp.adj8[v_a];
              for (let _i1952 = 0; _i1952 < _a1951.length; _i1952++) {
                const v_d = _a1951[_i1952];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1943.includes(v_d)) _g1943.push(v_d);
              }
            }
          }
          const _t1953 = union(v_W, _g1943);
          let _q1954 = false;
          Q1955: {
            const _a1956 = _t1942;
            for (let _i1957 = 0; _i1957 < _a1956.length; _i1957++) {
              const v_a = _a1956[_i1957];
              const _a1958 = sp.adj8[v_a];
              for (let _i1959 = 0; _i1959 < _a1958.length; _i1959++) {
                const v_b = _a1958[_i1959];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1942.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1954 = true;
                  break Q1955;
                }
              }
            }
          }
          let _c1985: boolean = _q1954;
          if (!_c1985) {
            let _q1960 = false;
            Q1961: {
              _g1962.length = 0;
              G1963: {
                const _a1968 = union(_t1942, _t1953);
                for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
                  const v_a = _a1968[_i1969];
                  const _a1970 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1971 = 0; _i1971 < _a1970.length; _i1971++) {
                    const v_M = _a1970[_i1971];
                    if (!_g1962.includes(v_M)) _g1962.push(v_M);
                  }
                }
              }
              const _a1972 = _g1962;
              for (let _i1973 = 0; _i1973 < _a1972.length; _i1973++) {
                const v_L = _a1972[_i1973];
                const _h1974 = clueAt(cl.n, v_L);
                L1975: {
                  const v_v = ((_h1974 + rec(b, sp, cl, v_L)) + 1);
                  if (!((v_v >= 0))) break L1975;
                  let _g1976 = 0;
                  G1977: {
                    const _a1978 = sp.lineCells[v_L];
                    for (let _i1979 = 0; _i1979 < _a1978.length; _i1979++) {
                      const v_x = _a1978[_i1979];
                      if (!(((_t1942.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1976++;
                    }
                  }
                  let _c1984: boolean = (_g1976 > v_v);
                  if (!_c1984) {
                    let _g1980 = 0;
                    G1981: {
                      const _a1982 = sp.lineCells[v_L];
                      for (let _i1983 = 0; _i1983 < _a1982.length; _i1983++) {
                        const v_x = _a1982[_i1983];
                        if (!((!(_t1953.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1980++;
                      }
                    }
                    _c1984 = (_g1980 < v_v);
                  }
                  if (_c1984) {
                    _q1960 = true;
                    break Q1961;
                  }
                }
              }
            }
            _c1985 = _q1960;
          }
          let _c1992: boolean = _c1985;
          if (!_c1992) {
            let _g1986 = 0;
            G1987: {
              const _a1988 = sp.cells;
              for (let _i1989 = 0; _i1989 < _a1988.length; _i1989++) {
                const v_x = _a1988[_i1989];
                if (!(((_t1942.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1986++;
              }
            }
            let _g1990 = 0;
            G1991: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1990 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1992 = (_g1986 > _g1990);
          }
          let _c1999: boolean = _c1992;
          if (!_c1999) {
            let _g1993 = 0;
            G1994: {
              const _a1995 = sp.cells;
              for (let _i1996 = 0; _i1996 < _a1995.length; _i1996++) {
                const v_x = _a1995[_i1996];
                if (!((!(_t1953.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1993++;
              }
            }
            let _g1997 = 0;
            G1998: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1997 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1999 = (_g1993 < _g1997);
          }
          let _c2012: boolean = _c1999;
          if (!_c2012) {
            let _q2000 = false;
            Q2001: {
              const _a2002 = _t1942;
              for (let _i2003 = 0; _i2003 < _a2002.length; _i2003++) {
                const v_a = _a2002[_i2003];
                const _a2004 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i2005 = 0; _i2005 < _a2004.length; _i2005++) {
                  const v_L = _a2004[_i2005];
                  _g2006.length = 0;
                  G2007: {
                    const _a2010 = sp.lineCells[v_L];
                    for (let _i2011 = 0; _i2011 < _a2010.length; _i2011++) {
                      const v_x = _a2010[_i2011];
                      if (!(((_t1942.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2006.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2006).length > v_T)) {
                    _q2000 = true;
                    break Q2001;
                  }
                }
              }
            }
            _c2012 = _q2000;
          }
          let _c2188: boolean = _c2012;
          if (!_c2188) {
            let _q2013 = false;
            Q2014: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2015.length = 0;
                G2016: {
                  _g2100.length = 0;
                  G2101: {
                    const _a2106 = union(_t1942, _t1953);
                    for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
                      const v_x = _a2106[_i2107];
                      const _a2108 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2109 = 0; _i2109 < _a2108.length; _i2109++) {
                        const v_y = _a2108[_i2109];
                        if (!_g2100.includes(v_y)) _g2100.push(v_y);
                      }
                    }
                  }
                  const _a2110 = _g2100;
                  for (let _i2111 = 0; _i2111 < _a2110.length; _i2111++) {
                    const v_a = _a2110[_i2111];
                    if (!(((_t1942.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2112 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2113 = 0; _i2113 < _a2112.length; _i2113++) {
                      const v_L = _a2112[_i2113];
                      _g2114.length = 0;
                      G2115: {
                        const _a2118 = sp.lineCells[v_L];
                        for (let _i2119 = 0; _i2119 < _a2118.length; _i2119++) {
                          const v_x = _a2118[_i2119];
                          if (!(((_t1942.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2114.push(v_x);
                        }
                      }
                      L2120: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2114);
                        const _h2121 = v_G.length;
                        const _h2150 = (_h2121 === 1);
                        let _c2153: boolean = (_h2121 === v_m);
                        if (_c2153) {
                          let _q2122 = true;
                          Q2123: {
                            _g2124.length = 0;
                            G2125: {
                              _g2138.length = 0;
                              G2139: {
                                const _a2144 = v_G;
                                for (let _i2145 = 0; _i2145 < _a2144.length; _i2145++) {
                                  const v_g = _a2144[_i2145];
                                  const _a2146 = sp.adj4[v_g];
                                  for (let _i2147 = 0; _i2147 < _a2146.length; _i2147++) {
                                    const v_z = _a2146[_i2147];
                                    if (!_g2138.includes(v_z)) _g2138.push(v_z);
                                  }
                                }
                              }
                              const _a2148 = _g2138;
                              for (let _i2149 = 0; _i2149 < _a2148.length; _i2149++) {
                                const v_y = _a2148[_i2149];
                                if (!((!(v_G.includes(v_y)) && (_h2150 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2124.push(v_y);
                              }
                            }
                            const _a2151 = _g2124;
                            for (let _i2152 = 0; _i2152 < _a2151.length; _i2152++) {
                              const v_y = _a2151[_i2152];
                              if (!(((_t1953.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2122 = false;
                                break Q2123;
                              }
                            }
                          }
                          _c2153 = _q2122;
                        }
                        let _c2184: boolean = _c2153;
                        if (_c2184) {
                          let _q2154 = false;
                          Q2155: {
                            _g2156.length = 0;
                            G2157: {
                              _g2170.length = 0;
                              G2171: {
                                const _a2176 = v_G;
                                for (let _i2177 = 0; _i2177 < _a2176.length; _i2177++) {
                                  const v_g = _a2176[_i2177];
                                  const _a2178 = sp.adj4[v_g];
                                  for (let _i2179 = 0; _i2179 < _a2178.length; _i2179++) {
                                    const v_z = _a2178[_i2179];
                                    if (!_g2170.includes(v_z)) _g2170.push(v_z);
                                  }
                                }
                              }
                              const _a2180 = _g2170;
                              for (let _i2181 = 0; _i2181 < _a2180.length; _i2181++) {
                                const v_y = _a2180[_i2181];
                                if (!((!(v_G.includes(v_y)) && (_h2150 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2156.push(v_y);
                              }
                            }
                            const _a2182 = union(v_G, _g2156);
                            for (let _i2183 = 0; _i2183 < _a2182.length; _i2183++) {
                              const v_x = _a2182[_i2183];
                              if (((_t1942.includes(v_x)) || (_t1953.includes(v_x)))) {
                                _q2154 = true;
                                break Q2155;
                              }
                            }
                          }
                          _c2184 = _q2154;
                        }
                        if (!(_c2184)) break L2120;
                        const _t2185 = (v_G[0] ?? -1);
                        if (!_g2015.includes(_t2185)) _g2015.push(_t2185);
                      }
                    }
                  }
                }
                L2186: {
                  const v_C = _g2015;
                  const _h2187 = v_C.length;
                  if (!((_h2187 > 0))) break L2186;
                  if ((_h2187 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q2013 = true;
                    break Q2014;
                  }
                }
              }
            }
            _c2188 = _q2013;
          }
          if (!(_c2188)) break L1941;
          facts.length = 0;
          changed = false;
          if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
          if (!(true)) return -1;
          if (changed || facts.length > 0) {
            fired = 1;
            if (fire !== null && !fire({ T: v_T, L: v_L, v: v_v, c: v_c, K: v_K, j: v_j, u: v_u, W: v_W }, facts)) return 1;
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

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g2465: number[] = [];
  const _g2478: number[] = [];
  const _g2484: number[] = [];
  const _g2503: number[] = [];
  const _g2547: number[] = [];
  const _g2556: number[] = [];
  const _g2641: number[] = [];
  const _g2655: number[] = [];
  const _g2665: number[] = [];
  const _g2679: number[] = [];
  const _g2697: number[] = [];
  const _g2711: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g2457 = -1;
  G2458: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2459 = cl.fleet.length[v_k];
      if (_g2457 === -1 || _t2459 > _g2457) _g2457 = _t2459;
    }
  }
  const v_T = _g2457;
  const _a2460 = cluesValued(cl.seg, 6);
  for (let _i2461 = 0; _i2461 < _a2460.length; _i2461++) {
    const v_c = _a2460[_i2461];
    const _h2462 = clueAt(cl.seg, v_c);
    if (!((_h2462 === 6))) continue;
    const _a2463 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i2464 = 0; _i2464 < _a2463.length; _i2464++) {
      const v_L = _a2463[_i2464];
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
        let _c2730: boolean = _c2477;
        if (_c2730) {
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
          G2485: {
            const _a2490 = v_S;
            for (let _i2491 = 0; _i2491 < _a2490.length; _i2491++) {
              const v_a = _a2490[_i2491];
              const _a2492 = sp.adj8[v_a];
              for (let _i2493 = 0; _i2493 < _a2492.length; _i2493++) {
                const v_d = _a2492[_i2493];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g2484.includes(v_d)) _g2484.push(v_d);
              }
            }
          }
          const _t2494 = union(_g2478, _g2484);
          let _q2495 = false;
          Q2496: {
            const _a2497 = v_S;
            for (let _i2498 = 0; _i2498 < _a2497.length; _i2498++) {
              const v_a = _a2497[_i2498];
              const _a2499 = sp.adj8[v_a];
              for (let _i2500 = 0; _i2500 < _a2499.length; _i2500++) {
                const v_b = _a2499[_i2500];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2495 = true;
                  break Q2496;
                }
              }
            }
          }
          let _c2526: boolean = _q2495;
          if (!_c2526) {
            let _q2501 = false;
            Q2502: {
              _g2503.length = 0;
              G2504: {
                const _a2509 = union(v_S, _t2494);
                for (let _i2510 = 0; _i2510 < _a2509.length; _i2510++) {
                  const v_a = _a2509[_i2510];
                  const _a2511 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i2512 = 0; _i2512 < _a2511.length; _i2512++) {
                    const v_M = _a2511[_i2512];
                    if (!_g2503.includes(v_M)) _g2503.push(v_M);
                  }
                }
              }
              const _a2513 = _g2503;
              for (let _i2514 = 0; _i2514 < _a2513.length; _i2514++) {
                const v_L = _a2513[_i2514];
                const _h2515 = clueAt(cl.n, v_L);
                L2516: {
                  const v_v = ((_h2515 + rec(b, sp, cl, v_L)) + 1);
                  if (!((v_v >= 0))) break L2516;
                  let _g2517 = 0;
                  G2518: {
                    const _a2519 = sp.lineCells[v_L];
                    for (let _i2520 = 0; _i2520 < _a2519.length; _i2520++) {
                      const v_x = _a2519[_i2520];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2517++;
                    }
                  }
                  let _c2525: boolean = (_g2517 > v_v);
                  if (!_c2525) {
                    let _g2521 = 0;
                    G2522: {
                      const _a2523 = sp.lineCells[v_L];
                      for (let _i2524 = 0; _i2524 < _a2523.length; _i2524++) {
                        const v_x = _a2523[_i2524];
                        if (!((!(_t2494.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2521++;
                      }
                    }
                    _c2525 = (_g2521 < v_v);
                  }
                  if (_c2525) {
                    _q2501 = true;
                    break Q2502;
                  }
                }
              }
            }
            _c2526 = _q2501;
          }
          let _c2533: boolean = _c2526;
          if (!_c2533) {
            let _g2527 = 0;
            G2528: {
              const _a2529 = sp.cells;
              for (let _i2530 = 0; _i2530 < _a2529.length; _i2530++) {
                const v_x = _a2529[_i2530];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2527++;
              }
            }
            let _g2531 = 0;
            G2532: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2531 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2533 = (_g2527 > _g2531);
          }
          let _c2540: boolean = _c2533;
          if (!_c2540) {
            let _g2534 = 0;
            G2535: {
              const _a2536 = sp.cells;
              for (let _i2537 = 0; _i2537 < _a2536.length; _i2537++) {
                const v_x = _a2536[_i2537];
                if (!((!(_t2494.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2534++;
              }
            }
            let _g2538 = 0;
            G2539: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2538 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2540 = (_g2534 < _g2538);
          }
          let _c2553: boolean = _c2540;
          if (!_c2553) {
            let _q2541 = false;
            Q2542: {
              const _a2543 = v_S;
              for (let _i2544 = 0; _i2544 < _a2543.length; _i2544++) {
                const v_a = _a2543[_i2544];
                const _a2545 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i2546 = 0; _i2546 < _a2545.length; _i2546++) {
                  const v_L = _a2545[_i2546];
                  _g2547.length = 0;
                  G2548: {
                    const _a2551 = sp.lineCells[v_L];
                    for (let _i2552 = 0; _i2552 < _a2551.length; _i2552++) {
                      const v_x = _a2551[_i2552];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2547.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2547).length > v_T)) {
                    _q2541 = true;
                    break Q2542;
                  }
                }
              }
            }
            _c2553 = _q2541;
          }
          let _c2729: boolean = _c2553;
          if (!_c2729) {
            let _q2554 = false;
            Q2555: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2556.length = 0;
                G2557: {
                  _g2641.length = 0;
                  G2642: {
                    const _a2647 = union(v_S, _t2494);
                    for (let _i2648 = 0; _i2648 < _a2647.length; _i2648++) {
                      const v_x = _a2647[_i2648];
                      const _a2649 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2650 = 0; _i2650 < _a2649.length; _i2650++) {
                        const v_y = _a2649[_i2650];
                        if (!_g2641.includes(v_y)) _g2641.push(v_y);
                      }
                    }
                  }
                  const _a2651 = _g2641;
                  for (let _i2652 = 0; _i2652 < _a2651.length; _i2652++) {
                    const v_a = _a2651[_i2652];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2653 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2654 = 0; _i2654 < _a2653.length; _i2654++) {
                      const v_L = _a2653[_i2654];
                      _g2655.length = 0;
                      G2656: {
                        const _a2659 = sp.lineCells[v_L];
                        for (let _i2660 = 0; _i2660 < _a2659.length; _i2660++) {
                          const v_x = _a2659[_i2660];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2655.push(v_x);
                        }
                      }
                      L2661: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2655);
                        const _h2662 = v_G.length;
                        const _h2691 = (_h2662 === 1);
                        let _c2694: boolean = (_h2662 === v_m);
                        if (_c2694) {
                          let _q2663 = true;
                          Q2664: {
                            _g2665.length = 0;
                            G2666: {
                              _g2679.length = 0;
                              G2680: {
                                const _a2685 = v_G;
                                for (let _i2686 = 0; _i2686 < _a2685.length; _i2686++) {
                                  const v_g = _a2685[_i2686];
                                  const _a2687 = sp.adj4[v_g];
                                  for (let _i2688 = 0; _i2688 < _a2687.length; _i2688++) {
                                    const v_z = _a2687[_i2688];
                                    if (!_g2679.includes(v_z)) _g2679.push(v_z);
                                  }
                                }
                              }
                              const _a2689 = _g2679;
                              for (let _i2690 = 0; _i2690 < _a2689.length; _i2690++) {
                                const v_y = _a2689[_i2690];
                                if (!((!(v_G.includes(v_y)) && (_h2691 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2665.push(v_y);
                              }
                            }
                            const _a2692 = _g2665;
                            for (let _i2693 = 0; _i2693 < _a2692.length; _i2693++) {
                              const v_y = _a2692[_i2693];
                              if (!(((_t2494.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2663 = false;
                                break Q2664;
                              }
                            }
                          }
                          _c2694 = _q2663;
                        }
                        let _c2725: boolean = _c2694;
                        if (_c2725) {
                          let _q2695 = false;
                          Q2696: {
                            _g2697.length = 0;
                            G2698: {
                              _g2711.length = 0;
                              G2712: {
                                const _a2717 = v_G;
                                for (let _i2718 = 0; _i2718 < _a2717.length; _i2718++) {
                                  const v_g = _a2717[_i2718];
                                  const _a2719 = sp.adj4[v_g];
                                  for (let _i2720 = 0; _i2720 < _a2719.length; _i2720++) {
                                    const v_z = _a2719[_i2720];
                                    if (!_g2711.includes(v_z)) _g2711.push(v_z);
                                  }
                                }
                              }
                              const _a2721 = _g2711;
                              for (let _i2722 = 0; _i2722 < _a2721.length; _i2722++) {
                                const v_y = _a2721[_i2722];
                                if (!((!(v_G.includes(v_y)) && (_h2691 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2697.push(v_y);
                              }
                            }
                            const _a2723 = union(v_G, _g2697);
                            for (let _i2724 = 0; _i2724 < _a2723.length; _i2724++) {
                              const v_x = _a2723[_i2724];
                              if (((v_S.includes(v_x)) || (_t2494.includes(v_x)))) {
                                _q2695 = true;
                                break Q2696;
                              }
                            }
                          }
                          _c2725 = _q2695;
                        }
                        if (!(_c2725)) break L2661;
                        const _t2726 = (v_G[0] ?? -1);
                        if (!_g2556.includes(_t2726)) _g2556.push(_t2726);
                      }
                    }
                  }
                }
                L2727: {
                  const v_C = _g2556;
                  const _h2728 = v_C.length;
                  if (!((_h2728 > 0))) break L2727;
                  if ((_h2728 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q2554 = true;
                    break Q2555;
                  }
                }
              }
            }
            _c2729 = _q2554;
          }
          _c2730 = _c2729;
        }
        if (!(_c2730)) break L2471;
        facts.length = 0;
        changed = false;
        let _q2731 = true;
        Q2732: {
          const _a2733 = v_S;
          for (let _i2734 = 0; _i2734 < _a2733.length; _i2734++) {
            const v_x = _a2733[_i2734];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2731 = false;
              break Q2732;
            }
          }
        }
        if (!(_q2731)) return -1;
        if (changed || facts.length > 0) {
          fired = 1;
          if (fire !== null && !fire({ T: v_T, c: v_c, L: v_L, S: v_S }, facts)) return 1;
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
    const _a204 = sp.cells;
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

/** `boatsOf(m)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function boatsOf(_sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = boatsOfKept.board(cl);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g445 = 0;
  G446: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      _g445 += cl.fleet.boats[v_k];
    }
  }
  const _made = _g445;
  _kept[v_m] = _made;
  return _made;
}

const takingKept = keptStore<number>();

/** `taking(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function taking(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = takingKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g448 = 0;
  G449: {
    const _a450 = sp.lines;
    for (let _i451 = 0; _i451 < _a450.length; _i451++) {
      const v_K = _a450[_i451];
      const _a452 = sp.lineCells[v_K];
      for (let _i453 = 0; _i453 < _a452.length; _i453++) {
        const v_d = _a452[_i453];
        let _c458: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c458) {
          let _q454 = false;
          Q455: {
            const _a456 = sp.adj4[v_d];
            for (let _i457 = 0; _i457 < _a456.length; _i457++) {
              const v_p = _a456[_i457];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q454 = true;
                break Q455;
              }
            }
          }
          _c458 = !(_q454);
        }
        let _c481: boolean = _c458;
        if (_c481) {
          const _g459: number[] = [];
          G460: {
            const _a463 = sp.lineCells[v_K];
            for (let _i464 = 0; _i464 < _a463.length; _i464++) {
              const v_x = _a463[_i464];
              if (!(((b.grid[v_x] || -1) !== 2))) continue;
              _g459.push(v_x);
            }
          }
          const _t465 = stretch(sp.lineCells[v_K], v_d, _g459);
          let _g466 = 0;
          G467: {
            const _a468 = _t465;
            for (let _i469 = 0; _i469 < _a468.length; _i469++) {
              const v_c = _a468[_i469];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g466++;
            }
          }
          let _c480: boolean = ((_g466 < _t465.length) && (_t465.length >= v_m));
          if (_c480) {
            let _c479: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c479) {
              const _t470 = sp.lineCells[v_K];
              let _g471 = 0;
              G472: {
                const _a473 = _t470;
                for (let _i474 = 0; _i474 < _a473.length; _i474++) {
                  const v_c = _a473[_i474];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g471++;
                }
              }
              let _g475 = 0;
              G476: {
                const _a477 = _t465;
                for (let _i478 = 0; _i478 < _a477.length; _i478++) {
                  const v_c = _a477[_i478];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g475++;
                }
              }
              _c479 = (((clueAt(cl.n, v_K) - _g471) + _g475) >= v_m);
            }
            _c480 = _c479;
          }
          _c481 = _c480;
        }
        if (!(_c481)) continue;
        _g448++;
      }
    }
  }
  const _made = _g448;
  _kept[v_m] = _made;
  return _made;
}

const parKept = keptStore<readonly number[]>();

/** `par(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function par(sp: GridSpace, v_L: number): readonly number[] {
  const _kept: Kept<readonly number[]> = parKept.board(sp);
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
  let _g686 = -1;
  G687: {
    const _a688 = setOf(v_L);
    for (let _i689 = 0; _i689 < _a688.length; _i689++) {
      const v_K = _a688[_i689];
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
      if (_g686 === -1 || _t724 > _g686) _g686 = _t724;
    }
  }
  const _made = _g686;
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
