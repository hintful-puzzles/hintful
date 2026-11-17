## MODIFIED Requirements

### Requirement: A game's hint sentences SHALL be stated in its description

Every sentence a game's hint speaks, and every word inside one, SHALL be its
description's: a technique's `says` or a declared step's words, spoken through
the compiled module's `voice`. Sentences several games share SHALL live in the
engine's text modules. A declared step that strikes notes and states no move
SHALL close on them in the engine's strike words. Refusal messages are outside
this requirement (`src/engine/hint-refusal.ts`).

#### Scenario: Rewording a sentence

- **WHEN** a sentence's wording changes
- **THEN** the change touches the game's description, or the engine's module
  for a sentence several games share, and not the code that decides which
  sentence fires

#### Scenario: A game's own text module

- **WHEN** a game keeps sentences in a `src/games/<id>/hint-text.ts`
- **THEN** the hint-text convention guard fails

#### Scenario: A step that strikes notes

- **WHEN** a declared step is given the notes it strikes and its clauses
  state no move
- **THEN** it closes on them as a firing's strike does ("the 3 must go"),
  saying where they are unless a reference it says names their squares
  alone, and "too" on a later leg
