## ADDED Requirements

### Requirement: Hint: The named line is striped

The line the sentence names SHALL be striped, every cell of it whatever it
holds.

#### Scenario: A completed-count hint stripes its line

- **WHEN** a `complete` hint is displayed
- **THEN** every cell of the row or column it names is striped

### Requirement: Hint: A cited premise is outlined apart from the move

The cited premise or pivotal cells the deduction reasons over SHALL be
outlined `COL_HINT_CELL`, and the forced move ringed `COL_HINT`: the like pair
in `threes`, the completed quota in `complete`, the full reference line in
`unique`, and in `nearcomplete` the reserved window with the piece beside it
when there is one. The cell SHALL keep its own appearance inside the outline:
a piece stays visible, and an empty reserved-window cell stays empty.

#### Scenario: A reserved window is outlined and stays empty

- **WHEN** a `nearcomplete` hint is displayed
- **THEN** the empty cells of its reserved window are outlined `COL_HINT_CELL`
- **AND** they are drawn empty inside the outline

## REMOVED Requirements

### Requirement: Hint: The named line is hatched in the color of the move

**Reason**: A hatch takes no color from a game: the engine draws it in the
stripes ink.

**Migration**: Requirement "Hint: The named line is striped".

### Requirement: Hint: A cited premise is ringed apart from the move

**Reason**: The premise took a color of the game's own; it is now an outline
in the outline ink, and the engine colors it.

**Migration**: Requirement "Hint: A cited premise is outlined apart from the
move".

### Requirement: Hint: Unruly uses a single premise ring color

**Reason**: No game picks a premise color any more, so there is no
per-kind color to decline.

**Migration**: None.
