## ADDED Requirements

### Requirement: A drag game's press arm goes through the engine's verbs

A drag game's own press arm SHALL park the cursor through the engine's
`pressTarget`, and the release of a drag that never left its target SHALL apply
the verb the engine's `buttonVerb` names for the button, so the arm names
neither the cursor's handling nor which verb a button applies.

#### Scenario: A drag is released where it was pressed

- **WHEN** a drag game's target is pressed and released without the pointer
  leaving it
- **THEN** the move is the one `buttonVerb` names for that button

## REMOVED Requirements

### Requirement: A game claiming an unactionable code is on an exact ledger

**Reason**: process: `docs/games/testing.md` § "How a cross-game guard finds
its population", rule 3, states it for every cross-game guard: the exceptions
are a ledger in the guard, one entry a member with its reason, asserted equal
to what the derivation found, so an entry cannot outlive what it excuses.
`CLAIMS_UNACTIONABLE` in `src/engine/input-parity.test.ts` is that ledger and
is empty. That a ledger excuses a claimant stays in the scenario "A game
answering a meaningless code is caught" of "A game declines a button it did not
act on".

### Requirement: The engine answers which character is a digit, once

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: A game reads and writes a digit character through the engine

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: The meaning of a digit character stays with the game

**Reason**: Moved to `engine-helpers`, with its words.
