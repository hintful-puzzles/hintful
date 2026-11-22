## MODIFIED Requirements

### Requirement: Hint: Pattern's hint continues from its last step

`hint` SHALL take, of every stretch the ladder could settle, the one that
continues from the cells the latest steps decided, and otherwise the first in
the ladder's order: the rows from the top, then the columns from the left.

#### Scenario: The plan follows the cells it decides

- **WHEN** the hint's plan is read on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
- **THEN** its first step is the ninth row's, "This row's run of 6 can slide
  only 4 squares, so these squares must be shaded.", the first row any run's
  overlap reaches
- **AND** its second is the fifth column's, which holds one of the squares
  the first step shaded

## ADDED Requirements

### Requirement: Controls: A Pattern drag sweeps

A drag SHALL give every square it passes that held what the pressed square
held what the pressed square became, so a drag never rewrites a square the
player marked otherwise, and an undecided square's drag never erases.

#### Scenario: A drag over a marked square

- **WHEN** the player drags from an undecided square, which a press shades,
  across a square they marked clear onto an undecided one
- **THEN** both undecided squares are shaded and the clear one stays clear

### Requirement: Controls: Shift or Ctrl with a Pattern move marks clear the squares the cursor leaves and enters

A cursor move with Shift held SHALL mark clear each undecided square it
leaves and enters, and with Ctrl each of those squares that is not already
clear, shaded ones included, as the fill engine's other games do.

#### Scenario: A Shift stroke crosses a shaded square

- **WHEN** the cursor moves with Shift held from a shaded square onto an
  undecided one
- **THEN** the undecided square is marked clear and the shaded one stays
  shaded

### Requirement: Hint: A Pattern run's overlap is shaded, and a square no run reaches is clear

A step SHALL take one unbroken stretch of undecided squares of one line that
every fit of the line's runs around its marks agrees on. A stretch one run
covers packed either way SHALL be told as that run's slack, with the marked
squares that hold it outlined, a stretch no run reaches as out of reach, and
a line with no clues as all clear.

#### Scenario: A run with no room to slide

- **WHEN** the hint's plan on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
  is read
- **THEN** its seventh step shades the top four squares of the third column,
  saying "This column's run of 4 has nowhere to slide, so these squares must
  be shaded."
- **AND** its nineteenth clears the top three squares of the sixth column,
  saying "No run of this column can reach the ringed squares, so those
  squares must be clear."

### Requirement: Look: Pattern's step stripes its line through the line's numbers

A hint step SHALL stripe the row or column it reasons on, running on through
that line's numbers in the margin, and the numbers SHALL stay in the ink's
color, the error color, or the cursor's where the cursor is on the line.

#### Scenario: A row's overlap

- **WHEN** a step on a row's overlap is shown
- **THEN** the row and its numbers are striped, and the squares it shades
  are ringed

## REMOVED Requirements

### Requirement: Controls: Pattern accepts drag-fill rectangle and cursor input

**Reason**: Pattern is born from its description, and its drag is the fill
engine's sweep, which no game but Pattern drew as a line or a rectangle.
**Migration**: `Controls: A Pattern drag sweeps`.

### Requirement: Controls: A multi-cell paint drag leaves placed marks

**Reason**: The sweep leaves every marked square as it is by what it is, with
no `fill` move or `onlyBlank` flag.
**Migration**: `Controls: A Pattern drag sweeps`.

### Requirement: Controls: Pattern's keyboard stroke paints as the pointer's drag does

**Reason**: The keyboard stroke is the fill engine's, which marks clear.
**Migration**: `Controls: Shift or Ctrl with a Pattern move marks clear the
squares the cursor leaves and enters`.

### Requirement: Hint: A Pattern run's overlap is shaded, and a cell no run reaches is clear

**Reason**: The steps say "squares", the unreachable step names the line and
no clue, and a step outlines the marked squares that hold a run in place.
**Migration**: `Hint: A Pattern run's overlap is shaded, and a square no run
reaches is clear`.
