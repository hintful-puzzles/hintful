## MODIFIED Requirements

### Requirement: Everything that depends on the game is in the Game controls

Everything that depends on the game in play SHALL be in the Game controls
panel and nowhere else, in this order in every game: its keys, the note
toggle, and its own commands (Fill or Update marks, the reference). Each SHALL
be present by what the game is, so that no game is listed: the keys and the
note toggle by the keys the game asks for, mark-all by a `markAll` hook, the
reference by a reference aid. A player does not know to look in a menu for
something only one game has.

#### Scenario: A game with mark-all

- **WHEN** the screen renders for a game that has a `markAll` hook
- **THEN** the Game controls panel contains the mark-all command
- **AND** neither the Bar nor the Menu does

#### Scenario: A game with a reference

- **WHEN** the screen renders for Dominosa
- **THEN** the Dominoes toggle is in the Game controls panel and not in the
  Menu

### Requirement: The app shell shows a non-blocking, responsive reference panel

The app shell SHALL render a reference control only when `referenceTitle` is
not null, where "Everything that depends on the game is in the Game controls"
puts it, labelled with that title, and "Hide" and the title while the panel
is open. Activating it SHALL toggle a `<reference-panel>` open and closed like
a disclosure, not a one-shot modal. The panel SHALL be non-blocking and SHALL
keep the board visible and interactive while open, in both of its layouts.

#### Scenario: The control appears only for a reference-bearing game

- **WHEN** the active game reports `referenceTitle` "Dictionary"
- **THEN** a toggle labelled "Dictionary" is shown in the Game controls panel,
  reading "Hide dictionary" while the panel is open; for a game reporting
  null, no such control is shown

#### Scenario: The panel keeps the board interactive and updates live

- **WHEN** the panel is open and the player places or removes a piece on the
  board
- **THEN** the board input is unaffected by the panel, and the panel's
  checklist status reflects the new board without being reopened

### Requirement: The reference panel renders each item and selects on a click

The panel SHALL show the aid's title, the model's instructions, and its
sections in order under their headings. It SHALL render each item with
status-distinct styling, drawing `pips` as piece faces when present and
`label` otherwise, mark the hint's items in the hint's color, and follow the
board live. A click SHALL toggle the item's selection and call
`selectReference` with its key, or `null` when deselecting, its feedback not
waiting on the model's refresh.

#### Scenario: Clicking an item spotlights it on the still-visible board

- **WHEN** the player clicks an outstanding item in the open panel
- **THEN** the item shows as selected immediately, and the board, still visible
  beside or above the panel, highlights that item's occurrences
- **AND** clicking it again clears the highlight

#### Scenario: A hint names words in an open dictionary

- **WHEN** Wordtrail's dictionary is open and a hint step reasoning from four
  words is shown
- **THEN** those four words are marked in the hint's color until the step is
  gone

## ADDED Requirements

### Requirement: The reference panel searches and filters as its model asks

Where the model asks, the panel SHALL show a search box, which keeps the
items whose label contains its text, case ignored. Where the model declares
filters, the panel SHALL show "All" and each filter as buttons, one pressed,
each with the count of items it shows, and keep the items the pressed one
shows. A section left empty SHALL be hidden. The search and the pressed
filter SHALL be kept while the panel is open and reset for another game.

#### Scenario: Narrowing a dictionary

- **WHEN** a Wordguess player with one row scored presses "Fits" and types
  "ci" in the search box
- **THEN** the panel lists only the words that fit every score and contain
  "ci", under their letters' headings
