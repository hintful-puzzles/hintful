import { describe, expect, it } from "vitest";
import { parse } from "./expr.ts";

describe("the formula syntax", () => {
  it("parses a quantifier's binders, filters and body", () => {
    const e = parse("forall c2 in u - {c} where known(c2): d not in cand(c2)");
    expect(e.k).toBe("quant");
    if (e.k !== "quant") return;
    expect(e.binders).toHaveLength(1);
    expect(e.binders[0].where).not.toBeNull();
    expect(e.body).toMatchObject({ k: "bin", op: "notin" });
  });

  it("reads a comma inside a call as an argument, not a binder", () => {
    const e = parse("count(c in sight(s) where index(c, L) < 2)");
    expect(e).toMatchObject({ k: "agg", fn: "count" });
  });

  it("parses several binders with lets", () => {
    const e = parse("exists k in clues(greater), big = v(k), d in cand(big): true");
    expect(e.k === "quant" && e.binders.map((b) => b.kind)).toEqual([
      "in",
      "let",
      "in",
    ]);
  });

  it("refuses what it cannot read, naming where", () => {
    expect(() => parse("forall c in cells value(c)")).toThrow(/expected ":"/);
  });
});
