## REMOVED Requirements

### Requirement: Bricks reports rule violations through findMistakes

**Reason**: It has `findMistakes` report a broken rule alone, so a cell that
is wrong and breaks none passed Check & Save's mistake check and the player
was told only that the entries contradict each other.

**Migration**: "Bricks' findMistakes reports a broken rule and a cell the
answer contradicts" keeps the rule report and adds the comparison.

### Requirement: A Bricks hint is refused on a board that contradicts its solution without breaking a rule

**Reason**: The hint compared the board with the answer and kept the cell to
itself. `findMistakes` now makes that comparison, and the midend asks it
before the hint, so the hint is never asked about such a board.

**Migration**: "Bricks' findMistakes reports a broken rule and a cell the
answer contradicts": the player is shown the cell and asked to fix it.

## ADDED Requirements

### Requirement: Bricks' findMistakes reports a broken rule and a cell the answer contradicts

`findMistakes` SHALL report every cell the rule pass flags and, on a board the
solver finishes from its clues, every cell shaded or ruled out against that
answer. A brick or a cross the answer contradicts SHALL be drawn in the error
color when the check hands `redraw` its mistakes, beside the rule marks.

#### Scenario: A mistake blocks Check & Save

- **WHEN** the grid contains a rule violation and the player invokes Check & Save
- **THEN** `findMistakes` reports the offending cells and the save is blocked

#### Scenario: A wrong cross that breaks no rule

- **WHEN** a cell the answer shades is ruled out, no rule is broken by it, and
  Check & Save is pressed
- **THEN** one mistake is reported, the cross is drawn in the error color on a
  board already drawn, and the board is not saved

#### Scenario: The right color in the same cell

- **WHEN** that cell is shaded as the answer has it
- **THEN** `findMistakes` reports nothing
