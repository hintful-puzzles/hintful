## ADDED Requirements

### Requirement: Slant's keys cycle the cursor square or set it outright

Arrow keys SHALL move a cursor, revealing it in the same press. Select and
select2 SHALL cycle the cursor square, one in each direction. The literal keys
`\` and `/` SHALL set the cursor square directly and Backspace SHALL clear it.

#### Scenario: A literal key replaces the other diagonal

- **WHEN** the cursor is on a square holding `\` and the `/` key is pressed
- **THEN** the square holds `/`, with no empty state between

## REMOVED Requirements

### Requirement: The keyboard cursor cycles and sets squares

**Reason**: Restated as "Slant's keys cycle the cursor square or set it outright", with every key as it was. That a literal key or Backspace on a square already holding that value makes no step of Undo is `ts-engine`, "A move that leaves the board as it was is no step of the history". The requirement's one scenario, "A key that changes nothing makes no move", said only that, and a scenario cannot be dropped from a requirement that keeps its title; the new scenario is about what remains.
