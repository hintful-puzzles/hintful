/**
 * The reference panel's narrowing: search, groups and filters as the model
 * asks.
 */
import { describe, expect, it } from "vitest";
import type { ReferenceItem, ReferenceModel } from "../engine/contract/types.ts";
import { type FilterButton, narrowReference } from "./reference-filter.ts";

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
    {
      heading: "A",
      group: null,
      items: [word("acid", "ruledOut"), word("aloe", "outstanding")],
    },
    {
      heading: "C",
      group: null,
      items: [word("cigar", "outstanding"), word("circa", "ruledOut")],
    },
  ],
  selected: null,
  hinted: [],
};

/** Words of two lengths, a group each. */
const GROUPED: ReferenceModel = {
  ...MODEL,
  sections: [
    {
      heading: "C",
      group: "3 letters",
      items: [word("cat", "outstanding"), word("cot", "ruledOut")],
    },
    { heading: "T", group: "3 letters", items: [word("tan", "ruledOut")] },
    {
      heading: "C",
      group: "4 letters",
      items: [word("cats", "outstanding"), word("coat", "outstanding")],
    },
  ],
};

const keys = (sections: ReturnType<typeof narrowReference>["sections"]) =>
  sections.map((s) => [s.heading, s.items.map((i) => i.key)]);

const view = (query: string, filter: number, group = 0) => ({ query, filter, group });

/** A row as `label count`, the pressed one starred. */
const row = (buttons: readonly FilterButton[]) =>
  buttons.map((b) => `${b.pressed ? "*" : ""}${b.label} ${b.count}`);

describe("narrowReference", () => {
  it("shows everything under All with no search, and counts each filter", () => {
    const n = narrowReference(MODEL, view("", 0));
    expect(keys(n.sections)).toEqual([
      ["A", ["acid", "aloe"]],
      ["C", ["cigar", "circa"]],
    ]);
    expect(n.groups).toEqual([]);
    expect(row(n.buttons)).toEqual(["*All 4", "Fits 2"]);
  });

  it("keeps the label's substring, case ignored, and the pressed filter's statuses", () => {
    const n = narrowReference(MODEL, view(" Ci", 1));
    // ACID contains "ci" too, but is ruled out; its section goes.
    expect(keys(n.sections)).toEqual([["C", ["cigar"]]]);
    expect(row(n.buttons)).toEqual(["All 3", "*Fits 1"]);
  });

  it("offers no buttons where the model declares no filter", () => {
    const n = narrowReference({ ...MODEL, filters: [] }, view("", 0));
    expect(n.buttons).toEqual([]);
    expect(n.sections).toHaveLength(2);
  });

  it("shows the first group's sections, with a button a group", () => {
    const n = narrowReference(GROUPED, view("", 0));
    expect(keys(n.sections)).toEqual([
      ["C", ["cat", "cot"]],
      ["T", ["tan"]],
    ]);
    expect(row(n.groups)).toEqual(["*3 letters 3", "4 letters 2"]);
    expect(row(n.buttons)).toEqual(["*All 3", "Fits 1"]);
  });

  it("counts each row under the other row's choice and the search", () => {
    const n = narrowReference(GROUPED, view("c", 1, 1));
    expect(keys(n.sections)).toEqual([["C", ["cats", "coat"]]]);
    // The groups count what fits and holds "c"; the filters, the 4-letter words.
    expect(row(n.groups)).toEqual(["3 letters 1", "*4 letters 2"]);
    expect(row(n.buttons)).toEqual(["All 2", "*Fits 2"]);
  });

  it("falls back to the first group where a new board has fewer", () => {
    const n = narrowReference(GROUPED, view("", 0, 5));
    expect(row(n.groups)).toEqual(["*3 letters 3", "4 letters 2"]);
    expect(keys(n.sections)).toEqual([
      ["C", ["cat", "cot"]],
      ["T", ["tan"]],
    ]);
  });
});
