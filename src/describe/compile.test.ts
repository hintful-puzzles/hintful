import { describe, expect, it } from "vitest";
import { CompileError, compileLibrary } from "./compile.ts";
import { compiledPath, compileSource } from "./sources.ts";

const descriptions = import.meta.glob<unknown>("../**/*.description.json", {
  eager: true,
  import: "default",
});
const modules = import.meta.glob<string>("../**/*.compiled.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** From the root, as `npm run describe` names them. */
const fromRoot = (p: string): string => `src/${p.slice("../".length)}`;
const sources = new Map(Object.entries(descriptions).map(([p, j]) => [fromRoot(p), j]));
const compiled = new Map(Object.entries(modules).map(([p, m]) => [fromRoot(p), m]));

describe("compiled descriptions", () => {
  it("finds the descriptions", () => {
    expect(sources.size).toBeGreaterThan(0);
  });

  for (const source of sources.keys())
    it(`${source} is compiled as it reads now (npm run describe)`, () => {
      expect(compiled.get(compiledPath(source))).toBe(compileSource(source, sources));
    });

  it("leaves no compiled module without its description", () => {
    const orphans = [...compiled.keys()].filter(
      (m) => ![...sources.keys()].some((s) => compiledPath(s) === m),
    );
    expect(orphans).toEqual([]);
  });
});

describe("the compiler refuses an ill-sorted technique", () => {
  const lib = (conclude: string, forClause = "c in cells") =>
    compileLibrary(
      { library: "t", techniques: { x: { for: forClause, conclude } } },
      "t",
      "./runtime.ts",
    );
  it.each([
    ["an unknown name", "strike(c, nowhere)"],
    ["an unknown function", "strike(c, frob(c))"],
    ["a cell where a value goes", "strike(c, c)"],
    ["a line where a cell goes", "strike(row(c), 1)"],
    ["a set compared with a number", "|cand(c)| = cand(c)"],
  ])("%s", (_, conclude) => {
    expect(() => lib(conclude)).toThrow(CompileError);
  });

  it("and a strike outside a conclusion", () => {
    expect(() => lib("true", "c in cells where strike(c, 1)")).toThrow(CompileError);
  });

  it("compiles a well-sorted one", () => {
    expect(lib("|cand(c)| = 1 implies place(c, first(cand(c)))")).toContain(
      "export function x(",
    );
  });
});
