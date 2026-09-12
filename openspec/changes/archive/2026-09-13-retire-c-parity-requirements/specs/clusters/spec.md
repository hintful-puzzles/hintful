## MODIFIED Requirements

### Requirement: Clusters ports the contradiction solver and solver-gated generator

Clusters SHALL provide a solver that classifies a board as complete, unfinished
or invalid and marks the cells that break a rule. The solver SHALL fill forced
cells by contradiction — tentatively setting each color in an empty cell and
taking the other color when one makes the board invalid — and SHALL apply one
level of hypothetical lookahead when asked for it. Those two rungs are the two
difficulty tiers.

The generator SHALL use the solver to keep every board uniquely solvable: it
SHALL two-color the grid at random, flip isolated cells until none remains,
reduce the board to dot clues, prune adjacent equal dots, and retry until the
solver completes the board at the requested tier and, above the easiest tier, the
tier below cannot. Generation from a given seed SHALL be reproducible. The retry
loop SHALL be bounded, so that a parameter set admitting no board fails rather
than spinning.

Rejecting a candidate the generator has *completed* SHALL perturb the grid before
retrying. The retry loop deliberately carries deduced cells between attempts and
re-randomizes only blank ones, so a completed grid would otherwise re-derive
itself, draw no randomness, and never terminate. The perturbation SHOULD be small
rather than a reset: the loop is a hill-climb, and discarding it costs several
times the generation time it saves nothing of.

#### Scenario: The solver completes a uniquely solvable board

- **WHEN** a generated board is solved
- **THEN** the solver fills every blank cell to the unique solution and reports
  the board complete

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: A parameter set with no board gives up rather than hanging

- **WHEN** generation is asked for a board that cannot exist at the requested
  tier
- **THEN** the generator exhausts a finite retry budget and reports failure
