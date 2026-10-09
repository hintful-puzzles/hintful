## MODIFIED Requirements

### Requirement: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed run is a long wait: it is
offered to everyone who opens the Type menu, so a long generation there is a
wait nobody chose, whereas a Custom size is a wait the player asked for, and a
slow Custom size within the bound SHALL be accepted. Every preset SHALL pass
validation and SHALL be no larger than `MAX_CELLS_SEISMIC`, the largest area
whose worst observed run is short, in either mode, and a test SHALL assert
this rather than leave it to convention.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the validation bound admits

#### Scenario: The largest preset may take a moment

- **WHEN** an 8×8 preset is dealt, in either mode
- **THEN** it is offered, though its slowest deal is seconds and not an instant,
  since no observed deal of that area is a long wait

### Requirement: Seismic input, note-taking and completion

Seismic SHALL be played with the Solo control scheme, by the note-taking
cell's rules, and SHALL offer a sticky pencil mode preference. With it on,
which is how Seismic starts, a right press SHALL switch pencil mode and a left press SHALL select
the cell in the mode that is on; with it off, a left press SHALL select a cell
for number entry and a right press for pencil marks. The cursor keys SHALL
move the selection and a mode toggle SHALL switch between entering numbers
and pencil marks. The game SHALL be solved when every cell is filled and every
region and keep-apart rule is satisfied.

#### Scenario: Completing the grid wins

- **WHEN** the last cell is filled so that every region and keep-apart rule is
  satisfied
- **THEN** the game is reported solved and flashes

### Requirement: A digit is entered only where its region can hold it

A digit SHALL be entered only when it does not exceed the selected cell's
region size, and SHALL NOT change a fixed clue. A digit or a clear that would
not change the cell SHALL make no move: the number the cell already holds,
and, in pencil mode, a clear on a cell with no notes.

#### Scenario: A digit above the region size is rejected

- **WHEN** the player types a digit larger than the selected cell's region size
- **THEN** the board is unchanged

#### Scenario: Clearing notes a cell has not got leaves no history

- **WHEN** pencil mode is on and a clear key is pressed on an empty cell with no
  notes
- **THEN** no move is made and Undo gains nothing
