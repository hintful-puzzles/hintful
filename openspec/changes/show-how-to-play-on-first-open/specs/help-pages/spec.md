## ADDED Requirements

### Requirement: A game's rules stand alone as a newcomer's summary

A game page's rules, the unheaded section the first-open card shows, SHALL be
at most 90 words as the card shows them, generated lists included, so the
card fits a 360×640 phone without scrolling, and SHALL contain no link.
Neither the rules nor the Controls SHALL name another cataloged game, and no
field but `origins` SHALL speak in an author's first person. Detail past the
budget SHALL go under a heading of its own.

#### Scenario: A page explains its controls by another game's

- **WHEN** a page's Controls say it "uses the same control scheme as Solo"
- **THEN** the help-coverage guard fails, naming the page and the game it names

#### Scenario: Rules that run long

- **WHEN** a page's rules, with its list of game modes expanded, are over 90
  words
- **THEN** the help-coverage guard fails, naming the page and its count

### Requirement: Every Controls section opens with the touch line

The renderer SHALL write a placeholder as the first paragraph of every game
page's Controls section, and the help build SHALL replace it with one
sentence generated from the game: that a tap is a click; for a game that does
not ignore the secondary button, that a long press is a right-click, linking
the site-level page on right-clicking by touch; and for a game with an
on-screen keypad, that its buttons do what typing does. A page SHALL NOT
write the placeholder itself.

#### Scenario: A keypad game's page on a phone

- **WHEN** a player reads Solo's page
- **THEN** its Controls open by saying that a tap is a click, a long press a
  right-click, and the buttons under the board type for them

#### Scenario: A game that ignores the right button

- **WHEN** a player reads Fifteen's page
- **THEN** its Controls open by saying that a tap is a click, and nothing of a
  right-click
