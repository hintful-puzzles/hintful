/**
 * The wordings of Path's stated hint that no walk of the word dump reaches:
 * the shorter turns of a weighed step's list of what its ruled-out ways break. Each is rendered from the compiled
 * module's clauses, as the engine renders it.
 */
import { describe, expect, it } from "vitest";
import { CELL, type MarkKind } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { EDGE } from "../../engine/edge-hint.ts";
import { type Clauses, statedSentence } from "../../engine/stated.ts";
import { STATED } from "../../generated/games/path/path.compiled.ts";

type Element = Point | number;
const W = 4;
const at = (c: number): Point => ({ x: c % W, y: (c / W) | 0 });

const said = (
  c: Clauses,
  terms: Record<string, number | boolean | number[]>,
  ring: number[],
): string =>
  statedSentence(c, {
    kind: CELL as unknown as MarkKind<Element>,
    ringKind: EDGE,
    at,
    termKinds: { tried: EDGE as unknown as MarkKind<Element> },
    termAt: { tried: (i) => i },
    ring,
    marks: { outline: [], stripes: [] },
    terms,
    value: String,
  }).text;

describe("path hint — the wordings no walk reaches", () => {
  it("says a weighed step's ruled-out ways, shorter where the list is long", () => {
    const [, pair] = STATED.weighed.step;
    const terms = { c: 5, hasNum: false, num: 0, multi: true };
    const all = 0b11111;
    // Five kinds fit in no words: "break a rule".
    expect(said(pair, { ...terms, why: all }, [4, 6])).toContain("would break a rule,");
    expect(said(pair, { ...terms, why: 0b00001 }, [4, 6])).toBe(
      "Lines on any other two edges of the outlined square would close a loop, so these edges must be lines.",
    );
  });
});
