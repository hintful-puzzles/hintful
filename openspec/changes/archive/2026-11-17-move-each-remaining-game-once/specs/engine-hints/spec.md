## ADDED Requirements

### Requirement: A game's hint sentences SHALL be stated in its description

Every sentence a game's hint speaks, and every word inside one, SHALL be its
description's: a technique's `says` or a declared step's words, spoken through
the compiled module's `voice`. Sentences several games share SHALL live in the
engine's text modules. Until a clause can reference struck notes, a game MAY
build a strike's closing from a reference. Refusal messages are outside this
requirement (`src/engine/hint-refusal.ts`).

#### Scenario: Rewording a sentence

- **WHEN** a sentence's wording changes
- **THEN** the change touches the game's description, or the engine's module
  for a sentence several games share, and not the code that decides which
  sentence fires

#### Scenario: A game's own text module

- **WHEN** a game keeps sentences in a `src/games/<id>/hint-text.ts`
- **THEN** the hint-text convention guard fails

## MODIFIED Requirements

### Requirement: A game's narration chooses the sentence and passes values

A game's narration SHALL decide only which sentence a step speaks and with what
values. It SHALL pass values as the board means them (counts, axes, directions,
the deduction's own record) and never words, and the description's words SHALL
NOT read the board.

#### Scenario: A sentence needs a plural

- **WHEN** a sentence reads differently for one square and for several
- **THEN** the narration passes the count, and the description's wording
  chooses the word

## REMOVED Requirements

### Requirement: A game's hint sentences SHALL live in one text module per game

**Reason**: No game keeps a `hint-text.ts` now. Each game's sentences are its
description's `says` and `steps`, compiled and spoken through its `voice`.

**Migration**: Write a sentence as a technique's `says` or a declared step in
the game's description (`docs/descriptions.md`), not in a text module.
