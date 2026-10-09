## ADDED Requirements

### Requirement: Group's solver accepts only an associative grid and grades a board at its tier

The solver SHALL accept a completed grid only if it is associative. A board
dealt at a difficulty SHALL be solvable at that tier and not at the tier below.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

## REMOVED Requirements

### Requirement: Group's solver has five tiers and no technique beyond them

**Reason**: Reworded in `group` as "Group's solver accepts only an associative
grid and grades a board at its tier". port: the three techniques it forbids are
the TODO list at the head of upstream's `unfinished/group.c`, and the port's
own design recorded them as "a future strengthening change, not a port gap".
Nothing was turned down, and upstream is not tracked, so the prohibition binds
nothing and would stop a session adding a technique a hint could teach. What
stays is the validator and the promise the scenario made, now in the body:
`generator.ts` rejects a board the tier below solves.
