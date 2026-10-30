import { describe, expect, it } from "vitest";
import { PARAMETERS_PLACEHOLDER } from "../engine/param-help.ts";
import type { HelpJson } from "./description.ts";
import { renderHelpPage } from "./help-page.ts";

const facts = { name: "Test", rulesets: false, parameters: PARAMETERS_PLACEHOLDER };

const help: HelpJson = {
  rules: "Play it.",
  controls: "Click.\n\n### Keyboard\n\nType.",
  sections: [{ heading: "Notes", body: "A note." }],
  origins: "Invented by someone.",
  hints: "Hint words.",
  parameters: { before: "Before.", after: "After." },
};

describe("a help page rendered from its description", () => {
  it("writes the sections in the one order, under the renderer's headings", () => {
    expect(renderHelpPage(help, facts, "t.yaml")).toBe(
      [
        "# Test",
        "Play it.",
        "## Controls",
        "Click.\n\n### Keyboard\n\nType.",
        "## Notes",
        "A note.",
        "## Where the puzzle comes from",
        "Invented by someone.",
        "## Hints",
        "Hint words.",
        "## Test parameters",
        "Before.",
        PARAMETERS_PLACEHOLDER,
        "After.",
      ].join("\n\n") + "\n",
    );
  });

  it("heads a game with rulesets' origins in the plural", () => {
    expect(renderHelpPage(help, { ...facts, rulesets: true }, "t.yaml")).toContain(
      "\n## Where the puzzles come from\n",
    );
  });

  it("writes the parameter list where a page has no prose for it", () => {
    const page = renderHelpPage({ rules: "r", controls: "c" }, facts, "t.yaml");
    expect(page.endsWith(`## Test parameters\n\n${PARAMETERS_PLACEHOLDER}\n`)).toBe(
      true,
    );
  });

  it("refuses a section heading in a prose field, naming the file and field", () => {
    const bad = { ...help, controls: "Click.\n\n## Keyboard\n\nType." };
    expect(() => renderHelpPage(bad, facts, "t.yaml")).toThrow(
      /^t\.yaml: help\.controls writes a heading \("## Keyboard"\)/,
    );
  });

  it("refuses the parameter list's placeholder in a prose field", () => {
    const bad = { ...help, hints: `Hints. ${PARAMETERS_PLACEHOLDER}` };
    expect(() => renderHelpPage(bad, facts, "t.yaml")).toThrow(
      /^t\.yaml: help\.hints writes \{\{parameters\}\}/,
    );
  });
});
