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
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { fingerprint, walkLines } from "./testing/hint-walk-fingerprint.ts";

/** The games moved onto the engine's steps so far. */
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
];

/** The boards dealt a preset: more than one, so a rare rung is more likely met. */
const DEALS = [0, 1, 2, 3];

const show = (import.meta.env as unknown as Record<string, string | undefined>)[
  "VITE_HINT_WALK"
];

describe("hint walks", () => {
  for (const [id, game] of HINT_GAMES) {
    if (!MOVED.includes(id)) continue;
    it(`${id}: every step's words and marks`, async () => {
      const boards = gatePresets(game).flatMap(({ title, params }) =>
        DEALS.map((n) => ({ title, params, n })),
      );
      if (show !== undefined) {
        const walks = boards
          .filter((b) => `${id} ${b.title}`.includes(show))
          .map(
            (b) =>
              `${id} ${b.title} #${b.n}\n${walkLines(game, b.params, b.n).lines.join("\n")}`,
          );
        throw new Error(walks.join("\n\n"));
      }
      const lines = boards.map(({ title, params, n }) =>
        fingerprint(game, title, params, n),
      );
      await expect(`${lines.join("\n")}\n`).toMatchFileSnapshot(
        `./__snapshots__/hint-walk-${id}.txt`,
      );
    });
  }
});
