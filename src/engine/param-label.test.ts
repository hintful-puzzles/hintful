import { describe, expect, it } from "vitest";
import { difficultyItem, tierNames } from "./difficulty.ts";
import type { ParamConfigItem } from "./game.ts";
import { expandChoices, parametersMarkdown } from "./param-help.ts";
import { describeParams, presetMenu } from "./param-label.ts";
import { dimensionParamConfig, numberItem } from "./params.ts";
import { rulesetField, rulesetItem, rulesetsMarkdown } from "./ruleset.ts";

interface P {
  w: number;
  h: number;
  diff: number;
  mode: number;
  loops: boolean;
  count: number;
}

const base: P = { w: 7, h: 7, diff: 1, mode: 0, loops: true, count: 5 };

const config: ParamConfigItem<P>[] = [
  rulesetItem<P>(
    [
      { name: "Plain", rule: "nothing is added." },
      { name: "Fancy", rule: "corners count *twice*." },
    ],
    "mode",
  ),
  ...dimensionParamConfig<P>({ doc: "Size of the grid.", bounds: { min: 3 } }),
  difficultyItem<P>(tierNames(3), "diff"),
  {
    kw: "loops",
    name: "Allow loops",
    type: "boolean",
    doc: "Whether loops are allowed.",
    label: { slot: "tail", words: (p) => (p.loops ? null : "no loops") },
    get: (p) => p.loops,
    set: (p, v) => {
      p.loops = v;
    },
  },
  numberItem<P>("count", "Count", "count", {
    doc: "How many.",
    bounds: { min: 1, max: 9 },
    label: { slot: "tail", words: (p) => `${p.count} things` },
  }),
];

describe("describeParams composes the slots in the one order", () => {
  it("reads lead: size tier, tails", () => {
    expect(describeParams({ paramConfig: config }, base)).toBe(
      "Plain: 7x7 Normal, 5 things",
    );
  });

  it("leaves out a field whose words are null, and joins tails with commas", () => {
    const p = { ...base, loops: false, diff: 2 };
    expect(describeParams({ paramConfig: config }, p)).toBe(
      "Plain: 7x7 Tricky, no loops, 5 things",
    );
  });

  it("starts with a tail when nothing else is said", () => {
    const only = config.filter((i) => i.kw === "count");
    expect(describeParams({ paramConfig: only }, base)).toBe("5 things");
  });
});

describe("presetMenu titles a leaf from its params unless it is named", () => {
  it("derives the unnamed and keeps the named", () => {
    const menu = presetMenu({
      paramConfig: config,
      presets: () => ({
        title: "Type",
        submenu: [{ params: base }, { title: "Standard", params: { ...base, w: 9 } }],
      }),
    });
    expect(menu.submenu?.map((m) => m.title)).toEqual([
      "Plain: 7x7 Normal, 5 things",
      "Standard",
    ]);
  });
});

describe("presetMenu gives each ruleset a section", () => {
  const fancy = { ...base, mode: 1 };
  const menuOf = (presets: P[]) =>
    presetMenu({
      paramConfig: config,
      presets: () => ({
        title: "Type",
        submenu: presets.map((params) => ({ params })),
      }),
    });

  it("sections interleaved presets in the field's order, keeping each one's", () => {
    const menu = menuOf([fancy, base, { ...fancy, w: 9 }, { ...base, w: 9 }]);
    expect(menu.submenu?.map((s) => s.title)).toEqual(["Plain", "Fancy"]);
    expect(menu.submenu?.[1]?.submenu?.map((m) => m.title)).toEqual([
      "Fancy: 7x7 Normal, 5 things",
      "Fancy: 9x7 Normal, 5 things",
    ]);
  });

  it("leaves a menu of one ruleset flat", () => {
    expect(menuOf([base, { ...base, w: 9 }]).submenu?.[0]?.params).toEqual(base);
  });

  it("refuses a section of the game's own, which could mix them", () => {
    const nested = {
      paramConfig: config,
      presets: () => ({
        title: "Type",
        submenu: [{ title: "More", submenu: [{ params: base }, { params: fancy }] }],
      }),
    };
    expect(() => presetMenu(nested)).toThrow(/flat/);
  });
});

describe("a ruleset declaration is what every surface reads", () => {
  it("is found on the game, with each ruleset's rule", () => {
    const field = rulesetField({ paramConfig: config });
    expect(field?.choices).toEqual(["Plain", "Fancy"]);
    expect(field?.rulesets[1]?.rule).toBe("corners count *twice*.");
    expect(rulesetField({ paramConfig: config.slice(1) })).toBeNull();
  });

  it("lists the rulesets for the help, one line each", () => {
    expect(
      rulesetsMarkdown(rulesetField({ paramConfig: config })?.rulesets ?? []),
    ).toBe("* Plain: nothing is added.\n* Fancy: corners count *twice*.");
  });

  it("names every ruleset in the field's own help entry", () => {
    expect(parametersMarkdown(config)).toContain(
      "<dt>Game mode</dt>\n\t<dd>Which puzzle to play: Plain or Fancy.",
    );
  });
});

describe("choiceName and expandChoices say a choice in the dialog's word", () => {
  it("expands a placeholder to the choice's name", () => {
    expect(expandChoices(config, "In {{choice:ruleset:1}} mode.")).toBe(
      "In Fancy mode.",
    );
  });

  it.each([
    ["{{choice:ruleset:2}}", /no choice 2/],
    ["{{choice:loops:0}}", /no choices field "loops"/],
    ["{{choice:ruleset:Fancy}}", /by index/],
    ["{{choice:ruleset}}", /is not \{\{choice/],
  ])("refuses %s", (source, why) => {
    expect(() => expandChoices(config, source)).toThrow(why);
  });
});

describe("parametersMarkdown, over the same fields", () => {
  const md = parametersMarkdown(config);

  it("lists width and height as one entry with their shared range", () => {
    expect(md).toContain(
      "<dt>Width, Height</dt>\n\t<dd>Size of the grid. Each must be at least 3.</dd>",
    );
  });

  it("states a single field's range", () => {
    expect(md).toContain("<dd>How many. It must be between 1 and 9.</dd>");
  });

  it("says what the tier names mean for every tiered game", () => {
    expect(md).toContain('href="../features#difficulty"');
  });
});
