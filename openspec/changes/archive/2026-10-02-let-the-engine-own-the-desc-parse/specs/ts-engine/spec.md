## MODIFIED Requirements

### Requirement: A game ID that will not load says why in the collection's words

The engine's verdict on a description (`validateDesc(game, p, desc)`, derived from the game's own parse) SHALL be a description error made by the engine's
description-error module: a kind (too short, too long, a number out of range, a
value repeated, clues that contradict each other, a layout this puzzle's IDs do
not have, or a character that cannot appear, naming it where the parser has it),
or a sentence about the puzzle's own rules passed through the module's named
escape. Its type SHALL admit no other string.

A sentence passed through the escape SHALL be used by one game only, since a
reason two games give is a situation the collection has and SHALL be a kind; it
SHALL not repeat a kind's words; and it SHALL be one sentence about "this game
ID". These SHALL be asserted by reading every call of the escape by its shape,
in the games and the engine alike.

`validateDesc` SHALL refuse a malformed description by returning, never by
throwing.

#### Scenario: A truncated ID says it may have been cut off

- **WHEN** a player enters a game ID whose description ends early, in any game
- **THEN** the dialog says the ID is too short for its board and may have been
  cut off when it was copied

#### Scenario: A bad character is named

- **WHEN** a description contains a character its game never writes
- **THEN** the message names that character

#### Scenario: A reason two games share becomes a kind

- **WHEN** two games pass the same sentence to the escape
- **THEN** the guard fails, naming the sentence and both games

#### Scenario: Garbage is refused, not thrown

- **WHEN** any game's `validateDesc` is given an empty string, punctuation, or
  an overlong run of one character
- **THEN** it returns without throwing, and refuses at least one of them

### Requirement: A game reads its description once

Every game SHALL read its description with one parser returning a
`DescParse` (`engine/desc-error.ts`), and `newState` SHALL build from that
parse's value through `descValue`. A game SHALL declare no validator: the
engine SHALL derive the verdict from `newState` itself (`loadDesc`), taking
the refusal `descValue` raises for a failed parse as the verdict and letting
any other throw propagate as a bug, so the verdict and the board are one
reading. The midend SHALL build state 0 from the same load that judged a
pasted or saved description. A check that needs the parsed board (a count, a
region, a rule of the puzzle's own) SHALL run inside that parse. A parser
SHALL accept what the game's own encoder writes and SHALL refuse what the
grammar has no place for, rather than skip it.

The engine SHALL provide a cursor over a description (`engine/desc-reader.ts`)
whose reads fail with the collection's `DescError` kinds: a character or
number missing because the description ended is too short, one with another
character in its place names that character, a number outside the bounds its
caller states is out of range, and text after the board is too long. The
cursor SHALL offer no way to read a number without bounds.

#### Scenario: A description the generator wrote

- **WHEN** a game's own generator writes a description for any preset the
  near-miss test reaches
- **THEN** `validateDesc` accepts it

#### Scenario: A description that ends early

- **WHEN** a description ends where the cursor expected a separator or a
  number
- **THEN** the parse fails as too short, never as a bad character or as
  malformed

#### Scenario: A number too large for its board

- **WHEN** a description gives a number larger than its caller's bound,
  however many digits it has
- **THEN** the parse fails as out of range, rather than storing a value a
  typed array wraps

#### Scenario: A save whose board no longer loads

- **WHEN** a player restores a save whose description the game's parser now
  refuses
- **THEN** the save is refused with the parse's reason, and nothing throws

## REMOVED Requirements

### Requirement: A pasted game ID is refused or played, never thrown

**Reason**: Its scenario "A validator looser than its parser" described a
game's validator and its `newState` disagreeing, and a game no longer writes a
validator: the verdict is `newState`'s own parse.

**Migration**: "A pasted game ID is refused or opened, never thrown" below
carries the surviving scenarios.

## ADDED Requirements

### Requirement: A pasted game ID is refused or opened, never thrown

Every game SHALL answer a description a player enters with a refusal or a
board that builds and draws; neither loading the description nor the first
`redraw` SHALL throw. This is held by a cross-game test over two populations:
descriptions no generator writes, and near misses made by breaking each game's
real descriptions with one edit (truncated, a character dropped, doubled, or
replaced by a neighbor). The near misses come from one board per value of each
preset axis, generated from a fixed seed, so a failure names the same game ID
every run.

The test can see only a `newState` or `redraw` that throws something other than
a refusal. It SHALL say so where it is defined, with the measured split of
games for which that holds, so that a green run is not read as proof that a
parser refuses what it does not recognize.

#### Scenario: A parse that accepts what its board cannot hold

- **WHEN** a game's parse accepts a near miss and its `newState` or first
  `redraw` then throws
- **THEN** the test fails, naming the game ID that threw

#### Scenario: A mutator that stopped producing near misses

- **WHEN** the mutants reaching `newState` across the collection fall below
  the floor the test states
- **THEN** the test fails rather than passing over nothing

#### Scenario: Junk is refused by every game

- **WHEN** a game is given each of the malformed descriptions
- **THEN** it refuses at least one of them and throws on none
