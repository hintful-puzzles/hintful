import { describe, expect, it } from "vitest";
import { compileGame, compileLibrary } from "./compile.ts";
import { CompileError, maskHas } from "./compile-sorts.ts";
import { isFormal, isLibrary, parseTechnique } from "./description.ts";
import { lintDescription } from "./lint.ts";
import { loadDescriptionFile } from "./load.ts";
import soundnessJson from "./soundness.json" with { type: "json" };
import { unchecked } from "./soundness.ts";
import { compiledPath, compileSource, compiles } from "./sources.ts";

const soundness: Record<string, string> = soundnessJson;

const texts = import.meta.glob<string>("../**/*.description.yaml", {
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

/**
 * The modules are generated and never committed, so a commit does not show
 * what a change to the compiler did to them. These three do: a planning game,
 * a game that states its own techniques, and one that places a library's.
 * After a compiler change, `npx vitest run src/describe/compile.test.ts -u`
 * writes them again, and the diff is the change's effect.
 */
const SAMPLES = [
  "src/games/flip/flip.description.yaml",
  "src/games/pattern/pattern.description.yaml",
  "src/games/adjacent/adjacent.description.yaml",
];

describe("compiled descriptions", () => {
  it("finds the descriptions that compile", () => {
    expect([...sources.values()].filter(compiles).length).toBeGreaterThan(0);
  });

  for (const source of SAMPLES)
    it(`${source} compiles as its committed sample reads`, async () => {
      const name = compiledPath(source).split("/").at(-1);
      await expect(compileSource(source, sources)).toMatchFileSnapshot(
        `./__snapshots__/${name}.txt`,
      );
    });

  it("compiles only techniques checked sound as they read now", () => {
    // Run `npx vitest run -c research/technique-check/vitest.config.ts
    // describe-check`, which records each technique it finds sound.
    expect(unchecked(sources, soundness).techniques).toEqual([]);
  });

  it("compiles only dead-end claims checked sound as they read now", () => {
    // Run `npx vitest run -c research/technique-check/vitest.config.ts
    // dead-end-check`, which records each claim it finds sound.
    expect(unchecked(sources, soundness).deadEnds).toEqual([]);
  });

  it("keeps no verdict whose technique or claim is gone", () => {
    // Delete each key named: its technique was renamed or dropped, or it was
    // copied with a skeleton whose techniques the game has replaced.
    expect(unchecked(sources, soundness).orphans).toEqual([]);
  });

  it("finds no wording or formula npm run describe refuses", () => {
    const errors = [...sources].flatMap(([f, d]) =>
      lintDescription(d)
        .filter((x) => x.error)
        .map((x) => `${f} ${x.where}: ${x.message}`),
    );
    expect(errors).toEqual([]);
  });
});

describe("the compiler refuses an ill-sorted technique", () => {
  const lib = (conclude: string, forClause = "c in cells") =>
    compileLibrary(
      { library: "t", techniques: { x: { for: forClause, conclude } } },
      "t",
      "./runtime.ts",
      "./step-voice.ts",
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

  it("supposes a value in each member of a set of cells, and in no number", () => {
    const code = lib(
      "strike(c, 1)",
      "c in cells where with place(adj4(c), 1): exists y in adj4(c): value(y) = 1",
    );
    expect(code).toMatch(/\(_wc\d+\.includes\(\w+\) \? _wd\d+ :/);
    expect(() =>
      lib("strike(c, 1)", "c in cells where with place(cand(c), 1): known(c)"),
    ).toThrow(CompileError);
  });
});

describe("every technique on the ladder is named", () => {
  // Check & save names a move by the technique that made it.
  const source = "src/games/pattern/pattern.description.yaml";
  const pattern = sources.get(source);
  if (pattern === undefined || !isFormal(pattern)) throw new Error(`${source} moved`);

  it("refuses one the names block leaves out", () => {
    const all = new Map(sources);
    all.set(source, { ...pattern, names: {} });
    expect(() => compileSource(source, all)).toThrow(/line: no name/);
  });

  it("names one by a rung it is recorded under", () => {
    const all = new Map(sources);
    all.set(source, {
      ...pattern,
      names: { lines: "a line" },
      techniques: (pattern.techniques ?? []).map((t) => ({ ...t, rung: "lines" })),
    });
    expect(compileSource(source, all)).toContain('name: "a line"');
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

describe("a number outside a mask's 32 bits is in no mask", () => {
  // A shift counts mod 32, so 33 would read bit 1 and -31 bit 1 too: a
  // cage's total less what is placed is such a number.
  const has = (x: string): boolean =>
    new Function("m", `return ${maskHas("m", x)};`)(0b10) as boolean;
  it.each(["33", "-31", "(32 + 1)"])("%s", (x) => {
    expect(has(x)).toBe(false);
  });
  it("and one inside reads its bit", () => {
    expect([has("1"), has("(0 + 1)"), has("0")]).toEqual([true, true, false]);
  });
});

describe("a technique states how its dearest read grows with the board", () => {
  const lib = (forClause: string) =>
    compileLibrary(
      { library: "t", techniques: { x: { for: forClause, conclude: "strike(c, 1)" } } },
      "t",
      "./runtime.ts",
      "./step-voice.ts",
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

describe("a role a step marks several sorts in holds a set of each", () => {
  const marked = (outline: Record<string, string>): string =>
    compileLibrary(
      {
        library: "t",
        techniques: {
          x: {
            for: "c in cells where known(c)",
            conclude: "forall d in adj4(c): strike(d, 1)",
            says: { marks: { outline } },
          },
        },
      },
      "t",
      "./runtime.ts",
      "./step-voice.ts",
    );

  it("by the sort's name, typed so", () => {
    const code = marked({ cell: "{c}", line: "{row(c)}" });
    expect(code).toContain(
      'marks: { outline: { "cell": readonly number[]; "line": readonly number[]; }; };',
    );
    expect(code).toMatch(/marks: \{ outline: \{ "cell": .*\.slice\(\), "line": /);
  });

  it("and refuses a set named for a sort it is not of", () => {
    expect(() => marked({ line: "{c}" })).toThrow(
      /says marks outline line is not a set of lines/,
    );
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
      "./step-voice.ts",
    );

  it("so a number term, a lexicon word and a role it marks are said", () => {
    expect(() =>
      stated({
        look: "{outline: the outlined {noun}} has {n} {shaded} {outline near: neighbor | neighbors}",
        move: "{ring} must be {unshaded}",
      }),
    ).not.toThrow();
  });

  it("refuses a term named like a lexicon word, which a clause would read first", () => {
    expect(() =>
      stated({
        terms: { n: "n", alongside: "n" },
        look: "{alongside} is it",
      }),
    ).toThrow(/term named alongside is shadowed/);
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
    ["a piece of a set", { look: "{piece near} is it" }, /says \{near\}/],
    [
      "a count in words of a term it does not state",
      { look: "{spelled m} is it" },
      /says \{m\}/,
    ],
    ["a piece with no term", { look: "{piece} is it" }, /no word of a term/],
    [
      "a flag chosen inside a fit that is no flag term",
      { look: "{fit: {if n: a | b} | c} is it" },
      /chooses by \{if n\}, which is no flag term/,
    ],
    [
      "a word inside an if's reference that it does not state",
      { look: "{if n: {outline: {m}} | c} is it" },
      /chooses by \{if n\}/,
    ],
    ["a fit of one form", { look: "{fit: a} is it" }, /no fit of two forms/],
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
      "./step-voice.ts",
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

  describe("where a role marks several sorts", () => {
    const sorts = (says: Record<string, unknown>): string =>
      stated({
        marks: { outline: { cell: "{c}", line: "{row(c)}" } },
        ...says,
      });

    it("a reference names the sort it is over, and a wording reads each by role and sort", () => {
      const code = sorts({
        wordings: [
          { when: "|outlineLine| = 0", look: "{outline cell: the dot}" },
          { look: "{outline cell: the dot} on {outline line: the line}" },
        ],
        move: "{ring} must be {unshaded}",
      });
      expect(code).toContain("const _sw_outlineLine = ");
      expect(code).toMatch(/wording: \(\(_sw_outlineLine\.length === 0\) \? 0 : 1\)/);
    });

    it.each([
      ["no sort named", { look: "{outline} is it" }, /marks several sorts/],
      ["a sort it does not mark", { look: "{outline face} is it" }, /face is no term/],
    ])("and refuses %s", (_, says, error) => {
      expect(() => sorts(says)).toThrow(error);
    });
  });

  describe("a step the planner emits", () => {
    const loopy = sources.get("src/games/loopy/loopy.description.yaml");
    const compileStep = (step: Record<string, unknown>): string => {
      if (loopy === undefined || !isFormal(loopy)) throw new Error("no Loopy");
      const libraries = [...sources.values()].filter(isLibrary);
      return compileGame(
        { ...loopy, steps: { probe: step } } as never,
        libraries,
        "src/games/loopy/loopy.description.yaml",
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const step = (over: Record<string, unknown>): Record<string, unknown> => ({
      ring: "edge",
      terms: { n: "number", line: "flag" },
      marks: { outline: ["face", "angle"] },
      ...over,
    });

    it("is checked as a technique's words are, and its wordings' conditions compile", () => {
      const code = compileStep(
        step({
          wordings: [
            { when: "|outlineAngle| = 0 and line", look: "{outline face: this {n}}" },
            { look: "{outline face: this {n}} {if line: is | is not}" },
          ],
          move: "{ring} must be a line",
        }),
      );
      expect(code).toContain("probe: {");
      expect(code).toContain("(t, m) => ((m.outline.angle.length === 0) && t.line)");
    });

    it("reads the size of what it decides as |ring|", () => {
      const code = compileStep(
        step({
          wordings: [
            { when: "|ring| = 0", move: "nothing" },
            { move: "{ring} must be a line" },
          ],
        }),
      );
      expect(code).toContain("(_t, _m, r) => (r.length === 0)");
    });

    it("compares a word term with one of its words, and refuses another", () => {
      const worded = (when: string) =>
        compileStep(
          step({
            terms: { n: "number", line: "flag", side: ["near", "far"] },
            wordings: [{ when, look: "{side}" }, { look: "{n}" }],
            move: "{ring} must be a line",
          }),
        );
      expect(worded("side = far")).toContain('(t.side === "far")');
      expect(() => worded("side = wide")).toThrow(/side against no word of it/);
    });

    it.each([
      ["a term it does not declare", { look: "{m} is it" }, /says \{m\}/],
      ["an if over a number", { look: "{if n: a | b}" }, /\{if n\}, which is no flag/],
      ["a flag said as a number", { look: "{line} is it" }, /says \{line\}/],
      [
        "a role of several sorts named bare",
        { look: "{outline} is it" },
        /marks several sorts/,
      ],
      ["a count over a flag", { effect: "{line: a | b} left" }, /says \{line\}/],
      ["an effect naming a term it lacks", { effect: "{m} left" }, /effect says \{m\}/],
      [
        "a sort it does not mark",
        { look: "{outline cell: the dot} is it" },
        /cell is no term/,
      ],
      [
        "a condition on a term it does not declare",
        { wordings: [{ when: "m", look: "a" }, { look: "b" }] },
        /reads m, which is no term/,
      ],
    ])("and refuses %s", (_, over, error) => {
      expect(() =>
        compileStep(step({ move: "{ring} must be a line", ...over })),
      ).toThrow(error);
    });

    describe("a ring of several sorts", () => {
      const ringStep = (move: string): string =>
        compileStep(step({ ring: ["tile", "sign"], move }));

      it("is typed by sort, and each reference names one", () => {
        expect(ringStep("{ring tile: this} {ring sign: that}")).toContain(
          'ring: ["tile","sign"]',
        );
      });

      it("and refuses a reference that names none", () => {
        expect(() => ringStep("{ring: this}")).toThrow(/marks several sorts/);
      });
    });

    describe("a term listing its words", () => {
      const wordStep = (look: string): string =>
        compileStep(
          step({
            terms: { n: "number", shape: ["corner", "cross"] },
            look,
            move: "{ring} must be a line",
          }),
        );

      it("is said as it is, and typed as their union", () => {
        expect(wordStep("this {shape}")).toContain('shape: "corner" | "cross"');
      });

      it("and refuses one read by an if", () => {
        expect(() => wordStep("{if shape: a | b}")).toThrow(
          /\{if shape\}, which is no flag/,
        );
      });
    });

    describe("a unit term", () => {
      const unitStep = (look: string): string =>
        compileStep(
          step({
            terms: { n: "number", side: "unit" },
            look,
            move: "{ring} must be a line",
          }),
        );

      it("is said as its name, and typed as one", () => {
        const code = unitStep("this {side}");
        expect(code).toContain("side: Unit");
        expect(code).toMatch(
          /import \{ stepVoice, type StepVoice, type Unit, type Voice \}/,
        );
      });

      it.each([
        ["read by an if", "{if side: a | b}", /\{if side\}, which is no flag/],
        ["said as a numeral", "{numeral side}", /side/],
      ])("is refused %s", (_, look, error) => {
        expect(() => unitStep(look)).toThrow(error);
      });
    });

    describe("a clause term", () => {
      const clauseSteps = (reason: Record<string, unknown>): string => {
        if (loopy === undefined || !isFormal(loopy)) throw new Error("no Loopy");
        return compileGame(
          {
            ...loopy,
            steps: {
              reason,
              probe: step({
                terms: { why: { clause: ["reason"] } },
                look: "{ring} must be a line, as {why}",
                move: "it must be",
              }),
            },
          } as never,
          [...sources.values()].filter(isLibrary),
          "src/games/loopy/loopy.description.yaml",
          "../../engine/describe-runtime.ts",
          "./step-voice.ts",
        );
      };

      it("is typed as the step it names, and the voice speaks it", () => {
        const code = clauseSteps({ ring: "edge", move: "no other way fits" });
        expect(code).toContain('why: StepClause<StepsById<E>, "reason", E>');
        expect(code).toContain('spoken: ["why"]');
      });

      it("is typed as a list where it is several, and spoken as one", () => {
        if (loopy === undefined || !isFormal(loopy)) throw new Error("no Loopy");
        const code = compileGame(
          {
            ...loopy,
            steps: {
              reason: { ring: "edge", move: "no other way fits" },
              probe: step({
                terms: { why: { clauses: ["reason"] } },
                look: "{ring} must be a line, as {why}",
                move: "it must be",
              }),
            },
          } as never,
          [...sources.values()].filter(isLibrary),
          "src/games/loopy/loopy.description.yaml",
          "../../engine/describe-runtime.ts",
          "./step-voice.ts",
        );
        expect(code).toContain('why: readonly StepClause<StepsById<E>, "reason", E>[]');
        expect(code).toContain('spoken: ["why"]');
      });

      it("and refuses one naming a step with no move", () => {
        expect(() => clauseSteps({ ring: "edge", look: "no other way fits" })).toThrow(
          /names reason, which states no move/,
        );
      });
    });

    describe("a supplied term", () => {
      const supplying = (says: Record<string, unknown>): string =>
        stated({
          terms: {
            n: "n",
            many: { supplied: "flag" },
            count: { supplied: "number" },
            at: { supplied: "element" },
            hubs: { supplied: "elements" },
            names: { supplied: "words" },
            multi: { supplied: "several" },
          },
          marks: { outline: "{c}", stripes: { supplied: "elements" } },
          look: "{if many: {outline hubs: the outlined hubs} | {outline at: this one}} take {count} of {either names}",
          move: "{ring} must be {if multi: lines | a line}",
          ...says,
        });

      it("is typed for the game's hook, the engine's several apart", () => {
        const code = supplying({});
        const supplied = code.slice(code.indexOf("export interface XSupplied {"));
        expect(supplied.slice(0, supplied.indexOf("}\n"))).toContain(
          "terms: { many: boolean; count: number; at: number; hubs: readonly number[]; names: readonly string[]; };",
        );
        expect(supplied).toContain("marks: { stripes: readonly number[]; };");
        expect(supplied.slice(0, supplied.indexOf("}\n"))).not.toContain("multi");
        expect(code).toContain('"several":["multi"]');
      });

      it("is not read by a wording's when, which is chosen before the game supplies it", () => {
        expect(() =>
          supplying({ wordings: [{ when: "many", look: "{n}" }, { look: "{count}" }] }),
        ).toThrow(/a wording's when reads many, which is supplied/);
      });
    });
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
      "./step-voice.ts",
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
      "./step-voice.ts",
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

describe("what the fill board reads of a description", () => {
  const tentsSource = "src/games/tents/tents.description.yaml";
  const compileTents = (over: (json: never) => unknown): string => {
    const tents = sources.get(tentsSource);
    if (tents === undefined || !isFormal(tents)) throw new Error("no Tents");
    return compileGame(
      over(structuredClone(tents) as never) as never,
      [...sources.values()].filter(isLibrary),
      tentsSource,
      "../../engine/describe-runtime.ts",
      "./step-voice.ts",
    );
  };

  it("writes the clues a sampled deal derives only where the deal samples", () => {
    expect(compileTents((j) => j)).toContain("export function deriveClues(");
    const unsampled = compileTents((j: { deal: { sample?: unknown } }) => {
      delete j.deal.sample;
      return j;
    });
    expect(unsampled).not.toContain("deriveClues");
    expect(unsampled).not.toContain("clueHolds_");
  });

  it("refuses a sampled deal whose clue reads the board's other clues", () => {
    expect(() =>
      compileTents((j: { clues: { count: { means: string } } }) => {
        j.clues.count.means = "count(c in cells(at) where clue(tree, c) >= 0) = v";
        return j;
      }),
    ).toThrow(/reads the board's clues/);
  });

  it("refuses a `while` on any mark but the cell mark naming a clue", () => {
    expect(() =>
      compileTents((j: { marks: Record<string, unknown> }) => {
        j.marks["scrap"] = { sort: "edge", notation: "x", while: "true" };
        return j;
      }),
    ).toThrow(/`while` is the one cell mark's/);
  });

  it("refuses a button whose value the player does not place, and a link that is not the cell mark", () => {
    expect(() =>
      compileTents((j: { play: { secondary: number } }) => {
        j.play.secondary = 3;
        return j;
      }),
    ).toThrow(/secondary value 3 is not one the player places/);
    expect(() =>
      compileTents((j: { play: { links: string } }) => {
        j.play.links = "pair";
        return j;
      }),
    ).toThrow(/links names pair/);
  });

  it("refuses a glance or an ask at a technique the ladder lacks, and an ask at a glance", () => {
    type Play = { play: { glance: string[]; askBefore: string[] } };
    expect(() =>
      compileTents((j: Play) => {
        j.play.glance = ["tentLinks"];
        return j;
      }),
    ).toThrow(/glance: tentLinks is no technique of the ladder/);
    expect(() =>
      compileTents((j: Play) => {
        j.play.askBefore = ["treeLink"];
        return j;
      }),
    ).toThrow(/askBefore: treeLink is read at a glance/);
  });

  it("refuses a game ID that leaves a clue kind out, or writes a valued one as runs", () => {
    type Id = { id: Record<string, string>[] };
    expect(() =>
      compileTents((j: Id) => {
        j.id = [{ runs: "tree" }];
        return j;
      }),
    ).toThrow(/count is not named once/);
    expect(() =>
      compileTents((j: Id) => {
        j.id = [{ numbers: "tree" }, { runs: "count" }];
        return j;
      }),
    ).toThrow(/runs of count/);
  });

  it("writes a label of the line's index, and refuses one that reads the board", () => {
    const compiled = compileTents((j: { play: { labels?: { start: string } } }) => {
      j.play.labels = { start: "2 * i + 1" };
      return j;
    });
    const body = compiled.slice(compiled.indexOf("export const labels"));
    const start = new Function(
      "i",
      body.slice(body.indexOf("{", body.indexOf("start(")) + 1, body.indexOf("\n  },")),
    );
    expect([0, 1, 2].map((i) => start(i))).toEqual(["1", "3", "5"]);
    expect(() =>
      compileTents((j: { play: { labels?: { start: string } } }) => {
        j.play.labels = { start: "count(c in cells where value(c) = 1) + i" };
        return j;
      }),
    ).toThrow(/reads more than `i`/);
  });
});
