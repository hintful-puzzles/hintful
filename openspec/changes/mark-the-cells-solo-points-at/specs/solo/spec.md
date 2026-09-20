# solo — delta for mark-the-cells-solo-points-at

## ADDED Requirements

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
- **THEN** the step shades that pattern's cells as evidence
- **AND** the narration points at those marks rather than at unmarked lines
