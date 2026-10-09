## MODIFIED Requirements

### Requirement: Solo refuses parameters outside its bounds

`validateParams` SHALL refuse a grid of more than 31 digits, a killer grid
whose dimensions are not below 10, and an X grid of fewer than 4 digits. In
full form it SHALL also refuse, in the words of `noSuchTier`, a tier that no
board of a tiny grid has. The limit on a single field is that field's bound in
the Custom dialog, and the difficulty is a choice among the declared tiers; the
engine refuses a value outside either.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives a killer grid of 10 digits or more, or an X
  grid of 3
- **THEN** it returns a non-null error string

#### Scenario: A tiny grid has only its easy tiers

- **WHEN** a 2x2 board, or a Jigsaw of 2 or 3, is asked for above Easy, or a
  Jigsaw of 4 without cages above Tricky, or a Killer Jigsaw of 2 at any tier
- **THEN** `validateParams` refuses the tier and names the size, and the same
  params without their difficulty are accepted

### Requirement: Solo selects a cell by pointer or keyboard

A press SHALL act as the note-taking cell does in every game. With the sticky
pencil preference on, which is how Solo starts, a right press SHALL switch
pencil mode and a left press SHALL highlight the cell in the mode that is on:
for a pencil mark while pencil mode is on, and otherwise for a real entry.
With it off, a left press SHALL highlight a cell for a real entry and a right
press an empty cell for a pencil mark. A press that would highlight the cell
the highlight is already on, in the mode it is in, SHALL put the highlight
away. The cursor keys SHALL move the highlight, and the select key SHALL
toggle pencil mode while it shows.

#### Scenario: The select key switches the mode

- **WHEN** the highlight shows and the select key is pressed
- **THEN** pencil mode toggles and the highlight stays where it is

#### Scenario: A left press keeps a latched pencil mode

- **WHEN** a right press has switched pencil mode on under the sticky
  preference, and another empty cell is then pressed with the left button
- **THEN** the cell is highlighted for a pencil mark and pencil mode stays on

#### Scenario: A second press on the highlighted cell

- **WHEN** a cell highlighted by a left press is pressed again with the left
  button under the sticky preference
- **THEN** the highlight is put away and pencil mode is as it was

### Requirement: Solo's narration leads with what was spotted

A step that fires on a region SHALL carry a narration that leads with the
spotted indication (the firing region, named by its kind; a killer cage, with
its clue or the sum the clue leaves), then gives the reasoning, then concludes in
the necessity voice: "we must cross out" what an elimination strikes, and
"must be" or "can only be" the number a placement enters. A step with no
firing region SHALL lead with what the player looks at instead: the one cell,
for a single read off that cell's notes; the number just placed, for the cull
that follows a placement; and the notes to write or clear, for a step that
sets the notes up.

#### Scenario: A strike's sentence names its region and ends in necessity

- **WHEN** the player asks for a hint on a fully-penciled board where a
  deductive technique rules a digit out of a cell
- **THEN** the narration names the firing region (row / column / block /
  diagonal, or "this killer cage") and concludes in the necessity voice

#### Scenario: What an elimination's conclusion names

- **WHEN** a step strikes one number, or several, or numbers its reasoning has
  just listed
- **THEN** it concludes "we must cross out the 5", or "we must cross out 1 and
  2", or "we must cross them out" ("it" for one)

#### Scenario: The cull after a placement names where the number cannot repeat

- **WHEN** a step strikes the number just placed from the cells that share a
  region with it
- **THEN** its narration begins "The 5 just placed can't repeat in its" and
  names every kind of region the cell lies in, not one firing region

#### Scenario: A cage is named by what its open cells must make

- **WHEN** a killer step strikes a number, reasoning from a cage some of whose
  cells are filled
- **THEN** it gives the sum the clue leaves and not the clue: "This killer
  cage's open cells make 9"

#### Scenario: A cage of one open cell and nothing filled

- **WHEN** the next step fills the only cell of a cage
- **THEN** it concludes "it must be its total," and the number

#### Scenario: A single read off one cell's notes names the cell

- **WHEN** the next step places the only number an empty cell's notes leave
- **THEN** its narration begins "Every other number has been ruled out in" that
  cell, names no region, and concludes "it can only be" that number
