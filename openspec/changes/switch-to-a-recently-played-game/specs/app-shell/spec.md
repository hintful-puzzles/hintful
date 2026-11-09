## MODIFIED Requirements

### Requirement: From a puzzle, the quick-switch opens on the rest of that puzzle's family

When the quick-switch is opened from a puzzle and nothing has been typed, it
SHALL list the other puzzles of the current puzzle's family, under a heading
naming the family, after any recently played puzzles and followed by every
other puzzle. Once anything is typed, the search SHALL answer instead, and the
grouping SHALL be dropped.

#### Scenario: Opening the switcher on a Latin square
- **WHEN** a player who has played nothing else opens the quick-switch while
  playing Solo, with nothing typed
- **THEN** the list begins with the other Latin squares under "More Latin
  squares", followed by every puzzle under "All puzzles", each puzzle listed
  once
- **AND** Solo is marked as the puzzle being played

#### Scenario: Typing drops the grouping
- **WHEN** the player types into the quick-switch
- **THEN** the list shows only the matching puzzles, without family headings

## ADDED Requirements

### Requirement: From a puzzle, the quick-switch opens on the games played last

A puzzle SHALL count as played on a visit once its board holds a move, and the app SHALL remember when, never showing or counting it. When the quick-switch is opened from a puzzle and nothing has been typed, it SHALL begin with the three other puzzles played most recently, the latest first, under "Recently played". A puzzle listed there SHALL NOT be listed again.

#### Scenario: The games played last head the list
- **WHEN** a player who played Net, Mines, Keen and Pearl, in that order, opens the quick-switch while playing Solo
- **THEN** the list begins with Pearl, Keen and Mines under "Recently played", then the other Latin squares without Keen, then every other puzzle

#### Scenario: A game only looked at is not played
- **WHEN** a player opens a puzzle and leaves it without a move
- **THEN** it is not counted as played on that visit
