# one-game-id

Asked for by the owner (2026-10-02), after `share-boards-not-seeds`: *"Yes,
please merge. I want all simplifications we can get to make things more
consistent and maintainable. No need for backward compatibility here."*

## Why

The midend emitted two IDs for one board: `currentGameId`, `params:desc` with
the difficulty left out as upstream's game IDs do, to show and share; and
`restoreGameId`, with full params, to remember and reopen. Every consumer had
to pick the right one. Picking wrong had already cost a defect: storing the
sharing ID reopened every tiered puzzle at its default difficulty
(`remember-the-difficulty-of-a-dealt-board`). The comments, a test fake and a
spec paragraph existed only to keep the two apart.

Leaving the tier out bought nothing a full ID lacks. Upstream decodes full
params in a game ID; its own seed IDs always carried them. The midend grades an
ID without a tier on the way in (`withBoardTier`) and checks a stated tier with
one solve, so a full ID loses nothing either.

## What Changes

- **One game ID.** The midend emits `currentGameId` as `params:desc` with the
  full params. `restoreGameId` is gone from the notification and from
  `Puzzle`. That one ID is shown, shared, linked, autosaved, remembered, and
  read for the type-menu label.
- The screen remembers the last board by `currentGameId`. The comment
  explaining why it must not do that is deleted, because it no longer applies.
- Tests drop their two-ID fakes. `midend.test.ts` asserts that the notification
  carries exactly `currentGameId`, and that the ID round-trips the tier while an
  upstream-style ID without a tier still opens.
- **Compatibility, waived by the owner:** an autosave recorded under the old
  short ID is no longer found when the same board is reopened from a link, so
  that link deals the board fresh. Autosaves still restore on opening the
  puzzle. The Game ID and links now show the tier (`8x8dt:…` rather than
  `8x8:…`).

## Hints to pull in

None.
