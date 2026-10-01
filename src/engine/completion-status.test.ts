/*
 * The status bar's completion words come from one place.
 *
 * The scan keys on what the words *say*, not on a constant's name: the copies
 * this replaced were typed out ("COMPLETE!", "Auto solved", a trailing space),
 * and a grep for `COMPLETED` would have found only the ones spelled right. It
 * reads string literals and template text only, so a comment may still quote
 * the words.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  AUTO_SOLVED,
  AUTO_SOLVER_USED,
  COMPLETED,
  completionStatus,
} from "./completion-status.ts";

describe("completionStatus", () => {
  it("names each of the four states, and only the rest when there is nothing to say", () => {
    expect(completionStatus(false, false, "Moves: 3")).toBe("Moves: 3");
    expect(completionStatus(true, false, "Moves: 3")).toBe(`${COMPLETED} Moves: 3`);
    expect(completionStatus(true, true, "Moves: 3")).toBe(`${AUTO_SOLVED} Moves: 3`);
    expect(completionStatus(false, true, "Moves: 3")).toBe(
      `${AUTO_SOLVER_USED} Moves: 3`,
    );
  });

  it("leaves no trailing space when the rest is empty", () => {
    expect(completionStatus(true, false)).toBe(COMPLETED);
    expect(completionStatus(false, false)).toBe("");
  });
});

const gameSources = import.meta.glob<string>("../games/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The retired spellings and the live ones, as a player reads them. */
const WORDS = /COMPLETED?!|Auto[- ]solve(d|r used)/i;

describe("no game spells the completion words itself", () => {
  it("finds them in no string a game writes", () => {
    const files = Object.entries(gameSources).filter(([p]) => !p.endsWith(".test.ts"));
    // Vacuity: an unmatched glob yields `{}`.
    expect(files.length).toBeGreaterThan(150);

    const offenders: string[] = [];
    let strings = 0;
    for (const [path, text] of files) {
      const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
      const visit = (n: ts.Node): void => {
        if (
          ts.isStringLiteral(n) ||
          ts.isNoSubstitutionTemplateLiteral(n) ||
          ts.isTemplateHead(n) ||
          ts.isTemplateMiddle(n) ||
          ts.isTemplateTail(n)
        ) {
          strings++;
          if (WORDS.test(n.text)) {
            const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
            offenders.push(`${path}:${line}: ${JSON.stringify(n.text)}`);
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    expect(strings).toBeGreaterThan(1000);
    expect(offenders, "use completionStatus from completion-status.ts").toEqual([]);
  });

  it("would see a copy — the pattern matches every spelling it replaced", () => {
    for (const copy of [
      "COMPLETED! ",
      "COMPLETE!",
      "Auto solved",
      "Auto-solved. ",
      "Auto-solver used. ",
    ]) {
      expect(WORDS.test(copy), copy).toBe(true);
    }
  });
});
