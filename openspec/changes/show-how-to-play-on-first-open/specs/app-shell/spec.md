## ADDED Requirements

### Requirement: A game's first open shows its rules once

The first time a player opens a game, the puzzle screen SHALL show a card
over the board holding the game's name and its help page's rules, with a
**Play** button that has the focus and a **Full rules and controls** button
that opens the How to play drawer. The card SHALL close on Play, its close
button, Escape and a tap outside it, and the tap that closes it SHALL NOT
reach the board.

#### Scenario: A newcomer opens a game

- **WHEN** a player opens a game they have never opened here
- **THEN** the card shows that game's rules over the board, with Play focused

#### Scenario: Closing the card by tapping the board

- **WHEN** the player taps the board outside the card
- **THEN** the card closes and the board is unchanged

### Requirement: A game once met never shows the first-open card again

A game is met once the card has been shown for it, or once it has dealt or
opened a board here (its remembered board). A met game SHALL NOT show the card
again unless its settings are cleared, and whether a game is met SHALL never
be counted or shown.

#### Scenario: The second open

- **WHEN** the player closes the card and opens the same game again
- **THEN** no card is shown

#### Scenario: A game played before the card existed

- **WHEN** a player opens a game whose remembered board is recorded
- **THEN** no card is shown

#### Scenario: A shared link to a board

- **WHEN** a player opens a link to a board of a game they have never opened
- **THEN** the card is shown over that board

### Requirement: The first-open card reads the rules from the served help page

The card SHALL take its words from the game's served help page, the part
between its title and its first section heading, so that its words have one
source and it works offline wherever the help does. A page that cannot be
read SHALL show no card and SHALL NOT record the game as met.

#### Scenario: The card offline

- **WHEN** a player with the app installed opens a game for the first time
  while offline
- **THEN** the card shows that game's rules
