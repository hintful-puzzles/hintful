## ADDED Requirements

### Requirement: A params string is read whole or refused

Every game's `decodeParams` SHALL read every character of a params string or
refuse the string. A letter after a tag that the tag does not list, a tag
with nothing after it, and any character no piece of the game's grammar reads
where it stands SHALL each be refused, and none SHALL be read as a default or
passed over. A piece left out SHALL still take its default.

#### Scenario: A difficulty letter the game does not have

- **WHEN** `8x8dq` is decoded by a game whose tiers are `e` and `t`
- **THEN** it is refused, and no board at the default tier opens

#### Scenario: A tag with nothing after it

- **WHEN** `8x8d` is decoded by a game with a tagged difficulty
- **THEN** it is refused

#### Scenario: A letter out of the order the grammar reads

- **WHEN** a game that reads `u` before its difficulty decodes `8x8deu`
- **THEN** it is refused, where `8x8ude` is read

#### Scenario: A piece left out

- **WHEN** `8x8` is decoded by a game with a tagged difficulty
- **THEN** it is read, at the tier the game's spec gives a string with no `d`

### Requirement: The engine makes the one refusal of a params string

The refusal SHALL be the engine's, thrown as `UnreadableParams` by
`unreadParams` in `engine/params.ts`, and a game SHALL refuse through it,
through `paramsLetter` for a tag's letter and through `endParams` for a
remainder, and SHALL NOT word its own. Its message SHALL be one sentence that
quotes the params string, and the character where there is one, and the midend
SHALL show it as it comes for a game ID and for `setParams`.

#### Scenario: The sentence a player reads

- **WHEN** a player enters the game ID `8x8dq:…` in a game with no `q` tier
- **THEN** the dialog says `The parameters 8x8dq have a "q" where this puzzle
  reads none.`

#### Scenario: A string that ends at a tag

- **WHEN** a player enters a game ID whose params are `8x8d`
- **THEN** the dialog says `The parameters 8x8d stop where this puzzle reads
  another character.`

### Requirement: A letter upstream writes is read by name

A letter upstream's `encode_params` writes for a setting this app has no field
for SHALL be read by name, change nothing and never be written, so that a game
ID upstream wrote opens: `unusedLetter` in a declared codec, an arm of its own
in a hand-written one. A float SHALL be read by `parseLeadingFloat`, exponent
included, since `%g` writes `1e-05`.

#### Scenario: A board upstream dealt unchecked

- **WHEN** Pearl decodes `6x6den`, whose `n` asks upstream for an unchecked
  board
- **THEN** it is read as a 6×6 Easy board, and encoded back as `6x6de`

#### Scenario: A probability below 1e-4

- **WHEN** Net decodes `5x5b1e-05`
- **THEN** the barrier probability is 0.00001, not 1

### Requirement: A guard holds every game to reading its params whole

A cross-game test SHALL take each registered game's own encodings from the
derived params corpus and SHALL assert that a character no game's grammar
reads, appended, inserted at every index and written over every character, is
refused with the engine's refusal. It SHALL also assert that a recorded set of
strings upstream's encoder writes, for every registered game, is read. It
SHALL fail a game with too few encodings to try.

#### Scenario: A decoder that skips what it does not know

- **WHEN** a game's decoder passes over a character it has no arm for
- **THEN** the guard fails, naming the game and the strings it read

#### Scenario: A game with no upstream strings recorded

- **WHEN** a registered game has no recorded upstream strings
- **THEN** the guard fails, naming the game

## MODIFIED Requirements

### Requirement: The codec grammar is a prefix, tagged segments, flags and letters

The grammar of a declared codec SHALL be a `dims` prefix (`WxH`, with the
square fallback when decoding) or a `size` (one untagged leading integer),
followed by tagged segments, `num` (`n12`) and `choice` (a tag plus one letter
from a table), bare `flag` letters, `letters`, a choices field written as
one bare letter per choice (Salad's `L` and `B`, Seismic's `T` or nothing),
and `unusedLetter`. Segments SHALL be read in the order declared, and a
remainder SHALL be refused.

#### Scenario: A square board's params

- **WHEN** a codec with a `dims` prefix decodes `9`
- **THEN** the width and the height are both 9
- **AND** encoding those params writes `9x9`

#### Scenario: A remainder

- **WHEN** a declared codec has read its last segment and characters are left
- **THEN** the string is refused
