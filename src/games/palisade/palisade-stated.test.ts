/**
 * The wordings of Palisade's stated hint that no walk of the word dump reaches:
 * a 0 clue, an edge that shares a fate with none, the general bound of two
 * neighboring clues, and what a later leg points back at. Each is rendered from
 * the compiled module's clauses, as the engine renders it.
 */
import { describe, expect, it } from "vitest";
import { EDGE, type ForcedBorderEdge } from "../../engine/border-grid-hint.ts";
import { CELL } from "../../engine/hint-words.ts";
import { type Clauses, statedParts, statedSentence } from "../../engine/stated.ts";
import type { Point } from "../../engine/types.ts";
import { STATED } from "./palisade.compiled.ts";

const at = (c: number): Point => ({ x: c % 4, y: (c / 4) | 0 });
const edge = (kind: "wall" | "nowall", x = 0, y = 0): ForcedBorderEdge => ({
  x,
  y,
  dir: kind === "wall" ? 1 : 2,
  kind,
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
  value: String,
});

const said = (c: Clauses, ...args: Parameters<typeof cx>): string =>
  statedSentence(c, cx(...args)).text;
const basis = (c: Clauses, ...args: Parameters<typeof cx>): string => {
  const again = statedParts(c, cx(...args)).again;
  if (again === undefined) throw new Error("no again clause");
  return again.text;
};

describe("palisade hint — the wordings no walk reaches", () => {
  const one = [edge("nowall")];
  const two = [edge("nowall"), edge("nowall", 0, 1)];

  it("says a 0 clue", () => {
    const [zero] = STATED.numberExhausted.step;
    const terms = { clue: 0, wall: false };
    expect(said(zero, { ...terms, multi: false }, one, [0], [])).toBe(
      "Clue 0 allows no walls, so this edge can't be one.",
    );
    expect(said(zero, { ...terms, multi: true }, two, [0], [])).toBe(
      "Clue 0 allows no walls, so none of its remaining edges can be walls.",
    );
  });

  it("says an edge that borders a region on its own", () => {
    const [clauses] = STATED.equivalentEdges.step;
    const terms = (wall: boolean) => ({ clue: 2, wall, multi: false });
    expect(said(clauses, terms(true), [edge("wall")], [], [1, 2])).toBe(
      "This edge borders a region clue 2 can't fully open, so it must be a wall.",
    );
    expect(said(clauses, terms(false), one, [], [1, 2])).toBe(
      "This edge borders a region clue 2 can't wall off, so it can't be a wall.",
    );
  });

  it("says the general bound of two neighboring clues", () => {
    const [, general] = STATED.cluesVersusRegionSize.step;
    expect(
      said(general, { c: 2, d: 3, size: 2, bound: 3 }, [edge("wall")], [0, 1], []),
    ).toBe(
      "These clues would need a shared region of at least 3 squares, so the edge between them must be a wall.",
    );
  });

  it("says what a later leg points back at", () => {
    const [two3s, general] = STATED.cluesVersusRegionSize.step;
    const terms = { c: 3, d: 3, size: 5, bound: 2 };
    expect(basis(two3s, terms, two, [0, 1], [])).toBe("the same outlined clues");
    expect(basis(general, terms, two, [0, 1], [])).toBe("the same outlined clues");
    expect(
      basis(STATED.notTooBig.step[0], { joined: 6, size: 5 }, two, [0, 1], []),
    ).toBe("the same outlined regions");
    expect(basis(STATED.noDanglingEdges.step[0], {}, two, [0, 1, 4, 5], [])).toBe(
      "the same outlined corner",
    );
    expect(basis(STATED.inside.step[0], {}, two, [], [0, 1])).toBe(
      "the same striped region",
    );
    expect(
      basis(
        STATED.numberExhausted.step[0],
        { clue: 0, wall: false, multi: true },
        two,
        [0],
        [],
      ),
    ).toBe("clue 0");
  });
});
