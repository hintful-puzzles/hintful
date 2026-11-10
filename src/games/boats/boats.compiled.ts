// Compiled by `npm run describe` from src/games/boats/boats.description.yaml: edit that, not this.

import { type ClueList, type Fire, type GridSpace, type Marks, PLACE, addOnce, cellsValued, clueAt, cluesValued, freshBinding, keptStore, rangeMask, sameSet, setOf, staleChecking, stamps, step, stretch, type Kept, union } from "../../engine/describe-runtime.ts";

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
  const _g3861: number[] = [];
  const _g3869: number[] = [];
  const _g3962: number[] = [];
  const _g3970: number[] = [];
  const _domain = rangeMask(1, 2);
  for (const cell of sp.cells) {
    const held = g[cell];
    if (!(held > 0 && (_domain >> held) & 1)) return false;
  }
  let _q3837 = true;
  Q3838: {
    const _a3839 = sp.cells;
    for (let _i3840 = 0; _i3840 < _a3839.length; _i3840++) {
      const v_a = _a3839[_i3840];
      const _h3841 = (g[v_a] || -1);
      if (!((_h3841 === 1))) continue;
      let _q3842 = true;
      Q3843: {
        const _a3844 = sp.adj8[v_a];
        for (let _i3845 = 0; _i3845 < _a3844.length; _i3845++) {
          const v_b = _a3844[_i3845];
          if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
          const _h3846 = (g[v_b] || -1);
          if (!((_h3846 !== 1))) {
            _q3842 = false;
            break Q3843;
          }
        }
      }
      if (!(_q3842)) {
        _q3837 = false;
        break Q3838;
      }
    }
  }
  if (!(_q3837)) return false;
  let _q3847 = true;
  Q3848: {
    const _a3849 = sp.cells;
    for (let _i3850 = 0; _i3850 < _a3849.length; _i3850++) {
      const v_c = _a3849[_i3850];
      const _h3851 = (g[v_c] || -1);
      let _c3854: boolean = (_h3851 === 1);
      if (_c3854) {
        const _t3852 = step(sp, v_c, 1);
        const _h3853 = (g[_t3852] || -1);
        _c3854 = !(((_t3852 !== -1) && (_h3853 === 1)));
      }
      let _c3857: boolean = _c3854;
      if (_c3857) {
        const _t3855 = step(sp, v_c, 3);
        const _h3856 = (g[_t3855] || -1);
        _c3857 = !(((_t3855 !== -1) && (_h3856 === 1)));
      }
      if (!(_c3857)) continue;
      const _h3860 = sp.rowOf[v_c];
      const _h3868 = sp.colOf[v_c];
      let _q3858 = false;
      Q3859: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g3861.length = 0;
          G3862: {
            const _a3865 = sp.lineCells[_h3860];
            for (let _i3866 = 0; _i3866 < _a3865.length; _i3866++) {
              const v_x = _a3865[_i3866];
              const _h3867 = (g[v_x] || -1);
              if (!((_h3867 === 1))) continue;
              _g3861.push(v_x);
            }
          }
          _g3869.length = 0;
          G3870: {
            const _a3873 = sp.lineCells[_h3868];
            for (let _i3874 = 0; _i3874 < _a3873.length; _i3874++) {
              const v_x = _a3873[_i3874];
              const _h3875 = (g[v_x] || -1);
              if (!((_h3875 === 1))) continue;
              _g3869.push(v_x);
            }
          }
          if ((cl.fleet.length[v_k] === union(stretch(sp.lineCells[_h3860], v_c, _g3861), stretch(sp.lineCells[_h3868], v_c, _g3869)).length)) {
            _q3858 = true;
            break Q3859;
          }
        }
      }
      if (!(_q3858)) {
        _q3847 = false;
        break Q3848;
      }
    }
  }
  if (!(_q3847)) return false;
  let _q3876 = true;
  Q3877: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      for (let v_j = 0; v_j < cl.fleet.n; v_j++) {
        if (!((v_j !== v_k))) continue;
        if (!((cl.fleet.length[v_j] !== cl.fleet.length[v_k]))) {
          _q3876 = false;
          break Q3877;
        }
      }
    }
  }
  if (!(_q3876)) return false;
  let _g3878 = 0;
  G3879: {
    const _a3880 = sp.cells;
    for (let _i3881 = 0; _i3881 < _a3880.length; _i3881++) {
      const v_c = _a3880[_i3881];
      const _h3882 = (g[v_c] || -1);
      if (!((_h3882 === 1))) continue;
      _g3878++;
    }
  }
  let _g3883 = 0;
  G3884: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      _g3883 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
    }
  }
  if (!((_g3878 === _g3883))) return false;
  for (let _k3885 = 0; _k3885 < cl.n.at.length; _k3885++) {
    const _at3886 = cl.n.at[_k3885];
    const _v3887 = cl.n.v[_k3885];
    const _t3888 = sp.lineCells[_at3886];
    let _g3889 = 0;
    G3890: {
      const _a3891 = _t3888;
      for (let _i3892 = 0; _i3892 < _a3891.length; _i3892++) {
        const v_c = _a3891[_i3892];
        const _h3893 = (g[v_c] || -1);
        if (!((_h3893 === 1))) continue;
        _g3889++;
      }
    }
    if (!((_g3889 === _v3887))) return false;
  }
  for (let _k3894 = 0; _k3894 < cl.seg.at.length; _k3894++) {
    const _at3895 = cl.seg.at[_k3894];
    const _v3896 = cl.seg.v[_k3894];
    let _c3946: boolean = ((_v3896 === 2) && ((g[_at3895] || -1) === 2));
    if (!_c3946) {
      let _c3945: boolean = ((_v3896 > 2) && ((g[_at3895] || -1) === 1));
      if (_c3945) {
        let _c3903: boolean = (_v3896 === 3);
        if (!_c3903) {
          let _c3899: boolean = (_v3896 === 4);
          if (_c3899) {
            const _t3897 = step(sp, _at3895, 2);
            const _h3898 = (g[_t3897] || -1);
            _c3899 = ((_t3897 !== -1) && (_h3898 === 1));
          }
          let _c3902: boolean = _c3899;
          if (_c3902) {
            const _t3900 = step(sp, _at3895, 1);
            const _h3901 = (g[_t3900] || -1);
            _c3902 = !(((_t3900 !== -1) && (_h3901 === 1)));
          }
          _c3903 = _c3902;
        }
        let _c3910: boolean = _c3903;
        if (!_c3910) {
          let _c3906: boolean = (_v3896 === 5);
          if (_c3906) {
            const _t3904 = step(sp, _at3895, 1);
            const _h3905 = (g[_t3904] || -1);
            _c3906 = ((_t3904 !== -1) && (_h3905 === 1));
          }
          let _c3909: boolean = _c3906;
          if (_c3909) {
            const _t3907 = step(sp, _at3895, 2);
            const _h3908 = (g[_t3907] || -1);
            _c3909 = !(((_t3907 !== -1) && (_h3908 === 1)));
          }
          _c3910 = _c3909;
        }
        let _c3923: boolean = _c3910;
        if (!_c3923) {
          let _c3922: boolean = (_v3896 === 6);
          if (_c3922) {
            const _t3911 = step(sp, _at3895, 1);
            const _h3912 = (g[_t3911] || -1);
            let _c3915: boolean = ((_t3911 !== -1) && (_h3912 === 1));
            if (_c3915) {
              const _t3913 = step(sp, _at3895, 2);
              const _h3914 = (g[_t3913] || -1);
              _c3915 = ((_t3913 !== -1) && (_h3914 === 1));
            }
            let _c3921: boolean = _c3915;
            if (!_c3921) {
              const _t3916 = step(sp, _at3895, 3);
              const _h3917 = (g[_t3916] || -1);
              let _c3920: boolean = ((_t3916 !== -1) && (_h3917 === 1));
              if (_c3920) {
                const _t3918 = step(sp, _at3895, 4);
                const _h3919 = (g[_t3918] || -1);
                _c3920 = ((_t3918 !== -1) && (_h3919 === 1));
              }
              _c3921 = _c3920;
            }
            _c3922 = _c3921;
          }
          _c3923 = _c3922;
        }
        let _c3930: boolean = _c3923;
        if (!_c3930) {
          let _c3926: boolean = (_v3896 === 7);
          if (_c3926) {
            const _t3924 = step(sp, _at3895, 4);
            const _h3925 = (g[_t3924] || -1);
            _c3926 = ((_t3924 !== -1) && (_h3925 === 1));
          }
          let _c3929: boolean = _c3926;
          if (_c3929) {
            const _t3927 = step(sp, _at3895, 3);
            const _h3928 = (g[_t3927] || -1);
            _c3929 = !(((_t3927 !== -1) && (_h3928 === 1)));
          }
          _c3930 = _c3929;
        }
        let _c3937: boolean = _c3930;
        if (!_c3937) {
          let _c3933: boolean = (_v3896 === 8);
          if (_c3933) {
            const _t3931 = step(sp, _at3895, 3);
            const _h3932 = (g[_t3931] || -1);
            _c3933 = ((_t3931 !== -1) && (_h3932 === 1));
          }
          let _c3936: boolean = _c3933;
          if (_c3936) {
            const _t3934 = step(sp, _at3895, 4);
            const _h3935 = (g[_t3934] || -1);
            _c3936 = !(((_t3934 !== -1) && (_h3935 === 1)));
          }
          _c3937 = _c3936;
        }
        let _c3944: boolean = _c3937;
        if (!_c3944) {
          let _c3943: boolean = (_v3896 === 9);
          if (_c3943) {
            let _q3938 = false;
            Q3939: {
              const _a3940 = sp.adj4[_at3895];
              for (let _i3941 = 0; _i3941 < _a3940.length; _i3941++) {
                const v_x = _a3940[_i3941];
                const _h3942 = (g[v_x] || -1);
                if ((_h3942 === 1)) {
                  _q3938 = true;
                  break Q3939;
                }
              }
            }
            _c3943 = !(_q3938);
          }
          _c3944 = _c3943;
        }
        _c3945 = _c3944;
      }
      _c3946 = _c3945;
    }
    if (!(_c3946)) return false;
  }
  for (let _k3947 = 0; _k3947 < cl.fleet.n; _k3947++) {
    let _g3950 = 0;
    G3951: {
      const _a3952 = sp.cells;
      for (let _i3953 = 0; _i3953 < _a3952.length; _i3953++) {
        const v_c = _a3952[_i3953];
        const _h3954 = (g[v_c] || -1);
        let _c3957: boolean = (_h3954 === 1);
        if (_c3957) {
          const _t3955 = step(sp, v_c, 1);
          const _h3956 = (g[_t3955] || -1);
          _c3957 = !(((_t3955 !== -1) && (_h3956 === 1)));
        }
        let _c3960: boolean = _c3957;
        if (_c3960) {
          const _t3958 = step(sp, v_c, 3);
          const _h3959 = (g[_t3958] || -1);
          _c3960 = !(((_t3958 !== -1) && (_h3959 === 1)));
        }
        let _c3977: boolean = _c3960;
        if (_c3977) {
          const _t3961 = sp.rowOf[v_c];
          _g3962.length = 0;
          G3963: {
            const _a3966 = sp.lineCells[_t3961];
            for (let _i3967 = 0; _i3967 < _a3966.length; _i3967++) {
              const v_x = _a3966[_i3967];
              const _h3968 = (g[v_x] || -1);
              if (!((_h3968 === 1))) continue;
              _g3962.push(v_x);
            }
          }
          const _t3969 = sp.colOf[v_c];
          _g3970.length = 0;
          G3971: {
            const _a3974 = sp.lineCells[_t3969];
            for (let _i3975 = 0; _i3975 < _a3974.length; _i3975++) {
              const v_x = _a3974[_i3975];
              const _h3976 = (g[v_x] || -1);
              if (!((_h3976 === 1))) continue;
              _g3970.push(v_x);
            }
          }
          _c3977 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g3962), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g3970)).length === cl.fleet.length[_k3947]);
        }
        if (!(_c3977)) continue;
        _g3950++;
      }
    }
    if (!((_g3950 === cl.fleet.boats[_k3947]))) return false;
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
      if (import.meta.env.DEV && staleChecking) {
        freshBinding("given", [(sp.cells.includes(v_c)), (v_v === clueAt(cl.seg, v_c)), (v_v >= 2)], ["c in", "v =", "where of v"]);
      }
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
      if (import.meta.env.DEV && staleChecking) {
        const _g90: number[] = [];
        G91: {
          const _a94 = sp.adj8[v_c];
          for (let _i95 = 0; _i95 < _a94.length; _i95++) {
            const v_d = _a94[_i95];
            if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
            _g90.push(v_d);
          }
        }
        freshBinding("near", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), sameSet(v_D, _g90), (v_D.length > 0)], ["c in", "where of c", "D =", "where of D"]);
      }
      facts.length = 0;
      changed = false;
      let _q96 = true;
      Q97: {
        const _a98 = v_D;
        for (let _i99 = 0; _i99 < _a98.length; _i99++) {
          const v_d = _a98[_i99];
          if (!(b.grid[v_d] !== 0)) { if (fire === null) { b.placeAt(v_d, 2); changed = true; } else facts.push(PLACE, v_d, 2); }
          if (!(true)) {
            _q96 = false;
            break Q97;
          }
        }
      }
      if (!(_q96)) return -1;
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
  const _a104 = sp.adj8[v_c];
  for (let _i105 = 0; _i105 < _a104.length; _i105++) {
    const v_d = _a104[_i105];
    if (!((!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
    if (import.meta.env.DEV && staleChecking) {
      freshBinding("touch", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), (sp.adj8[v_c].includes(v_d)), (!(sp.adj4[v_c].includes(v_d)) && !((b.grid[v_d] !== 0)))], ["c in", "where of c", "d in", "where of d"]);
    }
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
  const _g127: number[] = [];
  const facts = lineShipsFacts;
  let fired = 0;
  let changed = false;
  const _a122 = sp.lines;
  for (let _i123 = 0; _i123 < _a122.length; _i123++) {
    const v_L = _a122[_i123];
    const _h124 = clueAt(cl.n, v_L);
    L125: {
      const v_v = _h124;
      if (!((v_v >= 0))) break L125;
      const _t126 = sp.lineCells[v_L];
      _g127.length = 0;
      G128: {
        const _a131 = _t126;
        for (let _i132 = 0; _i132 < _a131.length; _i132++) {
          const v_c = _a131[_i132];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g127.push(v_c);
        }
      }
      L133: {
        const v_O = _g127;
        const _h134 = v_O.length;
        if (!((_h134 > 0))) break L133;
        const _t135 = sp.lineCells[v_L];
        let _g136 = 0;
        G137: {
          const _a138 = _t135;
          for (let _i139 = 0; _i139 < _a138.length; _i139++) {
            const v_c = _a138[_i139];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g136++;
          }
        }
        const v_left = (v_v - _g136);
        if (import.meta.env.DEV && staleChecking) {
          const _t140 = sp.lineCells[v_L];
          const _g141: number[] = [];
          G142: {
            const _a145 = _t140;
            for (let _i146 = 0; _i146 < _a145.length; _i146++) {
              const v_c = _a145[_i146];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g141.push(v_c);
            }
          }
          const _t147 = sp.lineCells[v_L];
          let _g148 = 0;
          G149: {
            const _a150 = _t147;
            for (let _i151 = 0; _i151 < _a150.length; _i151++) {
              const v_c = _a150[_i151];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g148++;
            }
          }
          freshBinding("lineShips", [(sp.lines.includes(v_L)), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_O, _g141), (v_O.length > 0), (v_left === (v_v - _g148))], ["L in", "v =", "where of v", "O =", "where of O", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c157: boolean = (v_left <= _h134);
        if (_c157) {
          let _c156: boolean = !((v_left === _h134));
          if (!_c156) {
            let _q152 = true;
            Q153: {
              const _a154 = v_O;
              for (let _i155 = 0; _i155 < _a154.length; _i155++) {
                const v_c = _a154[_i155];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q152 = false;
                  break Q153;
                }
              }
            }
            _c156 = _q152;
          }
          _c157 = _c156;
        }
        if (!(_c157)) return -1;
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
  const _g174: number[] = [];
  const facts = totalFacts;
  let fired = 0;
  let changed = false;
  const _t173 = sp.cells;
  _g174.length = 0;
  G175: {
    const _a178 = _t173;
    for (let _i179 = 0; _i179 < _a178.length; _i179++) {
      const v_c = _a178[_i179];
      if (!(!((b.grid[v_c] !== 0)))) continue;
      _g174.push(v_c);
    }
  }
  L180: {
    const v_O = _g174;
    const _h181 = v_O.length;
    if (!((_h181 > 0))) break L180;
    let _g182 = 0;
    G183: {
      for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
        _g182 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
      }
    }
    const _t184 = sp.cells;
    let _g185 = 0;
    G186: {
      const _a187 = _t184;
      for (let _i188 = 0; _i188 < _a187.length; _i188++) {
        const v_c = _a187[_i188];
        if (!(((b.grid[v_c] || -1) === 1))) continue;
        _g185++;
      }
    }
    const v_left = (_g182 - _g185);
    if (import.meta.env.DEV && staleChecking) {
      const _t189 = sp.cells;
      const _g190: number[] = [];
      G191: {
        const _a194 = _t189;
        for (let _i195 = 0; _i195 < _a194.length; _i195++) {
          const v_c = _a194[_i195];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g190.push(v_c);
        }
      }
      let _g196 = 0;
      G197: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g196 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      const _t198 = sp.cells;
      let _g199 = 0;
      G200: {
        const _a201 = _t198;
        for (let _i202 = 0; _i202 < _a201.length; _i202++) {
          const v_c = _a201[_i202];
          if (!(((b.grid[v_c] || -1) === 1))) continue;
          _g199++;
        }
      }
      freshBinding("total", [sameSet(v_O, _g190), (v_O.length > 0), (v_left === (_g196 - _g199))], ["O =", "where of O", "left ="]);
    }
    facts.length = 0;
    changed = false;
    let _c208: boolean = (v_left <= _h181);
    if (_c208) {
      let _c207: boolean = !((v_left === _h181));
      if (!_c207) {
        let _q203 = true;
        Q204: {
          const _a205 = v_O;
          for (let _i206 = 0; _i206 < _a205.length; _i206++) {
            const v_c = _a205[_i206];
            if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
            if (!(true)) {
              _q203 = false;
              break Q204;
            }
          }
        }
        _c207 = _q203;
      }
      _c208 = _c207;
    }
    if (!(_c208)) return -1;
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
  const _h219 = ((1 << 1) | (1 << 3));
  const _a216 = cluesValued(cl.seg, 6);
  for (let _i217 = 0; _i217 < _a216.length; _i217++) {
    const v_c = _a216[_i217];
    const _h218 = clueAt(cl.seg, v_c);
    if (!((_h218 === 6))) continue;
    for (let _m220 = _h219; _m220 !== 0; _m220 &= _m220 - 1) {
      const v_a = 31 - Math.clz32(_m220 & -_m220);
      const v_b = (v_a + 1);
      const v_p = (4 - v_a);
      L221: {
        const v_q = (5 - v_a);
        const _t222 = step(sp, v_c, v_a);
        let _c224: boolean = ((_t222 === -1) || ((b.grid[_t222] || -1) === 2));
        if (!_c224) {
          const _t223 = step(sp, v_c, v_b);
          _c224 = ((_t223 === -1) || ((b.grid[_t223] || -1) === 2));
        }
        if (!(_c224)) break L221;
        if (import.meta.env.DEV && staleChecking) {
          const _t225 = step(sp, v_c, v_a);
          let _c227: boolean = ((_t225 === -1) || ((b.grid[_t225] || -1) === 2));
          if (!_c227) {
            const _t226 = step(sp, v_c, v_b);
            _c227 = ((_t226 === -1) || ((b.grid[_t226] || -1) === 2));
          }
          freshBinding("center", [(sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_a === 1) || (v_a === 3)), (v_b === (v_a + 1)), (v_p === (4 - v_a)), (v_q === (5 - v_a)), _c227], ["c in", "where of c", "a in", "b =", "p =", "q =", "where of q"]);
        }
        facts.length = 0;
        changed = false;
        const _t228 = step(sp, v_c, v_p);
        let _c230: boolean = !(((_t228 === -1) || ((b.grid[_t228] || -1) === 2)));
        if (_c230) {
          const _t229 = step(sp, v_c, v_q);
          _c230 = !(((_t229 === -1) || ((b.grid[_t229] || -1) === 2)));
        }
        let _c232: boolean = _c230;
        if (_c232) {
          const _t231 = step(sp, v_c, v_p);
          if (!(b.grid[_t231] !== 0)) { if (fire === null) { b.placeAt(_t231, 1); changed = true; } else facts.push(PLACE, _t231, 1); }
          _c232 = true;
        }
        let _c234: boolean = _c232;
        if (_c234) {
          const _t233 = step(sp, v_c, v_q);
          if (!(b.grid[_t233] !== 0)) { if (fire === null) { b.placeAt(_t233, 1); changed = true; } else facts.push(PLACE, _t233, 1); }
          _c234 = true;
        }
        if (!(_c234)) return -1;
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
  const _g317: number[] = [];
  const facts = extendFacts;
  let fired = 0;
  let changed = false;
  const _m127_0 = b.made[0];
  const _m127_1 = b.made[1];
  const v_F = full(b, sp, cl, 1);
  const _a310 = cellsValued(b, sp.cells, 1);
  for (let _i311 = 0; _i311 < _a310.length; _i311++) {
    const v_c = _a310[_i311];
    let _c316: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
    if (_c316) {
      let _q312 = false;
      Q313: {
        const _a314 = sp.adj4[v_c];
        for (let _i315 = 0; _i315 < _a314.length; _i315++) {
          const v_x = _a314[_i315];
          if (((b.grid[v_x] || -1) === 1)) {
            _q312 = true;
            break Q313;
          }
        }
      }
      _c316 = !(_q312);
    }
    if (!(_c316)) continue;
    _g317.length = 0;
    G318: {
      const _a321 = sp.adj4[v_c];
      for (let _i322 = 0; _i322 < _a321.length; _i322++) {
        const v_x = _a321[_i322];
        if (!(!((b.grid[v_x] !== 0)))) continue;
        _g317.push(v_x);
      }
    }
    L323: {
      const v_O = _g317;
      const _h324 = v_O.length;
      if (!((_h324 === 1))) break L323;
      if (b.made[0] !== _m127_0 || b.made[1] !== _m127_1) {
        if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
      }
      if (import.meta.env.DEV && staleChecking) {
        let _c329: boolean = (v_F && ((b.grid[v_c] || -1) === 1));
        if (_c329) {
          let _q325 = false;
          Q326: {
            const _a327 = sp.adj4[v_c];
            for (let _i328 = 0; _i328 < _a327.length; _i328++) {
              const v_x = _a327[_i328];
              if (((b.grid[v_x] || -1) === 1)) {
                _q325 = true;
                break Q326;
              }
            }
          }
          _c329 = !(_q325);
        }
        const _g330: number[] = [];
        G331: {
          const _a334 = sp.adj4[v_c];
          for (let _i335 = 0; _i335 < _a334.length; _i335++) {
            const v_x = _a334[_i335];
            if (!(!((b.grid[v_x] !== 0)))) continue;
            _g330.push(v_x);
          }
        }
        freshBinding("extend", [(v_F === full(b, sp, cl, 1)), (sp.cells.includes(v_c)), _c329, sameSet(v_O, _g330), (v_O.length === 1)], ["F =", "c in", "where of c", "O =", "where of O"]);
      }
      facts.length = 0;
      changed = false;
      let _q336 = true;
      Q337: {
        const _a338 = v_O;
        for (let _i339 = 0; _i339 < _a338.length; _i339++) {
          const v_x = _a338[_i339];
          if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
          if (!(true)) {
            _q336 = false;
            break Q337;
          }
        }
      }
      if (!(_q336)) return -1;
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
  const _g361: number[] = [];
  const facts = lineWaterFacts;
  let fired = 0;
  let changed = false;
  const _a356 = sp.lines;
  for (let _i357 = 0; _i357 < _a356.length; _i357++) {
    const v_L = _a356[_i357];
    const _h358 = clueAt(cl.n, v_L);
    L359: {
      const v_v = _h358;
      if (!((v_v >= 0))) break L359;
      const _t360 = sp.lineCells[v_L];
      _g361.length = 0;
      G362: {
        const _a365 = _t360;
        for (let _i366 = 0; _i366 < _a365.length; _i366++) {
          const v_c = _a365[_i366];
          if (!(!((b.grid[v_c] !== 0)))) continue;
          _g361.push(v_c);
        }
      }
      L367: {
        const v_O = _g361;
        const _h368 = v_O.length;
        if (!((_h368 > 0))) break L367;
        const _t369 = sp.lineCells[v_L];
        let _g370 = 0;
        G371: {
          const _a372 = _t369;
          for (let _i373 = 0; _i373 < _a372.length; _i373++) {
            const v_c = _a372[_i373];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g370++;
          }
        }
        const v_left = (v_v - _g370);
        if (import.meta.env.DEV && staleChecking) {
          const _t374 = sp.lineCells[v_L];
          const _g375: number[] = [];
          G376: {
            const _a379 = _t374;
            for (let _i380 = 0; _i380 < _a379.length; _i380++) {
              const v_c = _a379[_i380];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g375.push(v_c);
            }
          }
          const _t381 = sp.lineCells[v_L];
          let _g382 = 0;
          G383: {
            const _a384 = _t381;
            for (let _i385 = 0; _i385 < _a384.length; _i385++) {
              const v_c = _a384[_i385];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g382++;
            }
          }
          freshBinding("lineWater", [(sp.lines.includes(v_L)), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_O, _g375), (v_O.length > 0), (v_left === (v_v - _g382))], ["L in", "v =", "where of v", "O =", "where of O", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c391: boolean = (v_left >= 0);
        if (_c391) {
          let _c390: boolean = !((v_left === 0));
          if (!_c390) {
            let _q386 = true;
            Q387: {
              const _a388 = v_O;
              for (let _i389 = 0; _i389 < _a388.length; _i389++) {
                const v_c = _a388[_i389];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q386 = false;
                  break Q387;
                }
              }
            }
            _c390 = _q386;
          }
          _c391 = _c390;
        }
        if (!(_c391)) return -1;
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
  const _a399 = sp.cells;
  for (let _i400 = 0; _i400 < _a399.length; _i400++) {
    const v_c = _a399[_i400];
    let _c405: boolean = (v_F && !((b.grid[v_c] !== 0)));
    if (_c405) {
      let _q401 = true;
      Q402: {
        const _a403 = sp.adj4[v_c];
        for (let _i404 = 0; _i404 < _a403.length; _i404++) {
          const v_x = _a403[_i404];
          if (!(((b.grid[v_x] || -1) === 2))) {
            _q401 = false;
            break Q402;
          }
        }
      }
      _c405 = _q401;
    }
    if (!(_c405)) continue;
    if (b.made[0] !== _m175_0 || b.made[1] !== _m175_1) {
      if (!((v_F === full(b, sp, cl, 1)))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      let _c410: boolean = (v_F && !((b.grid[v_c] !== 0)));
      if (_c410) {
        let _q406 = true;
        Q407: {
          const _a408 = sp.adj4[v_c];
          for (let _i409 = 0; _i409 < _a408.length; _i409++) {
            const v_x = _a408[_i409];
            if (!(((b.grid[v_x] || -1) === 2))) {
              _q406 = false;
              break Q407;
            }
          }
        }
        _c410 = _q406;
      }
      freshBinding("isolated", [(v_F === full(b, sp, cl, 1)), (sp.cells.includes(v_c)), _c410], ["F =", "c in", "where of c"]);
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
  const _g445: number[] = [];
  const _g453: number[] = [];
  const facts = growFacts;
  let fired = 0;
  let changed = false;
  const _m189_0 = b.made[0];
  const _m189_1 = b.made[1];
  const _a440 = cellsValued(b, sp.cells, 1);
  R1:
  for (let _i441 = 0; _i441 < _a440.length; _i441++) {
    const v_c = _a440[_i441];
    if (!(((b.grid[v_c] || -1) === 1))) continue;
    const _t442 = sp.rowOf[v_c];
    const _t443 = sp.colOf[v_c];
    for (let _i444 = 0; _i444 < 2; _i444++) {
      const v_L = _i444 === 0 ? _t442 : _t443;
      if (_i444 === 1 && (v_L === _t442)) continue;
      _g445.length = 0;
      G446: {
        const _a449 = sp.lineCells[v_L];
        for (let _i450 = 0; _i450 < _a449.length; _i450++) {
          const v_x = _a449[_i450];
          if (!(((b.grid[v_x] || -1) === 1))) continue;
          _g445.push(v_x);
        }
      }
      L451: {
        const v_G = stretch(sp.lineCells[v_L], v_c, _g445);
        const _h452 = v_G.length;
        if (!(((_h452 >= 2) && ((v_G[0] ?? -1) === v_c)))) break L451;
        _g453.length = 0;
        G454: {
          const _a462 = sp.lineCells[v_L];
          for (let _i463 = 0; _i463 < _a462.length; _i463++) {
            const v_x = _a462[_i463];
            let _c468: boolean = !((b.grid[v_x] !== 0));
            if (_c468) {
              let _q464 = false;
              Q465: {
                const _a466 = v_G;
                for (let _i467 = 0; _i467 < _a466.length; _i467++) {
                  const v_g = _a466[_i467];
                  if ((sp.adj4[v_g].includes(v_x))) {
                    _q464 = true;
                    break Q465;
                  }
                }
              }
              _c468 = _q464;
            }
            if (!(_c468)) continue;
            _g453.push(v_x);
          }
        }
        L469: {
          const v_E = _g453;
          const _h470 = v_E.length;
          if (!(((_h470 === 1) && full(b, sp, cl, _h452)))) break L469;
          if (b.made[0] !== _m189_0 || b.made[1] !== _m189_1) {
            if (!(((b.grid[v_c] || -1) === 1))) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            const _g471: number[] = [];
            G472: {
              const _a475 = sp.lineCells[v_L];
              for (let _i476 = 0; _i476 < _a475.length; _i476++) {
                const v_x = _a475[_i476];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g471.push(v_x);
              }
            }
            const _g477: number[] = [];
            G478: {
              const _a486 = sp.lineCells[v_L];
              for (let _i487 = 0; _i487 < _a486.length; _i487++) {
                const v_x = _a486[_i487];
                let _c492: boolean = !((b.grid[v_x] !== 0));
                if (_c492) {
                  let _q488 = false;
                  Q489: {
                    const _a490 = v_G;
                    for (let _i491 = 0; _i491 < _a490.length; _i491++) {
                      const v_g = _a490[_i491];
                      if ((sp.adj4[v_g].includes(v_x))) {
                        _q488 = true;
                        break Q489;
                      }
                    }
                  }
                  _c492 = _q488;
                }
                if (!(_c492)) continue;
                _g477.push(v_x);
              }
            }
            freshBinding("grow", [(sp.cells.includes(v_c)), ((b.grid[v_c] || -1) === 1), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), sameSet(v_G, stretch(sp.lineCells[v_L], v_c, _g471)), ((v_G.length >= 2) && ((v_G[0] ?? -1) === v_c)), sameSet(v_E, _g477), ((v_E.length === 1) && full(b, sp, cl, v_G.length))], ["c in", "where of c", "L in", "G =", "where of G", "E =", "where of E"]);
          }
          facts.length = 0;
          changed = false;
          let _q493 = true;
          Q494: {
            const _a495 = v_E;
            for (let _i496 = 0; _i496 < _a495.length; _i496++) {
              const v_x = _a495[_i496];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              if (!(true)) {
                _q493 = false;
                break Q494;
              }
            }
          }
          if (!(_q493)) return -1;
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
  const _g584: number[] = [];
  const facts = onlyFitFacts;
  let fired = 0;
  let changed = false;
  const _k606 = boatsOfKept.board(cl);
  const _m216_0 = b.made[0];
  const _m216_1 = b.made[1];
  let _g569 = -1;
  G570: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t571 = cl.fleet.length[v_k];
      if (_g569 === -1 || _t571 > _g569) _g569 = _t571;
    }
  }
  const v_M = _g569;
  const _a572 = sp.lines;
  for (let _i573 = 0; _i573 < _a572.length; _i573++) {
    const v_L = _a572[_i573];
    const _h596 = clueAt(cl.n, v_L);
    const _h597 = (_h596 < 0);
    const _a574 = sp.lineCells[v_L];
    for (let _i575 = 0; _i575 < _a574.length; _i575++) {
      const v_c = _a574[_i575];
      const _h580 = (v_c % sp.w);
      const _h581 = ((v_c / sp.w) | 0);
      const _h582 = (_h580 + _h581);
      let _c583: boolean = ((b.grid[v_c] || -1) !== 2);
      if (_c583) {
        let _q576 = false;
        Q577: {
          const _a578 = sp.adj4[v_c];
          for (let _i579 = 0; _i579 < _a578.length; _i579++) {
            const v_p = _a578[_i579];
            if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h582)))) continue;
            if (((b.grid[v_p] || -1) !== 2)) {
              _q576 = true;
              break Q577;
            }
          }
        }
        _c583 = !(_q576);
      }
      if (!(_c583)) continue;
      _g584.length = 0;
      G585: {
        const _a588 = sp.lineCells[v_L];
        for (let _i589 = 0; _i589 < _a588.length; _i589++) {
          const v_x = _a588[_i589];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g584.push(v_x);
        }
      }
      const v_R = stretch(sp.lineCells[v_L], v_c, _g584);
      const _h590 = v_R.length;
      L591: {
        const v_m = _h590;
        let _c605: boolean = (v_m === v_M);
        if (_c605) {
          let _g592 = 0;
          G593: {
            const _a594 = v_R;
            for (let _i595 = 0; _i595 < _a594.length; _i595++) {
              const v_c = _a594[_i595];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g592++;
            }
          }
          let _c604: boolean = ((_g592 < _h590) && (_h590 >= v_m));
          if (_c604) {
            let _c603: boolean = _h597;
            if (!_c603) {
              const _t598 = sp.lineCells[v_L];
              let _g599 = 0;
              G600: {
                const _a601 = _t598;
                for (let _i602 = 0; _i602 < _a601.length; _i602++) {
                  const v_c = _a601[_i602];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g599++;
                }
              }
              _c603 = (((_h596 - _g599) + _g592) >= v_m);
            }
            _c604 = _c603;
          }
          _c605 = _c604;
        }
        if (!(_c605)) break L591;
        const _h641 = (v_m > 1);
        L607: {
          const v_b = ((_k606[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
          if (!(((v_b === 1) && (taking(b, sp, cl, v_m) === 1)))) break L607;
          if (b.made[0] !== _m216_0 || b.made[1] !== _m216_1) {
            let _g608 = -1;
            G609: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                const _t610 = cl.fleet.length[v_k];
                if (_g608 === -1 || _t610 > _g608) _g608 = _t610;
              }
            }
            if (!((v_M === _g608))) { return fired; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g611 = -1;
            G612: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                const _t613 = cl.fleet.length[v_k];
                if (_g611 === -1 || _t613 > _g611) _g611 = _t613;
              }
            }
            let _c618: boolean = ((b.grid[v_c] || -1) !== 2);
            if (_c618) {
              let _q614 = false;
              Q615: {
                const _a616 = sp.adj4[v_c];
                for (let _i617 = 0; _i617 < _a616.length; _i617++) {
                  const v_p = _a616[_i617];
                  if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_c % sp.w) + ((v_c / sp.w) | 0)))))) continue;
                  if (((b.grid[v_p] || -1) !== 2)) {
                    _q614 = true;
                    break Q615;
                  }
                }
              }
              _c618 = !(_q614);
            }
            const _g619: number[] = [];
            G620: {
              const _a623 = sp.lineCells[v_L];
              for (let _i624 = 0; _i624 < _a623.length; _i624++) {
                const v_x = _a623[_i624];
                if (!(((b.grid[v_x] || -1) !== 2))) continue;
                _g619.push(v_x);
              }
            }
            let _c636: boolean = (v_m === v_M);
            if (_c636) {
              let _g625 = 0;
              G626: {
                const _a627 = v_R;
                for (let _i628 = 0; _i628 < _a627.length; _i628++) {
                  const v_c = _a627[_i628];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g625++;
                }
              }
              let _c635: boolean = ((_g625 < v_R.length) && (v_R.length >= v_m));
              if (_c635) {
                let _c634: boolean = (clueAt(cl.n, v_L) < 0);
                if (!_c634) {
                  const _t629 = sp.lineCells[v_L];
                  let _g630 = 0;
                  G631: {
                    const _a632 = _t629;
                    for (let _i633 = 0; _i633 < _a632.length; _i633++) {
                      const v_c = _a632[_i633];
                      if (!(((b.grid[v_c] || -1) === 1))) continue;
                      _g630++;
                    }
                  }
                  _c634 = (((clueAt(cl.n, v_L) - _g630) + _g625) >= v_m);
                }
                _c635 = _c634;
              }
              _c636 = _c635;
            }
            freshBinding("onlyFit", [(v_M === _g611), (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c618, sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g619)), (v_m === v_R.length), _c636, (v_b === (boatsOf(sp, cl, v_m) - done(b, sp, v_m))), ((v_b === 1) && (taking(b, sp, cl, v_m) === 1))], ["M =", "L in", "c in", "where of c", "R =", "m =", "where of m", "b =", "where of b"]);
          }
          facts.length = 0;
          changed = false;
          let _q637 = true;
          Q638: {
            const _a639 = v_R;
            for (let _i640 = 0; _i640 < _a639.length; _i640++) {
              const v_x = _a639[_i640];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
              let _c647: boolean = true;
              if (_c647) {
                let _c646: boolean = _h641;
                if (!_c646) {
                  let _q642 = true;
                  Q643: {
                    const _a644 = sp.adj4[v_x];
                    for (let _i645 = 0; _i645 < _a644.length; _i645++) {
                      const v_y = _a644[_i645];
                      if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                      if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                      if (!(true)) {
                        _q642 = false;
                        break Q643;
                      }
                    }
                  }
                  _c646 = _q642;
                }
                _c647 = _c646;
              }
              if (!(_c647)) {
                _q637 = false;
                break Q638;
              }
            }
          }
          if (!(_q637)) return -1;
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
  const _g679: number[] = [];
  const facts = centerRoomFacts;
  let fired = 0;
  let changed = false;
  const _a671 = cluesValued(cl.seg, 6);
  for (let _i672 = 0; _i672 < _a671.length; _i672++) {
    const v_c = _a671[_i672];
    const _h673 = clueAt(cl.seg, v_c);
    if (!((_h673 === 6))) continue;
    const _t674 = sp.rowOf[v_c];
    const _t675 = sp.colOf[v_c];
    for (let _i676 = 0; _i676 < 2; _i676++) {
      const v_L = _i676 === 0 ? _t674 : _t675;
      if (_i676 === 1 && (v_L === _t674)) continue;
      const _h677 = clueAt(cl.n, v_L);
      L678: {
        const v_v = _h677;
        if (!((v_v >= 0))) break L678;
        _g679.length = 0;
        G680: {
          const _a683 = sp.adj4[v_c];
          for (let _i684 = 0; _i684 < _a683.length; _i684++) {
            const v_x = _a683[_i684];
            if (!((sp.lineCells[v_L].includes(v_x)))) continue;
            _g679.push(v_x);
          }
        }
        L685: {
          const v_S = _g679;
          const _h686 = v_S.length;
          let _c696: boolean = (_h686 === 2);
          if (_c696) {
            const _t687 = sp.lineCells[v_L];
            let _g688 = 0;
            G689: {
              const _a690 = _t687;
              for (let _i691 = 0; _i691 < _a690.length; _i691++) {
                const v_c = _a690[_i691];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g688++;
              }
            }
            let _g692 = 0;
            G693: {
              const _a694 = v_S;
              for (let _i695 = 0; _i695 < _a694.length; _i695++) {
                const v_x = _a694[_i695];
                if (!(((b.grid[v_x] || -1) !== 1))) continue;
                _g692++;
              }
            }
            _c696 = ((v_v - _g688) < _g692);
          }
          if (!(_c696)) break L685;
          if (import.meta.env.DEV && staleChecking) {
            const _g697: number[] = [];
            G698: {
              const _a701 = sp.adj4[v_c];
              for (let _i702 = 0; _i702 < _a701.length; _i702++) {
                const v_x = _a701[_i702];
                if (!((sp.lineCells[v_L].includes(v_x)))) continue;
                _g697.push(v_x);
              }
            }
            let _c712: boolean = (v_S.length === 2);
            if (_c712) {
              const _t703 = sp.lineCells[v_L];
              let _g704 = 0;
              G705: {
                const _a706 = _t703;
                for (let _i707 = 0; _i707 < _a706.length; _i707++) {
                  const v_c = _a706[_i707];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g704++;
                }
              }
              let _g708 = 0;
              G709: {
                const _a710 = v_S;
                for (let _i711 = 0; _i711 < _a710.length; _i711++) {
                  const v_x = _a710[_i711];
                  if (!(((b.grid[v_x] || -1) !== 1))) continue;
                  _g708++;
                }
              }
              _c712 = ((v_v - _g704) < _g708);
            }
            freshBinding("centerRoom", [(sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), (v_v === clueAt(cl.n, v_L)), (v_v >= 0), sameSet(v_S, _g697), _c712], ["c in", "where of c", "L in", "v =", "where of v", "S =", "where of S"]);
          }
          facts.length = 0;
          changed = false;
          let _q713 = true;
          Q714: {
            const _a715 = v_S;
            for (let _i716 = 0; _i716 < _a715.length; _i716++) {
              const v_x = _a715[_i716];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q713 = false;
                break Q714;
              }
            }
          }
          if (!(_q713)) return -1;
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
  const _g751: number[] = [];
  const _g758: number[] = [];
  const facts = tooLongFacts;
  let fired = 0;
  let changed = false;
  const _m286_0 = b.made[0];
  const _m286_1 = b.made[1];
  let _g741 = -1;
  G742: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t743 = cl.fleet.length[v_k];
      if (_g741 === -1 || _t743 > _g741) _g741 = _t743;
    }
  }
  const v_M = _g741;
  const _a744 = sp.cells;
  for (let _i745 = 0; _i745 < _a744.length; _i745++) {
    const v_c = _a744[_i745];
    let _c764: boolean = !((b.grid[v_c] !== 0));
    if (_c764) {
      let _g746 = 0;
      G747: {
        const _a748 = sp.adj4[v_c];
        for (let _i749 = 0; _i749 < _a748.length; _i749++) {
          const v_a = _a748[_i749];
          if (!(((b.grid[v_a] || -1) === 1))) continue;
          const _t750 = sp.rowOf[v_a];
          _g751.length = 0;
          G752: {
            const _a755 = sp.lineCells[_t750];
            for (let _i756 = 0; _i756 < _a755.length; _i756++) {
              const v_x = _a755[_i756];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g751.push(v_x);
            }
          }
          const _t757 = sp.colOf[v_a];
          _g758.length = 0;
          G759: {
            const _a762 = sp.lineCells[_t757];
            for (let _i763 = 0; _i763 < _a762.length; _i763++) {
              const v_x = _a762[_i763];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g758.push(v_x);
            }
          }
          _g746 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g751), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g758)).length;
        }
      }
      _c764 = ((1 + _g746) > v_M);
    }
    if (!(_c764)) continue;
    if (b.made[0] !== _m286_0 || b.made[1] !== _m286_1) {
      let _g765 = -1;
      G766: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
          const _t767 = cl.fleet.length[v_k];
          if (_g765 === -1 || _t767 > _g765) _g765 = _t767;
        }
      }
      if (!((v_M === _g765))) { return fired; }
    }
    if (import.meta.env.DEV && staleChecking) {
      let _g768 = -1;
      G769: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
          const _t770 = cl.fleet.length[v_k];
          if (_g768 === -1 || _t770 > _g768) _g768 = _t770;
        }
      }
      let _c789: boolean = !((b.grid[v_c] !== 0));
      if (_c789) {
        let _g771 = 0;
        G772: {
          const _a773 = sp.adj4[v_c];
          for (let _i774 = 0; _i774 < _a773.length; _i774++) {
            const v_a = _a773[_i774];
            if (!(((b.grid[v_a] || -1) === 1))) continue;
            const _t775 = sp.rowOf[v_a];
            const _g776: number[] = [];
            G777: {
              const _a780 = sp.lineCells[_t775];
              for (let _i781 = 0; _i781 < _a780.length; _i781++) {
                const v_x = _a780[_i781];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g776.push(v_x);
              }
            }
            const _t782 = sp.colOf[v_a];
            const _g783: number[] = [];
            G784: {
              const _a787 = sp.lineCells[_t782];
              for (let _i788 = 0; _i788 < _a787.length; _i788++) {
                const v_x = _a787[_i788];
                if (!(((b.grid[v_x] || -1) === 1))) continue;
                _g783.push(v_x);
              }
            }
            _g771 += union(stretch(sp.lineCells[sp.rowOf[v_a]], v_a, _g776), stretch(sp.lineCells[sp.colOf[v_a]], v_a, _g783)).length;
          }
        }
        _c789 = ((1 + _g771) > v_M);
      }
      freshBinding("tooLong", [(v_M === _g768), (sp.cells.includes(v_c)), _c789], ["M =", "c in", "where of c"]);
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
  const _g812: number[] = [];
  const _g820: number[] = [];
  const facts = shortRunFacts;
  let fired = 0;
  let changed = false;
  const _a808 = sp.lines;
  for (let _i809 = 0; _i809 < _a808.length; _i809++) {
    const v_L = _a808[_i809];
    const _a810 = sp.lineCells[v_L];
    for (let _i811 = 0; _i811 < _a810.length; _i811++) {
      const v_c = _a810[_i811];
      _g812.length = 0;
      G813: {
        const _a816 = sp.lineCells[v_L];
        for (let _i817 = 0; _i817 < _a816.length; _i817++) {
          const v_x = _a816[_i817];
          if (!(((b.grid[v_x] || -1) !== 2))) continue;
          _g812.push(v_x);
        }
      }
      L818: {
        const v_R = stretch(sp.lineCells[v_L], v_c, _g812);
        const _h819 = v_R.length;
        if (!(((_h819 >= 2) && ((v_R[0] ?? -1) === v_c)))) break L818;
        _g820.length = 0;
        G821: {
          const _a824 = v_R;
          for (let _i825 = 0; _i825 < _a824.length; _i825++) {
            const v_c = _a824[_i825];
            if (!(!((b.grid[v_c] !== 0)))) continue;
            _g820.push(v_c);
          }
        }
        L826: {
          const v_O = _g820;
          const _h827 = v_O.length;
          if (!(((_h827 === 1) && full(b, sp, cl, _h819)))) break L826;
          if (import.meta.env.DEV && staleChecking) {
            const _g828: number[] = [];
            G829: {
              const _a832 = sp.lineCells[v_L];
              for (let _i833 = 0; _i833 < _a832.length; _i833++) {
                const v_x = _a832[_i833];
                if (!(((b.grid[v_x] || -1) !== 2))) continue;
                _g828.push(v_x);
              }
            }
            const _g834: number[] = [];
            G835: {
              const _a838 = v_R;
              for (let _i839 = 0; _i839 < _a838.length; _i839++) {
                const v_c = _a838[_i839];
                if (!(!((b.grid[v_c] !== 0)))) continue;
                _g834.push(v_c);
              }
            }
            freshBinding("shortRun", [(sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g828)), ((v_R.length >= 2) && ((v_R[0] ?? -1) === v_c)), sameSet(v_O, _g834), ((v_O.length === 1) && full(b, sp, cl, v_R.length))], ["L in", "c in", "R =", "where of R", "O =", "where of O"]);
          }
          facts.length = 0;
          changed = false;
          let _q840 = true;
          Q841: {
            const _a842 = v_O;
            for (let _i843 = 0; _i843 < _a842.length; _i843++) {
              const v_x = _a842[_i843];
              if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
              if (!(true)) {
                _q840 = false;
                break Q841;
              }
            }
          }
          if (!(_q840)) return -1;
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
  const _g902: number[] = [];
  const facts = hiddenFacts;
  let fired = 0;
  let changed = false;
  const _a898 = sp.lines;
  for (let _i899 = 0; _i899 < _a898.length; _i899++) {
    const v_L = _a898[_i899];
    const _h900 = clueAt(cl.n, v_L);
    if (!((_h900 < 0))) continue;
    const _t901 = sp.lineCells[v_L];
    _g902.length = 0;
    G903: {
      const _a906 = _t901;
      for (let _i907 = 0; _i907 < _a906.length; _i907++) {
        const v_c = _a906[_i907];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        _g902.push(v_c);
      }
    }
    L908: {
      const v_O = _g902;
      const _h909 = v_O.length;
      if (!((_h909 > 0))) break L908;
      L910: {
        const v_v = rec(b, sp, cl, v_L);
        if (!((v_v >= 0))) break L910;
        const _t911 = sp.lineCells[v_L];
        let _g912 = 0;
        G913: {
          const _a914 = _t911;
          for (let _i915 = 0; _i915 < _a914.length; _i915++) {
            const v_c = _a914[_i915];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g912++;
          }
        }
        const v_left = (v_v - _g912);
        if (import.meta.env.DEV && staleChecking) {
          const _t916 = sp.lineCells[v_L];
          const _g917: number[] = [];
          G918: {
            const _a921 = _t916;
            for (let _i922 = 0; _i922 < _a921.length; _i922++) {
              const v_c = _a921[_i922];
              if (!(!((b.grid[v_c] !== 0)))) continue;
              _g917.push(v_c);
            }
          }
          const _t923 = sp.lineCells[v_L];
          let _g924 = 0;
          G925: {
            const _a926 = _t923;
            for (let _i927 = 0; _i927 < _a926.length; _i927++) {
              const v_c = _a926[_i927];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g924++;
            }
          }
          freshBinding("hidden", [(sp.lines.includes(v_L)), (clueAt(cl.n, v_L) < 0), sameSet(v_O, _g917), (v_O.length > 0), (v_v === rec(b, sp, cl, v_L)), (v_v >= 0), (v_left === (v_v - _g924))], ["L in", "where of L", "O =", "where of O", "v =", "where of v", "left ="]);
        }
        facts.length = 0;
        changed = false;
        let _c933: boolean = ((v_left >= 0) && (v_left <= _h909));
        if (_c933) {
          let _c932: boolean = !((v_left === 0));
          if (!_c932) {
            let _q928 = true;
            Q929: {
              const _a930 = v_O;
              for (let _i931 = 0; _i931 < _a930.length; _i931++) {
                const v_c = _a930[_i931];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 2); changed = true; } else facts.push(PLACE, v_c, 2); }
                if (!(true)) {
                  _q928 = false;
                  break Q929;
                }
              }
            }
            _c932 = _q928;
          }
          _c933 = _c932;
        }
        let _c939: boolean = _c933;
        if (_c939) {
          let _c938: boolean = !((v_left === _h909));
          if (!_c938) {
            let _q934 = true;
            Q935: {
              const _a936 = v_O;
              for (let _i937 = 0; _i937 < _a936.length; _i937++) {
                const v_c = _a936[_i937];
                if (!(b.grid[v_c] !== 0)) { if (fire === null) { b.placeAt(v_c, 1); changed = true; } else facts.push(PLACE, v_c, 1); }
                if (!(true)) {
                  _q934 = false;
                  break Q935;
                }
              }
            }
            _c938 = _q934;
          }
          _c939 = _c938;
        }
        if (!(_c939)) return -1;
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
  const _g1037: number[] = [];
  const _g1060: number[] = [];
  const facts = onlyRunsFacts;
  let fired = 0;
  let changed = false;
  const _k1069 = boatsOfKept.board(cl);
  const _m363_0 = b.made[0];
  const _m363_1 = b.made[1];
  let _g1021 = -1;
  G1022: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
      const _t1023 = cl.fleet.length[v_k];
      if (_g1021 === -1 || _t1023 > _g1021) _g1021 = _t1023;
    }
  }
  L1024: {
    const v_m = _g1021;
    if (!((v_m > 0))) break L1024;
    const _h1059 = (2 * v_m);
    const _a1025 = sp.lines;
    for (let _i1026 = 0; _i1026 < _a1025.length; _i1026++) {
      const v_L = _a1025[_i1026];
      const _h1049 = clueAt(cl.n, v_L);
      const _h1050 = (_h1049 < 0);
      const _a1027 = sp.lineCells[v_L];
      for (let _i1028 = 0; _i1028 < _a1027.length; _i1028++) {
        const v_c = _a1027[_i1028];
        const _h1033 = (v_c % sp.w);
        const _h1034 = ((v_c / sp.w) | 0);
        const _h1035 = (_h1033 + _h1034);
        let _c1036: boolean = ((b.grid[v_c] || -1) !== 2);
        if (_c1036) {
          let _q1029 = false;
          Q1030: {
            const _a1031 = sp.adj4[v_c];
            for (let _i1032 = 0; _i1032 < _a1031.length; _i1032++) {
              const v_p = _a1031[_i1032];
              if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < _h1035)))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q1029 = true;
                break Q1030;
              }
            }
          }
          _c1036 = !(_q1029);
        }
        if (!(_c1036)) continue;
        _g1037.length = 0;
        G1038: {
          const _a1041 = sp.lineCells[v_L];
          for (let _i1042 = 0; _i1042 < _a1041.length; _i1042++) {
            const v_x = _a1041[_i1042];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g1037.push(v_x);
          }
        }
        L1043: {
          const v_R = stretch(sp.lineCells[v_L], v_c, _g1037);
          const _h1048 = v_R.length;
          let _g1044 = 0;
          G1045: {
            const _a1046 = v_R;
            for (let _i1047 = 0; _i1047 < _a1046.length; _i1047++) {
              const v_c = _a1046[_i1047];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1044++;
            }
          }
          let _c1058: boolean = (_g1044 < _h1048);
          if (_c1058) {
            let _c1057: boolean = ((_g1044 < _h1048) && (_h1048 >= v_m));
            if (_c1057) {
              let _c1056: boolean = _h1050;
              if (!_c1056) {
                const _t1051 = sp.lineCells[v_L];
                let _g1052 = 0;
                G1053: {
                  const _a1054 = _t1051;
                  for (let _i1055 = 0; _i1055 < _a1054.length; _i1055++) {
                    const v_c = _a1054[_i1055];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g1052++;
                  }
                }
                _c1056 = (((_h1049 - _g1052) + _g1044) >= v_m);
              }
              _c1057 = _c1056;
            }
            _c1058 = _c1057;
          }
          if (!((_c1058 && (_h1048 < _h1059)))) break L1043;
          const _h1066 = (_h1048 - v_m);
          _g1060.length = 0;
          G1061: {
            const _a1064 = v_R;
            for (let _i1065 = 0; _i1065 < _a1064.length; _i1065++) {
              const v_x = _a1064[_i1065];
              if (!(((_i1065 >= _h1066) && (_i1065 < v_m)))) continue;
              _g1060.push(v_x);
            }
          }
          L1067: {
            const v_C = _g1060;
            const _h1068 = v_C.length;
            if (!((_h1068 > 0))) break L1067;
            const _h1110 = (_h1068 > 1);
            const v_b = ((_k1069[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m));
            L1070: {
              const v_r = taking(b, sp, cl, v_m);
              if (!(((v_r === v_b) && !(wide(b, sp, cl, v_m))))) break L1070;
              if (b.made[0] !== _m363_0 || b.made[1] !== _m363_1) {
                let _g1071 = -1;
                G1072: {
                  for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                    if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                    const _t1073 = cl.fleet.length[v_k];
                    if (_g1071 === -1 || _t1073 > _g1071) _g1071 = _t1073;
                  }
                }
                if (!((v_m === _g1071))) { return fired; }
              }
              if (import.meta.env.DEV && staleChecking) {
                let _g1074 = -1;
                G1075: {
                  for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                    if (!((cl.fleet.boats[v_k] > done(b, sp, cl.fleet.length[v_k])))) continue;
                    const _t1076 = cl.fleet.length[v_k];
                    if (_g1074 === -1 || _t1076 > _g1074) _g1074 = _t1076;
                  }
                }
                let _c1081: boolean = ((b.grid[v_c] || -1) !== 2);
                if (_c1081) {
                  let _q1077 = false;
                  Q1078: {
                    const _a1079 = sp.adj4[v_c];
                    for (let _i1080 = 0; _i1080 < _a1079.length; _i1080++) {
                      const v_p = _a1079[_i1080];
                      if (!(((sp.lineCells[v_L].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_c % sp.w) + ((v_c / sp.w) | 0)))))) continue;
                      if (((b.grid[v_p] || -1) !== 2)) {
                        _q1077 = true;
                        break Q1078;
                      }
                    }
                  }
                  _c1081 = !(_q1077);
                }
                const _g1082: number[] = [];
                G1083: {
                  const _a1086 = sp.lineCells[v_L];
                  for (let _i1087 = 0; _i1087 < _a1086.length; _i1087++) {
                    const v_x = _a1086[_i1087];
                    if (!(((b.grid[v_x] || -1) !== 2))) continue;
                    _g1082.push(v_x);
                  }
                }
                let _g1088 = 0;
                G1089: {
                  const _a1090 = v_R;
                  for (let _i1091 = 0; _i1091 < _a1090.length; _i1091++) {
                    const v_c = _a1090[_i1091];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g1088++;
                  }
                }
                let _c1099: boolean = (_g1088 < v_R.length);
                if (_c1099) {
                  let _c1098: boolean = ((_g1088 < v_R.length) && (v_R.length >= v_m));
                  if (_c1098) {
                    let _c1097: boolean = (clueAt(cl.n, v_L) < 0);
                    if (!_c1097) {
                      const _t1092 = sp.lineCells[v_L];
                      let _g1093 = 0;
                      G1094: {
                        const _a1095 = _t1092;
                        for (let _i1096 = 0; _i1096 < _a1095.length; _i1096++) {
                          const v_c = _a1095[_i1096];
                          if (!(((b.grid[v_c] || -1) === 1))) continue;
                          _g1093++;
                        }
                      }
                      _c1097 = (((clueAt(cl.n, v_L) - _g1093) + _g1088) >= v_m);
                    }
                    _c1098 = _c1097;
                  }
                  _c1099 = _c1098;
                }
                const _g1100: number[] = [];
                G1101: {
                  const _a1104 = v_R;
                  for (let _i1105 = 0; _i1105 < _a1104.length; _i1105++) {
                    const v_x = _a1104[_i1105];
                    if (!(((_i1105 >= (v_R.length - v_m)) && (_i1105 < v_m)))) continue;
                    _g1100.push(v_x);
                  }
                }
                freshBinding("onlyRuns", [(v_m === _g1074), (v_m > 0), (sp.lines.includes(v_L)), (sp.lineCells[v_L].includes(v_c)), _c1081, sameSet(v_R, stretch(sp.lineCells[v_L], v_c, _g1082)), (_c1099 && (v_R.length < (2 * v_m))), sameSet(v_C, _g1100), (v_C.length > 0), (v_b === (boatsOf(sp, cl, v_m) - done(b, sp, v_m))), (v_r === taking(b, sp, cl, v_m)), ((v_r === v_b) && !(wide(b, sp, cl, v_m)))], ["m =", "where of m", "L in", "c in", "where of c", "R =", "where of R", "C =", "where of C", "b =", "r =", "where of r"]);
              }
              facts.length = 0;
              changed = false;
              let _q1106 = true;
              Q1107: {
                const _a1108 = v_C;
                for (let _i1109 = 0; _i1109 < _a1108.length; _i1109++) {
                  const v_x = _a1108[_i1109];
                  if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 1); changed = true; } else facts.push(PLACE, v_x, 1); }
                  let _c1116: boolean = true;
                  if (_c1116) {
                    let _c1115: boolean = _h1110;
                    if (!_c1115) {
                      let _q1111 = true;
                      Q1112: {
                        const _a1113 = sp.adj4[v_x];
                        for (let _i1114 = 0; _i1114 < _a1113.length; _i1114++) {
                          const v_y = _a1113[_i1114];
                          if (!(!(sp.lineCells[v_L].includes(v_y)))) continue;
                          if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                          if (!(true)) {
                            _q1111 = false;
                            break Q1112;
                          }
                        }
                      }
                      _c1115 = _q1111;
                    }
                    _c1116 = _c1115;
                  }
                  if (!(_c1116)) {
                    _q1106 = false;
                    break Q1107;
                  }
                }
              }
              if (!(_q1106)) return -1;
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
  const _a1147 = sp.lines;
  R1:
  for (let _i1148 = 0; _i1148 < _a1147.length; _i1148++) {
    const v_L = _a1147[_i1148];
    const _m414_0 = b.made[0];
    const _m414_1 = b.made[1];
    L1149: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      if (!((v_v >= 0))) break L1149;
      let _g1150 = 0;
      G1151: {
        const _a1152 = sp.lineCells[v_L];
        for (let _i1153 = 0; _i1153 < _a1152.length; _i1153++) {
          const v_c = _a1152[_i1153];
          if (!(((b.grid[v_c] || -1) === 2))) continue;
          _g1150++;
        }
      }
      L1154: {
        const v_t = ((sp.lineCells[v_L].length - v_v) - _g1150);
        if (!(((v_t === 1) || (v_t === 2)))) break L1154;
        const _a1155 = sp.lineCells[v_L];
        for (let _i1156 = 0; _i1156 < _a1155.length; _i1156++) {
          const v_k = _a1155[_i1156];
          const v_K = crossing(sp, v_L, v_k);
          const v_j = numMarked(b, sp, cl, cands, v_K);
          const _h1164 = (v_j >= 0);
          let _g1157 = 0;
          G1158: {
            const _a1159 = sp.adj4[v_k];
            for (let _i1160 = 0; _i1160 < _a1159.length; _i1160++) {
              const v_x = _a1159[_i1160];
              if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
              _g1157++;
            }
          }
          let _g1161 = 0;
          G1162: {
            for (let _i1163 = 0; _i1163 < 1; _i1163++) {
              const v_x = v_k;
              let _c1170: boolean = (!((b.grid[v_x] !== 0)) && _h1164);
              if (_c1170) {
                const _t1165 = sp.lineCells[v_K];
                let _g1166 = 0;
                G1167: {
                  const _a1168 = _t1165;
                  for (let _i1169 = 0; _i1169 < _a1168.length; _i1169++) {
                    const v_c = _a1168[_i1169];
                    if (!(((b.grid[v_c] || -1) === 1))) continue;
                    _g1166++;
                  }
                }
                _c1170 = ((v_j - _g1166) === 1);
              }
              if (!(_c1170)) continue;
              _g1161++;
            }
          }
          L1171: {
            const v_s = (_g1157 + _g1161);
            if (!((v_s > v_t))) break L1171;
            if (b.made[0] !== _m414_0 || b.made[1] !== _m414_1) {
              if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
              let _g1172 = 0;
              G1173: {
                const _a1174 = sp.lineCells[v_L];
                for (let _i1175 = 0; _i1175 < _a1174.length; _i1175++) {
                  const v_c = _a1174[_i1175];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g1172++;
                }
              }
              if (!((v_t === ((sp.lineCells[v_L].length - v_v) - _g1172)))) { continue R1; }
            }
            if (import.meta.env.DEV && staleChecking) {
              let _g1176 = 0;
              G1177: {
                const _a1178 = sp.lineCells[v_L];
                for (let _i1179 = 0; _i1179 < _a1178.length; _i1179++) {
                  const v_c = _a1178[_i1179];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g1176++;
                }
              }
              let _g1180 = 0;
              G1181: {
                const _a1182 = sp.adj4[v_k];
                for (let _i1183 = 0; _i1183 < _a1182.length; _i1183++) {
                  const v_x = _a1182[_i1183];
                  if (!(((sp.lineCells[v_L].includes(v_x)) && !((b.grid[v_x] !== 0))))) continue;
                  _g1180++;
                }
              }
              let _g1184 = 0;
              G1185: {
                for (let _i1186 = 0; _i1186 < 1; _i1186++) {
                  const v_x = v_k;
                  let _c1192: boolean = (!((b.grid[v_x] !== 0)) && (v_j >= 0));
                  if (_c1192) {
                    const _t1187 = sp.lineCells[v_K];
                    let _g1188 = 0;
                    G1189: {
                      const _a1190 = _t1187;
                      for (let _i1191 = 0; _i1191 < _a1190.length; _i1191++) {
                        const v_c = _a1190[_i1191];
                        if (!(((b.grid[v_c] || -1) === 1))) continue;
                        _g1188++;
                      }
                    }
                    _c1192 = ((v_j - _g1188) === 1);
                  }
                  if (!(_c1192)) continue;
                  _g1184++;
                }
              }
              freshBinding("shared", [(sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), (v_v >= 0), (v_t === ((sp.lineCells[v_L].length - v_v) - _g1176)), ((v_t === 1) || (v_t === 2)), (sp.lineCells[v_L].includes(v_k)), (v_K === crossing(sp, v_L, v_k)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_s === (_g1180 + _g1184)), (v_s > v_t)], ["L in", "v =", "where of v", "t =", "where of t", "k in", "K =", "j =", "s =", "where of s"]);
            }
            facts.length = 0;
            changed = false;
            let _q1193 = true;
            Q1194: {
              const _a1195 = sp.adj4[v_k];
              for (let _i1196 = 0; _i1196 < _a1195.length; _i1196++) {
                const v_y = _a1195[_i1196];
                if (!((!(sp.lineCells[v_L].includes(v_y)) && !((b.grid[v_y] !== 0))))) continue;
                if (!(b.grid[v_y] !== 0)) { if (fire === null) { b.placeAt(v_y, 2); changed = true; } else facts.push(PLACE, v_y, 2); }
                if (!(true)) {
                  _q1193 = false;
                  break Q1194;
                }
              }
            }
            if (!(_q1193)) return -1;
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
const _st1547 = stamps();
const _st1569 = stamps();
const _st1705 = stamps();
const _st1712 = stamps();
const _st1754 = stamps();
const _st1788 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastWater(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastWaterBinding> | null): number {
  const _g1512: number[] = [];
  const _g1518: number[] = [];
  const _g1528: number[] = [];
  const _g1541: number[] = [];
  const _g1562: number[] = [];
  const _g1610: number[] = [];
  const _g1619: number[] = [];
  const _g1706: number[] = [];
  const _g1724: number[] = [];
  const _g1734: number[] = [];
  const _g1748: number[] = [];
  const _g1768: number[] = [];
  const _g1782: number[] = [];
  const facts = lastWaterFacts;
  let fired = 0;
  let changed = false;
  const _k1803 = boatsOfKept.board(cl);
  if (lastWaterCands.length < sp.cells.length) lastWaterCands = new Int32Array(sp.cells.length);
  const cands = lastWaterCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g1491 = -1;
  G1492: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t1493 = cl.fleet.length[v_k];
      if (_g1491 === -1 || _t1493 > _g1491) _g1491 = _t1493;
    }
  }
  const v_T = _g1491;
  const _a1494 = sp.lines;
  R1:
  for (let _i1495 = 0; _i1495 < _a1494.length; _i1495++) {
    const v_L = _a1494[_i1495];
    const _m460_0 = b.made[0];
    const _m460_1 = b.made[1];
    let _q1496 = false;
    Q1497: {
      const _a1498 = sp.lineCells[v_L];
      for (let _i1499 = 0; _i1499 < _a1498.length; _i1499++) {
        const v_c = _a1498[_i1499];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q1496 = true;
          break Q1497;
        }
      }
    }
    if (!(_q1496)) continue;
    L1500: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c1505: boolean = (v_v >= 0);
      if (_c1505) {
        let _g1501 = 0;
        G1502: {
          const _a1503 = sp.lineCells[v_L];
          for (let _i1504 = 0; _i1504 < _a1503.length; _i1504++) {
            const v_c = _a1503[_i1504];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1501++;
          }
        }
        _c1505 = (((sp.lineCells[v_L].length - v_v) - _g1501) === 1);
      }
      if (!(_c1505)) break L1500;
      const _a1506 = sp.lineCells[v_L];
      for (let _i1507 = 0; _i1507 < _a1506.length; _i1507++) {
        const v_c = _a1506[_i1507];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h1536 = (v_j >= 0);
        let _g1508 = 0;
        G1509: {
          const _a1510 = sp.lineCells[v_K];
          for (let _i1511 = 0; _i1511 < _a1510.length; _i1511++) {
            const v_c = _a1510[_i1511];
            if (!(((b.grid[v_c] || -1) === 2))) continue;
            _g1508++;
          }
        }
        const v_t = ((sp.lineCells[v_K].length - v_j) - _g1508);
        const _h1537 = (v_t === 1);
        const _h1538 = (_h1536 && _h1537);
        _g1512.length = 0;
        G1513: {
          const _a1516 = sp.lineCells[v_L];
          for (let _i1517 = 0; _i1517 < _a1516.length; _i1517++) {
            const v_x = _a1516[_i1517];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g1512.push(v_x);
          }
        }
        _g1518.length = 0;
        G1519: {
          _g1528.length = 0;
          G1529: {
            const _a1532 = sp.lineCells[v_K];
            for (let _i1533 = 0; _i1533 < _a1532.length; _i1533++) {
              const v_x = _a1532[_i1533];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g1528.push(v_x);
            }
          }
          const _a1534 = _g1528;
          for (let _i1535 = 0; _i1535 < _a1534.length; _i1535++) {
            const v_x = _a1534[_i1535];
            if (!(_h1538)) continue;
            _g1518.push(v_x);
          }
        }
        L1539: {
          const v_H = union(_g1512, _g1518);
          const _t1540 = setOf(v_c);
          _g1541.length = 0;
          _st1547.pass++;
          G1542: {
            const _a1548 = v_H;
            for (let _i1549 = 0; _i1549 < _a1548.length; _i1549++) {
              const v_a = _a1548[_i1549];
              const _a1550 = sp.adj8[v_a];
              for (let _i1551 = 0; _i1551 < _a1550.length; _i1551++) {
                const v_d = _a1550[_i1551];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t1552 = v_d;
                if (_g1541.length < 16) { if (!_g1541.includes(_t1552)) _g1541.push(_t1552); } else addOnce(_g1541, _st1547, _t1552);
              }
            }
          }
          const _t1553 = union(_t1540, _g1541);
          const _h1713 = union(v_H, _t1553);
          let _q1554 = false;
          Q1555: {
            const _a1556 = v_H;
            for (let _i1557 = 0; _i1557 < _a1556.length; _i1557++) {
              const v_a = _a1556[_i1557];
              const _a1558 = sp.adj8[v_a];
              for (let _i1559 = 0; _i1559 < _a1558.length; _i1559++) {
                const v_b = _a1558[_i1559];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q1554 = true;
                  break Q1555;
                }
              }
            }
          }
          let _c1588: boolean = _q1554;
          if (!_c1588) {
            let _q1560 = false;
            Q1561: {
              _g1562.length = 0;
              _st1569.pass++;
              G1563: {
                const _a1570 = union(v_H, _t1553);
                for (let _i1571 = 0; _i1571 < _a1570.length; _i1571++) {
                  const v_a = _a1570[_i1571];
                  const _t1572 = sp.rowOf[v_a];
                  const _t1573 = sp.colOf[v_a];
                  for (let _i1574 = 0; _i1574 < 2; _i1574++) {
                    const v_M = _i1574 === 0 ? _t1572 : _t1573;
                    if (_i1574 === 1 && (v_M === _t1572)) continue;
                    const _t1575 = v_M;
                    if (_g1562.length < 16) { if (!_g1562.includes(_t1575)) _g1562.push(_t1575); } else addOnce(_g1562, _st1569, _t1575);
                  }
                }
              }
              const _a1576 = _g1562;
              for (let _i1577 = 0; _i1577 < _a1576.length; _i1577++) {
                const v_L = _a1576[_i1577];
                L1578: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L1578;
                  let _g1579 = 0;
                  G1580: {
                    const _a1581 = sp.lineCells[v_L];
                    for (let _i1582 = 0; _i1582 < _a1581.length; _i1582++) {
                      const v_x = _a1581[_i1582];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1579++;
                    }
                  }
                  let _c1587: boolean = (_g1579 > v_v);
                  if (!_c1587) {
                    let _g1583 = 0;
                    G1584: {
                      const _a1585 = sp.lineCells[v_L];
                      for (let _i1586 = 0; _i1586 < _a1585.length; _i1586++) {
                        const v_x = _a1585[_i1586];
                        if (!((!(_t1553.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g1583++;
                      }
                    }
                    _c1587 = (_g1583 < v_v);
                  }
                  if (_c1587) {
                    _q1560 = true;
                    break Q1561;
                  }
                }
              }
            }
            _c1588 = _q1560;
          }
          let _c1595: boolean = _c1588;
          if (!_c1595) {
            let _g1589 = 0;
            G1590: {
              const _a1591 = sp.cells;
              for (let _i1592 = 0; _i1592 < _a1591.length; _i1592++) {
                const v_x = _a1591[_i1592];
                if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g1589++;
              }
            }
            let _g1593 = 0;
            G1594: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1593 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1595 = (_g1589 > _g1593);
          }
          let _c1602: boolean = _c1595;
          if (!_c1602) {
            let _g1596 = 0;
            G1597: {
              const _a1598 = sp.cells;
              for (let _i1599 = 0; _i1599 < _a1598.length; _i1599++) {
                const v_x = _a1598[_i1599];
                if (!((!(_t1553.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g1596++;
              }
            }
            let _g1600 = 0;
            G1601: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g1600 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c1602 = (_g1596 < _g1600);
          }
          let _c1616: boolean = _c1602;
          if (!_c1616) {
            let _q1603 = false;
            Q1604: {
              const _a1605 = v_H;
              for (let _i1606 = 0; _i1606 < _a1605.length; _i1606++) {
                const v_a = _a1605[_i1606];
                const _t1607 = sp.rowOf[v_a];
                const _t1608 = sp.colOf[v_a];
                for (let _i1609 = 0; _i1609 < 2; _i1609++) {
                  const v_L = _i1609 === 0 ? _t1607 : _t1608;
                  if (_i1609 === 1 && (v_L === _t1607)) continue;
                  _g1610.length = 0;
                  G1611: {
                    const _a1614 = sp.lineCells[v_L];
                    for (let _i1615 = 0; _i1615 < _a1614.length; _i1615++) {
                      const v_x = _a1614[_i1615];
                      if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g1610.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g1610).length > v_T)) {
                    _q1603 = true;
                    break Q1604;
                  }
                }
              }
            }
            _c1616 = _q1603;
          }
          let _c1804: boolean = _c1616;
          if (!_c1804) {
            let _q1617 = false;
            Q1618: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g1619.length = 0;
                _st1705.pass++;
                G1620: {
                  _g1706.length = 0;
                  _st1712.pass++;
                  G1707: {
                    const _a1714 = _h1713;
                    for (let _i1715 = 0; _i1715 < _a1714.length; _i1715++) {
                      const v_x = _a1714[_i1715];
                      const _a1716 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i1717 = 0; _i1717 < _a1716.length; _i1717++) {
                        const v_y = _a1716[_i1717];
                        const _t1718 = v_y;
                        if (_g1706.length < 16) { if (!_g1706.includes(_t1718)) _g1706.push(_t1718); } else addOnce(_g1706, _st1712, _t1718);
                      }
                    }
                  }
                  const _a1719 = _g1706;
                  for (let _i1720 = 0; _i1720 < _a1719.length; _i1720++) {
                    const v_a = _a1719[_i1720];
                    if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t1721 = sp.rowOf[v_a];
                    const _t1722 = sp.colOf[v_a];
                    for (let _i1723 = 0; _i1723 < 2; _i1723++) {
                      const v_L = _i1723 === 0 ? _t1721 : _t1722;
                      if (_i1723 === 1 && (v_L === _t1721)) continue;
                      _g1724.length = 0;
                      G1725: {
                        const _a1728 = sp.lineCells[v_L];
                        for (let _i1729 = 0; _i1729 < _a1728.length; _i1729++) {
                          const v_x = _a1728[_i1729];
                          if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g1724.push(v_x);
                        }
                      }
                      L1730: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g1724);
                        const _h1731 = v_G.length;
                        const _h1762 = (_h1731 === 1);
                        let _c1765: boolean = (_h1731 === v_m);
                        if (_c1765) {
                          let _q1732 = true;
                          Q1733: {
                            _g1734.length = 0;
                            G1735: {
                              _g1748.length = 0;
                              _st1754.pass++;
                              G1749: {
                                const _a1755 = v_G;
                                for (let _i1756 = 0; _i1756 < _a1755.length; _i1756++) {
                                  const v_g = _a1755[_i1756];
                                  const _a1757 = sp.adj4[v_g];
                                  for (let _i1758 = 0; _i1758 < _a1757.length; _i1758++) {
                                    const v_z = _a1757[_i1758];
                                    const _t1759 = v_z;
                                    if (_g1748.length < 16) { if (!_g1748.includes(_t1759)) _g1748.push(_t1759); } else addOnce(_g1748, _st1754, _t1759);
                                  }
                                }
                              }
                              const _a1760 = _g1748;
                              for (let _i1761 = 0; _i1761 < _a1760.length; _i1761++) {
                                const v_y = _a1760[_i1761];
                                if (!((!(v_G.includes(v_y)) && (_h1762 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1734.push(v_y);
                              }
                            }
                            const _a1763 = _g1734;
                            for (let _i1764 = 0; _i1764 < _a1763.length; _i1764++) {
                              const v_y = _a1763[_i1764];
                              if (!(((_t1553.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q1732 = false;
                                break Q1733;
                              }
                            }
                          }
                          _c1765 = _q1732;
                        }
                        let _c1798: boolean = _c1765;
                        if (_c1798) {
                          let _q1766 = false;
                          Q1767: {
                            _g1768.length = 0;
                            G1769: {
                              _g1782.length = 0;
                              _st1788.pass++;
                              G1783: {
                                const _a1789 = v_G;
                                for (let _i1790 = 0; _i1790 < _a1789.length; _i1790++) {
                                  const v_g = _a1789[_i1790];
                                  const _a1791 = sp.adj4[v_g];
                                  for (let _i1792 = 0; _i1792 < _a1791.length; _i1792++) {
                                    const v_z = _a1791[_i1792];
                                    const _t1793 = v_z;
                                    if (_g1782.length < 16) { if (!_g1782.includes(_t1793)) _g1782.push(_t1793); } else addOnce(_g1782, _st1788, _t1793);
                                  }
                                }
                              }
                              const _a1794 = _g1782;
                              for (let _i1795 = 0; _i1795 < _a1794.length; _i1795++) {
                                const v_y = _a1794[_i1795];
                                if (!((!(v_G.includes(v_y)) && (_h1762 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g1768.push(v_y);
                              }
                            }
                            const _a1796 = union(v_G, _g1768);
                            for (let _i1797 = 0; _i1797 < _a1796.length; _i1797++) {
                              const v_x = _a1796[_i1797];
                              if (((v_H.includes(v_x)) || (_t1553.includes(v_x)))) {
                                _q1766 = true;
                                break Q1767;
                              }
                            }
                          }
                          _c1798 = _q1766;
                        }
                        if (!(_c1798)) break L1730;
                        const _t1799 = (v_G[0] ?? -1);
                        const _t1800 = _t1799;
                        if (_g1619.length < 16) { if (!_g1619.includes(_t1800)) _g1619.push(_t1800); } else addOnce(_g1619, _st1705, _t1800);
                      }
                    }
                  }
                }
                L1801: {
                  const v_C = _g1619;
                  const _h1802 = v_C.length;
                  if (!((_h1802 > 0))) break L1801;
                  if ((_h1802 > ((_k1803[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q1617 = true;
                    break Q1618;
                  }
                }
              }
            }
            _c1804 = _q1617;
          }
          if (!(_c1804)) break L1539;
          if (b.made[0] !== _m460_0 || b.made[1] !== _m460_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c1809: boolean = (v_v >= 0);
            if (_c1809) {
              let _g1805 = 0;
              G1806: {
                const _a1807 = sp.lineCells[v_L];
                for (let _i1808 = 0; _i1808 < _a1807.length; _i1808++) {
                  const v_c = _a1807[_i1808];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g1805++;
                }
              }
              _c1809 = (((sp.lineCells[v_L].length - v_v) - _g1805) === 1);
            }
            if (!(_c1809)) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g1810 = -1;
            G1811: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > 0))) continue;
                const _t1812 = cl.fleet.length[v_k];
                if (_g1810 === -1 || _t1812 > _g1810) _g1810 = _t1812;
              }
            }
            let _c1817: boolean = (v_v >= 0);
            if (_c1817) {
              let _g1813 = 0;
              G1814: {
                const _a1815 = sp.lineCells[v_L];
                for (let _i1816 = 0; _i1816 < _a1815.length; _i1816++) {
                  const v_c = _a1815[_i1816];
                  if (!(((b.grid[v_c] || -1) === 2))) continue;
                  _g1813++;
                }
              }
              _c1817 = (((sp.lineCells[v_L].length - v_v) - _g1813) === 1);
            }
            let _g1818 = 0;
            G1819: {
              const _a1820 = sp.lineCells[v_K];
              for (let _i1821 = 0; _i1821 < _a1820.length; _i1821++) {
                const v_c = _a1820[_i1821];
                if (!(((b.grid[v_c] || -1) === 2))) continue;
                _g1818++;
              }
            }
            const _g1822: number[] = [];
            G1823: {
              const _a1826 = sp.lineCells[v_L];
              for (let _i1827 = 0; _i1827 < _a1826.length; _i1827++) {
                const v_x = _a1826[_i1827];
                if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                _g1822.push(v_x);
              }
            }
            const _g1828: number[] = [];
            G1829: {
              const _g1838: number[] = [];
              G1839: {
                const _a1842 = sp.lineCells[v_K];
                for (let _i1843 = 0; _i1843 < _a1842.length; _i1843++) {
                  const v_x = _a1842[_i1843];
                  if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                  _g1838.push(v_x);
                }
              }
              const _a1844 = _g1838;
              for (let _i1845 = 0; _i1845 < _a1844.length; _i1845++) {
                const v_x = _a1844[_i1845];
                if (!(((v_j >= 0) && (v_t === 1)))) continue;
                _g1828.push(v_x);
              }
            }
            const _t1846 = setOf(v_c);
            const _g1847: number[] = [];
            G1848: {
              const _a1853 = v_H;
              for (let _i1854 = 0; _i1854 < _a1853.length; _i1854++) {
                const v_a = _a1853[_i1854];
                const _a1855 = sp.adj8[v_a];
                for (let _i1856 = 0; _i1856 < _a1855.length; _i1856++) {
                  const v_d = _a1855[_i1856];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g1847.includes(v_d)) _g1847.push(v_d);
                }
              }
            }
            const _t1857 = union(_t1846, _g1847);
            let _q1858 = false;
            Q1859: {
              const _a1860 = v_H;
              for (let _i1861 = 0; _i1861 < _a1860.length; _i1861++) {
                const v_a = _a1860[_i1861];
                const _a1862 = sp.adj8[v_a];
                for (let _i1863 = 0; _i1863 < _a1862.length; _i1863++) {
                  const v_b = _a1862[_i1863];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((v_H.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q1858 = true;
                    break Q1859;
                  }
                }
              }
            }
            let _c1890: boolean = _q1858;
            if (!_c1890) {
              let _q1864 = false;
              Q1865: {
                const _g1866: number[] = [];
                G1867: {
                  const _a1873 = union(v_H, _t1857);
                  for (let _i1874 = 0; _i1874 < _a1873.length; _i1874++) {
                    const v_a = _a1873[_i1874];
                    const _t1875 = sp.rowOf[v_a];
                    const _t1876 = sp.colOf[v_a];
                    for (let _i1877 = 0; _i1877 < 2; _i1877++) {
                      const v_M = _i1877 === 0 ? _t1875 : _t1876;
                      if (_i1877 === 1 && (v_M === _t1875)) continue;
                      if (!_g1866.includes(v_M)) _g1866.push(v_M);
                    }
                  }
                }
                const _a1878 = _g1866;
                for (let _i1879 = 0; _i1879 < _a1878.length; _i1879++) {
                  const v_L = _a1878[_i1879];
                  L1880: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L1880;
                    let _g1881 = 0;
                    G1882: {
                      const _a1883 = sp.lineCells[v_L];
                      for (let _i1884 = 0; _i1884 < _a1883.length; _i1884++) {
                        const v_x = _a1883[_i1884];
                        if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g1881++;
                      }
                    }
                    let _c1889: boolean = (_g1881 > v_v);
                    if (!_c1889) {
                      let _g1885 = 0;
                      G1886: {
                        const _a1887 = sp.lineCells[v_L];
                        for (let _i1888 = 0; _i1888 < _a1887.length; _i1888++) {
                          const v_x = _a1887[_i1888];
                          if (!((!(_t1857.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g1885++;
                        }
                      }
                      _c1889 = (_g1885 < v_v);
                    }
                    if (_c1889) {
                      _q1864 = true;
                      break Q1865;
                    }
                  }
                }
              }
              _c1890 = _q1864;
            }
            let _c1897: boolean = _c1890;
            if (!_c1897) {
              let _g1891 = 0;
              G1892: {
                const _a1893 = sp.cells;
                for (let _i1894 = 0; _i1894 < _a1893.length; _i1894++) {
                  const v_x = _a1893[_i1894];
                  if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g1891++;
                }
              }
              let _g1895 = 0;
              G1896: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g1895 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c1897 = (_g1891 > _g1895);
            }
            let _c1904: boolean = _c1897;
            if (!_c1904) {
              let _g1898 = 0;
              G1899: {
                const _a1900 = sp.cells;
                for (let _i1901 = 0; _i1901 < _a1900.length; _i1901++) {
                  const v_x = _a1900[_i1901];
                  if (!((!(_t1857.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g1898++;
                }
              }
              let _g1902 = 0;
              G1903: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g1902 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c1904 = (_g1898 < _g1902);
            }
            let _c1918: boolean = _c1904;
            if (!_c1918) {
              let _q1905 = false;
              Q1906: {
                const _a1907 = v_H;
                for (let _i1908 = 0; _i1908 < _a1907.length; _i1908++) {
                  const v_a = _a1907[_i1908];
                  const _t1909 = sp.rowOf[v_a];
                  const _t1910 = sp.colOf[v_a];
                  for (let _i1911 = 0; _i1911 < 2; _i1911++) {
                    const v_L = _i1911 === 0 ? _t1909 : _t1910;
                    if (_i1911 === 1 && (v_L === _t1909)) continue;
                    const _g1912: number[] = [];
                    G1913: {
                      const _a1916 = sp.lineCells[v_L];
                      for (let _i1917 = 0; _i1917 < _a1916.length; _i1917++) {
                        const v_x = _a1916[_i1917];
                        if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g1912.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g1912).length > v_T)) {
                      _q1905 = true;
                      break Q1906;
                    }
                  }
                }
              }
              _c1918 = _q1905;
            }
            let _c2093: boolean = _c1918;
            if (!_c2093) {
              let _q1919 = false;
              Q1920: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g1921: number[] = [];
                  G1922: {
                    const _g2007: number[] = [];
                    G2008: {
                      const _a2013 = union(v_H, _t1857);
                      for (let _i2014 = 0; _i2014 < _a2013.length; _i2014++) {
                        const v_x = _a2013[_i2014];
                        const _a2015 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i2016 = 0; _i2016 < _a2015.length; _i2016++) {
                          const v_y = _a2015[_i2016];
                          if (!_g2007.includes(v_y)) _g2007.push(v_y);
                        }
                      }
                    }
                    const _a2017 = _g2007;
                    for (let _i2018 = 0; _i2018 < _a2017.length; _i2018++) {
                      const v_a = _a2017[_i2018];
                      if (!(((v_H.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t2019 = sp.rowOf[v_a];
                      const _t2020 = sp.colOf[v_a];
                      for (let _i2021 = 0; _i2021 < 2; _i2021++) {
                        const v_L = _i2021 === 0 ? _t2019 : _t2020;
                        if (_i2021 === 1 && (v_L === _t2019)) continue;
                        const _g2022: number[] = [];
                        G2023: {
                          const _a2026 = sp.lineCells[v_L];
                          for (let _i2027 = 0; _i2027 < _a2026.length; _i2027++) {
                            const v_x = _a2026[_i2027];
                            if (!(((v_H.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g2022.push(v_x);
                          }
                        }
                        L2028: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g2022);
                          let _c2059: boolean = (v_G.length === v_m);
                          if (_c2059) {
                            let _q2029 = true;
                            Q2030: {
                              const _g2031: number[] = [];
                              G2032: {
                                const _g2045: number[] = [];
                                G2046: {
                                  const _a2051 = v_G;
                                  for (let _i2052 = 0; _i2052 < _a2051.length; _i2052++) {
                                    const v_g = _a2051[_i2052];
                                    const _a2053 = sp.adj4[v_g];
                                    for (let _i2054 = 0; _i2054 < _a2053.length; _i2054++) {
                                      const v_z = _a2053[_i2054];
                                      if (!_g2045.includes(v_z)) _g2045.push(v_z);
                                    }
                                  }
                                }
                                const _a2055 = _g2045;
                                for (let _i2056 = 0; _i2056 < _a2055.length; _i2056++) {
                                  const v_y = _a2055[_i2056];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g2031.push(v_y);
                                }
                              }
                              const _a2057 = _g2031;
                              for (let _i2058 = 0; _i2058 < _a2057.length; _i2058++) {
                                const v_y = _a2057[_i2058];
                                if (!(((_t1857.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q2029 = false;
                                  break Q2030;
                                }
                              }
                            }
                            _c2059 = _q2029;
                          }
                          let _c2090: boolean = _c2059;
                          if (_c2090) {
                            let _q2060 = false;
                            Q2061: {
                              const _g2062: number[] = [];
                              G2063: {
                                const _g2076: number[] = [];
                                G2077: {
                                  const _a2082 = v_G;
                                  for (let _i2083 = 0; _i2083 < _a2082.length; _i2083++) {
                                    const v_g = _a2082[_i2083];
                                    const _a2084 = sp.adj4[v_g];
                                    for (let _i2085 = 0; _i2085 < _a2084.length; _i2085++) {
                                      const v_z = _a2084[_i2085];
                                      if (!_g2076.includes(v_z)) _g2076.push(v_z);
                                    }
                                  }
                                }
                                const _a2086 = _g2076;
                                for (let _i2087 = 0; _i2087 < _a2086.length; _i2087++) {
                                  const v_y = _a2086[_i2087];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g2062.push(v_y);
                                }
                              }
                              const _a2088 = union(v_G, _g2062);
                              for (let _i2089 = 0; _i2089 < _a2088.length; _i2089++) {
                                const v_x = _a2088[_i2089];
                                if (((v_H.includes(v_x)) || (_t1857.includes(v_x)))) {
                                  _q2060 = true;
                                  break Q2061;
                                }
                              }
                            }
                            _c2090 = _q2060;
                          }
                          if (!(_c2090)) break L2028;
                          const _t2091 = (v_G[0] ?? -1);
                          if (!_g1921.includes(_t2091)) _g1921.push(_t2091);
                        }
                      }
                    }
                  }
                  L2092: {
                    const v_C = _g1921;
                    if (!((v_C.length > 0))) break L2092;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q1919 = true;
                      break Q1920;
                    }
                  }
                }
              }
              _c2093 = _q1919;
            }
            freshBinding("lastWater", [(v_T === _g1810), (sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), _c1817, (sp.lineCells[v_L].includes(v_c)), !((b.grid[v_c] !== 0)), (v_K === crossing(sp, v_L, v_c)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_t === ((sp.lineCells[v_K].length - v_j) - _g1818)), sameSet(v_H, union(_g1822, _g1828)), _c2093], ["T =", "L in", "v =", "where of v", "c in", "where of c", "K =", "j =", "t =", "H =", "where of H"]);
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
const _st2448 = stamps();
const _st2470 = stamps();
const _st2606 = stamps();
const _st2613 = stamps();
const _st2655 = stamps();
const _st2689 = stamps();

/** Its dearest read grows with the board as n^2. */
export function lastShip(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<LastShipBinding> | null): number {
  const _g2413: number[] = [];
  const _g2419: number[] = [];
  const _g2429: number[] = [];
  const _g2442: number[] = [];
  const _g2463: number[] = [];
  const _g2511: number[] = [];
  const _g2520: number[] = [];
  const _g2607: number[] = [];
  const _g2625: number[] = [];
  const _g2635: number[] = [];
  const _g2649: number[] = [];
  const _g2669: number[] = [];
  const _g2683: number[] = [];
  const facts = lastShipFacts;
  let fired = 0;
  let changed = false;
  const _k2704 = boatsOfKept.board(cl);
  if (lastShipCands.length < sp.cells.length) lastShipCands = new Int32Array(sp.cells.length);
  const cands = lastShipCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g2390 = -1;
  G2391: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t2392 = cl.fleet.length[v_k];
      if (_g2390 === -1 || _t2392 > _g2390) _g2390 = _t2392;
    }
  }
  const v_T = _g2390;
  const _a2393 = sp.lines;
  R1:
  for (let _i2394 = 0; _i2394 < _a2393.length; _i2394++) {
    const v_L = _a2393[_i2394];
    const _m556_0 = b.made[0];
    const _m556_1 = b.made[1];
    let _q2395 = false;
    Q2396: {
      const _a2397 = sp.lineCells[v_L];
      for (let _i2398 = 0; _i2398 < _a2397.length; _i2398++) {
        const v_c = _a2397[_i2398];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        if (true) {
          _q2395 = true;
          break Q2396;
        }
      }
    }
    if (!(_q2395)) continue;
    L2399: {
      const v_v = numMarked(b, sp, cl, cands, v_L);
      let _c2405: boolean = (v_v >= 0);
      if (_c2405) {
        const _t2400 = sp.lineCells[v_L];
        let _g2401 = 0;
        G2402: {
          const _a2403 = _t2400;
          for (let _i2404 = 0; _i2404 < _a2403.length; _i2404++) {
            const v_c = _a2403[_i2404];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g2401++;
          }
        }
        _c2405 = ((v_v - _g2401) === 1);
      }
      if (!(_c2405)) break L2399;
      const _a2406 = sp.lineCells[v_L];
      for (let _i2407 = 0; _i2407 < _a2406.length; _i2407++) {
        const v_c = _a2406[_i2407];
        if (!(!((b.grid[v_c] !== 0)))) continue;
        const v_K = crossing(sp, v_L, v_c);
        const v_j = numMarked(b, sp, cl, cands, v_K);
        const _h2437 = (v_j >= 0);
        const _t2408 = sp.lineCells[v_K];
        let _g2409 = 0;
        G2410: {
          const _a2411 = _t2408;
          for (let _i2412 = 0; _i2412 < _a2411.length; _i2412++) {
            const v_c = _a2411[_i2412];
            if (!(((b.grid[v_c] || -1) === 1))) continue;
            _g2409++;
          }
        }
        const v_u = (v_j - _g2409);
        const _h2438 = (v_u === 1);
        const _h2439 = (_h2437 && _h2438);
        _g2413.length = 0;
        G2414: {
          const _a2417 = sp.lineCells[v_L];
          for (let _i2418 = 0; _i2418 < _a2417.length; _i2418++) {
            const v_x = _a2417[_i2418];
            if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
            _g2413.push(v_x);
          }
        }
        _g2419.length = 0;
        G2420: {
          _g2429.length = 0;
          G2430: {
            const _a2433 = sp.lineCells[v_K];
            for (let _i2434 = 0; _i2434 < _a2433.length; _i2434++) {
              const v_x = _a2433[_i2434];
              if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
              _g2429.push(v_x);
            }
          }
          const _a2435 = _g2429;
          for (let _i2436 = 0; _i2436 < _a2435.length; _i2436++) {
            const v_x = _a2435[_i2436];
            if (!(_h2439)) continue;
            _g2419.push(v_x);
          }
        }
        L2440: {
          const v_W = union(_g2413, _g2419);
          const _t2441 = setOf(v_c);
          _g2442.length = 0;
          _st2448.pass++;
          G2443: {
            const _a2449 = _t2441;
            for (let _i2450 = 0; _i2450 < _a2449.length; _i2450++) {
              const v_a = _a2449[_i2450];
              const _a2451 = sp.adj8[v_a];
              for (let _i2452 = 0; _i2452 < _a2451.length; _i2452++) {
                const v_d = _a2451[_i2452];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t2453 = v_d;
                if (_g2442.length < 16) { if (!_g2442.includes(_t2453)) _g2442.push(_t2453); } else addOnce(_g2442, _st2448, _t2453);
              }
            }
          }
          const _t2454 = union(v_W, _g2442);
          const _h2614 = union(_t2441, _t2454);
          let _q2455 = false;
          Q2456: {
            const _a2457 = _t2441;
            for (let _i2458 = 0; _i2458 < _a2457.length; _i2458++) {
              const v_a = _a2457[_i2458];
              const _a2459 = sp.adj8[v_a];
              for (let _i2460 = 0; _i2460 < _a2459.length; _i2460++) {
                const v_b = _a2459[_i2460];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((_t2441.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q2455 = true;
                  break Q2456;
                }
              }
            }
          }
          let _c2489: boolean = _q2455;
          if (!_c2489) {
            let _q2461 = false;
            Q2462: {
              _g2463.length = 0;
              _st2470.pass++;
              G2464: {
                const _a2471 = union(_t2441, _t2454);
                for (let _i2472 = 0; _i2472 < _a2471.length; _i2472++) {
                  const v_a = _a2471[_i2472];
                  const _t2473 = sp.rowOf[v_a];
                  const _t2474 = sp.colOf[v_a];
                  for (let _i2475 = 0; _i2475 < 2; _i2475++) {
                    const v_M = _i2475 === 0 ? _t2473 : _t2474;
                    if (_i2475 === 1 && (v_M === _t2473)) continue;
                    const _t2476 = v_M;
                    if (_g2463.length < 16) { if (!_g2463.includes(_t2476)) _g2463.push(_t2476); } else addOnce(_g2463, _st2470, _t2476);
                  }
                }
              }
              const _a2477 = _g2463;
              for (let _i2478 = 0; _i2478 < _a2477.length; _i2478++) {
                const v_L = _a2477[_i2478];
                L2479: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L2479;
                  let _g2480 = 0;
                  G2481: {
                    const _a2482 = sp.lineCells[v_L];
                    for (let _i2483 = 0; _i2483 < _a2482.length; _i2483++) {
                      const v_x = _a2482[_i2483];
                      if (!(((_t2441.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2480++;
                    }
                  }
                  let _c2488: boolean = (_g2480 > v_v);
                  if (!_c2488) {
                    let _g2484 = 0;
                    G2485: {
                      const _a2486 = sp.lineCells[v_L];
                      for (let _i2487 = 0; _i2487 < _a2486.length; _i2487++) {
                        const v_x = _a2486[_i2487];
                        if (!((!(_t2454.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g2484++;
                      }
                    }
                    _c2488 = (_g2484 < v_v);
                  }
                  if (_c2488) {
                    _q2461 = true;
                    break Q2462;
                  }
                }
              }
            }
            _c2489 = _q2461;
          }
          let _c2496: boolean = _c2489;
          if (!_c2496) {
            let _g2490 = 0;
            G2491: {
              const _a2492 = sp.cells;
              for (let _i2493 = 0; _i2493 < _a2492.length; _i2493++) {
                const v_x = _a2492[_i2493];
                if (!(((_t2441.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g2490++;
              }
            }
            let _g2494 = 0;
            G2495: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2494 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2496 = (_g2490 > _g2494);
          }
          let _c2503: boolean = _c2496;
          if (!_c2503) {
            let _g2497 = 0;
            G2498: {
              const _a2499 = sp.cells;
              for (let _i2500 = 0; _i2500 < _a2499.length; _i2500++) {
                const v_x = _a2499[_i2500];
                if (!((!(_t2454.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g2497++;
              }
            }
            let _g2501 = 0;
            G2502: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g2501 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c2503 = (_g2497 < _g2501);
          }
          let _c2517: boolean = _c2503;
          if (!_c2517) {
            let _q2504 = false;
            Q2505: {
              const _a2506 = _t2441;
              for (let _i2507 = 0; _i2507 < _a2506.length; _i2507++) {
                const v_a = _a2506[_i2507];
                const _t2508 = sp.rowOf[v_a];
                const _t2509 = sp.colOf[v_a];
                for (let _i2510 = 0; _i2510 < 2; _i2510++) {
                  const v_L = _i2510 === 0 ? _t2508 : _t2509;
                  if (_i2510 === 1 && (v_L === _t2508)) continue;
                  _g2511.length = 0;
                  G2512: {
                    const _a2515 = sp.lineCells[v_L];
                    for (let _i2516 = 0; _i2516 < _a2515.length; _i2516++) {
                      const v_x = _a2515[_i2516];
                      if (!(((_t2441.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g2511.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g2511).length > v_T)) {
                    _q2504 = true;
                    break Q2505;
                  }
                }
              }
            }
            _c2517 = _q2504;
          }
          let _c2705: boolean = _c2517;
          if (!_c2705) {
            let _q2518 = false;
            Q2519: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g2520.length = 0;
                _st2606.pass++;
                G2521: {
                  _g2607.length = 0;
                  _st2613.pass++;
                  G2608: {
                    const _a2615 = _h2614;
                    for (let _i2616 = 0; _i2616 < _a2615.length; _i2616++) {
                      const v_x = _a2615[_i2616];
                      const _a2617 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i2618 = 0; _i2618 < _a2617.length; _i2618++) {
                        const v_y = _a2617[_i2618];
                        const _t2619 = v_y;
                        if (_g2607.length < 16) { if (!_g2607.includes(_t2619)) _g2607.push(_t2619); } else addOnce(_g2607, _st2613, _t2619);
                      }
                    }
                  }
                  const _a2620 = _g2607;
                  for (let _i2621 = 0; _i2621 < _a2620.length; _i2621++) {
                    const v_a = _a2620[_i2621];
                    if (!(((_t2441.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t2622 = sp.rowOf[v_a];
                    const _t2623 = sp.colOf[v_a];
                    for (let _i2624 = 0; _i2624 < 2; _i2624++) {
                      const v_L = _i2624 === 0 ? _t2622 : _t2623;
                      if (_i2624 === 1 && (v_L === _t2622)) continue;
                      _g2625.length = 0;
                      G2626: {
                        const _a2629 = sp.lineCells[v_L];
                        for (let _i2630 = 0; _i2630 < _a2629.length; _i2630++) {
                          const v_x = _a2629[_i2630];
                          if (!(((_t2441.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g2625.push(v_x);
                        }
                      }
                      L2631: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g2625);
                        const _h2632 = v_G.length;
                        const _h2663 = (_h2632 === 1);
                        let _c2666: boolean = (_h2632 === v_m);
                        if (_c2666) {
                          let _q2633 = true;
                          Q2634: {
                            _g2635.length = 0;
                            G2636: {
                              _g2649.length = 0;
                              _st2655.pass++;
                              G2650: {
                                const _a2656 = v_G;
                                for (let _i2657 = 0; _i2657 < _a2656.length; _i2657++) {
                                  const v_g = _a2656[_i2657];
                                  const _a2658 = sp.adj4[v_g];
                                  for (let _i2659 = 0; _i2659 < _a2658.length; _i2659++) {
                                    const v_z = _a2658[_i2659];
                                    const _t2660 = v_z;
                                    if (_g2649.length < 16) { if (!_g2649.includes(_t2660)) _g2649.push(_t2660); } else addOnce(_g2649, _st2655, _t2660);
                                  }
                                }
                              }
                              const _a2661 = _g2649;
                              for (let _i2662 = 0; _i2662 < _a2661.length; _i2662++) {
                                const v_y = _a2661[_i2662];
                                if (!((!(v_G.includes(v_y)) && (_h2663 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2635.push(v_y);
                              }
                            }
                            const _a2664 = _g2635;
                            for (let _i2665 = 0; _i2665 < _a2664.length; _i2665++) {
                              const v_y = _a2664[_i2665];
                              if (!(((_t2454.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q2633 = false;
                                break Q2634;
                              }
                            }
                          }
                          _c2666 = _q2633;
                        }
                        let _c2699: boolean = _c2666;
                        if (_c2699) {
                          let _q2667 = false;
                          Q2668: {
                            _g2669.length = 0;
                            G2670: {
                              _g2683.length = 0;
                              _st2689.pass++;
                              G2684: {
                                const _a2690 = v_G;
                                for (let _i2691 = 0; _i2691 < _a2690.length; _i2691++) {
                                  const v_g = _a2690[_i2691];
                                  const _a2692 = sp.adj4[v_g];
                                  for (let _i2693 = 0; _i2693 < _a2692.length; _i2693++) {
                                    const v_z = _a2692[_i2693];
                                    const _t2694 = v_z;
                                    if (_g2683.length < 16) { if (!_g2683.includes(_t2694)) _g2683.push(_t2694); } else addOnce(_g2683, _st2689, _t2694);
                                  }
                                }
                              }
                              const _a2695 = _g2683;
                              for (let _i2696 = 0; _i2696 < _a2695.length; _i2696++) {
                                const v_y = _a2695[_i2696];
                                if (!((!(v_G.includes(v_y)) && (_h2663 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g2669.push(v_y);
                              }
                            }
                            const _a2697 = union(v_G, _g2669);
                            for (let _i2698 = 0; _i2698 < _a2697.length; _i2698++) {
                              const v_x = _a2697[_i2698];
                              if (((_t2441.includes(v_x)) || (_t2454.includes(v_x)))) {
                                _q2667 = true;
                                break Q2668;
                              }
                            }
                          }
                          _c2699 = _q2667;
                        }
                        if (!(_c2699)) break L2631;
                        const _t2700 = (v_G[0] ?? -1);
                        const _t2701 = _t2700;
                        if (_g2520.length < 16) { if (!_g2520.includes(_t2701)) _g2520.push(_t2701); } else addOnce(_g2520, _st2606, _t2701);
                      }
                    }
                  }
                }
                L2702: {
                  const v_C = _g2520;
                  const _h2703 = v_C.length;
                  if (!((_h2703 > 0))) break L2702;
                  if ((_h2703 > ((_k2704[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q2518 = true;
                    break Q2519;
                  }
                }
              }
            }
            _c2705 = _q2518;
          }
          if (!(_c2705)) break L2440;
          if (b.made[0] !== _m556_0 || b.made[1] !== _m556_1) {
            if (!((v_v === numMarked(b, sp, cl, cands, v_L)))) { continue R1; }
            let _c2711: boolean = (v_v >= 0);
            if (_c2711) {
              const _t2706 = sp.lineCells[v_L];
              let _g2707 = 0;
              G2708: {
                const _a2709 = _t2706;
                for (let _i2710 = 0; _i2710 < _a2709.length; _i2710++) {
                  const v_c = _a2709[_i2710];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g2707++;
                }
              }
              _c2711 = ((v_v - _g2707) === 1);
            }
            if (!(_c2711)) { continue R1; }
          }
          if (import.meta.env.DEV && staleChecking) {
            let _g2712 = -1;
            G2713: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                if (!((cl.fleet.boats[v_k] > 0))) continue;
                const _t2714 = cl.fleet.length[v_k];
                if (_g2712 === -1 || _t2714 > _g2712) _g2712 = _t2714;
              }
            }
            let _c2720: boolean = (v_v >= 0);
            if (_c2720) {
              const _t2715 = sp.lineCells[v_L];
              let _g2716 = 0;
              G2717: {
                const _a2718 = _t2715;
                for (let _i2719 = 0; _i2719 < _a2718.length; _i2719++) {
                  const v_c = _a2718[_i2719];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g2716++;
                }
              }
              _c2720 = ((v_v - _g2716) === 1);
            }
            const _t2721 = sp.lineCells[v_K];
            let _g2722 = 0;
            G2723: {
              const _a2724 = _t2721;
              for (let _i2725 = 0; _i2725 < _a2724.length; _i2725++) {
                const v_c = _a2724[_i2725];
                if (!(((b.grid[v_c] || -1) === 1))) continue;
                _g2722++;
              }
            }
            const _g2726: number[] = [];
            G2727: {
              const _a2730 = sp.lineCells[v_L];
              for (let _i2731 = 0; _i2731 < _a2730.length; _i2731++) {
                const v_x = _a2730[_i2731];
                if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                _g2726.push(v_x);
              }
            }
            const _g2732: number[] = [];
            G2733: {
              const _g2742: number[] = [];
              G2743: {
                const _a2746 = sp.lineCells[v_K];
                for (let _i2747 = 0; _i2747 < _a2746.length; _i2747++) {
                  const v_x = _a2746[_i2747];
                  if (!(((v_x !== v_c) && !((b.grid[v_x] !== 0))))) continue;
                  _g2742.push(v_x);
                }
              }
              const _a2748 = _g2742;
              for (let _i2749 = 0; _i2749 < _a2748.length; _i2749++) {
                const v_x = _a2748[_i2749];
                if (!(((v_j >= 0) && (v_u === 1)))) continue;
                _g2732.push(v_x);
              }
            }
            const _t2750 = setOf(v_c);
            const _g2751: number[] = [];
            G2752: {
              const _a2757 = _t2750;
              for (let _i2758 = 0; _i2758 < _a2757.length; _i2758++) {
                const v_a = _a2757[_i2758];
                const _a2759 = sp.adj8[v_a];
                for (let _i2760 = 0; _i2760 < _a2759.length; _i2760++) {
                  const v_d = _a2759[_i2760];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g2751.includes(v_d)) _g2751.push(v_d);
                }
              }
            }
            const _t2761 = union(v_W, _g2751);
            let _q2762 = false;
            Q2763: {
              const _a2764 = _t2750;
              for (let _i2765 = 0; _i2765 < _a2764.length; _i2765++) {
                const v_a = _a2764[_i2765];
                const _a2766 = sp.adj8[v_a];
                for (let _i2767 = 0; _i2767 < _a2766.length; _i2767++) {
                  const v_b = _a2766[_i2767];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((_t2750.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q2762 = true;
                    break Q2763;
                  }
                }
              }
            }
            let _c2794: boolean = _q2762;
            if (!_c2794) {
              let _q2768 = false;
              Q2769: {
                const _g2770: number[] = [];
                G2771: {
                  const _a2777 = union(_t2750, _t2761);
                  for (let _i2778 = 0; _i2778 < _a2777.length; _i2778++) {
                    const v_a = _a2777[_i2778];
                    const _t2779 = sp.rowOf[v_a];
                    const _t2780 = sp.colOf[v_a];
                    for (let _i2781 = 0; _i2781 < 2; _i2781++) {
                      const v_M = _i2781 === 0 ? _t2779 : _t2780;
                      if (_i2781 === 1 && (v_M === _t2779)) continue;
                      if (!_g2770.includes(v_M)) _g2770.push(v_M);
                    }
                  }
                }
                const _a2782 = _g2770;
                for (let _i2783 = 0; _i2783 < _a2782.length; _i2783++) {
                  const v_L = _a2782[_i2783];
                  L2784: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L2784;
                    let _g2785 = 0;
                    G2786: {
                      const _a2787 = sp.lineCells[v_L];
                      for (let _i2788 = 0; _i2788 < _a2787.length; _i2788++) {
                        const v_x = _a2787[_i2788];
                        if (!(((_t2750.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g2785++;
                      }
                    }
                    let _c2793: boolean = (_g2785 > v_v);
                    if (!_c2793) {
                      let _g2789 = 0;
                      G2790: {
                        const _a2791 = sp.lineCells[v_L];
                        for (let _i2792 = 0; _i2792 < _a2791.length; _i2792++) {
                          const v_x = _a2791[_i2792];
                          if (!((!(_t2761.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g2789++;
                        }
                      }
                      _c2793 = (_g2789 < v_v);
                    }
                    if (_c2793) {
                      _q2768 = true;
                      break Q2769;
                    }
                  }
                }
              }
              _c2794 = _q2768;
            }
            let _c2801: boolean = _c2794;
            if (!_c2801) {
              let _g2795 = 0;
              G2796: {
                const _a2797 = sp.cells;
                for (let _i2798 = 0; _i2798 < _a2797.length; _i2798++) {
                  const v_x = _a2797[_i2798];
                  if (!(((_t2750.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g2795++;
                }
              }
              let _g2799 = 0;
              G2800: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g2799 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c2801 = (_g2795 > _g2799);
            }
            let _c2808: boolean = _c2801;
            if (!_c2808) {
              let _g2802 = 0;
              G2803: {
                const _a2804 = sp.cells;
                for (let _i2805 = 0; _i2805 < _a2804.length; _i2805++) {
                  const v_x = _a2804[_i2805];
                  if (!((!(_t2761.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g2802++;
                }
              }
              let _g2806 = 0;
              G2807: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g2806 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c2808 = (_g2802 < _g2806);
            }
            let _c2822: boolean = _c2808;
            if (!_c2822) {
              let _q2809 = false;
              Q2810: {
                const _a2811 = _t2750;
                for (let _i2812 = 0; _i2812 < _a2811.length; _i2812++) {
                  const v_a = _a2811[_i2812];
                  const _t2813 = sp.rowOf[v_a];
                  const _t2814 = sp.colOf[v_a];
                  for (let _i2815 = 0; _i2815 < 2; _i2815++) {
                    const v_L = _i2815 === 0 ? _t2813 : _t2814;
                    if (_i2815 === 1 && (v_L === _t2813)) continue;
                    const _g2816: number[] = [];
                    G2817: {
                      const _a2820 = sp.lineCells[v_L];
                      for (let _i2821 = 0; _i2821 < _a2820.length; _i2821++) {
                        const v_x = _a2820[_i2821];
                        if (!(((_t2750.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g2816.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g2816).length > v_T)) {
                      _q2809 = true;
                      break Q2810;
                    }
                  }
                }
              }
              _c2822 = _q2809;
            }
            let _c2997: boolean = _c2822;
            if (!_c2997) {
              let _q2823 = false;
              Q2824: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g2825: number[] = [];
                  G2826: {
                    const _g2911: number[] = [];
                    G2912: {
                      const _a2917 = union(_t2750, _t2761);
                      for (let _i2918 = 0; _i2918 < _a2917.length; _i2918++) {
                        const v_x = _a2917[_i2918];
                        const _a2919 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i2920 = 0; _i2920 < _a2919.length; _i2920++) {
                          const v_y = _a2919[_i2920];
                          if (!_g2911.includes(v_y)) _g2911.push(v_y);
                        }
                      }
                    }
                    const _a2921 = _g2911;
                    for (let _i2922 = 0; _i2922 < _a2921.length; _i2922++) {
                      const v_a = _a2921[_i2922];
                      if (!(((_t2750.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t2923 = sp.rowOf[v_a];
                      const _t2924 = sp.colOf[v_a];
                      for (let _i2925 = 0; _i2925 < 2; _i2925++) {
                        const v_L = _i2925 === 0 ? _t2923 : _t2924;
                        if (_i2925 === 1 && (v_L === _t2923)) continue;
                        const _g2926: number[] = [];
                        G2927: {
                          const _a2930 = sp.lineCells[v_L];
                          for (let _i2931 = 0; _i2931 < _a2930.length; _i2931++) {
                            const v_x = _a2930[_i2931];
                            if (!(((_t2750.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g2926.push(v_x);
                          }
                        }
                        L2932: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g2926);
                          let _c2963: boolean = (v_G.length === v_m);
                          if (_c2963) {
                            let _q2933 = true;
                            Q2934: {
                              const _g2935: number[] = [];
                              G2936: {
                                const _g2949: number[] = [];
                                G2950: {
                                  const _a2955 = v_G;
                                  for (let _i2956 = 0; _i2956 < _a2955.length; _i2956++) {
                                    const v_g = _a2955[_i2956];
                                    const _a2957 = sp.adj4[v_g];
                                    for (let _i2958 = 0; _i2958 < _a2957.length; _i2958++) {
                                      const v_z = _a2957[_i2958];
                                      if (!_g2949.includes(v_z)) _g2949.push(v_z);
                                    }
                                  }
                                }
                                const _a2959 = _g2949;
                                for (let _i2960 = 0; _i2960 < _a2959.length; _i2960++) {
                                  const v_y = _a2959[_i2960];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g2935.push(v_y);
                                }
                              }
                              const _a2961 = _g2935;
                              for (let _i2962 = 0; _i2962 < _a2961.length; _i2962++) {
                                const v_y = _a2961[_i2962];
                                if (!(((_t2761.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q2933 = false;
                                  break Q2934;
                                }
                              }
                            }
                            _c2963 = _q2933;
                          }
                          let _c2994: boolean = _c2963;
                          if (_c2994) {
                            let _q2964 = false;
                            Q2965: {
                              const _g2966: number[] = [];
                              G2967: {
                                const _g2980: number[] = [];
                                G2981: {
                                  const _a2986 = v_G;
                                  for (let _i2987 = 0; _i2987 < _a2986.length; _i2987++) {
                                    const v_g = _a2986[_i2987];
                                    const _a2988 = sp.adj4[v_g];
                                    for (let _i2989 = 0; _i2989 < _a2988.length; _i2989++) {
                                      const v_z = _a2988[_i2989];
                                      if (!_g2980.includes(v_z)) _g2980.push(v_z);
                                    }
                                  }
                                }
                                const _a2990 = _g2980;
                                for (let _i2991 = 0; _i2991 < _a2990.length; _i2991++) {
                                  const v_y = _a2990[_i2991];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g2966.push(v_y);
                                }
                              }
                              const _a2992 = union(v_G, _g2966);
                              for (let _i2993 = 0; _i2993 < _a2992.length; _i2993++) {
                                const v_x = _a2992[_i2993];
                                if (((_t2750.includes(v_x)) || (_t2761.includes(v_x)))) {
                                  _q2964 = true;
                                  break Q2965;
                                }
                              }
                            }
                            _c2994 = _q2964;
                          }
                          if (!(_c2994)) break L2932;
                          const _t2995 = (v_G[0] ?? -1);
                          if (!_g2825.includes(_t2995)) _g2825.push(_t2995);
                        }
                      }
                    }
                  }
                  L2996: {
                    const v_C = _g2825;
                    if (!((v_C.length > 0))) break L2996;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q2823 = true;
                      break Q2824;
                    }
                  }
                }
              }
              _c2997 = _q2823;
            }
            freshBinding("lastShip", [(v_T === _g2712), (sp.lines.includes(v_L)), (v_v === numMarked(b, sp, cl, cands, v_L)), _c2720, (sp.lineCells[v_L].includes(v_c)), !((b.grid[v_c] !== 0)), (v_K === crossing(sp, v_L, v_c)), (v_j === numMarked(b, sp, cl, cands, v_K)), (v_u === (v_j - _g2722)), sameSet(v_W, union(_g2726, _g2732)), _c2997], ["T =", "L in", "v =", "where of v", "c in", "where of c", "K =", "j =", "u =", "W =", "where of W"]);
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
const _st3306 = stamps();
const _st3328 = stamps();
const _st3464 = stamps();
const _st3471 = stamps();
const _st3513 = stamps();
const _st3547 = stamps();

/** Its dearest read grows with the board as n. */
export function centerTrial(b: Marks, sp: GridSpace, cl: Dealt, fire: Fire<CenterTrialBinding> | null): number {
  const _g3281: number[] = [];
  const _g3294: number[] = [];
  const _g3300: number[] = [];
  const _g3321: number[] = [];
  const _g3369: number[] = [];
  const _g3378: number[] = [];
  const _g3465: number[] = [];
  const _g3483: number[] = [];
  const _g3493: number[] = [];
  const _g3507: number[] = [];
  const _g3527: number[] = [];
  const _g3541: number[] = [];
  const facts = centerTrialFacts;
  let fired = 0;
  let changed = false;
  const _k3562 = boatsOfKept.board(cl);
  if (centerTrialCands.length < sp.cells.length) centerTrialCands = new Int32Array(sp.cells.length);
  const cands = centerTrialCands;
  cands.fill(-1);
  numMarkedKept.clear();
  let _g3272 = -1;
  G3273: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.boats[v_k] > 0))) continue;
      const _t3274 = cl.fleet.length[v_k];
      if (_g3272 === -1 || _t3274 > _g3272) _g3272 = _t3274;
    }
  }
  const v_T = _g3272;
  const _a3275 = cluesValued(cl.seg, 6);
  for (let _i3276 = 0; _i3276 < _a3275.length; _i3276++) {
    const v_c = _a3275[_i3276];
    const _h3277 = clueAt(cl.seg, v_c);
    if (!((_h3277 === 6))) continue;
    const _t3278 = sp.rowOf[v_c];
    const _t3279 = sp.colOf[v_c];
    for (let _i3280 = 0; _i3280 < 2; _i3280++) {
      const v_L = _i3280 === 0 ? _t3278 : _t3279;
      if (_i3280 === 1 && (v_L === _t3278)) continue;
      _g3281.length = 0;
      G3282: {
        const _a3285 = sp.adj4[v_c];
        for (let _i3286 = 0; _i3286 < _a3285.length; _i3286++) {
          const v_x = _a3285[_i3286];
          if (!((sp.lineCells[v_L].includes(v_x)))) continue;
          _g3281.push(v_x);
        }
      }
      L3287: {
        const v_S = _g3281;
        const _h3288 = v_S.length;
        let _c3293: boolean = (_h3288 === 2);
        if (_c3293) {
          let _q3289 = false;
          Q3290: {
            const _a3291 = v_S;
            for (let _i3292 = 0; _i3292 < _a3291.length; _i3292++) {
              const v_x = _a3291[_i3292];
              if (!((b.grid[v_x] !== 0))) {
                _q3289 = true;
                break Q3290;
              }
            }
          }
          _c3293 = _q3289;
        }
        let _c3564: boolean = _c3293;
        if (_c3564) {
          _g3294.length = 0;
          G3295: {
            const _a3298 = v_S;
            for (let _i3299 = 0; _i3299 < _a3298.length; _i3299++) {
              const v_x = _a3298[_i3299];
              if (!((v_x !== v_x))) continue;
              _g3294.push(v_x);
            }
          }
          _g3300.length = 0;
          _st3306.pass++;
          G3301: {
            const _a3307 = v_S;
            for (let _i3308 = 0; _i3308 < _a3307.length; _i3308++) {
              const v_a = _a3307[_i3308];
              const _a3309 = sp.adj8[v_a];
              for (let _i3310 = 0; _i3310 < _a3309.length; _i3310++) {
                const v_d = _a3309[_i3310];
                if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                const _t3311 = v_d;
                if (_g3300.length < 16) { if (!_g3300.includes(_t3311)) _g3300.push(_t3311); } else addOnce(_g3300, _st3306, _t3311);
              }
            }
          }
          const _t3312 = union(_g3294, _g3300);
          const _h3472 = union(v_S, _t3312);
          let _q3313 = false;
          Q3314: {
            const _a3315 = v_S;
            for (let _i3316 = 0; _i3316 < _a3315.length; _i3316++) {
              const v_a = _a3315[_i3316];
              const _a3317 = sp.adj8[v_a];
              for (let _i3318 = 0; _i3318 < _a3317.length; _i3318++) {
                const v_b = _a3317[_i3318];
                if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                  _q3313 = true;
                  break Q3314;
                }
              }
            }
          }
          let _c3347: boolean = _q3313;
          if (!_c3347) {
            let _q3319 = false;
            Q3320: {
              _g3321.length = 0;
              _st3328.pass++;
              G3322: {
                const _a3329 = union(v_S, _t3312);
                for (let _i3330 = 0; _i3330 < _a3329.length; _i3330++) {
                  const v_a = _a3329[_i3330];
                  const _t3331 = sp.rowOf[v_a];
                  const _t3332 = sp.colOf[v_a];
                  for (let _i3333 = 0; _i3333 < 2; _i3333++) {
                    const v_M = _i3333 === 0 ? _t3331 : _t3332;
                    if (_i3333 === 1 && (v_M === _t3331)) continue;
                    const _t3334 = v_M;
                    if (_g3321.length < 16) { if (!_g3321.includes(_t3334)) _g3321.push(_t3334); } else addOnce(_g3321, _st3328, _t3334);
                  }
                }
              }
              const _a3335 = _g3321;
              for (let _i3336 = 0; _i3336 < _a3335.length; _i3336++) {
                const v_L = _a3335[_i3336];
                L3337: {
                  const v_v = numMarked(b, sp, cl, cands, v_L);
                  if (!((v_v >= 0))) break L3337;
                  let _g3338 = 0;
                  G3339: {
                    const _a3340 = sp.lineCells[v_L];
                    for (let _i3341 = 0; _i3341 < _a3340.length; _i3341++) {
                      const v_x = _a3340[_i3341];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g3338++;
                    }
                  }
                  let _c3346: boolean = (_g3338 > v_v);
                  if (!_c3346) {
                    let _g3342 = 0;
                    G3343: {
                      const _a3344 = sp.lineCells[v_L];
                      for (let _i3345 = 0; _i3345 < _a3344.length; _i3345++) {
                        const v_x = _a3344[_i3345];
                        if (!((!(_t3312.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                        _g3342++;
                      }
                    }
                    _c3346 = (_g3342 < v_v);
                  }
                  if (_c3346) {
                    _q3319 = true;
                    break Q3320;
                  }
                }
              }
            }
            _c3347 = _q3319;
          }
          let _c3354: boolean = _c3347;
          if (!_c3354) {
            let _g3348 = 0;
            G3349: {
              const _a3350 = sp.cells;
              for (let _i3351 = 0; _i3351 < _a3350.length; _i3351++) {
                const v_x = _a3350[_i3351];
                if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                _g3348++;
              }
            }
            let _g3352 = 0;
            G3353: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3352 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3354 = (_g3348 > _g3352);
          }
          let _c3361: boolean = _c3354;
          if (!_c3361) {
            let _g3355 = 0;
            G3356: {
              const _a3357 = sp.cells;
              for (let _i3358 = 0; _i3358 < _a3357.length; _i3358++) {
                const v_x = _a3357[_i3358];
                if (!((!(_t3312.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                _g3355++;
              }
            }
            let _g3359 = 0;
            G3360: {
              for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                _g3359 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
              }
            }
            _c3361 = (_g3355 < _g3359);
          }
          let _c3375: boolean = _c3361;
          if (!_c3375) {
            let _q3362 = false;
            Q3363: {
              const _a3364 = v_S;
              for (let _i3365 = 0; _i3365 < _a3364.length; _i3365++) {
                const v_a = _a3364[_i3365];
                const _t3366 = sp.rowOf[v_a];
                const _t3367 = sp.colOf[v_a];
                for (let _i3368 = 0; _i3368 < 2; _i3368++) {
                  const v_L = _i3368 === 0 ? _t3366 : _t3367;
                  if (_i3368 === 1 && (v_L === _t3366)) continue;
                  _g3369.length = 0;
                  G3370: {
                    const _a3373 = sp.lineCells[v_L];
                    for (let _i3374 = 0; _i3374 < _a3373.length; _i3374++) {
                      const v_x = _a3373[_i3374];
                      if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                      _g3369.push(v_x);
                    }
                  }
                  if ((stretch(sp.lineCells[v_L], v_a, _g3369).length > v_T)) {
                    _q3362 = true;
                    break Q3363;
                  }
                }
              }
            }
            _c3375 = _q3362;
          }
          let _c3563: boolean = _c3375;
          if (!_c3563) {
            let _q3376 = false;
            Q3377: {
              for (let v_m = 1; v_m <= v_T; v_m++) {
                _g3378.length = 0;
                _st3464.pass++;
                G3379: {
                  _g3465.length = 0;
                  _st3471.pass++;
                  G3466: {
                    const _a3473 = _h3472;
                    for (let _i3474 = 0; _i3474 < _a3473.length; _i3474++) {
                      const v_x = _a3473[_i3474];
                      const _a3475 = union(setOf(v_x), sp.adj4[v_x]);
                      for (let _i3476 = 0; _i3476 < _a3475.length; _i3476++) {
                        const v_y = _a3475[_i3476];
                        const _t3477 = v_y;
                        if (_g3465.length < 16) { if (!_g3465.includes(_t3477)) _g3465.push(_t3477); } else addOnce(_g3465, _st3471, _t3477);
                      }
                    }
                  }
                  const _a3478 = _g3465;
                  for (let _i3479 = 0; _i3479 < _a3478.length; _i3479++) {
                    const v_a = _a3478[_i3479];
                    if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                    const _t3480 = sp.rowOf[v_a];
                    const _t3481 = sp.colOf[v_a];
                    for (let _i3482 = 0; _i3482 < 2; _i3482++) {
                      const v_L = _i3482 === 0 ? _t3480 : _t3481;
                      if (_i3482 === 1 && (v_L === _t3480)) continue;
                      _g3483.length = 0;
                      G3484: {
                        const _a3487 = sp.lineCells[v_L];
                        for (let _i3488 = 0; _i3488 < _a3487.length; _i3488++) {
                          const v_x = _a3487[_i3488];
                          if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                          _g3483.push(v_x);
                        }
                      }
                      L3489: {
                        const v_G = stretch(sp.lineCells[v_L], v_a, _g3483);
                        const _h3490 = v_G.length;
                        const _h3521 = (_h3490 === 1);
                        let _c3524: boolean = (_h3490 === v_m);
                        if (_c3524) {
                          let _q3491 = true;
                          Q3492: {
                            _g3493.length = 0;
                            G3494: {
                              _g3507.length = 0;
                              _st3513.pass++;
                              G3508: {
                                const _a3514 = v_G;
                                for (let _i3515 = 0; _i3515 < _a3514.length; _i3515++) {
                                  const v_g = _a3514[_i3515];
                                  const _a3516 = sp.adj4[v_g];
                                  for (let _i3517 = 0; _i3517 < _a3516.length; _i3517++) {
                                    const v_z = _a3516[_i3517];
                                    const _t3518 = v_z;
                                    if (_g3507.length < 16) { if (!_g3507.includes(_t3518)) _g3507.push(_t3518); } else addOnce(_g3507, _st3513, _t3518);
                                  }
                                }
                              }
                              const _a3519 = _g3507;
                              for (let _i3520 = 0; _i3520 < _a3519.length; _i3520++) {
                                const v_y = _a3519[_i3520];
                                if (!((!(v_G.includes(v_y)) && (_h3521 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3493.push(v_y);
                              }
                            }
                            const _a3522 = _g3493;
                            for (let _i3523 = 0; _i3523 < _a3522.length; _i3523++) {
                              const v_y = _a3522[_i3523];
                              if (!(((_t3312.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                _q3491 = false;
                                break Q3492;
                              }
                            }
                          }
                          _c3524 = _q3491;
                        }
                        let _c3557: boolean = _c3524;
                        if (_c3557) {
                          let _q3525 = false;
                          Q3526: {
                            _g3527.length = 0;
                            G3528: {
                              _g3541.length = 0;
                              _st3547.pass++;
                              G3542: {
                                const _a3548 = v_G;
                                for (let _i3549 = 0; _i3549 < _a3548.length; _i3549++) {
                                  const v_g = _a3548[_i3549];
                                  const _a3550 = sp.adj4[v_g];
                                  for (let _i3551 = 0; _i3551 < _a3550.length; _i3551++) {
                                    const v_z = _a3550[_i3551];
                                    const _t3552 = v_z;
                                    if (_g3541.length < 16) { if (!_g3541.includes(_t3552)) _g3541.push(_t3552); } else addOnce(_g3541, _st3547, _t3552);
                                  }
                                }
                              }
                              const _a3553 = _g3541;
                              for (let _i3554 = 0; _i3554 < _a3553.length; _i3554++) {
                                const v_y = _a3553[_i3554];
                                if (!((!(v_G.includes(v_y)) && (_h3521 || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                _g3527.push(v_y);
                              }
                            }
                            const _a3555 = union(v_G, _g3527);
                            for (let _i3556 = 0; _i3556 < _a3555.length; _i3556++) {
                              const v_x = _a3555[_i3556];
                              if (((v_S.includes(v_x)) || (_t3312.includes(v_x)))) {
                                _q3525 = true;
                                break Q3526;
                              }
                            }
                          }
                          _c3557 = _q3525;
                        }
                        if (!(_c3557)) break L3489;
                        const _t3558 = (v_G[0] ?? -1);
                        const _t3559 = _t3558;
                        if (_g3378.length < 16) { if (!_g3378.includes(_t3559)) _g3378.push(_t3559); } else addOnce(_g3378, _st3464, _t3559);
                      }
                    }
                  }
                }
                L3560: {
                  const v_C = _g3378;
                  const _h3561 = v_C.length;
                  if (!((_h3561 > 0))) break L3560;
                  if ((_h3561 > ((_k3562[v_m] ?? boatsOf(sp, cl, v_m)) - done(b, sp, v_m)))) {
                    _q3376 = true;
                    break Q3377;
                  }
                }
              }
            }
            _c3563 = _q3376;
          }
          _c3564 = _c3563;
        }
        if (!(_c3564)) break L3287;
        if (import.meta.env.DEV && staleChecking) {
          let _g3565 = -1;
          G3566: {
            for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
              if (!((cl.fleet.boats[v_k] > 0))) continue;
              const _t3567 = cl.fleet.length[v_k];
              if (_g3565 === -1 || _t3567 > _g3565) _g3565 = _t3567;
            }
          }
          const _g3568: number[] = [];
          G3569: {
            const _a3572 = sp.adj4[v_c];
            for (let _i3573 = 0; _i3573 < _a3572.length; _i3573++) {
              const v_x = _a3572[_i3573];
              if (!((sp.lineCells[v_L].includes(v_x)))) continue;
              _g3568.push(v_x);
            }
          }
          let _c3578: boolean = (v_S.length === 2);
          if (_c3578) {
            let _q3574 = false;
            Q3575: {
              const _a3576 = v_S;
              for (let _i3577 = 0; _i3577 < _a3576.length; _i3577++) {
                const v_x = _a3576[_i3577];
                if (!((b.grid[v_x] !== 0))) {
                  _q3574 = true;
                  break Q3575;
                }
              }
            }
            _c3578 = _q3574;
          }
          let _c3832: boolean = _c3578;
          if (_c3832) {
            const _g3579: number[] = [];
            G3580: {
              const _a3583 = v_S;
              for (let _i3584 = 0; _i3584 < _a3583.length; _i3584++) {
                const v_x = _a3583[_i3584];
                if (!((v_x !== v_x))) continue;
                _g3579.push(v_x);
              }
            }
            const _g3585: number[] = [];
            G3586: {
              const _a3591 = v_S;
              for (let _i3592 = 0; _i3592 < _a3591.length; _i3592++) {
                const v_a = _a3591[_i3592];
                const _a3593 = sp.adj8[v_a];
                for (let _i3594 = 0; _i3594 < _a3593.length; _i3594++) {
                  const v_d = _a3593[_i3594];
                  if (!((!(sp.adj4[v_a].includes(v_d)) && !((b.grid[v_d] !== 0))))) continue;
                  if (!_g3585.includes(v_d)) _g3585.push(v_d);
                }
              }
            }
            const _t3595 = union(_g3579, _g3585);
            let _q3596 = false;
            Q3597: {
              const _a3598 = v_S;
              for (let _i3599 = 0; _i3599 < _a3598.length; _i3599++) {
                const v_a = _a3598[_i3599];
                const _a3600 = sp.adj8[v_a];
                for (let _i3601 = 0; _i3601 < _a3600.length; _i3601++) {
                  const v_b = _a3600[_i3601];
                  if (!(!(sp.adj4[v_a].includes(v_b)))) continue;
                  if (((v_S.includes(v_b)) || ((b.grid[v_b] || -1) === 1))) {
                    _q3596 = true;
                    break Q3597;
                  }
                }
              }
            }
            let _c3628: boolean = _q3596;
            if (!_c3628) {
              let _q3602 = false;
              Q3603: {
                const _g3604: number[] = [];
                G3605: {
                  const _a3611 = union(v_S, _t3595);
                  for (let _i3612 = 0; _i3612 < _a3611.length; _i3612++) {
                    const v_a = _a3611[_i3612];
                    const _t3613 = sp.rowOf[v_a];
                    const _t3614 = sp.colOf[v_a];
                    for (let _i3615 = 0; _i3615 < 2; _i3615++) {
                      const v_M = _i3615 === 0 ? _t3613 : _t3614;
                      if (_i3615 === 1 && (v_M === _t3613)) continue;
                      if (!_g3604.includes(v_M)) _g3604.push(v_M);
                    }
                  }
                }
                const _a3616 = _g3604;
                for (let _i3617 = 0; _i3617 < _a3616.length; _i3617++) {
                  const v_L = _a3616[_i3617];
                  L3618: {
                    const v_v = numMarked(b, sp, cl, cands, v_L);
                    if (!((v_v >= 0))) break L3618;
                    let _g3619 = 0;
                    G3620: {
                      const _a3621 = sp.lineCells[v_L];
                      for (let _i3622 = 0; _i3622 < _a3621.length; _i3622++) {
                        const v_x = _a3621[_i3622];
                        if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g3619++;
                      }
                    }
                    let _c3627: boolean = (_g3619 > v_v);
                    if (!_c3627) {
                      let _g3623 = 0;
                      G3624: {
                        const _a3625 = sp.lineCells[v_L];
                        for (let _i3626 = 0; _i3626 < _a3625.length; _i3626++) {
                          const v_x = _a3625[_i3626];
                          if (!((!(_t3595.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                          _g3623++;
                        }
                      }
                      _c3627 = (_g3623 < v_v);
                    }
                    if (_c3627) {
                      _q3602 = true;
                      break Q3603;
                    }
                  }
                }
              }
              _c3628 = _q3602;
            }
            let _c3635: boolean = _c3628;
            if (!_c3635) {
              let _g3629 = 0;
              G3630: {
                const _a3631 = sp.cells;
                for (let _i3632 = 0; _i3632 < _a3631.length; _i3632++) {
                  const v_x = _a3631[_i3632];
                  if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                  _g3629++;
                }
              }
              let _g3633 = 0;
              G3634: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g3633 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c3635 = (_g3629 > _g3633);
            }
            let _c3642: boolean = _c3635;
            if (!_c3642) {
              let _g3636 = 0;
              G3637: {
                const _a3638 = sp.cells;
                for (let _i3639 = 0; _i3639 < _a3638.length; _i3639++) {
                  const v_x = _a3638[_i3639];
                  if (!((!(_t3595.includes(v_x)) && ((b.grid[v_x] || -1) !== 2)))) continue;
                  _g3636++;
                }
              }
              let _g3640 = 0;
              G3641: {
                for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
                  _g3640 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
                }
              }
              _c3642 = (_g3636 < _g3640);
            }
            let _c3656: boolean = _c3642;
            if (!_c3656) {
              let _q3643 = false;
              Q3644: {
                const _a3645 = v_S;
                for (let _i3646 = 0; _i3646 < _a3645.length; _i3646++) {
                  const v_a = _a3645[_i3646];
                  const _t3647 = sp.rowOf[v_a];
                  const _t3648 = sp.colOf[v_a];
                  for (let _i3649 = 0; _i3649 < 2; _i3649++) {
                    const v_L = _i3649 === 0 ? _t3647 : _t3648;
                    if (_i3649 === 1 && (v_L === _t3647)) continue;
                    const _g3650: number[] = [];
                    G3651: {
                      const _a3654 = sp.lineCells[v_L];
                      for (let _i3655 = 0; _i3655 < _a3654.length; _i3655++) {
                        const v_x = _a3654[_i3655];
                        if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                        _g3650.push(v_x);
                      }
                    }
                    if ((stretch(sp.lineCells[v_L], v_a, _g3650).length > v_T)) {
                      _q3643 = true;
                      break Q3644;
                    }
                  }
                }
              }
              _c3656 = _q3643;
            }
            let _c3831: boolean = _c3656;
            if (!_c3831) {
              let _q3657 = false;
              Q3658: {
                for (let v_m = 1; v_m <= v_T; v_m++) {
                  const _g3659: number[] = [];
                  G3660: {
                    const _g3745: number[] = [];
                    G3746: {
                      const _a3751 = union(v_S, _t3595);
                      for (let _i3752 = 0; _i3752 < _a3751.length; _i3752++) {
                        const v_x = _a3751[_i3752];
                        const _a3753 = union(setOf(v_x), sp.adj4[v_x]);
                        for (let _i3754 = 0; _i3754 < _a3753.length; _i3754++) {
                          const v_y = _a3753[_i3754];
                          if (!_g3745.includes(v_y)) _g3745.push(v_y);
                        }
                      }
                    }
                    const _a3755 = _g3745;
                    for (let _i3756 = 0; _i3756 < _a3755.length; _i3756++) {
                      const v_a = _a3755[_i3756];
                      if (!(((v_S.includes(v_a)) || ((b.grid[v_a] || -1) === 1)))) continue;
                      const _t3757 = sp.rowOf[v_a];
                      const _t3758 = sp.colOf[v_a];
                      for (let _i3759 = 0; _i3759 < 2; _i3759++) {
                        const v_L = _i3759 === 0 ? _t3757 : _t3758;
                        if (_i3759 === 1 && (v_L === _t3757)) continue;
                        const _g3760: number[] = [];
                        G3761: {
                          const _a3764 = sp.lineCells[v_L];
                          for (let _i3765 = 0; _i3765 < _a3764.length; _i3765++) {
                            const v_x = _a3764[_i3765];
                            if (!(((v_S.includes(v_x)) || ((b.grid[v_x] || -1) === 1)))) continue;
                            _g3760.push(v_x);
                          }
                        }
                        L3766: {
                          const v_G = stretch(sp.lineCells[v_L], v_a, _g3760);
                          let _c3797: boolean = (v_G.length === v_m);
                          if (_c3797) {
                            let _q3767 = true;
                            Q3768: {
                              const _g3769: number[] = [];
                              G3770: {
                                const _g3783: number[] = [];
                                G3784: {
                                  const _a3789 = v_G;
                                  for (let _i3790 = 0; _i3790 < _a3789.length; _i3790++) {
                                    const v_g = _a3789[_i3790];
                                    const _a3791 = sp.adj4[v_g];
                                    for (let _i3792 = 0; _i3792 < _a3791.length; _i3792++) {
                                      const v_z = _a3791[_i3792];
                                      if (!_g3783.includes(v_z)) _g3783.push(v_z);
                                    }
                                  }
                                }
                                const _a3793 = _g3783;
                                for (let _i3794 = 0; _i3794 < _a3793.length; _i3794++) {
                                  const v_y = _a3793[_i3794];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g3769.push(v_y);
                                }
                              }
                              const _a3795 = _g3769;
                              for (let _i3796 = 0; _i3796 < _a3795.length; _i3796++) {
                                const v_y = _a3795[_i3796];
                                if (!(((_t3595.includes(v_y)) || ((b.grid[v_y] || -1) === 2)))) {
                                  _q3767 = false;
                                  break Q3768;
                                }
                              }
                            }
                            _c3797 = _q3767;
                          }
                          let _c3828: boolean = _c3797;
                          if (_c3828) {
                            let _q3798 = false;
                            Q3799: {
                              const _g3800: number[] = [];
                              G3801: {
                                const _g3814: number[] = [];
                                G3815: {
                                  const _a3820 = v_G;
                                  for (let _i3821 = 0; _i3821 < _a3820.length; _i3821++) {
                                    const v_g = _a3820[_i3821];
                                    const _a3822 = sp.adj4[v_g];
                                    for (let _i3823 = 0; _i3823 < _a3822.length; _i3823++) {
                                      const v_z = _a3822[_i3823];
                                      if (!_g3814.includes(v_z)) _g3814.push(v_z);
                                    }
                                  }
                                }
                                const _a3824 = _g3814;
                                for (let _i3825 = 0; _i3825 < _a3824.length; _i3825++) {
                                  const v_y = _a3824[_i3825];
                                  if (!((!(v_G.includes(v_y)) && ((v_G.length === 1) || (sp.lineCells[v_L].includes(v_y)))))) continue;
                                  _g3800.push(v_y);
                                }
                              }
                              const _a3826 = union(v_G, _g3800);
                              for (let _i3827 = 0; _i3827 < _a3826.length; _i3827++) {
                                const v_x = _a3826[_i3827];
                                if (((v_S.includes(v_x)) || (_t3595.includes(v_x)))) {
                                  _q3798 = true;
                                  break Q3799;
                                }
                              }
                            }
                            _c3828 = _q3798;
                          }
                          if (!(_c3828)) break L3766;
                          const _t3829 = (v_G[0] ?? -1);
                          if (!_g3659.includes(_t3829)) _g3659.push(_t3829);
                        }
                      }
                    }
                  }
                  L3830: {
                    const v_C = _g3659;
                    if (!((v_C.length > 0))) break L3830;
                    if ((v_C.length > (boatsOf(sp, cl, v_m) - done(b, sp, v_m)))) {
                      _q3657 = true;
                      break Q3658;
                    }
                  }
                }
              }
              _c3831 = _q3657;
            }
            _c3832 = _c3831;
          }
          freshBinding("centerTrial", [(v_T === _g3565), (sp.cells.includes(v_c)), (clueAt(cl.seg, v_c) === 6), ((v_L === sp.rowOf[v_c]) || (v_L === sp.colOf[v_c])), sameSet(v_S, _g3568), _c3832], ["T =", "c in", "where of c", "L in", "S =", "where of S"]);
        }
        facts.length = 0;
        changed = false;
        let _q3833 = true;
        Q3834: {
          const _a3835 = v_S;
          for (let _i3836 = 0; _i3836 < _a3835.length; _i3836++) {
            const v_x = _a3835[_i3836];
            if (!(b.grid[v_x] !== 0)) { if (fire === null) { b.placeAt(v_x, 2); changed = true; } else facts.push(PLACE, v_x, 2); }
            if (!(true)) {
              _q3833 = false;
              break Q3834;
            }
          }
        }
        if (!(_q3833)) return -1;
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
  let _q260 = true;
  Q261: {
    const _t262 = sp.rowOf[v_c];
    const _g263: number[] = [];
    G264: {
      const _a267 = sp.lineCells[_t262];
      for (let _i268 = 0; _i268 < _a267.length; _i268++) {
        const v_x = _a267[_i268];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g263.push(v_x);
      }
    }
    const _t269 = sp.colOf[v_c];
    const _g270: number[] = [];
    G271: {
      const _a274 = sp.lineCells[_t269];
      for (let _i275 = 0; _i275 < _a274.length; _i275++) {
        const v_x = _a274[_i275];
        if (!(((b.grid[v_x] || -1) === 1))) continue;
        _g270.push(v_x);
      }
    }
    const v_G = union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g263), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g270));
    const _a276 = v_G;
    for (let _i277 = 0; _i277 < _a276.length; _i277++) {
      const v_x = _a276[_i277];
      const _a278 = sp.adj4[v_x];
      for (let _i279 = 0; _i279 < _a278.length; _i279++) {
        const v_y = _a278[_i279];
        let _c287: boolean = !(v_G.includes(v_y));
        if (_c287) {
          const _t280 = sp.rowOf[v_c];
          const _g281: number[] = [];
          G282: {
            const _a285 = sp.lineCells[_t280];
            for (let _i286 = 0; _i286 < _a285.length; _i286++) {
              const v_x = _a285[_i286];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g281.push(v_x);
            }
          }
          _c287 = ((stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g281).length === 1) || (sp.lineCells[sp.rowOf[v_c]].includes(v_y)));
        }
        let _c295: boolean = _c287;
        if (_c295) {
          const _t288 = sp.colOf[v_c];
          const _g289: number[] = [];
          G290: {
            const _a293 = sp.lineCells[_t288];
            for (let _i294 = 0; _i294 < _a293.length; _i294++) {
              const v_x = _a293[_i294];
              if (!(((b.grid[v_x] || -1) === 1))) continue;
              _g289.push(v_x);
            }
          }
          _c295 = ((stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g289).length === 1) || (sp.lineCells[sp.colOf[v_c]].includes(v_y)));
        }
        if (!(_c295)) continue;
        if (!(((b.grid[v_y] || -1) === 2))) {
          _q260 = false;
          break Q261;
        }
      }
    }
  }
  const _made = _q260;
  _kept[v_c] = _made;
  return _made;
}

const doneKept = keptStore<number>();

/** `done(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function done(b: Marks, sp: GridSpace, v_m: number): number {
  const _kept: Kept<number> = doneKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g237 = 0;
  G238: {
    const _a239 = cellsValued(b, sp.cells, 1);
    for (let _i240 = 0; _i240 < _a239.length; _i240++) {
      const v_c = _a239[_i240];
      let _c242: boolean = ((b.grid[v_c] || -1) === 1);
      if (_c242) {
        const _t241 = step(sp, v_c, 1);
        _c242 = !(((_t241 !== -1) && ((b.grid[_t241] || -1) === 1)));
      }
      let _c244: boolean = _c242;
      if (_c244) {
        const _t243 = step(sp, v_c, 3);
        _c244 = !(((_t243 !== -1) && ((b.grid[_t243] || -1) === 1)));
      }
      let _c259: boolean = _c244;
      if (_c259) {
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
        const _t252 = sp.colOf[v_c];
        const _g253: number[] = [];
        G254: {
          const _a257 = sp.lineCells[_t252];
          for (let _i258 = 0; _i258 < _a257.length; _i258++) {
            const v_x = _a257[_i258];
            if (!(((b.grid[v_x] || -1) === 1))) continue;
            _g253.push(v_x);
          }
        }
        _c259 = (union(stretch(sp.lineCells[sp.rowOf[v_c]], v_c, _g246), stretch(sp.lineCells[sp.colOf[v_c]], v_c, _g253)).length === v_m);
      }
      if (!((_c259 && closed(b, sp, v_c)))) continue;
      _g237++;
    }
  }
  const _made = _g237;
  _kept[v_m] = _made;
  return _made;
}

const fullKept = keptStore<boolean>();

/** `full(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function full(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = fullKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q235 = true;
  Q236: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      if (!((cl.fleet.boats[v_k] <= done(b, sp, v_m)))) {
        _q235 = false;
        break Q236;
      }
    }
  }
  const _made = _q235;
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
  let _g532 = 0;
  G533: {
    for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
      if (!((cl.fleet.length[v_k] === v_m))) continue;
      _g532 += cl.fleet.boats[v_k];
    }
  }
  const _made = _g532;
  _kept[v_m] = _made;
  return _made;
}

const takingKept = keptStore<number>();

/** `taking(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function taking(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): number {
  const _kept: Kept<number> = takingKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _g535 = 0;
  G536: {
    const _a537 = sp.lines;
    for (let _i538 = 0; _i538 < _a537.length; _i538++) {
      const v_K = _a537[_i538];
      const _a539 = sp.lineCells[v_K];
      for (let _i540 = 0; _i540 < _a539.length; _i540++) {
        const v_d = _a539[_i540];
        let _c545: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c545) {
          let _q541 = false;
          Q542: {
            const _a543 = sp.adj4[v_d];
            for (let _i544 = 0; _i544 < _a543.length; _i544++) {
              const v_p = _a543[_i544];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q541 = true;
                break Q542;
              }
            }
          }
          _c545 = !(_q541);
        }
        let _c568: boolean = _c545;
        if (_c568) {
          const _g546: number[] = [];
          G547: {
            const _a550 = sp.lineCells[v_K];
            for (let _i551 = 0; _i551 < _a550.length; _i551++) {
              const v_x = _a550[_i551];
              if (!(((b.grid[v_x] || -1) !== 2))) continue;
              _g546.push(v_x);
            }
          }
          const _t552 = stretch(sp.lineCells[v_K], v_d, _g546);
          let _g553 = 0;
          G554: {
            const _a555 = _t552;
            for (let _i556 = 0; _i556 < _a555.length; _i556++) {
              const v_c = _a555[_i556];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g553++;
            }
          }
          let _c567: boolean = ((_g553 < _t552.length) && (_t552.length >= v_m));
          if (_c567) {
            let _c566: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c566) {
              const _t557 = sp.lineCells[v_K];
              let _g558 = 0;
              G559: {
                const _a560 = _t557;
                for (let _i561 = 0; _i561 < _a560.length; _i561++) {
                  const v_c = _a560[_i561];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g558++;
                }
              }
              let _g562 = 0;
              G563: {
                const _a564 = _t552;
                for (let _i565 = 0; _i565 < _a564.length; _i565++) {
                  const v_c = _a564[_i565];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g562++;
                }
              }
              _c566 = (((clueAt(cl.n, v_K) - _g558) + _g562) >= v_m);
            }
            _c567 = _c566;
          }
          _c568 = _c567;
        }
        if (!(_c568)) continue;
        _g535++;
      }
    }
  }
  const _made = _g535;
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
  const _g859: number[] = [];
  G860: {
    const _a863 = sp.lines;
    for (let _i864 = 0; _i864 < _a863.length; _i864++) {
      const v_M = _a863[_i864];
      if (!(((v_M !== v_L) && ((((sp.lineCells[v_M][0] ?? -1) % sp.w) === ((sp.lineCells[v_M][1] ?? -1) % sp.w)) === (((sp.lineCells[v_L][0] ?? -1) % sp.w) === ((sp.lineCells[v_L][1] ?? -1) % sp.w)))))) continue;
      _g859.push(v_M);
    }
  }
  const _made = _g859;
  _kept[v_L] = _made;
  return _made;
}

const recKept = keptStore<number>();

/** `rec(L)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function rec(b: Marks, sp: GridSpace, cl: Dealt, v_L: number): number {
  const _kept: Kept<number> = recKept.marks(b);
  if (_kept[v_L] !== undefined) return _kept[v_L];
  let _g854 = -1;
  G855: {
    for (let _i856 = 0; _i856 < 1; _i856++) {
      const v_K = v_L;
      let _c875: boolean = (clueAt(cl.n, v_K) < 0);
      if (_c875) {
        let _q857 = true;
        Q858: {
          const _a865 = par(sp, v_K);
          for (let _i866 = 0; _i866 < _a865.length; _i866++) {
            const v_M = _a865[_i866];
            let _c874: boolean = (clueAt(cl.n, v_M) >= 0);
            if (!_c874) {
              const _t867 = sp.lineCells[v_M];
              const _g868: number[] = [];
              G869: {
                const _a872 = _t867;
                for (let _i873 = 0; _i873 < _a872.length; _i873++) {
                  const v_c = _a872[_i873];
                  if (!(!((b.grid[v_c] !== 0)))) continue;
                  _g868.push(v_c);
                }
              }
              _c874 = (_g868.length === 0);
            }
            if (!(_c874)) {
              _q857 = false;
              break Q858;
            }
          }
        }
        _c875 = _q857;
      }
      if (!(_c875)) continue;
      let _g876 = 0;
      G877: {
        for (let v_k = 0; v_k < cl.fleet.n; v_k++) {
          _g876 += (cl.fleet.length[v_k] * cl.fleet.boats[v_k]);
        }
      }
      let _g878 = 0;
      G879: {
        const _a880 = par(sp, v_K);
        for (let _i881 = 0; _i881 < _a880.length; _i881++) {
          const v_M = _a880[_i881];
          if (!((clueAt(cl.n, v_M) >= 0))) continue;
          _g878 += clueAt(cl.n, v_M);
        }
      }
      let _g882 = 0;
      G883: {
        const _a884 = par(sp, v_K);
        for (let _i885 = 0; _i885 < _a884.length; _i885++) {
          const v_M = _a884[_i885];
          if (!((clueAt(cl.n, v_M) < 0))) continue;
          const _t886 = sp.lineCells[v_M];
          let _g887 = 0;
          G888: {
            const _a889 = _t886;
            for (let _i890 = 0; _i890 < _a889.length; _i890++) {
              const v_c = _a889[_i890];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g887++;
            }
          }
          _g882 += _g887;
        }
      }
      const _t891 = ((_g876 - _g878) - _g882);
      if (_g854 === -1 || _t891 > _g854) _g854 = _t891;
    }
  }
  const _made = _g854;
  _kept[v_L] = _made;
  return _made;
}

const wideKept = keptStore<boolean>();

/** `wide(m)` as the description defines it, kept for the
 * marks while no value is placed in them. */
export function wide(b: Marks, sp: GridSpace, cl: Dealt, v_m: number): boolean {
  const _kept: Kept<boolean> = wideKept.marks(b);
  if (_kept[v_m] !== undefined) return _kept[v_m];
  let _q988 = false;
  Q989: {
    const _a990 = sp.lines;
    for (let _i991 = 0; _i991 < _a990.length; _i991++) {
      const v_K = _a990[_i991];
      const _a992 = sp.lineCells[v_K];
      for (let _i993 = 0; _i993 < _a992.length; _i993++) {
        const v_d = _a992[_i993];
        let _c998: boolean = ((b.grid[v_d] || -1) !== 2);
        if (_c998) {
          let _q994 = false;
          Q995: {
            const _a996 = sp.adj4[v_d];
            for (let _i997 = 0; _i997 < _a996.length; _i997++) {
              const v_p = _a996[_i997];
              if (!(((sp.lineCells[v_K].includes(v_p)) && (((v_p % sp.w) + ((v_p / sp.w) | 0)) < ((v_d % sp.w) + ((v_d / sp.w) | 0)))))) continue;
              if (((b.grid[v_p] || -1) !== 2)) {
                _q994 = true;
                break Q995;
              }
            }
          }
          _c998 = !(_q994);
        }
        if (!(_c998)) continue;
        const _g999: number[] = [];
        G1000: {
          const _a1003 = sp.lineCells[v_K];
          for (let _i1004 = 0; _i1004 < _a1003.length; _i1004++) {
            const v_x = _a1003[_i1004];
            if (!(((b.grid[v_x] || -1) !== 2))) continue;
            _g999.push(v_x);
          }
        }
        L1005: {
          const v_R = stretch(sp.lineCells[v_K], v_d, _g999);
          let _g1006 = 0;
          G1007: {
            const _a1008 = v_R;
            for (let _i1009 = 0; _i1009 < _a1008.length; _i1009++) {
              const v_c = _a1008[_i1009];
              if (!(((b.grid[v_c] || -1) === 1))) continue;
              _g1006++;
            }
          }
          let _c1020: boolean = ((_g1006 < v_R.length) && (v_R.length >= v_m));
          if (_c1020) {
            let _c1019: boolean = (clueAt(cl.n, v_K) < 0);
            if (!_c1019) {
              const _t1010 = sp.lineCells[v_K];
              let _g1011 = 0;
              G1012: {
                const _a1013 = _t1010;
                for (let _i1014 = 0; _i1014 < _a1013.length; _i1014++) {
                  const v_c = _a1013[_i1014];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1011++;
                }
              }
              let _g1015 = 0;
              G1016: {
                const _a1017 = v_R;
                for (let _i1018 = 0; _i1018 < _a1017.length; _i1018++) {
                  const v_c = _a1017[_i1018];
                  if (!(((b.grid[v_c] || -1) === 1))) continue;
                  _g1015++;
                }
              }
              _c1019 = (((clueAt(cl.n, v_K) - _g1011) + _g1015) >= v_m);
            }
            _c1020 = _c1019;
          }
          if (!(_c1020)) break L1005;
          if ((v_R.length >= ((2 * v_m) + 1))) {
            _q988 = true;
            break Q989;
          }
        }
      }
    }
  }
  const _made = _q988;
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
  let _g1127 = -1;
  let _n1129 = 0;
  G1128: {
    const _t1130 = sp.rowOf[v_c];
    const _t1131 = sp.colOf[v_c];
    for (let _i1132 = 0; _i1132 < 2; _i1132++) {
      const v_M = _i1132 === 0 ? _t1130 : _t1131;
      if (_i1132 === 1 && (v_M === _t1130)) continue;
      if (!((v_M !== v_L))) continue;
      if (++_n1129 === 2) {
        _g1127 = -1;
        break G1128;
      }
      _g1127 = v_M;
    }
  }
  const _made = _g1127;
  _kept1[v_c] = _made;
  return _made;
}
