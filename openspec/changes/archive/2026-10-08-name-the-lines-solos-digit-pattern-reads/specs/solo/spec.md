## MODIFIED Requirements

### Requirement: Solo marks every board element its hint sentence points at

A Solo hint step SHALL mark, as evidence or as its target, every cell its
narration refers to deictically. A sentence saying "these cells", "their
region" or "these lines" SHALL have those cells on the frame; where the firing
is not over a `SoloRegion` the step SHALL carry the cells themselves.

This covers the two rungs whose premise is not a region: the deduced
extra-cage, which reasons over a row, column or block less the cages wholly
inside it, and the row-versus-column elimination on a single digit, whose
premise is a pattern of candidate positions across several lines.

#### Scenario: The deduced extra-cage shows the region it counted

- **WHEN** a killer board's hint forces a placement because one row, column or
  block has a single cell left outside the cages wholly inside it
- **THEN** the step shades that region's cells as evidence, with the open cell
  as the placement target
- **AND** the narration names the region by kind and states the arithmetic —
  the region's total, less the cages and filled cells inside it — rather than
  repeating the placed digit as a separate total

#### Scenario: The locked pattern shows its own cells

- **WHEN** the hint strikes a candidate because a single digit is confined,
  across several lines, to a pattern of cells that uses them up
- **THEN** the step stripes every cell of the lines that confine the digit
- **AND** it outlines the cells of those lines the digit can still take
- **AND** the narration points at both marks, and says how many lines there
  are each way

## ADDED Requirements

### Requirement: Solo's single-digit pattern step marks the lines it read

A Solo hint step that strikes a candidate because one digit is confined, across
several lines, to a pattern of cells SHALL mark every cell the deduction read:
the cells the digit is left with, and the other cells of the lines that confine
it. Its narration SHALL point at those marks, and SHALL name the confined lines
as rows or columns according to the firing. Every such firing can be read two
ways, as some columns confined to as many rows or as the remaining rows
confined to the remaining columns; the step SHALL name whichever is fewer
lines.

#### Scenario: A replay from the marked cells reaches the same strike

- **WHEN** the premise audit replays a single-digit pattern firing from only
  the cells its step marks
- **THEN** the firing strikes the same candidates
- **AND** no ledger entry excuses it

#### Scenario: The player can check the step from the frame

- **WHEN** the hint shows a single-digit pattern step
- **THEN** each line the sentence speaks of is marked on the board
- **AND** the cells the digit is left with are told apart from the rest of
  those lines

#### Scenario: The step names the fewer lines

- **WHEN** a single-digit pattern firing confines more columns than it leaves
  rows outside the pattern
- **THEN** the step stripes those rows and names them, not the columns
