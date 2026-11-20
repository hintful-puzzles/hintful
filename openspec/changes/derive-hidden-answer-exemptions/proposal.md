## Why

Found on 2026-11-20 by `scaffold-a-hidden-answer-game`'s first verdict on a
stamp of the `code` skeleton. Four cross-game guards keep a hand-kept ledger
of exempt games, keyed by id, and a hidden-answer game is in each for a
reason true of its whole kind, not of the game:

- `src/engine/input-parity.test.ts`, `KEYPAD_WITHOUT_PENCIL` (Guess,
  Wordguess): a value is entered only by its key, a tap choosing the square.
- `src/engine/move-judge-games.test.ts`, `UNJUDGED` (Guess, Blackbox:
  `HIDDEN`): the answer is hidden, so no probe is forced.
- `src/engine/position-status.test.ts`, `UNBREAKABLE` (Guess, Wordguess,
  Blackbox): a won game takes no more guesses.
- `src/engine/wrong-entry-check.test.ts`, `UNREACHED` (Guess): a guess is a
  probe and never a claim.

So every new game of the kind owes four entries by hand, each restating the
kind, and the doctrine is that a guard derives its population from what a
game is ("Declare what the engine consumes; refuse a second copy"). The
vision is dozens of new games, with code-breaking and word games a family the
owner asked for.

Widened on 2026-11-20 by `architectural-review` item 4. Its census of
game-keyed collections in cross-game tests found 54 collections holding 378
entries, 94 of them with a reason true of a whole kind of game. The same
shape appears beyond the four ledgers above:

- Hidden answer, missed above: `ALWAYS_SOLVABLE` (`no-solution-load.test.ts`),
  Mines alone in `untiered-load.test.ts`, `BINDS_A_SHORTCUT_LETTER.wordguess`
  (`src/puzzle/shortcuts.test.ts`), `KEYPAD_WITHOUT_PENCIL.filling`, and
  `SETS.guess` in `scripts/checks/color-dark-check.test.ts`.
- `UNJUDGED`'s `OWN_SOLVER` entries (Ascent, Mines, Undead): the game's hint
  is not built by the engine's walk.
- Nothing to deduce: `NARRATES_MOVES` (`hint-quality.test.ts`) holds 7
  games, all of which declare `finishesByDeduction = nothingToDeduce`.
- Beveled tiles: Fifteen, Sixteen and Twiddle in `CLOSE_ON_PURPOSE`
  (`src/puzzle/neighbor-contrast.test.ts`).
- Copies of a game's own declaration: `color-dark-check`'s `SETS` copies
  each game's palette ranges from its enum, and `hint-resume.test.ts` writes
  `LATIN` twice.
- A migration roster: `MOVED` in `hint-walk-fingerprint.test.ts` lists 40
  games "moved onto the engine's steps so far". Derive it from how each game
  builds its hint, or retire it if the migration is done.

## What Changes

- Each guard reads the kind from what the game is, not from a list: a
  description whose `freedom` is `query` (the hidden-answer kind's), or the
  shared row mechanic's `WorkingRow` on its `Ui`, whichever is the one the
  engine already consumes. Whether all four exemptions follow from that one
  fact, or some need a second (Blackbox has no working row), is the first
  question; a ledger entry stays only where the reason is the game's own.
- Each guard keeps seeing a planted defect in a hidden-answer game that the
  exemption must not hide.

## Impact

The guard files named above; `docs/testing.md` § "What a game owes the cross-game
guards" where it names the ledgers. No player-visible change.
