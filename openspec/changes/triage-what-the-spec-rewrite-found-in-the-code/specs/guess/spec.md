## MODIFIED Requirements

### Requirement: Guess descriptions are obfuscated solution bitmaps

`newDesc` SHALL draw a random color sequence, each peg uniformly from
`1..ncolors` and redrawn on a repeat when `allowMultiple` is false, encode it as
a byte-per-peg bitmap, apply `obfuscateBitmap`, and hex-encode the result.
`newState` SHALL recover the solution by reversing that, and SHALL refuse a desc
of the wrong length, one whose bytes fall outside `1..ncolors`, and, when
`allowMultiple` is false, one that repeats a color.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a solution sequence is obfuscated and hex-encoded to a desc, then that
  desc is hex-decoded and de-obfuscated by `newState`
- **THEN** the recovered solution equals the original sequence

#### Scenario: A corrupted description is rejected

- **WHEN** the engine validates a desc of the wrong length, or one that
  de-obfuscates to a color outside `1..ncolors`
- **THEN** it returns a refusal with its reason

#### Scenario: A hand-typed answer with a repeat is refused where repeats are off

- **WHEN** a desc that de-obfuscates to the same color in two slots is offered
  to a game with `allowMultiple: false`
- **THEN** it is refused as repeating a color

### Requirement: A color lands in the selected slot, else the first empty one

A color the player enters SHALL land in the slot they have selected, and, when
none is selected, in the first empty slot of the working row, because holds
carry a row pre-filled out of order. After any transition that changes the row
being played, and after every entry, the cursor SHALL rest on the first empty
slot. With none it SHALL rest on the last slot in notes mode, else on the submit
position when the row is markable, else on the slot just entered, or the first
after a transition.

#### Scenario: The first key after a submit does not overwrite a held peg

- **WHEN** a row is submitted with holds on pegs 0 and 2, leaving the next
  working row pre-filled at those two slots, and a color key is then pressed
- **THEN** the color lands in slot 1 and both held pegs keep their colors

#### Scenario: A full row that cannot go keeps the cursor on a slot

- **WHEN** the last slot of a row is filled with a color the row already holds,
  in a game with `allowMultiple: false`
- **THEN** the cursor rests on that slot and not on the submit position

### Requirement: Guess rubs out a color without ever lengthening the row

Outside notes mode the erase key SHALL clear the selected slot when it holds a
color, and otherwise SHALL backspace: rub out the rightmost filled slot the
player is not holding. Backspacing SHALL walk past a held slot, which was
carried over rather than typed, and SHALL be declined when every filled slot is
held. The key SHALL never write past the last peg. `D` and `d` SHALL rub out the
same way in notes mode too, reading the cursor's column as the selected slot.

#### Scenario: Clearing on the submit position backspaces

- **WHEN** the working row is full, so the cursor sits on the submit position,
  and the clear key is pressed
- **THEN** the last color the player typed is rubbed out, the row keeps its
  length, and the guess submitted next executes

#### Scenario: Backspace leaves a held peg alone

- **WHEN** the only filled slots left are held ones and the clear key is pressed
  with nothing selected
- **THEN** no move and no UI update is produced and the held colors are kept

#### Scenario: The letter key edits the working row from notes mode

- **WHEN** notes mode is on with the frame on the second answer slot, the
  working row is full, and `d` is pressed
- **THEN** the second peg of the working row is rubbed out, no mark changes,
  and notes mode stays on

### Requirement: Guess marks an answer slot selected as a whole

Where the selection is SHALL decide what a color key does. A pointer release
anywhere on an answer slot, its gap and margin included, SHALL select that slot
and switch notes mode on; a release on a working-row peg SHALL select it and
switch notes mode off. A right-click or held finger on the answer row SHALL mark
nothing: its press SHALL be declined, and its release SHALL select the slot as a
tap does.

#### Scenario: A tap anywhere on an answer slot selects it for marking

- **WHEN** notes mode is off and the third answer slot is tapped at its first
  or its last point
- **THEN** notes mode is on, the cursor is shown on the third slot, no move is
  made, and the working row is unchanged

#### Scenario: A tap on the working row goes back to entering pegs

- **WHEN** an answer slot has been tapped and then the fourth peg of the
  working row is tapped
- **THEN** notes mode is off and the cursor is on the fourth peg

#### Scenario: A held finger on the answer row marks nothing

- **WHEN** the right button is pressed on an answer slot and released there, as
  a right-click or a finger held past the touch hold arrives
- **THEN** the press returns `null`, and the release shows the cursor on that
  slot with notes mode on and no color ruled out

### Requirement: Notes mode is the engine's pencil mode

Notes mode SHALL be `GuessUi.pencilMode`, so that the engine supplies the Marks
key and the pencil-mode indicator. In notes mode a shown cursor SHALL be drawn
round the answer slot rather than on the working row, in the margin outside the
well, and SHALL NOT rest on the submit position. The Marks key and
`CURSOR_SELECT` SHALL therefore move a shown frame between the rows in the same
column; the Marks key SHALL NOT itself show a hidden cursor.

#### Scenario: Notes mode keeps the cursor off the submit position

- **WHEN** notes mode is switched on while the cursor rests on the submit
  position
- **THEN** the cursor moves to the last slot

#### Scenario: A row submitted in notes mode leaves a slot framed

- **WHEN** every peg is held, notes mode is on, and a row that does not win is
  submitted, so that the next working row arrives full
- **THEN** the frame is on the last answer slot, and a color key rules its
  color out of that slot
