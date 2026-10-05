/**
 * Every sentence Palisade's hint speaks, and the words inside them. Palisade
 * is the collection's exemplar hint (docs/games/hints.md § "The quality bar"), so these
 * are the sentences other games' are measured against.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `explain`); this file decides only how it reads. Every sentence is phrased as
 * advice, because the move has *not* been applied yet: "must be a wall" /
 * "can't be a wall", never "is a wall" / "has none". Every word that points at
 * the board is a reference to the mark it points at (`engine/hint-words.ts`):
 * `edges` are the ringed edges the leg sets and those still to come, and the
 * squares a sentence names are outlined or, for the one region it is about,
 * striped.
 */

import { EDGE, type ForcedBorderEdge } from "../../engine/border-grid-hint.ts";
import {
  CELL,
  mark,
  type Narration,
  type Noun,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

type Edges = readonly ForcedBorderEdge[];

const theseEdges = (edges: Edges, words: string): Narration =>
  mark.as("ring", EDGE, edges, words);
const thisEdge = (edges: Edges): Narration => mark.this("ring", EDGE, edges, "edge");
const clueNamed = (clue: Point, c: number, words = `Clue ${c}`): Narration =>
  mark.as("outline", CELL, [clue], words);

export const say = {
  // Upstream's `solver_connected_clues_versus_region_size`, whose bound the
  // narration has to *show* rather than assert: if the shared edge were open,
  // each clue's walls would all sit on its other three sides, leaving
  // `3 - clue` sides leading further into the same region. Two orthogonally
  // adjacent cells share no common orthogonal neighbor, so those two sets are
  // disjoint and the region holds at least `2 + (3 - c) + (3 - d) = 8 - c - d`
  // cells.
  /** Clues `c` and `d` on the squares `clues`, either side of the edge, in
   * regions of `k`. */
  cluesVersusRegionSize: (
    clues: readonly Point[],
    c: number,
    d: number,
    k: number,
    edges: Edges,
  ): Sentence => {
    const move = phrase`${theseEdges(edges, "the edge between them")} must be a wall`;
    // Two 3s are the case where the bound is *exact* rather than a
    // minimum: each keeps one side open and it has to be the shared one,
    // so the region would be those two cells and nothing else. `8-3-3`
    // never exceeds `k`, so the general arm below cannot reach this.
    if (c === 3 && d === 3) {
      return so({
        look: phrase`${mark.as("outline", CELL, clues, "Two 3s")} each keep just one side open, and it has to be the one they share, so their region would be exactly 2 cells. Regions here hold ${k}`,
        move,
      });
    }
    // The side-counting behind the bound is left to the outlined clues: this
    // arm fires only on small-region boards, and takes the shorter sentence by
    // the owner's choice. The two-3s arm keeps its count, because there the
    // bound is exact and the count is the whole argument.
    return so({
      look: phrase`${mark.this("outline", CELL, clues, "clue")} would need a shared region of at least ${8 - c - d} cells, but regions here hold ${k}`,
      move,
    });
  },

  /** Clue `c` on `clue` is met, or can only be met, by its remaining edges;
   * `multi` when the firing sets several. */
  numberExhausted: (clue: Point, c: number, edges: Edges, multi: boolean): Sentence => {
    const named = clueNamed(clue, c);
    const kind = edges[0].kind;
    // A 0 has no walls to have "all" of: say what it allows instead.
    if (c === 0) {
      return so({
        look: phrase`${named} allows no walls`,
        move: multi
          ? phrase`none of ${theseEdges(edges, "its remaining edges")} can be walls`
          : phrase`${thisEdge(edges)} can't be one`,
      });
    }
    if (multi) {
      return kind === "wall"
        ? so({
            look: phrase`${named} reaches its count only if ${theseEdges(edges, "every remaining edge")} is a wall`,
            move: phrase`draw them all`,
          })
        : so({
            look: phrase`${named} already has all its walls`,
            move: phrase`${theseEdges(edges, "its remaining edges")} can't be walls`,
          });
    }
    return kind === "wall"
      ? so({
          look: phrase`${named} needs all its remaining edges to be walls`,
          move: phrase`${theseEdges(edges, "this one")} must be a wall`,
        })
      : so({
          look: phrase`${named} already has all its walls`,
          move: phrase`${thisEdge(edges)} can't be one`,
        });
  },

  // Both region-size rules carry their evidence cells, so the narration
  // states the sizes it is comparing rather than "the target size".
  /** Joining the two regions `cells` would make `joined` cells (unknown when
   * the rule carried none), against regions of `k`. */
  notTooBig: (
    cells: readonly Point[],
    joined: number | null,
    k: number,
    edges: Edges,
  ): Sentence => {
    const regions = mark.as("outline", CELL, cells, "these two regions");
    return so({
      look:
        joined === null
          ? phrase`Joining ${regions} would leave more than the ${k} cells a region holds`
          : phrase`Joining ${regions} would make ${joined} cells, but a region here holds ${k}`,
      move: phrase`${thisEdge(edges)} must be a wall`,
    });
  },

  /** The region `cells`, of `size` cells (unknown when the rule carried none),
   * short of `k`, with one way left to grow. */
  notTooSmall: (
    cells: readonly Point[],
    size: number | null,
    k: number,
    edges: Edges,
  ): Sentence => {
    const region = mark.this("stripes", whole(CELL), cells, "region");
    return so({
      look:
        size === null
          ? phrase`${region} is short of its ${k} cells and has just one way left to grow`
          : phrase`${region} has ${size} of its ${k} cells and just one way left to grow`,
      move: phrase`${thisEdge(edges)} can't be a wall`,
    });
  },

  /** The four squares `corner` meet where a wall would dangle. */
  noDanglingEdges: (corner: readonly Point[], edges: Edges): Sentence =>
    so({
      look: phrase`A wall can't stop in mid-air at ${mark.as("outline", CELL, corner, "this corner")}`,
      move: phrase`${thisEdge(edges)} must be a wall`,
    }),

  /** The edges border one region, `region`, so clue `c` forces them alike. */
  equivalentEdges: (
    region: readonly Point[],
    c: number,
    edges: Edges,
    multi: boolean,
  ): Sentence => {
    const kind = edges[0].kind;
    // The crux: both ringed edges border the same connected region, so the
    // clue cell is either inside all of it (both edges open) or walled off
    // from all of it (both walled), and it can't do one of each. That coupling
    // is what makes the clue's count force the edges; without it the sentence
    // reads as a non-sequitur.
    if (multi) {
      const both = theseEdges(edges, "Both edges");
      const same = mark.as("stripes", whole(CELL), region, "the same region");
      const fate = phrase`${both} border ${same}, so they share a fate: both walls or both open.`;
      return kind === "wall"
        ? so({
            look: phrase`${fate} Leaving both open would leave clue ${c} short of walls`,
            move: phrase`both must be walls`,
          })
        : so({
            look: phrase`${fate} Walling both would exceed clue ${c}`,
            move: phrase`neither can be a wall`,
          });
    }
    // Rare post-dedup singleton (the partner edge was already shown).
    const a = mark.as("stripes", whole(CELL), region, "a region");
    const edge = thisEdge(edges);
    return kind === "wall"
      ? so({
          look: phrase`${edge} borders ${a} clue ${c} can't fully open`,
          move: phrase`it must be a wall`,
        })
      : so({
          look: phrase`${edge} borders ${a} clue ${c} can't wall off`,
          move: phrase`it can't be a wall`,
        });
  },

  /** What a later leg of a firing points back to: the evidence its first leg
   * named, which the leg still shows. */
  basis: {
    clue: (clue: Point, c: number): Narration => clueNamed(clue, c, `clue ${c}`),
    outlined: (cells: readonly Point[], noun: Noun): Narration =>
      mark.the("outline", CELL, cells, noun, "the same"),
    region: (cells: readonly Point[]): Narration =>
      mark.the("stripes", whole(CELL), cells, "region", "the same"),
  },
};
