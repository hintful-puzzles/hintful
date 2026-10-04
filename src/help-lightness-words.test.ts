/**
 * A help page that calls something black, white, shaded or lit describes a
 * game that paints it so in both schemes.
 *
 * Flip's page says "light up all the squares", and in the dark scheme the lit
 * face was the black one: it was drawn in paper, which inverts with the scheme,
 * so the page asked a dark-scheme player to do the opposite of what the board
 * showed (owner, 2026-10-04). A color the words name is the piece's own, and a
 * piece's color is pinned (`colors.ts`, `BLACK` and `WHITE`).
 *
 * What is checked is that the game's palette **holds** a pinned color of the
 * kind its page names: a color with an authored dark value that is dark, or
 * light, in both schemes. It does not check that the pinned color is the one
 * painted on the thing the sentence is about, which only looking does
 * (`scripts/checks/contact-sheet.test.ts`).
 *
 * A page whose word is not about a piece's color is in {@link NOT_A_PIECE}
 * with what the word is about.
 */
import { describe, expect, it } from "vitest";
import "./games/index.ts";
import { mkhighlightBackground } from "./engine/color/color-mkhighlight.ts";
import { darkValue } from "./engine/color/color-token.ts";
import { getTsGame } from "./engine/registry.ts";
import { colorToOKLCH } from "./engine/testing/oklch.ts";
import type { Color } from "./engine/types.ts";
import { puzzleIds } from "./puzzle/catalog.ts";

const helpPages = import.meta.glob<string>("../help/games/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

type Kind = "dark" | "light";

const WORDS: Record<Kind, RegExp> = {
  dark: /\b(?:black|shad(?:e|ed|es|ing))\b/i,
  light: /\b(?:white|lit|unlit|light(?:s|ed)? up)\b/i,
};

/** `game` to the kinds its page names without meaning a piece's color. */
const NOT_A_PIECE: Record<string, Partial<Record<Kind, string>>> = {
  blackbox: { dark: "the game's name" },
  bridges: { light: "'light up' is what a mistake does, in red" },
  dominosa: { light: "'light up red' is what a clash does" },
  galaxies: { light: "'light up' is what a mistake does, in red" },
  map: { light: "'light up' is what a mistake does, in red" },
  netslide: { light: "a lit square is a powered one, drawn in teal" },
  rome: { dark: "a shaded square is a tint of the board, not a piece" },
  separate: { dark: "a shaded region is a tint of the board, not a piece" },
  slide: { light: "'lights up' is the keyboard selection" },
  tents: { light: "'light up red' is what a miscount does" },
  tracks: { light: "'light up' is what a mistake does, in red" },
};

/** Whether the palette holds a color that is `kind` in both schemes by its own
 * authored values. */
function holdsPinned(palette: readonly Color[], kind: Kind): boolean {
  const is = (c: Color): boolean => {
    const l = colorToOKLCH(c)[0];
    return kind === "dark" ? l < 0.45 : l > 0.8;
  };
  return palette.some((c) => {
    const dark = c && darkValue(c);
    return dark !== null && dark !== undefined && is(c) && is(dark);
  });
}

describe("a lightness a help page names is pinned in the palette", () => {
  it("finds the pages", () => {
    expect(Object.keys(helpPages).length).toBeGreaterThan(50);
  });

  for (const id of puzzleIds) {
    const page = helpPages[`../help/games/${id}.md`] ?? "";
    for (const kind of ["dark", "light"] as const) {
      const named = WORDS[kind].test(page);
      const excused = NOT_A_PIECE[id]?.[kind];
      if (!named) {
        it(`${id}: no stale ${kind} excuse`, () => {
          expect(excused).toBeUndefined();
        });
        continue;
      }
      it(`${id}: the ${kind} thing its page names is pinned`, () => {
        const game = getTsGame(id);
        if (!game) throw new Error(`${id} is not registered`);
        const pinned = holdsPinned(game.colors(mkhighlightBackground([1, 1, 1])), kind);
        // Exactly one of the two: pinned, or excused with what the word means.
        expect(
          pinned,
          `${id}: "${WORDS[kind].exec(page)?.[0]}" (${excused ?? "no excuse"})`,
        ).toBe(excused === undefined);
      });
    }
  }
});
