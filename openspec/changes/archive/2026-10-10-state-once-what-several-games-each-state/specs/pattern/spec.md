## MODIFIED Requirements

### Requirement: Pattern draws its picture as shaded pieces and crosses on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A `Full` cell SHALL
hold the collection's shaded piece, inset on its cell. A cell marked `Empty`
SHALL be plain surface holding the ruled-out cross, with no fill of its own,
and an `Unknown` cell SHALL be plain surface holding nothing. The three states
SHALL NOT be told apart by a step of gray.

#### Scenario: The three states are a piece, a cross and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** all three cells are filled with the one surface color
- **AND** the `Full` cell holds the shaded piece, the `Empty` cell a cross, and
  the `Unknown` cell nothing

## REMOVED Requirements

### Requirement: Pattern names no hue of its own

**Reason**: `engine-colors`, "Shaded or not is the pair's first member alone", holds all of
it: Pattern's hint sentences, control words and legend take `SHADED_NAME` and
`UNSHADED_NAME` (`src/games/pattern/hint-text.ts`, `index.ts`), and its help
page writes the placeholder.
