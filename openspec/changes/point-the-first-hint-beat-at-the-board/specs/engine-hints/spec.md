## MODIFIED Requirements

### Requirement: A hint's first beat shows one mark, chosen by the engine

Where to look SHALL draw one mark of the step's own words
(`Narration.whereToLook`): the outline naming the fewest elements, or where
the words name no outline the fewest-element stripes, or else the ring, or
else the strike, with a ring on the step's move only where nothing else is
named. The status line SHALL say "Look here." and offer no reference to point
at. No game SHALL write anything for it: the midend draws the narrowed words
through the game's own renderer.

The mark it draws SHALL be about the position: a line or region whose
contents the step's claim reads, or what the step decides. A fact of the
puzzle's layout that holds in every position, such as a line that never
slides or an area of one cell, SHALL NOT be the mark it draws; a step that
names such a fact says it in words.

#### Scenario: Every hinted game shows one mark first

- **WHEN** a hint is shown at where to look in any game with a `hint()`
- **THEN** its drawn words name one mark, the frame differs from the board
  with no hint, and explaining shows the step's own words and every mark

#### Scenario: A line that never moves is not the first beat

- **WHEN** a step's reasoning rests on a line of the layout that no move can
  change, as Netslide's row or column through the source
- **THEN** the sentence may say so, but the first beat shows the ring on what
  the step moves, not the line
