/**
 * The Latin library and the Latin-square generator: the library's techniques
 * (`latin.description.yaml`: singles, set elimination, the fish and the wing)
 * as the rungs a described game places them with, the reasons they give a
 * hint, and upstream `latin.c`'s generator with `matching.c`.
 *
 * A Latin game is its description: the fill engine (`engine/fill/`) solves
 * it, pairing the description's `use` of a library technique with its rung
 * here ({@link LATIN_LIBRARY}). The techniques read each value's multiplicity
 * (`times(d)`) off the engine's marks, so a pseudo-Latin board, whose one
 * repeated symbol appears a stated number of times a line (Salad's empty
 * square), runs the same rungs.
 */

import * as compiled from "../../generated/engine/solve/latin.compiled.ts";
import { shuffle } from "../board/shuffle.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { DupReason, PlaceRung } from "./cell-marks.ts";
import { valuesOf } from "./describe-runtime.ts";
import {
  type Library,
  type Rung,
  uncluedPlacingRung,
  uncluedRung,
} from "./ladder-runtime.ts";

/** Why a *generic* Latin deduction forced a candidate change — the premise a
 * hint narrates. A game's own reasons sit beside these in its reason union;
 * the discriminating `kind` fields never collide with these. Used on the hint
 * path only. */
export type LatinReason =
  /** A cell's last remaining candidate, so it must take that height. */
  | { kind: "single" }
  /** Height `n` was just placed at `(px, py)`, which rules it out of the rest
   * of that row and column. */
  | DupReason
  | LatinSetReason
  | LatinWingReason;

/** A wing (`wing.ts`): whichever value the middle cell `m` takes, one of the
 * ends `E`, or where `self` the middle itself, is `n`, and the struck cell `t`
 * shares a line with each. `said` is what the library's `says` states of the
 * firing, its cells numbered on a board `w` wide; the words outline the
 * middle and the ends, which are every cell it reads. */
export interface LatinWingReason {
  kind: "wing";
  n: number;
  said: compiled.WingSays["terms"];
  w: number;
}

/** A set elimination. A naked or hidden set within one unit: `said` is what
 * the library's `says` states of the firing, its cells `S` numbered on a board
 * `w` wide, the ones whose candidates account for the struck values between
 * them. One value confined across lines is `cells`, the ones of the lines
 * it can still take, and the `lines`. */
export type LatinSetReason =
  | { kind: "set"; said: compiled.SetSays["terms"]; wording: number; w: number }
  | {
      kind: "set";
      cells: readonly { x: number; y: number }[];
      lines: ConfinedLines;
    };

/** The parallel lines one value is confined in, where a set is that and not a
 * set within one line: `count` whole rows or columns, whose `cells` are every
 * cell of them. The set's own `cells` are the ones of these the value can
 * still take, and the deduction reads the rest too, where it is absent, so a
 * hint stripes them all. */
export interface ConfinedLines {
  axis: "row" | "col";
  count: number;
  cells: readonly { x: number; y: number }[];
}

/** `indices` of the board's rows or columns, as {@link ConfinedLines}. */
function confinedLines(
  axis: "row" | "col",
  indices: readonly number[],
  o: number,
): ConfinedLines {
  const cells = indices.flatMap((at) =>
    Array.from({ length: o }, (_, k) =>
      axis === "row" ? { x: k, y: at } : { x: at, y: k },
    ),
  );
  return { axis, count: indices.length, cells };
}

const cellAt = (w: number) => (c: number) => ({ x: c % w, y: (c / w) | 0 });

/** The library's techniques (`latin.description.yaml`) as rungs, by the id a
 * description places them with. */
export const LATIN_RUNGS = {
  "latin.hiddenSingle": uncluedRung(
    compiled.hiddenSingle,
    (): LatinReason => ({ kind: "single" }),
  ),
  "latin.single": uncluedRung(compiled.single, (): LatinReason => ({ kind: "single" })),
  "latin.set": uncluedRung(
    compiled.set,
    (_b, _c, _n, m, { terms, wording }): LatinReason => ({
      kind: "set",
      said: terms,
      wording,
      w: m.sp.w,
    }),
  ),
  "latin.fish": uncluedRung(
    compiled.fish,
    (_b, _c, _n, m, says): LatinReason => fishReason(says, m.sp.w),
  ),
  "latin.wing": uncluedRung(
    compiled.wing,
    (_b, _c, _n, m, { terms }): LatinReason => ({
      kind: "wing",
      n: terms.x,
      said: terms,
      w: m.sp.w,
    }),
  ),
} satisfies Record<string, Rung>;

/** The library's `placed`, run as each value is placed on a Latin square. */
const LATIN_PLACED: PlaceRung = uncluedPlacingRung(compiled.placed);

/** The Latin library, as the engine pairs it for every game that places
 * it. */
export const LATIN_LIBRARY: Library = {
  rungs: LATIN_RUNGS,
  placing: { "latin.placed": LATIN_PLACED },
};

/** A fish as a set confined across lines, in the view its `says` names: the
 * columns, whose elements follow the `o` rows in a Latin space, or the rows,
 * a set of indices. */
function fishReason({ arm, terms }: compiled.FishSays, o: number): LatinReason {
  const lines =
    arm === "cols"
      ? confinedLines(
          "col",
          terms.lines.map((L) => L - o),
          o,
        )
      : confinedLines("row", valuesOf(terms.lines), o);
  return { kind: "set", cells: terms.places.map(cellAt(o)), lines };
}

// --- generator (matching.c / latin.c) --------------------------------------

