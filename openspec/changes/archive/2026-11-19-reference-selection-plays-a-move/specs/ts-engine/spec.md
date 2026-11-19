## RENAMED Requirements

- FROM: `### Requirement: The midend surfaces the reference aid without touching the history`
- TO: `### Requirement: The midend surfaces the reference aid, and plays a selection's move as the player's`

## MODIFIED Requirements

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game reference aid: a
read-only inventory, derived from the board, and a way to select one item.
`Game` SHALL define it as one optional hook carrying the aid's `title`, what
it is in this game; `model(state, ui)`, giving instructions and sections of
items, each outstanding, placed, in conflict or ruled out; `watches(ui)`;
and `select(state, ui, key)`, answered as `interpretMove` is: a move, or
`UI_UPDATE` where it changed only `Ui`, or null where nothing changed.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines a reference aid titled "Dominoes" and the
  app queries static attributes
- **THEN** `referenceTitle` is "Dominoes" and `getReference()` returns the
  game's model, whose items reflect the current board and whose `selected`
  matches the spotlighted key

### Requirement: The midend surfaces the reference aid, and plays a selection's move as the player's

The `Midend` SHALL report `referenceTitle` in its static attributes, the aid's
title or null when the game has none, and SHALL provide `getReference()`,
returning the game's model or null, and `selectReference(key)`.
`selectReference` SHALL call the aid's `select`. On `UI_UPDATE` it SHALL take
the repaint path of a `UI_UPDATE`, adding no move. On a move it SHALL play
the move as the player's own input, as a click making it would.

#### Scenario: Selecting a reference item repaints without a history entry

- **WHEN** the app calls `selectReference(key)` on a game whose `select`
  answers `UI_UPDATE`
- **THEN** the board repaints with that item spotlighted, and no move is added:
  the move log, undo and redo availability, and any later save are
  byte-for-byte what they were before the call

#### Scenario: A selection that is a move

- **WHEN** the app calls `selectReference(key)` on a game whose `select`
  answers a move
- **THEN** the move is played, and undo is available
