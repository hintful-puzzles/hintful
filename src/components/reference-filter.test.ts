/**
 * The reference panel's narrowing: search and filters as the model asks.
 */
import { describe, expect, it } from "vitest";
import type { ReferenceItem, ReferenceModel } from "../engine/types.ts";
import { narrowReference } from "./reference-filter.ts";

const word = (w: string, status: ReferenceItem["status"]): ReferenceItem => ({
  key: w,
  label: w.toUpperCase(),
  status,
});

const MODEL: ReferenceModel = {
  instructions: "",
  search: true,
  filters: [{ label: "Fits", statuses: ["outstanding"] }],
  sections: [
    { heading: "A", items: [word("acid", "ruledOut"), word("aloe", "outstanding")] },
    { heading: "C", items: [word("cigar", "outstanding"), word("circa", "ruledOut")] },
  ],
  selected: null,
  hinted: [],
};

const keys = (sections: ReturnType<typeof narrowReference>["sections"]) =>
  sections.map((s) => [s.heading, s.items.map((i) => i.key)]);

describe("narrowReference", () => {
  it("shows everything under All with no search, and counts each filter", () => {
    const n = narrowReference(MODEL, "", 0);
    expect(keys(n.sections)).toEqual([
      ["A", ["acid", "aloe"]],
      ["C", ["cigar", "circa"]],
    ]);
    expect(n.buttons).toEqual([
      { label: "All", count: 4 },
      { label: "Fits", count: 2 },
    ]);
  });

  it("keeps the label's substring, case ignored, and the pressed filter's statuses", () => {
    const n = narrowReference(MODEL, " Ci", 1);
    // ACID contains "ci" too, but is ruled out; its section goes.
    expect(keys(n.sections)).toEqual([["C", ["cigar"]]]);
    expect(n.buttons).toEqual([
      { label: "All", count: 3 },
      { label: "Fits", count: 1 },
    ]);
  });

  it("offers no buttons where the model declares no filter", () => {
    const n = narrowReference({ ...MODEL, filters: [] }, "", 0);
    expect(n.buttons).toEqual([]);
    expect(n.sections).toHaveLength(2);
  });
});
