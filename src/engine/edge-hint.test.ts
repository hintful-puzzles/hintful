/**
 * Tier-1 tests for a hint on the edges of a square grid: that one edge is one
 * mark however it is named, that each of its squares draws its outline half or
 * its asked edge's ring, with the asked shape inside the ring in the ring's
 * ink. Path, Pearl and Tracks reach these only through the boards their hints
 * happen to make.
 */
import { describe, expect, it } from "vitest";
import {
  drawEdgeHints,
  EDGE,
  type EdgeHint,
  type EdgeRole,
  edgeHintWords,
  hintedSides,
} from "./edge-hint.ts";
import { NOTHING_TO_CLEAR } from "./ring.ts";
import { DOWN, LEFT, RIGHT, squareEdges, UP } from "./square-edges.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";

const g = squareEdges(3, 2);
/** The edge between squares 1 and 2, and the one below square 1. */
const across = g.around[1 * 4 + RIGHT];
const below = g.around[1 * 4 + DOWN];

/** A game's palette of eight slots, so the ring's ink is the engine's
 * ninth (`resolvePalette`). */
const RING_INK = 8;

/** What `drawEdgeHints` asks a square's shapes to draw, in the order asked:
 * each ring it asks where to go, and what it draws in each role's ink. */
function drawn(word: number): string[] {
  const out: string[] = [];
  const note = (shape: string) => (sides: number, ink: number, role: EdgeRole) =>
    out.push(`${shape} ${sides} ${ink} ${role}`);
  const dr = new RecordingDrawing(Array.from({ length: RING_INK }, () => [0, 0, 0]));
  drawEdgeHints(dr, word, 7, {
    line: note("line"),
    cross: note("cross"),
    ring: (d, shape) => {
      out.push(`ring ${d} ${shape}`);
      return {
        box: { x: 0, y: 0, w: 30, h: 12 },
        clear: NOTHING_TO_CLEAR,
        thickness: 2,
      };
    },
  });
  return out;
}

describe("an edge a hint names", () => {
  it("is one mark named from either square, or by its number", () => {
    expect(EDGE.key(across)).toBe(String(across));
    const asked = (edge: EdgeHint["edge"]): Int32Array =>
      edgeHintWords(g, [{ edge, shape: "line", role: "ring" }]);
    const byNumber = asked(across);
    expect(asked({ cell: 1, dir: RIGHT })).toEqual(byNumber);
    expect(asked({ cell: 2, dir: LEFT })).toEqual(byNumber);
  });

  it("is drawn by both its squares, each on its own side", () => {
    const words = edgeHintWords(g, [{ edge: across, shape: "cross", role: "ring" }]);
    // Each square rings the edge, with the asked cross inside the ring.
    expect(drawn(words[1])).toEqual([
      `ring ${RIGHT} cross`,
      `cross ${1 << RIGHT} ${RING_INK} ring`,
    ]);
    expect(drawn(words[2])).toEqual([
      `ring ${LEFT} cross`,
      `cross ${1 << LEFT} ${RING_INK} ring`,
    ]);
    expect(hintedSides(words[2], "cross")).toBe(1 << LEFT);
    expect(hintedSides(words[2], "line")).toBe(0);
    for (const i of [0, 3, 4, 5]) expect(words[i]).toBe(0);
  });

  it("on the rim is drawn by its one square", () => {
    const words = edgeHintWords(g, [
      { edge: { cell: 0, dir: UP }, shape: "line", role: "outline" },
    ]);
    expect(drawn(words[0])).toEqual([`line ${1 << UP} 7 outline`]);
    expect([...words.slice(1)].every((w) => w === 0)).toBe(true);
  });

  it("asked by the step and also reasoned from is drawn as asked", () => {
    const words = edgeHintWords(g, [
      { edge: across, shape: "cross", role: "outline" },
      { edge: across, shape: "line", role: "ring" },
      { edge: below, shape: "cross", role: "outline" },
    ]);
    // The outline's under the ring's.
    expect(drawn(words[1])).toEqual([
      `cross ${1 << DOWN} 7 outline`,
      `ring ${RIGHT} line`,
      `line ${1 << RIGHT} ${RING_INK} ring`,
    ]);
  });
});
