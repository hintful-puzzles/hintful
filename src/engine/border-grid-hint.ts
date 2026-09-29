/**
 * The border-marking grid's explained hint: the step shape, the journey a
 * firing becomes, and how a player's click is judged against it. The fourth
 * layer of the mechanic [`border-grid.ts`](./border-grid.ts) owns the model and
 * input of, and [`border-grid-render.ts`](./border-grid-render.ts) the look of.
 *
 * It is shared by the same test those two state: it would have to change in
 * every border-grid game at once. A hint on this board always ends in the
 * player's own notation, an edge set to a wall or to "no wall", so the edits a
 * step makes, the highlight that carries it, and the verdict on a click are
 * facts about the notation, not the puzzle. What stays in each game is the
 * deduction and its sentence (Palisade counts walls around a clue, Separate
 * reads letters in a region), and, as with the input, its own `Move`: the
 * journey is handed the edits and the game wraps them, so no two games' save
 * formats are coupled through here.
 *
 * **A leg's evidence comes from its words** (`hint-words.ts`): the squares the
 * sentence outlines and the region it stripes are the references it makes, so
 * the board cannot mark what the sentence does not name.
 */

import { BORDER, type BorderEdit, DISABLED, DX, DY, FLIP } from "./border-grid.ts";
import { type HintStep, type HintTrackVerdict, narratedStep } from "./game.ts";
import type { MarkKind, Narration } from "./hint-words.ts";

/** An edge, named on the square `(x, y)`'s `dir` side. */
export interface BorderEdge {
  x: number;
  y: number;
  dir: number;
}

/** One edge a deduction sets. */
export interface ForcedBorderEdge extends BorderEdge {
  kind: "wall" | "nowall";
}

/** The edges of the border grid, as marks: an edge named from either of its
 * squares is the same edge. */
export const EDGE: MarkKind<BorderEdge> = {
  name: "edge",
  key: ({ x, y, dir }) =>
    DX[dir] < 0 || DY[dir] < 0
      ? `${x + DX[dir]},${y + DY[dir]},${FLIP(dir)}`
      : `${x},${y},${dir}`,
};

/** A displayed step's highlights: the edge it sets, which keep-track compares a
 * player's edit against. Its marks are its words' (`hint-words.ts`'s
 * `stepMarks`): the firing's edges still to do ringed, the squares it reasons
 * from outlined, the region it is about striped. */
export type BorderHint = ForcedBorderEdge;

/**
 * One firing as one journey (docs/games/hints.md § "Group one firing into one
 * step"): a leg per edge, each leg's move the two-sided edit that sets it,
 * wrapped by the game's `toMove`, and the legs after the first flagged
 * `continuesPrevious`. Each leg shows the edges still to come, so the whole set
 * is lit on the first leg and drops off as the legs complete.
 *
 * `words(leg, left)` is the game's sentence for that leg, where `left` is the
 * edges it rings: its own and the ones still to come. The squares it outlines
 * and the region it stripes are the leg's evidence.
 */
export function borderHintJourney<M>(
  edges: readonly ForcedBorderEdge[],
  words: (leg: number, left: readonly ForcedBorderEdge[]) => Narration,
  toMove: (edits: BorderEdit[]) => M,
): HintStep<M, BorderHint>[] {
  return edges.map((e, leg) => {
    const { x, y, dir, kind } = e;
    const said = words(leg, edges.slice(leg));
    return narratedStep<M, BorderHint>({
      move: toMove([
        { x, y, flag: edgeFlag(dir, kind) },
        { x: x + DX[dir], y: y + DY[dir], flag: edgeFlag(FLIP(dir), kind) },
      ]),
      words: said,
      ...(leg > 0 ? { continuesPrevious: true } : {}),
      highlights: { x, y, dir, kind },
    });
  });
}

function edgeFlag(dir: number, kind: ForcedBorderEdge["kind"]): number {
  return kind === "wall" ? BORDER(dir) : DISABLED(BORDER(dir));
}

/**
 * A player's edge edits complete the step iff the edit on the hinted square
 * toggles the hinted bit *on*. Side-agnostic (the shared edge is always
 * recorded on the hinted square's `dir` side) and button-checked (a
 * wrong-button click sets the other bit, so it is `"off"`). `edits` is `null`
 * for a move that edits no edge; `borders` is the PRE-move board, as the
 * midend hands it.
 */
export function borderHintKeepTrack(
  edits: readonly BorderEdit[] | null,
  step: HintStep<unknown, BorderHint>,
  w: number,
  borders: ArrayLike<number>,
): HintTrackVerdict {
  if (!edits) return "off";
  const hl = step.highlights;
  if (!hl) return "off";
  const bit = edgeFlag(hl.dir, hl.kind);
  for (const e of edits) {
    if (e.x === hl.x && e.y === hl.y) {
      return (borders[hl.y * w + hl.x] ^ e.flag) & bit ? "completed" : "off";
    }
  }
  return "off";
}
