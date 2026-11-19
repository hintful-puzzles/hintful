## ADDED Requirements

### Requirement: The gate's fast checks run past a refusal on request

The repository SHALL provide `npm run fast-checks`, which runs the steps of
the gate's fast prefix, through the gate's own list, over what the working
tree changed, without stopping at a refusal, and ends by naming every refusal
with the command that reproduces it. It SHALL first apply the fixes that have
one right answer (biome's safe fixes to the changed files, the game specs'
subject order) and name each file it wrote. The gate itself SHALL stay
fail-fast and write nothing.

#### Scenario: A commit owes four cheap checks

- **WHEN** the working tree holds a British spelling, an unused export, an
  absence spelled `undefined` and a requirement over the validator's limit
- **THEN** one run names all four, each with its command, and exits nonzero

#### Scenario: An archive appends a requirement out of order

- **WHEN** the command runs after an archive that appended a game spec's
  requirement after a later subject
- **THEN** the spec is put in order, the file is named, and the subject check
  passes

#### Scenario: The gate meets the same refusals

- **WHEN** a commit carries those refusals
- **THEN** the gate stops at the first, as it did before the command existed

### Requirement: A requirement over the validator's limit is named

The gate SHALL name each requirement of a main spec or an open change's delta
whose text is longer than `openspec validate --strict` accepts, by its file,
line and title, since the validator names it only by its index.

#### Scenario: An archive merges a long requirement

- **WHEN** an archive merges a requirement of 535 characters into a spec
- **THEN** the gate names that spec's file, the requirement's line and its
  title
