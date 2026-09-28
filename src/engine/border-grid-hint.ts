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
 */

import { BORDER, type BorderEdit, DISABLED, DX, DY, FLIP } from "./border-grid.ts";
import type { HintStep, HintTrackVerdict } from "./game.ts";
import type { Point } from "./types.ts";

/** One edge a deduction sets, named on the square `(x, y)`'s `dir` side. */
export interface ForcedBorderEdge {
  x: number;
  y: number;
  dir: number;
  kind: "wall" | "nowall";
}

/**
 * A displayed step: the edge it sets (`x`, `y`, `dir`, `kind`), the firing's
 * still-to-do edges (`edges`, same color, since they share a fate), and the
 * squares the sentence cites. `hatch` is the one region the sentence is about;
 * `cells` are outlined, for anything else it names (a clue, a second region).
 */
export interface BorderHint extends ForcedBorderEdge {
  cells?: ReadonlyArray<Point>;
  hatch?: ReadonlyArray<Point>;
  edges?: ReadonlyArray<{ x: number; y: number; dir: number }>;
}

/** The squares a firing cites, as grid indices. */
export interface BorderHintEvidence {
  cells?: readonly number[];
  hatch?: readonly number[];
}

/**
 * One firing as one journey (docs/games/hints.md § "Group one firing into one
 * step"): a leg per edge, each leg's move the two-sided edit that sets it,
 * wrapped by the game's `toMove`, and the legs after the first flagged
 * `continuesPrevious`. Each leg shows the edges still to come, so the whole set
 * is lit on the first leg and drops off as the legs complete. `explain(leg)` is
 * the game's sentence for that leg.
 */
export function borderHintJourney<M>(
  w: number,
  edges: readonly ForcedBorderEdge[],
  explain: (leg: number) => string,
  evidence: BorderHintEvidence,
  toMove: (edits: BorderEdit[]) => M,
): HintStep<M, BorderHint>[] {
  const toPoints = (sqs?: readonly number[]): Point[] | null =>
    sqs ? sqs.map((i) => ({ x: i % w, y: Math.floor(i / w) })) : null;
  const cells = toPoints(evidence.cells);
  const hatch = toPoints(evidence.hatch);
  return edges.map((e, leg) => {
    const { x, y, dir, kind } = e;
    const later = edges.slice(leg + 1);
    return {
      move: toMove([
        { x, y, flag: edgeFlag(dir, kind) },
        { x: x + DX[dir], y: y + DY[dir], flag: edgeFlag(FLIP(dir), kind) },
      ]),
      explanation: explain(leg),
      ...(leg > 0 ? { continuesPrevious: true } : {}),
      highlights: {
        x,
        y,
        dir,
        kind,
        ...(cells ? { cells } : {}),
        ...(hatch ? { hatch } : {}),
        ...(later.length
          ? { edges: later.map((s) => ({ x: s.x, y: s.y, dir: s.dir })) }
          : {}),
      },
    };
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
  step: HintStep<unknown>,
  w: number,
  borders: ArrayLike<number>,
): HintTrackVerdict {
  if (!edits) return "off";
  const hl = step.highlights as BorderHint;
  const bit = edgeFlag(hl.dir, hl.kind);
  for (const e of edits) {
    if (e.x === hl.x && e.y === hl.y) {
      return (borders[hl.y * w + hl.x] ^ e.flag) & bit ? "completed" : "off";
    }
  }
  return "off";
}
