## MODIFIED Requirements

### Requirement: Pegs params are a size and a board-type word

Params SHALL encode as `{w}x{h}` followed, in the full form only, by the board
type as a lowercase word: `cross`, `octagon` or `random`. Decoding SHALL read a
string with nothing after the size as a Cross board, and SHALL refuse any
other text there.

#### Scenario: The three words

- **WHEN** `5x7cross`, `7x7octagon` and `5x5random` are decoded
- **THEN** they are a 5×7 Cross, a 7×7 Octagon and a 5×5 Random board, and
  their short forms are `5x7`, `7x7` and `5x5`

#### Scenario: A string with no word

- **WHEN** `5x7` is decoded
- **THEN** the board is a Cross, and its full encoding is `5x7cross`
