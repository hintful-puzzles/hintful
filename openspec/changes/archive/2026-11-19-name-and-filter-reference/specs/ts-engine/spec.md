## MODIFIED Requirements

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game reference aid: a
read-only inventory, derived from the board, and a way to spotlight one item.
`Game` SHALL define it as one optional hook carrying the aid's `title`, what
it is in this game; `model(state, ui)`, giving instructions and sections of
items, each outstanding, placed, in conflict or ruled out; and `select(ui,
key)`, which spotlights `key`, or clears it for null, by mutating `Ui`, and
says whether anything changed.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines a reference aid titled "Dominoes" and the
  app queries static attributes
- **THEN** `referenceTitle` is "Dominoes" and `getReference()` returns the
  game's model, whose items reflect the current board and whose `selected`
  matches the spotlighted key

### Requirement: The midend surfaces the reference aid without touching the history

The `Midend` SHALL report `referenceTitle` in its static attributes, the aid's
title or null when the game has none, and SHALL provide `getReference()`,
returning the game's model or null, and `selectReference(key)`.
`selectReference` SHALL call the aid's `select(ui, key)` and, on a `true`
return, take the repaint path of a `UI_UPDATE`: it SHALL NOT create a move, add
an undo entry, alter the move log, or be serialized into a save.

#### Scenario: Selecting a reference item repaints without a history entry

- **WHEN** the app calls `selectReference(key)` on a game whose `select`
  reports a change
- **THEN** the board repaints with that item spotlighted, and no move is added:
  the move log, undo and redo availability, and any later save are
  byte-for-byte what they were before the call

## ADDED Requirements

### Requirement: A reference model may ask for a search box and filters

A reference model MAY ask for a search box, and MAY declare filters, each a
label and the item statuses it shows. A model with neither SHALL be shown
whole.

#### Scenario: A dictionary's filters

- **WHEN** Wordtrail's model is read
- **THEN** it asks for a search box and declares "Fits", showing outstanding
  words, and "Found", showing placed ones
