import { describe, expect, it } from "vitest";
import { difficultyItem, tierNames } from "./difficulty.ts";
import type { ParamConfigItem } from "./game.ts";
import { parametersMarkdown } from "./param-help.ts";
import { describeParams, presetMenu } from "./param-label.ts";
import { dimensionParamConfig, numberItem } from "./params.ts";

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
  {
    kw: "mode",
    name: "Mode",
    type: "choices",
    choices: ["Plain", "Fancy"],
    doc: "Plain or Fancy.",
    label: { slot: "lead" },
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v;
    },
  },
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
