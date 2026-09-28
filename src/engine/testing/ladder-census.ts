/**
 * The firing census every `runDeductionFixpoint` ladder is certified with.
 *
 * **Why a ladder needs more than its differential.** A fixture corpus certifies
 * only the rungs it fires, and nothing in a fixture file says which those are:
 * deleting one of Tracks' eight rungs entirely left all its tests green, because
 * that rung fires on no board its generator produces. So each game walks its
 * ladder over a corpus at every cap (the cap is what selects rungs) and asserts
 * which rungs the corpus reached. A rung it cannot reach is named in
 * `unreached` with its reason, a visible shortfall rather than an absent one.
 *
 * **What it cannot see is a rung that fires and is not needed.** Other rungs can
 * reach the same conclusion, and then silencing one leaves the board unchanged;
 * docs/games/solver-and-generator.md § "Proving an adoption" says how to find
 * out. Each adoption was once proved against the hand-written loop it replaced,
 * which git keeps; the census is what stays live.
 *
 * The harness declares its own `describe`/`it` blocks, so a game's test file is
 * the declaration and nothing else.
 */
import { describe, expect, it } from "vitest";
import type { FiringTally } from "../deduction-fixpoint.ts";

export interface LadderCensusSpec<Board> {
  /** The game, for test names. */
  game: string;
  /** Every rung id the ladder declares, in ladder order. */
  rungs: readonly string[];
  /**
   * Rungs this corpus never fires, each mapped to the reason it cannot.
   *
   * **Empty is the goal.** An entry is a rung whose behavior nothing here
   * certifies, so it is a live shortfall: the `NO_KEYBOARD` shape
   * (`docs/games/testing.md` § "How a cross-game guard finds its population").
   */
  unreached: Readonly<Record<string, string>>;
  /** The caps to walk each board at: the game's own tier values. */
  caps: readonly number[];
  /** One labeled case per board; the factory is called fresh per cap. */
  cases: readonly { label: string; board: () => Board }[];
  /**
   * The solver, taking the tally it forwards to `runDeductionFixpoint`'s
   * `firings` option.
   *
   * **Why a game's solver carries a parameter only a test supplies.** A rung's
   * reachability cannot be observed from the game's own results, which is this
   * file's whole premise, so the game has to hand the census a channel. The
   * runner does the counting; the game forwards the map and nothing else.
   */
  solve: (board: Board, cap: number, firings: FiringTally) => unknown;
}

export function describeLadderCensus<Board>(spec: LadderCensusSpec<Board>): void {
  const { game, rungs, unreached, caps, cases, solve } = spec;

  describe(`${game}: every rung of the ladder fires on the corpus`, () => {
    // One tally across every board and cap: the census asks which rungs the
    // *corpus* reaches, not which a single board does.
    const fired: FiringTally = new Map();
    let solved = 0;

    for (const { label, board } of cases) {
      it(`${label}: solves at every cap`, () => {
        for (const cap of caps) {
          solve(board(), cap, fired);
          solved++;
        }
      });
    }

    it("walked a real corpus, and fired every rung it claims to", () => {
      // Vacuity: a census over nothing reports every rung unreached, which the
      // ledger check below would read as a mismatch, but say it plainly.
      expect(solved, `${game}: no board was solved`).toBeGreaterThanOrEqual(
        cases.length * caps.length,
      );
      expect(
        rungs.length,
        `${game}: a ladder with no rungs certifies nothing`,
      ).toBeGreaterThan(0);

      // A rung present with a zero count would be a rung that never fired, so
      // membership alone is not the question the census asks.
      const missing = rungs.filter((id) => (fired.get(id) ?? 0) === 0).sort();
      expect(
        missing,
        `${game}: a rung this corpus never fires is a rung this file does not ` +
          "certify: widen the cases until it does, or record it in `unreached` " +
          "with the reason",
      ).toEqual(Object.keys(unreached).sort());

      // The ledger's own honesty check: an entry for a rung that is not in the
      // ladder at all would be a permanent excuse nothing could retire.
      expect(
        Object.keys(unreached).filter((id) => !rungs.includes(id)),
        `${game}: \`unreached\` names a rung the ladder does not have`,
      ).toEqual([]);
      // And every fired id is a declared rung, so a renamed rung cannot fire
      // under a name the census does not know.
      expect([...fired.keys()].filter((id) => !rungs.includes(id))).toEqual([]);
    });
  });
}
