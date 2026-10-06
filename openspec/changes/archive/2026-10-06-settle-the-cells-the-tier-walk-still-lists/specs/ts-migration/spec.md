## ADDED Requirements

### Requirement: A generator that runs out of tries is answered, not thrown

Where a generator exhausts its retry bound, the engine SHALL report it to the caller as a sentence a player can be shown, and SHALL leave the board in play, and the parameters it was dealt at, as they were.

A retry bound that runs out says that no board was found, which is an answer
about the parameters and not a fault in the program: the tier may be rare at
that size, or absent in a corner of a game's parameters that no count has
reached. A game whose parameters are a list, or several numbers at once, has
such corners with no line through them that a refusal could name. The sentence
SHALL NOT claim either cause, since the generator cannot tell them apart.

Parameter validation remains where a counted absence is reported. This
requirement covers what validation does not name. Any other error a generator
throws SHALL propagate.

The app SHALL show the sentence wherever a deal was asked for. Where no board is
in play to keep, it SHALL deal the game's first preset.

#### Scenario: A deal that finds no board keeps the one in play

- **WHEN** a type is chosen whose generator exhausts its retry bound
- **THEN** the player is shown a sentence saying no puzzle of that type was found
- **AND** the board that was on screen is still in play
- **AND** the type shown as chosen is that board's

#### Scenario: A seed that finds no board is refused like any other id

- **WHEN** a game ID carrying a seed is loaded and its generator exhausts its
  retry bound
- **THEN** loading returns the same sentence, as it returns any other refusal

#### Scenario: A fault is not mistaken for an answer

- **WHEN** a generator throws anything other than its exhausted retry bound
- **THEN** the error propagates to the caller
