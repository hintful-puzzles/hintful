/**
 * Every hint step of the games that build theirs through the engine speaks the
 * same words and paints the same marks as it did when the step was built by
 * hand (`openspec/changes/build-hint-steps-in-the-engine`). The snapshot is one
 * line a board (`testing/hint-walk-fingerprint.ts`). To read a difference, run
 * this with `VITE_HINT_WALK` set to a word of the board's name, at the commit
 * before and the commit after: each walk it matches is thrown as the error's
 * text, which is what a run prints in full.
 */
import { describe, expect, it } from "vitest";
import { HINT_GAMES } from "./testing/hint-games.ts";
import { fingerprint, walkLines } from "./testing/hint-walk-fingerprint.ts";
import { dealtBoards } from "./testing/presets.ts";
import { itSlow } from "./testing/slow.ts";

/** The games moved onto the engine's steps so far; Slant, Loopy and Net,
 * whose words are held while they move onto the fact graph
 * (`explain-a-firing-by-its-witness-and-parents` 3.4); and the candidate
 * games, each enrolled before it moves onto its compiled firings
 * (`hint-candidate-games-from-firings`). */
const MOVED = [
  "unruly",
  "singles",
  "boats",
  "bridges",
  "lightup",
  "mosaic",
  "clusters",
  "starbattle",
  "bricks",
  "range",
  "sticks",
  "separate",
  "palisade",
  "dominosa",
  "pearl",
  "tracks",
  "path",
  "spokes",
  "signpost",
  "rect",
  "tents",
  "galaxies",
  "magnets",
  "map",
  "slant",
  "loopy",
  "net",
  "abcd",
  "seismic",
  "rome",
  "salad",
  "unequal",
  "adjacent",
  "keen",
  "towers",
  "group",
  "solo",
  "mathrax",
  "undead",
  "crossing",
];

/** The boards dealt a preset: one on every commit, and in the slow tier three
 * more, so a rare rung is more likely met (docs/testing.md § "Right-sizing the
 * gate"). */
const DEALS = [0];
const MORE_DEALS = [1, 2, 3];

const show = (import.meta.env as unknown as Record<string, string | undefined>)[
  "VITE_HINT_WALK"
];

describe("hint walks", () => {
  for (const [id, game] of HINT_GAMES) {
    if (!MOVED.includes(id)) continue;
    // The gate's slice in either tier, since `gatePresets` deals every preset
    // in the slow one and the snapshots hold the slice's.
    const presets = dealtBoards(game, { scalarEnds: false });
    const walks = async (deals: readonly number[], file: string): Promise<void> => {
      const boards = presets.flatMap(({ title, params }) =>
        deals.map((n) => ({ title, params, n })),
      );
      if (show !== undefined) {
        const shown = boards
          .filter((b) => `${id} ${b.title}`.includes(show))
          .map(
            (b) =>
              `${id} ${b.title} #${b.n}\n${walkLines(game, b.params, b.n).lines.join("\n")}`,
          );
        throw new Error(shown.join("\n\n"));
      }
      const lines = boards.map(({ title, params, n }) =>
        fingerprint(game, title, params, n),
      );
      await expect(`${lines.join("\n")}\n`).toMatchFileSnapshot(
        `./__snapshots__/${file}.txt`,
      );
    };
    it(`${id}: every step's words and marks`, () => walks(DEALS, `hint-walk-${id}`));
    itSlow(`${id}: every step's words and marks, on more boards`, () =>
      walks(MORE_DEALS, `hint-walk-${id}-more`),
    );
  }
});
