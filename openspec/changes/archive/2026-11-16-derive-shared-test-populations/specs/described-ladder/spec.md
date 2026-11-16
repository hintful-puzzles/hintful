## ADDED Requirements

### Requirement: Each checked statement's planted defect sits beside its description

Each technique a description or library states, and each dead-end claim, SHALL have its planted defect in the `<name>.plants.yaml` beside its description, keyed by the id the description states, and the soundness checks SHALL read the defects from there. The gate SHALL fail a description with a statement that has no planted defect, a planted defect that names no statement, or one that does not parse.

#### Scenario: A new technique without a plant fails in the gate

- **WHEN** a description gains a technique and its plants file does not
- **THEN** `plants.test.ts` fails, naming the description

#### Scenario: A new game starts with the skeleton's plants

- **WHEN** `scripts/new-game.sh` copies a skeleton
- **THEN** the copy has the skeleton's plants under its own name, one for each technique its description states
