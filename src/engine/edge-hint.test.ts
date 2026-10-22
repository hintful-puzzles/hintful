/**
 * Tier-1 tests for a hint on the edges of a square grid: that one edge is one
 * mark however it is named, that each of its squares draws its own half in the
 * role's ink, and that a chain's number lands in one square, in the corner
 * beside its edge. Path, Pearl and Tracks reach these only through the boards
 * their hints happen to make.
 */
import { describe, expect, it } from "vitest";
import {
  drawEdgeHints,
  drawEdgeOrdinals,
  EDGE,
  type EdgeHint,
  type EdgeRole,
  edgeHintWords,
  hintedSides,
} from "./edge-hint.ts";
import { DOWN, LEFT, RIGHT, squareEdges, UP } from "./square-edges.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";

const g = squareEdges(3, 2);
/** The edge between squares 1 and 2, and the one below square 1. */
const across = g.around[1 * 4 + RIGHT];
const below = g.around[1 * 4 + DOWN];

/** What `drawEdgeHints` asks a square's shapes to draw, in the order asked. */
function drawn(word: number): string[] {
  const out: string[] = [];
  const note = (shape: string) => (sides: number, ink: number, role: EdgeRole) =>
    out.push(`${shape} ${sides} ${ink} ${role}`);
  drawEdgeHints(
    word,
    { ring: 7, outline: 8 },
    { line: note("line"), cross: note("cross") },
  );
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
    expect(drawn(words[1])).toEqual([`cross ${1 << RIGHT} 7 ring`]);
    expect(drawn(words[2])).toEqual([`cross ${1 << LEFT} 7 ring`]);
    expect(hintedSides(words[2], "cross")).toBe(1 << LEFT);
    expect(hintedSides(words[2], "line")).toBe(0);
    for (const i of [0, 3, 4, 5]) expect(words[i]).toBe(0);
  });

  it("on the rim is drawn by its one square", () => {
    const words = edgeHintWords(g, [
      { edge: { cell: 0, dir: UP }, shape: "line", role: "outline" },
    ]);
    expect(drawn(words[0])).toEqual([`line ${1 << UP} 8 outline`]);
    expect([...words.slice(1)].every((w) => w === 0)).toBe(true);
  });

  it("asked by the step and also reasoned from is drawn as asked", () => {
    const words = edgeHintWords(g, [
      { edge: across, shape: "cross", role: "outline", order: 2 },
      { edge: across, shape: "line", role: "ring" },
      { edge: below, shape: "cross", role: "outline" },
    ]);
    // The outline's under the ring's.
    expect(drawn(words[1])).toEqual([
      `cross ${1 << DOWN} 8 outline`,
      `line ${1 << RIGHT} 7 ring`,
    ]);
  });
});

describe("a chain's number on an edge", () => {
  const box = { x: 100, y: 200, w: 40, h: 40 };
  const texts = (word: number) => {
    const dr = new RecordingDrawing([]);
    drawEdgeOrdinals(dr, word, box, 2, 8);
    return dr.ops.flatMap((o) => (o.op === "text" ? [o] : []));
  };

  it("is drawn once, by the edge's first square, in the corner beside it", () => {
    const words = edgeHintWords(g, [
      { edge: across, shape: "line", role: "outline", order: 3 },
      { edge: below, shape: "cross", role: "outline", order: 4 },
    ]);
    const [right, down] = texts(words[1]);
    expect([right.text, down.text]).toEqual(["3", "4"]);
    // The top-right for the edge on its right, the bottom-left for the one
    // below: inside the square, on opposite sides of its diagonal.
    expect(right.x).toBeGreaterThan(box.x + box.w / 2);
    expect(right.y).toBeLessThan(box.y + box.h / 2);
    expect(down.x).toBeLessThan(box.x + box.w / 2);
    expect(down.y).toBeGreaterThan(box.y + box.h / 2);
    for (const t of [right, down]) expect(t.color).toBe(8);
    expect(texts(words[2])).toEqual([]);
    expect(texts(words[4])).toEqual([]);
  });

  it("refuses a number its word has no room for", () => {
    expect(() =>
      edgeHintWords(g, [{ edge: across, shape: "line", role: "outline", order: 32 }]),
    ).toThrow(/ordinal 32/);
    expect(() =>
      edgeHintWords(g, [
        { edge: { cell: 0, dir: UP }, shape: "line", role: "outline", order: 1 },
      ]),
    ).toThrow(/ordinal 1/);
  });
});
