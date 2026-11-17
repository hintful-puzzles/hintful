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
    items: "stars",
    restWord: "must be empty",
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
        terms: { n: "n", s: "stars" },
        marks: { stripes: "cells(r)", reads: "cells(r)" },
        move: "{ring: the ringed {noun} | each ringed {noun}} must be empty",
        // The `zero` wording, left `false`, is never said, so it is left out.
        wordings: [{ look: "{stripes: this region} already has its two" }],
      },
      plant: { for: "r in region, n = need(cells(r)) where n <= 1" },
    });
  });

  it("keeps a wording whose condition the game gives", () => {
    const t = expandKind({ ...met, with: { ...met.with, zero: "n0" } }, "x");
    expect((t["says"] as { wordings: { when?: string }[] }).wordings).toMatchObject([
      { when: "n0", look: "{stripes: this region} takes no stars" },
      { look: "{stripes: this region} already has its two" },
    ]);
  });

  it("reads a parameter the game said once, a placement's own winning", () => {
    const { rest: _r, has: _h, ...own } = met.with;
    const words = { rest: 2, has: "its two", restWord: "ignored", extra: "not taken" };
    const t = expandKind({ ...met, with: own }, "x", words);
    expect(t).toMatchObject({ conclude: expect.stringContaining("place(c, 2)") });
    const look = (t: Record<string, unknown>) =>
      (t["says"] as { wordings: { look: string }[] }).wordings[0].look;
    expect(look(t)).toBe("{stripes: this region} already has its two");
    const over = expandKind({ ...met, with: { ...own, has: "its pair" } }, "x", words);
    expect(look(over)).toBe("{stripes: this region} already has its pair");
  });

  it("fills a default from the game's parameters, and a game's own wins", () => {
    expect(expandKind(met, "x")["for"]).toBe(
      "r in region, n = need(cells(r)) where n <= 0",
    );
    const own = { ...met.with, need: "clue(r) - held(r)", restMove: "strike(c, 1)" };
    const struck = expandKind({ ...met, with: own }, "x");
    expect(struck["for"]).toBe("r in region, n = clue(r) - held(r) where n <= 0");
    expect(struck["conclude"]).toBe(
      "n = 0 and forall c in open(cells(r)): strike(c, 1)",
    );
  });

  it("takes terms said once, a placement's own winning", () => {
    const words = { terms: { s: "one", t: "two" } };
    const t = expandKind(
      { ...met, with: { ...met.with, terms: { s: "own" } } },
      "x",
      words,
    );
    expect((t["says"] as { terms: object }).terms).toEqual({
      n: "n",
      s: "own",
      t: "two",
    });
  });

  it("fills a default from a parameter whose own default is null, or refuses", () => {
    const place = { kind: "one.place", as: "p", tier: "Easy" };
    const t = expandKind(
      { ...place, with: { group: "d in domain", set: "cells", value: "d" } },
      "x",
    );
    expect(t["for"]).toBe(
      "d in domain, k = count(c in cells where not known(c) and d in cand(c)) where k < 2",
    );
    expect(t["conclude"]).toContain(": place(c, d))");
    expect(() =>
      expandKind({ ...place, with: { group: "d in domain", set: "cells" } }, "x"),
    ).toThrow(/missing value/);
  });

  it("refuses a parameter missing, or one the kind does not have", () => {
    const { rest: _r, ...short } = met.with;
    expect(() => expandKind({ ...met, with: short }, "x")).toThrow(/missing rest/);
    const { unit: _u, ...unnamed } = met.with;
    expect(() => expandKind({ ...met, with: unnamed }, "x")).toThrow(/missing unit/);
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

  it("asks a predicate of each value, the game's @ read as it", () => {
    const t = expandKind(
      {
        kind: "ways.note",
        as: "note",
        tier: "Easy",
        with: { group: "c in cells", fits: "fits(c, e, @, L)" },
      },
      "x",
    );
    expect(t["for"]).toBe(
      "c in cells, e in edges(c) where not known(e), A = fits(c, e, 1, L), B = fits(c, e, 2, L) where not A or not B",
    );
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

  /** What a game names once for every flip-check it places. */
  const FLIP_WORDS = {
    flipTerms: { hor: "a = 2", own: "true" },
    flipCell: "{ring}",
    flipped: "{if hor: across | down}",
  };

  it("wraps a `holds` so that an `or` in it binds inside the kind", () => {
    const t = expandKind(
      {
        kind: "fit.flip",
        as: "f",
        tier: "Easy",
        with: { group: "k in cells", holds: "a or b", scope: "cells", ...FLIP_WORDS },
      },
      "x",
    );
    expect(t["conclude"]).toMatch(/^\(a or b\) and /);
    expect(t["conclude"]).toContain("not (a or b)");
  });

  it("lays a game's says over the kind's frame, the game's words winning", () => {
    const t = expandKind(
      {
        kind: "fit.flip",
        as: "f",
        tier: "Easy",
        with: { group: "k in cells", holds: "h", scope: "cells", ...FLIP_WORDS },
        says: {
          terms: { clue: "k" },
          fact: { terms: { size: "1", hor: "a = 1" }, look: "it breaks" },
        },
      },
      "x",
    );
    expect(t["says"]).toEqual({
      shown: "legs",
      terms: { clue: "k" },
      fact: {
        terms: { hor: "a = 1", own: "true", size: "1" },
        move: "{ring} must be {if hor: across | down}",
        look: "it breaks",
      },
    });
  });

  /** Two counts compared, as Mines places them, with no words. */
  const compare = {
    kind: "count.compare",
    as: "pair",
    tier: "Easy",
    with: {
      group: "a in cells, b in adj4(a)",
      openA: "open(a)",
      openB: "open(b)",
      least: "need(a)",
      most: "need(b)",
      fill: 1,
      rest: 2,
    },
  };

  it("lays no frame where the game gives no words, its hint narrating", () => {
    expect(expandKind(compare, "x")).not.toHaveProperty("says");
  });

  it("places a worded kind silent on says: false, wanting only what its formula reads", () => {
    const both = {
      kind: "count.both",
      as: "alone",
      tier: "Normal",
      with: {
        group: "k in clues(count), c = at(k)",
        set: "adj8(c)",
        need: "need(c)",
        rest: 2,
        fill: 1,
      },
    };
    expect(() => expandKind(both, "x")).toThrow(/missing unit, has, items/);
    const t = expandKind({ ...both, says: false }, "x");
    expect(t).not.toHaveProperty("says");
    expect(t["for"]).toContain("|open(adj8(c))|");
    expect(() =>
      expandKind(
        { ...both, with: { group: "c in cells", rest: 2, fill: 1 }, says: false },
        "x",
      ),
    ).toThrow(/missing set$/);
  });

  it("refuses a frame's word the game left unfilled", () => {
    const says = { arms: { more: { look: "a" }, same: { look: "b" } } };
    expect(() => expandKind({ ...compare, says }, "x")).toThrow(/missing .*outsideB/);
    const words = { fillWord: "f", restWord: "r", outsideA: "oa", outsideB: "ob" };
    const t = expandKind(
      { ...compare, with: { ...compare.with, ...words }, says },
      "x",
    );
    expect(t["says"]).toMatchObject({
      terms: { by: "by" },
      arms: {
        more: { when: "|RA| > 0", look: "a", move: expect.stringContaining(" ob f") },
      },
    });
  });

  it("leaves out the kind's look where the game words the step and gives none of its words", () => {
    const sign = {
      kind: "rel.support",
      as: "sign",
      tier: "Normal",
      with: { group: "k in signs", end: "a", partner: "b", rel: "u < d", marks: {} },
    };
    expect(() => expandKind(sign, "x")).toThrow(/missing .*link/);
    const t = expandKind({ ...sign, says: { fact: { look: "own" } } }, "x");
    expect(t["says"]).toEqual({
      terms: { partner: "b" },
      marks: {},
      fact: { look: "own" },
    });
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
    with: { group: "r in region", set: "cells(r)", rest: 2, unit: this region, has: its two, items: stars, restWord: must be empty }
`;
    const file = loadDescriptionFile(text, "probe");
    const ts = isFormal(file) ? (file.techniques ?? []) : [];
    expect(ts.map((t) => ("id" in t ? t.id : t.use))).toEqual(["full"]);
  });
});
