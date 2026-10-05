import { describe, expect, it } from "vitest";
import type { ParamConfigItem } from "./game.ts";
import { modifierItem, modifiersMarkdown, modifiersOf } from "./modifier.ts";
import { parametersMarkdown } from "./param-help.ts";
import { describeParams } from "./param-label.ts";

interface P {
  wrapping: boolean;
  loops: boolean;
  max: number;
}

const config: ParamConfigItem<P>[] = [
  modifierItem<P>({
    kw: "wrap",
    name: "Walls wrap around",
    type: "boolean",
    when: true,
    words: "wrapping",
    slot: "kind",
    rule: "the network may run off one edge.",
    note: "The grid cannot be 2 wide.",
    get: (p) => p.wrapping,
    set: (p, v) => {
      p.wrapping = v;
    },
  }),
  modifierItem<P>({
    kw: "loops",
    name: "Allow loops",
    type: "boolean",
    when: false,
    words: "no loops",
    slot: "tail",
    rule: "the bridges may not form a loop.",
    get: (p) => p.loops,
    set: (p, v) => {
      p.loops = v;
    },
  }),
  modifierItem<P>({
    kw: "max",
    name: "Max. bridges",
    type: "choices",
    choices: ["1", "2"],
    words: "max bridges",
    rule: "at most two bridges join a pair.",
    label: { slot: "tail", words: (p) => (p.max === 1 ? null : "max 1") },
    get: (p) => p.max,
    set: (p, v) => {
      p.max = v;
    },
  }),
];
const game = { paramConfig: config };

describe("a modifier's declaration is what every surface reads", () => {
  it("says its words in a label exactly when its rule applies", () => {
    expect(describeParams(game, { wrapping: true, loops: true, max: 1 })).toBe(
      "wrapping",
    );
    expect(describeParams(game, { wrapping: false, loops: false, max: 1 })).toBe(
      "no loops",
    );
    expect(describeParams(game, { wrapping: false, loops: true, max: 0 })).toBe(
      "max 1",
    );
  });

  it("lists each modifier for the help under the words a title uses", () => {
    expect(modifiersMarkdown(modifiersOf(game))).toBe(
      [
        "* **Wrapping**: the network may run off one edge.",
        "* **No loops**: the bridges may not form a loop.",
        "* **Max bridges**: at most two bridges join a pair.",
      ].join("\n"),
    );
  });

  it("writes the field's help entry from the same rule, at the value it applies", () => {
    const md = parametersMarkdown(config);
    expect(md).toContain(
      "<dd>When on, the network may run off one edge. The grid cannot be 2 wide.</dd>",
    );
    expect(md).toContain("<dd>When off, the bridges may not form a loop.</dd>");
    expect(md).toContain("<dd>At most two bridges join a pair.</dd>");
  });

  it("finds none on a game that declares none", () => {
    expect(modifiersOf({ paramConfig: [] })).toEqual([]);
  });
});
