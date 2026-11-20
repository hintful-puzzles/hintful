/**
 * The wordings of Separate's stated hint that no walk of the word dump reaches:
 * a firing that sets several edges (the dump's boards set one each), a later
 * leg's `again` basis, and the walled-apart pair of two lone squares or two
 * regions. Each is rendered from the compiled module's clauses, as the engine
 * renders it.
 */
import { describe, expect, it } from "vitest";
import { EDGE, type ForcedBorderEdge } from "../../engine/border-grid-hint.ts";
import { CELL } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { type Clauses, statedParts, statedSentence } from "../../engine/stated.ts";
import { STATED } from "../../generated/games/separate/separate.compiled.ts";

const at = (c: number): Point => ({ x: c % 4, y: (c / 4) | 0 });
const wall = (x: number, y: number): ForcedBorderEdge => ({
  x,
  y,
  dir: 1,
  kind: "wall",
});
const open = (x: number, y: number): ForcedBorderEdge => ({
  x,
  y,
  dir: 2,
  kind: "nowall",
});

const cx = (
  terms: Record<string, number | boolean | number[]>,
  ring: ForcedBorderEdge[],
  outline: number[],
  stripes: number[],
) => ({
  kind: CELL,
  ringKind: EDGE,
  at,
  ring,
  marks: { outline: outline.map(at), stripes: stripes.map(at) },
  terms,
  value: (n: number) => String.fromCharCode(65 + n),
});

const said = (c: Clauses, ...args: Parameters<typeof cx>): string =>
  statedSentence(c, cx(...args)).text;
const basis = (c: Clauses, ...args: Parameters<typeof cx>): string => {
  const again = statedParts(c, cx(...args)).again;
  if (again === undefined) throw new Error("no again clause");
  return again.text;
};

describe("separate hint — the wordings no walk reaches", () => {
  const edges = [wall(0, 0), wall(0, 1)];

  it("says a firing that sets several edges", () => {
    const [lone, one, regions] = STATED.sharedLetter.step;
    expect(said(lone, { letter: 1, anchor: [0] }, edges, [0, 1], [])).toBe(
      "These two Bs can't share a region, so every edge between them must be a wall.",
    );
    expect(said(one, { letter: 0, anchor: [4, 5] }, edges, [0], [4, 5])).toBe(
      "The striped region already holds an A, so the outlined A can't join it: every edge between them must be a wall.",
    );
    expect(said(regions, { letter: 3, anchor: [4, 5] }, edges, [0, 1], [4, 5])).toBe(
      "The striped and outlined regions both hold a D, so they can't join: every edge between them must be a wall.",
    );
    const [apart] = STATED.walledApart.step;
    expect(said(apart, { na: 2, nb: 2, alike: true }, edges, [0, 1], [4, 5])).toBe(
      "A wall already separates the striped and outlined regions, so every other edge between them must be a wall too.",
    );
    const [alone, wide] = STATED.onlyWay.step;
    const grow = (have: number, ways: number) => ({
      letter: 2,
      size: 4,
      have,
      ways,
      multi: ways > 1,
    });
    expect(said(alone, grow(1, 1), [open(0, 0)], [], [0])).toBe(
      "This C is walled in on every side but one, so this edge can't be a wall.",
    );
    expect(said(wide, grow(3, 1), [open(0, 0)], [], [0, 1, 2])).toBe(
      "This region has 3 of its 4 squares and just one way left to grow, so this edge can't be a wall.",
    );
    expect(said(wide, grow(2, 2), [open(0, 0), open(1, 0)], [], [0, 1])).toBe(
      "This region has 2 of its 4 squares and only one region left to grow into, so these edges can't be walls.",
    );
  });

  it("says two lone squares, or two regions, together, and one of each by its noun", () => {
    const [apart] = STATED.walledApart.step;
    const look = (na: number, nb: number): string =>
      said(
        apart,
        { na, nb, alike: (na === 1) === (nb === 1) },
        [wall(0, 0)],
        nb === 1 ? [1] : [1, 2],
        na === 1 ? [0] : [0, 4],
      );
    expect(look(1, 1)).toContain("separates the striped and outlined squares");
    expect(look(2, 2)).toContain("separates the striped and outlined regions");
    expect(look(1, 2)).toContain(
      "separates the striped square and the outlined region",
    );
    expect(look(2, 1)).toContain(
      "separates the striped region and the outlined square",
    );
  });

  it("says what a later leg points back at", () => {
    const [lone, one, regions] = STATED.sharedLetter.step;
    expect(basis(lone, { letter: 1, anchor: [0] }, edges, [0, 1], [])).toBe(
      "the same two Bs",
    );
    expect(basis(one, { letter: 0, anchor: [4, 5] }, edges, [0], [4, 5])).toBe(
      "the same striped region and the outlined square",
    );
    expect(basis(regions, { letter: 0, anchor: [4, 5] }, edges, [0, 1], [4, 5])).toBe(
      "the same striped and outlined regions",
    );
    const [apart] = STATED.walledApart.step;
    const pair = (na: number, nb: number): string =>
      basis(apart, { na, nb, alike: (na === 1) === (nb === 1) }, edges, [0], [4]);
    expect(pair(1, 1)).toBe("the same striped and outlined squares");
    expect(pair(2, 2)).toBe("the same striped and outlined regions");
    expect(pair(1, 2)).toBe("the same striped square and the outlined region");
    expect(pair(2, 1)).toBe("the same striped region and the outlined square");
    expect(
      basis(
        STATED.onlyWay.step[1],
        { letter: 0, size: 4, have: 2, ways: 2, multi: true },
        edges,
        [],
        [0, 1],
      ),
    ).toBe("the same striped region");
  });
});
