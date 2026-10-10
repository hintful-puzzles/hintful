## ADDED Requirements

### Requirement: Signpost generates solver-gated boards

At Easy the clues `newDesc` leaves SHALL be enough for the solver to solve the
board.

#### Scenario: A number the solver needs stays given

- **WHEN** `newDesc` strips an Easy board, and taking a number out leaves a
  board the solver does not finish
- **THEN** that number stays given

## REMOVED Requirements

### Requirement: Signpost generates solver-gated boards reproducibly

**Reason**: Restated as "Signpost generates solver-gated boards". Retitled without "reproducibly", and the first clause and the only scenario
go: both are `engine-difficulty`, "A generator's board depends only on its
params and its random state". Nothing cites the title
(`node scripts/checks/spec-citations.mjs --list`). The scenario that replaces
it is the Easy gate, read in `newGameStrip` of
`src/games/signpost/generator.ts`: numbers are made given until `solveState`
solves, then taken out again only while it still does.
