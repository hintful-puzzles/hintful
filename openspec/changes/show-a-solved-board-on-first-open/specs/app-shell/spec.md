## MODIFIED Requirements

### Requirement: A game's first open shows its rules once

The first time a player opens a game, the puzzle screen SHALL show a card
over the board holding the game's name and its help page's rules, with a
**Play** button that has the focus, an **Examine a solved example** button
that shows the example view, and a **Full rules and controls** button
that opens the How to play drawer. The card SHALL close on Play, its close
button, Escape and a tap outside it, and the tap that closes it SHALL NOT
reach the board.

#### Scenario: A newcomer opens a game

- **WHEN** a player opens a game they have never opened here
- **THEN** the card shows that game's rules over the board, with Play focused

#### Scenario: Closing the card by tapping the board

- **WHEN** the player taps the board outside the card
- **THEN** the card closes and the board is unchanged

## ADDED Requirements

### Requirement: The example view shows a solved board with its parts named

The example view SHALL show, in the board's place, a solved example board of the game at the size being opened, with the game's callouts: each names a part of the board, and picking one, by touch, mouse or keyboard, SHALL mark that part on the board as a hint marks what it names. The view SHALL have a Play button that has the focus.

#### Scenario: A newcomer examines Mines

- **WHEN** a player opens Mines for the first time and picks Examine a solved example
- **THEN** a solved Mines board is shown in the board's place with its callouts, and picking the callout for a number marks one number on the board

### Requirement: The example is never the player's board

The example SHALL NOT flash a win, set the game's status or timer, or be remembered as the player's board. Leaving the example view SHALL show the board the player had when the card opened, as it was, or a newly dealt one where the card opened over a board dealt for this visit.

#### Scenario: A shared link to a board

- **WHEN** a player opens a link to a board of a game they have never opened, examines the example and picks Play
- **THEN** the linked board is in front of them, unsolved, as the link gave it

#### Scenario: Reopening after the example

- **WHEN** a player examines the example, picks Play, and later opens the game again
- **THEN** the board shown is the one they played, never the example
