/**
 * Each check `npm run describe` makes of a description, seen to fire on a
 * planted wording or formula and to pass the same one put right. That every
 * description passes them is `compile.test.ts`'s.
 */
import { describe, expect, it } from "vitest";
import type { LibraryJson, StatedSays } from "./description.ts";
import { lintDescription } from "./lint.ts";

/** A library of one technique that says `says`, read from `forClause`. */
const library = (says: StatedSays, forClause = "c in cells"): LibraryJson => ({
  library: "t",
  techniques: { x: { for: forClause, conclude: "strike(c, 1)", says } },
});

const messages = (says: StatedSays, forClause?: string): string[] =>
  lintDescription(library(says, forClause)).map(
    (f) => `${f.error ? "E" : "W"} ${f.message}`,
  );

describe("npm run describe holds a wording to the render's rules", () => {
  it("passes a wording that keeps them", () => {
    expect(
      messages({
        look: "{outline: the outlined square} sees 2",
        move: "{ring} must go",
      }),
    ).toEqual([]);
  });

  it.each([
    ["a place word outside a reference", "a 2 there would see {outline}", /"there"/],
    ["a role's word outside a reference", "the outlined square sees 2", /"outlined"/],
    ["a retired verb", "{outline} would rule out 2", /"rule out", a retired phrase/],
    ["a retired closing", "{outline} is out", /"is out", a retired phrase/],
    [
      "a bare pro-form as a reference",
      "{outline: the rest} sees 2",
      /a bare "the rest"/,
    ],
    ["a clause as a reference", "{outline: the square must be 2} holds", /is a clause/],
    [
      "another role's word in a reference",
      "{outline: the ringed square} sees 2",
      /says "ringed"/,
    ],
    [
      "one deictic noun in two roles",
      "{outline: this square} sees {ring: this square}",
      /beside another reference/,
    ],
    [
      "a fault in one form of an if only",
      "{outline} sees {if f: 2 | 2 there}",
      /"there"/,
    ],
  ])("refuses %s", (_, look, why) => {
    const found = messages({ look, move: "{ring} must go" });
    expect(found.length).toBeGreaterThan(0);
    expect(found.join("\n")).toMatch(why);
  });
});

describe("npm run describe bounds a wording's length", () => {
  const long = `{outline} ${"sees a long way ".repeat(7)}`;

  it("asks for long: on a wording past the limit on every board", () => {
    expect(messages({ look: long, move: "{ring} must go" }).join("\n")).toMatch(
      /runs to \d+ characters at its shortest/,
    );
  });

  it("takes long: with its reason there", () => {
    expect(
      messages({
        look: long,
        move: "{ring} must go",
        long: "Planted: a wording that says a long way on every board, for the check.",
      }),
    ).toEqual([]);
  });

  it("takes long: where only the longest form of a fit runs past", () => {
    expect(
      messages({
        look: `{outline} sees {fit: ${"far ".repeat(30)}| near}`,
        move: "{ring} must go",
      }),
    ).toEqual([]);
  });

  it("refuses long: on wordings no board makes long", () => {
    expect(
      messages({
        look: "{outline} sees 2",
        move: "{ring} must go",
        long: "Planted: a reason for room that the wording never needs, for the check.",
      }).join("\n"),
    ).toMatch(/every wording it covers fits/);
  });

  it("holds a wording to the long: of the part it is said under", () => {
    expect(
      messages({
        look: "{outline} sees 2",
        move: "{ring} must go",
        long: "Planted: a part's reason, which covers the wording below that needs it.",
        wordings: [{ when: "true", look: long }],
      }),
    ).toEqual([]);
  });
});

describe("npm run describe names a whole-board read a local one would do", () => {
  it.each([
    [
      "a binder kept near another",
      "c in cells, D = {e in cells where not known(e) and e in adj4(c)}",
    ],
    [
      "a binder kept near a set's elements",
      "c in cells, D = {e in cells where exists d in adj4(c): e in adj4(d)}",
    ],
  ])("warns of %s", (_, forClause) => {
    const found = messages(
      { look: "{outline} sees 2", move: "{ring} must go" },
      forClause,
    );
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^W .*reads the whole board each time: bind e in /);
  });

  it("says nothing of the local form", () => {
    expect(
      messages(
        { look: "{outline} sees 2", move: "{ring} must go" },
        "c in cells, D = {e in set(q over d in adj4(c), q in adj4(d)) where not known(e)}",
      ),
    ).toEqual([]);
  });
});
