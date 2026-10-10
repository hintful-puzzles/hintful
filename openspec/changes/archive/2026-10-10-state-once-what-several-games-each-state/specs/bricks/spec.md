## ADDED Requirements

### Requirement: Bricks calls its piece shaded and never by its color

Bricks' hint sentences and control words SHALL say "shaded" for the shaded
state and SHALL NOT say the piece's color, and its help page SHALL say the
piece's shape beside the placeholder for its color.

#### Scenario: A hint rests on a shaded cell

- **WHEN** a hint step reasons from a cell that is shaded
- **THEN** its sentence calls it a shaded brick and names no color

## REMOVED Requirements

### Requirement: Bricks names no hue

**Reason**: Restated as "Bricks calls its piece shaded and never by its color". That Bricks names no hue, says the collection's word for a cell that is not
shaded and names the color by placeholder is `engine-colors`, "Shaded or not
is the pair's first member alone". What is Bricks' own is that it calls the
piece "shaded" and never by its color (`src/games/bricks/hint-text.ts`,
`index.ts`: no `SHADED_NAME`), and that its help page says the shape. The
title said what went, and the scenario restated the shared word.
