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

  it("refuses a field the schema does not name", () => {
    expect(() =>
      loadDescriptionFile(
        `game: test\nhelp: { rules: a, controls: b, hint: c }\n`,
        "h.yaml",
      ),
    ).toThrow("h.yaml: /help must NOT have additional properties (hint)");
  });
});
