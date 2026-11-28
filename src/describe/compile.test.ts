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
        look: "{outline: the outlined {noun}} has {numeral n} {shaded} {outline near: neighbor | neighbors}",
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
  const compileEdited = (source: string, over: (json: never) => unknown): string => {
    const json = sources.get(source);
    if (json === undefined || !isFormal(json)) throw new Error(`no ${source}`);
    return compileGame(
      over(structuredClone(json) as never) as never,
      [...sources.values()].filter(isLibrary),
      source,
      "../../engine/describe-runtime.ts",
      "./step-voice.ts",
    );
  };
  const compileTents = (over: (json: never) => unknown): string =>
    compileEdited(tentsSource, over);

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

  it("refuses candidate notes on a board of buttons, and notes of another domain", () => {
    type Json = {
      answer: { value: { domain: string } };
      marks: Record<string, unknown>;
    };
    expect(() =>
      compileTents((j: Json) => {
        j.marks["cand"] = { sort: "cell", notation: `set of ${j.answer.value.domain}` };
        return j;
      }),
    ).toThrow(/candidate notes are a board of numbers'/);
    expect(() =>
      compileTents((j: Json) => {
        j.marks["cand"] = { sort: "cell", notation: "set of range(1, 9)" };
        return j;
      }),
    ).toThrow(/a set of the answer's domain/);
    // The hint's reading of an unnoted square is a board with notes' alone.
    expect(() =>
      compileTents((j: { play: { hintNotes: string } }) => {
        j.play.hintNotes = "implicit";
        return j;
      }),
    ).toThrow(/hintNotes: the hint reads notes, and `marks` declares none/);
  });

  it("holds a board of notes to the regions its walk reads, and their words", () => {
    const source = "src/engine/testing/fixtures/zoning/zoning.description.yaml";
    const zoning = sources.get(source);
    if (zoning === undefined || !isFormal(zoning)) throw new Error("no zoning");
    type Json = {
      space: { units: string[] };
      shape: string[];
      steps: Record<string, { terms: Record<string, string> }>;
    };
    const compileZoning = (over: (j: Json) => void) => {
      const j = structuredClone(zoning) as unknown as Json;
      over(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const code = compileZoning(() => {});
    expect(code).toContain('export const distinctParts = ["area"] as const;');
    // The walk's singles are its own, known by the kind they were placed as.
    expect(code).toContain('kind: "one.cell"');
    expect(code).toContain('kind: "one.place"');
    // The walk reads any unit beside the areas.
    expect(
      compileZoning((j) => {
        j.space.units = ["rows"];
      }),
    ).toContain('export const units: readonly string[] = ["rows"];');
    // Its areas' rule dropped, no part holds a value once, and the walk,
    // with no unit either, reads its techniques' reach alone.
    expect(
      compileZoning((j) => {
        j.shape = j.shape.slice(1);
      }),
    ).not.toContain('distinctParts = ["area"]');
    expect(() =>
      compileZoning((j) => {
        delete j.steps["cull"];
      }),
    ).toThrow(/steps: cull is unworded/);
    expect(() =>
      compileZoning((j) => {
        j.steps["cull"].terms["far"] = "number";
      }),
    ).toThrow(/steps cull: the walk supplies no term far/);
    expect(() =>
      compileZoning((j) => {
        j.steps["cull"].terms["n"] = "flag";
      }),
    ).toThrow(/steps cull: term n is a number/);
  });

  it("builds a board's blocks and a variation's units, and words the walk over them", () => {
    const source = "src/engine/testing/fixtures/boxing/boxing.description.yaml";
    const boxing = sources.get(source);
    if (boxing === undefined || !isFormal(boxing)) throw new Error("no boxing");
    type Json = {
      space: { regions: Record<string, string> };
      steps: Record<string, { terms: Record<string, string> }>;
    };
    const compileBoxing = (over: (j: Json) => void) => {
      const j = structuredClone(boxing) as unknown as Json;
      over(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const code = compileBoxing(() => {});
    expect(code).toContain(
      'export const boxes = {"name":"box","blocks":[2,2]} as const;',
    );
    expect(code).toContain('export const unitVariations = {"diagonals":"X"} as const;');
    // A block's sides are a number or a size the params give.
    expect(
      compileBoxing((j) => {
        j.space.regions["box"] = "blocks(w, 2)";
      }),
    ).toContain('"blocks":["w",2]');
    for (const how of ["rows(2)", "blocks(2)", "blocks(2, k)"])
      expect(() =>
        compileBoxing((j) => {
          j.space.regions["box"] = how;
        }),
      ).toThrow(/box: a partition by formula is blocks\(a, b\)/);
    expect(() =>
      compileBoxing((j) => {
        j.space.regions["lane"] = "blocks(2, 2)";
      }),
    ).toThrow(/lane: a partition by formula is one among the units/);
    // The blocks reach past a row and a column, so the walk's steps are the
    // description's, a modifier a flag by its name.
    expect(() =>
      compileBoxing((j) => {
        delete j.steps["clean"];
      }),
    ).toThrow(/steps: clean is unworded/);
    expect(() =>
      compileBoxing((j) => {
        j.steps["cull"].terms["Y"] = "flag";
      }),
    ).toThrow(/steps cull: the walk supplies no term Y \(n, X\)/);
    expect(() =>
      compileBoxing((j) => {
        j.steps["cull"].terms["X"] = "number";
      }),
    ).toThrow(/steps cull: term X is a flag/);
  });

  it("refuses a rung that strikes on a board of numbers without notes", () => {
    const source = "src/engine/testing/fixtures/ordering/ordering.description.yaml";
    const ordering = sources.get(source);
    if (ordering === undefined || !isFormal(ordering)) throw new Error("no ordering");
    const compileOrdering = (notes: boolean) => {
      const j = structuredClone(ordering) as {
        marks?: Record<string, unknown>;
        play: { hintNotes?: string };
      };
      if (!notes) {
        delete j.marks;
        delete j.play.hintNotes;
      }
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileOrdering(true)).toContain("export const STATED");
    expect(() => compileOrdering(false)).toThrow(
      /technique sign: it strikes, and a board of numbers strikes only in notes/,
    );
  });

  it("refuses {tally}, which only the library's fish is given, in a game's own wording", () => {
    const source = "src/games/solo/solo.description.yaml";
    const solo = sources.get(source);
    if (solo === undefined || !isFormal(solo)) throw new Error("no solo");
    const compileSolo = (from: string, to: string) => {
      const text = JSON.stringify(solo);
      expect(text).toContain(from);
      return compileGame(
        JSON.parse(text.replace(from, to)) as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileSolo("{numeral lines} rows}", "{numeral lines} rows}")).toContain(
      "export const STATED",
    );
    expect(() => compileSolo("{numeral lines} rows}", "{tally} rows}")).toThrow(
      /says look says \{tally\}, which only the library's wordings are given/,
    );
  });

  it("refuses a clue's number said bare on a board of numbers, which would say 16 as g", () => {
    const source = "src/games/keen/keen.description.yaml";
    const keen = sources.get(source);
    if (keen === undefined || !isFormal(keen)) throw new Error("no keen");
    const compileKeen = (to: string) => () =>
      compileGame(
        JSON.parse(JSON.stringify(keen).replace("sum to {numeral sum}", to)) as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    expect(compileKeen("sum to {numeral sum}")).not.toThrow();
    expect(compileKeen("sum to {sum}")).toThrow(
      /says \{sum\}, a number counted or a clue's, as a value is drawn: say \{numeral sum\}/,
    );
  });

  it("refuses a clue marked done where no press can reach it", () => {
    const source = "src/engine/testing/fixtures/ordering/ordering.description.yaml";
    const ordering = sources.get(source);
    if (ordering === undefined || !isFormal(ordering)) throw new Error("no ordering");
    const compileOrdering = (done: Record<string, string>) => {
      const j = structuredClone(ordering) as {
        play: { done?: Record<string, string> };
      };
      j.play.done = done;
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileOrdering({ greater: "sign" })).toContain('"done":{"greater":"sign"}');
    expect(() => compileOrdering({ given: "given" })).toThrow(
      /play done: given is no clue kind drawn in a gap/,
    );
    expect(() =>
      compileTents((j: { play: { done: Record<string, string> } }) => {
        j.play.done = { count: "count" };
        return j;
      }),
    ).toThrow(/play done: count is no clue kind drawn in a gap/);
  });

  it("draws a line's clue one a value before the lines, and refuses a list or a label there", () => {
    const source = "src/engine/testing/fixtures/counting/counting.description.yaml";
    const counting = sources.get(source);
    if (counting === undefined || !isFormal(counting)) throw new Error("no counting");
    type Json = {
      play: { labels?: { start: string }; cornerCrosses?: string };
      settings: Record<string, { least?: Record<string, number> }>;
    };
    const compileCounting = (edit: (j: Json) => void) => {
      const j = structuredClone(counting) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const plain = compileCounting(() => {});
    expect(plain).toContain('export const valueMargins = ["count"]');
    expect(plain).toContain("export const lineClues = []");
    expect(plain).toContain('clueTerms: {"q":"count"}');
    expect(() =>
      compileCounting((j) => {
        j.play.labels = { start: "i + 1" };
      }),
    ).toThrow(/clue count: a clue one a value is drawn before the lines' start/);
    // A size's least and the crosses name a variation the description has.
    expect(plain).toContain('"least":{"touchless":4}');
    expect(() =>
      compileCounting((j) => {
        j.settings["k"] = { ...j.settings["k"], least: { removeClues: 3 } };
      }),
    ).toThrow(/settings k: least under removeClues, which no flag gives/);
    expect(() =>
      compileCounting((j) => {
        j.play.cornerCrosses = "diagonal";
      }),
    ).toThrow(/play cornerCrosses: no variation diagonal/);
  });

  it("refuses a selection on a board of buttons, which is never typed into", () => {
    const fixture = (name: string) =>
      `src/engine/testing/fixtures/${name}/${name}.description.yaml`;
    const select = (j: { play: { select?: string } }) => {
      j.play.select = "diagonal";
      return j;
    };
    expect(compileEdited(fixture("selecting"), (j) => j)).toContain(
      '"select":"diagonal"',
    );
    expect(() => compileEdited(fixture("playing"), select)).toThrow(
      /play select: a selection is typed into, and play has no `numbers`/,
    );
  });

  it("refuses dividers off a square board of numbers with labels", () => {
    const fixture = (name: string) =>
      `src/engine/testing/fixtures/${name}/${name}.description.yaml`;
    const divide = (j: { play: { dividers?: boolean } }) => {
      j.play.dividers = true;
      return j;
    };
    expect(compileEdited(fixture("ruling"), (j) => j)).toContain('"dividers":true');
    expect(() => compileEdited(fixture("playing"), divide)).toThrow(
      /play dividers: dividers are a board of numbers', and play has no `numbers`/,
    );
    expect(() => compileEdited(fixture("selecting"), divide)).toThrow(
      /play dividers: a divider is ruled between two labels/,
    );
    expect(() =>
      compileEdited(fixture("ruling"), (j: { space: { grid: { h: string } } }) => {
        j.space.grid.h = "w + 1";
        return j;
      }),
    ).toThrow(/play dividers: a divider rules two rows and two columns alike/);
  });

  it("draws the leading diagonal on a square board alone", () => {
    const fixture = "src/engine/testing/fixtures/ruling/ruling.description.yaml";
    const lead = (j: { play: { leadingDiagonal?: boolean } }) => {
      j.play.leadingDiagonal = true;
      return j;
    };
    expect(compileEdited(fixture, lead)).toContain('"leadingDiagonal":true');
    expect(() =>
      compileEdited(fixture, (j: { play: object; space: { grid: { h: string } } }) => {
        j.space.grid.h = "w + 1";
        (j.play as { dividers?: boolean }).dividers = undefined;
        return lead(j as { play: { leadingDiagonal?: boolean } });
      }),
    ).toThrow(/play leadingDiagonal: a row meets the same column on a square board/);
  });

  it("refuses an order off a square board of numbers with labels, or where a place is fixed", () => {
    const fixture = (name: string) =>
      `src/engine/testing/fixtures/${name}/${name}.description.yaml`;
    type Edited = {
      play: { order?: boolean; dividers?: boolean; labels?: { start: string } };
      space: { grid: { h: string } };
    };
    const order = (j: Edited) => {
      j.play.order = true;
      return j;
    };
    const labeled = (j: Edited) => {
      j.play.labels = { start: "i + 1" };
      return order(j);
    };
    expect(compileEdited(fixture("reordering"), (j) => j)).toContain('"order":true');
    expect(() => compileEdited(fixture("playing"), order)).toThrow(
      /play order: an order is a board of numbers', and play has no `numbers`/,
    );
    expect(() => compileEdited(fixture("selecting"), order)).toThrow(
      /play order: a line is dragged by its label/,
    );
    expect(() =>
      compileEdited(fixture("reordering"), (j: Edited) => {
        j.space.grid.h = "w + 1";
        delete j.play.dividers;
        return j;
      }),
    ).toThrow(/play order: an order moves a row and the same column together/);
    expect(() => compileEdited(fixture("boxing"), labeled)).toThrow(
      /play order: an order keeps the rows and the columns alone, and the space has box/,
    );
    expect(() => compileEdited(fixture("ordering"), labeled)).toThrow(
      /play order: a clue off the cells keeps its place in an order, and greater is one/,
    );
    expect(() => compileEdited(fixture("caging"), labeled)).toThrow(
      /play order: a clue off the cells keeps its place in an order/,
    );
  });

  it("refuses a stream's codes that could not be read back", () => {
    const source = "src/engine/testing/fixtures/walling/walling.description.yaml";
    const walling = sources.get(source);
    if (walling === undefined || !isFormal(walling)) throw new Error("no walling");
    type Json = { id: Record<string, unknown>[] };
    const compileWalling = (edit: (j: Json) => void) => () => {
      const j = structuredClone(walling) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileWalling(() => {})).not.toThrow();
    expect(
      compileWalling((j) => {
        j.id[0] = { ...j.id[0], lastRun: false };
      }),
    ).toThrow(/a stream whose last run is left off comes last/);
    expect(
      compileWalling((j) => {
        j.id[0] = { ...j.id[0], codes: { "3": "wall 0" } };
      }),
    ).toThrow(/3 written for another kind, which a clue of number may be/);
    expect(
      compileWalling((j) => {
        j.id[0] = { ...j.id[0], apart: "B" };
      }),
    ).toThrow(/the code B begins with the stream's apart/);
    expect(
      compileWalling((j) => {
        j.id[0] = { ...j.id[0], codes: { B: "wall 0", W: "wall 0" } };
      }),
    ).toThrow(/two codes of one value of wall/);
  });

  it("refuses glyphs where a board does not draw them, and sides off the slots", () => {
    const source = "src/engine/testing/fixtures/emptying/emptying.description.yaml";
    const emptying = sources.get(source);
    if (emptying === undefined || !isFormal(emptying)) throw new Error("no emptying");
    type Json = {
      clues: Record<string, Record<string, unknown>>;
      id: Record<string, unknown>[];
      play: Record<string, unknown> & { numbers: Record<string, unknown> };
      settings: Record<string, { choices?: Record<string, unknown>[] }>;
    };
    const compileEmptying = (edit: (j: Json) => void) => {
      const j = structuredClone(emptying) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const plain = compileEmptying(() => {});
    expect(plain).toContain('export const glyphClues = ["sees"]');
    expect(plain).toContain('"letters":true');
    expect(() =>
      compileEmptying((j) => {
        j.play.numbers = { ...j.play.numbers, letters: true };
      }),
    ).toThrow(/settings mode: letters, on no board of numbers drawn flat in numerals/);
    expect(() =>
      compileEmptying((j) => {
        j.clues["ball"] = { ...j.clues["ball"], glyph: true };
      }),
    ).toThrow(/clue ball: a glyph, not at a slot of a board of numbers/);
    expect(() =>
      compileEmptying((j) => {
        j.clues["sees"] = { ...j.clues["sees"], glyph: undefined };
      }),
    ).toThrow(/id: glyphs of sees, which is no given and no clue with `glyph`/);
    expect(() =>
      compileEmptying((j) => {
        j.id[1] = { ...j.id[1], sides: ["top", "left", "bottom", "right"] };
      }),
    ).toThrow(/id: sides, on digits of given, which is not at a slot/);
    expect(() =>
      compileEmptying((j) => {
        j.id[1] = { ...j.id[1], apart: "_" };
      }),
    ).toThrow(/id: glyphs of given, one character, and an apart/);
  });

  it("refuses a clue at a slot beside a line's clue, and writes a stream behind a mark with another kind", () => {
    const source = "src/engine/testing/fixtures/flanking/flanking.description.yaml";
    const flanking = sources.get(source);
    if (flanking === undefined || !isFormal(flanking)) throw new Error("no flanking");
    type Json = {
      clues: Record<string, { at: string; value: string; means: string }>;
      id: Record<string, unknown>[];
    };
    const compileFlanking = (edit: (j: Json) => void) => {
      const j = structuredClone(flanking) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileFlanking(() => {})).toContain('export const slotClues = ["flank"]');
    expect(() =>
      compileFlanking((j) => {
        j.clues["line"] = { at: "line", value: "range(1, w)", means: "true" };
      }),
    ).toThrow(
      /clue flank: a clue at a slot is drawn in the margins, where a line's clue is/,
    );
    // Behind its mark, a stream is written where any of its kinds has a
    // clue, so it may hold another.
    expect(
      compileFlanking((j) => {
        j.clues["mark"] = { at: "cell", value: "range(0, 0)", means: "true" };
        j.id[1] = { ...j.id[1], codes: { B: "mark 0" } };
      }),
    ).toContain('"codes":{"B":"mark 0"}');
    expect(compileFlanking(() => {})).toContain('{"kind":"given","first":true}');
    const hiding = (hide: Record<string, unknown>) => () =>
      compileFlanking((j) => {
        (j as unknown as { deal: Record<string, unknown> }).deal["hide"] = hide;
      });
    expect(hiding({ given: { first: true }, flank: { first: true } })).toThrow(
      /deal hide: every kind first, and none after them/,
    );
  });

  it("refuses a params letter any other field holds, the tally's and the hide flag's included", () => {
    const source = "src/engine/testing/fixtures/tallying/tallying.description.yaml";
    const tallying = sources.get(source);
    if (tallying === undefined || !isFormal(tallying)) throw new Error("no tallying");
    type Json = {
      play: { boards: string[] };
      settings: { tally: { letter: string }; stripClues: { letter: string } };
    };
    const compileTallying = (edit: (j: Json) => void) => () => {
      const j = structuredClone(tallying) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileTallying(() => {})()).toContain('{"kind":"n","when":"stripClues"}');
    expect(
      compileTallying((j) => {
        j.settings.stripClues.letter = "f";
      }),
    ).toThrow(/settings stripClues: the letter f is taken/);
    expect(
      compileTallying((j) => {
        j.settings.tally.letter = "d";
        j.play.boards = ["5x5d2"];
      }),
    ).toThrow(/settings tally: the letter d is taken/);
  });

  it("refuses a precedence of one kind or across places, and a letter taken or a kind not switchable", () => {
    const source = "src/engine/testing/fixtures/cornering/cornering.description.yaml";
    const cornering = sources.get(source);
    if (cornering === undefined || !isFormal(cornering))
      throw new Error("no cornering");
    type Letter = { letter: string; kind: string };
    type Json = {
      deal: Record<string, unknown>;
      settings: { clueTypes: { members: Letter[] } };
    };
    const compileCornering = (edit: (j: Json) => void) => () => {
      const j = structuredClone(cornering) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(compileCornering(() => {})()).toContain('"firstKind":["sum","difference"');
    const picking = (one: Record<string, unknown>) =>
      compileCornering((j) => {
        j.deal["oneKind"] = { pick: "first", ...one };
      });
    expect(picking({ kinds: ["sum", "given"] })).toThrow(
      /deal oneKind: two kinds or more, at one place/,
    );
    expect(picking({ kinds: ["sum", "nothing"] })).toThrow(
      /deal oneKind: no clue kind nothing/,
    );
    expect(picking({ kinds: ["sum", "parity"], never: { sum: "v = 0" } })).toThrow(
      /deal oneKind: poor, never and alone choose in turn, and it picks first/,
    );
    const letters = (edit: (l: Letter[]) => void) =>
      compileCornering((j) => {
        edit(j.settings.clueTypes.members);
      });
    expect(
      letters((l) => {
        l[0].letter = "d";
      }),
    ).toThrow(/settings clueTypes: the letter d is taken/);
    expect(
      letters((l) => {
        l[0].kind = "given";
      }),
    ).toThrow(/settings clueTypes: given is dealt whatever the params/);
    expect(
      letters((l) => {
        l[1].letter = "A";
      }),
    ).toThrow(/settings clueTypes: the letter A is taken/);
    expect(
      letters((l) => {
        l[1].kind = "sum";
      }),
    ).toThrow(/settings clueTypes: a kind named twice/);
  });

  it("refuses a hidden kind no technique reads, since the hide keeps none of it", () => {
    // Cornering's corner kinds but parity are read by `pair` alone: without
    // it, a test of how they are dealt sees every one hidden.
    const source = "src/engine/testing/fixtures/cornering/cornering.description.yaml";
    const cornering = sources.get(source);
    if (cornering === undefined || !isFormal(cornering))
      throw new Error("no cornering");
    const j = structuredClone(cornering) as unknown as {
      techniques: { id?: string }[];
      names: Record<string, string>;
    };
    j.techniques = j.techniques.filter((t) => t.id !== "pair");
    delete j.names["pair"];
    expect(() =>
      compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      ),
    ).toThrow(/deal hide: no technique reads sum, so the hide keeps none of it/);
  });

  it("refuses a walk's step under a rung its technique does not give", () => {
    const source = "src/engine/testing/fixtures/flanking/flanking.description.yaml";
    const flanking = sources.get(source);
    if (flanking === undefined || !isFormal(flanking)) throw new Error("no flanking");
    type Json = {
      techniques: {
        id?: string;
        rung?: string | string[];
        says?: Record<string, unknown>;
      }[];
      marks: Record<string, unknown>;
      play: Record<string, unknown>;
    };
    const compileFlanking = (edit: (j: Json) => void) => {
      const j = structuredClone(flanking) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const flank = (j: Json) => {
      const t = j.techniques.find((x) => x.id === "flank");
      if (t === undefined) throw new Error("no flank");
      return t;
    };
    expect(compileFlanking(() => {})).toContain("byValue: true");
    expect(() =>
      compileFlanking((j) => {
        flank(j).rung = ["flankTight", "flankNear"];
      }),
    ).toThrow(
      /flank: a step of arm flank is no rung of the technique's \(flankTight, flankNear\)/,
    );
    expect(() =>
      compileFlanking((j) => {
        const says = flank(j).says ?? {};
        const { flank: arm } = says["arms"] as Record<string, Record<string, unknown>>;
        delete says["arms"];
        Object.assign(says, { look: arm["look"] });
      }),
    ).toThrow(/flank: its steps are recorded under one rung, and it has 2/);
  });

  it("refuses a bar where its board cannot draw, write or deal it", () => {
    const source = "src/games/adjacent/adjacent.description.yaml";
    const adjacent = sources.get(source);
    if (adjacent === undefined || !isFormal(adjacent)) throw new Error("no adjacent");
    type Json = {
      clues: { bar: { complete?: boolean; value: string } };
      play: {
        gaps: Record<string, string>;
        defaultTier?: string;
        boardSkips?: Record<string, string[]>;
      };
      deal: { hide: string | string[] };
      unusedLetters: Record<string, string>;
    };
    const compileAdjacent = (edit: (j: Json) => void) => {
      const j = structuredClone(adjacent) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    const edited = (f: (j: Json) => void) => () => compileAdjacent(f);
    expect(compileAdjacent(() => {})).toContain('"both":true');
    // A bar left out of the record where it is 0 must be complete.
    expect(
      edited((j) => {
        delete j.clues.bar.complete;
      }),
    ).toThrow(/id: sides of bar, which is not an edge's clue valued one of its ends/);
    expect(
      edited((j) => {
        j.clues.bar.value = "range(0, 2)";
      }),
    ).toThrow(/id: sides of bar/);
    expect(
      edited((j) => {
        j.play.gaps = { bar: "chevron" };
      }),
    ).toThrow(/play gaps: chevron draws a clue valued one of its ends, and bar is not/);
    expect(
      edited((j) => {
        j.deal.hide = ["given", "bar"];
      }),
    ).toThrow(/deal hide: bar is complete, so none of it is hidden/);
    expect(
      edited((j) => {
        j.unusedLetters = { d: "size" };
      }),
    ).toThrow(/unusedLetters: the letter d is taken/);
    expect(
      edited((j) => {
        j.play.defaultTier = "Unreasonable";
      }),
    ).toThrow(
      /play defaultTier: the menu does not offer the default board at Unreasonable/,
    );
    // A board skips only a tier strictly inside the ones it is offered at.
    expect(
      compileAdjacent((j) => {
        j.play.boardSkips = { "7x7": ["Hard"] };
      }),
    ).toContain('"skips":[{"w":7,"h":7,"tiers":[3]}]');
    expect(
      edited((j) => {
        j.play.boardSkips = { "7x7": ["Tricky"] };
      }),
    ).toThrow(/play boardSkips: 7x7 skips Tricky, not between its first and last tier/);
  });

  it("refuses a group's table that is no group's, and a hide's keep that is no truth", () => {
    const source = "src/engine/testing/fixtures/grouping/grouping.description.yaml";
    const grouping = sources.get(source);
    if (grouping === undefined || !isFormal(grouping)) throw new Error("no grouping");
    type Json = {
      deal: {
        sample: { group: { tables: Record<string, string[][]>; hidden: string } };
        hide: { given: { keep: string } };
      };
    };
    const edited = (edit: (j: Json) => void) => () => {
      const j = structuredClone(grouping) as unknown as Json;
      edit(j);
      return compileGame(
        j as never,
        [...sources.values()].filter(isLibrary),
        source,
        "../../engine/describe-runtime.ts",
        "./step-voice.ts",
      );
    };
    expect(edited(() => {})()).toContain(
      '"hidden":{"ruleset":{"setting":"plain","choice":1}}',
    );
    const tables = (order: string, groups: string[][]) =>
      edited((j) => {
        j.deal.sample.group.tables[order] = groups;
      });
    expect(tables("3", [["BCC"]])).toThrow(
      /order 3's group BCC: BCC is no permutation/,
    );
    // One transposition reaches two of the three rows.
    expect(tables("3", [["BAC"]])).toThrow(
      /order 3's group BAC: its table is not filled/,
    );
    // Two transpositions reach every row, but of six permutations.
    expect(tables("3", [["ACB", "BAC"]])).toThrow(/an element twice in a line/);
    expect(
      edited((j) => {
        delete j.deal.sample.group.tables["5"];
      }),
    ).toThrow(/deal sample group: no group of order 5/);
    expect(
      edited((j) => {
        j.deal.sample.group.hidden = "Shuffled";
      }),
    ).toThrow(/deal sample group hidden: Shuffled, no variation or ruleset/);
    expect(
      edited((j) => {
        j.deal.hide.given.keep = "x(at)";
      }),
    ).toThrow(/deal hide: given's keep is not a truth/);
  });

  it("refuses a breach label of no statement, off a square, or of a text no number", () => {
    const grouping = "src/engine/testing/fixtures/grouping/grouping.description.yaml";
    type Label = { at: string; says: string; place: string };
    type Json = { breaches: { associative: Label[] } };
    const label = (edit: (l: Label) => void) =>
      compileEdited(grouping, (j: Json) => {
        edit(j.breaches.associative[0]);
        return j;
      });
    expect(label(() => {})).toContain('says: ["(", v_a, v_b, ")", v_c]');
    expect(() =>
      compileEdited(grouping, (j: Json) => ({
        ...j,
        breaches: { associativ: j.breaches.associative },
      })),
    ).toThrow(/breaches: associativ names no rule or implied statement/);
    expect(() =>
      label((l) => {
        l.at = "a";
      }),
    ).toThrow(/breaches: associative's label: expected a cell/);
    expect(() =>
      label((l) => {
        l.says = "{mul(a, b)}";
      }),
    ).toThrow(/breaches: associative's label text: expected num/);
  });

  it("prints a value on a cell by its glyph, and one on an edge by its edge painter", () => {
    type Values = {
      play: { values: Record<string, { glyph?: string; paint: string }> };
    };
    expect(() =>
      compileTents((j: Values) => {
        delete j.play.values["1"].glyph;
        return j;
      }),
    ).toThrow(/play values: 1 has no glyph/);
    const lacing = "src/engine/testing/fixtures/lacing/lacing.description.yaml";
    expect(compileEdited(lacing, (j) => j)).toContain('answerSort = "edge"');
    expect(() =>
      compileEdited(lacing, (j: Values) => {
        j.play.values["1"].glyph = " | ";
        return j;
      }),
    ).toThrow(
      /play values: 1 is on an edge, which its painter prints, and has a glyph/,
    );
    expect(() =>
      compileEdited(lacing, (j: Values) => {
        j.play.values["1"].paint = "tent";
        return j;
      }),
    ).toThrow(/play values: 1 is on an edge, and tent is no edge painter/);
  });

  it("refuses on an answer on the edges each part that assumes a cell, by name", () => {
    const lacing = "src/engine/testing/fixtures/lacing/lacing.description.yaml";
    type Lacing = {
      play: Partial<
        Record<
          | "numbers"
          | "links"
          | "wash"
          | "covers"
          | "given"
          | "dealt"
          | "shape"
          | "gaps"
          | "straight"
          | "wrap",
          unknown
        >
      >;
      space: { grid: { hexagon?: unknown } };
      marks?: Record<string, unknown>;
      given?: string[];
      rulesOut?: unknown;
    };
    const parts: [string, (j: Lacing) => void][] = [
      [
        "marks",
        (j) => (j.marks = { notes: { sort: "edge", notation: "set of range(1, 2)" } }),
      ],
      ["play numbers", (j) => (j.play.numbers = {})],
      ["play links", (j) => (j.play.links = "pair")],
      ["play wash", (j) => (j.play.wash = { when: "value(c) = 1" })],
      ["play covers", (j) => (j.play.covers = { value: 1, pref: {} })],
      ["given", (j) => (j.given = ["value"])],
      ["play given", (j) => (j.play.given = { 3: { glyph: " o ", paint: "dot" } })],
      ["play dealt", (j) => (j.play.dealt = "number")],
      ["play shape", (j) => (j.play.shape = "number")],
      ["play gaps", (j) => (j.play.gaps = { number: "bar" })],
      ["space hexagon", (j) => (j.space.grid.hexagon = { outside: "number" })],
      ["play straight", (j) => (j.play.straight = true)],
      ["play wrap", (j) => (j.play.wrap = true)],
      [
        "rulesOut",
        (j) => (j.rulesOut = { name: "x", placing: 1, techniques: ["numberCount"] }),
      ],
    ];
    for (const [at, edit] of parts)
      expect(() =>
        compileEdited(lacing, (j: Lacing) => {
          edit(j);
          return j;
        }),
      ).toThrow(new RegExp(`^${at}: the answer is on the edges, and `));
  });

  it("samples a partition's walls with the value the play paints a wall", () => {
    const fencing = "src/engine/testing/fixtures/fencing/fencing.description.yaml";
    type Fencing = {
      play: { values: Record<string, { paint: string }> };
      deal: { sample: unknown };
    };
    const edited = (edit: (j: Fencing) => void) =>
      compileEdited(fencing, (j: Fencing) => {
        edit(j);
        return j;
      });
    expect(edited(() => {})).toContain(
      '"sample":{"walls":{"division":{"equal":3},"value":1,"rest":2}}',
    );
    // The wall is whichever value is painted one.
    expect(
      edited((j) => {
        j.play.values["1"].paint = "cross";
        j.play.values["2"].paint = "wall";
      }),
    ).toContain('"walls":{"division":{"equal":3},"value":2,"rest":1}');
    expect(() =>
      edited((j) => {
        j.play.values["1"].paint = "line";
      }),
    ).toThrow(/deal sample walls: the play places two values, one painted wall/);
    expect(() =>
      edited((j) => {
        j.deal.sample = { walls: { equal: "k" } };
      }),
    ).toThrow(/deal sample walls: equal parts of k, which is no size/);
    expect(() =>
      compileTents((j: { deal: { sample: unknown } }) => {
        j.deal.sample = { walls: { equal: 3 } };
        return j;
      }),
    ).toThrow(/deal sample walls: the answer is not on the edges/);
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

describe("a clue at a dealt partition's part", () => {
  const cagingSource = "src/engine/testing/fixtures/caging/caging.description.yaml";
  type Json = {
    play: { signs: Record<string, string> };
    deal: Record<string, unknown>;
    settings: { productsOnly: { letter: string } };
    id: Record<string, unknown>[];
  };
  const compileCaging = (over: (json: Json) => unknown): string => {
    const caging = sources.get(cagingSource);
    if (caging === undefined || !isFormal(caging)) throw new Error("no caging");
    return compileGame(
      over(structuredClone(caging) as never) as never,
      [...sources.values()].filter(isLibrary),
      cagingSource,
      "../../../../engine/describe-runtime.ts",
      "./step-voice.ts",
    );
  };

  it("derives a clue whose meaning solves for it by that solution, not by trying each value", () => {
    const out = compileCaging((j) => j);
    const derive = out.slice(out.indexOf("export function deriveClues("));
    const body = derive.slice(0, derive.indexOf("\nexport "));
    // Two kinds, each its value bound once from the cells' numbers.
    expect(body.match(/const v_v = /g)).toHaveLength(2);
    expect(body).not.toMatch(/for \(let v_v\b/);
  });

  it("draws a kind at a part with no sign as its number, and refuses a sign for a kind at none", () => {
    expect(
      compileCaging((j) => {
        delete j.play.signs["sum"];
        return j;
      }),
    ).toContain('"signs":{"product":"×"');
    expect(() =>
      compileCaging((j) => {
        j.play.signs["cand"] = "?";
        return j;
      }),
    ).toThrow(/play signs: cand is no clue kind at a part/);
  });

  it("refuses the parts written before the partition, and a partition both grown and divided", () => {
    expect(() =>
      compileCaging((j) => {
        j.id.reverse();
        return j;
      }),
    ).toThrow(/parts of cage before the partition itself/);
    expect(() =>
      compileCaging((j) => {
        j.deal["grow"] = { partition: "cage", holds: 1 };
        return j;
      }),
    ).toThrow(/deal divide: a partition grown, and one divided/);
  });

  it("refuses one kind a part that leaves out a kind at the parts, and a flag's letter taken", () => {
    expect(() =>
      compileCaging((j) => {
        (j.deal["oneKind"] as { kinds: string[] }).kinds = ["product"];
        return j;
      }),
    ).toThrow(/sum sits at a part, and is none of its kinds/);
    expect(() =>
      compileCaging((j) => {
        j.settings.productsOnly.letter = "d";
        return j;
      }),
    ).toThrow(/settings productsOnly: the letter d is taken/);
  });
});
