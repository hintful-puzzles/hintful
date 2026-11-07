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
  const _g2750: number[] = [];
  const _g2758: number[] = [];
  const _g2851: number[] = [];
  const _g2859: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2726 = true;
  Q2727: {
    const _a2728 = sp.cells;
    for (let _i2729 = 0; _i2729 < _a2728.length; _i2729++) {
      const v_a = _a2728[_i2729];
      const _h2730 = (g[v_a] || -1);
      if (!((_h2730 === 1))) continue;
      let _q2731 = true;
      Q2732: {
        const _a2733 = sp.adj8[v_a];
        for (let _i2734 = 0; _i2734 < _a2733.length; _i2734++) {
          const v_b = _a2733[_i2734];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2735 = (g[v_b] || -1);
          if (!((_h2735 !== 1))) {
            _q2731 = false;
            break Q2732;
          }
        }
      }
      if (!(_q2731)) {
        _q2726 = false;
        break Q2727;
      }
    }
  }
  if (!(_q2726)) return false;
  let _q2736 = true;
  Q2737: {
    const _a2738 = sp.cells;
    for (let _i2739 = 0; _i2739 < _a2738.length; _i2739++) {
      const v_c = _a2738[_i2739];
      const _h2740 = (g[v_c] || -1);
      let _c2743: boolean = (_h2740 === 1);
      if (_c2743) {
        const _t2741 = step(sp, v_c, 1);
        const _h2742 = (g[_t2741] || -1);
        _c2743 = !(((_t2741 !== -1) && (_h2742 === 1)));
      }
      let _c2746: boolean = _c2743;
      if (_c2746) {
        const _t2744 = step(sp, v_c, 3);
        const _h2745 = (g[_t2744] || -1);
        _c2746 = !(((_t2744 !== -1) && (_h2745 === 1)));
      }
      if (!(_c2746)) continue;
      const _h2749 = sp.rowOf[v_c];
      const _h2757 = sp.colOf[v_c];
      let _q2747 = false;
      Q2748: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2750.length = 0;
          G2751: {
            const _a2754 = sp.lineCells[_h2749];
            for (let _i2755 = 0; _i2755 < _a2754.length; _i2755++) {
              const v_x = _a2754[_i2755];
              const _h2756 = (g[v_x] || -1);
              if (!((_h2756 === 1))) continue;
              _g2750.push(v_x);
            }
          }
          _g2758.length = 0;
          G2759: {
            const _a2762 = sp.lineCells[_h2757];
            for (let _i2763 = 0; _i2763 < _a2762.length; _i2763++) {
              const v_x = _a2762[_i2763];
              const _h2764 = (g[v_x] || -1);
              if (!((_h2764 === 1))) continue;
              _g2758.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2749], v_c, _g2750), stretch(sp.lineCells[_h2757], v_c, _g2758)).length)) {
            _q2747 = true;
            break Q2748;
          }
        }
      }
      if (!(_q2747)) {
        _q2736 = false;
        break Q2737;
      }
    }
  }
  if (!(_q2736)) return false;
  let _q2765 = true;
  Q2766: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2765 = false;
          break Q2766;
        }
      }
    }
  }
  if (!(_q2765)) return false;
  let _g2767 = 0;
  G2768: {
    const _a2769 = sp.cells;
    for (let _i2770 = 0; _i2770 < _a2769.length; _i2770++) {
      const v_c = _a2769[_i2770];
      const _h2771 = (g[v_c] || -1);
      if (!((_h2771 === 1))) continue;
      _g2767++;
    }
  }
  let _g2772 = 0;
  G2773: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2772 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2767 === _g2772))) return false;
  for (let _k2774 = 0; _k2774 < cl.n.at.length; _k2774++) {
    const _at2775 = cl.n.at[_k2774];
    const _v2776 = cl.n.v[_k2774];
    const _t2777 = sp.lineCells[_at2775];
    let _g2778 = 0;
    G2779: {
      const _a2780 = _t2777;
      for (let _i2781 = 0; _i2781 < _a2780.length; _i2781++) {
        const v_c = _a2780[_i2781];
        const _h2782 = (g[v_c] || -1);
        if (!((_h2782 === 1))) continue;
        _g2778++;
      }
    }
    if (!((_g2778 === _v2776))) return false;
  }
  for (let _k2783 = 0; _k2783 < cl.seg.at.length; _k2783++) {
    const _at2784 = cl.seg.at[_k2783];
    const _v2785 = cl.seg.v[_k2783];
    let _c2835: boolean = ((_v2785 === 2) && ((g[_at2784] || -1) === 2));
    if (!_c2835) {
      let _c2834: boolean = ((_v2785 > 2) && ((g[_at2784] || -1) === 1));
      if (_c2834) {
        let _c2792: boolean = (_v2785 === 3);
        if (!_c2792) {
          let _c2788: boolean = (_v2785 === 4);
          if (_c2788) {
            const _t2786 = step(sp, _at2784, 2);
            const _h2787 = (g[_t2786] || -1);
            _c2788 = ((_t2786 !== -1) && (_h2787 === 1));
          }
          let _c2791: boolean = _c2788;
          if (_c2791) {
            const _t2789 = step(sp, _at2784, 1);
            const _h2790 = (g[_t2789] || -1);
            _c2791 = !(((_t2789 !== -1) && (_h2790 === 1)));
          }
          _c2792 = _c2791;
        }
        let _c2799: boolean = _c2792;
        if (!_c2799) {
          let _c2795: boolean = (_v2785 === 5);
          if (_c2795) {
            const _t2793 = step(sp, _at2784, 1);
            const _h2794 = (g[_t2793] || -1);
            _c2795 = ((_t2793 !== -1) && (_h2794 === 1));
          }
          let _c2798: boolean = _c2795;
          if (_c2798) {
            const _t2796 = step(sp, _at2784, 2);
            const _h2797 = (g[_t2796] || -1);
            _c2798 = !(((_t2796 !== -1) && (_h2797 === 1)));
          }
          _c2799 = _c2798;
        }
        let _c2812: boolean = _c2799;
        if (!_c2812) {
          let _c2811: boolean = (_v2785 === 6);
          if (_c2811) {
            const _t2800 = step(sp, _at2784, 1);
            const _h2801 = (g[_t2800] || -1);
            let _c2804: boolean = ((_t2800 !== -1) && (_h2801 === 1));
            if (_c2804) {
              const _t2802 = step(sp, _at2784, 2);
              const _h2803 = (g[_t2802] || -1);
              _c2804 = ((_t2802 !== -1) && (_h2803 === 1));
            }
            let _c2810: boolean = _c2804;
            if (!_c2810) {
              const _t2805 = step(sp, _at2784, 3);
              const _h2806 = (g[_t2805] || -1);
              let _c2809: boolean = ((_t2805 !== -1) && (_h2806 === 1));
              if (_c2809) {
                const _t2807 = step(sp, _at2784, 4);
                const _h2808 = (g[_t2807] || -1);
                _c2809 = ((_t2807 !== -1) && (_h2808 === 1));
              }
              _c2810 = _c2809;
            }
            _c2811 = _c2810;
          }
          _c2812 = _c2811;
        }
        let _c2819: boolean = _c2812;
        if (!_c2819) {
          let _c2815: boolean = (_v2785 === 7);
          if (_c2815) {
            const _t2813 = step(sp, _at2784, 4);
            const _h2814 = (g[_t2813] || -1);
            _c2815 = ((_t2813 !== -1) && (_h2814 === 1));
          }
          let _c2818: boolean = _c2815;
          if (_c2818) {
            const _t2816 = step(sp, _at2784, 3);
            const _h2817 = (g[_t2816] || -1);
            _c2818 = !(((_t2816 !== -1) && (_h2817 === 1)));
          }
          _c2819 = _c2818;
        }
        let _c2826: boolean = _c2819;
        if (!_c2826) {
          let _c2822: boolean = (_v2785 === 8);
          if (_c2822) {
            const _t2820 = step(sp, _at2784, 3);
            const _h2821 = (g[_t2820] || -1);
            _c2822 = ((_t2820 !== -1) && (_h2821 === 1));
          }
          let _c2825: boolean = _c2822;
          if (_c2825) {
            const _t2823 = step(sp, _at2784, 4);
            const _h2824 = (g[_t2823] || -1);
            _c2825 = !(((_t2823 !== -1) && (_h2824 === 1)));
          }
          _c2826 = _c2825;
        }
        let _c2833: boolean = _c2826;
        if (!_c2833) {
          let _c2832: boolean = (_v2785 === 9);
          if (_c2832) {
            let _q2827 = false;
            Q2828: {
              const _a2829 = sp.adj4[_at2784];
              for (let _i2830 = 0; _i2830 < _a2829.length; _i2830++) {
                const v_x = _a2829[_i2830];
                const _h2831 = (g[v_x] || -1);
                if ((_h2831 === 1)) {
                  _q2827 = true;
                  break Q2828;
                }
              }
            }
            _c2832 = !(_q2827);
          }
          _c2833 = _c2832;
        }
        _c2834 = _c2833;
      }
      _c2835 = _c2834;
    }
    if (!(_c2835)) return false;
  }
  for (let _k2836 = 0; _k2836 < cl.fleet.n; _k2836++) {
    let _g2839 = 0;
    G2840: {
      const _a2841 = sp.cells;
      for (let _i2842 = 0; _i2842 < _a2841.length; _i2842++) {
        const v_c = _a2841[_i2842];
        const _h2843 = (g[v_c] || -1);
        let _c2846: boolean = (_h2843 === 1);
        if (_c2846) {
          const _t2844 = step(sp, v_c, 1);
          const _h2845 = (g[_t2844] || -1);
          _c2846 = !(((_t2844 !== -1) && (_h2845 === 1)));
        }
        let _c2849: boolean = _c2846;
        if (_c2849) {
          const _t2847 = step(sp, v_c, 3);
          const _h2848 = (g[_t2847] || -1);
          _c2849 = !(((_t2847 !== -1) && (_h2848 === 1)));
        }
        let _c2866: boolean = _c2849;
        if (_c2866) {
          const _t2850 = sp.rowOf[v_c];
          _g2851.length = 0;
          G2852: {
            const _a2855 = sp.lineCells[_t2850];
            for (let _i2856 = 0; _i2856 < _a2855.length; _i2856++) {
              const v_x = _a2855[_i2856];
              const _h2857 = (g[v_x] || -1);
              if (!((_h2857 === 1))) continue;
              _g2851.push(v_x);
            }
          }
          const _t2858 = sp.colOf[v_c];
          _g2859.length = 0;
          G2860: {
            const _a2863 = sp.lineCells[_t2858];
            for (let _i2864 = 0; _i2864 < _a2863.length; _i2864++) {
              const v_x = _a2863[_i2864];
              const _h2865 = (g[v_x] || -1);
              if (!((_h2865 === 1))) continue;
              _g2859.push(v_x);
            }
          }
          _c2866 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2851), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2859)).length === cl.fleet.length[_k2836]);
        }
        if (!(_c2866)) continue;
        _g2839++;
      }
    }
    if (!((_g2839 === cl.fleet.boats[_k2836]))) return false;
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
        const _h530 = (v_m > 1);
        let _g523 = 0;
        G524: {
          for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
            if (!((cl.fleet.length[v_k] === v_m))) continue;
            _g523 += cl.fleet.boats[v_k];
          }
        }
        L525: {
          const v_b = (_g523 - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L525;
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
  const _g566: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a559 = cluesValued(cl.seg, 6);
  for (let _i560 = 0; _i560 < _a559.length; _i560++) {
    const v_c = _a559[_i560];
    const _h561 = clueAt(cl.seg, v_c);
    if (!((_h561 === 6))) continue;
    const _a562 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i563 = 0; _i563 < _a562.length; _i563++) {
      const v_L = _a562[_i563];
      const _h564 = clueAt(cl.n, v_L);
      L565: {
        const v_v = _h564;
        if (!((v_v >= 0))) break L565;
        _g566.length = 0;
        G567: {
          const _a570 = sp.adj4[v_c];
          for (let _i571 = 0; _i571 < _a570.length; _i571++) {
            const v_x = _a570[_i571];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g566.push(v_x);
          }
        }
        L572: {
          const v_S = _g566;
          const _h573 = v_S.length;
          let _c583: boolean = (_h573 === 2);
          if (_c583) {
            const _t574 = sp.lineCells[v_L];
            let _g575 = 0;
            G576: {
              const _a577 = _t574;
              for (let _i578 = 0; _i578 < _a577.length; _i578++) {
                const v_c = _a577[_i578];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g575++;
              }
            }
            let _g579 = 0;
            G580: {
              const _a581 = v_S;
              for (let _i582 = 0; _i582 < _a581.length; _i582++) {
                const v_x = _a581[_i582];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g579++;
              }
            }
            _c583 = ((v_v - _g575) < _g579);
          }
          if (!(_c583)) break L572;
          facts.length = 0;
          changed = false;
          let _q584 = true;
          Q585: {
            const _a586 = v_S;
            for (let _i587 = 0; _i587 < _a586.length; _i587++) {
              const v_x = _a586[_i587];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q584 = false;
                break Q585;
              }
            }
          }
          if (!(_q584)) return -1;
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
  const _g622: number[] = [];
  const _g629: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  let _g612 = -1;
  G613: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t614 = cl.fleet.length[v_k];
      if (_g612 === -1 || _t614 > _g612) _g612 = _t614;
    }
  }
  const v_M = _g612;
  const _a615 = sp.cells;
  for (let _i616 = 0; _i616 < _a615.length; _i616++) {
    const v_c = _a615[_i616];
    let _c635: boolean = !((b.grid[v_c] !== 0));
    if (_c635) {
      let _g617 = 0;
      G618: {
        const _a619 = sp.adj4[v_c];
        for (let _i620 = 0; _i620 < _a619.length; _i620++) {
          const v_a = _a619[_i620];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t621 = sp.rowOf[v_a];
          _g622.length = 0;
          G623: {
            const _a626 = sp.lineCells[_t621];
            for (let _i627 = 0; _i627 < _a626.length; _i627++) {
              const v_x = _a626[_i627];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g622.push(v_x);
            }
          }
          const _t628 = sp.colOf[v_a];
          _g629.length = 0;
          G630: {
            const _a633 = sp.lineCells[_t628];
            for (let _i634 = 0; _i634 < _a633.length; _i634++) {
              const v_x = _a633[_i634];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g629.push(v_x);
            }
          }
          _g617 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g622), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g629)).length;
        }
      }
      _c635 = ((1 + _g617) > v_M);
    }
    if (!(_c635)) continue;
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
  const _g658: number[] = [];
  const _g666: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a654 = sp.lines;
  for (let _i655 = 0; _i655 < _a654.length; _i655++) {
    const v_L = _a654[_i655];
    const _a656 = sp.lineCells[v_L];
    for (let _i657 = 0; _i657 < _a656.length; _i657++) {
      const v_c = _a656[_i657];
      _g658.length = 0;
      G659: {
        const _a662 = sp.lineCells[v_L];
        for (let _i663 = 0; _i663 < _a662.length; _i663++) {
          const v_x = _a662[_i663];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g658.push(v_x);
        }
      }
      L664: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g658);
        const _h665 = v_R.length;
        if (!(((_h665 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L664;
        _g666.length = 0;
        G667: {
          const _a670 = v_R;
          for (let _i671 = 0; _i671 < _a670.length; _i671++) {
            const v_c = _a670[_i671];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g666.push(v_c);
          }
        }
        L672: {
          const v_O = _g666;
          const _h673 = v_O.length;
          if (!(((_h673 === 1) && full(b, sp, cl, _h665)))) break L672;
          facts.length = 0;
          changed = false;
          let _q674 = true;
          Q675: {
            const _a676 = v_O;
            for (let _i677 = 0; _i677 < _a676.length; _i677++) {
              const v_x = _a676[_i677];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q674 = false;
                break Q675;
              }
            }
          }
          if (!(_q674)) return -1;
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
  const _g749: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a745 = sp.lines;
  for (let _i746 = 0; _i746 < _a745.length; _i746++) {
    const v_L = _a745[_i746];
    const _h747 = clueAt(cl.n, v_L);
    if (!((_h747 < 0))) continue;
    const _t748 = sp.lineCells[v_L];
    _g749.length = 0;
    G750: {
      const _a753 = _t748;
      for (let _i754 = 0; _i754 < _a753.length; _i754++) {
        const v_c = _a753[_i754];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g749.push(v_c);
      }
    }
    L755: {
      const v_O = _g749;
      const _h756 = v_O.length;
      if (!((_h756 > 0))) break L755;
      L757: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L757;
        const _t758 = sp.lineCells[v_L];
        let _g759 = 0;
        G760: {
          const _a761 = _t758;
          for (let _i762 = 0; _i762 < _a761.length; _i762++) {
            const v_c = _a761[_i762];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g759++;
          }
        }
        const v_left = (v_v - _g759);
        facts.length = 0;
        changed = false;
        let _c768: boolean = ((v_left >= 0) && (v_left <= _h756));
        if (_c768) {
          let _c767: boolean = !((v_left === 0));
          if (!_c767) {
            let _q763 = true;
            Q764: {
              const _a765 = v_O;
              for (let _i766 = 0; _i766 < _a765.length; _i766++) {
                const v_c = _a765[_i766];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q763 = false;
                  break Q764;
                }
              }
            }
            _c767 = _q763;
          }
          _c768 = _c767;
        }
        let _c774: boolean = _c768;
        if (_c774) {
          let _c773: boolean = !((v_left === _h756));
          if (!_c773) {
            let _q769 = true;
            Q770: {
              const _a771 = v_O;
              for (let _i772 = 0; _i772 < _a771.length; _i772++) {
                const v_c = _a771[_i772];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q769 = false;
                  break Q770;
                }
              }
            }
            _c773 = _q769;
          }
          _c774 = _c773;
        }
        if (!(_c774)) return -1;
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
  const _g874: number[] = [];
  const _g905: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  let _g858 = -1;
  G859: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t860 = cl.fleet.length[v_k];
      if (_g858 === -1 || _t860 > _g858) _g858 = _t860;
    }
  }
  L861: {
    const v_m = _g858;
    if (!((v_m > 0))) break L861;
    const _h904 = (2 * v_m);
    const _a862 = sp.lines;
    for (let _i863 = 0; _i863 < _a862.length; _i863++) {
      const v_L = _a862[_i863];
      const _h890 = clueAt(cl.n, v_L);
      const _h891 = (_h890 < 0);
      const _a864 = sp.lineCells[v_L];
      for (let _i865 = 0; _i865 < _a864.length; _i865++) {
        const v_c = _a864[_i865];
        const _h870 = (v_c % sp.w);
        const _h871 = ((v_c / sp.w) | 0);
        const _h872 = (_h870 + _h871);
        let _c873: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c873) {
          let _q866 = false;
          Q867: {
            const _a868 = sp.adj4[v_c];
            for (let _i869 = 0; _i869 < _a868.length; _i869++) {
              const v_p = _a868[_i869];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h872)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q866 = true;
                break Q867;
              }
            }
          }
          _c873 = !(_q866);
        }
        if (!(_c873)) continue;
        _g874.length = 0;
        G875: {
          const _a878 = sp.lineCells[v_L];
          for (let _i879 = 0; _i879 < _a878.length; _i879++) {
            const v_x = _a878[_i879];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g874.push(v_x);
          }
        }
        L880: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g874);
          const _h885 = v_R.length;
          let _g881 = 0;
          G882: {
            const _a883 = v_R;
            for (let _i884 = 0; _i884 < _a883.length; _i884++) {
              const v_c = _a883[_i884];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g881++;
            }
          }
          let _c903: boolean = (_g881 < _h885);
          if (_c903) {
            let _g886 = 0;
            G887: {
              const _a888 = v_R;
              for (let _i889 = 0; _i889 < _a888.length; _i889++) {
                const v_c = _a888[_i889];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g886++;
              }
            }
            let _c902: boolean = ((_g886 < _h885) && (_h885 >= v_m));
            if (_c902) {
              let _c901: boolean = _h891;
              if (!_c901) {
                const _t892 = sp.lineCells[v_L];
                let _g893 = 0;
                G894: {
                  const _a895 = _t892;
                  for (let _i896 = 0; _i896 < _a895.length; _i896++) {
                    const v_c = _a895[_i896];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g893++;
                  }
                }
                let _g897 = 0;
                G898: {
                  const _a899 = v_R;
                  for (let _i900 = 0; _i900 < _a899.length; _i900++) {
                    const v_c = _a899[_i900];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g897++;
                  }
                }
                _c901 = (((_h890 - _g893) + _g897) >= v_m);
              }
              _c902 = _c901;
            }
            _c903 = _c902;
          }
          if (!((_c903 && (_h885 < _h904)))) break L880;
          const _h911 = (_h885 - v_m);
          _g905.length = 0;
          G906: {
            const _a909 = v_R;
            for (let _i910 = 0; _i910 < _a909.length; _i910++) {
              const v_x = _a909[_i910];
              if (!(((_i910 >= _h911) && (_i910 < v_m)))) continue;
              _g905.push(v_x);
            }
          }
          L912: {
            const v_C = _g905;
            const _h913 = v_C.length;
            if (!((_h913 > 0))) break L912;
            const _h921 = (_h913 > 1);
            let _g914 = 0;
            G915: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.length[v_k] === v_m))) continue;
                _g914 += cl.fleet.boats[v_k];
              }
            }
            const v_b = (_g914 - done(b, sp, v_m));
            L916: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L916;
              facts.length = 0;
              changed = false;
              let _q917 = true;
              Q918: {
                const _a919 = v_C;
                for (let _i920 = 0; _i920 < _a919.length; _i920++) {
                  const v_x = _a919[_i920];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c927: boolean = true;
                  if (_c927) {
                    let _c926: boolean = _h921;
                    if (!_c926) {
                      let _q922 = true;
                      Q923: {
                        const _a924 = sp.adj4[v_x];
                        for (let _i925 = 0; _i925 < _a924.length; _i925++) {
                          const v_y = _a924[_i925];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q922 = false;
                            break Q923;
                          }
                        }
                      }
                      _c926 = _q922;
                    }
                    _c927 = _c926;
                  }
                  if (!(_c927)) {
                    _q917 = false;
                    break Q918;
                  }
                }
              }
              if (!(_q917)) return -1;
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
  const _a958 = sp.lines;
  for (let _i959 = 0; _i959 < _a958.length; _i959++) {
    const v_L = _a958[_i959];
    L960: {
      const v_v = num(b, sp, cl, v_L);
      if (!((v_v >= 0))) break L960;
      let _g961 = 0;
      G962: {
        const _a963 = sp.lineCells[v_L];
        for (let _i964 = 0; _i964 < _a963.length; _i964++) {
          const v_c = _a963[_i964];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g961++;
        }
      }
      L965: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g961);
        if (!(((v_t === 1) || (v_t === 2)))) break L965;
        const _a966 = sp.lineCells[v_L];
        for (let _i967 = 0; _i967 < _a966.length; _i967++) {
          const v_k = _a966[_i967];
          let _g968 = -1;
          let _n970 = 0;
          G969: {
            const _a971 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i972 = 0; _i972 < _a971.length; _i972++) {
              const v_M = _a971[_i972];
              if (!((v_M !== v_L))) continue;
              if (++_n970 === 2) {
                _g968 = -1;
                break G969;
              }
              _g968 = v_M;
            }
          }
          const v_K = _g968;
          const v_j = num(b, sp, cl, v_K);
          const _h981 = (v_j >= 0);
          let _g973 = 0;
          G974: {
            const _a975 = sp.adj4[v_k];
            for (let _i976 = 0; _i976 < _a975.length; _i976++) {
              const v_x = _a975[_i976];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g973++;
            }
          }
          let _g977 = 0;
          G978: {
            const _a979 = setOf(v_k);
            for (let _i980 = 0; _i980 < _a979.length; _i980++) {
              const v_x = _a979[_i980];
              let _c987: boolean = (!((b.grid[v_x] !== 0)) && _h981);
              if (_c987) {
                const _t982 = sp.lineCells[v_K];
                let _g983 = 0;
                G984: {
                  const _a985 = _t982;
                  for (let _i986 = 0; _i986 < _a985.length; _i986++) {
                    const v_c = _a985[_i986];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g983++;
                  }
                }
                _c987 = ((v_j - _g983) === 1);
              }
              if (!(_c987)) continue;
              _g977++;
            }
          }
          L988: {
            const v_s = (_g973 + _g977);
            if (!((v_s > v_t))) break L988;
            facts.length = 0;
            changed = false;
            let _q989 = true;
            Q990: {
              const _a991 = sp.adj4[v_k];
              for (let _i992 = 0; _i992 < _a991.length; _i992++) {
                const v_y = _a991[_i992];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q989 = false;
                  break Q990;
                }
              }
            }
            if (!(_q989)) return -1;
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
  const _g1307: number[] = [];
  const _g1313: number[] = [];
  const _g1323: number[] = [];
  const _g1336: number[] = [];
  const _g1355: number[] = [];
  const _g1398: number[] = [];
  const _g1407: number[] = [];
  const _g1492: number[] = [];
  const _g1506: number[] = [];
  const _g1516: number[] = [];
  const _g1530: number[] = [];
  const _g1548: number[] = [];
  const _g1562: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g1285 = -1;
  G1286: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1287 = cl.fleet.length[v_k];
      if (_g1285 === -1 || _t1287 > _g1285) _g1285 = _t1287;
    }
  }
  const v_T = _g1285;
  const _a1288 = sp.lines;
  for (let _i1289 = 0; _i1289 < _a1288.length; _i1289++) {
    const v_L = _a1288[_i1289];
    L1290: {
      const v_v = num(b, sp, cl, v_L);
      let _c1295: boolean = (v_v >= 0);
      if (_c1295) {
        let _g1291 = 0;
        G1292: {
          const _a1293 = sp.lineCells[v_L];
          for (let _i1294 = 0; _i1294 < _a1293.length; _i1294++) {
            const v_c = _a1293[_i1294];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1291++;
          }
        }
        _c1295 = (((sp.lineCells[v_L].length - v_v) - _g1291) === 1);
      }
      if (!(_c1295)) break L1290;
      const _a1296 = sp.lineCells[v_L];
      for (let _i1297 = 0; _i1297 < _a1296.length; _i1297++) {
        const v_c = _a1296[_i1297];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1298 = -1;
        let _n1300 = 0;
        G1299: {
          const _a1301 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1302 = 0; _i1302 < _a1301.length; _i1302++) {
            const v_M = _a1301[_i1302];
            if (!((v_M !== v_L))) continue;
            if (++_n1300 === 2) {
              _g1298 = -1;
              break G1299;
            }
            _g1298 = v_M;
          }
        }
        const v_K = _g1298;
        const v_j = num(b, sp, cl, v_K);
        const _h1331 = (v_j >= 0);
        let _g1303 = 0;
        G1304: {
          const _a1305 = sp.lineCells[v_K];
          for (let _i1306 = 0; _i1306 < _a1305.length; _i1306++) {
            const v_c = _a1305[_i1306];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1303++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1303);
        const _h1332 = (v_t === 1);
        const _h1333 = (_h1331 && _h1332);
        _g1307.length = 0;
        G1308: {
          const _a1311 = sp.lineCells[v_L];
          for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
            const v_x = _a1311[_i1312];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1307.push(v_x);
          }
        }
        _g1313.length = 0;
        G1314: {
          _g1323.length = 0;
          G1324: {
            const _a1327 = sp.lineCells[v_K];
            for (let _i1328 = 0; _i1328 < _a1327.length; _i1328++) {
              const v_x = _a1327[_i1328];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1323.push(v_x);
            }
          }
          const _a1329 = _g1323;
          for (let _i1330 = 0; _i1330 < _a1329.length; _i1330++) {
            const v_x = _a1329[_i1330];
            if (!(_h1333)) continue;
            _g1313.push(v_x);
          }
        }
        L1334: {
          const v_H = union(_g1307, _g1313);
          const _t1335 = setOf(v_c);
          _g1336.length = 0;
          G1337: {
            const _a1342 = v_H;
            for (let _i1343 = 0; _i1343 < _a1342.length; _i1343++) {
              const v_a = _a1342[_i1343];
              const _a1344 = sp.adj8[v_a];
              for (let _i1345 = 0; _i1345 < _a1344.length; _i1345++) {
                const v_d = _a1344[_i1345];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1336.includes(v_d)) _g1336.push(v_d);
              }
            }
          }
          const _t1346 = union(_t1335, _g1336);
          let _q1347 = false;
          Q1348: {
            const _a1349 = v_H;
            for (let _i1350 = 0; _i1350 < _a1349.length; _i1350++) {
              const v_a = _a1349[_i1350];
              const _a1351 = sp.adj8[v_a];
              for (let _i1352 = 0; _i1352 < _a1351.length; _i1352++) {
                const v_b = _a1351[_i1352];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1347 = true;
                  break Q1348;
                }
              }
            }
          }
          let _c1377: boolean = _q1347;
          if (!_c1377) {
            let _q1353 = false;
            Q1354: {
              _g1355.length = 0;
              G1356: {
                const _a1361 = union(v_H, _t1346);
                for (let _i1362 = 0; _i1362 < _a1361.length; _i1362++) {
                  const v_a = _a1361[_i1362];
                  const _a1363 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1364 = 0; _i1364 < _a1363.length; _i1364++) {
                    const v_M = _a1363[_i1364];
                    if (!_g1355.includes(v_M)) _g1355.push(v_M);
                  }
                }
              }
              const _a1365 = _g1355;
              for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
                const v_L = _a1365[_i1366];
                L1367: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L1367;
                  let _g1368 = 0;
                  G1369: {
                    const _a1370 = sp.lineCells[v_L];
                    for (let _i1371 = 0; _i1371 < _a1370.length; _i1371++) {
                      const v_x = _a1370[_i1371];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1368++;
                    }
                  }
                  let _c1376: boolean = (_g1368 > v_v);
                  if (!_c1376) {
                    let _g1372 = 0;
                    G1373: {
                      const _a1374 = sp.lineCells[v_L];
                      for (let _i1375 = 0; _i1375 < _a1374.length; _i1375++) {
                        const v_x = _a1374[_i1375];
                        if (!((!(_t1346.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1372++;
                      }
                    }
                    _c1376 = (_g1372 < v_v);
                  }
                  if (_c1376) {
                    _q1353 = true;
                    break Q1354;
                  }
                }
              }
            }
            _c1377 = _q1353;
          }
          let _c1384: boolean = _c1377;
          if (!_c1384) {
            let _g1378 = 0;
            G1379: {
              const _a1380 = sp.cells;
              for (let _i1381 = 0; _i1381 < _a1380.length; _i1381++) {
                const v_x = _a1380[_i1381];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1378++;
              }
            }
            let _g1382 = 0;
            G1383: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1382 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1384 = (_g1378 > _g1382);
          }
          let _c1391: boolean = _c1384;
          if (!_c1391) {
            let _g1385 = 0;
            G1386: {
              const _a1387 = sp.cells;
              for (let _i1388 = 0; _i1388 < _a1387.length; _i1388++) {
                const v_x = _a1387[_i1388];
                if (!((!(_t1346.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1385++;
              }
            }
            let _g1389 = 0;
            G1390: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1389 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1391 = (_g1385 < _g1389);
          }
          let _c1404: boolean = _c1391;
          if (!_c1404) {
            let _q1392 = false;
            Q1393: {
              const _a1394 = v_H;
              for (let _i1395 = 0; _i1395 < _a1394.length; _i1395++) {
                const v_a = _a1394[_i1395];
                const _a1396 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i1397 = 0; _i1397 < _a1396.length; _i1397++) {
                  const v_L = _a1396[_i1397];
                  _g1398.length = 0;
                  G1399: {
                    const _a1402 = sp.lineCells[v_L];
                    for (let _i1403 = 0; _i1403 < _a1402.length; _i1403++) {
                      const v_x = _a1402[_i1403];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1398.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1398).length > v_T)) {
                    _q1392 = true;
                    break Q1393;
                  }
                }
              }
            }
            _c1404 = _q1392;
          }
          let _c1582: boolean = _c1404;
          if (!_c1582) {
            let _q1405 = false;
            Q1406: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1407.length = 0;
                G1408: {
                  _g1492.length = 0;
                  G1493: {
                    const _a1498 = union(v_H, _t1346);
                    for (let _i1499 = 0; _i1499 < _a1498.length; _i1499++) {
                      const v_x = _a1498[_i1499];
                      const _a1500 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1501 = 0; _i1501 < _a1500.length; _i1501++) {
                        const v_y = _a1500[_i1501];
                        if (!_g1492.includes(v_y)) _g1492.push(v_y);
                      }
                    }
                  }
                  const _a1502 = _g1492;
                  for (let _i1503 = 0; _i1503 < _a1502.length; _i1503++) {
                    const v_a = _a1502[_i1503];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a1504 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i1505 = 0; _i1505 < _a1504.length; _i1505++) {
                      const v_L = _a1504[_i1505];
                      _g1506.length = 0;
                      G1507: {
                        const _a1510 = sp.lineCells[v_L];
                        for (let _i1511 = 0; _i1511 < _a1510.length; _i1511++) {
                          const v_x = _a1510[_i1511];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1506.push(v_x);
                        }
                      }
                      L1512: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1506);
                        const _h1513 = v_G.length;
                        const _h1542 = (_h1513 === 1);
                        let _c1545: boolean = (_h1513 === v_m);
                        if (_c1545) {
                          let _q1514 = true;
                          Q1515: {
                            _g1516.length = 0;
                            G1517: {
                              _g1530.length = 0;
                              G1531: {
                                const _a1536 = v_G;
                                for (let _i1537 = 0; _i1537 < _a1536.length; _i1537++) {
                                  const v_g = _a1536[_i1537];
                                  const _a1538 = sp.adj4[v_g];
                                  for (let _i1539 = 0; _i1539 < _a1538.length; _i1539++) {
                                    const v_z = _a1538[_i1539];
                                    if (!_g1530.includes(v_z)) _g1530.push(v_z);
                                  }
                                }
                              }
                              const _a1540 = _g1530;
                              for (let _i1541 = 0; _i1541 < _a1540.length; _i1541++) {
                                const v_y = _a1540[_i1541];
                                if (!((!(v_G.includes(v_y)) && (_h1542 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1516.push(v_y);
                              }
                            }
                            const _a1543 = _g1516;
                            for (let _i1544 = 0; _i1544 < _a1543.length; _i1544++) {
                              const v_y = _a1543[_i1544];
                              if (!(((_t1346.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1514 = false;
                                break Q1515;
                              }
                            }
                          }
                          _c1545 = _q1514;
                        }
                        let _c1576: boolean = _c1545;
                        if (_c1576) {
                          let _q1546 = false;
                          Q1547: {
                            _g1548.length = 0;
                            G1549: {
                              _g1562.length = 0;
                              G1563: {
                                const _a1568 = v_G;
                                for (let _i1569 = 0; _i1569 < _a1568.length; _i1569++) {
                                  const v_g = _a1568[_i1569];
                                  const _a1570 = sp.adj4[v_g];
                                  for (let _i1571 = 0; _i1571 < _a1570.length; _i1571++) {
                                    const v_z = _a1570[_i1571];
                                    if (!_g1562.includes(v_z)) _g1562.push(v_z);
                                  }
                                }
                              }
                              const _a1572 = _g1562;
                              for (let _i1573 = 0; _i1573 < _a1572.length; _i1573++) {
                                const v_y = _a1572[_i1573];
                                if (!((!(v_G.includes(v_y)) && (_h1542 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1548.push(v_y);
                              }
                            }
                            const _a1574 = union(v_G, _g1548);
                            for (let _i1575 = 0; _i1575 < _a1574.length; _i1575++) {
                              const v_x = _a1574[_i1575];
                              if (((v_H.includes(v_x)) || (_t1346.includes(v_x)))) {
                                _q1546 = true;
                                break Q1547;
                              }
                            }
                          }
                          _c1576 = _q1546;
                        }
                        if (!(_c1576)) break L1512;
                        const _t1577 = (v_G[0] ?? -1);
                        if (!_g1407.includes(_t1577)) _g1407.push(_t1577);
                      }
                    }
                  }
                }
                L1578: {
                  const v_C = _g1407;
                  const _h1579 = v_C.length;
                  if (!((_h1579 > 0))) break L1578;
                  let _g1580 = 0;
                  G1581: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g1580 += cl.fleet.boats[v_k];
                    }
                  }
                  if ((_h1579 > (_g1580 - done(b, sp, v_m)))) {
                    _q1405 = true;
                    break Q1406;
                  }
                }
              }
            }
            _c1582 = _q1405;
          }
          if (!(_c1582)) break L1334;
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
  const _g1901: number[] = [];
  const _g1907: number[] = [];
  const _g1917: number[] = [];
  const _g1930: number[] = [];
  const _g1949: number[] = [];
  const _g1992: number[] = [];
  const _g2001: number[] = [];
  const _g2086: number[] = [];
  const _g2100: number[] = [];
  const _g2110: number[] = [];
  const _g2124: number[] = [];
  const _g2142: number[] = [];
  const _g2156: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g1877 = -1;
  G1878: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1879 = cl.fleet.length[v_k];
      if (_g1877 === -1 || _t1879 > _g1877) _g1877 = _t1879;
    }
  }
  const v_T = _g1877;
  const _a1880 = sp.lines;
  for (let _i1881 = 0; _i1881 < _a1880.length; _i1881++) {
    const v_L = _a1880[_i1881];
    L1882: {
      const v_v = num(b, sp, cl, v_L);
      let _c1888: boolean = (v_v >= 0);
      if (_c1888) {
        const _t1883 = sp.lineCells[v_L];
        let _g1884 = 0;
        G1885: {
          const _a1886 = _t1883;
          for (let _i1887 = 0; _i1887 < _a1886.length; _i1887++) {
            const v_c = _a1886[_i1887];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1884++;
          }
        }
        _c1888 = ((v_v - _g1884) === 1);
      }
      if (!(_c1888)) break L1882;
      const _a1889 = sp.lineCells[v_L];
      for (let _i1890 = 0; _i1890 < _a1889.length; _i1890++) {
        const v_c = _a1889[_i1890];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1891 = -1;
        let _n1893 = 0;
        G1892: {
          const _a1894 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1895 = 0; _i1895 < _a1894.length; _i1895++) {
            const v_M = _a1894[_i1895];
            if (!((v_M !== v_L))) continue;
            if (++_n1893 === 2) {
              _g1891 = -1;
              break G1892;
            }
            _g1891 = v_M;
          }
        }
        const v_K = _g1891;
        const v_j = num(b, sp, cl, v_K);
        const _h1925 = (v_j >= 0);
        const _t1896 = sp.lineCells[v_K];
        let _g1897 = 0;
        G1898: {
          const _a1899 = _t1896;
          for (let _i1900 = 0; _i1900 < _a1899.length; _i1900++) {
            const v_c = _a1899[_i1900];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1897++;
          }
        }
        const v_u = (v_j - _g1897);
        const _h1926 = (v_u === 1);
        const _h1927 = (_h1925 && _h1926);
        _g1901.length = 0;
        G1902: {
          const _a1905 = sp.lineCells[v_L];
          for (let _i1906 = 0; _i1906 < _a1905.length; _i1906++) {
            const v_x = _a1905[_i1906];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1901.push(v_x);
          }
        }
        _g1907.length = 0;
        G1908: {
          _g1917.length = 0;
          G1918: {
            const _a1921 = sp.lineCells[v_K];
            for (let _i1922 = 0; _i1922 < _a1921.length; _i1922++) {
              const v_x = _a1921[_i1922];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1917.push(v_x);
            }
          }
          const _a1923 = _g1917;
          for (let _i1924 = 0; _i1924 < _a1923.length; _i1924++) {
            const v_x = _a1923[_i1924];
            if (!(_h1927)) continue;
            _g1907.push(v_x);
          }
        }
        L1928: {
          const v_W = union(_g1901, _g1907);
          const _t1929 = setOf(v_c);
          _g1930.length = 0;
          G1931: {
            const _a1936 = _t1929;
            for (let _i1937 = 0; _i1937 < _a1936.length; _i1937++) {
              const v_a = _a1936[_i1937];
              const _a1938 = sp.adj8[v_a];
              for (let _i1939 = 0; _i1939 < _a1938.length; _i1939++) {
                const v_d = _a1938[_i1939];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1930.includes(v_d)) _g1930.push(v_d);
              }
            }
          }
          const _t1940 = union(v_W, _g1930);
          let _q1941 = false;
          Q1942: {
            const _a1943 = _t1929;
            for (let _i1944 = 0; _i1944 < _a1943.length; _i1944++) {
              const v_a = _a1943[_i1944];
              const _a1945 = sp.adj8[v_a];
              for (let _i1946 = 0; _i1946 < _a1945.length; _i1946++) {
                const v_b = _a1945[_i1946];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1929.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1941 = true;
                  break Q1942;
                }
              }
            }
          }
          let _c1971: boolean = _q1941;
          if (!_c1971) {
            let _q1947 = false;
            Q1948: {
              _g1949.length = 0;
              G1950: {
                const _a1955 = union(_t1929, _t1940);
                for (let _i1956 = 0; _i1956 < _a1955.length; _i1956++) {
                  const v_a = _a1955[_i1956];
                  const _a1957 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
                    const v_M = _a1957[_i1958];
                    if (!_g1949.includes(v_M)) _g1949.push(v_M);
                  }
                }
              }
              const _a1959 = _g1949;
              for (let _i1960 = 0; _i1960 < _a1959.length; _i1960++) {
                const v_L = _a1959[_i1960];
                L1961: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L1961;
                  let _g1962 = 0;
                  G1963: {
                    const _a1964 = sp.lineCells[v_L];
                    for (let _i1965 = 0; _i1965 < _a1964.length; _i1965++) {
                      const v_x = _a1964[_i1965];
                      if (!(((_t1929.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1962++;
                    }
                  }
                  let _c1970: boolean = (_g1962 > v_v);
                  if (!_c1970) {
                    let _g1966 = 0;
                    G1967: {
                      const _a1968 = sp.lineCells[v_L];
                      for (let _i1969 = 0; _i1969 < _a1968.length; _i1969++) {
                        const v_x = _a1968[_i1969];
                        if (!((!(_t1940.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1966++;
                      }
                    }
                    _c1970 = (_g1966 < v_v);
                  }
                  if (_c1970) {
                    _q1947 = true;
                    break Q1948;
                  }
                }
              }
            }
            _c1971 = _q1947;
          }
          let _c1978: boolean = _c1971;
          if (!_c1978) {
            let _g1972 = 0;
            G1973: {
              const _a1974 = sp.cells;
              for (let _i1975 = 0; _i1975 < _a1974.length; _i1975++) {
                const v_x = _a1974[_i1975];
                if (!(((_t1929.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1972++;
              }
            }
            let _g1976 = 0;
            G1977: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1976 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1978 = (_g1972 > _g1976);
          }
          let _c1985: boolean = _c1978;
          if (!_c1985) {
            let _g1979 = 0;
            G1980: {
              const _a1981 = sp.cells;
              for (let _i1982 = 0; _i1982 < _a1981.length; _i1982++) {
                const v_x = _a1981[_i1982];
                if (!((!(_t1940.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1979++;
              }
            }
            let _g1983 = 0;
            G1984: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1983 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1985 = (_g1979 < _g1983);
          }
          let _c1998: boolean = _c1985;
          if (!_c1998) {
            let _q1986 = false;
            Q1987: {
              const _a1988 = _t1929;
              for (let _i1989 = 0; _i1989 < _a1988.length; _i1989++) {
                const v_a = _a1988[_i1989];
                const _a1990 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i1991 = 0; _i1991 < _a1990.length; _i1991++) {
                  const v_L = _a1990[_i1991];
                  _g1992.length = 0;
                  G1993: {
                    const _a1996 = sp.lineCells[v_L];
                    for (let _i1997 = 0; _i1997 < _a1996.length; _i1997++) {
                      const v_x = _a1996[_i1997];
                      if (!(((_t1929.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1992.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1992).length > v_T)) {
                    _q1986 = true;
                    break Q1987;
                  }
                }
              }
            }
            _c1998 = _q1986;
          }
          let _c2176: boolean = _c1998;
          if (!_c2176) {
            let _q1999 = false;
            Q2000: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2001.length = 0;
                G2002: {
                  _g2086.length = 0;
                  G2087: {
                    const _a2092 = union(_t1929, _t1940);
                    for (let _i2093 = 0; _i2093 < _a2092.length; _i2093++) {
                      const v_x = _a2092[_i2093];
                      const _a2094 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2095 = 0; _i2095 < _a2094.length; _i2095++) {
                        const v_y = _a2094[_i2095];
                        if (!_g2086.includes(v_y)) _g2086.push(v_y);
                      }
                    }
                  }
                  const _a2096 = _g2086;
                  for (let _i2097 = 0; _i2097 < _a2096.length; _i2097++) {
                    const v_a = _a2096[_i2097];
                    if (!(((_t1929.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2098 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2099 = 0; _i2099 < _a2098.length; _i2099++) {
                      const v_L = _a2098[_i2099];
                      _g2100.length = 0;
                      G2101: {
                        const _a2104 = sp.lineCells[v_L];
                        for (let _i2105 = 0; _i2105 < _a2104.length; _i2105++) {
                          const v_x = _a2104[_i2105];
                          if (!(((_t1929.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2100.push(v_x);
                        }
                      }
                      L2106: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2100);
                        const _h2107 = v_G.length;
                        const _h2136 = (_h2107 === 1);
                        let _c2139: boolean = (_h2107 === v_m);
                        if (_c2139) {
                          let _q2108 = true;
                          Q2109: {
                            _g2110.length = 0;
                            G2111: {
                              _g2124.length = 0;
                              G2125: {
                                const _a2130 = v_G;
                                for (let _i2131 = 0; _i2131 < _a2130.length; _i2131++) {
                                  const v_g = _a2130[_i2131];
                                  const _a2132 = sp.adj4[v_g];
                                  for (let _i2133 = 0; _i2133 < _a2132.length; _i2133++) {
                                    const v_z = _a2132[_i2133];
                                    if (!_g2124.includes(v_z)) _g2124.push(v_z);
                                  }
                                }
                              }
                              const _a2134 = _g2124;
                              for (let _i2135 = 0; _i2135 < _a2134.length; _i2135++) {
                                const v_y = _a2134[_i2135];
                                if (!((!(v_G.includes(v_y)) && (_h2136 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2110.push(v_y);
                              }
                            }
                            const _a2137 = _g2110;
                            for (let _i2138 = 0; _i2138 < _a2137.length; _i2138++) {
                              const v_y = _a2137[_i2138];
                              if (!(((_t1940.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2108 = false;
                                break Q2109;
                              }
                            }
                          }
                          _c2139 = _q2108;
                        }
                        let _c2170: boolean = _c2139;
                        if (_c2170) {
                          let _q2140 = false;
                          Q2141: {
                            _g2142.length = 0;
                            G2143: {
                              _g2156.length = 0;
                              G2157: {
                                const _a2162 = v_G;
                                for (let _i2163 = 0; _i2163 < _a2162.length; _i2163++) {
                                  const v_g = _a2162[_i2163];
                                  const _a2164 = sp.adj4[v_g];
                                  for (let _i2165 = 0; _i2165 < _a2164.length; _i2165++) {
                                    const v_z = _a2164[_i2165];
                                    if (!_g2156.includes(v_z)) _g2156.push(v_z);
                                  }
                                }
                              }
                              const _a2166 = _g2156;
                              for (let _i2167 = 0; _i2167 < _a2166.length; _i2167++) {
                                const v_y = _a2166[_i2167];
                                if (!((!(v_G.includes(v_y)) && (_h2136 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2142.push(v_y);
                              }
                            }
                            const _a2168 = union(v_G, _g2142);
                            for (let _i2169 = 0; _i2169 < _a2168.length; _i2169++) {
                              const v_x = _a2168[_i2169];
                              if (((_t1929.includes(v_x)) || (_t1940.includes(v_x)))) {
                                _q2140 = true;
                                break Q2141;
                              }
                            }
                          }
                          _c2170 = _q2140;
                        }
                        if (!(_c2170)) break L2106;
                        const _t2171 = (v_G[0] ?? -1);
                        if (!_g2001.includes(_t2171)) _g2001.push(_t2171);
                      }
                    }
                  }
                }
                L2172: {
                  const v_C = _g2001;
                  const _h2173 = v_C.length;
                  if (!((_h2173 > 0))) break L2172;
                  let _g2174 = 0;
                  G2175: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g2174 += cl.fleet.boats[v_k];
                    }
                  }
                  if ((_h2173 > (_g2174 - done(b, sp, v_m)))) {
                    _q1999 = true;
                    break Q2000;
                  }
                }
              }
            }
            _c2176 = _q1999;
          }
          if (!(_c2176)) break L1928;
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
  const _g2455: number[] = [];
  const _g2468: number[] = [];
  const _g2474: number[] = [];
  const _g2493: number[] = [];
  const _g2536: number[] = [];
  const _g2545: number[] = [];
  const _g2630: number[] = [];
  const _g2644: number[] = [];
  const _g2654: number[] = [];
  const _g2668: number[] = [];
  const _g2686: number[] = [];
  const _g2700: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g2447 = -1;
  G2448: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2449 = cl.fleet.length[v_k];
      if (_g2447 === -1 || _t2449 > _g2447) _g2447 = _t2449;
    }
  }
  const v_T = _g2447;
  const _a2450 = cluesValued(cl.seg, 6);
  for (let _i2451 = 0; _i2451 < _a2450.length; _i2451++) {
    const v_c = _a2450[_i2451];
    const _h2452 = clueAt(cl.seg, v_c);
    if (!((_h2452 === 6))) continue;
    const _a2453 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i2454 = 0; _i2454 < _a2453.length; _i2454++) {
      const v_L = _a2453[_i2454];
      _g2455.length = 0;
      G2456: {
        const _a2459 = sp.adj4[v_c];
        for (let _i2460 = 0; _i2460 < _a2459.length; _i2460++) {
          const v_x = _a2459[_i2460];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g2455.push(v_x);
        }
      }
      L2461: {
        const v_S = _g2455;
        const _h2462 = v_S.length;
        let _c2467: boolean = (_h2462 === 2);
        if (_c2467) {
          let _q2463 = false;
          Q2464: {
            const _a2465 = v_S;
            for (let _i2466 = 0; _i2466 < _a2465.length; _i2466++) {
              const v_x = _a2465[_i2466];
              if (!((b.grid[v_x] !== 0))) {
                _q2463 = true;
                break Q2464;
              }
            }
          }
          _c2467 = _q2463;
        }
        let _c2721: boolean = _c2467;
        if (_c2721) {
          _g2468.length = 0;
          G2469: {
            const _a2472 = v_S;
            for (let _i2473 = 0; _i2473 < _a2472.length; _i2473++) {
              const v_x = _a2472[_i2473];
              if (!((v_x !== v_x))) continue;
              _g2468.push(v_x);
            }
          }
          _g2474.length = 0;
          G2475: {
            const _a2480 = v_S;
            for (let _i2481 = 0; _i2481 < _a2480.length; _i2481++) {
              const v_a = _a2480[_i2481];
              const _a2482 = sp.adj8[v_a];
              for (let _i2483 = 0; _i2483 < _a2482.length; _i2483++) {
                const v_d = _a2482[_i2483];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g2474.includes(v_d)) _g2474.push(v_d);
              }
            }
          }
          const _t2484 = union(_g2468, _g2474);
          let _q2485 = false;
          Q2486: {
            const _a2487 = v_S;
            for (let _i2488 = 0; _i2488 < _a2487.length; _i2488++) {
              const v_a = _a2487[_i2488];
              const _a2489 = sp.adj8[v_a];
              for (let _i2490 = 0; _i2490 < _a2489.length; _i2490++) {
                const v_b = _a2489[_i2490];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2485 = true;
                  break Q2486;
                }
              }
            }
          }
          let _c2515: boolean = _q2485;
          if (!_c2515) {
            let _q2491 = false;
            Q2492: {
              _g2493.length = 0;
              G2494: {
                const _a2499 = union(v_S, _t2484);
                for (let _i2500 = 0; _i2500 < _a2499.length; _i2500++) {
                  const v_a = _a2499[_i2500];
                  const _a2501 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i2502 = 0; _i2502 < _a2501.length; _i2502++) {
                    const v_M = _a2501[_i2502];
                    if (!_g2493.includes(v_M)) _g2493.push(v_M);
                  }
                }
              }
              const _a2503 = _g2493;
              for (let _i2504 = 0; _i2504 < _a2503.length; _i2504++) {
                const v_L = _a2503[_i2504];
                L2505: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L2505;
                  let _g2506 = 0;
                  G2507: {
                    const _a2508 = sp.lineCells[v_L];
                    for (let _i2509 = 0; _i2509 < _a2508.length; _i2509++) {
                      const v_x = _a2508[_i2509];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2506++;
                    }
                  }
                  let _c2514: boolean = (_g2506 > v_v);
                  if (!_c2514) {
                    let _g2510 = 0;
                    G2511: {
                      const _a2512 = sp.lineCells[v_L];
                      for (let _i2513 = 0; _i2513 < _a2512.length; _i2513++) {
                        const v_x = _a2512[_i2513];
                        if (!((!(_t2484.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2510++;
                      }
                    }
                    _c2514 = (_g2510 < v_v);
                  }
                  if (_c2514) {
                    _q2491 = true;
                    break Q2492;
                  }
                }
              }
            }
            _c2515 = _q2491;
          }
          let _c2522: boolean = _c2515;
          if (!_c2522) {
            let _g2516 = 0;
            G2517: {
              const _a2518 = sp.cells;
              for (let _i2519 = 0; _i2519 < _a2518.length; _i2519++) {
                const v_x = _a2518[_i2519];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2516++;
              }
            }
            let _g2520 = 0;
            G2521: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2520 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2522 = (_g2516 > _g2520);
          }
          let _c2529: boolean = _c2522;
          if (!_c2529) {
            let _g2523 = 0;
            G2524: {
              const _a2525 = sp.cells;
              for (let _i2526 = 0; _i2526 < _a2525.length; _i2526++) {
                const v_x = _a2525[_i2526];
                if (!((!(_t2484.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2523++;
              }
            }
            let _g2527 = 0;
            G2528: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2527 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2529 = (_g2523 < _g2527);
          }
          let _c2542: boolean = _c2529;
          if (!_c2542) {
            let _q2530 = false;
            Q2531: {
              const _a2532 = v_S;
              for (let _i2533 = 0; _i2533 < _a2532.length; _i2533++) {
                const v_a = _a2532[_i2533];
                const _a2534 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i2535 = 0; _i2535 < _a2534.length; _i2535++) {
                  const v_L = _a2534[_i2535];
                  _g2536.length = 0;
                  G2537: {
                    const _a2540 = sp.lineCells[v_L];
                    for (let _i2541 = 0; _i2541 < _a2540.length; _i2541++) {
                      const v_x = _a2540[_i2541];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2536.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2536).length > v_T)) {
                    _q2530 = true;
                    break Q2531;
                  }
                }
              }
            }
            _c2542 = _q2530;
          }
          let _c2720: boolean = _c2542;
          if (!_c2720) {
            let _q2543 = false;
            Q2544: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2545.length = 0;
                G2546: {
                  _g2630.length = 0;
                  G2631: {
                    const _a2636 = union(v_S, _t2484);
                    for (let _i2637 = 0; _i2637 < _a2636.length; _i2637++) {
                      const v_x = _a2636[_i2637];
                      const _a2638 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2639 = 0; _i2639 < _a2638.length; _i2639++) {
                        const v_y = _a2638[_i2639];
                        if (!_g2630.includes(v_y)) _g2630.push(v_y);
                      }
                    }
                  }
                  const _a2640 = _g2630;
                  for (let _i2641 = 0; _i2641 < _a2640.length; _i2641++) {
                    const v_a = _a2640[_i2641];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2642 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2643 = 0; _i2643 < _a2642.length; _i2643++) {
                      const v_L = _a2642[_i2643];
                      _g2644.length = 0;
                      G2645: {
                        const _a2648 = sp.lineCells[v_L];
                        for (let _i2649 = 0; _i2649 < _a2648.length; _i2649++) {
                          const v_x = _a2648[_i2649];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2644.push(v_x);
                        }
                      }
                      L2650: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2644);
                        const _h2651 = v_G.length;
                        const _h2680 = (_h2651 === 1);
                        let _c2683: boolean = (_h2651 === v_m);
                        if (_c2683) {
                          let _q2652 = true;
                          Q2653: {
                            _g2654.length = 0;
                            G2655: {
                              _g2668.length = 0;
                              G2669: {
                                const _a2674 = v_G;
                                for (let _i2675 = 0; _i2675 < _a2674.length; _i2675++) {
                                  const v_g = _a2674[_i2675];
                                  const _a2676 = sp.adj4[v_g];
                                  for (let _i2677 = 0; _i2677 < _a2676.length; _i2677++) {
                                    const v_z = _a2676[_i2677];
                                    if (!_g2668.includes(v_z)) _g2668.push(v_z);
                                  }
                                }
                              }
                              const _a2678 = _g2668;
                              for (let _i2679 = 0; _i2679 < _a2678.length; _i2679++) {
                                const v_y = _a2678[_i2679];
                                if (!((!(v_G.includes(v_y)) && (_h2680 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2654.push(v_y);
                              }
                            }
                            const _a2681 = _g2654;
                            for (let _i2682 = 0; _i2682 < _a2681.length; _i2682++) {
                              const v_y = _a2681[_i2682];
                              if (!(((_t2484.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2652 = false;
                                break Q2653;
                              }
                            }
                          }
                          _c2683 = _q2652;
                        }
                        let _c2714: boolean = _c2683;
                        if (_c2714) {
                          let _q2684 = false;
                          Q2685: {
                            _g2686.length = 0;
                            G2687: {
                              _g2700.length = 0;
                              G2701: {
                                const _a2706 = v_G;
                                for (let _i2707 = 0; _i2707 < _a2706.length; _i2707++) {
                                  const v_g = _a2706[_i2707];
                                  const _a2708 = sp.adj4[v_g];
                                  for (let _i2709 = 0; _i2709 < _a2708.length; _i2709++) {
                                    const v_z = _a2708[_i2709];
                                    if (!_g2700.includes(v_z)) _g2700.push(v_z);
                                  }
                                }
                              }
                              const _a2710 = _g2700;
                              for (let _i2711 = 0; _i2711 < _a2710.length; _i2711++) {
                                const v_y = _a2710[_i2711];
                                if (!((!(v_G.includes(v_y)) && (_h2680 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2686.push(v_y);
                              }
                            }
                            const _a2712 = union(v_G, _g2686);
                            for (let _i2713 = 0; _i2713 < _a2712.length; _i2713++) {
                              const v_x = _a2712[_i2713];
                              if (((v_S.includes(v_x)) || (_t2484.includes(v_x)))) {
                                _q2684 = true;
                                break Q2685;
                              }
                            }
                          }
                          _c2714 = _q2684;
                        }
                        if (!(_c2714)) break L2650;
                        const _t2715 = (v_G[0] ?? -1);
                        if (!_g2545.includes(_t2715)) _g2545.push(_t2715);
                      }
                    }
                  }
                }
                L2716: {
                  const v_C = _g2545;
                  const _h2717 = v_C.length;
                  if (!((_h2717 > 0))) break L2716;
                  let _g2718 = 0;
                  G2719: {
                    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                      if (!((cl.fleet.length[v_k] === v_m))) continue;
                      _g2718 += cl.fleet.boats[v_k];
                    }
                  }
                  if ((_h2717 > (_g2718 - done(b, sp, v_m)))) {
                    _q2543 = true;
                    break Q2544;
                  }
                }
              }
            }
            _c2720 = _q2543;
          }
          _c2721 = _c2720;
        }
        if (!(_c2721)) break L2461;
        facts.length = 0;
        changed = false;
        let _q2722 = true;
        Q2723: {
          const _a2724 = v_S;
          for (let _i2725 = 0; _i2725 < _a2724.length; _i2725++) {
            const v_x = _a2724[_i2725];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2722 = false;
              break Q2723;
            }
          }
        }
        if (!(_q2722)) return -1;
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

const recKept = keptStore<number>();

/** `rec(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function rec(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = recKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  let _g688 = -1;
  G689: {
    const _a690 = setOf(v_L);
    for (let _i691 = 0; _i691 < _a690.length; _i691++) {
      const v_K = _a690[_i691];
      let _c710: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c710) {
        let _q692 = true;
        Q693: {
          const _g694: number[] = [];
          G695: {
            const _a698 = sp.lines;
            for (let _i699 = 0; _i699 < _a698.length; _i699++) {
              const v_M = _a698[_i699];
              if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
              _g694.push(v_M);
            }
          }
          const _a700 = _g694;
          for (let _i701 = 0; _i701 < _a700.length; _i701++) {
            const v_M = _a700[_i701];
            let _c709: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c709) {
              const _t702 = sp.lineCells[v_M];
              const _g703: number[] = [];
              G704: {
                const _a707 = _t702;
                for (let _i708 = 0; _i708 < _a707.length; _i708++) {
                  const v_c = _a707[_i708];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g703.push(v_c);
                }
              }
              _c709 = (_g703.length === 0);
            }
            if (!(_c709)) {
              _q692 = false;
              break Q693;
            }
          }
        }
        _c710 = _q692;
      }
      if (!(_c710)) continue;
      let _g711 = 0;
      G712: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g711 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g713 = 0;
      G714: {
        const _g715: number[] = [];
        G716: {
          const _a719 = sp.lines;
          for (let _i720 = 0; _i720 < _a719.length; _i720++) {
            const v_M = _a719[_i720];
            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
            _g715.push(v_M);
          }
        }
        const _a721 = _g715;
        for (let _i722 = 0; _i722 < _a721.length; _i722++) {
          const v_M = _a721[_i722];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g713 += clueAt(cl.n, v_M);
        }
      }
      let _g723 = 0;
      G724: {
        const _g725: number[] = [];
        G726: {
          const _a729 = sp.lines;
          for (let _i730 = 0; _i730 < _a729.length; _i730++) {
            const v_M = _a729[_i730];
            if (!(((v_M !== v_K) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_K][0] ?? -1) % sp.w) === ((sp.lineCells[v_K][1] ?? -1) % sp.w)))))) continue;
            _g725.push(v_M);
          }
        }
        const _a731 = _g725;
        for (let _i732 = 0; _i732 < _a731.length; _i732++) {
          const v_M = _a731[_i732];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t733 = sp.lineCells[v_M];
          let _g734 = 0;
          G735: {
            const _a736 = _t733;
            for (let _i737 = 0; _i737 < _a736.length; _i737++) {
              const v_c = _a736[_i737];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g734++;
            }
          }
          _g723 += _g734;
        }
      }
      const _t738 = ((_g711 - _g713) - _g723);
      if (_g688 === -1 || _t738 > _g688) _g688 = _t738;
    }
  }
  const _made = _g688;
  _kept[v_L] = _made;
  return _made;
}

const wideKept = keptStore<boolean>();

/** `wide(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function wide(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = wideKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q825 = false;
  Q826: {
    const _a827 = sp.lines;
    for (let _i828 = 0; _i828 < _a827.length; _i828++) {
      const v_K = _a827[_i828];
      const _a829 = sp.lineCells[v_K];
      for (let _i830 = 0; _i830 < _a829.length; _i830++) {
        const v_d = _a829[_i830];
        let _c835: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c835) {
          let _q831 = false;
          Q832: {
            const _a833 = sp.adj4[v_d];
            for (let _i834 = 0; _i834 < _a833.length; _i834++) {
              const v_p = _a833[_i834];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q831 = true;
                break Q832;
              }
            }
          }
          _c835 = !(_q831);
        }
        if (!(_c835)) continue;
        const _g836: number[] = [];
        G837: {
          const _a840 = sp.lineCells[v_K];
          for (let _i841 = 0; _i841 < _a840.length; _i841++) {
            const v_x = _a840[_i841];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g836.push(v_x);
          }
        }
        L842: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g836);
          let _g843 = 0;
          G844: {
            const _a845 = v_R;
            for (let _i846 = 0; _i846 < _a845.length; _i846++) {
              const v_c = _a845[_i846];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g843++;
            }
          }
          let _c857: boolean = ((_g843 < v_R.length) && (v_R.length >= v_m));
          if (_c857) {
            let _c856: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c856) {
              const _t847 = sp.lineCells[v_K];
              let _g848 = 0;
              G849: {
                const _a850 = _t847;
                for (let _i851 = 0; _i851 < _a850.length; _i851++) {
                  const v_c = _a850[_i851];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g848++;
                }
              }
              let _g852 = 0;
              G853: {
                const _a854 = v_R;
                for (let _i855 = 0; _i855 < _a854.length; _i855++) {
                  const v_c = _a854[_i855];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g852++;
                }
              }
              _c856 = (((clueAt(cl.n, v_K) - _g848) + _g852) >= v_m);
            }
            _c857 = _c856;
          }
          if (!(_c857)) break L842;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q825 = true;
            break Q826;
          }
        }
      }
    }
  }
  const _made = _q825;
  _kept[v_m] = _made;
  return _made;
}

const numKept = keptStore<number>();

/** `num(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function num(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = numKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _made = ((clueAt(cl.n, v_L) + rec(b, sp, cl, v_L)) + 1);
  _kept[v_L] = _made;
  return _made;
}
