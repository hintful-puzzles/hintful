## MODIFIED Requirements

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game reference aid: a
read-only inventory, derived from the board, and a way to spotlight one item.
`Game` SHALL define it as one optional hook carrying the aid's `title`, what
it is in this game; `model(state, ui)`, giving instructions and sections of
items, each outstanding, placed, in conflict or ruled out; `watches(ui)`,
the part of `ui` the model reads, as a string; and `select(ui, key)`, which
spotlights `key`, or clears it for null, by mutating `Ui`, and says whether
anything changed. The midend SHALL send `watches` with every change of the
game's state, so the app fetches the model again when it changes without a
move.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines a reference aid titled "Dominoes" and the
  app queries static attributes
- **THEN** `referenceTitle` is "Dominoes" and `getReference()` returns the
  game's model, whose items reflect the current board and whose `selected`
  matches the spotlighted key

#### Scenario: A change of the watched Ui is sent

- **WHEN** a reference item is selected, or Crossing's selected square moves
- **THEN** the next state change the midend sends carries the new `watches`
  value, and a game without a reference aid sends none

### Requirement: A reference model may ask for a search box and filters

A reference model MAY ask for a search box, MAY declare filters, each a
label and the item statuses it shows, and MAY put each section in a named
group. A model with none of these SHALL be shown whole.

#### Scenario: A dictionary's filters

- **WHEN** Wordtrail's model is read
- **THEN** it asks for a search box and declares "Fits", showing outstanding
  words, and "Found", showing placed ones

#### Scenario: A dictionary's groups

- **WHEN** Wordtrail's model is read for a board asking for three- and
  five-letter words
- **THEN** its sections are in two groups, "3 letters" and "5 letters", and
  Wordguess's and Dominosa's sections are in none
