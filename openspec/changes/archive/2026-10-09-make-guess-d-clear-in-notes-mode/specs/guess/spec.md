## REMOVED Requirements

### Requirement: Guess rubs out a color without ever lengthening the row

**Reason**: It had `D` and `d` rub out a peg of the working row in notes mode,
where the erase key clears the framed slot's marks; the two keys now agree.

**Migration**: "Guess's rub-out keys act on the row the frame is on", which
keeps every other rule of this requirement.

## ADDED Requirements

### Requirement: Guess's rub-out keys act on the row the frame is on

Outside notes mode the erase key SHALL clear the selected slot when it holds a
color, and otherwise SHALL backspace: rub out the rightmost filled slot the
player is not holding. Backspacing SHALL walk past a held slot, which was
carried over rather than typed, and SHALL be declined when every filled slot is
held. The key SHALL never write past the last peg. `D` and `d` SHALL do what
the erase key does in either mode, and in notes mode touch no peg.

#### Scenario: Clearing on the submit position backspaces

- **WHEN** the working row is full, so the cursor sits on the submit position,
  and the clear key is pressed
- **THEN** the last color the player typed is rubbed out, the row keeps its
  length, and the guess submitted next executes

#### Scenario: Backspace leaves a held peg alone

- **WHEN** the only filled slots left are held ones and the clear key is pressed
  with nothing selected
- **THEN** no move and no UI update is produced and the held colors are kept

#### Scenario: The letter key clears the framed slot's marks in notes mode

- **WHEN** notes mode is on with the frame on the second answer slot, which has
  a color ruled out, the working row is full, and `d` is pressed
- **THEN** the color is put back in the second answer slot, no peg of the
  working row changes, and notes mode stays on

#### Scenario: The letter key rubs out a peg outside notes mode

- **WHEN** notes mode is off, the cursor is on the second slot of a full
  working row, and `d` is pressed
- **THEN** the second peg of the working row is rubbed out
