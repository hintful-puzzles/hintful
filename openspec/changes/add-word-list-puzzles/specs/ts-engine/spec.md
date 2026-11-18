## MODIFIED Requirements

### Requirement: The engine serializes Ui state a move-log replay cannot reconstruct

The engine SHALL support optional `encodeUi(ui): string` and
`decodeUi(ui, encoded, state): void` hooks on `Game`. The midend SHALL write
`encodeUi(ui)` into the save envelope's `ui` field when the hook is present,
and SHALL restore it through `decodeUi` after rebuilding state 0 and replaying
the move log on load: replay goes through `executeMove` and never
`interpretMove`. `decodeUi` SHALL be given the state the replay reached, so a
`Ui` field judged against the board is judged on load as it was in play. A
game without the hooks SHALL save no `ui` field, and its `Ui` SHALL be rebuilt
from `newUi` and the replay alone.

#### Scenario: A persistent Ui counter survives a save

- **WHEN** a game with `encodeUi` and `decodeUi` accumulates ui-only state,
  such as Mines' death count, is saved and is reloaded
- **THEN** the reloaded game shows the same ui-only state, though the move log
  alone does not hold it

#### Scenario: A restored Ui is judged against the restored board

- **WHEN** Wordguess is reloaded with a whole word in its working row
- **THEN** the row is judged ready against the replayed board, and Enter
  submits it
