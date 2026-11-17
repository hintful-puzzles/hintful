import { describe, expect, it } from "vitest";
import type { DescriptionJson } from "./description.ts";
import { loadDescriptionFile } from "./load.ts";

const rules = (conclude: string, given = "value") => `
game: test
name: Test
family: latin
sizes:
  order: { min: 3, max: 4 }
space:
  grid: { w: "order", h: "order" }
  units: [rows, cols]
answer:
  value: { sort: cell, domain: "range(1, order)" }
given: [${given}]
freedom: { kind: fill }
tiers: [Easy]
techniques:
  - id: t
    tier: Easy
    for: "c in cells"
    conclude:${conclude}
`;

describe("a description's YAML", () => {
  it("loads a description that holds to the schema", () => {
    const d = loadDescriptionFile(
      rules(' "strike(c, 1)"'),
      "t.yaml",
    ) as DescriptionJson;
    expect(d.techniques).toEqual([
      { id: "t", tier: "Easy", for: "c in cells", conclude: "strike(c, 1)" },
    ]);
  });

  it("refuses a formula YAML reads as a map, naming the file and the field", () => {
    expect(() =>
      loadDescriptionFile(rules("\n      forall c in cells: known(c)"), "t.yaml"),
    ).toThrow("t.yaml: /techniques/0/conclude must be string");
  });

  it("refuses one it cannot parse, naming the file", () => {
    expect(() =>
      loadDescriptionFile(rules(" forall c in cells: known(c)"), "t.yaml"),
    ).toThrow(/^t\.yaml: Nested mappings/);
  });

  it("reads `no` as a string, under YAML 1.2's core schema", () => {
    const d = loadDescriptionFile(rules(' "strike(c, 1)"', "no"), "t.yaml");
    expect((d as DescriptionJson).given).toEqual(["no"]);
  });

  describe("a phrase", () => {
    const withSteps = (phrases: string, terms = "{ col: flag }") =>
      `${rules(' "strike(c, 1)"')}phrases:\n${phrases}\nsteps:\n  s:\n    ring: cell\n    terms: ${terms}\n    look: "this {line} is {line}"\n    move: "{ring} must be 1"\n`;

    it("is put in place of its name in a clause, a phrase inside it too", () => {
      const d = loadDescriptionFile(
        withSteps('  line: "{if col: {colWord} | row}"\n  colWord: "column"'),
        "p.yaml",
      ) as DescriptionJson;
      expect(d.steps?.["s"]?.look).toBe(
        "this {if col: column | row} is {if col: column | row}",
      );
      expect(d.steps?.["s"]?.move).toBe("{ring} must be 1");
    });

    it("is refused where it says itself", () => {
      expect(() =>
        loadDescriptionFile(
          withSteps('  line: "a {other}"\n  other: "{line}"'),
          "p.yaml",
        ),
      ).toThrow("p.yaml: phrase line says itself (line > other > line)");
    });

    it("is refused where a term has its name", () => {
      expect(() =>
        loadDescriptionFile(withSteps('  line: "row"', "{ line: flag }"), "p.yaml"),
      ).toThrow("p.yaml: a term named line is shadowed by the phrase of that name");
    });
  });

  describe("a break clause", () => {
    const withBreaks = (forClause: string, terms = "{ c: c }") =>
      `${rules(' "strike(c, 1)"')
        .replace('for: "c in cells"', `for: "${forClause}"`)
        .replace(
          'conclude: "strike(c, 1)"',
          `conclude: "strike(c, 1)"\n    says:\n      terms: ${terms}\n      marks: {}\n      look: "a 1 here would {broke}"\n      move: "it must go"`,
        )}define:\n  near(c): "exists d in adj4(c): crowd(d) or full(d)"\nbreaks:\n  full(d):\n    when: "known(d)"\n    look: "fill it"\n  crowd(d):\n    when: "value(d) = 1"\n    terms: { at: d }\n    look: "crowd {outline at: the outlined square}"\n`;

    it("is a definition, and {broke} says each break the formula reads", () => {
      const d = loadDescriptionFile(
        withBreaks("c in cells where near(c)"),
        "b.yaml",
      ) as DescriptionJson;
      expect(d.define?.["full(d)"]).toBe("known(d)");
      const [t] = d.techniques ?? [];
      if (t === undefined || !("says" in t) || t.says === undefined)
        throw new Error("no says");
      // In the order the breaks are declared, the last said where no other held.
      expect(t.says.look).toBe(
        "a 1 here would {if brokeFull: fill it | crowd {outline at: the outlined square}}",
      );
      expect(t.says.terms).toEqual({
        c: "c",
        brokeFull: { broke: "full", term: null },
        at: { broke: "crowd", term: "at" },
      });
      expect(t.says.witness).toBe(true);
    });

    it("is refused for a technique whose formula reads none", () => {
      expect(() => loadDescriptionFile(withBreaks("c in cells"), "b.yaml")).toThrow(
        "b.yaml: t says {broke}, and its formula reads no break",
      );
    });

    it("is refused where its term is named as the technique's own", () => {
      expect(() =>
        loadDescriptionFile(
          withBreaks("c in cells where near(c)", "{ at: c }"),
          "b.yaml",
        ),
      ).toThrow("b.yaml: t: a break's term at is also its own");
    });
  });

  it("refuses a field the schema does not name", () => {
    expect(() =>
      loadDescriptionFile(
        `game: test\nhelp: { rules: a, controls: b, hint: c }\n`,
        "h.yaml",
      ),
    ).toThrow("h.yaml: /help must NOT have additional properties (hint)");
  });
});
