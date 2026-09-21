# ts-engine — delta

## MODIFIED Requirements

### Requirement: The engine serializes Ui state a move-log replay cannot reconstruct

The engine SHALL support optional `encodeUi(ui): string` / `decodeUi(ui, encoded): void`
`Game` hooks (upstream `encode_ui`/`decode_ui`). The midend SHALL write `encodeUi(ui)` into
the save envelope's `ui` field when the hook is present, and — after rebuilding state 0 and
replaying the move log on load — SHALL restore it via `decodeUi`. A game without the hooks
SHALL save no `ui` field, and its `Ui` SHALL be reconstructed from `newUi` plus the replay
alone.

This exists because a `Ui` field that lives **outside** the undo history and is set by
`interpretMove` cannot be recovered by replaying the move log: replay goes through
`executeMove`, never `interpretMove`. Mines' persistent death counter is exactly such a
field — dying and then undoing removes the death from the move log — so without ui
serialization the count would reset on every save/restore. Guess's half-composed row and its
live holds are another: a row reaches the log only when it is submitted.

The midend SHALL also **report** that encoding to the app, on the `game-state-change`
notification, for a game that has the hook and not otherwise. Writing the hook is not enough
on its own, because the app takes a save when something it watches changes and a `Ui` edit is
not a move — it moves no move index, no game id and no checkpoint. Guess shipped a correct
`encodeUi` whose output nothing ever asked for: the bytes were right, a real page reload came
back with the composed row empty, and every test passed. Reporting the encoding rather than a
"the Ui changed" flag makes the value the app compares **be** the part of the save that would
differ, so nothing re-saves for a change the file would not record, and a game with no
persisted `Ui` reports nothing and costs nothing.

#### Scenario: A persistent Ui counter survives a save

- **WHEN** a game with `encodeUi`/`decodeUi` accumulates ui-only state (Mines' death count),
  is saved, and reloaded
- **THEN** the reloaded game shows the same ui-only state, even though the move log alone does
  not contain it

#### Scenario: A game's saveable Ui is reported with every state change

- **WHEN** a game declaring `encodeUi` reaches any state change
- **THEN** the `game-state-change` notification carries that game's current encoding, and a
  game declaring no `encodeUi` carries none

#### Scenario: A Ui edit that is not a move is reported

- **WHEN** a player composes part of a Guess row, which is a `UI_UPDATE` and not a move
- **THEN** the reported encoding changes, while moving the keyboard cursor — which the save
  does not record — leaves it unchanged
