# share-boards-not-seeds: design

## D1. Remove the seed at the source, not at each surface

The previous change removed one seed link and reworded the field beside it.
That fixed a surface and left the hazard: anything reading `Puzzle.randomSeed`
could hand a seed out again. Removing the seed from `NotifyGameIdChange` makes
the rule structural. A new surface cannot share a seed because none reaches
the app, and the typechecker found every consumer the moment the field went:
the Share dialog, the Enter-ID dialog, the win message, the Sentry context, and
two tests. `midend.test.ts` asserts the notification's exact keys, so adding a
seed back fails a test as well as reading as a deliberate act.

The midend still deals from seeds (`freshSeed`, and `#seed` IDs it is handed).
It just keeps them to itself, and its `seed` field, which existed only to feed
the notification, is gone.

## D2. Each consumer, and why it does not need the seed

- **Share link and Random seed field.** Replaced by the game ID; the field is
  removed. The game ID is the one ID that keeps naming the same board.
- **Enter-ID dialog.** It compared the typed ID against both IDs to tell
  "this board" from "a new one". Shared links now carry the game ID, so that
  comparison is enough. An old seed link to the board in progress is treated
  as a new game: it may now deal a different board, so that is the honest
  answer.
- **Win message.** It hashed the seed first, so the same board showed
  different messages depending on how it was opened. It now hashes the game
  ID.
- **Sentry context.** It recorded the seed of a board already dealt, which the
  game ID reproduces exactly. A crash *during* generation happens before any ID
  is emitted, so the seed recorded was never the one that crashed.

## D3. Kept: two board IDs

The sharing ID (`currentGameId`, lossy params, upstream's game-ID form) and
the restoring ID (full params) remain separate. Collapsing them would be
simpler, but the autosave is matched on the sharing ID, so it would change
persisted data, and it would not touch the seed hazard this change exists to
remove. A shared board's tier is re-derived by grading when it is opened
(`withBoardTier`), so the lossy form names no board it shouldn't.