/**
 * Maximum bipartite matching (Hopcroft–Karp) between `nl` left and `nr`
 * right vertices. `adjlists[L]` lists L's neighbors (mutated in place by the
 * randomizing DFS, exactly as upstream). Returns the L→R assignment array
 * (`-1` = unmatched), upstream's `outl`; invert it for an R→L assignment.
 *
 * With `rs`, the matching is chosen at random among the maximum ones
 * (generation), by upstream's two draws: `shuffle(Lorder)` per BFS pass and
 * the in-place `random_upto` adjacency swap during the DFS. Without it the run is
 * deterministic; a matching's *cardinality* does not depend on the choice, so
 * that mode is upstream's `rs = NULL` existence check (Tents' completion check).
 */
export function matching(
  nl: number,
  nr: number,
  adjlists: number[][],
  adjsizes: number[],
  rs?: RandomState,
): Int32Array {
  const LtoR = new Int32Array(nl).fill(-1);
  const RtoL = new Int32Array(nr).fill(-1);
  const Llayer = new Int32Array(nl);
  const Rlayer = new Int32Array(nr);
  const Lqueue = new Int32Array(nl);
  const Rqueue = new Int32Array(nr);
  const nmin = Math.min(nl, nr);
  const augpath = new Int32Array(2 * nmin);
  const dfsstate = new Int32Array(nmin + 1);
  const Lorder = new Int32Array(nl);

  outer: while (true) {
    Llayer.fill(-1);
    Rlayer.fill(-1);

    let Lqs = 0;
    for (let L = 0; L < nl; L++) {
      if (LtoR[L] === -1) {
        Llayer[L] = 0;
        Lqueue[Lqs++] = L;
      }
    }

    let layer = 0;
    let targetLayer = -1;
    while (true) {
      let foundFreeR = false;
      let Rqs = 0;
      for (let q = 0; q < Lqs; q++) {
        const L = Lqueue[q];
        for (let j = 0; j < adjsizes[L]; j++) {
          const R = adjlists[L][j];
          if (R !== LtoR[L] && Rlayer[R] === -1) {
            Rlayer[R] = layer + 1;
            Rqueue[Rqs++] = R;
            if (RtoL[R] === -1) foundFreeR = true;
          }
        }
      }
      layer++;

      if (foundFreeR) {
        targetLayer = layer;
        break;
      }
      if (Rqs === 0) break outer;

      Lqs = 0;
      for (let q = 0; q < Rqs; q++) {
        const R = Rqueue[q];
        const L = RtoL[R];
        if (L !== -1 && Llayer[L] === -1) {
          Llayer[L] = layer + 1;
          Lqueue[Lqs++] = L;
        }
      }
      layer++;

      if (Lqs === 0) break outer;
    }

    for (let R = 0; R < nr; R++) {
      if (Rlayer[R] === targetLayer && RtoL[R] !== -1) Rlayer[R] = -1;
    }

    for (let L = 0; L < nl; L++) Lorder[L] = L;
    if (rs) shuffle(Lorder as unknown as number[], rs);

    dfsstate[0] = 0;
    let i = 0;
    while (true) {
      let L: number;
      if (i === 0) {
        if (dfsstate[0] === nl) break;
        L = Lorder[dfsstate[0]++];
        if (Llayer[L] !== 0) continue;
      } else {
        L = augpath[2 * i - 2];
        const j = dfsstate[i]++;
        if (j === adjsizes[L]) {
          i--;
          continue;
        }
        if (rs && adjsizes[L] - j > 1) {
          const which = j + randomUpto(rs, adjsizes[L] - j);
          const tmp = adjlists[L][which];
          adjlists[L][which] = adjlists[L][j];
          adjlists[L][j] = tmp;
        }
        const R = adjlists[L][j];

        if (Rlayer[R] !== 2 * i - 1) continue;

        augpath[2 * i - 1] = R;
        Rlayer[R] = -1;

        if (2 * i - 1 === targetLayer) {
          for (let k = 0; k < 2 * i; k += 2) {
            LtoR[augpath[k]] = augpath[k + 1];
            RtoL[augpath[k + 1]] = augpath[k];
          }
          i = 0;
          continue;
        }

        L = RtoL[R];
        if (Llayer[L] !== 2 * i) continue;
      }

      augpath[2 * i] = L;
      Llayer[L] = -1;
      i++;
      dfsstate[i] = 0;
    }
  }

  return LtoR;
}

/** Generate an `o × o` Latin square (values 1..o), row by row via matching,
 * faithful to `latin_generate`. */
export function latinGenerate(o: number, rs: RandomState): Int32Array {
  const sq = new Int32Array(o * o);

  const row: number[] = [];
  for (let i = 0; i < o; i++) row[i] = i;
  shuffle(row, rs);

  const adjlists: number[][] = [];
  const adjsizes: number[] = [];
  for (let j = 0; j < o; j++) adjlists[j] = [];

  for (let i = 0; i < o; i++) {
    for (let j = 0; j < o; j++) {
      const present = new Int8Array(o);
      for (let k = 0; k < i; k++) present[sq[row[k] * o + j] - 1] = 1;
      const adj = adjlists[j];
      adj.length = 0;
      for (let k = 0; k < o; k++) if (!present[k]) adj.push(k);
      adjsizes[j] = adj.length;
    }

    const m = matching(o, o, adjlists, adjsizes, rs);
    for (let j = 0; j < o; j++) sq[row[i] * o + j] = m[j] + 1;
  }

  return sq;
}

/** Crop an `o × o` Latin square to `w × h` (`o = max(w,h)`). */
export function latinGenerateRect(w: number, h: number, rs: RandomState): Int32Array {
  const o = Math.max(w, h);
  const latin = latinGenerate(o, rs);
  const rect = new Int32Array(w * h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) rect[y * w + x] = latin[y * o + x];
  }
  return rect;
}
