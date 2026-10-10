## ADDED Requirements

### Requirement: Tents generates solver-gated boards

`newDesc` SHALL place `w*h/5` tents, rounded down, no two of them adjacent
even diagonally, and a tree beside each in a one-to-one matching; reject any
layout with a row or column that holds neither a tree nor a tent; and accept
only when the solver succeeds at the target difficulty and fails to converge
one level below.

#### Scenario: A layout with an empty column is thrown away

- **WHEN** a layout places every tent and tree and leaves one column with
  neither
- **THEN** it is thrown away before the solver is asked, and another layout
  is drawn

## REMOVED Requirements

### Requirement: Tents generates solver-gated boards reproducibly

**Reason**: Restated as "Tents generates solver-gated boards". Retitled without "reproducibly", and the first sentence and the only scenario
go: both are `engine-difficulty`, "A generator's board depends only on its
params and its random state". Nothing cites the title. The scenario that
replaces it is the empty-line rejection, read in `src/games/tents/generator.ts`
(`if (filled.includes(0)) continue;`, ahead of the solver).
