## MODIFIED Requirements

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game reference aid: a
read-only inventory, derived from the board, and a way to spotlight one item.
The `Game` interface SHALL define two optional hooks: `reference(state, ui):
ReferenceModel`, giving the panel's title, a line of instructions and
sections of items, each item outstanding, placed, in conflict or ruled out;
and `selectReference(ui, key): boolean`, which spotlights the item `key`, or
clears it for null, by mutating `Ui`, and returns whether anything changed.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines `reference` and the app queries static
  attributes
- **THEN** `hasReference` is true and `getReference()` returns the game's
  model, whose items reflect the current board and whose `selected` matches
  the spotlighted key

## ADDED Requirements

### Requirement: A reference shown counts as help

`getReference()` SHALL mark the board as helped, as a hint shown does, in
every game with a reference aid, for the reference is fetched only to be
shown. The board's time SHALL then read as assisted until a new board.

#### Scenario: Dominosa's list opened

- **WHEN** a Dominosa player opens the reference and then finishes the board
- **THEN** the timer reports the board as assisted

### Requirement: A hint step may name reference items

A `HintStep` MAY carry the keys of reference items its reasoning reads.
While such a step is displayed, `getReference()` SHALL return those keys as
the model's `hinted` items, and none otherwise.

#### Scenario: The words through a letter

- **WHEN** a Wordtrail step reasons from the words still fitting through a
  letter and the panel is open
- **THEN** the panel's model names those words' keys as hinted
