import { describe, expect, it } from "vitest";
import { CompileError, compileLibrary } from "./compile.ts";
import {
  isFormal,
  isLibrary,
  isPlanning,
  planningWith,
  withEveryVariation,
} from "./description.ts";
import { loadDescriptionFile } from "./load.ts";
import soundnessJson from "./soundness.json" with { type: "json" };
import {
  checkedAs,
  deadEndFingerprint,
  deadEndKey,
  gameFingerprint,
  libraryFingerprint,
  soundnessKey,
} from "./soundness.ts";
import { compiledPath, compileSource, compiles } from "./sources.ts";

const soundness: Record<string, string> = soundnessJson;

const texts = import.meta.glob<string>("../**/*.description.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});
const modules = import.meta.glob<string>("../**/*.compiled.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** From the root, as `npm run describe` names them. */
const fromRoot = (p: string): string => `src/${p.slice("../".length)}`;
const sources = new Map(
  Object.entries(texts).map(([p, t]) => [
    fromRoot(p),
    loadDescriptionFile(t, fromRoot(p)),
  ]),
);
const compiled = new Map(Object.entries(modules).map(([p, m]) => [fromRoot(p), m]));

describe("compiled descriptions", () => {
  it("finds the descriptions that compile", () => {
    expect([...sources.values()].filter(compiles).length).toBeGreaterThan(0);
  });

  for (const [source, file] of sources)
    if (compiles(file))
      it(`${source} is compiled as it reads now (npm run describe)`, () => {
        expect(compiled.get(compiledPath(source))).toBe(compileSource(source, sources));
      });

  it("compiles only techniques checked sound as they read now", () => {
    const unchecked: string[] = [];
    for (const [source, d] of sources) {
      if (isLibrary(d)) {
        for (const id of Object.keys(d.techniques))
          if (
            !checkedAs(libraryFingerprint(d, id), soundness[soundnessKey(source, id)])
          )
            unchecked.push(soundnessKey(source, id));
        continue;
      }
      if (!isFormal(d)) continue;
      // A variation's techniques are compiled too.
      for (const t of withEveryVariation(d).techniques ?? [])
        if (
          !("use" in t) &&
          !checkedAs(gameFingerprint(d, t), soundness[soundnessKey(source, t.id)])
        )
          unchecked.push(soundnessKey(source, t.id));
    }
    // Run `npx vitest run -c research/technique-check/vitest.config.ts
    // describe-check`, which records each technique it finds sound.
    expect(unchecked).toEqual([]);
  });

  it("compiles only dead-end claims checked sound as they read now", () => {
    const unchecked: string[] = [];
    for (const [source, d] of sources) {
      if (!isPlanning(d)) continue;
      for (const { id, src } of planningWith(d, Object.keys(d.variations ?? {}))
        .deadEnds)
        if (soundness[deadEndKey(source, id)] !== deadEndFingerprint(d, src))
          unchecked.push(deadEndKey(source, id));
    }
    // Run `npx vitest run -c research/technique-check/vitest.config.ts
    // dead-end-check`, which records each claim it finds sound.
    expect(unchecked).toEqual([]);
  });

  it("leaves no compiled module without its description", () => {
    const orphans = [...compiled.keys()].filter(
      (m) => ![...sources].some(([s, file]) => compiles(file) && compiledPath(s) === m),
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

  it("keeps a union over a subset's members only while no value is placed", () => {
    // A solve places as it concludes, inside the loop over the subsets, so
    // each member's set kept ahead of the loop is made again after.
    const code = lib(
      "|O| = 0 implies strike(nth(T, 0), 1)",
      "u in units, U = cells(u), T in subsets(U) where |T| = 2, O = set(value(y) over x in T, y in cells(row(x)) where known(y))",
    );
    expect(code).toMatch(/if \(_pp\d+ !== b\.placed\) \{/);
  });

  it("compiles a well-sorted one", () => {
    expect(lib("|cand(c)| = 1 implies place(c, first(cand(c)))")).toContain(
      "export function x(",
    );
  });
});
