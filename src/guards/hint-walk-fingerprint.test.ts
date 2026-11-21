/**
 * Every hinting game's hint walk speaks the same words and paints the same
 * marks as at the snapshot, so a change to shared hint code says which games'
 * steps it moved. The snapshot is one line a board
 * (`testing/hint-walk-fingerprint.ts`). To read a difference, run this with
 * `VITE_HINT_WALK` set to a word of the board's name, at the commit before and
 * the commit after: each walk it matches is thrown as the error's text, which
 * is what a run prints in full. A new game writes its lines with `-u`
 * (docs/testing.md § "A game's verdict in one command").
 */
import { describe, expect, it } from "vitest";
import { HINT_GAMES } from "../engine/testing/hint-games.ts";
import { fingerprint, walkLines } from "../engine/testing/hint-walk-fingerprint.ts";
import { dealtBoards } from "../engine/testing/presets.ts";
import { itSlow } from "../engine/testing/slow.ts";

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
