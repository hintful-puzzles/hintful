import { describe, expect, it } from "vitest";
import { CompileError, compileLibrary } from "./compile.ts";
import type { DescriptionJson, LibraryJson } from "./description.ts";
import soundnessJson from "./soundness.json" with { type: "json" };
import { gameFingerprint, libraryFingerprint, soundnessKey } from "./soundness.ts";
import { compiledPath, compileSource } from "./sources.ts";

const soundness: Record<string, string> = soundnessJson;

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

  it("compiles only techniques checked sound as they read now", () => {
    const unchecked: string[] = [];
    for (const [source, json] of sources) {
      if (typeof json !== "object" || json === null) continue;
      if ("library" in json) {
        const lib = json as LibraryJson;
        for (const id of Object.keys(lib.techniques))
          if (soundness[soundnessKey(source, id)] !== libraryFingerprint(lib, id))
            unchecked.push(soundnessKey(source, id));
        continue;
      }
      const d = json as DescriptionJson;
      for (const t of d.techniques ?? [])
        if (
          !("use" in t) &&
          soundness[soundnessKey(source, t.id)] !== gameFingerprint(d, t)
        )
          unchecked.push(soundnessKey(source, t.id));
    }
    // Run `npx vitest run -c research/technique-check/vitest.config.ts
    // describe-check`, which records each technique it finds sound.
    expect(unchecked).toEqual([]);
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
