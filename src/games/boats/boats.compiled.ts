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
  const _g2720: number[] = [];
  const _g2728: number[] = [];
  const _g2821: number[] = [];
  const _g2829: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2696 = true;
  Q2697: {
    const _a2698 = sp.cells;
    for (let _i2699 = 0; _i2699 < _a2698.length; _i2699++) {
      const v_a = _a2698[_i2699];
      const _h2700 = (g[v_a] || -1);
      if (!((_h2700 === 1))) continue;
      let _q2701 = true;
      Q2702: {
        const _a2703 = sp.adj8[v_a];
        for (let _i2704 = 0; _i2704 < _a2703.length; _i2704++) {
          const v_b = _a2703[_i2704];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2705 = (g[v_b] || -1);
          if (!((_h2705 !== 1))) {
            _q2701 = false;
            break Q2702;
          }
        }
      }
      if (!(_q2701)) {
        _q2696 = false;
        break Q2697;
      }
    }
  }
  if (!(_q2696)) return false;
  let _q2706 = true;
  Q2707: {
    const _a2708 = sp.cells;
    for (let _i2709 = 0; _i2709 < _a2708.length; _i2709++) {
      const v_c = _a2708[_i2709];
      const _h2710 = (g[v_c] || -1);
      let _c2713: boolean = (_h2710 === 1);
      if (_c2713) {
        const _t2711 = step(sp, v_c, 1);
        const _h2712 = (g[_t2711] || -1);
        _c2713 = !(((_t2711 !== -1) && (_h2712 === 1)));
      }
      let _c2716: boolean = _c2713;
      if (_c2716) {
        const _t2714 = step(sp, v_c, 3);
        const _h2715 = (g[_t2714] || -1);
        _c2716 = !(((_t2714 !== -1) && (_h2715 === 1)));
      }
      if (!(_c2716)) continue;
      const _h2719 = sp.rowOf[v_c];
      const _h2727 = sp.colOf[v_c];
      let _q2717 = false;
      Q2718: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2720.length = 0;
          G2721: {
            const _a2724 = sp.lineCells[_h2719];
            for (let _i2725 = 0; _i2725 < _a2724.length; _i2725++) {
              const v_x = _a2724[_i2725];
              const _h2726 = (g[v_x] || -1);
              if (!((_h2726 === 1))) continue;
              _g2720.push(v_x);
            }
          }
          _g2728.length = 0;
          G2729: {
            const _a2732 = sp.lineCells[_h2727];
            for (let _i2733 = 0; _i2733 < _a2732.length; _i2733++) {
              const v_x = _a2732[_i2733];
              const _h2734 = (g[v_x] || -1);
              if (!((_h2734 === 1))) continue;
              _g2728.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2719], v_c, _g2720), stretch(sp.lineCells[_h2727], v_c, _g2728)).length)) {
            _q2717 = true;
            break Q2718;
          }
        }
      }
      if (!(_q2717)) {
        _q2706 = false;
        break Q2707;
      }
    }
  }
  if (!(_q2706)) return false;
  let _q2735 = true;
  Q2736: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2735 = false;
          break Q2736;
        }
      }
    }
  }
  if (!(_q2735)) return false;
  let _g2737 = 0;
  G2738: {
    const _a2739 = sp.cells;
    for (let _i2740 = 0; _i2740 < _a2739.length; _i2740++) {
      const v_c = _a2739[_i2740];
      const _h2741 = (g[v_c] || -1);
      if (!((_h2741 === 1))) continue;
      _g2737++;
    }
  }
  let _g2742 = 0;
  G2743: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2742 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2737 === _g2742))) return false;
  for (let _k2744 = 0; _k2744 < cl.n.at.length; _k2744++) {
    const _at2745 = cl.n.at[_k2744];
    const _v2746 = cl.n.v[_k2744];
    const _t2747 = sp.lineCells[_at2745];
    let _g2748 = 0;
    G2749: {
      const _a2750 = _t2747;
      for (let _i2751 = 0; _i2751 < _a2750.length; _i2751++) {
        const v_c = _a2750[_i2751];
        const _h2752 = (g[v_c] || -1);
        if (!((_h2752 === 1))) continue;
        _g2748++;
      }
    }
    if (!((_g2748 === _v2746))) return false;
  }
  for (let _k2753 = 0; _k2753 < cl.seg.at.length; _k2753++) {
    const _at2754 = cl.seg.at[_k2753];
    const _v2755 = cl.seg.v[_k2753];
    let _c2805: boolean = ((_v2755 === 2) && ((g[_at2754] || -1) === 2));
    if (!_c2805) {
      let _c2804: boolean = ((_v2755 > 2) && ((g[_at2754] || -1) === 1));
      if (_c2804) {
        let _c2762: boolean = (_v2755 === 3);
        if (!_c2762) {
          let _c2758: boolean = (_v2755 === 4);
          if (_c2758) {
            const _t2756 = step(sp, _at2754, 2);
            const _h2757 = (g[_t2756] || -1);
            _c2758 = ((_t2756 !== -1) && (_h2757 === 1));
          }
          let _c2761: boolean = _c2758;
          if (_c2761) {
            const _t2759 = step(sp, _at2754, 1);
            const _h2760 = (g[_t2759] || -1);
            _c2761 = !(((_t2759 !== -1) && (_h2760 === 1)));
          }
          _c2762 = _c2761;
        }
        let _c2769: boolean = _c2762;
        if (!_c2769) {
          let _c2765: boolean = (_v2755 === 5);
          if (_c2765) {
            const _t2763 = step(sp, _at2754, 1);
            const _h2764 = (g[_t2763] || -1);
            _c2765 = ((_t2763 !== -1) && (_h2764 === 1));
          }
          let _c2768: boolean = _c2765;
          if (_c2768) {
            const _t2766 = step(sp, _at2754, 2);
            const _h2767 = (g[_t2766] || -1);
            _c2768 = !(((_t2766 !== -1) && (_h2767 === 1)));
          }
          _c2769 = _c2768;
        }
        let _c2782: boolean = _c2769;
        if (!_c2782) {
          let _c2781: boolean = (_v2755 === 6);
          if (_c2781) {
            const _t2770 = step(sp, _at2754, 1);
            const _h2771 = (g[_t2770] || -1);
            let _c2774: boolean = ((_t2770 !== -1) && (_h2771 === 1));
            if (_c2774) {
              const _t2772 = step(sp, _at2754, 2);
              const _h2773 = (g[_t2772] || -1);
              _c2774 = ((_t2772 !== -1) && (_h2773 === 1));
            }
            let _c2780: boolean = _c2774;
            if (!_c2780) {
              const _t2775 = step(sp, _at2754, 3);
              const _h2776 = (g[_t2775] || -1);
              let _c2779: boolean = ((_t2775 !== -1) && (_h2776 === 1));
              if (_c2779) {
                const _t2777 = step(sp, _at2754, 4);
                const _h2778 = (g[_t2777] || -1);
                _c2779 = ((_t2777 !== -1) && (_h2778 === 1));
              }
              _c2780 = _c2779;
            }
            _c2781 = _c2780;
          }
          _c2782 = _c2781;
        }
        let _c2789: boolean = _c2782;
        if (!_c2789) {
          let _c2785: boolean = (_v2755 === 7);
          if (_c2785) {
            const _t2783 = step(sp, _at2754, 4);
            const _h2784 = (g[_t2783] || -1);
            _c2785 = ((_t2783 !== -1) && (_h2784 === 1));
          }
          let _c2788: boolean = _c2785;
          if (_c2788) {
            const _t2786 = step(sp, _at2754, 3);
            const _h2787 = (g[_t2786] || -1);
            _c2788 = !(((_t2786 !== -1) && (_h2787 === 1)));
          }
          _c2789 = _c2788;
        }
        let _c2796: boolean = _c2789;
        if (!_c2796) {
          let _c2792: boolean = (_v2755 === 8);
          if (_c2792) {
            const _t2790 = step(sp, _at2754, 3);
            const _h2791 = (g[_t2790] || -1);
            _c2792 = ((_t2790 !== -1) && (_h2791 === 1));
          }
          let _c2795: boolean = _c2792;
          if (_c2795) {
            const _t2793 = step(sp, _at2754, 4);
            const _h2794 = (g[_t2793] || -1);
            _c2795 = !(((_t2793 !== -1) && (_h2794 === 1)));
          }
          _c2796 = _c2795;
        }
        let _c2803: boolean = _c2796;
        if (!_c2803) {
          let _c2802: boolean = (_v2755 === 9);
          if (_c2802) {
            let _q2797 = false;
            Q2798: {
              const _a2799 = sp.adj4[_at2754];
              for (let _i2800 = 0; _i2800 < _a2799.length; _i2800++) {
                const v_x = _a2799[_i2800];
                const _h2801 = (g[v_x] || -1);
                if ((_h2801 === 1)) {
                  _q2797 = true;
                  break Q2798;
                }
              }
            }
            _c2802 = !(_q2797);
          }
          _c2803 = _c2802;
        }
        _c2804 = _c2803;
      }
      _c2805 = _c2804;
    }
    if (!(_c2805)) return false;
  }
  for (let _k2806 = 0; _k2806 < cl.fleet.n; _k2806++) {
    let _g2809 = 0;
    G2810: {
      const _a2811 = sp.cells;
      for (let _i2812 = 0; _i2812 < _a2811.length; _i2812++) {
        const v_c = _a2811[_i2812];
        const _h2813 = (g[v_c] || -1);
        let _c2816: boolean = (_h2813 === 1);
        if (_c2816) {
          const _t2814 = step(sp, v_c, 1);
          const _h2815 = (g[_t2814] || -1);
          _c2816 = !(((_t2814 !== -1) && (_h2815 === 1)));
        }
        let _c2819: boolean = _c2816;
        if (_c2819) {
          const _t2817 = step(sp, v_c, 3);
          const _h2818 = (g[_t2817] || -1);
          _c2819 = !(((_t2817 !== -1) && (_h2818 === 1)));
        }
        let _c2836: boolean = _c2819;
        if (_c2836) {
          const _t2820 = sp.rowOf[v_c];
          _g2821.length = 0;
          G2822: {
            const _a2825 = sp.lineCells[_t2820];
            for (let _i2826 = 0; _i2826 < _a2825.length; _i2826++) {
              const v_x = _a2825[_i2826];
              const _h2827 = (g[v_x] || -1);
              if (!((_h2827 === 1))) continue;
              _g2821.push(v_x);
            }
          }
          const _t2828 = sp.colOf[v_c];
          _g2829.length = 0;
          G2830: {
            const _a2833 = sp.lineCells[_t2828];
            for (let _i2834 = 0; _i2834 < _a2833.length; _i2834++) {
              const v_x = _a2833[_i2834];
              const _h2835 = (g[v_x] || -1);
              if (!((_h2835 === 1))) continue;
              _g2829.push(v_x);
            }
          }
          _c2836 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2821), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2829)).length === cl.fleet.length[_k2806]);
        }
        if (!(_c2836)) continue;
        _g2809++;
      }
    }
    if (!((_g2809 === cl.fleet.boats[_k2806]))) return false;
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
  const _a940 = sp.lines;
  for (let _i941 = 0; _i941 < _a940.length; _i941++) {
    const v_L = _a940[_i941];
    L942: {
      const v_v = num(b, sp, cl, v_L);
      if (!((v_v >= 0))) break L942;
      let _g943 = 0;
      G944: {
        const _a945 = sp.lineCells[v_L];
        for (let _i946 = 0; _i946 < _a945.length; _i946++) {
          const v_c = _a945[_i946];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g943++;
        }
      }
      L947: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g943);
        if (!(((v_t === 1) || (v_t === 2)))) break L947;
        const _a948 = sp.lineCells[v_L];
        for (let _i949 = 0; _i949 < _a948.length; _i949++) {
          const v_k = _a948[_i949];
          let _g950 = -1;
          let _n952 = 0;
          G951: {
            const _a953 = setOf(sp.rowOf[v_k], sp.colOf[v_k]);
            for (let _i954 = 0; _i954 < _a953.length; _i954++) {
              const v_M = _a953[_i954];
              if (!((v_M !== v_L))) continue;
              if (++_n952 === 2) {
                _g950 = -1;
                break G951;
              }
              _g950 = v_M;
            }
          }
          const v_K = _g950;
          const v_j = num(b, sp, cl, v_K);
          const _h963 = (v_j >= 0);
          let _g955 = 0;
          G956: {
            const _a957 = sp.adj4[v_k];
            for (let _i958 = 0; _i958 < _a957.length; _i958++) {
              const v_x = _a957[_i958];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g955++;
            }
          }
          let _g959 = 0;
          G960: {
            const _a961 = setOf(v_k);
            for (let _i962 = 0; _i962 < _a961.length; _i962++) {
              const v_x = _a961[_i962];
              let _c969: boolean = (!((b.grid[v_x] !== 0)) && _h963);
              if (_c969) {
                const _t964 = sp.lineCells[v_K];
                let _g965 = 0;
                G966: {
                  const _a967 = _t964;
                  for (let _i968 = 0; _i968 < _a967.length; _i968++) {
                    const v_c = _a967[_i968];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g965++;
                  }
                }
                _c969 = ((v_j - _g965) === 1);
              }
              if (!(_c969)) continue;
              _g959++;
            }
          }
          L970: {
            const v_s = (_g955 + _g959);
            if (!((v_s > v_t))) break L970;
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
  const _g1287: number[] = [];
  const _g1293: number[] = [];
  const _g1303: number[] = [];
  const _g1316: number[] = [];
  const _g1335: number[] = [];
  const _g1378: number[] = [];
  const _g1387: number[] = [];
  const _g1472: number[] = [];
  const _g1486: number[] = [];
  const _g1496: number[] = [];
  const _g1510: number[] = [];
  const _g1528: number[] = [];
  const _g1542: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  let _g1265 = -1;
  G1266: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1267 = cl.fleet.length[v_k];
      if (_g1265 === -1 || _t1267 > _g1265) _g1265 = _t1267;
    }
  }
  const v_T = _g1265;
  const _a1268 = sp.lines;
  for (let _i1269 = 0; _i1269 < _a1268.length; _i1269++) {
    const v_L = _a1268[_i1269];
    L1270: {
      const v_v = num(b, sp, cl, v_L);
      let _c1275: boolean = (v_v >= 0);
      if (_c1275) {
        let _g1271 = 0;
        G1272: {
          const _a1273 = sp.lineCells[v_L];
          for (let _i1274 = 0; _i1274 < _a1273.length; _i1274++) {
            const v_c = _a1273[_i1274];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1271++;
          }
        }
        _c1275 = (((sp.lineCells[v_L].length - v_v) - _g1271) === 1);
      }
      if (!(_c1275)) break L1270;
      const _a1276 = sp.lineCells[v_L];
      for (let _i1277 = 0; _i1277 < _a1276.length; _i1277++) {
        const v_c = _a1276[_i1277];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1278 = -1;
        let _n1280 = 0;
        G1279: {
          const _a1281 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1282 = 0; _i1282 < _a1281.length; _i1282++) {
            const v_M = _a1281[_i1282];
            if (!((v_M !== v_L))) continue;
            if (++_n1280 === 2) {
              _g1278 = -1;
              break G1279;
            }
            _g1278 = v_M;
          }
        }
        const v_K = _g1278;
        const v_j = num(b, sp, cl, v_K);
        const _h1311 = (v_j >= 0);
        let _g1283 = 0;
        G1284: {
          const _a1285 = sp.lineCells[v_K];
          for (let _i1286 = 0; _i1286 < _a1285.length; _i1286++) {
            const v_c = _a1285[_i1286];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1283++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1283);
        const _h1312 = (v_t === 1);
        const _h1313 = (_h1311 && _h1312);
        _g1287.length = 0;
        G1288: {
          const _a1291 = sp.lineCells[v_L];
          for (let _i1292 = 0; _i1292 < _a1291.length; _i1292++) {
            const v_x = _a1291[_i1292];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1287.push(v_x);
          }
        }
        _g1293.length = 0;
        G1294: {
          _g1303.length = 0;
          G1304: {
            const _a1307 = sp.lineCells[v_K];
            for (let _i1308 = 0; _i1308 < _a1307.length; _i1308++) {
              const v_x = _a1307[_i1308];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1303.push(v_x);
            }
          }
          const _a1309 = _g1303;
          for (let _i1310 = 0; _i1310 < _a1309.length; _i1310++) {
            const v_x = _a1309[_i1310];
            if (!(_h1313)) continue;
            _g1293.push(v_x);
          }
        }
        L1314: {
          const v_H = union(_g1287, _g1293);
          const _t1315 = setOf(v_c);
          _g1316.length = 0;
          G1317: {
            const _a1322 = v_H;
            for (let _i1323 = 0; _i1323 < _a1322.length; _i1323++) {
              const v_a = _a1322[_i1323];
              const _a1324 = sp.adj8[v_a];
              for (let _i1325 = 0; _i1325 < _a1324.length; _i1325++) {
                const v_d = _a1324[_i1325];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1316.includes(v_d)) _g1316.push(v_d);
              }
            }
          }
          const _t1326 = union(_t1315, _g1316);
          let _q1327 = false;
          Q1328: {
            const _a1329 = v_H;
            for (let _i1330 = 0; _i1330 < _a1329.length; _i1330++) {
              const v_a = _a1329[_i1330];
              const _a1331 = sp.adj8[v_a];
              for (let _i1332 = 0; _i1332 < _a1331.length; _i1332++) {
                const v_b = _a1331[_i1332];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1327 = true;
                  break Q1328;
                }
              }
            }
          }
          let _c1357: boolean = _q1327;
          if (!_c1357) {
            let _q1333 = false;
            Q1334: {
              _g1335.length = 0;
              G1336: {
                const _a1341 = union(v_H, _t1326);
                for (let _i1342 = 0; _i1342 < _a1341.length; _i1342++) {
                  const v_a = _a1341[_i1342];
                  const _a1343 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1344 = 0; _i1344 < _a1343.length; _i1344++) {
                    const v_M = _a1343[_i1344];
                    if (!_g1335.includes(v_M)) _g1335.push(v_M);
                  }
                }
              }
              const _a1345 = _g1335;
              for (let _i1346 = 0; _i1346 < _a1345.length; _i1346++) {
                const v_L = _a1345[_i1346];
                L1347: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L1347;
                  let _g1348 = 0;
                  G1349: {
                    const _a1350 = sp.lineCells[v_L];
                    for (let _i1351 = 0; _i1351 < _a1350.length; _i1351++) {
                      const v_x = _a1350[_i1351];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1348++;
                    }
                  }
                  let _c1356: boolean = (_g1348 > v_v);
                  if (!_c1356) {
                    let _g1352 = 0;
                    G1353: {
                      const _a1354 = sp.lineCells[v_L];
                      for (let _i1355 = 0; _i1355 < _a1354.length; _i1355++) {
                        const v_x = _a1354[_i1355];
                        if (!((!(_t1326.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1352++;
                      }
                    }
                    _c1356 = (_g1352 < v_v);
                  }
                  if (_c1356) {
                    _q1333 = true;
                    break Q1334;
                  }
                }
              }
            }
            _c1357 = _q1333;
          }
          let _c1364: boolean = _c1357;
          if (!_c1364) {
            let _g1358 = 0;
            G1359: {
              const _a1360 = sp.cells;
              for (let _i1361 = 0; _i1361 < _a1360.length; _i1361++) {
                const v_x = _a1360[_i1361];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1358++;
              }
            }
            let _g1362 = 0;
            G1363: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1362 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1364 = (_g1358 > _g1362);
          }
          let _c1371: boolean = _c1364;
          if (!_c1371) {
            let _g1365 = 0;
            G1366: {
              const _a1367 = sp.cells;
              for (let _i1368 = 0; _i1368 < _a1367.length; _i1368++) {
                const v_x = _a1367[_i1368];
                if (!((!(_t1326.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1365++;
              }
            }
            let _g1369 = 0;
            G1370: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1369 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1371 = (_g1365 < _g1369);
          }
          let _c1384: boolean = _c1371;
          if (!_c1384) {
            let _q1372 = false;
            Q1373: {
              const _a1374 = v_H;
              for (let _i1375 = 0; _i1375 < _a1374.length; _i1375++) {
                const v_a = _a1374[_i1375];
                const _a1376 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i1377 = 0; _i1377 < _a1376.length; _i1377++) {
                  const v_L = _a1376[_i1377];
                  _g1378.length = 0;
                  G1379: {
                    const _a1382 = sp.lineCells[v_L];
                    for (let _i1383 = 0; _i1383 < _a1382.length; _i1383++) {
                      const v_x = _a1382[_i1383];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1378.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1378).length > v_T)) {
                    _q1372 = true;
                    break Q1373;
                  }
                }
              }
            }
            _c1384 = _q1372;
          }
          let _c1560: boolean = _c1384;
          if (!_c1560) {
            let _q1385 = false;
            Q1386: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1387.length = 0;
                G1388: {
                  _g1472.length = 0;
                  G1473: {
                    const _a1478 = union(v_H, _t1326);
                    for (let _i1479 = 0; _i1479 < _a1478.length; _i1479++) {
                      const v_x = _a1478[_i1479];
                      const _a1480 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1481 = 0; _i1481 < _a1480.length; _i1481++) {
                        const v_y = _a1480[_i1481];
                        if (!_g1472.includes(v_y)) _g1472.push(v_y);
                      }
                    }
                  }
                  const _a1482 = _g1472;
                  for (let _i1483 = 0; _i1483 < _a1482.length; _i1483++) {
                    const v_a = _a1482[_i1483];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a1484 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i1485 = 0; _i1485 < _a1484.length; _i1485++) {
                      const v_L = _a1484[_i1485];
                      _g1486.length = 0;
                      G1487: {
                        const _a1490 = sp.lineCells[v_L];
                        for (let _i1491 = 0; _i1491 < _a1490.length; _i1491++) {
                          const v_x = _a1490[_i1491];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1486.push(v_x);
                        }
                      }
                      L1492: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1486);
                        const _h1493 = v_G.length;
                        const _h1522 = (_h1493 === 1);
                        let _c1525: boolean = (_h1493 === v_m);
                        if (_c1525) {
                          let _q1494 = true;
                          Q1495: {
                            _g1496.length = 0;
                            G1497: {
                              _g1510.length = 0;
                              G1511: {
                                const _a1516 = v_G;
                                for (let _i1517 = 0; _i1517 < _a1516.length; _i1517++) {
                                  const v_g = _a1516[_i1517];
                                  const _a1518 = sp.adj4[v_g];
                                  for (let _i1519 = 0; _i1519 < _a1518.length; _i1519++) {
                                    const v_z = _a1518[_i1519];
                                    if (!_g1510.includes(v_z)) _g1510.push(v_z);
                                  }
                                }
                              }
                              const _a1520 = _g1510;
                              for (let _i1521 = 0; _i1521 < _a1520.length; _i1521++) {
                                const v_y = _a1520[_i1521];
                                if (!((!(v_G.includes(v_y)) && (_h1522 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1496.push(v_y);
                              }
                            }
                            const _a1523 = _g1496;
                            for (let _i1524 = 0; _i1524 < _a1523.length; _i1524++) {
                              const v_y = _a1523[_i1524];
                              if (!(((_t1326.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1494 = false;
                                break Q1495;
                              }
                            }
                          }
                          _c1525 = _q1494;
                        }
                        let _c1556: boolean = _c1525;
                        if (_c1556) {
                          let _q1526 = false;
                          Q1527: {
                            _g1528.length = 0;
                            G1529: {
                              _g1542.length = 0;
                              G1543: {
                                const _a1548 = v_G;
                                for (let _i1549 = 0; _i1549 < _a1548.length; _i1549++) {
                                  const v_g = _a1548[_i1549];
                                  const _a1550 = sp.adj4[v_g];
                                  for (let _i1551 = 0; _i1551 < _a1550.length; _i1551++) {
                                    const v_z = _a1550[_i1551];
                                    if (!_g1542.includes(v_z)) _g1542.push(v_z);
                                  }
                                }
                              }
                              const _a1552 = _g1542;
                              for (let _i1553 = 0; _i1553 < _a1552.length; _i1553++) {
                                const v_y = _a1552[_i1553];
                                if (!((!(v_G.includes(v_y)) && (_h1522 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1528.push(v_y);
                              }
                            }
                            const _a1554 = union(v_G, _g1528);
                            for (let _i1555 = 0; _i1555 < _a1554.length; _i1555++) {
                              const v_x = _a1554[_i1555];
                              if (((v_H.includes(v_x)) || (_t1326.includes(v_x)))) {
                                _q1526 = true;
                                break Q1527;
                              }
                            }
                          }
                          _c1556 = _q1526;
                        }
                        if (!(_c1556)) break L1492;
                        const _t1557 = (v_G[0] ?? -1);
                        if (!_g1387.includes(_t1557)) _g1387.push(_t1557);
                      }
                    }
                  }
                }
                L1558: {
                  const v_C = _g1387;
                  const _h1559 = v_C.length;
                  if (!((_h1559 > 0))) break L1558;
                  if ((_h1559 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q1385 = true;
                    break Q1386;
                  }
                }
              }
            }
            _c1560 = _q1385;
          }
          if (!(_c1560)) break L1314;
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
  const _g1877: number[] = [];
  const _g1883: number[] = [];
  const _g1893: number[] = [];
  const _g1906: number[] = [];
  const _g1925: number[] = [];
  const _g1968: number[] = [];
  const _g1977: number[] = [];
  const _g2062: number[] = [];
  const _g2076: number[] = [];
  const _g2086: number[] = [];
  const _g2100: number[] = [];
  const _g2118: number[] = [];
  const _g2132: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  let _g1853 = -1;
  G1854: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1855 = cl.fleet.length[v_k];
      if (_g1853 === -1 || _t1855 > _g1853) _g1853 = _t1855;
    }
  }
  const v_T = _g1853;
  const _a1856 = sp.lines;
  for (let _i1857 = 0; _i1857 < _a1856.length; _i1857++) {
    const v_L = _a1856[_i1857];
    L1858: {
      const v_v = num(b, sp, cl, v_L);
      let _c1864: boolean = (v_v >= 0);
      if (_c1864) {
        const _t1859 = sp.lineCells[v_L];
        let _g1860 = 0;
        G1861: {
          const _a1862 = _t1859;
          for (let _i1863 = 0; _i1863 < _a1862.length; _i1863++) {
            const v_c = _a1862[_i1863];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1860++;
          }
        }
        _c1864 = ((v_v - _g1860) === 1);
      }
      if (!(_c1864)) break L1858;
      const _a1865 = sp.lineCells[v_L];
      for (let _i1866 = 0; _i1866 < _a1865.length; _i1866++) {
        const v_c = _a1865[_i1866];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        let _g1867 = -1;
        let _n1869 = 0;
        G1868: {
          const _a1870 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
          for (let _i1871 = 0; _i1871 < _a1870.length; _i1871++) {
            const v_M = _a1870[_i1871];
            if (!((v_M !== v_L))) continue;
            if (++_n1869 === 2) {
              _g1867 = -1;
              break G1868;
            }
            _g1867 = v_M;
          }
        }
        const v_K = _g1867;
        const v_j = num(b, sp, cl, v_K);
        const _h1901 = (v_j >= 0);
        const _t1872 = sp.lineCells[v_K];
        let _g1873 = 0;
        G1874: {
          const _a1875 = _t1872;
          for (let _i1876 = 0; _i1876 < _a1875.length; _i1876++) {
            const v_c = _a1875[_i1876];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1873++;
          }
        }
        const v_u = (v_j - _g1873);
        const _h1902 = (v_u === 1);
        const _h1903 = (_h1901 && _h1902);
        _g1877.length = 0;
        G1878: {
          const _a1881 = sp.lineCells[v_L];
          for (let _i1882 = 0; _i1882 < _a1881.length; _i1882++) {
            const v_x = _a1881[_i1882];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1877.push(v_x);
          }
        }
        _g1883.length = 0;
        G1884: {
          _g1893.length = 0;
          G1894: {
            const _a1897 = sp.lineCells[v_K];
            for (let _i1898 = 0; _i1898 < _a1897.length; _i1898++) {
              const v_x = _a1897[_i1898];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1893.push(v_x);
            }
          }
          const _a1899 = _g1893;
          for (let _i1900 = 0; _i1900 < _a1899.length; _i1900++) {
            const v_x = _a1899[_i1900];
            if (!(_h1903)) continue;
            _g1883.push(v_x);
          }
        }
        L1904: {
          const v_W = union(_g1877, _g1883);
          const _t1905 = setOf(v_c);
          _g1906.length = 0;
          G1907: {
            const _a1912 = _t1905;
            for (let _i1913 = 0; _i1913 < _a1912.length; _i1913++) {
              const v_a = _a1912[_i1913];
              const _a1914 = sp.adj8[v_a];
              for (let _i1915 = 0; _i1915 < _a1914.length; _i1915++) {
                const v_d = _a1914[_i1915];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1906.includes(v_d)) _g1906.push(v_d);
              }
            }
          }
          const _t1916 = union(v_W, _g1906);
          let _q1917 = false;
          Q1918: {
            const _a1919 = _t1905;
            for (let _i1920 = 0; _i1920 < _a1919.length; _i1920++) {
              const v_a = _a1919[_i1920];
              const _a1921 = sp.adj8[v_a];
              for (let _i1922 = 0; _i1922 < _a1921.length; _i1922++) {
                const v_b = _a1921[_i1922];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1905.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1917 = true;
                  break Q1918;
                }
              }
            }
          }
          let _c1947: boolean = _q1917;
          if (!_c1947) {
            let _q1923 = false;
            Q1924: {
              _g1925.length = 0;
              G1926: {
                const _a1931 = union(_t1905, _t1916);
                for (let _i1932 = 0; _i1932 < _a1931.length; _i1932++) {
                  const v_a = _a1931[_i1932];
                  const _a1933 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i1934 = 0; _i1934 < _a1933.length; _i1934++) {
                    const v_M = _a1933[_i1934];
                    if (!_g1925.includes(v_M)) _g1925.push(v_M);
                  }
                }
              }
              const _a1935 = _g1925;
              for (let _i1936 = 0; _i1936 < _a1935.length; _i1936++) {
                const v_L = _a1935[_i1936];
                L1937: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L1937;
                  let _g1938 = 0;
                  G1939: {
                    const _a1940 = sp.lineCells[v_L];
                    for (let _i1941 = 0; _i1941 < _a1940.length; _i1941++) {
                      const v_x = _a1940[_i1941];
                      if (!(((_t1905.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1938++;
                    }
                  }
                  let _c1946: boolean = (_g1938 > v_v);
                  if (!_c1946) {
                    let _g1942 = 0;
                    G1943: {
                      const _a1944 = sp.lineCells[v_L];
                      for (let _i1945 = 0; _i1945 < _a1944.length; _i1945++) {
                        const v_x = _a1944[_i1945];
                        if (!((!(_t1916.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1942++;
                      }
                    }
                    _c1946 = (_g1942 < v_v);
                  }
                  if (_c1946) {
                    _q1923 = true;
                    break Q1924;
                  }
                }
              }
            }
            _c1947 = _q1923;
          }
          let _c1954: boolean = _c1947;
          if (!_c1954) {
            let _g1948 = 0;
            G1949: {
              const _a1950 = sp.cells;
              for (let _i1951 = 0; _i1951 < _a1950.length; _i1951++) {
                const v_x = _a1950[_i1951];
                if (!(((_t1905.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1948++;
              }
            }
            let _g1952 = 0;
            G1953: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1952 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1954 = (_g1948 > _g1952);
          }
          let _c1961: boolean = _c1954;
          if (!_c1961) {
            let _g1955 = 0;
            G1956: {
              const _a1957 = sp.cells;
              for (let _i1958 = 0; _i1958 < _a1957.length; _i1958++) {
                const v_x = _a1957[_i1958];
                if (!((!(_t1916.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1955++;
              }
            }
            let _g1959 = 0;
            G1960: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1959 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1961 = (_g1955 < _g1959);
          }
          let _c1974: boolean = _c1961;
          if (!_c1974) {
            let _q1962 = false;
            Q1963: {
              const _a1964 = _t1905;
              for (let _i1965 = 0; _i1965 < _a1964.length; _i1965++) {
                const v_a = _a1964[_i1965];
                const _a1966 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i1967 = 0; _i1967 < _a1966.length; _i1967++) {
                  const v_L = _a1966[_i1967];
                  _g1968.length = 0;
                  G1969: {
                    const _a1972 = sp.lineCells[v_L];
                    for (let _i1973 = 0; _i1973 < _a1972.length; _i1973++) {
                      const v_x = _a1972[_i1973];
                      if (!(((_t1905.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1968.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1968).length > v_T)) {
                    _q1962 = true;
                    break Q1963;
                  }
                }
              }
            }
            _c1974 = _q1962;
          }
          let _c2150: boolean = _c1974;
          if (!_c2150) {
            let _q1975 = false;
            Q1976: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1977.length = 0;
                G1978: {
                  _g2062.length = 0;
                  G2063: {
                    const _a2068 = union(_t1905, _t1916);
                    for (let _i2069 = 0; _i2069 < _a2068.length; _i2069++) {
                      const v_x = _a2068[_i2069];
                      const _a2070 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2071 = 0; _i2071 < _a2070.length; _i2071++) {
                        const v_y = _a2070[_i2071];
                        if (!_g2062.includes(v_y)) _g2062.push(v_y);
                      }
                    }
                  }
                  const _a2072 = _g2062;
                  for (let _i2073 = 0; _i2073 < _a2072.length; _i2073++) {
                    const v_a = _a2072[_i2073];
                    if (!(((_t1905.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2074 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2075 = 0; _i2075 < _a2074.length; _i2075++) {
                      const v_L = _a2074[_i2075];
                      _g2076.length = 0;
                      G2077: {
                        const _a2080 = sp.lineCells[v_L];
                        for (let _i2081 = 0; _i2081 < _a2080.length; _i2081++) {
                          const v_x = _a2080[_i2081];
                          if (!(((_t1905.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2076.push(v_x);
                        }
                      }
                      L2082: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2076);
                        const _h2083 = v_G.length;
                        const _h2112 = (_h2083 === 1);
                        let _c2115: boolean = (_h2083 === v_m);
                        if (_c2115) {
                          let _q2084 = true;
                          Q2085: {
                            _g2086.length = 0;
                            G2087: {
                              _g2100.length = 0;
                              G2101: {
                                const _a2106 = v_G;
                                for (let _i2107 = 0; _i2107 < _a2106.length; _i2107++) {
                                  const v_g = _a2106[_i2107];
                                  const _a2108 = sp.adj4[v_g];
                                  for (let _i2109 = 0; _i2109 < _a2108.length; _i2109++) {
                                    const v_z = _a2108[_i2109];
                                    if (!_g2100.includes(v_z)) _g2100.push(v_z);
                                  }
                                }
                              }
                              const _a2110 = _g2100;
                              for (let _i2111 = 0; _i2111 < _a2110.length; _i2111++) {
                                const v_y = _a2110[_i2111];
                                if (!((!(v_G.includes(v_y)) && (_h2112 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2086.push(v_y);
                              }
                            }
                            const _a2113 = _g2086;
                            for (let _i2114 = 0; _i2114 < _a2113.length; _i2114++) {
                              const v_y = _a2113[_i2114];
                              if (!(((_t1916.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2084 = false;
                                break Q2085;
                              }
                            }
                          }
                          _c2115 = _q2084;
                        }
                        let _c2146: boolean = _c2115;
                        if (_c2146) {
                          let _q2116 = false;
                          Q2117: {
                            _g2118.length = 0;
                            G2119: {
                              _g2132.length = 0;
                              G2133: {
                                const _a2138 = v_G;
                                for (let _i2139 = 0; _i2139 < _a2138.length; _i2139++) {
                                  const v_g = _a2138[_i2139];
                                  const _a2140 = sp.adj4[v_g];
                                  for (let _i2141 = 0; _i2141 < _a2140.length; _i2141++) {
                                    const v_z = _a2140[_i2141];
                                    if (!_g2132.includes(v_z)) _g2132.push(v_z);
                                  }
                                }
                              }
                              const _a2142 = _g2132;
                              for (let _i2143 = 0; _i2143 < _a2142.length; _i2143++) {
                                const v_y = _a2142[_i2143];
                                if (!((!(v_G.includes(v_y)) && (_h2112 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2118.push(v_y);
                              }
                            }
                            const _a2144 = union(v_G, _g2118);
                            for (let _i2145 = 0; _i2145 < _a2144.length; _i2145++) {
                              const v_x = _a2144[_i2145];
                              if (((_t1905.includes(v_x)) || (_t1916.includes(v_x)))) {
                                _q2116 = true;
                                break Q2117;
                              }
                            }
                          }
                          _c2146 = _q2116;
                        }
                        if (!(_c2146)) break L2082;
                        const _t2147 = (v_G[0] ?? -1);
                        if (!_g1977.includes(_t2147)) _g1977.push(_t2147);
                      }
                    }
                  }
                }
                L2148: {
                  const v_C = _g1977;
                  const _h2149 = v_C.length;
                  if (!((_h2149 > 0))) break L2148;
                  if ((_h2149 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q1975 = true;
                    break Q1976;
                  }
                }
              }
            }
            _c2150 = _q1975;
          }
          if (!(_c2150)) break L1904;
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
  const _g2427: number[] = [];
  const _g2440: number[] = [];
  const _g2446: number[] = [];
  const _g2465: number[] = [];
  const _g2508: number[] = [];
  const _g2517: number[] = [];
  const _g2602: number[] = [];
  const _g2616: number[] = [];
  const _g2626: number[] = [];
  const _g2640: number[] = [];
  const _g2658: number[] = [];
  const _g2672: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  let _g2419 = -1;
  G2420: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2421 = cl.fleet.length[v_k];
      if (_g2419 === -1 || _t2421 > _g2419) _g2419 = _t2421;
    }
  }
  const v_T = _g2419;
  const _a2422 = cluesValued(cl.seg, 6);
  for (let _i2423 = 0; _i2423 < _a2422.length; _i2423++) {
    const v_c = _a2422[_i2423];
    const _h2424 = clueAt(cl.seg, v_c);
    if (!((_h2424 === 6))) continue;
    const _a2425 = setOf(sp.rowOf[v_c], sp.colOf[v_c]);
    for (let _i2426 = 0; _i2426 < _a2425.length; _i2426++) {
      const v_L = _a2425[_i2426];
      _g2427.length = 0;
      G2428: {
        const _a2431 = sp.adj4[v_c];
        for (let _i2432 = 0; _i2432 < _a2431.length; _i2432++) {
          const v_x = _a2431[_i2432];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g2427.push(v_x);
        }
      }
      L2433: {
        const v_S = _g2427;
        const _h2434 = v_S.length;
        let _c2439: boolean = (_h2434 === 2);
        if (_c2439) {
          let _q2435 = false;
          Q2436: {
            const _a2437 = v_S;
            for (let _i2438 = 0; _i2438 < _a2437.length; _i2438++) {
              const v_x = _a2437[_i2438];
              if (!((b.grid[v_x] !== 0))) {
                _q2435 = true;
                break Q2436;
              }
            }
          }
          _c2439 = _q2435;
        }
        let _c2691: boolean = _c2439;
        if (_c2691) {
          _g2440.length = 0;
          G2441: {
            const _a2444 = v_S;
            for (let _i2445 = 0; _i2445 < _a2444.length; _i2445++) {
              const v_x = _a2444[_i2445];
              if (!((v_x !== v_x))) continue;
              _g2440.push(v_x);
            }
          }
          _g2446.length = 0;
          G2447: {
            const _a2452 = v_S;
            for (let _i2453 = 0; _i2453 < _a2452.length; _i2453++) {
              const v_a = _a2452[_i2453];
              const _a2454 = sp.adj8[v_a];
              for (let _i2455 = 0; _i2455 < _a2454.length; _i2455++) {
                const v_d = _a2454[_i2455];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g2446.includes(v_d)) _g2446.push(v_d);
              }
            }
          }
          const _t2456 = union(_g2440, _g2446);
          let _q2457 = false;
          Q2458: {
            const _a2459 = v_S;
            for (let _i2460 = 0; _i2460 < _a2459.length; _i2460++) {
              const v_a = _a2459[_i2460];
              const _a2461 = sp.adj8[v_a];
              for (let _i2462 = 0; _i2462 < _a2461.length; _i2462++) {
                const v_b = _a2461[_i2462];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2457 = true;
                  break Q2458;
                }
              }
            }
          }
          let _c2487: boolean = _q2457;
          if (!_c2487) {
            let _q2463 = false;
            Q2464: {
              _g2465.length = 0;
              G2466: {
                const _a2471 = union(v_S, _t2456);
                for (let _i2472 = 0; _i2472 < _a2471.length; _i2472++) {
                  const v_a = _a2471[_i2472];
                  const _a2473 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                  for (let _i2474 = 0; _i2474 < _a2473.length; _i2474++) {
                    const v_M = _a2473[_i2474];
                    if (!_g2465.includes(v_M)) _g2465.push(v_M);
                  }
                }
              }
              const _a2475 = _g2465;
              for (let _i2476 = 0; _i2476 < _a2475.length; _i2476++) {
                const v_L = _a2475[_i2476];
                L2477: {
                  const v_v = num(b, sp, cl, v_L);
                  if (!((v_v >= 0))) break L2477;
                  let _g2478 = 0;
                  G2479: {
                    const _a2480 = sp.lineCells[v_L];
                    for (let _i2481 = 0; _i2481 < _a2480.length; _i2481++) {
                      const v_x = _a2480[_i2481];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2478++;
                    }
                  }
                  let _c2486: boolean = (_g2478 > v_v);
                  if (!_c2486) {
                    let _g2482 = 0;
                    G2483: {
                      const _a2484 = sp.lineCells[v_L];
                      for (let _i2485 = 0; _i2485 < _a2484.length; _i2485++) {
                        const v_x = _a2484[_i2485];
                        if (!((!(_t2456.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2482++;
                      }
                    }
                    _c2486 = (_g2482 < v_v);
                  }
                  if (_c2486) {
                    _q2463 = true;
                    break Q2464;
                  }
                }
              }
            }
            _c2487 = _q2463;
          }
          let _c2494: boolean = _c2487;
          if (!_c2494) {
            let _g2488 = 0;
            G2489: {
              const _a2490 = sp.cells;
              for (let _i2491 = 0; _i2491 < _a2490.length; _i2491++) {
                const v_x = _a2490[_i2491];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2488++;
              }
            }
            let _g2492 = 0;
            G2493: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2492 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2494 = (_g2488 > _g2492);
          }
          let _c2501: boolean = _c2494;
          if (!_c2501) {
            let _g2495 = 0;
            G2496: {
              const _a2497 = sp.cells;
              for (let _i2498 = 0; _i2498 < _a2497.length; _i2498++) {
                const v_x = _a2497[_i2498];
                if (!((!(_t2456.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2495++;
              }
            }
            let _g2499 = 0;
            G2500: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2499 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2501 = (_g2495 < _g2499);
          }
          let _c2514: boolean = _c2501;
          if (!_c2514) {
            let _q2502 = false;
            Q2503: {
              const _a2504 = v_S;
              for (let _i2505 = 0; _i2505 < _a2504.length; _i2505++) {
                const v_a = _a2504[_i2505];
                const _a2506 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                for (let _i2507 = 0; _i2507 < _a2506.length; _i2507++) {
                  const v_L = _a2506[_i2507];
                  _g2508.length = 0;
                  G2509: {
                    const _a2512 = sp.lineCells[v_L];
                    for (let _i2513 = 0; _i2513 < _a2512.length; _i2513++) {
                      const v_x = _a2512[_i2513];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2508.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2508).length > v_T)) {
                    _q2502 = true;
                    break Q2503;
                  }
                }
              }
            }
            _c2514 = _q2502;
          }
          let _c2690: boolean = _c2514;
          if (!_c2690) {
            let _q2515 = false;
            Q2516: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2517.length = 0;
                G2518: {
                  _g2602.length = 0;
                  G2603: {
                    const _a2608 = union(v_S, _t2456);
                    for (let _i2609 = 0; _i2609 < _a2608.length; _i2609++) {
                      const v_x = _a2608[_i2609];
                      const _a2610 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2611 = 0; _i2611 < _a2610.length; _i2611++) {
                        const v_y = _a2610[_i2611];
                        if (!_g2602.includes(v_y)) _g2602.push(v_y);
                      }
                    }
                  }
                  const _a2612 = _g2602;
                  for (let _i2613 = 0; _i2613 < _a2612.length; _i2613++) {
                    const v_a = _a2612[_i2613];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _a2614 = setOf(sp.rowOf[v_a], sp.colOf[v_a]);
                    for (let _i2615 = 0; _i2615 < _a2614.length; _i2615++) {
                      const v_L = _a2614[_i2615];
                      _g2616.length = 0;
                      G2617: {
                        const _a2620 = sp.lineCells[v_L];
                        for (let _i2621 = 0; _i2621 < _a2620.length; _i2621++) {
                          const v_x = _a2620[_i2621];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2616.push(v_x);
                        }
                      }
                      L2622: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2616);
                        const _h2623 = v_G.length;
                        const _h2652 = (_h2623 === 1);
                        let _c2655: boolean = (_h2623 === v_m);
                        if (_c2655) {
                          let _q2624 = true;
                          Q2625: {
                            _g2626.length = 0;
                            G2627: {
                              _g2640.length = 0;
                              G2641: {
                                const _a2646 = v_G;
                                for (let _i2647 = 0; _i2647 < _a2646.length; _i2647++) {
                                  const v_g = _a2646[_i2647];
                                  const _a2648 = sp.adj4[v_g];
                                  for (let _i2649 = 0; _i2649 < _a2648.length; _i2649++) {
                                    const v_z = _a2648[_i2649];
                                    if (!_g2640.includes(v_z)) _g2640.push(v_z);
                                  }
                                }
                              }
                              const _a2650 = _g2640;
                              for (let _i2651 = 0; _i2651 < _a2650.length; _i2651++) {
                                const v_y = _a2650[_i2651];
                                if (!((!(v_G.includes(v_y)) && (_h2652 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2626.push(v_y);
                              }
                            }
                            const _a2653 = _g2626;
                            for (let _i2654 = 0; _i2654 < _a2653.length; _i2654++) {
                              const v_y = _a2653[_i2654];
                              if (!(((_t2456.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2624 = false;
                                break Q2625;
                              }
                            }
                          }
                          _c2655 = _q2624;
                        }
                        let _c2686: boolean = _c2655;
                        if (_c2686) {
                          let _q2656 = false;
                          Q2657: {
                            _g2658.length = 0;
                            G2659: {
                              _g2672.length = 0;
                              G2673: {
                                const _a2678 = v_G;
                                for (let _i2679 = 0; _i2679 < _a2678.length; _i2679++) {
                                  const v_g = _a2678[_i2679];
                                  const _a2680 = sp.adj4[v_g];
                                  for (let _i2681 = 0; _i2681 < _a2680.length; _i2681++) {
                                    const v_z = _a2680[_i2681];
                                    if (!_g2672.includes(v_z)) _g2672.push(v_z);
                                  }
                                }
                              }
                              const _a2682 = _g2672;
                              for (let _i2683 = 0; _i2683 < _a2682.length; _i2683++) {
                                const v_y = _a2682[_i2683];
                                if (!((!(v_G.includes(v_y)) && (_h2652 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2658.push(v_y);
                              }
                            }
                            const _a2684 = union(v_G, _g2658);
                            for (let _i2685 = 0; _i2685 < _a2684.length; _i2685++) {
                              const v_x = _a2684[_i2685];
                              if (((v_S.includes(v_x)) || (_t2456.includes(v_x)))) {
                                _q2656 = true;
                                break Q2657;
                              }
                            }
                          }
                          _c2686 = _q2656;
                        }
                        if (!(_c2686)) break L2622;
                        const _t2687 = (v_G[0] ?? -1);
                        if (!_g2517.includes(_t2687)) _g2517.push(_t2687);
                      }
                    }
                  }
                }
                L2688: {
                  const v_C = _g2517;
                  const _h2689 = v_C.length;
                  if (!((_h2689 > 0))) break L2688;
                  if ((_h2689 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q2515 = true;
                    break Q2516;
                  }
                }
              }
            }
            _c2690 = _q2515;
          }
          _c2691 = _c2690;
        }
        if (!(_c2691)) break L2433;
        facts.length = 0;
        changed = false;
        let _q2692 = true;
        Q2693: {
          const _a2694 = v_S;
          for (let _i2695 = 0; _i2695 < _a2694.length; _i2695++) {
            const v_x = _a2694[_i2695];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2692 = false;
              break Q2693;
            }
          }
        }
        if (!(_q2692)) return -1;
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
