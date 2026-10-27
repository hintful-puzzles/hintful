/**
 * A hint on the edges between the squares of a square grid: the mark kind a
 * sentence names an edge by, the bits each square's tile key holds for it,
 * and their drawing (docs/hints-marks.md § "A mark on something that is not a
 * cell").
 *
 * A step asks for an edge as a line or a cross, and the edge is ringed by a
 * pill with that line or cross inside it in the ring's ink: the move's own
 * shape, recolored, inside the round mark the word "ringed" names. An edge
 * the step reasons from, or one a supposition's chain would force, is drawn
 * in the outline's ink. How a line and a cross look is the game's own, so the
 * game declares them ({@link EdgeShapes}); which sides of which squares carry
 * what, and in which ink, is this module's.
 */

import type { GameDrawing, HintStep, HintTrackVerdict } from "./game.ts";
import { changedCells, trackTargets } from "./hint-track.ts";
import type { MarkKind, MarkRole, StepMarks } from "./hint-words.ts";
import { CROSS, type EdgeChange, type EdgeMark } from "./line-drawing.ts";
import type { RingClear } from "./ring.ts";
import { type Side, type SquareEdges, sideOf } from "./square-edges.ts";
import type { Rect } from "./types.ts";

/** An edge of the board, by its `square-edges.ts` number, so one edge named
 * from the square on either side of it is one mark. */
export const EDGE: MarkKind<number> = { name: "edge", key: String };

/** The roles an edge is drawn in: the ring for what the step decides, the
 * outline for what it reasons from or a chain would force. */
export type EdgeRole = Extract<MarkRole, "ring" | "outline">;

/** One edge a step draws: the shape it asks for or would take, and in which
 * role. The edge is its number, or a side of a square, which is how a side on
 * the board's rim is named: it has no square beyond it and no number. */
export interface EdgeHint {
  readonly edge: number | Side;
  readonly shape: "line" | "cross";
  readonly role: EdgeRole;
}

/** One edge of a supposition's chain, as a step's highlights carry it: the
 * mark it would take. */
export interface EdgeChainLink {
  readonly edge: number;
  readonly mark: EdgeMark;
}

/**
 * The edges a step draws, read from its words (`named`): each ringed edge in
 * the shape `asked`, the step's move, gives it, and each outlined edge of
 * `chain` in the shape it would take.
 */
export function stepEdgeHints(
  named: StepMarks,
  asked: readonly EdgeChange[],
  chain: readonly EdgeChainLink[] = [],
): EdgeHint[] {
  const out: EdgeHint[] = [];
  for (const edge of named.of("ring", EDGE))
    out.push({
      edge,
      shape: asked.find((c) => c.edge === edge)?.mark === CROSS ? "cross" : "line",
      role: "ring",
    });
  const outlined = new Set(named.of("outline", EDGE));
  for (const link of chain)
    if (outlined.has(link.edge))
      out.push({
        edge: link.edge,
        shape: link.mark === CROSS ? "cross" : "line",
        role: "outline",
      });
  return out;
}

/**
 * Judge a move against a step that sets edges, by what it did to them, so a
 * click, a drag and a key that make the same change are the same
 * (`hint-track.ts`). `asked` is the step's changes, and `before` and `after`
 * the edges either side of the move. A step left part-made shrinks to the rest:
 * its move becomes `moveOf` of what is left, and its words drop the rings on
 * the edges made, which re-renders every word that counts them.
 */
