## MODIFIED Requirements

### Requirement: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed run is a long wait: it is
offered to everyone who opens the Type menu, so a long generation there is a
wait nobody chose, whereas a Custom size is a wait the player asked for, and a
slow Custom size within the bound SHALL be accepted. Every preset SHALL be no
larger than `MAX_CELLS_SEISMIC`, the largest area whose worst observed run is
short, in either mode, and a test SHALL assert this.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the validation bound admits

#### Scenario: The largest preset may take a moment

- **WHEN** an 8×8 preset is dealt, in either mode
- **THEN** it is offered, though its slowest deal is seconds and not an instant,
  since no observed deal of that area is a long wait

### Requirement: Seismic input, note-taking and completion

Seismic SHALL be played by the note-taking cell's rules and SHALL offer a
sticky pencil mode preference. The cursor keys SHALL move the selection. The
game SHALL be solved when every cell is filled and every region and keep-apart
rule is satisfied.

#### Scenario: Completing the grid wins

- **WHEN** the last cell is filled so that every region and keep-apart rule is
  satisfied
- **THEN** the game is reported solved and flashes

### Requirement: Mark-all fills a note-less cell with its region's candidates

The game SHALL offer a mark-all action that fills every empty cell holding no
notes with all of its region's candidates.

#### Scenario: Mark-all leaves a narrowed cell alone

- **WHEN** the player has narrowed one empty cell's notes and runs mark-all
- **THEN** every note-less empty cell holds the numbers from 1 to its region's
  size, and the narrowed cell's notes are as the player left them
