## MODIFIED Requirements

### Requirement: A rejecting generation gate is measured before it is adopted

A generation gate that rejects boards SHALL be adopted only after measuring
that its rejection rate does not make a size or difficulty tier unfillable or
materially slow "New Game". A game that redefines "solvable" as "narratably
solvable" SHALL have its tiers re-graded afterward, since that can shift a
tier's character. A gate SHALL NOT be refused for changing which boards the
game generates.

#### Scenario: A costly rejection gate is measured before adoption

- **WHEN** a game would adopt a generation gate that rejects non-narratable
  boards
- **THEN** its rejection rate and difficulty-tier grades are measured first
- **AND** if rejection would thin a size/tier or materially slow generation,
  the game narrates the deduction honestly instead of rejecting

### Requirement: No parameter or tier switches a generator's checks off

No game SHALL offer a parameter or a tier that switches its generator's checks
off: a board that needs trial and error SHALL be dealt only at a tier named
Unreasonable, and every board dealt SHALL have one solution.

#### Scenario: A game ID upstream wrote with its checks on

- **WHEN** a desc in `src/guards/__fixtures__/upstream-descs.json` is loaded
  under the params string it is listed under
- **THEN** the params pass as a written board's do and the desc loads; the
  corpus holds no board upstream's own solver found several answers on
