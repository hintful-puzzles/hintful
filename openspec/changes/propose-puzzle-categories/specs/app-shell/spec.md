## ADDED Requirements

### Requirement: Every puzzle belongs to exactly one family, and the home screen narrows by it
Each catalog entry SHALL name exactly one family from the catalog's list of families, and the home screen SHALL offer one chip per family that narrows the list to that family's puzzles.

A family is what a player browses by ("what else is like this one?") and what
maintenance work uses to name a group of games. It is a value that the chips,
the search box and the quick-switch consume, not a manifest. Work that takes a
family as its population reads it through `puzzlesInFamily` rather than typing
a list. Where code can vouch for a family, a test holds the tag to the code.

#### Scenario: A family chip narrows the list, and pressing it again releases it
- **WHEN** a player presses the "Shading" chip on the home screen
- **THEN** the list shows exactly the puzzles whose family is Shading, still
  subject to the search box and the All / Favorites / In progress filter
- **AND** pressing the same chip again shows every family

#### Scenario: A family's name finds its puzzles
- **WHEN** a player types a family's label into the home screen's search box
  or the quick-switch
- **THEN** every puzzle in that family matches, whether or not the family's
  name appears in the puzzle's objective

#### Scenario: The taxonomy stays well-formed
- **WHEN** the catalog is checked
- **THEN** every puzzle is in exactly one family, no family has fewer than two
  puzzles, and no two families share a label

#### Scenario: A family the code can vouch for agrees with the code
- **WHEN** a game imports the shared Latin hint vocabulary
- **THEN** its family is Latin squares
- **AND** every game whose family is Latin squares uses the shared Latin engine

### Requirement: From a puzzle, the quick-switch opens on the rest of that puzzle's family
When the quick-switch is opened from a puzzle and nothing has been typed, it SHALL list the other puzzles of the current puzzle's family first, under a heading naming the family, followed by every puzzle.

Opening the switcher from a game is the moment a player asks what else is like
it. Once anything is typed, the search answers instead, and the grouping is
dropped.

#### Scenario: Opening the switcher on a Latin square
- **WHEN** a player opens the quick-switch while playing Solo, with nothing
  typed
- **THEN** the list begins with the other Latin squares under "More Latin
  squares", followed by every puzzle under "All puzzles", each puzzle listed
  once
- **AND** Solo is marked as the puzzle being played

#### Scenario: Typing drops the grouping
- **WHEN** the player types into the quick-switch
- **THEN** the list shows only the matching puzzles, without family headings
