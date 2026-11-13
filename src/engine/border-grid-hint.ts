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

import {
  BORDER,
  BORDER_MASK,
  type BorderEdit,
  DISABLED,
  DX,
  DY,
  FLIP,
} from "./border-grid.ts";
import type { GridSpace } from "./describe-runtime.ts";
import type { HintStep, HintTrackVerdict } from "./game.ts";
import type { MarkKind } from "./hint-words.ts";

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
 * squares is the same edge. A mark carries what the edge must become, which
 * is the shape it is drawn in. */
export const EDGE: MarkKind<ForcedBorderEdge> = {
  name: "edge",
  key: ({ x, y, dir }) =>
    DX[dir] < 0 || DY[dir] < 0
      ? `${x + DX[dir]},${y + DY[dir]},${FLIP(dir)}`
      : `${x},${y},${dir}`,
};

/** The legend's words for the ring (`hintMarks.roles.ring`), which
 * `border-grid-render.ts` draws the same in every border-grid game. */
export const BORDER_RING_LEGEND =
  "the edges the step decides, each as what it must become: a wall is the edge itself in the hint color, and an edge that can't be a wall keeps its look with a cross on it. When one reason decides several edges at once they are all marked together, and each drops back to normal as you set it.";

/**
 * The edge a leg's edits set, which is what its click aims at
 * (`Game.hintGesture`, through `verbClicks`, which picks the button). A leg's
 * first edit is on the square the edge is named from, with the one bit it
 * sets: a wall, or not-a-wall four bits up.
 */
export function borderStepEdge(edits: readonly BorderEdit[]): BorderEdge {
  const [{ x, y, flag }] = edits;
  const wall = (flag & BORDER_MASK) !== 0;
  return { x, y, dir: 31 - Math.clz32(wall ? flag : flag >> 4) };
}

/** A displayed step's highlights: the edge it sets, which keep-track compares a
 * player's edit against. Its marks are its words' (`hint-words.ts`'s
 * `stepMarks`): the firing's edges still to do ringed, the squares it reasons
 * from outlined, the region it is about striped. */
export type BorderHint = ForcedBorderEdge;

/**
 * The edges a firing's facts set (`[kind, edge, value]` triples, `wall` the value
 * that is a wall, any other a no-wall mark), each named on the side of its
 * `anchor` square, in the anchor's reading order and each square's sides from
 * the top clockwise: the order a journey's legs go in. A firing is one journey
 * (docs/hints-marks.md § "Group one firing into one step"): a leg per edge,
 * each leg showing the edges still to come, so the whole set is lit on the first
 * leg and drops off as the legs complete.
 */
export function forcedEdgesOf(
  sp: GridSpace,
  facts: readonly number[],
  anchor: readonly number[],
  wall: number,
): ForcedBorderEdge[] {
  const inAnchor = new Set(anchor);
  const out: (ForcedBorderEdge & { at: number })[] = [];
  for (let i = 0; i < facts.length; i += 3) {
    const e = facts[i + 1];
    const p = sp.edgeEnds[2 * e];
    const q = sp.edgeEnds[2 * e + 1];
    const at = inAnchor.has(p) ? p : q;
    // A grid one square wide has its squares below one another `p + 1` apart.
    const down = q === p + sp.w;
    out.push({
      at,
      x: at % sp.w,
      y: (at / sp.w) | 0,
      dir: at === p ? (down ? 2 : 1) : down ? 0 : 3,
      kind: facts[i + 2] === wall ? "wall" : "nowall",
    });
  }
  out.sort((a, b) => a.at - b.at || a.dir - b.dir);
  return out.map(({ x, y, dir, kind }) => ({ x, y, dir, kind }));
}

/** The two-sided edit that sets `e`: its own square's bit, and the bit the
 * square across holds for the same edge. */
export function borderEdgeEdits({ x, y, dir, kind }: ForcedBorderEdge): BorderEdit[] {
  return [
    { x, y, flag: edgeFlag(dir, kind) },
    { x: x + DX[dir], y: y + DY[dir], flag: edgeFlag(FLIP(dir), kind) },
  ];
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
