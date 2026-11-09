// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, cellsValued, clueAt, cluesValued, keptStore, rangeMask, setOf, step, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g2717: number[] = [];
  const _g2725: number[] = [];
  const _g2818: number[] = [];
  const _g2826: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q2693 = true;
  Q2694: {
    const _a2695 = sp.cells;
    for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
      const v_a = _a2695[_i2696];
      const _h2697 = (g[v_a] || -1);
      if (!((_h2697 === 1))) continue;
      let _q2698 = true;
      Q2699: {
        const _a2700 = sp.adj8[v_a];
        for (let _i2701 = 0; _i2701 < _a2700.length; _i2701++) {
          const v_b = _a2700[_i2701];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h2702 = (g[v_b] || -1);
          if (!((_h2702 !== 1))) {
            _q2698 = false;
            break Q2699;
          }
        }
      }
      if (!(_q2698)) {
        _q2693 = false;
        break Q2694;
      }
    }
  }
  if (!(_q2693)) return false;
  let _q2703 = true;
  Q2704: {
    const _a2705 = sp.cells;
    for (let _i2706 = 0; _i2706 < _a2705.length; _i2706++) {
      const v_c = _a2705[_i2706];
      const _h2707 = (g[v_c] || -1);
      let _c2710: boolean = (_h2707 === 1);
      if (_c2710) {
        const _t2708 = step(sp, v_c, 1);
        const _h2709 = (g[_t2708] || -1);
        _c2710 = !(((_t2708 !== -1) && (_h2709 === 1)));
      }
      let _c2713: boolean = _c2710;
      if (_c2713) {
        const _t2711 = step(sp, v_c, 3);
        const _h2712 = (g[_t2711] || -1);
        _c2713 = !(((_t2711 !== -1) && (_h2712 === 1)));
      }
      if (!(_c2713)) continue;
      const _h2716 = sp.rowOf[v_c];
      const _h2724 = sp.colOf[v_c];
      let _q2714 = false;
      Q2715: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g2717.length = 0;
          G2718: {
            const _a2721 = sp.lineCells[_h2716];
            for (let _i2722 = 0; _i2722 < _a2721.length; _i2722++) {
              const v_x = _a2721[_i2722];
              const _h2723 = (g[v_x] || -1);
              if (!((_h2723 === 1))) continue;
              _g2717.push(v_x);
            }
          }
          _g2725.length = 0;
          G2726: {
            const _a2729 = sp.lineCells[_h2724];
            for (let _i2730 = 0; _i2730 < _a2729.length; _i2730++) {
              const v_x = _a2729[_i2730];
              const _h2731 = (g[v_x] || -1);
              if (!((_h2731 === 1))) continue;
              _g2725.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h2716], v_c, _g2717), stretch(sp.lineCells[_h2724], v_c, _g2725)).length)) {
            _q2714 = true;
            break Q2715;
          }
        }
      }
      if (!(_q2714)) {
        _q2703 = false;
        break Q2704;
      }
    }
  }
  if (!(_q2703)) return false;
  let _q2732 = true;
  Q2733: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q2732 = false;
          break Q2733;
        }
      }
    }
  }
  if (!(_q2732)) return false;
  let _g2734 = 0;
  G2735: {
    const _a2736 = sp.cells;
    for (let _i2737 = 0; _i2737 < _a2736.length; _i2737++) {
      const v_c = _a2736[_i2737];
      const _h2738 = (g[v_c] || -1);
      if (!((_h2738 === 1))) continue;
      _g2734++;
    }
  }
  let _g2739 = 0;
  G2740: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g2739 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g2734 === _g2739))) return false;
  for (let _k2741 = 0; _k2741 < cl.n.at.length; _k2741++) {
    const _at2742 = cl.n.at[_k2741];
    const _v2743 = cl.n.v[_k2741];
    const _t2744 = sp.lineCells[_at2742];
    let _g2745 = 0;
    G2746: {
      const _a2747 = _t2744;
      for (let _i2748 = 0; _i2748 < _a2747.length; _i2748++) {
        const v_c = _a2747[_i2748];
        const _h2749 = (g[v_c] || -1);
        if (!((_h2749 === 1))) continue;
        _g2745++;
      }
    }
    if (!((_g2745 === _v2743))) return false;
  }
  for (let _k2750 = 0; _k2750 < cl.seg.at.length; _k2750++) {
    const _at2751 = cl.seg.at[_k2750];
    const _v2752 = cl.seg.v[_k2750];
    let _c2802: boolean = ((_v2752 === 2) && ((g[_at2751] || -1) === 2));
    if (!_c2802) {
      let _c2801: boolean = ((_v2752 > 2) && ((g[_at2751] || -1) === 1));
      if (_c2801) {
        let _c2759: boolean = (_v2752 === 3);
        if (!_c2759) {
          let _c2755: boolean = (_v2752 === 4);
          if (_c2755) {
            const _t2753 = step(sp, _at2751, 2);
            const _h2754 = (g[_t2753] || -1);
            _c2755 = ((_t2753 !== -1) && (_h2754 === 1));
          }
          let _c2758: boolean = _c2755;
          if (_c2758) {
            const _t2756 = step(sp, _at2751, 1);
            const _h2757 = (g[_t2756] || -1);
            _c2758 = !(((_t2756 !== -1) && (_h2757 === 1)));
          }
          _c2759 = _c2758;
        }
        let _c2766: boolean = _c2759;
        if (!_c2766) {
          let _c2762: boolean = (_v2752 === 5);
          if (_c2762) {
            const _t2760 = step(sp, _at2751, 1);
            const _h2761 = (g[_t2760] || -1);
            _c2762 = ((_t2760 !== -1) && (_h2761 === 1));
          }
          let _c2765: boolean = _c2762;
          if (_c2765) {
            const _t2763 = step(sp, _at2751, 2);
            const _h2764 = (g[_t2763] || -1);
            _c2765 = !(((_t2763 !== -1) && (_h2764 === 1)));
          }
          _c2766 = _c2765;
        }
        let _c2779: boolean = _c2766;
        if (!_c2779) {
          let _c2778: boolean = (_v2752 === 6);
          if (_c2778) {
            const _t2767 = step(sp, _at2751, 1);
            const _h2768 = (g[_t2767] || -1);
            let _c2771: boolean = ((_t2767 !== -1) && (_h2768 === 1));
            if (_c2771) {
              const _t2769 = step(sp, _at2751, 2);
              const _h2770 = (g[_t2769] || -1);
              _c2771 = ((_t2769 !== -1) && (_h2770 === 1));
            }
            let _c2777: boolean = _c2771;
            if (!_c2777) {
              const _t2772 = step(sp, _at2751, 3);
              const _h2773 = (g[_t2772] || -1);
              let _c2776: boolean = ((_t2772 !== -1) && (_h2773 === 1));
              if (_c2776) {
                const _t2774 = step(sp, _at2751, 4);
                const _h2775 = (g[_t2774] || -1);
                _c2776 = ((_t2774 !== -1) && (_h2775 === 1));
              }
              _c2777 = _c2776;
            }
            _c2778 = _c2777;
          }
          _c2779 = _c2778;
        }
        let _c2786: boolean = _c2779;
        if (!_c2786) {
          let _c2782: boolean = (_v2752 === 7);
          if (_c2782) {
            const _t2780 = step(sp, _at2751, 4);
            const _h2781 = (g[_t2780] || -1);
            _c2782 = ((_t2780 !== -1) && (_h2781 === 1));
          }
          let _c2785: boolean = _c2782;
          if (_c2785) {
            const _t2783 = step(sp, _at2751, 3);
            const _h2784 = (g[_t2783] || -1);
            _c2785 = !(((_t2783 !== -1) && (_h2784 === 1)));
          }
          _c2786 = _c2785;
        }
        let _c2793: boolean = _c2786;
        if (!_c2793) {
          let _c2789: boolean = (_v2752 === 8);
          if (_c2789) {
            const _t2787 = step(sp, _at2751, 3);
            const _h2788 = (g[_t2787] || -1);
            _c2789 = ((_t2787 !== -1) && (_h2788 === 1));
          }
          let _c2792: boolean = _c2789;
          if (_c2792) {
            const _t2790 = step(sp, _at2751, 4);
            const _h2791 = (g[_t2790] || -1);
            _c2792 = !(((_t2790 !== -1) && (_h2791 === 1)));
          }
          _c2793 = _c2792;
        }
        let _c2800: boolean = _c2793;
        if (!_c2800) {
          let _c2799: boolean = (_v2752 === 9);
          if (_c2799) {
            let _q2794 = false;
            Q2795: {
              const _a2796 = sp.adj4[_at2751];
              for (let _i2797 = 0; _i2797 < _a2796.length; _i2797++) {
                const v_x = _a2796[_i2797];
                const _h2798 = (g[v_x] || -1);
                if ((_h2798 === 1)) {
                  _q2794 = true;
                  break Q2795;
                }
              }
            }
            _c2799 = !(_q2794);
          }
          _c2800 = _c2799;
        }
        _c2801 = _c2800;
      }
      _c2802 = _c2801;
    }
    if (!(_c2802)) return false;
  }
  for (let _k2803 = 0; _k2803 < cl.fleet.n; _k2803++) {
    let _g2806 = 0;
    G2807: {
      const _a2808 = sp.cells;
      for (let _i2809 = 0; _i2809 < _a2808.length; _i2809++) {
        const v_c = _a2808[_i2809];
        const _h2810 = (g[v_c] || -1);
        let _c2813: boolean = (_h2810 === 1);
        if (_c2813) {
          const _t2811 = step(sp, v_c, 1);
          const _h2812 = (g[_t2811] || -1);
          _c2813 = !(((_t2811 !== -1) && (_h2812 === 1)));
        }
        let _c2816: boolean = _c2813;
        if (_c2816) {
          const _t2814 = step(sp, v_c, 3);
          const _h2815 = (g[_t2814] || -1);
          _c2816 = !(((_t2814 !== -1) && (_h2815 === 1)));
        }
        let _c2833: boolean = _c2816;
        if (_c2833) {
          const _t2817 = sp.rowOf[v_c];
          _g2818.length = 0;
          G2819: {
            const _a2822 = sp.lineCells[_t2817];
            for (let _i2823 = 0; _i2823 < _a2822.length; _i2823++) {
              const v_x = _a2822[_i2823];
              const _h2824 = (g[v_x] || -1);
              if (!((_h2824 === 1))) continue;
              _g2818.push(v_x);
            }
          }
          const _t2825 = sp.colOf[v_c];
          _g2826.length = 0;
          G2827: {
            const _a2830 = sp.lineCells[_t2825];
            for (let _i2831 = 0; _i2831 < _a2830.length; _i2831++) {
              const v_x = _a2830[_i2831];
              const _h2832 = (g[v_x] || -1);
              if (!((_h2832 === 1))) continue;
              _g2826.push(v_x);
            }
          }
          _c2833 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g2818), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g2826)).length === cl.fleet.length[_k2803]);
        }
        if (!(_c2833)) continue;
        _g2806++;
      }
    }
    if (!((_g2806 === cl.fleet.boats[_k2803]))) return false;
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
        const _h526 = (v_m > 1);
        L521: {
          const v_b = (boatsOf(sp, cl, v_m) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L521;
          facts.length = 0;
          changed = false;
          let _q522 = true;
          Q523: {
            const _a524 = v_R;
            for (let _i525 = 0; _i525 < _a524.length; _i525++) {
              const v_x = _a524[_i525];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c532: boolean = true;
              if (_c532) {
                let _c531: boolean = _h526;
                if (!_c531) {
                  let _q527 = true;
                  Q528: {
                    const _a529 = sp.adj4[v_x];
                    for (let _i530 = 0; _i530 < _a529.length; _i530++) {
                      const v_y = _a529[_i530];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q527 = false;
                        break Q528;
                      }
                    }
                  }
                  _c531 = _q527;
                }
                _c532 = _c531;
              }
              if (!(_c532)) {
                _q522 = false;
                break Q523;
              }
            }
          }
          if (!(_q522)) return -1;
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
  const _g564: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a556 = cluesValued(cl.seg, 6);
  for (let _i557 = 0; _i557 < _a556.length; _i557++) {
    const v_c = _a556[_i557];
    const _h558 = clueAt(cl.seg, v_c);
    if (!((_h558 === 6))) continue;
    const _t559 = sp.rowOf[v_c];
    const _t560 = sp.colOf[v_c];
    for (let _i561 = 0; _i561 < 2; _i561++) {
      const v_L = _i561 === 0 ? _t559 : _t560;
      if (_i561 === 1 && (v_L === _t559)) continue;
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
  const _g734: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a730 = sp.lines;
  for (let _i731 = 0; _i731 < _a730.length; _i731++) {
    const v_L = _a730[_i731];
    const _h732 = clueAt(cl.n, v_L);
    if (!((_h732 < 0))) continue;
    const _t733 = sp.lineCells[v_L];
    _g734.length = 0;
    G735: {
      const _a738 = _t733;
      for (let _i739 = 0; _i739 < _a738.length; _i739++) {
        const v_c = _a738[_i739];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g734.push(v_c);
      }
    }
    L740: {
      const v_O = _g734;
      const _h741 = v_O.length;
      if (!((_h741 > 0))) break L740;
      L742: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L742;
        const _t743 = sp.lineCells[v_L];
        let _g744 = 0;
        G745: {
          const _a746 = _t743;
          for (let _i747 = 0; _i747 < _a746.length; _i747++) {
            const v_c = _a746[_i747];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g744++;
          }
        }
        const v_left = (v_v - _g744);
        facts.length = 0;
        changed = false;
        let _c753: boolean = ((v_left >= 0) && (v_left <= _h741));
        if (_c753) {
          let _c752: boolean = !((v_left === 0));
          if (!_c752) {
            let _q748 = true;
            Q749: {
              const _a750 = v_O;
              for (let _i751 = 0; _i751 < _a750.length; _i751++) {
                const v_c = _a750[_i751];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q748 = false;
                  break Q749;
                }
              }
            }
            _c752 = _q748;
          }
          _c753 = _c752;
        }
        let _c759: boolean = _c753;
        if (_c759) {
          let _c758: boolean = !((v_left === _h741));
          if (!_c758) {
            let _q754 = true;
            Q755: {
              const _a756 = v_O;
              for (let _i757 = 0; _i757 < _a756.length; _i757++) {
                const v_c = _a756[_i757];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q754 = false;
                  break Q755;
                }
              }
            }
            _c758 = _q754;
          }
          _c759 = _c758;
        }
        if (!(_c759)) return -1;
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
  const _g857: number[] = [];
  const _g880: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  let _g841 = -1;
  G842: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t843 = cl.fleet.length[v_k];
      if (_g841 === -1 || _t843 > _g841) _g841 = _t843;
    }
  }
  L844: {
    const v_m = _g841;
    if (!((v_m > 0))) break L844;
    const _h879 = (2 * v_m);
    const _a845 = sp.lines;
    for (let _i846 = 0; _i846 < _a845.length; _i846++) {
      const v_L = _a845[_i846];
      const _h869 = clueAt(cl.n, v_L);
      const _h870 = (_h869 < 0);
      const _a847 = sp.lineCells[v_L];
      for (let _i848 = 0; _i848 < _a847.length; _i848++) {
        const v_c = _a847[_i848];
        const _h853 = (v_c % sp.w);
        const _h854 = ((v_c / sp.w) | 0);
        const _h855 = (_h853 + _h854);
        let _c856: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c856) {
          let _q849 = false;
          Q850: {
            const _a851 = sp.adj4[v_c];
            for (let _i852 = 0; _i852 < _a851.length; _i852++) {
              const v_p = _a851[_i852];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h855)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q849 = true;
                break Q850;
              }
            }
          }
          _c856 = !(_q849);
        }
        if (!(_c856)) continue;
        _g857.length = 0;
        G858: {
          const _a861 = sp.lineCells[v_L];
          for (let _i862 = 0; _i862 < _a861.length; _i862++) {
            const v_x = _a861[_i862];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g857.push(v_x);
          }
        }
        L863: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g857);
          const _h868 = v_R.length;
          let _g864 = 0;
          G865: {
            const _a866 = v_R;
            for (let _i867 = 0; _i867 < _a866.length; _i867++) {
              const v_c = _a866[_i867];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g864++;
            }
          }
          let _c878: boolean = (_g864 < _h868);
          if (_c878) {
            let _c877: boolean = ((_g864 < _h868) && (_h868 >= v_m));
            if (_c877) {
              let _c876: boolean = _h870;
              if (!_c876) {
                const _t871 = sp.lineCells[v_L];
                let _g872 = 0;
                G873: {
                  const _a874 = _t871;
                  for (let _i875 = 0; _i875 < _a874.length; _i875++) {
                    const v_c = _a874[_i875];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g872++;
                  }
                }
                _c876 = (((_h869 - _g872) + _g864) >= v_m);
              }
              _c877 = _c876;
            }
            _c878 = _c877;
          }
          if (!((_c878 && (_h868 < _h879)))) break L863;
          const _h886 = (_h868 - v_m);
          _g880.length = 0;
          G881: {
            const _a884 = v_R;
            for (let _i885 = 0; _i885 < _a884.length; _i885++) {
              const v_x = _a884[_i885];
              if (!(((_i885 >= _h886) && (_i885 < v_m)))) continue;
              _g880.push(v_x);
            }
          }
          L887: {
            const v_C = _g880;
            const _h888 = v_C.length;
            if (!((_h888 > 0))) break L887;
            const _h894 = (_h888 > 1);
            const v_b = (boatsOf(sp, cl, v_m) - done(b, sp, v_m));
            L889: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L889;
              facts.length = 0;
              changed = false;
              let _q890 = true;
              Q891: {
                const _a892 = v_C;
                for (let _i893 = 0; _i893 < _a892.length; _i893++) {
                  const v_x = _a892[_i893];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c900: boolean = true;
                  if (_c900) {
                    let _c899: boolean = _h894;
                    if (!_c899) {
                      let _q895 = true;
                      Q896: {
                        const _a897 = sp.adj4[v_x];
                        for (let _i898 = 0; _i898 < _a897.length; _i898++) {
                          const v_y = _a897[_i898];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q895 = false;
                            break Q896;
                          }
                        }
                      }
                      _c899 = _q895;
                    }
                    _c900 = _c899;
                  }
                  if (!(_c900)) {
                    _q890 = false;
                    break Q891;
                  }
                }
              }
              if (!(_q890)) return -1;
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
  const _a931 = sp.lines;
  for (let _i932 = 0; _i932 < _a931.length; _i932++) {
    const v_L = _a931[_i932];
    L933: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      if (!((v_v >= 0))) break L933;
      let _g934 = 0;
      G935: {
        const _a936 = sp.lineCells[v_L];
        for (let _i937 = 0; _i937 < _a936.length; _i937++) {
          const v_c = _a936[_i937];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g934++;
        }
      }
      L938: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g934);
        if (!(((v_t === 1) || (v_t === 2)))) break L938;
        const _a939 = sp.lineCells[v_L];
        for (let _i940 = 0; _i940 < _a939.length; _i940++) {
          const v_k = _a939[_i940];
          const v_K = crossing(sp, v_L, v_k);
          const v_j = numMarked(b, sp, cl, cands, v_K);
          const _h948 = (v_j >= 0);
          let _g941 = 0;
          G942: {
            const _a943 = sp.adj4[v_k];
            for (let _i944 = 0; _i944 < _a943.length; _i944++) {
              const v_x = _a943[_i944];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g941++;
            }
          }
          let _g945 = 0;
          G946: {
            for (let _i947 = 0; _i947 < 1; _i947++) {
              const v_x = v_k;
              let _c954: boolean = (!((b.grid[v_x] !== 0)) && _h948);
              if (_c954) {
                const _t949 = sp.lineCells[v_K];
                let _g950 = 0;
                G951: {
                  const _a952 = _t949;
                  for (let _i953 = 0; _i953 < _a952.length; _i953++) {
                    const v_c = _a952[_i953];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g950++;
                  }
                }
                _c954 = ((v_j - _g950) === 1);
              }
              if (!(_c954)) continue;
              _g945++;
            }
          }
          L955: {
            const v_s = (_g941 + _g945);
            if (!((v_s > v_t))) break L955;
            facts.length = 0;
            changed = false;
            let _q956 = true;
            Q957: {
              const _a958 = sp.adj4[v_k];
              for (let _i959 = 0; _i959 < _a958.length; _i959++) {
                const v_y = _a958[_i959];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q956 = false;
                  break Q957;
                }
              }
            }
            if (!(_q956)) return -1;
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

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g1267: number[] = [];
  const _g1273: number[] = [];
  const _g1283: number[] = [];
  const _g1296: number[] = [];
  const _g1315: number[] = [];
  const _g1361: number[] = [];
  const _g1370: number[] = [];
  const _g1456: number[] = [];
  const _g1471: number[] = [];
  const _g1481: number[] = [];
  const _g1495: number[] = [];
  const _g1513: number[] = [];
  const _g1527: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  if (lastWaterCands.length < sp.cells.length) lastWaterCands = new Int32Array(sp.cells.length);
  const cands = lastWaterCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1250 = -1;
  G1251: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1252 = cl.fleet.length[v_k];
      if (_g1250 === -1 || _t1252 > _g1250) _g1250 = _t1252;
    }
  }
  const v_T = _g1250;
  const _a1253 = sp.lines;
  for (let _i1254 = 0; _i1254 < _a1253.length; _i1254++) {
    const v_L = _a1253[_i1254];
    L1255: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1260: boolean = (v_v >= 0);
      if (_c1260) {
        let _g1256 = 0;
        G1257: {
          const _a1258 = sp.lineCells[v_L];
          for (let _i1259 = 0; _i1259 < _a1258.length; _i1259++) {
            const v_c = _a1258[_i1259];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1256++;
          }
        }
        _c1260 = (((sp.lineCells[v_L].length - v_v) - _g1256) === 1);
      }
      if (!(_c1260)) break L1255;
      const _a1261 = sp.lineCells[v_L];
      for (let _i1262 = 0; _i1262 < _a1261.length; _i1262++) {
        const v_c = _a1261[_i1262];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1291 = (v_j >= 0);
        let _g1263 = 0;
        G1264: {
          const _a1265 = sp.lineCells[v_K];
          for (let _i1266 = 0; _i1266 < _a1265.length; _i1266++) {
            const v_c = _a1265[_i1266];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1263++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1263);
        const _h1292 = (v_t === 1);
        const _h1293 = (_h1291 && _h1292);
        _g1267.length = 0;
        G1268: {
          const _a1271 = sp.lineCells[v_L];
          for (let _i1272 = 0; _i1272 < _a1271.length; _i1272++) {
            const v_x = _a1271[_i1272];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1267.push(v_x);
          }
        }
        _g1273.length = 0;
        G1274: {
          _g1283.length = 0;
          G1284: {
            const _a1287 = sp.lineCells[v_K];
            for (let _i1288 = 0; _i1288 < _a1287.length; _i1288++) {
              const v_x = _a1287[_i1288];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1283.push(v_x);
            }
          }
          const _a1289 = _g1283;
          for (let _i1290 = 0; _i1290 < _a1289.length; _i1290++) {
            const v_x = _a1289[_i1290];
            if (!(_h1293)) continue;
            _g1273.push(v_x);
          }
        }
        L1294: {
          const v_H = union(_g1267, _g1273);
          const _t1295 = setOf(v_c);
          _g1296.length = 0;
          G1297: {
            const _a1302 = v_H;
            for (let _i1303 = 0; _i1303 < _a1302.length; _i1303++) {
              const v_a = _a1302[_i1303];
              const _a1304 = sp.adj8[v_a];
              for (let _i1305 = 0; _i1305 < _a1304.length; _i1305++) {
                const v_d = _a1304[_i1305];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1296.includes(v_d)) _g1296.push(v_d);
              }
            }
          }
          const _t1306 = union(_t1295, _g1296);
          let _q1307 = false;
          Q1308: {
            const _a1309 = v_H;
            for (let _i1310 = 0; _i1310 < _a1309.length; _i1310++) {
              const v_a = _a1309[_i1310];
              const _a1311 = sp.adj8[v_a];
              for (let _i1312 = 0; _i1312 < _a1311.length; _i1312++) {
                const v_b = _a1311[_i1312];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1307 = true;
                  break Q1308;
                }
              }
            }
          }
          let _c1339: boolean = _q1307;
          if (!_c1339) {
            let _q1313 = false;
            Q1314: {
              _g1315.length = 0;
              G1316: {
                const _a1322 = union(v_H, _t1306);
                for (let _i1323 = 0; _i1323 < _a1322.length; _i1323++) {
                  const v_a = _a1322[_i1323];
                  const _t1324 = sp.rowOf[v_a];
                  const _t1325 = sp.colOf[v_a];
                  for (let _i1326 = 0; _i1326 < 2; _i1326++) {
                    const v_M = _i1326 === 0 ? _t1324 : _t1325;
                    if (_i1326 === 1 && (v_M === _t1324)) continue;
                    if (!_g1315.includes(v_M)) _g1315.push(v_M);
                  }
                }
              }
              const _a1327 = _g1315;
              for (let _i1328 = 0; _i1328 < _a1327.length; _i1328++) {
                const v_L = _a1327[_i1328];
                L1329: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1329;
                  let _g1330 = 0;
                  G1331: {
                    const _a1332 = sp.lineCells[v_L];
                    for (let _i1333 = 0; _i1333 < _a1332.length; _i1333++) {
                      const v_x = _a1332[_i1333];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1330++;
                    }
                  }
                  let _c1338: boolean = (_g1330 > v_v);
                  if (!_c1338) {
                    let _g1334 = 0;
                    G1335: {
                      const _a1336 = sp.lineCells[v_L];
                      for (let _i1337 = 0; _i1337 < _a1336.length; _i1337++) {
                        const v_x = _a1336[_i1337];
                        if (!((!(_t1306.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1334++;
                      }
                    }
                    _c1338 = (_g1334 < v_v);
                  }
                  if (_c1338) {
                    _q1313 = true;
                    break Q1314;
                  }
                }
              }
            }
            _c1339 = _q1313;
          }
          let _c1346: boolean = _c1339;
          if (!_c1346) {
            let _g1340 = 0;
            G1341: {
              const _a1342 = sp.cells;
              for (let _i1343 = 0; _i1343 < _a1342.length; _i1343++) {
                const v_x = _a1342[_i1343];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1340++;
              }
            }
            let _g1344 = 0;
            G1345: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1344 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1346 = (_g1340 > _g1344);
          }
          let _c1353: boolean = _c1346;
          if (!_c1353) {
            let _g1347 = 0;
            G1348: {
              const _a1349 = sp.cells;
              for (let _i1350 = 0; _i1350 < _a1349.length; _i1350++) {
                const v_x = _a1349[_i1350];
                if (!((!(_t1306.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1347++;
              }
            }
            let _g1351 = 0;
            G1352: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1351 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1353 = (_g1347 < _g1351);
          }
          let _c1367: boolean = _c1353;
          if (!_c1367) {
            let _q1354 = false;
            Q1355: {
              const _a1356 = v_H;
              for (let _i1357 = 0; _i1357 < _a1356.length; _i1357++) {
                const v_a = _a1356[_i1357];
                const _t1358 = sp.rowOf[v_a];
                const _t1359 = sp.colOf[v_a];
                for (let _i1360 = 0; _i1360 < 2; _i1360++) {
                  const v_L = _i1360 === 0 ? _t1358 : _t1359;
                  if (_i1360 === 1 && (v_L === _t1358)) continue;
                  _g1361.length = 0;
                  G1362: {
                    const _a1365 = sp.lineCells[v_L];
                    for (let _i1366 = 0; _i1366 < _a1365.length; _i1366++) {
                      const v_x = _a1365[_i1366];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1361.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1361).length > v_T)) {
                    _q1354 = true;
                    break Q1355;
                  }
                }
              }
            }
            _c1367 = _q1354;
          }
          let _c1545: boolean = _c1367;
          if (!_c1545) {
            let _q1368 = false;
            Q1369: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1370.length = 0;
                G1371: {
                  _g1456.length = 0;
                  G1457: {
                    const _a1462 = union(v_H, _t1306);
                    for (let _i1463 = 0; _i1463 < _a1462.length; _i1463++) {
                      const v_x = _a1462[_i1463];
                      const _a1464 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1465 = 0; _i1465 < _a1464.length; _i1465++) {
                        const v_y = _a1464[_i1465];
                        if (!_g1456.includes(v_y)) _g1456.push(v_y);
                      }
                    }
                  }
                  const _a1466 = _g1456;
                  for (let _i1467 = 0; _i1467 < _a1466.length; _i1467++) {
                    const v_a = _a1466[_i1467];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t1468 = sp.rowOf[v_a];
                    const _t1469 = sp.colOf[v_a];
                    for (let _i1470 = 0; _i1470 < 2; _i1470++) {
                      const v_L = _i1470 === 0 ? _t1468 : _t1469;
                      if (_i1470 === 1 && (v_L === _t1468)) continue;
                      _g1471.length = 0;
                      G1472: {
                        const _a1475 = sp.lineCells[v_L];
                        for (let _i1476 = 0; _i1476 < _a1475.length; _i1476++) {
                          const v_x = _a1475[_i1476];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1471.push(v_x);
                        }
                      }
                      L1477: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1471);
                        const _h1478 = v_G.length;
                        const _h1507 = (_h1478 === 1);
                        let _c1510: boolean = (_h1478 === v_m);
                        if (_c1510) {
                          let _q1479 = true;
                          Q1480: {
                            _g1481.length = 0;
                            G1482: {
                              _g1495.length = 0;
                              G1496: {
                                const _a1501 = v_G;
                                for (let _i1502 = 0; _i1502 < _a1501.length; _i1502++) {
                                  const v_g = _a1501[_i1502];
                                  const _a1503 = sp.adj4[v_g];
                                  for (let _i1504 = 0; _i1504 < _a1503.length; _i1504++) {
                                    const v_z = _a1503[_i1504];
                                    if (!_g1495.includes(v_z)) _g1495.push(v_z);
                                  }
                                }
                              }
                              const _a1505 = _g1495;
                              for (let _i1506 = 0; _i1506 < _a1505.length; _i1506++) {
                                const v_y = _a1505[_i1506];
                                if (!((!(v_G.includes(v_y)) && (_h1507 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1481.push(v_y);
                              }
                            }
                            const _a1508 = _g1481;
                            for (let _i1509 = 0; _i1509 < _a1508.length; _i1509++) {
                              const v_y = _a1508[_i1509];
                              if (!(((_t1306.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1479 = false;
                                break Q1480;
                              }
                            }
                          }
                          _c1510 = _q1479;
                        }
                        let _c1541: boolean = _c1510;
                        if (_c1541) {
                          let _q1511 = false;
                          Q1512: {
                            _g1513.length = 0;
                            G1514: {
                              _g1527.length = 0;
                              G1528: {
                                const _a1533 = v_G;
                                for (let _i1534 = 0; _i1534 < _a1533.length; _i1534++) {
                                  const v_g = _a1533[_i1534];
                                  const _a1535 = sp.adj4[v_g];
                                  for (let _i1536 = 0; _i1536 < _a1535.length; _i1536++) {
                                    const v_z = _a1535[_i1536];
                                    if (!_g1527.includes(v_z)) _g1527.push(v_z);
                                  }
                                }
                              }
                              const _a1537 = _g1527;
                              for (let _i1538 = 0; _i1538 < _a1537.length; _i1538++) {
                                const v_y = _a1537[_i1538];
                                if (!((!(v_G.includes(v_y)) && (_h1507 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1513.push(v_y);
                              }
                            }
                            const _a1539 = union(v_G, _g1513);
                            for (let _i1540 = 0; _i1540 < _a1539.length; _i1540++) {
                              const v_x = _a1539[_i1540];
                              if (((v_H.includes(v_x)) || (_t1306.includes(v_x)))) {
                                _q1511 = true;
                                break Q1512;
                              }
                            }
                          }
                          _c1541 = _q1511;
                        }
                        if (!(_c1541)) break L1477;
                        const _t1542 = (v_G[0] ?? -1);
                        if (!_g1370.includes(_t1542)) _g1370.push(_t1542);
                      }
                    }
                  }
                }
                L1543: {
                  const v_C = _g1370;
                  const _h1544 = v_C.length;
                  if (!((_h1544 > 0))) break L1543;
                  if ((_h1544 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q1368 = true;
                    break Q1369;
                  }
                }
              }
            }
            _c1545 = _q1368;
          }
          if (!(_c1545)) break L1294;
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

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g1857: number[] = [];
  const _g1863: number[] = [];
  const _g1873: number[] = [];
  const _g1886: number[] = [];
  const _g1905: number[] = [];
  const _g1951: number[] = [];
  const _g1960: number[] = [];
  const _g2046: number[] = [];
  const _g2061: number[] = [];
  const _g2071: number[] = [];
  const _g2085: number[] = [];
  const _g2103: number[] = [];
  const _g2117: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  if (lastShipCands.length < sp.cells.length) lastShipCands = new Int32Array(sp.cells.length);
  const cands = lastShipCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1838 = -1;
  G1839: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1840 = cl.fleet.length[v_k];
      if (_g1838 === -1 || _t1840 > _g1838) _g1838 = _t1840;
    }
  }
  const v_T = _g1838;
  const _a1841 = sp.lines;
  for (let _i1842 = 0; _i1842 < _a1841.length; _i1842++) {
    const v_L = _a1841[_i1842];
    L1843: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1849: boolean = (v_v >= 0);
      if (_c1849) {
        const _t1844 = sp.lineCells[v_L];
        let _g1845 = 0;
        G1846: {
          const _a1847 = _t1844;
          for (let _i1848 = 0; _i1848 < _a1847.length; _i1848++) {
            const v_c = _a1847[_i1848];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1845++;
          }
        }
        _c1849 = ((v_v - _g1845) === 1);
      }
      if (!(_c1849)) break L1843;
      const _a1850 = sp.lineCells[v_L];
      for (let _i1851 = 0; _i1851 < _a1850.length; _i1851++) {
        const v_c = _a1850[_i1851];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1881 = (v_j >= 0);
        const _t1852 = sp.lineCells[v_K];
        let _g1853 = 0;
        G1854: {
          const _a1855 = _t1852;
          for (let _i1856 = 0; _i1856 < _a1855.length; _i1856++) {
            const v_c = _a1855[_i1856];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g1853++;
          }
        }
        const v_u = (v_j - _g1853);
        const _h1882 = (v_u === 1);
        const _h1883 = (_h1881 && _h1882);
        _g1857.length = 0;
        G1858: {
          const _a1861 = sp.lineCells[v_L];
          for (let _i1862 = 0; _i1862 < _a1861.length; _i1862++) {
            const v_x = _a1861[_i1862];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1857.push(v_x);
          }
        }
        _g1863.length = 0;
        G1864: {
          _g1873.length = 0;
          G1874: {
            const _a1877 = sp.lineCells[v_K];
            for (let _i1878 = 0; _i1878 < _a1877.length; _i1878++) {
              const v_x = _a1877[_i1878];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1873.push(v_x);
            }
          }
          const _a1879 = _g1873;
          for (let _i1880 = 0; _i1880 < _a1879.length; _i1880++) {
            const v_x = _a1879[_i1880];
            if (!(_h1883)) continue;
            _g1863.push(v_x);
          }
        }
        L1884: {
          const v_W = union(_g1857, _g1863);
          const _t1885 = setOf(v_c);
          _g1886.length = 0;
          G1887: {
            const _a1892 = _t1885;
            for (let _i1893 = 0; _i1893 < _a1892.length; _i1893++) {
              const v_a = _a1892[_i1893];
              const _a1894 = sp.adj8[v_a];
              for (let _i1895 = 0; _i1895 < _a1894.length; _i1895++) {
                const v_d = _a1894[_i1895];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g1886.includes(v_d)) _g1886.push(v_d);
              }
            }
          }
          const _t1896 = union(v_W, _g1886);
          let _q1897 = false;
          Q1898: {
            const _a1899 = _t1885;
            for (let _i1900 = 0; _i1900 < _a1899.length; _i1900++) {
              const v_a = _a1899[_i1900];
              const _a1901 = sp.adj8[v_a];
              for (let _i1902 = 0; _i1902 < _a1901.length; _i1902++) {
                const v_b = _a1901[_i1902];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t1885.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1897 = true;
                  break Q1898;
                }
              }
            }
          }
          let _c1929: boolean = _q1897;
          if (!_c1929) {
            let _q1903 = false;
            Q1904: {
              _g1905.length = 0;
              G1906: {
                const _a1912 = union(_t1885, _t1896);
                for (let _i1913 = 0; _i1913 < _a1912.length; _i1913++) {
                  const v_a = _a1912[_i1913];
                  const _t1914 = sp.rowOf[v_a];
                  const _t1915 = sp.colOf[v_a];
                  for (let _i1916 = 0; _i1916 < 2; _i1916++) {
                    const v_M = _i1916 === 0 ? _t1914 : _t1915;
                    if (_i1916 === 1 && (v_M === _t1914)) continue;
                    if (!_g1905.includes(v_M)) _g1905.push(v_M);
                  }
                }
              }
              const _a1917 = _g1905;
              for (let _i1918 = 0; _i1918 < _a1917.length; _i1918++) {
                const v_L = _a1917[_i1918];
                L1919: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1919;
                  let _g1920 = 0;
                  G1921: {
                    const _a1922 = sp.lineCells[v_L];
                    for (let _i1923 = 0; _i1923 < _a1922.length; _i1923++) {
                      const v_x = _a1922[_i1923];
                      if (!(((_t1885.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1920++;
                    }
                  }
                  let _c1928: boolean = (_g1920 > v_v);
                  if (!_c1928) {
                    let _g1924 = 0;
                    G1925: {
                      const _a1926 = sp.lineCells[v_L];
                      for (let _i1927 = 0; _i1927 < _a1926.length; _i1927++) {
                        const v_x = _a1926[_i1927];
                        if (!((!(_t1896.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1924++;
                      }
                    }
                    _c1928 = (_g1924 < v_v);
                  }
                  if (_c1928) {
                    _q1903 = true;
                    break Q1904;
                  }
                }
              }
            }
            _c1929 = _q1903;
          }
          let _c1936: boolean = _c1929;
          if (!_c1936) {
            let _g1930 = 0;
            G1931: {
              const _a1932 = sp.cells;
              for (let _i1933 = 0; _i1933 < _a1932.length; _i1933++) {
                const v_x = _a1932[_i1933];
                if (!(((_t1885.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1930++;
              }
            }
            let _g1934 = 0;
            G1935: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1934 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1936 = (_g1930 > _g1934);
          }
          let _c1943: boolean = _c1936;
          if (!_c1943) {
            let _g1937 = 0;
            G1938: {
              const _a1939 = sp.cells;
              for (let _i1940 = 0; _i1940 < _a1939.length; _i1940++) {
                const v_x = _a1939[_i1940];
                if (!((!(_t1896.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1937++;
              }
            }
            let _g1941 = 0;
            G1942: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1941 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1943 = (_g1937 < _g1941);
          }
          let _c1957: boolean = _c1943;
          if (!_c1957) {
            let _q1944 = false;
            Q1945: {
              const _a1946 = _t1885;
              for (let _i1947 = 0; _i1947 < _a1946.length; _i1947++) {
                const v_a = _a1946[_i1947];
                const _t1948 = sp.rowOf[v_a];
                const _t1949 = sp.colOf[v_a];
                for (let _i1950 = 0; _i1950 < 2; _i1950++) {
                  const v_L = _i1950 === 0 ? _t1948 : _t1949;
                  if (_i1950 === 1 && (v_L === _t1948)) continue;
                  _g1951.length = 0;
                  G1952: {
                    const _a1955 = sp.lineCells[v_L];
                    for (let _i1956 = 0; _i1956 < _a1955.length; _i1956++) {
                      const v_x = _a1955[_i1956];
                      if (!(((_t1885.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1951.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1951).length > v_T)) {
                    _q1944 = true;
                    break Q1945;
                  }
                }
              }
            }
            _c1957 = _q1944;
          }
          let _c2135: boolean = _c1957;
          if (!_c2135) {
            let _q1958 = false;
            Q1959: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1960.length = 0;
                G1961: {
                  _g2046.length = 0;
                  G2047: {
                    const _a2052 = union(_t1885, _t1896);
                    for (let _i2053 = 0; _i2053 < _a2052.length; _i2053++) {
                      const v_x = _a2052[_i2053];
                      const _a2054 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2055 = 0; _i2055 < _a2054.length; _i2055++) {
                        const v_y = _a2054[_i2055];
                        if (!_g2046.includes(v_y)) _g2046.push(v_y);
                      }
                    }
                  }
                  const _a2056 = _g2046;
                  for (let _i2057 = 0; _i2057 < _a2056.length; _i2057++) {
                    const v_a = _a2056[_i2057];
                    if (!(((_t1885.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2058 = sp.rowOf[v_a];
                    const _t2059 = sp.colOf[v_a];
                    for (let _i2060 = 0; _i2060 < 2; _i2060++) {
                      const v_L = _i2060 === 0 ? _t2058 : _t2059;
                      if (_i2060 === 1 && (v_L === _t2058)) continue;
                      _g2061.length = 0;
                      G2062: {
                        const _a2065 = sp.lineCells[v_L];
                        for (let _i2066 = 0; _i2066 < _a2065.length; _i2066++) {
                          const v_x = _a2065[_i2066];
                          if (!(((_t1885.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2061.push(v_x);
                        }
                      }
                      L2067: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2061);
                        const _h2068 = v_G.length;
                        const _h2097 = (_h2068 === 1);
                        let _c2100: boolean = (_h2068 === v_m);
                        if (_c2100) {
                          let _q2069 = true;
                          Q2070: {
                            _g2071.length = 0;
                            G2072: {
                              _g2085.length = 0;
                              G2086: {
                                const _a2091 = v_G;
                                for (let _i2092 = 0; _i2092 < _a2091.length; _i2092++) {
                                  const v_g = _a2091[_i2092];
                                  const _a2093 = sp.adj4[v_g];
                                  for (let _i2094 = 0; _i2094 < _a2093.length; _i2094++) {
                                    const v_z = _a2093[_i2094];
                                    if (!_g2085.includes(v_z)) _g2085.push(v_z);
                                  }
                                }
                              }
                              const _a2095 = _g2085;
                              for (let _i2096 = 0; _i2096 < _a2095.length; _i2096++) {
                                const v_y = _a2095[_i2096];
                                if (!((!(v_G.includes(v_y)) && (_h2097 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2071.push(v_y);
                              }
                            }
                            const _a2098 = _g2071;
                            for (let _i2099 = 0; _i2099 < _a2098.length; _i2099++) {
                              const v_y = _a2098[_i2099];
                              if (!(((_t1896.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2069 = false;
                                break Q2070;
                              }
                            }
                          }
                          _c2100 = _q2069;
                        }
                        let _c2131: boolean = _c2100;
                        if (_c2131) {
                          let _q2101 = false;
                          Q2102: {
                            _g2103.length = 0;
                            G2104: {
                              _g2117.length = 0;
                              G2118: {
                                const _a2123 = v_G;
                                for (let _i2124 = 0; _i2124 < _a2123.length; _i2124++) {
                                  const v_g = _a2123[_i2124];
                                  const _a2125 = sp.adj4[v_g];
                                  for (let _i2126 = 0; _i2126 < _a2125.length; _i2126++) {
                                    const v_z = _a2125[_i2126];
                                    if (!_g2117.includes(v_z)) _g2117.push(v_z);
                                  }
                                }
                              }
                              const _a2127 = _g2117;
                              for (let _i2128 = 0; _i2128 < _a2127.length; _i2128++) {
                                const v_y = _a2127[_i2128];
                                if (!((!(v_G.includes(v_y)) && (_h2097 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2103.push(v_y);
                              }
                            }
                            const _a2129 = union(v_G, _g2103);
                            for (let _i2130 = 0; _i2130 < _a2129.length; _i2130++) {
                              const v_x = _a2129[_i2130];
                              if (((_t1885.includes(v_x)) || (_t1896.includes(v_x)))) {
                                _q2101 = true;
                                break Q2102;
                              }
                            }
                          }
                          _c2131 = _q2101;
                        }
                        if (!(_c2131)) break L2067;
                        const _t2132 = (v_G[0] ?? -1);
                        if (!_g1960.includes(_t2132)) _g1960.push(_t2132);
                      }
                    }
                  }
                }
                L2133: {
                  const v_C = _g1960;
                  const _h2134 = v_C.length;
                  if (!((_h2134 > 0))) break L2133;
                  if ((_h2134 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q1958 = true;
                    break Q1959;
                  }
                }
              }
            }
            _c2135 = _q1958;
          }
          if (!(_c2135)) break L1884;
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

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g2419: number[] = [];
  const _g2432: number[] = [];
  const _g2438: number[] = [];
  const _g2457: number[] = [];
  const _g2503: number[] = [];
  const _g2512: number[] = [];
  const _g2598: number[] = [];
  const _g2613: number[] = [];
  const _g2623: number[] = [];
  const _g2637: number[] = [];
  const _g2655: number[] = [];
  const _g2669: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  if (centerTrialCands.length < sp.cells.length) centerTrialCands = new Int32Array(sp.cells.length);
  const cands = centerTrialCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g2410 = -1;
  G2411: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2412 = cl.fleet.length[v_k];
      if (_g2410 === -1 || _t2412 > _g2410) _g2410 = _t2412;
    }
  }
  const v_T = _g2410;
  const _a2413 = cluesValued(cl.seg, 6);
  for (let _i2414 = 0; _i2414 < _a2413.length; _i2414++) {
    const v_c = _a2413[_i2414];
    const _h2415 = clueAt(cl.seg, v_c);
    if (!((_h2415 === 6))) continue;
    const _t2416 = sp.rowOf[v_c];
    const _t2417 = sp.colOf[v_c];
    for (let _i2418 = 0; _i2418 < 2; _i2418++) {
      const v_L = _i2418 === 0 ? _t2416 : _t2417;
      if (_i2418 === 1 && (v_L === _t2416)) continue;
      _g2419.length = 0;
      G2420: {
        const _a2423 = sp.adj4[v_c];
        for (let _i2424 = 0; _i2424 < _a2423.length; _i2424++) {
          const v_x = _a2423[_i2424];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g2419.push(v_x);
        }
      }
      L2425: {
        const v_S = _g2419;
        const _h2426 = v_S.length;
        let _c2431: boolean = (_h2426 === 2);
        if (_c2431) {
          let _q2427 = false;
          Q2428: {
            const _a2429 = v_S;
            for (let _i2430 = 0; _i2430 < _a2429.length; _i2430++) {
              const v_x = _a2429[_i2430];
              if (!((b.grid[v_x] !== 0))) {
                _q2427 = true;
                break Q2428;
              }
            }
          }
          _c2431 = _q2427;
        }
        let _c2688: boolean = _c2431;
        if (_c2688) {
          _g2432.length = 0;
          G2433: {
            const _a2436 = v_S;
            for (let _i2437 = 0; _i2437 < _a2436.length; _i2437++) {
              const v_x = _a2436[_i2437];
              if (!((v_x !== v_x))) continue;
              _g2432.push(v_x);
            }
          }
          _g2438.length = 0;
          G2439: {
            const _a2444 = v_S;
            for (let _i2445 = 0; _i2445 < _a2444.length; _i2445++) {
              const v_a = _a2444[_i2445];
              const _a2446 = sp.adj8[v_a];
              for (let _i2447 = 0; _i2447 < _a2446.length; _i2447++) {
                const v_d = _a2446[_i2447];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                if (!_g2438.includes(v_d)) _g2438.push(v_d);
              }
            }
          }
          const _t2448 = union(_g2432, _g2438);
          let _q2449 = false;
          Q2450: {
            const _a2451 = v_S;
            for (let _i2452 = 0; _i2452 < _a2451.length; _i2452++) {
              const v_a = _a2451[_i2452];
              const _a2453 = sp.adj8[v_a];
              for (let _i2454 = 0; _i2454 < _a2453.length; _i2454++) {
                const v_b = _a2453[_i2454];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2449 = true;
                  break Q2450;
                }
              }
            }
          }
          let _c2481: boolean = _q2449;
          if (!_c2481) {
            let _q2455 = false;
            Q2456: {
              _g2457.length = 0;
              G2458: {
                const _a2464 = union(v_S, _t2448);
                for (let _i2465 = 0; _i2465 < _a2464.length; _i2465++) {
                  const v_a = _a2464[_i2465];
                  const _t2466 = sp.rowOf[v_a];
                  const _t2467 = sp.colOf[v_a];
                  for (let _i2468 = 0; _i2468 < 2; _i2468++) {
                    const v_M = _i2468 === 0 ? _t2466 : _t2467;
                    if (_i2468 === 1 && (v_M === _t2466)) continue;
                    if (!_g2457.includes(v_M)) _g2457.push(v_M);
                  }
                }
              }
              const _a2469 = _g2457;
              for (let _i2470 = 0; _i2470 < _a2469.length; _i2470++) {
                const v_L = _a2469[_i2470];
                L2471: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L2471;
                  let _g2472 = 0;
                  G2473: {
                    const _a2474 = sp.lineCells[v_L];
                    for (let _i2475 = 0; _i2475 < _a2474.length; _i2475++) {
                      const v_x = _a2474[_i2475];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2472++;
                    }
                  }
                  let _c2480: boolean = (_g2472 > v_v);
                  if (!_c2480) {
                    let _g2476 = 0;
                    G2477: {
                      const _a2478 = sp.lineCells[v_L];
                      for (let _i2479 = 0; _i2479 < _a2478.length; _i2479++) {
                        const v_x = _a2478[_i2479];
                        if (!((!(_t2448.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2476++;
                      }
                    }
                    _c2480 = (_g2476 < v_v);
                  }
                  if (_c2480) {
                    _q2455 = true;
                    break Q2456;
                  }
                }
              }
            }
            _c2481 = _q2455;
          }
          let _c2488: boolean = _c2481;
          if (!_c2488) {
            let _g2482 = 0;
            G2483: {
              const _a2484 = sp.cells;
              for (let _i2485 = 0; _i2485 < _a2484.length; _i2485++) {
                const v_x = _a2484[_i2485];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2482++;
              }
            }
            let _g2486 = 0;
            G2487: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2486 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2488 = (_g2482 > _g2486);
          }
          let _c2495: boolean = _c2488;
          if (!_c2495) {
            let _g2489 = 0;
            G2490: {
              const _a2491 = sp.cells;
              for (let _i2492 = 0; _i2492 < _a2491.length; _i2492++) {
                const v_x = _a2491[_i2492];
                if (!((!(_t2448.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2489++;
              }
            }
            let _g2493 = 0;
            G2494: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2493 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2495 = (_g2489 < _g2493);
          }
          let _c2509: boolean = _c2495;
          if (!_c2509) {
            let _q2496 = false;
            Q2497: {
              const _a2498 = v_S;
              for (let _i2499 = 0; _i2499 < _a2498.length; _i2499++) {
                const v_a = _a2498[_i2499];
                const _t2500 = sp.rowOf[v_a];
                const _t2501 = sp.colOf[v_a];
                for (let _i2502 = 0; _i2502 < 2; _i2502++) {
                  const v_L = _i2502 === 0 ? _t2500 : _t2501;
                  if (_i2502 === 1 && (v_L === _t2500)) continue;
                  _g2503.length = 0;
                  G2504: {
                    const _a2507 = sp.lineCells[v_L];
                    for (let _i2508 = 0; _i2508 < _a2507.length; _i2508++) {
                      const v_x = _a2507[_i2508];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2503.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2503).length > v_T)) {
                    _q2496 = true;
                    break Q2497;
                  }
                }
              }
            }
            _c2509 = _q2496;
          }
          let _c2687: boolean = _c2509;
          if (!_c2687) {
            let _q2510 = false;
            Q2511: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2512.length = 0;
                G2513: {
                  _g2598.length = 0;
                  G2599: {
                    const _a2604 = union(v_S, _t2448);
                    for (let _i2605 = 0; _i2605 < _a2604.length; _i2605++) {
                      const v_x = _a2604[_i2605];
                      const _a2606 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2607 = 0; _i2607 < _a2606.length; _i2607++) {
                        const v_y = _a2606[_i2607];
                        if (!_g2598.includes(v_y)) _g2598.push(v_y);
                      }
                    }
                  }
                  const _a2608 = _g2598;
                  for (let _i2609 = 0; _i2609 < _a2608.length; _i2609++) {
                    const v_a = _a2608[_i2609];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2610 = sp.rowOf[v_a];
                    const _t2611 = sp.colOf[v_a];
                    for (let _i2612 = 0; _i2612 < 2; _i2612++) {
                      const v_L = _i2612 === 0 ? _t2610 : _t2611;
                      if (_i2612 === 1 && (v_L === _t2610)) continue;
                      _g2613.length = 0;
                      G2614: {
                        const _a2617 = sp.lineCells[v_L];
                        for (let _i2618 = 0; _i2618 < _a2617.length; _i2618++) {
                          const v_x = _a2617[_i2618];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2613.push(v_x);
                        }
                      }
                      L2619: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2613);
                        const _h2620 = v_G.length;
                        const _h2649 = (_h2620 === 1);
                        let _c2652: boolean = (_h2620 === v_m);
                        if (_c2652) {
                          let _q2621 = true;
                          Q2622: {
                            _g2623.length = 0;
                            G2624: {
                              _g2637.length = 0;
                              G2638: {
                                const _a2643 = v_G;
                                for (let _i2644 = 0; _i2644 < _a2643.length; _i2644++) {
                                  const v_g = _a2643[_i2644];
                                  const _a2645 = sp.adj4[v_g];
                                  for (let _i2646 = 0; _i2646 < _a2645.length; _i2646++) {
                                    const v_z = _a2645[_i2646];
                                    if (!_g2637.includes(v_z)) _g2637.push(v_z);
                                  }
                                }
                              }
                              const _a2647 = _g2637;
                              for (let _i2648 = 0; _i2648 < _a2647.length; _i2648++) {
                                const v_y = _a2647[_i2648];
                                if (!((!(v_G.includes(v_y)) && (_h2649 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2623.push(v_y);
                              }
                            }
                            const _a2650 = _g2623;
                            for (let _i2651 = 0; _i2651 < _a2650.length; _i2651++) {
                              const v_y = _a2650[_i2651];
                              if (!(((_t2448.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2621 = false;
                                break Q2622;
                              }
                            }
                          }
                          _c2652 = _q2621;
                        }
                        let _c2683: boolean = _c2652;
                        if (_c2683) {
                          let _q2653 = false;
                          Q2654: {
                            _g2655.length = 0;
                            G2656: {
                              _g2669.length = 0;
                              G2670: {
                                const _a2675 = v_G;
                                for (let _i2676 = 0; _i2676 < _a2675.length; _i2676++) {
                                  const v_g = _a2675[_i2676];
                                  const _a2677 = sp.adj4[v_g];
                                  for (let _i2678 = 0; _i2678 < _a2677.length; _i2678++) {
                                    const v_z = _a2677[_i2678];
                                    if (!_g2669.includes(v_z)) _g2669.push(v_z);
                                  }
                                }
                              }
                              const _a2679 = _g2669;
                              for (let _i2680 = 0; _i2680 < _a2679.length; _i2680++) {
                                const v_y = _a2679[_i2680];
                                if (!((!(v_G.includes(v_y)) && (_h2649 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2655.push(v_y);
                              }
                            }
                            const _a2681 = union(v_G, _g2655);
                            for (let _i2682 = 0; _i2682 < _a2681.length; _i2682++) {
                              const v_x = _a2681[_i2682];
                              if (((v_S.includes(v_x)) || (_t2448.includes(v_x)))) {
                                _q2653 = true;
                                break Q2654;
                              }
                            }
                          }
                          _c2683 = _q2653;
                        }
                        if (!(_c2683)) break L2619;
                        const _t2684 = (v_G[0] ?? -1);
                        if (!_g2512.includes(_t2684)) _g2512.push(_t2684);
                      }
                    }
                  }
                }
                L2685: {
                  const v_C = _g2512;
                  const _h2686 = v_C.length;
                  if (!((_h2686 > 0))) break L2685;
                  if ((_h2686 > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                    _q2510 = true;
                    break Q2511;
                  }
                }
              }
            }
            _c2687 = _q2510;
          }
          _c2688 = _c2687;
        }
        if (!(_c2688)) break L2425;
        facts.length = 0;
        changed = false;
        let _q2689 = true;
        Q2690: {
          const _a2691 = v_S;
          for (let _i2692 = 0; _i2692 < _a2691.length; _i2692++) {
            const v_x = _a2691[_i2692];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q2689 = false;
              break Q2690;
            }
          }
        }
        if (!(_q2689)) return -1;
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

/** `boatsOf(m)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function boatsOf(_sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = boatsOfKept.board(cl);
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

/** `par(L)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function par(sp: GridSpace, v_L: number): readonly number[] {
  const _kept: Kept<readonly number[]> = parKept.board(sp);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  const _g691: number[] = [];
  G692: {
    const _a695 = sp.lines;
    for (let _i696 = 0; _i696 < _a695.length; _i696++) {
      const v_M = _a695[_i696];
      if (!(((v_M !== v_L) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)))))) continue;
      _g691.push(v_M);
    }
  }
  const _made = _g691;
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
    for (let _i688 = 0; _i688 < 1; _i688++) {
      const v_K = v_L;
      let _c707: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c707) {
        let _q689 = true;
        Q690: {
          const _a697 = par(sp, v_K);
          for (let _i698 = 0; _i698 < _a697.length; _i698++) {
            const v_M = _a697[_i698];
            let _c706: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c706) {
              const _t699 = sp.lineCells[v_M];
              const _g700: number[] = [];
              G701: {
                const _a704 = _t699;
                for (let _i705 = 0; _i705 < _a704.length; _i705++) {
                  const v_c = _a704[_i705];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g700.push(v_c);
                }
              }
              _c706 = (_g700.length === 0);
            }
            if (!(_c706)) {
              _q689 = false;
              break Q690;
            }
          }
        }
        _c707 = _q689;
      }
      if (!(_c707)) continue;
      let _g708 = 0;
      G709: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g708 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g710 = 0;
      G711: {
        const _a712 = par(sp, v_K);
        for (let _i713 = 0; _i713 < _a712.length; _i713++) {
          const v_M = _a712[_i713];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g710 += clueAt(cl.n, v_M);
        }
      }
      let _g714 = 0;
      G715: {
        const _a716 = par(sp, v_K);
        for (let _i717 = 0; _i717 < _a716.length; _i717++) {
          const v_M = _a716[_i717];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t718 = sp.lineCells[v_M];
          let _g719 = 0;
          G720: {
            const _a721 = _t718;
            for (let _i722 = 0; _i722 < _a721.length; _i722++) {
              const v_c = _a721[_i722];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g719++;
            }
          }
          _g714 += _g719;
        }
      }
      const _t723 = ((_g708 - _g710) - _g714);
      if (_g686 === -1 || _t723 > _g686) _g686 = _t723;
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
  let _q808 = false;
  Q809: {
    const _a810 = sp.lines;
    for (let _i811 = 0; _i811 < _a810.length; _i811++) {
      const v_K = _a810[_i811];
      const _a812 = sp.lineCells[v_K];
      for (let _i813 = 0; _i813 < _a812.length; _i813++) {
        const v_d = _a812[_i813];
        let _c818: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c818) {
          let _q814 = false;
          Q815: {
            const _a816 = sp.adj4[v_d];
            for (let _i817 = 0; _i817 < _a816.length; _i817++) {
              const v_p = _a816[_i817];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q814 = true;
                break Q815;
              }
            }
          }
          _c818 = !(_q814);
        }
        if (!(_c818)) continue;
        const _g819: number[] = [];
        G820: {
          const _a823 = sp.lineCells[v_K];
          for (let _i824 = 0; _i824 < _a823.length; _i824++) {
            const v_x = _a823[_i824];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g819.push(v_x);
          }
        }
        L825: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g819);
          let _g826 = 0;
          G827: {
            const _a828 = v_R;
            for (let _i829 = 0; _i829 < _a828.length; _i829++) {
              const v_c = _a828[_i829];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g826++;
            }
          }
          let _c840: boolean = ((_g826 < v_R.length) && (v_R.length >= v_m));
          if (_c840) {
            let _c839: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c839) {
              const _t830 = sp.lineCells[v_K];
              let _g831 = 0;
              G832: {
                const _a833 = _t830;
                for (let _i834 = 0; _i834 < _a833.length; _i834++) {
                  const v_c = _a833[_i834];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g831++;
                }
              }
              let _g835 = 0;
              G836: {
                const _a837 = v_R;
                for (let _i838 = 0; _i838 < _a837.length; _i838++) {
                  const v_c = _a837[_i838];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g835++;
                }
              }
              _c839 = (((clueAt(cl.n, v_K) - _g831) + _g835) >= v_m);
            }
            _c840 = _c839;
          }
          if (!(_c840)) break L825;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q808 = true;
            break Q809;
          }
        }
      }
    }
  }
  const _made = _q808;
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

/** `crossing(L, c)` as the description defines it, kept for the
 * board, since it reads no marks. */
export function crossing(sp: GridSpace, v_L: number, v_c: number): number {
  const _kept: Kept<Kept<number>> = crossingKept.board(sp);
  const _kept1 = (_kept[v_L] ??= []);
  if (_kept1[v_c] !== undefined) return _kept1[v_c];
  let _g911 = -1;
  let _n913 = 0;
  G912: {
    const _t914 = sp.rowOf[v_c];
    const _t915 = sp.colOf[v_c];
    for (let _i916 = 0; _i916 < 2; _i916++) {
      const v_M = _i916 === 0 ? _t914 : _t915;
      if (_i916 === 1 && (v_M === _t914)) continue;
      if (!((v_M !== v_L))) continue;
      if (++_n913 === 2) {
        _g911 = -1;
        break G912;
      }
      _g911 = v_M;
    }
  }
  const _made = _g911;
  _kept1[v_c] = _made;
  return _made;
}