export function trackEdgeStep<M>(
  step: HintStep<M>,
  asked: readonly EdgeChange[],
  before: ArrayLike<number>,
  after: ArrayLike<number>,
  moveOf: (left: EdgeChange[]) => M,
): HintTrackVerdict {
  const { verdict, left } = trackTargets({
    targets: asked,
    changes: changedCells<number>(
      before.length,
      (e) => before[e],
      (e) => after[e],
    ),
    key: (t) => t.edge,
    want: (t) => t.mark,
    holds: (t) => after[t.edge] === t.mark,
  });
  if (verdict === "onTrack") {
    step.move = moveOf(left);
    const kept = new Set(left.map((t) => EDGE.key(t.edge)));
    if (step.words) {
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== EDGE.name || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}

// A square's word: three bits a side, by direction, for what the side shows.
const SIDE_BITS = 3;
const RING_LINE = 1;
const RING_CROSS = 2;
const OUTLINE_LINE = 3;
const OUTLINE_CROSS = 4;

/** How many low bits of a square's word {@link edgeHintWords} uses; a game
 * that keeps the word beside bits of its own puts them above these. */
export const EDGE_HINT_BITS = 4 * SIDE_BITS;

function sideMark({ shape, role }: EdgeHint): number {
  if (role === "ring") return shape === "line" ? RING_LINE : RING_CROSS;
  return shape === "line" ? OUTLINE_LINE : OUTLINE_CROSS;
}

/**
 * Each square's word for the edges a step draws, set on both squares of each
 * edge so each draws its half. An edge drawn in both roles is drawn as the
 * ring, which is what the step asks for.
 */
export function edgeHintWords(g: SquareEdges, hints: readonly EdgeHint[]): Int32Array {
  const out = new Int32Array(g.cells);
  // Each hint as the sides it is drawn on, the edge's first square's first.
  const sidesOf = ({ edge }: EdgeHint): Side[] => {
    const e = typeof edge === "number" ? edge : g.around[edge.cell * 4 + edge.dir];
    if (e < 0 && typeof edge !== "number") return [edge];
    return [g.a[e], g.b[e]].map((cell) => ({ cell, dir: sideOf(g, e, cell) }));
  };
  const key = ({ cell, dir }: Side): number => cell * 4 + dir;
  const ringed = new Set<number>();
  for (const h of hints) if (h.role === "ring") ringed.add(key(sidesOf(h)[0]));
  for (const h of hints) {
    const sides = sidesOf(h);
    if (h.role === "ring" || !ringed.has(key(sides[0])))
      for (const { cell, dir } of sides) {
        const shift = dir * SIDE_BITS;
        out[cell] = (out[cell] & ~(7 << shift)) | (sideMark(h) << shift);
      }
  }
  return out;
}

/** Where the ring round an asked edge goes: the box its pill goes round, the
 * text it keeps off, and how thick it is (`GameDrawing.drawRing`). */
export interface EdgeRing {
  readonly box: Rect;
  readonly clear: RingClear;
  readonly thickness: number;
  readonly room?: Rect;
}

/** How a game draws a line and a cross on sides of one square. `sides` is a
 * direction mask (`1 << d`); the line runs from the square's middle to each
 * side, and the cross sits on the side. `ring` says where the ring round the
 * edge on side `d` goes when a step asks it to become `shape`: across the
 * side, round the part of the shape the ring can hold clear of the squares'
 * text. Both squares of the edge draw that one ring. */
export interface EdgeShapes {
  line(sides: number, ink: number, role: EdgeRole): void;
  cross(sides: number, ink: number, role: EdgeRole): void;
  ring(d: number, shape: EdgeHint["shape"]): EdgeRing;
}

function sidesWith(word: number, ...marks: number[]): number {
  let sides = 0;
  for (let d = 0; d < 4; d++)
    if (marks.includes((word >> (d * SIDE_BITS)) & 7)) sides |= 1 << d;
  return sides;
}

/** The sides of a square whose word draws the shape there, in either role:
 * where a game leaves out what it would draw on a side the hint takes. */
export function hintedSides(word: number, shape: EdgeHint["shape"]): number {
  return shape === "line"
    ? sidesWith(word, RING_LINE, OUTLINE_LINE)
    : sidesWith(word, RING_CROSS, OUTLINE_CROSS);
}

/**
 * Draw one square's share of the edges in its word: its half of each
 * outlined edge in `outlineInk`, and, over them, the whole ring round each
 * asked edge with the asked shape inside it. Draw it under what the square
 * holds: an edge a step asks for is one the player has not decided, so
 * nothing of theirs is on it.
 */
export function drawEdgeHints(
  dr: GameDrawing,
  word: number,
  outlineInk: number,
  shapes: EdgeShapes,
): void {
  const outlined = (mark: number, cross: boolean): void => {
    const sides = sidesWith(word, mark);
    if (sides === 0) return;
    if (cross) shapes.cross(sides, outlineInk, "outline");
    else shapes.line(sides, outlineInk, "outline");
  };
  outlined(OUTLINE_CROSS, true);
  outlined(OUTLINE_LINE, false);
  for (let d = 0; d < 4; d++) {
    const mark = (word >> (d * SIDE_BITS)) & 7;
    if (mark !== RING_LINE && mark !== RING_CROSS) continue;
    const shape = mark === RING_CROSS ? "cross" : "line";
    const { box, clear, thickness, room } = shapes.ring(d, shape);
    dr.drawRing(box, clear, thickness, {
      room,
      inside: (ink) =>
        shape === "cross"
          ? shapes.cross(1 << d, ink, "ring")
          : shapes.line(1 << d, ink, "ring"),
    });
  }
}
