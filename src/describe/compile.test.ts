import { describe, expect, it } from "vitest";
import { CompileError, compileLibrary } from "./compile.ts";
import {
  isFormal,
  isLibrary,
  isPlanning,
  parseTechnique,
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

describe("a function's fresh names are its own", () => {
  // A name taken in one function renumbered every function after it, so a
  // compiled diff could not show which functions a change touched.
  it("an edit to one technique changes that technique's code alone", () => {
    const source = "src/games/filling/filling.description.yaml";
    const filling = sources.get(source);
    if (filling === undefined || !isFormal(filling)) throw new Error(`${source} moved`);
    const first = (filling.techniques ?? [])[0];
    if (first === undefined || !("id" in first)) throw new Error(`${source} changed`);
    const all = new Map(sources);
    all.set(source, {
      ...filling,
      techniques: (filling.techniques ?? []).map((t) =>
        t === first
          ? {
              ...first,
              conclude: `count(c in cells where not known(c)) >= 0 and ${first.conclude}`,
            }
          : t,
      ),
    });
    const blocks = (code: string): Set<string> => new Set(code.split("\n\n"));
    const before = blocks(compileSource(source, sources));
    const moved = [...blocks(compileSource(source, all))].filter((b) => !before.has(b));
    expect(moved.length).toBeGreaterThan(0);
    expect(moved.filter((b) => !b.includes(`function ${first.id}(`))).toEqual([]);
  });
});

describe("a wide domain's numbers are never a mask", () => {
  // Ascent's numbers run past 31, so a set of them built as 32 bits wraps.
  const source = "src/games/ascent/ascent.description.yaml";
  const ascent = sources.get(source);
  const withNextTo = (forClause: string, conclude: string): string => {
    if (ascent === undefined || !isFormal(ascent)) throw new Error(`${source} moved`);
    const techniques = (ascent.techniques ?? []).map((t) =>
      "id" in t && t.id === "nextTo" ? { ...t, for: forClause, conclude } : t,
    );
    const all = new Map(sources);
    all.set(source, { ...ascent, techniques });
    return compileSource(source, all);
  };
  const near = "c in cells where known(c) and open(c)";
  it.each([
    [
      "a set literal of numbers",
      `${near}, M = {value(c) - 1, value(c) + 1}`,
      "|M| = 2",
    ],
    ["a range as a set", `${near}, M = range(1, top)`, "|M| > 0"],
    ["a domain's size", near, "|domain| > 0"],
    [
      "a set of values gathered",
      `${near}, M = set(value(p) over p in cells where known(p))`,
      "|M| > 0",
    ],
  ])("refuses %s", (_, forClause, conclude) => {
    expect(() => withNextTo(forClause, conclude)).toThrow(/wide domain/);
  });

  it("binds a literal's members one by one", () => {
    expect(
      withNextTo(
        `${near}, m in {value(c) - 1, value(c) + 1} where m >= 1 and m <= top`,
        "forall p in cells where m in cand(p) and not near(p, c, 1): strike(p, m)",
      ),
    ).not.toMatch(/1 << /);
  });
});

describe("a technique states how its dearest read grows with the board", () => {
  const lib = (forClause: string) =>
    compileLibrary(
      { library: "t", techniques: { x: { for: forClause, conclude: "strike(c, 1)" } } },
      "t",
      "./runtime.ts",
    );
  it.each([
    ["one cell's candidates", "c in cells where |cand(c)| = 1", "n"],
    [
      "a count over the board per cell",
      "c in cells where count(d in cells where known(d)) = 1",
      "n^2",
    ],
    [
      "a count over its line per cell",
      "c in cells where count(d in cells(row(c)) where known(d)) = 1",
      "n^1.5",
    ],
  ])("%s", (_, forClause, growth) => {
    expect(lib(forClause)).toContain(`grows with the board as ${growth}.`);
  });

  it("and refuses one past the steepest allowed", () => {
    expect(() =>
      lib(
        "c in cells, d in cells, e in cells where count(f in cells where known(f)) = 1",
      ),
    ).toThrow(/grows with the board as n\^4/);
  });
});

describe("a stated clause names only what its technique states", () => {
  const stated = (says: Record<string, unknown>): string =>
    compileLibrary(
      {
        library: "t",
        techniques: {
          x: {
            for: "c in cells where known(c), n = |{d in adj4(c) where known(d)}|",
            conclude: "forall d in adj4(c): strike(d, 1) and strike(c, 2)",
            says: {
              terms: { n: "n", near: "adj4(c)" },
              marks: { outline: "{c}" },
              ...says,
            },
          },
        },
      },
      "t",
      "./runtime.ts",
    );

  it("so a number term, a lexicon word and a role it marks are said", () => {
    expect(() =>
      stated({
        look: "{outline: the outlined {noun}} has {n} {shaded} {outline near: neighbor | neighbors}",
        move: "{ring} must be {unshaded}",
      }),
    ).not.toThrow();
  });

  it.each([
    ["a term it does not state", { look: "{m} is it" }, /says look says \{m\}/],
    ["a set said as a number", { look: "{near} is it" }, /says look says \{near\}/],
    ["a role it marks nothing in", { look: "{stripes} is it" }, /marks nothing in/],
    [
      "a number as a reference",
      { look: "{outline n} is it" },
      /n is no term of elements/,
    ],
    ["a word only a reference says", { look: "{each} is it" }, /says \{each\}/],
    [
      "a malformed slot",
      { look: "{outline n: a | b | c} is it" },
      /more than two forms/,
    ],
  ])("and refuses %s", (_, says, error) => {
    expect(() => stated(says)).toThrow(error);
  });

  it("a fact's wording is read where the fact is made, and typed", () => {
    const code = compileLibrary(
      {
        library: "t",
        techniques: {
          x: {
            for: "c in cells where known(c)",
            conclude: "forall d in adj4(c): strike(d, 1)",
            says: {
              terms: {},
              marks: {},
              fact: {
                terms: { at: "d" },
                wordings: [
                  { when: "x(d) = x(c)", look: "{outline at} is above or below" },
                  { look: "{outline at} is beside" },
                ],
              },
            },
          },
        },
      },
      "t",
      "./runtime.ts",
    );
    expect(code).toContain("  wording: number;");
    expect(code).toMatch(
      /xFactSays\.push\(\{ wording: \(.* \? 0 : 1\), terms: \{ at: v_d \}/,
    );
  });

  it("a firing's wording reads its terms and marks by name", () => {
    const code = stated({
      wordings: [
        { when: "n > 2", look: "{outline: the crowded square}" },
        { when: "|outline| > 1", look: "{outline: the squares}" },
      ],
      look: "{outline: the outlined {noun}}",
      move: "{ring} must be {unshaded}",
    });
    expect(code).toContain("const _sw_n = ");
    expect(code).toContain("const _sw_outline = ");
    expect(code).toMatch(
      /wording: \(\(_sw_n > 2\) \? 0 : \(_sw_outline\.length > 1\) \? 1 : 2\)/,
    );
  });

  it("a wording takes the parts it leaves out from the clauses beside it", () => {
    const { says } = parseTechnique("t", "x", {
      for: "c in cells",
      conclude: "strike(c, 1)",
      says: {
        wordings: [{ when: "true", look: "one" }, { move: "two" }],
        look: "base look",
        move: "base move",
      },
    });
    expect(says?.variants[0].words.map((w) => w.clauses)).toEqual([
      { look: "one", move: "base move" },
      { look: "base look", move: "two" },
    ]);
  });

  it("refuses a wording without a when before the last", () => {
    expect(() =>
      stated({
        wordings: [{ look: "{n}" }, { when: "n > 2", look: "{n}" }],
        move: "{n}",
      }),
    ).toThrow(/only the last wording may have no when/);
  });
});

describe("a witness is written for a hint only", () => {
  const technique = (witness: boolean, reads = false) =>
    compileLibrary(
      {
        library: "t",
        techniques: {
          x: {
            for: "c in cells where exists d in adj4(c): |{x in adj4(d) where known(x)}| = 0 or (with place(c, 1): known(d))",
            conclude: "strike(c, 1)",
            says: { terms: { c: "c" }, marks: {}, witness, reads },
          },
        },
      },
      "t",
      "./runtime.ts",
    );
  /** The technique's lines without the block a hint alone runs: the
   * `if (fire !== null) {` block and all it holds. */
  const solvePath = (code: string): string[] => {
    const all = code.split("\n");
    const kept: string[] = [];
    let skipping: string | null = null;
    for (const l of all.slice(
      all.findIndex((x) => x.startsWith("export function x(")),
    )) {
      if (skipping !== null) {
        if (l === `${skipping}}`) skipping = null;
        continue;
      }
      const m = /^( *)if \(fire !== null\) \{$/.exec(l);
      if (m === null) kept.push(l);
      else skipping = m[1];
    }
    return kept;
  };

  it("so the solve path's code is what it is without one", () => {
    const [stated, absent] = [technique(true), technique(false)];
    expect(stated).toContain('held: "member"');
    expect(absent).not.toContain("held: ");
    // The block a hint runs is dropped from both, and what is left is equal.
    expect(solvePath(stated).length).toBeGreaterThan(20);
    expect(solvePath(stated)).toEqual(solvePath(absent));
  });

  it("the reads include what a binder is drawn from, declared before any is made", () => {
    const code = compileLibrary(
      {
        library: "t",
        techniques: {
          x: {
            // A read in the `=` binder alone, and one a loop-invariant
            // `known(c)` would move out of the loop.
            for: "c in cells where known(c), d in adj4(c) where known(c), n = |{x in adj4(d) where known(x)}| where n = 0",
            conclude: "strike(d, 1)",
            says: { terms: {}, marks: {}, reads: true },
          },
        },
      },
      "t",
      "./runtime.ts",
    );
    const hint = code.slice(code.indexOf("const _rc: number[]"));
    expect(hint).toContain("_rc.push(");
    expect(code.indexOf("_rc.push(")).toBeGreaterThan(code.indexOf("const _rc"));
  });

  it("and so are the reads", () => {
    const [stated, absent] = [technique(false, true), technique(false)];
    expect(stated).toContain("_rc.push(");
    expect(absent).not.toContain("_rc");
    expect(solvePath(stated).length).toBeGreaterThan(20);
    expect(solvePath(stated)).toEqual(solvePath(absent));
  });
});
