## MODIFIED Requirements

### Requirement: Dominosa refuses params outside its bounds

Params with `n` below 1 SHALL be refused. `validateParams` SHALL enforce the
bound on `n` that keeps the grid's area from overflowing, and SHALL refuse in
full form a tier above Easy at `n = 1` and a tier above Normal at `n = 2`,
which no board of that size reaches.

#### Scenario: Invalid params are rejected

- **WHEN** params with `n = 0` are checked
- **THEN** they are refused with a non-null error string

#### Scenario: A tier the smallest set cannot reach is refused

- **WHEN** params with `n = 1` at Normal are checked in full form
- **THEN** `validateParams` returns a non-null error string

## REMOVED Requirements

### Requirement: The hint recorder is gated

**Reason**: collection: `engine-hints` "The solver and the hint are two
projections of one deduction engine" says it of every logic game: "The
generator runs the techniques to a fixpoint with the recorder off ... the hint
runs the same techniques with the recorder on". Dominosa has no departure: its
recorder is one private flag in `src/games/dominosa/solver.ts`, set only by the
hint's pass. What Dominosa does differently, leaving the forcing chain out of
the recording, is kept in "The forcing chain grades boards and is never
narrated".

### Requirement: A generated Dominosa board needs its tier and no more

**Reason**: collection: `engine-difficulty` "Every tier promises one solution
found at its cap" and "A difficulty tier binds the board it generates" together
say exactly this of every tiered game, at every size and not only at the
presets: one solution, found at the tier's cap, and above the easiest tier not
found one tier down. Dominosa has no departure:
`src/games/dominosa/generator.ts` rejects a board that does not solve at the
tier and one whose hardest deduction used is below it. The guard keyed on
presets is a third requirement and is not what this cut rests on.
