import { describe, expect, it } from "vitest";
import { isFormal } from "./description.ts";
import { expandKind, KINDS, KindError } from "./kinds.ts";
import { loadDescriptionFile } from "./load.ts";

const met = {
  kind: "count.met",
  as: "full",
  tier: "Easy",
  with: {
    group: "r in region",
    set: "cells(r)",
    rest: 2,
    unit: "this region",
    has: "its two",
    restWord: "be empty",
    terms: { s: "stars" },
  },
};

describe("a kind of rule expands to the technique it stands for", () => {
  it("fills the game's nouns in and keeps the placing", () => {
    const t = expandKind(met, "x");
    expect(t).toMatchObject({
      id: "full",
      tier: "Easy",
      for: "r in region, n = need(cells(r)) where n <= 0",
      conclude: "n = 0 and forall c in open(cells(r)): place(c, 2)",
      says: {
        terms: { s: "stars" },
        look: "{stripes: this region} has its two",
        move: "{ring} must be empty",
      },
      plant: { for: "r in region, n = need(cells(r)) where n <= 1" },
    });
  });

  it("reads a parameter the game said once, a placement's own winning", () => {
    const { rest: _r, has: _h, ...own } = met.with;
    const words = { rest: 2, has: "its two", restWord: "ignored", extra: "not taken" };
    const t = expandKind({ ...met, with: own }, "x", words);
    expect(t).toMatchObject({ conclude: expect.stringContaining("place(c, 2)") });
    expect(t["says"]).toMatchObject({ look: "{stripes: this region} has its two" });
    const over = expandKind({ ...met, with: { ...own, has: "its pair" } }, "x", words);
    expect(over["says"]).toMatchObject({ look: "{stripes: this region} has its pair" });
  });

  it("refuses a parameter missing, or one the kind does not have", () => {
    const { rest: _r, ...short } = met.with;
    expect(() => expandKind({ ...met, with: short }, "x")).toThrow(/missing rest/);
    expect(() => expandKind({ ...met, with: { ...met.with, no: "x" } }, "x")).toThrow(
      /no no/,
    );
    expect(() => expandKind({ ...met, kind: "count.nope" }, "x")).toThrow(KindError);
  });

  it("is a plant that differs from the statement, for every kind", () => {
    for (const [name, k] of Object.entries(KINDS))
      expect(
        k.plant.for !== k.technique.for || k.plant.conclude !== k.technique.conclude,
        name,
      ).toBe(true);
  });

  it("takes no `with` where a kind has no parameters, and the game's own words", () => {
    const says = { terms: { c: "c" }, marks: {} };
    const t = expandKind({ kind: "one.cell", as: "lone", tier: "Easy", says }, "x");
    expect(t).toMatchObject({
      id: "lone",
      says,
      for: expect.stringContaining("cand(c)"),
    });
    expect(
      expandKind({ kind: "one.cell", as: "lone", tier: "Easy" }, "x"),
    ).not.toHaveProperty("says");
  });

  it("wraps a `holds` so that an `or` in it binds inside the kind", () => {
    const t = expandKind(
      {
        kind: "fit.flip",
        as: "f",
        tier: "Easy",
        with: { group: "k in cells", holds: "a or b", scope: "cells" },
      },
      "x",
    );
    expect(t["conclude"]).toMatch(/^\(a or b\) and /);
    expect(t["conclude"]).toContain("not (a or b)");
  });

  it("is read by the loader where a description places one", () => {
    const text = `
game: probe
help: { rules: r, controls: c, origins: o, hints: h }
name: Probe
family: shading
sizes: { w: { min: 4, max: 8 } }
space: { grid: { w: w, h: w }, regions: { region: dealt }, units: [] }
answer: { value: { sort: cell, domain: "range(1, 2)" } }
shape: []
freedom: { kind: fill }
tiers: [Easy]
techniques:
  - kind: count.met
    as: full
    tier: Easy
    with: { group: "r in region", set: "cells(r)", rest: 2, unit: this region, has: its two, restWord: be empty }
`;
    const file = loadDescriptionFile(text, "probe");
    const ts = isFormal(file) ? (file.techniques ?? []) : [];
    expect(ts.map((t) => ("id" in t ? t.id : t.use))).toEqual(["full"]);
  });
});
