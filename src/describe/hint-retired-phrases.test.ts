/**
 * The phrases the hint vocabulary retired (`wording-rules.ts`), checked at the
 * source of every hinting game and of the engine's shared narration, the way
 * `hint-em-dash.test.ts` checks the em-dash. A description's wordings are
 * checked when it compiles (`describe/lint.ts`), and its compiled module is
 * scanned here as well.
 *
 * The scan is a superset (any code line, not only a narration string), and the
 * population is derived (`HINT_GAMES`), so a game that joins is held at once.
 */
import { describe, expect, it } from "vitest";
import {
  IS_OUT,
  KEEPS_IS_OUT_PRODUCES,
  RETIRED_PHRASE as RETIRED,
} from "../engine/contract/wording-rules.ts";
import {
  engineCodeLinesMatching,
  SCANNED_ENGINE_FILES,
} from "../engine/testing/engine-source.ts";
import {
  codeLinesMatching,
  SCANNED_SOURCE_FILES,
} from "../engine/testing/enrollment.ts";
import { HINT_GAMES } from "../engine/testing/hint-games.ts";
import { loadDescriptionFile } from "./load.ts";

/** Loopy's preference label, which names a setting and not a hint step; a
 * label is the player's to be asked about, so it is left as it is. */
const SETTING_LABEL = /^name: "Rule out edges that counting has already settled",?$/;

const descriptions = import.meta.glob<string>("../games/*/*.description.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** The games whose description's `produces` keeps "is out", as the
 * compiler's lint reads it. */
const KEEPS_IS_OUT = new Set(
  Object.entries(descriptions).flatMap(([path, text]) => {
    const file = loadDescriptionFile(text, path);
    return "produces" in file && file.produces === KEEPS_IS_OUT_PRODUCES
      ? [file.game]
      : [];
  }),
);

describe("no hint says a retired phrase", () => {
  it("scanned a populated source tree", () => {
    expect(SCANNED_SOURCE_FILES).toBeGreaterThan(100);
    expect(SCANNED_ENGINE_FILES).toBeGreaterThan(50);
    expect(HINT_GAMES.length).toBeGreaterThan(25);
    expect(Object.keys(descriptions).length).toBeGreaterThan(25);
    expect(HINT_GAMES.some(([id]) => KEEPS_IS_OUT.has(id))).toBe(true);
  });

  it("holds every hinting game to the retired verb and the retired clause", () => {
    const hits = codeLinesMatching(
      HINT_GAMES.map(([id]) => id),
      RETIRED,
    ).filter((h) => !SETTING_LABEL.test(h.line));
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });

  it('holds every hinting game but the code-breaking ones to "is out"', () => {
    const hits = codeLinesMatching(
      HINT_GAMES.map(([id]) => id).filter((id) => !KEEPS_IS_OUT.has(id)),
      IS_OUT,
    );
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });

  it("holds the engine's shared narration to both", () => {
    // The rules' own module states the phrases it retires.
    const hits = [
      ...engineCodeLinesMatching(RETIRED),
      ...engineCodeLinesMatching(IS_OUT),
    ].filter((h) => h.id !== "engine/contract/wording-rules.ts");
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });
});
