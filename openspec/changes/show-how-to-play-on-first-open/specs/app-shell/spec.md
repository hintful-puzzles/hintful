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

### Requirement: A game shows its first-open card once, whoever opens it

The card SHALL be shown once for each game, and only its having been shown
SHALL keep it from showing: a game a player had played before the card
existed, or has a game in progress in, SHALL show it on its next open. Once
shown it SHALL NOT show again unless the game's settings are cleared, and
whether it has been shown SHALL never be counted or shown.

#### Scenario: The second open

- **WHEN** the player closes the card and opens the same game again
- **THEN** no card is shown

#### Scenario: A game played before the card existed

- **WHEN** a player opens a game whose remembered board was recorded before
  the card existed
- **THEN** the card is shown once, over that board

#### Scenario: A shared link to a board

- **WHEN** a player opens a link to a board of a game they have never opened
- **THEN** the card is shown over that board

### Requirement: The first-open card reads the rules from the served help page

The card SHALL take its words from the game's served help page, the part
between its title and its first section heading, so that its words have one
source and it works offline wherever the help does. A page that cannot be
read SHALL show no card and SHALL NOT record it as shown.

#### Scenario: The card offline

- **WHEN** a player with the app installed opens a game for the first time
  while offline
- **THEN** the card shows that game's rules

### Requirement: Back closes an open dialog or drawer

While a dialog or drawer is open over a page, the browser's Back, or a
phone's, SHALL close it and leave the player on the page. Once it has been
closed some other way, Back SHALL leave the page as it would have with none
opened, and a dialog that hands over to another, as the first-open card does
to the help, SHALL leave one Back to close the second.

#### Scenario: Back over the help

- **WHEN** a player has the How to play drawer open over a game and presses
  Back
- **THEN** the drawer closes and the same game is on screen

#### Scenario: Back after closing the card

- **WHEN** a player closes the first-open card with Play and presses Back
- **THEN** the page before the game is shown, with no Back press spent first
