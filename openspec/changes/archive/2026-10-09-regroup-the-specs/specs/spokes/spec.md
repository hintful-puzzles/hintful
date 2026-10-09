## MODIFIED Requirements

### Requirement: Spokes' difficulty tiers bind the boards they generate

A Spokes board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Normal
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does reach one

## REMOVED Requirements

### Requirement: Spokes refuses to hint from a position it cannot vouch for

**Reason**: collection: `engine-hints` "The midend SHALL refuse a hint on a
finished or wrong board before asking the game" refuses the solved board and
the wrong one before Spokes' `hint` is asked, and its scenario "Asking for a
hint on a board with a mistake highlights it" is this requirement's only
scenario. It covers Spokes with no departure: `hint` in
`src/games/spokes/index.ts` writes neither refusal, and `spokes-hint.test.ts`
files both under "boards the midend refuses a hint on". The two clauses that
look like the game's own are not. A board that breaks a rule the game marks (a
hub over its number, a hub cut off) holds a line the solution forbids or a mark
where it needs a line, which is what "Spokes' findMistakes compares the board
with its one solution" flags, so it is the wrong-board refusal again; and for
the same reason no step can follow from a player's mistake. The refusal when no
deduction applies is stated by "Spokes' hint stops at bounded reasoning"
("SHALL refuse with a message saying no further move can be deduced").
