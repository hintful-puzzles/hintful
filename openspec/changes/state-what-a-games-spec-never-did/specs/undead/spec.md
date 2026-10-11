## ADDED Requirements

### Requirement: Space, Delete and a second count click clear an Undead cell

With a cell highlighted for an entry, Space and Delete SHALL clear it as `E`,
`0` and Backspace do, and a left-click on the count block of the monster it
already holds SHALL clear it too. A clear SHALL take the cell's pencil marks
with its monster. In pencil mode the same keys SHALL clear a cell that has
pencil marks and do nothing to one that has none, and a count-block click
SHALL toggle that monster's mark like its letter.

#### Scenario: The zombie block clicked on a zombie

- **WHEN** a cell holding a zombie is highlighted for an entry and the zombie
  count block is clicked
- **THEN** the cell is empty
- **AND** had the ghost block been clicked, the cell would hold a ghost

#### Scenario: Space in pencil mode on a monster with no marks

- **WHEN** pencil mode is on, the highlight is on a cell that holds a zombie
  and no pencil marks, and Space is pressed
- **THEN** the zombie stays and no move is made

### Requirement: Undead's first arrow selects the top-left square

While no square has yet been selected, an arrow key SHALL show the highlight on
the top-left square of the grid, whichever arrow it is. After that an arrow
SHALL move the highlight one square and stop at the grid's edge. The highlight
SHALL rest on a mirror or a given monster as on any square, where no key places
or clears.

#### Scenario: Down on a board just opened

- **WHEN** Down is pressed on a board just opened, and then Right
- **THEN** the highlight shows on the top-left square after the first press,
  not on the square below it, and on the second square of the top row after
  the second

### Requirement: Undead's hint fills a cell when a monster has exactly the cells it needs

When the cells that can still hold a monster, those already holding it among
them, number exactly its total, the hint SHALL place it in one of the others,
ringing that cell, with the words "Exactly as many cells can still hold a
ghost as there are ghosts left to place" and "this one can only be a ghost",
in the monster's name. What a cell can hold SHALL be worked out from the placed
monsters and the clues and not read from the player's pencil marks, so the step
needs none.

#### Scenario: Two cells left for two vampires

- **WHEN** the total is three vampires, one is placed, and the deductions
  leave exactly two more cells able to hold one
- **THEN** a step places a vampire in one of the two, and the next places one
  in the other
- **AND** neither step is preceded by the step that pencils every monster in

### Requirement: Undead's hint pencils every monster in before its first strike

A strike crosses out pencil marks, so before the first strike of a plan the
hint SHALL give one step that pencils all three monsters into every empty cell
with no marks, by the Mark-all move, saying "Start by penciling every monster
into each empty cell, so there is something to cross out." It SHALL give that
step only when some empty cell has no marks, and a cell the player has
narrowed SHALL keep its marks.

#### Scenario: A board already marked

- **WHEN** a hint is asked on a board whose every empty cell carries a pencil
  mark
- **THEN** no step of the plan is the fill, and the first strike crosses out
  only marks that are on the board

### Requirement: Undead's hint tries a single, then a counted placement, then a strike

At each step the plan SHALL take the first that applies of: a cell whose
pencil marks are down to one monster, placed; a placement by a monster's
count; the next strike. Counted placements and strikes SHALL be found by
trying the monster counts before the sightlines, for ghosts, then vampires,
then zombies, and the sightlines from the one with the fewest monster cells
up, starting again from the counts after each one found.

#### Scenario: A count and a sightline both strike

- **WHEN** nothing can be placed, every ghost is on the board while an empty
  cell still lists a ghost, and a sightline's clues also rule a vampire out
  of a cell
- **THEN** the ghost is crossed out first, for the count, and the sightline's
  strike follows

## MODIFIED Requirements

### Requirement: Undead's count style and monster display are preferences

A monster-count display style and a pictures-or-letters monster display SHALL
both be available as preferences, under the keys `count-style` and `monsters`.
The monster display SHALL also be an in-play toggle, the `A` key; the count
style has no in-play toggle.

#### Scenario: Count-style and letters toggles

- **WHEN** the player chooses another count-display style in the preferences
  dialog and toggles the letters display in play
- **THEN** the count blocks re-render in the new style and monsters render as letters
- **AND** the letters option is also available through the preferences dialog
