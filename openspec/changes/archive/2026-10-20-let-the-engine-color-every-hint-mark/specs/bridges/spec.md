## ADDED Requirements

### Requirement: Hint: A Bridges hint recolors an island's rim and clue digit as an outline

An island SHALL be marked by recoloring its own rim and clue digit, which is a
ring and not a fill, in `COL_HINT_CELL`: the island a sentence names is a
reference of its own, and the islands it merely counts another. A premise
that counts a group the island belongs to, and does not name the island,
SHALL mark every member alike, so "these N islands" points at N marks of one
reference and not at one mark of each.

#### Scenario: A sealed group is marked as one reference

- **WHEN** a step blocks a bridge because it would shut a group of islands
  into a finished group of their own
- **THEN** every island of that group, the one the bridge would start from
  included, is recolored as one reference

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors

## REMOVED Requirements

### Requirement: Hint: A Bridges hint recolors an island's rim and clue digit

**Reason**: It colored the named island in the action color and the counted
ones in the evidence color; both are outlines now, told apart by being two
references the engine colors.

**Migration**: Requirement "Hint: A Bridges hint recolors an island's rim and
clue digit as an outline".
