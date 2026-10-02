# one-game-id: design

## D1. Keep the name `currentGameId`, drop `restoreGameId`

Most consumers already read `currentGameId` (views, dialogs, autosave lookup,
win message). Renaming the survivor would be churn with no reader. The one
consumer of `restoreGameId` in production was the screen's remembered board,
and `Puzzle.currentParams`, which now reads the same prefix from
`currentGameId`.

## D2. Why the full params are safe to share

- **Upstream reads them.** `decode_params` parses the difficulty suffix. It is
  the same parser upstream's own `params#seed` IDs have always gone through,
  and those carry full params.
- **This app reads both forms.** `withBoardTier` grades an ID whose params
  cannot tell tiers apart, and for an ID that states a tier it keeps that tier
  only if the board solves there. So a full ID cannot mislabel a board, and an
  upstream ID still opens at the tier its board needs.
- **Generation-only fields are harmless.** A `:desc` ID validates its params
  with `full = false`, so a field that only bounds generation (Tracks'
  `singleOnes`, say) never refuses a board.

## D3. What a player sees change

The Game ID and both kinds of link name the tier. An autosave written under
the short ID no longer matches a link to the same board, so opening that link
deals the board fresh, without the moves. Opening the puzzle normally still
restores its autosave. The owner waived compatibility for this change.
