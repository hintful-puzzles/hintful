## MODIFIED Requirements

### Requirement: Upstream's C is a readable reference, not a byte-oracle

Upstream's C source, readable in git history and in a sibling clone, SHALL be
treated as a readable reference for the logic it encodes, NOT as a fidelity
oracle. A game is "done" when it plays correctly and passes ordinary
behavioral tests, NOT when it reproduces upstream's output, and no game's
generator, solver, description or rendering SHALL be required to match
upstream's byte-for-byte. The project SHALL NOT track upstream or merge from
it.

#### Scenario: A ported game is accepted without a golden corpus

- **WHEN** a game has been ported to TS and plays correctly under manual and
  automated behavioral tests
- **THEN** it is accepted as done
- **AND** no byte-identical characterization corpus is required for acceptance

#### Scenario: Deliberate divergence from upstream is allowed

- **WHEN** a feature is added that upstream does not have (quick-save,
  mistake-check, explained hint, a per-game gameplay aid such as Galaxies
  cell↔dot marking)
- **THEN** the divergence is expected and acceptable
- **AND** it is NOT treated as a fidelity regression

#### Scenario: A generator deals other boards than upstream's

- **WHEN** a change makes a game's generator, or a solver it gates on, deal
  another board for a seed than upstream's did, or grade a board at another
  tier than upstream's
- **THEN** no test fails for that alone: what is held of upstream is that its
  game IDs and params strings keep loading
