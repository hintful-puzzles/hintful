## MODIFIED Requirements

### Requirement: Bridges findMistakes reports every span the unique solution contradicts

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: it SHALL solve the board again from its island clues and
return every span whose player marks that solution contradicts: a bridge where
the solution has none, a count exceeding the solution's, or a limit below the
solution's count, the cross included. It SHALL also return every island marked
complete short of its count. A board that is not uniquely solvable SHALL yield
no mistakes.

#### Scenario: A wrong bridge is flagged

- **WHEN** the player places a bridge the unique solution does not contain,
  without yet over-committing an island
- **THEN** `findMistakes` includes that bridge and Check & Save refuses to save

#### Scenario: An island marked complete too soon

- **WHEN** an island is marked complete while it has fewer bridges than its
  count
- **THEN** `findMistakes` returns that island, and the same mark on the island
  once its bridges are all drawn returns nothing

## REMOVED Requirements

### Requirement: Bridges explains the next deduction

**Reason**: Its second scenario has an island marked complete too soon pass
`findMistakes` and be refused with no island named. That mark is now a
mistake, and the island lights up.

**Migration**: "Bridges explains each forced deduction" keeps the plan and its
first scenario; "Bridges findMistakes reports every span the unique solution
contradicts" holds the mark.

## ADDED Requirements

### Requirement: Bridges explains each forced deduction

`hint(state)` SHALL return the forced deductions from the player's own marks as
an ordered plan, each step narrating why its moves are forced from premises the
sentence itself states. Where the deduction contradicts itself on a board
`findMistakes` finds nothing wrong with, it SHALL refuse with the collection's
unlocalized-contradiction wording.

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors
